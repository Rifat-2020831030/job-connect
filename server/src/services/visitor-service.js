import { getDB } from "../db/database.js";
import { logger } from "../utils/logger.js";

export const trackVisitor = async (visitorId) => {
  try {
    const db = await getDB();
    await db.collection("unique_visitors").updateOne(
      { _id: visitorId },
      {
        $setOnInsert: { firstSeen: new Date() },
        $set: { lastSeen: new Date() },
      },
      { upsert: true }
    );
    return true;
  } catch (error) {
    logger.error({ error, visitorId }, "Error tracking unique visitor");
    return false;
  }
};
