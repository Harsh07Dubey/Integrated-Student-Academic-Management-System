const express = require('express');
const router = express.Router();
const validateRequest = require('../middleware/validateRequest');
const {
  createUnit,
  getUnits,
  getUnitsBySubject,
  getUnitById,
  updateUnit,
  deleteUnit,
} = require('../controllers/unitController');

// GET /api/units — list all units (paginated)
router.get('/', getUnits);

// GET /api/units/subject/:subjectId — units for a subject
router.get('/subject/:subjectId', getUnitsBySubject);

// GET /api/units/:id — single unit
router.get('/:id', getUnitById);

// POST /api/units — create unit
router.post(
  '/',
  validateRequest(['unit_number', 'title', 'subject_id']),
  createUnit
);

// PUT /api/units/:id — update unit
router.put('/:id', updateUnit);

// DELETE /api/units/:id — delete unit
router.delete('/:id', deleteUnit);

module.exports = router;
