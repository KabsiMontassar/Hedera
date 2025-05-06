// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BadgeVerification {
    // Contract owner
    address public owner;
    
    // Mapping to store course completions
    mapping(string => mapping(string => bool)) private courseCompletions;
    
    // Events
    event CourseCompleted(string userId, string courseId, uint256 timestamp);
    event BadgeMinted(string userId, string courseId, string badgeId, uint256 timestamp);
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Modifier to restrict functions to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Record course completion
    function completeCourse(string memory userId, string memory courseId) public onlyOwner returns (bool) {
        require(bytes(userId).length > 0, "User ID cannot be empty");
        require(bytes(courseId).length > 0, "Course ID cannot be empty");
        
        // Check if already completed
        require(!courseCompletions[userId][courseId], "Course already completed");
        
        // Mark as completed
        courseCompletions[userId][courseId] = true;
        
        // Emit event
        emit CourseCompleted(userId, courseId, block.timestamp);
        
        return true;
    }
    
    // Verify if a course is completed
    function verifyCourseCompletion(string memory userId, string memory courseId) public view returns (bool) {
        return courseCompletions[userId][courseId];
    }
    
    // Record badge minting (would be called after minting on Hedera)
    function recordBadgeMint(string memory userId, string memory courseId, string memory badgeId) public onlyOwner returns (bool) {
        require(courseCompletions[userId][courseId], "Course not completed");
        
        // Emit badge minted event
        emit BadgeMinted(userId, courseId, badgeId, block.timestamp);
        
        return true;
    }
}
