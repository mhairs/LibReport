// src/server.js
const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env'), override: true });

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) { console.error('Missing MONGO_URI in .env'); process.exit(1); }
const dbName = process.env.DB_NAME || 'libreport';

const client = new MongoClient(uri);
let db;

async function start() {
  await client.connect();
  db = client.db(dbName);

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // --- Health
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // --- VISIT: enter-only via barcode
  // POST /visit/enter  { barcode: "S000001", branch?: "Main" }
  app.post('/visit/enter', async (req, res) => {
    const { barcode, branch = 'Main' } = req.body || {};
    if (!barcode) return res.status(400).json({ error: 'barcode required' });

    const user = await db.collection('users').findOne({ barcode });
    if (!user) return res.status(404).json({ error: 'unknown barcode' });

    // suppress dupes within last 2 minutes
    const now = new Date();
    const dupe = await db.collection('visits').findOne({
      barcode,
      enteredAt: { $gt: new Date(now.getTime() - 2 * 60 * 1000) }
    });

    if (!dupe) {
      await db.collection('visits').insertOne({
        userId: user._id, barcode, branch, enteredAt: now
      });
    }

    res.json({ ok: true, user: { id: user._id, name: user.name }, enteredAt: (dupe?.enteredAt || now), deduped: !!dupe });
  });

  // --- Reports / tiles ---

  // Top borrowed books
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

  // Books borrowed by a student (active loans)
  app.get('/student/:id/borrowed', async (req, res) => {
    const items = await db.collection('loans').aggregate([
      { $match: { userId: req.params.id, returnedAt: null } },
      { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { _id: 0, title: '$book.title', author: '$book.author', borrowedAt: 1, dueAt: 1 } }
    ]).toArray();
    res.json({ items });
  });

  // Browse library (text search over books)
  app.get('/browse', async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ items: [] });
    const items = await db.collection('books')
      .find({ $text: { $search: q } }, { projection: { score: { $meta: 'textScore' }, title: 1, author: 1, availableCopies: 1 } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(50)
      .toArray();
    res.json({ q, items });
  });

  // Library hours
  app.get('/hours', async (req, res) => {
    const branch = req.query.branch || 'Main';
    const items = await db.collection('hours').find({ branch }).sort({ dayOfWeek: 1 }).toArray();
    res.json({ branch, items });
  });

  // Overdue books
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
  app.listen(PORT, () => console.log(`✅ API listening on http://localhost:${PORT}`));
}

start().catch(err => { console.error('Server failed:', err); process.exit(1); });
