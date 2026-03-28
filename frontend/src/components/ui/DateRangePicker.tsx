import { useState, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DateRangePickerProps {
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [tempFrom, setTempFrom] = useState(from)
  const [tempTo, setTempTo] = useState(to)
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
    onChange(tempFrom, tempTo)
    setOpen(false)
  }

  const presets = [
    { label: t('dateRange.today'), from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
    {
      label: t('dateRange.thisMonth'),
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
    },
    {
      label: t('dateRange.lastMonth'),
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
      to: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0],
    },
    {
      label: t('dateRange.thisYear'),
      from: `${new Date().getFullYear()}-01-01`,
      to: new Date().toISOString().split('T')[0],
    },
  ]

  const label = from && to ? `${from} — ${to}` : t('dateRange.selectRange')

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
          padding: 16, zIndex: 300, minWidth: 280,
        }}>
          {/* Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {presets.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setTempFrom(p.from); setTempTo(p.to); onChange(p.from, p.to); setOpen(false) }}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                {t('dateRange.from')}
              </label>
              <input
                type="date"
                className="form-input"
                style={{ height: 36, fontSize: 12, fontFamily: 'var(--font-latin)', direction: 'ltr' }}
                value={tempFrom}
                onChange={e => setTempFrom(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                {t('dateRange.to')}
              </label>
              <input
                type="date"
                className="form-input"
                style={{ height: 36, fontSize: 12, fontFamily: 'var(--font-latin)', direction: 'ltr' }}
                value={tempTo}
                onChange={e => setTempTo(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: 36, fontSize: 13 }}
            onClick={apply}
          >
            {t('common.apply')}
          </button>
        </div>
      )}
    </div>
  )
}
