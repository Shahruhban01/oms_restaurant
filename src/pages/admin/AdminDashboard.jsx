import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import PlanLimitBanner from '../../components/shared/PlanLimitBanner';
import { formatCurrency } from '../../utils/formatters';

function StatCard({ icon, label, value, color = 'var(--primary)' }) {
  return (
    <div style={{
      background:'var(--bg-card)', borderRadius:'var(--radius-lg)',
      border:'1px solid var(--border)', padding:'20px',
      display:'flex', alignItems:'center', gap:16,
      boxShadow:'var(--shadow)',
    }}>
      <div style={{
        width:52, height:52, borderRadius:12, fontSize:24,
        display:'flex', alignItems:'center', justifyContent:'center',
        background: `${color}18`,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:22, fontWeight:700, color:'var(--text)' }}>{value}</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard()
      .then(r => setData(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}><Spinner size={36} /></div>;

  const stats = [
    { icon:'📦', label:"Today's Orders",       value: data?.today_orders ?? 0,         color:'#6366f1' },
    { icon:'💰', label:"Today's Revenue",       value: formatCurrency(data?.today_revenue), color:'#22c55e' },
    { icon:'🪑', label:"Active Tables",         value: data?.active_tables ?? 0,        color:'#f59e0b' },
    { icon:'👥', label:"Staff Count",           value: data?.staff_count ?? 0,          color:'#3b82f6' },
    { icon:'👨‍🍳', label:"Pending Kitchen Orders",value: data?.pending_kitchen_orders ?? 0,color:'#ef4444' },
    { icon:'⚠️', label:"Low Stock Alerts",      value: data?.low_stock_alerts ?? 0,     color:'#f59e0b' },
  ];

  return (
    <div>
      <h2 style={{ fontWeight:700, fontSize:20, marginBottom:4 }}>Dashboard</h2>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>
        {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
      </p>

      <PlanLimitBanner />

      <div style={{
        display:'grid', gap:14,
        gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',
      }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {data?.plan_usage && (
        <Card title="Plan Usage" style={{ marginTop:20 }}>
          <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {Object.entries(data.plan_usage).filter(([k]) => k !== 'plan').map(([key, val]) => {
              if (typeof val !== 'object') return null;
              const pct = val.limit >= 9999 ? 0 : Math.round((val.used / val.limit) * 100);
              return (
                <div key={key}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                    <span style={{ textTransform:'capitalize', color:'var(--text-muted)' }}>{key.replace(/_/g,' ')}</span>
                    <span style={{ fontWeight:600 }}>{val.limit >= 9999 ? `${val.used} / ∞` : `${val.used}/${val.limit}`}</span>
                  </div>
                  {val.limit < 9999 && (
                    <div style={{ height:6, background:'var(--border)', borderRadius:99 }}>
                      <div style={{
                        height:'100%', borderRadius:99, width:`${pct}%`,
                        background: pct >= 85 ? 'var(--danger)' : pct >= 60 ? 'var(--warning)' : 'var(--success)',
                        transition:'width .4s ease',
                      }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Badge type="primary" style={{ marginTop:12 }}>
            Plan: {data.plan_usage.plan?.replace('_',' ')?.toUpperCase()}
          </Badge>
        </Card>
      )}
    </div>
  );
}
