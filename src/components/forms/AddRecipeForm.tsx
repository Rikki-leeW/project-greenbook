import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'

import SprigPicker from '../sprig/SprigPicker'
import PurchaseDetailsSection from '../purchases/PurchaseDetailsSection'
import SprigPhotoPicker from '../photos/SprigPhotoPicker'
import OwnMixSection from './OwnMixSection'
import BoughtMixSection from './BoughtMixSection'
import GroundTypeSection from './GroundTypeSection'
import GrowingSystemSection from './GrowingSystemSection'
import RecipeComponentsSection from './RecipeComponentsSection'

import type {
  GardenProduct,
  GrowingGroundMethod,
  GrowingGroundType,
  GrowingSetup,
  GrowingSetupCategory,
  Ingredient,
  PurchaseRecord,
  PurchaseUnit,
} from '../../types'

interface AddRecipeFormProps {
  ingredients: Ingredient[]

  products: GardenProduct[]

  growingSetups: GrowingSetup[]

  /*
   * When supplied, the form becomes an
   * Edit Growing Recipe form.
   */
  recipeToEdit?: GrowingSetup

  /*
   * Used when creating a brand-new
   * Growing Recipe.
   */
  onAddRecipe: (
    recipe: GrowingSetup,
  ) => void

  /*
   * Used when editing an existing
   * Growing Recipe.
   */
  onUpdateRecipe?: (
    recipe: GrowingSetup,
  ) => void

  /*
   * Bought Mix purchases live separately
   * from the Growing Recipe itself.
   *
   * This lets Sprig preserve changing
   * prices, suppliers and package sizes
   * over time.
   */
  onAddPurchase?: (
    purchase: PurchaseRecord,
  ) => void

  onAddIngredient: (
    ingredient: Ingredient,
  ) => void

  onAddProduct: (
    product: GardenProduct,
  ) => void

  onClose: () => void
}

interface PickerOption {
  value: string
  label: string
}

const CUSTOM_GROUND_TYPES_KEY =
  'sprig-custom-ground-types'

const CUSTOM_GROWING_SYSTEMS_KEY =
  'sprig-custom-growing-systems'


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
    'growing-recipe'
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
    'ingredient'
  }-${Date.now()}`
}


/* =======================================
   PURCHASE ID
======================================= */

function createPurchaseId(
  growingSetupId: string,
): string {
  return `purchase-${growingSetupId}-${Date.now()}`
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
): PickerOption[] {
  try {
    const raw =
      localStorage.getItem(
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
      ): item is PickerOption => {
        if (
          typeof item !==
            'object' ||
          item === null
        ) {
          return false
        }

        const candidate =
          item as Partial<PickerOption>

        return (
          typeof candidate.value ===
            'string' &&
          typeof candidate.label ===
            'string'
        )
      },
    )
  } catch {
    return []
  }
}


function saveCustomOptions(
  storageKey: string,
  options: PickerOption[],
) {
  localStorage.setItem(
    storageKey,
    JSON.stringify(
      options,
    ),
  )
}


/* =======================================
   CATEGORY OPTIONS
======================================= */

const recipeCategoryOptions: {
  value: GrowingSetupCategory
  label: string
}[] = [
  {
    value: 'own-mix',
    label: 'My Recipe',
  },
  {
    value: 'bought-mix',
    label: 'Bought Mix',
  },
  {
    value: 'ground-type',
    label: 'Native Ground',
  },
  {
    value: 'growing-system',
    label: 'Growing System',
  },
]


const groundTypeOptions:
  PickerOption[] = [
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
  PickerOption[] = [
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
   ADD / EDIT GROWING RECIPE
======================================= */

export default function AddRecipeForm({
  ingredients,
  products,
  growingSetups,
  recipeToEdit,
  onAddRecipe,
  onUpdateRecipe,
  onAddPurchase,
  onAddIngredient,
  onAddProduct,
  onClose,
}: AddRecipeFormProps) {
  const now =
    new Date().toISOString()

  const today =
    now.slice(
      0,
      10,
    )

  const isEditing =
    Boolean(
      recipeToEdit,
    )


  /* =======================================
     CATEGORY
  ======================================= */

  const [
    category,
    setCategory,
  ] =
    useState<
      GrowingSetupCategory | null
    >(
      recipeToEdit?.category ??
        null,
    )


  /* =======================================
     MY RECIPE
  ======================================= */

  const [
    ownMixName,
    setOwnMixName,
  ] =
    useState(
      recipeToEdit?.category ===
        'own-mix'
        ? recipeToEdit.name
        : '',
    )


  const [
    ownMixCreatedDate,
    setOwnMixCreatedDate,
  ] =
    useState(
      recipeToEdit?.category ===
        'own-mix'
        ? recipeToEdit
            .createdAt
            .slice(
              0,
              10,
            )
        : today,
    )


  const [
    ownMixNotes,
    setOwnMixNotes,
  ] =
    useState(
      recipeToEdit?.category ===
        'own-mix'
        ? recipeToEdit.notes ??
          ''
        : '',
    )


  const [
    selectedIngredientIds,
    setSelectedIngredientIds,
  ] =
    useState<string[]>(
      recipeToEdit
        ?.ingredientIds ??
        [],
    )


  const [
    recipeComponents,
    setRecipeComponents,
  ] =
    useState<
      GrowingSetup['recipeComponents']
    >(
      recipeToEdit
        ?.recipeComponents ??
        [],
    )


  /* =======================================
     BOUGHT MIX
  ======================================= */

  const [
    boughtMixBrand,
    setBoughtMixBrand,
  ] =
    useState(
      recipeToEdit?.category ===
        'bought-mix'
        ? recipeToEdit.brand ??
          ''
        : '',
    )


  const [
    boughtMixProductName,
    setBoughtMixProductName,
  ] =
    useState(
      recipeToEdit?.category ===
        'bought-mix'
        ? recipeToEdit
            .productName ??
          ''
        : '',
    )


  const [
    boughtMixAddedDate,
    setBoughtMixAddedDate,
  ] =
    useState(
      recipeToEdit?.category ===
        'bought-mix'
        ? recipeToEdit
            .createdAt
            .slice(
              0,
              10,
            )
        : today,
    )


  const [
    boughtMixNotes,
    setBoughtMixNotes,
  ] =
    useState(
      recipeToEdit?.category ===
        'bought-mix'
        ? recipeToEdit.notes ??
          ''
        : '',
    )


  /* =======================================
     BOUGHT MIX PURCHASE DETAILS
  ======================================= */

  /*
   * These fields deliberately begin blank
   * when editing.
   *
   * Existing historical purchases are edited
   * from the Purchase history on the detail
   * page.
   *
   * Entering values here while editing creates
   * another PurchaseRecord instead.
   */

  const [
    supplier,
    setSupplier,
  ] =
    useState('')


  const [
    purchaseDate,
    setPurchaseDate,
  ] =
    useState(
      today,
    )


  const [
    pricePaid,
    setPricePaid,
  ] =
    useState('')


  const [
    purchaseQuantity,
    setPurchaseQuantity,
  ] =
    useState('1')


  const [
    purchaseUnit,
    setPurchaseUnit,
  ] =
    useState<PurchaseUnit>(
      'each',
    )


  const [
    packageSize,
    setPackageSize,
  ] =
    useState('')


  const [
    packageUnit,
    setPackageUnit,
  ] =
    useState<PurchaseUnit>(
      'litre',
    )


  const [
    purchaseNotes,
    setPurchaseNotes,
  ] =
    useState('')


  /* =======================================
     NATIVE GROUND
  ======================================= */

  const [
    groundType,
    setGroundType,
  ] =
    useState<string | null>(
      recipeToEdit?.category ===
        'ground-type'
        ? recipeToEdit
            .groundType ??
          null
        : null,
    )


  const [
    groundTypeAddedDate,
    setGroundTypeAddedDate,
  ] =
    useState(
      recipeToEdit?.category ===
        'ground-type'
        ? recipeToEdit
            .createdAt
            .slice(
              0,
              10,
            )
        : today,
    )


  const [
    groundTypeNotes,
    setGroundTypeNotes,
  ] =
    useState(
      recipeToEdit?.category ===
        'ground-type'
        ? recipeToEdit.notes ??
          ''
        : '',
    )


  /* =======================================
     GROWING SYSTEM
  ======================================= */

  const [
    growingSystemType,
    setGrowingSystemType,
  ] =
    useState<string | null>(
      recipeToEdit?.category ===
        'growing-system'
        ? recipeToEdit
            .growingSystemType ??
          null
        : null,
    )


  const [
    growingSystemAddedDate,
    setGrowingSystemAddedDate,
  ] =
    useState(
      recipeToEdit?.category ===
        'growing-system'
        ? recipeToEdit
            .createdAt
            .slice(
              0,
              10,
            )
        : today,
    )


  const [
    growingSystemNotes,
    setGrowingSystemNotes,
  ] =
    useState(
      recipeToEdit?.category ===
        'growing-system'
        ? recipeToEdit.notes ??
          ''
        : '',
    )


  /* =======================================
     PHOTOGRAPHS
  ======================================= */

  const [
    photoUrls,
    setPhotoUrls,
  ] =
    useState<string[]>(
      recipeToEdit?.photoUrls ??
        [],
    )


  /* =======================================
     CUSTOM OPTIONS
  ======================================= */

  const [
    customGroundTypeOptions,
    setCustomGroundTypeOptions,
  ] =
    useState<PickerOption[]>(
      () =>
        loadCustomOptions(
          CUSTOM_GROUND_TYPES_KEY,
        ),
    )


  const [
    customGrowingSystemOptions,
    setCustomGrowingSystemOptions,
  ] =
    useState<PickerOption[]>(
      () =>
        loadCustomOptions(
          CUSTOM_GROWING_SYSTEMS_KEY,
        ),
    )


  const allGroundTypeOptions = [
    ...groundTypeOptions,
    ...customGroundTypeOptions,
  ]


  const allGrowingSystemOptions = [
    ...growingSystemOptions,
    ...customGrowingSystemOptions,
  ]


  /* =======================================
     FORM REF
  ======================================= */

  const formRef =
    useRef<HTMLFormElement>(
      null,
    )


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
     INGREDIENT CREATION
  ======================================= */

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
     CUSTOM GROUND TYPE
  ======================================= */

  function createCustomGroundType(
    label: string,
  ): string {
    const trimmed =
      label.trim()

    if (!trimmed) {
      return ''
    }

    const existing =
      allGroundTypeOptions.find(
        (option) =>
          option.label
            .toLowerCase() ===
          trimmed
            .toLowerCase(),
      )

    if (existing) {
      return existing.value
    }

    const newOption = {
      value:
        createCustomOptionValue(
          'ground-type',
          trimmed,
        ),

      label:
        trimmed,
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
    const trimmed =
      label.trim()

    if (!trimmed) {
      return ''
    }

    const existing =
      allGrowingSystemOptions.find(
        (option) =>
          option.label
            .toLowerCase() ===
          trimmed
            .toLowerCase(),
      )

    if (existing) {
      return existing.value
    }

    const newOption = {
      value:
        createCustomOptionValue(
          'growing-system',
          trimmed,
        ),

      label:
        trimmed,
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


  /*
   * Keep these helpers available while
   * custom ground/system creation remains
   * owned by this form.
   */
  void createCustomGroundType
  void createCustomGrowingSystem


  /* =======================================
     CREATE BOUGHT MIX PURCHASE
  ======================================= */

  function createBoughtMixPurchase(
    savedRecipe: GrowingSetup,
  ): PurchaseRecord | undefined {
    const trimmedPrice =
      pricePaid.trim()

    /*
     * Purchase details are optional.
     *
     * No price means no PurchaseRecord.
     */
    if (!trimmedPrice) {
      return undefined
    }


    const numericPrice =
      Number(
        trimmedPrice,
      )


    if (
      !Number.isFinite(
        numericPrice,
      ) ||
      numericPrice < 0
    ) {
      window.alert(
        'Please enter a valid total price paid.',
      )

      return undefined
    }


    const numericQuantity =
      purchaseQuantity.trim()
        ? Number(
            purchaseQuantity,
          )
        : undefined


    const numericPackageSize =
      packageSize.trim()
        ? Number(
            packageSize,
          )
        : undefined


    return {
      id:
        createPurchaseId(
          savedRecipe.id,
        ),

      /*
       * This is a Growing Setup purchase.
       *
       * Bought Mix is a GrowingSetup record,
       * not a GardenProduct.
       */
      itemType:
        'growing-setup',

      itemId:
        savedRecipe.id,

      itemName:
        savedRecipe.name,

      date:
        purchaseDate ||
        today,

      supplier:
        supplier.trim() ||
        undefined,

      brand:
        savedRecipe.brand,

      pricePaid:
        numericPrice,

      currency:
        'AUD',

      quantity:
        numericQuantity !==
          undefined &&
        Number.isFinite(
          numericQuantity,
        )
          ? numericQuantity
          : undefined,

      unit:
        purchaseQuantity.trim()
          ? purchaseUnit
          : undefined,

      packageSize:
        numericPackageSize !==
          undefined &&
        Number.isFinite(
          numericPackageSize,
        )
          ? numericPackageSize
          : undefined,

      packageUnit:
        packageSize.trim()
          ? packageUnit
          : undefined,

      notes:
        purchaseNotes
          .trim() ||
        undefined,

      createdAt:
        now,
    }
  }


  /* =======================================
     SAVE RECIPE
  ======================================= */

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!category) {
      return
    }

    let recipe:
      | GrowingSetup
      | undefined


    /* ---------- MY RECIPE ---------- */

    if (
      category ===
      'own-mix'
    ) {
      const trimmedName =
        ownMixName.trim()

      if (!trimmedName) {
        return
      }

      recipe = {
        id:
          recipeToEdit?.id ??
          createGrowingSetupId(
            trimmedName,
            'own-mix',
          ),

        name:
          trimmedName,

        category:
          'own-mix',

        ingredientIds:
          selectedIngredientIds,

        recipeComponents:
          recipeComponents,

        notes:
          ownMixNotes
            .trim() ||
          undefined,

        photoUrls,

        createdAt:
          recipeToEdit
            ?.createdAt ??
          ownMixCreatedDate,

        updatedAt:
          isEditing
            ? now
            : undefined,
      }
    }


    /* ---------- BOUGHT MIX ---------- */

    if (
      category ===
      'bought-mix'
    ) {
      const trimmedBrand =
        boughtMixBrand.trim()

      const trimmedProductName =
        boughtMixProductName.trim()

      if (
        !trimmedProductName
      ) {
        return
      }

      const recipeName =
        trimmedBrand
          ? `${trimmedBrand} ${trimmedProductName}`
          : trimmedProductName

      recipe = {
        id:
          recipeToEdit?.id ??
          createGrowingSetupId(
            recipeName,
            'bought-mix',
          ),

        name:
          recipeName,

        category:
          'bought-mix',

        brand:
          trimmedBrand ||
          undefined,

        productName:
          trimmedProductName,

        ingredientIds:
          selectedIngredientIds,

        recipeComponents:
          recipeComponents,

        notes:
          boughtMixNotes
            .trim() ||
          undefined,

        photoUrls,

        createdAt:
          recipeToEdit
            ?.createdAt ??
          boughtMixAddedDate,

        updatedAt:
          isEditing
            ? now
            : undefined,
      }
    }


    /* ---------- NATIVE GROUND ---------- */

    if (
      category ===
      'ground-type'
    ) {
      if (!groundType) {
        return
      }

      const selectedOption =
        allGroundTypeOptions.find(
          (option) =>
            option.value ===
            groundType,
        )

      const recipeName =
        selectedOption
          ?.label ??
        recipeToEdit?.name ??
        'Native Ground'

      const isCustom =
        groundType.startsWith(
          'custom:',
        )

      recipe = {
        id:
          recipeToEdit?.id ??
          createGrowingSetupId(
            recipeName,
            'ground-type',
          ),

        name:
          recipeName,

        category:
          'ground-type',

        groundType:
          isCustom
            ? 'something-else'
            : groundType as GrowingGroundType,

        ingredientIds:
          selectedIngredientIds,

        recipeComponents:
          recipeComponents,

        notes:
          groundTypeNotes
            .trim() ||
          undefined,

        photoUrls,

        createdAt:
          recipeToEdit
            ?.createdAt ??
          groundTypeAddedDate,

        updatedAt:
          isEditing
            ? now
            : undefined,
      }
    }


    /* ---------- GROWING SYSTEM ---------- */

    if (
      category ===
      'growing-system'
    ) {
      if (
        !growingSystemType
      ) {
        return
      }

      const selectedOption =
        allGrowingSystemOptions.find(
          (option) =>
            option.value ===
            growingSystemType,
        )

      const recipeName =
        selectedOption
          ?.label ??
        recipeToEdit?.name ??
        'Growing System'

      const isCustom =
        growingSystemType
          .startsWith(
            'custom:',
          )

      recipe = {
        id:
          recipeToEdit?.id ??
          createGrowingSetupId(
            recipeName,
            'growing-system',
          ),

        name:
          recipeName,

        category:
          'growing-system',

        growingSystemType:
          isCustom
            ? 'something-else'
            : growingSystemType as GrowingGroundMethod,

        ingredientIds:
          selectedIngredientIds,

        recipeComponents:
          recipeComponents,

        notes:
          growingSystemNotes
            .trim() ||
          undefined,

        photoUrls,

        createdAt:
          recipeToEdit
            ?.createdAt ??
          growingSystemAddedDate,

        updatedAt:
          isEditing
            ? now
            : undefined,
      }
    }


    if (!recipe) {
      return
    }


    /*
     * Existing Growing Recipe.
     */
    if (
      isEditing &&
      onUpdateRecipe
    ) {
      onUpdateRecipe(
        recipe,
      )

      /*
       * Bought Mix:
       *
       * A price entered while editing is
       * intentionally treated as another
       * purchase, not a rewrite of an older
       * historical purchase.
       */
      if (
        category ===
          'bought-mix'
      ) {
        const purchase =
          createBoughtMixPurchase(
            recipe,
          )

        if (
          purchase &&
          onAddPurchase
        ) {
          onAddPurchase(
            purchase,
          )
        }
      }

      return
    }


    /*
     * Brand-new Growing Recipe.
     */
    onAddRecipe(
      recipe,
    )


    /*
     * Bought Mix:
     *
     * Create the first PurchaseRecord when
     * purchase information was entered.
     */
    if (
      category ===
      'bought-mix'
    ) {
      const purchase =
        createBoughtMixPurchase(
          recipe,
        )

      if (
        purchase &&
        onAddPurchase
      ) {
        onAddPurchase(
          purchase,
        )
      }
    }
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
        aria-labelledby="add-recipe-title"
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
          <div className="form-heading">
            <h2 id="add-recipe-title">
              {isEditing
                ? 'Edit Growing Recipe'
                : 'Create a Growing Recipe'}
            </h2>

            <button
              type="button"
              className="close-button"
              onClick={
                onClose
              }
              aria-label={
                isEditing
                  ? 'Close Growing Recipe editor'
                  : 'Close Growing Recipe'
              }
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
              🌱 Keep the mixtures,
              methods and ground your
              garden grows by.
            </p>


            {/* =======================================
                RECIPE CATEGORY
            ======================================= */}

            <section className="sprig-form-section">
              <SprigPicker
                title="How are your plants growing?"
                variant="label"
                showTrigger={
                  false
                }
                options={
                  recipeCategoryOptions
                }
                selectedValues={
                  category
                    ? [
                        category,
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
                  setCategory(
                    value as GrowingSetupCategory,
                  )
                }}
              />
            </section>


            {/* =======================================
                MY RECIPE
            ======================================= */}

            {category ===
              'own-mix' && (
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
              />
            )}


            {/* =======================================
                BOUGHT MIX
            ======================================= */}

            {category ===
              'bought-mix' && (
              <>
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


                {/* =======================================
                    PURCHASE DETAILS
                ======================================= */}

                <PurchaseDetailsSection
                  supplier={
                    supplier
                  }
                  setSupplier={
                    setSupplier
                  }

                  purchaseDate={
                    purchaseDate
                  }
                  setPurchaseDate={
                    setPurchaseDate
                  }

                  pricePaid={
                    pricePaid
                  }
                  setPricePaid={
                    setPricePaid
                  }

                  quantity={
                    purchaseQuantity
                  }
                  setQuantity={
                    setPurchaseQuantity
                  }

                  unit={
                    purchaseUnit
                  }
                  setUnit={
                    setPurchaseUnit
                  }

                  packageSize={
                    packageSize
                  }
                  setPackageSize={
                    setPackageSize
                  }

                  packageUnit={
                    packageUnit
                  }
                  setPackageUnit={
                    setPackageUnit
                  }

                  purchaseNotes={
                    purchaseNotes
                  }
                  setPurchaseNotes={
                    setPurchaseNotes
                  }
                />


                {isEditing && (
                  <section className="sprig-form-section">
                    <p className="section-label">
                      Purchase history
                    </p>

                    <h3>
                      Add another purchase
                    </h3>

                    <p className="form-whisper">
                      The purchase fields above
                      are intentionally blank
                      when editing this Bought
                      Mix. Fill them in only if
                      you are recording another
                      purchase. Existing
                      purchases can be changed
                      from Edit purchase on this
                      Growing Recipe&apos;s page.
                    </p>
                  </section>
                )}
              </>
            )}


            {/* =======================================
                NATIVE GROUND
            ======================================= */}

            {category ===
              'ground-type' && (
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

            {category ===
              'growing-system' && (
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
                SHARED GROWING SETUP COMPONENTS
            ======================================= */}

            {category && (
              <RecipeComponentsSection
                ingredients={
                  ingredients
                }

                products={
                  products
                }

                growingSetups={
                  growingSetups
                }

                currentRecipeId={
                  recipeToEdit?.id
                }

                selectedIngredientIds={
                  selectedIngredientIds
                }

                setSelectedIngredientIds={
                  setSelectedIngredientIds
                }

                recipeComponents={
                  recipeComponents
                }

                setRecipeComponents={
                  setRecipeComponents
                }

                onCreateIngredient={
                  createIngredient
                }

                onAddProduct={
                  onAddProduct
                }
              />
            )}


            {/* =======================================
                PHOTOGRAPHS
            ======================================= */}

            <SprigPhotoPicker
              photoUrls={
                photoUrls
              }
              onChange={
                setPhotoUrls
              }
              title="Photographs"
              helperText="Tuck photographs of the recipe, ingredients, packaging or mixture into this page."
              addButtonText="Add photographs"
              photoAltPrefix="Growing Recipe photograph"
            />


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
                Leave it for now
              </button>

              <button
                type="submit"
                className="enter-button"
              >
                {isEditing
                  ? 'Save changes'
                  : 'Save this Growing Recipe'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}