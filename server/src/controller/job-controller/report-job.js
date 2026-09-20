import DOMPurify from "isomorphic-dompurify";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDB } from "../../db/database.js";
import { logger } from "../../utils/logger.js";

const reportJobSchema = z.object({
  issue_field: z.enum([
    "title",
    "salary",
    "experience",
    "deadline",
    "link",
    "vacancy",
    "category",
    "other",
  ]),
  suggested_info: z.string().max(1000).optional(),
});

// POST /api/jobs/:id/report
export const reportJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ status: 0, message: "Invalid job ID" });
    }

    // Validate request body
    const parseResult = reportJobSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        status: 0,
        message: "Invalid input",
        errors: parseResult.error.errors,
      });
    }

    const { issue_field, suggested_info } = parseResult.data;

    // Sanitize optional suggested_info
    let sanitized_info = "";
    if (suggested_info) {
      sanitized_info = DOMPurify.sanitize(suggested_info);
    }

    const db = await getDB();

    // Check if job exists
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(id) });
    if (!job) {
      return res.status(404).json({ status: 0, message: "Job not found" });
    }

    const reportDoc = {
      job_id: new ObjectId(id),
      issue_field,
      suggested_info: sanitized_info,
      status: "pending",
      created_at: new Date(),
    };

    // If you add authentication later, you can attach user_id here.
    // if (req.user) { reportDoc.user_id = new ObjectId(req.user._id); }

    const result = await db.collection("flag_jobs").insertOne(reportDoc);

    return res.status(201).json({
      status: 1,
      message: "Job reported successfully",
      data: { reportId: result.insertedId },
    });
  } catch (error) {
    logger.error({ error }, "reportJob error");
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
