import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { STATUS_FLOW, STATUS_LABELS, useDemo } from '../demo/store';
import { clock, money, pickupLabel } from '../demo/format';
import Icon from '../demo/icons';

const COPY = {
  new: { icon: 'bell', title: 'Order received', text: 'The kitchen just got your order.' },
  preparing: { icon: 'flame', title: 'On the grill', text: 'Your dishes are being prepared right now.' },
  ready: { icon: 'bag', title: 'Ready for you', text: 'Head to the counter, your order is waiting.' },
  completed: { icon: 'check', title: 'Enjoy your meal', text: 'Thanks for eating with us. See you soon.' },
  cancelled: { icon: 'close', title: 'Order cancelled', text: 'This order was cancelled. Any reward used was refunded.' },
};

export default function OrderTracking() {
  const { id } = useParams();
  const order = useDemo((s) => s.orders.find((o) => o.id === id));
  const auto = useDemo((s) => s.settings.autoAdvance);
  const [, force] = useState(0);

  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  if (!order) {
    return (
      <div className="tl-page">
        <div className="tl-wrap-narrow" style={{ textAlign: 'center', paddingTop: 60 }}>
          <h1 className="tl-title">Order not found</h1>
          <p className="tl-lead" style={{ margin: '14px auto 28px' }}>We couldn't find order {id}.</p>
          <Link to="/menu" className="tl-btn tl-btn-primary">Back to menu</Link>
        </div>
      </div>
    );
  }

  const copy = COPY[order.status];
  const step = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="tl-page">
      <div className="tl-wrap-narrow">
        <div className="tl-track-head">
          <div className="tl-track-icon"><Icon name={copy.icon} size={32} /></div>
          <p className="tl-eyebrow">Order {order.id} · placed at {clock(order.createdAt)}</p>
          <h1 className="tl-title">{copy.title}</h1>
          <p className="tl-lead" style={{ margin: '12px auto 0' }}>{copy.text}</p>
        </div>

        <div className="tl-stack">
          {order.status !== 'cancelled' && (
            <div className="tl-card">
              <div className="tl-steps">
                {STATUS_FLOW.map((s, i) => (
                  <div key={s} className={`tl-step ${i < step || order.status === 'completed' ? 'is-done' : ''} ${i === step && order.status !== 'completed' ? 'is-current' : ''}`}>
                    <div className="tl-step-bar" />
                    {STATUS_LABELS[s]}
                  </div>
                ))}
              </div>
              {auto && order.auto && order.status !== 'completed' && (
                <p className="tl-muted tl-small" style={{ marginTop: 16 }}>
                  Demo: the kitchen moves this order forward about every 40 seconds. You can also move it from the admin panel.
                </p>
              )}
            </div>
          )}

          {order.customerId && order.status !== 'cancelled' && (
            <div className="tl-points-banner">
              <Icon name="star" size={26} />
              <p>
                {order.pointsCredited
                  ? <><strong>+{order.points} points</strong> added to your loyalty account.</>
                  : <><strong>+{order.points} points</strong> will be added once your order is picked up.</>}
              </p>
            </div>
          )}

          <div className="tl-card">
            <div className="tl-row" style={{ marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>{order.name}</h3>
              <span className={`tl-pill tl-pill-${order.status}`}>{STATUS_LABELS[order.status]}</span>
            </div>
            <p className="tl-muted tl-small" style={{ marginBottom: 16 }}>{pickupLabel(order)} · pay at the counter</p>
            <ul className="tl-summary-lines">
              {order.items.map((i) => <li key={i.id}><span>{i.qty} × {i.name}</span><span>{money(i.price * i.qty)}</span></li>)}
            </ul>
            <div className="tl-totals">
              {order.discount > 0 && <div className="tl-row is-discount"><span>{order.reward?.name}</span><span>−{money(order.discount)}</span></div>}
              <div className="tl-row tl-muted"><span>Taxes</span><span>{money(order.tax)}</span></div>
              <div className="tl-row is-total"><span>Total</span><span>{money(order.total)}</span></div>
            </div>
          </div>

          <div className="tl-row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/menu" className="tl-btn tl-btn-ghost">Order something else</Link>
            {order.customerId
              ? <Link to="/account" className="tl-btn tl-btn-primary">View my points</Link>
              : <Link to="/account?mode=register" className="tl-btn tl-btn-primary">Create an account to earn points</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}
