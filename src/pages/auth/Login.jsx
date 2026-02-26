import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getDashboardRoute } from '../../utils/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'' });
  const [errors, setErrors] = useState({});
  const { login, loading }  = useAuth();
  const { error }           = useToast();
  const navigate            = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    try {
      const user = await login(form.email, form.password);
      navigate(getDashboardRoute(user.role), { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)',
      padding:16,
    }}>
      <div style={{
        background:'var(--bg-card)', borderRadius:'var(--radius-lg)',
        padding:'40px 36px', width:'100%', maxWidth:400,
        boxShadow:'0 25px 50px rgba(0,0,0,.25)',
      }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🍴</div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text)' }}>RestaurantOS</h1>
          <p style={{ color:'var(--text-muted)', fontSize:14, marginTop:4 }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Input label="Email Address" type="email" required
            value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
            error={errors.email} placeholder="you@example.com" autoComplete="email"
          />
          <Input label="Password" type="password" required
            value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
            error={errors.password} placeholder="••••••••" autoComplete="current-password"
          />
          <Button type="submit" loading={loading} fullWidth style={{ marginTop:8 }}>
            Sign In
          </Button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text-muted)' }}>
          New restaurant?{' '}
          <Link to="/register" style={{ color:'var(--primary)', fontWeight:600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
