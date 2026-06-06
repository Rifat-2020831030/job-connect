import express from "express";
const router = express.Router();

import { getCompanies } from "../controller/company-list.js";
import { getJobStats } from "../controller/job-stat.js";
import { getLastScrapeTime } from "../controller/scrape-controller.js";

router.get("/", getJobStats);
router.get("/companies", getCompanies);
router.get("/last-update", getLastScrapeTime);

export default router;
