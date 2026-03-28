import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldOff, ArrowRight, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  const navigate    = useNavigate()
  const { t, i18n } = useTranslation()
  const isRtl       = i18n.dir() === 'rtl'
  const ArrowIcon   = isRtl ? ArrowLeft : ArrowRight

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            24,
      background:     'var(--color-bg)',
      padding:        24,
      textAlign:      'center',
    }}>
      {/* Icon */}
      <div style={{
        width:            96,
        height:           96,
        borderRadius:     '50%',
        background:       'rgba(212,168,83,0.1)',
        border:           '1px solid rgba(212,168,83,0.25)',
        display:          'flex',
        alignItems:       'center',
        justifyContent:   'center',
        marginBottom:     8,
      }}>
        <ShieldOff size={40} color="#D4A853" strokeWidth={1.5} />
      </div>

      {/* 404 */}
      <div style={{ fontSize: 80, fontWeight: 800, color: '#D4A853', lineHeight: 1, letterSpacing: '-4px' }}>
        404
      </div>

      {/* Title */}
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>
        {t('notFound.title', 'الصفحة غير موجودة')}
      </h1>

      <p style={{ margin: 0, color: 'var(--color-text-muted)', maxWidth: 380, lineHeight: 1.6 }}>
        {t('notFound.description', 'الرابط الذي طلبته غير موجود أو تم نقله.')}
      </p>

      <button
        onClick={() => navigate('/dashboard', { replace: true })}
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            8,
          padding:        '12px 28px',
          borderRadius:   8,
          border:         'none',
          cursor:         'pointer',
          background:     '#D4A853',
          color:          '#0a0d16',
          fontWeight:     700,
          fontSize:       15,
          marginTop:      8,
          transition:     'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {t('notFound.goHome', 'العودة إلى الرئيسية')}
        <ArrowIcon size={16} />
      </button>
    </div>
  )
}
