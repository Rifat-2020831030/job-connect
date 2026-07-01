import crypto from "crypto";
import jwt from "jsonwebtoken";

export const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// OTP expires 5 minutes from now
export const otpExpiresAt = () => Date.now() + 5 * 60 * 1000;

export const DEFAULT_PREFERENCES = {
  categories: [
    "web",
    "ai/ml",
    "data science",
    "devops",
    "mobile",
    "security",
    "design",
    "PM",
    "other",
  ],
  workModel: ["Remote", "Onsite", "Hybrid"],
  alertTiming: "Night",
};

export const issueTokens = (userId, email) => {
  const accessToken = jwt.sign(
    { userId: userId.toString(), email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { userId: userId.toString(), email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};
