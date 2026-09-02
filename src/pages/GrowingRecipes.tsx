import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import GardenLayout from '../components/layout/GardenLayout'

import type {
  AppPage,
} from '../types/navigation'

import type {
  GrowingSetup,
  GrowingSetupCategory,
} from '../types'


export type GrowingCategoryFilter =
  | 'all'
  | GrowingSetupCategory


interface GrowingRecipesProps {
  recipes:
    GrowingSetup[]

  onOpenRecipe: (
    recipeId: string,
  ) => void

  onAddRecipe:
    () => void

  onNavigate: (
    page: AppPage,
  ) => void

  archivedCount?:
    number

  onShowArchived?:
    () => void

  archivedButtonLabel?:
    string

  title?:
    string

  intro?:
    string

  emptyTitle?:
    string

  emptyMessage?:
    string

  showArchivedStatus?:
    boolean

  initialCategory?:
    GrowingCategoryFilter

  onCategoryChange?: (
    category:
      GrowingCategoryFilter,
  ) => void
}


interface GrowingCategoryDefinition {
  id:
    GrowingSetupCategory

  label:
    string

  singularLabel:
    string

  description:
    string

  emptyTitle:
    string

  emptyMessage:
    string

  searchPlaceholder:
    string
}


const GROWING_CATEGORIES:
  GrowingCategoryDefinition[] = [
    {
      id:
        'own-mix',

      label:
        'My Recipes',

      singularLabel:
        'My Recipe',

      description:
        'Growing mixes you make yourself.',

      emptyTitle:
        'No recipes here yet',

      emptyMessage:
        'Your own growing mixes will gather here as you create them.',

      searchPlaceholder:
        'Potato mix, seed raising...',
    },

    {
      id:
        'bought-mix',

      label:
        'Bought Mixes',

      singularLabel:
        'Bought Mix',

      description:
        'Commercial growing media bought ready to use.',

      emptyTitle:
        'No bought mixes yet',

      emptyMessage:
        'Commercial growing mixes you save will gather here.',

      searchPlaceholder:
        'Potting mix, seed raising...',
    },

    {
      id:
        'growing-system',

      label:
        'Growing Systems',

      singularLabel:
        'Growing System',

      description:
        'Systems and methods used around the roots.',

      emptyTitle:
        'No growing systems yet',

      emptyMessage:
        'No-dig, wicking beds, hydroponics and other systems will gather here.',

      searchPlaceholder:
        'Wicking bed, Kratky...',
    },

    {
      id:
        'ground-type',

      label:
        'Ground Types',

      singularLabel:
        'Ground Type',

      description:
        'Straight-in-the-ground soil conditions.',

      emptyTitle:
        'No ground types yet',

      emptyMessage:
        'Native soil, clay, loam and other ground conditions will gather here.',

      searchPlaceholder:
        'Clay, loam, native soil...',
    },
  ]


function getCategoryDefinition(
  category:
    GrowingSetupCategory,
):
  GrowingCategoryDefinition {
  return (
    GROWING_CATEGORIES.find(
      item =>
        item.id ===
        category,
    ) ??
    GROWING_CATEGORIES[0]
  )
}


function getCategoryLabel(
  recipe:
    GrowingSetup,
):
  string {
  return getCategoryDefinition(
    recipe.category,
  ).singularLabel
}


function formatDate(
  date?:
    string,
):
  string {
  if (
    !date
  ) {
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
      day:
        'numeric',

      month:
        'short',

      year:
        'numeric',
    },
  )
}


function getRatingStars(
  rating:
    1 |
    2 |
    3 |
    4 |
    5,
):
  string {
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
    'What the Garden Grows In',
  intro =
    'Recipes, bought mixes, growing systems and ground types remembered across your garden.',
  emptyTitle,
  emptyMessage,
  showArchivedStatus =
    false,
  initialCategory =
    'all',
  onCategoryChange,
}: GrowingRecipesProps) {

  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState(
      '',
    )


  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<
      GrowingCategoryFilter
    >(
      initialCategory,
    )


  useEffect(
    () => {
      setSelectedCategory(
        initialCategory,
      )

      setSearchTerm(
        '',
      )
    },
    [
      initialCategory,
    ],
  )


  function chooseCategory(
    category:
      GrowingCategoryFilter,
  ) {
    setSelectedCategory(
      category,
    )

    setSearchTerm(
      '',
    )

    onCategoryChange?.(
      category,
    )
  }


  const activeDefinition =
    selectedCategory ===
      'all'
      ? null
      : getCategoryDefinition(
          selectedCategory,
        )


  const visibleTitle =
    activeDefinition
      ? activeDefinition.label
      : title


  const visibleIntro =
    activeDefinition
      ? activeDefinition.description
      : intro


  const filteredRecipes =
    useMemo(
      () => {
        const query =
          searchTerm
            .trim()
            .toLowerCase()


        const categoryRecipes =
          selectedCategory ===
            'all'
            ? recipes
            : recipes.filter(
                recipe =>
                  recipe.category ===
                  selectedCategory,
              )


        const sorted =
          [...categoryRecipes]
            .sort(
              (
                first,
                second,
              ) => {
                const favouriteDifference =
                  Number(
                    Boolean(
                      second.isFavourite,
                    ),
                  ) -
                  Number(
                    Boolean(
                      first.isFavourite,
                    ),
                  )


                if (
                  favouriteDifference !==
                  0
                ) {
                  return favouriteDifference
                }


                const ratingDifference =
                  (
                    second.rating ??
                    0
                  ) -
                  (
                    first.rating ??
                    0
                  )


                if (
                  ratingDifference !==
                  0
                ) {
                  return ratingDifference
                }


                return first.name.localeCompare(
                  second.name,
                )
              },
            )


        if (
          !query
        ) {
          return sorted
        }


        return sorted.filter(
          recipe => {
            const searchable =
              [
                recipe.name,
                getCategoryLabel(
                  recipe,
                ),
                recipe.brand,
                recipe.productName,
                recipe.groundType,
                recipe.growingSystemType,
                recipe.notes,
              ]
                .filter(
                  Boolean,
                )
                .join(
                  ' ',
                )
                .toLowerCase()


            return searchable.includes(
              query,
            )
          },
        )
      },
      [
        recipes,
        searchTerm,
        selectedCategory,
      ],
    )


  const resolvedArchivedButtonLabel =
    archivedButtonLabel ??
    (
      archivedCount ===
      1
        ? 'View 1 Archived Growing Record'
        : `View ${archivedCount} Archived Growing Records`
    )


  const resolvedEmptyTitle =
    searchTerm.trim()
      ? 'Nothing found'
      : activeDefinition
        ? activeDefinition.emptyTitle
        : emptyTitle ??
          'A fresh page'


  const resolvedEmptyMessage =
    searchTerm.trim()
      ? `Sprig couldn't find anything matching "${searchTerm}".`
      : activeDefinition
        ? activeDefinition.emptyMessage
        : emptyMessage ??
          'Your saved growing records will gather here.'


  const searchPlaceholder =
    activeDefinition
      ? activeDefinition
          .searchPlaceholder
      : 'Recipe, mix, clay, Kratky...'


  const createLabel =
    activeDefinition
      ? `+ New ${activeDefinition.singularLabel}`
      : '+ Add Growing Setup'


  return (
    <GardenLayout
      activePage="library"
      onNavigate={
        onNavigate
      }
    >
      <div className="journal-page">

        {!showArchivedStatus && (
          <div
            style={{
              display:
                'flex',

              gap:
                '0.65rem',

              flexWrap:
                'wrap',

              marginBottom:
                '1rem',
            }}
          >
            <button
              type="button"
              className="record-action-button"
              onClick={
                () =>
                  onNavigate(
                    'growing-places',
                  )
              }
            >
              ← Back to Growing
            </button>

            <button
              type="button"
              className="record-action-button"
              onClick={
                () =>
                  onNavigate(
                    'growing-places',
                  )
              }
            >
              Growing Home
            </button>
          </div>
        )}


        <header className="journal-header">
          <div>
            <p className="section-label">
              Growing · What
            </p>

            <h1>
              {visibleTitle}
            </h1>

            <p className="journal-intro">
              {visibleIntro}
            </p>
          </div>


          {!showArchivedStatus && (
            <button
              type="button"
              className="journal-add-button"
              onClick={
                onAddRecipe
              }
            >
              {createLabel}
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
              {
                resolvedArchivedButtonLabel
              }
            </button>
          )}
        </header>


        {!showArchivedStatus && (
          <section className="story-section">

            <p className="section-label">
              Browse by kind
            </p>


            <div
              style={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '1rem',

                overflowX:
                  'auto',

                padding:
                  '0.35rem 0 0.65rem',

                WebkitOverflowScrolling:
                  'touch',
              }}
            >
              <button
                type="button"
                onClick={
                  () =>
                    chooseCategory(
                      'all',
                    )
                }
                style={{
                  flex:
                    '0 0 auto',

                  border:
                    '0',

                  borderBottom:
                    selectedCategory ===
                    'all'
                      ? '2px solid currentColor'
                      : '2px solid transparent',

                  background:
                    'transparent',

                  padding:
                    '0.45rem 0',

                  cursor:
                    'pointer',

                  font:
                    'inherit',

                  fontWeight:
                    selectedCategory ===
                    'all'
                      ? 700
                      : 500,

                  color:
                    'inherit',

                  whiteSpace:
                    'nowrap',
                }}
              >
                Everything
              </button>


              {GROWING_CATEGORIES.map(
                category => (
                  <button
                    key={
                      category.id
                    }
                    type="button"
                    onClick={
                      () =>
                        chooseCategory(
                          category.id,
                        )
                    }
                    style={{
                      flex:
                        '0 0 auto',

                      border:
                        '0',

                      borderBottom:
                        selectedCategory ===
                        category.id
                          ? '2px solid currentColor'
                          : '2px solid transparent',

                      background:
                        'transparent',

                      padding:
                        '0.45rem 0',

                      cursor:
                        'pointer',

                      font:
                        'inherit',

                      fontWeight:
                        selectedCategory ===
                        category.id
                          ? 700
                          : 500,

                      color:
                        'inherit',

                      whiteSpace:
                        'nowrap',
                    }}
                  >
                    {category.label}
                  </button>
                ),
              )}
            </div>
          </section>
        )}


        {!showArchivedStatus &&
          onShowArchived &&
          archivedCount >
          0 && (
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


        <section className="sprig-form-section">
          <label>
            Search

            <input
              type="search"
              value={
                searchTerm
              }
              onChange={
                event =>
                  setSearchTerm(
                    event.target.value,
                  )
              }
              placeholder={
                showArchivedStatus
                  ? 'Search the archive...'
                  : searchPlaceholder
              }
            />
          </label>
        </section>


        <section>

          {filteredRecipes.length ===
            0 && (
            <div
              style={{
                padding:
                  '1rem 0',
              }}
            >
              <p className="section-label">
                {
                  activeDefinition
                    ? activeDefinition.label
                    : 'Growing'
                }
              </p>

              <h2>
                {resolvedEmptyTitle}
              </h2>

              <p>
                {resolvedEmptyMessage}
              </p>


              {!showArchivedStatus &&
                !searchTerm.trim() && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    onAddRecipe
                  }
                >
                  {createLabel}
                </button>
              )}
            </div>
          )}


          {filteredRecipes.map(
            recipe => {
              const category =
                getCategoryDefinition(
                  recipe.category,
                )


              return (
                <button
                  key={
                    recipe.id
                  }
                  type="button"
                  onClick={
                    () =>
                      onOpenRecipe(
                        recipe.id,
                      )
                  }
                  style={{
                    width:
                      '100%',

                    display:
                      'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'space-between',

                    gap:
                      '1rem',

                    padding:
                      '1rem 0',

                    border:
                      '0',

                    borderBottom:
                      '1px solid rgba(72, 71, 56, 0.18)',

                    background:
                      'transparent',

                    cursor:
                      'pointer',

                    textAlign:
                      'left',

                    font:
                      'inherit',

                    color:
                      'inherit',
                  }}
                >
                  <span
                    style={{
                      minWidth:
                        0,

                      flex:
                        '1 1 auto',
                    }}
                  >
                    <span
                      className="section-label"
                      style={{
                        display:
                          'block',
                      }}
                    >
                      {
                        showArchivedStatus
                          ? `Archived ${category.singularLabel}`
                          : category.singularLabel
                      }
                    </span>

                    <strong
                      style={{
                        display:
                          'block',

                        overflowWrap:
                          'anywhere',
                      }}
                    >
                      {
                        recipe.isFavourite
                          ? '★ '
                          : ''
                      }
                      {recipe.name}
                    </strong>


                    {recipe.rating && (
                      <span
                        style={{
                          display:
                            'block',

                          marginTop:
                            '0.2rem',
                        }}
                        aria-label={`${recipe.rating} out of 5 stars`}
                      >
                        {
                          getRatingStars(
                            recipe.rating,
                          )
                        }
                      </span>
                    )}


                    <span
                      className="form-whisper"
                      style={{
                        display:
                          'block',

                        marginTop:
                          '0.2rem',
                      }}
                    >
                      Added{' '}
                      {
                        formatDate(
                          recipe.createdAt,
                        )
                      }
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    style={{
                      flex:
                        '0 0 auto',

                      fontSize:
                        '1.15rem',
                    }}
                  >
                    →
                  </span>
                </button>
              )
            },
          )}

        </section>


        {!showArchivedStatus && (
          <div
            style={{
              display:
                'flex',

              gap:
                '0.65rem',

              flexWrap:
                'wrap',

              marginTop:
                '1.5rem',
            }}
          >
            <button
              type="button"
              className="record-action-button"
              onClick={
                () =>
                  onNavigate(
                    'growing-places',
                  )
              }
            >
              ← Back to Growing
            </button>

            <button
              type="button"
              className="record-action-button"
              onClick={
                () =>
                  onNavigate(
                    'growing-places',
                  )
              }
            >
              Growing Home
            </button>
          </div>
        )}

      </div>
    </GardenLayout>
  )
}