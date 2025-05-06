const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/course.controller');

// Get all courses
router.get('/', CourseController.getAllCourses);

// Get a specific course
router.get('/:id', CourseController.getCourse);

// Create a new course
router.post('/', CourseController.createCourse);

// Mark a course as completed
router.post('/:id/complete', CourseController.completeCourse);

module.exports = router;
