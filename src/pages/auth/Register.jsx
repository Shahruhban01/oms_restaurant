import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { setAuth } from '../../utils/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Register() {
  const [form, setForm]     = useState({ restaurant_name:'', name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { success, error }  = useToast();
  const { updateUser }      = useAuth();
  const navigate            = useNavigate();

  const set = (key) => (e) => setForm(f => ({...f, [key]: e.target.value}));

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    try {
      const res  = await authApi.register(form);
      const data = res.data.data;
      setAuth(data.token, data.user);
      updateUser(data.user);
      success('Restaurant registered! Welcome.');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)', padding:16,
    }}>
      <div style={{
        background:'var(--bg-card)', borderRadius:'var(--radius-lg)',
        padding:'40px 36px', width:'100%', maxWidth:420, boxShadow:'0 25px 50px rgba(0,0,0,.25)',
      }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:36, marginBottom:6 }}>🏬</div>
          <h1 style={{ fontSize:22, fontWeight:700 }}>Register Your Restaurant</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Start with the Free plan</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="Restaurant Name" required value={form.restaurant_name} onChange={set('restaurant_name')} placeholder="e.g. Spice Garden" />
          <Input label="Your Name" required value={form.name} onChange={set('name')} placeholder="e.g. Rahul Kumar" />
          <Input label="Email" type="email" required value={form.email} onChange={set('email')} placeholder="admin@restaurant.com" />
          <Input label="Password" type="password" required value={form.password} onChange={set('password')} placeholder="Min 8 characters" hint="Must be at least 8 characters" />
          <Button type="submit" loading={loading} fullWidth style={{ marginTop:4 }}>Create Account</Button>
        </form>
        <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--text-muted)' }}>
          Already registered? <Link to="/login" style={{ color:'var(--primary)', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
