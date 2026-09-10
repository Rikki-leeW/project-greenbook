import { useLayoutEffect, useMemo, useState } from 'react';
import GardenLayout from '../components/layout/GardenLayout';
import AddPlantForm from '../components/forms/AddPlantForm';
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery';
import SprigPhotoPicker from '../components/photos/SprigPhotoPicker';
import SprigQuickPeek from '../components/common/SprigQuickPeek';
import PlantSmartComparisons from '../components/plants/PlantSmartComparisons';

import {
    buildSprigInsights,
    getSprigInsightFamilyLabel,
    getSprigInsightStrengthLabel,
    getSprigInsightsForPlant,
    type SprigInsightAction,
} from '../utils/sprigInsights';

import type {
    GardenData,
    GardenEvent,
    GardenProduct,
    GrowingPlace,
    GrowingSetup,
    Ingredient,
    PlantOriginType,
    PlantStory,
    HarvestRecord,
    SprigPhotoMetadata,
    SprigPhotoPurpose,
} from '../types';

import type { AppPage } from '../types/navigation';

/* =======================================
   TYPES
======================================= */

interface PlantDetailProps {
    plant: PlantStory;
    gardenData: GardenData;
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
    onAddGrowingPlace: (
        place: GrowingPlace,
        setup?: GrowingSetup,
    ) => void;
    onAddRecipe: (recipe: GrowingSetup) => void;
    onAddIngredient: (ingredient: Ingredient) => void;
    onAddProduct: (product: GardenProduct) => void;
    onDeleteEvent: (eventId: string) => void;
    onDeletePlant: (plantId: string) => void;
    onUpdatePlant: (plant: PlantStory) => void;
}

/* =======================================
   TYPES
======================================= */

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
    onAddGrowingPlace: (
        place: GrowingPlace,
        setup?: GrowingSetup,
    ) => void;
    onAddRecipe: (recipe: GrowingSetup) => void;
    onAddIngredient: (ingredient: Ingredient) => void;
    onAddProduct: (product: GardenProduct) => void;
    onDeleteEvent: (eventId: string) => void;
    onDeletePlant: (plantId: string) => void;
    onUpdatePlant: (plant: PlantStory) => void;
}

type PlantDurationDisplayUnit = 'days' | 'weeks' | 'months';

type PlantPhotoSourceType =
    | 'plant-story'
    | 'garden-event'
    | 'harvest';

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
   LOCAL PRESENTATION
======================================= */

const plantDetailStyles = `
    .plant-story-page .plant-detail-compact-card {
        padding: 0.9rem 1rem;
    }

    .plant-story-page .plant-detail-beginning-date {
        margin: 0.2rem 0;
    }

    .plant-story-page .plant-detail-beginning-age {
        margin: 0;
        color: #52634b;
    }

    .plant-story-page .plant-detail-age-control {
        margin-top: 0.7rem;
    }

    .plant-story-page .plant-detail-age-control-label {
        display: block;
        margin-bottom: 0.35rem;
        color: #62705f;
        font-size: 0.73rem;
        font-weight: 700;
    }

    .plant-story-page .plant-detail-age-control-help {
        margin: 0.4rem 0 0;
        color: #687364;
        font-size: 0.73rem;
        line-height: 1.45;
    }

    .plant-story-page .plant-detail-age-unit-picker {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem;
    }

    .plant-story-page .plant-detail-age-unit-picker button {
        width: auto;
        min-width: 0;
        min-height: 36px;
        margin: 0;
        padding: 0.4rem 0.7rem;
        border: 1px solid rgba(82, 112, 71, 0.16);
        border-radius: 999px;
        background: rgba(255, 254, 249, 0.85);
        color: #62705f;
        font: inherit;
        font-size: 0.76rem;
        font-weight: 650;
        line-height: 1.2;
        text-decoration: none;
        cursor: pointer;
        box-shadow: none;
    }

    .plant-story-page .plant-detail-age-unit-picker button.selected {
        border-color: rgba(82, 112, 71, 0.33);
        background: rgba(226, 238, 212, 0.92);
        color: #405e42;
        font-weight: 750;
    }

    .plant-story-page .plant-detail-age-unit-picker button:focus-visible {
        outline: 2px solid #627c50;
        outline-offset: 3px;
    }

    .plant-story-page .plant-detail-grouped-facts {
        margin: 0.85rem 0 0;
        padding-top: 0.75rem;
        border-top: 1px solid rgba(66, 91, 57, 0.12);
    }

    .plant-story-page .plant-detail-grouped-facts > div + div {
        margin-top: 0.85rem;
    }

    .plant-story-page .plant-detail-grouped-facts dt {
        margin: 0 0 0.2rem;
        color: #718168;
        font-size: 0.72rem;
        font-weight: 750;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .plant-story-page .plant-detail-grouped-facts dd {
        margin: 0;
        line-height: 1.5;
        overflow-wrap: anywhere;
    }

    .plant-story-page .plant-detail-grouped-facts dd > strong {
        color: #405841;
        font-weight: 700;
    }

    .plant-story-page .plant-detail-fact-note {
        display: block;
        margin-top: 0.15rem;
        color: #687364;
        font-size: 0.82rem;
        line-height: 1.45;
    }

    .plant-story-page .plant-detail-growing-facts {
        margin-top: 0;
        padding-top: 0;
        border-top: 0;
    }

    .plant-story-page .plant-detail-growing-facts > div + div {
        padding-top: 0.8rem;
        border-top: 1px solid rgba(66, 91, 57, 0.12);
    }

    .plant-story-page .plant-detail-growing-facts .text-button {
        width: auto;
        margin: 0;
        padding: 0.2rem 0;
        text-align: left;
        white-space: normal;
        font-size: 1rem;
        font-weight: 700;
    }

    .plant-story-page .plant-detail-compact-intro {
        margin: 0.15rem 0 0;
        max-width: 42rem;
    }

    .plant-story-page .plant-detail-fact-grid {
        display: grid;
        grid-template-columns:
            minmax(7.5rem, 0.8fr) minmax(0, 1.7fr);
        gap: 0.45rem 0.8rem;
        align-items: start;
        margin-top: 0.75rem;
        font-size: 0.88rem;
        line-height: 1.5;
    }

    .plant-story-page .plant-detail-fact-grid > * {
        min-width: 0;
        overflow-wrap: anywhere;
    }

    .plant-story-page .plant-detail-fact-grid > strong {
        color: #52634b;
        font-size: 0.8rem;
        font-weight: 700;
    }

    .plant-story-page .plant-detail-fact-grid > .text-button {
        width: auto;
        min-height: 0;
        margin: 0;
        padding: 0;
        justify-self: start;
        text-align: left;
        white-space: normal;
        font: inherit;
        line-height: inherit;
    }

    .plant-story-page .plant-detail-actual-timing {
        margin-top: 0.9rem;
        padding-top: 0.8rem;
        border-top: 1px solid rgba(66, 91, 57, 0.12);
    }

    .plant-story-page .plant-detail-harvest-action {
        margin-top: 0.85rem;
        padding-top: 0.75rem;
        border-top: 1px solid rgba(66, 91, 57, 0.12);
    }

    .plant-story-page .plant-detail-harvest-action button {
        max-width: 100%;
        white-space: normal;
        text-align: left;
    }

    .plant-story-page .plant-detail-harvest-summary {
        width: 100%;
        margin-top: 0.75rem;
        text-align: left;
        cursor: pointer;
        font: inherit;
    }

    .plant-story-page .plant-detail-harvest-summary h3 {
        margin: 0.15rem 0;
    }

    .plant-story-page .plant-detail-harvest-summary > .form-whisper {
        margin-top: 0.55rem;
    }

    .plant-story-page .sprig-photo-viewer-context-action {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem 1.25rem;
        margin-top: 0.35rem;
    }

    .plant-story-page .sprig-photo-viewer-context-action .text-button {
        flex: 0 0 auto;
        width: auto;
        min-height: 40px;
        margin: 0;
        padding: 0.4rem 0;
        white-space: normal;
    }

    .plant-story-page .sprig-photo-viewer-context-action
    .sprig-photo-viewer-remove-action {
        color: #856b60;
        font-weight: 500;
        background: transparent;
        border: 0;
        box-shadow: none;
    }

    .plant-story-page .sprig-photo-viewer-context-action
    .sprig-photo-viewer-remove-action:hover {
        color: #754f43;
        text-decoration: underline;
        text-underline-offset: 0.18rem;
    }

    .plant-story-page .plant-detail-back-to-top {
        display: flex;
        justify-content: center;
        padding: 1rem 0 2rem;
    }

    .plant-story-page .plant-detail-intelligence-intro {
        max-width: 44rem;
        margin: 0.2rem 0 0;
    }

    .plant-story-page .plant-detail-intelligence-list {
        display: grid;
        gap: 0.8rem;
        margin-top: 0.85rem;
    }

    .plant-story-page .plant-detail-intelligence-card {
        border-left: 3px solid rgba(82, 112, 71, 0.34);
    }

    .plant-story-page .plant-detail-intelligence-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem 0.75rem;
        margin-bottom: 0.35rem;
        color: #687364;
        font-size: 0.75rem;
        font-weight: 700;
    }

    .plant-story-page .plant-detail-intelligence-card h3 {
        margin: 0.15rem 0 0.4rem;
    }

    .plant-story-page .plant-detail-intelligence-details {
        margin-top: 0.75rem;
        padding-top: 0.65rem;
        border-top: 1px solid rgba(66, 91, 57, 0.12);
    }

    .plant-story-page .plant-detail-intelligence-details summary {
        color: #52634b;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
    }

    .plant-story-page .plant-detail-intelligence-evidence {
        margin: 0.65rem 0 0;
        padding-left: 1.1rem;
    }

    .plant-story-page .plant-detail-intelligence-evidence li + li {
        margin-top: 0.4rem;
    }

    .plant-story-page .plant-detail-intelligence-evidence .text-button {
        width: auto;
        min-height: 0;
        margin: 0;
        padding: 0;
        text-align: left;
        white-space: normal;
        font: inherit;
        font-weight: 700;
    }

    .plant-story-page .plant-detail-intelligence-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem 0.9rem;
        margin-top: 0.75rem;
    }

    .plant-story-page .plant-detail-intelligence-actions .text-button {
        width: auto;
        min-height: 0;
        margin: 0;
        padding: 0.2rem 0;
        white-space: normal;
    }

    @media (max-width: 560px) {
        .plant-story-page .plant-detail-compact-card {
            padding: 0.8rem 0.85rem;
        }

        .plant-story-page .plant-detail-fact-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 0.12rem;
            font-size: 0.86rem;
        }

        .plant-story-page .plant-detail-fact-grid > strong {
            margin-top: 0.55rem;
            font-size: 0.72rem;
        }

        .plant-story-page .plant-detail-fact-grid > strong:first-child {
            margin-top: 0;
        }

        .plant-story-page .plant-detail-age-unit-picker button {
            min-height: 40px;
            padding: 0.45rem 0.75rem;
        }
    }

    @media print {
        .plant-story-page .plant-detail-back-to-top {
            display: none;
        }
    }
`;

/* =======================================
   LABELS AND DATES
======================================= */

function formatLabel(value: string): string {
    return value
        .replaceAll('-', ' ')
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function formatDate(date?: string): string {
    if (!date) return 'Not recorded';

    return new Date(`${date.slice(0, 10)}T00:00:00`)
        .toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
}

function formatShortDate(date?: string): string {
    if (!date) return 'Date not recorded';

    return new Date(`${date.slice(0, 10)}T00:00:00`)
        .toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
}

function getLocalDateKey(date: Date): string {
    return [
        date.getFullYear(),
        `${date.getMonth() + 1}`.padStart(2, '0'),
        `${date.getDate()}`.padStart(2, '0'),
    ].join('-');
}

function getDaysBetweenDates(
    startDate: string,
    endDate: string,
): number {
    const start = new Date(`${startDate.slice(0, 10)}T00:00:00`);
    const end = new Date(`${endDate.slice(0, 10)}T00:00:00`);

    return Math.round(
        (end.getTime() - start.getTime()) / 86400000,
    );
}

function formatDuration(
    days: number,
    unit: PlantDurationDisplayUnit,
): string {
    const absoluteDays = Math.abs(Math.round(days));

    if (unit === 'days') {
        return `${absoluteDays} ${absoluteDays === 1 ? 'day' : 'days'}`;
    }

    const divisor = unit === 'weeks' ? 7 : 30.4375;
    const amount = Math.round((absoluteDays / divisor) * 10) / 10;
    const label = unit === 'weeks' ? 'week' : 'month';

    return `${amount} ${label}${amount === 1 ? '' : 's'}`;
}

function formatPlantAgeAtDate(
    storyBeginningDate: string,
    date: string,
    unit: PlantDurationDisplayUnit,
): string {
    const days = getDaysBetweenDates(storyBeginningDate, date);

    return days < 0
        ? `${formatDuration(days, unit)} before story began`
        : `Age ${formatDuration(days, unit)}`;
}

function DurationUnitToggle({
    value,
    onChange,
}: {
    value: PlantDurationDisplayUnit;
    onChange: (unit: PlantDurationDisplayUnit) => void;
}) {
    const units: PlantDurationDisplayUnit[] = [
        'days', 'weeks', 'months',
    ];

    return (
        <div className="plant-detail-age-control">
            <span className="plant-detail-age-control-label">
                Show plant age in
            </span>

            <div
                className="plant-detail-age-unit-picker"
                role="group"
                aria-label="Choose how Sprig shows plant age"
            >
                {units.map(unit => (
                    <button
                        key={unit}
                        type="button"
                        className={value === unit ? 'selected' : ''}
                        aria-pressed={value === unit}
                        onClick={() => onChange(unit)}
                    >
                        {formatLabel(unit)}
                    </button>
                ))}
            </div>

            <p className="plant-detail-age-control-help">
                Applies throughout this Plant Story,
                including photograph ages.
            </p>
        </div>
    );
}

/* =======================================
   RECORD LABELS
======================================= */

function getPhotoPurposeLabel(
    purpose: SprigPhotoPurpose | undefined,
): string | undefined {
    return purpose ? formatLabel(purpose) : undefined;
}

function getPhotoMetadata(
    photoUrl: string,
    index: number,
    photoMetadata:
        | (SprigPhotoMetadata | undefined)[]
        | undefined,
): SprigPhotoMetadata | undefined {
    // The exact saved entry comes first, including duplicate URLs.
    const indexedMetadata = photoMetadata?.[index];

    if (indexedMetadata) return indexedMetadata;

    return photoMetadata?.find(
        metadata => metadata?.photoUrl === photoUrl,
    );
}

function getGrowingSetupCategoryLabel(
    setup: GrowingSetup,
): string {
    switch (setup.category) {
        case 'own-mix': return 'My Recipe';
        case 'bought-mix': return 'Bought Mix';
        case 'ground-type': return 'Native Ground';
        case 'growing-system': return 'Growing System';
        default: return 'Garden Recipe';
    }
}

function getStartMethodLabel(plant: PlantStory): string {
    return plant.startMethod === 'other' &&
        plant.customStartMethodLabel
        ? plant.customStartMethodLabel
        : formatLabel(plant.startMethod);
}

function getPlantOriginLabel(
    originType?: PlantOriginType,
): string {
    switch (originType) {
        case 'bought': return 'Bought';
        case 'saved-from-garden': return 'Saved from my garden';
        case 'propagated-from-plant':
            return 'Propagated from another plant';
        case 'gifted': return 'Given to me';
        case 'swapped': return 'Swapped';
        case 'found-or-existing': return 'Found or already growing';
        case 'unknown': return 'Not sure';
        case 'other': return 'Something else';
        default: return 'Not recorded';
    }
}

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
        case 'first': return 'First harvest';
        case 'regular': return 'Regular harvest';
        case 'main': return 'Main harvest';
        case 'secondary': return 'Secondary harvest';
        case 'final': return 'Final harvest';
        case 'other': return 'Other harvest';
        default: return 'Harvest';
    }
}

function getHarvestTimelineAmount(
    harvest: HarvestRecord,
): string | undefined {
    const pieces: string[] = [];

    if (harvest.count !== undefined) {
        pieces.push(`${harvest.count}`);
    }

    if (harvest.measurementAmount !== undefined) {
        let unitLabel = '';

        switch (harvest.measurementUnit) {
            case 'gram': unitLabel = 'g'; break;
            case 'kilogram': unitLabel = 'kg'; break;
            case 'millilitre': unitLabel = 'mL'; break;
            case 'litre': unitLabel = 'L'; break;
            case 'centimetre': unitLabel = 'cm'; break;
            case 'inch': unitLabel = 'in'; break;
            case 'other':
                unitLabel = harvest.customMeasurementUnitLabel ?? '';
                break;
            default:
                unitLabel = harvest.measurementUnit ?? '';
        }

        pieces.push(
            unitLabel
                ? `${harvest.measurementAmount} ${unitLabel}`
                : `${harvest.measurementAmount}`,
        );
    }

    return pieces.length ? pieces.join(' · ') : undefined;
}

function addDaysToDate(date: string, days: number): Date {
    const result = new Date(`${date}T00:00:00`);
    result.setDate(result.getDate() + days);
    return result;
}

function createSafeFileName(value: string): string {
    return value.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/* =======================================
   PLANT DETAIL
======================================= */

export default function PlantDetail({
    plant,
    gardenData,
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
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isVariationOpen, setIsVariationOpen] = useState(false);

    const sprigInsightResult = useMemo(
        () => buildSprigInsights(gardenData),
        [gardenData],
    );

    const plantInsights = useMemo(
        () => getSprigInsightsForPlant(
            sprigInsightResult,
            plant.id,
            3,
        ),
        [sprigInsightResult, plant.id],
    );

    function handleVariationCreated(newPlant: PlantStory) {
        onAddPlant(newPlant);
        setIsVariationOpen(false);
        onOpenPlant(newPlant.id);
        setIsEditOpen(true);
    }

    const [durationDisplayUnit, setDurationDisplayUnit] =
        useState<PlantDurationDisplayUnit>('weeks');

    const [isRecipeQuickPeekOpen, setIsRecipeQuickPeekOpen] =
        useState(false);

    const [
        isHarvestTimingQuickPeekOpen,
        setIsHarvestTimingQuickPeekOpen,
    ] = useState(false);

    const [customHarvestTimingDate, setCustomHarvestTimingDate] =
        useState('');

    const [customHarvestTimingLabel, setCustomHarvestTimingLabel] =
        useState('');

    const [isPhotoQuickAddOpen, setIsPhotoQuickAddOpen] =
        useState(false);

    const [editingPlantPhotoIndex, setEditingPlantPhotoIndex] =
        useState<number | null>(null);

    const [photoDraft, setPhotoDraft] = useState<string[]>(
        plant.photoUrls ?? [],
    );

    const [photoDateDraft, setPhotoDateDraft] =
        useState<(string | undefined)[]>(
            (plant.photoUrls ?? []).map(
                (_url, index) =>
                    plant.photoMetadata?.[index]?.photoDate ??
                    plant.photoDates?.[index],
            ),
        );

    const [photoMetadataDraft, setPhotoMetadataDraft] =
        useState<(SprigPhotoMetadata | undefined)[]>(
            (plant.photoUrls ?? []).map((photoUrl, index) => {
                const metadata = getPhotoMetadata(
                    photoUrl, index, plant.photoMetadata,
                );

                return {
                    ...metadata,
                    photoUrl,
                    photoDate:
                        metadata?.photoDate ??
                        plant.photoDates?.[index],
                };
            }),
        );

    /* OPEN AT TOP */

    useLayoutEffect(() => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.documentElement.style.overflow = '';

        function goToTop() {
            const scrollingElement = document.scrollingElement;

            if (scrollingElement) {
                scrollingElement.scrollTop = 0;
                scrollingElement.scrollLeft = 0;
            }

            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            window.scrollTo(0, 0);
        }

        goToTop();

        let secondFrame: number | undefined;
        const firstFrame = requestAnimationFrame(() => {
            secondFrame = requestAnimationFrame(goToTop);
        });

        return () => {
            cancelAnimationFrame(firstFrame);
            if (secondFrame !== undefined) {
                cancelAnimationFrame(secondFrame);
            }
        };
    }, [plant.id]);

    function backToTop() {
        document.getElementById('plant-story-top')?.scrollIntoView({
            behavior: window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches ? 'auto' : 'smooth',
            block: 'start',
        });
    }

    /* GROWING CONTEXT */

    const currentGrowingPlace = plant.currentGrowingPlaceId
        ? growingPlaces.find(
            place => place.id === plant.currentGrowingPlaceId,
        )
        : undefined;

    const currentGrowingSetup = plant.currentGrowingSetupId
        ? growingSetups.find(
            setup => setup.id === plant.currentGrowingSetupId,
        )
        : undefined;

    const currentRecipeIngredients =
        currentGrowingSetup?.ingredientIds
            ?.map(id => ingredients.find(item => item.id === id))
            .filter(
                (item): item is Ingredient => Boolean(item),
            ) ?? [];

    const growingJourney = (plant.growingHistory ?? [])
        .map(entry => ({
            ...entry,
            growingPlace: entry.growingPlaceId
                ? growingPlaces.find(
                    place => place.id === entry.growingPlaceId,
                )
                : undefined,
            growingSetup: entry.growingSetupId
                ? growingSetups.find(
                    setup => setup.id === entry.growingSetupId,
                )
                : undefined,
        }))
        .sort(
            (a, b) =>
                new Date(a.startedDate).getTime() -
                new Date(b.startedDate).getTime(),
        );

    /* AGE COUNTS FROM STORY BEGINNING */

    const daysGrowing = Math.max(
        0,
        getDaysBetweenDates(
            plant.plantedDate,
            getLocalDateKey(new Date()),
        ),
    );

    function getPlantAgeText(date?: string): string | undefined {
        if (!date || !plant.plantedDate) return undefined;

        return formatPlantAgeAtDate(
            plant.plantedDate, date, durationDisplayUnit,
        );
    }

    function getTimeSinceStoryBeganText(): string {
        return `${formatDuration(daysGrowing, durationDisplayUnit)} ago`;
    }

    /* HARVEST STORY */

    const plantHarvests = [...harvests]
        .filter(item => item.plantStoryIds.includes(plant.id))
        .sort(
            (a, b) =>
                new Date(a.date).getTime() -
                new Date(b.date).getTime(),
        );

    const firstPlantHarvest = plantHarvests[0];
    const latestPlantHarvest = plantHarvests[plantHarvests.length - 1];

    const totalHarvestCount = plantHarvests.reduce(
        (total, item) => total + (item.count ?? 0), 0,
    );

    const harvestMeasurements = plantHarvests.filter(
        item =>
            typeof item.measurementAmount === 'number' &&
            Boolean(item.measurementUnit),
    );

    const harvestUnits = Array.from(
        new Set(harvestMeasurements.map(item => item.measurementUnit)),
    );

    const canCombineHarvestAmounts =
        harvestMeasurements.length > 0 && harvestUnits.length === 1;

    const totalHarvestAmount = canCombineHarvestAmounts
        ? harvestMeasurements.reduce(
            (total, item) => total + (item.measurementAmount ?? 0),
            0,
        )
        : undefined;

    const totalHarvestUnit = canCombineHarvestAmounts
        ? harvestUnits[0]
        : undefined;

    /* HARVEST TIMING REFERENCE */

    const harvestTimingReference = plant.harvestTimingReference;

    const harvestTimingEvent =
        harvestTimingReference?.sourceType === 'garden-event' &&
        harvestTimingReference.eventId
            ? events.find(
                event => event.id === harvestTimingReference.eventId,
            )
            : undefined;

    let harvestTimingReferenceDate = plant.plantedDate;
    let harvestTimingReferenceLabel = 'Planted';

    if (
        harvestTimingReference?.sourceType === 'sown' &&
        plant.sownDate
    ) {
        harvestTimingReferenceDate = plant.sownDate;
        harvestTimingReferenceLabel = 'Sown';
    } else if (
        harvestTimingReference?.sourceType === 'planted-out' &&
        plant.plantedOutDate
    ) {
        harvestTimingReferenceDate = plant.plantedOutDate;
        harvestTimingReferenceLabel = 'Planted out';
    } else if (
        harvestTimingReference?.sourceType === 'garden-event' &&
        harvestTimingEvent
    ) {
        harvestTimingReferenceDate = harvestTimingEvent.date;
        harvestTimingReferenceLabel = harvestTimingEvent.title;
    } else if (
        harvestTimingReference?.sourceType === 'custom-date' &&
        harvestTimingReference.customDate
    ) {
        harvestTimingReferenceDate = harvestTimingReference.customDate;
        harvestTimingReferenceLabel =
            harvestTimingReference.customLabel ?? 'Another date';
    }

    const hasExpectedHarvestTiming =
        plant.expectedHarvestDaysMin !== undefined ||
        plant.expectedHarvestDaysMax !== undefined;

    const expectedHarvestStart =
        plant.expectedHarvestDaysMin !== undefined
            ? addDaysToDate(
                harvestTimingReferenceDate,
                plant.expectedHarvestDaysMin,
            )
            : undefined;

    const expectedHarvestEnd =
        plant.expectedHarvestDaysMax !== undefined
            ? addDaysToDate(
                harvestTimingReferenceDate,
                plant.expectedHarvestDaysMax,
            )
            : undefined;

    const firstHarvestDate = firstPlantHarvest
        ? new Date(`${firstPlantHarvest.date}T00:00:00`)
        : undefined;

    const actualDaysToFirstHarvest = firstPlantHarvest
        ? Math.max(
            0,
            getDaysBetweenDates(
                harvestTimingReferenceDate,
                firstPlantHarvest.date,
            ),
        )
        : undefined;

    let harvestTimingDifference: number | undefined;
    let harvestTimingStatus:
        | 'early'
        | 'expected'
        | 'late'
        | undefined;

    if (
        firstHarvestDate &&
        expectedHarvestStart &&
        firstHarvestDate.getTime() < expectedHarvestStart.getTime()
    ) {
        harvestTimingStatus = 'early';
        harvestTimingDifference = Math.round(
            (expectedHarvestStart.getTime() -
                firstHarvestDate.getTime()) / 86400000,
        );
    } else if (
        firstHarvestDate &&
        expectedHarvestEnd &&
        firstHarvestDate.getTime() > expectedHarvestEnd.getTime()
    ) {
        harvestTimingStatus = 'late';
        harvestTimingDifference = Math.round(
            (firstHarvestDate.getTime() -
                expectedHarvestEnd.getTime()) / 86400000,
        );
    } else if (
        firstHarvestDate &&
        (expectedHarvestStart || expectedHarvestEnd)
    ) {
        harvestTimingStatus = 'expected';
        harvestTimingDifference = 0;
    }

    function getExpectedTimingText(): string {
        const min = plant.expectedHarvestDaysMin;
        const max = plant.expectedHarvestDaysMax;

        if (min !== undefined && max !== undefined) {
            return `${formatDuration(min, durationDisplayUnit)}–${formatDuration(
                max, durationDisplayUnit,
            )}`;
        }

        if (min !== undefined) {
            return `From ${formatDuration(min, durationDisplayUnit)}`;
        }

        if (max !== undefined) {
            return `Around ${formatDuration(max, durationDisplayUnit)}`;
        }

        return 'Not recorded';
    }

    /* JOURNAL AND TIMELINE */

    const plantEvents = [...events]
        .filter(
            event =>
                event.plantStoryIds.length === 0 ||
                event.plantStoryIds.includes(plant.id),
        )
        .sort(
            (a, b) =>
                new Date(b.date).getTime() -
                new Date(a.date).getTime(),
        );

    const directlyLinkedPlantEvents = plantEvents.filter(
        event => event.plantStoryIds.includes(plant.id),
    );

    const storyTimeline = [
        ...plantEvents.map(event => ({
            kind: 'event' as const,
            date: event.date,
            event,
        })),
        ...plantHarvests.map(harvest => ({
            kind: 'harvest' as const,
            date: harvest.date,
            harvest,
        })),
    ].sort(
        (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime(),
    );

    /* PHOTOGRAPHS RETAIN THEIR SOURCE OWNERSHIP */

    const plantPhotographicStory: PlantPhotographicStoryItem[] = [
        ...(plant.photoUrls ?? []).map((photoUrl, index) => {
            const metadata = getPhotoMetadata(
                photoUrl, index, plant.photoMetadata,
            );

            return {
                key: metadata?.photoId ?? `plant-${plant.id}-${index}`,
                photoUrl,
                photoDate:
                    metadata?.photoDate ?? plant.photoDates?.[index],
                photoTime: metadata?.photoTime,
                title: metadata?.title,
                notes: metadata?.notes,
                tags: metadata?.tags,
                purpose: metadata?.purpose,
                sourceType: 'plant-story' as const,
                sourceId: plant.id,
                sourcePhotoIndex: index,
                sourceLabel: 'Plant Story',
                sourceDetail: 'Added directly to this Plant Story',
                fallbackDate: plant.plantedDate,
            };
        }),

        ...directlyLinkedPlantEvents.flatMap(event =>
            (event.photoUrls ?? []).map((photoUrl, index) => {
                const metadata = getPhotoMetadata(
                    photoUrl, index, event.photoMetadata,
                );

                return {
                    key: metadata?.photoId ?? `event-${event.id}-${index}`,
                    photoUrl,
                    photoDate: metadata?.photoDate ?? event.date,
                    photoTime: metadata?.photoTime,
                    title: metadata?.title ?? event.title,
                    notes: metadata?.notes,
                    tags: metadata?.tags,
                    purpose: metadata?.purpose,
                    sourceType: 'garden-event' as const,
                    sourceId: event.id,
                    sourcePhotoIndex: index,
                    sourceLabel: 'Journal moment',
                    sourceDetail: event.title,
                    fallbackDate: event.date,
                };
            }),
        ),

        ...plantHarvests.flatMap(harvest =>
            (harvest.photoUrls ?? []).map((photoUrl, index) => {
                const metadata = getPhotoMetadata(
                    photoUrl, index, harvest.photoMetadata,
                );

                return {
                    key:
                        metadata?.photoId ??
                        `harvest-${harvest.id}-${index}`,
                    photoUrl,
                    photoDate: metadata?.photoDate ?? harvest.date,
                    photoTime: metadata?.photoTime,
                    title:
                        metadata?.title ??
                        getHarvestTimelineTitle(harvest),
                    notes: metadata?.notes,
                    tags: metadata?.tags,
                    purpose: metadata?.purpose ?? 'harvest',
                    sourceType: 'harvest' as const,
                    sourceId: harvest.id,
                    sourcePhotoIndex: index,
                    sourceLabel: 'Harvest',
                    sourceDetail: getHarvestTimelineTitle(harvest),
                    fallbackDate: harvest.date,
                };
            }),
        ),
    ].sort((a, b) => {
        const first = a.photoDate ?? a.fallbackDate;
        const second = b.photoDate ?? b.fallbackDate;

        if (!first && !second) return 0;
        if (!first) return 1;
        if (!second) return -1;

        return new Date(`${second}T00:00:00`).getTime() -
            new Date(`${first}T00:00:00`).getTime();
    });

    /* TIMING REFERENCE SAVE */

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
                    sourceType === 'garden-event' ? eventId : undefined,
                customDate:
                    sourceType === 'custom-date'
                        ? customHarvestTimingDate
                        : undefined,
                customLabel:
                    sourceType === 'custom-date'
                        ? customHarvestTimingLabel.trim() || undefined
                        : undefined,
            },
            updatedAt: new Date().toISOString(),
        });

        setIsHarvestTimingQuickPeekOpen(false);
        setCustomHarvestTimingDate('');
        setCustomHarvestTimingLabel('');
    }

    const harvestTimingMilestoneEvents = plantEvents.filter(
        event =>
            event.plantStoryIds.includes(plant.id) &&
            (
                event.type === 'planted' ||
                event.type === 'moved' ||
                event.type === 'sprouted'
            ),
    );



        /* SPRIG INTELLIGENCE ACTIONS */

        function handleSprigInsightAction(
            action: SprigInsightAction,
        ) {
            switch (action.type) {
                case 'open-plant':
                    if (action.plantStoryId) {
                        onOpenPlant(action.plantStoryId);
                    }
                    return;
    
                case 'compare-plants':
                    if (
                        action.plantStoryIds &&
                        action.plantStoryIds.length >= 2
                    ) {
                        onComparePlants(action.plantStoryIds);
                    }
                    return;
    
                case 'open-trial':
                    onNavigate('garden-trials');
                    return;
    
                case 'open-gallery':
                    onNavigate('garden-gallery');
                    return;
    
                case 'open-calendar':
                    onNavigate('calendar');
                    return;
    
                case 'open-harvests':
                    onNavigate('harvest');
                    return;
    
                case 'open-journal':
                    onNavigate('journal');
                    return;
    
                case 'none':
                default:
                    return;
            }
        }
    
        function canOpenSprigEvidence(
            recordType: string,
            recordId: string,
        ): boolean {
            if (recordType === 'plant-story') {
                return recordId !== plant.id;
            }
    
            return (
                recordType === 'garden-event' ||
                recordType === 'harvest' ||
                recordType === 'growing-place'
            );
        }
    
        function openSprigEvidence(
            recordType: string,
            recordId: string,
        ) {
            switch (recordType) {
                case 'plant-story':
                    if (recordId !== plant.id) {
                        onOpenPlant(recordId);
                    }
                    return;
    
                case 'garden-event':
                    onOpenJournalEntry(recordId);
                    return;
    
                case 'harvest':
                    onOpenHarvest(recordId);
                    return;
    
                case 'growing-place':
                    onOpenGrowingPlace(recordId);
                    return;
    
                default:
                    return;
            }
        }
    
        function isUsefulSprigInsightAction(
            action: SprigInsightAction,
        ): boolean {
            if (action.type === 'none') {
                return false;
            }
    
            if (
                action.type === 'open-plant' &&
                action.plantStoryId === plant.id
            ) {
                return false;
            }
    
            return true;
        }

        

    /* STORY ACTIONS */

    function toggleFavourite() {
        onUpdatePlant({
            ...plant,
            isFavourite: !plant.isFavourite,
            updatedAt: new Date().toISOString(),
        });
    }

    function archivePlant() {
        if (!window.confirm(
            `Archive "${plant.displayName}"?\n\nSprig will keep the Plant Story, photographs and timeline.`,
        )) return;

        onUpdatePlant({
            ...plant,
            isArchived: true,
            archivedAt: new Date().toISOString().slice(0, 10),
            updatedAt: new Date().toISOString(),
        });
    }

    function restorePlant() {
        onUpdatePlant({
            ...plant,
            isArchived: false,
            archivedAt: undefined,
            updatedAt: new Date().toISOString(),
        });
    }

    function completeStory() {
        if (!window.confirm(
            `Complete "${plant.displayName}"?\n\nThis keeps the entire Plant Story and marks its growing chapter as finished.`,
        )) return;

        onUpdatePlant({
            ...plant,
            status: 'finished',
            completedAt: new Date().toISOString().slice(0, 10),
            updatedAt: new Date().toISOString(),
        });
    }

    function reopenStory() {
        onUpdatePlant({
            ...plant,
            status: 'growing',
            completedAt: undefined,
            updatedAt: new Date().toISOString(),
        });
    }

    function printPlantStory() {
        window.print();
    }

    function exportPlantStory() {
        const exportRecord = {
            exportedAt: new Date().toISOString(),
            plant,
            growingPlace: currentGrowingPlace ?? null,
            growingRecipe: currentGrowingSetup ?? null,
            events: plantEvents,
            harvests: plantHarvests,
        };

        const blob = new Blob(
            [JSON.stringify(exportRecord, null, 2)],
            { type: 'application/json' },
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${
            createSafeFileName(plant.displayName) || 'plant-story'
        }-sprig.json`;

        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function deletePlantStory() {
        if (window.confirm(
            `Permanently delete "${plant.displayName}"?\n\nThis removes the Plant Story and its linked plant-specific Journal entries.\n\nThis cannot be undone.`,
        )) {
            onDeletePlant(plant.id);
        }
    }

    /* PHOTO WORKSPACE */

    function openPhotoAdder() {
        setEditingPlantPhotoIndex(null);
        setPhotoDraft([]);
        setPhotoDateDraft([]);
        setPhotoMetadataDraft([]);
        setIsPhotoQuickAddOpen(true);
    }

    function openPlantPhotoEditor(photoIndex: number) {
        const photoUrl = plant.photoUrls?.[photoIndex];
        if (!photoUrl) return;

        const metadata = getPhotoMetadata(
            photoUrl, photoIndex, plant.photoMetadata,
        );

        const photoDate =
            metadata?.photoDate ?? plant.photoDates?.[photoIndex];

        setEditingPlantPhotoIndex(photoIndex);
        setPhotoDraft([photoUrl]);
        setPhotoDateDraft([photoDate]);
        setPhotoMetadataDraft([{ ...metadata, photoUrl, photoDate }]);
        setIsPhotoQuickAddOpen(true);
    }

    function closePhotoWorkspace() {
        setIsPhotoQuickAddOpen(false);
        setEditingPlantPhotoIndex(null);
        setPhotoDraft([]);
        setPhotoDateDraft([]);
        setPhotoMetadataDraft([]);
    }

    function savePhotos() {
        if (editingPlantPhotoIndex !== null) {
            const existingPhotoUrls = [...(plant.photoUrls ?? [])];

            const existingPhotoMetadata = existingPhotoUrls.map(
                (photoUrl, index) => {
                    const existing = getPhotoMetadata(
                        photoUrl, index, plant.photoMetadata,
                    );

                    return {
                        ...existing,
                        photoUrl,
                        photoDate:
                            existing?.photoDate ??
                            plant.photoDates?.[index] ??
                            undefined,
                    } satisfies SprigPhotoMetadata;
                },
            );

            if (photoDraft.length === 0) {
                if (!window.confirm(
                    'Remove this photograph from the Plant Story?\n\nThis cannot be undone.',
                )) return;

                const savedPhotoUrls = existingPhotoUrls.filter(
                    (_url, index) => index !== editingPlantPhotoIndex,
                );

                const savedPhotoMetadata = existingPhotoMetadata.filter(
                    (_metadata, index) =>
                        index !== editingPlantPhotoIndex,
                );

                onUpdatePlant({
                    ...plant,
                    photoUrls: savedPhotoUrls,
                    photoDates: savedPhotoMetadata.map(
                        metadata => metadata.photoDate,
                    ),
                    photoMetadata: savedPhotoMetadata,
                    updatedAt: new Date().toISOString(),
                });

                closePhotoWorkspace();
                return;
            }

            const editedPhotoUrl = photoDraft[0];
            const draftMetadata = getPhotoMetadata(
                editedPhotoUrl, 0, photoMetadataDraft,
            );

            const editedMetadata = {
                ...existingPhotoMetadata[editingPlantPhotoIndex],
                ...draftMetadata,
                photoUrl: editedPhotoUrl,
                photoDate:
                    draftMetadata?.photoDate ??
                    photoDateDraft[0] ??
                    undefined,
            } satisfies SprigPhotoMetadata;

            existingPhotoUrls[editingPlantPhotoIndex] = editedPhotoUrl;
            existingPhotoMetadata[editingPlantPhotoIndex] = editedMetadata;

            onUpdatePlant({
                ...plant,
                photoUrls: existingPhotoUrls,
                photoDates: existingPhotoMetadata.map(
                    metadata => metadata.photoDate,
                ),
                photoMetadata: existingPhotoMetadata,
                updatedAt: new Date().toISOString(),
            });

            closePhotoWorkspace();
            return;
        }

        if (photoDraft.length === 0) return;

        const existingPhotoUrls = [...(plant.photoUrls ?? [])];
        const existingPhotoMetadata = existingPhotoUrls.map(
            (photoUrl, index) => {
                const existing = getPhotoMetadata(
                    photoUrl, index, plant.photoMetadata,
                );

                return {
                    ...existing,
                    photoUrl,
                    photoDate:
                        existing?.photoDate ??
                        plant.photoDates?.[index] ??
                        undefined,
                } satisfies SprigPhotoMetadata;
            },
        );

        const newPhotoMetadata = photoDraft.map((photoUrl, index) => {
            const existing = getPhotoMetadata(
                photoUrl, index, photoMetadataDraft,
            );

            return {
                ...existing,
                photoUrl,
                photoDate:
                    existing?.photoDate ??
                    photoDateDraft[index] ??
                    undefined,
            } satisfies SprigPhotoMetadata;
        });

        const savedPhotoMetadata = [
            ...existingPhotoMetadata, ...newPhotoMetadata,
        ];

        onUpdatePlant({
            ...plant,
            photoUrls: [...existingPhotoUrls, ...photoDraft],
            photoDates: savedPhotoMetadata.map(item => item.photoDate),
            photoMetadata: savedPhotoMetadata,
            updatedAt: new Date().toISOString(),
        });

        closePhotoWorkspace();
    }

    function deletePlantPhoto(photoIndex: number) {
        if (!window.confirm(
            'Remove this photograph from the Plant Story?\n\nThis cannot be undone.',
        )) return;

        const existingPhotoUrls = [...(plant.photoUrls ?? [])];
        const existingPhotoMetadata = existingPhotoUrls.map(
            (photoUrl, index) => {
                const metadata = getPhotoMetadata(
                    photoUrl, index, plant.photoMetadata,
                );

                return {
                    ...metadata,
                    photoUrl,
                    photoDate:
                        metadata?.photoDate ??
                        plant.photoDates?.[index] ??
                        undefined,
                } satisfies SprigPhotoMetadata;
            },
        );

        const savedPhotoMetadata = existingPhotoMetadata.filter(
            (_metadata, index) => index !== photoIndex,
        );

        onUpdatePlant({
            ...plant,
            photoUrls: existingPhotoUrls.filter(
                (_url, index) => index !== photoIndex,
            ),
            photoDates: savedPhotoMetadata.map(item => item.photoDate),
            photoMetadata: savedPhotoMetadata,
            updatedAt: new Date().toISOString(),
        });

        closePhotoWorkspace();
    }

    /* PHOTO VIEWER CONTEXT */

    const plantPhotographicStoryPhotoUrls =
        plantPhotographicStory.map(item => item.photoUrl);

    const plantPhotographicStoryContexts =
        plantPhotographicStory.map(item => {
            const date = item.photoDate ?? item.fallbackDate;
            const detailParts: string[] = [];

            if (date) {
                detailParts.push(formatShortDate(date));
                if (item.photoTime) detailParts.push(item.photoTime);
            }

            if (item.notes) detailParts.push(item.notes);

            if (item.tags?.length) {
                detailParts.push(
                    item.tags.map(
                        tag => `#${tag.replace(/^#+/, '')}`,
                    ).join(' '),
                );
            }

            let photoAgeDays: number | undefined;

            if (date && plant.plantedDate) {
                const difference = getDaysBetweenDates(
                    plant.plantedDate, date,
                );

                if (difference >= 0) {
                    photoAgeDays = difference;
                } else {
                    detailParts.push(
                        formatPlantAgeAtDate(
                            plant.plantedDate, date, durationDisplayUnit,
                        ),
                    );
                }
            }

            let actionLabel: string | undefined;
            let onAction: (() => void) | undefined;
            let secondaryActionLabel: string | undefined;
            let onSecondaryAction: (() => void) | undefined;

            if (item.sourceType === 'plant-story') {
                actionLabel = 'Edit photograph';
                onAction = () =>
                    openPlantPhotoEditor(item.sourcePhotoIndex);
                secondaryActionLabel = 'Remove photograph';
                onSecondaryAction = () =>
                    deletePlantPhoto(item.sourcePhotoIndex);
            } else if (item.sourceType === 'garden-event') {
                actionLabel = 'Open Journal moment';
                onAction = () => onOpenJournalEntry(item.sourceId);
            } else {
                actionLabel = 'Open Harvest';
                onAction = () => onOpenHarvest(item.sourceId);
            }

            return {
                heading:
                    item.title ??
                    getPhotoPurposeLabel(item.purpose) ??
                    'Along the way',
                detail: detailParts.length
                    ? detailParts.join(' · ')
                    : undefined,
                age: photoAgeDays !== undefined
                    ? { days: photoAgeDays }
                    : undefined,
                actionLabel,
                onAction,
                secondaryActionLabel,
                onSecondaryAction,
            };
        });

    const hasJourneyBack = Boolean(journeyBackLabel);
    const journeyAlreadyReturnsToPlants = journeyBackLabel === 'Plants';

    /* FLOW 2 CONTINUES BELOW */

    return (
      <>
          <style>{plantDetailStyles}</style>

          <GardenLayout activePage="plants" onNavigate={onNavigate}>
              <div className="plant-story-page">
                  <header
                      className="plant-story-header"
                      id="plant-story-top"
                  >
                      <p className="section-label">
                          {plant.plantName} story
                      </p>

                      <h1>{plant.displayName}</h1>

                      <p className="story-personality">
                          {plant.variety
                              ? `${plant.plantName} · ${plant.variety}`
                              : plant.personality ??
                                  'A story still unfolding'}
                      </p>

                      <div className="story-status-row">
                          <span className="status-pill">
                              {formatLabel(plant.status)}
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

                  {/* RECORD ACTIONS */}

                  <section
                      className="plant-record-actions"
                      aria-label="Plant Story actions"
                  >
                      {hasJourneyBack && (
                          <button
                              type="button"
                              className="secondary-button"
                              onClick={onBack}
                          >
                              ← Back to {journeyBackLabel}
                          </button>
                      )}

                      {!journeyAlreadyReturnsToPlants && (
                          <button
                              type="button"
                              className="secondary-button"
                              onClick={onOpenPlants}
                          >
                              ← Plants
                          </button>
                      )}

                      <button
                          type="button"
                          className="secondary-button"
                          onClick={() => setIsEditOpen(true)}
                      >
                          ✏ Edit
                      </button>

                      <button
                          type="button"
                          className="secondary-button"
                          onClick={() => setIsVariationOpen(true)}
                      >
                          🌱 Create a variation
                      </button>

                      <button
                          type="button"
                          className="secondary-button"
                          onClick={toggleFavourite}
                      >
                          {plant.isFavourite
                              ? '★ Favourite' : '☆ Favourite'}
                      </button>

                      <button
                          type="button"
                          className="secondary-button"
                          onClick={openPhotoAdder}
                      >
                          📸 Add photographs
                      </button>

                      <button
                          type="button"
                          className="secondary-button"
                          onClick={plant.isArchived
                              ? restorePlant : archivePlant}
                      >
                          {plant.isArchived ? '🌱 Restore' : '📦 Archive'}
                      </button>

                      <button
                          type="button"
                          className="secondary-button"
                          onClick={printPlantStory}
                      >
                          🖨 Print
                      </button>

                      <button
                          type="button"
                          className="secondary-button"
                          onClick={exportPlantStory}
                      >
                          📤 Export
                      </button>

                      <button
                          type="button"
                          className="secondary-button"
                          onClick={deletePlantStory}
                      >
                          🗑 Delete
                      </button>

                      <button
                          type="button"
                          className="secondary-button"
                          onClick={() => onAddHarvest([plant.id])}
                      >
                          🧺 Add a harvest
                      </button>

                      <button
                          type="button"
                          className="secondary-button"
                          onClick={onAddEvent}
                      >
                          📖 Add a moment
                      </button>

                      <button
                          type="button"
                          className="secondary-button"
                          onClick={plant.status === 'finished'
                              ? reopenStory : completeStory}
                      >
                          {plant.status === 'finished'
                              ? '🌱 Reopen this story'
                              : '🍂 Complete story'}
                      </button>
                  </section>

                  {/* ONE BEGINNING CARD */}

                  <section className="story-section">
                      <div className="section-heading">
                          <div>
                              <p className="section-label">The beginning</p>
                              <h2>How this story began</h2>
                          </div>
                      </div>

                      <article className="story-info-card plant-detail-compact-card">
                          <p className="section-label">Story began</p>

                          <h3 className="plant-detail-beginning-date">
                              {formatDate(plant.plantedDate)}
                          </h3>

                          <p className="plant-detail-beginning-age">
                              <strong>{getTimeSinceStoryBeganText()}</strong>
                          </p>

                          <DurationUnitToggle
                              value={durationDisplayUnit}
                              onChange={setDurationDisplayUnit}
                          />

                          <dl className="plant-detail-grouped-facts">
                              <div>
                                  <dt>Started as</dt>
                                  <dd>
                                      <strong>
                                          {getStartMethodLabel(plant)}
                                      </strong>
                                  </dd>
                              </div>

                              <div>
                                  <dt>Started with</dt>
                                  <dd>
                                      <strong>{plant.quantity ?? 1}</strong>
                                      <span className="plant-detail-fact-note">
                                          {(plant.quantity ?? 1) === 1
                                              ? 'One plant or starting piece'
                                              : 'Plants or starting pieces growing as one story'}
                                      </span>
                                  </dd>
                              </div>

                              <div>
                                  <dt>Where it came from</dt>
                                  <dd>
                                      <strong>
                                          {plant.originType === 'other' &&
                                          plant.customOriginLabel
                                              ? plant.customOriginLabel
                                              : getPlantOriginLabel(
                                                  plant.originType,
                                              )}
                                      </strong>
                                      <span className="plant-detail-fact-note">
                                          {plant.source ||
                                              'No source or place recorded.'}
                                      </span>
                                  </dd>
                              </div>
                          </dl>
                      </article>
                  </section>

                  {/* EARLY JOURNEY */}

                  {(plant.sownDate || plant.plantedOutDate) && (
                      <section className="story-section">
                          <div className="section-heading">
                              <div>
                                  <p className="section-label">Early journey</p>
                                  <h2>From beginning to garden</h2>
                              </div>
                          </div>

                          <section className="story-information-grid">
                              {plant.sownDate && (
                                  <article className="story-info-card">
                                      <p className="section-label">Sown</p>
                                      <h2>{formatDate(plant.sownDate)}</h2>
                                      <p>{getPlantAgeText(plant.sownDate)}</p>
                                      <p className="form-whisper">
                                          The first recorded step
                                          in this seed-grown story.
                                      </p>
                                  </article>
                              )}

                              {plant.plantedOutDate && (
                                  <article className="story-info-card">
                                      <p className="section-label">Planted out</p>
                                      <h2>
                                          {formatDate(plant.plantedOutDate)}
                                      </h2>
                                      <p>
                                          {getPlantAgeText(plant.plantedOutDate)}
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

                  {/* ONE GROWING CONTEXT CARD */}

                  <section className="story-section">
                      <div className="section-heading">
                          <h2>Growing now</h2>
                      </div>

                      <article className="story-info-card plant-detail-compact-card">
                          <dl className="plant-detail-grouped-facts plant-detail-growing-facts">
                              <div>
                                  <dt>Growing Place</dt>
                                  <dd>
                                      {currentGrowingPlace ? (
                                          <>
                                              <button
                                                  type="button"
                                                  className="text-button"
                                                  onClick={() =>
                                                      onOpenGrowingPlace(
                                                          currentGrowingPlace.id,
                                                      )
                                                  }
                                              >
                                                  {currentGrowingPlace.name} →
                                              </button>
                                              <span className="plant-detail-fact-note">
                                                  {currentGrowingPlace.kind ===
                                                      'other' &&
                                                  currentGrowingPlace.customKindLabel
                                                      ? currentGrowingPlace.customKindLabel
                                                      : formatLabel(
                                                          currentGrowingPlace.kind,
                                                      )}
                                              </span>
                                          </>
                                      ) : (
                                          <>
                                              <strong>Place not recorded</strong>
                                              <span className="plant-detail-fact-note">
                                                  This can be added later.
                                              </span>
                                          </>
                                      )}
                                  </dd>
                              </div>

                              <div>
                                  <dt>Growing Recipe</dt>
                                  <dd>
                                      {currentGrowingSetup ? (
                                          <>
                                              <button
                                                  type="button"
                                                  className="text-button"
                                                  onClick={() =>
                                                      setIsRecipeQuickPeekOpen(true)
                                                  }
                                              >
                                                  {currentGrowingSetup.name} →
                                              </button>
                                              <span className="plant-detail-fact-note">
                                                  {getGrowingSetupCategoryLabel(
                                                      currentGrowingSetup,
                                                  )}
                                                  {' · Tap for a quick peek'}
                                              </span>
                                          </>
                                      ) : (
                                          <>
                                              <strong>Recipe not recorded</strong>
                                              <span className="plant-detail-fact-note">
                                                  This can be added later.
                                              </span>
                                          </>
                                      )}
                                  </dd>
                              </div>
                          </dl>
                      </article>
                  </section>

                  {/* GROWING JOURNEY */}

                  {growingJourney.length > 0 && (
                      <section className="story-section">
                          <p className="section-label">Growing journey</p>
                          <h2>Where this story has put down roots</h2>
                          <p className="form-whisper">
                              A little history of where this plant has grown
                              and what it was growing in along the way.
                          </p>

                          <div className="timeline">
                              {growingJourney.map(entry => (
                                  <article
                                      key={entry.id}
                                      className="timeline-entry"
                                  >
                                      <div className="timeline-marker">🌱</div>

                                      <div className="timeline-entry-header">
                                          <div>
                                              <div className="timeline-entry-meta">
                                                  <time>
                                                      {formatDate(entry.startedDate)}
                                                      {' · '}
                                                      {getPlantAgeText(entry.startedDate)}
                                                      {' → '}
                                                      {entry.endedDate ? (
                                                          <>
                                                              {formatDate(entry.endedDate)}
                                                              {' · '}
                                                              {getPlantAgeText(entry.endedDate)}
                                                          </>
                                                      ) : (
                                                          <>
                                                              Now ·{' '}
                                                              {getPlantAgeText(
                                                                  getLocalDateKey(new Date()),
                                                              )}
                                                          </>
                                                      )}
                                                  </time>
                                              </div>

                                              <h3>
                                                  {entry.growingPlace?.name ??
                                                      entry.growingSetup?.name ??
                                                      'Growing arrangement'}
                                              </h3>
                                          </div>
                                      </div>

                                      {entry.growingPlace && (
                                          <p>
                                              <strong>Growing Place:</strong>{' '}
                                              <button
                                                  type="button"
                                                  className="garden-place-link"
                                                  onClick={() =>
                                                      onOpenGrowingPlace(
                                                          entry.growingPlace!.id,
                                                      )
                                                  }
                                              >
                                                  {entry.growingPlace.name}
                                              </button>
                                          </p>
                                      )}

                                      {entry.growingSetup && (
                                          <p>
                                              <strong>Growing Recipe:</strong>{' '}
                                              {entry.growingSetup.name}
                                          </p>
                                      )}

                                      {entry.notes && <p>{entry.notes}</p>}
                                  </article>
                              ))}
                          </div>
                      </section>
                  )}

                  {/* UNIFIED HARVEST STORY */}

                  <section className="story-section">
                      <div className="section-heading">
                          <h2>{plant.displayName} — Harvest Story</h2>
                      </div>

                      <article className="story-info-card plant-detail-compact-card">
                          <p className="section-label">Expected harvest</p>

                          {hasExpectedHarvestTiming ? (
                              <>
                                  <p className="form-whisper plant-detail-compact-intro">
                                      The expected window and the plant&apos;s
                                      age at each date.
                                  </p>

                                  <div className="plant-detail-fact-grid">
                                      <strong>Count from</strong>
                                      <button
                                          type="button"
                                          className="text-button"
                                          onClick={() =>
                                              setIsHarvestTimingQuickPeekOpen(true)
                                          }
                                      >
                                          {harvestTimingReferenceLabel}
                                          {' · '}
                                          {formatDate(harvestTimingReferenceDate)}
                                          {' · '}
                                          {getPlantAgeText(harvestTimingReferenceDate)}
                                          {' →'}
                                      </button>

                                      <strong>Expected timing</strong>
                                      <span>{getExpectedTimingText()}</span>

                                      {expectedHarvestStart && (
                                          <>
                                              <strong>Earliest expected</strong>
                                              <span>
                                                  {formatDate(
                                                      getLocalDateKey(expectedHarvestStart),
                                                  )}
                                                  {' · '}
                                                  {getPlantAgeText(
                                                      getLocalDateKey(expectedHarvestStart),
                                                  )}
                                              </span>
                                          </>
                                      )}

                                      {expectedHarvestEnd && (
                                          <>
                                              <strong>Later edge</strong>
                                              <span>
                                                  {formatDate(
                                                      getLocalDateKey(expectedHarvestEnd),
                                                  )}
                                                  {' · '}
                                                  {getPlantAgeText(
                                                      getLocalDateKey(expectedHarvestEnd),
                                                  )}
                                              </span>
                                          </>
                                      )}
                                  </div>
                              </>
                          ) : (
                              <p className="form-whisper plant-detail-compact-intro">
                                  No expected timing recorded.
                                  You can still record a harvest whenever it happens.
                              </p>
                          )}

                          {hasExpectedHarvestTiming &&
                          firstPlantHarvest &&
                          actualDaysToFirstHarvest !== undefined && (
                              <div className="plant-detail-actual-timing">
                                  <p className="section-label">
                                      What actually happened
                                  </p>

                                  <div className="plant-detail-fact-grid">
                                      <strong>First gathered</strong>
                                      <span>
                                          {formatDate(firstPlantHarvest.date)}
                                          {' · '}
                                          {getPlantAgeText(firstPlantHarvest.date)}
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

                                      <strong>Compared with expected</strong>
                                      <span>
                                          {harvestTimingStatus === 'early' &&
                                          harvestTimingDifference !== undefined
                                              ? `${formatDuration(
                                                  harvestTimingDifference,
                                                  durationDisplayUnit,
                                              )} early`
                                              : harvestTimingStatus === 'late' &&
                                              harvestTimingDifference !== undefined
                                                  ? `${formatDuration(
                                                      harvestTimingDifference,
                                                      durationDisplayUnit,
                                                  )} later`
                                                  : harvestTimingStatus === 'expected'
                                                      ? 'Within the expected window'
                                                      : 'Not enough information yet'}
                                      </span>
                                  </div>
                              </div>
                          )}

                          <div className="plant-detail-harvest-action">
                              <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => onAddHarvest([plant.id])}
                              >
                                  🧺 Harvest {plant.displayName}
                              </button>
                          </div>
                      </article>

                      {latestPlantHarvest && (
                          <button
                              type="button"
                              className="story-info-card plant-detail-compact-card plant-detail-harvest-summary"
                              onClick={() => onOpenHarvest(latestPlantHarvest.id)}
                              aria-label={`Open ${plant.displayName} Harvest Story`}
                          >
                              <p className="section-label">
                                  Harvested from this story
                              </p>

                              <h3>
                                  {plantHarvests.length}{' '}
                                  {plantHarvests.length === 1 ? 'harvest' : 'harvests'}
                              </h3>

                              <div className="plant-detail-fact-grid">
                                  {totalHarvestCount > 0 && (
                                      <>
                                          <strong>Total count</strong>
                                          <span>{totalHarvestCount}</span>
                                      </>
                                  )}

                                  {totalHarvestAmount !== undefined &&
                                  totalHarvestUnit && (
                                      <>
                                          <strong>Total gathered</strong>
                                          <span>
                                              {totalHarvestAmount}{' '}
                                              {totalHarvestUnit === 'gram'
                                                  ? 'g'
                                                  : totalHarvestUnit === 'kilogram'
                                                      ? 'kg'
                                                      : totalHarvestUnit === 'millilitre'
                                                          ? 'mL'
                                                          : totalHarvestUnit === 'litre'
                                                              ? 'L'
                                                              : totalHarvestUnit}
                                          </span>
                                      </>
                                  )}

                                  {firstPlantHarvest && (
                                      <>
                                          <strong>First harvest</strong>
                                          <span>
                                              {formatDate(firstPlantHarvest.date)}
                                              {' · '}
                                              {getPlantAgeText(firstPlantHarvest.date)}
                                          </span>
                                      </>
                                  )}

                                  {plantHarvests.length > 1 && (
                                      <>
                                          <strong>Latest harvest</strong>
                                          <span>
                                              {formatDate(latestPlantHarvest.date)}
                                              {' · '}
                                              {getPlantAgeText(latestPlantHarvest.date)}
                                          </span>
                                      </>
                                  )}
                              </div>

                              <p className="form-whisper">Open Harvest Story →</p>
                          </button>
                      )}
                  </section>

                                    {/* SPRIG INTELLIGENCE */}

                  {plantInsights.length > 0 && (
                      <section className="story-section">
                          <div className="section-heading">
                              <div>
                                  <p className="section-label">
                                      From Sprig
                                  </p>

                                  <h2>
                                      Sprig noticed something in this story
                                  </h2>

                                  <p className="form-whisper plant-detail-intelligence-intro">
                                      These observations come from the same
                                      shared Sprig Intelligence used across
                                      the garden. They may change as this
                                      story gains new evidence.
                                  </p>
                              </div>

                              <button
                                  type="button"
                                  className="text-button"
                                  onClick={() =>
                                      onNavigate('sprig-smart')
                                  }
                              >
                                  Sprig Smart →
                              </button>
                          </div>

                          <div className="plant-detail-intelligence-list">
                              {plantInsights.map(insight => {
                                  const usefulActions = (
                                      insight.actions ?? []
                                  ).filter(
                                      isUsefulSprigInsightAction,
                                  );

                                  return (
                                      <article
                                          key={insight.id}
                                          className="story-info-card plant-detail-compact-card plant-detail-intelligence-card"
                                      >
                                          <div className="plant-detail-intelligence-meta">
                                              <span>
                                                  {getSprigInsightFamilyLabel(
                                                      insight.family,
                                                  )}
                                              </span>

                                              <span>
                                                  {getSprigInsightStrengthLabel(
                                                      insight.strength,
                                                  )}
                                              </span>
                                          </div>

                                          <h3>{insight.title}</h3>

                                          <p>{insight.message}</p>

                                          <details className="plant-detail-intelligence-details">
                                              <summary>
                                                  Why Sprig noticed this
                                              </summary>

                                              <p>
                                                  {insight.reasoning}
                                              </p>

                                              {insight.evidence.length > 0 && (
                                                  <ul className="plant-detail-intelligence-evidence">
                                                      {insight.evidence.map(
                                                          (
                                                              evidence,
                                                              index,
                                                          ) => (
                                                              <li
                                                                  key={`${insight.id}-evidence-${evidence.recordType}-${evidence.recordId}-${index}`}
                                                              >
                                                                  {canOpenSprigEvidence(
                                                                      evidence.recordType,
                                                                      evidence.recordId,
                                                                  ) ? (
                                                                      <button
                                                                          type="button"
                                                                          className="text-button"
                                                                          onClick={() =>
                                                                              openSprigEvidence(
                                                                                  evidence.recordType,
                                                                                  evidence.recordId,
                                                                              )
                                                                          }
                                                                      >
                                                                          {evidence.label} →
                                                                      </button>
                                                                  ) : (
                                                                      <strong>
                                                                          {evidence.label}
                                                                      </strong>
                                                                  )}

                                                                  {evidence.detail && (
                                                                      <>
                                                                          {' · '}
                                                                          {evidence.detail}
                                                                      </>
                                                                  )}
                                                              </li>
                                                          ),
                                                      )}
                                                  </ul>
                                              )}
                                          </details>

                                          {usefulActions.length > 0 && (
                                              <div className="plant-detail-intelligence-actions">
                                                  {usefulActions.map(
                                                      (
                                                          action,
                                                          index,
                                                      ) => (
                                                          <button
                                                              key={`${insight.id}-action-${action.type}-${index}`}
                                                              type="button"
                                                              className="text-button"
                                                              onClick={() =>
                                                                  handleSprigInsightAction(
                                                                      action,
                                                                  )
                                                              }
                                                          >
                                                              {action.label} →
                                                          </button>
                                                      ),
                                                  )}
                                              </div>
                                          )}
                                      </article>
                                  );
                              })}
                          </div>
                      </section>
                  )}

                  {/* OPTIONAL SPRIG SUGGESTIONS */}

                  <PlantSmartComparisons
                      plant={plant}
                      plants={plants}
                      growingPlaces={growingPlaces}
                      durationDisplayUnit={durationDisplayUnit}
                      onOpenPlant={onOpenPlant}
                      onComparePlants={onComparePlants}
                  />

                  {/* NOTES */}

                  <section className="story-section">
                      <div className="section-heading">
                          <div>
                              <p className="section-label">Garden notes</p>
                              <h2>What you wanted to remember</h2>
                          </div>
                      </div>

                      <div className="story-note-card">
                          <p>
                              {plant.notes ??
                                  'No notes yet. This story is waiting for its first observation.'}
                          </p>
                      </div>
                  </section>

                  {/* PHOTOGRAPHIC STORY */}

                  <section className="story-section">
                      <div className="section-heading">
                          <div>
                              <p className="section-label">Photographic Story</p>
                              <h2>This plant through the seasons</h2>
                              <p
                                  className="form-whisper"
                                  style={{ marginTop: '0.2rem', maxWidth: '42rem' }}
                              >
                                  Plant Story, Journal and Harvest photographs
                                  gathered into one album.
                              </p>
                          </div>

                          <button
                              type="button"
                              className="text-button"
                              onClick={openPhotoAdder}
                          >
                              + Add a photograph
                          </button>
                      </div>

                      {plantPhotographicStory.length > 0 ? (
                          <SprigPhotoGallery
                              photoUrls={plantPhotographicStoryPhotoUrls}
                              photoContexts={plantPhotographicStoryContexts}
                              durationDisplayUnit={durationDisplayUnit}
                              showDurationUnitPicker={false}
                              title={`${plant.displayName} photographic story`}
                              emptyMessage=""
                              photoAltPrefix={`${plant.displayName} photograph`}
                          />
                      ) : (
                          <div className="empty-story">
                              <span>📷</span>
                              <p>
                                  No photographs have been tucked
                                  into this plant&apos;s story yet.
                              </p>
                              <button
                                  type="button"
                                  className="text-button"
                                  onClick={openPhotoAdder}
                              >
                                  Add its first photograph
                              </button>
                          </div>
                      )}
                  </section>

                  {/* STORY SO FAR */}

                  <section className="story-section">
                      <div className="section-heading">
                          <div>
                              <p className="section-label">Timeline</p>
                              <h2>The story so far</h2>
                          </div>
                          <button
                              type="button"
                              className="text-button"
                              onClick={onAddEvent}
                          >
                              + Add a moment
                          </button>
                      </div>

                      <div className="timeline">
                          {storyTimeline.length > 0 ? (
                              storyTimeline.map(item => {
                                  if (item.kind === 'harvest') {
                                      const record = item.harvest;
                                      const amount = getHarvestTimelineAmount(record);

                                      return (
                                          <article
                                              className="timeline-entry"
                                              key={`harvest-${record.id}`}
                                              role="button"
                                              tabIndex={0}
                                              style={{
                                                  display: 'block',
                                                  padding: '0.8rem 0.9rem',
                                              }}
                                              onClick={() => onOpenHarvest(record.id)}
                                              onKeyDown={event => {
                                                  if (event.target !== event.currentTarget) return;
                                                  if (event.key === 'Enter' || event.key === ' ') {
                                                      event.preventDefault();
                                                      onOpenHarvest(record.id);
                                                  }
                                              }}
                                          >
                                              <div className="timeline-entry-header">
                                                  <div className="timeline-entry-meta">
                                                      <time>
                                                          {formatDate(record.date)}
                                                          {' · '}
                                                          {getPlantAgeText(record.date)}
                                                      </time>
                                                      <span className="entry-scope-label plant-entry-label">
                                                          Harvest
                                                      </span>
                                                  </div>
                                              </div>

                                              <h3>{getHarvestTimelineTitle(record)}</h3>
                                              {amount && (
                                                  <p className="event-product">
                                                      Gathered: {amount}
                                                  </p>
                                              )}
                                              {record.quality && (
                                                  <p>How it was: {formatLabel(record.quality)}</p>
                                              )}
                                              {record.notes && <p>{record.notes}</p>}

                                              {!!record.photoUrls?.length && (
                                                  <div
                                                      onClick={event => event.stopPropagation()}
                                                      onKeyDown={event => event.stopPropagation()}
                                                  >
                                                      <SprigPhotoGallery
                                                          photoUrls={record.photoUrls ?? []}
                                                          durationDisplayUnit={durationDisplayUnit}
                                                          showDurationUnitPicker={false}
                                                          title="Photographs from this harvest"
                                                          emptyMessage=""
                                                          photoAltPrefix={`${getHarvestTimelineTitle(record)} photograph`}
                                                      />
                                                  </div>
                                              )}

                                              <p className="form-whisper">Open Harvest Story →</p>
                                          </article>
                                      );
                                  }

                                  const record = item.event;

                                  return (
                                      <article
                                          className="timeline-entry"
                                          key={`event-${record.id}`}
                                          role="button"
                                          tabIndex={0}
                                          style={{
                                              display: 'block',
                                              padding: '0.8rem 0.9rem',
                                          }}
                                          onClick={() => onOpenJournalEntry(record.id)}
                                          onKeyDown={event => {
                                              if (event.target !== event.currentTarget) return;
                                              if (event.key === 'Enter' || event.key === ' ') {
                                                  event.preventDefault();
                                                  onOpenJournalEntry(record.id);
                                              }
                                          }}
                                      >
                                          <div className="timeline-entry-header">
                                              <div className="timeline-entry-meta">
                                                  <time>
                                                      {formatDate(record.date)}
                                                      {' · '}
                                                      {getPlantAgeText(record.date)}
                                                  </time>
                                                  <span
                                                      className={record.plantStoryIds.length === 0
                                                          ? 'entry-scope-label garden-entry-label'
                                                          : 'entry-scope-label plant-entry-label'}
                                                  >
                                                      {record.plantStoryIds.length === 0
                                                          ? 'Garden entry' : 'Plant entry'}
                                                  </span>
                                              </div>

                                              <button
                                                  type="button"
                                                  className="timeline-delete-button"
                                                  aria-label={`Remove ${record.title} from the garden journal`}
                                                  onClick={event => {
                                                      event.stopPropagation();
                                                      if (window.confirm(
                                                          'Remove this entry from the garden journal?',
                                                      )) {
                                                          onDeleteEvent(record.id);
                                                      }
                                                  }}
                                              >
                                                  Remove
                                              </button>
                                          </div>

                                          <h3>{record.title}</h3>
                                          {record.productUsed && (
                                              <p className="event-product">
                                                  Used: {record.productUsed}
                                              </p>
                                          )}
                                          {record.notes && <p>{record.notes}</p>}

                                          {!!record.photoUrls?.length && (
                                              <div
                                                  onClick={event => event.stopPropagation()}
                                                  onKeyDown={event => event.stopPropagation()}
                                              >
                                                  <SprigPhotoGallery
                                                      photoUrls={record.photoUrls ?? []}
                                                      durationDisplayUnit={durationDisplayUnit}
                                                      showDurationUnitPicker={false}
                                                      title="Photographs from this moment"
                                                      emptyMessage=""
                                                      photoAltPrefix={`${record.title} photograph`}
                                                  />
                                              </div>
                                          )}
                                      </article>
                                  );
                              })
                          ) : (
                              <div className="empty-story">
                                  <p>This story has only just opened its notebook.</p>
                                  <button
                                      type="button"
                                      className="text-button"
                                      onClick={onAddEvent}
                                  >
                                      Add its first moment
                                  </button>
                              </div>
                          )}
                      </div>
                  </section>

                  <div className="plant-detail-back-to-top">
                      <button
                          type="button"
                          className="text-button"
                          onClick={backToTop}
                      >
                          ↑ Back to top
                      </button>
                  </div>
              </div>
          </GardenLayout>

          {/* EDIT / VARIATION */}

          {isEditOpen && (
              <AddPlantForm
                  GrowingPlaces={growingPlaces}
                  GrowingSetups={growingSetups}
                  Ingredients={ingredients}
                  Products={products}
                  plantToEdit={plant}
                  onAddPlant={onAddPlant}
                  onUpdatePlant={onUpdatePlant}
                  onAddGrowingPlace={onAddGrowingPlace}
                  onAddRecipe={onAddRecipe}
                  onAddIngredient={onAddIngredient}
                  onAddProduct={onAddProduct}
                  onClose={() => setIsEditOpen(false)}
              />
          )}

          {isVariationOpen && (
              <AddPlantForm
                  GrowingPlaces={growingPlaces}
                  GrowingSetups={growingSetups}
                  Ingredients={ingredients}
                  Products={products}
                  variationFrom={plant}
                  onAddPlant={handleVariationCreated}
                  onUpdatePlant={onUpdatePlant}
                  onAddGrowingPlace={onAddGrowingPlace}
                  onAddRecipe={onAddRecipe}
                  onAddIngredient={onAddIngredient}
                  onAddProduct={onAddProduct}
                  onClose={() => setIsVariationOpen(false)}
              />
          )}

          {/* PHOTO WORKSPACE */}

          <SprigQuickPeek
              isOpen={isPhotoQuickAddOpen}
              onClose={closePhotoWorkspace}
              eyebrow={editingPlantPhotoIndex !== null
                  ? 'Plant Story photograph' : 'Plant Story'}
              title={editingPlantPhotoIndex !== null
                  ? 'Edit photograph' : 'Photographs'}
              subtitle={plant.displayName}
          >
              <SprigPhotoPicker
                  photoUrls={photoDraft}
                  onChange={setPhotoDraft}
                  photoDates={photoDateDraft}
                  onPhotoDatesChange={setPhotoDateDraft}
                  photoMetadata={photoMetadataDraft}
                  onPhotoMetadataChange={setPhotoMetadataDraft}
                  showPhotoContext
                  title={editingPlantPhotoIndex !== null
                      ? 'Photograph details' : 'Plant photographs'}
                  helperText={editingPlantPhotoIndex !== null
                      ? 'Change anything you want to remember about this photograph. Removing it here will remove it only from this Plant Story.'
                      : 'Add photographs directly to this Plant Story. Sprig already knows where they belong. Extra context is optional.'}
                  addButtonText={editingPlantPhotoIndex !== null
                      ? 'Choose replacement photograph' : 'Add photographs'}
                  photoAltPrefix={`${plant.displayName} photograph`}
                  photoDateLabel="When was this photograph taken?"
                  photoDateHelperText="Sprig uses this date to place the photograph at the right growing age and find useful comparisons."
                  defaultNewPhotosToToday={editingPlantPhotoIndex === null}
                  multiple={editingPlantPhotoIndex === null}
                  maxPhotos={editingPlantPhotoIndex !== null ? 1 : 20}
              />

              <button
                  type="button"
                  className="enter-button"
                  disabled={editingPlantPhotoIndex === null && photoDraft.length === 0}
                  onClick={savePhotos}
              >
                  {editingPlantPhotoIndex !== null
                      ? photoDraft.length > 0
                          ? 'Save photograph' : 'Remove photograph'
                      : 'Save photographs'}
              </button>
          </SprigQuickPeek>

          {/* TIMING REFERENCE */}

          <SprigQuickPeek
              isOpen={isHarvestTimingQuickPeekOpen}
              onClose={() => setIsHarvestTimingQuickPeekOpen(false)}
              eyebrow="Harvest timing"
              title="When should Sprig start counting?"
              subtitle="Tap a recorded date below to use it straight away, or enter another date of your own."
          >
              <div className="quick-peek-actions">
                  {plant.sownDate && (
                      <button
                          type="button"
                          className="secondary-button"
                          onClick={() => saveHarvestTimingReference('sown')}
                      >
                          {harvestTimingReference?.sourceType === 'sown' ? '✓ ' : '🌱 '}
                          Sown · {formatDate(plant.sownDate)}
                          {' · '}{getPlantAgeText(plant.sownDate)}
                          {harvestTimingReference?.sourceType === 'sown' && ' · Current'}
                      </button>
                  )}

                  <button
                      type="button"
                      className="secondary-button"
                      onClick={() => saveHarvestTimingReference('planted')}
                  >
                      {!harvestTimingReference ||
                      harvestTimingReference.sourceType === 'planted' ? '✓ ' : '🪴 '}
                      Planted · {formatDate(plant.plantedDate)}
                      {' · '}{getPlantAgeText(plant.plantedDate)}
                      {(!harvestTimingReference ||
                          harvestTimingReference.sourceType === 'planted') && ' · Current'}
                  </button>

                  {plant.plantedOutDate && (
                      <button
                          type="button"
                          className="secondary-button"
                          onClick={() => saveHarvestTimingReference('planted-out')}
                      >
                          {harvestTimingReference?.sourceType === 'planted-out' ? '✓ ' : '🌿 '}
                          Planted out · {formatDate(plant.plantedOutDate)}
                          {' · '}{getPlantAgeText(plant.plantedOutDate)}
                          {harvestTimingReference?.sourceType === 'planted-out' && ' · Current'}
                      </button>
                  )}

                  {harvestTimingMilestoneEvents.map(event => (
                      <button
                          type="button"
                          className="secondary-button"
                          key={event.id}
                          onClick={() =>
                              saveHarvestTimingReference('garden-event', event.id)
                          }
                      >
                          {harvestTimingReference?.sourceType === 'garden-event' &&
                          harvestTimingReference.eventId === event.id ? '✓ ' : '📖 '}
                          {event.title} · {formatDate(event.date)}
                          {' · '}{getPlantAgeText(event.date)}
                          {harvestTimingReference?.sourceType === 'garden-event' &&
                              harvestTimingReference.eventId === event.id && ' · Current'}
                      </button>
                  ))}
              </div>

              <div className="form-section">
                  <p className="section-label">Or use another date</p>
                  <p className="form-whisper">
                      If the right moment isn&apos;t recorded above,
                      enter another date for Sprig to count from.
                  </p>

                  <label>
                      Date
                      <input
                          type="date"
                          value={customHarvestTimingDate}
                          onChange={event => setCustomHarvestTimingDate(event.target.value)}
                      />
                  </label>

                  <label>
                      What happened? Optional
                      <input
                          type="text"
                          value={customHarvestTimingLabel}
                          placeholder="Approximate transplant date"
                          onChange={event => setCustomHarvestTimingLabel(event.target.value)}
                      />
                  </label>

                  <button
                      type="button"
                      className="enter-button"
                      disabled={!customHarvestTimingDate}
                      onClick={() => saveHarvestTimingReference('custom-date')}
                  >
                      Use this custom date
                  </button>
              </div>
          </SprigQuickPeek>

          {/* RECIPE QUICK PEEK */}

          {currentGrowingSetup && (
              <SprigQuickPeek
                  isOpen={isRecipeQuickPeekOpen}
                  onClose={() => setIsRecipeQuickPeekOpen(false)}
                  eyebrow="Growing Recipe"
                  title={currentGrowingSetup.name}
                  subtitle={getGrowingSetupCategoryLabel(currentGrowingSetup)}
              >
                  {currentGrowingSetup.category === 'own-mix' && (
                      <>
                          <h3>What&apos;s in this mix</h3>
                          {currentRecipeIngredients.length > 0 ? (
                              <ul>
                                  {currentRecipeIngredients.map(ingredient => (
                                      <li key={ingredient.id}>{ingredient.name}</li>
                                  ))}
                              </ul>
                          ) : (
                              <p>No ingredients have been recorded for this recipe yet.</p>
                          )}
                      </>
                  )}

                  {currentGrowingSetup.notes && (
                      <>
                          <h3>Notes</h3>
                          <p>{currentGrowingSetup.notes}</p>
                      </>
                  )}
              </SprigQuickPeek>
          )}
      </>
  );
}