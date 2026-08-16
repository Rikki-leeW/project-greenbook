import {
  useState,
} from 'react'

import GardenLayout from '../components/layout/GardenLayout'
import RecordActions from '../components/common/RecordActions'
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery'


import type {
  AppPage,
} from '../types/navigation'

import type {
  GrowingPlace,
  GrowingSetup,
  Ingredient,
  PlantStory,
  PurchaseRecord,
} from '../types'


type RecipeRating =
  | 1
  | 2
  | 3
  | 4
  | 5


interface GrowingRecipeDetailProps {
  recipe: GrowingSetup

  ingredients: Ingredient[]

  plants: PlantStory[]

  growingPlaces: GrowingPlace[]

  purchases: PurchaseRecord[]

  onBack: () => void

  onEdit: () => void

  onDuplicate: () => void

  onToggleFavourite: () => void

  onSetRating: (
    rating: RecipeRating,
  ) => void

  onArchive?: () => void

  onRestore?: () => void

  onDelete?: () => void

  onAddPurchase?: () => void

  onEditPurchase?: (
    purchase: PurchaseRecord,
  ) => void

  onOpenGrowingPlace: (
    growingPlaceId: string,
  ) => void

  onOpenPlant: (
    plantId: string,
  ) => void

  onOpenIngredient: (
    ingredientId: string,
  ) => void

  onNavigate: (
    page: AppPage,
  ) => void
}


/* =======================================
   RECIPE CATEGORY
======================================= */

function getRecipeCategoryLabel(
  recipe: GrowingSetup,
): string {
  switch (recipe.category) {
    case 'own-mix':
      return 'My Recipe'

    case 'bought-mix':
      return 'Bought Mix'

    case 'ground-type':
      return 'Native Ground'

    case 'growing-system':
      return 'Growing System'

    default:
      return 'Growing Recipe'
  }
}


/* =======================================
   DATE FORMATTING
======================================= */

function formatRecipeDate(
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


/* =======================================
   TECHNICAL LABEL
======================================= */

function formatTechnicalLabel(
  value: string,
): string {
  return value
    .replace(
      /-/g,
      ' ',
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    )
}


/* =======================================
   PURCHASE PRICE
======================================= */

function formatPurchasePrice(
  purchase: PurchaseRecord,
): string {
  const currency =
    purchase.currency ??
    'AUD'

  try {
    return new Intl.NumberFormat(
      'en-AU',
      {
        style: 'currency',
        currency,
      },
    ).format(
      purchase.pricePaid,
    )
  } catch {
    return `$${purchase.pricePaid.toFixed(
      2,
    )}`
  }
}


/* =======================================
   PURCHASE AMOUNT
======================================= */

function getPurchaseAmountLabel(
  purchase: PurchaseRecord,
): string {
  const pieces:
    string[] = []

  if (
    purchase.quantity !==
    undefined
  ) {
    const quantityUnit =
      purchase.unit
        ? ` ${formatTechnicalLabel(
            purchase.unit,
          )}`
        : ''

    pieces.push(
      `${purchase.quantity}${quantityUnit}`,
    )
  }

  if (
    purchase.packageSize !==
    undefined
  ) {
    const packageUnit =
      purchase.packageUnit
        ? ` ${formatTechnicalLabel(
            purchase.packageUnit,
          )}`
        : ''

    pieces.push(
      `${purchase.packageSize}${packageUnit} package`,
    )
  }

  return pieces.join(
    ' · ',
  )
}


/* =======================================
   GROWING RECIPE DETAIL
======================================= */

export default function GrowingRecipeDetail({
  recipe,
  ingredients,
  plants,
  growingPlaces,
  purchases,
  onBack,
  onEdit,
  onDuplicate,
  onToggleFavourite,
  onSetRating,
  onArchive,
  onRestore,
  onDelete,
  onAddPurchase,
  onEditPurchase,
  onOpenGrowingPlace,
  onOpenPlant,
  onOpenIngredient,
  onNavigate,
}: GrowingRecipeDetailProps) {


  /* =======================================
     RATING STATE
  ======================================= */

  const [
    isRatingOpen,
    setIsRatingOpen,
  ] = useState(false)


  /* =======================================
     RECIPE INGREDIENTS
  ======================================= */

  const recipeIngredients =
    (
      recipe.ingredientIds ??
      []
    )
      .map(
        (ingredientId) =>
          ingredients.find(
            (ingredient) =>
              ingredient.id ===
              ingredientId,
          ),
      )
      .filter(
        (
          ingredient,
        ): ingredient is Ingredient =>
          Boolean(
            ingredient,
          ),
      )


  /* =======================================
     RECIPE RELATIONSHIPS
  ======================================= */

  const linkedPlants =
    plants.filter(
      (plant) =>
        plant.currentGrowingSetupId ===
          recipe.id ||
        plant.previousGrowingSetupIds
          ?.includes(
            recipe.id,
          ),
    )


  const linkedGrowingPlaces =
    growingPlaces.filter(
      (place) =>
        place.growingSetupId ===
        recipe.id,
    )


  const relationshipCount =
    linkedPlants.length +
    linkedGrowingPlaces.length


  /* =======================================
     PURCHASE HISTORY
  ======================================= */

  const recipePurchases =
    purchases
      .filter(
        (purchase) =>
          purchase.itemType ===
            'growing-setup' &&
          purchase.itemId ===
            recipe.id,
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


  /* =======================================
     RATING
  ======================================= */

  function handleChooseRating(
    rating: RecipeRating,
  ) {
    onSetRating(
      rating,
    )

    setIsRatingOpen(
      false,
    )
  }


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
              {recipe.isArchived
                ? 'Archived Growing Recipe'
                : 'Growing Recipe'}
            </p>

            <h1>
              {recipe.name}
            </h1>

            <p className="journal-intro">
              {getRecipeCategoryLabel(
                recipe,
              )}
            </p>


            {recipe.isFavourite && (
              <p className="section-label">
                ★ Garden Favourite
              </p>
            )}


            {recipe.isArchived && (
              <p className="section-label">
                📦 Resting in Sprig&apos;s archive
              </p>
            )}
          </div>
        </header>


        {/* =======================================
            ARCHIVED RECORD NOTICE
        ======================================= */}

        {recipe.isArchived && (
          <section className="sprig-form-section">
            <p className="section-label">
              Archived
            </p>

            <h2>
              This recipe has been put away
            </h2>

            <p>
              It is no longer on your active
              Growing Recipe shelf, but Sprig
              has kept its history,
              photographs and garden
              connections.
            </p>

            {recipe.archivedAt && (
              <p className="form-whisper">
                Archived{' '}
                {formatRecipeDate(
                  recipe.archivedAt,
                )}
              </p>
            )}

            {onRestore && (
              <button
                type="button"
                className="journal-add-button"
                onClick={
                  onRestore
                }
              >
                🌱 Restore this Growing Recipe
              </button>
            )}
          </section>
        )}


        {/* =======================================
            RECORD ACTIONS
        ======================================= */}

        <RecordActions
          backLabel={
            recipe.isArchived
              ? 'Back to Archived Recipes'
              : 'Back to Recipes'
          }

          editLabel="Edit Growing Recipe"

          duplicateLabel="Create a variation"

          rateLabel={
            recipe.rating
              ? 'Change rating'
              : 'Rate this recipe'
          }

          archiveLabel="Archive this recipe"

          deleteLabel="Delete permanently"

          isFavourite={
            Boolean(
              recipe.isFavourite,
            )
          }

          rating={
            recipe.rating
          }

          onBack={
            onBack
          }

          onEdit={
            onEdit
          }

          onDuplicate={
            onDuplicate
          }

          onRate={() =>
            setIsRatingOpen(
              (current) =>
                !current,
            )
          }

          onFavourite={
            onToggleFavourite
          }

          onArchive={
            recipe.isArchived
              ? undefined
              : onArchive
          }

          onDelete={
            onDelete
          }
        />


        {/* =======================================
            RATING CHOOSER
        ======================================= */}

        {isRatingOpen && (
          <section className="sprig-form-section">
            <p className="section-label">
              Your rating
            </p>

            <h2>
              How has this recipe worked
              for you?
            </h2>

            <p>
              Give this Growing Recipe a
              place from one to five stars.
              You can change it whenever
              the garden teaches you
              something new.
            </p>

            <div
              className="sprig-rating-picker"
              role="group"
              aria-label="Rate this Growing Recipe"
            >
              {(
                [
                  1,
                  2,
                  3,
                  4,
                  5,
                ] as RecipeRating[]
              ).map(
                (rating) => (
                  <button
                    key={
                      rating
                    }
                    type="button"
                    className="sprig-rating-star"
                    aria-label={`${rating} ${
                      rating === 1
                        ? 'star'
                        : 'stars'
                    }`}
                    aria-pressed={
                      recipe.rating ===
                      rating
                    }
                    onClick={() =>
                      handleChooseRating(
                        rating,
                      )
                    }
                  >
                    {recipe.rating &&
                    rating <=
                      recipe.rating
                      ? '★'
                      : '☆'}
                  </button>
                ),
              )}
            </div>

            {recipe.rating && (
              <p className="form-whisper">
                Currently rated{' '}
                {recipe.rating} out of 5.
              </p>
            )}
          </section>
        )}


        {/* =======================================
            RECIPE CONTENT
        ======================================= */}

        <section className="library-grid">

          {/* =======================================
              RECIPE DETAILS
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              Recipe details
            </p>

            <h2>
              {recipe.name}
            </h2>

            <p>
              Added{' '}
              {formatRecipeDate(
                recipe.createdAt,
              )}
            </p>


            {recipe.updatedAt && (
              <p>
                Last updated{' '}
                {formatRecipeDate(
                  recipe.updatedAt,
                )}
              </p>
            )}


            {recipe.isArchived &&
              recipe.archivedAt && (
              <p>
                Archived{' '}
                {formatRecipeDate(
                  recipe.archivedAt,
                )}
              </p>
            )}


            <p>
              Type:{' '}
              {getRecipeCategoryLabel(
                recipe,
              )}
            </p>


            {recipe.rating && (
              <p>
                Rating:{' '}
                {'★'.repeat(
                  recipe.rating,
                )}{' '}
                {recipe.rating}/5
              </p>
            )}


            {recipe.isFavourite && (
              <p>
                ★ Garden Favourite
              </p>
            )}


            {recipe.isArchived && (
              <p>
                📦 Archived
              </p>
            )}


            {recipe.brand && (
              <p>
                Brand: {recipe.brand}
              </p>
            )}


            {recipe.productName && (
              <p>
                Product:{' '}
                {recipe.productName}
              </p>
            )}


            {recipe.groundType && (
              <p>
                Ground type:{' '}
                {formatTechnicalLabel(
                  recipe.groundType,
                )}
              </p>
            )}


            {recipe.growingSystemType && (
              <p>
                Growing system:{' '}
                {formatTechnicalLabel(
                  recipe.growingSystemType,
                )}
              </p>
            )}
          </article>


          {/* =======================================
              PURCHASE HISTORY
          ======================================= */}

          {recipe.category ===
            'bought-mix' && (
            <article className="library-book">
              <p className="section-label">
                Purchase history
              </p>

              <h2>
                What it has cost
              </h2>


              {recipePurchases.length >
              0 ? (
                <>
                  <p>
                    Sprig remembers{' '}
                    {
                      recipePurchases.length
                    }{' '}
                    {recipePurchases.length ===
                    1
                      ? 'purchase'
                      : 'purchases'}{' '}
                    for this Bought Mix.
                  </p>


                  <ul className="sprig-purchase-history">
                    {recipePurchases.map(
                      (
                        purchase,
                      ) => {
                        const amountLabel =
                          getPurchaseAmountLabel(
                            purchase,
                          )

                        return (
                          <li
                            key={
                              purchase.id
                            }
                          >
                            <strong>
                              {formatPurchasePrice(
                                purchase,
                              )}
                            </strong>

                            {' · '}

                            {formatRecipeDate(
                              purchase.date,
                            )}


                            {purchase.supplier && (
                              <>
                                {' · '}
                                {
                                  purchase.supplier
                                }
                              </>
                            )}


                            {amountLabel && (
                              <>
                                {' · '}
                                {
                                  amountLabel
                                }
                              </>
                            )}


                            {purchase.notes && (
                              <p className="form-whisper">
                                {
                                  purchase.notes
                                }
                              </p>
                            )}


                            {onEditPurchase && (
                              <button
                                type="button"
                                className="secondary-button"
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
                  Bought Mix yet.
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
                Each purchase stays
                separate so Sprig can
                remember changing prices,
                suppliers and package sizes
                over time.
              </p>
            </article>
          )}


          {/* =======================================
              INGREDIENTS
          ======================================= */}

          {recipe.category ===
            'own-mix' && (
            <article className="library-book">
              <p className="section-label">
                Ingredients
              </p>

              <h2>
                Ingredients
              </h2>

              {recipeIngredients.length >
              0 ? (
                <div className="sprig-ingredient-list">
                  {recipeIngredients.map(
                    (
                      ingredient,
                    ) => (
                      <button
                        key={
                          ingredient.id
                        }
                        type="button"
                        className="sprig-ingredient-chip"
                        onClick={() =>
                          onOpenIngredient(
                            ingredient.id,
                          )
                        }
                      >
                        🌿{' '}
                        {
                          ingredient.name
                        }
                      </button>
                    ),
                  )}
                </div>
              ) : (
                <p>
                  No ingredients have
                  been added yet.
                </p>
              )}
            </article>
          )}


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

            {recipe.notes ? (
              <p>
                {recipe.notes}
              </p>
            ) : (
              <p>
                No notes have been
                tucked into this recipe
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
                recipe.photoUrls ??
                []
              }

              title="Recipe photographs"

              emptyMessage="No photographs have been tucked into this recipe yet."

              photoAltPrefix={`${recipe.name} photograph`}
            />
          </article>


          {/* =======================================
              GROWING PLACES
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              Growing Places
            </p>

            <h2>
              Where this recipe is used
            </h2>

            {linkedGrowingPlaces.length >
            0 ? (
              <ul>
                {linkedGrowingPlaces.map(
                  (
                    place,
                  ) => (
                    <li
                      key={
                        place.id
                      }
                    >
                      <button
                        type="button"
                        className="record-link-button"
                        onClick={() =>
                          onOpenGrowingPlace(
                            place.id,
                          )
                        }
                      >
                        🌿 {place.name}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>
                This recipe is not
                currently linked to a
                Growing Place.
              </p>
            )}
          </article>


          {/* =======================================
              PLANT STORIES
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              Plant Stories
            </p>

            <h2>
              Plants grown with this recipe
            </h2>

            {linkedPlants.length >
            0 ? (
              <ul>
                {linkedPlants.map(
                  (
                    plant,
                  ) => (
                    <li
                      key={
                        plant.id
                      }
                    >
                      <button
                        type="button"
                        className="record-link-button"
                        onClick={() =>
                          onOpenPlant(
                            plant.id,
                          )
                        }
                      >
                        🌱 {plant.displayName}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>
                No Plant Stories are
                linked to this recipe
                yet.
              </p>
            )}
          </article>


          {/* =======================================
              CONNECTION SUMMARY
          ======================================= */}

          <article className="library-book">
            <p className="section-label">
              Garden connections
            </p>

            <h2>
              Where this story reaches
            </h2>

            {relationshipCount >
            0 ? (
              <>
                <p>
                  This Growing Recipe is
                  connected to{' '}
                  {
                    relationshipCount
                  }{' '}
                  {relationshipCount ===
                  1
                    ? 'garden record'
                    : 'garden records'}.
                </p>

                {linkedPlants.length >
                  0 && (
                  <p>
                    {
                      linkedPlants.length
                    }{' '}
                    {linkedPlants.length ===
                    1
                      ? 'Plant Story'
                      : 'Plant Stories'}
                  </p>
                )}

                {linkedGrowingPlaces.length >
                  0 && (
                  <p>
                    {
                      linkedGrowingPlaces.length
                    }{' '}
                    {linkedGrowingPlaces.length ===
                    1
                      ? 'Growing Place'
                      : 'Growing Places'}
                  </p>
                )}

                <p className="form-whisper">
                  These connections are why
                  Sprig preserves archived
                  Recipes rather than simply
                  throwing their history away.
                </p>
              </>
            ) : (
              <>
                <p>
                  This Growing Recipe does
                  not currently have any
                  Plant Story or Growing
                  Place connections.
                </p>

                <p className="form-whisper">
                  A recipe with no
                  connections can be
                  permanently removed if
                  you no longer want to
                  keep it.
                </p>
              </>
            )}
          </article>

        </section>
      </div>
    </GardenLayout>
  )
}