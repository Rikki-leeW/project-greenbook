import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import FunctionPageTemplate from '../components/templates/FunctionPageTemplate'
import type { GardenData } from '../types'
import type { AppPage } from '../types/navigation'
import {
  buildSprigInsights,
  getSprigInsightFamilyLabel,
  getSprigInsightStrengthDescription,
  getSprigInsightStrengthLabel,
  getSprigSmartInsights,
  type SprigInsight,
  type SprigInsightAction,
} from '../utils/sprigInsights'

interface AskSprigProps {
  gardenData: GardenData
  onNavigate: (page: AppPage) => void
  onBack?: () => void
  onOpenPlant?: (plantStoryId: string) => void
  onComparePlants?: (plantStoryIds: string[]) => void
  onOpenTrial?: (gardenTrialId: string) => void
}

const SUGGESTED_QUESTIONS = [
  'What should I pay attention to this week?',
  'What has worked well in my garden?',
  'What happened last time?',
  'Is anything unusual or worth watching?',
]

const STOP_WORDS = new Set([
  'about', 'anything', 'does', 'garden', 'have', 'from', 'know', 'look',
  'please', 'should', 'show', 'sprig', 'tell', 'that', 'this', 'what',
  'when', 'where', 'which', 'with', 'your',
])

function searchableInsight(insight: SprigInsight): string {
  return [
    insight.title,
    insight.message,
    insight.reasoning,
    insight.subjectKey,
    ...insight.evidence.flatMap(item => [item.label, item.detail]),
  ].filter(Boolean).join(' ').toLowerCase()
}

function chooseAnswer(
  question: string,
  insights: SprigInsight[],
  gardenData: GardenData,
): SprigInsight[] {
  const clean = question.trim().toLowerCase()
  if (!clean) return []

  let preferredFamilies: SprigInsight['family'][] = []

  if (/watch|attention|now|week|today|unusual|wrong|changing/.test(clean)) {
    preferredFamilies = ['happening-now', 'worth-watching', 'comparison']
  } else if (/work|best|better|perform|harvest|successful|again/.test(clean)) {
    preferredFamilies = ['from-your-garden', 'comparison', 'garden-maths', 'trial']
  } else if (/last time|before|previous|history|remember/.test(clean)) {
    preferredFamilies = ['from-your-garden', 'photographs', 'trial', 'milestone']
  } else if (/photo|look|see|picture/.test(clean)) {
    preferredFamilies = ['photographs']
  } else if (/trial|experiment/.test(clean)) {
    preferredFamilies = ['trial']
  }

  const words = clean
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))

  const relevantPlantIds = new Set(
    gardenData.plantStories
      .filter(story => {
        const plantWords = [
          story.displayName,
          story.plantName,
          story.variety,
        ].filter(Boolean).join(' ').toLowerCase()

        return words.some(word => plantWords.includes(word))
      })
      .map(story => story.id),
  )

  return insights
    .map(insight => {
      const haystack = searchableInsight(insight)
      const wordScore = words.reduce(
        (score, word) => score + (haystack.includes(word) ? 3 : 0),
        0,
      )
      const familyScore = preferredFamilies.includes(insight.family) ? 5 : 0
      const subjectScore = relevantPlantIds.size > 0 && (
        insight.plantStoryIds?.some(id => relevantPlantIds.has(id)) ||
        insight.evidence.some(item =>
          item.recordType === 'plant-story' && relevantPlantIds.has(item.recordId),
        )
      ) ? 8 : 0
      const matchScore = wordScore + familyScore + subjectScore
      return { insight, matchScore, score: matchScore * 100 + insight.priority }
    })
    .filter(item => item.matchScore > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, 4)
    .map(item => item.insight)
}

function runAction(action: SprigInsightAction, props: AskSprigProps) {
  switch (action.type) {
    case 'open-plant':
      if (action.plantStoryId) props.onOpenPlant?.(action.plantStoryId)
      return
    case 'compare-plants':
      if (action.plantStoryIds && action.plantStoryIds.length > 1) {
        props.onComparePlants?.(action.plantStoryIds)
      }
      return
    case 'open-trial':
      if (action.gardenTrialId) props.onOpenTrial?.(action.gardenTrialId)
      return
    case 'open-gallery': props.onNavigate('garden-gallery'); return
    case 'open-calendar': props.onNavigate('calendar'); return
    case 'open-harvests': props.onNavigate('harvest'); return
    case 'open-journal': props.onNavigate('journal'); return
    default: return
  }
}

export default function AskSprig(props: AskSprigProps) {
  const [question, setQuestion] = useState('')
  const [askedQuestion, setAskedQuestion] = useState('')
  const result = useMemo(() => buildSprigInsights(props.gardenData), [props.gardenData])
  const answers = useMemo(
    () => chooseAnswer(askedQuestion, result.insights, props.gardenData),
    [askedQuestion, result.insights, props.gardenData],
  )

  function ask(value: string) {
    const next = value.trim()
    if (!next) return
    setQuestion(next)
    setAskedQuestion(next)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    ask(question)
  }

  const startingObservations = getSprigSmartInsights(result, 3)

  return (
    <FunctionPageTemplate
      activePage="ask-sprig"
      onNavigate={props.onNavigate}
      pageId="ask-sprig-top"
      className="sprig-smart-page ask-sprig-page"
      journeyBackLabel="Back"
      onJourneyBack={props.onBack}
      homeLabel="Today"
      onHome={() => props.onNavigate('gate')}
      navigationAriaLabel="Ask Sprig navigation"
      eyebrow="The Garden Keeper"
      title="Ask Sprig"
      intro={<><p className="sprig-smart-intro">Ask what your own garden has been showing you.</p><p className="sprig-smart-intro-detail">Sprig reads the records kept inside Garden of Mine. He does not search the internet, change your records, or invent an answer when the garden has not remembered enough yet.</p></>}
    >
      <section className="ask-sprig-panel" aria-labelledby="ask-sprig-question-label">
        <form onSubmit={submit} className="ask-sprig-form">
          <label id="ask-sprig-question-label" htmlFor="ask-sprig-question">
            What would you like Sprig to look for?
          </label>
          <div className="ask-sprig-entry">
            <input
              id="ask-sprig-question"
              type="search"
              value={question}
              onChange={event => setQuestion(event.target.value)}
              placeholder="For example: What should I watch this week?"
            />
            <button type="submit" className="journal-add-button">Ask Sprig</button>
          </div>
        </form>

        <div className="ask-sprig-suggestions" aria-label="Suggested questions">
          {SUGGESTED_QUESTIONS.map(suggestion => (
            <button key={suggestion} type="button" className="secondary-button" onClick={() => ask(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <section className="ask-sprig-answer" aria-live="polite">
        {askedQuestion ? (
          <>
            <div className="ask-sprig-answer-heading">
              <p className="section-label">Sprig looked through your garden</p>
              <h2>{askedQuestion}</h2>
              <p>{answers.length > 0 ? `I found ${answers.length === 1 ? 'one thing' : `${answers.length} things`} that may help.` : 'I could not find enough recorded evidence to answer that yet.'}</p>
            </div>
            {answers.length > 0 ? (
              <div className="sprig-smart-insight-list">
                {answers.map(insight => (
                  <article className="sprig-smart-insight" key={insight.id}>
                    <div className="sprig-smart-insight-heading">
                      <div><p className="sprig-smart-eyebrow">{getSprigInsightFamilyLabel(insight.family)}</p><h3>{insight.title}</h3></div>
                      <span className={`sprig-smart-strength sprig-smart-strength-${insight.strength}`} title={getSprigInsightStrengthDescription(insight.strength)}>{getSprigInsightStrengthLabel(insight.strength)}</span>
                    </div>
                    <p className="sprig-smart-message">{insight.message}</p>
                    <details className="sprig-smart-why">
                      <summary>Why Sprig thinks this may help</summary>
                      <p>{insight.reasoning}</p>
                      {insight.evidence.length > 0 && <div className="sprig-smart-evidence"><p className="sprig-smart-evidence-title">Garden evidence</p><ul>{insight.evidence.map((item, index) => <li key={`${item.recordType}-${item.recordId}-${index}`}><strong>{item.label}</strong>{item.detail ? ` · ${item.detail}` : ''}</li>)}</ul></div>}
                    </details>
                    {insight.actions?.some(action => action.type !== 'none') && <div className="sprig-smart-actions">{insight.actions.filter(action => action.type !== 'none').map((action, index) => <button key={`${action.type}-${index}`} type="button" className="secondary-button" onClick={() => runAction(action, props)}>{action.label}</button>)}</div>}
                  </article>
                ))}
              </div>
            ) : (
              <div className="ask-sprig-no-answer"><p>Try asking about a particular plant, harvest, photograph or Trial—or keep recording the story and ask Sprig again later.</p></div>
            )}
          </>
        ) : (
          <div className="ask-sprig-welcome">
            <p className="section-label">From Sprig’s notebook</p>
            <h2>What would you like to understand?</h2>
            <p>{startingObservations.length > 0 ? `I already have ${startingObservations.length === 1 ? 'one observation' : `${startingObservations.length} observations`} worth bringing forward. Ask a question above, or visit everything I have noticed.` : 'Your questions will become more useful as the garden gathers history.'}</p>
            <button type="button" className="text-button" onClick={() => props.onNavigate('sprig-smart')}>See what Sprig has noticed →</button>
          </div>
        )}
      </section>
    </FunctionPageTemplate>
  )
}
