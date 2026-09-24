import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { isAdmin, loginAdmin } from '../demo/store';
import { DEMO_ADMIN } from '../demo/seed';
import { PasswordInput } from '../pages/Account';
import Icon from '../demo/icons';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...DEMO_ADMIN });
  const [error, setError] = useState('');

  if (isAdmin()) return <Navigate to="/admin" replace />;

  const submit = (e) => {
    e.preventDefault();
    try {
      loginAdmin(form.email, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="adm-login">
      <div className="adm-login-art">
        <div>
          <img src="/brand/logotipo-tulum.svg" alt="Tulum" style={{ height: 34, marginBottom: 24, filter: 'brightness(0) invert(94%) sepia(6%) saturate(600%) hue-rotate(320deg)' }} />
          <h2>Orders, loyalty and reservations in one place.</h2>
        </div>
      </div>
      <div className="adm-login-form">
        <div>
          <Link to="/" className="tl-link" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', textDecoration: 'none', marginBottom: 28 }}>
            <Icon name="back" size={16} /> Back to the website
          </Link>
          <h1>Staff sign in</h1>
          <p className="tl-muted" style={{ margin: '8px 0 24px' }}>Manage the restaurant from the admin panel.</p>
          <form className="tl-stack-sm" onSubmit={submit}>
            <div className="tl-demo-note">
              <Icon name="sparkle" size={18} />
              <span>This is a demo. Access is already filled in: <code>{DEMO_ADMIN.email}</code> / <code>{DEMO_ADMIN.password}</code></span>
            </div>
            <div className="tl-field">
              <label htmlFor="ae">Email</label>
              <input id="ae" type="email" className="tl-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="username" />
            </div>
            <div className="tl-field">
              <label htmlFor="ap">Password</label>
              <PasswordInput id="ap" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            {error && <p className="tl-error">{error}</p>}
            <button className="tl-btn tl-btn-primary tl-btn-block" style={{ marginTop: 6 }}>Sign in to the panel</button>
          </form>
        </div>
      </div>
    </div>
  );
}
