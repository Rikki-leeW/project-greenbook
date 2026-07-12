import type { GardenData } from '../types'

export const sampleGardenData: GardenData = {
  growingSpaces: [
    {
      id: 'space-top-deck',
      name: 'Top deck',
      type: 'other',
    },
    {
      id: 'space-pool-deck',
      name: 'Pool deck',
      type: 'other',
    },
    {
      id: 'space-potato-bag-7',
      name: 'Potato grow bag 7',
      type: 'grow-bag',
    },
  ],

  plantStories: [
    {
      id: 'royal-blue-june-2026',
      plantName: 'Potato',
      variety: 'Royal Blue',
      displayName: 'Royal Blue',
      personality: 'The Quiet Performer',
      quantity: 2,
      startMethod: 'seed-potato',
      plantedDate: '2026-06-12',
      enteredDate: '2026-06-12',
      status: 'growing',
      currentGrowingSpaceId: 'space-potato-bag-7',
      expectedHarvestDaysMin: 105,
      expectedHarvestDaysMax: 140,
      notes: 'Two small Royal Blue seed potatoes.',
      tags: ['potato', 'winter', 'experiment'],
    },
    {
      id: 'broccoli-pool-deck-2026',
      plantName: 'Broccoli',
      displayName: 'Market Broccoli',
      personality: 'The Patient Architect',
      quantity: 1,
      startMethod: 'seedling',
      plantedDate: '2026-03-16',
      enteredDate: '2026-03-16',
      status: 'growing',
      currentGrowingSpaceId: 'space-pool-deck',
      notes: 'First head noticed forming on 24 June.',
      tags: ['broccoli', 'brassica', 'winter'],
    },
    {
      id: 'mortgage-lifter-sucker-2026',
      plantName: 'Tomato',
      variety: 'Mortgage Lifter',
      displayName: 'Mortgage Lifter',
      personality: 'The Garden Giant',
      quantity: 1,
      startMethod: 'sucker',
      plantedDate: '2026-02-22',
      enteredDate: '2026-02-22',
      status: 'growing',
      currentGrowingSpaceId: 'space-pool-deck',
      notes: 'Started from a sucker rooted in water.',
      tags: ['tomato', 'sucker', 'experiment'],
    },
  ],

  events: [
    {
      id: 'event-royal-blue-planted',
      plantStoryIds: ['royal-blue-june-2026'],
      date: '2026-06-12',
      type: 'planted',
      title: 'Planted',
      notes: 'Two small Royal Blue seed potatoes.',
    },
    {
      id: 'event-royal-blue-sprouted',
      plantStoryIds: ['royal-blue-june-2026'],
      date: '2026-06-26',
      type: 'sprouted',
      title: 'First sprouts noticed',
    },
    {
      id: 'event-broccoli-head',
      plantStoryIds: ['broccoli-pool-deck-2026'],
      date: '2026-06-24',
      type: 'observation',
      title: 'First broccoli head forming',
    },
  ],

  harvests: [],
}