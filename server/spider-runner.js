const { CronJob } = require("cron");
const mailer = require("./src/services/mail-service");
const { runScraper } = require("./src/services/scraper-runner");

const jobSearcherCron = new CronJob(
  "0 0-23/4 * * *",
  async () => {
    try {
      console.log("Starting job searcher script...");
      await mailer(
        "hasan1096@protonmail.com",
        "Job Searcher Script Started",
        `The job searcher script has started running. Server Time: ${new Date().toLocaleString()}`
      );
      await runScraper();
    } catch (error) {
      console.error("Job searcher script failed:", error);
    }
  },
  null,
  false,
  "Asia/Dhaka"
);

module.exports = {
  jobSearcherCron,
};
