const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const { MongoClient } = require('mongodb');
const { resolveMongoConfig } = require('../db/uri');
const { uri, dbName } = resolveMongoConfig();
if (!uri) { console.error('Missing MONGO_URI'); process.exit(1); }
const client = new MongoClient(uri);

(async () => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const colls = ['users','books','loans','visits','hours'];
    for (const c of colls) {
      const count = await db.collection(c).countDocuments();
      const one = await db.collection(c).findOne();
      console.log(`${c}: ${count}`, one ? ` sample _id=${one._id}` : '');
    }
  } finally { await client.close(); }
})();

