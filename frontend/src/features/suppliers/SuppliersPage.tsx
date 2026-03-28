import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, CheckCircle, XCircle, Download, Trash2, FileText, X, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { SearchInput } from '../../components/ui/SearchInput'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { exportToExcel } from '../../lib/export'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'
import { useAuthStore } from '../../store/authStore'

import { CustomSelect } from '../../components/ui/CustomSelect'
const schema = z.object({
  name_ar:    z.string().min(1, i18n.t('suppliers.validation.nameArRequired')),
  name_en:    z.string().optional(),
  has_vat:    z.boolean().default(false),
  vat_number: z.string().optional().nullable(),
  phone:      z.string().optional(),
  email:      z.string().email().optional().or(z.literal('')),
  category:   z.string().optional(),
  notes:      z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function SuppliersPage() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [search, setSearch]             = useState('')
  const [showForm, setShowForm]         = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [deleteId, setDeleteId]         = useState<string | null>(null)

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn:  () => api.get('/suppliers').then(r => r.data.data),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['lookups', 'category'],
    queryFn: () => api.get('/lookups?type=category').then(r => r.data.data),
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { has_vat: false }
  })

  const hasVat = watch('has_vat')

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/suppliers', data),
    onSuccess: () => {
      toast.success(t('suppliers.messages.createSuccess'))
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      reset(); setShowForm(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('suppliers.messages.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/suppliers/${id}`, data),
    onSuccess: () => {
      toast.success(t('common.updateSuccess'))
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      reset(); setShowForm(false); setEditingSupplier(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('suppliers.messages.error')),
  })

  const deleteMutation = useMutation({
    onMutate: async (deletedId) => {
      qc.setQueriesData({ type: 'active' }, (old: any) => {
        if (Array.isArray(old)) return old.filter((item: any) => item?.id !== deletedId)
        if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.filter((item: any) => item?.id !== deletedId) }
        return old
      })
    },
    mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
    onSuccess: () => {
      toast.success(t('purchases.messages.deleteSuccess') || 'تم الحذف')
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      setDeleteId(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('suppliers.messages.error')),
  })

  const handleExport = () => {
    const exportData = (suppliers ?? []).map((s: any) => ({
      [i18n.t('suppliers.fields.nameAr')]: s.name_ar,
      [i18n.t('suppliers.fields.nameEn')]: s.name_en || '-',
      [i18n.t('suppliers.fields.category')]: s.category || '-',
      [i18n.t('suppliers.table.vatNumber')]: s.vat_number || i18n.t('suppliers.table.exempt'),
      [i18n.t('suppliers.table.phone')]: s.phone || '-',
      [i18n.t('suppliers.fields.email')]: s.email || '-',
      [i18n.t('suppliers.table.status')]: s.is_active ? i18n.t('suppliers.table.active') : i18n.t('suppliers.table.inactive'),
    }))
    exportToExcel(exportData, i18n.t('suppliers.exportTitle'))
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('suppliers.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{t('suppliers.pageSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleExport} disabled={!suppliers?.length}>
            <Download size={16}/> {t('suppliers.table.export')}
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            <Plus size={16}/> {t('suppliers.newSupplier')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {(() => {
        const total  = (suppliers ?? []).length
        const active = (suppliers ?? []).filter((s: any) => s.is_active).length
        const vatReg = (suppliers ?? []).filter((s: any) => s.vat_number).length
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            <div className="card kpi-card-primary" style={{ padding: '16px 20px' }}>
              <div className="kpi-label">إجمالي الموردين</div>
              <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-primary)' }}>{total}</div>
            </div>
            <div className="card kpi-card-success" style={{ padding: '16px 20px' }}>
              <div className="kpi-label">نشطون</div>
              <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-success)' }}>{active}</div>
            </div>
            <div className="card kpi-card-info" style={{ padding: '16px 20px' }}>
              <div className="kpi-label">مسجلو ضريبة القيمة المضافة</div>
              <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-info)' }}>{vatReg}</div>
            </div>
          </div>
        )
      })()}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 24 }}>
          <div className="form-card-header">
            <span className="form-card-header-title">{editingSupplier ? <Edit2 size={16}/> : '➕'} {editingSupplier ? t('common.edit') : t('suppliers.newSupplier')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false); setEditingSupplier(null) }} title="إغلاق"><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit((d) => {
            const payload = { ...d, vat_number: d.has_vat ? d.vat_number : null }
            editingSupplier ? updateMutation.mutate({ id: editingSupplier.id, data: payload }) : createMutation.mutate(payload)
          })} dir={i18n.dir()}>
            <div className="form-section-header">
              <div className="form-section-number">١</div>
              <div className="form-section-title">{t('suppliers.section1')}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="form-field has-value">
                <label>{t('suppliers.fields.nameAr')}</label>
                <input {...register('name_ar')} className={`form-input ${errors.name_ar ? 'is-error' : ''}`}/>
              </div>
              <div className="form-field has-value">
                <label>{t('suppliers.fields.nameEn')}</label>
                <input {...register('name_en')} className="form-input" dir="ltr"/>
              </div>
              <div style={{ gridColumn: '1 / -1', padding: '8px 0 4px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', pointerEvents: 'auto' }}>
                  <input 
                    type="checkbox" 
                    checked={hasVat || false}
                    onChange={(e) => {
                      setValue('has_vat', e.target.checked, { shouldValidate: true, shouldDirty: true })
                      if (!e.target.checked) setValue('vat_number', '')
                    }}
                    style={{ width: 16, height: 16, cursor: 'pointer', pointerEvents: 'auto' }} 
                  />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {t('suppliers.fields.hasVat', 'المورد مسجل في ضريبة القيمة المضافة؟')}
                  </span>
                </label>
              </div>

              {hasVat && (
                <div className="form-field has-value">
                  <label>{t('suppliers.fields.vatNumber')}</label>
                  <input {...register('vat_number')} className="form-input" dir="ltr" placeholder="310xxxxxxxxxx"/>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{t('suppliers.fields.vatHelper')}</p>
                </div>
              )}
              <div className="form-field has-value">
                <label>{t('suppliers.fields.category')}</label>
                <CustomSelect {...register('category')} >
                  <option value="">{t('suppliers.fields.selectCategory')}</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.name_ar}>{i18n.language === 'ar' ? c.name_ar : c.name_en}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="form-field has-value">
                <label>{t('suppliers.fields.phone')}</label>
                <input {...register('phone')} className="form-input" dir="ltr"/>
              </div>
              <div className="form-field has-value">
                <label>{t('suppliers.fields.email')}</label>
                <input {...register('email')} className="form-input" dir="ltr"/>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { reset(); setShowForm(false); setEditingSupplier(null) }}>{t('suppliers.buttons.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || updateMutation.isPending}>
                {(isSubmitting || updateMutation.isPending) ? t('suppliers.buttons.saving') : t('suppliers.buttons.save')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.search') || 'بحث...'} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 24 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }}/>)}</div>
        ) : (
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('suppliers.table.name')}</th>
                  <th>{t('suppliers.table.category')}</th>
                  <th>{t('suppliers.table.vatNumber')}</th>
                  <th>{t('suppliers.table.phone')}</th>
                  <th>{t('suppliers.table.vatStatus')}</th>
                  <th>{t('suppliers.table.status')}</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {(suppliers ?? []).filter((i: any) => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase())).map((s: any) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name_ar}</td>
                    <td>{s.category ? <span className="badge badge-info">{s.category}</span> : '—'}</td>
                    <td className="amount" style={{ fontSize: 12 }}>{s.vat_number ?? '—'}</td>
                    <td className="amount">{s.phone ?? '—'}</td>
                    <td>
                      {s.vat_number
                        ? <span style={{ display:'flex', alignItems:'center', gap:4, color:'var(--color-success)' }}><CheckCircle size={13}/> {t('suppliers.table.registered')}</span>
                        : <span style={{ display:'flex', alignItems:'center', gap:4, color:'var(--color-warning)' }}><XCircle size={13}/> {t('suppliers.table.exempt')}</span>}
                    </td>
                    <td>
                      <span className={`badge ${s.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        {s.is_active ? t('suppliers.table.active') : t('suppliers.table.inactive')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link to={`/suppliers/${s.id}/ledger`} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-primary)' }} title="كشف الحساب">
                          <FileText size={14}/>
                        </Link>
                        {user?.role === 'admin' && (
                          <>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--color-primary)' }}
                              onClick={() => { setEditingSupplier(s); reset({ name_ar: s.name_ar, name_en: s.name_en || '', has_vat: !!s.vat_number, vat_number: s.vat_number || '', phone: s.phone || '', email: s.email || '', category: s.category || '', notes: s.notes || '' }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
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
                {!suppliers?.length && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('suppliers.table.empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
