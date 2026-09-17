import express from "express";
import { rateLimit } from "express-rate-limit";
import {
  getJobs,
  getFeaturedJobs,
  getCategories,
  getFilterOptions,
  getLocationSuggestions,
  getJobById,
  reportJob,
} from "../controller/job-controller/index.js";

const router = express.Router();

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5, // Limit each IP to 5req/hour
  message: { status: 0, message: "Too many reports created from this IP, please try again after an hour" },
  standardHeaders: true, 
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


router.get("/featured", getFeaturedJobs);
router.get("/categories", getCategories);
router.get("/filter-options", getFilterOptions);
router.get("/location-suggestions", getLocationSuggestions);

router.get("/", getJobs);
router.get("/:id", getJobById);
router.post("/:id/report", reportLimiter, reportJob);

export default router;
