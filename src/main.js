import { supabase } from './js/supabase.js';
import { state } from './js/state.js';
import { router } from './js/router.js';
import { ui } from './js/ui.js';

const app = {
  async init() {
    console.log('Thalexa dApp Initializing...');
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Check for existing session
    const savedUser = localStorage.getItem('thalexa_user');
    const savedProfile = localStorage.getItem('thalexa_profile');
    
    if (savedUser && savedProfile) {
      state.setUser(JSON.parse(savedUser));
      state.setProfile(JSON.parse(savedProfile));
      router.navigate('wallet');
      this.updateAllUI();
    }
    
    this.bindEvents();
  },
  
  async login() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Connecting...';
      lucide.createIcons();
    }
    
    // Mock zkLogin flow with Supabase
    // In a real app, this would use Sui zkLogin SDK
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    
    if (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Sign in with zkLogin';
        lucide.createIcons();
      }
      return;
    }
    
    // For demo purposes, we'll simulate a successful login if it's a local dev environment
    // or if the OAuth flow is just starting.
    // In the AI Studio preview, we'll mock the profile creation.
    const mockUser = {
      id: '0x' + Math.random().toString(16).slice(2, 10) + '...7a8c',
      email: 'user@thalexa.io',
    };
    
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', mockUser.id)
      .single();
      
    if (profileError && profileError.code === 'PGRST116') {
      // Create new profile
      const newProfile = {
        id: mockUser.id,
        email: mockUser.email,
        subscription_tier: 'starter',
        monthly_volume: 0,
        product_count: 0,
        role: 'user',
        created_at: new Date().toISOString(),
      };
      
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
        
      if (createError) {
        console.error('Profile creation error:', createError);
        // Fallback to local state for demo
        profile = newProfile;
      } else {
        profile = createdProfile;
      }
    }
    
    state.setUser(mockUser);
    state.setProfile(profile);
    
    router.navigate('wallet');
    this.updateAllUI();
  },
  
  async logout() {
    await supabase.auth.signOut();
    state.clear();
    router.navigate('onboarding');
  },
  
  updateAllUI() {
    ui.renderAssets();
    ui.renderEscrows();
    ui.updateUsage();
    ui.updateProfile();
    ui.generateQR(state.user?.id || '0x...');
    lucide.createIcons();
  },
  
  bindEvents() {
    // Login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.login());
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
    
    // Register product form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Product registration initiated on-chain...');
        router.navigate('verification');
      });
    }
    
    // Escrow form
    const escrowForm = document.getElementById('escrow-form');
    if (escrowForm) {
      escrowForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const to = document.getElementById('escrow-to').value;
        const amount = document.getElementById('escrow-amount').value;
        const terms = document.getElementById('escrow-terms').value;
        
        if (!to || !amount || !terms) {
          alert('Please fill in all fields');
          return;
        }
        
        alert(`Escrow created for ${amount} SUI with ${to}`);
        router.navigate('escrow');
      });
    }
  },
  
  copyAddress() {
    if (state.user) {
      navigator.clipboard.writeText(state.user.id);
      alert('Address copied to clipboard!');
    }
  }
};

// Expose app to window for inline onclick handlers
window.app = app;
window.router = router;

// Initialize on load
window.addEventListener('DOMContentLoaded', () => app.init());
