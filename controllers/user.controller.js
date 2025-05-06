const User = require('../models/user.model');
const HederaService = require('../services/hedera.service');

exports.register = async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }
    
    // Create Hedera account for the user
    const hederaAccount = await HederaService.createAccount();
    
    // Create new user
    const newUser = new User({
      username,
      email,
      hederaAccountId: hederaAccount.accountId,
      completedCourses: [],
      badges: []
    });
    
    await newUser.save();
    
    return res.status(201).json({ 
      success: true, 
      message: 'User registered successfully', 
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        hederaAccountId: newUser.hederaAccountId
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to register user', 
      error: error.message 
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate('badges')
      .populate('completedCourses');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    return res.status(200).json({ 
      success: true, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        hederaAccountId: user.hederaAccountId,
        completedCourses: user.completedCourses,
        badges: user.badges
      } 
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user profile', 
      error: error.message 
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully', 
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email
      } 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
};
