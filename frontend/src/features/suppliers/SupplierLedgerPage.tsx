import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Download, ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { exportToExcel } from '../../lib/export'
import { PageTransition } from '../../components/ui/PageTransition'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { staggerContainer, staggerItem } from '../../lib/animations'

export default function SupplierLedgerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')

  const { data: supplier } = useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const res = await api.get(`/suppliers/${id}`)
      return res.data.data
    },
  })

  const { data: ledger, isLoading } = useQuery({
    queryKey: ['supplier-ledger', id, from, to],
    queryFn: async () => {
      const res = await api.get(`/suppliers/${id}/ledger`, { params: { from, to } })
      return res.data.data
    },
  })

  const handleExport = () => {
    if (!ledger?.invoices) return
    const exportData = ledger.invoices.map((inv: any) => ({
      [t('suppliers.ledger.table.invoiceNumber')]: inv.invoice_number,
      [t('suppliers.ledger.table.date')]: inv.invoice_date,
      [t('suppliers.ledger.table.description')]: inv.item_name,
      [t('suppliers.ledger.table.paymentMethod')]: inv.payment_method,
      [t('suppliers.ledger.table.subtotal')]: Number(inv.subtotal),
      [t('suppliers.ledger.table.vat')]: Number(inv.vat_amount),
      [t('suppliers.ledger.table.total')]: Number(inv.total_amount)
    }))
    exportToExcel(exportData, t('suppliers.ledger.invoicesLog'))
  }

  return (
    <PageTransition>
      <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Header & Back Button */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={() => navigate('/suppliers')}
                className="btn btn-ghost" 
                style={{ padding: '8px', borderRadius: '50%', color: 'var(--text-secondary)' }}
                title={t('common.back') || 'رجوع'}
              >
                {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              </button>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                  {t('suppliers.ledger.title')} <span style={{ color: 'var(--color-primary)' }}>{isRTL ? supplier?.name_ar : (supplier?.name_en || supplier?.name_ar) || '...'}</span>
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('suppliers.ledger.subtitle')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <DateRangePicker from={from} to={to} onChange={(f, tr) => { setFrom(f); setTo(tr) }} />
              <button className="btn btn-secondary" style={{ gap: 6 }} onClick={handleExport} disabled={!ledger?.invoices?.length || isLoading}><Download size={14} /> {t('common.exportExcel')}</button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="skeleton" style={{ height: 100, borderRadius: 2 }} />
            <div className="skeleton" style={{ height: 400, borderRadius: 2 }} />
          </div>
        ) : ledger ? (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: 'grid', gap: 20 }}>
            
            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <motion.div variants={staggerItem} className="card kpi-card">
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('suppliers.ledger.totalInvoices')}</div>
                <AnimatedNumber value={Number(ledger.totals?.total_amount ?? 0)} suffix="" />
              </motion.div>
              <motion.div variants={staggerItem} className="card kpi-card">
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('suppliers.ledger.totalVat')}</div>
                <AnimatedNumber value={Number(ledger.totals?.vat_amount ?? 0)} suffix="" />
              </motion.div>
              <motion.div variants={staggerItem} className="card kpi-card" style={{ borderTop: '2px solid var(--color-danger)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div className="kpi-icon-circle kpi-icon-circle--danger"><FileText size={16} /></div>
                  <span className="kpi-label">{t('suppliers.ledger.outstandingBalance')}</span>
                </div>
                <AnimatedNumber value={Number(ledger.outstanding_balance ?? 0)} suffix="" />
              </motion.div>
            </div>

            {/* Invoices Table */}
            <motion.div variants={staggerItem} className="card">
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>{t('suppliers.ledger.invoicesLog')}</h3>
              <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('suppliers.ledger.table.invoiceNumber')}</th>
                    <th>{t('suppliers.ledger.table.date')}</th>
                    <th>{t('suppliers.ledger.table.description')}</th>
                    <th>{t('suppliers.ledger.table.paymentMethod')}</th>
                    <th>{t('suppliers.ledger.table.subtotal')}</th>
                    <th>{t('suppliers.ledger.table.vat')}</th>
                    <th>{t('suppliers.ledger.table.total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.invoices?.map((inv: any) => (
                    <tr key={inv.id}>
                      <td style={{ fontFamily: 'var(--font-latin)' }}>{inv.invoice_number}</td>
                      <td style={{ fontFamily: 'var(--font-latin)', fontSize: 13 }}>{inv.invoice_date}</td>
                      <td>{inv.item_name}</td>
                      <td>
                        <span className={`badge ${inv.payment_method === 'آجل' ? 'badge-danger' : 'badge-success'}`}>
                          {inv.payment_method}
                        </span>
                      </td>
                      <td className="number">{Number(inv.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="number">{Number(inv.vat_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="number" style={{ fontWeight: 600 }}>{Number(inv.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {!ledger.invoices?.length && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('common.noData')}</td></tr>
                  )}
                </tbody>
              </table>
          </div>
            </motion.div>

          </motion.div>
        ) : null}
      </div>
    </PageTransition>
  )
}
