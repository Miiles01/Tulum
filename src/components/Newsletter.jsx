import { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../api';

gsap.registerPlugin(ScrollTrigger);

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');
  
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.from(containerRef.current.children, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          }
        });
      }
    });

    return () => ctx.revert();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await api.post('subscribe.php', { email });
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div style={{ padding: 'clamp(40px, 8vw, 100px) 20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <section ref={containerRef} style={styles.section}>
        <p style={styles.eyebrow}>Join the family</p>
        <h2 style={styles.headline}>Get 10% off your first visit</h2>
        <p style={styles.subtext}>
          Subscribe to be the first to know about new dishes, secret menus, and exclusive events.
        </p>

        {status === 'done' ? (
          <p style={styles.successMsg}>
            You're in. Show this code <strong>WELCOME10</strong> on your next visit.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <button className="btn btn-primary" disabled={status === 'loading'} style={styles.submitBtn}>
              {status === 'loading' ? 'Sending...' : 'Get my discount'}
            </button>
          </form>
        )}
        {status === 'error' && <p style={styles.errorMsg}>{error}</p>}
      </section>
    </div>
  );
}

const styles = {
  section: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: 'clamp(32px, 6vw, 56px) clamp(20px, 4vw, 40px)',
    textAlign: 'center',
    maxWidth: '560px',
    width: '100%',
    boxShadow: 'none',
  },
  eyebrow: {
    fontSize: '14px',
    color: 'rgba(96, 3, 4, 0.65)',
    marginBottom: '10px',
    textTransform: 'none',
    fontFamily: 'var(--font)',
  },
  headline: {
    fontSize: 'clamp(24px, 4vw, 34px)',
    marginBottom: '14px',
    color: '#600304',
  },
  subtext: {
    fontSize: '15px',
    color: 'rgba(96, 3, 4, 0.85)',
    lineHeight: 1.6,
    marginBottom: '28px',
    fontFamily: 'var(--font)',
  },
  form: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  input: {
    flex: '1 1 240px',
    padding: '15px 18px',
    borderRadius: '999px',
    border: '1px solid rgba(96, 3, 4, 0.2)',
    background: '#FBEDE0',
    color: '#600304',
    fontSize: '15px',
  },
  submitBtn: {
    borderRadius: '999px',
    padding: '15px 28px',
    whiteSpace: 'nowrap',
  },
  successMsg: {
    fontSize: '15px',
    color: '#600304',
    lineHeight: 1.6,
    background: '#FBEDE0',
    border: '1px solid rgba(96, 3, 4, 0.2)',
    borderRadius: '12px',
    padding: '18px 20px',
  },
  errorMsg: {
    fontSize: '13px',
    color: 'var(--danger)',
    marginTop: '12px',
  },
};
