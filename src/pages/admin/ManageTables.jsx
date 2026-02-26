import React, { useState, useEffect, useCallback } from 'react';
import { tableApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { statusColor, capitalize } from '../../utils/formatters';

export default function ManageTables() {
  const [tables,  setTables]  = useState([]);
  const [modal,   setModal]   = useState({ open:false, item:null });
  const [form,    setForm]    = useState({ table_number:'', capacity:4 });
  const [confirm, setConfirm] = useState({ open:false, id:null });
  const { execute, loading }  = useApi();
  const { success }           = useToast();

  const load = useCallback(async () => {
    const data = await execute(tableApi.list, { silent:true });
    setTables(data || []);
  }, [execute]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ table_number:'', capacity:4 }); setModal({ open:true, item:null }); };
  const openEdit   = (item) => { setForm({ table_number:item.table_number, capacity:item.capacity }); setModal({ open:true, item }); };

  const handleSave = async () => {
    if (modal.item) {
      await execute(() => tableApi.update(modal.item.id, { capacity: form.capacity }));
      success('Table updated');
    } else {
      await execute(() => tableApi.create(form));
      success('Table created');
    }
    setModal({ open:false, item:null });
    load();
  };

  const handleDelete = async () => {
    await execute(() => tableApi.delete(confirm.id));
    success('Table deleted');
    setConfirm({ open:false, id:null });
    load();
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontWeight:700, fontSize:20 }}>Manage Tables</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Configure your restaurant floor layout</p>
        </div>
        <Button onClick={openCreate}>+ Add Table</Button>
      </div>

      <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))' }}>
        {tables.map(table => (
          <Card key={table.id} style={{ textAlign:'center' }} bodyStyle={{ padding:16 }}>
            <div style={{ fontSize:32, fontWeight:800, color:'var(--primary)', marginBottom:4 }}>T{table.table_number}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>Seats {table.capacity}</div>
            <Badge type={statusColor(table.status)} style={{ marginBottom:12 }}>{capitalize(table.status)}</Badge>
            <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
              <Button size="sm" variant="subtle" onClick={() => openEdit(table)}>Edit</Button>
              {table.status !== 'occupied' && (
                <Button size="sm" variant="danger" onClick={() => setConfirm({ open:true, id:table.id })}>Del</Button>
              )}
            </div>
          </Card>
        ))}
        {!tables.length && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40, color:'var(--text-muted)', background:'var(--bg-card)', borderRadius:'var(--radius-lg)', border:'1px dashed var(--border)' }}>
            No tables configured yet. Add your first table.
          </div>
        )}
      </div>

      <Modal open={modal.open} onClose={() => setModal({open:false,item:null})}
        title={modal.item ? 'Edit Table' : 'Add Table'} width={360}
        footer={<>
          <Button variant="subtle" onClick={() => setModal({open:false,item:null})}>Cancel</Button>
          <Button onClick={handleSave} loading={loading}>{modal.item ? 'Update' : 'Add Table'}</Button>
        </>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {!modal.item && (
            <Input label="Table Number" type="number" required value={form.table_number}
              onChange={e => setForm(f=>({...f,table_number:e.target.value}))} />
          )}
          <Input label="Seating Capacity" type="number" required value={form.capacity}
            onChange={e => setForm(f=>({...f,capacity:e.target.value}))} />
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({open:false,id:null})}
        onConfirm={handleDelete} loading={loading}
        title="Delete Table" message="Are you sure you want to delete this table?" />
    </div>
  );
}
