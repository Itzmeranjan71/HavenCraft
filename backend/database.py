import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "furniture.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 1. Categories Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        item_count INTEGER DEFAULT 0
    );
    """)

    # 2. Products Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        sku TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        original_price REAL,
        rating REAL DEFAULT 5.0,
        review_count INTEGER DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 10,
        badge TEXT,
        image TEXT NOT NULL,
        secondary_images TEXT, -- JSON array
        materials TEXT,        -- JSON array
        finishes TEXT,         -- JSON array of {name, color, priceOffset}
        dimensions TEXT,       -- JSON object
        description TEXT,
        features TEXT,         -- JSON array
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category) REFERENCES categories(id)
    );
    """)

    # 3. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL DEFAULT 'password123',
        role TEXT NOT NULL DEFAULT 'customer',
        avatar TEXT,
        phone TEXT,
        street TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT DEFAULT 'United States',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Ensure password column exists if upgrading existing DB
    cursor.execute("PRAGMA table_info(users)")
    cols = [r[1] for r in cursor.fetchall()]
    if "password" not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT 'password123'")


    # 4. Orders Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        order_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Processing',
        subtotal REAL NOT NULL,
        shipping REAL NOT NULL DEFAULT 0,
        discount REAL NOT NULL DEFAULT 0,
        tax REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL,
        tracking_number TEXT NOT NULL,
        street TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        delivery_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 5. Order Items Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        finish TEXT,
        image TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    """)

    # 6. Reviews Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        review_date TEXT NOT NULL,
        verified BOOLEAN DEFAULT 1,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    """)

    # Ensure unwanted wishlist table is deleted if it existed
    cursor.execute("DROP TABLE IF EXISTS wishlist;")

    conn.commit()

    # Seed Initial Categories if empty
    cursor.execute("SELECT COUNT(*) FROM categories")
    if cursor.fetchone()[0] == 0:
        seed_categories = [
            ("living-room", "Living Room", "Sculptural sofas, accent armchairs, coffee tables, and bespoke media consoles.", "sofa", 2),
            ("dining-room", "Dining Room", "Solid hardwood dining tables, ergonomic upholstered chairs, and artisan buffets.", "utensils", 1),
            ("bedroom", "Bedroom Sanctuary", "Low-profile platform beds, solid nightstands, dressers, and organic linen.", "bed", 1),
            ("home-office", "Home Office", "Executive solid oak work desks, ergonomic task seating, and minimalist shelving.", "briefcase", 1),
            ("accent-decor", "Accent & Lighting", "Sculptural ceramic lamps, alabaster pendants, and architectural mirrors.", "lamp", 1)
        ]
        cursor.executemany("INSERT INTO categories (id, name, description, icon, item_count) VALUES (?, ?, ?, ?, ?)", seed_categories)
        conn.commit()

    # Seed Initial Products if empty
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        seed_products = [
            (
                "prod-101",
                "SOFA-BOU-01",
                "Aura Curved Bouclé Sectional Sofa",
                "living-room",
                2490.0,
                2890.0,
                4.9,
                38,
                14,
                "Best Seller",
                "/images/hero.jpg",
                json.dumps(["/images/hero.jpg", "/images/armchair.jpg"]),
                json.dumps(["Solid FSC-Certified White Oak Frame", "High-Resilience Density Foam", "Textured Oatmeal Bouclé"]),
                json.dumps([
                    {"name": "Oatmeal Bouclé", "color": "#eae4d9", "priceOffset": 0},
                    {"name": "Warm Charcoal Velvet", "color": "#383838", "priceOffset": 120},
                    {"name": "Cognac Saddle Leather", "color": "#8d4c24", "priceOffset": 450}
                ]),
                json.dumps({
                    "width": "108 in (274 cm)",
                    "depth": "42 in (106 cm)",
                    "height": "31 in (78 cm)",
                    "seatHeight": "17 in (43 cm)",
                    "weight": "185 lbs (84 kg)"
                }),
                "A sculptural masterpiece designed to anchor contemporary living spaces. The Aura Curved Sofa balances voluptuous curves with architectural precision, upholstered in tactile bouclé that feels as luxurious as it looks.",
                json.dumps([
                    "Handcrafted solid hardwood internal frame with corner-blocked joinery",
                    "High-resilience foam core topped with a cloud-soft feather-fiber blend",
                    "Stain-resistant performance bouclé fabric for effortless maintenance",
                    "Includes 3 matching lumbar pillows"
                ])
            ),
            (
                "prod-102",
                "CHAIR-SCANDI-02",
                "Koben Nordic Solid Oak Lounge Chair",
                "living-room",
                890.0,
                1050.0,
                4.8,
                42,
                22,
                "Artisan Pick",
                "/images/armchair.jpg",
                json.dumps(["/images/armchair.jpg", "/images/hero.jpg"]),
                json.dumps(["Danish Steam-Bent White Oak", "Textured Bouclé Fabric", "Brass Hardware Accents"]),
                json.dumps([
                    {"name": "Natural White Oak / Cloud", "color": "#d9cdb8", "priceOffset": 0},
                    {"name": "Smoked Walnut / Espresso", "color": "#4a3b32", "priceOffset": 80},
                    {"name": "Ebonized Ash / Midnight", "color": "#1f2022", "priceOffset": 110}
                ]),
                json.dumps({
                    "width": "32 in (81 cm)",
                    "depth": "34 in (86 cm)",
                    "height": "35 in (89 cm)",
                    "seatHeight": "16 in (40 cm)",
                    "weight": "44 lbs (20 kg)"
                }),
                "Drawing inspiration from mid-century Scandinavian woodworking, the Koben Chair features fluid curved armrests sculpted from solid oak and deep, inviting cushions.",
                json.dumps([
                    "Continuous steam-bent solid wood armrest profile",
                    "Ergonomically reclined back angle for deep restorative reading",
                    "Removable dry-cleanable cushion covers",
                    "Solid brass connection details"
                ])
            ),
            (
                "prod-103",
                "TABLE-WALNUT-03",
                "Kyoto Handcrafted American Walnut Dining Table",
                "dining-room",
                1850.0,
                2150.0,
                5.0,
                29,
                9,
                "Craftsman Made",
                "/images/dining.jpg",
                json.dumps(["/images/dining.jpg", "/images/armchair.jpg"]),
                json.dumps(["Solid American Black Walnut", "Natural Organic Hardwax Oil Finish", "Mortise & Tenon Joinery"]),
                json.dumps([
                    {"name": "American Black Walnut", "color": "#593e2b", "priceOffset": 0},
                    {"name": "Bleached European Oak", "color": "#d4c2a5", "priceOffset": -50},
                    {"name": "Smoked Espresso Oak", "color": "#2b231d", "priceOffset": 95}
                ]),
                json.dumps({
                    "width": "86 in (218 cm)",
                    "depth": "38 in (96 cm)",
                    "height": "30 in (76 cm)",
                    "seatHeight": "N/A (Seats 8)",
                    "weight": "162 lbs (73 kg)"
                }),
                "An heirloom dining centerpiece crafted from sustainably harvested Appalachian walnut. Features subtle chamfered edges, organic wood grain patterns, and durable natural wax finish that ages gracefully.",
                json.dumps([
                    "Comfortably seats 8 guests with spacious legroom",
                    "Finished with natural German hardwax oil, 0% VOC and food-safe",
                    "Solid wood expansion joinery accommodates natural humidity shifts",
                    "Hand-inspected and numbered by the lead carpenter"
                ])
            ),
            (
                "prod-104",
                "BED-OAK-04",
                "Seren Japanese Minimalist Platform Bed",
                "bedroom",
                1690.0,
                1950.0,
                4.9,
                33,
                12,
                "Popular",
                "/images/bed.jpg",
                json.dumps(["/images/bed.jpg", "/images/hero.jpg"]),
                json.dumps(["Solid Japanese White Oak", "Floating Nightstand Shelves", "Integrated Ambient LED Channel"]),
                json.dumps([
                    {"name": "Natural Japanese White Oak", "color": "#e3d2be", "priceOffset": 0},
                    {"name": "Warm Teak", "color": "#a06e3b", "priceOffset": 120},
                    {"name": "Dark Muted Walnut", "color": "#44342a", "priceOffset": 150}
                ]),
                json.dumps({
                    "width": "84 in (213 cm) [King]",
                    "depth": "88 in (223 cm)",
                    "height": "38 in (96 cm headboard)",
                    "seatHeight": "11 in (28 cm platform)",
                    "weight": "210 lbs (95 kg)"
                }),
                "Inspired by Japanese Zen architecture, the Seren Platform Bed floats gently above the floor with an extended low-profile headboard and integrated floating cantilever nightstands with subtle backlighting.",
                json.dumps([
                    "Zero-squeak heavy-duty solid wood slat suspension system",
                    "No box-spring required; optimized for latex and hybrid mattresses",
                    "Pre-routed cable conduits for clean phone charging behind nightstands",
                    "Warm indirect LED headboard ambient glow channel included"
                ])
            ),
            (
                "prod-105",
                "DESK-OAK-05",
                "Forma Solid Oak & Steel Executive Desk",
                "home-office",
                1250.0,
                1450.0,
                4.9,
                26,
                18,
                "Designer Edition",
                "/images/desk.jpg",
                json.dumps(["/images/desk.jpg", "/images/armchair.jpg"]),
                json.dumps(["Live-Edge French White Oak", "Matte Textured Architectural Steel", "Magnetic Cable Trough"]),
                json.dumps([
                    {"name": "French White Oak / Matte Black", "color": "#c7b39b", "priceOffset": 0},
                    {"name": "Roasted Walnut / Gunmetal", "color": "#564235", "priceOffset": 140},
                    {"name": "Driftwood / Brushed Champagne", "color": "#9d9489", "priceOffset": 180}
                ]),
                json.dumps({
                    "width": "64 in (162 cm)",
                    "depth": "30 in (76 cm)",
                    "height": "30 in (76 cm)",
                    "seatHeight": "N/A",
                    "weight": "118 lbs (53 kg)"
                }),
                "Engineered for discerning professionals. The Forma Desk pairs a thick, substantial 1.75\" solid French oak tabletop with architectural steel loop legs and integrated concealed magnetic wire management.",
                json.dumps([
                    "Substantial 45mm solid hardwood live-edge slab construction",
                    "Concealed under-desk magnetic channel for power brick and monitor cables",
                    "Precision bevel perimeter allows comfortable wrist rest during typing",
                    "Micro-adjustable leveling feet for unshakeable stability"
                ])
            ),
            (
                "prod-106",
                "TABLE-COFFEE-06",
                "Calacatta Marble & Brass Floating Coffee Table",
                "accent-decor",
                940.0,
                1100.0,
                4.7,
                19,
                8,
                "Limited Run",
                "/images/hero.jpg",
                json.dumps(["/images/hero.jpg"]),
                json.dumps(["Honed Italian Calacatta Marble", "Brushed Solid Brass Base", "Sealed Protective Nano-Coat"]),
                json.dumps([
                    {"name": "Calacatta Gold / Brushed Brass", "color": "#f2eee9", "priceOffset": 0},
                    {"name": "Nero Marquina / Matte Black", "color": "#262626", "priceOffset": 60}
                ]),
                json.dumps({
                    "width": "44 in (112 cm)",
                    "depth": "44 in (112 cm)",
                    "height": "14 in (35 cm)",
                    "seatHeight": "N/A",
                    "weight": "135 lbs (61 kg)"
                }),
                "A striking geometric discourse between heavy stone and weightless metal. Each marble slab is unique, hand-honed to a silky matte finish and sealed with stain-resistant nanotech coating.",
                json.dumps([
                    "Continuous book-matched natural stone veining",
                    "Heavy-gauge solid brass pedestal with counterweighted core",
                    "Pre-sealed against coffee, wine, and acidic spills",
                    "Curved bevel safety edge"
                ])
            )
        ]
        cursor.executemany("""
        INSERT INTO products (
            id, sku, title, category, price, original_price, rating, review_count, stock, badge,
            image, secondary_images, materials, finishes, dimensions, description, features
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_products)
        conn.commit()

    # Seed Default Users
    cursor.execute("""
    INSERT OR REPLACE INTO users (id, name, email, password, role, avatar, phone, street, city, state, zip_code)
    VALUES (
        'usr-1001',
        'Sophia Laurent',
        'sophia.laurent@example.com',
        'sophia123',
        'customer',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        '+1 (415) 890-2341',
        '742 Evergreen Terrace',
        'San Francisco',
        'CA',
        '94107'
    )
    """)

    cursor.execute("""
    INSERT OR REPLACE INTO users (id, name, email, password, role, avatar, phone, street, city, state, zip_code)
    VALUES (
        'usr-1002',
        'Alexander Vance (Operations Director)',
        'alexander.admin@furnicraft.luxury',
        'admin123',
        'admin',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        '+1 (415) 890-9900',
        '100 Atelier Plaza, Suite 400',
        'San Francisco',
        'CA',
        '94107'
    )
    """)
    conn.commit()

    # Seed Default Orders if empty
    cursor.execute("SELECT COUNT(*) FROM orders")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO orders (
            id, customer_name, customer_email, order_date, status, subtotal, shipping, discount, tax, total,
            tracking_number, street, city, state, zip_code, delivery_notes
        ) VALUES (
            'ORD-9821', 'Sophia Laurent', 'sophia.laurent@example.com', '2026-10-28', 'Shipped',
            890.0, 0.0, 0.0, 71.20, 961.20, 'FX-89472-US',
            '742 Evergreen Terrace', 'San Francisco', 'CA', '94107',
            'Deliver to 2nd floor, service elevator accessible'
        )
        """)
        cursor.execute("""
        INSERT INTO order_items (order_id, product_id, title, price, quantity, finish, image)
        VALUES ('ORD-9821', 'prod-102', 'Koben Nordic Solid Oak Lounge Chair', 890.0, 1, 'Natural White Oak / Cloud', '/images/armchair.jpg')
        """)

        cursor.execute("""
        INSERT INTO orders (
            id, customer_name, customer_email, order_date, status, subtotal, shipping, discount, tax, total,
            tracking_number, street, city, state, zip_code, delivery_notes
        ) VALUES (
            'ORD-9740', 'Marcus Sterling', 'marcus.s@luxuryholdings.com', '2026-10-24', 'Delivered',
            2490.0, 0.0, 150.0, 187.20, 2527.20, 'FX-76319-US',
            '1000 Brickell Ave, Penthouse 4', 'Miami', 'FL', '33131',
            'Call concierge upon arrival'
        )
        """)
        cursor.execute("""
        INSERT INTO order_items (order_id, product_id, title, price, quantity, finish, image)
        VALUES ('ORD-9740', 'prod-101', 'Aura Curved Bouclé Sectional Sofa', 2490.0, 1, 'Oatmeal Bouclé', '/images/hero.jpg')
        """)
        conn.commit()

    # Seed Default Reviews if empty
    cursor.execute("SELECT COUNT(*) FROM reviews")
    if cursor.fetchone()[0] == 0:
        reviews_data = [
            ("rev-1", "prod-101", "Eleanor Vance", 5, "The curves are absolutely breathtaking in our light-filled loft. Incredibly comfortable for lounging or hosting.", "2026-10-18", 1),
            ("rev-2", "prod-101", "Marcus Sterling", 5, "Arrived with flawless white-glove setup. Fabric texture is top tier. Worth every dollar.", "2026-10-04", 1),
            ("rev-3", "prod-102", "Sophia Laurent", 5, "The wood grain is stunning and the handfeel is buttery smooth. My favorite reading chair.", "2026-10-22", 1),
            ("rev-4", "prod-103", "Dr. Aaron Chen", 5, "Truly an heirloom piece. Guests constantly compliment the satin touch of the walnut wood.", "2026-09-30", 1),
            ("rev-5", "prod-104", "Claire Dupont", 5, "Transformed our bedroom into a 5-star Kyoto retreat. The integrated nightstands are genius.", "2026-10-12", 1),
            ("rev-6", "prod-105", "David Kessler", 5, "Rock solid. The cable management underneath makes my dual-monitor setup completely wire-free.", "2026-10-15", 1)
        ]
        cursor.executemany("INSERT INTO reviews (id, product_id, user_name, rating, comment, review_date, verified) VALUES (?, ?, ?, ?, ?, ?, ?)", reviews_data)
        conn.commit()

    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
