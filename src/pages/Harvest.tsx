import GardenLayout from '../components/layout/GardenLayout'

import type {
  GardenEvent,
  PlantStory,
} from '../types'

import type { AppPage } from '../types/navigation'

interface HarvestProps {
  events: GardenEvent[]
  plants: PlantStory[]
  onRecordHarvest: () => void
  onDeleteEvent: (eventId: string) => void
  onNavigate: (page: AppPage) => void
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
  const matchingPlants = plants.filter((plant) =>
    event.plantStoryIds.includes(plant.id),
  )

  if (matchingPlants.length === 0) {
    return 'The wider garden'
  }

  return matchingPlants
    .map((plant) => plant.displayName)
    .join(', ')
}

export default function Harvest({
  events,
  plants,
  onRecordHarvest,
  onDeleteEvent,
  onNavigate,
}: HarvestProps) {
  const harvestEvents = [...events]
    .filter((event) => event.type === 'harvest')
    .sort(
      (first, second) =>
        new Date(second.date).getTime() -
        new Date(first.date).getTime(),
    )

  return (
    <GardenLayout
      activePage="harvest"
      onNavigate={onNavigate}
    >
      <div className="journal-page">
        <header className="journal-header">
          <div>
            <p className="section-label">
              Sprig&apos;s harvest ledger
            </p>

            <h1>Harvest</h1>

            <p className="journal-intro">
              The baskets, surprises and small triumphs
              gathered from the garden.
            </p>
          </div>

          <button
            type="button"
            className="journal-add-button"
            onClick={onRecordHarvest}
          >
            🧺 Record a harvest
          </button>
        </header>

        <section className="journal-list">
          {harvestEvents.length > 0 ? (
            harvestEvents.map((event) => (
              <article
                key={event.id}
                className="journal-entry"
              >
                <div className="journal-entry-marker">
                  🧺
                </div>

                <div className="journal-entry-content">
                  <div className="journal-entry-top">
                    <div>
                      <p className="journal-entry-source plant-source">
                        🌱 {getPlantNames(event, plants)}
                      </p>

                      <time>{formatDate(event.date)}</time>
                    </div>

                    <button
                      type="button"
                      className="journal-delete-button"
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            'Remove this harvest from the ledger?',
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
                      Harvest detail: {event.productUsed}
                    </p>
                  )}

                  {event.notes && (
                    <p className="journal-notes">
                      {event.notes}
                    </p>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="journal-empty">
              <span>🧺</span>

              <h2>The baskets are still empty</h2>

              <p>
                Sprig has not recorded a harvest yet.
              </p>

              <button
                type="button"
                className="text-button"
                onClick={onRecordHarvest}
              >
                Record the first harvest
              </button>
            </div>
          )}
        </section>
      </div>
    </GardenLayout>
  )
}