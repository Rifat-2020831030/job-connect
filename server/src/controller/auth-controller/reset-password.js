import bcrypt from "bcryptjs";
import { getDB } from "../../db/database.js";
import { logger } from "../../utils/logger.js";
import { issueTokens } from "./shared.js";

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const db = await getDB();
    const { email, code, password } = req.body;
    const now = Date.now();
    const user = await db.collection("users").findOne({ email });

    if (!user)
      return res.status(400).json({ status: 0, message: "Invalid reset code" });
    if (!user.otp || user.otp.code !== code)
      return res.status(400).json({ status: 0, message: "Invalid reset code" });
    if (user.otp.exp < now)
      return res
        .status(400)
        .json({ status: 0, message: "Reset code has expired" });

    const passwordHash = await bcrypt.hash(password, 12);
    const { accessToken, refreshToken } = issueTokens(user._id, email);

    const updateResult = await db.collection("users").updateOne(
      { email, "otp.code": code, "otp.exp": { $gte: now } },
      {
        $set: {
          passwordHash,
          refreshToken,
          "otp.code": null,
          "otp.exp": null,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res
        .status(400)
        .json({ status: 0, message: "Invalid or expired reset code" });
    }

    return res
      .status(200)
      .json({
        status: 1,
        message: "Password updated successfully",
        data: { userId: user._id.toString(), email, accessToken, refreshToken },
      });
  } catch (error) {
    logger.error({ error }, "resetPassword error");
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
