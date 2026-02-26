import React, { useEffect, useState } from 'react';
import { superAdminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime } from '../../utils/formatters';

export default function ActivityLogs() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    superAdminApi.activityLogs()
      .then(r => setLogs(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    (l.action + l.entity + (l.user_name||'') + (l.restaurant_name||''))
      .toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:80 }}><Spinner size={36}/></div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ fontWeight:700, fontSize:20 }}>System Activity Logs</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Last 200 system events</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search logs..."
          style={{ padding:'8px 12px', borderRadius:'var(--radius)', border:'1px solid var(--border)', fontSize:13, outline:'none' }}
        />
      </div>

      <Card bodyStyle={{ padding:0 }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                {['Time','User','Restaurant','Action','Entity','ID','IP'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => (
                <tr key={log.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid var(--border)':'none', fontSize:12 }}>
                  <td style={{ padding:'10px 16px', whiteSpace:'nowrap', color:'var(--text-muted)' }}>{formatDateTime(log.created_at)}</td>
                  <td style={{ padding:'10px 16px', fontWeight:500 }}>{log.user_name || '—'}</td>
                  <td style={{ padding:'10px 16px', color:'var(--text-muted)' }}>{log.restaurant_name || 'System'}</td>
                  <td style={{ padding:'10px 16px' }}><Badge type="info" style={{ fontSize:11 }}>{log.action}</Badge></td>
                  <td style={{ padding:'10px 16px', color:'var(--text-muted)' }}>{log.entity}</td>
                  <td style={{ padding:'10px 16px', color:'var(--text-muted)' }}>{log.entity_id || '—'}</td>
                  <td style={{ padding:'10px 16px', color:'var(--text-muted)' }}>{log.ip_address || '—'}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={7} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>No logs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
