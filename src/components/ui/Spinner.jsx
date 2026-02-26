import React from 'react';

export default function Spinner({ size = 20, color = 'var(--primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation:'spin .7s linear infinite' }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="3" strokeDasharray="40 20" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}
