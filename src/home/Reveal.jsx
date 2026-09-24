import { useEffect, useRef, useState } from 'react';

// Lenguaje de movimiento de Halden: el texto sale de debajo de su propia máscara y las
// fotos se destapan de abajo hacia arriba. Todo lo de la primera pantalla espera a que
// el preloader se abra ("tulum:ready") para que la entrada se vea y no ocurra detrás del velo.

function usePageReady() {
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && window.__tulumReady === true);
  useEffect(() => {
    if (ready) return;
    const on = () => setReady(true);
    window.addEventListener('tulum:ready', on, { once: true });
    return () => window.removeEventListener('tulum:ready', on);
  }, [ready]);
  return ready;
}

export function useInViewOnce(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const ready = usePageReady();
  useEffect(() => {
    if (!ready || inView) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); io.disconnect(); }
    }, { rootMargin: options.margin || '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [ready, inView, options.margin]);
  return [ref, inView];
}

/** Una línea que sube desde debajo de su máscara. */
export function Line({ children, delay = 0, as: Tag = 'span', className = '', style }) {
  const [ref, inView] = useInViewOnce();
  return (
    <Tag ref={ref} className={`hh-line ${inView ? 'is-in' : ''} ${className}`} style={{ '--d': `${delay}ms`, ...style }}>
      <span className="hh-line-inner">{children}</span>
    </Tag>
  );
}

/** Foto en placa que se destapa de abajo hacia arriba. */
export function Plate({ src, alt = '', delay = 0, className = '', fit = 'cover', position = 'center', paper = false }) {
  const [ref, inView] = useInViewOnce();
  return (
    <div ref={ref} className={`hh-plate ${paper ? 'is-paper' : ''} ${inView ? 'is-in' : ''} ${className}`} style={{ '--d': `${delay}ms` }}>
      <div className="hh-plate-inner">
        <img src={src} alt={alt} loading="lazy" style={{ objectFit: fit, objectPosition: position }} />
      </div>
    </div>
  );
}

/** Párrafo que entra palabra por palabra (manifiesto). Los nodos no-texto entran como una "palabra". */
export function Words({ parts, className = '', stagger = 28, as: Tag = 'p' }) {
  const [ref, inView] = useInViewOnce({ margin: '0px 0px -15% 0px' });
  let i = 0;
  const out = [];
  parts.forEach((part, pi) => {
    if (typeof part === 'string') {
      part.split(/(\s+)/).forEach((w, wi) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { out.push(' '); return; }
        out.push(
          <span key={`${pi}-${wi}`} className="hh-word"><span style={{ '--d': `${i++ * stagger}ms` }}>{w}</span></span>,
        );
      });
    } else {
      out.push(<span key={`n-${pi}`} className="hh-word is-node"><span style={{ '--d': `${i++ * stagger}ms` }}>{part}</span></span>);
    }
  });
  return <Tag ref={ref} className={`hh-words ${inView ? 'is-in' : ''} ${className}`}>{out}</Tag>;
}
