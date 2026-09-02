import { useState } from 'react';
import GardenLayout from '../components/layout/GardenLayout';
import RecordActions from '../components/common/RecordActions';
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery';
import type { AppPage } from '../types/navigation';
import type {
  GardenProduct,
  GrowingPlace,
  GrowingSetup,
  Ingredient,
  PlantStory,
  PurchaseRecord,
} from '../types';

type RecipeRating = 1 | 2 | 3 | 4 | 5;

type RecipeComponent =
  NonNullable<GrowingSetup['recipeComponents']>[number];

interface GrowingRecipeDetailProps {
  recipe: GrowingSetup;
  ingredients: Ingredient[];
  products: GardenProduct[];
  growingSetups: GrowingSetup[];
  plants: PlantStory[];
  growingPlaces: GrowingPlace[];
  purchases: PurchaseRecord[];
  backLabel?: string;
  onBackToOrigin?: () => void;
  onBack: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleFavourite: () => void;
  onSetRating: (rating: RecipeRating) => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
  onAddPurchase?: () => void;
  onEditPurchase?: (purchase: PurchaseRecord) => void;
  onOpenGrowingPlace: (growingPlaceId: string) => void;
  onOpenPlant: (plantId: string) => void;
  onOpenIngredient: (ingredientId: string) => void;
  onOpenProduct: (productId: string) => void;
  onOpenRecipe: (recipeId: string) => void;
  onNavigate: (page: AppPage) => void;
}

function getRecipeCategoryLabel(
  recipe: GrowingSetup,
): string {
  switch (recipe.category) {
    case 'own-mix':
      return 'My Recipe';
    case 'bought-mix':
      return 'Bought Mix';
    case 'ground-type':
      return 'Ground Type';
    case 'growing-system':
      return 'Growing System';
    default:
      return 'Growing Record';
  }
}

function getRecordNoun(
  recipe: GrowingSetup,
): string {
  switch (recipe.category) {
    case 'own-mix':
      return 'recipe';
    case 'bought-mix':
      return 'bought mix';
    case 'ground-type':
      return 'ground type';
    case 'growing-system':
      return 'growing system';
    default:
      return 'growing record';
  }
}

function getRecordHeading(
  recipe: GrowingSetup,
): string {
  switch (recipe.category) {
    case 'own-mix':
      return 'Growing Recipe';
    case 'bought-mix':
      return 'Bought Mix';
    case 'ground-type':
      return 'Ground Type';
    case 'growing-system':
      return 'Growing System';
    default:
      return 'What It Grows In';
  }
}

function formatRecipeDate(date?: string): string {
  if (!date) return '';

  const safeDate = date.slice(0, 10);
  const parsed = new Date(`${safeDate}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTechnicalLabel(value: string): string {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, letter =>
      letter.toUpperCase(),
    );
}

function getRecipeComponentUnitLabel(
  component: RecipeComponent,
): string {
  const quantity = component.quantity;
  const isSingular = quantity === 1;

  switch (component.unit) {
    case 'part':
      return isSingular ? 'part' : 'parts';
    case 'litre':
      return isSingular ? 'litre' : 'litres';
    case 'millilitre':
      return isSingular ? 'millilitre' : 'millilitres';
    case 'kilogram':
      return isSingular ? 'kilogram' : 'kilograms';
    case 'gram':
      return isSingular ? 'gram' : 'grams';
    case 'handful':
      return isSingular ? 'handful' : 'handfuls';
    case 'scoop':
      return isSingular ? 'scoop' : 'scoops';
    case 'other':
      return component.customUnitLabel?.trim() ?? '';
    default:
      return '';
  }
}

function getRecipeComponentMeasurementLabel(
  component?: RecipeComponent,
): string {
  if (
    !component ||
    component.quantity === undefined
  ) {
    return '';
  }

  const unitLabel =
    getRecipeComponentUnitLabel(component);

  if (!unitLabel) {
    return String(component.quantity);
  }

  return `${component.quantity} ${unitLabel}`;
}

function formatPurchasePrice(
  purchase: PurchaseRecord,
): string {
  const currency =
    purchase.currency ?? 'AUD';

  try {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency,
    }).format(purchase.pricePaid);
  } catch {
    return `$${purchase.pricePaid.toFixed(2)}`;
  }
}

function getPurchaseAmountLabel(
  purchase: PurchaseRecord,
): string {
  const pieces: string[] = [];

  if (purchase.quantity !== undefined) {
    const quantityUnit = purchase.unit
      ? ` ${formatTechnicalLabel(purchase.unit)}`
      : '';

    pieces.push(
      `${purchase.quantity}${quantityUnit}`,
    );
  }

  if (purchase.packageSize !== undefined) {
    const packageUnit = purchase.packageUnit
      ? ` ${formatTechnicalLabel(purchase.packageUnit)}`
      : '';

    pieces.push(
      `${purchase.packageSize}${packageUnit} package`,
    );
  }

  return pieces.join(' · ');
}

export default function GrowingRecipeDetail({
  recipe,
  ingredients,
  products,
  growingSetups,
  plants,
  growingPlaces,
  purchases,
  backLabel,
  onBackToOrigin,
  onBack,
  onEdit,
  onDuplicate,
  onToggleFavourite,
  onSetRating,
  onArchive,
  onRestore,
  onDelete,
  onAddPurchase,
  onEditPurchase,
  onOpenGrowingPlace,
  onOpenPlant,
  onOpenIngredient,
  onOpenProduct,
  onOpenRecipe,
  onNavigate,
}: GrowingRecipeDetailProps) {
  void onOpenGrowingPlace;
  void growingPlaces;

  const [
    isRatingOpen,
    setIsRatingOpen,
  ] = useState(false);

  const recordNoun =
    getRecordNoun(recipe);

  const recordHeading =
    getRecordHeading(recipe);

  const recipeComponentIngredients =
    (recipe.recipeComponents ?? [])
      .filter(
        component =>
          component.sourceType === 'ingredient',
      )
      .map(component => {
        const ingredient =
          ingredients.find(
            item =>
              item.id === component.sourceId,
          );

        if (!ingredient) return undefined;

        return {
          ingredient,
          component,
        };
      })
      .filter(
        (
          item,
        ): item is {
          ingredient: Ingredient;
          component: RecipeComponent;
        } => Boolean(item),
      );

  const legacyRecipeIngredients =
    (recipe.ingredientIds ?? [])
      .map(ingredientId =>
        ingredients.find(
          ingredient =>
            ingredient.id === ingredientId,
        ),
      )
      .filter(
        (
          ingredient,
        ): ingredient is Ingredient =>
          Boolean(ingredient),
      );

  const recipeIngredients = [
    ...recipeComponentIngredients.map(
      item => ({
        ingredient: item.ingredient,
        component: item.component,
      }),
    ),

    ...legacyRecipeIngredients
      .filter(
        legacyIngredient =>
          !recipeComponentIngredients.some(
            item =>
              item.ingredient.id ===
              legacyIngredient.id,
          ),
      )
      .map(ingredient => ({
        ingredient,
        component: undefined,
      })),
  ];

  const recipeProducts =
    (recipe.recipeComponents ?? [])
      .filter(
        component =>
          component.sourceType === 'product',
      )
      .map(component => {
        const product =
          products.find(
            item =>
              item.id === component.sourceId,
          );

        if (!product) return undefined;

        return {
          product,
          component,
        };
      })
      .filter(
        (
          item,
        ): item is {
          product: GardenProduct;
          component: RecipeComponent;
        } => Boolean(item),
      );

  const recipeGrowingSetups =
    (recipe.recipeComponents ?? [])
      .filter(
        component =>
          component.sourceType ===
          'growing-setup',
      )
      .map(component => {
        const growingSetup =
          growingSetups.find(
            item =>
              item.id === component.sourceId,
          );

        if (!growingSetup) return undefined;

        return {
          growingSetup,
          component,
        };
      })
      .filter(
        (
          item,
        ): item is {
          growingSetup: GrowingSetup;
          component: RecipeComponent;
        } => Boolean(item),
      );

  const linkedPlants =
    plants.filter(plant => {
      const currentModern =
        plant.currentGrowingSetupIds?.includes(
          recipe.id,
        ) ?? false;

      const previousModern =
        plant.previousGrowingSetupIdsV2?.includes(
          recipe.id,
        ) ?? false;

      const historyModern =
        plant.growingHistory?.some(
          entry =>
            (entry.growingSetupIds?.includes(
              recipe.id,
            ) ?? false) ||
            entry.growingSetupId === recipe.id,
        ) ?? false;

      const legacy =
        plant.currentGrowingSetupId === recipe.id ||
        (plant.previousGrowingSetupIds?.includes(
          recipe.id,
        ) ?? false);

      return (
        currentModern ||
        previousModern ||
        historyModern ||
        legacy
      );
    });

  const linkedGrowingSetups =
    growingSetups.filter(
      otherSetup =>
        otherSetup.id !== recipe.id &&
        (otherSetup.recipeComponents?.some(
          component =>
            component.sourceType ===
              'growing-setup' &&
            component.sourceId === recipe.id,
        ) ?? false),
    );

  const relationshipCount =
    linkedPlants.length +
    linkedGrowingSetups.length;

  const recipePurchases =
    purchases
      .filter(
        purchase =>
          purchase.itemType ===
            'growing-setup' &&
          purchase.itemId === recipe.id,
      )
      .sort((first, second) =>
        second.date.localeCompare(first.date),
      );

  function handleChooseRating(
    rating: RecipeRating,
  ) {
    onSetRating(rating);
    setIsRatingOpen(false);
  }

  return (
    <GardenLayout
      activePage="library"
      onNavigate={onNavigate}
    >
      <div className="journal-page">
        <header className="journal-header">
          <div>
            <p className="section-label">
              {recipe.isArchived
                ? `Archived ${recordHeading}`
                : recordHeading}
            </p>

            <h1>{recipe.name}</h1>

            <p className="journal-intro">
              {getRecipeCategoryLabel(recipe)}
            </p>

            {recipe.isFavourite && (
              <p className="section-label">
                ★ Garden Favourite
              </p>
            )}

            {recipe.isArchived && (
              <p className="section-label">
                📦 Resting in Sprig&apos;s archive
              </p>
            )}
          </div>
        </header>

        {recipe.isArchived && (
          <section className="sprig-form-section">
            <p className="section-label">
              Archived
            </p>

            <h2>
              This {recordNoun} has been put away
            </h2>

            <p>
              It is no longer on your active
              What the Garden Grows In shelf,
              but Sprig has kept its history,
              photographs and garden connections.
            </p>

            {recipe.archivedAt && (
              <p className="form-whisper">
                Archived{' '}
                {formatRecipeDate(
                  recipe.archivedAt,
                )}
              </p>
            )}

            {onRestore && (
              <button
                type="button"
                className="journal-add-button"
                onClick={onRestore}
              >
                🌱 Restore this {recordNoun}
              </button>
            )}
          </section>
        )}

        <RecordActions
          contextualBackLabel={
            backLabel
              ? `Back to ${backLabel}`
              : undefined
          }
          onContextualBack={onBackToOrigin}
          backLabel="Growing Home"
          editLabel={`Edit ${recordHeading}`}
          duplicateLabel="Create a variation"
          rateLabel={
            recipe.rating
              ? 'Change rating'
              : `Rate this ${recordNoun}`
          }
          archiveLabel={`Archive this ${recordNoun}`}
          deleteLabel="Delete permanently"
          isFavourite={Boolean(
            recipe.isFavourite,
          )}
          rating={recipe.rating}
          onBack={onBack}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onRate={() =>
            setIsRatingOpen(
              current => !current,
            )
          }
          onFavourite={onToggleFavourite}
          onArchive={
            recipe.isArchived
              ? undefined
              : onArchive
          }
          onDelete={onDelete}
        />

        {isRatingOpen && (
          <section className="sprig-form-section">
            <p className="section-label">
              Your rating
            </p>

            <h2>
              How has this {recordNoun} worked
              for you?
            </h2>

            <p>
              Give it a place from one to five
              stars. You can change the rating
              whenever the garden teaches you
              something new.
            </p>

            <div
              className="sprig-rating-picker"
              role="group"
              aria-label={`Rate this ${recordHeading}`}
            >
              {(
                [1, 2, 3, 4, 5] as RecipeRating[]
              ).map(rating => (
                <button
                  key={rating}
                  type="button"
                  className="sprig-rating-star"
                  aria-label={`${rating} ${
                    rating === 1
                      ? 'star'
                      : 'stars'
                  }`}
                  aria-pressed={
                    recipe.rating === rating
                  }
                  onClick={() =>
                    handleChooseRating(rating)
                  }
                >
                  {recipe.rating &&
                  rating <= recipe.rating
                    ? '★'
                    : '☆'}
                </button>
              ))}
            </div>

            {recipe.rating && (
              <p className="form-whisper">
                Currently rated {recipe.rating} out of 5.
              </p>
            )}
          </section>
        )}

        <section className="library-grid">
          <article className="library-book">
            <p className="section-label">Details</p>
            <h2>{recipe.name}</h2>

            <p>
              Added {formatRecipeDate(recipe.createdAt)}
            </p>

            {recipe.updatedAt && (
              <p>
                Last updated{' '}
                {formatRecipeDate(recipe.updatedAt)}
              </p>
            )}

            {recipe.isArchived &&
              recipe.archivedAt && (
                <p>
                  Archived{' '}
                  {formatRecipeDate(
                    recipe.archivedAt,
                  )}
                </p>
              )}

            <p>
              Type: {getRecipeCategoryLabel(recipe)}
            </p>

            {recipe.rating && (
              <p>
                Rating:{' '}
                {'★'.repeat(recipe.rating)}{' '}
                {recipe.rating}/5
              </p>
            )}

            {recipe.isFavourite && (
              <p>★ Garden Favourite</p>
            )}

            {recipe.isArchived && (
              <p>📦 Archived</p>
            )}

            {recipe.brand && (
              <p>Brand: {recipe.brand}</p>
            )}

            {recipe.productName && (
              <p>
                Product: {recipe.productName}
              </p>
            )}

            {recipe.groundType && (
              <p>
                Ground type:{' '}
                {formatTechnicalLabel(
                  recipe.groundType,
                )}
              </p>
            )}

            {recipe.growingSystemType && (
              <p>
                Growing system:{' '}
                {formatTechnicalLabel(
                  recipe.growingSystemType,
                )}
              </p>
            )}
          </article>

          {recipe.category === 'bought-mix' && (
            <article className="library-book">
              <p className="section-label">
                Purchase history
              </p>

              <h2>What it has cost</h2>

              {recipePurchases.length > 0 ? (
                <>
                  <p>
                    Sprig remembers{' '}
                    {recipePurchases.length}{' '}
                    {recipePurchases.length === 1
                      ? 'purchase'
                      : 'purchases'}{' '}
                    for this Bought Mix.
                  </p>

                  <ul className="sprig-purchase-history">
                    {recipePurchases.map(
                      purchase => {
                        const amountLabel =
                          getPurchaseAmountLabel(
                            purchase,
                          );

                        return (
                          <li key={purchase.id}>
                            <strong>
                              {formatPurchasePrice(
                                purchase,
                              )}
                            </strong>

                            {' · '}
                            {formatRecipeDate(
                              purchase.date,
                            )}

                            {purchase.supplier && (
                              <>
                                {' · '}
                                {purchase.supplier}
                              </>
                            )}

                            {amountLabel && (
                              <>
                                {' · '}
                                {amountLabel}
                              </>
                            )}

                            {purchase.notes && (
                              <p className="form-whisper">
                                {purchase.notes}
                              </p>
                            )}

                            {onEditPurchase && (
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                  onEditPurchase(
                                    purchase,
                                  )
                                }
                              >
                                ✏️ Edit purchase
                              </button>
                            )}
                          </li>
                        );
                      },
                    )}
                  </ul>
                </>
              ) : (
                <p>
                  No purchase history has been
                  recorded for this Bought Mix yet.
                </p>
              )}

              {onAddPurchase && (
                <button
                  type="button"
                  className="journal-add-button"
                  onClick={onAddPurchase}
                >
                  + Add another purchase
                </button>
              )}

              <p className="form-whisper">
                Each purchase stays separate so
                Sprig can remember changing prices,
                suppliers and package sizes over time.
              </p>
            </article>
          )}

          {recipe.category === 'own-mix' && (
            <article className="library-book">
              <p className="section-label">
                Recipe contents
              </p>

              <h2>What&apos;s in this recipe</h2>

              {recipeIngredients.length === 0 &&
              recipeProducts.length === 0 &&
              recipeGrowingSetups.length === 0 ? (
                <p>
                  Nothing has been added to this
                  recipe yet.
                </p>
              ) : (
                <>
                  {recipeIngredients.length > 0 && (
                    <section className="sprig-form-section">
                      <p className="section-label">
                        Ingredients
                      </p>

                      <div className="sprig-ingredient-list">
                        {recipeIngredients.map(
                          item => {
                            const measurement =
                              getRecipeComponentMeasurementLabel(
                                item.component,
                              );

                            return (
                              <button
                                key={item.ingredient.id}
                                type="button"
                                className="sprig-ingredient-chip"
                                onClick={() =>
                                  onOpenIngredient(
                                    item.ingredient.id,
                                  )
                                }
                              >
                                🌿 {item.ingredient.name}

                                {measurement && (
                                  <>
                                    {' · '}
                                    {measurement}
                                  </>
                                )}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </section>
                  )}

                  {recipeProducts.length > 0 && (
                    <section className="sprig-form-section">
                      <p className="section-label">
                        Bought products
                      </p>

                      <div className="sprig-ingredient-list">
                        {recipeProducts.map(item => {
                          const measurement =
                            getRecipeComponentMeasurementLabel(
                              item.component,
                            );

                          return (
                            <button
                              key={item.product.id}
                              type="button"
                              className="sprig-ingredient-chip"
                              onClick={() =>
                                onOpenProduct(
                                  item.product.id,
                                )
                              }
                            >
                              🧺 {item.product.name}

                              {item.product.brand && (
                                <>
                                  {' · '}
                                  {item.product.brand}
                                </>
                              )}

                              {measurement && (
                                <>
                                  {' · '}
                                  {measurement}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {recipeGrowingSetups.length > 0 && (
                    <section className="sprig-form-section">
                      <p className="section-label">
                        Other growing records
                      </p>

                      <div className="sprig-ingredient-list">
                        {recipeGrowingSetups.map(
                          item => {
                            const measurement =
                              getRecipeComponentMeasurementLabel(
                                item.component,
                              );

                            return (
                              <button
                                key={
                                  item.growingSetup.id
                                }
                                type="button"
                                className="sprig-ingredient-chip"
                                onClick={() =>
                                  onOpenRecipe(
                                    item.growingSetup.id,
                                  )
                                }
                              >
                                🌱 {item.growingSetup.name}

                                {measurement && (
                                  <>
                                    {' · '}
                                    {measurement}
                                  </>
                                )}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </section>
                  )}
                </>
              )}
            </article>
          )}

          <article className="library-book">
            <p className="section-label">Notes</p>
            <h2>What Sprig remembers</h2>

            {recipe.notes ? (
              <p>{recipe.notes}</p>
            ) : (
              <p>
                No notes have been tucked into this{' '}
                {recordNoun} yet.
              </p>
            )}
          </article>

          <article className="library-book">
            <p className="section-label">
              Photographs
            </p>

            <SprigPhotoGallery
              photoUrls={recipe.photoUrls ?? []}
              title={`${recordHeading} photographs`}
              emptyMessage={`No photographs have been tucked into this ${recordNoun} yet.`}
              photoAltPrefix={`${recipe.name} photograph`}
            />
          </article>

          <article className="library-book">
            <p className="section-label">
              Plant Stories
            </p>

            <h2>Plants grown with this</h2>

            {linkedPlants.length > 0 ? (
              <ul>
                {linkedPlants.map(plant => (
                  <li key={plant.id}>
                    <button
                      type="button"
                      className="record-link-button"
                      onClick={() =>
                        onOpenPlant(plant.id)
                      }
                    >
                      🌱 {plant.displayName}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No Plant Stories are currently
                connected to this {recordNoun}.
              </p>
            )}
          </article>

          {linkedGrowingSetups.length > 0 && (
            <article className="library-book">
              <p className="section-label">
                Growing Recipes
              </p>

              <h2>Used inside other recipes</h2>

              <p>
                This {recordNoun} is also a
                component in:
              </p>

              <ul>
                {linkedGrowingSetups.map(
                  linkedSetup => (
                    <li key={linkedSetup.id}>
                      <button
                        type="button"
                        className="record-link-button"
                        onClick={() =>
                          onOpenRecipe(
                            linkedSetup.id,
                          )
                        }
                      >
                        🌿 {linkedSetup.name}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </article>
          )}

          <article className="library-book">
            <p className="section-label">
              Place and growing setup
            </p>

            <h2>
              Where is remembered separately
            </h2>

            <p>
              This record describes what a plant
              grows in. Growing Places describe
              where the plant physically lives
              in the garden.
            </p>

            <p className="form-whisper">
              A Plant Story brings those facts
              together, so Sprig can remember
              that a plant grew in this{' '}
              {recordNoun} while living in its
              own Growing Place.
            </p>
          </article>

          <article className="library-book">
            <p className="section-label">
              Garden connections
            </p>

            <h2>Where this record reaches</h2>

            {relationshipCount > 0 ? (
              <>
                <p>
                  This {recordNoun} is connected
                  to {relationshipCount}{' '}
                  {relationshipCount === 1
                    ? 'garden record'
                    : 'garden records'}.
                </p>

                {linkedPlants.length > 0 && (
                  <p>
                    {linkedPlants.length}{' '}
                    {linkedPlants.length === 1
                      ? 'Plant Story'
                      : 'Plant Stories'}
                  </p>
                )}

                {linkedGrowingSetups.length > 0 && (
                  <p>
                    {linkedGrowingSetups.length}{' '}
                    {linkedGrowingSetups.length === 1
                      ? 'Growing Recipe uses it'
                      : 'Growing Recipes use it'}
                  </p>
                )}

                <p className="form-whisper">
                  These relationships are why
                  Sprig preserves archived records
                  rather than throwing their
                  history away.
                </p>
              </>
            ) : (
              <>
                <p>
                  This {recordNoun} does not
                  currently have any Plant Story
                  or Growing Recipe connections.
                </p>

                <p className="form-whisper">
                  A growing record with no
                  connections can be permanently
                  removed if you no longer want
                  to keep it.
                </p>
              </>
            )}
          </article>
        </section>
      </div>
    </GardenLayout>
  );
}