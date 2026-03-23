import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';

// Default to testnet for development
export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

export const THALEXA_PACKAGE_ID = import.meta.env.VITE_SUI_PACKAGE_ID || '0x...';
