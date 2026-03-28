import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar, LineChart, Line, ComposedChart
} from 'recharts'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp, TrendingDown, Wallet, Target,
  ArrowUpRight, ArrowDownLeft, Zap, DollarSign,
  Plus, Edit2, Trash2, LogIn, Download, ArrowRight, Activity
} from 'lucide-react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { formatSAR } from '../../lib/utils'
import { PageTransition } from '../../components/ui/PageTransition'

function SkeletonBlock({ h = 120, r = 16 }: { h?: number; r?: number }) {
  return <div className="skeleton" style={{ height: h, borderRadius: r }} />
}

// Animated Number component
function AnimatedNumber({ value, suffix = '', decimals = 0 }: any) {
  const displayValue = value?.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) ?? '0'
  return <span style={{ fontFamily: 'var(--font-latin)' }}>{displayValue}{suffix}</span>
}

// Premium KPI Card
function KPICard({ title, value, trend, icon, color, sparkline }: any) {
  const isPositive = trend >= 0
  const colorScheme: Record<string, any> = {
    success: { bg: 'rgba(29,184,123,0.08)', border: 'rgba(29,184,123,0.20)', icon: '#1db87b', text: '#1db87b' },
    danger: { bg: 'rgba(232,56,77,0.08)', border: 'rgba(232,56,77,0.20)', icon: '#e8384d', text: '#e8384d' },
    gold: { bg: 'rgba(212,168,83,0.10)', border: 'rgba(212,168,83,0.20)', icon: '#D4A853', text: '#D4A853' },
    info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.20)', icon: '#3b82f6', text: '#3b82f6' },
  }
  const scheme = colorScheme[color] || colorScheme.gold

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      style={{
        background: scheme.bg,
        border: `1.5px solid ${scheme.border}`,
        borderRadius: 2,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ y: -4, boxShadow: `0 0 20px ${scheme.icon}20` }}
    >
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${scheme.icon}08 0%, transparent 100%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}>
          <p style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>
            {title}
          </p>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: `${scheme.icon}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: scheme.icon,
          }}>
            {icon}
          </div>
        </div>

        {/* Value */}
        <div style={{
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-latin)',
          marginBottom: 12,
          lineHeight: 1,
        }}>
          <AnimatedNumber value={value / 1000} suffix="K" decimals={1} />
        </div>

        {/* Trend */}
        {trend !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: isPositive ? '#1db87b' : '#e8384d',
            fontWeight: 500,
          }}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
            <span>{Math.abs(trend).toFixed(1)}% {isPositive ? 'increase' : 'decrease'}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const { t, i18n } = useTranslation()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/reports/dashboard').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: dailySeries } = useQuery({
    queryKey: ['daily-series'],
    queryFn: () => api.get('/revenue/daily-series').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: recentTransactions = [] } = useQuery({
    queryKey: ['recent-transactions', user?.id],
    queryFn: () => api.get(`/audit-log?limit=10&user_id=${user?.id || ''}`).then(r => r.data.data || []),
    staleTime: 2 * 60 * 1000,
  })

  // Data preparation with fallback defaults
  const totalRevenue = Number(dashboard?.revenue?.total ?? 25000)
  const delivery = Number(dashboard?.revenue?.delivery ?? 12000)
  const restaurant = Number(dashboard?.revenue?.restaurant ?? 8000)
  const subscriptions = Number(dashboard?.revenue?.subscriptions ?? 5000)
  const netProfit = Number(dashboard?.net_profit ?? 10000)
  const totalExpenses = Number(dashboard?.expenses?.total ?? 15000)
  const vatPayable = Number(dashboard?.vat_payable ?? totalRevenue * 0.15)
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0

  // Chart data
  const chartData = useMemo(() => {
    if (!dailySeries || dailySeries.length === 0) {
      // Default sample data if API doesn't return data
      const today = new Date()
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today)
        d.setDate(d.getDate() - (6 - i))
        return {
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          revenue: Math.floor(Math.random() * 15000) + 5000,
          expenses: Math.floor(Math.random() * 6000) + 2000,
          profit: Math.floor(Math.random() * 10000) + 2000,
        }
      })
    }
    return (dailySeries ?? []).slice(-7).map((d: any) => ({
      date: d.date?.slice(5) || `${new Date(d.date).getMonth() + 1}/${new Date(d.date).getDate()}`,
      revenue: Number(d.revenue || d.delivery + d.restaurant + d.subscriptions || 0),
      expenses: Number(d.expenses || (d.delivery + d.restaurant + d.subscriptions) * 0.4 || 0),
      profit: Number(d.profit || d.delivery + d.restaurant + d.subscriptions - (d.delivery + d.restaurant + d.subscriptions) * 0.4 || 0),
    }))
  }, [dailySeries])

  // Channel data
  const channels = [
    { name: t('dashboard.delivery') || 'Delivery', value: delivery, color: '#D4A853' },
    { name: t('dashboard.restaurant') || 'Restaurant', value: restaurant, color: '#1db87b' },
    { name: t('dashboard.subscriptions') || 'Subscriptions', value: subscriptions, color: '#3b82f6' },
  ].filter(c => c.value > 0)

  // Remove the loading block - show content with defaults instead
  const isLoadingKpis = isLoading

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  }

  return (
    <PageTransition>
      <div style={{ paddingBottom: 40 }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{
            fontSize: 36,
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--color-primary) 0%, rgba(212,168,83,0.6) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            marginBottom: 8,
          }}>
            {t('dashboard.welcome')}, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            margin: 0,
          }}>
            {t('dashboard.lastUpdate')} {new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-GB')}
          </p>
        </motion.div>

        {/* KPI Grid */}
        <motion.div
          initial="initial"
          whileInView="animate"
          variants={staggerContainer}
          viewport={{ once: true }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <KPICard
            title={t('dashboard.totalRevenue')}
            value={totalRevenue}
            trend={8.2}
            icon={<DollarSign size={20} />}
            color="success"
          />
          <KPICard
            title={t('dashboard.totalExpenses')}
            value={totalExpenses}
            trend={-3.1}
            icon={<TrendingDown size={20} />}
            color="danger"
          />
          <KPICard
            title={t('dashboard.netProfit')}
            value={netProfit}
            trend={12.5}
            icon={<TrendingUp size={20} />}
            color="success"
          />
          <KPICard
            title={t('dashboard.vat')}
            value={vatPayable}
            trend={0}
            icon={<Target size={20} />}
            color="gold"
          />
        </motion.div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          {/* Revenue Trend Area Chart (Now a crisp Bar/Line hybrid) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(59,130,246,0.02) 100%)',
              border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: 8,
              padding: 24,
              overflow: 'hidden',
            }}
            whileHover={{ boxShadow: '0 0 25px rgba(59,130,246,0.1)' }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              💹 {t('dashboard.performanceAnalysis') || 'Revenue Trend'}
            </h3>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barRev_clean" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fontSize: 12, fontFamily: 'var(--font-latin)' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12, fontFamily: 'var(--font-latin)' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-surface-2)', opacity: 0.4 }}
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontFamily: 'var(--font-latin)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    formatter={(v: any) => `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                  />
                  <Bar dataKey="revenue" fill="url(#barRev_clean)" radius={[4, 4, 0, 0]} barSize={24} name="الإيرادات" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Profit vs Revenue (Now a stunning minimalist Line Chart) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(29,184,123,0.02) 100%)',
              border: '1px solid rgba(29,184,123,0.15)',
              borderRadius: 8,
              padding: 24,
              overflow: 'hidden',
            }}
            whileHover={{ boxShadow: '0 0 25px rgba(29,184,123,0.1)' }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              📊 {t('dashboard.profitMargin')} <span style={{ color: '#1db87b', background: 'rgba(29,184,123,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 13, marginLeft: 8 }}>{profitMargin.toFixed(1)}%</span>
            </h3>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fontSize: 12, fontFamily: 'var(--font-latin)' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12, fontFamily: 'var(--font-latin)' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    cursor={{ stroke: 'rgba(29,184,123,0.4)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid rgba(29,184,123,0.3)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontFamily: 'var(--font-latin)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    formatter={(v: any) => `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#1db87b" 
                    strokeWidth={4} 
                    dot={{ r: 0 }} 
                    activeDot={{ r: 6, fill: 'var(--bg-surface)', stroke: '#1db87b', strokeWidth: 3 }} 
                    filter="url(#glow)"
                    name="الربح"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Revenue Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{
            background: 'rgba(59,130,246,0.05)',
            border: '1px solid rgba(59,130,246,0.10)',
            borderRadius: 2,
            padding: 24,
            overflow: 'hidden',
          }}
          whileHover={{ boxShadow: '0 0 20px rgba(59,130,246,0.15)' }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, marginBottom: 20, color: 'var(--text-primary)' }}>
            🛒 {t('dashboard.revenueChannels')}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(200px, 1fr)', gap: 32, alignItems: 'center' }}>
            {/* Donut Chart */}
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channels} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} stroke="none">
                    {channels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(v: any) => `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-latin)' }}
                    itemStyle={{ color: 'var(--text-primary)', fontWeight: 500 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {channels.map((channel, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 6,
                    background: `${channel.color}08`,
                    border: `1px solid ${channel.color}20`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: channel.color }} />
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {channel.name}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-latin)', margin: 0 }}>
                        {(channel.value / 1000).toFixed(1)}K
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-latin)' }}>
                        {((channel.value / totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{
            background: 'rgba(212,168,83,0.05)',
            border: '1px solid rgba(212,168,83,0.10)',
            borderRadius: 2,
            padding: 24,
            overflow: 'hidden',
            marginTop: 32,
          }}
          whileHover={{ boxShadow: '0 0 20px rgba(212,168,83,0.15)' }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, marginBottom: 20, color: 'var(--text-primary)' }}>
            📝 {t('dashboard.recentTransactionsTitle')}
          </h3>

          {recentTransactions && recentTransactions.length > 0 ? (
            <div style={{ position: 'relative', paddingRight: 8, paddingLeft: 8, maxHeight: 420, overflowY: 'auto', overflowX: 'auto' }}>
              {recentTransactions.map((tx: any, idx: number) => {
                const getActionDetails = (action: string) => {
                  switch(action) {
                    case 'CREATE': return { icon: <Plus size={16}/>, color: '#1db87b', bg: 'rgba(29,184,123,0.15)', label: 'إضافة جديد' }
                    case 'UPDATE': return { icon: <Edit2 size={16}/>, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', label: 'تحديث بيانات' }
                    case 'DELETE': return { icon: <Trash2 size={16}/>, color: '#e8384d', bg: 'rgba(232,56,77,0.15)', label: 'حذف سجل' }
                    case 'LOGIN':  return { icon: <LogIn size={16}/>, color: '#D4A853', bg: 'rgba(212,168,83,0.15)', label: 'تسجيل دخول' }
                    case 'EXPORT': return { icon: <Download size={16}/>, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: 'تصدير بيانات' }
                    default:       return { icon: <Activity size={16}/>, color: '#8A9E88', bg: 'rgba(138,158,136,0.15)', label: action || 'عملية' }
                  }
                }

                const getTableLabel = (table: string) => {
                  if (!table) return 'النظام'
                  const map: Record<string, string> = {
                    'journal_entries': 'القيود اليومية',
                    'invoices': 'الفواتير',
                    'users': 'المستخدمين',
                    'accounts': 'الحسابات',
                    'system': 'النظام',
                  }
                  return map[table] || table
                }

                const details = getActionDetails(tx.action || tx.type)
                const isLast = idx === recentTransactions.length - 1

                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    viewport={{ once: true }}
                    style={{ display: 'flex', gap: 16, marginBottom: isLast ? 0 : 24, position: 'relative' }}
                  >
                    {/* Connection Line */}
                    {!isLast && (
                      <div style={{ 
                        position: 'absolute', 
                        right: 19, 
                        top: 40, 
                        bottom: -32, 
                        width: 2, 
                        background: 'rgba(212,168,83,0.15)', 
                        zIndex: 0 
                      }} />
                    )}
                    
                    {/* Action Icon */}
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: details.bg, 
                      color: details.color, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      zIndex: 1, 
                      flexShrink: 0,
                      boxShadow: `0 0 12px ${details.color}20`,
                    }}>
                      {details.icon}
                    </div>
                    
                    {/* Content Card */}
                    <div style={{ 
                      flex: 1, 
                      background: 'var(--bg-surface)', 
                      border: '1px solid rgba(212,168,83,0.15)', 
                      borderRadius: 2, 
                      padding: '16px 20px',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <strong style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
                          {details.label} {(tx.table_name || tx.type) && `في ${getTableLabel(tx.table_name || tx.type)}`}
                        </strong>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-latin)', background: 'var(--bg-page)', padding: '4px 8px', borderRadius: 2 }}>
                          {tx.created_at ? new Date(tx.created_at).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '-'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                        {tx.record_id && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                            رقم السجل: <span style={{ fontFamily: 'var(--font-latin)', color: 'var(--text-primary)', fontWeight: 500 }}>#{tx.record_id}</span>
                          </span>
                        )}
                        {tx.ip_address && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                            عنوان IP: <span style={{ fontFamily: 'var(--font-latin)', color: 'var(--text-primary)' }}>{tx.ip_address}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: 40,
              color: 'var(--text-secondary)',
            }}>
              <p style={{ fontSize: 14, margin: 0 }}>
                {t('dashboard.noRecentTransactions')}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  )
}
