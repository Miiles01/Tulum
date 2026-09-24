import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { money } from '../demo/format';
import Icon from '../demo/icons';

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, subtotal, count, drawerOpen, setDrawerOpen } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen, setDrawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <motion.div className="tl-overlay" onClick={() => setDrawerOpen(false)}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.aside
            className="tl-drawer" role="dialog" aria-modal="true" aria-label="Your order" data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="tl-drawer-head">
              <h3>Your order {count > 0 && <span className="tl-muted">({count})</span>}</h3>
              <button className="tl-icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close"><Icon name="close" /></button>
            </div>

            {items.length === 0 ? (
              <div className="tl-drawer-empty">
                <Icon name="bag" size={36} />
                <p>Nothing here yet.</p>
                <button className="tl-btn tl-btn-primary" onClick={() => { setDrawerOpen(false); navigate('/menu'); }}>Browse the menu</button>
              </div>
            ) : (
              <>
                <ul className="tl-drawer-list">
                  {items.map((item) => (
                    <li key={item.id} className="tl-line">
                      <div className="tl-line-thumb">
                        {item.image ? <img src={item.image} alt="" /> : <Icon name="flame" size={22} />}
                      </div>
                      <div className="tl-line-info">
                        <p className="tl-line-name">{item.name}</p>
                        <p className="tl-muted">{money(item.price)}</p>
                        <div className="tl-qty">
                          <button onClick={() => updateQuantity(item.id, item.qty - 1)} aria-label="Remove one"><Icon name="minus" size={16} /></button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQuantity(item.id, item.qty + 1)} aria-label="Add one"><Icon name="plus" size={16} /></button>
                        </div>
                      </div>
                      <div className="tl-line-end">
                        <strong>{money(item.price * item.qty)}</strong>
                        <button className="tl-link" onClick={() => removeItem(item.id)}>Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="tl-drawer-foot">
                  <div className="tl-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                  <p className="tl-muted tl-small">Taxes and loyalty rewards are applied at checkout.</p>
                  <button className="tl-btn tl-btn-primary tl-btn-block" onClick={() => { setDrawerOpen(false); navigate('/checkout'); }}>
                    Checkout <Icon name="arrow" size={18} />
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
