import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import User from "./models/User.js";
// Import CommonJS resolver from root backend to keep config consistent
import uriResolver from "../backend/db/uri.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- DB connect (shared resolver) ---
const { resolveMongoConfig } = uriResolver;
const { uri, dbName } = resolveMongoConfig();
if (!uri) {
  console.error("Missing MONGO_URI (or MONGODB_URI) in environment");
  process.exit(1);
}
mongoose
  .connect(uri, { dbName, serverSelectionTimeoutMS: 10000, family: 4 })
  .then(() => console.log(`MongoDB connected (db: ${dbName})`))
  .catch((err) => {
    const code = err && (err.code || err.codeName || err.name);
    console.error("MongoDB connection error:", code ? `${code}: ${err.message}` : err.message);
    console.error("Tip: If using Atlas/Compass, ensure password is URL-encoded and authSource is correct (e.g., ?authSource=admin).");
    process.exit(1);
  });

// --- Health (checks DB state) ---
app.get("/api/health", (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1; // 1 = connected
  return res.status(dbReady ? 200 : 500).json({
    ok: dbReady,
    database: dbReady ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

// --- CRUD: Users ---
app.post("/api/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    return res.status(201).json(user);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get("/api/users", async (_req, res) => {
  const users = await User.find().lean();
  return res.json(users);
});

app.get("/api/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json(user);
});

app.patch("/api/users/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).lean();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json(user);
});

app.delete("/api/users/:id", async (req, res) => {
  const result = await User.findByIdAndDelete(req.params.id).lean();
  if (!result) return res.status(404).json({ error: "Not found" });
  return res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

