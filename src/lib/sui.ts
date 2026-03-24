import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// 1. UPDATE YOUR NETWORK HERE (mainnet, testnet, devnet)
const NETWORK = 'testnet'; 
export const suiClient = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

// 2. UPDATE YOUR DEPLOYED PACKAGE ID HERE
// You can also set this in your .env file as VITE_SUI_PACKAGE_ID
export const THALEXA_PACKAGE_ID = import.meta.env.VITE_SUI_PACKAGE_ID || '0xYOUR_DEPLOYED_PACKAGE_ID_HERE';

// 3. MODULE NAMES (Must match your Move contract)
export const MODULES = {
  ESCROW: 'escrow',
  VERIFICATION: 'verification',
};

/**
 * Creates an escrow transaction block.
 * @param receiver The address of the recipient
 * @param amount The amount in SUI (MIST)
 */
export const createEscrowTx = (receiver: string, amount: number) => {
  const txb = new TransactionBlock();
  
  // Convert SUI to MIST (1 SUI = 10^9 MIST)
  const mistAmount = BigInt(Math.floor(amount * 1_000_000_000));

  const [coin] = txb.splitCoins(txb.gas, [txb.pure(mistAmount)]);

  txb.moveCall({
    target: `${THALEXA_PACKAGE_ID}::${MODULES.ESCROW}::create_escrow`,
    arguments: [
      coin,
      txb.pure(receiver),
    ],
  });

  return txb;
};

/**
 * Creates a product registration transaction block.
 * @param name Product name
 * @param description Product description
 * @param ipfsHash IPFS hash for metadata
 */
export const createProductRegistrationTx = (name: string, description: string, ipfsHash: string) => {
  const txb = new TransactionBlock();

  txb.moveCall({
    target: `${THALEXA_PACKAGE_ID}::${MODULES.VERIFICATION}::register_product`,
    arguments: [
      txb.pure(name),
      txb.pure(description),
      txb.pure(ipfsHash),
    ],
  });

  return txb;
};

/**
 * Fetches product details from the blockchain.
 * @param productId The ID of the product object on Sui
 */
export const getProductDetails = async (productId: string) => {
  try {
    const result = await suiClient.getObject({
      id: productId,
      options: {
        showContent: true,
        showOwner: true,
      },
    });
    return result.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};
