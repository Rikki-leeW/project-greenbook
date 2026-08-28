/* =======================================
   PLANT STATUS
======================================= */

export type PlantStatus =
  | 'planned'
  | 'growing'
  | 'harvesting'
  | 'finished'
  | 'failed'


/* =======================================
   GROWING PLACES
======================================= */

export type GrowingPlaceKind =
  | 'garden-area'
  | 'garden-bed'
  | 'raised-bed'
  | 'pot'
  | 'grow-bag'
  | 'planter-box'
  | 'greenhouse'
  | 'cold-frame'
  | 'shade-house'
  | 'deck'
  | 'patio'
  | 'balcony'
  | 'courtyard'
  | 'grass-area'
  | 'retaining-wall'
  | 'rock-wall'
  | 'orchard'
  | 'food-forest'
  | 'herb-garden'
  | 'flower-garden'
  | 'vine'
  | 'compost-area'
  | 'nursery-area'
  | 'indoor'
  | 'windowsill'
  | 'other'


/* =======================================
   GROWING GROUND TYPES
======================================= */

/*
 * These remain internal building blocks for
 * Growing Setup records.
 *
 * The user-facing wording throughout Sprig
 * should be "Growing Setup".
 */

export type GrowingGroundType =
  | 'my-own-blend'
  | 'potting-mix'
  | 'top-soil'
  | 'seed-raising-mix'
  | 'native-soil'
  | 'native-clay'
  | 'loam'
  | 'sandy-soil'
  | 'rocky-soil'
  | 'peat-soil'
  | 'raised-bed-mix'
  | 'compost-based-mix'
  | 'soilless-mix'
  | 'hugelkultur'
  | 'layered-bed'
  | 'imported-topsoil'
  | 'coco-coir'
  | 'peat-moss'
  | 'sphagnum-moss'
  | 'pine-needles'
  | 'straw'
  | 'hydroponic'
  | 'aquaponic'
  | 'homemade-blend'
  | 'something-else'
  | 'not-sure'


export type GrowingGroundMethod =
  | 'existing-ground'
  | 'dug-and-improved'
  | 'no-dig'
  | 'layered-bed'
  | 'hugelkultur'
  | 'filled-raised-bed'
  | 'container-mix'
  | 'seed-raising-mix'
  | 'wicking-bed'
  | 'hydroponic'
  | 'aquaponic'
  | 'kratky'
  | 'nft'
  | 'deep-water-culture'
  | 'ebb-and-flow'
  | 'aeroponic'
  | 'custom-blend'
  | 'something-else'


/* =======================================
   GROWING PLACE CONDITIONS
======================================= */

export type GardenAspect =
  | 'north'
  | 'north-east'
  | 'east'
  | 'south-east'
  | 'south'
  | 'south-west'
  | 'west'
  | 'north-west'


export type SunlightLevel =
  | 'full-sun'
  | 'mostly-sun'
  | 'part-sun'
  | 'dappled-light'
  | 'mostly-shade'
  | 'deep-shade'


export type ShelterLevel =
  | 'very-exposed'
  | 'some-shelter'
  | 'well-sheltered'
  | 'fully-protected'
  | 'changes-with-season'
  | 'not-sure'


/* =======================================
   INGREDIENTS
======================================= */

export type IngredientCategory =
  | 'compost'
  | 'manure'
  | 'organic-matter'
  | 'minerals'
  | 'aeration'
  | 'water-retention'
  | 'amendments'
  | 'fertiliser'
  | 'biological-additives'
  | 'ph-adjusters'
  | 'structure-bulk'
  | 'growing-medium'
  | 'mulch'
  | 'other'


export interface Ingredient {
  id: string
  name: string
  category?: IngredientCategory
  customCategoryLabel?: string
  manufacturer?: string
  source?: string
  notes?: string
  photoUrls?: string[]
  isFavourite?: boolean
  rating?: 1 | 2 | 3 | 4 | 5
  isArchived?: boolean
  archivedAt?: string
  createdAt: string
  updatedAt?: string
}


/* =======================================
   GARDEN PRODUCTS
======================================= */

export type GardenProductCategory =
  | 'fertiliser'
  | 'soil-conditioner'
  | 'wetting-agent'
  | 'pest-treatment'
  | 'disease-treatment'
  | 'weed-treatment'
  | 'biological-treatment'
  | 'root-treatment'
  | 'plant-tonic'
  | 'growing-medium'
  | 'mulch'
  | 'seed-treatment'
  | 'cleaning-product'
  | 'other'


export interface GardenProduct {
  id: string
  name: string
  category?: GardenProductCategory
  customCategoryLabel?: string
  brand?: string
  productName?: string
  notes?: string
  photoUrls?: string[]
  isFavourite?: boolean
  rating?: 1 | 2 | 3 | 4 | 5
  isArchived?: boolean
  archivedAt?: string
  createdAt: string
  updatedAt?: string
}


/* =======================================
   GROWING SETUPS
======================================= */

export type GrowingSetupCategory =
  | 'own-mix'
  | 'bought-mix'
  | 'ground-type'
  | 'growing-system'


export interface GrowingSetup {
  id: string
  name: string
  category: GrowingSetupCategory
  basedOnRecipeId?: string
  isFavourite?: boolean
  rating?: 1 | 2 | 3 | 4 | 5
  isArchived?: boolean
  archivedAt?: string

  /*
   * Legacy ingredient links.
   */
  ingredientIds?: string[]

  recipeComponents?: Array<{
    sourceType:
      | 'ingredient'
      | 'product'
      | 'growing-setup'

    sourceId: string

    quantity?: number

    unit?:
      | 'part'
      | 'litre'
      | 'millilitre'
      | 'kilogram'
      | 'gram'
      | 'handful'
      | 'scoop'
      | 'other'

    customUnitLabel?: string
  }>

  brand?: string
  productName?: string
  groundType?: GrowingGroundType
  growingSystemType?: GrowingGroundMethod
  notes?: string
  photoUrls?: string[]
  createdAt: string
  updatedAt?: string
}


/* =======================================
   GROWING PLACE RECORD
======================================= */

export interface GrowingPlace {
  id: string
  name: string
  kind: GrowingPlaceKind
  customKindLabel?: string
  growingSetupId?: string
  aspect?: GardenAspect
  sunlight?: SunlightLevel
  shelter?: ShelterLevel
  notes?: string
  photoUrls?: string[]
  createdAt: string
  updatedAt?: string
}


/* =======================================
   PURCHASES AND COSTS
======================================= */

export type PurchaseItemType =
  | 'ingredient'
  | 'growing-setup'
  | 'plant'
  | 'seed'
  | 'seedling'
  | 'fertiliser'
  | 'product'
  | 'container'
  | 'equipment'
  | 'other'


export type PurchaseUnit =
  | 'each'
  | 'packet'
  | 'bag'
  | 'box'
  | 'tray'
  | 'litre'
  | 'millilitre'
  | 'kilogram'
  | 'gram'
  | 'metre'
  | 'other'


export interface PurchaseRecord {
  id: string
  itemType: PurchaseItemType
  itemId?: string
  itemName: string
  date: string
  supplier?: string
  brand?: string
  pricePaid: number
  currency?: string
  quantity?: number
  unit?: PurchaseUnit
  packageSize?: number
  packageUnit?: PurchaseUnit
  reusable?: boolean
  expectedUses?: number
  notes?: string
  photoUrls?: string[]
  createdAt: string
  updatedAt?: string
}


/* =======================================
   COST ALLOCATIONS
======================================= */

export type CostAllocationTargetType =
  | 'plant'
  | 'growing-setup'
  | 'growing-place'
  | 'harvest'
  | 'garden-trial'
  | 'other'


export interface CostAllocation {
  id: string
  purchaseId: string
  targetType: CostAllocationTargetType
  targetId: string
  quantityUsed?: number
  unit?: PurchaseUnit
  allocatedCost?: number
  notes?: string
  createdAt: string
  updatedAt?: string
}


/* =======================================
   PLANT STORIES
======================================= */

export type StartMethod =
  | 'seed'
  | 'seedling'
  | 'cutting'
  | 'sucker'
  | 'seed-potato'
  | 'tuber'
  | 'bulb'
  | 'rhizome'
  | 'division'
  | 'bought-plant'
  | 'other'


/* =======================================
   PLANT ORIGIN
======================================= */

export type PlantOriginType =
  | 'bought'
  | 'saved-from-garden'
  | 'propagated-from-plant'
  | 'gifted'
  | 'swapped'
  | 'found-or-existing'
  | 'unknown'
  | 'other'


/* =======================================
   LEGACY GROWING SPACES
======================================= */

export type GrowingSpaceType =
  | 'garden-bed'
  | 'in-ground'
  | 'pot'
  | 'grow-bag'
  | 'greenhouse'
  | 'hanging-basket'
  | 'indoor'
  | 'other'


export interface GrowingSpace {
  id: string
  name: string
  type: GrowingSpaceType
  notes?: string
}


/* =======================================
   PLANT GROWING HISTORY
======================================= */

export interface PlantGrowingHistoryEntry {
  id: string
  startedDate: string
  endedDate?: string
  growingPlaceId?: string
  growingSetupId?: string
  gardenEventId?: string
  notes?: string
}


/* =======================================
   PLANT STORY RECORD
======================================= */

export interface PlantStory {
  id: string

  plantName: string
  variety?: string
  displayName: string
  personality?: string

  basedOnPlantStoryId?: string
  isFavourite?: boolean
  isArchived?: boolean
  archivedAt?: string
  completedAt?: string
  updatedAt?: string

  quantity?: number
  startMethod: StartMethod
  customStartMethodLabel?: string

  sownDate?: string
  plantedDate: string
  plantedOutDate?: string
  enteredDate: string

  originType?: PlantOriginType
  source?: string
  originPurchaseId?: string
  originPlantStoryId?: string
  customOriginLabel?: string

  status: PlantStatus

  currentGrowingSpaceId?: string
  previousGrowingSpaceIds?: string[]

  currentGrowingSetupId?: string
  previousGrowingSetupIds?: string[]

  currentGrowingPlaceId?: string
  previousGrowingPlaceIds?: string[]

  growingHistory?: PlantGrowingHistoryEntry[]

  notes?: string
  photoUrls?: string[]
  photoDates?: Array<string | undefined>

  /*
   * =======================================
   * HARVEST EXPECTATION
   * =======================================
   */

  expectedHarvestDaysMin?: number
  expectedHarvestDaysMax?: number

  /*
   * =======================================
   * HARVEST TIMING REFERENCE
   * =======================================
   */

  harvestTimingReference?: {
    sourceType:
      | 'sown'
      | 'planted'
      | 'planted-out'
      | 'purchased'
      | 'garden-event'
      | 'custom-date'

    eventId?: string
    customDate?: string
    customLabel?: string
  }

  tags?: string[]
}


/* =======================================
   JOURNAL AND GARDEN EVENTS
======================================= */

export type EventType =
  | 'planted'
  | 'sprouted'
  | 'watered'
  | 'fed'
  | 'moved'
  | 'hilled'
  | 'pruned'
  | 'treated'
  | 'weather'
  | 'observation'
  | 'photo'
  | 'harvest'
  | 'note'


export type GrowingPlaceScope =
  | 'none'
  | 'single'
  | 'multiple'
  | 'entire-garden'


export type PlantScope =
  | 'none'
  | 'single'
  | 'multiple'
  | 'category'
  | 'all-plants'


export interface GardenEvent {
  id: string
  date: string
  type: EventType
  activityTypes?: EventType[]
  title: string
  notes?: string
  productUsed?: string
  photoUrls?: string[]
  growingPlaceScope?: GrowingPlaceScope
  growingPlaceIds?: string[]
  plantScope?: PlantScope
  plantStoryIds: string[]
  plantCategory?: string
}


/* =======================================
   HARVEST RECORDS
======================================= */

export type HarvestType =
  | 'first'
  | 'regular'
  | 'main'
  | 'secondary'
  | 'final'
  | 'other'


export type HarvestQuality =
  | 'poor'
  | 'fair'
  | 'good'
  | 'excellent'


export type HarvestPlantOutcome =
  | 'still-producing'
  | 'more-expected'
  | 'main-harvest-complete'
  | 'finished'
  | 'no-change'
  | 'not-sure'
  | 'other'


export type HarvestMeasurementUnit =
  | 'gram'
  | 'kilogram'
  | 'millilitre'
  | 'litre'
  | 'bunch'
  | 'handful'
  | 'basket'
  | 'container'
  | 'other'


export interface HarvestRecord {
  id: string
  plantStoryIds: string[]
  date: string
  harvestType?: HarvestType
  customHarvestTypeLabel?: string
  count?: number
  measurementAmount?: number
  measurementUnit?: HarvestMeasurementUnit
  customMeasurementUnitLabel?: string
  plantOutcome?: HarvestPlantOutcome
  customPlantOutcomeLabel?: string
  quality?: HarvestQuality
  notes?: string
  photoUrls?: string[]
  createdAt: string
  updatedAt?: string
}


/* =======================================
   GARDEN PLANS
======================================= */

/*
 * A Garden Plan records intention.
 *
 * It does NOT record something that has
 * already happened.
 *
 * Real garden history belongs to real Sprig
 * records:
 *
 * Plant Story
 * Garden Event
 * Harvest
 * Purchase
 * Growing Journey
 *
 * When a Plan eventually happens, Sprig can
 * use the Plan to PREFILL the appropriate
 * real record.
 *
 * The Plan then remains as evidence of what
 * was originally intended.
 */


/* =======================================
   PLAN KIND
======================================= */

export type GardenPlanKind =
  | 'sow'
  | 'plant'
  | 'plant-out'
  | 'move'
  | 'feed'
  | 'treat'
  | 'harvest'
  | 'buy'
  | 'garden-task'
  | 'other'


/* =======================================
   PLAN STATUS
======================================= */

export type GardenPlanStatus =
  | 'planned'
  | 'recorded'
  | 'not-done'


/* =======================================
   FUTURE PLANT DETAILS
======================================= */

/*
 * This describes something that MAY become
 * a Plant Story later.
 *
 * It is deliberately not a miniature
 * PlantStory record.
 */

export interface PlannedPlantDetails {
  plantName?: string
  variety?: string
  quantity?: number
  startMethod?: StartMethod
  customStartMethodLabel?: string
}


/* =======================================
   PLAN TIMING
======================================= */

/*
 * A Garden Plan may contain a timing
 * assumption.
 *
 * This is NOT a saved predicted harvest date.
 *
 * It records only the knowledge Sprig needs
 * to calculate a possibility from the Plan.
 *
 * Example:
 *
 * "I am planning to sow Royal Blue potatoes
 *  on 5 September."
 *
 * "I currently expect them to take
 *  90 to 110 days from planting."
 *
 * Sprig can derive the possible harvest
 * window whenever the Plan is viewed.
 *
 * If the intended date changes, the
 * projection changes automatically.
 *
 * This structure belongs to the PLAN rather
 * than PlannedPlantDetails because a
 * Plant-out Plan can refer to an existing
 * Plant Story and still need a future timing
 * calculation.
 */

export type GardenPlanTimingReference =
  | 'sown'
  | 'planted'
  | 'planted-out'


export type GardenPlanTimingKnowledgeSource =
  | 'gardener'
  | 'sprig-history'
  | 'reference'
  | 'unknown'


export interface GardenPlanTimingAssumption {
  /*
   * Which intended milestone starts the
   * timing clock?
   */
  referenceType:
    GardenPlanTimingReference

  /*
   * The expected number of days after that
   * milestone.
   *
   * Either edge may be omitted.
   */
  daysMin?: number
  daysMax?: number

  /*
   * Where Sprig got these numbers.
   *
   * Right now Calendar-created assumptions
   * are gardener supplied.
   *
   * Later the same structure can hold timing
   * derived from the gardener's own history.
   */
  knowledgeSource?:
    GardenPlanTimingKnowledgeSource

  /*
   * Used later when Sprig derives timing from
   * historical Plant Stories.
   */
  evidenceCount?: number
}


/* =======================================
   PLAN RESULT
======================================= */

export type GardenPlanResultRecordType =
  | 'plant-story'
  | 'garden-event'
  | 'harvest'
  | 'purchase'


export interface GardenPlanResult {
  recordType:
    GardenPlanResultRecordType

  recordId:
    string

  recordedAt:
    string
}


/* =======================================
   GARDEN PLAN RECORD
======================================= */

export interface GardenPlan {
  id: string

  /* =======================================
     WHAT IS INTENDED
  ======================================= */

  title: string

  kind:
    GardenPlanKind

  customKindLabel?: string

  notes?: string

  /* =======================================
     WHEN IT IS INTENDED
  ======================================= */

  date: string

  endDate?: string

  /* =======================================
     EXISTING SPRIG RECORDS
  ======================================= */

  plantStoryIds?: string[]
  growingPlaceIds?: string[]
  growingSetupIds?: string[]

  /* =======================================
     SOMETHING THAT MAY EXIST LATER
  ======================================= */

  plannedPlant?: PlannedPlantDetails

  /* =======================================
     WHAT MAY FOLLOW
  ======================================= */

  /*
   * Optional assumptions used to derive
   * future timing from this Plan.
   *
   * We deliberately save the assumptions,
   * not the calculated dates.
   */
  timingAssumption?:
    GardenPlanTimingAssumption

  /* =======================================
     PLAN LIFE
  ======================================= */

  status:
    GardenPlanStatus

  results?: GardenPlanResult[]

  /* =======================================
     RECORD MANAGEMENT
  ======================================= */

  createdAt: string

  updatedAt?: string
}


/* =======================================
   SAVED COMPARISONS
======================================= */

export type ComparisonRecordType =
  | 'plant-story'
  | 'growing-place'
  | 'growing-setup'


export interface ComparisonItem {
  recordType:
    ComparisonRecordType

  recordId:
    string
}


export interface SavedComparison {
  id: string
  name: string
  items: ComparisonItem[]
  createdAt: string
  updatedAt?: string
}


/* =======================================
   COMPLETE SAVED GARDEN
======================================= */

export interface GardenData {
  plantStories: PlantStory[]

  /*
   * Legacy collection.
   */
  growingSpaces: GrowingSpace[]

  /*
   * Current location system.
   */
  growingPlaces: GrowingPlace[]

  /*
   * Reusable Growing Setup library.
   */
  growingSetups: GrowingSetup[]

  /*
   * Reusable Ingredient library.
   */
  ingredients: Ingredient[]

  /*
   * Reusable Product library.
   */
  products: GardenProduct[]

  /*
   * Purchase history.
   */
  purchases: PurchaseRecord[]

  /*
   * Connects portions of purchases to the
   * places, plants and setups that consumed
   * them.
   */
  costAllocations: CostAllocation[]

  events: GardenEvent[]

  harvests: HarvestRecord[]

  /*
   * Future intentions belonging to the
   * Calendar and planning system.
   */
  plans: GardenPlan[]

  savedComparisons: SavedComparison[]
}