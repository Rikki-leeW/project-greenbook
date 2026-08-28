import type {
    GardenData,
    GardenEvent,
    GardenPlan,
    GardenPlanStatus,
    PlantStory,
  } from '../types'
  
  import {
    formatGardenTimingDays,
    formatGardenTimingWeeks,
  } from './gardenTimingUtils'
  
  
  /* =======================================
     CALENDAR ITEM TYPES
  ======================================= */
  
  /*
   * The Calendar is a derived view of Sprig.
   *
   * Existing records continue to own their
   * real dates and information.
   *
   * Calendar items simply give those records
   * a common shape so the whole garden can
   * be viewed through time.
   */
  
  export type CalendarTimeType =
    | 'recorded'
    | 'expected'
    | 'planned'
  
  
  export type CalendarSourceType =
    | 'plant-story'
    | 'plant-photo'
    | 'growing-history'
    | 'journal'
    | 'harvest'
    | 'purchase'
    | 'plan'
  
  
  export type CalendarItemKind =
    | 'sown'
    | 'planted'
    | 'planted-out'
    | 'completed'
    | 'photo'
    | 'growing-place-change'
    | 'growing-setup-change'
    | 'growing-change'
    | 'journal-event'
    | 'harvest'
    | 'purchase'
    | 'expected-harvest'
    | 'plan'
  
  
  export type CalendarPlanRole =
    | 'intention'
    | 'possibility'
  
  
  export interface CalendarItem {
    id: string
  
    startDate: string
    endDate?: string
  
    timeType: CalendarTimeType
  
    sourceType: CalendarSourceType
    sourceId: string
  
    kind: CalendarItemKind
  
    planRole?: CalendarPlanRole
    planStatus?: GardenPlanStatus
  
    title: string
    contextLabel?: string
    description?: string
  
    sourceLabel?: string
  
    plantStoryIds?: string[]
    growingPlaceIds?: string[]
    growingSetupIds?: string[]
  
    resultPlantStoryIds?: string[]
  
    canOpenSource?: boolean
  
    searchText: string
  }
  
  
  /* =======================================
     DATE HELPERS
  ======================================= */
  
  function parseDateOnly(
    value: string,
  ): Date | undefined {
    const match =
      /^(\d{4})-(\d{2})-(\d{2})$/.exec(
        value,
      )
  
    if (!match) {
      return undefined
    }
  
    const year =
      Number(
        match[1],
      )
  
    const month =
      Number(
        match[2],
      )
  
    const day =
      Number(
        match[3],
      )
  
  
    const date =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day,
        ),
      )
  
  
    if (
      date.getUTCFullYear() !==
        year ||
      date.getUTCMonth() !==
        month - 1 ||
      date.getUTCDate() !==
        day
    ) {
      return undefined
    }
  
  
    return date
  }
  
  
  function formatDateOnly(
    date: Date,
  ): string {
    const year =
      date.getUTCFullYear()
  
    const month =
      String(
        date.getUTCMonth() +
          1,
      ).padStart(
        2,
        '0',
      )
  
    const day =
      String(
        date.getUTCDate(),
      ).padStart(
        2,
        '0',
      )
  
  
    return `${year}-${month}-${day}`
  }
  
  
  function addDaysToDate(
    value: string,
    days: number,
  ): string | undefined {
    const date =
      parseDateOnly(
        value,
      )
  
    if (
      !date
    ) {
      return undefined
    }
  
  
    date.setUTCDate(
      date.getUTCDate() +
        days,
    )
  
  
    return formatDateOnly(
      date,
    )
  }
  
  
  /* =======================================
     SAFE TIMING RANGE
  ======================================= */
  
  interface ResolvedTimingRange {
    daysMin: number
    daysMax: number
  }
  
  
  function resolveTimingRange(
    daysMin?: number,
    daysMax?: number,
  ): ResolvedTimingRange | undefined {
    const firstValue =
      daysMin ??
      daysMax
  
    const secondValue =
      daysMax ??
      daysMin
  
  
    if (
      firstValue ===
        undefined ||
      secondValue ===
        undefined ||
      !Number.isFinite(
        firstValue,
      ) ||
      !Number.isFinite(
        secondValue,
      )
    ) {
      return undefined
    }
  
  
    const first =
      Math.max(
        0,
        Math.round(
          firstValue,
        ),
      )
  
    const second =
      Math.max(
        0,
        Math.round(
          secondValue,
        ),
      )
  
  
    return {
      daysMin:
        Math.min(
          first,
          second,
        ),
  
      daysMax:
        Math.max(
          first,
          second,
        ),
    }
  }
  
  
  /* =======================================
     CALENDAR TIMING WINDOW
  ======================================= */
  
  interface CalendarTimingWindow {
    startDate: string
    endDate: string
  }
  
  
  function calculateCalendarTimingWindow(
    referenceStartDate: string,
    referenceEndDate: string | undefined,
    daysMin: number | undefined,
    daysMax: number | undefined,
  ): CalendarTimingWindow | undefined {
    const timingRange =
      resolveTimingRange(
        daysMin,
        daysMax,
      )
  
  
    if (
      !timingRange
    ) {
      return undefined
    }
  
  
    const startDate =
      addDaysToDate(
        referenceStartDate,
        timingRange.daysMin,
      )
  
  
    const endDate =
      addDaysToDate(
        referenceEndDate ??
          referenceStartDate,
        timingRange.daysMax,
      )
  
  
    if (
      !startDate ||
      !endDate
    ) {
      return undefined
    }
  
  
    return {
      startDate,
      endDate,
    }
  }
  
  
  function formatCalendarTimingWindow(
    window:
      CalendarTimingWindow,
  ): string {
    const startDate =
      parseDateOnly(
        window.startDate,
      )
  
    const endDate =
      parseDateOnly(
        window.endDate,
      )
  
  
    if (
      !startDate ||
      !endDate
    ) {
      return `${window.startDate} to ${window.endDate}`
    }
  
  
    const formatter =
      new Intl.DateTimeFormat(
        'en-AU',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        },
      )
  
  
    return `${formatter.format(
      startDate,
    )} to ${formatter.format(
      endDate,
    )}`
  }
  
  
  /* =======================================
     SEARCH TEXT
  ======================================= */
  
  function makeSearchText(
    values:
      Array<
        string | undefined
      >,
  ): string {
    return values
      .filter(
        (
          value,
        ): value is string =>
          Boolean(
            value?.trim(),
          ),
      )
      .join(
        ' ',
      )
      .toLocaleLowerCase()
  }
  
  
  /* =======================================
     PLANT LABEL
  ======================================= */
  
  function getPlantLabel(
    plant: PlantStory,
  ): string {
    if (
      plant.displayName?.trim()
    ) {
      return plant.displayName.trim()
    }
  
  
    if (
      plant.variety?.trim()
    ) {
      return `${plant.plantName} · ${plant.variety}`
    }
  
  
    return plant.plantName
  }
  
  
  /* =======================================
     PLANNED PLANT LABEL
  ======================================= */
  
  function getPlannedPlantLabel(
    plan: GardenPlan,
  ): string | undefined {
    const plantName =
      plan
        .plannedPlant
        ?.plantName
        ?.trim()
  
    const variety =
      plan
        .plannedPlant
        ?.variety
        ?.trim()
  
  
    if (
      plantName &&
      variety
    ) {
      return `${variety} ${plantName}`
    }
  
  
    return (
      variety ||
      plantName ||
      undefined
    )
  }
  
  
  /* =======================================
     PLAN STATUS WORDING
  ======================================= */
  
  function getPlanStatusLabel(
    status: GardenPlanStatus,
  ): string {
    switch (
      status
    ) {
      case 'planned':
        return 'Still planned'
  
      case 'recorded':
        return 'Recorded in the garden'
  
      case 'not-done':
        return 'Decided not to'
  
      default:
        return 'Garden Plan'
    }
  }
  
  
  /* =======================================
     HARVEST TIMING REFERENCE
  ======================================= */
  
  function resolveHarvestReferenceDate(
    plant: PlantStory,
    events: GardenEvent[],
    purchases:
      GardenData['purchases'],
  ): string | undefined {
    const reference =
      plant.harvestTimingReference
  
  
    if (
      !reference
    ) {
      return undefined
    }
  
  
    switch (
      reference.sourceType
    ) {
      case 'sown':
        return plant.sownDate
  
      case 'planted':
        return plant.plantedDate
  
      case 'planted-out':
        return plant.plantedOutDate
  
      case 'garden-event': {
        if (
          !reference.eventId
        ) {
          return undefined
        }
  
        return events.find(
          event =>
            event.id ===
            reference.eventId,
        )?.date
      }
  
      case 'custom-date':
        return reference.customDate
  
      case 'purchased': {
        if (
          plant.originPurchaseId
        ) {
          return purchases.find(
            purchase =>
              purchase.id ===
              plant.originPurchaseId,
          )?.date
        }
  
        return undefined
      }
  
      default:
        return undefined
    }
  }
  
  
  /* =======================================
     PLANT STORY CALENDAR ITEMS
  ======================================= */
  
  function buildPlantCalendarItems(
    plant: PlantStory,
    data: GardenData,
  ): CalendarItem[] {
    const items:
      CalendarItem[] =
      []
  
  
    const plantLabel =
      getPlantLabel(
        plant,
      )
  
  
    const baseSearchValues = [
      plant.plantName,
      plant.variety,
      plant.displayName,
      plant.notes,
      ...(plant.tags ?? []),
    ]
  
  
    /* =======================================
       SOWN
    ======================================= */
  
    if (
      plant.sownDate
    ) {
      items.push({
        id:
          `plant:${plant.id}:sown`,
  
        startDate:
          plant.sownDate,
  
        timeType:
          'recorded',
  
        sourceType:
          'plant-story',
  
        sourceId:
          plant.id,
  
        kind:
          'sown',
  
        title:
          'Sown',
  
        contextLabel:
          plantLabel,
  
        sourceLabel:
          'Plant Story',
  
        plantStoryIds: [
          plant.id,
        ],
  
        canOpenSource:
          true,
  
        searchText:
          makeSearchText([
            ...baseSearchValues,
            plantLabel,
            'sown',
            'seed',
            'plant story',
          ]),
      })
    }
  
  
    /* =======================================
       PLANTED / STORY BEGAN
    ======================================= */
  
    items.push({
      id:
        `plant:${plant.id}:planted`,
  
      startDate:
        plant.plantedDate,
  
      timeType:
        'recorded',
  
      sourceType:
        'plant-story',
  
      sourceId:
        plant.id,
  
      kind:
        'planted',
  
      title:
        'Planted',
  
      contextLabel:
        plantLabel,
  
      description:
        plant.startMethod
          ? `Started by ${plant.startMethod}`
          : undefined,
  
      sourceLabel:
        'Plant Story',
  
      plantStoryIds: [
        plant.id,
      ],
  
      canOpenSource:
        true,
  
      searchText:
        makeSearchText([
          ...baseSearchValues,
          plantLabel,
          'planted',
          plant.startMethod,
          'plant story',
        ]),
    })
  
  
    /* =======================================
       PLANTED OUT
    ======================================= */
  
    if (
      plant.plantedOutDate
    ) {
      items.push({
        id:
          `plant:${plant.id}:planted-out`,
  
        startDate:
          plant.plantedOutDate,
  
        timeType:
          'recorded',
  
        sourceType:
          'plant-story',
  
        sourceId:
          plant.id,
  
        kind:
          'planted-out',
  
        title:
          'Planted out',
  
        contextLabel:
          plantLabel,
  
        sourceLabel:
          'Plant Story',
  
        plantStoryIds: [
          plant.id,
        ],
  
        canOpenSource:
          true,
  
        searchText:
          makeSearchText([
            ...baseSearchValues,
            plantLabel,
            'planted out',
            'transplanted',
            'plant story',
          ]),
      })
    }
  
  
    /* =======================================
       COMPLETED
    ======================================= */
  
    if (
      plant.completedAt
    ) {
      items.push({
        id:
          `plant:${plant.id}:completed`,
  
        startDate:
          plant.completedAt,
  
        timeType:
          'recorded',
  
        sourceType:
          'plant-story',
  
        sourceId:
          plant.id,
  
        kind:
          'completed',
  
        title:
          'Story completed',
  
        contextLabel:
          plantLabel,
  
        sourceLabel:
          'Plant Story',
  
        plantStoryIds: [
          plant.id,
        ],
  
        canOpenSource:
          true,
  
        searchText:
          makeSearchText([
            ...baseSearchValues,
            plantLabel,
            'completed',
            'finished',
            'plant story',
          ]),
      })
    }
  
  
    /* =======================================
       DIRECT PLANT STORY PHOTOGRAPHS
    ======================================= */
  
    plant.photoUrls?.forEach(
      (
        _photoUrl,
        index,
      ) => {
        const photoDate =
          plant
            .photoDates
            ?.[
              index
            ]
  
  
        if (
          !photoDate
        ) {
          return
        }
  
  
        items.push({
          id:
            `plant:${plant.id}:photo:${index}`,
  
          startDate:
            photoDate,
  
          timeType:
            'recorded',
  
          sourceType:
            'plant-photo',
  
          sourceId:
            plant.id,
  
          kind:
            'photo',
  
          title:
            'Photograph',
  
          contextLabel:
            plantLabel,
  
          description:
            'Along the way',
  
          sourceLabel:
            'Plant Story',
  
          plantStoryIds: [
            plant.id,
          ],
  
          canOpenSource:
            true,
  
          searchText:
            makeSearchText([
              ...baseSearchValues,
              plantLabel,
              'photo',
              'photograph',
              'along the way',
              'plant story',
            ]),
        })
      },
    )
  
  
    /* =======================================
       GROWING JOURNEY
    ======================================= */
  
    plant.growingHistory?.forEach(
      entry => {
        const place =
          entry.growingPlaceId
            ? data.growingPlaces.find(
                item =>
                  item.id ===
                  entry.growingPlaceId,
              )
            : undefined
  
  
        const setup =
          entry.growingSetupId
            ? data.growingSetups.find(
                item =>
                  item.id ===
                  entry.growingSetupId,
              )
            : undefined
  
  
        let kind:
          CalendarItemKind =
          'growing-change'
  
  
        if (
          place &&
          !setup
        ) {
          kind =
            'growing-place-change'
        } else if (
          setup &&
          !place
        ) {
          kind =
            'growing-setup-change'
        }
  
  
        const destinationParts = [
          place?.name,
          setup?.name,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(
              value,
            ),
        )
  
  
        let title =
          'Growing journey changed'
  
  
        if (
          place &&
          setup
        ) {
          title =
            'Growing place & recipe changed'
        } else if (
          place
        ) {
          title =
            'Growing place changed'
        } else if (
          setup
        ) {
          title =
            'Growing recipe changed'
        }
  
  
        const descriptionParts = [
          destinationParts.length >
          0
            ? destinationParts.join(
                ' · ',
              )
            : undefined,
  
          entry.notes,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(
              value?.trim(),
            ),
        )
  
  
        items.push({
          id:
            `plant:${plant.id}:growing:${entry.id}`,
  
          startDate:
            entry.startedDate,
  
          timeType:
            'recorded',
  
          sourceType:
            'growing-history',
  
          sourceId:
            entry.id,
  
          kind,
  
          title,
  
          contextLabel:
            plantLabel,
  
          description:
            descriptionParts.length >
            0
              ? descriptionParts.join(
                  ' · ',
                )
              : undefined,
  
          sourceLabel:
            'Growing Journey',
  
          plantStoryIds: [
            plant.id,
          ],
  
          growingPlaceIds:
            entry.growingPlaceId
              ? [
                  entry.growingPlaceId,
                ]
              : undefined,
  
          growingSetupIds:
            entry.growingSetupId
              ? [
                  entry.growingSetupId,
                ]
              : undefined,
  
          canOpenSource:
            true,
  
          searchText:
            makeSearchText([
              ...baseSearchValues,
              plantLabel,
              'growing journey',
              'growing place',
              'growing recipe',
              'moved',
              place?.name,
              setup?.name,
              entry.notes,
            ]),
        })
      },
    )
  
  
    /* =======================================
       EXPECTED HARVEST WINDOW
    ======================================= */
  
    const referenceDate =
      resolveHarvestReferenceDate(
        plant,
        data.events,
        data.purchases,
      )
  
  
    const timingRange =
      resolveTimingRange(
        plant.expectedHarvestDaysMin,
        plant.expectedHarvestDaysMax,
      )
  
  
    if (
      referenceDate &&
      timingRange
    ) {
      const startDate =
        addDaysToDate(
          referenceDate,
          timingRange.daysMin,
        )
  
      const endDate =
        addDaysToDate(
          referenceDate,
          timingRange.daysMax,
        )
  
  
      if (
        startDate &&
        endDate
      ) {
        const isSingleDay =
          startDate ===
          endDate
  
  
        items.push({
          id:
            `plant:${plant.id}:expected-harvest`,
  
          startDate,
  
          endDate,
  
          timeType:
            'expected',
  
          sourceType:
            'plant-story',
  
          sourceId:
            plant.id,
  
          kind:
            'expected-harvest',
  
          title:
            isSingleDay
              ? 'Likely harvest'
              : 'Likely harvest window',
  
          contextLabel:
            plantLabel,
  
          description:
            timingRange.daysMin ===
            timingRange.daysMax
              ? `${timingRange.daysMin} days from the harvest timing reference`
              : `${timingRange.daysMin}–${timingRange.daysMax} days from the harvest timing reference`,
  
          sourceLabel:
            'Plant Story',
  
          plantStoryIds: [
            plant.id,
          ],
  
          canOpenSource:
            true,
  
          searchText:
            makeSearchText([
              ...baseSearchValues,
              plantLabel,
              'expected harvest',
              'likely harvest',
              'harvest window',
              'plant story',
            ]),
        })
      }
    }
  
  
    return items
  }
  
  
  /* =======================================
     JOURNAL CALENDAR ITEMS
  ======================================= */
  function buildJournalCalendarItems(
    data: GardenData,
  ): CalendarItem[] {
    return data.events.map(
      event => {
        const plants =
          event.plantStoryIds
            .map(
              plantId =>
                data.plantStories.find(
                  plant =>
                    plant.id ===
                    plantId,
                ),
            )
            .filter(
              (
                plant,
              ): plant is PlantStory =>
                Boolean(
                  plant,
                ),
            )
  
  
        const plantNames =
          plants.map(
            getPlantLabel,
          )
  
  
        const places =
          (
            event.growingPlaceIds ??
            []
          )
            .map(
              placeId =>
                data.growingPlaces.find(
                  place =>
                    place.id ===
                    placeId,
                ),
            )
            .filter(
              (
                place,
              ): place is GardenData['growingPlaces'][number] =>
                Boolean(
                  place,
                ),
            )
  
  
        const placeNames =
          places.map(
            place =>
              place.name,
          )
  
  
        const contextParts = [
          plantNames.length >
          0
            ? plantNames.join(
                ', ',
              )
            : undefined,
  
          placeNames.length >
          0
            ? placeNames.join(
                ', ',
              )
            : undefined,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(
              value,
            ),
        )
  
  
        const descriptionParts = [
          event.notes?.trim()
            ? event.notes.trim()
            : undefined,
  
          event.photoUrls?.length
            ? `${event.photoUrls.length} ${
                event.photoUrls.length ===
                1
                  ? 'photograph'
                  : 'photographs'
              }`
            : undefined,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(
              value,
            ),
        )
  
  
        return {
          id:
            `journal:${event.id}`,
  
          startDate:
            event.date,
  
          timeType:
            'recorded',
  
          sourceType:
            'journal',
  
          sourceId:
            event.id,
  
          kind:
            'journal-event',
  
          title:
            event.title,
  
          contextLabel:
            contextParts.length >
            0
              ? contextParts.join(
                  ' · ',
                )
              : 'Garden Journal',
  
          description:
            descriptionParts.length >
            0
              ? descriptionParts.join(
                  ' · ',
                )
              : undefined,
  
          sourceLabel:
            'Garden Journal',
  
          plantStoryIds:
            event.plantStoryIds.length >
            0
              ? [
                  ...event.plantStoryIds,
                ]
              : undefined,
  
          growingPlaceIds:
            event.growingPlaceIds &&
            event.growingPlaceIds.length >
              0
              ? [
                  ...event.growingPlaceIds,
                ]
              : undefined,
  
          canOpenSource:
            true,
  
          searchText:
            makeSearchText([
              event.title,
              event.notes,
              event.type,
              ...(event.activityTypes ??
                []),
              event.productUsed,
              event.plantCategory,
              ...plantNames,
              ...placeNames,
              'journal',
              'garden journal',
            ]),
        } satisfies CalendarItem
      },
    )
  }
  
  
  /* =======================================
     HARVEST CALENDAR ITEMS
  ======================================= */
  
  function buildHarvestCalendarItems(
    data: GardenData,
  ): CalendarItem[] {
    return data.harvests.map(
      harvest => {
        const plants =
          harvest.plantStoryIds
            .map(
              plantId =>
                data.plantStories.find(
                  plant =>
                    plant.id ===
                    plantId,
                ),
            )
            .filter(
              (
                plant,
              ): plant is PlantStory =>
                Boolean(
                  plant,
                ),
            )
  
  
        const plantNames =
          plants.map(
            getPlantLabel,
          )
  
  
        const contextLabel =
          plantNames.length >
          0
            ? plantNames.join(
                ', ',
              )
            : 'Garden harvest'
  
  
        const harvestTypeLabel =
          harvest
            .customHarvestTypeLabel
            ?.trim() ||
          harvest.harvestType
  
  
        const descriptionParts = [
          harvestTypeLabel,
  
          harvest.quality
            ? `Quality: ${harvest.quality}`
            : undefined,
  
          harvest.notes?.trim()
            ? harvest.notes.trim()
            : undefined,
  
          harvest.photoUrls?.length
            ? `${harvest.photoUrls.length} ${
                harvest.photoUrls.length ===
                1
                  ? 'photograph'
                  : 'photographs'
              }`
            : undefined,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(
              value,
            ),
        )
  
  
        return {
          id:
            `harvest:${harvest.id}`,
  
          startDate:
            harvest.date,
  
          timeType:
            'recorded',
  
          sourceType:
            'harvest',
  
          sourceId:
            harvest.id,
  
          kind:
            'harvest',
  
          title:
            'Harvest',
  
          contextLabel,
  
          description:
            descriptionParts.length >
            0
              ? descriptionParts.join(
                  ' · ',
                )
              : undefined,
  
          sourceLabel:
            'Harvest Record',
  
          plantStoryIds:
            harvest.plantStoryIds.length >
            0
              ? [
                  ...harvest.plantStoryIds,
                ]
              : undefined,
  
          canOpenSource:
            true,
  
          searchText:
            makeSearchText([
              ...plantNames,
              harvest.harvestType,
              harvest.customHarvestTypeLabel,
              harvest.plantOutcome,
              harvest.customPlantOutcomeLabel,
              harvest.quality,
              harvest.notes,
              'harvest',
              'harvest record',
            ]),
        } satisfies CalendarItem
      },
    )
  }
  
  
  /* =======================================
     PURCHASE CALENDAR ITEMS
  ======================================= */
  
  function buildPurchaseCalendarItems(
    data: GardenData,
  ): CalendarItem[] {
    return data.purchases.map(
      purchase => {
        const descriptionParts = [
          purchase.brand?.trim()
            ? purchase.brand.trim()
            : undefined,
  
          purchase.supplier?.trim()
            ? `From ${purchase.supplier.trim()}`
            : undefined,
  
          purchase.notes?.trim()
            ? purchase.notes.trim()
            : undefined,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(
              value,
            ),
        )
  
  
        return {
          id:
            `purchase:${purchase.id}`,
  
          startDate:
            purchase.date,
  
          timeType:
            'recorded',
  
          sourceType:
            'purchase',
  
          sourceId:
            purchase.id,
  
          kind:
            'purchase',
  
          title:
            'Purchased',
  
          contextLabel:
            purchase.itemName,
  
          description:
            descriptionParts.length >
            0
              ? descriptionParts.join(
                  ' · ',
                )
              : undefined,
  
          sourceLabel:
            'Purchase Record',
  
          canOpenSource:
            false,
  
          searchText:
            makeSearchText([
              purchase.itemName,
              purchase.itemType,
              purchase.supplier,
              purchase.brand,
              purchase.notes,
              'purchase',
              'purchased',
              'bought',
            ]),
        } satisfies CalendarItem
      },
    )
  }
  
  
  /* =======================================
     GARDEN PLAN CALENDAR ITEMS
  ======================================= */
  
  function buildPlanCalendarItems(
    data: GardenData,
  ): CalendarItem[] {
    const items:
      CalendarItem[] =
      []
  
  
    ;(
      data.plans ??
      []
    ).forEach(
      plan => {
        const existingPlantNames =
          (
            plan.plantStoryIds ??
            []
          )
            .map(
              plantId =>
                data.plantStories.find(
                  plant =>
                    plant.id ===
                    plantId,
                ),
            )
            .filter(
              (
                plant,
              ): plant is PlantStory =>
                Boolean(
                  plant,
                ),
            )
            .map(
              getPlantLabel,
            )
  
  
        const plannedPlantLabel =
          getPlannedPlantLabel(
            plan,
          )
  
  
        const placeNames =
          (
            plan.growingPlaceIds ??
            []
          )
            .map(
              placeId =>
                data.growingPlaces.find(
                  place =>
                    place.id ===
                    placeId,
                )?.name,
            )
            .filter(
              (
                value,
              ): value is string =>
                Boolean(
                  value,
                ),
            )
  
  
        const setupNames =
          (
            plan.growingSetupIds ??
            []
          )
            .map(
              setupId =>
                data.growingSetups.find(
                  setup =>
                    setup.id ===
                    setupId,
                )?.name,
            )
            .filter(
              (
                value,
              ): value is string =>
                Boolean(
                  value,
                ),
            )
  
  
        const resultPlantStoryIds =
          (
            plan.results ??
            []
          )
            .filter(
              result =>
                result.recordType ===
                'plant-story',
            )
            .map(
              result =>
                result.recordId,
            )
            .filter(
              plantId =>
                data.plantStories.some(
                  plant =>
                    plant.id ===
                    plantId,
                ),
            )
  
  
        const resultPlantNames =
          resultPlantStoryIds
            .map(
              plantId =>
                data.plantStories.find(
                  plant =>
                    plant.id ===
                    plantId,
                ),
            )
            .filter(
              (
                plant,
              ): plant is PlantStory =>
                Boolean(
                  plant,
                ),
            )
            .map(
              getPlantLabel,
            )
  
  
        const intentionSubject =
          plannedPlantLabel ??
          (
            existingPlantNames.length >
            0
              ? existingPlantNames.join(
                  ', ',
                )
              : undefined
          )
  
  
        const contextParts = [
          intentionSubject,
  
          placeNames.length >
          0
            ? placeNames.join(
                ', ',
              )
            : undefined,
  
          setupNames.length >
          0
            ? setupNames.join(
                ', ',
              )
            : undefined,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(
              value?.trim(),
            ),
        )
  
  
        const kindLabel =
          plan.kind ===
            'other'
            ? plan.customKindLabel
            : plan.kind.replace(
                /-/g,
                ' ',
              )
  
  
        const statusLabel =
          getPlanStatusLabel(
            plan.status,
          )
  
  
        /* =======================================
           PLAN TIMING
        ======================================= */
  
        const planTimingRange =
          resolveTimingRange(
            plan
              .timingAssumption
              ?.daysMin,
            plan
              .timingAssumption
              ?.daysMax,
          )
  
  
        const timingWindow =
          calculateCalendarTimingWindow(
            plan.date,
            plan.endDate,
            planTimingRange
              ?.daysMin,
            planTimingRange
              ?.daysMax,
          )
  
  
        const timingDescriptionParts =
          planTimingRange
            ? [
                formatGardenTimingDays(
                  planTimingRange.daysMin,
                  planTimingRange.daysMax,
                ),
  
                formatGardenTimingWeeks(
                  planTimingRange.daysMin,
                  planTimingRange.daysMax,
                ),
  
                timingWindow
                  ? `Possible harvest ${formatCalendarTimingWindow(
                      timingWindow,
                    )}`
                  : undefined,
              ].filter(
                (
                  value,
                ): value is string =>
                  Boolean(
                    value?.trim(),
                  ),
              )
            : []
  
  
        const intentionDescriptionParts = [
          plan.notes?.trim()
            ? plan.notes.trim()
            : undefined,
  
          timingDescriptionParts.length >
          0
            ? timingDescriptionParts.join(
                ' · ',
              )
            : undefined,
  
          plan.status ===
            'recorded' &&
          resultPlantNames.length >
            0
            ? `Reality recorded: ${resultPlantNames.join(
                ', ',
              )}`
            : undefined,
  
          plan.status ===
            'not-done'
            ? 'This Plan was kept, but the gardener decided not to carry it out.'
            : undefined,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(
              value?.trim(),
            ),
        )
  
  
        /* =======================================
           ORIGINAL PLAN
        ======================================= */
  
        items.push({
          id:
            `plan:${plan.id}`,
  
          startDate:
            plan.date,
  
          endDate:
            plan.endDate,
  
          timeType:
            'planned',
  
          sourceType:
            'plan',
  
          sourceId:
            plan.id,
  
          kind:
            'plan',
  
          planRole:
            'intention',
  
          planStatus:
            plan.status,
  
          title:
            plan.title,
  
          contextLabel:
            contextParts.length >
            0
              ? contextParts.join(
                  ' · ',
                )
              : 'Garden Plan',
  
          description:
            intentionDescriptionParts.length >
            0
              ? intentionDescriptionParts.join(
                  ' · ',
                )
              : undefined,
  
          sourceLabel:
            plan.status ===
              'planned'
              ? 'Garden Plan'
              : `Garden Plan · ${statusLabel}`,
  
          plantStoryIds:
            plan.plantStoryIds &&
            plan.plantStoryIds.length >
              0
              ? [
                  ...plan.plantStoryIds,
                ]
              : undefined,
  
          growingPlaceIds:
            plan.growingPlaceIds &&
            plan.growingPlaceIds.length >
              0
              ? [
                  ...plan.growingPlaceIds,
                ]
              : undefined,
  
          growingSetupIds:
            plan.growingSetupIds &&
            plan.growingSetupIds.length >
              0
              ? [
                  ...plan.growingSetupIds,
                ]
              : undefined,
  
          resultPlantStoryIds:
            resultPlantStoryIds.length >
            0
              ? resultPlantStoryIds
              : undefined,
  
          canOpenSource:
            true,
  
          searchText:
            makeSearchText([
              plan.title,
              plan.notes,
              kindLabel,
              plan.customKindLabel,
              plannedPlantLabel,
              ...existingPlantNames,
              ...placeNames,
              ...setupNames,
              ...resultPlantNames,
              statusLabel,
              'plan',
              'garden plan',
  
              plan.status ===
                'planned'
                ? 'planned'
                : undefined,
  
              plan.status ===
                'recorded'
                ? 'recorded in garden reality'
                : undefined,
  
              plan.status ===
                'not-done'
                ? 'decided not to cancelled abandoned'
                : undefined,
            ]),
        })
  
  
        /* =======================================
           DERIVED FUTURE POSSIBILITY
        ======================================= */
  
        if (
          plan.status !==
            'planned' ||
          !timingWindow ||
          !planTimingRange
        ) {
          return
        }
  
  
        const possibilitySubject =
          intentionSubject ??
          plan.title
  
  
        const possibilityDescription = [
          formatGardenTimingDays(
            planTimingRange.daysMin,
            planTimingRange.daysMax,
          ),
  
          formatGardenTimingWeeks(
            planTimingRange.daysMin,
            planTimingRange.daysMax,
          ),
  
          `Based on ${plan.title}`,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(
              value?.trim(),
            ),
        )
  
  
        items.push({
          id:
            `plan:${plan.id}:possible-harvest`,
  
          startDate:
            timingWindow.startDate,
  
          endDate:
            timingWindow.endDate,
  
          timeType:
            'planned',
  
          sourceType:
            'plan',
  
          sourceId:
            plan.id,
  
          kind:
            'plan',
  
          planRole:
            'possibility',
  
          planStatus:
            plan.status,
  
          title:
            `Possible harvest · ${possibilitySubject}`,
  
          contextLabel:
            plan.title,
  
          description:
            possibilityDescription.join(
              ' · ',
            ),
  
          sourceLabel:
            'Garden Plan · possibility',
  
          plantStoryIds:
            plan.plantStoryIds &&
            plan.plantStoryIds.length >
              0
              ? [
                  ...plan.plantStoryIds,
                ]
              : undefined,
  
          growingPlaceIds:
            plan.growingPlaceIds &&
            plan.growingPlaceIds.length >
              0
              ? [
                  ...plan.growingPlaceIds,
                ]
              : undefined,
  
          growingSetupIds:
            plan.growingSetupIds &&
            plan.growingSetupIds.length >
              0
              ? [
                  ...plan.growingSetupIds,
                ]
              : undefined,
  
          canOpenSource:
            true,
  
          searchText:
            makeSearchText([
              plan.title,
              plannedPlantLabel,
              ...existingPlantNames,
              ...placeNames,
              ...setupNames,
              'possible harvest',
              'planned possibility',
              'garden plan',
            ]),
        })
      },
    )
  
  
    return items
  }
  
  
  /* =======================================
     BUILD COMPLETE CALENDAR INDEX
  ======================================= */
  
  export function buildCalendarIndex(
    data: GardenData,
  ): CalendarItem[] {
    const items:
      CalendarItem[] =
      []
  
  
    data.plantStories.forEach(
      plant => {
        items.push(
          ...buildPlantCalendarItems(
            plant,
            data,
          ),
        )
      },
    )
  
  
    items.push(
      ...buildJournalCalendarItems(
        data,
      ),
    )
  
  
    items.push(
      ...buildHarvestCalendarItems(
        data,
      ),
    )
  
  
    items.push(
      ...buildPurchaseCalendarItems(
        data,
      ),
    )
  
  
    items.push(
      ...buildPlanCalendarItems(
        data,
      ),
    )
  
  
    return items.sort(
      (
        first,
        second,
      ) => {
        const dateComparison =
          first
            .startDate
            .localeCompare(
              second.startDate,
            )
  
  
        if (
          dateComparison !==
          0
        ) {
          return dateComparison
        }
  
  
        return first
          .title
          .localeCompare(
            second.title,
          )
      },
    )
  }
  
  
  /* =======================================
     CALENDAR QUERY HELPERS
  ======================================= */
  
  export function getCalendarItemsForDate(
    items: CalendarItem[],
    date: string,
  ): CalendarItem[] {
    return items.filter(
      item => {
        if (
          !item.endDate
        ) {
          return (
            item.startDate ===
            date
          )
        }
  
  
        return (
          date >=
            item.startDate &&
          date <=
            item.endDate
        )
      },
    )
  }
  
  
  export function searchCalendarItems(
    items: CalendarItem[],
    query: string,
  ): CalendarItem[] {
    const cleanedQuery =
      query
        .trim()
        .toLocaleLowerCase()
  
  
    if (
      !cleanedQuery
    ) {
      return items
    }
  
  
    return items.filter(
      item =>
        item.searchText.includes(
          cleanedQuery,
        ),
    )
  }