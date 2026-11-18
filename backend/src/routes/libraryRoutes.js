const express = require('express');
const router = express.Router();

const subjectRoutes = require('./subjectRoutes');
const unitRoutes = require('./unitRoutes');
const resourceRoutes = require('./resourceRoutes');
const pyqRoutes = require('./pyqRoutes');
const authenticateToken = require('../middleware/authMiddleware');
const teacher = require('../middleware/roleMiddleware')('TEACHER');

router.use(['/subjects', '/units', '/resources', '/pyqs'], authenticateToken, (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  return teacher(req, res, next);
});

router.use('/subjects', subjectRoutes);
router.use('/units', unitRoutes);
router.use('/resources', resourceRoutes);
router.use('/pyqs', pyqRoutes);

module.exports = router;
