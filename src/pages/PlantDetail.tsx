import { useLayoutEffect, useState, } from 'react';
import GardenLayout from '../components/layout/GardenLayout';
import AddPlantForm from '../components/forms/AddPlantForm';
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery';
import SprigPhotoPicker from '../components/photos/SprigPhotoPicker';
import SprigQuickPeek from '../components/common/SprigQuickPeek';
import PlantSmartComparisons from '../components/plants/PlantSmartComparisons';
import type { GardenEvent, GardenProduct, GrowingPlace, GrowingSetup, Ingredient, PlantOriginType, PlantStory, HarvestRecord, SprigPhotoMetadata, SprigPhotoPurpose, } from '../types';
import type { AppPage, } from '../types/navigation';

interface PlantDetailProps {
    plant: PlantStory;
    plants: PlantStory[];
    onOpenPlant: (plantId: string) => void;
    onComparePlants: (plantIds: string[]) => void;
    growingPlaces: GrowingPlace[];
    growingSetups: GrowingSetup[];
    ingredients: Ingredient[];
    products: GardenProduct[];
    events: GardenEvent[];
    harvests: HarvestRecord[];
    journeyBackLabel: string | null;
    onBack: () => void;
    onOpenPlants: () => void;
    onNavigate: (page: AppPage) => void;
    onOpenGrowingPlace: (growingPlaceId: string) => void;
    onOpenJournalEntry: (eventId: string) => void;
    onOpenHarvest: (harvestId: string) => void;
    onAddHarvest: (plantStoryIds: string[]) => void;
    onAddEvent: () => void;
    onAddPlant: (plant: PlantStory) => void;
    onAddGrowingPlace: (place: GrowingPlace, setup?: GrowingSetup) => void;
    onAddRecipe: (recipe: GrowingSetup) => void;
    onAddIngredient: (ingredient: Ingredient) => void;
    onAddProduct: (product: GardenProduct) => void;
    onDeleteEvent: (eventId: string) => void;
    onDeletePlant: (plantId: string) => void;
    onUpdatePlant: (plant: PlantStory) => void;
}

type PlantPhotoSourceType = 'plant-story' | 'garden-event' | 'harvest';

interface PlantPhotographicStoryItem {
    key: string;
    photoUrl: string;
    photoDate?: string;
    photoTime?: string;
    title?: string;
    notes?: string;
    tags?: string[];
    purpose?: SprigPhotoPurpose;
    sourceType: PlantPhotoSourceType;
    sourceId: string;
    sourcePhotoIndex: number;
    sourceLabel: string;
    sourceDetail?: string;
    fallbackDate?: string;
}

/* =======================================
   GENERAL LABEL
======================================= */

function formatLabel(value: string): string {
    return value
        .replaceAll('-', ' ')
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

/* =======================================
   DATE
======================================= */

function formatDate(date?: string): string {
    if (!date) {
        return 'Not recorded';
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/* =======================================
   SHORT DATE
======================================= */

function formatShortDate(date?: string): string {
    if (!date) {
        return 'Date not recorded';
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

type PlantDurationDisplayUnit = 'days' | 'weeks' | 'months';

/* =======================================
   PLANT AGE / DURATION
======================================= */

function getDaysBetweenDates(startDate: string, endDate: string): number {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    return Math.round(
        (end.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24),
    );
}

function formatDuration(
    days: number,
    unit: PlantDurationDisplayUnit,
): string {
    const absoluteDays = Math.abs(days);

    if (unit === 'days') {
        const roundedDays = Math.round(absoluteDays);

        return `${roundedDays} ${
            roundedDays === 1
                ? 'day'
                : 'days'
        }`;
    }

    if (unit === 'weeks') {
        const weeks = absoluteDays / 7;

        const displayWeeks =
            Number.isInteger(weeks)
                ? `${weeks}`
                : weeks.toFixed(1);

        return `${displayWeeks} ${
            weeks === 1
                ? 'week'
                : 'weeks'
        }`;
    }

    const months = absoluteDays / 30.4375;

    const displayMonths =
        Number.isInteger(months)
            ? `${months}`
            : months.toFixed(1);

    return `${displayMonths} ${
        months === 1
            ? 'month'
            : 'months'
    }`;
}

function getLocalDateKey(date: Date): string {
    const year = date.getFullYear();

    const month = `${date.getMonth() + 1}`
        .padStart(2, '0');

    const day = `${date.getDate()}`
        .padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatPlantAgeAtDate(
    storyBeginningDate: string,
    date: string,
    unit: PlantDurationDisplayUnit,
): string {
    const ageDays =
        getDaysBetweenDates(
            storyBeginningDate,
            date,
        );

    if (ageDays < 0) {
        return `${formatDuration(
            ageDays,
            unit,
        )} before story began`;
    }

    return `Age ${formatDuration(
        ageDays,
        unit,
    )}`;
}

interface DurationUnitToggleProps {
    value: PlantDurationDisplayUnit;
    onChange: (
        unit: PlantDurationDisplayUnit,
    ) => void;
}

function DurationUnitToggle({
    value,
    onChange,
}: DurationUnitToggleProps) {
    const units: PlantDurationDisplayUnit[] = [
        'days',
        'weeks',
        'months',
    ];

    return (
        <div
            aria-label="Choose how Sprig shows plant age"
            style={{
                display: 'inline-flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.15rem',
                marginTop: '0.35rem',
            }}
        >
            {units.map(unit => (
                <button
                    key={unit}
                    type="button"
                    className="text-button"
                    aria-pressed={
                        value === unit
                    }
                    onClick={event => {
                        event.stopPropagation();

                        onChange(unit);
                    }}
                    style={{
                        minHeight: 'unset',
                        padding: '0.18rem 0.38rem',
                        fontSize: '0.72rem',
                        lineHeight: 1.2,
                        fontWeight:
                            value === unit
                                ? 700
                                : 500,
                        textDecoration:
                            value === unit
                                ? 'underline'
                                : 'none',
                        textUnderlineOffset: '0.18rem',
                    }}
                >
                    {unit === 'days'
                        ? 'Days'
                        : unit === 'weeks'
                            ? 'Weeks'
                            : 'Months'}
                </button>
            ))}
        </div>
    );
}

/* =======================================
   PHOTO PURPOSE
======================================= */

function getPhotoPurposeLabel(
    purpose: SprigPhotoPurpose | undefined,
): string | undefined {
    if (!purpose) {
        return undefined;
    }

    switch (purpose) {
        case 'observation':
            return 'Observation';

        case 'progress':
            return 'Progress';

        case 'problem':
            return 'Problem';

        case 'harvest':
            return 'Harvest';

        case 'setup':
            return 'Setup';

        case 'reference':
            return 'Reference';

        case 'other':
        default:
            return 'Other';
    }
}

/* =======================================
   PHOTO METADATA LOOKUP
======================================= */

function getPhotoMetadata(
    photoUrl: string,
    index: number,
    photoMetadata:
        (SprigPhotoMetadata | undefined)[] |
        undefined,
): SprigPhotoMetadata | undefined {
    const indexedMetadata =
        photoMetadata?.[index];

    /*
     * Photo arrays are kept aligned by index.
     * Prefer that exact record first so two
     * photographs using the same image URL
     * can still keep different context.
     */
    if (indexedMetadata) {
        return indexedMetadata;
    }

    /*
     * Older records may not have perfectly
     * aligned metadata arrays, so retain the
     * URL lookup as a backwards-compatible
     * fallback only.
     */
    return photoMetadata?.find(
        metadata =>
            metadata?.photoUrl === photoUrl,
    );
}

/* =======================================
   GROWING RECIPE LABEL
======================================= */

function getGrowingSetupCategoryLabel(
    setup: GrowingSetup,
): string {
    switch (setup.category) {
        case 'own-mix':
            return 'My Recipe';

        case 'bought-mix':
            return 'Bought Mix';

        case 'ground-type':
            return 'Native Ground';

        case 'growing-system':
            return 'Growing System';

        default:
            return 'Garden Recipe';
    }
}

/* =======================================
   START METHOD
======================================= */

function getStartMethodLabel(
    plant: PlantStory,
): string {
    if (
        plant.startMethod === 'other' &&
        plant.customStartMethodLabel
    ) {
        return plant.customStartMethodLabel;
    }

    return formatLabel(
        plant.startMethod,
    );
}

/* =======================================
   PLANT ORIGIN
======================================= */

function getPlantOriginLabel(
    originType?: PlantOriginType,
): string {
    if (!originType) {
        return 'Not recorded';
    }

    switch (originType) {
        case 'bought':
            return 'Bought';

        case 'saved-from-garden':
            return 'Saved from my garden';

        case 'propagated-from-plant':
            return 'Propagated from another plant';

        case 'gifted':
            return 'Given to me';

        case 'swapped':
            return 'Swapped';

        case 'found-or-existing':
            return 'Found or already growing';

        case 'unknown':
            return 'Not sure';

        case 'other':
            return 'Something else';

        default:
            return 'Not recorded';
    }
}

/* =======================================
   HARVEST TIMELINE LABEL
======================================= */

function getHarvestTimelineTitle(
    harvest: HarvestRecord,
): string {
    if (
        harvest.harvestType === 'other' &&
        harvest.customHarvestTypeLabel
    ) {
        return harvest.customHarvestTypeLabel;
    }

    switch (harvest.harvestType) {
        case 'first':
            return 'First harvest';

        case 'regular':
            return 'Regular harvest';

        case 'main':
            return 'Main harvest';

        case 'secondary':
            return 'Secondary harvest';

        case 'final':
            return 'Final harvest';

        case 'other':
            return 'Other harvest';

        default:
            return 'Harvest';
    }
}

/* =======================================
   HARVEST TIMELINE AMOUNT
======================================= */

function getHarvestTimelineAmount(
    harvest: HarvestRecord,
): string | undefined {
    const pieces: string[] = [];

    if (
        harvest.count !== undefined
    ) {
        pieces.push(
            `${harvest.count}`,
        );
    }

    if (
        harvest.measurementAmount !== undefined
    ) {
        let unitLabel = '';

        switch (harvest.measurementUnit) {
            case 'gram':
                unitLabel = 'g';
                break;

            case 'kilogram':
                unitLabel = 'kg';
                break;

            case 'millilitre':
                unitLabel = 'mL';
                break;

            case 'litre':
                unitLabel = 'L';
                break;

            case 'bunch':
                unitLabel = 'bunch';
                break;

            case 'handful':
                unitLabel = 'handful';
                break;

            case 'basket':
                unitLabel = 'basket';
                break;

            case 'container':
                unitLabel = 'container';
                break;

            case 'other':
                unitLabel =
                    harvest.customMeasurementUnitLabel ??
                    '';
                break;

            default:
                unitLabel = '';
        }

        pieces.push(
            unitLabel
                ? `${harvest.measurementAmount} ${unitLabel}`
                : `${harvest.measurementAmount}`,
        );
    }

    return pieces.length > 0
        ? pieces.join(' · ')
        : undefined;
}

/* =======================================
   HARVEST DATE
======================================= */

function addDaysToDate(
    date: string,
    days: number,
): Date {
    const result =
        new Date(
            `${date}T00:00:00`,
        );

    result.setDate(
        result.getDate() + days,
    );

    return result;
}

/* =======================================
   EXPORT FILE NAME
======================================= */

function createSafeFileName(
    value: string,
): string {
    return value
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            '-',
        )
        .replace(
            /^-|-$/g,
            '',
        );
}

/* =======================================
   PLANT DETAIL
======================================= */

export default function PlantDetail({
    plant,
    plants,
    growingPlaces,
    growingSetups,
    ingredients,
    products,
    events,
    harvests,
    journeyBackLabel,
    onOpenPlant,
    onComparePlants,
    onBack,
    onOpenPlants,
    onNavigate,
    onOpenGrowingPlace,
    onOpenJournalEntry,
    onOpenHarvest,
    onAddHarvest,
    onAddEvent,
    onAddPlant,
    onAddGrowingPlace,
    onAddRecipe,
    onAddIngredient,
    onAddProduct,
    onDeleteEvent,
    onDeletePlant,
    onUpdatePlant,
}: PlantDetailProps) {

    /* =======================================
       EDIT / VARIATION
    ======================================= */

    const [
        isEditOpen,
        setIsEditOpen,
    ] = useState(false);

    const [
        isVariationOpen,
        setIsVariationOpen,
    ] = useState(false);

    /* =======================================
       VARIATION CREATED
    ======================================= */

    function handleVariationCreated(
        newPlant: PlantStory,
    ) {
        onAddPlant(newPlant);

        setIsVariationOpen(false);

        onOpenPlant(
            newPlant.id,
        );

        setIsEditOpen(true);
    }

    /* =======================================
       AGE DISPLAY
    ======================================= */

    const [
        durationDisplayUnit,
        setDurationDisplayUnit,
    ] =
        useState<PlantDurationDisplayUnit>(
            'weeks',
        );

    /* =======================================
       QUICK PEEK
    ======================================= */

    const [
        isRecipeQuickPeekOpen,
        setIsRecipeQuickPeekOpen,
    ] = useState(false);

    const [
        isHarvestTimingQuickPeekOpen,
        setIsHarvestTimingQuickPeekOpen,
    ] = useState(false);

    const [
        customHarvestTimingDate,
        setCustomHarvestTimingDate,
    ] = useState('');

    const [
        customHarvestTimingLabel,
        setCustomHarvestTimingLabel,
    ] = useState('');

    /* =======================================
       PHOTO ADDER
    ======================================= */

    const [
        isPhotoQuickAddOpen,
        setIsPhotoQuickAddOpen,
    ] = useState(false);

    const [
        editingPlantPhotoIndex,
        setEditingPlantPhotoIndex,
    ] =
        useState<number | null>(
            null,
        );

    const [
        photoDraft,
        setPhotoDraft,
    ] =
        useState<string[]>(
            plant.photoUrls ?? [],
        );

    const [
        photoDateDraft,
        setPhotoDateDraft,
    ] =
        useState<(string | undefined)[]>(
            (
                plant.photoUrls ??
                []
            ).map(
                (
                    _photoUrl,
                    index,
                ) =>
                    plant.photoMetadata?.[
                        index
                    ]?.photoDate ??
                    plant.photoDates?.[
                        index
                    ],
            ),
        );

    const [
        photoMetadataDraft,
        setPhotoMetadataDraft,
    ] =
        useState<
            (
                SprigPhotoMetadata |
                undefined
            )[]
        >(
            (
                plant.photoUrls ??
                []
            ).map(
                (
                    photoUrl,
                    index,
                ) => {
                    const metadata =
                        getPhotoMetadata(
                            photoUrl,
                            index,
                            plant.photoMetadata,
                        );

                    return {
                        ...metadata,
                        photoUrl,
                        photoDate:
                            metadata?.photoDate ??
                            plant.photoDates?.[
                                index
                            ],
                    };
                },
            ),
        );

    /* =======================================
       OPEN PLANT STORY AT TOP
    ======================================= */

    useLayoutEffect(
        () => {
            document.body.style.overflow =
                '';

            document.body.style.position =
                '';

            document.body.style.top =
                '';

            document.body.style.width =
                '';

            document.documentElement.style.overflow =
                '';

            function goToTop() {
                const scrollingElement =
                    document.scrollingElement;

                if (scrollingElement) {
                    scrollingElement.scrollTop = 0;
                    scrollingElement.scrollLeft = 0;
                }

                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;

                window.scrollTo(
                    0,
                    0,
                );
            }

            goToTop();

            const firstFrame =
                requestAnimationFrame(
                    () => {
                        requestAnimationFrame(
                            () => {
                                goToTop();
                            },
                        );
                    },
                );

            return () => {
                cancelAnimationFrame(
                    firstFrame,
                );
            };
        },
        [
            plant.id,
        ],
    );

    /* =======================================
       CURRENT GROWING PLACE
    ======================================= */

    const currentGrowingPlace =
        plant.currentGrowingPlaceId
            ? growingPlaces.find(
                place =>
                    place.id ===
                    plant.currentGrowingPlaceId,
            )
            : undefined;

    /* =======================================
       CURRENT GROWING RECIPE
    ======================================= */

    const currentGrowingSetup =
        plant.currentGrowingSetupId
            ? growingSetups.find(
                setup =>
                    setup.id ===
                    plant.currentGrowingSetupId,
            )
            : undefined;

    /* =======================================
       CURRENT RECIPE INGREDIENTS
    ======================================= */

    const currentRecipeIngredients =
        currentGrowingSetup
            ?.ingredientIds
            ?.map(
                ingredientId =>
                    ingredients.find(
                        ingredient =>
                            ingredient.id ===
                            ingredientId,
                    ),
            )
            .filter(
                (
                    ingredient,
                ): ingredient is Ingredient =>
                    Boolean(
                        ingredient,
                    ),
            ) ??
        [];

    /* =======================================
       GROWING JOURNEY
    ======================================= */

    const growingJourney =
        (
            plant.growingHistory ??
            []
        )
            .map(
                historyEntry => {
                    const growingPlace =
                        historyEntry.growingPlaceId
                            ? growingPlaces.find(
                                place =>
                                    place.id ===
                                    historyEntry.growingPlaceId,
                            )
                            : undefined;

                    const growingSetup =
                        historyEntry.growingSetupId
                            ? growingSetups.find(
                                setup =>
                                    setup.id ===
                                    historyEntry.growingSetupId,
                            )
                            : undefined;

                    return {
                        ...historyEntry,
                        growingPlace,
                        growingSetup,
                    };
                },
            )
            .sort(
                (
                    first,
                    second,
                ) =>
                    new Date(
                        first.startedDate,
                    ).getTime() -
                    new Date(
                        second.startedDate,
                    ).getTime(),
            );

    /* =======================================
       GROWING TIME
    ======================================= */

    const storyBeginningDate =
        new Date(
            `${plant.plantedDate}T00:00:00`,
        );

    const today =
        new Date();

    const daysGrowing =
        Math.max(
            0,
            Math.floor(
                (
                    today.getTime() -
                    storyBeginningDate.getTime()
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                ),
            ),
        );

    function getPlantAgeText(
        date?: string,
    ): string | undefined {
        if (
            !date ||
            !plant.plantedDate
        ) {
            return undefined;
        }

        return formatPlantAgeAtDate(
            plant.plantedDate,
            date,
            durationDisplayUnit,
        );
    }

    function getTimeSinceStoryBeganText(): string {
        return `${formatDuration(
            daysGrowing,
            durationDisplayUnit,
        )} ago`;
    }

    /* =======================================
       HARVEST STORY
    ======================================= */

    const plantHarvests = [
        ...harvests,
    ]
        .filter(
            harvest =>
                harvest.plantStoryIds.includes(
                    plant.id,
                ),
        )
        .sort(
            (
                first,
                second,
            ) =>
                new Date(
                    first.date,
                ).getTime() -
                new Date(
                    second.date,
                ).getTime(),
        );

    const firstPlantHarvest =
        plantHarvests[0];

    const latestPlantHarvest =
        plantHarvests[
            plantHarvests.length -
            1
        ];

    const totalHarvestCount =
        plantHarvests.reduce(
            (
                total,
                harvest,
            ) =>
                total +
                (
                    harvest.count ??
                    0
                ),
            0,
        );

    const harvestMeasurements =
        plantHarvests.filter(
            harvest =>
                typeof harvest.measurementAmount ===
                    'number' &&
                Boolean(
                    harvest.measurementUnit,
                ),
        );

    const harvestUnits =
        Array.from(
            new Set(
                harvestMeasurements.map(
                    harvest =>
                        harvest.measurementUnit,
                ),
            ),
        );

    const canCombineHarvestAmounts =
        harvestMeasurements.length >
            0 &&
        harvestUnits.length ===
            1;

    const totalHarvestAmount =
        canCombineHarvestAmounts
            ? harvestMeasurements.reduce(
                (
                    total,
                    harvest,
                ) =>
                    total +
                    (
                        harvest.measurementAmount ??
                        0
                    ),
                0,
            )
            : undefined;

    const totalHarvestUnit =
        canCombineHarvestAmounts
            ? harvestUnits[0]
            : undefined;

    /* =======================================
       HARVEST TIMING REFERENCE
    ======================================= */

    const harvestTimingReference =
        plant.harvestTimingReference;

    const harvestTimingEvent =
        harvestTimingReference?.sourceType ===
            'garden-event' &&
        harvestTimingReference.eventId
            ? events.find(
                event =>
                    event.id ===
                    harvestTimingReference.eventId,
            )
            : undefined;

    let harvestTimingReferenceDate =
        plant.plantedDate;

    let harvestTimingReferenceLabel =
        'Planted';

    if (
        harvestTimingReference?.sourceType ===
            'sown' &&
        plant.sownDate
    ) {
        harvestTimingReferenceDate =
            plant.sownDate;

        harvestTimingReferenceLabel =
            'Sown';
    }
    else if (
        harvestTimingReference?.sourceType ===
            'planted'
    ) {
        harvestTimingReferenceDate =
            plant.plantedDate;

        harvestTimingReferenceLabel =
            'Planted';
    }
    else if (
        harvestTimingReference?.sourceType ===
            'planted-out' &&
        plant.plantedOutDate
    ) {
        harvestTimingReferenceDate =
            plant.plantedOutDate;

        harvestTimingReferenceLabel =
            'Planted out';
    }
    else if (
        harvestTimingReference?.sourceType ===
            'garden-event' &&
        harvestTimingEvent
    ) {
        harvestTimingReferenceDate =
            harvestTimingEvent.date;

        harvestTimingReferenceLabel =
            harvestTimingEvent.title;
    }
    else if (
        harvestTimingReference?.sourceType ===
            'custom-date' &&
        harvestTimingReference.customDate
    ) {
        harvestTimingReferenceDate =
            harvestTimingReference.customDate;

        harvestTimingReferenceLabel =
            harvestTimingReference.customLabel ??
            'Another date';
    }

    const harvestTimingReferenceDateObject =
        new Date(
            `${harvestTimingReferenceDate}T00:00:00`,
        );

    /* =======================================
       EXPECTED + ACTUAL HARVEST TIMING
    ======================================= */

    const expectedHarvestStart =
        plant.expectedHarvestDaysMin
            ? addDaysToDate(
                harvestTimingReferenceDate,
                plant.expectedHarvestDaysMin,
            )
            : undefined;

    const expectedHarvestEnd =
        plant.expectedHarvestDaysMax
            ? addDaysToDate(
                harvestTimingReferenceDate,
                plant.expectedHarvestDaysMax,
            )
            : undefined;

    const firstHarvestDate =
        firstPlantHarvest
            ? new Date(
                `${firstPlantHarvest.date}T00:00:00`,
            )
            : undefined;

    const actualDaysToFirstHarvest =
        firstHarvestDate
            ? Math.max(
                0,
                Math.round(
                    (
                        firstHarvestDate.getTime() -
                        harvestTimingReferenceDateObject.getTime()
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    ),
                ),
            )
            : undefined;

    let harvestTimingDifference:
        number |
        undefined;

    let harvestTimingStatus:
        | 'early'
        | 'expected'
        | 'late'
        | undefined;

    if (
        firstHarvestDate &&
        expectedHarvestStart &&
        firstHarvestDate.getTime() <
            expectedHarvestStart.getTime()
    ) {
        harvestTimingStatus =
            'early';

        harvestTimingDifference =
            Math.round(
                (
                    expectedHarvestStart.getTime() -
                    firstHarvestDate.getTime()
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                ),
            );
    }
    else if (
        firstHarvestDate &&
        expectedHarvestEnd &&
        firstHarvestDate.getTime() >
            expectedHarvestEnd.getTime()
    ) {
        harvestTimingStatus =
            'late';

        harvestTimingDifference =
            Math.round(
                (
                    firstHarvestDate.getTime() -
                    expectedHarvestEnd.getTime()
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                ),
            );
    }
    else if (
        firstHarvestDate &&
        (
            expectedHarvestStart ||
            expectedHarvestEnd
        )
    ) {
        harvestTimingStatus =
            'expected';

        harvestTimingDifference =
            0;
    }

    /* =======================================
       PLANT EVENTS
    ======================================= */

    const plantEvents = [
        ...events,
    ]
        .filter(
            event =>
                event.plantStoryIds.length ===
                    0 ||
                event.plantStoryIds.includes(
                    plant.id,
                ),
        )
        .sort(
            (
                first,
                second,
            ) =>
                new Date(
                    second.date,
                ).getTime() -
                new Date(
                    first.date,
                ).getTime(),
        );

    /* =======================================
       DIRECTLY LINKED EVENTS
    ======================================= */

    const directlyLinkedPlantEvents =
        plantEvents.filter(
            event =>
                event.plantStoryIds.includes(
                    plant.id,
                ),
        );

    /* =======================================
       COMPLETE PLANT TIMELINE
    ======================================= */

    const storyTimeline = [
        ...plantEvents.map(
            event => ({
                kind: 'event' as const,
                date: event.date,
                event,
            }),
        ),

        ...plantHarvests.map(
            harvest => ({
                kind: 'harvest' as const,
                date: harvest.date,
                harvest,
            }),
        ),
    ].sort(
        (
            first,
            second,
        ) =>
            new Date(
                second.date,
            ).getTime() -
            new Date(
                first.date,
            ).getTime(),
    );

    /* =======================================
       PHOTOGRAPHIC STORY
    ======================================= */

    const plantPhotographicStory:
        PlantPhotographicStoryItem[] = [
            ...(
                plant.photoUrls ??
                []
            ).map(
                (
                    photoUrl,
                    index,
                ) => {
                    const metadata =
                        getPhotoMetadata(
                            photoUrl,
                            index,
                            plant.photoMetadata,
                        );

                    const photoDate =
                        metadata?.photoDate ??
                        plant.photoDates?.[
                            index
                        ];

                    return {
                        key:
                            metadata?.photoId ??
                            `plant-${plant.id}-${index}`,

                        photoUrl,
                        photoDate,

                        photoTime:
                            metadata?.photoTime,

                        title:
                            metadata?.title,

                        notes:
                            metadata?.notes,

                        tags:
                            metadata?.tags,

                        purpose:
                            metadata?.purpose,

                        sourceType:
                            'plant-story' as const,

                        sourceId:
                            plant.id,

                        sourcePhotoIndex:
                            index,

                        sourceLabel:
                            'Plant Story',

                        sourceDetail:
                            'Added directly to this Plant Story',

                        fallbackDate:
                            plant.plantedDate,
                    };
                },
            ),

            ...directlyLinkedPlantEvents.flatMap(
                event =>
                    (
                        event.photoUrls ??
                        []
                    ).map(
                        (
                            photoUrl,
                            index,
                        ) => {
                            const metadata =
                                getPhotoMetadata(
                                    photoUrl,
                                    index,
                                    event.photoMetadata,
                                );

                            return {
                                key:
                                    metadata?.photoId ??
                                    `event-${event.id}-${index}`,

                                photoUrl,

                                photoDate:
                                    metadata?.photoDate ??
                                    event.date,

                                photoTime:
                                    metadata?.photoTime,

                                title:
                                    metadata?.title ??
                                    event.title,

                                notes:
                                    metadata?.notes,

                                tags:
                                    metadata?.tags,

                                purpose:
                                    metadata?.purpose,

                                sourceType:
                                    'garden-event' as const,

                                sourceId:
                                    event.id,

                                sourcePhotoIndex:
                                    index,

                                sourceLabel:
                                    'Journal moment',

                                sourceDetail:
                                    event.title,

                                fallbackDate:
                                    event.date,
                            };
                        },
                    ),
            ),

            ...plantHarvests.flatMap(
                harvest =>
                    (
                        harvest.photoUrls ??
                        []
                    ).map(
                        (
                            photoUrl,
                            index,
                        ) => {
                            const metadata =
                                getPhotoMetadata(
                                    photoUrl,
                                    index,
                                    harvest.photoMetadata,
                                );

                            return {
                                key:
                                    metadata?.photoId ??
                                    `harvest-${harvest.id}-${index}`,

                                photoUrl,

                                photoDate:
                                    metadata?.photoDate ??
                                    harvest.date,

                                photoTime:
                                    metadata?.photoTime,

                                title:
                                    metadata?.title ??
                                    getHarvestTimelineTitle(
                                        harvest,
                                    ),

                                notes:
                                    metadata?.notes,

                                tags:
                                    metadata?.tags,

                                purpose:
                                    metadata?.purpose ??
                                    'harvest',

                                sourceType:
                                    'harvest' as const,

                                sourceId:
                                    harvest.id,

                                sourcePhotoIndex:
                                    index,

                                sourceLabel:
                                    'Harvest',

                                sourceDetail:
                                    getHarvestTimelineTitle(
                                        harvest,
                                    ),

                                fallbackDate:
                                    harvest.date,
                            };
                        },
                    ),
            ),
        ]
            .sort(
                (
                    first,
                    second,
                ) => {
                    const firstDate =
                        first.photoDate ??
                        first.fallbackDate;

                    const secondDate =
                        second.photoDate ??
                        second.fallbackDate;

                    if (
                        !firstDate &&
                        !secondDate
                    ) {
                        return 0;
                    }

                    if (!firstDate) {
                        return 1;
                    }

                    if (!secondDate) {
                        return -1;
                    }

                    return new Date(
                        `${secondDate}T00:00:00`,
                    ).getTime() -
                        new Date(
                            `${firstDate}T00:00:00`,
                        ).getTime();
                },
            );

    /* =======================================
       HARVEST TIMING REFERENCE SAVE
    ======================================= */

    function saveHarvestTimingReference(
        sourceType:
            | 'sown'
            | 'planted'
            | 'planted-out'
            | 'garden-event'
            | 'custom-date',
        eventId?: string,
    ) {
        onUpdatePlant({
            ...plant,

            harvestTimingReference: {
                sourceType,

                eventId:
                    sourceType ===
                        'garden-event'
                        ? eventId
                        : undefined,

                customDate:
                    sourceType ===
                        'custom-date'
                        ? customHarvestTimingDate
                        : undefined,

                customLabel:
                    sourceType ===
                        'custom-date'
                        ? (
                            customHarvestTimingLabel.trim() ||
                            undefined
                        )
                        : undefined,
            },

            updatedAt:
                new Date()
                    .toISOString(),
        });

        setIsHarvestTimingQuickPeekOpen(
            false,
        );

        setCustomHarvestTimingDate(
            '',
        );

        setCustomHarvestTimingLabel(
            '',
        );
    }

    const harvestTimingMilestoneEvents =
        plantEvents.filter(
            event =>
                event.plantStoryIds.includes(
                    plant.id,
                ) &&
                (
                    event.type === 'planted' ||
                    event.type === 'moved' ||
                    event.type === 'sprouted'
                ),
        );

    /* =======================================
       FAVOURITE
    ======================================= */

    function toggleFavourite() {
        onUpdatePlant({
            ...plant,

            isFavourite:
                !plant.isFavourite,

            updatedAt:
                new Date()
                    .toISOString(),
        });
    }

    /* =======================================
       ARCHIVE
    ======================================= */

    function archivePlant() {
        const confirmed =
            window.confirm(
                `Archive "${plant.displayName}"?\n\nSprig will keep the Plant Story, photographs and timeline.`,
            );

        if (!confirmed) {
            return;
        }

        onUpdatePlant({
            ...plant,

            isArchived: true,

            archivedAt:
                new Date()
                    .toISOString()
                    .slice(
                        0,
                        10,
                    ),

            updatedAt:
                new Date()
                    .toISOString(),
        });
    }

    /* =======================================
       RESTORE
    ======================================= */

    function restorePlant() {
        onUpdatePlant({
            ...plant,

            isArchived: false,

            archivedAt:
                undefined,

            updatedAt:
                new Date()
                    .toISOString(),
        });
    }

    /* =======================================
       COMPLETE STORY
    ======================================= */

    function completeStory() {
        const confirmed =
            window.confirm(
                `Complete "${plant.displayName}"?\n\nThis keeps the entire Plant Story and marks its growing chapter as finished.`,
            );

        if (!confirmed) {
            return;
        }

        onUpdatePlant({
            ...plant,

            status:
                'finished',

            completedAt:
                new Date()
                    .toISOString()
                    .slice(
                        0,
                        10,
                    ),

            updatedAt:
                new Date()
                    .toISOString(),
        });
    }

    /* =======================================
       REOPEN STORY
    ======================================= */

    function reopenStory() {
        onUpdatePlant({
            ...plant,

            status:
                'growing',

            completedAt:
                undefined,

            updatedAt:
                new Date()
                    .toISOString(),
        });
    }

    /* =======================================
       PRINT
    ======================================= */

    function printPlantStory() {
        window.print();
    }

    /* =======================================
       EXPORT
    ======================================= */

    function exportPlantStory() {
        const exportRecord = {
            exportedAt:
                new Date()
                    .toISOString(),

            plant,

            growingPlace:
                currentGrowingPlace ??
                null,

            growingRecipe:
                currentGrowingSetup ??
                null,

            events:
                plantEvents,

            harvests:
                plantHarvests,
        };

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        exportRecord,
                        null,
                        2,
                    ),
                ],
                {
                    type:
                        'application/json',
                },
            );

        const url =
            URL.createObjectURL(
                blob,
            );

        const link =
            document.createElement(
                'a',
            );

        link.href =
            url;

        link.download =
            `${
                createSafeFileName(
                    plant.displayName,
                ) ||
                'plant-story'
            }-sprig.json`;

        document.body.appendChild(
            link,
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
            url,
        );
    }

    /* =======================================
       DELETE
    ======================================= */

    function deletePlantStory() {
        const confirmed =
            window.confirm(
                `Permanently delete "${plant.displayName}"?\n\nThis removes the Plant Story and its linked plant-specific Journal entries.\n\nThis cannot be undone.`,
            );

        if (confirmed) {
            onDeletePlant(
                plant.id,
            );
        }
    }

    /* =======================================
       PHOTO ADDER
    ======================================= */

    function openPhotoAdder() {
        setEditingPlantPhotoIndex(
            null,
        );

        setPhotoDraft(
            [],
        );

        setPhotoDateDraft(
            [],
        );

        setPhotoMetadataDraft(
            [],
        );

        setIsPhotoQuickAddOpen(
            true,
        );
    }

    /* =======================================
       OPEN SAVED PLANT PHOTOGRAPH
    ======================================= */

    function openPlantPhotoEditor(
        photoIndex: number,
    ) {
        const photoUrl =
            plant.photoUrls?.[
                photoIndex
            ];

        if (!photoUrl) {
            return;
        }

        const metadata =
            getPhotoMetadata(
                photoUrl,
                photoIndex,
                plant.photoMetadata,
            );

        const photoDate =
            metadata?.photoDate ??
            plant.photoDates?.[
                photoIndex
            ];

        setEditingPlantPhotoIndex(
            photoIndex,
        );

        setPhotoDraft([
            photoUrl,
        ]);

        setPhotoDateDraft([
            photoDate,
        ]);

        setPhotoMetadataDraft([
            {
                ...metadata,
                photoUrl,
                photoDate,
            },
        ]);

        setIsPhotoQuickAddOpen(
            true,
        );
    }

    /* =======================================
       CLOSE PHOTO WORKSPACE
    ======================================= */

    function closePhotoWorkspace() {
        setIsPhotoQuickAddOpen(
            false,
        );

        setEditingPlantPhotoIndex(
            null,
        );

        setPhotoDraft(
            [],
        );

        setPhotoDateDraft(
            [],
        );

        setPhotoMetadataDraft(
            [],
        );
    }

    function savePhotos() {
        /* =======================================
           EDIT EXISTING PLANT STORY PHOTO
        ======================================= */

        if (
            editingPlantPhotoIndex !==
            null
        ) {
            const existingPhotoUrls = [
                ...(
                    plant.photoUrls ??
                    []
                ),
            ];

            const existingPhotoMetadata =
                existingPhotoUrls.map(
                    (
                        photoUrl,
                        index,
                    ) => {
                        const existing =
                            getPhotoMetadata(
                                photoUrl,
                                index,
                                plant.photoMetadata,
                            );

                        return {
                            ...existing,
                            photoUrl,

                            photoDate:
                                existing?.photoDate ??
                                plant.photoDates?.[
                                    index
                                ] ??
                                undefined,
                        } satisfies SprigPhotoMetadata;
                    },
                );

            /* =======================================
               REMOVE EXISTING PHOTO
            ======================================= */

            if (
                photoDraft.length ===
                0
            ) {
                const confirmed =
                    window.confirm(
                        'Remove this photograph from the Plant Story?',
                    );

                if (!confirmed) {
                    return;
                }

                const savedPhotoUrls =
                    existingPhotoUrls.filter(
                        (
                            _photoUrl,
                            index,
                        ) =>
                            index !==
                            editingPlantPhotoIndex,
                    );

                const savedPhotoMetadata =
                    existingPhotoMetadata.filter(
                        (
                            _metadata,
                            index,
                        ) =>
                            index !==
                            editingPlantPhotoIndex,
                    );

                onUpdatePlant({
                    ...plant,

                    photoUrls:
                        savedPhotoUrls,

                    photoDates:
                        savedPhotoMetadata.map(
                            metadata =>
                                metadata.photoDate,
                        ),

                    photoMetadata:
                        savedPhotoMetadata,

                    updatedAt:
                        new Date()
                            .toISOString(),
                });

                closePhotoWorkspace();

                return;
            }

            /* =======================================
               SAVE EDITED PHOTO
            ======================================= */

            const editedPhotoUrl =
                photoDraft[0];

            const draftMetadata =
                getPhotoMetadata(
                    editedPhotoUrl,
                    0,
                    photoMetadataDraft,
                );

            const editedMetadata = {
                ...existingPhotoMetadata[
                    editingPlantPhotoIndex
                ],

                ...draftMetadata,

                photoUrl:
                    editedPhotoUrl,

                photoDate:
                    draftMetadata?.photoDate ??
                    photoDateDraft[0] ??
                    undefined,
            } satisfies SprigPhotoMetadata;

            existingPhotoUrls[
                editingPlantPhotoIndex
            ] =
                editedPhotoUrl;

            existingPhotoMetadata[
                editingPlantPhotoIndex
            ] =
                editedMetadata;

            onUpdatePlant({
                ...plant,

                photoUrls:
                    existingPhotoUrls,

                photoDates:
                    existingPhotoMetadata.map(
                        metadata =>
                            metadata.photoDate,
                    ),

                photoMetadata:
                    existingPhotoMetadata,

                updatedAt:
                    new Date()
                        .toISOString(),
            });

            closePhotoWorkspace();

            return;
        }

        /* =======================================
           ADD NEW PLANT STORY PHOTOS
        ======================================= */

        if (
            photoDraft.length ===
            0
        ) {
            return;
        }

        const existingPhotoUrls = [
            ...(
                plant.photoUrls ??
                []
            ),
        ];

        const existingPhotoMetadata =
            existingPhotoUrls.map(
                (
                    photoUrl,
                    index,
                ) => {
                    const existing =
                        getPhotoMetadata(
                            photoUrl,
                            index,
                            plant.photoMetadata,
                        );

                    return {
                        ...existing,
                        photoUrl,

                        photoDate:
                            existing?.photoDate ??
                            plant.photoDates?.[
                                index
                            ] ??
                            undefined,
                    } satisfies SprigPhotoMetadata;
                },
            );

        const newPhotoMetadata =
            photoDraft.map(
                (
                    photoUrl,
                    index,
                ) => {
                    const existing =
                        getPhotoMetadata(
                            photoUrl,
                            index,
                            photoMetadataDraft,
                        );

                    return {
                        ...existing,
                        photoUrl,

                        photoDate:
                            existing?.photoDate ??
                            photoDateDraft[
                                index
                            ] ??
                            undefined,
                    } satisfies SprigPhotoMetadata;
                },
            );

        const savedPhotoMetadata = [
            ...existingPhotoMetadata,
            ...newPhotoMetadata,
        ];

        const savedPhotoUrls = [
            ...existingPhotoUrls,
            ...photoDraft,
        ];

        const savedPhotoDates =
            savedPhotoMetadata.map(
                metadata =>
                    metadata.photoDate,
            );

        onUpdatePlant({
            ...plant,

            photoUrls:
                savedPhotoUrls,

            photoDates:
                savedPhotoDates,

            photoMetadata:
                savedPhotoMetadata,

            updatedAt:
                new Date()
                    .toISOString(),
        });

        closePhotoWorkspace();
    }

    /* =======================================
       DELETE PLANT STORY PHOTOGRAPH
    ======================================= */

    function deletePlantPhoto(
        photoIndex: number,
    ) {
        const confirmed =
            window.confirm(
                'Remove this photograph from the Plant Story?\n\nThis cannot be undone.',
            );

        if (!confirmed) {
            return;
        }

        const existingPhotoUrls = [
            ...(
                plant.photoUrls ??
                []
            ),
        ];

        const existingPhotoMetadata =
            existingPhotoUrls.map(
                (
                    photoUrl,
                    index,
                ) => {
                    const metadata =
                        getPhotoMetadata(
                            photoUrl,
                            index,
                            plant.photoMetadata,
                        );

                    return {
                        ...metadata,
                        photoUrl,

                        photoDate:
                            metadata?.photoDate ??
                            plant.photoDates?.[
                                index
                            ] ??
                            undefined,
                    } satisfies SprigPhotoMetadata;
                },
            );

        const savedPhotoUrls =
            existingPhotoUrls.filter(
                (
                    _photoUrl,
                    index,
                ) =>
                    index !==
                    photoIndex,
            );

        const savedPhotoMetadata =
            existingPhotoMetadata.filter(
                (
                    _metadata,
                    index,
                ) =>
                    index !==
                    photoIndex,
            );

        onUpdatePlant({
            ...plant,

            photoUrls:
                savedPhotoUrls,

            photoDates:
                savedPhotoMetadata.map(
                    metadata =>
                        metadata.photoDate,
                ),

            photoMetadata:
                savedPhotoMetadata,

            updatedAt:
                new Date()
                    .toISOString(),
        });

        closePhotoWorkspace();
    }

    /* =======================================
       PHOTOGRAPHIC STORY ALBUM
    ======================================= */

    const plantPhotographicStoryPhotoUrls =
        plantPhotographicStory.map(
            item =>
                item.photoUrl,
        );

    const plantPhotographicStoryContexts =
        plantPhotographicStory.map(
            item => {
                const displayDate =
                    item.photoDate ??
                    item.fallbackDate;

                const purposeLabel =
                    getPhotoPurposeLabel(
                        item.purpose,
                    );

                const heading =
                    item.title ??
                    purposeLabel ??
                    'Along the way';

                const detailParts:
                    string[] = [];

                if (displayDate) {
                    detailParts.push(
                        formatShortDate(
                            displayDate,
                        ),
                    );

                    if (item.photoTime) {
                        detailParts.push(
                            item.photoTime,
                        );
                    }
                }

                if (item.notes) {
                    detailParts.push(
                        item.notes,
                    );
                }

                if (
                    item.tags &&
                    item.tags.length > 0
                ) {
                    detailParts.push(
                        item.tags
                            .map(
                                tag =>
                                    `#${tag.replace(
                                        /^#+/,
                                        '',
                                    )}`,
                            )
                            .join(' '),
                    );
                }

                let photoAgeDays:
                    number |
                    undefined;

                if (
                    displayDate &&
                    plant.plantedDate
                ) {
                    const photoDateObject =
                        new Date(
                            `${displayDate}T00:00:00`,
                        );

                    const storyBeginningDateObject =
                        new Date(
                            `${plant.plantedDate}T00:00:00`,
                        );

                    const difference =
                        Math.round(
                            (
                                photoDateObject.getTime() -
                                storyBeginningDateObject.getTime()
                            ) /
                            (
                                1000 *
                                60 *
                                60 *
                                24
                            ),
                        );

                    if (
                        difference >= 0
                    ) {
                        photoAgeDays =
                            difference;
                    }
                }

                let actionLabel:
                    string |
                    undefined;

                let onAction:
                    (() => void) |
                    undefined;

                let secondaryActionLabel:
                    string |
                    undefined;

                let onSecondaryAction:
                    (() => void) |
                    undefined;

                if (
                    item.sourceType ===
                    'plant-story'
                ) {
                    actionLabel =
                        'Edit photograph';

                    onAction =
                        () =>
                            openPlantPhotoEditor(
                                item.sourcePhotoIndex,
                            );

                    secondaryActionLabel =
                        'Remove photograph';

                    onSecondaryAction =
                        () =>
                            deletePlantPhoto(
                                item.sourcePhotoIndex,
                            );
                }
                else if (
                    item.sourceType ===
                    'garden-event'
                ) {
                    actionLabel =
                        'Open Journal moment';

                    onAction =
                        () =>
                            onOpenJournalEntry(
                                item.sourceId,
                            );
                }
                else if (
                    item.sourceType ===
                    'harvest'
                ) {
                    actionLabel =
                        'Open Harvest';

                    onAction =
                        () =>
                            onOpenHarvest(
                                item.sourceId,
                            );
                }

                return {
                    heading,

                    detail:
                        detailParts.length > 0
                            ? detailParts.join(
                                ' · ',
                            )
                            : undefined,

                    age:
                        photoAgeDays !==
                        undefined
                            ? {
                                days:
                                    photoAgeDays,
                            }
                            : undefined,

                    actionLabel,
                    onAction,
                    secondaryActionLabel,
                    onSecondaryAction,
                };
            },
        );

    /* =======================================
       NAVIGATION
    ======================================= */

    const hasJourneyBack =
        Boolean(
            journeyBackLabel,
        );

    const journeyAlreadyReturnsToPlants =
        journeyBackLabel ===
        'Plants';

    return (
        <>
            <GardenLayout
                activePage="plants"
                onNavigate={
                    onNavigate
                }
            >
                <div className="plant-story-page">

                    {/* =======================================
                        HEADER
                    ======================================= */}

                    <header className="plant-story-header">
                        <p className="section-label">
                            {plant.plantName} story
                        </p>

                        <h1>
                            {plant.displayName}
                        </h1>

                        {plant.variety ? (
                            <p className="story-personality">
                                {plant.plantName}
                                {' · '}
                                {plant.variety}
                            </p>
                        ) : (
                            <p className="story-personality">
                                {plant.personality ??
                                    'A story still unfolding'}
                            </p>
                        )}

                        <div className="story-status-row">
                            <span className="status-pill">
                                {formatLabel(
                                    plant.status,
                                )}
                            </span>
                        </div>

                        {plant.isFavourite && (
                            <p className="section-label">
                                ★ Garden Favourite
                            </p>
                        )}

                        {plant.isArchived && (
                            <p className="section-label">
                                📦 Resting in Sprig&apos;s archive
                            </p>
                        )}
                    </header>

                    {/* =======================================
                        RECORD + PLANT ACTIONS
                    ======================================= */}

                    <section
                        className="plant-record-actions"
                        aria-label="Plant Story actions"
                    >
                        {hasJourneyBack && (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    onBack
                                }
                            >
                                ← Back to{' '}
                                {journeyBackLabel}
                            </button>
                        )}

                        {!journeyAlreadyReturnsToPlants && (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    onOpenPlants
                                }
                            >
                                ← Plants
                            </button>
                        )}

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                setIsEditOpen(
                                    true,
                                )
                            }
                        >
                            ✏ Edit
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                setIsVariationOpen(
                                    true,
                                )
                            }
                        >
                            🌱 Create a variation
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                toggleFavourite
                            }
                        >
                            {plant.isFavourite
                                ? '★ Favourite'
                                : '☆ Favourite'}
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                openPhotoAdder
                            }
                        >
                            📸 Add photographs
                        </button>

                        {plant.isArchived ? (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    restorePlant
                                }
                            >
                                🌱 Restore
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    archivePlant
                                }
                            >
                                📦 Archive
                            </button>
                        )}

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                printPlantStory
                            }
                        >
                            🖨 Print
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                exportPlantStory
                            }
                        >
                            📤 Export
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                deletePlantStory
                            }
                        >
                            🗑 Delete
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                onAddHarvest([
                                    plant.id,
                                ])
                            }
                        >
                            🧺 Add a harvest
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                onAddEvent
                            }
                        >
                            📖 Add a moment
                        </button>

                        {plant.status === 'finished' ? (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    reopenStory
                                }
                            >
                                🌱 Reopen this story
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    completeStory
                                }
                            >
                                🍂 Complete story
                            </button>
                        )}
                    </section>

                    {/* =======================================
                        HOW THIS STORY BEGAN
                    ======================================= */}

                    <section className="story-section">
                        <div className="section-heading">
                            <div>
                                <p className="section-label">
                                    The beginning
                                </p>

                                <h2>
                                    How this story began
                                </h2>
                            </div>
                        </div>

                        <section className="story-information-grid">

                            <article className="story-info-card">
                                <p className="section-label">
                                    Story began
                                </p>

                                <h2>
                                    {formatDate(
                                        plant.plantedDate,
                                    )}
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            '0.2rem 0 0',
                                    }}
                                >
                                    <strong>
                                        {getTimeSinceStoryBeganText()}
                                    </strong>
                                </p>

                                <DurationUnitToggle
                                    value={
                                        durationDisplayUnit
                                    }
                                    onChange={
                                        setDurationDisplayUnit
                                    }
                                />

                                <p
                                    style={{
                                        marginTop:
                                            '0.55rem',
                                    }}
                                >
                                    Started as{' '}
                                    {getStartMethodLabel(
                                        plant,
                                    )}
                                </p>
                            </article>

                            <article className="story-info-card">
                                <p className="section-label">
                                    Started with
                                </p>

                                <h2>
                                    {plant.quantity ??
                                        1}
                                </h2>

                                <p>
                                    {plant.quantity === 1
                                        ? 'One plant or starting piece'
                                        : 'Plants or starting pieces growing as one story'}
                                </p>
                            </article>

                            <article className="story-info-card">
                                <p className="section-label">
                                    Where it came from
                                </p>

                                <h2>
                                    {plant.originType ===
                                        'other' &&
                                    plant.customOriginLabel
                                        ? plant.customOriginLabel
                                        : getPlantOriginLabel(
                                            plant.originType,
                                        )}
                                </h2>

                                <p>
                                    {plant.source
                                        ? plant.source
                                        : 'No source or place recorded.'}
                                </p>
                            </article>

                        </section>
                    </section>

                    {/* =======================================
                        EARLY JOURNEY
                    ======================================= */}

                    {(plant.sownDate ||
                        plant.plantedOutDate) && (
                        <section className="story-section">
                            <div className="section-heading">
                                <div>
                                    <p className="section-label">
                                        Early journey
                                    </p>

                                    <h2>
                                        From beginning to garden
                                    </h2>

                                    <DurationUnitToggle
                                        value={
                                            durationDisplayUnit
                                        }
                                        onChange={
                                            setDurationDisplayUnit
                                        }
                                    />
                                </div>
                            </div>

                            <section className="story-information-grid">

                                {plant.sownDate && (
                                    <article className="story-info-card">
                                        <p className="section-label">
                                            Sown
                                        </p>

                                        <h2>
                                            {formatDate(
                                                plant.sownDate,
                                            )}
                                        </h2>

                                        <p>
                                            {getPlantAgeText(
                                                plant.sownDate,
                                            )}
                                        </p>

                                        <p className="form-whisper">
                                            The first recorded step
                                            in this seed-grown story.
                                        </p>
                                    </article>
                                )}

                                {plant.plantedOutDate && (
                                    <article className="story-info-card">
                                        <p className="section-label">
                                            Planted out
                                        </p>

                                        <h2>
                                            {formatDate(
                                                plant.plantedOutDate,
                                            )}
                                        </h2>

                                        <p>
                                            {getPlantAgeText(
                                                plant.plantedOutDate,
                                            )}
                                        </p>

                                        <p className="form-whisper">
                                            Moved into its planted-out
                                            growing stage.
                                        </p>
                                    </article>
                                )}

                            </section>
                        </section>
                    )}

                    {/* =======================================
                        WHERE IT IS GROWING
                    ======================================= */}

                    <section className="story-section">
                        <div className="section-heading">
                            <div>
                                <p className="section-label">
                                    Growing now
                                </p>

                                <h2>
                                    Where this story is unfolding
                                </h2>
                            </div>
                        </div>

                        <section className="story-information-grid">

                            {currentGrowingPlace ? (
                                <button
                                    type="button"
                                    className="story-info-card"
                                    onClick={() =>
                                        onOpenGrowingPlace(
                                            currentGrowingPlace.id,
                                        )
                                    }
                                    aria-label={`Open ${currentGrowingPlace.name}`}
                                    style={{
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        font: 'inherit',
                                    }}
                                >
                                    <p className="section-label">
                                        Growing Place
                                    </p>

                                    <h2>
                                        {currentGrowingPlace.name}
                                    </h2>

                                    <p>
                                        {currentGrowingPlace.kind ===
                                            'other' &&
                                        currentGrowingPlace.customKindLabel
                                            ? currentGrowingPlace.customKindLabel
                                            : formatLabel(
                                                currentGrowingPlace.kind,
                                            )}
                                    </p>

                                    <p className="form-whisper">
                                        Open this Growing Place →
                                    </p>
                                </button>
                            ) : (
                                <article className="story-info-card">
                                    <p className="section-label">
                                        Growing Place
                                    </p>

                                    <h2>
                                        Place not recorded
                                    </h2>

                                    <p>
                                        This can be added later.
                                    </p>
                                </article>
                            )}

                            {currentGrowingSetup ? (
                                <button
                                    type="button"
                                    className="story-info-card"
                                    onClick={() =>
                                        setIsRecipeQuickPeekOpen(
                                            true,
                                        )
                                    }
                                    aria-label={`Quick peek at ${currentGrowingSetup.name}`}
                                    style={{
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        font: 'inherit',
                                    }}
                                >
                                    <p className="section-label">
                                        Growing Recipe
                                    </p>

                                    <h2>
                                        {currentGrowingSetup.name}
                                    </h2>

                                    <p>
                                        {getGrowingSetupCategoryLabel(
                                            currentGrowingSetup,
                                        )}
                                    </p>

                                    <p className="form-whisper">
                                        Tap for a quick peek
                                    </p>
                                </button>
                            ) : (
                                <article className="story-info-card">
                                    <p className="section-label">
                                        Growing Recipe
                                    </p>

                                    <h2>
                                        Recipe not recorded
                                    </h2>

                                    <p>
                                        This can be added later.
                                    </p>
                                </article>
                            )}

                        </section>
                    </section>

                    {/* =======================================
                        GROWING JOURNEY
                    ======================================= */}

                    {growingJourney.length > 0 && (
                        <section className="story-section">
                            <p className="section-label">
                                Growing journey
                            </p>

                            <h2>
                                Where this story has put down roots
                            </h2>

                            <p className="form-whisper">
                                A little history of where this
                                plant has grown and what it was
                                growing in along the way.
                            </p>

                            <DurationUnitToggle
                                value={
                                    durationDisplayUnit
                                }
                                onChange={
                                    setDurationDisplayUnit
                                }
                            />

                            <div className="timeline">
                                {growingJourney.map(
                                    historyEntry => (
                                        <article
                                            key={
                                                historyEntry.id
                                            }
                                            className="timeline-entry"
                                        >
                                            <div className="timeline-marker">
                                                🌱
                                            </div>

                                            <div className="timeline-entry-header">
                                                <div>
                                                    <div className="timeline-entry-meta">
                                                        <time>
                                                            {formatDate(
                                                                historyEntry.startedDate,
                                                            )}
                                                            {' · '}
                                                            {getPlantAgeText(
                                                                historyEntry.startedDate,
                                                            )}

                                                            {' → '}

                                                            {historyEntry.endedDate
                                                                ? (
                                                                    <>
                                                                        {formatDate(
                                                                            historyEntry.endedDate,
                                                                        )}
                                                                        {' · '}
                                                                        {getPlantAgeText(
                                                                            historyEntry.endedDate,
                                                                        )}
                                                                    </>
                                                                )
                                                                : (
                                                                    <>
                                                                        Now
                                                                        {' · '}
                                                                        {getTimeSinceStoryBeganText()}
                                                                    </>
                                                                )}
                                                        </time>
                                                    </div>

                                                    <h3>
                                                        {historyEntry.growingPlace
                                                            ?.name ??
                                                            historyEntry.growingSetup
                                                                ?.name ??
                                                            'Growing arrangement'}
                                                    </h3>
                                                </div>
                                            </div>

                                            {historyEntry.growingPlace && (
                                                <p>
                                                    <strong>
                                                        Growing Place:
                                                    </strong>{' '}

                                                    <button
                                                        type="button"
                                                        className="garden-place-link"
                                                        onClick={() =>
                                                            onOpenGrowingPlace(
                                                                historyEntry
                                                                    .growingPlace!
                                                                    .id,
                                                            )
                                                        }
                                                    >
                                                        {historyEntry
                                                            .growingPlace
                                                            .name}
                                                    </button>
                                                </p>
                                            )}

                                            {historyEntry.growingSetup && (
                                                <p>
                                                    <strong>
                                                        Growing Recipe:
                                                    </strong>{' '}

                                                    {historyEntry
                                                        .growingSetup
                                                        .name}
                                                </p>
                                            )}

                                            {historyEntry.notes && (
                                                <p>
                                                    {historyEntry.notes}
                                                </p>
                                            )}
                                        </article>
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                    {/* =======================================
                        HARVEST TIMING
                    ======================================= */}

{(plant.expectedHarvestDaysMin ||
                        plant.expectedHarvestDaysMax) && (
                        <section className="story-section">
                            <div className="section-heading">
                                <div>
                                    <p className="section-label">
                                        Harvest timing
                                    </p>

                                    <h2>
                                        When this story may begin giving back
                                    </h2>
                                </div>
                            </div>

                            <article
                                className="story-info-card"
                                style={{
                                    padding:
                                        '0.85rem 1rem',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <div>
                                        <p className="section-label">
                                            Expected harvest
                                        </p>

                                        <p
                                            className="form-whisper"
                                            style={{
                                                margin:
                                                    '0.15rem 0 0',
                                            }}
                                        >
                                            A compact view of the expected window and the plant&apos;s age at each date.
                                        </p>
                                    </div>

                                    <DurationUnitToggle
                                        value={
                                            durationDisplayUnit
                                        }
                                        onChange={
                                            setDurationDisplayUnit
                                        }
                                    />
                                </div>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'minmax(7.5rem, 0.8fr) minmax(0, 1.7fr)',
                                        gap: '0.45rem 0.8rem',
                                        marginTop: '0.75rem',
                                        alignItems: 'start',
                                    }}
                                >
                                    <strong>
                                        Count from
                                    </strong>

                                    <button
                                        type="button"
                                        className="text-button"
                                        onClick={() =>
                                            setIsHarvestTimingQuickPeekOpen(
                                                true,
                                            )
                                        }
                                        style={{
                                            justifySelf: 'start',
                                            textAlign: 'left',
                                            padding: 0,
                                            minHeight: 'unset',
                                        }}
                                    >
                                        {harvestTimingReferenceLabel}
                                        {' · '}
                                        {formatDate(
                                            harvestTimingReferenceDate,
                                        )}
                                        {' · '}
                                        {getPlantAgeText(
                                            harvestTimingReferenceDate,
                                        )}
                                        {' →'}
                                    </button>

                                    <strong>
                                        Expected timing
                                    </strong>

                                    <span>
                                        {plant.expectedHarvestDaysMin &&
                                        plant.expectedHarvestDaysMax
                                            ? `${formatDuration(
                                                plant.expectedHarvestDaysMin,
                                                durationDisplayUnit,
                                            )}–${formatDuration(
                                                plant.expectedHarvestDaysMax,
                                                durationDisplayUnit,
                                            )}`
                                            : plant.expectedHarvestDaysMin
                                                ? `From ${formatDuration(
                                                    plant.expectedHarvestDaysMin,
                                                    durationDisplayUnit,
                                                )}`
                                                : plant.expectedHarvestDaysMax
                                                    ? `Around ${formatDuration(
                                                        plant.expectedHarvestDaysMax,
                                                        durationDisplayUnit,
                                                    )}`
                                                    : 'Not recorded'}
                                    </span>

                                    {expectedHarvestStart && (
                                        <>
                                            <strong>
                                                Earliest expected
                                            </strong>

                                            <span>
                                                {expectedHarvestStart.toLocaleDateString(
                                                    'en-AU',
                                                    {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    },
                                                )}
                                                {' · '}
                                                {getPlantAgeText(
                                                    getLocalDateKey(
                                                        expectedHarvestStart,
                                                    ),
                                                )}
                                            </span>
                                        </>
                                    )}

                                    {expectedHarvestEnd && (
                                        <>
                                            <strong>
                                                Later edge
                                            </strong>

                                            <span>
                                                {expectedHarvestEnd.toLocaleDateString(
                                                    'en-AU',
                                                    {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    },
                                                )}
                                                {' · '}
                                                {getPlantAgeText(
                                                    getLocalDateKey(
                                                        expectedHarvestEnd,
                                                    ),
                                                )}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </article>

                            {firstPlantHarvest &&
                            actualDaysToFirstHarvest !==
                                undefined && (
                                <article
                                    className="story-info-card"
                                    style={{
                                        marginTop:
                                            '0.7rem',
                                        padding:
                                            '0.85rem 1rem',
                                    }}
                                >
                                    <p className="section-label">
                                        What actually happened
                                    </p>

                                    <h3
                                        style={{
                                            margin:
                                                '0.15rem 0 0.65rem',
                                        }}
                                    >
                                        This plant found its own timing
                                    </h3>

                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns:
                                                'minmax(7.5rem, 0.8fr) minmax(0, 1.7fr)',
                                            gap: '0.45rem 0.8rem',
                                            alignItems: 'start',
                                        }}
                                    >
                                        <strong>
                                            First gathered
                                        </strong>

                                        <span>
                                            {formatDate(
                                                firstPlantHarvest.date,
                                            )}
                                            {' · '}
                                            {getPlantAgeText(
                                                firstPlantHarvest.date,
                                            )}
                                        </span>

                                        <strong>
                                            Timing from{' '}
                                            {harvestTimingReferenceLabel.toLowerCase()}
                                        </strong>

                                        <span>
                                            {formatDuration(
                                                actualDaysToFirstHarvest,
                                                durationDisplayUnit,
                                            )}
                                        </span>

                                        <strong>
                                            Compared with expected
                                        </strong>

                                        <span>
                                            {harvestTimingStatus ===
                                                'early' &&
                                            harvestTimingDifference !==
                                                undefined
                                                ? `${formatDuration(
                                                    harvestTimingDifference,
                                                    durationDisplayUnit,
                                                )} early`
                                                : harvestTimingStatus ===
                                                    'late' &&
                                                harvestTimingDifference !==
                                                    undefined
                                                    ? `${formatDuration(
                                                        harvestTimingDifference,
                                                        durationDisplayUnit,
                                                    )} later`
                                                    : harvestTimingStatus ===
                                                        'expected'
                                                        ? 'Within the expected window'
                                                        : 'Not enough information yet'}
                                        </span>
                                    </div>
                                </article>
                            )}
                        </section>
                    )}

                    {/* =======================================
                        FIRST HARVEST
                    ======================================= */}

                    {plantHarvests.length === 0 && (
                        <section className="story-section">
                            <div className="section-heading">
                                <div>
                                    <p className="section-label">
                                        Harvest
                                    </p>

                                    <h2>
                                        Ready to gather from this story?
                                    </h2>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    onAddHarvest([
                                        plant.id,
                                    ])
                                }
                            >
                                🧺 Harvest this plant
                            </button>
                        </section>
                    )}

                    {/* =======================================
                        SPRIG SMART
                    ======================================= */}

                    <PlantSmartComparisons
                        plant={
                            plant
                        }
                        plants={
                            plants
                        }
                        growingPlaces={
                            growingPlaces
                        }
                        onOpenPlant={
                            onOpenPlant
                        }
                        onComparePlants={
                            onComparePlants
                        }
                    />

                    {/* =======================================
                        HARVEST STORY
                    ======================================= */}

                    {plantHarvests.length > 0 &&
                    latestPlantHarvest && (
                        <section className="story-section">
                            <div className="section-heading">
                                <div>
                                    <p className="section-label">
                                        Harvest Story
                                    </p>

                                    <h2>
                                        What this story has given back
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className="text-button"
                                    onClick={() =>
                                        onAddHarvest([
                                            plant.id,
                                        ])
                                    }
                                >
                                    + Gather another harvest
                                </button>
                            </div>

                            <button
                                type="button"
                                className="story-info-card"
                                onClick={() =>
                                    onOpenHarvest(
                                        latestPlantHarvest.id,
                                    )
                                }
                                aria-label={`Open ${plant.displayName} Harvest Story`}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    font: 'inherit',
                                    padding:
                                        '0.85rem 1rem',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <div>
                                        <p className="section-label">
                                            Harvested from this story
                                        </p>

                                        <h2
                                            style={{
                                                marginBottom:
                                                    '0.15rem',
                                            }}
                                        >
                                            {plantHarvests.length}{' '}
                                            {plantHarvests.length === 1
                                                ? 'harvest'
                                                : 'harvests'}
                                        </h2>
                                    </div>

                                    <DurationUnitToggle
                                        value={
                                            durationDisplayUnit
                                        }
                                        onChange={
                                            setDurationDisplayUnit
                                        }
                                    />
                                </div>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'minmax(7.5rem, 0.8fr) minmax(0, 1.7fr)',
                                        gap: '0.4rem 0.8rem',
                                        marginTop: '0.65rem',
                                        alignItems: 'start',
                                    }}
                                >
                                    {totalHarvestCount > 0 && (
                                        <>
                                            <strong>
                                                Total count
                                            </strong>

                                            <span>
                                                {totalHarvestCount}
                                            </span>
                                        </>
                                    )}

                                    {totalHarvestAmount !==
                                        undefined &&
                                    totalHarvestUnit && (
                                        <>
                                            <strong>
                                                Total gathered
                                            </strong>

                                            <span>
                                                {totalHarvestAmount}{' '}
                                                {totalHarvestUnit ===
                                                    'gram'
                                                    ? 'g'
                                                    : totalHarvestUnit ===
                                                        'kilogram'
                                                        ? 'kg'
                                                        : totalHarvestUnit ===
                                                            'millilitre'
                                                            ? 'mL'
                                                            : totalHarvestUnit ===
                                                                'litre'
                                                                ? 'L'
                                                                : totalHarvestUnit}
                                            </span>
                                        </>
                                    )}

                                    {firstPlantHarvest && (
                                        <>
                                            <strong>
                                                First harvest
                                            </strong>

                                            <span>
                                                {formatDate(
                                                    firstPlantHarvest.date,
                                                )}
                                                {' · '}
                                                {getPlantAgeText(
                                                    firstPlantHarvest.date,
                                                )}
                                            </span>
                                        </>
                                    )}

                                    {plantHarvests.length > 1 && (
                                        <>
                                            <strong>
                                                Latest harvest
                                            </strong>

                                            <span>
                                                {formatDate(
                                                    latestPlantHarvest.date,
                                                )}
                                                {' · '}
                                                {getPlantAgeText(
                                                    latestPlantHarvest.date,
                                                )}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <p
                                    className="form-whisper"
                                    style={{
                                        marginTop:
                                            '0.55rem',
                                    }}
                                >
                                    Open Harvest Story →
                                </p>
                            </button>
                        </section>
                    )}

                    {/* =======================================
                        NOTES
                    ======================================= */}

                    <section className="story-section">
                        <div className="section-heading">
                            <div>
                                <p className="section-label">
                                    Garden notes
                                </p>

                                <h2>
                                    What you wanted to remember
                                </h2>
                            </div>
                        </div>

                        <div className="story-note-card">
                            <p>
                                {plant.notes ??
                                    'No notes yet. This story is waiting for its first observation.'}
                            </p>
                        </div>
                    </section>

                    {/* =======================================
                        PHOTOGRAPHIC STORY
                    ======================================= */}

                    <section className="story-section">
                        <div className="section-heading">
                            <div>
                                <p className="section-label">
                                    Photographic Story
                                </p>

                                <h2>
                                    This plant through the seasons
                                </h2>

                                <p
                                    className="form-whisper"
                                    style={{
                                        marginTop:
                                            '0.2rem',
                                        maxWidth:
                                            '42rem',
                                    }}
                                >
                                    Plant Story, Journal and Harvest photographs gathered into one album.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="text-button"
                                onClick={
                                    openPhotoAdder
                                }
                            >
                                + Add a photograph
                            </button>
                        </div>

                        {plantPhotographicStory.length > 0 ? (
                            <SprigPhotoGallery
                                photoUrls={
                                    plantPhotographicStoryPhotoUrls
                                }
                                photoContexts={
                                    plantPhotographicStoryContexts
                                }
                                title={`${plant.displayName} photographic story`}
                                emptyMessage=""
                                photoAltPrefix={`${plant.displayName} photograph`}
                            />
                        ) : (
                            <div className="empty-story">
                                <span>
                                    📷
                                </span>

                                <p>
                                    No photographs have been tucked
                                    into this plant&apos;s story yet.
                                </p>

                                <button
                                    type="button"
                                    className="text-button"
                                    onClick={
                                        openPhotoAdder
                                    }
                                >
                                    Add its first photograph
                                </button>
                            </div>
                        )}
                    </section>

                    {/* =======================================
                        TIMELINE
                    ======================================= */}

                    <section className="story-section">
                        <div className="section-heading">
                            <div>
                                <p className="section-label">
                                    Timeline
                                </p>

                                <h2>
                                    The story so far
                                </h2>

                                <DurationUnitToggle
                                    value={
                                        durationDisplayUnit
                                    }
                                    onChange={
                                        setDurationDisplayUnit
                                    }
                                />
                            </div>

                            <button
                                type="button"
                                className="text-button"
                                onClick={
                                    onAddEvent
                                }
                            >
                                + Add a moment
                            </button>
                        </div>

                        <div className="timeline">
                            {storyTimeline.length > 0 ? (
                                storyTimeline.map(
                                    timelineItem => {
                                        if (
                                            timelineItem.kind ===
                                            'harvest'
                                        ) {
                                            const timelineHarvest =
                                                timelineItem.harvest;

                                            const harvestAmount =
                                                getHarvestTimelineAmount(
                                                    timelineHarvest,
                                                );

                                            return (
                                                <article
                                                    className="timeline-entry"
                                                    key={`harvest-${timelineHarvest.id}`}
                                                    role="button"
                                                    tabIndex={0}
                                                    style={{
                                                        display: 'block',
                                                        padding:
                                                            '0.8rem 0.9rem',
                                                    }}
                                                    onClick={() =>
                                                        onOpenHarvest(
                                                            timelineHarvest.id,
                                                        )
                                                    }
                                                    onKeyDown={keyboardEvent => {
                                                        if (
                                                            keyboardEvent.key ===
                                                                'Enter' ||
                                                            keyboardEvent.key ===
                                                                ' '
                                                        ) {
                                                            keyboardEvent.preventDefault();

                                                            onOpenHarvest(
                                                                timelineHarvest.id,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <div className="timeline-entry-header">
                                                        <div className="timeline-entry-meta">
                                                            <time>
                                                                {formatDate(
                                                                    timelineHarvest.date,
                                                                )}
                                                                {' · '}
                                                                {getPlantAgeText(
                                                                    timelineHarvest.date,
                                                                )}
                                                            </time>

                                                            <span className="entry-scope-label plant-entry-label">
                                                                Harvest
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <h3>
                                                        {getHarvestTimelineTitle(
                                                            timelineHarvest,
                                                        )}
                                                    </h3>

                                                    {harvestAmount && (
                                                        <p className="event-product">
                                                            Gathered:{' '}
                                                            {harvestAmount}
                                                        </p>
                                                    )}

                                                    {timelineHarvest.quality && (
                                                        <p>
                                                            How it was:{' '}
                                                            {formatLabel(
                                                                timelineHarvest.quality,
                                                            )}
                                                        </p>
                                                    )}

                                                    {timelineHarvest.notes && (
                                                        <p>
                                                            {timelineHarvest.notes}
                                                        </p>
                                                    )}

                                                    {timelineHarvest.photoUrls &&
                                                    timelineHarvest.photoUrls.length >
                                                        0 && (
                                                        <div
                                                            onClick={clickEvent =>
                                                                clickEvent.stopPropagation()
                                                            }
                                                            onKeyDown={keyboardEvent =>
                                                                keyboardEvent.stopPropagation()
                                                            }
                                                        >
                                                            <SprigPhotoGallery
                                                                photoUrls={
                                                                    timelineHarvest.photoUrls
                                                                }
                                                                title="Photographs from this harvest"
                                                                emptyMessage=""
                                                                photoAltPrefix={`${getHarvestTimelineTitle(
                                                                    timelineHarvest,
                                                                )} photograph`}
                                                            />
                                                        </div>
                                                    )}

                                                    <p className="form-whisper">
                                                        Open Harvest Story →
                                                    </p>
                                                </article>
                                            );
                                        }

                                        const event =
                                            timelineItem.event;

                                        return (
                                            <article
                                                className="timeline-entry"
                                                key={`event-${event.id}`}
                                                role="button"
                                                tabIndex={0}
                                                style={{
                                                    display: 'block',
                                                    padding:
                                                        '0.8rem 0.9rem',
                                                }}
                                                onClick={() =>
                                                    onOpenJournalEntry(
                                                        event.id,
                                                    )
                                                }
                                                onKeyDown={keyboardEvent => {
                                                    if (
                                                        keyboardEvent.key ===
                                                            'Enter' ||
                                                        keyboardEvent.key ===
                                                            ' '
                                                    ) {
                                                        keyboardEvent.preventDefault();

                                                        onOpenJournalEntry(
                                                            event.id,
                                                        );
                                                    }
                                                }}
                                            >
                                                <div className="timeline-entry-header">
                                                    <div className="timeline-entry-meta">
                                                        <time>
                                                            {formatDate(
                                                                event.date,
                                                            )}
                                                            {' · '}
                                                            {getPlantAgeText(
                                                                event.date,
                                                            )}
                                                        </time>

                                                        <span
                                                            className={
                                                                event.plantStoryIds.length ===
                                                                0
                                                                    ? 'entry-scope-label garden-entry-label'
                                                                    : 'entry-scope-label plant-entry-label'
                                                            }
                                                        >
                                                            {event.plantStoryIds.length ===
                                                            0
                                                                ? 'Garden entry'
                                                                : 'Plant entry'}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="timeline-delete-button"
                                                        aria-label={`Remove ${event.title} from the garden journal`}
                                                        onClick={clickEvent => {
                                                            clickEvent.stopPropagation();

                                                            const confirmed =
                                                                window.confirm(
                                                                    'Remove this entry from the garden journal?',
                                                                );

                                                            if (confirmed) {
                                                                onDeleteEvent(
                                                                    event.id,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <h3>
                                                    {event.title}
                                                </h3>

                                                {event.productUsed && (
                                                    <p className="event-product">
                                                        Used:{' '}
                                                        {event.productUsed}
                                                    </p>
                                                )}

                                                {event.notes && (
                                                    <p>
                                                        {event.notes}
                                                    </p>
                                                )}

                                                {event.photoUrls &&
                                                event.photoUrls.length >
                                                    0 && (
                                                    <div
                                                        onClick={clickEvent =>
                                                            clickEvent.stopPropagation()
                                                        }
                                                        onKeyDown={keyboardEvent =>
                                                            keyboardEvent.stopPropagation()
                                                        }
                                                    >
                                                        <SprigPhotoGallery
                                                            photoUrls={
                                                                event.photoUrls
                                                            }
                                                            title="Photographs from this moment"
                                                            emptyMessage=""
                                                            photoAltPrefix={`${event.title} photograph`}
                                                        />
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    },
                                )
                            ) : (
                                <div className="empty-story">
                                    <p>
                                        This story has only just opened its notebook.
                                    </p>

                                    <button
                                        type="button"
                                        className="text-button"
                                        onClick={
                                            onAddEvent
                                        }
                                    >
                                        Add its first moment
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </GardenLayout>

            {/* =======================================
                EDIT PLANT STORY
            ======================================= */}

            {isEditOpen && (
                <AddPlantForm
                    GrowingPlaces={
                        growingPlaces
                    }
                    GrowingSetups={
                        growingSetups
                    }
                    Ingredients={
                        ingredients
                    }
                    Products={
                        products
                    }
                    plantToEdit={
                        plant
                    }
                    onAddPlant={
                        onAddPlant
                    }
                    onUpdatePlant={
                        onUpdatePlant
                    }
                    onAddGrowingPlace={
                        onAddGrowingPlace
                    }
                    onAddRecipe={
                        onAddRecipe
                    }
                    onAddIngredient={
                        onAddIngredient
                    }
                    onAddProduct={
                        onAddProduct
                    }
                    onClose={() =>
                        setIsEditOpen(
                            false,
                        )
                    }
                />
            )}

            {/* =======================================
                CREATE VARIATION
            ======================================= */}

            {isVariationOpen && (
                <AddPlantForm
                    GrowingPlaces={
                        growingPlaces
                    }
                    GrowingSetups={
                        growingSetups
                    }
                    Ingredients={
                        ingredients
                    }
                    Products={
                        products
                    }
                    variationFrom={
                        plant
                    }
                    onAddPlant={
                        handleVariationCreated
                    }
                    onUpdatePlant={
                        onUpdatePlant
                    }
                    onAddGrowingPlace={
                        onAddGrowingPlace
                    }
                    onAddRecipe={
                        onAddRecipe
                    }
                    onAddIngredient={
                        onAddIngredient
                    }
                    onAddProduct={
                        onAddProduct
                    }
                    onClose={() =>
                        setIsVariationOpen(
                            false,
                        )
                    }
                />
            )}

            {/* =======================================
                PHOTO WORKSPACE
            ======================================= */}

            <SprigQuickPeek
                isOpen={
                    isPhotoQuickAddOpen
                }
                onClose={
                    closePhotoWorkspace
                }
                eyebrow={
                    editingPlantPhotoIndex !==
                    null
                        ? 'Plant Story photograph'
                        : 'Plant Story'
                }
                title={
                    editingPlantPhotoIndex !==
                    null
                        ? 'Edit photograph'
                        : 'Photographs'
                }
                subtitle={
                    plant.displayName
                }
            >
                <SprigPhotoPicker
                    photoUrls={
                        photoDraft
                    }
                    onChange={
                        setPhotoDraft
                    }
                    photoDates={
                        photoDateDraft
                    }
                    onPhotoDatesChange={
                        setPhotoDateDraft
                    }
                    photoMetadata={
                        photoMetadataDraft
                    }
                    onPhotoMetadataChange={
                        setPhotoMetadataDraft
                    }
                    showPhotoContext
                    title={
                        editingPlantPhotoIndex !==
                        null
                            ? 'Photograph details'
                            : 'Plant photographs'
                    }
                    helperText={
                        editingPlantPhotoIndex !==
                        null
                            ? 'Change anything you want to remember about this photograph. Removing it here will remove it only from this Plant Story.'
                            : 'Add photographs directly to this Plant Story. Sprig already knows where they belong. Extra context is optional.'
                    }
                    addButtonText={
                        editingPlantPhotoIndex !==
                        null
                            ? 'Choose replacement photograph'
                            : 'Add photographs'
                    }
                    photoAltPrefix={`${plant.displayName} photograph`}
                    photoDateLabel="When was this photograph taken?"
                    photoDateHelperText="Sprig uses this date to place the photograph at the right growing age and find useful comparisons."
                    defaultNewPhotosToToday={
                        editingPlantPhotoIndex ===
                        null
                    }
                    multiple={
                        editingPlantPhotoIndex ===
                        null
                    }
                    maxPhotos={
                        editingPlantPhotoIndex !==
                        null
                            ? 1
                            : 20
                    }
                />

                <button
                    type="button"
                    className="enter-button"
                    disabled={
                        editingPlantPhotoIndex ===
                            null &&
                        photoDraft.length ===
                            0
                    }
                    onClick={
                        savePhotos
                    }
                >
                    {editingPlantPhotoIndex !==
                    null
                        ? photoDraft.length > 0
                            ? 'Save photograph'
                            : 'Remove photograph'
                        : 'Save photographs'}
                </button>
            </SprigQuickPeek>

            {/* =======================================
                HARVEST TIMING QUICK PEEK
            ======================================= */}

            <SprigQuickPeek
                isOpen={
                    isHarvestTimingQuickPeekOpen
                }
                onClose={() =>
                    setIsHarvestTimingQuickPeekOpen(
                        false,
                    )
                }
                eyebrow="Harvest timing"
                title="When should Sprig start counting?"
                subtitle="Tap a recorded date below to use it straight away, or enter another date of your own."
            >
                <div className="quick-peek-actions">
                    {plant.sownDate && (
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                saveHarvestTimingReference(
                                    'sown',
                                )
                            }
                        >
                            {harvestTimingReference?.sourceType ===
                            'sown'
                                ? '✓ '
                                : '🌱 '}

                            Sown ·{' '}
                            {formatDate(
                                plant.sownDate,
                            )}

                            {harvestTimingReference?.sourceType ===
                                'sown' &&
                                ' · Current'}
                        </button>
                    )}

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            saveHarvestTimingReference(
                                'planted',
                            )
                        }
                    >
                        {(!harvestTimingReference ||
                            harvestTimingReference.sourceType ===
                                'planted')
                            ? '✓ '
                            : '🪴 '}

                        Planted ·{' '}
                        {formatDate(
                            plant.plantedDate,
                        )}

                        {(!harvestTimingReference ||
                            harvestTimingReference.sourceType ===
                                'planted') &&
                            ' · Current'}
                    </button>

                    {plant.plantedOutDate && (
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                saveHarvestTimingReference(
                                    'planted-out',
                                )
                            }
                        >
                            {harvestTimingReference?.sourceType ===
                            'planted-out'
                                ? '✓ '
                                : '🌿 '}

                            Planted out ·{' '}
                            {formatDate(
                                plant.plantedOutDate,
                            )}

                            {harvestTimingReference?.sourceType ===
                                'planted-out' &&
                                ' · Current'}
                        </button>
                    )}

                    {harvestTimingMilestoneEvents.map(
                        event => (
                            <button
                                type="button"
                                className="secondary-button"
                                key={
                                    event.id
                                }
                                onClick={() =>
                                    saveHarvestTimingReference(
                                        'garden-event',
                                        event.id,
                                    )
                                }
                            >
                                {harvestTimingReference?.sourceType ===
                                    'garden-event' &&
                                harvestTimingReference.eventId ===
                                    event.id
                                    ? '✓ '
                                    : '📖 '}

                                {event.title} ·{' '}
                                {formatDate(
                                    event.date,
                                )}

                                {harvestTimingReference?.sourceType ===
                                    'garden-event' &&
                                harvestTimingReference.eventId ===
                                    event.id &&
                                    ' · Current'}
                            </button>
                        ),
                    )}
                </div>

                <div className="form-section">
                    <p className="section-label">
                        Or use another date
                    </p>

                    <p className="form-whisper">
                        If the right moment isn&apos;t recorded above,
                        enter another date for Sprig to count from.
                    </p>

                    <label>
                        Date

                        <input
                            type="date"
                            value={
                                customHarvestTimingDate
                            }
                            onChange={event =>
                                setCustomHarvestTimingDate(
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    <label>
                        What happened? Optional

                        <input
                            type="text"
                            value={
                                customHarvestTimingLabel
                            }
                            placeholder="Approximate transplant date"
                            onChange={event =>
                                setCustomHarvestTimingLabel(
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    <button
                        type="button"
                        className="enter-button"
                        disabled={
                            !customHarvestTimingDate
                        }
                        onClick={() =>
                            saveHarvestTimingReference(
                                'custom-date',
                            )
                        }
                    >
                        Use this custom date
                    </button>
                </div>
            </SprigQuickPeek>

            {/* =======================================
                GROWING RECIPE QUICK PEEK
            ======================================= */}

            {currentGrowingSetup && (
                <SprigQuickPeek
                    isOpen={
                        isRecipeQuickPeekOpen
                    }
                    onClose={() =>
                        setIsRecipeQuickPeekOpen(
                            false,
                        )
                    }
                    eyebrow="Growing Recipe"
                    title={
                        currentGrowingSetup.name
                    }
                    subtitle={
                        getGrowingSetupCategoryLabel(
                            currentGrowingSetup,
                        )
                    }
                >
                    {currentGrowingSetup.category ===
                        'own-mix' && (
                        <>
                            <h3>
                                What&apos;s in this mix
                            </h3>

                            {currentRecipeIngredients.length > 0 ? (
                                <ul>
                                    {currentRecipeIngredients.map(
                                        ingredient => (
                                            <li
                                                key={
                                                    ingredient.id
                                                }
                                            >
                                                {ingredient.name}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            ) : (
                                <p>
                                    No ingredients have been recorded for this recipe yet.
                                </p>
                            )}
                        </>
                    )}

                    {currentGrowingSetup.notes && (
                        <>
                            <h3>
                                Notes
                            </h3>

                            <p>
                                {currentGrowingSetup.notes}
                            </p>
                        </>
                    )}
                </SprigQuickPeek>
            )}

        </>
    );
}