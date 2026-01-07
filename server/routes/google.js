const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require('jsonwebtoken');
const FRONTEND_URL = process.env.FRONTEND_URL; 
// Start Google Auth
router.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  state: "user", // or any role
}));

// Callback
router.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "/login",
  session: false, 
}), (req, res) => {
  // Custom success redirect
  const user = req.user;
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

  const redirectUrl = `${FRONTEND_URL}/oauth?token=${token}`;
  res.redirect(redirectUrl);
});

module.exports = router;
