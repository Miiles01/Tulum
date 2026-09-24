import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { computeTotals, placeOrder, useCurrentCustomer, useDemo } from '../demo/store';
import { randomPerson } from '../demo/seed';
import { money } from '../demo/format';
import Icon from '../demo/icons';

function pickupSlots(prep) {
  const slots = [];
  const d = new Date(Date.now() + (prep + 15) * 60000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  for (let i = 0; i < 12 && d.getHours() < 22; i++) {
    slots.push(d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }));
    d.setMinutes(d.getMinutes() + 15);
  }
  return slots;
}

export default function Checkout() {
  const { items, clearCart, setDrawerOpen } = useCart();
  const customer = useCurrentCustomer();
  const settings = useDemo((s) => s.settings);
  const rewards = useDemo((s) => s.loyalty.rewards.filter((r) => r.active));
  const pointsPerDollar = useDemo((s) => s.loyalty.pointsPerDollar);
  const navigate = useNavigate();

  // Invitados: datos de prueba precargados para que el visitante solo confirme.
  const [contact, setContact] = useState(() => {
    const p = customer || randomPerson();
    return { name: p.name, email: p.email, phone: p.phone };
  });
  const [type, setType] = useState('pickup');
  const [when, setWhen] = useState('asap');
  const [table, setTable] = useState(7);
  const [notes, setNotes] = useState('');
  const [rewardId, setRewardId] = useState(null);

  const set = (k) => (e) => setContact((f) => ({ ...f, [k]: e.target.value }));

  const reward = rewardId ? rewards.find((r) => r.id === rewardId) : null;
  const totals = useMemo(() => computeTotals(items, reward ? reward.value : 0, settings.taxes), [items, reward, settings.taxes]);
  const earn = customer ? Math.floor((totals.subtotal - totals.discount) * pointsPerDollar) : Math.floor(totals.subtotal * pointsPerDollar);
  const slots = useMemo(() => pickupSlots(settings.prepMinutes), [settings.prepMinutes]);

  if (items.length === 0) {
    return (
      <div className="tl-page">
        <div className="tl-wrap-narrow" style={{ textAlign: 'center', paddingTop: 60 }}>
          <h1 className="tl-title">Your order is empty</h1>
          <p className="tl-lead" style={{ margin: '14px auto 28px' }}>Add a few dishes and come back to check out.</p>
          <Link to="/menu" className="tl-btn tl-btn-primary">Browse the menu</Link>
        </div>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const order = placeOrder({
      customerId: customer ? customer.id : null,
      ...contact,
      type,
      table: Number(table),
      pickupTime: type === 'pickup' ? when : null,
      notes,
      items: items.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
      rewardId,
    });
    clearCart();
    setDrawerOpen(false);
    navigate(`/order/${order.id}`);
  };

  return (
    <div className="tl-page">
      <div className="tl-wrap">
        <Link to="/menu" className="tl-link" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginBottom: 18, textDecoration: 'none' }}>
          <Icon name="back" size={16} /> Back to menu
        </Link>
        <h1 className="tl-title" style={{ marginBottom: 32 }}>Checkout</h1>

        <form className="tl-checkout" onSubmit={submit}>
          <div className="tl-stack">
            {!customer && (
              <div className="tl-login-hint">
                <Icon name="star" size={24} style={{ color: 'var(--tl-pink)' }} />
                <div><strong>Earn {earn} points with this order.</strong><br />Sign in to collect points and use rewards.</div>
                <Link to="/account?next=/checkout" className="tl-btn tl-btn-primary tl-btn-sm">Sign in</Link>
              </div>
            )}

            <div className="tl-card">
              <h3>How would you like it?</h3>
              <div className="tl-seg" style={{ marginBottom: 18 }}>
                <button type="button" className={type === 'pickup' ? 'is-on' : ''} onClick={() => setType('pickup')}>Pickup</button>
                <button type="button" className={type === 'dine-in' ? 'is-on' : ''} onClick={() => setType('dine-in')}>Dine-in</button>
              </div>
              {type === 'pickup' ? (
                <div className="tl-field">
                  <label htmlFor="when">Pickup time</label>
                  <select id="when" className="tl-select" value={when} onChange={(e) => setWhen(e.target.value)}>
                    <option value="asap">As soon as possible (about {settings.prepMinutes} min)</option>
                    {slots.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ) : (
                <div className="tl-field">
                  <label htmlFor="table">Table number</label>
                  <input id="table" className="tl-input" type="number" min="1" max="30" value={table} onChange={(e) => setTable(e.target.value)} required />
                </div>
              )}
            </div>

            <div className="tl-card">
              <h3>Your details</h3>
              <div className="tl-stack-sm">
                <div className="tl-field">
                  <label htmlFor="name">Full name</label>
                  <input id="name" className="tl-input" value={contact.name} onChange={set('name')} required autoComplete="name" />
                </div>
                <div className="tl-grid-2">
                  <div className="tl-field">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" className="tl-input" value={contact.email} onChange={set('email')} required autoComplete="email" />
                  </div>
                  <div className="tl-field">
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" type="tel" className="tl-input" value={contact.phone} onChange={set('phone')} required autoComplete="tel" />
                  </div>
                </div>
                <div className="tl-field">
                  <label htmlFor="notes">Notes for the kitchen <span className="tl-muted">(optional)</span></label>
                  <textarea id="notes" className="tl-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, extra salsa verde…" />
                </div>
              </div>
            </div>

            {customer && (
              <div className="tl-card">
                <div className="tl-row" style={{ marginBottom: 14 }}>
                  <h3 style={{ margin: 0 }}>Use a reward</h3>
                  <span className="tl-pill"><Icon name="star" size={14} /> {customer.points} pts</span>
                </div>
                <div className="tl-stack-sm">
                  <button type="button" className={`tl-reward-opt ${!rewardId ? 'is-on' : ''}`} onClick={() => setRewardId(null)}>
                    <span className="tl-radio" /> No reward this time
                  </button>
                  {rewards.map((r) => {
                    const locked = customer.points < r.cost;
                    return (
                      <button type="button" key={r.id} disabled={locked} className={`tl-reward-opt ${rewardId === r.id ? 'is-on' : ''}`} onClick={() => setRewardId(r.id)}>
                        <span className="tl-radio" />
                        <span>{r.name} <span className="tl-muted tl-small">· saves {money(r.value)}</span></span>
                        <span className="tl-reward-cost">{locked ? `${r.cost - customer.points} pts to go` : `${r.cost} pts`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="tl-card tl-summary">
            <h3>Order summary</h3>
            <ul className="tl-summary-lines">
              {items.map((i) => (
                <li key={i.id}><span>{i.qty} × {i.name}</span><span>{money(i.price * i.qty)}</span></li>
              ))}
            </ul>
            <div className="tl-totals">
              <div className="tl-row"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
              {totals.discount > 0 && <div className="tl-row is-discount"><span>{reward.name}</span><span>−{money(totals.discount)}</span></div>}
              {totals.taxLines.map((t) => (
                <div className="tl-row tl-muted" key={t.name}><span>{t.name} ({(t.rate * 100).toFixed(3).replace(/\.?0+$/, '')}%)</span><span>{money(t.amount)}</span></div>
              ))}
              <div className="tl-row is-total"><span>Total</span><span>{money(totals.total)}</span></div>
            </div>
            <p className="tl-muted tl-small" style={{ margin: '14px 0 18px', display: 'flex', gap: 8 }}>
              <Icon name="receipt" size={16} /> Pay at the counter when you pick up. No card needed online.
            </p>
            {customer && <p className="tl-small" style={{ marginBottom: 14, fontWeight: 600 }}>You'll earn {earn} points once it's picked up.</p>}
            <button type="submit" className="tl-btn tl-btn-primary tl-btn-block" disabled={!settings.acceptingOrders}>
              {settings.acceptingOrders ? <>Place order · {money(totals.total)}</> : 'Orders are paused'}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}
