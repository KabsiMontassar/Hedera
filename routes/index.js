const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const courseRoutes = require('./course.routes');
const badgeRoutes = require('./badge.routes');
const healthRecordRoutes = require('./healthRecord.routes');

router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/badges', badgeRoutes);
router.use('/health-records', healthRecordRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
