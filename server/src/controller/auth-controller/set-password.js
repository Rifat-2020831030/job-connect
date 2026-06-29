import bcrypt from "bcryptjs";
import { getDB } from "../../db/database.js";

// POST /api/auth/set-password
export const setPassword = async (req, res) => {
  try {
    const db = await getDB();
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ email });

    if (!user)
      return res.status(404).json({ status: 0, message: "Email not found" });
    if (!user.verified)
      return res
        .status(400)
        .json({
          status: 0,
          message: "Email not verified. Please verify your email first.",
        });
    if (user.passwordHash)
      return res
        .status(409)
        .json({
          status: 0,
          message: "Password already set. Use forgot-password to reset.",
        });

    const passwordHash = await bcrypt.hash(password, 12);

    await db
      .collection("users")
      .updateOne(
        { email },
        { $set: { passwordHash, updatedAt: new Date().toISOString() } }
      );

    return res
      .status(200)
      .json({
        status: 1,
        message: "Account created successfully",
        data: { userId: user._id.toString(), email },
      });
  } catch (error) {
    console.error("setPassword error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
