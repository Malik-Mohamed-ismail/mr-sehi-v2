import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Download, RefreshCw, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { staggerContainer, staggerItem } from '../../lib/animations'

const toDay = new Date().toISOString().split('T')[0]
const fromDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

export default function WasteAnalysisPage() {
  const { t } = useTranslation()
  const [from, setFrom] = useState(fromDay)
  const [to, setTo]     = useState(toDay)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['waste-analysis', from, to],
    queryFn: async () => {
      const res = await api.get('/reports/waste-analysis', { params: { from, to } })
      return res.data.data
    },
  })

  const items = data?.items ?? []

  return (
    <PageTransition>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{t('pages.wasteAnalysis')}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('reports.wasteDesc')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <DateRangePicker from={from} to={to} onChange={(f, tr) => { setFrom(f); setTo(tr) }} />
            <button className="btn btn-ghost" onClick={() => refetch()}><RefreshCw size={14} /></button>
            <button className="btn btn-secondary" style={{ gap: 6 }}><Download size={14} /> {t('common.exportExcel')}</button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gap: 20 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 150, borderRadius: 2 }} />)}
          </div>
        ) : data ? (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: 'grid', gap: 20 }}>
            {/* Summary KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <motion.div variants={staggerItem} className="card kpi-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div className="kpi-icon-circle kpi-icon-circle--danger"><AlertTriangle size={16} /></div>
                  <span className="kpi-label">{t('waste.totalValue')}</span>
                </div>
                <AnimatedNumber value={Number(data.totalWasteValue ?? 0)} suffix="" />
              </motion.div>
              <motion.div variants={staggerItem} className="card kpi-card">
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('waste.pctOfRevenue')}</div>
                <AnimatedNumber value={Number(data.wastePctOfRevenue ?? 0)} suffix="%" decimals={1} />
              </motion.div>
              <motion.div variants={staggerItem} className="card kpi-card">
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('waste.topProduct')}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-danger)' }}>{data.topWasteProduct ?? '—'}</div>
              </motion.div>
            </div>

            {/* Bar chart */}
            {items.length > 0 && (
              <motion.div variants={staggerItem} className="card">
                <h3 style={{ fontWeight: 600, marginBottom: 16 }}>{t('waste.byProduct')}</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={items} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'var(--font-latin)' }} />
                    <YAxis type="category" dataKey="product_name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                    <Bar dataKey="waste_value" radius={[0, 6, 6, 0]}>
                      {items.map((_: any, i: number) => {
                        const pct = Number(items[i]?.waste_pct ?? 0)
                        return <Cell key={i} fill={pct > 10 ? 'var(--color-danger)' : pct > 5 ? 'var(--color-warning)' : 'var(--color-success)'} />
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Detailed table */}
            <motion.div variants={staggerItem} className="card">
              <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('waste.product')}</th>
                    <th>{t('waste.totalKg')}</th>
                    <th>{t('waste.wasteG')}</th>
                    <th>{t('waste.wastePct')}</th>
                    <th>{t('waste.wasteValue')}</th>
                    <th>{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any) => {
                    const pct = Number(item.waste_pct ?? 0)
                    const status = pct > 10 ? 'danger' : pct > 5 ? 'warning' : 'success'
                    return (
                      <tr key={item.product_name}>
                        <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                        <td className="number">{Number(item.total_kg ?? 0).toFixed(2)}</td>
                        <td className="number">{Number(item.waste_g ?? 0).toFixed(0)}</td>
                        <td className="number">{pct.toFixed(2)}%</td>
                        <td className="number">{Number(item.waste_value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td><span className={`badge badge-${status}`}>{pct > 10 ? t('waste.high') : pct > 5 ? t('waste.medium') : t('waste.low')}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
          </div>
            </motion.div>
          </motion.div>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>{t('common.noData')}</div>
        )}
      </div>
    </PageTransition>
  )
}
