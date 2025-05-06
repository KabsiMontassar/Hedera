const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const courseRoutes = require('./course.routes');
const badgeRoutes = require('./badge.routes');

router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/badges', badgeRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
