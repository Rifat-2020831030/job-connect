import { ObjectId } from "mongodb";
import { getDB } from "../../db/database.js";
import {
  hasDeadlineFilter,
  LIST_PROJECTION,
  pickUniqueByCompany,
} from "./shared.js";

// GET /api/jobs/featured
// Curated jobs for homepage sections
export const getFeaturedJobs = async (req, res) => {
  try {
    const db = await getDB();
    const { section = "featured" } = req.query;
    const BASE = hasDeadlineFilter();
    const N = 3;
    let jobs = [];

    if (section === "featured") {
      const filter = {
        ...BASE,
        salary_max: { $ne: null, $exists: true, $gt: 0 },
      };
      jobs = await db
        .collection("jobs")
        .find(filter, { projection: LIST_PROJECTION })
        .sort({ salary_max: -1 })
        .limit(N)
        .toArray();
      if (jobs.length < N) {
        const existing = new Set(jobs.map((j) => j._id.toString()));
        const fallback = await db
          .collection("jobs")
          .find(
            {
              ...BASE,
              _id: { $nin: [...existing].map((id) => new ObjectId(id)) },
            },
            { projection: LIST_PROJECTION }
          )
          .sort({ first_seen: -1 })
          .limit(N - jobs.length)
          .toArray();
        jobs = [...jobs, ...fallback];
      }
    } else if (section === "engineering") {
      const filter = {
        ...BASE,
        category: { $in: ["web", "devops", "mobile", "security", "ai/ml"] },
      };
      const candidates = await db
        .collection("jobs")
        .find(filter, { projection: LIST_PROJECTION })
        .sort({ salary_max: -1, first_seen: -1 })
        .limit(30)
        .toArray();
      jobs = pickUniqueByCompany(candidates, N);
    } else if (section === "leadership") {
      const filter = {
        ...BASE,
        $or: [
          { category: "PM" },
          {
            experience_level: { $in: ["Senior", "Mid"] },
            category: {
              $nin: ["web", "devops", "mobile", "security", "ai/ml"],
            },
          },
        ],
      };
      const candidates = await db
        .collection("jobs")
        .find(filter, { projection: LIST_PROJECTION })
        .sort({ salary_max: -1, first_seen: -1 })
        .limit(30)
        .toArray();
      jobs = pickUniqueByCompany(candidates, N);

      if (jobs.length < N) {
        const existing = new Set(jobs.map((j) => j._id.toString()));
        const fallback = await db
          .collection("jobs")
          .find(
            {
              ...BASE,
              _id: { $nin: [...existing].map((id) => new ObjectId(id)) },
            },
            { projection: LIST_PROJECTION }
          )
          .sort({ first_seen: -1 })
          .limit(50)
          .toArray();
        const additional = pickUniqueByCompany(
          fallback.filter((j) => !existing.has(j._id.toString())),
          N - jobs.length
        );
        jobs = [...jobs, ...additional];
      }
    } else {
      return res.status(400).json({
        status: 0,
        message: "Invalid section. Use: featured | engineering | leadership",
      });
    }

    return res.status(200).json({ status: 1, data: jobs });
  } catch (error) {
    console.error("getFeaturedJobs error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
