# Hedera NFT Badges Platform

This application allows users to earn NFT badges on the Hedera network when they complete courses or tasks.

## Features

- User registration and profile management
- Course creation and completion tracking
- Automatic NFT badge minting on the Hedera network
- Smart contract integration for verification
- View earned badges and their details

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Hedera account ID and private key
   - Configure MongoDB connection string

3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

## API Endpoints

### User Endpoints
- `POST /api/users/register` - Register a new user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Course Endpoints
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get a specific course
- `POST /api/courses` - Create a new course
- `POST /api/courses/:id/complete` - Mark a course as completed

### Badge Endpoints
- `GET /api/badges/user/:userId` - Get all badges for a user
- `POST /api/badges/mint` - Mint a new badge
- `GET /api/badges/:tokenId` - Get badge details

## Technical Details

This application uses:
- Node.js and Express.js for the backend
- Hedera SDK for blockchain interactions
- MongoDB for data storage
- Hedera Token Service (HTS) for NFT creation and management
- Hedera Smart Contracts for verification logic

## Smart Contract Integration

The application includes a simple Solidity smart contract (`BadgeVerification.sol`) that can be deployed to Hedera's smart contract service. This contract:
- Tracks course completions
- Verifies eligibility for badge minting
- Records badge minting events

In a production environment, you would deploy this contract and update the `VERIFICATION_CONTRACT_ID` in your environment variables.
