import GardenLayout from '../components/layout/GardenLayout'

import type {
  GardenEvent,
  PlantStory,
} from '../types'

import type { AppPage } from '../types/navigation'

interface JournalProps {
  events: GardenEvent[]
  plants: PlantStory[]
  onAddEntry: () => void
  onDeleteEvent: (eventId: string) => void
  onNavigate: (page: AppPage) => void
}

function getEventEmoji(
  type: GardenEvent['type'],
): string {
  if (type === 'planted') return '🌱'
  if (type === 'sprouted') return '🌿'
  if (type === 'watered') return '💧'
  if (type === 'fed') return '🧪'
  if (type === 'moved') return '🪴'
  if (type === 'pruned') return '✂️'
  if (type === 'treated') return '🩹'
  if (type === 'weather') return '🌦️'
  if (type === 'photo') return '📷'
  if (type === 'harvest') return '🧺'
  if (type === 'observation') return '👀'

  return '📝'
}

function formatDate(date: string): string {
  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getPlantNames(
  event: GardenEvent,
  plants: PlantStory[],
): string {
  if (event.plantStoryIds.length === 0) {
    return 'The wider garden'
  }

  const matchingPlants = plants.filter((plant) =>
    event.plantStoryIds.includes(plant.id),
  )

  if (matchingPlants.length === 0) {
    return 'A plant story'
  }

  return matchingPlants
    .map((plant) => plant.displayName)
    .join(', ')
}

export default function Journal({
  events,
  plants,
  onAddEntry,
  onDeleteEvent,
  onNavigate,
}: JournalProps) {
  const sortedEvents = [...events].sort(
    (first, second) =>
      new Date(second.date).getTime() -
      new Date(first.date).getTime(),
  )

  return (
    <GardenLayout
      activePage="journal"
      onNavigate={onNavigate}
    >
      <div className="journal-page">
        <header className="journal-header">
          <div>
            <p className="section-label">
              Sprig&apos;s notebook
            </p>

            <h1>Garden Journal</h1>

            <p className="journal-intro">
              A gathering of rain, roots, harvests,
              small victories and things worth remembering.
            </p>
          </div>

          <button
            type="button"
            className="journal-add-button"
            onClick={onAddEntry}
          >
            ✒️ Add an entry
          </button>
        </header>

        <section className="journal-list">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => {
              const isGardenEntry =
                event.plantStoryIds.length === 0

              return (
                <article
                  key={event.id}
                  className="journal-entry"
                >
                  <div className="journal-entry-marker">
                    {getEventEmoji(event.type)}
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

                        <time>{formatDate(event.date)}</time>
                      </div>

                      <button
                        type="button"
                        className="journal-delete-button"
                        onClick={() => {
                          const confirmed =
                            window.confirm(
                              'Remove this page from the garden journal?',
                            )

                          if (confirmed) {
                            onDeleteEvent(event.id)
                          }
                        }}
                        aria-label={`Delete ${event.title}`}
                      >
                        🗑️
                      </button>
                    </div>

                    <h2>{event.title}</h2>

                    {event.productUsed && (
                      <p className="journal-product">
                        Garden provisions:{' '}
                        {event.productUsed}
                      </p>
                    )}

                    {event.notes && (
                      <p className="journal-notes">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </article>
              )
            })
          ) : (
            <div className="journal-empty">
              <span>📖</span>

              <h2>The pages are still quiet</h2>

              <p>
                Sprig has not recorded anything yet.
              </p>

              <button
                type="button"
                className="text-button"
                onClick={onAddEntry}
              >
                Write the first entry
              </button>
            </div>
          )}
        </section>
      </div>
    </GardenLayout>
  )
}