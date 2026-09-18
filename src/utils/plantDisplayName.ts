import type {
    PlantStory,
  } from '../types'
  
  
  /* =======================================
     PLANT DISPLAY NAME
  
     Human-readable Plant Story naming used
     throughout Garden of Mine.
  
     Garden records keep crop/type and variety
     as separate facts. Presentation combines
     them consistently without changing the
     underlying record.
  ======================================= */
  
  function normalisePlantNamePart(
    value?: string,
  ): string {
    return value?.trim() ?? ''
  }
  
  
  function includesWholeName(
    value: string,
    otherValue: string,
  ): boolean {
    if (
      !value ||
      !otherValue
    ) {
      return false
    }
  
    return value
      .toLocaleLowerCase()
      .includes(
        otherValue.toLocaleLowerCase(),
      )
  }
  
  
  export function getPlantDisplayName(
    plant: Pick<
      PlantStory,
      | 'plantName'
      | 'variety'
      | 'displayName'
    >,
  ): string {
    const plantName =
      normalisePlantNamePart(
        plant.plantName,
      )
  
    const variety =
      normalisePlantNamePart(
        plant.variety,
      )
  
    /*
     * Variety + crop is the preferred human
     * identity:
     *
     * Royal Blue Potato
     * Marketmore Cucumber
     * Ox Heart Tomato
     *
     * If either field already contains the
     * other, do not repeat it.
     */
    if (
      variety &&
      plantName
    ) {
      if (
        includesWholeName(
          variety,
          plantName,
        )
      ) {
        return variety
      }
  
      if (
        includesWholeName(
          plantName,
          variety,
        )
      ) {
        return plantName
      }
  
      return `${variety} ${plantName}`
    }
  
    if (
      variety
    ) {
      return variety
    }
  
    if (
      plantName
    ) {
      return plantName
    }
  
    /*
     * Compatibility fallback for older records
     * whose useful human name may only exist in
     * displayName.
     */
    const legacyDisplayName =
      normalisePlantNamePart(
        plant.displayName,
      )
  
    return (
      legacyDisplayName ||
      'Plant Story'
    )
  }
  
