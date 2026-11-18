const pool = require('../config/db');

/**
 * Create a new unit.
 * POST /api/units
 */
const createUnit = async (req, res) => {
  try {
    const { unit_number, title, description, subject_id } = req.body;

    const result = await pool.query(
      `INSERT INTO units (unit_number, title, description, subject_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [unit_number, title, description || null, subject_id]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating unit:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all units with pagination.
 * GET /api/units?page=1&limit=10
 */
const getUnits = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM units');
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      'SELECT * FROM units ORDER BY subject_id, unit_number LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching units:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get units by subject ID.
 * GET /api/units/subject/:subjectId
 */
const getUnitsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM units WHERE subject_id = $1',
      [subjectId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      'SELECT * FROM units WHERE subject_id = $1 ORDER BY unit_number LIMIT $2 OFFSET $3',
      [subjectId, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching units by subject:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get a single unit by ID.
 * GET /api/units/:id
 */
const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM units WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Unit not found' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching unit:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update a unit.
 * PUT /api/units/:id
 */
const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { unit_number, title, description, subject_id } = req.body;

    const result = await pool.query(
      `UPDATE units
       SET unit_number = COALESCE($1, unit_number),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           subject_id = COALESCE($4, subject_id)
       WHERE id = $5
       RETURNING *`,
      [unit_number, title, description, subject_id, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Unit not found' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating unit:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete a unit.
 * DELETE /api/units/:id
 */
const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM units WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Unit not found' });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting unit:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createUnit,
  getUnits,
  getUnitsBySubject,
  getUnitById,
  updateUnit,
  deleteUnit,
};
