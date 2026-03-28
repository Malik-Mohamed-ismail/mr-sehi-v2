import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { slideUp } from '../../lib/animations'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'

const schema = z.object({
  email:    z.string().email(i18n.t('auth.invalidEmail')),
  password: z.string().min(1, i18n.t('auth.passwordRequired')),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate       = useNavigate()
  const { setAuth }    = useAuthStore()
  const { t }          = useTranslation()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/auth/login', data)
      setAuth(res.data.data.user, res.data.data.accessToken)
      toast.success(t('auth.welcome') + ' ' + res.data.data.user.full_name)
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? t('auth.loginError'))
    }
  }

  return (
    <div style={{
      height: '100vh',
      background: 'var(--bg-sidebar)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dynamic Background Elements */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 50%, var(--bg-sidebar-hover) 0%, var(--bg-sidebar) 100%)' }}/>
      
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.8 }}>
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, var(--color-primary-alpha) 0%, transparent 60%)', top: '-10%', right: '-15%' }}
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }} 
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, var(--color-accent-alpha) 0%, transparent 60%)', bottom: '-20%', left: '-10%' }}
        />
      </div>

      {/* Login Card wrapper overrides index.css default layout slightly to force transparent modern look */}
      <motion.div
        variants={slideUp} initial="initial" animate="animate"
        style={{
          width: '100%', maxWidth: 460,
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.40)',
          position: 'relative', zIndex: 1,
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Animated gradient header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
          padding: '40px 32px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative mesh */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(circle at top left, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at bottom right, rgba(0,0,0,0.15) 0%, transparent 60%)',
          }}/>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 72, height: 72,
              borderRadius: 'var(--radius-xl)',
              background: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              transform: 'rotate(-3deg)',
            }}>
              <img
                src="/logo_icon_only.png"
                alt="مستر صحي"
                style={{ width: 48, height: 48, objectFit: 'contain', transform: 'rotate(3deg)' }}
              />
            </div>
            <div style={{ 
              fontSize: 24, 
              fontWeight: 800, 
              color: '#FFFFFF', 
              marginBottom: 8,
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-display)',
            }}>
              {t('layout.title') || 'مستر صحي'}
            </div>
            <div style={{ 
              fontSize: 13, 
              color: 'rgba(255,255,255,0.8)', 
              fontWeight: 500,
            }}>
              {t('auth.subtitle')}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '40px 40px 48px' }}>
          <form onSubmit={handleSubmit(onSubmit)} dir={i18n.dir()}>
            {/* Email */}
            <div className="form-field has-value" style={{ marginBottom: 28 }}>
              <label style={{ 
                top: -12, 
                fontSize: 13, 
                fontWeight: 600,
                color: 'var(--color-primary)',
              }}>
                {t('auth.email')}
              </label>
              <input
                {...register('email')}
                type="email"
                className={`form-input ${errors.email ? 'is-error' : ''}`}
                placeholder={t('auth.emailPlaceholder')}
                style={{ fontSize: 14 }}
              />
              {errors.email && <p style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 8, fontWeight: 500 }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="form-field has-value" style={{ marginBottom: 36 }}>
              <label style={{ 
                top: -12, 
                fontSize: 13, 
                fontWeight: 600,
                color: 'var(--color-primary)',
              }}>
                {t('auth.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'is-error' : ''}`}
                  placeholder="••••••••"
                  style={{
                    fontSize: 14,
                    paddingLeft: i18n.dir() === 'rtl' ? 16 : 48,
                    paddingRight: i18n.dir() === 'rtl' ? 48 : 16,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute',
                    [i18n.dir() === 'rtl' ? 'right' : 'left']: 16,
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'color 0.2s ease',
                  }}
                  aria-label={showPw ? t('auth.hidePassword') : t('auth.showPassword')}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {showPw ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
              {errors.password && <p style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 8, fontWeight: 500 }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting}
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                fontSize: 16, 
                height: 54, 
                borderRadius: 'var(--radius-lg)',
                fontWeight: 600,
                letterSpacing: '-0.2px',
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 18, height: 18,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}/>
                  {t('auth.loggingIn')}
                </span>
              ) : (
                t('auth.login')
              )}
            </button>
          </form>

          {/* Decorative footer line */}
          <div style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}>
            {t('auth.footerNote') || 'Secure authentication powered by مستر صحي'}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
