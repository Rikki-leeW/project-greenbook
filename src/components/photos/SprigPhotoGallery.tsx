import {
  useEffect,
  useState,
} from 'react'
import { useModalDialog } from '../../hooks/useModalDialog'


/* =======================================
   TYPES
======================================= */

export type SprigDurationDisplayUnit =
  | 'days'
  | 'weeks'
  | 'months'


export interface SprigPhotoAgeContext {
  days: number
}


export interface SprigPhotoContext {
  heading?: string

  detail?: string

  age?: SprigPhotoAgeContext

  actionLabel?: string

  onAction?: () => void

  secondaryActionLabel?: string

  onSecondaryAction?: () => void
}


interface SprigPhotoGalleryProps {
  photoUrls: string[]

  title?: string

  emptyMessage?: string

  photoAltPrefix?: string

  photoContexts?: (
    | SprigPhotoContext
    | undefined
  )[]

  durationDisplayUnit?: SprigDurationDisplayUnit

  onDurationDisplayUnitChange?: (
    unit: SprigDurationDisplayUnit,
  ) => void

  showDurationUnitPicker?: boolean
}


/* =======================================
   DURATION DISPLAY
======================================= */

function formatPhotoAge(
  days: number,
  unit: SprigDurationDisplayUnit,
): string {
  const safeDays =
    Math.max(
      0,
      Math.round(
        days,
      ),
    )

  if (
    unit ===
    'days'
  ) {
    return `${safeDays} ${
      safeDays === 1
        ? 'day'
        : 'days'
    } old`
  }

  if (
    unit ===
    'weeks'
  ) {
    const weeks =
      safeDays /
      7

    const roundedWeeks =
      Math.round(
        weeks *
          10,
      ) /
      10

    return `${roundedWeeks} ${
      roundedWeeks === 1
        ? 'week'
        : 'weeks'
    } old`
  }

  const months =
    safeDays /
    30.4375

  const roundedMonths =
    Math.round(
      months *
        10,
    ) /
    10

  return `${roundedMonths} ${
    roundedMonths === 1
      ? 'month'
      : 'months'
  } old`
}


/* =======================================
   PHOTO GALLERY
======================================= */

export default function SprigPhotoGallery({
  photoUrls,

  title =
    'Photographs',

  emptyMessage =
    'No photographs have been tucked into this page yet.',

  photoAltPrefix =
    'Sprig photograph',

  photoContexts,

  durationDisplayUnit:
    controlledDurationDisplayUnit,

  onDurationDisplayUnitChange,

  showDurationUnitPicker = true,
}: SprigPhotoGalleryProps) {
  const [
    activePhotoIndex,
    setActivePhotoIndex,
  ] =
    useState<number | null>(
      null,
    )

  const [
    internalDurationDisplayUnit,
    setInternalDurationDisplayUnit,
  ] =
    useState<SprigDurationDisplayUnit>(
      'weeks',
    )


  const durationDisplayUnit =
    controlledDurationDisplayUnit ??
    internalDurationDisplayUnit


  function changeDurationDisplayUnit(
    unit: SprigDurationDisplayUnit,
  ) {
    if (
      controlledDurationDisplayUnit ===
      undefined
    ) {
      setInternalDurationDisplayUnit(
        unit,
      )
    }

    onDurationDisplayUnitChange?.(
      unit,
    )
  }


  /* =======================================
     ACTIVE PHOTO
  ======================================= */

  const activePhoto =
    activePhotoIndex !==
      null
      ? photoUrls[
          activePhotoIndex
        ]
      : undefined


  const activePhotoContext =
    activePhotoIndex !==
      null
      ? photoContexts?.[
          activePhotoIndex
        ]
      : undefined


  /* =======================================
     CLOSE ENLARGED PHOTO
  ======================================= */

  function closePhotoViewer() {
    setActivePhotoIndex(
      null,
    )
  }

  const viewerDialogRef = useModalDialog<HTMLDivElement>(
    closePhotoViewer,
    Boolean(activePhoto),
  )


  /* =======================================
     PREVIOUS PHOTO
  ======================================= */

  function showPreviousPhoto() {
    setActivePhotoIndex(
      currentIndex => {
        if (
          currentIndex ===
          null
        ) {
          return 0
        }

        return (
          currentIndex -
          1 +
          photoUrls.length
        ) %
          photoUrls.length
      },
    )
  }


  /* =======================================
     NEXT PHOTO
  ======================================= */

  function showNextPhoto() {
    setActivePhotoIndex(
      currentIndex => {
        if (
          currentIndex ===
          null
        ) {
          return 0
        }

        return (
          currentIndex +
          1
        ) %
          photoUrls.length
      },
    )
  }


  /* =======================================
     CONTEXT ACTION
  ======================================= */

  function handleContextAction() {
    if (
      !activePhotoContext
        ?.onAction
    ) {
      return
    }

    closePhotoViewer()

    activePhotoContext
      .onAction()
  }


  function handleSecondaryContextAction() {
    if (
      !activePhotoContext
        ?.onSecondaryAction
    ) {
      return
    }

    closePhotoViewer()

    activePhotoContext
      .onSecondaryAction()
  }


  /* =======================================
     KEYBOARD SUPPORT
  ======================================= */

  useEffect(
    () => {
      if (
        activePhotoIndex ===
        null
      ) {
        return
      }

      function handleKeyDown(
        event: KeyboardEvent,
      ) {
        if (
          event.key ===
          'Escape'
        ) {
          closePhotoViewer()

          return
        }

        if (
          event.key ===
            'ArrowRight' &&
          photoUrls.length >
            1
        ) {
          showNextPhoto()

          return
        }

        if (
          event.key ===
            'ArrowLeft' &&
          photoUrls.length >
            1
        ) {
          showPreviousPhoto()
        }
      }

      window.addEventListener(
        'keydown',
        handleKeyDown,
      )

      return () => {
        window.removeEventListener(
          'keydown',
          handleKeyDown,
        )
      }
    },
    [
      activePhotoIndex,
      photoUrls.length,
    ],
  )


  /* =======================================
     PHOTO LIST CHANGED
  ======================================= */

  useEffect(
    () => {
      if (
        activePhotoIndex ===
        null
      ) {
        return
      }

      if (
        activePhotoIndex >=
        photoUrls.length
      ) {
        setActivePhotoIndex(
          null,
        )
      }
    },
    [
      activePhotoIndex,
      photoUrls.length,
    ],
  )


  /* =======================================
     EMPTY GALLERY
  ======================================= */

  if (
    photoUrls.length ===
    0
  ) {
    return (
      <section className="sprig-photo-gallery">
        <h3 className="sprig-photo-gallery-title">
          {title}
        </h3>

        <p>
          {emptyMessage}
        </p>
      </section>
    )
  }


  return (
    <section className="sprig-photo-gallery">
      {/* =======================================
          TITLE
      ======================================= */}

      <h3 className="sprig-photo-gallery-title">
        {title}
      </h3>


      {/* =======================================
          THUMBNAILS
      ======================================= */}

      <div className="sprig-photo-gallery-grid">
        {photoUrls.map(
          (
            photoUrl,
            index,
          ) => {
            const photoContext =
              photoContexts?.[
                index
              ]

            return (
              <div
                key={`${photoUrl.slice(
                  0,
                  30,
                )}-${index}`}
                className="sprig-photo-gallery-entry"
              >
                <button
                  type="button"
                  className="sprig-photo-gallery-item"
                  onClick={() =>
                    setActivePhotoIndex(
                      index,
                    )
                  }
                  aria-label={`Open ${photoAltPrefix.toLowerCase()} ${
                    index + 1
                  }`}
                >
                  <img
                    className="sprig-photo-gallery-thumbnail"
                    src={
                      photoUrl
                    }
                    alt={`${photoAltPrefix} ${
                      index + 1
                    }`}
                  />
                </button>


                {photoContext && (
                  <div className="sprig-photo-gallery-context">
                    {photoContext.heading && (
                      <p className="sprig-photo-gallery-context-heading">
                        {
                          photoContext.heading
                        }
                      </p>
                    )}

                    {photoContext.detail && (
                      <p className="sprig-photo-gallery-context-detail">
                        {
                          photoContext.detail
                        }
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          },
        )}
      </div>


      {/* =======================================
          ENLARGED PHOTO VIEWER
      ======================================= */}

      {activePhoto && (
        <div
          className="sprig-photo-viewer"
          role="presentation"
          onClick={
            closePhotoViewer
          }
        >
          <div
            ref={viewerDialogRef}
            className="sprig-photo-viewer-inner"
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged photograph"
            onClick={
              event =>
                event.stopPropagation()
            }
          >
            {/* =======================================
                CLOSE
            ======================================= */}

            <button
              data-dialog-initial-focus
              type="button"
              className="sprig-photo-viewer-close"
              onClick={
                closePhotoViewer
              }
              aria-label="Close photograph"
            >
              ×
            </button>


            {/* =======================================
                FULL PHOTOGRAPH
            ======================================= */}

            <img
              className="sprig-photo-viewer-image"
              src={
                activePhoto
              }
              alt={`${photoAltPrefix} ${
                (
                  activePhotoIndex ??
                  0
                ) + 1
              }`}
            />


            {/* =======================================
                PHOTO CONTEXT
            ======================================= */}

            {activePhotoContext && (
              <div className="sprig-photo-viewer-context">
                {activePhotoContext.heading && (
                  <p className="sprig-photo-viewer-context-heading">
                    {
                      activePhotoContext.heading
                    }
                  </p>
                )}

                {activePhotoContext.detail && (
                  <p className="sprig-photo-viewer-context-detail">
                    {
                      activePhotoContext.detail
                    }
                  </p>
                )}


                {activePhotoContext.age && (
                  <div className="sprig-photo-viewer-age">
                    <div className="sprig-photo-viewer-age-copy">
                      <span>
                        Plant age
                      </span>

                      <strong>
                        {formatPhotoAge(
                          activePhotoContext
                            .age
                            .days,
                          durationDisplayUnit,
                        )}
                      </strong>
                    </div>


                    {showDurationUnitPicker && (
                      <div
                        className="sprig-duration-unit-picker"
                        role="group"
                        aria-label="Plant age display"
                      >
                        <button
                          type="button"
                          className={
                            durationDisplayUnit ===
                            'days'
                              ? 'selected'
                              : ''
                          }
                          aria-pressed={
                            durationDisplayUnit ===
                            'days'
                          }
                          onClick={() =>
                            changeDurationDisplayUnit(
                              'days',
                            )
                          }
                        >
                          Days
                        </button>

                        <button
                          type="button"
                          className={
                            durationDisplayUnit ===
                            'weeks'
                              ? 'selected'
                              : ''
                          }
                          aria-pressed={
                            durationDisplayUnit ===
                            'weeks'
                          }
                          onClick={() =>
                            changeDurationDisplayUnit(
                              'weeks',
                            )
                          }
                        >
                          Weeks
                        </button>

                        <button
                          type="button"
                          className={
                            durationDisplayUnit ===
                            'months'
                              ? 'selected'
                              : ''
                          }
                          aria-pressed={
                            durationDisplayUnit ===
                            'months'
                          }
                          onClick={() =>
                            changeDurationDisplayUnit(
                              'months',
                            )
                          }
                        >
                          Months
                        </button>
                      </div>
                    )}
                  </div>
                )}


                {(
                  activePhotoContext.actionLabel &&
                  activePhotoContext.onAction
                ) || (
                  activePhotoContext.secondaryActionLabel &&
                  activePhotoContext.onSecondaryAction
                ) ? (
                  <div className="sprig-photo-viewer-context-action">
                    {activePhotoContext.actionLabel &&
                      activePhotoContext.onAction && (
                      <button
                        type="button"
                        className="text-button"
                        onClick={
                          handleContextAction
                        }
                      >
                        {
                          activePhotoContext.actionLabel
                        }
                      </button>
                    )}

                    {activePhotoContext.secondaryActionLabel &&
                      activePhotoContext.onSecondaryAction && (
                      <button
                        type="button"
                        className="text-button sprig-photo-viewer-remove-action"
                        onClick={
                          handleSecondaryContextAction
                        }
                      >
                        {
                          activePhotoContext.secondaryActionLabel
                        }
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            )}


            {/* =======================================
                NAVIGATION
            ======================================= */}

            {photoUrls.length >
              1 && (
              <div className="sprig-photo-viewer-navigation">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    showPreviousPhoto
                  }
                >
                  Previous
                </button>

                <p className="form-whisper">
                  {(
                    activePhotoIndex ??
                    0
                  ) + 1}{' '}
                  of{' '}
                  {
                    photoUrls.length
                  }
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    showNextPhoto
                  }
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
