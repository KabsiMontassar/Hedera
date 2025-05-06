const Badge = require('../models/badge.model');
const User = require('../models/user.model');
const Course = require('../models/course.model');
const HederaService = require('../services/hedera.service');
const SmartContractService = require('../services/smartContract.service');

exports.getUserBadges = async (req, res) => {
  try {
    const userId = req.params.userId;
    const badges = await Badge.find({ userId }).populate('courseId');
    
    return res.status(200).json({ success: true, badges });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch badges', error: error.message });
  }
};

exports.mintBadge = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    
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
    
    // Check if user has already completed this course
    if (user.completedCourses.includes(courseId)) {
      // Create badge metadata
      const metadata = {
        name: `${course.title} Badge`,
        description: `Badge for completing ${course.title}`,
        image: course.badgeMetadata.imageUrl,
        properties: {
          completionDate: new Date(),
          difficulty: course.difficulty,
          issuer: "Hedera Badge Platform"
        }
      };
      
      // Mint NFT using Hedera Service
      const mintResult = await HederaService.mintNFT(user.hederaAccountId, metadata);

     
      
      // Save badge in database
      const newBadge = new Badge({
        tokenId: mintResult.tokenId,
        userId: userId,
        courseId: courseId,
        metadata: metadata,
        transactionId: mintResult.transactionId
      });
      
      await newBadge.save();
      
      // Update user's badges
      await User.findByIdAndUpdate(userId, {
        $push: { badges: newBadge._id }
      });
      
      return res.status(201).json({ 
        success: true, 
        message: 'Badge minted successfully', 
        badge: newBadge 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'User has not completed this course yet' 
      });
    }
  } catch (error) {
    console.error('Error minting badge:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to mint badge', 
      error: error.message 
    });
  }
};

exports.getBadgeDetails = async (req, res) => {
  try {
    const tokenId = req.params.tokenId;
    const badge = await Badge.findOne({ tokenId })
      .populate('userId', 'username email')
      .populate('courseId', 'title description');
    
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }
    
    return res.status(200).json({ success: true, badge });
  } catch (error) {
    console.error('Error fetching badge details:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch badge details', 
      error: error.message 
    });
  }
};

exports.verifyBadge = async (req, res) => {
  try {
    const tokenId = req.params.tokenId;
    
    // First verify on blockchain
    const verificationResult = await SmartContractService.verifyBadge(tokenId);
    
    if (!verificationResult) {
      return res.status(404).json({ 
        success: false, 
        message: 'Badge not found or invalid' 
      });
    }

    // Get additional badge details from database
    const badge = await Badge.findOne({ tokenId })
      .populate('userId', 'username email')
      .populate('courseId', 'title description');

    return res.status(200).json({ 
      success: true, 
      verification: verificationResult,
      badge: badge 
    });
  } catch (error) {
    console.error('Error verifying badge:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify badge', 
      error: error.message 
    });
  }
};
