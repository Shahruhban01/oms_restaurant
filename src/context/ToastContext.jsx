import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const success = useCallback((msg) => toast({ message: msg, type: 'success' }), [toast]);
  const error   = useCallback((msg) => toast({ message: msg, type: 'error' }),   [toast]);
  const info    = useCallback((msg) => toast({ message: msg, type: 'info' }),    [toast]);
  const warning = useCallback((msg) => toast({ message: msg, type: 'warning' }), [toast]);
  const dismiss = useCallback((id)  => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360,
    }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => onDismiss(t.id)} style={{
          background: t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : t.type === 'warning' ? 'var(--warning)' : 'var(--info)',
          color: '#fff', padding: '12px 16px', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
          animation: 'slideIn .2s ease', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ'}</span>
          <span>{t.message}</span>
        </div>
      ))}
      <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
