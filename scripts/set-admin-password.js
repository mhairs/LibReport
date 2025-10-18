// scripts/set-admin-password.js
// Set or reset a user's password (admin or any user) by email or studentId.
// Usage examples:
//   node scripts/set-admin-password.js --email sam@example.edu --password NewStrongPass123
//   node scripts/set-admin-password.js --studentId 90001 --password NewStrongPass123
//   node scripts/set-admin-password.js --email admin@example.com --password NewPass123 --create --role admin --fullName "Site Admin" --barcode L9001

const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { resolveMongoConfig } = require(path.join(process.cwd(), 'backend', 'db', 'uri.js'));

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

function validatePassword(pw) {
  const p = String(pw || '');
  if (p.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) return 'Password must contain letters and numbers';
  return null;
}

async function main() {
  const args = parseArgs(process.argv);
  const { email, studentId, password, create, role = 'admin', fullName = 'Administrator', barcode } = args;
  if (!email && !studentId) throw new Error('Provide --email or --studentId');
  if (!password) throw new Error('Provide --password');
  const bad = validatePassword(password);
  if (bad) throw new Error(bad);

  const { uri, dbName } = resolveMongoConfig();
  if (!uri) throw new Error('MONGO_URI is not configured');
  const client = new MongoClient(uri);

  const filter = email ? { email: String(email).toLowerCase() } : { studentId: String(studentId) };
  const hash = await bcrypt.hash(String(password), 10);

  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');

    let existing = await users.findOne(filter);
    if (!existing && create) {
      const doc = {
        _id: new ObjectId(),
        studentId: String(studentId || '').trim() || '90001',
        name: String(fullName),
        fullName: String(fullName),
        role: String(role),
        email: String(email || '').toLowerCase() || 'admin@example.com',
        barcode: String(barcode || '').trim() || 'L9001',
        passwordHash: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await users.insertOne(doc);
      console.log(`Created ${doc.role} user ${doc.fullName} <${doc.email}> with new password.`);
      return;
    }

    if (!existing) {
      throw new Error('User not found. Add --create with details to create a user.');
    }

    await users.updateOne({ _id: existing._id }, { $set: { passwordHash: hash, updatedAt: new Date() } });
    console.log(`Password updated for ${existing.fullName || existing.email || existing.studentId} (${existing._id}).`);
  } finally {
    await client.close().catch(() => {});
  }
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });

