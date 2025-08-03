import { CronJob } from "cron";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import mailer from "./src/services/mail-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRAPER_DIR = path.join(__dirname, "job-searcher");


const jobSearcherCron = new CronJob(
  "0 0-23/4 * * *", // cronTime
  async () => {
    runScraper();
  },
  null, // onComplete
  false, // start
  "UTC+6" // timeZone
);


const runScraper = async () => {
  console.log("Starting job searcher script...");
  await mailer('hasan1096@protonmail.com', 'Job Searcher Script Started', `The job searcher script has started running. Server Time :${new Date().toLocaleString()}`);
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRAPER_DIR, "script-runner.py");
    const pythonProcess = spawn("python", [scriptPath], {
      cwd: SCRAPER_DIR,
    });

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Script exited with code ${code}: ${errorOutput}`));
      } else {
        console.log(output);
        resolve(output);
      }
    });
  });
}

// export the jobser cron job
export { jobSearcherCron };