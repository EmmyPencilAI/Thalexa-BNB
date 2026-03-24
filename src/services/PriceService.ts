import axios from 'axios';

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export const fetchTokenPrices = async (): Promise<TokenPrice[]> => {
  try {
    // Fetch prices for SUI, NGN (using USD as proxy), ETH, BTC
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: 'sui,ethereum,bitcoin,tether',
        vs_currencies: 'usd',
        include_24hr_change: 'true'
      }
    });

    const data = response.data;
    
    return [
      {
        symbol: 'SUI',
        price: data.sui.usd,
        change24h: data.sui.usd_24h_change
      },
      {
        symbol: 'ETH',
        price: data.ethereum.usd,
        change24h: data.ethereum.usd_24h_change
      },
      {
        symbol: 'BTC',
        price: data.bitcoin.usd,
        change24h: data.bitcoin.usd_24h_change
      },
      {
        symbol: 'USDT',
        price: data.tether.usd,
        change24h: data.tether.usd_24h_change
      },
      {
        symbol: 'cNGN',
        price: 0.00065, // Mock NGN price in USD
        change24h: 0.12
      }
    ];
  } catch (error) {
    console.error('Error fetching token prices:', error);
    // Fallback mock data
    return [
      { symbol: 'SUI', price: 1.85, change24h: 5.2 },
      { symbol: 'ETH', price: 3450.20, change24h: -1.5 },
      { symbol: 'BTC', price: 68400.50, change24h: 2.1 },
      { symbol: 'USDT', price: 1.00, change24h: 0.01 },
      { symbol: 'cNGN', price: 0.00065, change24h: 0.12 }
    ];
  }
};
