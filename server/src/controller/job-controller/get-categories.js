import { getDB } from "../../db/database.js";
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
    const data = results.map(({ _id, count }) => ({
      category: _id,
      label: categoryLabels[_id] || _id,
      count,
    }));

    return res.status(200).json({ status: 1, data });
  } catch (error) {
    console.error("getCategories error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
