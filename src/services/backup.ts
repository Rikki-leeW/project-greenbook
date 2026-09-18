import type {
  GardenData,
} from '../types'

import {
  normalizeGardenData,
} from './storage'

import {
  downloadJson,
} from '../utils/exportUtils'


/* =======================================
   BACKUP FORMAT
======================================= */

export interface SprigGardenBackup {
  backupFormat:
    'sprig-garden-backup'

  backupVersion: 1

  createdAt: string

  gardenData: GardenData
}


const BACKUP_FORMAT =
  'sprig-garden-backup' as const

const BACKUP_VERSION =
  1 as const


/* =======================================
   CREATE BACKUP OBJECT
======================================= */

export function createGardenBackup(
  gardenData: GardenData,
): SprigGardenBackup {

  return {
    backupFormat:
      BACKUP_FORMAT,

    backupVersion:
      BACKUP_VERSION,

    createdAt:
      new Date()
        .toISOString(),

    gardenData:
      normalizeGardenData(
        gardenData,
      ),
  }
}


/* =======================================
   CREATE BACKUP FILE NAME
======================================= */

export function createGardenBackupFileName(
  createdAt =
    new Date()
      .toISOString(),
): string {

  const safeDate =
    createdAt
      .slice(
        0,
        10,
      )

  return (
    `garden-of-mine-backup-${safeDate}.json`
  )
}


/* =======================================
   DOWNLOAD BACKUP
======================================= */

export function downloadGardenBackup(
  gardenData: GardenData,
  fileName?: string,
): void {

  const backup =
    createGardenBackup(
      gardenData,
    )


  downloadJson(
    fileName ??
      createGardenBackupFileName(
        backup.createdAt,
      ),
    backup,
  )
}


/* =======================================
   BASIC OBJECT CHECK
======================================= */

function isRecord(
  value: unknown,
): value is
  Record<string, unknown> {

  return (
    typeof value ===
      'object' &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  )
}


/* =======================================
   BASIC GARDEN DATA CHECK
======================================= */

/*
 * This deliberately checks the garden's
 * major top-level collections rather than
 * attempting to validate every field inside
 * every historical record.
 *
 * That gives Sprig a useful safety gate now
 * while still allowing older gardens to pass
 * through normalizeGardenData().
 */
function looksLikeGardenData(
  value: unknown,
): value is GardenData {

  if (
    !isRecord(
      value,
    )
  ) {
    return false
  }


  const requiredLegacyArrayFields = [
    'plantStories',
    'growingSpaces',
    'events',
  ]


  const knownArrayFields = [
    ...requiredLegacyArrayFields,
    'growingPlaces',
    'growingSetups',
    'ingredients',
    'products',
    'purchases',
    'costAllocations',
    'harvests',
    'plans',
    'gardenNotes',
    'plantReferences',
    'savedKnowledgeSources',
    'gardenTrials',
    'galleryPhotos',
    'savedComparisons',
  ]


  const hasRequiredLegacyShape =
    requiredLegacyArrayFields.every(
      fieldName =>
        Array.isArray(
          value[
            fieldName
          ],
        ),
    )


  const knownCollectionsAreReadable =
    knownArrayFields.every(
      fieldName =>
        value[
          fieldName
        ] === undefined ||
        Array.isArray(
          value[
            fieldName
          ],
        ),
    )


  return (
    hasRequiredLegacyShape &&
    knownCollectionsAreReadable
  )
}


/* =======================================
   PARSE BACKUP
======================================= */

export function parseGardenBackup(
  backupText: string,
): SprigGardenBackup {

  let parsedValue:
    unknown


  try {
    parsedValue =
      JSON.parse(
        backupText,
      )
  } catch {
    throw new Error(
      'This file is not readable JSON.',
    )
  }


  if (
    !isRecord(
      parsedValue,
    )
  ) {
    throw new Error(
      'This does not appear to be a Sprig garden backup.',
    )
  }


  if (
    parsedValue.backupFormat !==
    BACKUP_FORMAT
  ) {
    throw new Error(
      'This file is not recognised as a Sprig garden backup.',
    )
  }


  if (
    parsedValue.backupVersion !==
    BACKUP_VERSION
  ) {
    throw new Error(
      'This Sprig backup version is not supported by this version of the app.',
    )
  }


  if (
    typeof parsedValue.createdAt !==
    'string'
  ) {
    throw new Error(
      'This Sprig backup is missing its creation date.',
    )
  }


  if (
    !looksLikeGardenData(
      parsedValue.gardenData,
    )
  ) {
    throw new Error(
      'This Sprig backup does not contain a readable garden.',
    )
  }


  return {
    backupFormat:
      BACKUP_FORMAT,

    backupVersion:
      BACKUP_VERSION,

    createdAt:
      parsedValue.createdAt,

    gardenData:
      normalizeGardenData(
        parsedValue.gardenData,
      ),
  }
}


/* =======================================
   READ BACKUP FILE
======================================= */

export async function readGardenBackupFile(
  file: File,
): Promise<SprigGardenBackup> {

  const backupText =
    await file.text()

  return parseGardenBackup(
    backupText,
  )
}
