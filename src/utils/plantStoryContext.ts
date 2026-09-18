import type {
    GardenEvent,
    GardenProduct,
    GrowingPlace,
    HarvestRecord,
    PlantStory,
  } from '../types'
  
  
  export interface PlantStoryMemoryClue {
    date: string
    summary: string
  }
  
  
  export interface PlantStoryCardContext {
    growingPlaceName?: string
    latestActivityDate?: string
    latestActivitySummary?: string
    thumbnailPhotoUrl?: string
  }
  
  
  /* =======================================
     TEXT
  ======================================= */
  
  function cleanMemoryText(
    value:
      string | undefined,
  ): string {
    return (
      value ??
      ''
    )
      .replace(
        /\s+/g,
        ' ',
      )
      .trim()
  }
  
  
  function shortenMemoryText(
    value:
      string,
    maxLength =
      74,
  ): string {
    if (
      value.length <=
      maxLength
    ) {
      return value
    }
  
  
    return `${
      value
        .slice(
          0,
          maxLength - 1,
        )
        .trimEnd()
    }…`
  }
  
  
  /* =======================================
     EVENT LABEL
  ======================================= */
  
  function formatEventTypeLabel(
    type:
      GardenEvent['type'],
  ): string {
    switch (
      type
    ) {
      case 'observation':
        return 'Observed'
  
      case 'watered':
        return 'Watered'
  
      case 'fed':
        return 'Fertilised'
  
      case 'sprouted':
        return 'Sprouted'
  
      case 'pruned':
        return 'Pruned'
  
      case 'treated':
        return 'Treated'
  
      case 'moved':
        return 'Moved'
  
      case 'transplanted':
        return 'Transplanted'
  
      case 'hilled':
        return 'Hilled'
  
      case 'weather':
        return 'Weather'
  
      case 'photo':
        return 'Photograph'
  
      case 'note':
        return 'Note'
  
      case 'harvest':
        return 'Harvest'
  
      case 'planted':
        return 'Planted'
  
      default:
        return 'Garden moment'
    }
  }
  
  
  /* =======================================
     EVENT MEMORY
  ======================================= */
  
  function getEventMemorySummary(
    event:
      GardenEvent,
  
    growingPlaces:
      GrowingPlace[],
  
    products:
      GardenProduct[],
  ): string {
    const activityTypes =
      event.activityTypes
        ?.length
        ? event.activityTypes
        : [
            event.type,
          ]
  
  
    const activityLabel =
      activityTypes
        .map(
          activity =>
            formatEventTypeLabel(
              activity,
            ),
        )
        .join(
          ' + ',
        )
  
  
    const title =
      cleanMemoryText(
        event.title,
      )
  
  
    const note =
      cleanMemoryText(
        event.notes,
      )
  
  
    const treatmentReason =
      cleanMemoryText(
        event.treatmentReason,
      )
  
  
    const productText =
      cleanMemoryText(
        event.productUsed,
      )
  
  
    const genericTitles = [
      activityLabel
        .toLocaleLowerCase(),
  
      'garden moment',
      'adding a moment',
      'add a moment',
      'journal entry',
      'adding this page',
      'new journal entry',
    ]
  
  
    const titleIsUseful =
      Boolean(
        title,
      ) &&
      !genericTitles.includes(
        title
          .toLocaleLowerCase(),
      )
  
  
    if (
      titleIsUseful
    ) {
      return shortenMemoryText(
        `${activityLabel} · ${title}`,
      )
    }
  
  
    if (
      activityTypes.includes(
        'treated',
      ) &&
      treatmentReason
    ) {
      return shortenMemoryText(
        `Treated · ${treatmentReason}`,
      )
    }
  
  
    if (
      note
    ) {
      return shortenMemoryText(
        `${activityLabel} · ${note}`,
      )
    }
  
  
    const linkedProductNames =
      (
        event.productIds ??
        []
      )
        .map(
          productId =>
            products.find(
              product =>
                product.id ===
                productId,
            )?.name,
        )
        .filter(
          (
            name,
          ): name is string =>
            Boolean(
              name,
            ),
        )
  
  
    if (
      linkedProductNames.length >
      0
    ) {
      return shortenMemoryText(
        `${activityLabel} · ${
          linkedProductNames.join(
            ' · ',
          )
        }`,
      )
    }
  
  
    if (
      productText
    ) {
      return shortenMemoryText(
        `${activityLabel} · ${productText}`,
      )
    }
  
  
    const photoContext =
      (
        event.photoMetadata ??
        []
      )
        .map(
          metadata => {
            if (
              !metadata
            ) {
              return ''
            }
  
  
            const photoTitle =
              cleanMemoryText(
                metadata.title,
              )
  
  
            if (
              photoTitle
            ) {
              return photoTitle
            }
  
  
            const photoNotes =
              cleanMemoryText(
                metadata.notes,
              )
  
  
            if (
              photoNotes
            ) {
              return photoNotes
            }
  
  
            if (
              metadata.purpose
            ) {
              return metadata.purpose
                .replaceAll(
                  '-',
                  ' ',
                )
                .replace(
                  /\b\w/g,
                  letter =>
                    letter.toUpperCase(),
                )
            }
  
  
            return ''
          },
        )
        .find(
          Boolean,
        )
  
  
    if (
      photoContext
    ) {
      return shortenMemoryText(
        `${activityLabel} · ${photoContext}`,
      )
    }
  
  
    const placeNames =
      (
        event.growingPlaceIds ??
        []
      )
        .map(
          placeId =>
            growingPlaces.find(
              place =>
                place.id ===
                placeId,
            )?.name,
        )
        .filter(
          (
            name,
          ): name is string =>
            Boolean(
              name,
            ),
        )
  
  
    if (
      placeNames.length >
      0
    ) {
      return shortenMemoryText(
        `${activityLabel} · ${
          placeNames.join(
            ' · ',
          )
        }`,
      )
    }
  
  
    return activityLabel
  }
  
  
  /* =======================================
     HARVEST MEMORY
  ======================================= */
  
  function getHarvestMemorySummary(
    harvest:
      HarvestRecord,
  ): string {
    const details:
      string[] = []
  
  
    if (
      harvest.count !==
      undefined
    ) {
      details.push(
        `${harvest.count} ${
          harvest.count ===
          1
            ? 'item'
            : 'items'
        }`,
      )
    }
  
  
    if (
      harvest.measurementAmount !==
      undefined
    ) {
      const measurementUnit =
        harvest.customMeasurementUnitLabel ??
        harvest.measurementUnit
  
  
      details.push(
        measurementUnit
          ? `${harvest.measurementAmount} ${
              measurementUnit
                .replaceAll(
                  '-',
                  ' ',
                )
            }`
          : String(
              harvest.measurementAmount,
            ),
      )
    }
  
  
    if (
      harvest.quality
    ) {
      details.push(
        harvest.quality
          .charAt(
            0,
          )
          .toUpperCase() +
        harvest.quality
          .slice(
            1,
          ),
      )
    }
  
  
    const notes =
      cleanMemoryText(
        harvest.notes,
      )
  
  
    if (
      details.length ===
        0 &&
      notes
    ) {
      details.push(
        notes,
      )
    }
  
  
    return shortenMemoryText(
      details.length >
        0
        ? `Harvest · ${
            details.join(
              ' · ',
            )
          }`
        : 'Harvest',
    )
  }
  
  
  /* =======================================
     PHOTO MEMORY
  ======================================= */
  
  function getPhotoMemorySummary(
    title:
      string | undefined,
  
    notes:
      string | undefined,
  
    purpose:
      string | undefined,
  ): string {
    const titleText =
      cleanMemoryText(
        title,
      )
  
  
    if (
      titleText
    ) {
      return shortenMemoryText(
        `Photograph · ${titleText}`,
      )
    }
  
  
    const notesText =
      cleanMemoryText(
        notes,
      )
  
  
    if (
      notesText
    ) {
      return shortenMemoryText(
        `Photograph · ${notesText}`,
      )
    }
  
  
    if (
      purpose
    ) {
      return `Photograph · ${
        purpose
          .replaceAll(
            '-',
            ' ',
          )
          .replace(
            /\b\w/g,
            letter =>
              letter.toUpperCase(),
          )
      }`
    }
  
  
    return 'Photograph'
  }
  
  
  /* =======================================
     LATEST MEMORY CLUE
  ======================================= */
  
  interface RankedMemoryClue
    extends PlantStoryMemoryClue {
    priority: number
  }
  
  
  export function getLatestPlantMemoryClue(
    plant:
      PlantStory,
  
    events:
      GardenEvent[],
  
    harvests:
      HarvestRecord[],
  
    growingPlaces:
      GrowingPlace[],
  
    products:
      GardenProduct[],
  ): PlantStoryMemoryClue | undefined {
    const plantEvents =
      events.filter(
        event =>
          event.plantStoryIds.length ===
            0 ||
          event.plantStoryIds.includes(
            plant.id,
          ),
      )
  
  
    const plantHarvests =
      harvests.filter(
        harvest =>
          harvest.plantStoryIds.includes(
            plant.id,
          ),
      )
  
  
    const clues:
      RankedMemoryClue[] =
      []
  
  
    plantEvents.forEach(
      (
        event,
        index,
      ) => {
        clues.push({
          date:
            event.date,
  
          summary:
            getEventMemorySummary(
              event,
              growingPlaces,
              products,
            ),
  
          /*
           * Journal wins an exact-date tie.
           * Later-created Journal Moments win
           * within that same day.
           */
          priority:
            300000 +
            index,
        })
      },
    )
  
  
    plantHarvests.forEach(
      (
        harvest,
        index,
      ) => {
        clues.push({
          date:
            harvest.date,
  
          summary:
            getHarvestMemorySummary(
              harvest,
            ),
  
          priority:
            200000 +
            index,
        })
      },
    )
  
  
    ;(
      plant.photoUrls ??
      []
    ).forEach(
      (
        _photoUrl,
        index,
      ) => {
        const metadata =
          plant.photoMetadata?.[
            index
          ]
  
  
        const photoDate =
          metadata
            ?.photoDate ??
          plant.photoDates?.[
            index
          ]
  
  
        if (
          !photoDate
        ) {
          return
        }
  
  
        clues.push({
          date:
            photoDate,
  
          summary:
            getPhotoMemorySummary(
              metadata?.title,
              metadata?.notes,
              metadata?.purpose,
            ),
  
          priority:
            100000 +
            index,
        })
      },
    )
  
  
    if (
      clues.length ===
      0
    ) {
      return undefined
    }
  
  
    const latest =
      [
        ...clues,
      ].sort(
        (
          first,
          second,
        ) => {
          const dateDifference =
            second.date.localeCompare(
              first.date,
            )
  
  
          if (
            dateDifference !==
            0
          ) {
            return dateDifference
          }
  
  
          return (
            second.priority -
            first.priority
          )
        },
      )[0]
  
  
    return {
      date:
        latest.date,
  
      summary:
        latest.summary,
    }
  }
  
  
  /* =======================================
     LATEST USEFUL THUMBNAIL
  ======================================= */
  
  interface PhotoCandidate {
    photoUrl: string
    date: string
    priority: number
  }
  
  
  function getPhotoDate(
    metadataDate:
      string | undefined,
  
    legacyDate:
      string | undefined,
  
    fallback:
      string,
  ): string {
    return (
      metadataDate ??
      legacyDate ??
      fallback
    )
  }
  
  
  export function getLatestPlantThumbnail(
    plant:
      PlantStory,
  
    events:
      GardenEvent[],
  
    harvests:
      HarvestRecord[],
  ): string | undefined {
    const plantEvents =
      events.filter(
        event =>
          event.plantStoryIds.length ===
            0 ||
          event.plantStoryIds.includes(
            plant.id,
          ),
      )
  
  
    const plantHarvests =
      harvests.filter(
        harvest =>
          harvest.plantStoryIds.includes(
            plant.id,
          ),
      )
  
  
    const candidates:
      PhotoCandidate[] =
      []
  
  
    for (
      let index = 0;
      index <
      (
        plant.photoUrls ??
        []
      ).length;
      index += 1
    ) {
      const photoUrl =
        plant.photoUrls?.[
          index
        ]
  
  
      if (
        !photoUrl
      ) {
        continue
      }
  
  
      candidates.push({
        photoUrl,
  
        date:
          getPhotoDate(
            plant.photoMetadata?.[
              index
            ]?.photoDate,
            plant.photoDates?.[
              index
            ],
            plant.updatedAt ??
              plant.plantedDate,
          ),
  
        priority:
          3,
      })
    }
  
  
    for (
      const event
      of plantEvents
    ) {
      for (
        let index = 0;
        index <
        (
          event.photoUrls ??
          []
        ).length;
        index += 1
      ) {
        const photoUrl =
          event.photoUrls?.[
            index
          ]
  
  
        if (
          !photoUrl
        ) {
          continue
        }
  
  
        candidates.push({
          photoUrl,
  
          date:
            getPhotoDate(
              event.photoMetadata?.[
                index
              ]?.photoDate,
              undefined,
              event.date,
            ),
  
          priority:
            2,
        })
      }
    }
  
  
    for (
      const harvest
      of plantHarvests
    ) {
      for (
        let index = 0;
        index <
        (
          harvest.photoUrls ??
          []
        ).length;
        index += 1
      ) {
        const photoUrl =
          harvest.photoUrls?.[
            index
          ]
  
  
        if (
          !photoUrl
        ) {
          continue
        }
  
  
        candidates.push({
          photoUrl,
  
          date:
            getPhotoDate(
              harvest.photoMetadata?.[
                index
              ]?.photoDate,
              undefined,
              harvest.date,
            ),
  
          priority:
            1,
        })
      }
    }
  
  
    if (
      candidates.length ===
      0
    ) {
      return undefined
    }
  
  
    candidates.sort(
      (
        first,
        second,
      ) => {
        const dateDifference =
          second.date.localeCompare(
            first.date,
          )
  
  
        if (
          dateDifference !==
          0
        ) {
          return dateDifference
        }
  
  
        return (
          second.priority -
          first.priority
        )
      },
    )
  
  
    return candidates[0]
      .photoUrl
  }
  
  
  /* =======================================
     COMPLETE CARD CONTEXT
  ======================================= */
  
  export function getPlantStoryCardContext(
    plant:
      PlantStory,
  
    events:
      GardenEvent[],
  
    harvests:
      HarvestRecord[],
  
    growingPlaces:
      GrowingPlace[],
  
    products:
      GardenProduct[],
  ): PlantStoryCardContext {
    const growingPlace =
      growingPlaces.find(
        place =>
          place.id ===
          plant.currentGrowingPlaceId,
      )
  
  
    const latestMemoryClue =
      getLatestPlantMemoryClue(
        plant,
        events,
        harvests,
        growingPlaces,
        products,
      )
  
  
    return {
      growingPlaceName:
        growingPlace?.name,
  
      latestActivityDate:
        latestMemoryClue?.date,
  
      latestActivitySummary:
        latestMemoryClue?.summary,
  
      thumbnailPhotoUrl:
        getLatestPlantThumbnail(
          plant,
          events,
          harvests,
        ),
    }
  }
