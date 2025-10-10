const scrapeRunner = require("../controller/scrape-controller");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const router = express.Router();

const auth = (req, res, next) => {
  const token = req.query.token;
  if (!token || token !== process.env.SCRAPE_TOKEN) {
    return res.status(403).json({ message: "Unauthorized request" });
  }
  next();
};

router.get("/", auth, async (req, res) => {
  try {
    console.log("Starting scrape process...");
    const output = await scrapeRunner.runScraper();
    console.log("Scrape process completed successfully.");
    res
      .status(200)
      .json({ message: "Scraping completed successfully", data: output });
  } catch (error) {
    console.error("Error running scraper:", error);
    res
      .status(500)
      .json({ message: "Error running scraper", error: error.message });
  }
});

module.exports = router;
