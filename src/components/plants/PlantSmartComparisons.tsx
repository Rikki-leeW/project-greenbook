import type {
    GrowingPlace,
    PlantStory,
  } from '../../types'
  
  
  interface PlantSmartComparisonsProps {
    plant:
      PlantStory
  
    plants:
      PlantStory[]
  
    growingPlaces:
      GrowingPlace[]
  
    onOpenPlant: (
      plantId:
        string,
    ) => void
  
    onComparePlants: (
      plantIds:
        string[],
    ) => void
  }
  
  
  interface SimilarPlantStory {
    plant:
      PlantStory
  
    score:
      number
  
    reasons:
      string[]
  }
  
  
  /* =======================================
     NORMALISE
  ======================================= */
  
  function normalise(
    value:
      string | undefined,
  ): string {
    return (
      value ??
      ''
    )
      .trim()
      .toLocaleLowerCase()
  }
  
  
  /* =======================================
     DAYS BETWEEN
  ======================================= */
  
  function getDaysBetween(
    first:
      string,
  
    second:
      string,
  ): number {
    const firstDate =
      new Date(
        `${first}T00:00:00`,
      )
  
    const secondDate =
      new Date(
        `${second}T00:00:00`,
      )
  
    return Math.abs(
      Math.round(
        (
          firstDate.getTime() -
          secondDate.getTime()
        ) /
          (
            1000 *
            60 *
            60 *
            24
          ),
      ),
    )
  }
  
  
  /* =======================================
     GROWING SETUP IDS
  ======================================= */
  
  function getGrowingSetupIds(
    plant:
      PlantStory,
  ): string[] {
    return Array.from(
      new Set(
        [
          plant.currentGrowingSetupId ??
            '',
  
          ...(
            plant.currentGrowingSetupIds ??
            []
          ),
  
          ...(
            plant.previousGrowingSetupIds ??
            []
          ),
  
          ...(
            plant.previousGrowingSetupIdsV2 ??
            []
          ),
  
          ...(
            plant.growingHistory ??
            []
          ).flatMap(
            historyEntry => [
              historyEntry.growingSetupId ??
                '',
  
              ...(
                historyEntry.growingSetupIds ??
                []
              ),
            ],
          ),
        ].filter(
          Boolean,
        ),
      ),
    )
  }
  
  
  /* =======================================
     SIMILARITY
  ======================================= */
  
  function getSimilarity(
    plant:
      PlantStory,
  
    candidate:
      PlantStory,
  ): SimilarPlantStory | null {
    if (
      plant.id ===
      candidate.id
    ) {
      return null
    }
  
  
    const sameCrop =
      normalise(
        plant.plantName,
      ) ===
      normalise(
        candidate.plantName,
      )
  
  
    /*
     * Crop identity is the minimum useful
     * comparison boundary for this first
     * Sprig Smart pass.
     *
     * Sprig may eventually notice useful
     * cross-crop patterns, but it should not
     * manufacture noisy "similar" stories
     * merely because two unrelated plants
     * happened to share a pot or date.
     */
    if (
      !sameCrop
    ) {
      return null
    }
  
  
    let score =
      4
  
  
    const reasons:
      string[] = [
        'Same crop',
      ]
  
  
    const sameVariety =
      Boolean(
        plant.variety?.trim(),
      ) &&
      Boolean(
        candidate.variety?.trim(),
      ) &&
      normalise(
        plant.variety,
      ) ===
        normalise(
          candidate.variety,
        )
  
  
    if (
      sameVariety
    ) {
      score +=
        6
  
      reasons.push(
        'same variety',
      )
    }
  
  
    if (
      plant.basedOnPlantStoryId ===
        candidate.id ||
      candidate.basedOnPlantStoryId ===
        plant.id ||
      (
        plant.basedOnPlantStoryId &&
        candidate.basedOnPlantStoryId &&
        plant.basedOnPlantStoryId ===
          candidate.basedOnPlantStoryId
      )
    ) {
      score +=
        5
  
      reasons.push(
        'related variation',
      )
    }
  
  
    if (
      plant.currentGrowingPlaceId &&
      candidate.currentGrowingPlaceId &&
      plant.currentGrowingPlaceId ===
        candidate.currentGrowingPlaceId
    ) {
      score +=
        3
  
      reasons.push(
        'same Growing Place',
      )
    }
  
  
    const plantSetupIds =
      getGrowingSetupIds(
        plant,
      )
  
  
    const candidateSetupIds =
      getGrowingSetupIds(
        candidate,
      )
  
  
    const sharesGrowingSetup =
      plantSetupIds.some(
        setupId =>
          candidateSetupIds.includes(
            setupId,
          ),
      )
  
  
    if (
      sharesGrowingSetup
    ) {
      score +=
        3
  
      reasons.push(
        'same growing setup',
      )
    }
  
  
    if (
      plant.startMethod ===
      candidate.startMethod
    ) {
      score +=
        2
  
      reasons.push(
        'same start method',
      )
    }
  
  
    const plantingGap =
      getDaysBetween(
        plant.plantedDate,
        candidate.plantedDate,
      )
  
  
    if (
      plantingGap <=
      7
    ) {
      score +=
        3
  
      reasons.push(
        plantingGap ===
        0
          ? 'planted the same day'
          : `planted ${plantingGap} ${
              plantingGap ===
              1
                ? 'day'
                : 'days'
            } apart`,
      )
    } else if (
      plantingGap <=
      30
    ) {
      score +=
        2
  
      reasons.push(
        `planted ${plantingGap} days apart`,
      )
    } else if (
      plantingGap <=
      60
    ) {
      score +=
        1
  
      reasons.push(
        'similar planting period',
      )
    }
  
  
    if (
      plant.status ===
      candidate.status
    ) {
      score +=
        1
    }
  
  
    /*
     * Crop match alone is allowed because
     * another story of the same crop can still
     * be useful when its growing conditions
     * differ. Those differences are often the
     * interesting part of comparison.
     */
    return {
      plant:
        candidate,
  
      score,
  
      reasons,
    }
  }
  
  
  /* =======================================
     PLACE NAME
  ======================================= */
  
  function getGrowingPlaceName(
    plant:
      PlantStory,
  
    growingPlaces:
      GrowingPlace[],
  ): string | undefined {
    if (
      !plant.currentGrowingPlaceId
    ) {
      return undefined
    }
  
    return growingPlaces.find(
      place =>
        place.id ===
        plant.currentGrowingPlaceId,
    )?.name
  }
  
  
  /* =======================================
     SMART COMPARISONS
  ======================================= */
  
  export default function PlantSmartComparisons({
    plant,
    plants,
    growingPlaces,
    onOpenPlant,
    onComparePlants,
  }: PlantSmartComparisonsProps) {
    const matches =
      plants
        .map(
          candidate =>
            getSimilarity(
              plant,
              candidate,
            ),
        )
        .filter(
          (
            match,
          ): match is SimilarPlantStory =>
            Boolean(
              match,
            ),
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.score -
            first.score,
        )
        .slice(
          0,
          3,
        )
  
  
    if (
      matches.length ===
      0
    ) {
      return null
    }
  
  
    const compareAllIds =
      [
        plant.id,
  
        ...matches.map(
          match =>
            match.plant.id,
        ),
      ]
  
  
    return (
      <section className="story-section sprig-smart-comparisons">
        <div className="section-heading">
          <div>
            <p className="section-label">
              Sprig noticed
            </p>
  
            <h2>
              Stories worth comparing
            </h2>
          </div>
        </div>
  
  
        <p className="journal-intro sprig-smart-intro">
          These stories share enough with this
          one to make a closer look useful.
          Sprig is showing why each was chosen,
          rather than pretending similarity
          means the plants behaved the same.
        </p>
  
  
        <div className="sprig-smart-comparison-list">
          {matches.map(
            match => {
              const growingPlaceName =
                getGrowingPlaceName(
                  match.plant,
                  growingPlaces,
                )
  
  
              return (
                <article
                  key={
                    match.plant.id
                  }
                  className="sprig-smart-comparison-card"
                >
                  <div className="sprig-smart-comparison-main">
                    <div>
                      <p className="sprig-smart-comparison-crop">
                        {match.plant.plantName}
  
                        {growingPlaceName
                          ? ` · ${growingPlaceName}`
                          : ''}
                      </p>
  
                      <h3>
                        {match.plant.displayName}
                      </h3>
                    </div>
  
  
                    <div className="sprig-smart-reasons">
                      {match.reasons.map(
                        reason => (
                          <span
                            key={
                              reason
                            }
                          >
                            {reason}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
  
  
                  <div className="sprig-smart-comparison-actions">
                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        onOpenPlant(
                          match.plant.id,
                        )
                      }
                    >
                      Open story →
                    </button>
  
  
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        onComparePlants([
                          plant.id,
                          match.plant.id,
                        ])
                      }
                    >
                      Compare these two
                    </button>
                  </div>
                </article>
              )
            },
          )}
        </div>
  
  
        {matches.length >
          1 && (
          <div className="sprig-smart-compare-all">
            <button
              type="button"
              className="journal-add-button"
              onClick={() =>
                onComparePlants(
                  compareAllIds,
                )
              }
            >
              Compare all {
                compareAllIds.length
              } stories →
            </button>
          </div>
        )}
      </section>
    )
  }