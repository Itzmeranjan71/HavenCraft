# HavenCraft Living — Modern E-Commerce Platform for Bespoke Furniture

A state-of-the-art, luxury architectural furniture e-commerce platform built as an academic software engineering reference project based on the CSE-AI Project Overview manual.

---

## 🌟 Highlights & Key Features

* **Architectural Living Collections:** Categorized into Living Room, Dining Room, Bedroom Sanctuary, Home Office, and Lighting.
* **Interactive Material & Finish Swatches:** Live preview and dynamic price recalculation for custom finishes (Oatmeal Bouclé, Charcoal Velvet, Italian Cognac Leather, Solid Oak, Appalachian Black Walnut).
* **Interactive 3D Spatial Room Visualizer:** Built-in studio to test furniture proportions against real-time ambient lighting presets (*Sunlit Loft*, *Warm Atelier*, *Moody Nordic Dusk*).
* **Slide-Over Atelier Cart & Promo Engine:** Real-time quantity steppers, discount coupon verification (`WELCOME10`, `LUXEFURNI`), and white-glove delivery calculations.
* **Multi-Step Checkout & Tax Invoice Generator:** Seamless flow from shipping destination and white-glove instructions to payment simulation and printable order confirmation receipt with live tracking.
* **Atelier Operations & Administrator Suite:** High-level executive KPI metrics (Gross Revenue, Orders Processed, Average Order Value, Low Stock Alerts), Product Catalog CRUD, and Order Fulfillment Pipeline status updater (`Processing` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`).
* **1-Click Persona Switcher:** Easily toggle between **Customer** mode and **Administrator** mode via the top announcement bar.

---

## 📂 Project Directory Structure

```
project2/
├── backend/                     # Python 3 + FastAPI RESTful Engine
│   ├── database.py              # SQLite relational schema & seed data
│   ├── furniture.db             # SQLite database file
│   ├── main.py                  # FastAPI server entrypoint & static mount
│   ├── models.py                # Pydantic schemas (Products, Orders, Reviews)
│   └── routers/
│       ├── admin.py             # Admin metrics & analytics endpoints
│       ├── auth.py              # User profiles, role switching & coupons
│       ├── categories.py        # Category taxonomy & item counters
│       ├── orders.py            # Order fulfillment & stock deduction
│       ├── products.py          # Products catalog CRUD & stock updater
│       └── reviews.py           # Product reviews & automatic rating recalculation
├── public/
│   └── images/                  # High-res living room, armchair, dining, bed photography
├── src/
│   ├── components/
│   │   ├── adminDashboard.js    # Executive KPI metrics, catalog CRUD & orders pipeline
│   │   ├── cartDrawer.js        # Slide-over cart drawer with promo engine
│   │   ├── catalog.js           # Responsive catalog with search, sort & filters
│   │   ├── checkoutModal.js     # Multi-step checkout & printable invoice receipt
│   │   ├── footer.js            # Luxury atelier footer with newsletter
│   │   ├── hero.js              # Editorial hero banner & trust badges
│   │   ├── navbar.js            # Top bar, role toggle & cart counter
│   │   ├── productModal.js      # Swatch customizer, specs table & reviews
│   │   ├── roomVisualizer.js    # Interactive 2D/3D spatial room studio
│   │   ├── toast.js             # Toast notification feedback system
│   │   └── userDashboard.js     # User orders history & address profile
│   ├── data/
│   │   └── products.js          # Seed furniture items & room categories
│   ├── utils/
│   │   ├── icons.js             # Sharp zero-dependency vector SVG icons
│   │   └── storage.js           # Async API store with reactive pub-sub events
│   ├── main.js                  # Main app controller orchestrator
│   └── style.css                # Vanilla CSS design system with custom properties
├── requirements.txt             # Python backend dependencies
├── vite.config.js               # Vite config with /api reverse proxy
├── index.html                   # HTML5 entrypoint with SEO & typography
├── package.json                 # Project configuration & run scripts
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Frontend
npm install

# Backend (Python 3.10+)
pip install -r requirements.txt
```

### 2. Start Python Backend (FastAPI)
```bash
npm run backend
# or: python3 -m uvicorn backend.main:app --port 8000 --reload
```
The API documentation is accessible at `http://localhost:8000/docs`.

### 3. Start Frontend Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173/`, automatically proxying `/api` requests to the Python FastAPI backend.

### 4. Production Build
```bash
npm run build
```

---

## 🔐 Authentication & Demo Credentials

The platform features complete user authentication with role-based access control, session tokens, and password verification:

| Persona | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Patron / Customer** | `sophia.laurent@example.com` | `sophia123` | Catalog, Swatches, Cart, Orders, Checkout, Reviews, Profile |
| **Operations Director (Admin)** | `alexander.admin@furnicraft.luxury` | `admin123` | Full Merchant Control, Executive KPIs, Catalog CRUD, Order Pipeline |

* **Sign In & Sign Out:** Click the user icon or "Sign In" button in the top navigation bar.
* **1-Click Demo Fill:** In the login modal, use the quick demo fill buttons for immediate testing.
* **Registration:** Patrons can register new accounts dynamically via the "Register" tab in the modal.
* **Sign Out:** Click the **"Sign Out / Log Out"** button in the profile header banner or quick-logout button in the top navigation bar.

---

## 📑 Lab Manual Reference Mapping (Experiments 1–11)

For the complete academic lab report, refer to [FURNITURE_ECOMMERCE_PROJECT_REPORT.md](file:///home/ranjan/Desktop/project/project2/FURNITURE_ECOMMERCE_PROJECT_REPORT.md):
* **Experiment 1:** Problem Analysis and Project Planning
* **Experiment 2:** Software Requirement Specification (SRS)
* **Experiment 3:** Data Modeling & Data Dictionary
* **Experiment 4:** Software Designing (UML Class, Use Case, Activity Diagrams)
* **Experiment 5:** Prototype Model & Screen Implementation
* **Experiment 6:** Software Requirement Analysis
* **Experiment 7:** Testing Phase-Related Documents (Test Plan, Traceability Matrix)
* **Experiment 8:** SCM & Risk Management
* **Experiment 9:** CASE Tool Usage
* **Experiment 10:** Unit & Integration Testing
* **Experiment 11:** Areas for Future Development (WebXR, AI Stylist, Provenance)
