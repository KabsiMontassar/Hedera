const express = require('express');
const router = express.Router();
const BadgeController = require('../controllers/badge.controller');

// Get all badges for a user
router.get('/user/:userId', BadgeController.getUserBadges);

// Mint a new badge for course completion
router.post('/mint', BadgeController.mintBadge);

// Get badge details by token ID
router.get('/:tokenId', BadgeController.getBadgeDetails);

// Verify badge authenticity
router.get('/verify/:tokenId', BadgeController.verifyBadge);

module.exports = router;
