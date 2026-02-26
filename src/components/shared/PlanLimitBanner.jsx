import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';

export default function PlanLimitBanner() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    adminApi.planUsage().then(r => setUsage(r.data?.data)).catch(() => {});
  }, []);

  if (!usage) return null;

  const warnings = Object.entries(usage)
    .filter(([key, val]) => key !== 'plan' && typeof val === 'object')
    .filter(([, val]) => val.limit < 9999 && val.used / val.limit >= 0.85)
    .map(([key, val]) => `${key.replace(/_/g,' ')}: ${val.used}/${val.limit}`);

  if (!warnings.length) return null;

  return (
    <div style={{
      background:'var(--warning-light)', border:'1px solid var(--warning)',
      borderRadius:'var(--radius)', padding:'10px 16px', marginBottom:16,
      display:'flex', alignItems:'flex-start', gap:10,
    }}>
      <span style={{ fontSize:18 }}>⚠️</span>
      <div>
        <strong style={{ fontSize:13, color:'#92400e' }}>Plan limits approaching</strong>
        <ul style={{ margin:'4px 0 0 0', paddingLeft:16, fontSize:12, color:'#92400e' }}>
          {warnings.map(w => <li key={w}>{w}</li>)}
        </ul>
      </div>
    </div>
  );
}
