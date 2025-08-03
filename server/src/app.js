const express = require("express");
const cors = require("cors");
const compression = require("compression");
const { rateLimit } = require("express-rate-limit");
const { connectDB } = require("./db/database");
const dotenv = require("dotenv");
dotenv.config();

const jobsRouter = require("./routers/jobs");
const jobsStat = require("./routers/stat");
const emailRouter = require("./routers/email");
const scrapeRouter = require("./routers/scrape");
const { jobSearcherCron } = require("../spider-runner");
const { jobAlertSchedule } = require("./services/job-alert");
const serverHealth = require("./controller/server-health");

const app = express();
const PORT = process.env.PORT || 3000;

// Start the scheduled cron job
jobSearcherCron.start();
jobAlertSchedule.start();

const corsOption = {
  origin: [process.env.origin],
  method: ["GET", "POST"],
};

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 200,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
});

app.use(cors(corsOption));
app.use(limiter);
app.use(express.json());
app.use(compression());

app.get("/", (req, res, next) => {
  res.send("The server is running");
});

app.get("/health", serverHealth);

app.use("/api/jobs", jobsRouter);
app.use("/api/stat", jobsStat);
app.use("/api/email", emailRouter);
app.use("/api/scrape", scrapeRouter);

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
