import GardenLayout from '../components/layout/GardenLayout'

import type {
  HarvestMeasurementUnit,
  HarvestRecord,
  PlantStory,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface HarvestProps {
  harvests: HarvestRecord[]

  plants: PlantStory[]

  onRecordHarvest: () => void

  onOpenHarvest: (
    harvestId: string,
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
   HARVEST STORY KEY
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
   PLANT NAMES
======================================= */

function getPlantNames(
  harvest: HarvestRecord,
  plants: PlantStory[],
): string {
  const matchingPlants =
    plants.filter(
      (
        plant,
      ) =>
        harvest.plantStoryIds.includes(
          plant.id,
        ),
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


  const weightUnits:
    HarvestMeasurementUnit[] = [
      'gram',
      'kilogram',
    ]


  const volumeUnits:
    HarvestMeasurementUnit[] = [
      'millilitre',
      'litre',
    ]


  const allWeights =
    measuredHarvests.every(
      (
        harvest,
      ) =>
        harvest.measurementUnit !==
          undefined &&
        weightUnits.includes(
          harvest.measurementUnit,
        ),
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
        harvest.measurementUnit !==
          undefined &&
        volumeUnits.includes(
          harvest.measurementUnit,
        ),
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


  /*
   * Do not invent a combined total for
   * incompatible measures such as a bunch
   * plus a basket.
   */
  return undefined
}


/* =======================================
   HARVEST STORIES
======================================= */

interface HarvestStory {
  key: string

  harvests: HarvestRecord[]

  representativeHarvest:
    HarvestRecord

  latestHarvest:
    HarvestRecord

  earliestHarvest:
    HarvestRecord
}


function buildHarvestStories(
  harvests: HarvestRecord[],
): HarvestStory[] {
  const harvestsByStory =
    new Map<
      string,
      HarvestRecord[]
    >()


  harvests.forEach(
    (
      harvest,
    ) => {
      const key =
        getHarvestStoryKey(
          harvest,
        )


      const current =
        harvestsByStory.get(
          key,
        ) ??
        []


      harvestsByStory.set(
        key,
        [
          ...current,
          harvest,
        ],
      )
    },
  )


  return Array.from(
    harvestsByStory.entries(),
  )
    .map(
      (
        [
          key,
          storyHarvests,
        ],
      ) => {
        const sortedHarvests = [
          ...storyHarvests,
        ].sort(
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


        const latestHarvest =
          sortedHarvests[0]


        const earliestHarvest =
          sortedHarvests[
            sortedHarvests.length -
            1
          ]


        return {
          key,

          harvests:
            sortedHarvests,

          representativeHarvest:
            latestHarvest,

          latestHarvest,

          earliestHarvest,
        }
      },
    )
    .sort(
      (
        first,
        second,
      ) =>
        new Date(
          second.latestHarvest.date,
        ).getTime() -
        new Date(
          first.latestHarvest.date,
        ).getTime(),
    )
}


/* =======================================
   HARVEST PAGE
======================================= */

export default function Harvest({
  harvests,
  plants,
  onRecordHarvest,
  onOpenHarvest,
  onNavigate,
}: HarvestProps) {
  const harvestStories =
    buildHarvestStories(
      harvests,
    )


  return (
    <GardenLayout
      activePage="harvest"
      onNavigate={
        onNavigate
      }
    >
      <div className="journal-page">
        <header className="journal-header">
          <div>
            <p className="section-label">
              Sprig&apos;s harvest ledger
            </p>


            <h1>
              Harvest
            </h1>


            <p className="journal-intro">
              The baskets, pickings and
              plenty gathered from the
              garden, remembered as whole
              harvest stories.
            </p>
          </div>


          <button
            type="button"
            className="journal-add-button"
            onClick={
              onRecordHarvest
            }
          >
            🧺 Gather a harvest
          </button>
        </header>


        <section className="journal-list">
          {harvestStories.length >
          0 ? (
            harvestStories.map(
              (
                story,
              ) => {
                const totalCount =
                  getTotalCount(
                    story.harvests,
                  )


                const totalMeasurement =
                  getTotalMeasurement(
                    story.harvests,
                  )


                const harvestCount =
                  story.harvests.length


                return (
                  <article
                    key={
                      story.key
                    }
                    className="journal-entry harvest-ledger-entry"
                  >
                    <div className="journal-entry-marker">
                      🧺
                    </div>


                    <div className="journal-entry-content">
                      <div className="journal-entry-top">
                        <div>
                          <p className="journal-entry-source plant-source">
                            🌱{' '}
                            {getPlantNames(
                              story.representativeHarvest,
                              plants,
                            )}
                          </p>


                          <time>
                            Latest harvest{' '}
                            {formatDate(
                              story.latestHarvest.date,
                            )}
                          </time>
                        </div>
                      </div>


                      <h2>
                        {harvestCount}{' '}
                        {harvestCount ===
                        1
                          ? 'harvest'
                          : 'harvests'}
                      </h2>


                      {story.earliestHarvest
                        .date !==
                        story.latestHarvest
                          .date && (
                        <p>
                          <strong>
                            First recorded:
                          </strong>{' '}

                          {formatDate(
                            story.earliestHarvest.date,
                          )}
                        </p>
                      )}


                      {totalCount !==
                        undefined && (
                        <p>
                          <strong>
                            Total count:
                          </strong>{' '}

                          {totalCount}
                        </p>
                      )}


                      {totalMeasurement && (
                        <p className="journal-product">
                          <strong>
                            Total gathered:
                          </strong>{' '}

                          {
                            totalMeasurement
                          }
                        </p>
                      )}


                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          onOpenHarvest(
                            story.representativeHarvest
                              .id,
                          )
                        }
                      >
                        Open Harvest
                      </button>
                    </div>
                  </article>
                )
              },
            )
          ) : (
            <div className="journal-empty">
              <span>
                🧺
              </span>


              <h2>
                The baskets are still empty
              </h2>


              <p>
                Sprig has not gathered a
                Harvest Record yet.
              </p>


              <button
                type="button"
                className="text-button"
                onClick={
                  onRecordHarvest
                }
              >
                Gather the first harvest
              </button>
            </div>
          )}
        </section>
      </div>
    </GardenLayout>
  )
}