import express from "express";
import {
  getJobs,
  getFeaturedJobs,
  getCategories,
  getFilterOptions,
  getLocationSuggestions,
  getJobById,
} from "../controller/job-controller/index.js";

const router = express.Router();

// ⚠️  Static named routes MUST come before /:id to avoid param capture
router.get("/featured", getFeaturedJobs);
router.get("/categories", getCategories);
router.get("/filter-options", getFilterOptions);
router.get("/location-suggestions", getLocationSuggestions);

router.get("/", getJobs);
router.get("/:id", getJobById);

export default router;
