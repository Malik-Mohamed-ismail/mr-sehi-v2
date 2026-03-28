import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast, Toaster } from 'sonner'
import { AppShell } from './components/layout/AppShell'
import { RoleRoute } from './components/layout/RoleRoute'
import { useAuthStore } from './store/authStore'
import { useAppBootstrap } from './hooks/useAppBootstrap'
import './index.css'

const LoginPage                = lazy(() => import('./features/auth/LoginPage'))
const DashboardPage            = lazy(() => import('./features/dashboard/DashboardPage'))
const PurchasesPage            = lazy(() => import('./features/purchases/PurchasesPage'))
const DeliveryRevenuePage      = lazy(() => import('./features/revenue/DeliveryRevenuePage'))
const RestaurantRevenuePage    = lazy(() => import('./features/revenue/RestaurantRevenuePage'))
const SubscriptionsRevenuePage = lazy(() => import('./features/revenue/SubscriptionsRevenuePage'))
const SubscribersPage          = lazy(() => import('./features/subscribers/SubscribersPage'))
const SuppliersPage            = lazy(() => import('./features/suppliers/SuppliersPage'))
const SupplierLedgerPage       = lazy(() => import('./features/suppliers/SupplierLedgerPage'))
const JournalPage              = lazy(() => import('./features/journal/JournalPage'))
const ExpensesPage             = lazy(() => import('./features/expenses/ExpensesPage'))
const FixedAssetsPage          = lazy(() => import('./features/fixed-assets/FixedAssetsPage'))
const PettyCashPage            = lazy(() => import('./features/petty-cash/PettyCashPage'))
const ProductionPage           = lazy(() => import('./features/production/ProductionPage'))
const ProductionSummaryPage    = lazy(() => import('./features/production/ProductionSummaryPage').then(m => ({ default: m.ProductionSummaryPage })))
const AccountsPage             = lazy(() => import('./features/accounts/AccountsPage'))
const IncomeStatementPage      = lazy(() => import('./features/reports/IncomeStatementPage'))
const PerformancePage          = lazy(() => import('./features/reports/PerformancePage'))
const BalanceSheetPage         = lazy(() => import('./features/reports/BalanceSheetPage'))
const CashFlowPage             = lazy(() => import('./features/reports/CashFlowPage'))
const ChannelAnalysisPage      = lazy(() => import('./features/reports/ChannelAnalysisPage'))
const WasteAnalysisPage        = lazy(() => import('./features/reports/WasteAnalysisPage'))
const BreakEvenPage            = lazy(() => import('./features/reports/BreakEvenPage'))
const VATSummaryPage           = lazy(() => import('./features/reports/VATSummaryPage'))
const ReportsHubPage           = lazy(() => import('./features/reports/ReportsHubPage'))
const AuditLogPage             = lazy(() => import('./features/settings/AuditLogPage'))
const UsersPage                = lazy(() => import('./features/settings/UsersPage'))
const SettingsPage             = lazy(() => import('./features/settings/SettingsPage'))
const NotFoundPage             = lazy(() => import('./features/NotFoundPage').then(m => ({ default: m.NotFoundPage })))
const TrialBalancePage         = lazy(() =>
  import('./features/reports/TrialBalancePage').then(m => ({ default: m.TrialBalancePage }))
)
const LedgerPage               = lazy(() =>
  import('./features/reports/TrialBalancePage').then(m => ({ default: m.LedgerPage }))
)

// ── Query Client ──────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:               1,
      // Reference/lookup data: 10 min stale - no need to refetch on every focus
      staleTime:           2 * 60 * 1000,   // 2 min default
      refetchOnWindowFocus: false,           // prevent excessive re-fetches on tab switch
    },
    mutations: {
      onError: (error: any) => {
        const msg = error?.response?.data?.error?.message ?? 'حدث خطأ غير متوقع'
        toast.error(msg)
      },
    },
  },
})

// ── Route Guards ──────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div style={{ padding: 24 }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12, borderRadius: 2 }} />
        ))}
      </div>
    }>
      {children}
    </Suspense>
  )
}

function AppInner() {
  useAppBootstrap()
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PageSuspense><LoginPage /></PageSuspense>} />
          <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"             element={<PageSuspense><DashboardPage /></PageSuspense>} />
            <Route path="revenue/delivery"      element={<PageSuspense><DeliveryRevenuePage /></PageSuspense>} />
            <Route path="revenue/restaurant"    element={<PageSuspense><RestaurantRevenuePage /></PageSuspense>} />
            <Route path="revenue/subscriptions" element={<PageSuspense><SubscriptionsRevenuePage /></PageSuspense>} />
            <Route path="purchases"             element={<PageSuspense><PurchasesPage /></PageSuspense>} />
            <Route path="expenses"              element={<PageSuspense><ExpensesPage /></PageSuspense>} />
            <Route path="fixed-assets"          element={<PageSuspense><FixedAssetsPage /></PageSuspense>} />
            <Route path="petty-cash"            element={<PageSuspense><PettyCashPage /></PageSuspense>} />
            <Route path="suppliers"             element={<PageSuspense><SuppliersPage /></PageSuspense>} />
            <Route path="suppliers/:id/ledger"  element={<PageSuspense><SupplierLedgerPage /></PageSuspense>} />
            <Route path="subscribers"           element={<PageSuspense><SubscribersPage /></PageSuspense>} />
            <Route path="production"            element={<PageSuspense><ProductionPage /></PageSuspense>} />
            <Route path="production/summary"    element={<PageSuspense><ProductionSummaryPage /></PageSuspense>} />

            {/* Accountant+ routes */}
            <Route path="accounts"    element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><AccountsPage /></RoleRoute></PageSuspense>} />
            <Route path="journal"     element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><JournalPage /></RoleRoute></PageSuspense>} />
            <Route path="ledger"      element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><LedgerPage /></RoleRoute></PageSuspense>} />
            <Route path="trial-balance" element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><TrialBalancePage /></RoleRoute></PageSuspense>} />
            <Route path="income-statement" element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><IncomeStatementPage /></RoleRoute></PageSuspense>} />
            <Route path="performance"      element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><PerformancePage /></RoleRoute></PageSuspense>} />
            <Route path="balance-sheet"    element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><BalanceSheetPage /></RoleRoute></PageSuspense>} />
            <Route path="cash-flow"        element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><CashFlowPage /></RoleRoute></PageSuspense>} />
            <Route path="channel-analysis" element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><ChannelAnalysisPage /></RoleRoute></PageSuspense>} />
            <Route path="waste-analysis"   element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><WasteAnalysisPage /></RoleRoute></PageSuspense>} />
            <Route path="breakeven"        element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><BreakEvenPage /></RoleRoute></PageSuspense>} />
            <Route path="vat-summary"      element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><VATSummaryPage /></RoleRoute></PageSuspense>} />
            <Route path="reports"          element={<PageSuspense><RoleRoute allowedRoles={['admin','accountant']}><ReportsHubPage /></RoleRoute></PageSuspense>} />

            {/* Admin-only routes */}
            <Route path="users"     element={<PageSuspense><RoleRoute allowedRoles={['admin']}><UsersPage /></RoleRoute></PageSuspense>} />
            <Route path="audit-log" element={<PageSuspense><RoleRoute allowedRoles={['admin']}><AuditLogPage /></RoleRoute></PageSuspense>} />
            <Route path="settings"  element={<PageSuspense><SettingsPage /></PageSuspense>} />
          </Route>

          {/* 404 — catch-all */}
          <Route path="*" element={<PageSuspense><NotFoundPage /></PageSuspense>} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'var(--font-arabic)',
            direction: 'rtl',
            borderRadius: 2,
            padding: '16px 20px',
            fontSize: '15px',
            fontWeight: 600,
            boxShadow: 'var(--shadow-lg)',
          },
        }}
      />
    </QueryClientProvider>
  )
}
