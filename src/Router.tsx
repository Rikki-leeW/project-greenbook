import Gate from './pages/Gate'
import Harvest from './pages/Harvest'
import Journal from './pages/Journal'
import Library from './pages/Library'
import PlantDetail from './pages/PlantDetail'
import Plants from './pages/Plants'

import type {
  GardenEvent,
  GrowingSpace,
  PlantStory,
} from './types'

import type { AppPage } from './types/navigation'

interface RouterProps {
  activePage: AppPage
  plants: PlantStory[]
  events: GardenEvent[]
  growingSpaces: GrowingSpace[]
  selectedPlantId: string | null

  onNavigate: (page: AppPage) => void
  onOpenPlant: (plantId: string) => void
  onClosePlant: () => void
  onAddPlant: () => void
  onAddEntry: () => void
  onAddEvent: () => void

  onDeleteEvent: (eventId: string) => void
  onDeletePlant: (plantId: string) => void
  onUpdatePlant: (plant: PlantStory) => void
}

export default function Router({
  activePage,
  plants,
  events,
  growingSpaces,
  selectedPlantId,
  onNavigate,
  onOpenPlant,
  onClosePlant,
  onAddPlant,
  onAddEntry,
  onAddEvent,
  onDeleteEvent,
  onDeletePlant,
  onUpdatePlant,
}: RouterProps) {
  const selectedPlant = plants.find(
    (plant) => plant.id === selectedPlantId,
  )

  const selectedGrowingSpace = growingSpaces.find(
    (space) =>
      space.id === selectedPlant?.currentGrowingSpaceId,
  )

  if (selectedPlant) {
    return (
      <PlantDetail
        plant={selectedPlant}
        growingSpace={selectedGrowingSpace}
        events={events}
        onBack={onClosePlant}
        onAddEvent={onAddEvent}
        onDeleteEvent={onDeleteEvent}
        onDeletePlant={onDeletePlant}
        onUpdatePlant={onUpdatePlant}
      />
    )
  }

  if (activePage === 'journal') {
    return (
      <Journal
        events={events}
        plants={plants}
        onAddEntry={onAddEntry}
        onDeleteEvent={onDeleteEvent}
        onNavigate={onNavigate}
      />
    )
  }

  if (activePage === 'plants') {
    return (
      <Plants
        plants={plants}
        onOpenPlant={onOpenPlant}
        onAddPlant={onAddPlant}
        onNavigate={onNavigate}
      />
    )
  }

  if (activePage === 'harvest') {
    return (
      <Harvest
        events={events}
        plants={plants}
        onRecordHarvest={onAddEvent}
        onDeleteEvent={onDeleteEvent}
        onNavigate={onNavigate}
      />
    )
  }

  if (activePage === 'library') {
    return (
      <Library onNavigate={onNavigate} />
    )
  }

  return (
    <Gate
      plants={plants}
      onOpenPlant={onOpenPlant}
      onAddPlant={onAddPlant}
      onAddEntry={onAddEntry}
      onNavigate={onNavigate}
    />
  )
}