import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  // Keep <html dir="..."> in sync with language
  useEffect(() => {
    const dir = isAr ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.body.dir = dir
    document.documentElement.lang = i18n.language
  }, [isAr, i18n.language])

  const toggle = () => {
    i18n.changeLanguage(isAr ? 'en' : 'ar')
  }

  return (
    <button
      onClick={toggle}
      aria-label={isAr ? 'Switch to English' : 'التبديل للعربية'}
      title={isAr ? 'Switch to English' : 'التبديل للعربية'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        height: 36,
        padding: '0 10px',
        borderRadius: 2,
        border: '1px solid #DDE8DC',
        background: 'transparent',
        cursor: 'pointer',
        color: '#5A6B58',
        fontFamily: 'IBM Plex Sans, sans-serif',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.5px',
        transition: 'all 0.15s ease',
        direction: 'ltr',          // always LTR so EN/AR label is readable
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        Object.assign(e.currentTarget.style, {
          background: '#E8F5E7',
          borderColor: '#2B9225',
          color: '#2B9225',
        })
      }}
      onMouseLeave={e => {
        Object.assign(e.currentTarget.style, {
          background: 'transparent',
          borderColor: '#DDE8DC',
          color: '#5A6B58',
        })
      }}
    >
      <Globe size={14} />
      {/* show CURRENT language so user knows what they're on */}
      <span>{isAr ? 'العربية' : 'English'}</span>
    </button>
  )
}
