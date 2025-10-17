import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import User from "./models/User.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- DB connect ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// --- Health (checks DB state) ---
app.get("/health", (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1; // 1 = connected
  return res.status(dbReady ? 200 : 500).json({
    ok: dbReady,
    database: dbReady ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

// --- CRUD: Users ---
app.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    return res.status(201).json(user);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get("/users", async (_req, res) => {
  const users = await User.find().lean();
  return res.json(users);
});

app.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json(user);
});

app.patch("/users/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).lean();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json(user);
});

app.delete("/users/:id", async (req, res) => {
  const result = await User.findByIdAndDelete(req.params.id).lean();
  if (!result) return res.status(404).json({ error: "Not found" });
  return res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

