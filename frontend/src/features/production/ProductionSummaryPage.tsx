import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { formatSAR } from '../../lib/utils'
import { exportToExcel } from '../../lib/export'
import i18n from '../../lib/i18n'

export function ProductionSummaryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'

  const { data: summary, isLoading } = useQuery({
    queryKey: ['production-summary'],
    queryFn: () => api.get('/production/summary').then(r => r.data.data),
  })

  const handleExport = () => {
    const exportData = (summary ?? []).map((s: any) => ({
      [i18n.t('production.table.product')]: s.product_name,
      [i18n.t('production.table.productionKg')]: s.total_kg,
      [i18n.t('production.table.wasteGrams')]: s.total_waste_grams,
      [i18n.t('production.table.wasteValue')]: s.total_waste_value,
      [i18n.t('production.table.wastePct')]: s.waste_pct
    }))
    exportToExcel(exportData, i18n.t('production.section1'))
  }

  return (
    <PageTransition>
      {/* Breadcrumb / Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => navigate('/production')}
            className="btn btn-ghost" 
            style={{ padding: '8px', borderRadius: '50%', color: 'var(--text-secondary)' }}
            title={t('common.back') || 'رجوع'}
          >
            {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>
              <span>{t('production.pageTitle')}</span>
              <span style={{ fontSize: 10 }}>/</span>
              <span style={{ color: 'var(--color-primary)' }}>{t('production.section1')}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('production.section1')}</h2>
          </div>
        </div>
        
        <button className="btn btn-secondary" onClick={handleExport} disabled={!summary?.length || isLoading}>
          <Download size={16}/> تصدير Excel
        </button>
      </div>

      {/* Content */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto', marginBottom: 16 }}></div>
          </div>
        ) : summary?.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
            لا توجد بيانات متاحة للملخص
          </div>
        ) : (
          <div style={{ overflow: 'auto', width: '100%' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('production.table.product')}</th>
                  <th>{t('production.table.productionKg')}</th>
                  <th>{t('production.table.wasteGrams')}</th>
                  <th>{t('production.table.wasteValue')}</th>
                  <th>{t('production.table.wastePct')}</th>
                </tr>
              </thead>
              <tbody>
                {(summary ?? []).map((s: any) => (
                  <tr key={s.product_name}>
                    <td style={{ fontWeight: 600 }}>{s.product_name}</td>
                    <td className="amount">{Number(s.total_kg).toFixed(2)}</td>
                    <td className="amount">{Number(s.total_waste_grams).toFixed(0)}</td>
                    <td className="amount" style={{ color: 'var(--color-danger)' }}>{formatSAR(s.total_waste_value)}</td>
                    <td className="amount">
                      <span className={`badge ${Number(s.waste_pct) > 5 ? 'badge-danger' : 'badge-success'}`}>
                        {Number(s.waste_pct).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
