import type {
  CSSProperties,
} from 'react'
import DetailPageTemplate from '../components/templates/DetailPageTemplate'
import type {
  GardenEvent,
  GrowingPlace,
  GrowingSetup,
  PlantStory,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface GrowingPlaceDetailProps {
  growingPlace:
    GrowingPlace

  plants:
    PlantStory[]

  events:
    GardenEvent[]

  growingSetups:
    GrowingSetup[]

  journeyBackLabel?:
    string |
    null

  onBack:
    () => void

  onOpenGrowingPlaces:
    () => void

  onEdit:
    () => void

  onDelete:
    () => void

  onOpenPlant: (
    plantId:
      string,
  ) => void

  onOpenEvent: (
    eventId:
      string,
  ) => void

  onOpenRecipe: (
    recipeId:
      string,
  ) => void

  onNavigate: (
    page:
      AppPage,
  ) => void
}


/* =======================================
   LABELS
======================================= */

function formatLabel(
  value:
    string,
):
  string {
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


function getPlaceKindLabel(
  place:
    GrowingPlace,
):
  string {
  if (
    place.kind ===
      'other' &&
    place.customKindLabel
  ) {
    return place.customKindLabel
  }


  return formatLabel(
    place.kind,
  )
}


function getPlantLabel(
  plant:
    PlantStory,
):
  string {
  return (
    plant.displayName ||
    plant.variety ||
    plant.plantName ||
    'Plant Story'
  )
}


/* =======================================
   CURRENT SETUPS
======================================= */

function getCurrentSetupIds(
  plant:
    PlantStory,
):
  string[] {
  if (
    plant.currentGrowingSetupIds &&
    plant.currentGrowingSetupIds.length >
      0
  ) {
    return plant.currentGrowingSetupIds
  }


  if (
    plant.currentGrowingSetupId
  ) {
    return [
      plant.currentGrowingSetupId,
    ]
  }


  return []
}


/* =======================================
   EXPORT HELPERS
======================================= */

function makeSafeFileName(
  value:
    string,
): string {
  return value
    .trim()
    .replace(
      /[<>:"/\\|?*\u0000-\u001F]/g,
      '',
    )
    .replace(
      /\s+/g,
      '-',
    )
    .replace(
      /-+/g,
      '-',
    )
    .replace(
      /^-|-$/g,
      '',
    ) ||
    'growing-place'
}


function escapeRtf(
  value:
    string,
): string {
  return value
    .replaceAll(
      '\\',
      '\\\\',
    )
    .replaceAll(
      '{',
      '\\{',
    )
    .replaceAll(
      '}',
      '\\}',
    )
    .replace(
      /\r?\n/g,
      '\\line ',
    )
    .replace(
      /[^\x00-\x7F]/g,
      character => {
        const code =
          character.charCodeAt(
            0,
          )


        const signedCode =
          code >
          32767
            ? code -
              65536
            : code


        return `\\u${signedCode}?`
      },
    )
}


/* =======================================
   RELATIONSHIP ROW PRESENTATION
======================================= */

const relationshipRowStyle:
  CSSProperties = {
    width:
      '100%',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    gap:
      '1rem',

    padding:
      '0.9rem 0',

    border:
      '0',

    borderBottom:
      '1px solid rgba(72, 71, 56, 0.18)',

    background:
      'transparent',

    textAlign:
      'left',

    cursor:
      'pointer',

    font:
      'inherit',

    color:
      'inherit',
  }


const relationshipCopyStyle:
  CSSProperties = {
    minWidth:
      0,

    flex:
      '1 1 auto',
  }


const relationshipTitleStyle:
  CSSProperties = {
    display:
      'block',

    overflowWrap:
      'anywhere',
  }


const relationshipArrowStyle:
  CSSProperties = {
    flexShrink:
      0,
  }


/* =======================================
   LOCAL PRESENTATION
======================================= */

const styles = `
  .growing-place-detail-page .growing-place-detail-row {
    display: grid;
    grid-template-columns: minmax(7.5rem, 0.8fr) minmax(0, 1.4fr);
    gap: 1rem;
    padding: 0.7rem 0;
    border-bottom: 1px solid rgba(72, 71, 56, 0.16);
  }

  .growing-place-detail-page .growing-place-detail-row > span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .growing-place-detail-page .growing-place-detail-navigation,
  .growing-place-detail-page .growing-place-detail-actions,
  .growing-place-detail-page .growing-place-export-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .growing-place-detail-page .growing-place-detail-navigation {
    margin-bottom: 1rem;
  }

  .growing-place-detail-page .growing-place-detail-actions {
    margin: 0 0 1.5rem;
  }

  .growing-place-detail-page .growing-place-export-actions {
    margin: 0 0 1.5rem;
  }

  .growing-place-detail-page .detail-back-to-top {
    display: flex;
    justify-content: center;
    padding: 1rem 0 2rem;
  }

  @media (max-width: 620px) {
    .growing-place-detail-page .growing-place-detail-row {
      grid-template-columns: minmax(0, 1fr);
      gap: 0.2rem;
    }

    .growing-place-detail-page .growing-place-detail-row strong {
      overflow-wrap: anywhere;
    }
  }

  @media print {
    .growing-place-detail-page .growing-place-detail-navigation,
    .growing-place-detail-page .growing-place-detail-actions,
    .growing-place-detail-page .growing-place-export-actions,
    .growing-place-detail-page .detail-back-to-top {
      display: none !important;
    }
  }
`;


/* =======================================
   DETAIL ROW
======================================= */

function DetailRow({
  label,
  value,
}: {
  label:
    string

  value:
    string
}) {
  return (
    <div className="growing-place-detail-row">
      <strong>
        {label}
      </strong>

      <span>
        {value}
      </span>
    </div>
  )
}


/* =======================================
   PAGE
======================================= */

export default function GrowingPlaceDetail({
  growingPlace,
  plants,
  events,
  growingSetups,
  journeyBackLabel,
  onBack,
  onOpenGrowingPlaces,
  onEdit,
  onDelete,
  onOpenPlant,
  onOpenEvent,
  onOpenRecipe,
  onNavigate,
}: GrowingPlaceDetailProps) {

  const plantsHere =
    plants
      .filter(
        plant =>
          plant.currentGrowingPlaceId ===
          growingPlace.id,
      )
      .sort(
        (
          first,
          second,
        ) =>
          getPlantLabel(
            first,
          ).localeCompare(
            getPlantLabel(
              second,
            ),
          ),
      )


  const eventsHere =
    [
      ...events,
    ]
      .filter(
        event =>
          event.growingPlaceIds
            ?.includes(
              growingPlace.id,
            ),
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.date.localeCompare(
            first.date,
          ),
      )


  const setupIds =
    Array.from(
      new Set(
        plantsHere.flatMap(
          plant =>
            getCurrentSetupIds(
              plant,
            ),
        ),
      ),
    )


  const setupsHere =
    setupIds
      .map(
        setupId =>
          growingSetups.find(
            setup =>
              setup.id ===
              setupId,
          ),
      )
      .filter(
        (
          setup,
        ): setup is GrowingSetup =>
          Boolean(
            setup,
          ),
      )
      .sort(
        (
          first,
          second,
        ) =>
          first.name.localeCompare(
            second.name,
          ),
      )


  /* =======================================
     EXPORT
  ======================================= */

  function exportPdf() {
    window.print()
  }


  function exportRtf() {
    const sections:
      string[] = [
        `\\b ${escapeRtf(
          growingPlace.name,
        )}\\b0`,

        `\\b Place type\\b0\\line ${escapeRtf(
          getPlaceKindLabel(
            growingPlace,
          ),
        )}`,
      ]


    if (
      growingPlace.aspect
    ) {
      sections.push(
        `\\b Aspect\\b0\\line ${escapeRtf(
          formatLabel(
            growingPlace.aspect,
          ),
        )}`,
      )
    }


    if (
      growingPlace.sunlight
    ) {
      sections.push(
        `\\b Sunlight\\b0\\line ${escapeRtf(
          formatLabel(
            growingPlace.sunlight,
          ),
        )}`,
      )
    }


    if (
      growingPlace.shelter
    ) {
      sections.push(
        `\\b Shelter\\b0\\line ${escapeRtf(
          formatLabel(
            growingPlace.shelter,
          ),
        )}`,
      )
    }


    if (
      growingPlace.notes
    ) {
      sections.push(
        `\\b Notes\\b0\\line ${escapeRtf(
          growingPlace.notes,
        )}`,
      )
    }


    sections.push(
      `\\b Plant Stories living here now\\b0\\line ${
        plantsHere.length >
        0
          ? escapeRtf(
              plantsHere
                .map(
                  plant =>
                    getPlantLabel(
                      plant,
                    ),
                )
                .join(
                  ', ',
                ),
            )
          : 'No active Plant Stories are currently recorded here.'
      }`,
    )


    sections.push(
      `\\b Growing Setups used here\\b0\\line ${
        setupsHere.length >
        0
          ? escapeRtf(
              setupsHere
                .map(
                  setup =>
                    setup.name,
                )
                .join(
                  ', ',
                ),
            )
          : 'No current Growing Setup is linked through Plant Stories living here.'
      }`,
    )


    sections.push(
      `\\b Journal pages from here\\b0\\line ${
        eventsHere.length >
        0
          ? eventsHere
              .map(
                event =>
                  `${escapeRtf(
                    event.date,
                  )} - ${escapeRtf(
                    event.title ||
                    'Garden Journal',
                  )}`,
              )
              .join(
                '\\line ',
              )
          : 'No Journal pages are linked to this Growing Place yet.'
      }`,
    )


    const rtf =
      `{\\rtf1\\ansi\\deff0` +
      `{\\fonttbl{\\f0 Georgia;}}` +
      `\\fs24\\f0 ` +
      sections.join(
        '\\par\\par ',
      ) +
      `}`


    const blob =
      new Blob(
        [
          rtf,
        ],
        {
          type:
            'application/rtf',
        },
      )


    const url =
      URL.createObjectURL(
        blob,
      )


    const link =
      document.createElement(
        'a',
      )


    link.href =
      url


    link.download =
      `${makeSafeFileName(
        growingPlace.name,
      )}-growing-place.rtf`


    document.body.appendChild(
      link,
    )


    link.click()


    link.remove()


    window.setTimeout(
      () => {
        URL.revokeObjectURL(
          url,
        )
      },
      0,
    )
  }


  /* =======================================
     BACK TO TOP
  ======================================= */

  function backToTop() {
    document
      .getElementById(
        'growing-place-detail-top',
      )
      ?.scrollIntoView({
        behavior:
          window.matchMedia(
            '(prefers-reduced-motion: reduce)',
          ).matches
            ? 'auto'
            : 'smooth',

        block:
          'start',
      })
  }


  return (
    <DetailPageTemplate activePage="growing-places" onNavigate={onNavigate} className="garden-page growing-place-detail-page" as="div" pageId="growing-place-detail-top">
        <style>
          {styles}
        </style>


        {/* ===================================
            NAVIGATION
        =================================== */}

        <div className="growing-place-detail-navigation">
          <button
            type="button"
            className="record-action-button"
            onClick={
              onBack
            }
          >
            â†{' '}
            {
              journeyBackLabel
                ? `Back to ${journeyBackLabel}`
                : 'Back'
            }
          </button>


          <button
            type="button"
            className="record-action-button"
            onClick={
              onOpenGrowingPlaces
            }
          >
            Growing Home
          </button>
        </div>


        {/* ===================================
            HEADER
        =================================== */}

        <header className="journal-header">
          <div>
            <p className="section-label">
              Growing Â· Place
            </p>


            <h1>
              {growingPlace.name}
            </h1>


            <p className="journal-intro">
              {
                getPlaceKindLabel(
                  growingPlace,
                )
              }
            </p>
          </div>
        </header>


        {/* ===================================
            RECORD ACTIONS
        =================================== */}

        <div className="growing-place-detail-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={
              onEdit
            }
          >
            âœŽ Edit Place
          </button>


          <button
            type="button"
            className="record-action-button"
            onClick={
              onDelete
            }
          >
            Delete Place
          </button>
        </div>


        <div
          className="growing-place-export-actions"
          aria-label="Growing Place exports"
        >
          <button
            type="button"
            className="secondary-button"
            onClick={
              exportPdf
            }
          >
            PDF
          </button>


          <button
            type="button"
            className="secondary-button"
            onClick={
              exportRtf
            }
          >
            RTF
          </button>
        </div>


        {/* ===================================
            PLACE DETAILS
        =================================== */}

        <section className="story-section">
          <div className="section-heading">
            <div>
              <p className="section-label">
                About this place
              </p>


              <h2>
                Location & conditions
              </h2>
            </div>
          </div>


          <div>
            <DetailRow
              label="Place type"
              value={
                getPlaceKindLabel(
                  growingPlace,
                )
              }
            />


            {growingPlace.aspect && (
              <DetailRow
                label="Aspect"
                value={
                  formatLabel(
                    growingPlace.aspect,
                  )
                }
              />
            )}


            {growingPlace.sunlight && (
              <DetailRow
                label="Sunlight"
                value={
                  formatLabel(
                    growingPlace.sunlight,
                  )
                }
              />
            )}


            {growingPlace.shelter && (
              <DetailRow
                label="Shelter"
                value={
                  formatLabel(
                    growingPlace.shelter,
                  )
                }
              />
            )}
          </div>


          {growingPlace.notes && (
            <div
              style={{
                marginTop:
                  '1rem',
              }}
            >
              <p className="section-label">
                Notes
              </p>


              <p>
                {
                  growingPlace.notes
                }
              </p>
            </div>
          )}
        </section>


        {/* ===================================
            PLANTS
        =================================== */}

        <section className="story-section">
          <div className="section-heading">
            <div>
              <p className="section-label">
                Living here now
              </p>


              <h2>
                Plant Stories
              </h2>
            </div>
          </div>


          {plantsHere.length ===
          0 ? (
            <p>
              No active Plant Stories are
              currently recorded here.
            </p>
          ) : (
            <div>
              {plantsHere.map(
                plant => (
                  <button
                    key={
                      plant.id
                    }
                    type="button"
                    style={
                      relationshipRowStyle
                    }
                    onClick={() =>
                      onOpenPlant(
                        plant.id,
                      )
                    }
                  >
                    <span
                      style={
                        relationshipCopyStyle
                      }
                    >
                      <strong
                        style={
                          relationshipTitleStyle
                        }
                      >
                        {
                          getPlantLabel(
                            plant,
                          )
                        }
                      </strong>


                      <span className="form-whisper">
                        Open Plant Story
                      </span>
                    </span>


                    <span
                      aria-hidden="true"
                      style={
                        relationshipArrowStyle
                      }
                    >
                      â†’
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </section>


        {/* ===================================
            SETUPS GATHERED FROM PLANTS
        =================================== */}

        <section className="story-section">
          <div className="section-heading">
            <div>
              <p className="section-label">
                What they grow in
              </p>


              <h2>
                Growing Setups used here
              </h2>


              <p>
                These relationships belong to
                the Plant Stories. The place
                itself still remembers only
                where.
              </p>
            </div>
          </div>


          {setupsHere.length ===
          0 ? (
            <p>
              No current Growing Setup is
              linked through Plant Stories
              living here.
            </p>
          ) : (
            <div>
              {setupsHere.map(
                setup => (
                  <button
                    key={
                      setup.id
                    }
                    type="button"
                    style={
                      relationshipRowStyle
                    }
                    onClick={() =>
                      onOpenRecipe(
                        setup.id,
                      )
                    }
                  >
                    <span
                      style={
                        relationshipCopyStyle
                      }
                    >
                      <strong
                        style={
                          relationshipTitleStyle
                        }
                      >
                        {
                          setup.name
                        }
                      </strong>


                      <span className="form-whisper">
                        {
                          setup.category ===
                            'own-mix'
                            ? 'My Recipe'
                            : setup.category ===
                              'bought-mix'
                              ? 'Bought Mix'
                              : setup.category ===
                                'growing-system'
                                ? 'Growing System'
                                : 'Ground Type'
                        }
                      </span>
                    </span>


                    <span
                      aria-hidden="true"
                      style={
                        relationshipArrowStyle
                      }
                    >
                      â†’
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </section>


        {/* ===================================
            JOURNAL
        =================================== */}

        <section className="story-section">
          <div className="section-heading">
            <div>
              <p className="section-label">
                Chronicle
              </p>


              <h2>
                Journal pages from here
              </h2>
            </div>
          </div>


          {eventsHere.length ===
          0 ? (
            <p>
              No Journal pages are linked
              to this Growing Place yet.
            </p>
          ) : (
            <div>
              {eventsHere.map(
                event => (
                  <button
                    key={
                      event.id
                    }
                    type="button"
                    style={
                      relationshipRowStyle
                    }
                    onClick={() =>
                      onOpenEvent(
                        event.id,
                      )
                    }
                  >
                    <span
                      style={
                        relationshipCopyStyle
                      }
                    >
                      <strong
                        style={
                          relationshipTitleStyle
                        }
                      >
                        {
                          event.title ||
                          'Garden Journal'
                        }
                      </strong>


                      <span className="form-whisper">
                        {
                          event.date
                        }
                      </span>
                    </span>


                    <span
                      aria-hidden="true"
                      style={
                        relationshipArrowStyle
                      }
                    >
                      â†’
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </section>


        {/* ===================================
            BACK TO TOP
        =================================== */}

        <div className="detail-back-to-top">
          <button
            type="button"
            className="text-button"
            onClick={
              backToTop
            }
          >
            â†‘ Back to top
          </button>
        </div>
      </DetailPageTemplate>
  )
}

