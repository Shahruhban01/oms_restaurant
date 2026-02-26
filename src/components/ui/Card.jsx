import React from 'react';

export default function Card({ children, title, extra, style = {}, bodyStyle = {} }) {
  return (
    <div style={{
      background:'var(--bg-card)', borderRadius:'var(--radius-lg)',
      boxShadow:'var(--shadow)', border:'1px solid var(--border)',
      overflow:'hidden', ...style,
    }}>
      {(title || extra) && (
        <div style={{
          padding:'14px 20px', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          {title && <h3 style={{ fontWeight:600, fontSize:15 }}>{title}</h3>}
          {extra}
        </div>
      )}
      <div style={{ padding:20, ...bodyStyle }}>{children}</div>
    </div>
  );
}
