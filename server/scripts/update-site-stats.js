import dns from "dns";
import "dotenv/config";
import { MongoClient } from "mongodb";

dns.setServers(["1.1.1.1", "1.0.0.1"]);

const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.MONGO_DATABASE;

async function updateSiteStats() {
  if (!DB_URI) {
    console.error("DB_URI is not set in environment variables.");
    process.exit(1);
  }

  const client = new MongoClient(DB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // 1. Total Jobs
    const totalJobs = await db.collection("jobs").countDocuments();

    // 2. Total Unique Companies
    const uniqueCompanies = await db.collection("jobs").distinct("company");
    const totalCompanies = uniqueCompanies.length;

    // 3. Total Users (Subscribers - including unverified)
    const subscribersCount = await db.collection("users").countDocuments();

    // 4. Unique Locations
    const uniqueLocationsArray = await db
      .collection("jobs")
      .distinct("location");
    const uniqueLocations = uniqueLocationsArray.length;

    // 5. New roles added in the last 7 days
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const newRolesAdded = await db.collection("jobs").countDocuments({
      first_seen: { $gte: sevenDaysAgo },
    });

    const stats = {
      totalJobs,
      totalCompanies,
      subscribersCount,
      uniqueLocations,
      newRolesAdded,
      updatedAt: new Date().toISOString(),
    };

    // Upsert into cache collection
    await db
      .collection("cache")
      .updateOne({ _id: "site_stats" }, { $set: stats }, { upsert: true });

    console.log("Site stats updated successfully:", stats);
  } catch (error) {
    console.error("Error updating site stats:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

updateSiteStats();
