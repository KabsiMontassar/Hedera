// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BadgeVerification {
    struct Badge {
        string badgeId;
        string courseId;
        string userId;
        uint256 issuanceDate;
        bool isValid;
        string metadataHash;
    }

    // Contract state variables
    address public administrator;
    mapping(string => Badge) private badges;
    mapping(string => mapping(string => bool)) private userCompletions;
    mapping(address => bool) public authorizedIssuers;

    // Events
    event BadgeIssued(string badgeId, string userId, string courseId, uint256 timestamp);
    event CourseCompleted(string userId, string courseId, uint256 timestamp);
    event IssuerAuthorized(address issuer, uint256 timestamp);
    event IssuerRevoked(address issuer, uint256 timestamp);

    // Constructor
    constructor() {
        administrator = msg.sender;
    }

    // Modifier to restrict functions to administrator
    modifier onlyAdministrator() {
        require(msg.sender == administrator, "Only administrator can call this function");
        _;
    }

    // Record course completion
    function completeCourse(string memory userId, string memory courseId) public onlyAdministrator returns (bool) {
        require(bytes(userId).length > 0, "User ID cannot be empty");
        require(bytes(courseId).length > 0, "Course ID cannot be empty");
        
        // Check if already completed
        require(!userCompletions[userId][courseId], "Course already completed");
        
        // Mark as completed
        userCompletions[userId][courseId] = true;
        
        // Emit event
        emit CourseCompleted(userId, courseId, block.timestamp);
        
        return true;
    }

    // Verify if a course is completed
    function verifyCourseCompletion(string memory userId, string memory courseId) public view returns (bool) {
        return userCompletions[userId][courseId];
    }

    // Record badge issuance
    function issueBadge(
        string memory badgeId,
        string memory userId,
        string memory courseId,
        string memory metadataHash
    ) public returns (bool) {
        require(authorizedIssuers[msg.sender], "Unauthorized issuer");
        require(userCompletions[userId][courseId], "Course not completed");
        require(bytes(badgeId).length > 0, "Badge ID cannot be empty");
        require(bytes(metadataHash).length > 0, "Metadata hash cannot be empty");

        Badge memory newBadge = Badge({
            badgeId: badgeId,
            courseId: courseId,
            userId: userId,
            issuanceDate: block.timestamp,
            isValid: true,
            metadataHash: metadataHash
        });

        badges[badgeId] = newBadge;

        emit BadgeIssued(badgeId, userId, courseId, block.timestamp);

        return true;
    }

    // Verify badge details
    function verifyBadge(string memory badgeId) 
        external 
        view 
        returns (
            bool isValid,
            string memory userId,
            string memory courseId,
            uint256 issuanceDate,
            string memory metadataHash
        ) 
    {
        Badge memory badge = badges[badgeId];
        return (
            badge.isValid,
            badge.userId,
            badge.courseId,
            badge.issuanceDate,
            badge.metadataHash
        );
    }

    // Authorize an issuer
    function authorizeIssuer(address issuer) external onlyAdministrator {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, block.timestamp);
    }

    // Revoke an issuer
    function revokeIssuer(address issuer) external onlyAdministrator {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, block.timestamp);
    }
}
