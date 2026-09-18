import express from "express";
import pool from "./config/database.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.get("/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      database: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      database: "unavailable"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});