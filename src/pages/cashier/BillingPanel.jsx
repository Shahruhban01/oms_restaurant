import React, { useState, useEffect, useCallback } from 'react';
import { billingApi, orderApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { formatCurrency, formatDateTime, statusColor } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../utils/constants';

export default function BillingPanel({ summary = false }) {
  const [orders,     setOrders]     = useState([]);
  const [bill,       setBill]       = useState(null);
  const [payModal,   setPayModal]   = useState({ open:false, orderId:null, method:'cash' });
  const [daySummary, setDaySummary] = useState(null);
  const { execute, loading }        = useApi();
  const { success }                 = useToast();

  const loadOrders = useCallback(async () => {
    const data = await execute(orderApi.active, { silent:true });
    setOrders((data || []).filter(o => o.payment_status === 'unpaid'));
  }, [execute]);

  const loadDaySummary = useCallback(async () => {
    const data = await execute(() => billingApi.dailySummary(new Date().toISOString().split('T')[0]), { silent:true });
    setDaySummary(data);
  }, [execute]);

  useEffect(() => {
    if (summary) loadDaySummary();
    else loadOrders();
  }, [summary, loadOrders, loadDaySummary]);

  const openBill = async (orderId) => {
    const data = await execute(() => billingApi.preview(orderId));
    setBill(data);
    setPayModal({ open:true, orderId, method:'cash' });
  };

  const processPayment = async () => {
    await execute(() => billingApi.pay(payModal.orderId, { payment_method: payModal.method }));
    success('Payment processed successfully!');
    setPayModal({ open:false, orderId:null, method:'cash' });
    setBill(null);
    loadOrders();
  };

  if (summary) {
    return (
      <div>
        <h2 style={{ fontWeight:700, fontSize:20, marginBottom:20 }}>Daily Summary</h2>
        {daySummary ? (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))' }}>
              {[
                { label:'Total Revenue',  value: formatCurrency(daySummary.total_revenue),  icon:'💰' },
                { label:'Orders Paid',    value: daySummary.order_count,                    icon:'📦' },
              ].map(s => (
                <Card key={s.label}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontSize:22, fontWeight:700 }}>{s.value}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{s.label}</div>
                </Card>
              ))}
            </div>

            <Card title="Revenue by Payment Method">
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {Object.entries(daySummary.by_method || {}).map(([method, amount]) => (
                  <div key={method} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:16 }}>
                        {method === 'cash' ? '💵' : method === 'card' ? '💳' : method === 'upi' ? '📱' : '💰'}
                      </span>
                      <span style={{ textTransform:'capitalize', fontWeight:500 }}>{method}</span>
                    </div>
                    <span style={{ fontWeight:700, color:'var(--success)' }}>{formatCurrency(amount)}</span>
                  </div>
                ))}
                {!Object.keys(daySummary.by_method || {}).length && (
                  <p style={{ color:'var(--text-muted)', textAlign:'center' }}>No payments today</p>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <p style={{ color:'var(--text-muted)' }}>Loading summary...</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontWeight:700, fontSize:20 }}>Billing Panel</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Process payments for completed orders</p>
        </div>
        <Badge type="info">{orders.length} pending</Badge>
      </div>

      <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))' }}>
        {orders.map(order => (
          <Card key={order.id}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:16 }}>Table {order.table_number}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>Order #{order.id} · {formatDateTime(order.created_at)}</div>
              </div>
              <Badge type={statusColor(order.status)}>{order.status}</Badge>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ color:'var(--text-muted)', fontSize:13 }}>Total Amount</span>
              <span style={{ fontWeight:700, fontSize:18, color:'var(--primary)' }}>{formatCurrency(order.total)}</span>
            </div>
            <Button fullWidth onClick={() => openBill(order.id)}>
              💳 Process Payment
            </Button>
          </Card>
        ))}
        {!orders.length && (
          <div style={{
            gridColumn:'1/-1', textAlign:'center', padding:60,
            color:'var(--text-muted)', background:'var(--bg-card)',
            borderRadius:'var(--radius-lg)', border:'1px dashed var(--border)',
          }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontWeight:600, fontSize:16 }}>All clear!</div>
            <div style={{ fontSize:13, marginTop:4 }}>No pending payments</div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal open={payModal.open} onClose={() => { setPayModal({open:false,orderId:null,method:'cash'}); setBill(null); }}
        title="Process Payment" width={460}
        footer={<>
          <Button variant="subtle" onClick={() => { setPayModal({open:false,orderId:null,method:'cash'}); setBill(null); }}>Cancel</Button>
          <Button onClick={processPayment} loading={loading} variant="success">✓ Confirm Payment</Button>
        </>}
      >
        {bill && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Bill items */}
            <div style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:12 }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:8, color:'var(--text-muted)' }}>ORDER ITEMS</div>
              {(bill.items || []).map((item, i) => (
                <div key={i} style={{
                  display:'flex', justifyContent:'space-between',
                  padding:'6px 0', borderBottom: i < bill.items.length-1 ? '1px dashed var(--border)':'none',
                  fontSize:13,
                }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span style={{ fontWeight:500 }}>{formatCurrency(item.total_price)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:13 }}>
              <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(bill.subtotal)}</span>
              </div>
              {(+bill.tax_amount) > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text-muted)' }}>
                  <span>Tax ({bill.tax_rate}%)</span>
                  <span>{formatCurrency(bill.tax_amount)}</span>
                </div>
              )}
              {(+bill.discount) > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', color:'var(--success)' }}>
                  <span>Discount</span>
                  <span>-{formatCurrency(bill.discount)}</span>
                </div>
              )}
              <div style={{
                display:'flex', justifyContent:'space-between',
                fontWeight:700, fontSize:16, paddingTop:8,
                borderTop:'2px solid var(--border)',
              }}>
                <span>Total</span>
                <span style={{ color:'var(--primary)' }}>{formatCurrency(bill.total)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <Input label="Payment Method" type="select"
              value={payModal.method}
              onChange={e => setPayModal(p => ({...p, method:e.target.value}))}
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </Input>
          </div>
        )}
      </Modal>
    </div>
  );
}
