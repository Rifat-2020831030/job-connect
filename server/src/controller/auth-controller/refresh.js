import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDB } from "../../db/database.js";
import { issueTokens } from "./shared.js";

// POST /api/auth/refresh
export const refresh = async (req, res) => {
  try {
    const db = await getDB();
    const { refreshToken } = req.body;
    let decoded;

    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res
        .status(401)
        .json({ status: 0, message: "Invalid or expired refresh token" });
    }

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId), refreshToken });
    if (!user)
      return res
        .status(401)
        .json({ status: 0, message: "Refresh token revoked or invalid" });

    const tokens = issueTokens(user._id, user.email);

    await db
      .collection("users")
      .updateOne(
        { _id: user._id },
        {
          $set: {
            refreshToken: tokens.refreshToken,
            updatedAt: new Date().toISOString(),
          },
        }
      );

    return res
      .status(200)
      .json({
        status: 1,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
  } catch (error) {
    console.error("refresh error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error" });
  }
};
