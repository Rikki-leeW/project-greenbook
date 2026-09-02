import { useEffect, useState } from 'react';

import Library from '../../pages/Library';
import GrowingRecipes from '../../pages/GrowingRecipes';
import GrowingRecipeDetail from '../../pages/GrowingRecipeDetail';
import Ingredients from '../../pages/Ingredients';
import IngredientDetail from '../../pages/IngredientDetail';
import Products from '../../pages/Products';
import PurchaseEditor from '../purchases/PurchaseEditor';
import AddRecipeForm from '../forms/AddRecipeForm';
import AddIngredientForm from '../forms/AddIngredientForm';
import AddProductForm from '../forms/AddProductForm';
import ProductDetail from '../../pages/ProductDetail';

import type {
  GardenProduct,
  GrowingPlace,
  GrowingSetup,
  GrowingSetupCategory,
  Ingredient,
  PlantStory,
  PurchaseRecord,
} from '../../types';

import type { AppPage } from '../../types/navigation';

type GrowingLibraryDestination =
  | 'growing-recipes'
  | 'growing-own-mix'
  | 'growing-bought-mix'
  | 'growing-system'
  | 'growing-ground-type';

type LibraryDestination =
  | 'library'
  | GrowingLibraryDestination
  | 'ingredients'
  | 'products';

type GrowingCategoryFilter =
  | 'all'
  | GrowingSetupCategory;

interface AppLibraryProps {
  recipes: GrowingSetup[];
  ingredients: Ingredient[];
  products: GardenProduct[];
  purchases: PurchaseRecord[];
  plants: PlantStory[];
  growingPlaces: GrowingPlace[];

  initialRecipeId?: string | null;
  initialIngredientId?: string | null;
  initialProductId?: string | null;
  initialView?: LibraryDestination | null;

  journeyBackLabel?: string | null;
  onJourneyBack?: () => void;

  onAddRecipe: (recipe: GrowingSetup) => void;
  onUpdateRecipe: (recipe: GrowingSetup) => void;
  onDeleteRecipe: (recipeId: string) => void;

  onAddIngredient: (ingredient: Ingredient) => void;
  onUpdateIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (ingredientId: string) => void;

  onAddProduct: (product: GardenProduct) => void;
  onUpdateProduct: (product: GardenProduct) => void;
  onDeleteProduct: (productId: string) => void;

  onAddPurchase: (purchase: PurchaseRecord) => void;
  onUpdatePurchase: (purchase: PurchaseRecord) => void;

  onOpenGrowingPlace: (growingPlaceId: string) => void;
  onOpenPlant: (plantId: string) => void;

  onNavigate: (
    page: AppPage,
    libraryView?: LibraryDestination,
  ) => void;
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
  | 'product-detail';

type RecipeEditorMode =
  | 'create'
  | 'edit'
  | 'variation';

type IngredientEditorMode =
  | 'create'
  | 'edit'
  | 'variation';

type ProductEditorMode =
  | 'new'
  | 'edit'
  | 'variation';

type RecordRating =
  | 1
  | 2
  | 3
  | 4
  | 5;

function isGrowingLibraryDestination(
  destination: LibraryDestination,
): destination is GrowingLibraryDestination {
  return (
    destination === 'growing-recipes' ||
    destination === 'growing-own-mix' ||
    destination === 'growing-bought-mix' ||
    destination === 'growing-system' ||
    destination === 'growing-ground-type'
  );
}

function getGrowingCategoryFromDestination(
  destination: GrowingLibraryDestination,
): GrowingCategoryFilter {
  switch (destination) {
    case 'growing-own-mix':
      return 'own-mix';
    case 'growing-bought-mix':
      return 'bought-mix';
    case 'growing-system':
      return 'growing-system';
    case 'growing-ground-type':
      return 'ground-type';
    default:
      return 'all';
  }
}

function getInitialLibraryView(
  initialView:
    | LibraryDestination
    | null
    | undefined,
): LibraryView {
  if (!initialView) {
    return 'library';
  }

  if (
    isGrowingLibraryDestination(
      initialView,
    )
  ) {
    return 'growing-recipes';
  }

  return initialView;
}

function makeSafeIdName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function createVariationId(
  recipe: GrowingSetup,
): string {
  return `variation-${
    makeSafeIdName(recipe.name) ||
    'recipe'
  }-${Date.now()}`;
}

function createIngredientVariationId(
  ingredient: Ingredient,
): string {
  return `ingredient-variation-${
    makeSafeIdName(ingredient.name) ||
    'ingredient'
  }-${Date.now()}`;
}

function createProductVariationId(
  product: GardenProduct,
): string {
  return `product-variation-${
    makeSafeIdName(product.name) ||
    'product'
  }-${Date.now()}`;
}

function getTodayDate(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export default function AppLibrary({
  recipes,
  ingredients,
  products,
  purchases,
  plants,
  growingPlaces,
  initialRecipeId,
  initialIngredientId,
  initialProductId,
  initialView,
  journeyBackLabel,
  onJourneyBack,
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
  const initialGrowingCategory:
    GrowingCategoryFilter =
      initialView &&
      isGrowingLibraryDestination(
        initialView,
      )
        ? getGrowingCategoryFromDestination(
            initialView,
          )
        : 'all';

  const [
    currentView,
    setCurrentView,
  ] = useState<LibraryView>(
    initialRecipeId
      ? 'recipe-detail'
      : initialIngredientId
        ? 'ingredient-detail'
        : initialProductId
          ? 'product-detail'
          : getInitialLibraryView(
              initialView,
            ),
  );

  const [
    growingCategory,
    setGrowingCategory,
  ] = useState<GrowingCategoryFilter>(
    initialGrowingCategory,
  );

  type LibraryNavigationOrigin =
    | {
        view: 'recipe-detail';
        recordId: string;
        label: string;
      }
    | {
        view: 'ingredient-detail';
        recordId: string;
        label: string;
      }
    | {
        view: 'product-detail';
        recordId: string;
        label: string;
      }
    | {
        view:
          | 'growing-recipes'
          | 'ingredients'
          | 'products'
          | 'library';
        recordId?: never;
        label: string;
      };

  const [
    navigationOrigin,
    setNavigationOrigin,
  ] = useState<
    LibraryNavigationOrigin | null
  >(null);

  const [
    selectedRecipeId,
    setSelectedRecipeId,
  ] = useState<string | null>(
    initialRecipeId ?? null,
  );

  const [
    isRecipeEditorOpen,
    setIsRecipeEditorOpen,
  ] = useState(false);

  const [
    recipeEditorMode,
    setRecipeEditorMode,
  ] = useState<RecipeEditorMode>(
    'create',
  );

  const [
    editorRecipe,
    setEditorRecipe,
  ] = useState<GrowingSetup | null>(
    null,
  );

  const [
    selectedIngredientId,
    setSelectedIngredientId,
  ] = useState<string | null>(
    initialIngredientId ?? null,
  );

  const [
    isIngredientEditorOpen,
    setIsIngredientEditorOpen,
  ] = useState(false);

  const [
    ingredientEditorMode,
    setIngredientEditorMode,
  ] = useState<IngredientEditorMode>(
    'create',
  );

  const [
    editorIngredient,
    setEditorIngredient,
  ] = useState<Ingredient | null>(
    null,
  );

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState<string | null>(
    initialProductId ?? null,
  );

  const [
    isProductEditorOpen,
    setIsProductEditorOpen,
  ] = useState(false);

  const [
    productEditorMode,
    setProductEditorMode,
  ] = useState<ProductEditorMode>(
    'new',
  );

  const [
    editorProduct,
    setEditorProduct,
  ] = useState<GardenProduct | null>(
    null,
  );

  const [
    variationPurchaseTemplate,
    setVariationPurchaseTemplate,
  ] = useState<PurchaseRecord | null>(
    null,
  );

  const [
    isPurchaseEditorOpen,
    setIsPurchaseEditorOpen,
  ] = useState(false);

  const [
    editorPurchase,
    setEditorPurchase,
  ] = useState<PurchaseRecord | null>(
    null,
  );

  const [
    purchaseEditorMode,
    setPurchaseEditorMode,
  ] = useState<
    'new' | 'edit' | 'repeat'
  >('new');

  function handleReturnToNavigationOrigin():
    boolean {
    if (!navigationOrigin) {
      return false;
    }

    const origin = navigationOrigin;

    setNavigationOrigin(null);
    setSelectedRecipeId(null);
    setSelectedIngredientId(null);
    setSelectedProductId(null);

    if (
      origin.view === 'recipe-detail'
    ) {
      setSelectedRecipeId(
        origin.recordId,
      );
      setCurrentView('recipe-detail');
      return true;
    }

    if (
      origin.view ===
      'ingredient-detail'
    ) {
      setSelectedIngredientId(
        origin.recordId,
      );
      setCurrentView(
        'ingredient-detail',
      );
      return true;
    }

    if (
      origin.view === 'product-detail'
    ) {
      setSelectedProductId(
        origin.recordId,
      );
      setCurrentView('product-detail');
      return true;
    }

    setCurrentView(origin.view);
    return true;
  }

  useEffect(() => {
    if (initialRecipeId) {
      const recipe =
        recipes.find(
          item =>
            item.id ===
            initialRecipeId,
        );

      setNavigationOrigin(null);
      setSelectedRecipeId(
        initialRecipeId,
      );
      setSelectedIngredientId(null);
      setSelectedProductId(null);

      if (recipe) {
        setGrowingCategory(
          recipe.category,
        );
      }

      setCurrentView('recipe-detail');
      return;
    }

    if (initialIngredientId) {
      setNavigationOrigin(null);
      setSelectedRecipeId(null);
      setSelectedIngredientId(
        initialIngredientId,
      );
      setSelectedProductId(null);
      setCurrentView(
        'ingredient-detail',
      );
      return;
    }

    if (initialProductId) {
      setNavigationOrigin(null);
      setSelectedRecipeId(null);
      setSelectedIngredientId(null);
      setSelectedProductId(
        initialProductId,
      );
      setCurrentView('product-detail');
      return;
    }

    if (initialView) {
      setNavigationOrigin(null);
      setSelectedRecipeId(null);
      setSelectedIngredientId(null);
      setSelectedProductId(null);

      if (
        isGrowingLibraryDestination(
          initialView,
        )
      ) {
        setGrowingCategory(
          getGrowingCategoryFromDestination(
            initialView,
          ),
        );

        setCurrentView(
          'growing-recipes',
        );
        return;
      }

      setCurrentView(initialView);
    }
  }, [
    initialRecipeId,
    initialIngredientId,
    initialProductId,
    initialView,
    recipes,
  ]);

  const activeRecipes =
    recipes.filter(
      recipe =>
        !recipe.isArchived,
    );

  const archivedRecipes =
    recipes.filter(
      recipe =>
        Boolean(recipe.isArchived),
    );

  const selectedRecipe =
    recipes.find(
      recipe =>
        recipe.id ===
        selectedRecipeId,
    );

  const selectedProduct =
    products.find(
      product =>
        product.id ===
        selectedProductId,
    );

  const activeIngredients =
    ingredients.filter(
      ingredient =>
        !ingredient.isArchived,
    );

  const archivedIngredients =
    ingredients.filter(
      ingredient =>
        Boolean(
          ingredient.isArchived,
        ),
    );

  const selectedIngredient =
    ingredients.find(
      ingredient =>
        ingredient.id ===
        selectedIngredientId,
    );

  useEffect(() => {
    const hasOpenEditor =
      isRecipeEditorOpen ||
      isIngredientEditorOpen ||
      isProductEditorOpen ||
      isPurchaseEditorOpen;

    if (hasOpenEditor) return;

    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.documentElement.style.overflow =
      '';
  }, [
    isRecipeEditorOpen,
    isIngredientEditorOpen,
    isProductEditorOpen,
    isPurchaseEditorOpen,
  ]);

  function handleLibraryNavigate(
    page: AppPage,
    libraryView?: LibraryDestination,
  ) {
    setIsProductEditorOpen(false);
    setEditorProduct(null);
    setProductEditorMode('new');

    setIsIngredientEditorOpen(false);
    setEditorIngredient(null);
    setIngredientEditorMode('create');

    setIsRecipeEditorOpen(false);
    setEditorRecipe(null);
    setRecipeEditorMode('create');

    setIsPurchaseEditorOpen(false);
    setEditorPurchase(null);
    setPurchaseEditorMode('new');

    if (
      page === 'library' &&
      libraryView
    ) {
      setNavigationOrigin(null);
      setSelectedRecipeId(null);
      setSelectedIngredientId(null);
      setSelectedProductId(null);

      if (
        isGrowingLibraryDestination(
          libraryView,
        )
      ) {
        setGrowingCategory(
          getGrowingCategoryFromDestination(
            libraryView,
          ),
        );

        setCurrentView(
          'growing-recipes',
        );
      } else {
        setCurrentView(libraryView);
      }

      onNavigate(page, libraryView);
      return;
    }

    onNavigate(page, libraryView);
  }

  function getRecipeRelationshipCount(
    recipe: GrowingSetup,
  ): number {
    const linkedPlantCount =
      plants.filter(plant => {
        const linkedInCurrentSetups =
          plant.currentGrowingSetupIds
            ?.includes(recipe.id) ??
          false;

        const linkedInPreviousSetups =
          plant.previousGrowingSetupIdsV2
            ?.includes(recipe.id) ??
          false;

        const linkedInGrowingHistory =
          plant.growingHistory?.some(
            entry =>
              (entry.growingSetupIds
                ?.includes(recipe.id) ??
                false) ||
              entry.growingSetupId ===
                recipe.id,
          ) ?? false;

        const linkedByLegacyPlantFields =
          plant.currentGrowingSetupId ===
            recipe.id ||
          (plant.previousGrowingSetupIds
            ?.includes(recipe.id) ??
            false);

        return (
          linkedInCurrentSetups ||
          linkedInPreviousSetups ||
          linkedInGrowingHistory ||
          linkedByLegacyPlantFields
        );
      }).length;

    const linkedRecipeCount =
      recipes.filter(
        otherRecipe =>
          otherRecipe.id !== recipe.id &&
          (otherRecipe.recipeComponents
            ?.some(
              component =>
                component.sourceType ===
                  'growing-setup' &&
                component.sourceId ===
                  recipe.id,
            ) ?? false),
      ).length;

    const linkedPurchaseCount =
      purchases.filter(
        purchase =>
          purchase.itemType ===
            'growing-setup' &&
          purchase.itemId === recipe.id,
      ).length;

    return (
      linkedPlantCount +
      linkedRecipeCount +
      linkedPurchaseCount
    );
  }

  function getIngredientRelationshipCount(
    ingredient: Ingredient,
  ): number {
    return recipes.filter(
      recipe =>
        (recipe.ingredientIds?.includes(
          ingredient.id,
        ) ?? false) ||
        (recipe.recipeComponents?.some(
          component =>
            component.sourceType ===
              'ingredient' &&
            component.sourceId ===
              ingredient.id,
        ) ?? false),
    ).length;
  }

  function handleOpenRecipe(
    recipeId: string,
  ) {
    setNavigationOrigin(null);
    setSelectedIngredientId(null);
    setSelectedProductId(null);
    setSelectedRecipeId(recipeId);
    setCurrentView('recipe-detail');
  }

  function handleOpenIngredient(
    ingredientId: string,
  ) {
    setNavigationOrigin(null);
    setSelectedRecipeId(null);
    setSelectedProductId(null);
    setSelectedIngredientId(
      ingredientId,
    );
    setCurrentView(
      'ingredient-detail',
    );
  }

  function handleOpenProduct(
    productId: string,
  ) {
    setNavigationOrigin(null);
    setSelectedRecipeId(null);
    setSelectedIngredientId(null);
    setSelectedProductId(productId);
    setCurrentView('product-detail');
  }

  function handleOpenCreateRecipe() {
    setRecipeEditorMode('create');
    setEditorRecipe(null);
    setIsRecipeEditorOpen(true);
  }

  function handleOpenEditRecipe(
    recipe: GrowingSetup,
  ) {
    setRecipeEditorMode('edit');
    setEditorRecipe(recipe);
    setIsRecipeEditorOpen(true);
  }

  function handleCreateVariation(
    sourceRecipe: GrowingSetup,
  ) {
    const createdAt =
      getTodayDate();

    const variationDraft:
      GrowingSetup = {
        ...sourceRecipe,
        id: createVariationId(
          sourceRecipe,
        ),
        name:
          `${sourceRecipe.name} (Copy)`,
        basedOnRecipeId:
          sourceRecipe.id,
        isFavourite: false,
        rating: undefined,
        isArchived: false,
        archivedAt: undefined,
        ingredientIds: [
          ...(sourceRecipe.ingredientIds ??
            []),
        ],
        recipeComponents:
          sourceRecipe.recipeComponents
            ?.map(component => ({
              ...component,
            })),
        photoUrls: [],
        createdAt,
        updatedAt: undefined,
      };

    setRecipeEditorMode(
      'variation',
    );
    setEditorRecipe(
      variationDraft,
    );
    setIsRecipeEditorOpen(true);
  }

  function handleOpenCreateIngredient() {
    setIngredientEditorMode('create');
    setEditorIngredient(null);
    setIsIngredientEditorOpen(true);
  }

  function handleOpenEditIngredient(
    ingredient: Ingredient,
  ) {
    setIngredientEditorMode('edit');
    setEditorIngredient(ingredient);
    setIsIngredientEditorOpen(true);
  }

  function handleCreateIngredientVariation(
    sourceIngredient: Ingredient,
  ) {
    const today = getTodayDate();

    const variationDraft:
      Ingredient = {
        id:
          createIngredientVariationId(
            sourceIngredient,
          ),
        name:
          `${sourceIngredient.name} (Variation)`,
        category:
          sourceIngredient.category,
        customCategoryLabel:
          sourceIngredient.customCategoryLabel,
        basedOnIngredientId:
          sourceIngredient.id,
        manufacturer:
          sourceIngredient.manufacturer,
        source:
          sourceIngredient.source,
        notes: undefined,
        photoUrls: [],
        isFavourite: false,
        rating: undefined,
        isArchived: false,
        archivedAt: undefined,
        createdAt: today,
        updatedAt: undefined,
      };

    setIngredientEditorMode(
      'variation',
    );

    setEditorIngredient(
      variationDraft,
    );

    setIsIngredientEditorOpen(true);
  }

  function handleToggleFavourite(
    recipe: GrowingSetup,
  ) {
    onUpdateRecipe({
      ...recipe,
      isFavourite:
        !recipe.isFavourite,
      updatedAt: getTodayDate(),
    });
  }

  function handleSetRating(
    recipe: GrowingSetup,
    rating: RecordRating,
  ) {
    onUpdateRecipe({
      ...recipe,
      rating,
      updatedAt: getTodayDate(),
    });
  }

  function handleToggleIngredientFavourite(
    ingredient: Ingredient,
  ) {
    onUpdateIngredient({
      ...ingredient,
      isFavourite:
        !ingredient.isFavourite,
      updatedAt: getTodayDate(),
    });
  }

  function handleSetIngredientRating(
    ingredient: Ingredient,
    rating: number,
  ) {
    onUpdateIngredient({
      ...ingredient,
      rating: Math.max(
        1,
        Math.min(5, rating),
      ) as RecordRating,
      updatedAt: getTodayDate(),
    });
  }

  function handleToggleProductFavourite(
    product: GardenProduct,
  ) {
    onUpdateProduct({
      ...product,
      isFavourite:
        !product.isFavourite,
      updatedAt: getTodayDate(),
    });
  }

  function handleSetProductRating(
    product: GardenProduct,
    rating: number,
  ) {
    onUpdateProduct({
      ...product,
      rating: Math.max(
        1,
        Math.min(5, rating),
      ) as RecordRating,
      updatedAt: getTodayDate(),
    });
  }

  function handleOpenEditProduct(
    product: GardenProduct,
  ) {
    setProductEditorMode('edit');
    setEditorProduct(product);
    setIsProductEditorOpen(true);
  }

  function handleCreateProductVariation(
    sourceProduct: GardenProduct,
  ) {
    const today = getTodayDate();

    const variationDraft:
      GardenProduct = {
        ...sourceProduct,
        id:
          createProductVariationId(
            sourceProduct,
          ),
        name:
          `${sourceProduct.name} (Variation)`,
        isFavourite: false,
        rating: undefined,
        isArchived: false,
        archivedAt: undefined,
        photoUrls: [],
        createdAt: today,
        updatedAt: undefined,
      };

    const mostRecentPurchase =
      purchases
        .filter(
          purchase =>
            purchase.itemType ===
              'product' &&
            purchase.itemId ===
              sourceProduct.id,
        )
        .sort((first, second) =>
          second.date.localeCompare(
            first.date,
          ),
        )[0] ?? null;

    setVariationPurchaseTemplate(
      mostRecentPurchase,
    );
    setProductEditorMode(
      'variation',
    );
    setEditorProduct(
      variationDraft,
    );
    setIsProductEditorOpen(true);
  }

  function handleAddProductNote(
    product: GardenProduct,
  ) {
    const note = window.prompt(
      `Add a note to "${product.name}"`,
      product.notes ?? '',
    );

    if (note === null) return;

    onUpdateProduct({
      ...product,
      notes:
        note.trim() || undefined,
      updatedAt: getTodayDate(),
    });
  }

  function handleAddProductPhotographs(
    product: GardenProduct,
  ) {
    handleOpenEditProduct(product);
  }

  function handleArchiveProduct(
    product: GardenProduct,
  ) {
    const confirmed =
      window.confirm(
        `Archive "${product.name}"?\n\n` +
        'It will leave your active Product shelf, but Sprig will keep its history and purchase records.',
      );

    if (!confirmed) return;

    const today = getTodayDate();

    onUpdateProduct({
      ...product,
      isArchived: true,
      archivedAt: today,
      updatedAt: today,
    });

    setSelectedProductId(null);
    setCurrentView('products');
  }

  function handleRestoreProduct(
    product: GardenProduct,
  ) {
    onUpdateProduct({
      ...product,
      isArchived: false,
      archivedAt: undefined,
      updatedAt: getTodayDate(),
    });

    setSelectedProductId(
      product.id,
    );
    setCurrentView(
      'product-detail',
    );
  }

  function handleDeleteProduct(
    product: GardenProduct,
  ) {
    const purchaseCount =
      purchases.filter(
        purchase =>
          purchase.itemType ===
            'product' &&
          purchase.itemId ===
            product.id,
      ).length;

    if (purchaseCount > 0) {
      window.alert(
        `Sprig can't permanently delete "${product.name}" because it has ${purchaseCount} ${
          purchaseCount === 1
            ? 'Purchase record'
            : 'Purchase records'
        } connected to it.\n\nArchive it instead so its price history remains intact.`,
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Permanently delete "${product.name}"?\n\n` +
        'This Product has no Purchase records connected to it.\n\n' +
        'This cannot be undone.',
      );

    if (!confirmed) return;

    onDeleteProduct(product.id);
    setSelectedProductId(null);
    setCurrentView('products');
  }

  function handleArchiveRecipe(
    recipe: GrowingSetup,
  ) {
    const confirmed =
      window.confirm(
        `Archive "${recipe.name}"?\n\n` +
        'It will leave your active What It Grows In shelf, but Sprig will keep its history and garden connections.',
      );

    if (!confirmed) return;

    const today = getTodayDate();

    onUpdateRecipe({
      ...recipe,
      isArchived: true,
      archivedAt: today,
      updatedAt: today,
    });

    setGrowingCategory(
      recipe.category,
    );
    setSelectedRecipeId(null);
    setCurrentView(
      'growing-recipes',
    );
  }

  function handleRestoreRecipe(
    recipe: GrowingSetup,
  ) {
    onUpdateRecipe({
      ...recipe,
      isArchived: false,
      archivedAt: undefined,
      updatedAt: getTodayDate(),
    });

    setGrowingCategory(
      recipe.category,
    );
    setSelectedRecipeId(
      recipe.id,
    );
    setCurrentView(
      'recipe-detail',
    );
  }

  function handleArchiveIngredient(
    ingredient: Ingredient,
  ) {
    const confirmed =
      window.confirm(
        `Archive "${ingredient.name}"?\n\n` +
        'It will leave your active Ingredient shelf, but Sprig will keep its history and Growing Recipe connections.',
      );

    if (!confirmed) return;

    const today = getTodayDate();

    onUpdateIngredient({
      ...ingredient,
      isArchived: true,
      archivedAt: today,
      updatedAt: today,
    });

    setSelectedIngredientId(null);
    setCurrentView('ingredients');
  }

  function handleRestoreIngredient(
    ingredient: Ingredient,
  ) {
    onUpdateIngredient({
      ...ingredient,
      isArchived: false,
      archivedAt: undefined,
      updatedAt: getTodayDate(),
    });

    setSelectedIngredientId(
      ingredient.id,
    );
    setCurrentView(
      'ingredient-detail',
    );
  }

  function handleDeleteRecipe(
    recipe: GrowingSetup,
  ) {
    const relationshipCount =
      getRecipeRelationshipCount(
        recipe,
      );

    if (relationshipCount > 0) {
      window.alert(
        `Sprig can't permanently delete "${recipe.name}" because it is still connected to ${relationshipCount} ${
          relationshipCount === 1
            ? 'garden record'
            : 'garden records'
        }.\n\nArchive it instead so those connections remain intact.`,
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Permanently delete "${recipe.name}"?\n\n` +
        'This record has no Plant Story, Growing Recipe, or Purchase connections.\n\n' +
        'This cannot be undone.',
      );

    if (!confirmed) return;

    const wasArchived =
      Boolean(recipe.isArchived);

    onDeleteRecipe(recipe.id);

    setGrowingCategory(
      recipe.category,
    );
    setSelectedRecipeId(null);

    setCurrentView(
      wasArchived
        ? 'archived-growing-recipes'
        : 'growing-recipes',
    );
  }

  function handleDeleteIngredient(
    ingredient: Ingredient,
  ) {
    const purchaseCount =
      purchases.filter(
        purchase =>
          purchase.itemType ===
            'ingredient' &&
          purchase.itemId ===
            ingredient.id,
      ).length;

    if (purchaseCount > 0) {
      window.alert(
        `Sprig can't permanently delete "${ingredient.name}" because it has ${purchaseCount} ${
          purchaseCount === 1
            ? 'Purchase record'
            : 'Purchase records'
        } connected to it.\n\nArchive it instead so its price history remains intact.`,
      );
      return;
    }

    const relationshipCount =
      getIngredientRelationshipCount(
        ingredient,
      );

    if (relationshipCount > 0) {
      window.alert(
        `Sprig can't permanently delete "${ingredient.name}" because it is still used by ${relationshipCount} ${
          relationshipCount === 1
            ? 'Growing Recipe'
            : 'Growing Recipes'
        }.\n\nArchive it instead so those recipe connections remain intact.`,
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Permanently delete "${ingredient.name}"?\n\n` +
        'This Ingredient has no Purchase records and is not currently used by a Growing Recipe.\n\n' +
        'This cannot be undone.',
      );

    if (!confirmed) return;

    const wasArchived =
      Boolean(
        ingredient.isArchived,
      );

    onDeleteIngredient(
      ingredient.id,
    );
    setSelectedIngredientId(null);

    setCurrentView(
      wasArchived
        ? 'archived-ingredients'
        : 'ingredients',
    );
  }

  function handleCloseRecipeEditor() {
    setIsRecipeEditorOpen(false);
    setEditorRecipe(null);
    setRecipeEditorMode('create');
  }

  function handleCloseIngredientEditor() {
    setIsIngredientEditorOpen(false);
    setEditorIngredient(null);
    setIngredientEditorMode('create');
  }

  function handleSaveProductPurchase(
    purchase: PurchaseRecord,
  ) {
    if (
      purchaseEditorMode === 'edit'
    ) {
      onUpdatePurchase(purchase);
    } else {
      onAddPurchase(purchase);
    }

    setEditorPurchase(null);
    setPurchaseEditorMode('new');
    setIsPurchaseEditorOpen(false);
  }

  function handleAddRecipe(
    recipe: GrowingSetup,
  ) {
    onAddRecipe(recipe);
    setGrowingCategory(
      recipe.category,
    );
    setSelectedRecipeId(
      recipe.id,
    );
    setEditorRecipe(null);
    setRecipeEditorMode('create');
    setIsRecipeEditorOpen(false);
    setCurrentView('recipe-detail');
  }

  function handleUpdateRecipe(
    recipe: GrowingSetup,
  ) {
    if (
      recipeEditorMode ===
      'variation'
    ) {
      onAddRecipe(recipe);
    } else {
      onUpdateRecipe(recipe);
    }

    setGrowingCategory(
      recipe.category,
    );
    setSelectedRecipeId(
      recipe.id,
    );
    setEditorRecipe(null);
    setRecipeEditorMode('create');
    setIsRecipeEditorOpen(false);
    setCurrentView('recipe-detail');
  }

  function handleAddIngredient(
    ingredient: Ingredient,
  ) {
    onAddIngredient(ingredient);
    setSelectedIngredientId(
      ingredient.id,
    );
    setEditorIngredient(null);
    setIngredientEditorMode('create');
    setIsIngredientEditorOpen(false);
    setCurrentView(
      'ingredient-detail',
    );
  }

  function handleUpdateIngredient(
    ingredient: Ingredient,
  ) {
    if (
      ingredientEditorMode ===
      'variation'
    ) {
      onAddIngredient(ingredient);
    } else {
      onUpdateIngredient(ingredient);
    }

    setSelectedIngredientId(
      ingredient.id,
    );
    setEditorIngredient(null);
    setIngredientEditorMode('create');
    setIsIngredientEditorOpen(false);
    setCurrentView(
      'ingredient-detail',
    );
  }

  let pageContent;

  if (
    currentView ===
      'ingredient-detail' &&
    selectedIngredient
  ) {
    pageContent = (
      <IngredientDetail
        ingredient={selectedIngredient}
        recipes={recipes}
        purchases={purchases}
        backLabel={
          navigationOrigin?.label ??
          journeyBackLabel ??
          undefined
        }
        onBackToOrigin={
          navigationOrigin
            ? () => {
                handleReturnToNavigationOrigin();
              }
            : onJourneyBack
        }
        onBack={() =>
          onNavigate(
            'growing-places',
          )
        }
        onEdit={() =>
          handleOpenEditIngredient(
            selectedIngredient,
          )
        }
        onCreateVariation={() =>
          handleCreateIngredientVariation(
            selectedIngredient,
          )
        }
        onToggleFavourite={() =>
          handleToggleIngredientFavourite(
            selectedIngredient,
          )
        }
        onSetRating={rating =>
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
          setEditorPurchase(null);
          setPurchaseEditorMode('new');
          setIsPurchaseEditorOpen(true);
        }}
        onEditPurchase={purchase => {
          setEditorPurchase(purchase);
          setPurchaseEditorMode('edit');
          setIsPurchaseEditorOpen(true);
        }}
        onOpenRecipe={recipeId => {
          setNavigationOrigin({
            view: 'ingredient-detail',
            recordId:
              selectedIngredient.id,
            label:
              selectedIngredient.name,
          });

          setSelectedIngredientId(null);
          setSelectedRecipeId(recipeId);
          setCurrentView(
            'recipe-detail',
          );
        }}
        onNavigate={handleLibraryNavigate}
      />
    );
  } else if (
    currentView === 'ingredients'
  ) {
    pageContent = (
      <Ingredients
        ingredients={activeIngredients}
        recipes={recipes}
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
        onNavigate={handleLibraryNavigate}
      />
    );
  } else if (
    currentView ===
    'archived-ingredients'
  ) {
    pageContent = (
      <Ingredients
        ingredients={archivedIngredients}
        recipes={recipes}
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
          setCurrentView('ingredients')
        }
        archivedButtonLabel="Back to Active Ingredients"
        onNavigate={handleLibraryNavigate}
      />
    );
  } else if (
    currentView ===
      'recipe-detail' &&
    selectedRecipe
  ) {
    pageContent = (
      <GrowingRecipeDetail
        recipe={selectedRecipe}
        ingredients={ingredients}
        products={products}
        growingSetups={recipes}
        plants={plants}
        growingPlaces={growingPlaces}
        purchases={purchases}
        backLabel={
          navigationOrigin?.label ??
          journeyBackLabel ??
          undefined
        }
        onBackToOrigin={
          navigationOrigin
            ? () => {
                handleReturnToNavigationOrigin();
              }
            : onJourneyBack
        }
        onBack={() =>
          onNavigate(
            'growing-places',
          )
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
        onSetRating={rating =>
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
        onAddPurchase={() => {
          setEditorPurchase(null);
          setPurchaseEditorMode('new');
          setIsPurchaseEditorOpen(true);
        }}
        onEditPurchase={purchase => {
          setEditorPurchase(purchase);
          setPurchaseEditorMode('edit');
          setIsPurchaseEditorOpen(true);
        }}
        onOpenGrowingPlace={
          growingPlaceId =>
            onOpenGrowingPlace(
              growingPlaceId,
            )
        }
        onOpenPlant={plantId =>
          onOpenPlant(plantId)
        }
        onOpenIngredient={
          ingredientId => {
            setNavigationOrigin({
              view: 'recipe-detail',
              recordId:
                selectedRecipe.id,
              label:
                selectedRecipe.name,
            });

            setSelectedRecipeId(null);
            setSelectedProductId(null);
            setSelectedIngredientId(
              ingredientId,
            );
            setCurrentView(
              'ingredient-detail',
            );
          }
        }
        onOpenProduct={productId => {
          setNavigationOrigin({
            view: 'recipe-detail',
            recordId:
              selectedRecipe.id,
            label:
              selectedRecipe.name,
          });

          setSelectedRecipeId(null);
          setSelectedIngredientId(null);
          setSelectedProductId(productId);
          setCurrentView(
            'product-detail',
          );
        }}
        onOpenRecipe={recipeId => {
          const nextRecipe =
            recipes.find(
              item =>
                item.id === recipeId,
            );

          if (nextRecipe) {
            setGrowingCategory(
              nextRecipe.category,
            );
          }

          setNavigationOrigin({
            view: 'recipe-detail',
            recordId:
              selectedRecipe.id,
            label:
              selectedRecipe.name,
          });

          setSelectedIngredientId(null);
          setSelectedProductId(null);
          setSelectedRecipeId(recipeId);
          setCurrentView(
            'recipe-detail',
          );
        }}
        onNavigate={handleLibraryNavigate}
      />
    );
  } else if (
    currentView ===
    'archived-growing-recipes'
  ) {
    pageContent = (
      <GrowingRecipes
        recipes={archivedRecipes}
        title="Archived What It Grows In"
        intro="Growing records kept safely in Sprig's history after their active work in the garden is done."
        emptyTitle="No archived growing records"
        emptyMessage="Nothing has been retired from What the Garden Grows In yet."
        showArchivedStatus
        initialCategory="all"
        onCategoryChange={
          setGrowingCategory
        }
        onOpenRecipe={handleOpenRecipe}
        onAddRecipe={
          handleOpenCreateRecipe
        }
        onShowArchived={() =>
          setCurrentView(
            'growing-recipes',
          )
        }
        archivedButtonLabel="Back to Active Growing Records"
        onNavigate={handleLibraryNavigate}
      />
    );
  } else if (
    currentView ===
    'growing-recipes'
  ) {
    pageContent = (
      <GrowingRecipes
        recipes={activeRecipes}
        archivedCount={
          archivedRecipes.length
        }
        initialCategory={
          growingCategory
        }
        onCategoryChange={
          setGrowingCategory
        }
        onOpenRecipe={handleOpenRecipe}
        onAddRecipe={
          handleOpenCreateRecipe
        }
        onShowArchived={() =>
          setCurrentView(
            'archived-growing-recipes',
          )
        }
        onNavigate={handleLibraryNavigate}
      />
    );
  } else if (
    currentView ===
      'product-detail' &&
    selectedProduct
  ) {
    pageContent = (
      <ProductDetail
        product={selectedProduct}
        purchases={purchases}
        backLabel={
          navigationOrigin?.label ??
          journeyBackLabel ??
          undefined
        }
        onBackToOrigin={
          navigationOrigin
            ? () => {
                handleReturnToNavigationOrigin();
              }
            : onJourneyBack
        }
        onBack={() =>
          onNavigate(
            'growing-places',
          )
        }
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
        onSetRating={rating =>
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
                purchase =>
                  purchase.itemType ===
                    'product' &&
                  purchase.itemId ===
                    selectedProduct.id,
              )
              .sort((first, second) =>
                second.date.localeCompare(
                  first.date,
                ),
              )[0] ?? null;

          setEditorPurchase(
            mostRecentPurchase,
          );

          setPurchaseEditorMode(
            mostRecentPurchase
              ? 'repeat'
              : 'new',
          );

          setIsPurchaseEditorOpen(true);
        }}
        onEditPurchase={purchase => {
          setEditorPurchase(purchase);
          setPurchaseEditorMode('edit');
          setIsPurchaseEditorOpen(true);
        }}
        onNavigate={handleLibraryNavigate}
      />
    );
  } else if (
    currentView === 'products'
  ) {
    pageContent = (
      <Products
        products={products}
        onOpenProduct={
          handleOpenProduct
        }
        onAddProduct={() => {
          setProductEditorMode('new');
          setEditorProduct(null);
          setIsProductEditorOpen(true);
        }}
        onNavigate={handleLibraryNavigate}
      />
    );
  } else {
    pageContent = (
      <Library
        onOpenGrowingRecipes={() => {
          setNavigationOrigin(null);
          setSelectedRecipeId(null);
          setSelectedIngredientId(null);
          setSelectedProductId(null);
          setGrowingCategory('all');
          setCurrentView(
            'growing-recipes',
          );
        }}
        onOpenIngredients={() => {
          setNavigationOrigin(null);
          setSelectedRecipeId(null);
          setSelectedIngredientId(null);
          setSelectedProductId(null);
          setCurrentView('ingredients');
        }}
        onOpenProducts={() => {
          setNavigationOrigin(null);
          setSelectedRecipeId(null);
          setSelectedIngredientId(null);
          setSelectedProductId(null);
          setCurrentView('products');
        }}
        onNavigate={handleLibraryNavigate}
      />
    );
  }

  return (
    <>
      {pageContent}

      {isRecipeEditorOpen && (
        <AddRecipeForm
          ingredients={ingredients}
          products={products}
          growingSetups={recipes}
          recipeToEdit={
            editorRecipe ?? undefined
          }
          onAddRecipe={handleAddRecipe}
          onUpdateRecipe={
            handleUpdateRecipe
          }
          onAddIngredient={
            onAddIngredient
          }
          onAddProduct={onAddProduct}
          onAddPurchase={onAddPurchase}
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
          onAddPurchase={onAddPurchase}
          onClose={
            handleCloseIngredientEditor
          }
        />
      )}

      {isProductEditorOpen && (
        <AddProductForm
          product={editorProduct}
          mode={productEditorMode}
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
              productEditorMode === 'edit'
            ) {
              onUpdateProduct(product);
            } else {
              onAddProduct(product);
            }

            if (purchase) {
              onAddPurchase(purchase);
            }

            setSelectedProductId(
              product.id,
            );
            setEditorProduct(null);
            setVariationPurchaseTemplate(
              null,
            );
            setProductEditorMode('new');
            setIsProductEditorOpen(false);
            setCurrentView(
              'product-detail',
            );
          }}
          onClose={() => {
            setEditorProduct(null);
            setVariationPurchaseTemplate(
              null,
            );
            setProductEditorMode('new');
            setIsProductEditorOpen(false);
          }}
        />
      )}

      {isPurchaseEditorOpen &&
        currentView ===
          'product-detail' &&
        selectedProduct && (
          <PurchaseEditor
            purchase={editorPurchase}
            mode={purchaseEditorMode}
            itemType="product"
            itemId={selectedProduct.id}
            itemName={selectedProduct.name}
            brand={selectedProduct.brand}
            onSave={
              handleSaveProductPurchase
            }
            onClose={() => {
              setEditorPurchase(null);
              setPurchaseEditorMode('new');
              setIsPurchaseEditorOpen(false);
            }}
          />
        )}

      {isPurchaseEditorOpen &&
        currentView ===
          'recipe-detail' &&
        selectedRecipe && (
          <PurchaseEditor
            purchase={editorPurchase}
            mode={purchaseEditorMode}
            itemType="growing-setup"
            itemId={selectedRecipe.id}
            itemName={selectedRecipe.name}
            brand={selectedRecipe.brand}
            onSave={
              handleSaveProductPurchase
            }
            onClose={() => {
              setEditorPurchase(null);
              setPurchaseEditorMode('new');
              setIsPurchaseEditorOpen(false);
            }}
          />
        )}

      {isPurchaseEditorOpen &&
        currentView ===
          'ingredient-detail' &&
        selectedIngredient && (
          <PurchaseEditor
            purchase={editorPurchase}
            mode={purchaseEditorMode}
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
              setEditorPurchase(null);
              setPurchaseEditorMode('new');
              setIsPurchaseEditorOpen(false);
            }}
          />
        )}
    </>
  );
}