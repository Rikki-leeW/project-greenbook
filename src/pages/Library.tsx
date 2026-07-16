import GardenLayout from '../components/layout/GardenLayout'
import type { AppPage } from '../types/navigation'

interface LibraryProps {
  onAddNote?: () => void
  onNavigate: (page: AppPage) => void
}

export default function Library({
  onAddNote,
  onNavigate,
}: LibraryProps) {
  return (
    <GardenLayout
      activePage="library"
      onNavigate={onNavigate}
    >
      <div className="journal-page">
        <header className="journal-header">
          <div>
            <p className="section-label">
              Sprig&apos;s bookshelf
            </p>

            <h1>Garden Library</h1>

            <p className="journal-intro">
              A quiet collection of planting wisdom,
              useful notes and things Sprig has learned
              along the garden path.
            </p>
          </div>

          {onAddNote && (
            <button
              type="button"
              className="journal-add-button"
              onClick={onAddNote}
            >
              ✒️ Add a note
            </button>
          )}
        </header>

        <section className="library-grid">
          <article className="library-book">
            <div className="library-book-icon">
              🌱
            </div>

            <p className="section-label">
              Plant guide
            </p>

            <h2>Growing wisdom</h2>

            <p>
              Planting times, growing notes and useful
              lessons for each crop will live here.
            </p>

            <span className="library-coming-soon">
              A shelf still being filled
            </span>
          </article>

          <article className="library-book">
            <div className="library-book-icon">
              🧪
            </div>

            <p className="section-label">
              Garden provisions
            </p>

            <h2>Feeds and treatments</h2>

            <p>
              Keep track of fertilisers, soil additions,
              treatments and how the garden responded.
            </p>

            <span className="library-coming-soon">
              Sprig is sorting the labels
            </span>
          </article>

          <article className="library-book">
            <div className="library-book-icon">
              🗓️
            </div>

            <p className="section-label">
              Seasonal almanac
            </p>

            <h2>When to grow</h2>

            <p>
              A future Gold Coast planting guide for
              seasons, weather and the best time to begin.
            </p>

            <span className="library-coming-soon">
              The calendar pages are turning
            </span>
          </article>

          <article className="library-book">
            <div className="library-book-icon">
              📝
            </div>

            <p className="section-label">
              Keeper&apos;s notes
            </p>

            <h2>Lessons from the garden</h2>

            <p>
              The discoveries, failures and clever little
              fixes you want to remember next season.
            </p>

            <span className="library-coming-soon">
              Plenty of blank pages remain
            </span>
          </article>
        </section>
      </div>
    </GardenLayout>
  )
}