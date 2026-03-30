import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Plus, Minus, RotateCcw, CheckCircle, XCircle, Download, X } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { SearchInput } from '../../components/ui/SearchInput'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { staggerContainer, staggerItem } from '../../lib/animations'
import { formatSAR, formatDate } from '../../lib/utils'
import { exportToExcel } from '../../lib/export'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'

import { CustomSelect } from '../../components/ui/CustomSelect'
interface JournalLine { account_code: string; debit_amount: number; credit_amount: number; description?: string }
interface FormData { entry_date: string; description: string; reference?: string; lines: JournalLine[] }

export default function JournalPage() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [reverseId, setReverseId] = useState<string | null>(null)
  const [reverseReason, setReverseReason] = useState('')

  const { data: entries, isLoading } = useQuery({
    queryKey: ['journal'],
    queryFn:  () => api.get('/journal').then(r => r.data.data),
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn:  () => api.get('/accounts').then(r => r.data.data),
  })

  const { register, handleSubmit, control, watch, reset, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      lines: [
        { account_code: '', debit_amount: 0, credit_amount: 0 },
        { account_code: '', debit_amount: 0, credit_amount: 0 },
      ],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const lines = watch('lines') ?? []

  // Real-time balance
  const totalDebit  = lines.reduce((s, l) => s + (Number(l.debit_amount) || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit_amount) || 0), 0)
  const diff        = Math.abs(totalDebit - totalCredit)
  const isBalanced  = diff < 0.001

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/journal', data),
    onSuccess: () => {
      toast.success(t('journal.messages.createSuccess'))
      qc.invalidateQueries({ queryKey: ['journal'] })
      reset(); setShowForm(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('journal.messages.error')),
  })

  const reverseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/journal/${id}/reverse`, { reason }),
    onSuccess: () => {
      toast.success(t('journal.messages.reverseSuccess'))
      qc.invalidateQueries({ queryKey: ['journal'] })
      setReverseId(null); setReverseReason('')
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('journal.messages.error')),
  })

  const SOURCE_LABELS: Record<string, string> = {
    purchase: t('journal.sourceTypes.purchase'), revenue: t('journal.sourceTypes.revenue'), expense: t('journal.sourceTypes.expense'),
    reversal: t('journal.sourceTypes.reversal'), manual: t('journal.sourceTypes.manual'),
  };

  const handleExport = () => {
    const exportData = (entries ?? []).map((e: any) => ({
      [i18n.t('journal.table.entryNumber')]: e.entry_number,
      [i18n.t('journal.table.date')]: formatDate(e.entry_date),
      [i18n.t('journal.table.description')]: e.description,
      [i18n.t('journal.table.source')]: SOURCE_LABELS[e.source_type] ?? e.source_type,
      [i18n.t('journal.table.reference')]: e.reference || '-',
      [i18n.t('journal.table.debitAccount')]: e.debit_account_name || '-',
      [i18n.t('journal.table.creditAccount')]: e.credit_account_name || '-',
      [i18n.t('journal.fields.debit')]: Number(e.amount) || 0,
      [i18n.t('journal.fields.credit')]: Number(e.amount) || 0,
      [i18n.t('journal.table.isBalanced')]: e.is_balanced ? i18n.t('journal.table.yes') : i18n.t('journal.table.no'),
      [i18n.t('journal.table.status')]: e.is_reversed ? i18n.t('journal.table.reversed') : i18n.t('journal.table.active')
    }))
    exportToExcel(exportData, i18n.t('journal.exportTitle'))
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('journal.pageTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{t('journal.pageSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleExport} disabled={!entries?.length}>
            <Download size={16}/> {t('common.exportExcel')}
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            <Plus size={16}/> {t('journal.newEntry')}
          </button>
        </div>
      </div>

      {/* Manual entry form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 24 }}>
          <div className="form-card-header">
            <span className="form-card-header-title">➕ {t('journal.newEntry')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false) }} title={t('common.close')}><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} dir={i18n.dir()}>
            <div className="form-section-header">
              <div className="form-section-number">١</div>
              <div className="form-section-title">{t('journal.section1')}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="form-field has-value">
                <label>{t('journal.fields.date')}</label>
                <input {...register('entry_date')} type="date" className="form-input"/>
              </div>
              <div className="form-field has-value" style={{ gridColumn: '2 / -1' }}>
                <label>{t('journal.fields.description')}</label>
                <input {...register('description')} className="form-input"/>
              </div>
              <div className="form-field has-value">
                <label>{t('journal.fields.reference')}</label>
                <input {...register('reference')} className="form-input"/>
              </div>
            </div>

            {/* Lines */}
            <div className="form-section-header">
              <div className="form-section-number">٢</div>
              <div className="form-section-title">{t('journal.section2')}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: 10, marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', padding: '0 4px' }}>
                <span>{t('journal.fields.account')}</span>
                <span>{t('journal.fields.debit')}</span>
                <span>{t('journal.fields.credit')}</span>
                <span>{t('journal.fields.description')}</span>
                <span/>
              </div>
              {fields.map((field, idx) => (
                <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: 10, marginBottom: 8, alignItems: 'center' }}>
                  <CustomSelect {...register(`lines.${idx}.account_code`)}  style={{ height: 42 }}>
                    <option value="">{t('journal.fields.selectAccount')}</option>
                    {(accounts ?? []).map((a: any) => (
                      <option key={a.code} value={a.code}>{a.code} — {a.name_ar}</option>
                    ))}
                  </CustomSelect>
                  <input {...register(`lines.${idx}.debit_amount`)} type="number" step="0.01" className="form-input amount-field" style={{ height: 42 }}/>
                  <input {...register(`lines.${idx}.credit_amount`)} type="number" step="0.01" className="form-input amount-field" style={{ height: 42 }}/>
                  <input {...register(`lines.${idx}.description`)} className="form-input" style={{ height: 42 }}/>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => fields.length > 2 && remove(idx)}
                    style={{ color: 'var(--color-danger)', width: 32, padding: 0, justifyContent: 'center' }}>
                    <Minus size={14}/>
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => append({ account_code: '', debit_amount: 0, credit_amount: 0 })}>
                <Plus size={14}/> {t('journal.buttons.addLine')}
              </button>
            </div>

            {/* Balance indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderRadius: 2, marginBottom: 20,
              background: isBalanced ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
              border: `1px solid ${isBalanced ? 'rgba(29,184,123,0.20)' : 'rgba(232,56,77,0.20)'}`,
            }}>
              {isBalanced
                ? <CheckCircle size={16} color="var(--color-success)"/>
                : <XCircle size={16} color="var(--color-danger)"/>}
              <span style={{ fontSize: 14, fontFamily: 'var(--font-arabic)', fontWeight: 700, color: isBalanced ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {isBalanced
                  ? t('journal.balance.balanced')
                  : `${t('journal.balance.unbalanced')} ${diff.toFixed(2)} ${t('journal.balance.currency')}`}
              </span>
              <div style={{ marginRight: 'auto', display: 'flex', gap: 16, fontFamily: 'var(--font-latin)', fontSize: 13 }}>
                <span style={{ fontSize: 14, fontFamily: 'var(--font-arabic)', fontWeight: 700, color: isBalanced ? 'var(--color-success)' : 'var(--color-danger)' }}>{t('journal.balance.totalDebit')} {totalDebit.toFixed(2)}</span>
                <span style={{ fontSize: 14, fontFamily: 'var(--font-arabic)', fontWeight: 700, color: isBalanced ? 'var(--color-success)' : 'var(--color-danger)' }}>{t('journal.balance.totalCredit')} {totalCredit.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { reset(); setShowForm(false) }}>{t('journal.buttons.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isBalanced}>
                {isSubmitting ? t('journal.buttons.saving') : t('journal.buttons.save')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />
      </div>

      {/* Entries table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontWeight: 600 }}>{t('journal.pageTitle')}</span>
        </div>
        {isLoading ? (
          <div style={{ padding: 24 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }}/>)}</div>
        ) : (
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>{t('journal.table.entryNumber')}</th>
                  <th>{t('journal.table.date')}</th>
                  <th>{t('journal.table.description')}</th>
                  <th>{t('journal.table.source')}</th>
                  <th>{t('journal.table.reference')}</th>
                  <th>{t('journal.table.debitAccount')}</th>
                  <th>{t('journal.table.creditAccount')}</th>
                  <th>{t('journal.fields.debit')}</th>
                  <th>{t('journal.fields.credit')}</th>
                  <th>{t('journal.table.isBalanced')}</th>
                  <th>{t('journal.table.status')}</th>
                  {user?.role === 'admin' && <th>{t('journal.table.reverse')}</th>}
                </tr>
              </thead>
              <tbody>
                {(entries ?? []).filter((i: any) => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase())).map((e: any) => (
                  <tr key={e.id}
                    style={{ opacity: e.is_reversed ? 0.5 : 1 }}>
                    <td style={{ fontFamily: 'var(--font-latin)', fontWeight: 600, color: 'var(--color-primary)' }}>{e.entry_number}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(e.entry_date)}</td>
                    <td style={{ minWidth: 200, whiteSpace: 'normal', lineHeight: 1.5 }}>{e.description}</td>
                    <td><span className="badge badge-info">{SOURCE_LABELS[e.source_type] ?? e.source_type}</span></td>
                    <td style={{ fontFamily: 'var(--font-latin)' }}>{e.reference || '-'}</td>
                    <td style={{ maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={e.debit_account_name}>{e.debit_account_name || '-'}</td>
                    <td style={{ maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={e.credit_account_name}>{e.credit_account_name || '-'}</td>
                    <td className="amount" style={{ fontWeight: 600, color: 'var(--color-success)' }}>{formatSAR(Number(e.amount) || 0)}</td>
                    <td className="amount" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{formatSAR(Number(e.amount) || 0)}</td>
                    <td>
                      {e.is_balanced
                        ? <CheckCircle size={15} color="var(--color-success)"/>
                        : <XCircle size={15} color="var(--color-danger)"/>}
                    </td>
                    <td>
                      {e.is_reversed
                        ? <span className="badge badge-danger">{t('journal.table.reversed')}</span>
                        : <span className="badge badge-success">{t('journal.table.active')}</span>}
                    </td>
                    {user?.role === 'admin' && (
                      <td>
                        {!e.is_reversed && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-warning)', gap: 4 }}
                            onClick={() => setReverseId(e.id)}
                          >
                            <RotateCcw size={13}/> {t('journal.table.reverse')}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {!entries?.length && (
                  <tr><td colSpan={12} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('journal.table.empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reverse dialog */}
      <ConfirmDialog
        open={reverseId !== null}
        title={t('journal.dialogs.reverseTitle')}
        message={t('journal.dialogs.reverseMessage')}
        onConfirm={() => reverseId && reverseMutation.mutate({ id: reverseId, reason: reverseReason || t('journal.dialogs.manualReverseReason') })}
        onCancel={() => setReverseId(null)}
        loading={reverseMutation.isPending}
      />
    </PageTransition>
  )
}
