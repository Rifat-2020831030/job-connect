const { getDB } = require("../db/database.js");

const serverHealth = async (_, res) => {
  try {
    const db = await getDB();
    if (!db)
      return res.status(503).json({
        status: 0,
        message: "Database instance not available",
        timestamp: new Date().toISOString()
      });
    const serverStatus = await db.command({ ping: 1 });
    if (serverStatus.ok !== 1) {
      return res
        .status(500)
        .json({
          status: 0,
          message: "Database ping failed",
          timestamp: new Date().toISOString()
        });
    }

    const healthCheck = {
      status: 1,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    console.error("Error checking server health:", error);
    return res
      .status(503)
      .json({ status: 0, message: 'Error: '+error.message, timestamp: new Date().toISOString() });
  }
};

module.exports = serverHealth;
