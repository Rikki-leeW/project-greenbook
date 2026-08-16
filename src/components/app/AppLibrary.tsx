import {
  useState,
} from 'react'

import Library from '../../pages/Library'
import GrowingRecipes from '../../pages/GrowingRecipes'
import GrowingRecipeDetail from '../../pages/GrowingRecipeDetail'
import Ingredients from '../../pages/Ingredients'
import IngredientDetail from '../../pages/IngredientDetail'
import Products from '../../pages/Products'
import PurchaseEditor from '../purchases/PurchaseEditor'
import AddRecipeForm from '../forms/AddRecipeForm'
import AddIngredientForm from '../forms/AddIngredientForm'
import AddProductForm from '../forms/AddProductForm'
import ProductDetail from '../../pages/ProductDetail'

import type {
  GardenProduct,
  GrowingPlace,
  GrowingSetup,
  Ingredient,
  PlantStory,
  PurchaseRecord,
} from '../../types'

import type {
  AppPage,
} from '../../types/navigation'


interface AppLibraryProps {
  recipes: GrowingSetup[]

  ingredients: Ingredient[]

  products: GardenProduct[]

  purchases: PurchaseRecord[]

  plants: PlantStory[]

  growingPlaces: GrowingPlace[]

  initialRecipeId?: string | null

  onAddRecipe: (
    recipe: GrowingSetup,
  ) => void

  onUpdateRecipe: (
    recipe: GrowingSetup,
  ) => void

  onDeleteRecipe: (
    recipeId: string,
  ) => void

  onAddIngredient: (
    ingredient: Ingredient,
  ) => void

  onUpdateIngredient: (
    ingredient: Ingredient,
  ) => void

  onDeleteIngredient: (
    ingredientId: string,
  ) => void

  onAddProduct: (
    product: GardenProduct,
  ) => void

  onUpdateProduct: (
    product: GardenProduct,
  ) => void

  onDeleteProduct: (
    productId: string,
  ) => void

  onAddPurchase: (
    purchase: PurchaseRecord,
  ) => void

  onUpdatePurchase: (
    purchase: PurchaseRecord,
  ) => void

  onOpenGrowingPlace: (
    growingPlaceId: string,
  ) => void

  onOpenPlant: (
    plantId: string,
  ) => void

  onNavigate: (
    page: AppPage,
  ) => void
}


type LibraryView =
  | 'library'
  | 'growing-recipes'
  | 'archived-growing-recipes'
  | 'recipe-detail'
  | 'ingredients'
  | 'archived-ingredients'
  | 'ingredient-detail'
  | 'products'
  | 'product-detail'


type RecipeEditorMode =
  | 'create'
  | 'edit'
  | 'variation'


type RecordRating =
  | 1
  | 2
  | 3
  | 4
  | 5


function createVariationId(
  recipe: GrowingSetup,
): string {
  const safeName =
    recipe.name
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        '-',
      )
      .replace(
        /^-|-$/g,
        '',
      )

  return `variation-${
    safeName || 'recipe'
  }-${Date.now()}`
}


function getTodayDate(): string {
  return new Date()
    .toISOString()
    .slice(
      0,
      10,
    )
}


export default function AppLibrary({
  recipes,
  ingredients,
  products,
  purchases,
  plants,
  growingPlaces,
  initialRecipeId,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddPurchase,
  onUpdatePurchase,
  onOpenGrowingPlace,
  onOpenPlant,
  onNavigate,
}: AppLibraryProps) {

  /* =======================================
     CURRENT LIBRARY VIEW
  ======================================= */

  const [
    currentView,
    setCurrentView,
  ] =
    useState<LibraryView>(
      initialRecipeId
        ? 'recipe-detail'
        : 'library',
    )


  /* =======================================
     RECIPE STATE
  ======================================= */

  const [
    selectedRecipeId,
    setSelectedRecipeId,
  ] =
    useState<string | null>(
      initialRecipeId ??
      null,
    )


  const [
    isRecipeEditorOpen,
    setIsRecipeEditorOpen,
  ] =
    useState(false)


  const [
    recipeEditorMode,
    setRecipeEditorMode,
  ] =
    useState<RecipeEditorMode>(
      'create',
    )


  const [
    editorRecipe,
    setEditorRecipe,
  ] =
    useState<GrowingSetup | null>(
      null,
    )


  /* =======================================
     INGREDIENT STATE
  ======================================= */

  const [
    selectedIngredientId,
    setSelectedIngredientId,
  ] =
    useState<string | null>(
      null,
    )


  const [
    isIngredientEditorOpen,
    setIsIngredientEditorOpen,
  ] =
    useState(false)


  const [
    editorIngredient,
    setEditorIngredient,
  ] =
    useState<Ingredient | null>(
      null,
    )


  /* =======================================
     PRODUCT STATE
  ======================================= */

  const [
    selectedProductId,
    setSelectedProductId,
  ] =
    useState<string | null>(
      null,
    )


  const [
    isProductEditorOpen,
    setIsProductEditorOpen,
  ] =
    useState(false)


  const [
    editorProduct,
    setEditorProduct,
  ] =
    useState<GardenProduct | null>(
      null,
    )


  /* =======================================
     PURCHASE STATE
  ======================================= */

  const [
    isPurchaseEditorOpen,
    setIsPurchaseEditorOpen,
  ] =
    useState(false)


  const [
    editorPurchase,
    setEditorPurchase,
  ] =
    useState<PurchaseRecord | null>(
      null,
    )


  /* =======================================
     RECIPE COLLECTIONS
  ======================================= */

  const activeRecipes =
    recipes.filter(
      (
        recipe,
      ) =>
        !recipe.isArchived,
    )


  const archivedRecipes =
    recipes.filter(
      (
        recipe,
      ) =>
        Boolean(
          recipe.isArchived,
        ),
    )


  const selectedRecipe =
    recipes.find(
      (
        recipe,
      ) =>
        recipe.id ===
        selectedRecipeId,
    )


  /* =======================================
     PRODUCT COLLECTIONS
  ======================================= */

  const selectedProduct =
    products.find(
      (
        product,
      ) =>
        product.id ===
        selectedProductId,
    )


  /* =======================================
     INGREDIENT COLLECTIONS
  ======================================= */

  const activeIngredients =
    ingredients.filter(
      (
        ingredient,
      ) =>
        !ingredient.isArchived,
    )


  const archivedIngredients =
    ingredients.filter(
      (
        ingredient,
      ) =>
        Boolean(
          ingredient.isArchived,
        ),
    )


  const selectedIngredient =
    ingredients.find(
      (
        ingredient,
      ) =>
        ingredient.id ===
        selectedIngredientId,
    )


  /* =======================================
     RECIPE RELATIONSHIP CHECKING
  ======================================= */

  function getRecipeRelationshipCount(
    recipe: GrowingSetup,
  ): number {
    const linkedPlantCount =
      plants.filter(
        (
          plant,
        ) =>
          plant.currentGrowingSetupId ===
            recipe.id ||
          plant.previousGrowingSetupIds
            ?.includes(
              recipe.id,
            ),
      ).length


    const linkedGrowingPlaceCount =
      growingPlaces.filter(
        (
          place,
        ) =>
          place.growingSetupId ===
          recipe.id,
      ).length


    const linkedPurchaseCount =
      purchases.filter(
        (
          purchase,
        ) =>
          purchase.itemType ===
            'growing-setup' &&
          purchase.itemId ===
            recipe.id,
      ).length


    return (
      linkedPlantCount +
      linkedGrowingPlaceCount +
      linkedPurchaseCount
    )
  }


  /* =======================================
     INGREDIENT RELATIONSHIP CHECKING
  ======================================= */

  function getIngredientRelationshipCount(
    ingredient: Ingredient,
  ): number {
    return recipes.filter(
      (
        recipe,
      ) =>
        recipe.ingredientIds
          ?.includes(
            ingredient.id,
          ),
    ).length
  }


  /* =======================================
     OPEN RECIPE
  ======================================= */

  function handleOpenRecipe(
    recipeId: string,
  ) {
    setSelectedIngredientId(
      null,
    )

    setSelectedRecipeId(
      recipeId,
    )

    setCurrentView(
      'recipe-detail',
    )
  }


  /* =======================================
     OPEN INGREDIENT
  ======================================= */

  function handleOpenIngredient(
    ingredientId: string,
  ) {
    setSelectedRecipeId(
      null,
    )

    setSelectedIngredientId(
      ingredientId,
    )

    setCurrentView(
      'ingredient-detail',
    )
  }


  /* =======================================
     CREATE RECIPE
  ======================================= */

  function handleOpenCreateRecipe() {
    setRecipeEditorMode(
      'create',
    )

    setEditorRecipe(
      null,
    )

    setIsRecipeEditorOpen(
      true,
    )
  }


  /* =======================================
     EDIT RECIPE
  ======================================= */

  function handleOpenEditRecipe(
    recipe: GrowingSetup,
  ) {
    setRecipeEditorMode(
      'edit',
    )

    setEditorRecipe(
      recipe,
    )

    setIsRecipeEditorOpen(
      true,
    )
  }


  /* =======================================
     CREATE VARIATION
  ======================================= */

  function handleCreateVariation(
    sourceRecipe: GrowingSetup,
  ) {
    const createdAt =
      getTodayDate()


    const variationDraft:
      GrowingSetup = {
        ...sourceRecipe,

        id:
          createVariationId(
            sourceRecipe,
          ),

        name:
          `${sourceRecipe.name} (Copy)`,

        basedOnRecipeId:
          sourceRecipe.id,

        isFavourite:
          false,

        rating:
          undefined,

        isArchived:
          false,

        archivedAt:
          undefined,

        ingredientIds: [
          ...(
            sourceRecipe
              .ingredientIds ??
            []
          ),
        ],

        photoUrls: [
          ...(
            sourceRecipe
              .photoUrls ??
            []
          ),
        ],

        createdAt,

        updatedAt:
          undefined,
      }


    setRecipeEditorMode(
      'variation',
    )

    setEditorRecipe(
      variationDraft,
    )

    setIsRecipeEditorOpen(
      true,
    )
  }


  /* =======================================
     CREATE INGREDIENT
  ======================================= */

  function handleOpenCreateIngredient() {
    setEditorIngredient(
      null,
    )

    setIsIngredientEditorOpen(
      true,
    )
  }


  /* =======================================
     EDIT INGREDIENT
  ======================================= */

  function handleOpenEditIngredient(
    ingredient: Ingredient,
  ) {
    setEditorIngredient(
      ingredient,
    )

    setIsIngredientEditorOpen(
      true,
    )
  }


  /* =======================================
     RECIPE FAVOURITE
  ======================================= */

  function handleToggleFavourite(
    recipe: GrowingSetup,
  ) {
    const updatedRecipe:
      GrowingSetup = {
        ...recipe,

        isFavourite:
          !recipe.isFavourite,

        updatedAt:
          getTodayDate(),
      }


    onUpdateRecipe(
      updatedRecipe,
    )
  }


  /* =======================================
     RECIPE RATING
  ======================================= */

  function handleSetRating(
    recipe: GrowingSetup,
    rating: RecordRating,
  ) {
    const updatedRecipe:
      GrowingSetup = {
        ...recipe,

        rating,

        updatedAt:
          getTodayDate(),
      }


    onUpdateRecipe(
      updatedRecipe,
    )
  }


  /* =======================================
     INGREDIENT FAVOURITE
  ======================================= */

  function handleToggleIngredientFavourite(
    ingredient: Ingredient,
  ) {
    const updatedIngredient:
      Ingredient = {
        ...ingredient,

        isFavourite:
          !ingredient.isFavourite,

        updatedAt:
          getTodayDate(),
      }


    onUpdateIngredient(
      updatedIngredient,
    )
  }


  /* =======================================
     INGREDIENT RATING
  ======================================= */

  function handleSetIngredientRating(
    ingredient: Ingredient,
    rating: number,
  ) {
    const updatedIngredient:
      Ingredient = {
        ...ingredient,

        rating:
          Math.max(
            1,
            Math.min(
              5,
              rating,
            ),
          ) as RecordRating,

        updatedAt:
          getTodayDate(),
      }


    onUpdateIngredient(
      updatedIngredient,
    )
  }


  /* =======================================
     PRODUCT FAVOURITE
  ======================================= */

  function handleToggleProductFavourite(
    product: GardenProduct,
  ) {
    const updatedProduct:
      GardenProduct = {
        ...product,

        isFavourite:
          !product.isFavourite,

        updatedAt:
          getTodayDate(),
      }


    onUpdateProduct(
      updatedProduct,
    )
  }


  /* =======================================
     PRODUCT RATING
  ======================================= */

  function handleSetProductRating(
    product: GardenProduct,
    rating: number,
  ) {
    const updatedProduct:
      GardenProduct = {
        ...product,

        rating:
          Math.max(
            1,
            Math.min(
              5,
              rating,
            ),
          ) as RecordRating,

        updatedAt:
          getTodayDate(),
      }


    onUpdateProduct(
      updatedProduct,
    )
  }


  /* =======================================
     OPEN EDIT PRODUCT
  ======================================= */

  function handleOpenEditProduct(
    product: GardenProduct,
  ) {
    setEditorProduct(
      product,
    )

    setIsProductEditorOpen(
      true,
    )
  }


  /* =======================================
     ARCHIVE PRODUCT
  ======================================= */

  function handleArchiveProduct(
    product: GardenProduct,
  ) {
    const confirmed =
      window.confirm(
        `Archive "${product.name}"?\n\n` +
        'It will leave your active Product shelf, but Sprig will keep its history and purchase records.',
      )


    if (!confirmed) {
      return
    }


    const today =
      getTodayDate()


    const updatedProduct:
      GardenProduct = {
        ...product,

        isArchived:
          true,

        archivedAt:
          today,

        updatedAt:
          today,
      }


    onUpdateProduct(
      updatedProduct,
    )


    setSelectedProductId(
      null,
    )

    setCurrentView(
      'products',
    )
  }


  /* =======================================
     RESTORE PRODUCT
  ======================================= */

  function handleRestoreProduct(
    product: GardenProduct,
  ) {
    const updatedProduct:
      GardenProduct = {
        ...product,

        isArchived:
          false,

        archivedAt:
          undefined,

        updatedAt:
          getTodayDate(),
      }


    onUpdateProduct(
      updatedProduct,
    )


    setSelectedProductId(
      product.id,
    )

    setCurrentView(
      'product-detail',
    )
  }


  /* =======================================
     DELETE PRODUCT SAFETY
  ======================================= */

  function handleDeleteProduct(
    product: GardenProduct,
  ) {
    const purchaseCount =
      purchases.filter(
        (
          purchase,
        ) =>
          purchase.itemType ===
            'product' &&
          purchase.itemId ===
            product.id,
      ).length


    if (
      purchaseCount >
      0
    ) {
      window.alert(
        `Sprig can't permanently delete "${product.name}" because it has ${purchaseCount} ${
          purchaseCount === 1
            ? 'Purchase record'
            : 'Purchase records'
        } connected to it.\n\nArchive it instead so its price history remains intact.`,
      )

      return
    }


    const confirmed =
      window.confirm(
        `Permanently delete "${product.name}"?\n\n` +
        'This Product has no Purchase records connected to it.\n\n' +
        'This cannot be undone.',
      )


    if (!confirmed) {
      return
    }


    onDeleteProduct(
      product.id,
    )


    setSelectedProductId(
      null,
    )

    setCurrentView(
      'products',
    )
  }


  /* =======================================
     ARCHIVE RECIPE
  ======================================= */

  function handleArchiveRecipe(
    recipe: GrowingSetup,
  ) {
    const confirmed =
      window.confirm(
        `Archive "${recipe.name}"?\n\n` +
        'It will leave your active Growing Recipe shelf, but Sprig will keep its history and garden connections.',
      )


    if (!confirmed) {
      return
    }


    const today =
      getTodayDate()


    const updatedRecipe:
      GrowingSetup = {
        ...recipe,

        isArchived:
          true,

        archivedAt:
          today,

        updatedAt:
          today,
      }


    onUpdateRecipe(
      updatedRecipe,
    )


    setSelectedRecipeId(
      null,
    )

    setCurrentView(
      'growing-recipes',
    )
  }


  /* =======================================
     RESTORE RECIPE
  ======================================= */

  function handleRestoreRecipe(
    recipe: GrowingSetup,
  ) {
    const updatedRecipe:
      GrowingSetup = {
        ...recipe,

        isArchived:
          false,

        archivedAt:
          undefined,

        updatedAt:
          getTodayDate(),
      }


    onUpdateRecipe(
      updatedRecipe,
    )


    setSelectedRecipeId(
      recipe.id,
    )

    setCurrentView(
      'recipe-detail',
    )
  }


  /* =======================================
     ARCHIVE INGREDIENT
  ======================================= */

  function handleArchiveIngredient(
    ingredient: Ingredient,
  ) {
    const confirmed =
      window.confirm(
        `Archive "${ingredient.name}"?\n\n` +
        'It will leave your active Ingredient shelf, but Sprig will keep its history and Growing Recipe connections.',
      )


    if (!confirmed) {
      return
    }


    const today =
      getTodayDate()


    const updatedIngredient:
      Ingredient = {
        ...ingredient,

        isArchived:
          true,

        archivedAt:
          today,

        updatedAt:
          today,
      }


    onUpdateIngredient(
      updatedIngredient,
    )


    setSelectedIngredientId(
      null,
    )

    setCurrentView(
      'ingredients',
    )
  }


  /* =======================================
     RESTORE INGREDIENT
  ======================================= */

  function handleRestoreIngredient(
    ingredient: Ingredient,
  ) {
    const updatedIngredient:
      Ingredient = {
        ...ingredient,

        isArchived:
          false,

        archivedAt:
          undefined,

        updatedAt:
          getTodayDate(),
      }


    onUpdateIngredient(
      updatedIngredient,
    )


    setSelectedIngredientId(
      ingredient.id,
    )

    setCurrentView(
      'ingredient-detail',
    )
  }


  /* =======================================
     DELETE RECIPE SAFETY
  ======================================= */

  function handleDeleteRecipe(
    recipe: GrowingSetup,
  ) {
    const relationshipCount =
      getRecipeRelationshipCount(
        recipe,
      )


    if (
      relationshipCount >
      0
    ) {
      window.alert(
        `Sprig can't permanently delete "${recipe.name}" because it is still connected to ${relationshipCount} ${
          relationshipCount === 1
            ? 'garden record'
            : 'garden records'
        }.\n\nArchive it instead so those connections remain intact.`,
      )

      return
    }


    const confirmed =
      window.confirm(
        `Permanently delete "${recipe.name}"?\n\n` +
        'This Growing Recipe has no Plant Story, Growing Place, or Purchase connections.\n\n' +
        'This cannot be undone.',
      )


    if (!confirmed) {
      return
    }


    const wasArchived =
      Boolean(
        recipe.isArchived,
      )


    onDeleteRecipe(
      recipe.id,
    )


    setSelectedRecipeId(
      null,
    )


    setCurrentView(
      wasArchived
        ? 'archived-growing-recipes'
        : 'growing-recipes',
    )
  }


  /* =======================================
     DELETE INGREDIENT SAFETY
  ======================================= */

  function handleDeleteIngredient(
    ingredient: Ingredient,
  ) {
    const purchaseCount =
      purchases.filter(
        (
          purchase,
        ) =>
          purchase.itemType ===
            'ingredient' &&
          purchase.itemId ===
            ingredient.id,
      ).length


    if (
      purchaseCount >
      0
    ) {
      window.alert(
        `Sprig can't permanently delete "${ingredient.name}" because it has ${purchaseCount} ${
          purchaseCount === 1
            ? 'Purchase record'
            : 'Purchase records'
        } connected to it.\n\nArchive it instead so its price history remains intact.`,
      )

      return
    }


    const relationshipCount =
      getIngredientRelationshipCount(
        ingredient,
      )


    if (
      relationshipCount >
      0
    ) {
      window.alert(
        `Sprig can't permanently delete "${ingredient.name}" because it is still used by ${relationshipCount} ${
          relationshipCount === 1
            ? 'Growing Recipe'
            : 'Growing Recipes'
        }.\n\nArchive it instead so those recipe connections remain intact.`,
      )

      return
    }


    const confirmed =
      window.confirm(
        `Permanently delete "${ingredient.name}"?\n\n` +
        'This Ingredient has no Purchase records and is not currently used by a Growing Recipe.\n\n' +
        'This cannot be undone.',
      )


    if (!confirmed) {
      return
    }


    const wasArchived =
      Boolean(
        ingredient.isArchived,
      )


    onDeleteIngredient(
      ingredient.id,
    )


    setSelectedIngredientId(
      null,
    )


    setCurrentView(
      wasArchived
        ? 'archived-ingredients'
        : 'ingredients',
    )
  }


  /* =======================================
     CLOSE RECIPE EDITOR
  ======================================= */

  function handleCloseRecipeEditor() {
    setIsRecipeEditorOpen(
      false,
    )

    setEditorRecipe(
      null,
    )

    setRecipeEditorMode(
      'create',
    )
  }


  /* =======================================
     CLOSE INGREDIENT EDITOR
  ======================================= */

  function handleCloseIngredientEditor() {
    setIsIngredientEditorOpen(
      false,
    )

    setEditorIngredient(
      null,
    )
  }


  /* =======================================
     SAVE PRODUCT PURCHASE
  ======================================= */

  function handleSaveProductPurchase(
    purchase: PurchaseRecord,
  ) {
    if (
      editorPurchase
    ) {
      onUpdatePurchase(
        purchase,
      )
    } else {
      onAddPurchase(
        purchase,
      )
    }


    setEditorPurchase(
      null,
    )

    setIsPurchaseEditorOpen(
      false,
    )
  }


  /* =======================================
     SAVE NEW RECIPE
  ======================================= */

  function handleAddRecipe(
    recipe: GrowingSetup,
  ) {
    onAddRecipe(
      recipe,
    )

    setSelectedRecipeId(
      recipe.id,
    )

    setEditorRecipe(
      null,
    )

    setRecipeEditorMode(
      'create',
    )

    setIsRecipeEditorOpen(
      false,
    )

    setCurrentView(
      'recipe-detail',
    )
  }


  /* =======================================
     SAVE EDITED RECIPE
  ======================================= */

  function handleUpdateRecipe(
    recipe: GrowingSetup,
  ) {
    if (
      recipeEditorMode ===
      'variation'
    ) {
      onAddRecipe(
        recipe,
      )

      setSelectedRecipeId(
        recipe.id,
      )

      setEditorRecipe(
        null,
      )

      setRecipeEditorMode(
        'create',
      )

      setIsRecipeEditorOpen(
        false,
      )

      setCurrentView(
        'recipe-detail',
      )

      return
    }


    onUpdateRecipe(
      recipe,
    )

    setSelectedRecipeId(
      recipe.id,
    )

    setEditorRecipe(
      null,
    )

    setRecipeEditorMode(
      'create',
    )

    setIsRecipeEditorOpen(
      false,
    )

    setCurrentView(
      'recipe-detail',
    )
  }


  /* =======================================
     SAVE NEW INGREDIENT
  ======================================= */

  function handleAddIngredient(
    ingredient: Ingredient,
  ) {
    onAddIngredient(
      ingredient,
    )

    setSelectedIngredientId(
      ingredient.id,
    )

    setEditorIngredient(
      null,
    )

    setIsIngredientEditorOpen(
      false,
    )

    setCurrentView(
      'ingredient-detail',
    )
  }


  /* =======================================
     SAVE EDITED INGREDIENT
  ======================================= */

  function handleUpdateIngredient(
    ingredient: Ingredient,
  ) {
    onUpdateIngredient(
      ingredient,
    )

    setSelectedIngredientId(
      ingredient.id,
    )

    setEditorIngredient(
      null,
    )

    setIsIngredientEditorOpen(
      false,
    )

    setCurrentView(
      'ingredient-detail',
    )
  }


  /* =======================================
     PAGE CONTENT
  ======================================= */

  let pageContent
    /* =======================================
     INGREDIENT DETAIL
  ======================================= */

  if (
    currentView ===
      'ingredient-detail' &&
    selectedIngredient
  ) {
    pageContent = (
      <IngredientDetail
        ingredient={
          selectedIngredient
        }

        recipes={
          recipes
        }

        purchases={
          purchases
        }

        onBack={() => {
          setSelectedIngredientId(
            null,
          )

          setCurrentView(
            selectedIngredient.isArchived
              ? 'archived-ingredients'
              : 'ingredients',
          )
        }}

        onEdit={() =>
          handleOpenEditIngredient(
            selectedIngredient,
          )
        }

        onToggleFavourite={() =>
          handleToggleIngredientFavourite(
            selectedIngredient,
          )
        }

        onSetRating={(
          rating,
        ) =>
          handleSetIngredientRating(
            selectedIngredient,
            rating,
          )
        }

        onArchive={
          selectedIngredient.isArchived
            ? undefined
            : () =>
                handleArchiveIngredient(
                  selectedIngredient,
                )
        }

        onRestore={
          selectedIngredient.isArchived
            ? () =>
                handleRestoreIngredient(
                  selectedIngredient,
                )
            : undefined
        }

        onDelete={() =>
          handleDeleteIngredient(
            selectedIngredient,
          )
        }

        onAddPurchase={() => {
          setEditorPurchase(
            null,
          )

          setIsPurchaseEditorOpen(
            true,
          )
        }}

        onEditPurchase={(
          purchase,
        ) => {
          setEditorPurchase(
            purchase,
          )

          setIsPurchaseEditorOpen(
            true,
          )
        }}

        onOpenRecipe={(
          recipeId,
        ) => {
          handleOpenRecipe(
            recipeId,
          )
        }}

        onNavigate={
          onNavigate
        }
      />
    )
  }


  /* =======================================
     ACTIVE INGREDIENT INDEX
  ======================================= */

  else if (
    currentView ===
    'ingredients'
  ) {
    pageContent = (
      <Ingredients
        ingredients={
          activeIngredients
        }

        recipes={
          recipes
        }

        archivedCount={
          archivedIngredients.length
        }

        onOpenIngredient={
          handleOpenIngredient
        }

        onAddIngredient={
          handleOpenCreateIngredient
        }

        onShowArchived={() =>
          setCurrentView(
            'archived-ingredients',
          )
        }

        onNavigate={
          onNavigate
        }
      />
    )
  }


  /* =======================================
     ARCHIVED INGREDIENT INDEX
  ======================================= */

  else if (
    currentView ===
    'archived-ingredients'
  ) {
    pageContent = (
      <Ingredients
        ingredients={
          archivedIngredients
        }

        recipes={
          recipes
        }

        title="Archived Ingredients"

        intro="Ingredients kept safely in Sprig's history after their work on the active shelf is done."

        emptyTitle="No archived Ingredients"

        emptyMessage="Nothing has been tucked away from the Ingredient shelf yet."

        showArchivedStatus

        onOpenIngredient={
          handleOpenIngredient
        }

        onAddIngredient={
          handleOpenCreateIngredient
        }

        onShowArchived={() =>
          setCurrentView(
            'ingredients',
          )
        }

        archivedButtonLabel="Back to Active Ingredients"

        onNavigate={
          onNavigate
        }
      />
    )
  }


  /* =======================================
     RECIPE DETAIL
  ======================================= */

  else if (
    currentView ===
      'recipe-detail' &&
    selectedRecipe
  ) {
    pageContent = (
      <GrowingRecipeDetail
        recipe={
          selectedRecipe
        }

        ingredients={
          ingredients
        }

        plants={
          plants
        }

        growingPlaces={
          growingPlaces
        }

        purchases={
          purchases
        }

        onEdit={() =>
          handleOpenEditRecipe(
            selectedRecipe,
          )
        }

        onDuplicate={() =>
          handleCreateVariation(
            selectedRecipe,
          )
        }

        onToggleFavourite={() =>
          handleToggleFavourite(
            selectedRecipe,
          )
        }

        onSetRating={(
          rating,
        ) =>
          handleSetRating(
            selectedRecipe,
            rating,
          )
        }

        onArchive={
          selectedRecipe.isArchived
            ? undefined
            : () =>
                handleArchiveRecipe(
                  selectedRecipe,
                )
        }

        onRestore={
          selectedRecipe.isArchived
            ? () =>
                handleRestoreRecipe(
                  selectedRecipe,
                )
            : undefined
        }

        onDelete={() =>
          handleDeleteRecipe(
            selectedRecipe,
          )
        }

        onBack={() => {
          setSelectedRecipeId(
            null,
          )

          setCurrentView(
            selectedRecipe.isArchived
              ? 'archived-growing-recipes'
              : 'growing-recipes',
          )
        }}

        onAddPurchase={() => {
          setEditorPurchase(
            null,
          )

          setIsPurchaseEditorOpen(
            true,
          )
        }}

        onEditPurchase={(
          purchase,
        ) => {
          setEditorPurchase(
            purchase,
          )

          setIsPurchaseEditorOpen(
            true,
          )
        }}

        onOpenGrowingPlace={(
          growingPlaceId,
        ) => {
          onOpenGrowingPlace(
            growingPlaceId,
          )
        }}

        onOpenPlant={(
          plantId,
        ) => {
          onOpenPlant(
            plantId,
          )
        }}

        onOpenIngredient={(
          ingredientId,
        ) => {
          handleOpenIngredient(
            ingredientId,
          )
        }}

        onNavigate={
          onNavigate
        }
      />
    )
  }


  /* =======================================
     ARCHIVED RECIPE INDEX
  ======================================= */

  else if (
    currentView ===
    'archived-growing-recipes'
  ) {
    pageContent = (
      <GrowingRecipes
        recipes={
          archivedRecipes
        }

        title="Archived Growing Recipes"

        intro="Growing Recipes kept safely in Sprig's history after their work in the garden is done."

        emptyTitle="No archived recipes"

        emptyMessage="Nothing has been retired from the Growing Recipe shelf yet."

        showArchivedStatus

        onOpenRecipe={
          handleOpenRecipe
        }

        onAddRecipe={
          handleOpenCreateRecipe
        }

        onShowArchived={() =>
          setCurrentView(
            'growing-recipes',
          )
        }

        archivedButtonLabel="Back to Active Recipes"

        onNavigate={
          onNavigate
        }
      />
    )
  }


  /* =======================================
     ACTIVE RECIPE INDEX
  ======================================= */

  else if (
    currentView ===
    'growing-recipes'
  ) {
    pageContent = (
      <GrowingRecipes
        recipes={
          activeRecipes
        }

        archivedCount={
          archivedRecipes.length
        }

        onOpenRecipe={
          handleOpenRecipe
        }

        onAddRecipe={
          handleOpenCreateRecipe
        }

        onShowArchived={() =>
          setCurrentView(
            'archived-growing-recipes',
          )
        }

        onNavigate={
          onNavigate
        }
      />
    )
  }


  /* =======================================
     PRODUCT DETAIL
  ======================================= */

  else if (
    currentView ===
      'product-detail' &&
    selectedProduct
  ) {
    pageContent = (
      <ProductDetail
        product={
          selectedProduct
        }

        purchases={
          purchases
        }

        onBack={() => {
          setSelectedProductId(
            null,
          )

          setCurrentView(
            'products',
          )
        }}

        onEdit={() =>
          handleOpenEditProduct(
            selectedProduct,
          )
        }

        onToggleFavourite={() =>
          handleToggleProductFavourite(
            selectedProduct,
          )
        }

        onSetRating={(
          rating,
        ) =>
          handleSetProductRating(
            selectedProduct,
            rating,
          )
        }

        onArchive={
          selectedProduct.isArchived
            ? undefined
            : () =>
                handleArchiveProduct(
                  selectedProduct,
                )
        }

        onRestore={
          selectedProduct.isArchived
            ? () =>
                handleRestoreProduct(
                  selectedProduct,
                )
            : undefined
        }

        onDelete={() =>
          handleDeleteProduct(
            selectedProduct,
          )
        }

        onAddPurchase={() => {
          setEditorPurchase(
            null,
          )

          setIsPurchaseEditorOpen(
            true,
          )
        }}

        onEditPurchase={(
          purchase,
        ) => {
          setEditorPurchase(
            purchase,
          )

          setIsPurchaseEditorOpen(
            true,
          )
        }}

        onNavigate={
          onNavigate
        }
      />
    )
  }


  /* =======================================
     PRODUCT INDEX
  ======================================= */

  else if (
    currentView ===
    'products'
  ) {
    pageContent = (
      <Products
        products={
          products
        }

        onOpenProduct={(
          productId,
        ) => {
          setSelectedProductId(
            productId,
          )

          setCurrentView(
            'product-detail',
          )
        }}

        onAddProduct={() => {
          setEditorProduct(
            null,
          )

          setIsProductEditorOpen(
            true,
          )
        }}

        onNavigate={
          onNavigate
        }
      />
    )
  }


  /* =======================================
     MAIN LIBRARY
  ======================================= */

  else {
    pageContent = (
      <Library
        onOpenGrowingRecipes={() =>
          setCurrentView(
            'growing-recipes',
          )
        }

        onOpenIngredients={() =>
          setCurrentView(
            'ingredients',
          )
        }

        onOpenProducts={() =>
          setCurrentView(
            'products',
          )
        }

        onNavigate={
          onNavigate
        }
      />
    )
  }


  /* =======================================
     SHARED EDITORS
  ======================================= */

  return (
    <>
      {pageContent}


      {isRecipeEditorOpen && (
        <AddRecipeForm
          ingredients={
            ingredients
          }

          recipeToEdit={
            editorRecipe ??
            undefined
          }

          onAddRecipe={
            handleAddRecipe
          }

          onUpdateRecipe={
            handleUpdateRecipe
          }

          onAddIngredient={
            onAddIngredient
          }

          onAddPurchase={
            onAddPurchase
          }

          onClose={
            handleCloseRecipeEditor
          }
        />
      )}


      {isIngredientEditorOpen && (
        <AddIngredientForm
          ingredientToEdit={
            editorIngredient ??
            undefined
          }

          onAddIngredient={
            handleAddIngredient
          }

          onUpdateIngredient={
            handleUpdateIngredient
          }

          onAddPurchase={
            onAddPurchase
          }

          onClose={
            handleCloseIngredientEditor
          }
        />
      )}


      {isProductEditorOpen && (
        <AddProductForm
          product={
            editorProduct
          }

          onSave={(
            product,
            purchase,
          ) => {
            if (
              editorProduct
            ) {
              onUpdateProduct(
                product,
              )
            } else {
              onAddProduct(
                product,
              )
            }


            if (
              purchase
            ) {
              onAddPurchase(
                purchase,
              )
            }


            setSelectedProductId(
              product.id,
            )

            setEditorProduct(
              null,
            )

            setIsProductEditorOpen(
              false,
            )

            setCurrentView(
              'product-detail',
            )
          }}

          onClose={() => {
            setEditorProduct(
              null,
            )

            setIsProductEditorOpen(
              false,
            )
          }}
        />
      )}


      {isPurchaseEditorOpen &&
        currentView ===
          'product-detail' &&
        selectedProduct && (
        <PurchaseEditor
          purchase={
            editorPurchase
          }

          itemType="product"

          itemId={
            selectedProduct.id
          }

          itemName={
            selectedProduct.name
          }

          brand={
            selectedProduct.brand
          }

          onSave={
            handleSaveProductPurchase
          }

          onClose={() => {
            setEditorPurchase(
              null,
            )

            setIsPurchaseEditorOpen(
              false,
            )
          }}
        />
      )}


      {isPurchaseEditorOpen &&
        currentView ===
          'recipe-detail' &&
        selectedRecipe && (
        <PurchaseEditor
          purchase={
            editorPurchase
          }

          itemType="growing-setup"

          itemId={
            selectedRecipe.id
          }

          itemName={
            selectedRecipe.name
          }

          brand={
            selectedRecipe.brand
          }

          onSave={
            handleSaveProductPurchase
          }

          onClose={() => {
            setEditorPurchase(
              null,
            )

            setIsPurchaseEditorOpen(
              false,
            )
          }}
        />
      )}


      {isPurchaseEditorOpen &&
        currentView ===
          'ingredient-detail' &&
        selectedIngredient && (
        <PurchaseEditor
          purchase={
            editorPurchase
          }

          itemType="ingredient"

          itemId={
            selectedIngredient.id
          }

          itemName={
            selectedIngredient.name
          }

          brand={
            selectedIngredient.manufacturer
          }

          onSave={
            handleSaveProductPurchase
          }

          onClose={() => {
            setEditorPurchase(
              null,
            )

            setIsPurchaseEditorOpen(
              false,
            )
          }}
        />
      )}
    </>
  )
}