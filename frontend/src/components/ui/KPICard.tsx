import { TrendingUp, TrendingDown } from 'lucide-react'
import { AnimatedNumber } from './AnimatedNumber'
import { formatPct } from '../../lib/utils'

interface SparkPoint { value: number }

interface Props {
  label:      string
  value:      number
  prefix?:    string
  suffix?:    string
  decimals?:  number
  delta?:     number        // % change vs previous period
  glow?:      'gold' | 'success' | 'danger' | 'none'
  sparkData?: SparkPoint[]
  icon?:      React.ReactNode
  className?: string
}

function MiniSparkline({ data }: { data: SparkPoint[] }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1
  const W = 80, H = 32

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((d.value - min) / range) * H,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  return (
    <svg width={W} height={H} className="opacity-60">
      <defs>
        <linearGradient id="spark-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="currentColor" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${pathD} L${W},${H} L0,${H} Z`} fill="url(#spark-grad)"/>
      <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function KPICard({ label, value, prefix = '', suffix = '', decimals = 2, delta, glow = 'none', sparkData, icon, className = '' }: Props) {
  const glowClass = glow !== 'none' ? `glow-${glow}` : ''
  const isPositive = (delta ?? 0) >= 0

  return (
    <div className={`kpi-card ${glowClass} ${className}`}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <div>
          <div className="kpi-label">{label}</div>
          <AnimatedNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
          {delta !== undefined && (
            <div className={`kpi-delta ${isPositive ? 'positive' : 'negative'}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, fontWeight: 500 }}>
              {isPositive
                ? <TrendingUp size={14}/>
                : <TrendingDown size={14}/>}
              {formatPct(Math.abs(delta))} مقارنة بالفترة السابقة
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 16 }}>
          {icon && (
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--color-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-primary)',
            }}>
              {icon}
            </div>
          )}
          {sparkData && (
            <div style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
              <MiniSparkline data={sparkData}/>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
