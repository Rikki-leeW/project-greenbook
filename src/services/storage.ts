import type {
  GardenData,
  SavedComparison,
} from '../types'

import {
  sampleGardenData,
} from '../data/sampleData'

import {
  databaseHasGarden,
  readGardenFromDatabase,
  requestSprigPersistentStorage,
  verifyGardenInDatabase,
  writeGardenToDatabase,
} from './sprigDatabase'


const LEGACY_STORAGE_KEY =
  'sprig-garden-data'


/* =======================================
   GLOBAL DATABASE SAVE QUEUE
======================================= */

/*
 * Sprig currently stores GardenData as one
 * complete IndexedDB snapshot.
 *
 * Many different parts of the application
 * can ask to save:
 *
 * Plant Stories
 * Journal
 * Harvests
 * Growing Places
 * Growing Recipes
 * Ingredients
 * Products
 * Purchases
 * Plans
 * Comparisons
 * Garden Knowledge
 * Garden Trials
 * Garden Gallery
 *
 * IndexedDB writes are asynchronous.
 *
 * Without a queue, two saves can overlap:
 *
 *   Save A starts
 *   Save B starts
 *   Save B finishes
 *   Save A finishes
 *
 * That could leave the older snapshot as
 * the final database state.
 *
 * Every save is therefore placed into one
 * ordered queue.
 */

let gardenSaveQueue:
  Promise<void> =
  Promise.resolve()


/*
 * Sprig can receive save requests from many
 * different surfaces:
 *
 * forms
 * quick-add controls
 * favourites
 * ratings
 * archive / restore
 * plans
 * knowledge records
 * gallery records
 *
 * The counter lets the interface know that
 * at least one garden write is still being
 * completed.
 */

let pendingGardenSaveCount =
  0


function updateGlobalSavingState() {
  if (
    typeof document ===
    'undefined'
  ) {
    return
  }


  const isSaving =
    pendingGardenSaveCount >
    0


  document.body.classList.toggle(
    'sprig-is-saving',
    isSaving,
  )


  document.documentElement
    .classList
    .toggle(
      'sprig-is-saving',
      isSaving,
    )


  if (
    isSaving
  ) {
    document.body.setAttribute(
      'aria-busy',
      'true',
    )
  }
  else {
    document.body.removeAttribute(
      'aria-busy',
    )
  }
}


function beginGardenSave() {
  pendingGardenSaveCount +=
    1

  updateGlobalSavingState()
}


function finishGardenSave() {
  pendingGardenSaveCount =
    Math.max(
      0,
      pendingGardenSaveCount -
        1,
    )

  updateGlobalSavingState()
}


/*
 * Prevent a burst of failed queued saves
 * from displaying the same warning several
 * times at once.
 */

let saveFailureAlertVisible =
  false


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
  if (
    !Array.isArray(
      savedComparisons,
    )
  ) {
    return []
  }


  return savedComparisons
    .map(
      (
        comparison,
      ): SavedComparison | null => {
        if (
          !comparison ||
          typeof comparison !==
            'object'
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
              .map(
                (
                  item,
                ) => {
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
                },
              )
              .filter(
                (
                  item,
                ): item is SavedComparison['items'][number] =>
                  Boolean(
                    item,
                  ),
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
            id:
              comparisonRecord.id,

            name:
              comparisonRecord.name,

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
            comparisonRecord
              .plantStoryIds,
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
            legacyComparison
              .plantStoryIds
              .filter(
                (
                  plantStoryId,
                ): plantStoryId is string =>
                  typeof plantStoryId ===
                  'string',
              )


          return {
            id:
              legacyComparison.id,

            name:
              legacyComparison.name,

            items:
              plantStoryIds.map(
                plantStoryId => ({
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
        Boolean(
          comparison,
        ),
    )
}


/* =======================================
   NORMALISE GARDEN DATA
======================================= */

/*
 * Sprig's garden format grows as new
 * collections and relationships are added.
 *
 * Older gardens can therefore be missing
 * fields that current Sprig expects.
 *
 * Every loaded, migrated, restored or saved
 * garden passes through this normaliser.
 */

export function normalizeGardenData(
  data: GardenData,
): GardenData {
  return {
    ...data,


    /* =======================================
       LIBRARY / GARDEN COLLECTIONS
    ======================================= */

    growingPlaces:
      data.growingPlaces ??
      [],

    growingSetups:
      data.growingSetups ??
      [],

    ingredients:
      data.ingredients ??
      [],

    products:
      data.products ??
      [],

    purchases:
      data.purchases ??
      [],

    costAllocations:
      data.costAllocations ??
      [],


    /* =======================================
       GARDEN KNOWLEDGE
    ======================================= */

    gardenNotes:
      data.gardenNotes ??
      [],

    plantReferences:
      data.plantReferences ??
      [],

    savedKnowledgeSources:
      data.savedKnowledgeSources ??
      [],


    /* =======================================
       GARDEN TRIALS
    ======================================= */

    gardenTrials:
      (
        data.gardenTrials ??
        []
      ).map(
        trial => ({
          ...trial,

          status:
            trial.status ??
            'active',

          observations:
            trial.observations ??
            [],

          relationships:
            trial.relationships ??
            [],
        }),
      ),


    /* =======================================
       HARVESTS
    ======================================= */

    harvests:
      data.harvests ??
      [],


    /* =======================================
       GARDEN PLANS
    ======================================= */

    plans:
      (
        data.plans ??
        []
      ).map(
        plan => ({
          ...plan,

          status:
            plan.status ??
            'planned',

          plantStoryIds:
            plan.plantStoryIds ??
            [],

          growingPlaceIds:
            plan.growingPlaceIds ??
            [],

          growingSetupIds:
            plan.growingSetupIds ??
            [],

          scheduleHistory:
            plan.scheduleHistory ??
            [],

          results:
            plan.results ??
            [],
        }),
      ),


    /* =======================================
       SAVED COMPARISONS
    ======================================= */

    savedComparisons:
      normalizeSavedComparisons(
        data.savedComparisons,
      ),


    /* =======================================
       JOURNAL RELATIONSHIPS
    ======================================= */

    events:
      (
        data.events ??
        []
      ).map(
        event => ({
          ...event,

          plantStoryIds:
            event.plantStoryIds ??
            [],

          growingPlaceIds:
            event.growingPlaceIds ??
            [],
        }),
      ),
  }
}


/* =======================================
   READ LEGACY LOCALSTORAGE GARDEN
======================================= */

/*
 * The old localStorage garden is now a
 * migration source only.
 *
 * IMPORTANT:
 *
 * This function NEVER deletes it.
 *
 * During the IndexedDB migration period it
 * remains a useful untouched safety copy of
 * the last garden localStorage successfully
 * managed to store.
 */

function readLegacyGardenData():
  GardenData | null {
  if (
    typeof window ===
    'undefined'
  ) {
    return null
  }


  const savedData =
    window.localStorage.getItem(
      LEGACY_STORAGE_KEY,
    )


  if (
    !savedData
  ) {
    return null
  }


  try {
    const parsedData =
      JSON.parse(
        savedData,
      ) as GardenData


    return normalizeGardenData(
      parsedData,
    )
  }
  catch (
    error
  ) {
    console.error(
      'Sprig could not safely read the existing localStorage garden:',
      error,
    )


    throw new Error(
      'Sprig found your existing garden but could not safely read it. Nothing has been overwritten.',
    )
  }
}


/* =======================================
   TEMPORARY SYNCHRONOUS BOOTSTRAP
======================================= */

/*
 * React still needs an immediate value when
 * App first mounts.
 *
 * This is NOT the authoritative database
 * load anymore.
 *
 * initializeGardenData() replaces this value
 * as soon as IndexedDB has opened.
 *
 * It deliberately performs no save.
 */

export function loadGardenData():
  GardenData {
  try {
    const legacyGarden =
      readLegacyGardenData()


    if (
      legacyGarden
    ) {
      return legacyGarden
    }
  }
  catch (
    error
  ) {
    console.error(
      'Sprig synchronous bootstrap could not read the legacy garden:',
      error,
    )
  }


  return normalizeGardenData(
    sampleGardenData,
  )
}


/* =======================================
   INITIALISE AUTHORITATIVE GARDEN
======================================= */

/*
 * Startup order:
 *
 * 1. Existing IndexedDB garden
 * 2. Existing old localStorage garden
 * 3. Brand-new sample garden
 *
 * Migration is deliberately conservative.
 *
 * The old localStorage value is NOT removed
 * after migration.
 */

export async function initializeGardenData():
  Promise<GardenData> {

  /* =======================================
     1. EXISTING INDEXEDDB GARDEN
  ======================================= */

  const databaseGarden =
    await readGardenFromDatabase()


  if (
    databaseGarden
  ) {
    const normalizedGarden =
      normalizeGardenData(
        databaseGarden,
      )


    /*
     * Ask the browser to make Sprig's local
     * storage persistent where supported.
     *
     * Failure or lack of support is not a
     * garden-loading failure.
     */

    void requestSprigPersistentStorage()


    return normalizedGarden
  }


  /* =======================================
     2. MIGRATE LEGACY LOCALSTORAGE
  ======================================= */

  const legacyGarden =
    readLegacyGardenData()


  if (
    legacyGarden
  ) {
    const normalizedGarden =
      normalizeGardenData(
        legacyGarden,
      )


    await writeGardenToDatabase(
      normalizedGarden,
    )


    const verified =
      await verifyGardenInDatabase()


    if (
      !verified
    ) {
      throw new Error(
        'Sprig copied your existing garden into its new database, but could not verify the copy. Your old garden has been left untouched.',
      )
    }


    const migratedGarden =
      await readGardenFromDatabase()


    if (
      !migratedGarden
    ) {
      throw new Error(
        'Sprig could not safely read the garden after migration. Your old garden has been left untouched.',
      )
    }


    void requestSprigPersistentStorage()


    return normalizeGardenData(
      migratedGarden,
    )
  }


  /* =======================================
     3. BRAND-NEW GARDEN
  ======================================= */

  const initialGarden =
    normalizeGardenData(
      sampleGardenData,
    )


  await writeGardenToDatabase(
    initialGarden,
  )


  const verified =
    await verifyGardenInDatabase()


  if (
    !verified
  ) {
    throw new Error(
      'Sprig could not verify its new local garden database.',
    )
  }


  void requestSprigPersistentStorage()


  return initialGarden
}


/* =======================================
   PERFORM ONE DATABASE SAVE
======================================= */

async function performGardenSave(
  gardenData:
    GardenData,
): Promise<boolean> {
  try {
    await writeGardenToDatabase(
      gardenData,
    )


    /*
     * Dexie's put() resolves only after the
     * IndexedDB transaction has completed.
     *
     * At this point this snapshot really has
     * been handed safely to IndexedDB.
     */

    return true
  }
  catch (
    error
  ) {
    console.error(
      'Sprig could not save the garden:',
      error,
    )


    if (
      typeof window !==
        'undefined' &&
      !saveFailureAlertVisible
    ) {
      saveFailureAlertVisible =
        true


      window.alert(
        'Sprig could not save this change safely.\n\n' +
        'Please leave Sprig open and do not close the app until the problem is resolved.',
      )


      saveFailureAlertVisible =
        false
    }


    return false
  }
}


/* =======================================
   SAVE GARDEN DATA
======================================= */

/*
 * THIS IS SPRIG'S GLOBAL SAVE GATE.
 *
 * Every existing part of Sprig that calls
 * saveGardenData() automatically comes
 * through this queue.
 *
 * The snapshot is captured immediately,
 * then written only after every earlier
 * save has completed.
 */

export function saveGardenData(
  data:
    GardenData,
): Promise<boolean> {
  /*
   * IMPORTANT:
   *
   * This happens synchronously, before the
   * IndexedDB work begins.
   *
   * That means a second physical tap cannot
   * sneak through while React is still
   * waiting to rerender a disabled button.
   */

  beginGardenSave()


  const gardenSnapshot =
    normalizeGardenData(
      data,
    )


  let resolveSave:
    (
      saved:
        boolean,
    ) => void


  const saveResult =
    new Promise<boolean>(
      resolve => {
        resolveSave =
          resolve
      },
    )


  gardenSaveQueue =
    gardenSaveQueue
      .catch(
        error => {
          /*
           * A previous queued operation must
           * never permanently poison the queue.
           */

          console.error(
            'Sprig recovered its save queue after an earlier failure:',
            error,
          )
        },
      )
      .then(
        async () => {
          try {
            const saved =
              await performGardenSave(
                gardenSnapshot,
              )


            resolveSave(
              saved,
            )
          }
          finally {
            /*
             * Whether this particular write
             * succeeded or failed, release one
             * place in Sprig's global save lock.
             *
             * If another queued write remains,
             * pendingGardenSaveCount stays above
             * zero and the lock remains active.
             */

            finishGardenSave()
          }
        },
      )


  return saveResult
}


/* =======================================
   WAIT FOR PENDING SAVES
======================================= */

/*
 * Useful for later lifecycle protection,
 * Backup / Restore and native packaging.
 *
 * Calling this waits until every save that
 * was already requested has finished.
 */

export async function waitForPendingGardenSaves():
  Promise<void> {
  await gardenSaveQueue
}


/* =======================================
   DOES INDEXEDDB HAVE A GARDEN?
======================================= */

/*
 * Kept as a small public helper because
 * diagnostics/settings can use it later.
 */

export async function hasIndexedDbGarden():
  Promise<boolean> {
  return databaseHasGarden()
}


/* =======================================
   RESET GARDEN DATA
======================================= */

/*
 * Reset affects the CURRENT IndexedDB
 * garden only.
 *
 * During migration development we
 * deliberately do not delete the old
 * localStorage copy.
 */

export async function resetGardenData():
  Promise<GardenData> {
  const resetData =
    normalizeGardenData(
      sampleGardenData,
    )


  const saved =
    await saveGardenData(
      resetData,
    )


  if (
    !saved
  ) {
    throw new Error(
      'Sprig could not safely reset the garden database.',
    )
  }


  return resetData
}