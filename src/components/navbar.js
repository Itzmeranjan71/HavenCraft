import { icons } from '../utils/icons.js';
import { store } from '../utils/storage.js';
import { toast } from './toast.js';

export function renderNavbar(container, options = {}) {
  function render() {
    const user = store.getUser();
    const isLoggedIn = store.isLoggedIn();
    const cartCount = store.getCartCount();
    const isAdmin = Boolean(user && user.role === 'admin');

    container.innerHTML = `
      <!-- Top Announcement & Role / Sign In Bar -->
      <div class="announcement-bar">
        <div class="container" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <div class="announcement-left">
            <span class="announcement-tag">Autumn 2026</span>
            <span>Complimentary White-Glove Installation on all orders over $1,000 &bull; Code: <strong>WELCOME10</strong></span>
          </div>

          <div style="display:flex; align-items:center; gap:12px;">
            ${isLoggedIn ? `
              <div class="role-switcher-badge" id="role-toggle-btn" title="Click to switch persona">
                <div class="role-indicator-dot ${isAdmin ? 'admin' : ''}"></div>
                <span>Mode: <strong>${isAdmin ? 'Administrator' : 'Customer'}</strong> (Switch)</span>
              </div>
            ` : `
              <div class="role-switcher-badge" id="announcement-signin-badge" style="cursor:pointer;" title="Click to Sign In">
                <div class="role-indicator-dot" style="background:#847e74;"></div>
                <span>Guest Visitor &bull; <strong style="color:var(--color-accent-gold);">Sign In</strong></span>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Main Navigation Bar -->
      <header class="site-header" id="site-header">
        <div class="container">
          <div class="nav-inner">
            <!-- Logo -->
            <a href="#" class="brand-logo" id="nav-brand-link">
              <div class="brand-symbol">H</div>
              <div class="brand-name">Haven<span>Craft</span></div>
            </a>

            <!-- Nav Links -->
            <ul class="nav-links">
              <li><a href="#catalog" class="nav-link-item active" id="nav-catalog-link">Collections</a></li>
              <li><a href="#visualizer" class="nav-link-item" id="nav-visualizer-link">Room Visualizer</a></li>
              <li><a href="#values" class="nav-link-item" id="nav-values-link">Craftsmanship</a></li>
              ${isAdmin ? `
                <li><a href="#admin" class="nav-link-item" id="nav-admin-link">★ Admin Dashboard</a></li>
              ` : `
                <li><a href="#admin" class="nav-link-item" id="nav-admin-link">Merchant Portal</a></li>
              `}
            </ul>

            <!-- Nav Action Buttons -->
            <div class="nav-actions">
              <!-- Search Quick Button -->
              <button class="nav-btn" id="nav-search-btn" title="Search Furniture">
                ${icons.search}
              </button>

              <!-- Cart Drawer Trigger -->
              <button class="nav-btn" id="nav-cart-btn" title="Shopping Cart">
                ${icons.cart}
                ${cartCount > 0 ? `<span class="nav-badge-count" id="cart-badge-count">${cartCount}</span>` : '<span class="nav-badge-count" id="cart-badge-count" style="display:none">0</span>'}
              </button>

              <!-- Account / Login / Logout Trigger -->
              ${isLoggedIn ? `
                <div style="display:flex; align-items:center; gap:8px;">
                  <button class="nav-btn" id="nav-user-btn" title="My Atelier Account (${user.name})">
                    <img src="${user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(user.name)}" alt="${user.name}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;" />
                  </button>
                  <button class="nav-btn" id="nav-quick-logout-btn" title="Sign Out (${user.name})" style="width:34px; height:34px; border-radius:50%; color:var(--color-text-muted);">
                    ${icons.logOut}
                  </button>
                </div>
              ` : `
                <button class="btn-primary btn-sm" id="nav-login-btn" style="padding:7px 14px; font-size:0.8125rem; border-radius:var(--radius-pill); display:flex; align-items:center; gap:6px;">
                  ${icons.logIn} Sign In
                </button>
              `}
            </div>
          </div>
        </div>
      </header>
    `;

    // Attach event listeners
    const roleToggleBtn = container.querySelector('#role-toggle-btn');
    if (roleToggleBtn) {
      roleToggleBtn.addEventListener('click', () => {
        const current = store.getUser();
        if (!current) return;
        const nextRole = current.role === 'customer' ? 'admin' : 'customer';
        store.setUserRole(nextRole);
        toast.info(`Switched interface to ${nextRole.toUpperCase()} mode`);
        if (options.onRoleSwitch) {
          options.onRoleSwitch(nextRole);
        }
      });
    }

    container.querySelector('#announcement-signin-badge')?.addEventListener('click', () => {
      options.onOpenAuth?.('login');
    });

    const brandLink = container.querySelector('#nav-brand-link');
    brandLink?.addEventListener('click', (e) => {
      e.preventDefault();
      options.onNavigateHome?.();
    });

    const catalogLink = container.querySelector('#nav-catalog-link');
    catalogLink?.addEventListener('click', (e) => {
      e.preventDefault();
      options.onNavigateCatalog?.();
    });

    const visualizerLink = container.querySelector('#nav-visualizer-link');
    visualizerLink?.addEventListener('click', (e) => {
      e.preventDefault();
      options.onOpenVisualizer?.();
    });

    const valuesLink = container.querySelector('#nav-values-link');
    valuesLink?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('features-strip')?.scrollIntoView({ behavior: 'smooth' });
    });

    const adminLink = container.querySelector('#nav-admin-link');
    adminLink?.addEventListener('click', (e) => {
      e.preventDefault();
      options.onOpenAdmin?.();
    });

    const searchBtn = container.querySelector('#nav-search-btn');
    searchBtn?.addEventListener('click', () => {
      const searchInput = document.getElementById('catalog-search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    const cartBtn = container.querySelector('#nav-cart-btn');
    cartBtn?.addEventListener('click', () => {
      options.onOpenCart?.();
    });

    // Sign In button (when logged out)
    const loginBtn = container.querySelector('#nav-login-btn');
    loginBtn?.addEventListener('click', () => {
      options.onOpenAuth?.('login');
    });

    // Account Profile button (when logged in)
    const userBtn = container.querySelector('#nav-user-btn');
    userBtn?.addEventListener('click', () => {
      options.onOpenUser?.();
    });

    // Quick Logout button
    const quickLogoutBtn = container.querySelector('#nav-quick-logout-btn');
    quickLogoutBtn?.addEventListener('click', async () => {
      const res = await store.logout();
      toast.info(res.message || 'Signed out successfully');
      options.onLogout?.();
    });
  }

  // Subscribe to changes to re-render navbar automatically
  store.subscribe('cart:changed', () => {
    const badge = container.querySelector('#cart-badge-count');
    const count = store.getCartCount();
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  });

  store.subscribe('user:changed', () => {
    render();
  });

  store.subscribe('auth:changed', () => {
    render();
  });

  render();
}
