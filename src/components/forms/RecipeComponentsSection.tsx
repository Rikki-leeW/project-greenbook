import {
    useState,
    type Dispatch,
    type SetStateAction,
  } from 'react'
  
  import SprigPicker from '../sprig/SprigPicker'
  import SprigPhotoPicker from '../photos/SprigPhotoPicker'
  
  import type {
    GardenProduct,
    GrowingSetup,
    Ingredient,
  } from '../../types'
  
  
  type QuickAddType =
    | 'ingredient'
    | 'product'
    | null
  
  
  type ComponentSourceType =
    | 'ingredient'
    | 'product'
    | 'growing-setup'
  
  
  type RecipeComponent =
    NonNullable<
      GrowingSetup['recipeComponents']
    >[number]
  
  
  type RecipeComponentUnit =
    NonNullable<
      RecipeComponent['unit']
    >
  
  
  interface RecipeComponentsSectionProps {
    ingredients: Ingredient[]
  
    products: GardenProduct[]
  
    growingSetups: GrowingSetup[]
  
    /*
     * When editing a Growing Recipe, this lets
     * the picker exclude that recipe from its
     * own list of possible components.
     */
    currentRecipeId?: string
  
    /*
     * Legacy Ingredient links.
     *
     * Keep these synchronised while older
     * Sprig gardens still rely on ingredientIds.
     */
    selectedIngredientIds: string[]
  
    setSelectedIngredientIds: Dispatch<
      SetStateAction<string[]>
    >
  
    /*
     * Modern flexible component links.
     *
     * These retain the real identity of the
     * source record instead of flattening
     * everything into an Ingredient.
     */
    recipeComponents:
      GrowingSetup['recipeComponents']
  
    setRecipeComponents: Dispatch<
      SetStateAction<
        GrowingSetup['recipeComponents']
      >
    >
  
    /*
     * Quick-added Ingredients and Products
     * become ordinary permanent Sprig records.
     */
    onCreateIngredient: (
      name: string,
    ) => string | undefined
  
    onAddProduct: (
      product: GardenProduct,
    ) => void
  }
  
  
  /* =======================================
     COMPONENT PICKER VALUE
  ======================================= */
  
  function createComponentPickerValue(
    sourceType: ComponentSourceType,
    sourceId: string,
  ): string {
    return `${sourceType}:${sourceId}`
  }
  
  
  function readComponentPickerValue(
    value: string,
  ):
    | {
        sourceType:
          ComponentSourceType
  
        sourceId:
          string
      }
    | undefined {
  
    const separatorIndex =
      value.indexOf(
        ':',
      )
  
    if (
      separatorIndex <=
      0
    ) {
      return undefined
    }
  
  
    const sourceType =
      value.slice(
        0,
        separatorIndex,
      )
  
  
    const sourceId =
      value.slice(
        separatorIndex +
          1,
      )
  
  
    if (
      !sourceId
    ) {
      return undefined
    }
  
  
    if (
      sourceType !==
        'ingredient' &&
      sourceType !==
        'product' &&
      sourceType !==
        'growing-setup'
    ) {
      return undefined
    }
  
  
    return {
      sourceType,
      sourceId,
    }
  }
  
  
  /* =======================================
     INGREDIENT CATEGORY LABEL
  ======================================= */
  
  function getIngredientCategoryLabel(
    ingredient: Ingredient,
  ): string {
    if (
      ingredient.customCategoryLabel
        ?.trim()
    ) {
      return ingredient
        .customCategoryLabel
        .trim()
    }
  
  
    switch (
      ingredient.category
    ) {
      case 'compost':
        return 'Compost'
  
      case 'manure':
        return 'Manure'
  
      case 'organic-matter':
        return 'Organic Matter'
  
      case 'minerals':
        return 'Minerals'
  
      case 'aeration':
        return 'Aeration'
  
      case 'water-retention':
        return 'Water Retention'
  
      case 'amendments':
        return 'Amendments'
  
      case 'fertiliser':
        return 'Fertiliser'
  
      case 'biological-additives':
        return 'Biological Additives'
  
      case 'ph-adjusters':
        return 'pH Adjusters'
  
      case 'structure-bulk':
        return 'Structure / Bulk'
  
      case 'growing-medium':
        return 'Growing Medium'
  
      case 'mulch':
        return 'Mulch'
  
      case 'other':
        return 'Other'
  
      default:
        return 'Garden Ingredient'
    }
  }
  
  
  /* =======================================
     INGREDIENT VISUAL GROUP
  ======================================= */
  
  function getIngredientGroup(
    ingredient: Ingredient,
  ): string {
    switch (
      ingredient.category
    ) {
      case 'compost':
      case 'organic-matter':
        return 'Ingredients · Compost & Organic Matter'
  
      case 'manure':
        return 'Ingredients · Manures'
  
      case 'aeration':
      case 'structure-bulk':
        return 'Ingredients · Structure & Aeration'
  
      case 'water-retention':
        return 'Ingredients · Water & Moisture'
  
      case 'minerals':
      case 'amendments':
      case 'ph-adjusters':
        return 'Ingredients · Minerals & Amendments'
  
      case 'fertiliser':
      case 'biological-additives':
        return 'Ingredients · Fertilisers & Biology'
  
      case 'growing-medium':
        return 'Ingredients · Growing Media'
  
      case 'mulch':
        return 'Ingredients · Mulches'
  
      case 'other':
        return 'Ingredients · Other'
  
      default:
        return 'Ingredients · Other'
    }
  }
  
  
  /* =======================================
     PRODUCT CATEGORY LABEL
  ======================================= */
  
  function getProductCategoryLabel(
    product: GardenProduct,
  ): string {
    if (
      product.customCategoryLabel
        ?.trim()
    ) {
      return product
        .customCategoryLabel
        .trim()
    }
  
  
    switch (
      product.category
    ) {
      case 'fertiliser':
        return 'Fertiliser'
  
      case 'soil-conditioner':
        return 'Soil Conditioner'
  
      case 'wetting-agent':
        return 'Wetting Agent'
  
      case 'pest-treatment':
        return 'Pest Treatment'
  
      case 'disease-treatment':
        return 'Disease Treatment'
  
      case 'weed-treatment':
        return 'Weed Treatment'
  
      case 'biological-treatment':
        return 'Biological Treatment'
  
      case 'root-treatment':
        return 'Root Treatment'
  
      case 'plant-tonic':
        return 'Plant Tonic'
  
      case 'growing-medium':
        return 'Growing Medium'
  
      case 'mulch':
        return 'Mulch'
  
      case 'seed-treatment':
        return 'Seed Treatment'
  
      case 'cleaning-product':
        return 'Cleaning Product'
  
      case 'other':
        return 'Other'
  
      default:
        return 'Bought Product'
    }
  }
  
  
  /* =======================================
     PRODUCT VISUAL GROUP
  ======================================= */
  
  function getProductGroup(
    product: GardenProduct,
  ): string {
    switch (
      product.category
    ) {
      case 'fertiliser':
      case 'plant-tonic':
      case 'root-treatment':
        return 'Products · Fertilisers & Plant Food'
  
      case 'growing-medium':
        return 'Products · Growing Media & Soil'
  
      case 'soil-conditioner':
      case 'wetting-agent':
        return 'Products · Soil Care & Conditioning'
  
      case 'mulch':
        return 'Products · Mulches'
  
      case 'pest-treatment':
      case 'disease-treatment':
      case 'weed-treatment':
      case 'biological-treatment':
      case 'seed-treatment':
        return 'Products · Pest, Disease & Treatments'
  
      case 'cleaning-product':
        return 'Products · Cleaning & Maintenance'
  
      case 'other':
        return 'Products · Other'
  
      default:
        return 'Products · Other'
    }
  }
  
  
  /* =======================================
     GROWING RECIPE LABEL
  ======================================= */
  
  function getGrowingSetupLabel(
    setup: GrowingSetup,
  ): string {
    switch (
      setup.category
    ) {
      case 'own-mix':
        return 'Saved Growing Recipe'
  
      case 'bought-mix':
        return 'Bought Mix'
  
      case 'ground-type':
        return 'Native Ground'
  
      case 'growing-system':
        return 'Growing System'
  
      default:
        return 'Growing Recipe'
    }
  }
  
  
  /* =======================================
     GROWING RECIPE GROUP
  ======================================= */
  
  function getGrowingSetupGroup(
    setup: GrowingSetup,
  ): string {
    switch (
      setup.category
    ) {
      case 'bought-mix':
        return 'Growing Recipes · Bought Mixes'
  
      case 'own-mix':
        return 'Growing Recipes · My Recipes'
  
      case 'ground-type':
        return 'Growing Recipes · Native Ground'
  
      case 'growing-system':
        return 'Growing Recipes · Growing Systems'
  
      default:
        return 'Growing Recipes · Other'
    }
  }
  
  
  /* =======================================
     PRODUCT ID
  ======================================= */
  
  function createProductId(
    name: string,
  ): string {
    const safeName =
      name
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
  
    return `product-${
      safeName ||
      'product'
    }-${Date.now()}`
  }
  
  
  /* =======================================
     PICKER GROUP ORDER
  ======================================= */
  
  const componentGroupOrder = [
    'Ingredients · Compost & Organic Matter',
    'Ingredients · Manures',
    'Ingredients · Structure & Aeration',
    'Ingredients · Water & Moisture',
    'Ingredients · Minerals & Amendments',
    'Ingredients · Fertilisers & Biology',
    'Ingredients · Growing Media',
    'Ingredients · Mulches',
    'Ingredients · Other',
  
    'Products · Growing Media & Soil',
    'Products · Fertilisers & Plant Food',
    'Products · Soil Care & Conditioning',
    'Products · Mulches',
    'Products · Pest, Disease & Treatments',
    'Products · Cleaning & Maintenance',
    'Products · Other',
  
    'Growing Recipes · Bought Mixes',
    'Growing Recipes · My Recipes',
    'Growing Recipes · Native Ground',
    'Growing Recipes · Growing Systems',
    'Growing Recipes · Other',
  ]
  
  
  /* =======================================
     RECIPE QUANTITY UNITS
  ======================================= */
  
  const recipeComponentUnitOptions: {
    value: RecipeComponentUnit
    label: string
  }[] = [
    {
      value: 'part',
      label: 'Parts',
    },
    {
      value: 'litre',
      label: 'Litres',
    },
    {
      value: 'millilitre',
      label: 'Millilitres',
    },
    {
      value: 'kilogram',
      label: 'Kilograms',
    },
    {
      value: 'gram',
      label: 'Grams',
    },
    {
      value: 'handful',
      label: 'Handfuls',
    },
    {
      value: 'scoop',
      label: 'Scoops',
    },
    {
      value: 'other',
      label: 'Something else',
    },
  ]
  
  
  /* =======================================
     PRODUCT CATEGORY OPTIONS
  ======================================= */
  
  const productCategoryOptions: {
    value:
      GardenProduct['category']
  
    label:
      string
  }[] = [
    {
      value:
        'fertiliser',
  
      label:
        'Fertiliser',
    },
  
    {
      value:
        'plant-tonic',
  
      label:
        'Plant Tonic',
    },
  
    {
      value:
        'root-treatment',
  
      label:
        'Root Treatment',
    },
  
    {
      value:
        'growing-medium',
  
      label:
        'Growing Medium / Soil / Potting Mix',
    },
  
    {
      value:
        'soil-conditioner',
  
      label:
        'Soil Conditioner',
    },
  
    {
      value:
        'wetting-agent',
  
      label:
        'Wetting Agent',
    },
  
    {
      value:
        'mulch',
  
      label:
        'Mulch',
    },
  
    {
      value:
        'pest-treatment',
  
      label:
        'Pest Treatment',
    },
  
    {
      value:
        'disease-treatment',
  
      label:
        'Disease Treatment',
    },
  
    {
      value:
        'weed-treatment',
  
      label:
        'Weed Treatment',
    },
  
    {
      value:
        'biological-treatment',
  
      label:
        'Biological Treatment',
    },
  
    {
      value:
        'seed-treatment',
  
      label:
        'Seed Treatment',
    },
  
    {
      value:
        'cleaning-product',
  
      label:
        'Cleaning Product',
    },
  
    {
      value:
        'other',
  
      label:
        'Other',
    },
  ]
  
  
  /* =======================================
     RECIPE COMPONENTS
  ======================================= */
  
  export default function RecipeComponentsSection({
    ingredients,
    products,
    growingSetups,
    currentRecipeId,
    selectedIngredientIds,
    setSelectedIngredientIds,
    recipeComponents,
    setRecipeComponents,
    onCreateIngredient,
    onAddProduct,
  }: RecipeComponentsSectionProps) {
  
    /* =======================================
       UNIFIED COMPONENT PICKER
    ======================================= */
  
    const [
      isComponentPickerOpen,
      setIsComponentPickerOpen,
    ] =
      useState(
        false,
      )
  
  
    /* =======================================
       UNIVERSAL QUICK ADD
    ======================================= */
  
    const [
      isQuickAddOpen,
      setIsQuickAddOpen,
    ] =
      useState(
        false,
      )
  
  
    const [
      quickAddType,
      setQuickAddType,
    ] =
      useState<QuickAddType>(
        null,
      )
  
  
    const [
      quickIngredientName,
      setQuickIngredientName,
    ] =
      useState(
        '',
      )
  
  
    const [
      quickProductName,
      setQuickProductName,
    ] =
      useState(
        '',
      )
  
  
    const [
      quickProductBrand,
      setQuickProductBrand,
    ] =
      useState(
        '',
      )
  
  
    const [
      quickProductCategory,
      setQuickProductCategory,
    ] =
      useState<
        GardenProduct['category']
      >(
        'growing-medium',
      )
  
  
    const [
      quickProductPhotoUrls,
      setQuickProductPhotoUrls,
    ] =
      useState<string[]>(
        [],
      )
  
  
    /* =======================================
       CURRENT COMPONENTS
    ======================================= */
  
    const components =
      recipeComponents ??
      []
  
  
    /*
     * Some older Growing Recipes may still
     * have Ingredient links only in the legacy
     * ingredientIds array.
     *
     * Treat those as selected here even before
     * recipeComponents has been modernised.
     */
  
    const selectedIngredientComponentIds =
      Array.from(
        new Set([
          ...selectedIngredientIds,
  
          ...components
            .filter(
              (
                component,
              ) =>
                component.sourceType ===
                'ingredient',
            )
            .map(
              (
                component,
              ) =>
                component.sourceId,
            ),
        ]),
      )
  
  
    const selectedProductIds =
      components
        .filter(
          (
            component,
          ) =>
            component.sourceType ===
            'product',
        )
        .map(
          (
            component,
          ) =>
            component.sourceId,
        )
  
  
    const selectedGrowingSetupIds =
      components
        .filter(
          (
            component,
          ) =>
            component.sourceType ===
            'growing-setup',
        )
        .map(
          (
            component,
          ) =>
            component.sourceId,
        )
  
  
    /* =======================================
       FIND RECIPE COMPONENT
    ======================================= */
  
    function findRecipeComponent(
      sourceType:
        ComponentSourceType,
      sourceId:
        string,
    ):
      | RecipeComponent
      | undefined {
  
      return components.find(
        (
          component,
        ) =>
          component.sourceType ===
            sourceType &&
          component.sourceId ===
            sourceId,
      )
    }
  
  
    /* =======================================
       UPDATE RECIPE COMPONENT DETAILS
    ======================================= */
  
    function updateRecipeComponentDetails(
      sourceType:
        ComponentSourceType,
      sourceId:
        string,
      updates:
        Partial<
          Pick<
            RecipeComponent,
            | 'quantity'
            | 'unit'
            | 'customUnitLabel'
          >
        >,
    ) {
      setRecipeComponents(
        (
          currentComponents,
        ) => {
          const current =
            currentComponents ??
            []
  
          const existingIndex =
            current.findIndex(
              (
                component,
              ) =>
                component.sourceType ===
                  sourceType &&
                component.sourceId ===
                  sourceId,
            )
  
  
          /*
           * Older Sprig gardens may have an
           * Ingredient selected only through
           * legacy ingredientIds.
           *
           * The first time quantity information
           * is added, quietly modernise that
           * relationship into recipeComponents.
           */
          if (
            existingIndex ===
            -1
          ) {
            return [
              ...current,
  
              {
                sourceType,
                sourceId,
                ...updates,
              },
            ]
          }
  
  
          return current.map(
            (
              component,
              index,
            ) =>
              index ===
                existingIndex
                ? {
                    ...component,
                    ...updates,
                  }
                : component,
          )
        },
      )
    }
  
  
    /* =======================================
       ADD INGREDIENT LINK
    ======================================= */
  
    function addIngredientLink(
      ingredientId: string,
    ) {
      setSelectedIngredientIds(
        (
          currentIds,
        ) =>
          currentIds.includes(
            ingredientId,
          )
            ? currentIds
            : [
                ...currentIds,
                ingredientId,
              ],
      )
  
  
      setRecipeComponents(
        (
          currentComponents,
        ) => {
          const current =
            currentComponents ??
            []
  
  
          const alreadyLinked =
            current.some(
              (
                component,
              ) =>
                component.sourceType ===
                  'ingredient' &&
                component.sourceId ===
                  ingredientId,
            )
  
  
          if (
            alreadyLinked
          ) {
            return current
          }
  
  
          return [
            ...current,
  
            {
              sourceType:
                'ingredient',
  
              sourceId:
                ingredientId,
            },
          ]
        },
      )
    }
  
  
    /* =======================================
       REMOVE INGREDIENT LINK
    ======================================= */
  
    function removeIngredientLink(
      ingredientId: string,
    ) {
      setSelectedIngredientIds(
        (
          currentIds,
        ) =>
          currentIds.filter(
            (
              id,
            ) =>
              id !==
              ingredientId,
          ),
      )
  
  
      setRecipeComponents(
        (
          currentComponents,
        ) =>
          (
            currentComponents ??
            []
          ).filter(
            (
              component,
            ) =>
              !(
                component.sourceType ===
                  'ingredient' &&
                component.sourceId ===
                  ingredientId
              ),
          ),
      )
    }
  
  
    /* =======================================
       ADD PRODUCT LINK
    ======================================= */
  
    function addProductLink(
      productId: string,
    ) {
      setRecipeComponents(
        (
          currentComponents,
        ) => {
          const current =
            currentComponents ??
            []
  
  
          const alreadyLinked =
            current.some(
              (
                component,
              ) =>
                component.sourceType ===
                  'product' &&
                component.sourceId ===
                  productId,
            )
  
  
          if (
            alreadyLinked
          ) {
            return current
          }
  
  
          return [
            ...current,
  
            {
              sourceType:
                'product',
  
              sourceId:
                productId,
            },
          ]
        },
      )
    }
  
  
    /* =======================================
       REMOVE PRODUCT LINK
    ======================================= */
  
    function removeProductLink(
      productId: string,
    ) {
      setRecipeComponents(
        (
          currentComponents,
        ) =>
          (
            currentComponents ??
            []
          ).filter(
            (
              component,
            ) =>
              !(
                component.sourceType ===
                  'product' &&
                component.sourceId ===
                  productId
              ),
          ),
      )
    }
  
  
    /* =======================================
       ADD GROWING RECIPE LINK
    ======================================= */
  
    function addGrowingSetupLink(
      growingSetupId: string,
    ) {
      /*
       * A Growing Recipe can reuse another
       * Growing Recipe, but never itself.
       */
  
      if (
        currentRecipeId &&
        growingSetupId ===
          currentRecipeId
      ) {
        return
      }
  
  
      setRecipeComponents(
        (
          currentComponents,
        ) => {
          const current =
            currentComponents ??
            []
  
  
          const alreadyLinked =
            current.some(
              (
                component,
              ) =>
                component.sourceType ===
                  'growing-setup' &&
                component.sourceId ===
                  growingSetupId,
            )
  
  
          if (
            alreadyLinked
          ) {
            return current
          }
  
  
          return [
            ...current,
  
            {
              sourceType:
                'growing-setup',
  
              sourceId:
                growingSetupId,
            },
          ]
        },
      )
    }
  
  
    /* =======================================
       REMOVE GROWING RECIPE LINK
    ======================================= */
  
    function removeGrowingSetupLink(
      growingSetupId: string,
    ) {
      setRecipeComponents(
        (
          currentComponents,
        ) =>
          (
            currentComponents ??
            []
          ).filter(
            (
              component,
            ) =>
              !(
                component.sourceType ===
                  'growing-setup' &&
                component.sourceId ===
                  growingSetupId
              ),
          ),
      )
    }
  
  
    /* =======================================
       TOGGLE UNIFIED COMPONENT
    ======================================= */
  
    function toggleComponent(
      pickerValue: string,
    ) {
      const parsed =
        readComponentPickerValue(
          pickerValue,
        )
  
  
      if (!parsed) {
        return
      }
  
  
      if (
        parsed.sourceType ===
        'ingredient'
      ) {
        const isSelected =
          selectedIngredientComponentIds.includes(
            parsed.sourceId,
          )
  
  
        if (
          isSelected
        ) {
          removeIngredientLink(
            parsed.sourceId,
          )
  
          return
        }
  
  
        addIngredientLink(
          parsed.sourceId,
        )
  
        return
      }
  
  
      if (
        parsed.sourceType ===
        'product'
      ) {
        const isSelected =
          selectedProductIds.includes(
            parsed.sourceId,
          )
  
  
        if (
          isSelected
        ) {
          removeProductLink(
            parsed.sourceId,
          )
  
          return
        }
  
  
        addProductLink(
          parsed.sourceId,
        )
  
        return
      }
  
  
      const isSelected =
        selectedGrowingSetupIds.includes(
          parsed.sourceId,
        )
  
  
      if (
        isSelected
      ) {
        removeGrowingSetupLink(
          parsed.sourceId,
        )
  
        return
      }
  
  
      addGrowingSetupLink(
        parsed.sourceId,
      )
    }
  
  
    /* =======================================
       RESET QUICK ADD
    ======================================= */
  
    function resetQuickAdd() {
      setQuickAddType(
        null,
      )
  
      setQuickIngredientName(
        '',
      )
  
      setQuickProductName(
        '',
      )
  
      setQuickProductBrand(
        '',
      )
  
      setQuickProductCategory(
        'growing-medium',
      )
  
      setQuickProductPhotoUrls(
        [],
      )
    }
  
  
    function closeQuickAdd() {
      resetQuickAdd()
  
      setIsQuickAddOpen(
        false,
      )
    }
  
  
    /* =======================================
       SAVE QUICK INGREDIENT
    ======================================= */
  
    function saveQuickIngredient() {
      const trimmedName =
        quickIngredientName.trim()
  
  
      if (
        !trimmedName
      ) {
        return
      }
  
  
      const ingredientId =
        onCreateIngredient(
          trimmedName,
        )
  
  
      if (
        !ingredientId
      ) {
        return
      }
  
  
      addIngredientLink(
        ingredientId,
      )
  
  
      closeQuickAdd()
    }
  
  
    /* =======================================
       SAVE QUICK PRODUCT
    ======================================= */
  
    function saveQuickProduct() {
      const trimmedName =
        quickProductName.trim()
  
      const trimmedBrand =
        quickProductBrand.trim()
  
  
      if (
        !trimmedName
      ) {
        return
      }
  
  
      const existingProduct =
        products.find(
          (
            product,
          ) =>
            product.name
              .trim()
              .toLowerCase() ===
              trimmedName
                .toLowerCase() &&
            (
              product.brand ??
              ''
            )
              .trim()
              .toLowerCase() ===
              trimmedBrand
                .toLowerCase(),
        )
  
  
      if (
        existingProduct
      ) {
        addProductLink(
          existingProduct.id,
        )
  
        closeQuickAdd()
  
        return
      }
  
  
      const newProduct:
        GardenProduct = {
          id:
            createProductId(
              trimmedName,
            ),
  
          name:
            trimmedName,
  
          category:
            quickProductCategory,
  
          brand:
            trimmedBrand ||
            undefined,
  
          productName:
            trimmedName,
  
          photoUrls:
            quickProductPhotoUrls,
  
          createdAt:
            new Date()
              .toISOString(),
        }
  
  
      onAddProduct(
        newProduct,
      )
  
  
      addProductLink(
        newProduct.id,
      )
  
  
      closeQuickAdd()
    }
  
  
    /* =======================================
       UNIFIED PICKER OPTIONS
    ======================================= */
  
    const ingredientOptions =
      ingredients
        .filter(
          (
            ingredient,
          ) =>
            !ingredient.isArchived,
        )
        .map(
          (
            ingredient,
          ) => ({
            value:
              createComponentPickerValue(
                'ingredient',
                ingredient.id,
              ),
  
            label:
              ingredient.name,
  
            subtitle:
              `Ingredient · ${getIngredientCategoryLabel(
                ingredient,
              )}`,
  
            meta:
              ingredient.manufacturer ||
              ingredient.source ||
              undefined,
  
            group:
              getIngredientGroup(
                ingredient,
              ),
          }),
        )
  
  
    const productOptions =
      products
        .filter(
          (
            product,
          ) =>
            !product.isArchived,
        )
        .map(
          (
            product,
          ) => ({
            value:
              createComponentPickerValue(
                'product',
                product.id,
              ),
  
            label:
              product.name,
  
            subtitle:
              `Bought Product · ${getProductCategoryLabel(
                product,
              )}`,
  
            meta:
              product.brand ||
              undefined,
  
            group:
              getProductGroup(
                product,
              ),
          }),
        )
  
  
    const growingSetupOptions =
      growingSetups
        .filter(
          (
            setup,
          ) =>
            !setup.isArchived &&
            setup.id !==
              currentRecipeId,
        )
        .map(
          (
            setup,
          ) => ({
            value:
              createComponentPickerValue(
                'growing-setup',
                setup.id,
              ),
  
            label:
              setup.name,
  
            subtitle:
              getGrowingSetupLabel(
                setup,
              ),
  
            meta:
              setup.brand ||
              setup.productName ||
              undefined,
  
            group:
              getGrowingSetupGroup(
                setup,
              ),
          }),
        )
  
  
    const componentOptions = [
      ...ingredientOptions,
      ...productOptions,
      ...growingSetupOptions,
    ]
  
  
    /* =======================================
       SELECTED PICKER VALUES
    ======================================= */
  
    const selectedComponentValues = [
      ...selectedIngredientComponentIds.map(
        (
          ingredientId,
        ) =>
          createComponentPickerValue(
            'ingredient',
            ingredientId,
          ),
      ),
  
      ...selectedProductIds.map(
        (
          productId,
        ) =>
          createComponentPickerValue(
            'product',
            productId,
          ),
      ),
  
      ...selectedGrowingSetupIds.map(
        (
          growingSetupId,
        ) =>
          createComponentPickerValue(
            'growing-setup',
            growingSetupId,
          ),
      ),
    ]
  
  
    /* =======================================
       SELECTED COMPONENT DETAILS
    ======================================= */
  
    const selectedComponentDetails = [
      ...selectedIngredientComponentIds.map(
        (
          ingredientId,
        ) => {
          const ingredient =
            ingredients.find(
              (
                item,
              ) =>
                item.id ===
                ingredientId,
            )
  
          return {
            sourceType:
              'ingredient' as const,
  
            sourceId:
              ingredientId,
  
            name:
              ingredient?.name ??
              'Garden ingredient',
  
            kind:
              'Ingredient',
          }
        },
      ),
  
      ...selectedProductIds.map(
        (
          productId,
        ) => {
          const product =
            products.find(
              (
                item,
              ) =>
                item.id ===
                productId,
            )
  
          return {
            sourceType:
              'product' as const,
  
            sourceId:
              productId,
  
            name:
              product?.name ??
              'Bought product',
  
            kind:
              'Bought Product',
          }
        },
      ),
  
      ...selectedGrowingSetupIds.map(
        (
          growingSetupId,
        ) => {
          const setup =
            growingSetups.find(
              (
                item,
              ) =>
                item.id ===
                growingSetupId,
            )
  
          return {
            sourceType:
              'growing-setup' as const,
  
            sourceId:
              growingSetupId,
  
            name:
              setup?.name ??
              'Growing Recipe',
  
            kind:
              setup
                ? getGrowingSetupLabel(
                    setup,
                  )
                : 'Growing Recipe',
          }
        },
      ),
    ]
  
  
    /* =======================================
       SUMMARY
    ======================================= */
  
    const selectedComponentCount =
      selectedComponentValues.length
  
  
    const componentSummary =
      selectedComponentCount ===
        0
        ? 'Choose from Ingredients, Products and saved Growing Recipes'
        : selectedComponentCount ===
            1
          ? '1 component selected'
          : `${selectedComponentCount} components selected`
  
  
    return (
      <section className="sprig-form-section">
  
        <p className="section-label">
          What went into this Growing Recipe?
        </p>
  
  
        <h3>
          Recipe components
        </h3>
  
  
        <p className="form-whisper">
          Choose anything that forms part
          of this setup. Sprig keeps each
          item connected to its original
          record, whether it is something
          from your garden, a bought
          product or another saved mix.
        </p>
  
  
        {/* =======================================
            UNIFIED COMPONENT PICKER
        ======================================= */}
  
        <SprigPicker
          title="Add from Sprig"
          variant="label-tall"
  
          emptySummary={
            componentSummary
          }
  
          options={
            componentOptions
          }
  
          selectedValues={
            selectedComponentValues
          }
  
          isOpen={
            isComponentPickerOpen
          }
  
          showTrigger={
            true
          }
  
          groupOptions={
            true
          }
  
          groupOrder={
            componentGroupOrder
          }
  
          onToggleOpen={() =>
            setIsComponentPickerOpen(
              (
                current,
              ) =>
                !current,
            )
          }
  
          onToggleValue={
            toggleComponent
          }
        />
  
  
        {/* =======================================
            COMPONENT QUANTITIES
        ======================================= */}
  
        {selectedComponentDetails.length >
          0 && (
          <div className="sprig-picker-custom">
  
            <p className="section-label">
              How much went in?
            </p>
  
  
            <p className="form-whisper">
              Optional. Leave these blank
              when the ingredients matter
              more than exact measurements.
              You can use proportions such
              as 2 parts potting mix and
              1 part compost, or record
              actual amounts.
            </p>
  
  
            {selectedComponentDetails.map(
              (
                selectedComponent,
              ) => {
                const recipeComponent =
                  findRecipeComponent(
                    selectedComponent.sourceType,
                    selectedComponent.sourceId,
                  )
  
  
                const quantityValue =
                  recipeComponent
                    ?.quantity ??
                  ''
  
  
                const unitValue =
                  recipeComponent
                    ?.unit ??
                  ''
  
  
                return (
                  <div
                    key={
                      createComponentPickerValue(
                        selectedComponent.sourceType,
                        selectedComponent.sourceId,
                      )
                    }
                    className="sprig-picker-custom-entry"
                  >
                    <p className="section-label">
                      {
                        selectedComponent.name
                      }
                    </p>
  
  
                    <p className="form-whisper">
                      {
                        selectedComponent.kind
                      }
                    </p>
  
  
                    <label className="sprig-picker-custom-label">
                      Amount
  
                      <input
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={
                          quantityValue
                        }
                        placeholder="Optional"
                        onChange={(
                          event,
                        ) => {
                          const rawValue =
                            event.target
                              .value
  
  
                          if (
                            rawValue ===
                            ''
                          ) {
                            updateRecipeComponentDetails(
                              selectedComponent.sourceType,
                              selectedComponent.sourceId,
                              {
                                quantity:
                                  undefined,
                              },
                            )
  
                            return
                          }
  
  
                          const numericValue =
                            Number(
                              rawValue,
                            )
  
  
                          if (
                            !Number.isFinite(
                              numericValue,
                            )
                          ) {
                            return
                          }
  
  
                          updateRecipeComponentDetails(
                            selectedComponent.sourceType,
                            selectedComponent.sourceId,
                            {
                              quantity:
                                numericValue,
                            },
                          )
                        }}
                      />
                    </label>
  
  
                    <label className="sprig-picker-custom-label">
                      Measure
  
                      <select
                        value={
                          unitValue
                        }
                        onChange={(
                          event,
                        ) => {
                          const nextValue =
                            event.target
                              .value
  
  
                          if (
                            nextValue ===
                            ''
                          ) {
                            updateRecipeComponentDetails(
                              selectedComponent.sourceType,
                              selectedComponent.sourceId,
                              {
                                unit:
                                  undefined,
  
                                customUnitLabel:
                                  undefined,
                              },
                            )
  
                            return
                          }
  
  
                          const nextUnit =
                            nextValue as
                              RecipeComponentUnit
  
  
                          updateRecipeComponentDetails(
                            selectedComponent.sourceType,
                            selectedComponent.sourceId,
                            {
                              unit:
                                nextUnit,
  
                              customUnitLabel:
                                nextUnit ===
                                  'other'
                                  ? recipeComponent
                                      ?.customUnitLabel
                                  : undefined,
                            },
                          )
                        }}
                      >
                        <option value="">
                          Optional
                        </option>
  
                        {recipeComponentUnitOptions.map(
                          (
                            option,
                          ) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </label>
  
  
                    {unitValue ===
                      'other' && (
                      <label className="sprig-picker-custom-label">
                        What do you call this measure?
  
                        <input
                          type="text"
                          value={
                            recipeComponent
                              ?.customUnitLabel ??
                            ''
                          }
                          placeholder="Bucket, cup, shovel..."
                          onChange={(
                            event,
                          ) =>
                            updateRecipeComponentDetails(
                              selectedComponent.sourceType,
                              selectedComponent.sourceId,
                              {
                                customUnitLabel:
                                  event.target
                                    .value ||
                                  undefined,
                              },
                            )
                          }
                        />
                      </label>
                    )}
                  </div>
                )
              },
            )}
          </div>
        )}
  
  
        {/* =======================================
            QUICK ADD
        ======================================= */}
  
        <div className="sprig-picker-custom">
  
          {!isQuickAddOpen ? (
  
            <button
              type="button"
              className="sprig-picker-custom-trigger"
              onClick={() =>
                setIsQuickAddOpen(
                  true,
                )
              }
            >
              ＋ Add something new...
            </button>
  
          ) : (
  
            <div className="sprig-picker-custom-entry">
  
              {!quickAddType && (
                <>
  
                  <p className="form-whisper">
                    Can&apos;t find it in Sprig
                    yet? Add the real record now,
                    connect it to this recipe,
                    and fill in any finer details
                    later.
                  </p>
  
  
                  <div className="sprig-picker-custom-actions">
  
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        setQuickAddType(
                          'ingredient',
                        )
                      }
                    >
                      Garden ingredient
                    </button>
  
  
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        setQuickAddType(
                          'product',
                        )
                      }
                    >
                      Bought product
                    </button>
  
  
                    <button
                      type="button"
                      className="sprig-picker-custom-cancel"
                      onClick={
                        closeQuickAdd
                      }
                    >
                      Cancel
                    </button>
  
                  </div>
  
  
                  <p className="form-whisper">
                    Bought potting mixes that
                    already exist as Growing
                    Recipes can be chosen from
                    the picker above under
                    Bought Mixes.
                  </p>
  
                </>
              )}
  
  
              {/* ===================================
                  QUICK INGREDIENT
              =================================== */}
  
              {quickAddType ===
                'ingredient' && (
                <>
  
                  <label className="sprig-picker-custom-label">
                    What is the ingredient called?
  
                    <input
                      type="text"
                      value={
                        quickIngredientName
                      }
                      onChange={(
                        event,
                      ) =>
                        setQuickIngredientName(
                          event.target.value,
                        )
                      }
                      placeholder="Homemade compost, Perlite, Guinea Pig Manure..."
                      autoFocus
                    />
                  </label>
  
  
                  <p className="form-whisper">
                    Use this for something that
                    is genuinely a garden
                    ingredient, such as homemade
                    compost, manure, perlite or
                    another material rather than
                    a commercial product.
                  </p>
  
  
                  <div className="sprig-picker-custom-actions">
  
                    <button
                      type="button"
                      className="sprig-picker-custom-cancel"
                      onClick={() =>
                        setQuickAddType(
                          null,
                        )
                      }
                    >
                      Back
                    </button>
  
  
                    <button
                      type="button"
                      className="sprig-picker-custom-save"
                      onClick={
                        saveQuickIngredient
                      }
                      disabled={
                        !quickIngredientName
                          .trim()
                      }
                    >
                      Add ingredient
                    </button>
  
                  </div>
  
                </>
              )}
  
  
              {/* ===================================
                  QUICK BOUGHT PRODUCT
              =================================== */}
  
              {quickAddType ===
                'product' && (
                <>
  
                  <label className="sprig-picker-custom-label">
                    Product name
  
                    <input
                      type="text"
                      value={
                        quickProductName
                      }
                      onChange={(
                        event,
                      ) =>
                        setQuickProductName(
                          event.target.value,
                        )
                      }
                      placeholder="PowerFeed, Blood & Bone, Premium Potting Mix..."
                      autoFocus
                    />
                  </label>
  
  
                  <label className="sprig-picker-custom-label">
                    Brand
  
                    <span className="form-whisper">
                      {' '}Optional
                    </span>
  
                    <input
                      type="text"
                      value={
                        quickProductBrand
                      }
                      onChange={(
                        event,
                      ) =>
                        setQuickProductBrand(
                          event.target.value,
                        )
                      }
                      placeholder="Seasol, Brunnings..."
                    />
                  </label>
  
  
                  <label className="sprig-picker-custom-label">
                    What sort of product is it?
  
                    <select
                      value={
                        quickProductCategory
                      }
                      onChange={(
                        event,
                      ) =>
                        setQuickProductCategory(
                          event.target.value as
                            GardenProduct['category'],
                        )
                      }
                    >
                      {productCategoryOptions.map(
                        (
                          option,
                        ) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </label>
  
  
                  <SprigPhotoPicker
                    photoUrls={
                      quickProductPhotoUrls
                    }
                    onChange={
                      setQuickProductPhotoUrls
                    }
                    title="Photograph"
                    helperText="If the packet, bag or bottle is beside you, capture it now. You can add or change photographs later."
                    addButtonText="Add a photograph"
                    photoAltPrefix="Quick product photograph"
                    maxPhotos={
                      3
                    }
                  />
  
  
                  <p className="form-whisper">
                    This creates a normal Product
                    record in Sprig and links that
                    same record to this Growing
                    Recipe. It is not a temporary
                    recipe-only item.
                  </p>
  
  
                  <div className="sprig-picker-custom-actions">
  
                    <button
                      type="button"
                      className="sprig-picker-custom-cancel"
                      onClick={() =>
                        setQuickAddType(
                          null,
                        )
                      }
                    >
                      Back
                    </button>
  
  
                    <button
                      type="button"
                      className="sprig-picker-custom-save"
                      onClick={
                        saveQuickProduct
                      }
                      disabled={
                        !quickProductName
                          .trim()
                      }
                    >
                      Add product
                    </button>
  
                  </div>
  
                </>
              )}
  
            </div>
          )}
  
        </div>
  
  
        {/* =======================================
            COMPONENT EXPLANATION
        ======================================= */}
  
        <p className="form-whisper">
          Garden ingredients, commercial
          products and reusable Growing
          Recipes stay as their own permanent
          Sprig records. This recipe simply
          remembers that they belong here too.
        </p>
  
      </section>
    )
  }