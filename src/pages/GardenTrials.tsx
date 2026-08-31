import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import GardenLayout from '../components/layout/GardenLayout';
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery';
import SprigPhotoPicker from '../components/photos/SprigPhotoPicker';

import type {
    GardenData,
    GardenTrial,
    GardenTrialObservation,
    GardenTrialResult,
    GardenTrialStatus,
    GardenTrialTimingUnit,
    KnowledgeRelationship,
    KnowledgeRelationshipTargetType,
} from '../types';

import type {
    AppPage,
} from '../types/navigation';

import '../css/garden-trials.css';

interface GardenTrialsProps {
    gardenData: GardenData;
    initialTrialId?: string | null;
    journeyBackLabel?: string | null;
    onJourneyBack?: () => void;
    onGardenDataChange: (
        gardenData: GardenData,
    ) => void;
    onTrialSelectionChange: (
        trialId: string | null,
    ) => void;
    onNavigate: (
        page: AppPage,
    ) => void;
    onOpenRelationship: (
        targetType: KnowledgeRelationshipTargetType,
        targetId: string,
    ) => void;
}

interface RelationshipOption {
    targetType: KnowledgeRelationshipTargetType;
    targetId: string;
    label: string;
    group: string;
    searchText: string;
}

interface TrialDraft {
    title: string;
    startDate: string;
    completedDate: string;
    status: GardenTrialStatus;

    expectedDurationValue: string;
    expectedDurationUnit: GardenTrialTimingUnit;
    expectedFinishDate: string;
    timingReason: string;

    purpose: string;
    question: string;
    expectation: string;
    whatIsChanging: string;
    whatShouldStayComparable: string;
    watchingFor: string;

    result: GardenTrialResult | '';
    conclusion: string;
    nextTime: string;

    photoUrls: string[];
    photoDates: Array<string | undefined>;
}

interface EvidencePhoto {
    key: string;
    photoUrl: string;
    date?: string;
    sourceLabel: string;
    targetType: KnowledgeRelationshipTargetType;
    targetId: string;
}

const RESULT_OPTIONS: Array<{
    value: GardenTrialResult;
    label: string;
    helper: string;
}> = [
    {
        value: 'clear',
        label: 'Clear',
        helper:
            'The Trial gave you a fairly clear answer.',
    },
    {
        value: 'mixed',
        label: 'Mixed',
        helper:
            'Some evidence pointed one way and some another.',
    },
    {
        value: 'inconclusive',
        label: 'Inconclusive',
        helper:
            'There was not enough clean evidence to decide.',
    },
    {
        value: 'interrupted',
        label: 'Interrupted',
        helper:
            'Something stopped the Trial before it could answer the question.',
    },
];

const TIMING_UNIT_OPTIONS: Array<{
    value: GardenTrialTimingUnit;
    label: string;
}> = [
    {
        value: 'days',
        label: 'days',
    },
    {
        value: 'weeks',
        label: 'weeks',
    },
    {
        value: 'months',
        label: 'months',
    },
];

function getToday(): string {
    return new Date()
        .toISOString()
        .slice(
            0,
            10,
        );
}

function getNow(): string {
    return new Date()
        .toISOString();
}

function formatDate(
    date?: string,
): string {
    if (!date) {
        return 'Not recorded';
    }

    const safeDate =
        date.slice(
            0,
            10,
        );

    const parsed =
        new Date(
            `${safeDate}T00:00:00`,
        );

    if (
        Number.isNaN(
            parsed.getTime(),
        )
    ) {
        return date;
    }

    return parsed.toLocaleDateString(
        'en-AU',
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        },
    );
}

function normalise(
    value: string,
): string {
    return value
        .trim()
        .toLocaleLowerCase(
            'en-AU',
        );
}

function cleanOptional(
    value: string,
): string | undefined {
    const trimmed =
        value.trim();

    return (
        trimmed ||
        undefined
    );
}

function searchableText(
    values:
        Array<
            string |
            undefined
        >,
): string {
    return normalise(
        values
            .filter(
                Boolean,
            )
            .join(
                ' ',
            ),
    );
}

function statusLabel(
    status: GardenTrialStatus,
): string {
    switch (status) {
        case 'active':
            return 'Quietly unfolding';

        case 'completed':
            return 'Story gathered';

        case 'set-aside':
            return 'Set aside';

        default:
            return 'Garden Trial';
    }
}

function resultLabel(
    result?: GardenTrialResult,
): string {
    switch (result) {
        case 'clear':
            return 'Clear result';

        case 'mixed':
            return 'Mixed result';

        case 'inconclusive':
            return 'Inconclusive';

        case 'interrupted':
            return 'Interrupted';

        default:
            return 'Result not recorded';
    }
}

function durationLabel(
    trial: GardenTrial,
): string | undefined {
    if (
        trial.expectedDurationValue ===
            undefined ||
        !trial.expectedDurationUnit
    ) {
        return undefined;
    }

    const value =
        trial.expectedDurationValue;

    const unit =
        value === 1
            ? trial.expectedDurationUnit ===
                'days'
                ? 'day'
                : trial.expectedDurationUnit ===
                    'weeks'
                    ? 'week'
                    : 'month'
            : trial.expectedDurationUnit;

    return `${value} ${unit}`;
}

function addDurationToDate(
    startDate: string,
    valueText: string,
    unit:
        GardenTrialTimingUnit,
): string {
    const value =
        Number(
            valueText,
        );

    if (
        !startDate ||
        !Number.isFinite(
            value,
        ) ||
        value <= 0
    ) {
        return '';
    }

    const date =
        new Date(
            `${startDate}T00:00:00`,
        );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return '';
    }

    if (
        unit ===
        'days'
    ) {
        date.setDate(
            date.getDate() +
                value,
        );
    }

    if (
        unit ===
        'weeks'
    ) {
        date.setDate(
            date.getDate() +
                value * 7,
        );
    }

    if (
        unit ===
        'months'
    ) {
        date.setMonth(
            date.getMonth() +
                value,
        );
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() +
                1,
        ).padStart(
            2,
            '0',
        );

    const day =
        String(
            date.getDate(),
        ).padStart(
            2,
            '0',
        );

    return `${year}-${month}-${day}`;
}

function safeFileName(
    value: string,
): string {
    return (
        value
            .trim()
            .replace(
                /[^a-z0-9]+/gi,
                '-',
            )
            .replace(
                /^-+|-+$/g,
                '',
            )
            .toLowerCase() ||
        'garden-trial'
    );
}

function escapeRtf(
    value: string,
): string {
    return value
        .replace(
            /\\/g,
            '\\\\',
        )
        .replace(
            /{/g,
            '\\{',
        )
        .replace(
            /}/g,
            '\\}',
        )
        .replace(
            /\r?\n/g,
            '\\line ',
        );
}

function downloadBlob(
    filename: string,
    blob: Blob,
): void {
    const url =
        URL.createObjectURL(
            blob,
        );

    const anchor =
        document.createElement(
            'a',
        );

    anchor.href =
        url;

    anchor.download =
        filename;

    document.body.appendChild(
        anchor,
    );

    anchor.click();

    anchor.remove();

    window.setTimeout(
        () =>
            URL.revokeObjectURL(
                url,
            ),
        1000,
    );
}

function makeEmptyDraft(): TrialDraft {
    return {
        title: '',
        startDate:
            getToday(),
        completedDate: '',
        status: 'active',

        expectedDurationValue:
            '',
        expectedDurationUnit:
            'weeks',
        expectedFinishDate:
            '',
        timingReason: '',

        purpose: '',
        question: '',
        expectation: '',
        whatIsChanging: '',
        whatShouldStayComparable:
            '',
        watchingFor: '',

        result: '',
        conclusion: '',
        nextTime: '',

        photoUrls: [],
        photoDates: [],
    };
}

function makeDraftFromTrial(
    trial: GardenTrial,
): TrialDraft {
    return {
        title:
            trial.title,

        startDate:
            trial.startDate,

        completedDate:
            trial.completedDate ??
            '',

        status:
            trial.status,

        expectedDurationValue:
            trial.expectedDurationValue ===
            undefined
                ? ''
                : String(
                      trial.expectedDurationValue,
                  ),

        expectedDurationUnit:
            trial.expectedDurationUnit ??
            'weeks',

        expectedFinishDate:
            trial.expectedFinishDate ??
            '',

        timingReason:
            trial.timingReason ??
            '',

        purpose:
            trial.purpose ??
            '',

        question:
            trial.question ??
            '',

        expectation:
            trial.expectation ??
            '',

        whatIsChanging:
            trial.whatIsChanging ??
            '',

        whatShouldStayComparable:
            trial.whatShouldStayComparable ??
            '',

        watchingFor:
            trial.watchingFor ??
            '',

        result:
            trial.result ??
            '',

        conclusion:
            trial.conclusion ??
            '',

        nextTime:
            trial.nextTime ??
            '',

        photoUrls:
            trial.photoUrls ??
            [],

        photoDates:
            (
                trial.photoUrls ??
                []
            ).map(
                (
                    _photoUrl,
                    index,
                ) =>
                    trial.photoDates?.[
                        index
                    ],
            ),
    };
}

function getRelationshipOptions(
    gardenData:
        GardenData,
): RelationshipOption[] {
    const options:
        RelationshipOption[] =
        [];

    gardenData.plantStories.forEach(
        plant => {
            options.push({
                targetType:
                    'plant-story',

                targetId:
                    plant.id,

                label:
                    plant.displayName ||
                    plant.variety ||
                    plant.plantName,

                group:
                    'Plant Stories',

                searchText:
                    searchableText([
                        plant.displayName,
                        plant.plantName,
                        plant.variety,
                        plant.personality,
                        plant.notes,
                        ...(
                            plant.tags ??
                            []
                        ),
                    ]),
            });
        },
    );

    gardenData.events.forEach(
        event => {
            const plantNames =
                event.plantStoryIds
                    .map(
                        plantId =>
                            gardenData.plantStories.find(
                                plant =>
                                    plant.id ===
                                    plantId,
                            ),
                    )
                    .filter(
                        Boolean,
                    )
                    .map(
                        plant =>
                            plant?.displayName ||
                            plant?.variety ||
                            plant?.plantName ||
                            '',
                    )
                    .filter(
                        Boolean,
                    );

            options.push({
                targetType:
                    'garden-event',

                targetId:
                    event.id,

                label:
                    `${event.title} · ${formatDate(
                        event.date,
                    )}`,

                group:
                    'Journal',

                searchText:
                    searchableText([
                        event.title,
                        event.notes,
                        event.date,
                        ...plantNames,
                    ]),
            });
        },
    );

    gardenData.harvests.forEach(
        harvest => {
            const plantNames =
                harvest.plantStoryIds
                    .map(
                        plantId =>
                            gardenData.plantStories.find(
                                plant =>
                                    plant.id ===
                                    plantId,
                            ),
                    )
                    .filter(
                        Boolean,
                    )
                    .map(
                        plant =>
                            plant?.displayName ||
                            plant?.variety ||
                            plant?.plantName ||
                            '',
                    )
                    .filter(
                        Boolean,
                    );

            options.push({
                targetType:
                    'harvest',

                targetId:
                    harvest.id,

                label:
                    plantNames.length >
                    0
                        ? `${plantNames.join(
                              ', ',
                          )} · ${formatDate(
                              harvest.date,
                          )}`
                        : `Harvest · ${formatDate(
                              harvest.date,
                          )}`,

                group:
                    'Harvests',

                searchText:
                    searchableText([
                        harvest.date,
                        harvest.notes,
                        harvest.harvestType,
                        harvest.quality,
                        ...plantNames,
                    ]),
            });
        },
    );

    gardenData.plans.forEach(
        plan => {
            options.push({
                targetType:
                    'plan',

                targetId:
                    plan.id,

                label:
                    plan.title,

                group:
                    'Plans',

                searchText:
                    searchableText([
                        plan.title,
                        plan.notes,
                        plan.kind,
                        plan.date,
                        plan.endDate,
                        plan.plannedPlant
                            ?.plantName,
                        plan.plannedPlant
                            ?.variety,
                    ]),
            });
        },
    );

    gardenData.growingPlaces.forEach(
        place => {
            options.push({
                targetType:
                    'growing-place',

                targetId:
                    place.id,

                label:
                    place.name,

                group:
                    'Growing Places',

                searchText:
                    searchableText([
                        place.name,
                        place.kind,
                        place.customKindLabel,
                        place.notes,
                        place.aspect,
                        place.sunlight,
                        place.shelter,
                    ]),
            });
        },
    );

    gardenData.growingSetups.forEach(
        setup => {
            options.push({
                targetType:
                    'growing-setup',

                targetId:
                    setup.id,

                label:
                    setup.name,

                group:
                    'Growing Recipes',

                searchText:
                    searchableText([
                        setup.name,
                        setup.category,
                        setup.brand,
                        setup.productName,
                        setup.notes,
                        setup.groundType,
                        setup.growingSystemType,
                    ]),
            });
        },
    );

    gardenData.ingredients.forEach(
        ingredient => {
            options.push({
                targetType:
                    'ingredient',

                targetId:
                    ingredient.id,

                label:
                    ingredient.name,

                group:
                    'Ingredients',

                searchText:
                    searchableText([
                        ingredient.name,
                        ingredient.category,
                        ingredient.customCategoryLabel,
                        ingredient.manufacturer,
                        ingredient.source,
                        ingredient.notes,
                    ]),
            });
        },
    );

    gardenData.products.forEach(
        product => {
            options.push({
                targetType:
                    'product',

                targetId:
                    product.id,

                label:
                    product.name,

                group:
                    'Products',

                searchText:
                    searchableText([
                        product.name,
                        product.category,
                        product.customCategoryLabel,
                        product.brand,
                        product.productName,
                        product.notes,
                    ]),
            });
        },
    );

    gardenData.purchases.forEach(
        purchase => {
            options.push({
                targetType:
                    'purchase',

                targetId:
                    purchase.id,

                label:
                    `${purchase.itemName} · ${formatDate(
                        purchase.date,
                    )}`,

                group:
                    'Purchases',

                searchText:
                    searchableText([
                        purchase.itemName,
                        purchase.date,
                        purchase.supplier,
                        purchase.brand,
                        purchase.notes,
                    ]),
            });
        },
    );

    (
        gardenData.gardenNotes ??
        []
    ).forEach(
        note => {
            options.push({
                targetType:
                    'garden-note',

                targetId:
                    note.id,

                label:
                    note.title?.trim() ||
                    note.body
                        .split(
                            /\r?\n/,
                        )
                        .find(
                            Boolean,
                        ) ||
                    'Garden Note',

                group:
                    'Garden Notes',

                searchText:
                    searchableText([
                        note.title,
                        note.body,
                        note.noteDate,
                        note.sourceLabel,
                    ]),
            });
        },
    );

    (
        gardenData.plantReferences ??
        []
    ).forEach(
        reference => {
            const label =
                [
                    reference.plantName,
                    reference.variety,
                ]
                    .filter(
                        Boolean,
                    )
                    .join(
                        ' · ',
                    );

            options.push({
                targetType:
                    'plant-reference',

                targetId:
                    reference.id,

                label,

                group:
                    'Plant Reference',

                searchText:
                    searchableText([
                        reference.plantName,
                        reference.variety,
                        reference.notes,
                        reference.referenceDate,
                        ...(
                            reference.aliases ??
                            []
                        ),
                    ]),
            });
        },
    );

    (
        gardenData.savedKnowledgeSources ??
        []
    ).forEach(
        source => {
            options.push({
                targetType:
                    'saved-source',

                targetId:
                    source.id,

                label:
                    source.title,

                group:
                    'Tips & Sources',

                searchText:
                    searchableText([
                        source.title,
                        source.sourceName,
                        source.excerpt,
                        source.notes,
                        source.savedDate,
                    ]),
            });
        },
    );

    (
        gardenData.savedComparisons ??
        []
    ).forEach(
        comparison => {
            options.push({
                targetType:
                    'comparison',

                targetId:
                    comparison.id,

                label:
                    comparison.name,

                group:
                    'Comparisons',

                searchText:
                    searchableText([
                        comparison.name,
                    ]),
            });
        },
    );

    return options.sort(
        (
            first,
            second,
        ) => {
            const groupDifference =
                first.group.localeCompare(
                    second.group,
                );

            if (
                groupDifference !==
                0
            ) {
                return groupDifference;
            }

            return first.label.localeCompare(
                second.label,
            );
        },
    );
}

function getRelationshipLabel(
    gardenData:
        GardenData,
    relationship:
        KnowledgeRelationship,
): string {
    if (
        relationship.label?.trim()
    ) {
        return relationship.label.trim();
    }

    const option =
        getRelationshipOptions(
            gardenData,
        ).find(
            candidate =>
                candidate.targetType ===
                    relationship.targetType &&
                candidate.targetId ===
                    relationship.targetId,
        );

    return (
        option?.label ??
        'Sprig record'
    );
}

function getEvidencePhotos(
    gardenData:
        GardenData,
    trial:
        GardenTrial,
): EvidencePhoto[] {
    const photos:
        EvidencePhoto[] =
        [];

    function pushPhotos(
        relationship:
            KnowledgeRelationship,
        urls:
            string[] |
            undefined,
        dates:
            Array<
                string |
                undefined
            > |
            undefined,
        fallbackDate:
            string |
            undefined,
        sourceLabel:
            string,
    ) {
        (
            urls ??
            []
        ).forEach(
            (
                photoUrl,
                index,
            ) => {
                photos.push({
                    key:
                        `${relationship.targetType}:${relationship.targetId}:${index}`,

                    photoUrl,

                    date:
                        dates?.[
                            index
                        ] ??
                        fallbackDate,

                    sourceLabel,

                    targetType:
                        relationship.targetType,

                    targetId:
                        relationship.targetId,
                });
            },
        );
    }

    (
        trial.relationships ??
        []
    ).forEach(
        relationship => {
            const label =
                getRelationshipLabel(
                    gardenData,
                    relationship,
                );

            if (
                relationship.targetType ===
                'plant-story'
            ) {
                const record =
                    gardenData.plantStories.find(
                        item =>
                            item.id ===
                            relationship.targetId,
                    );

                pushPhotos(
                    relationship,
                    record?.photoUrls,
                    record?.photoDates,
                    record?.plantedDate,
                    label,
                );

                return;
            }

            if (
                relationship.targetType ===
                'garden-event'
            ) {
                const record =
                    gardenData.events.find(
                        item =>
                            item.id ===
                            relationship.targetId,
                    );

                pushPhotos(
                    relationship,
                    record?.photoUrls,
                    undefined,
                    record?.date,
                    label,
                );

                return;
            }

            if (
                relationship.targetType ===
                'harvest'
            ) {
                const record =
                    gardenData.harvests.find(
                        item =>
                            item.id ===
                            relationship.targetId,
                    );

                pushPhotos(
                    relationship,
                    record?.photoUrls,
                    undefined,
                    record?.date,
                    label,
                );

                return;
            }

            if (
                relationship.targetType ===
                'growing-place'
            ) {
                const record =
                    gardenData.growingPlaces.find(
                        item =>
                            item.id ===
                            relationship.targetId,
                    );

                pushPhotos(
                    relationship,
                    record?.photoUrls,
                    undefined,
                    undefined,
                    label,
                );

                return;
            }

            if (
                relationship.targetType ===
                'growing-setup'
            ) {
                const record =
                    gardenData.growingSetups.find(
                        item =>
                            item.id ===
                            relationship.targetId,
                    );

                pushPhotos(
                    relationship,
                    record?.photoUrls,
                    undefined,
                    undefined,
                    label,
                );

                return;
            }

            if (
                relationship.targetType ===
                'ingredient'
            ) {
                const record =
                    gardenData.ingredients.find(
                        item =>
                            item.id ===
                            relationship.targetId,
                    );

                pushPhotos(
                    relationship,
                    record?.photoUrls,
                    undefined,
                    undefined,
                    label,
                );

                return;
            }

            if (
                relationship.targetType ===
                'product'
            ) {
                const record =
                    gardenData.products.find(
                        item =>
                            item.id ===
                            relationship.targetId,
                    );

                pushPhotos(
                    relationship,
                    record?.photoUrls,
                    undefined,
                    undefined,
                    label,
                );

                return;
            }

            if (
                relationship.targetType ===
                'purchase'
            ) {
                const record =
                    gardenData.purchases.find(
                        item =>
                            item.id ===
                            relationship.targetId,
                    );

                pushPhotos(
                    relationship,
                    record?.photoUrls,
                    undefined,
                    record?.date,
                    label,
                );

                return;
            }

            if (
                relationship.targetType ===
                'garden-note'
            ) {
                const record =
                    (
                        gardenData.gardenNotes ??
                        []
                    ).find(
                        item =>
                            item.id ===
                            relationship.targetId,
                    );

                pushPhotos(
                    relationship,
                    record?.photoUrls,
                    undefined,
                    record?.noteDate,
                    label,
                );

                return;
            }

            if (
                relationship.targetType ===
                'plant-reference'
            ) {
                const record =
                    (
                        gardenData.plantReferences ??
                        []
                    ).find(
                        item =>
                            item.id ===
                            relationship.targetId,
                    );

                pushPhotos(
                    relationship,
                    record?.photoUrls,
                    undefined,
                    record?.referenceDate,
                    label,
                );

                return;
            }

            if (
                relationship.targetType ===
                'saved-source'
            ) {
                const record =
                    (
                        gardenData.savedKnowledgeSources ??
                        []
                    ).find(
                        item =>
                            item.id ===
                            relationship.targetId,
                    );

                pushPhotos(
                    relationship,
                    record?.photoUrls,
                    undefined,
                    record?.savedDate,
                    label,
                );
            }
        },
    );

    return photos;
}

function buildTrialPlainText(
    gardenData:
        GardenData,
    trial:
        GardenTrial,
): string {
    const relationships =
        trial.relationships ??
        [];

    const observations =
        [
            ...(
                trial.observations ??
                []
            ),
        ].sort(
            (
                first,
                second,
            ) =>
                first.date.localeCompare(
                    second.date,
                ),
        );

    const lines:
        string[] =
        [
            trial.title,
            '',
            `Status: ${statusLabel(
                trial.status,
            )}`,
            `Started: ${formatDate(
                trial.startDate,
            )}`,
        ];

    const duration =
        durationLabel(
            trial,
        );

    if (
        duration
    ) {
        lines.push(
            `Expected duration: ${duration}`,
        );
    }

    if (
        trial.expectedFinishDate
    ) {
        lines.push(
            `Expected finish: ${formatDate(
                trial.expectedFinishDate,
            )}`,
        );
    }

    if (
        trial.completedDate
    ) {
        lines.push(
            `Completed: ${formatDate(
                trial.completedDate,
            )}`,
        );
    }

    function addSection(
        heading:
            string,
        body?:
            string,
    ) {
        if (
            !body?.trim()
        ) {
            return;
        }

        lines.push(
            '',
            heading,
            body.trim(),
        );
    }

    addSection(
        'Why does the timing matter?',
        trial.timingReason,
    );

    addSection(
        'Why am I trying this?',
        trial.purpose,
    );

    addSection(
        'What am I hoping to find out?',
        trial.question,
    );

    addSection(
        'What do I think might happen?',
        trial.expectation,
    );

    addSection(
        'What am I changing?',
        trial.whatIsChanging,
    );

    addSection(
        'What am I keeping comparable?',
        trial.whatShouldStayComparable,
    );

    addSection(
        'What am I watching for?',
        trial.watchingFor,
    );

    if (
        (
            trial.photoUrls ??
            []
        ).length >
        0
    ) {
        lines.push(
            '',
            'Trial photographs',
            `${trial.photoUrls?.length ?? 0} photograph(s) attached to this Trial.`,
        );
    }

    if (
        relationships.length >
        0
    ) {
        lines.push(
            '',
            'Evidence from Sprig',
        );

        relationships.forEach(
            relationship => {
                lines.push(
                    `• ${getRelationshipLabel(
                        gardenData,
                        relationship,
                    )}`,
                );
            },
        );
    }

    if (
        observations.length >
        0
    ) {
        lines.push(
            '',
            'Trial observations',
        );

        observations.forEach(
            observation => {
                lines.push(
                    `${formatDate(
                        observation.date,
                    )}: ${observation.body}`,
                );

                if (
                    (
                        observation.photoUrls ??
                        []
                    ).length >
                    0
                ) {
                    lines.push(
                        `  ${observation.photoUrls?.length ?? 0} photograph(s) attached.`,
                    );
                }
            },
        );
    }

    if (
        trial.result
    ) {
        lines.push(
            '',
            `Result clarity: ${resultLabel(
                trial.result,
            )}`,
        );
    }

    addSection(
        'Conclusion',
        trial.conclusion,
    );

    addSection(
        'What I would try next time',
        trial.nextTime,
    );

    lines.push(
        '',
        'Exported from Sprig',
    );

    return lines.join(
        '\n',
    );
}

function exportTrialRtf(
    gardenData:
        GardenData,
    trial:
        GardenTrial,
): void {
    const plainText =
        buildTrialPlainText(
            gardenData,
            trial,
        );

    const lines =
        plainText.split(
            '\n',
        );

    const sectionHeadings =
        new Set([
            'Why does the timing matter?',
            'Why am I trying this?',
            'What am I hoping to find out?',
            'What do I think might happen?',
            'What am I changing?',
            'What am I keeping comparable?',
            'What am I watching for?',
            'Trial photographs',
            'Evidence from Sprig',
            'Trial observations',
            'Conclusion',
            'What I would try next time',
        ]);

    const body =
        lines
            .map(
                (
                    line,
                    index,
                ) => {
                    const escaped =
                        escapeRtf(
                            line,
                        );

                    if (
                        index ===
                        0
                    ) {
                        return `\\fs32\\b ${escaped}\\b0\\fs24\\par`;
                    }

                    if (
                        sectionHeadings.has(
                            line,
                        ) ||
                        line.startsWith(
                            'Result clarity:',
                        )
                    ) {
                        return `\\b ${escaped}\\b0\\par`;
                    }

                    return `${escaped}\\par`;
                },
            )
            .join(
                '\n',
            );

    const rtf =
        `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Georgia;}}
\\f0\\fs24
${body}
}`;

    downloadBlob(
        `${safeFileName(
            trial.title,
        )}.rtf`,
        new Blob(
            [
                rtf,
            ],
            {
                type:
                    'application/rtf',
            },
        ),
    );
}

function printTrial(): void {
    window.print();
}

function TrialEditor({
    initialDraft,
    heading,
    saveLabel,
    onCancel,
    onSave,
}: {
    initialDraft:
        TrialDraft;
    heading:
        string;
    saveLabel:
        string;
    onCancel:
        () => void;
    onSave:
        (
            draft:
                TrialDraft,
        ) => void;
}) {
    const [
        draft,
        setDraft,
    ] =
        useState(
            initialDraft,
        );

    useEffect(
        () => {
            setDraft(
                initialDraft,
            );
        },
        [
            initialDraft,
        ],
    );

    function updateTiming(
        next:
            Partial<
                Pick<
                    TrialDraft,
                    | 'startDate'
                    | 'expectedDurationValue'
                    | 'expectedDurationUnit'
                >
            >,
    ) {
        setDraft(
            current => {
                const merged = {
                    ...current,
                    ...next,
                };

                const calculatedFinish =
                    addDurationToDate(
                        merged.startDate,
                        merged.expectedDurationValue,
                        merged.expectedDurationUnit,
                    );

                return {
                    ...merged,

                    expectedFinishDate:
                        calculatedFinish ||
                        merged.expectedFinishDate,
                };
            },
        );
    }

    const canSave =
        Boolean(
            draft.title.trim() &&
            draft.startDate,
        );

    return (
        <section className="sprig-trial-editor sprig-trial-paper">
            <div className="sprig-trial-section-heading">
                <div>
                    <p className="section-label">
                        Garden Trial
                    </p>

                    <h2>
                        {heading}
                    </h2>
                </div>
            </div>

            <div className="sprig-trial-editor-grid">
                <label className="sprig-trial-field sprig-trial-field--wide">
                    <span>
                        Trial title
                    </span>

                    <input
                        type="text"
                        value={
                            draft.title
                        }
                        onChange={
                            event =>
                                setDraft(
                                    current => ({
                                        ...current,
                                        title:
                                            event
                                                .target
                                                .value,
                                    }),
                                )
                        }
                        placeholder="Winter potato position trial"
                    />
                </label>

                <label className="sprig-trial-field">
                    <span>
                        Started
                    </span>

                    <input
                        type="date"
                        value={
                            draft.startDate
                        }
                        onChange={
                            event =>
                                updateTiming({
                                    startDate:
                                        event
                                            .target
                                            .value,
                                })
                        }
                    />
                </label>

                <label className="sprig-trial-field">
                    <span>
                        Status
                    </span>

                    <select
                        value={
                            draft.status
                        }
                        onChange={
                            event =>
                                setDraft(
                                    current => ({
                                        ...current,
                                        status:
                                            event
                                                .target
                                                .value as GardenTrialStatus,
                                    }),
                                )
                        }
                    >
                        <option value="active">
                            Quietly unfolding
                        </option>

                        <option value="completed">
                            Story gathered
                        </option>

                        <option value="set-aside">
                            Set aside
                        </option>
                    </select>
                </label>
            </div>

            <section className="sprig-trial-editor-section">
                <p className="section-label">
                    Trial timing
                </p>

                <h3>
                    Only when time matters
                </h3>

                <p className="sprig-trial-muted">
                    Leave this completely blank if the Trial has no useful
                    time frame. Garden experiments are allowed to be loose
                    around the edges.
                </p>

                <div className="sprig-trial-timing-grid">
                    <label className="sprig-trial-field">
                        <span>
                            Expected duration
                            <small>
                                optional
                            </small>
                        </span>

                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                                draft.expectedDurationValue
                            }
                            onChange={
                                event =>
                                    updateTiming({
                                        expectedDurationValue:
                                            event
                                                .target
                                                .value,
                                    })
                            }
                            placeholder="16"
                        />
                    </label>

                    <label className="sprig-trial-field">
                        <span>
                            Unit
                            <small>
                                optional
                            </small>
                        </span>

                        <select
                            value={
                                draft.expectedDurationUnit
                            }
                            onChange={
                                event =>
                                    updateTiming({
                                        expectedDurationUnit:
                                            event
                                                .target
                                                .value as GardenTrialTimingUnit,
                                    })
                            }
                        >
                            {TIMING_UNIT_OPTIONS.map(
                                option => (
                                    <option
                                        key={
                                            option.value
                                        }
                                        value={
                                            option.value
                                        }
                                    >
                                        {
                                            option.label
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </label>

                    <label className="sprig-trial-field">
                        <span>
                            Expected finish
                            <small>
                                optional · editable
                            </small>
                        </span>

                        <input
                            type="date"
                            value={
                                draft.expectedFinishDate
                            }
                            onChange={
                                event =>
                                    setDraft(
                                        current => ({
                                            ...current,
                                            expectedFinishDate:
                                                event
                                                    .target
                                                    .value,
                                        }),
                                    )
                            }
                        />
                    </label>
                </div>

                <label className="sprig-trial-field sprig-trial-field--wide">
                    <span>
                        Why does the timing or season matter?
                        <small>
                            optional
                        </small>
                    </span>

                    <textarea
                        rows={3}
                        value={
                            draft.timingReason
                        }
                        onChange={
                            event =>
                                setDraft(
                                    current => ({
                                        ...current,
                                        timingReason:
                                            event
                                                .target
                                                .value,
                                    }),
                                )
                        }
                        placeholder="For example: testing whether the warmer west wall improves winter potato growth."
                    />
                </label>
            </section>

            <div className="sprig-trial-editor-grid">
                <label className="sprig-trial-field sprig-trial-field--wide">
                    <span>
                        Why am I trying this?
                    </span>

                    <textarea
                        rows={3}
                        value={
                            draft.purpose
                        }
                        onChange={
                            event =>
                                setDraft(
                                    current => ({
                                        ...current,
                                        purpose:
                                            event
                                                .target
                                                .value,
                                    }),
                                )
                        }
                        placeholder="Why this experiment matters to you."
                    />
                </label>

                <label className="sprig-trial-field sprig-trial-field--wide">
                    <span>
                        What am I hoping to find out?
                    </span>

                    <textarea
                        rows={3}
                        value={
                            draft.question
                        }
                        onChange={
                            event =>
                                setDraft(
                                    current => ({
                                        ...current,
                                        question:
                                            event
                                                .target
                                                .value,
                                    }),
                                )
                        }
                        placeholder="The question this Trial is trying to answer."
                    />
                </label>

                <label className="sprig-trial-field sprig-trial-field--wide">
                    <span>
                        What do I think might happen?
                    </span>

                    <textarea
                        rows={3}
                        value={
                            draft.expectation
                        }
                        onChange={
                            event =>
                                setDraft(
                                    current => ({
                                        ...current,
                                        expectation:
                                            event
                                                .target
                                                .value,
                                    }),
                                )
                        }
                        placeholder="Your current expectation or hunch."
                    />
                </label>

                <label className="sprig-trial-field sprig-trial-field--wide">
                    <span>
                        What am I changing?
                    </span>

                    <textarea
                        rows={4}
                        value={
                            draft.whatIsChanging
                        }
                        onChange={
                            event =>
                                setDraft(
                                    current => ({
                                        ...current,
                                        whatIsChanging:
                                            event
                                                .target
                                                .value,
                                    }),
                                )
                        }
                        placeholder="The deliberate difference between the things you are comparing."
                    />
                </label>

                <label className="sprig-trial-field sprig-trial-field--wide">
                    <span>
                        What am I keeping comparable?
                    </span>

                    <textarea
                        rows={4}
                        value={
                            draft.whatShouldStayComparable
                        }
                        onChange={
                            event =>
                                setDraft(
                                    current => ({
                                        ...current,
                                        whatShouldStayComparable:
                                            event
                                                .target
                                                .value,
                                    }),
                                )
                        }
                        placeholder="The parts you want to keep reasonably alike."
                    />
                </label>

                <label className="sprig-trial-field sprig-trial-field--wide">
                    <span>
                        What am I watching for?
                    </span>

                    <textarea
                        rows={4}
                        value={
                            draft.watchingFor
                        }
                        onChange={
                            event =>
                                setDraft(
                                    current => ({
                                        ...current,
                                        watchingFor:
                                            event
                                                .target
                                                .value,
                                    }),
                                )
                        }
                        placeholder="Growth, timing, survival, yield, flavour, disease, size..."
                    />
                </label>
            </div>

            <section className="sprig-trial-editor-section">
                <p className="section-label">
                    Trial photographs
                </p>

                <h3>
                    Visual evidence that belongs to the experiment
                </h3>

                <SprigPhotoPicker
                    photoUrls={
                        draft.photoUrls
                    }
                    onChange={
                        photoUrls =>
                            setDraft(
                                current => ({
                                    ...current,

                                    photoUrls,

                                    photoDates:
                                        photoUrls.map(
                                            (
                                                _photoUrl,
                                                index,
                                            ) =>
                                                current.photoDates[
                                                    index
                                                ],
                                        ),
                                }),
                            )
                    }
                    photoDates={
                        draft.photoDates
                    }
                    onPhotoDatesChange={
                        photoDates =>
                            setDraft(
                                current => ({
                                    ...current,
                                    photoDates,
                                }),
                            )
                    }
                    title="Photographs"
                    helperText="Optional. Add setup shots, deliberate side-by-side pictures or other photographs taken specifically for this Trial."
                    addButtonText="Add Trial photographs"
                    photoAltPrefix="Garden Trial photograph"
                    photoDateLabel="When was this photograph taken?"
                    photoDateHelperText="The date gives the Trial useful visual context later."
                    defaultNewPhotosToToday={
                        true
                    }
                    multiple={
                        true
                    }
                    maxPhotos={
                        20
                    }
                />
            </section>

            {(draft.status ===
                'completed' ||
                draft.status ===
                    'set-aside') && (
                <section className="sprig-trial-editor-section">
                    <p className="section-label">
                        Bringing the Trial together
                    </p>

                    <div className="sprig-trial-editor-grid">
                        <label className="sprig-trial-field">
                            <span>
                                {draft.status ===
                                'completed'
                                    ? 'Completed'
                                    : 'Set aside on'}
                            </span>

                            <input
                                type="date"
                                value={
                                    draft.completedDate
                                }
                                onChange={
                                    event =>
                                        setDraft(
                                            current => ({
                                                ...current,

                                                completedDate:
                                                    event
                                                        .target
                                                        .value,
                                            }),
                                        )
                                }
                            />
                        </label>

                        <label className="sprig-trial-field">
                            <span>
                                How clear was the result?
                            </span>

                            <select
                                value={
                                    draft.result
                                }
                                onChange={
                                    event =>
                                        setDraft(
                                            current => ({
                                                ...current,

                                                result:
                                                    event
                                                        .target
                                                        .value as
                                                        | GardenTrialResult
                                                        | '',
                                            }),
                                        )
                                }
                            >
                                <option value="">
                                    Not decided yet
                                </option>

                                {RESULT_OPTIONS.map(
                                    option => (
                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>

                        <label className="sprig-trial-field sprig-trial-field--wide">
                            <span>
                                What did this Trial teach me?
                            </span>

                            <textarea
                                rows={5}
                                value={
                                    draft.conclusion
                                }
                                onChange={
                                    event =>
                                        setDraft(
                                            current => ({
                                                ...current,

                                                conclusion:
                                                    event
                                                        .target
                                                        .value,
                                            }),
                                        )
                                }
                                placeholder="Your conclusion in your own words."
                            />
                        </label>

                        <label className="sprig-trial-field sprig-trial-field--wide">
                            <span>
                                What would I try next time?
                            </span>

                            <textarea
                                rows={4}
                                value={
                                    draft.nextTime
                                }
                                onChange={
                                    event =>
                                        setDraft(
                                            current => ({
                                                ...current,

                                                nextTime:
                                                    event
                                                        .target
                                                        .value,
                                            }),
                                        )
                                }
                                placeholder="Repeat it, change one thing, test a new question..."
                            />
                        </label>
                    </div>
                </section>
            )}

            <div className="sprig-trial-editor-actions">
                <button
                    type="button"
                    className="sprig-trial-secondary-button"
                    onClick={
                        onCancel
                    }
                >
                    Leave it for now
                </button>

                <button
                    type="button"
                    className="sprig-trial-primary-button"
                    disabled={
                        !canSave
                    }
                    onClick={() =>
                        onSave(
                            draft,
                        )
                    }
                >
                    {saveLabel}
                </button>
            </div>
        </section>
    );
}

function SavedPhotoEditor({
    photoUrls,
    photoDates,
    title,
    helperText,
    addButtonText,
    photoAltPrefix,
    maxPhotos,
    onSave,
}: {
    photoUrls:
        string[];
    photoDates:
        Array<
            string |
            undefined
        >;
    title:
        string;
    helperText:
        string;
    addButtonText:
        string;
    photoAltPrefix:
        string;
    maxPhotos:
        number;
    onSave:
        (
            photoUrls:
                string[],
            photoDates:
                Array<
                    string |
                    undefined
                >,
        ) => void;
}) {
    const [
        draftUrls,
        setDraftUrls,
    ] =
        useState(
            photoUrls,
        );

    const [
        draftDates,
        setDraftDates,
    ] =
        useState(
            photoDates,
        );

    useEffect(
        () => {
            setDraftUrls(
                photoUrls,
            );

            setDraftDates(
                photoUrls.map(
                    (
                        _photoUrl,
                        index,
                    ) =>
                        photoDates[
                            index
                        ],
                ),
            );
        },
        [
            photoUrls,
            photoDates,
        ],
    );

    const hasChanges =
        JSON.stringify(
            draftUrls,
        ) !==
            JSON.stringify(
                photoUrls,
            ) ||
        JSON.stringify(
            draftDates,
        ) !==
            JSON.stringify(
                photoUrls.map(
                    (
                        _photoUrl,
                        index,
                    ) =>
                        photoDates[
                            index
                        ],
                ),
            );

    return (
        <div className="sprig-trial-saved-photo-editor">
            <SprigPhotoPicker
                photoUrls={
                    draftUrls
                }
                onChange={
                    setDraftUrls
                }
                photoDates={
                    draftDates
                }
                onPhotoDatesChange={
                    setDraftDates
                }
                title={
                    title
                }
                helperText={
                    helperText
                }
                addButtonText={
                    addButtonText
                }
                photoAltPrefix={
                    photoAltPrefix
                }
                photoDateLabel="When was this photograph taken?"
                photoDateHelperText="The date gives this visual evidence useful context later."
                defaultNewPhotosToToday={
                    true
                }
                multiple={
                    true
                }
                maxPhotos={
                    maxPhotos
                }
            />

            {hasChanges && (
                <button
                    type="button"
                    className="sprig-trial-primary-button"
                    onClick={() =>
                        onSave(
                            draftUrls,
                            draftUrls.map(
                                (
                                    _photoUrl,
                                    index,
                                ) =>
                                    draftDates[
                                        index
                                    ],
                            ),
                        )
                    }
                >
                    Save photograph changes
                </button>
            )}
        </div>
    );
}

function PrintReport({
    gardenData,
    trial,
    evidencePhotos,
}: {
    gardenData:
        GardenData;
    trial:
        GardenTrial;
    evidencePhotos:
        EvidencePhoto[];
}) {
    const observations =
        [
            ...(
                trial.observations ??
                []
            ),
        ].sort(
            (
                first,
                second,
            ) =>
                first.date.localeCompare(
                    second.date,
                ),
        );

    function section(
        heading:
            string,
        value?:
            string,
    ) {
        if (
            !value?.trim()
        ) {
            return null;
        }

        return (
            <section className="sprig-trial-print-section">
                <h2>
                    {heading}
                </h2>

                {value
                    .split(
                        /\r?\n/,
                    )
                    .map(
                        (
                            line,
                            index,
                        ) => (
                            <p
                                key={`${heading}-${index}`}
                            >
                                {line ||
                                    '\u00A0'}
                            </p>
                        ),
                    )}
            </section>
        );
    }

    return (
        <article className="sprig-trial-print-report">
            <header className="sprig-trial-print-header">
                <p className="sprig-trial-print-eyebrow">
                    Garden Trial
                </p>

                <h1>
                    {trial.title}
                </h1>

                <div className="sprig-trial-print-meta">
                    <p>
                        <strong>
                            Status:
                        </strong>{' '}
                        {statusLabel(
                            trial.status,
                        )}
                    </p>

                    <p>
                        <strong>
                            Started:
                        </strong>{' '}
                        {formatDate(
                            trial.startDate,
                        )}
                    </p>

                    {durationLabel(
                        trial,
                    ) && (
                        <p>
                            <strong>
                                Expected duration:
                            </strong>{' '}
                            {durationLabel(
                                trial,
                            )}
                        </p>
                    )}

                    {trial.expectedFinishDate && (
                        <p>
                            <strong>
                                Expected finish:
                            </strong>{' '}
                            {formatDate(
                                trial.expectedFinishDate,
                            )}
                        </p>
                    )}

                    {trial.completedDate && (
                        <p>
                            <strong>
                                {trial.status ===
                                'set-aside'
                                    ? 'Set aside:'
                                    : 'Completed:'}
                            </strong>{' '}
                            {formatDate(
                                trial.completedDate,
                            )}
                        </p>
                    )}

                    {trial.result && (
                        <p>
                            <strong>
                                Result clarity:
                            </strong>{' '}
                            {resultLabel(
                                trial.result,
                            )}
                        </p>
                    )}
                </div>
            </header>

            {section(
                'Why does the timing or season matter?',
                trial.timingReason,
            )}

            {section(
                'Why am I trying this?',
                trial.purpose,
            )}

            {section(
                'What am I hoping to find out?',
                trial.question,
            )}

            {section(
                'What do I think might happen?',
                trial.expectation,
            )}

            {section(
                'What am I changing?',
                trial.whatIsChanging,
            )}

            {section(
                'What am I keeping comparable?',
                trial.whatShouldStayComparable,
            )}

            {section(
                'What am I watching for?',
                trial.watchingFor,
            )}

            {(
                trial.photoUrls ??
                []
            ).length >
                0 && (
                <section className="sprig-trial-print-section">
                    <h2>
                        Trial photographs
                    </h2>

                    <div className="sprig-trial-print-photo-grid">
                        {(
                            trial.photoUrls ??
                            []
                        ).map(
                            (
                                photoUrl,
                                index,
                            ) => (
                                <figure
                                    key={`trial-photo-${index}`}
                                >
                                    <img
                                        src={
                                            photoUrl
                                        }
                                        alt={`${trial.title} photograph ${index + 1}`}
                                    />

                                    {trial.photoDates?.[
                                        index
                                    ] && (
                                        <figcaption>
                                            {formatDate(
                                                trial.photoDates[
                                                    index
                                                ],
                                            )}
                                        </figcaption>
                                    )}
                                </figure>
                            ),
                        )}
                    </div>
                </section>
            )}

            {(
                trial.relationships ??
                []
            ).length >
                0 && (
                <section className="sprig-trial-print-section">
                    <h2>
                        Evidence from Sprig
                    </h2>

                    <ul>
                        {(
                            trial.relationships ??
                            []
                        ).map(
                            relationship => (
                                <li
                                    key={`${relationship.targetType}:${relationship.targetId}`}
                                >
                                    {getRelationshipLabel(
                                        gardenData,
                                        relationship,
                                    )}
                                </li>
                            ),
                        )}
                    </ul>
                </section>
            )}

            {evidencePhotos.length >
                0 && (
                <section className="sprig-trial-print-section">
                    <h2>
                        Photographic evidence from linked records
                    </h2>

                    <div className="sprig-trial-print-photo-grid">
                        {evidencePhotos.map(
                            photo => (
                                <figure
                                    key={
                                        photo.key
                                    }
                                >
                                    <img
                                        src={
                                            photo.photoUrl
                                        }
                                        alt={`${photo.sourceLabel} evidence`}
                                    />

                                    <figcaption>
                                        <strong>
                                            {
                                                photo.sourceLabel
                                            }
                                        </strong>

                                        {photo.date
                                            ? ` · ${formatDate(
                                                  photo.date,
                                              )}`
                                            : ''}
                                    </figcaption>
                                </figure>
                            ),
                        )}
                    </div>
                </section>
            )}

            {observations.length >
                0 && (
                <section className="sprig-trial-print-section">
                    <h2>
                        Trial observations
                    </h2>

                    <div className="sprig-trial-print-observations">
                        {observations.map(
                            observation => (
                                <article
                                    key={
                                        observation.id
                                    }
                                >
                                    <h3>
                                        {formatDate(
                                            observation.date,
                                        )}
                                    </h3>

                                    <p>
                                        {
                                            observation.body
                                        }
                                    </p>

                                    {(
                                        observation.photoUrls ??
                                        []
                                    ).length >
                                        0 && (
                                        <div className="sprig-trial-print-photo-grid sprig-trial-print-photo-grid--observation">
                                            {(
                                                observation.photoUrls ??
                                                []
                                            ).map(
                                                (
                                                    photoUrl,
                                                    index,
                                                ) => (
                                                    <figure
                                                        key={`${observation.id}-photo-${index}`}
                                                    >
                                                        <img
                                                            src={
                                                                photoUrl
                                                            }
                                                            alt={`Observation photograph ${index + 1}`}
                                                        />

                                                        <figcaption>
                                                            {formatDate(
                                                                observation
                                                                    .photoDates?.[
                                                                    index
                                                                ] ??
                                                                    observation.date,
                                                            )}
                                                        </figcaption>
                                                    </figure>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </article>
                            ),
                        )}
                    </div>
                </section>
            )}

            {section(
                'Conclusion',
                trial.conclusion,
            )}

            {section(
                'What I would try next time',
                trial.nextTime,
            )}

            <footer className="sprig-trial-print-footer">
                Exported from Sprig
            </footer>
        </article>
    );
}

export default function GardenTrials({
    gardenData,
    initialTrialId =
        null,
    journeyBackLabel,
    onJourneyBack,
    onGardenDataChange,
    onTrialSelectionChange,
    onNavigate,
    onOpenRelationship,
}: GardenTrialsProps) {
    const trials =
        gardenData.gardenTrials ??
        [];

    const [
        selectedTrialId,
        setSelectedTrialId,
    ] =
        useState<
            string |
            null
        >(
            initialTrialId,
        );

    const [
        isCreating,
        setIsCreating,
    ] =
        useState(
            false,
        );

    const [
        editingTrialId,
        setEditingTrialId,
    ] =
        useState<
            string |
            null
        >(
            null,
        );

    const [
        editorSeed,
        setEditorSeed,
    ] =
        useState(
            0,
        );

    const [
        editorDraftOverride,
        setEditorDraftOverride,
    ] =
        useState<
            TrialDraft |
            null
        >(
            null,
        );

    const [
        relationshipSearch,
        setRelationshipSearch,
    ] =
        useState(
            '',
        );

    const [
        selectedRelationshipKey,
        setSelectedRelationshipKey,
    ] =
        useState(
            '',
        );

    const [
        observationDate,
        setObservationDate,
    ] =
        useState(
            getToday(),
        );

    const [
        observationBody,
        setObservationBody,
    ] =
        useState(
            '',
        );

    const [
        observationPhotoUrls,
        setObservationPhotoUrls,
    ] =
        useState<
            string[]
        >(
            [],
        );

    const [
        observationPhotoDates,
        setObservationPhotoDates,
    ] =
        useState<
            Array<
                string |
                undefined
            >
        >(
            [],
        );

    const [
        editingObservationId,
        setEditingObservationId,
    ] =
        useState<
            string |
            null
        >(
            null,
        );

    const [
        editingObservationDate,
        setEditingObservationDate,
    ] =
        useState(
            '',
        );

    const [
        editingObservationBody,
        setEditingObservationBody,
    ] =
        useState(
            '',
        );

    useEffect(
        () => {
            setSelectedTrialId(
                initialTrialId,
            );
        },
        [
            initialTrialId,
        ],
    );

    const selectedTrial =
        trials.find(
            trial =>
                trial.id ===
                selectedTrialId,
        ) ??
        null;

    useEffect(
        () => {
            onTrialSelectionChange(
                selectedTrialId,
            );
        },
        [
            selectedTrialId,
            onTrialSelectionChange,
        ],
    );

    const relationshipOptions =
        useMemo(
            () =>
                getRelationshipOptions(
                    gardenData,
                ),
            [
                gardenData,
            ],
        );

    const filteredRelationshipOptions =
        useMemo(
            () => {
                if (
                    !selectedTrial
                ) {
                    return [];
                }

                const query =
                    normalise(
                        relationshipSearch,
                    );

                const linked =
                    new Set(
                        (
                            selectedTrial.relationships ??
                            []
                        ).map(
                            relationship =>
                                `${relationship.targetType}:${relationship.targetId}`,
                        ),
                    );

                return relationshipOptions
                    .filter(
                        option => {
                            if (
                                !query
                            ) {
                                return true;
                            }

                            return searchableText([
                                option.group,
                                option.label,
                                option.searchText,
                            ]).includes(
                                query,
                            );
                        },
                    )
                    .map(
                        option => ({
                            ...option,

                            alreadyLinked:
                                linked.has(
                                    `${option.targetType}:${option.targetId}`,
                                ),
                        }),
                    )
                    .slice(
                        0,
                        80,
                    );
            },
            [
                relationshipOptions,
                relationshipSearch,
                selectedTrial,
            ],
        );

    const evidencePhotos =
        useMemo(
            () =>
                selectedTrial
                    ? getEvidencePhotos(
                          gardenData,
                          selectedTrial,
                      )
                    : [],
            [
                gardenData,
                selectedTrial,
            ],
        );

    function save(
        nextGardenData:
            GardenData,
    ) {
        onGardenDataChange(
            nextGardenData,
        );
    }

    function saveTrial(
        updatedTrial:
            GardenTrial,
    ) {
        save({
            ...gardenData,

            gardenTrials:
                trials.map(
                    trial =>
                        trial.id ===
                        updatedTrial.id
                            ? updatedTrial
                            : trial,
                ),
        });
    }

    function draftToTrial(
        draft:
            TrialDraft,
        existing?:
            GardenTrial,
    ): GardenTrial {
        const durationValue =
            Number(
                draft.expectedDurationValue,
            );

        const hasDuration =
            draft.expectedDurationValue.trim() !==
                '' &&
            Number.isFinite(
                durationValue,
            ) &&
            durationValue >
                0;

        return {
            id:
                existing?.id ??
                crypto.randomUUID(),

            title:
                draft.title.trim(),

            startDate:
                draft.startDate,

            completedDate:
                draft.status ===
                'active'
                    ? undefined
                    : cleanOptional(
                          draft.completedDate,
                      ),

            status:
                draft.status,

            expectedDurationValue:
                hasDuration
                    ? durationValue
                    : undefined,

            expectedDurationUnit:
                hasDuration
                    ? draft.expectedDurationUnit
                    : undefined,

            expectedFinishDate:
                cleanOptional(
                    draft.expectedFinishDate,
                ),

            timingReason:
                cleanOptional(
                    draft.timingReason,
                ),

            purpose:
                cleanOptional(
                    draft.purpose,
                ),

            question:
                cleanOptional(
                    draft.question,
                ),

            expectation:
                cleanOptional(
                    draft.expectation,
                ),

            whatIsChanging:
                cleanOptional(
                    draft.whatIsChanging,
                ),

            whatShouldStayComparable:
                cleanOptional(
                    draft.whatShouldStayComparable,
                ),

            watchingFor:
                cleanOptional(
                    draft.watchingFor,
                ),

            photoUrls:
                draft.photoUrls.length >
                0
                    ? draft.photoUrls
                    : undefined,

            photoDates:
                draft.photoUrls.length >
                0
                    ? draft.photoUrls.map(
                          (
                              _photoUrl,
                              index,
                          ) =>
                              draft.photoDates[
                                  index
                              ],
                      )
                    : undefined,

            observations:
                existing?.observations ??
                [],

            result:
                draft.result ||
                undefined,

            conclusion:
                cleanOptional(
                    draft.conclusion,
                ),

            nextTime:
                cleanOptional(
                    draft.nextTime,
                ),

            relationships:
                existing?.relationships ??
                [],

            createdAt:
                existing?.createdAt ??
                getNow(),

            updatedAt:
                existing
                    ? getNow()
                    : undefined,
        };
    }

    function handleCreateTrial(
        draft:
            TrialDraft,
    ) {
        const trial =
            draftToTrial(
                draft,
            );

        save({
            ...gardenData,

            gardenTrials: [
                ...trials,
                trial,
            ],
        });

        setSelectedTrialId(
            trial.id,
        );

        setIsCreating(
            false,
        );
    }

    function handleUpdateTrial(
        draft:
            TrialDraft,
    ) {
        const existing =
            trials.find(
                trial =>
                    trial.id ===
                    editingTrialId,
            );

        if (
            !existing
        ) {
            return;
        }

        const updatedTrial =
            draftToTrial(
                draft,
                existing,
            );

        saveTrial(
            updatedTrial,
        );

        setEditingTrialId(
            null,
        );

        setEditorDraftOverride(
            null,
        );
    }

    function handleDeleteTrial(
        trial:
            GardenTrial,
    ) {
        const confirmed =
            window.confirm(
                `Delete "${trial.title}"?\n\n` +
                    'This removes the Trial question, observations and Trial-owned photographs. Linked Plant Stories, Journal entries, Harvests and other evidence are not deleted.',
            );

        if (
            !confirmed
        ) {
            return;
        }

        save({
            ...gardenData,

            gardenTrials:
                trials.filter(
                    item =>
                        item.id !==
                        trial.id,
                ),
        });

        setSelectedTrialId(
            null,
        );

        setEditingTrialId(
            null,
        );

        setEditorDraftOverride(
            null,
        );
    }

    function openEditor(
        trial:
            GardenTrial,
        overrides?:
            Partial<
                TrialDraft
            >,
    ) {
        const nextDraft = {
            ...makeDraftFromTrial(
                trial,
            ),

            ...overrides,
        };

        if (
            nextDraft.status !==
                'active' &&
            !nextDraft.completedDate
        ) {
            nextDraft.completedDate =
                getToday();
        }

        setEditorDraftOverride(
            nextDraft,
        );

        setEditorSeed(
            seed =>
                seed +
                1,
        );

        setEditingTrialId(
            trial.id,
        );
    }

    function handleCompleteTrial(
        trial:
            GardenTrial,
    ) {
        openEditor(
            trial,
            {
                status:
                    'completed',

                completedDate:
                    trial.completedDate ??
                    getToday(),
            },
        );
    }

    function handleSetAsideTrial(
        trial:
            GardenTrial,
    ) {
        openEditor(
            trial,
            {
                status:
                    'set-aside',

                completedDate:
                    trial.completedDate ??
                    getToday(),
            },
        );
    }

    function handleReopenTrial(
        trial:
            GardenTrial,
    ) {
        saveTrial({
            ...trial,

            status:
                'active',

            completedDate:
                undefined,

            updatedAt:
                getNow(),
        });
    }

    function handleAddRelationship() {
        if (
            !selectedTrial
        ) {
            return;
        }

        const option =
            relationshipOptions.find(
                candidate =>
                    `${candidate.targetType}:${candidate.targetId}` ===
                    selectedRelationshipKey,
            );

        if (
            !option
        ) {
            return;
        }

        const existing =
            selectedTrial.relationships ??
            [];

        const alreadyLinked =
            existing.some(
                relationship =>
                    relationship.targetType ===
                        option.targetType &&
                    relationship.targetId ===
                        option.targetId,
            );

        if (
            alreadyLinked
        ) {
            return;
        }

        saveTrial({
            ...selectedTrial,

            relationships: [
                ...existing,

                {
                    targetType:
                        option.targetType,

                    targetId:
                        option.targetId,

                    label:
                        option.label,

                    createdAt:
                        getNow(),
                },
            ],

            updatedAt:
                getNow(),
        });

        setSelectedRelationshipKey(
            '',
        );

        setRelationshipSearch(
            '',
        );
    }

    function handleRemoveRelationship(
        relationship:
            KnowledgeRelationship,
    ) {
        if (
            !selectedTrial
        ) {
            return;
        }

        saveTrial({
            ...selectedTrial,

            relationships:
                (
                    selectedTrial.relationships ??
                    []
                ).filter(
                    item =>
                        !(
                            item.targetType ===
                                relationship.targetType &&
                            item.targetId ===
                                relationship.targetId
                        ),
                ),

            updatedAt:
                getNow(),
        });
    }

    function resetObservationComposer() {
        setObservationDate(
            getToday(),
        );

        setObservationBody(
            '',
        );

        setObservationPhotoUrls(
            [],
        );

        setObservationPhotoDates(
            [],
        );
    }

    function handleAddObservation() {
        if (
            !selectedTrial ||
            !observationDate ||
            !observationBody.trim()
        ) {
            return;
        }

        const observation:
            GardenTrialObservation =
            {
                id:
                    crypto.randomUUID(),

                date:
                    observationDate,

                body:
                    observationBody.trim(),

                photoUrls:
                    observationPhotoUrls.length >
                    0
                        ? observationPhotoUrls
                        : undefined,

                photoDates:
                    observationPhotoUrls.length >
                    0
                        ? observationPhotoUrls.map(
                              (
                                  _photoUrl,
                                  index,
                              ) =>
                                  observationPhotoDates[
                                      index
                                  ],
                          )
                        : undefined,

                createdAt:
                    getNow(),
            };

        saveTrial({
            ...selectedTrial,

            observations: [
                ...(
                    selectedTrial.observations ??
                    []
                ),
                observation,
            ],

            updatedAt:
                getNow(),
        });

        resetObservationComposer();
    }

    function beginEditObservation(
        observation:
            GardenTrialObservation,
    ) {
        setEditingObservationId(
            observation.id,
        );

        setEditingObservationDate(
            observation.date,
        );

        setEditingObservationBody(
            observation.body,
        );
    }

    function handleSaveObservationEdit() {
        if (
            !selectedTrial ||
            !editingObservationId ||
            !editingObservationDate ||
            !editingObservationBody.trim()
        ) {
            return;
        }

        saveTrial({
            ...selectedTrial,

            observations:
                (
                    selectedTrial.observations ??
                    []
                ).map(
                    observation =>
                        observation.id ===
                        editingObservationId
                            ? {
                                  ...observation,

                                  date:
                                      editingObservationDate,

                                  body:
                                      editingObservationBody.trim(),

                                  updatedAt:
                                      getNow(),
                              }
                            : observation,
                ),

            updatedAt:
                getNow(),
        });

        setEditingObservationId(
            null,
        );
    }

    function handleDeleteObservation(
        observation:
            GardenTrialObservation,
    ) {
        if (
            !selectedTrial
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                'Delete this Trial observation? Its observation photographs will also leave the Trial.',
            );

        if (
            !confirmed
        ) {
            return;
        }

        saveTrial({
            ...selectedTrial,

            observations:
                (
                    selectedTrial.observations ??
                    []
                ).filter(
                    item =>
                        item.id !==
                        observation.id,
                ),

            updatedAt:
                getNow(),
        });
    }

    function renderTrialField(
        heading:
            string,
        value?:
            string,
    ) {
        if (
            !value?.trim()
        ) {
            return null;
        }

        return (
            <section className="sprig-trial-story-section">
                <h3>
                    {heading}
                </h3>

                <p>
                    {value}
                </p>
            </section>
        );
    }

    if (
        selectedTrial
    ) {
        const currentEditorDraft =
            editingTrialId ===
            selectedTrial.id
                ? editorDraftOverride ??
                  makeDraftFromTrial(
                      selectedTrial,
                  )
                : null;

        const duration =
            durationLabel(
                selectedTrial,
            );

        return (
            <GardenLayout
                activePage="garden-trials"
                onNavigate={
                    onNavigate
                }
            >
                <main className="journal-page sprig-trials-page">
                    <header className="journal-header sprig-trials-header">
                        <div>
                            <p className="section-label">
                                Garden Trials
                            </p>

                            <h1>
                                {
                                    selectedTrial.title
                                }
                            </h1>

                            <p className="journal-intro">
                                Started{' '}
                                {formatDate(
                                    selectedTrial.startDate,
                                )}
                            </p>
                        </div>
                    </header>

                    <div className="sprig-trial-detail-toolbar">
                        <button
                            type="button"
                            className="sprig-trial-text-button"
                            onClick={() => {
                                setSelectedTrialId(
                                    null,
                                );

                                setEditingTrialId(
                                    null,
                                );

                                setEditorDraftOverride(
                                    null,
                                );
                            }}
                        >
                            ← Garden Trials
                        </button>

                        {journeyBackLabel &&
                            onJourneyBack && (
                                <button
                                    type="button"
                                    className="sprig-trial-text-button"
                                    onClick={
                                        onJourneyBack
                                    }
                                >
                                    ← Back to{' '}
                                    {
                                        journeyBackLabel
                                    }
                                </button>
                            )}
                    </div>

                    {currentEditorDraft ? (
                        <TrialEditor
                            key={`${editingTrialId}-${editorSeed}`}
                            initialDraft={
                                currentEditorDraft
                            }
                            heading="Edit this Trial"
                            saveLabel="Save Trial"
                            onCancel={() => {
                                setEditingTrialId(
                                    null,
                                );

                                setEditorDraftOverride(
                                    null,
                                );
                            }}
                            onSave={
                                handleUpdateTrial
                            }
                        />
                    ) : (
                        <>
                            <article className="sprig-trial-paper sprig-trial-hero">
                                <div className="sprig-trial-hero-heading">
                                    <div>
                                        <p className="section-label">
                                            Garden Trial
                                        </p>

                                        <h2>
                                            {
                                                selectedTrial.title
                                            }
                                        </h2>

                                        <div className="sprig-trial-meta-row">
                                            <span>
                                                Started{' '}
                                                {formatDate(
                                                    selectedTrial.startDate,
                                                )}
                                            </span>

                                            <span
                                                className={`sprig-trial-status sprig-trial-status--${selectedTrial.status}`}
                                            >
                                                {statusLabel(
                                                    selectedTrial.status,
                                                )}
                                            </span>

                                            {selectedTrial.result && (
                                                <span className="sprig-trial-result-chip">
                                                    {resultLabel(
                                                        selectedTrial.result,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {(duration ||
                                    selectedTrial.expectedFinishDate ||
                                    selectedTrial.completedDate ||
                                    selectedTrial.timingReason) && (
                                    <div className="sprig-trial-timing-summary">
                                        <p className="section-label">
                                            Trial timing
                                        </p>

                                        <div className="sprig-trial-timing-facts">
                                            {duration && (
                                                <p>
                                                    <strong>
                                                        Expected duration:
                                                    </strong>{' '}
                                                    {
                                                        duration
                                                    }
                                                </p>
                                            )}

                                            {selectedTrial.expectedFinishDate && (
                                                <p>
                                                    <strong>
                                                        Expected finish:
                                                    </strong>{' '}
                                                    {formatDate(
                                                        selectedTrial.expectedFinishDate,
                                                    )}
                                                </p>
                                            )}

                                            {selectedTrial.completedDate && (
                                                <p>
                                                    <strong>
                                                        {selectedTrial.status ===
                                                        'completed'
                                                            ? 'Completed:'
                                                            : 'Set aside:'}
                                                    </strong>{' '}
                                                    {formatDate(
                                                        selectedTrial.completedDate,
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        {selectedTrial.timingReason && (
                                            <p className="sprig-trial-timing-reason">
                                                {
                                                    selectedTrial.timingReason
                                                }
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div
                                    className="sprig-trial-record-actions"
                                    aria-label="Garden Trial actions"
                                >
                                    <button
                                        type="button"
                                        className="sprig-trial-secondary-button"
                                        onClick={() =>
                                            openEditor(
                                                selectedTrial,
                                            )
                                        }
                                    >
                                        Edit Trial
                                    </button>

                                    {selectedTrial.status ===
                                    'active' ? (
                                        <>
                                            <button
                                                type="button"
                                                className="sprig-trial-primary-button"
                                                onClick={() =>
                                                    handleCompleteTrial(
                                                        selectedTrial,
                                                    )
                                                }
                                            >
                                                Complete Trial
                                            </button>

                                            <button
                                                type="button"
                                                className="sprig-trial-secondary-button"
                                                onClick={() =>
                                                    handleSetAsideTrial(
                                                        selectedTrial,
                                                    )
                                                }
                                            >
                                                Set Trial Aside
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            className="sprig-trial-secondary-button"
                                            onClick={() =>
                                                handleReopenTrial(
                                                    selectedTrial,
                                                )
                                            }
                                        >
                                            Reopen Trial
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="sprig-trial-secondary-button"
                                        onClick={
                                            printTrial
                                        }
                                    >
                                        Print / PDF
                                    </button>

                                    <button
                                        type="button"
                                        className="sprig-trial-secondary-button"
                                        onClick={() =>
                                            exportTrialRtf(
                                                gardenData,
                                                selectedTrial,
                                            )
                                        }
                                    >
                                        Export RTF
                                    </button>

                                    <button
                                        type="button"
                                        className="sprig-trial-danger-button"
                                        onClick={() =>
                                            handleDeleteTrial(
                                                selectedTrial,
                                            )
                                        }
                                    >
                                        Delete Trial
                                    </button>
                                </div>
                            </article>

                            <div className="sprig-trial-story-grid">
                                <article className="sprig-trial-paper sprig-trial-story-card">
                                    <p className="section-label">
                                        The question
                                    </p>

                                    {renderTrialField(
                                        'Why am I trying this?',
                                        selectedTrial.purpose,
                                    )}

                                    {renderTrialField(
                                        'What am I hoping to find out?',
                                        selectedTrial.question,
                                    )}

                                    {renderTrialField(
                                        'What do I think might happen?',
                                        selectedTrial.expectation,
                                    )}
                                </article>

                                <article className="sprig-trial-paper sprig-trial-story-card">
                                    <p className="section-label">
                                        The setup
                                    </p>

                                    {renderTrialField(
                                        'What am I changing?',
                                        selectedTrial.whatIsChanging,
                                    )}

                                    {renderTrialField(
                                        'What am I keeping comparable?',
                                        selectedTrial.whatShouldStayComparable,
                                    )}

                                    {renderTrialField(
                                        'What am I watching for?',
                                        selectedTrial.watchingFor,
                                    )}
                                </article>
                            </div>

                            <section className="sprig-trial-paper sprig-trial-photo-section">
                                <div className="sprig-trial-section-heading">
                                    <div>
                                        <p className="section-label">
                                            Trial photographs
                                        </p>

                                        <h2>
                                            Pictures taken for the experiment itself
                                        </h2>
                                    </div>
                                </div>

                                {(
                                    selectedTrial.photoUrls ??
                                    []
                                ).length >
                                    0 && (
                                    <>
                                        <SprigPhotoGallery
                                            photoUrls={
                                                selectedTrial.photoUrls ??
                                                []
                                            }
                                            title="Trial photographs"
                                            emptyMessage=""
                                            photoAltPrefix={`${selectedTrial.title} Trial photograph`}
                                        />

                                        <div className="sprig-trial-photo-date-list">
                                            {(
                                                selectedTrial.photoUrls ??
                                                []
                                            ).map(
                                                (
                                                    _photoUrl,
                                                    index,
                                                ) => (
                                                    <span
                                                        key={`trial-date-${index}`}
                                                    >
                                                        Photograph{' '}
                                                        {index +
                                                            1}

                                                        {selectedTrial.photoDates?.[
                                                            index
                                                        ]
                                                            ? ` · ${formatDate(
                                                                  selectedTrial
                                                                      .photoDates[
                                                                      index
                                                                  ],
                                                              )}`
                                                            : ' · Date not recorded'}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </>
                                )}

                                <SavedPhotoEditor
                                    photoUrls={
                                        selectedTrial.photoUrls ??
                                        []
                                    }
                                    photoDates={
                                        selectedTrial.photoDates ??
                                        []
                                    }
                                    title="Add or remove Trial photographs"
                                    helperText="Use this for setup shots, deliberate comparison photos and other pictures that exist because you are running this Trial. Photos already owned by linked records stay with those records."
                                    addButtonText="Add Trial photographs"
                                    photoAltPrefix={`${selectedTrial.title} Trial photograph`}
                                    maxPhotos={
                                        20
                                    }
                                    onSave={(
                                        photoUrls,
                                        photoDates,
                                    ) =>
                                        saveTrial({
                                            ...selectedTrial,

                                            photoUrls:
                                                photoUrls.length >
                                                0
                                                    ? photoUrls
                                                    : undefined,

                                            photoDates:
                                                photoUrls.length >
                                                0
                                                    ? photoDates
                                                    : undefined,

                                            updatedAt:
                                                getNow(),
                                        })
                                    }
                                />
                            </section>

                            <section className="sprig-trial-paper">
                                <div className="sprig-trial-section-heading">
                                    <div>
                                        <p className="section-label">
                                            Evidence from Sprig
                                        </p>

                                        <h2>
                                            Gather the real records around the question
                                        </h2>
                                    </div>
                                </div>

                                <p className="sprig-trial-muted">
                                    Linked records keep ownership of what really
                                    happened. The Trial simply gathers them here
                                    as evidence.
                                </p>

                                {(
                                    selectedTrial.relationships ??
                                    []
                                ).length >
                                    0 && (
                                    <div className="sprig-trial-evidence-list">
                                        {(
                                            selectedTrial.relationships ??
                                            []
                                        ).map(
                                            relationship => (
                                                <div
                                                    key={`${relationship.targetType}:${relationship.targetId}`}
                                                    className="sprig-trial-evidence-row"
                                                >
                                                    <button
                                                        type="button"
                                                        className="sprig-trial-evidence-open"
                                                        onClick={() =>
                                                            onOpenRelationship(
                                                                relationship.targetType,
                                                                relationship.targetId,
                                                            )
                                                        }
                                                    >
                                                        <span>
                                                            {getRelationshipLabel(
                                                                gardenData,
                                                                relationship,
                                                            )}
                                                        </span>

                                                        <span
                                                            aria-hidden="true"
                                                        >
                                                            ›
                                                        </span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="sprig-trial-icon-button"
                                                        aria-label="Remove evidence link"
                                                        onClick={() =>
                                                            handleRemoveRelationship(
                                                                relationship,
                                                            )
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                                <div className="sprig-trial-linker">
                                    <label className="sprig-trial-field">
                                        <span>
                                            Find evidence
                                        </span>

                                        <input
                                            type="search"
                                            value={
                                                relationshipSearch
                                            }
                                            onChange={
                                                event => {
                                                    setRelationshipSearch(
                                                        event
                                                            .target
                                                            .value,
                                                    );

                                                    setSelectedRelationshipKey(
                                                        '',
                                                    );
                                                }
                                            }
                                            placeholder="Search potato, Royal Blue, west wall, harvest..."
                                        />
                                    </label>

                                    {relationshipSearch.trim() && (
                                        <p className="sprig-trial-search-count">
                                            Choose from{' '}
                                            {
                                                filteredRelationshipOptions.length
                                            }{' '}
                                            {filteredRelationshipOptions.length ===
                                            1
                                                ? 'match'
                                                : 'matches'}{' '}
                                            below.
                                        </p>
                                    )}

                                    <label className="sprig-trial-field">
                                        <span>
                                            Matching Sprig records
                                        </span>

                                        <select
                                            value={
                                                selectedRelationshipKey
                                            }
                                            onChange={
                                                event =>
                                                    setSelectedRelationshipKey(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                            }
                                        >
                                            <option value="">
                                                Choose a saved Sprig record
                                            </option>

                                            {filteredRelationshipOptions.map(
                                                option => (
                                                    <option
                                                        key={`${option.targetType}:${option.targetId}`}
                                                        value={`${option.targetType}:${option.targetId}`}
                                                        disabled={
                                                            option.alreadyLinked
                                                        }
                                                    >
                                                        {
                                                            option.group
                                                        }{' '}
                                                        ·{' '}
                                                        {
                                                            option.label
                                                        }
                                                        {option.alreadyLinked
                                                            ? ' - Already linked'
                                                            : ''}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>

                                    <button
                                        type="button"
                                        className="sprig-trial-primary-button"
                                        disabled={
                                            !selectedRelationshipKey
                                        }
                                        onClick={
                                            handleAddRelationship
                                        }
                                    >
                                        Add as evidence
                                    </button>
                                </div>
                            </section>

                            {evidencePhotos.length >
                                0 && (
                                <section className="sprig-trial-paper">
                                    <div className="sprig-trial-section-heading">
                                        <div>
                                            <p className="section-label">
                                                Photographic evidence
                                            </p>

                                            <h2>
                                                Pictures gathered from the linked records
                                            </h2>
                                        </div>
                                    </div>

                                    <p className="sprig-trial-muted">
                                        These photographs still belong to their
                                        original Sprig records. The Trial is only
                                        gathering their visual story.
                                    </p>

                                    <div className="sprig-trial-evidence-photo-grid">
                                        {evidencePhotos.map(
                                            photo => (
                                                <button
                                                    key={
                                                        photo.key
                                                    }
                                                    type="button"
                                                    className="sprig-trial-evidence-photo"
                                                    onClick={() =>
                                                        onOpenRelationship(
                                                            photo.targetType,
                                                            photo.targetId,
                                                        )
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            photo.photoUrl
                                                        }
                                                        alt={`${photo.sourceLabel} evidence`}
                                                    />

                                                    <span>
                                                        <strong>
                                                            {
                                                                photo.sourceLabel
                                                            }
                                                        </strong>

                                                        {photo.date && (
                                                            <small>
                                                                {formatDate(
                                                                    photo.date,
                                                                )}
                                                            </small>
                                                        )}
                                                    </span>
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </section>
                            )}

                            <section className="sprig-trial-paper">
                                <div className="sprig-trial-section-heading">
                                    <div>
                                        <p className="section-label">
                                            Trial observations
                                        </p>

                                        <h2>
                                            Things that matter specifically to the experiment
                                        </h2>
                                    </div>
                                </div>

                                <p className="sprig-trial-muted">
                                    Keep ordinary garden actions in Journal or
                                    Plant Stories. Use these observations for
                                    Trial-specific context, confounders and things
                                    that change how you interpret the result.
                                </p>

                                {(
                                    selectedTrial.observations ??
                                    []
                                ).length >
                                    0 && (
                                    <div className="sprig-trial-observation-list">
                                        {[
                                            ...(
                                                selectedTrial.observations ??
                                                []
                                            ),
                                        ]
                                            .sort(
                                                (
                                                    first,
                                                    second,
                                                ) =>
                                                    second.date.localeCompare(
                                                        first.date,
                                                    ),
                                            )
                                            .map(
                                                observation => (
                                                    <article
                                                        key={
                                                            observation.id
                                                        }
                                                        className="sprig-trial-observation"
                                                    >
                                                        {editingObservationId ===
                                                        observation.id ? (
                                                            <div className="sprig-trial-observation-edit">
                                                                <label className="sprig-trial-field">
                                                                    <span>
                                                                        Date
                                                                    </span>

                                                                    <input
                                                                        type="date"
                                                                        value={
                                                                            editingObservationDate
                                                                        }
                                                                        onChange={
                                                                            event =>
                                                                                setEditingObservationDate(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                        }
                                                                    />
                                                                </label>

                                                                <label className="sprig-trial-field">
                                                                    <span>
                                                                        Observation
                                                                    </span>

                                                                    <textarea
                                                                        rows={
                                                                            4
                                                                        }
                                                                        value={
                                                                            editingObservationBody
                                                                        }
                                                                        onChange={
                                                                            event =>
                                                                                setEditingObservationBody(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                        }
                                                                    />
                                                                </label>

                                                                <div className="sprig-trial-inline-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="sprig-trial-secondary-button"
                                                                        onClick={() =>
                                                                            setEditingObservationId(
                                                                                null,
                                                                            )
                                                                        }
                                                                    >
                                                                        Cancel
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="sprig-trial-primary-button"
                                                                        onClick={
                                                                            handleSaveObservationEdit
                                                                        }
                                                                    >
                                                                        Save observation
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="sprig-trial-observation-heading">
                                                                    <time>
                                                                        {formatDate(
                                                                            observation.date,
                                                                        )}
                                                                    </time>

                                                                    <div className="sprig-trial-inline-actions">
                                                                        <button
                                                                            type="button"
                                                                            className="sprig-trial-text-button"
                                                                            onClick={() =>
                                                                                beginEditObservation(
                                                                                    observation,
                                                                                )
                                                                            }
                                                                        >
                                                                            Edit
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="sprig-trial-text-button sprig-trial-text-button--danger"
                                                                            onClick={() =>
                                                                                handleDeleteObservation(
                                                                                    observation,
                                                                                )
                                                                            }
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <p>
                                                                    {
                                                                        observation.body
                                                                    }
                                                                </p>
                                                            </>
                                                        )}

                                                        {(
                                                            observation.photoUrls ??
                                                            []
                                                        ).length >
                                                            0 && (
                                                            <>
                                                                <SprigPhotoGallery
                                                                    photoUrls={
                                                                        observation.photoUrls ??
                                                                        []
                                                                    }
                                                                    title="Observation photographs"
                                                                    emptyMessage=""
                                                                    photoAltPrefix={`${selectedTrial.title} observation photograph`}
                                                                />

                                                                <div className="sprig-trial-photo-date-list">
                                                                    {(
                                                                        observation.photoUrls ??
                                                                        []
                                                                    ).map(
                                                                        (
                                                                            _photoUrl,
                                                                            index,
                                                                        ) => (
                                                                            <span
                                                                                key={`${observation.id}-date-${index}`}
                                                                            >
                                                                                Photograph{' '}
                                                                                {index +
                                                                                    1}{' '}
                                                                                ·{' '}
                                                                                {formatDate(
                                                                                    observation
                                                                                        .photoDates?.[
                                                                                        index
                                                                                    ] ??
                                                                                        observation.date,
                                                                                )}
                                                                            </span>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}

                                                        <SavedPhotoEditor
                                                            photoUrls={
                                                                observation.photoUrls ??
                                                                []
                                                            }
                                                            photoDates={
                                                                observation.photoDates ??
                                                                []
                                                            }
                                                            title="Observation photographs"
                                                            helperText="Add pictures that specifically document this observation or Trial condition."
                                                            addButtonText="Add observation photographs"
                                                            photoAltPrefix="Trial observation photograph"
                                                            maxPhotos={
                                                                8
                                                            }
                                                            onSave={(
                                                                photoUrls,
                                                                photoDates,
                                                            ) =>
                                                                saveTrial({
                                                                    ...selectedTrial,

                                                                    observations:
                                                                        (
                                                                            selectedTrial.observations ??
                                                                            []
                                                                        ).map(
                                                                            item =>
                                                                                item.id ===
                                                                                observation.id
                                                                                    ? {
                                                                                          ...item,

                                                                                          photoUrls:
                                                                                              photoUrls.length >
                                                                                              0
                                                                                                  ? photoUrls
                                                                                                  : undefined,

                                                                                          photoDates:
                                                                                              photoUrls.length >
                                                                                              0
                                                                                                  ? photoDates
                                                                                                  : undefined,

                                                                                          updatedAt:
                                                                                              getNow(),
                                                                                      }
                                                                                    : item,
                                                                        ),

                                                                    updatedAt:
                                                                        getNow(),
                                                                })
                                                            }
                                                        />
                                                    </article>
                                                ),
                                            )}
                                    </div>
                                )}

                                <div className="sprig-trial-observation-composer">
                                    <label className="sprig-trial-field">
                                        <span>
                                            Date
                                        </span>

                                        <input
                                            type="date"
                                            value={
                                                observationDate
                                            }
                                            onChange={
                                                event =>
                                                    setObservationDate(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                            }
                                        />
                                    </label>

                                    <label className="sprig-trial-field">
                                        <span>
                                            Trial observation
                                        </span>

                                        <textarea
                                            rows={4}
                                            value={
                                                observationBody
                                            }
                                            onChange={
                                                event =>
                                                    setObservationBody(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                            }
                                            placeholder="For example: the west group had four accidental days of extra shade, so this comparison is a little less clean."
                                        />
                                    </label>

                                    <SprigPhotoPicker
                                        photoUrls={
                                            observationPhotoUrls
                                        }
                                        onChange={
                                            setObservationPhotoUrls
                                        }
                                        photoDates={
                                            observationPhotoDates
                                        }
                                        onPhotoDatesChange={
                                            setObservationPhotoDates
                                        }
                                        title="Photographs for this observation"
                                        helperText="Optional. Add visual evidence that belongs specifically with this Trial observation."
                                        addButtonText="Add observation photographs"
                                        photoAltPrefix="New Trial observation photograph"
                                        photoDateLabel="When was this photograph taken?"
                                        photoDateHelperText="New photographs default to today and remain editable."
                                        defaultNewPhotosToToday={
                                            true
                                        }
                                        multiple={
                                            true
                                        }
                                        maxPhotos={
                                            8
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="sprig-trial-primary-button"
                                        disabled={
                                            !observationDate ||
                                            !observationBody.trim()
                                        }
                                        onClick={
                                            handleAddObservation
                                        }
                                    >
                                        Add Trial observation
                                    </button>
                                </div>
                            </section>

                            {(selectedTrial.status !==
                                'active' ||
                                selectedTrial.result ||
                                selectedTrial.conclusion ||
                                selectedTrial.nextTime) && (
                                <section className="sprig-trial-paper">
                                    <div className="sprig-trial-section-heading">
                                        <div>
                                            <p className="section-label">
                                                What the Trial taught
                                            </p>

                                            <h2>
                                                Bring the evidence together without rewriting it
                                            </h2>
                                        </div>
                                    </div>

                                    {selectedTrial.result && (
                                        <section className="sprig-trial-story-section">
                                            <h3>
                                                How clear was the result?
                                            </h3>

                                            <p>
                                                {resultLabel(
                                                    selectedTrial.result,
                                                )}
                                            </p>
                                        </section>
                                    )}

                                    {renderTrialField(
                                        'Conclusion',
                                        selectedTrial.conclusion,
                                    )}

                                    {renderTrialField(
                                        'What I would try next time',
                                        selectedTrial.nextTime,
                                    )}
                                </section>
                            )}
                        </>
                    )}

                    <PrintReport
                        gardenData={
                            gardenData
                        }
                        trial={
                            selectedTrial
                        }
                        evidencePhotos={
                            evidencePhotos
                        }
                    />
                </main>
            </GardenLayout>
        );
    }

    return (
        <GardenLayout
            activePage="garden-trials"
            onNavigate={
                onNavigate
            }
        >
            <main className="journal-page sprig-trials-page">
                <header className="journal-header sprig-trials-header">
                    <div>
                        <p className="section-label">
                            Garden Trials
                        </p>

                        <h1>
                            Questions worth testing
                        </h1>

                        <p className="journal-intro">
                            A Trial owns the question. Your real Sprig records
                            keep owning what actually happened.
                        </p>
                    </div>
                </header>

                {journeyBackLabel &&
                    onJourneyBack && (
                        <button
                            type="button"
                            className="sprig-trial-journey-back"
                            onClick={
                                onJourneyBack
                            }
                        >
                            ← Back to{' '}
                            {
                                journeyBackLabel
                            }
                        </button>
                    )}

                {isCreating ? (
                    <TrialEditor
                        initialDraft={
                            makeEmptyDraft()
                        }
                        heading="Start a Garden Trial"
                        saveLabel="Start Trial"
                        onCancel={() =>
                            setIsCreating(
                                false,
                            )
                        }
                        onSave={
                            handleCreateTrial
                        }
                    />
                ) : (
                    <button
                        type="button"
                        className="sprig-trial-new-button"
                        onClick={() =>
                            setIsCreating(
                                true,
                            )
                        }
                    >
                        + Start a Garden Trial
                    </button>
                )}

                <section className="sprig-trial-shelf-section">
                    <div className="sprig-trial-section-heading">
                        <div>
                            <p className="section-label">
                                Trial shelf
                            </p>

                            <h2>
                                Your deliberate garden questions
                            </h2>
                        </div>

                        <span className="sprig-trial-count">
                            {
                                trials.length
                            }
                        </span>
                    </div>

                    {trials.length ===
                    0 ? (
                        <div className="sprig-trial-empty">
                            <strong>
                                No Garden Trials yet.
                            </strong>

                            <p>
                                When you deliberately change one thing to learn
                                something, give that question a Trial and let
                                Sprig gather the evidence.
                            </p>
                        </div>
                    ) : (
                        <div className="sprig-trial-card-grid">
                            {[
                                ...trials,
                            ]
                                .sort(
                                    (
                                        first,
                                        second,
                                    ) =>
                                        second.startDate.localeCompare(
                                            first.startDate,
                                        ),
                                )
                                .map(
                                    trial => (
                                        <button
                                            key={
                                                trial.id
                                            }
                                            type="button"
                                            className="sprig-trial-card"
                                            onClick={() =>
                                                setSelectedTrialId(
                                                    trial.id,
                                                )
                                            }
                                        >
                                            <div className="sprig-trial-card-topline">
                                                <span
                                                    className={`sprig-trial-status sprig-trial-status--${trial.status}`}
                                                >
                                                    {statusLabel(
                                                        trial.status,
                                                    )}
                                                </span>

                                                {trial.result && (
                                                    <span className="sprig-trial-result-chip">
                                                        {resultLabel(
                                                            trial.result,
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            <strong>
                                                {
                                                    trial.title
                                                }
                                            </strong>

                                            <p>
                                                {trial.question ||
                                                    trial.purpose ||
                                                    'A garden question waiting for its evidence.'}
                                            </p>

                                            <div className="sprig-trial-card-meta">
                                                <span>
                                                    Started{' '}
                                                    {formatDate(
                                                        trial.startDate,
                                                    )}
                                                </span>

                                                {durationLabel(
                                                    trial,
                                                ) && (
                                                    <span>
                                                        About{' '}
                                                        {durationLabel(
                                                            trial,
                                                        )}
                                                    </span>
                                                )}

                                                {(
                                                    trial.photoUrls ??
                                                    []
                                                ).length >
                                                    0 && (
                                                    <span>
                                                        📷{' '}
                                                        {
                                                            trial.photoUrls
                                                                ?.length
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ),
                                )}
                        </div>
                    )}
                </section>
            </main>
        </GardenLayout>
    );
}