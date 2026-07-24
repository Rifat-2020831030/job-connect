import { getDB } from "../db/database.js";
import { logger } from "../utils/logger.js";

const getCompanies = async (req, res) => {
  try {
    const db = await getDB();
    const response = await db.collection("jobs").find({}).toArray();
    // Extract unique companies from the jobs
    const companies = [...new Set(response.map((job) => job.company))].sort();
    if (companies.length === 0) {
      return res.status(404).json({ status: 0, message: "No companies found" });
    }
    res.status(200).json({
      status: 1,
      message: "Companies fetched successfully",
      data: companies,
    });
  } catch (error) {
    logger.error({ error }, "Error fetching companies");
    res.status(500).json({ error: "Error when fetching company list" });
  }
};

export {
  getCompanies,
};
