const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI; const dbName = process.env.DB_NAME || 'libreport';
const client = new MongoClient(uri);

(async () => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const colls = ['users','books','loans','visits'];
    for (const c of colls) {
      const count = await db.collection(c).countDocuments();
      const one = await db.collection(c).findOne();
      console.log(`${c}: ${count}`, one ? `→ sample _id=${one._id}` : '');
    }
  } finally { await client.close(); }
})();
