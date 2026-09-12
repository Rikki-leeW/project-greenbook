import type {
  PlantStory,
} from '../../types'


type DurationDisplayUnit =
  | 'days'
  | 'weeks'
  | 'months'


interface PlantCardProps {
  plant: PlantStory

  growingPlaceName?: string

  latestActivityDate?: string

  latestActivitySummary?: string

  thumbnailPhotoUrl?: string

  ageUnit?: DurationDisplayUnit

  onOpen: (
    plantId: string,
  ) => void

  compareMode?: boolean

  isSelectedForComparison?: boolean

  onToggleComparison?: (
    plantId: string,
  ) => void
}


/* =======================================
   DATE
======================================= */

function formatShortDate(
  date: string,
): string {
  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString(
    'en-AU',
    {
      day: 'numeric',
      month: 'short',
    },
  )
}


/* =======================================
   AGE
======================================= */

function getDaysBetweenDates(
  startDate: string,
  endDate?: string,
): number {
  const start = new Date(
    `${startDate}T00:00:00`,
  )

  let end: Date

  if (
    endDate
  ) {
    end = new Date(
      `${endDate}T00:00:00`,
    )
  }
  else {
    const today =
      new Date()

    end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    )
  }

  return Math.max(
    0,
    Math.floor(
      (
        end.getTime() -
        start.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        ),
    ),
  )
}


function formatAge(
  daysGrowing: number,
  unit: DurationDisplayUnit,
): string {
  if (
    unit ===
    'weeks'
  ) {
    const weeks =
      daysGrowing / 7

    return `${Number(
      weeks.toFixed(1),
    )} ${
      weeks === 1
        ? 'week'
        : 'weeks'
    } growing`
  }


  if (
    unit ===
    'months'
  ) {
    const months =
      daysGrowing /
      30.4375

    return `${Number(
      months.toFixed(1),
    )} ${
      months === 1
        ? 'month'
        : 'months'
    } growing`
  }


  return `${daysGrowing} ${
    daysGrowing === 1
      ? 'day'
      : 'days'
  } growing`
}


/* =======================================
   CARD
======================================= */

export default function PlantCard({
  plant,
  growingPlaceName,
  latestActivityDate,
  latestActivitySummary,
  thumbnailPhotoUrl,
  ageUnit = 'weeks',
  onOpen,
  compareMode = false,
  isSelectedForComparison = false,
  onToggleComparison,
}: PlantCardProps) {

  /*
   * A completed Plant Story stops ageing
   * when its story ends.
   *
   * Growing stories continue to count
   * through today.
   */
  const ageEndDate =
    plant.status ===
      'finished'
      ? plant.completedAt
      : undefined


  const daysGrowing =
    getDaysBetweenDates(
      plant.plantedDate,
      ageEndDate,
    )


  const cropLabel =
    plant.plantName.trim()


  const locationLabel =
    growingPlaceName?.trim()


  function handleCardClick() {
    if (
      compareMode
    ) {
      onToggleComparison?.(
        plant.id,
      )

      return
    }

    onOpen(
      plant.id,
    )
  }


  return (
    <button
      type="button"
      className={[
        'plant-card',
        'plant-card-button',
        'plant-card-compact',

        thumbnailPhotoUrl
          ? 'plant-card-with-thumbnail'
          : '',

        compareMode
          ? 'plant-card-compare-mode'
          : '',

        isSelectedForComparison
          ? 'plant-card-compare-selected'
          : '',
      ]
        .filter(
          Boolean,
        )
        .join(
          ' ',
        )}
      onClick={
        handleCardClick
      }
      aria-label={
        compareMode
          ? `${
              isSelectedForComparison
                ? 'Remove'
                : 'Select'
            } ${
              plant.displayName
            } ${
              isSelectedForComparison
                ? 'from'
                : 'for'
            } comparison`
          : `Open the story for ${
              plant.displayName
            }`
      }
      aria-pressed={
        compareMode
          ? isSelectedForComparison
          : undefined
      }
    >
      <div className="plant-card-content">

        <div className="plant-card-compact-heading">
          <div className="plant-card-compact-title">
            <h3>
              {plant.displayName}
            </h3>

            <p className="plant-card-identity">
              <span>
                {cropLabel}
              </span>

              {locationLabel && (
                <>
                  <span
                    className="plant-card-separator"
                    aria-hidden="true"
                  >
                    ·
                  </span>

                  <span>
                    {locationLabel}
                  </span>
                </>
              )}
            </p>
          </div>


          <span
            className={[
              'status-pill',

              plant.status ===
                'finished'
                ? 'plant-status-finished'
                : '',
            ]
              .filter(
                Boolean,
              )
              .join(
                ' ',
              )}
          >
            {compareMode
              ? isSelectedForComparison
                ? '✓ Selected'
                : 'Select'
              : plant.status}
          </span>
        </div>


        <div className="plant-card-compact-meta">
          <span>
            Planted{' '}

            {formatShortDate(
              plant.plantedDate,
            )}
          </span>

          <span
            className="plant-card-separator"
            aria-hidden="true"
          >
            ·
          </span>

          <strong>
            {formatAge(
              daysGrowing,
              ageUnit,
            )}
          </strong>
        </div>

        {latestActivityDate &&
  (
    latestActivitySummary ||
    latestActivityDate !==
      plant.plantedDate
  ) && (
            <div className="plant-card-latest-activity">
              <strong>
                Latest ·{' '}
                {formatShortDate(
                  latestActivityDate,
                )}
              </strong>

              {latestActivitySummary && (
                <span>
                  {' '}
                  ·{' '}
                  {latestActivitySummary}
                </span>
              )}
            </div>
          )}


        <span className="open-story">
          {compareMode
            ? isSelectedForComparison
              ? 'Selected for comparison'
              : 'Add to comparison'
            : 'Open story →'}
        </span>
      </div>


      {thumbnailPhotoUrl && (
        <span
          className="plant-card-thumbnail"
          aria-hidden="true"
        >
          <img
            src={
              thumbnailPhotoUrl
            }
            alt=""
            loading="lazy"
          />
        </span>
      )}
    </button>
  )
}