import {
  useState,
} from 'react'

import PlantCard from '../components/cards/PlantCard'
import GardenLayout from '../components/layout/GardenLayout'

import type {
  PlantStory,
} from '../types'

import type {
  AppPage,
} from '../types/navigation'


interface PlantsProps {
  plants: PlantStory[]

  onOpenPlant: (
    plantId: string,
  ) => void

  onAddPlant: () => void

  onNavigate: (
    page: AppPage,
  ) => void

  onComparePlants: (
    plantIds: string[],
  ) => void

  /**
   * When editing an existing saved
   * comparison, App can send its current
   * Plant Story ids here.
   *
   * Plants will then open directly in
   * comparison-selection mode with those
   * stories already selected.
   */
  initialComparePlantIds?: string[]
}


const MAX_COMPARE_PLANTS =
  6


type PlantStoryView =
  | 'active'
  | 'completed'


export default function Plants({
  plants,
  onOpenPlant,
  onAddPlant,
  onNavigate,
  onComparePlants,
  initialComparePlantIds = [],
}: PlantsProps) {

  /* =======================================
     STORY VIEW
  ======================================= */

  const [
    storyView,
    setStoryView,
  ] =
    useState<PlantStoryView>(
      initialComparePlantIds.some(
        plantId =>
          plants.some(
            plant =>
              plant.id ===
                plantId &&
              plant.status ===
                'finished',
          ),
      )
        ? 'completed'
        : 'active',
    )


  /* =======================================
     ACTIVE / COMPLETED STORIES
  ======================================= */

  const activePlants =
    plants.filter(
      plant =>
        plant.status !==
        'finished',
    )


  const completedPlants =
    plants.filter(
      plant =>
        plant.status ===
        'finished',
    )


  const visiblePlants =
    storyView ===
    'completed'
      ? completedPlants
      : activePlants


  /* =======================================
     INITIAL COMPARISON STATE
  ======================================= */

  const initialSelectedPlantIds =
    initialComparePlantIds
      .filter(
        plantId =>
          plants.some(
            plant =>
              plant.id ===
              plantId,
          ),
      )
      .slice(
        0,
        MAX_COMPARE_PLANTS,
      )


  const [
    compareMode,
    setCompareMode,
  ] =
    useState(
      initialSelectedPlantIds.length >
        0,
    )


  const [
    selectedPlantIds,
    setSelectedPlantIds,
  ] =
    useState<string[]>(
      initialSelectedPlantIds,
    )


  /* =======================================
     CHANGE STORY VIEW
  ======================================= */

  function changeStoryView(
    nextView:
      PlantStoryView,
  ) {
    setStoryView(
      nextView,
    )

    setCompareMode(
      false,
    )

    setSelectedPlantIds(
      [],
    )
  }


  /* =======================================
     ENTER / LEAVE COMPARE MODE
  ======================================= */

  function toggleCompareMode() {
    if (
      compareMode
    ) {
      setCompareMode(
        false,
      )

      setSelectedPlantIds(
        [],
      )

      return
    }


    setCompareMode(
      true,
    )
  }


  /* =======================================
     SELECT PLANT
  ======================================= */

  function togglePlantForComparison(
    plantId: string,
  ) {
    setSelectedPlantIds(
      currentIds => {
        if (
          currentIds.includes(
            plantId,
          )
        ) {
          return currentIds.filter(
            currentId =>
              currentId !==
              plantId,
          )
        }


        if (
          currentIds.length >=
          MAX_COMPARE_PLANTS
        ) {
          return currentIds
        }


        return [
          ...currentIds,
          plantId,
        ]
      },
    )
  }


  /* =======================================
     SELECTED PLANTS
  ======================================= */

  const selectedPlants =
    selectedPlantIds
      .map(
        plantId =>
          plants.find(
            plant =>
              plant.id ===
              plantId,
          ),
      )
      .filter(
        (
          plant,
        ): plant is PlantStory =>
          Boolean(
            plant,
          ),
      )


  return (
    <GardenLayout
      activePage="plants"
      onNavigate={
        onNavigate
      }
    >
      <div className="garden-page">

        {/* =======================================
            HEADER
        ======================================= */}

        <header className="garden-header">
          <div>
            <p className="app-name">
              Sprig
            </p>


            <h1 className="garden-title">
              {storyView ===
              'completed'
                ? 'Completed stories'
                : 'Growing stories'}
            </h1>


            <p className="garden-subtitle">
              {compareMode
                ? 'Choose two to six growing stories to look at together.'
                : storyView ===
                  'completed'
                  ? 'Finished chapters kept as part of the garden’s history.'
                  : 'Every plant has its own chapter.'}
            </p>
          </div>


          <div className="plant-page-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={
                toggleCompareMode
              }
            >
              {compareMode
                ? 'Cancel comparison'
                : '↔ Compare'}
            </button>


            {!compareMode &&
              storyView ===
                'active' && (
                <button
                  type="button"
                  className="journal-add-button"
                  onClick={
                    onAddPlant
                  }
                >
                  🌱 Add a plant
                </button>
              )}
          </div>
        </header>


        {/* =======================================
            ACTIVE / COMPLETED NAVIGATION
        ======================================= */}

        {!compareMode && (
          <nav
            className="plant-story-view-navigation"
            aria-label="Plant Story history"
          >
            <button
              type="button"
              className={
                storyView ===
                'active'
                  ? 'plant-story-view-button active'
                  : 'plant-story-view-button'
              }
              onClick={() =>
                changeStoryView(
                  'active',
                )
              }
            >
              <span>
                🌱
              </span>

              <span>
                <strong>
                  Growing now
                </strong>

                <small>
                  {activePlants.length}{' '}
                  {activePlants.length ===
                  1
                    ? 'active story'
                    : 'active stories'}
                </small>
              </span>
            </button>


            <button
              type="button"
              className={
                storyView ===
                'completed'
                  ? 'plant-story-view-button active'
                  : 'plant-story-view-button'
              }
              onClick={() =>
                changeStoryView(
                  'completed',
                )
              }
            >
              <span>
                🍂
              </span>

              <span>
                <strong>
                  Completed stories
                </strong>

                <small>
                  {completedPlants.length}{' '}
                  {completedPlants.length ===
                  1
                    ? 'finished story'
                    : 'finished stories'}
                </small>
              </span>
            </button>
          </nav>
        )}


        {/* =======================================
            COMPARE GUIDANCE
        ======================================= */}

        {compareMode && (
          <section className="plant-compare-guidance">
            <p>
              <strong>
                {
                  selectedPlantIds.length
                }{' '}
                of{' '}
                {
                  MAX_COMPARE_PLANTS
                }{' '}
                selected
              </strong>
            </p>


            <p className="form-whisper">
              Choose the plants whose
              growth, photographs,
              harvests and garden
              histories you want Sprig
              to place side by side.
            </p>
          </section>
        )}


        {/* =======================================
            PLANTS
        ======================================= */}

        <section className="dashboard-section">
          <div className="plant-grid">
            {visiblePlants.length >
            0 ? (
              visiblePlants.map(
                plant => (
                  <PlantCard
                    key={
                      plant.id
                    }

                    plant={
                      plant
                    }

                    onOpen={
                      onOpenPlant
                    }

                    compareMode={
                      compareMode
                    }

                    isSelectedForComparison={
                      selectedPlantIds.includes(
                        plant.id,
                      )
                    }

                    onToggleComparison={
                      togglePlantForComparison
                    }
                  />
                ),
              )
            ) : storyView ===
              'completed' ? (
              <div className="journal-empty">
                <span>
                  🍂
                </span>

                <h2>
                  No completed stories yet
                </h2>

                <p>
                  Finished Plant Stories
                  will settle here without
                  losing their photographs,
                  harvests or garden history.
                </p>

                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    changeStoryView(
                      'active',
                    )
                  }
                >
                  Return to growing stories
                </button>
              </div>
            ) : (
              <div className="journal-empty">
                <span>
                  🌱
                </span>

                <h2>
                  The garden is waiting
                </h2>

                <p>
                  No active growing stories
                  are underway.
                </p>

                {completedPlants.length >
                  0 && (
                  <p>
                    You still have{' '}
                    {
                      completedPlants.length
                    }{' '}
                    completed{' '}
                    {completedPlants.length ===
                    1
                      ? 'story'
                      : 'stories'}{' '}
                    safely kept in Sprig.
                  </p>
                )}

                <button
                  type="button"
                  className="text-button"
                  onClick={
                    onAddPlant
                  }
                >
                  Begin a new story
                </button>
              </div>
            )}
          </div>
        </section>


        {/* =======================================
            COMPARE TRAY
        ======================================= */}

        {compareMode &&
          selectedPlantIds.length >
            0 && (
            <aside
              className="plant-compare-tray"
              aria-label="Plants selected for comparison"
            >
              <div className="plant-compare-tray-copy">
                <p className="section-label">
                  Compare tray
                </p>

                <strong>
                  {
                    selectedPlantIds.length
                  }{' '}
                  {selectedPlantIds.length ===
                  1
                    ? 'story'
                    : 'stories'}{' '}
                  selected
                </strong>

                <p className="form-whisper">
                  {selectedPlants
                    .map(
                      plant =>
                        plant.displayName,
                    )
                    .join(
                      ' · ',
                    )}
                </p>
              </div>


              <button
                type="button"
                className="journal-add-button"
                disabled={
                  selectedPlantIds.length <
                  2
                }
                onClick={() =>
                  onComparePlants(
                    selectedPlantIds,
                  )
                }
              >
                Compare{' '}
                {
                  selectedPlantIds.length
                }{' '}
                {selectedPlantIds.length ===
                1
                  ? 'story'
                  : 'stories'}
              </button>
            </aside>
          )}
      </div>
    </GardenLayout>
  )
}