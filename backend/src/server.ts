import express from "express";
import prisma from "./config/prisma.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.get("/health", async (_req, res) => {
  try {
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW()`;

    res.json({
      status: "ok",
      database: result[0]?.now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});