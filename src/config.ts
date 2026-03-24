/**
 * Thalexa Configuration File
 * 
 * This file centralizes all API keys and contract addresses.
 * For security, these should be set in your environment variables (.env).
 */

export const CONFIG = {
  // 1. SUI BLOCKCHAIN
  SUI: {
    NETWORK: 'testnet', // 'mainnet' | 'testnet' | 'devnet'
    PACKAGE_ID: import.meta.env.VITE_SUI_PACKAGE_ID || '0xYOUR_DEPLOYED_PACKAGE_ID_HERE',
    MODULES: {
      ESCROW: 'escrow',
      VERIFICATION: 'verification',
    }
  },

  // 2. PINATA (IPFS)
  // Get these from: https://app.pinata.cloud/
  PINATA: {
    API_KEY: import.meta.env.VITE_PINATA_API_KEY || '',
    API_SECRET: import.meta.env.VITE_PINATA_API_SECRET || '',
    JWT: import.meta.env.VITE_PINATA_JWT || '',
  },

  // 3. PAYSTACK (Fiat Payments)
  // Get these from: https://dashboard.paystack.com/
  PAYSTACK: {
    PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  },

  // 4. CRYPTOMUS (Crypto Payments)
  // Get these from: https://cryptomus.com/
  CRYPTOMUS: {
    MERCHANT_ID: import.meta.env.VITE_CRYPTOMUS_MERCHANT_ID || '',
    API_KEY: import.meta.env.VITE_CRYPTOMUS_API_KEY || '',
  },

  // 5. SUPABASE (Database & Auth)
  // Handled automatically in lib/supabase.ts
};
