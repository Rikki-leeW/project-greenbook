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

  /*
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


export default function Plants({
  plants,
  onOpenPlant,
  onAddPlant,
  onNavigate,
  onComparePlants,
  initialComparePlantIds = [],
}: PlantsProps) {

  /* =======================================
     INITIAL COMPARISON STATE
  ======================================= */

  const initialSelectedPlantIds =
    initialComparePlantIds
      .filter(
        (
          plantId,
        ) =>
          plants.some(
            (
              plant,
            ) =>
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
      (
        currentIds,
      ) => {

        if (
          currentIds.includes(
            plantId,
          )
        ) {
          return currentIds.filter(
            (
              currentId,
            ) =>
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
        (
          plantId,
        ) =>
          plants.find(
            (
              plant,
            ) =>
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
              Growing stories
            </h1>


            <p className="garden-subtitle">
              {compareMode
                ? 'Choose two to six growing stories to look at together.'
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


            {!compareMode && (

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

            {plants.length >
            0 ? (

              plants.map(
                (
                  plant,
                ) => (

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

            ) : (

              <div className="journal-empty">

                <span>
                  🌱
                </span>


                <h2>
                  The garden is waiting
                </h2>


                <p>
                  No growing stories
                  have begun yet.
                </p>


                <button
                  type="button"
                  className="text-button"
                  onClick={
                    onAddPlant
                  }
                >
                  Begin the first story
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
                    (
                      plant,
                    ) =>
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