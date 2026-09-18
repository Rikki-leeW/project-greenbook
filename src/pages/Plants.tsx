import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import PlantCard from '../components/cards/PlantCard'
import MainPageTemplate from '../components/templates/MainPageTemplate'
import {
  getPlantStoryCardContext,
} from '../utils/plantStoryContext'

import type {
  GardenEvent,
  GardenProduct,
  GrowingPlace,
  GrowingSetup,
  HarvestRecord,
  Ingredient,
  PlantStory,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface PlantsProps {
  plants: PlantStory[]

  growingPlaces: GrowingPlace[]

  growingSetups: GrowingSetup[]

  ingredients: Ingredient[]

  products: GardenProduct[]

  events: GardenEvent[]

  harvests: HarvestRecord[]

  onOpenPlant: (
    plantId: string,
  ) => void

  onAddPlant: () => void

  onNavigate: (
    page: AppPage,
  ) => void

  onComparePlants: (
    plantIds: string[],
  ) => void

  initialComparePlantIds?: string[]
}


const MAX_COMPARE_PLANTS =
  6


const PLANTS_BROWSER_STATE_KEY =
  'sprig-plants-browser-state-v1'


type PlantStoryView =
  | 'active'
  | 'completed'


type PlantSort =
  | 'recently-planted'
  | 'oldest-planted'
  | 'plant-az'
  | 'variety-az'
  | 'growing-place-az'
  | 'newest-activity'


type PlantFilterFamily =
  | 'start-method'
  | 'growing-place'
  | 'growing-setup'


type DurationDisplayUnit =
  | 'days'
  | 'weeks'
  | 'months'


interface PlantsBrowserState {
  storyView:
    PlantStoryView

  searchQuery:
    string

  sortBy:
    PlantSort

  selectedStartMethods:
    string[]

  selectedGrowingPlaces:
    string[]

  selectedGrowingSetups:
    string[]

  ageUnit:
    DurationDisplayUnit
}


interface PlantSearchDocument {
  plant:
    PlantStory

  growingPlaceName:
    string

  growingSetupNames:
    string[]

  startMethodLabel:
    string

  latestActivityDate:
    string

  latestActivitySummary?:
    string

  thumbnailPhotoUrl?:
    string

  searchText:
    string
}


interface SmartComparisonSuggestion {
  id:
    string

  cropLabel:
    string

  plantIds:
    string[]

  title:
    string

  reasons:
    string[]
}


/* =======================================
   NORMALISE SEARCH TEXT
======================================= */

function normaliseSearchText(
  value:
    string | undefined,
): string {
  return (
    value ??
    ''
  )
    .trim()
    .toLocaleLowerCase()
}


/* =======================================
   START METHOD LABEL
======================================= */

function formatBuiltInStartMethodLabel(
  value:
    string,
): string {
  return value
    .replaceAll(
      '-',
      ' ',
    )
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase(),
    )
}


function getStartMethodLabel(
  plant: PlantStory,
): string {
  if (
    plant.startMethod ===
      'other' &&
    plant.customStartMethodLabel
  ) {
    return plant.customStartMethodLabel
  }

  return formatBuiltInStartMethodLabel(
    plant.startMethod,
  )
}


/* =======================================
   UNIQUE TEXT
======================================= */

function uniqueText(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values
        .map(
          value =>
            value.trim(),
        )
        .filter(
          Boolean,
        ),
    ),
  )
}


/* =======================================
   LATEST DATE
======================================= */

function getLatestDate(
  dates:
    Array<
      string | undefined
    >,
  fallback:
    string,
): string {
  const usableDates =
    dates.filter(
      (
        date,
      ): date is string =>
        Boolean(
          date,
        ),
    )

  if (
    usableDates.length ===
    0
  ) {
    return fallback
  }

  return usableDates.reduce(
    (
      latest,
      candidate,
    ) =>
      candidate >
      latest
        ? candidate
        : latest,
    usableDates[0],
  )
}


/* =======================================
   SHARED PLANT STORY CONTEXT
======================================= */

/*
 * Plant Story identity and latest-memory
 * presentation are derived centrally.
 *
 * Harvest and Plants now read the same
 * garden evidence instead of maintaining
 * separate interpretations of what the
 * gardener most recently recorded.
 */


/* =======================================
   PLANT SETUP IDS
======================================= */

function getPlantGrowingSetupIds(
  plant: PlantStory,
): string[] {
  return uniqueText([
    plant.currentGrowingSetupId ??
      '',

    ...(
      plant.currentGrowingSetupIds ??
      []
    ),

    ...(
      plant.previousGrowingSetupIds ??
      []
    ),

    ...(
      plant.previousGrowingSetupIdsV2 ??
      []
    ),

    ...(
      plant.growingHistory ??
      []
    ).flatMap(
      historyEntry => [
        historyEntry.growingSetupId ??
          '',

        ...(
          historyEntry.growingSetupIds ??
          []
        ),
      ],
    ),
  ])
}


/* =======================================
   SETUP SEARCH WORDS
======================================= */

function getGrowingSetupSearchWords(
  setup:
    GrowingSetup,

  growingSetups:
    GrowingSetup[],

  ingredients:
    Ingredient[],

  products:
    GardenProduct[],
): string[] {
  const words: string[] = [
    setup.name,
    setup.category,
    setup.brand ?? '',
    setup.productName ?? '',
    setup.groundType ?? '',
    setup.growingSystemType ?? '',
    setup.notes ?? '',
  ]


  for (
    const ingredientId
    of setup.ingredientIds ??
      []
  ) {
    const ingredient =
      ingredients.find(
        item =>
          item.id ===
          ingredientId,
      )

    if (
      ingredient
    ) {
      words.push(
        ingredient.name,
        ingredient.category ??
          '',
        ingredient.customCategoryLabel ??
          '',
        ingredient.manufacturer ??
          '',
        ingredient.source ??
          '',
        ingredient.notes ??
          '',
      )
    }
  }


  for (
    const component
    of setup.recipeComponents ??
      []
  ) {
    if (
      component.sourceType ===
      'ingredient'
    ) {
      const ingredient =
        ingredients.find(
          item =>
            item.id ===
            component.sourceId,
        )

      if (
        ingredient
      ) {
        words.push(
          ingredient.name,
          ingredient.category ??
            '',
          ingredient.customCategoryLabel ??
            '',
          ingredient.manufacturer ??
            '',
          ingredient.source ??
            '',
          ingredient.notes ??
            '',
        )
      }
    }


    if (
      component.sourceType ===
      'product'
    ) {
      const product =
        products.find(
          item =>
            item.id ===
            component.sourceId,
        )

      if (
        product
      ) {
        words.push(
          product.name,
          product.brand ??
            '',
          product.productName ??
            '',
          product.category ??
            '',
          product.customCategoryLabel ??
            '',
          product.notes ??
            '',
        )
      }
    }


    if (
      component.sourceType ===
      'growing-setup'
    ) {
      const linkedSetup =
        growingSetups.find(
          item =>
            item.id ===
            component.sourceId,
        )

      if (
        linkedSetup
      ) {
        words.push(
          linkedSetup.name,
          linkedSetup.category,
          linkedSetup.brand ??
            '',
          linkedSetup.productName ??
            '',
          linkedSetup.notes ??
            '',
        )
      }
    }
  }


  return words
}


/* =======================================
   BUILD SEARCH DOCUMENT
======================================= */

function buildPlantSearchDocument(
  plant:
    PlantStory,

  growingPlaces:
    GrowingPlace[],

  growingSetups:
    GrowingSetup[],

  ingredients:
    Ingredient[],

  products:
    GardenProduct[],

  events:
    GardenEvent[],

  harvests:
    HarvestRecord[],
): PlantSearchDocument {
  const plantEvents =
    events.filter(
      event =>
        event.plantStoryIds.length ===
          0 ||
        event.plantStoryIds.includes(
          plant.id,
        ),
    )


  const plantHarvests =
    harvests.filter(
      harvest =>
        harvest.plantStoryIds.includes(
          plant.id,
        ),
    )


  const growingPlace =
    growingPlaces.find(
      place =>
        place.id ===
        plant.currentGrowingPlaceId,
    )


  const growingSetupIds =
    getPlantGrowingSetupIds(
      plant,
    )


  const plantGrowingSetups =
    growingSetupIds
      .map(
        setupId =>
          growingSetups.find(
            setup =>
              setup.id ===
              setupId,
          ),
      )
      .filter(
        (
          setup,
        ): setup is GrowingSetup =>
          Boolean(
            setup,
          ),
      )


  const growingHistoryPlaceNames =
    (
      plant.growingHistory ??
      []
    )
      .map(
        historyEntry =>
          growingPlaces.find(
            place =>
              place.id ===
              historyEntry.growingPlaceId,
          )?.name ??
          '',
      )


  const setupWords =
    plantGrowingSetups.flatMap(
      setup =>
        getGrowingSetupSearchWords(
          setup,
          growingSetups,
          ingredients,
          products,
        ),
    )


  const eventWords =
    plantEvents.flatMap(
      event => [
        event.title,
        event.date,
        event.type,
        ...(
          event.activityTypes ??
          []
        ),
        event.notes ??
          '',
        event.productUsed ??
          '',
        ...(
          event.photoMetadata ??
          []
        ).flatMap(
          metadata => [
            metadata?.title ??
              '',
            metadata?.notes ??
              '',
            ...(
              metadata?.tags ??
              []
            ),
            metadata?.purpose ??
              '',
          ],
        ),
        ...(
          event.growingPlaceIds ??
          []
        ).map(
          placeId =>
            growingPlaces.find(
              place =>
                place.id ===
                placeId,
            )?.name ??
            '',
        ),
      ],
    )


  const harvestWords =
    plantHarvests.flatMap(
      harvest => [
        harvest.date,
        harvest.harvestType ??
          '',
        harvest.customHarvestTypeLabel ??
          '',
        harvest.plantOutcome ??
          '',
        harvest.customPlantOutcomeLabel ??
          '',
        harvest.quality ??
          '',
        harvest.notes ??
          '',
        harvest.measurementUnit ??
          '',
        harvest.customMeasurementUnitLabel ??
          '',
        harvest.measurementAmount !==
          undefined
          ? String(
              harvest.measurementAmount,
            )
          : '',
        harvest.count !==
          undefined
          ? String(
              harvest.count,
            )
          : '',
        ...(
          harvest.photoMetadata ??
          []
        ).flatMap(
          metadata => [
            metadata?.title ??
              '',
            metadata?.notes ??
              '',
            ...(
              metadata?.tags ??
              []
            ),
            metadata?.purpose ??
              '',
          ],
        ),
      ],
    )


  const plantPhotoWords =
    (
      plant.photoMetadata ??
      []
    ).flatMap(
      metadata => [
        metadata?.title ??
          '',
        metadata?.notes ??
          '',
        ...(
          metadata?.tags ??
          []
        ),
        metadata?.purpose ??
          '',
      ],
    )


  const cardContext =
    getPlantStoryCardContext(
      plant,
      events,
      harvests,
      growingPlaces,
      products,
    )


  const latestActivityDate =
    cardContext.latestActivityDate ??
    getLatestDate(
      [
        plant.plantedDate,
        plant.sownDate,
        plant.plantedOutDate,
        plant.enteredDate,
        plant.completedAt,

        ...(
          plant.photoDates ??
          []
        ),

        ...(
          plant.photoMetadata ??
          []
        ).map(
          metadata =>
            metadata?.photoDate,
        ),

        ...(
          plant.growingHistory ??
          []
        ).flatMap(
          historyEntry => [
            historyEntry.startedDate,
            historyEntry.endedDate,
          ],
        ),
      ],
      plant.plantedDate,
    )


  const searchWords = [
    plant.plantName,
    plant.variety ??
      '',
    plant.displayName,
    plant.personality ??
      '',
    plant.source ??
      '',
    plant.originType ??
      '',
    plant.customOriginLabel ??
      '',
    getStartMethodLabel(
      plant,
    ),
    plant.customStartMethodLabel ??
      '',
    plant.notes ??
      '',
    plant.plantedDate,
    plant.sownDate ??
      '',
    plant.plantedOutDate ??
      '',
    plant.enteredDate,
    plant.completedAt ??
      '',
    ...(
      plant.tags ??
      []
    ),
    ...plantPhotoWords,
    ...(
      plant.photoDates ??
      []
    ).filter(
      (
        date,
      ): date is string =>
        Boolean(
          date,
        ),
    ),
    growingPlace?.name ??
      '',
    growingPlace?.kind ??
      '',
    growingPlace?.customKindLabel ??
      '',
    growingPlace?.aspect ??
      '',
    growingPlace?.sunlight ??
      '',
    growingPlace?.shelter ??
      '',
    growingPlace?.notes ??
      '',
    ...growingHistoryPlaceNames,
    ...plantGrowingSetups.map(
      setup =>
        setup.name,
    ),
    ...setupWords,
    ...eventWords,
    ...harvestWords,
  ]


  return {
    plant,

    growingPlaceName:
      growingPlace?.name ??
      '',

    growingSetupNames:
      plantGrowingSetups.map(
        setup =>
          setup.name,
      ),

    startMethodLabel:
      getStartMethodLabel(
        plant,
      ),

    latestActivityDate,

    latestActivitySummary:
      cardContext.latestActivitySummary,

    thumbnailPhotoUrl:
      cardContext.thumbnailPhotoUrl,

    searchText:
      normaliseSearchText(
        searchWords.join(
          ' ',
        ),
      ),
  }
}


/* =======================================
   EXPECTED HARVEST / PRODUCTION
======================================= */

interface PlantExpectedTimingDisplay {
  label: string
  value: string
}


function addDaysToPlantDate(
  date:
    string,

  days:
    number,
): Date | undefined {
  const parsed =
    new Date(
      `${date}T00:00:00`,
    )

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return undefined
  }

  parsed.setDate(
    parsed.getDate() +
      days,
  )

  return parsed
}


function formatPlantTimingDate(
  date:
    Date | undefined,
): string | undefined {
  if (
    !date
  ) {
    return undefined
  }

  return new Intl.DateTimeFormat(
    'en-AU',
    {
      day: 'numeric',
      month: 'short',
    },
  ).format(
    date,
  )
}


function getHarvestTimingReferenceDate(
  plant:
    PlantStory,

  events:
    GardenEvent[],
): string | undefined {
  const reference =
    plant.harvestTimingReference

  if (
    !reference ||
    reference.sourceType ===
      'planted'
  ) {
    return plant.plantedDate
  }

  if (
    reference.sourceType ===
    'sown'
  ) {
    return plant.sownDate
  }

  if (
    reference.sourceType ===
    'planted-out'
  ) {
    return plant.plantedOutDate
  }

  if (
    reference.sourceType ===
      'garden-event'
  ) {
    if (
      !reference.eventId
    ) {
      return undefined
    }

    return events.find(
      event =>
        event.id ===
        reference.eventId,
    )?.date
  }

  if (
    reference.sourceType ===
      'custom-date'
  ) {
    return reference.customDate
  }

  /*
   * A purchased reference does not currently
   * have its own canonical date on PlantStory.
   * Do not quietly substitute plantedDate and
   * pretend Sprig knows when the plant was
   * purchased.
   */
  return undefined
}


function formatExpectedDateRange(
  start:
    Date | undefined,

  end:
    Date | undefined,
): string | undefined {
  const startText =
    formatPlantTimingDate(
      start,
    )

  const endText =
    formatPlantTimingDate(
      end,
    )

  if (
    startText &&
    endText
  ) {
    if (
      startText ===
      endText
    ) {
      return startText
    }

    return `${startText} – ${endText}`
  }

  return (
    startText ??
    endText
  )
}


function formatProductionDuration(
  plant:
    PlantStory,
): string | undefined {
  const minimumDays =
    plant.expectedProductionDaysMin

  const maximumDays =
    plant.expectedProductionDaysMax

  if (
    minimumDays === undefined &&
    maximumDays === undefined
  ) {
    return undefined
  }

  const unit =
    plant.productionDurationInputUnit ??
    'weeks'

  const divisor =
    unit === 'days'
      ? 1
      : unit === 'weeks'
        ? 7
        : 30.44

  function formatValue(
    days:
      number | undefined,
  ): string | undefined {
    if (
      days === undefined
    ) {
      return undefined
    }

    const converted =
      days /
      divisor

    const rounded =
      Math.round(
        converted *
        10,
      ) /
      10

    return Number.isInteger(
      rounded,
    )
      ? String(
          rounded,
        )
      : rounded.toFixed(
          1,
        )
  }

  const minimum =
    formatValue(
      minimumDays,
    )

  const maximum =
    formatValue(
      maximumDays,
    )

  let amount:
    string | undefined

  if (
    minimum &&
    maximum
  ) {
    amount =
      minimum === maximum
        ? minimum
        : `${minimum}–${maximum}`
  } else {
    amount =
      minimum ??
      maximum
  }

  if (
    !amount
  ) {
    return undefined
  }

  return `~${amount} ${unit}`
}


function getPlantExpectedTimingDetails(
  plant:
    PlantStory,

  events:
    GardenEvent[],
): PlantExpectedTimingDisplay[] {
  const hasExpectedTiming =
    plant.expectedHarvestDaysMin !==
      undefined ||
    plant.expectedHarvestDaysMax !==
      undefined

  if (
    !hasExpectedTiming
  ) {
    return []
  }

  const referenceDate =
    getHarvestTimingReferenceDate(
      plant,
      events,
    )

  if (
    !referenceDate
  ) {
    /*
     * The duration is known, but the milestone
     * it counts from has not happened or is not
     * recorded yet. Do not fabricate a calendar
     * date on the Plant card.
     */
    return []
  }

  const expectedStart =
    plant.expectedHarvestDaysMin !==
      undefined
      ? addDaysToPlantDate(
          referenceDate,
          plant.expectedHarvestDaysMin,
        )
      : undefined

  const expectedEnd =
    plant.expectedHarvestDaysMax !==
      undefined
      ? addDaysToPlantDate(
          referenceDate,
          plant.expectedHarvestDaysMax,
        )
      : undefined

  const expectedRange =
    formatExpectedDateRange(
      expectedStart,
      expectedEnd,
    )

  if (
    !expectedRange
  ) {
    return []
  }

  if (
    plant.harvestTimingMode ===
    'production-start'
  ) {
    const details:
      PlantExpectedTimingDisplay[] = [
        {
          label:
            'Expected from',
          value:
            expectedRange,
        },
      ]

    const productionDuration =
      formatProductionDuration(
        plant,
      )

    if (
      productionDuration
    ) {
      details.push({
        label:
          'Produces',
        value:
          productionDuration,
      })
    }

    return details
  }

  if (
    plant.harvestTimingMode ===
    'maturity-window'
  ) {
    return [
      {
        label:
          'Harvest window',
        value:
          expectedRange,
      },
    ]
  }

  /*
   * Legacy Plant Stories pre-date the semantic
   * distinction between maturity and first
   * production. Keep their useful expectation
   * visible without falsely classifying it.
   */
  return [
    {
      label:
        'Expected harvest',
      value:
        expectedRange,
    },
  ]
}


/* =======================================
   SAVED BROWSER STATE
======================================= */

function readPlantsBrowserState():
  Partial<PlantsBrowserState> {
  if (
    typeof window ===
    'undefined'
  ) {
    return {}
  }

  try {
    const savedState =
      window.sessionStorage.getItem(
        PLANTS_BROWSER_STATE_KEY,
      )

    if (
      !savedState
    ) {
      return {}
    }

    const parsed =
      JSON.parse(
        savedState,
      ) as Partial<PlantsBrowserState>

    return parsed
  } catch {
    return {}
  }
}


/* =======================================
   SMART COMPARISON SUGGESTIONS
======================================= */

function buildSmartComparisonSuggestions(
  plants:
    PlantStory[],

  searchDocumentByPlantId:
    Map<
      string,
      PlantSearchDocument
    >,
): SmartComparisonSuggestion[] {
  const cropGroups =
    new Map<
      string,
      PlantStory[]
    >()


  for (
    const plant
    of plants
  ) {
    const cropKey =
      normaliseSearchText(
        plant.plantName,
      )

    if (
      !cropKey
    ) {
      continue
    }

    const existing =
      cropGroups.get(
        cropKey,
      ) ??
      []

    existing.push(
      plant,
    )

    cropGroups.set(
      cropKey,
      existing,
    )
  }


  const suggestions:
    SmartComparisonSuggestion[] =
    []


  for (
    const [
      cropKey,
      cropPlants,
    ]
    of cropGroups
  ) {
    if (
      cropPlants.length <
      2
    ) {
      continue
    }


    const orderedPlants =
      [
        ...cropPlants,
      ].sort(
        (
          first,
          second,
        ) =>
          (
            searchDocumentByPlantId.get(
              second.id,
            )?.latestActivityDate ??
            second.plantedDate
          ).localeCompare(
            searchDocumentByPlantId.get(
              first.id,
            )?.latestActivityDate ??
              first.plantedDate,
          ),
      )


    const comparisonPlants =
      orderedPlants.slice(
        0,
        MAX_COMPARE_PLANTS,
      )


    const varieties =
      uniqueText(
        comparisonPlants.map(
          plant =>
            plant.variety ??
            '',
        ),
      )


    const places =
      uniqueText(
        comparisonPlants.map(
          plant =>
            searchDocumentByPlantId.get(
              plant.id,
            )?.growingPlaceName ??
            '',
        ),
      )


    const setups =
      uniqueText(
        comparisonPlants.flatMap(
          plant =>
            searchDocumentByPlantId.get(
              plant.id,
            )?.growingSetupNames ??
            [],
        ),
      )


    const startMethods =
      uniqueText(
        comparisonPlants.map(
          plant =>
            searchDocumentByPlantId.get(
              plant.id,
            )?.startMethodLabel ??
            '',
        ),
      )


    const completedCount =
      comparisonPlants.filter(
        plant =>
          plant.status ===
          'finished',
      ).length


    const activeCount =
      comparisonPlants.length -
      completedCount


    const reasons:
      string[] =
      []


    if (
      varieties.length >
      1
    ) {
      reasons.push(
        `${varieties.length} varieties`,
      )
    }


    if (
      places.length >
      1
    ) {
      reasons.push(
        `${places.length} Growing Places`,
      )
    }


    if (
      setups.length >
      1
    ) {
      reasons.push(
        `${setups.length} Growing Recipes`,
      )
    }


    if (
      startMethods.length >
      1
    ) {
      reasons.push(
        `${startMethods.length} starting methods`,
      )
    }


    if (
      activeCount >
        0 &&
      completedCount >
        0
    ) {
      reasons.push(
        'current + past stories',
      )
    }


    if (
      reasons.length ===
      0
    ) {
      reasons.push(
        `${comparisonPlants.length} growing stories`,
      )
    }


    const cropLabel =
      comparisonPlants[0]
        ?.plantName ??
      cropKey


    let title =
      `${cropLabel}: ${comparisonPlants.length} stories worth looking at together`


    if (
      places.length >
        1 &&
      setups.length >
        1
    ) {
      title =
        `See how ${cropLabel} differed across places and Growing Recipes`
    } else if (
      places.length >
      1
    ) {
      title =
        `See how ${cropLabel} differed between Growing Places`
    } else if (
      setups.length >
      1
    ) {
      title =
        `See how ${cropLabel} differed between Growing Recipes`
    } else if (
      varieties.length >
      1
    ) {
      title =
        `Look across your ${cropLabel} varieties`
    } else if (
      activeCount >
        0 &&
      completedCount >
        0
    ) {
      title =
        `Compare this ${cropLabel} season with earlier stories`
    }


    suggestions.push({
      id:
        `crop-${cropKey}`,

      cropLabel,

      plantIds:
        comparisonPlants.map(
          plant =>
            plant.id,
        ),

      title,

      reasons:
        reasons.slice(
          0,
          4,
        ),
    })
  }


  return suggestions
    .sort(
      (
        first,
        second,
      ) => {
        const reasonDifference =
          second.reasons.length -
          first.reasons.length

        if (
          reasonDifference !==
          0
        ) {
          return reasonDifference
        }

        return (
          second.plantIds.length -
          first.plantIds.length
        )
      },
    )
    .slice(
      0,
      4,
    )
}


/* =======================================
   PLANTS PAGE
======================================= */

export default function Plants({
  plants,
  growingPlaces,
  growingSetups,
  ingredients,
  products,
  events,
  harvests,
  onOpenPlant,
  onAddPlant,
  onNavigate,
  onComparePlants,
  initialComparePlantIds = [],
}: PlantsProps) {
  const savedBrowserState =
    useMemo(
      () =>
        readPlantsBrowserState(),
      [],
    )


  /* =======================================
     STORY VIEW
  ======================================= */

  const initialStoryView:
    PlantStoryView =
    initialComparePlantIds.some(
      plantId =>
        plants.some(
          plant =>
            plant.id ===
              plantId &&
            plant.status ===
              'finished',
        ),
    )
      ? 'completed'
      : (
          savedBrowserState.storyView ??
          'active'
        )


  const [
    storyView,
    setStoryView,
  ] =
    useState<PlantStoryView>(
      initialStoryView,
    )


  /* =======================================
     SEARCH / SORT / FILTER
  ======================================= */

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState(
      savedBrowserState.searchQuery ??
        '',
    )


  const [
    sortBy,
    setSortBy,
  ] =
    useState<PlantSort>(
      savedBrowserState.sortBy ??
        'newest-activity',
    )


  const [
    selectedStartMethods,
    setSelectedStartMethods,
  ] =
    useState<string[]>(
      (
        savedBrowserState.selectedStartMethods ??
        []
      ).map(
        value =>
          value ===
            value.toLocaleLowerCase()
            ? formatBuiltInStartMethodLabel(
                value,
              )
            : value,
      ),
    )


  const [
    selectedGrowingPlaces,
    setSelectedGrowingPlaces,
  ] =
    useState<string[]>(
      savedBrowserState.selectedGrowingPlaces ??
        [],
    )


  const [
    selectedGrowingSetups,
    setSelectedGrowingSetups,
  ] =
    useState<string[]>(
      savedBrowserState.selectedGrowingSetups ??
        [],
    )


  const [
    ageUnit,
    setAgeUnit,
  ] =
    useState<DurationDisplayUnit>(
      savedBrowserState.ageUnit ??
        'weeks',
    )


  /* =======================================
     REMEMBER BROWSER JOURNEY
  ======================================= */

  useEffect(
    () => {
      const state:
        PlantsBrowserState = {
        storyView,
        searchQuery,
        sortBy,
        selectedStartMethods,
        selectedGrowingPlaces,
        selectedGrowingSetups,
        ageUnit,
      }

      try {
        window.sessionStorage.setItem(
          PLANTS_BROWSER_STATE_KEY,
          JSON.stringify(
            state,
          ),
        )
      } catch {
        // Sprig can still work if browser
        // session storage is unavailable.
      }
    },
    [
      storyView,
      searchQuery,
      sortBy,
      selectedStartMethods,
      selectedGrowingPlaces,
      selectedGrowingSetups,
      ageUnit,
    ],
  )


  /* =======================================
     ACTIVE / COMPLETED
  ======================================= */

  const activePlants =
    plants.filter(
      plant =>
        plant.status !==
        'finished',
    )


  const completedPlants =
    plants.filter(
      plant =>
        plant.status ===
        'finished',
    )


  const storyViewPlants =
    storyView ===
    'completed'
      ? completedPlants
      : activePlants


  /* =======================================
     SEARCH DOCUMENTS
  ======================================= */

  const searchDocuments =
    useMemo(
      () =>
        plants.map(
          plant =>
            buildPlantSearchDocument(
              plant,
              growingPlaces,
              growingSetups,
              ingredients,
              products,
              events,
              harvests,
            ),
        ),
      [
        plants,
        growingPlaces,
        growingSetups,
        ingredients,
        products,
        events,
        harvests,
      ],
    )


  const searchDocumentByPlantId =
    useMemo(
      () =>
        new Map(
          searchDocuments.map(
            document => [
              document.plant.id,
              document,
            ],
          ),
        ),
      [
        searchDocuments,
      ],
    )


  /* =======================================
     SMART COMPARISONS
  ======================================= */

  const smartComparisonSuggestions =
    useMemo(
      () =>
        buildSmartComparisonSuggestions(
          plants,
          searchDocumentByPlantId,
        ),
      [
        plants,
        searchDocumentByPlantId,
      ],
    )


  /* =======================================
     FILTER OPTIONS
  ======================================= */

  const startMethodOptions =
    useMemo(
      () =>
        uniqueText(
          storyViewPlants.map(
            plant =>
              getStartMethodLabel(
                plant,
              ),
          ),
        ).sort(
          (
            first,
            second,
          ) =>
            first.localeCompare(
              second,
            ),
        ),
      [
        storyViewPlants,
      ],
    )


  const growingPlaceOptions =
    useMemo(
      () =>
        uniqueText(
          storyViewPlants
            .map(
              plant =>
                searchDocumentByPlantId.get(
                  plant.id,
                )?.growingPlaceName ??
                '',
            ),
        ).sort(
          (
            first,
            second,
          ) =>
            first.localeCompare(
              second,
            ),
        ),
      [
        storyViewPlants,
        searchDocumentByPlantId,
      ],
    )


  const growingSetupOptions =
    useMemo(
      () =>
        uniqueText(
          storyViewPlants.flatMap(
            plant =>
              searchDocumentByPlantId.get(
                plant.id,
              )?.growingSetupNames ??
              [],
          ),
        ).sort(
          (
            first,
            second,
          ) =>
            first.localeCompare(
              second,
            ),
        ),
      [
        storyViewPlants,
        searchDocumentByPlantId,
      ],
    )


  /* =======================================
     FILTER TOGGLE
  ======================================= */

  function toggleFilter(
    family:
      PlantFilterFamily,
      value:
      string,
  ) {
    const toggleValue = (
      current:
        string[],
    ) =>
      current.includes(
        value,
      )
        ? current.filter(
            item =>
              item !==
              value,
          )
        : [
            ...current,
            value,
          ]


    if (
      family ===
      'start-method'
    ) {
      setSelectedStartMethods(
        toggleValue,
      )

      return
    }


    if (
      family ===
      'growing-place'
    ) {
      setSelectedGrowingPlaces(
        toggleValue,
      )

      return
    }


    setSelectedGrowingSetups(
      toggleValue,
    )
  }


  /* =======================================
     CLEAR FILTERS
  ======================================= */

  function clearFilters() {
    setSearchQuery(
      '',
    )

    setSelectedStartMethods(
      [],
    )

    setSelectedGrowingPlaces(
      [],
    )

    setSelectedGrowingSetups(
      [],
    )
  }


  const activeFilterCount =
    selectedStartMethods.length +
    selectedGrowingPlaces.length +
    selectedGrowingSetups.length


  /* =======================================
     FILTERED / SORTED STORIES
  ======================================= */

  const visiblePlants =
    useMemo(
      () => {
        const normalisedQuery =
          normaliseSearchText(
            searchQuery,
          )


        /*
         * Sprig searches plant identity first.
         *
         * If the gardener types something that
         * matches a plant name, variety or
         * display name, do not allow an
         * incidental word buried in a recipe,
         * Journal entry or other relationship
         * to swamp those obvious plant results.
         *
         * When there is no identity match,
         * Sprig falls back to the full
         * relational Plant Story document.
         */
        const hasPlantIdentityMatch =
          Boolean(
            normalisedQuery,
          ) &&
          storyViewPlants.some(
            plant => {
              const identityText =
                normaliseSearchText(
                  [
                    plant.plantName,
                    plant.variety ??
                      '',
                    plant.displayName,
                  ].join(
                    ' ',
                  ),
                )

              return identityText.includes(
                normalisedQuery,
              )
            },
          )


        const filtered =
          storyViewPlants.filter(
            plant => {
              const document =
                searchDocumentByPlantId.get(
                  plant.id,
                )


              if (
                !document
              ) {
                return false
              }


              if (
                normalisedQuery
              ) {
                const identityText =
                  normaliseSearchText(
                    [
                      plant.plantName,
                      plant.variety ??
                        '',
                      plant.displayName,
                    ].join(
                      ' ',
                    ),
                  )


                const matchesSearch =
                  hasPlantIdentityMatch
                    ? identityText.includes(
                        normalisedQuery,
                      )
                    : document.searchText.includes(
                        normalisedQuery,
                      )


                if (
                  !matchesSearch
                ) {
                  return false
                }
              }


              if (
                selectedStartMethods.length >
                  0 &&
                !selectedStartMethods.includes(
                  document.startMethodLabel,
                )
              ) {
                return false
              }


              if (
                selectedGrowingPlaces.length >
                  0 &&
                !selectedGrowingPlaces.includes(
                  document.growingPlaceName,
                )
              ) {
                return false
              }


              if (
                selectedGrowingSetups.length >
                  0 &&
                !document.growingSetupNames.some(
                  setupName =>
                    selectedGrowingSetups.includes(
                      setupName,
                    ),
                )
              ) {
                return false
              }


              return true
            },
          )


        return [
          ...filtered,
        ].sort(
          (
            first,
            second,
          ) => {
            const firstDocument =
              searchDocumentByPlantId.get(
                first.id,
              )

            const secondDocument =
              searchDocumentByPlantId.get(
                second.id,
              )


            switch (
              sortBy
            ) {
              case 'oldest-planted':
                return first.plantedDate.localeCompare(
                  second.plantedDate,
                )


              case 'plant-az':
                return first.plantName.localeCompare(
                  second.plantName,
                )


              case 'variety-az':
                return (
                  first.variety ??
                  first.displayName
                ).localeCompare(
                  second.variety ??
                    second.displayName,
                )


              case 'growing-place-az':
                return (
                  firstDocument?.growingPlaceName ??
                  ''
                ).localeCompare(
                  secondDocument?.growingPlaceName ??
                    '',
                )


              case 'newest-activity':
                return (
                  secondDocument?.latestActivityDate ??
                  second.plantedDate
                ).localeCompare(
                  firstDocument?.latestActivityDate ??
                    first.plantedDate,
                )


              case 'recently-planted':
              default:
                return second.plantedDate.localeCompare(
                  firstDocument?.plant.plantedDate ??
                    first.plantedDate,
                )
            }
          },
        )
      },
      [
        storyViewPlants,
        searchDocumentByPlantId,
        searchQuery,
        selectedStartMethods,
        selectedGrowingPlaces,
        selectedGrowingSetups,
        sortBy,
      ],
    )


  /* =======================================
     INITIAL COMPARISON
  ======================================= */

  const initialSelectedPlantIds =
    initialComparePlantIds
      .filter(
        plantId =>
          plants.some(
            plant =>
              plant.id ===
              plantId,
          ),
      )
      .slice(
        0,
        MAX_COMPARE_PLANTS,
      )


  const [
    compareMode,
    setCompareMode,
  ] =
    useState(
      initialSelectedPlantIds.length >
        0,
    )


  const [
    selectedPlantIds,
    setSelectedPlantIds,
  ] =
    useState<string[]>(
      initialSelectedPlantIds,
    )


  /* =======================================
     STORY VIEW
  ======================================= */

  function changeStoryView(
    nextView:
      PlantStoryView,
  ) {
    setStoryView(
      nextView,
    )

    setCompareMode(
      false,
    )

    setSelectedPlantIds(
      [],
    )

    clearFilters()
  }


  /* =======================================
     COMPARE MODE
  ======================================= */

  function toggleCompareMode() {
    if (
      compareMode
    ) {
      setCompareMode(
        false,
      )

      setSelectedPlantIds(
        [],
      )

      return
    }

    setCompareMode(
      true,
    )
  }


  function togglePlantForComparison(
    plantId:
      string,
  ) {
    setSelectedPlantIds(
      currentIds => {
        if (
          currentIds.includes(
            plantId,
          )
        ) {
          return currentIds.filter(
            currentId =>
              currentId !==
              plantId,
          )
        }


        if (
          currentIds.length >=
          MAX_COMPARE_PLANTS
        ) {
          return currentIds
        }


        return [
          ...currentIds,
          plantId,
        ]
      },
    )
  }


  function beginSmartComparison(
    plantIds:
      string[],
  ) {
    const usablePlantIds =
      plantIds
        .filter(
          plantId =>
            plants.some(
              plant =>
                plant.id ===
                plantId,
            ),
        )
        .slice(
          0,
          MAX_COMPARE_PLANTS,
        )

    if (
      usablePlantIds.length <
      2
    ) {
      return
    }

    onComparePlants(
      usablePlantIds,
    )
  }




  const selectedPlants =
    selectedPlantIds
      .map(
        plantId =>
          plants.find(
            plant =>
              plant.id ===
              plantId,
          ),
      )
      .filter(
        (
          plant,
        ): plant is PlantStory =>
          Boolean(
            plant,
          ),
      )






  return (
    <MainPageTemplate
      activePage="plants"
      onNavigate={
      onNavigate
      }
      pageId="plants-page-top"
      journeyBackLabel="My Garden"
      onJourneyBack={() =>
      onNavigate(
      'gate',
      )
      }
      eyebrow="My Garden"
      title="Growing stories"
      intro={
      storyView ===
      'completed'
      ? 'The growing stories you have finished and kept as part of your garden history.'
      : 'The plants and growing stories that are part of your garden now.'
      }
      headerActions={
      <>
      <button
      type="button"
      className="journal-add-button"
      onClick={
      onAddPlant
      }
      >
      + Add Plant
      </button>
      
      <button
      type="button"
      className="text-button"
      onClick={
      toggleCompareMode
      }
      >
      {compareMode
      ? 'Cancel comparison'
      : 'Compare'}
      </button>
      </>
      }
    >
  
  
        <div className="plant-story-view-tabs">
          <button
            type="button"
            className={
              storyView ===
              'active'
                ? 'plant-story-view-tab plant-story-view-tab--active'
                : 'plant-story-view-tab'
            }
            onClick={() =>
              changeStoryView(
                'active',
              )
            }
          >
            Growing now
            <span>
              {
                activePlants.length
              }
            </span>
          </button>
  
          <button
            type="button"
            className={
              storyView ===
              'completed'
                ? 'plant-story-view-tab plant-story-view-tab--active'
                : 'plant-story-view-tab'
            }
            onClick={() =>
              changeStoryView(
                'completed',
              )
            }
          >
            Completed
            <span>
              {
                completedPlants.length
              }
            </span>
          </button>
        </div>
  
  
        {!compareMode && (
          <>
            <section className="plant-browser-controls">
              <div className="plant-browser-search-row">
                <label className="plant-browser-search">
                  <span className="section-label">
                    Find a growing story
                  </span>
  
                  <input
                    type="search"
                    value={
                      searchQuery
                    }
                    placeholder="Search plants, varieties, places, recipes, notes..."
                    onChange={
                      event =>
                        setSearchQuery(
                          event.target.value,
                        )
                    }
                  />
                </label>
  
                <label className="plant-browser-sort">
                  <span className="section-label">
                    Sort
                  </span>
  
                  <select
                    value={
                      sortBy
                    }
                    onChange={
                      event =>
                        setSortBy(
                          event.target.value as PlantSort,
                        )
                    }
                  >
                    <option value="newest-activity">
                      Newest activity
                    </option>
  
                    <option value="recently-planted">
                      Recently planted
                    </option>
  
                    <option value="oldest-planted">
                      Oldest planted
                    </option>
  
                    <option value="plant-az">
                      Plant A–Z
                    </option>
  
                    <option value="variety-az">
                      Variety A–Z
                    </option>
  
                    <option value="growing-place-az">
                      Growing Place A–Z
                    </option>
                  </select>
                </label>
              </div>
  
  
              <div className="plant-browser-age-unit">
                <span className="section-label">
                  Show age in
                </span>
  
                <div className="plant-browser-age-buttons">
                  {(
                    [
                      'days',
                      'weeks',
                      'months',
                    ] as DurationDisplayUnit[]
                  ).map(
                    unit => (
                      <button
                        key={
                          unit
                        }
                        type="button"
                        className={
                          ageUnit ===
                          unit
                            ? 'plant-filter-chip plant-filter-chip--selected'
                            : 'plant-filter-chip'
                        }
                        onClick={() =>
                          setAgeUnit(
                            unit,
                          )
                        }
                      >
                        {
                          unit
                        }
                      </button>
                    ),
                  )}
                </div>
              </div>
  
  
              {startMethodOptions.length >
                0 && (
                <div className="plant-filter-group">
                  <span className="section-label">
                    Started as
                  </span>
  
                  <div className="plant-filter-options">
                    {startMethodOptions.map(
                      option => (
                        <button
                          key={
                            option
                          }
                          type="button"
                          className={
                            selectedStartMethods.includes(
                              option,
                            )
                              ? 'plant-filter-chip plant-filter-chip--selected'
                              : 'plant-filter-chip'
                          }
                          onClick={() =>
                            toggleFilter(
                              'start-method',
                              option,
                            )
                          }
                        >
                          {
                            option
                          }
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
  
  
              {growingPlaceOptions.length >
                0 && (
                <div className="plant-filter-group">
                  <span className="section-label">
                    Growing Place
                  </span>
  
                  <div className="plant-filter-options">
                    {growingPlaceOptions.map(
                      option => (
                        <button
                          key={
                            option
                          }
                          type="button"
                          className={
                            selectedGrowingPlaces.includes(
                              option,
                            )
                              ? 'plant-filter-chip plant-filter-chip--selected'
                              : 'plant-filter-chip'
                          }
                          onClick={() =>
                            toggleFilter(
                              'growing-place',
                              option,
                            )
                          }
                        >
                          {
                            option
                          }
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
  
  
              {growingSetupOptions.length >
                0 && (
                <div className="plant-filter-group">
                  <span className="section-label">
                    Growing Recipe
                  </span>
  
                  <div className="plant-filter-options">
                    {growingSetupOptions.map(
                      option => (
                        <button
                          key={
                            option
                          }
                          type="button"
                          className={
                            selectedGrowingSetups.includes(
                              option,
                            )
                              ? 'plant-filter-chip plant-filter-chip--selected'
                              : 'plant-filter-chip'
                          }
                          onClick={() =>
                            toggleFilter(
                              'growing-setup',
                              option,
                            )
                          }
                        >
                          {
                            option
                          }
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
  
  
              {(activeFilterCount >
                0 ||
                searchQuery.trim()) && (
                <button
                  type="button"
                  className="text-button"
                  onClick={
                    clearFilters
                  }
                >
                  Clear search and filters
                </button>
              )}
            </section>
  
  
            {smartComparisonSuggestions.length >
              0 && (
              <section className="dashboard-section plant-smart-comparisons">
                <div className="section-heading">
                  <div>
                    <p className="section-label">
                      Worth comparing
                    </p>
  
                    <h2>
                      Stories that may tell you something
                    </h2>
  
                    <p>
                      Garden of Mine has found groups of your
                      own growing stories with useful
                      differences to look at together.
                    </p>
                  </div>
                </div>
  
                <div className="plant-smart-comparison-list">
                  {smartComparisonSuggestions.map(
                    suggestion => (
                      <article
                        key={
                          suggestion.id
                        }
                        className="plant-smart-comparison"
                      >
                        <div>
                          <h3>
                            {
                              suggestion.title
                            }
                          </h3>
  
                          <p>
                            {suggestion.reasons.join(
                              ' · ',
                            )}
                          </p>
                        </div>
  
                        <button
                          type="button"
                          className="text-button"
                          onClick={() =>
                            beginSmartComparison(
                              suggestion.plantIds,
                            )
                          }
                        >
                          Compare these
                        </button>
                      </article>
                    ),
                  )}
                </div>
              </section>
            )}
  
  
            <section className="dashboard-section">
              <div className="section-heading">
                <div>
                  <p className="section-label">
                    {storyView ===
                    'completed'
                      ? 'Garden history'
                      : 'In the garden'}
                  </p>
  
                  <h2>
                    {visiblePlants.length}{' '}
                    {visiblePlants.length ===
                    1
                      ? 'story'
                      : 'stories'}
                  </h2>
                </div>
              </div>
  
  
              <div className="plant-grid">
                {visiblePlants.length >
                0 ? (
                  visiblePlants.map(
                    plant => {
                      const document =
                        searchDocumentByPlantId.get(
                          plant.id,
                        )
  
                      const expectedTimingDetails =
                        getPlantExpectedTimingDetails(
                          plant,
                          events,
                        )
  
                      const richDetails = [
                        ...expectedTimingDetails,
                      ]
  
                      return (
                        <PlantCard
                          key={
                            plant.id
                          }
                          plant={
                            plant
                          }
                          growingPlaceName={
                            document?.growingPlaceName
                          }
                          latestActivityDate={
                            document?.latestActivityDate
                          }
                          latestActivitySummary={
                            document?.latestActivitySummary
                          }
                          thumbnailPhotoUrl={
                            document?.thumbnailPhotoUrl
                          }
                          ageUnit={
                            ageUnit
                          }
                          richDetails={
                            richDetails
                          }
                          onOpen={
                            onOpenPlant
                          }
                        />
                      )
                    },
                  )
                ) : (
                  <div className="plant-browser-empty">
                    <h2>
                      No stories match
                    </h2>
  
                    <p>
                      Try another word or
                      loosen one of the
                      filters.
                    </p>
  
                    <button
                      type="button"
                      className="text-button"
                      onClick={
                        clearFilters
                      }
                    >
                      Clear search and filters
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
  
  
        {compareMode && (
          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  Compare
                </p>
  
                <h2>
                  Choose growing stories
                </h2>
  
                <p>
                  Choose two to six growing stories
                  to look at together.
                </p>
              </div>
            </div>
  
            <div className="plant-grid">
              {storyViewPlants.map(
                plant => {
                  const document =
                    searchDocumentByPlantId.get(
                      plant.id,
                    )
  
                  return (
                    <PlantCard
                      key={
                        plant.id
                      }
                      plant={
                        plant
                      }
                      growingPlaceName={
                        document?.growingPlaceName
                      }
                      latestActivityDate={
                        document?.latestActivityDate
                      }
                      latestActivitySummary={
                        document?.latestActivitySummary
                      }
                      thumbnailPhotoUrl={
                        document?.thumbnailPhotoUrl
                      }
                      ageUnit={
                        ageUnit
                      }
                      onOpen={
                        onOpenPlant
                      }
                      compareMode
                      isSelectedForComparison={
                        selectedPlantIds.includes(
                          plant.id,
                        )
                      }
                      onToggleComparison={
                        togglePlantForComparison
                      }
                    />
                  )
                },
              )}
            </div>
          </section>
        )}
  
  
        {compareMode &&
          selectedPlantIds.length >
            0 && (
            <aside
              className="plant-compare-tray"
              aria-label="Plants selected for comparison"
            >
              <div className="plant-compare-tray-copy">
                <p className="section-label">
                  Compare tray
                </p>
  
                <strong>
                  {selectedPlantIds.length}{' '}
                  {selectedPlantIds.length ===
                  1
                    ? 'story'
                    : 'stories'}{' '}
                  selected
                </strong>
  
                <p className="form-whisper">
                  {selectedPlants
                    .map(
                      plant =>
                        plant.displayName,
                    )
                    .join(
                      ' · ',
                    )}
                </p>
              </div>
  
              <button
                type="button"
                className="journal-add-button"
                disabled={
                  selectedPlantIds.length <
                  2
                }
                onClick={() =>
                  onComparePlants(
                    selectedPlantIds,
                  )
                }
              >
                Compare{' '}
                {selectedPlantIds.length}{' '}
                {selectedPlantIds.length ===
                1
                  ? 'story'
                  : 'stories'}
              </button>
            </aside>
          )}
      </MainPageTemplate>
  )
  }


