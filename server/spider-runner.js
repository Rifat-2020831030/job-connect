import { spawn } from "child_process";
import { CronJob } from "cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mailer from "./src/services/mail-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRAPER_DIR = path.join(__dirname, "job-searcher");
const LOG_FILE = path.join(SCRAPER_DIR, "spider_runner.log");

// Configure the cron job schedule
const jobSearcherCron = new CronJob(
  // "0 0-23/4 * * *", // Run every 4 hours
  "0 3,10,14,20 * * *", // Run at specific hours
  // "48 0 * * *", // Run daily at 12:12 PM
  async () => {
    try {
      await runScraper();
    } catch (error) {
      console.error("Error in cron job:", error);
      await mailer(
        "hasan1096@protonmail.com",
        "Job Searcher Error",
        `The job searcher script encountered an error: ${
          error.message
        }\nServer Time: ${new Date().toLocaleString()}`
      );
    }
  },
  null,
  false,
  "Asia/Dhaka"
);

export {
  jobSearcherCron,
};
