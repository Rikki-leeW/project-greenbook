import type {
    AppPage,
  } from '../../types/navigation'
  
  import {
    sprigNavigation,
  } from './appNavigation'
  
  
  type LibraryDestination =
    | 'library'
    | 'growing-recipes'
    | 'ingredients'
    | 'products'
  
  
  interface SatchelMenuProps {
    isOpen: boolean
  
    onClose: () => void
  
    onNavigate: (
      page: AppPage,
      libraryView?: LibraryDestination,
    ) => void
  }
  
  
  export default function SatchelMenu({
    isOpen,
    onClose,
    onNavigate,
  }: SatchelMenuProps) {
    if (!isOpen) {
      return null
    }
  
  
    /* =======================================
       NAVIGATION
    ======================================= */
  
    function handleNavigate(
      page: AppPage,
      libraryView?: LibraryDestination,
    ) {
      onClose()
  
      onNavigate(
        page,
        libraryView,
      )
    }
  
  
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sprig Satchel"
        onClick={
          onClose
        }
        style={{
          position:
            'fixed',
  
          inset:
            0,
  
          zIndex:
            5000,
  
          background:
            'rgba(25, 35, 27, 0.20)',
  
          padding:
            '12px',
  
          display:
            'flex',
  
          justifyContent:
            'flex-end',
  
          alignItems:
            'flex-start',
        }}
      >
        <section
          onClick={(
            event,
          ) =>
            event.stopPropagation()
          }
          style={{
            width:
              'min(92vw, 720px)',
  
            maxHeight:
              '78vh',
  
            overflowY:
              'auto',
  
            padding:
              '18px 18px 26px',
  
            background:
              '#fffdf7',
  
            border:
              '1px solid rgba(60, 80, 55, 0.18)',
  
            borderRadius:
              '0 0 18px 18px',
  
            boxShadow:
              '0 16px 40px rgba(20, 30, 20, 0.18)',
          }}
        >
  
          {/* =======================================
              SATCHEL HEADER
          ======================================= */}
  
          <div
            style={{
              display:
                'flex',
  
              justifyContent:
                'space-between',
  
              alignItems:
                'flex-start',
  
              gap:
                '20px',
  
              marginBottom:
                '18px',
            }}
          >
            <div>
              <p
                style={{
                  margin:
                    '0 0 4px',
  
                  fontSize:
                    '0.75rem',
  
                  fontWeight:
                    800,
  
                  letterSpacing:
                    '0.1em',
  
                  textTransform:
                    'uppercase',
  
                  color:
                    '#62705d',
                }}
              >
                Sprig
              </p>
  
  
              <h2
                style={{
                  margin:
                    0,
  
                  color:
                    '#304a32',
                }}
              >
                Satchel
              </h2>
  
  
              <p
                style={{
                  margin:
                    '6px 0 0',
  
                  color:
                    '#6e756b',
                }}
              >
                Everything in the garden,
                tucked in here.
              </p>
            </div>
  
  
            <button
              type="button"
              onClick={
                onClose
              }
              aria-label="Close Satchel"
              style={{
                border:
                  0,
  
                background:
                  'transparent',
  
                fontSize:
                  '1.6rem',
  
                cursor:
                  'pointer',
  
                color:
                  '#304a32',
              }}
            >
              ×
            </button>
          </div>
  
  
          {/* =======================================
              DYNAMIC SPRIG APP MAP
          ======================================= */}
  
          <div
            style={{
              display:
                'grid',
  
              gap:
                '22px',
            }}
          >
            {sprigNavigation.map(
              (
                section,
              ) => (
                <section
                  key={
                    section.id
                  }
                >
                  <h3
                    style={{
                      margin:
                        '0 0 8px',
  
                      fontSize:
                        '0.82rem',
  
                      textTransform:
                        'uppercase',
  
                      letterSpacing:
                        '0.09em',
  
                      color:
                        '#667263',
                    }}
                  >
                    {
                      section.title
                    }
                  </h3>
  
  
                  <div
                    style={{
                      display:
                        'grid',
  
                      gap:
                        '6px',
                    }}
                  >
                    {section.items.map(
                      (
                        item,
                      ) => {
                        const isAvailable =
                          item.status ===
                            'live' &&
                          Boolean(
                            item.page,
                          )
  
  
                        return (
                          <button
                            key={
                              item.id
                            }
                            type="button"
                            disabled={
                              !isAvailable
                            }
                            onClick={() => {
                              if (
                                !isAvailable ||
                                !item.page
                              ) {
                                return
                              }
  
  
                              /* =======================================
                                 LIBRARY DESTINATION
                              ======================================= */
  
                              if (
                                item.page ===
                                  'library' &&
                                item.libraryView
                              ) {
                                const libraryView:
                                  LibraryDestination =
                                  item.libraryView ===
                                    'home'
                                    ? 'library'
                                    : item.libraryView
  
  
                                handleNavigate(
                                  'library',
                                  libraryView,
                                )
  
                                return
                              }
  
  
                             /* =======================================
   CALENDAR DESTINATIONS
======================================= */

if (
  item.page ===
  'calendar'
) {
  if (
    item.calendarView ===
    'calculator'
  ) {
    window.location.hash =
      'sprig-sowing-harvest-calculator'


    handleNavigate(
      'calendar',
    )

    return
  }


  /*
   * Ordinary Calendar & Planning always
   * means the top of Calendar, even when
   * the gardener is already somewhere
   * further down the Calendar page.
   */

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}`,
  )


  handleNavigate(
    'calendar',
  )


  window.requestAnimationFrame(
    () => {
      window.requestAnimationFrame(
        () => {
          const calendarTop =
            document.getElementById(
              'sprig-calendar-top',
            )


          if (
            calendarTop
          ) {
            calendarTop.scrollIntoView({
              behavior:
                'smooth',

              block:
                'start',
            })
          } else {
            window.scrollTo({
              top:
                0,

              behavior:
                'smooth',
            })
          }
        },
      )
    },
  )


  return
}


                              /* =======================================
                                STANDARD APP DESTINATION
                              ======================================= */

                              handleNavigate(
                                item.page,
                              )
                            }}
                            style={{
                              width:
                                '100%',
  
                              display:
                                'flex',
  
                              alignItems:
                                'flex-start',
  
                              gap:
                                '12px',
  
                              padding:
                                '11px 10px',
  
                              border:
                                '1px solid rgba(60, 80, 55, 0.12)',
  
                              borderRadius:
                                '9px',
  
                              background:
                                isAvailable
                                  ? '#ffffff'
                                  : '#f3f1ea',
  
                              color:
                                '#304a32',
  
                              textAlign:
                                'left',
  
                              cursor:
                                isAvailable
                                  ? 'pointer'
                                  : 'default',
  
                              opacity:
                                isAvailable
                                  ? 1
                                  : 0.68,
                            }}
                          >
                            <span
                              style={{
                                width:
                                  '28px',
  
                                flexShrink:
                                  0,
  
                                fontSize:
                                  '1.1rem',
  
                                textAlign:
                                  'center',
                              }}
                            >
                              {
                                item.icon
                              }
                            </span>
  
  
                            <span
                              style={{
                                flex:
                                  1,
                              }}
                            >
                              <span
                                style={{
                                  display:
                                    'flex',
  
                                  flexWrap:
                                    'wrap',
  
                                  gap:
                                    '7px',
  
                                  alignItems:
                                    'center',
  
                                  fontWeight:
                                    700,
                                }}
                              >
                                {
                                  item.label
                                }
  
  
                                {item.status ===
                                  'coming-later' && (
                                  <small
                                    style={{
                                      fontWeight:
                                        600,
  
                                      color:
                                        '#858b82',
                                    }}
                                  >
                                    Coming later
                                  </small>
                                )}
                              </span>
  
  
                              {item.note && (
                                <small
                                  style={{
                                    display:
                                      'block',
  
                                    marginTop:
                                      '3px',
  
                                    lineHeight:
                                      1.35,
  
                                    color:
                                      '#777e74',
                                  }}
                                >
                                  {
                                    item.note
                                  }
                                </small>
                              )}
                            </span>
                          </button>
                        )
                      },
                    )}
                  </div>
                </section>
              ),
            )}
          </div>
  
        </section>
      </div>
    )
  }