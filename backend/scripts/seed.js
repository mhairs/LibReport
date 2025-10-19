// backend/scripts/seed.js
const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const { MongoClient, ObjectId } = require('mongodb');
const { resolveMongoConfig } = require('../db/uri');
const { uri, dbName } = resolveMongoConfig();
if (!uri) throw new Error('MONGO_URI not set');

const client = new MongoClient(uri);

async function ensureIndexes(db) {
  await db.collection('books').createIndexes([
    { key: { title: 'text', author: 'text' }, name: 'books_text' }
  ]);
  await db.collection('loans').createIndexes([
    { key: { userId: 1, returnedAt: 1 }, name: 'loans_user_returned' },
    { key: { dueAt: 1 }, name: 'loans_due' },
    { key: { bookId: 1 }, name: 'loans_book' }
  ]);
  await db.collection('users').createIndexes([
    { key: { role: 1, name: 1 }, name: 'users_role_name' }
  ]);
  await db.collection('hours').createIndexes([
    { key: { branch: 1, dayOfWeek: 1 }, name: 'hours_branch_dow', unique: true }
  ]);
}

function upsertsFromArray(arr, key = '_id') {
  return arr.map(doc => ({
    updateOne: { filter: { [key]: doc[key] }, update: { $set: doc }, upsert: true }
  }));
}

// New seed routine using ObjectId and adding visits
async function main() {
  await client.connect();
  const db = client.db(dbName);

  // Clean collections for a predictable demo
  for (const name of ['users','books','loans','visits','hours']) {
    await db.collection(name).deleteMany({});
  }

  // bcrypt hash for "Password123" (cost 10)
  const demoHash = '$2b$10$vr7A1FNcgAQR/PmKzjVfMuCUWccdXVQqeA9M8I/VeEiFxLzAVtYoO';
  const userDocs = [
    { _id: new ObjectId(), studentId: '10001', name: 'Alice Student', fullName: 'Alice Student', role: 'student', email: 'alice@example.edu', barcode: 'A001', passwordHash: demoHash },
    { _id: new ObjectId(), studentId: '10002', name: 'Bob Student',   fullName: 'Bob Student',   role: 'student', email: 'bob@example.edu',   barcode: 'B002', passwordHash: demoHash },
    { _id: new ObjectId(), studentId: '90001', name: 'Sam Admin',     fullName: 'Sam Admin',     role: 'admin', email: 'sam@example.edu', barcode: 'L9001', passwordHash: demoHash }
  ];
  await db.collection('users').insertMany(userDocs, { ordered: false, bypassDocumentValidation: true });

  const bookDocs = [
    { _id: new ObjectId(), title: 'Clean Code', author: 'Robert C. Martin', categories: ['Software'], totalCopies: 3, availableCopies: 1 },
    { _id: new ObjectId(), title: 'The Design of Everyday Things', author: 'Don Norman', categories: ['Design'], totalCopies: 2, availableCopies: 2 },
    { _id: new ObjectId(), title: 'Introduction to Algorithms', author: 'Cormen et al.', categories: ['CS'], totalCopies: 5, availableCopies: 4 }
  ];
  await db.collection('books').insertMany(bookDocs, { ordered: false, bypassDocumentValidation: true });

  const now = new Date();
  const twoWeeks = 14 * 864e5;
  const [alice, bob] = userDocs;
  const [cleanCode, designThings, algo] = bookDocs;
  const loanDocs = [
    { _id: new ObjectId(), userId: alice._id, bookId: cleanCode._id, borrowedAt: new Date(now - 7 * 864e5), dueAt: new Date(now + 7 * 864e5), returnedAt: null },
    { _id: new ObjectId(), userId: alice._id, bookId: designThings._id, borrowedAt: new Date(now - 20 * 864e5), dueAt: new Date(now - 6 * 864e5), returnedAt: null },
    { _id: new ObjectId(), userId: bob._id, bookId: algo._id, borrowedAt: new Date(now - 10 * 864e5), dueAt: new Date(now - 10 * 864e5 + twoWeeks), returnedAt: new Date(now - 2 * 864e5) }
  ];
  await db.collection('loans').insertMany(loanDocs, { ordered: false, bypassDocumentValidation: true });

  // visits heatmap for last 30 days
  const visits = [];
  for (let d = 0; d < 30; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
    const samples = 10 + Math.floor(Math.random() * 20);
    for (let i = 0; i < samples; i++) {
      const hour = Math.floor(Math.random() * 12) + 8; // 8am-8pm
      const ts = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, Math.floor(Math.random() * 60));
      const who = Math.random() < 0.5 ? alice : bob;
      visits.push({ _id: new ObjectId(), userId: who._id, studentId: who.studentId, barcode: who.barcode, branch: 'Main', enteredAt: ts });
    }
  }
  await db.collection('visits').insertMany(visits, { ordered: false, bypassDocumentValidation: true });

  const branch = 'Main';
  const hours = [
    { dayOfWeek: 0, open: '10:00', close: '14:00' },
    { dayOfWeek: 1, open: '09:00', close: '18:00' },
    { dayOfWeek: 2, open: '09:00', close: '18:00' },
    { dayOfWeek: 3, open: '09:00', close: '18:00' },
    { dayOfWeek: 4, open: '09:00', close: '18:00' },
    { dayOfWeek: 5, open: '09:00', close: '17:00' },
    { dayOfWeek: 6, open: '10:00', close: '14:00' }
  ].map(h => ({ _id: `${branch}-${h.dayOfWeek}`, branch, ...h }));
  await db.collection('hours').bulkWrite(upsertsFromArray(hours), { bypassDocumentValidation: true });

  await ensureIndexes(db);

  const counts = await Promise.all(
    ['users','books','loans','visits','hours'].map(async c => [c, await db.collection(c).countDocuments()])
  );
  console.log('Seed complete:', Object.fromEntries(counts));
}

main().catch(e => { console.error('Seed error:', e); })
  .finally(() => client.close());
