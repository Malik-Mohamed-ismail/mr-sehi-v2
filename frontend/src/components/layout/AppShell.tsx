import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { BottomNav } from './BottomNav'
import { useTranslation } from 'react-i18next'

export function AppShell() {
  const { i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Sidebar/>
      <Topbar/>
      <main style={{
        // Use the CSS variable updated by Sidebar; fall back to 280px if not yet set
        ...(isRTL
          ? { marginRight: 'var(--current-sidebar-w, 280px)' }
          : { marginLeft:  'var(--current-sidebar-w, 280px)' }),
        marginTop:  'var(--topbar-h, 64px)',
        padding:    '32px',
        minHeight:  'calc(100vh - var(--topbar-h, 64px))',
        transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <Outlet/>
      </main>
      <BottomNav/>
    </div>
  )
}
