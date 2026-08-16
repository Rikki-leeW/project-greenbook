import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'

import SprigPhotoPicker from '../photos/SprigPhotoPicker'
import PurchaseDetailsSection from '../purchases/PurchaseDetailsSection'
import SprigPicker from '../sprig/SprigPicker'

import type {
  Ingredient,
  IngredientCategory,
  PurchaseRecord,
  PurchaseUnit,
} from '../../types'


interface AddIngredientFormProps {
  ingredientToEdit?: Ingredient

  onAddIngredient: (
    ingredient: Ingredient,
  ) => void

  onUpdateIngredient?: (
    ingredient: Ingredient,
  ) => void

  onAddPurchase?: (
    purchase: PurchaseRecord,
  ) => void

  onClose: () => void
}


interface PickerOption {
  value: string
  label: string
}


const CUSTOM_INGREDIENT_CATEGORIES_KEY =
  'sprig-custom-ingredient-categories'


const ingredientCategoryOptions:
  PickerOption[] = [
    {
      value: 'compost',
      label: 'Compost',
    },
    {
      value: 'manure',
      label: 'Manure',
    },
    {
      value: 'organic-matter',
      label: 'Organic Matter',
    },
    {
      value: 'minerals',
      label: 'Minerals',
    },
    {
      value: 'aeration',
      label: 'Aeration',
    },
    {
      value: 'water-retention',
      label: 'Water Retention',
    },
    {
      value: 'amendments',
      label: 'Amendments',
    },
    {
      value: 'fertiliser',
      label: 'Fertiliser',
    },
    {
      value: 'biological-additives',
      label: 'Biological Additives',
    },
    {
      value: 'ph-adjusters',
      label: 'pH Adjusters',
    },
    {
      value: 'structure-bulk',
      label: 'Structure / Bulk',
    },
    {
      value: 'growing-medium',
      label: 'Growing Medium',
    },
    {
      value: 'mulch',
      label: 'Mulch',
    },
    {
      value: 'other',
      label: 'Other',
    },
  ]


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
    safeName || 'ingredient'
  }-${Date.now()}`
}


/* =======================================
   PURCHASE ID
======================================= */

function createPurchaseId(
  ingredientId: string,
): string {
  return `purchase-${ingredientId}-${Date.now()}`
}


/* =======================================
   CUSTOM CATEGORY ID
======================================= */

function createCustomCategoryValue(
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

  return `custom:ingredient-category:${
    safeLabel || Date.now()
  }`
}


/* =======================================
   CUSTOM CATEGORY STORAGE
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
   INGREDIENT FORM
======================================= */

export default function AddIngredientForm({
  ingredientToEdit,
  onAddIngredient,
  onUpdateIngredient,
  onAddPurchase,
  onClose,
}: AddIngredientFormProps) {
  const now =
    new Date().toISOString()

  const today =
    now.slice(
      0,
      10,
    )

  const isEditing =
    Boolean(
      ingredientToEdit,
    )


  /* =======================================
     CUSTOM CATEGORIES
  ======================================= */

  const [
    customCategoryOptions,
    setCustomCategoryOptions,
  ] =
    useState<PickerOption[]>(
      () =>
        loadCustomOptions(
          CUSTOM_INGREDIENT_CATEGORIES_KEY,
        ),
    )


  const initialCustomCategoryOption =
    ingredientToEdit
      ?.customCategoryLabel
      ? {
          value:
            createCustomCategoryValue(
              ingredientToEdit
                .customCategoryLabel,
            ),

          label:
            ingredientToEdit
              .customCategoryLabel,
        }
      : undefined


  const initialCategoryValue =
    initialCustomCategoryOption
      ? initialCustomCategoryOption
          .value
      : ingredientToEdit
          ?.category ??
        null


  const [
    customCategoryName,
    setCustomCategoryName,
  ] =
    useState('')


  /* =======================================
     INGREDIENT DETAILS
  ======================================= */

  const [
    name,
    setName,
  ] =
    useState(
      ingredientToEdit?.name ??
        '',
    )


  const [
    category,
    setCategory,
  ] =
    useState<string | null>(
      initialCategoryValue,
    )


  const [
    manufacturer,
    setManufacturer,
  ] =
    useState(
      ingredientToEdit
        ?.manufacturer ??
        '',
    )


  const [
    source,
    setSource,
  ] =
    useState(
      ingredientToEdit
        ?.source ??
        '',
    )


  const [
    notes,
    setNotes,
  ] =
    useState(
      ingredientToEdit
        ?.notes ??
        '',
    )


  const [
    addedDate,
    setAddedDate,
  ] =
    useState(
      ingredientToEdit?.createdAt
        ? ingredientToEdit
            .createdAt
            .slice(
              0,
              10,
            )
        : today,
    )


  /* =======================================
     PURCHASE DETAILS
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
     PHOTOGRAPHS
  ======================================= */

  /*
   * MultiPhotoField owns the photograph
   * preparation controls.
   *
   * This form only owns the resulting
   * photoUrls array that will be saved
   * into the Ingredient record.
   */

  const [
    photoUrls,
    setPhotoUrls,
  ] =
    useState<string[]>(
      ingredientToEdit
        ?.photoUrls ??
        [],
    )


  /* =======================================
     CATEGORY OPTIONS
  ======================================= */

  const customOptionsIncludingEdited =
    initialCustomCategoryOption &&
    !customCategoryOptions.some(
      (option) =>
        option.label
          .trim()
          .toLowerCase() ===
        initialCustomCategoryOption
          .label
          .trim()
          .toLowerCase(),
    )
      ? [
          ...customCategoryOptions,
          initialCustomCategoryOption,
        ]
      : customCategoryOptions


  const allCategoryOptions = [
    ...ingredientCategoryOptions,
    ...customOptionsIncludingEdited,
  ]


  /* =======================================
     FORM REF / PAGE LOCK
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
     CREATE CUSTOM CATEGORY
  ======================================= */

  function handleCreateCustomCategory() {
    const trimmed =
      customCategoryName.trim()

    if (!trimmed) {
      return
    }

    const existing =
      allCategoryOptions.find(
        (option) =>
          option.label
            .trim()
            .toLowerCase() ===
          trimmed.toLowerCase(),
      )

    if (existing) {
      setCategory(
        existing.value,
      )

      setCustomCategoryName(
        '',
      )

      return
    }

    const newOption:
      PickerOption = {
        value:
          createCustomCategoryValue(
            trimmed,
          ),

        label:
          trimmed,
      }

    const updatedOptions = [
      ...customCategoryOptions,
      newOption,
    ]

    setCustomCategoryOptions(
      updatedOptions,
    )

    saveCustomOptions(
      CUSTOM_INGREDIENT_CATEGORIES_KEY,
      updatedOptions,
    )

    setCategory(
      newOption.value,
    )

    setCustomCategoryName(
      '',
    )
  }


  /* =======================================
     CREATE PURCHASE RECORD
  ======================================= */

  function createPurchaseRecord(
    savedIngredient: Ingredient,
  ): PurchaseRecord | undefined {
    const numericPrice =
      Number(
        pricePaid,
      )

    /*
     * Purchase details are optional.
     *
     * Sprig only creates a Purchase record
     * when an actual price has been entered.
     */

    if (
      !pricePaid.trim() ||
      !Number.isFinite(
        numericPrice,
      )
    ) {
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
          savedIngredient.id,
        ),

      itemType:
        'ingredient',

      itemId:
        savedIngredient.id,

      itemName:
        savedIngredient.name,

      date:
        purchaseDate ||
        today,

      supplier:
        supplier.trim() ||
        undefined,

      brand:
        savedIngredient
          .manufacturer,

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
        purchaseUnit,

      packageSize:
        numericPackageSize !==
          undefined &&
        Number.isFinite(
          numericPackageSize,
        )
          ? numericPackageSize
          : undefined,

      packageUnit,

      notes:
        purchaseNotes
          .trim() ||
        undefined,

      createdAt:
        today,
    }
  }


  /* =======================================
     SAVE INGREDIENT
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


    const selectedCategoryOption =
      category
        ? allCategoryOptions.find(
            (option) =>
              option.value ===
              category,
          )
        : undefined


    const isCustomCategory =
      Boolean(
        category?.startsWith(
          'custom:',
        ),
      )


    const resolvedCategory:
      IngredientCategory | undefined =
      isCustomCategory
        ? 'other'
        : (
            category as
              | IngredientCategory
              | null
          ) ??
          undefined


    const resolvedCustomCategoryLabel =
      isCustomCategory
        ? selectedCategoryOption
            ?.label
        : undefined


    /*
     * Preserve lifecycle fields when an
     * existing Ingredient is edited.
     *
     * These fields are managed elsewhere
     * by the Library lifecycle controls,
     * not by this form.
     */

    const ingredient:
      Ingredient = {
        id:
          ingredientToEdit
            ?.id ??
          createIngredientId(
            trimmedName,
          ),

        name:
          trimmedName,

        category:
          resolvedCategory,

        customCategoryLabel:
          resolvedCustomCategoryLabel,

        manufacturer:
          manufacturer
            .trim() ||
          undefined,

        source:
          source.trim() ||
          undefined,

        notes:
          notes.trim() ||
          undefined,

        photoUrls,

        isFavourite:
          ingredientToEdit
            ?.isFavourite,

        rating:
          ingredientToEdit
            ?.rating,

        isArchived:
          ingredientToEdit
            ?.isArchived,

        archivedAt:
          ingredientToEdit
            ?.archivedAt,

        createdAt:
          ingredientToEdit
            ?.createdAt ??
          addedDate,

        updatedAt:
          isEditing
            ? now
            : undefined,
      }


    /*
     * Editing an Ingredient changes only
     * the Ingredient record.
     *
     * Purchase history remains independent
     * and will be edited from the Ingredient
     * detail page, just like Products.
     */

    if (
      isEditing &&
      onUpdateIngredient
    ) {
      onUpdateIngredient(
        ingredient,
      )

      return
    }


    /*
     * A new Ingredient is saved first.
     */

    onAddIngredient(
      ingredient,
    )


    /*
     * If purchase information was supplied,
     * save its first independent Purchase.
     */

    const purchase =
      createPurchaseRecord(
        ingredient,
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


  return (
    <div
      className="form-backdrop"
      role="presentation"
    >
      <section
        className="add-plant-panel chronicle-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-ingredient-title"
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
            <h2 id="add-ingredient-title">
              {isEditing
                ? 'Edit Ingredient'
                : 'Add an Ingredient'}
            </h2>

            <button
              type="button"
              className="close-button"
              onClick={
                onClose
              }
              aria-label={
                isEditing
                  ? 'Close Ingredient editor'
                  : 'Close Ingredient form'
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
              🌿 Keep the useful things
              that become part of your
              garden close at hand.
            </p>


            {/* =======================================
                NAME
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                What do you call this ingredient?

                <input
                  type="text"
                  value={
                    name
                  }
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Homemade Compost"
                  required
                />
              </label>
            </section>


            {/* =======================================
                CATEGORY
            ======================================= */}

            <section className="sprig-form-section">
              <SprigPicker
                title="What kind of ingredient is it?"
                variant="label"
                showTrigger={
                  false
                }
                options={
                  allCategoryOptions
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
                    value,
                  )
                }}
              />


              <div className="sprig-ingredient-add">
                <input
                  type="text"
                  value={
                    customCategoryName
                  }
                  onChange={(
                    event,
                  ) =>
                    setCustomCategoryName(
                      event.target.value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                      'Enter'
                    ) {
                      event.preventDefault()

                      handleCreateCustomCategory()
                    }
                  }}
                  placeholder="Add your own category..."
                />

                <button
                  type="button"
                  onClick={
                    handleCreateCustomCategory
                  }
                >
                  + Add category
                </button>
              </div>

              <p className="form-whisper">
                Sprig&apos;s categories are
                suggestions, not rules. Add
                your own whenever the garden
                refuses to fit neatly on the
                shelf.
              </p>
            </section>


            {/* =======================================
                SOURCE
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                Where did it come from?

                <input
                  type="text"
                  value={
                    source
                  }
                  onChange={(event) =>
                    setSource(
                      event.target.value,
                    )
                  }
                  placeholder="Homemade, local stable, Bunnings..."
                />
              </label>
            </section>


            {/* =======================================
                MANUFACTURER
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                Maker or manufacturer

                <input
                  type="text"
                  value={
                    manufacturer
                  }
                  onChange={(event) =>
                    setManufacturer(
                      event.target.value,
                    )
                  }
                  placeholder="Optional"
                />
              </label>
            </section>


            {/* =======================================
                DATE
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                When did you add this to Sprig?

                <input
                  type="date"
                  value={
                    addedDate
                  }
                  onChange={(event) =>
                    setAddedDate(
                      event.target.value,
                    )
                  }
                />
              </label>
            </section>


            {/* =======================================
                PURCHASE DETAILS
            ======================================= */}

            {!isEditing && (
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
            )}


            {/* =======================================
                NOTES
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                What should Sprig remember?

                <textarea
                  value={
                    notes
                  }
                  onChange={(event) =>
                    setNotes(
                      event.target.value,
                    )
                  }
                  placeholder="Where it came from, what it is like, how you use it, or anything worth remembering..."
                  rows={
                    4
                  }
                />
              </label>
            </section>


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
  helperText="Tuck photographs of the ingredient, packaging, texture or condition into this page."
  addButtonText="Add Ingredient photographs"
  photoAltPrefix="Ingredient photograph"
  maxPhotos={
    12
  }
/>


            {/* =======================================
                PURCHASE HISTORY NOTE
            ======================================= */}

            {isEditing && (
              <section className="sprig-form-section">
                <p className="section-label">
                  Purchase history
                </p>

                <h3>
                  Purchases stay with their history
                </h3>

                <p className="form-whisper">
                  Editing this Ingredient
                  changes the Ingredient itself.
                  Existing prices and later
                  purchases are kept separately
                  in its Purchase history.
                </p>
              </section>
            )}


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
                  : 'Add this Ingredient'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}