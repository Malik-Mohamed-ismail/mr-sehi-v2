import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { fadeIn } from '../../lib/animations'

interface Props {
  open:      boolean
  title:     string
  message:   string
  onConfirm: () => void
  onCancel:  () => void
  loading?:  boolean
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20
        }}>
          {/* Backdrop */}
          <motion.div
            variants={fadeIn} initial="initial" animate="animate" exit="exit"
            onClick={onCancel}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(7,8,15,0.70)', backdropFilter: 'blur(4px)',
              zIndex: -1
            }}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
            style={{
              position: 'relative',
              width: 400, maxWidth: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: 28,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--color-danger-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-danger)',
                }}>
                  <AlertTriangle size={18}/>
                </div>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onCancel} aria-label="إغلاق">
                <X size={16}/>
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>إلغاء</button>
              <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
                {loading ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
