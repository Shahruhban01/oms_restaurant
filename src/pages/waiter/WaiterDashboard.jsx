import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableApi, orderApi } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import Badge from '../../components/ui/Badge';
import { statusColor, capitalize } from '../../utils/formatters';
import { POLL_WAITER_MS } from '../../utils/constants';

export default function WaiterDashboard() {
  const [tables, setTables] = useState([]);
  const { execute }         = useApi();
  const { error }           = useToast();
  const navigate            = useNavigate();

  const loadTables = useCallback(async () => {
    const data = await execute(tableApi.list, { silent: true });
    setTables(data || []);
  }, [execute]);

  useEffect(() => { loadTables(); }, [loadTables]);
  usePolling(loadTables, POLL_WAITER_MS);

  const statusStyle = {
    available: { border:'2px solid var(--success)', background:'var(--success-light)' },
    occupied:  { border:'2px solid var(--danger)',  background:'var(--danger-light)' },
    reserved:  { border:'2px solid var(--warning)', background:'var(--warning-light)' },
    cleaning:  { border:'2px solid var(--info)',    background:'var(--info-light)' },
  };

  return (
    <div>
      <h2 style={{ fontWeight:700, fontSize:20, marginBottom:4 }}>Table View</h2>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>Tap an available table to create an order</p>

      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        {[['available','✓ Available'],['occupied','● Occupied'],['reserved','⏳ Reserved'],['cleaning','🧹 Cleaning']].map(([s,l]) => (
          <div key={s} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
            <div style={{ width:14, height:14, borderRadius:3, ...statusStyle[s] }} />
            <span style={{ color:'var(--text-muted)' }}>{l}</span>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))' }}>
        {tables.map(table => (
          <div key={table.id}
            onClick={() => {
              if (table.status === 'available') navigate('/waiter/orders', { state: { table } });
              else if (table.active_order_id) navigate('/waiter/orders', { state: { table, orderId: table.active_order_id } });
            }}
            style={{
              borderRadius:'var(--radius-lg)', padding:'16px 12px',
              textAlign:'center', cursor:'pointer',
              transition:'all var(--transition)',
              ...(statusStyle[table.status] || {}),
              boxShadow:'var(--shadow)',
            }}
          >
            <div style={{ fontSize:28, fontWeight:700, color:'var(--text)' }}>T{table.table_number}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Cap: {table.capacity}</div>
            <Badge type={statusColor(table.status)} style={{ marginTop:6, fontSize:10 }}>
              {capitalize(table.status)}
            </Badge>
          </div>
        ))}
        {!tables.length && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40, color:'var(--text-muted)' }}>
            No tables configured. Ask your admin to add tables.
          </div>
        )}
      </div>
    </div>
  );
}
