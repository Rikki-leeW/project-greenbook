import { useState } from 'react'
import './App.css'
import { loadGardenData } from './services/storage'
import PlantCard from './components/PlantCard'

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
         {gardenData.plantStories.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
           />
        ))}
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