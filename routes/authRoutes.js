const express = require('express');
const router = express.Router();

const { registerUser } = require("../controllers/authController")
const { loginUser } = require("../controllers/authController");
const { loginLimiter } = require('../middlewares/rateLimit');

// Register Route auth controller
router.post("/register",loginLimiter ,registerUser)

// Login Route auth controller
router.post("/login", loginLimiter, loginUser)

// Logout Route
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({
        success: "User logged out successfully"
    })
});
module.exports = router;