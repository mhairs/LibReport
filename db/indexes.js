// db/indexes.js
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

    await db.collection('users').createIndexes([
      { key: { name: 1 }, name: 'user_name' },
      { key: { role: 1 }, name: 'user_role' }
    ]);

    await db.collection('books').createIndexes([
      { key: { title: 'text', author: 'text' }, name: 'books_text' }
    ]);

    await db.collection('loans').createIndexes([
      { key: { userId: 1, borrowedAt: -1 }, name: 'loans_user_time' },
      { key: { bookId: 1, returnedAt: 1 }, name: 'loans_book_return' }
    ]);

    await db.collection('visits').createIndexes([
      { key: { userId: 1, enteredAt: -1 }, name: 'visits_user_time' }
    ]);

    console.log('✅ Indexes created');
  } catch (e) {
    console.error('❌ Index error:', e.message);
  } finally {
    await client.close();
  }
})();
