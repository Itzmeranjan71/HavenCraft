import './style.css';
import { store } from './utils/storage.js';
import { toast } from './components/toast.js';
import { renderNavbar } from './components/navbar.js';
import { renderHero } from './components/hero.js';
import { renderCatalog } from './components/catalog.js';
import { ProductModal } from './components/productModal.js';
import { RoomVisualizerModal } from './components/roomVisualizer.js';
import { CartDrawer } from './components/cartDrawer.js';
import { CheckoutModal } from './components/checkoutModal.js';
import { UserDashboardModal } from './components/userDashboard.js';
import { AuthModal } from './components/authModal.js';
import { renderAdminDashboard } from './components/adminDashboard.js';
import { renderFooter } from './components/footer.js';

class HavenCraftApp {
  constructor() {
    this.currentView = 'storefront'; // 'storefront' or 'admin'
    this.initModals();
    this.init();
  }

  initModals() {
    this.authModal = new AuthModal({
      onLoginSuccess: (user) => {
        if (user.role === 'admin') {
          toast.success(`Welcome Director ${user.name}`);
        } else {
          toast.success(`Welcome back to the Atelier, ${user.name}`);
        }
      }
    });

    this.cartDrawer = new CartDrawer({
      onProceedCheckout: () => {
        this.checkoutModal.open();
      }
    });

    this.checkoutModal = new CheckoutModal({
      onOrderComplete: (order) => {
        console.log('Order completed:', order);
      }
    });

    this.userModal = new UserDashboardModal({
      onOpenCart: () => {
        this.cartDrawer.open();
      },
      onLogout: () => {
        this.setView('storefront');
      },
      onRequireAuth: () => {
        this.authModal.open('login');
      }
    });

    this.roomVisualizer = new RoomVisualizerModal({
      onOpenCart: () => {
        this.cartDrawer.open();
      }
    });

    this.productModal = new ProductModal({
      onOpenCart: () => {
        this.cartDrawer.open();
      },
      onOpenVisualizer: (product) => {
        this.roomVisualizer.open(product);
      }
    });
  }

  setView(viewName) {
    this.currentView = viewName;
    const storefront = document.getElementById('storefront-content');
    const admin = document.getElementById('admin-container');

    if (viewName === 'admin') {
      storefront.style.display = 'none';
      admin.style.display = 'block';
      this.renderAdminView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      storefront.style.display = 'block';
      admin.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  renderAdminView() {
    const adminContainer = document.getElementById('admin-container');
    renderAdminDashboard(adminContainer, {
      onExitAdmin: () => {
        this.setView('storefront');
      }
    });
  }

  init() {
    const navContainer = document.getElementById('nav-container');
    const heroContainer = document.getElementById('hero-container');
    const catalogContainer = document.getElementById('catalog-container');
    const footerContainer = document.getElementById('footer-container');

    // Render Navigation with Authentication Hooks
    renderNavbar(navContainer, {
      onRoleSwitch: (role) => {
        if (role === 'admin') {
          this.setView('admin');
        } else {
          this.setView('storefront');
        }
      },
      onOpenAuth: (mode = 'login') => {
        this.authModal.open(mode);
      },
      onLogout: () => {
        this.setView('storefront');
      },
      onNavigateHome: () => {
        this.setView('storefront');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onNavigateCatalog: () => {
        this.setView('storefront');
        document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
      },
      onOpenVisualizer: () => {
        this.roomVisualizer.open();
      },
      onOpenAdmin: () => {
        if (!store.isLoggedIn()) {
          this.authModal.open('login');
          toast.info('Please sign in with administrator credentials.');
          return;
        }
        const user = store.getUser();
        if (user && user.role === 'admin') {
          this.setView('admin');
        } else {
          this.authModal.open('login');
          toast.info('Administrator credentials required to enter Merchant Suite.');
        }
      },
      onOpenCart: () => {
        this.cartDrawer.open();
      },
      onOpenUser: () => {
        if (store.isLoggedIn()) {
          this.userModal.open('orders');
        } else {
          this.authModal.open('login');
        }
      }
    });

    // Render Hero Section
    renderHero(heroContainer, {
      onOpenVisualizer: () => {
        this.roomVisualizer.open();
      }
    });

    // Render Catalog & Products
    renderCatalog(catalogContainer, {
      onSelectProduct: (product) => {
        this.productModal.open(product);
      },
      onOpenVisualizer: (product) => {
        this.roomVisualizer.open(product);
      }
    });

    // Render Footer
    renderFooter(footerContainer);

    // Global Keybindings & Header Scroll Shadow
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.authModal.close();
        this.productModal.close();
        this.roomVisualizer.close();
        this.cartDrawer.close();
        this.checkoutModal.close();
        this.userModal.close();
      }
    });

    window.addEventListener('scroll', () => {
      const header = document.getElementById('site-header');
      if (header) {
        if (window.scrollY > 30) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });

    // Welcome Toast greeting
    setTimeout(() => {
      toast.info('Welcome to HavenCraft Living Atelier. Use code WELCOME10 for 10% off.');
    }, 1200);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new HavenCraftApp();
});
