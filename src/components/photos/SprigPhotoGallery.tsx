import {
    useEffect,
    useState,
  } from 'react'
  
  
  interface SprigPhotoGalleryProps {
    photoUrls: string[]
  
    title?: string
  
    emptyMessage?: string
  
    photoAltPrefix?: string
  }
  
  
  export default function SprigPhotoGallery({
    photoUrls,
    title = 'Photographs',
    emptyMessage = 'No photographs have been tucked into this page yet.',
    photoAltPrefix = 'Sprig photograph',
  }: SprigPhotoGalleryProps) {
    const [
      activePhotoIndex,
      setActivePhotoIndex,
    ] =
      useState<number | null>(
        null,
      )
  
  
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
  
  
    /* =======================================
       CLOSE ENLARGED PHOTO
    ======================================= */
  
    function closePhotoViewer() {
      setActivePhotoIndex(
        null,
      )
    }
  
  
    /* =======================================
       KEYBOARD SUPPORT
    ======================================= */
  
    useEffect(() => {
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
          setActivePhotoIndex(
            (currentIndex) => {
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
  
          return
        }
  
  
        if (
          event.key ===
            'ArrowLeft' &&
          photoUrls.length >
            1
        ) {
          setActivePhotoIndex(
            (currentIndex) => {
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
    }, [
      activePhotoIndex,
      photoUrls.length,
    ])
  
  
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
            ) => (
              <button
                key={`${photoUrl.slice(
                  0,
                  30,
                )}-${index}`}
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
            ),
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
              className="sprig-photo-viewer-inner"
              role="dialog"
              aria-modal="true"
              aria-label="Enlarged photograph"
              onClick={(
                event,
              ) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                className="sprig-photo-viewer-close"
                onClick={
                  closePhotoViewer
                }
                aria-label="Close photograph"
              >
                ×
              </button>
  
  
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
  
  
              {photoUrls.length >
                1 && (
                <div className="sprig-photo-viewer-navigation">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setActivePhotoIndex(
                        (
                          currentIndex,
                        ) => {
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
                    onClick={() =>
                      setActivePhotoIndex(
                        (
                          currentIndex,
                        ) => {
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