
const pool = require("../config/db");
const crypto = require("crypto");

// Generate unique class code
const generateClassCode = () => {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
};

// 1. CREATE CLASS (TEACHER)
const createClass = async (req, res) => {
    try {
        const { class_name } = req.body;

        if (!class_name || !class_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Class name is required"
            });
        }

        if (class_name.trim().length > 150) {
            return res.status(400).json({
                success: false,
                message: "Class name cannot exceed 150 characters"
            });
        }

        const classCode = generateClassCode();

        const result = await pool.query(
            `INSERT INTO classes (class_name, class_code, teacher_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [class_name.trim(), classCode, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: "Class created successfully",
            class: result.rows[0]
        });

    } catch (error) {
        console.error("Create class error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create class"
        });
    }
};

// 2. JOIN CLASS (STUDENT)
const joinClass = async (req, res) => {
    try {
        const { class_code } = req.body;

        if (!class_code || !class_code.trim()) {
            return res.status(400).json({
                success: false,
                message: "Class code is required"
            });
        }

        const classResult = await pool.query(
            `SELECT id, class_name, class_code
             FROM classes
             WHERE class_code = $1`,
            [class_code.trim().toUpperCase()]
        );

        if (classResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Invalid class code"
            });
        }

        const classData = classResult.rows[0];

        const result = await pool.query(
            `INSERT INTO enrollments (student_id, class_id)
             VALUES ($1, $2)
             ON CONFLICT (student_id, class_id) DO NOTHING
             RETURNING *`,
            [req.user.id, classData.id]
        );

        if (result.rows.length === 0) {
            return res.status(409).json({
                success: false,
                message: "Already enrolled in this class"
            });
        }

        res.status(201).json({
            success: true,
            message: "Successfully joined class",
            class: classData
        });

    } catch (error) {
        console.error("Join class error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to join class"
        });
    }
};

// 3. GET MY CLASSES
const getMyClasses = async (req, res) => {
    try {
        let result;

        if (req.user.role === "TEACHER") {
            result = await pool.query(
                `SELECT c.*,
                    (SELECT COUNT(*)
                     FROM enrollments e
                     WHERE e.class_id = c.id) AS student_count
                 FROM classes c
                 WHERE c.teacher_id = $1
                 ORDER BY c.created_at DESC`,
                [req.user.id]
            );
        } else {
            result = await pool.query(
                `SELECT c.*, u.name AS teacher_name
                 FROM classes c
                 JOIN enrollments e ON e.class_id = c.id
                 JOIN users u ON u.id = c.teacher_id
                 WHERE e.student_id = $1
                 ORDER BY e.joined_at DESC`,
                [req.user.id]
            );
        }

        res.status(200).json({
            success: true,
            classes: result.rows
        });

    } catch (error) {
        console.error("Get classes error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch classes"
        });
    }
};

// 4. GET ENROLLED STUDENTS (TEACHER)
const getClassStudents = async (req, res) => {
    try {
        const { id } = req.params;

        const classResult = await pool.query(
            "SELECT id FROM classes WHERE id = $1 AND teacher_id = $2",
            [id, req.user.id]
        );

        if (classResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const result = await pool.query(
            `SELECT u.id, u.name, u.email, e.joined_at
             FROM enrollments e
             JOIN users u ON u.id = e.student_id
             WHERE e.class_id = $1
             ORDER BY u.name`,
            [id]
        );

        res.status(200).json({
            success: true,
            students: result.rows
        });

    } catch (error) {
        console.error("Get students error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch students"
        });
    }
};

module.exports = {
    createClass,
    joinClass,
    getMyClasses,
    getClassStudents
};
