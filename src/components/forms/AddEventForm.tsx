import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import FormTemplate from '../templates/FormTemplate'

import SelectionCard from '../sprig/SelectionCard';
import SprigPicker from '../sprig/SprigPicker';
import SprigPhotoPicker from '../photos/SprigPhotoPicker';
import AddGrowingPlaceForm from './AddGrowingPlaceForm';
import AddProductForm from './AddProductForm';


import type {
  EventType,
  GardenEvent,
  GardenEventGrowingChange,
  GardenEventPlantGrowingTransition,
  GardenEventTransplantKind,
  GardenPlan,
  GardenProduct,
  GrowingPlace,
  GrowingPlaceScope,
  GrowingSetup,
  GrowingSetupCategory,
  PlantScope,
  PlantStatus,
  PlantStory,
  PurchaseRecord,
  SprigPhotoMetadata,
} from '../../types';


interface AddEventFormProps {
  plantId: string;
  plants: PlantStory[];
  growingPlaces: GrowingPlace[];
  growingSetups: GrowingSetup[];
  products: GardenProduct[];

  eventToEdit?: GardenEvent;
  planToRecord?: GardenPlan;

  onAddEvent: (
      event: GardenEvent,
  ) => void;

  onAddGrowingPlace: (
      place: GrowingPlace,
  ) => void;

  onAddRecipe: (
      recipe: GrowingSetup,
  ) => void;

  onAddProduct?: (
      product: GardenProduct,
  ) => void;

  onAddPurchase?: (
      purchase: PurchaseRecord,
  ) => void;

  onUpdateEvent?: (
      event: GardenEvent,
  ) => void;

  onAddHarvest?: (
      plantStoryIds: string[],
  ) => void;

  onClose: () => void;
}


/* =======================================
 TODAY
======================================= */

function getTodayDate(): string {
  const now =
      new Date();

  const year =
      now.getFullYear();

  const month =
      String(
          now.getMonth() + 1,
      ).padStart(
          2,
          '0',
      );

  const day =
      String(
          now.getDate(),
      ).padStart(
          2,
          '0',
      );

  return `${year}-${month}-${day}`;
}


/* =======================================
 DATE DISPLAY
======================================= */

function formatPlantDate(
  date?: string,
): string | undefined {
  if (
      !date
  ) {
      return undefined;
  }

  const parsed =
      new Date(
          `${date}T00:00:00`,
      );

  if (
      Number.isNaN(
          parsed.getTime(),
      )
  ) {
      return date;
  }

  return parsed.toLocaleDateString(
      'en-AU',
      {
          day:
              'numeric',

          month:
              'short',

          year:
              'numeric',
      },
  );
}


/* =======================================
 PLANT AGE
======================================= */

function getPlantAgeDays(
  plant: PlantStory,
  onDate: string,
): number | undefined {
  if (
      !plant.plantedDate ||
      !onDate
  ) {
      return undefined;
  }

  const started =
      new Date(
          `${plant.plantedDate}T00:00:00`,
      );

  const ended =
      new Date(
          `${onDate}T00:00:00`,
      );

  if (
      Number.isNaN(
          started.getTime(),
      ) ||
      Number.isNaN(
          ended.getTime(),
      )
  ) {
      return undefined;
  }

  return Math.max(
      0,
      Math.floor(
          (
              ended.getTime() -
              started.getTime()
          ) /
          86400000,
      ),
  );
}


function formatPlantAge(
  plant: PlantStory,
  onDate: string,
): string | undefined {
  const days =
      getPlantAgeDays(
          plant,
          onDate,
      );

  if (
      days ===
      undefined
  ) {
      return undefined;
  }

  if (
      days < 14
  ) {
      return `${days} ${
          days === 1
              ? 'day'
              : 'days'
      }`;
  }

  const weeks =
      days / 7;

  return `${
      Number.isInteger(
          weeks,
      )
          ? weeks.toFixed(
              0,
          )
          : weeks.toFixed(
              1,
          )
  } weeks`;
}


/* =======================================
 PRODUCT CATEGORY LABEL
======================================= */

function getProductCategoryLabel(
  product: GardenProduct,
): string | undefined {
  if (
      product.customCategoryLabel
          ?.trim()
  ) {
      return product
          .customCategoryLabel
          .trim();
  }

  switch (
      product.category
  ) {
      case 'fertiliser':
          return 'Fertiliser';

      case 'soil-conditioner':
          return 'Soil conditioner';

      case 'wetting-agent':
          return 'Wetting agent';

      case 'pest-treatment':
          return 'Pest treatment';

      case 'disease-treatment':
          return 'Disease treatment';

      case 'weed-treatment':
          return 'Weed treatment';

      case 'biological-treatment':
          return 'Biological treatment';

      case 'root-treatment':
          return 'Root treatment';

      case 'plant-tonic':
          return 'Plant tonic';

      case 'growing-medium':
          return 'Growing medium';

      case 'mulch':
          return 'Mulch';

      case 'seed-treatment':
          return 'Seed treatment';

      case 'cleaning-product':
          return 'Cleaning product';

      case 'other':
          return 'Other';

      default:
          return undefined;
  }
}


/* =======================================
 GROWING SETUP LABEL
======================================= */

function getGrowingSetupCategoryLabel(
  category:
      GrowingSetupCategory,
): string {
  switch (
      category
  ) {
      case 'own-mix':
          return 'My Recipe';

      case 'bought-mix':
          return 'Bought Mix';

      case 'growing-system':
          return 'Growing System';

      case 'ground-type':
          return 'Ground Type';

      default:
          return 'Growing record';
  }
}


/* =======================================
 CURRENT PLANT SETUPS
======================================= */

function getPlantGrowingSetupIds(
  plant:
      PlantStory |
      undefined,
): string[] {
  return Array.from(
      new Set(
          [
              ...(
                  plant
                      ?.currentGrowingSetupIds ??
                  []
              ),

              plant
                  ?.currentGrowingSetupId,
          ].filter(
              (
                  id,
              ): id is string =>
                  Boolean(
                      id,
                  ),
          ),
      ),
  );
}


/* =======================================
 PLAN → JOURNAL ACTIVITY
======================================= */

function getPlanActivityType(
  plan?: GardenPlan,
): EventType | undefined {
  if (
      !plan
  ) {
      return undefined;
  }

  switch (
      plan.kind
  ) {
      case 'plant-out':
          return 'transplanted';

      case 'move':
          return 'moved';

      case 'feed':
          return 'fed';

      case 'treat':
          return 'treated';

      case 'garden-task':
      case 'other':
          return 'note';

      default:
          return undefined;
  }
}


/* =======================================
 PLAN → PLANT SCOPE
======================================= */

function getPlanPlantScope(
  plan?: GardenPlan,
): PlantScope {
  const count =
      plan
          ?.plantStoryIds
          ?.length ??
      0;

  if (
      count === 1
  ) {
      return 'single';
  }

  if (
      count > 1
  ) {
      return 'multiple';
  }

  return 'none';
}


/* =======================================
 PLAN → PLACE SCOPE
======================================= */

function getPlanPlaceScope(
  plan?: GardenPlan,
): GrowingPlaceScope {
  const count =
      plan
          ?.growingPlaceIds
          ?.length ??
      0;

  if (
      count === 1
  ) {
      return 'single';
  }

  if (
      count > 1
  ) {
      return 'multiple';
  }

  return 'none';
}


/* =======================================
 EVENT → PLANT SCOPE
======================================= */

function getEventPlantScope(
  event?: GardenEvent,
): PlantScope {
  if (
      event?.plantScope
  ) {
      return event.plantScope;
  }

  const count =
      event
          ?.plantStoryIds
          ?.length ??
      0;

  if (
      count === 1
  ) {
      return 'single';
  }

  if (
      count > 1
  ) {
      return 'multiple';
  }

  return 'none';
}


/* =======================================
 EVENT → PLACE SCOPE
======================================= */

function getEventPlaceScope(
  event?: GardenEvent,
): GrowingPlaceScope {
  if (
      event?.growingPlaceScope
  ) {
      return event.growingPlaceScope;
  }

  const count =
      event
          ?.growingPlaceIds
          ?.length ??
      0;

  if (
      count === 1
  ) {
      return 'single';
  }

  if (
      count > 1
  ) {
      return 'multiple';
  }

  return 'none';
}


/* =======================================
 EXISTING PHOTO CONTEXT
======================================= */

function getEventPhotoMetadata(
  event?: GardenEvent,
): (
  SprigPhotoMetadata |
  undefined
)[] {
  const photoUrls =
      event?.photoUrls ??
      [];

  return photoUrls.map(
      (
          photoUrl,
          index,
      ) => {
          const metadata =
              event
                  ?.photoMetadata?.[
                      index
                  ];

          return {
              ...metadata,

              photoUrl:
                  metadata
                      ?.photoUrl ??
                  photoUrl,

              photoDate:
                  metadata
                      ?.photoDate ??
                  event?.date,
          };
      },
  );
}


/* =======================================
 QUICK GROWING SETUP
======================================= */

function createQuickGrowingSetup(
  name: string,
  category:
      GrowingSetupCategory,
  createdAt: string,
): GrowingSetup {
  const safeName =
      name
          .trim()
          .toLowerCase()
          .replace(
              /[^a-z0-9]+/g,
              '-',
          )
          .replace(
              /^-|-$/g,
              '',
          );

  return {
      id:
          `${category}-${
              safeName ||
              'growing-setup'
          }-${Date.now()}`,

      name:
          name.trim(),

      category,

      isFavourite:
          false,

      isArchived:
          false,

      createdAt,
  };
}


/* =======================================
 PRODUCT RELEVANCE
======================================= */

function activityCanUseProducts(
  activityTypes:
      EventType[],
): boolean {
  return activityTypes.some(
      activity =>
          activity ===
              'fed' ||
          activity ===
              'treated' ||
          activity ===
              'transplanted' ||
          activity ===
              'watered',
  );
}


/* =======================================
 TRANSPLANT LABEL
======================================= */

function getTransplantKindLabel(
  kind:
      GardenEventTransplantKind,
): string {
  switch (
      kind
  ) {
      case 'potted-up':
          return 'Potted up / changed container';

      case 'container-to-ground':
          return 'Container → ground / bed';

      case 'ground-to-container':
          return 'Ground / bed → container';

      case 'place-to-place':
          return 'Changed growing place';

      case 'other':
          return 'Something else';

      default:
          return 'Transplanted';
  }
}


/* =======================================
 SPRIG JOURNAL FORM
======================================= */

export default function AddEventForm({
  plantId,
  plants,
  growingPlaces,
  growingSetups,
  products,
  eventToEdit,
  planToRecord,
  onAddEvent,
  onAddGrowingPlace,
  onAddRecipe,
  onAddProduct,
  onAddPurchase,
  onUpdateEvent,
  onAddHarvest,
  onClose,
}: AddEventFormProps) {
  const today =
      getTodayDate();

  const isEditing =
      Boolean(
          eventToEdit,
      );

  const isRecordingPlan =
      Boolean(
          planToRecord,
      ) &&
      !isEditing;

  const isSubmittingRef =
      useRef(
          false,
      );

  const [
      isSubmitting,
      setIsSubmitting,
  ] =
      useState(
          false,
      );


  /* =======================================
     ORIGINATING PLANT
  ======================================= */

  const startingPlant =
      !isEditing &&
      plantId
          ? plants.find(
              plant =>
                  plant.id ===
                  plantId,
          )
          : undefined;

  const startingGrowingPlaceId =
      startingPlant
          ?.currentGrowingPlaceId ??
      '';




  /* =======================================
     PLAN STARTING VALUES
  ======================================= */

  const planPlantIds =
      planToRecord
          ?.plantStoryIds ??
      [];

  const planPlaceIds =
      planToRecord
          ?.growingPlaceIds ??
      [];

  const plannedActivity =
      getPlanActivityType(
          planToRecord,
      );

  const eventActivityTypes =
      eventToEdit
          ? (
              eventToEdit
                  .activityTypes
                  ?.length
                  ? [
                      ...eventToEdit
                          .activityTypes,
                  ]
                  : [
                      eventToEdit.type,
                  ]
          )
          : undefined;


  /* =======================================
     ACTIVITY
  ======================================= */

  const [
      activityTypes,
      setActivityTypes,
  ] =
      useState<
          EventType[]
      >(
          eventActivityTypes ??
          (
              plannedActivity
                  ? [
                      plannedActivity,
                  ]
                  : []
          ),
      );

  const [
      isActivityPickerOpen,
      setIsActivityPickerOpen,
  ] =
      useState(
          false,
      );


  /* =======================================
     JOURNAL DETAILS
  ======================================= */

  const [
      date,
      setDate,
  ] =
      useState(
          eventToEdit
              ?.date ??
          planToRecord
              ?.date ??
          today,
      );

  const [
      title,
      setTitle,
  ] =
      useState(
          eventToEdit
              ?.title ??
          planToRecord
              ?.title ??
          '',
      );

  const [
      notes,
      setNotes,
  ] =
      useState(
          eventToEdit
              ?.notes ??
          planToRecord
              ?.notes ??
          '',
      );

  const [
      treatmentReason,
      setTreatmentReason,
  ] =
      useState(
          eventToEdit
              ?.treatmentReason ??
          '',
      );


  /* =======================================
     PHOTOGRAPHS
  ======================================= */

  const [
      photoUrls,
      setPhotoUrls,
  ] =
      useState<
          string[]
      >(
          [
              ...(
                  eventToEdit
                      ?.photoUrls ??
                  []
              ),
          ],
      );

  const [
      photoMetadata,
      setPhotoMetadata,
  ] =
      useState<
          (
              SprigPhotoMetadata |
              undefined
          )[]
      >(
          getEventPhotoMetadata(
              eventToEdit,
          ),
      );


  /* =======================================
     LOCATION CONTEXT
  ======================================= */

  const [
      growingPlaceScope,
      setGrowingPlaceScope,
  ] =
      useState<
          GrowingPlaceScope
      >(
          eventToEdit
              ? getEventPlaceScope(
                  eventToEdit,
              )
              : isRecordingPlan
                  ? getPlanPlaceScope(
                      planToRecord,
                  )
                  : startingGrowingPlaceId
                      ? 'single'
                      : 'none',
      );

  const [
      growingPlaceIds,
      setGrowingPlaceIds,
  ] =
      useState<
          string[]
      >(
          eventToEdit
              ? [
                  ...(
                      eventToEdit
                          .growingPlaceIds ??
                      []
                  ),
              ]
              : isRecordingPlan
                  ? [
                      ...planPlaceIds,
                  ]
                  : startingGrowingPlaceId
                      ? [
                          startingGrowingPlaceId,
                      ]
                      : [],
      );

  const [
      isGrowingPlacePickerOpen,
      setIsGrowingPlacePickerOpen,
  ] =
      useState(
          false,
      );

  const [
      growingPlaceQuickAddTarget,
      setGrowingPlaceQuickAddTarget,
  ] =
      useState<
          'destination' |
          'context' |
          null
      >(
          null,
      );


  /* =======================================
     PLANT RELATIONSHIPS
  ======================================= */

  const [
      plantScope,
      setPlantScope,
  ] =
      useState<
          PlantScope
      >(
          eventToEdit
              ? getEventPlantScope(
                  eventToEdit,
              )
              : isRecordingPlan
                  ? getPlanPlantScope(
                      planToRecord,
                  )
                  : startingPlant
                      ? 'single'
                      : 'none',
      );

  const [
      plantStoryIds,
      setPlantStoryIds,
  ] =
      useState<
          string[]
      >(
          eventToEdit
              ? [
                  ...(
                      eventToEdit
                          .plantStoryIds ??
                      []
                  ),
              ]
              : isRecordingPlan
                  ? [
                      ...planPlantIds,
                  ]
                  : startingPlant
                      ? [
                          startingPlant.id,
                      ]
                      : [],
      );

  const [
      isPlantPickerOpen,
      setIsPlantPickerOpen,
  ] =
      useState(
          false,
      );


  /* =======================================
     PLANT FILTERS
  ======================================= */

  const [
      plantSearch,
      setPlantSearch,
  ] =
      useState(
          '',
      );

  const [
      cropFilter,
      setCropFilter,
  ] =
      useState(
          'all',
      );

  const [
      plantPlaceFilter,
      setPlantPlaceFilter,
  ] =
      useState(
          'all',
      );

  const [
      statusFilter,
      setStatusFilter,
  ] =
      useState<
          PlantStatus |
          'all'
      >(
          'growing',
      );

  const [
      minimumAgeWeeks,
      setMinimumAgeWeeks,
  ] =
      useState(
          '',
      );


  /* =======================================
     PRODUCTS
  ======================================= */

  const [
      productIds,
      setProductIds,
  ] =
      useState<
          string[]
      >(
          [
              ...(
                  eventToEdit
                      ?.productIds ??
                  []
              ),
          ],
      );

  const [
      productUsed,
      setProductUsed,
  ] =
      useState(
          eventToEdit
              ?.productUsed ??
          '',
      );

  const [
      isProductPickerOpen,
      setIsProductPickerOpen,
  ] =
      useState(
          false,
      );

  const [
      isProductQuickAddOpen,
      setIsProductQuickAddOpen,
  ] =
      useState(
          false,
      );


  /* =======================================
     MOVE / TRANSPLANT
  ======================================= */

  const [
      growingChange,
      setGrowingChange,
  ] =
      useState<
          GardenEventGrowingChange
      >(
          eventToEdit
              ?.growingChange ??
          (
              eventToEdit
                  ?.type ===
                  'moved'
                  ? 'growing-place'
                  : 'both'
          ),
      );

  const [
      transplantKind,
      setTransplantKind,
  ] =
      useState<
          GardenEventTransplantKind |
          ''
      >(
          eventToEdit
              ?.transplantKind ??
          '',
      );

  const [
      customTransplantLabel,
      setCustomTransplantLabel,
  ] =
      useState(
          eventToEdit
              ?.customTransplantLabel ??
          '',
      );

  const [
      toGrowingPlaceId,
      setToGrowingPlaceId,
  ] =
      useState(
          eventToEdit
              ?.toGrowingPlaceId ??
          '',
      );

  const [
      toGrowingSetupIds,
      setToGrowingSetupIds,
  ] =
      useState<
          string[]
      >(
          eventToEdit
              ?.toGrowingSetupIds
              ? [
                  ...eventToEdit
                      .toGrowingSetupIds,
              ]
              : [],
      );

  const [
      isToGrowingPlacePickerOpen,
      setIsToGrowingPlacePickerOpen,
  ] =
      useState(
          false,
      );

  const [
      isToGrowingSetupPickerOpen,
      setIsToGrowingSetupPickerOpen,
  ] =
      useState(
          false,
      );

  const [
      quickGrowingSetupCategory,
      setQuickGrowingSetupCategory,
  ] =
      useState<
          GrowingSetupCategory |
          null
      >(
          null,
      );

  const [
      quickGrowingSetupName,
      setQuickGrowingSetupName,
  ] =
      useState(
          '',
      );


  /* =======================================
     ACTIVITY OPTIONS
  ======================================= */

  const activityOptions: {
      value: EventType;
      label: string;
      icon: string;
  }[] = [
      {
          value:
              'observation',
          label:
              'Observed',
          icon:
              '👀',
      },
      {
          value:
              'watered',
          label:
              'Watered',
          icon:
              '💧',
      },
      {
          value:
              'fed',
          label:
              'Fertilised',
          icon:
              '🌿',
      },
      {
          value:
              'sprouted',
          label:
              'Sprouted',
          icon:
              '🌱',
      },
      {
          value:
              'pruned',
          label:
              'Pruned',
          icon:
              '✂️',
      },
      {
          value:
              'treated',
          label:
              'Treated',
          icon:
              '🩹',
      },
      {
          value:
              'moved',
          label:
              'Moved',
          icon:
              '🪴',
      },
      {
          value:
              'transplanted',
          label:
              'Transplanted',
          icon:
              '🌱',
      },
      {
          value:
              'hilled',
          label:
              'Hilled',
          icon:
              '🥔',
      },
      {
          value:
              'weather',
          label:
              'Weather',
          icon:
              '🌦️',
      },
      {
          value:
              'photo',
          label:
              'Photographed',
          icon:
              '📷',
      },
      {
          value:
              'note',
          label:
              'Made a note',
          icon:
              '📖',
      },
  ];


  /* =======================================
     RESET WHEN SOURCE RECORD CHANGES
  ======================================= */

  useEffect(
      () => {
          if (
              eventToEdit
          ) {
              setActivityTypes(
                  eventToEdit
                      .activityTypes
                      ?.length
                      ? [
                          ...eventToEdit
                              .activityTypes,
                      ]
                      : [
                          eventToEdit.type,
                      ],
              );

              setDate(
                  eventToEdit.date,
              );

              setTitle(
                  eventToEdit.title ??
                  '',
              );

              setNotes(
                  eventToEdit.notes ??
                  '',
              );

              setTreatmentReason(
                  eventToEdit
                      .treatmentReason ??
                  '',
              );

              setProductIds(
                  [
                      ...(
                          eventToEdit
                              .productIds ??
                          []
                      ),
                  ],
              );

              setProductUsed(
                  eventToEdit
                      .productUsed ??
                  '',
              );

              setGrowingPlaceScope(
                  getEventPlaceScope(
                      eventToEdit,
                  ),
              );

              setGrowingPlaceIds(
                  [
                      ...(
                          eventToEdit
                              .growingPlaceIds ??
                          []
                      ),
                  ],
              );

              setPlantScope(
                  getEventPlantScope(
                      eventToEdit,
                  ),
              );

              setPlantStoryIds(
                  [
                      ...(
                          eventToEdit
                              .plantStoryIds ??
                          []
                      ),
                  ],
              );

              setGrowingChange(
                  eventToEdit
                      .growingChange ??
                  (
                      eventToEdit
                          .type ===
                          'moved'
                          ? 'growing-place'
                          : 'both'
                  ),
              );

              setTransplantKind(
                  eventToEdit
                      .transplantKind ??
                  '',
              );

              setCustomTransplantLabel(
                  eventToEdit
                      .customTransplantLabel ??
                  '',
              );

              setToGrowingPlaceId(
                  eventToEdit
                      .toGrowingPlaceId ??
                  '',
              );

              setToGrowingSetupIds(
                  [
                      ...(
                          eventToEdit
                              .toGrowingSetupIds ??
                          []
                      ),
                  ],
              );

              setPhotoUrls(
                  [
                      ...(
                          eventToEdit
                              .photoUrls ??
                          []
                      ),
                  ],
              );

              setPhotoMetadata(
                  getEventPhotoMetadata(
                      eventToEdit,
                  ),
              );

              setIsActivityPickerOpen(
                  false,
              );

              setIsGrowingPlacePickerOpen(
                  false,
              );

              setIsPlantPickerOpen(
                  false,
              );

              setIsProductPickerOpen(
                  false,
              );

              setIsProductQuickAddOpen(
                  false,
              );

              isSubmittingRef.current =
                  false;

              setIsSubmitting(
                  false,
              );

              return;
          }

          if (
              !planToRecord
          ) {
              return;
          }

          const nextActivity =
              getPlanActivityType(
                  planToRecord,
              );

          setDate(
              planToRecord.date,
          );

          setTitle(
              planToRecord.title ??
              '',
          );

          setNotes(
              planToRecord.notes ??
              '',
          );

          setTreatmentReason(
              '',
          );

          setProductIds(
              [],
          );

          setProductUsed(
              '',
          );

          setActivityTypes(
              nextActivity
                  ? [
                      nextActivity,
                  ]
                  : [],
          );

          setGrowingPlaceScope(
              getPlanPlaceScope(
                  planToRecord,
              ),
          );

          setGrowingPlaceIds(
              [
                  ...(
                      planToRecord
                          .growingPlaceIds ??
                      []
                  ),
              ],
          );

          setPlantScope(
              getPlanPlantScope(
                  planToRecord,
              ),
          );

          setPlantStoryIds(
              [
                  ...(
                      planToRecord
                          .plantStoryIds ??
                      []
                  ),
              ],
          );

          setTransplantKind(
              planToRecord.kind ===
                  'plant-out'
                  ? 'container-to-ground'
                  : '',
          );

          setCustomTransplantLabel(
              '',
          );

          setPhotoUrls(
              [],
          );

          setPhotoMetadata(
              [],
          );

          setIsActivityPickerOpen(
              false,
          );

          setIsGrowingPlacePickerOpen(
              false,
          );

          setIsPlantPickerOpen(
              false,
          );

          setIsProductPickerOpen(
              false,
          );

          setIsProductQuickAddOpen(
              false,
          );

          isSubmittingRef.current =
              false;

          setIsSubmitting(
              false,
          );
      },
      [
          eventToEdit?.id,
          planToRecord?.id,
      ],
  );


  /* =======================================
     LOCK BACKGROUND PAGE
  ======================================= */

  useEffect(
      () => {
          const body =
              document.body;

          const html =
              document
                  .documentElement;

          const previousBodyOverflow =
              body.style
                  .overflow;

          const previousBodyOverscroll =
              body.style
                  .overscrollBehavior;

          const previousHtmlOverflow =
              html.style
                  .overflow;

          const previousHtmlOverscroll =
              html.style
                  .overscrollBehavior;

          body.style.overflow =
              'hidden';

          body.style.overscrollBehavior =
              'none';

          html.style.overflow =
              'hidden';

          html.style.overscrollBehavior =
              'none';

          return () => {
              body.style.overflow =
                  previousBodyOverflow;

              body.style.overscrollBehavior =
                  previousBodyOverscroll;

              html.style.overflow =
                  previousHtmlOverflow;

              html.style.overscrollBehavior =
                  previousHtmlOverscroll;
          };
      },
      [],
  );


  /* =======================================
     FILTER OPTIONS
  ======================================= */

  const cropOptions =
      useMemo(
          () =>
              Array.from(
                  new Set(
                      plants
                          .map(
                              plant =>
                                  plant.plantName
                                      .trim(),
                          )
                          .filter(
                              Boolean,
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
              plants,
          ],
      );


  /* =======================================
     FILTERED PLANTS
  ======================================= */

  const filteredPlants =
      useMemo(
          () => {
              const search =
                  plantSearch
                      .trim()
                      .toLowerCase();

              const minimumDays =
                  minimumAgeWeeks
                      .trim()
                      ? Number(
                          minimumAgeWeeks,
                      ) * 7
                      : undefined;

              return [
                  ...plants,
              ]
                  .filter(
                      plant => {
                          const selected =
                              plantStoryIds.includes(
                                  plant.id,
                              );

                          if (
                              selected
                          ) {
                              return true;
                          }

                          if (
                              growingPlaceScope !==
                                  'entire-garden' &&
                              growingPlaceIds.length >
                                  0 &&
                              !growingPlaceIds.includes(
                                  plant
                                      .currentGrowingPlaceId ??
                                  '',
                              )
                          ) {
                              return false;
                          }

                          if (
                              plantPlaceFilter !==
                                  'all' &&
                              plant.currentGrowingPlaceId !==
                                  plantPlaceFilter
                          ) {
                              return false;
                          }

                          if (
                              cropFilter !==
                                  'all' &&
                              plant.plantName !==
                                  cropFilter
                          ) {
                              return false;
                          }

                          if (
                              statusFilter !==
                                  'all' &&
                              plant.status !==
                                  statusFilter
                          ) {
                              return false;
                          }

                          if (
                              minimumDays !==
                                  undefined &&
                              Number.isFinite(
                                  minimumDays,
                              )
                          ) {
                              const ageDays =
                                  getPlantAgeDays(
                                      plant,
                                      date,
                                  );

                              if (
                                  ageDays ===
                                      undefined ||
                                  ageDays <
                                      minimumDays
                              ) {
                                  return false;
                              }
                          }

                          if (
                              search
                          ) {
                              const place =
                                  growingPlaces.find(
                                      item =>
                                          item.id ===
                                          plant
                                              .currentGrowingPlaceId,
                                  );

                              const haystack =
                                  [
                                      plant.displayName,
                                      plant.plantName,
                                      plant.variety,
                                      place?.name,
                                  ]
                                      .filter(
                                          Boolean,
                                      )
                                      .join(
                                          ' ',
                                      )
                                      .toLowerCase();

                              if (
                                  !haystack.includes(
                                      search,
                                  )
                              ) {
                                  return false;
                              }
                          }

                          return true;
                      },
                  )
                  .sort(
                      (
                          first,
                          second,
                      ) =>
                          first.displayName
                              .localeCompare(
                                  second.displayName,
                              ),
                  );
          },
          [
              plants,
              plantStoryIds,
              plantSearch,
              cropFilter,
              plantPlaceFilter,
              statusFilter,
              minimumAgeWeeks,
              date,
              growingPlaceScope,
              growingPlaceIds,
              growingPlaces,
          ],
      );


  const visibleUnselectedPlantIds =
      filteredPlants
          .filter(
              plant =>
                  !plantStoryIds.includes(
                      plant.id,
                  ),
          )
          .map(
              plant =>
                  plant.id,
          );


  /* =======================================
     PRODUCTS
  ======================================= */

  const availableProducts =
      [
          ...products,
      ]
          .filter(
              product =>
                  !product.isArchived ||
                  productIds.includes(
                      product.id,
                  ),
          )
          .sort(
              (
                  first,
                  second,
              ) =>
                  first.name
                      .localeCompare(
                          second.name,
                      ),
          );


          const isMoved =
          activityTypes.includes(
              'moved',
          );
  
      const isTransplanted =
          activityTypes.includes(
              'transplanted',
          );
  
      const shouldShowProducts =
          activityCanUseProducts(
              activityTypes,
          ) ||
          productIds.length >
              0 ||
          Boolean(
              productUsed.trim(),
          );


  /* =======================================
     TRANSITION HELPERS
  ======================================= */

  function getExistingTransition(
      plantStoryId:
          string,
  ):
      GardenEventPlantGrowingTransition |
      undefined {
      const explicit =
          eventToEdit
              ?.plantGrowingTransitions
              ?.find(
                  transition =>
                      transition
                          .plantStoryId ===
                      plantStoryId,
              );

      if (
          explicit
      ) {
          return explicit;
      }

      if (
          eventToEdit &&
          eventToEdit
              .plantStoryIds
              .length ===
              1 &&
          eventToEdit
              .plantStoryIds[0] ===
              plantStoryId
      ) {
          return {
              plantStoryId,

              fromGrowingPlaceId:
                  eventToEdit
                      .fromGrowingPlaceId,

              toGrowingPlaceId:
                  eventToEdit
                      .toGrowingPlaceId,

              fromGrowingSetupIds:
                  eventToEdit
                      .fromGrowingSetupIds,

              toGrowingSetupIds:
                  eventToEdit
                      .toGrowingSetupIds,
          };
      }

      return undefined;
  }


  function buildPlantGrowingTransition(
      plant:
          PlantStory,
  ):
      GardenEventPlantGrowingTransition {
      const existing =
          getExistingTransition(
              plant.id,
          );

      const changesPlace =
          activityTypes.includes(
              'moved',
          ) ||
          (
              activityTypes.includes(
                  'transplanted',
              ) &&
              (
                  growingChange ===
                      'growing-place' ||
                  growingChange ===
                      'both'
              )
          );

      const changesSetup =
          activityTypes.includes(
              'transplanted',
          ) &&
          (
              growingChange ===
                  'growing-setup' ||
              growingChange ===
                  'both'
          );

      return {
          plantStoryId:
              plant.id,

          fromGrowingPlaceId:
              changesPlace
                  ? (
                      existing
                          ?.fromGrowingPlaceId ??
                      plant
                          .currentGrowingPlaceId
                  )
                  : undefined,

          toGrowingPlaceId:
              changesPlace
                  ? (
                      toGrowingPlaceId ||
                      undefined
                  )
                  : undefined,

          fromGrowingSetupIds:
              changesSetup
                  ? (
                      existing
                          ?.fromGrowingSetupIds
                          ? [
                              ...existing
                                  .fromGrowingSetupIds,
                          ]
                          : getPlantGrowingSetupIds(
                              plant,
                          )
                  )
                  : undefined,

          toGrowingSetupIds:
              changesSetup
                  ? [
                      ...toGrowingSetupIds,
                  ]
                  : undefined,
      };
  }


  /* =======================================
     CHOOSE LOCATION SCOPE
  ======================================= */

  function chooseGrowingPlaceScope(
      scope:
          GrowingPlaceScope,
  ) {
      setGrowingPlaceScope(
          scope,
      );

      if (
          scope ===
              'none' ||
          scope ===
              'entire-garden'
      ) {
          setGrowingPlaceIds(
              [],
          );
      }

      if (
          scope ===
              'single' &&
          startingGrowingPlaceId &&
          growingPlaceIds.length ===
              0
      ) {
          setGrowingPlaceIds(
              [
                  startingGrowingPlaceId,
              ],
          );
      }
  }


  /* =======================================
     CHOOSE PLANT SCOPE
  ======================================= */

  function choosePlantScope(
      scope:
          PlantScope,
  ) {
      setPlantScope(
          scope,
      );

      if (
          scope ===
          'none'
      ) {
          setPlantStoryIds(
              [],
          );

          return;
      }

      if (
          scope ===
              'single' &&
          startingPlant
      ) {
          setPlantStoryIds(
              [
                  startingPlant.id,
              ],
          );

          return;
      }

      if (
          scope ===
          'all-plants'
      ) {
          setPlantStoryIds(
              plants.map(
                  plant =>
                      plant.id,
              ),
          );
      }
  }


  /* =======================================
     TOGGLE ACTIVITY
  ======================================= */

  function toggleActivity(
      activity:
          EventType,
  ) {
      setActivityTypes(
          current => {
              if (
                  current.includes(
                      activity,
                  )
              ) {
                  return current.filter(
                      item =>
                          item !==
                          activity,
                  );
              }

              return [
                  ...current,
                  activity,
              ];
          },
      );
  }


  /* =======================================
     SELECT VISIBLE PLANTS
  ======================================= */

  function selectVisiblePlants() {
      setPlantStoryIds(
          current =>
              Array.from(
                  new Set(
                      [
                          ...current,
                          ...visibleUnselectedPlantIds,
                      ],
                  ),
              ),
      );

      setPlantScope(
          'multiple',
      );
  }


  function clearSelectedPlants() {
      setPlantStoryIds(
          [],
      );

      setPlantScope(
          'multiple',
      );
  }


  /* =======================================
     OPEN HARVEST
  ======================================= */

  function openHarvestRecord() {
      if (
          !onAddHarvest
      ) {
          return;
      }

      onAddHarvest(
          [
              ...plantStoryIds,
          ],
      );
  }


  /* =======================================
     QUICK ADD GROWING SETUP
  ======================================= */

  function handleQuickAddGrowingSetup() {
      if (
          !quickGrowingSetupCategory
      ) {
          return;
      }

      const trimmedName =
          quickGrowingSetupName
              .trim();

      if (
          !trimmedName
      ) {
          return;
      }

      const existingSetup =
          growingSetups.find(
              setup =>
                  setup.category ===
                      quickGrowingSetupCategory &&
                  setup.name
                      .trim()
                      .toLowerCase() ===
                  trimmedName
                      .toLowerCase(),
          );

      const setup =
          existingSetup ??
          createQuickGrowingSetup(
              trimmedName,
              quickGrowingSetupCategory,
              today,
          );

      if (
          !existingSetup
      ) {
          onAddRecipe(
              setup,
          );
      }

      setToGrowingSetupIds(
          current =>
              current.includes(
                  setup.id,
              )
                  ? current
                  : [
                      ...current,
                      setup.id,
                  ],
      );

      setQuickGrowingSetupCategory(
          null,
      );

      setQuickGrowingSetupName(
          '',
      );
  }


  /* =======================================
     SAVE JOURNAL ENTRY
  ======================================= */

  function handleSubmit(
      formEvent:
          FormEvent<HTMLFormElement>,
  ) {
      formEvent.preventDefault();

      if (
          isSubmittingRef.current
      ) {
          return;
      }

      isSubmittingRef.current =
          true;

      setIsSubmitting(
          true,
      );

      const primaryType =
          activityTypes[0] ??
          'observation';

      const generatedTitle =
          activityOptions
              .filter(
                  option =>
                      activityTypes.includes(
                          option.value,
                      ),
              )
              .map(
                  option =>
                      option.label,
              )
              .join(
                  ', ',
              );

      const savedPhotoMetadata =
          photoUrls.map(
              (
                  photoUrl,
                  index,
              ) => {
                  const metadata =
                      photoMetadata[
                          index
                      ];

                  return {
                      ...metadata,

                      photoUrl:
                          metadata
                              ?.photoUrl ??
                          photoUrl,

                      photoDate:
                          metadata
                              ?.photoDate ??
                          date,

                      purpose:
                          metadata
                              ?.purpose ??
                          (
                              primaryType ===
                                  'observation'
                                  ? 'observation'
                                  : undefined
                          ),
                  } satisfies
                      SprigPhotoMetadata;
              },
          );

      const isMoved =
          activityTypes.includes(
              'moved',
          );

      const isTransplanted =
          activityTypes.includes(
              'transplanted',
          );

      const selectedPlants =
          plants.filter(
              plant =>
                  plantStoryIds.includes(
                      plant.id,
                  ),
          );

      const plantGrowingTransitions =
          (
              isMoved ||
              isTransplanted
          )
              ? selectedPlants.map(
                  buildPlantGrowingTransition,
              )
              : undefined;

      const firstTransition =
          plantGrowingTransitions?.[
              0
          ];

      const savedEvent:
          GardenEvent = {
              ...(
                  eventToEdit ??
                  {}
              ),

              id:
                  eventToEdit
                      ?.id ??
                  crypto
                      .randomUUID(),

              type:
                  primaryType,

              activityTypes:
                  [
                      ...activityTypes,
                  ],

              date,

              title:
                  title.trim() ||
                  generatedTitle ||
                  'Garden moment',

              productIds:
                  productIds.length >
                      0
                      ? [
                          ...productIds,
                      ]
                      : undefined,

              productUsed:
                  productUsed
                      .trim() ||
                  undefined,

              treatmentReason:
                  activityTypes.includes(
                      'treated',
                  )
                      ? treatmentReason
                          .trim() ||
                      undefined
                      : undefined,

              notes:
                  notes.trim() ||
                  undefined,

              growingPlaceScope:
                  isMoved ||
                  isTransplanted
                      ? toGrowingPlaceId
                          ? 'single'
                          : 'none'
                      : growingPlaceScope,

              growingPlaceIds:
                  isMoved ||
                  isTransplanted
                      ? toGrowingPlaceId
                          ? [
                              toGrowingPlaceId,
                          ]
                          : []
                      : [
                          ...growingPlaceIds,
                      ],

              growingChange:
                  isMoved
                      ? 'growing-place'
                      : isTransplanted
                          ? growingChange
                          : undefined,

              transplantKind:
                  isTransplanted &&
                  transplantKind
                      ? transplantKind
                      : undefined,

              customTransplantLabel:
                  isTransplanted &&
                  transplantKind ===
                      'other'
                      ? customTransplantLabel
                          .trim() ||
                      undefined
                      : undefined,

              plantGrowingTransitions,

              /*
               * Compatibility fields.
               *
               * Single-Plant Moments keep the
               * original fields populated so old
               * readers continue to understand
               * them. Multi-Plant provenance lives
               * in plantGrowingTransitions.
               */
              fromGrowingPlaceId:
                  plantGrowingTransitions
                      ?.length ===
                      1
                      ? firstTransition
                          ?.fromGrowingPlaceId
                      : undefined,

              toGrowingPlaceId:
                  isMoved ||
                  (
                      isTransplanted &&
                      (
                          growingChange ===
                              'growing-place' ||
                          growingChange ===
                              'both'
                      )
                  )
                      ? toGrowingPlaceId ||
                      undefined
                      : undefined,

              fromGrowingSetupIds:
                  plantGrowingTransitions
                      ?.length ===
                      1
                      ? firstTransition
                          ?.fromGrowingSetupIds
                      : undefined,

              toGrowingSetupIds:
                  isTransplanted &&
                  (
                      growingChange ===
                          'growing-setup' ||
                      growingChange ===
                          'both'
                  )
                      ? [
                          ...toGrowingSetupIds,
                      ]
                      : undefined,

              photoUrls:
                  [
                      ...photoUrls,
                  ],

              photoMetadata:
                  savedPhotoMetadata,

              plantScope:
                  plantStoryIds.length ===
                      plants.length &&
                  plants.length >
                      0
                      ? 'all-plants'
                      : plantStoryIds.length >
                          1
                          ? 'multiple'
                          : plantStoryIds.length ===
                              1
                              ? 'single'
                              : 'none',

              plantStoryIds:
                  [
                      ...plantStoryIds,
                  ],
          };

      try {
          if (
              isEditing
          ) {
              if (
                  !onUpdateEvent
              ) {
                  throw new Error(
                      'Edit Journal Entry requires onUpdateEvent.',
                  );
              }

              onUpdateEvent(
                  savedEvent,
              );
          }
          else {
              onAddEvent(
                  savedEvent,
              );
          }

          onClose();
      }
      catch (
          error
      ) {
          console.error(
              'Unable to save Journal entry:',
              error,
          );

          isSubmittingRef.current =
              false;

          setIsSubmitting(
              false,
          );
      }
  }


  const transplantKindOptions:
      GardenEventTransplantKind[] = [
          'potted-up',
          'container-to-ground',
          'ground-to-container',
          'place-to-place',
          'other',
      ];


  return (
      <div
          className="form-backdrop"
          role="presentation"
      >
          <FormTemplate ariaLabelledBy="add-event-title">
                  <h2
                      id="add-event-title"
                      className="notebook-page-title"
                  >
                      {isEditing
                          ? 'Edit Journal Entry'
                          : isRecordingPlan
                              ? 'Record what happened'
                              : 'Journal Entry'}
                  </h2>

                  <button
                      type="button"
                      className="close-button"
                      onClick={
                          onClose
                      }
                      disabled={
                          isSubmitting
                      }
                      aria-label={
                          isEditing
                              ? 'Close Journal editor'
                              : 'Close Journal entry'
                      }
                  >
                      ×
                  </button>

                  <form
                      id="sprig-journal-entry-form"
                      className="add-plant-form journal-entry-form"
                      onSubmit={
                          handleSubmit
                      }
                  >
                      {isRecordingPlan &&
                          planToRecord && (
                              <section className="sprig-form-section growing-setup-details">
                                  <p className="section-label">
                                      From Garden Plan
                                  </p>

                                  <h3>
                                      {planToRecord.title}
                                  </h3>

                                  <p className="form-whisper">
                                      Sprig has carried the intention into
                                      this Journal page. Change anything
                                      that happened differently before
                                      you save it.
                                  </p>

                                  <p className="form-whisper">
                                      The Garden Plan remains the record
                                      of what you intended. This page
                                      records what actually happened.
                                  </p>
                              </section>
                          )}

                      {isEditing && (
                          <p className="form-whisper">
                              ✏ Change anything that needs correcting.
                              Sprig will update this same Journal page,
                              not create another.
                          </p>
                      )}

                      {startingPlant &&
                          !isRecordingPlan && (
                              <p className="form-whisper">
                                  🌱 Adding to{' '}
                                  {startingPlant.displayName}
                                  &apos;s story
                              </p>
                          )}

                      <div className="journal-entry-heading-row">
                          <label className="journal-title-field">
                              Give this page a title

                              <input
                                  value={
                                      title
                                  }
                                  onChange={
                                      event =>
                                          setTitle(
                                              event.target.value,
                                          )
                                  }
                                  placeholder="Watered the front"
                              />
                          </label>

                          <label className="journal-date-field">
                              When

                              <input
                                  type="date"
                                  value={
                                      date
                                  }
                                  onChange={
                                      event =>
                                          setDate(
                                              event.target.value,
                                          )
                                  }
                              />
                          </label>
                      </div>

                      {isRecordingPlan && (
                          <p className="form-whisper">
                              This began with the planned date.
                              Change it to the date it actually happened.
                          </p>
                      )}

                      <SprigPicker
                          title="What happened?"
                          options={
                              activityOptions
                          }
                          selectedValues={
                              activityTypes
                          }
                          isOpen={
                              isActivityPickerOpen
                          }
                          onToggleOpen={() =>
                              setIsActivityPickerOpen(
                                  current =>
                                      !current,
                              )
                          }
                          onToggleValue={
                              toggleActivity
                          }
                      />

                      {onAddHarvest &&
                          activityTypes.length ===
                              0 && (
                              <section className="sprig-form-section growing-setup-details">
                                  <p className="section-label">
                                      Harvest
                                  </p>

                                  <p className="form-whisper">
                                      Gathered something from the garden?
                                      Harvest has its own record so Sprig
                                      can remember quantities, quality,
                                      timing and what the plant did
                                      afterwards.
                                  </p>

                                  <button
                                      type="button"
                                      className="secondary-button"
                                      onClick={
                                          openHarvestRecord
                                      }
                                  >
                                      🧺 Record a Harvest
                                  </button>
                              </section>
                          )}

                      {(
                          isMoved ||
                          isTransplanted
                      ) ? (
                          <section className="journal-connection-section">
                              <div className="journal-section-heading">
                                  <h5>
                                      {isTransplanted
                                          ? 'What changed when it was transplanted?'
                                          : 'Where was it moved?'}
                                  </h5>
                              </div>

                              {isTransplanted && (
                                  <>
                                      <p className="form-whisper">
                                          Tell Garden of Mine what kind
                                          of transplant happened. The
                                          actual before and after growing
                                          context is kept with each
                                          affected Plant Story.
                                      </p>

                                      <div className="journal-simple-choice-row">
                                          {transplantKindOptions.map(
                                              kind => (
                                                  <button
                                                      key={
                                                          kind
                                                      }
                                                      type="button"
                                                      className={
                                                          transplantKind ===
                                                              kind
                                                              ? 'secondary-button selected'
                                                              : 'secondary-button'
                                                      }
                                                      onClick={() =>
                                                          setTransplantKind(
                                                              kind,
                                                          )
                                                      }
                                                  >
                                                      {getTransplantKindLabel(
                                                          kind,
                                                      )}
                                                  </button>
                                              ),
                                          )}
                                      </div>

                                      {transplantKind ===
                                          'other' && (
                                          <label>
                                              What kind of transplant?

                                              <input
                                                  type="text"
                                                  value={
                                                      customTransplantLabel
                                                  }
                                                  onChange={
                                                      event =>
                                                          setCustomTransplantLabel(
                                                              event.target.value,
                                                          )
                                                  }
                                                  placeholder="Describe what changed"
                                              />
                                          </label>
                                      )}

                                      <p className="form-whisper">
                                          What changed in Garden of Mine?
                                      </p>

                                      <div className="journal-simple-choice-row">
                                          <button
                                              type="button"
                                              className={
                                                  growingChange ===
                                                      'growing-place'
                                                      ? 'secondary-button selected'
                                                      : 'secondary-button'
                                              }
                                              onClick={() =>
                                                  setGrowingChange(
                                                      'growing-place',
                                                  )
                                              }
                                          >
                                              Growing Place
                                          </button>

                                          <button
                                              type="button"
                                              className={
                                                  growingChange ===
                                                      'growing-setup'
                                                      ? 'secondary-button selected'
                                                      : 'secondary-button'
                                              }
                                              onClick={() =>
                                                  setGrowingChange(
                                                      'growing-setup',
                                                  )
                                              }
                                          >
                                              Growing Setup
                                          </button>

                                          <button
                                              type="button"
                                              className={
                                                  growingChange ===
                                                      'both'
                                                      ? 'secondary-button selected'
                                                      : 'secondary-button'
                                              }
                                              onClick={() =>
                                                  setGrowingChange(
                                                      'both',
                                                  )
                                              }
                                          >
                                              Both
                                          </button>
                                      </div>
                                  </>
                              )}

                              {(
                                  isMoved ||
                                  growingChange ===
                                      'growing-place' ||
                                  growingChange ===
                                      'both'
                              ) && (
                                  <div className="sprig-form-section growing-setup-details">
                                      <p className="section-label">
                                          New Growing Place
                                      </p>

                                      {plantStoryIds.length >
                                          0 && (
                                          <p className="form-whisper">
                                              Garden of Mine already
                                              knows where each selected
                                              Plant Story is coming from.
                                              You only need to choose
                                              where they are going.
                                          </p>
                                      )}

                                      <SprigPicker
                                          title="To Growing Place"
                                          variant="label"
                                          emptySummary="Choose the new Growing Place"
                                          options={
                                              growingPlaces.map(
                                                  place => ({
                                                      value:
                                                          place.id,

                                                      label:
                                                          place.name,
                                                  }),
                                              )
                                          }
                                          selectedValues={
                                              toGrowingPlaceId
                                                  ? [
                                                      toGrowingPlaceId,
                                                  ]
                                                  : []
                                          }
                                          isOpen={
                                              isToGrowingPlacePickerOpen
                                          }
                                          onToggleOpen={() =>
                                              setIsToGrowingPlacePickerOpen(
                                                  current =>
                                                      !current,
                                              )
                                          }
                                          onToggleValue={
                                              id => {
                                                  setToGrowingPlaceId(
                                                      id,
                                                  );

                                                  setIsToGrowingPlacePickerOpen(
                                                      false,
                                                  );
                                              }
                                          }
                                      />

                                      <button
                                          type="button"
                                          className="secondary-button"
                                          onClick={() =>
                                              setGrowingPlaceQuickAddTarget(
                                                  'destination',
                                              )
                                          }
                                      >
                                          + Add a Growing Place
                                      </button>
                                  </div>
                              )}

                              {isTransplanted &&
                                  (
                                      growingChange ===
                                          'growing-setup' ||
                                      growingChange ===
                                          'both'
                                  ) && (
                                      <div className="sprig-form-section growing-setup-details">
                                          <p className="section-label">
                                              New Growing Setup
                                          </p>

                                          <p className="form-whisper">
                                              Garden of Mine will preserve
                                              what each selected Plant
                                              Story grew in before this
                                              Moment. Choose what they
                                              grow in now.
                                          </p>

                                          <SprigPicker
                                              title="To Growing Setup"
                                              variant="label"
                                              emptySummary="Choose what the plants now grow in"
                                              options={
                                                  growingSetups.map(
                                                      setup => ({
                                                          value:
                                                              setup.id,

                                                          label:
                                                              setup.name,

                                                          subtitle:
                                                              getGrowingSetupCategoryLabel(
                                                                  setup.category,
                                                              ),
                                                      }),
                                                  )
                                              }
                                              selectedValues={
                                                  toGrowingSetupIds
                                              }
                                              isOpen={
                                                  isToGrowingSetupPickerOpen
                                              }
                                              onToggleOpen={() =>
                                                  setIsToGrowingSetupPickerOpen(
                                                      current =>
                                                          !current,
                                                  )
                                              }
                                              onToggleValue={
                                                  id =>
                                                      setToGrowingSetupIds(
                                                          current =>
                                                              current.includes(
                                                                  id,
                                                              )
                                                                  ? current.filter(
                                                                      item =>
                                                                          item !==
                                                                          id,
                                                                  )
                                                                  : [
                                                                      ...current,
                                                                      id,
                                                                  ],
                                                      )
                                              }
                                          />

                                          {!quickGrowingSetupCategory ? (
                                              <button
                                                  type="button"
                                                  className="secondary-button"
                                                  onClick={() =>
                                                      setQuickGrowingSetupCategory(
                                                          'own-mix',
                                                      )
                                                  }
                                              >
                                                  + Add what it grows in
                                              </button>
                                          ) : (
                                              <div className="plant-growing-quick-create">
                                                  <p className="section-label">
                                                      Add what it grows in
                                                  </p>

                                                  <p className="form-whisper">
                                                      Choose the kind of
                                                      Growing record first.
                                                      Garden of Mine will
                                                      save it in the correct
                                                      category and select it
                                                      for this transplant.
                                                  </p>

                                                  <div className="journal-simple-choice-row">
                                                      {([
                                                          'own-mix',
                                                          'bought-mix',
                                                          'growing-system',
                                                          'ground-type',
                                                      ] as GrowingSetupCategory[]).map(
                                                          category => (
                                                              <button
                                                                  key={
                                                                      category
                                                                  }
                                                                  type="button"
                                                                  className={
                                                                      quickGrowingSetupCategory ===
                                                                          category
                                                                          ? 'secondary-button selected'
                                                                          : 'secondary-button'
                                                                  }
                                                                  onClick={() =>
                                                                      setQuickGrowingSetupCategory(
                                                                          category,
                                                                      )
                                                                  }
                                                              >
                                                                  {getGrowingSetupCategoryLabel(
                                                                      category,
                                                                  )}
                                                              </button>
                                                          ),
                                                      )}
                                                  </div>

                                                  <label>
                                                      {getGrowingSetupCategoryLabel(
                                                          quickGrowingSetupCategory,
                                                      )}{' '}
                                                      name

                                                      <input
                                                          type="text"
                                                          value={
                                                              quickGrowingSetupName
                                                          }
                                                          onChange={
                                                              event =>
                                                                  setQuickGrowingSetupName(
                                                                      event.target.value,
                                                                  )
                                                          }
                                                          placeholder="Name this Growing record"
                                                          onKeyDown={
                                                              event => {
                                                                  if (
                                                                      event.key ===
                                                                      'Enter'
                                                                  ) {
                                                                      event.preventDefault();

                                                                      handleQuickAddGrowingSetup();
                                                                  }
                                                              }
                                                          }
                                                          autoFocus
                                                      />
                                                  </label>

                                                  <div className="plant-growing-quick-actions">
                                                      <button
                                                          type="button"
                                                          className="secondary-button"
                                                          onClick={() => {
                                                              setQuickGrowingSetupCategory(
                                                                  null,
                                                              );

                                                              setQuickGrowingSetupName(
                                                                  '',
                                                              );
                                                          }}
                                                      >
                                                          Cancel
                                                      </button>

                                                      <button
                                                          type="button"
                                                          className="enter-button"
                                                          disabled={
                                                              !quickGrowingSetupName
                                                                  .trim()
                                                          }
                                                          onClick={
                                                              handleQuickAddGrowingSetup
                                                          }
                                                      >
                                                          Add and select
                                                      </button>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  )}
                          </section>
                      ) : (
                          <section className="journal-connection-section">
                              <div className="journal-section-heading">
                                  <h5>
                                      Where did this happen?
                                  </h5>
                              </div>

                              <p className="form-whisper">
                                  Growing Place is useful context and
                                  can also narrow the Plant Stories
                                  below. It does not replace the actual
                                  Plant Story relationships.
                              </p>

                              <label>
                                  Location scope

                                  <select
                                      value={
                                          growingPlaceScope
                                      }
                                      onChange={
                                          event =>
                                              chooseGrowingPlaceScope(
                                                  event.target
                                                      .value as
                                                      GrowingPlaceScope,
                                              )
                                      }
                                  >
                                      <option value="none">
                                          No particular place
                                      </option>

                                      <option value="single">
                                          One Growing Place
                                      </option>

                                      <option value="multiple">
                                          Several Growing Places
                                      </option>

                                      <option value="entire-garden">
                                          Whole garden
                                      </option>
                                  </select>
                              </label>

                              {(
                                  growingPlaceScope ===
                                      'single' ||
                                  growingPlaceScope ===
                                      'multiple'
                              ) && (
                                  <SprigPicker
                                      title="Choose Growing Place"
                                      emptySummary="Choose a Growing Place"
                                      options={
                                          growingPlaces.map(
                                              place => ({
                                                  value:
                                                      place.id,

                                                  label:
                                                      place.name,
                                              }),
                                          )
                                      }
                                      selectedValues={
                                          growingPlaceIds
                                      }
                                      isOpen={
                                          isGrowingPlacePickerOpen
                                      }
                                      onToggleOpen={() =>
                                          setIsGrowingPlacePickerOpen(
                                              current =>
                                                  !current,
                                          )
                                      }
                                      onToggleValue={
                                          id => {
                                              if (
                                                  growingPlaceScope ===
                                                  'single'
                                              ) {
                                                  setGrowingPlaceIds(
                                                      [
                                                          id,
                                                      ],
                                                  );

                                                  setIsGrowingPlacePickerOpen(
                                                      false,
                                                  );

                                                  return;
                                              }

                                              setGrowingPlaceIds(
                                                  current =>
                                                      current.includes(
                                                          id,
                                                      )
                                                          ? current.filter(
                                                              item =>
                                                                  item !==
                                                                  id,
                                                          )
                                                          : [
                                                              ...current,
                                                              id,
                                                          ],
                                              );
                                          }
                                      }
                                  />
                              )}

                              {(
                                  growingPlaceScope ===
                                      'single' ||
                                  growingPlaceScope ===
                                      'multiple'
                              ) && (
                                  <button
                                      type="button"
                                      className="secondary-button"
                                      onClick={() =>
                                          setGrowingPlaceQuickAddTarget(
                                              'context',
                                          )
                                      }
                                  >
                                      + Add a Growing Place
                                  </button>
                              )}
                          </section>
                      )}

{(
                            !startingPlant ||
                            isEditing ||
                            isRecordingPlan
                        ) && (
                            <section className="journal-connection-section">
                                <div className="journal-section-heading">
                                    <h5>
                                        Which Plant Stories were involved?
                                    </h5>
                                </div>

                                <p className="form-whisper">
                                    One Moment can belong to every Plant
                                    Story it actually affected. Filter the
                                    garden, select the matching stories,
                                    then remove any exceptions.
                                </p>

                                <div className="scope-card-grid plant-scope-grid">
                                    <SelectionCard
                                        title="One Plant"
                                        icon="🌱"
                                        isSelected={
                                            plantScope ===
                                            'single'
                                        }
                                        onClick={() =>
                                            choosePlantScope(
                                                'single',
                                            )
                                        }
                                    />

                                    <SelectionCard
                                        title="Several Plants"
                                        icon="🌿"
                                        isSelected={
                                            plantScope ===
                                            'multiple'
                                        }
                                        onClick={() =>
                                            choosePlantScope(
                                                'multiple',
                                            )
                                        }
                                    />

                                    <SelectionCard
                                        title="All Plants"
                                        icon="🌳"
                                        isSelected={
                                            plantScope ===
                                            'all-plants'
                                        }
                                        onClick={() =>
                                            choosePlantScope(
                                                'all-plants',
                                            )
                                        }
                                    />
                                </div>

                                {(
                                    plantScope ===
                                        'single' ||
                                    plantScope ===
                                        'multiple'
                                ) && (
                                    <>
                                        <div className="sprig-form-section growing-setup-details">
                                            <p className="section-label">
                                                Find the stories
                                            </p>

                                            <label>
                                                Search

                                                <input
                                                    type="search"
                                                    value={
                                                        plantSearch
                                                    }
                                                    onChange={
                                                        event =>
                                                            setPlantSearch(
                                                                event.target.value,
                                                            )
                                                    }
                                                    placeholder="Crop, variety, story or place"
                                                />
                                            </label>

                                            <div className="journal-entry-heading-row">
                                                <label>
                                                    Crop

                                                    <select
                                                        value={
                                                            cropFilter
                                                        }
                                                        onChange={
                                                            event =>
                                                                setCropFilter(
                                                                    event.target.value,
                                                                )
                                                        }
                                                    >
                                                        <option value="all">
                                                            All crops
                                                        </option>

                                                        {cropOptions.map(
                                                            crop => (
                                                                <option
                                                                    key={
                                                                        crop
                                                                    }
                                                                    value={
                                                                        crop
                                                                    }
                                                                >
                                                                    {crop}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </label>

                                                <label>
                                                    Growing Place

                                                    <select
                                                        value={
                                                            plantPlaceFilter
                                                        }
                                                        onChange={
                                                            event =>
                                                                setPlantPlaceFilter(
                                                                    event.target.value,
                                                                )
                                                        }
                                                    >
                                                        <option value="all">
                                                            All places
                                                        </option>

                                                        {growingPlaces.map(
                                                            place => (
                                                                <option
                                                                    key={
                                                                        place.id
                                                                    }
                                                                    value={
                                                                        place.id
                                                                    }
                                                                >
                                                                    {place.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </label>
                                            </div>

                                            <div className="journal-entry-heading-row">
                                                <label>
                                                    Status

                                                    <select
                                                        value={
                                                            statusFilter
                                                        }
                                                        onChange={
                                                            event =>
                                                                setStatusFilter(
                                                                    event.target
                                                                        .value as
                                                                        PlantStatus |
                                                                        'all',
                                                                )
                                                        }
                                                    >
                                                        <option value="all">
                                                            Any status
                                                        </option>

                                                        <option value="growing">
                                                            Growing
                                                        </option>

                                                        <option value="harvesting">
                                                            Harvesting
                                                        </option>

                                                        <option value="planned">
                                                            Planned
                                                        </option>

                                                        <option value="finished">
                                                            Finished
                                                        </option>

                                                        <option value="failed">
                                                            Failed
                                                        </option>
                                                    </select>
                                                </label>

                                                <label>
                                                    At least this old

                                                    <div className="journal-entry-heading-row">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.5"
                                                            inputMode="decimal"
                                                            value={
                                                                minimumAgeWeeks
                                                            }
                                                            onChange={
                                                                event =>
                                                                    setMinimumAgeWeeks(
                                                                        event.target.value,
                                                                    )
                                                            }
                                                            placeholder="6"
                                                        />

                                                        <span className="form-whisper">
                                                            weeks
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>

                                            {plantScope ===
                                                'multiple' && (
                                                <div className="plant-growing-quick-actions">
                                                    <button
                                                        type="button"
                                                        className="secondary-button"
                                                        onClick={
                                                            selectVisiblePlants
                                                        }
                                                        disabled={
                                                            visibleUnselectedPlantIds.length ===
                                                            0
                                                        }
                                                    >
                                                        Select all matching
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="secondary-button"
                                                        onClick={
                                                            clearSelectedPlants
                                                        }
                                                        disabled={
                                                            plantStoryIds.length ===
                                                            0
                                                        }
                                                    >
                                                        Clear selection
                                                    </button>
                                                </div>
                                            )}

                                            <p className="form-whisper">
                                                {plantStoryIds.length}{' '}
                                                {plantStoryIds.length ===
                                                    1
                                                    ? 'Plant Story selected'
                                                    : 'Plant Stories selected'}
                                                {' · '}
                                                {filteredPlants.length}{' '}
                                                showing
                                            </p>
                                        </div>

                                        <SprigPicker
                                            title={
                                                plantScope ===
                                                'single'
                                                    ? 'Choose Plant Story'
                                                    : 'Choose Plant Stories'
                                            }
                                            variant="label"
                                            emptySummary={
                                                plantScope ===
                                                'single'
                                                    ? 'Choose a Plant Story'
                                                    : 'Choose the Plant Stories this Moment affected'
                                            }
                                            options={
                                                filteredPlants.map(
                                                    plant => {
                                                        const growingPlace =
                                                            growingPlaces.find(
                                                                place =>
                                                                    place.id ===
                                                                    plant
                                                                        .currentGrowingPlaceId,
                                                            );

                                                        const age =
                                                            formatPlantAge(
                                                                plant,
                                                                date,
                                                            );

                                                        const planted =
                                                            formatPlantDate(
                                                                plant.plantedDate,
                                                            );

                                                        const subtitleParts =
                                                            [
                                                                age,
                                                                growingPlace
                                                                    ?.name,
                                                            ].filter(
                                                                Boolean,
                                                            );

                                                        return {
                                                            value:
                                                                plant.id,

                                                            label:
                                                                plant.displayName,

                                                            subtitle:
                                                                subtitleParts
                                                                    .join(
                                                                        ' · ',
                                                                    ) ||
                                                                undefined,

                                                            meta:
                                                                planted
                                                                    ? `Planted ${planted}`
                                                                    : undefined,
                                                        };
                                                    },
                                                )
                                            }
                                            selectedValues={
                                                plantStoryIds
                                            }
                                            isOpen={
                                                isPlantPickerOpen
                                            }
                                            onToggleOpen={() =>
                                                setIsPlantPickerOpen(
                                                    current =>
                                                        !current,
                                                )
                                            }
                                            onToggleValue={
                                                id => {
                                                    if (
                                                        plantScope ===
                                                        'single'
                                                    ) {
                                                        setPlantStoryIds(
                                                            [
                                                                id,
                                                            ],
                                                        );

                                                        setIsPlantPickerOpen(
                                                            false,
                                                        );

                                                        return;
                                                    }

                                                    setPlantStoryIds(
                                                        current =>
                                                            current.includes(
                                                                id,
                                                            )
                                                                ? current.filter(
                                                                    item =>
                                                                        item !==
                                                                        id,
                                                                )
                                                                : [
                                                                    ...current,
                                                                    id,
                                                                ],
                                                    );
                                                }
                                            }
                                        />
                                    </>
                                )}

                                {plantScope ===
                                    'all-plants' && (
                                    <p className="form-whisper">
                                        This Moment is explicitly linked
                                        to all {plantStoryIds.length}{' '}
                                        current Plant Stories, rather than
                                        relying on a vague whole-garden
                                        label.
                                    </p>
                                )}
                            </section>
                        )}

                        {startingPlant &&
                            !isEditing &&
                            !isRecordingPlan && (
                                <section className="journal-connection-section">
                                    <div className="journal-section-heading">
                                        <h5>
                                            Plant Story
                                        </h5>
                                    </div>

                                    <p className="form-whisper">
                                        This Moment is linked to{' '}
                                        <strong>
                                            {startingPlant.displayName}
                                        </strong>
                                        . Its current Growing Place and
                                        Growing Setup are already known
                                        and will be used as the before-state
                                        if this Moment moves or transplants it.
                                    </p>
                                </section>
                            )}

                        {activityTypes.includes(
                            'treated',
                        ) && (
                            <section className="sprig-form-section growing-setup-details">
                                <p className="section-label">
                                    Treatment context
                                </p>

                                <label>
                                    What were you treating, or why?

                                    <textarea
                                        rows={
                                            3
                                        }
                                        value={
                                            treatmentReason
                                        }
                                        onChange={
                                            event =>
                                                setTreatmentReason(
                                                    event.target.value,
                                                )
                                        }
                                        placeholder="Aphids on new growth, powdery mildew, preventative treatment..."
                                    />
                                </label>

                                <p className="form-whisper">
                                    Keep this in your own words. Products
                                    used for the treatment are linked below.
                                </p>
                            </section>
                        )}

                        {shouldShowProducts && (
                            <section className="journal-connection-section">
                                <div className="journal-section-heading">
                                    <h5>
                                        Products used
                                    </h5>
                                </div>

                                <p className="form-whisper">
                                    Link the actual Products used in this
                                    Moment. You can choose more than one.
                                </p>

                                {availableProducts.length >
                                    0 ? (
                                    <SprigPicker
                                        title="Choose Products"
                                        variant="label"
                                        emptySummary="Choose saved Products"
                                        options={
                                            availableProducts.map(
                                                product => {
                                                    const category =
                                                        getProductCategoryLabel(
                                                            product,
                                                        );

                                                    return {
                                                        value:
                                                            product.id,

                                                        label:
                                                            product.name,

                                                        subtitle:
                                                            product.brand
                                                                ?.trim() ||
                                                            category,

                                                        meta:
                                                            product.brand
                                                                ?.trim() &&
                                                            category
                                                                ? category
                                                                : undefined,
                                                    };
                                                },
                                            )
                                        }
                                        selectedValues={
                                            productIds
                                        }
                                        isOpen={
                                            isProductPickerOpen
                                        }
                                        onToggleOpen={() =>
                                            setIsProductPickerOpen(
                                                current =>
                                                    !current,
                                            )
                                        }
                                        onToggleValue={
                                            id =>
                                                setProductIds(
                                                    current =>
                                                        current.includes(
                                                            id,
                                                        )
                                                            ? current.filter(
                                                                item =>
                                                                    item !==
                                                                    id,
                                                            )
                                                            : [
                                                                ...current,
                                                                id,
                                                            ],
                                                )
                                        }
                                    />
                                ) : (
                                    <p className="form-whisper">
                                        No saved Products match yet.
                                    </p>
                                )}

                                {onAddProduct && (
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() =>
                                            setIsProductQuickAddOpen(
                                                true,
                                            )
                                        }
                                    >
                                        + Add a Product
                                    </button>
                                )}

                                <label>
                                    Something else you used

                                    <input
                                        value={
                                            productUsed
                                        }
                                        onChange={
                                            event =>
                                                setProductUsed(
                                                    event.target.value,
                                                )
                                        }
                                        placeholder="Only when it is not a saved Product..."
                                    />
                                </label>

                                <p className="form-whisper">
                                    This free-text field remains for old
                                    records and genuine one-offs. Garden of
                                    Mine will not quietly convert your
                                    wording into a Product relationship.
                                </p>
                            </section>
                        )}

                        <label>
                            Notes to the story

                            <textarea
                                rows={
                                    5
                                }
                                value={
                                    notes
                                }
                                onChange={
                                    event =>
                                        setNotes(
                                            event.target.value,
                                        )
                                }
                                placeholder="What would future you like to remember?"
                            />
                        </label>

                        {isRecordingPlan &&
                            planToRecord
                                ?.notes && (
                                <p className="form-whisper">
                                    Your Plan note was carried across as
                                    a starting point. Rewrite it if reality
                                    needs different wording.
                                </p>
                            )}

                        <SprigPhotoPicker
                            photoUrls={
                                photoUrls
                            }
                            onChange={
                                setPhotoUrls
                            }
                            photoMetadata={
                                photoMetadata
                            }
                            onPhotoMetadataChange={
                                setPhotoMetadata
                            }
                            showPhotoContext
                            defaultNewPhotosToToday
                            title="Photographs"
                            helperText="Add the photographs from this moment. Sprig already knows the Journal page, its plants, Growing Place and date. Everything extra below is optional."
                            addButtonText="Add journal photographs"
                            photoAltPrefix="Journal photograph"
                            photoDateLabel="When was this photograph taken?"
                            photoDateHelperText="New photographs begin with today. Change the date when the photograph was taken earlier."
                            maxPhotos={
                                12
                            }
                        />

                        {isRecordingPlan && (
                            <section className="sprig-form-section growing-setup-details">
                                <p className="section-label">
                                    Plan and reality
                                </p>

                                <p className="form-whisper">
                                    Saving this page creates a real Journal
                                    record. Sprig will then link it back to
                                    the Garden Plan rather than replacing
                                    the Plan.
                                </p>
                            </section>
                        )}

                        <div className="chronicle-page-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    onClose
                                }
                                disabled={
                                    isSubmitting
                                }
                            >
                                Leave it for now
                            </button>

                            <button
                                type="submit"
                                className="enter-button"
                                disabled={
                                    isSubmitting
                                }
                                aria-disabled={
                                    isSubmitting
                                }
                            >
                                {isSubmitting
                                    ? isEditing
                                        ? 'Saving changes…'
                                        : 'Adding this page…'
                                    : isEditing
                                        ? 'Save changes'
                                        : isRecordingPlan
                                            ? 'Record this moment'
                                            : 'Add this page'}
                            </button>
                        </div>
                    </form>
      </FormTemplate>

            {growingPlaceQuickAddTarget && (
                <AddGrowingPlaceForm
                    onAddPlace={
                        place => {
                            onAddGrowingPlace(
                                place,
                            );

                            if (
                                growingPlaceQuickAddTarget ===
                                'destination'
                            ) {
                                setToGrowingPlaceId(
                                    place.id,
                                );
                            }
                            else {
                                setGrowingPlaceIds(
                                    current =>
                                        growingPlaceScope ===
                                            'multiple'
                                            ? Array.from(
                                                new Set(
                                                    [
                                                        ...current,
                                                        place.id,
                                                    ],
                                                ),
                                            )
                                            : [
                                                place.id,
                                            ],
                                );

                                if (
                                    growingPlaceScope !==
                                    'multiple'
                                ) {
                                    setGrowingPlaceScope(
                                        'single',
                                    );
                                }
                            }

                            setGrowingPlaceQuickAddTarget(
                                null,
                            );
                        }
                    }
                    onClose={() =>
                        setGrowingPlaceQuickAddTarget(
                            null,
                        )
                    }
                />
            )}

            {isProductQuickAddOpen &&
                onAddProduct && (
                    <AddProductForm
                        mode="new"
                        onSave={(
                            product,
                            purchase,
                        ) => {
                            onAddProduct(
                                product,
                            );

                            if (
                                purchase &&
                                onAddPurchase
                            ) {
                                onAddPurchase(
                                    purchase,
                                );
                            }

                            setProductIds(
                                current =>
                                    current.includes(
                                        product.id,
                                    )
                                        ? current
                                        : [
                                            ...current,
                                            product.id,
                                        ],
                            );

                            setIsProductQuickAddOpen(
                                false,
                            );

                            setIsProductPickerOpen(
                                false,
                            );
                        }}
                        onClose={() =>
                            setIsProductQuickAddOpen(
                                false,
                            )
                        }
                    />
                )}
        </div>
    );
}

