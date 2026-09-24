import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useDemo } from '../demo/store';
import { CATEGORIES } from '../demo/seed';
import { money } from '../demo/format';
import { openReserve } from '../components/ReserveModal';
import Icon from '../demo/icons';
import { Line, Words, useInViewOnce } from '../home/Reveal';

gsap.registerPlugin(ScrollTrigger);
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

// ─── 01 · Hero (referencia: smokehouse-hero.html) ───────────────────────────
// Título gigante: arriba una palabra que rota dentro de su máscara (Mexican / Late-night),
// abajo "Kitchen" entra letra por letra y un sticker inclinado aparece al final.
const MAIN_WORD = 'Kitchen';

function Hero() {
  const [ref, inView] = useInViewOnce();
  return (
    <section className="hx-hero" aria-label="Tulum — Mexican late-night kitchen in Montréal">
      <h1 ref={ref} className={`hx-title ${inView ? 'is-in' : ''}`} aria-label="Mexican late-night kitchen">
        <span className="hx-line hx-rotator" aria-hidden="true">
          <span className="hx-heading">Mexican</span>
          <span className="hx-heading">Late-night</span>
        </span>
        <span className="hx-line hx-main" aria-hidden="true">
          <span className="hx-heading">
            {MAIN_WORD.split('').map((ch, i) => (
              <span key={i} className="hx-letter"><span style={{ '--i': i }}>{ch}</span></span>
            ))}
          </span>
          <span className="hx-sticker">Salsa verde on everything!</span>
        </span>
      </h1>

      <div className={`hx-actions ${inView ? 'is-in' : ''}`}>
        <button type="button" className="hx-btn-secondary" onClick={openReserve}><span>Reserve a table</span></button>
        <Link to="/menu" className="hx-btn-primary">
          <span>View menu</span>
          <span className="hx-btn-icon" aria-hidden="true">
            <Icon name="arrow" size={22} />
            <Icon name="arrow" size={22} />
          </span>
        </Link>
      </div>
    </section>
  );
}

// ─── 01b · Video que crece con el scroll (solo tablet y desktop) ─────────────
const VIDEO_LINE = 'Tulum is a late-night love letter to the Mexican coast, cooked every night on Rue McGill.';

function KitchenVideo() {
  const wrapRef = useRef(null);
  const boxRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  const [textIn, setTextIn] = useState(false);
  const [mobileRef, mobileIn] = useInViewOnce();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const on = () => setIsMobile(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useLayoutEffect(() => {
    if (isMobile) return;
    const ctx = gsap.context(() => {
      // Entra pequeño y centrado; mientras bajas se abre hasta casi cubrir la pantalla
      gsap.fromTo(boxRef.current,
        { clipPath: 'inset(24% 27% 24% 27% round 28px)' },
        {
          clipPath: 'inset(2.5% 1.6% 2.5% 1.6% round 18px)', ease: 'none',
          scrollTrigger: { trigger: wrapRef.current, start: 'top 85%', end: 'top top', scrub: 0.6 },
        });
      gsap.fromTo(boxRef.current.querySelector('video'), { scale: 1.25 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: wrapRef.current, start: 'top 85%', end: 'top top', scrub: 0.6 },
      });
      ScrollTrigger.create({
        trigger: wrapRef.current, start: 'top -15%',
        onEnter: () => setTextIn(true), onLeaveBack: () => setTextIn(false),
      });
    }, wrapRef);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('tulum:ready', refresh);
    return () => { ctx.revert(); window.removeEventListener('tulum:ready', refresh); };
  }, [isMobile]);

  // React no escribe el atributo "muted": sin él Chrome/Safari pueden bloquear el autoplay
  useEffect(() => {
    const v = boxRef.current?.querySelector('video');
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [isMobile]);

  const shown = isMobile ? mobileIn : textIn;
  const words = VIDEO_LINE.split(' ');

  return (
    <section ref={wrapRef} className="hx-video-scroll">
      <div className="hx-video-sticky">
        <div ref={boxRef} className="hx-video-box">
          <video
            key={isMobile ? 'sq' : 'wide'}
            src={isMobile ? '/brand/hero-kitchen-square.mp4' : '/brand/hero-kitchen.mp4'}
            poster={isMobile ? '/brand/hero-kitchen-square-poster.jpg' : '/brand/hero-kitchen-poster.jpg'}
            autoPlay muted loop playsInline preload="metadata"
            aria-label="Our cooks at work in the Tulum kitchen"
          />
          <h2 ref={mobileRef} className={`hx-video-heading ${shown ? 'is-in' : ''}`}>
            {words.map((w, i) => (
              <span key={i} className="hx-vword" style={{ transitionDelay: `${i * 60}ms` }}>{w}{' '}</span>
            ))}
          </h2>
        </div>
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
      <Hero />
      <KitchenVideo />
      <Products menu={menu} prep={prep} />
      <Manifesto />
      <Catalogue menu={menu} />
      <Guests />
    </div>
  );
}
