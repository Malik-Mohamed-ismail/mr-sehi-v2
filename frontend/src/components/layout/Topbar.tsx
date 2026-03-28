import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Sun, Moon, LogOut, Settings, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { useTheme } from '../../hooks/useTheme'
import { api } from '../../lib/api'
import { fadeIn } from '../../lib/animations'
import { LanguageToggle } from './LanguageToggle'

export function Topbar() {
  const location              = useLocation()
  const navigate              = useNavigate()
  const { user, logout }      = useAuthStore()
  const { theme, toggle }     = useTheme()
  const { t, i18n }           = useTranslation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const PAGE_TITLES: Record<string, string> = {
    '/dashboard':             t('pages.dashboard'),
    '/revenue/delivery':      t('pages.delivery'),
    '/revenue/restaurant':    t('pages.restaurant'),
    '/revenue/subscriptions': t('pages.subscriptions'),
    '/purchases':             t('pages.purchases'),
    '/expenses':              t('pages.expenses'),
    '/petty-cash':            t('pages.pettyCash'),
    '/suppliers':             t('pages.suppliers'),
    '/subscribers':           t('pages.subscribers'),
    '/production':            t('pages.production'),
    '/accounts':              t('pages.accounts'),
    '/journal':               t('pages.journal'),
    '/ledger':                t('pages.ledger'),
    '/trial-balance':         t('pages.trialBalance'),
    '/income-statement':      t('pages.incomeStatement'),
    '/performance':           t('pages.performance'),
    '/balance-sheet':         t('pages.balanceSheet'),
    '/cash-flow':             t('pages.cashFlow'),
    '/channel-analysis':      t('pages.channelAnalysis'),
    '/waste-analysis':        t('pages.wasteAnalysis'),
    '/breakeven':             t('pages.breakeven'),
    '/vat-summary':           t('pages.vatSummary'),
    '/audit-log':             t('pages.auditLog'),
    '/users':                 t('pages.users'),
    '/reports':               t('pages.reports'),
    '/settings':              t('layout.settings'),
  }

  const pageTitle = PAGE_TITLES[location.pathname] ?? t('layout.title')

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
  }

  const iconBtnStyle: React.CSSProperties = {
    width: 40, height: 40, padding: 0,
    justifyContent: 'center',
    background: 'var(--bg-surface-2)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    display: 'flex', alignItems: 'center',
    transition: 'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
    fontFamily: 'inherit',
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'var(--color-primary-light)'
    e.currentTarget.style.borderColor = 'var(--color-primary)'
    e.currentTarget.style.color = 'var(--color-primary-hover)'
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'var(--bg-surface-2)'
    e.currentTarget.style.borderColor = 'var(--border-color)'
    e.currentTarget.style.color = 'var(--text-secondary)'
  }

  return (
    <header className="topbar-container" style={{
      ...(i18n.dir() === 'rtl'
          ? { left: 0,   right: 'var(--current-sidebar-w, 280px)' }
          : { left: 'var(--current-sidebar-w, 280px)', right: 0 }),
    }}>
      {/* Page title */}
      <h1
        style={{ flex: 1, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-latin)' }}
      >
        {pageTitle}
      </h1>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <LanguageToggle />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label={t(theme === 'dark' ? 'layout.themeLight' : 'layout.themeDark')}
          style={iconBtnStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
        </button>

        {/* Notifications */}
        <button
          aria-label={t('layout.notifications')}
          style={{ ...iconBtnStyle, position: 'relative' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--color-danger)',
            border: '2px solid var(--bg-surface)',
          }}/>
        </button>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            style={{ ...iconBtnStyle, width: 'auto', padding: '0 12px', gap: 8, height: 40 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontWeight: 600, fontSize: 13,
            }}>
              {user?.full_name?.[0] ?? 'U'}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'currentcolor' }}>{user?.full_name}</span>
            <ChevronDown size={14} style={{ opacity: 0.7 }}/>
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                variants={fadeIn} initial="initial" animate="animate" exit="exit"
                style={{
                  position: 'absolute', top: '110%',
                  ...(i18n.dir() === 'rtl' ? { left: 0 } : { right: 0 }),
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  minWidth: 180, overflow: 'hidden',
                  zIndex: 200, padding: 8,
                }}
              >
                <div style={{ padding: '8px 12px', marginBottom: 4, borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.full_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
                </div>
                <button
                  style={{
                    width: '100%', height: 40,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0 12px', borderRadius: 'var(--radius-sm)',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)',
                    fontFamily: 'inherit', justifyContent: 'flex-start',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { setUserMenuOpen(false); navigate('/settings') }}
                >
                  <Settings size={16}/> {t('layout.settings')}
                </button>
                <button
                  style={{
                    width: '100%', height: 40,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0 12px', borderRadius: 'var(--radius-sm)',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', fontSize: 13, color: 'var(--color-danger)',
                    fontFamily: 'inherit', justifyContent: 'flex-start',
                    transition: 'all 0.15s', marginTop: 4,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-danger-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={handleLogout}
                >
                  <LogOut size={16}/> {t('layout.logout')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
