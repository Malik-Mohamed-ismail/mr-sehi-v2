import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Users, Plus, Save, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { api } from '../../lib/api'
import { PageTransition } from '../../components/ui/PageTransition'
import { staggerContainer, staggerItem } from '../../lib/animations'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'

import { LookupsTab } from './LookupsTab'

import { CustomSelect } from '../../components/ui/CustomSelect'
type TabType = 'system' | 'users' | 'audit' | 'lookups'

export default function SettingsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('system')

  return (
    <PageTransition>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('settings.pageTitle')}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}> {t('settings.pageSubtitle')}</p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Settings Sidebar */}
        <div className="card" style={{ width: 240, padding: '16px 12px', flexShrink: 0 }}>
          <button
            onClick={() => setActiveTab('system')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 2, background: activeTab === 'system' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'system' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'system' ? 700 : 500, fontSize: 14,
              border: 'none', cursor: 'pointer', textAlign: 'right', transition: 'all 0.2s',
            }}
          >
            <Settings size={18}/> {t('settings.tabs.system')}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 2, background: activeTab === 'users' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'users' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'users' ? 700 : 500, fontSize: 14,
              border: 'none', cursor: 'pointer', textAlign: 'right', transition: 'all 0.2s', marginTop: 4,
            }}
          >
            <Users size={18}/> {t('settings.tabs.users')}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 2, background: activeTab === 'audit' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'audit' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'audit' ? 700 : 500, fontSize: 14,
              border: 'none', cursor: 'pointer', textAlign: 'right', transition: 'all 0.2s', marginTop: 4,
            }}
          >
            <Activity size={18}/> {t('settings.tabs.audit')}
          </button>
          <button
            onClick={() => setActiveTab('lookups')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 2, background: activeTab === 'lookups' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'lookups' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'lookups' ? 700 : 500, fontSize: 14,
              border: 'none', cursor: 'pointer', textAlign: 'right', transition: 'all 0.2s', marginTop: 4,
            }}
          >
            <Activity size={18}/> إدارة القوائم المنسدلة
          </button>
        </div>

        {/* Settings Content Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {activeTab === 'system' && (
              <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <SystemSettingsTab />
              </motion.div>
            )}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <UsersManagementTab />
              </motion.div>
            )}
            {activeTab === 'audit' && (
              <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <AuditLogsTab />
              </motion.div>
            )}
            {activeTab === 'lookups' && (
              <motion.div key="lookups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <LookupsTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}

function SystemSettingsTab() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['settings', 'SYSTEM_PROFILE'],
    queryFn: () => api.get('/settings/SYSTEM_PROFILE').then(r => r.data.data),
  })

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    values: {
      restaurant_name: profile?.restaurant_name ?? '',
      tax_number: profile?.tax_number ?? '',
      cr_number: profile?.cr_number ?? '',
      vat_rate: profile?.vat_rate ?? 15,
    }
  })

  const mutation = useMutation({
    mutationFn: (data: any) => api.put('/settings/SYSTEM_PROFILE', data),
    onSuccess: () => {
      toast.success(t('settings.system.messages.saveSuccess'))
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: () => toast.error(t('settings.system.messages.error'))
  })

  if (isLoading) return <div className="skeleton" style={{ height: 200, width: '100%' }} />

  return (
    <div className="card">
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t('settings.system.title')}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t('settings.system.description')}</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} dir={i18n.dir()}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="form-field has-value">
            <label>{t('settings.system.fields.restaurantName')}</label>
            <input {...register('restaurant_name', { required: true })} className="form-input"/>
          </div>
          <div className="form-field has-value">
            <label>{t('settings.system.fields.crNumber')}</label>
            <input {...register('cr_number')} className="form-input"/>
          </div>
          <div className="form-field has-value">
            <label>{t('settings.system.fields.taxNumber')}</label>
            <input {...register('tax_number')} className="form-input"/>
          </div>
          <div className="form-field has-value">
            <label>{t('settings.system.fields.vatRate')}</label>
            <input {...register('vat_rate', { valueAsNumber: true })} type="number" step="1" className="form-input" dir="ltr"/>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? t('settings.system.buttons.saving') : <><Save size={16}/> {t('settings.system.buttons.save')}</>}
          </button>
        </div>
      </form>
    </div>
  )
}

function UsersManagementTab() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/auth/users').then(r => r.data.data),
  })

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { username: '', email: '', password: '', full_name: '', role: 'cashier' }
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/users', data),
    onSuccess: () => {
      toast.success(t('settings.users.messages.createSuccess'))
      qc.invalidateQueries({ queryKey: ['users'] })
      reset()
      setShowForm(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? t('settings.users.messages.error'))
  })

  const ROLE_BADGES: Record<string, string> = {
    admin: 'badge-danger',
    accountant: 'badge-info',
    cashier: 'badge-success',
  }
  const ROLE_NAMES: Record<string, string> = {
    admin: i18n.t('settings.users.roles.admin'),
    accountant: i18n.t('settings.users.roles.accountant'),
    cashier: i18n.t('settings.users.roles.cashier'),
  }

  return (
    <>
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 20 }}>
          <div className="form-card-header">
            <span className="form-card-header-title">➕ {t('settings.users.newUser')}</span>
            <button type="button" className="form-close-btn" onClick={() => { reset(); setShowForm(false) }} title="إغلاق">&#x2715;</button>
          </div>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} dir={i18n.dir()}>
            <div className="form-section-header">
              <div className="form-section-number">١</div>
              <div className="form-section-title">{t('settings.users.section1')}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16, marginBottom: 20 }}>
              <div className="form-field has-value">
                <label>{t('settings.users.fields.fullName')}</label>
                <input {...register('full_name', { required: true })} className="form-input"/>
              </div>
              <div className="form-field has-value">
                <label>{t('settings.users.fields.username')}</label>
                <input {...register('username', { required: true })} className="form-input" dir="ltr"/>
              </div>
              <div className="form-field has-value">
                <label>{t('settings.users.fields.email')}</label>
                <input {...register('email', { required: true })} type="email" className="form-input" dir="ltr"/>
              </div>
              <div className="form-field has-value">
                <label>{t('settings.users.fields.password')}</label>
                <input {...register('password', { required: true })} type="password" className="form-input" dir="ltr"/>
              </div>
              <div className="form-field has-value" style={{ gridColumn: '1 / -1' }}>
                <label>{t('settings.users.fields.role')}</label>
                <CustomSelect {...register('role', { required: true })} >
                  <option value="cashier">{t('settings.users.roles.cashier')}</option>
                  <option value="accountant">{t('settings.users.roles.accountant')}</option>
                  <option value="admin">{t('settings.users.roles.admin')}</option>
                </CustomSelect>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>{t('settings.users.buttons.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? t('settings.users.buttons.saving') : t('settings.users.buttons.save')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontWeight: 700 }}>{t('settings.users.table.title')}</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)} disabled={showForm}>
            <Plus size={14}/> {t('settings.users.buttons.newUser')}
          </button>
        </div>
        
        {isLoading ? (
          <div style={{ padding: 20 }}>{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }}/>)}</div>
        ) : (
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
            <thead>
              <tr>
                <th>{t('settings.users.table.fullName')}</th>
                <th>{t('settings.users.table.username')}</th>
                <th style={{ fontFamily: 'var(--font-latin)' }}>{t('settings.users.table.email')}</th>
                <th>{t('settings.users.table.role')}</th>
                <th>{t('settings.users.table.status')}</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u: any) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                  <td style={{ fontFamily: 'var(--font-latin)' }}>{u.username}</td>
                  <td style={{ fontFamily: 'var(--font-latin)', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td><span className={`badge ${ROLE_BADGES[u.role] ?? 'badge-neutral'}`}>{ROLE_NAMES[u.role] ?? u.role}</span></td>
                  <td>
                    {u.is_active 
                      ? <span className="badge badge-success">{t('settings.users.status.active')}</span> 
                      : <span className="badge badge-danger">{t('settings.users.status.inactive')}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </>
  )
}

function AuditLogsTab() {
  const { t } = useTranslation()
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/audit-log?limit=100').then(r => r.data.data),
  })

  // Basic styling mapping for actions
  const actionColors: Record<string, string> = {
    CREATE: 'badge-success',
    UPDATE: 'badge-info',
    DELETE: 'badge-danger',
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontWeight: 700 }}>{t('settings.audit.title')}</span>
      </div>
      
      {isLoading ? (
        <div style={{ padding: 20 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }}/>)}</div>
      ) : (
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <div style={{ overflow: 'auto', width: '100%', maxHeight: '500px' }}>
            <table className="data-table">
            <thead>
              <tr>
                <th>{t('settings.audit.table.datetime')}</th>
                <th>{t('settings.audit.table.user')}</th>
                <th>{t('settings.audit.table.action')}</th>
                <th>{t('settings.audit.table.table')}</th>
                <th style={{ minWidth: 200 }}>{t('settings.audit.table.details')}</th>
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map((log: any) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-latin)' }}>
                    {new Date(log.created_at).toLocaleString('ar-SA')}
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.full_name ?? log.username ?? log.user_id ?? '—'}</td>
                  <td>
                    <span className={`badge ${actionColors[log.action] ?? 'badge-neutral'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-latin)' }}>{log.table_name}</td>
                  <td>
                    <details style={{ cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-latin)', background: 'var(--bg-page)', padding: 4, borderRadius: 2 }}>
                      <summary style={{ outline: 'none' }}>{t('settings.audit.showDetails')}</summary>
                      <pre style={{ margin: 0, marginTop: 4, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                        {JSON.stringify(log.new_values || log.old_values, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}

