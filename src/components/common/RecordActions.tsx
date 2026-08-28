interface RecordActionsProps {
  /* =======================================
     CONTEXTUAL NAVIGATION
  ======================================= */

  contextualBackLabel?: string

  onContextualBack?: () => void

  /* =======================================
     STANDARD ACTIONS
  ======================================= */

  onBack?: () => void

  onEdit?: () => void

  onDuplicate?: () => void

  onRate?: () => void

  onFavourite?: () => void

  onArchive?: () => void

  onRestore?: () => void

  onDelete?: () => void

  /* =======================================
     RECORD STATE
  ======================================= */

  isFavourite?: boolean

  rating?: number

  /* =======================================
     LABELS
  ======================================= */

  backLabel?: string

  editLabel?: string

  duplicateLabel?: string

  rateLabel?: string

  favouriteLabel?: string

  archiveLabel?: string

  restoreLabel?: string

  deleteLabel?: string
}


export default function RecordActions({
  contextualBackLabel,
  onContextualBack,

  onBack,
  onEdit,
  onDuplicate,
  onRate,
  onFavourite,
  onArchive,
  onRestore,
  onDelete,

  isFavourite = false,
  rating,

  backLabel = 'Back',
  editLabel = 'Edit',
  duplicateLabel = 'Create a variation',
  rateLabel = 'Rate',
  favouriteLabel,
  archiveLabel = 'Archive',
  restoreLabel = 'Restore',
  deleteLabel = 'Delete permanently',
}: RecordActionsProps) {

  /* =======================================
     FAVOURITE LABEL
  ======================================= */

  const resolvedFavouriteLabel =
    favouriteLabel ??
    (
      isFavourite
        ? 'Remove from favourites'
        : 'Add to favourites'
    )


  return (
    <div className="record-actions">

      {/* =======================================
          NAVIGATION
      ======================================= */}

      {onContextualBack &&
        contextualBackLabel && (
          <button
            type="button"
            className="record-action-button record-action-back record-action-contextual-back"
            onClick={
              onContextualBack
            }
          >
            ← {contextualBackLabel}
          </button>
        )}


      {onBack && (
        <button
          type="button"
          className="record-action-button record-action-back"
          onClick={
            onBack
          }
        >
          ← {backLabel}
        </button>
      )}


      {/* =======================================
          EVERYDAY ACTIONS
      ======================================= */}

      <div className="record-actions-primary">

        {onEdit && (
          <button
            type="button"
            className="record-action-button"
            onClick={
              onEdit
            }
          >
            ✏️ {editLabel}
          </button>
        )}


        {onDuplicate && (
          <button
            type="button"
            className="record-action-button"
            onClick={
              onDuplicate
            }
          >
            🌱 {duplicateLabel}
          </button>
        )}


        {onRate && (
          <button
            type="button"
            className="record-action-button"
            onClick={
              onRate
            }
          >
            ⭐ {rateLabel}

            {typeof rating ===
            'number'
              ? ` (${rating}/5)`
              : ''}
          </button>
        )}


        {onFavourite && (
          <button
            type="button"
            className="record-action-button"
            onClick={
              onFavourite
            }
            aria-pressed={
              isFavourite
            }
          >
            {isFavourite
              ? '★'
              : '☆'}{' '}
            {
              resolvedFavouriteLabel
            }
          </button>
        )}

      </div>


      {/* =======================================
          RECORD LIFECYCLE
      ======================================= */}

      {(onArchive ||
        onRestore ||
        onDelete) && (
        <div className="record-actions-secondary">

          {onArchive && (
            <button
              type="button"
              className="record-action-button record-action-archive"
              onClick={
                onArchive
              }
            >
              📦 {archiveLabel}
            </button>
          )}


          {onRestore && (
            <button
              type="button"
              className="record-action-button record-action-restore"
              onClick={
                onRestore
              }
            >
              🌱 {restoreLabel}
            </button>
          )}


          {onDelete && (
            <button
              type="button"
              className="record-action-button record-action-delete"
              onClick={
                onDelete
              }
            >
              🗑 {deleteLabel}
            </button>
          )}

        </div>
      )}

    </div>
  )
}