import { icons } from '../utils/icons.js';
import { store } from '../utils/storage.js';
import { toast } from './toast.js';

export class CartDrawer {
  constructor(options = {}) {
    this.options = options;
    this.overlay = null;

    this.init();
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'cart-drawer-overlay';
    this.overlay.id = 'cart-drawer-overlay';
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    store.subscribe('cart:changed', () => {
      if (this.isOpen()) {
        this.render();
      }
    });
  }

  isOpen() {
    return this.overlay.classList.contains('active');
  }

  open() {
    this.render();
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  render() {
    const cart = store.getCart();
    const totals = store.getCartTotals();
    const count = store.getCartCount();

    this.overlay.innerHTML = `
      <div class="cart-drawer">
        <!-- Header -->
        <div class="cart-header">
          <div>
            <h3>Your Atelier Cart</h3>
            <span style="font-size: 0.8125rem; color: var(--color-text-muted);">
              ${count} ${count === 1 ? 'handcrafted piece' : 'handcrafted pieces'}
            </span>
          </div>
          <button class="nav-btn" id="cart-close-btn" title="Close Cart">
            ${icons.close}
          </button>
        </div>

        <!-- Body / Items -->
        <div class="cart-body">
          ${cart.length === 0 ? `
            <div class="cart-empty-state">
              <div class="cart-empty-icon">${icons.cart}</div>
              <h4 style="font-family: var(--font-serif); font-size: 1.3rem; margin-bottom: 6px;">Your cart is empty</h4>
              <p style="color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 24px;">
                Discover architectural seating, solid oak tables, and luxury bedroom centerpieces.
              </p>
              <button class="btn-primary btn-sm" id="cart-explore-btn">
                Browse Collections
              </button>
            </div>
          ` : `
            ${cart.map(item => `
              <div class="cart-item-card">
                <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
                <div class="cart-item-details">
                  <h4 class="cart-item-title">${item.title}</h4>
                  <div class="cart-item-finish">Finish: ${item.finish}</div>
                  
                  <div class="cart-item-bottom">
                    <!-- Qty Stepper -->
                    <div class="qty-counter" style="border-radius: var(--radius-sm); scale: 0.9; margin-left: -4px;">
                      <button class="qty-btn" data-action="minus" data-id="${item.id}" data-finish="${item.finish}">
                        ${icons.minus}
                      </button>
                      <span class="qty-display">${item.quantity}</span>
                      <button class="qty-btn" data-action="plus" data-id="${item.id}" data-finish="${item.finish}">
                        ${icons.plus}
                      </button>
                    </div>

                    <!-- Price -->
                    <div class="cart-item-price">
                      $${(item.price * item.quantity).toLocaleString()}
                    </div>

                    <!-- Remove -->
                    <button class="nav-btn" style="width:32px; height:32px; border:none; color:var(--color-text-light);" data-action="remove" data-id="${item.id}" data-finish="${item.finish}" title="Remove item">
                      ${icons.trash}
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          `}
        </div>

        <!-- Footer / Subtotals -->
        ${cart.length > 0 ? `
          <div class="cart-footer">
            <!-- Promo Code Input -->
            <div class="promo-row">
              <input 
                type="text" 
                class="promo-input" 
                id="cart-promo-input" 
                placeholder="Promo Code (e.g. WELCOME10)" 
                value="${totals.discountCode || ''}"
              />
              <button class="btn-secondary btn-sm" id="cart-promo-apply-btn">
                Apply
              </button>
            </div>

            ${totals.discountCode ? `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-success-bg); padding:6px 12px; border-radius:var(--radius-pill); font-size:0.75rem; color:var(--color-success); font-weight:600;">
                <span>Discount Code "${totals.discountCode}" applied</span>
                <button id="cart-promo-remove" style="color:var(--color-danger); font-size:0.75rem; font-weight:bold;">Remove</button>
              </div>
            ` : ''}

            <!-- Summary lines -->
            <div class="cart-summary-line">
              <span>Subtotal</span>
              <span>$${totals.subtotal.toLocaleString()}</span>
            </div>

            ${totals.discount > 0 ? `
              <div class="cart-summary-line" style="color:var(--color-success); font-weight:600;">
                <span>Atelier Discount</span>
                <span>-$${totals.discount.toLocaleString()}</span>
              </div>
            ` : ''}

            <div class="cart-summary-line">
              <span>White-Glove Delivery & Setup</span>
              <span>${totals.shipping === 0 ? '<strong style="color:var(--color-success);">FREE (Orders $1,000+)</strong>' : `$${totals.shipping}`}</span>
            </div>

            <div class="cart-summary-line">
              <span>Estimated Sales Tax</span>
              <span>$${totals.tax.toLocaleString()}</span>
            </div>

            <div class="cart-summary-line total">
              <span>Estimated Total</span>
              <span>$${totals.total.toLocaleString()}</span>
            </div>

            <button class="btn-primary" id="cart-checkout-btn" style="width:100%; margin-top:8px;">
              ${icons.shield} Proceed to Secure Checkout &bull; $${totals.total.toLocaleString()}
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // Bind events
    this.overlay.querySelector('#cart-close-btn')?.addEventListener('click', () => this.close());

    this.overlay.querySelector('#cart-explore-btn')?.addEventListener('click', () => {
      this.close();
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Qty and Remove handlers
    this.overlay.querySelectorAll('[data-action="minus"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const finish = btn.getAttribute('data-finish');
        store.updateCartQuantity(id, finish, -1);
      });
    });

    this.overlay.querySelectorAll('[data-action="plus"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const finish = btn.getAttribute('data-finish');
        store.updateCartQuantity(id, finish, 1);
      });
    });

    this.overlay.querySelectorAll('[data-action="remove"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const finish = btn.getAttribute('data-finish');
        store.removeFromCart(id, finish);
        toast.info('Item removed from cart');
      });
    });

    // Promo code
    this.overlay.querySelector('#cart-promo-apply-btn')?.addEventListener('click', () => {
      const input = this.overlay.querySelector('#cart-promo-input');
      const res = store.applyDiscountCode(input.value);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });

    this.overlay.querySelector('#cart-promo-remove')?.addEventListener('click', () => {
      store.removeDiscountCode();
      toast.info('Promo code removed');
    });

    // Checkout
    this.overlay.querySelector('#cart-checkout-btn')?.addEventListener('click', () => {
      this.close();
      this.options.onProceedCheckout?.();
    });
  }
}
