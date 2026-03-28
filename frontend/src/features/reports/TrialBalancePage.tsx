import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { exportToExcel } from '../../lib/export'
import { PageTransition } from '../../components/ui/PageTransition'
import { formatSAR } from '../../lib/utils'
import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DatePicker } from '../../components/ui/DatePicker'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import { SearchInput } from '../../components/ui/SearchInput'
import i18n from '../../lib/i18n'

export function TrialBalancePage() {
  const { t } = useTranslation()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['trial-balance', date],
    queryFn: () => api.get(`/trial-balance?date=${date}`).then(r => r.data.data),
  })

  const totalDebit  = (data ?? []).reduce((s: number, r: any) => s + Number(r.total_debit),  0)
  const totalCredit = (data ?? []).reduce((s: number, r: any) => s + Number(r.total_credit), 0)
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.01

  const handleExport = () => {
    const exportData = (data ?? []).map((r: any) => ({
      [i18n.t('trialBalance.table.accountCode')]: r.account_code,
      [i18n.t('trialBalance.table.accountName')]: r.name_ar,
      [i18n.t('trialBalance.table.type')]: r.type,
      [i18n.t('trialBalance.table.totalDebit')]: parseFloat(r.total_debit) || 0,
      [i18n.t('trialBalance.table.totalCredit')]: parseFloat(r.total_credit) || 0,
      [i18n.t('trialBalance.table.balance')]: parseFloat(r.balance) || 0
    }))
    exportData.push({
      [i18n.t('trialBalance.table.accountCode')]: i18n.t('trialBalance.table.total'),
      [i18n.t('trialBalance.table.accountName')]: '',
      [i18n.t('trialBalance.table.type')]: '',
      [i18n.t('trialBalance.table.totalDebit')]: totalDebit,
      [i18n.t('trialBalance.table.totalCredit')]: totalCredit,
      [i18n.t('trialBalance.table.balance')]: totalDebit - totalCredit
    })
    exportToExcel(exportData, `${i18n.t('trialBalance.exportTitle')}_${date}`)
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('trialBalance.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}> {t('trialBalance.pageSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <DatePicker date={date} onChange={setDate} />
          <button className="btn btn-primary" style={{ height: 44 }} onClick={() => refetch()}>{t('trialBalance.filter.update')}</button>
          <button className="btn btn-secondary" style={{ height: 44 }} onClick={handleExport} disabled={!data?.length}>
            <Download size={14}/> تصدير Excel
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="card">{[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 36, marginBottom: 8 }}/>)}</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
            <thead>
              <tr>
                <th>{t('trialBalance.table.accountCode')}</th>
                <th>{t('trialBalance.table.accountName')}</th>
                <th>{t('trialBalance.table.type')}</th>
                <th>{t('trialBalance.table.totalDebit')}</th>
                <th>{t('trialBalance.table.totalCredit')}</th>
                <th>{t('trialBalance.table.balance')}</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((r: any) => (
                <tr key={r.account_code}>
                  <td style={{ fontFamily: 'var(--font-latin)', fontWeight: 600, color: 'var(--color-primary)' }}>{r.account_code}</td>
                  <td>{r.name_ar ?? '—'}</td>
                  <td><span className="badge badge-neutral">{r.type ?? '—'}</span></td>
                  <td className="amount">{formatSAR(r.total_debit)}</td>
                  <td className="amount">{formatSAR(r.total_credit)}</td>
                  <td className="amount" style={{ fontWeight: 700, color: Number(r.balance) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {formatSAR(r.balance)}
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr style={{ background: 'var(--bg-surface-2)', fontWeight: 700 }}>
                <td colSpan={3} style={{ textAlign: 'left', padding: '12px 16px' }}>
                  {isBalanced
                    ? <span style={{ color: 'var(--color-success)' }}>{t('trialBalance.status.balanced')}</span>
                    : <span style={{ color: 'var(--color-danger)' }}>{t('trialBalance.status.unbalanced')}</span>}
                </td>
                <td className="amount" style={{ fontWeight: 800 }}>{formatSAR(totalDebit)}</td>
                <td className="amount" style={{ fontWeight: 800 }}>{formatSAR(totalCredit)}</td>
                <td className="amount" style={{ color: isBalanced ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {formatSAR(totalDebit - totalCredit)}
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      )}
    </PageTransition>
  )
}

export function LedgerPage() {
  const { t } = useTranslation()
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ledger', from, to],
    queryFn: () => {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to)   params.set('to', to)
      return api.get(`/ledger?${params}`).then(r => r.data.data)
    },
  })

  const filteredData = (data ?? []).filter((r: any) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      String(r.account_code ?? '').toLowerCase().includes(s) ||
      String(r.account_name ?? '').toLowerCase().includes(s) ||
      String(r.description ?? '').toLowerCase().includes(s) ||
      String(r.entry_number ?? '').toLowerCase().includes(s)
    )
  })

  const handleExport = () => {
    const exportData = filteredData.map((r: any) => ({
      [i18n.t('ledger.table.date')]: r.entry_date,
      [i18n.t('ledger.table.entryNumber')]: r.entry_number,
      [i18n.t('ledger.table.description')]: r.description,
      [i18n.t('ledger.table.account')]: r.account_code + (r.account_name ? ` — ${r.account_name}` : ''),
      [i18n.t('ledger.table.debit')]: Number(r.debit_amount) || 0,
      [i18n.t('ledger.table.credit')]: Number(r.credit_amount) || 0,
      [i18n.t('ledger.table.balance')]: r.running_balance
    }))
    exportToExcel(exportData, `${i18n.t('ledger.exportTitle')}${search ? '_Filtered' : ''}`)
  }

  return (
    <PageTransition>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('ledger.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}> {t('ledger.pageSubtitle')}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={!filteredData.length}>
          <Download size={14}/> تصدير Excel
        </button>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 220 }}>
          <SearchInput value={search} onChange={setSearch} placeholder={t('ledger.filter.codePlaceholder') || t('common.search')} />
        </div>
        <div style={{ flex: 1 }} />
        <DateRangePicker from={from} to={to} onChange={(f, tr) => { setFrom(f); setTo(tr) }} />
        <button className="btn btn-primary" onClick={() => refetch()} style={{ height: 44 }}>{t('ledger.filter.search')}</button>
      </div>

      {isLoading ? (
        <div className="card">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 36, marginBottom: 8 }}/>)}</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
            <thead>
              <tr><th>{t('ledger.table.date')}</th><th>{t('ledger.table.entryNumber')}</th><th>{t('ledger.table.description')}</th><th>{t('ledger.table.account')}</th><th>{t('ledger.table.debit')}</th><th>{t('ledger.table.credit')}</th><th>{t('trialBalance.table.balance')}</th></tr>
            </thead>
            <tbody>
              {filteredData.map((r: any, i: number) => (
                <tr key={i}>
                  <td className="amount">{r.entry_date}</td>
                  <td style={{ fontFamily: 'var(--font-latin)', color: 'var(--color-primary)', fontWeight: 600 }}>{r.entry_number}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                  <td style={{ fontFamily: 'var(--font-latin)', fontSize: 12 }}>{r.account_code} {r.account_name && `— ${r.account_name}`}</td>
                  <td className="amount">{Number(r.debit_amount) > 0 ? formatSAR(r.debit_amount) : '—'}</td>
                  <td className="amount">{Number(r.credit_amount) > 0 ? formatSAR(r.credit_amount) : '—'}</td>
                  <td className="amount" style={{ fontWeight: 700, color: Number(r.running_balance) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {formatSAR(r.running_balance)}
                  </td>
                </tr>
              ))}
              {!filteredData.length && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('ledger.table.empty')}</td></tr>}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </PageTransition>
  )
}
