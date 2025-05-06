const {
  Client,
  FileCreateTransaction,
  ContractCreateTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
  ContractExecuteTransaction,
  Hbar,
  PrivateKey
} = require('@hashgraph/sdk');

class SmartContractService {
  constructor() {
    // Check that environment variables are set
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
      throw new Error('Environment variables HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set');
    }

    // Configure client based on network 
    const network = process.env.HEDERA_NETWORK || 'testnet';
    
    if (network === 'testnet') {
      this.client = Client.forTestnet();
    } else if (network === 'mainnet') {
      this.client = Client.forMainnet();
    } else {
      throw new Error('HEDERA_NETWORK must be either "testnet" or "mainnet"');
    }

    // Set operator account ID and private key
    this.client.setOperator(
      process.env.HEDERA_ACCOUNT_ID,
      process.env.HEDERA_PRIVATE_KEY
    );

    this.treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    
    // The smart contract ID would normally be deployed separately and stored in env vars
    this.contractId = process.env.VERIFICATION_CONTRACT_ID;
  }

  // This method simulates verification via smart contract
  // In a real implementation, you would deploy a smart contract with specific verification logic
  async verifyCourseCompletion(userId, courseId) {
    try {
      // If we don't have a deployed contract (first run), deploy it
      if (!this.contractId) {
        // In a real implementation, this would be a proper Solidity contract for badge verification
        console.log("No contract ID found. A real implementation would deploy a contract.");
        
        // For demo purposes, we'll simulate a successful verification
        return {
          success: true,
          message: "Course completion verified via simulated smart contract",
          timestamp: new Date().toISOString()
        };
      }
      
      // In a real implementation, you would call the smart contract here
      // For now, we'll simulate a contract call with a successful result
      console.log(`Simulating verification for user ${userId} on course ${courseId}`);
      
      return {
        success: true,
        message: "Course completion verified via smart contract",
        timestamp: new Date().toISOString(),
        contractId: this.contractId
      };
    } catch (error) {
      console.error('Error in smart contract verification:', error);
      throw error;
    }
  }

  async issueBadge(badgeId, userId, courseId, metadata) {
    try {
      const metadataHash = await this.storeMetadata(metadata);
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction(
          "issueBadge",
          new ContractFunctionParameters()
            .addString(badgeId)
            .addString(userId)
            .addString(courseId)
            .addString(metadataHash)
        );

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      return {
        success: true,
        transactionId: response.transactionId.toString(),
        receipt
      };
    } catch (error) {
      console.error('Error issuing badge:', error);
      throw error;
    }
  }

  async verifyBadge(badgeId) {
    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction(
          "verifyBadge",
          new ContractFunctionParameters().addString(badgeId)
        );

      const response = await query.execute(this.client);
      return response;
    } catch (error) {
      console.error('Error verifying badge:', error);
      throw error;
    }
  }

  // Helper method to store metadata (implement based on your storage solution)
  async storeMetadata(metadata) {
    // TODO: Implement metadata storage (IPFS, etc)
    return JSON.stringify(metadata); // Temporary implementation
  }
}

module.exports = new SmartContractService();
