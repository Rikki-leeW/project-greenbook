import type {
    GardenData,
    GardenEvent,
    GardenTrial,
    HarvestRecord,
    PlantStory,
  } from '../types'
  
  
  /* =======================================
     SPRIG INTELLIGENCE
  ======================================= */
  
  /*
   * Sprig Intelligence is DERIVED.
   *
   * It does not own garden truth.
   *
   * Plant Stories own plants.
   * Journal owns events.
   * Harvests own harvests.
   * Trials own deliberate questions.
   * Gallery records own Gallery photographs.
   *
   * This engine reads those records and notices
   * useful relationships between them.
   *
   * If the source records change, Sprig's
   * understanding changes with them.
   */
  
  
  /* =======================================
     INSIGHT FAMILIES
  ======================================= */
  
  export type SprigInsightFamily =
    | 'garden-maths'
    | 'happening-now'
    | 'from-your-garden'
    | 'worth-watching'
    | 'milestone'
    | 'comparison'
    | 'photographs'
    | 'trial'
  
  
  /* =======================================
     EVIDENCE STRENGTH
  ======================================= */
  
  export type SprigEvidenceStrength =
    | 'individual'
    | 'worth-watching'
    | 'emerging'
    | 'repeated'
  
  
  export interface SprigEvidenceStrengthInfo {
    id:
      SprigEvidenceStrength
  
    label:
      string
  
    description:
      string
  }
  
  
  export const SPRIG_EVIDENCE_STRENGTHS:
    SprigEvidenceStrengthInfo[] = [
      {
        id:
          'individual',
  
        label:
          'Just noticed',
  
        description:
          'This is based on one story, one event, or very limited evidence.',
      },
  
      {
        id:
          'worth-watching',
  
        label:
          'Worth watching',
  
        description:
          'There is something interesting here, but not enough repetition to call it a pattern.',
      },
  
      {
        id:
          'emerging',
  
        label:
          'Emerging pattern',
  
        description:
          'Several related records are beginning to point in the same direction.',
      },
  
      {
        id:
          'repeated',
  
        label:
          'Repeated in your garden',
  
        description:
          'Sprig has several independent examples showing a similar pattern in this garden.',
      },
    ]
  
  
  /* =======================================
     EVIDENCE REFERENCES
  ======================================= */
  
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
    recordType:
      SprigEvidenceRecordType
  
    recordId:
      string
  
    label:
      string
  
    detail?:
      string
  }
  
  
  /* =======================================
     SUGGESTED ACTIONS
  ======================================= */
  
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
    type:
      SprigInsightActionType
  
    label:
      string
  
    plantStoryId?:
      string
  
    plantStoryIds?:
      string[]
  
    gardenTrialId?:
      string
  }
  
  
  /* =======================================
     INSIGHT
  ======================================= */
  
  export interface SprigInsight {
    id:
      string
  
    family:
      SprigInsightFamily
  
    eyebrow:
      string
  
    title:
      string
  
    message:
      string
  
    strength:
      SprigEvidenceStrength
  
    /*
     * Higher values appear first.
     *
     * This is not a scientific probability.
     * It is only Sprig's display priority.
     */
  
    priority:
      number
  
    /*
     * Short explanation shown when the gardener
     * asks "Why did Sprig notice this?"
     */
  
    reasoning:
      string
  
    evidence:
      SprigInsightEvidence[]
  
    actions?:
      SprigInsightAction[]
  
    /*
     * Used to avoid filling Today with several
     * versions of essentially the same thought.
     */
  
    subjectKey?:
      string
  
    /*
     * Useful when a finding belongs primarily
     * to a particular Plant Story.
     */
  
    plantStoryIds?:
      string[]
  
    /*
     * Date connected to the observation where
     * one naturally exists.
     */
  
    relevantDate?:
      string
  }
  
  
  /* =======================================
     BASELINE
  ======================================= */
  
  export interface SprigPlantBaseline {
    key:
      string
  
    plantName:
      string
  
    variety?:
      string
  
    storyCount:
      number
  
    harvestedStoryCount:
      number
  
    completedStoryCount:
      number
  
    firstHarvestDays:
      number[]
  
    medianFirstHarvestDays?:
      number
  
    firstHarvestRangeMin?:
      number
  
    firstHarvestRangeMax?:
      number
  
    completedDurationDays:
      number[]
  
    medianCompletedDurationDays?:
      number
  }
  
  
  /* =======================================
     ENGINE RESULT
  ======================================= */
  
  export interface SprigInsightResult {
    generatedAt:
      string
  
    insights:
      SprigInsight[]
  
    baselines:
      SprigPlantBaseline[]
  
    summary: {
      totalInsights:
        number
  
      happeningNow:
        number
  
      fromYourGarden:
        number
  
      worthWatching:
        number
  
      milestones:
        number
    }
  }
  
  
  /* =======================================
     DATE HELPERS
  ======================================= */
  
  const DAY_MS =
    1000 *
    60 *
    60 *
    24
  
  
  function parseDate(
    value:
      string | undefined,
  ):
    Date | null {
    if (
      !value
    ) {
      return null
    }
  
  
    const safe =
      value.slice(
        0,
        10,
      )
  
  
    const parsed =
      new Date(
        `${safe}T00:00:00`,
      )
  
  
    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return null
    }
  
  
    return parsed
  }
  
  
  function getToday():
    Date {
    const now =
      new Date()
  
  
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    )
  }
  
  
  function differenceInDays(
    later:
      Date,
  
    earlier:
      Date,
  ):
    number {
    return Math.round(
      (
        later.getTime() -
        earlier.getTime()
      ) /
      DAY_MS,
    )
  }
  
  
  function daysBetween(
    earlierValue:
      string | undefined,
  
    laterValue:
      string | undefined,
  ):
    number | undefined {
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
  
  
    if (
      days <
      0
    ) {
      return undefined
    }
  
  
    return days
  }
  
  
  function formatDate(
    value:
      string | undefined,
  ):
    string {
    const parsed =
      parseDate(
        value,
      )
  
  
    if (
      !parsed
    ) {
      return (
        value ??
        ''
      )
    }
  
  
    return parsed
      .toLocaleDateString(
        'en-AU',
        {
          day:
            'numeric',
  
          month:
            'short',
  
          year:
            'numeric',
        },
      )
  }
  
  
  function addDays(
    value:
      string,
  
    days:
      number,
  ):
    string | undefined {
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
  
  
  /* =======================================
     NUMBER HELPERS
  ======================================= */
  
  function median(
    values:
      number[],
  ):
    number | undefined {
    if (
      values.length ===
      0
    ) {
      return undefined
    }
  
  
    const sorted = [
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
          ] +
          sorted[
            middle
          ]
        ) /
        2,
      )
    }
  
  
    return sorted[
      middle
    ]
  }
  
  
  function range(
    values:
      number[],
  ):
    {
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
  
  
  /* =======================================
     TEXT HELPERS
  ======================================= */
  
  function cleanText(
    value:
      string | undefined,
  ):
    string {
    return (
      value ??
      ''
    ).trim()
  }
  
  
  function normalise(
    value:
      string | undefined,
  ):
    string {
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
    plant:
      PlantStory,
  ):
    string {
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
    plant:
      PlantStory,
  ):
    string {
    const crop =
      normalise(
        plant.plantName,
      )
  
  
    const variety =
      normalise(
        plant.variety,
      )
  
  
    if (
      variety
    ) {
      return `${crop}::${variety}`
    }
  
  
    return crop
  }
  
  
  function getPlantGroupLabel(
    plant:
      PlantStory,
  ):
    string {
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
  
  
  /* =======================================
     PLANT TIMING REFERENCE
  ======================================= */
  
  function getPlantTimingReferenceDate(
    plant:
      PlantStory,
  
    gardenData:
      GardenData,
  ):
    string | undefined {
    const reference =
      plant
        .harvestTimingReference
  
  
    if (
      reference
    ) {
      switch (
        reference.sourceType
      ) {
        case 'sown':
          return (
            plant.sownDate ||
            plant.plantedDate
          )
  
  
        case 'planted':
          return (
            plant.plantedDate
          )
  
  
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
                gardenData
                  .purchases ??
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
  
  
          return (
            plant.plantedDate
          )
        }
  
  
        case 'garden-event': {
          if (
            reference.eventId
          ) {
            const event =
              gardenData
                .events
                .find(
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
  
  
          return (
            plant.plantedDate
          )
        }
  
  
        case 'custom-date':
          return (
            reference.customDate ||
            plant.plantedDate
          )
  
  
        default:
          return (
            plant.plantedDate
          )
      }
    }
  
  
    return (
      plant.sownDate ||
      plant.plantedDate
    )
  }
  
  
  /* =======================================
     PLANT COMPLETION DATE
  ======================================= */
  
  function getPlantCompletionDate(
    plant:
      PlantStory,
  
    harvests:
      HarvestRecord[],
  ):
    string | undefined {
    if (
      plant.completedAt
    ) {
      return plant.completedAt
    }
  
  
    const plantHarvests =
      harvests
        .filter(
          harvest =>
            harvest
              .plantStoryIds
              .includes(
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
          harvest
            .plantOutcome ===
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
  
  
  /* =======================================
     PLANT AGE
  ======================================= */
  
  function getPlantAgeDays(
    plant:
      PlantStory,
  
    gardenData:
      GardenData,
  ):
    number | undefined {
    const start =
      getPlantTimingReferenceDate(
        plant,
        gardenData,
      )
  
  
    const startDate =
      parseDate(
        start,
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
  
  
    if (
      days <
      0
    ) {
      return undefined
    }
  
  
    return days
  }
  
  
  /* =======================================
     FRIENDLY DURATION
  ======================================= */
  
  export function formatSprigDuration(
    days:
      number,
  ):
    string {
    if (
      days <
      14
    ) {
      return `${days} ${
        days ===
        1
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
        weeks ===
        1
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
        months ===
        1
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
        years ===
        1
          ? 'year'
          : 'years'
      }`
    }
  
  
    return `${years} ${
      years ===
      1
        ? 'year'
        : 'years'
    }, ${remainingMonths} ${
      remainingMonths ===
      1
        ? 'month'
        : 'months'
    }`
  }
  
  
  /* =======================================
     FIRST HARVEST
  ======================================= */
  
  function getFirstHarvest(
    plantId:
      string,
  
    harvests:
      HarvestRecord[],
  ):
    HarvestRecord | undefined {
    return harvests
      .filter(
        harvest =>
          harvest
            .plantStoryIds
            .includes(
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
  
  
  /* =======================================
     LAST JOURNAL EVENT
  ======================================= */
  
  function getLastPlantEvent(
    plantId:
      string,
  
    events:
      GardenEvent[],
  ):
    GardenEvent | undefined {
    return events
      .filter(
        event =>
          event
            .plantStoryIds
            .includes(
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
  
  
  /* =======================================
     PHOTO DATES
  ======================================= */
  
  function getDatedPlantPhotos(
    plant:
      PlantStory,
  ):
    string[] {
    return (
      plant.photoDates ??
      []
    )
      .filter(
        (
          value,
        ): value is string =>
          Boolean(
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
          left.localeCompare(
            right,
          ),
      )
  }
  
  
  /* =======================================
     EVIDENCE STRENGTH
  ======================================= */
  
  function strengthFromCount(
    count:
      number,
  ):
    SprigEvidenceStrength {
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
  
  
  /* =======================================
     BASELINES
  ======================================= */
  
  export function buildSprigPlantBaselines(
    gardenData:
      GardenData,
  ):
    SprigPlantBaseline[] {
    const groups =
      new Map<
        string,
        PlantStory[]
      >()
  
  
    for (
      const plant of
      gardenData
        .plantStories
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
  
  
      const existing =
        groups.get(
          key,
        ) ??
        []
  
  
      existing.push(
        plant,
      )
  
  
      groups.set(
        key,
        existing,
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
        plants[0]
  
  
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
     INSIGHT BUILDERS
  ======================================= */
  
  function buildCurrentPlantMathInsights(
    gardenData:
      GardenData,
  ):
    SprigInsight[] {
    const insights:
      SprigInsight[] =
      []
  
  
    for (
      const plant of
      gardenData
        .plantStories
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
          `Sprig is counting from the timing reference saved on this Plant Story.`,
  
        strength:
          'individual',
  
        priority:
          18,
  
        reasoning:
          `The saved timing reference for ${label} is ${formatDate(
            getPlantTimingReferenceDate(
              plant,
              gardenData,
            ),
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
    gardenData:
      GardenData,
  ):
    SprigInsight[] {
    const insights:
      SprigInsight[] =
      []
  
  
    const today =
      getToday()
  
  
    for (
      const plant of
      gardenData
        .plantStories
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
        plant
          .expectedHarvestDaysMin ===
          undefined &&
        plant
          .expectedHarvestDaysMax ===
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
        plant
          .expectedHarvestDaysMin ??
        plant
          .expectedHarvestDaysMax
  
  
      const maxDays =
        plant
          .expectedHarvestDaysMax ??
        plant
          .expectedHarvestDaysMin
  
  
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
  
  
      const firstHarvest =
        getFirstHarvest(
          plant.id,
          gardenData.harvests ??
          [],
        )
  
  
      const label =
        getPlantLabel(
          plant,
        )
  
  
      if (
        firstHarvest
      ) {
        continue
      }
  
  
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
            `Based on the timing you gave Sprig, this story is now inside its expected first-harvest window.`,
  
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
              ? `It has only just moved beyond the expected window, so this may simply be normal variation.`
              : `There is no harvest recorded yet. That does not mean something is wrong, but the timing is now worth noticing.`,
  
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
     HISTORY BASELINE INSIGHTS
  ======================================= */
  
  function buildHistoricalBaselineInsights(
    baselines:
      SprigPlantBaseline[],
  ):
    SprigInsight[] {
    const insights:
      SprigInsight[] =
      []
  
  
    for (
      const baseline of
      baselines
    ) {
      if (
        baseline
          .harvestedStoryCount <
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
        baseline
          .harvestedStoryCount ===
        1
      ) {
        const first =
          baseline
            .firstHarvestDays[0]
  
  
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
        baseline
          .firstHarvestRangeMin
  
  
      const maximum =
        baseline
          .firstHarvestRangeMax
  
  
      const middle =
        baseline
          .medianFirstHarvestDays
  
  
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
            baseline
              .harvestedStoryCount,
          ),
  
        priority:
          baseline
            .harvestedStoryCount >=
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
  ):
    SprigInsight[] {
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
      gardenData
        .plantStories
    ) {
      if (
        plant.status !==
          'growing' &&
        plant.status !==
          'harvesting'
      ) {
        continue
      }
  
  
      const firstHarvest =
        getFirstHarvest(
          plant.id,
          gardenData.harvests ??
          [],
        )
  
  
      if (
        firstHarvest
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
        baseline
          .harvestedStoryCount <
          2 ||
        baseline
          .firstHarvestRangeMax ===
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
        baseline
          .firstHarvestRangeMax
  
  
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
            baseline
              .harvestedStoryCount,
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
     USEFUL COMPARISONS
  ======================================= */
  
  function buildComparisonInsights(
    gardenData:
      GardenData,
  ):
    SprigInsight[] {
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
      gardenData
        .plantStories
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
  
  
      const existing =
        groups.get(
          key,
        ) ??
        []
  
  
      existing.push(
        plant,
      )
  
  
      groups.set(
        key,
        existing,
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
              plant:
                PlantStory
  
              age:
                number
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
        ] | null =
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
            candidates[outer]
  
  
          const right =
            candidates[inner]
  
  
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
        left
          .plant
          .currentGrowingPlaceId
  
  
      const rightPlace =
        right
          .plant
          .currentGrowingPlaceId
  
  
      const leftSetup =
        left
          .plant
          .currentGrowingSetupId
  
  
      const rightSetup =
        right
          .plant
          .currentGrowingSetupId
  
  
      const hasMeaningfulDifference =
        (
          leftPlace &&
          rightPlace &&
          leftPlace !==
            rightPlace
        ) ||
        (
          leftSetup &&
          rightSetup &&
          leftSetup !==
            rightSetup
        ) ||
        left
          .plant
          .status !==
          right
            .plant
            .status
  
  
      if (
        !hasMeaningfulDifference &&
        plants.length <
        3
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
  
  
      insights.push({
        id:
          `comparison-${key}-${left.plant.id}-${right.plant.id}`,
  
        family:
          'comparison',
  
        eyebrow:
          'A useful comparison',
  
        title:
          `Two ${cropLabel} stories are close enough in age to compare`,
  
        message:
          `${getPlantLabel(
            left.plant,
          )} and ${getPlantLabel(
            right.plant,
          )} are ${ageText}. Looking at them together may make differences in their growing stories easier to see.`,
  
        strength:
          strengthFromCount(
            plants.length,
          ),
  
        priority:
          64,
  
        reasoning:
          `Sprig found ${plants.length} ${cropLabel} Plant Stories and selected two with similar recorded ages. This is a suggestion to compare the records, not a claim that one growing condition caused their differences.`,
  
        evidence: [
          {
            recordType:
              'plant-story',
  
            recordId:
              left
                .plant
                .id,
  
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
              right
                .plant
                .id,
  
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
              left
                .plant
                .id,
  
              right
                .plant
                .id,
            ],
          },
        ],
  
        subjectKey:
          `comparison:${key}`,
  
        plantStoryIds: [
          left
            .plant
            .id,
  
          right
            .plant
            .id,
        ],
      })
    }
  
  
    return insights
  }
  
  
  /* =======================================
     PHOTO HISTORY
  ======================================= */
  
  function buildPhotoHistoryInsights(
    gardenData:
      GardenData,
  ):
    SprigInsight[] {
    const insights:
      SprigInsight[] =
      []
  
  
    for (
      const plant of
      gardenData
        .plantStories
    ) {
      const photos =
        plant.photoUrls ??
        []
  
  
      if (
        photos.length <
        3
      ) {
        continue
      }
  
  
      const datedPhotos =
        getDatedPlantPhotos(
          plant,
        )
  
  
      if (
        datedPhotos.length <
        2
      ) {
        continue
      }
  
  
      const firstDate =
        datedPhotos[0]
  
  
      const lastDate =
        datedPhotos[
          datedPhotos.length -
          1
        ]
  
  
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
          `Sprig found ${datedPhotos.length} dated Plant Story photographs between ${formatDate(
            firstDate,
          )} and ${formatDate(
            lastDate,
          )}. Sprig is only using their dates and relationships here. It is not analysing the image pixels.`,
  
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
    gardenData:
      GardenData,
  ):
    SprigInsight[] {
    const insights:
      SprigInsight[] =
      []
  
  
    const today =
      getToday()
  
  
    for (
      const plant of
      gardenData
        .plantStories
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
  
  
      const latestPhotoDate =
        getDatedPlantPhotos(
          plant,
        ).at(
          -1,
        )
  
  
      const candidateDates =
        [
          lastEvent?.date,
          latestPhotoDate,
          plant.updatedAt,
          plant.enteredDate,
        ]
          .filter(
            (
              value,
            ): value is string =>
              Boolean(
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
        candidateDates[0]
  
  
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
  
  
      /*
       * Very old imported/current records can
       * legitimately have large gaps.
       *
       * This observation remains low priority so
       * it does not crowd out more meaningful
       * timing or history findings.
       */
  
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
            ? `The Plant Story is still marked as ${plant.status}, but Sprig has not found a newer dated event, dated Plant photo or edit.`
            : `The Plant Story is still active, but Sprig has not found a newer dated event, dated Plant photo or edit.`,
  
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
  
  function buildTrialInsights(
    gardenData:
      GardenData,
  ):
    SprigInsight[] {
    const insights:
      SprigInsight[] =
      []
  
  
    for (
      const trial of
      gardenData
        .gardenTrials ??
      []
    ) {
      if (
        trial.status !==
        'active'
      ) {
        continue
      }
  
  
      const relationships =
        trial.relationships ??
        []
  
  
      const observations =
        trial.observations ??
        []
  
  
      const evidenceCount =
        relationships.length +
        observations.length
  
  
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
  
  
  function buildSingleTrialInsight(
    trial:
      GardenTrial,
  
    evidenceCount:
      number,
  ):
    SprigInsight {
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
        `Sprig counted the records linked to this Trial together with its Trial-specific observations. It has not decided what the Trial means.`,
  
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
  
  
  /* =======================================
     FIRSTS AND MILESTONES
  ======================================= */
  
  function buildMilestoneInsights(
    gardenData:
      GardenData,
  ):
    SprigInsight[] {
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
      gardenData
        .plantStories
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
  
  
      const existing =
        groups.get(
          key,
        ) ??
        []
  
  
      existing.push(
        plant,
      )
  
  
      groups.set(
        key,
        existing,
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
        plants[0]
  
  
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
     DEDUPLICATION
  ======================================= */
  
  function deduplicateInsights(
    insights:
      SprigInsight[],
  ):
    SprigInsight[] {
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
  
  
  /* =======================================
     PRIORITY BALANCING
  ======================================= */
  
  function balanceInsights(
    insights:
      SprigInsight[],
  ):
    SprigInsight[] {
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
  
  
    /*
     * Avoid ten different cards about the exact
     * same Plant Story crowding Today.
     *
     * High-priority observations win.
     */
  
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
    gardenData:
      GardenData,
  ):
    SprigInsightResult {
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
  ):
    string {
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
  ):
    string {
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
  ):
    string {
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
   TODAY EDITORIAL JUDGEMENT
======================================= */

/*
 * Sprig may notice many things across the
 * garden.
 *
 * Today is different.
 *
 * Today is the front porch, not the archive.
 * An insight can be completely valid and still
 * not deserve to interrupt the gardener today.
 *
 * The engine keeps every derived insight in
 * result.insights.
 *
 * These functions only decide which few thoughts
 * are worth bringing forward right now.
 */


/* =======================================
   TODAY THEMES
======================================= */

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
):
SprigTodayTheme {
switch (
  insight.family
) {
  case 'happening-now':
    return 'current-timing'


  case 'from-your-garden':
  case 'milestone':
    /*
     * A first baseline and a mature historical
     * baseline are both part of the same broad
     * conversation:
     *
     * "What has this garden taught Sprig?"
     *
     * Grouping them stops Today becoming a stack
     * of similar baseline announcements.
     */

    return 'garden-memory'


  case 'comparison':
    return 'comparison'


  case 'photographs':
    return 'photographs'


  case 'trial':
    return 'trial'


  case 'worth-watching':
    if (
      insight.id.startsWith(
        'quiet-story-',
      )
    ) {
      return 'quiet-story'
    }


    return 'current-timing'


  case 'garden-maths':
    return 'garden-maths'


  default:
    return 'other'
}
}


/* =======================================
 STRENGTH RANK
======================================= */

function getStrengthRank(
strength:
  SprigEvidenceStrength,
):
number {
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


/* =======================================
 FRONT-PORCH VALUE
======================================= */

/*
* This does NOT decide whether an observation
* is true or useful somewhere else in Sprig.
*
* It only decides whether it is strong enough
* to occupy scarce space on Today.
*/

function isStrongTodayCandidate(
insight:
  SprigInsight,
):
boolean {
/*
 * Anything with very high display priority
 * deserves consideration regardless of family.
 *
 * Examples:
 * - current plant later than its own history
 * - substantially overdue expected harvest
 * - strong Trial development
 */

if (
  insight.priority >=
  75
) {
  return true
}


switch (
  insight.family
) {
  case 'comparison':
    /*
     * A useful comparison is actionable and can
     * reveal differences the gardener may not
     * have noticed while records were created
     * weeks apart.
     */

    return (
      insight.priority >=
      60
    )


  case 'from-your-garden':
    /*
     * Mature personal history is valuable.
     *
     * Two stories can be interesting internally,
     * but Today should favour history that has
     * actually started becoming a pattern.
     */

    return (
      insight.priority >=
        55 &&
      getStrengthRank(
        insight.strength,
      ) >=
        3
    )


  case 'photographs':
    /*
     * Photo-history suggestions are useful once
     * enough dated material has accumulated.
     */

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
    /*
     * Quiet-story reminders are deliberately low
     * priority. Other timing anomalies become
     * front-porch material when the engine has
     * already judged them significant.
     */

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
    /*
     * Individual first baselines remain valid
     * insights, but they should not fill Today.
     *
     * Mature milestones may still surface later
     * if we add stronger milestone types.
     */

    return (
      insight.priority >=
        60 &&
      getStrengthRank(
        insight.strength,
      ) >=
        3
    )


  case 'garden-maths':
    /*
     * Plant age calculations are useful context
     * elsewhere, but ordinary age alone is not
     * something Sprig needs to interrupt the
     * gardener to announce.
     */

    return false


  default:
    return false
}
}


/* =======================================
 PLANT OVERLAP
======================================= */

function insightsSharePlants(
left:
  SprigInsight,

right:
  SprigInsight,
):
boolean {
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


/* =======================================
 SECOND SAME-FAMILY EXCEPTION
======================================= */

/*
* Normally Today shows only one thought from a
* family.
*
* Exception:
* a second observation may appear when it is
* unusually important in its own right.
*
* Priority 90 is intentionally a high bar.
*/

function canShowSecondFromFamily(
insight:
  SprigInsight,

selectedFromFamily:
  SprigInsight[],
):
boolean {
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
  selectedFromFamily[0]


if (
  !existing
) {
  return true
}


/*
 * Do not show two urgent cards that are really
 * talking about the same Plant Story.
 */

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


/* =======================================
 FALLBACK THOUGHT
======================================= */

/*
* Silence is allowed.
*
* But when Sprig genuinely has some garden
* history and nothing qualifies as a strong
* front-porch observation, one gentle thought
* can sometimes be worthwhile.
*
* We do NOT keep filling empty slots.
*/

function getGentleTodayFallback(
result:
  SprigInsightResult,
):
SprigInsight | undefined {
/*
 * First preference:
 * one useful comparison.
 */

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


/*
 * Second preference:
 * one first garden-memory milestone.
 *
 * Only one.
 *
 * This is where a new gardener may see:
 * "Sprig has its first harvest baseline..."
 *
 * Once another stronger observation exists,
 * this kind of card stays quietly in the
 * intelligence collection rather than
 * competing for Today.
 */

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


/*
 * Last preference:
 * one piece of garden maths.
 *
 * This keeps a very young garden from feeling
 * completely inert while Sprig is still learning.
 */

return result.insights.find(
  insight =>
    insight.family ===
      'garden-maths',
)
}


/* =======================================
 TODAY SELECTION
======================================= */

/*
* TODAY RULES
*
* 1. Sprig keeps every derived observation.
* 2. Today ordinarily shows no more than 3.
* 3. Today does not need to fill 3 positions.
* 4. One observation per family is normal.
* 5. A second from the same family requires
*    unusually high importance.
* 6. Similar garden-memory announcements do not
*    stack up.
* 7. Repeated cards about the same plant are
*    discouraged.
* 8. Ordinary garden maths stays quiet unless
*    Sprig has almost nothing else to say.
* 9. Silence is legitimate.
*/

export function getSprigTodayInsights(
result:
  SprigInsightResult,

limit:
  number =
  3,
):
SprigInsight[] {
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
  result
    .insights
    .filter(
      isStrongTodayCandidate,
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


  /*
   * Garden-memory is particularly prone to
   * repetition:
   *
   * first Royal Blue baseline
   * first Sebago baseline
   * first broccoli baseline
   *
   * Sprig may know all of those things, but
   * Today ordinarily needs only the strongest
   * one.
   */

  if (
    theme ===
      'garden-memory' &&
    sameTheme.length >=
      1
  ) {
    continue
  }


  /*
   * Other themes may occasionally contain two
   * genuinely urgent thoughts, but only when
   * each insight independently passes the
   * high-priority exception.
   */

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


  /*
   * Avoid showing another lower-value thought
   * about a plant already represented on Today.
   *
   * A genuinely urgent 90+ observation can
   * still win if needed.
   */

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
 * This is deliberate.
 *
 * We only use a fallback when Sprig otherwise
 * has NOTHING strong enough to say.
 *
 * If one strong observation exists, Today can
 * simply show one observation.
 *
 * We do not add weaker thoughts to make the
 * page look full.
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