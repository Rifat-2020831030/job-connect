import dotenv from "dotenv";
import { getDB, closeDB } from "../src/db/database.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Ensure you have GEMINI_API_KEY in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the specified 'gemini-3.1-flash-lite' model.
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const PROMPT = `You are an expert job classification assistant. 
Analyze the following job description details and determine the best 'category' and 'industry' for the job.

Return ONLY a valid JSON object with the following structure:
{
  "category": "<category_value>",
  "industry": "<industry_value>"
}

Constraints for 'category':
- Must be one of the following exact string values: "web", "ai/ml", "data science", "devops", "PM", "design", "mobile", "security", "other".
- If it doesn't strongly fit any of the specific categories, use "other".

Constraints for 'industry':
- Give a broad industry name based on the content (e.g., "engineering", "business", "finance", "healthcare", "education", "retail", "manufacturing").
- Keep it concise (1-2 words).

Job Details:
`;

async function processJobs() {
  try {
    const db = await getDB();
    const jobsCollection = db.collection("jobs");

    // Fetch jobs that don't have BOTH category and industry
    const filter = {
      $or: [
        { category: { $exists: false } },
        { industry: { $exists: false } },
      ],
      details: { $exists: true, $ne: null, $ne: "" }
    };

    const jobs = await jobsCollection.find(filter).toArray();
    console.log(`Found ${jobs.length} jobs to process.`);

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      console.log(`Processing job ${i + 1}/${jobs.length} (ID: ${job._id})`);

      try {
        const result = await model.generateContent(PROMPT + job.details);
        const textResponse = result.response.text();
        
        // Parse the JSON output
        let parsed;
        try {
          parsed = JSON.parse(textResponse);
        } catch (e) {
          console.error(`Failed to parse JSON for job ${job._id}. Response: ${textResponse}`);
          continue; // skip to next job
        }

        const updateData = {};
        if (parsed.category) updateData.category = parsed.category;
        if (parsed.industry) updateData.industry = parsed.industry;

        if (Object.keys(updateData).length > 0) {
          await jobsCollection.updateOne(
            { _id: job._id },
            { $set: updateData }
          );
          console.log(`Updated job ${job._id} with:`, updateData);
        }

      } catch (err) {
        console.error(`Error processing job ${job._id}:`, err.message);
      }

      // Pause to avoid hitting the RPM limit of 20 (1 request every 3 seconds)
      // We pause for 3.5 seconds to be safe.
      console.log("Waiting 3.5 seconds before next request...");
      await sleep(3500); 
    }

    console.log("Finished processing all jobs.");
  } catch (error) {
    console.error("Script failed:", error);
  } finally {
    await closeDB();
  }
}

processJobs();
