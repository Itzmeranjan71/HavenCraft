export const initialCategories = [
  {
    id: 'living-room',
    name: 'Living Room',
    description: 'Sculptural sofas, accent armchairs, coffee tables, and bespoke media consoles.',
    icon: 'sofa',
    itemCount: 8
  },
  {
    id: 'dining-room',
    name: 'Dining Room',
    description: 'Solid hardwood dining tables, ergonomic upholstered chairs, and artisan buffets.',
    icon: 'utensils',
    itemCount: 6
  },
  {
    id: 'bedroom',
    name: 'Bedroom Sanctuary',
    description: 'Low-profile platform beds, solid nightstands, dressers, and organic linen.',
    icon: 'bed',
    itemCount: 6
  },
  {
    id: 'home-office',
    name: 'Home Office',
    description: 'Executive solid oak work desks, ergonomic task seating, and minimalist shelving.',
    icon: 'briefcase',
    itemCount: 5
  },
  {
    id: 'accent-decor',
    name: 'Accent & Lighting',
    description: 'Sculptural ceramic lamps, alabaster pendants, and architectural mirrors.',
    icon: 'lamp',
    itemCount: 4
  }
];

export const initialProducts = [
  {
    id: 'prod-101',
    sku: 'SOFA-BOU-01',
    title: 'Aura Curved Bouclé Sectional Sofa',
    category: 'living-room',
    price: 2490,
    originalPrice: 2890,
    rating: 4.9,
    reviewCount: 38,
    stock: 14,
    badge: 'Best Seller',
    image: '/images/hero.jpg',
    secondaryImages: [
      '/images/hero.jpg',
      '/images/armchair.jpg'
    ],
    materials: ['Solid FSC-Certified White Oak Frame', 'High-Resilience Density Foam', 'Textured Oatmeal Bouclé'],
    finishes: [
      { name: 'Oatmeal Bouclé', color: '#eae4d9', priceOffset: 0 },
      { name: 'Warm Charcoal Velvet', color: '#383838', priceOffset: 120 },
      { name: 'Cognac Saddle Leather', color: '#8d4c24', priceOffset: 450 }
    ],
    dimensions: {
      width: '108 in (274 cm)',
      depth: '42 in (106 cm)',
      height: '31 in (78 cm)',
      seatHeight: '17 in (43 cm)',
      weight: '185 lbs (84 kg)'
    },
    description: 'A sculptural masterpiece designed to anchor contemporary living spaces. The Aura Curved Sofa balances voluptuous curves with architectural precision, upholstered in tactile bouclé that feels as luxurious as it looks.',
    features: [
      'Handcrafted solid hardwood internal frame with corner-blocked joinery',
      'High-resilience foam core topped with a cloud-soft feather-fiber blend',
      'Stain-resistant performance bouclé fabric for effortless maintenance',
      'Includes 3 matching lumbar pillows'
    ],
    reviews: [
      {
        id: 'rev-1',
        userName: 'Eleanor Vance',
        rating: 5,
        date: '2026-10-18',
        comment: 'The curves are absolutely breathtaking in our light-filled loft. Incredibly comfortable for lounging or hosting.',
        verified: true
      },
      {
        id: 'rev-2',
        userName: 'Marcus Sterling',
        rating: 5,
        date: '2026-10-04',
        comment: 'Arrived with flawless white-glove setup. Fabric texture is top tier. Worth every dollar.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-102',
    sku: 'CHAIR-SCANDI-02',
    title: 'Koben Nordic Solid Oak Lounge Chair',
    category: 'living-room',
    price: 890,
    originalPrice: 1050,
    rating: 4.8,
    reviewCount: 42,
    stock: 22,
    badge: 'Artisan Pick',
    image: '/images/armchair.jpg',
    secondaryImages: [
      '/images/armchair.jpg',
      '/images/hero.jpg'
    ],
    materials: ['Danish Steam-Bent White Oak', 'Textured Bouclé Fabric', 'Brass Hardware Accents'],
    finishes: [
      { name: 'Natural White Oak / Cloud', color: '#d9cdb8', priceOffset: 0 },
      { name: 'Smoked Walnut / Espresso', color: '#4a3b32', priceOffset: 80 },
      { name: 'Ebonized Ash / Midnight', color: '#1f2022', priceOffset: 110 }
    ],
    dimensions: {
      width: '32 in (81 cm)',
      depth: '34 in (86 cm)',
      height: '35 in (89 cm)',
      seatHeight: '16 in (40 cm)',
      weight: '44 lbs (20 kg)'
    },
    description: 'Drawing inspiration from mid-century Scandinavian woodworking, the Koben Chair features fluid curved armrests sculpted from solid oak and deep, inviting cushions.',
    features: [
      'Continuous steam-bent solid wood armrest profile',
      'Ergonomically reclined back angle for deep restorative reading',
      'Removable dry-cleanable cushion covers',
      'Solid brass connection details'
    ],
    reviews: [
      {
        id: 'rev-3',
        userName: 'Sophia Laurent',
        rating: 5,
        date: '2026-10-22',
        comment: 'The wood grain is stunning and the handfeel is buttery smooth. My favorite reading chair.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-103',
    sku: 'TABLE-WALNUT-03',
    title: 'Kyoto Handcrafted American Walnut Dining Table',
    category: 'dining-room',
    price: 1850,
    originalPrice: 2150,
    rating: 5.0,
    reviewCount: 29,
    stock: 9,
    badge: 'Craftsman Made',
    image: '/images/dining.jpg',
    secondaryImages: [
      '/images/dining.jpg',
      '/images/armchair.jpg'
    ],
    materials: ['Solid American Black Walnut', 'Natural Organic Hardwax Oil Finish', 'Mortise & Tenon Joinery'],
    finishes: [
      { name: 'American Black Walnut', color: '#593e2b', priceOffset: 0 },
      { name: 'Bleached European Oak', color: '#d4c2a5', priceOffset: -50 },
      { name: 'Smoked Espresso Oak', color: '#2b231d', priceOffset: 95 }
    ],
    dimensions: {
      width: '86 in (218 cm)',
      depth: '38 in (96 cm)',
      height: '30 in (76 cm)',
      seatHeight: 'N/A (Seats 8)',
      weight: '162 lbs (73 kg)'
    },
    description: 'An heirloom dining centerpiece crafted from sustainably harvested Appalachian walnut. Features subtle chamfered edges, organic wood grain patterns, and durable natural wax finish that ages gracefully.',
    features: [
      'Comfortably seats 8 guests with spacious legroom',
      'Finished with natural German hardwax oil, 0% VOC and food-safe',
      'Solid wood expansion joinery accommodates natural humidity shifts',
      'Hand-inspected and numbered by the lead carpenter'
    ],
    reviews: [
      {
        id: 'rev-4',
        userName: 'Dr. Aaron Chen',
        rating: 5,
        date: '2026-09-30',
        comment: 'Truly an heirloom piece. Guests constantly compliment the satin touch of the walnut wood.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-104',
    sku: 'BED-OAK-04',
    title: 'Seren Japanese Minimalist Platform Bed',
    category: 'bedroom',
    price: 1690,
    originalPrice: 1950,
    rating: 4.9,
    reviewCount: 33,
    stock: 12,
    badge: 'Popular',
    image: '/images/bed.jpg',
    secondaryImages: [
      '/images/bed.jpg',
      '/images/hero.jpg'
    ],
    materials: ['Solid Japanese White Oak', 'Floating Nightstand Shelves', 'Integrated Ambient LED Channel'],
    finishes: [
      { name: 'Natural Japanese White Oak', color: '#e3d2be', priceOffset: 0 },
      { name: 'Warm Teak', color: '#a06e3b', priceOffset: 120 },
      { name: 'Dark Muted Walnut', color: '#44342a', priceOffset: 150 }
    ],
    dimensions: {
      width: '84 in (213 cm) [King]',
      depth: '88 in (223 cm)',
      height: '38 in (96 cm headboard)',
      seatHeight: '11 in (28 cm platform)',
      weight: '210 lbs (95 kg)'
    },
    description: 'Inspired by Japanese Zen architecture, the Seren Platform Bed floats gently above the floor with an extended low-profile headboard and integrated floating cantilever nightstands with subtle backlighting.',
    features: [
      'Zero-squeak heavy-duty solid wood slat suspension system',
      'No box-spring required; optimized for latex and hybrid mattresses',
      'Pre-routed cable conduits for clean phone charging behind nightstands',
      'Warm indirect LED headboard ambient glow channel included'
    ],
    reviews: [
      {
        id: 'rev-5',
        userName: 'Claire Dupont',
        rating: 5,
        date: '2026-10-12',
        comment: 'Transformed our bedroom into a 5-star Kyoto retreat. The integrated nightstands are genius.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-105',
    sku: 'DESK-OAK-05',
    title: 'Forma Solid Oak & Steel Executive Desk',
    category: 'home-office',
    price: 1250,
    originalPrice: 1450,
    rating: 4.9,
    reviewCount: 26,
    stock: 18,
    badge: 'Designer Edition',
    image: '/images/desk.jpg',
    secondaryImages: [
      '/images/desk.jpg',
      '/images/armchair.jpg'
    ],
    materials: ['Live-Edge French White Oak', 'Matte Textured Architectural Steel', 'Magnetic Cable Trough'],
    finishes: [
      { name: 'French White Oak / Matte Black', color: '#c7b39b', priceOffset: 0 },
      { name: 'Roasted Walnut / Gunmetal', color: '#564235', priceOffset: 140 },
      { name: 'Driftwood / Brushed Champagne', color: '#9d9489', priceOffset: 180 }
    ],
    dimensions: {
      width: '64 in (162 cm)',
      depth: '30 in (76 cm)',
      height: '30 in (76 cm)',
      seatHeight: 'N/A',
      weight: '118 lbs (53 kg)'
    },
    description: 'Engineered for discerning professionals. The Forma Desk pairs a thick, substantial 1.75" solid French oak tabletop with architectural steel loop legs and integrated concealed magnetic wire management.',
    features: [
      'Substantial 45mm solid hardwood live-edge slab construction',
      'Concealed under-desk magnetic channel for power brick and monitor cables',
      'Precision bevel perimeter allows comfortable wrist rest during typing',
      'Micro-adjustable leveling feet for unshakeable stability'
    ],
    reviews: [
      {
        id: 'rev-6',
        userName: 'David Kessler',
        rating: 5,
        date: '2026-10-15',
        comment: 'Rock solid. The cable management underneath makes my dual-monitor setup completely wire-free.',
        verified: true
      }
    ]
  },
  {
    id: 'prod-106',
    sku: 'TABLE-COFFEE-06',
    title: 'Calacatta Marble & Brass Floating Coffee Table',
    category: 'living-room',
    price: 940,
    originalPrice: 1100,
    rating: 4.7,
    reviewCount: 19,
    stock: 8,
    badge: 'Limited Run',
    image: '/images/hero.jpg',
    secondaryImages: [
      '/images/hero.jpg'
    ],
    materials: ['Honed Italian Calacatta Marble', 'Brushed Solid Brass Base', 'Sealed Protective Nano-Coat'],
    finishes: [
      { name: 'Calacatta Gold / Brushed Brass', color: '#f2eee9', priceOffset: 0 },
      { name: 'Nero Marquina / Matte Black', color: '#262626', priceOffset: 60 }
    ],
    dimensions: {
      width: '44 in (112 cm)',
      depth: '44 in (112 cm)',
      height: '14 in (35 cm)',
      seatHeight: 'N/A',
      weight: '135 lbs (61 kg)'
    },
    description: 'A striking geometric discourse between heavy stone and weightless metal. Each marble slab is unique, hand-honed to a silky matte finish and sealed with stain-resistant nanotech coating.',
    features: [
      'Continuous book-matched natural stone veining',
      'Heavy-gauge solid brass pedestal with counterweighted core',
      'Pre-sealed against coffee, wine, and acidic spills',
      'Curved bevel safety edge'
    ],
    reviews: [
      {
        id: 'rev-7',
        userName: 'Jessica Miller',
        rating: 5,
        date: '2026-10-25',
        comment: 'Even more striking in person. The marble has gorgeous warm veining that compliments our rug.',
        verified: true
      }
    ]
  }
];
