import { CronJob } from "cron";

import { sendJobAlert } from "../controller/email-controller.js";
import { getLocalTime } from "../utils/local-time.js";

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

export {
  jobAlertSchedule,
};
