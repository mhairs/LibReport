const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: false });
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('node:crypto');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- DB connect
const { resolveMongoConfig } = require('./db/uri');
const { uri: MONGO_URI, dbName: DB_NAME } = resolveMongoConfig();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
if (!MONGO_URI) {
  console.error('Missing MONGO_URI (or MONGODB_URI) in environment');
  process.exit(1);
}
(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    console.log(`MongoDB connected to database "${DB_NAME}"`);
  } catch (err) {
    const code = err && (err.code || err.codeName || err.name);
    console.error('Failed to connect to MongoDB:', code ? `${code}: ${err.message}` : err.message);
    console.error('Tip: If using Atlas/Compass, ensure your password is URL-encoded and add authSource=admin if needed.');
    process.exit(1);
  }
})();

// --- User model
const userSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        // Accept either dashed format 03-2324-032246 or digits-only (4-12)
        validator: v => (/^\d{2}-\d{4}-\d{6}$/.test(v)) || (/^\d{4,12}$/.test(v)),
        message: 'Student ID must be digits (4-12) or 00-0000-000000'
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: v => validator.isEmail(v), // contains '@' and valid format
        message: 'Email must be a valid address'
      }
    },
    // Some existing collections may expect a `name` field; keep both.
    name: { type: String, trim: true },
    fullName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        // Allow letters, spaces, periods, apostrophes, and hyphens
        validator: v => /^[A-Za-z .'-]+$/.test(v),
        message: "Full name may contain letters, spaces, apostrophes, hyphens, and periods only"
      }
    },
    barcode: { type: String, trim: true, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin','librarian','faculty','student','viewer'], default: 'student' },
    status: { type: String, enum: ['active','disabled','pending'], default: 'active' }
  },
  { timestamps: true }
);

// Field-level unique indexes are already defined on email and studentId.
// Avoid duplicating them with schema.index() to prevent Mongoose warnings.

const User = mongoose.model('User', userSchema);

// --- Additional models ---
const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    totalCopies: { type: Number, default: 1, min: 0 },
    availableCopies: { type: Number, default: 1, min: 0 }
  },
  { timestamps: true }
);
bookSchema.index({ title: 'text', author: 'text' });
const Book = mongoose.model('Book', bookSchema);

const loanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowedAt: { type: Date, default: () => new Date() },
    dueAt: { type: Date, required: true },
    returnedAt: { type: Date, default: null }
  },
  { timestamps: true }
);
loanSchema.index({ userId: 1, returnedAt: 1 });
loanSchema.index({ bookId: 1, returnedAt: 1 });
loanSchema.index({ dueAt: 1 });
const Loan = mongoose.model('Loan', loanSchema);

const visitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentId: { type: String, trim: true },
    barcode: { type: String, trim: true },
    branch: { type: String, trim: true, default: 'Main' },
    enteredAt: { type: Date, default: () => new Date() }
  },
  { timestamps: true }
);
visitSchema.index({ studentId: 1, enteredAt: -1 });
visitSchema.index({ barcode: 1, enteredAt: -1 });
visitSchema.index({ userId: 1, enteredAt: -1 });
const Visit = mongoose.model('Visit', visitSchema);

const hoursSchema = new mongoose.Schema(
  {
    branch: { type: String, required: true, trim: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0=Sun
    open: { type: String, required: true }, // HH:mm
    close: { type: String, required: true }
  },
  { timestamps: true }
);
hoursSchema.index({ branch: 1, dayOfWeek: 1 }, { unique: true });
const Hours = mongoose.model('Hours', hoursSchema);

// Password reset tokens
const passwordResetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    usedAt: { type: Date, default: null }
  },
  { timestamps: false }
);
passwordResetSchema.index({ userId: 1, expiresAt: 1, used: 1 });
const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

// Admin invite/keys to elevate role on signup
const adminKeySchema = new mongoose.Schema(
  {
    codeHash: { type: String, required: true, unique: true },
    label: { type: String, trim: true },
    maxUses: { type: Number, default: 1, min: 1 },
    uses: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);
adminKeySchema.index({ active: 1, expiresAt: 1 });
const AdminKey = mongoose.model('AdminKey', adminKeySchema);

// Separate Admin collection for admin-only authentication
const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ['active','disabled'], default: 'active' }
  },
  { timestamps: true }
);
const Admin = mongoose.model('Admin', adminSchema);

// --- Health
app.get('/api/health', async (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  return res.status(dbReady ? 200 : 500).json({ ok: dbReady, time: new Date().toISOString() });
});

// API root index for human checks
app.get(['/api', '/api/'], (_req, res) => {
  res.json({
    ok: true,
    name: 'LibReport API',
    health: '/api/health',
    auth: {
      signup: { method: 'POST', path: '/api/auth/signup' },
      login: { method: 'POST', path: '/api/auth/login' }
    },
    time: new Date().toISOString()
  });
});

// Friendly hints for common mistaken GET requests to POST-only endpoints
app.get('/api/auth/signup', (_req, res) => {
  res.status(405).json({ error: 'Method Not Allowed. Use POST /api/auth/signup' });
});
app.get('/api/auth/login', (_req, res) => {
  res.status(405).json({ error: 'Method Not Allowed. Use POST /api/auth/login' });
});

// --- Auth helpers ---
function signToken(user) {
  return jwt.sign({ sub: String(user._id), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function signAdminToken(admin) {
  return jwt.sign({ sub: String(admin._id), email: admin.email, kind: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'missing token' });
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

function adminRequired(req, res, next) {
  return authRequired(req, res, () => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'admin role required' });
    return next();
  });
}

function adminOnlyRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'missing token' });
    const payload = jwt.verify(token, JWT_SECRET);
    // Backward-compatible: accept either admin-kind tokens, or legacy user tokens with role=admin
    const isAdminToken = payload?.kind === 'admin';
    const isLegacyAdmin = payload?.role === 'admin';
    if (!isAdminToken && !isLegacyAdmin) return res.status(403).json({ error: 'admin token required' });
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// --- Auth: Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { studentId, email, fullName, password, confirmPassword, adminCode } = req.body || {};

    // Basic presence checks
    if (!studentId || !email || !fullName || !password || !confirmPassword) {
      return res.status(400).json({ error: 'studentId, email, fullName, password, confirmPassword are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (String(password).length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 chars and contain letters and numbers' });
    }

    // Normalize
    const studentIdNorm = String(studentId).trim();
    const emailNorm = String(email).trim().toLowerCase();
    const fullNameNorm = String(fullName).trim();

    // Explicit rule checks (mirror schema; accept dashed or digits-only 4-12)
    if (!(/^\d{2}-\d{4}-\d{6}$/.test(studentIdNorm) || /^\d{4,12}$/.test(studentIdNorm))) {
      return res.status(400).json({ error: 'Student ID must be digits (4-12) or 00-0000-000000' });
    }
    if (!validator.isEmail(emailNorm)) {
      return res.status(400).json({ error: 'Email must contain @ and be valid' });
    }
    if (!/^[A-Za-z .'-]+$/.test(fullNameNorm)) {
      return res.status(400).json({ error: "Full name may contain letters, spaces, apostrophes, hyphens, and periods only" });
    }

    const exists = await User.findOne({ $or: [{ email: emailNorm }, { studentId: studentIdNorm }] }).lean();
    if (exists) {
      const conflict = exists.email === emailNorm ? 'email' : 'studentId';
      return res.status(409).json({ error: `${conflict} already in use` });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    // Backward-compatible: if adminCode provided and valid, create admin User and Admin doc
    let role = 'student';
    if (adminCode) {
      const codeHash = crypto.createHash('sha256').update(String(adminCode)).digest('hex');
      const key = await AdminKey.findOne({ codeHash, active: true }).lean();
      const notExpired = !key?.expiresAt || key.expiresAt > new Date();
      const hasUses = key && key.uses < key.maxUses;
      if (!key || !notExpired || !hasUses) {
        return res.status(400).json({ error: 'Invalid or expired admin code' });
      }
      role = 'admin';
      // Ensure corresponding Admin document exists (separate admin collection)
      try {
        await mongoose.model('Admin').updateOne(
          { email: emailNorm },
          { $set: { email: emailNorm, fullName: fullNameNorm, passwordHash, status: 'active', updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        );
      } catch (_) { /* ignore */ }
      AdminKey.updateOne({ _id: key._id }, { $inc: { uses: 1 } }).catch(() => {});
    }

    const user = await User.create({ studentId: studentIdNorm, email: emailNorm, name: fullNameNorm, fullName: fullNameNorm, passwordHash, role });
    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: String(user._id), studentId: user.studentId, email: user.email, fullName: user.fullName, role: user.role }
    });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ error: 'Email or Student ID already exists' });
    }
    return res.status(500).json({ error: 'Server error', detail: e.message });
  }
});

// --- Auth: Login (email + password)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signToken(user);
  return res.json({ token, user: { id: String(user._id), studentId: user.studentId, email: user.email, fullName: user.fullName, role: user.role } });
});

// Current user info
app.get('/api/auth/me', authRequired, async (req, res) => {
  const user = await User.findById(req.user.sub).lean();
  if (!user) return res.status(404).json({ error: 'not found' });
  return res.json({ id: String(user._id), studentId: user.studentId, email: user.email, fullName: user.fullName, role: user.role });
});

// --- Admin Auth: Signup/Login/Me
app.post('/api/admin/auth/signup', async (req, res) => {
  try {
    const { email, fullName, password, confirmPassword, adminCode } = req.body || {};
    if (!email || !fullName || !password || !confirmPassword || !adminCode) {
      return res.status(400).json({ error: 'email, fullName, password, confirmPassword, adminCode are required' });
    }
    const emailNorm = String(email).trim().toLowerCase();
    const fullNameNorm = String(fullName).trim();
    if (!validator.isEmail(emailNorm)) return res.status(400).json({ error: 'invalid email' });
    if (password !== confirmPassword) return res.status(400).json({ error: 'passwords do not match' });
    if (String(password).length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 chars and contain letters and numbers' });
    }
    const exists = await Admin.findOne({ email: emailNorm }).lean();
    if (exists) return res.status(409).json({ error: 'email already in use' });

    const codeHash = crypto.createHash('sha256').update(String(adminCode)).digest('hex');
    const key = await AdminKey.findOne({ codeHash, active: true }).lean();
    const notExpired = !key?.expiresAt || key.expiresAt > new Date();
    const hasUses = key && key.uses < key.maxUses;
    if (!key || !notExpired || !hasUses) return res.status(400).json({ error: 'Invalid or expired admin code' });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const admin = await Admin.create({ email: emailNorm, fullName: fullNameNorm, passwordHash });
    AdminKey.updateOne({ _id: key._id }, { $inc: { uses: 1 } }).catch(() => {});
    const token = signAdminToken(admin);
    return res.status(201).json({ token, admin: { id: String(admin._id), email: admin.email, fullName: admin.fullName } });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'email already exists' });
    return res.status(500).json({ error: 'Server error', detail: e.message });
  }
});

app.post('/api/admin/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const admin = await Admin.findOne({ email: String(email).toLowerCase() });
  if (!admin || admin.status !== 'active') return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(String(password), admin.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signAdminToken(admin);
  return res.json({ token, admin: { id: String(admin._id), email: admin.email, fullName: admin.fullName } });
});

app.get('/api/admin/auth/me', adminOnlyRequired, async (req, res) => {
  const admin = await Admin.findById(req.admin.sub).lean();
  if (!admin) return res.status(404).json({ error: 'not found' });
  return res.json({ id: String(admin._id), email: admin.email, fullName: admin.fullName, status: admin.status });
});

// Request password reset (returns token for demo; normally emailed)
app.post('/api/auth/request-reset', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(404).json({ error: 'user not found' });
  const token = crypto.randomBytes(16).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await PasswordReset.create({ userId: user._id, tokenHash, expiresAt });
  // For demo we return the token; in production, send by email.
  return res.json({ ok: true, uid: String(user._id), token, expiresAt });
});

// Perform password reset
app.post('/api/auth/reset', async (req, res) => {
  const { uid, token, newPassword } = req.body || {};
  if (!uid || !token || !newPassword) return res.status(400).json({ error: 'uid, token, newPassword required' });
  if (String(newPassword).length < 8) return res.status(400).json({ error: 'password must be at least 8 chars' });
  let userId;
  try { userId = new mongoose.Types.ObjectId(String(uid)); } catch { return res.status(400).json({ error: 'invalid uid' }); }
  const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const rec = await PasswordReset.findOne({ userId, tokenHash, used: false, expiresAt: { $gt: new Date() } });
  if (!rec) return res.status(400).json({ error: 'invalid or expired token' });
  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  await User.findByIdAndUpdate(userId, { passwordHash });
  await PasswordReset.updateOne({ _id: rec._id }, { $set: { used: true, usedAt: new Date() } });
  await PasswordReset.updateMany({ userId, used: false }, { $set: { used: true, usedAt: new Date() } });
  return res.json({ ok: true });
});

// --- Dashboard
app.get('/api/dashboard', adminOnlyRequired, async (_req, res) => {
  const [users, books, activeLoans, visitsToday] = await Promise.all([
    User.countDocuments(),
    Book.countDocuments(),
    Loan.countDocuments({ returnedAt: null }),
    Visit.countDocuments({ enteredAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } })
  ]);

  const topBooks = await Loan.aggregate([
    { $group: { _id: '$bookId', borrows: { $sum: 1 } } },
    { $sort: { borrows: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
    { $unwind: '$book' },
    { $project: { _id: 0, bookId: '$_id', title: '$book.title', author: '$book.author', borrows: 1 } }
  ]);

  res.json({ counts: { users, books, activeLoans, visitsToday }, topBooks });
});

// --- Usage Heatmaps (visits)
app.get('/api/heatmap/visits', authRequired, async (req, res) => {
  const days = Number(req.query.days || 30);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const branch = req.query.branch;
  const match = { enteredAt: { $gte: since } };
  if (branch) match.branch = String(branch);

  const data = await Visit.aggregate([
    { $match: match },
    { $addFields: { dow: { $dayOfWeek: '$enteredAt' }, hour: { $hour: '$enteredAt' } } },
    { $group: { _id: { dow: '$dow', hour: '$hour' }, count: { $sum: 1 } } },
    { $project: { _id: 0, dow: '$_id.dow', hour: '$_id.hour', count: 1 } },
    { $sort: { dow: 1, hour: 1 } }
  ]);
  res.json({ since, items: data });
});

// --- Tracker: visit enter by studentId or barcode
app.post('/api/visit/enter', async (req, res) => {
  const { studentId, barcode, branch = 'Main' } = req.body || {};
  if (!studentId && !barcode) return res.status(400).json({ error: 'studentId or barcode required' });
  const user = await User.findOne(
    studentId ? { studentId: String(studentId) } : { barcode: String(barcode) }
  ).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const now = new Date();
  const dupe = await Visit.findOne({
    $or: [ { userId: user._id }, { studentId: user.studentId }, barcode ? { barcode } : { barcode: null } ],
    enteredAt: { $gt: new Date(now.getTime() - 2 * 60 * 1000) }
  }).lean();
  if (!dupe) await Visit.create({ userId: user._id, studentId: user.studentId, barcode, branch, enteredAt: now });
  res.json({ ok: true, deduped: !!dupe, user: { id: String(user._id), fullName: user.fullName } });
});

// --- Books CRUD (Admin)
app.post('/api/books', adminOnlyRequired, async (req, res) => {
  try {
    const { title, author, isbn, tags, totalCopies } = req.body || {};
    if (!title || !author) return res.status(400).json({ error: 'title and author required' });
    const book = await Book.create({ title, author, isbn, tags, totalCopies, availableCopies: totalCopies ?? 1 });
    res.status(201).json(book);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/books', adminOnlyRequired, async (req, res) => {
  const q = String(req.query.q || '').trim();
  const filter = q ? { $text: { $search: q } } : {};
  const items = await Book.find(filter).limit(200).lean();
  res.json(items);
});

app.get('/api/books/:id', adminOnlyRequired, async (req, res) => {
  const item = await Book.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.patch('/api/books/:id', adminOnlyRequired, async (req, res) => {
  try {
    const item = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/books/:id', adminOnlyRequired, async (req, res) => {
  const out = await Book.findByIdAndDelete(req.params.id).lean();
  if (!out) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

// --- Loans
app.post('/api/loans/borrow', adminOnlyRequired, async (req, res) => {
  const { userId, bookId, days = 14 } = req.body || {};
  if (!userId || !bookId) return res.status(400).json({ error: 'userId and bookId required' });
  const [user, book] = await Promise.all([
    User.findById(userId),
    Book.findById(bookId)
  ]);
  if (!user || !book) return res.status(404).json({ error: 'User or Book not found' });
  if (book.availableCopies <= 0) return res.status(400).json({ error: 'No available copies' });
  const dueAt = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
  const loan = await Loan.create({ userId: user._id, bookId: book._id, dueAt });
  await Book.findByIdAndUpdate(book._id, { $inc: { availableCopies: -1 } });
  res.status(201).json(loan);
});

app.post('/api/loans/return', adminOnlyRequired, async (req, res) => {
  const { loanId, userId, bookId } = req.body || {};
  const q = loanId ? { _id: loanId } : { userId, bookId, returnedAt: null };
  const loan = await Loan.findOne(q);
  if (!loan) return res.status(404).json({ error: 'Active loan not found' });
  if (loan.returnedAt) return res.status(400).json({ error: 'Already returned' });
  loan.returnedAt = new Date();
  await loan.save();
  await Book.findByIdAndUpdate(loan.bookId, { $inc: { availableCopies: 1 } });
  res.json(loan);
});

// Active loans with user + book details (for Books Management UI)
app.get('/api/loans/active', adminOnlyRequired, async (_req, res) => {
  const now = new Date();
  const items = await Loan.aggregate([
    { $match: { returnedAt: null } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'book' } },
    { $unwind: '$book' },
    { $project: {
        _id: 1,
        title: '$book.title',
        student: '$user.fullName',
        borrowedAt: 1,
        dueAt: 1,
        status: { $cond: [ { $lt: ['$dueAt', now] }, 'Overdue', 'On Time' ] }
    } }
  ]).exec();
  res.json({ items });
});

app.get('/api/student/:id/borrowed', authRequired, async (req, res) => {
  const items = await Loan.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.params.id), returnedAt: null } },
    { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'book' } },
    { $unwind: '$book' },
    { $project: { _id: 0, title: '$book.title', author: '$book.author', borrowedAt: 1, dueAt: 1 } }
  ]);
  res.json({ items });
});

// --- Reports
app.get('/api/reports/top-books', authRequired, async (_req, res) => {
  const data = await Loan.aggregate([
    { $group: { _id: '$bookId', borrows: { $sum: 1 } } },
    { $sort: { borrows: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
    { $unwind: '$book' },
    { $project: { _id: 0, bookId: '$_id', title: '$book.title', author: '$book.author', borrows: 1 } }
  ]);
  res.json({ items: data });
});

app.get('/api/reports/overdue', authRequired, async (_req, res) => {
  const items = await Loan.aggregate([
    { $match: { returnedAt: null, dueAt: { $lt: new Date() } } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'book' } },
    { $unwind: '$user' },
    { $unwind: '$book' },
    { $project: { _id: 0, user: '$user.fullName', title: '$book.title', dueAt: 1, borrowedAt: 1 } }
  ]);
  res.json({ items });
});

// --- Hours
app.get('/api/hours', authRequired, async (req, res) => {
  const branch = String(req.query.branch || 'Main');
  const items = await Hours.find({ branch }).sort({ dayOfWeek: 1 }).lean();
  res.json({ branch, items });
});

app.put('/api/hours/:branch/:day', adminOnlyRequired, async (req, res) => {
  const branch = String(req.params.branch);
  const day = Number(req.params.day);
  const { open, close } = req.body || {};
  if (!open || !close) return res.status(400).json({ error: 'open and close required' });
  const doc = await Hours.findOneAndUpdate(
    { branch, dayOfWeek: day },
    { branch, dayOfWeek: day, open, close },
    { new: true, upsert: true, runValidators: true }
  ).lean();
  res.json(doc);
});

// --- Admin: users list + role update
app.get('/api/admin/users', adminOnlyRequired, async (req, res) => {
  const q = String(req.query.q || '').trim();
  const filter = q ? { $or: [ { fullName: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { studentId: new RegExp(q, 'i') } ] } : {};
  const items = await User.find(filter).select('fullName email studentId role createdAt').limit(200).lean();
  res.json(items);
});

app.patch('/api/admin/users/:id/role', adminOnlyRequired, async (req, res) => {
  const { role } = req.body || {};
  if (!role) return res.status(400).json({ error: 'role required' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).lean();
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: String(user._id), role: user.role });
});

// --- Admin: admin signup keys
app.get('/api/admin/keys', adminOnlyRequired, async (_req, res) => {
  const items = await AdminKey.find().sort({ createdAt: -1 }).lean();
  // Do not return raw hashes; mask sensitive fields
  const safe = items.map(k => ({
    id: String(k._id),
    label: k.label,
    maxUses: k.maxUses,
    uses: k.uses,
    active: k.active,
    expiresAt: k.expiresAt,
    createdAt: k.createdAt,
    updatedAt: k.updatedAt
  }));
  res.json({ items: safe });
});

app.post('/api/admin/keys', adminOnlyRequired, async (req, res) => {
  const { label = 'Admin invite', maxUses = 1, daysToExpire = 30, code } = req.body || {};
  const raw = String(code || crypto.randomBytes(9).toString('base64url'));
  const codeHash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = daysToExpire ? new Date(Date.now() + Number(daysToExpire) * 864e5) : null;
  try {
    const doc = await AdminKey.create({ codeHash, label: String(label), maxUses: Number(maxUses), uses: 0, active: true, expiresAt });
    res.status(201).json({
      // Return the raw code only on creation so admin can copy/paste into UI
      code: raw,
      key: { id: String(doc._id), label: doc.label, maxUses: doc.maxUses, uses: doc.uses, active: doc.active, expiresAt: doc.expiresAt }
    });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'Duplicate key' });
    res.status(400).json({ error: e.message });
  }
});

app.patch('/api/admin/keys/:id', adminOnlyRequired, async (req, res) => {
  const { active, label, maxUses, expiresAt } = req.body || {};
  const update = {};
  if (typeof active === 'boolean') update.active = active;
  if (label !== undefined) update.label = String(label);
  if (maxUses !== undefined) update.maxUses = Number(maxUses);
  if (expiresAt !== undefined) update.expiresAt = expiresAt ? new Date(expiresAt) : null;
  const key = await AdminKey.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
  if (!key) return res.status(404).json({ error: 'Not found' });
  res.json({ id: String(key._id), label: key.label, maxUses: key.maxUses, uses: key.uses, active: key.active, expiresAt: key.expiresAt });
});

const PORT = process.env.BACKEND_PORT || 4000;

function start(port = PORT) {
  return app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
}

if (require.main === module) {
  start();
}

module.exports = { app, start };
