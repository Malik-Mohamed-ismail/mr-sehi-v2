import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { FileText, Download } from 'lucide-react'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { formatSAR, formatDate } from '../../lib/utils'
import { exportToExcel } from '../../lib/export'
import { useTranslation } from 'react-i18next'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import i18n from '../../lib/i18n'

function now() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function today() { return new Date().toISOString().split('T')[0] }

export default function IncomeStatementPage() {
  const { t } = useTranslation()
  const [from, setFrom] = useState(now())
  const [to, setTo]     = useState(today())

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['income-statement', from, to],
    queryFn:  () => api.get(`/reports/income-statement?from=${from}&to=${to}`).then(r => r.data.data),
    enabled:  !!from && !!to,
  })

  const handleExport = () => {
    if (!data) return
    const exportData = [
      { [i18n.t('incomeStatement.table.item')]: i18n.t('incomeStatement.items.deliveryRevenue'), [i18n.t('incomeStatement.table.amount')]: data.revenue.delivery },
      { [i18n.t('incomeStatement.table.item')]: i18n.t('incomeStatement.items.restaurantRevenue'), [i18n.t('incomeStatement.table.amount')]: data.revenue.restaurant },
      { [i18n.t('incomeStatement.table.item')]: i18n.t('incomeStatement.items.subscriptionsRevenue'), [i18n.t('incomeStatement.table.amount')]: data.revenue.subscriptions },
      { [i18n.t('incomeStatement.table.item')]: i18n.t('incomeStatement.items.totalRevenue'), [i18n.t('incomeStatement.table.amount')]: data.revenue.total },
      { [i18n.t('incomeStatement.table.item')]: '', [i18n.t('incomeStatement.table.amount')]: '' },
      { [i18n.t('incomeStatement.table.item')]: i18n.t('incomeStatement.items.cogsFull'), [i18n.t('incomeStatement.table.amount')]: data.cogs },
      { [i18n.t('incomeStatement.table.item')]: i18n.t('incomeStatement.items.grossProfit'), [i18n.t('incomeStatement.table.amount')]: data.gross_profit },
      { [i18n.t('incomeStatement.table.item')]: '', [i18n.t('incomeStatement.table.amount')]: '' },
      { [i18n.t('incomeStatement.table.item')]: i18n.t('incomeStatement.items.expensesHeader'), [i18n.t('incomeStatement.table.amount')]: data.total_expenses },
      { [i18n.t('incomeStatement.table.item')]: '', [i18n.t('incomeStatement.table.amount')]: '' },
      { [i18n.t('incomeStatement.table.item')]: i18n.t('incomeStatement.items.netProfit'), [i18n.t('incomeStatement.table.amount')]: data.net_profit }
    ]
    exportToExcel(exportData, `${i18n.t('incomeStatement.exportTitle')}_${from}_${to}`)
  }

  const renderRow = (label: string, value: number, style?: React.CSSProperties, indent = false) => (
    <tr>
      <td style={{ paddingRight: indent ? 32 : 16, ...style }}>{label}</td>
      <td className="amount" style={{ fontWeight: 600, ...style }}>{formatSAR(value)}</td>
      <td className="amount" style={{ color: 'var(--text-secondary)', ...style }}>
        {data?.revenue?.total > 0 ? `${((value / data.revenue.total) * 100).toFixed(1)}%` : '—'}
      </td>
    </tr>
  )

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('incomeStatement.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}> {t('incomeStatement.pageSubtitle')}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={!data}>
          <Download size={14}/> تصدير Excel
        </button>
      </div>

      {/* Date range filter */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
        <DateRangePicker from={from} to={to} onChange={(f, tr) => { setFrom(f); setTo(tr) }} />
        <button className="btn btn-primary" style={{ height: 44 }} onClick={() => refetch()}>{t('incomeStatement.filter.update')}</button>
      </div>

      {isLoading ? (
        <div className="card">
          {[...Array(10)].map((_, i) => <div key={i} className="skeleton" style={{ height: 36, marginBottom: 8 }}/>)}
        </div>
      ) : data ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            background: 'var(--color-primary)', padding: '20px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: 18 }}>{t('incomeStatement.pageTitle')}</h3>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 }}>
                {formatDate(from)} — {formatDate(to)}
              </p>
            </div>
            <FileText size={24} color="rgba(255,255,255,0.60)"/>
          </div>
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
            <thead>
              <tr>
                <th>{t('incomeStatement.table.item')}</th>
                <th style={{ textAlign: 'left' }}>{t('incomeStatement.table.amount')}</th>
                <th style={{ textAlign: 'left' }}>{t('incomeStatement.table.percentage')}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: 'var(--bg-surface-2)' }}>
                <td colSpan={3} style={{ fontWeight: 700, padding: '10px 16px', fontSize: 13 }}>{t('incomeStatement.items.revenuesHeader')}</td>
              </tr>
              {renderRow(t('incomeStatement.items.deliveryRevenue'),      data.revenue.delivery,      {}, true)}
              {renderRow(t('incomeStatement.items.restaurantRevenue'),       data.revenue.restaurant,     {}, true)}
              {renderRow(t('incomeStatement.items.subscriptionsRevenue'),  data.revenue.subscriptions,  {}, true)}
              {renderRow(t('incomeStatement.items.totalRevenue'),     data.revenue.total, { fontWeight: 700, borderTop: '2px solid var(--border-color)' })}

              <tr><td colSpan={3} style={{ height: 8 }}/></tr>
              <tr style={{ background: 'var(--bg-surface-2)' }}>
                <td colSpan={3} style={{ fontWeight: 700, padding: '10px 16px', fontSize: 13 }}>{t('incomeStatement.items.cogsHeader')}</td>
              </tr>
              {renderRow(t('incomeStatement.items.purchases'), data.cogs, {}, true)}
              {renderRow(t('incomeStatement.items.grossProfit'), data.gross_profit, {
                fontWeight: 700,
                color: data.gross_profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                borderTop: '2px solid var(--border-color)',
              })}

              <tr><td colSpan={3} style={{ height: 8 }}/></tr>
              <tr style={{ background: 'var(--bg-surface-2)' }}>
                <td colSpan={3} style={{ fontWeight: 700, padding: '10px 16px', fontSize: 13 }}>{t('incomeStatement.items.expensesHeader')}</td>
              </tr>
              {renderRow(t('incomeStatement.items.totalExpenses'), data.total_expenses, {}, true)}

              <tr><td colSpan={3} style={{ height: 8 }}/></tr>
              {renderRow(t('incomeStatement.items.netProfit'), data.net_profit, {
                fontWeight: 800,
                fontSize: 15,
                color: data.net_profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                borderTop: '3px solid var(--border-color)',
                background: data.net_profit >= 0 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
              })}
            </tbody>
          </table>
          </div>
        </div>
      ) : null}
    </PageTransition>
  )
}
