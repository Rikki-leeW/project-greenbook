import GardenLayout from '../components/layout/GardenLayout'

import type {
  GrowingPlace,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface GardenPlacesProps {
  gardenPlaces: GrowingPlace[]

  onAddPlace: () => void

  onOpenPlace: (
    growingPlaceId: string,
  ) => void

  onNavigate: (
    page: AppPage,
  ) => void
}


/* =======================================
   GROWING PLACE KIND LABEL
======================================= */

function getPlaceKindLabel(
  kind: GrowingPlace['kind'],
): string {
  const labels:
    Record<
      GrowingPlace['kind'],
      string
    > = {
      'garden-area':
        'Garden area',

      'garden-bed':
        'Garden bed',

      'raised-bed':
        'Raised bed',

      pot:
        'Pot',

      'grow-bag':
        'Grow bag',

      'planter-box':
        'Planter box',

      greenhouse:
        'Greenhouse',

      'cold-frame':
        'Cold frame',

      'shade-house':
        'Shade house',

      deck:
        'Deck',

      patio:
        'Patio',

      balcony:
        'Balcony',

      courtyard:
        'Courtyard',

      'grass-area':
        'Grass area',

      'retaining-wall':
        'Retaining wall',

      'rock-wall':
        'Rock wall',

      orchard:
        'Orchard',

      'food-forest':
        'Food forest',

      'herb-garden':
        'Herb garden',

      'flower-garden':
        'Flower garden',

      vine:
        'Vine',

      'compost-area':
        'Compost place',

      'nursery-area':
        'Nursery area',

      indoor:
        'Indoor growing place',

      windowsill:
        'Windowsill',

      other:
        'Garden place',
    }


  return labels[
    kind
  ]
}


/* =======================================
   GROWING PLACES
======================================= */

export default function GardenPlaces({
  gardenPlaces,
  onAddPlace,
  onOpenPlace,
  onNavigate,
}: GardenPlacesProps) {

  return (
    <GardenLayout
      activePage="growing-places"
      onNavigate={
        onNavigate
      }
    >
      <main className="garden-page">

        {/* =======================================
            HEADER
        ======================================= */}

        <header className="garden-header">

          <p className="page-kicker">
            SPRIG · GARDEN PLACES
          </p>


          <h1>
            Every corner has a story
          </h1>


          <p className="page-intro">
            Sprig keeps track of the beds,
            pots, bags and tucked-away
            corners where your garden grows.
          </p>

        </header>


        {/* =======================================
            EMPTY STATE
        ======================================= */}

        {gardenPlaces.length ===
        0 ? (
          <section className="empty-state">

            <div
              aria-hidden="true"
              className="empty-state-sprig"
            >
              🌱
            </div>


            <h2>
              Sprig hasn&apos;t mapped
              the garden yet
            </h2>


            <p>
              Begin with one familiar
              place. It might be the top
              deck, a greenhouse shelf, a
              favourite pot or a whole
              garden bed.
            </p>


            <button
              type="button"
              className="enter-button"
              onClick={
                onAddPlace
              }
            >
              🌿 Name a garden place
            </button>


            <p className="form-whisper">
              Once named, Sprig can
              remember what grows, happens
              and unfolds there.
            </p>

          </section>
        ) : (

          /* =======================================
             SAVED GROWING PLACES
          ======================================= */

          <section
            className="garden-places-list"
            aria-label="Saved garden places"
          >

            {gardenPlaces.map(
              (
                place,
              ) => (
                <article
                  className="garden-place-entry"
                  key={
                    place.id
                  }
                >

                  <div>

                    <p className="garden-place-kind">
                      {place.kind ===
                        'other' &&
                      place.customKindLabel
                        ? place.customKindLabel
                        : getPlaceKindLabel(
                            place.kind,
                          )}
                    </p>


                    <h2>
                      {place.name}
                    </h2>


                    {place.notes && (
                      <p>
                        {place.notes}
                      </p>
                    )}

                  </div>


                  <button
                    type="button"
                    className="secondary-button"
                    aria-label={`Open ${place.name}`}
                    onClick={() =>
                      onOpenPlace(
                        place.id,
                      )
                    }
                  >
                    Open place →
                  </button>

                </article>
              ),
            )}


            <button
              type="button"
              className="enter-button"
              onClick={
                onAddPlace
              }
            >
              🌱 Name another garden place
            </button>

          </section>
        )}

      </main>
    </GardenLayout>
  )
}