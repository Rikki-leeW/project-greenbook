import { useState } from 'react'
import './css/App.css'
import AddEventForm from './components/forms/AddEventForm'
import AddPlantForm from './components/forms/AddPlantForm'
import Journal from './pages/Journal'
import Plants from './pages/Plants'
import PlantDetail from './pages/PlantDetail'
import Harvest from './pages/Harvest'
import Library from './pages/Library'
import type { AppPage } from './types/navigation'
import Gate from './pages/Gate'
import Welcome from './pages/Welcome'
import {
  loadGardenData,
  saveGardenData,
} from './services/storage'
import type {
  GardenEvent,
  PlantStory,
} from './types'

function App() {
  const [gardenData, setGardenData] =
    useState(loadGardenData)

  const [hasEnteredGarden, setHasEnteredGarden] =
    useState(false)

  const [isAddPlantOpen, setIsAddPlantOpen] =
    useState(false)

  const [isAddEventOpen, setIsAddEventOpen] =
    useState(false)

  const [selectedPlantId, setSelectedPlantId] =
    useState<string | null>(null)

    const [activePage, setActivePage] =
  useState<AppPage>('gate')

  function handleAddPlant(newPlant: PlantStory) {
    const updatedGardenData = {
      ...gardenData,
      plantStories: [
        ...gardenData.plantStories,
        newPlant,
      ],
    }

    setGardenData(updatedGardenData)
    saveGardenData(updatedGardenData)
    setIsAddPlantOpen(false)
  }

  function handleAddEvent(newEvent: GardenEvent) {
    const updatedGardenData = {
      ...gardenData,
      events: [
        ...gardenData.events,
        newEvent,
      ],
    }
    
    
    setGardenData(updatedGardenData)
    saveGardenData(updatedGardenData)
    setIsAddEventOpen(false)
  }


  function handleDeleteEvent(eventId: string) {
    const updatedGardenData = {
      ...gardenData,
      events: gardenData.events.filter(
        (event) => event.id !== eventId
      ),
    }
  
    setGardenData(updatedGardenData)
    saveGardenData(updatedGardenData)
  }

  function handleDeletePlant(plantId: string) {
    const updatedGardenData = {
      ...gardenData,
      plantStories: gardenData.plantStories.filter(
        (plant) => plant.id !== plantId
      ),
      events: gardenData.events.filter(
        (event) => !event.plantStoryIds.includes(plantId)
      ),
    }
  
    setGardenData(updatedGardenData)
    saveGardenData(updatedGardenData)
    setSelectedPlantId(null)
  }

  function handleUpdatePlant(updatedPlant: PlantStory) {
    const updatedGardenData = {
      ...gardenData,
      plantStories: gardenData.plantStories.map((plant) =>
        plant.id === updatedPlant.id ? updatedPlant : plant
      ),
    }
  
    setGardenData(updatedGardenData)
    saveGardenData(updatedGardenData)
  }


  const selectedPlant = gardenData.plantStories.find(
    (plant) => plant.id === selectedPlantId,
  )

  const selectedGrowingSpace =
    gardenData.growingSpaces.find(
      (space) =>
        space.id === selectedPlant?.currentGrowingSpaceId,
    )

    if (!hasEnteredGarden) {
      return (
        <Welcome
          onEnter={() => setHasEnteredGarden(true)}
        />
      )
    }

  if (selectedPlant) {
    return (
      <>
        <PlantDetail
          plant={selectedPlant}
          growingSpace={selectedGrowingSpace}
          events={gardenData.events}
          onBack={() => setSelectedPlantId(null)}
          onAddEvent={() => setIsAddEventOpen(true)}
          onDeleteEvent={handleDeleteEvent}
          onDeletePlant={handleDeletePlant}
          onUpdatePlant={handleUpdatePlant}

        />

        {isAddEventOpen && (
          <AddEventForm
            plantId={selectedPlant.id}
            onAddEvent={handleAddEvent}
            onClose={() => setIsAddEventOpen(false)}
          />
        )}
      </>
    )
  }
  if (activePage === 'journal') {
    return (
      <>
        <Journal
          events={gardenData.events}
          plants={gardenData.plantStories}
          onAddEntry={() => {
            setSelectedPlantId(null)
            setIsAddEventOpen(true)
          }}
          onDeleteEvent={handleDeleteEvent}
          onNavigate={setActivePage}
        />
  
        {isAddEventOpen && (
          <AddEventForm
            plantId=""
            onAddEvent={handleAddEvent}
            onClose={() => setIsAddEventOpen(false)}
          />
        )}
      </>
    )
  }






  if (activePage === 'plants') {
    return (
      <>
        <Plants
          plants={gardenData.plantStories}
          onOpenPlant={setSelectedPlantId}
          onAddPlant={() => setIsAddPlantOpen(true)}
          onNavigate={setActivePage}
        />
  
        {isAddPlantOpen && (
          <AddPlantForm
            growingSpaces={gardenData.growingSpaces}
            onAddPlant={handleAddPlant}
            onClose={() => setIsAddPlantOpen(false)}
          />
        )}
      </>
    )
  }
  if (activePage === 'harvest') {
    return (
      <>
        <Harvest
          events={gardenData.events}
          plants={gardenData.plantStories}
          onRecordHarvest={() => setIsAddEventOpen(true)}
          onDeleteEvent={handleDeleteEvent}
          onNavigate={setActivePage}
        />
  
        {isAddEventOpen && (
          <AddEventForm
            plantId=""
            onAddEvent={handleAddEvent}
            onClose={() => setIsAddEventOpen(false)}
          />
        )}
      </>
    )
  }


  if (activePage === 'library') {
    return (
      <>
        <Library
          onNavigate={setActivePage}
        />
      </>
    )
  }



  return (
    <>
      <Gate
        plants={gardenData.plantStories}
        onOpenPlant={setSelectedPlantId}
        onAddPlant={() => setIsAddPlantOpen(true)}
        onAddEntry={() => {
          setSelectedPlantId(null)
          setIsAddEventOpen(true)
        }}
        onNavigate={setActivePage}
      />
  
      {isAddPlantOpen && (
        <AddPlantForm
          growingSpaces={gardenData.growingSpaces}
          onAddPlant={handleAddPlant}
          onClose={() => setIsAddPlantOpen(false)}
        />
      )}
  
      {isAddEventOpen && (
        <AddEventForm
          plantId=""
          onAddEvent={handleAddEvent}
          onClose={() => setIsAddEventOpen(false)}
        />
      )}
    </>
  )
  }
  
  export default App