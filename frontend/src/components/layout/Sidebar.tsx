import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, FileText,
  Truck, UtensilsCrossed, Package,
  ShoppingCart, Briefcase, Wallet,
  Users, UserCheck, Factory,
  BookOpen, BookMarked, Scale, DollarSign,
  ChevronLeft, ChevronRight, ChevronDown,
  BarChart2, Leaf, Target, Receipt, Shield, UserCog, Building,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'

/* ── Types ─────────────────────────────────────────────────────────────── */
interface NavItem {
  to:     string
  icon:   React.ReactNode
  label:  string
  roles?: string[]
}

interface NavSection {
  id:     string
  title:  string
  items:  NavItem[]
}

/* ── Nav config ──────────────────────────────────────────────────────────── */
const NAV_SECTIONS: NavSection[] = [
  {
    id: 'main', title: '',
    items: [
      { to: '/dashboard',   icon: <LayoutDashboard size={20}/>, label: 'pages.dashboard' },
      { to: '/performance', icon: <TrendingUp size={20}/>,      label: 'pages.performance' },
      { to: '/reports',     icon: <FileText size={20}/>,        label: 'pages.reports' },
    ],
  },
  {
    id: 'revenue', title: 'sidebar.revenue',
    items: [
      { to: '/revenue/delivery',      icon: <Truck size={20}/>,           label: 'pages.delivery' },
      { to: '/revenue/restaurant',    icon: <UtensilsCrossed size={20}/>, label: 'pages.restaurant' },
      { to: '/revenue/subscriptions', icon: <Package size={20}/>,         label: 'pages.subscriptions' },
    ],
  },
  {
    id: 'expenses', title: 'sidebar.expenses',
    items: [
      { to: '/purchases',  icon: <ShoppingCart size={20}/>, label: 'pages.purchases' },
      { to: '/expenses',   icon: <Briefcase size={20}/>,    label: 'pages.expenses' },
      { to: '/petty-cash', icon: <Wallet size={20}/>,       label: 'pages.pettyCash' },
    ],
  },
  {
    id: 'management', title: 'sidebar.management',
    items: [
      { to: '/suppliers',   icon: <Users size={20}/>,    label: 'pages.suppliers' },
      { to: '/subscribers', icon: <UserCheck size={20}/>,label: 'pages.subscribers' },
      { to: '/production',  icon: <Factory size={20}/>,  label: 'pages.production' },
      { to: '/fixed-assets', icon: <Building size={20}/>, label: 'pages.fixedAssets' },
    ],
  },
  {
    id: 'accounting', title: 'sidebar.accounting',
    items: [
      { to: '/accounts',         icon: <BookOpen size={20}/>,   label: 'pages.accounts',        roles: ['admin','accountant'] },
      { to: '/journal',          icon: <BookMarked size={20}/>, label: 'pages.journal',         roles: ['admin','accountant'] },
      { to: '/ledger',           icon: <Scale size={20}/>,      label: 'pages.ledger',          roles: ['admin','accountant'] },
      { to: '/trial-balance',    icon: <Scale size={20}/>,      label: 'pages.trialBalance',    roles: ['admin','accountant'] },
      { to: '/income-statement', icon: <DollarSign size={20}/>, label: 'pages.incomeStatement', roles: ['admin','accountant'] },
    ],
  },
  {
    id: 'analysis', title: 'sidebar.analysis',
    items: [
      { to: '/balance-sheet',    icon: <FileText size={20}/>,   label: 'pages.balanceSheet',    roles: ['admin','accountant'] },
      { to: '/cash-flow',        icon: <TrendingUp size={20}/>, label: 'pages.cashFlow',        roles: ['admin','accountant'] },
      { to: '/channel-analysis', icon: <BarChart2 size={20}/>,  label: 'pages.channelAnalysis', roles: ['admin','accountant'] },
      { to: '/waste-analysis',   icon: <Leaf size={20}/>,       label: 'pages.wasteAnalysis',   roles: ['admin','accountant'] },
      { to: '/breakeven',        icon: <Target size={20}/>,     label: 'pages.breakeven',       roles: ['admin','accountant'] },
      { to: '/vat-summary',      icon: <Receipt size={20}/>,    label: 'pages.vatSummary',      roles: ['admin','accountant'] },
    ],
  },
  {
    id: 'admin', title: 'sidebar.administration',
    items: [
      { to: '/users',     icon: <UserCog size={20}/>, label: 'pages.users',    roles: ['admin'] },
      { to: '/audit-log', icon: <Shield size={20}/>,  label: 'pages.auditLog', roles: ['admin'] },
    ],
  },
]

const EXPANDED_W  = 280
const COLLAPSED_W = 80

/* ── Component ───────────────────────────────────────────────────────────── */
export function Sidebar() {
  const [expanded, setExpanded]       = useState(true)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    main: true, revenue: true, expenses: true,
    management: true, accounting: true, analysis: true, admin: true,
  })

  const { user }      = useAuthStore()
  const location      = useLocation()
  const { t, i18n }   = useTranslation()
  const isRtl         = i18n.dir() === 'rtl'

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--current-sidebar-w',
      `${expanded ? EXPANDED_W : COLLAPSED_W}px`
    )
  }, [expanded])

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <motion.aside
      animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      style={{
        position:      'fixed',
        top: 0, bottom: 0,
        ...(isRtl ? { right: 0 } : { left: 0 }),
        zIndex:        100,
        background:    'var(--bg-sidebar)',
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
        borderInlineEnd: '1px solid var(--border-color)',
      }}
    >

      {/* ── Logo bar ──────────────────────────────────────────────────── */}
      <div style={{
        height: 64, padding: expanded ? '0 20px' : '0 12px',
        display: 'flex', alignItems: 'center', justifyContent: expanded ? 'space-between' : 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0, gap: 12,
      }}>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', minWidth: 0 }}
            >
              <img src="/logo_icon_only.png" alt="logo"
                style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 18, lineHeight: 1.2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t('layout.title')}
                </div>
                <div style={{ color: 'var(--text-on-sidebar)', fontSize: 11, opacity: 0.8, whiteSpace: 'nowrap', fontWeight: 500 }}>
                  {t('sidebar.systemName')}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!expanded && (
          <img src="/logo_icon_only.png" alt="logo"
            style={{ width: 36, height: 36, objectFit: 'contain', margin: '0 auto' }} />
        )}

        <button
          onClick={() => setExpanded(v => !v)}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{
            flexShrink: 0, width: 32, height: 32,
            borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
            background: 'rgba(255,255,255,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-on-sidebar)',
            transition: 'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--color-primary-alpha)';
            e.currentTarget.style.color = 'var(--color-primary-light)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.color = 'var(--text-on-sidebar)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          {isRtl
            ? (expanded ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>)
            : (expanded ? <ChevronLeft  size={16}/> : <ChevronRight size={16}/>)
          }
        </button>
      </div>

      {/* ── Scrollable nav ────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 16, paddingBottom: 16 }}>
        {NAV_SECTIONS.map(section => {
          const visibleItems = section.items.filter(
            item => !item.roles || item.roles.includes(user?.role ?? '')
          )
          if (!visibleItems.length) return null

          const sectionHasActive = visibleItems.some(item => location.pathname.startsWith(item.to))
          const isSectionOpen = openSections[section.id] ?? true

          return (
            <div key={section.id} style={{ marginBottom: 4 }}>
              {expanded && section.title && (
                <button
                  onClick={() => toggleSection(section.id)}
                  style={{
                    width: '100%', border: 'none', background: 'none',
                    padding: '8px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', userSelect: 'none',
                  }}
                >
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: sectionHasActive ? 'var(--color-primary-light)' : 'var(--text-on-sidebar)',
                    opacity: sectionHasActive ? 1 : 0.6,
                    transition: 'all 0.2s',
                  }}>
                    {t(section.title)}
                  </span>
                  <motion.span
                    animate={{ rotate: isSectionOpen ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                    style={{ flexShrink: 0, color: sectionHasActive ? 'var(--color-primary-light)' : 'var(--text-on-sidebar)', opacity: 0.6 }}
                  >
                    <ChevronDown size={14}/>
                  </motion.span>
                </button>
              )}

              {!expanded && section.title && (
                <div style={{ height: 1, margin: '12px 16px', background: 'rgba(255,255,255,0.05)' }}/>
              )}

              <AnimatePresence initial={false}>
                {(isSectionOpen || !expanded) && (
                  <motion.div
                    key={section.id + '-items'}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    {visibleItems.map(item => {
                      const active = location.pathname.startsWith(item.to)
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          title={!expanded ? String(t(item.label)) : undefined}
                          style={{
                            display:        'flex',
                            alignItems:     'center',
                            gap:            expanded ? 14 : 0,
                            justifyContent: expanded ? 'flex-start' : 'center',
                            padding:        expanded ? '10px 24px' : '14px 0',
                            margin:         '4px 12px',
                            borderRadius:   'var(--radius-lg)',
                            textDecoration: 'none',
                            background:     active ? 'var(--color-primary)' : 'transparent',
                            color:          active ? '#ffffff' : 'var(--text-on-sidebar)',
                            fontSize:       14,
                            fontWeight:     500,
                            transition:     'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                            position:       'relative',
                          }}
                          onMouseEnter={e => {
                            if (!active) {
                              e.currentTarget.style.background = 'var(--bg-sidebar-hover)';
                              e.currentTarget.style.color = '#ffffff';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!active) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--text-on-sidebar)';
                            }
                          }}
                        >
                          {!expanded && active && (
                            <span style={{
                              position: 'absolute',
                              insetInlineStart: -8, top: '50%', transform: 'translateY(-50%)',
                              width: 3, height: 24, borderRadius: 2,
                              background: '#ffffff',
                            }}/>
                          )}

                          <span style={{ flexShrink: 0, transition: 'transform 0.2s', transform: active ? 'scale(1.1)' : 'scale(1)' }}>
                            {item.icon}
                          </span>

                          <AnimatePresence initial={false}>
                            {expanded && (
                              <motion.span
                                key="label"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                              >
                                {t(item.label)}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </NavLink>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {/* ── User footer ───────────────────────────────────────────────── */}
      {user && (
        <div style={{
          padding:       expanded ? '20px 24px' : '20px 0',
          borderTop:     '1px solid rgba(255,255,255,0.05)',
          background:    'rgba(255,255,255,0.02)',
          display:       'flex',
          alignItems:    'center',
          justifyContent: expanded ? 'flex-start' : 'center',
          gap:           12,
          flexShrink:    0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF', fontWeight: 700, fontSize: 14,
            flexShrink: 0,
          }}>
            {user.full_name?.[0] ?? 'U'}
          </div>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                style={{ overflow: 'hidden', minWidth: 0 }}
              >
                <div style={{
                  color: '#FFFFFF', fontSize: 13, fontWeight: 600,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {user.full_name}
                </div>
                <div style={{ color: 'var(--text-on-sidebar)', fontSize: 12, opacity: 0.8, whiteSpace: 'nowrap' }}>
                  {t(`sidebar.roles.${user.role}`)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.aside>
  )
}
