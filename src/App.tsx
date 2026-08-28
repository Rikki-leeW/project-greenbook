import { useState } from 'react'

import './css/App.css'

import AppLibrary from './components/app/AppLibrary'

import AddEventForm from './components/forms/AddEventForm'
import AddPlantForm from './components/forms/AddPlantForm'
import AddRecipeForm from './components/forms/AddRecipeForm'
import AddGrowingPlaceForm from './components/forms/AddGrowingPlaceForm'
import AddHarvestForm from './components/forms/AddHarvestForm'
import HarvestDetail from './pages/HarvestDetail'

import Journal from './pages/Journal'
import JournalEntryDetail from './pages/JournalEntryDetail'
import Plants from './pages/Plants'
import PlantDetail from './pages/PlantDetail'
import Harvest from './pages/Harvest'
import Gate from './pages/Gate'
import Welcome from './pages/Welcome'
import GardenPlaces from './pages/GrowingPlaces'
import GrowingPlaceDetail from './pages/GrowingPlaceDetail'
import BackupRestore from './pages/BackupRestore'
import PlantComparison from './pages/PlantComparison'
import Comparisons from './pages/Comparisons'


import type {
  AppPage,
} from './types/navigation'

import {
  loadGardenData,
  saveGardenData,
} from './services/storage'

import {
  downloadGardenBackup,
} from './services/backup'

import type {
  GardenEvent,
  GardenProduct,
  GrowingPlace,
  GrowingSetup,
  Ingredient,
  PlantStory,
  PurchaseRecord,
  HarvestRecord,
  SavedComparison,
} from './types'


function App() {

  /* =======================================
     GARDEN DATA
  ======================================= */

  const [
    gardenData,
    setGardenData,
  ] =
    useState(
      loadGardenData,
    )


  /* =======================================
     ENTRY
  ======================================= */

  const [
    hasEnteredGarden,
    setHasEnteredGarden,
  ] =
    useState(false)

  /* =======================================
     FORM STATE
  ======================================= */

  const [
    isAddPlantOpen,
    setIsAddPlantOpen,
  ] =
    useState(false)


  const [
    isAddEventOpen,
    setIsAddEventOpen,
  ] =
    useState(false)


  const [
    isAddHarvestOpen,
    setIsAddHarvestOpen,
  ] =
    useState(false)

    const [
      harvestEditorRecord,
      setHarvestEditorRecord,
    ] =
      useState<HarvestRecord | null>(
        null,
      )
    
    const [
      harvestInitialPlantStoryIds,
      setHarvestInitialPlantStoryIds,
    ] =
      useState<string[]>(
        [],
      )
  const [
    isAddRecipeOpen,
    setIsAddRecipeOpen,
  ] =
    useState(false)


  const [
    isAddGrowingPlaceOpen,
    setIsAddGrowingPlaceOpen,
  ] =
    useState(false)


  /* =======================================
   SELECTED RECORDS
======================================= */

const [
  selectedPlantId,
  setSelectedPlantId,
] =
  useState<string | null>(
    null,
  )

const [
  selectedEventId,
  setSelectedEventId,
] =
  useState<string | null>(
    null,
  )

const [
  selectedHarvestId,
  setSelectedHarvestId,
] =
  useState<string | null>(
    null,
  )

const [
  selectedGrowingPlaceId,
  setSelectedGrowingPlaceId,
] =
  useState<string | null>(
    null,
  )

  /* =======================================
   COMPARISON
======================================= */

const [
  comparisonPlantIds,
  setComparisonPlantIds,
] =
  useState<string[]>(
    [],
  )

  const [
    activeSavedComparisonId,
    setActiveSavedComparisonId,
  ] =
    useState<string | null>(
      null,
    )

  /* =======================================
     LIBRARY DESTINATION
  ======================================= */

  const [
    libraryRecipeIdToOpen,
    setLibraryRecipeIdToOpen,
  ] =
    useState<string | null>(
      null,
    )


    const [
      libraryViewToOpen,
      setLibraryViewToOpen,
    ] =
      useState<
        | 'library'
        | 'growing-recipes'
        | 'ingredients'
        | 'products'
        | null
      >(
        null,
      )

       

  /* =======================================
     ACTIVE APP PAGE
  ======================================= */

  const [
    activePage,
    setActivePage,
  ] =
    useState<AppPage>(
      'gate',
    )

  /* =======================================
   CENTRAL APP NAVIGATION
======================================= */

function handleNavigate(
  page: AppPage,
  libraryView?:
    | 'library'
    | 'growing-recipes'
    | 'ingredients'
    | 'products',
) {
  /*
   * A detail record sits over one of
   * Sprig's main pages.
   *
   * When the gardener deliberately
   * navigates somewhere else, release
   * every selected detail record first.
   */

  setSelectedPlantId(
    null,
  )

  setSelectedEventId(
    null,
  )

  setSelectedHarvestId(
    null,
  )

  setSelectedGrowingPlaceId(
    null,
  )


  setLibraryRecipeIdToOpen(
    null,
  )


  setIsAddPlantOpen(
    false,
  )

  setIsAddEventOpen(
    false,
  )

  setIsAddHarvestOpen(
    false,
  )

  setIsAddRecipeOpen(
    false,
  )

  setIsAddGrowingPlaceOpen(
    false,
  )


  setHarvestEditorRecord(
    null,
  )

  setHarvestInitialPlantStoryIds(
    [],
  )


  /*
   * A comparison is a temporary working
   * session.
   *
   * Ordinary navigation away from that
   * workflow should clear the working
   * selection without deleting the saved
   * comparison record itself.
   *
   * Reopening a saved comparison later
   * will rebuild this state from the
   * SavedComparison record.
   */

  if (
    page !==
    'comparison'
  ) {
    setComparisonPlantIds(
      [],
    )

    setActiveSavedComparisonId(
      null,
    )
  }


  /*
   * If the gardener chose a particular
   * Garden Library shelf from the Satchel,
   * remember that destination.
   *
   * Ordinary navigation to the Library
   * opens its main bookshelf.
   */

  if (
    page ===
    'library'
  ) {
    setLibraryViewToOpen(
      libraryView ??
        'library',
    )
  }


  setActivePage(
    page,
  )
}

  /* =======================================
     OPEN PLANT RECORD
  ======================================= */

  function handleOpenPlantRecord(
    plantId: string,
  ) {
    setSelectedEventId(
      null,
    )

    setSelectedHarvestId(
      null,
    )

    setSelectedGrowingPlaceId(
      null,
    )

    setLibraryRecipeIdToOpen(
      null,
    )

    setActivePage(
      'plants',
    )

    setSelectedPlantId(
      plantId,
    )
  }


  /* =======================================
     OPEN GROWING PLACE RECORD
  ======================================= */

  function handleOpenGrowingPlaceRecord(
    growingPlaceId: string,
  ) {
    setSelectedPlantId(
      null,
    )

    setSelectedEventId(
      null,
    )

    setLibraryRecipeIdToOpen(
      null,
    )

    setActivePage(
      'growing-places',
    )

    setSelectedGrowingPlaceId(
      growingPlaceId,
    )
  }


  /* =======================================
     ADD PLANT
  ======================================= */

  function handleAddPlant(
    newPlant: PlantStory,
  ) {
    const updatedGardenData = {
      ...gardenData,

      plantStories: [
        ...gardenData.plantStories,
        newPlant,
      ],
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )

    setIsAddPlantOpen(
      false,
    )
  }


  /* =======================================
     ADD GROWING PLACE
  ======================================= */

  function handleAddGrowingPlace(
    newPlace: GrowingPlace,
    newSetup?: GrowingSetup,
  ) {
    const placeToSave:
      GrowingPlace =
      newSetup
        ? {
            ...newPlace,

            growingSetupId:
              newSetup.id,
          }
        : newPlace


    const existingGrowingSetups =
      gardenData.growingSetups ??
      []


    const setupAlreadyExists =
      newSetup
        ? existingGrowingSetups.some(
            (
              setup,
            ) =>
              setup.id ===
              newSetup.id,
          )
        : false


    const updatedGrowingSetups =
      newSetup &&
      !setupAlreadyExists
        ? [
            ...existingGrowingSetups,
            newSetup,
          ]
        : existingGrowingSetups


    const updatedGardenData = {
      ...gardenData,

      growingPlaces: [
        ...gardenData.growingPlaces,
        placeToSave,
      ],

      growingSetups:
        updatedGrowingSetups,
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }


  /* =======================================
     ADD GROWING RECIPE
  ======================================= */

  function handleAddRecipe(
    newRecipe: GrowingSetup,
  ) {
    const existingGrowingSetups =
      gardenData.growingSetups ??
      []


    const alreadyExists =
      existingGrowingSetups.some(
        (
          setup,
        ) =>
          setup.id ===
          newRecipe.id,
      )


    if (alreadyExists) {
      setIsAddRecipeOpen(
        false,
      )

      return
    }


    const updatedGardenData = {
      ...gardenData,

      growingSetups: [
        ...existingGrowingSetups,
        newRecipe,
      ],
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )

    setIsAddRecipeOpen(
      false,
    )
  }


  /* =======================================
     UPDATE GROWING RECIPE
  ======================================= */

  function handleUpdateRecipe(
    updatedRecipe: GrowingSetup,
  ) {
    const updatedGardenData = {
      ...gardenData,

      growingSetups:
        (
          gardenData.growingSetups ??
          []
        ).map(
          (
            recipe,
          ) =>
            recipe.id ===
            updatedRecipe.id
              ? updatedRecipe
              : recipe,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }


  /* =======================================
     DELETE GROWING RECIPE
  ======================================= */

  function handleDeleteRecipe(
    recipeId: string,
  ) {
    const updatedGardenData = {
      ...gardenData,

      growingSetups:
        (
          gardenData.growingSetups ??
          []
        ).filter(
          (
            recipe,
          ) =>
            recipe.id !==
            recipeId,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }


  /* =======================================
     ADD INGREDIENT
  ======================================= */

  function handleAddIngredient(
    newIngredient: Ingredient,
  ) {
    const existingIngredients =
      gardenData.ingredients ??
      []


    const alreadyExists =
      existingIngredients.some(
        (
          ingredient,
        ) =>
          ingredient.id ===
          newIngredient.id,
      )


    if (alreadyExists) {
      return
    }


    const updatedGardenData = {
      ...gardenData,

      ingredients: [
        ...existingIngredients,
        newIngredient,
      ],
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }


  /* =======================================
     UPDATE INGREDIENT
  ======================================= */

  function handleUpdateIngredient(
    updatedIngredient: Ingredient,
  ) {
    const updatedGardenData = {
      ...gardenData,

      ingredients:
        (
          gardenData.ingredients ??
          []
        ).map(
          (
            ingredient,
          ) =>
            ingredient.id ===
            updatedIngredient.id
              ? updatedIngredient
              : ingredient,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }


  /* =======================================
     DELETE INGREDIENT
  ======================================= */

  function handleDeleteIngredient(
    ingredientId: string,
  ) {
    const updatedGardenData = {
      ...gardenData,

      ingredients:
        (
          gardenData.ingredients ??
          []
        ).filter(
          (
            ingredient,
          ) =>
            ingredient.id !==
            ingredientId,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }


  /* =======================================
     ADD PRODUCT
  ======================================= */

  function handleAddProduct(
    newProduct: GardenProduct,
  ) {
    setGardenData(
      (
        currentGardenData,
      ) => {
        const existingProducts =
          currentGardenData.products ??
          []


        const alreadyExists =
          existingProducts.some(
            (
              product,
            ) =>
              product.id ===
              newProduct.id,
          )


        if (alreadyExists) {
          return currentGardenData
        }


        const updatedGardenData = {
          ...currentGardenData,

          products: [
            ...existingProducts,
            newProduct,
          ],
        }


        saveGardenData(
          updatedGardenData,
        )

        return updatedGardenData
      },
    )
  }


  /* =======================================
     UPDATE PRODUCT
  ======================================= */

  function handleUpdateProduct(
    updatedProduct: GardenProduct,
  ) {
    const updatedGardenData = {
      ...gardenData,

      products:
        (
          gardenData.products ??
          []
        ).map(
          (
            product,
          ) =>
            product.id ===
            updatedProduct.id
              ? updatedProduct
              : product,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }


  /* =======================================
     DELETE PRODUCT
  ======================================= */

  function handleDeleteProduct(
    productId: string,
  ) {
    const updatedGardenData = {
      ...gardenData,

      products:
        (
          gardenData.products ??
          []
        ).filter(
          (
            product,
          ) =>
            product.id !==
            productId,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }


  /* =======================================
     ADD PURCHASE
  ======================================= */

  function handleAddPurchase(
    newPurchase: PurchaseRecord,
  ) {
    setGardenData(
      (
        currentGardenData,
      ) => {
        const existingPurchases =
          currentGardenData.purchases ??
          []


        const alreadyExists =
          existingPurchases.some(
            (
              purchase,
            ) =>
              purchase.id ===
              newPurchase.id,
          )


        if (alreadyExists) {
          return currentGardenData
        }


        const updatedGardenData = {
          ...currentGardenData,

          purchases: [
            ...existingPurchases,
            newPurchase,
          ],
        }


        saveGardenData(
          updatedGardenData,
        )

        return updatedGardenData
      },
    )
  }


  /* =======================================
     UPDATE PURCHASE
  ======================================= */

  function handleUpdatePurchase(
    updatedPurchase: PurchaseRecord,
  ) {
    const existingPurchases =
      gardenData.purchases ??
      []


    const updatedGardenData = {
      ...gardenData,

      purchases:
        existingPurchases.map(
          (
            purchase,
          ) =>
            purchase.id ===
            updatedPurchase.id
              ? updatedPurchase
              : purchase,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }

 /* =======================================
   SAVE OR UPDATE PLANT COMPARISON
======================================= */

function handleSavePlantComparison(
  name: string,
  plantStoryIds: string[],
) {
  const now =
    new Date()
      .toISOString()

  const comparisonItems =
    plantStoryIds.map(
      (
        plantStoryId,
      ) => ({
        recordType:
          'plant-story' as const,

        recordId:
          plantStoryId,
      }),
    )


  /* =======================================
     UPDATE EXISTING SAVED COMPARISON
  ======================================= */

  if (
    activeSavedComparisonId
  ) {
    const updatedGardenData = {
      ...gardenData,

      savedComparisons:
        (
          gardenData.savedComparisons ??
          []
        ).map(
          (
            comparison,
          ) =>
            comparison.id ===
            activeSavedComparisonId
              ? {
                  ...comparison,

                  name:
                    name.trim(),

                  items:
                    comparisonItems,

                  updatedAt:
                    now,
                }
              : comparison,
        ),
    }


    setGardenData(
      updatedGardenData,
    )


    saveGardenData(
      updatedGardenData,
    )


    return
  }


  /* =======================================
     CREATE NEW SAVED COMPARISON
  ======================================= */

  const newComparison:
    SavedComparison = {
      id:
        crypto.randomUUID(),

      name:
        name.trim(),

      items:
        comparisonItems,

      createdAt:
        now,
    }


  const updatedGardenData = {
    ...gardenData,

    savedComparisons: [
      ...(gardenData.savedComparisons ??
        []),

      newComparison,
    ],
  }


  setGardenData(
    updatedGardenData,
  )


  saveGardenData(
    updatedGardenData,
  )


  /*
   * Once saved, this comparison is now
   * an existing Sprig record.
   *
   * Remember its id so any later save
   * updates this record rather than
   * creating a duplicate.
   */

  setActiveSavedComparisonId(
    newComparison.id,
  )
}

  /* =======================================
     ADD JOURNAL EVENT
  ======================================= */

  function handleAddEvent(
    newEvent: GardenEvent,
  ) {
    const updatedGardenData = {
      ...gardenData,

      events: [
        ...gardenData.events,
        newEvent,
      ],
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )

    setIsAddEventOpen(
      false,
    )
  }

  /* =======================================
   RENAME SAVED COMPARISON
======================================= */

function handleRenameSavedComparison(
  comparisonId: string,
  name: string,
) {
  const trimmedName =
    name.trim()

  if (!trimmedName) {
    return
  }


  const now =
    new Date()
      .toISOString()


  const updatedGardenData = {
    ...gardenData,

    savedComparisons:
      (
        gardenData.savedComparisons ??
        []
      ).map(
        (
          comparison,
        ) =>
          comparison.id ===
          comparisonId
            ? {
                ...comparison,

                name:
                  trimmedName,

                updatedAt:
                  now,
              }
            : comparison,
      ),
  }


  setGardenData(
    updatedGardenData,
  )


  saveGardenData(
    updatedGardenData,
  )
}

/* =======================================
   DELETE SAVED COMPARISON
======================================= */

function handleDeleteSavedComparison(
  comparisonId: string,
) {
  const updatedGardenData = {
    ...gardenData,

    savedComparisons:
      (
        gardenData.savedComparisons ??
        []
      ).filter(
        (
          comparison,
        ) =>
          comparison.id !==
          comparisonId,
      ),
  }


  setGardenData(
    updatedGardenData,
  )


  saveGardenData(
    updatedGardenData,
  )


  /*
   * If the comparison being deleted
   * happens to be the one currently
   * remembered as active, release that
   * temporary comparison session too.
   */

  if (
    activeSavedComparisonId ===
    comparisonId
  ) {
    setActiveSavedComparisonId(
      null,
    )

    setComparisonPlantIds(
      [],
    )
  }
}


  /* =======================================
     DELETE JOURNAL EVENT
  ======================================= */

  function handleDeleteEvent(
    eventId: string,
  ) {
    const updatedGardenData = {
      ...gardenData,

      events:
        gardenData.events.filter(
          (
            event,
          ) =>
            event.id !==
            eventId,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )


    if (
      selectedEventId ===
      eventId
    ) {
      setSelectedEventId(
        null,
      )
    }
  }

  /* =======================================
   ADD HARVEST
======================================= */

function handleAddHarvest(
  newHarvest: HarvestRecord,
) {
  const updatedGardenData = {
    ...gardenData,

    harvests: [
      ...gardenData.harvests,
      newHarvest,
    ],
  }


  setGardenData(
    updatedGardenData,
  )

  saveGardenData(
    updatedGardenData,
  )
}


/* =======================================
   UPDATE HARVEST
======================================= */

function handleUpdateHarvest(
  updatedHarvest: HarvestRecord,
) {
  const updatedGardenData = {
    ...gardenData,

    harvests:
      gardenData.harvests.map(
        (
          harvest,
        ) =>
          harvest.id ===
            updatedHarvest.id
            ? updatedHarvest
            : harvest,
      ),
  }


  setGardenData(
    updatedGardenData,
  )

  saveGardenData(
    updatedGardenData,
  )
}


/* =======================================
   DELETE HARVEST
======================================= */

function handleDeleteHarvest(
  harvestId: string,
) {
  const updatedGardenData = {
    ...gardenData,

    harvests:
      gardenData.harvests.filter(
        (
          harvest,
        ) =>
          harvest.id !==
          harvestId,
      ),
  }


  setGardenData(
    updatedGardenData,
  )

  saveGardenData(
    updatedGardenData,
  )


  if (
    selectedHarvestId ===
    harvestId
  ) {
    setSelectedHarvestId(
      null,
    )
  }
}


/* =======================================
   OPEN NEW HARVEST
======================================= */

function handleOpenNewHarvest(
  plantStoryIds:
    string[] = [],
) {
  setHarvestEditorRecord(
    null,
  )

  setHarvestInitialPlantStoryIds(
    plantStoryIds,
  )

  setIsAddHarvestOpen(
    true,
  )
}


/* =======================================
   OPEN EDIT HARVEST
======================================= */

function handleOpenEditHarvest(
  harvest: HarvestRecord,
) {
  setHarvestEditorRecord(
    harvest,
  )

  setHarvestInitialPlantStoryIds(
    [],
  )

  setIsAddHarvestOpen(
    true,
  )
}


/* =======================================
   CLOSE HARVEST EDITOR
======================================= */

function handleCloseHarvestEditor() {
  setIsAddHarvestOpen(
    false,
  )

  setHarvestEditorRecord(
    null,
  )

  setHarvestInitialPlantStoryIds(
    [],
  )
}

  /* =======================================
     DELETE PLANT
  ======================================= */

  function handleDeletePlant(
    plantId: string,
  ) {
    const updatedGardenData = {
      ...gardenData,

      plantStories:
        gardenData.plantStories.filter(
          (
            plant,
          ) =>
            plant.id !==
            plantId,
        ),

      events:
        gardenData.events.filter(
          (
            event,
          ) =>
            !event.plantStoryIds.includes(
              plantId,
            ),
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )

    setSelectedPlantId(
      null,
    )
  }


  /* =======================================
     UPDATE PLANT
  ======================================= */

  function handleUpdatePlant(
    updatedPlant: PlantStory,
  ) {
    const updatedGardenData = {
      ...gardenData,

      plantStories:
        gardenData.plantStories.map(
          (
            plant,
          ) =>
            plant.id ===
            updatedPlant.id
              ? updatedPlant
              : plant,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }


  /* =======================================
   RESTORE GARDEN BACKUP
======================================= */

function handleRestoreGarden(
  restoredGardenData:
    typeof gardenData,
) {
  /*
   * Before replacing anything, automatically
   * download a safety backup of the garden
   * currently open in Sprig.
   *
   * We deliberately download this rather than
   * duplicating the whole garden in localStorage.
   * Photographs can make GardenData large, and
   * keeping two complete copies in browser
   * storage could exceed its storage allowance.
   */
  const safetyBackupTime =
  new Date()
    .toISOString()
    .slice(
      0,
      16,
    )
    .replace(
      'T',
      '-',
    )
    .replace(
      ':',
      '',
    )

downloadGardenBackup(
  gardenData,
  `sprig-safety-backup-before-restore-${safetyBackupTime}.json`,
)


  /*
   * The selected backup has already passed
   * through Sprig's backup parser and
   * normalisation before reaching this handler.
   */
  saveGardenData(
    restoredGardenData,
  )

  setGardenData(
    restoredGardenData,
  )


  /*
   * Release any record or editor belonging to
   * the garden that has just been replaced.
   */
  setSelectedPlantId(
    null,
  )

  setSelectedEventId(
    null,
  )

  setSelectedHarvestId(
    null,
  )

  setSelectedGrowingPlaceId(
    null,
  )

  setLibraryRecipeIdToOpen(
    null,
  )

  setLibraryViewToOpen(
    null,
  )


  setIsAddPlantOpen(
    false,
  )

  setIsAddEventOpen(
    false,
  )

  setIsAddHarvestOpen(
    false,
  )

  setIsAddRecipeOpen(
    false,
  )

  setIsAddGrowingPlaceOpen(
    false,
  )


  setHarvestEditorRecord(
    null,
  )

  setHarvestInitialPlantStoryIds(
    [],
  )


  /*
   * Return to Today in the Garden after the
   * restore so Sprig opens the restored garden
   * from a neutral destination.
   */
  setActivePage(
    'gate',
  )
}

  /* =======================================
   CURRENT HARVEST
======================================= */

const selectedHarvest =
gardenData.harvests.find(
  (
    harvest,
  ) =>
    harvest.id ===
    selectedHarvestId,
)


  /* =======================================
     CURRENT PLANT
  ======================================= */

  const selectedPlant =
    gardenData.plantStories.find(
      (
        plant,
      ) =>
        plant.id ===
        selectedPlantId,
    )


  /* =======================================
     CURRENT JOURNAL ENTRY
  ======================================= */

  const selectedEvent =
    gardenData.events.find(
      (
        event,
      ) =>
        event.id ===
        selectedEventId,
    )


  /* =======================================
     CURRENT GROWING PLACE
  ======================================= */

  const selectedGrowingPlace =
    gardenData.growingPlaces.find(
      (
        place,
      ) =>
        place.id ===
        selectedGrowingPlaceId,
    )


  /* =======================================
     WELCOME
  ======================================= */

  if (
    !hasEnteredGarden
  ) {
    return (
      <Welcome
        onEnter={() =>
          setHasEnteredGarden(
            true,
          )
        }
      />
    )
  }


  
 /* =======================================
   HARVEST DETAIL
======================================= */

if (
  selectedHarvest
) {
  return (
    <>
      <HarvestDetail
        harvest={
          selectedHarvest
        }
        harvests={
          gardenData.harvests
        }
        plants={
          gardenData.plantStories
        }
        onBack={() => {
          setSelectedHarvestId(
            null,
          )
          setActivePage(
            'harvest',
          )
        }}
        onEdit={
          handleOpenEditHarvest
        }
        onRecordAnotherHarvest={(
          harvest,
        ) =>
          handleOpenNewHarvest(
            harvest.plantStoryIds,
          )
        }
        onDelete={(
          harvestId,
        ) => {
          handleDeleteHarvest(
            harvestId,
          )
          setSelectedHarvestId(
            null,
          )
          setActivePage(
            'harvest',
          )
        }}
        onOpenPlant={(plantId) => {
          setSelectedHarvestId(
            null,
          )

          setSelectedEventId(
            null,
          )

          setSelectedGrowingPlaceId(
            null,
          )

          setLibraryRecipeIdToOpen(
            null,
          )

          setActivePage(
            'plants',
          )

          setSelectedPlantId(
            plantId,
          )
        }}
        onNavigate={
          handleNavigate
        }
      />

      {isAddHarvestOpen && (
        <AddHarvestForm
          plants={
            gardenData.plantStories
          }

          growingPlaces={
            gardenData.growingPlaces
          }

          harvest={
            harvestEditorRecord
          }

          initialPlantStoryIds={
            harvestInitialPlantStoryIds
          }

          onSaveHarvest={(
            harvest,
          ) => {
            if (
              harvestEditorRecord
            ) {
              handleUpdateHarvest(
                harvest,
              )
            } else {
              handleAddHarvest(
                harvest,
              )
            }


            /*
             * After saving, keep the gardener
             * with the Harvest Record they just
             * created or edited.
             */
            setSelectedHarvestId(
              harvest.id,
            )


            handleCloseHarvestEditor()
          }}

          onClose={
            handleCloseHarvestEditor
          }
        />
      )}
    </>
  )
}

  /* =======================================
     JOURNAL ENTRY DETAIL
  ======================================= */

  if (
    selectedEvent
  ) {
    return (
      <JournalEntryDetail
        event={
          selectedEvent
        }

        plants={
          gardenData.plantStories
        }

        growingPlaces={
          gardenData.growingPlaces
        }

        onBack={() => {
          setSelectedEventId(
            null,
          )

          setActivePage(
            'journal',
          )
        }}

        onOpenPlant={(
          plantId,
        ) => {
          setSelectedEventId(
            null,
          )

          setSelectedGrowingPlaceId(
            null,
          )

          setActivePage(
            'plants',
          )

          setSelectedPlantId(
            plantId,
          )
        }}

        onOpenGrowingPlace={(
          growingPlaceId,
        ) => {
          setSelectedEventId(
            null,
          )

          setSelectedPlantId(
            null,
          )

          setActivePage(
            'growing-places',
          )

          setSelectedGrowingPlaceId(
            growingPlaceId,
          )
        }}

        onNavigate={
          handleNavigate
        }
      />
    )
  }

  /* =======================================
     GROWING PLACE DETAIL
  ======================================= */

  if (
    selectedGrowingPlace
  ) {
    return (
      <GrowingPlaceDetail
        growingPlace={
          selectedGrowingPlace
        }

        plants={
          gardenData.plantStories
        }

        events={
          gardenData.events
        }

        growingSetups={
          gardenData.growingSetups ??
          []
        }

        onBack={() =>
          setSelectedGrowingPlaceId(
            null,
          )
        }

        onOpenPlant={(
          plantId,
        ) => {
          setSelectedGrowingPlaceId(
            null,
          )

          setSelectedEventId(
            null,
          )

          setLibraryRecipeIdToOpen(
            null,
          )

          setActivePage(
            'plants',
          )

          setSelectedPlantId(
            plantId,
          )
        }}

        onOpenEvent={(
          eventId,
        ) => {
          setSelectedGrowingPlaceId(
            null,
          )

          setSelectedPlantId(
            null,
          )

          setLibraryRecipeIdToOpen(
            null,
          )

          setActivePage(
            'journal',
          )

          setSelectedEventId(
            eventId,
          )
        }}

        onOpenRecipe={(
          recipeId,
        ) => {
          setLibraryRecipeIdToOpen(
            recipeId,
          )

          setLibraryViewToOpen(
            'growing-recipes',
          )

          setSelectedGrowingPlaceId(
            null,
          )

          setSelectedPlantId(
            null,
          )

          setSelectedEventId(
            null,
          )

          setActivePage(
            'library',
          )
        }}

        onNavigate={
          handleNavigate
        }
      />
    )
  }
/* =======================================
   PLANT COMPARISON
======================================= */

if (
  activePage ===
  'comparison'
) {
  return (
    <PlantComparison
      plantIds={
        comparisonPlantIds
      }

      activeSavedComparisonId={
        activeSavedComparisonId
      }

      plants={
        gardenData.plantStories
      }

      growingPlaces={
        gardenData.growingPlaces
      }

      growingSetups={
        gardenData.growingSetups ??
        []
      }

      ingredients={
        gardenData.ingredients ??
        []
      }

      products={
        gardenData.products ??
        []
      }

      events={
        gardenData.events
      }

      harvests={
        gardenData.harvests
      }

      onBack={() => {
        setActivePage(
          'plants',
        )
      }}

      onEditComparison={(
        plantStoryIds,
      ) => {
        setComparisonPlantIds(
          plantStoryIds,
        )

        setActivePage(
          'plants',
        )
      }}

      onSaveComparison={
        handleSavePlantComparison
      }

      onNavigate={
        handleNavigate
      }
    />
  )
}
  /* =======================================
     PLANT DETAIL
  ======================================= */

  if (
    selectedPlant
  ) {
    return (
      <>
        <PlantDetail
          plant={
            selectedPlant
          }

          growingPlaces={
            gardenData.growingPlaces
          }

          growingSetups={
            gardenData.growingSetups ??
            []
          }

          ingredients={
            gardenData.ingredients ??
            []
          }

          products={
            gardenData.products ??
            []
          }

          events={
            gardenData.events
          }

          harvests={
            gardenData.harvests
          }

          onNavigate={
            handleNavigate
          }

          onOpenGrowingPlace={
            handleOpenGrowingPlaceRecord
          }

          onOpenHarvest={(
            harvestId,
          ) => {
            setSelectedPlantId(
              null,
            )

            setSelectedEventId(
              null,
            )

            setSelectedGrowingPlaceId(
              null,
            )

            setLibraryRecipeIdToOpen(
              null,
            )

            setActivePage(
              'harvest',
            )

            setSelectedHarvestId(
              harvestId,
            )
          }}

          onAddHarvest={(
            plantStoryIds,
          ) =>
            handleOpenNewHarvest(
              plantStoryIds,
            )
          }

          onOpenJournalEntry={(
            eventId,
          ) => {
            setSelectedPlantId(
              null,
            )

            setSelectedGrowingPlaceId(
              null,
            )

            setLibraryRecipeIdToOpen(
              null,
            )

            setActivePage(
              'journal',
            )

            setSelectedEventId(
              eventId,
            )
          }}

          onBack={() => {
            setSelectedPlantId(
              null,
            )
          }}

          onAddEvent={() =>
            setIsAddEventOpen(
              true,
            )
          }

          onAddPlant={
            handleAddPlant
          }

          onAddGrowingPlace={
            handleAddGrowingPlace
          }

          onAddRecipe={
            handleAddRecipe
          }

          onAddIngredient={
            handleAddIngredient
          }

          onAddProduct={
            handleAddProduct
          }

          onDeleteEvent={
            handleDeleteEvent
          }

          onDeletePlant={
            handleDeletePlant
          }

          onUpdatePlant={
            handleUpdatePlant
          }
        />


        {/* =======================================
             ADD EVENT
        ======================================= */}

        {isAddEventOpen &&
          selectedPlantId && (
            <AddEventForm
              plantId={
                selectedPlantId
              }

              plants={
                gardenData.plantStories
              }

              growingPlaces={
                gardenData.growingPlaces
              }

              onAddEvent={
                handleAddEvent
              }

              onClose={() =>
                setIsAddEventOpen(
                  false,
                )
              }
            />
          )}

        {/* =======================================
             ADD / EDIT HARVEST
        ======================================= */}

        {isAddHarvestOpen && (
          <AddHarvestForm
            plants={
              gardenData.plantStories
            }

            growingPlaces={
              gardenData.growingPlaces
            }

            harvest={
              harvestEditorRecord
            }

            initialPlantStoryIds={
              harvestInitialPlantStoryIds
            }

            onSaveHarvest={(
              harvest,
            ) => {
              if (
                harvestEditorRecord
              ) {
                handleUpdateHarvest(
                  harvest,
                )
              } else {
                handleAddHarvest(
                  harvest,
                )
              }

              handleCloseHarvestEditor()
            }}

            onClose={
              handleCloseHarvestEditor
            }
          />
        )}

        {/* =======================================
             ADD GARDEN RECIPE
        ======================================= */}

        {isAddRecipeOpen && (
          <AddRecipeForm
            ingredients={
              gardenData.ingredients ??
              []
            }

            products={
              gardenData.products ??
              []
            }

            growingSetups={
              gardenData.growingSetups ??
              []
            }

            onAddRecipe={
              handleAddRecipe
            }

            onAddIngredient={
              handleAddIngredient
            }

            onAddProduct={
              handleAddProduct
            }

            onAddPurchase={
              handleAddPurchase
            }

            onClose={() =>
              setIsAddRecipeOpen(
                false,
              )
            }
          />
        )}
      </>
    )
  }

/* =======================================
   COMPARISONS
======================================= */

if (
  activePage ===
  'comparisons'
) {
  return (
    <Comparisons
      comparisons={
        gardenData.savedComparisons ??
        []
      }

      plants={
        gardenData.plantStories
      }

      onOpenComparison={(
        comparison,
      ) => {
        const plantIds =
          comparison.items
            .filter(
              (
                item,
              ) =>
                item.recordType ===
                'plant-story',
            )
            .map(
              (
                item,
              ) =>
                item.recordId,
            )

        setComparisonPlantIds(
          plantIds,
        )

        setActiveSavedComparisonId(
          comparison.id,
        )

        setActivePage(
          'comparison',
        )
      }}

      onRenameComparison={
        handleRenameSavedComparison
      }

      onDeleteComparison={
        handleDeleteSavedComparison
      }

      onNavigate={
        handleNavigate
      }
    />
  )
}


  /* =======================================
     JOURNAL
  ======================================= */

  if (
    activePage ===
    'journal'
  ) {
    return (
      <>
        <Journal
          events={
            gardenData.events
          }

          plants={
            gardenData.plantStories
          }

          onAddEntry={() => {
            setSelectedPlantId(
              null,
            )

            setSelectedEventId(
              null,
            )

            setSelectedGrowingPlaceId(
              null,
            )

            setLibraryRecipeIdToOpen(
              null,
            )

            setIsAddEventOpen(
              true,
            )
          }}

          onOpenEntry={
            setSelectedEventId
          }

          onDeleteEvent={
            handleDeleteEvent
          }

          onNavigate={
            handleNavigate
          }
        />

        {isAddEventOpen && (
          <AddEventForm
            plantId=""

            plants={
              gardenData.plantStories
            }

            growingPlaces={
              gardenData.growingPlaces
            }

            onAddEvent={
              handleAddEvent
            }

            onClose={() =>
              setIsAddEventOpen(
                false,
              )
            }
          />
        )}

        {isAddRecipeOpen && (
          <AddRecipeForm
            ingredients={
              gardenData.ingredients ??
              []
            }

            products={
              gardenData.products ??
              []
            }

            growingSetups={
              gardenData.growingSetups ??
              []
            }

            onAddRecipe={
              handleAddRecipe
            }

            onAddIngredient={
              handleAddIngredient
            }

            onAddProduct={
              handleAddProduct
            }

            onAddPurchase={
              handleAddPurchase
            }

            onClose={() =>
              setIsAddRecipeOpen(
                false,
              )
            }
          />
        )}
      </>
    )
  }

  /* =======================================
     PLANTS
  ======================================= */

  if (
    activePage ===
    'plants'
  ) {
    return (
      <>
                          <Plants
                    plants={
                      gardenData.plantStories
                    }

                    onOpenPlant={
                      handleOpenPlantRecord
                    }

                    onAddPlant={() =>
                      setIsAddPlantOpen(
                        true,
                      )
                    }

                    initialComparePlantIds={
                      activeSavedComparisonId
                        ? comparisonPlantIds
                        : []
                    }

                    onComparePlants={(
                      plantIds,
                    ) => {
                      setComparisonPlantIds(
                        plantIds,
                      )

                      setActivePage(
                        'comparison',
                      )
                    }}

                    onNavigate={
                      handleNavigate
                    }
                  />


        {/* =======================================
             ADD PLANT
        ======================================= */}

{isAddPlantOpen && (
          <AddPlantForm
            GrowingPlaces={
              gardenData.growingPlaces
            }

            GrowingSetups={
              gardenData.growingSetups ??
              []
            }

            Ingredients={
              gardenData.ingredients ??
              []
            }

            Products={
              gardenData.products ??
              []
            }

            onAddPlant={
              handleAddPlant
            }

            onAddGrowingPlace={
              handleAddGrowingPlace
            }

            onAddIngredient={
              handleAddIngredient
            }

            onAddProduct={
              handleAddProduct
            }

            onAddRecipe={
              handleAddRecipe
            }

            onClose={() =>
              setIsAddPlantOpen(
                false,
              )
            }
          />
        )}


        {/* =======================================
             ADD GROWING RECIPE
        ======================================= */}

        {isAddRecipeOpen && (
          <AddRecipeForm
            ingredients={
              gardenData.ingredients ??
              []
            }

            products={
              gardenData.products ??
              []
            }

            growingSetups={
              gardenData.growingSetups ??
              []
            }

            onAddRecipe={
              handleAddRecipe
            }

            onAddIngredient={
              handleAddIngredient
            }

            onAddProduct={
              handleAddProduct
            }

            onAddPurchase={
              handleAddPurchase
            }

            onClose={() =>
              setIsAddRecipeOpen(
                false,
              )
            }
          />
        )}
      </>
    )
  }
  /* =======================================
     GROWING PLACES
  ======================================= */

  if (
    activePage ===
    'growing-places'
  ) {
    return (
      <>
        <GardenPlaces
          gardenPlaces={
            gardenData.growingPlaces
          }
          onAddPlace={() =>
            setIsAddGrowingPlaceOpen(
              true,
            )
          }
          onOpenPlace={
            handleOpenGrowingPlaceRecord
          }
          onNavigate={
            handleNavigate
          }
        />

        {isAddGrowingPlaceOpen && (
          <AddGrowingPlaceForm
            ingredients={
              gardenData.ingredients ??
              []
            }
            growingSetups={
              gardenData.growingSetups ??
              []
            }
            products={
              gardenData.products ??
              []
            }
            onAddIngredient={
              handleAddIngredient
            }
            onAddProduct={
              handleAddProduct
            }
            onAddPlace={(
              newPlace,
              newSetup,
            ) => {
              handleAddGrowingPlace(
                newPlace,
                newSetup,
              )

              setIsAddGrowingPlaceOpen(
                false,
              )
            }}
            onClose={() =>
              setIsAddGrowingPlaceOpen(
                false,
              )
            }
          />
        )}
      </>
    )
  }
  /* =======================================
     HARVEST
  ======================================= */

  if (
    activePage ===
    'harvest'
  ) {
    return (
      <>
        <Harvest
          harvests={
            gardenData.harvests
          }

          plants={
            gardenData.plantStories
          }

          onRecordHarvest={() =>
            handleOpenNewHarvest()
          }

          onOpenHarvest={(
            harvestId,
          ) =>
            setSelectedHarvestId(
              harvestId,
            )
          }

          onNavigate={
            handleNavigate
          }
        />

        {isAddHarvestOpen && (
          <AddHarvestForm
            plants={
              gardenData.plantStories
            }

            growingPlaces={
              gardenData.growingPlaces
            }

            harvest={
              harvestEditorRecord
            }

            initialPlantStoryIds={
              harvestInitialPlantStoryIds
            }

            onSaveHarvest={(
              harvest,
            ) => {
              if (
                harvestEditorRecord
              ) {
                handleUpdateHarvest(
                  harvest,
                )
              } else {
                handleAddHarvest(
                  harvest,
                )
              }

              /*
               * Open the record after saving.
               *
               * This also gives clear confirmation
               * that the Harvest was actually saved,
               * preventing accidental double entries.
               */
              setSelectedHarvestId(
                harvest.id,
              )

              handleCloseHarvestEditor()
            }}

            onClose={
              handleCloseHarvestEditor
            }
          />
        )}
      </>
    )
  }


  /* =======================================
   BACKUP & RESTORE
======================================= */

if (
  activePage ===
  'backup'
) {
  return (
    <BackupRestore
      gardenData={
        gardenData
      }

      onRestoreGarden={
        handleRestoreGarden
      }

      onNavigate={
        handleNavigate
      }
    />
  )
}


  /* =======================================
     LIBRARY
  ======================================= */

  if (
    activePage ===
    'library'
  ) {
    return (
      <AppLibrary
        purchases={
          gardenData.purchases ??
          []
        }

        recipes={
          gardenData.growingSetups ??
          []
        }

        ingredients={
          gardenData.ingredients ??
          []
        }

        products={
          gardenData.products ??
          []
        }

        plants={
          gardenData.plantStories
        }

        growingPlaces={
          gardenData.growingPlaces
        }

        initialRecipeId={
          libraryRecipeIdToOpen
        }

        initialView={
          libraryViewToOpen
        }

        onAddRecipe={
          handleAddRecipe
        }

        onUpdateRecipe={
          handleUpdateRecipe
        }

        onDeleteRecipe={
          handleDeleteRecipe
        }

        onAddIngredient={
          handleAddIngredient
        }

        onUpdateIngredient={
          handleUpdateIngredient
        }

        onDeleteIngredient={
          handleDeleteIngredient
        }

        onAddProduct={
          handleAddProduct
        }

        onUpdateProduct={
          handleUpdateProduct
        }

        onDeleteProduct={
          handleDeleteProduct
        }

        onAddPurchase={
          handleAddPurchase
        }

        onUpdatePurchase={
          handleUpdatePurchase
        }

        onOpenGrowingPlace={
          handleOpenGrowingPlaceRecord
        }

        onOpenPlant={
          handleOpenPlantRecord
        }

        onNavigate={
          handleNavigate
        }
      />
    )
  }
  /* =======================================
     GATE
  ======================================= */

  return (
    <>
      <Gate
        plants={
          gardenData.plantStories
        }

        onOpenPlant={
          handleOpenPlantRecord
        }

        onAddPlant={() =>
          setIsAddPlantOpen(
            true,
          )
        }

        onAddEntry={() => {
          setSelectedPlantId(
            null,
          )

          setSelectedEventId(
            null,
          )

          setSelectedGrowingPlaceId(
            null,
          )

          setLibraryRecipeIdToOpen(
            null,
          )

          setIsAddEventOpen(
            true,
          )
        }}

        onNavigate={
          handleNavigate
        }
      />

      {isAddPlantOpen && (
        <AddPlantForm
          GrowingPlaces={
            gardenData.growingPlaces
          }

          GrowingSetups={
            gardenData.growingSetups ??
            []
          }

          Ingredients={
            gardenData.ingredients ??
            []
          }

          Products={
            gardenData.products ??
            []
          }

          onAddPlant={
            handleAddPlant
          }

          onAddGrowingPlace={
            handleAddGrowingPlace
          }

          onAddIngredient={
            handleAddIngredient
          }

          onAddProduct={
            handleAddProduct
          }

          onAddRecipe={
            handleAddRecipe
          }

          onClose={() =>
            setIsAddPlantOpen(
              false,
            )
          }
        />
      )}

      {isAddEventOpen && (
        <AddEventForm
          plantId=""

          plants={
            gardenData.plantStories
          }

          growingPlaces={
            gardenData.growingPlaces
          }

          onAddEvent={
            handleAddEvent
          }

          onClose={() =>
            setIsAddEventOpen(
              false,
            )
          }
        />
      )}

      {isAddRecipeOpen && (
        <AddRecipeForm
          ingredients={
            gardenData.ingredients ??
            []
          }

          products={
            gardenData.products ??
            []
          }

          growingSetups={
            gardenData.growingSetups ??
            []
          }

          onAddRecipe={
            handleAddRecipe
          }

          onAddIngredient={
            handleAddIngredient
          }

          onAddProduct={
            handleAddProduct
          }

          onAddPurchase={
            handleAddPurchase
          }

          onClose={() =>
            setIsAddRecipeOpen(
              false,
            )
          }
        />
      )}
    </>
  )
}

export default App