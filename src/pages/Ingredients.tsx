import {
    useMemo,
    useState,
  } from 'react'
  
  import GardenLayout from '../components/layout/GardenLayout'
  
  import type {
    AppPage,
  } from '../types/navigation'
  
  import type {
    GrowingSetup,
    Ingredient,
    IngredientCategory,
  } from '../types'
  
  
  interface IngredientsProps {
    ingredients: Ingredient[]
  
    recipes: GrowingSetup[]
  
    title?: string
  
    intro?: string
  
    emptyTitle?: string
  
    emptyMessage?: string
  
    archivedCount?: number
  
    showArchivedStatus?: boolean
  
    archivedButtonLabel?: string
  
    onOpenIngredient: (
      ingredientId: string,
    ) => void
  
    onAddIngredient: () => void
  
    onShowArchived?: () => void
  
    onNavigate: (
      page: AppPage,
    ) => void
  }
  
  
  /* =======================================
     INGREDIENT CATEGORY LABEL
  ======================================= */
  
  function getIngredientCategoryLabel(
    ingredient: Ingredient,
  ): string {
    /*
     * Gardener-created categories always
     * keep the gardener's own wording.
     */
    if (
      ingredient.customCategoryLabel
        ?.trim()
    ) {
      return (
        ingredient.customCategoryLabel
          .trim()
      )
    }
  
    return getStandardCategoryLabel(
      ingredient.category,
    )
  }
  
  
  function getStandardCategoryLabel(
    category?: IngredientCategory,
  ): string {
    switch (category) {
      case 'compost':
        return 'Compost'
  
      case 'manure':
        return 'Manure'
  
      case 'organic-matter':
        return 'Organic Matter'
  
      case 'minerals':
        return 'Minerals'
  
      case 'aeration':
        return 'Aeration'
  
      case 'water-retention':
        return 'Water Retention'
  
      case 'amendments':
        return 'Amendments'
  
      case 'fertiliser':
        return 'Fertiliser'
  
      case 'biological-additives':
        return 'Biological Additives'
  
      case 'ph-adjusters':
        return 'pH Adjusters'
  
      case 'structure-bulk':
        return 'Structure / Bulk'
  
      case 'growing-medium':
        return 'Growing Medium'
  
      case 'mulch':
        return 'Mulch'
  
      case 'other':
        return 'Other'
  
      default:
        return 'Garden Ingredient'
    }
  }
  
  
  /* =======================================
     INGREDIENT ICON
  ======================================= */
  
  function getIngredientIcon(
    category?: IngredientCategory,
  ): string {
    switch (category) {
      case 'compost':
        return '🍂'
  
      case 'manure':
        return '🌾'
  
      case 'organic-matter':
        return '🌿'
  
      case 'minerals':
        return '🪨'
  
      case 'aeration':
        return '🌬️'
  
      case 'water-retention':
        return '💧'
  
      case 'amendments':
        return '🪴'
  
      case 'fertiliser':
        return '🌱'
  
      case 'biological-additives':
        return '🦠'
  
      case 'ph-adjusters':
        return '⚖️'
  
      case 'structure-bulk':
        return '🪵'
  
      case 'growing-medium':
        return '🪴'
  
      case 'mulch':
        return '🍁'
  
      case 'other':
        return '🌾'
  
      default:
        return '🌿'
    }
  }
  
  
  /* =======================================
     DATE FORMATTING
  ======================================= */
  
  function formatIngredientDate(
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
  
  
  export default function Ingredients({
    ingredients,
    recipes,
  
    title =
      'Ingredients',
  
    intro =
      'The composts, manures, minerals, amendments and other useful things that become part of your garden.',
  
    emptyTitle =
      'An empty pantry',
  
    emptyMessage =
      'Your reusable garden ingredients will gather here as you add them.',
  
    archivedCount = 0,
  
    showArchivedStatus =
      false,
  
    archivedButtonLabel =
      'Archived Ingredients',
  
    onOpenIngredient,
    onAddIngredient,
    onShowArchived,
    onNavigate,
  }: IngredientsProps) {
    const [
      searchTerm,
      setSearchTerm,
    ] = useState('')
  
  
    /* =======================================
       SEARCH + SORT
    ======================================= */
  
    const filteredIngredients =
      useMemo(() => {
        const query =
          searchTerm
            .trim()
            .toLowerCase()
  
  
        /*
         * AppLibrary decides which collection
         * belongs on this page.
         *
         * It supplies active Ingredients to the
         * normal shelf and archived Ingredients
         * to the archive shelf.
         *
         * Therefore we deliberately do NOT
         * filter archived records here.
         */
        const sortedIngredients =
          [...ingredients].sort(
            (
              ingredientA,
              ingredientB,
            ) => {
              /*
               * Favourites gently rise to the
               * top of the active shelf.
               *
               * The archived shelf remains
               * alphabetical because archived
               * records are historical rather
               * than everyday favourites.
               */
              if (
                !showArchivedStatus
              ) {
                const favouriteA =
                  ingredientA.isFavourite
                    ? 1
                    : 0
  
                const favouriteB =
                  ingredientB.isFavourite
                    ? 1
                    : 0
  
                if (
                  favouriteA !==
                  favouriteB
                ) {
                  return (
                    favouriteB -
                    favouriteA
                  )
                }
              }
  
  
              return (
                ingredientA.name.localeCompare(
                  ingredientB.name,
                )
              )
            },
          )
  
  
        if (!query) {
          return sortedIngredients
        }
  
  
        return sortedIngredients.filter(
          (ingredient) => {
            const searchableText = [
              ingredient.name,
  
              getIngredientCategoryLabel(
                ingredient,
              ),
  
              ingredient.manufacturer,
  
              ingredient.source,
  
              ingredient.notes,
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
        ingredients,
        searchTerm,
        showArchivedStatus,
      ])
  
  
    /* =======================================
       RECIPE CONNECTION COUNT
    ======================================= */
  
    function getRecipeCount(
      ingredientId: string,
    ): number {
      return recipes.filter(
        (recipe) =>
          recipe.ingredientIds
            ?.includes(
              ingredientId,
            ),
      ).length
    }
  
  
    /* =======================================
       EMPTY STATE
    ======================================= */
  
    const hasSearch =
      searchTerm
        .trim()
        .length > 0
  
  
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
                {title}
              </h1>
  
              <p className="journal-intro">
                {intro}
              </p>
            </div>
  
  
            {!showArchivedStatus && (
              <button
                type="button"
                className="journal-add-button"
                onClick={
                  onAddIngredient
                }
              >
                + New Ingredient
              </button>
            )}
          </header>
  
  
          {/* =======================================
              ACTIVE / ARCHIVED SHELF SWITCH
          ======================================= */}
  
          {onShowArchived && (
            <section className="sprig-form-section">
  
              {showArchivedStatus ? (
                <button
                  type="button"
                  className="record-action-button"
                  onClick={
                    onShowArchived
                  }
                >
                  ← {archivedButtonLabel}
                </button>
              ) : (
                archivedCount > 0 && (
                  <button
                    type="button"
                    className="record-action-button"
                    onClick={
                      onShowArchived
                    }
                  >
                    📦 Archived Ingredients
                    {' '}
                    ({archivedCount})
                  </button>
                )
              )}
  
            </section>
          )}
  
  
          {/* =======================================
              SEARCH
          ======================================= */}
  
          <section className="sprig-form-section">
            <label>
              Search Ingredients
  
              <input
                type="search"
                value={
                  searchTerm
                }
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
                  )
                }
                placeholder="Compost, manure, perlite..."
              />
            </label>
          </section>
  
  
          {/* =======================================
              INGREDIENT INDEX
          ======================================= */}
  
          <section className="library-grid">
  
            {filteredIngredients.length ===
              0 && (
              <article className="library-book">
                <div className="library-book-icon">
                  🌿
                </div>
  
                <p className="section-label">
                  {showArchivedStatus
                    ? 'Archived Ingredients'
                    : 'Ingredients'}
                </p>
  
  
                <h2>
                  {hasSearch
                    ? 'Nothing found'
                    : emptyTitle}
                </h2>
  
  
                <p>
                  {hasSearch
                    ? `Sprig couldn't find an Ingredient matching "${searchTerm}".`
                    : emptyMessage}
                </p>
  
  
                {!showArchivedStatus &&
                  ingredients.length ===
                    0 &&
                  !hasSearch && (
                  <button
                    type="button"
                    className="journal-add-button"
                    onClick={
                      onAddIngredient
                    }
                  >
                    Add your first Ingredient
                  </button>
                )}
              </article>
            )}
  
  
            {filteredIngredients.map(
              (ingredient) => {
                const recipeCount =
                  getRecipeCount(
                    ingredient.id,
                  )
  
  
                return (
                  <article
                    key={
                      ingredient.id
                    }
                    className="library-book"
                  >
  
                    {/* ===================================
                        ICON
                    =================================== */}
  
                    <div className="library-book-icon">
                      {getIngredientIcon(
                        ingredient.category,
                      )}
                    </div>
  
  
                    {/* ===================================
                        ARCHIVED STATUS
                    =================================== */}
  
                    {showArchivedStatus && (
                      <p className="section-label">
                        📦 Archived
                      </p>
                    )}
  
  
                    {/* ===================================
                        FAVOURITE
                    =================================== */}
  
                    {!showArchivedStatus &&
                      ingredient.isFavourite && (
                      <p className="section-label">
                        ★ Garden Favourite
                      </p>
                    )}
  
  
                    {/* ===================================
                        CATEGORY
                    =================================== */}
  
                    <p className="section-label">
                      {getIngredientCategoryLabel(
                        ingredient,
                      )}
                    </p>
  
  
                    {/* ===================================
                        NAME
                    =================================== */}
  
                    <h2>
                      {ingredient.name}
                    </h2>
  
  
                    {/* ===================================
                        RATING
                    =================================== */}
  
                    {typeof ingredient.rating ===
                      'number' && (
                      <p>
                        {'★'.repeat(
                          ingredient.rating,
                        )}
  
                        {'☆'.repeat(
                          Math.max(
                            0,
                            5 -
                              ingredient.rating,
                          ),
                        )}
                      </p>
                    )}
  
  
                    {/* ===================================
                        SOURCE
                    =================================== */}
  
                    {ingredient.source && (
                      <p>
                        From:{' '}
                        {
                          ingredient.source
                        }
                      </p>
                    )}
  
  
                    {/* ===================================
                        MANUFACTURER
                    =================================== */}
  
                    {ingredient.manufacturer && (
                      <p>
                        {
                          ingredient.manufacturer
                        }
                      </p>
                    )}
  
  
                    {/* ===================================
                        RECIPE CONNECTIONS
                    =================================== */}
  
                    {recipeCount > 0 && (
                      <p>
                        Used in{' '}
                        {recipeCount}{' '}
                        {recipeCount === 1
                          ? 'Growing Recipe'
                          : 'Growing Recipes'}
                      </p>
                    )}
  
  
                    {/* ===================================
                        NOTES
                    =================================== */}
  
                    {ingredient.notes && (
                      <p>
                        {
                          ingredient.notes
                        }
                      </p>
                    )}
  
  
                    {/* ===================================
                        PHOTOGRAPHS
                    =================================== */}
  
                    {ingredient.photoUrls &&
                      ingredient.photoUrls.length >
                        0 && (
                      <p className="section-label">
                        📷{' '}
                        {
                          ingredient.photoUrls.length
                        }{' '}
                        {ingredient.photoUrls.length ===
                        1
                          ? 'photograph'
                          : 'photographs'}
                      </p>
                    )}
  
  
                    {/* ===================================
                        ARCHIVED DATE
                    =================================== */}
  
                    {showArchivedStatus &&
                      ingredient.archivedAt && (
                      <p className="library-coming-soon">
                        Archived{' '}
                        {formatIngredientDate(
                          ingredient.archivedAt,
                        )}
                      </p>
                    )}
  
  
                    {/* ===================================
                        CREATED DATE
                    =================================== */}
  
                    <p className="library-coming-soon">
                      Added{' '}
                      {formatIngredientDate(
                        ingredient.createdAt,
                      )}
                    </p>
  
  
                    {/* ===================================
                        OPEN
                    =================================== */}
  
                    <button
                      type="button"
                      className="journal-add-button"
                      onClick={() =>
                        onOpenIngredient(
                          ingredient.id,
                        )
                      }
                    >
                      Open Ingredient
                    </button>
  
                  </article>
                )
              },
            )}
  
          </section>
        </div>
      </GardenLayout>
    )
  }