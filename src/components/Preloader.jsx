import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// Loader "visor" traído de la plantilla Halden (views/home/motion/preloader.tsx),
// reescrito con GSAP en lugar de react-spring.
//
// El marco es la barra de progreso: sus cuatro esquinas crecen por los bordes a medida
// que las fotos del hero terminan de decodificar, y al 100 % se juntan y cierran el
// rectángulo. Dentro, cada foto aparece cuando de verdad terminó de cargar (nada de
// temporizadores fingiendo carga). Después se abre como obturador: las esquinas vuelven
// a ser marcas, salen más allá de los bordes y se llevan el velo con ellas.

const FRAME_W = 460;
const FRAME_RATIO = 288 / 460;
const FRAME_MIN = 240;
const FRAME_SHARE = 0.32;
const TICK = 15;
const STEP_MS = 150;
const MIN_MS = 900;
const MAX_MS = 7000;

// Las mismas fotos que esperan en la primera pantalla
const SHOTS = ['/covers/desktop/1.webp', '/covers/desktop/2.webp', '/covers/desktop/3.webp', '/covers/desktop/4.webp'];

const CORNERS = [
  { key: 'tl', style: { left: 0, top: 0, borderLeftWidth: 1.4, borderTopWidth: 1.4 } },
  { key: 'tr', style: { right: 0, top: 0, borderRightWidth: 1.4, borderTopWidth: 1.4 } },
  { key: 'bl', style: { left: 0, bottom: 0, borderLeftWidth: 1.4, borderBottomWidth: 1.4 } },
  { key: 'br', style: { right: 0, bottom: 0, borderRightWidth: 1.4, borderBottomWidth: 1.4 } },
];

const frameFor = (width) => {
  const w = Math.round(Math.max(FRAME_MIN, Math.min(width * FRAME_SHARE, FRAME_W)));
  return { w, h: Math.round(w * FRAME_RATIO) };
};

// Solo en la primera carga completa de la página, no al navegar de vuelta al home
let hasRun = false;

export default function Preloader() {
  const [done, setDone] = useState(hasRun);
  const [shown, setShown] = useState(0);
  const veilRef = useRef(null);
  const frameRef = useRef(null);
  const contentRef = useRef(null);
  const labelRef = useRef(null);
  const pctRef = useRef(null);
  const cornerRefs = useRef([]);

  useEffect(() => {
    if (hasRun) return;
    document.getElementById('boot-veil')?.remove();

    const root = document.documentElement;
    root.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    // Estado que animan los tweens; render() lo vuelca al DOM sin re-renderizar React
    const s = { pct: 0, w: FRAME_W, h: FRAME_W * FRAME_RATIO, armX: TICK, armY: TICK, content: 0, veil: 1, frame: 1 };
    const render = () => {
      if (!frameRef.current) return;
      Object.assign(frameRef.current.style, { width: `${s.w}px`, height: `${s.h}px`, opacity: s.frame });
      veilRef.current.style.opacity = s.veil;
      contentRef.current.style.opacity = s.content;
      labelRef.current.style.opacity = s.content;
      pctRef.current.textContent = `${Math.min(100, Math.max(0, Math.round(s.pct)))}%`;
      cornerRefs.current.forEach((c) => { c.style.width = `${s.armX}px`; c.style.height = `${s.armY}px`; });
    };
    const to = (vars, opts = {}) => gsap.to(s, { ...vars, duration: 0.6, ease: 'power3.out', overwrite: 'auto', onUpdate: render, ...opts });

    let frame = frameFor(window.innerWidth);
    Object.assign(s, { w: frame.w, h: frame.h });
    render();
    to({ content: 1 });

    let finished = false;
    const onResize = () => {
      frame = frameFor(window.innerWidth);
      if (!finished) to({ w: frame.w, h: frame.h });
    };
    window.addEventListener('resize', onResize);

    // Progreso real: cada foto + las fuentes cuentan como una unidad
    const UNITS = SHOTS.length + 1;
    let fontsReady = false;
    document.fonts?.ready.then(() => { fontsReady = true; });
    if (!document.fonts) fontsReady = true;

    let arrived = 0;
    SHOTS.forEach((src) => {
      const img = new Image();
      img.src = src;
      const mark = () => { arrived += 1; };
      (img.decode ? img.decode() : Promise.reject()).then(mark, mark);
    });

    let released = 0;
    let last = 0;
    const started = performance.now();
    const timers = [];

    const finish = () => {
      finished = true;
      // El marco cerrado se "ajusta" una vez, con un pequeño rebote
      const snapW = frame.w - Math.round(frame.w * 0.048);
      const snapH = frame.h - Math.round(frame.h * 0.049);
      to({ pct: 100, duration: 0.35 });
      to({ w: snapW, h: snapH, armX: snapW / 2, armY: snapH / 2 }, { duration: 0.45, ease: 'back.out(2.2)' });
      timers.push(setTimeout(() => {
        // Se suelta: los rieles vuelven a ser marcas y la foto se va
        to({ content: 0, armX: TICK, armY: TICK }, { duration: 0.5, ease: 'power2.inOut' });
      }, 300));
      timers.push(setTimeout(() => {
        // Se abre: las marcas salen más allá de los bordes y se llevan el velo
        to({ w: window.innerWidth * 1.6, h: window.innerHeight * 1.6 }, { duration: 1, ease: 'power3.inOut' });
        to({ veil: 0 }, { duration: 0.75, ease: 'power2.inOut' });
        to({ frame: 0 }, { duration: 0.45, delay: 0.42, ease: 'power2.out' });
      }, 520));
      timers.push(setTimeout(() => {
        root.style.overflow = '';
        hasRun = true;
        window.dispatchEvent(new Event('tulum:ready'));
        setDone(true);
      }, 1420));
    };

    const tick = setInterval(() => {
      const now = performance.now();
      if (!finished && released < arrived && now - last >= STEP_MS) {
        released += 1;
        last = now;
        setShown(released);
      }
      const p = (released + (fontsReady ? 1 : 0)) / UNITS;
      to({ pct: p * 100, armX: TICK + (frame.w / 2 - TICK) * p, armY: TICK + (frame.h / 2 - TICK) * p });
      const elapsed = now - started;
      const ready = released === SHOTS.length && fontsReady && elapsed >= MIN_MS;
      if (!finished && (ready || elapsed >= MAX_MS)) {
        clearInterval(tick);
        finish();
      }
    }, 40);

    return () => {
      clearInterval(tick);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', onResize);
      gsap.killTweensOf(s);
      root.style.overflow = '';
    };
  }, []);

  if (done) return null;

  return (
    <div className="tl-preloader" role="status" aria-live="polite" aria-label="Loading Tulum">
      <div ref={veilRef} className="tl-preloader-veil" aria-hidden="true" />
      <div ref={frameRef} className="tl-preloader-frame" aria-hidden="true">
        <div ref={contentRef} className="tl-preloader-shots">
          {SHOTS.map((src, i) => (
            <img key={src} src={src} alt="" className={i === shown - 1 ? 'is-on' : ''} />
          ))}
        </div>
        {CORNERS.map((c, i) => (
          <span key={c.key} ref={(el) => { cornerRefs.current[i] = el; }} className="tl-preloader-corner" style={c.style} />
        ))}
        <div ref={labelRef} className="tl-preloader-label">
          <img src="/brand/logotipo-tulum.svg" alt="" />
          <span ref={pctRef}>0%</span>
        </div>
      </div>
    </div>
  );
}
