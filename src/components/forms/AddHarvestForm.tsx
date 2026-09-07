import {
  useRef,
  useState,
  type FormEvent,
} from 'react'

import SprigPicker from '../sprig/SprigPicker'
import SprigPhotoPicker from '../photos/SprigPhotoPicker'

import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'

import type {
  GardenPlan,
  GrowingPlace,
  HarvestMeasurementUnit,
  HarvestPlantOutcome,
  HarvestQuality,
  HarvestRecord,
  HarvestType,
  PlantStory,
  SprigPhotoMetadata,
} from '../../types'


interface AddHarvestFormProps {
  plants: PlantStory[]

  growingPlaces: GrowingPlace[]

  harvest?: HarvestRecord | null

  initialPlantStoryIds?: string[]

  /*
   * Optional source intention.
   *
   * This Harvest remains its own real record.
   */
  planToRecord?: GardenPlan

  onSaveHarvest: (
    harvest: HarvestRecord,
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
   HARVEST TYPE OPTIONS
======================================= */

const HARVEST_TYPE_OPTIONS = [
  {
    value:
      'first',

    label:
      'First harvest',

    subtitle:
      'The first picking from this growing story',
  },
  {
    value:
      'regular',

    label:
      'Regular harvest',

    subtitle:
      'One of several pickings along the way',
  },
  {
    value:
      'main',

    label:
      'Main harvest',

    subtitle:
      'The main crop or primary harvest',
  },
  {
    value:
      'secondary',

    label:
      'Secondary harvest',

    subtitle:
      'More gathered after the main harvest',
  },
  {
    value:
      'final',

    label:
      'Final harvest',

    subtitle:
      'The last harvest from this growing story',
  },
  {
    value:
      'other',

    label:
      'Something else',

    subtitle:
      'Give this kind of harvest your own wording',
  },
]


/* =======================================
   MEASUREMENT UNIT OPTIONS
======================================= */

const MEASUREMENT_UNIT_OPTIONS = [
  {
    value:
      'gram',

    label:
      'Grams',
  },
  {
    value:
      'kilogram',

    label:
      'Kilograms',
  },
  {
    value:
      'millilitre',

    label:
      'Millilitres',
  },
  {
    value:
      'litre',

    label:
      'Litres',
  },
  {
    value:
      'centimetre',

    label:
      'Centimetres',
  },
  {
    value:
      'inch',

    label:
      'Inches',
  },
  {
    value:
      'bunch',

    label:
      'Bunches',
  },
  {
    value:
      'handful',

    label:
      'Handfuls',
  },
  {
    value:
      'basket',

    label:
      'Baskets',
  },
  {
    value:
      'container',

    label:
      'Containers',
  },
  {
    value:
      'other',

    label:
      'Something else',
  },
]


/* =======================================
   PLANT OUTCOME OPTIONS
======================================= */

const PLANT_OUTCOME_OPTIONS = [
  {
    value:
      'still-producing',

    label:
      'Still producing',

    subtitle:
      'More harvests are likely to come',
  },
  {
    value:
      'more-expected',

    label:
      'More expected',

    subtitle:
      'This harvest is only part of the story',
  },
  {
    value:
      'main-harvest-complete',

    label:
      'Main harvest complete',

    subtitle:
      'The main crop is gathered, but there may still be more',
  },
  {
    value:
      'finished',

    label:
      'Finished',

    subtitle:
      'This growing story has finished producing',
  },
  {
    value:
      'no-change',

    label:
      'No change',

    subtitle:
      'Leave the plant story as it is',
  },
  {
    value:
      'not-sure',

    label:
      'Not sure yet',

    subtitle:
      'Let the garden show us what happens next',
  },
  {
    value:
      'other',

    label:
      'Something else',

    subtitle:
      'Describe what happens next in your own words',
  },
]


/* =======================================
   QUALITY OPTIONS
======================================= */

const QUALITY_OPTIONS = [
  {
    value:
      'poor',

    label:
      'Poor',
  },
  {
    value:
      'fair',

    label:
      'Fair',
  },
  {
    value:
      'good',

    label:
      'Good',
  },
  {
    value:
      'excellent',

    label:
      'Excellent',
  },
]


/* =======================================
   PHOTO METADATA
======================================= */

function getStartingPhotoMetadata(
  harvest:
    HarvestRecord |
    null,
): (
  SprigPhotoMetadata |
  undefined
)[] {
  const photoUrls =
    harvest?.photoUrls ??
    []


  return photoUrls.map(
    (
      photoUrl,
      index,
    ) => {
      const existing =
        harvest
          ?.photoMetadata?.[
            index
          ]


      return {
        ...existing,

        photoUrl:
          existing
            ?.photoUrl ??
          photoUrl,

        /*
         * Harvest photographs are strongly
         * contextualised by the Harvest date.
         *
         * Older photographs use that as their
         * starting photo date.
         */
        photoDate:
          existing
            ?.photoDate ??
          harvest?.date,

        purpose:
          existing
            ?.purpose ??
          'harvest',
      }
    },
  )
}


/* =======================================
   HARVEST FORM
======================================= */

export default function AddHarvestForm({
  plants,
  growingPlaces,
  harvest = null,
  initialPlantStoryIds = [],
  planToRecord,
  onSaveHarvest,
  onClose,
}: AddHarvestFormProps) {
  const today =
    getTodayDate()


  const isEditing =
    harvest !==
    null


  const isRecordingPlan =
    !isEditing &&
    Boolean(
      planToRecord,
    )


  /*
   * Hard submission gate protects phone
   * users from accidental double records.
   */
  const isSubmittingRef =
    useRef(false)


  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    )


  /*
   * When a new Harvest is opened directly
   * from one Plant Story, Sprig already knows
   * the relationship.
   */
  const isFixedPlantContext =
    !isEditing &&
    !isRecordingPlan &&
    initialPlantStoryIds.length ===
      1


  const startingPlantIds =
    isRecordingPlan
      ? (
          planToRecord
            ?.plantStoryIds ??
          []
        )
      : initialPlantStoryIds


  /* =======================================
     DATE
  ======================================= */

  const [
    date,
    setDate,
  ] =
    useState(
      harvest?.date ??
      planToRecord?.date ??
      today,
    )


  /* =======================================
     PLANT PICKER
  ======================================= */

  const [
    plantStoryIds,
    setPlantStoryIds,
  ] =
    useState<string[]>(
      harvest?.plantStoryIds ??
      startingPlantIds,
    )


  const [
    isPlantPickerOpen,
    setIsPlantPickerOpen,
  ] =
    useState(
      true,
    )


  /* =======================================
     HARVEST TYPE
  ======================================= */

  const [
    harvestType,
    setHarvestType,
  ] =
    useState<
      HarvestType |
      undefined
    >(
      harvest?.harvestType,
    )


  const [
    customHarvestTypeLabel,
    setCustomHarvestTypeLabel,
  ] =
    useState(
      harvest?.customHarvestTypeLabel ??
      '',
    )


  const [
    isHarvestTypePickerOpen,
    setIsHarvestTypePickerOpen,
  ] =
    useState(
      false,
    )


  /* =======================================
     AMOUNT
  ======================================= */

  const [
    count,
    setCount,
  ] =
    useState(
      harvest?.count !==
        undefined
        ? String(
            harvest.count,
          )
        : '',
    )


  const [
    measurementAmount,
    setMeasurementAmount,
  ] =
    useState(
      harvest?.measurementAmount !==
        undefined
        ? String(
            harvest.measurementAmount,
          )
        : '',
    )


  const [
    measurementUnit,
    setMeasurementUnit,
  ] =
    useState<
      HarvestMeasurementUnit |
      undefined
    >(
      harvest?.measurementUnit,
    )


  const [
    customMeasurementUnitLabel,
    setCustomMeasurementUnitLabel,
  ] =
    useState(
      harvest?.customMeasurementUnitLabel ??
      '',
    )


  const [
    isMeasurementPickerOpen,
    setIsMeasurementPickerOpen,
  ] =
    useState(
      false,
    )


  /* =======================================
     PLANT OUTCOME
  ======================================= */

  const [
    plantOutcome,
    setPlantOutcome,
  ] =
    useState<
      HarvestPlantOutcome |
      undefined
    >(
      harvest?.plantOutcome,
    )


  const [
    customPlantOutcomeLabel,
    setCustomPlantOutcomeLabel,
  ] =
    useState(
      harvest?.customPlantOutcomeLabel ??
      '',
    )


  const [
    isPlantOutcomePickerOpen,
    setIsPlantOutcomePickerOpen,
  ] =
    useState(
      false,
    )


  /* =======================================
     QUALITY
  ======================================= */

  const [
    quality,
    setQuality,
  ] =
    useState<
      HarvestQuality |
      undefined
    >(
      harvest?.quality,
    )


  const [
    isQualityPickerOpen,
    setIsQualityPickerOpen,
  ] =
    useState(
      false,
    )


  /* =======================================
     NOTES
  ======================================= */

  const [
    notes,
    setNotes,
  ] =
    useState(
      harvest?.notes ??
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
          harvest?.photoUrls ??
          []
        ),
      ],
    )


  const [
    photoMetadata,
    setPhotoMetadata,
  ] =
    useState<
      (
        SprigPhotoMetadata |
        undefined
      )[]
    >(
      getStartingPhotoMetadata(
        harvest,
      ),
    )


  /* =======================================
     PLANT OPTIONS
  ======================================= */

  const sortedPlants =
    [
      ...plants,
    ].sort(
      (
        first,
        second,
      ) =>
        first.displayName.localeCompare(
          second.displayName,
        ),
    )


  const plantOptions =
    sortedPlants.map(
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


  const fixedPlant =
    isFixedPlantContext
      ? plants.find(
          plant =>
            plant.id ===
            initialPlantStoryIds[
              0
            ],
        )
      : undefined


  const fixedPlantGrowingPlace =
    fixedPlant
      ? growingPlaces.find(
          place =>
            place.id ===
            fixedPlant
              .currentGrowingPlaceId,
        )
      : undefined


  /* =======================================
     TOGGLES
  ======================================= */

  function togglePlant(
    plantId:
      string,
  ) {
    setPlantStoryIds(
      current =>
        current.includes(
          plantId,
        )
          ? current.filter(
              id =>
                id !==
                plantId,
            )
          : [
              ...current,
              plantId,
            ],
    )
  }


  function toggleHarvestType(
    value:
      string,
  ) {
    const nextType =
      value as
        HarvestType


    setHarvestType(
      current =>
        current ===
          nextType
          ? undefined
          : nextType,
    )


    if (
      nextType !==
      'other'
    ) {
      setCustomHarvestTypeLabel(
        '',
      )
    }


    setIsHarvestTypePickerOpen(
      false,
    )
  }


  function toggleMeasurementUnit(
    value:
      string,
  ) {
    const nextUnit =
      value as
        HarvestMeasurementUnit


    setMeasurementUnit(
      current =>
        current ===
          nextUnit
          ? undefined
          : nextUnit,
    )


    if (
      nextUnit !==
      'other'
    ) {
      setCustomMeasurementUnitLabel(
        '',
      )
    }


    setIsMeasurementPickerOpen(
      false,
    )
  }


  function togglePlantOutcome(
    value:
      string,
  ) {
    const nextOutcome =
      value as
        HarvestPlantOutcome


    setPlantOutcome(
      current =>
        current ===
          nextOutcome
          ? undefined
          : nextOutcome,
    )


    if (
      nextOutcome !==
      'other'
    ) {
      setCustomPlantOutcomeLabel(
        '',
      )
    }


    setIsPlantOutcomePickerOpen(
      false,
    )
  }


  function toggleQuality(
    value:
      string,
  ) {
    const nextQuality =
      value as
        HarvestQuality


    setQuality(
      current =>
        current ===
          nextQuality
          ? undefined
          : nextQuality,
    )


    setIsQualityPickerOpen(
      false,
    )
  }


  /* =======================================
     SAVE HARVEST
  ======================================= */

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()


    if (
      isSubmittingRef.current
    ) {
      return
    }


    if (
      plantStoryIds.length ===
      0
    ) {
      window.alert(
        'Choose at least one Plant Story for this harvest.',
      )

      return
    }


    isSubmittingRef.current =
      true

    setIsSubmitting(
      true,
    )


    const numericCount =
      count.trim()
        ? Number(
            count,
          )
        : undefined


    const numericMeasurementAmount =
      measurementAmount.trim()
        ? Number(
            measurementAmount,
          )
        : undefined


    const savedPhotoMetadata =
      photoUrls.map(
        (
          photoUrl,
          index,
        ) => {
          const metadata =
            photoMetadata[
              index
            ]


          return {
            ...metadata,

            photoUrl:
              metadata
                ?.photoUrl ??
              photoUrl,

            photoDate:
              metadata
                ?.photoDate ??
              date,

            purpose:
              metadata
                ?.purpose ??
              'harvest',
          } satisfies SprigPhotoMetadata
        },
      )


    const savedHarvest:
      HarvestRecord = {
        id:
          harvest?.id ??
          crypto.randomUUID(),

        plantStoryIds:
          [
            ...plantStoryIds,
          ],

        date,

        harvestType,

        customHarvestTypeLabel:
          harvestType ===
            'other'
            ? (
                customHarvestTypeLabel
                  .trim() ||
                undefined
              )
            : undefined,

        count:
          numericCount !==
            undefined &&
          Number.isFinite(
            numericCount,
          )
            ? numericCount
            : undefined,

        measurementAmount:
          numericMeasurementAmount !==
            undefined &&
          Number.isFinite(
            numericMeasurementAmount,
          )
            ? numericMeasurementAmount
            : undefined,

        measurementUnit,

        customMeasurementUnitLabel:
          measurementUnit ===
            'other'
            ? (
                customMeasurementUnitLabel
                  .trim() ||
                undefined
              )
            : undefined,

        plantOutcome,

        customPlantOutcomeLabel:
          plantOutcome ===
            'other'
            ? (
                customPlantOutcomeLabel
                  .trim() ||
                undefined
              )
            : undefined,

        quality,

        notes:
          notes.trim() ||
          undefined,

        photoUrls:
          [
            ...photoUrls,
          ],

        photoMetadata:
          savedPhotoMetadata,

        createdAt:
          harvest?.createdAt ??
          today,

        updatedAt:
          isEditing
            ? new Date()
                .toISOString()
            : undefined,
      }


    try {
      onSaveHarvest(
        savedHarvest,
      )
    }
    catch (
      error
    ) {
      console.error(
        'Unable to save Harvest:',
        error,
      )


      isSubmittingRef.current =
        false

      setIsSubmitting(
        false,
      )
    }
  }


  return (
    <div className="form-backdrop">
      <section
        className="add-plant-panel chronicle-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-harvest-title"
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
            id="add-harvest-title"
            className="notebook-page-title"
          >
            {isEditing
              ? 'Edit Harvest'
              : isRecordingPlan
                ? 'Record what happened'
                : 'Gather a Harvest'}
          </h2>


          <button
            type="button"
            className="close-button"
            onClick={
              onClose
            }
            aria-label="Close Harvest form"
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
                    Sprig has carried across the
                    Plant Stories, planned date and
                    notes.
                  </p>

                  <p className="form-whisper">
                    Change anything that happened
                    differently. The Plan stays as
                    intention; this Harvest becomes
                    reality.
                  </p>
                </section>
              )}


            {!isRecordingPlan && (
              <p className="form-whisper">
                🧺{' '}
                {isEditing
                  ? 'Tend the details Sprig remembers about this harvest.'
                  : 'Tuck this gathering into Sprig’s harvest story.'}
              </p>
            )}


            {/* =======================================
                PLANT CONTEXT
            ======================================= */}

            {isFixedPlantContext ? (
              <section className="sprig-form-section growing-setup-details">
                <p className="section-label">
                  Harvesting from
                </p>

                <h3>
                  {fixedPlant
                    ?.displayName ??
                    'This Plant Story'}
                </h3>

                {fixedPlantGrowingPlace && (
                  <p className="form-whisper">
                    🌿{' '}
                    {fixedPlantGrowingPlace.name}
                  </p>
                )}

                <p className="form-whisper">
                  Sprig already knows which Plant
                  Story you came from, so there is
                  nothing else to choose here.
                </p>
              </section>
            ) : (
              <section className="sprig-form-section">
                <SprigPicker
                  title="What did you gather from?"
                  variant="label"
                  emptySummary="Choose at least one Plant Story"
                  options={
                    plantOptions
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
                  onToggleValue={
                    togglePlant
                  }
                />

                <p className="form-whisper">
                  Choose several plants when the
                  harvest was gathered together and
                  cannot sensibly be divided between
                  them.
                </p>
              </section>
            )}


            {/* =======================================
                HARVEST DATE
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                When did you gather it?

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
                  required
                />
              </label>

              {isRecordingPlan && (
                <p className="form-whisper">
                  This began with your planned date.
                  Change it to the actual harvest date.
                </p>
              )}
            </section>


            {/* =======================================
                HARVEST TYPE
            ======================================= */}

            <section className="sprig-form-section">
              <SprigPicker
                title="What kind of harvest was this?"
                emptySummary="Choose what this harvest meant"
                options={
                  HARVEST_TYPE_OPTIONS
                }
                selectedValues={
                  harvestType
                    ? [
                        harvestType,
                      ]
                    : []
                }
                isOpen={
                  isHarvestTypePickerOpen
                }
                onToggleOpen={() =>
                  setIsHarvestTypePickerOpen(
                    current =>
                      !current,
                  )
                }
                onToggleValue={
                  toggleHarvestType
                }
              />


              {harvestType ===
                'other' && (
                <label>
                  What would you call it?

                  <input
                    type="text"
                    value={
                      customHarvestTypeLabel
                    }
                    onChange={(
                      event,
                    ) =>
                      setCustomHarvestTypeLabel(
                        event.target.value,
                      )
                    }
                    placeholder="Side shoots, baby leaves, seed harvest..."
                  />
                </label>
              )}
            </section>


            {/* =======================================
                AMOUNT
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <p className="section-label">
                How much came in?
              </p>

              <p className="form-whisper">
                Use a count, a measurement, or both.
                Four tomatoes weighing 820 g can keep
                both pieces of information.
              </p>


              <div className="form-row">
                <label>
                  Count

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      count
                    }
                    onChange={(
                      event,
                    ) =>
                      setCount(
                        event.target.value,
                      )
                    }
                    placeholder="Optional"
                  />
                </label>


                <label>
                  Measurement

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      measurementAmount
                    }
                    onChange={(
                      event,
                    ) =>
                      setMeasurementAmount(
                        event.target.value,
                      )
                    }
                    placeholder="Optional"
                  />
                </label>
              </div>


              <SprigPicker
                title="Measurement unit"
                emptySummary="Choose a unit if you measured it"
                options={
                  MEASUREMENT_UNIT_OPTIONS
                }
                selectedValues={
                  measurementUnit
                    ? [
                        measurementUnit,
                      ]
                    : []
                }
                isOpen={
                  isMeasurementPickerOpen
                }
                onToggleOpen={() =>
                  setIsMeasurementPickerOpen(
                    current =>
                      !current,
                  )
                }
                onToggleValue={
                  toggleMeasurementUnit
                }
              />


              {measurementUnit ===
                'other' && (
                <label>
                  Your measurement unit

                  <input
                    type="text"
                    value={
                      customMeasurementUnitLabel
                    }
                    onChange={(
                      event,
                    ) =>
                      setCustomMeasurementUnitLabel(
                        event.target.value,
                      )
                    }
                    placeholder="Tray, bowl, punnet..."
                  />
                </label>
              )}
            </section>


            {/* =======================================
                OUTCOME
            ======================================= */}

            <section className="sprig-form-section">
              <SprigPicker
                title="What happens to the plant now?"
                emptySummary="Choose only if it helps tell the story"
                options={
                  PLANT_OUTCOME_OPTIONS
                }
                selectedValues={
                  plantOutcome
                    ? [
                        plantOutcome,
                      ]
                    : []
                }
                isOpen={
                  isPlantOutcomePickerOpen
                }
                onToggleOpen={() =>
                  setIsPlantOutcomePickerOpen(
                    current =>
                      !current,
                  )
                }
                onToggleValue={
                  togglePlantOutcome
                }
              />


              {plantOutcome ===
                'other' && (
                <label>
                  What happens next?

                  <input
                    type="text"
                    value={
                      customPlantOutcomeLabel
                    }
                    onChange={(
                      event,
                    ) =>
                      setCustomPlantOutcomeLabel(
                        event.target.value,
                      )
                    }
                    placeholder="Describe it in your own words"
                  />
                </label>
              )}
            </section>


            {/* =======================================
                QUALITY
            ======================================= */}

            <section className="sprig-form-section">
              <SprigPicker
                title="How was the harvest?"
                emptySummary="Leave unrated or choose a quality"
                options={
                  QUALITY_OPTIONS
                }
                selectedValues={
                  quality
                    ? [
                        quality,
                      ]
                    : []
                }
                isOpen={
                  isQualityPickerOpen
                }
                onToggleOpen={() =>
                  setIsQualityPickerOpen(
                    current =>
                      !current,
                  )
                }
                onToggleValue={
                  toggleQuality
                }
              />
            </section>


            {/* =======================================
                NOTES
            ======================================= */}

            <section className="sprig-form-section growing-setup-details">
              <label>
                Notes to the harvest

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
                  placeholder="Size, flavour, condition, anything surprising, what future you would like to remember..."
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

              photoMetadata={
                photoMetadata
              }

              onPhotoMetadataChange={
                setPhotoMetadata
              }

              showPhotoContext

              defaultNewPhotosToToday={
                true
              }

              title="Harvest photographs"

              helperText="Add photographs naturally. Sprig already knows the Harvest, its Plant Stories and its date. Any extra photograph details are optional."

              addButtonText="Add harvest photographs"

              photoAltPrefix="Harvest photograph"

              photoDateLabel="When was this photograph taken?"

              photoDateHelperText="This begins with today for new photographs. Change it if the photograph was taken on another day."

              maxPhotos={
                12
              }
            />


            {/* =======================================
                ACTIONS
            ======================================= */}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={
                  isSubmitting
                }
                onClick={
                  onClose
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
              >
                {isSubmitting
                  ? 'Saving…'
                  : isEditing
                    ? 'Save harvest changes'
                    : 'Gather this harvest'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}