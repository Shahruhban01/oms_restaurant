import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function SuperAdminSetup() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm_password: '', setup_key: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const { success, error }    = useToast();
  const navigate              = useNavigate();

  // Warn if accessed in production without intent
  useEffect(() => {
    document.title = 'SuperAdmin Setup — RestaurantOS';
  }, []);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name             = 'Full name is required';
    if (!form.email.trim())          e.email            = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email  = 'Enter a valid email';
    if (!form.password)              e.password         = 'Password is required';
    else if (form.password.length < 8) e.password       = 'Minimum 8 characters';
    if (!form.confirm_password)      e.confirm_password = 'Please confirm your password';
    else if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    if (!form.setup_key.trim())      e.setup_key        = 'Setup key is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.setupSuperAdmin({
        name:      form.name,
        email:     form.email,
        password:  form.password,
        setup_key: form.setup_key,
      });
      success('SuperAdmin account created! You can now log in.');
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Setup failed. Check your setup key.';
      error(msg);
      if (err.response?.status === 403) {
        setErrors((e) => ({ ...e, setup_key: 'Invalid or already-used setup key' }));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Setup Complete!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              Your SuperAdmin account has been created.<br />
              This setup page is now permanently disabled.
            </p>
            <Button fullWidth onClick={() => navigate('/login')}>
              Go to Login →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Setup Form ────────────────────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, fontSize: 30,
            background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            🛡️
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>SuperAdmin Setup</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
            One-time setup. This page is disabled after first use.
          </p>
        </div>

        {/* Warning Banner */}
        <div style={{
          background: 'var(--warning-light)', border: '1px solid var(--warning)',
          borderRadius: 'var(--radius)', padding: '10px 14px',
          marginBottom: 22, display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5, margin: 0 }}>
            Keep your <strong>setup key</strong> private. It comes from your server's{' '}
            <code style={{ background: 'rgba(0,0,0,.06)', padding: '1px 5px', borderRadius: 4 }}>.env</code> file
            (<code style={{ background: 'rgba(0,0,0,.06)', padding: '1px 5px', borderRadius: 4 }}>SUPERADMIN_SETUP_KEY</code>).
            Once used, this page returns an error for any future requests.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <Input
              label="Full Name"
              required
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              placeholder="e.g. Platform Admin"
              autoComplete="name"
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              placeholder="superadmin@yourdomain.com"
              autoComplete="email"
            />

            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr' }}>
              <Input
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                placeholder="Min 8 characters"
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type="password"
                required
                value={form.confirm_password}
                onChange={set('confirm_password')}
                error={errors.confirm_password}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
            </div>

            {/* Password strength bar */}
            {form.password && <PasswordStrength password={form.password} />}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <Input
                label="Setup Key"
                type="password"
                required
                value={form.setup_key}
                onChange={set('setup_key')}
                error={errors.setup_key}
                placeholder="From your server .env file"
                hint="SUPERADMIN_SETUP_KEY value from backend/.env"
                autoComplete="off"
              />
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg" style={{ marginTop: 4 }}>
              🛡️ Create SuperAdmin Account
            </Button>

          </div>
        </form>

        {/* Back link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Already set up?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Go to Login
          </span>
        </p>
      </div>
    </div>
  );
}

// ── Password Strength Indicator ───────────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['var(--danger)', 'var(--danger)', 'var(--warning)', 'var(--info)', 'var(--success)'];

  return (
    <div style={{ marginTop: -6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i <= score ? colors[score] : 'var(--border)',
            transition: 'background .25s ease',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: colors[score], fontWeight: 600 }}>
        {labels[score]}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
        {!checks[1] && '• Uppercase '}
        {!checks[2] && '• Number '}
        {!checks[3] && '• Symbol'}
      </span>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
  padding: 16,
};

const cardStyle = {
  background: 'var(--bg-card)',
  borderRadius: 'var(--radius-lg)',
  padding: '40px 36px',
  width: '100%',
  maxWidth: 480,
  boxShadow: '0 25px 60px rgba(0,0,0,.35)',
  border: '1px solid rgba(255,255,255,.06)',
};
