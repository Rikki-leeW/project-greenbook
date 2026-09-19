import { BackToTop } from '../components/layout/GardenPage'
import type {
  CSSProperties,
} from 'react'
import DetailPageTemplate from '../components/templates/DetailPageTemplate'
import { escapeRtf, downloadBlob, printDocument } from '../utils/exportUtils'
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
    printDocument()
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


    downloadBlob(
      `${makeSafeFileName(
        growingPlace.name,
      )}-growing-place.rtf`,
      new Blob(
        [
          rtf,
        ],
        {
          type:
            'application/rtf',
        },
      ),
    )
  }


  /* =======================================
     BACK TO TOP
  ======================================= */



  return (
    <DetailPageTemplate
      activePage="growing-places"
      onNavigate={onNavigate}
      className="garden-page growing-place-detail-page"
      as="div"
      pageId="growing-place-detail-top"
      journeyBackLabel={journeyBackLabel ? `Back to ${journeyBackLabel}` : 'Back'}
      onJourneyBack={onBack}
      homeLabel="Growing Home"
      onHome={onOpenGrowingPlaces}
      navigationAriaLabel="Growing Place navigation"
    
      eyebrow={<>Growing · Place</>}
      title={<>{growingPlace.name}</>}
      intro={<>{
                getPlaceKindLabel(
                  growingPlace,
                )
              }</>}
    >


        {/* ===================================
            NAVIGATION
        =================================== */}



        {/* ===================================
            HEADER
        =================================== */}

        


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
            ✎ Edit Place
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
                      →
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
                      →
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
                Garden Record
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
                      →
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

        <BackToTop targetId="growing-place-detail-top" label="Back to top" />
      </DetailPageTemplate>
  )
}

