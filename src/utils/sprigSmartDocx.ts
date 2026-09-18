import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'

import type {
  GardenData,
  SprigPhotoMetadata,
} from '../types'

import {
  getSprigInsightFamilyLabel,
  getSprigInsightStrengthDescription,
  getSprigInsightStrengthLabel,
  type SprigInsight,
  type SprigInsightEvidence,
} from './sprigInsights'


import { downloadBlob } from './exportUtils'

/* =======================================
   EXPORT OPTIONS
======================================= */

export interface SprigSmartDocxOptions {
  gardenData:
    GardenData

  insights:
    SprigInsight[]

  reportTitle?:
    string

  reportSubtitle?:
    string
}


/* =======================================
   INTERNAL PHOTO MODEL
======================================= */

interface SprigSmartReportPhoto {
  key:
    string

  photoUrl:
    string

  title?:
    string

  notes?:
    string

  photoDate?:
    string

  photoTime?:
    string

  tags?:
    string[]

  purpose?:
    string

  sourceLabel:
    string
}


interface PhotoOwner {
  photoUrls?:
    string[]

  photoMetadata?:
    Array<
      SprigPhotoMetadata |
      undefined
    >

  photoDates?:
    Array<
      string |
      undefined
    >
}


/* =======================================
   DATE
======================================= */

function getTodayKey():
  string {
  const now =
    new Date()

  const year =
    now.getFullYear()

  const month =
    String(
      now.getMonth() +
      1,
    ).padStart(
      2,
      '0',
    )

  const day =
    String(
      now.getDate(),
    ).padStart(
      2,
      '0',
    )

  return (
    `${year}-${month}-${day}`
  )
}


function formatDate(
  value:
    string |
    undefined,
):
  string | undefined {
  if (
    !value
  ) {
    return undefined
  }

  const datePart =
    value.slice(
      0,
      10,
    )

  const date =
    new Date(
      `${datePart}T00:00:00`,
    )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return date.toLocaleDateString(
    'en-AU',
    {
      day:
        'numeric',

      month:
        'long',

      year:
        'numeric',
    },
  )
}


/* =======================================
   GENERAL LABEL
======================================= */

function formatLabel(
  value:
    string |
    undefined,
):
  string | undefined {
  if (
    !value
  ) {
    return undefined
  }

  return value
    .replaceAll(
      '-',
      ' ',
    )
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase(),
    )
}


/* =======================================
   PHOTO METADATA
======================================= */

function getPhotoMetadata(
  photoUrl:
    string,

  index:
    number,

  owner:
    PhotoOwner,
):
  SprigPhotoMetadata |
  undefined {
  const indexed =
    owner
      .photoMetadata?.[
        index
      ]

  if (
    indexed
  ) {
    return indexed
  }

  return owner
    .photoMetadata
    ?.find(
      metadata =>
        metadata
          ?.photoUrl ===
        photoUrl,
    )
}


/* =======================================
   PHOTOS FROM AN OWNED RECORD
======================================= */

function getPhotosFromOwner(
  owner:
    PhotoOwner,

  sourceLabel:
    string,

  keyPrefix:
    string,
):
  SprigSmartReportPhoto[] {
  return (
    owner.photoUrls ??
    []
  ).map(
    (
      photoUrl,
      index,
    ) => {
      const metadata =
        getPhotoMetadata(
          photoUrl,
          index,
          owner,
        )

      return {
        key:
          `${keyPrefix}-${index}`,

        photoUrl,

        title:
          metadata?.title,

        notes:
          metadata?.notes,

        photoDate:
          metadata
            ?.photoDate ??
          owner
            .photoDates?.[
              index
            ],

        photoTime:
          metadata?.photoTime,

        tags:
          metadata?.tags,

        purpose:
          metadata?.purpose,

        sourceLabel,
      }
    },
  )
}


/* =======================================
   EVIDENCE → PHOTOGRAPHS
======================================= */

function getEvidencePhotos(
  evidence:
    SprigInsightEvidence,

  gardenData:
    GardenData,
):
  SprigSmartReportPhoto[] {
  switch (
    evidence.recordType
  ) {
    case 'plant-story': {
      const plant =
        gardenData
          .plantStories
          .find(
            item =>
              item.id ===
              evidence.recordId,
          )

      if (
        !plant
      ) {
        return []
      }

      return getPhotosFromOwner(
        plant,
        plant.displayName,
        `plant-${plant.id}`,
      )
    }


    case 'garden-event': {
      const event =
        gardenData
          .events
          .find(
            item =>
              item.id ===
              evidence.recordId,
          )

      if (
        !event
      ) {
        return []
      }

      return getPhotosFromOwner(
        event,
        event.title,
        `event-${event.id}`,
      )
    }


    case 'harvest': {
      const harvest =
        gardenData
          .harvests
          .find(
            item =>
              item.id ===
              evidence.recordId,
          )

      if (
        !harvest
      ) {
        return []
      }

      const harvestDate =
        formatDate(
          harvest.date,
        )

      return getPhotosFromOwner(
        harvest,
        harvestDate
          ? `Harvest · ${harvestDate}`
          : 'Harvest',
        `harvest-${harvest.id}`,
      )
    }


    case 'garden-trial': {
      const trial =
        (
          gardenData
            .gardenTrials ??
          []
        ).find(
          item =>
            item.id ===
            evidence.recordId,
        )

      if (
        !trial
      ) {
        return []
      }

      const trialPhotos =
        getPhotosFromOwner(
          trial,
          trial.title,
          `trial-${trial.id}`,
        )

      const observationPhotos =
        (
          trial.observations ??
          []
        ).flatMap(
          observation =>
            getPhotosFromOwner(
              observation,
              `${trial.title} · ${formatDate(
                observation.date,
              ) ?? 'Trial observation'}`,
              `trial-${trial.id}-observation-${observation.id}`,
            ),
        )

      return [
        ...trialPhotos,
        ...observationPhotos,
      ]
    }


    case 'gallery-photo': {
      const galleryPhoto =
        (
          gardenData
            .galleryPhotos ??
          []
        ).find(
          item =>
            item.id ===
            evidence.recordId,
        )

      if (
        !galleryPhoto
      ) {
        return []
      }

      return [
        {
          key:
            `gallery-${galleryPhoto.id}`,

          photoUrl:
            galleryPhoto.photoUrl,

          title:
            galleryPhoto.title,

          notes:
            galleryPhoto.notes,

          photoDate:
            galleryPhoto.photoDate,

          tags:
            galleryPhoto.tags,

          sourceLabel:
            galleryPhoto.title ??
            'Garden Gallery',
        },
      ]
    }


    /*
     * Growing Places, Growing Setups and Plant
     * Reference can still appear as evidence in
     * the report text.
     *
     * We only embed a photograph when the current
     * record model gives this exporter a clear
     * photograph owner to resolve.
     *
     * Missing evidence stays missing.
     */
    case 'growing-place':
    case 'growing-setup':
    case 'plant-reference':
    default:
      return []
  }
}


/* =======================================
   RELEVANT PHOTOS FOR AN INSIGHT
======================================= */

function getInsightPhotos(
  insight:
    SprigInsight,

  gardenData:
    GardenData,
):
  SprigSmartReportPhoto[] {
  const photos =
    insight.evidence.flatMap(
      evidence =>
        getEvidencePhotos(
          evidence,
          gardenData,
        ),
    )

  const seen =
    new Set<string>()

  const uniquePhotos =
    photos.filter(
      photo => {
        const key =
          photo.photoUrl

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

  /*
   * A report should illustrate evidence, not
   * become a complete duplicate of the Gallery.
   *
   * Up to four relevant photographs per insight
   * gives useful visual evidence while keeping
   * the document readable.
   */
  return uniquePhotos.slice(
    0,
    4,
  )
}


/* =======================================
   IMAGE LOADING
======================================= */

function loadHtmlImage(
  photoUrl:
    string,
):
  Promise<HTMLImageElement> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const image =
        new Image()

      image.onload =
        () =>
          resolve(
            image,
          )

      image.onerror =
        () =>
          reject(
            new Error(
              'Sprig could not load a report photograph.',
            ),
          )

      image.src =
        photoUrl
    },
  )
}


/* =======================================
   IMAGE → PNG
======================================= */

async function photoUrlToPng(
  photoUrl:
    string,
): Promise<{
  data:
    Uint8Array

  width:
    number

  height:
    number
}> {
  const image =
    await loadHtmlImage(
      photoUrl,
    )

  const naturalWidth =
    Math.max(
      1,
      image.naturalWidth ||
        image.width,
    )

  const naturalHeight =
    Math.max(
      1,
      image.naturalHeight ||
        image.height,
    )

  /*
   * Keep embedded report photographs sensible.
   *
   * There is no value putting a 6000px camera
   * original into a Word report.
   */
  const maximumPixelSize =
    1600

  const scale =
    Math.min(
      1,
      maximumPixelSize /
        Math.max(
          naturalWidth,
          naturalHeight,
        ),
    )

  const canvasWidth =
    Math.max(
      1,
      Math.round(
        naturalWidth *
          scale,
      ),
    )

  const canvasHeight =
    Math.max(
      1,
      Math.round(
        naturalHeight *
          scale,
      ),
    )

  const canvas =
    document.createElement(
      'canvas',
    )

  canvas.width =
    canvasWidth

  canvas.height =
    canvasHeight

  const context =
    canvas.getContext(
      '2d',
    )

  if (
    !context
  ) {
    throw new Error(
      'Sprig could not prepare a report photograph.',
    )
  }

  context.drawImage(
    image,
    0,
    0,
    canvasWidth,
    canvasHeight,
  )

  const blob =
    await new Promise<
      Blob | null
    >(
      resolve =>
        canvas.toBlob(
          resolve,
          'image/png',
        ),
    )

  if (
    !blob
  ) {
    throw new Error(
      'Sprig could not prepare a report photograph.',
    )
  }

  const buffer =
    await blob.arrayBuffer()

  return {
    data:
      new Uint8Array(
        buffer,
      ),

    width:
      canvasWidth,

    height:
      canvasHeight,
  }
}


/* =======================================
   REPORT IMAGE SIZE
======================================= */

function getReportImageSize(
  width:
    number,

  height:
    number,
): {
  width:
    number

  height:
    number
} {
  const maximumWidth =
    480

  const maximumHeight =
    330

  const scale =
    Math.min(
      maximumWidth /
        width,

      maximumHeight /
        height,

      1,
    )

  return {
    width:
      Math.max(
        1,
        Math.round(
          width *
            scale,
        ),
      ),

    height:
      Math.max(
        1,
        Math.round(
          height *
            scale,
        ),
      ),
  }
}


/* =======================================
   PHOTO CAPTION
======================================= */

function getPhotoCaption(
  photo:
    SprigSmartReportPhoto,
):
  string {
  const parts:
    string[] = []

  if (
    photo.title
  ) {
    parts.push(
      photo.title,
    )
  }

  const formattedDate =
    formatDate(
      photo.photoDate,
    )

  if (
    formattedDate
  ) {
    parts.push(
      photo.photoTime
        ? `${formattedDate} · ${photo.photoTime}`
        : formattedDate,
    )
  }

  const purpose =
    formatLabel(
      photo.purpose,
    )

  if (
    purpose
  ) {
    parts.push(
      purpose,
    )
  }

  if (
    photo.tags &&
    photo.tags.length >
      0
  ) {
    parts.push(
      photo.tags
        .map(
          tag =>
            `#${tag.replace(
              /^#+/,
              '',
            )}`,
        )
        .join(
          ' ',
        ),
    )
  }

  if (
    parts.length ===
    0
  ) {
    return photo.sourceLabel
  }

  return parts.join(
    ' · ',
  )
}


/* =======================================
   BUILD PHOTO CONTENT
======================================= */

async function buildPhotoContent(
  photo:
    SprigSmartReportPhoto,
): Promise<
  Paragraph[]
> {
  try {
    const image =
      await photoUrlToPng(
        photo.photoUrl,
      )

    const size =
      getReportImageSize(
        image.width,
        image.height,
      )

    const content:
      Paragraph[] = [
        new Paragraph({
          alignment:
            AlignmentType.CENTER,

          spacing: {
            before:
              120,

            after:
              60,
          },

          children: [
            new ImageRun({
              data:
                image.data,

              type:
                'png',

              transformation: {
                width:
                  size.width,

                height:
                  size.height,
              },
            }),
          ],
        }),

        new Paragraph({
          alignment:
            AlignmentType.CENTER,

          spacing: {
            after:
              80,
          },

          children: [
            new TextRun({
              text:
                getPhotoCaption(
                  photo,
                ),

              italics:
                true,

              size:
                18,

              color:
                '68705F',
            }),
          ],
        }),
      ]

    if (
      photo.notes
    ) {
      content.push(
        new Paragraph({
          alignment:
            AlignmentType.CENTER,

          spacing: {
            after:
              120,
          },

          children: [
            new TextRun({
              text:
                photo.notes,

              size:
                19,

              color:
                '4D5548',
            }),
          ],
        }),
      )
    }

    return content
  } catch {
    /*
     * A broken or unavailable photograph must
     * never destroy the whole Intelligence
     * report.
     */
    return [
      new Paragraph({
        spacing: {
          before:
            80,

          after:
            100,
        },

        children: [
          new TextRun({
            text:
              `Photograph from ${photo.sourceLabel} could not be embedded.`,

            italics:
              true,

            size:
              18,

            color:
              '777777',
          }),
        ],
      }),
    ]
  }
}


/* =======================================
   EVIDENCE PARAGRAPH
======================================= */

function buildEvidenceParagraph(
  evidence:
    SprigInsightEvidence,
):
  Paragraph {
  const detail =
    evidence.detail
      ? ` · ${evidence.detail}`
      : ''

  return new Paragraph({
    bullet: {
      level:
        0,
    },

    spacing: {
      after:
        50,
    },

    children: [
      new TextRun({
        text:
          evidence.label,

        bold:
          true,
      }),

      new TextRun({
        text:
          detail,
      }),
    ],
  })
}


/* =======================================
   BUILD ONE INSIGHT
======================================= */

async function buildInsightContent(
  insight:
    SprigInsight,

  gardenData:
    GardenData,
):
  Promise<
    Paragraph[]
  > {
  const strengthLabel =
    getSprigInsightStrengthLabel(
      insight.strength,
    )

  const strengthDescription =
    getSprigInsightStrengthDescription(
      insight.strength,
    )

  const familyLabel =
    getSprigInsightFamilyLabel(
      insight.family,
    )

  const content:
    Paragraph[] = [
      new Paragraph({
        heading:
          HeadingLevel.HEADING_2,

        spacing: {
          before:
            300,

          after:
            80,
        },

        children: [
          new TextRun({
            text:
              insight.title,

            bold:
              true,

            color:
              '40513B',
          }),
        ],
      }),

      new Paragraph({
        spacing: {
          after:
            100,
        },

        children: [
          new TextRun({
            text:
              familyLabel,

            bold:
              true,

            color:
              '66765D',
          }),

          new TextRun({
            text:
              ` · ${strengthLabel}`,

            italics:
              true,

            color:
              '66765D',
          }),
        ],
      }),

      new Paragraph({
        spacing: {
          after:
            160,
        },

        children: [
          new TextRun({
            text:
              insight.message,

            size:
              22,
          }),
        ],
      }),

      new Paragraph({
        spacing: {
          before:
            80,

          after:
            60,
        },

        children: [
          new TextRun({
            text:
              'Why Sprig noticed this',

            bold:
              true,

            color:
              '40513B',
          }),
        ],
      }),

      new Paragraph({
        spacing: {
          after:
            140,
        },

        children: [
          new TextRun({
            text:
              insight.reasoning,
          }),
        ],
      }),
  ]


  if (
    insight.evidence.length >
    0
  ) {
    content.push(
      new Paragraph({
        spacing: {
          before:
            80,

          after:
            70,
        },

        children: [
          new TextRun({
            text:
              'Evidence',

            bold:
              true,

            color:
              '40513B',
          }),
        ],
      }),
    )

    content.push(
      ...insight.evidence.map(
        buildEvidenceParagraph,
      ),
    )
  }


  content.push(
    new Paragraph({
      spacing: {
        before:
          90,

        after:
          120,
      },

      children: [
        new TextRun({
          text:
            strengthDescription,

          italics:
            true,

          size:
            18,

          color:
            '68705F',
        }),
      ],
    }),
  )


  const photos =
    getInsightPhotos(
      insight,
      gardenData,
    )

  if (
    photos.length >
    0
  ) {
    content.push(
      new Paragraph({
        heading:
          HeadingLevel.HEADING_3,

        spacing: {
          before:
            180,

          after:
            60,
        },

        children: [
          new TextRun({
            text:
              photos.length ===
              1
                ? 'Evidence photograph'
                : 'Evidence photographs',

            bold:
              true,

            color:
              '40513B',
          }),
        ],
      }),
    )

    for (
      const photo of
      photos
    ) {
      content.push(
        ...(
          await buildPhotoContent(
            photo,
          )
        ),
      )
    }
  }


  return content
}


/* =======================================
   FILE DOWNLOAD
======================================= */

/* =======================================
   EXPORT SPRIG SMART DOCX
======================================= */

export async function exportSprigSmartDocx({
  gardenData,
  insights,
  reportTitle =
    'Sprig Intelligence Report',
  reportSubtitle =
    'Useful things Sprig has noticed from your garden records.',
}: SprigSmartDocxOptions):
  Promise<void> {
  const generatedDate =
    new Date()
      .toLocaleDateString(
        'en-AU',
        {
          day:
            'numeric',

          month:
            'long',

          year:
            'numeric',
        },
      )


  const children:
    Paragraph[] = [
      new Paragraph({
        heading:
          HeadingLevel.TITLE,

        alignment:
          AlignmentType.CENTER,

        spacing: {
          after:
            120,
        },

        children: [
          new TextRun({
            text:
              reportTitle,

            bold:
              true,

            color:
              '40513B',
          }),
        ],
      }),

      new Paragraph({
        alignment:
          AlignmentType.CENTER,

        spacing: {
          after:
            80,
        },

        children: [
          new TextRun({
            text:
              reportSubtitle,

            italics:
              true,

            color:
              '68705F',
          }),
        ],
      }),

      new Paragraph({
        alignment:
          AlignmentType.CENTER,

        spacing: {
          after:
            280,
        },

        children: [
          new TextRun({
            text:
              `Generated ${generatedDate} · ${insights.length} ${
                insights.length ===
                1
                  ? 'observation'
                  : 'observations'
              }`,

            size:
              18,

            color:
              '777777',
          }),
        ],
      }),

      new Paragraph({
        spacing: {
          after:
            120,
        },

        children: [
          new TextRun({
            text:
              'Your records remain the truth.',

            bold:
              true,

            color:
              '40513B',
          }),

          new TextRun({
            text:
              ' Sprig Smart interprets relationships between them. It does not turn correlation into causation, and missing evidence stays missing.',
          }),
        ],
      }),
  ]


  if (
    insights.length ===
    0
  ) {
    children.push(
      new Paragraph({
        spacing: {
          before:
            220,
        },

        children: [
          new TextRun({
            text:
              'There are no Sprig Intelligence observations in this report.',
          }),
        ],
      }),
    )
  }


  for (
    const insight of
    insights
  ) {
    children.push(
      ...(
        await buildInsightContent(
          insight,
          gardenData,
        )
      ),
    )
  }


  children.push(
    new Paragraph({
      spacing: {
        before:
          360,

        after:
          80,
      },

      children: [
        new TextRun({
          text:
            'About this report',

          bold:
            true,

          color:
            '40513B',
        }),
      ],
    }),

    new Paragraph({
      children: [
        new TextRun({
          text:
            'This report is derived from the garden records available to Sprig when it was generated. Observations may change as the garden gains new records, outcomes and evidence.',
        }),
      ],
    }),
  )


  const documentFile =
    new Document({
      creator:
        'Sprig',

      title:
        reportTitle,

      description:
        reportSubtitle,

      styles: {
        default: {
          document: {
            run: {
              font:
                'Aptos',

              size:
                21,

              color:
                '3E463A',
            },

            paragraph: {
              spacing: {
                after:
                  100,

                line:
                  276,
              },
            },
          },
        },

        paragraphStyles: [
          {
            id:
              'Title',

            name:
              'Title',

            basedOn:
              'Normal',

            next:
              'Normal',

            quickFormat:
              true,

            run: {
              font:
                'Georgia',

              size:
                38,

              bold:
                true,

              color:
                '40513B',
            },
          },

          {
            id:
              'Heading2',

            name:
              'Heading 2',

            basedOn:
              'Normal',

            next:
              'Normal',

            quickFormat:
              true,

            run: {
              font:
                'Georgia',

              size:
                27,

              bold:
                true,

              color:
                '40513B',
            },
          },

          {
            id:
              'Heading3',

            name:
              'Heading 3',

            basedOn:
              'Normal',

            next:
              'Normal',

            quickFormat:
              true,

            run: {
              font:
                'Georgia',

              size:
                22,

              bold:
                true,

              color:
                '53634C',
            },
          },
        ],
      },

      sections: [
        {
          properties: {
            page: {
              margin: {
                top:
                  900,

                right:
                  900,

                bottom:
                  900,

                left:
                  900,
              },
            },
          },

          children,
        },
      ],
    })


  const blob =
    await Packer.toBlob(
      documentFile,
    )


  downloadBlob(
    `sprig-intelligence-${getTodayKey()}.docx`,
    blob,
  )
}
