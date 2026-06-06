import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../..");
const scraperDir = path.join(projectRoot, "job-searcher");
const scraperScript = path.join(scraperDir, "_run_spiders.py");
const pythonExecutable =
  process.env.SCRAPER_PYTHON || process.env.PYTHON_EXECUTABLE || "python3";

let activeRun = null;

const runScraper = () => {
  if (activeRun) {
    const error = new Error("Scraper is already running");
    error.code = "SCRAPER_ALREADY_RUNNING";
    return Promise.reject(error);
  }

  activeRun = new Promise((resolve, reject) => {
    const pythonProcess = spawn(pythonExecutable, [scraperScript], {
      cwd: scraperDir,
      env: process.env,
    });

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("error", (error) => {
      activeRun = null;
      reject(error);
    });

    pythonProcess.on("close", (code) => {
      activeRun = null;

      if (code !== 0) {
        const error = new Error(
          `Scraper exited with code ${code}: ${errorOutput || output}`
        );
        error.code = "SCRAPER_FAILED";
        error.stdout = output;
        error.stderr = errorOutput;
        reject(error);
        return;
      }

      resolve(output);
    });
  });

  return activeRun;
};

export { runScraper, scraperDir, scraperScript };
