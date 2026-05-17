import express from "express";
import {
  getEmailList,
  subscribeEmail,
  unsubscribeEmail,
  verifyCode,
} from "../controller/email-controller.js";
const router = express.Router();

router.post("/subscribe", subscribeEmail);
router.get("/unsubscribe", unsubscribeEmail);
router.get("/", getEmailList);
router.post("/verify-code", verifyCode);

export default router;
