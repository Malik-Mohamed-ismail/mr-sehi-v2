import { SearchX } from 'lucide-react'

interface EmptyStateProps {
  title?:  string
  message?: string
  icon?:   React.ReactNode
}

/**
 * Shown when a list query returns no results.
 * Uses the design system colors to stay consistent with the rest of the UI.
 */
export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            20,
      padding:        '80px 32px',
      textAlign:      'center',
      background:     'var(--bg-surface)',
      borderRadius:   'var(--radius-xl)',
      border:         '1px dashed var(--border-strong)',
      margin:         '24px 0',
    }}>
      <div style={{
        width:          88,
        height:         88,
        borderRadius:   '50%',
        background:     'var(--color-primary-light)',
        border:         '4px solid var(--bg-surface)',
        boxShadow:      '0 8px 24px var(--color-primary-alpha)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        color:          'var(--color-primary)',
      }}>
        {icon ?? <SearchX size={32} strokeWidth={1.5} />}
      </div>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.01em' }}>
          {title ?? 'لا توجد بيانات'}
        </h3>
        {message && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.5, margin: '0 auto' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
