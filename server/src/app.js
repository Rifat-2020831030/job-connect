const express = require("express");
const spider = require("../spider-runner");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const {connectDB} = require("./db/database");
const dotenv = require("dotenv");
dotenv.config();

const jobsRouter = require("./routers/jobs");
const jobsStat = require('./routers/stat');
const emailRouter = require("./routers/email");

const app = express();
const PORT = process.env.PORT || 3000;

const corsOption = {
  origin: process.env.origin,
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

app.get("/", (req, res, next) => {
  res.send("The server is running");
});

app.use("/api/jobs", jobsRouter);
app.use("/api/stat", jobsStat);
app.use("/api/email", emailRouter);

app.listen(PORT, () => {
  connectDB();
  console.log(`The server is running on: ${process.env.origin}:${PORT}`);
  spider.start();
});
