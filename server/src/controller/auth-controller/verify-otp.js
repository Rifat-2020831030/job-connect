import { getDB } from "../../db/database.js";

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const db = await getDB();
    const { email, code } = req.body;
    const now = Date.now();
    const user = await db.collection("users").findOne({ email });

    if (!user)
      return res.status(404).json({ status: 0, message: "Email not found" });
    if (user.verified && user.passwordHash)
      return res
        .status(400)
        .json({ status: 0, message: "Email already verified" });
    if (!user.otp || user.otp.code !== code)
      return res
        .status(400)
        .json({ status: 0, message: "Invalid verification code" });
    if (user.otp.exp < now)
      return res
        .status(400)
        .json({ status: 0, message: "Verification code has expired" });

    await db
      .collection("users")
      .updateOne(
        { email },
        {
          $set: {
            verified: true,
            "otp.code": null,
            "otp.exp": null,
            updatedAt: new Date().toISOString(),
          },
        }
      );

    await db
      .collection("subscribers")
      .updateOne({ email }, { $set: { verify: true } });

    return res
      .status(200)
      .json({
        status: 1,
        message: "Email verified successfully",
        data: { email },
      });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
