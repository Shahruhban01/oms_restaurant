import React, { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';

const EMPTY = { name:'', quantity:'', unit:'', low_stock_threshold:'' };

export default function ManageInventory() {
  const [items,      setItems]      = useState([]);
  const [modal,      setModal]      = useState({ open:false, item:null });
  const [form,       setForm]       = useState(EMPTY);
  const [adjModal,   setAdjModal]   = useState({ open:false, id:null, change:'', reason:'' });
  const [logModal,   setLogModal]   = useState({ open:false, id:null, logs:[] });
  const [confirm,    setConfirm]    = useState({ open:false, id:null });
  const { execute, loading }        = useApi();
  const { success }                 = useToast();

  const load = useCallback(async () => {
    const data = await execute(inventoryApi.list, { silent:true });
    setItems(data || []);
  }, [execute]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const payload = { ...form, quantity:+form.quantity, low_stock_threshold:+form.low_stock_threshold };
    if (modal.item) {
      await execute(() => inventoryApi.update(modal.item.id, payload));
      success('Item updated');
    } else {
      await execute(() => inventoryApi.create(payload));
      success('Item added');
    }
    setModal({ open:false, item:null });
    load();
  };

  const handleAdjust = async () => {
    await execute(() => inventoryApi.adjust(adjModal.id, {
      quantity_change: +adjModal.change,
      reason: adjModal.reason,
    }));
    success('Stock adjusted');
    setAdjModal({ open:false, id:null, change:'', reason:'' });
    load();
  };

  const openLogs = async (id) => {
    const data = await execute(() => inventoryApi.logs(id));
    setLogModal({ open:true, id, logs: data || [] });
  };

  const handleDelete = async () => {
    await execute(() => inventoryApi.delete(confirm.id));
    success('Item deleted');
    setConfirm({ open:false, id:null });
    load();
  };

  const stockLevel = (item) => {
    if (+item.quantity <= 0) return 'danger';
    if (+item.quantity <= +item.low_stock_threshold) return 'warning';
    return 'success';
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontWeight:700, fontSize:20 }}>Inventory</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Track and manage stock levels</p>
        </div>
        <Button onClick={() => { setForm(EMPTY); setModal({ open:true, item:null }); }}>+ Add Item</Button>
      </div>

      {items.filter(i => +i.quantity <= +i.low_stock_threshold).length > 0 && (
        <div style={{
          background:'var(--warning-light)', border:'1px solid var(--warning)',
          borderRadius:'var(--radius)', padding:'10px 16px', marginBottom:16, fontSize:13,
        }}>
          ⚠️ <strong>{items.filter(i => +i.quantity <= +i.low_stock_threshold).length} items</strong> are running low or out of stock!
        </div>
      )}

      <Card bodyStyle={{ padding:0 }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                {['Name','Quantity','Unit','Low Stock At','Level','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < items.length-1 ? '1px solid var(--border)':'none' }}>
                  <td style={{ padding:'12px 16px', fontWeight:500 }}>{item.name}</td>
                  <td style={{ padding:'12px 16px', fontWeight:700 }}>{item.quantity}</td>
                  <td style={{ padding:'12px 16px', color:'var(--text-muted)' }}>{item.unit}</td>
                  <td style={{ padding:'12px 16px', color:'var(--text-muted)' }}>{item.low_stock_threshold}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <Badge type={stockLevel(item)}>
                      {+item.quantity <= 0 ? 'Out of Stock' : +item.quantity <= +item.low_stock_threshold ? 'Low Stock' : 'OK'}
                    </Badge>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <Button size="sm" variant="subtle" onClick={() => { setForm({name:item.name,quantity:item.quantity,unit:item.unit,low_stock_threshold:item.low_stock_threshold}); setModal({open:true,item}); }}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAdjModal({open:true,id:item.id,change:'',reason:''})}>Adjust</Button>
                      <Button size="sm" variant="subtle" onClick={() => openLogs(item.id)}>Logs</Button>
                      <Button size="sm" variant="danger" onClick={() => setConfirm({open:true,id:item.id})}>Del</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>No inventory items. Start by adding stock.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({open:false,item:null})}
        title={modal.item ? 'Edit Item':'Add Inventory Item'} width={420}
        footer={<>
          <Button variant="subtle" onClick={() => setModal({open:false,item:null})}>Cancel</Button>
          <Button onClick={handleSave} loading={loading}>{modal.item ? 'Update':'Add'}</Button>
        </>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="Item Name" required value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
          {!modal.item && <Input label="Initial Quantity" type="number" required value={form.quantity} onChange={e => setForm(f=>({...f,quantity:e.target.value}))} />}
          <Input label="Unit" required value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))} placeholder="e.g. kg, liters, pcs" />
          <Input label="Low Stock Alert Threshold" type="number" required value={form.low_stock_threshold} onChange={e => setForm(f=>({...f,low_stock_threshold:e.target.value}))} hint="Alert when quantity falls below this" />
        </div>
      </Modal>

      {/* Adjust Modal */}
      <Modal open={adjModal.open} onClose={() => setAdjModal({open:false,id:null,change:'',reason:''})}
        title="Adjust Stock" width={380}
        footer={<>
          <Button variant="subtle" onClick={() => setAdjModal({open:false,id:null,change:'',reason:''})}>Cancel</Button>
          <Button onClick={handleAdjust} loading={loading}>Adjust</Button>
        </>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="Quantity Change" type="number" required value={adjModal.change}
            onChange={e => setAdjModal(a=>({...a,change:e.target.value}))}
            hint="Use positive to add, negative to deduct (e.g. -5)" />
          <Input label="Reason" required value={adjModal.reason}
            onChange={e => setAdjModal(a=>({...a,reason:e.target.value}))}
            placeholder="e.g. Manual restock, spoilage..." />
        </div>
      </Modal>

      {/* Logs Modal */}
      <Modal open={logModal.open} onClose={() => setLogModal({open:false,id:null,logs:[]})}
        title="Stock History" width={520}
      >
        <div style={{ maxHeight:360, overflowY:'auto' }}>
          {logModal.logs.map((log, i) => (
            <div key={i} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13,
            }}>
              <div>
                <span style={{ fontWeight:600, color: +log.quantity_change >= 0 ? 'var(--success)':'var(--danger)' }}>
                  {+log.quantity_change >= 0 ? '+':''}{log.quantity_change}
                </span>
                <span style={{ color:'var(--text-muted)', marginLeft:10 }}>{log.reason}</span>
                {log.user_name && <span style={{ color:'var(--text-muted)', marginLeft:6, fontSize:11 }}>by {log.user_name}</span>}
              </div>
              <span style={{ color:'var(--text-muted)', fontSize:11, whiteSpace:'nowrap' }}>{formatDateTime(log.created_at)}</span>
            </div>
          ))}
          {!logModal.logs.length && <p style={{ textAlign:'center', color:'var(--text-muted)', padding:20 }}>No log entries</p>}
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({open:false,id:null})}
        onConfirm={handleDelete} loading={loading}
        title="Delete Inventory Item" message="This will permanently remove this item and all its logs." />
    </div>
  );
}
