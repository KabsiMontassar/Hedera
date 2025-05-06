const Course = require('../models/course.model');
const User = require('../models/user.model');
const SmartContractService = require('../services/smartContract.service');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    return res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch courses', 
      error: error.message 
    });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    return res.status(200).json({ success: true, course });
  } catch (error) {
    console.error('Error fetching course:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch course', 
      error: error.message 
    });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, difficulty, badgeMetadata } = req.body;
    
    const newCourse = new Course({
      title,
      description,
      difficulty,
      badgeMetadata
    });
    
    await newCourse.save();
    
    return res.status(201).json({ 
      success: true, 
      message: 'Course created successfully', 
      course: newCourse 
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create course', 
      error: error.message 
    });
  }
};

exports.completeCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { userId } = req.body;
    
    // Verify user and course existence
    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId)
    ]);
    
    if (!user || !course) {
      return res.status(404).json({ 
        success: false, 
        message: `${!user ? 'User' : 'Course'} not found` 
      });
    }
    
    // Check if the user has already completed this course
    if (user.completedCourses.includes(courseId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'User has already completed this course' 
      });
    }
    
    // Use smart contract to verify course completion
    const verificationResult = await SmartContractService.verifyCourseCompletion(
      userId,
      courseId
    );
    
    if (!verificationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course completion verification failed', 
        details: verificationResult.message 
      });
    }
    
    // Update user's completed courses
    await User.findByIdAndUpdate(userId, {
      $push: { completedCourses: courseId }
    });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Course marked as completed',
      verificationResult
    });
  } catch (error) {
    console.error('Error completing course:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to complete course', 
      error: error.message 
    });
  }
};
