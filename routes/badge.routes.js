const express = require('express');
const router = express.Router();
const BadgeController = require('../controllers/badge.controller');

// Get all badges for a user by email
router.get('/user/:userEmail', BadgeController.getUserBadges);
/**
 * Get user badges API
 * GET http://localhost:3000/api/badges/user/:userEmail
 * 
 * Parameters:
 * - userEmail: User's email address
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "badges": [{
 *     "tokenId": "0.0.123456",
 *     "metadata": {
 *       "name": "Course Completion Badge",
 *       "description": "...",
 *       "image": "..."
 *     },
 *     "courseId": {
 *       "title": "Course Title",
 *       "description": "..."
 *     }
 *   }]
 * }
 */

// Mint a new badge for course completion
router.post('/mint', BadgeController.mintBadge);
/**
 * Mint badge API
 * POST http://localhost:3000/api/badges/mint
 * 
 * Request body:
 * {
 *   "userEmail": "user@example.com",
 *   "courseId": "course_mongodb_id"
 * }
 * 
 * Success response (201):
 * {
 *   "success": true,
 *   "message": "Badge minted successfully",
 *   "badge": {
 *     "tokenId": "0.0.123456",
 *     "transactionId": "0.0.123@123456789.000",
 *     "metadata": {...}
 *   }
 * }
 */

// Get badge details by token ID
router.get('/:tokenId', BadgeController.getBadgeDetails);
/**
 * Get badge details API
 * GET http://localhost:3000/api/badges/:tokenId
 * 
 * Parameters:
 * - tokenId: Hedera NFT token ID
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "badge": {
 *     "tokenId": "0.0.123456",
 *     "metadata": {...},
 *     "userId": {
 *       "username": "...",
 *       "email": "..."
 *     },
 *     "courseId": {...}
 *   }
 * }
 */

// Verify badge authenticity
router.get('/verify/:tokenId', BadgeController.verifyBadge);
/**
 * Verify badge API
 * GET http://localhost:3000/api/badges/verify/:tokenId
 * 
 * Parameters:
 * - tokenId: Hedera NFT token ID
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "isValid": true,
 *   "badge": {...},
 *   "tokenInfo": {
 *     "totalSupply": 1,
 *     "treasuryAccountId": "0.0.123456",
 *     ...
 *   }
 * }
 */

module.exports = router;
