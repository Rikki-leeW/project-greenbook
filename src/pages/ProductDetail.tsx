import GardenLayout from '../components/layout/GardenLayout'
import RecordActions from '../components/common/RecordActions'
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery'

import type {
  GardenProduct,
  GardenProductCategory,
  PurchaseRecord,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface ProductDetailProps {
  product: GardenProduct

  purchases: PurchaseRecord[]

  onBack: () => void

  onEdit?: () => void

  onToggleFavourite?: () => void

  onSetRating?: (
    rating: number,
  ) => void

  onArchive?: () => void

  onRestore?: () => void

  onDelete?: () => void

  onAddPurchase?: () => void
  
  onEditPurchase?: (
    purchase: PurchaseRecord,
  ) => void
  
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
    GardenProductCategory =
    product.category ?? 'other'

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


function formatDate(
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
      month: 'long',
      year: 'numeric',
    },
  )
}


function formatMoney(
  value: number,
  currency = 'AUD',
): string {
  try {
    return new Intl.NumberFormat(
      'en-AU',
      {
        style: 'currency',
        currency,
      },
    ).format(
      value,
    )
  } catch {
    return `$${value.toFixed(2)}`
  }
}


function formatPurchaseQuantity(
  purchase: PurchaseRecord,
): string | undefined {
  if (
    purchase.quantity ===
    undefined
  ) {
    return undefined
  }

  const unit =
    purchase.unit
      ? ` ${purchase.unit}`
      : ''

  return `${purchase.quantity}${unit}`
}


function formatPackageSize(
  purchase: PurchaseRecord,
): string | undefined {
  if (
    purchase.packageSize ===
    undefined
  ) {
    return undefined
  }

  const unit =
    purchase.packageUnit
      ? ` ${purchase.packageUnit}`
      : ''

  return `${purchase.packageSize}${unit}`
}


export default function ProductDetail({
  product,
  purchases,
  onBack,
  onEdit,
  onToggleFavourite,
  onSetRating,
  onArchive,
  onRestore,
  onDelete,
  onAddPurchase,
  onEditPurchase,
  onNavigate,
}: ProductDetailProps) {
  const productPurchases =
    purchases
      .filter(
        (purchase) =>
          purchase.itemType ===
            'product' &&
          purchase.itemId ===
            product.id,
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.date.localeCompare(
            first.date,
          ),
      )


  return (
    <GardenLayout
      activePage="library"
      onNavigate={
        onNavigate
      }
    >
      <div className="journal-page">

        {/* =======================================
            HEADER
        ======================================= */}

        <header className="journal-header">
          <div>
            <p className="section-label">
              Garden Product
            </p>

            <h1>
              {product.name}
            </h1>

            <p className="journal-intro">
              {getProductCategoryLabel(
                product,
              )}
            </p>

            {product.isArchived && (
              <p className="form-whisper">
                This Product is resting
                safely in Sprig&apos;s
                archive.
              </p>
            )}
          </div>
        </header>


        {/* =======================================
            RECORD ACTIONS
        ======================================= */}

        <RecordActions
          backLabel="Back to Products"

          editLabel="Edit Product"

          onBack={
            onBack
          }

          onEdit={
            onEdit
          }
        />


        {/* =======================================
            FAVOURITE + RATING
        ======================================= */}

        <section className="library-grid">
          <article className="library-book">
            <p className="section-label">
              Your experience
            </p>

            <h2>
              What you think of it
            </h2>

            <button
              type="button"
              className={
                product.isFavourite
                  ? 'sprig-selection-card selected'
                  : 'sprig-selection-card'
              }
              onClick={
                onToggleFavourite
              }
              disabled={
                !onToggleFavourite
              }
              aria-pressed={
                Boolean(
                  product.isFavourite,
                )
              }
            >
              {product.isFavourite
                ? '★ Garden favourite'
                : '☆ Mark as a favourite'}
            </button>

            <div
              className="sprig-rating"
              aria-label="Product rating"
            >
              {[
                1,
                2,
                3,
                4,
                5,
              ].map(
                (
                  value,
                ) => (
                  <button
                    key={
                      value
                    }
                    type="button"
                    className="sprig-rating-button"
                    onClick={() =>
                      onSetRating?.(
                        value,
                      )
                    }
                    disabled={
                      !onSetRating
                    }
                    aria-label={`Rate ${value} out of 5`}
                  >
                    {product.rating &&
                    value <=
                      product.rating
                      ? '★'
                      : '☆'}
                  </button>
                ),
              )}
            </div>

            <p className="form-whisper">
              {product.rating
                ? `${product.rating} out of 5`
                : 'Not rated yet.'}
            </p>
          </article>


          {/* =======================================
              PRODUCT DETAILS
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              Product details
            </p>

            <h2>
              {product.name}
            </h2>

            <p>
              <strong>
                Category:
              </strong>{' '}
              {getProductCategoryLabel(
                product,
              )}
            </p>

            {product.brand && (
              <p>
                <strong>
                  Brand:
                </strong>{' '}
                {product.brand}
              </p>
            )}

            {product.productName && (
              <p>
                <strong>
                  Product name:
                </strong>{' '}
                {product.productName}
              </p>
            )}

            <p>
              <strong>
                Added:
              </strong>{' '}
              {formatDate(
                product.createdAt,
              )}
            </p>

            {product.updatedAt && (
              <p>
                <strong>
                  Last updated:
                </strong>{' '}
                {formatDate(
                  product.updatedAt,
                )}
              </p>
            )}
          </article>


          {/* =======================================
              NOTES
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              Notes
            </p>

            <h2>
              What Sprig remembers
            </h2>

            {product.notes ? (
              <p>
                {product.notes}
              </p>
            ) : (
              <p>
                No notes have been
                tucked into this Product
                yet.
              </p>
            )}
          </article>


         {/* =======================================
    PHOTOGRAPHS
======================================= */}

<article className="library-book">
  <p className="section-label">
    Photographs
  </p>

  <SprigPhotoGallery
    photoUrls={
      product.photoUrls ??
      []
    }
    title="Product photographs"
    emptyMessage="No photographs have been tucked into this Product yet."
    photoAltPrefix={`${product.name} photograph`}
  />
</article>


          {/* =======================================
    PURCHASE HISTORY
======================================= */}

<article className="library-book">
  <p className="section-label">
    Purchase history
  </p>

  <h2>
    What it has cost
  </h2>

  {productPurchases.length > 0 ? (
    <>
      <p>
        Sprig remembers{' '}
        {productPurchases.length}{' '}
        {productPurchases.length === 1
          ? 'purchase'
          : 'purchases'}{' '}
        for this Product.
      </p>

      <ul>
        {productPurchases.map(
          (purchase) => {
            const quantity =
              formatPurchaseQuantity(
                purchase,
              )

            const packageSize =
              formatPackageSize(
                purchase,
              )

            return (
              <li
                key={
                  purchase.id
                }
              >
                <div>
                  <strong>
                    {formatMoney(
                      purchase.pricePaid,
                      purchase.currency ??
                        'AUD',
                    )}
                  </strong>

                  {' · '}

                  {formatDate(
                    purchase.date,
                  )}

                  {purchase.supplier
                    ? ` · ${purchase.supplier}`
                    : ''}

                  {quantity
                    ? ` · ${quantity}`
                    : ''}

                  {packageSize
                    ? ` · ${packageSize} package`
                    : ''}

                  {purchase.notes
                    ? ` · ${purchase.notes}`
                    : ''}
                </div>

                {onEditPurchase && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      onEditPurchase(
                        purchase,
                      )
                    }
                  >
                    ✏️ Edit purchase
                  </button>
                )}
              </li>
            )
          },
        )}
      </ul>
    </>
  ) : (
    <p>
      No purchase history has
      been recorded for this
      Product yet.
    </p>
  )}

  {onAddPurchase && (
    <button
      type="button"
      className="journal-add-button"
      onClick={
        onAddPurchase
      }
    >
      + Add another purchase
    </button>
  )}

  <p className="form-whisper">
    Each purchase stays separate
    so Sprig can remember changing
    prices, suppliers and package
    sizes over time.
  </p>
</article>

          {/* =======================================
              LIFECYCLE
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              Product shelf
            </p>

            <h2>
              Keep or tuck away
            </h2>

            {product.isArchived ? (
              <>
                <p>
                  This Product is archived
                  but its history remains
                  intact.
                </p>

                {onRestore && (
                  <button
                    type="button"
                    className="journal-add-button"
                    onClick={
                      onRestore
                    }
                  >
                    Restore Product
                  </button>
                )}
              </>
            ) : (
              <>
                <p>
                  Archive Products you no
                  longer use while keeping
                  their history.
                </p>

                {onArchive && (
                  <button
                    type="button"
                    className="journal-add-button"
                    onClick={
                      onArchive
                    }
                  >
                    Archive Product
                  </button>
                )}
              </>
            )}

            {onDelete && (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  onDelete
                }
              >
                Permanently Delete Product
              </button>
            )}
          </article>

        </section>
      </div>
    </GardenLayout>
  )
}