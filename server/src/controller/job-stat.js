import { getDB } from "../db/database.js";

const getJobStats = async (req, res) => {
  try {
    const db = await getDB();
    const stats = await db.collection("cache").findOne({ _id: "site_stats" });

    if (!stats) {
      // Fallback if cron hasn't run yet
      return res.status(200).json({
        status: 1,
        message: "Default job stats",
        data: {
          totalJobs: 0,
          totalCompanies: 0,
          subscribersCount: 0,
          uniqueLocations: 0,
          newRolesAdded: 0,
        },
      });
    }

    // Remove _id for client
    delete stats._id;

    res.status(200).json({
      status: 1,
      message: "Job stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching job stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { getJobStats };
