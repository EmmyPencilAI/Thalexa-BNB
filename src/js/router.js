export const router = {
  currentRoute: 'onboarding',
  history: [],
  
  navigate(route) {
    if (this.currentRoute === route) return;
    
    this.history.push(this.currentRoute);
    this.currentRoute = route;
    this.updateUI();
  },
  
  back() {
    if (this.history.length === 0) return;
    
    this.currentRoute = this.history.pop();
    this.updateUI();
  },
  
  updateUI() {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Show current screen
    const screen = document.getElementById(`${this.currentRoute}-screen`);
    if (screen) screen.classList.add('active');
    
    // Update nav bar visibility
    const navBar = document.getElementById('nav-bar');
    const noNavScreens = ['onboarding', 'scanner', 'receive', 'send', 'create-escrow', 'subscription'];
    
    if (noNavScreens.includes(this.currentRoute)) {
      navBar.classList.add('hidden');
    } else {
      navBar.classList.remove('hidden');
    }
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.route === this.currentRoute) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
};
