import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { menuApi, orderApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/formatters';

export default function CreateOrder() {
  const location              = useLocation();
  const navigate              = useNavigate();
  const { table, orderId }    = location.state || {};
  const [categories, setCategories] = useState([]);
  const [menuItems,  setMenuItems]  = useState([]);
  const [cart,       setCart]       = useState([]);
  const [activeCat,  setActiveCat]  = useState(null);
  const [notes,      setNotes]      = useState('');
  const [discount,   setDiscount]   = useState(0);
  const [noteModal,  setNoteModal]  = useState({ open:false, itemIdx:null, text:'' });
  const { execute, loading }        = useApi();
  const { success, error }          = useToast();

  useEffect(() => {
    if (!table) { navigate('/waiter/dashboard'); return; }
    execute(menuApi.categories, { silent:true }).then(data => {
      setCategories(data || []);
      if (data?.length) setActiveCat(data[0].id);
    });
  }, [table, navigate, execute]);

  useEffect(() => {
    if (!activeCat) return;
    execute(() => menuApi.items(activeCat), { silent:true }).then(data => setMenuItems(data || []));
  }, [activeCat, execute]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.findIndex(c => c.menu_item_id === item.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
        return updated;
      }
      return [...prev, { menu_item_id: item.id, name: item.name, price: +item.price, quantity: 1, notes: '' }];
    });
  };

  const removeFromCart = (idx) => setCart(prev => prev.filter((_, i) => i !== idx));

  const changeQty = (idx, delta) => {
    setCart(prev => {
      const updated = [...prev];
      const newQty = updated[idx].quantity + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== idx);
      updated[idx] = { ...updated[idx], quantity: newQty };
      return updated;
    });
  };

  const subtotal   = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const discountAmt= Math.min(+discount || 0, subtotal);
  const total      = Math.max(0, subtotal - discountAmt);

  const submitOrder = async () => {
    if (!cart.length) { error('Add at least one item'); return; }
    const payload = {
      table_id: table.id,
      items:    cart.map(c => ({ menu_item_id: c.menu_item_id, quantity: c.quantity, notes: c.notes })),
      notes,
      discount: discountAmt,
      tax_rate: 0,
    };
    await execute(() => orderApi.create(payload));
    success('Order placed successfully!');
    navigate('/waiter/dashboard');
  };

  if (!table) return null;

  const availableItems = menuItems.filter(i => +i.is_available);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => navigate('/waiter/dashboard')} style={{ fontSize:20, color:'var(--text-muted)', lineHeight:1 }}>←</button>
        <div>
          <h2 style={{ fontWeight:700, fontSize:20 }}>Table {table.table_number}</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Create new order</p>
        </div>
      </div>

      <div style={{ display:'grid', gap:16, gridTemplateColumns:'1fr auto' }}>
        {/* Menu Side */}
        <div>
          {/* Category tabs */}
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:14 }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{
                padding:'7px 16px', borderRadius:99, fontWeight:600, fontSize:13,
                whiteSpace:'nowrap', flexShrink:0, cursor:'pointer',
                background: activeCat === cat.id ? 'var(--primary)' : 'var(--bg-card)',
                color:      activeCat === cat.id ? '#fff' : 'var(--text)',
                border:     activeCat === cat.id ? 'none' : '1px solid var(--border)',
              }}>
                {cat.name}
                {cat.item_count > 0 && <span style={{ marginLeft:6, opacity:.7 }}>({cat.item_count})</span>}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div style={{ display:'grid', gap:10, gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))' }}>
            {availableItems.map(item => {
              const inCart = cart.find(c => c.menu_item_id === item.id);
              return (
                <div key={item.id} onClick={() => addToCart(item)} style={{
                  background:'var(--bg-card)', borderRadius:'var(--radius-lg)',
                  border: inCart ? '2px solid var(--primary)' : '1px solid var(--border)',
                  padding:14, cursor:'pointer', boxShadow:'var(--shadow)',
                  transition:'all var(--transition)',
                }}>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{item.name}</div>
                  {item.description && (
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6, overflow:'hidden', maxHeight:32 }}>
                      {item.description}
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:700, color:'var(--primary)' }}>{formatCurrency(item.price)}</span>
                    {inCart && <Badge type="primary">×{inCart.quantity}</Badge>}
                  </div>
                </div>
              );
            })}
            {!availableItems.length && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:30, color:'var(--text-muted)', fontSize:13 }}>
                No items available in this category
              </div>
            )}
          </div>
        </div>

        {/* Cart Side */}
        <div style={{ width:280, position:'sticky', top:80, alignSelf:'start' }}>
          <Card title={`Cart (${cart.length} items)`} bodyStyle={{ padding:12 }}>
            {cart.length === 0 && (
              <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'20px 0', fontSize:13 }}>
                Tap items to add them here
              </p>
            )}

            {cart.map((item, idx) => (
              <div key={idx} style={{
                padding:'8px 0', borderBottom:'1px solid var(--border)',
                display:'flex', flexDirection:'column', gap:4,
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:500, fontSize:13, flex:1 }}>{item.name}</span>
                  <button onClick={() => removeFromCart(idx)} style={{ fontSize:16, color:'var(--danger)', lineHeight:1 }}>×</button>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <button onClick={() => changeQty(idx, -1)} style={{
                      width:24, height:24, borderRadius:6, background:'var(--border)',
                      fontWeight:700, fontSize:14, lineHeight:1,
                    }}>−</button>
                    <span style={{ fontWeight:700, minWidth:20, textAlign:'center' }}>{item.quantity}</span>
                    <button onClick={() => changeQty(idx, +1)} style={{
                      width:24, height:24, borderRadius:6, background:'var(--primary)', color:'#fff',
                      fontWeight:700, fontSize:14, lineHeight:1,
                    }}>+</button>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <button onClick={() => setNoteModal({ open:true, itemIdx:idx, text:item.notes || '' })} style={{
                      fontSize:14, color:'var(--text-muted)',
                    }}>📝</button>
                    <span style={{ fontWeight:600, color:'var(--primary)', fontSize:13 }}>
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
                {item.notes && (
                  <div style={{ fontSize:11, color:'var(--text-muted)', fontStyle:'italic' }}>"{item.notes}"</div>
                )}
              </div>
            ))}

            {cart.length > 0 && (
              <div style={{ marginTop:10 }}>
                <Input label="Order Notes" type="textarea"
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any special instructions..." style={{ marginBottom:8 }}
                />
                <Input label="Discount (₹)" type="number"
                  value={discount} onChange={e => setDiscount(e.target.value)}
                  style={{ marginBottom:10 }}
                />
                <div style={{ fontSize:13, display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text-muted)' }}>
                    <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div style={{ display:'flex', justifyContent:'space-between', color:'var(--success)' }}>
                      <span>Discount</span><span>−{formatCurrency(discountAmt)}</span>
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:15 }}>
                    <span>Total</span><span style={{ color:'var(--primary)' }}>{formatCurrency(total)}</span>
                  </div>
                </div>
                <Button fullWidth onClick={submitOrder} loading={loading}>
                  🍽 Place Order
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Item Note Modal */}
      <Modal open={noteModal.open} onClose={() => setNoteModal({open:false,itemIdx:null,text:''})}
        title="Add Item Note" width={360}
        footer={<>
          <Button variant="subtle" onClick={() => setNoteModal({open:false,itemIdx:null,text:''})}>Cancel</Button>
          <Button onClick={() => {
            setCart(prev => {
              const updated = [...prev];
              updated[noteModal.itemIdx] = { ...updated[noteModal.itemIdx], notes: noteModal.text };
              return updated;
            });
            setNoteModal({open:false,itemIdx:null,text:''});
          }}>Save Note</Button>
        </>}
      >
        <Input type="textarea" label="Note" value={noteModal.text}
          onChange={e => setNoteModal(n => ({...n, text: e.target.value}))}
          placeholder="e.g. No spice, extra sauce..."
        />
      </Modal>
    </div>
  );
}
