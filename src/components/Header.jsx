import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './MossMenu.css';
import { useCart } from '../context/CartContext';
import { useCurrentCustomer } from '../demo/store';
import { openReserve } from './ReserveModal';
import Icon from '../demo/icons';
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import SocialLinks from './SocialLinks';

export default function Header() {
  const { count, setDrawerOpen } = useCart();
  const customer = useCurrentCustomer();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollY } = useScroll();

  useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
      if (!menuOpen) return;
      const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
      if (menuOpen) {
          document.body.style.overflow = "hidden";
      } else {
          document.body.style.overflow = "";
      }
      return () => {
          document.body.style.overflow = "";
      };
  }, [menuOpen]);

  // Framer Motion Transforms
  const widthRange = useTransform(scrollY, [0, 100], ["100%", "50%"]);
  const mobileWidthRange = useTransform(scrollY, [0, 100], ["100%", "96%"]);
  const borderRadiusRange = useTransform(scrollY, [0, 100], [0, 50]);
  const topRange = useTransform(scrollY, [0, 100], [0, 20]);
  
  // Fondo de transparente a Obsidiana sólida al hacer scroll: solo en el home, donde el header
  // se monta sobre el hero oscuro. En el resto de páginas (algunas con fondo blanco, ej. /productos)
  // el header es siempre sólido para no perder contraste con los íconos.
  const bgOpacityBase = useTransform(scrollY, [0, 50], [0, 1]);

  const springConfig = { stiffness: 400, damping: 40 };
  const animatedDesktopWidth = useSpring(widthRange, springConfig);
  const animatedMobileWidth = useSpring(mobileWidthRange, springConfig);
  const animatedRadius = useSpring(borderRadiusRange, springConfig);
  const animatedTop = useSpring(topRange, springConfig);

  const backgroundColor = useTransform(bgOpacityBase, (o) => `rgba(251, 237, 224, ${isHome ? o : 1})`);
  const backdropFilter = "none";
  const logoFilter = "none";
  const logoOpacityHome = useTransform(scrollY, [0, 100], [0, 1]);
  const logoOpacity = isHome ? logoOpacityHome : 1;

  const handleScroll = (selector) => {
    setMenuOpen(false);
    if (!isHome) {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.querySelector(selector);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.header
        className={menuOpen ? 'moss-header-open' : ''}
        style={{
            width: isMobile ? animatedMobileWidth : animatedDesktopWidth,
            borderRadius: animatedRadius,
            top: animatedTop,
            backgroundColor,
            backdropFilter,
            borderColor: 'transparent',
            position: 'fixed',
            left: '50%',
            x: '-50%',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            overflow: 'hidden', // Para contener el fondo blanco
        }}
        transition={{ duration: 0.3 }}
      >

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className={`moss-burger ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span><span></span>
        </button>
        {/* Logo (fade in al hacer scroll) */}
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', alignItems: 'center', zIndex: 1 }} aria-label="Home">
          <motion.img
            src="/brand/logotipo-tulum.svg"
            alt="Tulum"
            style={{ height: '36px', marginLeft: '12px', opacity: logoOpacity }}
            animate={{ filter: logoFilter }}
            transition={{ duration: 0.3 }}
          />
        </Link>
        </div>

        <div className="tl-head-actions">
          <button className="tl-head-pill is-white hide-mobile" onClick={openReserve}>Reserve</button>
          <button className="tl-head-icon" aria-label={customer ? `My account (${customer.points} points)` : 'Sign in'} onClick={() => navigate('/account')}>
            <Icon name="user" />
          </button>
          <button className="tl-head-icon" aria-label={`Your order, ${count} items`} onClick={() => setDrawerOpen(true)}>
            <Icon name="bag" />
            {count > 0 && <span className="tl-badge-count">{count}</span>}
          </button>
          <button className="tl-head-pill is-wine" onClick={() => navigate('/menu')}>Order</button>
        </div>
      </motion.header>

      {/* Menú desplegable: panel que cubre la mitad de la pantalla, no fullscreen */}
      <div className={menuOpen ? 'moss-open' : ''}>
        <div className="moss-overlay" onClick={() => setMenuOpen(false)}></div>
        <nav className="moss-panel" aria-hidden={!menuOpen}>
          <ul className="moss-links">
            <MossMenuItem to="/" onClick={() => { setMenuOpen(false); handleScroll('body'); }} label="Home" index={0} />
            <MossMenuItem onClick={() => handleScroll('#menu')} label="Menu" index={1} />
            <MossMenuItem to="/menu" onClick={() => setMenuOpen(false)} label="Order online" index={2} />
            <MossMenuItem onClick={() => handleScroll('#about-us')} label="About us" index={3} />
            <MossMenuItem onClick={() => { setMenuOpen(false); openReserve(); }} label="Reserve" index={4} />
            <MossMenuItem to="/account" onClick={() => setMenuOpen(false)} label={customer ? 'My rewards' : 'Sign in'} index={5} />
          </ul>
          
          <div className="moss-legal">
            <a href="#" className="moss-legal-link">Privacy Policy</a>
            <a href="#" className="moss-legal-link">Terms & Conditions</a>
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="moss-legal-link">Staff login</Link>
          </div>
          
          <div className="moss-social">
            <SocialLinks containerStyle={{ display: 'flex', gap: '16px' }} linkStyle={{ color: '#FBEDE0' }} />
          </div>
        </nav>
      </div>
    </>
  );
}

function MossMenuItem({ to, onClick, label, index }) {
  const band = (
    <span className="moss-band">
      <span className="moss-track">
        {Array.from({ length: 8 }, (_, i) => <span key={i}>{label}</span>)}
      </span>
    </span>
  );
  
  if (to) {
    return (
      <li>
        <Link to={to} className="moss-item" style={{ '--i': index }} onClick={onClick}>
          {label}
          {band}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <a href="#" className="moss-item" style={{ '--i': index }} onClick={(e) => { e.preventDefault(); if (onClick) onClick(); }}>
        {label}
        {band}
      </a>
    </li>
  );
}
