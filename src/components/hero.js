import { icons } from '../utils/icons.js';

export function renderHero(container, options = {}) {
  container.innerHTML = `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-card">
        <img src="/images/hero.jpg" alt="HavenCraft Luxury Living Room" class="hero-bg-img" />
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-eyebrow">
            ${icons.sparkles} Atelier Collection 2026
          </div>
          <h1 class="hero-title">
            Architectural Forms. <em>Handcrafted</em> for Life.
          </h1>
          <p class="hero-subtitle">
            Impeccably proportioned living, dining, and bedroom statements sculpted from solid oak, walnut, and textured bouclé. Designed to endure generations.
          </p>
          <div class="hero-cta-group">
            <button class="btn-primary" id="hero-shop-btn">
              Explore Collection ${icons.chevronRight}
            </button>
            <button class="btn-secondary" id="hero-visualizer-btn" style="background: rgba(255,255,255,0.15); color:#fff; border-color: rgba(255,255,255,0.3); backdrop-filter:blur(8px);">
              ${icons.cube} 3D Room Visualizer
            </button>
          </div>
        </div>

        <div class="hero-floating-badge">
          <div class="floating-badge-icon">
            ${icons.leaf}
          </div>
          <div class="floating-badge-text">
            <h5>100% FSC&reg; Certified</h5>
            <p>Ethically harvested solid hardwoods</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Value Props Strip -->
    <section class="features-strip" id="features-strip">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon-box">${icons.truck}</div>
            <div class="feature-text">
              <h4>White-Glove Delivery</h4>
              <p>Room-of-choice placement & complimentary assembly</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">${icons.shield}</div>
            <div class="feature-text">
              <h4>10-Year Framework Warranty</h4>
              <p>Heirloom-grade mortise & tenon joinery</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">${icons.compass}</div>
            <div class="feature-text">
              <h4>Custom Finishes</h4>
              <p>Tailored hardwoods, top-grain leathers & bouclé</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">${icons.sparkles}</div>
            <div class="feature-text">
              <h4>100-Night In-Home Trial</h4>
              <p>Experience pieces in your personal lighting</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  container.querySelector('#hero-shop-btn')?.addEventListener('click', () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  container.querySelector('#hero-visualizer-btn')?.addEventListener('click', () => {
    options.onOpenVisualizer?.();
  });
}
