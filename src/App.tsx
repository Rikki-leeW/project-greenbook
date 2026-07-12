import { useState } from 'react'
import './App.css'
import { loadGardenData } from './services/storage'

function App() {
  const [gardenData] = useState(loadGardenData)
  const [hasEnteredGarden, setHasEnteredGarden] = useState(false)

  if (!hasEnteredGarden) {
    return (
      <main className="welcome-page">
        <section className="welcome-card">
          <div className="leaf-mark" aria-hidden="true">
            🌿
          </div>

          <p className="app-name">Sprig</p>

          <h1>The Garden Keeper</h1>

          <p className="welcome-message">Welcome, Rikki.</p>

          <p className="intro">
            Every garden tells a story.
            <br />
            Let&apos;s remember this one together.
          </p>

          <button
            type="button"
            className="enter-button"
            onClick={() => setHasEnteredGarden(true)}
          >
            Enter the garden
          </button>

          <p className="keeper-note">
            The Keeper has opened a fresh page in the notebook.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="garden-page">
      <header className="garden-header">
        <div>
          <p className="app-name">Sprig</p>
          <h1 className="garden-title">Good afternoon, Rikki.</h1>
          <p className="garden-subtitle">
            Here&apos;s what is quietly growing today.
          </p>
        </div>

        <button
          type="button"
          className="keeper-avatar"
          aria-label="Open Garden Keeper notes"
        >
          🌿
        </button>
      </header>

      <section className="quick-actions" aria-label="Quick garden actions">
        <button type="button" className="quick-action">
          <span>👀</span>
          I noticed something
        </button>

        <button type="button" className="quick-action">
          <span>🌱</span>
          Add a plant
        </button>

        <button type="button" className="quick-action">
          <span>🧺</span>
          Record a harvest
        </button>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-label">Your garden</p>
            <h2>Growing stories</h2>
          </div>

          <button type="button" className="text-button">
            See all
          </button>
        </div>

        <div className="plant-grid">
          {gardenData.plantStories.map((plant) => {
            const plantedDate = new Date(plant.plantedDate)
            const today = new Date()

            const daysGrowing = Math.max(
              0,
              Math.floor(
                (today.getTime() - plantedDate.getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            )

            const plantEmoji =
              plant.plantName === 'Potato'
                ? '🥔'
                : plant.plantName === 'Broccoli'
                  ? '🥦'
                  : plant.plantName === 'Tomato'
                    ? '🍅'
                    : '🌱'

            return (
              <article className="plant-card" key={plant.id}>
                <div className="plant-card-top">
                  <span className="plant-emoji">{plantEmoji}</span>

                  <span className="status-pill">{plant.status}</span>
                </div>

                <p className="plant-type">{plant.plantName} story</p>

                <h3>{plant.displayName}</h3>

                <p className="plant-personality">
                  {plant.personality ?? 'A story still unfolding'}
                </p>

                <div className="plant-details">
                  <span>
                    Planted{' '}
                    {plantedDate.toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>

                  <strong>{daysGrowing} days growing</strong>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="keeper-card">
        <div className="keeper-icon">🌿</div>

        <div>
          <p className="section-label">The Garden Keeper noticed</p>
          <h2>The broccoli has been suspiciously quiet.</h2>
          <p>It may be planning a rather dramatic entrance.</p>
        </div>
      </section>

      <nav className="bottom-navigation" aria-label="Main navigation">
        <button type="button" className="nav-item active">
          <span>🌿</span>
          Gate
        </button>

        <button type="button" className="nav-item">
          <span>🌱</span>
          Plants
        </button>

        <button type="button" className="nav-item">
          <span>📖</span>
          Journal
        </button>

        <button type="button" className="nav-item">
          <span>🧺</span>
          Harvest
        </button>

        <button type="button" className="nav-item">
          <span>📚</span>
          Library
        </button>
      </nav>
    </main>
  )
}

export default App