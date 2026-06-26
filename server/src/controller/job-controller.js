import { ObjectId } from "mongodb";
import { getDB } from "../db/database.js";

const getJobs = async (req, res) => {
  try {
    const db = await getDB();

    const { page = 1, limit } = req.query;
    const offset = (page - 1) * limit;

    const currentDate = new Date();
    const thirtyDaysAgo = new Date(
      currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
    );

    // Filter:
    // 1. Jobs with a future deadline
    // 2. Jobs with null deadline, but first_seen within last 30 days
    const filter = {
      $or: [
        { deadline: { $ne: null, $gte: currentDate.toISOString() } },
        { deadline: null, first_seen: { $gte: thirtyDaysAgo.toISOString() } },
      ],
    };

    const [jobs, totalJobs] = await Promise.all([
      db
        .collection("jobs")
        .find(filter)
        .skip(Number(offset))
        .limit(Number(limit))
        .toArray(),
      db.collection("jobs").countDocuments(filter),
    ]);

    res.status(200).json({
      status: 1,
      message: "Jobs fetched successfully",
      total: totalJobs,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getJobById = async (req, res) => {
  try {
    const db = await getDB();
    const jobId = req.params.id;

    const job = await db
      .collection("jobs")
      .findOne({ _id: new ObjectId(jobId) });

    if (!job) {
      return res.status(404).json({ status: 0, message: "Job not found" });
    }

    res.status(200).json({
      status: 1,
      message: "Job fetched successfully",
      data: job,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { getJobById, getJobs };
