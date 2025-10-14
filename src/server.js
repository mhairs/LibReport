// src/server.js
const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env'), override: true });

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const crypto = require('node:crypto');
const validator = require('validator');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) { console.error('Missing MONGO_URI in .env'); process.exit(1); }
const dbName = process.env.DB_NAME || 'libreport';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const isProd = process.env.NODE_ENV === 'production';

const client = new MongoClient(uri);
let db;

// helpers
function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

async function ensureIndexes() {
  await db.collection('users').createIndexes([
    { key: { email: 1 }, name: 'users_email_unique', unique: true, partialFilterExpression: { email: { $exists: true } } },
    { key: { barcode: 1 }, name: 'users_barcode_unique', unique: true, partialFilterExpression: { barcode: { $exists: true } } }
  ]);
  await db.collection('books').createIndexes([
    { key: { title: 'text', author: 'text' }, name: 'books_text' }
  ]);
  await db.collection('loans').createIndexes([
    { key: { userId: 1, returnedAt: 1 }, name: 'loans_user_returned' },
    { key: { dueAt: 1 }, name: 'loans_due' },
    { key: { bookId: 1 }, name: 'loans_book' }
  ]);
  await db.collection('visits').createIndexes([
    { key: { barcode: 1, enteredAt: -1 }, name: 'visits_barcode_time' },
    { key: { userId: 1, enteredAt: -1 }, name: 'visits_user_time' }
  ]);
  await db.collection('password_resets').createIndexes([
    { key: { userId: 1, expiresAt: 1 }, name: 'resets_user_exp' }
  ]);
}

async function start() {
  await client.connect();
  db = client.db(dbName);
  await ensureIndexes();

  const app = express();

  // middleware
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(express.static('public')); // optional dashboard static files

  // simple global rate limit
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));

  // --- Health
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // --- AUTH ---

  // POST /auth/signup  {name,email,password,role?}
  app.post('/auth/signup', async (req, res) => {
    const { name, email, password, role = 'student', barcode } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password are required' });
    if (!validator.isEmail(email)) return res.status(400).json({ error: 'invalid email' });
    if (String(password).length < 8) return res.status(400).json({ error: 'password must be at least 8 chars' });

    const exists = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'email already in use' });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = {
      name,
      email: email.toLowerCase(),
      role,
      passwordHash,
      ...(barcode ? { barcode } : {})
    };
    const { insertedId } = await db.collection('users').insertOne(user);
    user._id = insertedId;

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: String(insertedId), name: user.name, email: user.email, role: user.role, barcode: user.barcode }
    });
  });

  // POST /auth/login  {email,password}
  app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await db.collection('users').findOne({ email: String(email).toLowerCase() });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = signToken(user);
    res.json({
      token,
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role, barcode: user.barcode }
    });
  });

  // POST /auth/forgot  {email}
  // Always responds 200 to avoid user enumeration.
  app.post('/auth/forgot', async (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.json({ ok: true });

    const user = await db.collection('users').findOne({ email: String(email).toLowerCase() });
    if (user) {
      // create reset token
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const reset = {
        userId: String(user._id),
        tokenHash,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        used: false
      };
      await db.collection('password_resets').insertOne(reset);

      const resetUrl = `${APP_URL}/reset-password?uid=${encodeURIComponent(reset.userId)}&token=${token}`;
      if (!isProd) console.log('🔐 Password reset URL:', resetUrl);
      // In production you’d email resetUrl. For dev we return it to help you test:
      if (!isProd) return res.json({ ok: true, resetUrl });
    }
    res.json({ ok: true });
  });

  // POST /auth/reset  {uid, token, newPassword}
  app.post('/auth/reset', async (req, res) => {
    const { uid, token, newPassword } = req.body || {};
    if (!uid || !token || !newPassword) return res.status(400).json({ error: 'uid, token, newPassword required' });
    if (String(newPassword).length < 8) return res.status(400).json({ error: 'password must be at least 8 chars' });

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const reset = await db.collection('password_resets').findOne({
      userId: String(uid),
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    });
    if (!reset) return res.status(400).json({ error: 'invalid or expired token' });

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await db.collection('users').updateOne({ _id: db.collection('users').s.pkFactory.createFromHexString(uid) }, { $set: { passwordHash } })
      .catch(async () => { // if _id is not ObjectId (string ids), fall back to string match
        await db.collection('users').updateOne({ _id: uid }, { $set: { passwordHash } });
      });

    await db.collection('password_resets').updateOne({ _id: reset._id }, { $set: { used: true, usedAt: new Date() } });
    // Optional: revoke any other outstanding tokens for this user
    await db.collection('password_resets').updateMany({ userId: String(uid), used: false }, { $set: { used: true, usedAt: new Date() } });

    res.json({ ok: true });
  });

  // Example of a protected route
  app.get('/me', authRequired, async (req, res) => {
    const user = await db.collection('users').findOne({ _id: req.user.sub });
    res.json({ id: req.user.sub, name: user?.name, role: user?.role, email: user?.email, barcode: user?.barcode });
  });

  // --- VISIT: enter-only via barcode (from earlier)
  app.post('/visit/enter', async (req, res) => {
    const { barcode, branch = 'Main' } = req.body || {};
    if (!barcode) return res.status(400).json({ error: 'barcode required' });
    const user = await db.collection('users').findOne({ barcode });
    if (!user) return res.status(404).json({ error: 'unknown barcode' });

    const now = new Date();
    const dupe = await db.collection('visits').findOne({
      barcode, enteredAt: { $gt: new Date(now.getTime() - 2 * 60 * 1000) }
    });
    if (!dupe) {
      await db.collection('visits').insertOne({ userId: user._id, barcode, branch, enteredAt: now });
    }
    res.json({ ok: true, user: { id: user._id, name: user.name }, enteredAt: (dupe?.enteredAt || now), deduped: !!dupe });
  });

  // --- Reports you already had (top-books, overdue, hours, browse, borrowed) ---
  app.get('/reports/top-books', async (_req, res) => {
    const data = await db.collection('loans').aggregate([
      { $group: { _id: '$bookId', borrows: { $sum: 1 } } },
      { $sort: { borrows: -1 } }, { $limit: 10 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { _id: 0, bookId: '$_id', title: '$book.title', author: '$book.author', borrows: 1 } }
    ]).toArray();
    res.json({ items: data });
  });

  app.get('/student/:id/borrowed', async (req, res) => {
    const items = await db.collection('loans').aggregate([
      { $match: { userId: req.params.id, returnedAt: null } },
      { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { _id: 0, title: '$book.title', author: '$book.author', borrowedAt: 1, dueAt: 1 } }
    ]).toArray();
    res.json({ items });
  });

  app.get('/browse', async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ items: [] });
    const items = await db.collection('books')
      .find({ $text: { $search: q } }, { projection: { score: { $meta: 'textScore' }, title: 1, author: 1, availableCopies: 1 } })
      .sort({ score: { $meta: 'textScore' } }).limit(50).toArray();
    res.json({ q, items });
  });

  app.get('/hours', async (req, res) => {
    const branch = req.query.branch || 'Main';
    const items = await db.collection('hours').find({ branch }).sort({ dayOfWeek: 1 }).toArray();
    res.json({ branch, items });
  });

  app.get('/reports/overdue', async (_req, res) => {
    const items = await db.collection('loans').aggregate([
      { $match: { returnedAt: null, dueAt: { $lt: new Date() } } },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'book' } },
      { $unwind: '$user' }, { $unwind: '$book' },
      { $project: { _id: 0, user: '$user.name', title: '$book.title', dueAt: 1, borrowedAt: 1 } }
    ]).toArray();
    res.json({ items });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ API listening on ${APP_URL.replace(/\/$/,'') || 'http://localhost:3000'}`));
}

start().catch(err => { console.error('Server failed:', err); process.exit(1); });
