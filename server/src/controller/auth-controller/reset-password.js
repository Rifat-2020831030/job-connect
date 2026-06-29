import bcrypt from "bcryptjs";
import { getDB } from "../../db/database.js";

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const db = await getDB();
    const { email, code, password } = req.body;
    const now = Date.now();
    const user = await db.collection("users").findOne({ email });

    if (!user)
      return res.status(404).json({ status: 0, message: "Account not found" });
    if (!user.otp || user.otp.code !== code)
      return res.status(400).json({ status: 0, message: "Invalid reset code" });
    if (user.otp.exp < now)
      return res
        .status(400)
        .json({ status: 0, message: "Reset code has expired" });

    const passwordHash = await bcrypt.hash(password, 12);

    await db
      .collection("users")
      .updateOne(
        { email },
        {
          $set: {
            passwordHash,
            "otp.code": null,
            "otp.exp": null,
            refreshToken: null,
            updatedAt: new Date().toISOString(),
          },
        }
      );

    return res
      .status(200)
      .json({ status: 1, message: "Password updated successfully" });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
