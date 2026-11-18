const express = require('express');
const router = express.Router();
const { uploadResource } = require('../services/fileUploadService');
const {
  uploadResource: uploadResourceCtrl,
  getResources,
  getResourcesBySubject,
  getResourcesByUnit,
  getResourceById,
  downloadResource,
  deleteResource,
} = require('../controllers/resourceController');

// GET /api/resources — list all resources (paginated, filterable)
router.get('/', getResources);

// GET /api/resources/subject/:subjectId — resources for a subject
router.get('/subject/:subjectId', getResourcesBySubject);

// GET /api/resources/unit/:unitId — resources for a unit
router.get('/unit/:unitId', getResourcesByUnit);

// GET /api/resources/:id — single resource metadata
router.get('/:id', getResourceById);

// GET /api/resources/:id/download — download resource file
router.get('/:id/download', downloadResource);

// POST /api/resources — upload a resource (multipart, field: "file")
router.post('/', uploadResource.single('file'), uploadResourceCtrl);

// DELETE /api/resources/:id — delete resource
router.delete('/:id', deleteResource);

module.exports = router;
