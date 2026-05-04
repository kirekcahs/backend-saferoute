import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http"; 
import { WebSocketServer } from "ws";
import connectDB from "./config/db.js";
import router from "./routes/index.js";
import { initWebSocket } from "./helpers/websocket.js";
const PORT = process.env.PORT || 5000;

const app = express();

connectDB();

app.use(
  cors({ origin: "https://saferoute-admin.vercel.app", credentials: true }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// All routes go through /api
app.use("/api", router);

// Create shared HTTP server
const server = createServer(app);

// Attach WebSocket server
const wss = new WebSocketServer({ server });

initWebSocket(wss);

wss.on("connection", (ws, req) => {
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (data) => {
    const message = data.toString();
    console.log("Received:", message);
    ws.send(JSON.stringify({ type: "echo", payload: message }));
  });

  ws.on("close", () => console.log("Client disconnected"));
  ws.on("error", (err) => console.error("WebSocket error:", err));

  ws.send(
    JSON.stringify({ type: "connected", message: "Welcome to Saferoute WS" }),
  );
});

// Heartbeat to keep Railway proxy alive
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 25_000);

wss.on("close", () => clearInterval(heartbeat));

server.listen(PORT, () => {
  console.log(`Saferoute server is in ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT:", err.stack);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED:", err.stack);
});

export default app;
