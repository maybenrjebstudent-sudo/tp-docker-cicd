const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// CORS MIDDLEWARE
const allowedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://tp-docker-cicd-orpin.vercel.app/",
].filter(Boolean);

app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (e.g. curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    })
);

// MAIN API ROUTE
app.get("/api", (req, res) => {
  res.json({
    message: "Hello from Backend!",
    timestamp: new Date().toISOString(),
    client: req.get("Origin") || "unknown",
    success: true,
  });
});

// DATABASE ROUTE
app.get("/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json({
      message: "Data from Database",
      data: result.rows,
      timestamp: new Date().toISOString(),
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Database error please verify",
      error: err.message,
      success: false,
    });
  }
});

// START SERVER — must bind to 0.0.0.0 for Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`API endpoint: /api`);
  console.log(`DB endpoint: /db`);
});
