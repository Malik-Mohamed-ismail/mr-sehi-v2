import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Plus, Download, Trash2, X, Building2, Calculator, Edit2 } from 'lucide-react'
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

import { CustomSelect } from '../../components/ui/CustomSelect'
const ASSET_ACCOUNTS = [
  { code: '1501', type: 'equipment',  nameAr: 'معدات' },
  { code: '1502', type: 'furniture',  nameAr: 'أثاث' },
  { code: '1503', type: 'vehicles',   nameAr: 'مركبات' },
  { code: '1504', type: 'technology', nameAr: 'تقنية' },
  { code: '1509', type: 'other',      nameAr: 'أصول أخرى' },
]

const TYPE_BADGE_COLOR: Record<string, string> = {
  equipment:  'badge-info',
  furniture:  'badge-warning',
  vehicles:   'badge-neutral',
  technology: 'badge-success',
  other:      'badge-danger',
}

export default function FixedAssetsPage() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [search, setSearch]         = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [editingAsset, setEditingAsset] = useState<any>(null)
  const [deleteId, setDeleteId]     = useState<string | null>(null)

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['fixed-assets'],
    queryFn: () => api.get('/fixed-assets').then(r => r.data.data),
  })

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['lookups', 'payment_method'],
    queryFn: () => api.get('/lookups?type=payment_method').then(r => r.data.data),
  })

  const { register, handleSubmit, watch, reset, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      asset_date: '', asset_name: '', asset_type: 'equipment', account_code: '1501',
      cost: 0, has_vat: false, payment_method: 'بنك', useful_life_years: 5, description: '', notes: '',
    },
  })

  const rawCost = watch('cost') || 0
  const hasVAT  = watch('has_vat')
  const baseAmt = hasVAT ? rawCost / 1.15 : rawCost
  const vatAmt  = hasVAT ? rawCost - baseAmt : 0
  const assetType = watch('asset_type')

  const syncAccount = (type: string) => {
    const match = ASSET_ACCOUNTS.find(a => a.type === type)
    if (match) setValue('account_code', match.code)
  }

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/fixed-assets', { ...data, cost: Number(data.cost), useful_life_years: Number(data.useful_life_years) }),
    onSuccess: () => {
      toast.success(t('fixedAssets.messages.createSuccess'))
      qc.invalidateQueries({ queryKey: ['fixed-assets'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      reset(); setShowForm(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('fixedAssets.messages.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/fixed-assets/${id}`, { ...data, cost: Number(data.cost), useful_life_years: Number(data.useful_life_years) }),
    onSuccess: () => {
      toast.success(t('common.updateSuccess'))
      qc.invalidateQueries({ queryKey: ['fixed-assets'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      reset(); setShowForm(false); setEditingAsset(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('fixedAssets.messages.error')),
  })

  const deleteMutation = useMutation({
    onMutate: async (deletedId) => {
      qc.setQueriesData({ type: 'active' }, (old: any) => {
        if (Array.isArray(old)) return old.filter((item: any) => item?.id !== deletedId)
        if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.filter((item: any) => item?.id !== deletedId) }
        return old
      })
    },
    mutationFn: (id: string) => api.delete(`/fixed-assets/${id}`),
    onSuccess: () => {
      toast.success(t('fixedAssets.messages.deleteSuccess'))
      qc.invalidateQueries({ queryKey: ['fixed-assets'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      setDeleteId(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('fixedAssets.messages.error')),
  })

  const depreciateMutation = useMutation({
    mutationFn: () => api.post('/fixed-assets/depreciate'),
    onSuccess: (res) => {
      toast.success(res.data.message)
      qc.invalidateQueries({ queryKey: ['fixed-assets'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('common.error')),
  })

  const handleExport = () => {
    const exportData = (assets ?? []).map((a: any) => ({
      [t('fixedAssets.table.date')]:      formatDate(a.asset_date),
      [t('fixedAssets.table.name')]:      a.asset_name,
      [t('fixedAssets.table.type')]:      t(`fixedAssets.types.${a.asset_type}`),
      [t('fixedAssets.table.account')]:   a.account_code,
      [t('fixedAssets.table.cost')]:      a.cost,
      [t('fixedAssets.table.vat')]:       a.vat_amount,
      [t('fixedAssets.table.totalCost')]: a.total_cost,
      [t('fixedAssets.table.payment')]:   a.payment_method,
      [t('fixedAssets.table.usefulLife')]:a.useful_life_years,
    }))
    exportToExcel(exportData, t('fixedAssets.exportTitle'))
  }

  const totalCostVal = (assets ?? []).reduce((s: number, a: any) => s + Number(a.cost), 0)
  const totalVatVal  = (assets ?? []).reduce((s: number, a: any) => s + Number(a.vat_amount), 0)
  const assetCount   = (assets ?? []).length
  const filtered = (assets ?? []).filter((a: any) =>
    !search || JSON.stringify(a).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageTransition>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.05) 100%)',
            border: '1px solid rgba(212,168,83,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-primary)',
          }}>
            <Building2 size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('fixedAssets.pageTitle')}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t('fixedAssets.pageSubtitle')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => depreciateMutation.mutate()} disabled={depreciateMutation.isPending || !assets?.length}>
            <Calculator size={16} /> {depreciateMutation.isPending ? t('common.loading') : 'تشغيل الإهلاك الآلي'}
          </button>
          <button className="btn btn-secondary" onClick={handleExport} disabled={!assets?.length}>
            <Download size={16} /> {t('fixedAssets.table.export')}
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            <Plus size={16} /> {t('fixedAssets.newAsset')}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card kpi-card-primary" style={{ padding: '16px 20px' }}>
          <div className="kpi-label">{t('fixedAssets.kpi.totalCost')}</div>
          <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-primary)' }}>
            {totalCostVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
          </div>
        </div>
        <div className="card kpi-card-info" style={{ padding: '16px 20px' }}>
          <div className="kpi-label">{t('fixedAssets.kpi.totalAssets')}</div>
          <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-info)' }}>{assetCount}</div>
        </div>
        <div className="card kpi-card-warning" style={{ padding: '16px 20px' }}>
          <div className="kpi-label">{t('fixedAssets.kpi.totalVat')}</div>
          <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-warning)' }}>
            {totalVatVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 24 }}>
          <div className="form-card-header">
            <span className="form-card-header-title">{editingAsset ? <Edit2 size={16}/> : '🏢'} {editingAsset ? t('common.edit') : t('fixedAssets.section1')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false); setEditingAsset(null) }} title="إغلاق"><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit((d) => editingAsset ? updateMutation.mutate({ id: editingAsset.id, data: d }) : createMutation.mutate(d))} dir={i18n.dir()}>
            <div className="form-section-header">
              <div className="form-section-number">١</div>
              <div className="form-section-title">{t('fixedAssets.section1')}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value">
                <label>{t('fixedAssets.fields.date')}</label>
                <input {...register('asset_date', { required: true })} type="date" className="form-input" />
              </div>
              <div className="form-field has-value">
                <label>{t('fixedAssets.fields.assetName')}</label>
                <input {...register('asset_name', { required: true })} className="form-input" placeholder="e.g. Laptop Dell XPS" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value">
                <label>{t('fixedAssets.fields.assetType')}</label>
                <CustomSelect
                  {...register('asset_type')}
                  
                  onChange={e => { register('asset_type').onChange(e); syncAccount(e.target.value) }}
                >
                  {ASSET_ACCOUNTS.map(a => (
                    <option key={a.type} value={a.type}>{t(`fixedAssets.types.${a.type}`)}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="form-field has-value">
                <label>{t('fixedAssets.fields.paymentMethod')}</label>
                <CustomSelect {...register('payment_method')} >
                  {paymentMethods.length > 0
                    ? paymentMethods.map((pm: any) => (
                        <option key={pm.id} value={pm.name_ar}>{i18n.language === 'ar' ? pm.name_ar : pm.name_en}</option>
                      ))
                    : (
                      <>
                        <option value="كاش">كاش</option>
                        <option value="بنك">بنك</option>
                        <option value="آجل">آجل</option>
                      </>
                    )
                  }
                </CustomSelect>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value">
                <label>{t('fixedAssets.fields.cost')}</label>
                <input {...register('cost')} type="number" step="0.01" min="0" className="form-input" />
              </div>
              <div className="form-field has-value">
                <label>{t('fixedAssets.fields.usefulLife')}</label>
                <input {...register('useful_life_years')} type="number" min="1" max="50" className="form-input" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value" style={{ display: 'flex', alignItems: 'center', paddingTop: 12 }}>
                <label style={{ position: 'static', transform: 'none', fontSize: 14, padding: 0, pointerEvents: 'auto', cursor: 'pointer' }}>
                  <input {...register('has_vat')} type="checkbox" style={{ marginInlineEnd: 8, cursor: 'pointer' }} />
                  {t('fixedAssets.fields.includesVat')}
                </label>
              </div>
              {hasVAT && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-field has-value">
                    <label style={{ color: 'var(--color-success)' }}>{t('fixedAssets.fields.vat')}</label>
                    <input readOnly value={vatAmt.toFixed(2)} className="form-input amount-field" />
                  </div>
                  <div className="form-field has-value">
                    <label style={{ color: 'var(--color-success)' }}>قيمة الأصل (قبل الضريبة)</label>
                    <input readOnly value={baseAmt.toFixed(2)} className="form-input amount-field" style={{ fontWeight: 700 }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value">
                <label>{t('fixedAssets.fields.description')}</label>
                <input {...register('description', { required: true })} className="form-input" />
              </div>
            </div>

            {!editingAsset && (
              <div style={{ background: 'rgba(43,146,37,0.08)', border: '1px solid rgba(43,146,37,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 8 }}>
                📒 {i18n.language === 'ar'
                  ? `عند الحفظ يتم تلقائياً: مدين حساب ${ASSET_ACCOUNTS.find(a => a.type === assetType)?.nameAr ?? 'الأصل'} — دائن حساب الدفع`
                  : `On save: Dr ${t(`fixedAssets.types.${assetType}`)} Account — Cr Payment Account`}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { reset(); setShowForm(false); setEditingAsset(null) }}>
                {t('fixedAssets.buttons.cancel')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || updateMutation.isPending}>
                {(isSubmitting || updateMutation.isPending) ? t('fixedAssets.buttons.saving') : t('fixedAssets.buttons.save')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 24 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }} />)}
          </div>
        ) : (
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '520px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('fixedAssets.table.date')}</th>
                  <th>{t('fixedAssets.table.name')}</th>
                  <th>{t('fixedAssets.table.type')}</th>
                  <th>{t('fixedAssets.table.account')}</th>
                  <th>{t('fixedAssets.table.cost')}</th>
                  <th>{t('fixedAssets.table.vat')}</th>
                  <th>{t('fixedAssets.table.usefulLife')}</th>
                  <th>الإهلاك</th>
                  <th>الصافي</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a: any) => (
                  <tr key={a.id}>
                    <td className="amount">{formatDate(a.asset_date)}</td>
                    <td style={{ fontWeight: 600 }}>{a.asset_name}</td>
                    <td>
                      <span className={`badge ${TYPE_BADGE_COLOR[a.asset_type] ?? 'badge-neutral'}`}>
                        {t(`fixedAssets.types.${a.asset_type}`)}
                      </span>
                    </td>
                    <td><span className="badge badge-neutral">{a.account_code}</span></td>
                    <td className="amount">{formatSAR(a.cost)}</td>
                    <td className="amount">{formatSAR(a.vat_amount)}</td>
                    <td className="amount">{a.useful_life_years}</td>
                    <td className="amount" style={{ color: 'var(--color-danger)' }}>{formatSAR(a.accumulated_depreciation ?? 0)}</td>
                    <td className="amount" style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                      {formatSAR(Number(a.cost) - Number(a.accumulated_depreciation ?? 0))}
                    </td>
                    <td>
                      {user?.role === 'admin' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-primary)' }}
                            onClick={() => {
                              setEditingAsset(a)
                              reset({ asset_date: a.asset_date, asset_name: a.asset_name, asset_type: a.asset_type, account_code: a.account_code, cost: Number(a.total_cost ?? a.cost), has_vat: Number(a.vat_amount) > 0, payment_method: a.payment_method, useful_life_years: a.useful_life_years, description: a.description, notes: a.notes || '' })
                              setShowForm(true)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => setDeleteId(a.id)}
                            title={t('fixedAssets.delete.aria')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                      {t('fixedAssets.table.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title={t('fixedAssets.delete.title')}
        message={t('fixedAssets.delete.message')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </PageTransition>
  )
}
