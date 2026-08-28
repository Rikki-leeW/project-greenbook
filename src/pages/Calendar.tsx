import {
    useMemo,
    useState,
  } from 'react'
  
  import type {
    KeyboardEvent,
  } from 'react'
  
  import GardenLayout from '../components/layout/GardenLayout'
  import GardenTimingCalculator from '../components/GardenTimingCalculator'
  
  import '../css/calendar.css'
  
  import type {
    GardenData,
    GardenEvent,
    GardenPlan,
    GardenPlanKind,
    GardenPlanStatus,
    GardenPlanTimingReference,
    HarvestRecord,
    PlantStory,
    PurchaseRecord,
  } from '../types'
  
  import type {
    AppPage,
  } from '../types/navigation'
  
  import {
    buildCalendarIndex,
    getCalendarItemsForDate,
    searchCalendarItems,
  } from '../utils/calendarUtils'
  
  import type {
    CalendarItem,
    CalendarTimeType,
  } from '../utils/calendarUtils'
  
  
  interface CalendarProps {
    gardenData: GardenData
  
    onAddPlan: (
      plan: GardenPlan,
    ) => void
  
    onUpdatePlan: (
      plan: GardenPlan,
    ) => void
  
    onRecordPlan: (
      plan: GardenPlan,
    ) => void
  
    onNavigate: (
      page: AppPage,
    ) => void
  
    onOpenPlant: (
      plantId: string,
    ) => void
  
    onOpenJournalEntry: (
      eventId: string,
    ) => void
  
    onOpenHarvest: (
        harvestId: string,
      ) => void
    
      onOpenPurchase: (
        purchaseId: string,
      ) => void
    
      onOpenGrowingPlace: (
        growingPlaceId: string,
      ) => void
  
    onOpenGrowingRecipe: (
      growingSetupId: string,
    ) => void
  }
  
  
  type CalendarFilter =
    CalendarTimeType
  
  
  type PlanDateMode =
    | 'single'
    | 'range'
  
  
  type DayStoryGroupId =
    | 'recorded'
    | 'expected'
    | 'planned-active'
    | 'planned-recorded'
    | 'planned-not-done'
  
  
  interface DayStoryGroup {
    id: DayStoryGroupId
    timeType: CalendarTimeType
    label: string
    heading: string
    items: CalendarItem[]
  }
  
  
  const CALENDAR_FILTERS:
    Array<{
      id: CalendarFilter
      label: string
      icon: string
    }> = [
      {
        id: 'recorded',
        label: 'Recorded',
        icon: '●',
      },
  
      {
        id: 'expected',
        label: 'Expected',
        icon: '○',
      },
  
      {
        id: 'planned',
        label: 'Planned',
        icon: '◇',
      },
    ]
  
  
  const ALL_CALENDAR_FILTERS:
    CalendarFilter[] = [
      'recorded',
      'expected',
      'planned',
    ]
  
  
  const GARDEN_PLAN_KIND_OPTIONS:
    Array<{
      id: GardenPlanKind
      label: string
      icon: string
    }> = [
      {
        id: 'sow',
        label: 'Sow',
        icon: '🌱',
      },
  
      {
        id: 'plant',
        label: 'Plant',
        icon: '🪴',
      },
  
      {
        id: 'plant-out',
        label: 'Plant out',
        icon: '🌿',
      },
  
      {
        id: 'move',
        label: 'Move',
        icon: '↗',
      },
  
      {
        id: 'feed',
        label: 'Feed',
        icon: '🌾',
      },
  
      {
        id: 'treat',
        label: 'Treat',
        icon: '🧴',
      },
  
      {
        id: 'harvest',
        label: 'Harvest',
        icon: '🧺',
      },
  
      {
        id: 'buy',
        label: 'Buy',
        icon: '🛒',
      },
  
      {
        id: 'garden-task',
        label: 'Garden task',
        icon: '📌',
      },
  
      {
        id: 'other',
        label: 'Something else',
        icon: '✎',
      },
    ]
  
  
  function planKindCreatesFuturePlant(
    kind: GardenPlanKind,
  ): boolean {
    return (
      kind === 'sow' ||
      kind === 'plant'
    )
  }
  
  
  function planKindUsesExistingPlants(
    kind: GardenPlanKind,
  ): boolean {
    return (
      kind === 'plant-out' ||
      kind === 'move' ||
      kind === 'feed' ||
      kind === 'treat' ||
      kind === 'harvest'
    )
  }
  
  
  function planKindCanUseGrowingPlace(
    kind: GardenPlanKind,
  ): boolean {
    return (
      kind === 'sow' ||
      kind === 'plant' ||
      kind === 'plant-out' ||
      kind === 'move' ||
      kind === 'feed' ||
      kind === 'treat' ||
      kind === 'garden-task' ||
      kind === 'other'
    )
  }
  
  
  function planKindCanUseGrowingSetup(
    kind: GardenPlanKind,
  ): boolean {
    return (
      kind === 'sow' ||
      kind === 'plant' ||
      kind === 'plant-out'
    )
  }
  
  
  function planKindCanProjectHarvest(
    kind: GardenPlanKind,
  ): boolean {
    return (
      kind === 'sow' ||
      kind === 'plant' ||
      kind === 'plant-out'
    )
  }
  
  
  function planKindUsesGeneratedTitle(
    kind: GardenPlanKind,
  ): boolean {
    return (
      kind === 'sow' ||
      kind === 'plant' ||
      kind === 'plant-out' ||
      kind === 'move' ||
      kind === 'feed' ||
      kind === 'treat' ||
      kind === 'harvest'
    )
  }
  
  
  /*
   * App owns the Plan → Reality destination.
   *
   * Calendar does not decide whether reality
   * becomes a Plant Story, Journal Event,
   * Harvest or Purchase.
   */
  function planKindCanRecordReality(
    kind: GardenPlanKind,
  ): boolean {
    return GARDEN_PLAN_KIND_OPTIONS.some(
      option =>
        option.id ===
        kind,
    )
  }
  
  
  function getPlanTimingReference(
    kind: GardenPlanKind,
  ): GardenPlanTimingReference | undefined {
    switch (
      kind
    ) {
      case 'sow':
        return 'sown'
  
      case 'plant':
        return 'planted'
  
      case 'plant-out':
        return 'planted-out'
  
      default:
        return undefined
    }
  }
  
  
  function getGeneratedPlanVerb(
    kind: GardenPlanKind,
  ): string {
    switch (
      kind
    ) {
      case 'sow':
        return 'Sow'
  
      case 'plant':
        return 'Plant'
  
      case 'plant-out':
        return 'Plant out'
  
      case 'move':
        return 'Move'
  
      case 'feed':
        return 'Feed'
  
      case 'treat':
        return 'Treat'
  
      case 'harvest':
        return 'Harvest'
  
      default:
        return ''
    }
  }
  
  
  function getFreePlanPrompt(
    kind: GardenPlanKind,
  ): string {
    switch (
      kind
    ) {
      case 'buy':
        return 'What are you planning to buy?'
  
      case 'garden-task':
        return 'What are you planning to do?'
  
      case 'other':
        return 'What are you planning?'
  
      default:
        return 'What are you planning?'
    }
  }
  
  
  function getFreePlanPlaceholder(
    kind: GardenPlanKind,
  ): string {
    switch (
      kind
    ) {
      case 'buy':
        return 'e.g. Buy another bag of potting mix'
  
      case 'garden-task':
        return 'e.g. Refresh the west garden bed'
  
      case 'other':
        return 'What do you have in mind?'
  
      default:
        return 'What do you have in mind?'
    }
  }
  
  
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
        return 'Planned'
    }
  }
  
  
  function getPlanStatusDescription(
    status: GardenPlanStatus,
  ): string {
    switch (
      status
    ) {
      case 'planned':
        return 'This is still an intention. It has not become garden history.'
  
      case 'recorded':
        return 'Something real was recorded from this Plan. The original intention remains here too.'
  
      case 'not-done':
        return 'You decided not to carry this Plan out. Sprig keeps it so the intention is not erased.'
  
      default:
        return ''
    }
  }
  
  
  function toDateString(
    date: Date,
  ): string {
    const year =
      date.getFullYear()
  
    const month =
      String(
        date.getMonth() + 1,
      ).padStart(
        2,
        '0',
      )
  
    const day =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      )
  
    return `${year}-${month}-${day}`
  }
  
  
  function fromDateString(
    value: string,
  ): Date {
    const [
      year,
      month,
      day,
    ] =
      value
        .split('-')
        .map(Number)
  
    return new Date(
      year,
      month - 1,
      day,
    )
  }
  
  
  function formatFullDate(
    value: string,
  ): string {
    return fromDateString(
      value,
    ).toLocaleDateString(
      'en-AU',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    )
  }
  
  
  function formatShortDate(
    value: string,
  ): string {
    return fromDateString(
      value,
    ).toLocaleDateString(
      'en-AU',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    )
  }
  
  
  function formatMonthHeading(
    date: Date,
  ): string {
    return date.toLocaleDateString(
      'en-AU',
      {
        month: 'long',
        year: 'numeric',
      },
    )
  }
  
  
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
  
  
  function getEventTypeLabel(
    event: GardenEvent,
  ): string | undefined {
    if (
      event.type?.trim()
    ) {
      return event.type.trim()
    }
  
    if (
      event.activityTypes?.length
    ) {
      return event.activityTypes.join(
        ', ',
      )
    }
  
    return undefined
  }
  
  
  function getHarvestContext(
    harvest: HarvestRecord,
  ): string | undefined {
    if (
      harvest.customHarvestTypeLabel?.trim()
    ) {
      return harvest.customHarvestTypeLabel.trim()
    }
  
    if (
      harvest.harvestType?.trim()
    ) {
      return harvest.harvestType.trim()
    }
  
    return undefined
  }
  
  
  function getPurchaseContext(
    purchase: PurchaseRecord,
  ): string {
    const parts = [
      purchase.itemName,
      purchase.brand,
  
      purchase.supplier
        ? `from ${purchase.supplier}`
        : undefined,
    ].filter(
      (
        value,
      ): value is string =>
        Boolean(
          value?.trim(),
        ),
    )
  
    return parts.join(
      ' · ',
    )
  }
  
  
  function getMonthCalendarDates(
    month: Date,
  ): Date[] {
    const firstOfMonth =
      new Date(
        month.getFullYear(),
        month.getMonth(),
        1,
      )
  
    const leadingDays =
      (
        firstOfMonth.getDay() +
        6
      ) %
      7
  
    const gridStart =
      new Date(
        firstOfMonth,
      )
  
    gridStart.setDate(
      firstOfMonth.getDate() -
        leadingDays,
    )
  
    return Array.from(
      {
        length: 42,
      },
      (
        _,
        index,
      ) => {
        const date =
          new Date(
            gridStart,
          )
  
        date.setDate(
          gridStart.getDate() +
            index,
        )
  
        return date
      },
    )
  }
  
  
  function getTimeTypeLabel(
    timeType: CalendarTimeType,
  ): string {
    switch (
      timeType
    ) {
      case 'recorded':
        return 'Recorded'
  
      case 'expected':
        return 'Expected'
  
      case 'planned':
        return 'Planned'
  
      default:
        return 'Garden moment'
    }
  }
  
  
  function getCalendarItemLifecycleLabel(
    item: CalendarItem,
  ): string {
    if (
      item.sourceType !==
      'plan'
    ) {
      return getTimeTypeLabel(
        item.timeType,
      )
    }
  
  
    if (
      item.planRole ===
      'possibility'
    ) {
      return 'Planned possibility'
    }
  
  
    switch (
      item.planStatus
    ) {
      case 'recorded':
        return 'Recorded from a Plan'
  
      case 'not-done':
        return 'Decided not to'
  
      case 'planned':
      default:
        return 'Still planned'
    }
  }
  
  
  function getCalendarItemIcon(
    item: CalendarItem,
  ): string {
    switch (
      item.kind
    ) {
      case 'sown':
        return '🌱'
  
      case 'planted':
      case 'planted-out':
        return '🪴'
  
      case 'completed':
        return '🍂'
  
      case 'photo':
        return '📷'
  
      case 'growing-place-change':
      case 'growing-setup-change':
      case 'growing-change':
        return '🌿'
  
      case 'journal-event':
        return '📖'
  
      case 'harvest':
      case 'expected-harvest':
        return '🧺'
  
      case 'purchase':
        return '🛒'
  
      case 'plan':
        return '📅'
  
      default:
        return '•'
    }
  }
  
  
  function getSourceLabel(
    item: CalendarItem,
  ): string {
    if (
      item.sourceLabel?.trim()
    ) {
      return item.sourceLabel.trim()
    }
  
    switch (
      item.sourceType
    ) {
      case 'plant-story':
      case 'plant-photo':
        return 'Plant Story'
  
      case 'growing-history':
        return 'Growing Journey'
  
      case 'journal':
        return 'Garden Journal'
  
      case 'harvest':
        return 'Harvest Record'
  
      case 'purchase':
        return 'Purchase Record'
  
      case 'plan':
        return 'Garden Plan'
  
      default:
        return 'Sprig'
    }
  }
  
  
  /* =======================================
     CALENDAR
  ======================================= */
  
  function Calendar({
    gardenData,
    onAddPlan,
    onUpdatePlan,
    onRecordPlan,
    onNavigate,
    onOpenPlant,
    onOpenJournalEntry,
    onOpenHarvest,
    onOpenPurchase,
    onOpenGrowingPlace,
    onOpenGrowingRecipe,
  }: CalendarProps) {
  
    /* =======================================
       TODAY
    ======================================= */
  
    const today =
      useMemo(
        () =>
          new Date(),
        [],
      )
  
  
    const todayDate =
      useMemo(
        () =>
          toDateString(
            today,
          ),
        [
          today,
        ],
      )
  
  
    /* =======================================
       ACTIVE MONTH
    ======================================= */
  
    const [
      visibleMonth,
      setVisibleMonth,
    ] =
      useState(
        () =>
          new Date(
            today.getFullYear(),
            today.getMonth(),
            1,
          ),
      )
  
  
    /* =======================================
       SELECTED DAY
    ======================================= */
  
    const [
      selectedDate,
      setSelectedDate,
    ] =
      useState(
        todayDate,
      )
  
  
    /* =======================================
       PLAN COMPOSER
    ======================================= */
  
    const [
      isPlanComposerOpen,
      setIsPlanComposerOpen,
    ] =
      useState(
        false,
      )
  
  
    const [
      editingPlanId,
      setEditingPlanId,
    ] =
      useState<string | null>(
        null,
      )
  
  
    const [
      planTitle,
      setPlanTitle,
    ] =
      useState(
        '',
      )
  
  
    const [
      planDate,
      setPlanDate,
    ] =
      useState(
        '',
      )
  
  
    const [
      planDateMode,
      setPlanDateMode,
    ] =
      useState<PlanDateMode>(
        'single',
      )
  
  
    const [
      planEndDate,
      setPlanEndDate,
    ] =
      useState(
        '',
      )
  
  
    const [
      planKind,
      setPlanKind,
    ] =
      useState<GardenPlanKind>(
        'garden-task',
      )
  
  
    const [
      planCustomKindLabel,
      setPlanCustomKindLabel,
    ] =
      useState(
        '',
      )
  
  
    const [
      planNotes,
      setPlanNotes,
    ] =
      useState(
        '',
      )
  
  
    const [
      plannedPlantName,
      setPlannedPlantName,
    ] =
      useState(
        '',
      )
  
  
    const [
      plannedPlantVariety,
      setPlannedPlantVariety,
    ] =
      useState(
        '',
      )
  
  
    const [
      plannedPlantQuantity,
      setPlannedPlantQuantity,
    ] =
      useState(
        '',
      )
  
  
    const [
      selectedPlanPlantIds,
      setSelectedPlanPlantIds,
    ] =
      useState<string[]>(
        [],
      )
  
  
    const [
      selectedPlanPlaceIds,
      setSelectedPlanPlaceIds,
    ] =
      useState<string[]>(
        [],
      )
  
  
    const [
      selectedPlanSetupIds,
      setSelectedPlanSetupIds,
    ] =
      useState<string[]>(
        [],
      )
  
  
    const [
      planTimingDaysMin,
      setPlanTimingDaysMin,
    ] =
      useState<number | undefined>(
        undefined,
      )
  
  
    const [
      planTimingDaysMax,
      setPlanTimingDaysMax,
    ] =
      useState<number | undefined>(
        undefined,
      )
  
  
    const editingPlan =
      useMemo(
        () => {
          if (
            !editingPlanId
          ) {
            return undefined
          }
  
          return (
            gardenData.plans ??
            []
          ).find(
            plan =>
              plan.id ===
              editingPlanId,
          )
        },
        [
          editingPlanId,
          gardenData.plans,
        ],
      )
  
  
    const isEditingPlan =
      Boolean(
        editingPlan,
      )
  
  
    const isFuturePlantPlan =
      planKindCreatesFuturePlant(
        planKind,
      )
  
  
    const usesExistingPlants =
      planKindUsesExistingPlants(
        planKind,
      )
  
  
    const canUseGrowingPlace =
      planKindCanUseGrowingPlace(
        planKind,
      )
  
  
    const canUseGrowingSetup =
      planKindCanUseGrowingSetup(
        planKind,
      )
  
  
    const canProjectHarvest =
      planKindCanProjectHarvest(
        planKind,
      )
  
  
    const usesGeneratedTitle =
      planKindUsesGeneratedTitle(
        planKind,
      )
  
  
    const planTimingReference =
      getPlanTimingReference(
        planKind,
      )
  
  
    const canRecordEditingPlan =
      Boolean(
        editingPlan &&
        editingPlan.status ===
          'planned' &&
        planKindCanRecordReality(
          editingPlan.kind,
        ),
      )
  
  
    const selectedPlanPlants =
      useMemo(
        () =>
          selectedPlanPlantIds
            .map(
              plantId =>
                gardenData.plantStories.find(
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
            ),
        [
          selectedPlanPlantIds,
          gardenData.plantStories,
        ],
      )
  
  
    const generatedFuturePlantSubject =
      useMemo(
        () => {
          const plantName =
            plannedPlantName.trim()
  
          const variety =
            plannedPlantVariety.trim()
  
  
          if (
            plantName &&
            variety
          ) {
            return `${variety} ${plantName}`
          }
  
  
          return (
            variety ||
            plantName
          )
        },
        [
          plannedPlantName,
          plannedPlantVariety,
        ],
      )
  
  
    const generatedExistingPlantSubject =
      useMemo(
        () =>
          selectedPlanPlants
            .map(
              getPlantLabel,
            )
            .join(
              ', ',
            ),
        [
          selectedPlanPlants,
        ],
      )
  
  
    const generatedPlanTitle =
      useMemo(
        () => {
          if (
            !usesGeneratedTitle
          ) {
            return planTitle.trim()
          }
  
  
          const verb =
            getGeneratedPlanVerb(
              planKind,
            )
  
  
          const subject =
            isFuturePlantPlan
              ? generatedFuturePlantSubject
              : generatedExistingPlantSubject
  
  
          if (
            !verb ||
            !subject
          ) {
            return ''
          }
  
  
          return `${verb} ${subject}`
        },
        [
          usesGeneratedTitle,
          planTitle,
          planKind,
          isFuturePlantPlan,
          generatedFuturePlantSubject,
          generatedExistingPlantSubject,
        ],
      )
  
  
    const hasPlanTiming =
      canProjectHarvest &&
      Boolean(
        planTimingReference,
      ) &&
      (
        planTimingDaysMin !==
          undefined ||
        planTimingDaysMax !==
          undefined
      )
  
  
    function resetPlanTiming() {
      setPlanTimingDaysMin(
        undefined,
      )
  
      setPlanTimingDaysMax(
        undefined,
      )
    }
  
  
    function resetPlanRelationships() {
      setPlannedPlantName(
        '',
      )
  
      setPlannedPlantVariety(
        '',
      )
  
      setPlannedPlantQuantity(
        '',
      )
  
      setSelectedPlanPlantIds(
        [],
      )
  
      setSelectedPlanPlaceIds(
        [],
      )
  
      setSelectedPlanSetupIds(
        [],
      )
    }
  
  
    function resetPlanComposer() {
      setEditingPlanId(
        null,
      )
  
      setPlanTitle(
        '',
      )
  
      setPlanDate(
        '',
      )
  
      setPlanDateMode(
        'single',
      )
  
      setPlanEndDate(
        '',
      )
  
      setPlanKind(
        'garden-task',
      )
  
      setPlanCustomKindLabel(
        '',
      )
  
      setPlanNotes(
        '',
      )
  
      resetPlanRelationships()
      resetPlanTiming()
    }
  
  
    function openPlanComposer(
      initialDate?: string,
    ) {
      resetPlanComposer()
  
      setPlanDate(
        initialDate ??
          selectedDate ??
          todayDate,
      )
  
      setIsPlanComposerOpen(
        true,
      )
    }
  
  
    function openExistingPlan(
      plan: GardenPlan,
    ) {
      setEditingPlanId(
        plan.id,
      )
  
      setPlanTitle(
        plan.title ??
          '',
      )
  
      setPlanDate(
        plan.date,
      )
  
      setPlanDateMode(
        plan.endDate
          ? 'range'
          : 'single',
      )
  
      setPlanEndDate(
        plan.endDate ??
          '',
      )
  
      setPlanKind(
        plan.kind,
      )
  
      setPlanCustomKindLabel(
        plan.customKindLabel ??
          '',
      )
  
      setPlanNotes(
        plan.notes ??
          '',
      )
  
      setPlannedPlantName(
        plan.plannedPlant?.plantName ??
          '',
      )
  
      setPlannedPlantVariety(
        plan.plannedPlant?.variety ??
          '',
      )
  
      setPlannedPlantQuantity(
        plan.plannedPlant?.quantity !==
          undefined
          ? String(
              plan.plannedPlant.quantity,
            )
          : '',
      )
  
      setSelectedPlanPlantIds(
        [
          ...(plan.plantStoryIds ??
            []),
        ],
      )
  
      setSelectedPlanPlaceIds(
        [
          ...(plan.growingPlaceIds ??
            []),
        ],
      )
  
      setSelectedPlanSetupIds(
        [
          ...(plan.growingSetupIds ??
            []),
        ],
      )
  
      setPlanTimingDaysMin(
        plan.timingAssumption?.daysMin,
      )
  
      setPlanTimingDaysMax(
        plan.timingAssumption?.daysMax,
      )
  
      setIsPlanComposerOpen(
        true,
      )
    }
  
  
    function closePlanComposer() {
      setIsPlanComposerOpen(
        false,
      )
  
      setEditingPlanId(
        null,
      )
    }
  
  
    function choosePlanKind(
      kind: GardenPlanKind,
    ) {
      if (
        kind ===
        planKind
      ) {
        return
      }
  
      setPlanKind(
        kind,
      )
  
      setPlanTitle(
        '',
      )
  
      setPlanCustomKindLabel(
        '',
      )
  
      resetPlanRelationships()
      resetPlanTiming()
    }
  
  
    function togglePlanPlant(
      plantId: string,
    ) {
      setSelectedPlanPlantIds(
        current =>
          current.includes(
            plantId,
          )
            ? current.filter(
                id =>
                  id !==
                  plantId,
              )
            : [
                ...current,
                plantId,
              ],
      )
    }
  
  
    function togglePlanPlace(
      placeId: string,
    ) {
      setSelectedPlanPlaceIds(
        current =>
          current.includes(
            placeId,
          )
            ? current.filter(
                id =>
                  id !==
                  placeId,
              )
            : [
                ...current,
                placeId,
              ],
      )
    }
  
  
    function togglePlanSetup(
      setupId: string,
    ) {
      setSelectedPlanSetupIds(
        current =>
          current.includes(
            setupId,
          )
            ? current.filter(
                id =>
                  id !==
                  setupId,
              )
            : [
                ...current,
                setupId,
              ],
      )
    }
  
  
    /* =======================================
       BUILD PLAN
    ======================================= */
  
    function buildPlanFromComposer():
      GardenPlan | undefined {
      const cleanedTitle =
        generatedPlanTitle.trim()
  
  
      if (
        !cleanedTitle ||
        !planDate
      ) {
        return undefined
      }
  
  
      if (
        planDateMode ===
          'range' &&
        !planEndDate
      ) {
        return undefined
      }
  
  
      const quantityNumber =
        plannedPlantQuantity
          ? Number(
              plannedPlantQuantity,
            )
          : undefined
  
  
      const hasPlannedPlantDetails =
        isFuturePlantPlan &&
        (
          Boolean(
            plannedPlantName.trim(),
          ) ||
          Boolean(
            plannedPlantVariety.trim(),
          ) ||
          (
            quantityNumber !==
              undefined &&
            Number.isFinite(
              quantityNumber,
            ) &&
            quantityNumber >
              0
          )
        )
  
  
      const now =
        new Date()
          .toISOString()
  
  
      const basePlan =
        editingPlan
  
  
      return {
        ...(basePlan ??
          {}),
  
        id:
          basePlan?.id ??
          crypto.randomUUID(),
  
        title:
          cleanedTitle,
  
        date:
          planDate,
  
        endDate:
          planDateMode ===
            'range' &&
          planEndDate &&
          planEndDate >=
            planDate
            ? planEndDate
            : undefined,
  
        kind:
          planKind,
  
        customKindLabel:
          planKind ===
            'other' &&
          planCustomKindLabel.trim()
            ? planCustomKindLabel.trim()
            : undefined,
  
        notes:
          planNotes.trim()
            ? planNotes.trim()
            : undefined,
  
        plantStoryIds:
          usesExistingPlants
            ? [
                ...selectedPlanPlantIds,
              ]
            : [],
  
        growingPlaceIds:
          canUseGrowingPlace
            ? [
                ...selectedPlanPlaceIds,
              ]
            : [],
  
        growingSetupIds:
          canUseGrowingSetup
            ? [
                ...selectedPlanSetupIds,
              ]
            : [],
  
        plannedPlant:
          hasPlannedPlantDetails
            ? {
                plantName:
                  plannedPlantName.trim()
                    ? plannedPlantName.trim()
                    : undefined,
  
                variety:
                  plannedPlantVariety.trim()
                    ? plannedPlantVariety.trim()
                    : undefined,
  
                quantity:
                  quantityNumber !==
                    undefined &&
                  Number.isFinite(
                    quantityNumber,
                  ) &&
                  quantityNumber >
                    0
                    ? quantityNumber
                    : undefined,
  
                startMethod:
                  basePlan
                    ?.plannedPlant
                    ?.startMethod,
  
                customStartMethodLabel:
                  basePlan
                    ?.plannedPlant
                    ?.customStartMethodLabel,
              }
            : undefined,
  
        timingAssumption:
          hasPlanTiming &&
          planTimingReference
            ? {
                referenceType:
                  planTimingReference,
  
                daysMin:
                  planTimingDaysMin,
  
                daysMax:
                  planTimingDaysMax,
  
                knowledgeSource:
                  basePlan
                    ?.timingAssumption
                    ?.knowledgeSource ??
                  'gardener',
  
                evidenceCount:
                  basePlan
                    ?.timingAssumption
                    ?.evidenceCount,
              }
            : undefined,
  
        status:
          basePlan?.status ??
          'planned',
  
        results:
          [
            ...(basePlan?.results ??
              []),
          ],
  
        createdAt:
          basePlan?.createdAt ??
          now,
  
        updatedAt:
          basePlan
            ? now
            : undefined,
      } as GardenPlan
    }
  
  
    /* =======================================
       SAVE PLAN
    ======================================= */
  
    function savePlan() {
      const planToSave =
        buildPlanFromComposer()
  
  
      if (
        !planToSave
      ) {
        return
      }
  
  
      if (
        editingPlan
      ) {
        onUpdatePlan(
          planToSave,
        )
      } else {
        onAddPlan(
          planToSave,
        )
      }
  
  
      const savedDateObject =
        fromDateString(
          planToSave.date,
        )
  
  
      setVisibleMonth(
        new Date(
          savedDateObject.getFullYear(),
          savedDateObject.getMonth(),
          1,
        ),
      )
  
  
      setSelectedDate(
        planToSave.date,
      )
  
  
      setSelectedFilters(
        current =>
          current.includes(
            'planned',
          )
            ? current
            : [
                ...current,
                'planned',
              ],
      )
  
  
      closePlanComposer()
    }
  
  
    /* =======================================
       PLAN → REALITY
    ======================================= */
  
    function recordEditingPlan() {
      if (
        !editingPlan ||
        editingPlan.status !==
          'planned' ||
        !planKindCanRecordReality(
          editingPlan.kind,
        )
      ) {
        return
      }
  
  
      /*
       * Capture edits made to the Plan before
       * reality is opened.
       */
      const currentPlan =
        buildPlanFromComposer()
  
  
      if (
        !currentPlan
      ) {
        return
      }
  
  
      onUpdatePlan(
        currentPlan,
      )
  
  
      closePlanComposer()
  
  
      /*
       * App now chooses the correct real
       * destination:
       *
       * Sow / Plant → Plant Story
       * Move / Feed / Treat / Task → Journal
       * Plant-out → Journal + Growing Journey
       * Harvest → Harvest Record
       * Buy → Purchase Record
       */
      onRecordPlan(
        currentPlan,
      )
    }
  
  
    /* =======================================
       PLAN STATUS
    ======================================= */
  
    function updateEditingPlanStatus(
      status: GardenPlanStatus,
    ) {
      if (
        !editingPlan
      ) {
        return
      }
  
  
      const currentPlan =
        buildPlanFromComposer()
  
  
      if (
        !currentPlan
      ) {
        return
      }
  
  
      onUpdatePlan({
        ...currentPlan,
  
        status,
  
        updatedAt:
          new Date()
            .toISOString(),
      })
  
  
      closePlanComposer()
    }
  
  
    /* =======================================
       FILTERS
    ======================================= */
  
    const [
      selectedFilters,
      setSelectedFilters,
    ] =
      useState<
        CalendarFilter[]
      >(
        ALL_CALENDAR_FILTERS,
      )
  
  
    const isShowingEverything =
      ALL_CALENDAR_FILTERS.every(
        filter =>
          selectedFilters.includes(
            filter,
          ),
      )
  
  
    function toggleFilter(
      filter: CalendarFilter,
    ) {
      setSelectedFilters(
        current => {
          if (
            current.includes(
              filter,
            )
          ) {
            if (
              current.length ===
              1
            ) {
              return current
            }
  
            return current.filter(
              item =>
                item !==
                filter,
            )
          }
  
  
          return [
            ...current,
            filter,
          ]
        },
      )
    }
  
  
    function showEverything() {
      setSelectedFilters(
        ALL_CALENDAR_FILTERS,
      )
    }
  
  
    /* =======================================
       SEARCH
    ======================================= */
  
    const [
      searchQuery,
      setSearchQuery,
    ] =
      useState(
        '',
      )
  
  
    const cleanedSearchQuery =
      searchQuery.trim()
  
  
    /* =======================================
       CALENDAR INDEX
    ======================================= */
  
    const calendarItems =
      useMemo(
        () =>
          buildCalendarIndex(
            gardenData,
          ),
        [
          gardenData,
        ],
      )
  
  
    const filteredCalendarItems =
      useMemo(
        () =>
          calendarItems.filter(
            item =>
              selectedFilters.includes(
                item.timeType,
              ),
          ),
        [
          calendarItems,
          selectedFilters,
        ],
      )
  
  
    const searchResults =
      useMemo(
        () => {
          if (
            !cleanedSearchQuery
          ) {
            return []
          }
  
  
          return searchCalendarItems(
            filteredCalendarItems,
            cleanedSearchQuery,
          )
        },
        [
          filteredCalendarItems,
          cleanedSearchQuery,
        ],
      )
  
  
    const monthDates =
      useMemo(
        () =>
          getMonthCalendarDates(
            visibleMonth,
          ),
        [
          visibleMonth,
        ],
      )
  
  
    const selectedDayItems =
      useMemo(
        () =>
          getCalendarItemsForDate(
            filteredCalendarItems,
            selectedDate,
          ),
        [
          filteredCalendarItems,
          selectedDate,
        ],
      )
  
  
    /* =======================================
       DAY STORY GROUPS
    ======================================= */
  
    const dayStoryGroups =
      useMemo<
        DayStoryGroup[]
      >(
        () => {
          const recordedItems =
            selectedDayItems.filter(
              item =>
                item.timeType ===
                  'recorded',
            )
  
  
          const expectedItems =
            selectedDayItems.filter(
              item =>
                item.timeType ===
                  'expected',
            )
  
  
          const plannedActiveItems =
            selectedDayItems.filter(
              item =>
                item.timeType ===
                  'planned' &&
                (
                  item.sourceType !==
                    'plan' ||
                  item.planStatus ===
                    'planned' ||
                  !item.planStatus
                ),
            )
  
  
          const plannedRecordedItems =
            selectedDayItems.filter(
              item =>
                item.timeType ===
                  'planned' &&
                item.sourceType ===
                  'plan' &&
                item.planRole !==
                  'possibility' &&
                item.planStatus ===
                  'recorded',
            )
  
  
          const plannedNotDoneItems =
            selectedDayItems.filter(
              item =>
                item.timeType ===
                  'planned' &&
                item.sourceType ===
                  'plan' &&
                item.planRole !==
                  'possibility' &&
                item.planStatus ===
                  'not-done',
            )
  
  
          const groups:
            DayStoryGroup[] = [
              {
                id:
                  'recorded',
  
                timeType:
                  'recorded',
  
                label:
                  'Recorded',
  
                heading:
                  'What happened',
  
                items:
                  recordedItems,
              },
  
              {
                id:
                  'expected',
  
                timeType:
                  'expected',
  
                label:
                  'Expected',
  
                heading:
                  'What may be ready',
  
                items:
                  expectedItems,
              },
  
              {
                id:
                  'planned-active',
  
                timeType:
                  'planned',
  
                label:
                  'Still planned',
  
                heading:
                  'What is ahead',
  
                items:
                  plannedActiveItems,
              },
  
              {
                id:
                  'planned-recorded',
  
                timeType:
                  'planned',
  
                label:
                  'Recorded from a Plan',
  
                heading:
                  'What you intended',
  
                items:
                  plannedRecordedItems,
              },
  
              {
                id:
                  'planned-not-done',
  
                timeType:
                  'planned',
  
                label:
                  'Decided not to',
  
                heading:
                  'Plans left behind',
  
                items:
                  plannedNotDoneItems,
              },
            ]
  
  
          return groups.filter(
            group =>
              group.items.length >
              0,
          )
        },
        [
          selectedDayItems,
        ],
      )
  
  
    /* =======================================
       RECORD LOOKUPS
    ======================================= */
  
    function findPlant(
      plantId:
        string | undefined,
    ) {
      if (
        !plantId
      ) {
        return undefined
      }
  
  
      return gardenData.plantStories.find(
        plant =>
          plant.id ===
          plantId,
      )
    }
  
  
    function findPlan(
      planId:
        string | undefined,
    ) {
      if (
        !planId
      ) {
        return undefined
      }
  
  
      return (
        gardenData.plans ??
        []
      ).find(
        plan =>
          plan.id ===
          planId,
      )
    }
  
  
    function findJournalEntry(
      eventId: string,
    ) {
      return gardenData.events.find(
        event =>
          event.id ===
          eventId,
      )
    }
  
  
    function findHarvest(
      harvestId: string,
    ) {
      return gardenData.harvests.find(
        harvest =>
          harvest.id ===
          harvestId,
      )
    }
  
  
    function findPurchase(
      purchaseId: string,
    ) {
      return (
        gardenData.purchases ??
        []
      ).find(
        purchase =>
          purchase.id ===
          purchaseId,
      )
    }
  
  
    /* =======================================
       MONTH NAVIGATION
    ======================================= */
  
    function moveMonth(
      amount: number,
    ) {
      setVisibleMonth(
        current =>
          new Date(
            current.getFullYear(),
            current.getMonth() +
              amount,
            1,
          ),
      )
    }
  
  
    function goToToday() {
      setVisibleMonth(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        ),
      )
  
      setSelectedDate(
        todayDate,
      )
    }
  
  
    /* =======================================
       ITEM RELATIONSHIPS
    ======================================= */
  
    function getPlantIdsForItem(
      item: CalendarItem,
    ): string[] {
      const ids =
        new Set<string>(
          item.plantStoryIds ??
            [],
        )
  
  
      if (
        item.sourceType ===
          'plant-story' ||
        item.sourceType ===
          'plant-photo'
      ) {
        ids.add(
          item.sourceId,
        )
      }
  
  
      if (
        item.sourceType ===
        'journal'
      ) {
        const event =
          findJournalEntry(
            item.sourceId,
          )
  
  
        event?.plantStoryIds.forEach(
          plantId =>
            ids.add(
              plantId,
            ),
        )
      }
  
  
      if (
        item.sourceType ===
        'harvest'
      ) {
        const harvest =
          findHarvest(
            item.sourceId,
          )
  
  
        harvest
          ?.plantStoryIds
          .forEach(
            plantId =>
              ids.add(
                plantId,
              ),
          )
      }
  
  
      return [
        ...ids,
      ]
    }
  
  
    function getPlantsForItem(
      item: CalendarItem,
    ) {
      return getPlantIdsForItem(
        item,
      )
        .map(
          findPlant,
        )
        .filter(
          (
            plant,
          ): plant is PlantStory =>
            Boolean(
              plant,
            ),
        )
    }
  
  
    function getResultPlantsForItem(
      item: CalendarItem,
    ) {
      return (
        item.resultPlantStoryIds ??
        []
      )
        .map(
          findPlant,
        )
        .filter(
          (
            plant,
          ): plant is PlantStory =>
            Boolean(
              plant,
            ),
        )
    }
  
  
    function getPlaceIdsForItem(
      item: CalendarItem,
    ): string[] {
      const ids =
        new Set<string>(
          item.growingPlaceIds ??
            [],
        )
  
  
      if (
        item.sourceType ===
        'journal'
      ) {
        const event =
          findJournalEntry(
            item.sourceId,
          )
  
  
        event?.growingPlaceIds?.forEach(
          placeId =>
            ids.add(
              placeId,
            ),
        )
      }
  
  
      if (
        item.sourceType ===
          'plant-story' ||
        item.sourceType ===
          'plant-photo'
      ) {
        const plant =
          findPlant(
            item.sourceId,
          )
  
  
        if (
          plant
            ?.currentGrowingPlaceId
        ) {
          ids.add(
            plant.currentGrowingPlaceId,
          )
        }
      }
  
  
      return [
        ...ids,
      ]
    }
  
  
    function getPlacesForItem(
      item: CalendarItem,
    ) {
      return getPlaceIdsForItem(
        item,
      )
        .map(
          placeId =>
            gardenData.growingPlaces.find(
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
    }
  
  
    function getSetupIdsForItem(
      item: CalendarItem,
    ): string[] {
      const ids =
        new Set<string>(
          item.growingSetupIds ??
            [],
        )
  
  
      if (
        item.sourceType ===
          'plant-story' ||
        item.sourceType ===
          'plant-photo'
      ) {
        const plant =
          findPlant(
            item.sourceId,
          )
  
  
        if (
          plant
            ?.currentGrowingSetupId
        ) {
          ids.add(
            plant.currentGrowingSetupId,
          )
        }
      }
  
  
      return [
        ...ids,
      ]
    }
  
  
    function getRecipesForItem(
      item: CalendarItem,
    ) {
      return getSetupIdsForItem(
        item,
      )
        .map(
          setupId =>
            (
              gardenData.growingSetups ??
              []
            ).find(
              setup =>
                setup.id ===
                setupId,
            ),
        )
        .filter(
          (
            setup,
          ): setup is NonNullable<
            GardenData['growingSetups']
          >[number] =>
            Boolean(
              setup,
            ),
        )
    }
  
  
    /* =======================================
       CARD CONTEXT
    ======================================= */
  
    function getItemContext(
      item: CalendarItem,
    ): string {
      if (
        item.contextLabel?.trim()
      ) {
        return item.contextLabel.trim()
      }
  
  
      if (
        item.sourceType ===
        'journal'
      ) {
        const event =
          findJournalEntry(
            item.sourceId,
          )
  
  
        return (
          event
            ? getEventTypeLabel(
                event,
              )
            : undefined
        ) ??
        'Garden Journal'
      }
  
  
      if (
        item.sourceType ===
        'harvest'
      ) {
        const harvest =
          findHarvest(
            item.sourceId,
          )
  
  
        return (
          harvest
            ? getHarvestContext(
                harvest,
              )
            : undefined
        ) ??
        'Harvest'
      }
  
  
      if (
        item.sourceType ===
        'purchase'
      ) {
        const purchase =
          findPurchase(
            item.sourceId,
          )
  
  
        return purchase
          ? getPurchaseContext(
              purchase,
            )
          : 'Purchase'
      }
  
  
      return getSourceLabel(
        item,
      )
    }
  
  
    function getItemDescription(
      item: CalendarItem,
    ): string | undefined {
      if (
        item.description?.trim()
      ) {
        return item.description.trim()
      }
  
  
      if (
        item.sourceType ===
        'journal'
      ) {
        return findJournalEntry(
          item.sourceId,
        )?.notes
      }
  
  
      if (
        item.sourceType ===
        'harvest'
      ) {
        return findHarvest(
          item.sourceId,
        )?.notes
      }
  
  
      if (
        item.sourceType ===
        'purchase'
      ) {
        return findPurchase(
          item.sourceId,
        )?.notes
      }
  
  
      return undefined
    }
  
  
    /* =======================================
       OPEN SOURCE
    ======================================= */
  
    function canOpenItem(
        item: CalendarItem,
      ): boolean {
        if (
          item.sourceType ===
          'purchase'
        ) {
          return true
        }
      
      
        if (
          item.sourceType ===
          'plan'
        ) {
        return (
          item.planRole !==
          'possibility'
        )
      }
  
  
      return Boolean(
        item.canOpenSource,
      )
    }
  
  
    function openCalendarSource(
      item: CalendarItem,
    ) {
      switch (
        item.sourceType
      ) {
        case 'plant-story':
        case 'plant-photo':
          onOpenPlant(
            item.sourceId,
          )
          return
  
  
        case 'journal':
          onOpenJournalEntry(
            item.sourceId,
          )
          return
  
  
        case 'harvest':
          onOpenHarvest(
            item.sourceId,
          )
          return

          case 'purchase':
            onOpenPurchase(
              item.sourceId,
            )
            return
  
  
        case 'growing-history': {
          const firstPlantId =
            item.plantStoryIds?.[0]
  
  
          if (
            firstPlantId
          ) {
            onOpenPlant(
              firstPlantId,
            )
          }
  
          return
        }
  
  
        case 'plan': {
          if (
            item.planRole ===
            'possibility'
          ) {
            return
          }
  
  
          const plan =
            findPlan(
              item.sourceId,
            )
  
  
          if (
            plan
          ) {
            openExistingPlan(
              plan,
            )
          }
  
          return
        }
  
  
        default:
          return
      }
    }
  
  
    function handleCardKeyDown(
      event:
        KeyboardEvent<HTMLElement>,
      item: CalendarItem,
    ) {
      if (
        event.key !==
          'Enter' &&
        event.key !==
          ' '
      ) {
        return
      }
  
  
      event.preventDefault()
  
  
      openCalendarSource(
        item,
      )
    }
  
  
    /* =======================================
       SEARCH RESULT NAVIGATION
    ======================================= */
  
    function jumpToCalendarItem(
      item: CalendarItem,
    ) {
      const date =
        fromDateString(
          item.startDate,
        )
  
  
      setVisibleMonth(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          1,
        ),
      )
  
  
      setSelectedDate(
        item.startDate,
      )
    }
  
  
    /* =======================================
       CALENDAR ITEM CARD
    ======================================= */
  
    function renderCalendarItem(
      item: CalendarItem,
    ) {
      const linkedPlants =
        getPlantsForItem(
          item,
        )
  
  
      const resultPlants =
        getResultPlantsForItem(
          item,
        )
  
  
      const sourcePlan =
        item.sourceType ===
          'plan' &&
        item.planRole ===
          'intention'
          ? findPlan(
              item.sourceId,
            )
          : undefined
  
  
      const resultEvents =
        (
          sourcePlan?.results ??
          []
        )
          .filter(
            result =>
              result.recordType ===
              'garden-event',
          )
          .map(
            result =>
              findJournalEntry(
                result.recordId,
              ),
          )
          .filter(
            (
              event,
            ): event is GardenEvent =>
              Boolean(
                event,
              ),
          )
  
  
      const resultHarvests =
        (
          sourcePlan?.results ??
          []
        )
          .filter(
            result =>
              result.recordType ===
              'harvest',
          )
          .map(
            result =>
              findHarvest(
                result.recordId,
              ),
          )
          .filter(
            (
              harvest,
            ): harvest is HarvestRecord =>
              Boolean(
                harvest,
              ),
          )
  
  
      const resultPurchases =
        (
          sourcePlan?.results ??
          []
        )
          .filter(
            result =>
              result.recordType ===
              'purchase',
          )
          .map(
            result =>
              findPurchase(
                result.recordId,
              ),
          )
          .filter(
            (
              purchase,
            ): purchase is PurchaseRecord =>
              Boolean(
                purchase,
              ),
          )
  
  
      const linkedPlaces =
        getPlacesForItem(
          item,
        )
  
  
      const linkedRecipes =
        getRecipesForItem(
          item,
        )
  
  
      const context =
        getItemContext(
          item,
        )
  
  
      const description =
        getItemDescription(
          item,
        )
  
  
      const isOpenable =
        canOpenItem(
          item,
        )
  
  
      const isPlannedPossibility =
        item.sourceType ===
          'plan' &&
        item.planRole ===
          'possibility'
  
  
      return (
        <article
          key={
            item.id
          }
  
          className={`sprig-calendar-story-card sprig-calendar-story-card--${item.timeType}${
            isOpenable
              ? ' sprig-calendar-story-card--openable'
              : ''
          }`}
  
          role={
            isOpenable
              ? 'button'
              : undefined
          }
  
          tabIndex={
            isOpenable
              ? 0
              : undefined
          }
  
          onClick={
            isOpenable
              ? () =>
                  openCalendarSource(
                    item,
                  )
              : undefined
          }
  
          onKeyDown={
            isOpenable
              ? event =>
                  handleCardKeyDown(
                    event,
                    item,
                  )
              : undefined
          }
  
          aria-label={
            isOpenable
              ? `Open ${getSourceLabel(
                  item,
                )}: ${context}, ${item.title}`
              : undefined
          }
        >
          <div className="sprig-calendar-story-meta">
            <span>
              {getCalendarItemIcon(
                item,
              )}
            </span>
  
            <span>
              {getCalendarItemLifecycleLabel(
                item,
              )}
            </span>
  
            <span aria-hidden="true">
              ·
            </span>
  
            <span>
              {getSourceLabel(
                item,
              )}
            </span>
          </div>
  
  
          <p className="sprig-calendar-story-context">
            {context}
          </p>
  
  
          <h3 className="sprig-calendar-story-title">
            {item.title}
          </h3>
  
  
          {description && (
            <p className="sprig-calendar-story-description">
              {description}
            </p>
          )}
  
  
          {item.endDate &&
            item.endDate !==
              item.startDate && (
            <div className="sprig-calendar-window">
              <span className="sprig-calendar-window-label">
                {isPlannedPossibility
                  ? 'Possible harvest window'
                  : item.sourceType ===
                        'plan' &&
                      item.planRole ===
                        'intention'
                    ? 'Planned window'
                    : item.timeType ===
                        'expected'
                      ? 'Expected window'
                      : 'Recorded window'}
              </span>
  
              <span>
                {formatShortDate(
                  item.startDate,
                )}{' '}
                to{' '}
                {formatShortDate(
                  item.endDate,
                )}
              </span>
            </div>
          )}
  
  
          {(
            linkedPlants.length >
              0 ||
            linkedPlaces.length >
              0 ||
            linkedRecipes.length >
              0
          ) && (
            <div className="sprig-calendar-relationships">
  
              {linkedPlants.length >
                0 && (
                <div className="sprig-calendar-relationship-group">
                  <p className="sprig-calendar-relationship-label">
                    {linkedPlants.length ===
                    1
                      ? 'Plant Story'
                      : 'Plant Stories'}
                  </p>
  
                  <div className="sprig-calendar-chips">
                    {linkedPlants.map(
                      plant => (
                        <button
                          key={
                            plant.id
                          }
  
                          type="button"
  
                          className="sprig-calendar-chip"
  
                          onClick={event => {
                            event.stopPropagation()
  
                            onOpenPlant(
                              plant.id,
                            )
                          }}
                        >
                          🌱{' '}
                          {getPlantLabel(
                            plant,
                          )}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
  
  
              {linkedPlaces.length >
                0 && (
                <div className="sprig-calendar-relationship-group">
                  <p className="sprig-calendar-relationship-label">
                    {linkedPlaces.length ===
                    1
                      ? 'Growing Place'
                      : 'Growing Places'}
                  </p>
  
                  <div className="sprig-calendar-chips">
                    {linkedPlaces.map(
                      place => (
                        <button
                          key={
                            place.id
                          }
  
                          type="button"
  
                          className="sprig-calendar-chip"
  
                          onClick={event => {
                            event.stopPropagation()
  
                            onOpenGrowingPlace(
                              place.id,
                            )
                          }}
                        >
                          🪴{' '}
                          {place.name}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
  
  
              {linkedRecipes.length >
                0 && (
                <div className="sprig-calendar-relationship-group">
                  <p className="sprig-calendar-relationship-label">
                    {linkedRecipes.length ===
                    1
                      ? 'Growing Recipe'
                      : 'Growing Recipes'}
                  </p>
  
                  <div className="sprig-calendar-chips">
                    {linkedRecipes.map(
                      recipe => (
                        <button
                          key={
                            recipe.id
                          }
  
                          type="button"
  
                          className="sprig-calendar-chip"
  
                          onClick={event => {
                            event.stopPropagation()
  
                            onOpenGrowingRecipe(
                              recipe.id,
                            )
                          }}
                        >
                          🧺{' '}
                          {recipe.name}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
  
  
          {(
            resultPlants.length >
              0 ||
            resultEvents.length >
              0 ||
            resultHarvests.length >
              0 ||
            resultPurchases.length >
              0
          ) && (
            <div className="sprig-calendar-relationships">
              <div className="sprig-calendar-relationship-group">
                <p className="sprig-calendar-relationship-label">
                  Reality recorded
                </p>
  
                <div className="sprig-calendar-chips">
  
                  {resultPlants.map(
                    plant => (
                      <button
                        key={`plant-${plant.id}`}
  
                        type="button"
  
                        className="sprig-calendar-chip"
  
                        onClick={event => {
                          event.stopPropagation()
  
                          onOpenPlant(
                            plant.id,
                          )
                        }}
                      >
                        🌱{' '}
                        {getPlantLabel(
                          plant,
                        )}
                      </button>
                    ),
                  )}
  
  
                  {resultEvents.map(
                    resultEvent => (
                      <button
                        key={`event-${resultEvent.id}`}
  
                        type="button"
  
                        className="sprig-calendar-chip"
  
                        onClick={event => {
                          event.stopPropagation()
  
                          onOpenJournalEntry(
                            resultEvent.id,
                          )
                        }}
                      >
                        📖{' '}
                        {resultEvent.title}
                      </button>
                    ),
                  )}
  
  
                  {resultHarvests.map(
                    resultHarvest => (
                      <button
                        key={`harvest-${resultHarvest.id}`}
  
                        type="button"
  
                        className="sprig-calendar-chip"
  
                        onClick={event => {
                          event.stopPropagation()
  
                          onOpenHarvest(
                            resultHarvest.id,
                          )
                        }}
                      >
                        🧺 Harvest
                      </button>
                    ),
                  )}
  
  
  {resultPurchases.map(
  resultPurchase => (
    <button
      key={`purchase-${resultPurchase.id}`}

      type="button"

      className="sprig-calendar-chip"

      onClick={event => {
        event.stopPropagation()

        onOpenPurchase(
          resultPurchase.id,
        )
      }}
    >
      🛒{' '}
      {getPurchaseContext(
        resultPurchase,
      ) ||
        'Purchase recorded'}
    </button>
  ),
)}
  
                </div>
              </div>
            </div>
          )}
  
  
          {isOpenable && (
            <p className="form-whisper">
              {item.sourceType ===
              'plan'
                ? 'Open this Garden Plan'
                : 'Open the original record'}
            </p>
          )}
        </article>
      )
    }
      /* =======================================
     PAGE
  ======================================= */

  return (
    <GardenLayout
      activePage="calendar"

      onNavigate={
        onNavigate
      }
    >
      <main className="journal-page sprig-calendar-page">

        {/* =======================================
            HEADER
        ======================================= */}

        <header className="journal-header">
          <div>
            <p className="section-label">
              Your garden through time
            </p>

            <h1>
              Calendar
            </h1>

            <p className="journal-intro">
              See what happened,
              what is happening now,
              and what may be waiting
              further along the path.
            </p>


            <button
              type="button"

              className="sprig-calendar-today-button"

              onClick={() =>
                openPlanComposer(
                  selectedDate,
                )
              }
            >
              + Add a plan
            </button>
          </div>
        </header>


        {/* =======================================
            CONTROLS
        ======================================= */}

        <section className="sprig-calendar-controls">

          {/* SEARCH */}

          <div className="sprig-calendar-search">
            <label
              htmlFor="sprig-calendar-search"
              className="section-label"
            >
              Find something in time
            </label>

            <div className="sprig-calendar-search-row">
              <input
                id="sprig-calendar-search"

                type="search"

                value={
                  searchQuery
                }

                onChange={
                  event =>
                    setSearchQuery(
                      event.target.value,
                    )
                }

                placeholder="Search plants, journal notes, harvests, places, plans…"

                className="sprig-calendar-search-input"
              />


              {searchQuery && (
                <button
                  type="button"

                  className="sprig-calendar-clear-search"

                  onClick={() =>
                    setSearchQuery(
                      '',
                    )
                  }
                >
                  Clear
                </button>
              )}
            </div>
          </div>


          {/* FILTERS */}

          <div className="sprig-calendar-filter-panel">
            <div>
              <p className="section-label">
                Show me
              </p>

              <p className="sprig-calendar-filter-intro">
                Choose which layers of garden time you want to see.
              </p>
            </div>


            <div className="sprig-calendar-filter-buttons">
              <button
                type="button"

                className={`sprig-calendar-filter-button sprig-calendar-filter-button--all${
                  isShowingEverything
                    ? ' sprig-calendar-filter-button--selected'
                    : ''
                }`}

                aria-pressed={
                  isShowingEverything
                }

                onClick={
                  showEverything
                }
              >
                Everything
              </button>


              {CALENDAR_FILTERS.map(
                filter => {
                  const isSelected =
                    selectedFilters.includes(
                      filter.id,
                    )


                  return (
                    <button
                      key={
                        filter.id
                      }

                      type="button"

                      className={`sprig-calendar-filter-button${
                        isSelected
                          ? ' sprig-calendar-filter-button--selected'
                          : ''
                      }`}

                      aria-pressed={
                        isSelected
                      }

                      onClick={() =>
                        toggleFilter(
                          filter.id,
                        )
                      }
                    >
                      <span aria-hidden="true">
                        {filter.icon}
                      </span>

                      {filter.label}
                    </button>
                  )
                },
              )}
            </div>


            <p className="sprig-calendar-filter-status">
              {selectedFilters.length} of 3 layers showing.
            </p>
          </div>
        </section>


        {/* =======================================
            SEARCH RESULTS
        ======================================= */}

        {cleanedSearchQuery && (
          <section className="sprig-calendar-search-results">
            <div className="sprig-calendar-section-heading">
              <div>
                <p className="section-label">
                  Calendar search
                </p>

                <h2>
                  {searchResults.length ===
                  0
                    ? 'Nothing found'
                    : `${searchResults.length} ${
                        searchResults.length ===
                        1
                          ? 'moment'
                          : 'moments'
                      } found`}
                </h2>
              </div>
            </div>


            {searchResults.length ===
            0 ? (
              <div className="sprig-calendar-empty-card">
                <p>
                  Sprig could not find anything matching “{cleanedSearchQuery}” in the Calendar layers currently showing.
                </p>
              </div>
            ) : (
              <div className="sprig-calendar-search-list">
                {searchResults.map(
                  item => (
                    <button
                      key={
                        item.id
                      }

                      type="button"

                      className="sprig-calendar-search-result"

                      onClick={() => {
                        jumpToCalendarItem(
                          item,
                        )

                        setSearchQuery(
                          '',
                        )
                      }}
                    >
                      <span className="sprig-calendar-search-result-date">
                        {formatShortDate(
                          item.startDate,
                        )}
                      </span>

                      <span className="sprig-calendar-search-result-body">
                        <strong>
                          {getItemContext(
                            item,
                          )}
                        </strong>

                        <span>
                          {item.title}
                        </span>
                      </span>

                      <span
                        className="sprig-calendar-search-result-arrow"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}
          </section>
        )}


        {/* =======================================
            MONTH
        ======================================= */}

        <section className="sprig-calendar-month-section">

          <div className="sprig-calendar-month-heading">
            <button
              type="button"

              className="sprig-calendar-month-button"

              onClick={() =>
                moveMonth(
                  -1,
                )
              }

              aria-label="Previous month"
            >
              ‹
            </button>


            <div>
              <p className="section-label">
                Calendar
              </p>

              <h2>
                {formatMonthHeading(
                  visibleMonth,
                )}
              </h2>
            </div>


            <button
              type="button"

              className="sprig-calendar-month-button"

              onClick={() =>
                moveMonth(
                  1,
                )
              }

              aria-label="Next month"
            >
              ›
            </button>
          </div>


          <div className="sprig-calendar-today-row">
            <button
              type="button"

              className="sprig-calendar-today-button"

              onClick={
                goToToday
              }
            >
              Today
            </button>
          </div>


          {/* WEEKDAYS */}

          <div className="sprig-calendar-weekdays">
            {[
              'Mon',
              'Tue',
              'Wed',
              'Thu',
              'Fri',
              'Sat',
              'Sun',
            ].map(
              day => (
                <div
                  key={
                    day
                  }
                >
                  {day}
                </div>
              ),
            )}
          </div>


          {/* MONTH GRID */}

          <div className="sprig-calendar-grid">
            {monthDates.map(
              date => {
                const dateString =
                  toDateString(
                    date,
                  )


                const dateItems =
                  getCalendarItemsForDate(
                    filteredCalendarItems,
                    dateString,
                  )


                const isCurrentMonth =
                  date.getMonth() ===
                    visibleMonth.getMonth() &&
                  date.getFullYear() ===
                    visibleMonth.getFullYear()


                const isToday =
                  dateString ===
                  todayDate


                const isSelected =
                  dateString ===
                  selectedDate


                const hasRecorded =
                  dateItems.some(
                    item =>
                      item.timeType ===
                      'recorded',
                  )


                const hasExpected =
                  dateItems.some(
                    item =>
                      item.timeType ===
                      'expected',
                  )


                const hasPlanned =
                  dateItems.some(
                    item =>
                      item.timeType ===
                      'planned',
                  )


                const classNames = [
                  'sprig-calendar-day',

                  !isCurrentMonth
                    ? 'sprig-calendar-day--outside'
                    : '',

                  isToday
                    ? 'sprig-calendar-day--today'
                    : '',

                  isSelected
                    ? 'sprig-calendar-day--selected'
                    : '',
                ]
                  .filter(
                    Boolean,
                  )
                  .join(
                    ' ',
                  )


                return (
                  <button
                    key={
                      dateString
                    }

                    type="button"

                    className={
                      classNames
                    }

                    onClick={() =>
                      setSelectedDate(
                        dateString,
                      )
                    }

                    aria-label={`${formatFullDate(
                      dateString,
                    )}${
                      dateItems.length >
                      0
                        ? `, ${dateItems.length} calendar ${
                            dateItems.length ===
                            1
                              ? 'item'
                              : 'items'
                          }`
                        : ''
                    }`}
                  >
                    <strong>
                      {date.getDate()}
                    </strong>


                    <div
                      className="sprig-calendar-day-indicators"
                      aria-hidden="true"
                    >
                      {hasRecorded && (
                        <span>
                          ●
                        </span>
                      )}

                      {hasExpected && (
                        <span>
                          ○
                        </span>
                      )}

                      {hasPlanned && (
                        <span>
                          ◇
                        </span>
                      )}
                    </div>
                  </button>
                )
              },
            )}
          </div>
        </section>


        {/* =======================================
            DAY STORY
        ======================================= */}

        <section className="sprig-calendar-day-story">
          <div className="sprig-calendar-section-heading">
            <div>
              <p className="section-label">
                The garden on this day
              </p>

              <h2>
                {formatFullDate(
                  selectedDate,
                )}
              </h2>
            </div>


            <button
              type="button"

              className="sprig-calendar-today-button"

              onClick={() =>
                openPlanComposer(
                  selectedDate,
                )
              }
            >
              + Plan this day
            </button>
          </div>


          {selectedDayItems.length ===
          0 ? (
            <div className="sprig-calendar-empty-card">
              <p className="section-label">
                A quiet page
              </p>

              <h3>
                Nothing is showing here
              </h3>

              <p>
                Sprig does not currently know of any garden moments on this date within the Calendar layers you have chosen.
              </p>
            </div>
          ) : (
            <div className="sprig-calendar-day-groups">
              {dayStoryGroups.map(
                group => (
                  <section
                    key={
                      group.id
                    }

                    className={`sprig-calendar-day-group sprig-calendar-day-group--${group.timeType} sprig-calendar-day-group--${group.id}`}
                  >
                    <div className="sprig-calendar-day-group-heading">
                      <span
                        className={`sprig-calendar-group-mark sprig-calendar-group-mark--${group.timeType}`}
                        aria-hidden="true"
                      >
                        {group.timeType ===
                        'recorded'
                          ? '●'
                          : group.timeType ===
                              'expected'
                            ? '○'
                            : '◇'}
                      </span>


                      <div>
                        <p className="section-label">
                          {group.label}
                        </p>

                        <h3>
                          {group.heading}
                        </h3>
                      </div>
                    </div>


                    <div className="sprig-calendar-day-group-items">
                      {group.items.map(
                        renderCalendarItem,
                      )}
                    </div>
                  </section>
                ),
              )}
            </div>
          )}
        </section>


        {/* =======================================
            WHAT IF?
        ======================================= */}

        <section className="sprig-calendar-planning-placeholder">
          <div className="sprig-calendar-empty-card">
            <p className="section-label">
              What if?
            </p>

            <h3>
              Do the garden maths
            </h3>

            <p>
              Try a date and growing time without creating a Plant Story or a Plan.
            </p>


            <GardenTimingCalculator
              referenceType="sown"

              referenceDate={
                selectedDate
              }

              allowDirectionSwitch={
                true
              }

              direction="forward"

              showDateInputs={
                true
              }

              title="Do the garden maths"

              intro="Try a date and growing time without creating a Plant Story or a Plan."
            />
          </div>
        </section>


        {/* =======================================
            PLANNING
        ======================================= */}

        <section className="sprig-calendar-planning-placeholder">
          <div className="sprig-calendar-empty-card">
            <p className="section-label">
              Planning
            </p>

            <h3>
              Looking further ahead
            </h3>

            <p>
              Save something you intend to do without
              turning it into garden history before it
              actually happens.
            </p>


            <button
              type="button"

              className="sprig-calendar-today-button"

              onClick={() =>
                openPlanComposer(
                  selectedDate,
                )
              }
            >
              + Add a plan
            </button>
          </div>
        </section>


        {/* =======================================
            PLAN COMPOSER
        ======================================= */}

        {isPlanComposerOpen && (
          <div
            className="sprig-calendar-plan-backdrop"

            role="presentation"

            onMouseDown={
              event => {
                if (
                  event.target ===
                  event.currentTarget
                ) {
                  closePlanComposer()
                }
              }
            }
          >
            <section
              className="sprig-calendar-plan-sheet"

              role="dialog"

              aria-modal="true"

              aria-labelledby="sprig-calendar-plan-title"
            >
              {/* =================================
                  HEADING
              ================================= */}

              <div className="sprig-calendar-plan-sheet-heading">
                <div>
                  <p className="section-label">
                    Garden Plan
                  </p>

                  <h2 id="sprig-calendar-plan-title">
                    {isEditingPlan
                      ? generatedPlanTitle ||
                        editingPlan?.title ||
                        'Review this plan'
                      : 'Add something ahead'}
                  </h2>

                  <p>
                    {isEditingPlan
                      ? 'This is the original intention behind the Calendar possibilities Sprig shows from it. Changing the Plan does not rewrite garden history.'
                      : 'Plan what you would like to do. Nothing here becomes garden history until it actually happens.'}
                  </p>
                </div>


                <button
                  type="button"

                  className="sprig-calendar-plan-close"

                  onClick={
                    closePlanComposer
                  }

                  aria-label="Close plan"
                >
                  ×
                </button>
              </div>


              {/* =================================
                  STATUS + REALITY
              ================================= */}

              {editingPlan && (
                <div className="sprig-calendar-empty-card">
                  <p className="section-label">
                    Plan status
                  </p>

                  <h3>
                    {getPlanStatusLabel(
                      editingPlan.status,
                    )}
                  </h3>

                  <p>
                    {getPlanStatusDescription(
                      editingPlan.status,
                    )}
                  </p>


                  {editingPlan.results &&
                    editingPlan.results.length >
                      0 && (
                    <>
                      <p className="section-label">
                        Reality recorded
                      </p>


                      <div className="sprig-calendar-relationships">
                        {editingPlan.results.map(
                          result => {

                            if (
                              result.recordType ===
                              'plant-story'
                            ) {
                              const resultPlant =
                                findPlant(
                                  result.recordId,
                                )


                              if (
                                !resultPlant
                              ) {
                                return null
                              }


                              return (
                                <button
                                  key={`${result.recordType}-${result.recordId}`}

                                  type="button"

                                  className="sprig-calendar-chip"

                                  onClick={() => {
                                    closePlanComposer()

                                    onOpenPlant(
                                      resultPlant.id,
                                    )
                                  }}
                                >
                                  🌱 Open{' '}
                                  {getPlantLabel(
                                    resultPlant,
                                  )}
                                </button>
                              )
                            }


                            if (
                              result.recordType ===
                              'garden-event'
                            ) {
                              const resultEvent =
                                findJournalEntry(
                                  result.recordId,
                                )


                              if (
                                !resultEvent
                              ) {
                                return null
                              }


                              return (
                                <button
                                  key={`${result.recordType}-${result.recordId}`}

                                  type="button"

                                  className="sprig-calendar-chip"

                                  onClick={() => {
                                    closePlanComposer()

                                    onOpenJournalEntry(
                                      resultEvent.id,
                                    )
                                  }}
                                >
                                  📖 Open{' '}
                                  {resultEvent.title}
                                </button>
                              )
                            }


                            if (
                              result.recordType ===
                              'harvest'
                            ) {
                              const resultHarvest =
                                findHarvest(
                                  result.recordId,
                                )


                              if (
                                !resultHarvest
                              ) {
                                return null
                              }


                              return (
                                <button
                                  key={`${result.recordType}-${result.recordId}`}

                                  type="button"

                                  className="sprig-calendar-chip"

                                  onClick={() => {
                                    closePlanComposer()

                                    onOpenHarvest(
                                      resultHarvest.id,
                                    )
                                  }}
                                >
                                  🧺 Open Harvest
                                </button>
                              )
                            }


                            if (
                              result.recordType ===
                              'purchase'
                            ) {
                              const resultPurchase =
                                findPurchase(
                                  result.recordId,
                                )


                              if (
                                !resultPurchase
                              ) {
                                return null
                              }


                              return (
                                <span
                                  key={`${result.recordType}-${result.recordId}`}

                                  className="sprig-calendar-chip"
                                >
                                  🛒{' '}
                                  {getPurchaseContext(
                                    resultPurchase,
                                  ) ||
                                    'Purchase recorded'}
                                </span>
                              )
                            }


                            return null
                          },
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}


              {/* =================================
                  KIND
              ================================= */}

              <div className="sprig-calendar-plan-field">
                <span>
                  What are you thinking ahead about?
                </span>

                <div className="sprig-calendar-plan-kind-grid">
                  {GARDEN_PLAN_KIND_OPTIONS.map(
                    option => {
                      const isSelected =
                        planKind ===
                        option.id


                      return (
                        <button
                          key={
                            option.id
                          }

                          type="button"

                          className={`sprig-calendar-plan-kind${
                            isSelected
                              ? ' sprig-calendar-plan-kind--selected'
                              : ''
                          }`}

                          aria-pressed={
                            isSelected
                          }

                          disabled={
                            Boolean(
                              editingPlan &&
                              editingPlan.status !==
                                'planned',
                            )
                          }

                          onClick={() =>
                            choosePlanKind(
                              option.id,
                            )
                          }
                        >
                          <span aria-hidden="true">
                            {option.icon}
                          </span>

                          {option.label}
                        </button>
                      )
                    },
                  )}
                </div>
              </div>


              {/* =================================
                  CUSTOM KIND
              ================================= */}

              {planKind ===
                'other' && (
                <div className="sprig-calendar-plan-field">
                  <label htmlFor="sprig-plan-custom-kind">
                    Your wording
                  </label>

                  <input
                    id="sprig-plan-custom-kind"

                    type="text"

                    value={
                      planCustomKindLabel
                    }

                    onChange={
                      event =>
                        setPlanCustomKindLabel(
                          event.target.value,
                        )
                    }

                    placeholder="What would you call it?"
                  />
                </div>
              )}


              {/* =================================
                  FREE TITLE
              ================================= */}

              {!usesGeneratedTitle && (
                <div className="sprig-calendar-plan-field">
                  <label htmlFor="sprig-plan-title">
                    {getFreePlanPrompt(
                      planKind,
                    )}
                  </label>

                  <input
                    id="sprig-plan-title"

                    type="text"

                    value={
                      planTitle
                    }

                    onChange={
                      event =>
                        setPlanTitle(
                          event.target.value,
                        )
                    }

                    placeholder={
                      getFreePlanPlaceholder(
                        planKind,
                      )
                    }
                  />
                </div>
              )}


              {/* =================================
                  FUTURE PLANT
              ================================= */}

              {isFuturePlantPlan && (
                <div className="sprig-calendar-plan-field">
                  <p className="section-label">
                    The plant you are planning
                  </p>

                  <p>
                    This describes what you intend to grow.
                    It does not create a Plant Story yet.
                  </p>


                  <div className="sprig-calendar-plan-field">
                    <label htmlFor="sprig-plan-plant-name">
                      Plant
                    </label>

                    <input
                      id="sprig-plan-plant-name"

                      type="text"

                      value={
                        plannedPlantName
                      }

                      onChange={
                        event =>
                          setPlannedPlantName(
                            event.target.value,
                          )
                      }

                      placeholder="e.g. Potato"
                    />
                  </div>


                  <div className="sprig-calendar-plan-field">
                    <label htmlFor="sprig-plan-plant-variety">
                      Variety
                      <span className="sprig-calendar-plan-optional">
                        {' '}
                        optional
                      </span>
                    </label>

                    <input
                      id="sprig-plan-plant-variety"

                      type="text"

                      value={
                        plannedPlantVariety
                      }

                      onChange={
                        event =>
                          setPlannedPlantVariety(
                            event.target.value,
                          )
                      }

                      placeholder="e.g. Royal Blue"
                    />
                  </div>


                  <div className="sprig-calendar-plan-field">
                    <label htmlFor="sprig-plan-plant-quantity">
                      How many?
                      <span className="sprig-calendar-plan-optional">
                        {' '}
                        optional
                      </span>
                    </label>

                    <input
                      id="sprig-plan-plant-quantity"

                      type="number"

                      min="1"

                      step="1"

                      value={
                        plannedPlantQuantity
                      }

                      onChange={
                        event =>
                          setPlannedPlantQuantity(
                            event.target.value,
                          )
                      }

                      placeholder="e.g. 4"
                    />
                  </div>


                  {generatedPlanTitle && (
                    <div className="sprig-calendar-empty-card">
                      <p className="section-label">
                        Sprig will call this
                      </p>

                      <h3>
                        {generatedPlanTitle}
                      </h3>
                    </div>
                  )}
                </div>
              )}


              {/* =================================
                  EXISTING PLANTS
              ================================= */}

              {usesExistingPlants && (
                <div className="sprig-calendar-plan-field">
                  <p className="section-label">
                    Plant Stories
                  </p>

                  <span>
                    Which existing plants does this involve?
                  </span>


                  {gardenData.plantStories.length ===
                  0 ? (
                    <div className="sprig-calendar-empty-card">
                      <p>
                        There are no Plant Stories to choose yet.
                      </p>
                    </div>
                  ) : (
                    <div className="sprig-calendar-plan-kind-grid">
                      {gardenData.plantStories.map(
                        plant => {
                          const isSelected =
                            selectedPlanPlantIds.includes(
                              plant.id,
                            )


                          return (
                            <button
                              key={
                                plant.id
                              }

                              type="button"

                              className={`sprig-calendar-plan-kind${
                                isSelected
                                  ? ' sprig-calendar-plan-kind--selected'
                                  : ''
                              }`}

                              aria-pressed={
                                isSelected
                              }

                              onClick={() =>
                                togglePlanPlant(
                                  plant.id,
                                )
                              }
                            >
                              <span aria-hidden="true">
                                🌱
                              </span>

                              {getPlantLabel(
                                plant,
                              )}
                            </button>
                          )
                        },
                      )}
                    </div>
                  )}


                  {generatedPlanTitle && (
                    <div className="sprig-calendar-empty-card">
                      <p className="section-label">
                        Sprig will call this
                      </p>

                      <h3>
                        {generatedPlanTitle}
                      </h3>
                    </div>
                  )}
                </div>
              )}


              {/* =================================
                  GROWING PLACE
              ================================= */}

              {canUseGrowingPlace && (
                <div className="sprig-calendar-plan-field">
                  <p className="section-label">
                    Growing Place
                  </p>

                  <span>
                    Where are you thinking?
                    <span className="sprig-calendar-plan-optional">
                      {' '}
                      optional
                    </span>
                  </span>


                  {gardenData.growingPlaces.length ===
                  0 ? (
                    <div className="sprig-calendar-empty-card">
                      <p>
                        No Growing Places are saved yet.
                      </p>
                    </div>
                  ) : (
                    <div className="sprig-calendar-plan-kind-grid">
                      {gardenData.growingPlaces.map(
                        place => {
                          const isSelected =
                            selectedPlanPlaceIds.includes(
                              place.id,
                            )


                          return (
                            <button
                              key={
                                place.id
                              }

                              type="button"

                              className={`sprig-calendar-plan-kind${
                                isSelected
                                  ? ' sprig-calendar-plan-kind--selected'
                                  : ''
                              }`}

                              aria-pressed={
                                isSelected
                              }

                              onClick={() =>
                                togglePlanPlace(
                                  place.id,
                                )
                              }
                            >
                              <span aria-hidden="true">
                                🪴
                              </span>

                              {place.name}
                            </button>
                          )
                        },
                      )}
                    </div>
                  )}
                </div>
              )}


              {/* =================================
                  GROWING RECIPE
              ================================= */}

              {canUseGrowingSetup && (
                <div className="sprig-calendar-plan-field">
                  <p className="section-label">
                    Growing Recipe
                  </p>

                  <span>
                    What are you thinking of growing it in?
                    <span className="sprig-calendar-plan-optional">
                      {' '}
                      optional
                    </span>
                  </span>


                  {(
                    gardenData.growingSetups ??
                    []
                  ).length ===
                  0 ? (
                    <div className="sprig-calendar-empty-card">
                      <p>
                        No Growing Recipes are saved yet.
                      </p>
                    </div>
                  ) : (
                    <div className="sprig-calendar-plan-kind-grid">
                      {(
                        gardenData.growingSetups ??
                        []
                      ).map(
                        setup => {
                          const isSelected =
                            selectedPlanSetupIds.includes(
                              setup.id,
                            )


                          return (
                            <button
                              key={
                                setup.id
                              }

                              type="button"

                              className={`sprig-calendar-plan-kind${
                                isSelected
                                  ? ' sprig-calendar-plan-kind--selected'
                                  : ''
                              }`}

                              aria-pressed={
                                isSelected
                              }

                              onClick={() =>
                                togglePlanSetup(
                                  setup.id,
                                )
                              }
                            >
                              <span aria-hidden="true">
                                🧺
                              </span>

                              {setup.name}
                            </button>
                          )
                        },
                      )}
                    </div>
                  )}
                </div>
              )}


              {/* =================================
                  BUY EXPLANATION
              ================================= */}

              {planKind ===
                'buy' && (
                <div className="sprig-calendar-empty-card">
                  <p className="section-label">
                    A future purchase
                  </p>

                  <p>
                    Save what you intend to buy here.
                    When you actually buy it, “Record what happened”
                    will open a real Purchase record with this Plan
                    carried forward as its starting point.
                  </p>
                </div>
              )}


              {/* =================================
                  WHEN
              ================================= */}

              <div className="sprig-calendar-plan-field">
                <span>
                  When are you planning this?
                </span>

                <div className="sprig-calendar-plan-kind-grid">
                  <button
                    type="button"

                    className={`sprig-calendar-plan-kind${
                      planDateMode ===
                        'single'
                        ? ' sprig-calendar-plan-kind--selected'
                        : ''
                    }`}

                    aria-pressed={
                      planDateMode ===
                      'single'
                    }

                    onClick={() => {
                      setPlanDateMode(
                        'single',
                      )

                      setPlanEndDate(
                        '',
                      )
                    }}
                  >
                    One day
                  </button>


                  <button
                    type="button"

                    className={`sprig-calendar-plan-kind${
                      planDateMode ===
                        'range'
                        ? ' sprig-calendar-plan-kind--selected'
                        : ''
                    }`}

                    aria-pressed={
                      planDateMode ===
                      'range'
                    }

                    onClick={() =>
                      setPlanDateMode(
                        'range',
                      )
                    }
                  >
                    A date range
                  </button>
                </div>
              </div>


              {planDateMode ===
                'single' ? (
                <div className="sprig-calendar-plan-field">
                  <label htmlFor="sprig-plan-date">
                    Planned date
                  </label>

                  <input
                    id="sprig-plan-date"

                    type="date"

                    value={
                      planDate
                    }

                    onChange={
                      event =>
                        setPlanDate(
                          event.target.value,
                        )
                    }
                  />
                </div>
              ) : (
                <div className="sprig-calendar-plan-date-grid">
                  <div className="sprig-calendar-plan-field">
                    <label htmlFor="sprig-plan-date">
                      Start date
                    </label>

                    <input
                      id="sprig-plan-date"

                      type="date"

                      value={
                        planDate
                      }

                      onChange={
                        event => {
                          const nextDate =
                            event.target.value


                          setPlanDate(
                            nextDate,
                          )


                          if (
                            planEndDate &&
                            nextDate &&
                            planEndDate <
                              nextDate
                          ) {
                            setPlanEndDate(
                              '',
                            )
                          }
                        }
                      }
                    />
                  </div>


                  <div className="sprig-calendar-plan-field">
                    <label htmlFor="sprig-plan-end-date">
                      End date
                    </label>

                    <input
                      id="sprig-plan-end-date"

                      type="date"

                      min={
                        planDate ||
                        undefined
                      }

                      value={
                        planEndDate
                      }

                      onChange={
                        event =>
                          setPlanEndDate(
                            event.target.value,
                          )
                      }
                    />
                  </div>
                </div>
              )}


              {/* =================================
                  TIMING
              ================================= */}

              {canProjectHarvest &&
                planTimingReference && (
                <GardenTimingCalculator
                  referenceType={
                    planTimingReference
                  }

                  referenceDate={
                    planDate
                  }

                  referenceEndDate={
                    planDateMode ===
                      'range'
                      ? planEndDate
                      : undefined
                  }

                  daysMin={
                    planTimingDaysMin
                  }

                  daysMax={
                    planTimingDaysMax
                  }

                  onTimingChange={(
                    daysMin,
                    daysMax,
                  ) => {
                    setPlanTimingDaysMin(
                      daysMin,
                    )

                    setPlanTimingDaysMax(
                      daysMax,
                    )
                  }}

                  allowDirectionSwitch={
                    false
                  }

                  direction="forward"

                  showDateInputs={
                    false
                  }

                  title="Work out the dates as you plan"

                  intro="Enter the growing time you expect and Sprig will count the calendar for you immediately."
                />
              )}


              {/* =================================
                  NOTES
              ================================= */}

              <div className="sprig-calendar-plan-field">
                <label htmlFor="sprig-plan-notes">
                  A note for later
                  <span className="sprig-calendar-plan-optional">
                    {' '}
                    optional
                  </span>
                </label>

                <textarea
                  id="sprig-plan-notes"

                  value={
                    planNotes
                  }

                  onChange={
                    event =>
                      setPlanNotes(
                        event.target.value,
                      )
                  }

                  rows={
                    4
                  }

                  placeholder="Anything future-you will want to remember?"
                />
              </div>


              {/* =================================
                  PLAN LIFECYCLE
              ================================= */}

              {editingPlan?.status ===
                'planned' && (
                <div className="sprig-calendar-empty-card">
                  <p className="section-label">
                    When the garden catches up
                  </p>

                  <h3>
                    Record reality separately
                  </h3>

                  <p>
                    The Plan stays as what you intended.
                    Sprig will open the real record with
                    what this Plan already knows, and you
                    can change anything that happened
                    differently.
                  </p>


                  {canRecordEditingPlan && (
                    <button
                      type="button"

                      className="sprig-calendar-plan-save"

                      onClick={
                        recordEditingPlan
                      }
                    >
                      Record what happened
                    </button>
                  )}


                  <button
                    type="button"

                    className="sprig-calendar-plan-cancel"

                    onClick={() =>
                      updateEditingPlanStatus(
                        'not-done',
                      )
                    }
                  >
                    Decided not to
                  </button>
                </div>
              )}


              {editingPlan?.status ===
                'not-done' && (
                <div className="sprig-calendar-empty-card">
                  <p className="section-label">
                    Changed your mind?
                  </p>

                  <button
                    type="button"

                    className="sprig-calendar-plan-save"

                    onClick={() =>
                      updateEditingPlanStatus(
                        'planned',
                      )
                    }
                  >
                    Put this Plan back
                  </button>
                </div>
              )}


              {/* =================================
                  ACTIONS
              ================================= */}

              <div className="sprig-calendar-plan-actions">

                <button
                  type="button"

                  className="sprig-calendar-plan-cancel"

                  onClick={
                    closePlanComposer
                  }
                >
                  {editingPlan?.status ===
                  'recorded'
                    ? 'Close'
                    : 'Leave it for now'}
                </button>


                {(
                  !editingPlan ||
                  editingPlan.status ===
                    'planned'
                ) && (
                  <button
                    type="button"

                    className="sprig-calendar-plan-save"

                    disabled={
                      !generatedPlanTitle.trim() ||
                      !planDate ||
                      (
                        planDateMode ===
                          'range' &&
                        !planEndDate
                      )
                    }

                    onClick={
                      savePlan
                    }
                  >
                    {isEditingPlan
                      ? 'Save changes'
                      : 'Add this plan'}
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

      </main>
    </GardenLayout>
  )
}


export default Calendar