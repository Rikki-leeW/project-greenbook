export type PlantStatus = 'planned' | 'growing' | 'harvesting' | 'finished' | 'failed';
export type GrowingPlaceKind = 'garden-area' | 'garden-bed' | 'raised-bed' | 'pot' | 'grow-bag' | 'planter-box' | 'greenhouse' | 'cold-frame' | 'shade-house' | 'deck' | 'patio' | 'balcony' | 'courtyard' | 'grass-area' | 'retaining-wall' | 'rock-wall' | 'orchard' | 'food-forest' | 'herb-garden' | 'flower-garden' | 'vine' | 'compost-area' | 'nursery-area' | 'indoor' | 'windowsill' | 'other';
export type GrowingGroundType = 'my-own-blend' | 'potting-mix' | 'top-soil' | 'seed-raising-mix' | 'native-soil' | 'native-clay' | 'loam' | 'sandy-soil' | 'rocky-soil' | 'peat-soil' | 'raised-bed-mix' | 'compost-based-mix' | 'soilless-mix' | 'hugelkultur' | 'layered-bed' | 'imported-topsoil' | 'coco-coir' | 'peat-moss' | 'sphagnum-moss' | 'pine-needles' | 'straw' | 'hydroponic' | 'aquaponic' | 'homemade-blend' | 'something-else' | 'not-sure';
export type GrowingGroundMethod = 'existing-ground' | 'dug-and-improved' | 'no-dig' | 'layered-bed' | 'hugelkultur' | 'filled-raised-bed' | 'container-mix' | 'seed-raising-mix' | 'wicking-bed' | 'hydroponic' | 'aquaponic' | 'kratky' | 'nft' | 'deep-water-culture' | 'ebb-and-flow' | 'aeroponic' | 'custom-blend' | 'something-else';
export type GardenAspect = 'north' | 'north-east' | 'east' | 'south-east' | 'south' | 'south-west' | 'west' | 'north-west';
export type SunlightLevel = 'full-sun' | 'mostly-sun' | 'part-sun' | 'dappled-light' | 'mostly-shade' | 'deep-shade';
export type ShelterLevel = 'very-exposed' | 'some-shelter' | 'well-sheltered' | 'fully-protected' | 'changes-with-season' | 'not-sure';
export type IngredientCategory = 'compost' | 'manure' | 'organic-matter' | 'minerals' | 'aeration' | 'water-retention' | 'amendments' | 'fertiliser' | 'biological-additives' | 'ph-adjusters' | 'structure-bulk' | 'growing-medium' | 'mulch' | 'other';

export interface Ingredient {
  id: string;
  name: string;
  category?: IngredientCategory;
  customCategoryLabel?: string;
  basedOnIngredientId?: string;
  manufacturer?: string;
  source?: string;
  notes?: string;
  photoUrls?: string[];
  isFavourite?: boolean;
  rating?: 1 | 2 | 3 | 4 | 5;
  isArchived?: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type GardenProductCategory = 'fertiliser' | 'soil-conditioner' | 'wetting-agent' | 'pest-treatment' | 'disease-treatment' | 'weed-treatment' | 'biological-treatment' | 'root-treatment' | 'plant-tonic' | 'growing-medium' | 'mulch' | 'seed-treatment' | 'cleaning-product' | 'other';

export interface GardenProduct {
  id: string;
  name: string;
  category?: GardenProductCategory;
  customCategoryLabel?: string;
  brand?: string;
  productName?: string;
  notes?: string;
  photoUrls?: string[];
  isFavourite?: boolean;
  rating?: 1 | 2 | 3 | 4 | 5;
  isArchived?: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type GrowingSetupCategory = 'own-mix' | 'bought-mix' | 'ground-type' | 'growing-system';

export interface GrowingSetup {
  id: string;
  name: string;
  category: GrowingSetupCategory;
  basedOnRecipeId?: string;
  isFavourite?: boolean;
  rating?: 1 | 2 | 3 | 4 | 5;
  isArchived?: boolean;
  archivedAt?: string;
  ingredientIds?: string[];
  recipeComponents?: Array<{
    sourceType: 'ingredient' | 'product' | 'growing-setup';
    sourceId: string;
    quantity?: number;
    unit?: 'part' | 'litre' | 'millilitre' | 'kilogram' | 'gram' | 'handful' | 'scoop' | 'other';
    customUnitLabel?: string;
  }>;
  brand?: string;
  productName?: string;
  groundType?: GrowingGroundType;
  growingSystemType?: GrowingGroundMethod;
  notes?: string;
  photoUrls?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface GrowingPlace {
  id: string;
  name: string;
  kind: GrowingPlaceKind;
  customKindLabel?: string;
  growingSetupId?: string;
  aspect?: GardenAspect;
  sunlight?: SunlightLevel;
  shelter?: ShelterLevel;
  notes?: string;
  photoUrls?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type PurchaseItemType = 'ingredient' | 'growing-setup' | 'plant' | 'seed' | 'seedling' | 'fertiliser' | 'product' | 'container' | 'equipment' | 'other';
export type PurchaseUnit = 'each' | 'packet' | 'bag' | 'box' | 'tray' | 'litre' | 'millilitre' | 'kilogram' | 'gram' | 'metre' | 'other';

export interface PurchaseRecord {
  id: string;
  itemType: PurchaseItemType;
  itemId?: string;
  itemName: string;
  date: string;
  supplier?: string;
  brand?: string;
  pricePaid: number;
  currency?: string;
  quantity?: number;
  unit?: PurchaseUnit;
  packageSize?: number;
  packageUnit?: PurchaseUnit;
  reusable?: boolean;
  expectedUses?: number;
  notes?: string;
  photoUrls?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type CostAllocationTargetType = 'plant' | 'growing-setup' | 'growing-place' | 'harvest' | 'garden-trial' | 'other';

export interface CostAllocation {
  id: string;
  purchaseId: string;
  targetType: CostAllocationTargetType;
  targetId: string;
  quantityUsed?: number;
  unit?: PurchaseUnit;
  allocatedCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type StartMethod = 'seed' | 'seedling' | 'cutting' | 'sucker' | 'seed-potato' | 'tuber' | 'bulb' | 'rhizome' | 'division' | 'bought-plant' | 'other';
export type SeedlingFloweringState = 'yes' | 'no' | 'not-sure';
export type PlantOriginType = 'bought' | 'saved-from-garden' | 'propagated-from-plant' | 'gifted' | 'swapped' | 'found-or-existing' | 'unknown' | 'other';
export type GrowingSpaceType = 'garden-bed' | 'in-ground' | 'pot' | 'grow-bag' | 'greenhouse' | 'hanging-basket' | 'indoor' | 'other';

export interface GrowingSpace {
  id: string;
  name: string;
  type: GrowingSpaceType;
  notes?: string;
}

export type PlantHarvestTimingUnit = 'days' | 'weeks' | 'months';

export interface PlantGrowingHistoryEntry {
  id: string;
  startedDate: string;
  endedDate?: string;
  growingPlaceId?: string;
  growingSetupId?: string;
  growingSetupIds?: string[];
  gardenEventId?: string;
  notes?: string;
}

export interface PlantStory {
  id: string;
  plantName: string;
  variety?: string;
  displayName: string;
  personality?: string;
  basedOnPlantStoryId?: string;
  isFavourite?: boolean;
  isArchived?: boolean;
  archivedAt?: string;
  completedAt?: string;
  updatedAt?: string;
  quantity?: number;
  startMethod: StartMethod;
  customStartMethodLabel?: string;
  seedPotatoEyeCount?: number;
  seedlingFloweringState?: SeedlingFloweringState;
  sownDate?: string;
  plantedDate: string;
  plantedOutDate?: string;
  enteredDate: string;
  originType?: PlantOriginType;
  source?: string;
  originPurchaseId?: string;
  originPlantStoryId?: string;
  customOriginLabel?: string;
  status: PlantStatus;
  currentGrowingSpaceId?: string;
  previousGrowingSpaceIds?: string[];
  currentGrowingSetupId?: string;
  previousGrowingSetupIds?: string[];
  currentGrowingSetupIds?: string[];
  previousGrowingSetupIdsV2?: string[];
  currentGrowingPlaceId?: string;
  previousGrowingPlaceIds?: string[];
  growingHistory?: PlantGrowingHistoryEntry[];
  notes?: string;
  photoUrls?: string[];
  photoDates?: Array<string | undefined>;
  expectedHarvestDaysMin?: number;
  expectedHarvestDaysMax?: number;
  harvestTimingInputUnit?: PlantHarvestTimingUnit;
  harvestTimingReference?: {
    sourceType: 'sown' | 'planted' | 'planted-out' | 'purchased' | 'garden-event' | 'custom-date';
    eventId?: string;
    customDate?: string;
    customLabel?: string;
  };
  tags?: string[];
}

export type EventType = 'planted' | 'sprouted' | 'watered' | 'fed' | 'moved' | 'hilled' | 'pruned' | 'treated' | 'weather' | 'observation' | 'photo' | 'harvest' | 'note';
export type GrowingPlaceScope = 'none' | 'single' | 'multiple' | 'entire-garden';
export type PlantScope = 'none' | 'single' | 'multiple' | 'category' | 'all-plants';

export interface GardenEvent {
  id: string;
  date: string;
  type: EventType;
  activityTypes?: EventType[];
  title: string;
  notes?: string;
  productUsed?: string;
  photoUrls?: string[];
  originatingKnowledgeNoteId?: string;
  growingPlaceScope?: GrowingPlaceScope;
  growingPlaceIds?: string[];
  plantScope?: PlantScope;
  plantStoryIds: string[];
  plantCategory?: string;
}

export type HarvestType = 'first' | 'regular' | 'main' | 'secondary' | 'final' | 'other';
export type HarvestQuality = 'poor' | 'fair' | 'good' | 'excellent';
export type HarvestPlantOutcome = 'still-producing' | 'more-expected' | 'main-harvest-complete' | 'finished' | 'no-change' | 'not-sure' | 'other';
export type HarvestMeasurementUnit = 'gram' | 'kilogram' | 'millilitre' | 'litre' | 'centimetre' | 'inch' | 'bunch' | 'handful' | 'basket' | 'container' | 'other';

export interface HarvestRecord {
  id: string;
  plantStoryIds: string[];
  date: string;
  harvestType?: HarvestType;
  customHarvestTypeLabel?: string;
  count?: number;
  measurementAmount?: number;
  measurementUnit?: HarvestMeasurementUnit;
  customMeasurementUnitLabel?: string;
  plantOutcome?: HarvestPlantOutcome;
  customPlantOutcomeLabel?: string;
  quality?: HarvestQuality;
  notes?: string;
  photoUrls?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type GardenPlanKind = 'sow' | 'plant' | 'plant-out' | 'move' | 'feed' | 'treat' | 'harvest' | 'buy' | 'garden-task' | 'other';
export type GardenPlanStatus = 'planned' | 'recorded' | 'not-done';

export interface PlannedPlantDetails {
  plantName?: string;
  variety?: string;
  quantity?: number;
  startMethod?: StartMethod;
  customStartMethodLabel?: string;
}

export type GardenPlanTimingReference = 'sown' | 'planted' | 'planted-out';
export type GardenPlanTimingKnowledgeSource = 'gardener' | 'sprig-history' | 'reference' | 'unknown';

export interface GardenPlanTimingAssumption {
  referenceType: GardenPlanTimingReference;
  daysMin?: number;
  daysMax?: number;
  knowledgeSource?: GardenPlanTimingKnowledgeSource;
  evidenceCount?: number;
}

export interface GardenPlanScheduleChange {
  fromDate: string;
  fromEndDate?: string;
  toDate: string;
  toEndDate?: string;
  changedAt: string;
}

export type GardenPlanResultRecordType = 'plant-story' | 'garden-event' | 'harvest' | 'purchase';

export interface GardenPlanResult {
  recordType: GardenPlanResultRecordType;
  recordId: string;
  recordedAt: string;
}

export interface GardenPlan {
  id: string;
  title: string;
  kind: GardenPlanKind;
  customKindLabel?: string;
  notes?: string;
  date: string;
  endDate?: string;
  plantStoryIds?: string[];
  growingPlaceIds?: string[];
  growingSetupIds?: string[];
  plannedPlant?: PlannedPlantDetails;
  timingAssumption?: GardenPlanTimingAssumption;
  status: GardenPlanStatus;
  scheduleHistory?: GardenPlanScheduleChange[];
  results?: GardenPlanResult[];
  originatingKnowledgeNoteId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ComparisonRecordType = 'plant-story' | 'growing-place' | 'growing-setup';

export interface ComparisonItem {
  recordType: ComparisonRecordType;
  recordId: string;
}

export interface SavedComparison {
  id: string;
  name: string;
  items: ComparisonItem[];
  createdAt: string;
  updatedAt?: string;
}

export type KnowledgeRelationshipTargetType = 'plant-story' | 'garden-event' | 'harvest' | 'plan' | 'growing-place' | 'growing-setup' | 'ingredient' | 'product' | 'purchase' | 'garden-note' | 'plant-reference' | 'saved-source' | 'comparison' | 'garden-trial';

export interface KnowledgeRelationship {
  targetType: KnowledgeRelationshipTargetType;
  targetId: string;
  label?: string;
  createdAt?: string;
}

export type GardenNoteOrigin = 'sprig-note' | 'imported-text';
export type KnowledgePlacementDestinationType = 'garden-note' | 'plant-reference' | 'saved-source' | 'garden-event' | 'plan' | 'existing-record';

export interface KnowledgePlacement {
  id: string;
  excerpt: string;
  destinationType: KnowledgePlacementDestinationType;
  destinationId?: string;
  destinationLabel?: string;
  placedAt: string;
}

export interface GardenNote {
  id: string;
  title?: string;
  body: string;
  noteDate?: string;
  origin: GardenNoteOrigin;
  originalBody?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  relationships?: KnowledgeRelationship[];
  placements?: KnowledgePlacement[];
  photoUrls?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type SavedKnowledgeSourceKind = 'website' | 'facebook' | 'chatgpt' | 'person' | 'nursery' | 'book' | 'video' | 'screenshot' | 'other';

export interface SavedKnowledgeSource {
  id: string;
  title: string;
  kind: SavedKnowledgeSourceKind;
  customKindLabel?: string;
  sourceName?: string;
  url?: string;
  excerpt?: string;
  notes?: string;
  savedDate?: string;
  relationships?: KnowledgeRelationship[];
  photoUrls?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface PlantReference {
  id: string;
  plantName: string;
  variety?: string;
  aliases?: string[];
  notes?: string;
  referenceDate?: string;
  photoUrls?: string[];
  sourceIds?: string[];
  relationships?: KnowledgeRelationship[];
  createdAt: string;
  updatedAt?: string;
}

export type GardenTrialStatus = 'active' | 'completed' | 'set-aside';
export type GardenTrialResult = 'clear' | 'mixed' | 'inconclusive' | 'interrupted';
export type GardenTrialTimingUnit = 'days' | 'weeks' | 'months';

export interface GardenTrialObservation {
  id: string;
  date: string;
  body: string;
  photoUrls?: string[];
  photoDates?: Array<string | undefined>;
  createdAt: string;
  updatedAt?: string;
}

export interface GardenTrial {
  id: string;
  title: string;
  startDate: string;
  completedDate?: string;
  status: GardenTrialStatus;
  expectedDurationValue?: number;
  expectedDurationUnit?: GardenTrialTimingUnit;
  expectedFinishDate?: string;
  timingReason?: string;
  purpose?: string;
  question?: string;
  expectation?: string;
  whatIsChanging?: string;
  whatShouldStayComparable?: string;
  watchingFor?: string;
  photoUrls?: string[];
  photoDates?: Array<string | undefined>;
  observations?: GardenTrialObservation[];
  result?: GardenTrialResult;
  conclusion?: string;
  nextTime?: string;
  relationships?: KnowledgeRelationship[];
  createdAt: string;
  updatedAt?: string;
}

export interface GalleryPhoto {
  id: string;
  photoUrl: string;
  photoDate?: string;
  title?: string;
  notes?: string;
  tags?: string[];
  relationships?: KnowledgeRelationship[];
  createdAt: string;
  updatedAt?: string;
}

export interface GardenData {
  plantStories: PlantStory[];
  growingSpaces: GrowingSpace[];
  growingPlaces: GrowingPlace[];
  growingSetups: GrowingSetup[];
  ingredients: Ingredient[];
  products: GardenProduct[];
  purchases: PurchaseRecord[];
  costAllocations: CostAllocation[];
  events: GardenEvent[];
  harvests: HarvestRecord[];
  plans: GardenPlan[];
  gardenNotes?: GardenNote[];
  plantReferences?: PlantReference[];
  savedKnowledgeSources?: SavedKnowledgeSource[];
  gardenTrials?: GardenTrial[];
  galleryPhotos?: GalleryPhoto[];
  savedComparisons: SavedComparison[];
}