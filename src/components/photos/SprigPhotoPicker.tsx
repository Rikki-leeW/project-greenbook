import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'

import {
  processSprigPhotos,
} from '../../utils/photoUtils'

import type {
  SprigPhotoMetadata,
  SprigPhotoPurpose,
} from '../../types'


interface SprigPhotoContext {
  title?: string
  notes?: string
  tags?: string[]
  photoTime?: string
  purpose?: SprigPhotoPurpose
}


interface SprigPhotoPickerProps {
  photoUrls: string[]

  onChange: (
    photoUrls: string[],
  ) => void

  /*
   * Existing date API.
   *
   * This remains supported so every current
   * Sprig form continues to work exactly as
   * it did before richer photograph context
   * was introduced.
   */
  photoDates?: (
    string |
    undefined
  )[]

  onPhotoDatesChange?: (
    photoDates: (
      string |
      undefined
    )[],
  ) => void

  /*
   * Rich per-photograph metadata.
   *
   * This is optional. Forms that are not yet
   * ready for richer photograph context can
   * continue using only photoUrls/photoDates.
   */
  photoMetadata?: (
    SprigPhotoMetadata |
    undefined
  )[]

  onPhotoMetadataChange?: (
    photoMetadata: (
      SprigPhotoMetadata |
      undefined
    )[],
  ) => void

  title?: string

  helperText?: string

  addButtonText?: string

  photoAltPrefix?: string

  multiple?: boolean

  maxPhotos?: number

  defaultNewPhotosToToday?: boolean

  photoDateLabel?: string

  photoDateHelperText?: string

  /*
   * Rich context stays optional for the
   * gardener. The parent decides whether a
   * particular workflow should show it.
   */
  showPhotoContext?: boolean
}


interface ProcessedPhoto {
  photoUrl: string
  originalFileName?: string
}


/* =======================================
   DATE
======================================= */

function getTodayDate():
  string {
  return new Date()
    .toISOString()
    .slice(
      0,
      10,
    )
}


/* =======================================
   TAGS
======================================= */

function tagsToInputValue(
  tags:
    string[] |
    undefined,
): string {
  return (
    tags ??
    []
  )
    .map(
      tag =>
        tag.startsWith(
          '#',
        )
          ? tag
          : `#${tag}`,
    )
    .join(
      ' ',
    )
}


function inputValueToTags(
  value:
    string,
): string[] {
  const seen =
    new Set<string>()

  const tags =
    value
      .split(
        /[\s,]+/,
      )
      .map(
        tag =>
          tag
            .trim()
            .replace(
              /^#+/,
              '',
            ),
      )
      .filter(
        Boolean,
      )
      .filter(
        tag => {
          const key =
            tag.toLowerCase()

          if (
            seen.has(
              key,
            )
          ) {
            return false
          }

          seen.add(
            key,
          )

          return true
        },
      )

  return tags
}


/* =======================================
   PURPOSE LABEL
======================================= */

function getPhotoPurposeLabel(
  purpose:
    SprigPhotoPurpose,
): string {
  switch (
    purpose
  ) {
    case 'observation':
      return 'Observation'

    case 'progress':
      return 'Progress'

    case 'problem':
      return 'Problem'

    case 'harvest':
      return 'Harvest'

    case 'setup':
      return 'Setup'

    case 'reference':
      return 'Reference'

    case 'other':
    default:
      return 'Other'
  }
}


/* =======================================
   PHOTO PICKER
======================================= */

export default function SprigPhotoPicker({
  photoUrls,
  onChange,
  photoDates,
  onPhotoDatesChange,
  photoMetadata,
  onPhotoMetadataChange,
  title =
    'Photographs',
  helperText =
    'Add photographs that belong to this record.',
  addButtonText =
    'Add photographs',
  photoAltPrefix =
    'Garden photograph',
  multiple =
    true,
  maxPhotos =
    20,
  defaultNewPhotosToToday =
    false,
  photoDateLabel =
    'Photograph date',
  photoDateHelperText =
    'Optional. Use the date the photograph was taken when you know it.',
  showPhotoContext =
    false,
}: SprigPhotoPickerProps) {
  const inputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const [
    isProcessing,
    setIsProcessing,
  ] =
    useState(
      false,
    )

  const [
    processingMessage,
    setProcessingMessage,
  ] =
    useState(
      '',
    )


  /* =======================================
     SAFE DATE LOOKUP
  ======================================= */

  function getPhotoDate(
    index:
      number,
  ):
    string {
    return (
      photoMetadata?.[
        index
      ]?.photoDate ??
      photoDates?.[
        index
      ] ??
      ''
    )
  }


  /* =======================================
     SAFE METADATA LOOKUP
  ======================================= */

  function getPhotoMetadata(
    index:
      number,
  ):
    SprigPhotoMetadata {
    const metadata =
      photoMetadata?.[
        index
      ]

    return {
      ...metadata,

      photoDate:
        metadata
          ?.photoDate ??
        photoDates?.[
          index
        ],
    }
  }


  /* =======================================
     KEEP METADATA LENGTH SAFE
  ======================================= */

  useEffect(
    () => {
      if (
        !onPhotoMetadataChange ||
        !photoMetadata
      ) {
        return
      }

      if (
        photoMetadata.length ===
        photoUrls.length
      ) {
        return
      }

      onPhotoMetadataChange(
        photoUrls.map(
          (
            _photoUrl,
            index,
          ) =>
            photoMetadata[
              index
            ],
        ),
      )
    },
    [
      photoUrls,
      photoMetadata,
      onPhotoMetadataChange,
    ],
  )


  /* =======================================
     UPDATE DATE
  ======================================= */

  function updatePhotoDate(
    index:
      number,
    nextDate:
      string,
  ) {
    const savedDate =
      nextDate ||
      undefined

    if (
      onPhotoDatesChange
    ) {
      onPhotoDatesChange(
        photoUrls.map(
          (
            _photoUrl,
            photoIndex,
          ) =>
            photoIndex ===
              index
              ? savedDate
              : (
                  photoDates?.[
                    photoIndex
                  ] ??
                  photoMetadata?.[
                    photoIndex
                  ]?.photoDate
                ),
        ),
      )
    }

    if (
      onPhotoMetadataChange
    ) {
      onPhotoMetadataChange(
        photoUrls.map(
          (
            _photoUrl,
            photoIndex,
          ) => {
            const existing =
              getPhotoMetadata(
                photoIndex,
              )

            if (
              photoIndex !==
              index
            ) {
              return existing
            }

            return {
              ...existing,

              photoDate:
                savedDate,
            }
          },
        ),
      )
    }
  }


  /* =======================================
     UPDATE CONTEXT
  ======================================= */

  function updatePhotoContext(
    index:
      number,
    updates:
      Partial<
        SprigPhotoContext
      >,
  ) {
    if (
      !onPhotoMetadataChange
    ) {
      return
    }

    onPhotoMetadataChange(
      photoUrls.map(
        (
          _photoUrl,
          photoIndex,
        ) => {
          const existing =
            getPhotoMetadata(
              photoIndex,
            )

          if (
            photoIndex !==
            index
          ) {
            return existing
          }

          return {
            ...existing,
            ...updates,
          }
        },
      ),
    )
  }


  /* =======================================
     REMOVE PHOTO
  ======================================= */

  function removePhoto(
    indexToRemove:
      number,
  ) {
    const nextPhotoUrls =
      photoUrls.filter(
        (
          _photoUrl,
          index,
        ) =>
          index !==
          indexToRemove,
      )

    const nextPhotoDates =
      photoUrls
        .map(
          (
            _photoUrl,
            index,
          ) =>
            getPhotoDate(
              index,
            ) ||
            undefined,
        )
        .filter(
          (
            _photoDate,
            index,
          ) =>
            index !==
            indexToRemove,
        )

    const nextMetadata =
      photoUrls
        .map(
          (
            _photoUrl,
            index,
          ) =>
            getPhotoMetadata(
              index,
            ),
        )
        .filter(
          (
            _metadata,
            index,
          ) =>
            index !==
            indexToRemove,
        )

    onChange(
      nextPhotoUrls,
    )

    if (
      onPhotoDatesChange
    ) {
      onPhotoDatesChange(
        nextPhotoDates,
      )
    }

    if (
      onPhotoMetadataChange
    ) {
      onPhotoMetadataChange(
        nextMetadata,
      )
    }
  }


  /* =======================================
     ADD PHOTOS
  ======================================= */

  async function handleFilesSelected(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const files =
      Array.from(
        event.target.files ??
        [],
      )

    event.target.value =
      ''

    if (
      files.length ===
      0
    ) {
      return
    }

    const availableSlots =
      Math.max(
        0,
        maxPhotos -
        photoUrls.length,
      )

    if (
      availableSlots ===
      0
    ) {
      return
    }

    const selectedFiles =
      files.slice(
        0,
        multiple
          ? availableSlots
          : 1,
      )

    setIsProcessing(
      true,
    )

    setProcessingMessage(
      selectedFiles.length ===
        1
        ? 'Preparing photograph…'
        : `Preparing ${selectedFiles.length} photographs…`,
    )

    try {
      const processedUrls =
        await processSprigPhotos(
          selectedFiles,
        )

      const processedPhotos:
        ProcessedPhoto[] =
        processedUrls.map(
          (
            photoUrl,
            index,
          ) => ({
            photoUrl,

            originalFileName:
              selectedFiles[
                index
              ]?.name,
          }),
        )

      const nextPhotoUrls =
        [
          ...photoUrls,

          ...processedPhotos.map(
            photo =>
              photo.photoUrl,
          ),
        ]

      const today =
        getTodayDate()

      const existingDates =
        photoUrls.map(
          (
            _photoUrl,
            index,
          ) =>
            getPhotoDate(
              index,
            ) ||
            undefined,
        )

      const newDates =
        processedPhotos.map(
          () =>
            defaultNewPhotosToToday
              ? today
              : undefined,
        )

      const existingMetadata =
        photoUrls.map(
          (
            _photoUrl,
            index,
          ) =>
            getPhotoMetadata(
              index,
            ),
        )

      const addedAt =
        new Date()
          .toISOString()

      const newMetadata =
        processedPhotos.map(
          (
            photo,
            index,
          ):
            SprigPhotoMetadata => ({
            photoDate:
              newDates[
                index
              ],

            originalFileName:
              photo
                .originalFileName,

            addedAt,
          }),
        )

      onChange(
        nextPhotoUrls,
      )

      if (
        onPhotoDatesChange
      ) {
        onPhotoDatesChange([
          ...existingDates,
          ...newDates,
        ])
      }

      if (
        onPhotoMetadataChange
      ) {
        onPhotoMetadataChange([
          ...existingMetadata,
          ...newMetadata,
        ])
      }
    }
    finally {
      setIsProcessing(
        false,
      )

      setProcessingMessage(
        '',
      )
    }
  }


  /* =======================================
     OPEN FILE PICKER
  ======================================= */

  function openFilePicker() {
    inputRef.current
      ?.click()
  }


  const canAddMore =
    photoUrls.length <
    maxPhotos


  const showDateControls =
    Boolean(
      onPhotoDatesChange ||
      onPhotoMetadataChange,
    )


  const canEditRichContext =
    Boolean(
      showPhotoContext &&
      onPhotoMetadataChange,
    )


  const purposeOptions:
    SprigPhotoPurpose[] = [
      'observation',
      'progress',
      'problem',
      'harvest',
      'setup',
      'reference',
      'other',
    ]


  return (
    <section className="sprig-form-section sprig-photo-picker">
      <div className="sprig-photo-picker-heading">
        <div>
          <p className="section-label">
            Photographs
          </p>

          <h3>
            {title}
          </h3>

          {helperText && (
            <p className="form-whisper">
              {helperText}
            </p>
          )}
        </div>
      </div>


      <input
        ref={
          inputRef
        }
        type="file"
        accept="image/*"
        multiple={
          multiple
        }
        onChange={
          handleFilesSelected
        }
        hidden
      />


      {photoUrls.length >
      0 ? (
        <div className="sprig-photo-picker-list">
          {photoUrls.map(
            (
              photoUrl,
              index,
            ) => {
              const metadata =
                getPhotoMetadata(
                  index,
                )

              return (
                <article
                  key={
                    `${photoUrl.slice(
                      0,
                      36,
                    )}-${index}`
                  }
                  className="sprig-photo-picker-item"
                >
                  <div className="sprig-photo-picker-preview">
                    <img
                      src={
                        photoUrl
                      }
                      alt={`${photoAltPrefix} ${index + 1}`}
                    />

                    <button
                      type="button"
                      className="sprig-photo-picker-remove"
                      onClick={() =>
                        removePhoto(
                          index,
                        )
                      }
                      aria-label={`Remove ${photoAltPrefix} ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>


                  <div className="sprig-photo-picker-context">
                    <p className="section-label">
                      Photo {index + 1}
                    </p>


                    {showDateControls && (
                      <label>
                        {photoDateLabel}

                        <input
                          type="date"
                          value={
                            getPhotoDate(
                              index,
                            )
                          }
                          onChange={(
                            event,
                          ) =>
                            updatePhotoDate(
                              index,
                              event
                                .target
                                .value,
                            )
                          }
                        />

                        {photoDateHelperText && (
                          <span className="form-whisper">
                            {photoDateHelperText}
                          </span>
                        )}
                      </label>
                    )}


                    {canEditRichContext && (
                      <>
                        <label>
                          Photo title

                          <input
                            type="text"
                            value={
                              metadata
                                .title ??
                              ''
                            }
                            onChange={(
                              event,
                            ) =>
                              updatePhotoContext(
                                index,
                                {
                                  title:
                                    event
                                      .target
                                      .value ||
                                    undefined,
                                },
                              )
                            }
                            placeholder="First flower buds, lower leaves yellowing..."
                          />

                          <span className="form-whisper">
                            Optional. A short title
                            makes this photograph
                            easier to recognise later.
                          </span>
                        </label>


                        <label>
                          Photo notes

                          <textarea
                            value={
                              metadata
                                .notes ??
                              ''
                            }
                            onChange={(
                              event,
                            ) =>
                              updatePhotoContext(
                                index,
                                {
                                  notes:
                                    event
                                      .target
                                      .value ||
                                    undefined,
                                },
                              )
                            }
                            rows={
                              3
                            }
                            placeholder="Anything visible here that is worth remembering..."
                          />
                        </label>


                        <label>
                          Tags

                          <input
                            type="text"
                            value={
                              tagsToInputValue(
                                metadata
                                  .tags,
                              )
                            }
                            onChange={(
                              event,
                            ) =>
                              updatePhotoContext(
                                index,
                                {
                                  tags:
                                    inputValueToTags(
                                      event
                                        .target
                                        .value,
                                    ),
                                },
                              )
                            }
                            placeholder="#flowering #yellow-leaves #new-growth"
                          />

                          <span className="form-whisper">
                            Optional. Separate tags
                            with spaces or commas.
                          </span>
                        </label>


                        <div className="sprig-photo-purpose-field">
                          <p className="section-label">
                            What kind of photograph is this?
                          </p>

                          <p className="form-whisper">
                            Optional. Sprig can still
                            understand plenty from the
                            record this photograph
                            belongs to.
                          </p>

                          <div className="selection-card-grid">
                            {purposeOptions.map(
                              purpose => {
                                const isSelected =
                                  metadata
                                    .purpose ===
                                  purpose

                                return (
                                  <button
                                    key={
                                      purpose
                                    }
                                    type="button"
                                    className={
                                      isSelected
                                        ? 'selection-card selected'
                                        : 'selection-card'
                                    }
                                    aria-pressed={
                                      isSelected
                                    }
                                    onClick={() =>
                                      updatePhotoContext(
                                        index,
                                        {
                                          purpose:
                                            isSelected
                                              ? undefined
                                              : purpose,
                                        },
                                      )
                                    }
                                  >
                                    <strong>
                                      {isSelected
                                        ? '✓ '
                                        : ''}
                                      {getPhotoPurposeLabel(
                                        purpose,
                                      )}
                                    </strong>
                                  </button>
                                )
                              },
                            )}
                          </div>
                        </div>


                        <label>
                          Time photographed

                          <input
                            type="time"
                            value={
                              metadata
                                .photoTime ??
                              ''
                            }
                            onChange={(
                              event,
                            ) =>
                              updatePhotoContext(
                                index,
                                {
                                  photoTime:
                                    event
                                      .target
                                      .value ||
                                    undefined,
                                },
                              )
                            }
                          />

                          <span className="form-whisper">
                            Optional. Useful when
                            sunlight, shade or time of
                            day matters.
                          </span>
                        </label>
                      </>
                    )}
                  </div>
                </article>
              )
            },
          )}
        </div>
      ) : (
        <p className="form-whisper">
          No photographs added yet.
        </p>
      )}


      {isProcessing && (
        <p
          className="form-whisper"
          role="status"
        >
          {processingMessage}
        </p>
      )}


      {canAddMore && (
        <button
          type="button"
          className="secondary-button"
          disabled={
            isProcessing
          }
          onClick={
            openFilePicker
          }
        >
          {addButtonText}
        </button>
      )}


      {photoUrls.length >=
        maxPhotos && (
        <p className="form-whisper">
          This record has reached its
          photograph limit of {maxPhotos}.
        </p>
      )}
    </section>
  )
}