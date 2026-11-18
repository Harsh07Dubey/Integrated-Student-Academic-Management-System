const express = require('express');
const router = express.Router();
const { uploadPyq } = require('../services/fileUploadService');
const {
  uploadPyq: uploadPyqCtrl,
  getPyqs,
  getPyqsBySubject,
  getPyqById,
  downloadPyq,
  deletePyq,
} = require('../controllers/pyqController');

// GET /api/pyqs — list all PYQs (paginated, filterable)
router.get('/', getPyqs);

// GET /api/pyqs/subject/:subjectId — PYQs for a subject
router.get('/subject/:subjectId', getPyqsBySubject);

// GET /api/pyqs/:id — single PYQ metadata
router.get('/:id', getPyqById);

// GET /api/pyqs/:id/download — download PYQ file
router.get('/:id/download', downloadPyq);

// POST /api/pyqs — upload a PYQ (multipart, field: "file")
router.post('/', uploadPyq.single('file'), uploadPyqCtrl);

// DELETE /api/pyqs/:id — delete PYQ
router.delete('/:id', deletePyq);

module.exports = router;
