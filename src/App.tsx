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
import GlobalSearch from './pages/GlobalSearch'
import GardenKnowledge from './pages/GardenKnowledge'
import GardenTrials from './pages/GardenTrials'

import type {
  GlobalSearchItem,
} from './utils/globalSearchUtils'

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
  GardenData,
  GardenEvent,
  GardenPlan,
  GardenProduct,
  GrowingPlace,
  GrowingSetup,
  Ingredient,
  KnowledgeRelationshipTargetType,
  PlantStory,
  PurchaseRecord,
  HarvestRecord,
  SavedComparison,
} from './types'


type SprigLibraryDestination =
  | 'library'
  | 'growing-recipes'
  | 'ingredients'
  | 'products'
  | null


interface SprigLibraryRecordDestination {
  recipeId: string | null
  ingredientId: string | null
  productId: string | null
}


const EMPTY_LIBRARY_RECORD_DESTINATION:
  SprigLibraryRecordDestination = {
    recipeId: null,
    ingredientId: null,
    productId: null,
  }


type SprigKnowledgeRecordType =
  | 'garden-note'
  | 'plant-reference'
  | 'saved-source'


interface SprigKnowledgeRecordDestination {
  sourceType:
    SprigKnowledgeRecordType

  recordId:
    string
}


interface SprigJourneyState {
  activePage:
    AppPage

  selectedPlantId:
    string | null

  selectedEventId:
    string | null

  selectedHarvestId:
    string | null

  selectedGrowingPlaceId:
    string | null

  selectedKnowledgeRecord:
    SprigKnowledgeRecordDestination | null

  selectedGardenTrialId:
    string | null

  libraryRecordToOpen:
    SprigLibraryRecordDestination

  libraryViewToOpen:
    SprigLibraryDestination

  comparisonPlantIds:
    string[]

  activeSavedComparisonId:
    string | null

  label:
    string
}


function App() {
  const [
    gardenData,
    setGardenData,
  ] =
    useState(
      loadGardenData,
    )


  const [
    hasEnteredGarden,
    setHasEnteredGarden,
  ] =
    useState(
      false,
    )


  const [
    isAddPlantOpen,
    setIsAddPlantOpen,
  ] =
    useState(
      false,
    )


  const [
    isAddEventOpen,
    setIsAddEventOpen,
  ] =
    useState(
      false,
    )


  const [
    isAddHarvestOpen,
    setIsAddHarvestOpen,
  ] =
    useState(
      false,
    )


  const [
    harvestEditorRecord,
    setHarvestEditorRecord,
  ] =
    useState<
      HarvestRecord | null
    >(
      null,
    )


  const [
    harvestInitialPlantStoryIds,
    setHarvestInitialPlantStoryIds,
  ] =
    useState<
      string[]
    >(
      [],
    )


  const [
    isAddRecipeOpen,
    setIsAddRecipeOpen,
  ] =
    useState(
      false,
    )


  const [
    isAddGrowingPlaceOpen,
    setIsAddGrowingPlaceOpen,
  ] =
    useState(
      false,
    )


  const [
    planToRecord,
    setPlanToRecord,
  ] =
    useState<
      GardenPlan | null
    >(
      null,
    )


  const [
    selectedPlantId,
    setSelectedPlantId,
  ] =
    useState<
      string | null
    >(
      null,
    )


  const [
    selectedEventId,
    setSelectedEventId,
  ] =
    useState<
      string | null
    >(
      null,
    )


  const [
    selectedHarvestId,
    setSelectedHarvestId,
  ] =
    useState<
      string | null
    >(
      null,
    )


  const [
    selectedGrowingPlaceId,
    setSelectedGrowingPlaceId,
  ] =
    useState<
      string | null
    >(
      null,
    )


  const [
    selectedKnowledgeRecord,
    setSelectedKnowledgeRecord,
  ] =
    useState<
      SprigKnowledgeRecordDestination | null
    >(
      null,
    )


  const [
    selectedGardenTrialId,
    setSelectedGardenTrialId,
  ] =
    useState<
      string | null
    >(
      null,
    )


  const [
    selectedPurchase,
    setSelectedPurchase,
  ] =
    useState<
      PurchaseRecord | null
    >(
      null,
    )


  const [
    comparisonPlantIds,
    setComparisonPlantIds,
  ] =
    useState<
      string[]
    >(
      [],
    )


  const [
    activeSavedComparisonId,
    setActiveSavedComparisonId,
  ] =
    useState<
      string | null
    >(
      null,
    )


  const [
    libraryRecordToOpen,
    setLibraryRecordToOpen,
  ] =
    useState<
      SprigLibraryRecordDestination
    >({
      ...EMPTY_LIBRARY_RECORD_DESTINATION,
    })


  const [
    libraryViewToOpen,
    setLibraryViewToOpen,
  ] =
    useState<
      SprigLibraryDestination
    >(
      null,
    )


  const [
    calendarDateToOpen,
    setCalendarDateToOpen,
  ] =
    useState<
      string | null
    >(
      null,
    )


  const [
    calendarPlanIdToOpen,
    setCalendarPlanIdToOpen,
  ] =
    useState<
      string | null
    >(
      null,
    )


  const [
    activePage,
    setActivePage,
  ] =
    useState<
      AppPage
    >(
      'gate',
    )


  const [
    journeyHistory,
    setJourneyHistory,
  ] =
    useState<
      SprigJourneyState[]
    >(
      [],
    )


  function getPageJourneyLabel(
    page:
      AppPage,
  ):
    string {
    switch (
      page
    ) {
      case 'gate':
        return 'Today in the Garden'

      case 'plants':
        return 'Plants'

      case 'comparisons':
        return 'Comparisons'

      case 'comparison':
        return 'Comparison'

      case 'growing-places':
        return 'Growing Places'

      case 'journal':
        return 'Journal'

      case 'harvest':
        return 'Harvests'

      case 'calendar':
        return 'Calendar'

      case 'search':
        return 'Search Sprig'

      case 'garden-notes':
        return 'Garden Notes'

      case 'garden-almanac':
        return 'Garden Almanac'

      case 'plant-reference':
        return 'Plant Reference'

      case 'saved-sources':
        return 'Saved Tips & Sources'

      case 'garden-trials':
        return 'Garden Trials'

      case 'library':
        return 'Garden Library'

      case 'backup':
        return 'Backup & Restore'

      default:
        return 'Sprig'
    }
  }


  function getCurrentJourneyLabel():
    string {
    if (
      selectedPlantId
    ) {
      const plant =
        gardenData
          .plantStories
          .find(
            story =>
              story.id ===
              selectedPlantId,
          )


      if (
        plant
      ) {
        return (
          plant.displayName ||
          plant.variety ||
          plant.plantName ||
          'Plant Story'
        )
      }
    }


    if (
      selectedEventId
    ) {
      const event =
        gardenData.events.find(
          gardenEvent =>
            gardenEvent.id ===
            selectedEventId,
        )


      if (
        event
      ) {
        return (
          event.title ||
          'Journal Entry'
        )
      }
    }


    if (
      selectedHarvestId
    ) {
      const harvest =
        gardenData
          .harvests
          .find(
            item =>
              item.id ===
              selectedHarvestId,
          )


      if (
        harvest
      ) {
        const names =
          harvest
            .plantStoryIds
            .map(
              plantId => {
                const plant =
                  gardenData
                    .plantStories
                    .find(
                      story =>
                        story.id ===
                        plantId,
                    )


                if (
                  !plant
                ) {
                  return null
                }


                return (
                  plant.displayName ||
                  plant.variety ||
                  plant.plantName ||
                  null
                )
              },
            )
            .filter(
              (
                name,
              ): name is string =>
                Boolean(
                  name,
                ),
            )


        if (
          names.length ===
          1
        ) {
          return `${names[0]} Harvest`
        }


        return 'Harvest Story'
      }
    }


    if (
      selectedGrowingPlaceId
    ) {
      const place =
        gardenData
          .growingPlaces
          .find(
            item =>
              item.id ===
              selectedGrowingPlaceId,
          )


      if (
        place
      ) {
        return (
          place.name ||
          'Growing Place'
        )
      }
    }


    if (
      selectedKnowledgeRecord
    ) {
      if (
        selectedKnowledgeRecord
          .sourceType ===
        'garden-note'
      ) {
        const note =
          (
            gardenData
              .gardenNotes ??
            []
          ).find(
            item =>
              item.id ===
              selectedKnowledgeRecord
                .recordId,
          )


        if (
          note
        ) {
          return (
            note.title?.trim() ||
            note.body
              .split(
                /\r?\n/,
              )
              .map(
                line =>
                  line.trim(),
              )
              .find(
                Boolean,
              ) ||
            'Garden Note'
          )
        }
      }


      if (
        selectedKnowledgeRecord
          .sourceType ===
        'plant-reference'
      ) {
        const reference =
          (
            gardenData
              .plantReferences ??
            []
          ).find(
            item =>
              item.id ===
              selectedKnowledgeRecord
                .recordId,
          )


        if (
          reference
        ) {
          return (
            [
              reference.plantName,
              reference.variety,
            ]
              .filter(
                Boolean,
              )
              .join(
                ' · ',
              ) ||
            'Plant Reference'
          )
        }
      }


      if (
        selectedKnowledgeRecord
          .sourceType ===
        'saved-source'
      ) {
        const source =
          (
            gardenData
              .savedKnowledgeSources ??
            []
          ).find(
            item =>
              item.id ===
              selectedKnowledgeRecord
                .recordId,
          )


        if (
          source
        ) {
          return (
            source.title ||
            'Saved Tip / Source'
          )
        }
      }
    }


    if (
      selectedGardenTrialId
    ) {
      const trial =
        (
          gardenData
            .gardenTrials ??
          []
        ).find(
          item =>
            item.id ===
            selectedGardenTrialId,
        )


      if (
        trial
      ) {
        return (
          trial.title ||
          'Garden Trial'
        )
      }
    }


    if (
      libraryRecordToOpen
        .recipeId
    ) {
      const recipe =
        gardenData
          .growingSetups
          .find(
            item =>
              item.id ===
              libraryRecordToOpen
                .recipeId,
          )


      if (
        recipe
      ) {
        return (
          recipe.name ||
          'Growing Recipe'
        )
      }
    }


    if (
      libraryRecordToOpen
        .ingredientId
    ) {
      const ingredient =
        (
          gardenData
            .ingredients ??
          []
        ).find(
          item =>
            item.id ===
            libraryRecordToOpen
              .ingredientId,
        )


      if (
        ingredient
      ) {
        return (
          ingredient.name ||
          'Ingredient'
        )
      }
    }


    if (
      libraryRecordToOpen
        .productId
    ) {
      const product =
        (
          gardenData
            .products ??
          []
        ).find(
          item =>
            item.id ===
            libraryRecordToOpen
              .productId,
        )


      if (
        product
      ) {
        return (
          product.name ||
          'Product'
        )
      }
    }


    if (
      activePage ===
      'library'
    ) {
      switch (
        libraryViewToOpen
      ) {
        case 'growing-recipes':
          return 'Growing Recipes'

        case 'ingredients':
          return 'Ingredients'

        case 'products':
          return 'Products'

        default:
          return 'Garden Library'
      }
    }


    if (
      activePage ===
      'comparison'
    ) {
      return 'Comparison'
    }


    return getPageJourneyLabel(
      activePage,
    )
  }


  function getCurrentJourneyState():
    SprigJourneyState {
    return {
      activePage,

      selectedPlantId,

      selectedEventId,

      selectedHarvestId,

      selectedGrowingPlaceId,

      selectedKnowledgeRecord:
        selectedKnowledgeRecord
          ? {
              ...selectedKnowledgeRecord,
            }
          : null,

      selectedGardenTrialId,

      libraryRecordToOpen: {
        ...libraryRecordToOpen,
      },

      libraryViewToOpen,

      comparisonPlantIds: [
        ...comparisonPlantIds,
      ],

      activeSavedComparisonId,

      label:
        getCurrentJourneyLabel(),
    }
  }


  function rememberCurrentJourneyState() {
    const current =
      getCurrentJourneyState()


    setJourneyHistory(
      history => [
        ...history,
        current,
      ],
    )
  }


  const previousJourneyState =
    journeyHistory[
      journeyHistory.length -
      1
    ] ??
    null


  const journeyBackLabel =
    previousJourneyState
      ? previousJourneyState.label
      : null


  function closeTransientNavigationState() {
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

    setSelectedPurchase(
      null,
    )
  }


  function restoreJourneyState(
    destination:
      SprigJourneyState,
  ) {
    closeTransientNavigationState()


    setSelectedPlantId(
      destination
        .selectedPlantId,
    )

    setSelectedEventId(
      destination
        .selectedEventId,
    )

    setSelectedHarvestId(
      destination
        .selectedHarvestId,
    )

    setSelectedGrowingPlaceId(
      destination
        .selectedGrowingPlaceId,
    )

    setSelectedKnowledgeRecord(
      destination
        .selectedKnowledgeRecord
        ? {
            ...destination
              .selectedKnowledgeRecord,
          }
        : null,
    )

    setSelectedGardenTrialId(
      destination
        .selectedGardenTrialId,
    )

    setLibraryRecordToOpen({
      ...destination
        .libraryRecordToOpen,
    })

    setLibraryViewToOpen(
      destination
        .libraryViewToOpen,
    )

    setComparisonPlantIds([
      ...destination
        .comparisonPlantIds,
    ])

    setActiveSavedComparisonId(
      destination
        .activeSavedComparisonId,
    )

    setActivePage(
      destination.activePage,
    )
  }


  function handleJourneyBack(
    fallbackPage:
      AppPage,
  ) {
    const previous =
      journeyHistory[
        journeyHistory.length -
        1
      ]


    if (
      !previous
    ) {
      closeTransientNavigationState()

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

      setSelectedKnowledgeRecord(
        null,
      )

      setSelectedGardenTrialId(
        null,
      )

      clearLibraryRecordDestination()

      setActivePage(
        fallbackPage,
      )

      return
    }


    setJourneyHistory(
      history =>
        history.slice(
          0,
          -1,
        ),
    )


    restoreJourneyState(
      previous,
    )
  }


  function handleNavigate(
    page:
      AppPage,

    libraryView?:
      Exclude<
        SprigLibraryDestination,
        null
      >,
  ) {
    setJourneyHistory(
      [],
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

    setSelectedKnowledgeRecord(
      null,
    )

    setSelectedGardenTrialId(
      null,
    )

    clearLibraryRecordDestination()

    closeTransientNavigationState()


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


  function clearLibraryRecordDestination() {
    setLibraryRecordToOpen({
      recipeId: null,
      ingredientId: null,
      productId: null,
    })
  }


  function prepareForRecordNavigation() {
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

    setSelectedKnowledgeRecord(
      null,
    )

    setSelectedGardenTrialId(
      null,
    )

    clearLibraryRecordDestination()
  }


  function prepareForLibraryRecord() {
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

    setSelectedKnowledgeRecord(
      null,
    )

    setSelectedGardenTrialId(
      null,
    )
  }


  function handleOpenPlantRecord(
    plantId:
      string,
  ) {
    rememberCurrentJourneyState()

    prepareForRecordNavigation()

    setActivePage(
      'plants',
    )

    setSelectedPlantId(
      plantId,
    )
  }


  function handleOpenGrowingPlaceRecord(
    growingPlaceId:
      string,
  ) {
    rememberCurrentJourneyState()

    prepareForRecordNavigation()

    setActivePage(
      'growing-places',
    )

    setSelectedGrowingPlaceId(
      growingPlaceId,
    )
  }


  function handleOpenJournalRecord(
    eventId:
      string,
  ) {
    rememberCurrentJourneyState()

    prepareForRecordNavigation()

    setActivePage(
      'journal',
    )

    setSelectedEventId(
      eventId,
    )
  }


  function handleOpenHarvestRecord(
    harvestId:
      string,
  ) {
    rememberCurrentJourneyState()

    prepareForRecordNavigation()

    setActivePage(
      'harvest',
    )

    setSelectedHarvestId(
      harvestId,
    )
  }


  function handleOpenPurchaseRecord(
    purchaseId:
      string,
  ) {
    const purchase =
      (
        gardenData
          .purchases ??
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


  function handleOpenGrowingRecipeRecord(
    recipeId:
      string,
  ) {
    rememberCurrentJourneyState()

    prepareForLibraryRecord()

    setLibraryRecordToOpen({
      recipeId,
      ingredientId: null,
      productId: null,
    })

    setLibraryViewToOpen(
      'growing-recipes',
    )

    setActivePage(
      'library',
    )
  }


  function handleOpenIngredientRecord(
    ingredientId:
      string,
  ) {
    rememberCurrentJourneyState()

    prepareForLibraryRecord()

    setLibraryRecordToOpen({
      recipeId: null,
      ingredientId,
      productId: null,
    })

    setLibraryViewToOpen(
      'ingredients',
    )

    setActivePage(
      'library',
    )
  }


  function handleOpenProductRecord(
    productId:
      string,
  ) {
    rememberCurrentJourneyState()

    prepareForLibraryRecord()

    setLibraryRecordToOpen({
      recipeId: null,
      ingredientId: null,
      productId,
    })

    setLibraryViewToOpen(
      'products',
    )

    setActivePage(
      'library',
    )
  }


  function handleOpenComparisonRecord(
    comparisonId:
      string,
  ) {
    const comparison =
      (
        gardenData
          .savedComparisons ??
        []
      ).find(
        item =>
          item.id ===
          comparisonId,
      )


    if (
      !comparison
    ) {
      return
    }


    rememberCurrentJourneyState()

    prepareForRecordNavigation()


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
  }


  function handleGardenTrialDataChange(
    updatedGardenData:
      GardenData,
  ) {
    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }


  function handleOpenGardenTrialRecord(
    trialId:
      string,
  ) {
    const trial =
      (
        gardenData
          .gardenTrials ??
        []
      ).find(
        item =>
          item.id ===
          trialId,
      )


    if (
      !trial
    ) {
      return
    }


    rememberCurrentJourneyState()

    prepareForRecordNavigation()

    setSelectedGardenTrialId(
      trialId,
    )

    setActivePage(
      'garden-trials',
    )
  }


  function handleGardenKnowledgeDataChange(
    updatedGardenData:
      GardenData,
  ) {
    setGardenData(
      updatedGardenData,
    )

    saveGardenData(
      updatedGardenData,
    )
  }


  function handleOpenKnowledgeRecord(
    sourceType:
      SprigKnowledgeRecordType,

    recordId:
      string,
  ) {
    rememberCurrentJourneyState()

    prepareForRecordNavigation()


    setSelectedKnowledgeRecord({
      sourceType,
      recordId,
    })


    if (
      sourceType ===
      'garden-note'
    ) {
      setActivePage(
        'garden-notes',
      )

      return
    }


    if (
      sourceType ===
      'plant-reference'
    ) {
      setActivePage(
        'plant-reference',
      )

      return
    }


    setActivePage(
      'saved-sources',
    )
  }


  function handleOpenKnowledgeRelationship(
    targetType:
      KnowledgeRelationshipTargetType,

    targetId:
      string,
  ) {
    switch (
      targetType
    ) {
      case 'plant-story':
        handleOpenPlantRecord(
          targetId,
        )
        return

      case 'garden-event':
        handleOpenJournalRecord(
          targetId,
        )
        return

      case 'harvest':
        handleOpenHarvestRecord(
          targetId,
        )
        return

      case 'growing-place':
        handleOpenGrowingPlaceRecord(
          targetId,
        )
        return

      case 'growing-setup':
        handleOpenGrowingRecipeRecord(
          targetId,
        )
        return

      case 'ingredient':
        handleOpenIngredientRecord(
          targetId,
        )
        return

      case 'product':
        handleOpenProductRecord(
          targetId,
        )
        return

      case 'purchase':
        handleOpenPurchaseRecord(
          targetId,
        )
        return

      case 'comparison':
        handleOpenComparisonRecord(
          targetId,
        )
        return

      case 'garden-trial':
        handleOpenGardenTrialRecord(
          targetId,
        )
        return

      case 'garden-note':
      case 'plant-reference':
      case 'saved-source':
        handleOpenKnowledgeRecord(
          targetType,
          targetId,
        )
        return

      case 'plan': {
        const plan =
          (
            gardenData.plans ??
            []
          ).find(
            item =>
              item.id ===
              targetId,
          )


        if (
          !plan
        ) {
          return
        }


        rememberCurrentJourneyState()

        prepareForRecordNavigation()

        setCalendarDateToOpen(
          plan.date,
        )

        setCalendarPlanIdToOpen(
          plan.id,
        )

        setActivePage(
          'calendar',
        )

        return
      }

      default:
        return
    }
  }


  function handleOpenGlobalSearchResult(
    item:
      GlobalSearchItem,
  ) {
    switch (
      item.sourceType
    ) {
      case 'plant-story':
        handleOpenPlantRecord(
          item.sourceId,
        )
        return

      case 'garden-event':
        handleOpenJournalRecord(
          item.sourceId,
        )
        return

      case 'harvest':
        handleOpenHarvestRecord(
          item.sourceId,
        )
        return

      case 'growing-place':
        handleOpenGrowingPlaceRecord(
          item.sourceId,
        )
        return

      case 'growing-setup':
        handleOpenGrowingRecipeRecord(
          item.sourceId,
        )
        return

      case 'ingredient':
        handleOpenIngredientRecord(
          item.sourceId,
        )
        return

      case 'product':
        handleOpenProductRecord(
          item.sourceId,
        )
        return

      case 'purchase':
        handleOpenPurchaseRecord(
          item.sourceId,
        )
        return

      case 'garden-note':
        handleOpenKnowledgeRecord(
          'garden-note',
          item.sourceId,
        )
        return

      case 'plant-reference':
        handleOpenKnowledgeRecord(
          'plant-reference',
          item.sourceId,
        )
        return

      case 'saved-source':
        handleOpenKnowledgeRecord(
          'saved-source',
          item.sourceId,
        )
        return

      case 'garden-trial':
        handleOpenGardenTrialRecord(
          item.sourceId,
        )
        return

      case 'comparison':
        handleOpenComparisonRecord(
          item.sourceId,
        )
        return

        case 'plan': {
          const actualPlan =
            (
              gardenData.plans ??
              []
            ).find(
              planItem =>
                planItem.id ===
                item.sourceId,
            )
  
  
          if (
            !actualPlan
          ) {
            return
          }
  
  
          const resultLinks =
            item.planResultLinks ??
            actualPlan.results ??
            []
  
  
          if (
            actualPlan.status ===
              'recorded' &&
            resultLinks.length ===
              1
          ) {
            const result =
              resultLinks[0]
  
  
            switch (
              result.recordType
            ) {
              case 'plant-story':
                handleOpenPlantRecord(
                  result.recordId,
                )
                return
  
              case 'garden-event':
                handleOpenJournalRecord(
                  result.recordId,
                )
                return
  
              case 'harvest':
                handleOpenHarvestRecord(
                  result.recordId,
                )
                return
  
              case 'purchase':
                handleOpenPurchaseRecord(
                  result.recordId,
                )
                return
            }
          }
  
  
          rememberCurrentJourneyState()
  
          prepareForRecordNavigation()
  
          setCalendarDateToOpen(
            actualPlan.date,
          )
  
          setCalendarPlanIdToOpen(
            actualPlan.id,
          )
  
          setActivePage(
            'calendar',
          )
  
          return
        }
    }
  }


  function handleAddPlant(
    newPlant:
      PlantStory,
  ) {
    const updatedGardenData = {
      ...gardenData,

      plantStories: [
        ...gardenData
          .plantStories,

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


  function handleRecordGardenPlan(
    plan:
      GardenPlan,
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


      case 'plant-out': {
        const hasExistingPlants =
          (
            plan.plantStoryIds ??
            []
          ).length >
          0


        const hasPlannedPlant =
          Boolean(
            plan.plannedPlant,
          )


        if (
          !hasExistingPlants &&
          hasPlannedPlant
        ) {
          setIsAddPlantOpen(
            true,
          )

          return
        }


        setIsAddEventOpen(
          true,
        )
        return
      }


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
        setHarvestInitialPlantStoryIds([
          ...(
            plan.plantStoryIds ??
            []
          ),
        ])

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


  function getRecordedPlan(
    sourcePlan:
      GardenPlan,

    recordType:
      | 'plant-story'
      | 'garden-event'
      | 'harvest'
      | 'purchase',

    recordId:
      string,

    recordedAt:
      string,
  ):
    GardenPlan {
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
    plans:
      GardenPlan[],

    recordedPlan:
      GardenPlan,
  ):
    GardenPlan[] {
    return plans.map(
      plan =>
        plan.id ===
        recordedPlan.id
          ? recordedPlan
          : plan,
    )
  }


  function handleAddPlantFromPlan(
    newPlant:
      PlantStory,
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
        ...gardenData
          .plantStories,

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

    handleOpenPlantRecord(
      newPlant.id,
    )
  }


  function handleClosePlanPlantEditor() {
    setIsAddPlantOpen(
      false,
    )

    setPlanToRecord(
      null,
    )
  }


  function handleAddGrowingPlace(
    newPlace:
      GrowingPlace,

    newSetup?:
      GrowingSetup,
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
      gardenData
        .growingSetups ??
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
        ...gardenData
          .growingPlaces,

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


  function handleAddRecipe(
    newRecipe:
      GrowingSetup,
  ) {
    const existing =
      gardenData
        .growingSetups ??
      []


    if (
      existing.some(
        recipe =>
          recipe.id ===
          newRecipe.id,
      )
    ) {
      setIsAddRecipeOpen(
        false,
      )
      return
    }


    const updatedGardenData = {
      ...gardenData,

      growingSetups: [
        ...existing,
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


  function handleUpdateRecipe(
    updatedRecipe:
      GrowingSetup,
  ) {
    const updatedGardenData = {
      ...gardenData,

      growingSetups:
        (
          gardenData
            .growingSetups ??
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


  function handleDeleteRecipe(
    recipeId:
      string,
  ) {
    const updatedGardenData = {
      ...gardenData,

      growingSetups:
        (
          gardenData
            .growingSetups ??
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


  function handleAddIngredient(
    newIngredient:
      Ingredient,
  ) {
    const existing =
      gardenData
        .ingredients ??
      []


    if (
      existing.some(
        ingredient =>
          ingredient.id ===
          newIngredient.id,
      )
    ) {
      return
    }


    const updatedGardenData = {
      ...gardenData,

      ingredients: [
        ...existing,
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


  function handleUpdateIngredient(
    updatedIngredient:
      Ingredient,
  ) {
    const updatedGardenData = {
      ...gardenData,

      ingredients:
        (
          gardenData
            .ingredients ??
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


  function handleDeleteIngredient(
    ingredientId:
      string,
  ) {
    const updatedGardenData = {
      ...gardenData,

      ingredients:
        (
          gardenData
            .ingredients ??
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


  function handleAddProduct(
    newProduct:
      GardenProduct,
  ) {
    setGardenData(
      current => {
        const existing =
          current.products ??
          []


        if (
          existing.some(
            product =>
              product.id ===
              newProduct.id,
          )
        ) {
          return current
        }


        const updated = {
          ...current,

          products: [
            ...existing,
            newProduct,
          ],
        }


        saveGardenData(
          updated,
        )


        return updated
      },
    )
  }


  function handleUpdateProduct(
    updatedProduct:
      GardenProduct,
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


  function handleDeleteProduct(
    productId:
      string,
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


  function handleAddPurchase(
    newPurchase:
      PurchaseRecord,
  ) {
    setGardenData(
      current => {
        const existing =
          current.purchases ??
          []


        if (
          existing.some(
            purchase =>
              purchase.id ===
              newPurchase.id,
          )
        ) {
          return current
        }


        const updated = {
          ...current,

          purchases: [
            ...existing,
            newPurchase,
          ],
        }


        saveGardenData(
          updated,
        )


        return updated
      },
    )
  }


  function handleAddPurchaseFromPlan(
    newPurchase:
      PurchaseRecord,
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
        ...(
          gardenData
            .purchases ??
          []
        ),

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
    plan:
      GardenPlan,
  ):
    string {
    return (
      plan.title
        .trim()
        .replace(
          /^buy\s+/i,
          '',
        )
        .trim() ||
      'Garden purchase'
    )
  }


  function handleUpdatePurchase(
    updatedPurchase:
      PurchaseRecord,
  ) {
    const updatedGardenData = {
      ...gardenData,

      purchases:
        (
          gardenData.purchases ??
          []
        ).map(
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


  function handleSavePlantComparison(
    name:
      string,

    plantStoryIds:
      string[],
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
            gardenData
              .savedComparisons ??
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
        ...(
          gardenData
            .savedComparisons ??
          []
        ),

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


  function handleAddEvent(
    newEvent:
      GardenEvent,
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


  function handleAddEventFromPlan(
    newEvent:
      GardenEvent,
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
      newEvent
        .growingPlaceIds
        ?.length ===
      1
        ? newEvent
            .growingPlaceIds[0]
        : undefined


    const affectedPlantIds =
      new Set(
        newEvent
          .plantStoryIds ??
        [],
      )


    const updatedPlantStories =
      gardenData
        .plantStories
        .map(
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
                sourcePlan
                  .timingAssumption
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


            const previousGrowingPlaceIds = [
              ...(
                plant
                  .previousGrowingPlaceIds ??
                []
              ),
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
                ...(
                  plant
                    .growingHistory ??
                  []
                ),
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
            }
            else {
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
                  nextGrowingHistory[index] = {
                    ...nextGrowingHistory[index],

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


  function handleAddGardenPlan(
    newPlan:
      GardenPlan,
  ) {
    const updatedGardenData = {
      ...gardenData,

      plans: [
        ...(
          gardenData.plans ??
          []
        ),

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


  function handleUpdateGardenPlan(
    updatedPlan:
      GardenPlan,
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


  function handleRenameSavedComparison(
    comparisonId:
      string,

    name:
      string,
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
          gardenData
            .savedComparisons ??
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


  function handleDeleteSavedComparison(
    comparisonId:
      string,
  ) {
    const updatedGardenData = {
      ...gardenData,

      savedComparisons:
        (
          gardenData
            .savedComparisons ??
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


  function handleDeleteEvent(
    eventId:
      string,
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


  function handleAddHarvest(
    newHarvest:
      HarvestRecord,
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


  function handleAddHarvestFromPlan(
    newHarvest:
      HarvestRecord,
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


  function handleUpdateHarvest(
    updatedHarvest:
      HarvestRecord,
  ) {
    const updatedGardenData = {
      ...gardenData,

      harvests:
        gardenData
          .harvests
          .map(
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


  function handleDeleteHarvest(
    harvestId:
      string,
  ) {
    const updatedGardenData = {
      ...gardenData,

      harvests:
        gardenData
          .harvests
          .filter(
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


  function handleOpenNewHarvest(
    plantStoryIds:
      string[] =
      [],
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


  function handleOpenEditHarvest(
    harvest:
      HarvestRecord,
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


  function handleDeletePlant(
    plantId:
      string,
  ) {
    const updatedGardenData = {
      ...gardenData,

      plantStories:
        gardenData
          .plantStories
          .filter(
            plant =>
              plant.id !==
              plantId,
          ),

      events:
        gardenData
          .events
          .filter(
            event =>
              !event
                .plantStoryIds
                .includes(
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

    setJourneyHistory(
      [],
    )
  }


  function handleUpdatePlant(
    updatedPlant:
      PlantStory,
  ) {
    const updatedGardenData = {
      ...gardenData,

      plantStories:
        gardenData
          .plantStories
          .map(
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

    setJourneyHistory(
      [],
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

    setSelectedKnowledgeRecord(
      null,
    )

    setSelectedGardenTrialId(
      null,
    )

    setSelectedPurchase(
      null,
    )

    clearLibraryRecordDestination()

    setLibraryViewToOpen(
      null,
    )

    closeTransientNavigationState()

    setActivePage(
      'gate',
    )
  }


  const selectedHarvest =
    gardenData.harvests.find(
      harvest =>
        harvest.id ===
        selectedHarvestId,
    )


  const selectedPlant =
    gardenData
      .plantStories
      .find(
        plant =>
          plant.id ===
          selectedPlantId,
      )


  const selectedEvent =
    gardenData.events.find(
      event =>
        event.id ===
        selectedEventId,
    )


  const selectedGrowingPlace =
    gardenData
      .growingPlaces
      .find(
        place =>
          place.id ===
          selectedGrowingPlaceId,
      )


  if (
    !hasEnteredGarden
  ) {
    return (
      <Welcome
        onEnter={
          () =>
            setHasEnteredGarden(
              true,
            )
        }
      />
    )
  }


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

          journeyBackLabel={
            journeyBackLabel
          }

          onBack={
            () =>
              handleJourneyBack(
                'harvest',
              )
          }

          onOpenHarvests={
            () =>
              handleNavigate(
                'harvest',
              )
          }

          onEdit={
            handleOpenEditHarvest
          }

          onRecordAnotherHarvest={
            harvest =>
              handleOpenNewHarvest(
                harvest.plantStoryIds,
              )
          }

          onDelete={
            harvestId => {
              handleDeleteHarvest(
                harvestId,
              )

              handleJourneyBack(
                'harvest',
              )
            }
          }

          onOpenPlant={
            handleOpenPlantRecord
          }

          onNavigate={
            handleNavigate
          }
        />


        {
          isAddHarvestOpen && (
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

              onSaveHarvest={
                harvest => {
                  if (
                    harvestEditorRecord
                  ) {
                    handleUpdateHarvest(
                      harvest,
                    )
                  }
                  else {
                    handleAddHarvest(
                      harvest,
                    )
                  }


                  setSelectedHarvestId(
                    harvest.id,
                  )

                  handleCloseHarvestEditor()
                }
              }

              onClose={
                handleCloseHarvestEditor
              }
            />
          )
        }
      </>
    )
  }


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

        journeyBackLabel={
          journeyBackLabel
        }

        onBack={
          () =>
            handleJourneyBack(
              'journal',
            )
        }

        onOpenJournal={
          () =>
            handleNavigate(
              'journal',
            )
        }

        onOpenPlant={
          handleOpenPlantRecord
        }

        onOpenGrowingPlace={
          handleOpenGrowingPlaceRecord
        }

        onNavigate={
          handleNavigate
        }
      />
    )
  }


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

        journeyBackLabel={
          journeyBackLabel
        }

        onBack={
          () =>
            handleJourneyBack(
              'growing-places',
            )
        }

        onOpenGrowingPlaces={
          () =>
            handleNavigate(
              'growing-places',
            )
        }

        onOpenPlant={
          handleOpenPlantRecord
        }

        onOpenEvent={
          handleOpenJournalRecord
        }

        onOpenRecipe={
          handleOpenGrowingRecipeRecord
        }

        onNavigate={
          handleNavigate
        }
      />
    )
  }


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

        onBack={
          () =>
            handleJourneyBack(
              activeSavedComparisonId
                ? 'comparisons'
                : 'plants',
            )
        }

        onEditComparison={
          plantStoryIds => {
            setJourneyHistory(
              [],
            )

            setComparisonPlantIds(
              plantStoryIds,
            )

            setActivePage(
              'plants',
            )
          }
        }

        onSaveComparison={
          handleSavePlantComparison
        }

        onNavigate={
          handleNavigate
        }
      />
    )
  }


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

          journeyBackLabel={
            journeyBackLabel
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

          onAddHarvest={
            handleOpenNewHarvest
          }

          onOpenJournalEntry={
            handleOpenJournalRecord
          }

          onBack={
            () =>
              handleJourneyBack(
                'plants',
              )
          }

          onOpenPlants={
            () =>
              handleNavigate(
                'plants',
              )
          }

          onAddEvent={
            () =>
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


        {
          isAddEventOpen &&
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

              onClose={
                () =>
                  setIsAddEventOpen(
                    false,
                  )
              }
            />
          )
        }


        {
          isAddHarvestOpen && (
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

              onSaveHarvest={
                harvest => {
                  if (
                    harvestEditorRecord
                  ) {
                    handleUpdateHarvest(
                      harvest,
                    )
                  }
                  else {
                    handleAddHarvest(
                      harvest,
                    )
                  }


                  handleCloseHarvestEditor()
                }
              }

              onClose={
                handleCloseHarvestEditor
              }
            />
          )
        }


        {
          isAddRecipeOpen && (
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

              onClose={
                () =>
                  setIsAddRecipeOpen(
                    false,
                  )
              }
            />
          )
        }
      </>
    )
  }


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

        onOpenComparison={
          comparison =>
            handleOpenComparisonRecord(
              comparison.id,
            )
        }

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

          onAddEntry={
            () => {
              setSelectedPlantId(
                null,
              )

              setSelectedEventId(
                null,
              )

              setSelectedGrowingPlaceId(
                null,
              )

              clearLibraryRecordDestination()

              setIsAddEventOpen(
                true,
              )
            }
          }

          onOpenEntry={
            handleOpenJournalRecord
          }

          onDeleteEvent={
            handleDeleteEvent
          }

          onNavigate={
            handleNavigate
          }
        />


        {
          isAddEventOpen && (
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

              onClose={
                () =>
                  setIsAddEventOpen(
                    false,
                  )
              }
            />
          )
        }


        {
          isAddRecipeOpen && (
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

              onClose={
                () =>
                  setIsAddRecipeOpen(
                    false,
                  )
              }
            />
          )
        }
      </>
    )
  }


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

          onAddPlant={
            () => {
              setPlanToRecord(
                null,
              )

              setIsAddPlantOpen(
                true,
              )
            }
          }

          initialComparePlantIds={
            activeSavedComparisonId
              ? comparisonPlantIds
              : []
          }

          onComparePlants={
            plantIds => {
              rememberCurrentJourneyState()

              setComparisonPlantIds(
                plantIds,
              )

              setActivePage(
                'comparison',
              )
            }
          }

          onNavigate={
            handleNavigate
          }
        />


        {
          isAddPlantOpen && (
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
          )
        }
      </>
    )
  }


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

          onAddPlace={
            () =>
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


        {
          isAddGrowingPlaceOpen && (
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

              onAddPlace={
                (
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
                }
              }

              onClose={
                () =>
                  setIsAddGrowingPlaceOpen(
                    false,
                  )
              }
            />
          )
        }
      </>
    )
  }


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

          onRecordHarvest={
            () =>
              handleOpenNewHarvest()
          }

          onOpenHarvest={
            handleOpenHarvestRecord
          }

          onNavigate={
            handleNavigate
          }
        />


        {
          isAddHarvestOpen && (
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

              onSaveHarvest={
                harvest => {
                  if (
                    harvestEditorRecord
                  ) {
                    handleUpdateHarvest(
                      harvest,
                    )
                  }
                  else {
                    handleAddHarvest(
                      harvest,
                    )
                  }


                  setSelectedHarvestId(
                    harvest.id,
                  )

                  handleCloseHarvestEditor()
                }
              }

              onClose={
                handleCloseHarvestEditor
              }
            />
          )
        }
      </>
    )
  }


  if (
    activePage ===
    'search'
  ) {
    return (
      <>
        <GlobalSearch
          gardenData={
            gardenData
          }

          onOpenResult={
            handleOpenGlobalSearchResult
          }

          onNavigate={
            handleNavigate
          }
        />


        {
          selectedPurchase && (
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

              onSave={
                purchase => {
                  handleUpdatePurchase(
                    purchase,
                  )

                  setSelectedPurchase(
                    null,
                  )
                }
              }

              onClose={
                () =>
                  setSelectedPurchase(
                    null,
                  )
              }
            />
          )
        }
      </>
    )
  }


  if (
    activePage ===
    'garden-trials'
  ) {
    return (
      <GardenTrials
        gardenData={
          gardenData
        }

        initialTrialId={
          selectedGardenTrialId
        }

        journeyBackLabel={
          journeyBackLabel
        }

        onJourneyBack={
          journeyBackLabel
            ? () =>
                handleJourneyBack(
                  'garden-trials',
                )
            : undefined
        }

        onGardenDataChange={
          handleGardenTrialDataChange
        }

        onTrialSelectionChange={
          setSelectedGardenTrialId
        }

        onNavigate={
          handleNavigate
        }

        onOpenRelationship={
          handleOpenKnowledgeRelationship
        }
      />
    )
  }


  if (
    activePage ===
      'garden-notes' ||
    activePage ===
      'garden-almanac' ||
    activePage ===
      'plant-reference' ||
    activePage ===
      'saved-sources'
  ) {
    const knowledgeView =
      activePage ===
      'garden-notes'
        ? 'notes' as const
        : activePage ===
          'garden-almanac'
          ? 'almanac' as const
          : activePage ===
            'plant-reference'
            ? 'reference' as const
            : 'sources' as const


    return (
      <>
        <GardenKnowledge
          view={
            knowledgeView
          }

          gardenData={
            gardenData
          }

          initialRecord={
            selectedKnowledgeRecord
          }

          journeyBackLabel={
            journeyBackLabel
          }

          onJourneyBack={
            journeyBackLabel
              ? () =>
                  handleJourneyBack(
                    activePage,
                  )
              : undefined
          }

          onGardenDataChange={
            handleGardenKnowledgeDataChange
          }

          onRecordSelectionChange={
            setSelectedKnowledgeRecord
          }

          onNavigate={
            handleNavigate
          }

          onOpenRelationship={
            handleOpenKnowledgeRelationship
          }
        />


        {
          selectedPurchase && (
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

              onSave={
                purchase => {
                  handleUpdatePurchase(
                    purchase,
                  )

                  setSelectedPurchase(
                    null,
                  )
                }
              }

              onClose={
                () =>
                  setSelectedPurchase(
                    null,
                  )
              }
            />
          )
        }
      </>
    )
  }


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

          initialDate={
            calendarDateToOpen
          }

          initialPlanId={
            calendarPlanIdToOpen
          }

          onDestinationConsumed={
            () => {
              setCalendarDateToOpen(
                null,
              )

              setCalendarPlanIdToOpen(
                null,
              )
            }
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

          onNavigate={
            handleNavigate
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
        />


        {
          selectedPurchase && (
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

              onSave={
                purchase => {
                  handleUpdatePurchase(
                    purchase,
                  )

                  setSelectedPurchase(
                    null,
                  )
                }
              }

              onClose={
                () =>
                  setSelectedPurchase(
                    null,
                  )
              }
            />
          )
        }


        {
          isAddPlantOpen &&
          planToRecord &&
          (
            planToRecord.kind ===
              'sow' ||
            planToRecord.kind ===
              'plant' ||
            (
              planToRecord.kind ===
                'plant-out' &&
              (
                planToRecord
                  .plantStoryIds ??
                []
              ).length ===
                0 &&
              Boolean(
                planToRecord
                  .plannedPlant,
              )
            )
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
          )
        }


        {
          isAddEventOpen &&
          planToRecord &&
          (
            (
              planToRecord.kind ===
                'plant-out' &&
              (
                planToRecord
                  .plantStoryIds ??
                []
              ).length >
                0
            ) ||
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

              onClose={
                () => {
                  setIsAddEventOpen(
                    false,
                  )

                  setPlanToRecord(
                    null,
                  )
                }
              }
            />
          )
        }


        {
          isAddHarvestOpen &&
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
          )
        }


        {
          planToRecord?.kind ===
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

              onClose={
                () =>
                  setPlanToRecord(
                    null,
                  )
              }
            />
          )
        }
      </>
    )
  }


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
          libraryRecordToOpen
            .recipeId
        }

        initialIngredientId={
          libraryRecordToOpen
            .ingredientId
        }

        initialProductId={
          libraryRecordToOpen
            .productId
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


  return (
    <>
      <Gate
        plants={
          gardenData.plantStories
        }

        onOpenPlant={
          handleOpenPlantRecord
        }

        onAddPlant={
          () => {
            setPlanToRecord(
              null,
            )

            setIsAddPlantOpen(
              true,
            )
          }
        }

        onAddEntry={
          () => {
            setSelectedPlantId(
              null,
            )

            setSelectedEventId(
              null,
            )

            setSelectedGrowingPlaceId(
              null,
            )

            clearLibraryRecordDestination()

            setIsAddEventOpen(
              true,
            )
          }
        }

        onNavigate={
          handleNavigate
        }
      />


      {
        isAddPlantOpen && (
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

            onClose={
              () =>
                setIsAddPlantOpen(
                  false,
                )
            }
          />
        )
      }


      {
        isAddEventOpen && (
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

            onClose={
              () =>
                setIsAddEventOpen(
                  false,
                )
            }
          />
        )
      }


      {
        isAddRecipeOpen && (
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

            onClose={
              () =>
                setIsAddRecipeOpen(
                  false,
                )
            }
          />
        )
      }
    </>
  )
}


export default App