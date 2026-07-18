export type PlantStatus =
  | 'planned'
  | 'growing'
  | 'harvesting'
  | 'finished'
  | 'failed'

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

export interface GrowingSpace {
  id: string
  name: string
  type: GrowingSpaceType
  notes?: string
}

export interface GardenEvent {
  id: string
  plantStoryIds: string[]
  date: string
  type: EventType
  title: string
  notes?: string
  productUsed?: string
  photoUrl?: string
}

export interface Harvest {
  id: string
  plantStoryId: string
  date: string
  count?: number
  weightGrams?: number
  unitDescription?: string
  quality?: 'poor' | 'fair' | 'good' | 'excellent'
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

  currentGrowingSpaceId?: string
  previousGrowingSpaceIds?: string[]

  source?: string
  notes?: string
  photoUrl?: string

  expectedHarvestDaysMin?: number
  expectedHarvestDaysMax?: number

  tags?: string[]
}

export interface GardenData {
  plantStories: PlantStory[]
  growingSpaces: GrowingSpace[]
  events: GardenEvent[]
  harvests: Harvest[]
}