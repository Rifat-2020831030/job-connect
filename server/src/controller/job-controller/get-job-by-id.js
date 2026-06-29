import { ObjectId } from "mongodb";
import { getDB } from "../../db/database.js";
import { DETAIL_PROJECTION } from "./shared.js";

// GET /api/jobs/:id
// Job details by ID
export const getJobById = async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ status: 0, message: "Invalid job ID" });
    }

    const job = await db
      .collection("jobs")
      .findOne({ _id: new ObjectId(id) }, { projection: DETAIL_PROJECTION });

    if (!job) {
      return res.status(404).json({ status: 0, message: "Job not found" });
    }

    return res.status(200).json({ status: 1, data: job });
  } catch (error) {
    console.error("getJobById error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
