import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import PlantCard from '../components/cards/PlantCard'
import GardenLayout from '../components/layout/GardenLayout'

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


interface PlantPhotoCandidate {
  photoUrl:
    string

  date:
    string

  priority:
    number
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
   LATEST PLANT MEMORY
======================================= */

interface PlantMemoryClue {
  date: string
  summary: string
  priority: number
}


function cleanMemoryText(
  value:
    string | undefined,
): string {
  return (
    value ??
    ''
  )
    .replace(
      /\s+/g,
      ' ',
    )
    .trim()
}


function shortenMemoryText(
  value:
    string,
  maxLength =
    74,
): string {
  if (
    value.length <=
    maxLength
  ) {
    return value
  }

  return `${
    value
      .slice(
        0,
        maxLength - 1,
      )
      .trimEnd()
  }…`
}


function formatEventTypeLabel(
  type:
    GardenEvent['type'],
): string {
  switch (
    type
  ) {
    case 'observation':
      return 'Observed'

    case 'watered':
      return 'Watered'

    case 'fed':
      return 'Fertilised'

    case 'sprouted':
      return 'Sprouted'

    case 'pruned':
      return 'Pruned'

    case 'treated':
      return 'Treated'

    case 'moved':
      return 'Moved'

    case 'transplanted':
      return 'Transplanted'

    case 'hilled':
      return 'Hilled'

    case 'weather':
      return 'Weather'

    case 'photo':
      return 'Photograph'

    case 'note':
      return 'Note'

    case 'harvest':
      return 'Harvest'

    case 'planted':
      return 'Planted'

    default:
      return 'Garden moment'
  }
}


function getEventMemorySummary(
  event:
    GardenEvent,

  growingPlaces:
    GrowingPlace[],

  products:
    GardenProduct[],
): string {
  const activityTypes =
    event.activityTypes
      ?.length
      ? event.activityTypes
      : [
          event.type,
        ]


  const activityLabel =
    activityTypes
      .map(
        activity =>
          formatEventTypeLabel(
            activity,
          ),
      )
      .join(
        ' + ',
      )


  const title =
    cleanMemoryText(
      event.title,
    )


  const note =
    cleanMemoryText(
      event.notes,
    )


  const treatmentReason =
    cleanMemoryText(
      event.treatmentReason,
    )


  const productText =
    cleanMemoryText(
      event.productUsed,
    )


  const genericTitles = [
    activityLabel
      .toLocaleLowerCase(),

    'garden moment',

    'adding a moment',

    'add a moment',

    'journal entry',

    'adding this page',

    'new journal entry',
  ]


  const titleIsUseful =
    Boolean(
      title,
    ) &&
    !genericTitles.includes(
      title
        .toLocaleLowerCase(),
    )


  if (
    titleIsUseful
  ) {
    return shortenMemoryText(
      `${activityLabel} · ${title}`,
    )
  }


  if (
    activityTypes.includes(
      'treated',
    ) &&
    treatmentReason
  ) {
    return shortenMemoryText(
      `Treated · ${treatmentReason}`,
    )
  }


  if (
    note
  ) {
    return shortenMemoryText(
      `${activityLabel} · ${note}`,
    )
  }


  const linkedProductNames =
    (
      event.productIds ??
      []
    )
      .map(
        productId =>
          products.find(
            product =>
              product.id ===
              productId,
          )?.name,
      )
      .filter(
        (
          name,
        ): name is string =>
          Boolean(
            name,
          ),
      )


  if (
    linkedProductNames.length >
    0
  ) {
    return shortenMemoryText(
      `${activityLabel} · ${
        linkedProductNames.join(
          ' · ',
        )
      }`,
    )
  }


  if (
    productText
  ) {
    return shortenMemoryText(
      `${activityLabel} · ${productText}`,
    )
  }


  const photoContext =
    (
      event.photoMetadata ??
      []
    )
      .map(
        metadata => {
          if (
            !metadata
          ) {
            return ''
          }


          const photoTitle =
            cleanMemoryText(
              metadata.title,
            )


          if (
            photoTitle
          ) {
            return photoTitle
          }


          const photoNotes =
            cleanMemoryText(
              metadata.notes,
            )


          if (
            photoNotes
          ) {
            return photoNotes
          }


          if (
            metadata.purpose
          ) {
            return metadata.purpose
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


          return ''
        },
      )
      .find(
        Boolean,
      )


  if (
    photoContext
  ) {
    return shortenMemoryText(
      `${activityLabel} · ${photoContext}`,
    )
  }


  const placeNames =
    (
      event.growingPlaceIds ??
      []
    )
      .map(
        placeId =>
          growingPlaces.find(
            place =>
              place.id ===
              placeId,
          )?.name,
      )
      .filter(
        (
          name,
        ): name is string =>
          Boolean(
            name,
          ),
      )


  if (
    placeNames.length >
    0
  ) {
    return shortenMemoryText(
      `${activityLabel} · ${
        placeNames.join(
          ' · ',
        )
      }`,
    )
  }


  return activityLabel
}


function getHarvestMemorySummary(
  harvest:
    HarvestRecord,
): string {
  const details:
    string[] = []


  if (
    harvest.count !==
    undefined
  ) {
    details.push(
      `${harvest.count} ${
        harvest.count ===
        1
          ? 'item'
          : 'items'
      }`,
    )
  }


  if (
    harvest.measurementAmount !==
    undefined
  ) {
    const measurementUnit =
      harvest.customMeasurementUnitLabel ??
      harvest.measurementUnit

    details.push(
      measurementUnit
        ? `${harvest.measurementAmount} ${
            measurementUnit
              .replaceAll(
                '-',
                ' ',
              )
          }`
        : String(
            harvest.measurementAmount,
          ),
    )
  }


  if (
    harvest.quality
  ) {
    details.push(
      harvest.quality
        .charAt(
          0,
        )
        .toUpperCase() +
      harvest.quality
        .slice(
          1,
        ),
    )
  }


  const notes =
    cleanMemoryText(
      harvest.notes,
    )


  if (
    details.length ===
      0 &&
    notes
  ) {
    details.push(
      notes,
    )
  }


  return shortenMemoryText(
    details.length >
      0
      ? `Harvest · ${
          details.join(
            ' · ',
          )
        }`
      : 'Harvest',
  )
}


function getPhotoMemorySummary(
  title:
    string | undefined,

  notes:
    string | undefined,

  purpose:
    string | undefined,
): string {
  const titleText =
    cleanMemoryText(
      title,
    )


  if (
    titleText
  ) {
    return shortenMemoryText(
      `Photograph · ${titleText}`,
    )
  }


  const notesText =
    cleanMemoryText(
      notes,
    )


  if (
    notesText
  ) {
    return shortenMemoryText(
      `Photograph · ${notesText}`,
    )
  }


  if (
    purpose
  ) {
    return `Photograph · ${
      purpose
        .replaceAll(
          '-',
          ' ',
        )
        .replace(
          /\b\w/g,
          letter =>
            letter.toUpperCase(),
        )
    }`
  }


  return 'Photograph'
}


function getLatestPlantMemoryClue(
  plant:
    PlantStory,

  plantEvents:
    GardenEvent[],

  plantHarvests:
    HarvestRecord[],

  growingPlaces:
    GrowingPlace[],

  products:
    GardenProduct[],
): PlantMemoryClue | undefined {
  const clues:
    PlantMemoryClue[] =
    []


  /*
   * Journal Moments are appended to the
   * garden event collection when they are
   * created.
   *
   * plantEvents preserves that order.
   *
   * So, when several Moments share the same
   * calendar date, the later array position
   * is the later-created Moment.
   */
  plantEvents.forEach(
    (
      event,
      index,
    ) => {
      clues.push({
        date:
          event.date,

        summary:
          getEventMemorySummary(
            event,
            growingPlaces,
            products,
          ),

        /*
         * Journal wins over Harvest/photo
         * on an exact same-date tie.
         *
         * Within Journal, later-created
         * Moments win.
         */
        priority:
          300000 +
          index,
      })
    },
  )


  plantHarvests.forEach(
    (
      harvest,
      index,
    ) => {
      clues.push({
        date:
          harvest.date,

        summary:
          getHarvestMemorySummary(
            harvest,
          ),

        priority:
          200000 +
          index,
      })
    },
  )


  ;(
    plant.photoUrls ??
    []
  ).forEach(
    (
      _photoUrl,
      index,
    ) => {
      const metadata =
        plant.photoMetadata?.[
          index
        ]

      const photoDate =
        metadata
          ?.photoDate ??
        plant.photoDates?.[
          index
        ]

      if (
        !photoDate
      ) {
        return
      }

      clues.push({
        date:
          photoDate,

        summary:
          getPhotoMemorySummary(
            metadata?.title,
            metadata?.notes,
            metadata?.purpose,
          ),

        priority:
          100000 +
          index,
      })
    },
  )


  if (
    clues.length ===
    0
  ) {
    return undefined
  }


  return [
    ...clues,
  ].sort(
    (
      first,
      second,
    ) => {
      /*
       * First choose the genuinely newest
       * calendar date.
       */
      const dateComparison =
        second.date.localeCompare(
          first.date,
        )

      if (
        dateComparison !==
        0
      ) {
        return dateComparison
      }


      /*
       * Same date:
       *
       * later-created Journal Moment wins;
       * Journal beats Harvest;
       * Harvest beats direct Plant photo.
       */
      return (
        second.priority -
        first.priority
      )
    },
  )[0]
}

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
   PHOTO DATE
======================================= */

function getPhotoDate(
  metadataDate:
    string | undefined,

  legacyDate:
    string | undefined,

  fallback:
    string,
): string {
  return (
    metadataDate ??
    legacyDate ??
    fallback
  )
}


/* =======================================
   PLANT THUMBNAIL
======================================= */

function getPlantThumbnailPhotoUrl(
  plant:
    PlantStory,

  plantEvents:
    GardenEvent[],

  plantHarvests:
    HarvestRecord[],
): string | undefined {
  const candidates:
    PlantPhotoCandidate[] =
    []


  for (
    let index = 0;
    index <
    (
      plant.photoUrls ??
      []
    ).length;
    index += 1
  ) {
    const photoUrl =
      plant.photoUrls?.[
        index
      ]

    if (
      !photoUrl
    ) {
      continue
    }

    candidates.push({
      photoUrl,

      date:
        getPhotoDate(
          plant.photoMetadata?.[
            index
          ]?.photoDate,
          plant.photoDates?.[
            index
          ],
          plant.updatedAt ??
            plant.plantedDate,
        ),

      priority:
        3,
    })
  }


  for (
    const event
    of plantEvents
  ) {
    for (
      let index = 0;
      index <
      (
        event.photoUrls ??
        []
      ).length;
      index += 1
    ) {
      const photoUrl =
        event.photoUrls?.[
          index
        ]

      if (
        !photoUrl
      ) {
        continue
      }

      candidates.push({
        photoUrl,

        date:
          getPhotoDate(
            event.photoMetadata?.[
              index
            ]?.photoDate,
            undefined,
            event.date,
          ),

        priority:
          2,
      })
    }
  }


  for (
    const harvest
    of plantHarvests
  ) {
    for (
      let index = 0;
      index <
      (
        harvest.photoUrls ??
        []
      ).length;
      index += 1
    ) {
      const photoUrl =
        harvest.photoUrls?.[
          index
        ]

      if (
        !photoUrl
      ) {
        continue
      }

      candidates.push({
        photoUrl,

        date:
          getPhotoDate(
            harvest.photoMetadata?.[
              index
            ]?.photoDate,
            undefined,
            harvest.date,
          ),

        priority:
          1,
      })
    }
  }


  if (
    candidates.length ===
    0
  ) {
    return undefined
  }


  candidates.sort(
    (
      first,
      second,
    ) => {
      const dateDifference =
        second.date.localeCompare(
          first.date,
        )

      if (
        dateDifference !==
        0
      ) {
        return dateDifference
      }

      return (
        second.priority -
        first.priority
      )
    },
  )


  return candidates[0]
    .photoUrl
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


  const latestMemoryClue =
    getLatestPlantMemoryClue(
      plant,
      plantEvents,
      plantHarvests,
      growingPlaces,
      products,
    )


  const latestActivityDate =
    latestMemoryClue?.date ??
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
      latestMemoryClue?.summary,

    thumbnailPhotoUrl:
      getPlantThumbnailPhotoUrl(
        plant,
        plantEvents,
        plantHarvests,
      ),

    searchText:
      normaliseSearchText(
        searchWords.join(
          ' ',
        ),
      ),
  }
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


  function chooseSmartComparison(
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

    const containsCompleted =
      usablePlantIds.some(
        plantId =>
          plants.some(
            plant =>
              plant.id ===
                plantId &&
              plant.status ===
                'finished',
          ),
      )

    setStoryView(
      containsCompleted
        ? 'completed'
        : 'active',
    )

    setSelectedPlantIds(
      usablePlantIds,
    )

    setCompareMode(
      true,
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
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


  /* =======================================
     BACK TO TOP
  ======================================= */

  function backToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  /* =======================================
     FILTER GROUP
  ======================================= */

  function renderFilterGroup(
    title:
      string,

    family:
      PlantFilterFamily,

    options:
      string[],

    selected:
      string[],
  ) {
    if (
      options.length ===
      0
    ) {
      return null
    }


    return (
      <fieldset className="plant-filter-group">
        <legend>
          {title}
        </legend>

        <div className="plant-filter-options">
          {options.map(
            option => (
              <label
                className="plant-filter-option"
                key={
                  `${family}-${option}`
                }
              >
                <input
                  type="checkbox"
                  checked={
                    selected.includes(
                      option,
                    )
                  }
                  onChange={() =>
                    toggleFilter(
                      family,
                      option,
                    )
                  }
                />

                <span>
                  {option}
                </span>
              </label>
            ),
          )}
        </div>
      </fieldset>
    )
  }


  return (
    <GardenLayout
      activePage="plants"
      onNavigate={
        onNavigate
      }
    >
      <div className="garden-page">

        <header className="garden-header">
          <div>
            <p className="app-name">
              Sprig
            </p>

            <h1 className="garden-title">
              {storyView ===
              'completed'
                ? 'Completed stories'
                : 'Growing stories'}
            </h1>

            <p className="garden-subtitle">
              {compareMode
                ? 'Choose two to six growing stories to look at together.'
                : storyView ===
                  'completed'
                  ? 'Finished chapters kept as part of the garden’s history.'
                  : 'Every plant has its own chapter.'}
            </p>
          </div>


          <div className="plant-page-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={
                toggleCompareMode
              }
            >
              {compareMode
                ? 'Cancel comparison'
                : '↔ Compare'}
            </button>

            {!compareMode &&
              storyView ===
                'active' && (
                <button
                  type="button"
                  className="journal-add-button"
                  onClick={
                    onAddPlant
                  }
                >
                  🌱 Add a plant
                </button>
              )}
          </div>
        </header>


        {!compareMode && (
          <nav
            className="plant-story-view-navigation"
            aria-label="Plant Story history"
          >
            <button
              type="button"
              className={
                storyView ===
                'active'
                  ? 'plant-story-view-button active'
                  : 'plant-story-view-button'
              }
              onClick={() =>
                changeStoryView(
                  'active',
                )
              }
            >
              <span>
                <strong>
                  Growing now
                </strong>

                <small>
                  {activePlants.length}{' '}
                  {activePlants.length ===
                  1
                    ? 'active story'
                    : 'active stories'}
                </small>
              </span>
            </button>


            <button
              type="button"
              className={
                storyView ===
                'completed'
                  ? 'plant-story-view-button active'
                  : 'plant-story-view-button'
              }
              onClick={() =>
                changeStoryView(
                  'completed',
                )
              }
            >
              <span>
                <strong>
                  Completed stories
                </strong>

                <small>
                  {completedPlants.length}{' '}
                  {completedPlants.length ===
                  1
                    ? 'finished story'
                    : 'finished stories'}
                </small>
              </span>
            </button>
          </nav>
        )}


        {!compareMode &&
          smartComparisonSuggestions.length >
            0 && (
            <details className="sprig-smart-comparisons sprig-smart-collapsible">
              <summary className="sprig-smart-summary">
                <div className="sprig-smart-summary-copy">
                  <span
                    className="sprig-smart-summary-mark"
                    aria-hidden="true"
                  >
                    🌱
                  </span>

                  <div>
                    <p className="section-label">
                      Sprig Smart
                    </p>

                    <h2>
                      Sprig noticed something
                    </h2>

                    <p>
                      {smartComparisonSuggestions.length}{' '}
                      {smartComparisonSuggestions.length ===
                      1
                        ? 'useful comparison'
                        : 'useful comparisons'}{' '}
                      in your growing stories
                    </p>
                  </div>
                </div>

                <span className="sprig-smart-summary-action">
                  <span className="sprig-smart-summary-open">
                    See what Sprig noticed
                  </span>

                  <span className="sprig-smart-summary-close">
                    Hide what Sprig noticed
                  </span>

                  <span
                    className="sprig-smart-summary-chevron"
                    aria-hidden="true"
                  >
                    ›
                  </span>
                </span>
              </summary>


              <div className="sprig-smart-expanded">
                <div className="sprig-smart-expanded-heading">
                  <div>
                    <p className="section-label">
                      Sprig Smart
                    </p>

                    <h2>
                      Stories worth looking at together
                    </h2>
                  </div>
                </div>

                <p className="form-whisper sprig-smart-intro">
                  Sprig has found growing stories
                  with enough shared history to
                  make a comparison useful.
                </p>


                <div className="sprig-smart-comparison-list">
                  {smartComparisonSuggestions.map(
                    suggestion => (
                      <article
                        className="sprig-smart-comparison-card"
                        key={
                          suggestion.id
                        }
                      >
                        <div className="sprig-smart-comparison-main">
                          <div>
                            <p className="sprig-smart-comparison-crop">
                              {suggestion.cropLabel}
                            </p>

                            <h3>
                              {suggestion.title}
                            </h3>
                          </div>

                          <div className="sprig-smart-reasons">
                            {suggestion.reasons.map(
                              reason => (
                                <span
                                  key={
                                    `${suggestion.id}-${reason}`
                                  }
                                >
                                  {reason}
                                </span>
                              ),
                            )}
                          </div>
                        </div>

                        <div className="sprig-smart-comparison-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              chooseSmartComparison(
                                suggestion.plantIds,
                              )
                            }
                          >
                            Choose stories
                          </button>

                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              beginSmartComparison(
                                suggestion.plantIds,
                              )
                            }
                          >
                            Compare now
                          </button>
                        </div>
                      </article>
                    ),
                  )}
                </div>


                <div className="sprig-smart-collapse-footer">
                  <button
                    type="button"
                    className="text-button"
                    onClick={
                      event => {
                        const details =
                          event.currentTarget.closest(
                            'details',
                          )

                        if (
                          details instanceof
                          HTMLDetailsElement
                        ) {
                          details.open =
                            false

                          details.scrollIntoView({
                            behavior:
                              'smooth',

                            block:
                              'nearest',
                          })
                        }
                      }
                    }
                  >
                    ↑ Hide Sprig Smart
                  </button>
                </div>
              </div>
            </details>
          )}


        {compareMode && (
          <section className="plant-compare-guidance">
            <p>
              <strong>
                {selectedPlantIds.length}{' '}
                of{' '}
                {MAX_COMPARE_PLANTS}{' '}
                selected
              </strong>
            </p>

            <p className="form-whisper">
              Choose the plants whose
              growth, photographs,
              harvests and garden
              histories you want Sprig
              to place side by side.
            </p>
          </section>
        )}


        {!compareMode && (
          <div className="plant-browser-layout">

            <aside className="plant-browser-tools">
              <div className="plant-browser-tools-heading">
                <div>
                  <p className="section-label">
                    Find a story
                  </p>

                  <h2>
                    Search your plants
                  </h2>
                </div>

                {(activeFilterCount >
                  0 ||
                  searchQuery) && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={
                      clearFilters
                    }
                  >
                    Clear
                  </button>
                )}
              </div>


              <label className="plant-search-field">
                <span className="plant-tool-label">
                  Search
                </span>

                <input
                  type="search"
                  value={
                    searchQuery
                  }
                  onChange={
                    event =>
                      setSearchQuery(
                        event.target.value,
                      )
                  }
                  placeholder="Plant, place, recipe, harvest, note..."
                />
              </label>


              <label className="plant-sort-field">
                <span className="plant-tool-label">
                  Order by
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

                  <option value="newest-activity">
                    Newest activity
                  </option>
                </select>
              </label>


              <fieldset className="plant-filter-group">
                <legend>
                  Show plant age in
                </legend>

                <div
                  className="plant-browser-age-control"
                  aria-label="Plant age display"
                >
                  {(
                    [
                      'days',
                      'weeks',
                      'months',
                    ] as DurationDisplayUnit[]
                  ).map(
                    unit => (
                      <button
                        type="button"
                        key={
                          unit
                        }
                        className={
                          ageUnit ===
                          unit
                            ? 'selected'
                            : ''
                        }
                        onClick={() =>
                          setAgeUnit(
                            unit,
                          )
                        }
                        aria-pressed={
                          ageUnit ===
                          unit
                        }
                      >
                        {unit ===
                        'days'
                          ? 'Days'
                          : unit ===
                            'weeks'
                            ? 'Weeks'
                            : 'Months'}
                      </button>
                    ),
                  )}
                </div>
              </fieldset>


              {renderFilterGroup(
                'Started as',
                'start-method',
                startMethodOptions,
                selectedStartMethods,
              )}


              {renderFilterGroup(
                'Growing Place',
                'growing-place',
                growingPlaceOptions,
                selectedGrowingPlaces,
              )}


              {renderFilterGroup(
                'Growing Recipe',
                'growing-setup',
                growingSetupOptions,
                selectedGrowingSetups,
              )}
            </aside>


            <main className="plant-browser-results">
              <div className="plant-results-heading">
                <p>
                  <strong>
                    {visiblePlants.length}
                  </strong>{' '}
                  {visiblePlants.length ===
                  1
                    ? 'story'
                    : 'stories'}
                </p>

                {activeFilterCount >
                  0 && (
                  <p className="plant-active-filter-note">
                    {activeFilterCount}{' '}
                    {activeFilterCount ===
                    1
                      ? 'filter'
                      : 'filters'}{' '}
                    active
                  </p>
                )}
              </div>


              <section className="dashboard-section">
                <div className="plant-grid">
                  {visiblePlants.length >
                  0 ? (
                    visiblePlants.map(
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
            </main>
          </div>
        )}


        {compareMode && (
          <section className="dashboard-section">
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


        <div className="plant-back-to-top">
          <button
            type="button"
            className="text-button"
            onClick={
              backToTop
            }
          >
            ↑ Back to top
          </button>
        </div>


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
      </div>
    </GardenLayout>
  )
}