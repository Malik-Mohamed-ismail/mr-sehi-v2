import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { fadeIn } from '../../lib/animations'

interface Option { value: string; label: string }

interface FilterDropdownProps {
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder?: string
}

export function FilterDropdown({ value, onChange, options, placeholder }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const selected = options.find(o => o.value === value)

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen(o => !o)}
        style={{ gap: 8, height: 44, paddingInline: 16 }}
      >
        <span style={{ fontSize: 13 }}>{selected?.label ?? placeholder ?? t('common.filter')}</span>
        <ChevronDown size={14} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}/>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={fadeIn} initial="initial" animate="animate" exit="exit"
            style={{
              position: 'absolute', top: '110%', insetInlineStart: 0,
              background: 'var(--bg-surface)',
              border: '1px solid rgba(43,146,37,0.10)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              minWidth: 160, overflow: 'hidden', zIndex: 200,
            }}
          >
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'start',
                  padding: '9px 14px', border: 'none',
                  cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)',
                  fontFamily: 'var(--font-arabic)',
                  background: opt.value === value ? 'var(--color-primary-light)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = opt.value === value ? 'var(--color-primary-light)' : 'transparent')}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
