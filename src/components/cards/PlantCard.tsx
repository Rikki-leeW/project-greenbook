import type {
  PlantStory,
} from '../../types'
import {
  getPlantDisplayName,
} from '../../utils/plantDisplayName'
import '../../css/cards/plantcard.css'


type DurationDisplayUnit =
  | 'days'
  | 'weeks'
  | 'months'


export interface PlantCardRichDetail {
  label: string
  value: string
}


interface PlantCardProps {
  plant: PlantStory
  growingPlaceName?: string
  latestActivityDate?: string
  latestActivitySummary?: string
  thumbnailPhotoUrl?: string
  ageUnit?: DurationDisplayUnit
  onOpen?: (
    plantId: string,
  ) => void

  /**
   * Optional richer information for the
   * Plants index.
   *
   * The shared card remains compact by
   * default. Relationship pickers such as
   * Harvest do not receive these details.
   */
  richDetails?: PlantCardRichDetail[]

  /**
   * Generic selection mode is used by
   * relationship pickers such as Harvest.
   *
   * Selecting a Plant Story here must not
   * navigate away from the current form.
   */
  selectionMode?: boolean
  isSelected?: boolean
  onToggleSelection?: (
    plantId: string,
  ) => void
  selectionContextLabel?: string

  /**
   * Existing Plants comparison behaviour is
   * deliberately preserved separately.
   */
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
    }`
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
    }`
  }

  return `${daysGrowing} ${
    daysGrowing === 1
      ? 'day'
      : 'days'
  }`
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
  richDetails = [],
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
  selectionContextLabel = 'this harvest',
  compareMode = false,
  isSelectedForComparison = false,
  onToggleComparison,
}: PlantCardProps) {
  /**
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

  const displayName =
    getPlantDisplayName(
      plant,
    )

  const locationLabel =
    growingPlaceName?.trim()

  const hasLatestActivity =
    Boolean(
      latestActivityDate &&
        (
          latestActivitySummary ||
          latestActivityDate !==
            plant.plantedDate
        ),
    )

  /*
   * Rich Plants-index context is reading
   * information, not selection information.
   * Keep relationship and comparison cards
   * deliberately compact.
   */
  const visibleRichDetails =
    !selectionMode &&
    !compareMode
      ? richDetails.filter(
          detail =>
            Boolean(
              detail.label.trim() &&
              detail.value.trim(),
            ),
        )
      : []

  const selected =
    selectionMode
      ? isSelected
      : compareMode
        ? isSelectedForComparison
        : false


  function handleCardClick() {
    if (
      selectionMode
    ) {
      onToggleSelection?.(
        plant.id,
      )
      return
    }

    if (
      compareMode
    ) {
      onToggleComparison?.(
        plant.id,
      )
      return
    }

    onOpen?.(
      plant.id,
    )
  }


  function getAriaLabel():
    string {
    if (
      selectionMode
    ) {
      return `${
        isSelected
          ? 'Remove'
          : 'Select'
      } ${displayName}${
        isSelected
          ? ' from this selection'
          : ''
      }`
    }

    if (
      compareMode
    ) {
      return `${
        isSelectedForComparison
          ? 'Remove'
          : 'Select'
      } ${displayName} ${
        isSelectedForComparison
          ? 'from'
          : 'for'
      } comparison`
    }

    return `Open the story for ${displayName}`
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
        visibleRichDetails.length >
        0
          ? 'plant-card-rich'
          : '',
        compareMode
          ? 'plant-card-compare-mode'
          : '',
        selectionMode
          ? 'plant-card-selection-mode'
          : '',
        selected
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
        getAriaLabel()
      }
      aria-pressed={
        selectionMode ||
        compareMode
          ? selected
          : undefined
      }
    >
      <span className="plant-card-content">
        <span className="plant-card-main">
          <span className="plant-card-heading-row">
            <span className="plant-card-title">
              {displayName}
            </span>

            <span className="plant-card-age">
              ·{' '}
              {formatAge(
                daysGrowing,
                ageUnit,
              )}
            </span>
          </span>

          <span className="plant-card-details">
            <span className="plant-card-planted-line">
              <strong>
                Planted:
              </strong>{' '}
              {formatShortDate(
                plant.plantedDate,
              )}

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
            </span>

            {hasLatestActivity && (
              <span className="plant-card-latest-activity">
                <strong>
                  Latest:
                </strong>{' '}

                {latestActivitySummary && (
                  <span>
                    {latestActivitySummary}
                  </span>
                )}

                {latestActivitySummary &&
                  latestActivityDate && (
                    <span
                      className="plant-card-separator"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                  )}

                {latestActivityDate && (
                  <span className="plant-card-latest-date">
                    {formatShortDate(
                      latestActivityDate,
                    )}
                  </span>
                )}
              </span>
            )}
          </span>

          {visibleRichDetails.length >
            0 && (
            <span className="plant-card-rich-details">
              {visibleRichDetails.map(
                detail => (
                  <span
                    key={`${detail.label}-${detail.value}`}
                    className="plant-card-rich-detail"
                  >
                    <span className="plant-card-rich-label">
                      {detail.label}
                    </span>

                    <span className="plant-card-rich-value">
                      {detail.value}
                    </span>
                  </span>
                ),
              )}
            </span>
          )}

          <span className="plant-card-actions">
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
              {selectionMode
                ? isSelected
                  ? '✓ Selected'
                  : 'Select'
                : compareMode
                  ? isSelectedForComparison
                    ? '✓ Selected'
                    : 'Select'
                  : plant.status}
            </span>

            <span className="open-story">
              {selectionMode
                ? isSelected
                  ? `Included in ${selectionContextLabel}`
                  : `Add to ${selectionContextLabel}`
                : compareMode
                  ? isSelectedForComparison
                    ? 'Selected for comparison'
                    : 'Add to comparison'
                  : 'Open story →'}
            </span>
          </span>
        </span>
      </span>

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
