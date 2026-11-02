import { getDB } from "../../db/database.js";
import { logger } from "../../utils/logger.js";
import {
  hasDeadlineFilter,
  LIST_PROJECTION,
  pickUniqueByCompany,
} from "./shared.js";

/**
 * Selects up to `n` jobs prioritizing unique companies first.
 * If fewer than `n` unique companies exist among candidates, backfills
 * remaining slots with the next freshest candidates.
 */
function pickUniqueWithBackfill(candidates, n) {
  const primary = pickUniqueByCompany(candidates, n);
  if (primary.length >= n) return primary;

  const existing = new Set(primary.map((j) => j._id?.toString()));
  const result = [...primary];
  for (const job of candidates) {
    if (result.length >= n) break;
    const id = job._id?.toString();
    if (id && !existing.has(id)) {
      result.push(job);
      existing.add(id);
    }
  }
  return result;
}

// GET /api/jobs/featured
// Curated jobs for homepage sections (freshness-based)
export const getFeaturedJobs = async (req, res) => {
  try {
    const db = await getDB();
    const { section = "featured" } = req.query;
    const BASE = hasDeadlineFilter();
    const N = 3;
    let jobs = [];

    if (section === "featured") {
      const candidates = await db
        .collection("jobs")
        .find(BASE, { projection: LIST_PROJECTION })
        .sort({ first_seen: -1 })
        .limit(30)
        .toArray();
      jobs = pickUniqueWithBackfill(candidates, N);
    } else if (section === "engineering") {
      const filter = {
        ...BASE,
        category: { $in: ["web", "devops", "mobile", "security", "ai/ml"] },
      };
      const candidates = await db
        .collection("jobs")
        .find(filter, { projection: LIST_PROJECTION })
        .sort({ first_seen: -1 })
        .limit(30)
        .toArray();
      jobs = pickUniqueWithBackfill(candidates, N);
    } else if (section === "leadership") {
      const filter = {
        ...BASE,
        category: { $in: ["PM", "pm"] },
      };
      const candidates = await db
        .collection("jobs")
        .find(filter, { projection: LIST_PROJECTION })
        .sort({ first_seen: -1 })
        .limit(30)
        .toArray();
      jobs = pickUniqueWithBackfill(candidates, N);
    } else {
      return res.status(400).json({
        status: 0,
        message: "Invalid section. Use: featured | engineering | leadership",
      });
    }

    return res.status(200).json({ status: 1, data: jobs });
  } catch (error) {
    logger.error({ error }, "getFeaturedJobs error");
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
