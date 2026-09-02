import GardenLayout from '../components/layout/GardenLayout';
import RecordActions from '../components/common/RecordActions';
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery';
import type { AppPage } from '../types/navigation';
import type { GrowingSetup, Ingredient, IngredientCategory, PurchaseRecord } from '../types';

interface IngredientDetailProps {
  ingredient: Ingredient;
  recipes: GrowingSetup[];
  purchases: PurchaseRecord[];
  onBack: () => void;
  backLabel?: string;
  onBackToOrigin?: () => void;
  onEdit?: () => void;
  onCreateVariation?: () => void;
  onToggleFavourite?: () => void;
  onSetRating?: (rating: number) => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
  onAddPurchase?: () => void;
  onEditPurchase?: (purchase: PurchaseRecord) => void;
  onOpenRecipe: (recipeId: string) => void;
  onNavigate: (page: AppPage) => void;
}

function getIngredientCategoryLabel(ingredient: Ingredient): string {
  if (ingredient.customCategoryLabel?.trim()) {
    return ingredient.customCategoryLabel.trim();
  }

  return getStandardCategoryLabel(ingredient.category);
}

function getStandardCategoryLabel(category?: IngredientCategory): string {
  switch (category) {
    case 'compost':
      return 'Compost';
    case 'manure':
      return 'Manure';
    case 'organic-matter':
      return 'Organic Matter';
    case 'minerals':
      return 'Minerals';
    case 'aeration':
      return 'Aeration';
    case 'water-retention':
      return 'Water Retention';
    case 'amendments':
      return 'Amendments';
    case 'fertiliser':
      return 'Fertiliser';
    case 'biological-additives':
      return 'Biological Additives';
    case 'ph-adjusters':
      return 'pH Adjusters';
    case 'structure-bulk':
      return 'Structure / Bulk';
    case 'growing-medium':
      return 'Growing Medium';
    case 'mulch':
      return 'Mulch';
    case 'other':
      return 'Other';
    default:
      return 'Garden Ingredient';
  }
}

function formatIngredientDate(date?: string): string {
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

function formatPurchaseDate(date: string): string {
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

function formatPurchasePrice(purchase: PurchaseRecord): string {
  const currency = purchase.currency ?? 'AUD';

  try {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency,
    }).format(purchase.pricePaid);
  } catch {
    return `$${purchase.pricePaid.toFixed(2)}`;
  }
}

function formatPurchaseUnit(unit?: string): string {
  if (!unit) return '';

  switch (unit) {
    case 'each':
      return 'each';
    case 'litre':
      return 'litre';
    case 'millilitre':
      return 'millilitre';
    case 'kilogram':
      return 'kilogram';
    case 'gram':
      return 'gram';
    case 'bag':
      return 'bag';
    case 'packet':
      return 'packet';
    case 'box':
      return 'box';
    case 'bottle':
      return 'bottle';
    case 'tub':
      return 'tub';
    case 'tray':
      return 'tray';
    case 'metre':
      return 'metre';
    case 'centimetre':
      return 'centimetre';
    default:
      return unit;
  }
}

function getPurchaseSummary(purchase: PurchaseRecord): string {
  const parts: string[] = [];

  parts.push(formatPurchasePrice(purchase));
  parts.push(formatPurchaseDate(purchase.date));

  if (purchase.supplier?.trim()) {
    parts.push(purchase.supplier.trim());
  }

  if (purchase.quantity !== undefined) {
    const quantityUnit = formatPurchaseUnit(purchase.unit);
    parts.push(
      quantityUnit
        ? `${purchase.quantity} ${quantityUnit}`
        : String(purchase.quantity),
    );
  }

  if (purchase.packageSize !== undefined) {
    const packageUnit = formatPurchaseUnit(purchase.packageUnit);

    parts.push(
      packageUnit
        ? `${purchase.packageSize} ${packageUnit} package`
        : `${purchase.packageSize} package`,
    );
  }

  return parts.join(' · ');
}

export default function IngredientDetail({
  ingredient,
  recipes,
  purchases,
  onBack,
  backLabel,
  onBackToOrigin,
  onEdit,
  onCreateVariation,
  onToggleFavourite,
  onSetRating,
  onArchive,
  onRestore,
  onDelete,
  onAddPurchase,
  onEditPurchase,
  onOpenRecipe,
  onNavigate,
}: IngredientDetailProps) {
  const categoryLabel = getIngredientCategoryLabel(ingredient);

  const linkedRecipes = recipes.filter(
    recipe =>
      (recipe.ingredientIds?.includes(ingredient.id) ?? false) ||
      (recipe.recipeComponents?.some(
        component =>
          component.sourceType === 'ingredient' &&
          component.sourceId === ingredient.id,
      ) ?? false),
  );

  const ingredientPurchases = purchases
    .filter(
      purchase =>
        purchase.itemType === 'ingredient' &&
        purchase.itemId === ingredient.id,
    )
    .sort((firstPurchase, secondPurchase) =>
      secondPurchase.date.localeCompare(firstPurchase.date),
    );

  function handleRate() {
    if (!onSetRating) return;

    const currentRating = ingredient.rating ?? 0;

    const answer = window.prompt(
      'How many stars would you give this Ingredient? Enter 1 to 5.',
      currentRating > 0 ? String(currentRating) : '',
    );

    if (answer === null) return;

    const nextRating = Number(answer);

    if (
      !Number.isInteger(nextRating) ||
      nextRating < 1 ||
      nextRating > 5
    ) {
      window.alert('Please choose a whole number from 1 to 5.');
      return;
    }

    onSetRating(nextRating);
  }

  return (
    <GardenLayout activePage="library" onNavigate={onNavigate}>
      <div className="journal-page">
        <header className="journal-header">
          <div>
            <p className="section-label">Garden Ingredient</p>
            <h1>{ingredient.name}</h1>
            <p className="journal-intro">{categoryLabel}</p>
          </div>
        </header>

        <RecordActions
          onBack={onBack}
          backLabel="Growing Home"
          contextualBackLabel={
            backLabel
              ? `Back to ${backLabel}`
              : undefined
          }
          onContextualBack={onBackToOrigin}
          onEdit={onEdit}
          duplicateLabel="Create a variation"
          onDuplicate={onCreateVariation}
          onRate={handleRate}
          rating={ingredient.rating}
          onFavourite={onToggleFavourite}
          isFavourite={Boolean(ingredient.isFavourite)}
          onArchive={onArchive}
          onRestore={onRestore}
          onDelete={onDelete}
        />

        <section className="library-grid">
          <article className="library-book">
            <p className="section-label">Ingredient details</p>
            <h2>{ingredient.name}</h2>

            <p>
              <strong>Category:</strong>{' '}
              {categoryLabel}
            </p>

            {ingredient.manufacturer && (
              <p>
                <strong>Maker:</strong>{' '}
                {ingredient.manufacturer}
              </p>
            )}

            {ingredient.source && (
              <p>
                <strong>From:</strong>{' '}
                {ingredient.source}
              </p>
            )}

            <p>
              <strong>Added:</strong>{' '}
              {formatIngredientDate(ingredient.createdAt)}
            </p>

            {ingredient.updatedAt && (
              <p>
                <strong>Last updated:</strong>{' '}
                {formatIngredientDate(ingredient.updatedAt)}
              </p>
            )}

            {typeof ingredient.rating === 'number' && (
              <p>
                <strong>Rating:</strong>{' '}
                {'★'.repeat(ingredient.rating)}
                {'☆'.repeat(Math.max(0, 5 - ingredient.rating))}
              </p>
            )}

            {ingredient.isFavourite && (
              <p className="section-label">
                ★ Garden Favourite
              </p>
            )}

            {ingredient.isArchived && (
              <p className="section-label">
                Archived
              </p>
            )}
          </article>

          <article className="library-book">
            <p className="section-label">Notes</p>
            <h2>What Sprig remembers</h2>

            {ingredient.notes ? (
              <p>{ingredient.notes}</p>
            ) : (
              <p>
                No notes have been tucked into this Ingredient yet.
              </p>
            )}
          </article>

          <article className="library-book">
            <p className="section-label">Photographs</p>

            <SprigPhotoGallery
              photoUrls={ingredient.photoUrls ?? []}
              title="Ingredient photographs"
              emptyMessage="No photographs have been tucked into this Ingredient yet."
              photoAltPrefix={`${ingredient.name} photograph`}
            />
          </article>

          <article className="library-book">
            <p className="section-label">Growing Recipes</p>
            <h2>Where this Ingredient is used</h2>

            {linkedRecipes.length > 0 ? (
              <>
                <p>
                  This Ingredient appears in {linkedRecipes.length}{' '}
                  {linkedRecipes.length === 1
                    ? 'Growing Recipe'
                    : 'Growing Recipes'}.
                </p>

                <ul>
                  {linkedRecipes.map(recipe => (
                    <li key={recipe.id}>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => onOpenRecipe(recipe.id)}
                      >
                        {recipe.name}
                        {recipe.isArchived ? ' · Archived' : ''}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>
                This Ingredient has not been added to a Growing Recipe yet.
              </p>
            )}
          </article>

          <article className="library-book">
            <p className="section-label">Purchase history</p>
            <h2>What it has cost</h2>

            {ingredientPurchases.length > 0 ? (
              <>
                <p>
                  Sprig remembers {ingredientPurchases.length}{' '}
                  {ingredientPurchases.length === 1
                    ? 'purchase'
                    : 'purchases'}{' '}
                  for this Ingredient.
                </p>

                <ul>
                  {ingredientPurchases.map(purchase => (
                    <li key={purchase.id}>
                      <div>{getPurchaseSummary(purchase)}</div>

                      {purchase.notes && (
                        <p className="form-whisper">
                          {purchase.notes}
                        </p>
                      )}

                      {onEditPurchase && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => onEditPurchase(purchase)}
                        >
                          ✏️ Edit purchase
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>
                No purchase history has been recorded for this Ingredient yet.
              </p>
            )}

            {onAddPurchase && (
              <button
                type="button"
                className="primary-button"
                onClick={onAddPurchase}
              >
                + Add another purchase
              </button>
            )}

            <p className="form-whisper">
              Each purchase stays separate so Sprig can remember changing
              prices, suppliers and package sizes over time.
            </p>
          </article>

          <article className="library-book">
            <p className="section-label">Ingredient shelf</p>
            <h2>Keep or tuck away</h2>

            <p>
              Archive Ingredients you no longer use while keeping their notes,
              photographs, Growing Recipe connections and purchase history.
            </p>
          </article>
        </section>
      </div>
    </GardenLayout>
  );
}