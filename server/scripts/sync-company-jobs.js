import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const url = process.env.db_uri;
const dbName = "job-collection";

async function syncCompanyJobs() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    const jobsCol = db.collection("jobs");
    const companiesCol = db.collection("companies");

    const companies = await companiesCol.find({}).toArray();
    console.log(`Found ${companies.length} companies.`);

    let updatedJobsCount = 0;

    for (const company of companies) {
      // 1. Link jobs to this company by name
      const result = await jobsCol.updateMany(
        { company: new RegExp(`^${company.name}$`, "i") },
        { $set: { companyID: company._id, logo: company.logo } }
      );
      updatedJobsCount += result.modifiedCount;

      // 2. Baseline count calculation
      const totalJobs = await jobsCol.countDocuments({ companyID: company._id });
      
      const now = new Date(), monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const currentOpenJobs = await jobsCol.countDocuments({
        companyID: company._id,
        $or: [
          { deadline: { $exists: false }, first_seen: { $gte: monthAgo } },
          { deadline: null, first_seen: { $gte: monthAgo } },
          { deadline: { $gte: now } },
          { deadline: { $gte: now.toISOString() } }
        ]
      });

      // 3. Update the company with baseline counts
      await companiesCol.updateOne(
        { _id: company._id },
        {
          $set: {
            total_job_posts: totalJobs,
            current_open_jobs: currentOpenJobs
          }
        }
      );

      console.log(`Updated ${company.name}: total=${totalJobs}, open=${currentOpenJobs}`);
    }

    console.log(`\nMigration complete. Updated companyID on ${updatedJobsCount} jobs.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
  }
}

syncCompanyJobs();
