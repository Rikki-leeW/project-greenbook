import GardenLayout from '../components/layout/GardenLayout'
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery'

import type {
  GardenEvent,
  GrowingPlace,
  PlantStory,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface JournalEntryDetailProps {
  event: GardenEvent

  plants: PlantStory[]

  growingPlaces: GrowingPlace[]

  onBack: () => void

  onOpenPlant: (
    plantId: string,
  ) => void

  onOpenGrowingPlace: (
    growingPlaceId: string,
  ) => void

  onNavigate: (
    page: AppPage,
  ) => void
}


/* =======================================
   DATE
======================================= */

function formatDate(
  date: string,
): string {
  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString(
    'en-AU',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
}


/* =======================================
   EVENT LABELS
======================================= */

function getEventLabel(
  type: GardenEvent['type'],
): string {
  switch (
    type
  ) {
    case 'planted':
      return 'Planted'

    case 'sprouted':
      return 'Sprouted'

    case 'watered':
      return 'Watered'

    case 'fed':
      return 'Fertilised'

    case 'moved':
      return 'Moved'

    case 'hilled':
      return 'Hilled'

    case 'pruned':
      return 'Pruned'

    case 'treated':
      return 'Treated'

    case 'weather':
      return 'Weather'

    case 'observation':
      return 'Observed'

    case 'photo':
      return 'Photographed'

    case 'harvest':
      return 'Harvested'

    case 'note':
      return 'Made a note'

    default:
      return 'Garden moment'
  }
}


/* =======================================
   EVENT EMOJI
======================================= */

function getEventEmoji(
  type: GardenEvent['type'],
): string {
  switch (
    type
  ) {
    case 'planted':
      return '🌱'

    case 'sprouted':
      return '🌿'

    case 'watered':
      return '💧'

    case 'fed':
      return '🧪'

    case 'moved':
      return '🪴'

    case 'hilled':
      return '🥔'

    case 'pruned':
      return '✂️'

    case 'treated':
      return '🩹'

    case 'weather':
      return '🌦️'

    case 'observation':
      return '👀'

    case 'photo':
      return '📷'

    case 'harvest':
      return '🧺'

    case 'note':
      return '📖'

    default:
      return '📝'
  }
}


/* =======================================
   JOURNAL ENTRY DETAIL
======================================= */

export default function JournalEntryDetail({
  event,
  plants,
  growingPlaces,
  onBack,
  onOpenPlant,
  onOpenGrowingPlace,
  onNavigate,
}: JournalEntryDetailProps) {

  /* =======================================
     LINKED PLANTS
  ======================================= */

  const linkedPlants =
    plants.filter(
      (
        plant,
      ) =>
        event.plantStoryIds.includes(
          plant.id,
        ),
    )


  /* =======================================
     LINKED GROWING PLACES
  ======================================= */

  const linkedGrowingPlaces =
    growingPlaces.filter(
      (
        place,
      ) =>
        event.growingPlaceIds
          ?.includes(
            place.id,
          ),
    )


  /* =======================================
     ACTIVITY TYPES
  ======================================= */

  const activityTypes =
    event.activityTypes &&
    event.activityTypes.length >
      0
      ? event.activityTypes
      : [
          event.type,
        ]


  return (
    <GardenLayout
      activePage="journal"
      onNavigate={
        onNavigate
      }
    >
      <div className="journal-page">

        {/* =======================================
            BACK
        ======================================= */}

        <button
          type="button"
          className="garden-return-button"
          onClick={
            onBack
          }
        >
          ← Back to the Journal
        </button>


        {/* =======================================
            HEADER
        ======================================= */}

        <header className="journal-header">
          <div>
            <p className="section-label">
              {getEventEmoji(
                event.type,
              )}{' '}
              Journal page
            </p>

            <h1>
              {event.title}
            </h1>

            <p className="journal-intro">
              {formatDate(
                event.date,
              )}
            </p>
          </div>
        </header>


        {/* =======================================
            ENTRY DETAILS
        ======================================= */}

        <section className="library-grid">

          {/* =======================================
              WHAT HAPPENED
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              What happened
            </p>

            <h2>
              Garden moment
            </h2>

            <div className="sprig-ingredient-list">
              {activityTypes.map(
                (
                  activity,
                ) => (
                  <span
                    key={
                      activity
                    }
                    className="sprig-ingredient-chip"
                  >
                    {getEventEmoji(
                      activity,
                    )}{' '}
                    {getEventLabel(
                      activity,
                    )}
                  </span>
                ),
              )}
            </div>
          </article>


          {/* =======================================
              PLANTS
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              Plant Stories
            </p>

            <h2>
              Which plants were involved
            </h2>

            {event.plantScope ===
            'all-plants' ? (
              <p>
                🌳 All Plants
              </p>
            ) : linkedPlants.length >
              0 ? (
              <ul>
                {linkedPlants.map(
                  (
                    plant,
                  ) => (
                    <li
                      key={
                        plant.id
                      }
                    >
                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          onOpenPlant(
                            plant.id,
                          )
                        }
                      >
                        🌱{' '}
                        {
                          plant.displayName
                        }

                        {plant.variety &&
                          plant.variety !==
                            plant.displayName && (
                          <>
                            {' '}
                            ·{' '}
                            {
                              plant.variety
                            }
                          </>
                        )}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>
                This page belongs to the
                wider garden rather than
                one particular Plant Story.
              </p>
            )}
          </article>


          {/* =======================================
              GROWING PLACES
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              Growing Places
            </p>

            <h2>
              Where this story unfolded
            </h2>

            {event.growingPlaceScope ===
            'entire-garden' ? (
              <p>
                🌳 The whole garden
              </p>
            ) : linkedGrowingPlaces.length >
              0 ? (
              <ul>
                {linkedGrowingPlaces.map(
                  (
                    place,
                  ) => (
                    <li
                      key={
                        place.id
                      }
                    >
                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          onOpenGrowingPlace(
                            place.id,
                          )
                        }
                      >
                        🌿{' '}
                        {
                          place.name
                        }
                      </button>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>
                No particular Growing
                Place was recorded for
                this page.
              </p>
            )}
          </article>


          {/* =======================================
              PRODUCT USED
          ======================================= */}

          {event.productUsed && (
            <article className="library-book">
              <p className="section-label">
                Garden provisions
              </p>

              <h2>
                What was used
              </h2>

              <p>
                {
                  event.productUsed
                }
              </p>
            </article>
          )}


          {/* =======================================
              NOTES
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              Notes
            </p>

            <h2>
              What you wanted to remember
            </h2>

            {event.notes ? (
              <p>
                {
                  event.notes
                }
              </p>
            ) : (
              <p>
                No extra notes were added
                to this page.
              </p>
            )}
          </article>


          {/* =======================================
              PHOTOGRAPHS
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              Photographs
            </p>

            <SprigPhotoGallery
              photoUrls={
                event.photoUrls ??
                []
              }
              title="Photographs from this moment"
              emptyMessage="No photographs were tucked into this Journal page."
              photoAltPrefix={`${event.title} photograph`}
            />
          </article>

        </section>
      </div>
    </GardenLayout>
  )
}