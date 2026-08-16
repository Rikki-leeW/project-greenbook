import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'

import SprigPicker from '../sprig/SprigPicker'
import SprigPhotoPicker from '../photos/SprigPhotoPicker'

import type {
  GrowingGroundMethod,
  GrowingGroundType,
  GrowingPlace,
  GrowingPlaceKind,
  GrowingSetup,
  GrowingSetupCategory,
  Ingredient,
} from '../../types'

import OwnMixSection from './OwnMixSection'
import BoughtMixSection from './BoughtMixSection'
import GroundTypeSection from './GroundTypeSection'
import GrowingSystemSection from './GrowingSystemSection'


interface AddGrowingPlaceFormProps {
  ingredients: Ingredient[]

  growingSetups: GrowingSetup[]

  onAddPlace: (
    place: GrowingPlace,
    setup?: GrowingSetup,
  ) => void

  onAddIngredient: (
    ingredient: Ingredient,
  ) => void

  onClose: () => void
}


interface CustomPickerOption {
  value: string
  label: string
}


const CUSTOM_PLACE_TYPES_KEY =
  'sprig-custom-growing-place-types'

const CUSTOM_GROUND_TYPES_KEY =
  'sprig-custom-ground-types'

const CUSTOM_GROWING_SYSTEMS_KEY =
  'sprig-custom-growing-systems'


/* =======================================
   GROWING PLACE ID
======================================= */

function createGrowingPlaceId(
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

  return `${
    safeName ||
    'garden-place'
  }-${Date.now()}`
}


/* =======================================
   GROWING SETUP ID
======================================= */

function createGrowingSetupId(
  name: string,
  category: GrowingSetupCategory,
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

  return `${category}-${
    safeName ||
    'growing-setup'
  }-${Date.now()}`
}


/* =======================================
   CUSTOM OPTION ID
======================================= */

function createCustomOptionValue(
  group: string,
  label: string,
): string {
  const safeLabel =
    label
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

  return `custom:${group}:${
    safeLabel ||
    Date.now()
  }`
}


/* =======================================
   CUSTOM OPTION STORAGE
======================================= */

function loadCustomOptions(
  storageKey: string,
): CustomPickerOption[] {
  if (
    typeof window ===
    'undefined'
  ) {
    return []
  }

  try {
    const raw =
      window.localStorage.getItem(
        storageKey,
      )

    if (!raw) {
      return []
    }

    const parsed: unknown =
      JSON.parse(
        raw,
      )

    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return []
    }

    return parsed.filter(
      (
        item,
      ): item is CustomPickerOption => {
        if (
          typeof item !==
            'object' ||
          item === null
        ) {
          return false
        }

        const candidate =
          item as Partial<CustomPickerOption>

        return (
          typeof candidate.value ===
            'string' &&
          typeof candidate.label ===
            'string' &&
          candidate.label
            .trim()
            .length >
            0
        )
      },
    )
  } catch {
    return []
  }
}


function saveCustomOptions(
  storageKey: string,
  options: CustomPickerOption[],
) {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(
      options,
    ),
  )
}


/* =======================================
   GROWING PLACE OPTIONS
======================================= */

const growingPlaceTypeOptions:
  CustomPickerOption[] = [
    {
      value: 'garden-bed',
      label: 'Garden Bed',
    },
    {
      value: 'raised-bed',
      label: 'Raised Bed',
    },
    {
      value: 'pot',
      label: 'Pot',
    },
    {
      value: 'grow-bag',
      label: 'Grow Bag',
    },
    {
      value: 'planter-box',
      label: 'Planter Box',
    },
    {
      value: 'greenhouse',
      label: 'Greenhouse',
    },
    {
      value: 'cold-frame',
      label: 'Cold Frame',
    },
    {
      value: 'shade-house',
      label: 'Shade House',
    },
    {
      value: 'deck',
      label: 'Deck',
    },
    {
      value: 'patio',
      label: 'Patio',
    },
    {
      value: 'balcony',
      label: 'Balcony',
    },
    {
      value: 'courtyard',
      label: 'Courtyard',
    },
    {
      value: 'retaining-wall',
      label: 'Retaining Wall',
    },
    {
      value: 'rock-wall',
      label: 'Rock Wall',
    },
    {
      value: 'grass-area',
      label: 'Grass Area',
    },
    {
      value: 'orchard',
      label: 'Orchard',
    },
    {
      value: 'food-forest',
      label: 'Food Forest',
    },
    {
      value: 'indoor',
      label: 'Indoor Room',
    },
    {
      value: 'windowsill',
      label: 'Windowsill',
    },
  ]


/* =======================================
   GROWING SETUP OPTIONS
======================================= */

const growingSetupCategoryOptions: {
  value: GrowingSetupCategory
  label: string
}[] = [
  {
    value: 'own-mix',
    label: 'My Own Mix',
  },
  {
    value: 'bought-mix',
    label: 'I bought a mix',
  },
  {
    value: 'ground-type',
    label: 'Straight into the ground',
  },
  {
    value: 'growing-system',
    label: "It's a growing system",
  },
]


const groundTypeOptions:
  CustomPickerOption[] = [
    {
      value: 'native-soil',
      label: 'Native Soil',
    },
    {
      value: 'native-clay',
      label: 'Native Clay',
    },
    {
      value: 'loam',
      label: 'Loam',
    },
    {
      value: 'sandy-soil',
      label: 'Sandy Soil',
    },
    {
      value: 'rocky-soil',
      label: 'Rocky Soil',
    },
    {
      value: 'peat-soil',
      label: 'Peat Soil',
    },
    {
      value: 'imported-topsoil',
      label: 'Imported Topsoil',
    },
    {
      value: 'not-sure',
      label: 'Not Sure',
    },
  ]


const growingSystemOptions:
  CustomPickerOption[] = [
    {
      value: 'no-dig',
      label: 'No-Dig',
    },
    {
      value: 'layered-bed',
      label: 'Layered Bed',
    },
    {
      value: 'hugelkultur',
      label: 'Hügelkultur',
    },
    {
      value: 'filled-raised-bed',
      label: 'Filled Raised Bed',
    },
    {
      value: 'wicking-bed',
      label: 'Wicking Bed',
    },
    {
      value: 'hydroponic',
      label: 'Hydroponics',
    },
    {
      value: 'aquaponic',
      label: 'Aquaponics',
    },
    {
      value: 'kratky',
      label: 'Kratky',
    },
    {
      value: 'nft',
      label: 'NFT',
    },
    {
      value: 'deep-water-culture',
      label: 'Deep Water Culture',
    },
    {
      value: 'ebb-and-flow',
      label: 'Ebb & Flow',
    },
    {
      value: 'aeroponic',
      label: 'Aeroponics',
    },
  ]


/* =======================================
   CATEGORY LABEL
======================================= */

function getGrowingSetupCategoryLabel(
  category: GrowingSetupCategory,
): string {
  switch (
    category
  ) {
    case 'own-mix':
      return 'My Own Mix'

    case 'bought-mix':
      return 'Bought Mix'

    case 'ground-type':
      return 'Ground'

    case 'growing-system':
      return 'Growing System'

    default:
      return 'Growing Recipe'
  }
}


/* =======================================
   ADD GROWING PLACE
======================================= */

export default function AddGrowingPlaceForm({
  ingredients,
  growingSetups,
  onAddPlace,
  onAddIngredient,
  onClose,
}: AddGrowingPlaceFormProps) {
  const now =
    new Date().toISOString()

  const today =
    now.slice(
      0,
      10,
    )


  /* =======================================
     SAVED CUSTOM PICKER OPTIONS
  ======================================= */

  const [
    customPlaceTypeOptions,
    setCustomPlaceTypeOptions,
  ] =
    useState<CustomPickerOption[]>(
      () =>
        loadCustomOptions(
          CUSTOM_PLACE_TYPES_KEY,
        ),
    )


  const [
    customGroundTypeOptions,
    setCustomGroundTypeOptions,
  ] =
    useState<CustomPickerOption[]>(
      () =>
        loadCustomOptions(
          CUSTOM_GROUND_TYPES_KEY,
        ),
    )


  const [
    customGrowingSystemOptions,
    setCustomGrowingSystemOptions,
  ] =
    useState<CustomPickerOption[]>(
      () =>
        loadCustomOptions(
          CUSTOM_GROWING_SYSTEMS_KEY,
        ),
    )


  const allGrowingPlaceTypeOptions = [
    ...growingPlaceTypeOptions,
    ...customPlaceTypeOptions,
  ]


  const allGroundTypeOptions = [
    ...groundTypeOptions,
    ...customGroundTypeOptions,
  ]


  const allGrowingSystemOptions = [
    ...growingSystemOptions,
    ...customGrowingSystemOptions,
  ]


  /* =======================================
     GROWING PLACE
  ======================================= */

  const [
    name,
    setName,
  ] =
    useState('')


  const [
    kind,
    setKind,
  ] =
    useState<string>(
      'garden-bed',
    )


  const [
    isKindPickerOpen,
    setIsKindPickerOpen,
  ] =
    useState(false)


  /* =======================================
     GROWING PLACE PHOTOGRAPHS
  ======================================= */

  const [
    placePhotoUrls,
    setPlacePhotoUrls,
  ] =
    useState<string[]>(
      [],
    )


  /* =======================================
     GROWING SETUP CATEGORY
  ======================================= */

  const [
    growingSetupCategory,
    setGrowingSetupCategory,
  ] =
    useState<
      GrowingSetupCategory | null
    >(
      null,
    )


  /* =======================================
     EXISTING GROWING SETUP
  ======================================= */

  const [
    selectedExistingSetupId,
    setSelectedExistingSetupId,
  ] =
    useState('')


  const [
    isExistingSetupPickerOpen,
    setIsExistingSetupPickerOpen,
  ] =
    useState(false)


  const [
    isCreatingNewSetup,
    setIsCreatingNewSetup,
  ] =
    useState(false)


  const existingSetupsForCategory =
    growingSetupCategory
      ? growingSetups
          .filter(
            (
              setup,
            ) =>
              setup.category ===
                growingSetupCategory &&
              !setup.isArchived,
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
      : []


  const shouldShowNewSetupBuilder =
    Boolean(
      growingSetupCategory,
    ) &&
    (
      isCreatingNewSetup ||
      existingSetupsForCategory.length ===
        0
    )


  /* =======================================
     GROWING SETUP PHOTOGRAPHS
  ======================================= */

  const [
    setupPhotoUrls,
    setSetupPhotoUrls,
  ] =
    useState<string[]>(
      [],
    )


  /* =======================================
     MY OWN MIX
  ======================================= */

  const [
    ownMixName,
    setOwnMixName,
  ] =
    useState('')


  const [
    ownMixCreatedDate,
    setOwnMixCreatedDate,
  ] =
    useState(
      today,
    )


  const [
    ownMixNotes,
    setOwnMixNotes,
  ] =
    useState('')


  const [
    selectedIngredientIds,
    setSelectedIngredientIds,
  ] =
    useState<string[]>(
      [],
    )


  /* =======================================
     INGREDIENT CREATION
  ======================================= */

  function createIngredientId(
    ingredientName: string,
  ): string {
    const safeName =
      ingredientName
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
      'ingredient'
    }-${Date.now()}`
  }


  function createIngredient(
    ingredientName: string,
  ): string | undefined {
    const trimmedName =
      ingredientName.trim()

    if (!trimmedName) {
      return undefined
    }


    const existingIngredient =
      ingredients.find(
        (ingredient) =>
          ingredient.name
            .trim()
            .toLowerCase() ===
          trimmedName
            .toLowerCase(),
      )


    if (
      existingIngredient
    ) {
      return existingIngredient.id
    }


    const newIngredient:
      Ingredient = {
        id:
          createIngredientId(
            trimmedName,
          ),

        name:
          trimmedName,

        photoUrls: [],

        createdAt:
          new Date()
            .toISOString(),
      }


    onAddIngredient(
      newIngredient,
    )


    return newIngredient.id
  }


  /* =======================================
     BOUGHT MIX
  ======================================= */

  const [
    boughtMixBrand,
    setBoughtMixBrand,
  ] =
    useState('')


  const [
    boughtMixProductName,
    setBoughtMixProductName,
  ] =
    useState('')


  const [
    boughtMixAddedDate,
    setBoughtMixAddedDate,
  ] =
    useState(
      today,
    )


  const [
    boughtMixNotes,
    setBoughtMixNotes,
  ] =
    useState('')


  /* =======================================
     STRAIGHT INTO THE GROUND
  ======================================= */

  const [
    groundType,
    setGroundType,
  ] =
    useState<string | null>(
      null,
    )


  const [
    groundTypeAddedDate,
    setGroundTypeAddedDate,
  ] =
    useState(
      today,
    )


  const [
    groundTypeNotes,
    setGroundTypeNotes,
  ] =
    useState('')


  /* =======================================
     GROWING SYSTEM
  ======================================= */

  const [
    growingSystemType,
    setGrowingSystemType,
  ] =
    useState<string | null>(
      null,
    )


  const [
    growingSystemAddedDate,
    setGrowingSystemAddedDate,
  ] =
    useState(
      today,
    )


  const [
    growingSystemNotes,
    setGrowingSystemNotes,
  ] =
    useState('')


  /* =======================================
     GROWING PLACE NOTES
  ======================================= */

  const [
    notes,
    setNotes,
  ] =
    useState('')


  /* =======================================
     FORM REF
  ======================================= */

  const formRef =
    useRef<HTMLFormElement>(
      null,
    )


  /* =======================================
     CUSTOM PLACE TYPE
  ======================================= */

  function createCustomPlaceType(
    label: string,
  ): string {
    const trimmedLabel =
      label.trim()


    const existing =
      allGrowingPlaceTypeOptions.find(
        (option) =>
          option.label
            .toLowerCase() ===
          trimmedLabel
            .toLowerCase(),
      )


    if (existing) {
      return existing.value
    }


    const newOption = {
      value:
        createCustomOptionValue(
          'place-type',
          trimmedLabel,
        ),

      label:
        trimmedLabel,
    }


    const updated = [
      ...customPlaceTypeOptions,
      newOption,
    ]


    setCustomPlaceTypeOptions(
      updated,
    )


    saveCustomOptions(
      CUSTOM_PLACE_TYPES_KEY,
      updated,
    )


    return newOption.value
  }


  /* =======================================
     CUSTOM GROUND TYPE
  ======================================= */

  function createCustomGroundType(
    label: string,
  ): string {
    const trimmedLabel =
      label.trim()


    const existing =
      allGroundTypeOptions.find(
        (option) =>
          option.label
            .toLowerCase() ===
          trimmedLabel
            .toLowerCase(),
      )


    if (existing) {
      return existing.value
    }


    const newOption = {
      value:
        createCustomOptionValue(
          'ground-type',
          trimmedLabel,
        ),

      label:
        trimmedLabel,
    }


    const updated = [
      ...customGroundTypeOptions,
      newOption,
    ]


    setCustomGroundTypeOptions(
      updated,
    )


    saveCustomOptions(
      CUSTOM_GROUND_TYPES_KEY,
      updated,
    )


    return newOption.value
  }


  /* =======================================
     CUSTOM GROWING SYSTEM
  ======================================= */

  function createCustomGrowingSystem(
    label: string,
  ): string {
    const trimmedLabel =
      label.trim()


    const existing =
      allGrowingSystemOptions.find(
        (option) =>
          option.label
            .toLowerCase() ===
          trimmedLabel
            .toLowerCase(),
      )


    if (existing) {
      return existing.value
    }


    const newOption = {
      value:
        createCustomOptionValue(
          'growing-system',
          trimmedLabel,
        ),

      label:
        trimmedLabel,
    }


    const updated = [
      ...customGrowingSystemOptions,
      newOption,
    ]


    setCustomGrowingSystemOptions(
      updated,
    )


    saveCustomOptions(
      CUSTOM_GROWING_SYSTEMS_KEY,
      updated,
    )


    return newOption.value
  }


  void createCustomGroundType
  void createCustomGrowingSystem


  /* =======================================
     FORM SCROLL / BODY LOCK
  ======================================= */

  useEffect(() => {
    const scrollY =
      window.scrollY


    requestAnimationFrame(
      () => {
        if (
          formRef.current
        ) {
          formRef.current
            .scrollTop = 0
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
  }, [])


  /* =======================================
     SAVE
  ======================================= */

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()


    const trimmedName =
      name.trim()


    if (!trimmedName) {
      return
    }


    let newSetup:
      | GrowingSetup
      | undefined


    let growingSetupId:
      | string
      | undefined


    /* =======================================
       EXISTING GROWING SETUP
    ======================================= */

    if (
      selectedExistingSetupId &&
      !isCreatingNewSetup
    ) {
      growingSetupId =
        selectedExistingSetupId
    }


    /* =======================================
       NEW GROWING SETUP
    ======================================= */

    const needsNewSetup =
      Boolean(
        growingSetupCategory,
      ) &&
      (
        isCreatingNewSetup ||
        existingSetupsForCategory.length ===
          0
      )


    if (
      growingSetupCategory &&
      !growingSetupId &&
      !needsNewSetup
    ) {
      return
    }


    /* ---------- MY OWN MIX ---------- */

    if (
      growingSetupCategory ===
        'own-mix' &&
      needsNewSetup
    ) {
      const trimmedMixName =
        ownMixName.trim()


      if (!trimmedMixName) {
        return
      }


      newSetup = {
        id:
          createGrowingSetupId(
            trimmedMixName,
            'own-mix',
          ),

        name:
          trimmedMixName,

        category:
          'own-mix',

        ingredientIds:
          selectedIngredientIds,

        notes:
          ownMixNotes
            .trim() ||
          undefined,

        photoUrls:
          setupPhotoUrls,

        createdAt:
          ownMixCreatedDate,
      }


      growingSetupId =
        newSetup.id
    }


    /* ---------- BOUGHT MIX ---------- */

    if (
      growingSetupCategory ===
        'bought-mix' &&
      needsNewSetup
    ) {
      const trimmedBrand =
        boughtMixBrand.trim()

      const trimmedProductName =
        boughtMixProductName.trim()


      if (
        !trimmedBrand ||
        !trimmedProductName
      ) {
        return
      }


      const setupName =
        `${trimmedBrand} ${trimmedProductName}`


      newSetup = {
        id:
          createGrowingSetupId(
            setupName,
            'bought-mix',
          ),

        name:
          setupName,

        category:
          'bought-mix',

        brand:
          trimmedBrand,

        productName:
          trimmedProductName,

        notes:
          boughtMixNotes
            .trim() ||
          undefined,

        photoUrls:
          setupPhotoUrls,

        createdAt:
          boughtMixAddedDate,
      }


      growingSetupId =
        newSetup.id
    }


    /* ---------- GROUND TYPE ---------- */

    if (
      growingSetupCategory ===
        'ground-type' &&
      needsNewSetup
    ) {
      if (!groundType) {
        return
      }


      const groundOption =
        allGroundTypeOptions.find(
          (option) =>
            option.value ===
            groundType,
        )


      const groundLabel =
        groundOption?.label ??
        'Growing Ground'


      const isCustomGround =
        groundType.startsWith(
          'custom:',
        )


      newSetup = {
        id:
          createGrowingSetupId(
            groundLabel,
            'ground-type',
          ),

        name:
          groundLabel,

        category:
          'ground-type',

        groundType:
          isCustomGround
            ? 'something-else'
            : groundType as GrowingGroundType,

        notes:
          groundTypeNotes
            .trim() ||
          undefined,

        photoUrls:
          setupPhotoUrls,

        createdAt:
          groundTypeAddedDate,
      }


      growingSetupId =
        newSetup.id
    }


    /* ---------- GROWING SYSTEM ---------- */

    if (
      growingSetupCategory ===
        'growing-system' &&
      needsNewSetup
    ) {
      if (
        !growingSystemType
      ) {
        return
      }


      const systemOption =
        allGrowingSystemOptions.find(
          (option) =>
            option.value ===
            growingSystemType,
        )


      const systemLabel =
        systemOption?.label ??
        'Growing System'


      const isCustomSystem =
        growingSystemType
          .startsWith(
            'custom:',
          )


      newSetup = {
        id:
          createGrowingSetupId(
            systemLabel,
            'growing-system',
          ),

        name:
          systemLabel,

        category:
          'growing-system',

        growingSystemType:
          isCustomSystem
            ? 'something-else'
            : growingSystemType as GrowingGroundMethod,

        notes:
          growingSystemNotes
            .trim() ||
          undefined,

        photoUrls:
          setupPhotoUrls,

        createdAt:
          growingSystemAddedDate,
      }


      growingSetupId =
        newSetup.id
    }


    /* ---------- GROWING PLACE ---------- */

    const selectedKindOption =
      allGrowingPlaceTypeOptions.find(
        (option) =>
          option.value ===
          kind,
      )


    const isCustomKind =
      kind.startsWith(
        'custom:',
      )


    const newPlace:
      GrowingPlace = {
        id:
          createGrowingPlaceId(
            trimmedName,
          ),

        name:
          trimmedName,

        kind:
          isCustomKind
            ? 'other'
            : kind as GrowingPlaceKind,

        customKindLabel:
          isCustomKind
            ? selectedKindOption
                ?.label
            : undefined,

        growingSetupId,

        notes:
          notes
            .trim() ||
          undefined,

        photoUrls:
          placePhotoUrls,

        createdAt:
          now,
      }


    onAddPlace(
      newPlace,
      newSetup,
    )
  }


  return (
    <div
      className="form-backdrop"
      role="presentation"
    >
      <section
        className="add-plant-panel chronicle-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-garden-place-title"
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

          {/* =======================================
              HEADING
          ======================================= */}

          <div className="form-heading">
            <h2 id="add-garden-place-title">
              Name a growing place
            </h2>

            <button
              type="button"
              className="close-button"
              onClick={
                onClose
              }
              aria-label="Close garden place page"
            >
              ×
            </button>
          </div>


          <form
            ref={
              formRef
            }
            className="add-plant-form"
            onSubmit={
              handleSubmit
            }
          >
            <p className="form-whisper">
              🌱 Sprig remembers the
              corners where stories begin.
            </p>


            {/* =======================================
                GROWING PLACE NAME
            ======================================= */}

            <label>
              What do you call this place?

              <input
                type="text"
                value={
                  name
                }
                onChange={(
                  event,
                ) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="Top deck, potato corner..."
                required
              />
            </label>


            {/* =======================================
                GROWING PLACE TYPE
            ======================================= */}

            <SprigPicker
              title="What kind of place is it?"
              variant="label"
              emptySummary="Choose a place"
              options={
                allGrowingPlaceTypeOptions
              }
              selectedValues={[
                kind,
              ]}
              isOpen={
                isKindPickerOpen
              }
              onToggleOpen={() =>
                setIsKindPickerOpen(
                  !isKindPickerOpen,
                )
              }
              onToggleValue={(
                value,
              ) => {
                setKind(
                  value,
                )

                setIsKindPickerOpen(
                  false,
                )
              }}
              allowCustomOption
              customOptionLabel="Create a new place type..."
              customInputLabel="What would you like to call this kind of place?"
              customInputPlaceholder="Laundry Basket, Vertical Tower..."
              onCreateCustomOption={
                createCustomPlaceType
              }
            />


            {/* =======================================
                GROWING PLACE PHOTOGRAPHS
            ======================================= */}

            <section className="sprig-form-section">
              <p className="section-label">
                Growing Place
              </p>

              <SprigPhotoPicker
                photoUrls={
                  placePhotoUrls
                }
                onChange={
                  setPlacePhotoUrls
                }
                title="Photographs of this place"
                helperText="Tuck photographs of this Growing Place into its page so Sprig can remember how the space itself looks and changes."
                addButtonText="Add place photographs"
                photoAltPrefix="Growing Place photograph"
              />
            </section>


            {/* =======================================
                GROWING SETUP CATEGORY
            ======================================= */}

            <section className="sprig-form-section">
              <SprigPicker
                title="What are you growing in?"
                variant="label"
                showTrigger={
                  false
                }
                options={
                  growingSetupCategoryOptions
                }
                selectedValues={
                  growingSetupCategory
                    ? [
                        growingSetupCategory,
                      ]
                    : []
                }
                isOpen={
                  true
                }
                onToggleOpen={() => {}}
                onToggleValue={(
                  value,
                ) => {
                  setGrowingSetupCategory(
                    value as GrowingSetupCategory,
                  )

                  setSelectedExistingSetupId(
                    '',
                  )

                  setIsExistingSetupPickerOpen(
                    false,
                  )

                  setIsCreatingNewSetup(
                    false,
                  )

                  setSetupPhotoUrls(
                    [],
                  )
                }}
              />
            </section>


            {/* =======================================
                EXISTING GROWING RECIPES
            ======================================= */}

            {growingSetupCategory &&
              existingSetupsForCategory.length >
                0 &&
              !isCreatingNewSetup && (
              <section className="sprig-form-section">
                <p className="section-label">
                  Existing Growing Recipes
                </p>

                <SprigPicker
                  title={`Which ${getGrowingSetupCategoryLabel(
                    growingSetupCategory,
                  )} is this place using?`}
                  variant="label-tall"
                  emptySummary="Choose an existing Growing Recipe"
                  options={
                    existingSetupsForCategory.map(
                      (
                        setup,
                      ) => ({
                        value:
                          setup.id,

                        label:
                          setup.name,

                        subtitle:
                          getGrowingSetupCategoryLabel(
                            setup.category,
                          ),

                        meta:
                          setup.createdAt
                            ? `Added ${new Date(
                                `${setup.createdAt.slice(
                                  0,
                                  10,
                                )}T00:00:00`,
                              ).toLocaleDateString(
                                'en-AU',
                                {
                                  day:
                                    'numeric',

                                  month:
                                    'short',

                                  year:
                                    'numeric',
                                },
                              )}`
                            : undefined,
                      }),
                    )
                  }
                  selectedValues={
                    selectedExistingSetupId
                      ? [
                          selectedExistingSetupId,
                        ]
                      : []
                  }
                  isOpen={
                    isExistingSetupPickerOpen
                  }
                  onToggleOpen={() =>
                    setIsExistingSetupPickerOpen(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  onToggleValue={(
                    id,
                  ) => {
                    setSelectedExistingSetupId(
                      id,
                    )

                    setIsExistingSetupPickerOpen(
                      false,
                    )
                  }}
                />


                <button
                  type="button"
                  className="garden-place-link"
                  onClick={() => {
                    setSelectedExistingSetupId(
                      '',
                    )

                    setIsExistingSetupPickerOpen(
                      false,
                    )

                    setIsCreatingNewSetup(
                      true,
                    )
                  }}
                >
                  + Create a new Growing Recipe
                </button>
              </section>
            )}


            {/* =======================================
                NEW RECIPE NOTICE
            ======================================= */}

            {growingSetupCategory &&
              shouldShowNewSetupBuilder && (
              <section className="sprig-form-section">
                <p className="section-label">
                  New Growing Recipe
                </p>

                <p className="form-whisper">
                  {existingSetupsForCategory.length >
                  0
                    ? 'Sprig will create a new Growing Recipe and connect it to this place.'
                    : `You do not have a saved ${getGrowingSetupCategoryLabel(
                        growingSetupCategory,
                      )} yet, so you can create one here.`}
                </p>


                {existingSetupsForCategory.length >
                  0 && (
                  <button
                    type="button"
                    className="garden-place-link"
                    onClick={() => {
                      setIsCreatingNewSetup(
                        false,
                      )
                    }}
                  >
                    ← Choose an existing Growing Recipe
                  </button>
                )}
              </section>
            )}


            {/* =======================================
                MY OWN MIX
            ======================================= */}

            {growingSetupCategory ===
              'own-mix' &&
              shouldShowNewSetupBuilder && (
              <OwnMixSection
                ownMixName={
                  ownMixName
                }
                setOwnMixName={
                  setOwnMixName
                }

                ownMixCreatedDate={
                  ownMixCreatedDate
                }
                setOwnMixCreatedDate={
                  setOwnMixCreatedDate
                }

                ownMixNotes={
                  ownMixNotes
                }
                setOwnMixNotes={
                  setOwnMixNotes
                }

                ingredients={
                  ingredients
                }

                selectedIngredientIds={
                  selectedIngredientIds
                }
                setSelectedIngredientIds={
                  setSelectedIngredientIds
                }

                onCreateIngredient={
                  createIngredient
                }
              />
            )}


            {/* =======================================
                BOUGHT MIX
            ======================================= */}

            {growingSetupCategory ===
              'bought-mix' &&
              shouldShowNewSetupBuilder && (
              <BoughtMixSection
                boughtMixBrand={
                  boughtMixBrand
                }
                setBoughtMixBrand={
                  setBoughtMixBrand
                }

                boughtMixProductName={
                  boughtMixProductName
                }
                setBoughtMixProductName={
                  setBoughtMixProductName
                }

                boughtMixAddedDate={
                  boughtMixAddedDate
                }
                setBoughtMixAddedDate={
                  setBoughtMixAddedDate
                }

                boughtMixNotes={
                  boughtMixNotes
                }
                setBoughtMixNotes={
                  setBoughtMixNotes
                }
              />
            )}


            {/* =======================================
                STRAIGHT INTO THE GROUND
            ======================================= */}

            {growingSetupCategory ===
              'ground-type' &&
              shouldShowNewSetupBuilder && (
              <GroundTypeSection
                groundType={
                  groundType
                }
                setGroundType={
                  setGroundType
                }

                groundTypeOptions={
                  allGroundTypeOptions
                }

                groundTypeAddedDate={
                  groundTypeAddedDate
                }
                setGroundTypeAddedDate={
                  setGroundTypeAddedDate
                }

                groundTypeNotes={
                  groundTypeNotes
                }
                setGroundTypeNotes={
                  setGroundTypeNotes
                }
              />
            )}


            {/* =======================================
                GROWING SYSTEM
            ======================================= */}

            {growingSetupCategory ===
              'growing-system' &&
              shouldShowNewSetupBuilder && (
              <GrowingSystemSection
                growingSystemType={
                  growingSystemType
                }
                setGrowingSystemType={
                  setGrowingSystemType
                }

                growingSystemOptions={
                  allGrowingSystemOptions
                }

                growingSystemAddedDate={
                  growingSystemAddedDate
                }
                setGrowingSystemAddedDate={
                  setGrowingSystemAddedDate
                }

                growingSystemNotes={
                  growingSystemNotes
                }
                setGrowingSystemNotes={
                  setGrowingSystemNotes
                }
              />
            )}


            {/* =======================================
                NEW GROWING SETUP PHOTOGRAPHS
            ======================================= */}

            {growingSetupCategory &&
              shouldShowNewSetupBuilder && (
              <section className="sprig-form-section">
                <p className="section-label">
                  Growing Recipe
                </p>

                <SprigPhotoPicker
                  photoUrls={
                    setupPhotoUrls
                  }
                  onChange={
                    setSetupPhotoUrls
                  }
                  title="Photographs of what it grows in"
                  helperText="These photographs belong to the new Growing Recipe itself, such as the mix, soil, ingredients, packaging or growing system."
                  addButtonText="Add recipe photographs"
                  photoAltPrefix="Growing Recipe photograph"
                />
              </section>
            )}


            {/* =======================================
                GROWING PLACE NOTES
            ======================================= */}

            <label>
              Notes to the place

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
                placeholder="Sun, shade, size, quirks..."
                rows={
                  4
                }
              />
            </label>


            {/* =======================================
                ACTIONS
            ======================================= */}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={
                  onClose
                }
              >
                Go back
              </button>

              <button
                type="submit"
                className="enter-button"
              >
                Add this growing place
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}