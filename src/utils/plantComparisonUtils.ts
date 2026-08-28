import type {
    GardenEvent,
    HarvestRecord,
    PlantStory,
  } from '../types'
  
  
  export type PlantComparisonPhotoSource =
    | 'plant-story'
    | 'journal'
    | 'harvest'
  
  
  export interface PlantComparisonPhotoEvidence {
    photoUrl: string
  
    source:
      PlantComparisonPhotoSource
  
    sourceRecordId:
      string
  
    date:
      string
  
    daysAfterPlanting:
      number
  
    note?: string
  }
  
  
  /* =======================================
     DAYS BETWEEN DATES
  ======================================= */
  
  function getDaysBetween(
    startDate?: string,
    endDate?: string,
  ): number | undefined {
    if (
      !startDate ||
      !endDate
    ) {
      return undefined
    }
  
  
    const start =
      new Date(
        `${startDate.slice(
          0,
          10,
        )}T00:00:00`,
      )
  
  
    const end =
      new Date(
        `${endDate.slice(
          0,
          10,
        )}T00:00:00`,
      )
  
  
    if (
      Number.isNaN(
        start.getTime(),
      ) ||
      Number.isNaN(
        end.getTime(),
      )
    ) {
      return undefined
    }
  
  
    return Math.max(
      0,
      Math.round(
        (
          end.getTime() -
          start.getTime()
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
     BUILD PHOTO EVIDENCE
  ======================================= */
  
  export function buildPlantComparisonPhotoEvidence(
    plant: PlantStory,
    events: GardenEvent[],
    harvests: HarvestRecord[],
  ): PlantComparisonPhotoEvidence[] {
  
    /*
     * Direct Plant Story photographs now
     * carry their own optional dates.
     *
     * photoUrls and photoDates deliberately
     * remain aligned by index for backwards
     * compatibility with existing gardens.
     *
     * Older undated photographs remain valid
     * Plant Story photographs, but cannot be
     * used for growing-age comparison because
     * Sprig must never invent their dates.
     */
  
    const plantStoryEvidence:
      PlantComparisonPhotoEvidence[] =
      (
        plant.photoUrls ??
        []
      ).flatMap(
        (
          photoUrl,
          index,
        ) => {
          const photoDate =
            plant.photoDates?.[
              index
            ]
  
  
          if (
            !photoDate
          ) {
            return []
          }
  
  
          const daysAfterPlanting =
            getDaysBetween(
              plant.plantedDate,
              photoDate,
            )
  
  
          if (
            daysAfterPlanting ===
            undefined
          ) {
            return []
          }
  
  
          return [
            {
              photoUrl,
  
              source:
                'plant-story' as const,
  
              sourceRecordId:
                plant.id,
  
              date:
                photoDate,
  
              daysAfterPlanting,
  
              note:
                'Plant Story',
            },
          ]
        },
      )
  
  
    /*
     * Journal photographs inherit the date
     * of their Journal entry.
     */
  
    const journalEvidence:
      PlantComparisonPhotoEvidence[] =
      events
        .filter(
          (
            event,
          ) =>
            event.plantStoryIds.includes(
              plant.id,
            ) &&
            (
              event.photoUrls?.length ??
              0
            ) >
              0,
        )
        .flatMap(
          (
            event,
          ) => {
            const daysAfterPlanting =
              getDaysBetween(
                plant.plantedDate,
                event.date,
              )
  
  
            if (
              daysAfterPlanting ===
              undefined
            ) {
              return []
            }
  
  
            return (
              event.photoUrls ??
              []
            ).map(
              (
                photoUrl,
              ) => ({
                photoUrl,
  
                source:
                  'journal' as const,
  
                sourceRecordId:
                  event.id,
  
                date:
                  event.date,
  
                daysAfterPlanting,
  
                note:
                  event.title,
              }),
            )
          },
        )
  
  
    /*
     * Harvest photographs inherit the date
     * of their Harvest record.
     */
  
    const harvestEvidence:
      PlantComparisonPhotoEvidence[] =
      harvests
        .filter(
          (
            harvest,
          ) =>
            harvest.plantStoryIds.includes(
              plant.id,
            ) &&
            (
              harvest.photoUrls?.length ??
              0
            ) >
              0,
        )
        .flatMap(
          (
            harvest,
          ) => {
            const daysAfterPlanting =
              getDaysBetween(
                plant.plantedDate,
                harvest.date,
              )
  
  
            if (
              daysAfterPlanting ===
              undefined
            ) {
              return []
            }
  
  
            return (
              harvest.photoUrls ??
              []
            ).map(
              (
                photoUrl,
              ) => ({
                photoUrl,
  
                source:
                  'harvest' as const,
  
                sourceRecordId:
                  harvest.id,
  
                date:
                  harvest.date,
  
                daysAfterPlanting,
  
                note:
                  'Harvest',
              }),
            )
          },
        )
  
  
    /*
     * All dated photographic evidence now
     * enters Comparison through one path,
     * regardless of where in Sprig the
     * photograph belongs.
     */
  
    return [
      ...plantStoryEvidence,
      ...journalEvidence,
      ...harvestEvidence,
    ].sort(
      (
        first,
        second,
      ) =>
        first.daysAfterPlanting -
        second.daysAfterPlanting,
    )
  }


  /* =======================================
   FIND CLOSEST PHOTO TO TARGET AGE
======================================= */

export function findClosestPhotoEvidence(
    evidence:
      PlantComparisonPhotoEvidence[],
    targetDaysAfterPlanting:
      number,
    maximumDifferenceDays =
      21,
  ): PlantComparisonPhotoEvidence | undefined {
  
    if (
      evidence.length ===
      0
    ) {
      return undefined
    }
  
  
    const closest =
      evidence.reduce(
        (
          currentClosest,
          current,
        ) => {
  
          const closestDifference =
            Math.abs(
              currentClosest.daysAfterPlanting -
              targetDaysAfterPlanting,
            )
  
  
          const currentDifference =
            Math.abs(
              current.daysAfterPlanting -
              targetDaysAfterPlanting,
            )
  
  
          if (
            currentDifference <
            closestDifference
          ) {
            return current
          }
  
  
          /*
           * If two photographs are equally
           * close to the target age, prefer
           * the later photograph.
           *
           * This gives Sprig a predictable
           * result rather than relying on
           * array order.
           */
  
          if (
            currentDifference ===
              closestDifference &&
            current.daysAfterPlanting >
              currentClosest.daysAfterPlanting
          ) {
            return current
          }
  
  
          return currentClosest
        },
      )
  
  
    const differenceFromTarget =
      Math.abs(
        closest.daysAfterPlanting -
        targetDaysAfterPlanting,
      )
  
  
    if (
      differenceFromTarget >
      maximumDifferenceDays
    ) {
      return undefined
    }
  
  
    return closest
  }
  
  
  /* =======================================
     DYNAMIC COMPARISON AGE
  ======================================= */
  
  export interface PlantComparisonAgeCheckpoint {
    targetDays: number
  
    label: string
  
    matchedPlantCount: number
  }
  
  
  interface PlantComparisonAgeCandidate {
    targetDays: number
  
    matchedPlantCount: number
  
    totalDifference: number
  }
  
  
  /* =======================================
     AGE LABEL
  ======================================= */
  
  function formatComparisonAgeLabel(
    days: number,
  ): string {
  
    /*
     * Younger plants are easier to think
     * about in weeks.
     */
  
    if (
      days <
      84
    ) {
      const weeks =
        Math.max(
          1,
          Math.round(
            days /
            7,
          ),
        )
  
      return `Around ${weeks} ${
        weeks === 1
          ? 'week'
          : 'weeks'
      }`
    }
  
  
    /*
     * Through the main growing season,
     * months are usually the most useful
     * human scale.
     */
  
    if (
      days <
      330
    ) {
      const months =
        Math.max(
          1,
          Math.round(
            days /
            30.44,
          ),
        )
  
      return `Around ${months} ${
        months === 1
          ? 'month'
          : 'months'
      }`
    }
  
  
    /*
     * Older perennial or long-lived Plant
     * Stories may continue for years.
     */
  
    const years =
      Math.floor(
        days /
        365,
      )
  
  
    const remainingDays =
      days -
      years *
        365
  
  
    const remainingMonths =
      Math.round(
        remainingDays /
        30.44,
      )
  
  
    if (
      remainingMonths <=
        1 ||
      remainingMonths >=
        11
    ) {
      const roundedYears =
        remainingMonths >=
        11
          ? years + 1
          : Math.max(
              1,
              years,
            )
  
      return `Around ${roundedYears} ${
        roundedYears === 1
          ? 'year'
          : 'years'
      }`
    }
  
  
    return `Around ${years} ${
      years === 1
        ? 'year'
        : 'years'
    } ${remainingMonths} ${
      remainingMonths === 1
        ? 'month'
        : 'months'
    }`
  }
  
  
  /* =======================================
     BUILD DYNAMIC AGE CHECKPOINTS
  ======================================= */
  
  export function buildPlantComparisonAgeCheckpoints(
    plants:
      PlantStory[],
    events:
      GardenEvent[],
    harvests:
      HarvestRecord[],
    maximumDifferenceDays =
      21,
  ): PlantComparisonAgeCheckpoint[] {
  
    if (
      plants.length <
      2
    ) {
      return []
    }
  
  
    /*
     * Build each Plant Story's dated photo
     * evidence once.
     */
  
    const evidenceByPlant =
      new Map<
        string,
        PlantComparisonPhotoEvidence[]
      >()
  
  
    plants.forEach(
      (
        plant,
      ) => {
        evidenceByPlant.set(
          plant.id,
  
          buildPlantComparisonPhotoEvidence(
            plant,
            events,
            harvests,
          ),
        )
      },
    )
  
  
    /*
     * Every real photographed age becomes
     * a possible comparison checkpoint.
     *
     * Sprig does not invent 4, 8 or 12 week
     * milestones anymore. The garden's actual
     * photographic record proposes them.
     */
  
    const candidateDays =
      Array.from(
        new Set(
          Array.from(
            evidenceByPlant.values(),
          ).flatMap(
            (
              evidence,
            ) =>
              evidence.map(
                (
                  photo,
                ) =>
                  photo.daysAfterPlanting,
              ),
          ),
        ),
      ).sort(
        (
          first,
          second,
        ) =>
          first -
          second,
      )
  
  
      const candidates:
    PlantComparisonAgeCandidate[] =
    candidateDays
      .map(
        (
          targetDays,
        ) => {

          const matches =
            plants
              .map(
                (
                  plant,
                ) => {

                  const evidence =
                    evidenceByPlant.get(
                      plant.id,
                    ) ??
                    []


                  const closest =
                    findClosestPhotoEvidence(
                      evidence,
                      targetDays,
                      maximumDifferenceDays,
                    )


                  if (!closest) {
                    return undefined
                  }


                  return {
                    closest,

                    difference:
                      Math.abs(
                        closest.daysAfterPlanting -
                        targetDays,
                      ),
                  }
                },
              )
              .filter(
                (
                  match,
                ): match is {
                  closest:
                    PlantComparisonPhotoEvidence

                  difference:
                    number
                } =>
                  Boolean(
                    match,
                  ),
              )


          return {
            targetDays,

            matchedPlantCount:
              matches.length,

            totalDifference:
              matches.reduce(
                (
                  total,
                  match,
                ) =>
                  total +
                  match.difference,
                0,
              ),
          }
        },
      )
      .filter(
        (
          candidate,
        ) =>
          candidate.matchedPlantCount >=
          1,
      )
  
  
    if (
      candidates.length ===
      0
    ) {
      return []
    }
  
  
    /*
     * Several photographs close together can
     * all propose essentially the same stage.
     *
     * Choose the strongest checkpoints first:
     *
     * 1. most Plant Stories matched
     * 2. smallest combined age difference
     * 3. earlier age when otherwise tied
     */
  
    const strongestFirst =
      [
        ...candidates,
      ].sort(
        (
          first,
          second,
        ) => {
  
          if (
            second.matchedPlantCount !==
            first.matchedPlantCount
          ) {
            return (
              second.matchedPlantCount -
              first.matchedPlantCount
            )
          }
  
  
          if (
            first.totalDifference !==
            second.totalDifference
          ) {
            return (
              first.totalDifference -
              second.totalDifference
            )
          }
  
  
          return (
            first.targetDays -
            second.targetDays
          )
        },
      )
  
  
    const chosen:
      PlantComparisonAgeCandidate[] =
      []
  
  
    /*
     * Keep checkpoints meaningfully separated.
     *
     * With a ±21 day comparison window,
     * checkpoints less than six weeks apart
     * substantially overlap and usually tell
     * the same visual story.
     */
  
    const minimumCheckpointSeparation =
      maximumDifferenceDays *
      2
  
  
    strongestFirst.forEach(
      (
        candidate,
      ) => {
  
        const overlapsExisting =
          chosen.some(
            (
              existing,
            ) =>
              Math.abs(
                existing.targetDays -
                candidate.targetDays,
              ) <
              minimumCheckpointSeparation,
          )
  
  
        if (
          overlapsExisting
        ) {
          return
        }
  
  
        chosen.push(
          candidate,
        )
      },
    )
  
  
    return chosen
      .sort(
        (
          first,
          second,
        ) =>
          first.targetDays -
          second.targetDays,
      )
      .map(
        (
          candidate,
        ) => ({
          targetDays:
            candidate.targetDays,
  
          matchedPlantCount:
            candidate.matchedPlantCount,
  
          label:
            formatComparisonAgeLabel(
              candidate.targetDays,
            ),
        }),
      )
  }