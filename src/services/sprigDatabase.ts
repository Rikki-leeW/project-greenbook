import Dexie, {
    type Table,
  } from 'dexie'
  
  import type {
    GardenData,
  } from '../types'
  
  
  /* =======================================
     SPRIG DATABASE RECORDS
  ======================================= */
  
  /**
   * During the first stage of Sprig's move
   * away from localStorage, the complete
   * GardenData object is stored as one
   * IndexedDB record.
   *
   * This is deliberate.
   *
   * It lets Sprig move its existing garden
   * safely into IndexedDB without requiring
   * every page, form and record type to be
   * rewritten at once.
   *
   * Later stages can split photographs and
   * individual record collections into their
   * own database tables.
   */
  
  export interface SprigGardenSnapshot {
    id:
      'current'
  
    gardenData:
      GardenData
  
    updatedAt:
      string
  }
  
  
  /* =======================================
     STORAGE INFORMATION
  ======================================= */
  
  export interface SprigStorageInformation {
    persisted:
      boolean | null
  
    persistenceSupported:
      boolean
  
    usageBytes:
      number | null
  
    quotaBytes:
      number | null
  }
  
  
  /* =======================================
     SPRIG DATABASE
  ======================================= */
  
  class SprigDatabase extends Dexie {
  
    gardenSnapshots!:
      Table<
        SprigGardenSnapshot,
        string
      >
  
  
    constructor() {
      super(
        'sprig-garden',
      )
  
  
      /*
       * VERSION 1
       *
       * The first IndexedDB-backed Sprig
       * garden.
       *
       * At this stage there is intentionally
       * only one table containing the current
       * complete GardenData snapshot.
       *
       * This gives us a safe bridge from the
       * existing architecture.
       */
      this.version(
        1,
      ).stores({
        gardenSnapshots:
          'id, updatedAt',
      })
    }
  }
  
  
  /* =======================================
     DATABASE INSTANCE
  ======================================= */
  
  export const sprigDatabase =
    new SprigDatabase()
  
  
  /* =======================================
     READ CURRENT GARDEN
  ======================================= */
  
  export async function readGardenFromDatabase():
    Promise<
      GardenData | null
    > {
  
    const snapshot =
      await sprigDatabase
        .gardenSnapshots
        .get(
          'current',
        )
  
  
    return (
      snapshot?.gardenData ??
      null
    )
  }
  
  
  /* =======================================
     WRITE CURRENT GARDEN
  ======================================= */
  
  export async function writeGardenToDatabase(
    gardenData:
      GardenData,
  ): Promise<void> {
  
    const snapshot:
      SprigGardenSnapshot = {
        id:
          'current',
  
        gardenData,
  
        updatedAt:
          new Date()
            .toISOString(),
      }
  
  
    await sprigDatabase
      .gardenSnapshots
      .put(
        snapshot,
      )
  }
  
  
  /* =======================================
     VERIFY CURRENT GARDEN
  ======================================= */
  
  /**
   * A successful IndexedDB request normally
   * already tells us that the transaction was
   * committed.
   *
   * For Sprig's migration, however, we want
   * an additional explicit check.
   *
   * This confirms that a current snapshot can
   * actually be read back after writing it.
   */
  
  export async function verifyGardenInDatabase():
    Promise<boolean> {
  
    const snapshot =
      await sprigDatabase
        .gardenSnapshots
        .get(
          'current',
        )
  
  
    return Boolean(
      snapshot &&
      snapshot.gardenData,
    )
  }
  
  
  /* =======================================
     DATABASE HAS GARDEN
  ======================================= */
  
  export async function databaseHasGarden():
    Promise<boolean> {
  
    const snapshot =
      await sprigDatabase
        .gardenSnapshots
        .get(
          'current',
        )
  
  
    return Boolean(
      snapshot,
    )
  }
  
  
  /* =======================================
     REQUEST PERSISTENT STORAGE
  ======================================= */
  
  /**
   * Browser/PWA installations normally begin
   * with "best effort" storage.
   *
   * Where supported, Sprig asks the browser
   * to treat its local garden as persistent
   * storage.
   *
   * A browser is still allowed to decline the
   * request, which is why Backup & Restore
   * remains important.
   */
  
  export async function requestSprigPersistentStorage():
    Promise<
      boolean | null
    > {
  
    if (
      typeof navigator ===
        'undefined' ||
      !navigator.storage
    ) {
      return null
    }
  
  
    try {
  
      if (
        navigator.storage
          .persisted
      ) {
  
        const alreadyPersisted =
          await navigator.storage
            .persisted()
  
  
        if (
          alreadyPersisted
        ) {
          return true
        }
      }
  
  
      if (
        navigator.storage
          .persist
      ) {
        return await navigator
          .storage
          .persist()
      }
  
  
      return null
  
    } catch (
      error
    ) {
  
      console.warn(
        'Sprig could not request persistent browser storage:',
        error,
      )
  
  
      return null
    }
  }
  
  
  /* =======================================
     READ STORAGE INFORMATION
  ======================================= */
  
  export async function getSprigStorageInformation():
    Promise<
      SprigStorageInformation
    > {
  
    const information:
      SprigStorageInformation = {
        persisted:
          null,
  
        persistenceSupported:
          false,
  
        usageBytes:
          null,
  
        quotaBytes:
          null,
      }
  
  
    if (
      typeof navigator ===
        'undefined' ||
      !navigator.storage
    ) {
      return information
    }
  
  
    information
      .persistenceSupported =
        Boolean(
          navigator.storage
            .persist,
        )
  
  
    try {
  
      if (
        navigator.storage
          .persisted
      ) {
        information.persisted =
          await navigator.storage
            .persisted()
      }
  
    } catch (
      error
    ) {
  
      console.warn(
        'Sprig could not check persistent storage status:',
        error,
      )
    }
  
  
    try {
  
      if (
        navigator.storage
          .estimate
      ) {
  
        const estimate =
          await navigator.storage
            .estimate()
  
  
        information.usageBytes =
          estimate.usage ??
          null
  
  
        information.quotaBytes =
          estimate.quota ??
          null
      }
  
    } catch (
      error
    ) {
  
      console.warn(
        'Sprig could not read browser storage information:',
        error,
      )
    }
  
  
    return information
  }
  
  
  /* =======================================
     CLOSE DATABASE
  ======================================= */
  
  /**
   * Mostly useful for maintenance/testing.
   *
   * Normal Sprig use does not need to call
   * this manually.
   */
  
  export function closeSprigDatabase():
    void {
  
    sprigDatabase.close()
  }