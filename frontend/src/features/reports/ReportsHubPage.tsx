import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, TrendingUp, BarChart3, PieChart, Calculator,
  Zap, AlertTriangle, Eye, Download, ArrowRight, Sparkles,
  Fuel, AlertCircle, TrendingDown, Filter, ChevronRight,
  Activity, Wallet, Package, Users
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageTransition } from '../../components/ui/PageTransition'

// Type definitions
interface ReportCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  path: string
  category: 'financial' | 'analysis' | 'operational'
  requiresFilter: boolean
  color: 'gold' | 'success' | 'danger' | 'info'
  badge?: string
}


// UI Components
const CategorySection = ({ title, reports, dateRange, t, i18n }: any) => {
  const navigate = useNavigate()
  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } }
  }
  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  return (
    <motion.div initial="initial" whileInView="animate" variants={staggerContainer} viewport={{ once: true }}>
      <h3 style={{
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 20,
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{
          width: 4,
          height: 24,
          background: 'var(--color-primary)',
          borderRadius: 2,
        }}></span>
        {title}
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 20,
        marginBottom: 40,
      }}>
        {reports.map((report: ReportCard) => (
          <motion.div
            key={report.id}
            variants={staggerItem}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <ReportCardComponent report={report} onNavigate={navigate} dateRange={dateRange} t={t} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const ReportCardComponent = ({ report, onNavigate, dateRange, t }: any) => {
  const colorMap: Record<string, { bg: string; border: string; glow: string; icon: string }> = {
    gold: {
      bg: 'rgba(212,168,83,0.08)',
      border: 'rgba(212,168,83,0.12)',
      glow: '0 0 20px rgba(212,168,83,0.20)',
      icon: 'var(--color-primary)',
    },
    success: {
      bg: 'rgba(29,184,123,0.08)',
      border: 'rgba(29,184,123,0.12)',
      glow: '0 0 20px rgba(29,184,123,0.20)',
      icon: '#1db87b',
    },
    danger: {
      bg: 'rgba(232,56,77,0.08)',
      border: 'rgba(232,56,77,0.12)',
      glow: '0 0 20px rgba(232,56,77,0.15)',
      icon: '#e8384d',
    },
    info: {
      bg: 'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.12)',
      glow: '0 0 20px rgba(59,130,246,0.15)',
      icon: '#3b82f6',
    },
  }

  const colors = colorMap[report.color]

  const handleClick = () => {
    onNavigate(report.path)
  }

  return (
    <motion.div
      onClick={handleClick}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        padding: 24,
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      whileHover={{
        boxShadow: colors.glow,
        borderColor: colors.icon,
      }}
    >
      {/* Background gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${colors.icon}08 0%, transparent 100%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon and badge */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: `${colors.icon}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.icon,
          }}>
            {report.icon}
          </div>
          {report.badge && (
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 2,
              background: `${colors.icon}20`,
              color: colors.icon,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              {report.badge}
            </span>
          )}
        </div>

        {/* Title and Description */}
        <h4 style={{
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8,
          lineHeight: 1.4,
        }}>
          {report.title}
        </h4>
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: 16,
          minHeight: 40,
        }}>
          {report.description}
        </p>

        {/* Filter indicator */}
        {report.requiresFilter && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginBottom: 16,
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 2,
            width: 'fit-content',
          }}>
            <Filter size={14} />
            {t('reports.filterIndicator')}
          </div>
        )}

        {/* Action button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: colors.icon,
          fontWeight: 600,
          fontSize: 14,
        }}>
          <span>{t('reports.viewReport')}</span>
          <ChevronRight size={18} style={{ transition: 'transform 0.3s' }} />
        </div>
      </div>
    </motion.div>
  )
}

// Main Component
export default function ReportsHubPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState(() => {
    const d = new Date()
    return {
      from: new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().split('T')[0],
      to: d.toISOString().split('T')[0],
    }
  })

  // Build REPORTS array reactively based on current language
  const REPORTS = useMemo(() => [
    // Financial Statements
    {
      id: 'income-statement',
      title: t('reports.incomeStatement.title'),
      description: t('reports.incomeStatement.description'),
      icon: <TrendingUp size={24} />,
      path: '/income-statement',
      category: 'financial' as const,
      requiresFilter: true,
      color: 'success' as const,
    },
    {
      id: 'balance-sheet',
      title: t('reports.balanceSheet.title'),
      description: t('reports.balanceSheet.description'),
      icon: <BarChart3 size={24} />,
      path: '/balance-sheet',
      category: 'financial' as const,
      requiresFilter: false,
      color: 'info' as const,
    },
    {
      id: 'cash-flow',
      title: t('reports.cashFlow.title'),
      description: t('reports.cashFlow.description'),
      icon: <Wallet size={24} />,
      path: '/cash-flow',
      category: 'financial' as const,
      requiresFilter: true,
      color: 'gold' as const,
      badge: t('reports.badgeFinancial'),
    },
    {
      id: 'trial-balance',
      title: t('reports.trialBalance.title'),
      description: t('reports.trialBalance.description'),
      icon: <Calculator size={24} />,
      path: '/trial-balance',
      category: 'financial' as const,
      requiresFilter: false,
      color: 'info' as const,
    },

    // Analysis Reports
    {
      id: 'performance',
      title: t('reports.performance.title'),
      description: t('reports.performance.description'),
      icon: <Activity size={24} />,
      path: '/performance',
      category: 'analysis' as const,
      requiresFilter: true,
      color: 'success' as const,
    },
    {
      id: 'channel-analysis',
      title: t('reports.channelAnalysis.title'),
      description: t('reports.channelAnalysis.description'),
      icon: <PieChart size={24} />,
      path: '/channel-analysis',
      category: 'analysis' as const,
      requiresFilter: true,
      color: 'gold' as const,
      badge: t('reports.badgeAnalysis'),
    },
    {
      id: 'vat-summary',
      title: t('reports.vatSummary.title'),
      description: t('reports.vatSummary.description'),
      icon: <AlertCircle size={24} />,
      path: '/vat-summary',
      category: 'analysis' as const,
      requiresFilter: true,
      color: 'danger' as const,
    },
    {
      id: 'waste-analysis',
      title: t('reports.wasteAnalysis.title'),
      description: t('reports.wasteAnalysis.description'),
      icon: <AlertTriangle size={24} />,
      path: '/waste-analysis',
      category: 'analysis' as const,
      requiresFilter: true,
      color: 'danger' as const,
      badge: t('reports.badgeAnalysis'),
    },
    {
      id: 'breakeven',
      title: t('reports.breakeven.title'),
      description: t('reports.breakeven.description'),
      icon: <Zap size={24} />,
      path: '/breakeven',
      category: 'analysis' as const,
      requiresFilter: true,
      color: 'success' as const,
      badge: t('reports.badgeInvestment'),
    },

    // Operational Reports
    {
      id: 'ledger',
      title: t('reports.ledger.title'),
      description: t('reports.ledger.description'),
      icon: <FileText size={24} />,
      path: '/ledger',
      category: 'operational' as const,
      requiresFilter: true,
      color: 'info' as const,
    },
    {
      id: 'audit-log',
      title: t('reports.auditLog.title'),
      description: t('reports.auditLog.description'),
      icon: <Eye size={24} />,
      path: '/audit-log',
      category: 'operational' as const,
      requiresFilter: false,
      color: 'danger' as const,
      badge: t('reports.badgeSecurity'),
    },
  ], [t])

  // Categorize reports
  const financialReports = REPORTS.filter(r => r.category === 'financial')
  const analysisReports = REPORTS.filter(r => r.category === 'analysis')
  const operationalReports = REPORTS.filter(r => r.category === 'operational')

  return (
    <PageTransition>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            marginBottom: 40,
            paddingBottom: 32,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(212,168,83,0.20) 0%, rgba(212,168,83,0.05) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}>
              <FileText size={28} />
            </div>
            <h1 style={{
              fontSize: i18n.dir() === 'rtl' ? 36 : 40,
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--color-primary) 0%, rgba(212,168,83,0.7) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
            }}>
              {t('reports.pageTitle')}
            </h1>
          </div>

          <p style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            maxWidth: 600,
            lineHeight: 1.6,
            marginBottom: 24,
          }}>
            {t('reports.pageDescription')}
          </p>

          {/* Date Range Filter */}
          <div style={{
            display: 'flex',
            gap: 16,
            padding: 20,
            background: 'rgba(212,168,83,0.05)',
            border: '1px solid rgba(212,168,83,0.15)',
            borderRadius: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {t('reports.dateRangeLabel')}
            </span>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(r => ({ ...r, from: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  borderRadius: 2,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-latin)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>←</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(r => ({ ...r, to: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  borderRadius: 2,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-latin)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Reports Grid by Category */}
        <div style={{ marginBottom: 60 }}>
          {/* Financial Statements */}
          <CategorySection
            title={t('reports.categoriesFinancial')}
            reports={financialReports}
            dateRange={dateRange}
            t={t}
            i18n={i18n}
          />

          {/* Analysis Reports */}
          <CategorySection
            title={t('reports.categoriesAnalysis')}
            reports={analysisReports}
            dateRange={dateRange}
            t={t}
            i18n={i18n}
          />

          {/* Operational Reports */}
          <CategorySection
            title={t('reports.categoriesOperational')}
            reports={operationalReports}
            dateRange={dateRange}
            t={t}
            i18n={i18n}
          />
        </div>

        {/* Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{
            padding: 32,
            background: 'linear-gradient(135deg, rgba(212,168,83,0.08) 0%, rgba(212,168,83,0.03) 100%)',
            border: '1px solid rgba(212,168,83,0.15)',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 12,
          }}>
            {t('reports.footerTipTitle')}
          </h3>
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 600,
            margin: '0 auto 20px',
          }}>
            {t('reports.footerTipDescription')}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const allReportIds = REPORTS.map(r => r.path);
                navigate(allReportIds[0] || '/dashboard');
              }}
              style={{
                padding: '12px 24px',
                borderRadius: 2,
                background: 'var(--color-primary)',
                color: 'white',
                border: '1px solid rgba(43,146,37,0.30)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLElement).style.boxShadow = '0 8px 20px rgba(212,168,83,0.3)';
                (e.target as HTMLElement).style.borderColor = 'rgba(43,146,37,0.50)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.transform = 'translateY(0)';
                (e.target as HTMLElement).style.boxShadow = 'none';
                (e.target as HTMLElement).style.borderColor = 'rgba(43,146,37,0.30)';
              }}
            >
              <Download size={16} />
              {t('reports.buttonGetStarted')}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '12px 24px',
                borderRadius: 2,
                background: 'transparent',
                color: 'var(--color-primary)',
                border: '1px solid rgba(43,146,37,0.25)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(212,168,83,0.1)';
                (e.target as HTMLElement).style.borderColor = 'rgba(43,146,37,0.40)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'transparent';
                (e.target as HTMLElement).style.borderColor = 'rgba(43,146,37,0.25)';
              }}
            >
              {t('reports.buttonBackDashboard')}
            </button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
