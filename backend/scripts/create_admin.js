// backend/scripts/create_admin.js
// Create or update an Admin in the admins collection.

const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { resolveMongoConfig } = require('../db/uri');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.replace(/^--/, '');
    const v = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
    out[k] = v;
  }
  return out;
}

(async () => {
  const args = parseArgs(process.argv);
  const email = String(args.email || '').toLowerCase();
  const fullName = String(args.fullName || args.name || 'Administrator');
  const password = String(args.password || 'Password123');
  if (!email) throw new Error('Provide --email');

  const { uri, dbName } = resolveMongoConfig();
  if (!uri) throw new Error('MONGO_URI is not set');

  const hash = await bcrypt.hash(password, 10);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const now = new Date();
    const adminId = String(args.adminId || args.studentId || '').trim() || undefined;
    const role = String(args.role || 'admin');
    const result = await db.collection('admin').updateOne(
      { $or: [ { email }, adminId ? { adminId } : null ].filter(Boolean) },
      { $set: { email, adminId, fullName, passwordHash: hash, role, status: 'active', updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    if (result.upsertedId) {
      console.log('Admin created:', email);
    } else {
      console.log('Admin updated:', email);
    }
    console.log('fullName:', fullName);
  } finally {
    await client.close().catch(() => {});
  }
})();
