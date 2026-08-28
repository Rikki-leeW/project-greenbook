import {
    useRef,
    useState,
    type ChangeEvent,
  } from 'react'
  
  import {
    processSprigPhotos,
  } from '../../utils/photoUtils'
  
  
  interface SprigPhotoPickerProps {
    photoUrls: string[]
  
    onChange: (
      photoUrls: string[],
    ) => void
  
    /*
     * Optional date metadata.
     *
     * The date at each index belongs to the
     * photograph at the same index in
     * photoUrls.
     *
     * Existing Sprig records do not need to
     * provide this yet, which keeps this
     * picker backwards compatible.
     */
    photoDates?: (
      | string
      | undefined
    )[]
  
    /*
     * When this callback is supplied, Sprig
     * knows this particular use of the photo
     * picker supports dated photographs.
     *
     * The date controls are deliberately only
     * shown when the parent can actually save
     * them.
     */
    onPhotoDatesChange?: (
      photoDates: (
        | string
        | undefined
      )[],
    ) => void
  
    title?: string
  
    helperText?: string
  
    addButtonText?: string
  
    photoAltPrefix?: string
  
    multiple?: boolean
  
    maxPhotos?: number
  
    /*
     * New photographs normally represent
     * "today", but a parent can turn that off
     * if a record type needs different
     * behaviour.
     */
    defaultNewPhotosToToday?: boolean
  
    /*
     * Optional wording for dated-photo UI.
     */
    photoDateLabel?: string
  
    photoDateHelperText?: string
  }
  
  
  /* =======================================
     TODAY
  ======================================= */
  
  function getTodayDate(): string {
    return new Date()
      .toISOString()
      .slice(
        0,
        10,
      )
  }
  
  
  /* =======================================
     NORMALISE PHOTO DATES
  ======================================= */
  
  function normalisePhotoDates(
    photoUrls: string[],
    photoDates?: (
      | string
      | undefined
    )[],
  ): (
    | string
    | undefined
  )[] {
    return photoUrls.map(
      (
        _photoUrl,
        index,
      ) =>
        photoDates?.[
          index
        ],
    )
  }
  
  
  /* =======================================
     SPRIG PHOTO PICKER
  ======================================= */
  
  export default function SprigPhotoPicker({
    photoUrls,
    onChange,
  
    photoDates,
    onPhotoDatesChange,
  
    title = 'Photographs',
  
    helperText =
      'Tuck photographs into this page.',
  
    addButtonText =
      'Add photographs',
  
    photoAltPrefix =
      'Sprig photograph',
  
    multiple = true,
  
    maxPhotos,
  
    defaultNewPhotosToToday =
      true,
  
    photoDateLabel =
      'When was this photograph taken?',
  
    photoDateHelperText =
      'The date helps Sprig compare how things looked at similar stages.',
  }: SprigPhotoPickerProps) {
  
    const inputRef =
      useRef<HTMLInputElement>(
        null,
      )
  
  
    const [
      isProcessing,
      setIsProcessing,
    ] =
      useState(false)
  
  
    const [
      errorMessage,
      setErrorMessage,
    ] =
      useState<
        string | null
      >(
        null,
      )
  
  
    /*
     * Date controls only appear when the
     * parent record is capable of saving
     * photograph dates.
     *
     * This lets Journal, Harvest and all older
     * picker uses continue working untouched
     * until we deliberately connect them.
     */
    const supportsPhotoDates =
      Boolean(
        onPhotoDatesChange,
      )
  
  
    const normalisedPhotoDates =
      normalisePhotoDates(
        photoUrls,
        photoDates,
      )
  
  
    /* =======================================
       UPDATE PHOTO DATES
    ======================================= */
  
    function updatePhotoDates(
      nextDates: (
        | string
        | undefined
      )[],
    ) {
      if (
        !onPhotoDatesChange
      ) {
        return
      }
  
  
      onPhotoDatesChange(
        nextDates,
      )
    }
  
  
    /* =======================================
       UPDATE ONE PHOTO DATE
    ======================================= */
  
    function updatePhotoDate(
      photoIndex: number,
      date: string,
    ) {
      if (
        !onPhotoDatesChange
      ) {
        return
      }
  
  
      const nextDates = [
        ...normalisedPhotoDates,
      ]
  
  
      nextDates[
        photoIndex
      ] =
        date ||
        undefined
  
  
      updatePhotoDates(
        nextDates,
      )
  
  
      setErrorMessage(
        null,
      )
    }
  
  
    /* =======================================
       PHOTO SELECTION
    ======================================= */
  
    async function handlePhotoSelection(
      event:
        ChangeEvent<HTMLInputElement>,
    ) {
      const files =
        event.target.files
  
  
      if (
        !files?.length
      ) {
        return
      }
  
  
      /*
       * Copy FileList before resetting the
       * input.
       *
       * FileList may be tied to the browser
       * input itself, so clearing the input
       * first can also clear the selected
       * files.
       */
      let selectedFiles =
        Array.from(
          files,
        )
  
  
      /*
       * Reset after copying so the same
       * photograph can be selected again
       * later if it is removed.
       */
      event.target.value =
        ''
  
  
      setErrorMessage(
        null,
      )
  
  
      setIsProcessing(
        true,
      )
  
  
      try {
  
        /* =======================================
           SINGLE PHOTO MODE
        ======================================= */
  
        if (
          !multiple
        ) {
          selectedFiles =
            selectedFiles.slice(
              0,
              1,
            )
        }
  
  
        /* =======================================
           PHOTO LIMIT
        ======================================= */
  
        if (
          maxPhotos !==
          undefined
        ) {
          const remainingSlots =
            Math.max(
              0,
              maxPhotos -
                photoUrls.length,
            )
  
  
          if (
            remainingSlots ===
            0
          ) {
            setErrorMessage(
              `This page already has its maximum of ${maxPhotos} ${
                maxPhotos ===
                1
                  ? 'photograph'
                  : 'photographs'
              }.`,
            )
  
            return
          }
  
  
          if (
            selectedFiles.length >
            remainingSlots
          ) {
            selectedFiles =
              selectedFiles.slice(
                0,
                remainingSlots,
              )
          }
        }
  
  
        /* =======================================
           PROCESS PHOTOGRAPHS
        ======================================= */
  
        const processedPhotos =
          await processSprigPhotos(
            selectedFiles,
          )
  
  
        if (
          processedPhotos.length ===
          0
        ) {
          setErrorMessage(
            'Sprig could not find a usable photograph in that selection.',
          )
  
          return
        }
  
  
        /* =======================================
           DEFAULT DATES FOR NEW PHOTOS
        ======================================= */
  
        const defaultDate =
          supportsPhotoDates &&
          defaultNewPhotosToToday
            ? getTodayDate()
            : undefined
  
  
        const newPhotoDates =
          processedPhotos.map(
            () =>
              defaultDate,
          )
  
  
        /* =======================================
           SAVE SINGLE PHOTO
        ======================================= */
  
        if (
          !multiple
        ) {
          onChange(
            [
              processedPhotos[
                0
              ],
            ],
          )
  
  
          if (
            supportsPhotoDates
          ) {
            updatePhotoDates(
              [
                newPhotoDates[
                  0
                ],
              ],
            )
          }
  
  
          return
        }
  
  
        /* =======================================
           SAVE MULTIPLE PHOTOS
        ======================================= */
  
        onChange(
          [
            ...photoUrls,
            ...processedPhotos,
          ],
        )
  
  
        if (
          supportsPhotoDates
        ) {
          updatePhotoDates(
            [
              ...normalisedPhotoDates,
              ...newPhotoDates,
            ],
          )
        }
  
      } catch (
        error
      ) {
        console.error(
          'Sprig photograph processing failed:',
          error,
        )
  
  
        setErrorMessage(
          'Sprig could not prepare one of those photographs. Please try another image.',
        )
      } finally {
        setIsProcessing(
          false,
        )
      }
    }
  
  
    /* =======================================
       REMOVE PHOTO
    ======================================= */
  
    function removePhoto(
      photoIndex: number,
    ) {
      const nextPhotoUrls =
        photoUrls.filter(
          (
            _photoUrl,
            index,
          ) =>
            index !==
            photoIndex,
        )
  
  
      onChange(
        nextPhotoUrls,
      )
  
  
      /*
       * Remove the matching date as well so
       * photograph metadata can never slide
       * onto the wrong image.
       */
      if (
        supportsPhotoDates
      ) {
        const nextPhotoDates =
          normalisedPhotoDates.filter(
            (
              _date,
              index,
            ) =>
              index !==
              photoIndex,
          )
  
  
        updatePhotoDates(
          nextPhotoDates,
        )
      }
  
  
      setErrorMessage(
        null,
      )
    }
  
  
    /* =======================================
       OPEN FILE PICKER
    ======================================= */
  
    function openPhotoPicker() {
      if (
        isProcessing
      ) {
        return
      }
  
  
      inputRef.current
        ?.click()
    }
  
  
    /* =======================================
       PHOTO LIMIT
    ======================================= */
  
    const hasReachedLimit =
      maxPhotos !==
        undefined &&
      photoUrls.length >=
        maxPhotos
  
  
    /* =======================================
       REMAINING PHOTO COUNT
    ======================================= */
  
    const remainingPhotoCount =
      maxPhotos !==
        undefined
        ? Math.max(
            0,
            maxPhotos -
              photoUrls.length,
          )
        : undefined
  
  
    return (
      <section className="sprig-photo-picker">
  
        {/* =======================================
            HEADING
        ======================================= */}
  
        <div className="sprig-photo-picker-heading">
  
          <h3 className="sprig-photo-picker-title">
            {title}
          </h3>
  
  
          {helperText && (
            <p className="form-whisper">
              {helperText}
            </p>
          )}
  
  
          {supportsPhotoDates && (
            <p className="form-whisper">
              Each photograph can remember
              when it was taken so Sprig can
              place it at the right point in
              the story.
            </p>
          )}
  
        </div>
  
  
        {/* =======================================
            HIDDEN FILE INPUT
        ======================================= */}
  
        <input
          ref={
            inputRef
          }
          className="sprig-photo-input"
          type="file"
          accept="image/*"
          multiple={
            multiple
          }
          onChange={
            handlePhotoSelection
          }
        />
  
  
        {/* =======================================
            ADD PHOTO BUTTON
        ======================================= */}
  
        <button
          type="button"
          className="secondary-button sprig-photo-add-button"
          onClick={
            openPhotoPicker
          }
          disabled={
            isProcessing ||
            hasReachedLimit
          }
        >
          {isProcessing
            ? 'Preparing photographs...'
            : hasReachedLimit
              ? 'Photograph limit reached'
              : addButtonText}
        </button>
  
  
        {/* =======================================
            REMAINING SPACE
        ======================================= */}
  
        {remainingPhotoCount !==
          undefined &&
          remainingPhotoCount >
            0 &&
          photoUrls.length >
            0 && (
            <p className="form-whisper">
              Room for{' '}
              {
                remainingPhotoCount
              } more{' '}
              {remainingPhotoCount ===
              1
                ? 'photograph'
                : 'photographs'}
              .
            </p>
          )}
  
  
        {/* =======================================
            ERROR MESSAGE
        ======================================= */}
  
        {errorMessage && (
          <p
            className="sprig-photo-error"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
  
  
        {/* =======================================
            PHOTO PREVIEWS
        ======================================= */}
  
        {photoUrls.length >
          0 && (
          <div className="sprig-photo-preview-grid">
  
            {photoUrls.map(
              (
                photoUrl,
                index,
              ) => {
  
                const photoDate =
                  normalisedPhotoDates[
                    index
                  ]
  
  
                return (
                  <div
                    key={`${photoUrl.slice(
                      0,
                      30,
                    )}-${index}`}
                    className="sprig-photo-preview"
                  >
  
                    {/* =======================================
                        THUMBNAIL
                    ======================================= */}
  
                    <img
                      className="sprig-photo-thumbnail"
                      src={
                        photoUrl
                      }
                      alt={`${photoAltPrefix} ${
                        index +
                        1
                      }`}
                    />
  
  
                    {/* =======================================
                        PHOTO DATE
                    ======================================= */}
  
                    {supportsPhotoDates && (
                      <div className="sprig-photo-date-field">
  
                        <label>
                          {photoDateLabel}
  
                          <input
                            type="date"
                            value={
                              photoDate ??
                              ''
                            }
                            onChange={(
                              event,
                            ) =>
                              updatePhotoDate(
                                index,
                                event.target.value,
                              )
                            }
                          />
                        </label>
  
  
                        <p className="form-whisper">
                          {photoDate
                            ? photoDateHelperText
                            : 'No date is recorded for this photograph yet. It can still be kept, but Sprig cannot use it for age-based comparisons until a date is added.'}
                        </p>
  
                      </div>
                    )}
  
  
                    {/* =======================================
                        REMOVE
                    ======================================= */}
  
                    <button
                      type="button"
                      className="secondary-button sprig-photo-remove-button"
                      onClick={() =>
                        removePhoto(
                          index,
                        )
                      }
                      aria-label={`Remove ${photoAltPrefix.toLowerCase()} ${
                        index +
                        1
                      }`}
                    >
                      Remove photograph
                    </button>
  
                  </div>
                )
              },
            )}
  
          </div>
        )}
  
  
        {/* =======================================
            PHOTO COUNT
        ======================================= */}
  
        {maxPhotos !==
          undefined &&
          photoUrls.length >
            0 && (
            <p className="form-whisper">
              {photoUrls.length} of{' '}
              {maxPhotos}{' '}
              {maxPhotos === 1
                ? 'photograph'
                : 'photographs'}
            </p>
          )}
  
      </section>
    )
  }