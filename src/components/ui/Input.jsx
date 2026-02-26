import React from 'react';

export default function Input({
  label, error, hint, type = 'text', id, required = false, style = {}, ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '_');
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4, ...style }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>
          {label}{required && <span style={{ color:'var(--danger)', marginLeft:3 }}>*</span>}
        </label>
      )}
      {type === 'select' ? (
        <select id={inputId} {...props} style={{
          padding:'9px 12px', borderRadius:'var(--radius)', border:`1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          fontSize:14, color:'var(--text)', background:'var(--bg-card)', outline:'none',
          transition:'border-color var(--transition)',
        }}>
          {props.children}
        </select>
      ) : type === 'textarea' ? (
        <textarea id={inputId} rows={3} {...props} style={{
          padding:'9px 12px', borderRadius:'var(--radius)', border:`1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          fontSize:14, resize:'vertical', outline:'none',
        }} />
      ) : (
        <input id={inputId} type={type} {...props} style={{
          padding:'9px 12px', borderRadius:'var(--radius)', border:`1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          fontSize:14, color:'var(--text)', background:'var(--bg-card)', outline:'none',
          transition:'border-color var(--transition)', width:'100%',
        }} />
      )}
      {error && <span style={{ fontSize:12, color:'var(--danger)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize:12, color:'var(--text-muted)' }}>{hint}</span>}
    </div>
  );
}
