import { useState } from 'react';
import { RESERVATION_LABELS, setReservationStatus, useDemo } from '../demo/store';
import { niceDate, todayIso } from '../demo/format';
import { AdminHeader } from './AdminLayout';
import { openReserve } from '../components/ReserveModal';
import Icon from '../demo/icons';

export default function Reservations() {
  const reservations = useDemo((s) => s.reservations);
  const [filter, setFilter] = useState('upcoming');
  const today = todayIso();

  const list = reservations
    .filter((r) => (filter === 'upcoming' ? r.date >= today && r.status !== 'cancelled' : filter === 'today' ? r.date === today : true))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const tonight = reservations.filter((r) => r.date === today && r.status !== 'cancelled');
  const guests = tonight.reduce((s, r) => s + r.party, 0);
  const pending = reservations.filter((r) => r.status === 'pending').length;

  return (
    <>
      <AdminHeader title="Reservations" subtitle="Confirm bookings and seat guests when they arrive.">
        <button className="tl-btn tl-btn-primary tl-btn-sm" onClick={openReserve}><Icon name="plus" size={16} /> New reservation</button>
      </AdminHeader>

      <div className="adm-kpis">
        <div className="adm-kpi"><div className="adm-kpi-top">Today<Icon name="calendar" size={18} /></div><strong>{tonight.length}</strong><small>bookings</small></div>
        <div className="adm-kpi"><div className="adm-kpi-top">Guests today<Icon name="users" size={18} /></div><strong>{guests}</strong></div>
        <div className="adm-kpi"><div className="adm-kpi-top">To confirm<Icon name="bell" size={18} /></div><strong>{pending}</strong></div>
        <div className="adm-kpi"><div className="adm-kpi-top">All time<Icon name="chart" size={18} /></div><strong>{reservations.length}</strong></div>
      </div>

      <section className="adm-panel">
        <div className="adm-filters">
          <div className="tl-seg">
            {[['upcoming', 'Upcoming'], ['today', 'Today'], ['all', 'All']].map(([k, l]) => (
              <button key={k} className={filter === k ? 'is-on' : ''} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Guest</th><th>When</th><th className="adm-num">Party</th><th>Request</th><th>Status</th><th /></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td><div className="adm-person"><div><p>{r.name}</p><span>{r.phone} · {r.id}</span></div></div></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.date === today ? 'Today' : niceDate(r.date)} · <strong>{r.time}</strong></td>
                  <td className="adm-num">{r.party}</td>
                  <td className="tl-muted" style={{ maxWidth: 220 }}>{r.notes || '—'}</td>
                  <td><span className={`tl-pill tl-pill-${r.status}`}>{RESERVATION_LABELS[r.status]}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {r.status === 'pending' && <button className="tl-btn tl-btn-primary tl-btn-sm" onClick={() => setReservationStatus(r.id, 'confirmed')}>Confirm</button>}
                      {r.status === 'confirmed' && <button className="tl-btn tl-btn-ghost tl-btn-sm" onClick={() => setReservationStatus(r.id, 'seated')}>Seat</button>}
                      {['pending', 'confirmed'].includes(r.status) && (
                        <button className="tl-icon-btn" style={{ width: 34, height: 34 }} aria-label={`Cancel ${r.id}`} onClick={() => setReservationStatus(r.id, 'cancelled')}><Icon name="close" size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="adm-col-empty">No reservations here.</p>}
        </div>
      </section>
    </>
  );
}
