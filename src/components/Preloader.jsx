import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// Loader inicial traído de PC Auto (assets/js/main.js → PC.runPreloader):
// panel a pantalla completa en el color de marca, contador gigante 0 → 100 con una barra
// que crece abajo y, al terminar, el panel sube como cortina y deja ver la página.
// Solo una vez por sesión.

const SESSION_KEY = 'tulum-preloaded';

function alreadySeen() {
  try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
}

export default function Preloader() {
  const [done, setDone] = useState(alreadySeen);
  const rootRef = useRef(null);
  const countRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    document.getElementById('boot-veil')?.remove();
    if (done) {
      window.__tulumReady = true;
      window.dispatchEvent(new Event('tulum:ready'));
      return;
    }

    const html = document.documentElement;
    html.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    const finish = () => {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* storage bloqueado */ }
      html.style.overflow = '';
      window.__tulumReady = true;
      window.dispatchEvent(new Event('tulum:ready'));
      setDone(true);
    };

    const obj = { v: 0 };
    const tl = gsap.timeline({ onComplete: finish })
      .to(obj, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { countRef.current.textContent = Math.round(obj.v); } }, 0)
      .to(barRef.current, { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0)
      .add(() => { window.__tulumReady = true; window.dispatchEvent(new Event('tulum:ready')); }, 1.55)
      .to(rootRef.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 1.35);

    // Red de seguridad: si la pestaña no pinta (requestAnimationFrame en pausa), no bloquea la página
    const safety = setTimeout(() => { tl.progress(1); }, 4000);

    return () => {
      clearTimeout(safety);
      tl.kill();
      html.style.overflow = '';
    };
  }, [done]);

  if (done) return null;

  return (
    <div ref={rootRef} className="tl-preloader" aria-hidden="true">
      <span className="tl-preloader-label">Tulum — Tequila &amp; tacos · Montréal</span>
      <span ref={countRef} className="tl-preloader-count">0</span>
      <span ref={barRef} className="tl-preloader-bar" />
    </div>
  );
}
