import { getDB } from "../db/database.js";
import { ObjectId } from "mongodb";

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

const incrementJobClick = async (req, res) => {
  try {
    const { jobID } = req.query;
    if (!jobID || jobID.length !== 24) {
      return res.status(400).json({ status: 0, message: "Invalid job ID" });
    }

    const db = await getDB();
    Promise.all([
      db.collection("jobs").updateOne(
      { _id: new ObjectId(jobID) },
      { $inc: { clicks: 1 } }
    ),
      db.collection("job_click_stats").insertOne({
        jobID: new ObjectId(jobID),
        userID: req.user ? new ObjectId(req.user._id) : null, 
        clickedAt: new Date().toISOString(),
      }),
    ])

    res.status(200).json({ status: 1, message: "Click registered" });
  } catch (error) {
    console.error("Error registering job click:", error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};

export { getJobStats, incrementJobClick };
