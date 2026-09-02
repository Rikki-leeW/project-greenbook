import GardenLayout from '../components/layout/GardenLayout'

import type {
  AppPage,
} from '../types/navigation'


interface LibraryProps {
  onAddNote?: () => void

  /*
   * Retained for compatibility with
   * AppLibrary while the Growing destination
   * is being consolidated.
   *
   * Garden Library no longer presents
   * "What the Garden Grows In" as one of its
   * own shelves.
   */
  onOpenGrowingRecipes: () => void

  onOpenIngredients: () => void

  onOpenProducts: () => void

  onNavigate: (
    page: AppPage,
  ) => void
}


export default function Library({
  onAddNote,
  onOpenGrowingRecipes,
  onOpenIngredients,
  onOpenProducts,
  onNavigate,
}: LibraryProps) {

  /*
   * Growing records now belong under the
   * first-class Growing destination.
   *
   * Keep this callback in the component
   * contract until AppLibrary is consolidated
   * in the next navigation pass.
   */
  void onOpenGrowingRecipes


  return (
    <GardenLayout
      activePage="library"
      onNavigate={onNavigate}
    >
      <div className="journal-page">

        {/* =======================================
            LIBRARY HEADER
        ======================================= */}

        <header className="journal-header">
          <div>
            <p className="section-label">
              Sprig&apos;s bookshelf
            </p>

            <h1>
              Garden Library
            </h1>

            <p className="journal-intro">
              Reusable garden things,
              references and records that can
              be linked into stories throughout
              Sprig.
            </p>

            <p className="form-whisper">
              Growing Places and what plants
              grow in now have their own home
              under Growing.
            </p>
          </div>


          {onAddNote && (
            <button
              type="button"
              className="journal-add-button"
              onClick={onAddNote}
            >
              ✒️ Add a note
            </button>
          )}
        </header>


        {/* =======================================
            GROWING DOORWAY
        ======================================= */}

        <section className="story-section">

          <div className="section-heading">
            <div>
              <p className="section-label">
                Looking for growing records?
              </p>

              <h2>
                Growing has its own home
              </h2>

              <p>
                Growing Places, My Recipes,
                Bought Mixes, Growing Systems
                and Ground Types now live
                together under Growing.
              </p>
            </div>
          </div>


          <article className="library-book">
            <div className="library-book-icon">
              🪴
            </div>

            <p className="section-label">
              Growing
            </p>

            <h2>
              Where it grows and what it grows in
            </h2>

            <p>
              Open Growing to see locations and
              growing setups together without
              mixing their meanings.
            </p>

            <button
              type="button"
              className="journal-add-button"
              onClick={() =>
                onNavigate(
                  'growing-places',
                )
              }
            >
              Open Growing
            </button>
          </article>
        </section>


        {/* =======================================
            REUSABLE LIBRARY RECORDS
        ======================================= */}

        <section className="story-section">

          <div className="section-heading">
            <div>
              <p className="section-label">
                Reusable records
              </p>

              <h2>
                Garden building blocks
              </h2>

              <p>
                These are things Sprig can
                remember once and link wherever
                they are used.
              </p>
            </div>
          </div>


          <section className="library-grid">

            {/* =======================================
                INGREDIENTS
            ======================================= */}

            <article className="library-book">
              <div className="library-book-icon">
                🌿
              </div>

              <p className="section-label">
                Ingredients
              </p>

              <h2>
                The building blocks
              </h2>

              <p>
                Compost, manure, perlite, coir,
                amendments and other materials
                that can become part of a
                growing recipe.
              </p>

              <button
                type="button"
                className="journal-add-button"
                onClick={
                  onOpenIngredients
                }
              >
                Open Ingredients
              </button>
            </article>


            {/* =======================================
                PRODUCTS
            ======================================= */}

            <article className="library-book">
              <div className="library-book-icon">
                🛒
              </div>

              <p className="section-label">
                Products
              </p>

              <h2>
                Bought for the garden
              </h2>

              <p>
                Commercial fertilisers,
                treatments, amendments and
                other products remembered with
                their brands and purchase
                history.
              </p>

              <button
                type="button"
                className="journal-add-button"
                onClick={
                  onOpenProducts
                }
              >
                Open Products
              </button>
            </article>

          </section>
        </section>


        {/* =======================================
            FUTURE LIBRARY SHELVES
        ======================================= */}

        <section className="story-section">

          <div className="section-heading">
            <div>
              <p className="section-label">
                Shelves still growing
              </p>

              <h2>
                More reusable garden memory
              </h2>
            </div>
          </div>


          <section className="library-grid">

            {/* =======================================
                VARIETIES
            ======================================= */}

            <article className="library-book">
              <div className="library-book-icon">
                🌾
              </div>

              <p className="section-label">
                Varieties
              </p>

              <h2>
                Names worth remembering
              </h2>

              <p>
                Reusable variety information
                connected to Plant Reference
                and individual Plant Stories.
              </p>

              <span className="library-coming-soon">
                The seed labels are being gathered
              </span>
            </article>


            {/* =======================================
                SUPPLIERS
            ======================================= */}

            <article className="library-book">
              <div className="library-book-icon">
                🏪
              </div>

              <p className="section-label">
                Suppliers
              </p>

              <h2>
                Where things came from
              </h2>

              <p>
                Nurseries, garden centres,
                local growers, hardware stores
                and other sources worth
                remembering.
              </p>

              <span className="library-coming-soon">
                A little address book is coming
              </span>
            </article>


            {/* =======================================
                SEED COLLECTION
            ======================================= */}

            <article className="library-book">
              <div className="library-book-icon">
                🌰
              </div>

              <p className="section-label">
                Seed Collection
              </p>

              <h2>
                What is waiting to grow
              </h2>

              <p>
                Bought seed, saved seed,
                packets, sources, varieties
                and what remains ready for
                another planting.
              </p>

              <span className="library-coming-soon">
                The seed drawer is still being sorted
              </span>
            </article>


            {/* =======================================
                PURCHASES
            ======================================= */}

            <article className="library-book">
              <div className="library-book-icon">
                🧾
              </div>

              <p className="section-label">
                Purchases
              </p>

              <h2>
                What came into the garden
              </h2>

              <p>
                Purchase history, suppliers,
                quantities and changing prices
                across the garden.
              </p>

              <span className="library-coming-soon">
                The receipts are being tucked together
              </span>
            </article>

          </section>
        </section>

      </div>
    </GardenLayout>
  )
}