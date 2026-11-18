const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

/**
 * Upload a new resource.
 * POST /api/resources  (multipart/form-data, field name: "file")
 */
const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'No file uploaded' });
    }

    const {
      title,
      resource_type,
      class_id,
      subject_id,
      unit_id,
    } = req.body;

    if (!title || !subject_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, subject_id',
      });
    }

    const file = req.file;
    const uploaded_by = req.user?.id || null;

    const result = await pool.query(
      `INSERT INTO resources
         (title, file_name, file_path, file_size, file_type, resource_type,
          class_id, subject_id, unit_id, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        title,
        file.originalname,
        file.path,
        file.size,
        file.mimetype,
        resource_type || 'notes',
        class_id || null,
        subject_id,
        unit_id || null,
        uploaded_by,
      ]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error uploading resource:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all resources with pagination and optional filters.
 * GET /api/resources?page=1&limit=10&subject_id=&class_id=&resource_type=
 */
const getResources = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { subject_id, class_id, resource_type } = req.query;

    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (subject_id) {
      conditions.push(`subject_id = $${paramIdx++}`);
      params.push(subject_id);
    }
    if (class_id) {
      conditions.push(`class_id = $${paramIdx++}`);
      params.push(class_id);
    }
    if (resource_type) {
      conditions.push(`resource_type = $${paramIdx++}`);
      params.push(resource_type);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM resources ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT * FROM resources ${whereClause}
       ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get resources by subject ID.
 * GET /api/resources/subject/:subjectId
 */
const getResourcesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM resources WHERE subject_id = $1',
      [subjectId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT * FROM resources WHERE subject_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [subjectId, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching resources by subject:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get resources by unit ID.
 * GET /api/resources/unit/:unitId
 */
const getResourcesByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM resources WHERE unit_id = $1',
      [unitId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT * FROM resources WHERE unit_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [unitId, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching resources by unit:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get a single resource by ID.
 * GET /api/resources/:id
 */
const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM resources WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Resource not found' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Download a resource file.
 * GET /api/resources/:id/download
 */
const downloadResource = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM resources WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Resource not found' });
    }

    const resource = result.rows[0];
    const filePath = path.resolve(resource.file_path);

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: 'File not found on server' });
    }

    return res.download(filePath, resource.file_name);
  } catch (error) {
    console.error('Error downloading resource:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete a resource and its file.
 * DELETE /api/resources/:id
 */
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM resources WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Resource not found' });
    }

    // Remove file from disk
    const filePath = path.resolve(result.rows[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res
      .status(200)
      .json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  uploadResource,
  getResources,
  getResourcesBySubject,
  getResourcesByUnit,
  getResourceById,
  downloadResource,
  deleteResource,
};
