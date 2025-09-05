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
  null, // onComplete
  false, // start
  "UTC+6" // timeZone
);

// Determine the Python executable path based on the environment
const getPythonExecutable = () => {
  // Check if we're in a production environment 
  if (process.env.NODE_ENV === "production") {
    return "python3";
  }

  // For local development, try to use python3 first, fall back to python
  try {
    // Check if python3 is available
    spawn("python3", ["-V"]).on("error", () => {
      return "python";
    });
    return "python3";
  } catch (e) {
    return "python";
  }
};

// Function to run the scraper
export const runScraper = async () => {
  console.log("Starting job searcher script...");

  // Send start notification email
  await mailer(
    "hasan1096@protonmail.com",
    `Job Searcher Script Started at ${new Date().toLocaleString()}`,
    `The job searcher script has started running. Server Time: ${new Date().toLocaleString()}`
  );
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRAPER_DIR, "script-runner.py");

    // Ensure the script exists
    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Script not found at path: ${scriptPath}`));
    }

    // Get the appropriate Python executable
    const pythonExecutable = getPythonExecutable();

    // Spawn the Python process with improved error handling
    const pythonProcess = spawn(pythonExecutable, [scriptPath], {
      cwd: SCRAPER_DIR,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1", // Ensure Python output is not buffered
      },
    });

    let output = "";
    let errorOutput = "";

    // Capture standard output
    pythonProcess.stdout.on("data", (data) => {
      const chunk = data.toString();
      output += chunk;
      console.log(`[Python stdout]: ${chunk.trim()}`);
    });

    // Capture error output
    pythonProcess.stderr.on("data", (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      console.error(`[Python stderr]: ${chunk.trim()}`);
    });

    // Handle process completion
    pythonProcess.on("close", async (code) => {
      if (code !== 0) {
        const errorMsg = `Script exited with code ${code}: ${errorOutput}`;
        console.error(errorMsg);

        // Read the log file for additional context if available
        try {
          if (fs.existsSync(LOG_FILE)) {
            const logContents = fs.readFileSync(LOG_FILE, "utf8");
            const lastLines = logContents.split("\n").slice(-20).join("\n"); // Get last 20 lines
            console.error("Log file last lines:", lastLines);
          }
        } catch (logErr) {
          console.error("Failed to read log file:", logErr);
        }

        // Send error notification
        await mailer(
          "hasan1096@protonmail.com",
          "Job Searcher Script Failed",
          `The job searcher script failed with code ${code}.\nError: ${errorOutput}\nServer Time: ${new Date().toLocaleString()}`
        );

        reject(new Error(errorMsg));
      } else {
        console.log("Python script completed successfully");

        // Send success notification
        await mailer(
          "hasan1096@protonmail.com",
          `Job Searcher Script Completed at ${new Date().toLocaleString()}`,
          `The job searcher script has completed successfully.\nServer Time: ${new Date().toLocaleString()}`
        );

        resolve(output);
      }
    });

    // Handle process errors (e.g., if Python executable not found)
    pythonProcess.on("error", (err) => {
      console.error("Failed to start Python process:", err);
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
  });
};

export { jobSearcherCron };
