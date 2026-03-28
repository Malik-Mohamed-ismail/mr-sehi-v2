import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Download, RefreshCw, PieChart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { staggerContainer, staggerItem } from '../../lib/animations'

const toDay = new Date().toISOString().split('T')[0]
const fromDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

const COLORS = ['#2B9225', '#4A90E2', '#1DB87B', '#E8384D', '#F5A623', '#9B59B6']

export default function ChannelAnalysisPage() {
  const { t, i18n } = useTranslation()
  const [from, setFrom] = useState(fromDay)
  const [to, setTo]     = useState(toDay)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['channel-analysis', from, to],
    queryFn: async () => {
      const res = await api.get('/reports/channel-analysis', { params: { from, to } })
      return res.data.data
    },
  })

  const channels = (data?.channels ?? []).map((ch: any) => ({
    ...ch,
    displayName: t(`channels.${ch.channel.toLowerCase()}`) || ch.channel
  }))

  return (
    <PageTransition>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{t('pages.channelAnalysis')}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('reports.channelDesc')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <DateRangePicker from={from} to={to} onChange={(f, tr) => { setFrom(f); setTo(tr) }} />
            <button className="btn btn-ghost" onClick={() => refetch()}><RefreshCw size={14} /></button>
            <button className="btn btn-secondary" style={{ gap: 6 }}><Download size={14} /> {t('common.exportExcel')}</button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 2 }} />)}
          </div>
        ) : channels.length > 0 ? (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: 'grid', gap: 20 }}>
            {/* Donut + Bar side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <motion.div variants={staggerItem} className="card">
                <h3 style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PieChart size={16} color="var(--color-primary)" />{t('reports.revenueShare')}
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RechartsPie>
                    <Pie data={channels} dataKey="total" nameKey="displayName" cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} stroke="none">
                      {channels.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} style={{ outline: 'none' }} />)}
                    </Pie>
                    <Tooltip 
                      formatter={(v: any) => `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س`} 
                      contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-latin)' }}
                      itemStyle={{ color: 'var(--text-primary)', fontWeight: 500 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontFamily: i18n.dir() === 'rtl' ? 'var(--font-arabic)' : 'var(--font-latin)' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </motion.div>

              <motion.div variants={staggerItem} className="card">
                <h3 style={{ fontWeight: 600, marginBottom: 16 }}>{t('reports.channelComparison')}</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={channels} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      {channels.map((_: any, i: number) => (
                        <linearGradient key={`grad-${i}`} id={`colorCh-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.9}/>
                          <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.2}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="displayName" tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontFamily: i18n.dir() === 'rtl' ? 'var(--font-arabic)' : 'var(--font-latin)' }} tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontFamily: 'var(--font-latin)' }} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip 
                      cursor={{ fill: 'var(--bg-surface-2)', opacity: 0.5 }}
                      formatter={(v: any) => `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} 
                      contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-latin)' }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={40}>
                      {channels.map((_: any, i: number) => <Cell key={i} fill={`url(#colorCh-${i})`} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Channel breakdown table */}
            <motion.div variants={staggerItem} className="card">
              <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('reports.channel')}</th>
                    <th>{t('reports.revenue')}</th>
                    <th>{t('reports.share')}</th>
                    <th>{t('reports.transactions')}</th>
                    <th>{t('reports.avgPerDay')}</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((ch: any, i: number) => (
                    <tr key={ch.channel}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }}/>
                          {ch.displayName}
                        </div>
                      </td>
                      <td className="number">{Number(ch.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-surface-2)' }}>
                            <div style={{ width: `${ch.pct ?? 0}%`, height: '100%', borderRadius: 3, background: COLORS[i % COLORS.length] }}/>
                          </div>
                          <span className="number" style={{ fontSize: 12 }}>{Number(ch.pct ?? 0).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="number">{ch.count ?? '-'}</td>
                      <td className="number">{ch.avg_per_day ? Number(ch.avg_per_day).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</td>
                    </tr>
                  ))}
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
