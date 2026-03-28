import { motion } from 'framer-motion'

interface TableSkeletonProps {
  rows?:    number
  columns?: number
}

/**
 * Animated skeleton placeholder for tables while data is loading.
 * Renders `rows` rows with `columns` cells each.
 */
export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div style={{ width: '100%', overflow: 'hidden', padding: 8 }}>
      {/* Header skeleton */}
      <div style={{
        display:       'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap:           16,
        padding:       '16px 20px',
        borderBottom:  '1px solid var(--border-color)',
        marginBottom:  8,
        background:    'var(--bg-surface-2)',
        borderRadius:  'var(--radius-md) var(--radius-md) 0 0',
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 16, borderRadius: 'var(--radius-sm)', opacity: 0.6 }} />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, row) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: row * 0.05 }}
          key={row}
          style={{
            display:             'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap:                 16,
            padding:             '18px 20px',
            borderBottom:        '1px solid var(--border-color)',
          }}
        >
          {Array.from({ length: columns }).map((_, col) => (
            <div
              key={col}
              className="skeleton"
              style={{
                height:       20,
                borderRadius: 'var(--radius-sm)',
                width:        col === 0 ? '60%' : col === columns - 1 ? '40%' : '80%',
              }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  )
}
