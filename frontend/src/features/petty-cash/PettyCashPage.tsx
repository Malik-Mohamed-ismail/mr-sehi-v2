import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Plus, CheckCircle, XCircle, Download, Trash2, X, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { SearchInput } from '../../components/ui/SearchInput'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatSAR, formatDate } from '../../lib/utils'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'
import { exportToExcel } from '../../lib/export'
import { useAuthStore } from '../../store/authStore'

export default function PettyCashPage() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [search, setSearch]         = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const today = new Date().toISOString().split('T')[0]

  const { data: records, isLoading } = useQuery({
    queryKey: ['petty-cash'],
    queryFn: () => api.get('/petty-cash').then(r => r.data.data),
  })

  const { data: reconciliation } = useQuery({
    queryKey: ['petty-cash-reconciliation'],
    queryFn: () => api.get(`/petty-cash/reconciliation?date=${today}`).then(r => r.data.data),
  })

  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { transaction_date: today, opening_balance: 0, cashier_replenishment: 0, cash_purchases: 0, card_purchases: 0, closing_balance: 0, notes: '' },
  })

  const opening   = watch('opening_balance') ?? 0
  const replenish = watch('cashier_replenishment') ?? 0
  const cashP     = watch('cash_purchases') ?? 0
  const cardP     = watch('card_purchases') ?? 0
  const expected  = Number(opening) + Number(replenish) - Number(cashP) - Number(cardP)

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/petty-cash', data),
    onSuccess: () => {
      toast.success(t('pettyCash.messages.createSuccess'))
      qc.invalidateQueries({ queryKey: ['petty-cash'] })
      qc.invalidateQueries({ queryKey: ['petty-cash-reconciliation'] })
      reset(); setShowForm(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('pettyCash.messages.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/petty-cash/${id}`, data),
    onSuccess: () => {
      toast.success(t('common.updateSuccess'))
      qc.invalidateQueries({ queryKey: ['petty-cash'] })
      qc.invalidateQueries({ queryKey: ['petty-cash-reconciliation'] })
      reset(); setShowForm(false); setEditingRecord(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('pettyCash.messages.error')),
  })

  const deleteMutation = useMutation({
    onMutate: async (deletedId) => {
      qc.setQueriesData({ type: 'active' }, (old: any) => {
        if (Array.isArray(old)) return old.filter((item: any) => item?.id !== deletedId)
        if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.filter((item: any) => item?.id !== deletedId) }
        return old
      })
    },
    mutationFn: (id: string) => api.delete(`/petty-cash/${id}`),
    onSuccess: () => {
      toast.success(t('purchases.messages.deleteSuccess') || 'تم الحذف')
      qc.invalidateQueries({ queryKey: ['petty-cash'] })
      qc.invalidateQueries({ queryKey: ['petty-cash-reconciliation'] })
      setDeleteId(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('pettyCash.messages.error')),
  })

  const handleExport = () => {
    const exportData = (records ?? []).map((r: any) => ({
      [i18n.t('pettyCash.table.date')]: formatDate(r.transaction_date),
      [i18n.t('pettyCash.table.opening')]: r.opening_balance,
      [i18n.t('pettyCash.table.replenishment')]: r.cashier_replenishment,
      [i18n.t('pettyCash.table.purchases')]: Number(r.cash_purchases) + Number(r.card_purchases),
      [i18n.t('pettyCash.table.closing')]: r.closing_balance,
      [i18n.t('pettyCash.table.variance')]: r.variance,
      [i18n.t('pettyCash.table.status')]: r.is_balanced ? i18n.t('pettyCash.table.balanced') : i18n.t('pettyCash.table.unbalanced'),
    }))
    exportToExcel(exportData, i18n.t('pettyCash.exportTitle'))
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('pettyCash.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t('pettyCash.pageSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleExport} disabled={!records?.length}>
            <Download size={16}/> تصدير Excel
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}><Plus size={16}/> {t('pettyCash.newEntry')}</button>
        </div>
      </div>

      {/* Today reconciliation */}
      {reconciliation && reconciliation.opening_balance !== undefined && (
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px', borderColor: reconciliation.is_balanced ? 'var(--color-success)' : 'var(--color-danger)', borderWidth: 1, borderStyle: 'solid' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            {reconciliation.is_balanced
              ? <CheckCircle size={18} color="var(--color-success)"/>
              : <XCircle size={18} color="var(--color-danger)"/>}
            <span style={{ fontWeight: 700 }}>{t('pettyCash.reconciliation.today')}{formatDate(today)}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: t('pettyCash.reconciliation.openingBalance'), value: reconciliation.opening_balance },
              { label: t('pettyCash.reconciliation.replenishment'), value: reconciliation.cashier_replenishment },
              { label: t('pettyCash.reconciliation.expected'), value: reconciliation.expected },
              { label: t('pettyCash.reconciliation.variance'), value: reconciliation.variance, highlight: true },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{item.label}</div>
                <div className="number" style={{ fontWeight: 700, color: item.highlight ? (Math.abs(reconciliation.variance) < 0.01 ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--text-primary)' }}>
                  {formatSAR(item.value ?? 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 24 }}>
          <div className="form-card-header">
            <span className="form-card-header-title">{editingRecord ? <Edit2 size={16}/> : '➕'} {editingRecord ? t('common.edit') : t('pettyCash.newEntry')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false); setEditingRecord(null) }} title="إغلاق"><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit((d) => {
            if (editingRecord) updateMutation.mutate({ id: editingRecord.id, data: d })
            else createMutation.mutate(d)
          })} dir={i18n.dir()}>
            <div className="form-section-header">
              <div className="form-section-number">١</div>
              <div className="form-section-title">{t('pettyCash.section1')}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value"><label>{t('pettyCash.fields.date')}</label><input {...register('transaction_date')} type="date" className="form-input"/></div>
              <div className="form-field has-value"><label>{t('pettyCash.fields.openingBalance')}</label><input {...register('opening_balance')} type="number" step="0.01" className="form-input"/></div>
              <div className="form-field has-value"><label>{t('pettyCash.fields.replenishment')}</label><input {...register('cashier_replenishment')} type="number" step="0.01" className="form-input"/></div>
              <div className="form-field has-value"><label>{t('pettyCash.fields.cashPurchases')}</label><input {...register('cash_purchases')} type="number" step="0.01" className="form-input"/></div>
              <div className="form-field has-value"><label>{t('pettyCash.fields.cardPurchases')}</label><input {...register('card_purchases')} type="number" step="0.01" className="form-input"/></div>
              <div className="form-field has-value">
                <label style={{ color: 'var(--color-success)' }}>الرصيد المتوقع</label>
                <input readOnly value={expected.toFixed(2)} className="form-input amount-field"/>
              </div>
              <div className="form-field has-value"><label>{t('pettyCash.fields.closingBalance')}</label><input {...register('closing_balance')} type="number" step="0.01" className="form-input"/></div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { reset(); setShowForm(false); setEditingRecord(null) }}>{t('pettyCash.buttons.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || updateMutation.isPending}>{(isSubmitting || updateMutation.isPending) ? t('pettyCash.buttons.saving') : t('pettyCash.buttons.save')}</button>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.search') || 'بحث...'} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
          <table className="data-table">
            <thead><tr>
              <th>{t('pettyCash.table.date')}</th>
              <th>{t('pettyCash.table.opening')}</th>
              <th>{t('pettyCash.table.replenishment')}</th>
              <th>{t('pettyCash.table.purchases')}</th>
              <th>{t('pettyCash.table.closing')}</th>
              <th>{t('pettyCash.table.variance')}</th>
              <th>{t('pettyCash.table.status')}</th>
              <th style={{ width: 80 }}></th>
            </tr></thead>
            <tbody>
              {(records ?? []).filter((i: any) => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase())).map((r: any) => (
                <tr key={r.id}>
                  <td className="amount">{formatDate(r.transaction_date)}</td>
                  <td className="amount">{formatSAR(r.opening_balance)}</td>
                  <td className="amount">{formatSAR(r.cashier_replenishment)}</td>
                  <td className="amount">{formatSAR(Number(r.cash_purchases) + Number(r.card_purchases))}</td>
                  <td className="amount" style={{ fontWeight: 700 }}>{formatSAR(r.closing_balance)}</td>
                  <td className="amount" style={{ color: Math.abs(Number(r.variance)) < 0.01 ? 'var(--color-success)' : 'var(--color-danger)' }}>{formatSAR(r.variance)}</td>
                  <td>{r.is_balanced ? <CheckCircle size={15} color="var(--color-success)"/> : <XCircle size={15} color="var(--color-danger)"/>}</td>
                  <td>
                    {user?.role === 'admin' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-primary)' }} onClick={() => { setEditingRecord(r); reset({ transaction_date: r.transaction_date, opening_balance: Number(r.opening_balance), cashier_replenishment: Number(r.cashier_replenishment), cash_purchases: Number(r.cash_purchases), card_purchases: Number(r.card_purchases), closing_balance: Number(r.closing_balance), notes: r.notes || '' }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Edit2 size={14}/></button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteId(r.id)} title={t('purchases.delete.aria') || 'حذف'}><Trash2 size={14}/></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!records?.length && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('pettyCash.table.empty')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title={t('purchases.delete.title') || 'تأكيد الحذف'}
        message={t('purchases.delete.message') || 'هل أنت متأكد من الحذف؟'}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </PageTransition>
  )
}
