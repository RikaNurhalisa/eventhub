const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Koneksi Database
require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const participantRoutes = require("./routes/participantRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route Utama
app.get("/", (req, res) => {
  res.send("EventHub Backend is Running!");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/participants", participantRoutes);

// Global error handler — harus di AKHIR setelah semua routes
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Payload JSON tidak valid." });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});

// Menentukan Port
const PORT = process.env.PORT || 5000;

// Menjalankan Server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});