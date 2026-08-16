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
  } from '../types'
  
  
  interface GrowingRecipesProps {
    recipes: GrowingSetup[]
  
    onOpenRecipe: (
      recipeId: string,
    ) => void
  
    onAddRecipe: () => void
  
    onNavigate: (
      page: AppPage,
    ) => void
  
    /*
     * Optional archive controls.
     *
     * Keeping these optional means this page
     * remains reusable for both the active
     * Recipe shelf and the archive.
     */
    archivedCount?: number
  
    onShowArchived?: () => void
  
    archivedButtonLabel?: string
  
    /*
     * Optional page wording lets AppLibrary
     * reuse this same index for archived
     * Growing Recipes.
     */
    title?: string
  
    intro?: string
  
    emptyTitle?: string
  
    emptyMessage?: string
  
    showArchivedStatus?: boolean
  }
  
  
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
  
  
  function getRecipeIcon(
    recipe: GrowingSetup,
  ): string {
    switch (recipe.category) {
      case 'own-mix':
        return '🌱'
  
      case 'bought-mix':
        return '🪴'
  
      case 'ground-type':
        return '🌍'
  
      case 'growing-system':
        return '💧'
  
      default:
        return '🌿'
    }
  }
  
  
  function formatRecipeDate(
    date?: string,
  ): string {
    if (!date) {
      return ''
    }
  
    const safeDate =
      date.slice(0, 10)
  
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
  
  
  function getRatingStars(
    rating:
      | 1
      | 2
      | 3
      | 4
      | 5,
  ): string {
    return '★'.repeat(
      rating,
    )
  }
  
  
  export default function GrowingRecipes({
    recipes,
    onOpenRecipe,
    onAddRecipe,
    onNavigate,
  
    archivedCount = 0,
  
    onShowArchived,
  
    archivedButtonLabel,
  
    title =
      'Growing Recipes',
  
    intro =
      'The mixtures, bought media, native ground and growing systems your garden grows in.',
  
    emptyTitle,
  
    emptyMessage,
  
    showArchivedStatus =
      false,
  }: GrowingRecipesProps) {
    const [
      searchTerm,
      setSearchTerm,
    ] = useState('')
  
  
    /* =======================================
       PAGE WORDING
    ======================================= */
  
    const resolvedArchivedButtonLabel =
      archivedButtonLabel ??
      (
        archivedCount === 1
          ? 'View 1 Archived Recipe'
          : `View ${archivedCount} Archived Recipes`
      )
  
  
    const resolvedEmptyTitle =
      emptyTitle ??
      (
        recipes.length === 0
          ? 'A fresh page'
          : 'Nothing found'
      )
  
  
    const resolvedEmptyMessage =
      emptyMessage ??
      (
        recipes.length === 0
          ? 'Your saved growing recipes will gather here as you create them.'
          : `Sprig couldn't find a Growing Recipe matching "${searchTerm}".`
      )
  
  
    /* =======================================
       SEARCH + SORT
    ======================================= */
  
    const filteredRecipes =
      useMemo(() => {
        const query =
          searchTerm
            .trim()
            .toLowerCase()
  
  
        /*
         * Work on a copy so we never mutate
         * the GardenData recipes array.
         */
        const sortedRecipes =
          [...recipes].sort(
            (
              recipeA,
              recipeB,
            ) => {
              /*
               * On the active shelf,
               * favourites rise to the top.
               *
               * The same ordering remains useful
               * in the archive because the Recipe
               * keeps its historical judgement.
               */
              const favouriteDifference =
                Number(
                  Boolean(
                    recipeB.isFavourite,
                  ),
                ) -
                Number(
                  Boolean(
                    recipeA.isFavourite,
                  ),
                )
  
              if (
                favouriteDifference !==
                0
              ) {
                return favouriteDifference
              }
  
  
              /*
               * Within each group,
               * higher-rated Recipes come first.
               *
               * Unrated Recipes behave as zero.
               */
              const ratingDifference =
                (recipeB.rating ?? 0) -
                (recipeA.rating ?? 0)
  
              if (
                ratingDifference !==
                0
              ) {
                return ratingDifference
              }
  
  
              /*
               * Finally keep the remaining
               * Recipes in predictable
               * alphabetical order.
               */
              return recipeA.name
                .localeCompare(
                  recipeB.name,
                )
            },
          )
  
  
        if (!query) {
          return sortedRecipes
        }
  
  
        return sortedRecipes.filter(
          (recipe) => {
            const searchableText = [
              recipe.name,
  
              getRecipeCategoryLabel(
                recipe,
              ),
  
              recipe.brand,
  
              recipe.productName,
  
              recipe.groundType,
  
              recipe.growingSystemType,
  
              recipe.notes,
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
        recipes,
        searchTerm,
      ])
  
  
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
  
  
            {/* ===================================
                ACTIVE SHELF ACTION
            =================================== */}
  
            {!showArchivedStatus && (
              <button
                type="button"
                className="journal-add-button"
                onClick={onAddRecipe}
              >
                + New Growing Recipe
              </button>
            )}
  
  
            {/* ===================================
                ARCHIVE SHELF ACTION
            =================================== */}
  
            {showArchivedStatus &&
              onShowArchived && (
              <button
                type="button"
                className="journal-add-button"
                onClick={
                  onShowArchived
                }
              >
                {resolvedArchivedButtonLabel}
              </button>
            )}
          </header>
  
  
          {/* =======================================
              ACTIVE / ARCHIVE NAVIGATION
          ======================================= */}
  
          {!showArchivedStatus &&
            onShowArchived &&
            archivedCount > 0 && (
            <section className="sprig-form-section">
              <button
                type="button"
                className="record-action-button"
                onClick={
                  onShowArchived
                }
              >
                📦{' '}
                {
                  resolvedArchivedButtonLabel
                }
              </button>
            </section>
          )}
  
  
          {/* =======================================
              ARCHIVE NOTE
          ======================================= */}
  
          {showArchivedStatus && (
            <section className="sprig-form-section">
              <p className="section-label">
                Sprig&apos;s archive
              </p>
  
              <p>
                These Growing Recipes are no
                longer on the active shelf, but
                their garden history and
                connections have been kept.
              </p>
            </section>
          )}
  
  
          {/* =======================================
              SEARCH
          ======================================= */}
  
          <section className="sprig-form-section">
            <label>
              {showArchivedStatus
                ? 'Search Archived Recipes'
                : 'Search Growing Recipes'}
  
              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
                  )
                }
                placeholder={
                  showArchivedStatus
                    ? 'Search the archive...'
                    : 'Potato, Rocky Point, clay...'
                }
              />
            </label>
          </section>
  
  
          {/* =======================================
              RECIPE INDEX
          ======================================= */}
  
          <section className="library-grid">
  
            {filteredRecipes.length ===
              0 && (
              <article className="library-book">
                <div className="library-book-icon">
                  {showArchivedStatus
                    ? '📦'
                    : '🌱'}
                </div>
  
                <p className="section-label">
                  {showArchivedStatus
                    ? 'Recipe Archive'
                    : 'Growing Recipes'}
                </p>
  
                <h2>
                  {searchTerm.trim()
                    ? 'Nothing found'
                    : resolvedEmptyTitle}
                </h2>
  
                <p>
                  {searchTerm.trim()
                    ? `Sprig couldn't find a Growing Recipe matching "${searchTerm}".`
                    : resolvedEmptyMessage}
                </p>
  
  
                {!showArchivedStatus &&
                  recipes.length ===
                    0 &&
                  !searchTerm.trim() && (
                  <button
                    type="button"
                    className="journal-add-button"
                    onClick={
                      onAddRecipe
                    }
                  >
                    Create your first recipe
                  </button>
                )}
  
  
                {showArchivedStatus &&
                  onShowArchived && (
                  <button
                    type="button"
                    className="journal-add-button"
                    onClick={
                      onShowArchived
                    }
                  >
                    Back to Active Recipes
                  </button>
                )}
              </article>
            )}
  
  
            {filteredRecipes.map(
              (recipe) => {
                const ingredientCount =
                  recipe
                    .ingredientIds
                    ?.length ?? 0
  
  
                return (
                  <article
                    key={recipe.id}
                    className="library-book"
                  >
                    <div className="library-book-icon">
                      {showArchivedStatus
                        ? '📦'
                        : getRecipeIcon(
                            recipe,
                          )}
                    </div>
  
  
                    {/* ===================================
                        ARCHIVED STATUS
                    =================================== */}
  
                    {showArchivedStatus && (
                      <p className="section-label">
                        Archived Growing Recipe
                      </p>
                    )}
  
  
                    {/* ===================================
                        FAVOURITE
                    =================================== */}
  
                    {recipe.isFavourite && (
                      <p className="section-label">
                        ★ Garden Favourite
                      </p>
                    )}
  
  
                    <p className="section-label">
                      {getRecipeCategoryLabel(
                        recipe,
                      )}
                    </p>
  
  
                    <h2>
                      {recipe.name}
                    </h2>
  
  
                    {/* ===================================
                        RATING
                    =================================== */}
  
                    {recipe.rating && (
                      <p
                        className="sprig-recipe-rating"
                        aria-label={`${recipe.rating} out of 5 stars`}
                      >
                        {getRatingStars(
                          recipe.rating,
                        )}
                      </p>
                    )}
  
  
                    {/* ===================================
                        RECIPE SUMMARY
                    =================================== */}
  
                    {recipe.category ===
                      'own-mix' &&
                      ingredientCount >
                        0 && (
                      <p>
                        {ingredientCount}{' '}
                        {ingredientCount ===
                        1
                          ? 'ingredient'
                          : 'ingredients'}
                      </p>
                    )}
  
  
                    {recipe.category ===
                      'bought-mix' &&
                      recipe.brand && (
                      <p>
                        {recipe.brand}
                      </p>
                    )}
  
  
                    {recipe.notes && (
                      <p>
                        {recipe.notes}
                      </p>
                    )}
  
  
                    <p className="library-coming-soon">
                      Added{' '}
                      {formatRecipeDate(
                        recipe.createdAt,
                      )}
                    </p>
  
  
                    {/* ===================================
                        ARCHIVED DATE
                    =================================== */}
  
                    {showArchivedStatus &&
                      recipe.archivedAt && (
                      <p className="library-coming-soon">
                        Archived{' '}
                        {formatRecipeDate(
                          recipe.archivedAt,
                        )}
                      </p>
                    )}
  
  
                    <button
                      type="button"
                      className="journal-add-button"
                      onClick={() =>
                        onOpenRecipe(
                          recipe.id,
                        )
                      }
                    >
                      {showArchivedStatus
                        ? 'Open Archived Recipe'
                        : 'Open Recipe'}
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