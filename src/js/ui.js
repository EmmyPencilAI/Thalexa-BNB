import { state } from './state.js';

export const ui = {
  renderAssets() {
    const list = document.getElementById('asset-list');
    if (!list) return;
    
    list.innerHTML = state.assets.map(asset => `
      <div class="glass p-4 rounded-3xl flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-white/5 p-2 flex items-center justify-center">
            <img src="${asset.icon}" alt="${asset.name}" class="w-full h-full object-contain rounded-lg" referrerPolicy="no-referrer">
          </div>
          <div>
            <p class="font-bold">${asset.name}</p>
            <p class="text-[10px] text-gray-500 font-mono">${asset.symbol}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold">${asset.balance.toLocaleString()}</p>
          <p class="text-[10px] text-gray-500">$${(asset.balance * asset.price).toLocaleString()}</p>
        </div>
      </div>
    `).join('');
  },
  
  renderEscrows() {
    const list = document.getElementById('escrow-list');
    if (!list) return;
    
    list.innerHTML = state.escrows.map(escrow => `
      <div class="glass p-6 rounded-3xl space-y-4">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-bold text-sm">${escrow.title}</h4>
            <p class="text-[10px] text-gray-500">${escrow.date} â€¢ To: ${escrow.recipient}</p>
          </div>
          <span class="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[8px] font-bold uppercase tracking-widest">${escrow.status}</span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-white/5">
          <p class="text-lg font-display font-bold text-primary">${escrow.amount}</p>
          <button class="text-[10px] font-bold glass px-4 py-2 rounded-xl">Details</button>
        </div>
      </div>
    `).join('');
  },
  
  updateUsage() {
    const volume = state.profile?.monthly_volume || 0;
    const products = state.profile?.product_count || 0;
    const volumeLimit = 2000;
    const productLimit = 10;
    
    const volumePercent = Math.min(100, (volume / volumeLimit) * 100);
    const productPercent = Math.min(100, (products / productLimit) * 100);
    
    // Wallet screen
    const text = document.getElementById('volume-text');
    const bar = document.getElementById('volume-progress');
    if (text) text.textContent = `$${volume.toLocaleString()} / $${volumeLimit.toLocaleString()}`;
    if (bar) bar.style.width = `${volumePercent}%`;
    
    // Subscription screen
    const subVolText = document.getElementById('sub-volume-text');
    const subVolBar = document.getElementById('sub-volume-progress');
    const subProdText = document.getElementById('sub-product-text');
    const subProdBar = document.getElementById('sub-product-progress');
    
    if (subVolText) subVolText.textContent = `$${volume.toLocaleString()} / $${volumeLimit.toLocaleString()}`;
    if (subVolBar) subVolBar.style.width = `${volumePercent}%`;
    if (subProdText) subProdText.textContent = `${products} / ${productLimit}`;
    if (subProdBar) subProdBar.style.width = `${productPercent}%`;
  },
  
  updateProfile() {
    const address = document.getElementById('wallet-address');
    const fullAddress = document.getElementById('full-address');
    const avatar = document.getElementById('user-avatar');
    
    if (state.user) {
      const addr = state.user.id.substring(0, 10) + '...';
      if (address) address.textContent = addr;
      if (fullAddress) fullAddress.textContent = state.user.id;
      if (avatar) avatar.textContent = state.user.email.substring(0, 2).toUpperCase();
    }
  },
  
  generateQR(text) {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) return;
    
    qrContainer.innerHTML = '';
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    qrContainer.innerHTML = qr.createImgTag(6);
    
    const img = qrContainer.querySelector('img');
    if (img) {
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.borderRadius = '1rem';
    }
  }
};
