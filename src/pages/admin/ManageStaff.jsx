import React, { useState, useEffect, useCallback } from 'react';
import { staffApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';

const EMPTY = { name:'', email:'', password:'', role:'waiter' };

export default function ManageStaff() {
  const [staff,      setStaff]      = useState([]);
  const [modal,      setModal]      = useState({ open:false, type:'', item:null });
  const [form,       setForm]       = useState(EMPTY);
  const [confirm,    setConfirm]    = useState({ open:false, id:null });
  const [resetModal, setResetModal] = useState({ open:false, id:null, password:'' });
  const { execute, loading }        = useApi();
  const { success }                 = useToast();

  const load = useCallback(async () => {
    const data = await execute(staffApi.list, { silent:true });
    setStaff(data || []);
  }, [execute]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setModal({ open:true, type:'create', item:null }); };
  const openEdit   = (item) => { setForm({ name:item.name, email:item.email, password:'', role:item.role }); setModal({ open:true, type:'edit', item }); };

  const handleSave = async () => {
    if (modal.type === 'create') {
      await execute(() => staffApi.create(form));
      success('Staff member added');
    } else {
      await execute(() => staffApi.update(modal.item.id, { name:form.name, role:form.role }));
      success('Staff member updated');
    }
    setModal({ open:false, type:'', item:null });
    load();
  };

  const handleToggle = async (id) => {
    await execute(() => staffApi.toggle(id));
    success('Status updated');
    load();
  };

  const handleDelete = async () => {
    await execute(() => staffApi.delete(confirm.id));
    success('Staff member removed');
    setConfirm({ open:false, id:null });
    load();
  };

  const handleResetPwd = async () => {
    await execute(() => staffApi.resetPassword(resetModal.id, { password: resetModal.password }));
    success('Password reset successfully');
    setResetModal({ open:false, id:null, password:'' });
  };

  const roleColor = { waiter:'info', kitchen:'warning', cashier:'success' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontWeight:700, fontSize:20 }}>Manage Staff</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Add and manage your restaurant team</p>
        </div>
        <Button onClick={openCreate}>+ Add Staff</Button>
      </div>

      <Card bodyStyle={{ padding:0 }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
                {['Name','Email','Role','Status','Joined','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < staff.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding:'12px 16px', fontWeight:500 }}>{s.name}</td>
                  <td style={{ padding:'12px 16px', color:'var(--text-muted)', fontSize:13 }}>{s.email}</td>
                  <td style={{ padding:'12px 16px' }}><Badge type={roleColor[s.role] || 'default'}>{s.role}</Badge></td>
                  <td style={{ padding:'12px 16px' }}><Badge type={s.is_active ? 'success':'danger'}>{s.is_active ? 'Active':'Inactive'}</Badge></td>
                  <td style={{ padding:'12px 16px', color:'var(--text-muted)', fontSize:12 }}>{formatDateTime(s.created_at)}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <Button size="sm" variant="subtle" onClick={() => openEdit(s)}>Edit</Button>
                      <Button size="sm" variant={s.is_active ? 'danger' : 'success'} onClick={() => handleToggle(s.id)}>
                        {s.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setResetModal({ open:true, id:s.id, password:'' })}>Reset Pwd</Button>
                      <Button size="sm" variant="danger" onClick={() => setConfirm({ open:true, id:s.id })}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!staff.length && (
                <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>No staff members yet. Add your first team member.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({open:false,type:'',item:null})}
        title={modal.type === 'create' ? 'Add Staff Member' : 'Edit Staff Member'}
        footer={<>
          <Button variant="subtle" onClick={() => setModal({open:false,type:'',item:null})}>Cancel</Button>
          <Button onClick={handleSave} loading={loading}>
            {modal.type === 'create' ? 'Add Staff' : 'Save Changes'}
          </Button>
        </>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="Full Name" required value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Priya Sharma" />
          {modal.type === 'create' && (
            <>
              <Input label="Email" type="email" required value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
              <Input label="Password" type="password" required value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} hint="Min 6 characters" />
            </>
          )}
          <Input label="Role" type="select" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
            <option value="waiter">Waiter</option>
            <option value="kitchen">Kitchen</option>
            <option value="cashier">Cashier</option>
          </Input>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={resetModal.open} onClose={() => setResetModal({open:false,id:null,password:''})}
        title="Reset Password"
        footer={<>
          <Button variant="subtle" onClick={() => setResetModal({open:false,id:null,password:''})}>Cancel</Button>
          <Button onClick={handleResetPwd} loading={loading}>Reset Password</Button>
        </>}
      >
        <Input label="New Password" type="password" required
          value={resetModal.password}
          onChange={e => setResetModal(r => ({...r, password:e.target.value}))}
          hint="Min 6 characters"
        />
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({open:false,id:null})}
        onConfirm={handleDelete} loading={loading}
        title="Delete Staff Member"
        message="This staff member will be permanently removed. This action cannot be undone."
      />
    </div>
  );
}
