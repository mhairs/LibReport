const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) { console.error('Missing MONGO_URI (or MONGODB_URI) in .env'); process.exit(1); }
const dbName = process.env.DB_NAME || 'libreport';

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  serverSelectionTimeoutMS: 8000
});

(async () => {
  try {
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    console.log(`Connected and pinged "${dbName}" successfully`);
  } catch (e) {
    console.error('MongoDB error:', e.message);
  } finally {
    await client.close();
  }
})();

