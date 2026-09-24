import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  STATUS_LABELS, RESERVATION_LABELS, loginCustomer, logoutCustomer, registerCustomer, tierFor, useCurrentCustomer, useDemo,
} from '../demo/store';
import { DEMO_CUSTOMER } from '../demo/seed';
import { money, niceDate, shortDate } from '../demo/format';
import { openReserve } from '../components/ReserveModal';
import Icon from '../demo/icons';

export function PasswordInput({ id, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="tl-input-wrap">
      <input id={id} className="tl-input" type={show ? 'text' : 'password'} value={value} onChange={onChange} required autoComplete="current-password" />
      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
        <Icon name={show ? 'eyeOff' : 'eye'} />
      </button>
    </div>
  );
}

function AuthForms() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [error, setError] = useState('');
  const [login, setLogin] = useState({ email: DEMO_CUSTOMER.email, password: DEMO_CUSTOMER.password });
  const [reg, setReg] = useState({ name: '', email: '', phone: '', password: '' });
  const bonus = useDemo((s) => s.loyalty.welcomeBonus);
  const next = params.get('next');

  const done = () => { if (next) navigate(next); };

  const submitLogin = (e) => {
    e.preventDefault();
    try { loginCustomer(login.email, login.password); setError(''); done(); } catch (err) { setError(err.message); }
  };
  const submitReg = (e) => {
    e.preventDefault();
    try { registerCustomer(reg); setError(''); done(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="tl-auth">
      <div className="tl-auth-head">
        <p className="tl-eyebrow">Tulum rewards</p>
        <h1 className="tl-title">{mode === 'login' ? <>Welcome <em>back</em></> : <>Join the <em>club</em></>}</h1>
        <p className="tl-lead" style={{ margin: '12px auto 0' }}>
          Earn a point for every dollar and trade them for free dishes. New members get {bonus} points.
        </p>
      </div>
      <div className="tl-card">
        <div className="tl-seg" style={{ display: 'flex', marginBottom: 22 }}>
          <button type="button" style={{ flex: 1 }} className={mode === 'login' ? 'is-on' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
          <button type="button" style={{ flex: 1 }} className={mode === 'register' ? 'is-on' : ''} onClick={() => { setMode('register'); setError(''); }}>Create account</button>
        </div>

        {mode === 'login' ? (
          <form className="tl-stack-sm" onSubmit={submitLogin}>
            <div className="tl-demo-note">
              <Icon name="sparkle" size={18} />
              <span>Demo account already filled in: <code>{DEMO_CUSTOMER.email}</code> / <code>{DEMO_CUSTOMER.password}</code></span>
            </div>
            <div className="tl-field">
              <label htmlFor="le">Email</label>
              <input id="le" type="email" className="tl-input" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} required autoComplete="email" />
            </div>
            <div className="tl-field">
              <label htmlFor="lp">Password</label>
              <PasswordInput id="lp" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
            </div>
            {error && <p className="tl-error">{error}</p>}
            <button className="tl-btn tl-btn-primary tl-btn-block" style={{ marginTop: 6 }}>Sign in</button>
          </form>
        ) : (
          <form className="tl-stack-sm" onSubmit={submitReg}>
            <div className="tl-field">
              <label htmlFor="rn">Full name</label>
              <input id="rn" className="tl-input" value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} required autoComplete="name" />
            </div>
            <div className="tl-field">
              <label htmlFor="re">Email</label>
              <input id="re" type="email" className="tl-input" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} required autoComplete="email" />
            </div>
            <div className="tl-field">
              <label htmlFor="rp">Phone</label>
              <input id="rp" type="tel" className="tl-input" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} required autoComplete="tel" />
            </div>
            <div className="tl-field">
              <label htmlFor="rw">Password</label>
              <PasswordInput id="rw" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} />
            </div>
            {error && <p className="tl-error">{error}</p>}
            <button className="tl-btn tl-btn-primary tl-btn-block" style={{ marginTop: 6 }}>Create account · get {bonus} points</button>
            <p className="tl-muted tl-small" style={{ textAlign: 'center' }}>Demo only: data stays in this browser.</p>
          </form>
        )}
      </div>
    </div>
  );
}

function Dashboard({ customer }) {
  const loyalty = useDemo((s) => s.loyalty);
  const orders = useDemo((s) => s.orders.filter((o) => o.customerId === customer.id));
  const ledger = useDemo((s) => s.ledger.filter((l) => l.customerId === customer.id));
  const reservations = useDemo((s) => s.reservations.filter((r) => r.email === customer.email));
  const [tab, setTab] = useState('orders');

  const { current, next } = tierFor(customer.lifetime, loyalty.tiers);
  const pct = next ? Math.min(100, ((customer.lifetime - current.min) / (next.min - current.min)) * 100) : 100;
  const pending = orders.filter((o) => !o.pointsCredited && o.status !== 'cancelled').reduce((s, o) => s + o.points, 0);
  const rewards = loyalty.rewards.filter((r) => r.active);

  return (
    <>
      <div className="tl-row" style={{ flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <p className="tl-eyebrow">My account</p>
          <h1 className="tl-title">Hola, <em>{customer.name.split(' ')[0]}</em></h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/menu" className="tl-btn tl-btn-primary">Order now</Link>
          <button className="tl-btn tl-btn-ghost" onClick={openReserve}>Reserve a table</button>
          <button className="tl-btn tl-btn-ghost" onClick={logoutCustomer}><Icon name="logout" size={18} /> Sign out</button>
        </div>
      </div>

      <div className="tl-account-grid">
        <div className="tl-stack">
          <div className="tl-loyalty-card">
            <div className="tl-lc-top">
              <img src="/brand/logotipo-tulum.svg" alt="Tulum" />
              <span className="tl-lc-tier">{current.name}</span>
            </div>
            <div>
              <div className="tl-lc-points">{customer.points}</div>
              <p className="tl-lc-label">points available{pending > 0 && ` · ${pending} on the way`}</p>
            </div>
            <div>
              <div className="tl-row tl-small" style={{ opacity: 0.8 }}>
                <span>{next ? `${next.min - customer.lifetime} pts to ${next.name}` : 'Top tier reached'}</span>
                <span>{customer.lifetime} lifetime</span>
              </div>
              <div className="tl-progress"><span style={{ width: `${pct}%` }} /></div>
            </div>
          </div>

          <div className="tl-card">
            <h3>Rewards</h3>
            <div className="tl-rewards">
              {rewards.map((r) => {
                const ok = customer.points >= r.cost;
                return (
                  <div key={r.id} className="tl-reward">
                    <div className="tl-reward-icon"><Icon name="gift" size={20} /></div>
                    <h4>{r.name}</h4>
                    <p className="tl-muted">{r.cost} points</p>
                    <div className="tl-progress is-light" style={{ margin: 0 }}><span style={{ width: `${Math.min(100, (customer.points / r.cost) * 100)}%` }} /></div>
                    <p className="tl-small" style={{ fontWeight: 600, color: ok ? 'var(--tl-green)' : 'var(--tl-ink-soft)' }}>
                      {ok ? 'Ready to use at checkout' : `${r.cost - customer.points} more points`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tl-card">
          <div className="tl-seg tl-tabs-line">
            <button className={tab === 'orders' ? 'is-on' : ''} onClick={() => setTab('orders')}>Orders</button>
            <button className={tab === 'points' ? 'is-on' : ''} onClick={() => setTab('points')}>Points</button>
            <button className={tab === 'res' ? 'is-on' : ''} onClick={() => setTab('res')}>Reservations</button>
          </div>

          {tab === 'orders' && (orders.length === 0 ? (
            <p className="tl-muted" style={{ padding: '24px 0' }}>No orders yet. Your first one earns points right away.</p>
          ) : (
            <ul className="tl-history">
              {orders.slice(0, 12).map((o) => (
                <li key={o.id}>
                  <div className="tl-h-main">
                    <p><Link to={`/order/${o.id}`}>{o.id}</Link> · {money(o.total)}</p>
                    <p>{shortDate(o.createdAt)} · {o.items.map((i) => i.name).join(', ')}</p>
                  </div>
                  <span className={`tl-pill tl-pill-${o.status}`}>{STATUS_LABELS[o.status]}</span>
                </li>
              ))}
            </ul>
          ))}

          {tab === 'points' && (
            <ul className="tl-history">
              {ledger.slice(0, 15).map((l) => (
                <li key={l.id}>
                  <div className="tl-h-main"><p>{l.reason}</p><p>{shortDate(l.at)}</p></div>
                  <span className={l.delta >= 0 ? 'tl-delta-plus' : 'tl-delta-minus'}>{l.delta >= 0 ? '+' : ''}{l.delta}</span>
                </li>
              ))}
            </ul>
          )}

          {tab === 'res' && (reservations.length === 0 ? (
            <div style={{ padding: '24px 0' }}>
              <p className="tl-muted" style={{ marginBottom: 16 }}>No reservations yet.</p>
              <button className="tl-btn tl-btn-primary tl-btn-sm" onClick={openReserve}>Reserve a table</button>
            </div>
          ) : (
            <ul className="tl-history">
              {reservations.map((r) => (
                <li key={r.id}>
                  <div className="tl-h-main"><p>{niceDate(r.date)} · {r.time}</p><p>{r.party} guests · {r.id}</p></div>
                  <span className={`tl-pill tl-pill-${r.status}`}>{RESERVATION_LABELS[r.status]}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Account() {
  const customer = useCurrentCustomer();
  return (
    <div className="tl-page">
      <div className="tl-wrap">
        {customer ? <Dashboard customer={customer} /> : <AuthForms />}
      </div>
    </div>
  );
}
