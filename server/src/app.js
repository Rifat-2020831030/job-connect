import compression from "compression";
import dotenv from "dotenv";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { connectDB } from "./db/database.js";
dotenv.config();

import dns from "dns";
import { jobSearcherCron } from "../spider-runner.js";
import serverHealth from "./controller/server-health.js";
import emailRouter from "./routers/email.js";
import jobsRouter from "./routers/jobs.js";
import scrapeRouter from "./routers/scrape.js";
import jobsStat from "./routers/stat.js";
import { jobAlertSchedule } from "./services/job-alert.js";
import { source } from "./utils/source.js";

dns.setServers(["1.1.1.1", "1.0.0.1"]);

const app = express();
const PORT = process.env.PORT || 3000;

// Start the scheduled cron job
jobSearcherCron.start();
jobAlertSchedule.start();

// Allowed origins
const allowedOrigins = [
  "https://chakrilagbe.vercel.app",
  "https://server-health-tau.vercel.app",
  "https://chakrilagbe-client-admin.vercel.app",
  // "http://localhost:5173", // For local development
];

const corsOption = {
  origin: (origin, callback) => {
    // Disallow requests with no origin
    if (!origin) {
      callback(
        // new Error("CORS Error: No origin provided"),
        null,
        true
      );
      return;
    }

    // Check if origin is in allowed list
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
  credentials: true, // Allow cookies if needed
  optionsSuccessStatus: 200,
};

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 200,
  message: "Too many requests, please try again later.",
  // standardHeaders: true,
  skip: (req) => req.path === "/health", // exclude health checks
});

const healthLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: "Too many requests, please try again later.",
  // standardHeaders: true,
});

app.get("/", (req, res, next) => {
  res.send("The server is running");
});

// app.use("/api", cors(corsOption));
app.use(limiter);
app.use(express.json());
app.use(compression());

app.get("/health", healthLimit, serverHealth);

app.use(limiter);
app.use(express.json());
app.use(compression());

app.get("/health", healthLimit, serverHealth);

app.use("/api/jobs", source, jobsRouter);
app.use("/api/stat", jobsStat);
app.use("/api/email", emailRouter);
app.use("/api/scrape", scrapeRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  // Handle CORS errors
  if (err.message.includes("Origin") && err.message.includes("not allowed")) {
    return res.status(403).json({
      status: 0,
      message: "CORS Error: Origin not allowed",
      error: "Access denied by CORS policy",
    });
  }

  const message = err.message || "Internal Server Error";
  res.status(500).json({ status: 0, message });
});

// Initialize db connection before starting the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`The server is running.`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
  });
