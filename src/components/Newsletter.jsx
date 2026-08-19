import { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { api } from '../api';

gsap.registerPlugin(ScrollTrigger);

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');
  
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const element = headlineRef.current;
      if (!element) return;

      const split = new SplitType(element, { types: 'words, chars' });
      
      gsap.set(split.words, { overflow: 'hidden', display: 'inline-flex' });
      
      const shuffleArray = (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      };

      const shuffledChars = shuffleArray(split.chars);
      
      gsap.from(shuffledChars, {
        y: '110%',
        ease: "power4.out",
        duration: 0.8,
        stagger: 0.025,
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse",
        }
      });

      const subtextEl = subtextRef.current;
      if (subtextEl) {
        const subtextSplit = new SplitType(subtextEl, { types: 'words' });
        gsap.from(subtextSplit.words, {
          opacity: 0,
          y: 15,
          stagger: 0.06,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: subtextEl,
            start: "top 90%",
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
    <section className="container" style={styles.section}>
      <p style={styles.eyebrow}>Join the family</p>
      <h2 ref={headlineRef} style={styles.headline}>Get 10% off your first visit</h2>
      <p ref={subtextRef} style={styles.subtext}>
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
  );
}

const styles = {
  section: {
    padding: 'clamp(64px, 12vw, 140px) 20px',
    textAlign: 'center',
    maxWidth: '560px',
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
    color: 'rgba(96, 3, 4, 0.65)',
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
