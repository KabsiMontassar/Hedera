const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');

// Register a new user
router.post('/register', UserController.register);
/**
 * Register new user API
 * POST http://localhost:3000/api/users/register
 * 
 * Request body:
 * {
 *   "username": "testuser",
 *   "email": "testuser@gmail.com"
 * }
 * 
 * Success response (201):
 * {
 *   "success": true,
 *   "message": "User registered successfully",
 *   "user": {
 *     "id": "user_id",
 *     "username": "testuser",
 *     "email": "testuser@gmail.com",
 *     "hederaAccountId": "0.0.123456"
 *   }
 * }
 * 
 * Error response (400):
 * {
 *   "success": false,
 *   "message": "Username or email already exists"
 * }
 */

// Get user profile by email
router.get('/profile/:email', UserController.getProfile);
/**
 * Get user profile API
 * GET http://localhost:3000/api/users/profile/:email
 * 
 * Parameters:
 * - email: User's email address
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "user": {
 *     "id": "user_id",
 *     "username": "testuser",
 *     "email": "testuser@gmail.com",
 *     "hederaAccountId": "0.0.123456",
 *     "completedCourses": [...],
 *     "badges": [...]
 *   }
 * }
 * 
 * Error response (404):
 * {
 *   "success": false,
 *   "message": "User not found"
 * }
 */

// Update user profile by email
router.put('/profile/:email', UserController.updateProfile);
/**
 * Update user profile API
 * PUT http://localhost:3000/api/users/profile/:email
 * 
 * Parameters:
 * - email: User's email address
 * 
 * Request body:
 * {
 *   "username": "updated_username",
 *   "email": "updated_email@gmail.com"
 * }
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "message": "Profile updated successfully",
 *   "user": {
 *     "id": "user_id",
 *     "username": "updated_username",
 *     "email": "updated_email@gmail.com"
 *   }
 * }
 * 
 * Error response (404):
 * {
 *   "success": false,
 *   "message": "User not found"
 * }
 */

module.exports = router;
