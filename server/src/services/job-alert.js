import { CronJob } from "cron";

import { sendJobAlert } from "../controller/email-controller.js";
import { getLocalTime } from "../utils/local-time.js";
import { logger } from "../utils/logger.js";

const jobAlertSchedule = new CronJob(
  "0 20 * * *",
  async () => {
    logger.info({ time: getLocalTime() }, "Start sending job alert to mailing list");
    try {
      await sendJobAlert();
      logger.info({ time: getLocalTime() }, "Finished sending job alert");
    } catch (error) {
      logger.error({ error }, "Cron job alert failed");
    }
  },
  null,
  false,
  "Asia/Dhaka"
);

export {
  jobAlertSchedule,
};
