import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { Activity, TrendingUp, DollarSign } from 'lucide-react'
import { api } from '../../lib/api'
import { formatSAR } from '../../lib/utils'
import { useTranslation } from 'react-i18next'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import i18n from '../../lib/i18n'
import { PageTransition } from '../../components/ui/PageTransition'

export default function PerformancePage() {
  const { t } = useTranslation()
  const [dateRange, setDateRange] = useState(() => {
    const d = new Date()
    return {
      to: d.toISOString().split('T')[0],
      from: new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().split('T')[0], // last month
    }
  })

  // 1. Fetch dashboard totals
  const { data: totals, isLoading: isTotalsLoading } = useQuery({
    queryKey: ['dashboard-totals', dateRange],
    queryFn: () => api.get('/reports/dashboard', { params: dateRange }).then(r => r.data.data),
  })

  // 2. Fetch performance trends
  const { data: trends, isLoading: isTrendsLoading } = useQuery({
    queryKey: ['performance-trends', dateRange],
    queryFn: () => api.get('/reports/performance-trends', { params: dateRange }).then(r => r.data.data),
  })

  const isLoading = isTotalsLoading || isTrendsLoading

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={24} color="var(--color-primary)"/> تقييم الأداء المالي
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{t('performance.pageSubtitle')}</p>
        </div>
        
        <div className="card" style={{ display: 'flex', gap: 12, padding: '8px 16px' }}>
          <DateRangePicker from={dateRange.from} to={dateRange.to} onChange={(f, tr) => setDateRange({ from: f, to: tr })} />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 2 }} />)}
          <div className="skeleton" style={{ gridColumn: '1 / -1', height: 400, borderRadius: 2, marginTop: 24 }} />
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                <div style={{ padding: 8, borderRadius: 2, background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}><DollarSign size={20}/></div>
                <span style={{ fontWeight: 600 }}>{t('performance.kpi.totalRevenue')}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-latin)' }}>
                {formatSAR(totals?.revenue?.total ?? 0)}
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                <div style={{ padding: 8, borderRadius: 2, background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}><TrendingUp size={20} style={{ transform: 'scaleY(-1)' }}/></div>
                <span style={{ fontWeight: 600 }}>{t('performance.kpi.totalExpenses')}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-latin)' }}>
                 {formatSAR((totals?.total_expenses ?? 0) + (totals?.cogs ?? 0))}
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'linear-gradient(135deg, rgba(43,146,37,0.08) 0%, rgba(43,146,37,0.03) 100%)', border: '1px solid rgba(43,146,37,0.20)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-primary)' }}>
                <div style={{ padding: 8, borderRadius: 2, background: 'rgba(43,146,37,0.15)', color: 'var(--color-primary)' }}><Activity size={20}/></div>
                <span style={{ fontWeight: 700 }}>{t('performance.kpi.netProfit')}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-latin)', color: 'var(--color-primary)' }}>
                {formatSAR(totals?.net_profit ?? 0)}
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginRight: 10, display: 'inline-block' }}>
                  {t('performance.kpi.margin')} {((totals?.net_margin ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="card" style={{ height: 450, padding: '24px 24px 40px 24px', marginBottom: 24 }} dir="ltr">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, textAlign: 'right' }}>{t('performance.chart.title')}</h3>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trends} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barRevPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cf9c3e" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#cf9c3e" stopOpacity={0.4}/>
                  </linearGradient>
                  <linearGradient id="barExpPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8384d" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#e8384d" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fontFamily: 'var(--font-latin)', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-secondary)" tick={{ fontFamily: 'var(--font-latin)', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-surface-2)', opacity: 0.4 }}
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '12px', fontFamily: 'var(--font-latin)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 500 }}
                  formatter={(v: any) => `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س`} 
                />
                <Legend wrapperStyle={{ paddingTop: 20, fontFamily: i18n.dir() === 'rtl' ? 'var(--font-arabic)' : 'var(--font-latin)' }} iconType="circle" />
                
                <Bar dataKey="revenue" name={t('performance.chart.revenue')} fill="url(#barRevPerf)" barSize={16} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name={t('performance.chart.expenses')} fill="url(#barExpPerf)" barSize={16} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="profit" name={t('performance.chart.profit')} stroke="#1db87b" strokeWidth={3} activeDot={{ r: 6 }} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </PageTransition>
  )
}
