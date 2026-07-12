import type { PlantStory } from '../types'

interface PlantCardProps {
  plant: PlantStory
}

export default function PlantCard({ plant }: PlantCardProps) {
  const plantedDate = new Date(plant.plantedDate)
  const today = new Date()

  const daysGrowing = Math.max(
    0,
    Math.floor(
      (today.getTime() - plantedDate.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  )

  const emoji =
    plant.plantName === 'Potato'
      ? '🥔'
      : plant.plantName === 'Broccoli'
      ? '🥦'
      : plant.plantName === 'Tomato'
      ? '🍅'
      : '🌱'

  return (
    <article className="plant-card">
      <div className="plant-card-top">
        <span className="plant-emoji">{emoji}</span>

        <span className="status-pill">
          {plant.status}
        </span>
      </div>

      <p className="plant-type">
        {plant.plantName} story
      </p>

      <h3>{plant.displayName}</h3>

      <p className="plant-personality">
        {plant.personality}
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
}