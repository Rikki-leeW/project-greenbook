import type { ReactNode } from 'react'
import { useModalDialog } from '../../hooks/useModalDialog'


interface SprigQuickPeekProps {
  isOpen: boolean
  eyebrow?: string
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
  onOpenFull?: () => void
  openFullLabel?: string
}


export default function SprigQuickPeek({
  isOpen,
  eyebrow,
  title,
  subtitle,
  children,
  onClose,
  onOpenFull,
  openFullLabel = 'Open full record →',
}: SprigQuickPeekProps) {
  const dialogRef = useModalDialog<HTMLElement>(onClose, isOpen)

  if (!isOpen) {
    return null
  }


  return (
    <div
      className="sprig-quick-peek-backdrop"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        className="sprig-quick-peek-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <button
          data-dialog-initial-focus
          type="button"
          className="sprig-quick-peek-close"
          onClick={onClose}
          aria-label="Close quick peek"
        >
          ×
        </button>


        {eyebrow && (
          <p className="sprig-quick-peek-eyebrow">
            {eyebrow}
          </p>
        )}


        <h2 className="sprig-quick-peek-title">
          {title}
        </h2>


        {subtitle && (
          <p className="sprig-quick-peek-subtitle">
            {subtitle}
          </p>
        )}


        <div className="sprig-quick-peek-content">
          {children}
        </div>


        {onOpenFull && (
          <div className="sprig-quick-peek-actions">
            <button
              type="button"
              className="text-button"
              onClick={onOpenFull}
            >
              {openFullLabel}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
