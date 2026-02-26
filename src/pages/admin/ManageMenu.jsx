import React, { useState, useEffect, useCallback } from 'react';
import { menuApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatCurrency } from '../../utils/formatters';

export default function ManageMenu() {
  const [categories, setCategories] = useState([]);
  const [items,      setItems]      = useState([]);
  const [activeCat,  setActiveCat]  = useState(null);
  const [catModal,   setCatModal]   = useState({ open:false, item:null });
  const [itemModal,  setItemModal]  = useState({ open:false, item:null });
  const [catForm,    setCatForm]    = useState({ name:'', sort_order:0 });
  const [itemForm,   setItemForm]   = useState({ name:'', description:'', price:'', category_id:'', sort_order:0 });
  const [confirm,    setConfirm]    = useState({ open:false, type:'', id:null });
  const { execute, loading }        = useApi();
  const { success }                 = useToast();

  const loadCats = useCallback(async () => {
    const data = await execute(menuApi.categories, { silent:true });
    setCategories(data || []);
    if (data?.length && !activeCat) setActiveCat(data[0].id);
  }, [execute, activeCat]);

  const loadItems = useCallback(async (catId) => {
    if (!catId) return;
    const data = await execute(() => menuApi.items(catId), { silent:true });
    setItems(data || []);
  }, [execute]);

  useEffect(() => { loadCats(); }, [loadCats]);
  useEffect(() => { loadItems(activeCat); }, [activeCat, loadItems]);

  const handleSaveCat = async () => {
    if (catModal.item) {
      await execute(() => menuApi.updateCategory(catModal.item.id, catForm));
      success('Category updated');
    } else {
      await execute(() => menuApi.createCategory(catForm));
      success('Category created');
    }
    setCatModal({ open:false, item:null });
    loadCats();
  };

  const handleSaveItem = async () => {
    const payload = { ...itemForm, price:+itemForm.price, category_id:+itemForm.category_id || activeCat };
    if (itemModal.item) {
      await execute(() => menuApi.updateItem(itemModal.item.id, payload));
      success('Item updated');
    } else {
      await execute(() => menuApi.createItem(payload));
      success('Item created');
    }
    setItemModal({ open:false, item:null });
    loadItems(activeCat);
  };

  const handleToggleItem = async (id) => {
    await execute(() => menuApi.toggleItem(id));
    loadItems(activeCat);
  };

  const handleDelete = async () => {
    if (confirm.type === 'category') {
      await execute(() => menuApi.deleteCategory(confirm.id));
      success('Category deleted');
      setActiveCat(null);
      loadCats();
    } else {
      await execute(() => menuApi.deleteItem(confirm.id));
      success('Item deleted');
      loadItems(activeCat);
    }
    setConfirm({ open:false, type:'', id:null });
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontWeight:700, fontSize:20 }}>Manage Menu</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Organize categories and items</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Button variant="subtle" onClick={() => { setCatForm({name:'',sort_order:0}); setCatModal({open:true,item:null}); }}>
            + Category
          </Button>
          <Button onClick={() => { setItemForm({name:'',description:'',price:'',category_id:activeCat||'',sort_order:0}); setItemModal({open:true,item:null}); }}>
            + Add Item
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:16 }}>
        {categories.map(cat => (
          <div key={cat.id} style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'7px 14px', borderRadius:99, whiteSpace:'nowrap',
            background: activeCat === cat.id ? 'var(--primary)' : 'var(--bg-card)',
            color:      activeCat === cat.id ? '#fff' : 'var(--text)',
            border:     activeCat === cat.id ? 'none' : '1px solid var(--border)',
            cursor:'pointer', fontSize:13, fontWeight:600,
          }}>
            <span onClick={() => setActiveCat(cat.id)}>{cat.name} ({cat.item_count})</span>
            <button onClick={() => { setCatForm({name:cat.name,sort_order:cat.sort_order}); setCatModal({open:true,item:cat}); }}
              style={{ fontSize:12, color:'inherit', opacity:.7 }}>✎</button>
            <button onClick={() => setConfirm({open:true,type:'category',id:cat.id})}
              style={{ fontSize:14, color:'inherit', opacity:.7 }}>×</button>
          </div>
        ))}
      </div>

      {/* Items table */}
      <Card bodyStyle={{ padding:0 }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                {['Name','Description','Price','Available','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < items.length-1 ? '1px solid var(--border)':'none' }}>
                  <td style={{ padding:'12px 16px', fontWeight:500 }}>{item.name}</td>
                  <td style={{ padding:'12px 16px', color:'var(--text-muted)', fontSize:12, maxWidth:200 }}>
                    <span style={{ overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                      {item.description || '—'}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px', fontWeight:600, color:'var(--primary)' }}>{formatCurrency(item.price)}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <Badge type={item.is_available ? 'success':'danger'}>{item.is_available ? 'Yes':'No'}</Badge>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <Button size="sm" variant="subtle" onClick={() => {
                        setItemForm({ name:item.name, description:item.description||'', price:item.price, category_id:item.category_id, sort_order:item.sort_order });
                        setItemModal({ open:true, item });
                      }}>Edit</Button>
                      <Button size="sm" variant={item.is_available ? 'danger':'success'} onClick={() => handleToggleItem(item.id)}>
                        {item.is_available ? 'Hide':'Show'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setConfirm({open:true,type:'item',id:item.id})}>Del</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td colSpan={5} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>
                  {activeCat ? 'No items in this category. Add your first item.' : 'Select a category first.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Category Modal */}
      <Modal open={catModal.open} onClose={() => setCatModal({open:false,item:null})}
        title={catModal.item ? 'Edit Category':'Add Category'} width={360}
        footer={<>
          <Button variant="subtle" onClick={() => setCatModal({open:false,item:null})}>Cancel</Button>
          <Button onClick={handleSaveCat} loading={loading}>{catModal.item ? 'Update':'Create'}</Button>
        </>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="Category Name" required value={catForm.name} onChange={e => setCatForm(f=>({...f,name:e.target.value}))} />
          <Input label="Sort Order" type="number" value={catForm.sort_order} onChange={e => setCatForm(f=>({...f,sort_order:+e.target.value}))} hint="Lower = shows first" />
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal open={itemModal.open} onClose={() => setItemModal({open:false,item:null})}
        title={itemModal.item ? 'Edit Item':'Add Menu Item'} width={460}
        footer={<>
          <Button variant="subtle" onClick={() => setItemModal({open:false,item:null})}>Cancel</Button>
          <Button onClick={handleSaveItem} loading={loading}>{itemModal.item ? 'Update':'Create'}</Button>
        </>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="Item Name" required value={itemForm.name} onChange={e => setItemForm(f=>({...f,name:e.target.value}))} />
          <Input label="Description" type="textarea" value={itemForm.description} onChange={e => setItemForm(f=>({...f,description:e.target.value}))} />
          <Input label="Price (₹)" type="number" required value={itemForm.price} onChange={e => setItemForm(f=>({...f,price:e.target.value}))} />
          <Input label="Category" type="select" value={itemForm.category_id || activeCat || ''} onChange={e => setItemForm(f=>({...f,category_id:e.target.value}))}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Input>
          <Input label="Sort Order" type="number" value={itemForm.sort_order} onChange={e => setItemForm(f=>({...f,sort_order:+e.target.value}))} />
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({open:false,type:'',id:null})}
        onConfirm={handleDelete} loading={loading}
        title={`Delete ${confirm.type === 'category' ? 'Category':'Item'}`}
        message={`This will permanently delete this ${confirm.type}. ${confirm.type === 'category' ? 'Remove all items first.' : ''}`}
      />
    </div>
  );
}
