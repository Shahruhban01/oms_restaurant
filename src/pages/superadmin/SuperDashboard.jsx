import React, { useEffect, useState } from 'react';
import { superAdminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background:'var(--bg-card)', borderRadius:'var(--radius-lg)',
      border:'1px solid var(--border)', padding:20,
      display:'flex', alignItems:'center', gap:16, boxShadow:'var(--shadow)',
    }}>
      <div style={{
        width:52, height:52, borderRadius:12, fontSize:24,
        display:'flex', alignItems:'center', justifyContent:'center',
        background:`${color}18`,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize:24, fontWeight:700 }}>{value}</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{label}</div>
      </div>
    </div>
  );
}

export default function SuperDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminApi.dashboard()
      .then(r => setData(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:80 }}><Spinner size={36} /></div>;

  const stats = [
    { icon:'🏬', label:'Total Restaurants',     value: data?.total_restaurants ?? 0,     color:'#6366f1' },
    { icon:'✅', label:'Active Restaurants',     value: data?.active_restaurants ?? 0,    color:'#22c55e' },
    { icon:'🚫', label:'Suspended Restaurants',  value: data?.suspended_restaurants ?? 0, color:'#ef4444' },
    { icon:'👥', label:'Total Users',            value: data?.total_users ?? 0,           color:'#3b82f6' },
    { icon:'📦', label:'Total Orders',           value: data?.total_orders ?? 0,          color:'#f59e0b' },
    { icon:'📅', label:"Today's Orders",         value: data?.today_orders ?? 0,          color:'#8b5cf6' },
  ];

  return (
    <div>
      <h2 style={{ fontWeight:700, fontSize:20, marginBottom:4 }}>SuperAdmin Dashboard</h2>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>System-wide overview</p>
      <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>
    </div>
  );
}
