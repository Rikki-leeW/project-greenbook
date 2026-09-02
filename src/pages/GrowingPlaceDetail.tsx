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
  growingPlace:
    GrowingPlace

  plants:
    PlantStory[]

  events:
    GardenEvent[]

  growingSetups:
    GrowingSetup[]

  journeyBackLabel?:
    string |
    null

  onBack:
    () => void

  onOpenGrowingPlaces:
    () => void

  onEdit:
    () => void

  onDelete:
    () => void

  onOpenPlant: (
    plantId:
      string,
  ) => void

  onOpenEvent: (
    eventId:
      string,
  ) => void

  onOpenRecipe: (
    recipeId:
      string,
  ) => void

  onNavigate: (
    page:
      AppPage,
  ) => void
}


function formatLabel(
  value:
    string,
):
  string {
  return value
    .replaceAll(
      '-',
      ' ',
    )
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase(),
    )
}


function getPlaceKindLabel(
  place:
    GrowingPlace,
):
  string {
  if (
    place.kind ===
      'other' &&
    place.customKindLabel
  ) {
    return place.customKindLabel
  }


  return formatLabel(
    place.kind,
  )
}


function getPlantLabel(
  plant:
    PlantStory,
):
  string {
  return (
    plant.displayName ||
    plant.variety ||
    plant.plantName ||
    'Plant Story'
  )
}


function getCurrentSetupIds(
  plant:
    PlantStory,
):
  string[] {
  if (
    plant.currentGrowingSetupIds &&
    plant.currentGrowingSetupIds.length >
      0
  ) {
    return plant.currentGrowingSetupIds
  }


  if (
    plant.currentGrowingSetupId
  ) {
    return [
      plant.currentGrowingSetupId,
    ]
  }


  return []
}


const relationshipRowStyle:
  React.CSSProperties = {
    width:
      '100%',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    gap:
      '1rem',

    padding:
      '0.9rem 0',

    border:
      '0',

    borderBottom:
      '1px solid rgba(72, 71, 56, 0.18)',

    background:
      'transparent',

    textAlign:
      'left',

    cursor:
      'pointer',

    font:
      'inherit',

    color:
      'inherit',
  }


function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        display:
          'grid',

        gridTemplateColumns:
          'minmax(7.5rem, 0.8fr) minmax(0, 1.4fr)',

        gap:
          '1rem',

        padding:
          '0.7rem 0',

        borderBottom:
          '1px solid rgba(72, 71, 56, 0.16)',
      }}
    >
      <strong>
        {label}
      </strong>

      <span>
        {value}
      </span>
    </div>
  )
}


export default function GrowingPlaceDetail({
  growingPlace,
  plants,
  events,
  growingSetups,
  journeyBackLabel,
  onBack,
  onOpenGrowingPlaces,
  onEdit,
  onDelete,
  onOpenPlant,
  onOpenEvent,
  onOpenRecipe,
  onNavigate,
}: GrowingPlaceDetailProps) {

  const plantsHere =
    plants
      .filter(
        plant =>
          plant.currentGrowingPlaceId ===
          growingPlace.id,
      )
      .sort(
        (
          first,
          second,
        ) =>
          getPlantLabel(
            first,
          ).localeCompare(
            getPlantLabel(
              second,
            ),
          ),
      )


  const eventsHere =
    [...events]
      .filter(
        event =>
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
          second.date.localeCompare(
            first.date,
          ),
      )


  const setupIds =
    Array.from(
      new Set(
        plantsHere.flatMap(
          plant =>
            getCurrentSetupIds(
              plant,
            ),
        ),
      ),
    )


  const setupsHere =
    setupIds
      .map(
        setupId =>
          growingSetups.find(
            setup =>
              setup.id ===
              setupId,
          ),
      )
      .filter(
        (
          setup,
        ): setup is GrowingSetup =>
          Boolean(
            setup,
          ),
      )
      .sort(
        (
          first,
          second,
        ) =>
          first.name.localeCompare(
            second.name,
          ),
      )


  return (
    <GardenLayout
      activePage="growing-places"
      onNavigate={
        onNavigate
      }
    >
      <div className="garden-page">

        {/* ===================================
            NAVIGATION
        =================================== */}

        <div
          style={{
            display:
              'flex',

            gap:
              '0.65rem',

            flexWrap:
              'wrap',

            marginBottom:
              '1rem',
          }}
        >
          <button
            type="button"
            className="record-action-button"
            onClick={
              onBack
            }
          >
            ←{' '}
            {
              journeyBackLabel
                ? `Back to ${journeyBackLabel}`
                : 'Back'
            }
          </button>


          <button
            type="button"
            className="record-action-button"
            onClick={
              onOpenGrowingPlaces
            }
          >
            Growing Home
          </button>
        </div>


        {/* ===================================
            HEADER
        =================================== */}

        <header className="journal-header">
          <div>
            <p className="section-label">
              Growing · Place
            </p>

            <h1>
              {growingPlace.name}
            </h1>

            <p className="journal-intro">
              {
                getPlaceKindLabel(
                  growingPlace,
                )
              }
            </p>
          </div>
        </header>


        {/* ===================================
            RECORD ACTIONS
        =================================== */}

        <div
          style={{
            display:
              'flex',

            gap:
              '0.65rem',

            flexWrap:
              'wrap',

            margin:
              '0 0 1.5rem',
          }}
        >
          <button
            type="button"
            className="secondary-button"
            onClick={
              onEdit
            }
          >
            ✎ Edit Place
          </button>


          <button
            type="button"
            className="record-action-button"
            onClick={
              onDelete
            }
          >
            Delete Place
          </button>
        </div>


        {/* ===================================
            PLACE DETAILS
        =================================== */}

        <section className="story-section">

          <div className="section-heading">
            <div>
              <p className="section-label">
                About this place
              </p>

              <h2>
                Location & conditions
              </h2>
            </div>
          </div>


          <div>
            <DetailRow
              label="Place type"
              value={
                getPlaceKindLabel(
                  growingPlace,
                )
              }
            />


            {growingPlace.aspect && (
              <DetailRow
                label="Aspect"
                value={
                  formatLabel(
                    growingPlace.aspect,
                  )
                }
              />
            )}


            {growingPlace.sunlight && (
              <DetailRow
                label="Sunlight"
                value={
                  formatLabel(
                    growingPlace.sunlight,
                  )
                }
              />
            )}


            {growingPlace.shelter && (
              <DetailRow
                label="Shelter"
                value={
                  formatLabel(
                    growingPlace.shelter,
                  )
                }
              />
            )}
          </div>


          {growingPlace.notes && (
            <div
              style={{
                marginTop:
                  '1rem',
              }}
            >
              <p className="section-label">
                Notes
              </p>

              <p>
                {growingPlace.notes}
              </p>
            </div>
          )}
        </section>


        {/* ===================================
            PLANTS
        =================================== */}

        <section className="story-section">

          <div className="section-heading">
            <div>
              <p className="section-label">
                Living here now
              </p>

              <h2>
                Plant Stories
              </h2>
            </div>
          </div>


          {plantsHere.length ===
          0 ? (
            <p>
              No active Plant Stories are
              currently recorded here.
            </p>
          ) : (
            <div>
              {plantsHere.map(
                plant => (
                  <button
                    key={
                      plant.id
                    }
                    type="button"
                    style={
                      relationshipRowStyle
                    }
                    onClick={
                      () =>
                        onOpenPlant(
                          plant.id,
                        )
                    }
                  >
                    <span>
                      <strong
                        style={{
                          display:
                            'block',
                        }}
                      >
                        {
                          getPlantLabel(
                            plant,
                          )
                        }
                      </strong>

                      <span
                        className="form-whisper"
                      >
                        Open Plant Story
                      </span>
                    </span>

                    <span
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </section>


        {/* ===================================
            SETUPS GATHERED FROM PLANTS
        =================================== */}

        <section className="story-section">

          <div className="section-heading">
            <div>
              <p className="section-label">
                What they grow in
              </p>

              <h2>
                Growing Setups used here
              </h2>

              <p>
                These relationships belong to
                the Plant Stories. The place
                itself still remembers only
                where.
              </p>
            </div>
          </div>


          {setupsHere.length ===
          0 ? (
            <p>
              No current Growing Setup is
              linked through Plant Stories
              living here.
            </p>
          ) : (
            <div>
              {setupsHere.map(
                setup => (
                  <button
                    key={
                      setup.id
                    }
                    type="button"
                    style={
                      relationshipRowStyle
                    }
                    onClick={
                      () =>
                        onOpenRecipe(
                          setup.id,
                        )
                    }
                  >
                    <span>
                      <strong
                        style={{
                          display:
                            'block',
                        }}
                      >
                        {setup.name}
                      </strong>

                      <span
                        className="form-whisper"
                      >
                        {
                          setup.category ===
                            'own-mix'
                            ? 'My Recipe'
                            : setup.category ===
                              'bought-mix'
                              ? 'Bought Mix'
                              : setup.category ===
                                'growing-system'
                                ? 'Growing System'
                                : 'Ground Type'
                        }
                      </span>
                    </span>

                    <span
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </section>


        {/* ===================================
            JOURNAL
        =================================== */}

        <section className="story-section">

          <div className="section-heading">
            <div>
              <p className="section-label">
                Chronicle
              </p>

              <h2>
                Journal pages from here
              </h2>
            </div>
          </div>


          {eventsHere.length ===
          0 ? (
            <p>
              No Journal pages are linked
              to this Growing Place yet.
            </p>
          ) : (
            <div>
              {eventsHere.map(
                event => (
                  <button
                    key={
                      event.id
                    }
                    type="button"
                    style={
                      relationshipRowStyle
                    }
                    onClick={
                      () =>
                        onOpenEvent(
                          event.id,
                        )
                    }
                  >
                    <span>
                      <strong
                        style={{
                          display:
                            'block',
                        }}
                      >
                        {
                          event.title ||
                          'Garden Journal'
                        }
                      </strong>

                      <span
                        className="form-whisper"
                      >
                        {event.date}
                      </span>
                    </span>

                    <span
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </section>


        {/* ===================================
            NAVIGATION AGAIN
        =================================== */}

        <div
          style={{
            display:
              'flex',

            gap:
              '0.65rem',

            flexWrap:
              'wrap',

            marginTop:
              '1.5rem',
          }}
        >
          <button
            type="button"
            className="record-action-button"
            onClick={
              onBack
            }
          >
            ←{' '}
            {
              journeyBackLabel
                ? `Back to ${journeyBackLabel}`
                : 'Back'
            }
          </button>

          <button
            type="button"
            className="record-action-button"
            onClick={
              onOpenGrowingPlaces
            }
          >
            Growing Home
          </button>
        </div>

      </div>
    </GardenLayout>
  )
}