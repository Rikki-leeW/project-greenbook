import type {
  GardenData,
  SavedComparison,
} from '../types'

import {
  sampleGardenData,
} from '../data/sampleData'

const STORAGE_KEY = 'sprig-garden-data'

/* =======================================
   LEGACY SAVED COMPARISON
======================================= */

/*
 * Early Saved Comparisons stored Plant
 * Story ids directly.
 *
 * That format existed briefly before
 * Comparisons became a general Sprig
 * record capable of comparing different
 * kinds of things.
 *
 * Keep this private legacy shape here so
 * old saved gardens can be migrated safely.
 */

interface LegacySavedPlantComparison {
  id: string
  name: string
  plantStoryIds: string[]
  createdAt: string
  updatedAt?: string
}

/* =======================================
   NORMALISE SAVED COMPARISONS
======================================= */

function normalizeSavedComparisons(
  savedComparisons: unknown,
): SavedComparison[] {
  if (!Array.isArray(savedComparisons)) {
    return []
  }

  return savedComparisons
    .map(
      (
        comparison,
      ): SavedComparison | null => {
        if (
          !comparison ||
          typeof comparison !== 'object'
        ) {
          return null
        }

        const comparisonRecord =
          comparison as Record<
            string,
            unknown
          >

        /* =======================================
           CURRENT COMPARISON FORMAT
        ======================================= */

        if (
          Array.isArray(
            comparisonRecord.items,
          )
        ) {
          const items =
            comparisonRecord.items
              .map((item) => {
                if (
                  !item ||
                  typeof item !==
                    'object'
                ) {
                  return null
                }

                const itemRecord =
                  item as Record<
                    string,
                    unknown
                  >

                const recordType =
                  itemRecord.recordType

                const recordId =
                  itemRecord.recordId

                if (
                  (
                    recordType !==
                      'plant-story' &&
                    recordType !==
                      'growing-place' &&
                    recordType !==
                      'growing-setup'
                  ) ||
                  typeof recordId !==
                    'string'
                ) {
                  return null
                }

                return {
                  recordType,
                  recordId,
                }
              })
              .filter(
                (
                  item,
                ): item is SavedComparison['items'][number] =>
                  Boolean(item),
              )

          if (
            typeof comparisonRecord.id !==
              'string' ||
            typeof comparisonRecord.name !==
              'string' ||
            typeof comparisonRecord.createdAt !==
              'string'
          ) {
            return null
          }

          return {
            id: comparisonRecord.id,
            name: comparisonRecord.name,
            items,
            createdAt:
              comparisonRecord.createdAt,
            updatedAt:
              typeof comparisonRecord.updatedAt ===
              'string'
                ? comparisonRecord.updatedAt
                : undefined,
          }
        }

        /* =======================================
           LEGACY PLANT COMPARISON FORMAT
        ======================================= */

        if (
          Array.isArray(
            comparisonRecord.plantStoryIds,
          )
        ) {
          const legacyComparison =
            comparison as unknown as LegacySavedPlantComparison

          if (
            typeof legacyComparison.id !==
              'string' ||
            typeof legacyComparison.name !==
              'string' ||
            typeof legacyComparison.createdAt !==
              'string'
          ) {
            return null
          }

          const plantStoryIds =
            legacyComparison.plantStoryIds.filter(
              (
                plantStoryId,
              ): plantStoryId is string =>
                typeof plantStoryId ===
                'string',
            )

          return {
            id: legacyComparison.id,
            name: legacyComparison.name,
            items:
              plantStoryIds.map(
                (plantStoryId) => ({
                  recordType:
                    'plant-story',
                  recordId:
                    plantStoryId,
                }),
              ),
            createdAt:
              legacyComparison.createdAt,
            updatedAt:
              legacyComparison.updatedAt,
          }
        }

        return null
      },
    )
    .filter(
      (
        comparison,
      ): comparison is SavedComparison =>
        Boolean(comparison),
    )
}

/* =======================================
   NORMALISE GARDEN DATA
======================================= */

/**
 * Sprig's saved garden grows as new
 * collections and relationships are added.
 *
 * Older gardens may therefore be missing
 * fields that newer versions of Sprig know
 * about.
 *
 * Every saved or restored garden should
 * pass through this function before the
 * app uses it.
 */

export function normalizeGardenData(
  data: GardenData,
): GardenData {
  return {
    ...data,

    /**
     * Older gardens won't have these
     * collections yet.
     */

    growingPlaces:
      data.growingPlaces ?? [],

    growingSetups:
      data.growingSetups ?? [],

    ingredients:
      data.ingredients ?? [],

    products:
      data.products ?? [],

    purchases:
      data.purchases ?? [],

    costAllocations:
      data.costAllocations ?? [],

    /**
     * Garden Knowledge arrived later than the
     * original Sprig garden format. Older gardens
     * simply begin with empty knowledge shelves.
     * No existing note, event or plan is converted.
     */

    gardenNotes:
      data.gardenNotes ?? [],

    plantReferences:
      data.plantReferences ?? [],

    savedKnowledgeSources:
      data.savedKnowledgeSources ?? [],

    /**
     * Older saves may also be
     * missing harvests.
     */

    harvests:
      data.harvests ?? [],

    /**
     * Garden Plans were introduced after the
     * original GardenData format.
     *
     * Older saved gardens therefore simply
     * begin with no Plans.
     *
     * Nothing is migrated, invented or removed.
     */

    plans: (data.plans ?? []).map(
      (plan) => ({
        ...plan,

        /*
         * Plans created before the Plan lifecycle
         * was introduced are still ordinary
         * future intentions.
         */

        status:
          plan.status ??
          'planned',

        /*
         * Keep relationship collections tidy and
         * predictable while remaining compatible
         * with older saved gardens.
         */

        plantStoryIds:
          plan.plantStoryIds ??
          [],

        growingPlaceIds:
          plan.growingPlaceIds ??
          [],

        growingSetupIds:
          plan.growingSetupIds ??
          [],

        /*
         * Plans saved before rescheduling history
         * existed simply begin with no previous
         * schedule changes.
         *
         * Nothing is invented from the current
         * Plan date because Sprig cannot know
         * whether that date was ever changed.
         */

        scheduleHistory:
          plan.scheduleHistory ??
          [],

        results:
          plan.results ??
          [],
      }),
    ),

    /**
     * Saved Comparisons changed shape
     * while the comparison architecture
     * was being established.
     *
     * Older plant-only comparisons are
     * converted into the current item-based
     * structure here.
     */

    savedComparisons:
      normalizeSavedComparisons(
        data.savedComparisons,
      ),

    /**
     * Ensure every journal entry has
     * the newer relationship collections.
     */

    events: (
      data.events ?? []
    ).map((event) => ({
      ...event,

      plantStoryIds:
        event.plantStoryIds ??
        [],

      growingPlaceIds:
        event.growingPlaceIds ??
        [],
    })),
  }
}

/* =======================================
   LOAD GARDEN DATA
======================================= */

export function loadGardenData(): GardenData {
  const savedData =
    localStorage.getItem(
      STORAGE_KEY,
    )

  /**
   * A genuinely new installation has no
   * garden yet, so begin with Sprig's
   * sample garden.
   */

  if (!savedData) {
    const initialGarden =
      normalizeGardenData(
        sampleGardenData,
      )

    saveGardenData(
      initialGarden,
    )

    return initialGarden
  }

  try {
    const parsedData =
      JSON.parse(
        savedData,
      ) as GardenData

    return normalizeGardenData(
      parsedData,
    )
  } catch {
    /**
     * IMPORTANT:
     *
     * Do not overwrite the unreadable
     * localStorage value here.
     *
     * Even malformed data may still be
     * recoverable. Failure to read a garden
     * is never permission to destroy it.
     */

    console.error(
      'Sprig could not read saved garden data. The original saved data has been left untouched.',
    )

    /**
     * Allow Sprig to open with sample data
     * for now, but do NOT save that sample
     * data over the unreadable garden.
     *
     * A later recovery interface can give
     * the gardener safer choices.
     */

    return normalizeGardenData(
      sampleGardenData,
    )
  }
}

/* =======================================
   SAVE GARDEN DATA
======================================= */

export function saveGardenData(
  data: GardenData,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  )
}

/* =======================================
   RESET GARDEN DATA
======================================= */

export function resetGardenData(): GardenData {
  const resetData =
    normalizeGardenData(
      sampleGardenData,
    )

  saveGardenData(resetData)

  return resetData
}