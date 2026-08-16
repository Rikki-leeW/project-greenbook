import {
    useMemo,
    useState,
  } from 'react'
  
  import GardenLayout from '../components/layout/GardenLayout'
  
  import type {
    AppPage,
  } from '../types/navigation'
  
  import type {
    GardenProduct,
    GardenProductCategory,
  } from '../types'
  
  
  interface ProductsProps {
    products: GardenProduct[]
  
    onOpenProduct: (
      productId: string,
    ) => void
  
    onAddProduct: () => void
  
    onShowArchived?: () => void
  
    onNavigate: (
      page: AppPage,
    ) => void
  }
  
  
  function getProductCategoryLabel(
    product: GardenProduct,
  ): string {
    if (
      product.category === 'other' &&
      product.customCategoryLabel
    ) {
      return product.customCategoryLabel
    }
  
    const category:
      GardenProductCategory | undefined =
        product.category
  
    switch (category) {
      case 'fertiliser':
        return 'Fertiliser'
  
      case 'soil-conditioner':
        return 'Soil Conditioner'
  
      case 'wetting-agent':
        return 'Wetting Agent'
  
      case 'pest-treatment':
        return 'Pest Treatment'
  
      case 'disease-treatment':
        return 'Disease Treatment'
  
      case 'weed-treatment':
        return 'Weed Treatment'
  
      case 'biological-treatment':
        return 'Biological Treatment'
  
      case 'root-treatment':
        return 'Root Treatment'
  
      case 'plant-tonic':
        return 'Plant Tonic'
  
      case 'growing-medium':
        return 'Growing Medium'
  
      case 'mulch':
        return 'Mulch'
  
      case 'seed-treatment':
        return 'Seed Treatment'
  
      case 'cleaning-product':
        return 'Cleaning Product'
  
      case 'other':
        return 'Other'
  
      default:
        return 'Garden Product'
    }
  }
  
  
  function getProductIcon(
    product: GardenProduct,
  ): string {
    switch (product.category) {
      case 'fertiliser':
        return '🌱'
  
      case 'soil-conditioner':
        return '🍂'
  
      case 'wetting-agent':
        return '💧'
  
      case 'pest-treatment':
        return '🐛'
  
      case 'disease-treatment':
        return '🩹'
  
      case 'weed-treatment':
        return '🌿'
  
      case 'biological-treatment':
        return '🦠'
  
      case 'root-treatment':
        return '🌱'
  
      case 'plant-tonic':
        return '🌿'
  
      case 'growing-medium':
        return '🪴'
  
      case 'mulch':
        return '🍁'
  
      case 'seed-treatment':
        return '🌰'
  
      case 'cleaning-product':
        return '🧽'
  
      case 'other':
        return '🛒'
  
      default:
        return '🛒'
    }
  }
  
  
  function formatProductDate(
    date?: string,
  ): string {
    if (!date) {
      return ''
    }
  
    const safeDate =
      date.slice(
        0,
        10,
      )
  
    const parsed =
      new Date(
        `${safeDate}T00:00:00`,
      )
  
    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return date
    }
  
    return parsed.toLocaleDateString(
      'en-AU',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    )
  }
  
  
  export default function Products({
    products,
    onOpenProduct,
    onAddProduct,
    onShowArchived,
    onNavigate,
  }: ProductsProps) {
    const [
      searchTerm,
      setSearchTerm,
    ] = useState('')
  
  
    /*
     * The main Products shelf contains
     * active records only.
     *
     * Archived Products remain safely in
     * Sprig's history and will have their
     * own shelf.
     */
    const activeProducts =
      useMemo(
        () =>
          products.filter(
            (product) =>
              !product.isArchived,
          ),
        [products],
      )
  
  
    const archivedCount =
      useMemo(
        () =>
          products.filter(
            (product) =>
              product.isArchived,
          ).length,
        [products],
      )
  
  
    const filteredProducts =
      useMemo(() => {
        const query =
          searchTerm
            .trim()
            .toLowerCase()
  
        if (!query) {
          return activeProducts
        }
  
        return activeProducts.filter(
          (product) => {
            const searchableText = [
              product.name,
              getProductCategoryLabel(
                product,
              ),
              product.brand,
              product.productName,
              product.notes,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
  
            return searchableText.includes(
              query,
            )
          },
        )
      }, [
        activeProducts,
        searchTerm,
      ])
  
  
    /*
     * Garden favourites rise to the top,
     * followed by the gardener's rating.
     *
     * Otherwise the shelf retains the
     * existing record order.
     */
    const sortedProducts =
      useMemo(
        () =>
          filteredProducts
            .map(
              (
                product,
                index,
              ) => ({
                product,
                index,
              }),
            )
            .sort(
              (a, b) => {
                const favouriteDifference =
                  Number(
                    Boolean(
                      b.product.isFavourite,
                    ),
                  ) -
                  Number(
                    Boolean(
                      a.product.isFavourite,
                    ),
                  )
  
                if (
                  favouriteDifference !==
                  0
                ) {
                  return favouriteDifference
                }
  
                const ratingDifference =
                  (b.product.rating ?? 0) -
                  (a.product.rating ?? 0)
  
                if (
                  ratingDifference !== 0
                ) {
                  return ratingDifference
                }
  
                return a.index - b.index
              },
            )
            .map(
              ({ product }) =>
                product,
            ),
        [filteredProducts],
      )
  
  
    return (
      <GardenLayout
        activePage="library"
        onNavigate={onNavigate}
      >
        <div className="journal-page">
  
          {/* =======================================
              HEADER
          ======================================= */}
  
          <header className="journal-header">
            <div>
              <p className="section-label">
                Garden Library
              </p>
  
              <h1>
                Products
              </h1>
  
              <p className="journal-intro">
                The bought products your
                garden uses, remembered with
                their makers, purpose and
                history.
              </p>
            </div>
  
            <button
              type="button"
              className="journal-add-button"
              onClick={onAddProduct}
            >
              + New Product
            </button>
          </header>
  
  
          {/* =======================================
              SEARCH
          ======================================= */}
  
          <section className="sprig-form-section">
            <label>
              Search Products
  
              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
                  )
                }
                placeholder="PowerFeed, Seasol, fertiliser..."
              />
            </label>
          </section>
  
  
          {/* =======================================
              ARCHIVE
          ======================================= */}
  
          {onShowArchived && (
            <div className="library-archive-link">
              <button
                type="button"
                className="journal-add-button"
                onClick={onShowArchived}
              >
                Archived Products
                {archivedCount > 0
                  ? ` (${archivedCount})`
                  : ''}
              </button>
            </div>
          )}
  
  
          {/* =======================================
              PRODUCT INDEX
          ======================================= */}
  
          <section className="library-grid">
  
            {sortedProducts.length ===
              0 && (
              <article className="library-book">
                <div className="library-book-icon">
                  🛒
                </div>
  
                <p className="section-label">
                  Products
                </p>
  
                <h2>
                  {activeProducts.length ===
                  0
                    ? 'A fresh shelf'
                    : 'Nothing found'}
                </h2>
  
                <p>
                  {activeProducts.length ===
                  0
                    ? 'Your garden products will gather here as you add them.'
                    : `Sprig couldn't find a Product matching "${searchTerm}".`}
                </p>
  
                {activeProducts.length ===
                  0 && (
                  <button
                    type="button"
                    className="journal-add-button"
                    onClick={
                      onAddProduct
                    }
                  >
                    Add your first Product
                  </button>
                )}
              </article>
            )}
  
  
            {sortedProducts.map(
              (product) => (
                <article
                  key={product.id}
                  className="library-book"
                >
                  <div className="library-book-icon">
                    {getProductIcon(
                      product,
                    )}
                  </div>
  
                  {product.isFavourite && (
                    <p className="section-label">
                      ★ Garden Favourite
                    </p>
                  )}
  
                  <p className="section-label">
                    {getProductCategoryLabel(
                      product,
                    )}
                  </p>
  
                  <h2>
                    {product.name}
                  </h2>
  
                  {typeof product.rating ===
                    'number' && (
                    <p
                      aria-label={`${product.rating} out of 5 stars`}
                    >
                      {'★'.repeat(
                        product.rating,
                      )}
                      {'☆'.repeat(
                        5 -
                          product.rating,
                      )}
                    </p>
                  )}
  
                  {product.brand && (
                    <p>
                      {product.brand}
                    </p>
                  )}
  
                  {product.productName &&
                    product.productName !==
                      product.name && (
                      <p>
                        {
                          product.productName
                        }
                      </p>
                    )}
  
                  {product.notes && (
                    <p>
                      {product.notes}
                    </p>
                  )}
  
                  <p className="library-coming-soon">
                    Added{' '}
                    {formatProductDate(
                      product.createdAt,
                    )}
                  </p>
  
                  <button
                    type="button"
                    className="journal-add-button"
                    onClick={() =>
                      onOpenProduct(
                        product.id,
                      )
                    }
                  >
                    Open Product
                  </button>
                </article>
              ),
            )}
  
          </section>
        </div>
      </GardenLayout>
    )
  }