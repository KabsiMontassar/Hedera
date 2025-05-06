const Badge = require('../models/badge.model');
const User = require('../models/user.model');
const Course = require('../models/course.model');
const HederaService = require('../services/hedera.service');

exports.getUserBadges = async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ensure `courseId` is populated correctly
    const badges = await Badge.find({ userId: user._id }).populate({
      path: 'courseId',
      model: 'Course' // Explicitly specify the model to populate
    });

    return res.status(200).json({ success: true, badges });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch badges',
      error: error.message
    });
  }
};

exports.mintBadge = async (req, res) => {
  try {
    const { userEmail, courseId } = req.body;

    // Verify user and course existence
    const [user, course] = await Promise.all([
      User.findOne({ email: userEmail }),
      Course.findById(courseId)
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if user has already completed this course
    if (!user.completedCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'User has not completed this course yet'
      });
    }

    // Check for existing badge for this user and course
    const existingBadge = await Badge.findOne({
      userId: user._id,
      courseId: courseId
    });

    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: 'Badge already exists for this user and course',
        badge: existingBadge
      });
    }

    // Generate optimized badge metadata
    const metadata = (() => {
      const metadataV1 = {
        n: course.title.substring(0, 20),
        d: course.badgeMetadata?.description?.substring(0, 40) || `Completed ${course.title.substring(0, 10)}`,
        i: course.badgeMetadata?.imageUrl?.substring(0, 30),
        p: {
          d: new Date().toISOString().split('T')[0],
          l: course.difficulty.charAt(0),
          s: "HBP"
        }
      };

      if (Buffer.from(JSON.stringify(metadataV1)).length <= 100) return metadataV1;

      return {
        n: course.title.substring(0, 15),
        d: course.title.substring(0, 15),
        p: {
          d: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          s: "HBP"
        }
      };
    })();

    // Validate metadata size
    if (Buffer.from(JSON.stringify(metadata)).length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Badge metadata exceeds size limit after optimization',
        metadata
      });
    }

    // Mint NFT using Hedera Service - handle potential Hedera errors
    let mintResult;
    try {
      mintResult = await HederaService.mintNFT(user.hederaAccountId, metadata);
      console.log('Mint result:', mintResult);
    } catch (hederaError) {
      console.error('Hedera minting error:', hederaError);
      return res.status(500).json({
        success: false,
        message: 'Error during NFT minting on Hedera',
        error: hederaError.message
      });
    }

    if (!mintResult || !mintResult.transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Failed to mint badge: transaction details missing'
      });
    }

    const newBadge = new Badge({
      userId: user._id,
      courseId: course._id,
      name: course.title,
      description: course.badgeMetadata?.description || `Completed ${course.title}`,
      image: course.badgeMetadata?.imageUrl || 'default-badge-image.png',
      criteria: `Complete ${course.title} course with ${course.difficulty} difficulty`,
      transactionId: mintResult.transactionId,
      tokenId: mintResult.tokenId, // Add the tokenId from mint result
      metadata: {
        optimizedForHedera: {
          name: course.title,
          description: course.badgeMetadata?.description,
          imageUrl: course.badgeMetadata?.imageUrl,
          tokenId: mintResult.tokenId, // Also include it in the metadata
          properties: {
            completionDate: new Date(),
            difficulty: course.difficulty,
            issuer: "Hedera Badge Platform",
          }
        },
        fullMetadata: {
          name: course.title,
          description: course.badgeMetadata?.description,
          imageUrl: course.badgeMetadata?.imageUrl,
          properties: {
            completionDate: new Date(),
            difficulty: course.difficulty,
            issuer: "Hedera Badge Platform"
          }
        }
      }
    });

    console.log('New badge object:', newBadge);

    // Add error handling with proper validation of tokenId
    if (!newBadge.tokenId) {
      return res.status(400).json({
        success: false,
        message: 'Failed to mint badge: token ID missing'
      });
    }

    try {
      await newBadge.save();
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate badge detected',
          error: error.message
        });
      }
      throw error;
    }
    await User.findByIdAndUpdate(user._id, { $push: { badges: newBadge._id } });

    return res.status(201).json({
      success: true,
      message: 'Badge minted successfully',
      badge: {
        transactionId: newBadge.transactionId,
        courseTitle: course.title,
        optimizedMetadata: newBadge.metadata.optimizedForHedera
      }
    });
  } catch (error) {
    if (error.message === 'NFT with identical metadata already exists') {
      return res.status(400).json({
        success: false,
        message: 'Badge already minted',
        error: error.message
      });
    }
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
    const transactionId = req.params.transactionId;
    const badge = await Badge.findOne({ transactionId })
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
    const transactionId = req.params.transactionId;

    // Get badge details from database
    const badge = await Badge.findOne({ transactionId })
      .populate('userId', 'username email')
      .populate('courseId', 'title description');

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found or invalid'
      });
    }

    try {
      // Verify the transaction exists on Hedera
      const tokenInfo = await HederaService.getTokenInfo(badge.metadata.optimizedForHedera?.tokenId);

      // Additional verification steps
      const isValid = tokenInfo &&
        tokenInfo.totalSupply > 0 &&
        tokenInfo.treasuryAccountId === process.env.HEDERA_ACCOUNT_ID;

      return res.status(200).json({
        success: true,
        isValid,
        badge: badge,
        tokenInfo: tokenInfo
      });
    } catch (hederaError) {
      console.error('Error verifying token on Hedera:', hederaError.message);
      return res.status(400).json({
        success: false,
        message: 'Failed to verify token on Hedera',
        error: hederaError.message
      });
    }
  } catch (error) {
    console.error('Error verifying badge:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify badge',
      error: error.message
    });
  }
};
