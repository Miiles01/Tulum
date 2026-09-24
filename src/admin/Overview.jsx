import { Link } from 'react-router-dom';
import { RESERVATION_LABELS, STATUS_LABELS, generateSampleOrder, useDemo } from '../demo/store';
import { clock, isToday, money, niceDate, todayIso } from '../demo/format';
import { AdminHeader } from './AdminLayout';
import Icon from '../demo/icons';

function Kpi({ icon, label, value, note }) {
  return (
    <div className="adm-kpi">
      <div className="adm-kpi-top">{label}<Icon name={icon} size={18} /></div>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

export default function Overview() {
  const orders = useDemo((s) => s.orders);
  const customers = useDemo((s) => s.customers);
  const ledger = useDemo((s) => s.ledger);
  const reservations = useDemo((s) => s.reservations);
  const menu = useDemo((s) => s.menu);

  const valid = orders.filter((o) => o.status !== 'cancelled');
  const today = valid.filter((o) => isToday(o.createdAt));
  const revenueToday = today.reduce((s, o) => s + o.total, 0);
  const active = orders.filter((o) => ['new', 'preparing', 'ready'].includes(o.status));
  const avg = valid.length ? valid.reduce((s, o) => s + o.total, 0) / valid.length : 0;
  const redeemedWeek = ledger.filter((l) => l.delta < 0 && Date.now() - l.at < 7 * 86400000).reduce((s, l) => s - l.delta, 0);

  // Ingresos de los últimos 7 días
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    const next = d.getTime() + 86400000;
    const total = valid.filter((o) => o.createdAt >= d.getTime() && o.createdAt < next).reduce((s, o) => s + o.total, 0);
    return { label: d.toLocaleDateString('en-CA', { weekday: 'short' }), total, today: i === 6 };
  });
  const max = Math.max(...days.map((d) => d.total), 1);
  const week = days.reduce((s, d) => s + d.total, 0);

  // Platillos más vendidos
  const sold = {};
  valid.forEach((o) => o.items.forEach((i) => { sold[i.id] = (sold[i.id] || 0) + i.qty; }));
  const top = Object.entries(sold).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, qty]) => ({ id, qty, name: menu.find((m) => m.id === id)?.name || id }));
  const topMax = top[0]?.qty || 1;

  const upcoming = reservations
    .filter((r) => r.status !== 'cancelled' && r.date >= todayIso())
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);

  return (
    <>
      <AdminHeader title="Overview" subtitle={new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}>
        <button className="tl-btn tl-btn-ghost tl-btn-sm" onClick={generateSampleOrder}><Icon name="plus" size={16} /> Simulate an order</button>
        <Link to="/admin/orders" className="tl-btn tl-btn-primary tl-btn-sm">Open the kitchen board</Link>
      </AdminHeader>

      <div className="adm-kpis">
        <Kpi icon="chart" label="Sales today" value={money(revenueToday)} note={`${today.length} orders`} />
        <Kpi icon="flame" label="In the kitchen" value={active.length} note={`${active.filter((o) => o.status === 'new').length} waiting to start`} />
        <Kpi icon="receipt" label="Average ticket" value={money(avg)} note="All time" />
        <Kpi icon="heart" label="Loyalty members" value={customers.length} note={`${redeemedWeek} pts redeemed this week`} />
      </div>

      <div className="adm-grid-2">
        <section className="adm-panel">
          <div className="adm-panel-head">
            <h3>Last 7 days</h3>
            <span className="tl-muted tl-small">{money(week)} total</span>
          </div>
          <div className="adm-chart">
            {days.map((d) => (
              <div key={d.label} className={`adm-bar ${d.today ? 'is-today' : ''}`}>
                <div className="adm-bar-fill" style={{ height: `${Math.max(4, (d.total / max) * 100)}%` }}>
                  <span>{d.total ? `$${Math.round(d.total)}` : ''}</span>
                </div>
                <small>{d.today ? 'Today' : d.label}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="adm-panel">
          <div className="adm-panel-head"><h3>Best sellers</h3><Link to="/admin/menu" className="tl-link">Menu</Link></div>
          <ul className="adm-top-list">
            {top.map((t) => (
              <li key={t.id}>
                <span>{t.name}</span><strong>{t.qty}</strong>
                <div className="tl-progress is-light"><span style={{ width: `${(t.qty / topMax) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="adm-grid-2">
        <section className="adm-panel">
          <div className="adm-panel-head"><h3>Recent orders</h3><Link to="/admin/orders" className="tl-link">See all</Link></div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Time</th><th>Status</th><th className="adm-num">Total</th></tr></thead>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.id}</strong></td>
                    <td>{o.name}</td>
                    <td className="tl-muted">{isToday(o.createdAt) ? clock(o.createdAt) : new Date(o.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</td>
                    <td><span className={`tl-pill tl-pill-${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
                    <td className="adm-num">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="adm-panel">
          <div className="adm-panel-head"><h3>Upcoming reservations</h3><Link to="/admin/reservations" className="tl-link">See all</Link></div>
          <ul className="tl-history">
            {upcoming.map((r) => (
              <li key={r.id}>
                <div className="tl-h-main"><p>{r.name}</p><p>{niceDate(r.date)} · {r.time} · {r.party} guests</p></div>
                <span className={`tl-pill tl-pill-${r.status}`}>{RESERVATION_LABELS[r.status]}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
