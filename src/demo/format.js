const currency = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

export const money = (n) => currency.format(n || 0);

export function timeAgo(ts) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

export const clock = (ts) => new Date(ts).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });

export const shortDate = (ts) => new Date(ts).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });

export function niceDate(isoDay) {
  const [y, m, d] = isoDay.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
}

export const todayIso = (offsetDays = 0) => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

export const isToday = (ts) => new Date(ts).toDateString() === new Date().toDateString();

export function pickupLabel(order) {
  if (order.type === 'dine-in') return `Dine-in · table ${order.table}`;
  return order.pickupTime === 'asap' ? 'Pickup · as soon as possible' : `Pickup · ${order.pickupTime}`;
}
