import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { RefreshCw, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { staggerContainer, staggerItem } from '../../lib/animations'

const toDay = new Date().toISOString().split('T')[0]
const fromDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

export default function BreakEvenPage() {
  const { t } = useTranslation()
  const [from, setFrom] = useState(fromDay)
  const [to, setTo]     = useState(toDay)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['breakeven', from, to],
    queryFn: async () => {
      const res = await api.get('/reports/breakeven', { params: { from, to } })
      return res.data.data
    },
  })

  const isBeyond = data?.isBeyondBreakEven

  return (
    <PageTransition>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{t('pages.breakeven')}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('reports.breakevenDesc')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <DateRangePicker from={from} to={to} onChange={(f, tr) => { setFrom(f); setTo(tr) }} />
            <button className="btn btn-ghost" onClick={() => refetch()}><RefreshCw size={14} /></button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 2 }} />)}
          </div>
        ) : data ? (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: 'grid', gap: 20 }}>
            {/* Status Banner */}
            <motion.div variants={staggerItem} style={{
              padding: 20, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 16,
              background: isBeyond ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
              border: `1.5px solid ${isBeyond ? 'rgba(29,184,123,0.3)' : 'rgba(232,56,77,0.3)'}`,
            }}>
              <Target size={28} color={isBeyond ? 'var(--color-success)' : 'var(--color-danger)'} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: isBeyond ? 'var(--color-success)' : 'var(--color-danger)', marginBottom: 4 }}>
                  {isBeyond ? t('breakeven.aboveBreakeven') : t('breakeven.belowBreakeven')}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {isBeyond ? t('breakeven.profitableDesc') : t('breakeven.lossDesc')}
                </div>
              </div>
            </motion.div>

            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { label: t('breakeven.currentRevenue'),  value: data.currentRevenue,  color: 'var(--color-primary)' },
                { label: t('breakeven.breakevenSales'),  value: data.breakEvenSales,  color: isBeyond ? 'var(--color-success)' : 'var(--color-danger)' },
                { label: t('breakeven.fixedCosts'),      value: data.fixedCosts,      color: 'var(--color-warning)' },
                { label: t('breakeven.safetyMargin'),    value: data.safetyMarginSAR, color: data.safetyMarginSAR >= 0 ? 'var(--color-success)' : 'var(--color-danger)' },
              ].map(kpi => (
                <motion.div key={kpi.label} variants={staggerItem} className="card" style={{ borderTop: `3px solid ${kpi.color}` }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{kpi.label}</div>
                  <AnimatedNumber value={Number(kpi.value ?? 0)} suffix="" />
                </motion.div>
              ))}
              <motion.div variants={staggerItem} className="card" style={{ borderTop: '3px solid var(--color-info)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('breakeven.grossMargin')}</div>
                <AnimatedNumber value={Number(data.grossMarginPct ?? 0) * 100} suffix="%" decimals={1} />
              </motion.div>
              <motion.div variants={staggerItem} className="card" style={{ borderTop: '3px solid var(--color-primary)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('breakeven.safetyPct')}</div>
                <AnimatedNumber value={Number(data.safetyMarginPct ?? 0) * 100} suffix="%" decimals={1} />
              </motion.div>
            </div>

            {/* Chart: Sales vs Breakeven Target */}
            {data.series?.length > 0 && (
              <motion.div variants={staggerItem} className="card">
                <h3 style={{ fontWeight: 600, marginBottom: 16 }}>{t('breakeven.progress')} (مسار المبيعات التراكمي)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'var(--font-latin)' }} />
                    <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-latin)' }} />
                    <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                    <Area type="step" dataKey="target" stroke="var(--color-danger)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" name={t('breakeven.breakevenSales')} />
                    <Area type="monotone" dataKey="cumulative" stroke="var(--color-primary)" fill="var(--color-primary-light)" strokeWidth={2} name={t('breakeven.currentRevenue')} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Fixed Costs Breakdown */}
            {data.fixedCostsList?.length > 0 && (
              <motion.div variants={staggerItem} className="card">
                <h3 style={{ fontWeight: 600, marginBottom: 16 }}>تفاصيل التكاليف الثابتة</h3>
                <div style={{ overflow: 'auto', width: '100%', maxHeight: '400px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>التاريخ</th>
                        <th>البند / الحساب</th>
                        <th>طريقة الدفع</th>
                        <th style={{ textAlign: 'start' }}>المبلغ</th>
                        <th>البيان</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.fixedCostsList.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="number">{item.expense_date?.split('T')[0] ?? item.expense_date}</td>
                          <td>{item.category}</td>
                          <td>{item.payment_method}</td>
                          <td className="number">{Number(item.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td>{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>{t('common.noData')}</div>
        )}
      </div>
    </PageTransition>
  )
}
