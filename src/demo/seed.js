// Datos iniciales de la demo. Todo vive en localStorage (ver store.js):
// cualquier visitante puede ordenar, entrar a su cuenta y operar el panel admin sin backend.

export const DEMO_CUSTOMER = { email: 'sofia@tulum.demo', password: 'tulum2026' };
export const DEMO_ADMIN = { email: 'admin@tulum.demo', password: 'admin2026' };

export const CATEGORIES = [
  { id: 'mains', name: 'Mains' },
  { id: 'starters', name: 'Starters & sides' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'drinks', name: 'Drinks' },
];

export const MENU = [
  { id: 'fajitas', category: 'mains', name: 'Fajitas', price: 24, image: '/products/tulum/24.webp', popular: true,
    description: 'Sizzling grilled steak with peppers and onions, served with warm flour tortillas and salsa verde.' },
  { id: 'burrito', category: 'mains', name: 'Burrito', price: 19, image: '/products/tulum/25.webp',
    description: 'Slow-cooked pork, black beans, rice, avocado and crema wrapped in a giant flour tortilla.' },
  { id: 'pizza-birria', category: 'mains', name: 'Pizza Birria', price: 22, image: '/products/tulum/26.webp', popular: true,
    description: 'Crispy tortilla crust, braised beef birria and melted Oaxaca cheese, with consommé for dipping.' },
  { id: 'huevos-rancheros', category: 'mains', name: 'Huevos rancheros', price: 16, image: '/products/tulum/27.webp',
    description: 'Fried eggs over corn tortillas with ranchera sauce, refried beans and queso fresco.' },
  { id: 'enchiladas', category: 'mains', name: 'Enchiladas con huevo', price: 18, image: '/products/tulum/28.webp',
    description: 'Chicken enchiladas bathed in our signature green salsa, topped with a sunny egg and crema.' },
  { id: 'tacos-pastor', category: 'mains', name: 'Tacos al pastor', price: 17,
    description: 'Three marinated pork tacos with pineapple, onion and cilantro on handmade corn tortillas.' },
  { id: 'quesadilla', category: 'mains', name: 'Quesadilla de flor de calabaza', price: 14,
    description: 'Squash blossom, epazote and Oaxaca cheese in a blue corn tortilla.' },
  { id: 'guacamole', category: 'starters', name: 'Guacamole & totopos', price: 12, image: '/products/tulum/guacamole.webp', popular: true,
    description: 'Avocado mashed to order with lime, serrano and cilantro. Warm corn chips on the side.' },
  { id: 'ceviche', category: 'starters', name: 'Ceviche de pescado', price: 16,
    description: 'Fresh fish cured in lime with cucumber, red onion, jalapeño and avocado.' },
  { id: 'elote', category: 'starters', name: 'Elote asado', price: 8,
    description: 'Grilled corn with chipotle mayo, cotija and tajín.' },
  { id: 'churros', category: 'desserts', name: 'Churros con chocolate', price: 10, image: '/products/tulum/29.webp',
    description: 'Crispy churros tossed in cinnamon sugar with a rich chocolate dipping sauce.' },
  { id: 'flan', category: 'desserts', name: 'Flan de cajeta', price: 9,
    description: 'Silky vanilla flan with goat milk caramel.' },
  { id: 'margarita', category: 'drinks', name: 'Margarita tradicional', price: 13, popular: true,
    description: 'Blanco tequila, fresh lime and agave with a salted rim.' },
  { id: 'paloma', category: 'drinks', name: 'Paloma', price: 12,
    description: 'Tequila, grapefruit soda and lime.' },
  { id: 'michelada', category: 'drinks', name: 'Michelada', price: 10,
    description: 'Mexican lager, lime, spices and a chile rim.' },
  { id: 'horchata', category: 'drinks', name: 'Horchata', price: 6,
    description: 'Rice and cinnamon agua fresca. Alcohol-free.' },
  { id: 'jamaica', category: 'drinks', name: 'Agua de jamaica', price: 5,
    description: 'Hibiscus agua fresca, lightly sweetened. Alcohol-free.' },
].map((item) => ({ available: true, ...item }));

export const DEFAULT_LOYALTY = {
  pointsPerDollar: 1,
  welcomeBonus: 50,
  tiers: [
    { name: 'Amigo', min: 0 },
    { name: 'Compadre', min: 300 },
    { name: 'Jefe', min: 800 },
  ],
  rewards: [
    { id: 'rw-agua', name: 'Free agua fresca', cost: 60, type: 'discount', value: 6, active: true },
    { id: 'rw-churros', name: 'Free churros', cost: 120, type: 'discount', value: 10, active: true },
    { id: 'rw-15', name: '$15 off your order', cost: 200, type: 'discount', value: 15, active: true },
    { id: 'rw-main', name: 'Any main on the house', cost: 320, type: 'discount', value: 24, active: true },
  ],
};

export const DEFAULT_SETTINGS = {
  acceptingOrders: true,
  prepMinutes: 20,
  autoAdvance: true, // la "cocina simulada" avanza los pedidos sola para que el visitante vea el seguimiento
  taxes: [
    { name: 'GST', rate: 0.05 },
    { name: 'QST', rate: 0.09975 },
  ],
  staff: [
    { id: 'st-1', name: 'Andrea Solís', email: 'admin@tulum.demo', role: 'Owner' },
    { id: 'st-2', name: 'Marco Leblanc', email: 'marco@tulum.demo', role: 'Kitchen' },
    { id: 'st-3', name: 'Julie Tremblay', email: 'julie@tulum.demo', role: 'Front of house' },
  ],
};

const FIRST = ['Camille', 'Olivier', 'Léa', 'Gabriel', 'Chloé', 'Mathis', 'Emma', 'Noah', 'Florence', 'Samuel', 'Rosalie', 'Thomas', 'Alicia', 'Diego', 'Valentina'];
const LAST = ['Gagnon', 'Roy', 'Côté', 'Bouchard', 'Gauthier', 'Morin', 'Lavoie', 'Fortin', 'Ortega', 'Pelletier', 'Bélanger', 'Navarro'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function randomPerson() {
  const first = pick(FIRST);
  const last = pick(LAST);
  return {
    name: `${first} ${last}`,
    email: `${slug(first)}.${slug(last)}${rand(10, 99)}@example.com`,
    phone: `(514) ${rand(200, 989)}-${String(rand(0, 9999)).padStart(4, '0')}`,
  };
}

export function randomItems(menu) {
  const available = menu.filter((m) => m.available);
  const mains = available.filter((m) => m.category === 'mains');
  const extras = available.filter((m) => m.category !== 'mains');
  const lines = [];
  const add = (item, qty) => {
    const existing = lines.find((l) => l.id === item.id);
    if (existing) existing.qty += qty;
    else lines.push({ id: item.id, name: item.name, price: item.price, qty });
  };
  const nMains = rand(1, 3);
  for (let i = 0; i < nMains && mains.length; i++) add(pick(mains), rand(1, 2));
  const nExtras = rand(0, 2);
  for (let i = 0; i < nExtras && extras.length; i++) add(pick(extras), 1);
  return lines;
}

export function buildSeed(computeTotals) {
  const now = Date.now();
  const menu = MENU.map((m) => ({ ...m }));
  const loyalty = JSON.parse(JSON.stringify(DEFAULT_LOYALTY));
  const settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

  const customers = [
    {
      id: 'cu-demo', name: 'Sofía Ramírez', email: DEMO_CUSTOMER.email, password: DEMO_CUSTOMER.password,
      phone: '(514) 555-0142', createdAt: now - 1000 * 60 * 60 * 24 * 40, points: 0, lifetime: 0, visits: 0, spent: 0,
    },
  ];
  for (let i = 0; i < 13; i++) {
    const p = randomPerson();
    if (customers.some((c) => c.email === p.email)) continue;
    customers.push({
      id: `cu-${i + 1}`, ...p, password: 'demo', createdAt: now - 1000 * 60 * 60 * 24 * rand(3, 90),
      points: 0, lifetime: 0, visits: 0, spent: 0,
    });
  }

  const ledger = [];
  customers.forEach((c) => {
    c.points += loyalty.welcomeBonus;
    c.lifetime += loyalty.welcomeBonus;
    ledger.push({ id: `lg-w-${c.id}`, customerId: c.id, delta: loyalty.welcomeBonus, reason: 'Welcome bonus', at: c.createdAt });
  });

  const orders = [];
  let number = 1001;
  const makeOrder = (createdAt, status, forced = null) => {
    const guest = !forced && Math.random() < 0.3;
    const customer = forced || (guest ? null : pick(customers.slice(1)));
    const person = customer || randomPerson();
    // La cuenta demo pide algo sencillo (1 plato + 1 bebida) para quedar con un saldo realista
    const items = forced ? [pick(menu.filter((m) => m.category === 'mains')), pick(menu.filter((m) => m.category === 'drinks'))]
      .map((m) => ({ id: m.id, name: m.name, price: m.price, qty: 1 })) : randomItems(menu);
    const totals = computeTotals(items, 0, settings.taxes);
    const order = {
      id: `TL-${number++}`,
      createdAt,
      updatedAt: createdAt,
      status,
      customerId: customer ? customer.id : null,
      name: person.name,
      email: person.email,
      phone: person.phone,
      type: Math.random() < 0.7 ? 'pickup' : 'dine-in',
      table: null,
      pickupTime: 'asap',
      notes: '',
      items,
      ...totals,
      points: Math.floor(totals.subtotal * loyalty.pointsPerDollar),
      pointsCredited: false,
      reward: null,
      auto: false,
    };
    if (order.type === 'dine-in') order.table = rand(1, 18);
    if (status === 'completed' && customer) {
      customer.points += order.points;
      customer.lifetime += order.points;
      customer.visits += 1;
      customer.spent += order.total;
      order.pointsCredited = true;
      ledger.push({ id: `lg-${order.id}`, customerId: customer.id, delta: order.points, reason: `Order ${order.id}`, at: createdAt });
    }
    orders.push(order);
  };

  // Visitas anteriores de la cuenta demo (Sofía) para que tenga puntos que canjear
  const demo = customers[0];
  for (let k = 5; k >= 0; k--) {
    const day = new Date(now - (10 + k * 4) * 86400000);
    day.setHours(rand(12, 20), rand(0, 59), 0, 0);
    makeOrder(day.getTime(), 'completed', demo);
  }

  // 7 días de historial, entre 11:00 y 21:30
  for (let d = 7; d >= 1; d--) {
    const day = new Date(now - d * 86400000);
    const count = rand(6, 11);
    for (let i = 0; i < count; i++) {
      day.setHours(rand(11, 21), rand(0, 59), 0, 0);
      const forDemo = i === 0 && (d === 5 || d === 2) ? customers[0] : null;
      makeOrder(day.getTime(), forDemo || Math.random() >= 0.06 ? 'completed' : 'cancelled', forDemo);
    }
  }
  // Hoy: algunos terminados y otros en curso para que el tablero tenga movimiento
  const min = 60000;
  [-190, -150, -120, -95].forEach((m) => makeOrder(now + m * min, 'completed'));
  makeOrder(now - 38 * min, 'ready');
  makeOrder(now - 24 * min, 'preparing');
  makeOrder(now - 15 * min, 'preparing');
  makeOrder(now - 6 * min, 'new');
  makeOrder(now - 2 * min, 'new');

  // Canje de ejemplo para la cuenta demo
  if (demo.points >= 120) {
    demo.points -= 120;
    ledger.push({ id: 'lg-demo-redeem', customerId: demo.id, delta: -120, reason: 'Redeemed: Free churros', at: now - 86400000 * 3 });
  }

  orders.sort((a, b) => b.createdAt - a.createdAt);
  ledger.sort((a, b) => b.at - a.at);

  const reservations = [];
  const times = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];
  for (let i = 0; i < 9; i++) {
    const p = i === 0 ? demo : pick(customers);
    const date = new Date(now + (i < 3 ? 0 : rand(1, 6)) * 86400000);
    reservations.push({
      id: `RS-${2201 + i}`,
      name: p.name,
      email: p.email,
      phone: p.phone,
      customerId: p.id,
      date: date.toISOString().slice(0, 10),
      time: pick(times),
      party: rand(2, 8),
      notes: i % 4 === 0 ? 'Birthday — a candle on the churros, please' : '',
      status: i < 2 ? 'confirmed' : pick(['pending', 'confirmed', 'confirmed']),
      createdAt: now - rand(1, 72) * 3600000,
    });
  }

  return { version: 1, seededAt: now, nextOrderNumber: number, menu, loyalty, settings, customers, orders, ledger, reservations };
}
