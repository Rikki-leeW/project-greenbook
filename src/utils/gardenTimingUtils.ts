/* =======================================
   SPRIG GARDEN TIMING
======================================= */

/*
 * Sprig should do the garden maths without
 * pretending it knows the garden.
 *
 *
 * This utility owns DERIVED garden timing.
 *
 * It does not own:
 *
 * - Plant Stories
 * - Garden Plans
 * - Harvest Records
 * - Calendar records
 * - Plant Reference knowledge
 *
 *
 * It accepts known timing information and
 * calculates what that information means.
 *
 *
 * Sprig's timing path:
 *
 * Gardener estimate
 *        ↓
 * Real garden history
 *        ↓
 * Sprig-derived garden patterns
 *        ↓
 * Optional future intelligence
 *
 *
 * Important:
 *
 * INPUTS may be stored.
 *
 * CALCULATED DATES should normally be
 * derived.
 */


/* =======================================
   TIMING REFERENCE
======================================= */

export type GardenTimingReferenceType =
  | 'sown'
  | 'planted'
  | 'planted-out'
  | 'garden-event'
  | 'custom-date'


/* =======================================
   TIMING KNOWLEDGE SOURCE
======================================= */

export type GardenTimingKnowledgeSource =
  | 'gardener'
  | 'sprig-history'
  | 'reference'
  | 'unknown'


/* =======================================
   TIMING ASSUMPTION
======================================= */

export interface GardenTimingAssumption {
  referenceType:
    GardenTimingReferenceType

  daysMin?: number

  daysMax?: number

  knowledgeSource?:
    GardenTimingKnowledgeSource

  evidenceCount?: number
}


/* =======================================
   FORWARD TIMING WINDOW
======================================= */

export interface GardenTimingWindow {
  referenceDate:
    string

  earliestDate?:
    string

  laterDate?:
    string

  daysMin?:
    number

  daysMax?:
    number

  referenceType:
    GardenTimingReferenceType

  knowledgeSource:
    GardenTimingKnowledgeSource

  evidenceCount?:
    number
}


/* =======================================
   REVERSE TIMING WINDOW
======================================= */

/*
 * Reverse timing answers:
 *
 * "If I want this around HERE,
 *  when might I need to begin?"
 *
 *
 * Example:
 *
 * desired harvest:
 * 20 December
 *
 * duration:
 * 90–110 days
 *
 * earliest sensible start:
 * desired date - 110 days
 *
 * latest sensible start:
 * desired date - 90 days
 */

export interface GardenReverseTimingWindow {
  targetDate:
    string

  earliestStartDate?:
    string

  latestStartDate?:
    string

  daysMin?:
    number

  daysMax?:
    number

  referenceType:
    GardenTimingReferenceType

  knowledgeSource:
    GardenTimingKnowledgeSource

  evidenceCount?:
    number
}


/* =======================================
   DATE PARTS
======================================= */

interface DateParts {
  year:
    number

  month:
    number

  day:
    number
}


/* =======================================
   SAFE NUMBER
======================================= */

function normalisePositiveDayValue(
  value:
    number | undefined,
): number | undefined {
  if (
    value === undefined ||
    !Number.isFinite(
      value,
    )
  ) {
    return undefined
  }


  const rounded =
    Math.round(
      value,
    )


  if (
    rounded < 0
  ) {
    return undefined
  }


  return rounded
}


/* =======================================
   NORMALISE TIMING RANGE
======================================= */

export function normaliseTimingRange(
  daysMin?: number,
  daysMax?: number,
): {
  daysMin?: number
  daysMax?: number
} {
  const cleanMin =
    normalisePositiveDayValue(
      daysMin,
    )

  const cleanMax =
    normalisePositiveDayValue(
      daysMax,
    )


  if (
    cleanMin === undefined &&
    cleanMax === undefined
  ) {
    return {}
  }


  if (
    cleanMin !== undefined &&
    cleanMax === undefined
  ) {
    return {
      daysMin:
        cleanMin,
    }
  }


  if (
    cleanMin === undefined &&
    cleanMax !== undefined
  ) {
    return {
      daysMax:
        cleanMax,
    }
  }


  if (
    cleanMin !== undefined &&
    cleanMax !== undefined
  ) {
    return {
      daysMin:
        Math.min(
          cleanMin,
          cleanMax,
        ),

      daysMax:
        Math.max(
          cleanMin,
          cleanMax,
        ),
    }
  }


  return {}
}


/* =======================================
   PARSE DATE-ONLY VALUE
======================================= */

/*
 * Sprig stores garden dates as YYYY-MM-DD.
 *
 * We parse date-only values ourselves so
 * timezone behaviour cannot move a garden
 * date backwards or forwards.
 */

function parseDateOnly(
  value:
    string,
): DateParts | undefined {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/
      .exec(
        value,
      )


  if (
    !match
  ) {
    return undefined
  }


  const year =
    Number(
      match[1],
    )

  const month =
    Number(
      match[2],
    )

  const day =
    Number(
      match[3],
    )


  if (
    !Number.isInteger(
      year,
    ) ||
    !Number.isInteger(
      month,
    ) ||
    !Number.isInteger(
      day,
    ) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return undefined
  }


  const testDate =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    )


  if (
    testDate.getUTCFullYear() !==
      year ||
    testDate.getUTCMonth() !==
      month - 1 ||
    testDate.getUTCDate() !==
      day
  ) {
    return undefined
  }


  return {
    year,
    month,
    day,
  }
}


/* =======================================
   DATE PARTS TO STRING
======================================= */

function datePartsToString(
  year:
    number,
  month:
    number,
  day:
    number,
): string {
  return `${
    String(
      year,
    ).padStart(
      4,
      '0',
    )
  }-${
    String(
      month,
    ).padStart(
      2,
      '0',
    )
  }-${
    String(
      day,
    ).padStart(
      2,
      '0',
    )
  }`
}


/* =======================================
   MOVE GARDEN DATE
======================================= */

/*
 * Internal date mover.
 *
 * Unlike the public add/subtract helpers,
 * this accepts positive OR negative movement.
 */

function moveGardenDate(
  date:
    string,
  days:
    number,
): string | undefined {
  const dateParts =
    parseDateOnly(
      date,
    )


  if (
    !dateParts ||
    !Number.isFinite(
      days,
    )
  ) {
    return undefined
  }


  const cleanDays =
    Math.round(
      days,
    )


  const result =
    new Date(
      Date.UTC(
        dateParts.year,
        dateParts.month - 1,
        dateParts.day + cleanDays,
      ),
    )


  return datePartsToString(
    result.getUTCFullYear(),
    result.getUTCMonth() + 1,
    result.getUTCDate(),
  )
}


/* =======================================
   ADD DAYS
======================================= */

export function addGardenDays(
  date:
    string,
  days:
    number,
): string | undefined {
  const cleanDays =
    normalisePositiveDayValue(
      days,
    )


  if (
    cleanDays === undefined
  ) {
    return undefined
  }


  return moveGardenDate(
    date,
    cleanDays,
  )
}


/* =======================================
   SUBTRACT DAYS
======================================= */

export function subtractGardenDays(
  date:
    string,
  days:
    number,
): string | undefined {
  const cleanDays =
    normalisePositiveDayValue(
      days,
    )


  if (
    cleanDays === undefined
  ) {
    return undefined
  }


  return moveGardenDate(
    date,
    -cleanDays,
  )
}


/* =======================================
   DAYS BETWEEN
======================================= */

export function getGardenDaysBetween(
  startDate:
    string,
  endDate:
    string,
): number | undefined {
  const start =
    parseDateOnly(
      startDate,
    )

  const end =
    parseDateOnly(
      endDate,
    )


  if (
    !start ||
    !end
  ) {
    return undefined
  }


  const startTime =
    Date.UTC(
      start.year,
      start.month - 1,
      start.day,
    )


  const endTime =
    Date.UTC(
      end.year,
      end.month - 1,
      end.day,
    )


  return Math.round(
    (
      endTime -
      startTime
    ) /
      (
        1000 *
        60 *
        60 *
        24
      ),
  )
}


/* =======================================
   DAYS / WEEKS CONVERSION
======================================= */

export function gardenWeeksToDays(
  weeks:
    number,
): number | undefined {
  if (
    !Number.isFinite(
      weeks,
    ) ||
    weeks < 0
  ) {
    return undefined
  }


  return Math.round(
    weeks * 7,
  )
}


export function gardenDaysToWeeks(
  days:
    number,
): number | undefined {
  if (
    !Number.isFinite(
      days,
    ) ||
    days < 0
  ) {
    return undefined
  }


  return days / 7
}


/* =======================================
   CALCULATE FORWARD WINDOW
======================================= */

/*
 * Example:
 *
 * Start:
 * 5 September
 *
 * Duration:
 * 90–110 days
 *
 * Result:
 * possible harvest window.
 */

export function calculateGardenTimingWindow(
  referenceDate:
    string,
  assumption:
    GardenTimingAssumption,
): GardenTimingWindow | undefined {
  const parsedDate =
    parseDateOnly(
      referenceDate,
    )


  if (
    !parsedDate
  ) {
    return undefined
  }


  const {
    daysMin,
    daysMax,
  } =
    normaliseTimingRange(
      assumption.daysMin,
      assumption.daysMax,
    )


  if (
    daysMin === undefined &&
    daysMax === undefined
  ) {
    return undefined
  }


  return {
    referenceDate,

    earliestDate:
      daysMin !== undefined
        ? addGardenDays(
            referenceDate,
            daysMin,
          )
        : undefined,

    laterDate:
      daysMax !== undefined
        ? addGardenDays(
            referenceDate,
            daysMax,
          )
        : undefined,

    daysMin,

    daysMax,

    referenceType:
      assumption.referenceType,

    knowledgeSource:
      assumption.knowledgeSource ??
      'unknown',

    evidenceCount:
      assumption.evidenceCount,
  }
}


/* =======================================
   CALCULATE FORWARD RANGE
======================================= */

/*
 * A Plan itself may span a date range.
 *
 * Example:
 *
 * "Plant sometime 5–10 September"
 *
 * with:
 *
 * 90–110 days
 *
 *
 * The honest projection is:
 *
 * earliest Plan date + shortest duration
 *
 * through to
 *
 * latest Plan date + longest duration.
 */

export function calculateGardenTimingWindowFromRange(
  referenceStartDate:
    string,
  referenceEndDate:
    string,
  assumption:
    GardenTimingAssumption,
): GardenTimingWindow | undefined {
  const start =
    parseDateOnly(
      referenceStartDate,
    )

  const end =
    parseDateOnly(
      referenceEndDate,
    )


  if (
    !start ||
    !end
  ) {
    return undefined
  }


  if (
    getGardenDaysBetween(
      referenceStartDate,
      referenceEndDate,
    ) === undefined ||
    (
      getGardenDaysBetween(
        referenceStartDate,
        referenceEndDate,
      ) ??
      -1
    ) < 0
  ) {
    return undefined
  }


  const {
    daysMin,
    daysMax,
  } =
    normaliseTimingRange(
      assumption.daysMin,
      assumption.daysMax,
    )


  if (
    daysMin === undefined &&
    daysMax === undefined
  ) {
    return undefined
  }


  const earliestDuration =
    daysMin ??
    daysMax


  const laterDuration =
    daysMax ??
    daysMin


  return {
    referenceDate:
      referenceStartDate,

    earliestDate:
      earliestDuration !== undefined
        ? addGardenDays(
            referenceStartDate,
            earliestDuration,
          )
        : undefined,

    laterDate:
      laterDuration !== undefined
        ? addGardenDays(
            referenceEndDate,
            laterDuration,
          )
        : undefined,

    daysMin,

    daysMax,

    referenceType:
      assumption.referenceType,

    knowledgeSource:
      assumption.knowledgeSource ??
      'unknown',

    evidenceCount:
      assumption.evidenceCount,
  }
}


/* =======================================
   CALCULATE REVERSE WINDOW
======================================= */

/*
 * Example:
 *
 * "I want potatoes around 20 December."
 *
 * Expected duration:
 * 90–110 days.
 *
 *
 * Earliest start:
 * 20 December - 110 days
 *
 * Latest start:
 * 20 December - 90 days
 *
 *
 * This is the basis of Sprig's future
 * backwards planting calculator.
 */

export function calculateGardenReverseTimingWindow(
  targetDate:
    string,
  assumption:
    GardenTimingAssumption,
): GardenReverseTimingWindow | undefined {
  const parsedDate =
    parseDateOnly(
      targetDate,
    )


  if (
    !parsedDate
  ) {
    return undefined
  }


  const {
    daysMin,
    daysMax,
  } =
    normaliseTimingRange(
      assumption.daysMin,
      assumption.daysMax,
    )


  if (
    daysMin === undefined &&
    daysMax === undefined
  ) {
    return undefined
  }


  const longestDuration =
    daysMax ??
    daysMin


  const shortestDuration =
    daysMin ??
    daysMax


  return {
    targetDate,

    earliestStartDate:
      longestDuration !== undefined
        ? subtractGardenDays(
            targetDate,
            longestDuration,
          )
        : undefined,

    latestStartDate:
      shortestDuration !== undefined
        ? subtractGardenDays(
            targetDate,
            shortestDuration,
          )
        : undefined,

    daysMin,

    daysMax,

    referenceType:
      assumption.referenceType,

    knowledgeSource:
      assumption.knowledgeSource ??
      'unknown',

    evidenceCount:
      assumption.evidenceCount,
  }
}


/* =======================================
   TIMING REFERENCE LABEL
======================================= */

export function getGardenTimingReferenceLabel(
  referenceType:
    GardenTimingReferenceType,
): string {
  switch (
    referenceType
  ) {
    case 'sown':
      return 'Sowing'

    case 'planted':
      return 'Planting'

    case 'planted-out':
      return 'Planting out'

    case 'garden-event':
      return 'Garden moment'

    case 'custom-date':
      return 'Chosen date'

    default:
      return 'Starting point'
  }
}


/* =======================================
   TIMING ACTION LABEL
======================================= */

export function getGardenTimingActionLabel(
  referenceType:
    GardenTimingReferenceType,
): string {
  switch (
    referenceType
  ) {
    case 'sown':
      return 'sow'

    case 'planted':
      return 'plant'

    case 'planted-out':
      return 'plant out'

    case 'garden-event':
      return 'begin'

    case 'custom-date':
      return 'begin'

    default:
      return 'begin'
  }
}


/* =======================================
   KNOWLEDGE SOURCE LABEL
======================================= */

export function getGardenTimingKnowledgeLabel(
  source:
    GardenTimingKnowledgeSource,
  evidenceCount?:
    number,
): string {
  switch (
    source
  ) {
    case 'gardener':
      return 'Based on the timing you entered'

    case 'sprig-history':
      if (
        evidenceCount &&
        evidenceCount > 0
      ) {
        return `Based on ${
          evidenceCount
        } previous ${
          evidenceCount === 1
            ? 'story'
            : 'stories'
        } from your garden`
      }

      return 'Based on your garden history'

    case 'reference':
      return 'Based on saved reference timing'

    case 'unknown':
    default:
      return 'Timing source not recorded'
  }
}


/* =======================================
   FORMAT DAYS
======================================= */

export function formatGardenTimingDays(
  daysMin?: number,
  daysMax?: number,
): string {
  const range =
    normaliseTimingRange(
      daysMin,
      daysMax,
    )


  if (
    range.daysMin !== undefined &&
    range.daysMax !== undefined
  ) {
    if (
      range.daysMin ===
      range.daysMax
    ) {
      return `${
        range.daysMin
      } ${
        range.daysMin === 1
          ? 'day'
          : 'days'
      }`
    }

    return `${range.daysMin}–${range.daysMax} days`
  }


  if (
    range.daysMin !== undefined
  ) {
    return `From ${range.daysMin} ${
      range.daysMin === 1
        ? 'day'
        : 'days'
    }`
  }


  if (
    range.daysMax !== undefined
  ) {
    return `Around ${range.daysMax} ${
      range.daysMax === 1
        ? 'day'
        : 'days'
    }`
  }


  return 'Timing not entered'
}


/* =======================================
   FORMAT WEEK VALUE
======================================= */

function formatWeekValue(
  days:
    number,
): string {
  const weeks =
    days / 7


  if (
    Number.isInteger(
      weeks,
    )
  ) {
    return String(
      weeks,
    )
  }


  return weeks.toFixed(
    1,
  )
}


/* =======================================
   FORMAT WEEKS
======================================= */

export function formatGardenTimingWeeks(
  daysMin?: number,
  daysMax?: number,
): string | undefined {
  const range =
    normaliseTimingRange(
      daysMin,
      daysMax,
    )


  if (
    range.daysMin !== undefined &&
    range.daysMax !== undefined
  ) {
    if (
      range.daysMin ===
      range.daysMax
    ) {
      return `About ${
        formatWeekValue(
          range.daysMin,
        )
      } weeks`
    }

    return `About ${
      formatWeekValue(
        range.daysMin,
      )
    }–${
      formatWeekValue(
        range.daysMax,
      )
    } weeks`
  }


  if (
    range.daysMin !== undefined
  ) {
    return `About ${
      formatWeekValue(
        range.daysMin,
      )
    } weeks or more`
  }


  if (
    range.daysMax !== undefined
  ) {
    return `About ${
      formatWeekValue(
        range.daysMax,
      )
    } weeks`
  }


  return undefined
}


/* =======================================
   FORMAT DATE
======================================= */

export function formatGardenTimingDate(
  date:
    string | undefined,
): string {
  if (
    !date
  ) {
    return ''
  }


  const parts =
    parseDateOnly(
      date,
    )


  if (
    !parts
  ) {
    return date
  }


  const value =
    new Date(
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
      ),
    )


  return new Intl.DateTimeFormat(
    'en-AU',
    {
      day:
        'numeric',

      month:
        'long',

      year:
        'numeric',

      timeZone:
        'UTC',
    },
  ).format(
    value,
  )
}


/* =======================================
   FORMAT SHORT DATE
======================================= */

export function formatGardenTimingShortDate(
  date:
    string | undefined,
): string {
  if (
    !date
  ) {
    return ''
  }


  const parts =
    parseDateOnly(
      date,
    )


  if (
    !parts
  ) {
    return date
  }


  const value =
    new Date(
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
      ),
    )


  return new Intl.DateTimeFormat(
    'en-AU',
    {
      day:
        'numeric',

      month:
        'short',

      year:
        'numeric',

      timeZone:
        'UTC',
    },
  ).format(
    value,
  )
}


/* =======================================
   FORMAT FORWARD WINDOW
======================================= */

export function formatGardenTimingWindow(
  window:
    GardenTimingWindow | undefined,
): string | undefined {
  if (
    !window
  ) {
    return undefined
  }


  if (
    window.earliestDate &&
    window.laterDate
  ) {
    if (
      window.earliestDate ===
      window.laterDate
    ) {
      return formatGardenTimingDate(
        window.earliestDate,
      )
    }

    return `${
      formatGardenTimingDate(
        window.earliestDate,
      )
    } to ${
      formatGardenTimingDate(
        window.laterDate,
      )
    }`
  }


  if (
    window.earliestDate
  ) {
    return `From ${
      formatGardenTimingDate(
        window.earliestDate,
      )
    }`
  }


  if (
    window.laterDate
  ) {
    return `Around ${
      formatGardenTimingDate(
        window.laterDate,
      )
    }`
  }


  return undefined
}


/* =======================================
   FORMAT REVERSE WINDOW
======================================= */

export function formatGardenReverseTimingWindow(
  window:
    GardenReverseTimingWindow | undefined,
): string | undefined {
  if (
    !window
  ) {
    return undefined
  }


  if (
    window.earliestStartDate &&
    window.latestStartDate
  ) {
    if (
      window.earliestStartDate ===
      window.latestStartDate
    ) {
      return formatGardenTimingDate(
        window.earliestStartDate,
      )
    }

    return `${
      formatGardenTimingDate(
        window.earliestStartDate,
      )
    } to ${
      formatGardenTimingDate(
        window.latestStartDate,
      )
    }`
  }


  if (
    window.earliestStartDate
  ) {
    return `From ${
      formatGardenTimingDate(
        window.earliestStartDate,
      )
    }`
  }


  if (
    window.latestStartDate
  ) {
    return `By about ${
      formatGardenTimingDate(
        window.latestStartDate,
      )
    }`
  }


  return undefined
}


/* =======================================
   HISTORICAL EVIDENCE
======================================= */

/*
 * This is deliberately only an evidence
 * structure.
 *
 * It does not yet decide what a gardener
 * should expect.
 *
 * Later Sprig can gather observations from
 * real Plant Stories and Harvest Records,
 * analyse them, then feed the resulting
 * evidence back through the SAME calculator.
 */

export interface GardenTimingObservation {
  plantStoryId:
    string

  referenceType:
    GardenTimingReferenceType

  referenceDate:
    string

  firstHarvestDate:
    string

  daysToFirstHarvest:
    number

  plantName?:
    string

  variety?:
    string

  growingPlaceId?:
    string

  growingSetupId?:
    string
}


/* =======================================
   OBSERVATION BUILDER
======================================= */

export function createGardenTimingObservation(
  input: {
    plantStoryId:
      string

    referenceType:
      GardenTimingReferenceType

    referenceDate:
      string

    firstHarvestDate:
      string

    plantName?:
      string

    variety?:
      string

    growingPlaceId?:
      string

    growingSetupId?:
      string
  },
): GardenTimingObservation | undefined {
  const days =
    getGardenDaysBetween(
      input.referenceDate,
      input.firstHarvestDate,
    )


  if (
    days === undefined ||
    days < 0
  ) {
    return undefined
  }


  return {
    plantStoryId:
      input.plantStoryId,

    referenceType:
      input.referenceType,

    referenceDate:
      input.referenceDate,

    firstHarvestDate:
      input.firstHarvestDate,

    daysToFirstHarvest:
      days,

    plantName:
      input.plantName,

    variety:
      input.variety,

    growingPlaceId:
      input.growingPlaceId,

    growingSetupId:
      input.growingSetupId,
  }
}