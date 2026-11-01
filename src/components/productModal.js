import { icons } from '../utils/icons.js';
import { store } from '../utils/storage.js';
import { toast } from './toast.js';

export class ProductModal {
  constructor(options = {}) {
    this.options = options;
    this.currentProduct = null;
    this.selectedFinish = null;
    this.quantity = 1;
    this.currentImage = null;
    this.activeTab = 'overview'; // 'overview', 'dimensions', 'reviews'
    this.overlay = null;

    this.init();
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.id = 'product-modal-overlay';
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  }

  open(product) {
    this.currentProduct = product;
    this.selectedFinish = product.finishes && product.finishes.length ? product.finishes[0].name : null;
    this.quantity = 1;
    this.currentImage = product.image;
    this.activeTab = 'overview';

    this.render();
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  calculateCurrentPrice() {
    if (!this.currentProduct) return 0;
    let base = this.currentProduct.price;
    if (this.selectedFinish && this.currentProduct.finishes) {
      const finishObj = this.currentProduct.finishes.find(f => f.name === this.selectedFinish);
      if (finishObj && finishObj.priceOffset) {
        base += finishObj.priceOffset;
      }
    }
    return base;
  }

  render() {
    const p = this.currentProduct;
    if (!p) return;

    const currentPrice = this.calculateCurrentPrice();

    const imagesList = p.secondaryImages && p.secondaryImages.length > 0 
      ? [p.image, ...p.secondaryImages.filter(img => img !== p.image)]
      : [p.image];

    this.overlay.innerHTML = `
      <div class="modal-card">
        <button class="modal-close-btn" id="modal-close-btn" title="Close Modal">
          ${icons.close}
        </button>

        <div class="product-detail-grid">
          <!-- Left: Gallery -->
          <div class="product-detail-gallery">
            <div class="detail-main-img-wrap">
              <img src="${this.currentImage}" alt="${p.title}" class="detail-main-img" id="detail-active-img" />
            </div>

            <div class="detail-thumb-row">
              ${imagesList.map((imgSrc) => `
                <div class="detail-thumb ${imgSrc === this.currentImage ? 'active' : ''}" data-src="${imgSrc}">
                  <img src="${imgSrc}" alt="Thumbnail" />
                </div>
              `).join('')}
            </div>

            <!-- 3D Room Visualizer Quick Button -->
            <button class="btn-secondary" id="modal-open-room-btn" style="width:100%; margin-top:10px;">
              ${icons.cube} View in 3D Spatial Visualizer
            </button>
          </div>

          <!-- Right: Details & Swatches -->
          <div class="product-detail-info">
            <div class="detail-sku">SKU: ${p.sku} &bull; Room: ${p.category.toUpperCase().replace('-', ' ')}</div>
            <h2 class="detail-title">${p.title}</h2>

            <div class="detail-rating-row">
              <div style="display:flex; align-items:center; gap:4px; color:#f59e0b;">
                ${icons.star}
                <strong style="color:var(--color-primary);">${p.rating}</strong>
              </div>
              <span style="color:var(--color-text-muted);">&bull; ${p.reviewCount} verified patron reviews</span>
              <div class="detail-stock-status">
                ${icons.check} ${p.stock > 0 ? `In Stock (${p.stock} units available)` : 'Pre-order available'}
              </div>
            </div>

            <div class="detail-price-box">
              <span class="detail-price">$${currentPrice.toLocaleString()}</span>
              ${p.originalPrice ? `<span class="detail-orig-price">$${(p.originalPrice + (currentPrice - p.price)).toLocaleString()}</span>` : ''}
              <span style="font-size:0.8125rem; color:var(--color-accent); font-weight:600;">Includes White-Glove Setup</span>
            </div>

            <!-- Material & Finish Swatch Selector -->
            ${p.finishes && p.finishes.length ? `
              <div class="swatches-section">
                <div class="swatch-label-row">
                  <span>Selected Finish / Material:</span>
                  <span class="swatch-selected-name" id="swatch-name-display">${this.selectedFinish}</span>
                </div>
                <div class="swatches-row">
                  ${p.finishes.map(f => `
                    <button class="swatch-btn ${f.name === this.selectedFinish ? 'active' : ''}" data-finish="${f.name}">
                      <div class="swatch-color-circle" style="background-color:${f.color}"></div>
                      <span>${f.name}</span>
                      ${f.priceOffset > 0 ? `<span style="opacity:0.75; font-size:0.75rem;">(+${f.priceOffset})</span>` : ''}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Tabs Navigation -->
            <div class="detail-tabs-bar">
              <button class="detail-tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">Overview</button>
              <button class="detail-tab-btn ${this.activeTab === 'dimensions' ? 'active' : ''}" data-tab="dimensions">Dimensions & Specs</button>
              <button class="detail-tab-btn ${this.activeTab === 'reviews' ? 'active' : ''}" data-tab="reviews">Reviews (${p.reviews ? p.reviews.length : 0})</button>
            </div>

            <!-- Tab 1: Overview -->
            <div class="detail-tab-pane ${this.activeTab === 'overview' ? 'active' : ''}" id="tab-overview">
              <p style="font-size:0.9375rem; color:var(--color-text-muted); line-height:1.6; margin-bottom:14px;">
                ${p.description}
              </p>
              <ul style="list-style:none; display:flex; flex-direction:column; gap:8px; font-size:0.875rem;">
                ${p.features ? p.features.map(f => `
                  <li style="display:flex; align-items:flex-start; gap:8px;">
                    <span style="color:var(--color-accent); font-weight:bold;">&bull;</span>
                    <span>${f}</span>
                  </li>
                `).join('') : ''}
              </ul>
            </div>

            <!-- Tab 2: Dimensions & Specs -->
            <div class="detail-tab-pane ${this.activeTab === 'dimensions' ? 'active' : ''}" id="tab-dimensions">
              <table class="dimensions-table">
                <tbody>
                  ${p.dimensions ? Object.entries(p.dimensions).map(([key, val]) => `
                    <tr>
                      <td style="text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1')}</td>
                      <td>${val}</td>
                    </tr>
                  `).join('') : ''}
                  <tr>
                    <td>Materials</td>
                    <td>${p.materials ? p.materials.join(', ') : 'Solid Hardwood & Premium Textiles'}</td>
                  </tr>
                  <tr>
                    <td>Assembly</td>
                    <td>Complimentary In-Room Assembly Included</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Tab 3: Reviews -->
            <div class="detail-tab-pane ${this.activeTab === 'reviews' ? 'active' : ''}" id="tab-reviews">
              <div style="display:flex; flex-direction:column; gap:16px; max-height:220px; overflow-y:auto; margin-bottom:16px;">
                ${p.reviews && p.reviews.length ? p.reviews.map(r => `
                  <div style="background:var(--color-surface-subtle); padding:12px; border-radius:var(--radius-md);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.8125rem;">
                      <strong>${r.userName}</strong>
                      <span style="color:var(--color-text-light);">${r.date}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:2px; color:#f59e0b; margin-bottom:6px;">
                      ${Array.from({ length: r.rating }).map(() => icons.star).join('')}
                    </div>
                    <p style="font-size:0.85rem; color:var(--color-text-muted);">${r.comment}</p>
                  </div>
                `).join('') : '<p style="font-size:0.875rem; color:var(--color-text-muted);">Be the first patron to review this piece.</p>'}
              </div>

              <!-- Submit Review Form Toggle -->
              <details style="font-size:0.875rem; background:var(--color-surface-card); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:10px 14px;">
                <summary style="cursor:pointer; font-weight:600; color:var(--color-primary);">Write a verified review</summary>
                <form id="write-review-form" style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
                  <input type="text" id="review-name" class="form-control" placeholder="Your Name" required />
                  <select id="review-rating" class="form-control" style="font-size:0.85rem;">
                    <option value="5">★★★★★ (5 Stars - Exceptional)</option>
                    <option value="4">★★★★☆ (4 Stars - Highly Pleased)</option>
                    <option value="3">★★★☆☆ (3 Stars - Average)</option>
                  </select>
                  <textarea id="review-comment" class="form-control" rows="2" placeholder="Describe the tactile feel, woodwork, and aesthetics..." required></textarea>
                  <button type="submit" class="btn-primary btn-sm" style="align-self:flex-start;">Submit Review</button>
                </form>
              </details>
            </div>

            <!-- Actions Row -->
            <div class="detail-actions-row">
              <!-- Quantity Stepper -->
              <div class="qty-counter">
                <button class="qty-btn" id="modal-qty-minus">${icons.minus}</button>
                <span class="qty-display" id="modal-qty-display">${this.quantity}</span>
                <button class="qty-btn" id="modal-qty-plus">${icons.plus}</button>
              </div>

              <!-- Add to Cart Button -->
              <button class="btn-primary" id="modal-add-cart-btn" style="flex-grow:1;">
                ${icons.cart} Add to Atelier Cart &bull; $${(currentPrice * this.quantity).toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind modal actions
    this.overlay.querySelector('#modal-close-btn')?.addEventListener('click', () => this.close());

    // Thumbnail clicks
    this.overlay.querySelectorAll('.detail-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        this.currentImage = thumb.getAttribute('data-src');
        this.render();
      });
    });

    // Swatches click
    this.overlay.querySelectorAll('.swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedFinish = btn.getAttribute('data-finish');
        this.render();
      });
    });

    // Tab buttons
    this.overlay.querySelectorAll('.detail-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Quantity buttons
    this.overlay.querySelector('#modal-qty-minus')?.addEventListener('click', () => {
      if (this.quantity > 1) {
        this.quantity -= 1;
        this.render();
      }
    });

    this.overlay.querySelector('#modal-qty-plus')?.addEventListener('click', () => {
      if (this.quantity < (p.stock || 99)) {
        this.quantity += 1;
        this.render();
      } else {
        toast.info('Maximum available workshop stock reached');
      }
    });

    // Add to Cart
    this.overlay.querySelector('#modal-add-cart-btn')?.addEventListener('click', () => {
      store.addToCart(p, this.quantity, this.selectedFinish);
      toast.success(`Added ${this.quantity}x ${p.title} (${this.selectedFinish}) to your cart`);
      this.close();
      this.options.onOpenCart?.();
    });

    // Open Room Visualizer
    this.overlay.querySelector('#modal-open-room-btn')?.addEventListener('click', () => {
      this.close();
      this.options.onOpenVisualizer?.(p);
    });

    // Review Form submit
    const reviewForm = this.overlay.querySelector('#write-review-form');
    reviewForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const userName = this.overlay.querySelector('#review-name').value.trim();
      const rating = parseInt(this.overlay.querySelector('#review-rating').value, 10);
      const comment = this.overlay.querySelector('#review-comment').value.trim();

      store.addReview(p.id, { userName, rating, comment });
      toast.success('Your review has been verified and published!');
      this.currentProduct = store.getProductById(p.id);
      this.render();
    });
  }
}
