import jwt from "jsonwebtoken";

/**
 * Middleware: verify JWT access token from Authorization header.
 * Attaches decoded payload to req.user on success.
 */
const authMiddleware = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ status: 0, message: "Unauthorized: token missing" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, iat, exp }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ status: 0, message: "Token expired" });
    }
    return res
      .status(401)
      .json({ status: 0, message: "Unauthorized: invalid token" });
  }
};

export default authMiddleware;
