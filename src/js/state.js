export const state = {
  user: null,
  profile: null,
  assets: [
    { id: 'sui', name: 'Sui', symbol: 'SUI', balance: 1250.50, price: 1.85, icon: 'https://cryptologos.cc/logos/sui-sui-logo.png' },
    { id: 'cngn', name: 'Compliant Naira', symbol: 'cNGN', balance: 850000, price: 0.00065, icon: 'https://picsum.photos/seed/cngn/100/100' },
    { id: 'usdc', name: 'USDC', symbol: 'USDC', balance: 5420.25, price: 1.00, icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' }
  ],
  escrows: [
    { id: '1', title: 'iPhone 15 Pro Max', amount: '450 SUI', status: 'In Transit', date: '2024-03-20', recipient: '0x3a...f12c' },
    { id: '2', title: 'Freelance Design', amount: '120 SUI', status: 'Pending Approval', date: '2024-03-22', recipient: '0x8b...e4a1' }
  ],
  
  setUser(user) {
    this.user = user;
    localStorage.setItem('thalexa_user', JSON.stringify(user));
  },
  
  setProfile(profile) {
    this.profile = profile;
    localStorage.setItem('thalexa_profile', JSON.stringify(profile));
  },
  
  clear() {
    this.user = null;
    this.profile = null;
    localStorage.removeItem('thalexa_user');
    localStorage.removeItem('thalexa_profile');
  }
};
