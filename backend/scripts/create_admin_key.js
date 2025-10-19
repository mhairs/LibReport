// backend/scripts/create_admin_key.js
// Create an admin signup key and print the one-time plaintext code.

const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const { MongoClient } = require('mongodb');
const crypto = require('node:crypto');
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
  if (!uri) throw new Error('MONGO_URI (or MONGODB_URI) is not set');

  const args = parseArgs(process.argv);
  const label = String(args.label || 'Admin invite');
  const maxUses = Number(args.maxUses || 1);
  const daysToExpire = args.daysToExpire != null ? Number(args.daysToExpire) : 30;
  const raw = String(args.code || crypto.randomBytes(9).toString('base64url'));
  const codeHash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = daysToExpire > 0 ? new Date(Date.now() + daysToExpire * 864e5) : null;

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('adminkeys');
    const doc = { codeHash, label, maxUses, uses: 0, active: true, expiresAt, createdAt: new Date(), updatedAt: new Date() };
    await col.insertOne(doc);
    console.log('Admin key created:');
    console.log(' code:', raw);
    console.log(' label:', label);
    console.log(' maxUses:', maxUses);
    console.log(' expiresAt:', expiresAt ? expiresAt.toISOString() : 'none');
  } catch (e) {
    if (e?.code === 11000) {
      console.error('A key with this hash already exists. Try again without --code.');
    } else {
      console.error('Error:', e.message);
    }
    process.exit(1);
  } finally {
    await client.close().catch(() => {});
  }
})();

