import { CronJob } from "cron";

import { sendJobAlert } from "../controller/email-controller.js";

const jobAlertSchedule = new CronJob(
  "0 0-23/4 * * *",
  async () => {
    console.log("Start sending job alert to mailing list at ", new Date().toISOString());
    await sendJobAlert()
    console.log("Finished sending job alert at ", new Date().toISOString());
  },
  null,
  false,
  "UTC+6"
);

export { jobAlertSchedule };
