import { useSyncExternalStore } from 'react';
import { buildSeed, randomItems, randomPerson, DEMO_ADMIN } from './seed';

// Fuente de verdad de la demo. Se guarda en localStorage y se sincroniza entre pestañas
// (el visitante puede tener la tienda en una pestaña y el panel admin en otra).
const KEY = 'tulum_demo_v1';
const SESSION_KEY = 'tulum_session';
const ADMIN_KEY = 'tulum_admin';

export const STATUS_FLOW = ['new', 'preparing', 'ready', 'completed'];
export const STATUS_LABELS = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
export const RESERVATION_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  seated: 'Seated',
  cancelled: 'Cancelled',
};

const round = (n) => Math.round(n * 100) / 100;

export function computeTotals(items, discount = 0, taxes = []) {
  const subtotal = round(items.reduce((s, i) => s + i.price * i.qty, 0));
  const applied = Math.min(discount, subtotal);
  const taxable = subtotal - applied;
  const taxLines = taxes.map((t) => ({ name: t.name, rate: t.rate, amount: round(taxable * t.rate) }));
  const tax = round(taxLines.reduce((s, t) => s + t.amount, 0));
  return { subtotal, discount: round(applied), taxLines, tax, total: round(taxable + tax) };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* storage bloqueado: la demo sigue en memoria */ }
  const seed = buildSeed(computeTotals);
  save(seed);
  return seed;
}

function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ }
}

let state = load();
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

function update(fn) {
  const draft = structuredClone(state);
  const result = fn(draft);
  state = draft;
  save(state);
  emit();
  return result;
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue) {
      state = JSON.parse(e.newValue);
      emit();
    }
    if (e.key === SESSION_KEY) emit();
  });
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useDemo(selector = (s) => s) {
  return selector(useSyncExternalStore(subscribe, () => state));
}

export const getState = () => state;

// ─── Lealtad ────────────────────────────────────────────────────────────────
export function tierFor(lifetime, tiers = state.loyalty.tiers) {
  const sorted = [...tiers].sort((a, b) => a.min - b.min);
  let current = sorted[0];
  let next = null;
  for (const t of sorted) {
    if (lifetime >= t.min) current = t;
    else { next = t; break; }
  }
  return { current, next };
}

function credit(s, customerId, delta, reason) {
  const c = s.customers.find((x) => x.id === customerId);
  if (!c) return;
  c.points = Math.max(0, c.points + delta);
  if (delta > 0) c.lifetime += delta;
  s.ledger.unshift({ id: `lg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, customerId, delta, reason, at: Date.now() });
}

// ─── Pedidos ────────────────────────────────────────────────────────────────
function applyStatus(s, order, status) {
  if (order.status === status) return;
  order.status = status;
  order.updatedAt = Date.now();
  if (status === 'completed' && order.customerId && !order.pointsCredited) {
    credit(s, order.customerId, order.points, `Order ${order.id}`);
    order.pointsCredited = true;
    const c = s.customers.find((x) => x.id === order.customerId);
    if (c) { c.visits += 1; c.spent = round(c.spent + order.total); }
  }
  if (status === 'cancelled' && order.reward && order.customerId && !order.rewardRefunded) {
    credit(s, order.customerId, order.reward.cost, `Refund: ${order.reward.name}`);
    order.rewardRefunded = true;
  }
}

export function placeOrder(input) {
  return update((s) => {
    const reward = input.rewardId ? s.loyalty.rewards.find((r) => r.id === input.rewardId) : null;
    const customer = input.customerId ? s.customers.find((c) => c.id === input.customerId) : null;
    const usable = reward && customer && customer.points >= reward.cost ? reward : null;
    const totals = computeTotals(input.items, usable ? usable.value : 0, s.settings.taxes);
    const now = Date.now();
    const order = {
      id: `TL-${s.nextOrderNumber++}`,
      createdAt: now,
      updatedAt: now,
      status: 'new',
      customerId: customer ? customer.id : null,
      name: input.name,
      email: input.email,
      phone: input.phone,
      type: input.type,
      table: input.type === 'dine-in' ? input.table : null,
      pickupTime: input.pickupTime,
      notes: input.notes || '',
      items: input.items,
      ...totals,
      points: customer ? Math.floor((totals.subtotal - totals.discount) * s.loyalty.pointsPerDollar) : 0,
      pointsCredited: false,
      reward: usable ? { id: usable.id, name: usable.name, cost: usable.cost } : null,
      auto: true,
    };
    if (usable) credit(s, customer.id, -usable.cost, `Redeemed: ${usable.name}`);
    s.orders.unshift(order);
    return order;
  });
}

export function setOrderStatus(id, status) {
  update((s) => {
    const o = s.orders.find((x) => x.id === id);
    if (o) { applyStatus(s, o, status); o.auto = false; }
  });
}

export function advanceOrder(id) {
  const o = state.orders.find((x) => x.id === id);
  if (!o) return;
  const i = STATUS_FLOW.indexOf(o.status);
  if (i >= 0 && i < STATUS_FLOW.length - 1) setOrderStatus(id, STATUS_FLOW[i + 1]);
}

export function generateSampleOrder() {
  return update((s) => {
    const useCustomer = Math.random() < 0.6;
    const customer = useCustomer ? s.customers[Math.floor(Math.random() * s.customers.length)] : null;
    const person = customer || randomPerson();
    const items = randomItems(s.menu);
    const totals = computeTotals(items, 0, s.settings.taxes);
    const now = Date.now();
    const type = Math.random() < 0.7 ? 'pickup' : 'dine-in';
    const order = {
      id: `TL-${s.nextOrderNumber++}`, createdAt: now, updatedAt: now, status: 'new',
      customerId: customer ? customer.id : null, name: person.name, email: person.email, phone: person.phone,
      type, table: type === 'dine-in' ? Math.ceil(Math.random() * 18) : null, pickupTime: 'asap', notes: '',
      items, ...totals, points: customer ? Math.floor(totals.subtotal * s.loyalty.pointsPerDollar) : 0,
      pointsCredited: false, reward: null, auto: false,
    };
    s.orders.unshift(order);
    return order;
  });
}

// Cocina simulada: cada etapa dura ~40 s para los pedidos hechos desde la tienda.
const STAGE_MS = 40000;
export function tickKitchen() {
  if (!state.settings.autoAdvance) return;
  const now = Date.now();
  const due = state.orders.filter((o) => o.auto && ['new', 'preparing', 'ready'].includes(o.status) && now - o.updatedAt > STAGE_MS);
  if (!due.length) return;
  update((s) => {
    due.forEach(({ id }) => {
      const o = s.orders.find((x) => x.id === id);
      const i = STATUS_FLOW.indexOf(o.status);
      applyStatus(s, o, STATUS_FLOW[i + 1]);
    });
  });
}

// ─── Clientes / sesión ──────────────────────────────────────────────────────
export function getSessionId() {
  try { return localStorage.getItem(SESSION_KEY); } catch { return null; }
}
function setSessionId(id) {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* noop */ }
  emit();
}

export function useCurrentCustomer() {
  const customers = useDemo((s) => s.customers);
  const id = useSyncExternalStore(subscribe, getSessionId);
  return customers.find((c) => c.id === id) || null;
}

export function loginCustomer(email, password) {
  const c = state.customers.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!c || c.password !== password) throw new Error('Email or password is incorrect.');
  setSessionId(c.id);
  return c;
}

export function registerCustomer({ name, email, phone, password }) {
  if (state.customers.some((x) => x.email.toLowerCase() === email.trim().toLowerCase())) {
    throw new Error('There is already an account with this email.');
  }
  const c = update((s) => {
    const customer = {
      id: `cu-${Date.now()}`, name: name.trim(), email: email.trim(), phone: phone.trim(), password,
      createdAt: Date.now(), points: 0, lifetime: 0, visits: 0, spent: 0,
    };
    s.customers.unshift(customer);
    credit(s, customer.id, s.loyalty.welcomeBonus, 'Welcome bonus');
    return customer;
  });
  setSessionId(c.id);
  return c;
}

export function logoutCustomer() {
  setSessionId(null);
}

export function adjustPoints(customerId, delta, reason) {
  update((s) => credit(s, customerId, delta, reason || 'Manual adjustment'));
}

// ─── Admin ──────────────────────────────────────────────────────────────────
export function isAdmin() {
  try { return sessionStorage.getItem(ADMIN_KEY) === '1'; } catch { return false; }
}
export function loginAdmin(email, password) {
  const staff = state.settings.staff.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!staff || password !== DEMO_ADMIN.password) throw new Error('Wrong credentials. Use the demo access shown below.');
  try { sessionStorage.setItem(ADMIN_KEY, '1'); } catch { /* noop */ }
  return staff;
}
export function logoutAdmin() {
  try { sessionStorage.removeItem(ADMIN_KEY); } catch { /* noop */ }
}

export function updateMenuItem(id, patch) {
  update((s) => { Object.assign(s.menu.find((m) => m.id === id), patch); });
}
export function addMenuItem(item) {
  update((s) => { s.menu.push({ available: true, ...item, id: `it-${Date.now()}` }); });
}
export function deleteMenuItem(id) {
  update((s) => { s.menu = s.menu.filter((m) => m.id !== id); });
}

export function updateLoyalty(patch) {
  update((s) => { Object.assign(s.loyalty, patch); });
}
export function updateReward(id, patch) {
  update((s) => { Object.assign(s.loyalty.rewards.find((r) => r.id === id), patch); });
}
export function addReward(reward) {
  update((s) => { s.loyalty.rewards.push({ active: true, type: 'discount', ...reward, id: `rw-${Date.now()}` }); });
}
export function deleteReward(id) {
  update((s) => { s.loyalty.rewards = s.loyalty.rewards.filter((r) => r.id !== id); });
}

export function updateSettings(patch) {
  update((s) => { Object.assign(s.settings, patch); });
}

export function addReservation(input) {
  return update((s) => {
    const r = { id: `RS-${2201 + s.reservations.length + Math.floor(Math.random() * 50)}`, status: 'pending', createdAt: Date.now(), ...input };
    s.reservations.unshift(r);
    return r;
  });
}
export function setReservationStatus(id, status) {
  update((s) => { s.reservations.find((r) => r.id === id).status = status; });
}

export function resetDemo() {
  state = buildSeed(computeTotals);
  save(state);
  setSessionId(null);
  emit();
}
