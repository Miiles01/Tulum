import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { STATUS_FLOW, STATUS_LABELS, advanceOrder, generateSampleOrder, setOrderStatus, useDemo } from '../demo/store';
import { clock, money, pickupLabel, shortDate, timeAgo } from '../demo/format';
import { AdminHeader } from './AdminLayout';
import Icon from '../demo/icons';

const COLS = [
  { id: 'new', label: 'New', color: 'var(--tl-pink)', action: 'Start preparing' },
  { id: 'preparing', label: 'Preparing', color: '#D68319', action: 'Mark as ready' },
  { id: 'ready', label: 'Ready', color: 'var(--tl-blue)', action: 'Picked up' },
  { id: 'completed', label: 'Completed today', color: 'var(--tl-green)' },
];

function OrderSheet({ order, onClose }) {
  return (
    <motion.div className="adm-sheet-wrap" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside className="adm-sheet" onClick={(e) => e.stopPropagation()} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <div className="tl-row">
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800 }}>{order.id}</h2>
            <p className="tl-muted tl-small">{shortDate(order.createdAt)} at {clock(order.createdAt)}</p>
          </div>
          <button className="tl-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <span className={`tl-pill tl-pill-${order.status}`} style={{ alignSelf: 'flex-start' }}>{STATUS_LABELS[order.status]}</span>

        <div className="tl-card">
          <h3>{order.name}</h3>
          <p className="tl-small tl-muted" style={{ lineHeight: 1.7 }}>
            {order.email}<br />{order.phone}<br />{pickupLabel(order)}
          </p>
          {order.customerId ? (
            <p className="tl-small" style={{ marginTop: 10, fontWeight: 600 }}>
              Loyalty member · {order.pointsCredited ? `+${order.points} pts credited` : `+${order.points} pts on pickup`}
            </p>
          ) : <p className="tl-small tl-muted" style={{ marginTop: 10 }}>Guest checkout</p>}
          {order.notes && <p className="tl-demo-note" style={{ marginTop: 14 }}>{order.notes}</p>}
        </div>

        <div className="tl-card">
          <ul className="tl-summary-lines">
            {order.items.map((i) => <li key={i.id}><span>{i.qty} × {i.name}</span><span>{money(i.price * i.qty)}</span></li>)}
          </ul>
          <div className="tl-totals">
            <div className="tl-row"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="tl-row is-discount"><span>{order.reward?.name}</span><span>−{money(order.discount)}</span></div>}
            {order.taxLines?.map((t) => <div key={t.name} className="tl-row tl-muted"><span>{t.name}</span><span>{money(t.amount)}</span></div>)}
            <div className="tl-row is-total"><span>Total</span><span>{money(order.total)}</span></div>
          </div>
        </div>

        <div className="tl-stack-sm">
          <span className="tl-label">Change status</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[...STATUS_FLOW, 'cancelled'].map((s) => (
              <button key={s} className={`tl-btn tl-btn-sm ${order.status === s ? 'tl-btn-primary' : 'tl-btn-ghost'}`} onClick={() => setOrderStatus(order.id, s)}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function OrderCard({ order, col, onOpen }) {
  const fresh = Date.now() - order.createdAt < 60000;
  return (
    <motion.article layout className={`adm-order ${fresh ? 'is-fresh' : ''}`} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      {col.action && (
        <button className="tl-icon-btn adm-order-cancel" aria-label={`Cancel ${order.id}`} title="Cancel order" onClick={() => setOrderStatus(order.id, 'cancelled')}>
          <Icon name="close" size={14} />
        </button>
      )}
      <button onClick={() => onOpen(order.id)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="adm-order-top"><strong>{order.id}</strong><span>{timeAgo(order.createdAt)}</span></div>
        <p className="adm-order-who">{order.name}</p>
        <div className="adm-order-meta">
          <span>{order.type === 'dine-in' ? `Table ${order.table}` : order.pickupTime === 'asap' ? 'Pickup · ASAP' : `Pickup · ${order.pickupTime}`}</span>
          {order.customerId && <span style={{ color: '#B01E6B', fontWeight: 600 }}>Member</span>}
          {order.reward && <span style={{ color: 'var(--tl-green)', fontWeight: 600 }}>Reward</span>}
        </div>
        <ul className="adm-order-items">
          {order.items.map((i) => <li key={i.id}>{i.qty} × {i.name}</li>)}
        </ul>
        {order.notes && <p className="tl-small" style={{ color: 'var(--tl-amber)' }}>Note: {order.notes}</p>}
      </button>
      <div className="adm-order-foot">
        <strong>{money(order.total)}</strong>
        {col.action && <button className="tl-btn tl-btn-primary tl-btn-sm" onClick={() => advanceOrder(order.id)}>{col.action}</button>}
      </div>
    </motion.article>
  );
}

export default function Orders() {
  const orders = useDemo((s) => s.orders);
  const [view, setView] = useState('board');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [openId, setOpenId] = useState(null);
  const open = orders.find((o) => o.id === openId);

  const today = new Date().toDateString();
  const byCol = (c) => orders.filter((o) => o.status === c && (c !== 'completed' || new Date(o.updatedAt).toDateString() === today));

  const filtered = orders.filter((o) => (status === 'all' || o.status === status)
    && (!q || `${o.id} ${o.name} ${o.email}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <AdminHeader title="Orders" subtitle="Move orders along as the kitchen works. Customers see each change live.">
        <div className="tl-seg">
          <button className={view === 'board' ? 'is-on' : ''} onClick={() => setView('board')}>Kitchen board</button>
          <button className={view === 'list' ? 'is-on' : ''} onClick={() => setView('list')}>All orders</button>
        </div>
        <button className="tl-btn tl-btn-primary tl-btn-sm" onClick={generateSampleOrder}><Icon name="plus" size={16} /> Simulate an order</button>
      </AdminHeader>

      {view === 'board' ? (
        <div className="adm-board">
          {COLS.map((c) => {
            const list = byCol(c.id);
            return (
              <section key={c.id} className="adm-col">
                <div className="adm-col-head">
                  <h3><span className="adm-dot" style={{ background: c.color }} />{c.label}</h3>
                  <span className="tl-pill">{list.length}</span>
                </div>
                {list.length === 0 && <p className="adm-col-empty">Nothing here</p>}
                <AnimatePresence initial={false}>
                  {list.slice(0, c.id === 'completed' ? 8 : 50).map((o) => <OrderCard key={o.id} order={o} col={c} onOpen={setOpenId} />)}
                </AnimatePresence>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="adm-panel">
          <div className="adm-filters">
            <input className="tl-input" placeholder="Search by order, name or email" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="tl-seg" style={{ overflowX: 'auto', maxWidth: '100%' }}>
              {['all', ...STATUS_FLOW, 'cancelled'].map((s) => (
                <button key={s} className={status === s ? 'is-on' : ''} onClick={() => setStatus(s)}>{s === 'all' ? 'All' : STATUS_LABELS[s]}</button>
              ))}
            </div>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Type</th><th>Items</th><th>Status</th><th className="adm-num">Total</th></tr></thead>
              <tbody>
                {filtered.slice(0, 80).map((o) => (
                  <tr key={o.id} className="is-click" onClick={() => setOpenId(o.id)}>
                    <td><strong>{o.id}</strong></td>
                    <td>{o.name}{o.customerId && <span className="tl-tag-pop" style={{ marginLeft: 8 }}>Member</span>}</td>
                    <td className="tl-muted" style={{ whiteSpace: 'nowrap' }}>{shortDate(o.createdAt)} · {clock(o.createdAt)}</td>
                    <td className="tl-muted">{o.type === 'dine-in' ? 'Dine-in' : 'Pickup'}</td>
                    <td className="tl-muted">{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                    <td><span className={`tl-pill tl-pill-${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
                    <td className="adm-num">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="adm-col-empty">No orders match.</p>}
          </div>
        </section>
      )}

      <AnimatePresence>{open && <OrderSheet order={open} onClose={() => setOpenId(null)} />}</AnimatePresence>
    </>
  );
}
