import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutAdmin, resetDemo, updateSettings, useDemo } from '../demo/store';
import { initials } from '../demo/format';
import { AdminHeader } from './AdminLayout';
import Icon from '../demo/icons';

const ROLES = ['Owner', 'Manager', 'Kitchen', 'Front of house'];

export default function Settings() {
  const settings = useDemo((s) => s.settings);
  const navigate = useNavigate();
  const [member, setMember] = useState({ name: '', email: '', role: 'Kitchen' });

  const toggle = (k) => updateSettings({ [k]: !settings[k] });

  return (
    <>
      <AdminHeader title="Settings" subtitle="Restaurant operations and team access." />

      <div className="adm-grid-2">
        <section className="adm-panel">
          <div className="adm-panel-head"><h3>Operations</h3></div>
          <div className="adm-setting">
            <div><p>Accept online orders</p><span>Pause it when the kitchen is overloaded. The menu shows a notice.</span></div>
            <button className={`tl-switch ${settings.acceptingOrders ? 'is-on' : ''}`} role="switch" aria-checked={settings.acceptingOrders} aria-label="Accept online orders" onClick={() => toggle('acceptingOrders')} />
          </div>
          <div className="adm-setting">
            <div><p>Preparation time</p><span>Shown to customers on the menu and at checkout.</span></div>
            <select className="tl-select" style={{ width: 120 }} value={settings.prepMinutes} onChange={(e) => updateSettings({ prepMinutes: Number(e.target.value) })}>
              {[10, 15, 20, 25, 30, 45].map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>
          <div className="adm-setting">
            <div><p>Simulated kitchen</p><span>Demo helper: orders placed on the website move forward on their own every ~40 seconds.</span></div>
            <button className={`tl-switch ${settings.autoAdvance ? 'is-on' : ''}`} role="switch" aria-checked={settings.autoAdvance} aria-label="Simulated kitchen" onClick={() => toggle('autoAdvance')} />
          </div>
          <div className="adm-setting">
            <div><p>Taxes</p><span>{settings.taxes.map((t) => `${t.name} ${(t.rate * 100).toFixed(3).replace(/\.?0+$/, '')}%`).join(' · ')} (Québec)</span></div>
          </div>
        </section>

        <section className="adm-panel">
          <div className="adm-panel-head"><h3>Team</h3><span className="tl-muted tl-small">{settings.staff.length} people</span></div>
          {settings.staff.map((s, i) => (
            <div key={s.id} className="adm-setting">
              <div className="adm-person" style={{ flex: 1 }}>
                <div className={`adm-avatar ${i === 0 ? 'is-pink' : ''}`}>{initials(s.name)}</div>
                <div><p>{s.name}</p><span>{s.email}</span></div>
              </div>
              <span className="tl-pill">{s.role}</span>
              {i > 0 && (
                <button className="tl-icon-btn" style={{ width: 34, height: 34 }} aria-label={`Remove ${s.name}`} onClick={() => updateSettings({ staff: settings.staff.filter((x) => x.id !== s.id) })}>
                  <Icon name="trash" size={16} />
                </button>
              )}
            </div>
          ))}
          <form
            className="tl-stack-sm" style={{ marginTop: 16 }}
            onSubmit={(e) => { e.preventDefault(); updateSettings({ staff: [...settings.staff, { ...member, id: `st-${Date.now()}` }] }); setMember({ name: '', email: '', role: 'Kitchen' }); }}
          >
            <span className="tl-label">Invite a team member</span>
            <div className="tl-grid-2">
              <input className="tl-input" placeholder="Full name" value={member.name} onChange={(e) => setMember({ ...member, name: e.target.value })} required />
              <input className="tl-input" type="email" placeholder="Email" value={member.email} onChange={(e) => setMember({ ...member, email: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="tl-select" value={member.role} onChange={(e) => setMember({ ...member, role: e.target.value })}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
              <button className="tl-btn tl-btn-primary">Invite</button>
            </div>
          </form>
        </section>
      </div>

      <section className="adm-panel">
        <div className="adm-setting">
          <div><p>Reset the demo</p><span>Restores the original menu, customers, orders and reservations. Signs everyone out.</span></div>
          <button
            className="tl-btn tl-btn-ghost tl-btn-sm"
            onClick={() => {
              if (!window.confirm('Reset all demo data?')) return;
              resetDemo();
              logoutAdmin();
              navigate('/admin/login');
            }}
          >
            <Icon name="refresh" size={16} /> Reset data
          </button>
        </div>
      </section>
    </>
  );
}
