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
  CustomRoyaltyFee,
  CustomFixedFee
} = require('@hashgraph/sdk');

class HederaService {
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

    this.treasuryId = process.env.HEDERA_ACCOUNT_ID;
    this.treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  }

  // Create a new account on Hedera
  async createAccount() {
    try {
      // Generate a new key pair
      const newAccountPrivateKey = PrivateKey.generateED25519();
      const newAccountPublicKey = newAccountPrivateKey.publicKey;

      // Create a new account with 1 HBAR starting balance
      const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(100000000)) // 1 HBAR
        .execute(this.client);

      // Get the account ID
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

  // Mint an NFT for a user
  async mintNFT(recipientAccountId, metadata) {
    try {
      // For simplicity, we'll use a single token collection for all badges
      // In a real app, you might want to create separate collections per course or category
      let tokenId = process.env.BADGE_TOKEN_ID;
      
      // If token doesn't exist yet, create it
      if (!tokenId) {
        const tokenCollection = await this.createTokenCollection('Learning Badges', 'BADGE');
        tokenId = tokenCollection.tokenId;
        // In a real app, save this to your database or update env vars
        console.log(`Created token collection with ID: ${tokenId}`);
      }

      // Convert metadata to buffer
      const metadataBuffer = Buffer.from(JSON.stringify(metadata));

      // Mint NFT with metadata
      const mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([metadataBuffer])
        .freezeWith(this.client)
        .sign(this.treasuryKey);

      const mintTxSubmit = await mintTx.execute(this.client);
      const mintRx = await mintTxSubmit.getReceipt(this.client);

      // Get the serial number of the NFT
      const nftSerialNumber = mintRx.serials[0].toNumber();
      
      console.log(`Minted NFT ${tokenId} with serial: ${nftSerialNumber}`);
      
      // TODO: In a real app, you would transfer the NFT to the user's account here
      // using a TokenTransferTransaction
      
      return { 
        tokenId: `${tokenId}:${nftSerialNumber}`, 
        serialNumber: nftSerialNumber,
        transactionId: mintTxSubmit.transactionId.toString()
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
