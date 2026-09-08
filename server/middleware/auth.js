// middlewares/auth.js
const jwt = require("jsonwebtoken");

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
};
