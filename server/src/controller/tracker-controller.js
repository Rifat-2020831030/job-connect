import { getDB } from "../db/database.js";
import { ObjectId } from "mongodb";
// Helper to calculate the severity/index of a status for backward direction checks
const STATUS_ORDER = {
  "PENDING_CONFIRMATION": 0,
  "APPLIED": 1,
  "INTERVIEWING": 2,
  "OFFER": 3,
  "REJECTED": 4,
  "EXPIRED": 4
};

export const getTrackedJobs = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const { page = 1, limit = 10, q, status, sort = "createdAt_desc", company } = req.query;

    const query = { userId };

    // Status filter (supports multiple statuses like status=APPLIED,INTERVIEWING)
    if (status) {
      query.status = { $in: status.split(",") };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // We need to fetch job details too (for search and display).
    // Using aggregation pipeline
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails"
        }
      },
      {
        $unwind: {
          path: "$jobDetails",
          preserveNullAndEmptyArrays: false
        }
      }
    ];

    // Search filter
    if (q) {
      pipeline.push({
        $match: {
          $or: [
            { "jobDetails.title": { $regex: q, $options: "i" } },
            { "jobDetails.company": { $regex: q, $options: "i" } }
          ]
        }
      });
    }

    // Company filter (supports multiple companies)
    if (company) {
      pipeline.push({
        $match: {
          "jobDetails.company": { $in: company.split(",") }
        }
      });
    }

    // Sort
    let sortField = "updatedAt";
    if (sort.startsWith("createdAt")) sortField = "createdAt";
    if (sort.startsWith("company")) sortField = "jobDetails.company";
    
    const sortDir = sort.endsWith("asc") ? 1 : -1;
    
    pipeline.push({ $sort: { [sortField]: sortDir, _id: sortDir } });

    // Pagination (Facet for total count)
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }, { $addFields: { page: pageNum } }],
        data: [{ $skip: skip }, { $limit: limitNum }]
      }
    });

    const db = await getDB();
    const result = await db.collection("job_track").aggregate(pipeline).toArray();
    
    const data = result[0].data;
    const metadata = result[0].metadata[0] || { total: 0, page: pageNum };
    const totalPages = Math.ceil(metadata.total / limitNum);

    return res.status(200).json({
      status: 1,
      data,
      pagination: {
        total: metadata.total,
        page: metadata.page,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error("Error in getTrackedJobs:", error);
    return res.status(500).json({ status: 0, message: "Internal server error" });
  }
};

export const addTrackedJob = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const jobId = new ObjectId(req.body.jobId);
    const status = req.body.status || "PENDING_CONFIRMATION";
    const notes = req.body.notes || "";

    const db = await getDB();
    
    // Check if already tracked
    const existing = await db.collection("job_track").findOne({ userId, jobId });
    if (existing) {
      return res.status(400).json({ status: 0, message: "Job is already being tracked." });
    }

    const newTrack = {
      userId,
      jobId,
      status,
      notes,
      history: [{ state: status, timestamp: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("job_track").insertOne(newTrack);
    newTrack._id = result.insertedId;

    return res.status(201).json({ status: 1, data: newTrack });
  } catch (error) {
    console.error("Error in addTrackedJob:", error);
    return res.status(500).json({ status: 0, message: "Internal server error" });
  }
};

export const updateTrackedJob = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const trackId = new ObjectId(req.params.jobId); // this is the _id of job_track doc
    const { status, notes } = req.body;

    const db = await getDB();
    
    const existing = await db.collection("job_track").findOne({ _id: trackId, userId });
    if (!existing) {
      return res.status(404).json({ status: 0, message: "Tracked job not found." });
    }

    const updateFields = { updatedAt: new Date() };
    
    if (notes !== undefined) {
      updateFields.notes = notes;
    }

    let historyOperation = null;

    if (status && status !== existing.status) {
      updateFields.status = status;
      
      const oldOrder = STATUS_ORDER[existing.status] ?? -1;
      const newOrder = STATUS_ORDER[status] ?? -1;

      // Backward movement: truncate newer history elements
      if (newOrder < oldOrder) {
        const newHistory = existing.history.filter(h => (STATUS_ORDER[h.state] ?? -1) <= newOrder);
        // Ensure the new state is in history (at the end)
        if (newHistory.length === 0 || newHistory[newHistory.length - 1].state !== status) {
            newHistory.push({ state: status, timestamp: new Date() });
        }
        updateFields.history = newHistory;
        historyOperation = { $set: updateFields }; // Override the whole history array
      } else {
        // Forward movement: just append
        historyOperation = {
          $set: updateFields,
          $push: { history: { state: status, timestamp: new Date() } }
        };
      }
    } else {
      historyOperation = { $set: updateFields };
    }

    await db.collection("job_track").updateOne(
      { _id: trackId },
      historyOperation
    );

    const updatedDoc = await db.collection("job_track").findOne({ _id: trackId });

    return res.status(200).json({ status: 1, data: updatedDoc });
  } catch (error) {
    console.error("Error in updateTrackedJob:", error);
    return res.status(500).json({ status: 0, message: "Internal server error" });
  }
};

export const deleteTrackedJob = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const trackId = new ObjectId(req.params.jobId); 

    const db = await getDB();
    
    const result = await db.collection("job_track").deleteOne({ _id: trackId, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ status: 0, message: "Tracked job not found." });
    }

    return res.status(200).json({ status: 1, message: "Job tracking removed." });
  } catch (error) {
    console.error("Error in deleteTrackedJob:", error);
    return res.status(500).json({ status: 0, message: "Internal server error" });
  }
};

export const getTrackedCompanies = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const db = await getDB();
    
    const pipeline = [
      { $match: { userId } },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails"
        }
      },
      { $unwind: "$jobDetails" },
      { $group: { _id: "$jobDetails.company" } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, company: "$_id" } }
    ];

    const result = await db.collection("job_track").aggregate(pipeline).toArray();
    const companies = result.map(r => r.company).filter(Boolean);

    return res.status(200).json({
      status: 1,
      data: companies
    });
  } catch (error) {
    console.error("Error in getTrackedCompanies:", error);
    return res.status(500).json({ status: 0, message: "Internal server error" });
  }
};
