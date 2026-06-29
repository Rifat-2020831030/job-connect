import { getDB } from "../../db/database.js";
import { sendVerificationOtp } from "../../utils/otp-mail.js";
import { DEFAULT_PREFERENCES, generateOtp, otpExpiresAt } from "./shared.js";

// POST /api/auth/subscribe
// Register/subscribe flow
export const subscribe = async (req, res) => {
  try {
    const db = await getDB();
    const {
      email,
      ipAddress = null,
      latlong = null,
      country = null,
    } = req.body;
    const geo = { ipAddress, latlong, country };
    const now = new Date().toISOString();

    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser?.passwordHash) {
      return res.status(409).json({
        status: 0,
        message: "An account with this email already exists. Please log in.",
      });
    }

    if (existingUser?.verified) {
      await db
        .collection("users")
        .updateOne({ email }, { $set: { geo, updatedAt: now } });
      await db
        .collection("subscribers")
        .updateOne(
          { email },
          {
            $set: { ...geo, updatedAt: now },
            $setOnInsert: { email, verify: true, subscriptionTime: now },
          },
          { upsert: true }
        );
      return res.status(200).json({
        status: 1,
        alreadyVerified: true,
        message:
          "Email already verified. Please set your password to continue.",
        data: { email },
      });
    }

    const code = generateOtp();
    const exp = otpExpiresAt();

    await db
      .collection("subscribers")
      .updateOne(
        { email },
        {
          $set: { ...geo, updatedAt: now },
          $setOnInsert: { email, verify: false, subscriptionTime: now },
        },
        { upsert: true }
      );

    await db.collection("users").updateOne(
      { email },
      {
        $set: { "otp.code": code, "otp.exp": exp, geo, updatedAt: now },
        $setOnInsert: {
          email,
          passwordHash: "",
          refreshToken: null,
          verified: false,
          preferences: DEFAULT_PREFERENCES,
          savedJobs: [],
          createdAt: now,
        },
      },
      { upsert: true }
    );

    sendVerificationOtp(email, code).catch((err) =>
      console.error("OTP email failed:", err)
    );

    return res.status(200).json({
      status: 1,
      alreadyVerified: false,
      message: "Verification code sent to your email",
      data: { email },
    });
  } catch (error) {
    console.error("subscribe error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
