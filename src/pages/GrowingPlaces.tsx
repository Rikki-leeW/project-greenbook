import GardenLayout from '../components/layout/GardenLayout';
import type {
  GardenProduct,
  GrowingPlace,
  GrowingSetup,
  Ingredient,
} from '../types';
import type { AppPage } from '../types/navigation';

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

interface GrowingPlacesProps {
  gardenPlaces: GrowingPlace[];
  growingSetups: GrowingSetup[];
  ingredients: Ingredient[];
  products: GardenProduct[];
  section: GrowingSection;
  setupSection: GrowingSetupSection;
  onSectionChange: (section: GrowingSection) => void;
  onSetupSectionChange: (section: GrowingSetupSection) => void;
  journeyBackLabel?: string | null;
  onJourneyBack?: () => void;
  onAddPlace: () => void;
  onAddSetup: () => void;
  onOpenPlace: (growingPlaceId: string) => void;
  onOpenSetup: (growingSetupId: string) => void;
  onOpenIngredient: (ingredientId: string) => void;
  onOpenProduct: (productId: string) => void;
  onOpenLibrary: (destination: LibraryDestination) => void;
  onNavigate: (
    page: AppPage,
    libraryView?: LibraryDestination,
  ) => void;
}

interface GrowingSectionDefinition {
  id: GrowingSection;
  label: string;
  eyebrow: string;
  description: string;
}

interface GrowingSetupDefinition {
  id: Exclude<GrowingSetupSection, 'overview'>;
  label: string;
  description: string;
}

const GROWING_SECTIONS: GrowingSectionDefinition[] = [
  {
    id: 'places',
    label: 'Growing Places',
    eyebrow: 'Where it grows',
    description: 'The physical places around your garden.',
  },
  {
    id: 'setups',
    label: 'Growing Setups',
    eyebrow: 'What it grows in',
    description: 'Recipes, bought mixes, systems and ground types.',
  },
  {
    id: 'ingredients',
    label: 'Ingredients',
    eyebrow: 'What it is made from',
    description:
      'Reusable materials that become part of growing recipes.',
  },
  {
    id: 'products',
    label: 'Products',
    eyebrow: 'What was bought',
    description: 'Commercial garden products and their history.',
  },
];

const GROWING_SETUP_SECTIONS: GrowingSetupDefinition[] = [
  {
    id: 'own-mix',
    label: 'My Recipes',
    description: 'Growing mixes you make yourself.',
  },
  {
    id: 'bought-mix',
    label: 'Bought Mixes',
    description: 'Commercial growing media bought ready to use.',
  },
  {
    id: 'growing-system',
    label: 'Growing Systems',
    description:
      'No-dig, wicking beds, hydroponics and other growing systems.',
  },
  {
    id: 'ground-type',
    label: 'Ground Types',
    description:
      'Native soil, clay, loam and other straight-in-ground conditions.',
  },
];

function formatLabel(value: string): string {
  return value
    .replaceAll('-', ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function getGrowingPlaceKindLabel(
  place: GrowingPlace,
): string {
  if (
    place.kind === 'other' &&
    place.customKindLabel
  ) {
    return place.customKindLabel;
  }

  return formatLabel(place.kind);
}

function getGrowingSetupLabel(
  setup: GrowingSetup,
): string {
  switch (setup.category) {
    case 'own-mix':
      return 'My Recipe';

    case 'bought-mix':
      return 'Bought Mix';

    case 'growing-system':
      return 'Growing System';

    case 'ground-type':
      return 'Ground Type';

    default:
      return 'Growing Setup';
  }
}

function getSetupSectionTitle(
  section: GrowingSetupSection,
): string {
  switch (section) {
    case 'own-mix':
      return 'My Recipes';

    case 'bought-mix':
      return 'Bought Mixes';

    case 'growing-system':
      return 'Growing Systems';

    case 'ground-type':
      return 'Ground Types';

    default:
      return 'Growing Setups';
  }
}

function getSetupSectionDescription(
  section: GrowingSetupSection,
): string {
  switch (section) {
    case 'own-mix':
      return 'Growing mixes you make yourself.';

    case 'bought-mix':
      return 'Commercial growing media bought ready to use.';

    case 'growing-system':
      return 'The growing systems your garden uses.';

    case 'ground-type':
      return 'The ground conditions plants grow directly into.';

    default:
      return 'What the plants in your garden actually grow in.';
  }
}

function getIngredientSubtitle(
  ingredient: Ingredient,
): string {
  if (
    ingredient.category === 'other' &&
    ingredient.customCategoryLabel
  ) {
    return ingredient.customCategoryLabel;
  }

  if (ingredient.category) {
    return formatLabel(ingredient.category);
  }

  return 'Ingredient';
}

function getProductSubtitle(
  product: GardenProduct,
): string {
  if (product.brand) {
    return product.brand;
  }

  if (
    product.category === 'other' &&
    product.customCategoryLabel
  ) {
    return product.customCategoryLabel;
  }

  if (product.category) {
    return formatLabel(product.category);
  }

  return 'Garden Product';
}

const topNavigationStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '0.7rem',
  margin: '1.3rem 0 1.6rem',
};

const topNavigationButtonStyle: React.CSSProperties = {
  minWidth: 0,
  border: '1px solid rgba(74, 89, 65, 0.18)',
  borderRadius: '0.75rem',
  background: 'rgba(255, 253, 246, 0.78)',
  padding: '0.95rem 0.7rem',
  textAlign: 'center',
  cursor: 'pointer',
  font: 'inherit',
  color: 'inherit',
  boxShadow: '0 1px 4px rgba(55, 62, 45, 0.06)',
};

const workspaceStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns:
    'minmax(12rem, 0.75fr) minmax(0, 1.5fr)',
  gap: '1rem',
  alignItems: 'start',
};

const workspaceCardStyle: React.CSSProperties = {
  background: 'rgba(255, 253, 246, 0.72)',
  border: '1px solid rgba(74, 89, 65, 0.14)',
  borderRadius: '0.9rem',
  padding: '1.2rem',
  boxShadow: '0 1px 5px rgba(55, 62, 45, 0.05)',
};

const recordRowStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '0.9rem 0',
  border: '0',
  borderBottom: '1px solid rgba(72, 71, 56, 0.16)',
  background: 'transparent',
  textAlign: 'left',
  cursor: 'pointer',
  font: 'inherit',
  color: 'inherit',
};

const rowTextStyle: React.CSSProperties = {
  minWidth: 0,
  flex: '1 1 auto',
};

const arrowStyle: React.CSSProperties = {
  flex: '0 0 auto',
  fontSize: '1.15rem',
};

const countStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '1.8rem',
  padding: '0.15rem 0.45rem',
  borderRadius: '999px',
  background: 'rgba(237, 244, 230, 0.9)',
  fontSize: '0.82rem',
  fontWeight: 700,
};

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
  onOpenPlace,
  onOpenSetup,
  onOpenIngredient,
  onOpenProduct,
  onOpenLibrary,
  onNavigate,
}: GrowingPlacesProps) {
  const sortedPlaces = [...gardenPlaces].sort(
    (first, second) =>
      first.name.localeCompare(second.name),
  );

  const activeSetups = growingSetups
    .filter(setup => !setup.isArchived)
    .sort(
      (first, second) =>
        first.name.localeCompare(second.name),
    );

  const visibleSetups =
    setupSection === 'overview'
      ? activeSetups
      : activeSetups.filter(
          setup =>
            setup.category === setupSection,
        );

  const activeIngredients = ingredients
    .filter(
      ingredient =>
        !ingredient.isArchived,
    )
    .sort(
      (first, second) =>
        first.name.localeCompare(second.name),
    );

  const activeProducts = products
    .filter(
      product =>
        !product.isArchived,
    )
    .sort(
      (first, second) =>
        first.name.localeCompare(second.name),
    );

  const activeSection =
    GROWING_SECTIONS.find(
      item =>
        item.id === section,
    ) ??
    GROWING_SECTIONS[0];

  const activeSetupTitle =
    getSetupSectionTitle(
      setupSection,
    );

  const activeSetupDescription =
    getSetupSectionDescription(
      setupSection,
    );

  return (
    <GardenLayout
      activePage="growing-places"
      onNavigate={onNavigate}
    >
      <div className="journal-page">

        {/* ===================================
            JOURNEY BACK
        =================================== */}

        {journeyBackLabel &&
          onJourneyBack && (
            <div
              style={{
                marginBottom: '1rem',
              }}
            >
              <button
                type="button"
                className="secondary-button"
                onClick={onJourneyBack}
              >
                ← Back to {journeyBackLabel}
              </button>
            </div>
          )}


        {/* ===================================
            PAGE HEADER
        =================================== */}

        <header className="journal-header">
          <div>
            <p className="section-label">
              My Garden
            </p>

            <h1>
              Growing
            </h1>

            <p className="journal-intro">
              Where the garden grows,
              what surrounds the roots,
              and the things that help
              build it.
            </p>
          </div>
        </header>


        {/* ===================================
            PRIMARY GROWING NAVIGATION
        =================================== */}

        <nav
          aria-label="Growing sections"
          style={topNavigationStyle}
        >
          {GROWING_SECTIONS.map(
            item => {
              const isSelected =
                item.id === section;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSectionChange(
                      item.id,
                    );

                    if (
                      item.id !== 'setups'
                    ) {
                      onSetupSectionChange(
                        'overview',
                      );
                    }
                  }}
                  aria-current={
                    isSelected
                      ? 'page'
                      : undefined
                  }
                  style={{
                    ...topNavigationButtonStyle,

                    background:
                      isSelected
                        ? 'rgba(237, 244, 230, 0.95)'
                        : 'rgba(255, 253, 246, 0.78)',

                    borderColor:
                      isSelected
                        ? 'rgba(67, 96, 62, 0.34)'
                        : 'rgba(74, 89, 65, 0.18)',

                    fontWeight:
                      isSelected
                        ? 700
                        : 500,
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    className="form-whisper"
                    style={{
                      display: 'block',
                      marginTop: '0.25rem',
                    }}
                  >
                    {item.eyebrow}
                  </span>
                </button>
              );
            },
          )}
        </nav>


        {/* ===================================
            ACTIVE AREA INTRO
        =================================== */}

        <section
          style={{
            marginBottom: '1.2rem',
          }}
        >
          <p className="section-label">
            {section === 'setups' &&
            setupSection !== 'overview'
              ? activeSetupTitle
              : activeSection.label}
          </p>

          <h2>
            {section === 'setups'
              ? activeSetupDescription
              : activeSection.description}
          </h2>
        </section>


        {/* ===================================
            GROWING PLACES
        =================================== */}

        {section === 'places' && (
          <section className="story-section">
            <div style={workspaceStyle}>
              <div style={workspaceCardStyle}>
                <p className="section-label">
                  Add
                </p>

                <h3>
                  Add a Growing Place
                </h3>

                <p>
                  Record a physical location
                  in your garden, such as a
                  garden bed, deck,
                  greenhouse, grow bag area
                  or west wall.
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={onAddPlace}
                >
                  ＋ Add Place
                </button>
              </div>


              <div style={workspaceCardStyle}>
                <p className="section-label">
                  Browse
                </p>

                <h3>
                  Your Growing Places
                </h3>

                {sortedPlaces.length === 0 ? (
                  <p>
                    No Growing Places have
                    been recorded yet.
                  </p>
                ) : (
                  sortedPlaces.map(
                    place => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() =>
                          onOpenPlace(
                            place.id,
                          )
                        }
                        style={recordRowStyle}
                      >
                        <span
                          style={rowTextStyle}
                        >
                          <strong>
                            {place.name}
                          </strong>

                          <span
                            className="form-whisper"
                            style={{
                              display:
                                'block',
                              marginTop:
                                '0.15rem',
                            }}
                          >
                            {getGrowingPlaceKindLabel(
                              place,
                            )}
                          </span>
                        </span>

                        <span style={arrowStyle}>
                          →
                        </span>
                      </button>
                    ),
                  )
                )}
              </div>
            </div>
          </section>
        )}


        {/* ===================================
            GROWING SETUPS OVERVIEW
        =================================== */}

        {section === 'setups' &&
          setupSection === 'overview' && (
            <section className="story-section">
              <div style={workspaceStyle}>
                <div style={workspaceCardStyle}>
                  <p className="section-label">
                    Add
                  </p>

                  <h3>
                    Add a Growing Setup
                  </h3>

                  <p>
                    A Growing Setup remembers
                    what surrounds the roots.
                  </p>

                  <p className="form-whisper">
                    It may be your own recipe,
                    a bought mix, a growing
                    system or the ground itself.
                  </p>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={onAddSetup}
                  >
                    ＋ Add Growing Setup
                  </button>
                </div>


                <div style={workspaceCardStyle}>
                  <p className="section-label">
                    Browse by kind
                  </p>

                  <h3>
                    What the Garden Grows In
                  </h3>

                  {GROWING_SETUP_SECTIONS.map(
                    item => {
                      const count =
                        activeSetups.filter(
                          setup =>
                            setup.category ===
                            item.id,
                        ).length;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            onSetupSectionChange(
                              item.id,
                            )
                          }
                          style={recordRowStyle}
                        >
                          <span
                            style={rowTextStyle}
                          >
                            <strong>
                              {item.label}
                            </strong>

                            <span
                              className="form-whisper"
                              style={{
                                display:
                                  'block',
                                marginTop:
                                  '0.15rem',
                              }}
                            >
                              {item.description}
                            </span>
                          </span>

                          <span style={countStyle}>
                            {count}
                          </span>

                          <span style={arrowStyle}>
                            →
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </section>
          )}


        {/* ===================================
            GROWING SETUP SUB-LAYER
        =================================== */}

        {section === 'setups' &&
          setupSection !== 'overview' && (
            <section className="story-section">

              <div
                style={{
                  marginBottom: '1rem',
                }}
              >
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    onSetupSectionChange(
                      'overview',
                    )
                  }
                >
                  ← Growing Setups
                </button>
              </div>


              <div style={workspaceStyle}>
                <div style={workspaceCardStyle}>
                  <p className="section-label">
                    Add
                  </p>

                  <h3>
                    Add to {activeSetupTitle}
                  </h3>

                  <p>
                    {activeSetupDescription}
                  </p>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={onAddSetup}
                  >
                    ＋ New{' '}
                    {setupSection === 'own-mix'
                      ? 'Recipe'
                      : setupSection ===
                          'bought-mix'
                        ? 'Bought Mix'
                        : setupSection ===
                            'growing-system'
                          ? 'Growing System'
                          : 'Ground Type'}
                  </button>
                </div>


                <div style={workspaceCardStyle}>
                  <p className="section-label">
                    Browse
                  </p>

                  <h3>
                    Your {activeSetupTitle}
                  </h3>

                  {visibleSetups.length === 0 ? (
                    <p>
                      Nothing has been recorded
                      here yet.
                    </p>
                  ) : (
                    visibleSetups.map(
                      setup => (
                        <button
                          key={setup.id}
                          type="button"
                          onClick={() =>
                            onOpenSetup(
                              setup.id,
                            )
                          }
                          style={recordRowStyle}
                        >
                          <span
                            style={rowTextStyle}
                          >
                            <strong>
                              {setup.name}
                            </strong>

                            <span
                              className="form-whisper"
                              style={{
                                display:
                                  'block',
                                marginTop:
                                  '0.15rem',
                              }}
                            >
                              {getGrowingSetupLabel(
                                setup,
                              )}
                            </span>
                          </span>

                          <span style={arrowStyle}>
                            →
                          </span>
                        </button>
                      ),
                    )
                  )}
                </div>
              </div>
            </section>
          )}


        {/* ===================================
            INGREDIENTS
        =================================== */}

        {section === 'ingredients' && (
          <section className="story-section">
            <div style={workspaceStyle}>
              <div style={workspaceCardStyle}>
                <p className="section-label">
                  Ingredients
                </p>

                <h3>
                  What a setup is built from
                </h3>

                <p>
                  Compost, manure, coir,
                  aeration materials,
                  amendments and other
                  reusable components.
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    onOpenLibrary(
                      'ingredients',
                    )
                  }
                >
                  ＋ Add Ingredient
                </button>
              </div>


              <div style={workspaceCardStyle}>
                <p className="section-label">
                  Browse
                </p>

                <h3>
                  Your Ingredients
                </h3>

                {activeIngredients.length === 0 ? (
                  <p>
                    No Ingredients have been
                    recorded yet.
                  </p>
                ) : (
                  activeIngredients.map(
                    ingredient => (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() =>
                          onOpenIngredient(
                            ingredient.id,
                          )
                        }
                        style={recordRowStyle}
                      >
                        <span
                          style={rowTextStyle}
                        >
                          <strong>
                            {ingredient.name}
                          </strong>

                          <span
                            className="form-whisper"
                            style={{
                              display:
                                'block',
                              marginTop:
                                '0.15rem',
                            }}
                          >
                            {getIngredientSubtitle(
                              ingredient,
                            )}
                          </span>
                        </span>

                        <span style={arrowStyle}>
                          →
                        </span>
                      </button>
                    ),
                  )
                )}
              </div>
            </div>
          </section>
        )}


        {/* ===================================
            PRODUCTS
        =================================== */}

        {section === 'products' && (
          <section className="story-section">
            <div style={workspaceStyle}>
              <div style={workspaceCardStyle}>
                <p className="section-label">
                  Products
                </p>

                <h3>
                  Bought garden products
                </h3>

                <p>
                  Named commercial products
                  keep their own identity,
                  purchase history and
                  provenance.
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    onOpenLibrary(
                      'products',
                    )
                  }
                >
                  ＋ Add Product
                </button>
              </div>


              <div style={workspaceCardStyle}>
                <p className="section-label">
                  Browse
                </p>

                <h3>
                  Your Products
                </h3>

                {activeProducts.length === 0 ? (
                  <p>
                    No Products have been
                    recorded yet.
                  </p>
                ) : (
                  activeProducts.map(
                    product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() =>
                          onOpenProduct(
                            product.id,
                          )
                        }
                        style={recordRowStyle}
                      >
                        <span
                          style={rowTextStyle}
                        >
                          <strong>
                            {product.name}
                          </strong>

                          <span
                            className="form-whisper"
                            style={{
                              display:
                                'block',
                              marginTop:
                                '0.15rem',
                            }}
                          >
                            {getProductSubtitle(
                              product,
                            )}
                          </span>
                        </span>

                        <span style={arrowStyle}>
                          →
                        </span>
                      </button>
                    ),
                  )
                )}
              </div>
            </div>
          </section>
        )}

      </div>
    </GardenLayout>
  );
}