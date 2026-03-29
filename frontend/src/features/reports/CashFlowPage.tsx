import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Download, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { staggerContainer, staggerItem } from '../../lib/animations'
import { exportToExcel } from '../../lib/export'

const toDay = new Date().toISOString().split('T')[0]
const fromDay = `${new Date().getFullYear()}-01-01`

export default function CashFlowPage() {
  const { t } = useTranslation()
  const [from, setFrom] = useState(fromDay)
  const [to, setTo]     = useState(toDay)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['cash-flow', from, to],
    queryFn: async () => {
      const res = await api.get('/reports/cash-flow', { params: { from, to } })
      return res.data.data
    },
  })

  const operating  = Number(data?.operatingActivities ?? 0)
  const investing  = Number(data?.investingActivities ?? 0)
  const financing  = Number(data?.financingActivities ?? 0)
  const netChange  = operating + investing + financing

  const sections = [
    { label: t('cashFlow.operating'),  id: 'operating', value: operating,  color: 'var(--color-success)' },
    { label: t('cashFlow.investing'),  id: 'investing', value: investing,  color: 'var(--color-info)' },
    { label: t('cashFlow.financing'),  id: 'financing', value: financing,  color: 'var(--color-warning)' },
  ]

  const handleExport = () => {
    if (!data) return
    const rows = sections.map(s => ({
      [s.label]: s.value,
    }))
    rows.push({ [t('cashFlow.netChange')]: netChange } as any)
    exportToExcel(rows, t('cashFlow.exportTitle', 'Cash_Flow_Statement'))
  }

  return (
    <PageTransition>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{t('pages.cashFlow')}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('reports.cashFlowDesc')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <DateRangePicker from={from} to={to} onChange={(f, tr) => { setFrom(f); setTo(tr) }} />
            <button className="btn btn-ghost" onClick={() => refetch()}><RefreshCw size={14} /></button>
            <button className="btn btn-secondary" style={{ gap: 6 }} onClick={handleExport} disabled={!data}>
              <Download size={14} /> {t('common.exportExcel', 'Export Excel')}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 2 }} />)}
          </div>
        ) : data ? (
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              {sections.map(s => (
                <motion.div key={s.id} variants={staggerItem} className="card" style={{ borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {s.value >= 0 ? <TrendingUp size={16} color="var(--color-success)" /> : <TrendingDown size={16} color="var(--color-danger)" />}
                    <AnimatedNumber value={s.value} suffix="" />
                  </div>
                </motion.div>
              ))}
              <motion.div variants={staggerItem} className="card" style={{ borderTop: `3px solid ${netChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}`, background: netChange >= 0 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('cashFlow.netChange')}</div>
                <AnimatedNumber value={netChange} suffix="" />
              </motion.div>
            </div>

            {/* Chart */}
            {data.dailySeries?.length > 0 && (
              <motion.div variants={staggerItem} className="card">
                <h3 style={{ fontWeight: 600, marginBottom: 16 }}>{t('cashFlow.dailyFlow')}</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data.dailySeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'var(--font-latin)' }} />
                    <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-latin)' }} />
                    <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                    <Area type="monotone" dataKey="inflow" stroke="var(--color-success)" fill="rgba(29,184,123,0.1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="outflow" stroke="var(--color-danger)" fill="rgba(232,56,77,0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Details */}
            {sections.map(s => (
              data[s.id]?.details?.length > 0 && (
                <motion.div key={s.id} variants={staggerItem} className="card" style={{ marginTop: 16 }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 12, color: s.color }}>{s.label}</h3>
                  <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
                    <tbody>
                      {data[s.id]?.details?.map((item: any, i: number) => (
                        <tr key={i}>
                          <td>{item.description}</td>
                          <td className="number" style={{ textAlign: 'end', fontWeight: 600, color: item.amount >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
          </div>
                </motion.div>
              )
            ))}
          </motion.div>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>{t('common.noData')}</div>
        )}
      </div>
    </PageTransition>
  )
}
