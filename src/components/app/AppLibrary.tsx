import {
  useEffect,
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


type LibraryDestination =
  | 'library'
  | 'growing-recipes'
  | 'ingredients'
  | 'products'


interface AppLibraryProps {
  recipes: GrowingSetup[]

  ingredients: Ingredient[]

  products: GardenProduct[]

  purchases: PurchaseRecord[]

  plants: PlantStory[]

  growingPlaces: GrowingPlace[]

  initialRecipeId?: string | null

  initialView?:
    | 'library'
    | 'growing-recipes'
    | 'ingredients'
    | 'products'
    | null

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
    libraryView?: LibraryDestination,
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


type ProductEditorMode =
  | 'new'
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


/* =======================================
   PRODUCT VARIATION ID
======================================= */

function createProductVariationId(
  product: GardenProduct,
): string {
  const safeName =
    product.name
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

  return `product-variation-${
    safeName || 'product'
  }-${Date.now()}`
}


/* =======================================
   TODAY
======================================= */

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
  initialView,
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
        : initialView ??
          'library',
    )


  /* =======================================
     RESPOND TO LIBRARY NAVIGATION
  ======================================= */

  useEffect(() => {
    if (
      initialRecipeId
    ) {
      setSelectedRecipeId(
        initialRecipeId,
      )

      setSelectedIngredientId(
        null,
      )

      setSelectedProductId(
        null,
      )

      setCurrentView(
        'recipe-detail',
      )

      return
    }


    if (
      initialView
    ) {
      setSelectedRecipeId(
        null,
      )

      setSelectedIngredientId(
        null,
      )

      setSelectedProductId(
        null,
      )

      setCurrentView(
        initialView,
      )
    }
  }, [
    initialRecipeId,
    initialView,
  ])


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
    productEditorMode,
    setProductEditorMode,
  ] =
    useState<ProductEditorMode>(
      'new',
    )


  const [
    editorProduct,
    setEditorProduct,
  ] =
    useState<GardenProduct | null>(
      null,
    )


  const [
    variationPurchaseTemplate,
    setVariationPurchaseTemplate,
  ] =
    useState<PurchaseRecord | null>(
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


  const [
    purchaseEditorMode,
    setPurchaseEditorMode,
  ] =
    useState<
      'new' |
      'edit' |
      'repeat'
    >(
      'new',
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
     LIBRARY-AWARE NAVIGATION
  ======================================= */

  function handleLibraryNavigate(
    page: AppPage,
    libraryView?: LibraryDestination,
  ) {
    setIsProductEditorOpen(
      false,
    )

    setEditorProduct(
      null,
    )

    setProductEditorMode(
      'new',
    )


    setIsIngredientEditorOpen(
      false,
    )

    setEditorIngredient(
      null,
    )


    setIsRecipeEditorOpen(
      false,
    )

    setEditorRecipe(
      null,
    )

    setRecipeEditorMode(
      'create',
    )


    setIsPurchaseEditorOpen(
      false,
    )

    setEditorPurchase(
      null,
    )

    setPurchaseEditorMode(
      'new',
    )


    if (
      page === 'library' &&
      libraryView
    ) {
      setSelectedRecipeId(
        null,
      )

      setSelectedIngredientId(
        null,
      )

      setSelectedProductId(
        null,
      )

      setCurrentView(
        libraryView,
      )


      onNavigate(
        page,
        libraryView,
      )

      return
    }


    onNavigate(
      page,
      libraryView,
    )
  }


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

    setSelectedProductId(
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

    setSelectedProductId(
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
     CREATE RECIPE VARIATION
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
    onUpdateRecipe({
      ...recipe,

      isFavourite:
        !recipe.isFavourite,

      updatedAt:
        getTodayDate(),
    })
  }


  /* =======================================
     RECIPE RATING
  ======================================= */

  function handleSetRating(
    recipe: GrowingSetup,
    rating: RecordRating,
  ) {
    onUpdateRecipe({
      ...recipe,

      rating,

      updatedAt:
        getTodayDate(),
    })
  }


  /* =======================================
     INGREDIENT FAVOURITE
  ======================================= */

  function handleToggleIngredientFavourite(
    ingredient: Ingredient,
  ) {
    onUpdateIngredient({
      ...ingredient,

      isFavourite:
        !ingredient.isFavourite,

      updatedAt:
        getTodayDate(),
    })
  }


  /* =======================================
     INGREDIENT RATING
  ======================================= */

  function handleSetIngredientRating(
    ingredient: Ingredient,
    rating: number,
  ) {
    onUpdateIngredient({
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
    })
  }


  /* =======================================
     PRODUCT FAVOURITE
  ======================================= */

  function handleToggleProductFavourite(
    product: GardenProduct,
  ) {
    onUpdateProduct({
      ...product,

      isFavourite:
        !product.isFavourite,

      updatedAt:
        getTodayDate(),
    })
  }


  /* =======================================
     PRODUCT RATING
  ======================================= */

  function handleSetProductRating(
    product: GardenProduct,
    rating: number,
  ) {
    onUpdateProduct({
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
    })
  }


  /* =======================================
     OPEN EDIT PRODUCT
  ======================================= */

  function handleOpenEditProduct(
    product: GardenProduct,
  ) {
    setProductEditorMode(
      'edit',
    )

    setEditorProduct(
      product,
    )

    setIsProductEditorOpen(
      true,
    )
  }


  /* =======================================
     PRODUCT QUICK ACTIONS
  ======================================= */

  function handleCreateProductVariation(
    sourceProduct: GardenProduct,
  ) {
    const today =
      getTodayDate()
  
  
    const variationDraft:
      GardenProduct = {
        ...sourceProduct,
  
        id:
          createProductVariationId(
            sourceProduct,
          ),
  
        name:
          `${sourceProduct.name} (Variation)`,
  
        isFavourite:
          false,
  
        rating:
          undefined,
  
        isArchived:
          false,
  
        archivedAt:
          undefined,
  
        photoUrls: [],
  
        createdAt:
          today,
  
        updatedAt:
          undefined,
      }
  
  
    const mostRecentPurchase =
      purchases
        .filter(
          (
            purchase,
          ) =>
            purchase.itemType ===
              'product' &&
            purchase.itemId ===
              sourceProduct.id,
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.date.localeCompare(
              first.date,
            ),
        )[0] ??
      null
  
  
    setVariationPurchaseTemplate(
      mostRecentPurchase,
    )
  
  
    setProductEditorMode(
      'variation',
    )
  
    setEditorProduct(
      variationDraft,
    )
  
    setIsProductEditorOpen(
      true,
    )
  }


  function handleAddProductNote(
    product: GardenProduct,
  ) {
    const note =
      window.prompt(
        `Add a note to "${product.name}"`,
        product.notes ??
          '',
      )


    if (
      note === null
    ) {
      return
    }


    onUpdateProduct({
      ...product,

      notes:
        note.trim() ||
        undefined,

      updatedAt:
        getTodayDate(),
    })
  }


  function handleAddProductPhotographs(
    product: GardenProduct,
  ) {
    handleOpenEditProduct(
      product,
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


    onUpdateProduct({
      ...product,

      isArchived:
        true,

      archivedAt:
        today,

      updatedAt:
        today,
    })


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
    onUpdateProduct({
      ...product,

      isArchived:
        false,

      archivedAt:
        undefined,

      updatedAt:
        getTodayDate(),
    })


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


    onUpdateRecipe({
      ...recipe,

      isArchived:
        true,

      archivedAt:
        today,

      updatedAt:
        today,
    })


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
    onUpdateRecipe({
      ...recipe,

      isArchived:
        false,

      archivedAt:
        undefined,

      updatedAt:
        getTodayDate(),
    })


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


    onUpdateIngredient({
      ...ingredient,

      isArchived:
        true,

      archivedAt:
        today,

      updatedAt:
        today,
    })


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
    onUpdateIngredient({
      ...ingredient,

      isArchived:
        false,

      archivedAt:
        undefined,

      updatedAt:
        getTodayDate(),
    })


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
     SAVE PURCHASE
  ======================================= */

  function handleSaveProductPurchase(
    purchase: PurchaseRecord,
  ) {
    if (
      purchaseEditorMode ===
      'edit'
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

    setPurchaseEditorMode(
      'new',
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

          setPurchaseEditorMode(
            'new',
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

          setPurchaseEditorMode(
            'edit',
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
          handleLibraryNavigate
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
          handleLibraryNavigate
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
          handleLibraryNavigate
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

          setPurchaseEditorMode(
            'new',
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

          setPurchaseEditorMode(
            'edit',
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
          handleLibraryNavigate
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
          handleLibraryNavigate
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
          handleLibraryNavigate
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

        onCreateVariation={() =>
          handleCreateProductVariation(
            selectedProduct,
          )
        }

        onAddPhotographs={() =>
          handleAddProductPhotographs(
            selectedProduct,
          )
        }

        onAddNote={() =>
          handleAddProductNote(
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
          const mostRecentPurchase =
            purchases
              .filter(
                (
                  purchase,
                ) =>
                  purchase.itemType ===
                    'product' &&
                  purchase.itemId ===
                    selectedProduct.id,
              )
              .sort(
                (
                  first,
                  second,
                ) =>
                  second.date.localeCompare(
                    first.date,
                  ),
              )[0] ??
            null


          setEditorPurchase(
            mostRecentPurchase,
          )

          setPurchaseEditorMode(
            mostRecentPurchase
              ? 'repeat'
              : 'new',
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

          setPurchaseEditorMode(
            'edit',
          )

          setIsPurchaseEditorOpen(
            true,
          )
        }}

        onNavigate={
          handleLibraryNavigate
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
          setProductEditorMode(
            'new',
          )

          setEditorProduct(
            null,
          )

          setIsProductEditorOpen(
            true,
          )
        }}

        onNavigate={
          handleLibraryNavigate
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
          handleLibraryNavigate
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

          mode={
            productEditorMode
          }

          initialPurchase={
            productEditorMode ===
              'variation'
              ? variationPurchaseTemplate
              : null
          }

          onSave={(
            product,
            purchase,
          ) => {
            if (
              productEditorMode ===
              'edit'
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

            setVariationPurchaseTemplate(
              null,
            )

            setProductEditorMode(
              'new',
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

            setVariationPurchaseTemplate(
              null,
            )

            setProductEditorMode(
              'new',
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

          mode={
            purchaseEditorMode
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

            setPurchaseEditorMode(
              'new',
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

          mode={
            purchaseEditorMode
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

            setPurchaseEditorMode(
              'new',
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

          mode={
            purchaseEditorMode
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

            setPurchaseEditorMode(
              'new',
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