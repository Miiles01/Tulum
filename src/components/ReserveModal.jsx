import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { addReservation, useCurrentCustomer } from '../demo/store';
import { randomPerson } from '../demo/seed';
import { niceDate, todayIso } from '../demo/format';
import Icon from '../demo/icons';

const TIMES = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

// Cualquier botón puede abrirlo con openReserve(); los enlaces viejos a "#reserve" también funcionan.
export const openReserve = () => window.dispatchEvent(new Event('tulum:reserve'));

export default function ReserveModal() {
  const customer = useCurrentCustomer();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const show = () => {
      const p = customer || randomPerson();
      setForm({ date: todayIso(1), time: '19:00', party: 2, name: p.name, email: p.email, phone: p.phone, notes: '' });
      setDone(null);
      setOpen(true);
    };
    const onHash = () => {
      if (window.location.hash === '#reserve') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        show();
      }
    };
    window.addEventListener('tulum:reserve', show);
    window.addEventListener('hashchange', onHash);
    onHash();
    return () => {
      window.removeEventListener('tulum:reserve', show);
      window.removeEventListener('hashchange', onHash);
    };
  }, [customer]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setDone(addReservation({ ...form, customerId: customer ? customer.id : null }));
  };

  return (
    <AnimatePresence>
      {open && form && (
        <motion.div className="tl-modal-wrap" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="tl-modal" role="dialog" aria-modal="true" aria-label="Reserve a table" data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {done ? (
              <div className="tl-success">
                <div className="tl-success-icon"><Icon name="check" size={32} /></div>
                <h2 style={{ fontSize: 30, fontWeight: 800 }}>See you soon, {done.name.split(' ')[0]}</h2>
                <p className="tl-muted">{niceDate(done.date)} at {done.time} · {done.party} guests</p>
                <span className="tl-code">{done.id}</span>
                <p className="tl-muted tl-small">We'll confirm by email. The team sees it right away in the admin panel.</p>
                <button className="tl-btn tl-btn-primary" onClick={() => setOpen(false)}>Done</button>
              </div>
            ) : (
              <form onSubmit={submit} className="tl-stack">
                <div className="tl-modal-head">
                  <div>
                    <p className="tl-eyebrow">Tulum · Montréal</p>
                    <h2>Reserve a table</h2>
                  </div>
                  <button type="button" className="tl-icon-btn" onClick={() => setOpen(false)} aria-label="Close"><Icon name="close" /></button>
                </div>

                <div className="tl-grid-2">
                  <div className="tl-field">
                    <label htmlFor="rd">Date</label>
                    <input id="rd" type="date" className="tl-input" min={todayIso()} value={form.date} onChange={set('date')} required />
                  </div>
                  <div className="tl-field">
                    <span className="tl-label">Guests</span>
                    <div className="tl-stepper">
                      <button type="button" aria-label="Fewer guests" onClick={() => setForm((f) => ({ ...f, party: Math.max(1, f.party - 1) }))}><Icon name="minus" size={16} /></button>
                      <span>{form.party} {form.party === 1 ? 'guest' : 'guests'}</span>
                      <button type="button" aria-label="More guests" onClick={() => setForm((f) => ({ ...f, party: Math.min(12, f.party + 1) }))}><Icon name="plus" size={16} /></button>
                    </div>
                  </div>
                </div>

                <div className="tl-field">
                  <span className="tl-label">Time</span>
                  <div className="tl-times">
                    {TIMES.map((t) => (
                      <button type="button" key={t} className={`tl-time ${form.time === t ? 'is-on' : ''}`} onClick={() => setForm((f) => ({ ...f, time: t }))}>{t}</button>
                    ))}
                  </div>
                </div>

                <div className="tl-field">
                  <label htmlFor="rn2">Name</label>
                  <input id="rn2" className="tl-input" value={form.name} onChange={set('name')} required />
                </div>
                <div className="tl-grid-2">
                  <div className="tl-field">
                    <label htmlFor="re2">Email</label>
                    <input id="re2" type="email" className="tl-input" value={form.email} onChange={set('email')} required />
                  </div>
                  <div className="tl-field">
                    <label htmlFor="rp2">Phone</label>
                    <input id="rp2" type="tel" className="tl-input" value={form.phone} onChange={set('phone')} required />
                  </div>
                </div>
                <div className="tl-field">
                  <label htmlFor="rno">Special request <span className="tl-muted">(optional)</span></label>
                  <input id="rno" className="tl-input" value={form.notes} onChange={set('notes')} placeholder="Birthday, high chair, terrace…" />
                </div>

                <button className="tl-btn tl-btn-primary tl-btn-block">Confirm reservation</button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
