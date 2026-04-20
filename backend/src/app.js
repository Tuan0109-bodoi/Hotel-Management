import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/bookings", bookingRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Hotel Management API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
