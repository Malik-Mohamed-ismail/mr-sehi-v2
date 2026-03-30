import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Download, X, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { exportToExcel } from '../../lib/export'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'
import { PageTransition } from '../../components/ui/PageTransition'
import { SearchInput } from '../../components/ui/SearchInput'
import { staggerContainer, staggerItem } from '../../lib/animations'
import { useAuthStore } from '../../store/authStore'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

import { CustomSelect } from '../../components/ui/CustomSelect'
const TYPE_LABELS: Record<string, { label: string; badge: string }> = {
  asset:     { label: i18n.t('accounts.types.asset'),     badge: 'badge-info' },
  liability: { label: i18n.t('accounts.types.liability'), badge: 'badge-danger' },
  equity:    { label: i18n.t('accounts.types.equity'), badge: 'badge-warning' },
  revenue:   { label: i18n.t('accounts.types.revenue'),  badge: 'badge-success' },
  expense:   { label: i18n.t('accounts.types.expense'),  badge: 'badge-neutral' },
}

export default function AccountsPage() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [deleteCode, setDeleteCode] = useState<string | null>(null)

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get('/accounts').then(r => r.data.data),
  })

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      code: '',
      name_ar: '',
      name_en: '',
      type: 'revenue',
      parent_code: '',
      level: 1,
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/accounts', { ...data, level: Number(data.level) }),
    onSuccess: () => {
      toast.success(t('accounts.messages.createSuccess'))
      qc.invalidateQueries({ queryKey: ['accounts'] })
      reset()
      setShowForm(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('accounts.messages.error'))
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/accounts/${editingCode}`, { ...data, level: Number(data.level) }),
    onSuccess: () => {
      toast.success(t('accounts.messages.updateSuccess', 'تم تحديث الحساب بنجاح'))
      qc.invalidateQueries({ queryKey: ['accounts'] })
      reset()
      setShowForm(false)
      setEditingCode(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('accounts.messages.error'))
  })

  const deleteMutation = useMutation({
    mutationFn: (code: string) => api.delete(`/accounts/${code}`),
    onSuccess: () => {
      toast.success(t('accounts.messages.deleteSuccess', 'تم حذف الحساب بنجاح'))
      qc.invalidateQueries({ queryKey: ['accounts'] })
      setDeleteCode(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('accounts.messages.error'))
  })

  const onSubmit = (data: any) => {
    if (editingCode) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const grouped = (accounts ?? []).reduce((acc: any, a: any) => {
    const type = a.type ?? 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(a)
    return acc
  }, {})

  const handleExport = () => {
    const exportData = (accounts ?? []).map((a: any) => ({
      [i18n.t('accounts.table.code')]: a.code,
      [i18n.t('accounts.table.nameAr')]: a.name_ar,
      [i18n.t('accounts.table.nameEn')]: a.name_en || '-',
      [i18n.t('accounts.fields.accountType', 'نوع الحساب')]: TYPE_LABELS[a.type]?.label ?? a.type,
      [i18n.t('accounts.table.level')]: a.level,
      [i18n.t('accounts.fields.parentCode', 'كود الحساب الرئيسي')]: a.parent_code || '-',
      [i18n.t('accounts.table.isSystem')]: a.is_system ? i18n.t('accounts.table.yes') : i18n.t('accounts.table.no'),
    }))
    exportToExcel(exportData, i18n.t('accounts.exportTitle'))
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('accounts.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{t('accounts.pageTitle')} — {accounts?.length ?? 0} {t('accounts.accountCount')}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleExport} disabled={!accounts?.length}>
            <Download size={16}/> {t('accounts.table.export', 'تصدير Excel')}
          </button>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => {
              reset({
                code: '', name_ar: '', name_en: '', type: 'revenue', parent_code: '', level: 1
              })
              setEditingCode(null)
              setShowForm(s => !s)
            }}>
              <Plus size={16}/> {t('accounts.newAccount')}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 24 }} dir={i18n.dir()}>
          <div className="form-card-header">
            <span className="form-card-header-title">{editingCode ? '✏️ ' + t('accounts.editAccount', 'تعديل الحساب') : '➕ ' + t('accounts.newAccount')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false); setEditingCode(null); }} title={t('common.close', 'إغلاق')}><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-section-header">
              <div className="form-section-number">١</div>
              <div className="form-section-title">{t('accounts.section1')}</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 16, marginBottom: 20 }}>
              <div className="form-field has-value">
                <label>{t('accounts.fields.code')}</label>
                <input {...register('code', { required: true })} className="form-input" disabled={!!editingCode}/>
              </div>
              <div className="form-field has-value">
                <label>{t('accounts.fields.nameAr')}</label>
                <input {...register('name_ar', { required: true })} className="form-input"/>
              </div>
              <div className="form-field has-value">
                <label>{t('accounts.fields.nameEn')}</label>
                <input {...register('name_en')} className="form-input"/>
              </div>
              <div className="form-field has-value">
                <label>{t('accounts.fields.accountType', 'نوع الحساب')}</label>
                <CustomSelect {...register('type')} >
                  <option value="asset">{t('accounts.types.asset')}</option>
                  <option value="liability">{t('accounts.types.liability')}</option>
                  <option value="equity">{t('accounts.types.equity')}</option>
                  <option value="revenue">{t('accounts.types.revenue')}</option>
                  <option value="expense">{t('accounts.types.expense')}</option>
                </CustomSelect>
              </div>
              <div className="form-field has-value">
                <label>{t('accounts.fields.parentCode', 'كود الحساب الرئيسي')}</label>
                <input {...register('parent_code')} className="form-input" placeholder={t("accounts.fields.parentCodePlaceholder")}/>
              </div>
              <div className="form-field has-value">
                <label>{t('accounts.fields.level', 'المستوى')}</label>
                <input {...register('level')} type="number" min="1" max="5" className="form-input"/>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { reset(); setShowForm(false); setEditingCode(null); }}>{t('accounts.buttons.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || updateMutation.isPending || createMutation.isPending}>
                {(isSubmitting || updateMutation.isPending || createMutation.isPending) ? t('accounts.buttons.saving') : t('accounts.buttons.save')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />
      </div>

      {isLoading ? (
        <div>{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }}/>)}</div>
      ) : (
        Object.entries(TYPE_LABELS).map(([type, meta]) => {
          const items = grouped[type] ?? []
          if (!items.length) return null
          return (
            <div key={type} className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '12px 20px', borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--bg-surface-2)',
              }}>
                <BookOpen size={15} color="var(--color-primary)"/>
                <span style={{ fontWeight: 700 }}>{meta.label}</span>
                <span className={`badge ${meta.badge}`} style={{ marginLeft: i18n.dir() === 'ltr' ? 'auto' : 0, marginRight: i18n.dir() === 'rtl' ? 'auto' : 0 }}>{items.length} {t('accounts.accountCount')}</span>
              </div>
              <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('accounts.table.code')}</th>
                      <th>{t('accounts.table.nameAr')}</th>
                      <th>{t('accounts.table.nameEn')}</th>
                      <th>{t('accounts.table.level')}</th>
                      <th>{t('accounts.table.isSystem')}</th>
                      {user?.role === 'admin' && <th>{t('common.actions', 'إجراءات')}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter((i: any) => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase())).map((a: any) => (
                      <tr key={a.code} style={{ paddingRight: a.level > 1 ? (a.level - 1) * 16 : 0 }}>
                        <td style={{ fontFamily: 'var(--font-latin)', fontWeight: 600, color: 'var(--color-primary)' }}>{a.code}</td>
                        <td style={{ paddingRight: a.level > 1 ? (a.level - 1) * 16 + 16 : 16 }}>{a.name_ar}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-latin)' }}>{a.name_en ?? '—'}</td>
                        <td className="amount">{a.level}</td>
                        <td>{a.is_system ? <span className="badge badge-warning">{t('accounts.table.isSystem')}</span> : '—'}</td>
                        {user?.role === 'admin' && (
                          <td>
                            {!a.is_system && (
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => {
                                  reset(a)
                                  setEditingCode(a.code)
                                  setShowForm(true)
                                }}><Edit2 size={14} /></button>
                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteCode(a.code)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })
      )}

      <ConfirmDialog
        open={deleteCode !== null}
        title={t('accounts.dialogs.deleteTitle', 'حذف الحساب')}
        message={t('accounts.dialogs.deleteMessage', 'هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.')}
        onConfirm={() => deleteCode && deleteMutation.mutate(deleteCode)}
        onCancel={() => setDeleteCode(null)}
        loading={deleteMutation.isPending}
      />
    </PageTransition>
  )
}
