import React, { useEffect } from 'react';
import Button from './Button';

export default function Modal({ open, onClose, title, children, width = 480, footer }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else       document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,.45)', display:'flex',
      alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'var(--bg-card)', borderRadius:'var(--radius-lg)',
        width:'100%', maxWidth:width, maxHeight:'90vh',
        display:'flex', flexDirection:'column', boxShadow:'var(--shadow-lg)',
        animation:'modalIn .15s ease',
      }}>
        <div style={{
          padding:'16px 20px', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <h3 style={{ fontWeight:600, fontSize:16 }}>{title}</h3>
          <button onClick={onClose} style={{ fontSize:20, color:'var(--text-muted)', lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:20, overflowY:'auto', flex:1 }}>{children}</div>
        {footer && (
          <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8 }}>
            {footer}
          </div>
        )}
      </div>
      <style>{`@keyframes modalIn{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
