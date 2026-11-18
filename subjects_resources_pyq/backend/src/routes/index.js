const express = require('express');
const router = express.Router();

const subjectRoutes = require('./subjectRoutes');
const unitRoutes = require('./unitRoutes');
const resourceRoutes = require('./resourceRoutes');
const pyqRoutes = require('./pyqRoutes');

router.use('/subjects', subjectRoutes);
router.use('/units', unitRoutes);
router.use('/resources', resourceRoutes);
router.use('/pyqs', pyqRoutes);

module.exports = router;
