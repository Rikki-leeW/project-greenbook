import {
    useMemo,
    useState,
  } from 'react'
  
  import type {
    GardenTimingReferenceType,
  } from '../utils/gardenTimingUtils'
  
  import {
    calculateGardenReverseTimingWindow,
    calculateGardenTimingWindow,
    calculateGardenTimingWindowFromRange,
    formatGardenReverseTimingWindow,
    formatGardenTimingDays,
    formatGardenTimingWeeks,
    formatGardenTimingWindow,
    gardenWeeksToDays,
    getGardenTimingActionLabel,
    getGardenTimingReferenceLabel,
  } from '../utils/gardenTimingUtils'
  
  
  /* =======================================
     TYPES
  ======================================= */
  
  export type GardenTimingCalculatorDirection =
    | 'forward'
    | 'reverse'
  
  
  export type GardenTimingCalculatorUnit =
    | 'days'
    | 'weeks'
  
  
  interface GardenTimingCalculatorProps {
    /*
     * The garden milestone from which timing
     * is being counted.
     *
     * Examples:
     *
     * sowing
     * planting
     * planting out
     */
    referenceType:
      GardenTimingReferenceType
  
  
    /*
     * FORWARD CALCULATION
     *
     * "If I start here,
     *  when might it be ready?"
     */
    referenceDate?:
      string
  
    referenceEndDate?:
      string
  
    onReferenceDateChange?:
      (
        value: string,
      ) => void
  
    onReferenceEndDateChange?:
      (
        value: string,
      ) => void
  
  
    /*
     * REVERSE CALCULATION
     *
     * "If I want it ready here,
     *  when might I need to start?"
     */
    targetDate?:
      string
  
    onTargetDateChange?:
      (
        value: string,
      ) => void
  
  
    /*
     * Timing is always communicated back to
     * Sprig as DAYS.
     *
     * The gardener can still enter weeks.
     *
     * This gives Sprig one consistent internal
     * timing language while allowing the UI to
     * speak naturally.
     */
    daysMin?:
      number
  
    daysMax?:
      number
  
    onTimingChange?:
      (
        daysMin:
          number | undefined,
  
        daysMax:
          number | undefined,
      ) => void
  
  
    /*
     * Standalone What if? can switch direction.
     *
     * Calendar Plans can choose to keep only
     * the forward calculator visible.
     */
    allowDirectionSwitch?:
      boolean
  
    direction?:
      GardenTimingCalculatorDirection
  
    onDirectionChange?:
      (
        direction:
          GardenTimingCalculatorDirection,
      ) => void
  
  
    /*
     * Calendar can already own its date fields.
     *
     * Satchel's standalone calculator will want
     * the calculator itself to show them.
     */
    showDateInputs?:
      boolean
  
  
    /*
     * Optional wording differences depending on
     * where the calculator appears.
     */
    title?:
      string
  
    intro?:
      string
  
    compact?:
      boolean
  }
  
  
  /* =======================================
     NUMBER HELPERS
  ======================================= */
  
  function parsePositiveNumber(
    value:
      string,
  ): number | undefined {
    if (
      !value.trim()
    ) {
      return undefined
    }
  
  
    const number =
      Number(
        value,
      )
  
  
    if (
      !Number.isFinite(
        number,
      ) ||
      number < 0
    ) {
      return undefined
    }
  
  
    return number
  }
  
  
  function formatInputNumber(
    value:
      number | undefined,
  ): string {
    if (
      value === undefined
    ) {
      return ''
    }
  
  
    if (
      Number.isInteger(
        value,
      )
    ) {
      return String(
        value,
      )
    }
  
  
    return String(
      Math.round(
        value * 10,
      ) / 10,
    )
  }
  
  
  /* =======================================
     CONVERSION HELPERS
  ======================================= */
  
  function daysToDisplayedValue(
    days:
      number | undefined,
    unit:
      GardenTimingCalculatorUnit,
  ): string {
    if (
      days === undefined
    ) {
      return ''
    }
  
  
    if (
      unit ===
        'days'
    ) {
      return formatInputNumber(
        days,
      )
    }
  
  
    return formatInputNumber(
      days / 7,
    )
  }
  
  
  function displayedValueToDays(
    value:
      string,
    unit:
      GardenTimingCalculatorUnit,
  ): number | undefined {
    const number =
      parsePositiveNumber(
        value,
      )
  
  
    if (
      number === undefined
    ) {
      return undefined
    }
  
  
    if (
      unit ===
        'days'
    ) {
      return Math.round(
        number,
      )
    }
  
  
    return gardenWeeksToDays(
      number,
    )
  }
  
  
  /* =======================================
     COMPONENT
  ======================================= */
  
  function GardenTimingCalculator({
    referenceType,
  
    referenceDate,
    referenceEndDate,
  
    onReferenceDateChange,
    onReferenceEndDateChange,
  
    targetDate,
    onTargetDateChange,
  
    daysMin,
    daysMax,
  
    onTimingChange,
  
    allowDirectionSwitch = true,
  
    direction:
      controlledDirection,
  
    onDirectionChange,
  
    showDateInputs = true,
  
    title =
      'What might follow?',
  
    intro =
      'Play with the dates and growing time. Sprig will do the calendar maths as you go.',
  
    compact = false,
  }: GardenTimingCalculatorProps) {
  
    /* =======================================
       DIRECTION
    ======================================= */
  
    const [
      internalDirection,
      setInternalDirection,
    ] =
      useState<GardenTimingCalculatorDirection>(
        controlledDirection ??
        'forward',
      )
  
  
    const direction =
      controlledDirection ??
      internalDirection
  
  
    function chooseDirection(
      nextDirection:
        GardenTimingCalculatorDirection,
    ) {
      if (
        controlledDirection ===
        undefined
      ) {
        setInternalDirection(
          nextDirection,
        )
      }
  
  
      onDirectionChange?.(
        nextDirection,
      )
    }
  
  
    /* =======================================
       UNIT
    ======================================= */
  
    const [
      unit,
      setUnit,
    ] =
      useState<GardenTimingCalculatorUnit>(
        'days',
      )
  
  
    /* =======================================
       INPUT VALUES
    ======================================= */
  
    const minInputValue =
      useMemo(
        () =>
          daysToDisplayedValue(
            daysMin,
            unit,
          ),
        [
          daysMin,
          unit,
        ],
      )
  
  
    const maxInputValue =
      useMemo(
        () =>
          daysToDisplayedValue(
            daysMax,
            unit,
          ),
        [
          daysMax,
          unit,
        ],
      )
  
  
    function changeMin(
      value:
        string,
    ) {
      const nextMin =
        displayedValueToDays(
          value,
          unit,
        )
  
  
      onTimingChange?.(
        nextMin,
        daysMax,
      )
    }
  
  
    function changeMax(
      value:
        string,
    ) {
      const nextMax =
        displayedValueToDays(
          value,
          unit,
        )
  
  
      onTimingChange?.(
        daysMin,
        nextMax,
      )
    }
  
  
    /* =======================================
       FORWARD CALCULATION
    ======================================= */
  
    const forwardWindow =
      useMemo(
        () => {
          if (
            direction !==
              'forward' ||
            !referenceDate
          ) {
            return undefined
          }
  
  
          const assumption = {
            referenceType,
  
            daysMin,
  
            daysMax,
  
            knowledgeSource:
              'gardener' as const,
          }
  
  
          if (
            referenceEndDate &&
            referenceEndDate >=
              referenceDate
          ) {
            return calculateGardenTimingWindowFromRange(
              referenceDate,
              referenceEndDate,
              assumption,
            )
          }
  
  
          return calculateGardenTimingWindow(
            referenceDate,
            assumption,
          )
        },
        [
          direction,
          referenceType,
          referenceDate,
          referenceEndDate,
          daysMin,
          daysMax,
        ],
      )
  
  
    /* =======================================
       REVERSE CALCULATION
    ======================================= */
  
    const reverseWindow =
      useMemo(
        () => {
          if (
            direction !==
              'reverse' ||
            !targetDate
          ) {
            return undefined
          }
  
  
          return calculateGardenReverseTimingWindow(
            targetDate,
            {
              referenceType,
  
              daysMin,
  
              daysMax,
  
              knowledgeSource:
                'gardener',
            },
          )
        },
        [
          direction,
          targetDate,
          referenceType,
          daysMin,
          daysMax,
        ],
      )
  
  
    /* =======================================
       DISPLAY VALUES
    ======================================= */
  
    const forwardResult =
      formatGardenTimingWindow(
        forwardWindow,
      )
  
  
    const reverseResult =
      formatGardenReverseTimingWindow(
        reverseWindow,
      )
  
  
    const timingDaysLabel =
      formatGardenTimingDays(
        daysMin,
        daysMax,
      )
  
  
    const timingWeeksLabel =
      formatGardenTimingWeeks(
        daysMin,
        daysMax,
      )
  
  
    const hasTiming =
      daysMin !==
        undefined ||
      daysMax !==
        undefined
  
  
    const referenceLabel =
      getGardenTimingReferenceLabel(
        referenceType,
      )
  
  
    const actionLabel =
      getGardenTimingActionLabel(
        referenceType,
      )
  
  
    /* =======================================
       UI
    ======================================= */
  
    return (
      <section
        className={`sprig-timing-calculator${
          compact
            ? ' sprig-timing-calculator--compact'
            : ''
        }`}
      >
        <div className="sprig-timing-calculator-heading">
          <p className="section-label">
            Garden maths
          </p>
  
          <h3>
            {title}
          </h3>
  
          <p>
            {intro}
          </p>
        </div>
  
  
        {/* =======================================
            DIRECTION
        ======================================= */}
  
        {allowDirectionSwitch && (
          <div className="sprig-timing-calculator-direction">
            <button
              type="button"
  
              className={`sprig-calendar-plan-kind${
                direction ===
                  'forward'
                  ? ' sprig-calendar-plan-kind--selected'
                  : ''
              }`}
  
              aria-pressed={
                direction ===
                  'forward'
              }
  
              onClick={() =>
                chooseDirection(
                  'forward',
                )
              }
            >
              <span aria-hidden="true">
                🌱
              </span>
  
              If I start here…
            </button>
  
  
            <button
              type="button"
  
              className={`sprig-calendar-plan-kind${
                direction ===
                  'reverse'
                  ? ' sprig-calendar-plan-kind--selected'
                  : ''
              }`}
  
              aria-pressed={
                direction ===
                  'reverse'
              }
  
              onClick={() =>
                chooseDirection(
                  'reverse',
                )
              }
            >
              <span aria-hidden="true">
                🧺
              </span>
  
              I want it ready…
            </button>
          </div>
        )}
  
  
        {/* =======================================
            FORWARD DATE
        ======================================= */}
  
        {direction ===
          'forward' &&
          showDateInputs && (
          <div className="sprig-timing-calculator-dates">
            <div className="sprig-calendar-plan-field">
              <label htmlFor="sprig-timing-reference-date">
                {referenceLabel} date
              </label>
  
              <input
                id="sprig-timing-reference-date"
  
                type="date"
  
                value={
                  referenceDate ??
                  ''
                }
  
                onChange={
                  event =>
                    onReferenceDateChange?.(
                      event.target.value,
                    )
                }
              />
            </div>
  
  
            {onReferenceEndDateChange && (
              <div className="sprig-calendar-plan-field">
                <label htmlFor="sprig-timing-reference-end-date">
                  Latest possible date
                  <span className="sprig-calendar-plan-optional">
                    {' '}
                    optional
                  </span>
                </label>
  
                <input
                  id="sprig-timing-reference-end-date"
  
                  type="date"
  
                  min={
                    referenceDate ||
                    undefined
                  }
  
                  value={
                    referenceEndDate ??
                    ''
                  }
  
                  onChange={
                    event =>
                      onReferenceEndDateChange(
                        event.target.value,
                      )
                  }
                />
              </div>
            )}
          </div>
        )}
  
  
        {/* =======================================
            REVERSE TARGET DATE
        ======================================= */}
  
        {direction ===
          'reverse' &&
          showDateInputs && (
          <div className="sprig-calendar-plan-field">
            <label htmlFor="sprig-timing-target-date">
              When would you like it ready?
            </label>
  
            <input
              id="sprig-timing-target-date"
  
              type="date"
  
              value={
                targetDate ??
                ''
              }
  
              onChange={
                event =>
                  onTargetDateChange?.(
                    event.target.value,
                  )
              }
            />
          </div>
        )}
  
  
        {/* =======================================
            DURATION
        ======================================= */}
  
        <div className="sprig-timing-calculator-duration">
  
          <div className="sprig-timing-calculator-duration-heading">
            <div>
              <p className="section-label">
                Growing time
              </p>
  
              <p>
                How long do you expect it to take?
              </p>
            </div>
  
  
            <div className="sprig-timing-calculator-unit">
              <button
                type="button"
  
                className={`sprig-calendar-plan-kind${
                  unit ===
                    'days'
                    ? ' sprig-calendar-plan-kind--selected'
                    : ''
                }`}
  
                aria-pressed={
                  unit ===
                    'days'
                }
  
                onClick={() =>
                  setUnit(
                    'days',
                  )
                }
              >
                Days
              </button>
  
  
              <button
                type="button"
  
                className={`sprig-calendar-plan-kind${
                  unit ===
                    'weeks'
                    ? ' sprig-calendar-plan-kind--selected'
                    : ''
                }`}
  
                aria-pressed={
                  unit ===
                    'weeks'
                }
  
                onClick={() =>
                  setUnit(
                    'weeks',
                  )
                }
              >
                Weeks
              </button>
            </div>
          </div>
  
  
          <div className="sprig-calendar-plan-date-grid">
            <div className="sprig-calendar-plan-field">
              <label htmlFor="sprig-timing-min">
                Earliest
                <span className="sprig-calendar-plan-optional">
                  {' '}
                  {unit}
                </span>
              </label>
  
              <input
                id="sprig-timing-min"
  
                type="number"
  
                min="0"
  
                step={
                  unit ===
                    'weeks'
                    ? '0.1'
                    : '1'
                }
  
                inputMode="decimal"
  
                value={
                  minInputValue
                }
  
                onChange={
                  event =>
                    changeMin(
                      event.target.value,
                    )
                }
  
                placeholder={
                  unit ===
                    'weeks'
                    ? 'e.g. 13'
                    : 'e.g. 90'
                }
              />
            </div>
  
  
            <div className="sprig-calendar-plan-field">
              <label htmlFor="sprig-timing-max">
                Later edge
                <span className="sprig-calendar-plan-optional">
                  {' '}
                  {unit}
                </span>
              </label>
  
              <input
                id="sprig-timing-max"
  
                type="number"
  
                min="0"
  
                step={
                  unit ===
                    'weeks'
                    ? '0.1'
                    : '1'
                }
  
                inputMode="decimal"
  
                value={
                  maxInputValue
                }
  
                onChange={
                  event =>
                    changeMax(
                      event.target.value,
                    )
                }
  
                placeholder={
                  unit ===
                    'weeks'
                    ? 'e.g. 16'
                    : 'e.g. 110'
                }
              />
            </div>
          </div>
  
  
          {!hasTiming && (
            <p className="form-whisper">
              Enter one number for a rough estimate,
              or both for a possible range.
            </p>
          )}
  
  
          {hasTiming && (
            <div className="sprig-timing-calculator-conversion">
              <span>
                {timingDaysLabel}
              </span>
  
              {timingWeeksLabel && (
                <>
                  <span aria-hidden="true">
                    ·
                  </span>
  
                  <span>
                    {timingWeeksLabel}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
  
  
        {/* =======================================
            FORWARD RESULT
        ======================================= */}
  
        {direction ===
          'forward' && (
          <div className="sprig-timing-calculator-result">
  
            <p className="section-label">
              Possible harvest
            </p>
  
  
            {forwardResult ? (
              <>
                <h3>
                  {forwardResult}
                </h3>
  
                <p>
                  If you {actionLabel}{' '}
                  {referenceDate
                    ? `on ${referenceLabel.toLowerCase()} date shown above`
                    : 'on the date you choose'}
                  , this is the window your timing estimate points to.
                </p>
              </>
            ) : (
              <>
                <h3>
                  Waiting for the pieces
                </h3>
  
                <p>
                  Give Sprig a starting date and expected
                  growing time and the possible dates will
                  appear here immediately.
                </p>
              </>
            )}
          </div>
        )}
  
  
        {/* =======================================
            REVERSE RESULT
        ======================================= */}
  
        {direction ===
          'reverse' && (
          <div className="sprig-timing-calculator-result">
  
            <p className="section-label">
              Consider starting
            </p>
  
  
            {reverseResult ? (
              <>
                <h3>
                  {reverseResult}
                </h3>
  
                <p>
                  Based on your expected growing time,
                  this is the window Sprig would consider
                  for {actionLabel}ing.
                </p>
              </>
            ) : (
              <>
                <h3>
                  Pick your finish line
                </h3>
  
                <p>
                  Choose when you would like the crop ready
                  and enter the expected growing time.
                  Sprig will count backwards for you.
                </p>
              </>
            )}
          </div>
        )}
  
  
        {/* =======================================
            PHILOSOPHY
        ======================================= */}
  
        <p className="form-whisper sprig-timing-calculator-note">
          This is garden maths, not a recorded event.
          Change the dates as much as you like.
        </p>
      </section>
    )
  }
  
  export default GardenTimingCalculator