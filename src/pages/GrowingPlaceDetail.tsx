import GardenLayout from '../components/layout/GardenLayout'

import type {
  GardenEvent,
  GrowingPlace,
  GrowingSetup,
  PlantStory,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface GrowingPlaceDetailProps {
  growingPlace: GrowingPlace

  plants: PlantStory[]

  events: GardenEvent[]

  growingSetups: GrowingSetup[]

  journeyBackLabel:
    string | null

  onBack: () => void

  onOpenGrowingPlaces: () => void

  onOpenPlant: (
    plantId: string,
  ) => void

  onOpenEvent: (
    eventId: string,
  ) => void

  onOpenRecipe: (
    recipeId: string,
  ) => void

  onNavigate: (
    page: AppPage,
  ) => void
}


/* =======================================
   LABEL
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
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
}


/* =======================================
   PLACE KIND
======================================= */

function getPlaceKindLabel(
  place: GrowingPlace,
): string {
  if (
    place.kind === 'other' &&
    place.customKindLabel
  ) {
    return place.customKindLabel
  }

  return formatLabel(
    place.kind,
  )
}


/* =======================================
   GROWING PLACE DETAIL
======================================= */

export default function GrowingPlaceDetail({
  growingPlace,
  plants,
  events,
  growingSetups,
  journeyBackLabel,
  onBack,
  onOpenGrowingPlaces,
  onOpenPlant,
  onOpenEvent,
  onOpenRecipe,
  onNavigate,
}: GrowingPlaceDetailProps) {

  /* =======================================
     PLANTS CURRENTLY HERE
  ======================================= */

  const plantsHere =
    plants.filter(
      (
        plant,
      ) =>
        plant.currentGrowingPlaceId ===
        growingPlace.id,
    )


  /* =======================================
     JOURNAL HISTORY HERE
  ======================================= */

  const eventsHere =
    [...events]
      .filter(
        (
          event,
        ) =>
          event.growingPlaceIds
            ?.includes(
              growingPlace.id,
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
     GROWING RECIPE
  ======================================= */

  const growingSetup =
    growingPlace.growingSetupId
      ? growingSetups.find(
          (
            setup,
          ) =>
            setup.id ===
            growingPlace.growingSetupId,
        )
      : undefined


  /* =======================================
     NAVIGATION
  ======================================= */

  const hasJourneyBack =
    Boolean(
      journeyBackLabel,
    )


  const journeyAlreadyReturnsToGrowingPlaces =
    journeyBackLabel ===
    'Growing Places'


  return (
    <GardenLayout
      activePage="growing-places"
      onNavigate={
        onNavigate
      }
    >
      <div className="garden-page">

        {/* =======================================
            NAVIGATION
        ======================================= */}

        <div
          className="sprig-detail-navigation"
          style={{
            display:
              'flex',

            flexWrap:
              'wrap',

            gap:
              '10px',

            marginBottom:
              '18px',
          }}
        >

          {hasJourneyBack && (
            <button
              type="button"
              className="garden-return-button"
              onClick={
                onBack
              }
            >
              ← Back to{' '}
              {
                journeyBackLabel
              }
            </button>
          )}


          {!journeyAlreadyReturnsToGrowingPlaces && (
            <button
              type="button"
              className="garden-return-button"
              onClick={
                onOpenGrowingPlaces
              }
            >
              ← Growing Places
            </button>
          )}

        </div>


        {/* =======================================
            HEADER
        ======================================= */}

        <header className="garden-header">

          <p className="page-kicker">
            SPRIG · GROWING PLACE
          </p>

          <h1>
            {growingPlace.name}
          </h1>

          <p className="page-intro">
            {getPlaceKindLabel(
              growingPlace,
            )}
          </p>

        </header>


        {/* =======================================
            GROWING RECIPE
        ======================================= */}

        {growingSetup && (
          <section className="story-section">

            <div className="section-heading">
              <div>
                <p className="section-label">
                  Growing recipe
                </p>

                <h2>
                  What this place grows in
                </h2>
              </div>
            </div>


            <button
              type="button"
              className="story-info-card"
              onClick={() =>
                onOpenRecipe(
                  growingSetup.id,
                )
              }
              style={{
                display:
                  'block',

                width:
                  '100%',

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
                {growingSetup.name}
              </h2>

              <p>
                Recipe currently connected
                to this Growing Place.
              </p>

            </button>

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
                About this place
              </h2>

            </div>

          </div>


          <div className="story-note-card">

            <p>
              {growingPlace.notes ??
                'No notes have been recorded for this Growing Place yet.'}
            </p>

          </div>

        </section>


        {/* =======================================
            PLANTS CURRENTLY HERE
        ======================================= */}

        <section className="story-section">

          <div className="section-heading">

            <div>

              <p className="section-label">
                Growing here
              </p>

              <h2>
                Plant Stories in this place
              </h2>

            </div>

          </div>


          {plantsHere.length >
          0 ? (
            <div className="library-grid">

              {plantsHere.map(
                (
                  plant,
                ) => (
                  <button
                    key={
                      plant.id
                    }
                    type="button"
                    className="library-book"
                    onClick={() =>
                      onOpenPlant(
                        plant.id,
                      )
                    }
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
                      🌱 Plant Story
                    </p>

                    <h2>
                      {plant.displayName}
                    </h2>

                    {plant.variety && (
                      <p>
                        {plant.variety}
                      </p>
                    )}

                  </button>
                ),
              )}

            </div>
          ) : (
            <div className="empty-story">

              <span>
                🌿
              </span>

              <p>
                No current Plant Stories
                are connected to this
                Growing Place.
              </p>

            </div>
          )}

        </section>


        {/* =======================================
            JOURNAL HISTORY
        ======================================= */}

        <section className="story-section">

          <div className="section-heading">

            <div>

              <p className="section-label">
                Chronicle
              </p>

              <h2>
                What has happened here
              </h2>

            </div>

          </div>


          {eventsHere.length >
          0 ? (
            <div className="timeline">

              {eventsHere.map(
                (
                  event,
                ) => (
                  <button
                    key={
                      event.id
                    }
                    type="button"
                    className="timeline-entry"
                    onClick={() =>
                      onOpenEvent(
                        event.id,
                      )
                    }
                    style={{
                      display:
                        'block',

                      width:
                        '100%',

                      textAlign:
                        'left',

                      cursor:
                        'pointer',

                      font:
                        'inherit',
                    }}
                  >

                    <p className="section-label">
                      {formatDate(
                        event.date,
                      )}
                    </p>

                    <h3>
                      {event.title}
                    </h3>

                    {event.notes && (
                      <p>
                        {event.notes}
                      </p>
                    )}

                  </button>
                ),
              )}

            </div>
          ) : (
            <div className="empty-story">

              <span>
                📖
              </span>

              <p>
                Nothing has been recorded
                here in the Garden Journal
                yet.
              </p>

            </div>
          )}

        </section>

      </div>
    </GardenLayout>
  )
}