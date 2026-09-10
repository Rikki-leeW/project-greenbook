import {
  useMemo,
  useState,
} from 'react';

import type {
  CSSProperties,
} from 'react';

import GardenLayout from '../components/layout/GardenLayout';

import type {
  GardenProduct,
  GrowingPlace,
  GrowingSetup,
  Ingredient,
} from '../types';

import type {
  AppPage,
} from '../types/navigation';


export type GrowingSection =
  | 'places'
  | 'setups'
  | 'ingredients'
  | 'products';


export type GrowingSetupSection =
  | 'overview'
  | 'own-mix'
  | 'bought-mix'
  | 'growing-system'
  | 'ground-type';


type LibraryDestination =
  | 'library'
  | 'growing-recipes'
  | 'growing-own-mix'
  | 'growing-bought-mix'
  | 'growing-system'
  | 'growing-ground-type'
  | 'ingredients'
  | 'products';


type GrowingSort =
  | 'name-az'
  | 'name-za'
  | 'kind-az';


interface GrowingPlacesProps {
  gardenPlaces:
    GrowingPlace[];

  growingSetups:
    GrowingSetup[];

  ingredients:
    Ingredient[];

  products:
    GardenProduct[];

  section:
    GrowingSection;

  setupSection:
    GrowingSetupSection;

  onSectionChange: (
    section:
      GrowingSection,
  ) => void;

  onSetupSectionChange: (
    section:
      GrowingSetupSection,
  ) => void;

  journeyBackLabel?:
    string | null;

  onJourneyBack?:
    () => void;

  onAddPlace:
    () => void;

  onAddSetup:
    () => void;

  onAddIngredient?:
    () => void;

  onAddProduct?:
    () => void;

  onOpenPlace: (
    growingPlaceId:
      string,
  ) => void;

  onOpenSetup: (
    growingSetupId:
      string,
  ) => void;

  onOpenIngredient: (
    ingredientId:
      string,
  ) => void;

  onOpenProduct: (
    productId:
      string,
  ) => void;

  onOpenLibrary?: (
    destination:
      LibraryDestination,
  ) => void;

  onNavigate: (
    page:
      AppPage,

    libraryView?:
      LibraryDestination,
  ) => void;
}


interface GrowingSectionDefinition {
  id:
    GrowingSection;

  label:
    string;

  eyebrow:
    string;

  description:
    string;
}


interface GrowingSetupDefinition {
  id:
    Exclude<
      GrowingSetupSection,
      'overview'
    >;

  label:
    string;

  description:
    string;
}


const GROWING_SECTIONS:
  GrowingSectionDefinition[] = [
    {
      id:
        'places',

      label:
        'Growing Places',

      eyebrow:
        'Where it grows',

      description:
        'The physical places around your garden.',
    },

    {
      id:
        'setups',

      label:
        'Growing Soils & Setups',

      eyebrow:
        'What it grows in',

      description:
        'Soils, homemade recipes, bought mixes, systems and ground conditions.',
    },

    {
      id:
        'ingredients',

      label:
        'Ingredients',

      eyebrow:
        'What it is made from',

      description:
        'Reusable materials that become part of soils, mixes and growing setups.',
    },

    {
      id:
        'products',

      label:
        'Products',

      eyebrow:
        'What was bought',

      description:
        'Commercial garden products and their history.',
    },
  ];


const GROWING_SETUP_SECTIONS:
  GrowingSetupDefinition[] = [
    {
      id:
        'own-mix',

      label:
        'My Recipes',

      description:
        'Growing mixes you make yourself.',
    },

    {
      id:
        'bought-mix',

      label:
        'Bought Mixes',

      description:
        'Commercial growing media bought ready to use.',
    },

    {
      id:
        'growing-system',

      label:
        'Growing Systems',

      description:
        'No-dig, wicking beds, hydroponics and other growing systems.',
    },

    {
      id:
        'ground-type',

      label:
        'Ground Types',

      description:
        'Native soil, clay, loam and other straight-in-ground conditions.',
    },
  ];


/* =======================================
   TEXT HELPERS
======================================= */

function normaliseSearchText(
  value:
    string | undefined,
): string {
  return (
    value ??
    ''
  )
    .trim()
    .toLocaleLowerCase();
}


function uniqueText(
  values:
    string[],
): string[] {
  return Array.from(
    new Set(
      values
        .map(
          value =>
            value.trim(),
        )
        .filter(
          Boolean,
        ),
    ),
  );
}


function formatLabel(
  value:
    string,
): string {
  return value
    .replaceAll(
      '-',
      ' ',
    )
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase(),
    );
}


/* =======================================
   GROWING PLACE LABEL
======================================= */

function getGrowingPlaceKindLabel(
  place:
    GrowingPlace,
): string {
  if (
    place.kind ===
      'other' &&
    place.customKindLabel
  ) {
    return (
      place.customKindLabel
    );
  }


  return formatLabel(
    place.kind,
  );
}


/* =======================================
   GROWING SETUP LABEL
======================================= */

function getGrowingSetupLabel(
  setup:
    GrowingSetup,
): string {
  switch (
    setup.category
  ) {
    case 'own-mix':
      return 'My Recipe';

    case 'bought-mix':
      return 'Bought Mix';

    case 'growing-system':
      return 'Growing System';

    case 'ground-type':
      return 'Ground Type';

    default:
      return 'Soil or Setup';
  }
}


/* =======================================
   INGREDIENT LABEL
======================================= */

function getIngredientSubtitle(
  ingredient:
    Ingredient,
): string {
  if (
    ingredient.category ===
      'other' &&
    ingredient
      .customCategoryLabel
  ) {
    return (
      ingredient
        .customCategoryLabel
    );
  }


  if (
    ingredient.category
  ) {
    return formatLabel(
      ingredient.category,
    );
  }


  return 'Ingredient';
}


/* =======================================
   PRODUCT LABEL
======================================= */

function getProductCategoryLabel(
  product:
    GardenProduct,
): string {
  if (
    product.category ===
      'other' &&
    product
      .customCategoryLabel
  ) {
    return (
      product
        .customCategoryLabel
    );
  }


  if (
    product.category
  ) {
    return formatLabel(
      product.category,
    );
  }


  return 'Garden Product';
}


function getProductSubtitle(
  product:
    GardenProduct,
): string {
  const category =
    getProductCategoryLabel(
      product,
    );


  if (
    product.brand
  ) {
    return `${product.brand} · ${category}`;
  }


  return category;
}


/* =======================================
   SETUP RELATIONSHIPS
======================================= */

function getSetupIngredientIds(
  setup:
    GrowingSetup,
): string[] {
  return uniqueText([
    ...(
      setup.ingredientIds ??
      []
    ),

    ...(
      setup.recipeComponents ??
      []
    )
      .filter(
        component =>
          component.sourceType ===
          'ingredient',
      )
      .map(
        component =>
          component.sourceId,
      ),
  ]);
}


function getSetupProductIds(
  setup:
    GrowingSetup,
): string[] {
  return uniqueText(
    (
      setup.recipeComponents ??
      []
    )
      .filter(
        component =>
          component.sourceType ===
          'product',
      )
      .map(
        component =>
          component.sourceId,
      ),
  );
}


function getSetupLinkedSetupIds(
  setup:
    GrowingSetup,
): string[] {
  return uniqueText(
    (
      setup.recipeComponents ??
      []
    )
      .filter(
        component =>
          component.sourceType ===
          'growing-setup',
      )
      .map(
        component =>
          component.sourceId,
      ),
  );
}


/* =======================================
   RECORD SEARCH TEXT
======================================= */

function getGrowingPlaceSearchText(
  place:
    GrowingPlace,
): string {
  return normaliseSearchText(
    [
      place.name,
      getGrowingPlaceKindLabel(
        place,
      ),
      place.kind,
      place.customKindLabel ??
        '',
      place.aspect ??
        '',
      place.sunlight ??
        '',
      place.shelter ??
        '',
      place.notes ??
        '',
    ].join(
      ' ',
    ),
  );
}


function getGrowingSetupSearchText(
  setup:
    GrowingSetup,

  growingSetups:
    GrowingSetup[],

  ingredients:
    Ingredient[],

  products:
    GardenProduct[],
): string {
  const ingredientWords =
    getSetupIngredientIds(
      setup,
    ).flatMap(
      ingredientId => {
        const ingredient =
          ingredients.find(
            item =>
              item.id ===
              ingredientId,
          );


        if (
          !ingredient
        ) {
          return [];
        }


        return [
          ingredient.name,
          getIngredientSubtitle(
            ingredient,
          ),
          ingredient.manufacturer ??
            '',
          ingredient.source ??
            '',
          ingredient.notes ??
            '',
        ];
      },
    );


  const productWords =
    getSetupProductIds(
      setup,
    ).flatMap(
      productId => {
        const product =
          products.find(
            item =>
              item.id ===
              productId,
          );


        if (
          !product
        ) {
          return [];
        }


        return [
          product.name,
          product.brand ??
            '',
          product.productName ??
            '',
          getProductCategoryLabel(
            product,
          ),
          product.notes ??
            '',
        ];
      },
    );


  const linkedSetupWords =
    getSetupLinkedSetupIds(
      setup,
    ).flatMap(
      setupId => {
        const linkedSetup =
          growingSetups.find(
            item =>
              item.id ===
              setupId,
          );


        if (
          !linkedSetup
        ) {
          return [];
        }


        return [
          linkedSetup.name,
          getGrowingSetupLabel(
            linkedSetup,
          ),
          linkedSetup.brand ??
            '',
          linkedSetup.productName ??
            '',
          linkedSetup.notes ??
            '',
        ];
      },
    );


  return normaliseSearchText(
    [
      setup.name,
      getGrowingSetupLabel(
        setup,
      ),
      setup.category,
      setup.brand ??
        '',
      setup.productName ??
        '',
      setup.groundType ??
        '',
      setup.growingSystemType ??
        '',
      setup.notes ??
        '',
      ...ingredientWords,
      ...productWords,
      ...linkedSetupWords,
    ].join(
      ' ',
    ),
  );
}


function getIngredientSearchText(
  ingredient:
    Ingredient,

  growingSetups:
    GrowingSetup[],
): string {
  const linkedSetupWords =
    growingSetups
      .filter(
        setup =>
          getSetupIngredientIds(
            setup,
          ).includes(
            ingredient.id,
          ),
      )
      .flatMap(
        setup => [
          setup.name,
          getGrowingSetupLabel(
            setup,
          ),
          setup.notes ??
            '',
        ],
      );


  return normaliseSearchText(
    [
      ingredient.name,
      getIngredientSubtitle(
        ingredient,
      ),
      ingredient.category ??
        '',
      ingredient.customCategoryLabel ??
        '',
      ingredient.manufacturer ??
        '',
      ingredient.source ??
        '',
      ingredient.notes ??
        '',
      ...linkedSetupWords,
    ].join(
      ' ',
    ),
  );
}


function getProductSearchText(
  product:
    GardenProduct,

  growingSetups:
    GrowingSetup[],
): string {
  const linkedSetupWords =
    growingSetups
      .filter(
        setup =>
          getSetupProductIds(
            setup,
          ).includes(
            product.id,
          ),
      )
      .flatMap(
        setup => [
          setup.name,
          getGrowingSetupLabel(
            setup,
          ),
          setup.notes ??
            '',
        ],
      );


  return normaliseSearchText(
    [
      product.name,
      product.brand ??
        '',
      product.productName ??
        '',
      getProductCategoryLabel(
        product,
      ),
      product.category ??
        '',
      product.customCategoryLabel ??
        '',
      product.notes ??
        '',
      ...linkedSetupWords,
    ].join(
      ' ',
    ),
  );
}


/* =======================================
   VERY SMALL ROW FALLBACKS

   The proper visual treatment now lives
   in growing.css. These are only structural
   safeguards for the clickable index rows.
======================================= */

const recordListStyle:
  CSSProperties = {
    width:
      '100%',
  };


const recordRowStyle:
  CSSProperties = {
    width:
      '100%',

    font:
      'inherit',

    color:
      'inherit',

    textAlign:
      'left',

    cursor:
      'pointer',
  };


const rowTextStyle:
  CSSProperties = {
    minWidth:
      0,
  };


const rowTitleStyle:
  CSSProperties = {
    display:
      'block',
  };


/* =======================================
   PAGE
======================================= */

export default function GrowingPlaces({
  gardenPlaces,
  growingSetups,
  ingredients,
  products,
  section,
  setupSection,
  onSectionChange,
  onSetupSectionChange,
  journeyBackLabel,
  onJourneyBack,
  onAddPlace,
  onAddSetup,
  onAddIngredient,
  onAddProduct,
  onOpenPlace,
  onOpenSetup,
  onOpenIngredient,
  onOpenProduct,
  onOpenLibrary,
  onNavigate,
}: GrowingPlacesProps) {

  /* =======================================
     SEARCH / SORT
  ======================================= */

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState(
      '',
    );


  const [
    sortBy,
    setSortBy,
  ] =
    useState<GrowingSort>(
      'name-az',
    );


  /* =======================================
     PLACE FILTERS
  ======================================= */

  const [
    selectedPlaceKinds,
    setSelectedPlaceKinds,
  ] =
    useState<string[]>(
      [],
    );


  /* =======================================
     SETUP FILTERS
  ======================================= */

  const [
    selectedSetupKinds,
    setSelectedSetupKinds,
  ] =
    useState<string[]>(
      setupSection ===
      'overview'
        ? []
        : [
            setupSection,
          ],
    );


  const [
    selectedSetupIngredients,
    setSelectedSetupIngredients,
  ] =
    useState<string[]>(
      [],
    );


  const [
    selectedSetupProducts,
    setSelectedSetupProducts,
  ] =
    useState<string[]>(
      [],
    );


  /* =======================================
     INGREDIENT FILTERS
  ======================================= */

  const [
    selectedIngredientCategories,
    setSelectedIngredientCategories,
  ] =
    useState<string[]>(
      [],
    );


  const [
    selectedIngredientManufacturers,
    setSelectedIngredientManufacturers,
  ] =
    useState<string[]>(
      [],
    );


  /* =======================================
     PRODUCT FILTERS
  ======================================= */

  const [
    selectedProductCategories,
    setSelectedProductCategories,
  ] =
    useState<string[]>(
      [],
    );


  const [
    selectedProductBrands,
    setSelectedProductBrands,
  ] =
    useState<string[]>(
      [],
    );


  /* =======================================
     ACTIVE RECORDS
  ======================================= */

  const activeSetups =
    useMemo(
      () =>
        growingSetups.filter(
          setup =>
            !setup.isArchived,
        ),
      [
        growingSetups,
      ],
    );


  const activeIngredients =
    useMemo(
      () =>
        ingredients.filter(
          ingredient =>
            !ingredient.isArchived,
        ),
      [
        ingredients,
      ],
    );


  const activeProducts =
    useMemo(
      () =>
        products.filter(
          product =>
            !product.isArchived,
        ),
      [
        products,
      ],
    );


  /* =======================================
     FILTER OPTIONS
  ======================================= */

  const placeKindOptions =
    useMemo(
      () =>
        uniqueText(
          gardenPlaces.map(
            place =>
              getGrowingPlaceKindLabel(
                place,
              ),
          ),
        ).sort(
          (
            first,
            second,
          ) =>
            first.localeCompare(
              second,
            ),
        ),
      [
        gardenPlaces,
      ],
    );


  const setupKindOptions =
    GROWING_SETUP_SECTIONS.map(
      item =>
        item.id,
    );


  const setupIngredientOptions =
    useMemo(
      () =>
        activeIngredients
          .filter(
            ingredient =>
              activeSetups.some(
                setup =>
                  getSetupIngredientIds(
                    setup,
                  ).includes(
                    ingredient.id,
                  ),
              ),
          )
          .map(
            ingredient =>
              ingredient.name,
          )
          .sort(
            (
              first,
              second,
            ) =>
              first.localeCompare(
                second,
              ),
          ),
      [
        activeIngredients,
        activeSetups,
      ],
    );


  const setupProductOptions =
    useMemo(
      () =>
        activeProducts
          .filter(
            product =>
              activeSetups.some(
                setup =>
                  getSetupProductIds(
                    setup,
                  ).includes(
                    product.id,
                  ),
              ),
          )
          .map(
            product =>
              product.name,
          )
          .sort(
            (
              first,
              second,
            ) =>
              first.localeCompare(
                second,
              ),
          ),
      [
        activeProducts,
        activeSetups,
      ],
    );


  const ingredientCategoryOptions =
    useMemo(
      () =>
        uniqueText(
          activeIngredients.map(
            ingredient =>
              getIngredientSubtitle(
                ingredient,
              ),
          ),
        ).sort(
          (
            first,
            second,
          ) =>
            first.localeCompare(
              second,
            ),
        ),
      [
        activeIngredients,
      ],
    );


  const ingredientManufacturerOptions =
    useMemo(
      () =>
        uniqueText(
          activeIngredients.map(
            ingredient =>
              ingredient.manufacturer ??
              '',
          ),
        ).sort(
          (
            first,
            second,
          ) =>
            first.localeCompare(
              second,
            ),
        ),
      [
        activeIngredients,
      ],
    );


  const productCategoryOptions =
    useMemo(
      () =>
        uniqueText(
          activeProducts.map(
            product =>
              getProductCategoryLabel(
                product,
              ),
          ),
        ).sort(
          (
            first,
            second,
          ) =>
            first.localeCompare(
              second,
            ),
        ),
      [
        activeProducts,
      ],
    );


  const productBrandOptions =
    useMemo(
      () =>
        uniqueText(
          activeProducts.map(
            product =>
              product.brand ??
              '',
          ),
        ).sort(
          (
            first,
            second,
          ) =>
            first.localeCompare(
              second,
            ),
        ),
      [
        activeProducts,
      ],
    );


  /* =======================================
     GENERIC FILTER TOGGLE
  ======================================= */

  function toggleFilter(
    value:
      string,

    selected:
      string[],

    setSelected: (
      values:
        string[],
    ) => void,
  ) {
    setSelected(
      selected.includes(
        value,
      )
        ? selected.filter(
            item =>
              item !==
              value,
          )
        : [
            ...selected,
            value,
          ],
    );
  }


  /* =======================================
     SETUP KIND FILTER
  ======================================= */

  function toggleSetupKind(
    value:
      string,
  ) {
    const next =
      selectedSetupKinds.includes(
        value,
      )
        ? selectedSetupKinds.filter(
            item =>
              item !==
              value,
          )
        : [
            ...selectedSetupKinds,
            value,
          ];


    setSelectedSetupKinds(
      next,
    );


    if (
      next.length ===
      1
    ) {
      onSetupSectionChange(
        next[0] as Exclude<
          GrowingSetupSection,
          'overview'
        >,
      );

      return;
    }


    onSetupSectionChange(
      'overview',
    );
  }


  /* =======================================
     CLEAR FILTERS
  ======================================= */

  function clearFilters() {
    setSearchQuery(
      '',
    );

    setSortBy(
      'name-az',
    );

    setSelectedPlaceKinds(
      [],
    );

    setSelectedSetupKinds(
      [],
    );

    setSelectedSetupIngredients(
      [],
    );

    setSelectedSetupProducts(
      [],
    );

    setSelectedIngredientCategories(
      [],
    );

    setSelectedIngredientManufacturers(
      [],
    );

    setSelectedProductCategories(
      [],
    );

    setSelectedProductBrands(
      [],
    );

    onSetupSectionChange(
      'overview',
    );
  }


  /* =======================================
     SECTION CHANGE
  ======================================= */

  function changeSection(
    nextSection:
      GrowingSection,
  ) {
    setSearchQuery(
      '',
    );

    setSortBy(
      'name-az',
    );

    setSelectedPlaceKinds(
      [],
    );

    setSelectedSetupKinds(
      [],
    );

    setSelectedSetupIngredients(
      [],
    );

    setSelectedSetupProducts(
      [],
    );

    setSelectedIngredientCategories(
      [],
    );

    setSelectedIngredientManufacturers(
      [],
    );

    setSelectedProductCategories(
      [],
    );

    setSelectedProductBrands(
      [],
    );

    onSetupSectionChange(
      'overview',
    );

    onSectionChange(
      nextSection,
    );
  }


  /* =======================================
     ACTIVE SECTION
  ======================================= */

  const activeSection =
    GROWING_SECTIONS.find(
      item =>
        item.id ===
        section,
    ) ??
    GROWING_SECTIONS[0];


  /* =======================================
     SEARCHED PLACES
  ======================================= */

  const visiblePlaces =
    useMemo(
      () => {
        const query =
          normaliseSearchText(
            searchQuery,
          );


        const filtered =
          gardenPlaces.filter(
            place => {
              if (
                query &&
                !getGrowingPlaceSearchText(
                  place,
                ).includes(
                  query,
                )
              ) {
                return false;
              }


              if (
                selectedPlaceKinds.length >
                  0 &&
                !selectedPlaceKinds.includes(
                  getGrowingPlaceKindLabel(
                    place,
                  ),
                )
              ) {
                return false;
              }


              return true;
            },
          );


        return [
          ...filtered,
        ].sort(
          (
            first,
            second,
          ) => {
            if (
              sortBy ===
              'name-za'
            ) {
              return second.name.localeCompare(
                first.name,
              );
            }


            if (
              sortBy ===
              'kind-az'
            ) {
              return getGrowingPlaceKindLabel(
                first,
              ).localeCompare(
                getGrowingPlaceKindLabel(
                  second,
                ),
              );
            }


            return first.name.localeCompare(
              second.name,
            );
          },
        );
      },
      [
        gardenPlaces,
        searchQuery,
        selectedPlaceKinds,
        sortBy,
      ],
    );


  /* =======================================
     SEARCHED SETUPS
  ======================================= */

  const visibleSetups =
    useMemo(
      () => {
        const query =
          normaliseSearchText(
            searchQuery,
          );


        const selectedIngredientIds =
          activeIngredients
            .filter(
              ingredient =>
                selectedSetupIngredients.includes(
                  ingredient.name,
                ),
            )
            .map(
              ingredient =>
                ingredient.id,
            );


        const selectedProductIds =
          activeProducts
            .filter(
              product =>
                selectedSetupProducts.includes(
                  product.name,
                ),
            )
            .map(
              product =>
                product.id,
            );


        const filtered =
          activeSetups.filter(
            setup => {
              if (
                query &&
                !getGrowingSetupSearchText(
                  setup,
                  growingSetups,
                  ingredients,
                  products,
                ).includes(
                  query,
                )
              ) {
                return false;
              }


              if (
                selectedSetupKinds.length >
                  0 &&
                !selectedSetupKinds.includes(
                  setup.category,
                )
              ) {
                return false;
              }


              if (
                selectedIngredientIds.length >
                  0
              ) {
                const setupIngredientIds =
                  getSetupIngredientIds(
                    setup,
                  );


                if (
                  !selectedIngredientIds.some(
                    ingredientId =>
                      setupIngredientIds.includes(
                        ingredientId,
                      ),
                  )
                ) {
                  return false;
                }
              }


              if (
                selectedProductIds.length >
                  0
              ) {
                const setupProductIds =
                  getSetupProductIds(
                    setup,
                  );


                if (
                  !selectedProductIds.some(
                    productId =>
                      setupProductIds.includes(
                        productId,
                      ),
                  )
                ) {
                  return false;
                }
              }


              return true;
            },
          );


        return [
          ...filtered,
        ].sort(
          (
            first,
            second,
          ) => {
            if (
              sortBy ===
              'name-za'
            ) {
              return second.name.localeCompare(
                first.name,
              );
            }


            if (
              sortBy ===
              'kind-az'
            ) {
              return getGrowingSetupLabel(
                first,
              ).localeCompare(
                getGrowingSetupLabel(
                  second,
                ),
              );
            }


            return first.name.localeCompare(
              second.name,
            );
          },
        );
      },
      [
        activeSetups,
        activeIngredients,
        activeProducts,
        growingSetups,
        ingredients,
        products,
        searchQuery,
        selectedSetupKinds,
        selectedSetupIngredients,
        selectedSetupProducts,
        sortBy,
      ],
    );


  /* =======================================
     SEARCHED INGREDIENTS
  ======================================= */

  const visibleIngredients =
    useMemo(
      () => {
        const query =
          normaliseSearchText(
            searchQuery,
          );


        const filtered =
          activeIngredients.filter(
            ingredient => {
              if (
                query &&
                !getIngredientSearchText(
                  ingredient,
                  growingSetups,
                ).includes(
                  query,
                )
              ) {
                return false;
              }


              if (
                selectedIngredientCategories.length >
                  0 &&
                !selectedIngredientCategories.includes(
                  getIngredientSubtitle(
                    ingredient,
                  ),
                )
              ) {
                return false;
              }


              if (
                selectedIngredientManufacturers.length >
                  0 &&
                !selectedIngredientManufacturers.includes(
                  ingredient.manufacturer ??
                    '',
                )
              ) {
                return false;
              }


              return true;
            },
          );


        return [
          ...filtered,
        ].sort(
          (
            first,
            second,
          ) => {
            if (
              sortBy ===
              'name-za'
            ) {
              return second.name.localeCompare(
                first.name,
              );
            }


            if (
              sortBy ===
              'kind-az'
            ) {
              return getIngredientSubtitle(
                first,
              ).localeCompare(
                getIngredientSubtitle(
                  second,
                ),
              );
            }


            return first.name.localeCompare(
              second.name,
            );
          },
        );
      },
      [
        activeIngredients,
        growingSetups,
        searchQuery,
        selectedIngredientCategories,
        selectedIngredientManufacturers,
        sortBy,
      ],
    );


  /* =======================================
     SEARCHED PRODUCTS
  ======================================= */

  const visibleProducts =
    useMemo(
      () => {
        const query =
          normaliseSearchText(
            searchQuery,
          );


        const filtered =
          activeProducts.filter(
            product => {
              if (
                query &&
                !getProductSearchText(
                  product,
                  growingSetups,
                ).includes(
                  query,
                )
              ) {
                return false;
              }


              if (
                selectedProductCategories.length >
                  0 &&
                !selectedProductCategories.includes(
                  getProductCategoryLabel(
                    product,
                  ),
                )
              ) {
                return false;
              }


              if (
                selectedProductBrands.length >
                  0 &&
                !selectedProductBrands.includes(
                  product.brand ??
                    '',
                )
              ) {
                return false;
              }


              return true;
            },
          );


        return [
          ...filtered,
        ].sort(
          (
            first,
            second,
          ) => {
            if (
              sortBy ===
              'name-za'
            ) {
              return second.name.localeCompare(
                first.name,
              );
            }


            if (
              sortBy ===
              'kind-az'
            ) {
              return getProductCategoryLabel(
                first,
              ).localeCompare(
                getProductCategoryLabel(
                  second,
                ),
              );
            }


            return first.name.localeCompare(
              second.name,
            );
          },
        );
      },
      [
        activeProducts,
        growingSetups,
        searchQuery,
        selectedProductCategories,
        selectedProductBrands,
        sortBy,
      ],
    );


  /* =======================================
     ACTIVE FILTER COUNT
  ======================================= */

  const activeFilterCount =
    section ===
    'places'
      ? selectedPlaceKinds.length
      : section ===
        'setups'
        ? selectedSetupKinds.length +
          selectedSetupIngredients.length +
          selectedSetupProducts.length
        : section ===
          'ingredients'
          ? selectedIngredientCategories.length +
            selectedIngredientManufacturers.length
          : selectedProductCategories.length +
            selectedProductBrands.length;


  /* =======================================
     RESULT COUNT
  ======================================= */

  const resultCount =
    section ===
    'places'
      ? visiblePlaces.length
      : section ===
        'setups'
        ? visibleSetups.length
        : section ===
          'ingredients'
          ? visibleIngredients.length
          : visibleProducts.length;


  /* =======================================
     RECORD WORD
  ======================================= */

  const resultWord =
    section ===
    'places'
      ? resultCount ===
        1
        ? 'place'
        : 'places'
      : section ===
        'setups'
        ? resultCount ===
          1
          ? 'soil or setup'
          : 'soils & setups'
        : section ===
          'ingredients'
          ? resultCount ===
            1
            ? 'ingredient'
            : 'ingredients'
          : resultCount ===
            1
            ? 'product'
            : 'products';


  /* =======================================
     ADD ACTION
  ======================================= */

  function handleAddCurrentRecord() {
    if (
      section ===
      'places'
    ) {
      onAddPlace();

      return;
    }


    if (
      section ===
      'setups'
    ) {
      onAddSetup();

      return;
    }


    if (
      section ===
      'ingredients'
    ) {
      if (
        onAddIngredient
      ) {
        onAddIngredient();

        return;
      }


      onOpenLibrary?.(
        'ingredients',
      );

      return;
    }


    if (
      onAddProduct
    ) {
      onAddProduct();

      return;
    }


    onOpenLibrary?.(
      'products',
    );
  }


  function getAddButtonLabel():
    string {
    switch (
      section
    ) {
      case 'places':
        return '＋ Add a Growing Place';

      case 'setups':
        return '＋ Add Soil or Setup';

      case 'ingredients':
        return '＋ Add an Ingredient';

      case 'products':
        return '＋ Add a Product';

      default:
        return '＋ Add';
    }
  }


  /* =======================================
     FILTER GROUP
  ======================================= */

  function renderFilterGroup(
    title:
      string,

    options:
      string[],

    selected:
      string[],

    onToggle: (
      option:
        string,
    ) => void,

    getLabel?: (
      option:
        string,
    ) => string,
  ) {
    if (
      options.length ===
      0
    ) {
      return null;
    }


    return (
      <fieldset className="growing-filter-group">
        <legend>
          {title}
        </legend>

        <div className="growing-filter-options">
          {options.map(
            option => (
              <label
                className="growing-filter-option"
                key={
                  `${title}-${option}`
                }
              >
                <input
                  type="checkbox"
                  checked={
                    selected.includes(
                      option,
                    )
                  }
                  onChange={() =>
                    onToggle(
                      option,
                    )
                  }
                />

                <span>
                  {getLabel
                    ? getLabel(
                        option,
                      )
                    : option}
                </span>
              </label>
            ),
          )}
        </div>
      </fieldset>
    );
  }


  /* =======================================
     SETUP KIND LABEL
  ======================================= */

  function getSetupKindFilterLabel(
    value:
      string,
  ): string {
    return (
      GROWING_SETUP_SECTIONS.find(
        item =>
          item.id ===
          value,
      )?.label ??
      formatLabel(
        value,
      )
    );
  }


  /* =======================================
     FILTER TOOLS
  ======================================= */

  function renderActiveFilters() {
    if (
      section ===
      'places'
    ) {
      return renderFilterGroup(
        'Place type',
        placeKindOptions,
        selectedPlaceKinds,
        option =>
          toggleFilter(
            option,
            selectedPlaceKinds,
            setSelectedPlaceKinds,
          ),
      );
    }


    if (
      section ===
      'setups'
    ) {
      return (
        <>
          {renderFilterGroup(
            'What kind?',
            setupKindOptions,
            selectedSetupKinds,
            toggleSetupKind,
            getSetupKindFilterLabel,
          )}

          {renderFilterGroup(
            'Contains ingredient',
            setupIngredientOptions,
            selectedSetupIngredients,
            option =>
              toggleFilter(
                option,
                selectedSetupIngredients,
                setSelectedSetupIngredients,
              ),
          )}

          {renderFilterGroup(
            'Contains product',
            setupProductOptions,
            selectedSetupProducts,
            option =>
              toggleFilter(
                option,
                selectedSetupProducts,
                setSelectedSetupProducts,
              ),
          )}
        </>
      );
    }


    if (
      section ===
      'ingredients'
    ) {
      return (
        <>
          {renderFilterGroup(
            'Ingredient type',
            ingredientCategoryOptions,
            selectedIngredientCategories,
            option =>
              toggleFilter(
                option,
                selectedIngredientCategories,
                setSelectedIngredientCategories,
              ),
          )}

          {renderFilterGroup(
            'Maker / source',
            ingredientManufacturerOptions,
            selectedIngredientManufacturers,
            option =>
              toggleFilter(
                option,
                selectedIngredientManufacturers,
                setSelectedIngredientManufacturers,
              ),
          )}
        </>
      );
    }


    return (
      <>
        {renderFilterGroup(
          'Product type',
          productCategoryOptions,
          selectedProductCategories,
          option =>
            toggleFilter(
              option,
              selectedProductCategories,
              setSelectedProductCategories,
            ),
        )}

        {renderFilterGroup(
          'Brand',
          productBrandOptions,
          selectedProductBrands,
          option =>
            toggleFilter(
              option,
              selectedProductBrands,
              setSelectedProductBrands,
            ),
        )}
      </>
    );
  }


  /* =======================================
     RESULTS
  ======================================= */

  function renderResults() {
    if (
      resultCount ===
      0
    ) {
      return (
        <div className="growing-browser-empty">
          <h2>
            Nothing matches
          </h2>

          <p>
            Try another word or loosen
            one of the filters.
          </p>

          {(searchQuery ||
            activeFilterCount >
              0) && (
            <button
              type="button"
              className="text-button"
              onClick={
                clearFilters
              }
            >
              Clear search and filters
            </button>
          )}
        </div>
      );
    }


    if (
      section ===
      'places'
    ) {
      return (
        <div
          className="growing-index-list"
          style={
            recordListStyle
          }
        >
          {visiblePlaces.map(
            place => (
              <button
                key={
                  place.id
                }
                type="button"
                className="growing-index-row"
                style={
                  recordRowStyle
                }
                onClick={() =>
                  onOpenPlace(
                    place.id,
                  )
                }
              >
                <span
                  className="growing-index-row-copy"
                  style={
                    rowTextStyle
                  }
                >
                  <strong
                    className="growing-index-row-title"
                    style={
                      rowTitleStyle
                    }
                  >
                    {place.name}
                  </strong>

                  <span className="growing-index-row-meta">
                    {getGrowingPlaceKindLabel(
                      place,
                    )}

                    {place.aspect
                      ? ` · ${place.aspect}`
                      : ''}

                    {place.sunlight
                      ? ` · ${place.sunlight}`
                      : ''}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="growing-index-row-arrow"
                >
                  →
                </span>
              </button>
            ),
          )}
        </div>
      );
    }


    if (
      section ===
      'setups'
    ) {
      return (
        <div
          className="growing-index-list"
          style={
            recordListStyle
          }
        >
          {visibleSetups.map(
            setup => {
              const ingredientCount =
                getSetupIngredientIds(
                  setup,
                ).length;

              const productCount =
                getSetupProductIds(
                  setup,
                ).length;


              return (
                <button
                  key={
                    setup.id
                  }
                  type="button"
                  className="growing-index-row"
                  style={
                    recordRowStyle
                  }
                  onClick={() =>
                    onOpenSetup(
                      setup.id,
                    )
                  }
                >
                  <span
                    className="growing-index-row-copy"
                    style={
                      rowTextStyle
                    }
                  >
                    <strong
                      className="growing-index-row-title"
                      style={
                        rowTitleStyle
                      }
                    >
                      {setup.name}
                    </strong>

                    <span className="growing-index-row-meta">
                      {getGrowingSetupLabel(
                        setup,
                      )}

                      {setup.brand
                        ? ` · ${setup.brand}`
                        : ''}

                      {ingredientCount >
                      0
                        ? ` · ${ingredientCount} ${
                            ingredientCount ===
                            1
                              ? 'ingredient'
                              : 'ingredients'
                          }`
                        : ''}

                      {productCount >
                      0
                        ? ` · ${productCount} ${
                            productCount ===
                            1
                              ? 'product'
                              : 'products'
                          }`
                        : ''}
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className="growing-index-row-arrow"
                  >
                    →
                  </span>
                </button>
              );
            },
          )}
        </div>
      );
    }


    if (
      section ===
      'ingredients'
    ) {
      return (
        <div
          className="growing-index-list"
          style={
            recordListStyle
          }
        >
          {visibleIngredients.map(
            ingredient => {
              const usedByCount =
                activeSetups.filter(
                  setup =>
                    getSetupIngredientIds(
                      setup,
                    ).includes(
                      ingredient.id,
                    ),
                ).length;


              return (
                <button
                  key={
                    ingredient.id
                  }
                  type="button"
                  className="growing-index-row"
                  style={
                    recordRowStyle
                  }
                  onClick={() =>
                    onOpenIngredient(
                      ingredient.id,
                    )
                  }
                >
                  <span
                    className="growing-index-row-copy"
                    style={
                      rowTextStyle
                    }
                  >
                    <strong
                      className="growing-index-row-title"
                      style={
                        rowTitleStyle
                      }
                    >
                      {ingredient.name}
                    </strong>

                    <span className="growing-index-row-meta">
                      {getIngredientSubtitle(
                        ingredient,
                      )}

                      {ingredient.manufacturer
                        ? ` · ${ingredient.manufacturer}`
                        : ''}

                      {usedByCount >
                      0
                        ? ` · used in ${usedByCount} ${
                            usedByCount ===
                            1
                              ? 'setup'
                              : 'setups'
                          }`
                        : ''}
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className="growing-index-row-arrow"
                  >
                    →
                  </span>
                </button>
              );
            },
          )}
        </div>
      );
    }


    return (
      <div
        className="growing-index-list"
        style={
          recordListStyle
        }
      >
        {visibleProducts.map(
          product => {
            const usedByCount =
              activeSetups.filter(
                setup =>
                  getSetupProductIds(
                    setup,
                  ).includes(
                    product.id,
                  ),
              ).length;


            return (
              <button
                key={
                  product.id
                }
                type="button"
                className="growing-index-row"
                style={
                  recordRowStyle
                }
                onClick={() =>
                  onOpenProduct(
                    product.id,
                  )
                }
              >
                <span
                  className="growing-index-row-copy"
                  style={
                    rowTextStyle
                  }
                >
                  <strong
                    className="growing-index-row-title"
                    style={
                      rowTitleStyle
                    }
                  >
                    {product.name}
                  </strong>

                  <span className="growing-index-row-meta">
                    {getProductSubtitle(
                      product,
                    )}

                    {usedByCount >
                    0
                      ? ` · used in ${usedByCount} ${
                          usedByCount ===
                          1
                            ? 'setup'
                            : 'setups'
                        }`
                      : ''}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="growing-index-row-arrow"
                >
                  →
                </span>
              </button>
            );
          },
        )}
      </div>
    );
  }


  /* =======================================
     BACK TO TOP
  ======================================= */

  function backToTop() {
    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    });
  }


  return (
    <GardenLayout
      activePage="growing-places"
      onNavigate={
        onNavigate
      }
    >
      <div className="garden-page growing-page">

        {/* ===================================
            JOURNEY BACK
        =================================== */}

        {journeyBackLabel &&
          onJourneyBack && (
            <div className="growing-journey-back">
              <button
                type="button"
                className="secondary-button"
                onClick={
                  onJourneyBack
                }
              >
                ← Back to{' '}
                {journeyBackLabel}
              </button>
            </div>
          )}


        {/* ===================================
            HEADER
        =================================== */}

        <header className="garden-header growing-header">
          <div className="growing-header-copy">
            <p className="app-name">
              My Garden
            </p>

            <h1 className="garden-title">
              Growing
            </h1>

            <p className="garden-subtitle">
              Where the garden grows,
              what surrounds the roots,
              and the things that help
              build it.
            </p>
          </div>


          <div className="growing-page-actions">
            <button
              type="button"
              className="journal-add-button"
              onClick={
                handleAddCurrentRecord
              }
            >
              {getAddButtonLabel()}
            </button>
          </div>
        </header>


        {/* ===================================
            FOUR SIBLING GROWING DESTINATIONS
        =================================== */}

        <nav
          className="growing-section-navigation"
          aria-label="Growing sections"
        >
          {GROWING_SECTIONS.map(
            item => (
              <button
                key={
                  item.id
                }
                type="button"
                className={
                  section ===
                  item.id
                    ? 'growing-section-button growing-section-button--active'
                    : 'growing-section-button'
                }
                aria-current={
                  section ===
                  item.id
                    ? 'page'
                    : undefined
                }
                onClick={() =>
                  changeSection(
                    item.id,
                  )
                }
              >
                <strong>
                  {item.label}
                </strong>

                <small>
                  {item.eyebrow}
                </small>
              </button>
            ),
          )}
        </nav>


        {/* ===================================
            ACTIVE SECTION INTRO
        =================================== */}

        <section className="growing-section-intro">
          <p className="section-label">
            {activeSection.label}
          </p>

          <h2>
            {activeSection.description}
          </h2>
        </section>


        {/* ===================================
            SEARCH / FILTER WORKSPACE
        =================================== */}

        <div className="growing-browser-layout">

          <aside className="growing-browser-tools">

            <div className="growing-browser-tools-heading">
              <div>
                <p className="section-label">
                  Find
                </p>

                <h2>
                  {section ===
                  'places'
                    ? 'Search Growing Places'
                    : section ===
                      'setups'
                      ? 'Search Soils & Setups'
                      : section ===
                        'ingredients'
                        ? 'Search Ingredients'
                        : 'Search Products'}
                </h2>
              </div>


              {(activeFilterCount >
                0 ||
                searchQuery) && (
                <button
                  type="button"
                  className="text-button"
                  onClick={
                    clearFilters
                  }
                >
                  Clear
                </button>
              )}
            </div>


            <label className="growing-search-field">
              <span className="growing-tool-label">
                Search
              </span>

              <input
                type="search"
                value={
                  searchQuery
                }
                onChange={
                  event =>
                    setSearchQuery(
                      event.target.value,
                    )
                }
                placeholder={
                  section ===
                  'places'
                    ? 'Name, type, aspect, sunlight, note...'
                    : section ===
                      'setups'
                      ? 'Soil, recipe, ingredient, product, system, note...'
                      : section ===
                        'ingredients'
                        ? 'Name, type, maker, setup, note...'
                        : 'Name, brand, type, setup, note...'
                }
              />
            </label>


            <label className="growing-sort-field">
              <span className="growing-tool-label">
                Order by
              </span>

              <select
                value={
                  sortBy
                }
                onChange={
                  event =>
                    setSortBy(
                      event.target.value as GrowingSort,
                    )
                }
              >
                <option value="name-az">
                  Name A–Z
                </option>

                <option value="name-za">
                  Name Z–A
                </option>

                <option value="kind-az">
                  {section ===
                  'places'
                    ? 'Place type'
                    : section ===
                      'setups'
                      ? 'Soil / setup kind'
                      : section ===
                        'ingredients'
                        ? 'Ingredient type'
                        : 'Product type'}
                </option>
              </select>
            </label>


            <div className="growing-filter-area">
              {renderActiveFilters()}
            </div>
          </aside>


          <main className="growing-browser-results">

            <div className="growing-results-heading">
              <p>
                <strong>
                  {resultCount}
                </strong>{' '}
                {resultWord}
              </p>

              {activeFilterCount >
                0 && (
                <p className="growing-active-filter-note">
                  {activeFilterCount}{' '}
                  {activeFilterCount ===
                  1
                    ? 'filter'
                    : 'filters'}{' '}
                  active
                </p>
              )}
            </div>


            {renderResults()}
          </main>
        </div>


        {/* ===================================
            BACK TO TOP
        =================================== */}

        <div className="growing-back-to-top">
          <button
            type="button"
            className="text-button"
            onClick={
              backToTop
            }
          >
            ↑ Back to the top
          </button>
        </div>

      </div>
    </GardenLayout>
  );
}