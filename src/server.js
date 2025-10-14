const path = require('node:path');
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) { console.error("Missing MONGO_URI in .env"); process.exit(1); }
const dbName = process.env.DB_NAME || "libreport";

const client = new MongoClient(uri);
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/reports/top-books", async (_req, res) => {
  await client.connect();
  const db = client.db(dbName);
  const data = await db.collection("loans").aggregate([
    { $group: { _id: "$bookId", borrows: { $sum: 1 } } },
    { $sort: { borrows: -1 } }, { $limit: 10 },
    { $lookup: { from: "books", localField: "_id", foreignField: "_id", as: "book" } },
    { $unwind: "$book" },
    { $project: { _id: 0, bookId: "$_id", title: "$book.title", author: "$book.author", borrows: 1 } }
  ]).toArray();
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API listening on http://localhost:${PORT}`));