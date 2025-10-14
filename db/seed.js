// db/seed.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'libreport';

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    // collections for a library/report app
    await db.collection('users').insertMany([
      { _id: 'u1', name: 'Alice', role: 'student' },
      { _id: 'u2', name: 'Bob', role: 'librarian' }
    ]);

    await db.collection('books').insertMany([
      { _id: 'b1', title: 'Clean Code', author: 'Robert C. Martin' },
      { _id: 'b2', title: 'Design of Everyday Things', author: 'Don Norman' }
    ]);

    await db.collection('loans').insertMany([
      { userId: 'u1', bookId: 'b1', borrowedAt: new Date(), returnedAt: null }
    ]);

    await db.collection('visits').insertMany([
      { userId: 'u1', enteredAt: new Date() }
    ]);

    console.log('✅ Seeded sample data');
  } catch (e) {
    console.error('❌ Seed error:', e.message);
  } finally {
    await client.close();
  }
})();
