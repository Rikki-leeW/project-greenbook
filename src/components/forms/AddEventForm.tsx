import {
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

  onClose: () => void
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


export default function AddEventForm({
  plantId,
  plants,
  growingPlaces,
  planToRecord,
  onAddEvent,
  onClose,
}: AddEventFormProps) {
  const today =
    new Date()
      .toISOString()
      .slice(
        0,
        10,
      )


  const isRecordingPlan =
    Boolean(
      planToRecord,
    )


  /* =======================================
     ORIGINATING PLANT
  ======================================= */

  const startingPlant =
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


  /* =======================================
     ACTIVITY
  ======================================= */

  const [
    activityTypes,
    setActivityTypes,
  ] =
    useState<EventType[]>(
      plannedActivity
        ? [
            plannedActivity,
          ]
        : [],
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
      planToRecord?.date ??
      today,
    )


  const [
    title,
    setTitle,
  ] =
    useState(
      planToRecord?.title ??
      '',
    )


  const [
    productUsed,
    setProductUsed,
  ] =
    useState('')


  const [
    notes,
    setNotes,
  ] =
    useState(
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
      [],
    )


  /* =======================================
     GROWING PLACE SCOPE
  ======================================= */

  const [
    growingPlaceScope,
    setGrowingPlaceScope,
  ] =
    useState<GrowingPlaceScope>(
      isRecordingPlan
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
      isRecordingPlan
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
      isRecordingPlan
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
      isRecordingPlan
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
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()


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


    const newEvent:
      GardenEvent = {
        id:
          crypto.randomUUID(),

        type:
          primaryType,

        activityTypes,

        date,

        title:
          title.trim() ||
          generatedTitle,

        productUsed:
          productUsed
            .trim() ||
          undefined,

        notes:
          notes
            .trim() ||
          undefined,

        growingPlaceScope,

        growingPlaceIds,

        photoUrls,

        plantScope,

        plantStoryIds,
      }


    onAddEvent(
      newEvent,
    )
  }


  return (
    <div className="form-backdrop">
      <section
        className="add-plant-panel chronicle-panel"
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
            {isRecordingPlan
              ? 'Record what happened'
              : 'Journal Entry'}
          </h2>


          <button
            type="button"
            className="close-button"
            onClick={
              onClose
            }
          >
            ×
          </button>


          <form
            className="add-plant-form"
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
                {isRecordingPlan
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