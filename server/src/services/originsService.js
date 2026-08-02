import { getDB } from "../db/database.js";

export async function getAllowedOrigins() {
  const db = await getDB();
  const collection = db.collection("settings");
  const doc = await collection.findOne({ key: "allowedOrigins" });
  if (doc && Array.isArray(doc.value)) {
    return doc.value;
  }
}
