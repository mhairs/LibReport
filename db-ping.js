const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGO_URI (or MONGODB_URI) in .env');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

(async () => {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Connected to MongoDB successfully');
  } catch (e) {
    console.error('Connection failed:', e.message);
  } finally {
    await client.close();
  }
})();

