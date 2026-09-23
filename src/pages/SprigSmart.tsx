import {
  useMemo,
  useState,
} from 'react'

import FunctionPageTemplate
  from '../components/templates/FunctionPageTemplate'

import type {
  GardenData,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'

import {
  buildSprigInsights,
  getSprigInsightFamilyLabel,
  getSprigInsightStrengthDescription,
  getSprigInsightStrengthLabel,
  getSprigSmartInsights,
  type SprigEvidenceStrength,
  type SprigInsight,
  type SprigInsightAction,
  type SprigInsightFamily,
} from '../utils/sprigInsights'

import {
  exportSprigSmartDocx,
} from '../utils/sprigSmartDocx'


import { printDocument } from '../utils/exportUtils'

interface SprigSmartProps {
  gardenData: GardenData

  onBack?: () => void

  onNavigate?: (
    page: AppPage,
  ) => void

  onOpenPlant?: (
    plantStoryId: string,
  ) => void

  onComparePlants?: (
    plantStoryIds: string[],
  ) => void

  onOpenTrial?: (
    gardenTrialId: string,
  ) => void

  onOpenGallery?: () => void

  onOpenCalendar?: () => void

  onOpenHarvests?: () => void

  onOpenJournal?: () => void
}


type SprigSmartView =
  | 'curated'
  | 'all'


type FamilyFilter =
  | 'all'
  | SprigInsightFamily


type StrengthFilter =
  | 'all'
  | SprigEvidenceStrength


interface SprigSmartSection {
  id: string

  title: string

  description: string

  families:
    SprigInsightFamily[]
}


const SMART_SECTIONS:
  SprigSmartSection[] = [
    {
      id:
        'worth-noticing',

      title:
        'Worth noticing now',

      description:
        'A small selection of things in your garden that may deserve your attention.',

      families: [
        'happening-now',
        'worth-watching',
      ],
    },

    {
      id:
        'from-your-garden',

      title:
        'From your garden',

      description:
        'Useful things Sprig is beginning to learn from your own growing history.',

      families: [
        'from-your-garden',
        'milestone',
      ],
    },

    {
      id:
        'useful-comparisons',

      title:
        'Useful comparisons',

      description:
        'Stories that may be worth looking at together because something meaningful differs between them.',

      families: [
        'comparison',
      ],
    },

    {
      id:
        'photographs',

      title:
        'Stories you can see',

      description:
        'Photographic history that may help you revisit how a story changed over time.',

      families: [
        'photographs',
      ],
    },

    {
      id:
        'trials',

      title:
        'Garden Trials',

      description:
        'Trials with enough recorded evidence to be worth revisiting.',

      families: [
        'trial',
      ],
    },
  ]


const FAMILY_FILTERS:
  {
    value:
      FamilyFilter

    label:
      string
  }[] = [
    {
      value:
        'all',

      label:
        'All kinds',
    },

    {
      value:
        'happening-now',

      label:
        'Happening now',
    },

    {
      value:
        'worth-watching',

      label:
        'Worth watching',
    },

    {
      value:
        'from-your-garden',

      label:
        'From your garden',
    },

    {
      value:
        'milestone',

      label:
        'Milestones',
    },

    {
      value:
        'comparison',

      label:
        'Comparisons',
    },

    {
      value:
        'photographs',

      label:
        'Photographs',
    },

    {
      value:
        'trial',

      label:
        'Garden Trials',
    },

    {
      value:
        'garden-maths',

      label:
        'Garden maths',
    },
  ]


const STRENGTH_FILTERS:
  {
    value:
      StrengthFilter

    label:
      string
  }[] = [
    {
      value:
        'all',

      label:
        'All evidence strengths',
    },

    {
      value:
        'individual',

      label:
        'Just noticed',
    },

    {
      value:
        'worth-watching',

      label:
        'Worth watching',
    },

    {
      value:
        'emerging',

      label:
        'Emerging pattern',
    },

    {
      value:
        'repeated',

      label:
        'Repeated in your garden',
    },
  ]


function getSectionInsights(
  insights:
    SprigInsight[],

  section:
    SprigSmartSection,
):
  SprigInsight[] {
  return insights.filter(
    insight =>
      section.families.includes(
        insight.family,
      ),
  )
}


function insightMatchesSearch(
  insight:
    SprigInsight,

  searchQuery:
    string,
): boolean {
  const query =
    searchQuery
      .trim()
      .toLocaleLowerCase()

  if (!query) {
    return true
  }

  const searchableText = [
    insight.title,
    insight.message,
    insight.reasoning,
    insight.eyebrow,
    insight.subjectKey,
    getSprigInsightFamilyLabel(
      insight.family,
    ),
    getSprigInsightStrengthLabel(
      insight.strength,
    ),
    ...insight.evidence.flatMap(
      evidence => [
        evidence.label,
        evidence.detail,
        evidence.recordType,
      ],
    ),
  ]
    .filter(
      (
        value,
      ): value is string =>
        Boolean(
          value,
        ),
    )
    .join(
      ' ',
    )
    .toLocaleLowerCase()

  return searchableText.includes(
    query,
  )
}


function filterInsights(
  insights:
    SprigInsight[],

  searchQuery:
    string,

  familyFilter:
    FamilyFilter,

  strengthFilter:
    StrengthFilter,
):
  SprigInsight[] {
  return insights.filter(
    insight => {
      if (
        familyFilter !==
          'all' &&
        insight.family !==
          familyFilter
      ) {
        return false
      }

      if (
        strengthFilter !==
          'all' &&
        insight.strength !==
          strengthFilter
      ) {
        return false
      }

      return insightMatchesSearch(
        insight,
        searchQuery,
      )
    },
  )
}


function runInsightAction(
  action:
    SprigInsightAction,

  props:
    SprigSmartProps,
): void {
  switch (
    action.type
  ) {
    case 'open-plant':
      if (
        action.plantStoryId
      ) {
        props.onOpenPlant?.(
          action.plantStoryId,
        )
      }

      return


    case 'compare-plants':
      if (
        action.plantStoryIds &&
        action.plantStoryIds
          .length >
          1
      ) {
        props.onComparePlants?.(
          action.plantStoryIds,
        )
      }

      return


    case 'open-trial':
      if (
        action.gardenTrialId
      ) {
        props.onOpenTrial?.(
          action.gardenTrialId,
        )
      }

      return


    case 'open-gallery':
      props.onOpenGallery?.()

      return


    case 'open-calendar':
      props.onOpenCalendar?.()

      return


    case 'open-harvests':
      props.onOpenHarvests?.()

      return


    case 'open-journal':
      props.onOpenJournal?.()

      return


    case 'none':
    default:
      return
  }
}


function InsightCard({
  insight,
  props,
}: {
  insight:
    SprigInsight

  props:
    SprigSmartProps
}) {
  const strengthLabel =
    getSprigInsightStrengthLabel(
      insight.strength,
    )

  const strengthDescription =
    getSprigInsightStrengthDescription(
      insight.strength,
    )

  const familyLabel =
    getSprigInsightFamilyLabel(
      insight.family,
    )

  return (
    <article
      className="sprig-smart-insight"
    >
      <div
        className="sprig-smart-insight-heading"
      >
        <div>
          <p
            className="sprig-smart-eyebrow"
          >
            {familyLabel}
          </p>

          <h3>
            {insight.title}
          </h3>
        </div>

        <span
          className={
            `sprig-smart-strength ` +
            `sprig-smart-strength-${insight.strength}`
          }
          title={
            strengthDescription
          }
        >
          {strengthLabel}
        </span>
      </div>

      <p
        className="sprig-smart-message"
      >
        {insight.message}
      </p>

      <details
        className="sprig-smart-why"
      >
        <summary>
          Why Sprig noticed this
        </summary>

        <p>
          {insight.reasoning}
        </p>

        {insight.evidence.length >
          0 && (
          <div
            className="sprig-smart-evidence"
          >
            <p
              className="sprig-smart-evidence-title"
            >
              Evidence
            </p>

            <ul>
              {insight.evidence.map(
                (
                  evidence,
                  index,
                ) => (
                  <li
                    key={
                      `${evidence.recordType}-${evidence.recordId}-${index}`
                    }
                  >
                    <strong>
                      {
                        evidence.label
                      }
                    </strong>

                    {evidence.detail
                      ? ` Â· ${evidence.detail}`
                      : ''}
                  </li>
                ),
              )}
            </ul>

            <p
              className="sprig-smart-strength-note"
            >
              {
                strengthDescription
              }
            </p>
          </div>
        )}
      </details>

      {insight.actions &&
        insight.actions.length >
          0 && (
        <div
          className="sprig-smart-actions"
        >
          {insight.actions
            .filter(
              action =>
                action.type !==
                'none',
            )
            .map(
              (
                action,
                index,
              ) => (
                <button
                  key={
                    `${action.type}-${index}`
                  }
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    runInsightAction(
                      action,
                      props,
                    )
                  }
                >
                  {
                    action.label
                  }
                </button>
              ),
            )}
        </div>
      )}
    </article>
  )
}


export default function SprigSmart(
  props:
    SprigSmartProps,
) {
  const {
    gardenData,
    onBack,
    onNavigate,
  } = props


  const [
    view,
    setView,
  ] =
    useState<
      SprigSmartView
    >(
      'curated',
    )


  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState(
      '',
    )


  const [
    familyFilter,
    setFamilyFilter,
  ] =
    useState<
      FamilyFilter
    >(
      'all',
    )


  const [
    strengthFilter,
    setStrengthFilter,
  ] =
    useState<
      StrengthFilter
    >(
      'all',
    )


  const [
    isExportingDocx,
    setIsExportingDocx,
  ] =
    useState(
      false,
    )


  const result =
    useMemo(
      () =>
        buildSprigInsights(
          gardenData,
        ),
      [
        gardenData,
      ],
    )


  const curatedInsights =
    useMemo(
      () =>
        getSprigSmartInsights(
          result,
          7,
        ),
      [
        result,
      ],
    )


  const sourceInsights =
    view ===
      'curated'
      ? curatedInsights
      : result.insights


  const filteredInsights =
    useMemo(
      () =>
        filterInsights(
          sourceInsights,
          searchQuery,
          familyFilter,
          strengthFilter,
        ),
      [
        sourceInsights,
        searchQuery,
        familyFilter,
        strengthFilter,
      ],
    )


  const visibleSections =
    useMemo(
      () =>
        SMART_SECTIONS
          .map(
            section => ({
              ...section,

              insights:
                getSectionInsights(
                  filteredInsights,
                  section,
                ),
            }),
          )
          .filter(
            section =>
              section.insights
                .length >
              0,
          ),
      [
        filteredInsights,
      ],
    )


  const gardenMathsInsights =
    useMemo(
      () =>
        filteredInsights.filter(
          insight =>
            insight.family ===
            'garden-maths',
        ),
      [
        filteredInsights,
      ],
    )


  const hiddenInsightCount =
    Math.max(
      0,
      result.insights.length -
        curatedInsights.length,
    )


  const usefulBaselineCount =
    result.baselines.filter(
      baseline =>
        baseline.storyCount >
          1 ||
        baseline
          .harvestedStoryCount >
          1 ||
        baseline
          .completedStoryCount >
          1,
    ).length


  const filtersAreActive =
    Boolean(
      searchQuery.trim(),
    ) ||
    familyFilter !==
      'all' ||
    strengthFilter !==
      'all'


  function clearFilters() {
    setSearchQuery(
      '',
    )

    setFamilyFilter(
      'all',
    )

    setStrengthFilter(
      'all',
    )
  }


  function handlePrint() {
    printDocument()
  }


  async function handleExportDocx() {
    if (
      isExportingDocx
    ) {
      return
    }

    setIsExportingDocx(
      true,
    )

    try {
      const reportView =
        view ===
          'curated'
          ? 'Worth bringing forward'
          : 'All observations'

      const activeFilterParts:
        string[] = []

      if (
        searchQuery.trim()
      ) {
        activeFilterParts.push(
          `Search: â€œ${searchQuery.trim()}â€`,
        )
      }

      if (
        familyFilter !==
        'all'
      ) {
        activeFilterParts.push(
          `Kind: ${
            getSprigInsightFamilyLabel(
              familyFilter,
            )
          }`,
        )
      }

      if (
        strengthFilter !==
        'all'
      ) {
        activeFilterParts.push(
          `Evidence: ${
            getSprigInsightStrengthLabel(
              strengthFilter,
            )
          }`,
        )
      }

      const filterDescription =
        activeFilterParts.length >
        0
          ? ` ${activeFilterParts.join(
              ' Â· ',
            )}.`
          : ''

      await exportSprigSmartDocx({
        gardenData,

        insights:
          filteredInsights,

        reportTitle:
          'Sprig Intelligence Report',

        reportSubtitle:
          `${reportView}.${filterDescription}`,
      })
    } catch (
      error
    ) {
      console.error(
        'Sprig Smart DOCX export failed:',
        error,
      )

      window.alert(
        'Sprig could not create the DOCX report. Your garden records have not been changed.',
      )
    } finally {
      setIsExportingDocx(
        false,
      )
    }
  }


  const handleNavigate =
    onNavigate ??
    (() => {
      /*
       * App.tsx supplies the real
       * navigator.
       */
    })


  return (
    <FunctionPageTemplate
      activePage="sprig-smart"
      onNavigate={handleNavigate}
      pageId="sprig-smart-top"
      className="garden-category-page sprig-smart-page"
      journeyBackLabel="Back"
      onJourneyBack={onBack}
      homeLabel="Today"
      onHome={() => handleNavigate('gate')}
      navigationAriaLabel="Sprig Smart navigation"
      eyebrow="Garden intelligence"
      title="Sprig Smart"
      intro={<><p className="sprig-smart-intro">Useful things Sprig is beginning to notice from your own garden.</p><p className="sprig-smart-intro-detail">Sprig looks across connected Plant Stories, Journal moments, Harvests, photographs, Trials and growing relationships. It keeps the quieter calculations underneath and brings forward only the things that may be useful to you.</p></>}
      headerActions={
        <>
          <button
            type="button"
            className="secondary-button"
            onClick={handlePrint}
          >
            Print / PDF
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={handleExportDocx}
            disabled={isExportingDocx}
          >
            {isExportingDocx
              ? 'Preparing DOCX…'
              : 'DOCX'}
          </button>
        </>
      }
    >
        <section
          className="sprig-smart-overview"
          aria-label="Sprig Smart overview"
        >
          <div
            className="sprig-smart-overview-main"
          >
            <p
              className="sprig-smart-overview-number"
            >
              {
                curatedInsights.length
              }
            </p>

            <p>
              {curatedInsights.length ===
              1
                ? 'thing worth bringing forward'
                : 'things worth bringing forward'}
            </p>
          </div>

          <div
            className="sprig-smart-overview-details"
          >
            <div>
              <strong>
                {
                  result.insights
                    .length
                }
              </strong>

              <span>
                observations
                underneath
              </span>
            </div>

            <div>
              <strong>
                {
                  result.baselines
                    .length
                }
              </strong>

              <span>
                garden histories
                remembered
              </span>
            </div>

            <div>
              <strong>
                {
                  usefulBaselineCount
                }
              </strong>

              <span>
                histories beginning
                to compare
              </span>
            </div>

            <div>
              <strong>
                {
                  hiddenInsightCount
                }
              </strong>

              <span>
                quieter observations
                kept underneath
              </span>
            </div>
          </div>
        </section>


        <section
          className="sprig-smart-section"
          aria-label="Explore Sprig Intelligence"
        >
          <div
            className="sprig-smart-section-heading"
          >
            <div>
              <h2>
                Explore what Sprig
                remembers
              </h2>

              <p>
                Keep the calm curated
                view, or search through
                everything Sprig has
                derived underneath.
              </p>
            </div>
          </div>


          <div
            className="sprig-smart-actions"
          >
            <button
              type="button"
              className={
                view ===
                  'curated'
                  ? 'primary-button'
                  : 'secondary-button'
              }
              onClick={() =>
                setView(
                  'curated',
                )
              }
            >
              Worth bringing forward
            </button>

            <button
              type="button"
              className={
                view ===
                  'all'
                  ? 'primary-button'
                  : 'secondary-button'
              }
              onClick={() =>
                setView(
                  'all',
                )
              }
            >
              All observations
            </button>
          </div>


          <div
            className="sprig-smart-filters"
          >
            <label>
              <span>
                Search observations
              </span>

              <input
                type="search"
                value={
                  searchQuery
                }
                onChange={
                  event =>
                    setSearchQuery(
                      event.target.value,
                    )
                }
                placeholder="Search potato, aphids, Royal Blue, harvestâ€¦"
              />
            </label>


            <label>
              <span>
                Kind
              </span>

              <select
                value={
                  familyFilter
                }
                onChange={
                  event =>
                    setFamilyFilter(
                      event.target
                        .value as
                        FamilyFilter,
                    )
                }
              >
                {FAMILY_FILTERS.map(
                  option => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              <span>
                Evidence
              </span>

              <select
                value={
                  strengthFilter
                }
                onChange={
                  event =>
                    setStrengthFilter(
                      event.target
                        .value as
                        StrengthFilter,
                    )
                }
              >
                {STRENGTH_FILTERS.map(
                  option => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>


            {filtersAreActive && (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  clearFilters
                }
              >
                Clear filters
              </button>
            )}
          </div>


          <p
            className="sprig-smart-intro-detail"
          >
            Showing{' '}
            <strong>
              {
                filteredInsights.length
              }
            </strong>{' '}
            {filteredInsights.length ===
            1
              ? 'observation'
              : 'observations'}
            {view ===
            'curated'
              ? ' from Sprigâ€™s curated view.'
              : ` from ${result.insights.length} observations underneath.`}
          </p>
        </section>


        <div
          className="sprig-smart-principle"
        >
          <p>
            <strong>
              Your records remain the
              truth.
            </strong>{' '}
            Sprig Smart interprets
            relationships between them.
            It does not turn a
            correlation into a cause,
            and missing evidence stays
            missing.
          </p>
        </div>


        {filteredInsights.length ===
        0 ? (
          <section
            className="sprig-smart-empty"
          >
            <h2>
              {filtersAreActive
                ? 'Nothing matches those filters.'
                : 'Sprig is still gathering the story.'}
            </h2>

            {filtersAreActive ? (
              <>
                <p>
                  Sprig has not found
                  an observation matching
                  that combination yet.
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    clearFilters
                  }
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <p>
                  There are records in
                  your garden, but nothing
                  has become useful enough
                  to interrupt you with yet.
                </p>

                <p>
                  Keep using Plant Stories,
                  Journal, Harvests,
                  photographs and Trials
                  normally. Sprig can learn
                  from those relationships
                  without asking you to
                  manufacture extra data.
                </p>

                <p
                  className="sprig-smart-empty-note"
                >
                  Sprig will not invent an
                  answer simply because the
                  evidence is not there yet.
                </p>
              </>
            )}
          </section>
        ) : (
          <div
            className="sprig-smart-sections"
          >
            {visibleSections.map(
              section => (
                <section
                  key={
                    section.id
                  }
                  className="sprig-smart-section"
                >
                  <div
                    className="sprig-smart-section-heading"
                  >
                    <div>
                      <h2>
                        {
                          section.title
                        }
                      </h2>

                      <p>
                        {
                          section.description
                        }
                      </p>
                    </div>

                    <span
                      className="sprig-smart-section-count"
                    >
                      {
                        section
                          .insights
                          .length
                      }{' '}
                      {section
                        .insights
                        .length ===
                      1
                        ? 'observation'
                        : 'observations'}
                    </span>
                  </div>

                  <div
                    className="sprig-smart-insight-list"
                  >
                    {section.insights.map(
                      insight => (
                        <InsightCard
                          key={
                            insight.id
                          }
                          insight={
                            insight
                          }
                          props={
                            props
                          }
                        />
                      ),
                    )}
                  </div>
                </section>
              ),
            )}


            {gardenMathsInsights.length >
              0 && (
              <section
                className="sprig-smart-section"
              >
                <div
                  className="sprig-smart-section-heading"
                >
                  <div>
                    <h2>
                      Garden maths
                    </h2>

                    <p>
                      Useful calculations
                      Sprig normally keeps
                      quietly underneath.
                    </p>
                  </div>

                  <span
                    className="sprig-smart-section-count"
                  >
                    {
                      gardenMathsInsights.length
                    }{' '}
                    {gardenMathsInsights.length ===
                    1
                      ? 'observation'
                      : 'observations'}
                  </span>
                </div>

                <div
                  className="sprig-smart-insight-list"
                >
                  {gardenMathsInsights.map(
                    insight => (
                      <InsightCard
                        key={
                          insight.id
                        }
                        insight={
                          insight
                        }
                        props={
                          props
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            )}
          </div>
        )}


        <section
          className="sprig-smart-baselines"
        >
          <div
            className="sprig-smart-section-heading"
          >
            <div>
              <h2>
                Garden memory
              </h2>

              <p>
                The quieter history
                Sprig keeps underneath
                its observations.
              </p>
            </div>

            <span
              className="sprig-smart-section-count"
            >
              {
                result.baselines.length
              }{' '}
              {result.baselines.length ===
              1
                ? 'plant history'
                : 'plant histories'}
            </span>
          </div>

          <p
            className="sprig-smart-intro-detail"
          >
            Sprig is building timing
            and outcome history from
            your saved Plant Stories.
            It will bring those
            histories forward when
            there is something useful
            to compare, rather than
            listing every calculation
            here.
          </p>
        </section>      </FunctionPageTemplate>
  )
}
