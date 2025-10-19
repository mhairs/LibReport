// backend/scripts/indexes.js
const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const { MongoClient } = require('mongodb');
const { resolveMongoConfig } = require('../db/uri');
const { uri, dbName } = resolveMongoConfig();

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    await db.collection('users').createIndexes([
      { key: { name: 1 }, name: 'user_name' },
      { key: { role: 1 }, name: 'user_role' },
      { key: { email: 1 }, name: 'user_email_unique', unique: true, partialFilterExpression: { email: { $exists: true } } }
    ]);

    await db.collection('books').createIndexes([
      { key: { title: 'text', author: 'text' }, name: 'books_text' }
    ]);

    await db.collection('loans').createIndexes([
      { key: { userId: 1, borrowedAt: -1 }, name: 'loans_user_time' },
      { key: { bookId: 1, returnedAt: 1 }, name: 'loans_book_return' },
      { key: { dueAt: 1 }, name: 'loans_due' }
    ]);

    await db.collection('visits').createIndexes([
      { key: { userId: 1, enteredAt: -1 }, name: 'visits_user_time' },
      { key: { barcode: 1, enteredAt: -1 }, name: 'visits_barcode_time' }
    ]);

    await db.collection('hours').createIndexes([
      { key: { branch: 1, dayOfWeek: 1 }, name: 'hours_branch_dow', unique: true }
    ]);

    console.log('Indexes created');
  } catch (e) {
    console.error('Index error:', e.message);
  } finally {
    await client.close();
  }
})();

