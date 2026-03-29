import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { api } from '../../lib/api'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'
import { staggerContainer, staggerItem } from '../../lib/animations'

type LookupType = 'platform' | 'payment_method' | 'category' | 'product_name'

const LOOKUP_TYPES: { value: LookupType, label: string }[] = [
  { value: 'platform', label: 'منصات التوصيل (Platforms)' },
  { value: 'payment_method', label: 'طرق الدفع (Payment Methods)' },
  { value: 'category', label: 'التصنيفات (Categories)' },
  { value: 'product_name', label: 'المنتجات (Products)' },
]

export function LookupsTab() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [activeType, setActiveType] = useState<LookupType>('platform')
  const [showForm, setShowForm] = useState(false)

  const { data: lookups, isLoading } = useQuery({
    queryKey: ['lookups', activeType],
    queryFn: () => api.get(`/lookups?type=${activeType}`).then(r => r.data.data),
  })

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { name_ar: '', name_en: '' }
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/lookups', { ...data, type: activeType }),
    onSuccess: () => {
      toast.success(t('common.success', 'Success'))
      qc.invalidateQueries({ queryKey: ['lookups', activeType] })
      reset()
      setShowForm(false)
    },
    onError: () => toast.error(t('common.error', 'Error occurred'))
  })

  const deleteMutation = useMutation({
    onMutate: async (deletedId) => {
      qc.setQueriesData({ type: 'active' }, (old: any) => {
        if (Array.isArray(old)) return old.filter((item: any) => item?.id !== deletedId);
        if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.filter((item: any) => item?.id !== deletedId) };
        return old;
      });
    },
    mutationFn: (id: string) => api.delete(`/lookups/${id}`),
    onSuccess: () => {
      toast.success(t('common.success', 'Success'))
      qc.invalidateQueries({ queryKey: ['lookups', activeType] })
    },
    onError: () => toast.error(t('common.error', 'Error occurred'))
  })

  return (
    <>
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px', display: 'flex', gap: 12, overflowX: 'auto' }}>
        {LOOKUP_TYPES.map(type => (
          <button
            key={type.value}
            onClick={() => { setActiveType(type.value); setShowForm(false); }}
            className={`btn ${activeType === type.value ? 'btn-primary' : 'btn-secondary'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {type.label}
          </button>
        ))}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 20 }}>
          <div className="form-card-header">
            <span className="form-card-header-title">➕ {t('common.new', 'Add')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false) }} title={t('common.close', 'Close')}><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} dir={i18n.dir()}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16, marginBottom: 20 }}>
              <div className="form-field has-value">
                <label>{t('accounts.fields.nameAr', 'Name (Arabic)')}</label>
                <input {...register('name_ar', { required: true })} className="form-input" />
              </div>
              <div className="form-field has-value">
                <label>{t('accounts.fields.nameEn', 'Name (English)')}</label>
                <input {...register('name_en', { required: true })} className="form-input" dir="ltr" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>{t('common.cancel', 'Cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? t('common.loading', 'Loading...') : t('common.save', 'Save')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontWeight: 700 }}>{t('common.manage', 'Manage')} {LOOKUP_TYPES.find(t => t.value === activeType)?.label}</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)} disabled={showForm}>
            <Plus size={14} /> {t('common.add', 'Add New')}
          </button>
        </div>
        
        {isLoading ? (
          <div style={{ padding: 20 }}>{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }}/>)}</div>
        ) : (
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('accounts.fields.nameAr', 'Arabic Name')}</th>
                  <th style={{ fontFamily: 'var(--font-latin)' }}>{t('accounts.fields.nameEn', 'English Name')}</th>
                  <th style={{ width: 80 }}>{t('common.action', 'Action')}</th>
                </tr>
              </thead>
              <tbody>
                {(lookups ?? []).map((item: any) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.name_ar}</td>
                    <td style={{ fontFamily: 'var(--font-latin)', color: 'var(--text-secondary)' }}>{item.name_en}</td>
                    <td>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ color: 'var(--color-danger)' }} 
                        onClick={() => {
                          if (confirm(t('purchases.delete.message', 'Are you sure you want to delete this?'))) {
                            deleteMutation.mutate(item.id)
                          }
                        }}
                      >
                        <Trash2 size={14}/>
                      </button>
                    </td>
                  </tr>
                ))}
                {!lookups?.length && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: 30, color: 'var(--text-secondary)' }}>{t('common.noData', 'No data found')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
