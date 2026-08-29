import GardenLayout from '../components/layout/GardenLayout'
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery'

import type {
  HarvestMeasurementUnit,
  HarvestPlantOutcome,
  HarvestRecord,
  HarvestType,
  PlantStory,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface HarvestDetailProps {
  harvest: HarvestRecord

  harvests: HarvestRecord[]

  plants: PlantStory[]

  journeyBackLabel:
    string | null

  onBack: () => void

  onOpenHarvests: () => void

  onEdit: (
    harvest: HarvestRecord,
  ) => void

  onRecordAnotherHarvest: (
    harvest: HarvestRecord,
  ) => void

  onDelete: (
    harvestId: string,
  ) => void

  onOpenPlant: (
    plantId: string,
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
   STORY KEY
======================================= */

function getHarvestStoryKey(
  harvest: HarvestRecord,
): string {
  const sortedPlantIds = [
    ...harvest.plantStoryIds,
  ].sort()


  return sortedPlantIds.length >
    0
    ? sortedPlantIds.join(
        '|',
      )
    : harvest.id
}


/* =======================================
   PLANTS
======================================= */

function getMatchingPlants(
  harvest: HarvestRecord,
  plants: PlantStory[],
): PlantStory[] {
  return plants.filter(
    (
      plant,
    ) =>
      harvest.plantStoryIds.includes(
        plant.id,
      ),
  )
}


function getPlantNames(
  harvest: HarvestRecord,
  plants: PlantStory[],
): string {
  const matchingPlants =
    getMatchingPlants(
      harvest,
      plants,
    )


  if (
    matchingPlants.length ===
    0
  ) {
    return 'Unknown Plant Story'
  }


  return matchingPlants
    .map(
      (
        plant,
      ) =>
        plant.displayName,
    )
    .join(
      ', ',
    )
}


/* =======================================
   HARVEST TYPE
======================================= */

function getHarvestTypeLabel(
  harvest: HarvestRecord,
): string {
  if (
    harvest.harvestType ===
      'other' &&
    harvest.customHarvestTypeLabel
  ) {
    return harvest.customHarvestTypeLabel
  }


  const labels:
    Partial<
      Record<
        HarvestType,
        string
      >
    > = {
      first:
        'First harvest',

      regular:
        'Regular harvest',

      main:
        'Main harvest',

      secondary:
        'Secondary harvest',

      final:
        'Final harvest',

      other:
        'Other harvest',
    }


  return harvest.harvestType
    ? labels[
        harvest.harvestType
      ] ??
        'Harvest'
    : 'Harvest'
}


/* =======================================
   MEASUREMENT
======================================= */

function getMeasurementUnitLabel(
  harvest: HarvestRecord,
): string | undefined {
  if (
    harvest.measurementUnit ===
      'other' &&
    harvest.customMeasurementUnitLabel
  ) {
    return harvest.customMeasurementUnitLabel
  }


  const labels:
    Partial<
      Record<
        HarvestMeasurementUnit,
        string
      >
    > = {
      gram:
        'g',

      kilogram:
        'kg',

      millilitre:
        'mL',

      litre:
        'L',

      bunch:
        'bunch',

      handful:
        'handful',

      basket:
        'basket',

      container:
        'container',
    }


  return harvest.measurementUnit
    ? labels[
        harvest.measurementUnit
      ]
    : undefined
}


function getHarvestAmount(
  harvest: HarvestRecord,
): string {
  const pieces:
    string[] = []


  if (
    harvest.count !==
    undefined
  ) {
    pieces.push(
      `${harvest.count}`,
    )
  }


  if (
    harvest.measurementAmount !==
    undefined
  ) {
    const unit =
      getMeasurementUnitLabel(
        harvest,
      )


    pieces.push(
      unit
        ? `${harvest.measurementAmount} ${unit}`
        : `${harvest.measurementAmount}`,
    )
  }


  return pieces.length >
    0
    ? pieces.join(
        ' · ',
      )
    : 'Not recorded'
}


/* =======================================
   OUTCOME
======================================= */

function getPlantOutcomeLabel(
  harvest: HarvestRecord,
): string {
  if (
    harvest.plantOutcome ===
      'other' &&
    harvest.customPlantOutcomeLabel
  ) {
    return harvest.customPlantOutcomeLabel
  }


  const labels:
    Partial<
      Record<
        HarvestPlantOutcome,
        string
      >
    > = {
      'still-producing':
        'Still producing',

      'more-expected':
        'More expected',

      'main-harvest-complete':
        'Main harvest complete',

      finished:
        'Finished producing',

      'no-change':
        'Plant story continues',

      'not-sure':
        'Still unfolding',

      other:
        'Other',
    }


  return harvest.plantOutcome
    ? labels[
        harvest.plantOutcome
      ] ??
        'Not recorded'
    : 'Not recorded'
}


/* =======================================
   QUALITY
======================================= */

function getQualityLabel(
  harvest: HarvestRecord,
): string {
  switch (
    harvest.quality
  ) {
    case 'poor':
      return 'Poor'

    case 'fair':
      return 'Fair'

    case 'good':
      return 'Good'

    case 'excellent':
      return 'Excellent'

    default:
      return 'Not recorded'
  }
}


/* =======================================
   TOTAL COUNT
======================================= */

function getTotalCount(
  harvests: HarvestRecord[],
): number | undefined {
  const harvestsWithCount =
    harvests.filter(
      (
        harvest,
      ) =>
        harvest.count !==
        undefined,
    )


  if (
    harvestsWithCount.length ===
    0
  ) {
    return undefined
  }


  return harvestsWithCount.reduce(
    (
      total,
      harvest,
    ) =>
      total +
      (
        harvest.count ??
        0
      ),
    0,
  )
}


/* =======================================
   TOTAL MEASUREMENT
======================================= */

function getTotalMeasurement(
  harvests: HarvestRecord[],
): string | undefined {
  const measuredHarvests =
    harvests.filter(
      (
        harvest,
      ) =>
        harvest.measurementAmount !==
          undefined &&
        harvest.measurementUnit !==
          undefined,
    )


  if (
    measuredHarvests.length ===
    0
  ) {
    return undefined
  }


  const allWeights =
    measuredHarvests.every(
      (
        harvest,
      ) =>
        harvest.measurementUnit ===
          'gram' ||
        harvest.measurementUnit ===
          'kilogram',
    )


  if (
    allWeights
  ) {
    const totalGrams =
      measuredHarvests.reduce(
        (
          total,
          harvest,
        ) => {
          const amount =
            harvest.measurementAmount ??
            0


          return total +
            (
              harvest.measurementUnit ===
                'kilogram'
                ? amount *
                  1000
                : amount
            )
        },
        0,
      )


    if (
      totalGrams >=
      1000
    ) {
      return `${Number(
        (
          totalGrams /
          1000
        ).toFixed(
          2,
        ),
      )} kg`
    }


    return `${Number(
      totalGrams.toFixed(
        2,
      ),
    )} g`
  }


  const allVolumes =
    measuredHarvests.every(
      (
        harvest,
      ) =>
        harvest.measurementUnit ===
          'millilitre' ||
        harvest.measurementUnit ===
          'litre',
    )


  if (
    allVolumes
  ) {
    const totalMillilitres =
      measuredHarvests.reduce(
        (
          total,
          harvest,
        ) => {
          const amount =
            harvest.measurementAmount ??
            0


          return total +
            (
              harvest.measurementUnit ===
                'litre'
                ? amount *
                  1000
                : amount
            )
        },
        0,
      )


    if (
      totalMillilitres >=
      1000
    ) {
      return `${Number(
        (
          totalMillilitres /
          1000
        ).toFixed(
          2,
        ),
      )} L`
    }


    return `${Number(
      totalMillilitres.toFixed(
        2,
      ),
    )} mL`
  }


  return undefined
}


/* =======================================
   HARVEST DETAIL
======================================= */

export default function HarvestDetail({
  harvest,
  harvests,
  plants,
  journeyBackLabel,
  onBack,
  onOpenHarvests,
  onEdit,
  onRecordAnotherHarvest,
  onDelete,
  onOpenPlant,
  onNavigate,
}: HarvestDetailProps) {

  const storyKey =
    getHarvestStoryKey(
      harvest,
    )


  const storyHarvests = [
    ...harvests.filter(
      (
        candidate,
      ) =>
        getHarvestStoryKey(
          candidate,
        ) ===
        storyKey,
    ),
  ].sort(
    (
      first,
      second,
    ) =>
      new Date(
        first.date,
      ).getTime() -
      new Date(
        second.date,
      ).getTime(),
  )


  const matchingPlants =
    getMatchingPlants(
      harvest,
      plants,
    )


  const plantNames =
    getPlantNames(
      harvest,
      plants,
    )


  const totalCount =
    getTotalCount(
      storyHarvests,
    )


  const totalMeasurement =
    getTotalMeasurement(
      storyHarvests,
    )


  /* =======================================
     NAVIGATION
  ======================================= */

  const hasJourneyBack =
    Boolean(
      journeyBackLabel,
    )


  const journeyAlreadyReturnsToHarvests =
    journeyBackLabel ===
    'Harvests'


  function handlePrint() {
    window.print()
  }


  function handleExport() {
    window.print()
  }


  function handleDeleteHarvest(
    harvestToDelete:
      HarvestRecord,
  ) {
    const confirmed =
      window.confirm(
        `Delete this ${getHarvestTypeLabel(
          harvestToDelete,
        )}? This cannot be undone.`,
      )


    if (
      !confirmed
    ) {
      return
    }


    onDelete(
      harvestToDelete.id,
    )
  }


  return (
    <GardenLayout
      activePage="harvest"
      onNavigate={
        onNavigate
      }
    >
      <main className="journal-page harvest-detail-page">

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


          {!journeyAlreadyReturnsToHarvests && (
            <button
              type="button"
              className="garden-return-button"
              onClick={
                onOpenHarvests
              }
            >
              ← Harvests
            </button>
          )}

        </div>


        {/* =======================================
            HEADER
        ======================================= */}

        <header className="journal-header harvest-detail-header">
          <div>
            <p className="section-label">
              Harvest story
            </p>


            {matchingPlants.length ===
            1 ? (
              <h1>
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    onOpenPlant(
                      matchingPlants[0].id,
                    )
                  }
                >
                  {plantNames}
                </button>
              </h1>
            ) : (
              <h1>
                {plantNames}
              </h1>
            )}


            <p className="journal-intro">
              {storyHarvests.length}{' '}
              {storyHarvests.length ===
              1
                ? 'harvest'
                : 'harvests'}
              {totalMeasurement
                ? ` · ${totalMeasurement} recorded`
                : ''}
            </p>
          </div>
        </header>


        {/* =======================================
            STORY ACTIONS
        ======================================= */}

        <section
          className="harvest-detail-actions"
          aria-label="Harvest story actions"
        >
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              onRecordAnotherHarvest(
                harvest,
              )
            }
          >
            🧺 Record another harvest
          </button>


          <button
            type="button"
            className="secondary-button"
            onClick={
              handlePrint
            }
          >
            🖨 Print
          </button>


          <button
            type="button"
            className="secondary-button"
            onClick={
              handleExport
            }
          >
            📤 Export
          </button>
        </section>


        {/* =======================================
            STORY SUMMARY
        ======================================= */}

        <article className="journal-entry harvest-detail-card">
          <div className="journal-entry-marker">
            🌾
          </div>


          <div className="journal-entry-content">
            <h2>
              Harvest summary
            </h2>


            <dl className="harvest-detail-list">
              <div>
                <dt>
                  Harvests recorded
                </dt>

                <dd>
                  {
                    storyHarvests.length
                  }
                </dd>
              </div>


              {totalCount !==
                undefined && (
                <div>
                  <dt>
                    Total count
                  </dt>

                  <dd>
                    {
                      totalCount
                    }
                  </dd>
                </div>
              )}


              {totalMeasurement && (
                <div>
                  <dt>
                    Total gathered
                  </dt>

                  <dd>
                    {
                      totalMeasurement
                    }
                  </dd>
                </div>
              )}


              {storyHarvests.length >
                0 && (
                <div>
                  <dt>
                    First harvest
                  </dt>

                  <dd>
                    {formatDate(
                      storyHarvests[0]
                        .date,
                    )}
                  </dd>
                </div>
              )}


              {storyHarvests.length >
                1 && (
                <div>
                  <dt>
                    Latest harvest
                  </dt>

                  <dd>
                    {formatDate(
                      storyHarvests[
                        storyHarvests.length -
                        1
                      ].date,
                    )}
                  </dd>
                </div>
              )}
            </dl>


            {matchingPlants.length >
              0 && (
              <section className="harvest-detail-section">
                <h3>
                  Gathered from
                </h3>


                {matchingPlants.map(
                  (
                    plant,
                  ) => (
                    <p
                      key={
                        plant.id
                      }
                    >
                      🌱{' '}

                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          onOpenPlant(
                            plant.id,
                          )
                        }
                      >
                        {
                          plant.displayName
                        }
                      </button>
                    </p>
                  ),
                )}
              </section>
            )}
          </div>
        </article>


        {/* =======================================
            INDIVIDUAL HARVESTS
        ======================================= */}

        <section className="journal-list">
          {storyHarvests.map(
            (
              storyHarvest,
              index,
            ) => (
              <article
                key={
                  storyHarvest.id
                }
                className="journal-entry harvest-detail-card"
              >
                <div className="journal-entry-marker">
                  🧺
                </div>


                <div className="journal-entry-content">
                  <div className="journal-entry-top">
                    <div>
                      <p className="journal-entry-source plant-source">
                        Harvest{' '}
                        {index + 1}
                      </p>


                      <time>
                        {formatDate(
                          storyHarvest.date,
                        )}
                      </time>
                    </div>
                  </div>


                  <h2>
                    {getHarvestTypeLabel(
                      storyHarvest,
                    )}
                  </h2>


                  <dl className="harvest-detail-list">
                    <div>
                      <dt>
                        Gathered
                      </dt>

                      <dd>
                        {getHarvestAmount(
                          storyHarvest,
                        )}
                      </dd>
                    </div>


                    <div>
                      <dt>
                        How it was
                      </dt>

                      <dd>
                        {getQualityLabel(
                          storyHarvest,
                        )}
                      </dd>
                    </div>


                    <div>
                      <dt>
                        From here
                      </dt>

                      <dd>
                        {getPlantOutcomeLabel(
                          storyHarvest,
                        )}
                      </dd>
                    </div>
                  </dl>


                  {storyHarvest.notes && (
                    <section className="harvest-detail-section">
                      <h3>
                        Notes to the harvest
                      </h3>


                      <p className="journal-notes">
                        {
                          storyHarvest.notes
                        }
                      </p>
                    </section>
                  )}


                  <SprigPhotoGallery
                    photoUrls={
                      storyHarvest.photoUrls ??
                      []
                    }

                    title="Harvest photographs"

                    emptyMessage="No photographs have been tucked into this harvest yet."

                    photoAltPrefix="Harvest photograph"
                  />


                  <section className="harvest-detail-section harvest-detail-record-info">
                    <p>
                      <strong>
                        Created:
                      </strong>{' '}

                      {formatDate(
                        storyHarvest.createdAt,
                      )}
                    </p>


                    {storyHarvest.updatedAt && (
                      <p>
                        <strong>
                          Last edited:
                        </strong>{' '}

                        {formatDate(
                          storyHarvest.updatedAt,
                        )}
                      </p>
                    )}
                  </section>


                  <div className="harvest-detail-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        onEdit(
                          storyHarvest,
                        )
                      }
                    >
                      ✏ Edit
                    </button>


                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        handleDeleteHarvest(
                          storyHarvest,
                        )
                      }
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </article>
            ),
          )}
        </section>
      </main>
    </GardenLayout>
  )
}