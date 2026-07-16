import PlantCard from '../components/cards/PlantCard'
import GardenLayout from '../components/layout/GardenLayout'
import sprigWave from '../images/sprig/sprig-wave.png'
import type { PlantStory } from '../types'
import type { AppPage } from '../types/navigation'
import dividerVine from '../images/decorations/divider-vine.png'
//import openNotebook from '../images/notebook/open-notebook.png'
import woodlandFrame from '../images/backgrounds/woodland-frame.png'

interface GateProps {
  plants: PlantStory[]
  onOpenPlant: (plantId: string) => void
  onAddPlant: () => void
  onAddEntry: () => void
  onNavigate: (page: AppPage) => void
}

export default function Gate({
  plants,
  onOpenPlant,
  onAddPlant,
  onAddEntry,
  onNavigate,
}: GateProps) {
  return (
    <GardenLayout
      activePage="gate"
      onNavigate={onNavigate}
    >
      <div
  className="garden-page gate-page"
  style={{ backgroundImage: `url(${woodlandFrame})` }}
>
        <header className="garden-header">
          <div>
            <p className="app-name">Sprig</p>

            <h1 className="garden-title">
              Good afternoon, Rikki.
            </h1>

            <p className="garden-subtitle">
              Here&apos;s what is quietly growing today.
            </p>
          </div>

          <button
  type="button"
  className="keeper-avatar"
  aria-label="Open Garden Keeper notes"
>
  <img
    src={sprigWave}
    alt=""
    aria-hidden="true"
  />
</button>
        </header>

        <section
          className="quick-actions"
          aria-label="Quick garden actions"
        >
          <button
            type="button"
            className="quick-action"
            onClick={onAddEntry}
          >
            <span>👀</span>
            Garden Entry
          </button>

          <button
            type="button"
            className="quick-action"
            onClick={onAddPlant}
          >
            <span>🌱</span>
            Add a plant
          </button>

          <button
            type="button"
            className="quick-action"
            onClick={() => onNavigate('harvest')}
          >
            <span>🧺</span>
            Harvest
          </button>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="section-label">
                Your garden
              </p>

              <h2>Growing stories</h2>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate('plants')}
            >
              See all
            </button>
          </div>

          <div className="plant-grid">
            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onOpen={onOpenPlant}
              />
            ))}
          </div>
        </section>
        <div className="section-divider">
  <img
    src={dividerVine}
    alt=""
    aria-hidden="true"
  />
</div>


{/*
<section className="keeper-notebook">
  ...

        <section className="keeper-card">
        <img
    className="keeper-notebook"
    src={openNotebook}
    alt=""
    aria-hidden="true"
  />
</section>




  <div className="keeper-content">

  <p className="keeper-heading">
  From Sprig's Notebook
</p>

<h2 className="keeper-title">
  The broccoli has been suspiciously quiet...
</h2>

<p className="keeper-note-text">
  I walked past this morning expecting a proud green
  head. Instead, it looked rather pleased with itself
  for doing absolutely nothing.
</p>

<p className="keeper-signature">
  🌿 — Sprig
</p>

  </div>

</section>
*/}
      </div>
    </GardenLayout>
  )
}