import {
    useLayoutEffect,
    useState,
  } from 'react'
  
  import ExcelJS from 'exceljs'
  
  import GardenLayout from '../components/layout/GardenLayout'
  import SprigPhotoGallery from '../components/photos/SprigPhotoGallery'
  
  import {
    buildPlantComparisonAgeCheckpoints,
    buildPlantComparisonPhotoEvidence,
    findClosestPhotoEvidence,
  } from '../utils/plantComparisonUtils'
  
  import type {
    GardenEvent,
    GardenProduct,
    GrowingPlace,
    GrowingSetup,
    Ingredient,
    HarvestMeasurementUnit,
    HarvestPlantOutcome,
    HarvestQuality,
    HarvestRecord,
    HarvestType,
    PlantStory,
  } from '../types'
  
  import type {
    AppPage,
  } from '../types/navigation'
  
  
  /* =======================================
     COMPARISON LENSES
  ======================================= */
  
  type ComparisonSectionId =
    | 'overview'
    | 'growing-place'
    | 'growing-recipe'
    | 'harvest'
    | 'growing-age-photos'
    | 'all-photos'
  
  
  interface ComparisonSectionOption {
    id: ComparisonSectionId
  
    label: string
  
    helperText: string
  }
  
  
  const COMPARISON_SECTION_OPTIONS:
    ComparisonSectionOption[] = [
      {
        id: 'overview',
  
        label:
          'Overview',
  
        helperText:
          'The growing story summary and how each story began.',
      },
  
      {
        id:
          'growing-place',
  
        label:
          'Growing Places',
  
        helperText:
          'Where each story grew and how its place changed over time.',
      },
  
      {
        id:
          'growing-recipe',
  
        label:
          'Growing Recipes',
  
        helperText:
          'What each story grew in, including recipe journeys and components.',
      },
  
      {
        id:
          'harvest',
  
        label:
          'Harvests',
  
        helperText:
          'Timing, quantities, quality and how each harvest story unfolded.',
      },
  
      {
        id:
          'growing-age-photos',
  
        label:
          'Growing-age photographs',
  
        helperText:
          'Dated photographs matched at similar growing ages.',
      },
  
      {
        id:
          'all-photos',
  
        label:
          'All photographs',
  
        helperText:
          'Plant Story, Journal and Harvest photographs together.',
      },
    ]
  
  
  const ALL_COMPARISON_SECTION_IDS =
    COMPARISON_SECTION_OPTIONS.map(
      (
        option,
      ) =>
        option.id,
    )


interface PlantComparisonProps {
  plantIds: string[]

  activeSavedComparisonId:
    string | null

  plants: PlantStory[]

  growingPlaces: GrowingPlace[]

  growingSetups: GrowingSetup[]

  ingredients: Ingredient[]

  products: GardenProduct[]

  events: GardenEvent[]

  harvests: HarvestRecord[]

  onBack: () => void

  onEditComparison: (
    plantStoryIds: string[],
  ) => void

  onSaveComparison: (
    name: string,
    plantStoryIds: string[],
  ) => void

  onNavigate: (
    page: AppPage,
  ) => void
}


interface ComparisonColumn {
  plant: PlantStory

  growingPlaceName: string

  growingSetupName: string

  harvestCount: number

  journalCount: number

  firstHarvestDate?: string

  daysToFirstHarvest?: number
}


interface BeginningComparisonColumn {
  plant: PlantStory

  startMethodLabel: string

  quantityLabel: string

  originLabel: string

  sourceLabel: string

  sownDate: string

  plantedDate: string

  plantedOutDate: string
}


interface GrowingPlaceComparisonColumn {
    plant: PlantStory
  
    placeName: string
  
    journey: string
  
    placeKind: string
  
    aspect: string
  
    sunlight: string
  
    shelter: string
  }


type RecipeComponent =
  NonNullable<
    GrowingSetup['recipeComponents']
  >[number]


  interface GrowingSetupComparisonColumn {
    plant: PlantStory
  
    setupName: string
  
    journey: string
  
    category: string
  
    brand: string
  
    productName: string
  
    groundType: string
  
    growingMethod: string
  
    ingredients: string
  
    products: string
  
    linkedRecipes: string
  
    components: string
  }


interface HarvestComparisonColumn {
  plant: PlantStory

  harvests: HarvestRecord[]

  firstHarvest?: HarvestRecord

  lastHarvest?: HarvestRecord

  daysToFirstHarvest?: number

  harvestSpanDays?: number

  totalCount?: number

  measurementSummary: string

  harvestTypeSummary: string

  qualitySummary: string

  latestOutcome?: string
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


  const safeDate =
    date.slice(
      0,
      10,
    )


  const parsed =
    new Date(
      `${safeDate}T00:00:00`,
    )


  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return date
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


/* =======================================
   DAYS BETWEEN
======================================= */

function getDaysBetween(
  startDate?: string,
  endDate?: string,
): number | undefined {
  if (
    !startDate ||
    !endDate
  ) {
    return undefined
  }


  const start =
    new Date(
      `${startDate.slice(
        0,
        10,
      )}T00:00:00`,
    )


  const end =
    new Date(
      `${endDate.slice(
        0,
        10,
      )}T00:00:00`,
    )


  if (
    Number.isNaN(
      start.getTime(),
    ) ||
    Number.isNaN(
      end.getTime(),
    )
  ) {
    return undefined
  }


  return Math.max(
    0,
    Math.round(
      (
        end.getTime() -
        start.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        ),
    ),
  )
}


/* =======================================
   DAYS WORDING
======================================= */

function formatDays(
  days?: number,
): string {
  if (
    days ===
    undefined
  ) {
    return 'Not recorded'
  }


  return `${days} ${
    days === 1
      ? 'day'
      : 'days'
  }`
}


/* =======================================
   PHOTO DATE CONTEXT
======================================= */

function getPhotoDateContext(
  plant: PlantStory,
  date: string,
): string {

  const daysGrowing =
    getDaysBetween(
      plant.plantedDate,
      date,
    )


  if (
    daysGrowing ===
    undefined
  ) {
    return formatDate(
      date,
    )
  }


  return `${formatDate(
    date,
  )} · ${formatDays(
    daysGrowing,
  )} after planting`
}


/* =======================================
   HARVEST TYPE LABEL
======================================= */

function getHarvestTypeLabel(
  harvest: HarvestRecord,
): string {
  if (
    harvest.harvestType ===
      'other' &&
    harvest.customHarvestTypeLabel
  ) {
    return harvest.customHarvestTypeLabel
  }


  const type:
    HarvestType | undefined =
    harvest.harvestType


  switch (type) {
    case 'first':
      return 'First'

    case 'regular':
      return 'Regular'

    case 'main':
      return 'Main'

    case 'secondary':
      return 'Secondary'

    case 'final':
      return 'Final'

    case 'other':
      return 'Other'

    default:
      return 'Not recorded'
  }
}


/* =======================================
   QUALITY LABEL
======================================= */

function getQualityLabel(
  quality?: HarvestQuality,
): string {
  switch (quality) {
    case 'poor':
      return 'Poor'

    case 'fair':
      return 'Fair'

    case 'good':
      return 'Good'

    case 'excellent':
      return 'Excellent'

    default:
      return 'Not recorded'
  }
}


/* =======================================
   PLANT OUTCOME LABEL
======================================= */

function getPlantOutcomeLabel(
  harvest?: HarvestRecord,
): string | undefined {
  if (!harvest) {
    return undefined
  }


  if (
    harvest.plantOutcome ===
      'other' &&
    harvest.customPlantOutcomeLabel
  ) {
    return harvest.customPlantOutcomeLabel
  }


  const outcome:
    HarvestPlantOutcome | undefined =
    harvest.plantOutcome


  switch (outcome) {
    case 'still-producing':
      return 'Still producing'

    case 'more-expected':
      return 'More expected'

    case 'main-harvest-complete':
      return 'Main harvest complete'

    case 'finished':
      return 'Finished'

    case 'no-change':
      return 'No change'

    case 'not-sure':
      return 'Not sure'

    case 'other':
      return 'Other'

    default:
      return undefined
  }
}


/* =======================================
   MEASUREMENT UNIT LABEL
======================================= */

function getMeasurementUnitLabel(
  unit:
    HarvestMeasurementUnit,
  amount: number,
  customLabel?: string,
): string {
  if (
    unit === 'other' &&
    customLabel
  ) {
    return customLabel
  }


  switch (unit) {
    case 'gram':
      return amount === 1
        ? 'gram'
        : 'grams'

    case 'kilogram':
      return amount === 1
        ? 'kilogram'
        : 'kilograms'

    case 'millilitre':
      return amount === 1
        ? 'millilitre'
        : 'millilitres'

    case 'litre':
      return amount === 1
        ? 'litre'
        : 'litres'

    case 'bunch':
      return amount === 1
        ? 'bunch'
        : 'bunches'

    case 'handful':
      return amount === 1
        ? 'handful'
        : 'handfuls'

    case 'basket':
      return amount === 1
        ? 'basket'
        : 'baskets'

    case 'container':
      return amount === 1
        ? 'container'
        : 'containers'

    case 'other':
      return 'other'

    default:
      return unit
  }
}


/* =======================================
   MEASUREMENT SUMMARY
======================================= */

function buildMeasurementSummary(
  harvests: HarvestRecord[],
): string {

  const groupedMeasurements =
    new Map<
      string,
      {
        amount: number
        unit:
          HarvestMeasurementUnit
        customLabel?: string
      }
    >()


  harvests.forEach(
    (
      harvest,
    ) => {
      if (
        harvest.measurementAmount ===
          undefined ||
        !harvest.measurementUnit
      ) {
        return
      }


      const key =
        harvest.measurementUnit ===
          'other'
          ? `other:${
              harvest.customMeasurementUnitLabel ??
              'other'
            }`
          : harvest.measurementUnit


      const existing =
        groupedMeasurements.get(
          key,
        )


      if (existing) {
        existing.amount +=
          harvest.measurementAmount

        return
      }


      groupedMeasurements.set(
        key,
        {
          amount:
            harvest.measurementAmount,

          unit:
            harvest.measurementUnit,

          customLabel:
            harvest.customMeasurementUnitLabel,
        },
      )
    },
  )


  if (
    groupedMeasurements.size ===
    0
  ) {
    return 'Not recorded'
  }


  return Array.from(
    groupedMeasurements.values(),
  )
    .map(
      (
        measurement,
      ) =>
        `${measurement.amount} ${getMeasurementUnitLabel(
          measurement.unit,
          measurement.amount,
          measurement.customLabel,
        )}`,
    )
    .join(
      ' · ',
    )
}


/* =======================================
   HARVEST TYPE SUMMARY
======================================= */

function buildHarvestTypeSummary(
  harvests: HarvestRecord[],
): string {

  if (
    harvests.length ===
    0
  ) {
    return 'None'
  }


  const labels =
    harvests
      .map(
        getHarvestTypeLabel,
      )
      .filter(
        (
          label,
        ) =>
          label !==
          'Not recorded',
      )


  if (
    labels.length ===
    0
  ) {
    return 'Not recorded'
  }


  return Array.from(
    new Set(
      labels,
    ),
  ).join(
    ' · ',
  )
}


/* =======================================
   QUALITY SUMMARY
======================================= */

function buildQualitySummary(
  harvests: HarvestRecord[],
): string {

  const labels =
    harvests
      .map(
        (
          harvest,
        ) =>
          getQualityLabel(
            harvest.quality,
          ),
      )
      .filter(
        (
          label,
        ) =>
          label !==
          'Not recorded',
      )


  if (
    labels.length ===
    0
  ) {
    return 'Not recorded'
  }


  return Array.from(
    new Set(
      labels,
    ),
  ).join(
    ' · ',
  )
}


/* =======================================
   TOTAL HARVEST COUNT
======================================= */

function getTotalHarvestCount(
  harvests: HarvestRecord[],
): number | undefined {

  const recordedCounts =
    harvests
      .map(
        (
          harvest,
        ) =>
          harvest.count,
      )
      .filter(
        (
          count,
        ): count is number =>
          count !==
          undefined,
      )


  if (
    recordedCounts.length ===
    0
  ) {
    return undefined
  }


  return recordedCounts.reduce(
    (
      total,
      count,
    ) =>
      total +
      count,
    0,
  )
}


/* =======================================
   READABLE LABEL
======================================= */

function formatRecordLabel(
  value?: string,
): string {
  if (!value) {
    return 'Not recorded'
  }

  return value
    .split('-')
    .map(
      (
        word,
      ) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(' ')
}


/* =======================================
   START METHOD LABEL
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

  return formatRecordLabel(
    plant.startMethod,
  )
}


/* =======================================
   ORIGIN LABEL
======================================= */

function getOriginLabel(
  plant: PlantStory,
): string {
  if (
    plant.originType ===
      'other' &&
    plant.customOriginLabel
  ) {
    return plant.customOriginLabel
  }

  return formatRecordLabel(
    plant.originType,
  )
}


/* =======================================
   GROWING PLACE KIND LABEL
======================================= */

function getGrowingPlaceKindLabel(
  place?: GrowingPlace,
): string {
  if (!place) {
    return 'Not recorded'
  }

  if (
    place.kind ===
      'other' &&
    place.customKindLabel
  ) {
    return place.customKindLabel
  }

  return formatRecordLabel(
    place.kind,
  )
}

/* =======================================
   GROWING HISTORY RANGE
======================================= */

function formatGrowingHistoryRange(
    startedDate: string,
    endedDate?: string,
  ): string {
    return `${formatDate(
      startedDate,
    )} → ${
      endedDate
        ? formatDate(
            endedDate,
          )
        : 'Now'
    }`
  }
  
  
  /* =======================================
     GROWING PLACE JOURNEY
  ======================================= */
  
  function buildGrowingPlaceJourney(
    plant: PlantStory,
    growingPlaces: GrowingPlace[],
  ): string {
    const history =
      plant.growingHistory ??
      []
  
  
    const entries =
      history
        .filter(
          (
            entry,
          ) =>
            Boolean(
              entry.growingPlaceId,
            ),
        )
        .map(
          (
            entry,
          ) => {
            const place =
              growingPlaces.find(
                (
                  item,
                ) =>
                  item.id ===
                  entry.growingPlaceId,
              )
  
  
            const placeName =
              place?.name ??
              'Unknown Growing Place'
  
  
            return `${formatGrowingHistoryRange(
              entry.startedDate,
              entry.endedDate,
            )} · ${placeName}`
          },
        )
  
  
    if (
      entries.length >
      0
    ) {
      return entries.join(
        '\n',
      )
    }
  
  
    const currentPlace =
      growingPlaces.find(
        (
          place,
        ) =>
          place.id ===
          plant.currentGrowingPlaceId,
      )
  
  
    return currentPlace
      ? `Current · ${currentPlace.name}`
      : 'Not recorded'
  }
  
  
  /* =======================================
     GROWING RECIPE JOURNEY
  ======================================= */
  
  function buildGrowingRecipeJourney(
    plant: PlantStory,
    growingSetups: GrowingSetup[],
  ): string {
    const history =
      plant.growingHistory ??
      []
  
  
    const entries =
      history
        .filter(
          (
            entry,
          ) =>
            Boolean(
              entry.growingSetupId,
            ),
        )
        .map(
          (
            entry,
          ) => {
            const setup =
              growingSetups.find(
                (
                  item,
                ) =>
                  item.id ===
                  entry.growingSetupId,
              )
  
  
            const setupName =
              setup?.name ??
              'Unknown Growing Recipe'
  
  
            return `${formatGrowingHistoryRange(
              entry.startedDate,
              entry.endedDate,
            )} · ${setupName}`
          },
        )
  
  
    if (
      entries.length >
      0
    ) {
      return entries.join(
        '\n',
      )
    }
  
  
    const currentSetup =
      growingSetups.find(
        (
          setup,
        ) =>
          setup.id ===
          plant.currentGrowingSetupId,
      )
  
  
    return currentSetup
      ? `Current · ${currentSetup.name}`
      : 'Not recorded'
  }


/* =======================================
   GROWING SETUP COMPONENTS
======================================= */

function getRecipeComponentUnitLabel(
  component: RecipeComponent,
): string {
  const amount =
    component.quantity

  const isSingular =
    amount === 1

  switch (
    component.unit
  ) {
    case 'part':
      return isSingular
        ? 'part'
        : 'parts'

    case 'litre':
      return isSingular
        ? 'litre'
        : 'litres'

    case 'millilitre':
      return isSingular
        ? 'millilitre'
        : 'millilitres'

    case 'kilogram':
      return isSingular
        ? 'kilogram'
        : 'kilograms'

    case 'gram':
      return isSingular
        ? 'gram'
        : 'grams'

    case 'handful':
      return isSingular
        ? 'handful'
        : 'handfuls'

    case 'scoop':
      return isSingular
        ? 'scoop'
        : 'scoops'

    case 'other':
      return component
        .customUnitLabel
        ?.trim() ||
        ''

    default:
      return ''
  }
}


function getRecipeComponentMeasurementLabel(
  component: RecipeComponent,
): string {
  if (
    component.quantity ===
    undefined
  ) {
    return ''
  }

  const unitLabel =
    getRecipeComponentUnitLabel(
      component,
    )

  return unitLabel
    ? `${component.quantity} ${unitLabel}`
    : String(
        component.quantity,
      )
}


function addRecipeComponentMeasurement(
  name: string,
  component: RecipeComponent,
): string {
  const measurement =
    getRecipeComponentMeasurementLabel(
      component,
    )

  return measurement
    ? `${name} · ${measurement}`
    : name
}


function getGrowingSetupComponentGroups(
  setup: GrowingSetup | undefined,
  ingredients: Ingredient[],
  products: GardenProduct[],
  growingSetups: GrowingSetup[],
): {
  ingredients: string
  products: string
  linkedRecipes: string
  all: string
} {
  if (!setup) {
    return {
      ingredients:
        'Not recorded',

      products:
        'Not recorded',

      linkedRecipes:
        'Not recorded',

      all:
        'Not recorded',
    }
  }

  const ingredientLabels:
    string[] = []

  const productLabels:
    string[] = []

  const linkedRecipeLabels:
    string[] = []

  const modernIngredientIds =
    new Set<string>()


  ;(
    setup.recipeComponents ??
    []
  ).forEach(
    (
      component,
    ) => {
      if (
        component.sourceType ===
        'ingredient'
      ) {
        modernIngredientIds.add(
          component.sourceId,
        )

        const ingredient =
          ingredients.find(
            (
              item,
            ) =>
              item.id ===
              component.sourceId,
          )

        if (ingredient) {
          ingredientLabels.push(
            addRecipeComponentMeasurement(
              ingredient.name,
              component,
            ),
          )
        }

        return
      }


      if (
        component.sourceType ===
        'product'
      ) {
        const product =
          products.find(
            (
              item,
            ) =>
              item.id ===
              component.sourceId,
          )

        if (product) {
          const productName =
            product.brand
              ? `${product.name} · ${product.brand}`
              : product.name

          productLabels.push(
            addRecipeComponentMeasurement(
              productName,
              component,
            ),
          )
        }

        return
      }


      const linkedSetup =
        growingSetups.find(
          (
            item,
          ) =>
            item.id ===
            component.sourceId,
        )

      if (linkedSetup) {
        linkedRecipeLabels.push(
          addRecipeComponentMeasurement(
            linkedSetup.name,
            component,
          ),
        )
      }
    },
  )


  /*
   * Older Growing Recipes may still contain
   * Ingredient links only in ingredientIds.
   *
   * Keep those visible, while avoiding a
   * duplicate when the modern relationship
   * exists as well.
   */

  ;(
    setup.ingredientIds ??
    []
  ).forEach(
    (
      ingredientId,
    ) => {
      if (
        modernIngredientIds.has(
          ingredientId,
        )
      ) {
        return
      }

      const ingredient =
        ingredients.find(
          (
            item,
          ) =>
            item.id ===
            ingredientId,
        )

      if (ingredient) {
        ingredientLabels.push(
          ingredient.name,
        )
      }
    },
  )


  const ingredientSummary =
    ingredientLabels.length >
    0
      ? ingredientLabels.join(
          ' · ',
        )
      : 'Not recorded'


  const productSummary =
    productLabels.length >
    0
      ? productLabels.join(
          ' · ',
        )
      : 'Not recorded'


  const linkedRecipeSummary =
    linkedRecipeLabels.length >
    0
      ? linkedRecipeLabels.join(
          ' · ',
        )
      : 'Not recorded'


  const allLabels = [
    ...ingredientLabels,
    ...productLabels,
    ...linkedRecipeLabels,
  ]


  return {
    ingredients:
      ingredientSummary,

    products:
      productSummary,

    linkedRecipes:
      linkedRecipeSummary,

    all:
      allLabels.length >
      0
        ? allLabels.join(
            ' · ',
          )
        : 'Not recorded',
  }
}


export default function PlantComparison({
    plantIds,
    activeSavedComparisonId,
    plants,
    growingPlaces,
    growingSetups,
    ingredients,
    products,
    events,
    harvests,
    onBack,
    onEditComparison,
    onSaveComparison,
    onNavigate,
  }: PlantComparisonProps) {
  
    /* =======================================
       COMPARISON LENSES
    ======================================= */
  
    const [
      selectedComparisonSections,
      setSelectedComparisonSections,
    ] = useState<
      ComparisonSectionId[]
    >(() => [
      ...ALL_COMPARISON_SECTION_IDS,
    ])
  
  
    const isShowingEverything =
      ALL_COMPARISON_SECTION_IDS.every(
        (
          sectionId,
        ) =>
          selectedComparisonSections.includes(
            sectionId,
          ),
      )
  
  
    function isComparisonSectionSelected(
      sectionId:
        ComparisonSectionId,
    ): boolean {
      return selectedComparisonSections.includes(
        sectionId,
      )
    }
  
  
    function toggleComparisonSection(
      sectionId:
        ComparisonSectionId,
    ) {
      setSelectedComparisonSections(
        (
          currentSections,
        ) => {
  
          /*
           * If this lens is already open,
           * tapping it closes that part of
           * the comparison.
           */
  
          if (
            currentSections.includes(
              sectionId,
            )
          ) {
  
            /*
             * Sprig always keeps at least
             * one comparison lens open.
             *
             * This prevents the gardener
             * accidentally creating an
             * entirely blank Comparison
             * page.
             */
  
            if (
              currentSections.length ===
              1
            ) {
              return currentSections
            }
  
  
            return currentSections.filter(
              (
                currentSectionId,
              ) =>
                currentSectionId !==
                sectionId,
            )
          }
  
  
          /*
           * Otherwise add this lens while
           * keeping everything else the
           * gardener is currently comparing.
           */
  
          return [
            ...currentSections,
            sectionId,
          ]
        },
      )
    }
  
  
    function showEveryComparisonSection() {
      setSelectedComparisonSections([
        ...ALL_COMPARISON_SECTION_IDS,
      ])
    }
  
  
    /* =======================================
       SELECTED STORIES
    ======================================= */

  const selectedPlants =
    plantIds
      .map(
        (
          plantId,
        ) =>
          plants.find(
            (
              plant,
            ) =>
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
     DYNAMIC PHOTO AGE CHECKPOINTS
  ======================================= */

  const visualComparisonAges =
  buildPlantComparisonAgeCheckpoints(
    selectedPlants,
    events,
    harvests,
    21,
  )



  /* =======================================
     SUMMARY COLUMNS
  ======================================= */

  const comparisonColumns:
    ComparisonColumn[] =
    selectedPlants.map(
      (
        plant,
      ) => {

        const growingPlace =
          growingPlaces.find(
            (
              place,
            ) =>
              place.id ===
              plant.currentGrowingPlaceId,
          )


        const growingSetup =
          growingSetups.find(
            (
              setup,
            ) =>
              setup.id ===
              plant.currentGrowingSetupId,
          )


        const plantHarvests =
          harvests
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
                first.date.localeCompare(
                  second.date,
                ),
            )


        const plantEvents =
          events.filter(
            (
              event,
            ) =>
              event.plantStoryIds.includes(
                plant.id,
              ),
          )


        const firstHarvest =
          plantHarvests[0]


        return {
          plant,

          growingPlaceName:
            growingPlace?.name ??
            'Not recorded',

          growingSetupName:
            growingSetup?.name ??
            'Not recorded',

          harvestCount:
            plantHarvests.length,

          journalCount:
            plantEvents.length,

          firstHarvestDate:
            firstHarvest?.date,

          daysToFirstHarvest:
            getDaysBetween(
              plant.plantedDate,
              firstHarvest?.date,
            ),
        }
      },
    )


  /* =======================================
     HOW THE STORY BEGAN
  ======================================= */

  const beginningComparisonColumns:
    BeginningComparisonColumn[] =
    selectedPlants.map(
      (
        plant,
      ) => ({
        plant,

        startMethodLabel:
          getStartMethodLabel(
            plant,
          ),

        quantityLabel:
          plant.quantity !==
          undefined
            ? String(
                plant.quantity,
              )
            : 'Not recorded',

        originLabel:
          getOriginLabel(
            plant,
          ),

        sourceLabel:
          plant.source ??
          'Not recorded',

        sownDate:
          formatDate(
            plant.sownDate,
          ),

        plantedDate:
          formatDate(
            plant.plantedDate,
          ),

        plantedOutDate:
          formatDate(
            plant.plantedOutDate,
          ),
      }),
    )


 /* =======================================
   WHERE IT GREW
======================================= */

const growingPlaceComparisonColumns:
  GrowingPlaceComparisonColumn[] =
  selectedPlants.map(
    (
      plant,
    ) => {
      const place =
        growingPlaces.find(
          (
            item,
          ) =>
            item.id ===
            plant.currentGrowingPlaceId,
        )


      return {
        plant,

        placeName:
          place?.name ??
          'Not recorded',

        journey:
          buildGrowingPlaceJourney(
            plant,
            growingPlaces,
          ),

        placeKind:
          getGrowingPlaceKindLabel(
            place,
          ),

        aspect:
          formatRecordLabel(
            place?.aspect,
          ),

        sunlight:
          formatRecordLabel(
            place?.sunlight,
          ),

        shelter:
          formatRecordLabel(
            place?.shelter,
          ),
      }
    },
  )


 /* =======================================
   WHAT IT GREW IN
======================================= */

const growingSetupComparisonColumns:
GrowingSetupComparisonColumn[] =
selectedPlants.map(
  (
    plant,
  ) => {
    const setup =
      growingSetups.find(
        (
          item,
        ) =>
          item.id ===
          plant.currentGrowingSetupId,
      )


    const componentGroups =
      getGrowingSetupComponentGroups(
        setup,
        ingredients,
        products,
        growingSetups,
      )


    return {
      plant,

      setupName:
        setup?.name ??
        'Not recorded',

      journey:
        buildGrowingRecipeJourney(
          plant,
          growingSetups,
        ),

      category:
        formatRecordLabel(
          setup?.category,
        ),

      brand:
        setup?.brand ??
        'Not recorded',

      productName:
        setup?.productName ??
        'Not recorded',

      groundType:
        formatRecordLabel(
          setup?.groundType,
        ),

      growingMethod:
        formatRecordLabel(
          setup?.growingSystemType,
        ),

      ingredients:
        componentGroups.ingredients,

      products:
        componentGroups.products,

      linkedRecipes:
        componentGroups.linkedRecipes,

      components:
        componentGroups.all,
    }
  },
)


  /* =======================================
     HARVEST COMPARISON COLUMNS
  ======================================= */

  const harvestComparisonColumns:
    HarvestComparisonColumn[] =
    selectedPlants.map(
      (
        plant,
      ) => {

        const plantHarvests =
          harvests
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
                first.date.localeCompare(
                  second.date,
                ),
            )


        const firstHarvest =
          plantHarvests[0]


        const lastHarvest =
          plantHarvests[
            plantHarvests.length -
            1
          ]


        return {
          plant,

          harvests:
            plantHarvests,

          firstHarvest,

          lastHarvest,

          daysToFirstHarvest:
            getDaysBetween(
              plant.plantedDate,
              firstHarvest?.date,
            ),

          harvestSpanDays:
            firstHarvest &&
            lastHarvest
              ? getDaysBetween(
                  firstHarvest.date,
                  lastHarvest.date,
                )
              : undefined,

          totalCount:
            getTotalHarvestCount(
              plantHarvests,
            ),

          measurementSummary:
            buildMeasurementSummary(
              plantHarvests,
            ),

          harvestTypeSummary:
            buildHarvestTypeSummary(
              plantHarvests,
            ),

          qualitySummary:
            buildQualitySummary(
              plantHarvests,
            ),

          latestOutcome:
            getPlantOutcomeLabel(
              lastHarvest,
            ),
        }
      },
    )

     /* =======================================
       KEEP COMPARISON ROWS ALIGNED
    ======================================= */
  
    useLayoutEffect(
        () => {
          let animationFrameId:
            number | undefined
    
    
          function synchroniseComparisonRows() {
    
            const comparisonShells =
              document.querySelectorAll<HTMLElement>(
                '.sprig-comparison-shell',
              )
    
    
            comparisonShells.forEach(
              (
                shell,
              ) => {
    
                const labelColumn =
                  shell.querySelector<HTMLElement>(
                    '.sprig-comparison-labels',
                  )
    
    
                const plantColumns =
                  Array.from(
                    shell.querySelectorAll<HTMLElement>(
                      '.sprig-comparison-column',
                    ),
                  )
    
    
                if (
                  !labelColumn ||
                  plantColumns.length ===
                    0
                ) {
                  return
                }
    
    
                const labelCells =
                  Array.from(
                    labelColumn.children,
                  ) as HTMLElement[]
    
    
                const plantCellGroups =
                  plantColumns.map(
                    (
                      column,
                    ) =>
                      Array.from(
                        column.children,
                      ) as HTMLElement[],
                  )
    
    
                /*
                 * Remove any height left from the
                 * previous measurement first.
                 *
                 * This lets every cell return to
                 * its natural content height before
                 * Sprig works out which cell in
                 * each row needs the most room.
                 */
    
                labelCells.forEach(
                  (
                    cell,
                  ) => {
                    cell.style.height =
                      ''
                  },
                )
    
    
                plantCellGroups.forEach(
                  (
                    cells,
                  ) => {
                    cells.forEach(
                      (
                        cell,
                      ) => {
                        cell.style.height =
                          ''
                      },
                    )
                  },
                )
    
    
                labelCells.forEach(
                  (
                    labelCell,
                    rowIndex,
                  ) => {
    
                    const rowCells = [
                      labelCell,
    
                      ...plantCellGroups
                        .map(
                          (
                            cells,
                          ) =>
                            cells[
                              rowIndex
                            ],
                        )
                        .filter(
                          (
                            cell,
                          ): cell is HTMLElement =>
                            Boolean(
                              cell,
                            ),
                        ),
                    ]
    
    
                    const tallestHeight =
                      Math.max(
                        ...rowCells.map(
                          (
                            cell,
                          ) =>
                            cell.offsetHeight,
                        ),
                      )
    
    
                    rowCells.forEach(
                      (
                        cell,
                      ) => {
                        cell.style.height =
                          `${tallestHeight}px`
                      },
                    )
                  },
                )
              },
            )
          }
    
    
          function scheduleSynchronisation() {
            if (
              animationFrameId !==
              undefined
            ) {
              window.cancelAnimationFrame(
                animationFrameId,
              )
            }
    
    
            animationFrameId =
              window.requestAnimationFrame(
                synchroniseComparisonRows,
              )
          }
    
    
          scheduleSynchronisation()
    
    
          window.addEventListener(
            'resize',
            scheduleSynchronisation,
          )
    
    
          return () => {
            window.removeEventListener(
              'resize',
              scheduleSynchronisation,
            )
    
    
            if (
              animationFrameId !==
              undefined
            ) {
              window.cancelAnimationFrame(
                animationFrameId,
              )
            }
          }
        },
        [
            comparisonColumns,
            beginningComparisonColumns,
            growingPlaceComparisonColumns,
            growingSetupComparisonColumns,
            harvestComparisonColumns,
            selectedComparisonSections,
          ],
        )

  /* =======================================
     SAVE COMPARISON
  ======================================= */

  function handleSaveComparison() {
    if (
      selectedPlants.length <
      2
    ) {
      return
    }


    const suggestedName =
      selectedPlants
        .map(
          (
            plant,
          ) =>
            plant.displayName,
        )
        .join(
          ' vs ',
        )


    const comparisonName =
      window.prompt(
        'What would you like to call this comparison?',
        suggestedName,
      )


    if (
      !comparisonName?.trim()
    ) {
      return
    }


    onSaveComparison(
      comparisonName.trim(),

      selectedPlants.map(
        (
          plant,
        ) =>
          plant.id,
      ),
    )


    window.alert(
      'This comparison has been saved in Sprig.',
    )
  }


 /* =======================================
   EXPORT GARDEN REPORT
======================================= */

async function handleExportGardenReport() {

    /*
     * The comparison lenses only control
     * what the gardener is viewing on
     * screen.
     *
     * A PDF should always contain the
     * complete Plant Comparison.
     */
  
    const previousSections = [
      ...selectedComparisonSections,
    ]
  
  
    const alreadyShowingEverything =
      ALL_COMPARISON_SECTION_IDS.every(
        (
          sectionId,
        ) =>
          previousSections.includes(
            sectionId,
          ),
      )
  
  
    if (
      !alreadyShowingEverything
    ) {
      setSelectedComparisonSections([
        ...ALL_COMPARISON_SECTION_IDS,
      ])
  
  
      /*
       * Allow React to render every hidden
       * comparison section before the
       * browser begins building the print
       * layout.
       */
  
      await new Promise<void>(
        (
          resolve,
        ) => {
          requestAnimationFrame(
            () => {
              requestAnimationFrame(
                () => {
                  resolve()
                },
              )
            },
          )
        },
      )
    }
  
  
    window.print()
  
  
    /*
     * Once the print dialog closes, restore
     * the exact comparison lenses the
     * gardener had selected beforehand.
     */
  
    if (
      !alreadyShowingEverything
    ) {
      setSelectedComparisonSections(
        previousSections,
      )
    }
  }


  /* =======================================
     EXCEL IMAGE
  ======================================= */

  function getExcelImageData(
    photoUrl: string,
  ):
    | {
        base64: string
        extension:
          | 'jpeg'
          | 'png'
          | 'gif'
      }
    | undefined {

    const match =
      photoUrl.match(
        /^data:image\/([^;]+);base64,(.+)$/,
      )

    if (!match) {
      return undefined
    }

    const imageType =
      match[1]
        .toLowerCase()

    const base64 =
      match[2]

    if (
      imageType ===
        'jpeg' ||
      imageType ===
        'jpg'
    ) {
      return {
        base64,
        extension:
          'jpeg',
      }
    }

    if (
      imageType ===
      'png'
    ) {
      return {
        base64,
        extension:
          'png',
      }
    }

    if (
      imageType ===
      'gif'
    ) {
      return {
        base64,
        extension:
          'gif',
      }
    }

    return undefined
  }


  /* =======================================
     STYLE EXCEL HEADER
  ======================================= */

  function styleExcelHeader(
    worksheet:
      ExcelJS.Worksheet,
  ) {
    const headerRow =
      worksheet.getRow(
        1,
      )

    headerRow.font = {
      bold: true,
    }

    headerRow.alignment = {
      vertical:
        'middle',
      wrapText:
        true,
    }

    worksheet.views = [
      {
        state:
          'frozen',
        xSplit:
          1,
        ySplit:
          1,
      },
    ]
  }

  /* =======================================
     EXPORT COMPARISON XLSX
  ======================================= */

  async function handleExportComparisonData() {

    const workbook =
      new ExcelJS.Workbook()

    workbook.creator =
      'Sprig'

    workbook.created =
      new Date()


    /* =======================================
       SUMMARY SHEET
    ======================================= */

    const summarySheet =
      workbook.addWorksheet(
        'Summary',
      )

    summarySheet.addRow([
      'Field',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          column.plant.displayName,
      ),
    ])

    summarySheet.addRow([
      'Plant',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          column.plant.plantName,
      ),
    ])

    summarySheet.addRow([
      'Variety',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          column.plant.variety ??
          'Not recorded',
      ),
    ])

    summarySheet.addRow([
      'Planted',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          formatDate(
            column.plant.plantedDate,
          ),
      ),
    ])

    summarySheet.addRow([
      'Sown',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          formatDate(
            column.plant.sownDate,
          ),
      ),
    ])

    summarySheet.addRow([
      'Status',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          column.plant.status,
      ),
    ])

    summarySheet.addRow([
      'Growing Place',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          column.growingPlaceName,
      ),
    ])

    summarySheet.addRow([
      'Growing Recipe',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          column.growingSetupName,
      ),
    ])

    summarySheet.addRow([
      'First harvest',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          formatDate(
            column.firstHarvestDate,
          ),
      ),
    ])

    summarySheet.addRow([
      'Days to first harvest',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          formatDays(
            column.daysToFirstHarvest,
          ),
      ),
    ])

    summarySheet.addRow([
      'Harvest occasions',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          column.harvestCount,
      ),
    ])

    summarySheet.addRow([
      'Journal entries',
      ...comparisonColumns.map(
        (
          column,
        ) =>
          column.journalCount,
      ),
    ])

    summarySheet.columns = [
      {
        width:
          24,
      },

      ...comparisonColumns.map(
        () => ({
          width:
            22,
        }),
      ),
    ]

    styleExcelHeader(
      summarySheet,
    )


    /* =======================================
       HOW THEY BEGAN SHEET
    ======================================= */

    const beginningSheet =
      workbook.addWorksheet(
        'How They Began',
      )

    beginningSheet.addRow([
      'Field',
      ...beginningComparisonColumns.map(
        (
          column,
        ) =>
          column.plant.displayName,
      ),
    ])

    ;[
      [
        'Start method',
        ...beginningComparisonColumns.map(
          (
            column,
          ) =>
            column.startMethodLabel,
        ),
      ],

      [
        'Quantity started',
        ...beginningComparisonColumns.map(
          (
            column,
          ) =>
            column.quantityLabel,
        ),
      ],

      [
        'Origin',
        ...beginningComparisonColumns.map(
          (
            column,
          ) =>
            column.originLabel,
        ),
      ],

      [
        'Source',
        ...beginningComparisonColumns.map(
          (
            column,
          ) =>
            column.sourceLabel,
        ),
      ],

      [
        'Sown',
        ...beginningComparisonColumns.map(
          (
            column,
          ) =>
            column.sownDate,
        ),
      ],

      [
        'Planted',
        ...beginningComparisonColumns.map(
          (
            column,
          ) =>
            column.plantedDate,
        ),
      ],

      [
        'Planted out',
        ...beginningComparisonColumns.map(
          (
            column,
          ) =>
            column.plantedOutDate,
        ),
      ],
    ].forEach(
      (
        row,
      ) =>
        beginningSheet.addRow(
          row,
        ),
    )

    beginningSheet.columns = [
      {
        width:
          24,
      },

      ...beginningComparisonColumns.map(
        () => ({
          width:
            22,
        }),
      ),
    ]

    styleExcelHeader(
      beginningSheet,
    )


    /* =======================================
       GROWING PLACE SHEET
    ======================================= */

    const placeSheet =
      workbook.addWorksheet(
        'Growing Place',
      )

    placeSheet.addRow([
      'Field',
      ...growingPlaceComparisonColumns.map(
        (
          column,
        ) =>
          column.plant.displayName,
      ),
    ])

    ;[
        [
            'Current Growing Place',
            ...growingPlaceComparisonColumns.map(
              (
                column,
              ) =>
                column.placeName,
            ),
          ],
          
          [
            'Growing journey',
            ...growingPlaceComparisonColumns.map(
              (
                column,
              ) =>
                column.journey,
            ),
          ],
          
          [
            'Place type',
        ...growingPlaceComparisonColumns.map(
          (
            column,
          ) =>
            column.placeKind,
        ),
      ],

      [
        'Aspect',
        ...growingPlaceComparisonColumns.map(
          (
            column,
          ) =>
            column.aspect,
        ),
      ],

      [
        'Sunlight',
        ...growingPlaceComparisonColumns.map(
          (
            column,
          ) =>
            column.sunlight,
        ),
      ],

      [
        'Shelter',
        ...growingPlaceComparisonColumns.map(
          (
            column,
          ) =>
            column.shelter,
        ),
      ],
    ].forEach(
      (
        row,
      ) =>
        placeSheet.addRow(
          row,
        ),
    )

    placeSheet.columns = [
      {
        width:
          24,
      },

      ...growingPlaceComparisonColumns.map(
        () => ({
          width:
            22,
        }),
      ),
    ]

    styleExcelHeader(
      placeSheet,
    )
    placeSheet.eachRow(
        (
          row,
        ) => {
          row.alignment = {
            vertical:
              'top',
            wrapText:
              true,
          }
        },
      )


        /* =======================================
       GROWING RECIPE SHEET
    ======================================= */

    const setupSheet =
      workbook.addWorksheet(
        'Growing Recipe',
      )

    setupSheet.addRow([
      'Field',
      ...growingSetupComparisonColumns.map(
        (
          column,
        ) =>
          column.plant.displayName,
      ),
    ])

    ;[
        [
            'Current Growing Recipe',
            ...growingSetupComparisonColumns.map(
              (
                column,
              ) =>
                column.setupName,
            ),
          ],
          
          [
            'Recipe journey',
            ...growingSetupComparisonColumns.map(
              (
                column,
              ) =>
                column.journey,
            ),
          ],
          
          [
            'Recipe type',
        ...growingSetupComparisonColumns.map(
          (
            column,
          ) =>
            column.category,
        ),
      ],

      [
        'Brand',
        ...growingSetupComparisonColumns.map(
          (
            column,
          ) =>
            column.brand,
        ),
      ],

      [
        'Product name',
        ...growingSetupComparisonColumns.map(
          (
            column,
          ) =>
            column.productName,
        ),
      ],

      [
        'Ground type',
        ...growingSetupComparisonColumns.map(
          (
            column,
          ) =>
            column.groundType,
        ),
      ],

      [
        'Growing method',
        ...growingSetupComparisonColumns.map(
          (
            column,
          ) =>
            column.growingMethod,
        ),
      ],

      [
        'Ingredients',
        ...growingSetupComparisonColumns.map(
          (
            column,
          ) =>
            column.ingredients,
        ),
      ],

      [
        'Bought products',
        ...growingSetupComparisonColumns.map(
          (
            column,
          ) =>
            column.products,
        ),
      ],

      [
        'Linked Growing Recipes',
        ...growingSetupComparisonColumns.map(
          (
            column,
          ) =>
            column.linkedRecipes,
        ),
      ],
    ].forEach(
      (
        row,
      ) =>
        setupSheet.addRow(
          row,
        ),
    )

    setupSheet.columns = [
      {
        width:
          26,
      },

      ...growingSetupComparisonColumns.map(
        () => ({
          width:
            36,
        }),
      ),
    ]

    setupSheet.eachRow(
      (
        row,
      ) => {
        row.alignment = {
          vertical:
            'top',
          wrapText:
            true,
        }
      },
    )

    styleExcelHeader(
      setupSheet,
    )


    /* =======================================
       HARVEST COMPARISON SHEET
    ======================================= */

    const harvestSheet =
      workbook.addWorksheet(
        'Harvest Comparison',
      )

    harvestSheet.addRow([
      'Field',
      ...harvestComparisonColumns.map(
        (
          column,
        ) =>
          column.plant.displayName,
      ),
    ])

    harvestSheet.addRow([
      'First harvest',
      ...harvestComparisonColumns.map(
        (
          column,
        ) =>
          formatDate(
            column.firstHarvest?.date,
          ),
      ),
    ])

    harvestSheet.addRow([
      'Last harvest',
      ...harvestComparisonColumns.map(
        (
          column,
        ) =>
          formatDate(
            column.lastHarvest?.date,
          ),
      ),
    ])

    harvestSheet.addRow([
      'Days to first harvest',
      ...harvestComparisonColumns.map(
        (
          column,
        ) =>
          formatDays(
            column.daysToFirstHarvest,
          ),
      ),
    ])

    harvestSheet.addRow([
      'Harvest occasions',
      ...harvestComparisonColumns.map(
        (
          column,
        ) =>
          column.harvests.length,
      ),
    ])

    harvestSheet.addRow([
      'Total count',
      ...harvestComparisonColumns.map(
        (
          column,
        ) =>
          column.totalCount ??
          'Not recorded',
      ),
    ])

    harvestSheet.addRow([
      'Measured total',
      ...harvestComparisonColumns.map(
        (
          column,
        ) =>
          column.measurementSummary,
      ),
    ])

    harvestSheet.addRow([
      'Harvest span',
      ...harvestComparisonColumns.map(
        (
          column,
        ) =>
          column.harvests.length >
          0
            ? formatDays(
                column.harvestSpanDays,
              )
            : 'Not recorded',
      ),
    ])

    harvestSheet.addRow([
      'Harvest types',
      ...harvestComparisonColumns.map(
        (
          column,
        ) =>
          column.harvestTypeSummary,
      ),
    ])

    harvestSheet.addRow([
      'Quality',
      ...harvestComparisonColumns.map(
        (
          column,
        ) =>
          column.qualitySummary,
      ),
    ])

    harvestSheet.addRow([
      'Latest outcome',
      ...harvestComparisonColumns.map(
        (
          column,
        ) =>
          column.latestOutcome ??
          'Not recorded',
      ),
    ])

    harvestSheet.columns = [
      {
        width:
          24,
      },

      ...harvestComparisonColumns.map(
        () => ({
          width:
            22,
        }),
      ),
    ]

    styleExcelHeader(
      harvestSheet,
    )


    /* =======================================
       GROWING AGE SHEET
    ======================================= */

    const growingAgeSheet =
      workbook.addWorksheet(
        'Growing Age',
      )

    growingAgeSheet.addRow([
      'Growing age',
      'Plant Story',
      'Plant',
      'Target age',
      'Matched age',
      'Photograph date',
      'Source',
      'Note',
      'Photo',
    ])

    styleExcelHeader(
      growingAgeSheet,
    )

    growingAgeSheet.columns = [
      {
        width:
          18,
      },

      {
        width:
          24,
      },

      {
        width:
          20,
      },

      {
        width:
          14,
      },

      {
        width:
          14,
      },

      {
        width:
          18,
      },

      {
        width:
          14,
      },

      {
        width:
          32,
      },

      {
        width:
          24,
      },
    ]


    selectedPlants.forEach(
      (
        plant,
      ) => {

        const evidence =
          buildPlantComparisonPhotoEvidence(
            plant,
            events,
            harvests,
          )


        visualComparisonAges.forEach(
          (
            age,
          ) => {

            const closestPhoto =
              findClosestPhotoEvidence(
                evidence,
                age.targetDays,
              )


            const row =
              growingAgeSheet.addRow([
                age.label,

                plant.displayName,

                plant.plantName,

                formatDays(
                  age.targetDays,
                ),

                closestPhoto
                  ? formatDays(
                      closestPhoto.daysAfterPlanting,
                    )
                  : 'Not recorded',

                closestPhoto
                  ? formatDate(
                      closestPhoto.date,
                    )
                  : 'Not recorded',

                  closestPhoto
                  ? closestPhoto.source ===
                      'plant-story'
                    ? 'Plant Story'
                    : closestPhoto.source ===
                        'journal'
                      ? 'Journal'
                      : 'Harvest'
                  : 'Not recorded',

                closestPhoto?.note ??
                  'Not recorded',

                '',
              ])


            if (
              closestPhoto
            ) {
              const imageData =
                getExcelImageData(
                  closestPhoto.photoUrl,
                )

              if (
                imageData
              ) {
                const imageId =
                  workbook.addImage({
                    base64:
                      imageData.base64,

                    extension:
                      imageData.extension,
                  })

                row.height =
                  82

                growingAgeSheet.addImage(
                  imageId,
                  {
                    tl: {
                      col:
                        8.1,

                      row:
                        row.number -
                        0.9,
                    },

                    ext: {
                      width:
                        105,

                      height:
                        78,
                    },
                  },
                )
              }
            }
          },
        )
      },
    )


    /* =======================================
       PHOTO EVIDENCE SHEET
    ======================================= */

    const photoEvidenceSheet =
      workbook.addWorksheet(
        'Photo Evidence',
      )

    photoEvidenceSheet.addRow([
      'Plant Story',
      'Plant',
      'Source',
      'Date',
      'Days after planting',
      'Record title / note',
      'Photograph',
    ])

    styleExcelHeader(
      photoEvidenceSheet,
    )

    photoEvidenceSheet.columns = [
      {
        width:
          24,
      },

      {
        width:
          20,
      },

      {
        width:
          14,
      },

      {
        width:
          18,
      },

      {
        width:
          20,
      },

      {
        width:
          32,
      },

      {
        width:
          28,
      },
    ]


    function addPhotoEvidenceRow(
      values: (
        | string
        | number
      )[],
      photoUrl: string,
    ) {

      const row =
        photoEvidenceSheet.addRow([
          ...values,
          '',
        ])

      const imageData =
        getExcelImageData(
          photoUrl,
        )

      if (
        !imageData
      ) {
        row.getCell(
          7,
        ).value =
          'Photograph format could not be embedded.'

        return
      }


      const imageId =
        workbook.addImage({
          base64:
            imageData.base64,

          extension:
            imageData.extension,
        })


      row.height =
        96


      photoEvidenceSheet.addImage(
        imageId,
        {
          tl: {
            col:
              6.1,

            row:
              row.number -
              0.9,
          },

          ext: {
            width:
              125,

            height:
              90,
          },
        },
      )
    }


    selectedPlants.forEach(
      (
        plant,
      ) => {

        (
            plant.photoUrls ??
            []
          ).forEach(
            (
              photoUrl,
              index,
            ) => {
          
              const photoDate =
                plant.photoDates?.[
                  index
                ]
          
          
              addPhotoEvidenceRow(
                [
                  plant.displayName,
          
                  plant.plantName,
          
                  'Plant Story',
          
                  photoDate
                    ? formatDate(
                        photoDate,
                      )
                    : 'Not recorded',
          
                  photoDate
                    ? formatDays(
                        getDaysBetween(
                          plant.plantedDate,
                          photoDate,
                        ),
                      )
                    : 'Not recorded',
          
                  'Plant Story photograph',
                ],
          
                photoUrl,
              )
            },
          )


        events
          .filter(
            (
              event,
            ) =>
              event.plantStoryIds.includes(
                plant.id,
              ) &&
              (
                event.photoUrls?.length ??
                0
              ) >
                0,
          )
          .forEach(
            (
              event,
            ) => {

              (
                event.photoUrls ??
                []
              ).forEach(
                (
                  photoUrl,
                ) => {

                  addPhotoEvidenceRow(
                    [
                      plant.displayName,

                      plant.plantName,

                      'Journal',

                      formatDate(
                        event.date,
                      ),

                      formatDays(
                        getDaysBetween(
                          plant.plantedDate,
                          event.date,
                        ),
                      ),

                      event.title,
                    ],

                    photoUrl,
                  )
                },
              )
            },
          )


        harvests
          .filter(
            (
              harvest,
            ) =>
              harvest.plantStoryIds.includes(
                plant.id,
              ) &&
              (
                harvest.photoUrls?.length ??
                0
              ) >
                0,
          )
          .forEach(
            (
              harvest,
            ) => {

              (
                harvest.photoUrls ??
                []
              ).forEach(
                (
                  photoUrl,
                ) => {

                  addPhotoEvidenceRow(
                    [
                      plant.displayName,

                      plant.plantName,

                      'Harvest',

                      formatDate(
                        harvest.date,
                      ),

                      formatDays(
                        getDaysBetween(
                          plant.plantedDate,
                          harvest.date,
                        ),
                      ),

                      getHarvestTypeLabel(
                        harvest,
                      ),
                    ],

                    photoUrl,
                  )
                },
              )
            },
          )
      },
    )


    /* =======================================
       DOWNLOAD WORKBOOK
    ======================================= */

    const buffer =
      await workbook.xlsx.writeBuffer()


    const blob =
      new Blob(
        [
          buffer,
        ],
        {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
      'sprig-plant-comparison.xlsx'


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
     PAGE
  ======================================= */

  return (
    <GardenLayout
      activePage="comparison"
      onNavigate={
        onNavigate
      }
    >
      <main className="journal-page sprig-comparison-report">

        {/* =======================================
            HEADER
        ======================================= */}

        <header className="journal-header">
          <div>
            <p className="section-label">
              Growing Stories
            </p>


            <h1>
              Plant Comparison
            </h1>


            <p className="journal-intro">
              Look at what happened,
              when it happened, and
              what it looked like.
            </p>
          </div>
        </header>


        {/* =======================================
            COMPARISON ACTIONS
        ======================================= */}

        <section className="plant-record-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={
              onBack
            }
          >
            ← Back to Plants
          </button>


          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              onEditComparison(
                selectedPlants.map(
                  (
                    plant,
                  ) =>
                    plant.id,
                ),
              )
            }
          >
            ✏️ Edit comparison
          </button>


          <button
            type="button"
            className="secondary-button"
            onClick={
              handleSaveComparison
            }
          >
            {activeSavedComparisonId
              ? '💾 Save changes'
              : '💾 Save comparison'}
          </button>


          <button
            type="button"
            className="secondary-button"
            onClick={
              handleExportGardenReport
            }
          >
            📄 Export PDF
          </button>


          <button
            type="button"
            className="secondary-button"
            onClick={
              handleExportComparisonData
            }
          >
            📊 Export XLSX
          </button>

        </section>


        {/* =======================================
            COMPARISON LENSES
        ======================================= */}

        <section className="sprig-comparison-section sprig-comparison-lens-picker">

          <p className="section-label">
            Choose your view
          </p>


          <h2>
            What would you like to compare?
          </h2>


          <p className="journal-intro">
            Choose one or a few parts of
            these growing stories, or keep
            the whole comparison open.
          </p>


          <div className="plant-record-actions">

            <button
              type="button"
              className="secondary-button"
              aria-pressed={
                isShowingEverything
              }
              onClick={
                showEveryComparisonSection
              }
            >
              {isShowingEverything
                ? '✓ Show everything'
                : 'Show everything'}
            </button>


            {COMPARISON_SECTION_OPTIONS.map(
              (
                option,
              ) => {

                const isSelected =
                  isComparisonSectionSelected(
                    option.id,
                  )


                return (
                  <button
                    key={
                      option.id
                    }
                    type="button"
                    className="secondary-button"
                    aria-pressed={
                      isSelected
                    }
                    title={
                      option.helperText
                    }
                    onClick={() =>
                      toggleComparisonSection(
                        option.id,
                      )
                    }
                  >
                    {isSelected
                      ? `✓ ${option.label}`
                      : option.label}
                  </button>
                )
              },
            )}

          </div>


          <p className="form-whisper">
            {selectedComparisonSections.length}{' '}
            of{' '}
            {ALL_COMPARISON_SECTION_IDS.length}{' '}
            comparison areas showing.
            Your choice changes this view
            only. Saved comparisons still
            keep the full story.
          </p>

        </section>


        {/* =======================================
            OVERVIEW
        ======================================= */}

        {isComparisonSectionSelected(
          'overview',
        ) && (
          <>

            {/* =======================================
                SUMMARY MATRIX
            ======================================= */}

            <section className="sprig-comparison-section">
              <p className="section-label">
                Side by side
              </p>


              <h2>
                Growing story summary
              </h2>


              <p className="journal-intro">
                The labels stay put while
                you move sideways through
                the selected stories.
              </p>


              <div className="sprig-comparison-shell">

                <div className="sprig-comparison-labels">

                  <div className="sprig-comparison-corner">
                    Compare
                  </div>

                  <div>
                    Plant
                  </div>

                  <div>
                    Variety
                  </div>

                  <div>
                    Planted
                  </div>

                  <div>
                    Sown
                  </div>

                  <div>
                    Status
                  </div>

                  <div>
                    Growing Place
                  </div>

                  <div>
                    Growing Recipe
                  </div>

                  <div>
                    First harvest
                  </div>

                  <div>
                    Days to first harvest
                  </div>

                  <div>
                    Harvests
                  </div>

                  <div>
                    Journal entries
                  </div>

                </div>


                <div className="sprig-comparison-scroll">
                  <div
                    className="sprig-comparison-columns"
                    style={{
                      gridTemplateColumns:
                        `repeat(${comparisonColumns.length}, minmax(165px, 180px))`,
                    }}
                  >
                    {comparisonColumns.map(
                      (
                        column,
                      ) => (
                        <section
                          key={
                            column.plant.id
                          }
                          className="sprig-comparison-column"
                        >
                          <div className="sprig-comparison-column-heading">
                            <strong>
                              {
                                column.plant.displayName
                              }
                            </strong>

                            <span>
                              {
                                column.plant.plantName
                              }
                            </span>
                          </div>


                          <div>
                            {
                              column.plant.plantName
                            }
                          </div>


                          <div>
                            {column.plant.variety ??
                              'Not recorded'}
                          </div>


                          <div>
                            {formatDate(
                              column.plant.plantedDate,
                            )}
                          </div>


                          <div>
                            {formatDate(
                              column.plant.sownDate,
                            )}
                          </div>


                          <div>
                            {
                              column.plant.status
                            }
                          </div>


                          <div>
                            {
                              column.growingPlaceName
                            }
                          </div>


                          <div>
                            {
                              column.growingSetupName
                            }
                          </div>


                          <div>
                            {formatDate(
                              column.firstHarvestDate,
                            )}
                          </div>


                          <div>
                            {formatDays(
                              column.daysToFirstHarvest,
                            )}
                          </div>


                          <div>
                            {
                              column.harvestCount
                            }
                          </div>


                          <div>
                            {
                              column.journalCount
                            }
                          </div>
                        </section>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </section>


            {/* =======================================
                HOW THE STORY BEGAN
            ======================================= */}

            <section className="sprig-comparison-section">

              <p className="section-label">
                Beginning
              </p>


              <h2>
                How each story began
              </h2>


              <p className="journal-intro">
                Compare how each plant started,
                where it came from and the dates
                that shaped its beginning.
              </p>


              <div className="sprig-comparison-shell">

                <div className="sprig-comparison-labels">

                  <div className="sprig-comparison-corner">
                    Beginning
                  </div>

                  <div>
                    Start method
                  </div>

                  <div>
                    Quantity started
                  </div>

                  <div>
                    Origin
                  </div>

                  <div>
                    Source
                  </div>

                  <div>
                    Sown
                  </div>

                  <div>
                    Planted
                  </div>

                  <div>
                    Planted out
                  </div>

                </div>


                <div className="sprig-comparison-scroll">
                  <div
                    className="sprig-comparison-columns"
                    style={{
                      gridTemplateColumns:
                        `repeat(${beginningComparisonColumns.length}, minmax(165px, 180px))`,
                    }}
                  >
                    {beginningComparisonColumns.map(
                      (
                        column,
                      ) => (
                        <section
                          key={`${column.plant.id}-beginning`}
                          className="sprig-comparison-column"
                        >
                          <div className="sprig-comparison-column-heading">

                            <strong>
                              {
                                column.plant.displayName
                              }
                            </strong>

                            <span>
                              {
                                column.plant.plantName
                              }
                            </span>

                          </div>


                          <div>
                            {
                              column.startMethodLabel
                            }
                          </div>


                          <div>
                            {
                              column.quantityLabel
                            }
                          </div>


                          <div>
                            {
                              column.originLabel
                            }
                          </div>


                          <div>
                            {
                              column.sourceLabel
                            }
                          </div>


                          <div>
                            {
                              column.sownDate
                            }
                          </div>


                          <div>
                            {
                              column.plantedDate
                            }
                          </div>


                          <div>
                            {
                              column.plantedOutDate
                            }
                          </div>

                        </section>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </section>

          </>
        )}


        {/* =======================================
            WHERE IT GREW
        ======================================= */}

        {isComparisonSectionSelected(
          'growing-place',
        ) && (
          <section className="sprig-comparison-section">

            <p className="section-label">
              Growing place
            </p>


            <h2>
              Where each story grew
            </h2>


            <p className="journal-intro">
              Compare the place itself,
              including its type, aspect,
              sunlight and shelter.
            </p>


            <div className="sprig-comparison-shell">

              <div className="sprig-comparison-labels">

                <div className="sprig-comparison-corner">
                  Place
                </div>


                <div>
                  Current Growing Place
                </div>


                <div>
                  Growing journey
                </div>


                <div>
                  Place type
                </div>


                <div>
                  Aspect
                </div>


                <div>
                  Sunlight
                </div>


                <div>
                  Shelter
                </div>

              </div>


              <div className="sprig-comparison-scroll">
                <div
                  className="sprig-comparison-columns"
                  style={{
                    gridTemplateColumns:
                      `repeat(${growingPlaceComparisonColumns.length}, minmax(165px, 180px))`,
                  }}
                >
                  {growingPlaceComparisonColumns.map(
                    (
                      column,
                    ) => (
                      <section
                        key={`${column.plant.id}-place`}
                        className="sprig-comparison-column"
                      >
                        <div className="sprig-comparison-column-heading">

                          <strong>
                            {
                              column.plant.displayName
                            }
                          </strong>

                          <span>
                            {
                              column.plant.plantName
                            }
                          </span>

                        </div>


                        <div>
                          {
                            column.placeName
                          }
                        </div>


                        <div
                          style={{
                            whiteSpace:
                              'pre-line',
                          }}
                        >
                          {
                            column.journey
                          }
                        </div>


                        <div>
                          {
                            column.placeKind
                          }
                        </div>


                        <div>
                          {
                            column.aspect
                          }
                        </div>


                        <div>
                          {
                            column.sunlight
                          }
                        </div>


                        <div>
                          {
                            column.shelter
                          }
                        </div>

                      </section>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>
        )}


        {/* =======================================
            WHAT IT GREW IN
        ======================================= */}

        {isComparisonSectionSelected(
          'growing-recipe',
        ) && (
          <section className="sprig-comparison-section">

            <p className="section-label">
              Growing Recipe
            </p>


            <h2>
              What each story grew in
            </h2>


            <p className="journal-intro">
              Compare the Growing Recipe
              itself and the real records
              that make it up. Where amounts
              were recorded, Sprig keeps
              those proportions beside each
              component so differences
              between recipes are easier to
              spot.
            </p>


            <div className="sprig-comparison-shell">

              <div className="sprig-comparison-labels">

                <div className="sprig-comparison-corner">
                  Setup
                </div>


                <div>
                  Current Growing Recipe
                </div>


                <div>
                  Recipe journey
                </div>


                <div>
                  Recipe type
                </div>


                <div>
                  Brand
                </div>


                <div>
                  Product name
                </div>


                <div>
                  Ground type
                </div>


                <div>
                  Growing method
                </div>


                <div>
                  Ingredients
                </div>


                <div>
                  Bought products
                </div>


                <div>
                  Linked Growing Recipes
                </div>

              </div>


              <div className="sprig-comparison-scroll">
                <div
                  className="sprig-comparison-columns"
                  style={{
                    gridTemplateColumns:
                      `repeat(${growingSetupComparisonColumns.length}, minmax(165px, 180px))`,
                  }}
                >
                  {growingSetupComparisonColumns.map(
                    (
                      column,
                    ) => (
                      <section
                        key={`${column.plant.id}-setup`}
                        className="sprig-comparison-column"
                      >
                        <div className="sprig-comparison-column-heading">

                          <strong>
                            {
                              column.plant.displayName
                            }
                          </strong>


                          <span>
                            {
                              column.plant.plantName
                            }
                          </span>

                        </div>


                        <div>
                          {
                            column.setupName
                          }
                        </div>


                        <div
                          style={{
                            whiteSpace:
                              'pre-line',
                          }}
                        >
                          {
                            column.journey
                          }
                        </div>


                        <div>
                          {
                            column.category
                          }
                        </div>


                        <div>
                          {
                            column.brand
                          }
                        </div>


                        <div>
                          {
                            column.productName
                          }
                        </div>


                        <div>
                          {
                            column.groundType
                          }
                        </div>


                        <div>
                          {
                            column.growingMethod
                          }
                        </div>


                        <div>
                          {
                            column.ingredients
                          }
                        </div>


                        <div>
                          {
                            column.products
                          }
                        </div>


                        <div>
                          {
                            column.linkedRecipes
                          }
                        </div>

                      </section>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>
        )}


        {/* =======================================
            HARVEST COMPARISON
        ======================================= */}

        {isComparisonSectionSelected(
          'harvest',
        ) && (
          <section className="sprig-comparison-section">

            <p className="section-label">
              Harvest comparison
            </p>


            <h2>
              What each story produced
            </h2>


            <p className="journal-intro">
              Compare harvest timing,
              repeat pickings, recorded
              quantities and how each
              growing story finished or
              continued.
            </p>


            <div className="sprig-comparison-shell">

              <div className="sprig-comparison-labels">

                <div className="sprig-comparison-corner">
                  Harvest
                </div>


                <div>
                  First harvest
                </div>


                <div>
                  Last harvest
                </div>


                <div>
                  Days to first harvest
                </div>


                <div>
                  Harvest occasions
                </div>


                <div>
                  Total count
                </div>


                <div>
                  Measured total
                </div>


                <div>
                  Harvest span
                </div>


                <div>
                  Harvest types
                </div>


                <div>
                  Quality
                </div>


                <div>
                  Latest outcome
                </div>

              </div>


              <div className="sprig-comparison-scroll">
                <div
                  className="sprig-comparison-columns"
                  style={{
                    gridTemplateColumns:
                      `repeat(${harvestComparisonColumns.length}, minmax(165px, 180px))`,
                  }}
                >
                  {harvestComparisonColumns.map(
                    (
                      column,
                    ) => (
                      <section
                        key={`${column.plant.id}-harvest-comparison`}
                        className="sprig-comparison-column"
                      >
                        <div className="sprig-comparison-column-heading">

                          <strong>
                            {
                              column.plant.displayName
                            }
                          </strong>


                          <span>
                            {
                              column.plant.plantName
                            }
                          </span>

                        </div>


                        <div>
                          {formatDate(
                            column.firstHarvest?.date,
                          )}
                        </div>


                        <div>
                          {formatDate(
                            column.lastHarvest?.date,
                          )}
                        </div>


                        <div>
                          {formatDays(
                            column.daysToFirstHarvest,
                          )}
                        </div>


                        <div>
                          {
                            column.harvests.length
                          }
                        </div>


                        <div>
                          {column.totalCount !==
                          undefined
                            ? column.totalCount
                            : 'Not recorded'}
                        </div>


                        <div>
                          {
                            column.measurementSummary
                          }
                        </div>


                        <div>
                          {column.harvests.length >
                          0
                            ? formatDays(
                                column.harvestSpanDays,
                              )
                            : 'Not recorded'}
                        </div>


                        <div>
                          {
                            column.harvestTypeSummary
                          }
                        </div>


                        <div>
                          {
                            column.qualitySummary
                          }
                        </div>


                        <div>
                          {column.latestOutcome ??
                            'Not recorded'}
                        </div>

                      </section>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>
        )}


        {/* =======================================
            AGE-MATCHED VISUAL COMPARISON
        ======================================= */}

        {isComparisonSectionSelected(
          'growing-age-photos',
        ) && (
          <section className="sprig-comparison-section">

            <p className="section-label">
              Compare by growing age
            </p>


            <h2>
              Similar ages, side by side
            </h2>


            <p className="journal-intro">
              Sprig looks through the dated
              photographs in these Plant
              Stories and finds ages that can
              genuinely be compared. Photos
              within about three weeks either
              side of the same growing age can
              sit together here.
            </p>


            {visualComparisonAges.length ===
            0 ? (
              <p className="form-whisper">
                There are not yet enough
                dated photographs at similar
                growing ages across these
                Plant Stories to make a
                meaningful visual comparison.
              </p>
            ) : (
              <div className="sprig-age-comparison-shell">

                <div className="sprig-age-comparison-labels">

                  <div className="sprig-comparison-corner">
                    Age
                  </div>


                  {visualComparisonAges.map(
                    (
                      age,
                    ) => (
                      <div
                        key={
                          age.targetDays
                        }
                      >
                        {
                          age.label
                        }
                      </div>
                    ),
                  )}

                </div>


                <div className="sprig-comparison-scroll">
                  <div
                    className="sprig-age-comparison-columns"
                    style={{
                      gridTemplateColumns:
                        `repeat(${selectedPlants.length}, minmax(165px, 180px))`,
                    }}
                  >
                    {selectedPlants.map(
                      (
                        plant,
                      ) => {

                        const evidence =
                          buildPlantComparisonPhotoEvidence(
                            plant,
                            events,
                            harvests,
                          )


                        return (
                          <section
                            key={`${plant.id}-age-comparison`}
                            className="sprig-age-comparison-column"
                          >

                            <div className="sprig-comparison-column-heading">

                              <strong>
                                {
                                  plant.displayName
                                }
                              </strong>


                              <span>
                                {
                                  plant.plantName
                                }
                              </span>

                            </div>


                            {visualComparisonAges.map(
                              (
                                age,
                              ) => {

                                const closestPhoto =
                                  findClosestPhotoEvidence(
                                    evidence,
                                    age.targetDays,
                                    21,
                                  )


                                return (
                                  <div
                                    key={`${plant.id}-${age.targetDays}`}
                                    className="sprig-age-comparison-cell"
                                  >
                                    {closestPhoto ? (
                                      <>

                                        <SprigPhotoGallery
                                          photoUrls={[
                                            closestPhoto.photoUrl,
                                          ]}
                                          title=""
                                          photoAltPrefix={`${plant.displayName} around ${age.label}`}
                                        />


                                        <p className="sprig-comparison-photo-context">
                                          {formatDays(
                                            closestPhoto.daysAfterPlanting,
                                          )}{' '}
                                          after planting
                                        </p>


                                        <p className="sprig-comparison-photo-source">

                                          {formatDate(
                                            closestPhoto.date,
                                          )}

                                          {' · '}

                                          {closestPhoto.source ===
                                          'plant-story'
                                            ? 'Plant Story'
                                            : closestPhoto.source ===
                                                'journal'
                                              ? closestPhoto.note ??
                                                'Journal'
                                              : 'Harvest'}

                                        </p>

                                      </>
                                    ) : (
                                      <p className="form-whisper">
                                        No photograph
                                        within three weeks
                                        of this growing age.
                                      </p>
                                    )}
                                  </div>
                                )
                              },
                            )}

                          </section>
                        )
                      },
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}


        {/* =======================================
            VISUAL COMPARISON
        ======================================= */}

        {isComparisonSectionSelected(
          'all-photos',
        ) && (
          <section className="sprig-comparison-section">

            <p className="section-label">
              Visual comparison
            </p>


            <h2>
              What the stories looked like
            </h2>


            <p className="journal-intro">
              Move sideways through the
              same Plant Stories and compare
              photographs from their records,
              Journal entries and Harvests.
            </p>


            <div className="sprig-visual-comparison-shell">

              <div className="sprig-visual-comparison-labels">

                <div className="sprig-comparison-corner">
                  Compare
                </div>


                <div>
                  Plant Story
                </div>


                <div>
                  Journal
                </div>


                <div>
                  Harvest
                </div>

              </div>


              <div className="sprig-comparison-scroll">
                <div
                  className="sprig-visual-comparison-columns"
                  style={{
                    gridTemplateColumns:
                      `repeat(${selectedPlants.length}, minmax(165px, 180px))`,
                  }}
                >
                  {selectedPlants.map(
                    (
                      plant,
                    ) => {

                      const photoEvents =
                        events
                          .filter(
                            (
                              event,
                            ) =>
                              event.plantStoryIds.includes(
                                plant.id,
                              ) &&
                              (
                                event.photoUrls?.length ??
                                0
                              ) >
                                0,
                          )
                          .sort(
                            (
                              first,
                              second,
                            ) =>
                              first.date.localeCompare(
                                second.date,
                              ),
                          )


                      const photoHarvests =
                        harvests
                          .filter(
                            (
                              harvest,
                            ) =>
                              harvest.plantStoryIds.includes(
                                plant.id,
                              ) &&
                              (
                                harvest.photoUrls?.length ??
                                0
                              ) >
                                0,
                          )
                          .sort(
                            (
                              first,
                              second,
                            ) =>
                              first.date.localeCompare(
                                second.date,
                              ),
                          )


                      return (
                        <section
                          key={`${plant.id}-visual`}
                          className="sprig-visual-comparison-column"
                        >

                          <div className="sprig-comparison-column-heading">

                            <strong>
                              {
                                plant.displayName
                              }
                            </strong>


                            <span>
                              {
                                plant.plantName
                              }
                            </span>

                          </div>


                          {/* =======================================
                              PLANT STORY PHOTOS
                          ======================================= */}

                          <div className="sprig-comparison-photo-cell">

                            {(plant.photoUrls?.length ??
                              0) >
                            0 ? (
                              <>
                                {(plant.photoUrls ??
                                  []).map(
                                  (
                                    photoUrl,
                                    index,
                                  ) => {

                                    const photoDate =
                                      plant.photoDates?.[
                                        index
                                      ]


                                    return (
                                      <div
                                        key={`${plant.id}-plant-story-photo-${index}`}
                                        className="sprig-comparison-photo-group"
                                      >
                                        {photoDate ? (
                                          <p className="sprig-comparison-photo-context">
                                            {getPhotoDateContext(
                                              plant,
                                              photoDate,
                                            )}
                                          </p>
                                        ) : (
                                          <p className="sprig-comparison-photo-context">
                                            Date not recorded
                                            for this photograph
                                          </p>
                                        )}


                                        <p className="sprig-comparison-photo-source">
                                          Plant Story
                                        </p>


                                        <SprigPhotoGallery
                                          photoUrls={[
                                            photoUrl,
                                          ]}
                                          title=""
                                          photoAltPrefix={`${plant.displayName} Plant Story photograph`}
                                        />
                                      </div>
                                    )
                                  },
                                )}
                              </>
                            ) : (
                              <p className="form-whisper">
                                No Plant Story
                                photographs yet.
                              </p>
                            )}

                          </div>


                          {/* =======================================
                              JOURNAL PHOTOS
                          ======================================= */}

                          <div className="sprig-comparison-photo-cell">

                            {photoEvents.length >
                            0 ? (
                              photoEvents.map(
                                (
                                  event,
                                ) => (
                                  <div
                                    key={
                                      event.id
                                    }
                                    className="sprig-comparison-photo-group"
                                  >
                                    <p className="sprig-comparison-photo-context">
                                      {getPhotoDateContext(
                                        plant,
                                        event.date,
                                      )}
                                    </p>


                                    <p className="sprig-comparison-photo-source">
                                      {
                                        event.title
                                      }
                                    </p>


                                    <SprigPhotoGallery
                                      photoUrls={
                                        event.photoUrls ??
                                        []
                                      }
                                      title="Journal photographs"
                                      photoAltPrefix={`${plant.displayName} Journal photograph`}
                                    />
                                  </div>
                                ),
                              )
                            ) : (
                              <p className="form-whisper">
                                No connected Journal
                                photographs yet.
                              </p>
                            )}

                          </div>


                          {/* =======================================
                              HARVEST PHOTOS
                          ======================================= */}

                          <div className="sprig-comparison-photo-cell">

                            {photoHarvests.length >
                            0 ? (
                              photoHarvests.map(
                                (
                                  harvest,
                                ) => (
                                  <div
                                    key={
                                      harvest.id
                                    }
                                    className="sprig-comparison-photo-group"
                                  >
                                    <p className="sprig-comparison-photo-context">
                                      {getPhotoDateContext(
                                        plant,
                                        harvest.date,
                                      )}
                                    </p>


                                    <p className="sprig-comparison-photo-source">
                                      Harvest
                                    </p>


                                    <SprigPhotoGallery
                                      photoUrls={
                                        harvest.photoUrls ??
                                        []
                                      }
                                      title="Harvest photographs"
                                      photoAltPrefix={`${plant.displayName} Harvest photograph`}
                                    />
                                  </div>
                                ),
                              )
                            ) : (
                              <p className="form-whisper">
                                No Harvest
                                photographs yet.
                              </p>
                            )}

                          </div>

                        </section>
                      )
                    },
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
    </GardenLayout>
  )
}