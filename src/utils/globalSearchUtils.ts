import type {
    GardenData,
    GardenEvent,
    GardenPlan,
    GardenProduct,
    GrowingPlace,
    GrowingSetup,
    HarvestRecord,
    GardenNote,
    GardenTrial,
    Ingredient,
    PlantReference,
    PlantStory,
    PurchaseRecord,
    SavedComparison,
    SavedKnowledgeSource,
  } from '../types'
  
  import {
    buildCalendarIndex,
  } from './calendarUtils'
  
  import type {
    CalendarItem,
    CalendarTimeType,
  } from './calendarUtils'
  
  
  /* =======================================
     GLOBAL SEARCH
  ======================================= */
  
  /*
   * Global Search does not own garden data.
   *
   * It builds a temporary searchable view
   * over the records Sprig already owns.
   *
   * Source records remain the truth.
   *
   * Calendar results are likewise derived
   * from Calendar's existing index rather
   * than copied into another saved store.
   */
  
  
  /* =======================================
     SEARCH CATEGORIES
  ======================================= */
  
  export type GlobalSearchCategory =
    | 'plants'
    | 'journal'
    | 'harvests'
    | 'calendar'
    | 'places'
    | 'recipes'
    | 'ingredients'
    | 'products'
    | 'purchases'
    | 'plans'
    | 'trials'
    | 'notes'
    | 'reference'
    | 'sources'
    | 'comparisons'
  
  
  export const GLOBAL_SEARCH_CATEGORIES:
    Array<{
      id: GlobalSearchCategory
      label: string
      singularLabel: string
      icon: string
    }> = [
      {
        id: 'plants',
        label: 'Plant Stories',
        singularLabel: 'Plant Story',
        icon: '🌱',
      },
  
      {
        id: 'journal',
        label: 'Journal',
        singularLabel: 'Garden Journal',
        icon: '📖',
      },
  
      {
        id: 'harvests',
        label: 'Harvests',
        singularLabel: 'Harvest',
        icon: '🧺',
      },
  
      {
        id: 'calendar',
        label: 'Calendar',
        singularLabel: 'Calendar',
        icon: '📅',
      },
  
      {
        id: 'places',
        label: 'Growing Places',
        singularLabel: 'Growing Place',
        icon: '🪴',
      },
  
      {
        id: 'recipes',
        label: 'Growing Recipes',
        singularLabel: 'Growing Recipe',
        icon: '🥣',
      },
  
      {
        id: 'ingredients',
        label: 'Ingredients',
        singularLabel: 'Ingredient',
        icon: '🌾',
      },
  
      {
        id: 'products',
        label: 'Products',
        singularLabel: 'Product',
        icon: '🧴',
      },
  
      {
        id: 'purchases',
        label: 'Purchases',
        singularLabel: 'Purchase',
        icon: '🛒',
      },
  
      {
        id: 'plans',
        label: 'Plans',
        singularLabel: 'Garden Plan',
        icon: '◇',
      },
  
      {
        id: 'trials',
        label: 'Garden Trials',
        singularLabel: 'Garden Trial',
        icon: '🧪',
      },
  
      {
        id: 'notes',
        label: 'Garden Notes',
        singularLabel: 'Garden Note',
        icon: '📝',
      },
  
      {
        id: 'reference',
        label: 'Plant Reference',
        singularLabel: 'Plant Reference',
        icon: '🌿',
      },
  
      {
        id: 'sources',
        label: 'Tips & Sources',
        singularLabel: 'Saved Tip / Source',
        icon: '🔖',
      },
  
      {
        id: 'comparisons',
        label: 'Comparisons',
        singularLabel: 'Comparison',
        icon: '⚖️',
      },
    ]
  
  
  export const ALL_GLOBAL_SEARCH_CATEGORIES:
    GlobalSearchCategory[] =
    GLOBAL_SEARCH_CATEGORIES.map(
      category =>
        category.id,
    )
  
  
  /* =======================================
     SEARCH SOURCE TYPES
  ======================================= */
  
  export type GlobalSearchSourceType =
    | 'plant-story'
    | 'garden-event'
    | 'harvest'
    | 'calendar'
    | 'growing-place'
    | 'growing-setup'
    | 'ingredient'
    | 'product'
    | 'purchase'
    | 'plan'
    | 'garden-trial'
    | 'garden-note'
    | 'plant-reference'
    | 'saved-source'
    | 'comparison'
  
  
  /* =======================================
     SEARCH RESULT
  ======================================= */
  
  export interface GlobalSearchItem {
    id: string
  
    category:
      GlobalSearchCategory
  
    sourceType:
      GlobalSearchSourceType
  
    sourceId:
      string
  
    title:
      string
  
    subtitle?:
      string
  
    description?:
      string
  
    date?:
      string
  
    endDate?:
      string
  
    /*
     * Used when this result should open
     * Calendar at a particular day rather
     * than opening an underlying source.
     */
  
    calendarDate?:
      string
  
    /*
     * Calendar is a derived view over records.
     *
     * A Calendar search result therefore keeps
     * the identity of the real source that
     * created the Calendar moment.
     */
  
    calendarSourceType?:
      CalendarItem['sourceType']
  
    calendarSourceId?:
      string
  
    calendarPlantStoryIds?:
      string[]
  
    /*
     * If reality has already been recorded from
     * a Plan, these links allow App to open the
     * real result when there is one unambiguous
     * destination.
     */
  
    planResultLinks?:
      Array<{
        recordType:
          | 'plant-story'
          | 'garden-event'
          | 'harvest'
          | 'purchase'
  
        recordId:
          string
      }>
  
    relationshipLabels?:
      string[]
  
    keywords:
      string[]
  
    score?:
      number
  }
  
  
  /* =======================================
     CATEGORY HELPERS
  ======================================= */
  
  export function getGlobalSearchCategoryLabel(
    category:
      GlobalSearchCategory,
  ):
    string {
    return (
      GLOBAL_SEARCH_CATEGORIES
        .find(
          item =>
            item.id ===
            category,
        )
        ?.label ??
      'Sprig'
    )
  }
  
  
  export function getGlobalSearchCategorySingularLabel(
    category:
      GlobalSearchCategory,
  ):
    string {
    return (
      GLOBAL_SEARCH_CATEGORIES
        .find(
          item =>
            item.id ===
            category,
        )
        ?.singularLabel ??
      'Sprig record'
    )
  }
  
  
  export function getGlobalSearchCategoryIcon(
    category:
      GlobalSearchCategory,
  ):
    string {
    return (
      GLOBAL_SEARCH_CATEGORIES
        .find(
          item =>
            item.id ===
            category,
        )
        ?.icon ??
      '🌿'
    )
  }
  
  
  /* =======================================
     TEXT NORMALISATION
  ======================================= */
  
  function normaliseSearchText(
    value:
      | string
      | number
      | undefined
      | null,
  ):
    string {
    if (
      value ===
        undefined ||
      value ===
        null
    ) {
      return ''
    }
  
  
    return String(
      value,
    )
      .normalize(
        'NFD',
      )
      .replace(
        /[\u0300-\u036f]/g,
        '',
      )
      .toLowerCase()
      .replace(
        /[_-]+/g,
        ' ',
      )
      .replace(
        /[^\p{L}\p{N}/]+/gu,
        ' ',
      )
      .replace(
        /\s+/g,
        ' ',
      )
      .trim()
  }
  
  
  /* =======================================
     LABEL FORMATTING
  ======================================= */
  
  export function formatGlobalSearchLabel(
    value:
      string |
      undefined,
  ):
    string {
    if (
      !value
    ) {
      return ''
    }
  
  
    return value
      .replace(
        /-/g,
        ' ',
      )
      .replace(
        /\b\w/g,
        letter =>
          letter.toUpperCase(),
      )
  }
  
  
  /* =======================================
     DATE HELPERS
  ======================================= */
  
  function parseDate(
    value:
      string |
      undefined,
  ):
    Date |
    undefined {
    if (
      !value
    ) {
      return undefined
    }
  
  
    const safeDate =
      value.slice(
        0,
        10,
      )
  
  
    const date =
      new Date(
        `${safeDate}T00:00:00`,
      )
  
  
    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return undefined
    }
  
  
    return date
  }
  
  
  export function formatGlobalSearchDate(
    value:
      string |
      undefined,
  ):
    string {
    const date =
      parseDate(
        value,
      )
  
  
    if (
      !date
    ) {
      return (
        value ??
        ''
      )
    }
  
  
    return date.toLocaleDateString(
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
  
  
  function getDateSearchTerms(
    value:
      string |
      undefined,
  ):
    string[] {
    const date =
      parseDate(
        value,
      )
  
  
    if (
      !date ||
      !value
    ) {
      return []
    }
  
  
    const isoDate =
      value.slice(
        0,
        10,
      )
  
  
    const day =
      String(
        date.getDate(),
      )
  
  
    const paddedDay =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      )
  
  
    const monthNumber =
      String(
        date.getMonth() +
        1,
      )
  
  
    const paddedMonth =
      String(
        date.getMonth() +
        1,
      ).padStart(
        2,
        '0',
      )
  
  
    const year =
      String(
        date.getFullYear(),
      )
  
  
    const shortMonth =
      date.toLocaleDateString(
        'en-AU',
        {
          month:
            'short',
        },
      )
  
  
    const longMonth =
      date.toLocaleDateString(
        'en-AU',
        {
          month:
            'long',
        },
      )
  
  
    const weekday =
      date.toLocaleDateString(
        'en-AU',
        {
          weekday:
            'long',
        },
      )
  
  
    return [
      isoDate,
  
      `${paddedDay}/${paddedMonth}/${year}`,
  
      `${day}/${monthNumber}/${year}`,
  
      `${day} ${shortMonth} ${year}`,
  
      `${day} ${longMonth} ${year}`,
  
      `${shortMonth} ${year}`,
  
      `${longMonth} ${year}`,
  
      `${weekday} ${day} ${longMonth} ${year}`,
    ]
  }
  
  
  /* =======================================
     SAFE SEARCH WORDS
  ======================================= */
  
  function searchableValues(
    values:
      Array<
        | string
        | number
        | undefined
        | null
      >,
  ):
    string[] {
    return values
      .filter(
        (
          value,
        ): value is string | number =>
          value !==
            undefined &&
          value !==
            null &&
          String(
            value,
          )
            .trim()
            .length >
            0,
      )
      .map(
        value =>
          String(
            value,
          ),
      )
  }
  
  
  /* =======================================
     RECORD LOOKUPS
  ======================================= */
  
  function findPlant(
    gardenData:
      GardenData,
  
    plantId:
      string |
      undefined,
  ):
    PlantStory |
    undefined {
    if (
      !plantId
    ) {
      return undefined
    }
  
  
    return gardenData
      .plantStories
      .find(
        plant =>
          plant.id ===
          plantId,
      )
  }
  
  
  function findGrowingPlace(
    gardenData:
      GardenData,
  
    placeId:
      string |
      undefined,
  ):
    GrowingPlace |
    undefined {
    if (
      !placeId
    ) {
      return undefined
    }
  
  
    return (
      gardenData
        .growingPlaces ??
      []
    ).find(
      place =>
        place.id ===
        placeId,
    )
  }
  
  
  function findGrowingSetup(
    gardenData:
      GardenData,
  
    setupId:
      string |
      undefined,
  ):
    GrowingSetup |
    undefined {
    if (
      !setupId
    ) {
      return undefined
    }
  
  
    return (
      gardenData
        .growingSetups ??
      []
    ).find(
      setup =>
        setup.id ===
        setupId,
    )
  }
  
  
  function findIngredient(
    gardenData:
      GardenData,
  
    ingredientId:
      string |
      undefined,
  ):
    Ingredient |
    undefined {
    if (
      !ingredientId
    ) {
      return undefined
    }
  
  
    return (
      gardenData
        .ingredients ??
      []
    ).find(
      ingredient =>
        ingredient.id ===
        ingredientId,
    )
  }
  
  
  function findProduct(
    gardenData:
      GardenData,
  
    productId:
      string |
      undefined,
  ):
    GardenProduct |
    undefined {
    if (
      !productId
    ) {
      return undefined
    }
  
  
    return (
      gardenData.products ??
      []
    ).find(
      product =>
        product.id ===
        productId,
    )
  }
  
  
  /* =======================================
     PLANT LABEL
  ======================================= */
  
  function getPlantLabel(
    plant:
      PlantStory |
      undefined,
  ):
    string |
    undefined {
    if (
      !plant
    ) {
      return undefined
    }
  
  
    if (
      plant.displayName
        ?.trim()
    ) {
      return plant
        .displayName
        .trim()
    }
  
  
    if (
      plant.variety
        ?.trim()
    ) {
      return `${plant.plantName} · ${plant.variety}`
    }
  
  
    return plant.plantName
  }
  
  
  /* =======================================
     RECIPE COMPONENT LABELS
  ======================================= */
  
  function getRecipeComponentLabels(
    gardenData:
      GardenData,
  
    setup:
      GrowingSetup,
  ):
    string[] {
    const labels:
      string[] =
      [];
  
  
    (
      setup
        .recipeComponents ??
      []
    ).forEach(
      component => {
        if (
          component.sourceType ===
          'ingredient'
        ) {
          const ingredient =
            findIngredient(
              gardenData,
              component.sourceId,
            )
  
  
          if (
            ingredient
          ) {
            labels.push(
              ingredient.name,
            )
          }
  
          return
        }
  
  
        if (
          component.sourceType ===
          'product'
        ) {
          const product =
            findProduct(
              gardenData,
              component.sourceId,
            )
  
  
          if (
            product
          ) {
            labels.push(
              product.name,
            )
          }
  
          return
        }
  
  
        const linkedSetup =
          findGrowingSetup(
            gardenData,
            component.sourceId,
          )
  
  
        if (
          linkedSetup
        ) {
          labels.push(
            linkedSetup.name,
          )
        }
      },
    );
  
  
    (
      setup
        .ingredientIds ??
      []
    ).forEach(
      ingredientId => {
        const ingredient =
          findIngredient(
            gardenData,
            ingredientId,
          )
  
  
        if (
          ingredient &&
          !labels.includes(
            ingredient.name,
          )
        ) {
          labels.push(
            ingredient.name,
          )
        }
      },
    );
  
  
    return labels
  }
  
  
  /* =======================================
     PLANT SEARCH ITEM
  ======================================= */
  
  function buildPlantSearchItem(
    gardenData:
      GardenData,
  
    plant:
      PlantStory,
  ):
    GlobalSearchItem {
    const growingPlace =
      findGrowingPlace(
        gardenData,
        plant.currentGrowingPlaceId,
      )
  
  
    const growingSetup =
      findGrowingSetup(
        gardenData,
        plant.currentGrowingSetupId,
      )
  
  
    const relationshipLabels =
      searchableValues([
        growingPlace?.name,
        growingSetup?.name,
      ])
  
  
    const dateTerms = [
      ...getDateSearchTerms(
        plant.sownDate,
      ),
  
      ...getDateSearchTerms(
        plant.plantedDate,
      ),
  
      ...getDateSearchTerms(
        plant.plantedOutDate,
      ),
  
      ...getDateSearchTerms(
        plant.completedAt,
      ),
    ]
  
  
    return {
      id:
        `plant-${plant.id}`,
  
      category:
        'plants',
  
      sourceType:
        'plant-story',
  
      sourceId:
        plant.id,
  
      title:
        getPlantLabel(
          plant,
        ) ??
        'Plant Story',
  
      subtitle: [
        plant.plantName,
  
        plant.variety,
  
        plant.status
          ? formatGlobalSearchLabel(
              plant.status,
            )
          : undefined,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        ),
  
      description:
        plant.notes,
  
      date:
        plant.sownDate ??
        plant.plantedDate,
  
      relationshipLabels,
  
      keywords:
        searchableValues([
          plant.plantName,
  
          plant.variety,
  
          plant.displayName,
  
          plant.personality,
  
          plant.quantity,
  
          plant.startMethod,
  
          plant.customStartMethodLabel,
  
          plant.originType,
  
          plant.source,
  
          plant.customOriginLabel,
  
          plant.status,
  
          plant.notes,
  
          growingPlace?.name,
  
          growingPlace?.kind,
  
          growingPlace?.customKindLabel,
  
          growingSetup?.name,
  
          growingSetup?.category,
  
          ...(
            plant.tags ??
            []
          ),
  
          ...dateTerms,
        ]),
    }
  }
  
  
  /* =======================================
     JOURNAL SEARCH ITEM
  ======================================= */
  
  function buildJournalSearchItem(
    gardenData:
      GardenData,
  
    event:
      GardenEvent,
  ):
    GlobalSearchItem {
    const plantLabels =
      event
        .plantStoryIds
        .map(
          plantId =>
            getPlantLabel(
              findPlant(
                gardenData,
                plantId,
              ),
            ),
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    const placeLabels =
      (
        event
          .growingPlaceIds ??
        []
      )
        .map(
          placeId =>
            findGrowingPlace(
              gardenData,
              placeId,
            )?.name,
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    return {
      id:
        `journal-${event.id}`,
  
      category:
        'journal',
  
      sourceType:
        'garden-event',
  
      sourceId:
        event.id,
  
      title:
        event.title,
  
      subtitle: [
        'Garden Journal',
  
        ...(
          event
            .activityTypes
            ?.length
            ? event.activityTypes.map(
                formatGlobalSearchLabel,
              )
            : [
                formatGlobalSearchLabel(
                  event.type,
                ),
              ]
        ),
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        ),
  
      description:
        event.notes,
  
      date:
        event.date,
  
      relationshipLabels: [
        ...plantLabels,
        ...placeLabels,
      ],
  
      keywords:
        searchableValues([
          event.title,
  
          event.type,
  
          ...(
            event.activityTypes ??
            []
          ),
  
          event.notes,
  
          event.productUsed,
  
          event.plantCategory,
  
          ...plantLabels,
  
          ...placeLabels,
  
          ...getDateSearchTerms(
            event.date,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     HARVEST SEARCH ITEM
  ======================================= */
  
  function buildHarvestSearchItem(
    gardenData:
      GardenData,
  
    harvest:
      HarvestRecord,
  ):
    GlobalSearchItem {
    const plantLabels =
      harvest
        .plantStoryIds
        .map(
          plantId =>
            getPlantLabel(
              findPlant(
                gardenData,
                plantId,
              ),
            ),
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    const title =
      plantLabels.length >
      0
        ? `Harvest · ${plantLabels.join(
            ', ',
          )}`
        : 'Harvest'
  
  
    return {
      id:
        `harvest-${harvest.id}`,
  
      category:
        'harvests',
  
      sourceType:
        'harvest',
  
      sourceId:
        harvest.id,
  
      title,
  
      subtitle: [
        harvest.harvestType
          ? formatGlobalSearchLabel(
              harvest.harvestType,
            )
          : undefined,
  
        harvest.customHarvestTypeLabel,
  
        harvest.quality
          ? `${formatGlobalSearchLabel(
              harvest.quality,
            )} quality`
          : undefined,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        ) ||
        'Harvest Record',
  
      description:
        harvest.notes,
  
      date:
        harvest.date,
  
      relationshipLabels:
        plantLabels,
  
      keywords:
        searchableValues([
          title,
  
          harvest.harvestType,
  
          harvest.customHarvestTypeLabel,
  
          harvest.count,
  
          harvest.measurementAmount,
  
          harvest.measurementUnit,
  
          harvest.customMeasurementUnitLabel,
  
          harvest.plantOutcome,
  
          harvest.customPlantOutcomeLabel,
  
          harvest.quality,
  
          harvest.notes,
  
          ...plantLabels,
  
          ...getDateSearchTerms(
            harvest.date,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     GROWING PLACE SEARCH ITEM
  ======================================= */
  
  function buildGrowingPlaceSearchItem(
    gardenData:
      GardenData,
  
    place:
      GrowingPlace,
  ):
    GlobalSearchItem {
    const currentRecipe =
      findGrowingSetup(
        gardenData,
        place.growingSetupId,
      )
  
  
    const plantLabels =
      gardenData
        .plantStories
        .filter(
          plant =>
            plant.currentGrowingPlaceId ===
              place.id ||
            (
              plant
                .previousGrowingPlaceIds ??
              []
            ).includes(
              place.id,
            ) ||
            (
              plant
                .growingHistory ??
              []
            ).some(
              entry =>
                entry.growingPlaceId ===
                place.id,
            ),
        )
        .map(
          getPlantLabel,
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    return {
      id:
        `place-${place.id}`,
  
      category:
        'places',
  
      sourceType:
        'growing-place',
  
      sourceId:
        place.id,
  
      title:
        place.name,
  
      subtitle:
        place.kind ===
          'other' &&
        place.customKindLabel
          ? place.customKindLabel
          : formatGlobalSearchLabel(
              place.kind,
            ),
  
      description:
        place.notes,
  
      relationshipLabels:
        searchableValues([
          currentRecipe?.name,
          ...plantLabels,
        ]),
  
      keywords:
        searchableValues([
          place.name,
  
          place.kind,
  
          place.customKindLabel,
  
          place.aspect,
  
          place.sunlight,
  
          place.shelter,
  
          place.notes,
  
          currentRecipe?.name,
  
          ...plantLabels,
  
          ...getDateSearchTerms(
            place.createdAt,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     GROWING RECIPE SEARCH ITEM
  ======================================= */
  
  function buildGrowingSetupSearchItem(
    gardenData:
      GardenData,
  
    setup:
      GrowingSetup,
  ):
    GlobalSearchItem {
    const componentLabels =
      getRecipeComponentLabels(
        gardenData,
        setup,
      )
  
  
    const plantLabels =
      gardenData
        .plantStories
        .filter(
          plant =>
            plant.currentGrowingSetupId ===
              setup.id ||
            (
              plant
                .previousGrowingSetupIds ??
              []
            ).includes(
              setup.id,
            ) ||
            (
              plant
                .growingHistory ??
              []
            ).some(
              entry =>
                entry.growingSetupId ===
                setup.id,
            ),
        )
        .map(
          getPlantLabel,
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    const placeLabels =
      (
        gardenData
          .growingPlaces ??
        []
      )
        .filter(
          place =>
            place.growingSetupId ===
            setup.id,
        )
        .map(
          place =>
            place.name,
        )
  
  
    return {
      id:
        `recipe-${setup.id}`,
  
      category:
        'recipes',
  
      sourceType:
        'growing-setup',
  
      sourceId:
        setup.id,
  
      title:
        setup.name,
  
      subtitle: [
        formatGlobalSearchLabel(
          setup.category,
        ),
  
        setup.brand,
  
        setup.productName,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        ),
  
      description:
        setup.notes,
  
      relationshipLabels: [
        ...componentLabels,
        ...plantLabels,
        ...placeLabels,
      ],
  
      keywords:
        searchableValues([
          setup.name,
  
          setup.category,
  
          setup.brand,
  
          setup.productName,
  
          setup.groundType,
  
          setup.growingSystemType,
  
          setup.notes,
  
          setup.isFavourite
            ? 'favourite'
            : undefined,
  
          setup.isArchived
            ? 'archived'
            : undefined,
  
          ...componentLabels,
  
          ...plantLabels,
  
          ...placeLabels,
  
          ...getDateSearchTerms(
            setup.createdAt,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     INGREDIENT SEARCH ITEM
  ======================================= */
  
  function buildIngredientSearchItem(
    gardenData:
      GardenData,
  
    ingredient:
      Ingredient,
  ):
    GlobalSearchItem {
    const recipeLabels =
      (
        gardenData
          .growingSetups ??
        []
      )
        .filter(
          setup =>
            (
              setup
                .ingredientIds ??
              []
            ).includes(
              ingredient.id,
            ) ||
            (
              setup
                .recipeComponents ??
              []
            ).some(
              component =>
                component.sourceType ===
                  'ingredient' &&
                component.sourceId ===
                  ingredient.id,
            ),
        )
        .map(
          setup =>
            setup.name,
        )
  
  
    return {
      id:
        `ingredient-${ingredient.id}`,
  
      category:
        'ingredients',
  
      sourceType:
        'ingredient',
  
      sourceId:
        ingredient.id,
  
      title:
        ingredient.name,
  
      subtitle:
        ingredient.category ===
          'other' &&
        ingredient.customCategoryLabel
          ? ingredient.customCategoryLabel
          : ingredient.category
            ? formatGlobalSearchLabel(
                ingredient.category,
              )
            : 'Ingredient',
  
      description:
        ingredient.notes,
  
      relationshipLabels:
        recipeLabels,
  
      keywords:
        searchableValues([
          ingredient.name,
  
          ingredient.category,
  
          ingredient.customCategoryLabel,
  
          ingredient.manufacturer,
  
          ingredient.source,
  
          ingredient.notes,
  
          ingredient.isFavourite
            ? 'favourite'
            : undefined,
  
          ingredient.isArchived
            ? 'archived'
            : undefined,
  
          ...recipeLabels,
  
          ...getDateSearchTerms(
            ingredient.createdAt,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     PRODUCT SEARCH ITEM
  ======================================= */
  
  function buildProductSearchItem(
    gardenData:
      GardenData,
  
    product:
      GardenProduct,
  ):
    GlobalSearchItem {
    const recipeLabels =
      (
        gardenData
          .growingSetups ??
        []
      )
        .filter(
          setup =>
            (
              setup
                .recipeComponents ??
              []
            ).some(
              component =>
                component.sourceType ===
                  'product' &&
                component.sourceId ===
                  product.id,
            ),
        )
        .map(
          setup =>
            setup.name,
        )
  
  
    const purchaseLabels =
      (
        gardenData.purchases ??
        []
      )
        .filter(
          purchase =>
            purchase.itemType ===
              'product' &&
            purchase.itemId ===
              product.id,
        )
        .map(
          purchase => [
            purchase.supplier,
  
            ...getDateSearchTerms(
              purchase.date,
            ),
          ],
        )
        .flat()
  
  
    return {
      id:
        `product-${product.id}`,
  
      category:
        'products',
  
      sourceType:
        'product',
  
      sourceId:
        product.id,
  
      title:
        product.name,
  
      subtitle: [
        product.brand,
  
        product.productName,
  
        product.category ===
          'other' &&
        product.customCategoryLabel
          ? product.customCategoryLabel
          : product.category
            ? formatGlobalSearchLabel(
                product.category,
              )
            : undefined,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        ) ||
        'Garden Product',
  
      description:
        product.notes,
  
      relationshipLabels:
        recipeLabels,
  
      keywords:
        searchableValues([
          product.name,
  
          product.category,
  
          product.customCategoryLabel,
  
          product.brand,
  
          product.productName,
  
          product.notes,
  
          product.isFavourite
            ? 'favourite'
            : undefined,
  
          product.isArchived
            ? 'archived'
            : undefined,
  
          ...recipeLabels,
  
          ...purchaseLabels,
  
          ...getDateSearchTerms(
            product.createdAt,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     PURCHASE SEARCH ITEM
  ======================================= */
  
  function buildPurchaseSearchItem(
    gardenData:
      GardenData,
  
    purchase:
      PurchaseRecord,
  ):
    GlobalSearchItem {
    let linkedRecordLabel:
      string |
      undefined
  
  
    if (
      purchase.itemType ===
      'ingredient'
    ) {
      linkedRecordLabel =
        findIngredient(
          gardenData,
          purchase.itemId,
        )?.name
    }
  
  
    if (
      purchase.itemType ===
      'product'
    ) {
      linkedRecordLabel =
        findProduct(
          gardenData,
          purchase.itemId,
        )?.name
    }
  
  
    if (
      purchase.itemType ===
      'growing-setup'
    ) {
      linkedRecordLabel =
        findGrowingSetup(
          gardenData,
          purchase.itemId,
        )?.name
    }
  
  
    if (
      purchase.itemType ===
      'plant'
    ) {
      linkedRecordLabel =
        getPlantLabel(
          findPlant(
            gardenData,
            purchase.itemId,
          ),
        )
    }
  
  
    return {
      id:
        `purchase-${purchase.id}`,
  
      category:
        'purchases',
  
      sourceType:
        'purchase',
  
      sourceId:
        purchase.id,
  
      title:
        purchase.itemName,
  
      subtitle: [
        purchase.brand,
  
        purchase.supplier
          ? `from ${purchase.supplier}`
          : undefined,
  
        `$${purchase.pricePaid.toFixed(
          2,
        )}`,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        ),
  
      description:
        purchase.notes,
  
      date:
        purchase.date,
  
      relationshipLabels:
        searchableValues([
          linkedRecordLabel,
        ]),
  
      keywords:
        searchableValues([
          purchase.itemName,
  
          purchase.itemType,
  
          purchase.brand,
  
          purchase.supplier,
  
          purchase.pricePaid,
  
          purchase.currency,
  
          purchase.quantity,
  
          purchase.unit,
  
          purchase.packageSize,
  
          purchase.packageUnit,
  
          purchase.notes,
  
          linkedRecordLabel,
  
          ...getDateSearchTerms(
            purchase.date,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     PLAN SEARCH ITEM
  ======================================= */
  
  function buildPlanSearchItem(
    gardenData:
      GardenData,
  
    plan:
      GardenPlan,
  ):
    GlobalSearchItem {
    const plantLabels =
      (
        plan
          .plantStoryIds ??
        []
      )
        .map(
          plantId =>
            getPlantLabel(
              findPlant(
                gardenData,
                plantId,
              ),
            ),
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    const placeLabels =
      (
        plan
          .growingPlaceIds ??
        []
      )
        .map(
          placeId =>
            findGrowingPlace(
              gardenData,
              placeId,
            )?.name,
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    const recipeLabels =
      (
        plan
          .growingSetupIds ??
        []
      )
        .map(
          setupId =>
            findGrowingSetup(
              gardenData,
              setupId,
            )?.name,
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    const plannedPlantLabel =
      [
        plan
          .plannedPlant
          ?.variety,
  
        plan
          .plannedPlant
          ?.plantName,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' ',
        )
  
  
    return {
      id:
        `plan-${plan.id}`,
  
      category:
        'plans',
  
      sourceType:
        'plan',
  
      sourceId:
        plan.id,
  
      planResultLinks:
        (
          plan.results ??
          []
        )
          .filter(
            result =>
              result.recordType ===
                'plant-story' ||
              result.recordType ===
                'garden-event' ||
              result.recordType ===
                'harvest' ||
              result.recordType ===
                'purchase',
          )
          .map(
            result => ({
              recordType:
                result.recordType,
  
              recordId:
                result.recordId,
            }),
          ),
  
      title:
        plan.title,
  
      subtitle: [
        plan.customKindLabel ??
        formatGlobalSearchLabel(
          plan.kind,
        ),
  
        plan.status ===
          'planned'
          ? 'Still planned'
          : plan.status ===
            'recorded'
            ? 'Recorded in the garden'
            : 'Decided not to',
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        ),
  
      description:
        plan.notes,
  
      date:
        plan.date,
  
      endDate:
        plan.endDate,
  
      calendarDate:
        plan.date,
  
      relationshipLabels:
        searchableValues([
          plannedPlantLabel,
  
          ...plantLabels,
  
          ...placeLabels,
  
          ...recipeLabels,
        ]),
  
      keywords:
        searchableValues([
          plan.title,
  
          plan.kind,
  
          plan.customKindLabel,
  
          plan.status,
  
          plan.notes,
  
          plannedPlantLabel,
  
          plan
            .plannedPlant
            ?.plantName,
  
          plan
            .plannedPlant
            ?.variety,
  
          plan
            .plannedPlant
            ?.quantity,
  
          plan
            .plannedPlant
            ?.startMethod,
  
          plan
            .plannedPlant
            ?.customStartMethodLabel,
  
          plan
            .timingAssumption
            ?.referenceType,
  
          plan
            .timingAssumption
            ?.daysMin,
  
          plan
            .timingAssumption
            ?.daysMax,
  
          ...plantLabels,
  
          ...placeLabels,
  
          ...recipeLabels,
  
          ...getDateSearchTerms(
            plan.date,
          ),
  
          ...getDateSearchTerms(
            plan.endDate,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     GARDEN TRIAL SEARCH ITEM
  ======================================= */
  
  function buildGardenTrialSearchItem(
    trial:
      GardenTrial,
  ):
    GlobalSearchItem {
    const relationshipLabels =
      (
        trial.relationships ??
        []
      )
        .map(
          relationship =>
            relationship.label,
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    const observationText =
      (
        trial.observations ??
        []
      ).map(
        observation =>
          observation.body,
      )
  
  
    const statusLabel =
      trial.status ===
        'active'
        ? 'Quietly unfolding'
        : trial.status ===
          'completed'
          ? 'Story gathered'
          : 'Set aside'
  
  
    const resultLabel =
      trial.result
        ? formatGlobalSearchLabel(
            trial.result,
          )
        : undefined
  
  
    return {
      id:
        `trial-${trial.id}`,
  
      category:
        'trials',
  
      sourceType:
        'garden-trial',
  
      sourceId:
        trial.id,
  
      title:
        trial.title,
  
      subtitle: [
        'Garden Trial',
  
        statusLabel,
  
        resultLabel,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        ),
  
      description:
        trial.question ??
        trial.purpose,
  
      date:
        trial.startDate,
  
      endDate:
        trial.completedDate,
  
      relationshipLabels,
  
      keywords:
        searchableValues([
          trial.title,
  
          trial.status,
  
          statusLabel,
  
          trial.result,
  
          resultLabel,
  
          trial.purpose,
  
          trial.question,
  
          trial.expectation,
  
          trial.whatIsChanging,
  
          trial.whatShouldStayComparable,
  
          trial.watchingFor,
  
          trial.conclusion,
  
          trial.nextTime,
  
          ...observationText,
  
          ...relationshipLabels,
  
          ...getDateSearchTerms(
            trial.startDate,
          ),
  
          ...getDateSearchTerms(
            trial.completedDate,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     GARDEN NOTE SEARCH ITEM
  ======================================= */
  
  function buildGardenNoteSearchItem(
    note:
      GardenNote,
  ):
    GlobalSearchItem {
    const relationshipLabels =
      (
        note.relationships ??
        []
      )
        .map(
          relationship =>
            relationship.label,
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    const title =
      note.title?.trim() ||
      note.body
        .split(
          /\r?\n/,
        )
        .map(
          line =>
            line.trim(),
        )
        .find(
          Boolean,
        ) ||
      'Garden Note'
  
  
    return {
      id:
        `note-${note.id}`,
  
      category:
        'notes',
  
      sourceType:
        'garden-note',
  
      sourceId:
        note.id,
  
      title,
  
      subtitle:
        note.origin ===
          'imported-text'
          ? 'Imported Garden Note'
          : 'Garden Note',
  
      description:
        note.body,
  
      date:
        note.noteDate ??
        note.createdAt,
  
      relationshipLabels,
  
      keywords:
        searchableValues([
          note.title,
  
          note.body,
  
          note.origin,
  
          note.originalBody,
  
          note.sourceLabel,
  
          note.sourceUrl,
  
          ...relationshipLabels,
  
          ...getDateSearchTerms(
            note.noteDate ??
            note.createdAt,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     PLANT REFERENCE SEARCH ITEM
  ======================================= */
  
  function buildPlantReferenceSearchItem(
    reference:
      PlantReference,
  ):
    GlobalSearchItem {
    const title =
      [
        reference.plantName,
        reference.variety,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        ) ||
      'Plant Reference'
  
  
    const relationshipLabels =
      (
        reference.relationships ??
        []
      )
        .map(
          relationship =>
            relationship.label,
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    return {
      id:
        `reference-${reference.id}`,
  
      category:
        'reference',
  
      sourceType:
        'plant-reference',
  
      sourceId:
        reference.id,
  
      title,
  
      subtitle:
        'Plant Reference',
  
      description:
        reference.notes,
  
      date:
        reference.referenceDate ??
        reference.createdAt,
  
      relationshipLabels,
  
      keywords:
        searchableValues([
          reference.plantName,
  
          reference.variety,
  
          ...(
            reference.aliases ??
            []
          ),
  
          reference.notes,
  
          ...relationshipLabels,
  
          ...getDateSearchTerms(
            reference.referenceDate ??
            reference.createdAt,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     SAVED TIP / SOURCE SEARCH ITEM
  ======================================= */
  
  function buildSavedSourceSearchItem(
    source:
      SavedKnowledgeSource,
  ):
    GlobalSearchItem {
    const relationshipLabels =
      (
        source.relationships ??
        []
      )
        .map(
          relationship =>
            relationship.label,
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    return {
      id:
        `source-${source.id}`,
  
      category:
        'sources',
  
      sourceType:
        'saved-source',
  
      sourceId:
        source.id,
  
      title:
        source.title,
  
      subtitle: [
        source.kind ===
          'other'
          ? source.customKindLabel ??
            'Saved source'
          : formatGlobalSearchLabel(
              source.kind,
            ),
  
        source.sourceName,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        ),
  
      description:
        source.excerpt ??
        source.notes,
  
      date:
        source.savedDate ??
        source.createdAt,
  
      relationshipLabels,
  
      keywords:
        searchableValues([
          source.title,
  
          source.kind,
  
          source.customKindLabel,
  
          source.sourceName,
  
          source.url,
  
          source.excerpt,
  
          source.notes,
  
          ...relationshipLabels,
  
          ...getDateSearchTerms(
            source.savedDate ??
            source.createdAt,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     COMPARISON SEARCH ITEM
  ======================================= */
  
  function buildComparisonSearchItem(
    gardenData:
      GardenData,
  
    comparison:
      SavedComparison,
  ):
    GlobalSearchItem {
    const relationshipLabels =
      comparison.items
        .map(
          item => {
            if (
              item.recordType ===
              'plant-story'
            ) {
              return getPlantLabel(
                findPlant(
                  gardenData,
                  item.recordId,
                ),
              )
            }
  
  
            if (
              item.recordType ===
              'growing-place'
            ) {
              return findGrowingPlace(
                gardenData,
                item.recordId,
              )?.name
            }
  
  
            return findGrowingSetup(
              gardenData,
              item.recordId,
            )?.name
          },
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(
              label,
            ),
        )
  
  
    return {
      id:
        `comparison-${comparison.id}`,
  
      category:
        'comparisons',
  
      sourceType:
        'comparison',
  
      sourceId:
        comparison.id,
  
      title:
        comparison.name,
  
      subtitle:
        `${comparison.items.length} ${
          comparison.items.length ===
          1
            ? 'record'
            : 'records'
        } compared`,
  
      relationshipLabels,
  
      keywords:
        searchableValues([
          comparison.name,
  
          ...relationshipLabels,
  
          ...getDateSearchTerms(
            comparison.createdAt,
          ),
        ]),
    }
  }
  
  
  /* =======================================
     CALENDAR SEARCH ITEM
  ======================================= */
  
  function getCalendarTimeLabel(
    timeType:
      CalendarTimeType,
  ):
    string {
    switch (
      timeType
    ) {
      case 'recorded':
        return 'Recorded'
  
      case 'expected':
        return 'Expected'
  
      case 'planned':
        return 'Planned'
  
      default:
        return 'Calendar'
    }
  }
  
  
  function buildCalendarSearchItem(
    item:
      CalendarItem,
  ):
    GlobalSearchItem {
    const dateTerms = [
      ...getDateSearchTerms(
        item.startDate,
      ),
  
      ...getDateSearchTerms(
        item.endDate,
      ),
    ]
  
  
    return {
      id:
        `calendar-${item.id}`,
  
      category:
        'calendar',
  
      sourceType:
        'calendar',
  
      sourceId:
        item.id,
  
      title:
        item.title,
  
      subtitle: [
        getCalendarTimeLabel(
          item.timeType,
        ),
  
        item.sourceLabel,
  
        item.contextLabel,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' · ',
        ) ||
        'Calendar',
  
      description:
        item.description,
  
      date:
        item.startDate,
  
      endDate:
        item.endDate,
  
      calendarDate:
        item.startDate,
  
      calendarSourceType:
        item.sourceType,
  
      calendarSourceId:
        item.sourceId,
  
      calendarPlantStoryIds: [
        ...(
          item.plantStoryIds ??
          []
        ),
      ],
  
      keywords:
        searchableValues([
          item.title,
  
          item.kind,
  
          item.timeType,
  
          item.sourceType,
  
          item.sourceLabel,
  
          item.contextLabel,
  
          item.description,
  
          ...dateTerms,
        ]),
    }
  }
  
  
  /* =======================================
     BUILD SEARCH INDEX
  ======================================= */
  
  export function buildGlobalSearchIndex(
    gardenData:
      GardenData,
  ):
    GlobalSearchItem[] {
    const plantItems =
      (
        gardenData
          .plantStories ??
        []
      ).map(
        plant =>
          buildPlantSearchItem(
            gardenData,
            plant,
          ),
      )
  
  
    const journalItems =
      (
        gardenData.events ??
        []
      ).map(
        event =>
          buildJournalSearchItem(
            gardenData,
            event,
          ),
      )
  
  
    const harvestItems =
      (
        gardenData.harvests ??
        []
      ).map(
        harvest =>
          buildHarvestSearchItem(
            gardenData,
            harvest,
          ),
      )
  
  
    const placeItems =
      (
        gardenData
          .growingPlaces ??
        []
      ).map(
        place =>
          buildGrowingPlaceSearchItem(
            gardenData,
            place,
          ),
      )
  
  
    const recipeItems =
      (
        gardenData
          .growingSetups ??
        []
      ).map(
        setup =>
          buildGrowingSetupSearchItem(
            gardenData,
            setup,
          ),
      )
  
  
    const ingredientItems =
      (
        gardenData
          .ingredients ??
        []
      ).map(
        ingredient =>
          buildIngredientSearchItem(
            gardenData,
            ingredient,
          ),
      )
  
  
    const productItems =
      (
        gardenData.products ??
        []
      ).map(
        product =>
          buildProductSearchItem(
            gardenData,
            product,
          ),
      )
  
  
    const purchaseItems =
      (
        gardenData.purchases ??
        []
      ).map(
        purchase =>
          buildPurchaseSearchItem(
            gardenData,
            purchase,
          ),
      )
  
  
    const planItems =
      (
        gardenData.plans ??
        []
      ).map(
        plan =>
          buildPlanSearchItem(
            gardenData,
            plan,
          ),
      )
  
  
    const trialItems =
      (
        gardenData
          .gardenTrials ??
        []
      ).map(
        buildGardenTrialSearchItem,
      )
  
  
    const noteItems =
      (
        gardenData
          .gardenNotes ??
        []
      ).map(
        buildGardenNoteSearchItem,
      )
  
  
    const referenceItems =
      (
        gardenData
          .plantReferences ??
        []
      ).map(
        buildPlantReferenceSearchItem,
      )
  
  
    const sourceItems =
      (
        gardenData
          .savedKnowledgeSources ??
        []
      ).map(
        buildSavedSourceSearchItem,
      )
  
  
    const comparisonItems =
      (
        gardenData
          .savedComparisons ??
        []
      ).map(
        comparison =>
          buildComparisonSearchItem(
            gardenData,
            comparison,
          ),
      )
  
  
    /*
     * Calendar remains derived.
     */
  
    const calendarItems =
      buildCalendarIndex(
        gardenData,
      ).map(
        buildCalendarSearchItem,
      )
  
  
    return [
      ...plantItems,
  
      ...journalItems,
  
      ...harvestItems,
  
      ...calendarItems,
  
      ...placeItems,
  
      ...recipeItems,
  
      ...ingredientItems,
  
      ...productItems,
  
      ...purchaseItems,
  
      ...planItems,
  
      ...trialItems,
  
      ...noteItems,
  
      ...referenceItems,
  
      ...sourceItems,
  
      ...comparisonItems,
    ]
  }
  
  
  /* =======================================
     SEARCH HAYSTACK
  ======================================= */
  
  function buildSearchHaystack(
    item:
      GlobalSearchItem,
  ):
    string {
    return normaliseSearchText(
      [
        item.title,
  
        item.subtitle,
  
        item.description,
  
        item.date,
  
        item.endDate,
  
        ...(
          item
            .relationshipLabels ??
          []
        ),
  
        ...item.keywords,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' ',
        ),
    )
  }
  
  
  /* =======================================
     SCORE SEARCH ITEM
  ======================================= */
  
  function scoreGlobalSearchItem(
    item:
      GlobalSearchItem,
  
    rawQuery:
      string,
  ):
    number {
    const query =
      normaliseSearchText(
        rawQuery,
      )
  
  
    if (
      !query
    ) {
      return 0
    }
  
  
    const tokens =
      query
        .split(
          ' ',
        )
        .filter(
          Boolean,
        )
  
  
    if (
      tokens.length ===
      0
    ) {
      return 0
    }
  
  
    const title =
      normaliseSearchText(
        item.title,
      )
  
  
    const subtitle =
      normaliseSearchText(
        item.subtitle,
      )
  
  
    const description =
      normaliseSearchText(
        item.description,
      )
  
  
    const relationships =
      normaliseSearchText(
        (
          item
            .relationshipLabels ??
          []
        ).join(
          ' ',
        ),
      )
  
  
    const keywordText =
      normaliseSearchText(
        item.keywords.join(
          ' ',
        ),
      )
  
  
    const haystack =
      buildSearchHaystack(
        item,
      )
  
  
    const allTokensMatch =
      tokens.every(
        token =>
          haystack.includes(
            token,
          ),
      )
  
  
    if (
      !allTokensMatch
    ) {
      return 0
    }
  
  
    let score =
      10
  
  
    if (
      title ===
      query
    ) {
      score +=
        180
    }
  
  
    if (
      title.startsWith(
        query,
      )
    ) {
      score +=
        120
    }
  
  
    if (
      title.includes(
        query,
      )
    ) {
      score +=
        90
    }
  
  
    if (
      subtitle.includes(
        query,
      )
    ) {
      score +=
        45
    }
  
  
    if (
      relationships.includes(
        query,
      )
    ) {
      score +=
        35
    }
  
  
    if (
      description.includes(
        query,
      )
    ) {
      score +=
        25
    }
  
  
    if (
      keywordText.includes(
        query,
      )
    ) {
      score +=
        20
    }
  
  
    tokens.forEach(
      token => {
        if (
          title ===
          token
        ) {
          score +=
            40
  
          return
        }
  
  
        if (
          title.startsWith(
            token,
          )
        ) {
          score +=
            28
        }
  
  
        if (
          title.includes(
            token,
          )
        ) {
          score +=
            22
        }
  
  
        if (
          subtitle.includes(
            token,
          )
        ) {
          score +=
            12
        }
  
  
        if (
          relationships.includes(
            token,
          )
        ) {
          score +=
            10
        }
  
  
        if (
          description.includes(
            token,
          )
        ) {
          score +=
            7
        }
  
  
        if (
          keywordText.includes(
            token,
          )
        ) {
          score +=
            5
        }
      },
    )
  
  
    /*
     * Prefer real source records over a
     * Calendar manifestation when both match.
     */
  
    if (
      item.category !==
      'calendar'
    ) {
      score +=
        3
    }
  
  
    return score
  }
  
  
  /* =======================================
     SEARCH
  ======================================= */
  
  export function searchGlobalSearchIndex(
    items:
      GlobalSearchItem[],
  
    query:
      string,
  
    categories:
      GlobalSearchCategory[] =
      ALL_GLOBAL_SEARCH_CATEGORIES,
  ):
    GlobalSearchItem[] {
    const cleanedQuery =
      query.trim()
  
  
    if (
      !cleanedQuery
    ) {
      return []
    }
  
  
    const categorySet =
      new Set(
        categories,
      )
  
  
    return items
      .filter(
        item =>
          categorySet.has(
            item.category,
          ),
      )
      .map(
        item => ({
          ...item,
  
          score:
            scoreGlobalSearchItem(
              item,
              cleanedQuery,
            ),
        }),
      )
      .filter(
        item =>
          (
            item.score ??
            0
          ) >
          0,
      )
      .sort(
        (
          first,
          second,
        ) => {
          const scoreDifference =
            (
              second.score ??
              0
            ) -
            (
              first.score ??
              0
            )
  
  
          if (
            scoreDifference !==
            0
          ) {
            return scoreDifference
          }
  
  
          const dateDifference =
            (
              second.date ??
              ''
            ).localeCompare(
              first.date ??
              '',
            )
  
  
          if (
            dateDifference !==
            0
          ) {
            return dateDifference
          }
  
  
          return first
            .title
            .localeCompare(
              second.title,
            )
        },
      )
  }
  
  
  /* =======================================
     RESULT COUNTS
  ======================================= */
  
  export function getGlobalSearchCategoryCounts(
    items:
      GlobalSearchItem[],
  ):
    Record<
      GlobalSearchCategory,
      number
    > {
    const counts:
      Record<
        GlobalSearchCategory,
        number
      > = {
        plants: 0,
  
        journal: 0,
  
        harvests: 0,
  
        calendar: 0,
  
        places: 0,
  
        recipes: 0,
  
        ingredients: 0,
  
        products: 0,
  
        purchases: 0,
  
        plans: 0,
  
        trials: 0,
  
        notes: 0,
  
        reference: 0,
  
        sources: 0,
  
        comparisons: 0,
      }
  
  
    items.forEach(
      item => {
        counts[
          item.category
        ] +=
          1
      },
    )
  
  
    return counts
  }
  
  
  /* =======================================
     GROUP SEARCH RESULTS
  ======================================= */
  
  export interface GlobalSearchResultGroup {
    category:
      GlobalSearchCategory
  
    label:
      string
  
    icon:
      string
  
    items:
      GlobalSearchItem[]
  }
  
  
  export function groupGlobalSearchResults(
    results:
      GlobalSearchItem[],
  ):
    GlobalSearchResultGroup[] {
    return GLOBAL_SEARCH_CATEGORIES
      .map(
        category => ({
          category:
            category.id,
  
          label:
            category.label,
  
          icon:
            category.icon,
  
          items:
            results.filter(
              result =>
                result.category ===
                category.id,
            ),
        }),
      )
      .filter(
        group =>
          group.items.length >
          0,
      )
  }
  
  
  /* =======================================
     DATE RANGE LABEL
  ======================================= */
  
  export function getGlobalSearchDateLabel(
    item:
      GlobalSearchItem,
  ):
    string |
    undefined {
    if (
      !item.date
    ) {
      return undefined
    }
  
  
    if (
      item.endDate &&
      item.endDate !==
        item.date
    ) {
      return `${formatGlobalSearchDate(
        item.date,
      )} to ${formatGlobalSearchDate(
        item.endDate,
      )}`
    }
  
  
    return formatGlobalSearchDate(
      item.date,
    )
  }
  
  
  /* =======================================
     RESULT OPEN LABEL
  ======================================= */
  
  export function getGlobalSearchOpenLabel(
    item:
      GlobalSearchItem,
  ):
    string {
    switch (
      item.sourceType
    ) {
      case 'plant-story':
        return 'Open Plant Story'
  
      case 'garden-event':
        return 'Open Journal entry'
  
      case 'harvest':
        return 'Open Harvest'
  
      case 'calendar':
        return 'See this day in Calendar'
  
      case 'growing-place':
        return 'Open Growing Place'
  
      case 'growing-setup':
        return 'Open Growing Recipe'
  
      case 'ingredient':
        return 'Open Ingredient'
  
      case 'product':
        return 'Open Product'
  
      case 'purchase':
        return 'Open Purchase'
  
      case 'plan':
        return 'Open Garden Plan'
  
      case 'garden-trial':
        return 'Open Garden Trial'
  
      case 'garden-note':
        return 'Open Garden Note'
  
      case 'plant-reference':
        return 'Open Plant Reference'
  
      case 'saved-source':
        return 'Open Saved Tip / Source'
  
      case 'comparison':
        return 'Open Comparison'
  
      default:
        return 'Open'
    }
  }