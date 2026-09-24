import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { STATUS_LABELS, adjustPoints, tierFor, useDemo } from '../demo/store';
import { initials, money, shortDate } from '../demo/format';
import { AdminHeader } from './AdminLayout';
import Icon from '../demo/icons';

function CustomerSheet({ customer, onClose }) {
  const orders = useDemo((s) => s.orders.filter((o) => o.customerId === customer.id));
  const ledger = useDemo((s) => s.ledger.filter((l) => l.customerId === customer.id));
  const tiers = useDemo((s) => s.loyalty.tiers);
  const [amount, setAmount] = useState(25);
  const [reason, setReason] = useState('Goodwill gesture');
  const { current } = tierFor(customer.lifetime, tiers);

  return (
    <motion.div className="adm-sheet-wrap" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside className="adm-sheet" onClick={(e) => e.stopPropagation()} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <div className="tl-row">
          <div className="adm-person">
            <div className="adm-avatar" style={{ width: 48, height: 48, fontSize: 16 }}>{initials(customer.name)}</div>
            <div><p style={{ fontSize: 18 }}>{customer.name}</p><span>Member since {shortDate(customer.createdAt)}</span></div>
          </div>
          <button className="tl-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>

        <div className="adm-kpis" style={{ gridTemplateColumns: 'repeat(2, 1fr)', margin: 0 }}>
          <div className="adm-kpi"><div className="adm-kpi-top">Points</div><strong>{customer.points}</strong><small>{current.name} tier</small></div>
          <div className="adm-kpi"><div className="adm-kpi-top">Spent</div><strong>{money(customer.spent)}</strong><small>{customer.visits} visits</small></div>
        </div>

        <div className="tl-card">
          <h3>Contact</h3>
          <p className="tl-small tl-muted" style={{ lineHeight: 1.7 }}>{customer.email}<br />{customer.phone}</p>
        </div>

        <div className="tl-card tl-stack-sm">
          <h3 style={{ marginBottom: 4 }}>Adjust points</h3>
          <div className="tl-grid-2">
            <div className="tl-field"><label htmlFor="pa">Points</label><input id="pa" type="number" className="tl-input" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
            <div className="tl-field"><label htmlFor="pr">Reason</label><input id="pr" className="tl-input" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="tl-btn tl-btn-primary tl-btn-sm" onClick={() => adjustPoints(customer.id, Math.abs(amount), reason)}><Icon name="plus" size={14} /> Add</button>
            <button className="tl-btn tl-btn-ghost tl-btn-sm" onClick={() => adjustPoints(customer.id, -Math.abs(amount), reason)}><Icon name="minus" size={14} /> Remove</button>
          </div>
        </div>

        <div className="tl-card">
          <h3>Points history</h3>
          <ul className="tl-history">
            {ledger.slice(0, 10).map((l) => (
              <li key={l.id}>
                <div className="tl-h-main"><p>{l.reason}</p><p>{shortDate(l.at)}</p></div>
                <span className={l.delta >= 0 ? 'tl-delta-plus' : 'tl-delta-minus'}>{l.delta >= 0 ? '+' : ''}{l.delta}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="tl-card">
          <h3>Orders</h3>
          {orders.length === 0 ? <p className="tl-muted tl-small">No orders yet.</p> : (
            <ul className="tl-history">
              {orders.slice(0, 8).map((o) => (
                <li key={o.id}>
                  <div className="tl-h-main"><p>{o.id} · {money(o.total)}</p><p>{shortDate(o.createdAt)}</p></div>
                  <span className={`tl-pill tl-pill-${o.status}`}>{STATUS_LABELS[o.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}

export default function Customers() {
  const customers = useDemo((s) => s.customers);
  const tiers = useDemo((s) => s.loyalty.tiers);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('points');
  const [openId, setOpenId] = useState(null);
  const open = customers.find((c) => c.id === openId);

  const list = customers
    .filter((c) => !q || `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === 'recent' ? b.createdAt - a.createdAt : b[sort] - a[sort]));

  return (
    <>
      <AdminHeader title="Customers" subtitle={`${customers.length} loyalty members. Click one to see their history or adjust points.`} />
      <section className="adm-panel">
        <div className="adm-filters">
          <input className="tl-input" placeholder="Search by name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="tl-seg">
            {[['points', 'Points'], ['spent', 'Spent'], ['recent', 'Newest']].map(([k, l]) => (
              <button key={k} className={sort === k ? 'is-on' : ''} onClick={() => setSort(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Member</th><th>Phone</th><th>Tier</th><th className="adm-num">Visits</th><th className="adm-num">Spent</th><th className="adm-num">Points</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="is-click" onClick={() => setOpenId(c.id)}>
                  <td><div className="adm-person"><div className="adm-avatar">{initials(c.name)}</div><div><p>{c.name}</p><span>{c.email}</span></div></div></td>
                  <td className="tl-muted" style={{ whiteSpace: 'nowrap' }}>{c.phone}</td>
                  <td><span className="tl-pill">{tierFor(c.lifetime, tiers).current.name}</span></td>
                  <td className="adm-num">{c.visits}</td>
                  <td className="adm-num">{money(c.spent)}</td>
                  <td className="adm-num"><strong>{c.points}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <AnimatePresence>{open && <CustomerSheet customer={open} onClose={() => setOpenId(null)} />}</AnimatePresence>
    </>
  );
}
