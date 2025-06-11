# Hedera NFT Badge Platform 🏆

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%3E%3D4.4-green)](https://www.mongodb.com/)

A decentralized platform built on Hedera Hashgraph for issuing, managing and verifying NFT badges for educational achievements and course completions.

## ✨ Key Features

- **📱 User Management**
  - Automated Hedera account creation
  - Custom NFT wallet integration 
  - Achievement tracking
  - Badge collection management

- **🎓 Course System**
  - Course progress tracking
  - Smart contract completion verification
  - Achievement unlocking system

- **🔗 NFT Badge System**
  - Automated minting on achievement
  - On-chain verification
  - IPFS metadata storage
  - Badge templates

## 🛠️ Tech Stack

- **Blockchain**: Hedera Hashgraph
- **Smart Contracts**: Hedera Smart Contract Service
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Storage**: IPFS

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Hedera testnet account credentials
- IPFS node (optional)

## 🚀 Quick Start

1. **Clone & Install**
   ```bash 
   git clone https://github.com/yourusername/hedera-nft-badges
   cd hedera-nft-badges
   npm install
   ```

2. **Configure Environment**
   Create `.env` file:
   ```env
   # Hedera Network
   HEDERA_NETWORK=testnet
   HEDERA_ACCOUNT_ID=your.account.id
   HEDERA_PRIVATE_KEY=your-private-key
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/badges
   
   # Server
   PORT=3000
   ```

3. **Start Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication & Users
```http
POST   /api/users/register         # Create new user + Hedera account
GET    /api/users/profile/:email  # Get user profile & badges
PUT    /api/users/profile/:email  # Update user information
```

### Courses
```http
GET    /api/courses              # List all courses
POST   /api/courses             # Create new course
GET    /api/courses/:id         # Get course details
POST   /api/courses/:id/complete # Mark course as completed
```

### Badges
```http
GET    /api/badges/user/:email  # Get user's badge collection
POST   /api/badges/mint         # Mint new achievement badge
GET    /api/badges/:tokenId     # Get badge details
GET    /api/badges/verify/:id   # Verify badge authenticity
```

## 🧪 Testing Guide

1. **Environment Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Create .env file (already done)
   # Start the server
   npm run dev
   ```

2. **Test Endpoints Using Postman/cURL**

   a. **Create New User**
   ```bash
   curl -X POST http://localhost:3000/api/users/register \
   -H "Content-Type: application/json" \
   -d '{"username": "testuser", "email": "test@example.com"}'
   ```

   b. **Create Course**
   ```bash
   curl -X POST http://localhost:3000/api/courses \
   -H "Content-Type: application/json" \
   -d '{
     "title": "Test Course",
     "description": "Test Description",
     "difficulty": "Beginner",
     "badgeMetadata": {
       "name": "Test Badge",
       "symbol": "TBG",
       "description": "Test Badge Description",
       "imageUrl": "https://example.com/badge.png"
     }
   }'
   ```

   c. **Complete Course & Mint Badge**
   ```bash
   # First, complete the course (replace courseId)
   curl -X POST http://localhost:3000/api/courses/[courseId]/complete \
   -H "Content-Type: application/json" \
   -d '{"userEmail": "test@example.com"}'

   # Then mint the badge
   curl -X POST http://localhost:3000/api/badges/mint \
   -H "Content-Type: application/json" \
   -d '{
     "userEmail": "test@example.com",
     "courseId": "[courseId]"
   }'
   ```

   d. **View User Badges**
   ```bash
   curl http://localhost:3000/api/badges/user/test@example.com
   ```

3. **Testing Health Records**
   ```bash
   # Submit health record
   curl -X POST http://localhost:3000/api/health-records/submit \
   -H "Content-Type: application/json" \
   -d '{
     "patientId": "123",
     "content": "Test health record content",
     "metadata": {
       "provider": "Dr Test",
       "facility": "Test Hospital"
     }
   }'
   ```

4. **Expected Test Flow**:
   - Register a new user (creates Hedera account)
   - Create a test course
   - Complete the course
   - Mint badge for completion
   - View user's badges
   - Submit test health record
   - View health record metadata

**Note**: Keep track of IDs returned in responses as you'll need them for subsequent requests.

5. **Monitoring**:
   - Watch server console for detailed logs
   - Check MongoDB database for created records
   - Use Hedera testnet explorer (https://hashscan.io/testnet) to verify transactions

## 🔒 Security Features

- **Smart Contract Verification**
  - Course completion validation
  - Badge minting authorization
  - Transaction verification

- **Data Integrity**
  - Immutable badge metadata
  - On-chain verification
  - IPFS content addressing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request