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
    return JSON.parse(savedData) as GardenData
  } catch {
    console.warn('Sprig could not read saved garden data. Loading sample data.')

    saveGardenData(sampleGardenData)
    return sampleGardenData
  }
}

export function saveGardenData(data: GardenData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetGardenData(): GardenData {
  saveGardenData(sampleGardenData)
  return sampleGardenData
}
