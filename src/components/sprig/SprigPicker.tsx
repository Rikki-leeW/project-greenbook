import {
  useState,
  type ReactNode,
} from 'react'

import labelTall from '../../images/cards/label-tall.png'
import labelShort from '../../images/cards/label-short.png'

import '../../css/components/sprig.css'

import selectionCard from '../../images/cards/selection-card.png'
import tag from '../../images/cards/tag.png'
import tagSelected from '../../images/cards/tag-selected.png'


/* =======================================
   OPTION
======================================= */

interface SprigPickerOption<
  T extends string,
> {
  value: T

  label: string

  subtitle?: string

  meta?: string

  icon?: ReactNode

  /*
   * Optional group used by larger
   * library-style pickers.
   *
   * Examples:
   *
   * Compost & Organic Matter
   * Fertilisers & Plant Food
   * Potting Mixes & Growing Media
   *
   * Ordinary SprigPickers do not need
   * to provide a group.
   */
  group?: string
}


/* =======================================
   PROPS
======================================= */

interface SprigPickerProps<
  T extends string,
> {
  title: string

  emptySummary?: string

  variant?:
    | 'tag'
    | 'label'
    | 'label-tall'

  showTrigger?: boolean

  /*
   * Larger library pickers can ask Sprig
   * to organise their options into groups.
   *
   * Existing pickers remain unchanged
   * when this is false.
   */
  groupOptions?: boolean

  /*
   * Optional preferred order for groups.
   *
   * Any groups not listed here are placed
   * afterwards alphabetically.
   */
  groupOrder?: string[]

  options: SprigPickerOption<T>[]

  selectedValues: T[]

  isOpen: boolean

  onToggleOpen: () => void

  onToggleValue: (
    value: T,
  ) => void

  /*
   * =======================================
   * SPRIG RULE
   * =======================================
   *
   * A picker may contain:
   *
   * 1. Sprig's thoughtfully chosen defaults
   * 2. The gardener's saved additions
   * 3. + Create new...
   *
   * The parent owns the actual saved data.
   * SprigPicker simply provides the reusable
   * create-new experience.
   */

  allowCustomOption?: boolean

  customOptionLabel?: string

  customInputLabel?: string

  customInputPlaceholder?: string

  /*
   * The parent creates and saves the new
   * option, then returns its value.
   *
   * Returning the new value allows
   * SprigPicker to select it immediately.
   */
  onCreateCustomOption?: (
    label: string,
  ) => T | undefined
}


/* =======================================
   COMPONENT
======================================= */

export default function SprigPicker<
  T extends string,
>({
  title,

  emptySummary =
    "Choose today's moments",

  variant = 'tag',

  showTrigger = true,

  groupOptions = false,

  groupOrder = [],

  options,

  selectedValues,

  isOpen,

  onToggleOpen,

  onToggleValue,

  allowCustomOption = false,

  customOptionLabel =
    'Create new...',

  customInputLabel =
    'What would you like to call it?',

  customInputPlaceholder =
    'Give it a name...',

  onCreateCustomOption,
}: SprigPickerProps<T>) {
  const [
    isCustomEntryOpen,
    setIsCustomEntryOpen,
  ] = useState(false)

  const [
    customOptionName,
    setCustomOptionName,
  ] = useState('')


  /* =======================================
     SELECTED SUMMARY
  ======================================= */

  const selectedLabels =
    options
      .filter((option) =>
        selectedValues.includes(
          option.value,
        ),
      )
      .map(
        (option) =>
          option.label,
      )


  const summary =
    selectedLabels.length === 0
      ? emptySummary
      : selectedLabels.join(
          ' • ',
        )


  /* =======================================
     ALPHABETICAL OPTIONS
  ======================================= */

  const alphabeticalOptions =
    [...options].sort(
      (optionA, optionB) =>
        optionA.label.localeCompare(
          optionB.label,
          undefined,
          {
            sensitivity:
              'base',
          },
        ),
    )


  /* =======================================
     GROUPED OPTIONS
  ======================================= */

  const groupedOptions =
    alphabeticalOptions.reduce<
      Record<
        string,
        SprigPickerOption<T>[]
      >
    >(
      (
        groups,
        option,
      ) => {
        const groupName =
          option.group?.trim() ||
          'Other'

        if (
          !groups[groupName]
        ) {
          groups[groupName] =
            []
        }

        groups[groupName].push(
          option,
        )

        return groups
      },
      {},
    )


  /*
   * Groups explicitly listed in groupOrder
   * appear first.
   *
   * Everything else follows alphabetically.
   */

  const orderedGroupNames =
    Object.keys(
      groupedOptions,
    ).sort(
      (
        groupA,
        groupB,
      ) => {
        const indexA =
          groupOrder.indexOf(
            groupA,
          )

        const indexB =
          groupOrder.indexOf(
            groupB,
          )


        const groupAHasOrder =
          indexA !== -1

        const groupBHasOrder =
          indexB !== -1


        if (
          groupAHasOrder &&
          groupBHasOrder
        ) {
          return (
            indexA -
            indexB
          )
        }


        if (
          groupAHasOrder
        ) {
          return -1
        }


        if (
          groupBHasOrder
        ) {
          return 1
        }


        return groupA.localeCompare(
          groupB,
          undefined,
          {
            sensitivity:
              'base',
          },
        )
      },
    )


  /* =======================================
     CUSTOM OPTION
  ======================================= */

  function closeCustomEntry() {
    setCustomOptionName('')

    setIsCustomEntryOpen(
      false,
    )
  }


  function handleCreateCustomOption() {
    const trimmedName =
      customOptionName.trim()

    if (
      !trimmedName ||
      !onCreateCustomOption
    ) {
      return
    }


    /*
     * The parent creates the real saved
     * record/value and gives its value
     * back to this picker.
     */

    const newValue =
      onCreateCustomOption(
        trimmedName,
      )


    /*
     * Newly-created options should become
     * selected immediately.
     */

    if (newValue) {
      onToggleValue(
        newValue,
      )
    }


    closeCustomEntry()
  }


  /* =======================================
     OPTION RENDERER
  ======================================= */

  function renderOption(
    option:
      SprigPickerOption<T>,
  ) {
    const isSelected =
      selectedValues.includes(
        option.value,
      )


    const optionClassName = [
      'sprig-picker-option',

      isSelected
        ? 'is-selected'
        : '',

      variant === 'label'
        ? 'sprig-picker-option-label'
        : '',

      variant ===
      'label-tall'
        ? 'sprig-picker-option-label-tall'
        : '',
    ]
      .filter(Boolean)
      .join(' ')


    return (
      <button
        key={
          option.value
        }
        type="button"
        className={
          optionClassName
        }
        onClick={() =>
          onToggleValue(
            option.value,
          )
        }
        aria-pressed={
          isSelected
        }
        style={{
          backgroundImage:
            `url(${
              variant ===
              'label'
                ? labelShort

                : variant ===
                  'label-tall'
                  ? labelTall

                  : isSelected
                    ? tagSelected
                    : tag
            })`,
        }}
      >
        {option.icon && (
          <span className="sprig-picker-option-icon">
            {
              option.icon
            }
          </span>
        )}


        <span className="sprig-picker-option-text">
          <span className="sprig-picker-option-title">
            {
              option.label
            }
          </span>


          {option.subtitle && (
            <span className="sprig-picker-option-subtitle">
              {
                option.subtitle
              }
            </span>
          )}


          {option.meta && (
            <span className="sprig-picker-option-meta">
              {
                option.meta
              }
            </span>
          )}
        </span>


        {isSelected && (
          <span
            className="sprig-picker-option-check"
            aria-hidden="true"
          >
            ✓
          </span>
        )}
      </button>
    )
  }


  /* =======================================
     RENDER
  ======================================= */

  return (
    <section className="sprig-picker">
      <h5 className="sprig-picker-label">
        {title}
      </h5>


      {/* =======================================
          PICKER TRIGGER
      ======================================= */}

      {showTrigger && (
        <button
          type="button"
          className="sprig-picker-trigger"
          onClick={
            onToggleOpen
          }
          aria-expanded={
            isOpen
          }
          style={{
            backgroundImage:
              `url(${selectionCard})`,
          }}
        >
          <span className="sprig-picker-summary">
            {summary}
          </span>


          <span
            className="sprig-picker-arrow"
            aria-hidden="true"
          >
            {isOpen
              ? '⌃'
              : '⌄'}
          </span>
        </button>
      )}


      {/* =======================================
          PICKER CONTENT
      ======================================= */}

      {isOpen && (
        <div className="sprig-picker-panel">

          


          {/* =====================================
              STANDARD PICKER

              Existing SprigPickers continue
              behaving exactly as before.

              The only improvement is that their
              options are alphabetical.
          ===================================== */}

          {!groupOptions && (
            <div className="sprig-picker-options">
              {alphabeticalOptions.map(
                renderOption,
              )}
            </div>
          )}


          {/* =====================================
              GROUPED LIBRARY PICKER
          ===================================== */}

          {groupOptions && (
            <div className="sprig-picker-groups">
              {orderedGroupNames.map(
                (
                  groupName,
                ) => (
                  <section
                    key={
                      groupName
                    }
                    className="sprig-picker-group"
                  >
                    <h6 className="sprig-picker-group-title">
                      {
                        groupName
                      }
                    </h6>


                    <div className="sprig-picker-options">
                      {
                        groupedOptions[
                          groupName
                        ].map(
                          renderOption,
                        )
                      }
                    </div>
                  </section>
                ),
              )}
            </div>
          )}


          {/* =======================================
              CREATE NEW OPTION
          ======================================= */}

          {allowCustomOption &&
            onCreateCustomOption && (
            <div className="sprig-picker-custom">
              {!isCustomEntryOpen ? (
                <button
                  type="button"
                  className="sprig-picker-custom-trigger"
                  onClick={() =>
                    setIsCustomEntryOpen(
                      true,
                    )
                  }
                >
                  ＋ {customOptionLabel}
                </button>
              ) : (
                <div className="sprig-picker-custom-entry">
                  <label className="sprig-picker-custom-label">
                    {
                      customInputLabel
                    }


                    <input
                      type="text"
                      value={
                        customOptionName
                      }
                      onChange={(
                        event,
                      ) =>
                        setCustomOptionName(
                          event.target
                            .value,
                        )
                      }
                      placeholder={
                        customInputPlaceholder
                      }
                      autoFocus
                      onKeyDown={(
                        event,
                      ) => {
                        if (
                          event.key ===
                          'Enter'
                        ) {
                          event.preventDefault()

                          handleCreateCustomOption()
                        }


                        if (
                          event.key ===
                          'Escape'
                        ) {
                          closeCustomEntry()
                        }
                      }}
                    />
                  </label>


                  <div className="sprig-picker-custom-actions">
                    <button
                      type="button"
                      className="sprig-picker-custom-cancel"
                      onClick={
                        closeCustomEntry
                      }
                    >
                      Cancel
                    </button>


                    <button
                      type="button"
                      className="sprig-picker-custom-save"
                      onClick={
                        handleCreateCustomOption
                      }
                      disabled={
                        !customOptionName.trim()
                      }
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}