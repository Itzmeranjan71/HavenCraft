import { icons } from '../utils/icons.js';
import { store } from '../utils/storage.js';
import { toast } from './toast.js';

export class UserDashboardModal {
  constructor(options = {}) {
    this.options = options;
    this.overlay = null;
    this.activeTab = 'orders'; // 'orders', 'profile'

    this.init();
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.id = 'user-dashboard-overlay';
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    store.subscribe('orders:changed', () => {
      if (this.isOpen()) this.render();
    });

    store.subscribe('user:changed', () => {
      if (this.isOpen()) {
        if (!store.isLoggedIn()) {
          this.close();
        } else {
          this.render();
        }
      }
    });
  }

  isOpen() {
    return this.overlay.classList.contains('active');
  }

  open(initialTab = 'orders') {
    if (!store.isLoggedIn()) {
      this.options.onRequireAuth?.();
      return;
    }

    this.activeTab = initialTab === 'profile' ? 'profile' : 'orders';
    this.render();
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  render() {
    const user = store.getUser();
    if (!user) {
      this.close();
      return;
    }

    const orders = store.getOrders().filter(o => o.customerEmail === user.email || user.role === 'admin');

    this.overlay.innerHTML = `
      <div class="modal-card" style="max-width: 840px; padding: 36px;">
        <button class="modal-close-btn" id="user-modal-close">${icons.close}</button>

        <!-- Profile Top Banner with Log Out Button -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:24px; border-bottom:1px solid var(--color-border); margin-bottom:24px; flex-wrap:wrap; gap:16px;">
          <div style="display:flex; align-items:center; gap:20px;">
            <img src="${user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(user.name)}" alt="${user.name}" style="width:72px; height:72px; border-radius:50%; object-fit:cover; border:2px solid var(--color-accent);" />
            <div>
              <div style="display:flex; align-items:center; gap:10px;">
                <h3 style="font-family:var(--font-serif); font-size:1.6rem; color:var(--color-primary);">${user.name}</h3>
                <span class="status-badge ${user.role === 'admin' ? 'Processing' : 'Delivered'}" style="text-transform:capitalize;">
                  ${user.role === 'admin' ? '★ Administrator' : 'Patron Account'}
                </span>
              </div>
              <div style="color:var(--color-text-muted); font-size:0.875rem;">${user.email} &bull; ${user.phone || 'Phone not set'}</div>
            </div>
          </div>

          <!-- Log Out Button -->
          <button class="btn-secondary btn-sm" id="user-logout-btn" title="Sign out of your account" style="display:flex; align-items:center; gap:8px; color:var(--color-danger); border-color:rgba(194,59,34,0.3); padding:8px 16px; border-radius:var(--radius-pill);">
            ${icons.logOut} Sign Out / Log Out
          </button>
        </div>

        <!-- Dashboard Subtabs -->
        <div class="admin-subtabs" style="margin-bottom:24px;">
          <button class="admin-subtab-btn ${this.activeTab === 'orders' ? 'active' : ''}" data-tab="orders">
            Order Commissions (${orders.length})
          </button>
          <button class="admin-subtab-btn ${this.activeTab === 'profile' ? 'active' : ''}" data-tab="profile">
            Delivery Address & Profile
          </button>
        </div>

        <!-- Tab 1: Orders -->
        ${this.activeTab === 'orders' ? `
          <div class="user-orders-list">
            ${orders.length === 0 ? `
              <div style="text-align:center; padding:40px; color:var(--color-text-muted);">
                <p>No active orders placed yet.</p>
              </div>
            ` : `
              ${orders.map(order => `
                <div class="user-order-card">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
                    <div>
                      <div style="font-weight:700; color:var(--color-primary); font-size:1rem;">Order #${order.id}</div>
                      <div style="font-size:0.78rem; color:var(--color-text-light);">Placed on ${order.date}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <span class="status-badge ${order.status}">${order.status}</span>
                      <strong style="color:var(--color-primary); font-size:1.1rem;">$${(order.total || 0).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px;">
                    ${order.items.map(item => `
                      <div style="display:flex; align-items:center; gap:12px; font-size:0.875rem;">
                        <img src="${item.image || '/images/hero.jpg'}" alt="${item.title}" style="width:40px; height:40px; border-radius:var(--radius-sm); object-fit:cover;" />
                        <div style="flex-grow:1;">
                          <strong>${item.title}</strong>
                          <div style="font-size:0.75rem; color:var(--color-text-muted);">${item.finish || 'Standard'} &bull; Qty: ${item.quantity}</div>
                        </div>
                        <div style="font-weight:600;">$${(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    `).join('')}
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px dashed var(--color-border); font-size:0.78rem; color:var(--color-text-muted);">
                    <div>Carrier Route: <strong>${order.trackingNumber}</strong></div>
                    <div>Destination: ${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'}</div>
                  </div>
                </div>
              `).join('')}
            `}
          </div>
        ` : `
          <!-- Tab 2: Profile Settings -->
          <form id="profile-edit-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Patron Full Name</label>
                <input type="text" id="prof-name" class="form-control" value="${user.name || ''}" required />
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="prof-email" class="form-control" value="${user.email || ''}" required />
              </div>
              <div class="form-group full">
                <label>Default White-Glove Shipping Street</label>
                <input type="text" id="prof-street" class="form-control" value="${user.address?.street || ''}" required />
              </div>
              <div class="form-group">
                <label>City</label>
                <input type="text" id="prof-city" class="form-control" value="${user.address?.city || ''}" required />
              </div>
              <div class="form-group" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div>
                  <label>State</label>
                  <input type="text" id="prof-state" class="form-control" value="${user.address?.state || ''}" required />
                </div>
                <div>
                  <label>Zip Code</label>
                  <input type="text" id="prof-zip" class="form-control" value="${user.address?.zip || ''}" required />
                </div>
              </div>
              <div class="form-group">
                <label>Contact Phone</label>
                <input type="text" id="prof-phone" class="form-control" value="${user.phone || ''}" required />
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
              <button type="submit" class="btn-primary">Save Changes</button>
            </div>
          </form>
        `}
      </div>
    `;

    // Bind events
    this.overlay.querySelector('#user-modal-close')?.addEventListener('click', () => this.close());

    // Log Out button click handler
    this.overlay.querySelector('#user-logout-btn')?.addEventListener('click', async () => {
      const res = await store.logout();
      toast.info(res.message || 'You have been signed out.');
      this.close();
      this.options.onLogout?.();
    });

    this.overlay.querySelectorAll('.admin-subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Profile form
    const form = this.overlay.querySelector('#profile-edit-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.overlay.querySelector('#prof-name').value.trim();
      const email = this.overlay.querySelector('#prof-email').value.trim();
      const street = this.overlay.querySelector('#prof-street').value.trim();
      const city = this.overlay.querySelector('#prof-city').value.trim();
      const state = this.overlay.querySelector('#prof-state').value.trim();
      const zip = this.overlay.querySelector('#prof-zip').value.trim();
      const phone = this.overlay.querySelector('#prof-phone').value.trim();

      store.updateUserProfile({
        name,
        email,
        phone,
        address: { street, city, state, zip, country: 'United States' }
      });
      toast.success('Patron profile updated successfully!');
      this.close();
    });
  }
}
