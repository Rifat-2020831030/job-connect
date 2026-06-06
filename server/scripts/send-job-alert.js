import dotenv from "dotenv";

import { closeDB, connectDB } from "../src/db/database.js";
import { sendJobAlert } from "../src/controller/email-controller.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const result = await sendJobAlert();
    console.log("Job alert run completed:", result);
  } catch (error) {
    console.error("Job alert run failed:", error);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
};

run();
