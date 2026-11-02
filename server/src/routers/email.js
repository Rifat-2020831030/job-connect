import express from "express";
import {
  unsubscribeEmail,
  submitUnsubscribeReason,
  verifyCode,
} from "../controller/email-controller.js";
import { validate } from "../middleware/validate.js";
import {
  subscribeEmailSchema,
  unsubscribeEmailSchema,
  verifyCodeSchema,
} from "../utils/validators.js";

const router = express.Router();

router.get("/unsubscribe", validate(unsubscribeEmailSchema), unsubscribeEmail);
router.post("/unsubscribe-reason", submitUnsubscribeReason);
router.post("/verify-code", validate(verifyCodeSchema), verifyCode);

export default router;
