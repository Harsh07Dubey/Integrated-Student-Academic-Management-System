const express = require('express');
const router = express.Router();
const validateRequest = require('../middleware/validateRequest');
const {
  createSubject,
  getSubjects,
  getSubjectById,
  getSubjectsByClass,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');

// GET /api/subjects — list all subjects (paginated)
router.get('/', getSubjects);

// GET /api/subjects/class/:classId — subjects for a class
router.get('/class/:classId', getSubjectsByClass);

// GET /api/subjects/:id — single subject
router.get('/:id', getSubjectById);

// POST /api/subjects — create subject
router.post(
  '/',
  validateRequest(['name', 'code', 'semester']),
  createSubject
);

// PUT /api/subjects/:id — update subject
router.put('/:id', updateSubject);

// DELETE /api/subjects/:id — delete subject
router.delete('/:id', deleteSubject);

module.exports = router;
