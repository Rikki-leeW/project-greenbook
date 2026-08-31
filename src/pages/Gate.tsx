import {
  useMemo,
} from 'react'

import GardenLayout from '../components/layout/GardenLayout'

import sprigWave from '../images/sprig/sprig-wave.png'

import woodlandFrame from '../images/backgrounds/woodland-frame.png'

import type {
  GardenData,
  GardenPlan,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'

import {
  buildSprigInsights,
  getSprigInsightStrengthDescription,
  getSprigInsightStrengthLabel,
  getSprigTodayInsights,
  type SprigInsight,
  type SprigInsightAction,
  type SprigInsightEvidence,
} from '../utils/sprigInsights'

import '../css/gate-intelligence.css'


/* =======================================
   PROPS
======================================= */

interface GateProps {
  gardenData:
    GardenData

  onOpenPlant:
    (
      plantId:
        string,
    ) => void

  onOpenTrial:
    (
      trialId:
        string,
    ) => void

  onComparePlants:
    (
      plantIds:
        string[],
    ) => void

  onOpenPlan:
    (
      planId:
        string,
      date:
        string,
    ) => void

  onAddPlant:
    () => void

  onAddEntry:
    () => void

  onNavigate:
    (
      page:
        AppPage,
    ) => void
}


/* =======================================
   LOCAL DATE HELPERS
======================================= */

function getLocalDateKey(
  date:
    Date,
):
  string {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() +
      1,
    ).padStart(
      2,
      '0',
    )

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      '0',
    )

  return `${year}-${month}-${day}`
}


function parseLocalDate(
  value:
    string,
):
  Date | null {
  const parts =
    value
      .slice(
        0,
        10,
      )
      .split(
        '-',
      )
      .map(
        Number,
      )


  const year =
    parts[0]

  const month =
    parts[1]

  const day =
    parts[2]


  if (
    !year ||
    !month ||
    !day
  ) {
    return null
  }


  const date =
    new Date(
      year,
      month - 1,
      day,
    )


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null
  }


  return date
}


function formatPlanDate(
  value:
    string,
):
  string {
  const date =
    parseLocalDate(
      value,
    )


  if (
    !date
  ) {
    return value
  }


  const today =
    new Date()

  today.setHours(
    0,
    0,
    0,
    0,
  )


  const tomorrow =
    new Date(
      today,
    )

  tomorrow.setDate(
    tomorrow.getDate() +
    1,
  )


  if (
    getLocalDateKey(
      date,
    ) ===
    getLocalDateKey(
      today,
    )
  ) {
    return 'Today'
  }


  if (
    getLocalDateKey(
      date,
    ) ===
    getLocalDateKey(
      tomorrow,
    )
  ) {
    return 'Tomorrow'
  }


  const difference =
    Math.round(
      (
        date.getTime() -
        today.getTime()
      ) /
      (
        1000 *
        60 *
        60 *
        24
      ),
    )


  if (
    difference >
      1 &&
    difference <
      7
  ) {
    return date.toLocaleDateString(
      'en-AU',
      {
        weekday:
          'long',
      },
    )
  }


  return date.toLocaleDateString(
    'en-AU',
    {
      day:
        'numeric',

      month:
        'short',

      year:
        date.getFullYear() !==
        today.getFullYear()
          ? 'numeric'
          : undefined,
    },
  )
}


/* =======================================
   GREETING
======================================= */

function getGreeting():
  string {
  const hour =
    new Date()
      .getHours()


  if (
    hour <
    12
  ) {
    return 'Good morning'
  }


  if (
    hour <
    17
  ) {
    return 'Good afternoon'
  }


  return 'Good evening'
}


/* =======================================
   PLAN DISPLAY
======================================= */

function getPlanIcon(
  plan:
    GardenPlan,
):
  string {
  switch (
    plan.kind
  ) {
    case 'sow':
      return '🌱'

    case 'plant':
      return '🌿'

    case 'plant-out':
      return '🪴'

    case 'move':
      return '↗️'

    case 'feed':
      return '🥄'

    case 'treat':
      return '🩹'

    case 'harvest':
      return '🧺'

    case 'buy':
      return '🛒'

    case 'garden-task':
      return '🧤'

    default:
      return '🍃'
  }
}


function getUpcomingPlans(
  gardenData:
    GardenData,
):
  GardenPlan[] {
  const todayKey =
    getLocalDateKey(
      new Date(),
    )


  return (
    gardenData.plans ??
    []
  )
    .filter(
      plan =>
        plan.status ===
          'planned' &&
        Boolean(
          plan.date,
        ) &&
        plan.date >=
          todayKey,
    )
    .sort(
      (
        left,
        right,
      ) =>
        left.date.localeCompare(
          right.date,
        ),
    )
    .slice(
      0,
      3,
    )
}


/* =======================================
   GARDEN MEMORY
======================================= */

function gardenHasStarted(
  gardenData:
    GardenData,
):
  boolean {
  return (
    gardenData
      .plantStories
      .length >
      0 ||
    gardenData
      .events
      .length >
      0 ||
    gardenData
      .harvests
      .length >
      0 ||
    gardenData
      .growingPlaces
      .length >
      0 ||
    (
      gardenData.plans ??
      []
    ).length >
      0 ||
    (
      gardenData
        .gardenTrials ??
      []
    ).length >
      0 ||
    (
      gardenData
        .gardenNotes ??
      []
    ).length >
      0 ||
    (
      gardenData
        .plantReferences ??
      []
    ).length >
      0 ||
    (
      gardenData
        .savedKnowledgeSources ??
      []
    ).length >
      0 ||
    (
      gardenData
        .galleryPhotos ??
      []
    ).length >
      0
  )
}


/* =======================================
   INSIGHT SELECTION
======================================= */

function chooseTodayInsights(
  allInsights:
    ReturnType<
      typeof buildSprigInsights
    >,
):
  SprigInsight[] {
  const initial =
    getSprigTodayInsights(
      allInsights,
      6,
    )


  const moreInteresting =
    initial.filter(
      insight =>
        insight.family !==
        'garden-maths',
    )


  const gardenMaths =
    initial.find(
      insight =>
        insight.family ===
        'garden-maths',
    )


  const result =
    moreInteresting.slice(
      0,
      3,
    )


  /*
   * If Sprig has very little else to say,
   * one useful bit of garden maths is welcome.
   *
   * We deliberately do not fill Today with
   * three cards saying three plants are
   * different ages.
   */

  if (
    result.length <
      2 &&
    gardenMaths
  ) {
    result.push(
      gardenMaths,
    )
  }


  return result.slice(
    0,
    3,
  )
}


/* =======================================
   COMPONENT
======================================= */

export default function Gate({
  gardenData,

  onOpenPlant,

  onOpenTrial,

  onComparePlants,

  onOpenPlan,

  onAddPlant,

  onAddEntry,

  onNavigate,
}: GateProps) {
  const intelligence =
    useMemo(
      () =>
        buildSprigInsights(
          gardenData,
        ),
      [
        gardenData,
      ],
    )


  const todayInsights =
    useMemo(
      () =>
        chooseTodayInsights(
          intelligence,
        ),
      [
        intelligence,
      ],
    )


  const upcomingPlans =
    useMemo(
      () =>
        getUpcomingPlans(
          gardenData,
        ),
      [
        gardenData,
      ],
    )


  const hasStarted =
    gardenHasStarted(
      gardenData,
    )


  function handleInsightAction(
    action:
      SprigInsightAction,
  ) {
    switch (
      action.type
    ) {
      case 'open-plant':
        if (
          action.plantStoryId
        ) {
          onOpenPlant(
            action.plantStoryId,
          )
        }

        return


      case 'compare-plants':
        if (
          action
            .plantStoryIds
            ?.length
        ) {
          onComparePlants(
            action.plantStoryIds,
          )
        }

        return


      case 'open-trial':
        if (
          action.gardenTrialId
        ) {
          onOpenTrial(
            action.gardenTrialId,
          )
        }

        return


      case 'open-gallery':
        onNavigate(
          'garden-gallery',
        )

        return


      case 'open-calendar':
        onNavigate(
          'calendar',
        )

        return


      case 'open-harvests':
        onNavigate(
          'harvest',
        )

        return


      case 'open-journal':
        onNavigate(
          'journal',
        )

        return


      case 'none':
      default:
        return
    }
  }


  function handleEvidenceOpen(
    evidence:
      SprigInsightEvidence,
  ) {
    switch (
      evidence.recordType
    ) {
      case 'plant-story':
        onOpenPlant(
          evidence.recordId,
        )

        return


      case 'garden-trial':
        onOpenTrial(
          evidence.recordId,
        )

        return


      default:
        return
    }
  }


  function evidenceCanOpen(
    evidence:
      SprigInsightEvidence,
  ):
    boolean {
    return (
      evidence.recordType ===
        'plant-story' ||
      evidence.recordType ===
        'garden-trial'
    )
  }


  return (
    <GardenLayout
      activePage="gate"
      onNavigate={
        onNavigate
      }
    >
      <div
        className="garden-page gate-page sprig-today-page"
        style={{
          backgroundImage:
            `url(${woodlandFrame})`,
        }}
      >
        {/* =====================================
            HERO
        ====================================== */}

        <header className="garden-header sprig-today-header">
          <div>
            <p className="app-name">
              Sprig
            </p>

            <h1 className="garden-title">
              {getGreeting()}, Rikki.
            </h1>
          </div>

          <button
            type="button"
            className="keeper-avatar sprig-today-avatar"
            aria-label="Sprig"
          >
            <img
              src={
                sprigWave
              }
              alt=""
              aria-hidden="true"
            />
          </button>
        </header>


        {/* =====================================
            QUICK ACTIONS
        ====================================== */}

        <section
          className="quick-actions"
          aria-label="Quick garden actions"
        >
          <button
            type="button"
            className="quick-action"
            onClick={
              onAddEntry
            }
          >
            <span>
              📖
            </span>

            Journal Entry
          </button>


          <button
            type="button"
            className="quick-action"
            onClick={
              onAddPlant
            }
          >
            <span>
              🌱
            </span>

            Add a plant
          </button>


          <button
            type="button"
            className="quick-action"
            onClick={
              () =>
                onNavigate(
                  'harvest',
                )
            }
          >
            <span>
              🧺
            </span>

            Harvest
          </button>
        </section>


        {/* =====================================
            FIRST GARDEN
        ====================================== */}

        {
          !hasStarted && (
            <section
              className="sprig-first-garden"
              aria-labelledby="sprig-first-garden-title"
            >
              <div className="sprig-first-garden-copy">
                <p className="sprig-today-kicker">
                  🌱 Welcome to your garden
                </p>

                <h2 id="sprig-first-garden-title">
                  We can start anywhere.
                </h2>

                <p>
                  You do not need to set Sprig up
                  perfectly before you use it.
                  Begin with whatever is already
                  happening in your garden.
                </p>
              </div>


              <div className="sprig-first-steps">
                <button
                  type="button"
                  className="sprig-first-step"
                  onClick={
                    onAddPlant
                  }
                >
                  <span className="sprig-first-step-number">
                    1
                  </span>

                  <span>
                    <strong>
                      Add something growing
                    </strong>

                    <small>
                      Give a plant, crop or planting
                      its first Plant Story.
                    </small>
                  </span>
                </button>


                <button
                  type="button"
                  className="sprig-first-step"
                  onClick={
                    onAddEntry
                  }
                >
                  <span className="sprig-first-step-number">
                    2
                  </span>

                  <span>
                    <strong>
                      Record what happens
                    </strong>

                    <small>
                      Photos, changes, weather,
                      problems and little moments
                      can all become part of the
                      garden&apos;s memory.
                    </small>
                  </span>
                </button>


                <button
                  type="button"
                  className="sprig-first-step"
                  onClick={
                    () =>
                      onNavigate(
                        'calendar',
                      )
                  }
                >
                  <span className="sprig-first-step-number">
                    3
                  </span>

                  <span>
                    <strong>
                      Plan what comes next
                    </strong>

                    <small>
                      Calendar &amp; Planning keeps
                      future intentions separate
                      from what actually happened.
                    </small>
                  </span>
                </button>
              </div>


              <div className="sprig-first-garden-note">
                <span aria-hidden="true">
                  🍃
                </span>

                <p>
                  As your records grow, I&apos;ll
                  begin noticing timing,
                  comparisons and patterns from
                  your own garden. I&apos;ll be
                  careful about the difference
                  between something I&apos;ve seen
                  once and something your garden
                  has repeated.
                </p>
              </div>
            </section>
          )
        }


        {/* =====================================
            SPRIG NOTICES
        ====================================== */}

        {
          hasStarted && (
            <section
              className="sprig-notices-section"
              aria-labelledby="sprig-notices-title"
            >
              <div className="sprig-today-section-heading">
                <div>
                  <p className="sprig-today-kicker">
                    From Sprig
                  </p>

                  <h2 id="sprig-notices-title">
  {
    todayInsights.length ===
    1
      ? 'Something caught my eye.'
      : todayInsights.length >
          1
        ? 'A few things caught my eye.'
        : 'I’m getting to know this garden.'
  }
</h2>
                </div>

             
              </div>


              {
                todayInsights.length >
                  0
                  ? (
                    <div className="sprig-notice-list">
                      {
                        todayInsights.map(
                          insight => (
                            <article
                              key={
                                insight.id
                              }
                              className={`sprig-notice-card sprig-notice-${insight.family}`}
                            >
                              <div className="sprig-notice-topline">
                                <p className="sprig-notice-eyebrow">
                                  {
                                    insight.eyebrow
                                  }
                                </p>

                                <span className="sprig-strength-pill">
                                  {
                                    getSprigInsightStrengthLabel(
                                      insight.strength,
                                    )
                                  }
                                </span>
                              </div>


                              <h3>
                                {
                                  insight.title
                                }
                              </h3>


                              <p className="sprig-notice-message">
                                {
                                  insight.message
                                }
                              </p>


                              <details className="sprig-why">
                                <summary>
                                  Why did Sprig notice this?
                                </summary>

                                <div className="sprig-why-content">
                                  <p>
                                    {
                                      insight.reasoning
                                    }
                                  </p>


                                  <p className="sprig-strength-explanation">
                                    <strong>
                                      {
                                        getSprigInsightStrengthLabel(
                                          insight.strength,
                                        )
                                      }:
                                    </strong>{' '}

                                    {
                                      getSprigInsightStrengthDescription(
                                        insight.strength,
                                      )
                                    }
                                  </p>


                                  {
                                    insight
                                      .evidence
                                      .length >
                                      0 && (
                                      <div className="sprig-evidence-list">
                                        <p className="sprig-evidence-heading">
                                          Evidence Sprig used
                                        </p>

                                        {
                                          insight
                                            .evidence
                                            .map(
                                              (
                                                evidence,
                                                index,
                                              ) => {
                                                const canOpen =
                                                  evidenceCanOpen(
                                                    evidence,
                                                  )


                                                if (
                                                  canOpen
                                                ) {
                                                  return (
                                                    <button
                                                      key={`${evidence.recordType}-${evidence.recordId}-${index}`}
                                                      type="button"
                                                      className="sprig-evidence-item sprig-evidence-button"
                                                      onClick={
                                                        () =>
                                                          handleEvidenceOpen(
                                                            evidence,
                                                          )
                                                      }
                                                    >
                                                      <span>
                                                        <strong>
                                                          {
                                                            evidence.label
                                                          }
                                                        </strong>

                                                        {
                                                          evidence.detail && (
                                                            <small>
                                                              {
                                                                evidence.detail
                                                              }
                                                            </small>
                                                          )
                                                        }
                                                      </span>

                                                      <span aria-hidden="true">
                                                        ›
                                                      </span>
                                                    </button>
                                                  )
                                                }


                                                return (
                                                  <div
                                                    key={`${evidence.recordType}-${evidence.recordId}-${index}`}
                                                    className="sprig-evidence-item"
                                                  >
                                                    <span>
                                                      <strong>
                                                        {
                                                          evidence.label
                                                        }
                                                      </strong>

                                                      {
                                                        evidence.detail && (
                                                          <small>
                                                            {
                                                              evidence.detail
                                                            }
                                                          </small>
                                                        )
                                                      }
                                                    </span>
                                                  </div>
                                                )
                                              },
                                            )
                                        }
                                      </div>
                                    )
                                  }


                                  <p className="sprig-caution-note">
                                    Sprig describes what the
                                    records show. A relationship
                                    between records does not, by
                                    itself, prove what caused it.
                                  </p>
                                </div>
                              </details>


                              {
                                insight.actions &&
                                insight
                                  .actions
                                  .length >
                                  0 && (
                                  <div className="sprig-notice-actions">
                                    {
                                      insight
                                        .actions
                                        .map(
                                          (
                                            action,
                                            index,
                                          ) => (
                                            <button
                                              key={`${action.type}-${index}`}
                                              type="button"
                                              className={
                                                index ===
                                                0
                                                  ? 'sprig-notice-primary-action'
                                                  : 'sprig-notice-secondary-action'
                                              }
                                              onClick={
                                                () =>
                                                  handleInsightAction(
                                                    action,
                                                  )
                                              }
                                            >
                                              {
                                                action.label
                                              }
                                            </button>
                                          ),
                                        )
                                    }
                                  </div>
                                )
                              }
                            </article>
                          ),
                        )
                      }
                    </div>
                  )
                  : (
                    <div className="sprig-learning-card">
                      <div
                        className="sprig-learning-leaf"
                        aria-hidden="true"
                      >
                        🌿
                      </div>

                      <div>
                        <h3>
                          There&apos;s nothing I need
                          to wave a leaf at today.
                        </h3>

                        <p>
                          That doesn&apos;t mean the
                          garden is empty. It simply
                          means I don&apos;t have an
                          observation useful enough to
                          put in front of you right now.
                          As more dates, harvests,
                          photos, trials and complete
                          stories gather, I&apos;ll
                          have more of your own garden
                          to compare.
                        </p>
                      </div>
                    </div>
                  )
              }
            </section>
          )
        }


        {/* =====================================
            COMING UP
        ====================================== */}

        {
          upcomingPlans.length >
            0 && (
            <section
              className="sprig-coming-up-section"
              aria-labelledby="sprig-coming-up-title"
            >
              <div className="sprig-today-section-heading">
                <div>
                  <p className="sprig-today-kicker">
                    Calendar &amp; Planning
                  </p>

                  <h2 id="sprig-coming-up-title">
                    Coming up
                  </h2>
                </div>

                <button
                  type="button"
                  className="sprig-today-text-button"
                  onClick={
                    () =>
                      onNavigate(
                        'calendar',
                      )
                  }
                >
                  Calendar
                </button>
              </div>


              <div className="sprig-plan-list">
                {
                  upcomingPlans.map(
                    plan => (
                      <button
                        key={
                          plan.id
                        }
                        type="button"
                        className="sprig-plan-card"
                        onClick={
                          () =>
                            onOpenPlan(
                              plan.id,
                              plan.date,
                            )
                        }
                      >
                        <span
                          className="sprig-plan-icon"
                          aria-hidden="true"
                        >
                          {
                            getPlanIcon(
                              plan,
                            )
                          }
                        </span>

                        <span className="sprig-plan-copy">
                          <small>
                            {
                              formatPlanDate(
                                plan.date,
                              )
                            }
                          </small>

                          <strong>
                            {
                              plan.title
                            }
                          </strong>
                        </span>

                        <span
                          className="sprig-plan-arrow"
                          aria-hidden="true"
                        >
                          ›
                        </span>
                      </button>
                    ),
                  )
                }
              </div>
            </section>
          )
        }


        {/* =====================================
            SIMPLE DESTINATION STRIP
        ====================================== */}

        {
          hasStarted && (
            <section
              className="sprig-garden-shortcuts"
              aria-label="Garden destinations"
            >
              <button
                type="button"
                onClick={
                  () =>
                    onNavigate(
                      'plants',
                    )
                }
              >
                <span>
                  🌱
                </span>

                <span>
                  <strong>
                    Plants
                  </strong>

                  <small>
                    {
                      gardenData
                        .plantStories
                        .length
                    }{' '}
                    {
                      gardenData
                        .plantStories
                        .length ===
                      1
                        ? 'story'
                        : 'stories'
                    }
                  </small>
                </span>
              </button>


              <button
                type="button"
                onClick={
                  () =>
                    onNavigate(
                      'calendar',
                    )
                }
              >
                <span>
                  🗓️
                </span>

                <span>
                  <strong>
                    Calendar
                  </strong>

                  <small>
                    Plans &amp; garden history
                  </small>
                </span>
              </button>


              <button
                type="button"
                onClick={
                  () =>
                    onNavigate(
                      'search',
                    )
                }
              >
                <span>
                  🔎
                </span>

                <span>
                  <strong>
                    Search Sprig
                  </strong>

                  <small>
                    Find anything remembered
                  </small>
                </span>
              </button>
            </section>
          )
        }
      </div>
    </GardenLayout>
  )
}