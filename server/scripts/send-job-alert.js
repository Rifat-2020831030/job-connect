const dotenv = require("dotenv");

const { closeDB, connectDB } = require("../src/db/database");
const { sendJobAlert } = require("../src/controller/email-controller");

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
