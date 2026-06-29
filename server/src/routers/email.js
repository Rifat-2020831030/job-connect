import express from "express";
import {
  getEmailList,
  subscribeEmail,
  unsubscribeEmail,
  verifyCode,
} from "../controller/email-controller.js";
import { validate } from "../middleware/validate.js";
import {
  subscribeEmailSchema,
  unsubscribeEmailSchema,
  verifyCodeSchema,
} from "../utils/validators.js";

const router = express.Router();

router.post("/subscribe", validate(subscribeEmailSchema), subscribeEmail);
router.get("/unsubscribe", validate(unsubscribeEmailSchema), unsubscribeEmail);
router.get("/", getEmailList);
router.post("/verify-code", validate(verifyCodeSchema), verifyCode);

export default router;
