import { getDB } from "../db/database.js";

export const source = async (req, res, next) => {
  const { utm_source = "unknown" } = req.query;
  const timestamp = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

  if (utm_source === "unknown" || !utm_source || utm_source === undefined || utm_source === null) {
    next();
  } else {
    try {
      const db = await getDB();
      
      // Find the last insertion for the same utm_source
      const lastEntry = await db
        .collection("sources")
        .findOne(
          { utm_source }, 
          { sort: { timestamp: -1 } }
        );
      
      // Check if enough time has passed (e.g., 1 min)
      const MIN_INTERVAL = 1 * 60 * 1000; // 1 minute in milliseconds
      const now = new Date();
      
      if (!lastEntry || (now - new Date(lastEntry.timestamp)) > MIN_INTERVAL) {
        const result = await db
          .collection("sources")
          .insertOne({ utm_source, timestamp });
      }
      next();
    } catch (error) {
      next();
    }
  }
};
