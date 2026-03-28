import { AnimatedNumber } from './AnimatedNumber'
import { useTranslation } from 'react-i18next'
import { DateRangePicker } from './DateRangePicker'

interface DashboardHeroProps {
  totalRevenue: number
  netProfit: number
  from: string
  to: string
  onRangeChange: (from: string, to: string) => void
  isLoading?: boolean
}

export function DashboardHero({ totalRevenue, netProfit, from, to, onRangeChange, isLoading }: DashboardHeroProps) {
  const { t, i18n } = useTranslation()
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  const isRTL = i18n.dir() === 'rtl'

  return (
    <section
      style={{
        borderRadius: 'var(--radius-xl)', padding: '32px 40px', marginBottom: 32,
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
              {t('dashboard.financialReport')} · {from} — {to}
            </p>
            <h2 style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
              {t('dashboard.totalRevenue')}
            </h2>
            {isLoading ? (
              <div className="skeleton" style={{ height: 64, width: 220, borderRadius: 'var(--radius-md)' }}/>
            ) : (
              <div style={{ fontSize: 56, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                <AnimatedNumber value={totalRevenue} suffix="" decimals={2} />
              </div>
            )}
          </div>
          <div style={{ background: 'var(--bg-surface-2)', padding: 4, borderRadius: 'var(--radius-md)' }}>
             <DateRangePicker from={from} to={to} onChange={onRangeChange}/>
          </div>
        </div>

        {/* Secondary stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{t('dashboard.netProfit')}</span>
            {isLoading
              ? <div className="skeleton" style={{ height: 28, width: 120, borderRadius: 'var(--radius-sm)' }}/>
              : <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-latin)', color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
                  <AnimatedNumber value={netProfit} suffix="" decimals={2} />
                </div>
            }
          </div>
          <div style={{ width: 1, height: 40, background: 'var(--border-color)' }}/>
          <div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{t('dashboard.profitMargin')}</span>
            {isLoading
              ? <div className="skeleton" style={{ height: 28, width: 80, borderRadius: 'var(--radius-sm)' }}/>
              : <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-latin)', color: margin >= 20 ? 'var(--color-success)' : margin >= 10 ? 'var(--color-warning)' : 'var(--color-danger)', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
                  <AnimatedNumber value={margin} suffix="%" decimals={1} />
                </div>
            }
          </div>
        </div>
      </div>
    </section>
  )
}
