// import { runScraper } from "../services/scraper-runner.js"; // spider-runner exporting correctly isn't checked
import dotenv from "dotenv";
import express from "express";
import { runScraper } from "../services/scraper-runner.js";
import { logger } from "../utils/logger.js";
dotenv.config();
const router = express.Router();

const auth = (req, res, next) => {
  const token = req.query.token;
  const authHeader = req.get("authorization");
  const expectedCronAuth = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : null;
  const tokenAuthorized =
    process.env.SCRAPE_TOKEN && token === process.env.SCRAPE_TOKEN;
  const cronAuthorized = expectedCronAuth && authHeader === expectedCronAuth;

  if (!tokenAuthorized && !cronAuthorized) {
    return res.status(403).json({ message: "Unauthorized request" });
  }
  next();
};

router.get("/", auth, async (req, res) => {
  try {
    logger.info("Starting scrape process...");
    const output = await runScraper();
    logger.info("Scrape process completed successfully.");
    res
      .status(200)
      .json({ message: "Scraping completed successfully", data: output });
  } catch (error) {
    if (error.code === "SCRAPER_ALREADY_RUNNING") {
      return res.status(409).json({ message: "Scraper is already running" });
    }

    logger.error({ error }, "Error running scraper");
    res
      .status(500)
      .json({ message: "Error running scraper", error: error.message });
  }
});

export default router;
