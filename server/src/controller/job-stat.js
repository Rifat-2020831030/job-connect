import { getDB } from "../db/database.js";

export const getJobStats = async (req, res) => {
  try {
    const db = getDB();
    const stats = await db.collection("jobs").aggregate([
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          totalCompanies: { $addToSet: "$company" },
          totalLocations: { $addToSet: "$location" },
        },
      },
      {
        $project: {
          _id: 0,
          totalJobs: 1,
          totalCompanies: { $size: "$totalCompanies" },
          totalLocations: { $size: "$totalLocations" },
        },
      },
    ]).toArray();

    if (stats.length === 0) {
      return res.status(404).json({ status: 0, message: "No job stats found" });
    }

    res.status(200).json({
      status: 1,
      message: "Job stats fetched successfully",
      data: stats[0],
    });
  } catch (error) {
    console.error("Error fetching job stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}