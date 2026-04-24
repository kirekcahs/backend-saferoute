import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import router from "./routes/index.js";
const PORT = process.env.PORT || 5000;

const app = express();

connectDB();

app.use(cors({ origin: "http://localhost:3000" || process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// All routes go through /api
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Saferoute server is in ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT:", err.stack);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED:", err.stack);
});

export default app;
