import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, RefreshCw, Users, CheckCircle, XCircle, Loader2, X, Edit2, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { SearchInput } from '../../components/ui/SearchInput'
import { staggerContainer, staggerItem } from '../../lib/animations'

import { CustomSelect } from '../../components/ui/CustomSelect'
const ROLES = ['admin', 'accountant', 'cashier'] as const

const schema = z.object({
  full_name: z.string().min(2),
  email:     z.string().email().optional().or(z.literal('')),
  username:  z.string().min(3).optional().or(z.literal('')),
  password:  z.string().min(8).optional().or(z.literal('')),
  role:      z.enum(ROLES),
})
type FormData = z.infer<typeof schema>

export default function UsersPage() {
  const { t }       = useTranslation()
  const qc          = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/auth/users')
      return res.data.data
    },
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'cashier' },
  })

  const createMutation = useMutation({
    mutationFn: (dto: FormData) => api.post('/auth/users', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('users.created'))
      setShowForm(false)
      reset()
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('common.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<FormData> }) => api.patch(`/auth/users/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('users.updated') || 'تم التحديث بنجاح')
      setShowForm(false)
      setEditingUser(null)
      reset()
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('common.error')),
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch(`/auth/users/${id}`, { is_active }),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(res?.data?.message || t('users.statusUpdated') || 'تم تحديث حالة المستخدم بنجاح')
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('common.error')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(t('users.deleted') || 'تم الحذف بنجاح')
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('common.error')),
  })

  const users = (data ?? []).filter((u: any) =>
    !search || u.full_name.includes(search) || u.email.includes(search) || u.username.includes(search)
  )

  const ROLE_COLORS: Record<string, string> = {
    admin:      'var(--color-danger)',
    accountant: 'var(--color-info)',
    cashier:    'var(--color-success)',
  }

  return (
    <PageTransition>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 2, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="var(--color-primary)" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{t('pages.users')}</h1>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('users.desc')}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ height: 44, width: 44, padding: 0, justifyContent: 'center' }} onClick={() => refetch()}><RefreshCw size={16} /></button>
            <button className="btn btn-primary" onClick={() => setShowForm(s => !s)} style={{ gap: 6 }}>
              <Plus size={15} /> {t('users.addUser')}
            </button>
          </div>
        </div>

        {/* Add user form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 20 }}>
            <div className="form-card-header">
              <span className="form-card-header-title">
                {editingUser ? <Edit2 size={16}/> : '➕'} {editingUser ? t('common.edit') : t('users.newUser')}
              </span>
              <button type="button" className="form-close-btn" onClick={() => { setShowForm(false); setEditingUser(null); reset() }} title="إغلاق"><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit(d => {
              if (editingUser) updateMutation.mutate({ id: editingUser.id, data: { full_name: d.full_name, role: d.role } })
              else createMutation.mutate(d)
            })}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                {[
                  { field: 'full_name', label: t('users.fullName'),  type: 'text' },
                  !editingUser && { field: 'email',     label: t('auth.email'),      type: 'email' },
                  !editingUser && { field: 'username',  label: t('users.username'),  type: 'text' },
                  !editingUser && { field: 'password',  label: t('auth.password'),   type: 'password' },
                ].filter(Boolean).map((f: any) => (
                  <div key={f.field} className="form-field has-value">
                    <label style={{ top: -8, fontSize: 12 }}>{f.label}</label>
                    <input {...register(f.field as any)} type={f.type} className={`form-input ${errors[f.field as keyof FormData] ? 'is-error' : ''}`} />
                  </div>
                ))}
                <div className="form-field has-value">
                  <label style={{ top: -8, fontSize: 12 }}>{t('users.role')}</label>
                  <CustomSelect {...register('role')} >
                    {ROLES.map(r => <option key={r} value={r}>{t(`sidebar.roles.${r}`)}</option>)}
                  </CustomSelect>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingUser(null); reset() }}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || updateMutation.isPending} style={{ gap: 6 }}>
                  {(isSubmitting || updateMutation.isPending) ? <Loader2 size={14} className="spin" /> : (editingUser ? <CheckCircle size={14} /> : <Plus size={14} />)} {t('common.save')}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div style={{ marginBottom: 16 }}>
          <SearchInput value={search} onChange={setSearch} placeholder={t('users.searchPlaceholder')} />
        </div>

        {isLoading ? (
          <div>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64, marginBottom: 8, borderRadius: 2 }} />)}</div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: 'grid', gap: 10 }}>
            {users.map((user: any) => (
              <motion.div key={user.id} variants={staggerItem} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: '#2B9225',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>
                  {user.full_name?.[0] ?? 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{user.full_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-latin)' }}>{user.email} · @{user.username}</div>
                </div>
                <span className="badge" style={{ background: `${ROLE_COLORS[user.role]}20`, color: ROLE_COLORS[user.role] }}>
                  {t(`sidebar.roles.${user.role}`)}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--color-primary)' }}
                    onClick={() => {
                      setEditingUser(user)
                      reset({ full_name: user.full_name, role: user.role })
                      setShowForm(true)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    title={t('common.edit') || 'تعديل'}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className={`btn btn-sm ${user.is_active ? 'btn-ghost' : 'btn-secondary'}`}
                    style={{ gap: 4, color: user.is_active ? 'var(--color-success)' : 'var(--color-danger)' }}
                    onClick={() => toggleActive.mutate({ id: user.id, is_active: !user.is_active })}
                    title={user.is_active ? (t('users.active') || 'نشط') : (t('users.inactive') || 'غير نشط')}
                  >
                    {user.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => {
                      if (window.confirm(t('users.confirmDelete') || 'هل أنت متأكد من حذف هذا المستخدم؟')) {
                        deleteMutation.mutate(user.id)
                      }
                    }}
                    title={t('common.delete') || 'حذف'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
            {users.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('common.noData')}</div>}
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
