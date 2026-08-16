import GardenLayout from '../components/layout/GardenLayout'
import type { AppPage } from '../types/navigation'


interface LibraryProps {
  onAddNote?: () => void

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
              A quiet collection of the things
              your garden teaches, uses and
              remembers across the seasons.
            </p>

            <p className="form-whisper">
              🌿 Everything the garden remembers
              eventually finds its place on these
              shelves.
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
            LIBRARY SHELVES
        ======================================= */}

        <section className="library-grid">

          {/* =======================================
              GROWING RECIPES
          ======================================= */}

          <article className="library-book">
            <div className="library-book-icon">
              🌱
            </div>

            <p className="section-label">
              Growing Recipes
            </p>

            <h2>
              What the garden grows in
            </h2>

            <p>
              Keep the recipes, bought mixes,
              native ground and growing systems
              your plants return to across the
              garden.
            </p>

            <button
              type="button"
              className="journal-add-button"
              onClick={
                onOpenGrowingRecipes
              }
            >
              Open Growing Recipes
            </button>
          </article>


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
              amendments, fertilisers and the
              other materials that become part
              of your garden.
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
              Commercial mixes, fertilisers,
              treatments and other products,
              remembered with their brands,
              makers and history.
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
              Royal Blue, Mortgage Lifter,
              Black Russian and every variety
              that earns a place in your
              garden&apos;s history.
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
              Nurseries, garden centres, local
              growers, hardware stores and the
              people or places you return to.
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
              Bought seed, saved seed, packets,
              sources, varieties and what remains
              ready for another planting.
            </p>

            <span className="library-coming-soon">
              The seed drawer is still being sorted
            </span>
          </article>


          {/* =======================================
              GARDEN TRIALS
          ======================================= */}

          <article className="library-book">
            <div className="library-book-icon">
              🧪
            </div>

            <p className="section-label">
              Garden Trials
            </p>

            <h2>
              Ideas worth testing
            </h2>

            <p>
              Compare recipes, growing methods,
              locations and other ideas, then
              remember what worked and what
              quietly didn&apos;t take.
            </p>

            <span className="library-coming-soon">
              The experiment pages are waiting
            </span>
          </article>


          {/* =======================================
              GARDEN GUIDES
          ======================================= */}

          <article className="library-book">
            <div className="library-book-icon">
              📚
            </div>

            <p className="section-label">
              Garden Guides
            </p>

            <h2>
              Growing wisdom
            </h2>

            <p>
              Planting notes, seasonal guidance,
              useful references and the knowledge
              you want close at hand.
            </p>

            <span className="library-coming-soon">
              A shelf still being written
            </span>
          </article>


          {/* =======================================
              KEEPER'S NOTES
          ======================================= */}

          <article className="library-book">
            <div className="library-book-icon">
              📝
            </div>

            <p className="section-label">
              Keeper&apos;s Notes
            </p>

            <h2>
              Lessons from the garden
            </h2>

            <p>
              The discoveries, failures, patterns
              and clever little fixes that deserve
              to survive into another season.
            </p>

            <span className="library-coming-soon">
              Plenty of blank pages remain
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
              What the garden cost
            </h2>

            <p>
              Keep purchase history, suppliers,
              changing prices and quantities so
              Sprig can eventually understand the
              true cost of growing.
            </p>

            <span className="library-coming-soon">
              Accountant Sprig has sharpened a pencil
            </span>
          </article>

        </section>
      </div>
    </GardenLayout>
  )
}