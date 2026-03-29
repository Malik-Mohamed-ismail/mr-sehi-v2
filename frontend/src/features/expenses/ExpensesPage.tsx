import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Plus, Download, Trash2, X, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { SearchInput } from '../../components/ui/SearchInput'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { staggerContainer, staggerItem } from '../../lib/animations'
import { formatSAR, formatDate } from '../../lib/utils'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'
import { exportToExcel } from '../../lib/export'
import { useAuthStore } from '../../store/authStore'

import { CustomSelect } from '../../components/ui/CustomSelect'
const EXPENSE_ACCOUNTS = [
  { code: '5201', name: 'رواتب وأجور' },
  { code: '5202', name: 'إيجار' },
  { code: '5203', name: 'كهرباء وماء' },
  { code: '5204', name: 'صيانة' },
  { code: '5205', name: 'تسويق وإعلان' },
  { code: '5206', name: 'نقل ومواصلات' },
  { code: '5207', name: 'اتصالات وانترنت' },
  { code: '5208', name: 'مصاريف إدارية' },
  { code: '5209', name: 'مصاريف متنوعة' },
  { code: '5210', name: 'تالف وهدر' },
]

export default function ExpensesPage() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => api.get('/expenses').then(r => r.data.data),
  })

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['lookups', 'payment_method'],
    queryFn: () => api.get('/lookups?type=payment_method').then(r => r.data.data),
  })

  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { expense_date: '', account_code: '5201', expense_type: 'ثابت', description: '', amount: 0, payment_method: 'بنك', has_vat: false },
  })

  const amount  = watch('amount') ?? 0
  const hasVAT  = watch('has_vat')
  const vatAmt  = hasVAT ? parseFloat((Number(amount) * 0.15).toFixed(4)) : 0
  const total   = Number(amount) + vatAmt

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/expenses', { ...data, amount: Number(data.amount) }),
    onSuccess: () => {
      toast.success(t('expenses.messages.createSuccess'))
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      reset(); setShowForm(false); setEditingExpense(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('expenses.messages.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/expenses/${id}`, { ...data, amount: Number(data.amount) }),
    onSuccess: () => {
      toast.success(t('common.updateSuccess'))
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      reset(); setShowForm(false); setEditingExpense(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('expenses.messages.error')),
  })

  const deleteMutation = useMutation({
    onMutate: async (deletedId) => {
      qc.setQueriesData({ type: 'active' }, (old: any) => {
        if (Array.isArray(old)) return old.filter((item: any) => item?.id !== deletedId);
        if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.filter((item: any) => item?.id !== deletedId) };
        return old;
      });
    },
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      toast.success(t('purchases.messages.deleteSuccess') || 'تم الحذف')
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      setDeleteId(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('expenses.messages.error')),
  })

  const handleExport = () => {
    const exportData = (expenses ?? []).map((e: any) => ({
      [i18n.t('expenses.table.date')]: formatDate(e.expense_date),
      [i18n.t('expenses.table.description')]: e.description,
      [i18n.t('expenses.table.type')]: i18n.t(`expenses.types.${e.expense_type === 'ثابت' ? 'fixed' : e.expense_type === 'متغير' ? 'variable' : e.expense_type === 'تشغيلي' ? 'operational' : 'emergency'}`),
      [i18n.t('expenses.fields.paymentMethod')]: e.payment_method,
      [i18n.t('expenses.table.amount')]: e.amount,
      [i18n.t('expenses.table.vat')]: e.vat_amount,
      [i18n.t('expenses.table.total')]: e.total_amount
    }))
    exportToExcel(exportData, i18n.t('expenses.exportTitle'))
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('expenses.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{t('expenses.pageSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleExport} disabled={!expenses?.length}>
            <Download size={16}/> تصدير Excel
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            <Plus size={16}/> {t('expenses.newExpense')}
          </button>
        </div>
      </div>

      {(() => {
        const total = (expenses ?? []).reduce((s: number, e: any) => s + Number(e.total_amount), 0)
        const vat = (expenses ?? []).reduce((s: number, e: any) => s + Number(e.vat_amount), 0)
        const count = (expenses ?? []).length
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            <div className="card kpi-card-danger" style={{ padding: '16px 20px' }}>
              <div className="kpi-label">{t('expenses.kpi.total', 'Total Expenses')}</div>
              <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-danger)' }}>{(expenses ?? []).reduce((s: number, e: any) => s + Number(e.amount), 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} SAR</div>
            </div>
            <div className="card kpi-card-warning" style={{ padding: '16px 20px' }}>
              <div className="kpi-label">{t('expenses.kpi.vat', 'Total VAT')}</div>
              <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-warning)' }}>{vat.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} SAR</div>
            </div>
            <div className="card kpi-card-info" style={{ padding: '16px 20px' }}>
              <div className="kpi-label">{t('expenses.kpi.count', 'Total Records')}</div>
              <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-info)' }}>{count}</div>
            </div>
          </div>
        )
      })()}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 24 }}>
          <div className="form-card-header">
            <span className="form-card-header-title">{editingExpense ? <Edit2 size={16}/> : '➕'} {editingExpense ? t('common.edit') : t('expenses.newExpense')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false); setEditingExpense(null); }} title="إغلاق"><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit(d => editingExpense ? updateMutation.mutate({ id: editingExpense.id, data: d }) : createMutation.mutate(d))} dir={i18n.dir()}>
            <div className="form-section-header">
              <div className="form-section-number">١</div>
              <div className="form-section-title">{t('expenses.section1')}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value"><label>{t('expenses.fields.date')}</label><input {...register('expense_date')} type="date" className="form-input"/></div>
              <div className="form-field has-value">
                <label>الحساب</label>
                <CustomSelect {...register('account_code')} >
                  {EXPENSE_ACCOUNTS.map(a => <option key={a.code} value={a.code}>{a.code} — {t(`expenses.accounts.a${a.code}`)}</option>)}
                </CustomSelect>
              </div>
              <div className="form-field has-value">
                <label>نوع المصروف</label>
                <CustomSelect {...register('expense_type')} >
                  <option value="ثابت">{t("expenses.types.fixed")}</option>
                  <option value="متغير">{t("expenses.types.variable")}</option>
                  <option value="تشغيلي">{t("expenses.types.operational")}</option>
                  <option value="طارئ">{t("expenses.types.emergency")}</option>
                </CustomSelect>
              </div>
              <div className="form-field has-value">
                <label>طريقة الدفع</label>
                <CustomSelect {...register('payment_method')} >
                  <option value="">طريقة الدفع...</option>
                  {paymentMethods.map((pm: any) => (
                    <option key={pm.id} value={pm.name_ar}>{i18n.language === 'ar' ? pm.name_ar : pm.name_en}</option>
                  ))}
                </CustomSelect>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value">
                <label>{t('expenses.fields.description')}</label>
                <input {...register('description', { required: true })} className="form-input" placeholder={t('common.descriptionPlaceholder') || 'e.g. May Electricity Bill'}/>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value">
                <label>{t('expenses.fields.amount')}</label>
                <input {...register('amount')} type="number" step="0.01" className="form-input"/>
              </div>
              <div className="form-field has-value" style={{ display: 'flex', alignItems: 'center', paddingTop: 12 }}>
                <label style={{ position: 'static', transform: 'none', fontSize: 14, padding: 0, pointerEvents: 'auto', cursor: 'pointer' }}>
                  <input {...register('has_vat')} type="checkbox" style={{ marginInlineEnd: 8, cursor: 'pointer' }}/>
                  {t('expenses.fields.includesVat')}
                </label>
              </div>
            </div>

            {hasVAT && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="form-field has-value">
                  <label style={{ color: 'var(--color-danger)' }}>{t('expenses.fields.vat')}</label>
                  <input readOnly value={vatAmt.toFixed(2)} className="form-input amount-field"/>
                </div>
                <div className="form-field has-value">
                  <label style={{ color: 'var(--color-danger)' }}>{t('expenses.fields.total')}</label>
                  <input readOnly value={total.toFixed(2)} className="form-input amount-field" style={{ fontWeight: 700 }}/>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="btn btn-secondary" onClick={() => { reset(); setShowForm(false); setEditingExpense(null); }}>{t('expenses.buttons.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || updateMutation.isPending}>
                {(isSubmitting || updateMutation.isPending) ? t('expenses.buttons.saving') : t('expenses.buttons.save')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 24 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }}/>)}
          </div>
        ) : (
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '520px' }}>
            <motion.table className="data-table" variants={staggerContainer} initial="hidden" animate="show">
              <thead>
                <tr>
                  <th>{t('expenses.table.date')}</th>
                  <th>{t('expenses.table.description')}</th>
                  <th>{t('expenses.table.type')}</th>
                  <th>{t('expenses.fields.paymentMethod')}</th>
                  <th>{t('expenses.table.amount')}</th>
                  <th>{t('expenses.table.vat')}</th>
                  <th>{t('expenses.table.total')}</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {(expenses ?? []).filter((i: any) => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase())).map((e: any) => (
                  <motion.tr key={e.id} variants={staggerItem}>
                    <td className="amount">{formatDate(e.expense_date)}</td>
                    <td style={{ fontWeight: 600 }}>{e.description}</td>
                    <td>
                      <span className={`badge ${e.expense_type === 'ثابت' ? 'badge-info' : e.expense_type === 'متغير' ? 'badge-warning' : e.expense_type === 'تشغيلي' ? 'badge-success' : 'badge-danger'}`}>
                        {i18n.t(`expenses.types.${e.expense_type === 'ثابت' ? 'fixed' : e.expense_type === 'متغير' ? 'variable' : e.expense_type === 'تشغيلي' ? 'operational' : 'emergency'}`)}
                      </span>
                    </td>
                    <td><span className="badge badge-neutral">{e.payment_method}</span></td>
                    <td className="amount" style={{ color: 'var(--text-primary)' }}>{formatSAR(e.amount)}</td>
                    <td className="amount" style={{ color: 'var(--color-danger)' }}>{formatSAR(e.vat_amount)}</td>
                    <td className="amount" style={{ fontWeight: 700, color: 'var(--color-danger)' }}>{formatSAR(e.total_amount)}</td>
                    <td>
                      {user?.role === 'admin' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-primary)' }} onClick={() => { setEditingExpense(e); reset({ expense_date: e.expense_date, account_code: e.account_code, expense_type: e.expense_type, description: e.description, amount: e.amount, payment_method: e.payment_method, has_vat: Number(e.vat_amount) > 0 }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Edit2 size={14}/></button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteId(e.id)}><Trash2 size={14}/></button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {!(expenses?.length) && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('expenses.table.empty')}</td></tr>
                )}
              </tbody>
            </motion.table>
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
