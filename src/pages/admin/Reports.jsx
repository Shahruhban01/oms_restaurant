import React, { useState, useEffect } from 'react';
import { reportApi, billingApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function Reports() {
  const [activeTab, setActiveTab]   = useState('daily');
  const [daily,     setDaily]       = useState(null);
  const [weekly,    setWeekly]      = useState([]);
  const [monthly,   setMonthly]     = useState([]);
  const [bestSell,  setBestSell]    = useState([]);
  const [staff,     setStaff]       = useState([]);
  const [loading,   setLoading]     = useState(false);
  const [date,      setDate]        = useState(new Date().toISOString().split('T')[0]);
  const [year,      setYear]        = useState(new Date().getFullYear());
  const [month,     setMonth]       = useState(new Date().getMonth() + 1);

  const load = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'daily')   { const r = await reportApi.daily(date);         setDaily(r.data?.data); }
      if (tab === 'weekly')  { const r = await reportApi.weekly();            setWeekly(r.data?.data || []); }
      if (tab === 'monthly') { const r = await reportApi.monthly(year,month); setMonthly(r.data?.data || []); }
      if (tab === 'items')   { const r = await reportApi.bestSelling(15);     setBestSell(r.data?.data || []); }
      if (tab === 'staff')   { const r = await reportApi.staffPerformance();  setStaff(r.data?.data || []); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(activeTab); }, [activeTab, date, year, month]);

  const tabs = [
    { id:'daily',   label:'Daily' },
    { id:'weekly',  label:'Weekly' },
    { id:'monthly', label:'Monthly' },
    { id:'items',   label:'Best Sellers' },
    { id:'staff',   label:'Staff' },
  ];

  return (
    <div>
      <h2 style={{ fontWeight:700, fontSize:20, marginBottom:4 }}>Reports & Analytics</h2>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>Track revenue, sales, and performance</p>

      {/* Tab Bar */}
      <div style={{ display:'flex', gap:8, marginBottom:20, borderBottom:'1px solid var(--border)', paddingBottom:0, overflowX:'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding:'10px 18px', fontWeight:600, fontSize:13, cursor:'pointer',
            borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === t.id ? 'var(--primary)' : 'var(--text-muted)',
            background:'none', whiteSpace:'nowrap',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ display:'flex', justifyContent:'center', padding:40 }}><Spinner size={28}/></div>}

      {/* Daily */}
      {!loading && activeTab === 'daily' && (
        <div>
          <div style={{ display:'flex', gap:12, marginBottom:16, alignItems:'center' }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{
              padding:'8px 12px', borderRadius:'var(--radius)', border:'1px solid var(--border)', fontSize:13, outline:'none',
            }}/>
          </div>
          {daily && (
            <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))' }}>
              {[
                { label:'Orders',         value: daily.order_count,               icon:'📦' },
                { label:'Revenue',        value: formatCurrency(daily.revenue),    icon:'💰' },
                { label:'Tax Collected',  value: formatCurrency(daily.tax_collected), icon:'🏛️' },
                { label:'Discounts',      value: formatCurrency(daily.discounts_given), icon:'🎁' },
              ].map(s => (
                <Card key={s.label}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontSize:20, fontWeight:700 }}>{s.value}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{s.label}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weekly */}
      {!loading && activeTab === 'weekly' && (
        <Card title="Last 7 Days Revenue">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Date','Orders','Revenue'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-muted)', borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekly.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < weekly.length-1 ? '1px solid var(--border)':'none' }}>
                  <td style={{ padding:'10px 12px' }}>{formatDate(row.date)}</td>
                  <td style={{ padding:'10px 12px' }}>{row.order_count}</td>
                  <td style={{ padding:'10px 12px', fontWeight:600, color:'var(--success)' }}>{formatCurrency(row.revenue)}</td>
                </tr>
              ))}
              {!weekly.length && <tr><td colSpan={3} style={{ padding:30, textAlign:'center', color:'var(--text-muted)' }}>No data</td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {/* Monthly */}
      {!loading && activeTab === 'monthly' && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
            <select value={year} onChange={e => setYear(+e.target.value)} style={{ padding:'8px 12px', borderRadius:'var(--radius)', border:'1px solid var(--border)', fontSize:13, outline:'none' }}>
              {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={month} onChange={e => setMonth(+e.target.value)} style={{ padding:'8px 12px', borderRadius:'var(--radius)', border:'1px solid var(--border)', fontSize:13, outline:'none' }}>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <Card title="Monthly Breakdown">
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {['Day','Orders','Revenue'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-muted)', borderBottom:'1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthly.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < monthly.length-1 ? '1px solid var(--border)':'none' }}>
                    <td style={{ padding:'10px 12px' }}>Day {row.day}</td>
                    <td style={{ padding:'10px 12px' }}>{row.order_count}</td>
                    <td style={{ padding:'10px 12px', fontWeight:600, color:'var(--success)' }}>{formatCurrency(row.revenue)}</td>
                  </tr>
                ))}
                {!monthly.length && <tr><td colSpan={3} style={{ padding:30, textAlign:'center', color:'var(--text-muted)' }}>No data for this period</td></tr>}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Best Sellers */}
      {!loading && activeTab === 'items' && (
        <Card title="Best Selling Items" bodyStyle={{ padding:0 }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                {['#','Item','Total Sold','Total Revenue'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bestSell.map((item, i) => (
                <tr key={i} style={{ borderBottom: i < bestSell.length-1 ? '1px solid var(--border)':'none' }}>
                  <td style={{ padding:'12px 16px', color:'var(--text-muted)', fontWeight:700, fontSize:15 }}>#{i+1}</td>
                  <td style={{ padding:'12px 16px', fontWeight:500 }}>{item.name}</td>
                  <td style={{ padding:'12px 16px' }}>{item.total_sold}</td>
                  <td style={{ padding:'12px 16px', fontWeight:600, color:'var(--success)' }}>{formatCurrency(item.total_revenue)}</td>
                </tr>
              ))}
              {!bestSell.length && <tr><td colSpan={4} style={{ padding:30, textAlign:'center', color:'var(--text-muted)' }}>No sales data yet</td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {/* Staff Performance */}
      {!loading && activeTab === 'staff' && (
        <Card title="Staff Performance" bodyStyle={{ padding:0 }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                {['Name','Role','Today Orders','Total Orders','Revenue Handled'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s, i) => (
                <tr key={i} style={{ borderBottom: i < staff.length-1 ? '1px solid var(--border)':'none' }}>
                  <td style={{ padding:'12px 16px', fontWeight:500 }}>{s.name}</td>
                  <td style={{ padding:'12px 16px', color:'var(--text-muted)', textTransform:'capitalize' }}>{s.role}</td>
                  <td style={{ padding:'12px 16px' }}>{s.today_orders}</td>
                  <td style={{ padding:'12px 16px' }}>{s.total_orders}</td>
                  <td style={{ padding:'12px 16px', fontWeight:600, color:'var(--success)' }}>{formatCurrency(s.total_revenue_handled)}</td>
                </tr>
              ))}
              {!staff.length && <tr><td colSpan={5} style={{ padding:30, textAlign:'center', color:'var(--text-muted)' }}>No staff data</td></tr>}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
