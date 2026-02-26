import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }

  static getDerivedStateFromError(error) { return { hasError: true, error }; }

  componentDidCatch(error, info) { console.error('ErrorBoundary caught:', error, info); }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:16, padding:24 }}>
        <div style={{ fontSize:48 }}>⚠️</div>
        <h2 style={{ color:'var(--danger)', fontSize:20, fontWeight:600 }}>Something went wrong</h2>
        <p style={{ color:'var(--text-muted)', maxWidth:400, textAlign:'center' }}>
          {this.state.error?.message || 'An unexpected error occurred.'}
        </p>
        <button onClick={() => window.location.reload()} style={{
          background:'var(--primary)', color:'#fff', padding:'10px 24px',
          borderRadius:'var(--radius)', fontWeight:600, cursor:'pointer',
        }}>
          Reload Page
        </button>
      </div>
    );
  }
}
