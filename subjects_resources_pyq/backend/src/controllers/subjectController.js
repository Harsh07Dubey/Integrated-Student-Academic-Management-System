const pool = require('../config/db');

/**
 * Create a new subject.
 * POST /api/subjects
 */
const createSubject = async (req, res) => {
  try {
    const { name, code, semester, class_id } = req.body;
    const created_by = req.user?.id || null;

    const result = await pool.query(
      `INSERT INTO subjects (name, code, semester, class_id, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, code, semester, class_id, created_by]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res
        .status(409)
        .json({ success: false, message: 'Subject code already exists' });
    }
    console.error('Error creating subject:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all subjects with pagination.
 * GET /api/subjects?page=1&limit=10
 */
const getSubjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM subjects');
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      'SELECT * FROM subjects ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get a single subject by ID.
 * GET /api/subjects/:id
 */
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM subjects WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Subject not found' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching subject:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get subjects by class ID.
 * GET /api/subjects/class/:classId
 */
const getSubjectsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM subjects WHERE class_id = $1',
      [classId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      'SELECT * FROM subjects WHERE class_id = $1 ORDER BY semester, name LIMIT $2 OFFSET $3',
      [classId, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching subjects by class:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update a subject.
 * PUT /api/subjects/:id
 */
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, semester, class_id } = req.body;

    const result = await pool.query(
      `UPDATE subjects
       SET name = COALESCE($1, name),
           code = COALESCE($2, code),
           semester = COALESCE($3, semester),
           class_id = COALESCE($4, class_id)
       WHERE id = $5
       RETURNING *`,
      [name, code, semester, class_id, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Subject not found' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res
        .status(409)
        .json({ success: false, message: 'Subject code already exists' });
    }
    console.error('Error updating subject:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete a subject.
 * DELETE /api/subjects/:id
 */
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM subjects WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Subject not found' });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  getSubjectsByClass,
  updateSubject,
  deleteSubject,
};
