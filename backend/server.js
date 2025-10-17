import dotenv from 'dotenv';
import path from 'node:path';
// Load env from backend/.env, fall back to repo root .env
dotenv.config();
if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
}
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- DB connect
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'libreport';
if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment');
  process.exit(1);
}
await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
console.log(`MongoDB connected to database "${DB_NAME}"`);

// --- User model
const userSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: v => /^[0-9]+$/.test(v), // digits only
        message: 'Student ID must contain numbers only'
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
    fullName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: v => /^[A-Za-z ]+$/.test(v), // letters and spaces only
        message: 'Full name must contain letters and spaces only'
      }
    },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'student' }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ studentId: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

// --- Health
app.get('/api/health', async (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  return res.status(dbReady ? 200 : 500).json({ ok: dbReady, time: new Date().toISOString() });
});

// --- Auth: Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { studentId, email, fullName, password, confirmPassword } = req.body || {};

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

    // Explicit rule checks (mirror schema so clients get fast feedback)
    if (!/^[0-9]+$/.test(studentIdNorm)) {
      return res.status(400).json({ error: 'Student ID must contain numbers only' });
    }
    if (!validator.isEmail(emailNorm)) {
      return res.status(400).json({ error: 'Email must contain @ and be valid' });
    }
    if (!/^[A-Za-z ]+$/.test(fullNameNorm)) {
      return res.status(400).json({ error: 'Full name must contain letters and spaces only' });
    }

    const exists = await User.findOne({ $or: [{ email: emailNorm }, { studentId: studentIdNorm }] }).lean();
    if (exists) {
      const conflict = exists.email === emailNorm ? 'email' : 'studentId';
      return res.status(409).json({ error: `${conflict} already in use` });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({ studentId: studentIdNorm, email: emailNorm, fullName: fullNameNorm, passwordHash });
    return res.status(201).json({
      id: String(user._id),
      studentId: user.studentId,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt
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
  return res.json({ id: String(user._id), studentId: user.studentId, email: user.email, fullName: user.fullName });
});

const PORT = process.env.BACKEND_PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
