import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = {
  superadmin: [
    { to:'/superadmin/dashboard',    icon:'📊', label:'Dashboard' },
    { to:'/superadmin/restaurants',  icon:'🏬', label:'Restaurants' },
    { to:'/superadmin/logs',         icon:'📋', label:'Activity Logs' },
  ],
  admin: [
    { to:'/admin/dashboard',   icon:'📊', label:'Dashboard' },
    { to:'/admin/staff',       icon:'👥', label:'Staff' },
    { to:'/admin/tables',      icon:'🪑', label:'Tables' },
    { to:'/admin/menu',        icon:'🍽️', label:'Menu' },
    { to:'/admin/inventory',   icon:'📦', label:'Inventory' },
    { to:'/admin/reports',     icon:'📈', label:'Reports' },
  ],
  waiter: [
    { to:'/waiter/dashboard',  icon:'🍽️', label:'Tables' },
    { to:'/waiter/orders',     icon:'📋', label:'My Orders' },
  ],
  kitchen: [
    { to:'/kitchen/board',     icon:'👨‍🍳', label:'Kitchen Board' },
  ],
  cashier: [
    { to:'/cashier/billing',   icon:'💳', label:'Billing' },
    { to:'/cashier/summary',   icon:'📊', label:'Daily Summary' },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const navItems         = NAV[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <aside style={{
        width:'var(--sidebar-width)', background:'var(--bg-sidebar)',
        color:'#e2e8f0', display:'flex', flexDirection:'column',
        position:'fixed', top:0, left:0, height:'100vh', zIndex:100,
        transform: open ? 'translateX(0)' : 'translateX(0)',
        transition:'transform .25s ease',
        boxShadow:'2px 0 12px rgba(0,0,0,.15)',
      }} className="sidebar">
        {/* Logo */}
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontWeight:700, fontSize:18, color:'#fff', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:22 }}>🍴</span>
            <span>RestaurantOS</span>
          </div>
          {user?.restaurant_name && (
            <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:4, paddingLeft:30 }}>
              {user.restaurant_name}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={onClose} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10,
              padding:'10px 12px', borderRadius:'var(--radius)',
              marginBottom:4, fontSize:14, fontWeight:500,
              color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
              background: isActive ? 'rgba(99,102,241,.5)' : 'transparent',
              transition:'all var(--transition)',
              textDecoration:'none',
            })}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginBottom:8 }}>
            <div style={{ fontWeight:600, color:'#fff' }}>{user?.name}</div>
            <div style={{ fontSize:11, textTransform:'capitalize' }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} style={{
            width:'100%', padding:'8px', borderRadius:'var(--radius)',
            background:'rgba(239,68,68,.15)', color:'#fca5a5',
            fontSize:13, fontWeight:600, border:'1px solid rgba(239,68,68,.25)',
            cursor:'pointer',
          }}>
            Sign Out
          </button>
        </div>
      </aside>

      <div style={{ width:'var(--sidebar-width)', flexShrink:0 }} className="sidebar-spacer" />

      <style>{`
        @media(max-width:768px){
          .sidebar { transform: ${open ? 'translateX(0)' : 'translateX(-100%)'} !important; }
          .sidebar-spacer { display:none; }
        }
      `}</style>
    </>
  );
}
