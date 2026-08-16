import type {
    Dispatch,
    SetStateAction,
  } from 'react'
  
  import SprigPicker from '../sprig/SprigPicker'
  
  import type {
    Ingredient,
  } from '../../types'
  
  
  interface OwnMixSectionProps {
    ownMixName: string
  
    setOwnMixName: Dispatch<
      SetStateAction<string>
    >
  
    ownMixCreatedDate: string
  
    setOwnMixCreatedDate: Dispatch<
      SetStateAction<string>
    >
  
    ownMixNotes: string
  
    setOwnMixNotes: Dispatch<
      SetStateAction<string>
    >
  
    /*
     * =======================================
     * INGREDIENT LIBRARY
     * =======================================
     *
     * These are real Ingredient records from
     * GardenData.ingredients.
     */
    ingredients: Ingredient[]
  
    selectedIngredientIds: string[]
  
    setSelectedIngredientIds: Dispatch<
      SetStateAction<string[]>
    >
  
    /*
     * The parent creates and saves the real
     * Ingredient record.
     *
     * Returning the new ID lets SprigPicker
     * select it immediately.
     */
    onCreateIngredient: (
      name: string,
    ) => string | undefined
  }
  
  
  function getIngredientCategoryLabel(
    ingredient: Ingredient,
  ): string | undefined {
    /*
     * Custom categories belong to the gardener.
     * If one exists, always show their wording.
     */
    if (
      ingredient.customCategoryLabel
        ?.trim()
    ) {
      return ingredient
        .customCategoryLabel
        .trim()
    }
  
    switch (ingredient.category) {
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
        return undefined
    }
  }
  
  
  export default function OwnMixSection({
    ownMixName,
    setOwnMixName,
  
    ownMixCreatedDate,
    setOwnMixCreatedDate,
  
    ownMixNotes,
    setOwnMixNotes,
  
    ingredients,
  
    selectedIngredientIds,
    setSelectedIngredientIds,
  
    onCreateIngredient,
  }: OwnMixSectionProps) {
  
  
    /* =======================================
       INGREDIENT SELECTION
    ======================================= */
  
    function toggleIngredient(
      ingredientId: string,
    ) {
      setSelectedIngredientIds(
        (currentIds) => {
          const isAlreadySelected =
            currentIds.includes(
              ingredientId,
            )
  
          if (isAlreadySelected) {
            return currentIds.filter(
              (id) =>
                id !== ingredientId,
            )
          }
  
          return [
            ...currentIds,
            ingredientId,
          ]
        },
      )
    }
  
  
    const ingredientOptions =
      ingredients.map(
        (ingredient) => ({
          value: ingredient.id,
  
          label: ingredient.name,
  
          subtitle:
            getIngredientCategoryLabel(
              ingredient,
            ),
  
          meta:
            ingredient.manufacturer ||
            ingredient.source ||
            undefined,
        }),
      )
  
  
    return (
      <section className="sprig-form-section growing-setup-details">
  
        {/* =======================================
            MIX NAME
        ======================================= */}
  
        <label>
          What do you call this mix?
  
          <input
            type="text"
            value={ownMixName}
            onChange={(event) =>
              setOwnMixName(
                event.target.value,
              )
            }
            placeholder="Tomato Mix, Mix 1..."
            required
          />
        </label>
  
  
        {/* =======================================
            CREATED DATE
        ======================================= */}
  
        <label>
          When did you make this mix?
  
          <input
            type="date"
            value={ownMixCreatedDate}
            onChange={(event) =>
              setOwnMixCreatedDate(
                event.target.value,
              )
            }
          />
        </label>
  
  
        {/* =======================================
            INGREDIENTS
        ======================================= */}
  
        <SprigPicker
          title="What's in this mix?"
          variant="label-tall"
          emptySummary="Choose ingredients"
          options={ingredientOptions}
          selectedValues={
            selectedIngredientIds
          }
          isOpen={true}
          showTrigger={false}
          onToggleOpen={() => {}}
          onToggleValue={
            toggleIngredient
          }
          allowCustomOption
          customOptionLabel="Create a new ingredient..."
          customInputLabel="What would you like to call this ingredient?"
          customInputPlaceholder="Homemade compost, Perlite, Guinea Pig Manure..."
          onCreateCustomOption={
            onCreateIngredient
          }
        />
  
  
        {/* =======================================
            SELECTED INGREDIENT SUMMARY
        ======================================= */}
  
        {selectedIngredientIds.length >
          0 && (
          <div className="sprig-ingredient-list">
            {selectedIngredientIds.map(
              (ingredientId) => {
                const ingredient =
                  ingredients.find(
                    (item) =>
                      item.id ===
                      ingredientId,
                  )
  
                if (!ingredient) {
                  return null
                }
  
                return (
                  <button
                    key={ingredient.id}
                    type="button"
                    className="sprig-ingredient-chip"
                    onClick={() =>
                      toggleIngredient(
                        ingredient.id,
                      )
                    }
                    aria-label={`Remove ${ingredient.name}`}
                  >
                    ✓ {ingredient.name}
                  </button>
                )
              },
            )}
          </div>
        )}
  
  
        {/* =======================================
            MIX NOTES
        ======================================= */}
  
        <label>
          Notes to this mix
  
          <textarea
            value={ownMixNotes}
            onChange={(event) =>
              setOwnMixNotes(
                event.target.value,
              )
            }
            placeholder="Ratios, quantities, changes, observations..."
            rows={4}
          />
        </label>
  
      </section>
    )
  }