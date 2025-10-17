import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/Auth.js';
import { connectDB } from "./config/db.js";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/api/users", authRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});