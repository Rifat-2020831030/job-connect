import { getDB } from "../../db/database.js";
import { logger } from "../../utils/logger.js";
import { CATEGORY_LABELS, VALID_CATEGORIES, VALID_EXPERIENCE_LEVELS, VALID_JOB_TYPES } from "./shared.js";

// GET /api/jobs/filter-options
// Valid filter options and all companies
export const getFilterOptions = async (req, res) => {
  try {
    const db = await getDB();

    const companyResults = await db.collection("jobs").aggregate([
      { $match: { company: { $type: "string", $ne: "" } } },
      { $group: { _id: "$company" } },
      { $sort: { _id: 1 } },
    ]).toArray();

    return res.status(200).json({
      status: 1,
      data: {
        categories: [...VALID_CATEGORIES].map(value => ({ value, label: CATEGORY_LABELS[value] || value })),
        experienceLevels: [...VALID_EXPERIENCE_LEVELS].map(value => ({ value })),
        jobTypes: [...VALID_JOB_TYPES].map(value => ({ value })),
        topCompanies: companyResults.map(({ _id }) => ({ value: _id })),
      },
    });
  } catch (error) {
    logger.error({ error }, "getFilterOptions error");
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
