import {
  useEffect,
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
  referenceType:
    GardenTimingReferenceType

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

  targetDate?:
    string

  onTargetDateChange?:
    (
      value: string,
    ) => void

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

  allowDirectionSwitch?:
    boolean

  direction?:
    GardenTimingCalculatorDirection

  onDirectionChange?:
    (
      direction:
        GardenTimingCalculatorDirection,
    ) => void

  showDateInputs?:
    boolean

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
  const normalizedValue =
    value
      .trim()
      .replace(
        ',',
        '.',
      )


  if (
    !normalizedValue ||
    normalizedValue ===
      '.'
  ) {
    return undefined
  }


  const number =
    Number(
      normalizedValue,
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


function isValidTimingInput(
  value:
    string,
): boolean {
  return /^[0-9]*([.,][0-9]*)?$/.test(
    value,
  )
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
     CONTROLLED / STANDALONE TIMING

     If a parent supplies onTimingChange,
     the parent owns the timing.

     If not, this calculator owns temporary
     timing internally.

     That lets the Calendar "What if?" tool
     work without turning temporary garden
     maths into saved Sprig data.
  ======================================= */

  const isTimingControlled =
    Boolean(
      onTimingChange,
    )


  const [
    internalDaysMin,
    setInternalDaysMin,
  ] =
    useState<number | undefined>(
      daysMin,
    )


  const [
    internalDaysMax,
    setInternalDaysMax,
  ] =
    useState<number | undefined>(
      daysMax,
    )


  const effectiveDaysMin =
    isTimingControlled
      ? daysMin
      : internalDaysMin


  const effectiveDaysMax =
    isTimingControlled
      ? daysMax
      : internalDaysMax


  function setTiming(
    nextMin:
      number | undefined,

    nextMax:
      number | undefined,
  ) {
    if (
      isTimingControlled
    ) {
      onTimingChange?.(
        nextMin,
        nextMax,
      )

      return
    }


    setInternalDaysMin(
      nextMin,
    )

    setInternalDaysMax(
      nextMax,
    )
  }


  /* =======================================
     INPUT TEXT

     Text stays local while the gardener types.

     This avoids mobile browsers rewriting
     <input type="number"> values midway through
     a keystroke.

     Sprig still translates the finished meaning
     into days internally.
  ======================================= */

  const [
    minInputValue,
    setMinInputValue,
  ] =
    useState<string>(
      () =>
        daysToDisplayedValue(
          effectiveDaysMin,
          'days',
        ),
    )


  const [
    maxInputValue,
    setMaxInputValue,
  ] =
    useState<string>(
      () =>
        daysToDisplayedValue(
          effectiveDaysMax,
          'days',
        ),
    )


  const [
    editingMin,
    setEditingMin,
  ] =
    useState(
      false,
    )


  const [
    editingMax,
    setEditingMax,
  ] =
    useState(
      false,
    )


  useEffect(
    () => {
      if (
        editingMin
      ) {
        return
      }


      setMinInputValue(
        daysToDisplayedValue(
          effectiveDaysMin,
          unit,
        ),
      )
    },
    [
      effectiveDaysMin,
      unit,
      editingMin,
    ],
  )


  useEffect(
    () => {
      if (
        editingMax
      ) {
        return
      }


      setMaxInputValue(
        daysToDisplayedValue(
          effectiveDaysMax,
          unit,
        ),
      )
    },
    [
      effectiveDaysMax,
      unit,
      editingMax,
    ],
  )


  function changeMin(
    value:
      string,
  ) {
    if (
      !isValidTimingInput(
        value,
      )
    ) {
      return
    }


    setMinInputValue(
      value,
    )


    const nextMin =
      displayedValueToDays(
        value,
        unit,
      )


    setTiming(
      nextMin,
      effectiveDaysMax,
    )
  }


  function changeMax(
    value:
      string,
  ) {
    if (
      !isValidTimingInput(
        value,
      )
    ) {
      return
    }


    setMaxInputValue(
      value,
    )


    const nextMax =
      displayedValueToDays(
        value,
        unit,
      )


    setTiming(
      effectiveDaysMin,
      nextMax,
    )
  }


  function finishEditingMin() {
    setEditingMin(
      false,
    )


    setMinInputValue(
      daysToDisplayedValue(
        displayedValueToDays(
          minInputValue,
          unit,
        ),
        unit,
      ),
    )
  }


  function finishEditingMax() {
    setEditingMax(
      false,
    )


    setMaxInputValue(
      daysToDisplayedValue(
        displayedValueToDays(
          maxInputValue,
          unit,
        ),
        unit,
      ),
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

          daysMin:
            effectiveDaysMin,

          daysMax:
            effectiveDaysMax,

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
        effectiveDaysMin,
        effectiveDaysMax,
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

            daysMin:
              effectiveDaysMin,

            daysMax:
              effectiveDaysMax,

            knowledgeSource:
              'gardener',
          },
        )
      },
      [
        direction,
        targetDate,
        referenceType,
        effectiveDaysMin,
        effectiveDaysMax,
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
      effectiveDaysMin,
      effectiveDaysMax,
    )


  const timingWeeksLabel =
    formatGardenTimingWeeks(
      effectiveDaysMin,
      effectiveDaysMax,
    )


  const hasTiming =
    effectiveDaysMin !==
      undefined ||
    effectiveDaysMax !==
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

              type="text"

              inputMode="decimal"

              autoComplete="off"

              value={
                minInputValue
              }

              onFocus={() =>
                setEditingMin(
                  true,
                )
              }

              onChange={
                event =>
                  changeMin(
                    event.target.value,
                  )
              }

              onBlur={
                finishEditingMin
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

              type="text"

              inputMode="decimal"

              autoComplete="off"

              value={
                maxInputValue
              }

              onFocus={() =>
                setEditingMax(
                  true,
                )
              }

              onChange={
                event =>
                  changeMax(
                    event.target.value,
                  )
              }

              onBlur={
                finishEditingMax
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