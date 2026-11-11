const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authenticateToken = require("./middleware/authMiddleware");
const authorizeRole = require("./middleware/roleMiddleware");
const classRoutes = require("./routes/classRoutes");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/classes", classRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("ISAMS Backend is running!");
});

app.get(
    "/api/teacher/dashboard",
    authenticateToken,
    authorizeRole("TEACHER"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Teacher!",
            user: req.user
        });
    }
);

// Database connection test
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Neon PostgreSQL connected successfully!",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
});