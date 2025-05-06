# Hedera NFT Badge Platform

A decentralized platform for issuing verifiable NFT badges on the Hedera network for course completion and achievements.

## Features

- 🏆 NFT Badge Issuance & Management
  - Automatic NFT minting upon course completion
  - Verifiable on-chain badge credentials
  - IPFS metadata storage
  
- 🔐 Smart Contract Integration
  - Badge verification system
  - Course completion tracking
  - Authorized issuer management
  
- 👤 User Management
  - Hedera account creation
  - Profile management
  - Badge wallet integration

- 📚 Course Management
  - Course creation and tracking
  - Completion verification
  - Badge metadata templates

## Technology Stack

- **Blockchain**: Hedera Network
- **Smart Contracts**: Solidity
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Storage**: IPFS (for metadata)

## Prerequisites

- Node.js v14+
- MongoDB 4.4+
- Hedera testnet account
- IPFS node 

## Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/KabsiMontassar/Hedera
   cd Hedera
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   # Network Configuration
   HEDERA_NETWORK=testnet
   
   # Hedera Credentials
   HEDERA_ACCOUNT_ID=your-account-id
   HEDERA_PRIVATE_KEY=your-private-key
   
   # Smart Contract
   VERIFICATION_CONTRACT_ID=your-contract-id
   BADGE_TOKEN_ID=your-token-id
   
   # Database
   MONGODB_URI=your-mongodb-uri
   
   # Server
   PORT=3000
   ```

## Smart Contract Deployment

1. Deploy the BadgeVerification contract:
   ```bash
   # Using Hedera CLI or SDK
   hedera contract deploy BadgeVerification.sol
   ```

2. Update the `VERIFICATION_CONTRACT_ID` in your `.env`


## API Endpoints

### User Management
```
POST /api/users/register
GET  /api/users/:id
PUT  /api/users/:id
```

### Course Management
```
GET    /api/courses
POST   /api/courses
GET    /api/courses/:id
POST   /api/courses/:id/complete
```

### Badge Management
```
GET    /api/badges/user/:userId
POST   /api/badges/mint
GET    /api/badges/:tokenId
GET    /api/badges/verify/:tokenId
```

## Smart Contract Functions

### Badge Verification
- `issueBadge(string badgeId, string userId, string courseId, string metadataHash)`
- `verifyBadge(string badgeId)`
- `completeCourse(string userId, string courseId)`
- `verifyCourseCompletion(string userId, string courseId)`

### Access Control
- `authorizeIssuer(address issuer)`
- `revokeIssuer(address issuer)`

## Development

```bash
# Start development server
npm run dev

# Start production server
npm start
```

## Security Considerations

- All badge issuance requires authorized issuers
- Course completion verification is on-chain
- Badge metadata is immutable once issued
- Admin controls for issuer management

## Error Handling

The API returns standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support and questions, please open an issue in the GitHub repository.
