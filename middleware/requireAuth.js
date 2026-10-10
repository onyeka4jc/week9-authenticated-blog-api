const jwt = require("jsonwebtoken");
const User = require("../models/user");

const requireAuth = async (req, res, next) => {
  const authorization = req.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required. Provide Authorization: Bearer <token>.",
    });
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ message: "Authentication token is missing" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    return res.status(500).json({ message: "Authentication is not configured on the server" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (!decoded || typeof decoded !== "object" || typeof decoded.id !== "string") {
    return res.status(401).json({ message: "Invalid authentication token" });
  }

  try {
    const user = await User.findById(decoded.id).select("name email");
    if (!user) {
      return res.status(401).json({ message: "The token's user no longer exists" });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Authentication lookup failed:", error.message);
    return res.status(500).json({ message: "Unable to authenticate request" });
  }
};

module.exports = requireAuth;
