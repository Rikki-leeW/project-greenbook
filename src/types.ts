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

  ingredientIds?: string[]

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

/*
 * Describes WHERE the plant material came
 * from before this Plant Story began.
 *
 * This is deliberately separate from
 * StartMethod.
 *
 * Examples:
 *
 * Royal Blue:
 * startMethod = 'seed-potato'
 * originType = 'bought'
 * source = 'Bunnings'
 *
 * Saved tomato seed:
 * startMethod = 'seed'
 * originType = 'saved-from-garden'
 *
 * Rosemary cutting from another plant:
 * startMethod = 'cutting'
 * originType = 'propagated-from-plant'
 *
 * Seedling given by a friend:
 * startMethod = 'seedling'
 * originType = 'gifted'
 */
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
   PLANT STORY RECORD
======================================= */

export interface PlantStory {
  id: string

  /*
   * =======================================
   * WHAT IS GROWING
   * =======================================
   */

  /*
   * The TYPE of plant.
   *
   * Examples:
   * Potato
   * Tomato
   * Broccoli
   * Lettuce
   * Thyme
   */
  plantName: string

  /*
   * The variety or cultivar.
   *
   * Examples:
   * Royal Blue
   * Mortgage Lifter
   *
   * Optional because the gardener may
   * genuinely not know.
   */
  variety?: string

  displayName: string

  personality?: string


  /*
   * =======================================
   * RECORD MANAGEMENT
   * =======================================
   */

  /*
   * A variation can remember which Plant
   * Story it was based on.
   */
  basedOnPlantStoryId?: string

  isFavourite?: boolean

  isArchived?: boolean

  archivedAt?: string

  /*
   * Normal completion is different from
   * archiving or deleting.
   */
  completedAt?: string

  updatedAt?: string


  /*
   * =======================================
   * HOW THIS STORY BEGAN
   * =======================================
   */

  /*
   * Number of plants or starting pieces
   * represented by this Plant Story.
   *
   * Examples:
   * 3 seed potatoes
   * 6 broccoli seedlings
   * 1 tomato seedling
   */
  quantity?: number

  startMethod: StartMethod

  /*
   * Sprig's lists are never closed.
   *
   * If startMethod is 'other', the gardener
   * can retain their own description here.
   */
  customStartMethodLabel?: string


  /*
   * =======================================
   * BEGINNING DATES
   * =======================================
   */

  /*
   * Date seed was originally sown,
   * when relevant.
   */
  sownDate?: string

  /*
   * The primary beginning date currently
   * used throughout Sprig.
   *
   * Existing Plant Stories rely on this,
   * so it remains required.
   */
  plantedDate: string

  /*
   * For plants started earlier from seed,
   * this can record when they eventually
   * moved into their planted-out location.
   */
  plantedOutDate?: string

  /*
   * When the Plant Story was entered into
   * Sprig. This is different from when the
   * growing story actually began.
   */
  enteredDate: string


  /*
   * =======================================
   * WHERE DID IT COME FROM?
   * =======================================
   */

  /*
   * Describes the origin of the plant
   * material.
   *
   * Examples:
   * bought
   * gifted
   * saved from the garden
   * propagated from another plant
   */
  originType?: PlantOriginType

  /*
   * Human-readable source.
   *
   * This intentionally remains useful even
   * without a formal Purchase record.
   *
   * Examples:
   * Bunnings
   * Mr Fothergill's
   * Local nursery
   * Hayley's garden
   * Saved from 2025 Mortgage Lifter
   */
  source?: string

  /*
   * Optional connection to the Purchase
   * record from which this plant material
   * came.
   *
   * This lets Add Plant work NOW with a
   * simple source such as "Bunnings", while
   * allowing Accountant Sprig to connect the
   * exact purchase later.
   */
  originPurchaseId?: string

  /*
   * Optional connection to another Plant
   * Story when this plant was propagated
   * from something already growing in Sprig.
   *
   * Example:
   * a thyme cutting taken from an existing
   * thyme Plant Story.
   */
  originPlantStoryId?: string

  /*
   * If originType is 'other', the gardener's
   * own wording can live here.
   */
  customOriginLabel?: string


  /*
   * =======================================
   * CURRENT STATUS
   * =======================================
   */

  status: PlantStatus


  /*
   * =======================================
   * LEGACY GROWING SPACE
   * =======================================
   */

  currentGrowingSpaceId?: string
  previousGrowingSpaceIds?: string[]


  /*
   * =======================================
   * GROWING SETUP
   * =======================================
   */

  currentGrowingSetupId?: string
  previousGrowingSetupIds?: string[]


  /*
   * =======================================
   * GROWING PLACE
   * =======================================
   */

  currentGrowingPlaceId?: string
  previousGrowingPlaceIds?: string[]


  /*
   * =======================================
   * NOTES AND PHOTOGRAPHS
   * =======================================
   */

  notes?: string

  photoUrls?: string[]


    /*
   * =======================================
   * HARVEST EXPECTATION
   * =======================================
   */

  /*
   * The expected number of days until
   * harvest.
   *
   * These values describe the expected
   * window itself. The reference below
   * tells Sprig which real date that
   * countdown should begin from.
   */
  expectedHarvestDaysMin?: number
  expectedHarvestDaysMax?: number

  /*
   * =======================================
   * HARVEST TIMING REFERENCE
   * =======================================
   */

  /*
   * Tells Sprig where to begin counting
   * the expected harvest window.
   *
   * Examples:
   *
   * Sown:
   * sourceType = 'sown'
   *
   * Planted out:
   * sourceType = 'planted-out'
   *
   * A particular transplant recorded in
   * the Journal:
   * sourceType = 'garden-event'
   * eventId = that Garden Event's id
   *
   * A date the gardener knows but did not
   * previously record:
   * sourceType = 'custom-date'
   * customDate = that date
   *
   * This structure also gives the future
   * Sprig calendar a stable connection to
   * real dated garden milestones.
   */
  harvestTimingReference?: {
    sourceType:
      | 'sown'
      | 'planted'
      | 'planted-out'
      | 'purchased'
      | 'garden-event'
      | 'custom-date'

    /*
     * Used when the reference is a specific
     * Garden Event, such as a transplant,
     * move or other meaningful milestone.
     */
    eventId?: string

    /*
     * Used when the gardener chooses
     * "Use another date".
     */
    customDate?: string

    /*
     * Optional gardener wording for a
     * custom date.
     *
     * Examples:
     * "Recovered after illness"
     * "Approximate transplant date"
     */
    customLabel?: string
  }

  /*
   * =======================================
   * ORGANISATION
   * =======================================
   */

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

/*
 * A Harvest Record represents ONE occasion
 * when something was gathered from the
 * garden.
 *
 * A Plant Story may therefore have no
 * Harvest Records, one Harvest Record, or
 * many Harvest Records over its lifetime.
 *
 * Examples:
 *
 * Tomato:
 * many repeated pickings
 *
 * Potato:
 * usually one main/final harvest
 *
 * Broccoli:
 * main head followed by later side shoots
 *
 * Herbs:
 * repeated cuttings over a long period
 */

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

  /*
   * =======================================
   * WHAT WAS HARVESTED
   * =======================================
   */

  /*
   * Usually this will contain one Plant
   * Story.
   *
   * Multiple Plant Stories are allowed for
   * occasions where produce was gathered
   * together and cannot sensibly be divided.
   */
  plantStoryIds: string[]

  /*
   * =======================================
   * WHEN
   * =======================================
   */

  date: string


  /*
   * =======================================
   * HARVEST TYPE
   * =======================================
   */

  /*
   * Describes this harvest's place in the
   * growing story rather than the crop
   * itself.
   *
   * Examples:
   * first picking
   * regular picking
   * main harvest
   * secondary harvest
   * final harvest
   */
  harvestType?: HarvestType

  /*
   * Sprig's lists are never closed.
   *
   * Examples:
   * side shoots
   * baby leaves
   * seed harvest
   */
  customHarvestTypeLabel?: string


  /*
   * =======================================
   * HOW MUCH
   * =======================================
   */

  /*
   * Count and measured quantity may BOTH be
   * recorded.
   *
   * Example:
   * 4 tomatoes weighing 820 grams.
   */
  count?: number

  /*
   * A flexible measurement for harvests
   * where weight, volume or another useful
   * garden measure is recorded.
   */
  measurementAmount?: number

  measurementUnit?: HarvestMeasurementUnit

  /*
   * If measurementUnit is 'other', retain
   * the gardener's own wording here.
   */
  customMeasurementUnitLabel?: string


  /*
   * =======================================
   * WHAT HAPPENS NEXT
   * =======================================
   */

  /*
   * Records what this particular harvest
   * means for the plant's ongoing story.
   *
   * This does not automatically replace the
   * Plant Story status. The app can decide
   * when to offer or apply a status change.
   */
  plantOutcome?: HarvestPlantOutcome

  customPlantOutcomeLabel?: string


  /*
   * =======================================
   * EXPERIENCE
   * =======================================
   */

  quality?: HarvestQuality

  notes?: string

  photoUrls?: string[]


  /*
   * =======================================
   * RECORD MANAGEMENT
   * =======================================
   */

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
}