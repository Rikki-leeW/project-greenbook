import type { ReactNode } from 'react'


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

  if (!isOpen) {
    return null
  }


  return (
    <div
      className="sprig-quick-peek-backdrop"
      onClick={onClose}
    >
      <section
        className="sprig-quick-peek-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <button
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