import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  getPreferences,
  savePreferences,
  getSavedJobs,
  saveJob,
  removeSavedJob,
} from "../controller/user-controller.js";
import { validate } from "../middleware/validate.js";
import {
  getPreferencesSchema,
  savePreferencesSchema,
  getSavedJobsSchema,
  saveJobSchema,
  removeSavedJobSchema,
} from "../utils/validators.js";

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

router.get("/:id/preferences", validate(getPreferencesSchema), getPreferences);
router.post("/:id/preferences", validate(savePreferencesSchema), savePreferences);

router.get("/:id/saved-jobs", validate(getSavedJobsSchema), getSavedJobs);
router.post("/:id/saved-jobs", validate(saveJobSchema), saveJob);
router.delete("/:id/saved-jobs/:jobId", validate(removeSavedJobSchema), removeSavedJob);

export default router;
