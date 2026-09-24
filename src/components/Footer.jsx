import { useState } from 'react';
import { Link } from 'react-router-dom';
import { openReserve } from './ReserveModal';
import '../home/home.css';

// Footer con la estructura de Halden: newsletter + columnas de enlaces sobre el color de
// acento, franja de datos y el logotipo de Tulum a todo lo ancho como cierre.
export default function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <footer className="hh-footer site-footer">
      <div className="hh-footer-top">
        <div className="hh-footer-news">
          <h2>Tacos, events and a little tequila,<br />a few emails a year</h2>
          {sent ? (
            <p className="hh-footer-thanks">Gracias — you're on the list.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="hh-footer-form">
              <label htmlFor="ft-email" className="hh-visually-hidden">Email</label>
              <input id="ft-email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit">Sign me up</button>
            </form>
          )}
        </div>

        <nav className="hh-footer-cols" aria-label="Footer">
          <div>
            <p>Order</p>
            <Link to="/menu">Menu</Link>
            <Link to="/checkout">Checkout</Link>
            <Link to="/account">Rewards</Link>
          </div>
          <div>
            <p>Visit</p>
            <button type="button" onClick={openReserve}>Reserve a table</button>
            <a href="https://maps.google.com/?q=42+Rue+McGill+Montreal" target="_blank" rel="noreferrer">42 Rue McGill</a>
            <span>Tue – Sun · 12 h – 23 h</span>
          </div>
          <div>
            <p>Contact</p>
            <a href="tel:+15141234567">(514) 123-4567</a>
            <a href="mailto:bonjour@tulummontreal.ca">bonjour@tulummontreal.ca</a>
            <a href="https://instagram.com/tulummontreal" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </nav>
      </div>

      <div className="hh-footer-meta">
        <div>
          <p>Tulum Tequila &amp; Tacos · 42 Rue McGill, Montréal H2Y 3W5</p>
          <p>© 2026 · Made in Montréal, with salsa verde on everything</p>
        </div>
        <div className="hh-footer-meta-links">
          <Link to="/admin">Staff login</Link>
          <span>·</span>
          <a href="#">Privacy</a>
          <span>·</span>
          <a href="#">Terms</a>
        </div>
      </div>

      <img className="hh-footer-mark" src="/brand/logotipo-tulum.svg" alt="Tulum" />
    </footer>
  );
}
