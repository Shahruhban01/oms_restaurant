import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ErrorBoundary from '../shared/ErrorBoundary';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:99, display:'none',
        }} className="sidebar-overlay" />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <TopBar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main style={{ flex:1, padding:'20px 16px', overflowY:'auto' }}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <style>{`
        @media(max-width:768px){
          .sidebar-overlay { display:block !important; }
        }
      `}</style>
    </div>
  );
}
