import type {
  GardenData,
  GardenEvent,
  GardenTrial,
  HarvestRecord,
  PlantStory,
  SprigPhotoMetadata,
} from '../types'

/* =======================================
   SPRIG INTELLIGENCE
======================================= */

/*
 * Sprig Intelligence is DERIVED.
 *
 * It does not own garden truth. Plant Stories,
 * Journal, Harvests, Trials and photographs keep
 * ownership of their own records. This engine
 * reads those records and notices relationships.
 *
 * A core rule here is the same rule used by the
 * Plant Story UI:
 *
 * Records own photographs. Relationships gather
 * the story.
 */

export type SprigInsightFamily =
  | 'garden-maths'
  | 'happening-now'
  | 'from-your-garden'
  | 'worth-watching'
  | 'milestone'
  | 'comparison'
  | 'photographs'
  | 'trial'

export type SprigEvidenceStrength =
  | 'individual'
  | 'worth-watching'
  | 'emerging'
  | 'repeated'

export interface SprigEvidenceStrengthInfo {
  id: SprigEvidenceStrength
  label: string
  description: string
}

export const SPRIG_EVIDENCE_STRENGTHS: SprigEvidenceStrengthInfo[] = [
  {
    id: 'individual',
    label: 'Just noticed',
    description: 'This is based on one story, one event, or very limited evidence.',
  },
  {
    id: 'worth-watching',
    label: 'Worth watching',
    description: 'There is something interesting here, but not enough repetition to call it a pattern.',
  },
  {
    id: 'emerging',
    label: 'Emerging pattern',
    description: 'Several related records are beginning to point in the same direction.',
  },
  {
    id: 'repeated',
    label: 'Repeated in your garden',
    description: 'Sprig has several independent examples showing a similar pattern in this garden.',
  },
]

export type SprigEvidenceRecordType =
  | 'plant-story'
  | 'garden-event'
  | 'harvest'
  | 'growing-place'
  | 'growing-setup'
  | 'garden-trial'
  | 'gallery-photo'
  | 'plant-reference'

export interface SprigInsightEvidence {
  recordType: SprigEvidenceRecordType
  recordId: string
  label: string
  detail?: string
}

export type SprigInsightActionType =
  | 'open-plant'
  | 'compare-plants'
  | 'open-trial'
  | 'open-gallery'
  | 'open-calendar'
  | 'open-harvests'
  | 'open-journal'
  | 'none'

export interface SprigInsightAction {
  type: SprigInsightActionType
  label: string
  plantStoryId?: string
  plantStoryIds?: string[]
  gardenTrialId?: string
}

export interface SprigInsight {
  id: string
  family: SprigInsightFamily
  eyebrow: string
  title: string
  message: string
  strength: SprigEvidenceStrength
  priority: number
  reasoning: string
  evidence: SprigInsightEvidence[]
  actions?: SprigInsightAction[]
  subjectKey?: string
  plantStoryIds?: string[]
  relevantDate?: string
}

export interface SprigPlantBaseline {
  key: string
  plantName: string
  variety?: string
  storyCount: number
  harvestedStoryCount: number
  completedStoryCount: number
  firstHarvestDays: number[]
  medianFirstHarvestDays?: number
  firstHarvestRangeMin?: number
  firstHarvestRangeMax?: number
  completedDurationDays: number[]
  medianCompletedDurationDays?: number
}

export interface SprigInsightResult {
  generatedAt: string
  insights: SprigInsight[]
  baselines: SprigPlantBaseline[]
  summary: {
    totalInsights: number
    happeningNow: number
    fromYourGarden: number
    worthWatching: number
    milestones: number
  }
}

/* =======================================
   DATE + NUMBER HELPERS
======================================= */

const DAY_MS = 1000 * 60 * 60 * 24

function parseDate(value: string | undefined): Date | null {
  if (!value) return null

  const parsed =
    new Date(
      `${value.slice(0, 10)}T00:00:00`,
    )

  return Number.isNaN(
    parsed.getTime(),
  )
    ? null
    : parsed
}

function getToday(): Date {
  const now =
    new Date()

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )
}

function differenceInDays(
  later: Date,
  earlier: Date,
): number {
  return Math.round(
    (
      later.getTime() -
      earlier.getTime()
    ) /
    DAY_MS,
  )
}

function daysBetween(
  earlierValue: string | undefined,
  laterValue: string | undefined,
): number | undefined {
  const earlier =
    parseDate(
      earlierValue,
    )

  const later =
    parseDate(
      laterValue,
    )

  if (
    !earlier ||
    !later
  ) {
    return undefined
  }

  const days =
    differenceInDays(
      later,
      earlier,
    )

  return days < 0
    ? undefined
    : days
}

function formatDate(
  value: string | undefined,
): string {
  const parsed =
    parseDate(
      value,
    )

  if (
    !parsed
  ) {
    return value ?? ''
  }

  return parsed.toLocaleDateString(
    'en-AU',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  )
}

function addDays(
  value: string,
  days: number,
): string | undefined {
  const parsed =
    parseDate(
      value,
    )

  if (
    !parsed
  ) {
    return undefined
  }

  parsed.setDate(
    parsed.getDate() +
    days,
  )

  const year =
    parsed.getFullYear()

  const month =
    String(
      parsed.getMonth() +
      1,
    ).padStart(
      2,
      '0',
    )

  const day =
    String(
      parsed.getDate(),
    ).padStart(
      2,
      '0',
    )

  return `${year}-${month}-${day}`
}

function median(
  values: number[],
): number | undefined {
  if (
    values.length ===
    0
  ) {
    return undefined
  }

  const sorted =
    [
      ...values,
    ].sort(
      (
        left,
        right,
      ) =>
        left -
        right,
    )

  const middle =
    Math.floor(
      sorted.length /
      2,
    )

  if (
    sorted.length %
    2 ===
    0
  ) {
    return Math.round(
      (
        sorted[
          middle -
          1
        ]! +
        sorted[
          middle
        ]!
      ) /
      2,
    )
  }

  return sorted[
    middle
  ]
}

function range(
  values: number[],
): {
  min?: number
  max?: number
} {
  if (
    values.length ===
    0
  ) {
    return {}
  }

  return {
    min:
      Math.min(
        ...values,
      ),

    max:
      Math.max(
        ...values,
      ),
  }
}

export function formatSprigDuration(
  days: number,
): string {
  if (
    days <
    14
  ) {
    return `${days} ${
      days === 1
        ? 'day'
        : 'days'
    }`
  }

  if (
    days <
    70
  ) {
    const weeks =
      Math.round(
        days /
        7,
      )

    return `${weeks} ${
      weeks === 1
        ? 'week'
        : 'weeks'
    }`
  }

  if (
    days <
    365
  ) {
    const months =
      Math.round(
        days /
        30.4375,
      )

    return `${months} ${
      months === 1
        ? 'month'
        : 'months'
    }`
  }

  const years =
    Math.floor(
      days /
      365,
    )

  const remainingMonths =
    Math.round(
      (
        days -
        years *
        365
      ) /
      30.4375,
    )

  if (
    remainingMonths <=
    0
  ) {
    return `${years} ${
      years === 1
        ? 'year'
        : 'years'
    }`
  }

  return `${years} ${
    years === 1
      ? 'year'
      : 'years'
  }, ${remainingMonths} ${
    remainingMonths === 1
      ? 'month'
      : 'months'
  }`
}

/* =======================================
   PLANT HELPERS
======================================= */

function cleanText(
  value: string | undefined,
): string {
  return (
    value ??
    ''
  ).trim()
}

function normalise(
  value: string | undefined,
): string {
  return cleanText(
    value,
  )
    .toLocaleLowerCase()
    .replace(
      /\s+/g,
      ' ',
    )
}

function getPlantLabel(
  plant: PlantStory,
): string {
  return (
    cleanText(
      plant.displayName,
    ) ||
    [
      cleanText(
        plant.plantName,
      ),
      cleanText(
        plant.variety,
      ),
    ]
      .filter(
        Boolean,
      )
      .join(
        ' · ',
      ) ||
    'Plant Story'
  )
}

function getPlantGroupKey(
  plant: PlantStory,
): string {
  const crop =
    normalise(
      plant.plantName,
    )

  const variety =
    normalise(
      plant.variety,
    )

  return variety
    ? `${crop}::${variety}`
    : crop
}

function getPlantGroupLabel(
  plant: PlantStory,
): string {
  return [
    cleanText(
      plant.plantName,
    ),
    cleanText(
      plant.variety,
    ),
  ]
    .filter(
      Boolean,
    )
    .join(
      ' · ',
    )
}

function getPlantTimingReferenceDate(
  plant: PlantStory,
  gardenData: GardenData,
): string | undefined {
  const reference =
    plant.harvestTimingReference

  if (
    !reference
  ) {
    return (
      plant.sownDate ||
      plant.plantedDate
    )
  }

  switch (
    reference.sourceType
  ) {
    case 'sown':
      return (
        plant.sownDate ||
        plant.plantedDate
      )

    case 'planted':
      return plant.plantedDate

    case 'planted-out':
      return (
        plant.plantedOutDate ||
        plant.plantedDate
      )

    case 'purchased': {
      if (
        plant.originPurchaseId
      ) {
        const purchase =
          (
            gardenData.purchases ??
            []
          ).find(
            item =>
              item.id ===
              plant.originPurchaseId,
          )

        if (
          purchase?.date
        ) {
          return purchase.date
        }
      }

      return plant.plantedDate
    }

    case 'garden-event': {
      if (
        reference.eventId
      ) {
        const event =
          gardenData.events.find(
            item =>
              item.id ===
              reference.eventId,
          )

        if (
          event?.date
        ) {
          return event.date
        }
      }

      return plant.plantedDate
    }

    case 'custom-date':
      return (
        reference.customDate ||
        plant.plantedDate
      )

    default:
      return plant.plantedDate
  }
}

function getPlantCompletionDate(
  plant: PlantStory,
  harvests: HarvestRecord[],
): string | undefined {
  if (
    plant.completedAt
  ) {
    return plant.completedAt
  }

  const plantHarvests =
    harvests
      .filter(
        harvest =>
          harvest.plantStoryIds.includes(
            plant.id,
          ),
      )
      .sort(
        (
          left,
          right,
        ) =>
          right.date.localeCompare(
            left.date,
          ),
      )

  const finishingHarvest =
    plantHarvests.find(
      harvest =>
        harvest.harvestType ===
          'final' ||
        harvest.plantOutcome ===
          'finished',
    )

  if (
    finishingHarvest
  ) {
    return finishingHarvest.date
  }

  if (
    plant.status ===
      'finished' ||
    plant.status ===
      'failed'
  ) {
    return (
      plantHarvests[
        0
      ]?.date ||
      plant.updatedAt ||
      undefined
    )
  }

  return undefined
}

function getPlantAgeDays(
  plant: PlantStory,
  gardenData: GardenData,
): number | undefined {
  const startDate =
    parseDate(
      getPlantTimingReferenceDate(
        plant,
        gardenData,
      ),
    )

  if (
    !startDate
  ) {
    return undefined
  }

  const completion =
    getPlantCompletionDate(
      plant,
      gardenData.harvests ??
      [],
    )

  const endDate =
    completion
      ? parseDate(
          completion,
        )
      : getToday()

  if (
    !endDate
  ) {
    return undefined
  }

  const days =
    differenceInDays(
      endDate,
      startDate,
    )

  return days < 0
    ? undefined
    : days
}

function getFirstHarvest(
  plantId: string,
  harvests: HarvestRecord[],
): HarvestRecord | undefined {
  return harvests
    .filter(
      harvest =>
        harvest.plantStoryIds.includes(
          plantId,
        ),
    )
    .sort(
      (
        left,
        right,
      ) =>
        left.date.localeCompare(
          right.date,
        ),
    )[0]
}

function getLastPlantEvent(
  plantId: string,
  events: GardenEvent[],
): GardenEvent | undefined {
  return events
    .filter(
      event =>
        event.plantStoryIds.includes(
          plantId,
        ),
    )
    .sort(
      (
        left,
        right,
      ) =>
        right.date.localeCompare(
          left.date,
        ),
    )[0]
}

function getLastPlantHarvestDate(
  plantId: string,
  harvests: HarvestRecord[],
): string | undefined {
  return harvests
    .filter(
      harvest =>
        harvest.plantStoryIds.includes(
          plantId,
        ),
    )
    .map(
      harvest =>
        harvest.date,
    )
    .filter(
      date =>
        Boolean(
          parseDate(
            date,
          ),
        ),
    )
    .sort(
      (
        left,
        right,
      ) =>
        right.localeCompare(
          left,
        ),
    )[0]
}

/* =======================================
   PHOTO EVIDENCE
======================================= */

interface SprigPlantPhotoEvidence {
  photoCount: number
  datedPhotoDates: string[]
}

function getPhotoDateAtIndex(
  legacyDates:
    Array<string | undefined> |
    undefined,

  metadata:
    Array<
      SprigPhotoMetadata |
      undefined
    > |
    undefined,

  index: number,

  fallbackDate?: string,
): string | undefined {
  const metadataDate =
    metadata?.[
      index
    ]?.photoDate

  if (
    metadataDate &&
    parseDate(
      metadataDate,
    )
  ) {
    return metadataDate
  }

  const legacyDate =
    legacyDates?.[
      index
    ]

  if (
    legacyDate &&
    parseDate(
      legacyDate,
    )
  ) {
    return legacyDate
  }

  if (
    fallbackDate &&
    parseDate(
      fallbackDate,
    )
  ) {
    return fallbackDate
  }

  return undefined
}

function buildPlantPhotoEvidence(
  plant: PlantStory,
  gardenData: GardenData,
): SprigPlantPhotoEvidence {
  const datedPhotoDates:
    string[] =
    []

  let photoCount =
    0

  ;(
    plant.photoUrls ??
    []
  ).forEach(
    (
      _photoUrl,
      index,
    ) => {
      photoCount +=
        1

      const date =
        getPhotoDateAtIndex(
          plant.photoDates,
          plant.photoMetadata,
          index,
        )

      if (
        date
      ) {
        datedPhotoDates.push(
          date,
        )
      }
    },
  )

  for (
    const event of
    gardenData.events ??
    []
  ) {
    if (
      !event.plantStoryIds.includes(
        plant.id,
      )
    ) {
      continue
    }

    ;(
      event.photoUrls ??
      []
    ).forEach(
      (
        _photoUrl,
        index,
      ) => {
        photoCount +=
          1

        const date =
          getPhotoDateAtIndex(
            undefined,
            event.photoMetadata,
            index,
            event.date,
          )

        if (
          date
        ) {
          datedPhotoDates.push(
            date,
          )
        }
      },
    )
  }

  for (
    const harvest of
    gardenData.harvests ??
    []
  ) {
    if (
      !harvest.plantStoryIds.includes(
        plant.id,
      )
    ) {
      continue
    }

    ;(
      harvest.photoUrls ??
      []
    ).forEach(
      (
        _photoUrl,
        index,
      ) => {
        photoCount +=
          1

        const date =
          getPhotoDateAtIndex(
            undefined,
            harvest.photoMetadata,
            index,
            harvest.date,
          )

        if (
          date
        ) {
          datedPhotoDates.push(
            date,
          )
        }
      },
    )
  }

  datedPhotoDates.sort(
    (
      left,
      right,
    ) =>
      left.localeCompare(
        right,
      ),
  )

  return {
    photoCount,
    datedPhotoDates,
  }
}

/* =======================================
   EVIDENCE STRENGTH + BASELINES
======================================= */

function strengthFromCount(
  count: number,
): SprigEvidenceStrength {
  if (
    count >=
    7
  ) {
    return 'repeated'
  }

  if (
    count >=
    4
  ) {
    return 'emerging'
  }

  if (
    count >=
    2
  ) {
    return 'worth-watching'
  }

  return 'individual'
}

export function buildSprigPlantBaselines(
  gardenData: GardenData,
): SprigPlantBaseline[] {
  const groups =
    new Map<
      string,
      PlantStory[]
    >()

  for (
    const plant of
    gardenData.plantStories
  ) {
    const key =
      getPlantGroupKey(
        plant,
      )

    if (
      !key
    ) {
      continue
    }

    groups.set(
      key,
      [
        ...(
          groups.get(
            key,
          ) ??
          []
        ),
        plant,
      ],
    )
  }

  const baselines:
    SprigPlantBaseline[] =
    []

  for (
    const [
      key,
      plants,
    ] of groups
  ) {
    const example =
      plants[
        0
      ]

    if (
      !example
    ) {
      continue
    }

    const firstHarvestDays:
      number[] =
      []

    const completedDurationDays:
      number[] =
      []

    let harvestedStoryCount =
      0

    let completedStoryCount =
      0

    for (
      const plant of
      plants
    ) {
      const startDate =
        getPlantTimingReferenceDate(
          plant,
          gardenData,
        )

      const firstHarvest =
        getFirstHarvest(
          plant.id,
          gardenData.harvests ??
          [],
        )

      if (
        startDate &&
        firstHarvest
      ) {
        const days =
          daysBetween(
            startDate,
            firstHarvest.date,
          )

        if (
          days !==
          undefined
        ) {
          firstHarvestDays.push(
            days,
          )

          harvestedStoryCount +=
            1
        }
      }

      const completionDate =
        getPlantCompletionDate(
          plant,
          gardenData.harvests ??
          [],
        )

      if (
        startDate &&
        completionDate
      ) {
        const days =
          daysBetween(
            startDate,
            completionDate,
          )

        if (
          days !==
          undefined
        ) {
          completedDurationDays.push(
            days,
          )

          completedStoryCount +=
            1
        }
      }
    }

    const harvestRange =
      range(
        firstHarvestDays,
      )

    baselines.push({
      key,

      plantName:
        example.plantName,

      variety:
        example.variety,

      storyCount:
        plants.length,

      harvestedStoryCount,

      completedStoryCount,

      firstHarvestDays,

      medianFirstHarvestDays:
        median(
          firstHarvestDays,
        ),

      firstHarvestRangeMin:
        harvestRange.min,

      firstHarvestRangeMax:
        harvestRange.max,

      completedDurationDays,

      medianCompletedDurationDays:
        median(
          completedDurationDays,
        ),
    })
  }

  return baselines.sort(
    (
      left,
      right,
    ) =>
      right.storyCount -
      left.storyCount,
  )
}

/* =======================================
   CURRENT PLANT MATHS
======================================= */

function buildCurrentPlantMathInsights(
  gardenData: GardenData,
): SprigInsight[] {
  const insights:
    SprigInsight[] =
    []

  for (
    const plant of
    gardenData.plantStories
  ) {
    if (
      plant.status !==
        'growing' &&
      plant.status !==
        'harvesting'
    ) {
      continue
    }

    const ageDays =
      getPlantAgeDays(
        plant,
        gardenData,
      )

    if (
      ageDays ===
      undefined
    ) {
      continue
    }

    const label =
      getPlantLabel(
        plant,
      )

    const referenceDate =
      getPlantTimingReferenceDate(
        plant,
        gardenData,
      )

    insights.push({
      id:
        `plant-age-${plant.id}`,

      family:
        'garden-maths',

      eyebrow:
        'A little garden maths',

      title:
        `${label} is ${formatSprigDuration(
          ageDays,
        )} into its story`,

      message:
        'Sprig is counting from the timing reference saved on this Plant Story.',

      strength:
        'individual',

      priority:
        18,

      reasoning:
        `The saved timing reference for ${label} is ${formatDate(
          referenceDate,
        )}. From that date to today is ${ageDays} days.`,

      evidence: [
        {
          recordType:
            'plant-story',

          recordId:
            plant.id,

          label,

          detail:
            `${ageDays} days from its saved timing reference`,
        },
      ],

      actions: [
        {
          type:
            'open-plant',

          label:
            'Open this story',

          plantStoryId:
            plant.id,
        },
      ],

      subjectKey:
        `plant:${plant.id}`,

      plantStoryIds: [
        plant.id,
      ],
    })
  }

  return insights
}

/* =======================================
   HARVEST WINDOW
======================================= */

function buildHarvestWindowInsights(
  gardenData: GardenData,
): SprigInsight[] {
  const insights:
    SprigInsight[] =
    []

  const today =
    getToday()

  for (
    const plant of
    gardenData.plantStories
  ) {
    if (
      plant.status !==
        'growing' &&
      plant.status !==
        'harvesting'
    ) {
      continue
    }

    if (
      plant.expectedHarvestDaysMin ===
        undefined &&
      plant.expectedHarvestDaysMax ===
        undefined
    ) {
      continue
    }

    const referenceDate =
      getPlantTimingReferenceDate(
        plant,
        gardenData,
      )

    if (
      !referenceDate
    ) {
      continue
    }

    const minDays =
      plant.expectedHarvestDaysMin ??
      plant.expectedHarvestDaysMax

    const maxDays =
      plant.expectedHarvestDaysMax ??
      plant.expectedHarvestDaysMin

    if (
      minDays ===
        undefined ||
      maxDays ===
        undefined
    ) {
      continue
    }

    const earliest =
      addDays(
        referenceDate,
        minDays,
      )

    const latest =
      addDays(
        referenceDate,
        maxDays,
      )

    if (
      !earliest ||
      !latest
    ) {
      continue
    }

    const earliestDate =
      parseDate(
        earliest,
      )

    const latestDate =
      parseDate(
        latest,
      )

    if (
      !earliestDate ||
      !latestDate
    ) {
      continue
    }

    if (
      getFirstHarvest(
        plant.id,
        gardenData.harvests ??
        [],
      )
    ) {
      continue
    }

    const label =
      getPlantLabel(
        plant,
      )

    if (
      today >=
        earliestDate &&
      today <=
        latestDate
    ) {
      insights.push({
        id:
          `harvest-window-now-${plant.id}`,

        family:
          'happening-now',

        eyebrow:
          'Happening now',

        title:
          `${label} has reached its expected harvest window`,

        message:
          'Based on the timing you gave Sprig, this story is now inside its expected first-harvest window.',

        strength:
          'individual',

        priority:
          82,

        reasoning:
          `The saved expectation is ${minDays} to ${maxDays} days from ${formatDate(
            referenceDate,
          )}. That gives an expected window of ${formatDate(
            earliest,
          )} to ${formatDate(
            latest,
          )}.`,

        evidence: [
          {
            recordType:
              'plant-story',

            recordId:
              plant.id,

            label,

            detail:
              `Expected ${formatDate(
                earliest,
              )} to ${formatDate(
                latest,
              )}`,
          },
        ],

        actions: [
          {
            type:
              'open-plant',

            label:
              'Have a look at this story',

            plantStoryId:
              plant.id,
          },

          {
            type:
              'open-harvests',

            label:
              'Open Harvests',
          },
        ],

        subjectKey:
          `harvest-window:${plant.id}`,

        plantStoryIds: [
          plant.id,
        ],

        relevantDate:
          earliest,
      })

      continue
    }

    if (
      today >
      latestDate
    ) {
      const overdueDays =
        differenceInDays(
          today,
          latestDate,
        )

      insights.push({
        id:
          `harvest-window-late-${plant.id}`,

        family:
          'worth-watching',

        eyebrow:
          'Worth watching',

        title:
          `${label} is beyond the harvest window you expected`,

        message:
          overdueDays <=
          7
            ? 'It has only just moved beyond the expected window, so this may simply be normal variation.'
            : 'There is no harvest recorded yet. That does not mean something is wrong, but the timing is now worth noticing.',

        strength:
          'individual',

        priority:
          overdueDays >=
          14
            ? 88
            : 76,

        reasoning:
          `The latest expected first-harvest date was ${formatDate(
            latest,
          )}. Today is ${overdueDays} days later and Sprig cannot find a Harvest record for this Plant Story.`,

        evidence: [
          {
            recordType:
              'plant-story',

            recordId:
              plant.id,

            label,

            detail:
              `${overdueDays} days beyond the saved expectation`,
          },
        ],

        actions: [
          {
            type:
              'open-plant',

            label:
              'Open this story',

            plantStoryId:
              plant.id,
          },

          {
            type:
              'open-journal',

            label:
              'Record what is happening',
          },
        ],

        subjectKey:
          `harvest-window:${plant.id}`,

        plantStoryIds: [
          plant.id,
        ],

        relevantDate:
          latest,
      })
    }
  }

  return insights
}

/* =======================================
   HISTORICAL BASELINES
======================================= */

function buildHistoricalBaselineInsights(
  baselines:
    SprigPlantBaseline[],
): SprigInsight[] {
  const insights:
    SprigInsight[] =
    []

  for (
    const baseline of
    baselines
  ) {
    if (
      baseline.harvestedStoryCount <
      1
    ) {
      continue
    }

    const cropLabel =
      [
        baseline.plantName,
        baseline.variety,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        )

    if (
      baseline.harvestedStoryCount ===
      1
    ) {
      const first =
        baseline.firstHarvestDays[
          0
        ]

      if (
        first ===
        undefined
      ) {
        continue
      }

      insights.push({
        id:
          `first-harvest-baseline-${baseline.key}`,

        family:
          'milestone',

        eyebrow:
          'Your garden is beginning to remember',

        title:
          `Sprig has a first harvest baseline for ${cropLabel}`,

        message:
          `Your first usable ${cropLabel} story reached harvest after ${formatSprigDuration(
            first,
          )}. One story is not a pattern, but it gives future stories something real from your own garden to compare with.`,

        strength:
          'individual',

        priority:
          44,

        reasoning:
          `Sprig found one ${cropLabel} Plant Story with both a usable starting date and a Harvest record.`,

        evidence:
          [],

        subjectKey:
          `baseline:${baseline.key}`,
      })

      continue
    }

    const minimum =
      baseline.firstHarvestRangeMin

    const maximum =
      baseline.firstHarvestRangeMax

    const middle =
      baseline.medianFirstHarvestDays

    if (
      minimum ===
        undefined ||
      maximum ===
        undefined ||
      middle ===
        undefined
    ) {
      continue
    }

    insights.push({
      id:
        `harvest-baseline-${baseline.key}`,

      family:
        'from-your-garden',

      eyebrow:
        'From your garden',

      title:
        `${cropLabel} is building its own history in Sprig`,

      message:
        minimum ===
        maximum
          ? `Across ${baseline.harvestedStoryCount} recorded stories, first harvest occurred at ${formatSprigDuration(
              minimum,
            )}.`
          : `Across ${baseline.harvestedStoryCount} recorded stories, first harvest has ranged from ${formatSprigDuration(
              minimum,
            )} to ${formatSprigDuration(
              maximum,
            )}. The middle of those records is around ${formatSprigDuration(
              middle,
            )}.`,

      strength:
        strengthFromCount(
          baseline.harvestedStoryCount,
        ),

      priority:
        baseline.harvestedStoryCount >=
        4
          ? 72
          : 55,

      reasoning:
        `Sprig compared ${baseline.harvestedStoryCount} ${cropLabel} stories that contain both a usable starting date and a Harvest record. It is describing those records, not a general horticultural rule.`,

      evidence:
        [],

      subjectKey:
        `baseline:${baseline.key}`,
    })
  }

  return insights
}

/* =======================================
   CURRENT VS HISTORY
======================================= */

function buildCurrentVsHistoryInsights(
  gardenData:
    GardenData,

  baselines:
    SprigPlantBaseline[],
): SprigInsight[] {
  const insights:
    SprigInsight[] =
    []

  const baselineMap =
    new Map(
      baselines.map(
        baseline => [
          baseline.key,
          baseline,
        ],
      ),
    )

  for (
    const plant of
    gardenData.plantStories
  ) {
    if (
      plant.status !==
        'growing' &&
      plant.status !==
        'harvesting'
    ) {
      continue
    }

    if (
      getFirstHarvest(
        plant.id,
        gardenData.harvests ??
        [],
      )
    ) {
      continue
    }

    const baseline =
      baselineMap.get(
        getPlantGroupKey(
          plant,
        ),
      )

    if (
      !baseline ||
      baseline.harvestedStoryCount <
        2 ||
      baseline.firstHarvestRangeMax ===
        undefined
    ) {
      continue
    }

    const ageDays =
      getPlantAgeDays(
        plant,
        gardenData,
      )

    if (
      ageDays ===
      undefined
    ) {
      continue
    }

    const historyMaximum =
      baseline.firstHarvestRangeMax

    if (
      ageDays <=
      historyMaximum
    ) {
      continue
    }

    const difference =
      ageDays -
      historyMaximum

    if (
      difference <
      4
    ) {
      continue
    }

    const label =
      getPlantLabel(
        plant,
      )

    const cropLabel =
      getPlantGroupLabel(
        plant,
      )

    insights.push({
      id:
        `later-than-history-${plant.id}`,

      family:
        'worth-watching',

      eyebrow:
        'Your garden remembers something',

      title:
        `${label} is running later than your earlier ${cropLabel} stories`,

      message:
        `Your previous ${cropLabel} stories with harvest records had reached first harvest by ${formatSprigDuration(
          historyMaximum,
        )}. This one is now at ${formatSprigDuration(
          ageDays,
        )} without a recorded harvest.`,

      strength:
        strengthFromCount(
          baseline.harvestedStoryCount,
        ),

      priority:
        92,

      reasoning:
        `Sprig compared this current Plant Story with ${baseline.harvestedStoryCount} earlier ${cropLabel} stories from your own garden. The observation is about timing only. It does not establish why the timing differs.`,

      evidence: [
        {
          recordType:
            'plant-story',

          recordId:
            plant.id,

          label,

          detail:
            `${ageDays} days with no recorded harvest`,
        },
      ],

      actions: [
        {
          type:
            'open-plant',

          label:
            'Open this story',

          plantStoryId:
            plant.id,
        },
      ],

      subjectKey:
        `current-history:${plant.id}`,

      plantStoryIds: [
        plant.id,
      ],
    })
  }

  return insights
}

/* =======================================
   MEANINGFUL COMPARISONS
======================================= */

function buildComparisonInsights(
  gardenData: GardenData,
): SprigInsight[] {
  const insights:
    SprigInsight[] =
    []

  const groups =
    new Map<
      string,
      PlantStory[]
    >()

  for (
    const plant of
    gardenData.plantStories
  ) {
    const key =
      getPlantGroupKey(
        plant,
      )

    if (
      !key
    ) {
      continue
    }

    groups.set(
      key,
      [
        ...(
          groups.get(
            key,
          ) ??
          []
        ),
        plant,
      ],
    )
  }

  for (
    const [
      key,
      plants,
    ] of groups
  ) {
    if (
      plants.length <
      2
    ) {
      continue
    }

    const candidates =
      plants
        .map(
          plant => ({
            plant,

            age:
              getPlantAgeDays(
                plant,
                gardenData,
              ),
          }),
        )
        .filter(
          (
            item,
          ): item is {
            plant: PlantStory
            age: number
          } =>
            item.age !==
            undefined,
        )

    if (
      candidates.length <
      2
    ) {
      continue
    }

    let bestPair:
      [
        typeof candidates[number],
        typeof candidates[number],
      ] |
      null =
      null

    let smallestDifference =
      Number.POSITIVE_INFINITY

    for (
      let outer =
        0;
      outer <
        candidates.length;
      outer +=
        1
    ) {
      for (
        let inner =
          outer +
          1;
        inner <
          candidates.length;
        inner +=
          1
      ) {
        const left =
          candidates[
            outer
          ]

        const right =
          candidates[
            inner
          ]

        if (
          !left ||
          !right
        ) {
          continue
        }

        const difference =
          Math.abs(
            left.age -
            right.age,
          )

        if (
          difference <
          smallestDifference
        ) {
          smallestDifference =
            difference

          bestPair = [
            left,
            right,
          ]
        }
      }
    }

    if (
      !bestPair ||
      smallestDifference >
      35
    ) {
      continue
    }

    const [
      left,
      right,
    ] =
      bestPair

    const leftPlace =
      left.plant.currentGrowingPlaceId

    const rightPlace =
      right.plant.currentGrowingPlaceId

    const leftSetup =
      left.plant.currentGrowingSetupId

    const rightSetup =
      right.plant.currentGrowingSetupId

    const placeDiffers =
      Boolean(
        leftPlace &&
        rightPlace &&
        leftPlace !==
        rightPlace,
      )

    const setupDiffers =
      Boolean(
        leftSetup &&
        rightSetup &&
        leftSetup !==
        rightSetup,
      )

    const statusDiffers =
      left.plant.status !==
      right.plant.status

    /*
     * Similar age alone is not an insight.
     *
     * Sprig only interrupts the gardener when it
     * can name a concrete reason the comparison
     * may reveal something useful.
     */
    if (
      !placeDiffers &&
      !setupDiffers &&
      !statusDiffers
    ) {
      continue
    }

    const cropLabel =
      getPlantGroupLabel(
        left.plant,
      )

    const ageText =
      smallestDifference ===
      0
        ? 'the same recorded age'
        : `within ${formatSprigDuration(
            smallestDifference,
          )} of one another`

    const differenceReasons =
      [
        placeDiffers
          ? 'different Growing Places'
          : undefined,

        setupDiffers
          ? 'different Growing Recipes'
          : undefined,

        statusDiffers
          ? 'different story stages'
          : undefined,
      ].filter(
        (
          value,
        ): value is string =>
          Boolean(
            value,
          ),
      )

    insights.push({
      id:
        `comparison-${key}-${left.plant.id}-${right.plant.id}`,

      family:
        'comparison',

      eyebrow:
        'A useful comparison',

      title:
        `Two ${cropLabel} stories may be worth looking at together`,

      message:
        `${getPlantLabel(
          left.plant,
        )} and ${getPlantLabel(
          right.plant,
        )} are ${ageText}, but they have ${differenceReasons.join(
          ', ',
        )}. Looking at them together may make meaningful differences easier to see.`,

      strength:
        strengthFromCount(
          plants.length,
        ),

      priority:
        64,

      reasoning:
        `Sprig found two similarly aged ${cropLabel} Plant Stories with ${differenceReasons.join(
          ', ',
        )}. This is a suggestion to compare evidence, not a claim that those conditions caused an outcome.`,

      evidence: [
        {
          recordType:
            'plant-story',

          recordId:
            left.plant.id,

          label:
            getPlantLabel(
              left.plant,
            ),

          detail:
            formatSprigDuration(
              left.age,
            ),
        },

        {
          recordType:
            'plant-story',

          recordId:
            right.plant.id,

          label:
            getPlantLabel(
              right.plant,
            ),

          detail:
            formatSprigDuration(
              right.age,
            ),
        },
      ],

      actions: [
        {
          type:
            'compare-plants',

          label:
            'Compare these stories',

          plantStoryIds: [
            left.plant.id,
            right.plant.id,
          ],
        },
      ],

      subjectKey:
        `comparison:${key}`,

      plantStoryIds: [
        left.plant.id,
        right.plant.id,
      ],
    })
  }

  return insights
}

/* =======================================
   PHOTOGRAPHIC HISTORY
======================================= */

function buildPhotoHistoryInsights(
  gardenData: GardenData,
): SprigInsight[] {
  const insights:
    SprigInsight[] =
    []

  for (
    const plant of
    gardenData.plantStories
  ) {
    const photoEvidence =
      buildPlantPhotoEvidence(
        plant,
        gardenData,
      )

    if (
      photoEvidence.photoCount <
      3
    ) {
      continue
    }

    const datedPhotos =
      photoEvidence.datedPhotoDates

    if (
      datedPhotos.length <
      2
    ) {
      continue
    }

    const firstDate =
      datedPhotos[
        0
      ]

    const lastDate =
      datedPhotos.at(
        -1,
      )

    const span =
      daysBetween(
        firstDate,
        lastDate,
      )

    if (
      span ===
        undefined ||
      span <
        14
    ) {
      continue
    }

    const label =
      getPlantLabel(
        plant,
      )

    insights.push({
      id:
        `photo-history-${plant.id}`,

      family:
        'photographs',

      eyebrow:
        'A story you can see',

      title:
        `${label} now has a useful photographic history`,

      message:
        `There are ${datedPhotos.length} dated photographs spanning ${formatSprigDuration(
          span,
        )}. There is enough visual history here to make comparison genuinely useful.`,

      strength:
        datedPhotos.length >=
        7
          ? 'repeated'
          : datedPhotos.length >=
              4
            ? 'emerging'
            : 'worth-watching',

      priority:
        58,

      reasoning:
        `Sprig found ${datedPhotos.length} dated photographs connected to this Plant Story between ${formatDate(
          firstDate,
        )} and ${formatDate(
          lastDate,
        )}. It gathered Plant Story, Journal and Harvest photographs through their saved relationships and dates. Sprig is not analysing the image pixels.`,

      evidence: [
        {
          recordType:
            'plant-story',

          recordId:
            plant.id,

          label,

          detail:
            `${datedPhotos.length} dated photos across ${formatSprigDuration(
              span,
            )}`,
        },
      ],

      actions: [
        {
          type:
            'open-gallery',

          label:
            'See the photographs',
        },

        {
          type:
            'open-plant',

          label:
            'Open this story',

          plantStoryId:
            plant.id,
        },
      ],

      subjectKey:
        `photos:${plant.id}`,

      plantStoryIds: [
        plant.id,
      ],
    })
  }

  return insights
}

/* =======================================
   QUIET PLANT STORY
======================================= */

function buildQuietStoryInsights(
  gardenData: GardenData,
): SprigInsight[] {
  const insights:
    SprigInsight[] =
    []

  const today =
    getToday()

  for (
    const plant of
    gardenData.plantStories
  ) {
    if (
      plant.status !==
        'growing' &&
      plant.status !==
        'harvesting'
    ) {
      continue
    }

    const lastEvent =
      getLastPlantEvent(
        plant.id,
        gardenData.events ??
        [],
      )

    const photoEvidence =
      buildPlantPhotoEvidence(
        plant,
        gardenData,
      )

    const latestPhotoDate =
      photoEvidence
        .datedPhotoDates
        .at(
          -1,
        )

    const latestHarvestDate =
      getLastPlantHarvestDate(
        plant.id,
        gardenData.harvests ??
        [],
      )

    const candidateDates =
      [
        lastEvent?.date,
        latestPhotoDate,
        latestHarvestDate,
        plant.updatedAt,
        plant.enteredDate,
      ]
        .filter(
          (
            value,
          ): value is string =>
            Boolean(
              value &&
              parseDate(
                value,
              ),
            ),
        )
        .sort(
          (
            left,
            right,
          ) =>
            right.localeCompare(
              left,
            ),
        )

    const latest =
      candidateDates[
        0
      ]

    const parsedLatest =
      parseDate(
        latest,
      )

    if (
      !latest ||
      !parsedLatest
    ) {
      continue
    }

    const quietDays =
      differenceInDays(
        today,
        parsedLatest,
      )

    if (
      quietDays <
      21
    ) {
      continue
    }

    const age =
      getPlantAgeDays(
        plant,
        gardenData,
      )

    const label =
      getPlantLabel(
        plant,
      )

    insights.push({
      id:
        `quiet-story-${plant.id}`,

      family:
        'worth-watching',

      eyebrow:
        'A quiet corner',

      title:
        `${label} has been quiet in Sprig for ${formatSprigDuration(
          quietDays,
        )}`,

      message:
        age !==
        undefined
          ? `The Plant Story is still marked as ${plant.status}, but Sprig has not found a newer dated Journal event, connected photograph, Harvest or edit.`
          : 'The Plant Story is still active, but Sprig has not found a newer dated Journal event, connected photograph, Harvest or edit.',

      strength:
        'individual',

      priority:
        32,

      reasoning:
        `The most recent dated activity Sprig could find for this story is ${formatDate(
          latest,
        )}. This is a gentle prompt, not an assumption that anything is wrong in the garden.`,

      evidence: [
        {
          recordType:
            'plant-story',

          recordId:
            plant.id,

          label,

          detail:
            `Last recorded activity ${formatDate(
              latest,
            )}`,
        },
      ],

      actions: [
        {
          type:
            'open-plant',

          label:
            'Open this story',

          plantStoryId:
            plant.id,
        },

        {
          type:
            'open-journal',

          label:
            'Add an observation',
        },
      ],

      subjectKey:
        `quiet:${plant.id}`,

      plantStoryIds: [
        plant.id,
      ],
    })
  }

  return insights
}

/* =======================================
   TRIAL EVIDENCE
======================================= */

function buildSingleTrialInsight(
  trial: GardenTrial,
  evidenceCount: number,
): SprigInsight {
  const hasManyPieces =
    evidenceCount >=
    6

  return {
    id:
      `trial-evidence-${trial.id}`,

    family:
      'trial',

    eyebrow:
      'A question gathering evidence',

    title:
      `${trial.title} has a story building around it`,

    message:
      hasManyPieces
        ? `This Trial now has ${evidenceCount} linked records or Trial observations. There may be enough here to pause and see what the garden is beginning to show.`
        : `This Trial now has ${evidenceCount} linked records or Trial observations. Its evidence is beginning to gather.`,

    strength:
      strengthFromCount(
        evidenceCount,
      ),

    priority:
      hasManyPieces
        ? 78
        : 48,

    reasoning:
      'Sprig counted the records linked to this Trial together with its Trial-specific observations. It has not decided what the Trial means.',

    evidence: [
      {
        recordType:
          'garden-trial',

        recordId:
          trial.id,

        label:
          trial.title,

        detail:
          `${evidenceCount} pieces of linked or Trial-owned evidence`,
      },
    ],

    actions: [
      {
        type:
          'open-trial',

        label:
          'Visit this Trial',

        gardenTrialId:
          trial.id,
      },
    ],

    subjectKey:
      `trial:${trial.id}`,
  }
}

function buildTrialInsights(
  gardenData: GardenData,
): SprigInsight[] {
  const insights:
    SprigInsight[] =
    []

  for (
    const trial of
    gardenData.gardenTrials ??
    []
  ) {
    if (
      trial.status !==
      'active'
    ) {
      continue
    }

    const evidenceCount =
      (
        trial.relationships ??
        []
      ).length +
      (
        trial.observations ??
        []
      ).length

    if (
      evidenceCount <
      3
    ) {
      continue
    }

    insights.push(
      buildSingleTrialInsight(
        trial,
        evidenceCount,
      ),
    )
  }

  return insights
}

/* =======================================
   FIRSTS + MILESTONES
======================================= */

function buildMilestoneInsights(
  gardenData: GardenData,
): SprigInsight[] {
  const insights:
    SprigInsight[] =
    []

  const groups =
    new Map<
      string,
      PlantStory[]
    >()

  for (
    const plant of
    gardenData.plantStories
  ) {
    const key =
      getPlantGroupKey(
        plant,
      )

    if (
      !key
    ) {
      continue
    }

    groups.set(
      key,
      [
        ...(
          groups.get(
            key,
          ) ??
          []
        ),
        plant,
      ],
    )
  }

  for (
    const [
      key,
      plants,
    ] of groups
  ) {
    if (
      plants.length !==
      1
    ) {
      continue
    }

    const plant =
      plants[
        0
      ]

    if (
      !plant
    ) {
      continue
    }

    const hasHarvest =
      Boolean(
        getFirstHarvest(
          plant.id,
          gardenData.harvests ??
          [],
        ),
      )

    const isComplete =
      plant.status ===
        'finished' ||
      plant.status ===
        'failed'

    if (
      !hasHarvest &&
      !isComplete
    ) {
      continue
    }

    const cropLabel =
      getPlantGroupLabel(
        plant,
      )

    insights.push({
      id:
        `first-story-${key}`,

      family:
        'milestone',

      eyebrow:
        'A first for your garden',

      title:
        `${cropLabel} now has a story Sprig can remember`,

      message:
        `This is currently the first ${cropLabel} Plant Story in Sprig with enough lived history to become useful context next time you grow it.`,

      strength:
        'individual',

      priority:
        40,

      reasoning:
        `There is currently one ${cropLabel} Plant Story in Sprig. Sprig will treat it as an individual experience, not a pattern.`,

      evidence: [
        {
          recordType:
            'plant-story',

          recordId:
            plant.id,

          label:
            getPlantLabel(
              plant,
            ),
        },
      ],

      actions: [
        {
          type:
            'open-plant',

          label:
            'See the story',

          plantStoryId:
            plant.id,
        },
      ],

      subjectKey:
        `first:${key}`,

      plantStoryIds: [
        plant.id,
      ],
    })
  }

  return insights
}

/* =======================================
   BALANCING
======================================= */

function deduplicateInsights(
  insights: SprigInsight[],
): SprigInsight[] {
  const seenIds =
    new Set<
      string
    >()

  const result:
    SprigInsight[] =
    []

  for (
    const insight of
    insights
  ) {
    if (
      seenIds.has(
        insight.id,
      )
    ) {
      continue
    }

    seenIds.add(
      insight.id,
    )

    result.push(
      insight,
    )
  }

  return result
}

function balanceInsights(
  insights: SprigInsight[],
): SprigInsight[] {
  const sorted =
    [
      ...insights,
    ].sort(
      (
        left,
        right,
      ) =>
        right.priority -
        left.priority,
    )

  const subjectCounts =
    new Map<
      string,
      number
    >()

  const balanced:
    SprigInsight[] =
    []

  for (
    const insight of
    sorted
  ) {
    const subject =
      insight.subjectKey

    if (
      !subject
    ) {
      balanced.push(
        insight,
      )

      continue
    }

    const count =
      subjectCounts.get(
        subject,
      ) ??
      0

    if (
      count >=
      2
    ) {
      continue
    }

    subjectCounts.set(
      subject,
      count +
      1,
    )

    balanced.push(
      insight,
    )
  }

  return balanced
}

/* =======================================
   MAIN ENGINE
======================================= */

export function buildSprigInsights(
  gardenData: GardenData,
): SprigInsightResult {
  const baselines =
    buildSprigPlantBaselines(
      gardenData,
    )

  const allInsights = [
    ...buildHarvestWindowInsights(
      gardenData,
    ),

    ...buildCurrentVsHistoryInsights(
      gardenData,
      baselines,
    ),

    ...buildHistoricalBaselineInsights(
      baselines,
    ),

    ...buildComparisonInsights(
      gardenData,
    ),

    ...buildPhotoHistoryInsights(
      gardenData,
    ),

    ...buildTrialInsights(
      gardenData,
    ),

    ...buildMilestoneInsights(
      gardenData,
    ),

    ...buildQuietStoryInsights(
      gardenData,
    ),

    ...buildCurrentPlantMathInsights(
      gardenData,
    ),
  ]

  const insights =
    balanceInsights(
      deduplicateInsights(
        allInsights,
      ),
    )

  return {
    generatedAt:
      new Date()
        .toISOString(),

    insights,

    baselines,

    summary: {
      totalInsights:
        insights.length,

      happeningNow:
        insights.filter(
          insight =>
            insight.family ===
              'happening-now' ||
            insight.family ===
              'garden-maths',
        ).length,

      fromYourGarden:
        insights.filter(
          insight =>
            insight.family ===
            'from-your-garden',
        ).length,

      worthWatching:
        insights.filter(
          insight =>
            insight.family ===
            'worth-watching',
        ).length,

      milestones:
        insights.filter(
          insight =>
            insight.family ===
            'milestone',
        ).length,
    },
  }
}

/* =======================================
   DISPLAY HELPERS
======================================= */

export function getSprigInsightStrengthLabel(
  strength:
    SprigEvidenceStrength,
): string {
  return (
    SPRIG_EVIDENCE_STRENGTHS.find(
      item =>
        item.id ===
        strength,
    )?.label ??
    'Just noticed'
  )
}

export function getSprigInsightStrengthDescription(
  strength:
    SprigEvidenceStrength,
): string {
  return (
    SPRIG_EVIDENCE_STRENGTHS.find(
      item =>
        item.id ===
        strength,
    )?.description ??
    ''
  )
}

export function getSprigInsightFamilyLabel(
  family:
    SprigInsightFamily,
): string {
  switch (
    family
  ) {
    case 'garden-maths':
      return 'A little garden maths'

    case 'happening-now':
      return 'Happening now'

    case 'from-your-garden':
      return 'From your garden'

    case 'worth-watching':
      return 'Worth watching'

    case 'milestone':
      return 'A little milestone'

    case 'comparison':
      return 'A useful comparison'

    case 'photographs':
      return 'A story you can see'

    case 'trial':
      return 'Garden Trial'

    default:
      return 'Sprig noticed'
  }
}



/* =======================================
 SPRIG SMART EDITORIAL JUDGEMENT
======================================= */

/*
* Sprig Intelligence may derive many valid
* observations.
*
* Sprig Smart is a broader window than Today,
* but it is still editorial.
*
* The page should surface a useful handful,
* not dump every calculation Sprig can make.
*
* Key principles:
*
* 1. Garden maths remains underneath unless it
*    has become relevant through another family.
* 2. Early garden memory is allowed through,
*    even when evidence strength is still
*    individual.
* 3. Repeated "first baseline" milestones do not
*    take over the page.
* 4. Similar observations about the same plant
*    are discouraged.
* 5. Comparison, timing, trials and photographs
*    can all contribute when genuinely useful.
* 6. Sprig Smart does not fill space merely to
*    reach a target number.
*/


function getSprigSmartStrengthRank(
strength:
  SprigEvidenceStrength,
): number {
switch (
  strength
) {
  case 'repeated':
    return 4

  case 'emerging':
    return 3

  case 'worth-watching':
    return 2

  case 'individual':
  default:
    return 1
}
}


function getSprigSmartTheme(
insight:
  SprigInsight,
):
| 'current-timing'
| 'garden-memory'
| 'comparison'
| 'photographs'
| 'trial'
| 'quiet-story'
| 'other' {
switch (
  insight.family
) {
  case 'happening-now':
    return 'current-timing'

  case 'worth-watching':
    return insight.id.startsWith(
      'quiet-story-',
    )
      ? 'quiet-story'
      : 'current-timing'

  case 'from-your-garden':
  case 'milestone':
    return 'garden-memory'

  case 'comparison':
    return 'comparison'

  case 'photographs':
    return 'photographs'

  case 'trial':
    return 'trial'

  default:
    return 'other'
}
}


function isUsefulSprigSmartCandidate(
insight:
  SprigInsight,
): boolean {
switch (
  insight.family
) {
  case 'garden-maths':
    return false

  case 'happening-now':
    return (
      insight.priority >=
      60
    )

  case 'worth-watching':
    return (
      insight.priority >=
      60
    )

  case 'comparison':
    return (
      insight.priority >=
      50
    )

  case 'from-your-garden':
    return (
      insight.priority >=
        50 ||
      getSprigSmartStrengthRank(
        insight.strength,
      ) >=
        2
    )

  case 'milestone':
    /*
     * Early gardens genuinely benefit from
     * seeing that Sprig has begun to establish
     * personal history.
     *
     * These can therefore appear at individual
     * evidence strength, but later selection
     * rules stop them stacking endlessly.
     */
    return (
      insight.priority >=
      40
    )

  case 'photographs':
    return (
      insight.priority >=
        50 ||
      insight.evidence.length >=
        2
    )

  case 'trial':
    return (
      insight.priority >=
        55 ||
      getSprigSmartStrengthRank(
        insight.strength,
      ) >=
        2
    )

  default:
    return false
}
}


function sprigSmartInsightsSharePlants(
left:
  SprigInsight,

right:
  SprigInsight,
): boolean {
const leftIds =
  left.plantStoryIds ??
  []

const rightIds =
  right.plantStoryIds ??
  []

if (
  leftIds.length ===
    0 ||
  rightIds.length ===
    0
) {
  return false
}

return leftIds.some(
  plantId =>
    rightIds.includes(
      plantId,
    ),
)
}


function compareSprigSmartInsights(
left:
  SprigInsight,

right:
  SprigInsight,
): number {
/*
 * Priority is the first editorial signal.
 *
 * Evidence strength then separates observations
 * with similar relevance.
 */

const priorityDifference =
  right.priority -
  left.priority

if (
  priorityDifference !==
  0
) {
  return priorityDifference
}

const strengthDifference =
  getSprigSmartStrengthRank(
    right.strength,
  ) -
  getSprigSmartStrengthRank(
    left.strength,
  )

if (
  strengthDifference !==
  0
) {
  return strengthDifference
}

return (
  right.evidence.length -
  left.evidence.length
)
}


/* =======================================
 SPRIG SMART SELECTION
======================================= */

/*
* This is deliberately separate from Today.
*
* Today asks:
* "What deserves attention right now?"
*
* Sprig Smart asks:
* "What useful things has the garden begun
*  to teach Sprig?"
*
* Same Intelligence.
* Different editorial window.
*/

export function getSprigSmartInsights(
result:
  SprigInsightResult,

limit:
  number =
  7,
):
SprigInsight[] {
const maximum =
  Math.max(
    0,
    Math.min(
      limit,
      9,
    ),
  )

if (
  maximum ===
  0
) {
  return []
}

const candidates =
  result
    .insights
    .filter(
      isUsefulSprigSmartCandidate,
    )
    .sort(
      compareSprigSmartInsights,
    )

const selected:
  SprigInsight[] =
  []

const themeCounts =
  new Map<
    ReturnType<
      typeof getSprigSmartTheme
    >,
    number
  >()

let milestoneCount =
  0


for (
  const insight of
  candidates
) {
  if (
    selected.length >=
    maximum
  ) {
    break
  }

  const theme =
    getSprigSmartTheme(
      insight,
    )

  const themeCount =
    themeCounts.get(
      theme,
    ) ??
    0


  /*
   * Garden-memory is valuable, but it is the
   * family most likely to become repetitive
   * while Sprig is young.
   *
   * Example:
   * "first baseline for Royal Blue"
   * "first baseline for Sebago"
   * "first baseline for Ox Heart"
   *
   * Allow two garden-memory items in Sprig
   * Smart, but no more.
   */

  if (
    theme ===
      'garden-memory' &&
    themeCount >=
      2
  ) {
    continue
  }


  /*
   * Within garden-memory, only one plain
   * milestone is normally needed.
   *
   * A stronger "from your garden" history can
   * still sit beside it.
   */

  if (
    insight.family ===
      'milestone'
  ) {
    if (
      milestoneCount >=
      1
    ) {
      continue
    }
  }


  /*
   * Current-timing can occasionally contain
   * more than one genuinely useful item, but
   * we still stop it becoming a wall.
   */

  if (
    theme ===
      'current-timing' &&
    themeCount >=
      2
  ) {
    continue
  }


  /*
   * Comparison, photographs and trials each
   * get one normal place on the page.
   */

  if (
    (
      theme ===
        'comparison' ||
      theme ===
        'photographs' ||
      theme ===
        'trial'
    ) &&
    themeCount >=
      1
  ) {
    continue
  }


  /*
   * Avoid another lower-value observation about
   * a Plant Story already represented.
   *
   * Exception:
   * very high-priority observations can still
   * coexist if they are independently important.
   */

  const overlapping =
    selected.find(
      existing =>
        sprigSmartInsightsSharePlants(
          insight,
          existing,
        ),
    )

  if (
    overlapping &&
    insight.priority <
      90
  ) {
    continue
  }


  selected.push(
    insight,
  )

  themeCounts.set(
    theme,
    themeCount +
    1,
  )

  if (
    insight.family ===
      'milestone'
  ) {
    milestoneCount +=
      1
  }
}


/*
 * A young garden may still be sparse after the
 * main editorial pass.
 *
 * If Sprig Smart has fewer than four useful
 * observations, allow one additional early
 * garden-memory item before accepting silence.
 *
 * We still do not introduce garden maths here.
 */

if (
  selected.length <
  Math.min(
    4,
    maximum,
  )
) {
  const extraGardenMemory =
    candidates.find(
      insight =>
        (
          insight.family ===
            'milestone' ||
          insight.family ===
            'from-your-garden'
        ) &&
        !selected.some(
          chosen =>
            chosen.id ===
            insight.id,
        ),
    )

  if (
    extraGardenMemory
  ) {
    selected.push(
      extraGardenMemory,
    )
  }
}


return selected.slice(
  0,
  maximum,
)
}


/* =======================================
PLANT STORY CONTEXT
======================================= */

/*
* Plant Detail is a contextual window into the
* same shared Sprig Intelligence system.
*
* It asks:
*
* "Is there anything Sprig has noticed that is
* specifically useful while I am looking at
* this Plant Story?"
*
* This is deliberately narrower than Sprig
* Smart.
*
* Rules:
*
* 1. The observation must actually belong to
*    this Plant Story through plantStoryIds or
*    explicit Plant Story evidence.
*
* 2. Raw garden maths stays underneath. Plant
*    Detail already knows which story it is
*    showing and does not need Sprig narrating
*    every available calculation.
*
* 3. Current timing and worth-watching
*    observations get first consideration.
*
* 4. A comparison involving this story can be
*    especially useful here because the
*    gardener is already looking at one side of
*    that comparison.
*
* 5. Photographic history can appear when it
*    has become genuinely useful.
*
* 6. Garden memory may appear when it is
*    specifically connected to this story.
*
* 7. Silence is legitimate. Plant Detail does
*    not need an Intelligence card merely to
*    fill space.
*/


type SprigPlantInsightTheme =
| 'attention'
| 'comparison'
| 'photographs'
| 'garden-memory'
| 'trial'
| 'other'


function insightBelongsToPlant(
insight:
  SprigInsight,

plantStoryId:
  string,
): boolean {
if (
  insight.plantStoryIds?.includes(
    plantStoryId,
  )
) {
  return true
}

return insight.evidence.some(
  evidence =>
    evidence.recordType ===
      'plant-story' &&
    evidence.recordId ===
      plantStoryId,
)
}


function getSprigPlantInsightTheme(
insight:
  SprigInsight,
): SprigPlantInsightTheme {
switch (
  insight.family
) {
  case 'happening-now':
  case 'worth-watching':
    return 'attention'

  case 'comparison':
    return 'comparison'

  case 'photographs':
    return 'photographs'

  case 'from-your-garden':
  case 'milestone':
    return 'garden-memory'

  case 'trial':
    return 'trial'

  default:
    return 'other'
}
}


function isUsefulPlantInsightCandidate(
insight:
  SprigInsight,
): boolean {
switch (
  insight.family
) {
  case 'garden-maths':
    return false

  case 'happening-now':
    return (
      insight.priority >=
      60
    )

  case 'worth-watching':
    return (
      insight.priority >=
      60
    )

  case 'comparison':
    return (
      insight.priority >=
      50
    )

  case 'photographs':
    return (
      insight.priority >=
      50
    )

  case 'from-your-garden':
    return (
      insight.priority >=
        50 ||
      getSprigSmartStrengthRank(
        insight.strength,
      ) >=
        2
    )

  case 'milestone':
    return (
      insight.priority >=
      40
    )

  case 'trial':
    return (
      insight.priority >=
        55 ||
      getSprigSmartStrengthRank(
        insight.strength,
      ) >=
        2
    )

  default:
    return false
}
}


function comparePlantContextInsights(
left:
  SprigInsight,

right:
  SprigInsight,
): number {
/*
 * On Plant Detail, immediate attention is
 * slightly more valuable than general garden
 * memory, even if the broader observation has
 * respectable evidence strength.
 */

const getContextRank = (
  insight:
    SprigInsight,
): number => {
  switch (
    insight.family
  ) {
    case 'happening-now':
      return 6

    case 'worth-watching':
      return 5

    case 'comparison':
      return 4

    case 'photographs':
      return 3

    case 'from-your-garden':
      return 2

    case 'milestone':
      return 1

    case 'trial':
      return 1

    default:
      return 0
  }
}


const contextDifference =
  getContextRank(
    right,
  ) -
  getContextRank(
    left,
  )

if (
  contextDifference !==
  0
) {
  return contextDifference
}


const priorityDifference =
  right.priority -
  left.priority

if (
  priorityDifference !==
  0
) {
  return priorityDifference
}


const strengthDifference =
  getSprigSmartStrengthRank(
    right.strength,
  ) -
  getSprigSmartStrengthRank(
    left.strength,
  )

if (
  strengthDifference !==
  0
) {
  return strengthDifference
}


return (
  right.evidence.length -
  left.evidence.length
)
}


/* =======================================
PLANT STORY SELECTION
======================================= */

export function getSprigInsightsForPlant(
result:
  SprigInsightResult,

plantStoryId:
  string,

limit:
  number =
  3,
): SprigInsight[] {
const cleanPlantStoryId =
  plantStoryId.trim()

const maximum =
  Math.max(
    0,
    Math.min(
      limit,
      3,
    ),
  )


if (
  !cleanPlantStoryId ||
  maximum ===
    0
) {
  return []
}


const candidates =
  result.insights
    .filter(
      insight =>
        insightBelongsToPlant(
          insight,
          cleanPlantStoryId,
        ),
    )
    .filter(
      isUsefulPlantInsightCandidate,
    )
    .sort(
      comparePlantContextInsights,
    )


const selected:
  SprigInsight[] =
  []

const selectedThemes =
  new Set<
    SprigPlantInsightTheme
  >()


for (
  const insight of
  candidates
) {
  if (
    selected.length >=
    maximum
  ) {
    break
  }


  const theme =
    getSprigPlantInsightTheme(
      insight,
    )


  /*
   * One observation from each contextual
   * theme is normally enough on Plant Detail.
   *
   * The exception is attention. Two genuinely
   * important current observations may both
   * matter, for example:
   *
   * - beyond expected harvest timing
   * - later than this garden's own history
   */

  if (
    selectedThemes.has(
      theme,
    )
  ) {
    if (
      theme !==
        'attention'
    ) {
      continue
    }

    const existingAttentionCount =
      selected.filter(
        existing =>
          getSprigPlantInsightTheme(
            existing,
          ) ===
          'attention',
      ).length

    if (
      existingAttentionCount >=
      2
    ) {
      continue
    }

    /*
     * A second attention item must be strong
     * enough to justify the extra interruption.
     */

    if (
      insight.priority <
      85
    ) {
      continue
    }
  }


  selected.push(
    insight,
  )

  selectedThemes.add(
    theme,
  )
}


return selected
}


/* =======================================
 PLANT COMPARISON CONTEXT
======================================= */

/*
* Compare Plants is another contextual window
* into the same shared Sprig Intelligence.
*
* It asks:
*
* "Has Sprig already noticed anything that is
* useful specifically because these Plant
* Stories are being looked at together?"
*
* This selector does not calculate a second
* comparison system.
*
* The comparison tables remain the gardener's
* direct evidence-exploration tools. This
* selector only chooses relevant observations
* that the shared Intelligence engine has
* already derived.
*
* Rules:
*
* 1. An observation must connect to the selected
*    Plant Stories through explicit Plant Story
*    relationships or evidence.
*
* 2. Comparison observations are strongest when
*    they involve at least two of the stories
*    currently on the comparison page.
*
* 3. A single-story observation may appear only
*    when it adds genuinely useful context to the
*    comparison, such as unusual timing against
*    this garden's history.
*
* 4. Raw garden maths stays underneath. The
*    comparison tables already expose direct
*    calculations.
*
* 5. Plain milestones do not belong here merely
*    because one of the selected stories has a
*    remembered history.
*
* 6. Photographic observations may appear when
*    they help explain why visual comparison is
*    useful.
*
* 7. Silence is legitimate. Compare Plants does
*    not need an Intelligence observation simply
*    because several stories are on screen.
*/


type SprigComparisonInsightTheme =
| 'direct-comparison'
| 'timing'
| 'photographs'
| 'garden-history'
| 'trial'
| 'other'


function getInsightPlantStoryIds(
insight:
  SprigInsight,
): string[] {
const ids =
  new Set<string>(
    insight.plantStoryIds ??
    [],
  )

insight.evidence.forEach(
  evidence => {
    if (
      evidence.recordType ===
      'plant-story'
    ) {
      ids.add(
        evidence.recordId,
      )
    }
  },
)

return Array.from(
  ids,
)
}


function getSelectedComparisonPlantIds(
insight:
  SprigInsight,

selectedPlantStoryIds:
  Set<string>,
): string[] {
return getInsightPlantStoryIds(
  insight,
).filter(
  plantStoryId =>
    selectedPlantStoryIds.has(
      plantStoryId,
    ),
)
}


function getSprigComparisonInsightTheme(
insight:
  SprigInsight,
): SprigComparisonInsightTheme {
switch (
  insight.family
) {
  case 'comparison':
    return 'direct-comparison'

  case 'happening-now':
  case 'worth-watching':
    return 'timing'

  case 'photographs':
    return 'photographs'

  case 'from-your-garden':
    return 'garden-history'

  case 'trial':
    return 'trial'

  default:
    return 'other'
}
}


function isUsefulComparisonInsightCandidate(
insight:
  SprigInsight,

selectedPlantStoryIds:
  Set<string>,
): boolean {
const matchingPlantIds =
  getSelectedComparisonPlantIds(
    insight,
    selectedPlantStoryIds,
  )


if (
  matchingPlantIds.length ===
  0
) {
  return false
}


switch (
  insight.family
) {
  case 'garden-maths':
    return false


  case 'milestone':
    /*
     * "This is Sprig's first Royal Blue story"
     * can be useful on Plant Detail, but it does
     * not become comparison insight merely
     * because Royal Blue is one selected column.
     */
    return false


  case 'comparison':
    /*
     * A direct comparison observation belongs
     * here only when at least two of the Plant
     * Stories it refers to are actually selected.
     */
    return (
      matchingPlantIds.length >=
        2 &&
      insight.priority >=
        50
    )


  case 'happening-now':
    return (
      insight.priority >=
      70
    )


  case 'worth-watching':
    /*
     * Quiet-story reminders are useful on Today
     * or Plant Detail, but do not help explain a
     * comparison.
     */
    if (
      insight.id.startsWith(
        'quiet-story-',
      )
    ) {
      return false
    }

    return (
      insight.priority >=
      70
    )


  case 'photographs':
    return (
      insight.priority >=
      50
    )


  case 'from-your-garden':
    return (
      insight.priority >=
        55 &&
      getSprigSmartStrengthRank(
        insight.strength,
      ) >=
        2
    )


  case 'trial':
    return (
      matchingPlantIds.length >=
        2 &&
      (
        insight.priority >=
          55 ||
        getSprigSmartStrengthRank(
          insight.strength,
        ) >=
          2
      )
    )


  default:
    return false
}
}


function compareComparisonContextInsights(
left:
  SprigInsight,

right:
  SprigInsight,

selectedPlantStoryIds:
  Set<string>,
): number {
const getContextRank = (
  insight:
    SprigInsight,
): number => {
  switch (
    insight.family
  ) {
    case 'comparison':
      return 6

    case 'worth-watching':
      return 5

    case 'happening-now':
      return 4

    case 'from-your-garden':
      return 3

    case 'photographs':
      return 2

    case 'trial':
      return 1

    default:
      return 0
  }
}


/*
 * Prefer observations that genuinely connect
 * more of the stories currently being compared.
 */

const leftCoverage =
  getSelectedComparisonPlantIds(
    left,
    selectedPlantStoryIds,
  ).length

const rightCoverage =
  getSelectedComparisonPlantIds(
    right,
    selectedPlantStoryIds,
  ).length


const coverageDifference =
  rightCoverage -
  leftCoverage

if (
  coverageDifference !==
  0
) {
  return coverageDifference
}


const contextDifference =
  getContextRank(
    right,
  ) -
  getContextRank(
    left,
  )

if (
  contextDifference !==
  0
) {
  return contextDifference
}


const priorityDifference =
  right.priority -
  left.priority

if (
  priorityDifference !==
  0
) {
  return priorityDifference
}


const strengthDifference =
  getSprigSmartStrengthRank(
    right.strength,
  ) -
  getSprigSmartStrengthRank(
    left.strength,
  )

if (
  strengthDifference !==
  0
) {
  return strengthDifference
}


return (
  right.evidence.length -
  left.evidence.length
)
}


/* =======================================
 PLANT COMPARISON SELECTION
======================================= */

export function getSprigInsightsForComparison(
result:
  SprigInsightResult,

plantStoryIds:
  string[],

limit:
  number =
  3,
): SprigInsight[] {
const selectedPlantStoryIds =
  new Set(
    plantStoryIds
      .map(
        plantStoryId =>
          plantStoryId.trim(),
      )
      .filter(
        Boolean,
      ),
  )


const maximum =
  Math.max(
    0,
    Math.min(
      limit,
      3,
    ),
  )


if (
  selectedPlantStoryIds.size <
    2 ||
  maximum ===
    0
) {
  return []
}


const candidates =
  result.insights
    .filter(
      insight =>
        isUsefulComparisonInsightCandidate(
          insight,
          selectedPlantStoryIds,
        ),
    )
    .sort(
      (
        left,
        right,
      ) =>
        compareComparisonContextInsights(
          left,
          right,
          selectedPlantStoryIds,
        ),
    )


const selected:
  SprigInsight[] =
  []

const selectedThemes =
  new Set<
    SprigComparisonInsightTheme
  >()


for (
  const insight of
  candidates
) {
  if (
    selected.length >=
    maximum
  ) {
    break
  }


  const theme =
    getSprigComparisonInsightTheme(
      insight,
    )


  /*
   * Normally one observation per comparison
   * theme is enough.
   *
   * Direct comparisons are the exception. If
   * Sprig eventually derives two independently
   * useful comparison observations involving
   * different selected stories, both may earn a
   * place.
   */

  if (
    selectedThemes.has(
      theme,
    )
  ) {
    if (
      theme !==
        'direct-comparison'
    ) {
      continue
    }


    const directComparisonCount =
      selected.filter(
        existing =>
          getSprigComparisonInsightTheme(
            existing,
          ) ===
          'direct-comparison',
      ).length


    if (
      directComparisonCount >=
      2
    ) {
      continue
    }


    /*
     * A second direct comparison needs enough
     * priority to justify another Intelligence
     * card on an already data-rich page.
     */

    if (
      insight.priority <
      70
    ) {
      continue
    }
  }


  /*
   * Single-story context is allowed, but once
   * one such observation is present we prefer
   * not to stack several unrelated individual
   * observations beside a multi-story
   * comparison.
   */

  const matchingPlantIds =
    getSelectedComparisonPlantIds(
      insight,
      selectedPlantStoryIds,
    )


  if (
    matchingPlantIds.length ===
      1
  ) {
    const alreadyHasSingleStoryContext =
      selected.some(
        existing =>
          getSelectedComparisonPlantIds(
            existing,
            selectedPlantStoryIds,
          ).length ===
            1,
      )


    if (
      alreadyHasSingleStoryContext
    ) {
      continue
    }
  }


  selected.push(
    insight,
  )

  selectedThemes.add(
    theme,
  )
}


return selected
}


/* =======================================
   TODAY EDITORIAL JUDGEMENT
======================================= */

/*
 * The engine may notice many valid things.
 * Today is scarce front-porch space.
 *
 * Priority ranks an insight against similar
 * insights. It does NOT automatically make a
 * family worthy of Today. Family-specific
 * editorial rules decide that separately.
 */

type SprigTodayTheme =
  | 'current-timing'
  | 'garden-memory'
  | 'comparison'
  | 'photographs'
  | 'trial'
  | 'quiet-story'
  | 'garden-maths'
  | 'other'

function getSprigTodayTheme(
  insight:
    SprigInsight,
): SprigTodayTheme {
  switch (
    insight.family
  ) {
    case 'happening-now':
      return 'current-timing'

    case 'from-your-garden':
    case 'milestone':
      return 'garden-memory'

    case 'comparison':
      return 'comparison'

    case 'photographs':
      return 'photographs'

    case 'trial':
      return 'trial'

    case 'worth-watching':
      return insight.id.startsWith(
        'quiet-story-',
      )
        ? 'quiet-story'
        : 'current-timing'

    case 'garden-maths':
      return 'garden-maths'

    default:
      return 'other'
  }
}

function getStrengthRank(
  strength:
    SprigEvidenceStrength,
): number {
  switch (
    strength
  ) {
    case 'repeated':
      return 4

    case 'emerging':
      return 3

    case 'worth-watching':
      return 2

    case 'individual':
    default:
      return 1
  }
}

function isStrongTodayCandidate(
  insight:
    SprigInsight,
): boolean {
  switch (
    insight.family
  ) {
    case 'comparison':
      return (
        insight.priority >=
        60
      )

    case 'from-your-garden':
      return (
        insight.priority >=
          55 &&
        getStrengthRank(
          insight.strength,
        ) >=
          3
      )

    case 'photographs':
      return (
        insight.priority >=
          55 &&
        getStrengthRank(
          insight.strength,
        ) >=
          2
      )

    case 'trial':
      return (
        insight.priority >=
          65 ||
        getStrengthRank(
          insight.strength,
        ) >=
          3
      )

    case 'worth-watching':
      return (
        insight.priority >=
        65
      )

    case 'happening-now':
      return (
        insight.priority >=
        65
      )

    case 'milestone':
      return (
        insight.priority >=
          60 &&
        getStrengthRank(
          insight.strength,
        ) >=
          3
      )

    case 'garden-maths':
    default:
      return false
  }
}

function insightsSharePlants(
  left:
    SprigInsight,

  right:
    SprigInsight,
): boolean {
  const leftIds =
    left.plantStoryIds ??
    []

  const rightIds =
    right.plantStoryIds ??
    []

  if (
    leftIds.length ===
      0 ||
    rightIds.length ===
      0
  ) {
    return false
  }

  return leftIds.some(
    plantId =>
      rightIds.includes(
        plantId,
      ),
  )
}

function canShowSecondFromFamily(
  insight:
    SprigInsight,

  selectedFromFamily:
    SprigInsight[],
): boolean {
  if (
    selectedFromFamily.length ===
    0
  ) {
    return true
  }

  if (
    selectedFromFamily.length >=
    2
  ) {
    return false
  }

  if (
    insight.priority <
    90
  ) {
    return false
  }

  const existing =
    selectedFromFamily[
      0
    ]

  if (
    !existing
  ) {
    return true
  }

  if (
    insightsSharePlants(
      insight,
      existing,
    )
  ) {
    return false
  }

  return true
}

function getGentleTodayFallback(
  result:
    SprigInsightResult,
): SprigInsight | undefined {
  const comparison =
    result.insights.find(
      insight =>
        insight.family ===
          'comparison' &&
        insight.priority >=
          55,
    )

  if (
    comparison
  ) {
    return comparison
  }

  const milestone =
    result.insights.find(
      insight =>
        insight.family ===
          'milestone' &&
      insight.priority >=
        40,
    )

  if (
    milestone
  ) {
    return milestone
  }

  return result.insights.find(
    insight =>
      insight.family ===
      'garden-maths',
  )
}

/* =======================================
   TODAY SELECTION
======================================= */

export function getSprigTodayInsights(
  result:
    SprigInsightResult,

  limit =
    3,
): SprigInsight[] {
  const maximum =
    Math.max(
      0,
      Math.min(
        limit,
        3,
      ),
    )

  if (
    maximum ===
    0
  ) {
    return []
  }

  const selected:
    SprigInsight[] =
    []

  const selectedThemes =
    new Map<
      SprigTodayTheme,
      SprigInsight[]
    >()

  const selectedFamilies =
    new Map<
      SprigInsightFamily,
      SprigInsight[]
    >()

  const candidates =
    result.insights.filter(
      isStrongTodayCandidate,
    ).sort(
      (
        left,
        right,
      ) =>
        right.priority - left.priority ||
        getStrengthRank(right.strength) - getStrengthRank(left.strength) ||
        right.evidence.length - left.evidence.length,
    )

  for (
    const insight of
    candidates
  ) {
    if (
      selected.length >=
      maximum
    ) {
      break
    }

    const theme =
      getSprigTodayTheme(
        insight,
      )

    const sameTheme =
      selectedThemes.get(
        theme,
      ) ??
      []

    const sameFamily =
      selectedFamilies.get(
        insight.family,
      ) ??
      []

    if (
      theme ===
        'garden-memory' &&
      sameTheme.length >=
        1
    ) {
      continue
    }

    if (
      sameTheme.length >=
        1 &&
      insight.priority <
        90
    ) {
      continue
    }

    if (
      !canShowSecondFromFamily(
        insight,
        sameFamily,
      )
    ) {
      continue
    }

    const overlapping =
      selected.find(
        existing =>
          insightsSharePlants(
            insight,
            existing,
          ),
      )

    if (
      overlapping &&
      insight.priority <
        90
    ) {
      continue
    }

    selected.push(
      insight,
    )

    selectedThemes.set(
      theme,
      [
        ...sameTheme,
        insight,
      ],
    )

    selectedFamilies.set(
      insight.family,
      [
        ...sameFamily,
        insight,
      ],
    )
  }

  /*
   * Silence is legitimate.
   *
   * A fallback is used only when there are no
   * strong Today observations at all. We do not
   * fill empty slots for decoration.
   */
  if (
    selected.length ===
    0
  ) {
    const fallback =
      getGentleTodayFallback(
        result,
      )

    if (
      fallback
    ) {
      return [
        fallback,
      ]
    }
  }

  return selected
}
