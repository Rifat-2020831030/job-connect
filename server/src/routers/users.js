import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  getPreferences,
  savePreferences,
  getSavedJobs,
  saveJob,
  removeSavedJob,
} from "../controller/user-controller.js";
import {
  getTrackedJobs,
  addTrackedJob,
  updateTrackedJob,
  deleteTrackedJob,
  getTrackedCompanies,
} from "../controller/tracker-controller.js";
import { validate } from "../middleware/validate.js";
import {
  getPreferencesSchema,
  savePreferencesSchema,
  getSavedJobsSchema,
  saveJobSchema,
  removeSavedJobSchema,
  getTrackedJobsSchema,
  addTrackedJobSchema,
  updateTrackedJobSchema,
  deleteTrackedJobSchema,
} from "../utils/validators.js";

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

router.get("/:id/preferences", validate(getPreferencesSchema), getPreferences);
router.post("/:id/preferences", validate(savePreferencesSchema), savePreferences);

router.get("/:id/saved-jobs", validate(getSavedJobsSchema), getSavedJobs);
router.post("/:id/saved-jobs", validate(saveJobSchema), saveJob);
router.delete("/:id/saved-jobs/:jobId", validate(removeSavedJobSchema), removeSavedJob);

router.get("/:id/tracked-jobs", validate(getTrackedJobsSchema), getTrackedJobs);
router.post("/:id/tracked-jobs", validate(addTrackedJobSchema), addTrackedJob);
router.put("/:id/tracked-jobs/:jobId", validate(updateTrackedJobSchema), updateTrackedJob);
router.delete("/:id/tracked-jobs/:jobId", validate(deleteTrackedJobSchema), deleteTrackedJob);

router.get("/:id/tracked-companies", getTrackedCompanies);

export default router;
