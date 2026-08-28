import {
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
    return new Date()
      .toISOString()
      .slice(
        0,
        10,
      )
  }
  
  
  /* =======================================
     HARVEST TYPE OPTIONS
  ======================================= */
  
  const HARVEST_TYPE_OPTIONS = [
    {
      value: 'first',
      label: 'First harvest',
      subtitle:
        'The first picking from this growing story',
    },
    {
      value: 'regular',
      label: 'Regular harvest',
      subtitle:
        'One of several pickings along the way',
    },
    {
      value: 'main',
      label: 'Main harvest',
      subtitle:
        'The main crop or primary harvest',
    },
    {
      value: 'secondary',
      label: 'Secondary harvest',
      subtitle:
        'More gathered after the main harvest',
    },
    {
      value: 'final',
      label: 'Final harvest',
      subtitle:
        'The last harvest from this growing story',
    },
    {
      value: 'other',
      label: 'Something else',
      subtitle:
        'Give this kind of harvest your own wording',
    },
  ]
  
  
  /* =======================================
     MEASUREMENT UNIT OPTIONS
  ======================================= */
  
  const MEASUREMENT_UNIT_OPTIONS = [
    {
      value: 'gram',
      label: 'Gram',
    },
    {
      value: 'kilogram',
      label: 'Kilogram',
    },
    {
      value: 'millilitre',
      label: 'Millilitre',
    },
    {
      value: 'litre',
      label: 'Litre',
    },
    {
      value: 'bunch',
      label: 'Bunch',
    },
    {
      value: 'handful',
      label: 'Handful',
    },
    {
      value: 'basket',
      label: 'Basket',
    },
    {
      value: 'container',
      label: 'Container',
    },
    {
      value: 'other',
      label: 'Something else',
    },
  ]
  
  
  /* =======================================
     PLANT OUTCOME OPTIONS
  ======================================= */
  
  const PLANT_OUTCOME_OPTIONS = [
    {
      value: 'still-producing',
      label: 'Still producing',
      subtitle:
        'More harvests are likely to come',
    },
    {
      value: 'more-expected',
      label: 'More expected',
      subtitle:
        'This harvest is only part of the story',
    },
    {
      value: 'main-harvest-complete',
      label: 'Main harvest complete',
      subtitle:
        'The main crop is gathered, but there may still be more',
    },
    {
      value: 'finished',
      label: 'Finished',
      subtitle:
        'This growing story has finished producing',
    },
    {
      value: 'no-change',
      label: 'No change',
      subtitle:
        'Leave the plant story as it is',
    },
    {
      value: 'not-sure',
      label: 'Not sure yet',
      subtitle:
        'Let the garden show us what happens next',
    },
    {
      value: 'other',
      label: 'Something else',
      subtitle:
        'Describe what happens next in your own words',
    },
  ]
  
  
  /* =======================================
     QUALITY OPTIONS
  ======================================= */
  
  const QUALITY_OPTIONS = [
    {
      value: 'poor',
      label: 'Poor',
    },
    {
      value: 'fair',
      label: 'Fair',
    },
    {
      value: 'good',
      label: 'Good',
    },
    {
      value: 'excellent',
      label: 'Excellent',
    },
  ]
  
  
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
        harvest?.photoUrls ??
        [],
      )
  
  
    /* =======================================
       PLANT OPTIONS
    ======================================= */
  
    const sortedPlants = [
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
  
  
    function togglePlant(
      plantId: string,
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
      value: string,
    ) {
      const nextType =
        value as HarvestType
  
  
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
      value: string,
    ) {
      const nextUnit =
        value as HarvestMeasurementUnit
  
  
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
      value: string,
    ) {
      const nextOutcome =
        value as HarvestPlantOutcome
  
  
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
      value: string,
    ) {
      const nextQuality =
        value as HarvestQuality
  
  
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
        plantStoryIds.length ===
        0
      ) {
        window.alert(
          'Choose at least one Plant Story for this harvest.',
        )
  
        return
      }
  
  
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
  
  
      const savedHarvest:
        HarvestRecord = {
          id:
            harvest?.id ??
            crypto.randomUUID(),
  
          plantStoryIds,
  
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
  
          photoUrls,
  
          createdAt:
            harvest?.createdAt ??
            today,
  
          updatedAt:
            isEditing
              ? today
              : undefined,
        }
  
  
      onSaveHarvest(
        savedHarvest,
      )
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
                    Sprig has carried across the Plant
                    Stories, planned date and notes.
                    Change anything that happened
                    differently before saving.
                  </p>
  
                  <p className="form-whisper">
                    The Plan stays as the intention.
                    This Harvest Record becomes reality.
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
                  Choose several plants when
                  the harvest was gathered
                  together and cannot sensibly
                  be divided between them.
                </p>
              </section>
  
  
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
                    What would you call this harvest?
  
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
  
  
              <section className="sprig-form-section growing-setup-details">
                <p className="section-label">
                  How much came in?
                </p>
  
  
                <label>
                  How many?
  
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
                    placeholder="4"
                  />
                </label>
  
  
                <p className="form-whisper">
                  Useful for things you naturally
                  count, such as tomatoes,
                  cucumbers, broccoli heads or
                  potatoes.
                </p>
  
  
                <label>
                  Measured amount
  
                  <input
                    type="number"
                    min="0"
                    step="any"
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
                    placeholder="820"
                  />
                </label>
  
  
                <SprigPicker
                  title="How was that amount measured?"
                  emptySummary="Choose a measure"
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
                    Your measure
  
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
                      placeholder="Punnet, bowl, handful of sprigs..."
                    />
                  </label>
                )}
  
  
                <p className="form-whisper">
                  You can record both. For
                  example: 4 tomatoes weighing
                  820 grams.
                </p>
              </section>
  
  
              <section className="sprig-form-section">
                <SprigPicker
                  title="What happens from here?"
                  emptySummary="Choose what this means for the plant"
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
                      placeholder="Waiting for side shoots, leaving roots in place..."
                    />
                  </label>
                )}
  
  
                <p className="form-whisper">
                  This records what this harvest
                  means without automatically
                  ending or changing the Plant
                  Story.
                </p>
              </section>
  
  
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
  
  
              <SprigPhotoPicker
                photoUrls={
                  photoUrls
                }
  
                onChange={
                  setPhotoUrls
                }
  
                title="Harvest photographs"
  
                helperText="Tuck photographs of what came in from the garden into this harvest."
  
                addButtonText="Add harvest photographs"
  
                photoAltPrefix="Harvest photograph"
  
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
                    Saving creates a separate Harvest
                    Record. Sprig will link it back to
                    the Plan after the Harvest saves.
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
                  {isEditing
                    ? 'Save harvest changes'
                    : isRecordingPlan
                      ? 'Record this harvest'
                      : 'Gather this harvest'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    )
  }