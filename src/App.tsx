import { useState } from 'react'

import './css/App.css'

import AppLibrary from './components/app/AppLibrary'

import AddEventForm from './components/forms/AddEventForm'
import AddPlantForm from './components/forms/AddPlantForm'
import AddRecipeForm from './components/forms/AddRecipeForm'
import AddGrowingPlaceForm from './components/forms/AddGrowingPlaceForm'
import AddHarvestForm from './components/forms/AddHarvestForm'
import PurchaseEditor from './components/purchases/PurchaseEditor'
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
import Calendar from './pages/Calendar'

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
  GardenPlan,
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
     PLAN → REALITY
  ======================================= */

  /*
   * One temporary bridge carries a saved Plan
   * into whichever real Sprig record owns what
   * actually happened.
   *
   * The Plan remains an intention. The editor
   * receives it only as suggested starting data.
   */

  const [
    planToRecord,
    setPlanToRecord,
  ] =
    useState<GardenPlan | null>(
      null,
    )


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
         SELECTED PURCHASE
      ======================================= */
    
      const [
        selectedPurchase,
        setSelectedPurchase,
      ] =
        useState<PurchaseRecord | null>(
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

    setPlanToRecord(
      null,
    )


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
     OPEN JOURNAL RECORD
  ======================================= */

  function handleOpenJournalRecord(
    eventId: string,
  ) {
    setSelectedPlantId(
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
      'journal',
    )

    setSelectedEventId(
      eventId,
    )
  }


  /* =======================================
     OPEN HARVEST RECORD
  ======================================= */

  function handleOpenHarvestRecord(
    harvestId: string,
  ) {
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
  }


  /* =======================================
     OPEN PURCHASE RECORD
  ======================================= */

  function handleOpenPurchaseRecord(
    purchaseId: string,
  ) {
    const purchase =
      (
        gardenData.purchases ??
        []
      ).find(
        item =>
          item.id ===
          purchaseId,
      )


    if (
      !purchase
    ) {
      return
    }


    setSelectedPurchase(
      purchase,
    )
  }


  /* =======================================
     OPEN GROWING RECIPE RECORD
  ======================================= */

  function handleOpenGrowingRecipeRecord(
    recipeId: string,
  ) {
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
      recipeId,
    )

    setLibraryViewToOpen(
      'growing-recipes',
    )

    setActivePage(
      'library',
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
     OPEN PLAN AS REAL RECORD
  ======================================= */

  function handleRecordGardenPlan(
    plan: GardenPlan,
  ) {
    if (
      plan.status !==
      'planned'
    ) {
      return
    }


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

    setHarvestEditorRecord(
      null,
    )

    setHarvestInitialPlantStoryIds(
      [],
    )

    setPlanToRecord(
      plan,
    )


    switch (
      plan.kind
    ) {
      case 'sow':
      case 'plant':
        setIsAddPlantOpen(
          true,
        )
        return

      case 'plant-out':
      case 'move':
      case 'feed':
      case 'treat':
      case 'garden-task':
      case 'other':
        setIsAddEventOpen(
          true,
        )
        return

      case 'harvest':
        setHarvestInitialPlantStoryIds(
          [
            ...(plan.plantStoryIds ??
              []),
          ],
        )

        setIsAddHarvestOpen(
          true,
        )
        return

      case 'buy':
        return

      default:
        setPlanToRecord(
          null,
        )
    }
  }


  /* =======================================
     PLAN RESULT HELPER
  ======================================= */

  function getRecordedPlan(
    sourcePlan: GardenPlan,
    recordType:
      | 'plant-story'
      | 'garden-event'
      | 'harvest'
      | 'purchase',
    recordId: string,
    recordedAt: string,
  ): GardenPlan {
    const existingResults =
      sourcePlan.results ??
      []


    const alreadyLinked =
      existingResults.some(
        result =>
          result.recordType ===
            recordType &&
          result.recordId ===
            recordId,
      )


    return {
      ...sourcePlan,

      status:
        'recorded',

      results:
        alreadyLinked
          ? existingResults
          : [
              ...existingResults,

              {
                recordType,
                recordId,
                recordedAt,
              },
            ],

      updatedAt:
        recordedAt,
    }
  }


  function replaceRecordedPlan(
    plans: GardenPlan[],
    recordedPlan: GardenPlan,
  ): GardenPlan[] {
    return plans.map(
      plan =>
        plan.id ===
        recordedPlan.id
          ? recordedPlan
          : plan,
    )
  }


  /* =======================================
     SAVE PLANT STORY FROM PLAN
  ======================================= */

  function handleAddPlantFromPlan(
    newPlant: PlantStory,
  ) {
    const sourcePlan =
      planToRecord


    if (
      !sourcePlan
    ) {
      handleAddPlant(
        newPlant,
      )

      return
    }


    const now =
      new Date()
        .toISOString()


    const recordedPlan =
      getRecordedPlan(
        sourcePlan,
        'plant-story',
        newPlant.id,
        now,
      )


    const updatedGardenData = {
      ...gardenData,

      plantStories: [
        ...gardenData.plantStories,
        newPlant,
      ],

      plans:
        replaceRecordedPlan(
          gardenData.plans ??
            [],
          recordedPlan,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )


    setPlanToRecord(
      null,
    )

    setIsAddPlantOpen(
      false,
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

    setActivePage(
      'plants',
    )

    setSelectedPlantId(
      newPlant.id,
    )
  }


  /* =======================================
     CLOSE PLAN → PLANT BRIDGE
  ======================================= */

  function handleClosePlanPlantEditor() {
    setIsAddPlantOpen(
      false,
    )

    setPlanToRecord(
      null,
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
            setup =>
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
        setup =>
          setup.id ===
          newRecipe.id,
      )


    if (
      alreadyExists
    ) {
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
          recipe =>
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
          recipe =>
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
        ingredient =>
          ingredient.id ===
          newIngredient.id,
      )


    if (
      alreadyExists
    ) {
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
          ingredient =>
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
          ingredient =>
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
      currentGardenData => {
        const existingProducts =
          currentGardenData.products ??
          []


        const alreadyExists =
          existingProducts.some(
            product =>
              product.id ===
              newProduct.id,
          )


        if (
          alreadyExists
        ) {
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
          product =>
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
          product =>
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
      currentGardenData => {
        const existingPurchases =
          currentGardenData.purchases ??
          []


        const alreadyExists =
          existingPurchases.some(
            purchase =>
              purchase.id ===
              newPurchase.id,
          )


        if (
          alreadyExists
        ) {
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
     SAVE PURCHASE FROM PLAN
  ======================================= */

  function handleAddPurchaseFromPlan(
    newPurchase: PurchaseRecord,
  ) {
    const sourcePlan =
      planToRecord


    if (
      !sourcePlan
    ) {
      handleAddPurchase(
        newPurchase,
      )

      return
    }


    const now =
      new Date()
        .toISOString()


    const recordedPlan =
      getRecordedPlan(
        sourcePlan,
        'purchase',
        newPurchase.id,
        now,
      )


    const updatedGardenData = {
      ...gardenData,

      purchases: [
        ...(gardenData.purchases ??
          []),
        newPurchase,
      ],

      plans:
        replaceRecordedPlan(
          gardenData.plans ??
            [],
          recordedPlan,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )


    setPlanToRecord(
      null,
    )
  }


  function getBuyPlanItemName(
    plan: GardenPlan,
  ): string {
    const cleanedTitle =
      plan.title
        .trim()
        .replace(
          /^buy\s+/i,
          '',
        )
        .trim()


    return (
      cleanedTitle ||
      'Garden purchase'
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
          purchase =>
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
        plantStoryId => ({
          recordType:
            'plant-story' as const,

          recordId:
            plantStoryId,
        }),
      )


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
            comparison =>
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
     SAVE JOURNAL EVENT FROM PLAN
  ======================================= */

  function handleAddEventFromPlan(
    newEvent: GardenEvent,
  ) {
    const sourcePlan =
      planToRecord


    if (
      !sourcePlan
    ) {
      handleAddEvent(
        newEvent,
      )

      return
    }


    const now =
      new Date()
        .toISOString()


    const recordedPlan =
      getRecordedPlan(
        sourcePlan,
        'garden-event',
        newEvent.id,
        now,
      )


    const shouldUpdateGrowingJourney =
      sourcePlan.kind ===
        'plant-out' ||
      sourcePlan.kind ===
        'move'


    const actualGrowingPlaceId =
      newEvent.growingPlaceIds?.length ===
      1
        ? newEvent.growingPlaceIds[0]
        : undefined


    const affectedPlantIds =
      new Set(
        newEvent.plantStoryIds ??
          [],
      )


    const updatedPlantStories =
      gardenData.plantStories.map(
        plant => {
          if (
            !shouldUpdateGrowingJourney ||
            !affectedPlantIds.has(
              plant.id,
            )
          ) {
            return plant
          }


          let nextPlant:
            PlantStory = {
              ...plant,
            }


          if (
            sourcePlan.kind ===
            'plant-out'
          ) {
            nextPlant = {
              ...nextPlant,

              plantedOutDate:
                newEvent.date,
            }


            if (
              sourcePlan.timingAssumption
            ) {
              nextPlant = {
                ...nextPlant,

                expectedHarvestDaysMin:
                  sourcePlan
                    .timingAssumption
                    .daysMin,

                expectedHarvestDaysMax:
                  sourcePlan
                    .timingAssumption
                    .daysMax,

                harvestTimingReference: {
                  sourceType:
                    'garden-event',

                  eventId:
                    newEvent.id,
                },
              }
            }
          }


          if (
            !actualGrowingPlaceId ||
            actualGrowingPlaceId ===
              plant.currentGrowingPlaceId
          ) {
            return nextPlant
          }


          const previousGrowingPlaceIds =
            [
              ...(plant.previousGrowingPlaceIds ??
                []),
            ]


          if (
            plant.currentGrowingPlaceId &&
            !previousGrowingPlaceIds.includes(
              plant.currentGrowingPlaceId,
            )
          ) {
            previousGrowingPlaceIds.push(
              plant.currentGrowingPlaceId,
            )
          }


          const nextGrowingHistory =
            [
              ...(plant.growingHistory ??
                []),
            ].map(
              entry => ({
                ...entry,
              }),
            )


          if (
            nextGrowingHistory.length ===
              0 &&
            (
              plant.currentGrowingPlaceId ||
              plant.currentGrowingSetupId
            )
          ) {
            nextGrowingHistory.push({
              id:
                crypto.randomUUID(),

              startedDate:
                plant.plantedOutDate ??
                plant.plantedDate,

              endedDate:
                newEvent.date,

              growingPlaceId:
                plant.currentGrowingPlaceId,

              growingSetupId:
                plant.currentGrowingSetupId,

              notes:
                'Earlier growing arrangement carried forward from this existing Plant Story. Its exact starting date was not separately recorded.',
            })
          } else {
            for (
              let index =
                nextGrowingHistory.length -
                1;
              index >=
                0;
              index -=
                1
            ) {
              if (
                !nextGrowingHistory[
                  index
                ].endedDate
              ) {
                nextGrowingHistory[
                  index
                ] = {
                  ...nextGrowingHistory[
                    index
                  ],

                  endedDate:
                    newEvent.date,
                }

                break
              }
            }
          }


          nextGrowingHistory.push({
            id:
              crypto.randomUUID(),

            startedDate:
              newEvent.date,

            growingPlaceId:
              actualGrowingPlaceId,

            growingSetupId:
              plant.currentGrowingSetupId,

            gardenEventId:
              newEvent.id,
          })


          return {
            ...nextPlant,

            currentGrowingPlaceId:
              actualGrowingPlaceId,

            previousGrowingPlaceIds,

            growingHistory:
              nextGrowingHistory,
          }
        },
      )


    const updatedGardenData = {
      ...gardenData,

      events: [
        ...gardenData.events,
        newEvent,
      ],

      plantStories:
        updatedPlantStories,

      plans:
        replaceRecordedPlan(
          gardenData.plans ??
            [],
          recordedPlan,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )


    setPlanToRecord(
      null,
    )

    setIsAddEventOpen(
      false,
    )


    handleOpenJournalRecord(
      newEvent.id,
    )
  }


  /* =======================================
     ADD GARDEN PLAN
  ======================================= */

  function handleAddGardenPlan(
    newPlan: GardenPlan,
  ) {
    const updatedGardenData = {
      ...gardenData,

      plans: [
        ...(gardenData.plans ??
          []),

        newPlan,
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
     UPDATE GARDEN PLAN
  ======================================= */

  function handleUpdateGardenPlan(
    updatedPlan: GardenPlan,
  ) {
    const now =
      new Date()
        .toISOString()


    const planToSave:
      GardenPlan = {
        ...updatedPlan,

        updatedAt:
          now,
      }


    const updatedGardenData = {
      ...gardenData,

      plans:
        (
          gardenData.plans ??
          []
        ).map(
          plan =>
            plan.id ===
            planToSave.id
              ? planToSave
              : plan,
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
     RENAME SAVED COMPARISON
  ======================================= */

  function handleRenameSavedComparison(
    comparisonId: string,
    name: string,
  ) {
    const trimmedName =
      name.trim()


    if (
      !trimmedName
    ) {
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
          comparison =>
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
          comparison =>
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
          event =>
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
     SAVE HARVEST FROM PLAN
  ======================================= */

  function handleAddHarvestFromPlan(
    newHarvest: HarvestRecord,
  ) {
    const sourcePlan =
      planToRecord


    if (
      !sourcePlan
    ) {
      handleAddHarvest(
        newHarvest,
      )

      return
    }


    const now =
      new Date()
        .toISOString()


    const recordedPlan =
      getRecordedPlan(
        sourcePlan,
        'harvest',
        newHarvest.id,
        now,
      )


    const updatedGardenData = {
      ...gardenData,

      harvests: [
        ...gardenData.harvests,
        newHarvest,
      ],

      plans:
        replaceRecordedPlan(
          gardenData.plans ??
            [],
          recordedPlan,
        ),
    }


    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )


    setPlanToRecord(
      null,
    )

    handleCloseHarvestEditor()

    handleOpenHarvestRecord(
      newHarvest.id,
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
          harvest =>
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
          harvest =>
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

    if (
      planToRecord?.kind ===
      'harvest'
    ) {
      setPlanToRecord(
        null,
      )
    }
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
          plant =>
            plant.id !==
            plantId,
        ),

      events:
        gardenData.events.filter(
          event =>
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
          plant =>
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


    saveGardenData(
      restoredGardenData,
    )

    setGardenData(
      restoredGardenData,
    )

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

    setPlanToRecord(
      null,
    )

    setActivePage(
      'gate',
    )
  }


  /* =======================================
     CURRENT HARVEST
  ======================================= */

  const selectedHarvest =
    gardenData.harvests.find(
      harvest =>
        harvest.id ===
        selectedHarvestId,
    )


  /* =======================================
     CURRENT PLANT
  ======================================= */

  const selectedPlant =
    gardenData.plantStories.find(
      plant =>
        plant.id ===
        selectedPlantId,
    )


  /* =======================================
     CURRENT JOURNAL ENTRY
  ======================================= */

  const selectedEvent =
    gardenData.events.find(
      event =>
        event.id ===
        selectedEventId,
    )


  /* =======================================
     CURRENT GROWING PLACE
  ======================================= */

  const selectedGrowingPlace =
    gardenData.growingPlaces.find(
      place =>
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

          onOpenPlant={(
            plantId,
          ) => {
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

          onOpenHarvest={
            handleOpenHarvestRecord
          }

          onAddHarvest={(
            plantStoryIds,
          ) =>
            handleOpenNewHarvest(
              plantStoryIds,
            )
          }

          onOpenJournalEntry={
            handleOpenJournalRecord
          }

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
                item =>
                  item.recordType ===
                  'plant-story',
              )
              .map(
                item =>
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

          onAddPlant={() => {
            setPlanToRecord(
              null,
            )

            setIsAddPlantOpen(
              true,
            )
          }}

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

            planToRecord={
              planToRecord ??
                undefined
            }

            onAddPlant={
              planToRecord
                ? handleAddPlantFromPlan
                : handleAddPlant
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

            onClose={
              planToRecord
                ? handleClosePlanPlantEditor
                : () =>
                    setIsAddPlantOpen(
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
     CALENDAR & PLANNING
  ======================================= */

  if (
    activePage ===
    'calendar'
  ) {
    return (
      <>
        <Calendar
          gardenData={
            gardenData
          }

          onAddPlan={
            handleAddGardenPlan
          }

          onUpdatePlan={
            handleUpdateGardenPlan
          }

          onRecordPlan={
            handleRecordGardenPlan
          }

          onOpenPlant={
            handleOpenPlantRecord
          }

          onOpenJournalEntry={
            handleOpenJournalRecord
          }

          onOpenHarvest={
            handleOpenHarvestRecord
          }
          
          onOpenPurchase={
            handleOpenPurchaseRecord
          }
          
          onOpenGrowingPlace={
            handleOpenGrowingPlaceRecord
          }

          onOpenGrowingRecipe={
            handleOpenGrowingRecipeRecord
          }

          onNavigate={
            handleNavigate
          }
        />


        {selectedPurchase && (
          <PurchaseEditor
            purchase={
              selectedPurchase
            }

            mode="edit"

            itemType={
              selectedPurchase.itemType
            }

            itemName={
              selectedPurchase.itemName
            }

            onSave={purchase => {
              handleUpdatePurchase(
                purchase,
              )

              setSelectedPurchase(
                null,
              )
            }}

            onClose={() =>
              setSelectedPurchase(
                null,
              )
            }
          />
        )}


        {isAddPlantOpen &&
          planToRecord &&
          (
            planToRecord.kind ===
              'sow' ||
            planToRecord.kind ===
              'plant'
          ) && (
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

            planToRecord={
              planToRecord
            }

            onAddPlant={
              handleAddPlantFromPlan
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

            onClose={
              handleClosePlanPlantEditor
            }
          />
        )}


        {isAddEventOpen &&
          planToRecord &&
          (
            planToRecord.kind ===
              'plant-out' ||
            planToRecord.kind ===
              'move' ||
            planToRecord.kind ===
              'feed' ||
            planToRecord.kind ===
              'treat' ||
            planToRecord.kind ===
              'garden-task' ||
            planToRecord.kind ===
              'other'
          ) && (
          <AddEventForm
            plantId=""

            plants={
              gardenData.plantStories
            }

            growingPlaces={
              gardenData.growingPlaces
            }

            planToRecord={
              planToRecord
            }

            onAddEvent={
              handleAddEventFromPlan
            }

            onClose={() => {
              setIsAddEventOpen(
                false,
              )

              setPlanToRecord(
                null,
              )
            }}
          />
        )}


        {isAddHarvestOpen &&
          planToRecord?.kind ===
            'harvest' && (
          <AddHarvestForm
            plants={
              gardenData.plantStories
            }

            growingPlaces={
              gardenData.growingPlaces
            }

            harvest={
              null
            }

            initialPlantStoryIds={
              harvestInitialPlantStoryIds
            }

            planToRecord={
              planToRecord
            }

            onSaveHarvest={
              handleAddHarvestFromPlan
            }

            onClose={
              handleCloseHarvestEditor
            }
          />
        )}


        {planToRecord?.kind ===
          'buy' && (
          <PurchaseEditor
            purchase={
              null
            }

            mode="new"

            itemType="other"

            itemName={
              getBuyPlanItemName(
                planToRecord,
              )
            }

            planToRecord={
              planToRecord
            }

            onSave={
              handleAddPurchaseFromPlan
            }

            onClose={() =>
              setPlanToRecord(
                null,
              )
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

        onAddPlant={() => {
          setPlanToRecord(
            null,
          )

          setIsAddPlantOpen(
            true,
          )
        }}

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