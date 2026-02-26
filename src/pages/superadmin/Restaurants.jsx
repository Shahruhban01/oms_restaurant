import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { superAdminApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';

const PLAN_OPTIONS = ['free','pro_once','pro_monthly','enterprise'];
const EMPTY_FORM = { name:'', admin_name:'', admin_email:'', admin_password:'', plan:'free' };

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [modal,       setModal]       = useState({ open:false });
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [planModal,   setPlanModal]   = useState({ open:false, id:null, plan:'free' });
  const [pwdModal,    setPwdModal]    = useState({ open:false, id:null, password:'' });
  const [toggleConf,  setToggleConf]  = useState({ open:false, id:null, name:'', isActive:false });
  const [search,      setSearch]      = useState('');
  const { execute, loading }          = useApi();
  const { success }                   = useToast();

  const load = useCallback(async () => {
    const data = await execute(superAdminApi.listRestaurants, { silent:true });
    setRestaurants(data || []);
  }, [execute]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    await execute(() => superAdminApi.createRestaurant(form));
    success('Restaurant created successfully');
    setModal({ open:false });
    setForm(EMPTY_FORM);
    load();
  };

  const handleToggle = async () => {
    await execute(() => superAdminApi.toggleRestaurant(toggleConf.id));
    success(`Restaurant ${toggleConf.isActive ? 'suspended' : 'activated'}`);
    setToggleConf({ open:false, id:null, name:'', isActive:false });
    load();
  };

  const handlePlanUpdate = async () => {
    await execute(() => superAdminApi.updatePlan(planModal.id, { plan: planModal.plan }));
    success('Plan updated');
    setPlanModal({ open:false, id:null, plan:'free' });
    load();
  };

  const handleResetPwd = async () => {
    await execute(() => superAdminApi.resetAdminPassword(pwdModal.id, { password: pwdModal.password }));
    success('Admin password reset');
    setPwdModal({ open:false, id:null, password:'' });
  };

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const planColor = { free:'default', pro_once:'success', pro_monthly:'info', enterprise:'primary' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontWeight:700, fontSize:20 }}>Restaurants</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Manage all tenant restaurants</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search restaurants..." style={{
              padding:'8px 12px', borderRadius:'var(--radius)', border:'1px solid var(--border)',
              fontSize:13, outline:'none',
            }}
          />
          <Button onClick={() => { setForm(EMPTY_FORM); setModal({ open:true }); }}>+ Add Restaurant</Button>
        </div>
      </div>

      <Card bodyStyle={{ padding:0 }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                {['Name','Plan','Status','Orders','Created','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid var(--border)':'none' }}>
                  <td style={{ padding:'12px 16px' }}>
                    <Link to={`/superadmin/restaurants/${r.id}`} style={{ fontWeight:600, color:'var(--primary)' }}>
                      {r.name}
                    </Link>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <Badge type={planColor[r.plan] || 'default'}>{r.plan?.replace('_',' ')}</Badge>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <Badge type={r.is_active ? 'success':'danger'}>{r.is_active ? 'Active':'Suspended'}</Badge>
                  </td>
                  <td style={{ padding:'12px 16px', color:'var(--text-muted)', fontSize:13 }}>{r.total_orders ?? 0}</td>
                  <td style={{ padding:'12px 16px', color:'var(--text-muted)', fontSize:12 }}>{formatDateTime(r.created_at)}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <Button size="sm" variant="ghost"
                        onClick={() => setPlanModal({ open:true, id:r.id, plan:r.plan })}>
                        Plan
                      </Button>
                      <Button size="sm" variant="subtle"
                        onClick={() => setPwdModal({ open:true, id:r.id, password:'' })}>
                        Pwd
                      </Button>
                      <Button size="sm" variant={r.is_active ? 'danger':'success'}
                        onClick={() => setToggleConf({ open:true, id:r.id, name:r.name, isActive:!!r.is_active })}>
                        {r.is_active ? 'Suspend':'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>No restaurants found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Restaurant Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open:false })} title="Create Restaurant" width={460}
        footer={<>
          <Button variant="subtle" onClick={() => setModal({ open:false })}>Cancel</Button>
          <Button onClick={handleCreate} loading={loading}>Create Restaurant</Button>
        </>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="Restaurant Name" required value={form.name}
            onChange={e => setForm(f=>({...f,name:e.target.value}))} />
          <Input label="Admin Full Name" required value={form.admin_name}
            onChange={e => setForm(f=>({...f,admin_name:e.target.value}))} />
          <Input label="Admin Email" type="email" required value={form.admin_email}
            onChange={e => setForm(f=>({...f,admin_email:e.target.value}))} />
          <Input label="Admin Password" type="password" required value={form.admin_password}
            onChange={e => setForm(f=>({...f,admin_password:e.target.value}))} hint="Min 8 characters" />
          <Input label="Plan" type="select" value={form.plan}
            onChange={e => setForm(f=>({...f,plan:e.target.value}))}>
            {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p.replace('_',' ')}</option>)}
          </Input>
        </div>
      </Modal>

      {/* Update Plan Modal */}
      <Modal open={planModal.open} onClose={() => setPlanModal({open:false,id:null,plan:'free'})} title="Update Plan" width={360}
        footer={<>
          <Button variant="subtle" onClick={() => setPlanModal({open:false,id:null,plan:'free'})}>Cancel</Button>
          <Button onClick={handlePlanUpdate} loading={loading}>Update Plan</Button>
        </>}
      >
        <Input label="Select Plan" type="select" value={planModal.plan}
          onChange={e => setPlanModal(p=>({...p,plan:e.target.value}))}>
          {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p.replace('_',' ')}</option>)}
        </Input>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={pwdModal.open} onClose={() => setPwdModal({open:false,id:null,password:''})} title="Reset Admin Password" width={360}
        footer={<>
          <Button variant="subtle" onClick={() => setPwdModal({open:false,id:null,password:''})}>Cancel</Button>
          <Button onClick={handleResetPwd} loading={loading}>Reset Password</Button>
        </>}
      >
        <Input label="New Password" type="password" required value={pwdModal.password}
          onChange={e => setPwdModal(p=>({...p,password:e.target.value}))} hint="Min 8 characters" />
      </Modal>

      <ConfirmDialog open={toggleConf.open}
        onClose={() => setToggleConf({open:false,id:null,name:'',isActive:false})}
        onConfirm={handleToggle} loading={loading}
        title={toggleConf.isActive ? 'Suspend Restaurant' : 'Activate Restaurant'}
        message={`Are you sure you want to ${toggleConf.isActive ? 'suspend' : 'activate'} "${toggleConf.name}"?`}
        variant={toggleConf.isActive ? 'danger' : 'success'}
      />
    </div>
  );
}
