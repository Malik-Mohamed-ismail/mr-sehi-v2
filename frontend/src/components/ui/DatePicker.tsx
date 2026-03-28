import { useState, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DatePickerProps {
  date: string
  onChange: (date: string) => void
}

export function DatePicker({ date, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [tempDate, setTempDate] = useState(date)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const apply = () => {
    onChange(tempDate)
    setOpen(false)
  }

  const presets = [
    { label: t('dateRange.today') || 'اليوم', date: new Date().toISOString().split('T')[0] },
    {
      label: 'أول الشهر',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    },
    {
      label: 'أول السنة',
      date: `${new Date().getFullYear()}-01-01`,
    },
  ]

  const label = date || t('dateRange.selectDate') || 'اختر التاريخ'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen(o => !o)}
        style={{ gap: 8, height: 44, paddingInline: 16, fontFamily: 'var(--font-latin)' }}
      >
        <Calendar size={16} />
        <span style={{ fontSize: 13 }}>{label}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', insetInlineStart: 0,
          background: 'var(--bg-surface)',
          border: '1px solid rgba(43,146,37,0.10)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 16, zIndex: 300, minWidth: 260,
        }}>
          {/* Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {presets.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setTempDate(p.date); onChange(p.date); setOpen(false) }}
                style={{
                  padding: '4px 10px', borderRadius: 2, border: '1px solid rgba(43,146,37,0.15)',
                  background: 'var(--bg-surface-2)', fontSize: 12, cursor: 'pointer',
                  fontFamily: 'var(--font-arabic)', color: 'var(--text-primary)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              التاريخ
            </label>
            <input
              type="date"
              className="form-input"
              style={{ height: 36, fontSize: 12, fontFamily: 'var(--font-latin)', direction: 'ltr', width: '100%' }}
              value={tempDate}
              onChange={e => setTempDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: 44, fontSize: 14 }}
            onClick={apply}
          >
            {t('common.apply') || 'تطبيق'}
          </button>
        </div>
      )}
    </div>
  )
}
