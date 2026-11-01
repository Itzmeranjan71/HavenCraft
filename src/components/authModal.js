import { icons } from '../utils/icons.js';
import { store } from '../utils/storage.js';
import { toast } from './toast.js';

export class AuthModal {
  constructor(options = {}) {
    this.options = options;
    this.overlay = null;
    this.mode = 'login'; // 'login' or 'register'
    this.errorMessage = '';
    this.isLoading = false;

    this.init();
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.id = 'auth-modal-overlay';
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  }

  isOpen() {
    return this.overlay.classList.contains('active');
  }

  open(mode = 'login') {
    this.mode = mode;
    this.errorMessage = '';
    this.isLoading = false;
    this.render();
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const firstInput = this.overlay.querySelector('input');
      firstInput?.focus();
    }, 100);
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  render() {
    const isLogin = this.mode === 'login';

    this.overlay.innerHTML = `
      <div class="modal-card" style="max-width: 480px; padding: 36px 32px;">
        <button class="modal-close-btn" id="auth-close-btn" title="Close">${icons.close}</button>

        <div style="text-align: center; margin-bottom: 24px;">
          <div class="brand-symbol" style="margin: 0 auto 12px auto; width: 44px; height: 44px; font-size: 1.25rem;">H</div>
          <div class="section-eyebrow" style="color: var(--color-accent); margin-bottom: 4px;">HavenCraft Living Atelier</div>
          <h2 style="font-family: var(--font-serif); font-size: 1.75rem; color: var(--color-primary); margin-bottom: 6px;">
            ${isLogin ? 'Sign In to Your Account' : 'Create a Patron Account'}
          </h2>
          <p style="color: var(--color-text-muted); font-size: 0.875rem;">
            ${isLogin 
              ? 'Access bespoke orders, tracking, and atelier white-glove services.' 
              : 'Join our guild of architectural design connoisseurs.'}
          </p>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="admin-subtabs" style="margin-bottom: 24px;">
          <button class="admin-subtab-btn ${isLogin ? 'active' : ''}" id="auth-tab-login" style="flex: 1; text-align: center;">
            ${icons.logIn} Sign In
          </button>
          <button class="admin-subtab-btn ${!isLogin ? 'active' : ''}" id="auth-tab-register" style="flex: 1; text-align: center;">
            ${icons.user} Register
          </button>
        </div>

        ${this.errorMessage ? `
          <div style="background: rgba(194, 59, 34, 0.1); border: 1px solid var(--color-danger); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 18px; color: var(--color-danger); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
            <span>&bull;</span>
            <span>${this.errorMessage}</span>
          </div>
        ` : ''}

        <!-- Login Form -->
        ${isLogin ? `
          <form id="auth-login-form">
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px;">Email Address</label>
              <div style="position: relative;">
                <input 
                  type="email" 
                  id="login-email" 
                  class="form-control" 
                  placeholder="name@example.com" 
                  required 
                  autocomplete="email"
                  style="padding-left: 14px;"
                />
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 22px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-size: 0.8125rem; font-weight: 600;">Password</label>
              </div>
              <input 
                type="password" 
                id="login-password" 
                class="form-control" 
                placeholder="••••••••" 
                required 
                autocomplete="current-password"
                style="padding-left: 14px;"
              />
            </div>

            <button type="submit" class="btn-primary" id="login-submit-btn" style="width: 100%; justify-content: center; height: 46px; font-size: 0.95rem;" ${this.isLoading ? 'disabled' : ''}>
              ${this.isLoading ? 'Authenticating...' : `${icons.logIn} Sign In to Atelier`}
            </button>

            <!-- 1-Click Demo Logins -->
            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px dashed var(--color-border); text-align: center;">
              <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); font-weight: 700; margin-bottom: 10px;">
                1-Click Quick Demo Sign In
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <button type="button" class="btn-secondary btn-sm" id="quick-login-customer" style="padding: 8px 10px; font-size: 0.75rem;">
                  👤 Customer (Sophia)
                </button>
                <button type="button" class="btn-secondary btn-sm" id="quick-login-admin" style="padding: 8px 10px; font-size: 0.75rem;">
                  👑 Admin (Alexander)
                </button>
              </div>
            </div>
          </form>
        ` : `
          <!-- Registration Form -->
          <form id="auth-register-form">
            <div class="form-group" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 4px;">Full Name</label>
              <input type="text" id="reg-name" class="form-control" placeholder="Eleanor Vance" required />
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 4px;">Email Address</label>
              <input type="email" id="reg-email" class="form-control" placeholder="eleanor@example.com" required autocomplete="email" />
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 4px;">Password (min 4 chars)</label>
              <input type="password" id="reg-password" class="form-control" placeholder="••••••••" required minlength="4" autocomplete="new-password" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
              <div>
                <label style="display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 4px;">City</label>
                <input type="text" id="reg-city" class="form-control" placeholder="San Francisco" />
              </div>
              <div>
                <label style="display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 4px;">State</label>
                <input type="text" id="reg-state" class="form-control" placeholder="CA" />
              </div>
            </div>

            <button type="submit" class="btn-primary" id="reg-submit-btn" style="width: 100%; justify-content: center; height: 46px; font-size: 0.95rem;" ${this.isLoading ? 'disabled' : ''}>
              ${this.isLoading ? 'Creating Account...' : `${icons.badgeCheck} Create Patron Account`}
            </button>
          </form>
        `}
      </div>
    `;

    // Bind Close Button
    this.overlay.querySelector('#auth-close-btn')?.addEventListener('click', () => this.close());

    // Switch Tabs
    this.overlay.querySelector('#auth-tab-login')?.addEventListener('click', () => {
      this.mode = 'login';
      this.errorMessage = '';
      this.render();
    });

    this.overlay.querySelector('#auth-tab-register')?.addEventListener('click', () => {
      this.mode = 'register';
      this.errorMessage = '';
      this.render();
    });

    // 1-Click Quick Demo Login buttons
    this.overlay.querySelector('#quick-login-customer')?.addEventListener('click', () => {
      const emailInput = this.overlay.querySelector('#login-email');
      const passInput = this.overlay.querySelector('#login-password');
      if (emailInput && passInput) {
        emailInput.value = 'sophia.laurent@example.com';
        passInput.value = 'sophia123';
        this.submitLogin('sophia.laurent@example.com', 'sophia123');
      }
    });

    this.overlay.querySelector('#quick-login-admin')?.addEventListener('click', () => {
      const emailInput = this.overlay.querySelector('#login-email');
      const passInput = this.overlay.querySelector('#login-password');
      if (emailInput && passInput) {
        emailInput.value = 'alexander.admin@furnicraft.luxury';
        passInput.value = 'admin123';
        this.submitLogin('alexander.admin@furnicraft.luxury', 'admin123');
      }
    });

    // Login Form Submit
    this.overlay.querySelector('#auth-login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = this.overlay.querySelector('#login-email')?.value.trim();
      const password = this.overlay.querySelector('#login-password')?.value.trim();
      this.submitLogin(email, password);
    });

    // Register Form Submit
    this.overlay.querySelector('#auth-register-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.overlay.querySelector('#reg-name')?.value.trim();
      const email = this.overlay.querySelector('#reg-email')?.value.trim();
      const password = this.overlay.querySelector('#reg-password')?.value.trim();
      const city = this.overlay.querySelector('#reg-city')?.value.trim();
      const state = this.overlay.querySelector('#reg-state')?.value.trim();
      this.submitRegister({ name, email, password, city, state });
    });
  }

  async submitLogin(email, password) {
    if (!email || !password) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.render();

    const res = await store.login(email, password);
    this.isLoading = false;

    if (res.success) {
      toast.success(res.message || 'Signed in successfully');
      this.close();
      this.options.onLoginSuccess?.(res.user);
    } else {
      this.errorMessage = res.message || 'Invalid email or password';
      this.render();
    }
  }

  async submitRegister(userData) {
    this.isLoading = true;
    this.errorMessage = '';
    this.render();

    const res = await store.register(userData);
    this.isLoading = false;

    if (res.success) {
      toast.success(res.message || 'Account created successfully');
      this.close();
      this.options.onLoginSuccess?.(res.user);
    } else {
      this.errorMessage = res.message || 'Failed to create account';
      this.render();
    }
  }
}
