import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from '../locales/ar'
import en from '../locales/en'

// Language initialization logic
const savedLanguage = localStorage.getItem('mr-sehi-lang') || 'ar'

// Apply layout direction immediately
document.documentElement.setAttribute('dir', savedLanguage === 'en' ? 'ltr' : 'rtl')
document.documentElement.setAttribute('lang', savedLanguage)

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  })

// Listen for language changes and update DOM automatically
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('dir', lng === 'en' ? 'ltr' : 'rtl')
  document.documentElement.setAttribute('lang', lng)
  localStorage.setItem('mr-sehi-lang', lng)
})

export default i18n
