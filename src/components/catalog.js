import { icons } from '../utils/icons.js';
import { store } from '../utils/storage.js';
import { toast } from './toast.js';

export function renderCatalog(container, options = {}) {
  let selectedCategory = 'all';
  let searchQuery = '';
  let sortBy = 'featured';

  function getFilteredProducts() {
    let list = store.getProducts();

    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.materials && p.materials.some(m => m.toLowerCase().includes(q)))
      );
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }

  function render() {
    const products = getFilteredProducts();
    const categories = store.getCategories();

    container.innerHTML = `
      <section class="container" id="catalog-section">
        <!-- Catalog Header -->
        <div class="catalog-header-bar">
          <div class="catalog-title-row">
            <div>
              <div class="section-eyebrow">Handcrafted Living</div>
              <h2 class="section-heading">Curated Furniture Collections</h2>
            </div>
            
            <div class="catalog-controls">
              <!-- Search Box -->
              <div class="search-input-wrapper">
                ${icons.search}
                <input 
                  type="text" 
                  class="search-input" 
                  id="catalog-search-input" 
                  placeholder="Search sofa, oak desk, walnut..." 
                  value="${searchQuery}"
                />
              </div>

              <!-- Sort Dropdown -->
              <select class="sort-select" id="catalog-sort-select">
                <option value="featured" ${sortBy === 'featured' ? 'selected' : ''}>Featured Curation</option>
                <option value="rating" ${sortBy === 'rating' ? 'selected' : ''}>Highest Customer Rating</option>
                <option value="price-low" ${sortBy === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price-high" ${sortBy === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
              </select>
            </div>
          </div>

          <!-- Category Filter Pills -->
          <div class="category-pills">
            <button class="category-pill ${selectedCategory === 'all' ? 'active' : ''}" data-cat="all">
              All Rooms (${store.getProducts().length})
            </button>
            ${categories.map(c => `
              <button class="category-pill ${selectedCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
                ${c.name}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Products Grid -->
        ${products.length === 0 ? `
          <div style="text-align:center; padding: 60px 20px; background:var(--color-surface); border-radius:var(--radius-lg); border:1px solid var(--color-border); margin-bottom:48px;">
            <div style="font-size: 2.5rem; margin-bottom: 12px; opacity:0.6;">🪑</div>
            <h3 style="font-family: var(--font-serif); font-size: 1.4rem; margin-bottom: 6px;">No furniture matches your criteria</h3>
            <p style="color:var(--color-text-muted); font-size:0.9rem; margin-bottom:20px;">Try adjusting your search terms or room filter.</p>
            <button class="btn-secondary btn-sm" id="reset-filter-btn">Reset All Filters</button>
          </div>
        ` : `
          <div class="products-grid">
            ${products.map(product => {
              return `
                <div class="product-card" data-id="${product.id}">
                  <div class="product-card-img-wrap" data-action="view-details">
                    <img src="${product.image}" alt="${product.title}" class="product-card-img" loading="lazy" />
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}

                    <div class="product-quick-view-overlay">
                      <button class="btn-quick-view" data-action="view-details">
                        ${icons.eye} Inspect Details & Finishes
                      </button>
                    </div>
                  </div>

                  <div class="product-card-body">
                    <div class="product-meta-row">
                      <span class="product-category-tag">${product.category.replace('-', ' ')}</span>
                      <div class="product-rating">
                        ${icons.star}
                        <span>${product.rating}</span>
                        <span style="color:var(--color-text-light); font-weight:400;">(${product.reviewCount})</span>
                      </div>
                    </div>

                    <h3 class="product-title" data-action="view-details">${product.title}</h3>

                    ${product.finishes && product.finishes.length ? `
                      <div class="product-finishes-preview">
                        ${product.finishes.map(f => `
                          <div class="finish-dot" style="background-color: ${f.color}" title="${f.name}"></div>
                        `).join('')}
                        <span class="product-finishes-text">${product.finishes.length} Finishes Available</span>
                      </div>
                    ` : ''}

                    <div class="product-card-footer">
                      <div class="product-price-box">
                        <span class="product-current-price">$${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? `<span class="product-orig-price">$${product.originalPrice.toLocaleString()}</span>` : ''}
                      </div>

                      <button class="btn-card-add" data-action="quick-add">
                        ${icons.cart} Add
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}

        <!-- Interactive 3D Room Visualizer Teaser Banner -->
        <div class="visualizer-promo-banner">
          <div class="visualizer-promo-content">
            <div class="section-eyebrow" style="color:var(--color-accent-gold);">${icons.sparkles} Architectural Spatial Studio</div>
            <h3>Experience HavenCraft Furniture in Your Room</h3>
            <p>
              Curious how the curved bouclé sofa or solid oak dining suite pairs with your natural light and wall palette? Test our interactive 3D spatial studio with live finish swatches and scale simulation.
            </p>
            <button class="btn-accent" id="banner-open-visualizer">
              ${icons.cube} Launch 3D Room Studio
            </button>
          </div>

          <div class="visualizer-canvas-preview">
            <img src="/images/hero.jpg" alt="Room preview" />
            <div class="visualizer-badge">
              ${icons.sparkles} Real-Time Lighting
            </div>
          </div>
        </div>
      </section>
    `;

    // Attach listeners
    const searchInput = container.querySelector('#catalog-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
      const updatedInput = container.querySelector('#catalog-search-input');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(searchQuery.length, searchQuery.length);
      }
    });

    const sortSelect = container.querySelector('#catalog-sort-select');
    sortSelect?.addEventListener('change', (e) => {
      sortBy = e.target.value;
      render();
    });

    const categoryButtons = container.querySelectorAll('.category-pill');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.getAttribute('data-cat');
        render();
      });
    });

    const resetBtn = container.querySelector('#reset-filter-btn');
    resetBtn?.addEventListener('click', () => {
      selectedCategory = 'all';
      searchQuery = '';
      sortBy = 'featured';
      render();
    });

    container.querySelector('#banner-open-visualizer')?.addEventListener('click', () => {
      options.onOpenVisualizer?.();
    });

    // Product card delegate events
    container.querySelectorAll('.product-card').forEach(card => {
      const prodId = card.getAttribute('data-id');
      const product = store.getProductById(prodId);

      card.querySelectorAll('[data-action="view-details"]').forEach(el => {
        el.addEventListener('click', () => {
          options.onSelectProduct?.(product);
        });
      });

      card.querySelector('[data-action="quick-add"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        store.addToCart(product, 1);
        toast.success(`Added 1x ${product.title} to cart`);
      });
    });
  }

  // Subscribe to changes in products
  store.subscribe('products:changed', () => render());

  render();
}
