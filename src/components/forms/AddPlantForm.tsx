import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'

import AddGrowingPlaceForm from './AddGrowingPlaceForm'
import AddRecipeForm from './AddRecipeForm'

import SprigPicker from '../sprig/SprigPicker'
import SprigPhotoPicker from '../photos/SprigPhotoPicker'

import type {
  GrowingPlace,
  GrowingSetup,
  Ingredient,
  PlantOriginType,
  PlantStory,
  StartMethod,
} from '../../types'


interface AddPlantFormProps {
  GrowingPlaces: GrowingPlace[]

  GrowingSetups: GrowingSetup[]

  Ingredients: Ingredient[]

  /*
   * Normal create mode.
   */
  onAddPlant: (
    plant: PlantStory,
  ) => void

  /*
   * Edit mode.
   */
  onUpdatePlant?: (
    plant: PlantStory,
  ) => void

  /*
   * Supplying this turns the form into
   * Edit Plant Story.
   */
  plantToEdit?: PlantStory

  /*
   * Supplying this creates a brand-new
   * Plant Story prefilled from another.
   */
  variationFrom?: PlantStory

  onAddGrowingPlace: (
    place: GrowingPlace,
    setup?: GrowingSetup,
  ) => void

  onAddRecipe: (
    recipe: GrowingSetup,
  ) => void

  onAddIngredient: (
    ingredient: Ingredient,
  ) => void

  onClose: () => void
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
   GROWING RECIPE LABEL
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
      return 'Native Ground'

    case 'growing-system':
      return 'Growing System'

    default:
      return 'Garden Recipe'
  }
}


/* =======================================
   PLANT ORIGIN LABEL
======================================= */

function getPlantOriginLabel(
  originType: PlantOriginType,
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
   ADD / EDIT PLANT
======================================= */

export default function AddPlantForm({
  GrowingPlaces,
  GrowingSetups,
  Ingredients,
  onAddPlant,
  onUpdatePlant,
  plantToEdit,
  variationFrom,
  onAddGrowingPlace,
  onAddRecipe,
  onAddIngredient,
  onClose,
}: AddPlantFormProps) {
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


  const isEditing =
    Boolean(
      plantToEdit,
    )


  const isVariation =
    Boolean(
      variationFrom,
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
        '',
    )


  const [
    variety,
    setVariety,
  ] =
    useState(
      sourcePlant?.variety ??
        '',
    )


  const [
    quantity,
    setQuantity,
  ] =
    useState(
      String(
        sourcePlant?.quantity ??
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
        'seedling',
    )


  const [
    customStartMethodLabel,
    setCustomStartMethodLabel,
  ] =
    useState(
      sourcePlant
        ?.customStartMethodLabel ??
        '',
    )


  const [
    startedDate,
    setStartedDate,
  ] =
    useState(
      sourcePlant?.plantedDate ??
        today,
    )


  const [
    hasBeenPlantedOut,
    setHasBeenPlantedOut,
  ] =
    useState(
      Boolean(
        sourcePlant
          ?.plantedOutDate,
      ),
    )


  const [
    plantedOutDate,
    setPlantedOutDate,
  ] =
    useState(
      sourcePlant
        ?.plantedOutDate ??
        '',
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
    useState(false)


  const [
    currentGrowingPlaceId,
    setCurrentGrowingPlaceId,
  ] =
    useState(
      sourcePlant
        ?.currentGrowingPlaceId ??
        '',
    )


  const [
    isGrowingPlacePickerOpen,
    setIsGrowingPlacePickerOpen,
  ] =
    useState(false)


  /* =======================================
     GROWING RECIPE
  ======================================= */

  const [
    currentGrowingSetupId,
    setCurrentGrowingSetupId,
  ] =
    useState(
      sourcePlant
        ?.currentGrowingSetupId ??
        '',
    )


  const [
    isGrowingSetupPickerOpen,
    setIsGrowingSetupPickerOpen,
  ] =
    useState(false)


  const [
    isAddRecipeOpen,
    setIsAddRecipeOpen,
  ] =
    useState(false)


  /* =======================================
     HARVEST EXPECTATION
  ======================================= */

  const [
    expectedHarvestDaysMin,
    setExpectedHarvestDaysMin,
  ] =
    useState(
      sourcePlant
        ?.expectedHarvestDaysMin !==
      undefined
        ? String(
            sourcePlant
              .expectedHarvestDaysMin,
          )
        : '',
    )


  const [
    expectedHarvestDaysMax,
    setExpectedHarvestDaysMax,
  ] =
    useState(
      sourcePlant
        ?.expectedHarvestDaysMax !==
      undefined
        ? String(
            sourcePlant
              .expectedHarvestDaysMax,
          )
        : '',
    )


  /* =======================================
     NOTES
  ======================================= */

  const [
    notes,
    setNotes,
  ] =
    useState(
      sourcePlant?.notes ??
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
      [
        ...(
          sourcePlant
            ?.photoUrls ??
          []
        ),
      ],
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


    if (!trimmedPlantName) {
      return
    }


    const displayName =
      trimmedVariety ||
      trimmedPlantName


    const minimumHarvestDays =
      expectedHarvestDaysMin
        ? Number(
            expectedHarvestDaysMin,
          )
        : undefined


    const maximumHarvestDays =
      expectedHarvestDaysMax
        ? Number(
            expectedHarvestDaysMax,
          )
        : undefined


    const savedPlant:
      PlantStory = {
        id:
          isEditing &&
          plantToEdit
            ? plantToEdit.id
            : createPlantId(
                displayName,
              ),

        plantName:
          trimmedPlantName,

        variety:
          trimmedVariety ||
          undefined,

        displayName,

        personality:
          isEditing
            ? plantToEdit
                ?.personality
            : 'A story just beginning',

        basedOnPlantStoryId:
          isVariation
            ? variationFrom?.id
            : plantToEdit
                ?.basedOnPlantStoryId,

        quantity:
          Math.max(
            1,
            Number(
              quantity,
            ) || 1,
          ),

        startMethod,

        customStartMethodLabel:
          startMethod ===
            'other'
            ? trimmedCustomStartMethodLabel ||
              undefined
            : undefined,

        plantedDate:
          startedDate,

        sownDate:
          beganFromSeed
            ? startedDate
            : undefined,

        plantedOutDate:
          beganFromSeed &&
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
            ? trimmedCustomOriginLabel ||
              undefined
            : undefined,

        status:
          isEditing &&
          plantToEdit
            ? plantToEdit.status
            : 'growing',

        currentGrowingSpaceId:
          sourcePlant
            ?.currentGrowingSpaceId,

        previousGrowingSpaceIds:
          sourcePlant
            ?.previousGrowingSpaceIds,

        currentGrowingPlaceId:
          currentGrowingPlaceId ||
          undefined,

        previousGrowingPlaceIds:
          sourcePlant
            ?.previousGrowingPlaceIds,

        currentGrowingSetupId:
          currentGrowingSetupId ||
          undefined,

        previousGrowingSetupIds:
          sourcePlant
            ?.previousGrowingSetupIds,

        notes:
          notes.trim() ||
          undefined,

        photoUrls,

        expectedHarvestDaysMin:
          minimumHarvestDays,

        expectedHarvestDaysMax:
          maximumHarvestDays,

        tags:
          sourcePlant?.tags ??
          [],

        isFavourite:
          isEditing
            ? plantToEdit
                ?.isFavourite
            : false,

        isArchived:
          isEditing
            ? plantToEdit
                ?.isArchived
            : false,

        archivedAt:
          isEditing
            ? plantToEdit
                ?.archivedAt
            : undefined,

        completedAt:
          isEditing
            ? plantToEdit
                ?.completedAt
            : undefined,

        updatedAt:
          isEditing
            ? new Date()
                .toISOString()
            : undefined,
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

    onClose()
  }


  /* =======================================
     PAGE WORDING
  ======================================= */

  const pageTitle =
    isEditing
      ? 'Edit Plant Story'
      : isVariation
        ? 'Create a variation'
        : 'Begin a new growing story'


  const saveLabel =
    isEditing
      ? 'Save changes'
      : isVariation
        ? 'Create this variation'
        : 'Add this Plant Story'


  return (
    <div
      className="form-backdrop"
      role="presentation"
    >
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

          <div className="form-heading">
            <h2 id="add-plant-title">
              {pageTitle}
            </h2>

            <button
              type="button"
              className="close-button"
              onClick={
                onClose
              }
              aria-label="Close Plant Story"
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

            {isVariation ? (
              <p className="form-whisper">
                🌱 Begin with what Sprig
                already knows, then change
                anything that makes this
                growing story different.
              </p>
            ) : (
              <p className="form-whisper">
                🌱 Give this plant its own
                page in Sprig.
              </p>
            )}


            {/* =======================================
                PLANT TYPE
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                What type of plant are you growing?

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
                  placeholder="Potato, tomato, broccoli, thyme..."
                  required
                />
              </label>
            </section>


            {/* =======================================
                VARIETY
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                Which variety?

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
                  placeholder="Royal Blue, Mortgage Lifter..."
                />
              </label>

              <p className="form-whisper">
                Leave this blank if the
                variety is unknown.
              </p>
            </section>


            {/* =======================================
                START METHOD
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                How did this story begin?

                <select
                  value={
                    startMethod
                  }
                  onChange={(
                    event,
                  ) =>
                    setStartMethod(
                      event.target
                        .value as StartMethod,
                    )
                  }
                >
                  <option value="seed">
                    Seed
                  </option>

                  <option value="seedling">
                    Seedling
                  </option>

                  <option value="cutting">
                    Cutting
                  </option>

                  <option value="sucker">
                    Sucker
                  </option>

                  <option value="seed-potato">
                    Seed potato
                  </option>

                  <option value="tuber">
                    Tuber
                  </option>

                  <option value="bulb">
                    Bulb
                  </option>

                  <option value="rhizome">
                    Rhizome
                  </option>

                  <option value="division">
                    Division
                  </option>

                  <option value="bought-plant">
                    Bought plant
                  </option>

                  <option value="other">
                    Something else
                  </option>
                </select>
              </label>


              {startMethod ===
                'other' && (
                <label>
                  What did it begin as?

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
                    placeholder="Add your own starting method..."
                  />
                </label>
              )}
            </section>


            {/* =======================================
                QUANTITY
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                How many plants or starting pieces?

                <input
                  type="number"
                  min="1"
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

              <p className="form-whisper">
                For example: 3 seed potatoes,
                6 seedlings or 1 cutting.
              </p>
            </section>


            {/* =======================================
                BEGINNING DATE
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
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


              {beganFromSeed ? (
                <p className="form-whisper">
                  For a seed-grown plant,
                  this is the date the seed
                  was first sown.
                </p>
              ) : (
                <p className="form-whisper">
                  Use the first date you
                  consider this growing
                  story to have begun.
                </p>
              )}
            </section>


            {/* =======================================
                PLANTED OUT
            ======================================= */}

            {beganFromSeed && (
              <section className="sprig-form-section growing-setup-details">
                <label>
                  Has it been planted out yet?

                  <select
                    value={
                      hasBeenPlantedOut
                        ? 'yes'
                        : 'no'
                    }
                    onChange={(
                      event,
                    ) =>
                      setHasBeenPlantedOut(
                        event.target
                          .value ===
                          'yes',
                      )
                    }
                  >
                    <option value="no">
                      Not yet
                    </option>

                    <option value="yes">
                      Yes
                    </option>
                  </select>
                </label>


                {hasBeenPlantedOut && (
                  <label>
                    When was it planted out?

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


                <p className="form-whisper">
                  Potting up, moving from a
                  snaplock bag, transplanting
                  and other stages can become
                  moments in this Plant Story.
                </p>
              </section>
            )}


            {/* =======================================
                ORIGIN
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                Where did it come from?

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
                  <option value="bought">
                    Bought
                  </option>

                  <option value="saved-from-garden">
                    Saved from my garden
                  </option>

                  <option value="propagated-from-plant">
                    Propagated from another plant
                  </option>

                  <option value="gifted">
                    Given to me
                  </option>

                  <option value="swapped">
                    Swapped
                  </option>

                  <option value="found-or-existing">
                    Found or already growing
                  </option>

                  <option value="unknown">
                    Not sure
                  </option>

                  <option value="other">
                    Something else
                  </option>
                </select>
              </label>


              {originType ===
                'other' && (
                <label>
                  How would you describe its origin?

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
                    placeholder="Add your own description..."
                  />
                </label>
              )}


              {originType !==
                'unknown' && (
                <label>
                  Source or place

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
                    placeholder={
                      originType ===
                      'bought'
                        ? 'Bunnings, nursery, seed company...'
                        : 'Friend, previous crop, garden bed...'
                    }
                  />
                </label>
              )}


              <p className="form-whisper">
                {getPlantOriginLabel(
                  originType,
                )}
                {source.trim()
                  ? ` · ${source.trim()}`
                  : ''}
              </p>
            </section>


            {/* =======================================
                GROWING PLACE
            ======================================= */}

            <section className="sprig-form-section">
              <SprigPicker
                title="Where is it growing?"
                variant="label"
                emptySummary="Choose a Growing Place"
                options={
                  GrowingPlaces.map(
                    (
                      place,
                    ) => ({
                      value:
                        place.id,

                      label:
                        place.name,
                    }),
                  )
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
                    (
                      current,
                    ) =>
                      !current,
                  )
                }
                onToggleValue={(
                  id,
                ) => {
                  setCurrentGrowingPlaceId(
                    id,
                  )


                  const selectedPlace =
                    GrowingPlaces.find(
                      (
                        place,
                      ) =>
                        place.id ===
                        id,
                    )


                  setCurrentGrowingSetupId(
                    selectedPlace
                      ?.growingSetupId ||
                      '',
                  )


                  setIsGrowingPlacePickerOpen(
                    false,
                  )
                }}
              />


              <button
                type="button"
                className="garden-place-link"
                onClick={() =>
                  setIsAddGrowingPlaceOpen(
                    true,
                  )
                }
              >
                Add a new Growing Place
              </button>
            </section>


            {/* =======================================
                GROWING RECIPE
            ======================================= */}

            <section className="sprig-form-section">
              <SprigPicker
                title="What is it growing in?"
                variant="label-tall"
                emptySummary="Choose a Garden Recipe"
                options={
                  GrowingSetups.map(
                    (
                      setup,
                    ) => ({
                      value:
                        setup.id,

                      label:
                        setup.name,

                      subtitle:
                        getGrowingSetupCategoryLabel(
                          setup,
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
                  currentGrowingSetupId
                    ? [
                        currentGrowingSetupId,
                      ]
                    : []
                }
                isOpen={
                  isGrowingSetupPickerOpen
                }
                onToggleOpen={() =>
                  setIsGrowingSetupPickerOpen(
                    (
                      current,
                    ) =>
                      !current,
                  )
                }
                onToggleValue={(
                  id,
                ) => {
                  setCurrentGrowingSetupId(
                    id,
                  )

                  setIsGrowingSetupPickerOpen(
                    false,
                  )
                }}
              />


              <button
                type="button"
                className="garden-place-link"
                onClick={() => {
                  setIsGrowingSetupPickerOpen(
                    false,
                  )

                  setIsAddRecipeOpen(
                    true,
                  )
                }}
              >
                Add a new Garden Recipe
              </button>
            </section>


            {/* =======================================
                HARVEST TIMING
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <p className="section-label">
                Harvest timing
              </p>

              <h3>
                When might this story begin giving back?
              </h3>

              <p className="form-whisper">
                Optional. Leave this blank
                when harvest timing does not
                apply or you do not know yet.
              </p>


              <div className="form-row">
                <label>
                  Earliest days

                  <input
                    type="number"
                    min="1"
                    value={
                      expectedHarvestDaysMin
                    }
                    onChange={(
                      event,
                    ) =>
                      setExpectedHarvestDaysMin(
                        event.target.value,
                      )
                    }
                    placeholder="90"
                  />
                </label>


                <label>
                  Latest days

                  <input
                    type="number"
                    min="1"
                    value={
                      expectedHarvestDaysMax
                    }
                    onChange={(
                      event,
                    ) =>
                      setExpectedHarvestDaysMax(
                        event.target.value,
                      )
                    }
                    placeholder="120"
                  />
                </label>
              </div>
            </section>


            {/* =======================================
                NOTES
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
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
                  placeholder="What would future you like to remember?"
                  rows={
                    4
                  }
                />
              </label>
            </section>


            {/* =======================================
                PHOTOGRAPHS
            ======================================= */}

            <section className="sprig-form-section">
              <SprigPhotoPicker
                photoUrls={
                  photoUrls
                }
                onChange={
                  setPhotoUrls
                }
                title="Photographs"
                helperText="Tuck photographs of this plant into its story so Sprig can remember how it looked as it grew."
                addButtonText="Add plant photographs"
                photoAltPrefix="Plant Story photograph"
                maxPhotos={
                  12
                }
              />
            </section>


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
                {saveLabel}
              </button>
            </div>

          </form>
        </div>
      </section>


      {/* =======================================
          ADD GROWING PLACE
      ======================================= */}

      {isAddGrowingPlaceOpen && (
        <AddGrowingPlaceForm
          ingredients={
            Ingredients
          }

          growingSetups={
            GrowingSetups
          }

          onAddIngredient={
            onAddIngredient
          }

          onAddPlace={(
            place,
            setup?: GrowingSetup,
          ) => {
            onAddGrowingPlace(
              place,
              setup,
            )


            setCurrentGrowingPlaceId(
              place.id,
            )


            setCurrentGrowingSetupId(
              setup?.id ||
              place.growingSetupId ||
              '',
            )


            setIsGrowingPlacePickerOpen(
              false,
            )

            setIsGrowingSetupPickerOpen(
              false,
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


      {/* =======================================
          ADD GROWING RECIPE
      ======================================= */}

      {isAddRecipeOpen && (
        <AddRecipeForm
          ingredients={
            Ingredients
          }

          onAddIngredient={
            onAddIngredient
          }

          onAddRecipe={(
            recipe,
          ) => {
            onAddRecipe(
              recipe,
            )


            setCurrentGrowingSetupId(
              recipe.id,
            )


            setIsGrowingSetupPickerOpen(
              false,
            )

            setIsAddRecipeOpen(
              false,
            )
          }}

          onClose={() =>
            setIsAddRecipeOpen(
              false,
            )
          }
        />
      )}
    </div>
  )
}