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

  recipeToEdit?: GrowingSetup

  onAddRecipe: (
    recipe: GrowingSetup,
  ) => void

  onUpdateRecipe?: (
    recipe: GrowingSetup,
  ) => void

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
    label: 'Ground Type',
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
    {
      value: 'something-else',
      label: 'Something Else',
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
      value: 'container-mix',
      label: 'Container / Pot',
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
    {
      value: 'something-else',
      label: 'Something Else',
    },
  ]


/* =======================================
   LABEL HELPERS
======================================= */

function findOptionLabel(
  options: PickerOption[],
  value?: string | null,
): string {
  if (!value) {
    return ''
  }

  return (
    options.find(
      (option) =>
        option.value === value,
    )?.label ??
    ''
  )
}


/* =======================================
   ADD / EDIT GROWING SETUP
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


  /* =======================================
     COMPONENT RELATIONSHIPS
  ======================================= */

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
     GROUND TYPE
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
    groundTypeName,
    setGroundTypeName,
  ] =
    useState(
      recipeToEdit?.category ===
        'ground-type'
        ? recipeToEdit.name
        : '',
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
    growingSystemName,
    setGrowingSystemName,
  ] =
    useState(
      recipeToEdit?.category ===
        'growing-system'
        ? recipeToEdit.name
        : '',
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
     CREATE BOUGHT MIX PURCHASE
  ======================================= */

  function createBoughtMixPurchase(
    savedRecipe: GrowingSetup,
  ): PurchaseRecord | undefined {
    const trimmedPrice =
      pricePaid.trim()

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

        isFavourite:
          recipeToEdit
            ?.isFavourite,

        rating:
          recipeToEdit
            ?.rating,

        isArchived:
          recipeToEdit
            ?.isArchived,

        archivedAt:
          recipeToEdit
            ?.archivedAt,

        basedOnRecipeId:
          recipeToEdit
            ?.basedOnRecipeId,

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

        isFavourite:
          recipeToEdit
            ?.isFavourite,

        rating:
          recipeToEdit
            ?.rating,

        isArchived:
          recipeToEdit
            ?.isArchived,

        archivedAt:
          recipeToEdit
            ?.archivedAt,

        basedOnRecipeId:
          recipeToEdit
            ?.basedOnRecipeId,

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


    /* ---------- GROUND TYPE ---------- */

    if (
      category ===
      'ground-type'
    ) {
      if (!groundType) {
        return
      }

      const standardLabel =
        findOptionLabel(
          groundTypeOptions,
          groundType,
        )

      const trimmedName =
        groundTypeName.trim()

      const recipeName =
        trimmedName ||
        standardLabel ||
        recipeToEdit?.name ||
        'Ground Type'

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
          groundType as GrowingGroundType,

        ingredientIds:
          selectedIngredientIds,

        recipeComponents:
          recipeComponents,

        notes:
          groundTypeNotes
            .trim() ||
          undefined,

        photoUrls,

        isFavourite:
          recipeToEdit
            ?.isFavourite,

        rating:
          recipeToEdit
            ?.rating,

        isArchived:
          recipeToEdit
            ?.isArchived,

        archivedAt:
          recipeToEdit
            ?.archivedAt,

        basedOnRecipeId:
          recipeToEdit
            ?.basedOnRecipeId,

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

      const standardLabel =
        findOptionLabel(
          growingSystemOptions,
          growingSystemType,
        )

      const trimmedName =
        growingSystemName.trim()

      const recipeName =
        trimmedName ||
        standardLabel ||
        recipeToEdit?.name ||
        'Growing System'

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
          growingSystemType as GrowingGroundMethod,

        ingredientIds:
          selectedIngredientIds,

        recipeComponents:
          recipeComponents,

        notes:
          growingSystemNotes
            .trim() ||
          undefined,

        photoUrls,

        isFavourite:
          recipeToEdit
            ?.isFavourite,

        rating:
          recipeToEdit
            ?.rating,

        isArchived:
          recipeToEdit
            ?.isArchived,

        archivedAt:
          recipeToEdit
            ?.archivedAt,

        basedOnRecipeId:
          recipeToEdit
            ?.basedOnRecipeId,

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


    if (
      isEditing &&
      onUpdateRecipe
    ) {
      onUpdateRecipe(
        recipe,
      )


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


    onAddRecipe(
      recipe,
    )


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
                ? 'Edit What It Grows In'
                : 'Add What It Grows In'}
            </h2>

            <button
              type="button"
              className="close-button"
              onClick={
                onClose
              }
              aria-label={
                isEditing
                  ? 'Close editor'
                  : 'Close form'
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
              🌱 Remember what the plant
              actually grows in. Location
              belongs to Growing Places;
              recipes, bought mixes, ground
              and growing systems live here.
            </p>


            {/* =======================================
                CATEGORY
            ======================================= */}

            <section className="sprig-form-section">
              <SprigPicker
                title="What kind is it?"
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
                      Existing purchases stay
                      untouched. Fill in the
                      purchase fields only when
                      recording another purchase.
                    </p>
                  </section>
                )}
              </>
            )}


            {/* =======================================
                GROUND TYPE
            ======================================= */}

            {category ===
              'ground-type' && (
              <>
                <GroundTypeSection
                  groundType={
                    groundType
                  }
                  setGroundType={(
                    value,
                  ) => {
                    setGroundType(
                      value,
                    )

                    if (
                      value &&
                      value !==
                        'something-else'
                    ) {
                      setGroundTypeName(
                        findOptionLabel(
                          groundTypeOptions,
                          value,
                        ),
                      )
                    }

                    if (
                      value ===
                      'something-else'
                    ) {
                      setGroundTypeName(
                        '',
                      )
                    }
                  }}

                  groundTypeOptions={
                    groundTypeOptions
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


                {groundType ===
                  'something-else' && (
                  <section className="sprig-form-section">
                    <label>
                      What do you call this ground?

                      <input
                        type="text"
                        value={
                          groundTypeName
                        }
                        onChange={(
                          event,
                        ) =>
                          setGroundTypeName(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="e.g. Heavy clay by the west wall"
                      />
                    </label>

                    <p className="form-whisper">
                      This name belongs to the
                      saved Ground Type record.
                      It will be available
                      anywhere Sprig asks what
                      a plant grows in.
                    </p>
                  </section>
                )}
              </>
            )}


            {/* =======================================
                GROWING SYSTEM
            ======================================= */}

            {category ===
              'growing-system' && (
              <>
                <GrowingSystemSection
                  growingSystemType={
                    growingSystemType
                  }
                  setGrowingSystemType={(
                    value,
                  ) => {
                    setGrowingSystemType(
                      value,
                    )

                    if (
                      value &&
                      value !==
                        'something-else'
                    ) {
                      setGrowingSystemName(
                        findOptionLabel(
                          growingSystemOptions,
                          value,
                        ),
                      )
                    }

                    if (
                      value ===
                      'something-else'
                    ) {
                      setGrowingSystemName(
                        '',
                      )
                    }
                  }}

                  growingSystemOptions={
                    growingSystemOptions
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


                <section className="sprig-form-section">
                  <label>
                    Name this growing system

                    <input
                      type="text"
                      value={
                        growingSystemName
                      }
                      onChange={(
                        event,
                      ) =>
                        setGrowingSystemName(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="e.g. 43 L fabric grow bag"
                    />
                  </label>

                  <p className="form-whisper">
                    The system type tells Sprig
                    what kind of system it is.
                    The name lets you remember
                    the actual setup you used.
                  </p>
                </section>
              </>
            )}


            {/* =======================================
                COMPONENTS
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
              helperText="Tuck photographs of the recipe, mix, ground, system, packaging or ingredients into this record."
              addButtonText="Add photographs"
              photoAltPrefix="Growing setup photograph"
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
                  : 'Save this'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}