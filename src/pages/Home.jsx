import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useDemo } from '../demo/store';
import { CATEGORIES } from '../demo/seed';
import { money } from '../demo/format';
import { openReserve } from '../components/ReserveModal';
import Icon from '../demo/icons';
import { Line, Plate, Words, useInViewOnce } from '../home/Reveal';
import '../home/home.css';

// Home con la estructura de la plantilla Halden (hero → manifiesto → catálogo → productos
// → sala → footer), con la tipografía y los colores de Tulum.

const IMG = {
  family: '/covers/desktop/2.webp',
  cocktail: '/covers/desktop/3.webp',
  guac: '/covers/desktop/4.webp',
  shrimp: '/brand/post-248.png',
  horchata: '/brand/post-247-v2.png',
};

// ─── 01 · Hero ───────────────────────────────────────────────────────────────
function Hero({ menu }) {
  const [ref, inView] = useInViewOnce();
  const fajitas = menu.find((m) => m.id === 'fajitas');
  const dishes = menu.filter((m) => m.available).length;
  return (
    <section className="hh-hero" aria-label="Tulum — tequila and tacos in Montréal">
      <div className="hh-hero-stage">
        <h1 ref={ref} className={`hh-hero-title ${inView ? 'is-in' : ''}`}>
          <span className="hh-hero-l1">Salsa verde</span>
          <span className="hh-hero-l2">on everything<span aria-hidden="true">/</span></span>
        </h1>

        {/* Marcador arriba a la derecha */}
        <div className="hh-hero-marker">
          <div className="hh-cap-col">
            <Line delay={320}>Menu 2026</Line>
            <Line delay={380} className="hh-cap-bottom">{dishes} dishes</Line>
          </div>
          <Plate src={IMG.cocktail} alt="Tulum signature cocktail" delay={340} className="hh-hero-marker-plate" position="50% 55%" />
        </div>

        {/* Platillo destacado a la izquierda */}
        {fajitas && (
          <div className="hh-hero-left">
            <div className="hh-cap-col">
              <Line delay={420}>Fajitas for two</Line>
              <Line delay={480} className="hh-cap-bottom">{money(fajitas.price)}</Line>
            </div>
            <Plate src={fajitas.image} alt="Sizzling fajitas" delay={440} fit="contain" className="hh-hero-left-plate is-cutout" />
          </div>
        )}

        <Link to="/menu" className="hh-bracket hh-hero-cta">
          <span aria-hidden="true">[</span>
          <Line delay={560}>order online</Line>
          <span aria-hidden="true">]</span>
        </Link>

        {/* Foto grande al centro */}
        <div className="hh-hero-center">
          <div className="hh-cap-col is-right">
            <Line delay={500}>The family table</Line>
            <Line delay={560} className="hh-cap-bottom">Tue – Sun · 12 h – 23 h</Line>
          </div>
          <Plate src={IMG.family} alt="A family sharing dishes at Tulum" delay={520} className="hh-hero-center-plate" position="50% 40%" />
        </div>

        {/* Par de la derecha */}
        <div className="hh-hero-right">
          <div className="hh-row">
            <Line delay={600}>New on the menu</Line>
            <span className="hh-cap" aria-hidden="true">//</span>
          </div>
          <div className="hh-hero-pair">
            <Plate src={IMG.guac} alt="Guacamole with totopos" delay={620} position="50% 50%" />
            <Plate src={IMG.shrimp} alt="Garlic shrimp" delay={660} position="50% 70%" />
          </div>
        </div>

        <p className="hh-hero-welcome">
          <Line delay={700}>Welcome to Tulum –</Line>
          <Line delay={760}>Mexican soul,</Line>
          <Line delay={820}>made in Montréal.</Line>
        </p>

        <button type="button" className="hh-bracket hh-hero-reserve" onClick={openReserve}>
          <span aria-hidden="true">[</span>
          <Line delay={880}>reserve a table</Line>
          <span aria-hidden="true">]</span>
        </button>
      </div>
    </section>
  );
}

// ─── 02 · Manifiesto ─────────────────────────────────────────────────────────
function Manifesto() {
  const inline = (src, alt) => <img className="hh-inline-img" src={src} alt={alt} />;
  return (
    <section className="hh-manifesto" id="about-us">
      <Words
        className="hh-manifesto-text"
        parts={[
          '(Tulum) is made for ',
          <em key="e">long, loud tables,</em>,
          ' for tacos ',
          inline('/products/tulum/26.webp', 'Pizza birria'),
          ' passed hand to hand — recipes that taste like home ',
          inline('/products/tulum/29.webp', 'Churros'),
          ' in the heart of Montréal, and stay with you long after the last bite.',
        ]}
      />
    </section>
  );
}

// ─── 03 · Catálogo (categorías) ──────────────────────────────────────────────
// Recortes PNG (fondo transparente) donde existen; bebidas usa sus dos fotos de vaso
const CAT_IMAGES = {
  all: ['/products/tulum/24.webp', '/products/tulum/29.webp'],
  mains: ['/products/tulum/26.webp', '/products/tulum/25.webp'],
  starters: ['/products/tulum/guacamole.webp'],
  desserts: ['/products/tulum/29.webp'],
  drinks: [IMG.cocktail, IMG.horchata],
};

function Catalogue({ menu }) {
  const navigate = useNavigate();
  const rows = useMemo(() => [
    { id: 'all', name: 'All dishes', count: menu.length },
    ...CATEGORIES.map((c) => ({ id: c.id, name: c.name, count: menu.filter((m) => m.category === c.id).length })),
  ], [menu]);
  const [active, setActive] = useState('mains');
  const imgs = CAT_IMAGES[active] || CAT_IMAGES.all;
  // Los recortes 24–29 traen mucho margen transparente; el del guacamole viene ajustado
  const cutClass = (src) => (!src.includes('/products/') ? '' : src.includes('guacamole') ? 'is-cutout is-tight' : 'is-cutout');

  return (
    <section className="hh-section hh-catalogue" id="menu">
      <header className="hh-section-head">
        <Line className="hh-label">(04) — Menu</Line>
        <p className="hh-section-note">
          Four sections, and that's the whole menu. Made from scratch every morning — if it isn't on this list, we don't make it.
        </p>
      </header>
      <div className="hh-rule" />

      <div className="hh-cat-stage" onMouseLeave={() => setActive('mains')}>
        <div className={`hh-cat-img is-left ${cutClass(imgs[0]) ? 'is-png' : ''}`} key={`l-${active}`}>
          <img src={imgs[0]} alt="" className={cutClass(imgs[0])} />
        </div>
        <ul className="hh-cat-list">
          {rows.map((r, i) => (
            <li key={r.id}>
              <button
                type="button"
                className={`hh-cat-row ${active === r.id ? 'is-on' : ''}`}
                onMouseEnter={() => setActive(r.id)}
                onFocus={() => setActive(r.id)}
                onClick={() => navigate(r.id === 'all' ? '/menu' : `/menu?cat=${r.id}`)}
              >
                <Line delay={i * 60}>{r.name}<sup>{r.count}</sup></Line>
              </button>
            </li>
          ))}
        </ul>
        {imgs[1] ? (
          <div className={`hh-cat-img is-right ${cutClass(imgs[1]) ? 'is-png' : ''}`} key={`r-${active}`}>
            <img src={imgs[1]} alt="" className={cutClass(imgs[1])} />
          </div>
        ) : <div className="hh-cat-img-spacer" aria-hidden="true" />}
      </div>
    </section>
  );
}

// ─── 04 · Productos (tarjetas blancas del mismo tamaño) ──────────────────────
function AddChip({ item }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      className={`hh-add ${added ? 'is-added' : ''}`}
      aria-label={`Add ${item.name} to your order`}
      disabled={!item.available}
      onClick={() => { addItem(item); setAdded(true); setTimeout(() => setAdded(false), 1000); }}
    >
      <Icon name={added ? 'check' : 'plus'} size={16} />
    </button>
  );
}

function Products({ menu, prep }) {
  const dishes = menu.filter((m) => m.image);
  const filters = [{ id: 'all', name: 'All' }, ...CATEGORIES.filter((c) => dishes.some((d) => d.category === c.id))];
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? dishes : dishes.filter((d) => d.category === filter);
  const trackRef = useRef(null);
  const scroll = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <section className="hh-section hh-products productos-destacados-section">
      <header className="hh-section-head">
        <h2 className="hh-h2"><Line>Dishes that tell a story</Line></h2>
        <p className="hh-section-note">
          Every recipe holds a piece of our heritage. Sourced daily, prepared with passion, ready in about {prep} minutes.
        </p>
      </header>
      <div className="hh-rule" />

      <div className="hh-products-bar">
        <div className="hh-pills" role="tablist" aria-label="Filter dishes">
          {filters.map((f) => {
            const n = f.id === 'all' ? dishes.length : dishes.filter((d) => d.category === f.id).length;
            return (
              <button key={f.id} role="tab" aria-selected={filter === f.id} className={`hh-pill ${filter === f.id ? 'is-on' : ''}`} onClick={() => setFilter(f.id)}>
                {f.name} ({n})
              </button>
            );
          })}
        </div>
        <div className="hh-arrows">
          <button type="button" aria-label="Previous dishes" onClick={() => scroll(-1)}><Icon name="back" size={18} /></button>
          <button type="button" aria-label="Next dishes" onClick={() => scroll(1)}><Icon name="arrow" size={18} /></button>
        </div>
      </div>

      <div className="hh-cards" ref={trackRef} data-lenis-prevent-wheel>
        {list.map((d, i) => (
          <article key={d.id} className={`hh-card ${d.available ? '' : 'is-off'}`}>
            <div className="hh-card-top">
              <span className="hh-cap">({String(i + 1).padStart(2, '0')})</span>
              <AddChip item={d} />
            </div>
            <div className="hh-card-photo"><img src={d.image} alt={d.name} loading="lazy" /></div>
            <div className="hh-card-body">
              <h3>{d.name}</h3>
              <p>{d.description}</p>
            </div>
            <div className="hh-card-foot">
              <span className="hh-pill is-static">{d.available ? (d.popular ? 'Popular' : `Ready in ${prep} min`) : 'Sold out'}</span>
              <strong>{money(d.price)}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── 05 · Reseñas ────────────────────────────────────────────────────────────
const QUOTES = [
  { quote: 'The best tacos al pastor I have had outside of Mexico City. Authentic, fresh and full of flavor.', author: 'María G.', avatar: '/avatares/1.jpg' },
  { quote: 'The guacamole is made right at the table and you can taste the tradition in every bite.', author: 'James T.', avatar: '/avatares/2.jpg' },
  { quote: 'A margarita, a ceviche and a long table with friends. That is the perfect Friday in Montréal.', author: 'Elena R.', avatar: '/avatares/3.jpg' },
];

function Guests() {
  return (
    <section className="hh-section hh-guests">
      <header className="hh-section-head">
        <Line className="hh-label">(05) — Guests</Line>
        <p className="hh-section-note">What people tell us after dinner at 42 Rue McGill.</p>
      </header>
      <div className="hh-rule" />
      <div className="hh-quotes">
        {QUOTES.map((q, i) => (
          <figure key={q.author} className="hh-quote">
            <span className="hh-cap">({String(i + 1).padStart(2, '0')})</span>
            <blockquote>“{q.quote}”</blockquote>
            <figcaption><img src={q.avatar} alt="" />{q.author}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const menu = useDemo((s) => s.menu);
  const prep = useDemo((s) => s.settings.prepMinutes);
  return (
    <div className="hh">
      <Hero menu={menu} />
      <Products menu={menu} prep={prep} />
      <Manifesto />
      <Catalogue menu={menu} />
      <Guests />
    </div>
  );
}
