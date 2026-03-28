import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'

  return (
    <div style={{ position: 'relative', minWidth: 260 }}>
      <Search
        size={18}
        style={{
          position: 'absolute',
          top: '50%', transform: 'translateY(-50%)',
          ...(isRTL ? { right: 14 } : { left: 14 }),
          color: 'var(--text-muted)', pointerEvents: 'none',
        }}
      />
      <input
        className="form-control"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? t('common.search')}
        style={{
          height: 44,
          borderRadius: 'var(--radius-xl)',
          ...(isRTL ? { paddingRight: 44, paddingLeft: 16 } : { paddingLeft: 44, paddingRight: 16 }),
          fontSize: 14,
          background: 'var(--bg-surface-2)',
          border: '1px solid transparent',
        }}
      />
    </div>
  )
}
