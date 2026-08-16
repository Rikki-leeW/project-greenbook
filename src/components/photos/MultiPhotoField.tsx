import {
    useRef,
    useState,
    type ChangeEvent,
  } from 'react'
  
  
  interface MultiPhotoFieldProps {
    photoUrls: string[]
  
    onChange: (
      photoUrls: string[],
    ) => void
  
    title?: string
  
    helperText?: string
  
    emptyText?: string
  
    addButtonLabel?: string
  
    maxPhotos?: number
  }
  
  
  const DEFAULT_MAX_PHOTOS = 12
  
  const MAX_IMAGE_WIDTH = 1600
  
  const MAX_IMAGE_HEIGHT = 1600
  
  const JPEG_QUALITY = 0.78
  
  
  function resizeImage(
    file: File,
  ): Promise<string> {
    return new Promise(
      (
        resolve,
        reject,
      ) => {
        const reader =
          new FileReader()
  
  
        reader.onerror = () => {
          reject(
            new Error(
              'Could not read photograph.',
            ),
          )
        }
  
  
        reader.onload = () => {
          if (
            typeof reader.result !==
            'string'
          ) {
            reject(
              new Error(
                'Could not read photograph.',
              ),
            )
  
            return
          }
  
  
          const image =
            new Image()
  
  
          image.onerror = () => {
            reject(
              new Error(
                'Could not prepare photograph.',
              ),
            )
          }
  
  
          image.onload = () => {
            const originalWidth =
              image.naturalWidth
  
            const originalHeight =
              image.naturalHeight
  
  
            let nextWidth =
              originalWidth
  
            let nextHeight =
              originalHeight
  
  
            const widthScale =
              MAX_IMAGE_WIDTH /
              originalWidth
  
            const heightScale =
              MAX_IMAGE_HEIGHT /
              originalHeight
  
  
            const scale =
              Math.min(
                1,
                widthScale,
                heightScale,
              )
  
  
            nextWidth =
              Math.round(
                originalWidth *
                  scale,
              )
  
            nextHeight =
              Math.round(
                originalHeight *
                  scale,
              )
  
  
            const canvas =
              document.createElement(
                'canvas',
              )
  
  
            canvas.width =
              nextWidth
  
            canvas.height =
              nextHeight
  
  
            const context =
              canvas.getContext(
                '2d',
              )
  
  
            if (!context) {
              reject(
                new Error(
                  'Could not prepare photograph.',
                ),
              )
  
              return
            }
  
  
            context.drawImage(
              image,
              0,
              0,
              nextWidth,
              nextHeight,
            )
  
  
            const resizedPhoto =
              canvas.toDataURL(
                'image/jpeg',
                JPEG_QUALITY,
              )
  
  
            resolve(
              resizedPhoto,
            )
          }
  
  
          image.src =
            reader.result
        }
  
  
        reader.readAsDataURL(
          file,
        )
      },
    )
  }
  
  
  export default function MultiPhotoField({
    photoUrls,
    onChange,
  
    title =
      'Photographs',
  
    helperText =
      'Tuck a few garden photographs into this page.',
  
    emptyText =
      'No photographs have been tucked into this page yet.',
  
    addButtonLabel =
      'Add photographs',
  
    maxPhotos =
      DEFAULT_MAX_PHOTOS,
  }: MultiPhotoFieldProps) {
    const fileInputRef =
      useRef<HTMLInputElement>(
        null,
      )
  
  
    const [
      isPreparingPhotos,
      setIsPreparingPhotos,
    ] = useState(false)
  
  
    const [
      photoError,
      setPhotoError,
    ] =
      useState<string | null>(
        null,
      )
  
  
    const remainingPhotoSlots =
      Math.max(
        0,
        maxPhotos -
          photoUrls.length,
      )
  
  
    /* =======================================
       ADD PHOTOGRAPHS
    ======================================= */
  
    async function handlePhotoSelection(
      event:
        ChangeEvent<HTMLInputElement>,
    ) {
      const selectedFiles =
        Array.from(
          event.target.files ??
            [],
        )
  
  
      event.target.value = ''
  
  
      if (
        selectedFiles.length ===
        0
      ) {
        return
      }
  
  
      if (
        remainingPhotoSlots ===
        0
      ) {
        setPhotoError(
          `This page can hold up to ${maxPhotos} photographs.`,
        )
  
        return
      }
  
  
      const imageFiles =
        selectedFiles
          .filter(
            (file) =>
              file.type.startsWith(
                'image/',
              ),
          )
          .slice(
            0,
            remainingPhotoSlots,
          )
  
  
      if (
        imageFiles.length ===
        0
      ) {
        setPhotoError(
          'Please choose image files.',
        )
  
        return
      }
  
  
      setIsPreparingPhotos(
        true,
      )
  
      setPhotoError(
        null,
      )
  
  
      try {
        const preparedPhotos =
          await Promise.all(
            imageFiles.map(
              resizeImage,
            ),
          )
  
  
        onChange([
          ...photoUrls,
          ...preparedPhotos,
        ])
  
  
        if (
          selectedFiles.length >
          imageFiles.length
        ) {
          setPhotoError(
            `Sprig kept the first ${imageFiles.length} photograph${
              imageFiles.length === 1
                ? ''
                : 's'
            } because this page can hold up to ${maxPhotos}.`,
          )
        }
      } catch {
        setPhotoError(
          'Sprig could not prepare one of those photographs. Please try another image.',
        )
      } finally {
        setIsPreparingPhotos(
          false,
        )
      }
    }
  
  
    /* =======================================
       REMOVE PHOTOGRAPH
    ======================================= */
  
    function handleRemovePhoto(
      photoIndex: number,
    ) {
      onChange(
        photoUrls.filter(
          (
            _photoUrl,
            index,
          ) =>
            index !==
            photoIndex,
        ),
      )
  
      setPhotoError(
        null,
      )
    }
  
  
    /* =======================================
       MOVE PHOTOGRAPH
    ======================================= */
  
    function movePhoto(
      fromIndex: number,
      toIndex: number,
    ) {
      if (
        toIndex < 0 ||
        toIndex >=
          photoUrls.length
      ) {
        return
      }
  
  
      const reorderedPhotos = [
        ...photoUrls,
      ]
  
  
      const [
        movedPhoto,
      ] =
        reorderedPhotos.splice(
          fromIndex,
          1,
        )
  
  
      reorderedPhotos.splice(
        toIndex,
        0,
        movedPhoto,
      )
  
  
      onChange(
        reorderedPhotos,
      )
    }
  
  
    return (
      <section className="sprig-form-section">
        <div className="sprig-photo-field">
          <div className="sprig-photo-field-heading">
            <div>
              <p className="section-label">
                {title}
              </p>
  
              <p className="form-whisper">
                {helperText}
              </p>
            </div>
  
  
            <p className="sprig-photo-count">
              {photoUrls.length}
              {' / '}
              {maxPhotos}
            </p>
          </div>
  
  
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={
              handlePhotoSelection
            }
          />
  
  
          <button
            type="button"
            className="secondary-button"
            disabled={
              isPreparingPhotos ||
              remainingPhotoSlots ===
                0
            }
            onClick={() =>
              fileInputRef.current
                ?.click()
            }
          >
            {isPreparingPhotos
              ? 'Preparing photographs...'
              : remainingPhotoSlots ===
                  0
                ? 'Photograph page full'
                : `📷 ${addButtonLabel}`}
          </button>
  
  
          {photoError && (
            <p
              className="form-whisper"
              role="status"
            >
              {photoError}
            </p>
          )}
  
  
          {photoUrls.length ===
          0 ? (
            <p className="form-whisper">
              {emptyText}
            </p>
          ) : (
            <div className="sprig-photo-grid">
              {photoUrls.map(
                (
                  photoUrl,
                  index,
                ) => (
                  <article
                    key={`${photoUrl.slice(
                      0,
                      36,
                    )}-${index}`}
                    className="sprig-photo-preview"
                  >
                    <img
                      src={
                        photoUrl
                      }
                      alt={`Garden photograph ${
                        index + 1
                      }`}
                    />
  
  
                    <div className="sprig-photo-preview-actions">
  
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={
                          index ===
                          0
                        }
                        onClick={() =>
                          movePhoto(
                            index,
                            index -
                              1,
                          )
                        }
                        aria-label={`Move photograph ${
                          index +
                          1
                        } earlier`}
                      >
                        ←
                      </button>
  
  
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={
                          index ===
                          photoUrls.length -
                            1
                        }
                        onClick={() =>
                          movePhoto(
                            index,
                            index +
                              1,
                          )
                        }
                        aria-label={`Move photograph ${
                          index +
                          1
                        } later`}
                      >
                        →
                      </button>
  
  
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleRemovePhoto(
                            index,
                          )
                        }
                      >
                        Remove
                      </button>
  
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </section>
    )
  }