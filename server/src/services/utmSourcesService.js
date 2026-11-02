import { getDB } from "../db/database.js";

export const DEFAULT_UTM_SOURCES = ["cv", "share", "referral", "social", "email"];

export async function getValidUtmSources() {
  try {
    const db = await getDB();
    const collection = db.collection("settings");
    const doc = await collection.findOne({ key: "utm_source" });
    if (doc && Array.isArray(doc.value) && doc.value.length > 0) {
      return doc.value.map((s) => String(s).trim().toLowerCase());
    }
    return DEFAULT_UTM_SOURCES;
  } catch {
    return DEFAULT_UTM_SOURCES;
  }
}
