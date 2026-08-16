interface RecordActionsProps {
    onBack?: () => void
  
    onEdit?: () => void
  
    onDuplicate?: () => void
  
    onRate?: () => void
  
    onFavourite?: () => void
  
    onArchive?: () => void
  
    onDelete?: () => void
  
    isFavourite?: boolean
  
    rating?: number
  
    backLabel?: string
  
    editLabel?: string
  
    duplicateLabel?: string
  
    rateLabel?: string
  
    favouriteLabel?: string
  
    archiveLabel?: string
  
    deleteLabel?: string
  }
  
  
  export default function RecordActions({
    onBack,
    onEdit,
    onDuplicate,
    onRate,
    onFavourite,
    onArchive,
    onDelete,
  
    isFavourite = false,
  
    rating,
  
    backLabel = 'Back',
    editLabel = 'Edit',
    duplicateLabel = 'Create a variation',
    rateLabel = 'Rate',
    favouriteLabel,
    archiveLabel = 'Archive',
    deleteLabel = 'Delete permanently',
  }: RecordActionsProps) {
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
  
        {onBack && (
          <button
            type="button"
            className="record-action-button record-action-back"
            onClick={onBack}
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
              onClick={onEdit}
            >
              ✏️ {editLabel}
            </button>
          )}
  
  
          {onDuplicate && (
            <button
              type="button"
              className="record-action-button"
              onClick={onDuplicate}
            >
              🌱 {duplicateLabel}
            </button>
          )}
  
  
          {onRate && (
            <button
              type="button"
              className="record-action-button"
              onClick={onRate}
            >
              ⭐ {rateLabel}
              {typeof rating === 'number'
                ? ` (${rating}/5)`
                : ''}
            </button>
          )}
  
  
          {onFavourite && (
            <button
              type="button"
              className="record-action-button"
              onClick={onFavourite}
              aria-pressed={isFavourite}
            >
              {isFavourite
                ? '★'
                : '☆'}{' '}
              {resolvedFavouriteLabel}
            </button>
          )}
  
        </div>
  
  
        {/* =======================================
            RECORD LIFECYCLE
        ======================================= */}
  
        {(onArchive ||
          onDelete) && (
          <div className="record-actions-secondary">
  
            {onArchive && (
              <button
                type="button"
                className="record-action-button record-action-archive"
                onClick={onArchive}
              >
                📦 {archiveLabel}
              </button>
            )}
  
  
            {onDelete && (
              <button
                type="button"
                className="record-action-button record-action-delete"
                onClick={onDelete}
              >
                🗑 {deleteLabel}
              </button>
            )}
  
          </div>
        )}
  
      </div>
    )
  }