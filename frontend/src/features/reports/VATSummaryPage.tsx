import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Download, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { staggerContainer, staggerItem } from '../../lib/animations'

const toDay = new Date().toISOString().split('T')[0]
const fromDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

export default function VATSummaryPage() {
  const { t } = useTranslation()
  const [from, setFrom] = useState(fromDay)
  const [to, setTo]     = useState(toDay)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vat-summary', from, to],
    queryFn: async () => {
      const res = await api.get('/reports/vat-summary', { params: { from, to } })
      return res.data.data
    },
  })

  return (
    <PageTransition>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{t('pages.vatSummary')}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('reports.vatDesc')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <DateRangePicker from={from} to={to} onChange={(f, tr) => { setFrom(f); setTo(tr) }} />
            <button className="btn btn-ghost" onClick={() => refetch()}><RefreshCw size={14} /></button>
            <button className="btn btn-secondary" style={{ gap: 6 }}><Download size={14} /> {t('common.exportExcel')}</button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 2 }} />)}
          </div>
        ) : data ? (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: 'grid', gap: 20 }}>
            {/* Summary KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <motion.div variants={staggerItem} className="card" style={{ borderTop: '3px solid var(--color-info)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('vat.vatInput')}</div>
                <AnimatedNumber value={Number(data.totalVatInput ?? 0)} suffix="" />
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{t('vat.fromPurchases')}</div>
              </motion.div>
              <motion.div variants={staggerItem} className="card" style={{ borderTop: '3px solid var(--color-warning)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('vat.vatOutput')}</div>
                <AnimatedNumber value={Number(data.totalVatOutput ?? 0)} suffix="" />
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{t('vat.fromRevenue')}</div>
              </motion.div>
              <motion.div variants={staggerItem} className="card" style={{
                borderTop: `3px solid ${Number(data.netVatPayable ?? 0) >= 0 ? 'var(--color-danger)' : 'var(--color-success)'}`,
                background: Number(data.netVatPayable ?? 0) >= 0 ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('vat.netPayable')}</div>
                <AnimatedNumber value={Number(data.netVatPayable ?? 0)} suffix="" />
                <div style={{ fontSize: 11, marginTop: 4, color: Number(data.netVatPayable ?? 0) >= 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {Number(data.netVatPayable ?? 0) >= 0 ? t('vat.payable') : t('vat.refundable')}
                </div>
              </motion.div>
            </div>

            {/* VAT by supplier table */}
            {data.bySupplier?.length > 0 && (
              <motion.div variants={staggerItem} className="card">
                <h3 style={{ fontWeight: 600, marginBottom: 16 }}>{t('vat.bySupplier')}</h3>
                <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('suppliers.name')}</th>
                      <th>{t('suppliers.vatNumber')}</th>
                      <th>{t('vat.invoiceCount')}</th>
                      <th>{t('vat.subtotal')}</th>
                      <th>{t('vat.vatAmount')}</th>
                      <th>{t('vat.total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bySupplier.map((sup: any) => (
                      <tr key={sup.supplier_id}>
                        <td style={{ fontWeight: 600 }}>{sup.supplier_name}</td>
                        <td className="number" style={{ fontSize: 12 }}>{sup.vat_number ?? '—'}</td>
                        <td className="number">{sup.invoice_count}</td>
                        <td className="number">{Number(sup.subtotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="number" style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                          {Number(sup.vat_amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="number" style={{ fontWeight: 700 }}>
                          {Number(sup.total_amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>{t('common.noData')}</div>
        )}
      </div>
    </PageTransition>
  )
}
