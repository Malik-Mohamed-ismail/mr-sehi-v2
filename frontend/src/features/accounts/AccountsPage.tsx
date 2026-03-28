import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Download, X } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { exportToExcel } from '../../lib/export'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'
import { PageTransition } from '../../components/ui/PageTransition'
import { SearchInput } from '../../components/ui/SearchInput'
import { staggerContainer, staggerItem } from '../../lib/animations'

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
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

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
      [i18n.t('accounts.fields.accountType')]: TYPE_LABELS[a.type]?.label ?? a.type,
      [i18n.t('accounts.table.level')]: a.level,
      [i18n.t('accounts.fields.parentCode')]: a.parent_code || '-',
      [i18n.t('accounts.table.isSystem')]: a.is_system ? i18n.t('accounts.table.yes') : i18n.t('accounts.table.no'),
    }))
    exportToExcel(exportData, i18n.t('accounts.exportTitle'))
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('accounts.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>Chart of Accounts — {accounts?.length ?? 0} حساب</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleExport} disabled={!accounts?.length}>
            <Download size={16}/> تصدير Excel
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            <Plus size={16}/> {t('accounts.newAccount')}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 24 }} dir={i18n.dir()}>
          <div className="form-card-header">
            <span className="form-card-header-title">➕ {t('accounts.newAccount')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false) }} title="إغلاق"><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))}>
            <div className="form-section-header">
              <div className="form-section-number">١</div>
              <div className="form-section-title">{t('accounts.section1')}</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 16, marginBottom: 20 }}>
              <div className="form-field has-value">
                <label>الكود</label>
                <input {...register('code', { required: true })} className="form-input"/>
              </div>
              <div className="form-field has-value">
                <label>الاسم (عربي)</label>
                <input {...register('name_ar', { required: true })} className="form-input"/>
              </div>
              <div className="form-field has-value">
                <label>الاسم (إنجليزي)</label>
                <input {...register('name_en')} className="form-input"/>
              </div>
              <div className="form-field has-value">
                <label>نوع الحساب</label>
                <CustomSelect {...register('type')} >
                  <option value="asset">{t('accounts.types.asset')}</option>
                  <option value="liability">{t('accounts.types.liability')}</option>
                  <option value="equity">{t('accounts.types.equity')}</option>
                  <option value="revenue">{t('accounts.types.revenue')}</option>
                  <option value="expense">{t('accounts.types.expense')}</option>
                </CustomSelect>
              </div>
              <div className="form-field has-value">
                <label>كود الحساب الرئيسي</label>
                <input {...register('parent_code')} className="form-input" placeholder={t("accounts.fields.parentCodePlaceholder")}/>
              </div>
              <div className="form-field has-value">
                <label>المستوى</label>
                <input {...register('level')} type="number" min="1" max="5" className="form-input"/>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { reset(); setShowForm(false) }}>{t('accounts.buttons.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? t('accounts.buttons.saving') : t('accounts.buttons.save')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.search') || 'بحث...'} />
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
                <span className={`badge ${meta.badge}`} style={{ marginLeft: 'auto' /* Wait, rtl is default, so if they used marginRight to push left... we can keep it as is or handle it based on dir */ }}>{items.length} {t('accounts.accountCount')}</span>
              </div>
              <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
                <thead><tr><th>{t('accounts.table.code')}</th><th>{t('accounts.table.nameAr')}</th><th>{t('accounts.table.nameEn')}</th><th>{t('accounts.table.level')}</th><th>{t('accounts.table.isSystem')}</th></tr></thead>
                <tbody>
                  {items.filter((i: any) => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase())).map((a: any) => (
                    <tr key={a.code}
                      style={{ paddingRight: a.level > 1 ? (a.level - 1) * 16 : 0 }}>
                      <td style={{ fontFamily: 'var(--font-latin)', fontWeight: 600, color: 'var(--color-primary)' }}>{a.code}</td>
                      <td style={{ paddingRight: a.level > 1 ? (a.level - 1) * 16 + 16 : 16 }}>{a.name_ar}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-latin)' }}>{a.name_en ?? '—'}</td>
                      <td className="amount">{a.level}</td>
                      <td>{a.is_system ? <span className="badge badge-warning">{t('accounts.table.isSystem')}</span> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
            </div>
          )
        })
      )}
    </PageTransition>
  )
}
