import { getDB } from "../db/database.js";
import { ObjectId } from "mongodb";
import { logger } from "../utils/logger.js";
import { trackVisitor } from "../services/visitor-service.js";

const getJobStats = async (req, res) => {
  try {
    const db = await getDB();
    
    // Fetch stats and unique visitor count in parallel
    const [stats, uniqueVisitorsCount] = await Promise.all([
      db.collection("cache").findOne({ _id: "site_stats" }),
      db.collection("unique_visitors").countDocuments()
    ]);

    let data = stats ? { ...stats } : {
      totalJobs: 0,
      totalCompanies: 0,
      subscribersCount: 0,
      uniqueLocations: 0,
      newRolesAdded: 0,
    };

    if (data._id) {
      delete data._id;
    }

    data.totalUniqueVisitors = uniqueVisitorsCount;

    res.status(200).json({
      status: 1,
      message: "Job stats fetched successfully",
      data,
    });
  } catch (error) {
    logger.error({ error }, "Error fetching job stats");
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
    logger.error({ error }, "Error registering job click");
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};

const registerVisitor = async (req, res) => {
  try {
    // Extract IP address from request headers or socket
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Handle cases where x-forwarded-for contains multiple IPs
    if (typeof ip === 'string' && ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }

    if (!ip) {
      return res.status(400).json({ status: 0, message: "Could not determine IP address" });
    }

    const success = await trackVisitor(ip);
    if (success) {
      return res.status(200).json({ status: 1, message: "Visitor tracked successfully" });
    } else {
      return res.status(500).json({ status: 0, message: "Failed to track visitor" });
    }
  } catch (error) {
    logger.error({ error }, "Error in registerVisitor controller");
    return res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};

export { getJobStats, incrementJobClick, registerVisitor };
