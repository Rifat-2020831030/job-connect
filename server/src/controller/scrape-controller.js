import { getDB } from "../db/database.js";
import { runScraper } from "../services/scraper-runner.js";

const getLastScrapeTime = async (req, res) => {
  try {
    const db = await getDB();
    const lastScrape = await db
      .collection("scraper-log")
      .findOne({ run_status: "success" }, { sort: { timestamp: -1 } });

    if (!lastScrape) {
      return res.status(404).json({ status: 0, message: "No data found" });
    }

    return res.status(200).json({ status: 1, data: lastScrape });
  } catch (error) {
    console.error("An error occurred while fetching last scraping time:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to fetch last scraping time",
    });
  }
};

export {
  getLastScrapeTime,
  runScraper,
};
