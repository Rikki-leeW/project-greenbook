/* =======================================
   SPRIG PHOTO UTILITIES
======================================= */

/*
 * This file contains the shared image
 * processing machinery used throughout Sprig.
 *
 * Forms and pages should not need to know
 * how resizing, compression or data URLs work.
 */


/* =======================================
   DEFAULT PHOTO SETTINGS
======================================= */

export const SPRIG_PHOTO_MAX_WIDTH =
  1600

export const SPRIG_PHOTO_MAX_HEIGHT =
  1600

export const SPRIG_PHOTO_QUALITY =
  0.82


/* =======================================
   PHOTO PROCESSING OPTIONS
======================================= */

export interface SprigPhotoProcessingOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}


/* =======================================
   VALIDATE IMAGE FILE
======================================= */

export function isImageFile(
  file: File,
): boolean {
  return file.type.startsWith(
    'image/',
  )
}


/* =======================================
   READ FILE AS DATA URL
======================================= */

function readFileAsDataUrl(
  file: File,
): Promise<string> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const reader =
        new FileReader()

      reader.onload = () => {
        if (
          typeof reader.result !==
          'string'
        ) {
          reject(
            new Error(
              'Sprig could not read this photograph.',
            ),
          )

          return
        }

        resolve(
          reader.result,
        )
      }

      reader.onerror = () => {
        reject(
          new Error(
            'Sprig could not read this photograph.',
          ),
        )
      }

      reader.readAsDataURL(
        file,
      )
    },
  )
}


/* =======================================
   LOAD IMAGE
======================================= */

function loadImage(
  source: string,
): Promise<HTMLImageElement> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const image =
        new Image()

      image.onload = () => {
        resolve(
          image,
        )
      }

      image.onerror = () => {
        reject(
          new Error(
            'Sprig could not prepare this photograph.',
          ),
        )
      }

      image.src =
        source
    },
  )
}


/* =======================================
   CALCULATE RESIZED DIMENSIONS
======================================= */

function calculatePhotoDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): {
  width: number
  height: number
} {
  if (
    originalWidth <= maxWidth &&
    originalHeight <= maxHeight
  ) {
    return {
      width:
        originalWidth,

      height:
        originalHeight,
    }
  }

  const widthRatio =
    maxWidth /
    originalWidth

  const heightRatio =
    maxHeight /
    originalHeight

  const scale =
    Math.min(
      widthRatio,
      heightRatio,
    )

  return {
    width:
      Math.round(
        originalWidth *
        scale,
      ),

    height:
      Math.round(
        originalHeight *
        scale,
      ),
  }
}


/* =======================================
   PROCESS ONE PHOTO
======================================= */

export async function processSprigPhoto(
  file: File,
  options: SprigPhotoProcessingOptions = {},
): Promise<string> {
  if (
    !isImageFile(
      file,
    )
  ) {
    throw new Error(
      'The selected file is not an image.',
    )
  }


  const maxWidth =
    options.maxWidth ??
    SPRIG_PHOTO_MAX_WIDTH

  const maxHeight =
    options.maxHeight ??
    SPRIG_PHOTO_MAX_HEIGHT

  const quality =
    options.quality ??
    SPRIG_PHOTO_QUALITY


  const originalDataUrl =
    await readFileAsDataUrl(
      file,
    )


  const image =
    await loadImage(
      originalDataUrl,
    )


  const {
    width,
    height,
  } =
    calculatePhotoDimensions(
      image.naturalWidth ||
        image.width,

      image.naturalHeight ||
        image.height,

      maxWidth,
      maxHeight,
    )


  const canvas =
    document.createElement(
      'canvas',
    )

  canvas.width =
    width

  canvas.height =
    height


  const context =
    canvas.getContext(
      '2d',
    )


  if (!context) {
    throw new Error(
      'Sprig could not prepare this photograph.',
    )
  }


  context.drawImage(
    image,
    0,
    0,
    width,
    height,
  )


  /*
   * JPEG keeps localStorage usage much
   * lower than storing full-size phone
   * photographs.
   *
   * Transparency is not important for
   * normal garden photographs.
   */
  return canvas.toDataURL(
    'image/jpeg',
    quality,
  )
}


/* =======================================
   PROCESS SEVERAL PHOTOS
======================================= */

export async function processSprigPhotos(
  files: File[],
  options: SprigPhotoProcessingOptions = {},
): Promise<string[]> {
  const imageFiles =
    files.filter(
      isImageFile,
    )


  const processedPhotos =
    await Promise.all(
      imageFiles.map(
        (file) =>
          processSprigPhoto(
            file,
            options,
          ),
      ),
    )


  return processedPhotos
}