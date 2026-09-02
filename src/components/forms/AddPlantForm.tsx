import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'

import AddGrowingPlaceForm from './AddGrowingPlaceForm'

import SprigPicker from '../sprig/SprigPicker'
import SprigPhotoPicker from '../photos/SprigPhotoPicker'

import type {
  GardenPlan,
  GardenProduct,
  GrowingGroundMethod,
  GrowingGroundType,
  GrowingPlace,
  GrowingSetup,
  GrowingSetupCategory,
  Ingredient,
  PlantGrowingHistoryEntry,
  PlantHarvestTimingUnit,
  PlantOriginType,
  PlantStory,
  SeedlingFloweringState,
  StartMethod,
} from '../../types'


interface AddPlantFormProps {
  GrowingPlaces: GrowingPlace[]
  GrowingSetups: GrowingSetup[]
  Ingredients: Ingredient[]
  Products: GardenProduct[]

  onAddPlant: (
    plant: PlantStory,
  ) => void

  onUpdatePlant?: (
    plant: PlantStory,
  ) => void

  plantToEdit?: PlantStory

  variationFrom?: PlantStory

  planToRecord?: GardenPlan

  onAddGrowingPlace: (
    place: GrowingPlace,
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

  onClose: () => void
}


interface QuickPresetOption {
  value: string
  label: string
}


/* =======================================
   PLANT ID
======================================= */

function createPlantId(
  plantName: string,
): string {
  const safeName =
    plantName
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

  return `${
    safeName ||
    'plant'
  }-${Date.now()}`
}


/* =======================================
   GROWING SETUP ID
======================================= */

function createGrowingSetupId(
  name: string,
  category:
    GrowingSetupCategory,
): string {
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
      )

  return `${
    category
  }-${
    safeName ||
    'growing-setup'
  }-${Date.now()}`
}


/* =======================================
   INGREDIENT ID
======================================= */

function createIngredientId(
  name: string,
): string {
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
      )

  return `ingredient-${
    safeName ||
    'garden-material'
  }-${Date.now()}`
}


/* =======================================
   GROWING HISTORY ID
======================================= */

function createGrowingHistoryId(
  plantId: string,
  suffix: string,
): string {
  return `${plantId}-growing-history-${Date.now()}-${suffix}`
}


/* =======================================
   UNIQUE IDS
======================================= */

function uniqueIds(
  ids: Array<
    string |
    undefined
  >,
): string[] {
  return Array.from(
    new Set(
      ids.filter(
        (
          id,
        ): id is string =>
          Boolean(
            id,
          ),
      ),
    ),
  )
}


function arraysContainSameIds(
  first: string[],
  second: string[],
): boolean {
  if (
    first.length !==
    second.length
  ) {
    return false
  }

  const firstSorted =
    [...first].sort()

  const secondSorted =
    [...second].sort()

  return firstSorted.every(
    (
      value,
      index,
    ) =>
      value ===
      secondSorted[index],
  )
}


/* =======================================
   GROWING SETUP LABELS
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
      return 'Ground Type'

    case 'growing-system':
      return 'Growing System'

    default:
      return 'Growing Record'
  }
}


function getGrowingSetupCategoryHeading(
  category:
    GrowingSetupCategory,
): string {
  switch (
    category
  ) {
    case 'own-mix':
      return 'My Recipes'

    case 'bought-mix':
      return 'Bought Mixes'

    case 'ground-type':
      return 'Ground Types'

    case 'growing-system':
      return 'Growing Systems'

    default:
      return 'Growing Records'
  }
}


function getGrowingSetupCategoryHelper(
  category:
    GrowingSetupCategory,
): string {
  switch (
    category
  ) {
    case 'own-mix':
      return 'A mix or recipe you put together yourself.'

    case 'bought-mix':
      return 'A prepared soil, potting mix or other medium you bought.'

    case 'ground-type':
      return 'The existing ground or soil this plant is growing directly in.'

    case 'growing-system':
      return 'The container or growing system, such as a grow bag, wicking bed or hydroponic system.'

    default:
      return ''
  }
}


/* =======================================
   GROUND TYPE PRESETS

   Keep these aligned with Add Recipe.
======================================= */

const groundTypePresets:
  QuickPresetOption[] = [
    {
      value:
        'native-soil',
      label:
        'Native Soil',
    },
    {
      value:
        'native-clay',
      label:
        'Native Clay',
    },
    {
      value:
        'loam',
      label:
        'Loam',
    },
    {
      value:
        'sandy-soil',
      label:
        'Sandy Soil',
    },
    {
      value:
        'rocky-soil',
      label:
        'Rocky Soil',
    },
    {
      value:
        'peat-soil',
      label:
        'Peat Soil',
    },
    {
      value:
        'imported-topsoil',
      label:
        'Imported Topsoil',
    },
    {
      value:
        'not-sure',
      label:
        'Not Sure',
    },
  ]


/* =======================================
   GROWING SYSTEM PRESETS

   Keep these aligned with Add Recipe.
======================================= */

const growingSystemPresets:
  QuickPresetOption[] = [
    {
      value:
        'no-dig',
      label:
        'No-Dig',
    },
    {
      value:
        'layered-bed',
      label:
        'Layered Bed',
    },
    {
      value:
        'hugelkultur',
      label:
        'Hügelkultur',
    },
    {
      value:
        'filled-raised-bed',
      label:
        'Filled Raised Bed',
    },
    {
      value:
        'wicking-bed',
      label:
        'Wicking Bed',
    },
    {
      value:
        'hydroponic',
      label:
        'Hydroponics',
    },
    {
      value:
        'aquaponic',
      label:
        'Aquaponics',
    },
    {
      value:
        'kratky',
      label:
        'Kratky',
    },
    {
      value:
        'nft',
      label:
        'NFT',
    },
    {
      value:
        'deep-water-culture',
      label:
        'Deep Water Culture',
    },
    {
      value:
        'ebb-and-flow',
      label:
        'Ebb & Flow',
    },
    {
      value:
        'aeroponic',
      label:
        'Aeroponics',
    },
  ]


/* =======================================
   PLANT ORIGIN LABEL
======================================= */

function getPlantOriginLabel(
  originType:
    PlantOriginType,
): string {
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
   PLAN START METHOD
======================================= */

function getPlanStartingMethod(
  plan:
    GardenPlan | undefined,
): StartMethod {
  if (
    plan
      ?.plannedPlant
      ?.startMethod
  ) {
    return plan
      .plannedPlant
      .startMethod
  }

  if (
    plan?.kind ===
    'sow'
  ) {
    return 'seed'
  }

  return 'seedling'
}


/* =======================================
   PLAN TIMING REFERENCE
======================================= */

function getPlanHarvestTimingReference(
  plan:
    GardenPlan | undefined,
): PlantStory['harvestTimingReference'] {
  const timingAssumption =
    plan?.timingAssumption

  if (
    !timingAssumption
  ) {
    return undefined
  }

  return {
    sourceType:
      timingAssumption.referenceType,
  }
}


/* =======================================
   TIMING CONVERSION
======================================= */

function daysPerTimingUnit(
  unit:
    PlantHarvestTimingUnit,
): number {
  switch (
    unit
  ) {
    case 'weeks':
      return 7

    case 'months':
      return 30

    case 'days':
    default:
      return 1
  }
}


function convertDaysToDisplayValue(
  days:
    number | undefined,
  unit:
    PlantHarvestTimingUnit,
): string {
  if (
    days === undefined ||
    !Number.isFinite(
      days,
    )
  ) {
    return ''
  }

  const divisor =
    daysPerTimingUnit(
      unit,
    )

  const converted =
    days /
    divisor

  const rounded =
    Math.round(
      converted *
      100,
    ) /
    100

  return String(
    rounded,
  )
}


function convertDisplayValueToDays(
  value: string,
  unit:
    PlantHarvestTimingUnit,
): number | undefined {
  if (
    !value.trim()
  ) {
    return undefined
  }

  const numericValue =
    Number(
      value,
    )

  if (
    !Number.isFinite(
      numericValue,
    ) ||
    numericValue <
      0
  ) {
    return undefined
  }

  return Math.round(
    numericValue *
    daysPerTimingUnit(
      unit,
    ),
  )
}


function getHarvestTimingUnit(
  plant:
    PlantStory | undefined,
): PlantHarvestTimingUnit {
  return (
    plant
      ?.harvestTimingInputUnit ??
    'days'
  )
}


/* =======================================
   LEGACY + CURRENT SETUP IDS
======================================= */

function getPlantCurrentGrowingSetupIds(
  plant:
    PlantStory | undefined,
): string[] {
  if (
    !plant
  ) {
    return []
  }

  return uniqueIds([
    ...(
      plant
        .currentGrowingSetupIds ??
      []
    ),
    plant
      .currentGrowingSetupId,
  ])
}


/* =======================================
   QUICK CREATE SETUP
======================================= */

function createMinimalGrowingSetup(
  name: string,
  category:
    GrowingSetupCategory,
  today:
    string,
  structuredValue?:
    string,
): GrowingSetup {
  const baseSetup:
    GrowingSetup = {
      id:
        createGrowingSetupId(
          name,
          category,
        ),

      name:
        name.trim(),

      category,

      isFavourite:
        false,

      isArchived:
        false,

      createdAt:
        today,
    }

  if (
    category ===
      'ground-type' &&
    structuredValue
  ) {
    return {
      ...baseSetup,

      groundType:
        structuredValue as
          GrowingGroundType,
    }
  }

  if (
    category ===
      'growing-system' &&
    structuredValue
  ) {
    return {
      ...baseSetup,

      growingSystemType:
        structuredValue as
          GrowingGroundMethod,
    }
  }

  return baseSetup
}


/* =======================================
   ADD / EDIT PLANT
======================================= */

export default function AddPlantForm({
  GrowingPlaces,
  GrowingSetups,
  Ingredients,
  Products,
  onAddPlant,
  onUpdatePlant,
  plantToEdit,
  variationFrom,
  planToRecord,
  onAddGrowingPlace,
  onAddRecipe,
  onAddIngredient,
  onAddProduct,
  onClose,
}: AddPlantFormProps) {
  void Products
  void onAddProduct


  const today =
    new Date()
      .toISOString()
      .slice(
        0,
        10,
      )

  const sourcePlant =
    plantToEdit ??
    variationFrom

  const recordingPlan =
    !plantToEdit &&
    !variationFrom
      ? planToRecord
      : undefined

  const isNewPlantOutFromPlan =
    recordingPlan?.kind ===
      'plant-out' &&
    (
      recordingPlan
        .plantStoryIds ??
      []
    ).length ===
      0

  const isEditing =
    Boolean(
      plantToEdit,
    )

  const isVariation =
    Boolean(
      variationFrom,
    )

  const isRecordingPlan =
    Boolean(
      recordingPlan,
    )


  /* =======================================
     BASIC PLANT INFORMATION
  ======================================= */

  const [
    plantName,
    setPlantName,
  ] =
    useState(
      sourcePlant?.plantName ??
      recordingPlan
        ?.plannedPlant
        ?.plantName ??
      '',
    )

  const [
    variety,
    setVariety,
  ] =
    useState(
      sourcePlant?.variety ??
      recordingPlan
        ?.plannedPlant
        ?.variety ??
      '',
    )

  const [
    quantity,
    setQuantity,
  ] =
    useState(
      String(
        sourcePlant?.quantity ??
        recordingPlan
          ?.plannedPlant
          ?.quantity ??
        1,
      ),
    )


  /* =======================================
     BEGINNING
  ======================================= */

  const [
    startMethod,
    setStartMethod,
  ] =
    useState<StartMethod>(
      sourcePlant?.startMethod ??
      (
        isNewPlantOutFromPlan
          ? 'bought-plant'
          : getPlanStartingMethod(
              recordingPlan,
            )
      ),
    )

  const [
    customStartMethodLabel,
    setCustomStartMethodLabel,
  ] =
    useState(
      sourcePlant
        ?.customStartMethodLabel ??
      recordingPlan
        ?.plannedPlant
        ?.customStartMethodLabel ??
      '',
    )

  const [
    seedPotatoEyeCount,
    setSeedPotatoEyeCount,
  ] =
    useState(
      isVariation
        ? ''
        : sourcePlant
            ?.seedPotatoEyeCount !==
          undefined
          ? String(
              sourcePlant
                .seedPotatoEyeCount,
            )
          : '',
    )

  const [
    seedlingFloweringState,
    setSeedlingFloweringState,
  ] =
    useState<
      SeedlingFloweringState |
      ''
    >(
      isVariation
        ? ''
        : sourcePlant
            ?.seedlingFloweringState ??
          '',
    )

  const [
    startedDate,
    setStartedDate,
  ] =
    useState(
      sourcePlant?.plantedDate ??
      recordingPlan?.date ??
      today,
    )

  const [
    hasBeenPlantedOut,
    setHasBeenPlantedOut,
  ] =
    useState(
      Boolean(
        sourcePlant
          ?.plantedOutDate ||
        isNewPlantOutFromPlan,
      ),
    )

  const [
    plantedOutDate,
    setPlantedOutDate,
  ] =
    useState(
      sourcePlant
        ?.plantedOutDate ??
      (
        isNewPlantOutFromPlan
          ? recordingPlan?.date ??
            today
          : ''
      ),
    )


  /* =======================================
     ORIGIN
  ======================================= */

  const [
    originType,
    setOriginType,
  ] =
    useState<PlantOriginType>(
      sourcePlant?.originType ??
      'unknown',
    )

  const [
    source,
    setSource,
  ] =
    useState(
      sourcePlant?.source ??
      '',
    )

  const [
    customOriginLabel,
    setCustomOriginLabel,
  ] =
    useState(
      sourcePlant
        ?.customOriginLabel ??
      '',
    )


  /* =======================================
     GROWING PLACE
  ======================================= */

  const [
    isAddGrowingPlaceOpen,
    setIsAddGrowingPlaceOpen,
  ] =
    useState(
      false,
    )

  const [
    currentGrowingPlaceId,
    setCurrentGrowingPlaceId,
  ] =
    useState(
      sourcePlant
        ?.currentGrowingPlaceId ??
      recordingPlan
        ?.growingPlaceIds
        ?.[0] ??
      '',
    )

  const [
    isGrowingPlacePickerOpen,
    setIsGrowingPlacePickerOpen,
  ] =
    useState(
      false,
    )


  /* =======================================
     START METHOD PICKER
  ======================================= */

  const [
    isStartMethodPickerOpen,
    setIsStartMethodPickerOpen,
  ] =
    useState(
      false,
    )


  /* =======================================
     WHAT THIS PLANT GROWS IN
  ======================================= */

  const startingGrowingSetupIds =
    sourcePlant
      ? getPlantCurrentGrowingSetupIds(
          sourcePlant,
        )
      : uniqueIds(
          recordingPlan
            ?.growingSetupIds ??
          [],
        )

  const [
    currentGrowingSetupIds,
    setCurrentGrowingSetupIds,
  ] =
    useState<string[]>(
      startingGrowingSetupIds,
    )

  const [
    openGrowingSetupCategory,
    setOpenGrowingSetupCategory,
  ] =
    useState<
      GrowingSetupCategory |
      null
    >(
      null,
    )

  const [
    quickCreateCategory,
    setQuickCreateCategory,
  ] =
    useState<
      GrowingSetupCategory |
      'ingredient' |
      null
    >(
      null,
    )

  const [
    quickCreateName,
    setQuickCreateName,
  ] =
    useState(
      '',
    )

  const [
    quickCreateStructuredValue,
    setQuickCreateStructuredValue,
  ] =
    useState(
      '',
    )


  /* =======================================
     HARVEST EXPECTATION
  ======================================= */

  const initialTimingUnit:
    PlantHarvestTimingUnit =
    sourcePlant
      ? getHarvestTimingUnit(
          sourcePlant,
        )
      : 'weeks'

  const [
    harvestTimingInputUnit,
    setHarvestTimingInputUnit,
  ] =
    useState<
      PlantHarvestTimingUnit
    >(
      initialTimingUnit,
    )

  const sourceHarvestDaysMin =
    sourcePlant
      ?.expectedHarvestDaysMin ??
    recordingPlan
      ?.timingAssumption
      ?.daysMin

  const sourceHarvestDaysMax =
    sourcePlant
      ?.expectedHarvestDaysMax ??
    recordingPlan
      ?.timingAssumption
      ?.daysMax

  const [
    expectedHarvestMin,
    setExpectedHarvestMin,
  ] =
    useState(
      convertDaysToDisplayValue(
        sourceHarvestDaysMin,
        initialTimingUnit,
      ),
    )

  const [
    expectedHarvestMax,
    setExpectedHarvestMax,
  ] =
    useState(
      convertDaysToDisplayValue(
        sourceHarvestDaysMax,
        initialTimingUnit,
      ),
    )


  /* =======================================
     NOTES
  ======================================= */

  const [
    notes,
    setNotes,
  ] =
    useState(
      isVariation
        ? ''
        : sourcePlant?.notes ??
          recordingPlan?.notes ??
          '',
    )


  /* =======================================
     PHOTOGRAPHS
  ======================================= */

  const [
    photoUrls,
    setPhotoUrls,
  ] =
    useState<string[]>(
      isVariation
        ? []
        : [
            ...(
              sourcePlant
                ?.photoUrls ??
              []
            ),
          ],
    )

  const [
    photoDates,
    setPhotoDates,
  ] =
    useState<
      Array<
        string |
        undefined
      >
    >(
      isVariation
        ? []
        : (
            sourcePlant
              ?.photoUrls ??
            []
          ).map(
            (
              _photoUrl,
              index,
            ) =>
              sourcePlant
                ?.photoDates?.[
                  index
                ],
          ),
    )


  const beganFromSeed =
    startMethod ===
    'seed'


  const formRef =
    useRef<HTMLFormElement>(
      null,
    )


  /* =======================================
     NOTEBOOK LOCK
  ======================================= */

  useEffect(
    () => {
      const scrollY =
        window.scrollY

      requestAnimationFrame(
        () => {
          if (
            formRef.current
          ) {
            formRef.current
              .scrollTop =
              0
          }
        },
      )

      const previousOverflow =
        document.body
          .style
          .overflow

      const previousPosition =
        document.body
          .style
          .position

      const previousTop =
        document.body
          .style
          .top

      const previousWidth =
        document.body
          .style
          .width

      document.body
        .style
        .overflow =
          'hidden'

      document.body
        .style
        .position =
          'fixed'

      document.body
        .style
        .top =
          `-${scrollY}px`

      document.body
        .style
        .width =
          '100%'

      return () => {
        document.body
          .style
          .overflow =
            previousOverflow

        document.body
          .style
          .position =
            previousPosition

        document.body
          .style
          .top =
            previousTop

        document.body
          .style
          .width =
            previousWidth

        window.scrollTo(
          0,
          scrollY,
        )
      }
    },
    [],
  )


  /* =======================================
     TIMING UNIT CHANGE
  ======================================= */

  function handleTimingUnitChange(
    nextUnit:
      PlantHarvestTimingUnit,
  ) {
    if (
      nextUnit ===
      harvestTimingInputUnit
    ) {
      return
    }

    const minimumDays =
      convertDisplayValueToDays(
        expectedHarvestMin,
        harvestTimingInputUnit,
      )

    const maximumDays =
      convertDisplayValueToDays(
        expectedHarvestMax,
        harvestTimingInputUnit,
      )

    setExpectedHarvestMin(
      convertDaysToDisplayValue(
        minimumDays,
        nextUnit,
      ),
    )

    setExpectedHarvestMax(
      convertDaysToDisplayValue(
        maximumDays,
        nextUnit,
      ),
    )

    setHarvestTimingInputUnit(
      nextUnit,
    )
  }


  /* =======================================
     GROWING SETUP TOGGLE
  ======================================= */

  function toggleGrowingSetup(
    setupId:
      string,
  ) {
    setCurrentGrowingSetupIds(
      current =>
        current.includes(
          setupId,
        )
          ? current.filter(
              id =>
                id !==
                setupId,
            )
          : [
              ...current,
              setupId,
            ],
    )
  }


  /* =======================================
     OPEN QUICK CREATE
  ======================================= */

  function openQuickCreate(
    category:
      GrowingSetupCategory |
      'ingredient',
  ) {
    setQuickCreateCategory(
      category,
    )

    setQuickCreateName(
      '',
    )

    setQuickCreateStructuredValue(
      '',
    )
  }


  /* =======================================
     CHOOSE QUICK PRESET
  ======================================= */

  function chooseQuickPreset(
    option:
      QuickPresetOption,
  ) {
    setQuickCreateStructuredValue(
      option.value,
    )

    setQuickCreateName(
      option.label,
    )
  }


  /* =======================================
     QUICK CREATE
  ======================================= */

  function handleQuickCreate() {
    const trimmedName =
      quickCreateName.trim()

    if (
      !trimmedName ||
      !quickCreateCategory
    ) {
      return
    }

    if (
      quickCreateCategory ===
      'ingredient'
    ) {
      const existingIngredient =
        Ingredients.find(
          ingredient =>
            ingredient.name
              .trim()
              .toLowerCase() ===
            trimmedName
              .toLowerCase(),
        )

      const ingredient =
        existingIngredient ??
        {
          id:
            createIngredientId(
              trimmedName,
            ),

          name:
            trimmedName,

          createdAt:
            today,
        }

      if (
        !existingIngredient
      ) {
        onAddIngredient(
          ingredient,
        )
      }

      setQuickCreateName(
        '',
      )

      setQuickCreateStructuredValue(
        '',
      )

      setQuickCreateCategory(
        null,
      )

      return
    }

    const existingSetup =
      GrowingSetups.find(
        setup =>
          setup.category ===
            quickCreateCategory &&
          setup.name
            .trim()
            .toLowerCase() ===
          trimmedName
            .toLowerCase(),
      )

    if (
      existingSetup
    ) {
      setCurrentGrowingSetupIds(
        current =>
          uniqueIds([
            ...current,
            existingSetup.id,
          ]),
      )

      setQuickCreateName(
        '',
      )

      setQuickCreateStructuredValue(
        '',
      )

      setQuickCreateCategory(
        null,
      )

      return
    }

    const newSetup =
      createMinimalGrowingSetup(
        trimmedName,
        quickCreateCategory,
        today,
        quickCreateStructuredValue ||
          undefined,
      )

    onAddRecipe(
      newSetup,
    )

    setCurrentGrowingSetupIds(
      current =>
        uniqueIds([
          ...current,
          newSetup.id,
        ]),
    )

    setQuickCreateName(
      '',
    )

    setQuickCreateStructuredValue(
      '',
    )

    setQuickCreateCategory(
      null,
    )
  }


  /* =======================================
     PHOTO CHANGE
  ======================================= */

  function handlePhotoUrlsChange(
    nextPhotoUrls:
      string[],
  ) {
    setPhotoUrls(
      nextPhotoUrls,
    )

    setPhotoDates(
      currentDates =>
        nextPhotoUrls.map(
          (
            _photoUrl,
            index,
          ) =>
            currentDates[
              index
            ],
        ),
    )
  }


  /* =======================================
     SAVE PLANT STORY
  ======================================= */

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const trimmedPlantName =
      plantName.trim()

    const trimmedVariety =
      variety.trim()

    const trimmedSource =
      source.trim()

    const trimmedCustomOriginLabel =
      customOriginLabel.trim()

    const trimmedCustomStartMethodLabel =
      customStartMethodLabel.trim()

    if (
      !trimmedPlantName
    ) {
      return
    }

    const displayName =
      trimmedVariety ||
      trimmedPlantName

    const minimumHarvestDays =
      convertDisplayValueToDays(
        expectedHarvestMin,
        harvestTimingInputUnit,
      )

    const maximumHarvestDays =
      convertDisplayValueToDays(
        expectedHarvestMax,
        harvestTimingInputUnit,
      )

    const hasHarvestTiming =
      minimumHarvestDays !==
        undefined ||
      maximumHarvestDays !==
        undefined


    const selectedGrowingPlaceId =
      currentGrowingPlaceId ||
      undefined

    const selectedGrowingSetupIds =
      uniqueIds(
        currentGrowingSetupIds,
      )

    const selectedLegacyGrowingSetupId =
      selectedGrowingSetupIds
        .map(
          id =>
            GrowingSetups.find(
              setup =>
                setup.id ===
                id,
            ),
        )
        .find(
          setup =>
            setup &&
            setup.category !==
              'growing-system',
        )
        ?.id ??
      selectedGrowingSetupIds[0]


    const initialGrowingArrangementDate =
      (
        isNewPlantOutFromPlan ||
        (
          beganFromSeed &&
          hasBeenPlantedOut
        )
      ) &&
      plantedOutDate
        ? plantedOutDate
        : startedDate


    const savedPlantId =
      isEditing &&
      plantToEdit
        ? plantToEdit.id
        : createPlantId(
            displayName,
          )


    let nextPreviousGrowingPlaceIds:
      string[] =
      isEditing &&
      plantToEdit
        ? [
            ...(
              plantToEdit
                .previousGrowingPlaceIds ??
              []
            ),
          ]
        : []

    let nextPreviousGrowingSetupIds:
      string[] =
      isEditing &&
      plantToEdit
        ? [
            ...(
              plantToEdit
                .previousGrowingSetupIds ??
              []
            ),
          ]
        : []

    let nextPreviousGrowingSetupIdsV2:
      string[] =
      isEditing &&
      plantToEdit
        ? [
            ...(
              plantToEdit
                .previousGrowingSetupIdsV2 ??
              []
            ),
          ]
        : []


    let nextGrowingHistory:
      PlantGrowingHistoryEntry[] =
      isEditing &&
      plantToEdit
        ? (
            plantToEdit
              .growingHistory ??
            []
          ).map(
            entry => ({
              ...entry,

              growingSetupIds:
                entry
                  .growingSetupIds
                  ? [
                      ...entry
                        .growingSetupIds,
                    ]
                  : undefined,
            }),
          )
        : []

    if (
      isEditing &&
      plantToEdit
    ) {
      const oldGrowingSetupIds =
        getPlantCurrentGrowingSetupIds(
          plantToEdit,
        )

      const growingPlaceChanged =
        plantToEdit
          .currentGrowingPlaceId !==
        selectedGrowingPlaceId

      const growingSetupChanged =
        !arraysContainSameIds(
          oldGrowingSetupIds,
          selectedGrowingSetupIds,
        )

      const growingArrangementChanged =
        growingPlaceChanged ||
        growingSetupChanged

      if (
        growingPlaceChanged &&
        plantToEdit
          .currentGrowingPlaceId
      ) {
        nextPreviousGrowingPlaceIds =
          uniqueIds([
            ...nextPreviousGrowingPlaceIds,
            plantToEdit
              .currentGrowingPlaceId,
          ])
      }

      if (
        growingSetupChanged
      ) {
        nextPreviousGrowingSetupIdsV2 =
          uniqueIds([
            ...nextPreviousGrowingSetupIdsV2,
            ...oldGrowingSetupIds,
          ])

        if (
          plantToEdit
            .currentGrowingSetupId
        ) {
          nextPreviousGrowingSetupIds =
            uniqueIds([
              ...nextPreviousGrowingSetupIds,
              plantToEdit
                .currentGrowingSetupId,
            ])
        }
      }

      if (
        growingArrangementChanged
      ) {
        if (
          nextGrowingHistory.length ===
            0 &&
          (
            plantToEdit
              .currentGrowingPlaceId ||
            oldGrowingSetupIds.length >
              0
          )
        ) {
          nextGrowingHistory.push({
            id:
              createGrowingHistoryId(
                savedPlantId,
                'carried-forward',
              ),

            startedDate:
              plantToEdit
                .plantedOutDate ??
              plantToEdit
                .plantedDate,

            endedDate:
              today,

            growingPlaceId:
              plantToEdit
                .currentGrowingPlaceId,

            growingSetupId:
              plantToEdit
                .currentGrowingSetupId,

            growingSetupIds:
              oldGrowingSetupIds.length >
                0
                ? oldGrowingSetupIds
                : undefined,

            notes:
              'Earlier growing arrangement carried forward from this existing Plant Story. Its exact starting date was not separately recorded.',
          })
        }
        else {
          let openEntryIndex =
            -1

          for (
            let index =
              nextGrowingHistory.length -
              1;
            index >=
              0;
            index -=
              1
          ) {
            if (
              !nextGrowingHistory[
                index
              ].endedDate
            ) {
              openEntryIndex =
                index

              break
            }
          }

          if (
            openEntryIndex >=
            0
          ) {
            nextGrowingHistory[
              openEntryIndex
            ] = {
              ...nextGrowingHistory[
                openEntryIndex
              ],

              endedDate:
                today,
            }
          }
        }

        if (
          selectedGrowingPlaceId ||
          selectedGrowingSetupIds.length >
            0
        ) {
          nextGrowingHistory.push({
            id:
              createGrowingHistoryId(
                savedPlantId,
                'changed',
              ),

            startedDate:
              today,

            growingPlaceId:
              selectedGrowingPlaceId,

            growingSetupId:
              selectedLegacyGrowingSetupId,

            growingSetupIds:
              selectedGrowingSetupIds.length >
                0
                ? selectedGrowingSetupIds
                : undefined,
          })
        }
      }
    }
    else if (
      selectedGrowingPlaceId ||
      selectedGrowingSetupIds.length >
        0
    ) {
      nextGrowingHistory = [
        {
          id:
            createGrowingHistoryId(
              savedPlantId,
              'initial',
            ),

          startedDate:
            initialGrowingArrangementDate,

          growingPlaceId:
            selectedGrowingPlaceId,

          growingSetupId:
            selectedLegacyGrowingSetupId,

          growingSetupIds:
            selectedGrowingSetupIds.length >
              0
              ? selectedGrowingSetupIds
              : undefined,
        },
      ]
    }


    const numericEyeCount =
      seedPotatoEyeCount.trim()
        ? Number(
            seedPotatoEyeCount,
          )
        : undefined

    const savedSeedPotatoEyeCount =
      startMethod ===
        'seed-potato' &&
      numericEyeCount !==
        undefined &&
      Number.isFinite(
        numericEyeCount,
      ) &&
      numericEyeCount >=
        0
        ? numericEyeCount
        : undefined

    const savedSeedlingFloweringState =
      startMethod ===
        'seedling' &&
      seedlingFloweringState
        ? seedlingFloweringState
        : undefined


    const savedPlant:
      PlantStory = {
        id:
          savedPlantId,

        plantName:
          trimmedPlantName,

        variety:
          trimmedVariety ||
          undefined,

        displayName,

        personality:
          isVariation
            ? 'A story just beginning'
            : sourcePlant
                ?.personality,

        basedOnPlantStoryId:
          isVariation
            ? variationFrom?.id
            : sourcePlant
                ?.basedOnPlantStoryId,

        isFavourite:
          isVariation
            ? false
            : sourcePlant
                ?.isFavourite ??
              false,

        isArchived:
          isVariation
            ? false
            : sourcePlant
                ?.isArchived ??
              false,

        archivedAt:
          isVariation
            ? undefined
            : sourcePlant
                ?.archivedAt,

        completedAt:
          isVariation
            ? undefined
            : sourcePlant
                ?.completedAt,

        updatedAt:
          isEditing
            ? new Date()
                .toISOString()
            : undefined,

        quantity:
          quantity.trim()
            ? Number(
                quantity,
              )
            : undefined,

        startMethod,

        customStartMethodLabel:
          startMethod ===
            'other'
            ? (
                trimmedCustomStartMethodLabel ||
                undefined
              )
            : undefined,

        seedPotatoEyeCount:
          savedSeedPotatoEyeCount,

        seedlingFloweringState:
          savedSeedlingFloweringState,

        sownDate:
          beganFromSeed
            ? startedDate
            : sourcePlant
                ?.sownDate,

        plantedDate:
          startedDate,

        plantedOutDate:
          hasBeenPlantedOut &&
          plantedOutDate
            ? plantedOutDate
            : undefined,

        enteredDate:
          isEditing &&
          plantToEdit
            ? plantToEdit
                .enteredDate
            : today,

        originType,

        source:
          trimmedSource ||
          undefined,

        originPurchaseId:
          sourcePlant
            ?.originPurchaseId,

        originPlantStoryId:
          sourcePlant
            ?.originPlantStoryId,

        customOriginLabel:
          originType ===
            'other'
            ? (
                trimmedCustomOriginLabel ||
                undefined
              )
            : undefined,

        status:
          isVariation
            ? 'growing'
            : sourcePlant
                ?.status ??
              'growing',

        currentGrowingSpaceId:
          sourcePlant
            ?.currentGrowingSpaceId,

        previousGrowingSpaceIds:
          isEditing
            ? sourcePlant
                ?.previousGrowingSpaceIds
            : undefined,

        currentGrowingSetupId:
          selectedLegacyGrowingSetupId,

        previousGrowingSetupIds:
          nextPreviousGrowingSetupIds,

        currentGrowingSetupIds:
          selectedGrowingSetupIds.length >
            0
            ? selectedGrowingSetupIds
            : undefined,

        previousGrowingSetupIdsV2:
          nextPreviousGrowingSetupIdsV2,

        currentGrowingPlaceId:
          selectedGrowingPlaceId,

        previousGrowingPlaceIds:
          nextPreviousGrowingPlaceIds,

        growingHistory:
          nextGrowingHistory,

        notes:
          notes.trim() ||
          undefined,

        photoUrls,

        photoDates,

        expectedHarvestDaysMin:
          minimumHarvestDays,

        expectedHarvestDaysMax:
          maximumHarvestDays,

        harvestTimingInputUnit:
          hasHarvestTiming
            ? harvestTimingInputUnit
            : undefined,

        harvestTimingReference:
          hasHarvestTiming
            ? (
                sourcePlant
                  ?.harvestTimingReference ??
                getPlanHarvestTimingReference(
                  recordingPlan,
                ) ??
                {
                  sourceType:
                    beganFromSeed
                      ? 'sown'
                      : 'planted',
                }
              )
            : undefined,

        tags:
          isVariation
            ? [
                ...(
                  variationFrom
                    ?.tags ??
                  []
                ),
              ]
            : sourcePlant
                ?.tags,
      }


    if (
      isEditing &&
      onUpdatePlant
    ) {
      onUpdatePlant(
        savedPlant,
      )

      onClose()

      return
    }

    onAddPlant(
      savedPlant,
    )
  }


  /* =======================================
     OPTIONS
  ======================================= */

  const startMethodOptions = [
    {
      value:
        'seed',
      label:
        'Seed',
    },
    {
      value:
        'seedling',
      label:
        'Seedling',
    },
    {
      value:
        'cutting',
      label:
        'Cutting',
    },
    {
      value:
        'sucker',
      label:
        'Sucker',
    },
    {
      value:
        'seed-potato',
      label:
        'Seed potato',
    },
    {
      value:
        'tuber',
      label:
        'Tuber',
    },
    {
      value:
        'bulb',
      label:
        'Bulb',
    },
    {
      value:
        'rhizome',
      label:
        'Rhizome',
    },
    {
      value:
        'division',
      label:
        'Division',
    },
    {
      value:
        'bought-plant',
      label:
        'Bought plant',
    },
    {
      value:
        'other',
      label:
        'Something else',
    },
  ]


  const originOptions = (
    [
      'bought',
      'saved-from-garden',
      'propagated-from-plant',
      'gifted',
      'swapped',
      'found-or-existing',
      'unknown',
      'other',
    ] as PlantOriginType[]
  ).map(
    value => ({
      value,

      label:
        getPlantOriginLabel(
          value,
        ),
    }),
  )


  const growingPlaceOptions =
    GrowingPlaces
      .filter(
        place =>
          Boolean(
            place.id,
          ),
      )
      .map(
        place => ({
          value:
            place.id,

          label:
            place.name,

          subtitle:
            place.kind
              .replaceAll(
                '-',
                ' ',
              ),
        }),
      )


  const activeGrowingSetups =
    GrowingSetups.filter(
      setup =>
        !setup.isArchived,
    )


  function getGrowingSetupOptions(
    category:
      GrowingSetupCategory,
  ) {
    return activeGrowingSetups
      .filter(
        setup =>
          setup.category ===
          category,
      )
      .sort(
        (
          first,
          second,
        ) =>
          first.name.localeCompare(
            second.name,
          ),
      )
      .map(
        setup => ({
          value:
            setup.id,

          label:
            setup.name,

          subtitle:
            getGrowingSetupCategoryLabel(
              setup,
            ),
        }),
      )
  }


  const selectedGrowingSetups =
    currentGrowingSetupIds
      .map(
        id =>
          GrowingSetups.find(
            setup =>
              setup.id ===
              id,
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


  const timingUnitOptions:
    Array<{
      value:
        PlantHarvestTimingUnit
      label:
        string
    }> = [
      {
        value:
          'days',
        label:
          'Days',
      },
      {
        value:
          'weeks',
        label:
          'Weeks',
      },
      {
        value:
          'months',
        label:
          'Months',
      },
    ]


  const seedlingFloweringOptions:
    Array<{
      value:
        SeedlingFloweringState
      label:
        string
      subtitle:
        string
    }> = [
      {
        value:
          'yes',
        label:
          'Yes',
        subtitle:
          'It already had flowers when this Plant Story began',
      },
      {
        value:
          'no',
        label:
          'No',
        subtitle:
          'It was not flowering yet',
      },
      {
        value:
          'not-sure',
        label:
          'Not sure',
        subtitle:
          'Leave the starting condition uncertain',
      },
    ]


  const growingSetupCategories:
    GrowingSetupCategory[] = [
      'own-mix',
      'bought-mix',
      'growing-system',
      'ground-type',
    ]


  const heading =
    isEditing
      ? 'Edit Plant Story'
      : isVariation
        ? 'Begin a Variation'
        : isRecordingPlan
          ? 'Record this Plant'
          : 'Add a Plant Story'

  const saveLabel =
    isEditing
      ? 'Save Plant Story'
      : isVariation
        ? 'Begin this variation'
        : isRecordingPlan
          ? 'Record this Plant Story'
          : 'Add this Plant Story'


  return (
    <div className="form-backdrop">
      <section
        className="add-plant-panel chronicle-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-plant-title"
      >
        <img
          className="chronicle-page-image"
          src={
            notebookEntryBackground
          }
          alt=""
          aria-hidden="true"
        />


        <div className="chronicle-content">
          <h2
            id="add-plant-title"
            className="notebook-page-title"
          >
            {heading}
          </h2>


          <button
            type="button"
            className="close-button"
            onClick={
              onClose
            }
            aria-label="Close Plant Story form"
          >
            ×
          </button>


          <form
            ref={
              formRef
            }
            className="add-plant-form"
            onSubmit={
              handleSubmit
            }
          >
            {isVariation && (
              <section className="sprig-form-section growing-setup-details">
                <p className="section-label">
                  New Plant Story
                </p>

                <h3>
                  Based on{' '}
                  {variationFrom
                    ?.displayName ??
                    'another Plant Story'}
                </h3>

                <p className="form-whisper">
                  Sprig has carried across useful
                  planting details as a starting
                  point. This is still a brand-new
                  Plant Story.
                </p>

                <p className="form-whisper">
                  Photographs, Journal history,
                  harvest history and personal
                  notes stay with the original
                  plant.
                </p>
              </section>
            )}


            {isRecordingPlan &&
              recordingPlan && (
                <section className="sprig-form-section growing-setup-details">
                  <p className="section-label">
                    From Garden Plan
                  </p>

                  <h3>
                    {recordingPlan.title}
                  </h3>

                  <p className="form-whisper">
                    The Plan remains the record
                    of what you intended. This
                    Plant Story records what
                    actually entered the garden.
                  </p>
                </section>
              )}


            <section className="sprig-form-section growing-setup-details">
              <p className="section-label">
                Plant
              </p>

              <label>
                What are you growing?

                <input
                  type="text"
                  value={
                    plantName
                  }
                  onChange={(
                    event,
                  ) =>
                    setPlantName(
                      event.target.value,
                    )
                  }
                  placeholder="Potato, tomato, broccoli..."
                  required
                />
              </label>


              <label>
                Variety

                <input
                  type="text"
                  value={
                    variety
                  }
                  onChange={(
                    event,
                  ) =>
                    setVariety(
                      event.target.value,
                    )
                  }
                  placeholder="Royal Blue, Black Russian..."
                />
              </label>


              <label>
                How many?

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={
                    quantity
                  }
                  onChange={(
                    event,
                  ) =>
                    setQuantity(
                      event.target.value,
                    )
                  }
                />
              </label>
            </section>


            <section className="sprig-form-section">
              <SprigPicker
                title="How did this story begin?"
                emptySummary="Choose how this plant began"
                options={
                  startMethodOptions
                }
                selectedValues={[
                  startMethod,
                ]}
                isOpen={
                  isStartMethodPickerOpen
                }
                onToggleOpen={() =>
                  setIsStartMethodPickerOpen(
                    current =>
                      !current,
                  )
                }
                onToggleValue={(
                  value,
                ) => {
                  setStartMethod(
                    value as StartMethod,
                  )

                  setIsStartMethodPickerOpen(
                    false,
                  )
                }}
              />


              {startMethod ===
                'other' && (
                <label>
                  What did it begin from?

                  <input
                    type="text"
                    value={
                      customStartMethodLabel
                    }
                    onChange={(
                      event,
                    ) =>
                      setCustomStartMethodLabel(
                        event.target.value,
                      )
                    }
                    placeholder="Describe the starting material"
                  />
                </label>
              )}


              {startMethod ===
                'seed-potato' && (
                <label>
                  How many eyes did the seed potato have?

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      seedPotatoEyeCount
                    }
                    onChange={(
                      event,
                    ) =>
                      setSeedPotatoEyeCount(
                        event.target.value,
                      )
                    }
                    placeholder="Optional"
                  />

                  <span className="form-whisper">
                    Leave this blank if you
                    did not count them.
                  </span>
                </label>
              )}


              {startMethod ===
                'seedling' && (
                <div className="plant-beginning-choice">
                  <p className="section-label">
                    Was the seedling already flowering?
                  </p>

                  <div className="selection-card-grid">
                    {seedlingFloweringOptions.map(
                      option => {
                        const isSelected =
                          seedlingFloweringState ===
                          option.value

                        return (
                          <button
                            key={
                              option.value
                            }
                            type="button"
                            className={
                              isSelected
                                ? 'selection-card selected'
                                : 'selection-card'
                            }
                            aria-pressed={
                              isSelected
                            }
                            onClick={() =>
                              setSeedlingFloweringState(
                                current =>
                                  current ===
                                    option.value
                                    ? ''
                                    : option.value,
                              )
                            }
                          >
                            <strong>
                              {isSelected
                                ? '✓ '
                                : ''}
                              {option.label}
                            </strong>

                            <span>
                              {option.subtitle}
                            </span>
                          </button>
                        )
                      },
                    )}
                  </div>

                  <p className="form-whisper">
                    Optional. This records the
                    condition of this particular
                    seedling when its story began.
                  </p>
                </div>
              )}


              <label>
                When did this story begin?

                <input
                  type="date"
                  value={
                    startedDate
                  }
                  onChange={(
                    event,
                  ) =>
                    setStartedDate(
                      event.target.value,
                    )
                  }
                  required
                />
              </label>


              {beganFromSeed && (
                <button
                  type="button"
                  className={
                    hasBeenPlantedOut
                      ? 'plant-out-toggle selected'
                      : 'plant-out-toggle'
                  }
                  aria-pressed={
                    hasBeenPlantedOut
                  }
                  onClick={() =>
                    setHasBeenPlantedOut(
                      current =>
                        !current,
                    )
                  }
                >
                  <span className="plant-out-toggle-mark">
                    {hasBeenPlantedOut
                      ? '✓'
                      : ''}
                  </span>

                  <span className="plant-out-toggle-copy">
                    <strong>
                      This plant has also been planted out
                    </strong>

                    <small>
                      Turn this on when the seed-starting
                      stage has already moved into its
                      growing place.
                    </small>
                  </span>
                </button>
              )}


              {(
                beganFromSeed &&
                hasBeenPlantedOut
              ) && (
                <label>
                  Planted out

                  <input
                    type="date"
                    value={
                      plantedOutDate
                    }
                    onChange={(
                      event,
                    ) =>
                      setPlantedOutDate(
                        event.target.value,
                      )
                    }
                  />
                </label>
              )}
            </section>


            <section className="sprig-form-section growing-setup-details">
              <p className="section-label">
                Where did it come from?
              </p>

              <select
                value={
                  originType
                }
                onChange={(
                  event,
                ) =>
                  setOriginType(
                    event.target
                      .value as PlantOriginType,
                  )
                }
              >
                {originOptions.map(
                  option => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>


              <label>
                Source

                <input
                  type="text"
                  value={
                    source
                  }
                  onChange={(
                    event,
                  ) =>
                    setSource(
                      event.target.value,
                    )
                  }
                  placeholder="Nursery, seed packet, friend, my garden..."
                />
              </label>


              {originType ===
                'other' && (
                <label>
                  Describe its origin

                  <input
                    type="text"
                    value={
                      customOriginLabel
                    }
                    onChange={(
                      event,
                    ) =>
                      setCustomOriginLabel(
                        event.target.value,
                      )
                    }
                  />
                </label>
              )}
            </section>


            <section className="sprig-form-section">
              <p className="section-label">
                Where is it growing?
              </p>

              <p className="form-whisper">
                This is the physical place in
                your garden. What the plant is
                growing in is recorded separately
                below.
              </p>

              <SprigPicker
                title="Growing Place"
                emptySummary="No Growing Place chosen"
                options={
                  growingPlaceOptions
                }
                selectedValues={
                  currentGrowingPlaceId
                    ? [
                        currentGrowingPlaceId,
                      ]
                    : []
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
                onToggleValue={(
                  value,
                ) => {
                  setCurrentGrowingPlaceId(
                    current =>
                      current ===
                        value
                        ? ''
                        : value,
                  )

                  setIsGrowingPlacePickerOpen(
                    false,
                  )
                }}
              />


              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setIsAddGrowingPlaceOpen(
                    true,
                  )
                }
              >
                + Add a Growing Place
              </button>
            </section>


            <section className="sprig-form-section plant-growing-in-section">
              <div className="plant-growing-in-heading">
                <p className="section-label">
                  Growing
                </p>

                <h3>
                  What is it growing in?
                </h3>

                <p className="form-whisper">
                  Choose everything that genuinely
                  describes this planting. A plant
                  can use more than one Growing
                  record, such as a fabric grow bag
                  and your own potato mix.
                </p>
              </div>


              {selectedGrowingSetups.length >
                0 && (
                <div className="plant-growing-selected">
                  <p className="section-label">
                    Selected for this Plant Story
                  </p>

                  <div className="plant-growing-selected-list">
                    {selectedGrowingSetups.map(
                      setup => (
                        <div
                          key={
                            setup.id
                          }
                          className="selected-item-row plant-growing-selected-row"
                        >
                          <div>
                            <strong>
                              {setup.name}
                            </strong>

                            <p className="form-whisper">
                              {getGrowingSetupCategoryLabel(
                                setup,
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="plant-growing-remove"
                            onClick={() =>
                              toggleGrowingSetup(
                                setup.id,
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}


              <div className="plant-growing-category-list">
                {growingSetupCategories.map(
                  category => {
                    const options =
                      getGrowingSetupOptions(
                        category,
                      )

                    const isOpen =
                      openGrowingSetupCategory ===
                      category

                    const selectedCount =
                      selectedGrowingSetups.filter(
                        setup =>
                          setup.category ===
                          category,
                      ).length

                    return (
                      <div
                        key={
                          category
                        }
                        className={
                          isOpen
                            ? 'plant-growing-category open'
                            : 'plant-growing-category'
                        }
                      >
                        <button
                          type="button"
                          className="plant-growing-category-button"
                          aria-expanded={
                            isOpen
                          }
                          onClick={() =>
                            setOpenGrowingSetupCategory(
                              current =>
                                current ===
                                  category
                                  ? null
                                  : category,
                            )
                          }
                        >
                          <span>
                            <strong>
                              {getGrowingSetupCategoryHeading(
                                category,
                              )}
                            </strong>

                            <small>
                              {getGrowingSetupCategoryHelper(
                                category,
                              )}
                            </small>
                          </span>

                          <span className="plant-growing-category-meta">
                            {selectedCount >
                              0 && (
                              <span className="plant-growing-count">
                                {selectedCount}
                              </span>
                            )}

                            <span aria-hidden="true">
                              {isOpen
                                ? '−'
                                : '+'}
                            </span>
                          </span>
                        </button>


                        {isOpen && (
                          <div className="plant-growing-category-content">
                            {options.length >
                            0 ? (
                              <SprigPicker
                                title={
                                  getGrowingSetupCategoryHeading(
                                    category,
                                  )
                                }
                                emptySummary="Choose any that apply"
                                options={
                                  options
                                }
                                selectedValues={
                                  currentGrowingSetupIds
                                }
                                isOpen={
                                  true
                                }
                                onToggleOpen={() => {
                                  /*
                                   * The category row owns
                                   * this open state.
                                   */
                                }}
                                onToggleValue={
                                  toggleGrowingSetup
                                }
                              />
                            ) : (
                              <p className="form-whisper">
                                Nothing has been saved
                                here yet. You can make a
                                quick record without
                                leaving this Plant Story.
                              </p>
                            )}


                            <button
                              type="button"
                              className="plant-growing-add-link"
                              onClick={() =>
                                openQuickCreate(
                                  category,
                                )
                              }
                            >
                              + Add{' '}
                              {category ===
                                'own-mix'
                                ? 'a Recipe'
                                : category ===
                                    'bought-mix'
                                  ? 'a Bought Mix'
                                  : category ===
                                      'growing-system'
                                    ? 'a Growing System'
                                    : 'a Ground Type'}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  },
                )}
              </div>


              <div className="plant-growing-ingredient-note">
                <div>
                  <strong>
                    Need an Ingredient first?
                  </strong>

                  <p className="form-whisper">
                    Ingredients are reusable
                    building blocks for Recipes,
                    such as compost, manure, coir
                    or guinea pig bedding. They do
                    not attach directly to the
                    Plant Story.
                  </p>
                </div>

                <button
                  type="button"
                  className="plant-growing-add-link"
                  onClick={() =>
                    openQuickCreate(
                      'ingredient',
                    )
                  }
                >
                  + Add Ingredient
                </button>
              </div>


              {quickCreateCategory && (
                <div className="plant-growing-quick-create">
                  <p className="section-label">
                    {quickCreateCategory ===
                    'ingredient'
                      ? 'Add Ingredient'
                      : quickCreateCategory ===
                          'own-mix'
                        ? 'Add Recipe'
                        : quickCreateCategory ===
                            'bought-mix'
                          ? 'Add Bought Mix'
                          : quickCreateCategory ===
                              'growing-system'
                            ? 'Add Growing System'
                            : 'Add Ground Type'}
                  </p>


                  {quickCreateCategory ===
                    'ground-type' && (
                    <div className="plant-growing-presets">
                      <p className="form-whisper">
                        Choose a common Ground Type
                        or type your own name below.
                      </p>

                      <div className="plant-growing-preset-grid">
                        {groundTypePresets.map(
                          option => (
                            <button
                              key={
                                option.value
                              }
                              type="button"
                              className={
                                quickCreateStructuredValue ===
                                option.value
                                  ? 'plant-growing-preset selected'
                                  : 'plant-growing-preset'
                              }
                              aria-pressed={
                                quickCreateStructuredValue ===
                                option.value
                              }
                              onClick={() =>
                                chooseQuickPreset(
                                  option,
                                )
                              }
                            >
                              {quickCreateStructuredValue ===
                              option.value
                                ? '✓ '
                                : ''}
                              {option.label}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}


                  {quickCreateCategory ===
                    'growing-system' && (
                    <div className="plant-growing-presets">
                      <p className="form-whisper">
                        Choose a common Growing
                        System or type your own
                        name below.
                      </p>

                      <div className="plant-growing-preset-grid">
                        {growingSystemPresets.map(
                          option => (
                            <button
                              key={
                                option.value
                              }
                              type="button"
                              className={
                                quickCreateStructuredValue ===
                                option.value
                                  ? 'plant-growing-preset selected'
                                  : 'plant-growing-preset'
                              }
                              aria-pressed={
                                quickCreateStructuredValue ===
                                option.value
                              }
                              onClick={() =>
                                chooseQuickPreset(
                                  option,
                                )
                              }
                            >
                              {quickCreateStructuredValue ===
                              option.value
                                ? '✓ '
                                : ''}
                              {option.label}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}


                  <label>
                    {quickCreateCategory ===
                      'ingredient'
                      ? 'Ingredient name'
                      : quickCreateCategory ===
                          'own-mix'
                        ? 'Recipe name'
                        : quickCreateCategory ===
                            'bought-mix'
                          ? 'Bought Mix name'
                          : quickCreateCategory ===
                              'growing-system'
                            ? 'Growing System name'
                            : 'Ground Type name'}

                    <input
                      type="text"
                      value={
                        quickCreateName
                      }
                      onChange={(
                        event,
                      ) => {
                        setQuickCreateName(
                          event.target.value,
                        )

                        /*
                         * If the gardener edits
                         * the preset label into
                         * something custom, do
                         * not falsely store the
                         * old preset type.
                         */
                        if (
                          quickCreateStructuredValue
                        ) {
                          const presetOptions =
                            quickCreateCategory ===
                              'ground-type'
                              ? groundTypePresets
                              : quickCreateCategory ===
                                  'growing-system'
                                ? growingSystemPresets
                                : []

                          const selectedPreset =
                            presetOptions.find(
                              option =>
                                option.value ===
                                quickCreateStructuredValue,
                            )

                          if (
                            selectedPreset &&
                            event.target.value !==
                              selectedPreset.label
                          ) {
                            setQuickCreateStructuredValue(
                              '',
                            )
                          }
                        }
                      }}
                      onKeyDown={(
                        event,
                      ) => {
                        if (
                          event.key ===
                          'Enter'
                        ) {
                          event.preventDefault()

                          handleQuickCreate()
                        }
                      }}
                      placeholder={
                        quickCreateCategory ===
                          'ingredient'
                          ? 'Guinea pig bedding, compost, perlite...'
                          : quickCreateCategory ===
                              'growing-system'
                            ? '43 L fabric grow bag, wicking bed...'
                            : quickCreateCategory ===
                                'ground-type'
                              ? 'Native clay, sandy loam...'
                              : quickCreateCategory ===
                                  'bought-mix'
                                ? 'Premium potting mix...'
                                : 'Potato Mix #3...'
                      }
                      autoFocus
                    />
                  </label>


                  {quickCreateCategory ===
                    'ingredient' ? (
                    <p className="form-whisper">
                      This creates a real reusable
                      Ingredient in Growing. It
                      does not attach the
                      Ingredient directly to this
                      Plant Story.
                    </p>
                  ) : (
                    <p className="form-whisper">
                      Sprig will save this as a
                      real Growing record and
                      select it for this Plant
                      Story. You can fill in its
                      fuller details later from
                      Growing.
                    </p>
                  )}


                  <div className="plant-growing-quick-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setQuickCreateCategory(
                          null,
                        )

                        setQuickCreateName(
                          '',
                        )

                        setQuickCreateStructuredValue(
                          '',
                        )
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="enter-button"
                      disabled={
                        !quickCreateName.trim()
                      }
                      onClick={
                        handleQuickCreate
                      }
                    >
                      {quickCreateCategory ===
                      'ingredient'
                        ? 'Add Ingredient'
                        : 'Add and select'}
                    </button>
                  </div>
                </div>
              )}
            </section>


            <section className="sprig-form-section growing-setup-details">
              <p className="section-label">
                Expected harvest
              </p>

              <h3>
                About how long might it take?
              </h3>

              <p className="form-whisper">
                Optional. Leave this completely
                blank if you do not know yet.
                Sprig can still keep the Plant
                Story without a harvest estimate.
              </p>


              <div
                className="selection-card-grid harvest-timing-unit-grid"
                role="group"
                aria-label="Harvest timing unit"
              >
                {timingUnitOptions.map(
                  option => {
                    const isSelected =
                      harvestTimingInputUnit ===
                      option.value

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        className={
                          isSelected
                            ? 'selection-card selected'
                            : 'selection-card'
                        }
                        aria-pressed={
                          isSelected
                        }
                        onClick={() =>
                          handleTimingUnitChange(
                            option.value,
                          )
                        }
                      >
                        <strong>
                          {isSelected
                            ? '✓ '
                            : ''}
                          {option.label}
                        </strong>

                        {isSelected && (
                          <span>
                            Selected
                          </span>
                        )}
                      </button>
                    )
                  },
                )}
              </div>


              <div className="form-row">
                <label>
                  Earliest

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      expectedHarvestMin
                    }
                    onChange={(
                      event,
                    ) =>
                      setExpectedHarvestMin(
                        event.target.value,
                      )
                    }
                    placeholder="Optional"
                  />
                </label>


                <label>
                  Latest

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      expectedHarvestMax
                    }
                    onChange={(
                      event,
                    ) =>
                      setExpectedHarvestMax(
                        event.target.value,
                      )
                    }
                    placeholder="Optional"
                  />
                </label>
              </div>


              <p className="form-whisper">
                Enter the estimate in{' '}
                <strong>
                  {harvestTimingInputUnit}
                </strong>
                . Sprig stores the timing in a
                consistent form behind the scenes
                while remembering how you chose
                to enter it.
              </p>
            </section>


            <section className="sprig-form-section growing-setup-details">
              <p className="section-label">
                Notes
              </p>

              <label>
                Anything worth remembering?

                <textarea
                  value={
                    notes
                  }
                  onChange={(
                    event,
                  ) =>
                    setNotes(
                      event.target.value,
                    )
                  }
                  rows={
                    5
                  }
                  placeholder="Anything useful about this plant as its story begins..."
                />
              </label>
            </section>


            <SprigPhotoPicker
              photoUrls={
                photoUrls
              }
              onChange={
                handlePhotoUrlsChange
              }
              title="Plant photographs"
              helperText={
                isVariation
                  ? 'This new variation begins with its own empty photograph story.'
                  : 'Keep photographs that belong directly to this Plant Story.'
              }
              addButtonText="Add plant photographs"
              photoAltPrefix="Plant photograph"
              maxPhotos={
                20
              }
            />


            {photoUrls.length >
              0 && (
              <section className="sprig-form-section growing-setup-details">
                <p className="section-label">
                  Photograph dates
                </p>

                <p className="form-whisper">
                  Add a date when it helps future
                  you understand where the plant
                  was in its story.
                </p>

                {photoUrls.map(
                  (
                    _photoUrl,
                    index,
                  ) => (
                    <label
                      key={
                        `${index}-${photoUrls[index]?.slice(
                          0,
                          20,
                        )}`
                      }
                    >
                      Photo {index + 1}

                      <input
                        type="date"
                        value={
                          photoDates[
                            index
                          ] ??
                          ''
                        }
                        onChange={(
                          event,
                        ) =>
                          setPhotoDates(
                            current =>
                              photoUrls.map(
                                (
                                  _url,
                                  photoIndex,
                                ) =>
                                  photoIndex ===
                                    index
                                    ? (
                                        event
                                          .target
                                          .value ||
                                        undefined
                                      )
                                    : current[
                                        photoIndex
                                      ],
                              ),
                          )
                        }
                      />
                    </label>
                  ),
                )}
              </section>
            )}


            {isRecordingPlan &&
              recordingPlan && (
                <section className="sprig-form-section growing-setup-details">
                  <p className="section-label">
                    Plan and reality
                  </p>

                  <p className="form-whisper">
                    Saving this page creates the
                    separate Plant Story for what
                    actually happened.
                  </p>

                  <p className="form-whisper">
                    Your Garden Plan stays as the
                    record of what you meant to do.
                  </p>
                </section>
              )}


            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={
                  onClose
                }
              >
                Leave it for now
              </button>

              <button
                type="submit"
                className="enter-button"
              >
                {saveLabel}
              </button>
            </div>
          </form>
        </div>
      </section>


      {isAddGrowingPlaceOpen && (
        <AddGrowingPlaceForm
          onAddPlace={(
            place,
          ) => {
            onAddGrowingPlace(
              place,
            )

            setCurrentGrowingPlaceId(
              place.id,
            )

            setIsAddGrowingPlaceOpen(
              false,
            )
          }}

          onClose={() =>
            setIsAddGrowingPlaceOpen(
              false,
            )
          }
        />
      )}
    </div>
  )
}