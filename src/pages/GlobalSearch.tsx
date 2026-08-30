import {
    useMemo,
    useState,
  } from 'react'
  
  import GardenLayout from '../components/layout/GardenLayout'
  
  import type {
    GardenData,
  } from '../types'
  
  import type {
    AppPage,
  } from '../types/navigation'
  
  import {
    ALL_GLOBAL_SEARCH_CATEGORIES,
    GLOBAL_SEARCH_CATEGORIES,
    buildGlobalSearchIndex,
    getGlobalSearchCategoryCounts,
    getGlobalSearchCategoryIcon,
    getGlobalSearchCategoryLabel,
    getGlobalSearchDateLabel,
    getGlobalSearchOpenLabel,
    groupGlobalSearchResults,
    searchGlobalSearchIndex,
  } from '../utils/globalSearchUtils'
  
  import type {
    GlobalSearchCategory,
    GlobalSearchItem,
  } from '../utils/globalSearchUtils'
  
  import '../css/global-search.css'
  
  
  interface GlobalSearchProps {
    gardenData: GardenData
  
    onOpenResult: (
      item: GlobalSearchItem,
    ) => void
  
    onNavigate: (
      page: AppPage,
      libraryView?:
        | 'library'
        | 'growing-recipes'
        | 'ingredients'
        | 'products',
    ) => void
  }
  
  
  function uniqueLabels(
    labels:
      | string[]
      | undefined,
  ): string[] {
    return [
      ...new Set(
        (labels ?? [])
          .map(
            label =>
              label.trim(),
          )
          .filter(
            Boolean,
          ),
      ),
    ]
  }
  
  
  export default function GlobalSearch({
    gardenData,
    onOpenResult,
    onNavigate,
  }: GlobalSearchProps) {
    const [
      query,
      setQuery,
    ] =
      useState('')
  
  
    const [
      selectedCategories,
      setSelectedCategories,
    ] =
      useState<GlobalSearchCategory[]>(
        ALL_GLOBAL_SEARCH_CATEGORIES,
      )
  
  
    const searchIndex =
      useMemo(
        () =>
          buildGlobalSearchIndex(
            gardenData,
          ),
        [
          gardenData,
        ],
      )
  
  
    const categoryCounts =
      useMemo(
        () =>
          getGlobalSearchCategoryCounts(
            searchIndex,
          ),
        [
          searchIndex,
        ],
      )
  
  
    const results =
      useMemo(
        () =>
          searchGlobalSearchIndex(
            searchIndex,
            query,
            selectedCategories,
          ),
        [
          query,
          searchIndex,
          selectedCategories,
        ],
      )
  
  
    const resultGroups =
      useMemo(
        () =>
          groupGlobalSearchResults(
            results,
          ),
        [
          results,
        ],
      )
  
  
    const hasQuery =
      query.trim().length >
      0
  
  
    const allCategoriesSelected =
      selectedCategories.length ===
      ALL_GLOBAL_SEARCH_CATEGORIES.length
  
  
    function selectAllCategories() {
      setSelectedCategories(
        ALL_GLOBAL_SEARCH_CATEGORIES,
      )
    }
  
  
    function toggleCategory(
      category:
        GlobalSearchCategory,
    ) {
      setSelectedCategories(
        current => {
          const isSelected =
            current.includes(
              category,
            )
  
  
          if (
            isSelected
          ) {
            const next =
              current.filter(
                item =>
                  item !==
                  category,
              )
  
  
            return next.length >
              0
              ? next
              : current
          }
  
  
          return [
            ...current,
            category,
          ]
        },
      )
    }
  
  
    function clearSearch() {
      setQuery('')
  
      selectAllCategories()
    }
  
  
    return (
      <GardenLayout
        activePage="search"
        onNavigate={
          onNavigate
        }
      >
        <main className="sprig-global-search-page">
  
          {/* =======================================
              HEADER
          ======================================= */}
  
          <header className="sprig-global-search-header">
            <p className="section-label">
              Find it again
            </p>
  
            <h1>
              Search Sprig
            </h1>
  
            <p className="journal-intro">
              Search across the garden Sprig remembers,
              then open the real story behind the result.
            </p>
          </header>
  
  
          {/* =======================================
              SEARCH
          ======================================= */}
  
          <section
            className="sprig-global-search-box"
            aria-label="Search Sprig"
          >
            <div className="sprig-global-search-input-row">
              <span
                className="sprig-global-search-icon"
                aria-hidden="true"
              >
                🔎
              </span>
  
              <input
                className="sprig-global-search-input"
                type="search"
                value={
                  query
                }
                onChange={
                  event =>
                    setQuery(
                      event.target.value,
                    )
                }
                placeholder="Try Sebago, PowerFeed, 29 May, aphids..."
                aria-label="Search everything Sprig remembers"
              />
  
              {hasQuery && (
                <button
                  type="button"
                  className="sprig-global-search-clear"
                  onClick={
                    clearSearch
                  }
                >
                  Clear
                </button>
              )}
            </div>
  
  
            <div className="sprig-global-search-status">
              <p>
                {hasQuery
                  ? `${results.length} ${
                      results.length ===
                        1
                        ? 'match'
                        : 'matches'
                    }`
                  : `${searchIndex.length} searchable garden records and moments`}
              </p>
  
              {!allCategoriesSelected && (
                <button
                  type="button"
                  className="text-button"
                  onClick={
                    selectAllCategories
                  }
                >
                  Search all
                </button>
              )}
            </div>
          </section>
  
  
          {/* =======================================
              FILTERS
          ======================================= */}
  
          <section
            className="sprig-global-search-filters"
            aria-label="Search areas"
          >
            <div className="sprig-global-search-filter-heading">
              <div>
                <p className="section-label">
                  Look through
                </p>
  
                <p className="form-whisper">
                  Choose one or several parts of the garden.
                </p>
              </div>
  
              {!allCategoriesSelected && (
                <button
                  type="button"
                  className="text-button"
                  onClick={
                    selectAllCategories
                  }
                >
                  All
                </button>
              )}
            </div>
  
  
            <div className="sprig-global-search-filter-grid">
              {GLOBAL_SEARCH_CATEGORIES.map(
                category => {
                  const isSelected =
                    selectedCategories.includes(
                      category.id,
                    )
  
  
                  return (
                    <button
                      key={
                        category.id
                      }
                      type="button"
                      className={
                        isSelected
                          ? 'sprig-global-search-filter sprig-global-search-filter--selected'
                          : 'sprig-global-search-filter'
                      }
                      onClick={() =>
                        toggleCategory(
                          category.id,
                        )
                      }
                      aria-pressed={
                        isSelected
                      }
                    >
                      <span aria-hidden="true">
                        {category.icon}
                      </span>
  
                      <span>
                        {category.label}
                      </span>
  
                      <span className="sprig-global-search-filter-count">
                        {
                          categoryCounts[
                            category.id
                          ]
                        }
                      </span>
                    </button>
                  )
                },
              )}
            </div>
          </section>
  
  
          {/* =======================================
              STARTING VIEW
          ======================================= */}
  
          {!hasQuery && (
            <section className="sprig-global-search-start">
              <article className="sprig-global-search-start-card">
                <p className="section-label">
                  One garden, many doorways
                </p>
  
                <h2>
                  Search by whatever you remember
                </h2>
  
                <p>
                  A plant name, variety, date, Growing Place,
                  Growing Recipe, product, treatment, Journal word,
                  harvest, purchase or Plan can all lead you back
                  into the garden story.
                </p>
  
  
                <div className="sprig-global-search-map">
                  {GLOBAL_SEARCH_CATEGORIES.map(
                    category => (
                      <article
                        key={
                          category.id
                        }
                        className="sprig-global-search-map-card"
                      >
                        <span aria-hidden="true">
                          {category.icon}
                        </span>
  
                        <strong>
                          {
                            categoryCounts[
                              category.id
                            ]
                          }
                        </strong>
  
                        <span>
                          {category.label}
                        </span>
                      </article>
                    ),
                  )}
                </div>
              </article>
            </section>
          )}
  
  
          {/* =======================================
              NOTHING FOUND
          ======================================= */}
  
          {hasQuery &&
            results.length ===
              0 && (
            <section className="sprig-global-search-empty">
              <p className="section-label">
                Nothing yet
              </p>
  
              <h2>
                Sprig could not find that
              </h2>
  
              <p>
                Try another word, a broader date,
                or turn more search areas back on.
              </p>
            </section>
          )}
  
  
          {/* =======================================
              RESULTS
          ======================================= */}
  
          {hasQuery &&
            results.length >
              0 && (
            <section className="sprig-global-search-results">
              {resultGroups.map(
                group => (
                  <section
                    key={
                      group.category
                    }
                    className="sprig-global-search-group"
                  >
                    <header className="sprig-global-search-group-heading">
                      <div className="sprig-global-search-group-title">
                        <span aria-hidden="true">
                          {group.icon}
                        </span>
  
                        <h2>
                          {group.label}
                        </h2>
                      </div>
  
                      <span className="sprig-global-search-group-count">
                        {group.items.length}
                      </span>
                    </header>
  
  
                    {group.items.map(
                      item => {
                        const dateLabel =
                          getGlobalSearchDateLabel(
                            item,
                          )
  
  
                        const relationships =
                          uniqueLabels(
                            item.relationshipLabels,
                          )
  
  
                        const visibleRelationships =
                          relationships.slice(
                            0,
                            4,
                          )
  
  
                        const hiddenRelationshipCount =
                          Math.max(
                            relationships.length -
                              visibleRelationships.length,
                            0,
                          )
  
  
                        return (
                          <button
                            key={
                              item.id
                            }
                            type="button"
                            className={`sprig-global-search-result sprig-global-search-result--${item.category}`}
                            onClick={() =>
                              onOpenResult(
                                item,
                              )
                            }
                            title={
                              getGlobalSearchOpenLabel(
                                item,
                              )
                            }
                          >
                            <span
                              className="sprig-global-search-result-icon"
                              aria-hidden="true"
                            >
                              {getGlobalSearchCategoryIcon(
                                item.category,
                              )}
                            </span>
  
  
                            <span className="sprig-global-search-result-main">
                              <span className="sprig-global-search-result-meta">
                                {getGlobalSearchCategoryLabel(
                                  item.category,
                                )}
  
                                {dateLabel && (
                                  <>
                                    <span aria-hidden="true">
                                      ·
                                    </span>
  
                                    <span>
                                      {dateLabel}
                                    </span>
                                  </>
                                )}
                              </span>
  
  
                              <strong className="sprig-global-search-result-title">
                                {item.title}
                              </strong>
  
  
                              {item.subtitle && (
                                <span className="sprig-global-search-result-subtitle">
                                  {item.subtitle}
                                </span>
                              )}
  
  
                              {item.description && (
                                <span className="sprig-global-search-result-description">
                                  {item.description}
                                </span>
                              )}
  
  
                              {visibleRelationships.length >
                                0 && (
                                <span className="sprig-global-search-result-relationships">
                                  {visibleRelationships.map(
                                    relationship => (
                                      <span
                                        key={
                                          relationship
                                        }
                                        className="sprig-global-search-result-chip"
                                      >
                                        {relationship}
                                      </span>
                                    ),
                                  )}
  
                                  {hiddenRelationshipCount >
                                    0 && (
                                    <span className="sprig-global-search-result-chip">
                                      +{hiddenRelationshipCount}
                                    </span>
                                  )}
                                </span>
                              )}
                            </span>
  
  
                            <span
                              className="sprig-global-search-result-open"
                              aria-hidden="true"
                            >
                              ›
                            </span>
                          </button>
                        )
                      },
                    )}
                  </section>
                ),
              )}
            </section>
          )}
        </main>
      </GardenLayout>
    )
  }