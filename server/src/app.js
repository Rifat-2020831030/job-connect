import compression from "compression";
import cors from "cors";
import dns from "node:dns/promises";
import dotenv from "dotenv";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { getDB } from "./db/database.js";
dotenv.config();

dns.setServers(["1.1.1.1", "1.0.0.1"]); 

import serverHealth from "./controller/server-health.js";
import authRouter from "./routers/auth.js";
import emailRouter from "./routers/email.js";
import jobsRouter from "./routers/jobs.js";
import scrapeRouter from "./routers/scrape.js";
import jobsStat from "./routers/stat.js";
import usersRouter from "./routers/users.js";
import { jobAlertSchedule } from "./services/job-alert.js";
import { source } from "./utils/source.js";

const app = express();
const PORT = process.env.PORT || 3000;
const isVercelRuntime = Boolean(process.env.VERCEL);

// Allowed origins
const allowedOrigins = [
  "https://chakrilagbe.vercel.app",
  "https://server-health-tau.vercel.app",
  "https://chakrilagbe-client-admin.vercel.app",
  "http://localhost:3000", // client_v2 dev
];

const corsOption = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked origin: ${origin}`);
      callback(
        new Error(`Access denied: Origin '${origin}' not allowed.`),
        false
      );
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 200,
  message: "Too many requests, please try again later.",
  skip: (req) => req.path === "/health",
});

const healthLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: "Too many requests, please try again later.",
});

app.use(cors(corsOption));
app.use(limiter);
app.use(express.json());
app.use(compression());

app.get("/", (_req, res) => res.send("The server is running"));
app.get("/health", healthLimit, serverHealth);

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/jobs", source, jobsRouter);
app.use("/api/stat", jobsStat);
app.use("/api/email", emailRouter);
app.use("/api/scrape", scrapeRouter);

// Error handling middleware
app.use((err, req, res, _next) => {
  if (err.message?.includes("Origin") && err.message?.includes("not allowed")) {
    return res.status(403).json({
      status: 0,
      message: "CORS Error: Origin not allowed",
      error: "Access denied by CORS policy",
    });
  }
  const message = err.message || "Internal Server Error";
  res.status(500).json({ status: 0, message });
});

// Initialize DB then start server
getDB()
  .then(() => {
    if (process.env.NODE_ENV !== "production" && !isVercelRuntime) {
      app.listen(PORT, () => {
        console.log(`The server is running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
  });

export default app;
