import React from 'react';
import Spinner from './Spinner';

export default function Table({
  columns,
  data,
  loading = false,
  emptyText = 'No data found.',
  emptyIcon = '📭',
  rowKey = 'id',
  onRowClick,
  stickyHeader = false,
}) {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={stickyHeader ? { position: 'sticky', top: 0, zIndex: 10 } : {}}>
          <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '11px 16px',
                  textAlign: col.align || 'left',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  width: col.width || 'auto',
                  background: 'var(--bg)',
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '48px 16px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Spinner size={28} />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '52px 16px', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 36 }}>{emptyIcon}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{emptyText}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[rowKey] ?? rowIdx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{
                  borderBottom: rowIdx < data.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'var(--bg)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '11px 16px',
                      fontSize: 13,
                      color: col.muted ? 'var(--text-muted)' : 'var(--text)',
                      textAlign: col.align || 'left',
                      whiteSpace: col.nowrap ? 'nowrap' : 'normal',
                      verticalAlign: 'middle',
                    }}
                  >
                    {col.render ? col.render(row[col.key], row, rowIdx) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
