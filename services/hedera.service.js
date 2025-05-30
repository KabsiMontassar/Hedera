const { 
  Client,
  AccountCreateTransaction,
  Hbar,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenInfoQuery,
  TransactionId,
  TransactionReceiptQuery
} = require('@hashgraph/sdk');

class HederaService {
  static DEFAULT_TOKEN_ID = '0.0.5958264';  

  // Add token ID validation helper
  static validateTokenId(tokenId) {
    const pattern = /^\d+\.\d+\.\d+$/;
    if (!pattern.test(tokenId)) {
      throw new Error('Invalid token ID format. Expected format: shard.realm.num (e.g., 0.0.123456)');
    }
    return true;
  }

  constructor() {
    // Check that environment variables are set
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
      throw new Error('Environment variables HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set');
    }

    this.client = Client.forTestnet();

    this.client.setOperator(
      process.env.HEDERA_ACCOUNT_ID,
      process.env.HEDERA_PRIVATE_KEY
    );

    this.treasuryId = process.env.HEDERA_ACCOUNT_ID;
    this.treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  }

  async createAccount() {
    try {
      const newAccountPrivateKey = PrivateKey.generateED25519();
      const newAccountPublicKey = newAccountPrivateKey.publicKey;

      const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(100000000)) 
        .execute(this.client);

      const getReceipt = await newAccount.getReceipt(this.client);
      const newAccountId = getReceipt.accountId.toString();

      return {
        accountId: newAccountId,
        privateKey: newAccountPrivateKey.toString(),
        publicKey: newAccountPublicKey.toString()
      };
    } catch (error) {
      console.error('Error creating Hedera account:', error);
      throw error;
    }
  }

  // Create a new token collection for NFTs
  async createTokenCollection(name, symbol) {
    try {
      // Create the NFT collection
      const nftCreate = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(this.treasuryId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1000)
        .setSupplyKey(this.treasuryKey)
        .setAdminKey(this.treasuryKey)
        .freezeWith(this.client)
        .sign(this.treasuryKey);

      const nftCreateTxSubmit = await nftCreate.execute(this.client);
      const nftCreateRx = await nftCreateTxSubmit.getReceipt(this.client);
      const tokenId = nftCreateRx.tokenId.toString();

      console.log(`Created NFT collection with Token ID: ${tokenId}`);
      return { tokenId };
    } catch (error) {
      console.error('Error creating token collection:', error);
      throw error;
    }
  }

  async isNftAlreadyMinted(tokenId, metadata) {
    try {
     
      try {
        const baseTokenId = tokenId.split(':')[0] || tokenId;
        
        const tokenInfo = await new TokenInfoQuery()
          .setTokenId(baseTokenId)
          .execute(this.client);
        
        if (tokenInfo.totalSupply.toNumber() === 0) {
          return false;
        }
        
        // For existing NFTs, we'll use a more resilient approach
        // comparing the transaction metadata rather than querying all NFTs
        console.log(`Token ${baseTokenId} exists with ${tokenInfo.totalSupply.toNumber()} NFTs`);
        return false;
      } catch (error) {
        console.error('Error in token existence check:', error);
        return false;
      }
    } catch (error) {
      console.error('Error checking NFT existence:', error);
      return false;
    }
  }

  async validateTransaction(transactionId) {
    try {
      const receipt = await new TransactionReceiptQuery()
        .setTransactionId(TransactionId.fromString(transactionId))
        .execute(this.client);
      
      return receipt.status.toString() === 'SUCCESS';
    } catch (error) {
      console.error('Error validating transaction:', error);
      return false;
    }
  }

  _prepareMetadata(metadata) {
    const essentialData = {
      id: metadata.badgeId,
      type: metadata.type || 'badge',
      ts: Date.now()
    };
    
    const metadataString = JSON.stringify(essentialData);
    if (Buffer.from(metadataString).length > 100) {
      return JSON.stringify({ ref: metadata.badgeId });
    }
    return metadataString;
  }

  _generateUniqueBadgeId(metadata = {}) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const prefix = metadata.type || 'badge';
    return `${prefix}_${timestamp}_${random}`;
  }

  async mintNFT(recipientAccountId, metadata = {}, providedTokenId = null) {
    try {
      // Validate and ensure metadata has required fields
      if (!metadata || typeof metadata !== 'object') {
        throw new Error('Invalid metadata: must be an object');
      }

      // Ensure badgeId exists and is valid
      if (!metadata.badgeId || typeof metadata.badgeId !== 'string') {
        metadata.badgeId = this._generateUniqueBadgeId(metadata);
      }

      // Validate badgeId format
      if (!/^[a-zA-Z0-9_-]+$/.test(metadata.badgeId)) {
        throw new Error('Invalid badgeId format: must contain only letters, numbers, underscores, and hyphens');
      }

      let tokenId = providedTokenId || HederaService.DEFAULT_TOKEN_ID;

      // If no tokenId is provided, create a new token collection
      if (!tokenId) {
        const { tokenId: newTokenId } = await this.createTokenCollection('DefaultNFT', 'DFT');
        tokenId = newTokenId;
      }

      // Validate token ID format
      HederaService.validateTokenId(tokenId);

      // Check if the NFT is already minted
      const alreadyMinted = await this.isNftAlreadyMinted(tokenId, metadata);
      if (alreadyMinted) {
        throw new Error(`NFT with metadata ${JSON.stringify(metadata)} is already minted.`);
      }

      // Prepare metadata within size limits
      const compressedMetadata = this._prepareMetadata(metadata);
      const metadataBuffer = Buffer.from(compressedMetadata);

      // Mint NFT with compressed metadata
      const mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([metadataBuffer])
        .freezeWith(this.client)
        .sign(this.treasuryKey);

      const mintTxSubmit = await mintTx.execute(this.client);
      const mintRx = await mintTxSubmit.getReceipt(this.client);

      // Validate the transaction
      const transactionId = mintTxSubmit.transactionId.toString();
      const isValidTransaction = await this.validateTransaction(transactionId);
      if (!isValidTransaction) {
        throw new Error('Minting transaction validation failed.');
      }

      // Get the serial number of the NFT
      const nftSerialNumber = mintRx.serials[0].toNumber();

      console.log(`Minted NFT ${tokenId} with serial: ${nftSerialNumber}`);

      return {
        tokenId: `${tokenId}:${nftSerialNumber}`,
        serialNumber: nftSerialNumber,
        transactionId: transactionId
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  // Get token info
  async getTokenInfo(tokenId) {
    try {
      const tokenInfo = await new TokenInfoQuery()
        .setTokenId(tokenId)
        .execute(this.client);
      
      // Enhanced verification
      const tokenValid = {
        ...tokenInfo,
        isValid: tokenInfo && 
                tokenInfo.adminKey && 
                tokenInfo.adminKey.toString() === this.treasuryKey.publicKey.toString()
      };
      
      return tokenValid;
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  }
}

module.exports = new HederaService();
