import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useDemo } from '../demo/store';
import { CATEGORIES } from '../demo/seed';
import { money } from '../demo/format';
import Icon from '../demo/icons';

function AddButton({ item }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <button
      className={`tl-add ${added ? 'is-added' : ''}`}
      disabled={!item.available}
      aria-label={`Add ${item.name}`}
      onClick={() => {
        addItem(item);
        setAdded(true);
        setTimeout(() => setAdded(false), 900);
      }}
    >
      <Icon name={added ? 'check' : 'plus'} />
    </button>
  );
}

export default function MenuPage() {
  const menu = useDemo((s) => s.menu);
  const accepting = useDemo((s) => s.settings.acceptingOrders);
  const prep = useDemo((s) => s.settings.prepMinutes);
  const { count, subtotal, drawerOpen, setDrawerOpen } = useCart();
  const [cat, setCat] = useState('all');

  const cats = CATEGORIES.filter((c) => menu.some((m) => m.category === c.id));
  const visible = cat === 'all' ? cats : cats.filter((c) => c.id === cat);

  return (
    <div className="tl-page">
      <div className="tl-wrap">
        <div className="tl-menu-head">
          <div>
            <p className="tl-eyebrow">Order online · pickup or dine-in</p>
            <h1 className="tl-title">Our <em>menu</em></h1>
            <p className="tl-lead">Order ahead, pay when you pick it up, and earn points with every dish.</p>
          </div>
          <span className="tl-pill"><Icon name="clock" size={15} /> Ready in about {prep} min</span>
        </div>

        {!accepting && (
          <div className="tl-closed"><Icon name="clock" /> The kitchen is paused right now. You can browse the menu, but new orders are closed.</div>
        )}

        <div className="tl-cats">
          <button className={`tl-chip ${cat === 'all' ? 'is-on' : ''}`} onClick={() => setCat('all')}>All</button>
          {cats.map((c) => (
            <button key={c.id} className={`tl-chip ${cat === c.id ? 'is-on' : ''}`} onClick={() => setCat(c.id)}>{c.name}</button>
          ))}
        </div>

        {visible.map((c) => {
          const items = menu.filter((m) => m.category === c.id);
          const withPhoto = items.filter((m) => m.image);
          const plain = items.filter((m) => !m.image);
          return (
            <section key={c.id}>
              <h2 className="tl-section-title">{c.name}</h2>
              {withPhoto.length > 0 && (
                <div className="tl-dish-grid">
                  {withPhoto.map((m) => (
                    <article key={m.id} className={`tl-dish ${m.available ? '' : 'is-off'}`}>
                      <div className="tl-dish-photo"><img src={m.image} alt={m.name} loading="lazy" /></div>
                      <div className="tl-dish-body">
                        <h3>{m.name}{m.popular && <span className="tl-tag-pop">Popular</span>}{!m.available && <span className="tl-tag-off">Sold out</span>}</h3>
                        <p>{m.description}</p>
                      </div>
                      <div className="tl-dish-foot">
                        <span className="tl-price">{money(m.price)}</span>
                        {accepting && <AddButton item={m} />}
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {plain.length > 0 && (
                <div className="tl-list">
                  {plain.map((m) => (
                    <div key={m.id} className={`tl-list-item ${m.available ? '' : 'is-off'}`} style={m.available ? undefined : { opacity: 0.6 }}>
                      <div>
                        <h3>{m.name}{m.popular && <span className="tl-tag-pop">Popular</span>}{!m.available && <span className="tl-tag-off">Sold out</span>}</h3>
                        <p>{m.description}</p>
                        <span className="tl-price">{money(m.price)}</span>
                      </div>
                      {accepting && <AddButton item={m} />}
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {count > 0 && !drawerOpen && (
        <button className="tl-float-cart" onClick={() => setDrawerOpen(true)}>
          <span className="tl-float-count">{count}</span>
          View order · {money(subtotal)}
          <Icon name="arrow" size={18} />
        </button>
      )}
    </div>
  );
}
