import { getDB } from "../../db/database.js";
import { logger } from "../../utils/logger.js";
import { activeJobsFilter, VALID_CATEGORIES } from "./shared.js";

// GET /api/jobs/categories
// Live counts of active jobs by category
export const getCategories = async (req, res) => {
  try {
    const db = await getDB();
    const categoryLabels = {
      web: "Web",
      "ai/ml": "AI/ML",
      "data science": "Data Science",
      devops: "DevOps",
      mobile: "Mobile",
      security: "Security",
      design: "Design",
      PM: "PM",
      other: "Other",
    };

    const pipeline = [
      {
        $match: {
          ...activeJobsFilter(),
          category: { $in: [...VALID_CATEGORIES] },
        },
      },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await db.collection("jobs").aggregate(pipeline).toArray();

    // Build a lookup from aggregation results
    const countMap = new Map(results.map(({ _id, count }) => [_id, count]));

    // Always return ALL valid categories, even those with 0 active jobs
    const data = [...VALID_CATEGORIES].map((cat) => ({
      category: cat,
      label: categoryLabels[cat] || cat,
      count: countMap.get(cat) || 0,
    }));

    // Sort by count descending, then alphabetically for ties
    data.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    return res.status(200).json({ status: 1, data });
  } catch (error) {
    logger.error({ error }, "getCategories error");
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
