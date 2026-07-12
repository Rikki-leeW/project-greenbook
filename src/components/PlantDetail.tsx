import type {
    GardenEvent,
    GrowingSpace,
    PlantStory,
  } from '../types'
  
  interface PlantDetailProps {
    plant: PlantStory
    growingSpace?: GrowingSpace
    events: GardenEvent[]
    onBack: () => void
    onAddEvent: () => void
  }
  
  function formatLabel(value: string): string {
    return value
      .replaceAll('-', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }
  
  function getEventEmoji(type: GardenEvent['type']): string {
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
  
    return '📝'
  }
  
  export default function PlantDetail({
    plant,
    growingSpace,
    events,
    onBack,
    onAddEvent,
  }: PlantDetailProps) {
    const plantedDate = new Date(`${plant.plantedDate}T00:00:00`)
    const today = new Date()
  
    const daysGrowing = Math.max(
      0,
      Math.floor(
        (today.getTime() - plantedDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    )
  
    const plantEvents = [...events]
      .filter((event) =>
        event.plantStoryIds.includes(plant.id),
      )
      .sort(
        (first, second) =>
          new Date(second.date).getTime() -
          new Date(first.date).getTime(),
      )
  
    return (
      <main className="plant-story-page">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to the garden
        </button>
  
        <header className="plant-story-header">
          <p className="section-label">
            {plant.plantName} story
          </p>
  
          <h1>{plant.displayName}</h1>
  
          <p className="story-personality">
            {plant.personality ?? 'A story still unfolding'}
          </p>
  
          <div className="story-status-row">
            <span className="status-pill">
              {formatLabel(plant.status)}
            </span>
  
            <span>{daysGrowing} days growing</span>
          </div>
        </header>
  
        <section className="story-information-grid">
          <article className="story-info-card">
            <p className="section-label">The beginning</p>
  
            <h2>
              {plantedDate.toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h2>
  
            <p>
              Started as {formatLabel(plant.startMethod)}
            </p>
          </article>
  
          <article className="story-info-card">
            <p className="section-label">Growing in</p>
  
            <h2>
              {growingSpace?.name ?? 'Location not recorded'}
            </h2>
  
            <p>
              {growingSpace
                ? formatLabel(growingSpace.type)
                : 'This can be added later.'}
            </p>
          </article>
  
          <article className="story-info-card">
            <p className="section-label">Quantity</p>
  
            <h2>{plant.quantity ?? 1}</h2>
  
            <p>
              {plant.quantity === 1
                ? 'One growing story'
                : 'Growing together as one story'}
            </p>
          </article>
        </section>
  
        <section className="story-section">
          <div className="section-heading">
            <div>
              <p className="section-label">
                Garden notes
              </p>
  
              <h2>What you wanted to remember</h2>
            </div>
          </div>
  
          <div className="story-note-card">
            <p>
              {plant.notes ??
                'No notes yet. This story is waiting for its first observation.'}
            </p>
          </div>
        </section>
  
        <section className="story-section">
          <div className="section-heading">
            <div>
              <p className="section-label">Timeline</p>
              <h2>The story so far</h2>
            </div>
  
            <button
              type="button"
              className="text-button"
              onClick={onAddEvent}
            >
              + Add a moment
            </button>
          </div>
  
          <div className="timeline">
            {plantEvents.length > 0 ? (
              plantEvents.map((event) => (
                <article
                  className="timeline-entry"
                  key={event.id}
                >
                  <div className="timeline-marker">
                    {getEventEmoji(event.type)}
                  </div>
  
                  <div>
                    <time>
                      {new Date(
                        `${event.date}T00:00:00`,
                      ).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
  
                    <h3>{event.title}</h3>
  
                    {event.productUsed && (
                      <p className="event-product">
                        Used: {event.productUsed}
                      </p>
                    )}
  
                    {event.notes && <p>{event.notes}</p>}
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-story">
                <span>🌿</span>
  
                <p>
                  This story has only just opened its notebook.
                </p>
  
                <button
                  type="button"
                  className="text-button"
                  onClick={onAddEvent}
                >
                  Add its first moment
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    )
  }