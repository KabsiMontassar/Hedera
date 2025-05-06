const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');

// Register a new user
router.post('/register', UserController.register);

// Get user profile
router.get('/:id', UserController.getProfile);

// Update user profile
router.put('/:id', UserController.updateProfile);

module.exports = router;
