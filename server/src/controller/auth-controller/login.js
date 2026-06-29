import bcrypt from "bcryptjs";
import { getDB } from "../../db/database.js";
import { issueTokens } from "./shared.js";

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const db = await getDB();
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ email });

    if (!user)
      return res
        .status(401)
        .json({ status: 0, message: "Invalid email or password" });
    if (!user.passwordHash)
      return res
        .status(403)
        .json({
          status: 0,
          message: "Account setup not complete. Please set your password.",
          action: "set-password",
        });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res
        .status(401)
        .json({ status: 0, message: "Invalid email or password" });

    const { accessToken, refreshToken } = issueTokens(user._id, user.email);

    await db
      .collection("users")
      .updateOne(
        { _id: user._id },
        { $set: { refreshToken, updatedAt: new Date().toISOString() } }
      );

    return res.status(200).json({
      status: 1,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        userId: user._id.toString(),
        email: user.email,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
