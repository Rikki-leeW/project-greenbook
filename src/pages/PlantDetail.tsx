import {
  useLayoutEffect,
  useState,
} from 'react'

import GardenLayout from '../components/layout/GardenLayout'
import AddPlantForm from '../components/forms/AddPlantForm'

import SprigPhotoGallery from '../components/photos/SprigPhotoGallery'
import SprigPhotoPicker from '../components/photos/SprigPhotoPicker'

import SprigQuickPeek from '../components/common/SprigQuickPeek'

import type {
  GardenEvent,
  GrowingPlace,
  GrowingSetup,
  Ingredient,
  PlantOriginType,
  PlantStory,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface PlantDetailProps {
  plant: PlantStory

  growingPlaces: GrowingPlace[]

  growingSetups: GrowingSetup[]

  ingredients: Ingredient[]

  events: GardenEvent[]

  onBack: () => void

  onNavigate: (
    page: AppPage,
  ) => void

  onOpenGrowingPlace: (
    growingPlaceId: string,
  ) => void


  onOpenJournalEntry: (
    eventId: string,
  ) => void


  onAddEvent: () => void

  onAddPlant: (
    plant: PlantStory,
  ) => void

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

  onDeleteEvent: (
    eventId: string,
  ) => void

  onDeletePlant: (
    plantId: string,
  ) => void

  onUpdatePlant: (
    plant: PlantStory,
  ) => void
}


/* =======================================
   GENERAL LABEL
======================================= */

function formatLabel(
  value: string,
): string {
  return value
    .replaceAll(
      '-',
      ' ',
    )
    .replace(
      /\b\w/g,
      (
        letter,
      ) =>
        letter.toUpperCase(),
    )
}


/* =======================================
   DATE
======================================= */

function formatDate(
  date?: string,
): string {
  if (!date) {
    return 'Not recorded'
  }

  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString(
    'en-AU',
    {
      day:
        'numeric',

      month:
        'long',

      year:
        'numeric',
    },
  )
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
   START METHOD
======================================= */

function getStartMethodLabel(
  plant: PlantStory,
): string {
  if (
    plant.startMethod ===
      'other' &&
    plant.customStartMethodLabel
  ) {
    return plant.customStartMethodLabel
  }

  return formatLabel(
    plant.startMethod,
  )
}


/* =======================================
   PLANT ORIGIN
======================================= */

function getPlantOriginLabel(
  originType?: PlantOriginType,
): string {
  if (!originType) {
    return 'Not recorded'
  }

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
   EVENT EMOJI
======================================= */

function getEventEmoji(
  type: GardenEvent['type'],
): string {
  if (type === 'planted') return '🌱'
  if (type === 'sprouted') return '🌿'
  if (type === 'watered') return '💧'
  if (type === 'fed') return '🧪'
  if (type === 'moved') return '🪴'
  if (type === 'hilled') return '🥔'
  if (type === 'pruned') return '✂️'
  if (type === 'treated') return '🩹'
  if (type === 'weather') return '🌦️'
  if (type === 'observation') return '👀'
  if (type === 'photo') return '📷'
  if (type === 'harvest') return '🧺'
  if (type === 'note') return '📖'

  return '📝'
}


/* =======================================
   HARVEST DATE
======================================= */

function addDaysToDate(
  date: string,
  days: number,
): Date {
  const result =
    new Date(
      `${date}T00:00:00`,
    )

  result.setDate(
    result.getDate() +
      days,
  )

  return result
}


/* =======================================
   EXPORT FILE NAME
======================================= */

function createSafeFileName(
  value: string,
): string {
  return value
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
}


/* =======================================
   PLANT DETAIL
======================================= */

export default function PlantDetail({
  plant,
  growingPlaces,
  growingSetups,
  ingredients,
  events,
  onBack,
  onNavigate,
  onOpenGrowingPlace,
  onOpenJournalEntry,
  onAddEvent,
  onAddPlant,
  onAddGrowingPlace,
  onAddRecipe,
  onAddIngredient,
  onDeleteEvent,
  onDeletePlant,
  onUpdatePlant,
}: PlantDetailProps) {

  /* =======================================
     EDIT / VARIATION
  ======================================= */

  const [
    isEditOpen,
    setIsEditOpen,
  ] =
    useState(false)


  const [
    isVariationOpen,
    setIsVariationOpen,
  ] =
    useState(false)


  /* =======================================
     QUICK PEEK
  ======================================= */

  const [
    isRecipeQuickPeekOpen,
    setIsRecipeQuickPeekOpen,
  ] =
    useState(false)


  /* =======================================
     PHOTO ADDER
  ======================================= */

  const [
    isPhotoQuickAddOpen,
    setIsPhotoQuickAddOpen,
  ] =
    useState(false)


  const [
    photoDraft,
    setPhotoDraft,
  ] =
    useState<string[]>(
      plant.photoUrls ??
        [],
    )


  /* =======================================
     OPEN PLANT STORY AT TOP
  ======================================= */

  useLayoutEffect(() => {
    document.body.style.overflow =
      ''

    document.body.style.position =
      ''

    document.body.style.top =
      ''

    document.body.style.width =
      ''

    document.documentElement.style.overflow =
      ''


    function goToTop() {
      const scrollingElement =
        document.scrollingElement


      if (scrollingElement) {
        scrollingElement.scrollTop =
          0

        scrollingElement.scrollLeft =
          0
      }


      document.documentElement.scrollTop =
        0

      document.body.scrollTop =
        0

      window.scrollTo(
        0,
        0,
      )
    }


    goToTop()


    const firstFrame =
      requestAnimationFrame(
        () => {
          const secondFrame =
            requestAnimationFrame(
              () => {
                goToTop()
              },
            )


          return () =>
            cancelAnimationFrame(
              secondFrame,
            )
        },
      )


    return () => {
      cancelAnimationFrame(
        firstFrame,
      )
    }
  }, [plant.id])


  /* =======================================
     CURRENT GROWING PLACE
  ======================================= */

  const currentGrowingPlace =
    plant.currentGrowingPlaceId
      ? growingPlaces.find(
          (
            place,
          ) =>
            place.id ===
            plant.currentGrowingPlaceId,
        )
      : undefined


  /* =======================================
     CURRENT GROWING RECIPE
  ======================================= */

  const currentGrowingSetup =
    plant.currentGrowingSetupId
      ? growingSetups.find(
          (
            setup,
          ) =>
            setup.id ===
            plant.currentGrowingSetupId,
        )
      : undefined


  /* =======================================
     CURRENT RECIPE INGREDIENTS
  ======================================= */

  const currentRecipeIngredients =
    currentGrowingSetup
      ?.ingredientIds
      ?.map(
        (
          ingredientId,
        ) =>
          ingredients.find(
            (
              ingredient,
            ) =>
              ingredient.id ===
              ingredientId,
          ),
      )
      .filter(
        (
          ingredient,
        ): ingredient is Ingredient =>
          Boolean(
            ingredient,
          ),
      ) ??
    []


  /* =======================================
     GROWING TIME
  ======================================= */

  const storyBeginningDate =
    new Date(
      `${plant.plantedDate}T00:00:00`,
    )


  const today =
    new Date()


  const daysGrowing =
    Math.max(
      0,
      Math.floor(
        (
          today.getTime() -
          storyBeginningDate.getTime()
        ) /
          (
            1000 *
            60 *
            60 *
            24
          ),
      ),
    )


  /* =======================================
     EXPECTED HARVEST
  ======================================= */

  const expectedHarvestStart =
    plant.expectedHarvestDaysMin
      ? addDaysToDate(
          plant.plantedDate,
          plant.expectedHarvestDaysMin,
        )
      : undefined


  const expectedHarvestEnd =
    plant.expectedHarvestDaysMax
      ? addDaysToDate(
          plant.plantedDate,
          plant.expectedHarvestDaysMax,
        )
      : undefined


  /* =======================================
     PLANT EVENTS
  ======================================= */

  const plantEvents = [
    ...events,
  ]
    .filter(
      (
        event,
      ) =>
        event.plantStoryIds.length ===
          0 ||
        event.plantStoryIds.includes(
          plant.id,
        ),
    )
    .sort(
      (
        first,
        second,
      ) =>
        new Date(
          second.date,
        ).getTime() -
        new Date(
          first.date,
        ).getTime(),
    )


  /* =======================================
     FAVOURITE
  ======================================= */

  function toggleFavourite() {
    onUpdatePlant({
      ...plant,

      isFavourite:
        !plant.isFavourite,

      updatedAt:
        new Date()
          .toISOString(),
    })
  }


  /* =======================================
     ARCHIVE
  ======================================= */

  function archivePlant() {
    const confirmed =
      window.confirm(
        `Archive "${plant.displayName}"?\n\nSprig will keep the Plant Story, photographs and timeline.`,
      )


    if (!confirmed) {
      return
    }


    onUpdatePlant({
      ...plant,

      isArchived:
        true,

      archivedAt:
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          ),

      updatedAt:
        new Date()
          .toISOString(),
    })
  }


  /* =======================================
     RESTORE
  ======================================= */

  function restorePlant() {
    onUpdatePlant({
      ...plant,

      isArchived:
        false,

      archivedAt:
        undefined,

      updatedAt:
        new Date()
          .toISOString(),
    })
  }


  /* =======================================
     COMPLETE STORY
  ======================================= */

  function completeStory() {
    const confirmed =
      window.confirm(
        `Complete "${plant.displayName}"?\n\nThis keeps the entire Plant Story and marks its growing chapter as finished.`,
      )


    if (!confirmed) {
      return
    }


    onUpdatePlant({
      ...plant,

      status:
        'finished',

      completedAt:
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          ),

      updatedAt:
        new Date()
          .toISOString(),
    })
  }


  /* =======================================
     REOPEN STORY
  ======================================= */

  function reopenStory() {
    onUpdatePlant({
      ...plant,

      status:
        'growing',

      completedAt:
        undefined,

      updatedAt:
        new Date()
          .toISOString(),
    })
  }


  /* =======================================
     PRINT
  ======================================= */

  function printPlantStory() {
    window.print()
  }


  /* =======================================
     EXPORT
  ======================================= */

  function exportPlantStory() {
    const exportRecord = {
      exportedAt:
        new Date()
          .toISOString(),

      plant,

      growingPlace:
        currentGrowingPlace ??
        null,

      growingRecipe:
        currentGrowingSetup ??
        null,

      events:
        plantEvents,
    }


    const blob =
      new Blob(
        [
          JSON.stringify(
            exportRecord,
            null,
            2,
          ),
        ],
        {
          type:
            'application/json',
        },
      )


    const url =
      URL.createObjectURL(
        blob,
      )


    const link =
      document.createElement(
        'a',
      )


    link.href =
      url


    link.download =
      `${
        createSafeFileName(
          plant.displayName,
        ) ||
        'plant-story'
      }-sprig.json`


    document.body
      .appendChild(
        link,
      )


    link.click()

    link.remove()

    URL.revokeObjectURL(
      url,
    )
  }


  /* =======================================
     DELETE
  ======================================= */

  function deletePlantStory() {
    const confirmed =
      window.confirm(
        `Permanently delete "${plant.displayName}"?\n\nThis removes the Plant Story and its linked plant-specific Journal entries.\n\nThis cannot be undone.`,
      )


    if (
      confirmed
    ) {
      onDeletePlant(
        plant.id,
      )
    }
  }


  /* =======================================
     PHOTO ADDER
  ======================================= */

  function openPhotoAdder() {
    setPhotoDraft(
      [
        ...(
          plant.photoUrls ??
          []
        ),
      ],
    )


    setIsPhotoQuickAddOpen(
      true,
    )
  }


  function savePhotos() {
    onUpdatePlant({
      ...plant,

      photoUrls:
        photoDraft,

      updatedAt:
        new Date()
          .toISOString(),
    })


    setIsPhotoQuickAddOpen(
      false,
    )
  }


  return (
    <>
      <GardenLayout
        activePage="plants"
        onNavigate={
          onNavigate
        }
      >
        <div className="plant-story-page">

          {/* =======================================
              HEADER
          ======================================= */}

          <header className="plant-story-header">
            <p className="section-label">
              {plant.plantName} story
            </p>


            <h1>
              {plant.displayName}
            </h1>


            {plant.variety ? (
              <p className="story-personality">
                {plant.plantName}
                {' · '}
                {plant.variety}
              </p>
            ) : (
              <p className="story-personality">
                {plant.personality ??
                  'A story still unfolding'}
              </p>
            )}


            <div className="story-status-row">
              <span className="status-pill">
                {formatLabel(
                  plant.status,
                )}
              </span>


              <span>
                {daysGrowing} days since this story began
              </span>
            </div>


            {plant.isFavourite && (
              <p className="section-label">
                ★ Garden Favourite
              </p>
            )}


            {plant.isArchived && (
              <p className="section-label">
                📦 Resting in Sprig&apos;s archive
              </p>
            )}
          </header>


          {/* =======================================
              RECORD + PLANT ACTIONS
          ======================================= */}

          <section
            className="plant-record-actions"
            aria-label="Plant Story actions"
          >
            <button
              type="button"
              className="secondary-button"
              onClick={
                onBack
              }
            >
              ← Back
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setIsEditOpen(
                  true,
                )
              }
            >
              ✏ Edit
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setIsVariationOpen(
                  true,
                )
              }
            >
              🌱 Create a variation
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={
                toggleFavourite
              }
            >
              {plant.isFavourite
                ? '★ Favourite'
                : '☆ Favourite'}
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={
                openPhotoAdder
              }
            >
              📸 Add photographs
            </button>


            {plant.isArchived ? (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  restorePlant
                }
              >
                🌱 Restore
              </button>
            ) : (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  archivePlant
                }
              >
                📦 Archive
              </button>
            )}


            <button
              type="button"
              className="secondary-button"
              onClick={
                printPlantStory
              }
            >
              🖨 Print
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={
                exportPlantStory
              }
            >
              📤 Export
            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={
                deletePlantStory
              }
            >
              🗑 Delete
            </button>


            <button
  type="button"
  className="secondary-button"
  onClick={
    onAddEvent
  }
>
  📖 Add a moment
</button>


            {plant.status ===
            'finished' ? (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  reopenStory
                }
              >
                🌱 Reopen this story
              </button>
            ) : (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  completeStory
                }
              >
                🍂 Complete story
              </button>
            )}
          </section>


          {/* =======================================
              HOW THIS STORY BEGAN
          ======================================= */}

          <section className="story-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  The beginning
                </p>

                <h2>
                  How this story began
                </h2>
              </div>
            </div>


            <section className="story-information-grid">

              <article className="story-info-card">
                <p className="section-label">
                  Story began
                </p>

                <h2>
                  {formatDate(
                    plant.plantedDate,
                  )}
                </h2>

                <p>
                  Started as{' '}
                  {getStartMethodLabel(
                    plant,
                  )}
                </p>
              </article>


              <article className="story-info-card">
                <p className="section-label">
                  Started with
                </p>

                <h2>
                  {plant.quantity ??
                    1}
                </h2>

                <p>
                  {plant.quantity ===
                  1
                    ? 'One plant or starting piece'
                    : 'Plants or starting pieces growing as one story'}
                </p>
              </article>


              <article className="story-info-card">
                <p className="section-label">
                  Where it came from
                </p>

                <h2>
                  {plant.originType ===
                    'other' &&
                  plant.customOriginLabel
                    ? plant.customOriginLabel
                    : getPlantOriginLabel(
                        plant.originType,
                      )}
                </h2>

                <p>
                  {plant.source
                    ? plant.source
                    : 'No source or place recorded.'}
                </p>
              </article>

            </section>
          </section>


          {/* =======================================
              EARLY JOURNEY
          ======================================= */}

          {(plant.sownDate ||
            plant.plantedOutDate) && (
            <section className="story-section">
              <div className="section-heading">
                <div>
                  <p className="section-label">
                    Early journey
                  </p>

                  <h2>
                    From beginning to garden
                  </h2>
                </div>
              </div>


              <section className="story-information-grid">

                {plant.sownDate && (
                  <article className="story-info-card">
                    <p className="section-label">
                      Sown
                    </p>

                    <h2>
                      {formatDate(
                        plant.sownDate,
                      )}
                    </h2>

                    <p>
                      The first recorded step
                      in this seed-grown story.
                    </p>
                  </article>
                )}


                {plant.plantedOutDate && (
                  <article className="story-info-card">
                    <p className="section-label">
                      Planted out
                    </p>

                    <h2>
                      {formatDate(
                        plant.plantedOutDate,
                      )}
                    </h2>

                    <p>
                      Moved into its planted-out
                      growing stage.
                    </p>
                  </article>
                )}

              </section>
            </section>
          )}


          {/* =======================================
              WHERE IT IS GROWING
          ======================================= */}

          <section className="story-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  Growing now
                </p>

                <h2>
                  Where this story is unfolding
                </h2>
              </div>
            </div>


            <section className="story-information-grid">

              {/* =======================================
                  GROWING PLACE
              ======================================= */}

              {currentGrowingPlace ? (
                <button
                  type="button"
                  className="story-info-card"
                  onClick={() =>
                    onOpenGrowingPlace(
                      currentGrowingPlace.id,
                    )
                  }
                  aria-label={`Open ${currentGrowingPlace.name}`}
                  style={{
                    textAlign:
                      'left',

                    cursor:
                      'pointer',

                    font:
                      'inherit',
                  }}
                >
                  <p className="section-label">
                    Growing Place
                  </p>

                  <h2>
                    {currentGrowingPlace.name}
                  </h2>

                  <p>
                    {currentGrowingPlace.kind ===
                      'other' &&
                    currentGrowingPlace.customKindLabel
                      ? currentGrowingPlace.customKindLabel
                      : formatLabel(
                          currentGrowingPlace.kind,
                        )}
                  </p>

                  <p className="form-whisper">
                    Open this Growing Place →
                  </p>
                </button>
              ) : (
                <article className="story-info-card">
                  <p className="section-label">
                    Growing Place
                  </p>

                  <h2>
                    Place not recorded
                  </h2>

                  <p>
                    This can be added later.
                  </p>
                </article>
              )}


              {/* =======================================
                  GROWING RECIPE QUICK PEEK
              ======================================= */}

              {currentGrowingSetup ? (
                <button
                  type="button"
                  className="story-info-card"
                  onClick={() =>
                    setIsRecipeQuickPeekOpen(
                      true,
                    )
                  }
                  aria-label={`Quick peek at ${currentGrowingSetup.name}`}
                  style={{
                    textAlign:
                      'left',

                    cursor:
                      'pointer',

                    font:
                      'inherit',
                  }}
                >
                  <p className="section-label">
                    Growing Recipe
                  </p>

                  <h2>
                    {currentGrowingSetup.name}
                  </h2>

                  <p>
                    {getGrowingSetupCategoryLabel(
                      currentGrowingSetup,
                    )}
                  </p>

                  <p className="form-whisper">
                    Tap for a quick peek
                  </p>
                </button>
              ) : (
                <article className="story-info-card">
                  <p className="section-label">
                    Growing Recipe
                  </p>

                  <h2>
                    Recipe not recorded
                  </h2>

                  <p>
                    This can be added later.
                  </p>
                </article>
              )}

            </section>
          </section>


          {/* =======================================
              HARVEST EXPECTATION
          ======================================= */}

          {(plant.expectedHarvestDaysMin ||
            plant.expectedHarvestDaysMax) && (
            <section className="story-section">
              <div className="section-heading">
                <div>
                  <p className="section-label">
                    Harvest timing
                  </p>

                  <h2>
                    When this story may begin giving back
                  </h2>
                </div>
              </div>


              <section className="story-information-grid">

                <article className="story-info-card">
                  <p className="section-label">
                    Expected timing
                  </p>

                  <h2>
                    {plant.expectedHarvestDaysMin &&
                    plant.expectedHarvestDaysMax
                      ? `${plant.expectedHarvestDaysMin}–${plant.expectedHarvestDaysMax} days`
                      : plant.expectedHarvestDaysMin
                        ? `From ${plant.expectedHarvestDaysMin} days`
                        : `Around ${plant.expectedHarvestDaysMax} days`}
                  </h2>
                </article>


                {expectedHarvestStart && (
                  <article className="story-info-card">
                    <p className="section-label">
                      Earliest expected
                    </p>

                    <h2>
                      {expectedHarvestStart.toLocaleDateString(
                        'en-AU',
                        {
                          day:
                            'numeric',

                          month:
                            'long',

                          year:
                            'numeric',
                        },
                      )}
                    </h2>
                  </article>
                )}


                {expectedHarvestEnd && (
                  <article className="story-info-card">
                    <p className="section-label">
                      Later edge
                    </p>

                    <h2>
                      {expectedHarvestEnd.toLocaleDateString(
                        'en-AU',
                        {
                          day:
                            'numeric',

                          month:
                            'long',

                          year:
                            'numeric',
                        },
                      )}
                    </h2>
                  </article>
                )}

              </section>
            </section>
          )}


          {/* =======================================
              NOTES
          ======================================= */}

          <section className="story-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  Garden notes
                </p>

                <h2>
                  What you wanted to remember
                </h2>
              </div>
            </div>


            <div className="story-note-card">
              <p>
                {plant.notes ??
                  'No notes yet. This story is waiting for its first observation.'}
              </p>
            </div>
          </section>


          {/* =======================================
              PHOTOGRAPHS
          ======================================= */}

          <section className="story-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  Photographs
                </p>

                <h2>
                  This plant through the seasons
                </h2>
              </div>
            </div>


            <SprigPhotoGallery
              photoUrls={
                plant.photoUrls ??
                []
              }
              title="Plant photographs"
              emptyMessage="No photographs have been tucked into this Plant Story yet."
              photoAltPrefix={`${plant.displayName} photograph`}
            />
          </section>


                    {/* =======================================
              TIMELINE
          ======================================= */}

<section className="story-section">
            <div className="section-heading">
              <div>
                <p className="section-label">
                  Timeline
                </p>

                <h2>
                  The story so far
                </h2>
              </div>

              <button
                type="button"
                className="text-button"
                onClick={
                  onAddEvent
                }
              >
                + Add a moment
              </button>
            </div>


            <div className="timeline">
              {plantEvents.length >
              0 ? (
                plantEvents.map(
                  (
                    event,
                  ) => (
                    <article
                      className="timeline-entry"
                      key={
                        event.id
                      }
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        onOpenJournalEntry(
                          event.id,
                        )
                      }
                      onKeyDown={(
                        keyboardEvent,
                      ) => {
                        if (
                          keyboardEvent.key ===
                            'Enter' ||
                          keyboardEvent.key ===
                            ' '
                        ) {
                          keyboardEvent.preventDefault()

                          onOpenJournalEntry(
                            event.id,
                          )
                        }
                      }}
                    >
                      <div className="timeline-marker">
                        {getEventEmoji(
                          event.type,
                        )}
                      </div>


                      <div className="timeline-entry-header">
                        <div className="timeline-entry-meta">
                          <time>
                            {formatDate(
                              event.date,
                            )}
                          </time>

                          <span
                            className={
                              event.plantStoryIds.length ===
                              0
                                ? 'entry-scope-label garden-entry-label'
                                : 'entry-scope-label plant-entry-label'
                            }
                          >
                            {event.plantStoryIds.length ===
                            0
                              ? '🌍 Garden entry'
                              : '🌱 Plant entry'}
                          </span>
                        </div>


                        <button
                          type="button"
                          className="timeline-delete-button"
                          aria-label={`Remove ${event.title} from the garden journal`}
                          onClick={(
                            clickEvent,
                          ) => {
                            clickEvent.stopPropagation()

                            const confirmed =
                              window.confirm(
                                'Remove this entry from the garden journal?',
                              )

                            if (
                              confirmed
                            ) {
                              onDeleteEvent(
                                event.id,
                              )
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </div>


                      <h3>
                        {event.title}
                      </h3>


                      {event.productUsed && (
                        <p className="event-product">
                          Used:{' '}
                          {event.productUsed}
                        </p>
                      )}


                      {event.notes && (
                        <p>
                          {event.notes}
                        </p>
                      )}


                      {event.photoUrls &&
                        event.photoUrls.length >
                          0 && (
                        <div
                          onClick={(
                            clickEvent,
                          ) =>
                            clickEvent.stopPropagation()
                          }
                          onKeyDown={(
                            keyboardEvent,
                          ) =>
                            keyboardEvent.stopPropagation()
                          }
                        >
                          <SprigPhotoGallery
                            photoUrls={
                              event.photoUrls
                            }
                            title="Photographs from this moment"
                            emptyMessage=""
                            photoAltPrefix={`${event.title} photograph`}
                          />
                        </div>
                      )}
                    </article>
                  ),
                )
              ) : (
                <div className="empty-story">
                  <span>
                    🌿
                  </span>

                  <p>
                    This story has only just opened its notebook.
                  </p>

                  <button
                    type="button"
                    className="text-button"
                    onClick={
                      onAddEvent
                    }
                  >
                    Add its first moment
                  </button>
                </div>
              )}
            </div>
          </section>

        </div>
      </GardenLayout>


      {/* =======================================
          EDIT PLANT STORY
      ======================================= */}

      {isEditOpen && (
        <AddPlantForm
          GrowingPlaces={
            growingPlaces
          }

          GrowingSetups={
            growingSetups
          }

          Ingredients={
            ingredients
          }

          plantToEdit={
            plant
          }

          onAddPlant={
            onAddPlant
          }

          onUpdatePlant={
            onUpdatePlant
          }

          onAddGrowingPlace={
            onAddGrowingPlace
          }

          onAddRecipe={
            onAddRecipe
          }

          onAddIngredient={
            onAddIngredient
          }

          onClose={() =>
            setIsEditOpen(
              false,
            )
          }
        />
      )}


      {/* =======================================
          CREATE VARIATION
      ======================================= */}

      {isVariationOpen && (
        <AddPlantForm
          GrowingPlaces={
            growingPlaces
          }

          GrowingSetups={
            growingSetups
          }

          Ingredients={
            ingredients
          }

          variationFrom={
            plant
          }

          onAddPlant={
            onAddPlant
          }

          onUpdatePlant={
            onUpdatePlant
          }

          onAddGrowingPlace={
            onAddGrowingPlace
          }

          onAddRecipe={
            onAddRecipe
          }

          onAddIngredient={
            onAddIngredient
          }

          onClose={() =>
            setIsVariationOpen(
              false,
            )
          }
        />
      )}


      {/* =======================================
          PHOTO QUICK ADD
      ======================================= */}

      <SprigQuickPeek
        isOpen={
          isPhotoQuickAddOpen
        }

        onClose={() =>
          setIsPhotoQuickAddOpen(
            false,
          )
        }

        eyebrow="Plant Story"

        title="Photographs"

        subtitle={
          plant.displayName
        }
      >
        <SprigPhotoPicker
          photoUrls={
            photoDraft
          }

          onChange={
            setPhotoDraft
          }

          title="Plant photographs"

          helperText="Add photographs without leaving this Plant Story."

          addButtonText="Add photographs"

          photoAltPrefix={`${plant.displayName} photograph`}

          maxPhotos={
            12
          }
        />


        <button
          type="button"
          className="enter-button"
          onClick={
            savePhotos
          }
        >
          Save photographs
        </button>
      </SprigQuickPeek>


      {/* =======================================
          GROWING RECIPE QUICK PEEK
      ======================================= */}

      {currentGrowingSetup && (
        <SprigQuickPeek
          isOpen={
            isRecipeQuickPeekOpen
          }

          onClose={() =>
            setIsRecipeQuickPeekOpen(
              false,
            )
          }

          eyebrow="Growing Recipe"

          title={
            currentGrowingSetup.name
          }

          subtitle={
            getGrowingSetupCategoryLabel(
              currentGrowingSetup,
            )
          }
        >
          {currentGrowingSetup.category ===
            'own-mix' && (
            <>
              <h3>
                What&apos;s in this mix
              </h3>


              {currentRecipeIngredients.length >
              0 ? (
                <ul>
                  {currentRecipeIngredients.map(
                    (
                      ingredient,
                    ) => (
                      <li
                        key={
                          ingredient.id
                        }
                      >
                        {ingredient.name}
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p>
                  No ingredients have been
                  recorded for this recipe yet.
                </p>
              )}
            </>
          )}


          {currentGrowingSetup.notes && (
            <>
              <h3>
                Notes
              </h3>

              <p>
                {currentGrowingSetup.notes}
              </p>
            </>
          )}
        </SprigQuickPeek>
      )}

    </>
  )
}