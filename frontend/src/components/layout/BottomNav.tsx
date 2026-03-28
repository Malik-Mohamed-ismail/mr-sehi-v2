import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, ShoppingCart, FileText, UserCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function BottomNav() {
  const { t } = useTranslation()

  const items = [
    { to: '/dashboard',     icon: <LayoutDashboard size={20}/>, label: t('pages.dashboard') },
    { to: '/performance',   icon: <TrendingUp size={20}/>,      label: t('pages.performance') },
    { to: '/purchases',     icon: <ShoppingCart size={20}/>,    label: t('pages.purchases') },
    { to: '/reports',       icon: <FileText size={20}/>,        label: t('pages.reports') },
    { to: '/settings',      icon: <UserCircle size={20}/>,      label: t('layout.settings') },
  ]

  return (
    <nav style={{
      display: 'none',
    }} className="bottom-nav">
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            fontSize: 10, textDecoration: 'none',
            color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
            padding: '8px 12px', borderRadius: 2, transition: 'all 0.15s',
          })}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
