import { useState } from 'react';
import { addReward, deleteReward, tierFor, updateLoyalty, updateReward, useDemo } from '../demo/store';
import { money } from '../demo/format';
import { AdminHeader } from './AdminLayout';
import Icon from '../demo/icons';

function NumberField({ id, label, value, onCommit, suffix }) {
  const [v, setV] = useState(String(value));
  return (
    <div className="tl-field">
      <label htmlFor={id}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input id={id} className="tl-input" inputMode="decimal" value={v} onChange={(e) => setV(e.target.value)}
          onBlur={() => { const n = parseFloat(v); if (!Number.isNaN(n) && n >= 0) onCommit(n); else setV(String(value)); }} />
        {suffix && <span className="tl-muted tl-small" style={{ whiteSpace: 'nowrap' }}>{suffix}</span>}
      </div>
    </div>
  );
}

export default function Loyalty() {
  const loyalty = useDemo((s) => s.loyalty);
  const customers = useDemo((s) => s.customers);
  const ledger = useDemo((s) => s.ledger);
  const [draft, setDraft] = useState({ name: '', cost: 100, value: 8 });

  const outstanding = customers.reduce((s, c) => s + c.points, 0);
  const redeemed = ledger.filter((l) => l.delta < 0).reduce((s, l) => s - l.delta, 0);
  const tierCount = (t) => customers.filter((c) => tierFor(c.lifetime, loyalty.tiers).current.name === t.name).length;

  const setTier = (i, patch) => updateLoyalty({ tiers: loyalty.tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)) });

  return (
    <>
      <AdminHeader title="Loyalty program" subtitle="Decide how customers earn points and what they can trade them for." />

      <div className="adm-kpis">
        <div className="adm-kpi"><div className="adm-kpi-top">Members<Icon name="users" size={18} /></div><strong>{customers.length}</strong></div>
        <div className="adm-kpi"><div className="adm-kpi-top">Points outstanding<Icon name="star" size={18} /></div><strong>{outstanding.toLocaleString('en-CA')}</strong></div>
        <div className="adm-kpi"><div className="adm-kpi-top">Points redeemed<Icon name="gift" size={18} /></div><strong>{redeemed.toLocaleString('en-CA')}</strong></div>
        <div className="adm-kpi"><div className="adm-kpi-top">Active rewards<Icon name="heart" size={18} /></div><strong>{loyalty.rewards.filter((r) => r.active).length}</strong></div>
      </div>

      <div className="adm-grid-2">
        <section className="adm-panel">
          <div className="adm-panel-head"><h3>Rewards catalogue</h3></div>
          {loyalty.rewards.map((r) => (
            <div key={r.id} className="adm-menu-row">
              <div className="adm-menu-thumb"><Icon name="gift" size={20} /></div>
              <div className="adm-menu-info"><p>{r.name}</p><span>{r.cost} points · worth {money(r.value)}</span></div>
              <button className={`tl-switch ${r.active ? 'is-on' : ''}`} role="switch" aria-checked={r.active} aria-label={`${r.name} active`} onClick={() => updateReward(r.id, { active: !r.active })} />
              <button className="tl-icon-btn" style={{ width: 34, height: 34 }} aria-label={`Delete ${r.name}`} onClick={() => deleteReward(r.id)}><Icon name="trash" size={16} /></button>
            </div>
          ))}
          <form
            className="tl-stack-sm" style={{ marginTop: 18 }}
            onSubmit={(e) => { e.preventDefault(); addReward({ ...draft, cost: Number(draft.cost), value: Number(draft.value) }); setDraft({ name: '', cost: 100, value: 8 }); }}
          >
            <span className="tl-label">Add a reward</span>
            <input className="tl-input" placeholder="Reward name, e.g. Free guacamole" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
            <div className="tl-grid-2">
              <div className="tl-field"><label htmlFor="rc">Cost in points</label><input id="rc" type="number" min="1" className="tl-input" value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: e.target.value })} /></div>
              <div className="tl-field"><label htmlFor="rv">Discount value ($)</label><input id="rv" type="number" min="0" className="tl-input" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} /></div>
            </div>
            <button className="tl-btn tl-btn-primary tl-btn-sm" style={{ alignSelf: 'flex-start' }}><Icon name="plus" size={14} /> Add reward</button>
          </form>
        </section>

        <div className="tl-stack">
          <section className="adm-panel tl-stack-sm">
            <div className="adm-panel-head" style={{ marginBottom: 4 }}><h3>Earning rules</h3></div>
            <NumberField id="ppd" label="Points per dollar spent" value={loyalty.pointsPerDollar} suffix="pts / $1" onCommit={(n) => updateLoyalty({ pointsPerDollar: n })} />
            <NumberField id="wb" label="Welcome bonus for new members" value={loyalty.welcomeBonus} suffix="pts" onCommit={(n) => updateLoyalty({ welcomeBonus: Math.round(n) })} />
            <p className="tl-muted tl-small">Points are credited when an order is marked as picked up, before taxes and after rewards.</p>
          </section>

          <section className="adm-panel">
            <div className="adm-panel-head"><h3>Tiers</h3><span className="tl-muted tl-small">By lifetime points</span></div>
            {loyalty.tiers.map((t, i) => (
              <div key={t.name} className="adm-setting">
                <div><p>{t.name}</p><span>{tierCount(t)} members</span></div>
                {i === 0 ? <span className="tl-muted tl-small">From 0 pts</span> : (
                  <div style={{ width: 150 }}>
                    <NumberField id={`t-${i}`} label="" value={t.min} suffix="pts" onCommit={(n) => setTier(i, { min: Math.round(n) })} />
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
