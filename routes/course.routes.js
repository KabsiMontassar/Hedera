const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/course.controller');

// Get all courses
router.get('/', CourseController.getAllCourses);
/**
 * Get all courses API
 * GET http://localhost:3000/api/courses
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "courses": [{
 *     "id": "course_id",
 *     "title": "Course Title",
 *     "description": "Course Description",
 *     "difficulty": "Beginner",
 *     "badgeMetadata": {...}
 *   }]
 * }
 */

// Get a specific course
router.get('/:id', CourseController.getCourse);
/**
 * Get course by ID API
 * GET http://localhost:3000/api/courses/:id
 * 
 * Parameters:
 * - id: MongoDB course ID
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "course": {
 *     "id": "course_id",
 *     "title": "Course Title",
 *     "description": "Course Description",
 *     "difficulty": "Beginner",
 *     "badgeMetadata": {
 *       "name": "Badge Name",
 *       "symbol": "BADGE",
 *       "description": "Badge Description",
 *       "imageUrl": "..."
 *     }
 *   }
 * }
 */

// Create a new course
router.post('/', CourseController.createCourse);
/**
 * Create course API
 * POST http://localhost:3000/api/courses
 * 
 * Request body:
 * {
 *   "title": "New Course",
 *   "description": "Course Description",
 *   "difficulty": "Beginner",
 *   "badgeMetadata": {
 *     "name": "Course Badge",
 *     "symbol": "BADGE",
 *     "description": "Badge Description",
 *     "imageUrl": "..."
 *   }
 * }
 * 
 * Success response (201):
 * {
 *   "success": true,
 *   "message": "Course created successfully",
 *   "course": {...}
 * }
 */

// Mark a course as completed
router.post('/:id/complete', CourseController.completeCourse);
/**
 * Complete course API
 * POST http://localhost:3000/api/courses/:id/complete
 * 
 * Parameters:
 * - id: MongoDB course ID
 * 
 * Request body:
 * {
 *   "userEmail": "user@example.com"
 * }
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "message": "Course marked as completed"
 * }
 * 
 * Error response (400):
 * {
 *   "success": false,
 *   "message": "User has already completed this course"
 * }
 */

module.exports = router;
