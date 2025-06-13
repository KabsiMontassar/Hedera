# 🏛️ Hedera Healthcare Records & Badge System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hedera](https://img.shields.io/badge/Hedera-Hashgraph-00D4A0)](https://hedera.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v4.4+-darkgreen)](https://www.mongodb.com/)

A secure, decentralized platform built on Hedera Hashgraph for managing healthcare records and issuing verifiable NFT badges for medical achievements and certifications.

## 🌟 Core Features

### 🔐 Hedera Blockchain Integration

1. **Smart Contract Services**
   - NFT minting for achievements/certifications
   - File service for document references
   - Topic messages for audit trails
   - Treasury management for token operations

2. **HCS (Hedera Consensus Service)**
   - Immutable audit logging
   - Real-time record validation
   - Consensus timestamps for all records
   - Verifiable message sequences

3. **Token Service (HTS)**
   - NFT creation for badges
   - Unique token IDs for each record
   - Custom token properties
   - Supply management

4. **File Service**
   - IPFS hash storage
   - Document fingerprinting
   - Reference management
   - Permanent record links

### 📋 Healthcare Records Management

- End-to-end encryption
- IPFS distributed storage
- Blockchain-verified integrity
- Patient access control
- Audit trail tracking

### 🏆 NFT Badge System

- Course completion verification
- Achievement tracking
- On-chain badge minting
- Verifiable credentials
- Token metadata management

## 🛠️ Technical Architecture

### Blockchain Layer (Hedera)
```
┌─────────────────────────────────────┐
│           Hedera Network            │
├─────────────┬──────────┬───────────┤
│    HCS      │   HTS    │   HFS     │
│  (Topics)   │ (Tokens) │ (Files)   │
└─────────────┴──────────┴───────────┘
```

### Application Layer
```
┌─────────────────────────────────────┐
│           Express Server            │
├─────────────┬──────────┬───────────┤
│  Records    │  Badges  │   Users   │
│  Service    │ Service  │  Service  │
└─────────────┴──────────┴───────────┘
```

### Storage Layer
```
┌─────────────────────────────────────┐
│        Distributed Storage          │
├─────────────┬──────────┬───────────┤
│    IPFS     │ MongoDB  │  Hedera   │
│  (Content)  │ (Meta)   │ (Verify)  │
└─────────────┴──────────┴───────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js v14+
- MongoDB v4.4+
- Hedera testnet account
- IPFS node (optional)

### Environment Setup

```bash
# Clone repository
git clone https://github.com/yourusername/hedera-healthcare
cd hedera-healthcare

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

Edit `.env`:
```env
# Hedera Network
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=your.account.id
HEDERA_PRIVATE_KEY=your-private-key

# Storage
MONGODB_URI=mongodb://localhost:27017/healthcare
PINATA_API_KEY=your-pinata-key

# Server
PORT=3000
```

### Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 API Documentation

### Health Records

```http
POST /api/health-records/submit
{
  "patientId": "patient@email.com",
  "content": "Health record content",
  "metadata": {
    "provider": "Dr. Smith",
    "facility": "General Hospital"
  }
}
```

#### Response
```json
{
  "success": true,
  "documentId": "hr_1234567890",
  "hederaTransaction": {
    "transactionId": "0.0.123@1234567890.000",
    "consensusTimestamp": "1234567890.000000000"
  }
}
```

### NFT Badges

```http
POST /api/badges/mint
{
  "userEmail": "user@email.com",
  "courseId": "course_id",
  "metadata": {
    "name": "Course Completion",
    "description": "Successfully completed the course"
  }
}
```

#### Response
```json
{
  "success": true,
  "badge": {
    "tokenId": "0.0.123456",
    "serialNumber": 1,
    "transactionId": "0.0.123@1234567890.000"
  }
}
```

## 🔐 Security Features

### Hedera Security
1. **Consensus Verification**
   - HCS message validation
   - Transaction receipt verification
   - Node consensus checks

2. **Token Security**
   - Treasury key management
   - Supply key controls
   - Admin key restrictions

3. **File Security**
   - Immutable file records
   - Hash verification
   - Access key management

### Data Security
1. **Encryption**
   - AES-256-GCM encryption
   - Key derivation
   - Secure key storage

2. **Access Control**
   - Role-based access
   - Patient consent management
   - Provider verification

## 📊 Performance Metrics

- Transaction finality: ~3-5 seconds
- Record retrieval: ~200ms
- Badge minting: ~5 seconds
- IPFS storage: ~2 seconds

## 🤝 Contributing

1. Fork repository
2. Create feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push to branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open Pull Request

## 📄 License

MIT License - see LICENSE.md

## 🙏 Acknowledgments

- Hedera Hashgraph team
- IPFS project
- MongoDB team
- Open source community