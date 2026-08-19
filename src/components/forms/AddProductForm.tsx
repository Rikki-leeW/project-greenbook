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
  GardenProduct,
  GardenProductCategory,
  PurchaseRecord,
  PurchaseUnit,
} from '../../types'


type ProductEditorMode =
  | 'new'
  | 'edit'
  | 'variation'


  interface AddProductFormProps {
    product?: GardenProduct | null
  
    mode?: ProductEditorMode
  
    initialPurchase?: PurchaseRecord | null
  
    onSave: (
      product: GardenProduct,
      purchase?: PurchaseRecord,
    ) => void
  
    onClose: () => void
  }



type RecordRating =
  | 1
  | 2
  | 3
  | 4
  | 5


interface ProductCategoryOption {
  value: GardenProductCategory
  label: string
  subtitle?: string
}


const PRODUCT_CATEGORY_OPTIONS:
  ProductCategoryOption[] = [
    {
      value: 'fertiliser',
      label: 'Fertiliser',
      subtitle:
        'Liquid, granular or slow-release plant food',
    },
    {
      value: 'soil-conditioner',
      label: 'Soil Conditioner',
      subtitle:
        'Products used to improve soil condition',
    },
    {
      value: 'wetting-agent',
      label: 'Wetting Agent',
      subtitle:
        'Products that help soil absorb and retain water',
    },
    {
      value: 'pest-treatment',
      label: 'Pest Treatment',
      subtitle:
        'Products used against garden pests',
    },
    {
      value: 'disease-treatment',
      label: 'Disease Treatment',
      subtitle:
        'Products used for plant disease or fungal problems',
    },
    {
      value: 'weed-treatment',
      label: 'Weed Treatment',
      subtitle:
        'Products used to manage unwanted plants',
    },
    {
      value: 'biological-treatment',
      label: 'Biological Treatment',
      subtitle:
        'Living or biologically based garden treatments',
    },
    {
      value: 'root-treatment',
      label: 'Root Treatment',
      subtitle:
        'Products intended for roots and establishment',
    },
    {
      value: 'plant-tonic',
      label: 'Plant Tonic',
      subtitle:
        'Seaweed, tonics and general plant support',
    },
    {
      value: 'growing-medium',
      label: 'Growing Medium',
      subtitle:
        'Commercial media used for growing plants',
    },
    {
      value: 'mulch',
      label: 'Mulch',
      subtitle:
        'Commercial mulches and surface coverings',
    },
    {
      value: 'seed-treatment',
      label: 'Seed Treatment',
      subtitle:
        'Products used with seeds or germination',
    },
    {
      value: 'cleaning-product',
      label: 'Cleaning Product',
      subtitle:
        'Products used to clean garden equipment or spaces',
    },
    {
      value: 'other',
      label: 'Other',
      subtitle:
        'Something that belongs on its own little shelf',
    },
  ]


/* =======================================
   PRODUCT ID
======================================= */

function createProductId(
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

  return `product-${
    safeName ||
    'garden-product'
  }-${Date.now()}`
}


/* =======================================
   PURCHASE ID
======================================= */

function createPurchaseId(
  productId: string,
): string {
  return `purchase-${productId}-${Date.now()}`
}


/* =======================================
   TODAY
======================================= */

function getTodayDate(): string {
  return new Date()
    .toISOString()
    .slice(
      0,
      10,
    )
}


/* =======================================
   RATING
======================================= */

function clampRating(
  rating: number,
): RecordRating {
  return Math.max(
    1,
    Math.min(
      5,
      rating,
    ),
  ) as RecordRating
}


export default function AddProductForm({
  product,
  mode = 'new',
  initialPurchase = null,
  onSave,
  onClose,
}: AddProductFormProps) {
  const isEditing =
    mode ===
    'edit'

  const isVariation =
    mode ===
    'variation'

  const shouldShowPurchaseDetails =
    mode ===
      'new' ||
    mode ===
      'variation'

  const today =
    getTodayDate()


  /* =======================================
     PRODUCT STATE
  ======================================= */

  const [
    name,
    setName,
  ] =
    useState(
      product?.name ??
      '',
    )


  const [
    category,
    setCategory,
  ] =
    useState<GardenProductCategory>(
      product?.category ??
        'fertiliser',
    )


  const [
    customCategoryLabel,
    setCustomCategoryLabel,
  ] =
    useState(
      product?.customCategoryLabel ??
        '',
    )


  const [
    brand,
    setBrand,
  ] =
    useState(
      product?.brand ??
      '',
    )


  const [
    productName,
    setProductName,
  ] =
    useState(
      product?.productName ??
      '',
    )


  const [
    notes,
    setNotes,
  ] =
    useState(
      product?.notes ??
      '',
    )


  const [
    photoUrls,
    setPhotoUrls,
  ] =
    useState<string[]>(
      isVariation
        ? []
        : product?.photoUrls ??
          [],
    )


  const [
    isFavourite,
    setIsFavourite,
  ] =
    useState(
      isVariation
        ? false
        : product?.isFavourite ??
          false,
    )


  const [
    rating,
    setRating,
  ] =
    useState<
      RecordRating |
      undefined
    >(
      isVariation
        ? undefined
        : product?.rating,
    )


    /* =======================================
     PURCHASE STATE
  ======================================= */

  const [
    supplier,
    setSupplier,
  ] =
    useState(
      initialPurchase?.supplier ??
        '',
    )


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
    useState(
      initialPurchase?.pricePaid !==
        undefined
        ? String(
            initialPurchase.pricePaid,
          )
        : '',
    )


  const [
    quantity,
    setQuantity,
  ] =
    useState(
      initialPurchase?.quantity !==
        undefined
        ? String(
            initialPurchase.quantity,
          )
        : '1',
    )


  const [
    unit,
    setUnit,
  ] =
    useState<PurchaseUnit>(
      initialPurchase?.unit ??
        'each',
    )


  const [
    packageSize,
    setPackageSize,
  ] =
    useState(
      initialPurchase?.packageSize !==
        undefined
        ? String(
            initialPurchase.packageSize,
          )
        : '',
    )


  const [
    packageUnit,
    setPackageUnit,
  ] =
    useState<PurchaseUnit>(
      initialPurchase?.packageUnit ??
        'litre',
    )


  const [
    purchaseNotes,
    setPurchaseNotes,
  ] =
    useState(
      initialPurchase?.notes ??
        '',
    )


  /* =======================================
     FORM REF
  ======================================= */

  const formRef =
    useRef<HTMLFormElement>(
      null,
    )


  /* =======================================
     KEEP EDITOR IN SYNC
  ======================================= */

  useEffect(
    () => {
      setName(
        product?.name ??
          '',
      )


      setCategory(
        product?.category ??
          'fertiliser',
      )


      setCustomCategoryLabel(
        product?.customCategoryLabel ??
          '',
      )


      setBrand(
        product?.brand ??
          '',
      )


      setProductName(
        product?.productName ??
          '',
      )


      setNotes(
        product?.notes ??
          '',
      )


      /*
       * A Product variation is a new,
       * independent Product record.
       *
       * Its descriptive details may begin
       * from the source Product, but its
       * photographs belong to the new
       * variation itself.
       */

      setPhotoUrls(
        mode ===
          'variation'
          ? []
          : product?.photoUrls ??
            [],
      )


      setIsFavourite(
        mode ===
          'variation'
          ? false
          : product?.isFavourite ??
            false,
      )


      setRating(
        mode ===
          'variation'
          ? undefined
          : product?.rating,
      )


            /*
       * A brand-new Product starts with
       * fresh purchase fields.
       *
       * A Product variation may borrow the
       * latest purchase as a convenient
       * starting point, but the date becomes
       * today because saving it will create
       * a brand-new Purchase record.
       */

            if (
              mode === 'new'
            ) {
              setSupplier(
                '',
              )
      
              setPurchaseDate(
                getTodayDate(),
              )
      
              setPricePaid(
                '',
              )
      
              setQuantity(
                '1',
              )
      
              setUnit(
                'each',
              )
      
              setPackageSize(
                '',
              )
      
              setPackageUnit(
                'litre',
              )
      
              setPurchaseNotes(
                '',
              )
            }
      
      
            if (
              mode === 'variation'
            ) {
              setSupplier(
                initialPurchase?.supplier ??
                  '',
              )
      
              setPurchaseDate(
                getTodayDate(),
              )
      
              setPricePaid(
                initialPurchase?.pricePaid !==
                  undefined
                  ? String(
                      initialPurchase.pricePaid,
                    )
                  : '',
              )
      
              setQuantity(
                initialPurchase?.quantity !==
                  undefined
                  ? String(
                      initialPurchase.quantity,
                    )
                  : '1',
              )
      
              setUnit(
                initialPurchase?.unit ??
                  'each',
              )
      
              setPackageSize(
                initialPurchase?.packageSize !==
                  undefined
                  ? String(
                      initialPurchase.packageSize,
                    )
                  : '',
              )
      
              setPackageUnit(
                initialPurchase?.packageUnit ??
                  'litre',
              )
      
              setPurchaseNotes(
                '',
              )
            }
    },
    [
      product,
      mode,
    ],
  )


  /* =======================================
     PAGE LOCK
  ======================================= */

  useEffect(() => {
    const scrollY =
      window.scrollY


    requestAnimationFrame(
      () => {
        if (
          formRef.current
        ) {
          formRef.current.scrollTop =
            0
        }
      },
    )


    const previousOverflow =
      document.body.style.overflow


    const previousPosition =
      document.body.style.position


    const previousTop =
      document.body.style.top


    const previousWidth =
      document.body.style.width


    document.body.style.overflow =
      'hidden'


    document.body.style.position =
      'fixed'


    document.body.style.top =
      `-${scrollY}px`


    document.body.style.width =
      '100%'


    return () => {
      document.body.style.overflow =
        previousOverflow


      document.body.style.position =
        previousPosition


      document.body.style.top =
        previousTop


      document.body.style.width =
        previousWidth


      window.scrollTo(
        0,
        scrollY,
      )
    }
  }, [])


  /* =======================================
     CATEGORY PICKER
  ======================================= */

  const categoryOptions =
    PRODUCT_CATEGORY_OPTIONS.map(
      (
        option,
      ) => ({
        value:
          option.value,

        label:
          option.label,

        subtitle:
          option.subtitle,
      }),
    )


  function handleToggleCategory(
    value: string,
  ) {
    const selectedCategory =
      value as GardenProductCategory


    setCategory(
      selectedCategory,
    )


    if (
      selectedCategory !==
      'other'
    ) {
      setCustomCategoryLabel(
        '',
      )
    }
  }


  function handleCreateCategory(
    label: string,
  ): string | undefined {
    const trimmedLabel =
      label.trim()


    if (
      !trimmedLabel
    ) {
      return undefined
    }


    setCategory(
      'other',
    )


    setCustomCategoryLabel(
      trimmedLabel,
    )


    return 'other'
  }


  /* =======================================
     RATING
  ======================================= */

  function handleRating(
    nextRating: number,
  ) {
    const safeRating =
      clampRating(
        nextRating,
      )


    if (
      rating ===
      safeRating
    ) {
      setRating(
        undefined,
      )

      return
    }


    setRating(
      safeRating,
    )
  }


  /* =======================================
     PURCHASE
  ======================================= */

  function createPurchaseRecord(
    savedProduct: GardenProduct,
  ): PurchaseRecord | undefined {
    const numericPrice =
      Number(
        pricePaid,
      )


    /*
     * A Purchase is only created when
     * the gardener has actually entered
     * a price.
     *
     * This keeps the section optional.
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
      quantity.trim()
        ? Number(
            quantity,
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
          savedProduct.id,
        ),

      itemType:
        'product',

      itemId:
        savedProduct.id,

      itemName:
        savedProduct.name,

      date:
        purchaseDate ||
        today,

      supplier:
        supplier.trim() ||
        undefined,

      brand:
        savedProduct.brand,

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

      unit,

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
        purchaseNotes.trim() ||
        undefined,

      createdAt:
        today,
    }
  }


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


    if (
      !trimmedName
    ) {
      return
    }


    /*
     * Existing Products keep their ID.
     *
     * A variation already arrives from
     * AppLibrary with its own newly-created
     * Product ID, so preserve that ID.
     *
     * A completely new Product creates its
     * ID here when it is saved.
     */

    const savedProductId =
      isEditing &&
      product
        ? product.id
        : isVariation &&
          product
          ? product.id
          : createProductId(
              trimmedName,
            )


    const savedProduct:
      GardenProduct = {
        id:
          savedProductId,

        name:
          trimmedName,

        category,

        customCategoryLabel:
          category ===
          'other'
            ? (
                customCategoryLabel
                  .trim() ||
                undefined
              )
            : undefined,

        brand:
          brand.trim() ||
          undefined,

        productName:
          productName.trim() ||
          undefined,

        notes:
          notes.trim() ||
          undefined,

        photoUrls,

        isFavourite,

        rating,

        isArchived:
          isEditing
            ? product?.isArchived ??
              false
            : false,

        archivedAt:
          isEditing
            ? product?.archivedAt
            : undefined,

        createdAt:
          isEditing
            ? product?.createdAt ??
              today
            : product?.createdAt ??
              today,

        updatedAt:
          isEditing
            ? today
            : undefined,
      }


    /*
     * Editing an existing Product does not
     * create a new historical Purchase.
     *
     * New Products and variations may create
     * their first Purchase at the same time.
     */

    const purchase =
      shouldShowPurchaseDetails
        ? createPurchaseRecord(
            savedProduct,
          )
        : undefined


    onSave(
      savedProduct,
      purchase,
    )
  }


  /* =======================================
     HEADING
  ======================================= */

  function getHeading(): string {
    if (
      mode === 'variation'
    ) {
      return 'Create a Product Variation'
    }


    if (
      mode === 'edit'
    ) {
      return 'Edit Product'
    }


    return 'Add a Product'
  }


  /* =======================================
     SAVE BUTTON
  ======================================= */

  function getSaveButtonLabel(): string {
    if (
      mode === 'variation'
    ) {
      return 'Add this variation'
    }


    if (
      mode === 'edit'
    ) {
      return 'Save Product'
    }


    return 'Add this Product'
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
        aria-labelledby="add-product-title"
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
            <h2 id="add-product-title">
              {getHeading()}
            </h2>


            <button
              type="button"
              className="close-button"
              onClick={
                onClose
              }
              aria-label="Close Product form"
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
              🌿 Keep the things bought for
              the garden somewhere Sprig
              can remember them.
            </p>


            {/* =======================================
                PRODUCT NAME
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                What do you call this Product?

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
                  placeholder="PowerFeed, Seasol, Eco-Neem..."
                  required
                />
              </label>
            </section>


            {/* =======================================
                CATEGORY
            ======================================= */}

            <section className="sprig-form-section">
              <SprigPicker
                title="What sort of Product is it?"
                variant="label-tall"
                emptySummary="Choose a Product type"
                options={
                  categoryOptions
                }
                selectedValues={[
                  category,
                ]}
                isOpen={
                  true
                }
                showTrigger={
                  false
                }
                onToggleOpen={() => {}}
                onToggleValue={
                  handleToggleCategory
                }
                allowCustomOption
                customOptionLabel="Create another Product type..."
                customInputLabel="What would you like to call this Product type?"
                customInputPlaceholder="My own garden treatment..."
                onCreateCustomOption={
                  handleCreateCategory
                }
              />


              {category ===
                'other' &&
                customCategoryLabel && (
                  <p className="form-whisper">
                    Sprig will remember this
                    as:{' '}

                    <strong>
                      {
                        customCategoryLabel
                      }
                    </strong>
                  </p>
                )}
            </section>


            {/* =======================================
                BRAND + EXACT PRODUCT NAME
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                Who makes it?

                <input
                  type="text"
                  value={
                    brand
                  }
                  onChange={(
                    event,
                  ) =>
                    setBrand(
                      event.target.value,
                    )
                  }
                  placeholder="Seasol, Yates, Richgro..."
                />
              </label>


              <label>
                Exact Product name

                <input
                  type="text"
                  value={
                    productName
                  }
                  onChange={(
                    event,
                  ) =>
                    setProductName(
                      event.target.value,
                    )
                  }
                  placeholder="The full name written on the package"
                />
              </label>


              <p className="form-whisper">
                Your Sprig name can stay short
                and familiar while the full
                commercial name is remembered
                here.
              </p>
            </section>


            {/* =======================================
                PURCHASE DETAILS
            ======================================= */}

            {shouldShowPurchaseDetails && (
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
                  quantity
                }

                setQuantity={
                  setQuantity
                }

                unit={
                  unit
                }

                setUnit={
                  setUnit
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
                FAVOURITE
            ======================================= */}

            <section className="sprig-form-section">
              <p className="section-label">
                Keep close
              </p>


              <h3>
                Is this a favourite?
              </h3>


              <button
                type="button"
                className={
                  isFavourite
                    ? 'sprig-selection-card selected'
                    : 'sprig-selection-card'
                }
                onClick={() =>
                  setIsFavourite(
                    (
                      current,
                    ) =>
                      !current,
                  )
                }
                aria-pressed={
                  isFavourite
                }
              >
                <span>
                  {isFavourite
                    ? '★ Garden favourite'
                    : '☆ Mark as a favourite'}
                </span>
              </button>


              <p className="form-whisper">
                Favourite Products can later
                stay close at hand on
                Sprig&apos;s shelves.
              </p>
            </section>


            {/* =======================================
                RATING
            ======================================= */}

            <section className="sprig-form-section">
              <p className="section-label">
                Your experience
              </p>


              <h3>
                How would you rate it?
              </h3>


              <div
                className="sprig-rating"
                aria-label="Product rating"
              >
                {[
                  1,
                  2,
                  3,
                  4,
                  5,
                ].map(
                  (
                    value,
                  ) => (
                    <button
                      key={
                        value
                      }
                      type="button"
                      className="sprig-rating-button"
                      onClick={() =>
                        handleRating(
                          value,
                        )
                      }
                      aria-label={`Rate ${value} out of 5`}
                      aria-pressed={
                        rating ===
                        value
                      }
                    >
                      {rating &&
                      value <=
                        rating
                        ? '★'
                        : '☆'}
                    </button>
                  ),
                )}
              </div>


              <p className="form-whisper">
                {rating
                  ? `${rating} out of 5`
                  : 'Leave this unrated until you know it better.'}
              </p>
            </section>


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
                  onChange={(
                    event,
                  ) =>
                    setNotes(
                      event.target.value,
                    )
                  }
                  placeholder="Dilution, how you use it, what responded well, things worth remembering..."
                  rows={
                    5
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

              helperText="Tuck photographs of the package, label, instructions or anything else worth keeping with this Product into this page."

              addButtonText="Add Product photographs"

              photoAltPrefix="Product photograph"

              maxPhotos={
                12
              }
            />


            {/* =======================================
                ARCHIVE NOTICE
            ======================================= */}

            {product?.isArchived &&
              isEditing && (
                <section className="sprig-form-section">
                  <p className="section-label">
                    Sprig&apos;s history
                  </p>


                  <h3>
                    This Product is archived
                  </h3>


                  <p className="form-whisper">
                    Editing its details will not
                    restore it to the active shelf.
                    Use Restore Product from its
                    record when you want to bring
                    it back.
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
                {getSaveButtonLabel()}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}