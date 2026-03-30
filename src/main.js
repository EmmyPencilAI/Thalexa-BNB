import { auth, db, googleProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, doc, getDoc, setDoc, handleFirestoreError, OperationType } from './js/firebase.js';
import { state } from './js/state.js';
import { router } from './js/router.js';
import { ui } from './js/ui.js';

const app = {
  async init() {
    console.log('Thalexa dApp Initializing...');
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Initial UI sync
    router.updateUI();
    
    // Handle redirect result
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('Redirect result user:', result.user.uid);
      }
    } catch (error) {
      console.error('Redirect error:', error);
    }
    
    // Check for existing session via Firebase Auth
    console.log('Registering onAuthStateChanged...');
    onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged fired. User:', user ? user.uid : 'null');
      if (user) {
        state.setUser({
          id: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
        
        // Fetch profile from Firestore
        try {
          await this.fetchProfile(user.uid, user.email);
        } catch (error) {
          console.error('Profile fetch failed, using default:', error);
          // Set a minimal default profile if fetch fails
          state.setProfile({
            id: user.uid,
            email: user.email,
            subscription_tier: 'starter',
            role: 'user'
          });
        }
        
        console.log('Current route before navigation check:', router.currentRoute);
        const publicRoutes = ['onboarding'];
        if (publicRoutes.includes(router.currentRoute)) {
          router.navigate('wallet');
        }
        this.updateAllUI();
      } else {
        console.log('No user authenticated');
        state.clear();
        const privateRoutes = ['wallet', 'send', 'receive', 'escrow', 'verification', 'create-escrow', 'subscription', 'settings'];
        if (privateRoutes.includes(router.currentRoute)) {
          router.navigate('onboarding');
        } else {
          // Even if on onboarding, ensure UI is sync'd
          router.updateUI();
        }
      }
    });
    
    this.bindEvents();
  },
  
  async fetchProfile(uid, email) {
    const path = `profiles/${uid}`;
    try {
      const docRef = doc(db, 'profiles', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        state.setProfile(docSnap.data());
      } else {
        // Create new profile
        const newProfile = {
          id: uid,
          email: email,
          subscription_tier: 'starter',
          monthly_volume: 0,
          product_count: 0,
          role: 'user',
          created_at: new Date().toISOString(),
        };
        
        await setDoc(docRef, newProfile);
        state.setProfile(newProfile);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },
  
  async login() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Connecting...';
      lucide.createIcons();
    }
    
    try {
      await signInWithRedirect(auth, googleProvider);
      // onAuthStateChanged will handle the rest after redirect
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Sign in with Google';
        lucide.createIcons();
      }
    }
  },
  
  async logout() {
    try {
      await signOut(auth);
      state.clear();
      router.navigate('onboarding');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
