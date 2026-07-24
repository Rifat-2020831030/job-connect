import { getDB } from "../../db/database.js";
import { logger } from "../../utils/logger.js";
import { escapeRegex } from "./shared.js";

// GET /api/jobs/location-suggestions
// Location string autocomplete
export const getLocationSuggestions = async (req, res) => {
  try {
    const db = await getDB();
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({ status: 1, data: [] });
    }

    const regex = new RegExp(escapeRegex(q.trim()), "i");
    const results = await db
      .collection("jobs")
      .aggregate([
        { $match: { location: { $regex: regex } } },
        { $group: { _id: "$location" } },
        { $match: { _id: { $ne: null, $ne: "" } } },
        { $limit: 4 },
        { $project: { _id: 0, location: "$_id" } },
      ])
      .toArray();

    return res.status(200).json({
      status: 1,
      data: results.map((r) => r.location),
    });
  } catch (error) {
    logger.error({ error }, "getLocationSuggestions error");
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
