import React from 'react';

const colors = {
  success: { bg:'var(--success-light)', color:'#15803d' },
  danger:  { bg:'var(--danger-light)',  color:'#b91c1c' },
  warning: { bg:'var(--warning-light)', color:'#b45309' },
  info:    { bg:'var(--info-light)',    color:'#1d4ed8' },
  default: { bg:'var(--border)',        color:'var(--text-muted)' },
  primary: { bg:'var(--primary-light)', color:'var(--primary-dark)' },
};

export default function Badge({ children, type = 'default', style = {} }) {
  const c = colors[type] || colors.default;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      padding:'2px 10px', borderRadius:99, fontSize:12, fontWeight:600,
      background: c.bg, color: c.color, ...style,
    }}>
      {children}
    </span>
  );
}
