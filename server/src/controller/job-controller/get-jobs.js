import { getDB } from "../../db/database.js";
import {
  activeJobsFilter,
  escapeRegex,
  LIST_PROJECTION,
  VALID_CATEGORIES,
  VALID_EXPERIENCE_LEVELS,
  VALID_JOB_TYPES,
  VALID_SORTS,
} from "./shared.js";

// GET /api/jobs
// Main job list with filtering, searching, and pagination
export const getJobs = async (req, res) => {
  try {
    const db = await getDB();
    const {
      page = 1,
      limit = 10,
      category,
      experience_level,
      job_type,
      company,
      salary_min,
      salary_max,
      sort = "recent",
      q,
      location,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const andClauses = [activeJobsFilter()];

    if (category) {
      const cats = category
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter((c) => VALID_CATEGORIES.has(c));
      if (cats.length) andClauses.push({ category: { $in: cats } });
    }

    if (experience_level) {
      const levels = experience_level
        .split(",")
        .map((l) => l.trim())
        .filter((l) => VALID_EXPERIENCE_LEVELS.has(l));
      if (levels.length) andClauses.push({ experience_level: { $in: levels } });
    }

    if (job_type) {
      const types = job_type
        .split(",")
        .map((t) => t.trim())
        .filter((t) => VALID_JOB_TYPES.has(t));
      if (types.length) andClauses.push({ job_type: { $in: types } });
    }

    if (company) {
      const companies = company
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (companies.length) {
        andClauses.push({
          company: {
            $in: companies.map((c) => new RegExp(`^${escapeRegex(c)}$`, "i")),
          },
        });
      }
    }

    if (salary_min) {
      const min = parseInt(salary_min, 10);
      if (!isNaN(min)) andClauses.push({ salary_min: { $gte: min } });
    }
    if (salary_max) {
      const max = parseInt(salary_max, 10);
      if (!isNaN(max)) andClauses.push({ salary_max: { $lte: max } });
    }

    if (q && q.trim()) {
      andClauses.push({ title: new RegExp(escapeRegex(q.trim()), "i") });
    }

    if (location && location.trim()) {
      andClauses.push({
        location: new RegExp(escapeRegex(location.trim()), "i"),
      });
    }

    const filter =
      andClauses.length === 1 ? andClauses[0] : { $and: andClauses };
    const sortObj =
      VALID_SORTS.has(sort) && sort === "salary_high"
        ? { salary_max: -1, first_seen: -1 }
        : { first_seen: -1 };

    const [jobs, total] = await Promise.all([
      db
        .collection("jobs")
        .find(filter, { projection: LIST_PROJECTION })
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection("jobs").countDocuments(filter),
    ]);

    return res.status(200).json({
      status: 1,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      data: jobs,
    });
  } catch (error) {
    console.error("getJobs error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
