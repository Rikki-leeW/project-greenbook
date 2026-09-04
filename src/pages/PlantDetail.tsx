import {
  useLayoutEffect,
  useState,
} from 'react'

import GardenLayout from '../components/layout/GardenLayout'
import AddPlantForm from '../components/forms/AddPlantForm'

import SprigPhotoGallery from '../components/photos/SprigPhotoGallery'
import SprigPhotoPicker from '../components/photos/SprigPhotoPicker'

import SprigQuickPeek from '../components/common/SprigQuickPeek'

import type {
  GardenEvent,
  GardenProduct,
  GrowingPlace,
  GrowingSetup,
  Ingredient,
  PlantOriginType,
  PlantStory,
  HarvestRecord,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface PlantDetailProps {
  plant: PlantStory

  growingPlaces: GrowingPlace[]

  growingSetups: GrowingSetup[]

  ingredients: Ingredient[]

  products: GardenProduct[]

  events: GardenEvent[]

  harvests: HarvestRecord[]

  journeyBackLabel:
  string | null

onBack: () => void

onOpenPlants: () => void

onNavigate: (
  page: AppPage,
) => void

  onOpenGrowingPlace: (
    growingPlaceId: string,
  ) => void

  onOpenJournalEntry: (
    eventId: string,
  ) => void

  onOpenHarvest: (
    harvestId: string,
  ) => void

  onAddHarvest: (
    plantStoryIds: string[],
  ) => void

  onAddEvent: () => void

  onAddPlant: (
    plant: PlantStory,
  ) => void

  onAddGrowingPlace: (
    place: GrowingPlace,
    setup?: GrowingSetup,
  ) => void

  onAddRecipe: (
    recipe: GrowingSetup,
  ) => void

  onAddIngredient: (
    ingredient: Ingredient,
  ) => void

  onAddProduct: (
    product: GardenProduct,
  ) => void

  onDeleteEvent: (
    eventId: string,
  ) => void

  onDeletePlant: (
    plantId: string,
  ) => void

  onUpdatePlant: (
    plant: PlantStory,
  ) => void
}


/* =======================================
   GENERAL LABEL
======================================= */

function formatLabel(
  value: string,
): string {
  return value
    .replaceAll(
      '-',
      ' ',
    )
    .replace(
      /\b\w/g,
      (
        letter,
      ) =>
        letter.toUpperCase(),
    )
}


/* =======================================
   DATE
======================================= */

function formatDate(
  date?: string,
): string {
  if (!date) {
    return 'Not recorded'
  }

  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString(
    'en-AU',
    {
      day:
        'numeric',

      month:
        'long',

      year:
        'numeric',
    },
  )
}


/* =======================================
   PHOTO GROWING AGE
======================================= */

function getPhotoGrowingAge(
  photoDate: string,
  plantedDate: string,
): string {
  const photoDateObject =
    new Date(
      `${photoDate}T00:00:00`,
    )


  const plantedDateObject =
    new Date(
      `${plantedDate}T00:00:00`,
    )


  const daysDifference =
    Math.round(
      (
        photoDateObject.getTime() -
        plantedDateObject.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        ),
    )


  if (
    daysDifference ===
    0
  ) {
    return 'the day this story began'
  }


  if (
    daysDifference ===
    1
  ) {
    return '1 day after planting'
  }


  if (
    daysDifference >
    1
  ) {
    return `${daysDifference} days after planting`
  }


  if (
    daysDifference ===
    -1
  ) {
    return '1 day before planting'
  }


  return `${Math.abs(
    daysDifference,
  )} days before planting`
}

/* =======================================
   GROWING RECIPE LABEL
======================================= */

function getGrowingSetupCategoryLabel(
  setup: GrowingSetup,
): string {
  switch (
    setup.category
  ) {
    case 'own-mix':
      return 'My Recipe'

    case 'bought-mix':
      return 'Bought Mix'

    case 'ground-type':
      return 'Native Ground'

    case 'growing-system':
      return 'Growing System'

    default:
      return 'Garden Recipe'
  }
}


/* =======================================
   START METHOD
======================================= */

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

  return formatLabel(
    plant.startMethod,
  )
}


/* =======================================
   PLANT ORIGIN
======================================= */

function getPlantOriginLabel(
  originType?: PlantOriginType,
): string {
  if (!originType) {
    return 'Not recorded'
  }

  switch (
    originType
  ) {
    case 'bought':
      return 'Bought'

    case 'saved-from-garden':
      return 'Saved from my garden'

    case 'propagated-from-plant':
      return 'Propagated from another plant'

    case 'gifted':
      return 'Given to me'

    case 'swapped':
      return 'Swapped'

    case 'found-or-existing':
      return 'Found or already growing'

    case 'unknown':
      return 'Not sure'

    case 'other':
      return 'Something else'

    default:
      return 'Not recorded'
  }
}


/* =======================================
   EVENT EMOJI
======================================= */

function getEventEmoji(
  type: GardenEvent['type'],
): string {
  if (
    type ===
    'planted'
  ) {
    return '🌱'
  }

  if (
    type ===
    'sprouted'
  ) {
    return '🌿'
  }

  if (
    type ===
    'watered'
  ) {
    return '💧'
  }

  if (
    type ===
    'fed'
  ) {
    return '🧪'
  }

  if (
    type ===
    'moved'
  ) {
    return '🪴'
  }

  if (
    type ===
    'hilled'
  ) {
    return '🥔'
  }

  if (
    type ===
    'pruned'
  ) {
    return '✂️'
  }

  if (
    type ===
    'treated'
  ) {
    return '🩹'
  }

  if (
    type ===
    'weather'
  ) {
    return '🌦️'
  }

  if (
    type ===
    'observation'
  ) {
    return '👀'
  }

  if (
    type ===
    'photo'
  ) {
    return '📷'
  }

  if (
    type ===
    'harvest'
  ) {
    return '🧺'
  }

  if (
    type ===
    'note'
  ) {
    return '📖'
  }

  return '📝'
}


/* =======================================
   HARVEST TIMELINE LABEL
======================================= */

function getHarvestTimelineTitle(
  harvest: HarvestRecord,
): string {
  if (
    harvest.harvestType ===
      'other' &&
    harvest.customHarvestTypeLabel
  ) {
    return harvest.customHarvestTypeLabel
  }


  switch (
    harvest.harvestType
  ) {
    case 'first':
      return 'First harvest'

    case 'regular':
      return 'Regular harvest'

    case 'main':
      return 'Main harvest'

    case 'secondary':
      return 'Secondary harvest'

    case 'final':
      return 'Final harvest'

    case 'other':
      return 'Other harvest'

    default:
      return 'Harvest'
  }
}


/* =======================================
   HARVEST TIMELINE AMOUNT
======================================= */

function getHarvestTimelineAmount(
  harvest: HarvestRecord,
): string | undefined {
  const pieces:
    string[] = []


  if (
    harvest.count !==
    undefined
  ) {
    pieces.push(
      `${harvest.count}`,
    )
  }


  if (
    harvest.measurementAmount !==
    undefined
  ) {
    let unitLabel = ''


    switch (
      harvest.measurementUnit
    ) {
      case 'gram':
        unitLabel = 'g'
        break

      case 'kilogram':
        unitLabel = 'kg'
        break

      case 'millilitre':
        unitLabel = 'mL'
        break

      case 'litre':
        unitLabel = 'L'
        break

      case 'bunch':
        unitLabel = 'bunch'
        break

      case 'handful':
        unitLabel = 'handful'
        break

      case 'basket':
        unitLabel = 'basket'
        break

      case 'container':
        unitLabel = 'container'
        break

      case 'other':
        unitLabel =
          harvest.customMeasurementUnitLabel ??
          ''
        break

      default:
        unitLabel = ''
    }


    pieces.push(
      unitLabel
        ? `${harvest.measurementAmount} ${unitLabel}`
        : `${harvest.measurementAmount}`,
    )
  }


  return pieces.length >
    0
    ? pieces.join(
        ' · ',
      )
    : undefined
}


/* =======================================
   HARVEST DATE
======================================= */

function addDaysToDate(
  date: string,
  days: number,
): Date {
  const result =
    new Date(
      `${date}T00:00:00`,
    )

  result.setDate(
    result.getDate() +
      days,
  )

  return result
}


/* =======================================
   EXPORT FILE NAME
======================================= */

function createSafeFileName(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      '-',
    )
    .replace(
      /^-|-$/g,
      '',
    )
}


/* =======================================
   PLANT DETAIL
======================================= */
export default function PlantDetail({
  plant,
  growingPlaces,
  growingSetups,
  ingredients,
  products,
  events,
  harvests,
  journeyBackLabel,
  onBack,
  onOpenPlants,
  onNavigate,
  onOpenGrowingPlace,
  onOpenJournalEntry,
  onOpenHarvest,
  onAddHarvest,
  onAddEvent,
  onAddPlant,
  onAddGrowingPlace,
  onAddRecipe,
  onAddIngredient,
  onAddProduct,
  onDeleteEvent,
  onDeletePlant,
  onUpdatePlant,
}: PlantDetailProps) {

  /* =======================================
     EDIT / VARIATION
  ======================================= */

  const [
    isEditOpen,
    setIsEditOpen,
  ] =
    useState(false)


  const [
    isVariationOpen,
    setIsVariationOpen,
  ] =
    useState(false)


  /* =======================================
     QUICK PEEK
  ======================================= */

  const [
    isRecipeQuickPeekOpen,
    setIsRecipeQuickPeekOpen,
  ] =
    useState(false)


  const [
    isHarvestTimingQuickPeekOpen,
    setIsHarvestTimingQuickPeekOpen,
  ] =
    useState(false)


  const [
    customHarvestTimingDate,
    setCustomHarvestTimingDate,
  ] =
    useState('')


  const [
    customHarvestTimingLabel,
    setCustomHarvestTimingLabel,
  ] =
    useState('')


 /* =======================================
   PHOTO ADDER
======================================= */

const [
  isPhotoQuickAddOpen,
  setIsPhotoQuickAddOpen,
] =
  useState(false)


const [
  photoDraft,
  setPhotoDraft,
] =
  useState<string[]>(
    plant.photoUrls ??
      [],
  )


  const [
    photoDateDraft,
    setPhotoDateDraft,
  ] =
    useState<
      (string | undefined)[]
    >(
      (
        plant.photoUrls ??
        []
      ).map(
        (
          _photoUrl,
          index,
        ) =>
          plant.photoDates?.[
            index
          ],
      ),
    )


  /* =======================================
     OPEN PLANT STORY AT TOP
  ======================================= */

  useLayoutEffect(
    () => {
      document.body.style.overflow =
        ''

      document.body.style.position =
        ''

      document.body.style.top =
        ''

      document.body.style.width =
        ''

      document.documentElement.style.overflow =
        ''


      function goToTop() {
        const scrollingElement =
          document.scrollingElement


        if (
          scrollingElement
        ) {
          scrollingElement.scrollTop =
            0

          scrollingElement.scrollLeft =
            0
        }


        document.documentElement.scrollTop =
          0

        document.body.scrollTop =
          0

        window.scrollTo(
          0,
          0,
        )
      }


      goToTop()


      const firstFrame =
        requestAnimationFrame(
          () => {
            requestAnimationFrame(
              () => {
                goToTop()
              },
            )
          },
        )


      return () => {
        cancelAnimationFrame(
          firstFrame,
        )
      }
    },
    [
      plant.id,
    ],
  )


  /* =======================================
     CURRENT GROWING PLACE
  ======================================= */

  const currentGrowingPlace =
    plant.currentGrowingPlaceId
      ? growingPlaces.find(
          (
            place,
          ) =>
            place.id ===
            plant.currentGrowingPlaceId,
        )
      : undefined


  /* =======================================
     CURRENT GROWING RECIPE
  ======================================= */

  const currentGrowingSetup =
    plant.currentGrowingSetupId
      ? growingSetups.find(
          (
            setup,
          ) =>
            setup.id ===
            plant.currentGrowingSetupId,
        )
      : undefined


  /* =======================================
     CURRENT RECIPE INGREDIENTS
  ======================================= */

  const currentRecipeIngredients =
    currentGrowingSetup
      ?.ingredientIds
      ?.map(
        (
          ingredientId,
        ) =>
          ingredients.find(
            (
              ingredient,
            ) =>
              ingredient.id ===
              ingredientId,
          ),
      )
      .filter(
        (
          ingredient,
        ): ingredient is Ingredient =>
          Boolean(
            ingredient,
          ),
      ) ??
    []


      /* =======================================
     GROWING JOURNEY
  ======================================= */

  const growingJourney =
  (
    plant.growingHistory ??
    []
  )
    .map(
      (
        historyEntry,
      ) => {
        const growingPlace =
          historyEntry.growingPlaceId
            ? growingPlaces.find(
                (
                  place,
                ) =>
                  place.id ===
                  historyEntry.growingPlaceId,
              )
            : undefined


        const growingSetup =
          historyEntry.growingSetupId
            ? growingSetups.find(
                (
                  setup,
                ) =>
                  setup.id ===
                  historyEntry.growingSetupId,
              )
            : undefined


        return {
          ...historyEntry,

          growingPlace,

          growingSetup,
        }
      },
    )
    .sort(
      (
        first,
        second,
      ) =>
        new Date(
          first.startedDate,
        ).getTime() -
        new Date(
          second.startedDate,
        ).getTime(),
    )


  /* =======================================
     GROWING TIME
  ======================================= */

  const storyBeginningDate =
    new Date(
      `${plant.plantedDate}T00:00:00`,
    )


  const today =
    new Date()


  const daysGrowing =
    Math.max(
      0,
      Math.floor(
        (
          today.getTime() -
          storyBeginningDate.getTime()
        ) /
          (
            1000 *
            60 *
            60 *
            24
          ),
      ),
    )

          
  /* =======================================
     HARVEST STORY
  ======================================= */

  const plantHarvests = [
    ...harvests,
  ]
    .filter(
      (
        harvest,
      ) =>
        harvest.plantStoryIds.includes(
          plant.id,
        ),
    )
    .sort(
      (
        first,
        second,
      ) =>
        new Date(
          first.date,
        ).getTime() -
        new Date(
          second.date,
        ).getTime(),
    )


  const firstPlantHarvest =
    plantHarvests[0]


  const latestPlantHarvest =
    plantHarvests[
      plantHarvests.length -
        1
    ]


  const totalHarvestCount =
    plantHarvests.reduce(
      (
        total,
        harvest,
      ) =>
        total +
        (
          harvest.count ??
          0
        ),
      0,
    )


  const harvestMeasurements =
    plantHarvests.filter(
      (
        harvest,
      ) =>
        typeof harvest.measurementAmount ===
          'number' &&
        Boolean(
          harvest.measurementUnit,
        ),
    )


  const harvestUnits =
    Array.from(
      new Set(
        harvestMeasurements.map(
          (
            harvest,
          ) =>
            harvest.measurementUnit,
        ),
      ),
    )


  const canCombineHarvestAmounts =
    harvestMeasurements.length >
      0 &&
    harvestUnits.length ===
      1


  const totalHarvestAmount =
    canCombineHarvestAmounts
      ? harvestMeasurements.reduce(
          (
            total,
            harvest,
          ) =>
            total +
            (
              harvest.measurementAmount ??
              0
            ),
          0,
        )
      : undefined


  const totalHarvestUnit =
    canCombineHarvestAmounts
      ? harvestUnits[0]
      : undefined


    /* =======================================
     HARVEST TIMING REFERENCE
  ======================================= */

  const harvestTimingReference =
    plant.harvestTimingReference


  const harvestTimingEvent =
    harvestTimingReference?.sourceType ===
      'garden-event' &&
    harvestTimingReference.eventId
      ? events.find(
          (
            event,
          ) =>
            event.id ===
            harvestTimingReference.eventId,
        )
      : undefined


  let harvestTimingReferenceDate =
    plant.plantedDate


  let harvestTimingReferenceLabel =
    'Planted'


  if (
    harvestTimingReference?.sourceType ===
      'sown' &&
    plant.sownDate
  ) {
    harvestTimingReferenceDate =
      plant.sownDate

    harvestTimingReferenceLabel =
      'Sown'
  } else if (
    harvestTimingReference?.sourceType ===
    'planted'
  ) {
    harvestTimingReferenceDate =
      plant.plantedDate

    harvestTimingReferenceLabel =
      'Planted'
  } else if (
    harvestTimingReference?.sourceType ===
      'planted-out' &&
    plant.plantedOutDate
  ) {
    harvestTimingReferenceDate =
      plant.plantedOutDate

    harvestTimingReferenceLabel =
      'Planted out'
  } else if (
    harvestTimingReference?.sourceType ===
      'garden-event' &&
    harvestTimingEvent
  ) {
    harvestTimingReferenceDate =
      harvestTimingEvent.date

    harvestTimingReferenceLabel =
      harvestTimingEvent.title
  } else if (
    harvestTimingReference?.sourceType ===
      'custom-date' &&
    harvestTimingReference.customDate
  ) {
    harvestTimingReferenceDate =
      harvestTimingReference.customDate

    harvestTimingReferenceLabel =
      harvestTimingReference.customLabel ??
      'Another date'
  }


  const harvestTimingReferenceDateObject =
    new Date(
      `${harvestTimingReferenceDate}T00:00:00`,
    )


  /* =======================================
     EXPECTED + ACTUAL HARVEST TIMING
  ======================================= */

  const expectedHarvestStart =
    plant.expectedHarvestDaysMin
      ? addDaysToDate(
          harvestTimingReferenceDate,
          plant.expectedHarvestDaysMin,
        )
      : undefined


  const expectedHarvestEnd =
    plant.expectedHarvestDaysMax
      ? addDaysToDate(
          harvestTimingReferenceDate,
          plant.expectedHarvestDaysMax,
        )
      : undefined


  /*
   * The first real Harvest Record becomes
   * the actual beginning of this plant's
   * harvest story.
   */

  const firstHarvestDate =
    firstPlantHarvest
      ? new Date(
          `${firstPlantHarvest.date}T00:00:00`,
        )
      : undefined


  /*
   * Number of days from the selected timing
   * reference until the first real harvest.
   */

  const actualDaysToFirstHarvest =
    firstHarvestDate
      ? Math.max(
          0,
          Math.round(
            (
              firstHarvestDate.getTime() -
              harvestTimingReferenceDateObject.getTime()
            ) /
              (
                1000 *
                60 *
                60 *
                24
              ),
          ),
        )
      : undefined


  /*
   * Compare the first real harvest with the
   * expected harvest window.
   */

  let harvestTimingDifference:
    number | undefined


  let harvestTimingStatus:
    | 'early'
    | 'expected'
    | 'late'
    | undefined


  if (
    firstHarvestDate &&
    expectedHarvestStart &&
    firstHarvestDate.getTime() <
      expectedHarvestStart.getTime()
  ) {
    harvestTimingStatus =
      'early'

    harvestTimingDifference =
      Math.round(
        (
          expectedHarvestStart.getTime() -
          firstHarvestDate.getTime()
        ) /
          (
            1000 *
            60 *
            60 *
            24
          ),
      )
  } else if (
    firstHarvestDate &&
    expectedHarvestEnd &&
    firstHarvestDate.getTime() >
      expectedHarvestEnd.getTime()
  ) {
    harvestTimingStatus =
      'late'

    harvestTimingDifference =
      Math.round(
        (
          firstHarvestDate.getTime() -
          expectedHarvestEnd.getTime()
        ) /
          (
            1000 *
            60 *
            60 *
            24
          ),
      )
  } else if (
    firstHarvestDate &&
    (
      expectedHarvestStart ||
      expectedHarvestEnd
    )
  ) {
    harvestTimingStatus =
      'expected'

    harvestTimingDifference =
      0
  }


  /* =======================================
     PLANT EVENTS
  ======================================= */

  const plantEvents = [
    ...events,
  ]
    .filter(
      (
        event,
      ) =>
        event.plantStoryIds.length ===
          0 ||
        event.plantStoryIds.includes(
          plant.id,
        ),
    )
    .sort(
      (
        first,
        second,
      ) =>
        new Date(
          second.date,
        ).getTime() -
        new Date(
          first.date,
        ).getTime(),
    )

  /* =======================================
     COMPLETE PLANT TIMELINE
  ======================================= */

  const storyTimeline = [
    ...plantEvents.map(
      (
        event,
      ) => ({
        kind:
          'event' as const,

        date:
          event.date,

        event,
      }),
    ),

    ...plantHarvests.map(
      (
        harvest,
      ) => ({
        kind:
          'harvest' as const,

        date:
          harvest.date,

        harvest,
      }),
    ),
  ].sort(
    (
      first,
      second,
    ) =>
      new Date(
        second.date,
      ).getTime() -
      new Date(
        first.date,
      ).getTime(),
  )

  /* =======================================
     HARVEST TIMING REFERENCE
  ======================================= */

  function saveHarvestTimingReference(
    sourceType:
      | 'sown'
      | 'planted'
      | 'planted-out'
      | 'garden-event'
      | 'custom-date',
    eventId?: string,
  ) {
    onUpdatePlant({
      ...plant,

      harvestTimingReference: {
        sourceType,

        eventId:
          sourceType ===
          'garden-event'
            ? eventId
            : undefined,

        customDate:
          sourceType ===
            'custom-date'
            ? customHarvestTimingDate
            : undefined,

        customLabel:
          sourceType ===
            'custom-date'
            ? (
                customHarvestTimingLabel.trim() ||
                undefined
              )
            : undefined,
      },

      updatedAt:
        new Date()
          .toISOString(),
    })


    setIsHarvestTimingQuickPeekOpen(
      false,
    )


    setCustomHarvestTimingDate(
      '',
    )


    setCustomHarvestTimingLabel(
      '',
    )
  }


  const harvestTimingMilestoneEvents =
    plantEvents.filter(
      (
        event,
      ) =>
        event.plantStoryIds.includes(
          plant.id,
        ) &&
        (
          event.type ===
            'planted' ||
          event.type ===
            'moved' ||
          event.type ===
            'sprouted'
        ),
    )


  /* =======================================
     FAVOURITE
  ======================================= */

  function toggleFavourite() {
    onUpdatePlant({
      ...plant,

      isFavourite:
        !plant.isFavourite,

      updatedAt:
        new Date()
          .toISOString(),
    })
  }


  /* =======================================
     ARCHIVE
  ======================================= */

  function archivePlant() {
    const confirmed =
      window.confirm(
        `Archive "${plant.displayName}"?\n\nSprig will keep the Plant Story, photographs and timeline.`,
      )


    if (
      !confirmed
    ) {
      return
    }


    onUpdatePlant({
      ...plant,

      isArchived:
        true,

      archivedAt:
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          ),

      updatedAt:
        new Date()
          .toISOString(),
    })
  }


  /* =======================================
     RESTORE
  ======================================= */

  function restorePlant() {
    onUpdatePlant({
      ...plant,

      isArchived:
        false,

      archivedAt:
        undefined,

      updatedAt:
        new Date()
          .toISOString(),
    })
  }


  /* =======================================
     COMPLETE STORY
  ======================================= */

  function completeStory() {
    const confirmed =
      window.confirm(
        `Complete "${plant.displayName}"?\n\nThis keeps the entire Plant Story and marks its growing chapter as finished.`,
      )


    if (
      !confirmed
    ) {
      return
    }


    onUpdatePlant({
      ...plant,

      status:
        'finished',

      completedAt:
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          ),

      updatedAt:
        new Date()
          .toISOString(),
    })
  }


  /* =======================================
     REOPEN STORY
  ======================================= */

  function reopenStory() {
    onUpdatePlant({
      ...plant,

      status:
        'growing',

      completedAt:
        undefined,

      updatedAt:
        new Date()
          .toISOString(),
    })
  }


  /* =======================================
     PRINT
  ======================================= */

  function printPlantStory() {
    window.print()
  }


  /* =======================================
     EXPORT
  ======================================= */

  function exportPlantStory() {
    const exportRecord = {
      exportedAt:
        new Date()
          .toISOString(),

      plant,

      growingPlace:
        currentGrowingPlace ??
        null,

      growingRecipe:
        currentGrowingSetup ??
        null,

      events:
        plantEvents,

      harvests:
        plantHarvests,
    }


    const blob =
      new Blob(
        [
          JSON.stringify(
            exportRecord,
            null,
            2,
          ),
        ],
        {
          type:
            'application/json',
        },
      )


    const url =
      URL.createObjectURL(
        blob,
      )


    const link =
      document.createElement(
        'a',
      )


    link.href =
      url


    link.download =
      `${
        createSafeFileName(
          plant.displayName,
        ) ||
        'plant-story'
      }-sprig.json`


    document.body.appendChild(
      link,
    )


    link.click()

    link.remove()


    URL.revokeObjectURL(
      url,
    )
  }


  /* =======================================
     DELETE
  ======================================= */

  function deletePlantStory() {
    const confirmed =
      window.confirm(
        `Permanently delete "${plant.displayName}"?\n\nThis removes the Plant Story and its linked plant-specific Journal entries.\n\nThis cannot be undone.`,
      )


    if (
      confirmed
    ) {
      onDeletePlant(
        plant.id,
      )
    }
  }


  /* =======================================
     PHOTO ADDER
  ======================================= */

  function openPhotoAdder() {
    const existingPhotoUrls =
      [
        ...(
          plant.photoUrls ??
          []
        ),
      ]
  
  
    /*
     * Reload both photographs and their
     * dates every time the Quick Peek opens.
     *
     * This is important because the Plant
     * Story may have changed since this page
     * first rendered, for example after an
     * edit through AddPlantForm.
     */
    setPhotoDraft(
      existingPhotoUrls,
    )
  
  
    setPhotoDateDraft(
      existingPhotoUrls.map(
        (
          _photoUrl,
          index,
        ) =>
          plant.photoDates?.[
            index
          ],
      ),
    )
  
  
    setIsPhotoQuickAddOpen(
      true,
    )
  }

  
/* =======================================
   SAVE PHOTOGRAPHS
======================================= */

function savePhotos() {
  /*
   * Keep the photograph dates aligned
   * with their photographs by index.
   *
   * A blank date is deliberately kept as
   * undefined. Sprig should never invent
   * when a photograph was taken.
   */
  const savedPhotoDates =
    photoDraft.map(
      (
        _photoUrl,
        index,
      ) =>
        photoDateDraft[
          index
        ] ||
        undefined,
    )


  onUpdatePlant({
    ...plant,

    photoUrls:
      photoDraft,

    photoDates:
      savedPhotoDates,

    updatedAt:
      new Date()
        .toISOString(),
  })


  setIsPhotoQuickAddOpen(
    false,
  )
}


/* =======================================
   PLANT PHOTOGRAPH CONTEXT
======================================= */

const plantPhotoContexts =
  (
    plant.photoUrls ??
    []
  ).map(
    (
      _photoUrl,
      index,
    ) => {
      const photoDate =
        plant.photoDates?.[
          index
        ]


      /*
       * Older photographs may not have
       * dates recorded.
       *
       * Leave those honestly without
       * historical context rather than
       * inventing a date for them.
       */
      if (
        !photoDate
      ) {
        return undefined
      }


      return {
        heading:
          'Along the way',

        detail:
          `${formatDate(
            photoDate,
          )} · ${getPhotoGrowingAge(
            photoDate,
            plant.plantedDate,
          )}`,
      }
    },
  )


   /* =======================================
     NAVIGATION
  ======================================= */

  const hasJourneyBack =
    Boolean(
      journeyBackLabel,
    )


  const journeyAlreadyReturnsToPlants =
    journeyBackLabel ===
    'Plants'


  return (
    <>
      <GardenLayout
        activePage="plants"
        onNavigate={
          onNavigate
        }
      >
        <div className="plant-story-page">

          {/* =======================================
              HEADER
          ======================================= */}

          <header className="plant-story-header">
            <p className="section-label">
              {plant.plantName} story
            </p>


            <h1>
              {plant.displayName}
            </h1>


            {plant.variety ? (
              <p className="story-personality">
                {plant.plantName}
                {' · '}
                {plant.variety}
              </p>
            ) : (
              <p className="story-personality">
                {plant.personality ??
                  'A story still unfolding'}
              </p>
            )}


            <div className="story-status-row">
              <span className="status-pill">
                {formatLabel(
                  plant.status,
                )}
              </span>


              <span>
                {daysGrowing} days since this story began
              </span>
            </div>


            {plant.isFavourite && (
              <p className="section-label">
                ★ Garden Favourite
              </p>
            )}


            {plant.isArchived && (
              <p className="section-label">
                📦 Resting in Sprig&apos;s archive
              </p>
            )}
          </header>


          {/* =======================================
              RECORD + PLANT ACTIONS
          ======================================= */}

          <section
            className="plant-record-actions"
            aria-label="Plant Story actions"
          >
            {hasJourneyBack && (
          <button
            type="button"
            className="secondary-button"
            onClick={
              onBack
            }
          >
            ← Back to{' '}
            {
              journeyBackLabel
            }
          </button>
        )}


        {!journeyAlreadyReturnsToPlants && (
          <button
            type="button"
            className="secondary-button"
            onClick={
              onOpenPlants
            }
          >
            ← Plants
          </button>
        )}


            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setIsEditOpen(
                  true,
                )
              }
            >
              ✏ Edit
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setIsVariationOpen(
                  true,
                )
              }
            >
              🌱 Create a variation
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={
                toggleFavourite
              }
            >
              {plant.isFavourite
                ? '★ Favourite'
                : '☆ Favourite'}
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={
                openPhotoAdder
              }
            >
              📸 Add photographs
            </button>


            {plant.isArchived ? (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  restorePlant
                }
              >
                🌱 Restore
              </button>
            ) : (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  archivePlant
                }
              >
                📦 Archive
              </button>
            )}


            <button
              type="button"
              className="secondary-button"
              onClick={
                printPlantStory
              }
            >
              🖨 Print
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={
                exportPlantStory
              }
            >
              📤 Export
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={
                deletePlantStory
              }
            >
              🗑 Delete
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                onAddHarvest(
                  [
                    plant.id,
                  ],
                )
              }
            >
              🧺 Add a harvest
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={
                onAddEvent
              }
            >
              📖 Add a moment
            </button>


            {plant.status ===
            'finished' ? (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  reopenStory
                }
              >
                🌱 Reopen this story
              </button>
            ) : (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  completeStory
                }
              >
                🍂 Complete story
              </button>
            )}
          </section>


          {/* =======================================
              HOW THIS STORY BEGAN
          ======================================= */}

          <section className="story-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  The beginning
                </p>

                <h2>
                  How this story began
                </h2>
              </div>
            </div>


            <section className="story-information-grid">

              <article className="story-info-card">
                <p className="section-label">
                  Story began
                </p>

                <h2>
                  {formatDate(
                    plant.plantedDate,
                  )}
                </h2>

                <p>
                  Started as{' '}
                  {getStartMethodLabel(
                    plant,
                  )}
                </p>
              </article>


              <article className="story-info-card">
                <p className="section-label">
                  Started with
                </p>

                <h2>
                  {plant.quantity ??
                    1}
                </h2>

                <p>
                  {plant.quantity ===
                  1
                    ? 'One plant or starting piece'
                    : 'Plants or starting pieces growing as one story'}
                </p>
              </article>


              <article className="story-info-card">
                <p className="section-label">
                  Where it came from
                </p>

                <h2>
                  {plant.originType ===
                    'other' &&
                  plant.customOriginLabel
                    ? plant.customOriginLabel
                    : getPlantOriginLabel(
                        plant.originType,
                      )}
                </h2>

                <p>
                  {plant.source
                    ? plant.source
                    : 'No source or place recorded.'}
                </p>
              </article>

            </section>
          </section>


          {/* =======================================
              EARLY JOURNEY
          ======================================= */}

          {(plant.sownDate ||
            plant.plantedOutDate) && (
            <section className="story-section">
              <div className="section-heading">
                <div>
                  <p className="section-label">
                    Early journey
                  </p>

                  <h2>
                    From beginning to garden
                  </h2>
                </div>
              </div>


              <section className="story-information-grid">

                {plant.sownDate && (
                  <article className="story-info-card">
                    <p className="section-label">
                      Sown
                    </p>

                    <h2>
                      {formatDate(
                        plant.sownDate,
                      )}
                    </h2>

                    <p>
                      The first recorded step
                      in this seed-grown story.
                    </p>
                  </article>
                )}


                {plant.plantedOutDate && (
                  <article className="story-info-card">
                    <p className="section-label">
                      Planted out
                    </p>

                    <h2>
                      {formatDate(
                        plant.plantedOutDate,
                      )}
                    </h2>

                    <p>
                      Moved into its planted-out
                      growing stage.
                    </p>
                  </article>
                )}

              </section>
            </section>
          )}


          {/* =======================================
              WHERE IT IS GROWING
          ======================================= */}

          <section className="story-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  Growing now
                </p>

                <h2>
                  Where this story is unfolding
                </h2>
              </div>
            </div>


            <section className="story-information-grid">

              {currentGrowingPlace ? (
                <button
                  type="button"
                  className="story-info-card"
                  onClick={() =>
                    onOpenGrowingPlace(
                      currentGrowingPlace.id,
                    )
                  }
                  aria-label={`Open ${currentGrowingPlace.name}`}
                  style={{
                    textAlign:
                      'left',

                    cursor:
                      'pointer',

                    font:
                      'inherit',
                  }}
                >
                  <p className="section-label">
                    Growing Place
                  </p>

                  <h2>
                    {currentGrowingPlace.name}
                  </h2>

                  <p>
                    {currentGrowingPlace.kind ===
                      'other' &&
                    currentGrowingPlace.customKindLabel
                      ? currentGrowingPlace.customKindLabel
                      : formatLabel(
                          currentGrowingPlace.kind,
                        )}
                  </p>

                  <p className="form-whisper">
                    Open this Growing Place →
                  </p>
                </button>
              ) : (
                <article className="story-info-card">
                  <p className="section-label">
                    Growing Place
                  </p>

                  <h2>
                    Place not recorded
                  </h2>

                  <p>
                    This can be added later.
                  </p>
                </article>
              )}


              {currentGrowingSetup ? (
                <button
                  type="button"
                  className="story-info-card"
                  onClick={() =>
                    setIsRecipeQuickPeekOpen(
                      true,
                    )
                  }
                  aria-label={`Quick peek at ${currentGrowingSetup.name}`}
                  style={{
                    textAlign:
                      'left',

                    cursor:
                      'pointer',

                    font:
                      'inherit',
                  }}
                >
                  <p className="section-label">
                    Growing Recipe
                  </p>

                  <h2>
                    {currentGrowingSetup.name}
                  </h2>

                  <p>
                    {getGrowingSetupCategoryLabel(
                      currentGrowingSetup,
                    )}
                  </p>

                  <p className="form-whisper">
                    Tap for a quick peek
                  </p>
                </button>
              ) : (
                <article className="story-info-card">
                  <p className="section-label">
                    Growing Recipe
                  </p>

                  <h2>
                    Recipe not recorded
                  </h2>

                  <p>
                    This can be added later.
                  </p>
                </article>
              )}

            </section>
          </section>

        {/* =======================================
            GROWING JOURNEY
        ======================================= */}

{growingJourney.length > 0 && (
          <section className="story-section">
            <p className="section-label">
              Growing journey
            </p>

            <h2>
              Where this story has put down roots
            </h2>

            <p className="journal-intro">
              A little history of where this
              plant has grown and what it was
              growing in along the way.
            </p>

            <div className="timeline">
              {growingJourney.map(
                (
                  historyEntry,
                ) => (
                  <article
                    key={
                      historyEntry.id
                    }
                    className="timeline-entry"
                  >
                    <div className="timeline-marker">
                      🌱
                    </div>

                    <div className="timeline-entry-header">
                      <div>
                        <div className="timeline-entry-meta">
                          <time>
                            {formatDate(
                              historyEntry.startedDate,
                            )}

                            {' → '}

                            {historyEntry.endedDate
                              ? formatDate(
                                  historyEntry.endedDate,
                                )
                              : 'Now'}
                          </time>
                        </div>

                        <h3>
                          {historyEntry.growingPlace
                            ?.name ??
                            historyEntry.growingSetup
                              ?.name ??
                            'Growing arrangement'}
                        </h3>
                      </div>
                    </div>


                    {historyEntry.growingPlace && (
                      <p>
                        <strong>
                          Growing Place:
                        </strong>{' '}

                        {onOpenGrowingPlace ? (
                          <button
                            type="button"
                            className="garden-place-link"
                            onClick={() =>
                              onOpenGrowingPlace(
                                historyEntry
                                  .growingPlace!
                                  .id,
                              )
                            }
                          >
                            {
                              historyEntry
                                .growingPlace
                                .name
                            }
                          </button>
                        ) : (
                          historyEntry
                            .growingPlace
                            .name
                        )}
                      </p>
                    )}


                    {historyEntry.growingSetup && (
                      <p>
                        <strong>
                          Growing Recipe:
                        </strong>{' '}

                        {
                          historyEntry
                            .growingSetup
                            .name
                        }
                      </p>
                    )}


                    {historyEntry.notes && (
                      <p>
                        {
                          historyEntry.notes
                        }
                      </p>
                    )}
                  </article>
                ),
              )}
            </div>
          </section>
        )}

        
          {/* =======================================
              HARVEST TIMING
          ======================================= */}

{(plant.expectedHarvestDaysMin ||
            plant.expectedHarvestDaysMax) && (
            <section className="story-section">
              <div className="section-heading">
                <div>
                  <p className="section-label">
                    Harvest timing
                  </p>

                  <h2>
                    When this story may begin giving back
                  </h2>
                </div>
              </div>

              <section className="story-information-grid">
                                <button
                  type="button"
                  className="story-info-card"
                  onClick={() =>
                    setIsHarvestTimingQuickPeekOpen(
                      true,
                    )
                  }
                  style={{
                    textAlign:
                      'left',

                    cursor:
                      'pointer',

                    font:
                      'inherit',
                  }}
                >
                  <p className="section-label">
                    Start counting from
                  </p>

                  <h2>
                    {harvestTimingReferenceLabel}
                  </h2>

                  <p>
                    {new Date(
                      `${harvestTimingReferenceDate}T00:00:00`,
                    ).toLocaleDateString(
                      'en-AU',
                      {
                        day:
                          'numeric',

                        month:
                          'long',

                        year:
                          'numeric',
                      },
                    )}
                  </p>

                  <p className="form-whisper">
                  Choose where Sprig should start counting →
                  </p>
                </button>

                <article className="story-info-card">
                  <p className="section-label">
                    Expected timing
                  </p>

                  <h2>
                    {plant.expectedHarvestDaysMin &&
                    plant.expectedHarvestDaysMax
                      ? `${plant.expectedHarvestDaysMin}–${plant.expectedHarvestDaysMax} days`
                      : plant.expectedHarvestDaysMin
                        ? `From ${plant.expectedHarvestDaysMin} days`
                        : `Around ${plant.expectedHarvestDaysMax} days`}
                  </h2>

                  <p>
                    {plant.expectedHarvestDaysMin &&
                    plant.expectedHarvestDaysMax
                      ? `About ${(
                          plant.expectedHarvestDaysMin /
                          7
                        ).toFixed(
                          1,
                        )}–${(
                          plant.expectedHarvestDaysMax /
                          7
                        ).toFixed(
                          1,
                        )} weeks`
                      : plant.expectedHarvestDaysMin
                        ? `About ${(
                            plant.expectedHarvestDaysMin /
                            7
                          ).toFixed(
                            1,
                          )} weeks`
                        : plant.expectedHarvestDaysMax
                          ? `About ${(
                              plant.expectedHarvestDaysMax /
                              7
                            ).toFixed(
                              1,
                            )} weeks`
                          : ''}
                  </p>
                </article>

                {expectedHarvestStart && (
                  <article className="story-info-card">
                    <p className="section-label">
                      Earliest expected
                    </p>

                    <h2>
                      {expectedHarvestStart.toLocaleDateString(
                        'en-AU',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        },
                      )}
                    </h2>
                  </article>
                )}

                {expectedHarvestEnd && (
                  <article className="story-info-card">
                    <p className="section-label">
                      Later edge
                    </p>

                    <h2>
                      {expectedHarvestEnd.toLocaleDateString(
                        'en-AU',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        },
                      )}
                    </h2>
                  </article>
                )}
              </section>

              {firstPlantHarvest &&
                actualDaysToFirstHarvest !== undefined && (
                  <>
                    <div className="section-heading">
                      <div>
                        <p className="section-label">
                          What actually happened
                        </p>

                        <h2>
                          This plant found its own timing
                        </h2>
                      </div>
                    </div>

                    <section className="story-information-grid">
                      <article className="story-info-card">
                        <p className="section-label">
                          First gathered
                        </p>

                        <h2>
                          {formatDate(
                            firstPlantHarvest.date,
                          )}
                        </h2>
                      </article>

                      <article className="story-info-card">
                        <p className="section-label">
                          Actual timing
                        </p>

                        <h2>
                          {actualDaysToFirstHarvest}{' '}
                          {actualDaysToFirstHarvest === 1
                            ? 'day'
                            : 'days'}
                        </h2>

                        <p>
                          About{' '}
                          {(
                            actualDaysToFirstHarvest /
                            7
                          ).toFixed(
                            1,
                          )}{' '}
                          {actualDaysToFirstHarvest === 7
                            ? 'week'
                            : 'weeks'}
                        </p>
                      </article>

                      {harvestTimingStatus ===
                        'early' &&
                        harvestTimingDifference !==
                          undefined && (
                          <article className="story-info-card">
                            <p className="section-label">
                              Earlier than expected
                            </p>

                            <h2>
                              {harvestTimingDifference}{' '}
                              {harvestTimingDifference === 1
                                ? 'day'
                                : 'days'}{' '}
                              early
                            </h2>

                            <p>
                              About{' '}
                              {(
                                harvestTimingDifference /
                                7
                              ).toFixed(
                                1,
                              )}{' '}
                              weeks early
                            </p>
                          </article>
                        )}

                      {harvestTimingStatus ===
                        'expected' && (
                        <article className="story-info-card">
                          <p className="section-label">
                            Compared with expected
                          </p>

                          <h2>
                            Within the expected window
                          </h2>
                        </article>
                      )}

                      {harvestTimingStatus ===
                        'late' &&
                        harvestTimingDifference !==
                          undefined && (
                          <article className="story-info-card">
                            <p className="section-label">
                              Later than expected
                            </p>

                            <h2>
                              {harvestTimingDifference}{' '}
                              {harvestTimingDifference === 1
                                ? 'day'
                                : 'days'}{' '}
                              later
                            </h2>

                            <p>
                              About{' '}
                              {(
                                harvestTimingDifference /
                                7
                              ).toFixed(
                                1,
                              )}{' '}
                              weeks later
                            </p>
                          </article>
                        )}
                    </section>
                  </>
                )}
            </section>
          )}
          {/* =======================================
              FIRST HARVEST
          ======================================= */}

{plantHarvests.length ===
            0 && (
            <section className="story-section">
              <div className="section-heading">
                <div>
                  <p className="section-label">
                    Harvest
                  </p>

                  <h2>
                    Ready to gather from this story?
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  onAddHarvest(
                    [
                      plant.id,
                    ],
                  )
                }
              >
                🧺 Harvest this plant
              </button>
            </section>
          )}


          {/* =======================================
              HARVEST STORY
          ======================================= */}

          {plantHarvests.length >
            0 &&
            latestPlantHarvest && (
            <section className="story-section">
              <div className="section-heading">
                <div>
                  <p className="section-label">
                    Harvest Story
                  </p>

                  <h2>
                    What this story has given back
                  </h2>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    onAddHarvest(
                      [
                        plant.id,
                      ],
                    )
                  }
                >
                  + Gather another harvest
                </button>
              </div>

              <button
                type="button"
                className="story-info-card"
                onClick={() =>
                  onOpenHarvest(
                    latestPlantHarvest.id,
                  )
                }
                aria-label={`Open ${plant.displayName} Harvest Story`}
                style={{
                  width:
                    '100%',
                  textAlign:
                    'left',
                  cursor:
                    'pointer',
                  font:
                    'inherit',
                }}
              >
                <p className="section-label">
                  🧺 Harvested from this story
                </p>

                <h2>
                  {plantHarvests.length}{' '}
                  {plantHarvests.length ===
                  1
                    ? 'harvest'
                    : 'harvests'}
                </h2>

                {totalHarvestCount >
                  0 && (
                  <p>
                    <strong>
                      Total count:
                    </strong>{' '}
                    {
                      totalHarvestCount
                    }
                  </p>
                )}

{totalHarvestAmount !==
  undefined &&
  totalHarvestUnit && (
  <p>
    <strong>
      Total gathered:
    </strong>{' '}
    {
      totalHarvestAmount
    }{' '}
    {
      totalHarvestUnit === 'gram'
        ? 'g'
        : totalHarvestUnit === 'kilogram'
          ? 'kg'
          : totalHarvestUnit === 'millilitre'
            ? 'mL'
            : totalHarvestUnit === 'litre'
              ? 'L'
              : totalHarvestUnit
    }
  </p>
)}

                {firstPlantHarvest && (
                  <p>
                    <strong>
                      First harvest:
                    </strong>{' '}
                    {formatDate(
                      firstPlantHarvest.date,
                    )}
                  </p>
                )}

                {plantHarvests.length >
                  1 && (
                  <p>
                    <strong>
                      Latest harvest:
                    </strong>{' '}
                    {formatDate(
                      latestPlantHarvest.date,
                    )}
                  </p>
                )}

                <p className="form-whisper">
                  Open Harvest Story →
                </p>
              </button>
            </section>
          )}

          {/* =======================================
              NOTES
          ======================================= */}

          <section className="story-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  Garden notes
                </p>

                <h2>
                  What you wanted to remember
                </h2>
              </div>
            </div>


            <div className="story-note-card">
              <p>
                {plant.notes ??
                  'No notes yet. This story is waiting for its first observation.'}
              </p>
            </div>
          </section>


                    {/* =======================================
              PHOTOGRAPHS
          ======================================= */}

<section className="story-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  Photographs
                </p>

                <h2>
                  This plant through the seasons
                </h2>
              </div>
            </div>


            <SprigPhotoGallery
              photoUrls={
                plant.photoUrls ??
                []
              }

              photoContexts={
                plantPhotoContexts
              }

              title="Plant photographs"

              emptyMessage="No photographs have been tucked into this Plant Story yet."

              photoAltPrefix={`${plant.displayName} photograph`}
            />
          </section>


          {/* =======================================
              TIMELINE
          ======================================= */}

          <section className="story-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  Timeline
                </p>

                <h2>
                  The story so far
                </h2>
              </div>


              <button
                type="button"
                className="text-button"
                onClick={
                  onAddEvent
                }
              >
                + Add a moment
              </button>
            </div>


            <div className="timeline">
              {storyTimeline.length >
              0 ? (
                storyTimeline.map(
                  (
                    timelineItem,
                  ) => {
                    if (
                      timelineItem.kind ===
                      'harvest'
                    ) {
                      const timelineHarvest =
                        timelineItem.harvest


                      const harvestAmount =
                        getHarvestTimelineAmount(
                          timelineHarvest,
                        )


                      return (
                        <article
                          className="timeline-entry"
                          key={`harvest-${timelineHarvest.id}`}
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            onOpenHarvest(
                              timelineHarvest.id,
                            )
                          }
                          onKeyDown={(
                            keyboardEvent,
                          ) => {
                            if (
                              keyboardEvent.key ===
                                'Enter' ||
                              keyboardEvent.key ===
                                ' '
                            ) {
                              keyboardEvent.preventDefault()


                              onOpenHarvest(
                                timelineHarvest.id,
                              )
                            }
                          }}
                        >
                          <div className="timeline-marker">
                            🧺
                          </div>


                          <div className="timeline-entry-header">
                            <div className="timeline-entry-meta">
                              <time>
                                {formatDate(
                                  timelineHarvest.date,
                                )}
                              </time>


                              <span className="entry-scope-label plant-entry-label">
                                🧺 Harvest
                              </span>
                            </div>
                          </div>


                          <h3>
                            {getHarvestTimelineTitle(
                              timelineHarvest,
                            )}
                          </h3>


                          {harvestAmount && (
                            <p className="event-product">
                              Gathered:{' '}
                              {
                                harvestAmount
                              }
                            </p>
                          )}


                          {timelineHarvest.quality && (
                            <p>
                              How it was:{' '}
                              {formatLabel(
                                timelineHarvest.quality,
                              )}
                            </p>
                          )}


                          {timelineHarvest.notes && (
                            <p>
                              {
                                timelineHarvest.notes
                              }
                            </p>
                          )}


                          {timelineHarvest.photoUrls &&
                            timelineHarvest.photoUrls.length >
                              0 && (
                            <div
                              onClick={(
                                clickEvent,
                              ) =>
                                clickEvent.stopPropagation()
                              }
                              onKeyDown={(
                                keyboardEvent,
                              ) =>
                                keyboardEvent.stopPropagation()
                              }
                            >
                              <SprigPhotoGallery
                                photoUrls={
                                  timelineHarvest.photoUrls
                                }

                                title="Photographs from this harvest"

                                emptyMessage=""

                                photoAltPrefix={`${getHarvestTimelineTitle(
                                  timelineHarvest,
                                )} photograph`}
                              />
                            </div>
                          )}


                          <p className="form-whisper">
                            Open Harvest Story →
                          </p>
                        </article>
                      )
                    }


                    const event =
                      timelineItem.event


                    return (
                      <article
                        className="timeline-entry"
                        key={`event-${event.id}`}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          onOpenJournalEntry(
                            event.id,
                          )
                        }
                        onKeyDown={(
                          keyboardEvent,
                        ) => {
                          if (
                            keyboardEvent.key ===
                              'Enter' ||
                            keyboardEvent.key ===
                              ' '
                          ) {
                            keyboardEvent.preventDefault()


                            onOpenJournalEntry(
                              event.id,
                            )
                          }
                        }}
                      >
                        <div className="timeline-marker">
                          {getEventEmoji(
                            event.type,
                          )}
                        </div>


                        <div className="timeline-entry-header">
                          <div className="timeline-entry-meta">
                            <time>
                              {formatDate(
                                event.date,
                              )}
                            </time>


                            <span
                              className={
                                event.plantStoryIds.length ===
                                0
                                  ? 'entry-scope-label garden-entry-label'
                                  : 'entry-scope-label plant-entry-label'
                              }
                            >
                              {event.plantStoryIds.length ===
                              0
                                ? '🌍 Garden entry'
                                : '🌱 Plant entry'}
                            </span>
                          </div>


                          <button
                            type="button"
                            className="timeline-delete-button"
                            aria-label={`Remove ${event.title} from the garden journal`}
                            onClick={(
                              clickEvent,
                            ) => {
                              clickEvent.stopPropagation()


                              const confirmed =
                                window.confirm(
                                  'Remove this entry from the garden journal?',
                                )


                              if (
                                confirmed
                              ) {
                                onDeleteEvent(
                                  event.id,
                                )
                              }
                            }}
                          >
                            🗑️
                          </button>
                        </div>


                        <h3>
                          {
                            event.title
                          }
                        </h3>


                        {event.productUsed && (
                          <p className="event-product">
                            Used:{' '}
                            {
                              event.productUsed
                            }
                          </p>
                        )}


                        {event.notes && (
                          <p>
                            {
                              event.notes
                            }
                          </p>
                        )}


                        {event.photoUrls &&
                          event.photoUrls.length >
                            0 && (
                          <div
                            onClick={(
                              clickEvent,
                            ) =>
                              clickEvent.stopPropagation()
                            }
                            onKeyDown={(
                              keyboardEvent,
                            ) =>
                              keyboardEvent.stopPropagation()
                            }
                          >
                            <SprigPhotoGallery
                              photoUrls={
                                event.photoUrls
                              }

                              title="Photographs from this moment"

                              emptyMessage=""

                              photoAltPrefix={`${event.title} photograph`}
                            />
                          </div>
                        )}
                      </article>
                    )
                  },
                )
              ) : (
                <div className="empty-story">
                  <span>
                    🌿
                  </span>


                  <p>
                    This story has only just opened its notebook.
                  </p>


                  <button
                    type="button"
                    className="text-button"
                    onClick={
                      onAddEvent
                    }
                  >
                    Add its first moment
                  </button>
                </div>
              )}
            </div>
          </section>

        </div>
      </GardenLayout>


     {/* =======================================
          EDIT PLANT STORY
      ======================================= */}

      {isEditOpen && (
        <AddPlantForm
          GrowingPlaces={
            growingPlaces
          }

          GrowingSetups={
            growingSetups
          }

          Ingredients={
            ingredients
          }

          Products={
            products
          }

          plantToEdit={
            plant
          }

          onAddPlant={
            onAddPlant
          }

          onUpdatePlant={
            onUpdatePlant
          }

          onAddGrowingPlace={
            onAddGrowingPlace
          }

          onAddRecipe={
            onAddRecipe
          }

          onAddIngredient={
            onAddIngredient
          }

          onAddProduct={
            onAddProduct
          }

          onClose={() =>
            setIsEditOpen(
              false,
            )
          }
        />
      )}


                {/* =======================================
          CREATE VARIATION
      ======================================= */}
      {isVariationOpen && (
        <AddPlantForm
          GrowingPlaces={
            growingPlaces
          }
          GrowingSetups={
            growingSetups
          }
          Ingredients={
            ingredients
          }
          Products={
            products
          }
          variationFrom={
            plant
          }
          onAddPlant={
            onAddPlant
          }
          onUpdatePlant={
            onUpdatePlant
          }
          onAddGrowingPlace={
            onAddGrowingPlace
          }
          onAddRecipe={
            onAddRecipe
          }
          onAddIngredient={
            onAddIngredient
          }
          onAddProduct={
            onAddProduct
          }
          onClose={() =>
            setIsVariationOpen(
              false,
            )
          }
        />
      )}


      {/* =======================================
          PHOTO QUICK ADD
      ======================================= */}

      <SprigQuickPeek
        isOpen={
          isPhotoQuickAddOpen
        }

        onClose={() =>
          setIsPhotoQuickAddOpen(
            false,
          )
        }

        eyebrow="Plant Story"

        title="Photographs"

        subtitle={
          plant.displayName
        }
      >
        <SprigPhotoPicker
  photoUrls={
    photoDraft
  }

  onChange={
    setPhotoDraft
  }

  photoDates={
    photoDateDraft
  }

  onPhotoDatesChange={
    setPhotoDateDraft
  }

  title="Plant photographs"

  helperText="Add photographs without leaving this Plant Story."

  addButtonText="Add photographs"

  photoAltPrefix={`${plant.displayName} photograph`}

  photoDateLabel="When was this photograph taken?"

  photoDateHelperText="Sprig uses this date to place the photograph at the right growing age and find useful side-by-side comparisons."

  defaultNewPhotosToToday={
    true
  }

  maxPhotos={
    12
  }
/>


        <button
          type="button"
          className="enter-button"
          onClick={
            savePhotos
          }
        >
          Save photographs
        </button>
      </SprigQuickPeek>


     {/* =======================================
          HARVEST TIMING QUICK PEEK
      ======================================= */}

<SprigQuickPeek
  isOpen={
    isHarvestTimingQuickPeekOpen
  }
  onClose={() =>
    setIsHarvestTimingQuickPeekOpen(
      false,
    )
  }
  eyebrow="Harvest timing"
  title="When should Sprig start counting?"
  subtitle="Tap a recorded date below to use it straight away, or enter another date of your own."
>
  <div className="quick-peek-actions">
    {plant.sownDate && (
      <button
        type="button"
        className="secondary-button"
        onClick={() =>
          saveHarvestTimingReference(
            'sown',
          )
        }
      >
        {harvestTimingReference?.sourceType ===
        'sown'
          ? '✓ '
          : '🌱 '}
        Sown ·{' '}
        {formatDate(
          plant.sownDate,
        )}
        {harvestTimingReference?.sourceType ===
          'sown' && ' · Current'}
      </button>
    )}

    <button
      type="button"
      className="secondary-button"
      onClick={() =>
        saveHarvestTimingReference(
          'planted',
        )
      }
    >
      {(!harvestTimingReference ||
        harvestTimingReference.sourceType ===
          'planted')
        ? '✓ '
        : '🪴 '}
      Planted ·{' '}
      {formatDate(
        plant.plantedDate,
      )}
      {(!harvestTimingReference ||
        harvestTimingReference.sourceType ===
          'planted') &&
        ' · Current'}
    </button>

    {plant.plantedOutDate && (
      <button
        type="button"
        className="secondary-button"
        onClick={() =>
          saveHarvestTimingReference(
            'planted-out',
          )
        }
      >
        {harvestTimingReference?.sourceType ===
        'planted-out'
          ? '✓ '
          : '🌿 '}
        Planted out ·{' '}
        {formatDate(
          plant.plantedOutDate,
        )}
        {harvestTimingReference?.sourceType ===
          'planted-out' &&
          ' · Current'}
      </button>
    )}

    {harvestTimingMilestoneEvents.map(
      (
        event,
      ) => (
        <button
          type="button"
          className="secondary-button"
          key={
            event.id
          }
          onClick={() =>
            saveHarvestTimingReference(
              'garden-event',
              event.id,
            )
          }
        >
          {harvestTimingReference?.sourceType ===
            'garden-event' &&
          harvestTimingReference.eventId ===
            event.id
            ? '✓ '
            : '📖 '}
          {event.title} ·{' '}
          {formatDate(
            event.date,
          )}
          {harvestTimingReference?.sourceType ===
            'garden-event' &&
            harvestTimingReference.eventId ===
              event.id &&
            ' · Current'}
        </button>
      ),
    )}
  </div>

  <div className="form-section">
  <p className="section-label">
  Or use another date
</p>

<p className="form-whisper">
  If the right moment isn't recorded above, enter
  another date for Sprig to count from.
</p>

    <label>
      Date
      <input
        type="date"
        value={
          customHarvestTimingDate
        }
        onChange={(
          event,
        ) =>
          setCustomHarvestTimingDate(
            event.target.value,
          )
        }
      />
    </label>

    <label>
      What happened? Optional
      <input
        type="text"
        value={
          customHarvestTimingLabel
        }
        placeholder="Approximate transplant date"
        onChange={(
          event,
        ) =>
          setCustomHarvestTimingLabel(
            event.target.value,
          )
        }
      />
    </label>

    <button
      type="button"
      className="enter-button"
      disabled={
        !customHarvestTimingDate
      }
      onClick={() =>
        saveHarvestTimingReference(
          'custom-date',
        )
      }
    >
      Use this custom date
    </button>
  </div>
</SprigQuickPeek>


      {/* =======================================
          GROWING RECIPE QUICK PEEK
      ======================================= */}

      {currentGrowingSetup && (
        <SprigQuickPeek
          isOpen={
            isRecipeQuickPeekOpen
          }

          onClose={() =>
            setIsRecipeQuickPeekOpen(
              false,
            )
          }

          eyebrow="Growing Recipe"

          title={
            currentGrowingSetup.name
          }

          subtitle={
            getGrowingSetupCategoryLabel(
              currentGrowingSetup,
            )
          }
        >
          {currentGrowingSetup.category ===
            'own-mix' && (
            <>
              <h3>
                What&apos;s in this mix
              </h3>


              {currentRecipeIngredients.length >
              0 ? (
                <ul>
                  {currentRecipeIngredients.map(
                    (
                      ingredient,
                    ) => (
                      <li
                        key={
                          ingredient.id
                        }
                      >
                        {
                          ingredient.name
                        }
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p>
                  No ingredients have been recorded for this recipe yet.
                </p>
              )}
            </>
          )}


          {currentGrowingSetup.notes && (
            <>
              <h3>
                Notes
              </h3>

              <p>
                {
                  currentGrowingSetup.notes
                }
              </p>
            </>
          )}
        </SprigQuickPeek>
      )}

    </>
  )
}