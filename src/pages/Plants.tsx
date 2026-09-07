import {
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

  searchText:
    string
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

  return plant.startMethod
    .replaceAll(
      '-',
      ' ',
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
      ],
    )


  const latestActivityDate =
    getLatestDate(
      [
        plant.plantedDate,
        plant.sownDate,
        plant.plantedOutDate,
        plant.enteredDate,
        plant.updatedAt,
        plant.completedAt,

        ...(
          plant.photoDates ??
          []
        ),

        ...plantEvents.map(
          event =>
            event.date,
        ),

        ...plantHarvests.map(
          harvest =>
            harvest.date,
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

    searchText:
      normaliseSearchText(
        searchWords.join(
          ' ',
        ),
      ),
  }
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

  /* =======================================
     STORY VIEW
  ======================================= */

  const [
    storyView,
    setStoryView,
  ] =
    useState<PlantStoryView>(
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
        : 'active',
    )


  /* =======================================
     SEARCH / SORT / FILTER
  ======================================= */

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState('')


  const [
    sortBy,
    setSortBy,
  ] =
    useState<PlantSort>(
      'newest-activity',
    )


  const [
    selectedStartMethods,
    setSelectedStartMethods,
  ] =
    useState<string[]>(
      [],
    )


  const [
    selectedGrowingPlaces,
    setSelectedGrowingPlaces,
  ] =
    useState<string[]>(
      [],
    )


  const [
    selectedGrowingSetups,
    setSelectedGrowingSetups,
  ] =
    useState<string[]>(
      [],
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


        {!compareMode &&
          visiblePlants.length >
            8 && (
            <div className="plant-back-to-top">
              <button
                type="button"
                className="text-button"
                onClick={
                  backToTop
                }
              >
                ↑ Back to the top
              </button>
            </div>
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
      </div>
    </GardenLayout>
  )
}