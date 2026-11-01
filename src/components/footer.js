export function renderFooter(container) {
  container.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h4>HavenCraft Living</h4>
            <p style="font-size:0.875rem; line-height:1.6; max-width:320px; margin-bottom:16px;">
              Heirloom architectural furniture engineered with Scandinavian restraint and Japanese joinery ethics. Sourced responsibly, crafted to endure.
            </p>
            <div style="font-size:0.8125rem; color:#847e74;">
              &bull; 100% FSC-Certified Hardwood &bull; Low-VOC Finishes
            </div>
          </div>

          <div class="footer-col">
            <h5>Collections</h5>
            <ul>
              <li><a href="#catalog">Living Room Sanctuary</a></li>
              <li><a href="#catalog">Dining & Gathering</a></li>
              <li><a href="#catalog">Bedroom Retreats</a></li>
              <li><a href="#catalog">Executive Home Office</a></li>
              <li><a href="#catalog">Architectural Lighting</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h5>Client Services</h5>
            <ul>
              <li><a href="#features-strip">White-Glove Installation</a></li>
              <li><a href="#features-strip">10-Year Framework Warranty</a></li>
              <li><a href="#features-strip">100-Night In-Home Trial</a></li>
              <li><a href="#visualizer">3D Spatial Studio</a></li>
              <li><a href="#">Bespoke Timber Commissions</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h5>Atelier Journal</h5>
            <p style="font-size:0.8125rem; margin-bottom:12px; color:#a39e95;">
              Subscribe to preview private release consignments and interior architectural guides.
            </p>
            <div style="display:flex; gap:8px;">
              <input type="email" placeholder="Your email address" class="form-control" style="font-size:0.8125rem; background:#2c2722; border-color:#4a423a; color:#fff;" />
              <button class="btn-accent btn-sm" style="padding:8px 14px; font-size:0.75rem;">Join</button>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div>&copy; 2026 HavenCraft Living Atelier Inc. All rights reserved.</div>
          <div style="display:flex; gap:20px;">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Accessibility (WCAG 2.1 AA)</span>
            <span>ISO 9001 Certified Joinery</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}
