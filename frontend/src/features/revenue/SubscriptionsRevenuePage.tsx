import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Plus, Download, X, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { formatSAR, formatDate } from '../../lib/utils'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'
import { exportToExcel } from '../../lib/export'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useAuthStore } from '../../store/authStore'

import { CustomSelect } from '../../components/ui/CustomSelect'
export default function SubscriptionsRevenuePage() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: revenues } = useQuery({
    queryKey: ['revenue-subscriptions'],
    queryFn: () => api.get('/revenue/subscriptions').then(r => r.data.data),
  })

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['lookups', 'payment_method'],
    queryFn: () => api.get('/lookups?type=payment_method').then(r => r.data.data),
  })

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { revenue_date: '', amount: '', payment_method: 'بنك', notes: '' },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/revenue/subscriptions', data),
    onSuccess: () => {
      toast.success(t('subscriptions.messages.createSuccess') || 'تم الإضافة')
      qc.invalidateQueries({ queryKey: ['revenue-subscriptions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      reset(); setShowForm(false); setEditingItem(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('revenue.messages.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/revenue/subscriptions/${id}`, data),
    onSuccess: () => {
      toast.success(t('common.updateSuccess'))
      qc.invalidateQueries({ queryKey: ['revenue-subscriptions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      reset(); setShowForm(false); setEditingItem(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('revenue.messages.error')),
  })

  const deleteMutation = useMutation({
    onMutate: async (deletedId) => {
      qc.setQueriesData({ type: 'active' }, (old: any) => {
        if (Array.isArray(old)) return old.filter((item: any) => item?.id !== deletedId)
        if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.filter((item: any) => item?.id !== deletedId) }
        return old
      })
    },
    mutationFn: (id: string) => api.delete(`/revenue/subscriptions/${id}`),
    onSuccess: () => {
      toast.success(t('purchases.messages.deleteSuccess') || 'تم الحذف')
      qc.invalidateQueries({ queryKey: ['revenue-subscriptions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      setDeleteId(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('subscriptions.messages.error')),
  })

  const total = (revenues ?? []).reduce((s: number, r: any) => s + Number(r.amount), 0)

  const handleExport = () => {
    const exportData = (revenues ?? []).map((r: any) => ({
      [i18n.t('subscriptions.table.date')]: formatDate(r.revenue_date),
      [i18n.t('subscriptions.table.amount')]: r.amount,
      [i18n.t('subscriptions.fields.paymentMethod')]: r.payment_method,
      [i18n.t('subscriptions.fields.notes')]: r.notes || '-',
    }))
    exportToExcel(exportData, i18n.t('subscriptions.exportTitle'))
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('subscriptions.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t('subscriptions.pageSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleExport} disabled={!revenues?.length}>
            <Download size={16}/> تصدير Excel
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}><Plus size={16}/> {t('subscriptions.newRevenue')}</button>
        </div>
      </div>

      <div className="card kpi-card-primary" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div className="kpi-label">{t('subscriptions.kpi.totalRevenue')}</div>
        <div className="kpi-value" style={{ color: 'var(--color-success)', fontSize: 28 }}>{formatSAR(total)}</div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 24 }}>
          <div className="form-card-header">
            <span className="form-card-header-title">{editingItem ? <Edit2 size={16}/> : '➕'} {editingItem ? t('common.edit') : t('subscriptions.newRevenue')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false); setEditingItem(null) }} title="إغلاق"><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit((d) => {
            const payload = { ...d, amount: d.amount === '' ? 0 : Number(d.amount) }
            if (editingItem) updateMutation.mutate({ id: editingItem.id, data: payload })
            else createMutation.mutate(payload)
          })} dir={i18n.dir()}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="form-field has-value"><label>{t('subscriptions.table.date')}</label><input {...register('revenue_date')} type="date" className="form-input"/></div>
              <div className="form-field has-value"><label>{t('subscriptions.fields.amount')}</label><input {...register('amount')} type="number" step="0.01" className="form-input"/></div>
              <div className="form-field has-value">
                <label>{t('subscriptions.fields.paymentMethod')}</label>
                <CustomSelect {...register('payment_method')} >
                  <option value="">طريقة الدفع...</option>
                  {paymentMethods.map((pm: any) => (
                    <option key={pm.id} value={pm.name_ar}>{i18n.language === 'ar' ? pm.name_ar : pm.name_en}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="form-field has-value" style={{ gridColumn: '1 / -1' }}><label>{t('subscriptions.fields.notes')}</label><input {...register('notes')} className="form-input"/></div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { reset(); setShowForm(false); setEditingItem(null) }}>{t('subscriptions.buttons.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || updateMutation.isPending}>{(isSubmitting || updateMutation.isPending) ? t('subscriptions.buttons.saving') : t('subscriptions.buttons.save')}</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
          <table className="data-table">
            <thead><tr><th>{t('subscriptions.table.date')}</th><th>{t('subscriptions.table.amount')}</th><th>{t('subscriptions.fields.paymentMethod')}</th><th>{t('subscriptions.fields.notes')}</th><th style={{ width: 80 }}></th></tr></thead>
            <tbody>
              {(revenues ?? []).map((r: any) => (
                <tr key={r.id}>
                  <td className="amount">{formatDate(r.revenue_date)}</td>
                  <td className="amount" style={{ fontWeight: 700, color: 'var(--color-success)' }}>{formatSAR(r.amount)}</td>
                  <td><span className="badge badge-neutral">{r.payment_method}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.notes ?? '—'}</td>
                  <td>
                    {user?.role === 'admin' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-primary)' }} onClick={() => { setEditingItem(r); reset({ revenue_date: r.revenue_date, amount: r.amount, payment_method: r.payment_method, notes: r.notes || '' }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Edit2 size={14}/></button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteId(r.id)} title={t('purchases.delete.aria') || 'حذف'}><Trash2 size={14}/></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!revenues?.length && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('subscriptions.table.empty')}</td></tr>}
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
