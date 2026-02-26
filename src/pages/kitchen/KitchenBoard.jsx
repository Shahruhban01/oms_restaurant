import React, { useState, useCallback, useRef } from 'react';
import { kitchenApi } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatTime, statusColor, capitalize } from '../../utils/formatters';
import { POLL_KITCHEN_MS } from '../../utils/constants';

const STATUS_COLORS = { pending:'warning', preparing:'info', ready:'success' };

export default function KitchenBoard() {
  const [orders, setOrders]       = useState([]);
  const [serverTs, setServerTs]   = useState(null);
  const prevIds                   = useRef(new Set());
  const audioRef                  = useRef(null);
  const { execute }               = useApi();
  const { info }                  = useToast();

  const poll = useCallback(async () => {
    if (serverTs) {
      // Differential update
      const data = await execute(() => kitchenApi.poll(serverTs), { silent:true });
      if (data?.orders?.length) {
        // New orders arrived — play sound
        const newIds = data.orders.filter(o => !prevIds.current.has(o.id)).map(o => o.id);
        if (newIds.length) {
          info(`${newIds.length} new order(s) received!`);
          try { audioRef.current?.play(); } catch(_){}
        }
        // Reload full board
        const full = await execute(kitchenApi.board, { silent:true });
        if (full) setOrders(full);
        setServerTs(data.server_ts);
        data.orders.forEach(o => prevIds.current.add(o.id));
      }
    } else {
      const full = await execute(kitchenApi.board, { silent:true });
      if (full) { setOrders(full); prevIds.current = new Set(full.map(o => o.id)); }
      const ts = await execute(() => kitchenApi.poll(new Date(0).toISOString()), { silent:true });
      if (ts) setServerTs(ts.server_ts);
    }
  }, [serverTs, execute, info]);

  usePolling(poll, POLL_KITCHEN_MS);

  const advance = async (orderId, currentStatus) => {
    const next = currentStatus === 'pending' ? 'preparing' : 'ready';
    await execute(() => kitchenApi.updateOrderStatus(orderId, { status: next }));
    setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: next} : o));
  };

  const grouped = {
    pending:   orders.filter(o => o.status === 'pending'),
    preparing: orders.filter(o => o.status === 'preparing'),
  };

  return (
    <div>
      {/* Hidden audio for notification */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontWeight:700, fontSize:20 }}>Kitchen Board</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Live order queue — auto-refreshes</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20, animation:'pulse 2s infinite' }}>🟢</span>
          <span style={{ fontSize:12, color:'var(--success)', fontWeight:600 }}>Live</span>
        </div>
      </div>

      <div style={{ display:'grid', gap:16, gridTemplateColumns:'1fr 1fr' }}>
        {[['pending','🆕 New Orders'],['preparing','🔥 Preparing']].map(([status, title]) => (
          <div key={status}>
            <h3 style={{ fontWeight:600, fontSize:15, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
              <span>{title}</span>
              {grouped[status].length > 0 && (
                <Badge type={STATUS_COLORS[status]}>{grouped[status].length}</Badge>
              )}
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {grouped[status].map(order => (
                <div key={order.id} style={{
                  background:'var(--bg-card)', borderRadius:'var(--radius-lg)',
                  border:`2px solid ${status === 'pending' ? 'var(--warning)' : 'var(--info)'}`,
                  padding:16, boxShadow:'var(--shadow)',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <div>
                      <span style={{ fontWeight:700, fontSize:16 }}>Table {order.table_number}</span>
                      <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:8 }}>#{order.id}</span>
                    </div>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{formatTime(order.created_at)}</span>
                  </div>
                  <ul style={{ listStyle:'none', margin:'0 0 12px 0', padding:0 }}>
                    {(order.items || []).map((item, i) => (
                      <li key={i} style={{
                        display:'flex', justifyContent:'space-between',
                        padding:'4px 0', borderBottom: i < order.items.length-1 ? '1px dashed var(--border)' : 'none',
                        fontSize:13,
                      }}>
                        <span>{item.name}</span>
                        <span style={{ fontWeight:600, color:'var(--primary)' }}>×{item.qty}</span>
                      </li>
                    ))}
                  </ul>
                  {order.notes && (
                    <div style={{ background:'var(--warning-light)', padding:'6px 10px', borderRadius:6, fontSize:12, marginBottom:10 }}>
                      📝 {order.notes}
                    </div>
                  )}
                  <Button fullWidth
                    variant={status === 'pending' ? 'primary' : 'success'}
                    onClick={() => advance(order.id, status)}
                  >
                    {status === 'pending' ? '▶ Start Preparing' : '✓ Mark Ready'}
                  </Button>
                </div>
              ))}
              {!grouped[status].length && (
                <div style={{
                  textAlign:'center', padding:'30px 16px', color:'var(--text-muted)',
                  background:'var(--bg-card)', borderRadius:'var(--radius-lg)',
                  border:'1px dashed var(--border)', fontSize:13,
                }}>
                  {status === 'pending' ? '✅ No new orders' : '📭 Nothing preparing'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
