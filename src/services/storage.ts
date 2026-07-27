import type { GardenData } from '../types'
import { sampleGardenData } from '../data/sampleData'

const STORAGE_KEY = 'sprig-garden-data'

export function loadGardenData(): GardenData {
  const savedData = localStorage.getItem(STORAGE_KEY)

  if (!savedData) {
    saveGardenData(sampleGardenData)
    return sampleGardenData
  }

  try {
    const data = JSON.parse(savedData) as GardenData

    return {
      ...data,

      // Existing gardens won't have these yet.
      growingPlaces: data.growingPlaces ?? [],

      // Older saves may also be missing harvests.
      harvests: data.harvests ?? [],

      // Ensure every event has the new optional collections.
      events: data.events.map((event) => ({
        ...event,
        plantStoryIds: event.plantStoryIds ?? [],
        growingPlaceIds: event.growingPlaceIds ?? [],
      })),
    }
  } catch {
    console.warn(
      'Sprig could not read saved garden data. Loading sample data.',
    )

    saveGardenData(sampleGardenData)
    return sampleGardenData
  }
}

export function saveGardenData(
  data: GardenData,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  )
}

export function resetGardenData(): GardenData {
  saveGardenData(sampleGardenData)
  return sampleGardenData
}