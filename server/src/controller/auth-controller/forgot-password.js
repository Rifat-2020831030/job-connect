import { getDB } from "../../db/database.js";
import { sendPasswordResetOtp } from "../../utils/otp-mail.js";
import { generateOtp, otpExpiresAt } from "./shared.js";

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const db = await getDB();
    const { email } = req.body;
    const GENERIC_RESPONSE = {
      status: 1,
      message: "If an account exists, a reset code has been sent",
    };
    const user = await db.collection("users").findOne({ email });

    if (!user?.passwordHash) return res.status(200).json(GENERIC_RESPONSE);

    const code = generateOtp();
    const exp = otpExpiresAt();

    await db
      .collection("users")
      .updateOne(
        { email },
        {
          $set: {
            "otp.code": code,
            "otp.exp": exp,
            updatedAt: new Date().toISOString(),
          },
        }
      );

    const emailSent = await sendPasswordResetOtp(email, code);
    if (!emailSent) {
      console.error("OTP email failed to send.");
      return res.status(500).json({
        status: 0,
        message: "Failed to send password reset email. Please try again later.",
      });
    }

    return res.status(200).json(GENERIC_RESPONSE);
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
