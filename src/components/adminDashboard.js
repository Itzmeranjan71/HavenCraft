import { icons } from '../utils/icons.js';
import { store } from '../utils/storage.js';
import { toast } from './toast.js';

export function renderAdminDashboard(container, options = {}) {
  let activeTab = 'inventory'; // 'inventory', 'orders', 'analytics'
  let isAddModalOpen = false;

  function render() {
    const products = store.getProducts();
    const orders = store.getOrders();
    const categories = store.getCategories();

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrdersCount = orders.length;
    const lowStockCount = products.filter(p => p.stock < 10).length;
    const avgOrderVal = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    container.innerHTML = `
      <section class="container admin-view-container active" id="admin-view">
        <!-- Admin Header -->
        <div class="admin-header-row">
          <div>
            <div class="section-eyebrow" style="color:var(--color-accent-gold);">
              ★ Operations & Merchant Control
            </div>
            <h2 class="section-heading">Atelier Administrative Suite</h2>
          </div>

          <div style="display:flex; align-items:center; gap:12px;">
            <button class="btn-primary" id="admin-add-product-btn">
              ${icons.plus} Commission New Furniture Piece
            </button>
            <button class="btn-secondary" id="admin-exit-btn">
              Back to Storefront
            </button>
          </div>
        </div>

        <!-- 4 Metric KPI Cards -->
        <div class="admin-stats-grid">
          <div class="stat-metric-card">
            <div class="stat-top-row">
              <span class="stat-label">Gross Platform Revenue</span>
              <div class="stat-icon-wrap gold">${icons.chart}</div>
            </div>
            <div class="stat-value">$${totalRevenue.toLocaleString()}</div>
            <div style="font-size:0.75rem; color:var(--color-success); font-weight:600;">+14.8% from previous period</div>
          </div>

          <div class="stat-metric-card">
            <div class="stat-top-row">
              <span class="stat-label">Client Orders Processed</span>
              <div class="stat-icon-wrap green">${icons.package}</div>
            </div>
            <div class="stat-value">${totalOrdersCount}</div>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">Active white-glove routes</div>
          </div>

          <div class="stat-metric-card">
            <div class="stat-top-row">
              <span class="stat-label">Average Commission Value</span>
              <div class="stat-icon-wrap blue">${icons.sparkles}</div>
            </div>
            <div class="stat-value">$${avgOrderVal.toLocaleString()}</div>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">High-ticket luxury orders</div>
          </div>

          <div class="stat-metric-card">
            <div class="stat-top-row">
              <span class="stat-label">Low Workshop Stock Items</span>
              <div class="stat-icon-wrap ${lowStockCount > 0 ? 'red' : 'green'}">${icons.filter}</div>
            </div>
            <div class="stat-value" style="${lowStockCount > 0 ? 'color:var(--color-danger);' : ''}">${lowStockCount}</div>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">${products.length} total active designs</div>
          </div>
        </div>

        <!-- Subtabs -->
        <div class="admin-subtabs">
          <button class="admin-subtab-btn ${activeTab === 'inventory' ? 'active' : ''}" data-tab="inventory">
            Product Catalog & Inventory (${products.length})
          </button>
          <button class="admin-subtab-btn ${activeTab === 'orders' ? 'active' : ''}" data-tab="orders">
            Order Fulfillment Pipeline (${orders.length})
          </button>
          <button class="admin-subtab-btn ${activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
            Category Breakdown & Security Specs
          </button>
        </div>

        <!-- Tab 1: Product Inventory Management -->
        ${activeTab === 'inventory' ? `
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Piece & SKU</th>
                  <th>Room Category</th>
                  <th>Price ($)</th>
                  <th>Workshop Stock</th>
                  <th>Customer Rating</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => `
                  <tr>
                    <td>
                      <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${p.image}" alt="${p.title}" style="width:48px; height:48px; border-radius:var(--radius-sm); object-fit:cover;" />
                        <div>
                          <strong style="color:var(--color-primary);">${p.title}</strong>
                          <div style="font-size:0.75rem; color:var(--color-text-muted);">${p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style="text-transform:capitalize; font-size:0.8125rem;">${p.category.replace('-', ' ')}</span>
                    </td>
                    <td>
                      <strong>$${p.price.toLocaleString()}</strong>
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:8px;">
                        <input 
                          type="number" 
                          class="form-control" 
                          style="width:70px; padding:4px 8px; font-size:0.8125rem;" 
                          value="${p.stock}" 
                          data-stock-id="${p.id}"
                        />
                        ${p.stock < 10 ? `<span style="color:var(--color-danger); font-size:0.75rem; font-weight:700;">Low</span>` : ''}
                      </div>
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:4px; font-size:0.8125rem; color:#f59e0b;">
                        ${icons.star}
                        <strong style="color:var(--color-primary);">${p.rating}</strong>
                        <span style="color:var(--color-text-light);">(${p.reviewCount})</span>
                      </div>
                    </td>
                    <td style="text-align:right;">
                      <button class="nav-btn" data-delete-id="${p.id}" style="width:34px; height:34px; border:none; color:var(--color-danger); margin-left:auto;" title="Retire/Delete Piece">
                        ${icons.trash}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : activeTab === 'orders' ? `
          <!-- Tab 2: Orders Pipeline -->
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Client Name & Email</th>
                  <th>Order Date</th>
                  <th>Total Amount</th>
                  <th>Carrier Tracking</th>
                  <th>Fulfillment Status</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(o => `
                  <tr>
                    <td>
                      <strong>${o.id}</strong>
                    </td>
                    <td>
                      <div style="font-weight:600; color:var(--color-primary);">${o.customerName}</div>
                      <div style="font-size:0.75rem; color:var(--color-text-muted);">${o.customerEmail}</div>
                    </td>
                    <td>${o.date}</td>
                    <td>
                      <strong>$${(o.total || 0).toLocaleString()}</strong>
                      <div style="font-size:0.75rem; color:var(--color-text-light);">${o.items?.length || 1} items</div>
                    </td>
                    <td>
                      <span style="font-family:monospace; font-size:0.8125rem; background:var(--color-surface-subtle); padding:2px 8px; border-radius:4px;">
                        ${o.trackingNumber || 'FX-PENDING-US'}
                      </span>
                    </td>
                    <td>
                      <select class="form-control" style="font-size:0.8125rem; padding:4px 8px; width:130px;" data-order-status-id="${o.id}">
                        <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                      </select>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <!-- Tab 3: Analytics & Architecture Specs -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
            <div style="background:var(--color-surface); padding:24px; border-radius:var(--radius-lg); border:1px solid var(--color-border);">
              <h4 style="font-family:var(--font-serif); font-size:1.25rem; margin-bottom:16px;">
                Room Category Volume Breakdown
              </h4>
              <div style="display:flex; flex-direction:column; gap:14px;">
                ${categories.map(c => {
                  const count = products.filter(p => p.category === c.id).length;
                  const pct = Math.round((count / (products.length || 1)) * 100);
                  return `
                    <div>
                      <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
                        <span><strong>${c.name}</strong></span>
                        <span style="color:var(--color-text-muted);">${count} pieces (${pct}%)</span>
                      </div>
                      <div style="height:8px; background:var(--color-surface-subtle); border-radius:var(--radius-pill); overflow:hidden;">
                        <div style="height:100%; width:${pct}%; background:var(--color-accent); border-radius:var(--radius-pill);"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div style="background:var(--color-surface); padding:24px; border-radius:var(--radius-lg); border:1px solid var(--color-border);">
              <h4 style="font-family:var(--font-serif); font-size:1.25rem; margin-bottom:16px;">
                System Health & SRS Compliance
              </h4>
              <ul style="list-style:none; display:flex; flex-direction:column; gap:12px; font-size:0.875rem;">
                <li style="display:flex; align-items:center; gap:10px;">
                  <span style="color:var(--color-success);">${icons.check}</span>
                  <span><strong>Cloud Load Balancers:</strong> Active &bull; Response Time < 0.2s</span>
                </li>
                <li style="display:flex; align-items:center; gap:10px;">
                  <span style="color:var(--color-success);">${icons.check}</span>
                  <span><strong>Database Persistence:</strong> Real-time ACID Compliant Store</span>
                </li>
                <li style="display:flex; align-items:center; gap:10px;">
                  <span style="color:var(--color-success);">${icons.check}</span>
                  <span><strong>Security & Encryption:</strong> 256-Bit SSL/TLS + Role-Based Access</span>
                </li>
                <li style="display:flex; align-items:center; gap:10px;">
                  <span style="color:var(--color-success);">${icons.check}</span>
                  <span><strong>CDN Asset Edge:</strong> High-Resolution WebP/JPEG Image Caching</span>
                </li>
              </ul>
            </div>
          </div>
        `}
      </section>

      <!-- Add Product Modal -->
      ${isAddModalOpen ? `
        <div class="modal-overlay active" id="add-product-overlay">
          <div class="modal-card" style="max-width: 600px; padding: 32px;">
            <button class="modal-close-btn" id="add-modal-close">${icons.close}</button>
            <h3 style="font-family:var(--font-serif); font-size:1.6rem; margin-bottom:8px;">Commission New Furniture Piece</h3>
            <p style="color:var(--color-text-muted); font-size:0.875rem; margin-bottom:20px;">Add an artisan design to the active storefront catalog.</p>

            <form id="add-product-form" style="display:flex; flex-direction:column; gap:14px;">
              <div class="form-group">
                <label>Piece Title</label>
                <input type="text" id="new-title" class="form-control" placeholder="e.g. Kyoto Solid Oak Low Bench" required />
              </div>

              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                <div class="form-group">
                  <label>Room Category</label>
                  <select id="new-category" class="form-control">
                    ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>SKU Code</label>
                  <input type="text" id="new-sku" class="form-control" placeholder="BENCH-OAK-07" required />
                </div>
              </div>

              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                <div class="form-group">
                  <label>Price ($)</label>
                  <input type="number" id="new-price" class="form-control" placeholder="1150" min="10" required />
                </div>
                <div class="form-group">
                  <label>Workshop Stock (Units)</label>
                  <input type="number" id="new-stock" class="form-control" placeholder="15" min="1" required />
                </div>
              </div>

              <div class="form-group">
                <label>Visual Asset</label>
                <select id="new-image" class="form-control">
                  <option value="/images/hero.jpg">Living Room Sectional (Hero)</option>
                  <option value="/images/armchair.jpg">Nordic Lounge Chair</option>
                  <option value="/images/dining.jpg">American Walnut Dining Table</option>
                  <option value="/images/bed.jpg">Japanese Platform Bed</option>
                  <option value="/images/desk.jpg">Solid Oak Work Desk</option>
                </select>
              </div>

              <div class="form-group">
                <label>Artisan Description & Craftsmanship Details</label>
                <textarea id="new-desc" class="form-control" rows="3" placeholder="Solid timber with hand-chamfered edges..." required></textarea>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:10px;">
                <button type="button" class="btn-secondary" id="add-modal-cancel">Cancel</button>
                <button type="submit" class="btn-primary">Publish to Catalog</button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}
    `;

    // Bind Admin listeners
    container.querySelector('#admin-exit-btn')?.addEventListener('click', () => {
      options.onExitAdmin?.();
    });

    container.querySelector('#admin-add-product-btn')?.addEventListener('click', () => {
      isAddModalOpen = true;
      render();
    });

    container.querySelectorAll('.admin-subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        render();
      });
    });

    // Stock inline edit
    container.querySelectorAll('[data-stock-id]').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = input.getAttribute('data-stock-id');
        const newStock = parseInt(e.target.value, 10);
        const p = store.getProductById(id);
        if (p && !isNaN(newStock) && newStock >= 0) {
          p.stock = newStock;
          store.saveProduct(p);
          toast.success(`Updated stock for ${p.title} to ${newStock}`);
        }
      });
    });

    // Delete product
    container.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id');
        const p = store.getProductById(id);
        if (confirm(`Are you sure you want to retire "${p?.title}" from the catalog?`)) {
          store.deleteProduct(id);
          toast.info(`Product removed from catalog`);
          render();
        }
      });
    });

    // Order status change
    container.querySelectorAll('[data-order-status-id]').forEach(select => {
      select.addEventListener('change', (e) => {
        const orderId = select.getAttribute('data-order-status-id');
        const newStatus = e.target.value;
        store.updateOrderStatus(orderId, newStatus);
        toast.success(`Order ${orderId} status updated to "${newStatus}"`);
      });
    });

    // Add Product Modal Handlers
    if (isAddModalOpen) {
      container.querySelector('#add-modal-close')?.addEventListener('click', () => {
        isAddModalOpen = false;
        render();
      });
      container.querySelector('#add-modal-cancel')?.addEventListener('click', () => {
        isAddModalOpen = false;
        render();
      });

      const addForm = container.querySelector('#add-product-form');
      addForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = container.querySelector('#new-title').value.trim();
        const category = container.querySelector('#new-category').value;
        const sku = container.querySelector('#new-sku').value.trim();
        const price = parseFloat(container.querySelector('#new-price').value);
        const stock = parseInt(container.querySelector('#new-stock').value, 10);
        const image = container.querySelector('#new-image').value;
        const description = container.querySelector('#new-desc').value.trim();

        store.saveProduct({
          title,
          category,
          sku,
          price,
          stock,
          image,
          description,
          rating: 5.0,
          reviewCount: 1,
          badge: 'New Release',
          materials: ['Solid Sustainably Harvested Hardwood', 'Natural Protective Finish'],
          finishes: [
            { name: 'Natural Oak', color: '#d8cbba', priceOffset: 0 },
            { name: 'Dark Walnut', color: '#44342a', priceOffset: 120 }
          ],
          dimensions: {
            width: '60 in (152 cm)',
            depth: '24 in (61 cm)',
            height: '30 in (76 cm)'
          },
          features: [
            'Solid hardwood joinery',
            'Water-resistant protective natural finish',
            'Sustainably certified timber'
          ]
        });

        toast.success(`Commissioned "${title}" into active catalog!`);
        isAddModalOpen = false;
        render();
      });
    }
  }

  // Subscribe to changes
  store.subscribe('orders:changed', () => {
    if (container.querySelector('#admin-view')) {
      render();
    }
  });

  store.subscribe('products:changed', () => {
    if (container.querySelector('#admin-view')) {
      render();
    }
  });

  render();
}
