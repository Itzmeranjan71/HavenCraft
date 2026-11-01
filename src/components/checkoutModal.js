import { icons } from '../utils/icons.js';
import { store } from '../utils/storage.js';
import { toast } from './toast.js';

export class CheckoutModal {
  constructor(options = {}) {
    this.options = options;
    this.overlay = null;
    this.currentStep = 1; // 1: Shipping, 2: Payment, 3: Confirmation
    this.orderResult = null;

    this.formData = {
      fullName: 'Sophia Laurent',
      email: 'sophia.laurent@example.com',
      phone: '+1 (415) 890-2341',
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      deliveryNotes: 'Please call 30 mins before arrival. 2nd floor, service elevator available.',
      cardNumber: '•••• •••• •••• 4242',
      cardExp: '11/29',
      cardCvv: '849'
    };

    this.init();
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.id = 'checkout-modal-overlay';
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay && this.currentStep !== 3) {
        this.close();
      }
    });
  }

  open() {
    const cart = store.getCart();
    if (cart.length === 0) {
      toast.info('Your cart is empty. Please select furniture pieces first.');
      return;
    }

    const user = store.getUser();
    if (user && user.address) {
      this.formData.fullName = user.name || this.formData.fullName;
      this.formData.email = user.email || this.formData.email;
      this.formData.street = user.address.street || this.formData.street;
      this.formData.city = user.address.city || this.formData.city;
      this.formData.state = user.address.state || this.formData.state;
      this.formData.zip = user.address.zip || this.formData.zip;
      this.formData.phone = user.phone || this.formData.phone;
    }

    this.currentStep = 1;
    this.orderResult = null;
    this.render();
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  render() {
    const totals = store.getCartTotals();
    const cart = store.getCart();

    this.overlay.innerHTML = `
      <div class="modal-card" style="max-width: 780px;">
        <button class="modal-close-btn" id="checkout-close-btn" title="Close">${icons.close}</button>

        <!-- Stepper Indicators -->
        <div class="checkout-steps-bar">
          <div class="checkout-step-indicator ${this.currentStep >= 1 ? (this.currentStep > 1 ? 'done' : 'active') : ''}">
            <div class="step-num-circle">${this.currentStep > 1 ? icons.check : '1'}</div>
            <span>Shipping & White-Glove</span>
          </div>
          <div class="checkout-step-indicator ${this.currentStep >= 2 ? (this.currentStep > 2 ? 'done' : 'active') : ''}">
            <div class="step-num-circle">${this.currentStep > 2 ? icons.check : '2'}</div>
            <span>Payment Method</span>
          </div>
          <div class="checkout-step-indicator ${this.currentStep === 3 ? 'active done' : ''}">
            <div class="step-num-circle">3</div>
            <span>Confirmed Receipt</span>
          </div>
        </div>

        <div class="checkout-form-body">
          ${this.currentStep === 1 ? `
            <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 6px;">
              White-Glove Delivery Destination
            </h3>
            <p style="color:var(--color-text-muted); font-size:0.875rem; margin-bottom: 24px;">
              Our dedicated delivery specialists handle transit, room-of-choice placement, unboxing, and full debris removal.
            </p>

            <form id="step1-form">
              <div class="form-grid">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" id="ship-name" class="form-control" value="${this.formData.fullName}" required />
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" id="ship-email" class="form-control" value="${this.formData.email}" required />
                </div>
                <div class="form-group full">
                  <label>Street Address</label>
                  <input type="text" id="ship-street" class="form-control" value="${this.formData.street}" required />
                </div>
                <div class="form-group">
                  <label>City</label>
                  <input type="text" id="ship-city" class="form-control" value="${this.formData.city}" required />
                </div>
                <div class="form-group" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                  <div>
                    <label>State</label>
                    <input type="text" id="ship-state" class="form-control" value="${this.formData.state}" required />
                  </div>
                  <div>
                    <label>Zip Code</label>
                    <input type="text" id="ship-zip" class="form-control" value="${this.formData.zip}" required />
                  </div>
                </div>
                <div class="form-group">
                  <label>Contact Phone (For Driver Coordination)</label>
                  <input type="tel" id="ship-phone" class="form-control" value="${this.formData.phone}" required />
                </div>
                <div class="form-group">
                  <label>Delivery Instructions / Room Placement</label>
                  <input type="text" id="ship-notes" class="form-control" value="${this.formData.deliveryNotes}" placeholder="e.g. 2nd floor, elevator code..." />
                </div>
              </div>

              <div style="background:var(--color-surface-subtle); padding:16px 20px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
                <div>
                  <div style="font-weight:700; font-size:0.9rem;">Order Subtotal (${cart.length} unique pieces)</div>
                  <div style="font-size:0.8rem; color:var(--color-text-muted);">White-Glove: ${totals.shipping === 0 ? 'FREE' : `$${totals.shipping}`}</div>
                </div>
                <div style="font-size:1.35rem; font-weight:700; color:var(--color-primary);">$${totals.total.toLocaleString()}</div>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:12px;">
                <button type="submit" class="btn-primary">
                  Continue to Payment ${icons.chevronRight}
                </button>
              </div>
            </form>
          ` : this.currentStep === 2 ? `
            <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 6px;">
              Secure Payment Guarantee
            </h3>
            <p style="color:var(--color-text-muted); font-size:0.875rem; margin-bottom: 24px;">
              Transactions are encrypted with 256-bit SSL protocols. Demo sandbox active.
            </p>

            <form id="step2-form">
              <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:20px; margin-bottom:24px; background:var(--color-surface);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                  <label style="font-weight:700; font-size:0.9375rem; display:flex; align-items:center; gap:8px;">
                    ${icons.shield} Credit / Debit Card
                  </label>
                  <div style="font-size:0.75rem; color:var(--color-text-muted);">Visa &bull; Mastercard &bull; Amex</div>
                </div>

                <div class="form-group" style="margin-bottom:14px;">
                  <label>Card Number</label>
                  <input type="text" class="form-control" value="${this.formData.cardNumber}" required />
                </div>

                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:14px;">
                  <div class="form-group">
                    <label>Expiration (MM/YY)</label>
                    <input type="text" class="form-control" value="${this.formData.cardExp}" required />
                  </div>
                  <div class="form-group">
                    <label>CVV / CVC</label>
                    <input type="password" class="form-control" value="${this.formData.cardCvv}" required />
                  </div>
                </div>
              </div>

              <!-- Order Summary Card -->
              <div style="border:1px dashed var(--color-border); border-radius:var(--radius-md); padding:16px 20px; margin-bottom:24px; font-size:0.875rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                  <span>Subtotal:</span>
                  <span>$${totals.subtotal.toLocaleString()}</span>
                </div>
                ${totals.discount > 0 ? `
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:var(--color-success);">
                    <span>Discount (${totals.discountCode}):</span>
                    <span>-$${totals.discount.toLocaleString()}</span>
                  </div>
                ` : ''}
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                  <span>White-Glove Installation:</span>
                  <span>${totals.shipping === 0 ? 'FREE' : `$${totals.shipping}`}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                  <span>Sales Tax:</span>
                  <span>$${totals.tax.toLocaleString()}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-weight:700; font-size:1.1rem; padding-top:8px; border-top:1px solid var(--color-border); color:var(--color-primary);">
                  <span>Total Amount Authorized:</span>
                  <span>$${totals.total.toLocaleString()}</span>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center;">
                <button type="button" class="btn-secondary" id="checkout-back-step1">
                  ${icons.arrowLeft} Back
                </button>
                <button type="submit" class="btn-accent" id="checkout-submit-btn">
                  ${icons.check} Authorize & Place Order &bull; $${totals.total.toLocaleString()}
                </button>
              </div>
            </form>
          ` : `
            <!-- Step 3: Order Confirmation / Receipt -->
            <div class="receipt-card">
              <div class="receipt-icon-circle">
                ${icons.check}
              </div>
              <h2 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 8px;">
                Thank You for Your Patronage!
              </h2>
              <p style="color:var(--color-text-muted); font-size: 0.9375rem; margin-bottom: 24px;">
                Your bespoke furniture commission has been verified and registered at the atelier.
              </p>

              <div style="display:inline-flex; align-items:center; gap:20px; background:var(--color-surface-subtle); padding:12px 24px; border-radius:var(--radius-pill); font-size:0.875rem; margin-bottom: 28px;">
                <div>Order ID: <strong>${this.orderResult?.id}</strong></div>
                <div>&bull;</div>
                <div>Status: <span class="status-badge Processing">Processing</span></div>
                <div>&bull;</div>
                <div>Carrier Tracking: <strong>${this.orderResult?.trackingNumber}</strong></div>
              </div>

              <div style="text-align:left; background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:20px; margin-bottom: 28px;">
                <h4 style="font-weight:700; margin-bottom: 12px; font-size:0.9375rem;">Items in Shipment:</h4>
                <table class="receipt-table">
                  <thead>
                    <tr>
                      <th>Piece / Description</th>
                      <th>Finish</th>
                      <th>Qty</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.orderResult?.items.map(item => `
                      <tr>
                        <td><strong>${item.title}</strong></td>
                        <td>${item.finish}</td>
                        <td>${item.quantity}</td>
                        <td>$${(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    `).join('')}
                    <tr>
                      <td colspan="3" style="text-align:right; font-weight:600;">Total Paid:</td>
                      <td style="font-weight:700; font-size:1.05rem; color:var(--color-primary);">$${this.orderResult?.total.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                <div style="font-size:0.8125rem; color:var(--color-text-muted); display:flex; justify-content:space-between; margin-top:12px; padding-top:12px; border-top:1px dashed var(--color-border);">
                  <div>
                    <strong>Delivering to:</strong><br/>
                    ${this.formData.fullName}<br/>
                    ${this.formData.street}, ${this.formData.city}, ${this.formData.state} ${this.formData.zip}
                  </div>
                  <div style="text-align:right;">
                    <strong>White-Glove Appointment:</strong><br/>
                    Within 3 to 5 business days<br/>
                    Dispatch team will coordinate by phone
                  </div>
                </div>
              </div>

              <div style="display:flex; justify-content:center; gap:16px;">
                <button class="btn-secondary" id="receipt-print-btn">
                  Print Formal Invoice
                </button>
                <button class="btn-primary" id="receipt-done-btn">
                  Return to Atelier Collections
                </button>
              </div>
            </div>
          `}
        </div>
      </div>
    `;

    // Bind events
    this.overlay.querySelector('#checkout-close-btn')?.addEventListener('click', () => this.close());

    // Step 1 Form Submit
    const step1Form = this.overlay.querySelector('#step1-form');
    step1Form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.formData.fullName = this.overlay.querySelector('#ship-name').value.trim();
      this.formData.email = this.overlay.querySelector('#ship-email').value.trim();
      this.formData.street = this.overlay.querySelector('#ship-street').value.trim();
      this.formData.city = this.overlay.querySelector('#ship-city').value.trim();
      this.formData.state = this.overlay.querySelector('#ship-state').value.trim();
      this.formData.zip = this.overlay.querySelector('#ship-zip').value.trim();
      this.formData.phone = this.overlay.querySelector('#ship-phone').value.trim();
      this.formData.deliveryNotes = this.overlay.querySelector('#ship-notes').value.trim();

      this.currentStep = 2;
      this.render();
    });

    // Step 2 Back & Submit
    this.overlay.querySelector('#checkout-back-step1')?.addEventListener('click', () => {
      this.currentStep = 1;
      this.render();
    });

    const step2Form = this.overlay.querySelector('#step2-form');
    step2Form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentCart = store.getCart();
      const currentTotals = store.getCartTotals();

      this.orderResult = store.createOrder({
        customerName: this.formData.fullName,
        customerEmail: this.formData.email,
        items: [...currentCart],
        subtotal: currentTotals.subtotal,
        shipping: currentTotals.shipping,
        discount: currentTotals.discount,
        tax: currentTotals.tax,
        total: currentTotals.total,
        shippingAddress: {
          street: this.formData.street,
          city: this.formData.city,
          state: this.formData.state,
          zip: this.formData.zip
        },
        deliveryNotes: this.formData.deliveryNotes
      });

      this.currentStep = 3;
      toast.success('Order placed successfully! Tracking number generated.');
      this.render();
    });

    // Step 3 Actions
    this.overlay.querySelector('#receipt-print-btn')?.addEventListener('click', () => {
      window.print();
    });

    this.overlay.querySelector('#receipt-done-btn')?.addEventListener('click', () => {
      this.close();
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}
