import BottomNavigation from '../components/navigation/BottomNavigation'
import type { GrowingPlace } from '../types'
import type { AppPage } from '../types/navigation'

interface GardenPlacesProps {
  gardenPlaces: GrowingPlace[]
  onAddPlace: () => void
  onNavigate: (page: AppPage) => void
}

function getPlaceKindLabel(
  kind: GrowingPlace['kind'],
): string {
  const labels: Record<GrowingPlace['kind'], string> = {
    'garden-area': 'Garden area',
    'garden-bed': 'Garden bed',
    'raised-bed': 'Raised bed',
    pot: 'Pot',
    'grow-bag': 'Grow bag',
    greenhouse: 'Greenhouse',
    'compost-area': 'Compost place',
    indoor: 'Indoor growing place',
    other: 'Garden place',
  }

  return labels[kind]
}

export default function GardenPlaces({
  gardenPlaces,
  onAddPlace,
  onNavigate,
}: GardenPlacesProps) {
  return (
    <main className="garden-page">
      <header className="garden-header">
        <p className="page-kicker">
          SPRIG · GARDEN PLACES
        </p>

        <h1>Every corner has a story</h1>

        <p className="page-intro">
          Sprig keeps track of the beds, pots,
          bags and tucked-away corners where
          your garden grows.
        </p>
      </header>

      {gardenPlaces.length === 0 ? (
        <section className="empty-state">
          <div
            aria-hidden="true"
            className="empty-state-sprig"
          >
            🌱
          </div>

          <h2>Sprig hasn't mapped the garden yet</h2>

          <p>
            Begin with one familiar place.
            It might be the top deck, a greenhouse
            shelf, a favourite pot or a whole garden bed.
          </p>

          <button
            type="button"
            className="enter-button"
            onClick={onAddPlace}
          >
            🌿 Name a garden place
          </button>

          <p className="form-whisper">
            Once named, Sprig can remember what
            grows, happens and unfolds there.
          </p>
        </section>
      ) : (
        <section
          className="garden-places-list"
          aria-label="Saved garden places"
        >
          {gardenPlaces.map((place) => (
            <article
              className="garden-place-entry"
              key={place.id}
            >
              <div>
                <p className="garden-place-kind">
                  {getPlaceKindLabel(place.kind)}
                </p>

                <h2>{place.name}</h2>

                {place.notes && (
                  <p>{place.notes}</p>
                )}
              </div>

              <button
                type="button"
                className="secondary-button"
                aria-label={`Open ${place.name}`}
              >
                Open place →
              </button>
            </article>
          ))}

          <button
            type="button"
            className="enter-button"
            onClick={onAddPlace}
          >
            🌱 Name another garden place
          </button>
        </section>
      )}

      <BottomNavigation
        activePage="gate"
        onNavigate={onNavigate}
      />
    </main>
  )
}