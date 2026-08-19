import { useRef, useLayoutEffect, useEffect } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import Newsletter from '../components/Newsletter';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--azul-distrito)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    titulo: 'Fresh Ingredients',
    texto: 'Sourced daily, never compromised. Authentic taste in every bite.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--rosa-neon)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M8 12s1.5 2 4 2 4-2 4-2" />
      </svg>
    ),
    titulo: 'Authentic Recipes',
    texto: 'Passed down through generations. Real Mexican flavors.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--selva)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    titulo: 'Tulum Vibes',
    texto: 'Experience the magic of the Riviera Maya right at your table.',
  },
];

// ─── Sección puente: Vino → Crema ─────────────────────────────────────────────
function TransitionBridge() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 60%', 'end start'],
  });

  const bgColor   = useTransform(scrollYProgress, [0, 1],              ['#600304', '#FBEDE0']);
  const textColor = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], ['#FBEDE0', '#FBEDE0', '#600304', '#600304']);
  const textSoft  = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], [
    'rgba(251,237,224,0.7)', 'rgba(251,237,224,0.7)',
    'rgba(96,3,4,0.65)',     'rgba(96,3,4,0.65)',
  ]);

  return (
    <motion.section
      ref={ref}
      style={{
        padding: 'clamp(48px, 8vw, 96px) 20px',
        position: 'relative',
        zIndex: 1,
        backgroundColor: bgColor,
      }}
    >
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'clamp(28px, 4vw, 48px)',
        }}
      >
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.titulo}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div style={{
              color: 'var(--rosa-neon)',
              width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(237, 74, 155, 0.12)',
              borderRadius: '10px',
            }}>{f.icon}</div>
            <motion.h3 style={{
              fontSize: '17px', color: textColor,
              fontFamily: 'var(--font)', fontWeight: 600,
              margin: 0,
            }}>{f.titulo}</motion.h3>
            <motion.p style={{
              fontSize: '14px', color: textSoft,
              lineHeight: 1.65, fontFamily: 'var(--font)', margin: 0,
            }}>{f.texto}</motion.p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Home ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const mwgHeroRootRef      = useRef(null);
  const mwgHeroPinHeightRef = useRef(null);
  const mwgHeroContainerRef = useRef(null);
  const historyTitleRef     = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── MWG 050: Hero ──
      mm.add('(min-width: 0px)', () => {
        const heroRoot      = mwgHeroRootRef.current;
        const heroPinHeight = mwgHeroPinHeightRef.current;
        const heroContainer = mwgHeroContainerRef.current;
        if (!heroRoot || !heroPinHeight || !heroContainer) return;

        const realImages = gsap.utils.toArray('.real-image', heroContainer);

        realImages.forEach((img, i) => gsap.set(img, { zIndex: i + 1, scale: 0 }));
        gsap.set(realImages[0], { scale: 1.005 });
        gsap.set(realImages[1], { scale: 0.25 });

        gsap.timeline({
          scrollTrigger: {
            trigger: heroPinHeight,
            start: 'top top',
            end: '+=4000',
            pin: heroContainer,
            scrub: 1.5,
          },
        }).to(realImages.slice(1), { scale: 1.005, ease: 'expo.inOut', duration: 8, stagger: 1.2 });
      });

      // ── Título historia con SplitType ──
      const animateTitle = (el) => {
        if (!el) return;
        const split = new SplitType(el, { types: 'words, chars' });
        gsap.set(split.words, { overflow: 'hidden', display: 'inline-flex', flexWrap: 'nowrap' });
        gsap.set(split.chars, { display: 'inline-block' });
        const shuffled = [...split.chars].sort(() => Math.random() - 0.5);
        gsap.from(shuffled, {
          y: '110%',
          ease: 'power4.out',
          duration: 0.8,
          stagger: 0.025,
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        });
      };

      animateTitle(historyTitleRef.current);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ background: '#600304' }}>

      {/* ── HERO MWG 050 ── */}
      <section ref={mwgHeroRootRef} className="mwg_effect050" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <div ref={mwgHeroPinHeightRef} className="pin-height" style={{ height: '400vh' }}>
          <div ref={mwgHeroContainerRef} className="mwg-container" style={{ position: 'relative', height: '100vh', width: '100%', display: 'block', zIndex: 1 }}>
            <picture className="real-image"><source media="(max-width: 768px)" srcSet="/covers/mobile/1.webp" /><img src="/covers/desktop/1.webp" alt="Tulum 1" /></picture>
            <picture className="real-image"><source media="(max-width: 768px)" srcSet="/covers/mobile/2.webp" /><img src="/covers/desktop/2.webp" alt="Tulum 2" /></picture>
            <picture className="real-image"><source media="(max-width: 768px)" srcSet="/covers/mobile/3.webp" /><img src="/covers/desktop/3.webp" alt="Tulum 3" /></picture>
            <picture className="real-image"><source media="(max-width: 768px)" srcSet="/covers/mobile/4.webp" /><img src="/covers/desktop/4.webp" alt="Tulum 4" /></picture>
          </div>
        </div>
      </section>

      {/* ── HISTORIA ── */}
      <section style={{ padding: 'clamp(80px, 10vw, 160px) 20px', textAlign: 'center', background: '#600304' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '14px', marginBottom: '16px', color: 'rgba(251,237,224,0.65)', fontFamily: 'var(--font)' }}>Our story</p>
          <h2 ref={historyTitleRef} style={{ color: '#FBEDE0', fontSize: 'clamp(32px, 7vw, 56px)', lineHeight: 1.05, marginBottom: '16px' }}>
            Salsa verde<br />
            <span style={{ color: 'var(--rosa-neon)', fontFamily: 'var(--font-accent)', fontWeight: 400 }}>on everything</span><br />
            That's the rule.
          </h2>
        </div>
      </section>

      {/* ── TRANSICIÓN VINO → CREMA ── */}
      <TransitionBridge />

      {/* ── NEWSLETTER ── */}
      <div style={{ background: '#FBEDE0', display: 'flex', justifyContent: 'center' }}>
        <Newsletter />
      </div>

    </div>
  );
}
