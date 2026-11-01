import { icons } from '../utils/icons.js';
import { store } from '../utils/storage.js';
import { toast } from './toast.js';

export class RoomVisualizerModal {
  constructor(options = {}) {
    this.options = options;
    this.overlay = null;
    this.activeRoomTone = 'sunlit'; // 'sunlit', 'warm', 'dusk'
    this.activeProduct = null;
    this.currentFinishIndex = 0;
    this.itemPosX = 50; // percentage
    this.itemPosY = 55; // percentage

    this.roomPresets = {
      sunlit: {
        name: 'Sunlit Minimalist Loft',
        bgGradient: 'linear-gradient(180deg, #f3efe9 0%, #e2dad0 60%, #c5b8a5 100%)',
        wallColor: '#f7f4ed',
        floorColor: '#d6c7b2',
        lightingDesc: 'Crisp morning daylight (5500K)'
      },
      warm: {
        name: 'Warm Terracotta Atelier',
        bgGradient: 'linear-gradient(180deg, #f0dfd1 0%, #debfa6 60%, #ba967b 100%)',
        wallColor: '#ebd7c5',
        floorColor: '#caa485',
        lightingDesc: 'Golden sunset ambient glow (3200K)'
      },
      dusk: {
        name: 'Moody Nordic Dusk',
        bgGradient: 'linear-gradient(180deg, #2c2f38 0%, #1c1d22 60%, #151619 100%)',
        wallColor: '#2b2d35',
        floorColor: '#1d1e22',
        lightingDesc: 'Subdued evening architectural lighting (2700K)'
      }
    };

    this.init();
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.id = 'room-visualizer-overlay';
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  }

  open(product = null) {
    const products = store.getProducts();
    this.activeProduct = product || products[0];
    this.currentFinishIndex = 0;
    this.itemPosX = 50;
    this.itemPosY = 55;

    this.render();
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  render() {
    const products = store.getProducts();
    const p = this.activeProduct || products[0];
    const currentFinish = p.finishes && p.finishes[this.currentFinishIndex] ? p.finishes[this.currentFinishIndex] : null;
    const room = this.roomPresets[this.activeRoomTone];

    this.overlay.innerHTML = `
      <div class="modal-card" style="max-width: 1040px; padding: 28px;">
        <button class="modal-close-btn" id="vis-close-btn" title="Close">${icons.close}</button>

        <div style="margin-bottom: 20px;">
          <div class="section-eyebrow">${icons.cube} Interactive Spatial Design Tool</div>
          <h2 style="font-family: var(--font-serif); font-size: 1.85rem; color: var(--color-primary); margin-bottom: 4px;">
            Atelier Room Visualizer
          </h2>
          <p style="color: var(--color-text-muted); font-size: 0.875rem;">
            Test proportions, architectural lighting scenarios, and material swatches against your wall palette.
          </p>
        </div>

        <div class="visualizer-workspace">
          <!-- Left Controls Sidebar -->
          <div class="visualizer-sidebar">
            <!-- Room Environment Tone -->
            <div style="margin-bottom: 20px;">
              <label style="display:block; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                Lighting Environment
              </label>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${Object.entries(this.roomPresets).map(([key, val]) => `
                  <button class="btn-secondary btn-sm ${this.activeRoomTone === key ? 'active' : ''}" 
                    data-room="${key}" 
                    style="justify-content: flex-start; text-align: left; ${this.activeRoomTone === key ? 'border-color: var(--color-accent); background: var(--color-surface); font-weight:700;' : ''}">
                    ${val.name}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Select Furniture Piece -->
            <div style="margin-bottom: 20px;">
              <label style="display:block; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                Featured Furniture Piece
              </label>
              <select id="vis-product-select" class="form-control" style="font-size:0.85rem;">
                ${products.map(prod => `
                  <option value="${prod.id}" ${prod.id === p.id ? 'selected' : ''}>
                    ${prod.title} ($${prod.price.toLocaleString()})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Material & Fabric Finish Selector -->
            ${p.finishes && p.finishes.length ? `
              <div style="margin-bottom: 20px;">
                <label style="display:block; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                  Material Finish
                </label>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${p.finishes.map((f, idx) => `
                    <button class="swatch-btn ${this.currentFinishIndex === idx ? 'active' : ''}" data-finish-idx="${idx}" style="font-size:0.8rem; width:100%;">
                      <div class="swatch-color-circle" style="background-color:${f.color}"></div>
                      <span>${f.name}</span>
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Dimensions Badge -->
            <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:12px; margin-bottom:20px; font-size:0.75rem;">
              <div style="font-weight:700; color:var(--color-primary); margin-bottom:4px;">Scale Footprint:</div>
              <div>Width: ${p.dimensions?.width || 'Standard'}</div>
              <div>Depth: ${p.dimensions?.depth || 'Standard'}</div>
              <div>Seat/Height: ${p.dimensions?.height || 'Standard'}</div>
            </div>

            <!-- Direct Add Button -->
            <button class="btn-primary btn-sm" id="vis-add-cart-btn" style="width:100%;">
              ${icons.cart} Order Configured Piece
            </button>
          </div>

          <!-- Right Canvas Stage -->
          <div class="visualizer-canvas-stage" id="vis-stage" style="background: ${room.bgGradient};">
            <!-- Simulated Architectural Wall & Floor Horizon -->
            <div style="position: absolute; top:0; left:0; right:0; height:58%; background: ${room.wallColor}; border-bottom: 2px solid rgba(0,0,0,0.06); transition: background 0.4s ease;">
              <!-- Simulated Wall Art -->
              <div style="position: absolute; top: 15%; left: 35%; width: 140px; height: 95px; background: rgba(0,0,0,0.06); border: 3px solid rgba(255,255,255,0.4); box-shadow: 0 4px 14px rgba(0,0,0,0.1); border-radius: 4px; display:flex; align-items:center; justify-content:center; color:rgba(0,0,0,0.3); font-size:0.7rem; font-family:var(--font-serif); letter-spacing:0.1em;">
                ATELIER MURAL
              </div>
            </div>

            <!-- Floor Plane -->
            <div style="position: absolute; bottom:0; left:0; right:0; height:42%; background: ${room.floorColor}; box-shadow: inset 0 20px 40px rgba(0,0,0,0.12); transition: background 0.4s ease;"></div>

            <!-- Draggable / Center Furniture Item Display -->
            <div class="room-hotspot" id="vis-draggable-item" style="top: ${this.itemPosY}%; left: ${this.itemPosX}%; transform: translate(-50%, -50%);">
              <div style="position:relative; width: 340px; max-width: 90vw;">
                <!-- Product Image with custom tint or filter -->
                <img src="${p.image}" alt="${p.title}" style="width:100%; border-radius: var(--radius-lg); box-shadow: 0 30px 60px rgba(0,0,0,0.35); border: 2px solid rgba(255,255,255,0.3);" />
                
                <!-- Finish Tag Overlay -->
                ${currentFinish ? `
                  <div style="position:absolute; bottom: 12px; left: 12px; background: rgba(26,23,20,0.85); backdrop-filter:blur(6px); color:#ffffff; padding: 4px 10px; border-radius:var(--radius-pill); font-size:0.72rem; display:flex; align-items:center; gap:6px;">
                    <div style="width:10px; height:10px; border-radius:50%; background:${currentFinish.color}; border:1px solid #fff;"></div>
                    <span>${currentFinish.name}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Hint overlay -->
            <div style="position: absolute; bottom: 14px; right: 18px; font-size: 0.72rem; color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.5); backdrop-filter:blur(4px); padding: 4px 10px; border-radius: var(--radius-pill);">
              ${icons.sparkles} ${room.lightingDesc}
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind events
    this.overlay.querySelector('#vis-close-btn')?.addEventListener('click', () => this.close());

    // Switch lighting room tone
    this.overlay.querySelectorAll('[data-room]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeRoomTone = btn.getAttribute('data-room');
        this.render();
      });
    });

    // Change furniture product
    const prodSelect = this.overlay.querySelector('#vis-product-select');
    prodSelect?.addEventListener('change', (e) => {
      const selected = store.getProductById(e.target.value);
      if (selected) {
        this.activeProduct = selected;
        this.currentFinishIndex = 0;
        this.render();
      }
    });

    // Change finish swatches
    this.overlay.querySelectorAll('[data-finish-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentFinishIndex = parseInt(btn.getAttribute('data-finish-idx'), 10);
        this.render();
      });
    });

    // Add to cart from visualizer
    this.overlay.querySelector('#vis-add-cart-btn')?.addEventListener('click', () => {
      const finishName = currentFinish ? currentFinish.name : null;
      store.addToCart(p, 1, finishName);
      toast.success(`Configured piece "${p.title}" added to your cart!`);
      this.close();
      this.options.onOpenCart?.();
    });

    // Drag-to-position simulation on the floor stage
    const draggable = this.overlay.querySelector('#vis-draggable-item');
    const stage = this.overlay.querySelector('#vis-stage');
    let isDragging = false;

    if (draggable && stage) {
      draggable.addEventListener('mousedown', (e) => {
        isDragging = true;
        draggable.style.cursor = 'grabbing';
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          if (draggable) draggable.style.cursor = 'grab';
        }
      });

      stage.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = stage.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // constrain within stage floor area
        if (x > 15 && x < 85 && y > 35 && y < 85) {
          this.itemPosX = Math.round(x);
          this.itemPosY = Math.round(y);
          draggable.style.left = `${this.itemPosX}%`;
          draggable.style.top = `${this.itemPosY}%`;
        }
      });
    }
  }
}
