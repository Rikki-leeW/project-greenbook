import type {
  PlantStory,
} from '../../types'


interface PlantCardProps {
  plant: PlantStory

  growingPlaceName?: string

  latestActivityDate?: string

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
   GROWING AGE
======================================= */

function getDaysGrowing(
  plantedDate: string,
): number {
  const planted =
    new Date(
      `${plantedDate}T00:00:00`,
    )

  const today =
    new Date()

  const todayAtMidnight =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    )

  return Math.max(
    0,
    Math.floor(
      (
        todayAtMidnight.getTime() -
        planted.getTime()
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


/* =======================================
   CARD
======================================= */

export default function PlantCard({
  plant,
  growingPlaceName,
  latestActivityDate,
  onOpen,
  compareMode = false,
  isSelectedForComparison = false,
  onToggleComparison,
}: PlantCardProps) {
  const daysGrowing =
    getDaysGrowing(
      plant.plantedDate,
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
            } ${plant.displayName} ${
              isSelectedForComparison
                ? 'from'
                : 'for'
            } comparison`
          : `Open the story for ${plant.displayName}`
      }
      aria-pressed={
        compareMode
          ? isSelectedForComparison
          : undefined
      }
    >
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
          {daysGrowing}{' '}
          {daysGrowing ===
          1
            ? 'day'
            : 'days'}{' '}
          growing
        </strong>
      </div>


      {latestActivityDate &&
        latestActivityDate !==
          plant.plantedDate && (
          <p className="plant-card-latest-activity">
            Latest activity{' '}
            {formatShortDate(
              latestActivityDate,
            )}
          </p>
        )}


      <span className="open-story">
        {compareMode
          ? isSelectedForComparison
            ? 'Selected for comparison'
            : 'Add to comparison'
          : 'Open story →'}
      </span>
    </button>
  )
}