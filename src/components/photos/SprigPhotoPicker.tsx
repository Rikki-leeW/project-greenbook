import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
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

  showPhotoContext?: boolean
}


interface ProcessedPhoto {
  photoUrl: string
  originalFileName?: string
}


type TagDraftMap =
  Record<
    number,
    string
  >


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
   TAG
======================================= */

function cleanTag(
  value: string,
): string {
  return value
    .trim()
    .replace(
      /^#+/,
      '',
    )
}


function getUniqueTags(
  tags: string[],
): string[] {
  const seen =
    new Set<string>()

  return tags.filter(
    tag => {
      const cleaned =
        cleanTag(
          tag,
        )

      if (
        !cleaned
      ) {
        return false
      }

      const key =
        cleaned
          .toLowerCase()

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
    'Date taken',

  photoDateHelperText =
    '',

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

  const [
    tagDrafts,
    setTagDrafts,
  ] =
    useState<TagDraftMap>(
      {},
    )


  /* =======================================
     SAFE DATE LOOKUP
  ======================================= */

  function getPhotoDate(
    index: number,
  ): string {
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
    index: number,
  ): SprigPhotoMetadata {
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
    index: number,
    nextDate: string,
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
    index: number,
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
     TAG DRAFT
  ======================================= */

  function updateTagDraft(
    index: number,
    value: string,
  ) {
    setTagDrafts(
      current => ({
        ...current,

        [index]:
          value,
      }),
    )
  }


  /* =======================================
     COMMIT TAG
  ======================================= */

  function commitTag(
    index: number,
  ) {
    const draft =
      tagDrafts[
        index
      ] ??
      ''

    const cleaned =
      cleanTag(
        draft,
      )

    if (
      !cleaned
    ) {
      updateTagDraft(
        index,
        '',
      )

      return
    }

    const metadata =
      getPhotoMetadata(
        index,
      )

    const nextTags =
      getUniqueTags([
        ...(
          metadata.tags ??
          []
        ),

        cleaned,
      ])

    updatePhotoContext(
      index,
      {
        tags:
          nextTags,
      },
    )

    updateTagDraft(
      index,
      '',
    )
  }


  /* =======================================
     TAG KEY
  ======================================= */

  function handleTagKeyDown(
    index: number,
    event:
      KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key ===
        'Enter' ||
      event.key ===
        ','
    ) {
      event.preventDefault()

      commitTag(
        index,
      )

      return
    }

    if (
      event.key ===
        'Backspace' &&
      !(
        tagDrafts[
          index
        ] ??
        ''
      )
    ) {
      const metadata =
        getPhotoMetadata(
          index,
        )

      const tags =
        metadata.tags ??
        []

      if (
        tags.length ===
        0
      ) {
        return
      }

      event.preventDefault()

      const nextTags =
        tags.slice(
          0,
          -1,
        )

      updatePhotoContext(
        index,
        {
          tags:
            nextTags.length >
            0
              ? nextTags
              : undefined,
        },
      )
    }
  }


  /* =======================================
     REMOVE TAG
  ======================================= */

  function removeTag(
    index: number,
    tagToRemove: string,
  ) {
    const metadata =
      getPhotoMetadata(
        index,
      )

    const nextTags =
      (
        metadata.tags ??
        []
      ).filter(
        tag =>
          tag !==
          tagToRemove,
      )

    updatePhotoContext(
      index,
      {
        tags:
          nextTags.length >
          0
            ? nextTags
            : undefined,
      },
    )
  }


  /* =======================================
     REMOVE PHOTO
  ======================================= */

  function removePhoto(
    indexToRemove: number,
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

    setTagDrafts(
      {},
    )
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

              const tags =
                metadata.tags ??
                []

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
                  <div className="sprig-photo-card-heading">
                    <div>
                      <p className="section-label">
                        Photograph
                      </p>

                      <h4>
                        Photo {index + 1}
                      </h4>
                    </div>

                    <button
                      type="button"
                      className="text-button sprig-photo-remove-text"
                      onClick={() =>
                        removePhoto(
                          index,
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>


                  <div className="sprig-photo-picker-preview">
                    <img
                      src={
                        photoUrl
                      }
                      alt={`${photoAltPrefix} ${index + 1}`}
                    />
                  </div>


                  <div className="sprig-photo-picker-context">
                    {showDateControls && (
                      <div className="sprig-photo-date-time-row">
                        <label className="sprig-photo-field">
                          <span>
                            {photoDateLabel}
                          </span>

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
                        </label>


                        {canEditRichContext && (
                          <label className="sprig-photo-field">
                            <span>
                              Time
                            </span>

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
                          </label>
                        )}
                      </div>
                    )}


                    {photoDateHelperText && (
                      <p className="sprig-photo-field-note">
                        {photoDateHelperText}
                      </p>
                    )}


                    {canEditRichContext && (
                      <>
                        <label className="sprig-photo-field">
                          <span>
                            Title
                            <small>
                              optional
                            </small>
                          </span>

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
                            placeholder="First flower buds"
                          />
                        </label>


                        <label className="sprig-photo-field">
                          <span>
                            Notes
                            <small>
                              optional
                            </small>
                          </span>

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
                            placeholder="What is worth remembering about this photograph?"
                          />
                        </label>


                        <div className="sprig-photo-tags-field">
                          <label className="sprig-photo-field">
                            <span>
                              Tags
                              <small>
                                optional
                              </small>
                            </span>

                            <input
                              type="text"
                              value={
                                tagDrafts[
                                  index
                                ] ??
                                ''
                              }
                              onChange={(
                                event,
                              ) =>
                                updateTagDraft(
                                  index,
                                  event
                                    .target
                                    .value,
                                )
                              }
                              onKeyDown={(
                                event,
                              ) =>
                                handleTagKeyDown(
                                  index,
                                  event,
                                )
                              }
                              onBlur={() =>
                                commitTag(
                                  index,
                                )
                              }
                              placeholder="Type a tag"
                            />
                          </label>

                          <p className="sprig-photo-field-note">
                            Press Enter or comma to add a tag.
                            Spaces can stay inside a tag.
                          </p>

                          {tags.length >
                            0 && (
                            <div className="sprig-photo-tag-list">
                              {tags.map(
                                tag => (
                                  <button
                                    key={
                                      tag
                                    }
                                    type="button"
                                    className="sprig-photo-tag"
                                    onClick={() =>
                                      removeTag(
                                        index,
                                        tag,
                                      )
                                    }
                                    title={`Remove ${tag}`}
                                  >
                                    #{cleanTag(
                                      tag,
                                    )}

                                    <span aria-hidden="true">
                                      ×
                                    </span>
                                  </button>
                                ),
                              )}
                            </div>
                          )}
                        </div>


                        <fieldset className="sprig-photo-purpose-field">
                          <legend>
                            Purpose
                            <small>
                              optional
                            </small>
                          </legend>

                          <div className="sprig-photo-purpose-grid">
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
                                        ? 'sprig-photo-purpose-option selected'
                                        : 'sprig-photo-purpose-option'
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
                                    {isSelected &&
                                      '✓ '}

                                    {getPhotoPurposeLabel(
                                      purpose,
                                    )}
                                  </button>
                                )
                              },
                            )}
                          </div>
                        </fieldset>
                      </>
                    )}
                  </div>
                </article>
              )
            },
          )}
        </div>
      ) : (
        <div className="sprig-photo-empty">
          <p>
            No photographs selected yet.
          </p>
        </div>
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
          className="secondary-button sprig-photo-add-button"
          disabled={
            isProcessing
          }
          onClick={
            openFilePicker
          }
        >
          {photoUrls.length >
            0
            ? 'Add more photographs'
            : addButtonText}
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