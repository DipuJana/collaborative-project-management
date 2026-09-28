import express from "express";
import apiRouter from "./routes/index.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.use(errorHandler);

export default app;