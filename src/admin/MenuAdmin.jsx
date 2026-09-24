import { useState } from 'react';
import { addMenuItem, deleteMenuItem, updateMenuItem, useDemo } from '../demo/store';
import { CATEGORIES } from '../demo/seed';
import { AdminHeader } from './AdminLayout';
import Icon from '../demo/icons';

function PriceInput({ item }) {
  const [value, setValue] = useState(String(item.price));
  const commit = () => {
    const n = Math.max(0, Math.round(parseFloat(value) * 100) / 100);
    if (!Number.isNaN(n) && n !== item.price) updateMenuItem(item.id, { price: n });
    else setValue(String(item.price));
  };
  return (
    <input
      className="tl-input adm-price-input" inputMode="decimal" aria-label={`Price of ${item.name}`}
      value={value} onChange={(e) => setValue(e.target.value)} onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
    />
  );
}

export default function MenuAdmin() {
  const menu = useDemo((s) => s.menu);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', category: 'mains', price: '', description: '' });

  const submit = (e) => {
    e.preventDefault();
    addMenuItem({ ...draft, price: parseFloat(draft.price) || 0 });
    setDraft({ name: '', category: 'mains', price: '', description: '' });
    setAdding(false);
  };

  return (
    <>
      <AdminHeader title="Menu" subtitle="Change prices, mark dishes as sold out or add new ones. The website updates instantly.">
        <button className="tl-btn tl-btn-primary tl-btn-sm" onClick={() => setAdding((v) => !v)}>
          <Icon name={adding ? 'close' : 'plus'} size={16} /> {adding ? 'Close' : 'Add a dish'}
        </button>
      </AdminHeader>

      {adding && (
        <form className="adm-panel tl-stack-sm" style={{ marginBottom: 16 }} onSubmit={submit}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>New dish</h3>
          <div className="tl-grid-2">
            <div className="tl-field"><label htmlFor="mn">Name</label><input id="mn" className="tl-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></div>
            <div className="tl-grid-2">
              <div className="tl-field">
                <label htmlFor="mc">Category</label>
                <select id="mc" className="tl-select" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="tl-field"><label htmlFor="mp">Price</label><input id="mp" className="tl-input" inputMode="decimal" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} required /></div>
            </div>
          </div>
          <div className="tl-field"><label htmlFor="md">Description</label><input id="md" className="tl-input" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
          <button className="tl-btn tl-btn-primary" style={{ alignSelf: 'flex-start' }}>Add to menu</button>
        </form>
      )}

      {CATEGORIES.map((c) => {
        const items = menu.filter((m) => m.category === c.id);
        if (!items.length) return null;
        return (
          <section key={c.id} className="adm-panel" style={{ marginBottom: 16 }}>
            <div className="adm-panel-head"><h3>{c.name}</h3><span className="tl-muted tl-small">{items.length} dishes</span></div>
            {items.map((m) => (
              <div key={m.id} className="adm-menu-row">
                <div className="adm-menu-thumb">{m.image ? <img src={m.image} alt="" /> : <Icon name="flame" size={20} />}</div>
                <div className="adm-menu-info">
                  <p>{m.name}</p>
                  <span>{m.available ? 'Available' : 'Sold out'}{m.popular ? ' · Popular' : ''}</span>
                </div>
                <PriceInput key={m.price} item={m} />
                <button className={`tl-switch ${m.available ? 'is-on' : ''}`} role="switch" aria-checked={m.available} aria-label={`${m.name} available`} onClick={() => updateMenuItem(m.id, { available: !m.available })} />
                <button className="tl-icon-btn" style={{ width: 34, height: 34 }} aria-label={`Delete ${m.name}`} onClick={() => deleteMenuItem(m.id)}><Icon name="trash" size={16} /></button>
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}
