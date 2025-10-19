// backend/scripts/print_admin_token.js
// Print a signed admin JWT for a given admin email (for quick testing)

const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
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
  const { uri, dbName } = resolveMongoConfig();
  const email = String(parseArgs(process.argv).email || '').toLowerCase();
  if (!uri) throw new Error('MONGO_URI not set');
  if (!email) throw new Error('Provide --email');
  const secret = process.env.JWT_SECRET || 'dev-secret';

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const idArg = String(parseArgs(process.argv).adminId || '').trim();
    const admin = email
      ? await db.collection('admin').findOne({ email })
      : await db.collection('admin').findOne({ adminId: idArg });
    if (!admin) {
      console.error('Admin not found');
      process.exit(1);
    }
    const token = jwt.sign({ sub: String(admin._id), email: admin.email, adminId: admin.adminId, role: admin.role, kind: 'admin' }, secret, { expiresIn: '7d' });
    console.log(token);
  } finally {
    await client.close().catch(() => {});
  }
})();
