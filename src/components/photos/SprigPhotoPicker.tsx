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
  
    title?: string
  
    helperText?: string
  
    addButtonText?: string
  
    photoAltPrefix?: string
  
    multiple?: boolean
  
    maxPhotos?: number
  }
  
  
  export default function SprigPhotoPicker({
    photoUrls,
    onChange,
    title = 'Photographs',
    helperText = 'Tuck photographs into this page.',
    addButtonText = 'Add photographs',
    photoAltPrefix = 'Sprig photograph',
    multiple = true,
    maxPhotos,
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
      useState<string | null>(
        null,
      )
  
  
    /* =======================================
       PHOTO SELECTION
    ======================================= */
  
    async function handlePhotoSelection(
      event:
        ChangeEvent<HTMLInputElement>,
    ) {
      const files =
        event.target.files
  
      if (!files?.length) {
        return
      }
  
  
      /*
       * Copy the FileList BEFORE resetting
       * the input.
       *
       * FileList can be tied to the input
       * itself, so clearing the input first
       * can also clear the selected files.
       */
      let selectedFiles =
        Array.from(
          files,
        )
  
  
      /*
       * Reset after copying the files so
       * the same photograph can be selected
       * again later after removal.
       */
      event.target.value = ''
  
  
      setErrorMessage(
        null,
      )
  
      setIsProcessing(
        true,
      )
  
  
      try {
        /*
         * If this picker is configured for
         * one photograph only, keep the
         * first selected image.
         */
        if (!multiple) {
          selectedFiles =
            selectedFiles.slice(
              0,
              1,
            )
        }
  
  
        /*
         * Respect an optional photograph
         * limit without making individual
         * forms responsible for the maths.
         */
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
                maxPhotos === 1
                  ? 'photograph'
                  : 'photographs'
              }.`,
            )
  
            return
          }
  
  
          selectedFiles =
            selectedFiles.slice(
              0,
              remainingSlots,
            )
        }
  
  
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
  
  
        if (!multiple) {
          onChange(
            [
              processedPhotos[0],
            ],
          )
  
          return
        }
  
  
        onChange(
          [
            ...photoUrls,
            ...processedPhotos,
          ],
        )
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
  
      setErrorMessage(
        null,
      )
    }
  
  
    /* =======================================
       OPEN FILE PICKER
    ======================================= */
  
    function openPhotoPicker() {
      inputRef.current?.click()
    }
  
  
    /* =======================================
       PHOTO LIMIT
    ======================================= */
  
    const hasReachedLimit =
      maxPhotos !==
        undefined &&
      photoUrls.length >=
        maxPhotos
  
  
    return (
      <section className="sprig-photo-picker">
  
        <div className="sprig-photo-picker-heading">
          <h3 className="sprig-photo-picker-title">
            {title}
          </h3>
  
          {helperText && (
            <p className="form-whisper">
              {helperText}
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
            : addButtonText}
        </button>
  
  
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
              ) => (
                <div
                  key={`${photoUrl.slice(
                    0,
                    30,
                  )}-${index}`}
                  className="sprig-photo-preview"
                >
                  <img
                    className="sprig-photo-thumbnail"
                    src={
                      photoUrl
                    }
                    alt={`${photoAltPrefix} ${
                      index + 1
                    }`}
                  />
  
                  <button
                    type="button"
                    className="secondary-button sprig-photo-remove-button"
                    onClick={() =>
                      removePhoto(
                        index,
                      )
                    }
                    aria-label={`Remove ${photoAltPrefix.toLowerCase()} ${
                      index + 1
                    }`}
                  >
                    Remove photograph
                  </button>
                </div>
              ),
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