const { CronJob } = require("cron");

const { sendJobAlert } = require("../controller/email-controller");
const { getLocalTime } = require("../utils/local-time");

const jobAlertSchedule = new CronJob(
  "0 20 * * *",
  async () => {
    console.log("Start sending job alert to mailing list at ", getLocalTime());
    await sendJobAlert();
    console.log("Finished sending job alert at ", getLocalTime());
  },
  null,
  false,
  "Asia/Dhaka"
);

module.exports = {
  jobAlertSchedule,
};
