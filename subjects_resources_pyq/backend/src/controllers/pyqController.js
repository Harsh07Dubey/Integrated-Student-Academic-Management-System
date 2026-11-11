const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

/**
 * Upload a new PYQ.
 * POST /api/pyqs  (multipart/form-data, field name: "file")
 */
const uploadPyq = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'No file uploaded' });
    }

    const {
      title,
      subject_id,
      semester,
      exam_year,
      exam_type,
      duration_hours,
      total_marks,
    } = req.body;

    if (!title || !subject_id || !exam_year) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, subject_id, exam_year',
      });
    }

    const file = req.file;
    const uploaded_by = req.user?.id || null;

    const result = await pool.query(
      `INSERT INTO pyqs
         (title, file_name, file_path, file_size, subject_id, semester,
          exam_year, exam_type, duration_hours, total_marks, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title,
        file.originalname,
        file.path,
        file.size,
        subject_id,
        semester || null,
        exam_year,
        exam_type || 'end_semester',
        duration_hours || null,
        total_marks || null,
        uploaded_by,
      ]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error uploading PYQ:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all PYQs with pagination and optional filters.
 * GET /api/pyqs?page=1&limit=10&subject_id=&exam_year=&exam_type=&semester=
 */
const getPyqs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { subject_id, exam_year, exam_type, semester } = req.query;

    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (subject_id) {
      conditions.push(`subject_id = $${paramIdx++}`);
      params.push(subject_id);
    }
    if (exam_year) {
      conditions.push(`exam_year = $${paramIdx++}`);
      params.push(exam_year);
    }
    if (exam_type) {
      conditions.push(`exam_type = $${paramIdx++}`);
      params.push(exam_type);
    }
    if (semester) {
      conditions.push(`semester = $${paramIdx++}`);
      params.push(semester);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM pyqs ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT * FROM pyqs ${whereClause}
       ORDER BY exam_year DESC, created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching PYQs:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get PYQs by subject ID.
 * GET /api/pyqs/subject/:subjectId
 */
const getPyqsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM pyqs WHERE subject_id = $1',
      [subjectId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT * FROM pyqs WHERE subject_id = $1
       ORDER BY exam_year DESC, created_at DESC LIMIT $2 OFFSET $3`,
      [subjectId, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching PYQs by subject:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get a single PYQ by ID.
 * GET /api/pyqs/:id
 */
const getPyqById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM pyqs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'PYQ not found' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching PYQ:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Download a PYQ file.
 * GET /api/pyqs/:id/download
 */
const downloadPyq = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM pyqs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'PYQ not found' });
    }

    const pyq = result.rows[0];
    const filePath = path.resolve(pyq.file_path);

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: 'File not found on server' });
    }

    return res.download(filePath, pyq.file_name);
  } catch (error) {
    console.error('Error downloading PYQ:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete a PYQ and its file.
 * DELETE /api/pyqs/:id
 */
const deletePyq = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM pyqs WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'PYQ not found' });
    }

    // Remove file from disk
    const filePath = path.resolve(result.rows[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res
      .status(200)
      .json({ success: true, message: 'PYQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting PYQ:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  uploadPyq,
  getPyqs,
  getPyqsBySubject,
  getPyqById,
  downloadPyq,
  deletePyq,
};
