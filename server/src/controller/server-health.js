import { getDB } from "../db/database.js";
import { getLocalTime } from "../utils/local-time.js";

const serverHealth = async (_, res) => {
  try {
    const db = await getDB();
    if (!db)
      return res.status(503).json({
        status: 0,
        message: "Database instance not available",
        timestamp: getLocalTime(),
      });
    const serverStatus = await db.command({ ping: 1 });
    if (serverStatus.ok !== 1) {
      return res.status(500).json({
        status: 0,
        message: "Database ping failed",
        timestamp: getLocalTime(),
      });
    }

    const healthCheck = {
      status: 1,
      message: "Server is healthy",
      timestamp: getLocalTime(),
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    console.error("Error checking server health:", error);
    return res
      .status(503)
      .json({
        status: 0,
        message: "Error: " + error.message,
        timestamp: getLocalTime(),
      });
  }
};

export default serverHealth;
