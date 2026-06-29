import express from "express";
import {
  subscribe,
  verifyOtp,
  resendOtp,
  setPassword,
  login,
  refresh,
  forgotPassword,
  resetPassword,
} from "../controller/auth-controller/index.js";
import { validate } from "../middleware/validate.js";
import {
  subscribeSchema,
  verifyOtpSchema,
  resendOtpSchema,
  setPasswordSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../utils/validators.js";

const router = express.Router();

router.post("/subscribe", validate(subscribeSchema), subscribe);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/set-password", validate(setPasswordSchema), setPassword);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
