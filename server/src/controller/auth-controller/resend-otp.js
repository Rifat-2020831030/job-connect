import { getDB } from "../../db/database.js";
import { sendResendOtp } from "../../utils/otp-mail.js";
import { generateOtp, otpExpiresAt } from "./shared.js";

// POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const db = await getDB();
    const { email } = req.body;
    const user = await db.collection("users").findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({
          status: 0,
          message: "Email not found. Please subscribe first.",
        });
    if (user.verified && user.passwordHash)
      return res
        .status(400)
        .json({ status: 0, message: "Account is already fully registered" });
    if (user.verified && !user.passwordHash)
      return res
        .status(400)
        .json({
          status: 0,
          message: "Email already verified. Please set your password.",
          alreadyVerified: true,
        });

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

    sendResendOtp(email, code).catch((err) =>
      console.error("Resend OTP email failed:", err)
    );

    return res
      .status(200)
      .json({ status: 1, message: "New verification code sent" });
  } catch (error) {
    console.error("resendOtp error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
