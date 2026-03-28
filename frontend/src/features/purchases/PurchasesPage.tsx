import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Plus, Download, Trash2, X, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
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
const schema = z.object({
  invoice_number: z.string().min(1),
  invoice_date:   z.string().min(1),
  supplier_id: z.string().min(1, i18n.t('purchases.validation.supplierRequired')),
  category:       z.string().min(1, i18n.t('validation.required') || 'مطلوب'),
  item_name:      z.string().min(1),
  quantity:       z.coerce.number().positive(),
  unit_price:     z.coerce.number().positive(),
  discount:       z.coerce.number().min(0).default(0),
  payment_method: z.string().min(1, i18n.t('validation.required') || 'مطلوب'),
  is_asset:       z.boolean().default(false),
  notes:          z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function PurchasesPage() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn:  () => api.get('/suppliers').then(r => r.data.data),
  })

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn:  () => api.get('/purchases').then(r => r.data.data),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['lookups', 'category'],
    queryFn: () => api.get('/lookups?type=category').then(r => r.data.data),
  })
  
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['lookups', 'payment_method'],
    queryFn: () => api.get('/lookups?type=payment_method').then(r => r.data.data),
  })

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, discount: 0, is_asset: false },
  })

  // Auto-compute subtotal, VAT, total
  const qty      = watch('quantity') ?? 0
  const price    = watch('unit_price') ?? 0
  const discount = watch('discount') ?? 0
  const suppId   = watch('supplier_id')
  const supplier = suppliers?.find((s: any) => s.id === suppId)
  const hasVAT   = !!(supplier?.vat_number?.trim())
  const subtotal = Math.max(0, (qty * price) - discount)
  const vatAmt   = hasVAT ? parseFloat((subtotal * 0.15).toFixed(4)) : 0
  const total    = subtotal + vatAmt

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/purchases', data),
    onSuccess: () => {
      toast.success(t('purchases.messages.createSuccess'))
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      reset(); setShowForm(false); setEditingPurchase(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('purchases.messages.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/purchases/${id}`, data),
    onSuccess: () => {
      toast.success(t('common.updateSuccess'))
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      reset(); setShowForm(false); setEditingPurchase(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('purchases.messages.error')),
  })


  const deleteMutation = useMutation({
    onMutate: async (deletedId) => {
      qc.setQueriesData({ type: 'active' }, (old: any) => {
        if (Array.isArray(old)) return old.filter((item: any) => item?.id !== deletedId);
        if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.filter((item: any) => item?.id !== deletedId) };
        return old;
      });
    },
    mutationFn: (id: string) => api.delete(`/purchases/${id}`),
    onSuccess: () => {
      toast.success(t('purchases.messages.deleteSuccess'))
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['journal'] })
      setDeleteId(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('purchases.messages.error')),
  })

  const onSubmit = (data: FormData) => {
    const purchaseData = {
      ...data,
      subtotal:     parseFloat(subtotal.toFixed(4)),
      vat_amount:   vatAmt,
      total_amount: parseFloat(total.toFixed(4)),
    }
    if (editingPurchase) {
      updateMutation.mutate({ id: editingPurchase.id, data: purchaseData })
    } else {
      createMutation.mutate(purchaseData)
    }
  }

  const handleExport = () => {
    const exportData = (purchases ?? []).map((p: any) => {
      const supplier = suppliers?.find((s: any) => s.id === p.supplier_id)
      return {
        [i18n.t('purchases.exportCols.invoiceNumber')]: p.invoice_number,
        [i18n.t('purchases.exportCols.date')]: formatDate(p.invoice_date),
        [i18n.t('purchases.exportCols.supplier')]: supplier?.name_ar || p.supplier_id,
        [i18n.t('purchases.exportCols.item')]: p.item_name,
        [i18n.t('purchases.exportCols.category')]: p.category,
        [i18n.t('purchases.exportCols.qty')]: p.quantity,
        [i18n.t('purchases.exportCols.price')]: p.unit_price,
        [i18n.t('purchases.exportCols.paymentMethod')]: p.payment_method,
        [i18n.t('purchases.exportCols.subtotal')]: p.subtotal,
        [i18n.t('purchases.exportCols.vat')]: p.vat_amount,
        [i18n.t('purchases.exportCols.total')]: p.total_amount
      }
    })
    exportToExcel(exportData, i18n.t('purchases.exportTitle'))
  }

  return (
    <PageTransition>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('purchases.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{t('purchases.pageSubtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={16}/> {t('purchases.newInvoice')}
        </button>
      </div>

      {/* Summary KPI Cards */}
      {(() => {
        const totalAmt = (purchases ?? []).reduce((s: number, p: any) => s + Number(p.total_amount), 0)
        const totalVat = (purchases ?? []).reduce((s: number, p: any) => s + Number(p.vat_amount), 0)
        const count    = (purchases ?? []).length
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            <div className="card kpi-card-primary" style={{ padding: '16px 20px' }}>
              <div className="kpi-label">إجمالي المشتريات</div>
              <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-primary)' }}>{totalAmt.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} SAR</div>
            </div>
            <div className="card kpi-card-warning" style={{ padding: '16px 20px' }}>
              <div className="kpi-label">ضريبة القيمة المضافة</div>
              <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-warning)' }}>{totalVat.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} SAR</div>
            </div>
            <div className="card kpi-card-info" style={{ padding: '16px 20px' }}>
              <div className="kpi-label">عدد الفواتير</div>
              <div className="kpi-value" style={{ fontSize: 22, color: 'var(--color-info)' }}>{count}</div>
            </div>
          </div>
        )
      })()}

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ marginBottom: 24 }}
        >
          <div className="form-card-header">
            <span className="form-card-header-title">{editingPurchase ? <Edit2 size={16}/> : '➕'} {editingPurchase ? t('common.edit') : t('purchases.newInvoice')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false); setEditingPurchase(null); }} title="إغلاق"><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} dir={i18n.dir()}>
            {/* Section 1 */}
            <div className="form-section-header">
              <div className="form-section-number">١</div>
              <div className="form-section-title">{t('purchases.section1')}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div className="form-field has-value">
                <label>{t('purchases.fields.invoiceNumber')}</label>
                <input {...register('invoice_number')} className={`form-input ${errors.invoice_number ? 'is-error' : ''}`}/>
              </div>
              <div className="form-field has-value">
                <label>{t('purchases.fields.date')}</label>
                <input {...register('invoice_date')} type="date" className={`form-input ${errors.invoice_date ? 'is-error' : ''}`}/>
              </div>
              <div className="form-field has-value">
                <label>{t('purchases.fields.supplier')}</label>
                <CustomSelect {...register('supplier_id')} className={`errors.supplier_id ? 'is-error' : ''`}>
                  <option value="">{t('purchases.fields.selectSupplier')}</option>
                  {suppliers?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name_ar}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="form-field has-value">
                <label>{t('purchases.fields.category')}</label>
                <CustomSelect {...register('category')} className={`errors.category ? 'is-error' : ''`}>
                  <option value="">{t('purchases.fields.category')}</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.name_ar}>{i18n.language === 'ar' ? c.name_ar : c.name_en}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="form-field has-value" style={{ gridColumn: '1 / -1' }}>
                <label>{t('purchases.fields.item')}</label>
                <input {...register('item_name')} className={`form-input ${errors.item_name ? 'is-error' : ''}`}/>
              </div>
            </div>

            {/* Section 2 */}
            <div className="form-section-header">
              <div className="form-section-number">٢</div>
              <div className="form-section-title">{t('purchases.section2')}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field has-value">
                <label>{t('purchases.fields.qty')}</label>
                <input {...register('quantity')} type="number" step="0.001" className="form-input"/>
              </div>
              <div className="form-field has-value">
                <label>{t('purchases.fields.price')}</label>
                <input {...register('unit_price')} type="number" step="0.01" className="form-input"/>
              </div>
              <div className="form-field has-value">
                <label>{t('purchases.fields.discount')}</label>
                <input {...register('discount')} type="number" step="0.01" className="form-input"/>
              </div>
            </div>

            {/* Computed readonly fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div className="form-field has-value">
                <label style={{ color: 'var(--color-success)' }}>{t('purchases.fields.subtotal')}</label>
                <input readOnly value={subtotal.toFixed(2)} className="form-input amount-field"/>
              </div>
              <div className="form-field has-value">
                <label style={{ color: 'var(--color-success)' }}>
                  {t('purchases.fields.vat')}
                  {!hasVAT && <span style={{ fontSize: 10, color: 'var(--color-warning)', marginRight: 4 }}>{t('purchases.fields.exempt')}</span>}
                </label>
                <input readOnly value={vatAmt.toFixed(2)} className="form-input amount-field"/>
              </div>
              <div className="form-field has-value">
                <label style={{ color: 'var(--color-success)' }}>{t('purchases.fields.total')}</label>
                <input readOnly value={total.toFixed(2)} className="form-input amount-field" style={{ fontSize: 16, fontWeight: 700 }}/>
              </div>
            </div>

            {/* Section 3 */}
            <div className="form-section-header">
              <div className="form-section-number">٣</div>
              <div className="form-section-title">{t('purchases.section3')}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div className="form-field has-value">
                <label>{t('purchases.section3')}</label>
                <CustomSelect {...register('payment_method')} className={`errors.payment_method ? 'is-error' : ''`}>
                  <option value="">طريقة الدفع...</option>
                  {paymentMethods.map((pm: any) => (
                    <option key={pm.id} value={pm.name_ar}>{i18n.language === 'ar' ? pm.name_ar : pm.name_en}</option>
                  ))}
                </CustomSelect>
              </div>
              <div className="form-field has-value" style={{ display: 'flex', alignItems: 'center', paddingTop: 12 }}>
                <label style={{ position: 'static', transform: 'none', fontSize: 14, padding: 0, marginLeft: 8, pointerEvents: 'auto', cursor: 'pointer' }}>
                  <input {...register('is_asset')} type="checkbox" style={{ marginInlineEnd: 8, cursor: 'pointer' }}/>
                  أصل ثابت (معدات / أثاث)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { reset(); setShowForm(false) }}>{t("purchases.buttons.cancel")}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? t('purchases.buttons.saving') : t('purchases.buttons.save')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.search') || 'بحث...'} />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>{t('purchases.table.title')}</span>
          <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={!purchases?.length}>
            <Download size={14}/> تصدير Excel
          </button>
        </div>
        {isLoading ? (
          <div style={{ padding: 24 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }}/>)}
          </div>
        ) : (
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
            <thead>
              <tr>
                <th>{t('purchases.fields.invoiceNumber')}</th>
                <th>{t('purchases.fields.date')}</th>
                <th>{t('purchases.fields.supplier')}</th>
                <th>{t('purchases.fields.item')}</th>
                <th>{t('purchases.fields.category')}</th>
                <th>{t('purchases.fields.qty')}</th>
                <th>{t('purchases.fields.price')}</th>
                <th>{t('purchases.exportCols.vat')}</th>
                <th>{t('purchases.fields.total')}</th>
                <th></th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {(purchases ?? []).filter((i: any) => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase())).map((p: any) => (
                <motion.tr key={p.id} variants={staggerItem}>
                  <td className="amount" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.invoice_number}</td>
                  <td className="amount" style={{ color: 'var(--text-secondary)' }}>{formatDate(p.invoice_date)}</td>
                  <td style={{ fontWeight: 600 }}>{suppliers?.find((s: any) => s.id === p.supplier_id)?.name_ar || p.supplier_id}</td>
                  <td><span className="badge badge-neutral">{p.item_name}</span></td>
                  <td>{p.category}</td>
                  <td className="amount">{p.quantity}</td>
                  <td className="amount">{formatSAR(p.unit_price)}</td>
                  <td className="amount" style={{ color: 'var(--color-danger)' }}>{formatSAR(p.vat_amount ?? 0)}</td>
                  <td className="amount" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatSAR(p.total_amount)}</td>
                  <td>
                    {user?.role === 'admin' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-primary)' }}
                          onClick={() => {
                            setEditingPurchase(p);
                            reset({
                              invoice_number: p.invoice_number,
                              invoice_date: p.invoice_date,
                              supplier_id: p.supplier_id,
                              category: p.category,
                              item_name: p.item_name,
                              quantity: p.quantity,
                              unit_price: p.unit_price,
                              discount: p.discount,
                              payment_method: p.payment_method,
                              is_asset: p.is_asset,
                              notes: p.notes
                            });
                            setShowForm(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          aria-label={t("common.edit")}
                        >
                          <Edit2 size={14}/>
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => setDeleteId(p.id)}
                          aria-label={t("purchases.delete.aria")}
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
              {!purchases?.length && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('purchases.table.empty')}</td></tr>
              )}
            </motion.tbody>
          </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title={t("purchases.delete.title")}
        message={t("purchases.delete.message")}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </PageTransition>
  )
}
