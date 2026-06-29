import { ObjectId } from "mongodb";
import { getDB } from "../db/database.js";

// Valid enum values from DB
const VALID_CATEGORIES = ["web", "ai/ml", "data science", "devops", "mobile", "security", "design", "PM", "other"];
const VALID_WORK_MODELS = ["Remote", "Onsite", "Hybrid"];
const VALID_ALERT_TIMINGS = ["Morning", "Evening", "Night"];

// ─── GET /api/users/:id/preferences ─────────────────────────────────────────
export const getPreferences = async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ status: 0, message: "Invalid user ID" });
    }

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { preferences: 1 } });

    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    return res.status(200).json({ status: 1, data: user.preferences });
  } catch (error) {
    console.error("getPreferences error:", error);
    return res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};

// ─── POST /api/users/:id/preferences ────────────────────────────────────────
export const savePreferences = async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { categories = [], workModel = [], alertTiming } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ status: 0, message: "Invalid user ID" });
    }

    // Validate
    const invalidCats = categories.filter((c) => !VALID_CATEGORIES.includes(c));
    if (invalidCats.length) {
      return res.status(400).json({ status: 0, message: `Invalid categories: ${invalidCats.join(", ")}` });
    }
    const invalidModels = workModel.filter((m) => !VALID_WORK_MODELS.includes(m));
    if (invalidModels.length) {
      return res.status(400).json({ status: 0, message: `Invalid work models: ${invalidModels.join(", ")}` });
    }
    if (alertTiming && !VALID_ALERT_TIMINGS.includes(alertTiming)) {
      return res.status(400).json({ status: 0, message: `Invalid alertTiming. Must be one of: ${VALID_ALERT_TIMINGS.join(", ")}` });
    }

    const preferences = {
      categories,
      workModel,
      alertTiming: alertTiming || "Morning",
    };

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { preferences, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    return res.status(200).json({ status: 1, message: "Preferences saved", data: preferences });
  } catch (error) {
    console.error("savePreferences error:", error);
    return res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};

// ─── GET /api/users/:id/saved-jobs ──────────────────────────────────────────
export const getSavedJobs = async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ status: 0, message: "Invalid user ID" });
    }

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { savedJobs: 1 } });

    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    const savedJobIds = (user.savedJobs || []).map((id) => new ObjectId(id));

    const jobs = savedJobIds.length
      ? await db
          .collection("jobs")
          .find(
            { _id: { $in: savedJobIds } },
            {
              projection: {
                title: 1, company: 1, logo: 1, location: 1, salary: 1,
                salary_min: 1, salary_max: 1, experience_level: 1,
                job_type: 1, skills: 1, deadline: 1, category: 1,
              },
            }
          )
          .toArray()
      : [];

    return res.status(200).json({ status: 1, data: jobs });
  } catch (error) {
    console.error("getSavedJobs error:", error);
    return res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};

// ─── POST /api/users/:id/saved-jobs ─────────────────────────────────────────
export const saveJob = async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { jobId } = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(jobId)) {
      return res.status(400).json({ status: 0, message: "Invalid user ID or job ID" });
    }

    // Verify job exists
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) }, { projection: { _id: 1 } });
    if (!job) {
      return res.status(404).json({ status: 0, message: "Job not found" });
    }

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { savedJobs: 1 } });

    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    const alreadySaved = (user.savedJobs || []).some((j) => j.toString() === jobId);
    if (alreadySaved) {
      return res.status(409).json({ status: 0, message: "Job already saved" });
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { savedJobs: new ObjectId(jobId) },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    const updated = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { savedJobs: 1 } });

    return res.status(200).json({
      status: 1,
      message: "Job saved",
      data: { savedJobs: updated.savedJobs.map((j) => j.toString()) },
    });
  } catch (error) {
    console.error("saveJob error:", error);
    return res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};

// ─── DELETE /api/users/:id/saved-jobs/:jobId ─────────────────────────────────
export const removeSavedJob = async (req, res) => {
  try {
    const db = await getDB();
    const { id, jobId } = req.params;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(jobId)) {
      return res.status(400).json({ status: 0, message: "Invalid user ID or job ID" });
    }

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { savedJobs: 1 } });

    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    const wasSaved = (user.savedJobs || []).some((j) => j.toString() === jobId);
    if (!wasSaved) {
      return res.status(404).json({ status: 0, message: "Job not in saved list" });
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: { savedJobs: new ObjectId(jobId) },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    return res.status(200).json({ status: 1, message: "Job removed from saved list" });
  } catch (error) {
    console.error("removeSavedJob error:", error);
    return res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};
