import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import SelectionCard from '../sprig/SelectionCard'
import SprigPicker from '../sprig/SprigPicker'
import SprigPhotoPicker from '../photos/SprigPhotoPicker'

import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'

import type {
  EventType,
  GardenEvent,
  GardenPlan,
  GrowingPlace,
  GrowingPlaceScope,
  PlantScope,
  PlantStory,
} from '../../types'


interface AddEventFormProps {
  plantId: string

  plants: PlantStory[]

  growingPlaces: GrowingPlace[]

  /*
   * Optional existing Journal record.
   *
   * Supplying this changes the form from
   * Add Journal Entry to Edit Journal Entry.
   *
   * The same GardenEvent ID is preserved.
   */
  eventToEdit?: GardenEvent

  /*
   * Optional Garden Plan source.
   *
   * The Plan is not changed by this form.
   * It merely provides useful starting values
   * for the real Journal record.
   */
  planToRecord?: GardenPlan

  onAddEvent: (
    event: GardenEvent,
  ) => void

  onUpdateEvent?: (
    event: GardenEvent,
  ) => void

  onClose: () => void
}


/* =======================================
   TODAY
======================================= */

function getTodayDate(): string {
  const now =
    new Date()

  const year =
    now.getFullYear()

  const month =
    String(
      now.getMonth() +
        1,
    ).padStart(
      2,
      '0',
    )

  const day =
    String(
      now.getDate(),
    ).padStart(
      2,
      '0',
    )

  return `${year}-${month}-${day}`
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
    return undefined
  }


  switch (
    plan.kind
  ) {
    case 'plant-out':
    case 'move':
      return 'moved'

    case 'feed':
      return 'fed'

    case 'treat':
      return 'treated'

    case 'garden-task':
    case 'other':
      return 'note'

    default:
      return undefined
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
    0


  if (
    count ===
    1
  ) {
    return 'single'
  }


  if (
    count >
    1
  ) {
    return 'multiple'
  }


  return 'none'
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
    0


  if (
    count ===
    1
  ) {
    return 'single'
  }


  if (
    count >
    1
  ) {
    return 'multiple'
  }


  return 'none'
}


/* =======================================
   EXISTING EVENT → PLANT SCOPE
======================================= */

function getEventPlantScope(
  event?: GardenEvent,
): PlantScope {
  if (
    event?.plantScope
  ) {
    return event.plantScope
  }


  const count =
    event
      ?.plantStoryIds
      ?.length ??
    0


  if (
    count ===
    1
  ) {
    return 'single'
  }


  if (
    count >
    1
  ) {
    return 'multiple'
  }


  return 'none'
}


/* =======================================
   EXISTING EVENT → PLACE SCOPE
======================================= */

function getEventPlaceScope(
  event?: GardenEvent,
): GrowingPlaceScope {
  if (
    event?.growingPlaceScope
  ) {
    return event.growingPlaceScope
  }


  const count =
    event
      ?.growingPlaceIds
      ?.length ??
    0


  if (
    count ===
    1
  ) {
    return 'single'
  }


  if (
    count >
    1
  ) {
    return 'multiple'
  }


  return 'none'
}


/* =======================================
   SPRIG JOURNAL FORM
======================================= */

export default function AddEventForm({
  plantId,
  plants,
  growingPlaces,
  eventToEdit,
  planToRecord,
  onAddEvent,
  onUpdateEvent,
  onClose,
}: AddEventFormProps) {
  const today =
    getTodayDate()


  const isEditing =
    Boolean(
      eventToEdit,
    )


  const isRecordingPlan =
    Boolean(
      planToRecord,
    ) &&
    !isEditing


  /*
   * This ref is the hard submission gate.
   *
   * React state disables the button visually,
   * but state updates are asynchronous.
   *
   * A rapid second tap can therefore arrive
   * before the disabled button has rendered.
   * The ref closes that tiny gap immediately.
   */
  const isSubmittingRef =
    useRef(false)


  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false)


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
      : undefined


  const startingGrowingPlaceId =
    startingPlant
      ?.currentGrowingPlaceId ??
    ''


  const planPlantIds =
    planToRecord
      ?.plantStoryIds ??
    []


  const planPlaceIds =
    planToRecord
      ?.growingPlaceIds ??
    []


  const plannedActivity =
    getPlanActivityType(
      planToRecord,
    )


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
      : undefined


  /* =======================================
     ACTIVITY
  ======================================= */

  const [
    activityTypes,
    setActivityTypes,
  ] =
    useState<EventType[]>(
      eventActivityTypes ??
      (
        plannedActivity
          ? [
              plannedActivity,
            ]
          : []
      ),
    )


  const [
    isActivityPickerOpen,
    setIsActivityPickerOpen,
  ] =
    useState(false)


  /* =======================================
     GROWING PLACE PICKER
  ======================================= */

  const [
    isGrowingPlacePickerOpen,
    setIsGrowingPlacePickerOpen,
  ] =
    useState(false)


  /* =======================================
     PLANT PICKER
  ======================================= */

  const [
    isPlantPickerOpen,
    setIsPlantPickerOpen,
  ] =
    useState(false)


  /* =======================================
     JOURNAL DETAILS
  ======================================= */

  const [
    date,
    setDate,
  ] =
    useState(
      eventToEdit?.date ??
      planToRecord?.date ??
      today,
    )


  const [
    title,
    setTitle,
  ] =
    useState(
      eventToEdit?.title ??
      planToRecord?.title ??
      '',
    )


  const [
    productUsed,
    setProductUsed,
  ] =
    useState(
      eventToEdit?.productUsed ??
      '',
    )


  const [
    notes,
    setNotes,
  ] =
    useState(
      eventToEdit?.notes ??
      planToRecord?.notes ??
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
          eventToEdit
            ?.photoUrls ??
          []
        ),
      ],
    )


  /* =======================================
     GROWING PLACE SCOPE
  ======================================= */

  const [
    growingPlaceScope,
    setGrowingPlaceScope,
  ] =
    useState<GrowingPlaceScope>(
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
    )


  const [
    growingPlaceIds,
    setGrowingPlaceIds,
  ] =
    useState<string[]>(
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
    )


  /* =======================================
     PLANT SCOPE
  ======================================= */

  const [
    plantScope,
    setPlantScope,
  ] =
    useState<PlantScope>(
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
    )


  const [
    plantStoryIds,
    setPlantStoryIds,
  ] =
    useState<string[]>(
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
    )


  /* =======================================
     SOURCE RECORD RESET
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
        )

        setDate(
          eventToEdit.date,
        )

        setTitle(
          eventToEdit.title ??
          '',
        )

        setProductUsed(
          eventToEdit
            .productUsed ??
          '',
        )

        setNotes(
          eventToEdit.notes ??
          '',
        )

        setGrowingPlaceScope(
          getEventPlaceScope(
            eventToEdit,
          ),
        )

        setGrowingPlaceIds(
          [
            ...(
              eventToEdit
                .growingPlaceIds ??
              []
            ),
          ],
        )

        setPlantScope(
          getEventPlantScope(
            eventToEdit,
          ),
        )

        setPlantStoryIds(
          [
            ...(
              eventToEdit
                .plantStoryIds ??
              []
            ),
          ],
        )

        setPhotoUrls(
          [
            ...(
              eventToEdit
                .photoUrls ??
              []
            ),
          ],
        )

        setIsActivityPickerOpen(
          false,
        )

        setIsGrowingPlacePickerOpen(
          false,
        )

        setIsPlantPickerOpen(
          false,
        )

        isSubmittingRef.current =
          false

        setIsSubmitting(
          false,
        )

        return
      }


      if (
        !planToRecord
      ) {
        return
      }


      const nextActivity =
        getPlanActivityType(
          planToRecord,
        )


      setDate(
        planToRecord.date,
      )

      setTitle(
        planToRecord.title ??
        '',
      )

      setNotes(
        planToRecord.notes ??
        '',
      )

      setProductUsed(
        '',
      )

      setActivityTypes(
        nextActivity
          ? [
              nextActivity,
            ]
          : [],
      )

      setGrowingPlaceScope(
        getPlanPlaceScope(
          planToRecord,
        ),
      )

      setGrowingPlaceIds(
        [
          ...(
            planToRecord
              .growingPlaceIds ??
            []
          ),
        ],
      )

      setPlantScope(
        getPlanPlantScope(
          planToRecord,
        ),
      )

      setPlantStoryIds(
        [
          ...(
            planToRecord
              .plantStoryIds ??
            []
          ),
        ],
      )

      setPhotoUrls(
        [],
      )

      setIsActivityPickerOpen(
        false,
      )

      setIsGrowingPlacePickerOpen(
        false,
      )

      setIsPlantPickerOpen(
        false,
      )

      isSubmittingRef.current =
        false

      setIsSubmitting(
        false,
      )
    },
    [
      eventToEdit?.id,
      planToRecord?.id,
    ],
  )


  /* =======================================
     LOCK BACKGROUND PAGE
  ======================================= */

  useEffect(
    () => {
      const body =
        document.body

      const html =
        document.documentElement

      const previousBodyOverflow =
        body.style.overflow

      const previousBodyOverscroll =
        body.style.overscrollBehavior

      const previousHtmlOverflow =
        html.style.overflow

      const previousHtmlOverscroll =
        html.style.overscrollBehavior


      body.style.overflow =
        'hidden'

      body.style.overscrollBehavior =
        'none'

      html.style.overflow =
        'hidden'

      html.style.overscrollBehavior =
        'none'


      return () => {
        body.style.overflow =
          previousBodyOverflow

        body.style.overscrollBehavior =
          previousBodyOverscroll

        html.style.overflow =
          previousHtmlOverflow

        html.style.overscrollBehavior =
          previousHtmlOverscroll
      }
    },
    [],
  )


  /* =======================================
     AVAILABLE PLANTS
  ======================================= */

  const availablePlants =
    growingPlaceScope ===
      'entire-garden' ||
    growingPlaceIds.length ===
      0
      ? plants
      : plants.filter(
          plant =>
            growingPlaceIds.some(
              placeId =>
                placeId ===
                plant.currentGrowingPlaceId,
            ) ||
            plantStoryIds.includes(
              plant.id,
            ),
        )


  const sortedAvailablePlants = [
    ...availablePlants,
  ].sort(
    (
      first,
      second,
    ) =>
      first.displayName.localeCompare(
        second.displayName,
      ),
  )


  /* =======================================
     GROWING PLACE SCOPE
  ======================================= */

  function chooseGrowingPlaceScope(
    scope: GrowingPlaceScope,
  ) {
    setGrowingPlaceScope(
      scope,
    )


    if (
      scope === 'none' ||
      scope === 'entire-garden'
    ) {
      setGrowingPlaceIds(
        [],
      )
    }


    if (
      scope === 'single' &&
      startingGrowingPlaceId &&
      growingPlaceIds.length ===
        0
    ) {
      setGrowingPlaceIds(
        [
          startingGrowingPlaceId,
        ],
      )
    }
  }


  /* =======================================
     PLANT SCOPE
  ======================================= */

  function choosePlantScope(
    scope: PlantScope,
  ) {
    setPlantScope(
      scope,
    )


    if (
      scope === 'none' ||
      scope === 'all-plants'
    ) {
      setPlantStoryIds(
        [],
      )
    }


    if (
      scope === 'single' &&
      startingPlant
    ) {
      setPlantStoryIds(
        [
          startingPlant.id,
        ],
      )
    }
  }


  /* =======================================
     ACTIVITY OPTIONS
  ======================================= */

  const activityOptions: {
    value: EventType
    label: string
    icon: string
  }[] = [
    {
      value: 'observation',
      label: 'Observed',
      icon: '👀',
    },
    {
      value: 'watered',
      label: 'Watered',
      icon: '💧',
    },
    {
      value: 'fed',
      label: 'Fertilised',
      icon: '🌿',
    },
    {
      value: 'sprouted',
      label: 'Sprouted',
      icon: '🌱',
    },
    {
      value: 'pruned',
      label: 'Pruned',
      icon: '✂️',
    },
    {
      value: 'treated',
      label: 'Treated',
      icon: '🩹',
    },
    {
      value: 'harvest',
      label: 'Harvested',
      icon: '🧺',
    },
    {
      value: 'moved',
      label: 'Moved',
      icon: '🪴',
    },
    {
      value: 'hilled',
      label: 'Hilled',
      icon: '🥔',
    },
    {
      value: 'weather',
      label: 'Weather',
      icon: '🌦️',
    },
    {
      value: 'photo',
      label: 'Photographed',
      icon: '📷',
    },
    {
      value: 'note',
      label: 'Made a note',
      icon: '📖',
    },
  ]


  /* =======================================
     TOGGLE ACTIVITY
  ======================================= */

  function toggleActivity(
    activity: EventType,
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
          )
        }


        return [
          ...current,
          activity,
        ]
      },
    )
  }


  /* =======================================
     SAVE JOURNAL ENTRY
  ======================================= */

  function handleSubmit(
    formEvent:
      FormEvent<HTMLFormElement>,
  ) {
    formEvent.preventDefault()


    if (
      isSubmittingRef.current
    ) {
      return
    }


    isSubmittingRef.current =
      true

    setIsSubmitting(
      true,
    )


    const primaryType =
      activityTypes[0] ??
      'observation'


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
        )


    const savedEvent:
      GardenEvent = {
        ...(
          eventToEdit ??
          {}
        ),

        id:
          eventToEdit?.id ??
          crypto.randomUUID(),

        type:
          primaryType,

        activityTypes,

        date,

        title:
          title.trim() ||
          generatedTitle ||
          'Garden moment',

        productUsed:
          productUsed
            .trim() ||
          undefined,

        notes:
          notes
            .trim() ||
          undefined,

        growingPlaceScope,

        growingPlaceIds: [
          ...growingPlaceIds,
        ],

        photoUrls: [
          ...photoUrls,
        ],

        plantScope,

        plantStoryIds: [
          ...plantStoryIds,
        ],
      }


    try {
      if (
        isEditing
      ) {
        if (
          !onUpdateEvent
        ) {
          throw new Error(
            'Edit Journal Entry requires onUpdateEvent.',
          )
        }


        onUpdateEvent(
          savedEvent,
        )
      }
      else {
        onAddEvent(
          savedEvent,
        )
      }


      /*
       * Do not rely only on the parent save
       * handler to dismiss the form.
       *
       * Successful Journal save means this
       * page is finished.
       */
      onClose()
    }
    catch (
      error
    ) {
      isSubmittingRef.current =
        false

      setIsSubmitting(
        false,
      )

      throw error
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
        aria-labelledby="add-event-title"
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
                  Sprig has carried the intention
                  into this Journal page. Change
                  anything that happened differently
                  before you save it.
                </p>

                <p className="form-whisper">
                  The Garden Plan will remain as the
                  record of what you intended. This
                  page records what actually happened.
                </p>
              </section>
            )}


            {isEditing && (
              <p className="form-whisper">
                ✏ Change anything that needs correcting.
                Sprig will update this same Journal page,
                not create another one.
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
                  onChange={(
                    event,
                  ) =>
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
                  onChange={(
                    event,
                  ) =>
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
                Change it to the date it actually
                happened.
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


            <section className="journal-connection-section">
              <div className="journal-section-heading">
                <h5>
                  Where did this story unfold?
                </h5>
              </div>


              <div className="scope-card-grid growing-place-scope-grid">
                <SelectionCard
                  title="One Place"
                  icon="🌱"
                  isSelected={
                    growingPlaceScope ===
                    'single'
                  }
                  onClick={() =>
                    chooseGrowingPlaceScope(
                      'single',
                    )
                  }
                />


                <SelectionCard
                  title="Several Places"
                  icon="🌿"
                  isSelected={
                    growingPlaceScope ===
                    'multiple'
                  }
                  onClick={() =>
                    chooseGrowingPlaceScope(
                      'multiple',
                    )
                  }
                />


                <SelectionCard
                  title="Whole Garden"
                  icon="🌳"
                  isSelected={
                    growingPlaceScope ===
                    'entire-garden'
                  }
                  onClick={() =>
                    chooseGrowingPlaceScope(
                      'entire-garden',
                    )
                  }
                />
              </div>


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
                  onToggleValue={(
                    id,
                  ) => {
                    if (
                      growingPlaceScope ===
                      'single'
                    ) {
                      setGrowingPlaceIds(
                        [
                          id,
                        ],
                      )

                      setIsGrowingPlacePickerOpen(
                        false,
                      )

                      return
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
                    )
                  }}
                />
              )}
            </section>


            <section className="journal-connection-section">
              <div className="journal-section-heading">
                <h5>
                  Which plants were involved?
                </h5>
              </div>


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
                <SprigPicker
                  title="Choose Plant"
                  variant="label"
                  emptySummary="Choose a Plant"
                  options={
                    sortedAvailablePlants.map(
                      plant => {
                        const growingPlace =
                          growingPlaces.find(
                            place =>
                              place.id ===
                              plant.currentGrowingPlaceId,
                          )


                        return {
                          value:
                            plant.id,

                          label:
                            plant.displayName,

                          subtitle:
                            growingPlace
                              ? growingPlace.name
                              : 'No Growing Place',

                          meta:
                            plant.plantedDate
                              ? `Planted ${new Date(
                                  `${plant.plantedDate}T00:00:00`,
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
                        }
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
                  onToggleValue={(
                    id,
                  ) => {
                    if (
                      plantScope ===
                      'single'
                    ) {
                      setPlantStoryIds(
                        [
                          id,
                        ],
                      )

                      setIsPlantPickerOpen(
                        false,
                      )

                      return
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
                    )
                  }}
                />
              )}
            </section>


            <label>
              What did you use?

              <input
                value={
                  productUsed
                }
                onChange={(
                  event,
                ) =>
                  setProductUsed(
                    event.target.value,
                  )
                }
                placeholder="Seasol, PowerFeed, Blood & Bone..."
              />
            </label>


            <label>
              Notes to the story

              <textarea
                rows={
                  5
                }
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
              />
            </label>


            {isRecordingPlan &&
              planToRecord?.notes && (
              <p className="form-whisper">
                Your Plan note was carried across
                as a starting point. Rewrite it if
                reality needs different wording.
              </p>
            )}


            <SprigPhotoPicker
              photoUrls={
                photoUrls
              }

              onChange={
                setPhotoUrls
              }

              title="Photographs"

              helperText="Tuck garden photographs into this page so Sprig can remember what this moment looked like."

              addButtonText="Add journal photographs"

              photoAltPrefix="Journal photograph"

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
                  Saving this page creates a real
                  Journal record. Sprig will then
                  link it back to the Garden Plan
                  rather than replacing the Plan.
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
        </div>
      </section>
    </div>
  )
}