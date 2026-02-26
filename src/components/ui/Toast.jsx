import React, { useEffect, useState } from 'react';

const TYPE_CONFIG = {
  success: { icon: '✓', bg: 'var(--success)',  border: '#16a34a' },
  error:   { icon: '✕', bg: 'var(--danger)',   border: '#dc2626' },
  warning: { icon: '⚠', bg: 'var(--warning)',  border: '#d97706' },
  info:    { icon: 'ℹ', bg: 'var(--info)',     border: '#2563eb' },
};

/**
 * Single Toast item — rendered by ToastContext internally.
 * Can also be used standalone for custom placements.
 *
 * Props:
 *  message  string
 *  type     'success' | 'error' | 'warning' | 'info'
 *  onClose  () => void
 *  duration number (ms) — 0 = no auto-close
 */
export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  const [visible, setVisible] = useState(false);
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  useEffect(() => {
    // Trigger enter animation on mount
    const enterTimer = setTimeout(() => setVisible(true), 10);
    let closeTimer;
    if (duration > 0) {
      closeTimer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose?.(), 250); // wait for exit animation
      }, duration);
    }
    return () => { clearTimeout(enterTimer); clearTimeout(closeTimer); };
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 250);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 'var(--radius)',
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: '#fff',
        boxShadow: 'var(--shadow-lg)',
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.45,
        maxWidth: 360,
        width: '100%',
        transform: visible ? 'translateX(0)' : 'translateX(110%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.22s ease, opacity 0.22s ease',
        pointerEvents: 'auto',
      }}
    >
      {/* Icon */}
      <span style={{
        flexShrink: 0,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'rgba(255,255,255,.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        marginTop: 1,
      }}>
        {config.icon}
      </span>

      {/* Message */}
      <span style={{ flex: 1 }}>{message}</span>

      {/* Close button */}
      <button
        onClick={handleClose}
        aria-label="Dismiss notification"
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,.8)',
          fontSize: 16,
          lineHeight: 1,
          cursor: 'pointer',
          padding: 0,
          marginTop: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

/**
 * ToastStack — renders a stack of toasts.
 * Used internally by ToastContext. You can also use this
 * independently with your own state if needed.
 *
 * Props:
 *  toasts   Array<{ id, message, type, duration? }>
 *  onDismiss (id) => void
 *  position  'bottom-right' | 'top-right' | 'top-center' | 'bottom-center'
 */
export function ToastStack({ toasts = [], onDismiss, position = 'bottom-right' }) {
  const positionStyle = {
    'bottom-right':  { bottom: 20, right: 20 },
    'top-right':     { top: 20,    right: 20 },
    'top-center':    { top: 20,    left: '50%', transform: 'translateX(-50%)' },
    'bottom-center': { bottom: 20, left: '50%', transform: 'translateX(-50%)' },
  }[position] || { bottom: 20, right: 20 };

  if (!toasts.length) return null;

  return (
    <div
      aria-label="Notifications"
      style={{
        position: 'fixed',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
        ...positionStyle,
      }}
    >
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          duration={t.duration ?? 3500}
          onClose={() => onDismiss(t.id)}
        />
      ))}
    </div>
  );
}
