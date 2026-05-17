const { ObjectId } = require("mongodb");
const { getDB } = require("../db/database");

const getJobs = async (req, res) => {
  try {
    const db = await getDB();

    const { page = 1, limit } = req.query; // Default to page 1 and limit 10
    const offset = (page - 1) * limit;

    // Get current date to compare with deadlines
    // const currentDate = new Date();

    const jobs = await db
      .collection("jobs")
      .find({})
      .skip(Number(offset))
      .limit(Number(limit))
      .toArray();
      
    // Filter jobs based on deadline
    const filteredJobs = jobs.filter((job) => {
      if (!job.deadline) return true; // If no deadline, include the job
      const deadlineDate = new Date(job.deadline);
      return deadlineDate >= new Date(); // Include only jobs with future deadlines
    });

    // get jobs count
    // const totalJobs = await db.collection("jobs").countDocuments({});

    // if (jobs.length === 0) {
    //   return res.status(404).json({ status: 0, message: "No jobs found" });
    // }
    res.status(200).json({
      status: 1,
      message: "Jobs fetched successfully",
      total: filteredJobs.length,
      data: filteredJobs,
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

module.exports = {
  getJobById,
  getJobs,
};
