
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const {
    createClass,
    joinClass,
    getMyClasses,
    getClassStudents
} = require("../controllers/classController");

// All class routes require login
router.use(authenticateToken);

// Teacher creates a class
router.post("/", authorizeRole("TEACHER"), createClass);

// Student joins a class
router.post("/join", authorizeRole("STUDENT"), joinClass);

// Get classes according to logged-in user
router.get("/", getMyClasses);

// Teacher views enrolled students
router.get(
    "/:id/students",
    authorizeRole("TEACHER"),
    getClassStudents
);

module.exports = router;
