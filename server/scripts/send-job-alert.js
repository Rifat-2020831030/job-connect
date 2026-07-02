import dotenv from "dotenv";

import { closeDB } from "../src/db/database.js";
import { sendJobAlert } from "../services/alert-service/jobAlert.js";

dotenv.config();

const run = async () => {
  try {
    const timeSet = process.argv[2];
    if (!timeSet || !["Morning", "Evening", "Night"].includes(timeSet)) {
      throw new Error(`Invalid timeSet provided: ${timeSet}. Must be Morning, Evening, or Night.`);
    }

    console.log(`Starting automated job alert dispatch for phase: ${timeSet}`);
    const result = await sendJobAlert(timeSet);
    console.log(`Job alert run completed for ${timeSet}:`, result);
  } catch (error) {
    console.error("Job alert run failed:", error);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
};

run();
