import { useState } from 'react'

import './css/App.css'

import AppLibrary from './components/app/AppLibrary'

import AddEventForm from './components/forms/AddEventForm'
import AddPlantForm from './components/forms/AddPlantForm'
import AddRecipeForm from './components/forms/AddRecipeForm'
import AddGrowingPlaceForm from './components/forms/AddGrowingPlaceForm'

import Journal from './pages/Journal'
import JournalEntryDetail from './pages/JournalEntryDetail'
import Plants from './pages/Plants'
import PlantDetail from './pages/PlantDetail'
import Harvest from './pages/Harvest'
import Gate from './pages/Gate'
import Welcome from './pages/Welcome'
import GardenPlaces from './pages/GrowingPlaces'
import GrowingPlaceDetail from './pages/GrowingPlaceDetail'

import type {
  AppPage,
} from './types/navigation'

import {
  loadGardenData,
  saveGardenData,
} from './services/storage'

import type {
  GardenEvent,
  GardenProduct,
  GrowingPlace,
  GrowingSetup,
  Ingredient,
  PlantStory,
  PurchaseRecord,
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
    selectedGrowingPlaceId,
    setSelectedGrowingPlaceId,
  ] =
    useState<string | null>(
      null,
    )


  /* =======================================
     LIBRARY RECORD TO OPEN
  ======================================= */

  const [
    libraryRecipeIdToOpen,
    setLibraryRecipeIdToOpen,
  ] =
    useState<string | null>(
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

    setIsAddRecipeOpen(
      false,
    )

    setIsAddGrowingPlaceOpen(
      false,
    )


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

          events={
            gardenData.events
          }

          onNavigate={
            handleNavigate
          }

          onOpenGrowingPlace={
            handleOpenGrowingPlaceRecord
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


        {isAddRecipeOpen && (
          <AddRecipeForm
            ingredients={
              gardenData.ingredients ??
              []
            }

            onAddRecipe={
              handleAddRecipe
            }

            onAddIngredient={
              handleAddIngredient
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

            onAddRecipe={
              handleAddRecipe
            }

            onAddIngredient={
              handleAddIngredient
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

            onAddPlant={
              handleAddPlant
            }

            onAddGrowingPlace={
              handleAddGrowingPlace
            }

            onAddIngredient={
              handleAddIngredient
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


        {isAddRecipeOpen && (
          <AddRecipeForm
            ingredients={
              gardenData.ingredients ??
              []
            }

            onAddRecipe={
              handleAddRecipe
            }

            onAddIngredient={
              handleAddIngredient
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

            onAddIngredient={
              handleAddIngredient
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
          events={
            gardenData.events
          }

          plants={
            gardenData.plantStories
          }

          onRecordHarvest={() =>
            setIsAddEventOpen(
              true,
            )
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

            onAddRecipe={
              handleAddRecipe
            }

            onAddIngredient={
              handleAddIngredient
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

          onAddPlant={
            handleAddPlant
          }

          onAddGrowingPlace={
            handleAddGrowingPlace
          }

          onAddIngredient={
            handleAddIngredient
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

          onAddRecipe={
            handleAddRecipe
          }

          onAddIngredient={
            handleAddIngredient
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