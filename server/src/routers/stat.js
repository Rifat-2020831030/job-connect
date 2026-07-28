import express from "express";
const router = express.Router();

import { getCompanies } from "../controller/company-list.js";
import { getJobStats, incrementJobClick, registerVisitor } from "../controller/job-stat.js";
import { getLastScrapeTime } from "../controller/scrape-controller.js";

router.get("/", getJobStats);
router.post("/visitor", registerVisitor);
router.get("/companies", getCompanies);
router.get("/last-update", getLastScrapeTime);
router.get("/jobs/clicks", incrementJobClick);

export default router;
