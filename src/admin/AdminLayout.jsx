import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { isAdmin, logoutAdmin, useDemo } from '../demo/store';
import { initials } from '../demo/format';
import Icon from '../demo/icons';

const NAV = [
  { to: '/admin', end: true, icon: 'grid', label: 'Overview' },
  { to: '/admin/orders', icon: 'receipt', label: 'Orders', count: 'orders' },
  { to: '/admin/reservations', icon: 'calendar', label: 'Reservations', count: 'res' },
  { to: '/admin/menu', icon: 'menu', label: 'Menu' },
  { to: '/admin/customers', icon: 'users', label: 'Customers' },
  { to: '/admin/loyalty', icon: 'heart', label: 'Loyalty' },
  { to: '/admin/settings', icon: 'settings', label: 'Settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const orders = useDemo((s) => s.orders);
  const pendingRes = useDemo((s) => s.reservations.filter((r) => r.status === 'pending').length);
  const owner = useDemo((s) => s.settings.staff[0]);
  const active = orders.filter((o) => ['new', 'preparing', 'ready'].includes(o.status)).length;
  const [toast, setToast] = useState(null);
  const lastId = useRef(orders[0]?.id);

  // Aviso cuando entra un pedido nuevo (por ejemplo desde la tienda en otra pestaña)
  useEffect(() => {
    const latest = orders[0];
    if (latest && latest.id !== lastId.current) {
      lastId.current = latest.id;
      setToast(`New order ${latest.id} from ${latest.name.split(' ')[0]}`);
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [orders]);

  if (!isAdmin()) return <Navigate to="/admin/login" replace />;

  const counts = { orders: active, res: pendingRes };

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-side-top">
          <Link to="/admin" className="adm-brand">
            <img src="/brand/logotipo-tulum.svg" alt="Tulum" />
            <span>Admin</span>
          </Link>
          <Link to="/" className="adm-mobile-only tl-btn tl-btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--tl-cream)' }}>
            View site <Icon name="external" size={14} />
          </Link>
        </div>
        <nav className="adm-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <Icon name={n.icon} size={19} /> {n.label}
              {n.count && counts[n.count] > 0 && <span className="adm-count">{counts[n.count]}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="adm-side-foot">
          <Link to="/" target="_blank"><Icon name="external" size={18} /> Open the website</Link>
          <button onClick={() => { logoutAdmin(); navigate('/admin/login'); }}><Icon name="logout" size={18} /> Sign out</button>
          <div className="adm-user">
            <div className="adm-avatar is-pink">{initials(owner.name)}</div>
            <div><p>{owner.name}</p><span>{owner.role}</span></div>
          </div>
        </div>
      </aside>

      <main className="adm-main">
        <Outlet />
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div className="tl-toast" initial={{ opacity: 0, y: 16, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 16, x: '-50%' }}>
            <Icon name="bell" size={18} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminHeader({ title, subtitle, children }) {
  return (
    <div className="adm-top">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="adm-actions">{children}</div>}
    </div>
  );
}
