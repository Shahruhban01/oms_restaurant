import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  return (
    <header style={{
      height:'var(--topbar-height)', background:'var(--bg-card)',
      borderBottom:'1px solid var(--border)', display:'flex',
      alignItems:'center', padding:'0 16px', gap:12,
      position:'sticky', top:0, zIndex:50, boxShadow:'var(--shadow)',
    }}>
      <button onClick={onMenuClick} className="mobile-menu-btn" style={{
        display:'none', fontSize:22, color:'var(--text)', lineHeight:1,
      }}>
        ☰
      </button>
      <div style={{ flex:1 }} />
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{
          width:34, height:34, borderRadius:'50%',
          background:'var(--primary)', color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:700, fontSize:14,
        }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          <span style={{ fontSize:13, fontWeight:600 }}>{user?.name}</span>
          <span style={{ fontSize:11, color:'var(--text-muted)', textTransform:'capitalize' }}>{user?.role}</span>
        </div>
      </div>
      <style>{`@media(max-width:768px){ .mobile-menu-btn{ display:block !important; } }`}</style>
    </header>
  );
}
