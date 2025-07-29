const { CronJob } = require("cron");
const { spawn } = require("child_process");
const path = require("path");
const { cwd } = require("process");

const SCRAPER_DIR = path.join(__dirname, "jobsearcher");

const spiderList = [
  "dsi_job_searcher",
  "optimizely_job_searcher",
  "bs23_job_searcher",
];

const jobSearcherCron = new CronJob(
  "* 0-23/12 * * *", // cronTime
  () => {
    runAllSpider(spiderList);
  },
  null, // onComplete
  false, // start
  "UTC+6" // timeZone
);

const runAllSpider = (spiderList) => {
  console.log(`[CRON] Starting spiders at ${new Date().toISOString()}`);

  spiderList.forEach((spider) => {
    runSpider(spider);
  });
};

const runSpider = (spiderName) => {
  console.log(`Starting spider: ${spiderName}`);

  // Command to activate venv and run scrapy
  //   const command = `venv\\Scripts\\activate.bat && scrapy crawl ${spiderName}`;

  const pythonProcess = spawn("scrapy", ["crawl", spiderName], {
    cwd: SCRAPER_DIR, // working directory
    stdio: ["pipe", "pipe", "pipe"], // Enable stdout/stderr capture
  });

  pythonProcess.stdout.on("data", (data) => {
    console.log(`[${spiderName}] stdout: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`[${spiderName}] stderr: ${data}`);
  });

  pythonProcess.on("error", (error) => {
    console.error(`[${spiderName}] Error: ${error.message}`);
  });

  pythonProcess.on("exit", (code) => {
    if (code === 0) {
      console.log(`[${spiderName}] completed successfully`);
    } else {
      console.error(`[${spiderName}] exited with code ${code}`);
    }
  });
};


module.exports = jobSearcherCron;
