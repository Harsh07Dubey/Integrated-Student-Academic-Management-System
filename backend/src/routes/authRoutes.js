
const express = require("express");
const router = express.Router();

const { registerUser, loginUser } =
    require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Verify logged-in user's JWT token
router.get("/verify", authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Token is valid",
        user: req.user
    });
});

module.exports = router;
