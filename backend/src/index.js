import express from "express";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import catRoutes from "./routes/catRoutes.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT 

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cats", catRoutes);


app.listen(PORT, () => {
  console.log('Srver is running on port ${PORT}');
  connectDB();
});

