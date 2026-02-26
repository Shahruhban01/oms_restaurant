import React from 'react';
import Spinner from './Spinner';

const variants = {
  primary: { background:'var(--primary)', color:'#fff' },
  danger:  { background:'var(--danger)',  color:'#fff' },
  success: { background:'var(--success)', color:'#fff' },
  ghost:   { background:'transparent',    color:'var(--primary)', border:'1.5px solid var(--primary)' },
  subtle:  { background:'var(--bg)',       color:'var(--text)',    border:'1.5px solid var(--border)' },
};

export default function Button({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, fullWidth = false, onClick, type = 'button', style = {}, ...rest
}) {
  const sizeStyle = size === 'sm'
    ? { padding:'6px 14px', fontSize:13 }
    : size === 'lg'
    ? { padding:'13px 28px', fontSize:16 }
    : { padding:'9px 20px', fontSize:14 };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
      style={{
        ...variants[variant],
        ...sizeStyle,
        borderRadius:'var(--radius)',
        fontWeight:600,
        display:'inline-flex',
        alignItems:'center',
        justifyContent:'center',
        gap:8,
        width: fullWidth ? '100%' : 'auto',
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.65 : 1,
        transition:'opacity var(--transition), transform var(--transition)',
        border: variants[variant]?.border || 'none',
        whiteSpace:'nowrap',
        ...style,
      }}
    >
      {loading && <Spinner size={14} color="currentColor" />}
      {children}
    </button>
  );
}
