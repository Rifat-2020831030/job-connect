import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { getDB } from "../db/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runScraper = () => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "../../job-searcher/script-runner.py"
    );
    const pythonProcess = spawn("python", [scriptPath]);

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
};

export const getLastScrapeTime = async (req, res) => {
  try {
    const db = await getDB();
    const lastScrape = await db.collection("scraper-log").findOne({'run_status': 'success'}, { sort: { timestamp: -1 } });
    if(!lastScrape) {
      return res.status(404).json({status: 0, message: "No data found"})
    }
    return res.status(200).json({status: 1, data: lastScrape});
  } catch (error) {
    console.log("An error occured while fething last scraping time. Error: ", error)
  }
}
