const express = require("express");
const router = express.Router();

const jobStat = require("../controller/job-stat");
const companyList = require("../controller/company-list");
const scrapeStat = require("../controller/scrape-controller");

router.get("/", jobStat.getJobStats);
router.get("/companies", companyList.getCompanies);
router.get("/last-update", scrapeStat.getLastScrapeTime);

module.exports = router;
