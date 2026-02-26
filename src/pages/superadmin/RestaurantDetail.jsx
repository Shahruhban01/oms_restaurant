import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { superAdminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime } from '../../utils/formatters';

export default function RestaurantDetail() {
  const { id }            = useParams();
  const navigate          = useNavigate();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminApi.getRestaurant(id)
      .then(r => setData(r.data?.data))
      .catch(() => navigate('/superadmin/restaurants'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:80 }}><Spinner size={36}/></div>;
  if (!data) return null;

  const rows = [
    ['ID',         data.id],
    ['Name',       data.name],
    ['Plan',       <Badge type="info">{data.plan?.replace('_',' ')}</Badge>],
    ['Status',     <Badge type={data.is_active ? 'success':'danger'}>{data.is_active ? 'Active':'Suspended'}</Badge>],
    ['Email',      data.email || '—'],
    ['Phone',      data.phone || '—'],
    ['Tax Rate',   data.tax_rate ? `${data.tax_rate}%` : '0%'],
    ['Created At', formatDateTime(data.created_at)],
    ['Updated At', formatDateTime(data.updated_at)],
  ];

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => navigate('/superadmin/restaurants')} style={{ fontSize:20, color:'var(--text-muted)' }}>←</button>
        <h2 style={{ fontWeight:700, fontSize:20 }}>{data.name}</h2>
      </div>
      <Card title="Restaurant Details" style={{ maxWidth:560 }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'10px 0', fontWeight:600, fontSize:13, color:'var(--text-muted)', width:'40%' }}>{label}</td>
                <td style={{ padding:'10px 0', fontSize:13 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
