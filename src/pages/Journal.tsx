
import { useState } from 'react'
import MainPageTemplate from '../components/templates/MainPageTemplate'
import type {
  GardenEvent,
  PlantStory,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface JournalProps {
  events: GardenEvent[]

  plants: PlantStory[]

  onAddEntry: () => void

  onOpenEntry: (
    eventId: string,
  ) => void

  onDeleteEvent: (
    eventId: string,
  ) => void

  onNavigate: (
    page: AppPage,
  ) => void
}


/* =======================================
   EVENT EMOJI
======================================= */

function getEventEmoji(
  type: GardenEvent['type'],
): string {
  if (
    type ===
    'planted'
  ) {
    return '🌱'
  }

  if (
    type ===
    'sprouted'
  ) {
    return '🌿'
  }

  if (
    type ===
    'watered'
  ) {
    return '💧'
  }

  if (
    type ===
    'fed'
  ) {
    return '🧪'
  }

  if (
    type ===
    'moved'
  ) {
    return '🪴'
  }

  if (
    type ===
    'transplanted'
  ) {
    return '🌱'
  }

  if (
    type ===
    'hilled'
  ) {
    return '🥔'
  }

  if (
    type ===
    'pruned'
  ) {
    return '✂️'
  }

  if (
    type ===
    'treated'
  ) {
    return '🩹'
  }

  if (
    type ===
    'weather'
  ) {
    return '🌦️'
  }

  if (
    type ===
    'photo'
  ) {
    return '📷'
  }

  if (
    type ===
    'harvest'
  ) {
    return '🧺'
  }

  if (
    type ===
    'observation'
  ) {
    return '👀'
  }

  if (
    type ===
    'note'
  ) {
    return '📖'
  }

  return '📝'
}


/* =======================================
   DATE
======================================= */

function formatDate(
  date: string,
): string {
  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString(
    'en-AU',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
}


/* =======================================
   PLANT NAMES
======================================= */

function getPlantNames(
  event: GardenEvent,
  plants: PlantStory[],
): string {
  if (
    event.plantStoryIds.length ===
    0
  ) {
    return 'The wider garden'
  }


  const matchingPlants =
    plants.filter(
      plant =>
        event.plantStoryIds.includes(
          plant.id,
        ),
    )


  if (
    matchingPlants.length ===
    0
  ) {
    return 'A plant story'
  }


  return matchingPlants
    .map(
      plant =>
        plant.displayName,
    )
    .join(
      ', ',
    )
}


/* =======================================
   JOURNAL
======================================= */

export default function Journal({
  events,
  plants,
  onAddEntry,
  onOpenEntry,
  onDeleteEvent,
  onNavigate,
}: JournalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  const sortedEvents =
    [
      ...events,
    ].sort(
      (
        first,
        second,
      ) =>
        new Date(
          second.date,
        ).getTime() -
        new Date(
          first.date,
        ).getTime(),
    )

  const eventTypeOptions = Array.from(
    new Set(events.map(event => event.type)),
  ).sort()

  const normalisedQuery = searchQuery.trim().toLocaleLowerCase()
  const visibleEvents = sortedEvents.filter(event => {
    const plantNames = getPlantNames(event, plants)
    const matchesSearch =
      normalisedQuery.length === 0 ||
      [event.title, event.notes, event.productUsed, plantNames]
        .filter(Boolean)
        .some(value => value!.toLocaleLowerCase().includes(normalisedQuery))
    const matchesType = eventTypeFilter === 'all' || event.type === eventTypeFilter
    const isGardenEntry = event.plantStoryIds.length === 0
    const matchesSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'garden' && isGardenEntry) ||
      (sourceFilter === 'plants' && !isGardenEntry)

    return matchesSearch && matchesType && matchesSource
  })


  return (
    <MainPageTemplate
      activePage="journal"
      onNavigate={
      onNavigate
      }
      pageId="journal-top"
      className="journal-page"
      journeyBackLabel="Garden Record"
      onJourneyBack={() =>
      onNavigate(
      'calendar',
      )
      }
      navigationAriaLabel="Journal navigation"
      eyebrow="Sprig's notebook"
      title="Garden Journal"
      intro={
      <>
      A gathering of rain, roots,
      harvests, small victories and
      things worth remembering.
      </>
      }
      headerActions={
      <button
      type="button"
      className="journal-add-button"
      onClick={
      onAddEntry
      }
      >
      ✒️ Add an entry
      </button>
      }
    >

        <section className="collection-search-panel journal-tools" aria-label="Search and filter journal entries">
          <label className="collection-search-field journal-search-field">
            <span className="collection-search-label">Search the journal</span>
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search titles, notes, products or Plant Stories…"
            />
          </label>

          <div className="journal-filter-row">
            <label className="collection-sort-field">
              <span className="collection-search-label">Kind of entry</span>
              <select value={eventTypeFilter} onChange={event => setEventTypeFilter(event.target.value)}>
                <option value="all">All entries</option>
                {eventTypeOptions.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="collection-sort-field">
              <span className="collection-search-label">Recorded for</span>
              <select value={sourceFilter} onChange={event => setSourceFilter(event.target.value)}>
                <option value="all">Whole journal</option>
                <option value="plants">Plant Stories</option>
                <option value="garden">Wider garden</option>
              </select>
            </label>
          </div>
        </section>


        {/* =======================================
            JOURNAL ENTRIES
        ======================================= */}

        <section className="journal-list">
          {visibleEvents.length >
          0 ? (
            visibleEvents.map(
              event => {
                const isGardenEntry =
                  event.plantStoryIds.length ===
                  0


                return (
                  <article
                    key={
                      event.id
                    }
                    className="journal-entry journal-entry-clickable"
                    role="button"
                    tabIndex={
                      0
                    }
                    onClick={() =>
                      onOpenEntry(
                        event.id,
                      )
                    }
                    onKeyDown={(
                      keyboardEvent,
                    ) => {
                      if (
                        keyboardEvent.key ===
                          'Enter' ||
                        keyboardEvent.key ===
                          ' '
                      ) {
                        keyboardEvent.preventDefault()

                        onOpenEntry(
                          event.id,
                        )
                      }
                    }}
                  >
                    <div className="journal-entry-marker">
                      {getEventEmoji(
                        event.type,
                      )}
                    </div>


                    <div className="journal-entry-content">
                      <div className="journal-entry-top">
                        <div>
                          <p
                            className={
                              isGardenEntry
                                ? 'journal-entry-source garden-source'
                                : 'journal-entry-source plant-source'
                            }
                          >
                            {isGardenEntry
                              ? '🌍 From the wider garden'
                              : `🌱 From ${getPlantNames(
                                  event,
                                  plants,
                                )}`}
                          </p>


                          <time>
                            {formatDate(
                              event.date,
                            )}
                          </time>
                        </div>


                        <button
                          type="button"
                          className="journal-delete-button"
                          onClick={(
                            clickEvent,
                          ) => {
                            /*
                             * Prevent deleting a page
                             * from also opening it.
                             */
                            clickEvent.stopPropagation()


                            const confirmed =
                              window.confirm(
                                'Remove this page from the garden journal?',
                              )


                            if (
                              confirmed
                            ) {
                              onDeleteEvent(
                                event.id,
                              )
                            }
                          }}
                          aria-label={
                            `Delete ${event.title}`
                          }
                        >
                          🗑️
                        </button>
                      </div>


                      <h2>
                        {event.title}
                      </h2>


                      {event.productUsed && (
                        <p className="journal-product">
                          Garden provisions:{' '}
                          {
                            event.productUsed
                          }
                        </p>
                      )}


                      {event.notes && (
                        <p className="journal-notes">
                          {
                            event.notes
                          }
                        </p>
                      )}

                      {event.photoUrls && event.photoUrls.length > 0 && (
                        <div className="journal-entry-thumbnails" aria-label={`${event.photoUrls.length} attached photograph${event.photoUrls.length === 1 ? '' : 's'}`}>
                          {event.photoUrls.slice(0, 3).map((photoUrl, photoIndex) => (
                            <img
                              key={`${event.id}-photo-${photoIndex}`}
                              src={photoUrl}
                              alt=""
                              loading="lazy"
                            />
                          ))}
                          {event.photoUrls.length > 3 && (
                            <span>+{event.photoUrls.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                )
              },
            )
          ) : (
            <div className="journal-empty">
              <span>
                📖
              </span>

              <h2>{events.length === 0 ? 'The pages are still quiet' : 'No pages match those filters'}</h2>

              <p>
                {events.length === 0
                  ? 'Sprig has not recorded anything yet.'
                  : 'Try a different search or show the whole journal.'}
              </p>

              <button
                type="button"
                className="text-button"
                onClick={
                  onAddEntry
                }
              >
                Write the first entry
              </button>
            </div>
          )}
        </section>

      </MainPageTemplate>
  )
}


