import type { PlantStory } from '../types'

interface PlantCardProps {
  plant: PlantStory
  onOpen: (plantId: string) => void
}

export default function PlantCard({
  plant,
  onOpen,
}: PlantCardProps) {
  const plantedDate = new Date(`${plant.plantedDate}T00:00:00`)
  const today = new Date()

  const daysGrowing = Math.max(
    0,
    Math.floor(
      (today.getTime() - plantedDate.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  )

  const emoji =
    plant.plantName.toLowerCase() === 'potato'
      ? '🥔'
      : plant.plantName.toLowerCase() === 'broccoli'
        ? '🥦'
        : plant.plantName.toLowerCase() === 'tomato'
          ? '🍅'
          : plant.plantName.toLowerCase() === 'cauliflower'
            ? '🥬'
            : '🌱'

  return (
    <button
      type="button"
      className="plant-card plant-card-button"
      onClick={() => onOpen(plant.id)}
      aria-label={`Open the story for ${plant.displayName}`}
    >
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

      <span className="open-story">
        Open story →
      </span>
    </button>
  )
}