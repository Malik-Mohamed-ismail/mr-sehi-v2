import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Plus, Download, Trash2, X, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { staggerContainer, staggerItem } from '../../lib/animations'
import { formatSAR, formatDate } from '../../lib/utils'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'
import { exportToExcel } from '../../lib/export'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useAuthStore } from '../../store/authStore'

import { CustomSelect } from '../../components/ui/CustomSelect'
const schema = z.object({
  revenue_date:     z.string().min(1, i18n.t('delivery.validation.dateRequired')),
  platform:         z.string().min(1, i18n.t('validation.required') || 'مطلوب'),
  gross_amount:     z.coerce.number().positive(i18n.t('delivery.validation.grossPositive')),
  commission_rate:  z.coerce.number().min(0).max(1).default(0),
  payment_method:   z.string().min(1, i18n.t('validation.required') || 'مطلوب'),
  notes:            z.string().optional(),
})
type FormData = z.infer<typeof schema>

const PLATFORM_COLORS: Record<string, string> = {
  Keeta: '#2B9225', HungerStation: '#4A90E2', Ninja: '#1DB87B',
}

export default function DeliveryRevenuePage() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: revenues, isLoading } = useQuery({
    queryKey: ['revenue-delivery'],
    queryFn:  () => api.get('/revenue/delivery').then(r => r.data.data),
  })

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { commission_rate: 0.15 },
  })

  // Dynamic lookups
  const { data: platforms = [] } = useQuery({
    queryKey: ['lookups', 'platform'],
    queryFn: () => api.get('/lookups?type=platform').then(r => r.data.data),
  })
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['lookups', 'payment_method'],
    queryFn: () => api.get('/lookups?type=payment_method').then(r => r.data.data),
  })

  const gross      = watch('gross_amount') ?? 0
  const commRate   = watch('commission_rate') ?? 0
  const commAmount = parseFloat((gross * commRate).toFixed(4))
  const net        = parseFloat((gross - commAmount).toFixed(4))

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/revenue/delivery', data),
    onSuccess: () => {
      toast.success(t('delivery.messages.createSuccess'))
      qc.invalidateQueries({ queryKey: ['revenue-delivery'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      reset(); setShowForm(false); setEditingItem(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('delivery.messages.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/revenue/delivery/${id}`, data),
    onSuccess: () => {
      toast.success(t('common.updateSuccess'))
      qc.invalidateQueries({ queryKey: ['revenue-delivery'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      reset(); setShowForm(false); setEditingItem(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('delivery.messages.error')),
  })

  const deleteMutation = useMutation({
    onMutate: async (deletedId) => {
      qc.setQueriesData({ type: 'active' }, (old: any) => {
        if (Array.isArray(old)) return old.filter((item: any) => item?.id !== deletedId);
        if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.filter((item: any) => item?.id !== deletedId) };
        return old;
      });
    },
    mutationFn: (id: string) => api.delete(`/revenue/delivery/${id}`),
    onSuccess: () => {
      toast.success(t('purchases.messages.deleteSuccess') || 'تم الحذف')
      qc.invalidateQueries({ queryKey: ['revenue-delivery'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      setDeleteId(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('delivery.messages.error')),
  })

  const onSubmit = (data: FormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: { ...data, commission_amount: commAmount } })
    } else {
      createMutation.mutate({ ...data, commission_amount: commAmount })
    }
  }

  const totals = (revenues ?? []).reduce(
    (acc: any, r: any) => ({
      gross: acc.gross + Number(r.gross_amount),
      commission: acc.commission + Number(r.commission_amount),
      net: acc.net + Number(r.net_amount),
    }),
    { gross: 0, commission: 0, net: 0 }
  )

  const handleExport = () => {
    const exportData = (revenues ?? []).map((r: any) => ({
      [i18n.t('delivery.table.date')]: formatDate(r.revenue_date),
      [i18n.t('delivery.table.platform')]: r.platform,
      [i18n.t('delivery.fields.paymentMethod')]: i18n.t(`purchases.paymentMethods.${r.payment_method === 'كاش' ? 'cash' : r.payment_method === 'بنك' ? 'bank' : 'credit'}`),
      [i18n.t('delivery.table.gross')]: r.gross_amount,
      [i18n.t('delivery.table.commission')]: r.commission_amount,
      [i18n.t('delivery.table.net')]: r.net_amount
    }))
    exportToExcel(exportData, i18n.t('delivery.exportTitle'))
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('delivery.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>Keeta · HungerStation · Ninja</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={16}/> {t('delivery.newRevenue')}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {
          [
            { label: t('delivery.kpi.gross'), value: totals.gross, color: 'var(--color-primary)', cls: 'kpi-card-primary' },
            { label: t('delivery.kpi.commissions'), value: totals.commission, color: 'var(--color-danger)', cls: 'kpi-card-danger' },
            { label: t('delivery.kpi.net'), value: totals.net, color: 'var(--color-success)', cls: 'kpi-card-success' },
          ].map(item => (
            <div key={item.label} className={`card ${item.cls}`} style={{ padding: '16px 20px' }}>
              <div className="kpi-label">{item.label}</div>
              <div className="kpi-value" style={{ color: item.color, fontSize: 22 }}>
                {formatSAR(item.value)}
              </div>
            </div>
          ))
        }
      </div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 24 }}>
          <div className="form-card-header">
            <span className="form-card-header-title">{editingItem ? <Edit2 size={16}/> : '➕'} {editingItem ? t('common.edit') : t('delivery.newRevenue')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false); setEditingItem(null); }} title="إغلاق"><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} dir={i18n.dir()}>
            <div className="form-section-header">
              <div className="form-section-number">١</div>
              <div className="form-section-title">{t('delivery.section1')}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value">
                <label>{t('delivery.table.date')}</label>
                <input {...register('revenue_date')} type="date" className={`form-input ${errors.revenue_date ? 'is-error' : ''}`}/>
              </div>
              <div className="form-field has-value">
                <label>{t('delivery.table.platform')}</label>
                <CustomSelect {...register('platform')} className={`errors.platform ? 'is-error' : ''`}>
                  <option value="">اختر منصة التوصيل...</option>
                  {platforms.map((p: any) => (
                    <option key={p.id} value={p.name_en}>{i18n.language === 'ar' ? p.name_ar : p.name_en}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="form-field has-value">
                <label>{t('delivery.fields.paymentMethod')}</label>
                <CustomSelect {...register('payment_method')} className={`errors.payment_method ? 'is-error' : ''`}>
                  <option value="">اختر طريقة الدفع...</option>
                  {paymentMethods.map((pm: any) => (
                    <option key={pm.id} value={pm.name_ar}>{i18n.language === 'ar' ? pm.name_ar : pm.name_en}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="form-field has-value">
                <label>{t('delivery.fields.grossAmount')}</label>
                <input {...register('gross_amount')} type="number" step="0.01" className={`form-input ${errors.gross_amount ? 'is-error' : ''}`}/>
              </div>
              <div className="form-field has-value">
                <label>{t('delivery.fields.commissionRate')}</label>
                <input {...register('commission_rate')} type="number" step="0.01" min="0" max="1" className="form-input"/>
              </div>
              <div className="form-field has-value">
                <label>{t('delivery.fields.notes')}</label>
                <input {...register('notes')} className="form-input"/>
              </div>
            </div>
            {/* Computed */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="form-field has-value">
                <label style={{ color: 'var(--color-danger)' }}>{t('delivery.fields.commissionAmount')}</label>
                <input readOnly value={commAmount.toFixed(2)} className="form-input amount-field" style={{ color: 'var(--color-danger)' }}/>
              </div>
              <div className="form-field has-value">
                <label style={{ color: 'var(--color-success)' }}>{t('delivery.fields.netAmount')}</label>
                <input readOnly value={net.toFixed(2)} className="form-input amount-field" style={{ fontWeight: 700 }}/>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { reset(); setShowForm(false) }}>{t('delivery.buttons.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? t('delivery.buttons.saving') : t('delivery.buttons.save')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>{t('delivery.table.title')}</span>
          <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={!revenues?.length}>
            <Download size={14}/> تصدير Excel
          </button>
        </div>
        {isLoading ? (
          <div style={{ padding: 24 }}>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }}/>)}</div>
        ) : (
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
            <thead>
              <tr>
                <th>{t('delivery.table.date')}</th>
                <th>{t('delivery.table.platform')}</th>
                <th>{t('delivery.fields.paymentMethod')}</th>
                <th>{t('delivery.table.gross')}</th>
                <th>{t('delivery.table.commission')}</th>
                <th>{t('delivery.table.net')}</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
                {(revenues ?? []).filter((i: any) => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase())).map((r: any) => (
                  <motion.tr key={r.id} variants={staggerItem}>
                    <td className="amount">{formatDate(r.revenue_date)}</td>
                    <td style={{ fontWeight: 600 }}>{r.platform}</td>
                    <td><span className="badge badge-neutral">{i18n.language === 'ar' ? paymentMethods.find((p: any) => p.name_ar === r.payment_method)?.name_ar || r.payment_method : paymentMethods.find((p: any) => p.name_ar === r.payment_method)?.name_en || r.payment_method}</span></td>
                    <td className="amount" style={{ color: 'var(--text-primary)' }}>{formatSAR(r.gross_amount)}</td>
                    <td className="amount" style={{ color: 'var(--color-danger)' }}>{formatSAR(r.commission_amount)} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>({(r.commission_rate * 100).toFixed(0)}%)</span></td>
                    <td className="amount" style={{ fontWeight: 700, color: 'var(--color-success)' }}>{formatSAR(r.net_amount)}</td>
                    <td>
                      {user?.role === 'admin' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-primary)' }} onClick={() => { setEditingItem(r); reset({ revenue_date: r.revenue_date, platform: r.platform, gross_amount: r.gross_amount, commission_rate: r.commission_rate, payment_method: r.payment_method, notes: r.notes }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Edit2 size={14}/></button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteId(r.id)}><Trash2 size={14}/></button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              {!revenues?.length && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('delivery.table.empty')}</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title={t("purchases.delete.title") || 'تأكيد الحذف'}
        message={t("purchases.delete.message") || 'هل أنت متأكد من الحذف؟'}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </PageTransition>
  )
}
