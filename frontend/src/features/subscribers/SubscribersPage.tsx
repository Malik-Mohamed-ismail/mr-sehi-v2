import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Plus, RefreshCw, AlertTriangle, Users, Download, Trash2, X, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { SearchInput } from '../../components/ui/SearchInput'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatSAR, formatDate } from '../../lib/utils'
import { exportToExcel } from '../../lib/export'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'
import { useAuthStore } from '../../store/authStore'

import { CustomSelect } from '../../components/ui/CustomSelect'
const schema = z.object({
  name:           z.string().min(1, i18n.t('subscribers.validation.nameRequired')),
  phone:          z.string().optional(),
  plan_name:      z.string().optional(),
  plan_amount:    z.coerce.number().positive(i18n.t('subscribers.validation.amountRequired')),
  start_date:     z.string().min(1, i18n.t('subscribers.validation.startDateRequired')),
  end_date:       z.string().min(1, i18n.t('subscribers.validation.endDateRequired')),
  payment_method: z.string().min(1, i18n.t('validation.required') || 'مطلوب'),
  notes:          z.string().optional(),
})
type FormData = z.infer<typeof schema>

const STATUS_STYLES: Record<string, { label: string; badge: string }> = {
  active:    { label: i18n.t('subscribers.status.active'),    badge: 'badge-success' },
  expired:   { label: i18n.t('subscribers.status.expired'),   badge: 'badge-danger' },
  cancelled: { label: i18n.t('subscribers.status.cancelled'), badge: 'badge-neutral' },
}

export default function SubscribersPage() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [showForm, setShowForm]               = useState(false)
  const [editingSubscriber, setEditingSubscriber] = useState<any>(null)
  const [search, setSearch]                   = useState('')
  const [filter, setFilter]                   = useState<string>('all')
  const [deleteId, setDeleteId]               = useState<string | null>(null)

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['subscribers'],
    queryFn:  () => api.get('/subscribers').then(r => r.data.data),
  })

  const { data: expiring } = useQuery({
    queryKey: ['subscribers-expiring'],
    queryFn:  () => api.get('/subscribers/expiring?days=7').then(r => r.data.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['subscribers-stats'],
    queryFn:  () => api.get('/subscribers/stats').then(r => r.data.data),
  })

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['lookups', 'payment_method'],
    queryFn: () => api.get('/lookups?type=payment_method').then(r => r.data.data),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { payment_method: 'بنك' },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/subscribers', data),
    onSuccess: () => {
      toast.success(t('subscribers.messages.createSuccess'))
      qc.invalidateQueries({ queryKey: ['subscribers'] })
      reset(); setShowForm(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('subscribers.messages.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/subscribers/${id}`, data),
    onSuccess: () => {
      toast.success(t('common.updateSuccess'))
      qc.invalidateQueries({ queryKey: ['subscribers'] })
      qc.invalidateQueries({ queryKey: ['subscribers-stats'] })
      reset(); setShowForm(false); setEditingSubscriber(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('subscribers.messages.error')),
  })

  const renewMutation = useMutation({
    mutationFn: (id: string) => api.post(`/subscribers/${id}/renew`),
    onSuccess: () => {
      toast.success(t('subscribers.messages.renewSuccess'))
      qc.invalidateQueries({ queryKey: ['subscribers'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('subscribers.messages.error')),
  })

  const deleteMutation = useMutation({
    onMutate: async (deletedId) => {
      qc.setQueriesData({ type: 'active' }, (old: any) => {
        if (Array.isArray(old)) return old.filter((item: any) => item?.id !== deletedId)
        if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.filter((item: any) => item?.id !== deletedId) }
        return old
      })
    },
    mutationFn: (id: string) => api.delete(`/subscribers/${id}`),
    onSuccess: () => {
      toast.success(t('purchases.messages.deleteSuccess') || 'تم الحذف')
      qc.invalidateQueries({ queryKey: ['subscribers'] })
      setDeleteId(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('subscribers.messages.error')),
  })

  const filtered = (subscribers ?? []).filter((s: any) =>
    filter === 'all' ? true : s.status === filter
  )

  const handleExport = () => {
    const exportData = (filtered ?? []).map((s: any) => ({
      [i18n.t('subscribers.table.subscriber')]: s.name,
      [i18n.t('subscribers.fields.phone')]: s.phone || '-',
      [i18n.t('subscribers.table.plan')]: s.plan_name || '-',
      [i18n.t('subscribers.table.endDate')]: formatDate(s.end_date),
      [i18n.t('subscribers.table.amount')]: Number(s.plan_amount),
      [i18n.t('subscribers.fields.paymentMethod')]: s.payment_method,
      [i18n.t('subscribers.table.status')]: i18n.t(`subscribers.status.${s.status}`),
    }))
    exportToExcel(exportData, i18n.t('subscribers.exportTitle'))
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('subscribers.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{t('subscribers.pageSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleExport} disabled={!filtered?.length}>
            <Download size={16}/> {t('subscribers.table.export')}
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            <Plus size={16}/> {t('subscribers.newSubscriber')}
          </button>
        </div>
      </div>

      {/* Expiring alert */}
      {expiring?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="alert alert-warning" style={{ marginBottom: 20, gap: 12 }}>
          <AlertTriangle size={16}/>
          <span>
            <strong>{expiring.length} {t('subscribers.alerts.expiringSubscribers')}</strong> {t('subscribers.alerts.expiringSoon')}
          </span>
        </motion.div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card kpi-card-success" style={{ padding: '16px 20px' }}>
          <div className="kpi-label">{t('subscribers.kpi.active')}</div>
          <div className="kpi-value" style={{ color: 'var(--color-success)', fontSize: 28 }}>{stats?.active ?? 0}</div>
        </div>
        <div className="card kpi-card-danger" style={{ padding: '16px 20px' }}>
          <div className="kpi-label">{t('subscribers.kpi.expired')}</div>
          <div className="kpi-value" style={{ color: 'var(--color-danger)', fontSize: 28 }}>{stats?.expired ?? 0}</div>
        </div>
        <div className="card kpi-card-primary" style={{ padding: '16px 20px' }}>
          <div className="kpi-label">{t('subscribers.kpi.mrr')}</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>{formatSAR(stats?.active_mrr ?? 0)}</div>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 24 }}>
          <div className="form-card-header">
            <span className="form-card-header-title">{editingSubscriber ? <Edit2 size={16}/> : '➕'} {editingSubscriber ? t('common.edit') : t('subscribers.newSubscriber')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false); setEditingSubscriber(null) }} title="إغلاق"><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit((d) => editingSubscriber ? updateMutation.mutate({ id: editingSubscriber.id, data: d }) : createMutation.mutate(d))} dir={i18n.dir()}>
            <div className="form-section-header">
              <div className="form-section-number">١</div>
              <div className="form-section-title">{t('subscribers.section1')}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value">
                <label>{t('subscribers.fields.name')}</label>
                <input {...register('name')} className={`form-input ${errors.name ? 'is-error' : ''}`}/>
              </div>
              <div className="form-field has-value">
                <label>{t('subscribers.fields.phone')}</label>
                <input {...register('phone')} className="form-input" dir="ltr"/>
              </div>
              <div className="form-field has-value">
                <label>{t('subscribers.fields.planName')}</label>
                <input {...register('plan_name')} className="form-input"/>
              </div>
              <div className="form-field has-value">
                <label>{t('subscribers.fields.planAmount')}</label>
                <input {...register('plan_amount')} type="number" step="0.01" className={`form-input ${errors.plan_amount ? 'is-error' : ''}`}/>
              </div>
              <div className="form-field has-value">
                <label>{t('subscribers.fields.startDate')}</label>
                <input {...register('start_date')} type="date" className={`form-input ${errors.start_date ? 'is-error' : ''}`}/>
              </div>
              <div className="form-field has-value">
                <label>{t('subscribers.fields.endDate')}</label>
                <input {...register('end_date')} type="date" className={`form-input ${errors.end_date ? 'is-error' : ''}`}/>
              </div>
              <div className="form-field has-value">
                <label>{t('subscribers.fields.paymentMethod')}</label>
                <CustomSelect {...register('payment_method')} >
                  <option value="">طريقة الدفع...</option>
                  {paymentMethods.map((pm: any) => (
                    <option key={pm.id} value={pm.name_ar}>{i18n.language === 'ar' ? pm.name_ar : pm.name_en}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="form-field has-value">
                <label>{t('subscribers.fields.notes')}</label>
                <input {...register('notes')} className="form-input"/>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { reset(); setShowForm(false); setEditingSubscriber(null) }}>{t('subscribers.buttons.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || updateMutation.isPending}>
                {(isSubmitting || updateMutation.isPending) ? t('subscribers.buttons.saving') : t('subscribers.buttons.save')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'all', label: i18n.t('subscribers.tabs.all') },
          { key: 'active', label: i18n.t('subscribers.status.active') },
          { key: 'expired', label: i18n.t('subscribers.status.expired') },
          { key: 'cancelled', label: i18n.t('subscribers.status.cancelled') },
        ].map(tab => (
          <button
            key={tab.key}
            className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.search') || 'بحث...'} />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('subscribers.table.subscriber')}</th>
                <th>{t('subscribers.table.phone')}</th>
                <th>{t('subscribers.table.plan')}</th>
                <th>{t('subscribers.table.endDate')}</th>
                <th>{t('subscribers.table.amount')}</th>
                <th>{t('subscribers.table.status')}</th>
                <th>{t('subscribers.table.action')}</th>
              </tr>
            </thead>
            <tbody>
              {(filtered ?? []).filter((i: any) => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase())).map((s: any) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td className="amount">{s.phone ?? '—'}</td>
                  <td>{s.plan_name ?? '—'}</td>
                  <td className="amount">{formatDate(s.end_date)}</td>
                  <td className="amount">{formatSAR(s.plan_amount)}</td>
                  <td>
                    <span className={`badge ${STATUS_STYLES[s.status]?.badge ?? 'badge-neutral'}`}>
                      {t(`subscribers.status.${s.status}`) ?? s.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {s.status !== 'cancelled' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-primary)', gap: 4 }}
                          onClick={() => renewMutation.mutate(s.id)}
                          disabled={renewMutation.isPending}
                          title={t('subscribers.buttons.renewTitle')}
                        >
                          <RefreshCw size={13}/> {t('subscribers.buttons.renew')}
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-primary)' }}
                            onClick={() => { setEditingSubscriber(s); reset({ name: s.name, phone: s.phone || '', plan_name: s.plan_name || '', plan_amount: Number(s.plan_amount), start_date: s.start_date, end_date: s.end_date, payment_method: s.payment_method, notes: s.notes || '' }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                          >
                            <Edit2 size={14}/>
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => setDeleteId(s.id)}
                            title={t('purchases.delete.aria') || 'حذف'}
                          >
                            <Trash2 size={14}/>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered?.length && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('subscribers.table.empty')}</td></tr>
              )}
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
