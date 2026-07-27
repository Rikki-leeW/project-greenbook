import type { ReactNode } from 'react'

import '../../css/components/sprig.css'

import selectionCard from '../../images/cards/selection-card.png'
import tag from '../../images/cards/tag.png'
import tagSelected from '../../images/cards/tag-selected.png'

interface SprigPickerOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface SprigPickerProps<T extends string> {
  title: string
  options: SprigPickerOption<T>[]
  selectedValues: T[]
  isOpen: boolean
  onToggleOpen: () => void
  onToggleValue: (value: T) => void
}

export default function SprigPicker<
  T extends string,
>({
  title,
  options,
  selectedValues,
  isOpen,
  onToggleOpen,
  onToggleValue,
}: SprigPickerProps<T>) {
  const selectedLabels = options
    .filter((option) =>
      selectedValues.includes(option.value),
    )
    .map((option) => option.label)

  const summary =
    selectedLabels.length === 0
      ? "Choose today's moments"
      : selectedLabels.join(' • ')

  return (
    <section className="sprig-picker">
      <h5 className="sprig-picker-label">
        {title}
      </h5>

      <button
        type="button"
        className="sprig-picker-trigger"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        style={{
          backgroundImage: `url(${selectionCard})`,
        }}
      >
        <span className="sprig-picker-summary">
          {summary}
        </span>

        <span
          className="sprig-picker-arrow"
          aria-hidden="true"
        >
          {isOpen ? '⌃' : '⌄'}
        </span>
      </button>

      {isOpen && (
        <div className="sprig-picker-panel">
          <div className="sprig-picker-options">
            {options.map((option) => {
              const isSelected =
                selectedValues.includes(
                  option.value,
                )

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`sprig-picker-option ${
                    isSelected
                      ? 'is-selected'
                      : ''
                  }`}
                  onClick={() =>
                    onToggleValue(option.value)
                  }
                  aria-pressed={isSelected}
                  style={{
                    backgroundImage: `url(${
                      isSelected
                        ? tagSelected
                        : tag
                    })`,
                  }}
                >
                  {option.icon && (
                    <span className="sprig-picker-option-icon">
                      {option.icon}
                    </span>
                  )}

                  <span>{option.label}</span>

                  <span
                    className="sprig-picker-mark"
                    aria-hidden="true"
                  >
                    {isSelected ? '✓' : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}