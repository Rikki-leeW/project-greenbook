
import MainPageTemplate from '../components/templates/MainPageTemplate'
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
    <MainPageTemplate
      activePage="library"
      onNavigate={
      onNavigate
      }
      pageId="library-top"
      className="library-page"
      journeyBackLabel="Garden of Mine"
      onJourneyBack={() =>
      onNavigate(
      'plants',
      )
      }
      navigationAriaLabel="Garden Library navigation"
      eyebrow="Garden Stores"
      title="Garden Library"
      intro={
      <>
      The useful things the garden
      keeps close at hand, from
      ingredients and products to
      the records that support them.
      </>
      }
      headerActions={
      onAddNote ? (
      <button
      type="button"
      className="journal-add-button"
      onClick={
      onAddNote
      }
      >
      + Add a note
      </button>
      ) : undefined
      }
    >


        <section className="library-section">
          <div className="section-heading">
            <div>
              <p className="section-label">
                Growing materials
              </p>

              <h2>
                What the garden keeps on its shelves
              </h2>
            </div>
          </div>


          <section className="library-grid">
            <article className="library-book">
              <div className="library-book-icon">
                🌿
              </div>

              <p className="section-label">
                Ingredients
              </p>

              <h2>
                Ingredients
              </h2>

              <p>
                Compost, manure, minerals,
                amendments and other reusable
                things that become part of the
                garden.
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


            <article className="library-book">
              <div className="library-book-icon">
                🛒
              </div>

              <p className="section-label">
                Products
              </p>

              <h2>
                Products
              </h2>

              <p>
                Bought garden products,
                remembered with their makers,
                purpose and history.
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


        <section className="library-section">
          <div className="section-heading">
            <div>
              <p className="section-label">
                Garden Stores
              </p>

              <h2>
                Purchases and supplies
              </h2>
            </div>
          </div>


          <section className="library-grid">
            <article className="library-book">
              <div className="library-book-icon">
                🧾
              </div>

              <p className="section-label">
                Purchases
              </p>

              <h2>
                Purchases
              </h2>

              <p>
                What came into the garden,
                where it came from and what
                it cost.
              </p>

              <span className="library-coming-soon">
                The receipts are being tucked together
              </span>
            </article>


            <article className="library-book">
              <div className="library-book-icon">
                📦
              </div>

              <p className="section-label">
                Supplies
              </p>

              <h2>
                Supplies
              </h2>

              <p>
                The useful stock the garden
                has on hand.
              </p>

              <span className="library-coming-soon">
                The shelves are being counted
              </span>
            </article>


            <article className="library-book">
              <div className="library-book-icon">
                🏡
              </div>

              <p className="section-label">
                Suppliers
              </p>

              <h2>
                Suppliers
              </h2>

              <p>
                Nurseries, shops and other
                places that have supplied
                the garden.
              </p>

              <span className="library-coming-soon">
                The addresses are being gathered
              </span>
            </article>


            <article className="library-book">
              <div className="library-book-icon">
                🪙
              </div>

              <p className="section-label">
                Costs
              </p>

              <h2>
                Costs & Allocations
              </h2>

              <p>
                Where garden spending belongs
                and what it helped grow.
              </p>

              <span className="library-coming-soon">
                The receipts are being tucked together
              </span>
            </article>
          </section>
        </section>

      </MainPageTemplate>
  )
}


