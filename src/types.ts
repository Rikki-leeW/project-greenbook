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
  | 'greenhouse'
  | 'compost-area'
  | 'indoor'
  | 'other'

export interface GrowingPlace {
  id: string
  name: string
  kind: GrowingPlaceKind
  notes?: string
  createdAt: string
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

export interface PlantStory {
  id: string

  plantName: string
  variety?: string
  displayName: string
  personality?: string

  quantity?: number
  startMethod: StartMethod

  sownDate?: string
  plantedDate: string
  plantedOutDate?: string
  enteredDate: string

  status: PlantStatus

  /*
   * Legacy Growing Space fields.
   * Keep these until all existing plants have
   * been migrated to Growing Places.
   */
  currentGrowingSpaceId?: string
  previousGrowingSpaceIds?: string[]

  /*
   * New Growing Place connection.
   */
  currentGrowingPlaceId?: string
  previousGrowingPlaceIds?: string[]

  source?: string
  notes?: string
  photoUrl?: string

  expectedHarvestDaysMin?: number
  expectedHarvestDaysMax?: number

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
  photoUrl?: string

  /*
   * Growing Place connections.
   * These remain optional so simple journal
   * entries can still be saved without a place.
   */
  growingPlaceScope?: GrowingPlaceScope
  growingPlaceIds?: string[]

  /*
   * Plant connections.
   * plantStoryIds already allows one event to
   * appear in several Plant Stories.
   */
  plantScope?: PlantScope
  plantStoryIds: string[]

  /*
   * The plant category is generated from
   * PlantStory.plantName, such as Potato or Tomato.
   */
  plantCategory?: string
}


/* =======================================
   HARVEST
======================================= */

export interface Harvest {
  id: string
  plantStoryId: string
  date: string

  count?: number
  weightGrams?: number
  unitDescription?: string

  quality?:
    | 'poor'
    | 'fair'
    | 'good'
    | 'excellent'

  notes?: string
}


/* =======================================
   COMPLETE SAVED GARDEN
======================================= */

export interface GardenData {
  plantStories: PlantStory[]

  /*
   * Legacy collection.
   * Keep temporarily while existing plant records
   * still reference GrowingSpace IDs.
   */
  growingSpaces: GrowingSpace[]

  growingPlaces: GrowingPlace[]

  events: GardenEvent[]
  harvests: Harvest[]
}