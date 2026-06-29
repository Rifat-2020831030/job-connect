import { getDB } from "../../db/database.js";
import { VALID_EXPERIENCE_LEVELS, VALID_JOB_TYPES } from "./shared.js";

// GET /api/jobs/filter-options
// Unique filter options and top 20 companies
export const getFilterOptions = async (req, res) => {
  try {
    const db = await getDB();

    const [expResults, typeResults, companyResults] = await Promise.all([
      db
        .collection("jobs")
        .aggregate([
          {
            $match: { experience_level: { $in: [...VALID_EXPERIENCE_LEVELS] } },
          },
          { $group: { _id: "$experience_level", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      db
        .collection("jobs")
        .aggregate([
          { $match: { job_type: { $in: [...VALID_JOB_TYPES] } } },
          { $group: { _id: "$job_type", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      db
        .collection("jobs")
        .aggregate([
          { $match: { company: { $ne: null, $exists: true } } },
          { $group: { _id: "$company", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ])
        .toArray(),
    ]);

    return res.status(200).json({
      status: 1,
      data: {
        experienceLevels: expResults.map(({ _id, count }) => ({
          value: _id,
          count,
        })),
        jobTypes: typeResults.map(({ _id, count }) => ({ value: _id, count })),
        topCompanies: companyResults.map(({ _id, count }) => ({
          value: _id,
          count,
        })),
      },
    });
  } catch (error) {
    console.error("getFilterOptions error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
