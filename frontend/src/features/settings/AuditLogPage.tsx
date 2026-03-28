import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { RefreshCw, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import { SearchInput } from '../../components/ui/SearchInput'
import { FilterDropdown } from '../../components/ui/FilterDropdown'
import { staggerContainer, staggerItem } from '../../lib/animations'

const toDay = new Date().toISOString().split('T')[0]
const fromDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'var(--color-success)',
  UPDATE: 'var(--color-info)',
  DELETE: 'var(--color-danger)',
  LOGIN:  'var(--color-warning)',
  EXPORT: 'var(--color-primary)',
}

export default function AuditLogPage() {
  const { t } = useTranslation()
  const [from, setFrom]     = useState(fromDay)
  const [to, setTo]         = useState(toDay)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [page, setPage]     = useState(1)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-log', from, to, action, page],
    queryFn: async () => {
      const res = await api.get('/audit-log', { params: { from, to, action: action || undefined, page, limit: 25 } })
      return res.data
    },
  })

  const rows = (data?.data ?? []).filter((r: any) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      String(r.table_name ?? '').toLowerCase().includes(s) ||
      String(r.username ?? r.user_id ?? '').toLowerCase().includes(s) ||
      String(r.action ?? '').toLowerCase().includes(s)
    )
  })

  const actionOptions = [
    { value: '', label: t('common.all') },
    { value: 'CREATE', label: 'CREATE' },
    { value: 'UPDATE', label: 'UPDATE' },
    { value: 'DELETE', label: 'DELETE' },
    { value: 'LOGIN',  label: 'LOGIN' },
    { value: 'EXPORT', label: 'EXPORT' },
  ]

  return (
    <PageTransition>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(212,168,83,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="var(--color-primary)" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{t('pages.auditLog')}</h1>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('audit.desc')}</p>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ height: 44, width: 44, padding: 0, justifyContent: 'center' }} onClick={() => refetch()}><RefreshCw size={16} /></button>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <SearchInput value={search} onChange={setSearch} placeholder={t('audit.searchPlaceholder')} />
          <DateRangePicker from={from} to={to} onChange={(f, tr) => { setFrom(f); setTo(tr); setPage(1) }} />
          <FilterDropdown value={action} onChange={v => { setAction(v); setPage(1) }} options={actionOptions} placeholder={t('audit.allActions')} />
        </div>

        {isLoading ? (
          <div>{[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 50, marginBottom: 4, borderRadius: 2 }} />)}</div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.div variants={staggerItem} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('audit.time')}</th>
                    <th>{t('audit.user')}</th>
                    <th>{t('audit.action')}</th>
                    <th>{t('audit.table')}</th>
                    <th>{t('audit.recordId')}</th>
                    <th>{t('audit.ip')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((log: any) => (
                    <tr key={log.id}>
                      <td className="number" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {new Date(log.created_at).toLocaleString('ar-EG', { hour12: true })}
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.username ?? log.user_id ?? '—'}</td>
                      <td>
                        <span className="badge" style={{
                          background: `${ACTION_COLORS[log.action]}20`,
                          color: ACTION_COLORS[log.action],
                          fontSize: 11, fontFamily: 'var(--font-latin)',
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-latin)', fontSize: 12 }}>{log.table_name}</td>
                      <td className="number" style={{ fontSize: 12 }}>{log.record_id ?? '—'}</td>
                      <td className="number" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{log.ip_address ?? '—'}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('common.noData')}</td></tr>
                  )}
                </tbody>
              </table>
          </div>
            </motion.div>

            {/* Pagination */}
            {data?.meta && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  {t('common.prev')}
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', alignSelf: 'center' }}>
                  {page} / {data.meta.totalPages ?? 1}
                </span>
                <button className="btn btn-secondary btn-sm" disabled={page >= (data.meta.totalPages ?? 1)} onClick={() => setPage(p => p + 1)}>
                  {t('common.next')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
