import re

content = '''import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { openReserve } from '../components/ReserveModal';
import Newsletter from '../components/Newsletter';

const heroProducts = [
  { id: 1, name: 'Fajitas', price: '$18', src: '/products/tulum/24.webp', top: '25%', left: '10%', width: '15vw', delay: 0.2 },
  { id: 2, name: 'Burrito', price: '$14', src: '/products/tulum/25.webp', top: '50%', left: '75%', width: '22vw', delay: 0.4 },
  { id: 3, name: 'Pizza Birria', price: '$22', src: '/products/tulum/26.webp', top: '65%', left: '25%', width: '28vw', delay: 0.6 },
];

function LineReveal({ children, delay = 0, style, className }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <div ref={ref} style={{ overflow: 'hidden', display: 'inline-block', ...style }} className={className}>
      <motion.div
        initial={{ y: '100%' }}
        animate={isInView ? { y: 0 } : { y: '100%' }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ImageReveal({ src, delay = 0, style }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <div ref={ref} style={{ overflow: 'hidden', ...style }}>
      <motion.img
        src={src}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 1.2, opacity: 0 }}
        transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);

  return (
    <div style={{ background: '#FBEDE0', color: '#600304', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ── HERO (Halden Style) ── */}
      <section style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', paddingTop: '100px' }}>
        <motion.div style={{ y: heroY, width: '100%', height: '100%', position: 'relative' }}>
          
          <div style={{ position: 'absolute', top: '8%', left: '60%', width: '15vw', height: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <ImageReveal src="/products/tulum/28.webp" delay={0.2} style={{ width: '100%', aspectRatio: '4/5', borderRadius: '16px' }} />
          </div>

          {heroProducts.map((p, i) => (
            <div key={p.id} className="hide-mobile" style={{ position: 'absolute', top: p.top, left: p.left, width: p.width, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'var(--font)', opacity: 0.8 }}>
                <LineReveal delay={p.delay + 0.2}>{p.name}</LineReveal>
                <LineReveal delay={p.delay + 0.3}>{p.price}</LineReveal>
              </div>
              <ImageReveal src={p.src} delay={p.delay} style={{ width: '100%', aspectRatio: '1', borderRadius: '24px', mixBlendMode: 'multiply' }} />
            </div>
          ))}

          <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 10, width: '90%' }}>
            <h1 style={{ fontSize: 'clamp(48px, 10vw, 120px)', fontFamily: 'var(--font-display)', lineHeight: 0.9, letterSpacing: '-0.02em', margin: 0 }}>
              <LineReveal delay={0.1}>Authentic</LineReveal><br/>
              <LineReveal delay={0.2}><span style={{ color: 'var(--rosa-neon)', fontStyle: 'italic' }}>Tulum</span></LineReveal><br/>
              <LineReveal delay={0.3}>flavors</LineReveal>
            </h1>
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
               <Link to="/menu" className="tl-btn tl-btn-primary" style={{ padding: '16px 32px', borderRadius: '999px', fontSize: '15px' }}>Order Online</Link>
               <button onClick={openReserve} style={{ padding: '16px 32px', borderRadius: '999px', fontSize: '15px', background: 'transparent', border: '1px solid rgba(96,3,4,0.2)', color: '#600304', cursor: 'pointer' }}>Reserve a table</button>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '40px', left: '40px' }}>
            <LineReveal delay={0.8} style={{ fontSize: '13px', fontFamily: 'var(--font)', fontWeight: 600, letterSpacing: '0.05em' }}>
              WELCOME TO TULUM – FRESH INGREDIENTS, MADE TO LAST.
            </LineReveal>
          </div>
        </motion.div>
      </section>

      {/* ── MANIFESTO (Halden Style) ── */}
      <section style={{ padding: 'clamp(120px, 15vw, 200px) 20px', background: '#600304', color: '#FBEDE0', textAlign: 'center', position: 'relative' }}>
         <LineReveal delay={0.1} style={{ position: 'absolute', top: '40px', left: '40px', fontSize: '14px', opacity: 0.7 }}>(01) — Manifesto</LineReveal>
         
         <div style={{ maxWidth: '1100px', margin: '0 auto', fontSize: 'clamp(32px, 5vw, 64px)', fontFamily: 'var(--font-display)', lineHeight: 1.15, fontWeight: 500 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 'clamp(8px, 2vw, 20px)' }}>
              <LineReveal delay={0.1}>Salsa verde on everything,</LineReveal>
              <div style={{ width: 'clamp(60px, 10vw, 120px)', height: 'clamp(40px, 6vw, 80px)', borderRadius: '100px', overflow: 'hidden', display: 'inline-block', verticalAlign: 'middle' }}>
                <ImageReveal src="/products/tulum/24.webp" delay={0.3} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <LineReveal delay={0.2}><span style={{ fontStyle: 'italic', color: 'var(--rosa-neon)' }}>that's the rule</span> —</LineReveal>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 'clamp(8px, 2vw, 20px)', marginTop: '8px' }}>
              <LineReveal delay={0.3}>flavors that belong</LineReveal>
              <div style={{ width: 'clamp(60px, 10vw, 120px)', height: 'clamp(40px, 6vw, 80px)', borderRadius: '100px', overflow: 'hidden', display: 'inline-block', verticalAlign: 'middle' }}>
                <ImageReveal src="/products/tulum/27.webp" delay={0.5} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <LineReveal delay={0.4}>in your everyday,</LineReveal>
            </div>

            <div style={{ marginTop: '8px' }}>
               <LineReveal delay={0.5}>and stay with you for years to come.</LineReveal>
            </div>
         </div>
      </section>

      {/* ── CATALOGUE (Halden Style Grid) ── */}
      <section style={{ padding: 'clamp(80px, 10vw, 160px) 40px', background: '#FBEDE0' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px', flexWrap: 'wrap', gap: '40px' }}>
           <LineReveal delay={0.1} style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>(02) — Catalogue</LineReveal>
           <LineReveal delay={0.2} style={{ maxWidth: '400px', fontSize: '15px', lineHeight: 1.5, opacity: 0.8 }}>
             Nine categories, and that's the whole menu. No shortcuts, no compromises. If it isn't on this list, we don't make it.
           </LineReveal>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            {[
              { id: 1, title: 'Tacos', img: '/products/tulum/24.webp' },
              { id: 2, title: 'Ceviche', img: '/products/tulum/26.webp' },
              { id: 3, title: 'Enchiladas', img: '/products/tulum/27.webp' },
              { id: 4, title: 'Margaritas', img: '/products/tulum/28.webp' }
            ].map((cat, i) => (
              <Link to="/menu" key={cat.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', background: '#fff' }}>
                   <ImageReveal src={cat.img} delay={0.1 * i} style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply' }} />
                </div>
                <LineReveal delay={0.2 + (0.1*i)} style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{cat.title}</LineReveal>
              </Link>
            ))}
         </div>
      </section>

      {/* ── ABOUT VIDEO ── */}
      <section style={{ padding: '0 40px clamp(80px, 10vw, 160px)', background: '#FBEDE0' }}>
         <LineReveal delay={0.1} style={{ fontSize: '14px', opacity: 0.7, marginBottom: '40px' }}>(03) — The Experience</LineReveal>
         <div style={{ width: '100%', borderRadius: '24px', overflow: 'hidden', height: '70vh', position: 'relative' }}>
            <video src="/brand/about-video.mp4" autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
         </div>
      </section>
      
      <div style={{ background: '#FBEDE0', display: 'flex', justifyContent: 'center' }}>
        <Newsletter />
      </div>

    </div>
  );
}
'''

with open('src/pages/Home.jsx', 'w') as f:
    f.write(content)
