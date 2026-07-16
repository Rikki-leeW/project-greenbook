import PlantCard from '../components/cards/PlantCard'
import GardenLayout from '../components/layout/GardenLayout'
import type { PlantStory } from '../types'
import type { AppPage } from '../types/navigation'

interface PlantsProps {
  plants: PlantStory[]
  onOpenPlant: (plantId: string) => void
  onAddPlant: () => void
  onNavigate: (page: AppPage) => void
}

export default function Plants({
  plants,
  onOpenPlant,
  onAddPlant,
  onNavigate,
}: PlantsProps) {
  return (
    <GardenLayout
      activePage="plants"
      onNavigate={onNavigate}
    >
      <div className="garden-page">
        <header className="garden-header">
          <div>
            <p className="app-name">Sprig</p>

            <h1 className="garden-title">
              Growing stories
            </h1>

            <p className="garden-subtitle">
              Every plant has its own chapter.
            </p>
          </div>

          <button
            type="button"
            className="journal-add-button"
            onClick={onAddPlant}
          >
            🌱 Add a plant
          </button>
        </header>

        <section className="dashboard-section">
          <div className="plant-grid">
            {plants.length > 0 ? (
              plants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onOpen={onOpenPlant}
                />
              ))
            ) : (
              <div className="journal-empty">
                <span>🌱</span>

                <h2>The garden is waiting</h2>

                <p>
                  No growing stories have begun yet.
                </p>

                <button
                  type="button"
                  className="text-button"
                  onClick={onAddPlant}
                >
                  Begin the first story
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </GardenLayout>
  )
}