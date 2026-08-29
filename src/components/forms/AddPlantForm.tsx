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
  GardenPlan,
  GardenProduct,
  GrowingPlace,
  GrowingSetup,
  Ingredient,
  PlantGrowingHistoryEntry,
  PlantOriginType,
  PlantStory,
  StartMethod,
} from '../../types'


interface AddPlantFormProps {
  GrowingPlaces: GrowingPlace[]
  GrowingSetups: GrowingSetup[]
  Ingredients: Ingredient[]
  Products: GardenProduct[]

  /**
   * Normal create mode.
   */
  onAddPlant: (
    plant: PlantStory,
  ) => void

  /**
   * Edit mode.
   */
  onUpdatePlant?: (
    plant: PlantStory,
  ) => void

  /**
   * Supplying this turns the form into
   * Edit Plant Story.
   */
  plantToEdit?: PlantStory

  /**
   * Supplying this creates a brand-new
   * Plant Story prefilled from another.
   */
  variationFrom?: PlantStory

  /**
   * Supplying this begins a brand-new
   * Plant Story from a Garden Plan.
   *
   * The Plan remains an intention.
   * This form merely carries useful
   * particulars forward so the gardener
   * does not have to type them again.
   *
   * The Plant Story created here owns
   * what actually happened.
   */
  planToRecord?: GardenPlan

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

  onAddProduct: (
    product: GardenProduct,
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
   GROWING HISTORY ID
======================================= */

function createGrowingHistoryId(
  plantId: string,
  suffix: string,
): string {
  return `${plantId}-growing-history-${Date.now()}-${suffix}`
}


/* =======================================
   UNIQUE RELATIONSHIP IDS
======================================= */

function addUniqueRelationshipId(
  ids: string[],
  id?: string,
): string[] {
  if (!id) {
    return ids
  }

  if (
    ids.includes(
      id,
    )
  ) {
    return ids
  }

  return [
    ...ids,
    id,
  ]
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

  /*
   * A Plant-out Plan can refer either to a
   * Plant Story Sprig already knows, or to a
   * physical plant that has not entered Sprig
   * yet.
   *
   * In the second case this form creates the
   * Plant Story at the moment reality catches
   * up with the Plan. We do not invent an
   * earlier sowing or planting history.
   */
  const isNewPlantOutFromPlan =
    recordingPlan?.kind ===
      'plant-out' &&
    (
      recordingPlan
        .plantStoryIds ??
      []
    ).length === 0

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
    useState(false)

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
      recordingPlan
        ?.growingSetupIds
        ?.[0] ??
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
        : recordingPlan
            ?.timingAssumption
            ?.daysMin !==
          undefined
          ? String(
              recordingPlan
                .timingAssumption
                .daysMin,
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
        : recordingPlan
            ?.timingAssumption
            ?.daysMax !==
          undefined
          ? String(
              recordingPlan
                .timingAssumption
                .daysMax,
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
      [
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
        string | undefined
      >
    >(
      (
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


  /* =======================================
     PLANT BEGINNING
  ======================================= */

  const beganFromSeed =
    startMethod ===
    'seed'


  /* =======================================
     FORM REFERENCE
  ======================================= */

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

    if (
      !trimmedPlantName
    ) {
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


    /* =======================================
       RESOLVE CURRENT RELATIONSHIPS
    ======================================= */

    const selectedGrowingPlaceId =
      currentGrowingPlaceId ||
      undefined

    const selectedGrowingSetupId =
      currentGrowingSetupId ||
      undefined

    /*
     * For a newly introduced Plant-out
     * story, the first real arrangement
     * begins when the plant was actually
     * planted out.
     *
     * Seed-grown stories that already have
     * a Plant-out date follow the same rule.
     */
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


    /* =======================================
       PLANT ID
    ======================================= */

    const savedPlantId =
      isEditing &&
      plantToEdit
        ? plantToEdit.id
        : createPlantId(
            displayName,
          )


    /* =======================================
       PREVIOUS RELATIONSHIPS
    ======================================= */

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


    /* =======================================
       DATED GROWING HISTORY
    ======================================= */

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
            }),
          )
        : []

    if (
      isEditing &&
      plantToEdit
    ) {
      const growingPlaceChanged =
        plantToEdit
          .currentGrowingPlaceId !==
        selectedGrowingPlaceId

      const growingSetupChanged =
        plantToEdit
          .currentGrowingSetupId !==
        selectedGrowingSetupId

      const growingArrangementChanged =
        growingPlaceChanged ||
        growingSetupChanged

      if (
        growingPlaceChanged
      ) {
        nextPreviousGrowingPlaceIds =
          addUniqueRelationshipId(
            nextPreviousGrowingPlaceIds,
            plantToEdit
              .currentGrowingPlaceId,
          )
      }

      if (
        growingSetupChanged
      ) {
        nextPreviousGrowingSetupIds =
          addUniqueRelationshipId(
            nextPreviousGrowingSetupIds,
            plantToEdit
              .currentGrowingSetupId,
          )
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
            plantToEdit
              .currentGrowingSetupId
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

            notes:
              'Earlier growing arrangement carried forward from this existing Plant Story. Its exact starting date was not separately recorded.',
          })
        } else {
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
          selectedGrowingSetupId
        ) {
          nextGrowingHistory.push({
            id:
              createGrowingHistoryId(
                savedPlantId,
                'current',
              ),

            startedDate:
              today,

            growingPlaceId:
              selectedGrowingPlaceId,

            growingSetupId:
              selectedGrowingSetupId,
          })
        }
      } else if (
        nextGrowingHistory.length ===
          0 &&
        (
          selectedGrowingPlaceId ||
          selectedGrowingSetupId
        )
      ) {
        nextGrowingHistory.push({
          id:
            createGrowingHistoryId(
              savedPlantId,
              'baseline',
            ),

          startedDate:
            plantToEdit
              .plantedOutDate ??
            plantToEdit
              .plantedDate,

          growingPlaceId:
            selectedGrowingPlaceId,

          growingSetupId:
            selectedGrowingSetupId,

          notes:
            'Growing-history starting point carried forward from this existing Plant Story. Its exact arrangement date was not separately recorded.',
        })
      }
    } else if (
      selectedGrowingPlaceId ||
      selectedGrowingSetupId
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
            selectedGrowingSetupId,
        },
      ]
    }


    /* =======================================
       SAVED PLANT STORY
    ======================================= */

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

        /*
         * For a plant Sprig first meets at
         * Plant-out, plantedDate means the
         * beginning of Sprig's known Plant
         * Story. It does not claim the plant
         * biologically began on this day.
         */
        plantedDate:
          startedDate,

        /*
         * Never manufacture a sowing date for
         * an already-existing plant entering
         * Sprig through Plant-out.
         */
        sownDate:
          beganFromSeed &&
          !isNewPlantOutFromPlan
            ? startedDate
            : undefined,

        /*
         * A new Plant-out Plant Story owns a
         * real plantedOutDate even though it
         * was not previously in Sprig.
         */
        plantedOutDate:
          (
            isNewPlantOutFromPlan ||
            (
              beganFromSeed &&
              hasBeenPlantedOut
            )
          ) &&
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
          isEditing
            ? plantToEdit
                ?.currentGrowingSpaceId
            : undefined,

        previousGrowingSpaceIds:
          isEditing
            ? plantToEdit
                ?.previousGrowingSpaceIds
            : undefined,

        currentGrowingPlaceId:
          selectedGrowingPlaceId,

        previousGrowingPlaceIds:
          nextPreviousGrowingPlaceIds.length >
          0
            ? nextPreviousGrowingPlaceIds
            : undefined,

        currentGrowingSetupId:
          selectedGrowingSetupId,

        previousGrowingSetupIds:
          nextPreviousGrowingSetupIds.length >
          0
            ? nextPreviousGrowingSetupIds
            : undefined,

        growingHistory:
          nextGrowingHistory.length >
          0
            ? nextGrowingHistory
            : undefined,

        notes:
          notes.trim() ||
          undefined,

        photoUrls:
          photoUrls.length >
          0
            ? photoUrls
            : undefined,

        photoDates:
          photoUrls.length >
          0
            ? photoUrls.map(
                (
                  _photoUrl,
                  index,
                ) =>
                  photoDates[
                    index
                  ],
              )
            : undefined,

        expectedHarvestDaysMin:
          minimumHarvestDays,

        expectedHarvestDaysMax:
          maximumHarvestDays,

        harvestTimingReference:
          isEditing
            ? plantToEdit
                ?.harvestTimingReference
            : isRecordingPlan
              ? getPlanHarvestTimingReference(
                  recordingPlan,
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
            : sourcePlant?.tags ??
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
      : isRecordingPlan
        ? 'Record what happened'
        : isVariation
          ? 'Create a variation'
          : 'Begin a new growing story'

  const saveLabel =
    isEditing
      ? 'Save changes'
      : isRecordingPlan
        ? 'Create this Plant Story'
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

            {isRecordingPlan &&
            recordingPlan ? (
              <section className="sprig-form-section growing-setup-details">
                <p className="section-label">
                  From Garden Plan
                </p>

                <h3>
                  {recordingPlan.title}
                </h3>

                <p className="form-whisper">
                  🌱 Sprig has carried the useful
                  details from your Plan into this
                  Plant Story. They are only a
                  starting point. Change anything
                  that happened differently.
                </p>

                <p className="form-whisper">
                  The Plan will remain exactly what
                  you intended. This new Plant Story
                  will remember what actually
                  happened.
                </p>

                {isNewPlantOutFromPlan && (
                  <p className="form-whisper">
                    🌿 This plant was not in Sprig yet.
                    That is completely fine. Recording
                    the Plant-out creates its real Plant
                    Story now, without pretending Sprig
                    knows what happened before this day.
                  </p>
                )}
              </section>
            ) : isVariation ? (
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


              {isNewPlantOutFromPlan ? (
                <p className="form-whisper">
                  Sprig has started with “Bought plant”
                  because this is an already-existing
                  plant entering Sprig at Plant-out.
                  Change it if that is not how this
                  particular plant began.
                </p>
              ) : isRecordingPlan && (
                <p className="form-whisper">
                  Confirm what you actually started
                  with. Sprig will not guess that a
                  potato was a seed potato, a tomato
                  was a seedling, or anything else
                  just from its name.
                </p>
              )}


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
                {isRecordingPlan
                  ? ' Change this if reality differed from the Plan.'
                  : ''}
              </p>
            </section>


            {/* =======================================
    BEGINNING DATE
======================================= */}

{!isNewPlantOutFromPlan && (
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


    {isRecordingPlan ? (
      <p className="form-whisper">
        Sprig began with the date from your
        Plan. Change it to the date you
        actually did it. This actual date
        will drive the Plant Story&apos;s
        Expected timing.
      </p>
    ) : beganFromSeed ? (
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
)}


            {/* =======================================
                PLANTED OUT
            ======================================= */}

            {isNewPlantOutFromPlan && (
              <section className="sprig-form-section growing-setup-details">
                <p className="section-label">
                  Planting out
                </p>

                <h3>
                  The moment this plant joined the garden
                </h3>

                <label>
                  When was it actually planted out?

                  <input
                    type="date"
                    value={
                      plantedOutDate
                    }
                    onChange={(
                      event,
                    ) => {
                      const nextDate =
                        event.target.value

                      setPlantedOutDate(
                        nextDate,
                      )

                      setStartedDate(
                        nextDate,
                      )
                    }}
                    required
                  />
                </label>

                <p className="form-whisper">
                  This is the real Plant-out date. It
                  will become this Plant Story's
                  planted-out date and the beginning of
                  its first Growing Journey arrangement.
                </p>
              </section>
            )}


            {beganFromSeed &&
              !isNewPlantOutFromPlan && (
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
                    place => ({
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
                    current =>
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
                      place =>
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


              {isRecordingPlan &&
                recordingPlan
                  ?.growingPlaceIds
                  ?.[0] && (
                <p className="form-whisper">
                  This began with the Growing Place
                  from your Plan. Choose somewhere
                  else if the plant actually ended
                  up in a different place.
                </p>
              )}


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
                    setup => ({
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
                    current =>
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


              {isRecordingPlan &&
                recordingPlan
                  ?.growingSetupIds
                  ?.[0] && (
                <p className="form-whisper">
                  This began with the Growing Recipe
                  from your Plan. Change it if you
                  actually used something different.
                </p>
              )}


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

              {isRecordingPlan &&
              recordingPlan
                ?.timingAssumption ? (
                <p className="form-whisper">
                  Sprig carried your timing estimate
                  from the Plan. You can keep it or
                  change it here. Once this Plant
                  Story is saved, the appropriate
                  actual date in this Plant Story becomes
                  the reference for the Expected harvest
                  window.
                </p>
              ) : (
                <p className="form-whisper">
                  Optional. Leave this blank
                  when harvest timing does not
                  apply or you do not know yet.
                </p>
              )}


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


              {isRecordingPlan &&
                recordingPlan
                  ?.notes
                  ?.trim() && (
                <p className="form-whisper">
                  Your Plan note came across as a
                  starting point too. Rewrite it if
                  the reality needs a different note.
                </p>
              )}
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

                photoDates={
                  photoDates
                }

                onPhotoDatesChange={
                  setPhotoDates
                }

                title="Photographs"

                helperText="Tuck photographs of this plant into its story so Sprig can remember how it looked as it grew."

                addButtonText="Add plant photographs"

                photoAltPrefix="Plant Story photograph"

                photoDateLabel="When was this photograph taken?"

                photoDateHelperText="Sprig uses this date to place the photograph at the right growing age and find useful side-by-side comparisons."

                defaultNewPhotosToToday={
                  true
                }

                maxPhotos={
                  12
                }
              />
            </section>


            {/* =======================================
                PLAN / REALITY REMINDER
            ======================================= */}

            {isRecordingPlan &&
              recordingPlan && (
              <section className="sprig-form-section growing-setup-details">
                <p className="section-label">
                  Plan and reality
                </p>

                <h3>
                  Two related stories, not one overwritten record
                </h3>

                <p className="form-whisper">
                  Your Garden Plan will stay as the
                  record of what you meant to do.
                  Saving this page creates the
                  separate Plant Story for what
                  actually happened.
                </p>

                <p className="form-whisper">
                  After this Plant Story is saved,
                  Sprig will link it back to
                  “{recordingPlan.title}”.
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

          products={
            Products
          }

          onAddIngredient={
            onAddIngredient
          }

          onAddProduct={
            onAddProduct
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

          products={
            Products
          }

          growingSetups={
            GrowingSetups
          }

          onAddIngredient={
            onAddIngredient
          }

          onAddProduct={
            onAddProduct
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