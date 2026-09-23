import type { ReactNode } from 'react'

import '../../css/components/sprig.css'

import selectionCard from '../../images/cards/selection-card.png'
import selectionCardSelected from '../../images/cards/selection-card-selected.png'

interface SelectionCardProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  appearance?: 'illustrated' | 'control'
  isSelected?: boolean
  isDisabled?: boolean
  onClick: () => void
}

export default function SelectionCard({
  title,
  subtitle,
  icon,
  appearance = 'illustrated',
  isSelected = false,
  isDisabled = false,
  onClick,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      className={`sprig-choice-card sprig-choice-card--${appearance} ${
        isSelected ? 'is-selected' : ''
      }`}
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
      style={appearance === 'illustrated' ? {
        backgroundImage: `url(${
          isSelected
            ? selectionCardSelected
            : selectionCard
        })`,
      } : undefined}
    >
      {icon && (
        <span className="sprig-choice-card-icon">
          {icon}
        </span>
      )}

      <span className="sprig-choice-card-text">
        <span className="sprig-choice-card-title">
          {title}
        </span>

        {subtitle && (
          <span className="sprig-choice-card-subtitle">
            {subtitle}
          </span>
        )}
      </span>
    </button>
  )
}
