import { initialProducts, initialCategories } from '../data/products.js';

const API_BASE = '/api';

const STORAGE_KEYS = {
  PRODUCTS: 'furnicraft_products',
  CATEGORIES: 'furnicraft_categories',
  CART: 'furnicraft_cart',
  ORDERS: 'furnicraft_orders',
  USER: 'furnicraft_user',
  AUTH_TOKEN: 'furnicraft_token',
  DISCOUNT: 'furnicraft_discount'
};

const defaultUser = {
  id: 'usr-1001',
  name: 'Sophia Laurent',
  email: 'sophia.laurent@example.com',
  role: 'customer', // 'customer' or 'admin'
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  address: {
    street: '742 Evergreen Terrace',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    country: 'United States'
  },
  phone: '+1 (415) 890-2341'
};

const initialOrders = [
  {
    id: 'ORD-9821',
    customerName: 'Sophia Laurent',
    customerEmail: 'sophia.laurent@example.com',
    date: '2026-10-28',
    status: 'Shipped',
    items: [
      {
        id: 'prod-102',
        title: 'Koben Nordic Solid Oak Lounge Chair',
        price: 890,
        quantity: 1,
        finish: 'Natural White Oak / Cloud',
        image: '/images/armchair.jpg'
      }
    ],
    subtotal: 890,
    shipping: 0,
    discount: 0,
    tax: 71.20,
    total: 961.20,
    shippingAddress: {
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107'
    },
    trackingNumber: 'FX-89472-US'
  },
  {
    id: 'ORD-9740',
    customerName: 'Marcus Sterling',
    customerEmail: 'marcus.s@luxuryholdings.com',
    date: '2026-10-24',
    status: 'Delivered',
    items: [
      {
        id: 'prod-101',
        title: 'Aura Curved Bouclé Sectional Sofa',
        price: 2490,
        quantity: 1,
        finish: 'Oatmeal Bouclé',
        image: '/images/hero.jpg'
      }
    ],
    subtotal: 2490,
    shipping: 0,
    discount: 150,
    tax: 187.20,
    total: 2527.20,
    shippingAddress: {
      street: '1000 Brickell Ave, Penthouse 4',
      city: 'Miami',
      state: 'FL',
      zip: '33131'
    },
    trackingNumber: 'FX-76319-US'
  }
];

class Store {
  constructor() {
    this.listeners = new Map();
    this.backendAvailable = false;
    this.init();
  }

  init() {
    // 1. Initial Local Cache
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) && localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'hc_token_usr-1001_demo');
    }

    // Clean up any old wishlist storage if left over
    if (localStorage.getItem('furnicraft_wishlist')) {
      localStorage.removeItem('furnicraft_wishlist');
    }

    // 2. Asynchronously Sync with Python FastAPI Backend
    this.syncWithBackend();
  }

  async syncWithBackend() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        this.backendAvailable = true;
        console.log('[HavenCraft] Connected to Python FastAPI backend engine');

        // Parallel fetch initial datasets
        await Promise.allSettled([
          this.fetchProductsFromBackend(),
          this.fetchCategoriesFromBackend(),
          this.fetchOrdersFromBackend(),
          this.fetchUserProfileFromBackend()
        ]);
      }
    } catch {
      // Backend not yet reachable, continuing in resilient local mode
      this.backendAvailable = false;
    }
  }

  // Pub/Sub Event System
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const arr = this.listeners.get(event) || [];
      this.listeners.set(event, arr.filter(cb => cb !== callback));
    };
  }

  emit(event, data) {
    const arr = this.listeners.get(event) || [];
    arr.forEach(cb => cb(data));
  }

  // Products
  getProducts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  }

  getProductById(id) {
    const list = this.getProducts();
    return list.find(p => p.id === id);
  }

  async fetchProductsFromBackend() {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const products = await res.json();
        if (Array.isArray(products) && products.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
          this.emit('products:changed', products);
          return products;
        }
      }
    } catch (err) {
      console.warn('[HavenCraft API] Error fetching products:', err);
    }
    return this.getProducts();
  }

  async saveProduct(product) {
    const list = this.getProducts();
    const index = list.findIndex(p => p.id === product.id);
    const isNew = index < 0;

    if (!isNew) {
      list[index] = product;
    } else {
      product.id = product.id || 'prod-' + Date.now();
      list.unshift(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
    this.emit('products:changed', list);

    // Sync to Python backend
    try {
      if (isNew) {
        const payload = {
          sku: product.sku || `SKU-${Date.now()}`,
          title: product.title,
          category: product.category || 'living-room',
          price: Number(product.price) || 0,
          original_price: product.originalPrice ? Number(product.originalPrice) : null,
          stock: Number(product.stock) || 10,
          badge: product.badge || 'New Release',
          image: product.image || '/images/hero.jpg',
          secondary_images: product.secondaryImages || [],
          materials: product.materials || [],
          finishes: product.finishes || [],
          dimensions: product.dimensions || {},
          description: product.description || '',
          features: product.features || []
        };
        const res = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          // Update ID if assigned by server
          const currentList = this.getProducts();
          const curIdx = currentList.findIndex(p => p.id === product.id);
          if (curIdx >= 0) {
            currentList[curIdx] = created;
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(currentList));
            this.emit('products:changed', currentList);
          }
        }
      } else {
        await fetch(`${API_BASE}/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: product.title,
            category: product.category,
            price: Number(product.price),
            original_price: product.originalPrice ? Number(product.originalPrice) : null,
            stock: Number(product.stock),
            badge: product.badge,
            image: product.image,
            description: product.description
          })
        });
      }
    } catch (err) {
      console.warn('[HavenCraft API] Error saving product to backend:', err);
    }

    return product;
  }

  async deleteProduct(id) {
    let list = this.getProducts();
    list = list.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
    this.emit('products:changed', list);

    try {
      await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[HavenCraft API] Error deleting product on backend:', err);
    }
  }

  // Categories
  getCategories() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  }

  async fetchCategoriesFromBackend() {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const categories = await res.json();
        if (Array.isArray(categories) && categories.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
          this.emit('categories:changed', categories);
          return categories;
        }
      }
    } catch (err) {
      console.warn('[HavenCraft API] Error fetching categories:', err);
    }
    return this.getCategories();
  }

  // Cart
  getCart() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
  }

  addToCart(product, quantity = 1, selectedFinish = null) {
    const cart = this.getCart();
    const finish = selectedFinish || (product.finishes && product.finishes[0] ? product.finishes[0].name : 'Default');
    const priceOffset = selectedFinish ? (product.finishes.find(f => f.name === selectedFinish)?.priceOffset || 0) : 0;
    const itemPrice = product.price + priceOffset;

    const existingIndex = cart.findIndex(item => item.id === product.id && item.finish === finish);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: itemPrice,
        originalPrice: product.originalPrice,
        finish,
        image: product.image,
        category: product.category,
        quantity
      });
    }

    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.emit('cart:changed', cart);
  }

  updateCartQuantity(id, finish, delta) {
    const cart = this.getCart();
    const item = cart.find(i => i.id === id && i.finish === finish);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(id, finish);
      return;
    }

    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.emit('cart:changed', cart);
  }

  removeFromCart(id, finish) {
    let cart = this.getCart();
    cart = cart.filter(i => !(i.id === id && i.finish === finish));
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.emit('cart:changed', cart);
  }

  clearCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    this.emit('cart:changed', []);
  }

  getCartCount() {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartTotals() {
    const cart = this.getCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 95;
    const discountCode = this.getDiscountCode();
    let discount = 0;
    if (discountCode === 'WELCOME10') {
      discount = Math.round(subtotal * 0.10);
    } else if (discountCode === 'LUXEFURNI') {
      discount = subtotal >= 500 ? 150 : 0;
    }
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableSubtotal * 0.08 * 100) / 100;
    const total = Math.max(0, taxableSubtotal + shipping + tax);

    return {
      subtotal,
      shipping,
      discount,
      discountCode,
      tax,
      total
    };
  }

  async applyDiscountCode(code) {
    const clean = code.trim().toUpperCase();
    const totals = this.getCartTotals();

    // Check with Python backend endpoint if online
    try {
      const res = await fetch(`${API_BASE}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, subtotal: totals.subtotal })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          localStorage.setItem(STORAGE_KEYS.DISCOUNT, data.code);
          this.emit('cart:changed', this.getCart());
          return { success: true, message: data.message };
        } else {
          return { success: false, message: data.message };
        }
      }
    } catch {
      // Fallback
    }

    if (clean === 'WELCOME10' || clean === 'LUXEFURNI') {
      localStorage.setItem(STORAGE_KEYS.DISCOUNT, clean);
      this.emit('cart:changed', this.getCart());
      return { success: true, message: `Promo code ${clean} applied successfully!` };
    }
    return { success: false, message: 'Invalid coupon code. Try WELCOME10 or LUXEFURNI' };
  }

  getDiscountCode() {
    return localStorage.getItem(STORAGE_KEYS.DISCOUNT) || '';
  }

  removeDiscountCode() {
    localStorage.removeItem(STORAGE_KEYS.DISCOUNT);
    this.emit('cart:changed', this.getCart());
  }

  // User & Authentication
  getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || '';
  }

  isLoggedIn() {
    return Boolean(this.getAuthToken() && localStorage.getItem(STORAGE_KEYS.USER));
  }

  getUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.detail || 'Invalid email or password' };
      }
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      this.emit('user:changed', data.user);
      this.emit('auth:changed', { loggedIn: true, user: data.user });
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      console.warn('[HavenCraft Auth] Login error:', err);
      return { success: false, message: 'Unable to connect to authentication server' };
    }
  }

  async register(userData) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.detail || 'Registration failed' };
      }
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      this.emit('user:changed', data.user);
      this.emit('auth:changed', { loggedIn: true, user: data.user });
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      console.warn('[HavenCraft Auth] Register error:', err);
      return { success: false, message: 'Unable to connect to authentication server' };
    }
  }

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch {}
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.emit('user:changed', null);
    this.emit('auth:changed', { loggedIn: false, user: null });
    return { success: true, message: 'Successfully signed out' };
  }

  async fetchUserProfileFromBackend() {
    try {
      const headers = {};
      const token = this.getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/user/profile`, { headers });
      if (res.ok) {
        const user = await res.json();
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        this.emit('user:changed', user);
        return user;
      }
    } catch (err) {
      console.warn('[HavenCraft API] Error fetching user profile:', err);
    }
    return this.getUser();
  }

  async setUserRole(role) {
    const user = this.getUser();
    user.role = role;
    if (role === 'admin') {
      user.name = 'Alexander Vance (Operations Director)';
      user.email = 'alexander.admin@furnicraft.luxury';
    } else {
      user.name = 'Sophia Laurent';
      user.email = 'sophia.laurent@example.com';
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.emit('user:changed', user);

    try {
      await fetch(`${API_BASE}/user/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
    } catch (err) {
      console.warn('[HavenCraft API] Error setting user role:', err);
    }
  }

  async updateUserProfile(updatedData) {
    const user = { ...this.getUser(), ...updatedData };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.emit('user:changed', user);

    try {
      const payload = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        street: user.address?.street,
        city: user.address?.city,
        state: user.address?.state,
        zip_code: user.address?.zip
      };
      await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('[HavenCraft API] Error updating user profile:', err);
    }

    return user;
  }

  // Orders
  getOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  }

  async fetchOrdersFromBackend() {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (res.ok) {
        const orders = await res.json();
        if (Array.isArray(orders) && orders.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
          this.emit('orders:changed', orders);
          return orders;
        }
      }
    } catch (err) {
      console.warn('[HavenCraft API] Error fetching orders:', err);
    }
    return this.getOrders();
  }

  async createOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().split('T')[0],
      status: 'Processing',
      trackingNumber: 'FX-' + Math.floor(10000 + Math.random() * 90000) + '-US',
      ...orderData
    };
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Deduct stock locally
    const products = this.getProducts();
    newOrder.items.forEach(item => {
      const prod = products.find(p => p.id === item.id);
      if (prod && prod.stock >= item.quantity) {
        prod.stock -= item.quantity;
      }
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.emit('products:changed', products);

    this.clearCart();
    this.removeDiscountCode();
    this.emit('orders:changed', orders);

    // Sync to Python backend API
    try {
      const payload = {
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        items: orderData.items.map(i => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          finish: i.finish || 'Standard',
          image: i.image
        })),
        subtotal: orderData.subtotal,
        shipping: orderData.shipping || 0,
        discount: orderData.discount || 0,
        tax: orderData.tax || 0,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress || {},
        deliveryNotes: orderData.deliveryNotes || ''
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const createdFromBackend = await res.json();
        // Update local order with backend tracking number & ID
        const currentOrders = this.getOrders();
        const oIdx = currentOrders.findIndex(o => o.id === newOrder.id);
        if (oIdx >= 0) {
          currentOrders[oIdx] = createdFromBackend;
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(currentOrders));
          this.emit('orders:changed', currentOrders);
          return createdFromBackend;
        }
      }
    } catch (err) {
      console.warn('[HavenCraft API] Error commissioning order to backend:', err);
    }

    return newOrder;
  }

  async updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      this.emit('orders:changed', orders);
    }

    try {
      await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('[HavenCraft API] Error updating order status on backend:', err);
    }

    return order;
  }

  // Reviews
  async addReview(productId, review) {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (!product.reviews) product.reviews = [];
    const newReview = {
      id: 'rev-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      verified: true,
      ...review
    };
    product.reviews.unshift(newReview);
    product.reviewCount = product.reviews.length;
    const avg = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    product.rating = Math.round(avg * 10) / 10;

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.emit('products:changed', products);

    // Sync to Python backend API
    try {
      const res = await fetch(`${API_BASE}/reviews/product/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: review.userName,
          rating: Number(review.rating),
          comment: review.comment
        })
      });
      if (res.ok) {
        // Refresh product from backend
        this.fetchProductsFromBackend();
      }
    } catch (err) {
      console.warn('[HavenCraft API] Error submitting review to backend:', err);
    }

    return newReview;
  }

  // Admin Metrics
  async fetchAdminMetrics() {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[HavenCraft API] Error fetching admin metrics:', err);
    }
    // Fallback computed locally
    const orders = this.getOrders();
    const products = this.getProducts();
    const totalRev = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      totalRevenue: totalRev,
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? Math.round(totalRev / orders.length) : 0,
      lowStockCount: products.filter(p => p.stock < 10).length,
      totalProducts: products.length
    };
  }
}

export const store = new Store();
