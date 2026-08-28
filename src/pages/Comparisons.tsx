import GardenLayout from '../components/layout/GardenLayout'

import type {
  PlantStory,
  SavedComparison,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface ComparisonsProps {
  comparisons: SavedComparison[]

  plants: PlantStory[]

  onOpenComparison: (
    comparison: SavedComparison,
  ) => void

  onRenameComparison: (
    comparisonId: string,
    name: string,
  ) => void

  onDeleteComparison: (
    comparisonId: string,
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
  const parsed =
    new Date(
      date,
    )

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return date
  }

  return parsed.toLocaleDateString(
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
   COMPARISON SORT DATE
======================================= */

function getComparisonSortDate(
  comparison: SavedComparison,
): number {
  const date =
    comparison.updatedAt ??
    comparison.createdAt

  const parsed =
    new Date(
      date,
    )

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return 0
  }

  return parsed.getTime()
}


/* =======================================
   COMPARISON PLANTS
======================================= */

function getComparisonPlants(
  comparison: SavedComparison,
  plants: PlantStory[],
): PlantStory[] {
  return comparison.items
    .filter(
      (
        item,
      ) =>
        item.recordType ===
        'plant-story',
    )
    .map(
      (
        item,
      ) =>
        plants.find(
          (
            plant,
          ) =>
            plant.id ===
            item.recordId,
        ),
    )
    .filter(
      (
        plant,
      ): plant is PlantStory =>
        Boolean(
          plant,
        ),
    )
}


/* =======================================
   COMPARISONS PAGE
======================================= */

export default function Comparisons({
  comparisons,
  plants,
  onOpenComparison,
  onRenameComparison,
  onDeleteComparison,
  onNavigate,
}: ComparisonsProps) {

  /* =======================================
     MOST RECENT FIRST
  ======================================= */

  const sortedComparisons =
    [
      ...comparisons,
    ].sort(
      (
        first,
        second,
      ) =>
        getComparisonSortDate(
          second,
        ) -
        getComparisonSortDate(
          first,
        ),
    )


  return (
    <GardenLayout
      activePage="comparisons"
      onNavigate={
        onNavigate
      }
    >
      <main className="garden-page">

        {/* =======================================
            HEADER
        ======================================= */}

        <header className="garden-header">

          <div>

            <p className="app-name">
              Sprig
            </p>

            <h1 className="garden-title">
              Comparisons
            </h1>

            <p className="garden-subtitle">
              Revisit growing stories
              you have placed side by side.
            </p>

          </div>

        </header>


        {/* =======================================
            SAVED COMPARISONS
        ======================================= */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <p className="section-label">
                Saved comparisons
              </p>

              <h2>
                Stories worth another look
              </h2>

            </div>

          </div>


          {sortedComparisons.length >
          0 ? (

            <div className="saved-comparison-list">

              {sortedComparisons.map(
                (
                  comparison,
                ) => {

                  const comparisonPlants =
                    getComparisonPlants(
                      comparison,
                      plants,
                    )

                  const comparisonPhotoPlants =
                    comparisonPlants.filter(
                      (
                        plant,
                      ) =>
                        (
                          plant.photoUrls?.length ??
                          0
                        ) >
                        0,
                    )


                  return (
                    <article
                      key={
                        comparison.id
                      }
                      className="saved-comparison-card"
                      role="button"
                      tabIndex={
                        0
                      }
                      aria-label={`Open comparison ${comparison.name}`}
                      onClick={() =>
                        onOpenComparison(
                          comparison,
                        )
                      }
                      onKeyDown={(
                        event,
                      ) => {

                        if (
                          event.key ===
                            'Enter' ||
                          event.key ===
                            ' '
                        ) {
                          event.preventDefault()

                          onOpenComparison(
                            comparison,
                          )
                        }

                      }}
                    >

                      {/* =======================================
                          CARD TOP
                      ======================================= */}

                      <div className="saved-comparison-card-top">

                        <div>

                          <p className="section-label">
                            Comparison
                          </p>

                          <h3>
                            {
                              comparison.name
                            }
                          </h3>

                        </div>


                        <span className="status-pill">
                          {
                            comparisonPlants.length
                          }{' '}
                          {comparisonPlants.length ===
                          1
                            ? 'story'
                            : 'stories'}
                        </span>

                      </div>


                      {/* =======================================
                          PHOTO PREVIEW
                      ======================================= */}

                      {comparisonPhotoPlants.length >
                      0 && (

                        <div
                          className="saved-comparison-photo-strip"
                          aria-label="Plant Story photographs"
                        >

                          {comparisonPhotoPlants.map(
                            (
                              plant,
                            ) => {

                              const photoUrl =
                                plant.photoUrls?.[0]

                              if (
                                !photoUrl
                              ) {
                                return null
                              }


                              return (
                                <div
                                  key={`${comparison.id}-${plant.id}-preview`}
                                  className="saved-comparison-photo-preview"
                                >

                                  <img
                                    src={
                                      photoUrl
                                    }
                                    alt={`${plant.displayName} comparison preview`}
                                  />

                                  <span>
                                    {
                                      plant.displayName
                                    }
                                  </span>

                                </div>
                              )
                            },
                          )}

                        </div>
                      )}


                      {/* =======================================
                          CURRENT PLANT MEMBERS
                      ======================================= */}

                      <p className="saved-comparison-plants">

                        {comparisonPlants.length >
                        0
                          ? comparisonPlants
                              .map(
                                (
                                  plant,
                                ) =>
                                  plant.displayName,
                              )
                              .join(
                                ' · ',
                              )
                          : 'No available Plant Stories are currently connected to this comparison.'}

                      </p>


                      {/* =======================================
                          DATES
                      ======================================= */}

                      <div className="saved-comparison-dates">

                        <span>
                          Saved{' '}
                          {formatDate(
                            comparison.createdAt,
                          )}
                        </span>


                        {comparison.updatedAt && (
                          <span>
                            Updated{' '}
                            {formatDate(
                              comparison.updatedAt,
                            )}
                          </span>
                        )}

                      </div>


                      {/* =======================================
                          ACTIONS
                      ======================================= */}

                      <div className="saved-comparison-actions">

                        <button
                          type="button"
                          className="text-button"
                          onClick={(
                            event,
                          ) => {

                            event.stopPropagation()


                            const newName =
                              window.prompt(
                                'Rename this comparison',
                                comparison.name,
                              )


                            if (
                              !newName?.trim()
                            ) {
                              return
                            }


                            onRenameComparison(
                              comparison.id,
                              newName.trim(),
                            )

                          }}
                        >
                          Rename
                        </button>


                        <button
                          type="button"
                          className="text-button"
                          onClick={(
                            event,
                          ) => {

                            event.stopPropagation()

                            onOpenComparison(
                              comparison,
                            )

                          }}
                        >
                          Open comparison →
                        </button>


                        <button
                          type="button"
                          className="text-button"
                          onClick={(
                            event,
                          ) => {

                            event.stopPropagation()


                            const confirmed =
                              window.confirm(
                                `Delete "${comparison.name}"?\n\nThis removes the saved comparison only. Your Plant Stories and their records will stay safely in Sprig.`,
                              )


                            if (
                              !confirmed
                            ) {
                              return
                            }


                            onDeleteComparison(
                              comparison.id,
                            )

                          }}
                        >
                          Delete
                        </button>

                      </div>

                    </article>
                  )
                },
              )}

            </div>

          ) : (

            <div className="journal-empty">

              <span>
                📊
              </span>

              <h2>
                No comparisons saved yet
              </h2>

              <p>
                Choose two to four Growing
                Stories and Sprig can place
                their growth, harvests and
                photographs side by side.
              </p>

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  onNavigate(
                    'plants',
                  )
                }
              >
                Go to Growing Stories →
              </button>

            </div>
          )}

        </section>

      </main>
    </GardenLayout>
  )
}