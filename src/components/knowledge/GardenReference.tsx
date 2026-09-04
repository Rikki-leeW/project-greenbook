import { useEffect, useMemo, useState } from 'react';

import SprigPhotoGallery from '../photos/SprigPhotoGallery';
import SprigPhotoPicker from '../photos/SprigPhotoPicker';

import type {
    GardenData,
    GardenReferenceSubjectType,
    KnowledgeRelationship,
    KnowledgeRelationshipTargetType,
    PlantReference,
    PlantReferenceTopic,
} from '../../types';

interface GardenReferenceProps {
    gardenData: GardenData;
    initialRecordId?: string | null;
    onGardenDataChange: (gardenData: GardenData) => void;
    onRecordSelectionChange: (recordId: string | null) => void;
    onOpenRelationship: (
        targetType: KnowledgeRelationshipTargetType,
        targetId: string,
    ) => void;
}

type ReferenceDisplayMode =
    | 'cards'
    | 'journal';

type ReferenceVarietyFilter =
    | 'all'
    | 'general'
    | string;

type ReferenceSubjectFilter =
    | 'all'
    | GardenReferenceSubjectType;

interface ReferenceSubjectGroup {
    key: string;
    subjectType: GardenReferenceSubjectType;
    label: string;
    subjectId?: string;
    references: PlantReference[];
}

const SUBJECT_OPTIONS: Array<{
    value: GardenReferenceSubjectType;
    label: string;
}> = [
    {
        value: 'plant-crop',
        label: 'Plant / Crop',
    },
    {
        value: 'product',
        label: 'Product',
    },
    {
        value: 'pest-problem',
        label: 'Pest / Disease / Problem',
    },
    {
        value: 'other',
        label: 'Other',
    },
];

const TOPIC_OPTIONS: Array<{
    value: PlantReferenceTopic;
    label: string;
}> = [
    {
        value: 'planting-timing',
        label: 'Planting & timing',
    },
    {
        value: 'watering',
        label: 'Watering',
    },
    {
        value: 'sun-position',
        label: 'Sun & position',
    },
    {
        value: 'feeding',
        label: 'Feeding',
    },
    {
        value: 'harvesting',
        label: 'Harvesting',
    },
    {
        value: 'growing-behaviour',
        label: 'Growing behaviour',
    },
    {
        value: 'pests-problems',
        label: 'Pests & problems',
    },
    {
        value: 'other',
        label: 'Other',
    },
];

function getToday(): string {
    return new Date()
        .toISOString()
        .slice(0, 10);
}

function getNow(): string {
    return new Date()
        .toISOString();
}

function normalise(
    value?: string,
): string {
    return (value ?? '')
        .toLocaleLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            ' ',
        )
        .replace(
            /\s+/g,
            ' ',
        )
        .trim();
}

function formatDate(
    value?: string,
): string {
    if (!value) {
        return '';
    }

    const safe =
        value.slice(
            0,
            10,
        );

    const date =
        new Date(
            `${safe}T00:00:00`,
        );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        'en-AU',
        {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        },
    );
}

function makeTitleFromBody(
    body: string,
): string {
    const firstLine =
        body
            .split(/\r?\n/)
            .map(
                line =>
                    line.trim(),
            )
            .find(Boolean) ??
        'Garden reference';

    return firstLine.length <= 68
        ? firstLine
        : `${firstLine
              .slice(
                  0,
                  65,
              )
              .trim()}…`;
}

function getSubjectType(
    reference: PlantReference,
): GardenReferenceSubjectType {
    return (
        reference.subjectType ??
        'plant-crop'
    );
}

function getSubjectTypeLabel(
    reference: PlantReference,
): string {
    const type =
        getSubjectType(
            reference,
        );

    if (
        type === 'other' &&
        reference.customSubjectTypeLabel?.trim()
    ) {
        return reference.customSubjectTypeLabel.trim();
    }

    return (
        SUBJECT_OPTIONS.find(
            option =>
                option.value ===
                type,
        )?.label ??
        'Other'
    );
}

function getSubjectLabel(
    reference: PlantReference,
): string {
    if (
        getSubjectType(
            reference,
        ) ===
        'plant-crop'
    ) {
        return (
            reference.plantName?.trim() ||
            'Unnamed crop'
        );
    }

    return (
        reference.subjectLabel?.trim() ||
        'Unnamed subject'
    );
}

function getKnowledge(
    reference: PlantReference,
): string {
    return (
        reference.knowledge?.trim() ||
        reference.notes?.trim() ||
        ''
    );
}

function getTitle(
    reference: PlantReference,
): string {
    if (
        reference.title?.trim()
    ) {
        return reference.title.trim();
    }

    const knowledge =
        getKnowledge(
            reference,
        );

    if (knowledge) {
        return makeTitleFromBody(
            knowledge,
        );
    }

    return `${getSubjectLabel(
        reference,
    )} reference`;
}

function getTopicLabel(
    reference: PlantReference,
): string {
    if (
        reference.topic ===
            'other' &&
        reference.customTopicLabel?.trim()
    ) {
        return reference.customTopicLabel.trim();
    }

    return (
        TOPIC_OPTIONS.find(
            option =>
                option.value ===
                reference.topic,
        )?.label ??
        'Unsorted reference'
    );
}

function getAppliesToLabel(
    reference: PlantReference,
): string {
    if (
        getSubjectType(
            reference,
        ) !==
        'plant-crop'
    ) {
        return `${getSubjectTypeLabel(
            reference,
        )} · ${getSubjectLabel(
            reference,
        )}`;
    }

    const crop =
        reference.plantName?.trim() ||
        'Unnamed crop';

    return reference.variety?.trim()
        ? `${crop} · ${reference.variety.trim()}`
        : `${crop} · All / General varieties`;
}

function getSearchText(
    reference: PlantReference,
): string {
    return [
        getSubjectTypeLabel(
            reference,
        ),
        getSubjectLabel(
            reference,
        ),
        reference.plantName ?? '',
        reference.variety ?? '',
        getTitle(
            reference,
        ),
        getTopicLabel(
            reference,
        ),
        reference.customTopicLabel ?? '',
        ...(reference.aliases ?? []),
        getKnowledge(
            reference,
        ),
    ].join(' ');
}

function matchesSearch(
    reference: PlantReference,
    query: string,
): boolean {
    const needle =
        normalise(
            query,
        );

    return (
        !needle ||
        normalise(
            getSearchText(
                reference,
            ),
        ).includes(
            needle,
        )
    );
}

function getSubjectGroups(
    references: PlantReference[],
): ReferenceSubjectGroup[] {
    const groups =
        new Map<
            string,
            ReferenceSubjectGroup
        >();

    references.forEach(
        reference => {
            const subjectType =
                getSubjectType(
                    reference,
                );

            const label =
                getSubjectLabel(
                    reference,
                );

            const identity =
                reference.subjectId?.trim() ||
                normalise(
                    label,
                );

            const key =
                `${subjectType}::${identity}`;

            const existing =
                groups.get(
                    key,
                );

            if (
                existing
            ) {
                existing.references.push(
                    reference,
                );

                return;
            }

            groups.set(
                key,
                {
                    key,
                    subjectType,
                    label,
                    subjectId:
                        reference.subjectId,
                    references: [
                        reference,
                    ],
                },
            );
        },
    );

    return Array.from(
        groups.values(),
    ).sort(
        (
            first,
            second,
        ) => {
            const typeDifference =
                getSubjectTypeLabel(
                    first.references[0],
                ).localeCompare(
                    getSubjectTypeLabel(
                        second.references[0],
                    ),
                );

            return (
                typeDifference ||
                first.label.localeCompare(
                    second.label,
                )
            );
        },
    );
}

function getVarieties(
    references: PlantReference[],
): string[] {
    const values =
        new Map<
            string,
            string
        >();

    references.forEach(
        reference => {
            const variety =
                reference.variety?.trim();

            if (
                !variety
            ) {
                return;
            }

            const key =
                normalise(
                    variety,
                );

            if (
                !values.has(
                    key,
                )
            ) {
                values.set(
                    key,
                    variety,
                );
            }
        },
    );

    return Array.from(
        values.values(),
    ).sort(
        (
            first,
            second,
        ) =>
            first.localeCompare(
                second,
            ),
    );
}

function filterReferences(
    references: PlantReference[],
    subjectFilter: ReferenceSubjectFilter,
    topicFilters: PlantReferenceTopic[],
    query: string,
): PlantReference[] {
    return references.filter(
        reference => {
            if (
                subjectFilter !==
                    'all' &&
                getSubjectType(
                    reference,
                ) !==
                    subjectFilter
            ) {
                return false;
            }

            if (
                topicFilters.length >
                    0 &&
                (
                    !reference.topic ||
                    !topicFilters.includes(
                        reference.topic,
                    )
                )
            ) {
                return false;
            }

            return matchesSearch(
                reference,
                query,
            );
        },
    );
}

function filterSubjectReferences(
    references: PlantReference[],
    varietyFilter: ReferenceVarietyFilter,
    topicFilters: PlantReferenceTopic[],
    query: string,
): PlantReference[] {
    return references.filter(
        reference => {
            if (
                !matchesSearch(
                    reference,
                    query,
                )
            ) {
                return false;
            }

            if (
                topicFilters.length >
                    0 &&
                (
                    !reference.topic ||
                    !topicFilters.includes(
                        reference.topic,
                    )
                )
            ) {
                return false;
            }

            if (
                getSubjectType(
                    reference,
                ) !==
                    'plant-crop' ||
                varietyFilter ===
                    'all'
            ) {
                return true;
            }

            if (
                varietyFilter ===
                'general'
            ) {
                return !reference.variety?.trim();
            }

            const referenceVariety =
                normalise(
                    reference.variety,
                );

            const selectedVariety =
                normalise(
                    varietyFilter,
                );

            return (
                !referenceVariety ||
                referenceVariety ===
                    selectedVariety
            );
        },
    );
}

function getRelationshipLabel(
    gardenData: GardenData,
    relationship: KnowledgeRelationship,
): string {
    if (
        relationship.label?.trim()
    ) {
        return relationship.label.trim();
    }

    switch (
        relationship.targetType
    ) {
        case 'product':
            return (
                gardenData.products.find(
                    item =>
                        item.id ===
                        relationship.targetId,
                )?.name ??
                'Product'
            );

        case 'plant-story': {
            const plant =
                gardenData.plantStories.find(
                    item =>
                        item.id ===
                        relationship.targetId,
                );

            return (
                plant?.displayName ||
                plant?.variety ||
                plant?.plantName ||
                'Plant Story'
            );
        }

        case 'growing-place':
            return (
                gardenData.growingPlaces.find(
                    item =>
                        item.id ===
                        relationship.targetId,
                )?.name ??
                'Growing Place'
            );

        case 'growing-setup':
            return (
                gardenData.growingSetups.find(
                    item =>
                        item.id ===
                        relationship.targetId,
                )?.name ??
                'Growing Recipe'
            );

        default:
            return 'Linked Sprig record';
    }
}

function escapeHtml(
    value: string,
): string {
    return value
        .replace(
            /&/g,
            '&amp;',
        )
        .replace(
            /</g,
            '&lt;',
        )
        .replace(
            />/g,
            '&gt;',
        )
        .replace(
            /"/g,
            '&quot;',
        )
        .replace(
            /'/g,
            '&#039;',
        );
}

function escapeRtf(
    value: string,
): string {
    let result =
        '';

    for (
        const character
        of value
    ) {
        if (
            character ===
            '\\'
        ) {
            result +=
                '\\\\';
        }
        else if (
            character ===
            '{'
        ) {
            result +=
                '\\{';
        }
        else if (
            character ===
            '}'
        ) {
            result +=
                '\\}';
        }
        else if (
            character ===
            '\n'
        ) {
            result +=
                '\\par\n';
        }
        else {
            const code =
                character.charCodeAt(
                    0,
                );

            result +=
                code >
                127
                    ? `\\u${
                          code >
                          32767
                              ? code -
                                65536
                              : code
                      }?`
                    : character;
        }
    }

    return result;
}

function getExportFilePart(
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
            .slice(
                0,
                72,
            ) ||
        'sprig-reference'
    );
}

function buildReferenceHtml(
    references: PlantReference[],
): string {
    const body =
        references
            .map(
                reference => {
                    const aliases =
                        (
                            reference.aliases ??
                            []
                        ).length
                            ? `<p><strong>Other names:</strong> ${escapeHtml(
                                  (
                                      reference.aliases ??
                                      []
                                  ).join(
                                      ', ',
                                  ),
                              )}</p>`
                            : '';

                    return `
<article>
<div class="eyebrow">${escapeHtml(
                        getSubjectTypeLabel(
                            reference,
                        ),
                    )}</div>
<h1>${escapeHtml(
                        getTitle(
                            reference,
                        ),
                    )}</h1>
<p class="meta">${escapeHtml(
                        getAppliesToLabel(
                            reference,
                        ),
                    )}</p>
<p class="meta">Topic: ${escapeHtml(
                        getTopicLabel(
                            reference,
                        ),
                    )}</p>
<p class="date">Reference dated ${escapeHtml(
                        formatDate(
                            reference.referenceDate ??
                                reference.createdAt,
                        ),
                    )}</p>
${aliases}
<div class="knowledge">${escapeHtml(
                        getKnowledge(
                            reference,
                        ),
                    ).replace(
                        /\n/g,
                        '<br />',
                    )}</div>
</article>
`;
                },
            )
            .join('');

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Garden Reference</title>
<style>
@page { margin: 16mm; }
body { font-family: Georgia, serif; color:#2d342d; line-height:1.55; }
article { max-width:820px; margin:0 auto 28px; padding-bottom:22px; border-bottom:1px solid #dfe3dc; }
.eyebrow { font:700 9pt Arial,sans-serif; text-transform:uppercase; letter-spacing:.1em; color:#687467; }
h1 { margin:8px 0; font-size:24pt; }
.meta,.date { color:#596358; }
.knowledge { white-space:normal; margin-top:18px; }
</style>
</head>
<body>${body}</body>
</html>`;
}

function printReferences(
    references: PlantReference[],
) {
    if (
        references.length ===
        0
    ) {
        return;
    }

    const printWindow =
        window.open(
            '',
            '_blank',
        );

    if (
        !printWindow
    ) {
        window.alert(
            'Sprig could not open the PDF print view. Please allow pop-ups and try again.',
        );

        return;
    }

    printWindow.opener =
        null;

    printWindow.document.open();

    printWindow.document.write(
        buildReferenceHtml(
            references,
        ),
    );

    printWindow.document.close();

    window.setTimeout(
        () => {
            printWindow.focus();

            printWindow.print();
        },
        400,
    );
}

function downloadRtf(
    title: string,
    references: PlantReference[],
) {
    const body =
        references
            .map(
                (
                    reference,
                    index,
                ) => {
                    const page =
                        index >
                        0
                            ? '\\page\n'
                            : '';

                    return (
                        page +
                        `\\fs18\\b ${escapeRtf(
                            getSubjectTypeLabel(
                                reference,
                            ).toUpperCase(),
                        )}\\b0\\par\n` +
                        `\\fs32\\b ${escapeRtf(
                            getTitle(
                                reference,
                            ),
                        )}\\b0\\par\n` +
                        `\\fs20 ${escapeRtf(
                            getAppliesToLabel(
                                reference,
                            ),
                        )}\\par\n` +
                        `\\fs20 Topic: ${escapeRtf(
                            getTopicLabel(
                                reference,
                            ),
                        )}\\par\n` +
                        `\\par\\fs22 ${escapeRtf(
                            getKnowledge(
                                reference,
                            ),
                        )}\\par\n`
                    );
                },
            )
            .join('');

    const rtf =
        `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Georgia;}{\\f1 Arial;}}\n` +
        `\\f0\\fs22\n` +
        `${body}` +
        `}`;

    const blob =
        new Blob(
            [
                rtf,
            ],
            {
                type:
                    'application/rtf;charset=utf-8',
            },
        );

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
        `${getExportFilePart(
            title,
        )}.rtf`;

    document.body.appendChild(
        anchor,
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(
        url,
    );
}

export default function GardenReference({
    gardenData,
    initialRecordId,
    onGardenDataChange,
    onRecordSelectionChange,
    onOpenRelationship,
}: GardenReferenceProps) {
    const references =
        gardenData.plantReferences ??
        [];

    const [
        selectedReferenceId,
        setSelectedReferenceId,
    ] =
        useState<
            string |
            null
        >(
            null,
        );

    const [
        selectedSubjectKey,
        setSelectedSubjectKey,
    ] =
        useState<
            string |
            null
        >(
            null,
        );

    const [
        editingReferenceId,
        setEditingReferenceId,
    ] =
        useState<
            string |
            null
        >(
            null,
        );

    const [
        subjectType,
        setSubjectType,
    ] =
        useState<
            GardenReferenceSubjectType
        >(
            'plant-crop',
        );

    const [
        subjectId,
        setSubjectId,
    ] =
        useState(
            '',
        );

    const [
        subjectLabel,
        setSubjectLabel,
    ] =
        useState(
            '',
        );

    const [
        customSubjectTypeLabel,
        setCustomSubjectTypeLabel,
    ] =
        useState(
            '',
        );

    const [
        plantName,
        setPlantName,
    ] =
        useState(
            '',
        );

    const [
        variety,
        setVariety,
    ] =
        useState(
            '',
        );

    const [
        title,
        setTitle,
    ] =
        useState(
            '',
        );

    const [
        topic,
        setTopic,
    ] =
        useState<
            PlantReferenceTopic
        >(
            'other',
        );

    const [
        customTopicLabel,
        setCustomTopicLabel,
    ] =
        useState(
            '',
        );

    const [
        knowledge,
        setKnowledge,
    ] =
        useState(
            '',
        );

    const [
        aliases,
        setAliases,
    ] =
        useState(
            '',
        );

    const [
        referenceDate,
        setReferenceDate,
    ] =
        useState(
            getToday(),
        );

    const [
        photoUrls,
        setPhotoUrls,
    ] =
        useState<
            string[]
        >(
            [],
        );

    const [
        editSubjectType,
        setEditSubjectType,
    ] =
        useState<
            GardenReferenceSubjectType
        >(
            'plant-crop',
        );

    const [
        editSubjectId,
        setEditSubjectId,
    ] =
        useState(
            '',
        );

    const [
        editSubjectLabel,
        setEditSubjectLabel,
    ] =
        useState(
            '',
        );

    const [
        editCustomSubjectTypeLabel,
        setEditCustomSubjectTypeLabel,
    ] =
        useState(
            '',
        );

    const [
        editPlantName,
        setEditPlantName,
    ] =
        useState(
            '',
        );

    const [
        editVariety,
        setEditVariety,
    ] =
        useState(
            '',
        );

    const [
        editTitle,
        setEditTitle,
    ] =
        useState(
            '',
        );

    const [
        editTopic,
        setEditTopic,
    ] =
        useState<
            PlantReferenceTopic
        >(
            'other',
        );

    const [
        editCustomTopicLabel,
        setEditCustomTopicLabel,
    ] =
        useState(
            '',
        );

    const [
        editKnowledge,
        setEditKnowledge,
    ] =
        useState(
            '',
        );

    const [
        editAliases,
        setEditAliases,
    ] =
        useState(
            '',
        );

    const [
        editReferenceDate,
        setEditReferenceDate,
    ] =
        useState(
            '',
        );

    const [
        editPhotoUrls,
        setEditPhotoUrls,
    ] =
        useState<
            string[]
        >(
            [],
        );

    const [
        query,
        setQuery,
    ] =
        useState(
            '',
        );

    const [
        subjectFilter,
        setSubjectFilter,
    ] =
        useState<
            ReferenceSubjectFilter
        >(
            'all',
        );

    const [
        topicFilters,
        setTopicFilters,
    ] =
        useState<
            PlantReferenceTopic[]
        >(
            [],
        );

    const [
        varietyFilter,
        setVarietyFilter,
    ] =
        useState<
            ReferenceVarietyFilter
        >(
            'all',
        );

    const [
        displayMode,
        setDisplayMode,
    ] =
        useState<
            ReferenceDisplayMode
        >(
            'cards',
        );

    const [
        composerOpen,
        setComposerOpen,
    ] =
        useState(
            false,
        );

    const subjectGroups =
        useMemo(
            () =>
                getSubjectGroups(
                    references,
                ),
            [
                references,
            ],
        );

    const selectedReference =
        references.find(
            reference =>
                reference.id ===
                selectedReferenceId,
        ) ??
        null;

    const selectedSubject =
        subjectGroups.find(
            group =>
                group.key ===
                selectedSubjectKey,
        ) ??
        null;

    useEffect(
        () => {
            if (
                !initialRecordId
            ) {
                return;
            }

            if (
                references.some(
                    reference =>
                        reference.id ===
                        initialRecordId,
                )
            ) {
                setSelectedReferenceId(
                    initialRecordId,
                );

                setSelectedSubjectKey(
                    null,
                );
            }
        },
        [
            initialRecordId,
            references,
        ],
    );

    function save(
        nextReferences:
            PlantReference[],
    ) {
        onGardenDataChange({
            ...gardenData,

            plantReferences:
                nextReferences,
        });
    }

    function selectReference(
        recordId:
            string |
            null,
    ) {
        setEditingReferenceId(
            null,
        );

        setSelectedReferenceId(
            recordId,
        );

        onRecordSelectionChange(
            recordId,
        );
    }

    function openSubject(
        group:
            ReferenceSubjectGroup,

        mode:
            ReferenceDisplayMode,

        nextVarietyFilter:
            ReferenceVarietyFilter =
            'all',

        nextTopicFilter?:
            PlantReferenceTopic,

        nextQuery:
            string =
            '',
    ) {
        setSelectedReferenceId(
            null,
        );

        setSelectedSubjectKey(
            group.key,
        );

        setVarietyFilter(
            nextVarietyFilter,
        );

        setTopicFilters(
            nextTopicFilter
                ? [
                      nextTopicFilter,
                  ]
                : [],
        );

        setQuery(
            nextQuery,
        );

        setDisplayMode(
            mode,
        );

        onRecordSelectionChange(
            null,
        );
    }

    function closeSubject() {
        setSelectedSubjectKey(
            null,
        );

        setVarietyFilter(
            'all',
        );

        setTopicFilters(
            [],
        );

        setQuery(
            '',
        );

        setDisplayMode(
            'cards',
        );
    }

    function resetComposer() {
        setSubjectType(
            'plant-crop',
        );

        setSubjectId(
            '',
        );

        setSubjectLabel(
            '',
        );

        setCustomSubjectTypeLabel(
            '',
        );

        setPlantName(
            '',
        );

        setVariety(
            '',
        );

        setTitle(
            '',
        );

        setTopic(
            'other',
        );

        setCustomTopicLabel(
            '',
        );

        setKnowledge(
            '',
        );

        setAliases(
            '',
        );

        setReferenceDate(
            getToday(),
        );

        setPhotoUrls(
            [],
        );
    }

    function getResolvedSubject(
        currentSubjectType:
            GardenReferenceSubjectType,

        currentSubjectId:
            string,

        currentSubjectLabel:
            string,

        currentPlantName:
            string,
    ) {
        const product =
            currentSubjectType ===
            'product'
                ? gardenData.products.find(
                      item =>
                          item.id ===
                          currentSubjectId,
                  )
                : undefined;

        const resolvedLabel =
            currentSubjectType ===
            'plant-crop'
                ? currentPlantName.trim()
                : currentSubjectType ===
                    'product'
                  ? product?.name ||
                    currentSubjectLabel.trim()
                  : currentSubjectLabel.trim();

        return {
            product,
            resolvedLabel,
        };
    }

    function handleSaveReference() {
        const resolved =
            getResolvedSubject(
                subjectType,
                subjectId,
                subjectLabel,
                plantName,
            );

        if (
            !title.trim() ||
            !resolved.resolvedLabel ||
            !knowledge.trim()
        ) {
            return;
        }

        const now =
            getNow();

        const reference:
            PlantReference =
            {
                id:
                    crypto.randomUUID(),

                subjectType,

                subjectId:
                    subjectType ===
                        'product' &&
                    resolved.product
                        ? resolved.product.id
                        : undefined,

                subjectLabel:
                    subjectType ===
                    'plant-crop'
                        ? undefined
                        : resolved.resolvedLabel,

                customSubjectTypeLabel:
                    subjectType ===
                    'other'
                        ? customSubjectTypeLabel.trim() ||
                          undefined
                        : undefined,

                plantName:
                    subjectType ===
                    'plant-crop'
                        ? plantName.trim()
                        : '',

                variety:
                    subjectType ===
                    'plant-crop'
                        ? variety.trim() ||
                          undefined
                        : undefined,

                title:
                    title.trim(),

                topic,

                customTopicLabel:
                    topic ===
                    'other'
                        ? customTopicLabel.trim() ||
                          undefined
                        : undefined,

                knowledge:
                    knowledge.trim(),

                aliases:
                    aliases
                        .split(
                            ',',
                        )
                        .map(
                            alias =>
                                alias.trim(),
                        )
                        .filter(
                            Boolean,
                        ),

                referenceDate:
                    referenceDate ||
                    undefined,

                photoUrls:
                    photoUrls.length >
                    0
                        ? photoUrls
                        : undefined,

                sourceIds:
                    [],

                relationships:
                    subjectType ===
                        'product' &&
                    resolved.product
                        ? [
                              {
                                  targetType:
                                      'product',

                                  targetId:
                                      resolved.product.id,

                                  label:
                                      resolved.product.name,

                                  createdAt:
                                      now,
                              },
                          ]
                        : [],

                createdAt:
                    now,
            };

        save([
            ...references,
            reference,
        ]);

        selectReference(
            reference.id,
        );

        resetComposer();

        setComposerOpen(
            false,
        );
    }

    function startEdit(
        reference:
            PlantReference,
    ) {
        setEditSubjectType(
            getSubjectType(
                reference,
            ),
        );

        setEditSubjectId(
            reference.subjectId ??
                '',
        );

        setEditSubjectLabel(
            getSubjectType(
                reference,
            ) ===
            'plant-crop'
                ? ''
                : reference.subjectLabel ??
                  '',
        );

        setEditCustomSubjectTypeLabel(
            reference.customSubjectTypeLabel ??
                '',
        );

        setEditPlantName(
            reference.plantName ??
                '',
        );

        setEditVariety(
            reference.variety ??
                '',
        );

        setEditTitle(
            getTitle(
                reference,
            ),
        );

        setEditTopic(
            reference.topic ??
                'other',
        );

        setEditCustomTopicLabel(
            reference.customTopicLabel ??
                '',
        );

        setEditKnowledge(
            getKnowledge(
                reference,
            ),
        );

        setEditAliases(
            (
                reference.aliases ??
                []
            ).join(
                ', ',
            ),
        );

        setEditReferenceDate(
            reference.referenceDate ??
                reference.createdAt.slice(
                    0,
                    10,
                ),
        );

        setEditPhotoUrls(
            reference.photoUrls ??
                [],
        );

        setEditingReferenceId(
            reference.id,
        );
    }

    function handleSaveEditedReference(
        reference:
            PlantReference,
    ) {
        const resolved =
            getResolvedSubject(
                editSubjectType,
                editSubjectId,
                editSubjectLabel,
                editPlantName,
            );

        if (
            !editTitle.trim() ||
            !resolved.resolvedLabel ||
            !editKnowledge.trim()
        ) {
            return;
        }

        const oldSubjectProductId =
            getSubjectType(
                reference,
            ) ===
            'product'
                ? reference.subjectId
                : undefined;

        const preservedRelationships =
            (
                reference.relationships ??
                []
            ).filter(
                relationship =>
                    !(
                        oldSubjectProductId &&
                        relationship.targetType ===
                            'product' &&
                        relationship.targetId ===
                            oldSubjectProductId
                    ),
            );

        const nextRelationships:
            KnowledgeRelationship[] =
            editSubjectType ===
                'product' &&
            resolved.product
                ? [
                      ...preservedRelationships,

                      {
                          targetType:
                              'product',

                          targetId:
                              resolved.product.id,

                          label:
                              resolved.product.name,

                          createdAt:
                              getNow(),
                      },
                  ]
                : preservedRelationships;

        const updated:
            PlantReference =
            {
                ...reference,

                subjectType:
                    editSubjectType,

                subjectId:
                    editSubjectType ===
                        'product' &&
                    resolved.product
                        ? resolved.product.id
                        : undefined,

                subjectLabel:
                    editSubjectType ===
                    'plant-crop'
                        ? undefined
                        : resolved.resolvedLabel,

                customSubjectTypeLabel:
                    editSubjectType ===
                    'other'
                        ? editCustomSubjectTypeLabel.trim() ||
                          undefined
                        : undefined,

                plantName:
                    editSubjectType ===
                    'plant-crop'
                        ? editPlantName.trim()
                        : '',

                variety:
                    editSubjectType ===
                    'plant-crop'
                        ? editVariety.trim() ||
                          undefined
                        : undefined,

                title:
                    editTitle.trim(),

                topic:
                    editTopic,

                customTopicLabel:
                    editTopic ===
                    'other'
                        ? editCustomTopicLabel.trim() ||
                          undefined
                        : undefined,

                knowledge:
                    editKnowledge.trim(),

                notes:
                    undefined,

                aliases:
                    editAliases
                        .split(
                            ',',
                        )
                        .map(
                            alias =>
                                alias.trim(),
                        )
                        .filter(
                            Boolean,
                        ),

                referenceDate:
                    editReferenceDate ||
                    undefined,

                photoUrls:
                    editPhotoUrls.length >
                    0
                        ? editPhotoUrls
                        : undefined,

                relationships:
                    nextRelationships,

                updatedAt:
                    getNow(),
            };

        save(
            references.map(
                item =>
                    item.id ===
                    reference.id
                        ? updated
                        : item,
            ),
        );

        setEditingReferenceId(
            null,
        );
    }

    function handleDelete(
        reference:
            PlantReference,
    ) {
        const confirmed =
            window.confirm(
                `Delete Garden Reference "${getTitle(
                    reference,
                )}"?\n\nOther Sprig records will not be deleted.`,
            );

        if (
            !confirmed
        ) {
            return;
        }

        save(
            references.filter(
                item =>
                    item.id !==
                    reference.id,
            ),
        );

        selectReference(
            null,
        );
    }

    function toggleTopic(
        topicValue:
            PlantReferenceTopic,

        checked:
            boolean,
    ) {
        setTopicFilters(
            current =>
                checked
                    ? current.includes(
                          topicValue,
                      )
                        ? current
                        : [
                              ...current,
                              topicValue,
                          ]
                    : current.filter(
                          value =>
                              value !==
                              topicValue,
                      ),
        );
    }

    function renderTopicFilter() {
        const summary =
            topicFilters.length ===
            0
                ? 'Every topic'
                : topicFilters.length ===
                    1
                  ? TOPIC_OPTIONS.find(
                        option =>
                            option.value ===
                            topicFilters[0],
                    )?.label ??
                    '1 topic selected'
                  : `${topicFilters.length} topics selected`;

        return (
            <details className="sprig-knowledge-paper">
                <summary>
                    {
                        summary
                    }
                </summary>

                <div className="sprig-knowledge-linker">
                    <label>
                        <input
                            type="checkbox"
                            checked={
                                topicFilters.length ===
                                0
                            }
                            onChange={() =>
                                setTopicFilters(
                                    [],
                                )
                            }
                        />

                        <span>
                            Every topic
                        </span>
                    </label>

                    {TOPIC_OPTIONS.map(
                        option => (
                            <label
                                key={
                                    option.value
                                }
                            >
                                <input
                                    type="checkbox"
                                    checked={topicFilters.includes(
                                        option.value,
                                    )}
                                    onChange={event =>
                                        toggleTopic(
                                            option.value,
                                            event
                                                .target
                                                .checked,
                                        )
                                    }
                                />

                                <span>
                                    {
                                        option.label
                                    }
                                </span>
                            </label>
                        ),
                    )}
                </div>

                <small>
                    Several selected topics work as OR:
                    a reference matching any selected topic
                    is included.
                </small>
            </details>
        );
    }

    function renderReferenceCard(
        reference:
            PlantReference,
    ) {
        return (
            <article
                key={
                    reference.id
                }
                className="sprig-knowledge-card"
            >
                <div>
                    <span
                        className="sprig-knowledge-card-kicker"
                        style={{
                            display:
                                'block',
                        }}
                    >
                        {getTopicLabel(
                            reference,
                        )}
                    </span>

                    <strong
                        style={{
                            display:
                                'block',

                            marginTop:
                                '5px',
                        }}
                    >
                        {getTitle(
                            reference,
                        )}
                    </strong>

                    <p>
                        {getAppliesToLabel(
                            reference,
                        )}
                    </p>

                    <p>
                        {getKnowledge(
                            reference,
                        )}
                    </p>
                </div>

                <div className="sprig-knowledge-card-meta">
                    <span>
                        {formatDate(
                            reference.referenceDate ??
                                reference.createdAt,
                        )}
                    </span>

                    <button
                        type="button"
                        className="sprig-knowledge-text-button"
                        onClick={() =>
                            selectReference(
                                reference.id,
                            )
                        }
                    >
                        Open reference ›
                    </button>
                </div>
            </article>
        );
    }

    function renderResults(
        resultReferences:
            PlantReference[],

        includeSubjectHeading:
            boolean,
    ) {
        if (
            resultReferences.length ===
            0
        ) {
            return (
                <div className="sprig-knowledge-empty">
                    <strong>
                        Nothing matches this view.
                    </strong>

                    <p>
                        Change the filters or search phrase to
                        widen the reference shelf.
                    </p>
                </div>
            );
        }

        const sorted =
            [
                ...resultReferences,
            ].sort(
                (
                    first,
                    second,
                ) => {
                    const subjectDifference =
                        getSubjectLabel(
                            first,
                        ).localeCompare(
                            getSubjectLabel(
                                second,
                            ),
                        );

                    if (
                        subjectDifference
                    ) {
                        return subjectDifference;
                    }

                    const varietyDifference =
                        (
                            first.variety ??
                            ''
                        ).localeCompare(
                            second.variety ??
                                '',
                        );

                    if (
                        varietyDifference
                    ) {
                        return varietyDifference;
                    }

                    const topicDifference =
                        getTopicLabel(
                            first,
                        ).localeCompare(
                            getTopicLabel(
                                second,
                            ),
                        );

                    return (
                        topicDifference ||
                        getTitle(
                            first,
                        ).localeCompare(
                            getTitle(
                                second,
                            ),
                        )
                    );
                },
            );

        if (
            displayMode ===
            'journal'
        ) {
            return (
                <div className="sprig-reference-journal">
                    {sorted.map(
                        (
                            reference,
                            referenceIndex,
                        ) => (
                            <article
                                key={
                                    reference.id
                                }
                                className="sprig-reference-journal-entry"
                            >
                                {includeSubjectHeading && (
                                    <div className="sprig-reference-journal-subject">
                                        <p className="section-label">
                                            {getSubjectTypeLabel(
                                                reference,
                                            )}
                                        </p>

                                        <h2>
                                            {getSubjectLabel(
                                                reference,
                                            )}
                                        </h2>
                                    </div>
                                )}

                                {getSubjectType(
                                    reference,
                                ) ===
                                    'plant-crop' && (
                                    <p className="sprig-reference-journal-variety">
                                        {reference.variety?.trim()
                                            ? reference.variety.trim()
                                            : 'All / General'}
                                    </p>
                                )}

                                <p className="section-label">
                                    {getTopicLabel(
                                        reference,
                                    )}
                                </p>

                                <h3 className="sprig-reference-journal-title">
                                    {getTitle(
                                        reference,
                                    )}
                                </h3>

                                <p className="sprig-knowledge-date">
                                    Reference dated{' '}
                                    {formatDate(
                                        reference.referenceDate ??
                                            reference.createdAt,
                                    )}
                                </p>

                                {(
                                    reference.aliases ??
                                    []
                                ).length >
                                    0 && (
                                    <p className="sprig-knowledge-muted">
                                        <strong>
                                            Other names:
                                        </strong>{' '}
                                        {(
                                            reference.aliases ??
                                            []
                                        ).join(
                                            ', ',
                                        )}
                                    </p>
                                )}

                                <div className="sprig-reference-journal-knowledge sprig-knowledge-prose">
                                    {getKnowledge(
                                        reference,
                                    )
                                        .split(
                                            /\r?\n/,
                                        )
                                        .map(
                                            (
                                                line,
                                                index,
                                            ) => (
                                                <p
                                                    key={`${reference.id}-journal-${index}`}
                                                >
                                                    {line ||
                                                        '\u00A0'}
                                                </p>
                                            ),
                                        )}
                                </div>

                                {(
                                    reference.photoUrls ??
                                    []
                                ).length >
                                    0 && (
                                    <div className="sprig-reference-journal-photos">
                                        <SprigPhotoGallery
                                            photoUrls={
                                                reference.photoUrls ??
                                                []
                                            }
                                            title="Reference photographs"
                                            photoAltPrefix={`${getTitle(
                                                reference,
                                            )} photograph`}
                                        />
                                    </div>
                                )}

                                {(
                                    reference.relationships ??
                                    []
                                ).length >
                                    0 && (
                                    <div className="sprig-reference-journal-relationships">
                                        <p className="section-label">
                                            Related Sprig records
                                        </p>

                                        <div className="sprig-knowledge-related-block">
                                            {(
                                                reference.relationships ??
                                                []
                                            ).map(
                                                relationship => (
                                                    <button
                                                        key={`${relationship.targetType}:${relationship.targetId}`}
                                                        type="button"
                                                        className="sprig-knowledge-related-link"
                                                        onClick={() =>
                                                            onOpenRelationship(
                                                                relationship.targetType,
                                                                relationship.targetId,
                                                            )
                                                        }
                                                    >
                                                        {getRelationshipLabel(
                                                            gardenData,
                                                            relationship,
                                                        )}

                                                        <span>
                                                            ›
                                                        </span>
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {referenceIndex <
                                    sorted.length -
                                        1 && (
                                    <div
                                        className="sprig-reference-journal-divider"
                                        aria-hidden="true"
                                    />
                                )}
                            </article>
                        ),
                    )}
                </div>
            );
        }

        if (
            !includeSubjectHeading
        ) {
            const sections =
                new Map<
                    string,
                    PlantReference[]
                >();

            sorted.forEach(
                reference => {
                    const varietyLabel =
                        getSubjectType(
                            reference,
                        ) ===
                        'plant-crop'
                            ? reference.variety?.trim() ||
                              'All / General'
                            : '';

                    const key =
                        `${normalise(
                            varietyLabel,
                        )}::${normalise(
                            getTopicLabel(
                                reference,
                            ),
                        )}`;

                    const existing =
                        sections.get(
                            key,
                        );

                    if (
                        existing
                    ) {
                        existing.push(
                            reference,
                        );
                    }
                    else {
                        sections.set(
                            key,
                            [
                                reference,
                            ],
                        );
                    }
                },
            );

            return (
                <div className="sprig-knowledge-card-list">
                    {Array.from(
                        sections.entries(),
                    ).map(
                        (
                            [
                                key,
                                sectionReferences,
                            ],
                        ) => {
                            const first =
                                sectionReferences[0];

                            const varietyLabel =
                                getSubjectType(
                                    first,
                                ) ===
                                'plant-crop'
                                    ? first.variety?.trim() ||
                                      'All / General'
                                    : '';

                            return (
                                <section
                                    key={
                                        key
                                    }
                                    className="sprig-knowledge-paper"
                                >
                                    {varietyLabel && (
                                        <p className="section-label">
                                            {
                                                varietyLabel
                                            }
                                        </p>
                                    )}

                                    <h3>
                                        {getTopicLabel(
                                            first,
                                        )}
                                    </h3>

                                    <div className="sprig-knowledge-card-list">
                                        {sectionReferences.map(
                                            renderReferenceCard,
                                        )}
                                    </div>
                                </section>
                            );
                        },
                    )}
                </div>
            );
        }

        return (
            <div className="sprig-knowledge-card-list">
                {sorted.map(
                    renderReferenceCard,
                )}
            </div>
        );
    }

    function renderSubjectBrowser(
        group:
            ReferenceSubjectGroup,
    ) {
        const isCrop =
            group.subjectType ===
            'plant-crop';

        const varieties =
            isCrop
                ? getVarieties(
                      group.references,
                  )
                : [];

        const filtered =
            filterSubjectReferences(
                group.references,
                varietyFilter,
                topicFilters,
                query,
            );

        const selectedSpecificVariety =
            isCrop &&
            varietyFilter !==
                'all' &&
            varietyFilter !==
                'general'
                ? varietyFilter
                : null;

        return (
            <div className="sprig-knowledge-detail">
                <div className="sprig-knowledge-detail-toolbar">
                    <button
                        type="button"
                        className="sprig-knowledge-text-button"
                        onClick={
                            closeSubject
                        }
                    >
                        ← Reference shelf
                    </button>

                    <div className="sprig-knowledge-detail-actions">
                        {filtered.length >
                            0 && (
                            <>
                                <button
                                    type="button"
                                    className="sprig-knowledge-text-button"
                                    onClick={() =>
                                        printReferences(
                                            filtered,
                                        )
                                    }
                                >
                                    PDF
                                </button>

                                <button
                                    type="button"
                                    className="sprig-knowledge-text-button"
                                    onClick={() =>
                                        downloadRtf(
                                            `${group.label}-Garden-Reference`,
                                            filtered,
                                        )
                                    }
                                >
                                    RTF
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <section className="sprig-knowledge-paper">
                    <p className="section-label">
                        Garden Reference ·{' '}
                        {getSubjectTypeLabel(
                            group.references[0],
                        )}
                    </p>

                    <h2>
                        {
                            group.label
                        }
                    </h2>

                    <p>
                        All reusable knowledge Sprig has stored
                        for this subject. The underlying
                        references remain separate and editable.
                    </p>

                    {selectedSpecificVariety && (
                        <p className="sprig-knowledge-muted">
                            Showing{' '}
                            <strong>
                                {
                                    selectedSpecificVariety
                                }
                            </strong>{' '}
                            plus what Sprig knows about{' '}
                            <strong>
                                {
                                    group.label
                                }
                            </strong>{' '}
                            generally.
                        </p>
                    )}

                    {isCrop && (
                        <label className="sprig-knowledge-field">
                            <span>
                                Variety
                            </span>

                            <select
                                value={
                                    varietyFilter
                                }
                                onChange={event =>
                                    setVarietyFilter(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            >
                                <option value="all">
                                    Everything about {
                                        group.label
                                    }
                                </option>

                                <option value="general">
                                    {
                                        group.label
                                    } generally
                                </option>

                                {varieties.map(
                                    item => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>
                    )}

                    {renderTopicFilter()}

                    <label className="sprig-knowledge-field">
                        <span>
                            Search this subject
                        </span>

                        <input
                            type="search"
                            value={
                                query
                            }
                            onChange={event =>
                                setQuery(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Title, topic, variety, other name or anything in the knowledge..."
                        />
                    </label>

                    <div className="sprig-knowledge-detail-actions">
                        <button
                            type="button"
                            className={
                                displayMode ===
                                'cards'
                                    ? 'sprig-knowledge-primary-button'
                                    : 'sprig-knowledge-secondary-button'
                            }
                            onClick={() =>
                                setDisplayMode(
                                    'cards',
                                )
                            }
                        >
                            Go back to seeing the cards
                        </button>

                        <button
                            type="button"
                            className={
                                displayMode ===
                                'journal'
                                    ? 'sprig-knowledge-primary-button'
                                    : 'sprig-knowledge-secondary-button'
                            }
                            onClick={() =>
                                setDisplayMode(
                                    'journal',
                                )
                            }
                        >
                            Read all cards in Journal layout
                        </button>
                    </div>
                </section>

                {renderResults(
                    filtered,
                    false,
                )}
            </div>
        );
    }

    function renderEditSubjectFields() {
        return (
            <>
                <label className="sprig-knowledge-field">
                    <span>
                        What is this reference about?
                    </span>

                    <select
                        value={
                            editSubjectType
                        }
                        onChange={event => {
                            setEditSubjectType(
                                event
                                    .target
                                    .value as GardenReferenceSubjectType,
                            );

                            setEditSubjectId(
                                '',
                            );

                            setEditSubjectLabel(
                                '',
                            );

                            setEditCustomSubjectTypeLabel(
                                '',
                            );
                        }}
                    >
                        {SUBJECT_OPTIONS.map(
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

                {editSubjectType ===
                    'plant-crop' && (
                    <>
                        <label className="sprig-knowledge-field">
                            <span>
                                Plant or crop
                            </span>

                            <input
                                type="text"
                                value={
                                    editPlantName
                                }
                                onChange={event =>
                                    setEditPlantName(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </label>

                        <label className="sprig-knowledge-field">
                            <span>
                                Variety
                                <small>
                                    leave blank for All / General varieties
                                </small>
                            </span>

                            <input
                                type="text"
                                value={
                                    editVariety
                                }
                                onChange={event =>
                                    setEditVariety(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </label>
                    </>
                )}

                {editSubjectType ===
                    'product' && (
                    <>
                        <label className="sprig-knowledge-field">
                            <span>
                                Saved product
                            </span>

                            <select
                                value={
                                    editSubjectId
                                }
                                onChange={event => {
                                    setEditSubjectId(
                                        event
                                            .target
                                            .value,
                                    );

                                    const product =
                                        gardenData.products.find(
                                            item =>
                                                item.id ===
                                                event
                                                    .target
                                                    .value,
                                        );

                                    if (
                                        product
                                    ) {
                                        setEditSubjectLabel(
                                            product.name,
                                        );
                                    }
                                }}
                            >
                                <option value="">
                                    Choose a saved product
                                </option>

                                {[
                                    ...gardenData.products,
                                ]
                                    .sort(
                                        (
                                            first,
                                            second,
                                        ) =>
                                            first.name.localeCompare(
                                                second.name,
                                            ),
                                    )
                                    .map(
                                        product => (
                                            <option
                                                key={
                                                    product.id
                                                }
                                                value={
                                                    product.id
                                                }
                                            >
                                                {
                                                    product.name
                                                }
                                            </option>
                                        ),
                                    )}
                            </select>
                        </label>

                        {!editSubjectId && (
                            <label className="sprig-knowledge-field">
                                <span>
                                    Product name
                                </span>

                                <input
                                    type="text"
                                    value={
                                        editSubjectLabel
                                    }
                                    onChange={event =>
                                        setEditSubjectLabel(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>
                        )}
                    </>
                )}

                {editSubjectType ===
                    'pest-problem' && (
                    <label className="sprig-knowledge-field">
                        <span>
                            Pest, disease or problem
                        </span>

                        <input
                            type="text"
                            value={
                                editSubjectLabel
                            }
                            onChange={event =>
                                setEditSubjectLabel(
                                    event
                                        .target
                                        .value,
                                )
                            }
                        />
                    </label>
                )}

                {editSubjectType ===
                    'other' && (
                    <>
                        <label className="sprig-knowledge-field">
                            <span>
                                Your subject type
                                <small>
                                    optional
                                </small>
                            </span>

                            <input
                                type="text"
                                value={
                                    editCustomSubjectTypeLabel
                                }
                                onChange={event =>
                                    setEditCustomSubjectTypeLabel(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </label>

                        <label className="sprig-knowledge-field">
                            <span>
                                Subject name
                            </span>

                            <input
                                type="text"
                                value={
                                    editSubjectLabel
                                }
                                onChange={event =>
                                    setEditSubjectLabel(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </label>
                    </>
                )}
            </>
        );
    }

    function renderDetail(
        reference:
            PlantReference,
    ) {
        const isEditing =
            editingReferenceId ===
            reference.id;

        return (
            <div className="sprig-knowledge-detail">
                <div className="sprig-knowledge-detail-toolbar">
                    <button
                        type="button"
                        className="sprig-knowledge-text-button"
                        onClick={() =>
                            selectReference(
                                null,
                            )
                        }
                    >
                        ← Garden Reference
                    </button>

                    <div className="sprig-knowledge-detail-actions">
                        <button
                            type="button"
                            className="sprig-knowledge-text-button"
                            onClick={() =>
                                printReferences(
                                    [
                                        reference,
                                    ],
                                )
                            }
                        >
                            PDF
                        </button>

                        <button
                            type="button"
                            className="sprig-knowledge-text-button"
                            onClick={() =>
                                downloadRtf(
                                    getTitle(
                                        reference,
                                    ),
                                    [
                                        reference,
                                    ],
                                )
                            }
                        >
                            RTF
                        </button>

                        {!isEditing && (
                            <button
                                type="button"
                                className="sprig-knowledge-text-button"
                                onClick={() =>
                                    startEdit(
                                        reference,
                                    )
                                }
                            >
                                Edit
                            </button>
                        )}

                        <button
                            type="button"
                            className="sprig-knowledge-text-button sprig-knowledge-text-button--danger"
                            onClick={() =>
                                handleDelete(
                                    reference,
                                )
                            }
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {isEditing ? (
                    <section className="sprig-knowledge-paper sprig-knowledge-capture">
                        <p className="section-label">
                            Edit Garden Reference
                        </p>

                        <h2>
                            Edit this piece of reusable knowledge
                        </h2>

                        {renderEditSubjectFields()}

                        <label className="sprig-knowledge-field">
                            <span>
                                Title
                            </span>

                            <input
                                type="text"
                                value={
                                    editTitle
                                }
                                onChange={event =>
                                    setEditTitle(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </label>

                        <label className="sprig-knowledge-field">
                            <span>
                                Topic
                            </span>

                            <select
                                value={
                                    editTopic
                                }
                                onChange={event =>
                                    setEditTopic(
                                        event
                                            .target
                                            .value as PlantReferenceTopic,
                                    )
                                }
                            >
                                {TOPIC_OPTIONS.map(
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

                        {editTopic ===
                            'other' && (
                            <label className="sprig-knowledge-field">
                                <span>
                                    Your topic name
                                    <small>
                                        optional
                                    </small>
                                </span>

                                <input
                                    type="text"
                                    value={
                                        editCustomTopicLabel
                                    }
                                    onChange={event =>
                                        setEditCustomTopicLabel(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>
                        )}

                        <label className="sprig-knowledge-field">
                            <span>
                                Knowledge
                            </span>

                            <textarea
                                rows={
                                    12
                                }
                                value={
                                    editKnowledge
                                }
                                onChange={event =>
                                    setEditKnowledge(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </label>

                        <label className="sprig-knowledge-field">
                            <span>
                                Other names
                                <small>
                                    optional · comma separated
                                </small>
                            </span>

                            <input
                                type="text"
                                value={
                                    editAliases
                                }
                                onChange={event =>
                                    setEditAliases(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </label>

                        <label className="sprig-knowledge-field">
                            <span>
                                Reference date
                            </span>

                            <input
                                type="date"
                                value={
                                    editReferenceDate
                                }
                                onChange={event =>
                                    setEditReferenceDate(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </label>

                        <SprigPhotoPicker
                            photoUrls={
                                editPhotoUrls
                            }
                            onChange={
                                setEditPhotoUrls
                            }
                            title="Photographs"
                            helperText="Add or remove photographs that belong to this reference."
                            addButtonText="Add photographs"
                            photoAltPrefix="Garden Reference photograph"
                            multiple={
                                true
                            }
                            maxPhotos={
                                12
                            }
                        />

                        <div className="sprig-knowledge-detail-actions">
                            <button
                                type="button"
                                className="sprig-knowledge-primary-button"
                                onClick={() =>
                                    handleSaveEditedReference(
                                        reference,
                                    )
                                }
                                disabled={
                                    !editTitle.trim() ||
                                    !editKnowledge.trim()
                                }
                            >
                                Save changes
                            </button>

                            <button
                                type="button"
                                className="sprig-knowledge-secondary-button"
                                onClick={() =>
                                    setEditingReferenceId(
                                        null,
                                    )
                                }
                            >
                                Cancel
                            </button>
                        </div>
                    </section>
                ) : (
                    <>
                        <article className="sprig-knowledge-paper">
                            <p className="section-label">
                                Garden Reference
                            </p>

                            <h2>
                                {getTitle(
                                    reference,
                                )}
                            </h2>

                            <p className="sprig-knowledge-reference-variety">
                                {getAppliesToLabel(
                                    reference,
                                )}
                            </p>

                            <p className="sprig-knowledge-muted">
                                Topic:{' '}
                                {getTopicLabel(
                                    reference,
                                )}
                            </p>

                            <p className="sprig-knowledge-date">
                                Reference dated{' '}
                                {formatDate(
                                    reference.referenceDate ??
                                        reference.createdAt,
                                )}
                            </p>

                            {(
                                reference.aliases ??
                                []
                            ).length >
                                0 && (
                                <p className="sprig-knowledge-muted">
                                    Other names:{' '}
                                    {(
                                        reference.aliases ??
                                        []
                                    ).join(
                                        ', ',
                                    )}
                                </p>
                            )}

                            <div className="sprig-knowledge-prose">
                                {getKnowledge(
                                    reference,
                                )
                                    .split(
                                        /\r?\n/,
                                    )
                                    .map(
                                        (
                                            line,
                                            index,
                                        ) => (
                                            <p
                                                key={`${reference.id}-knowledge-${index}`}
                                            >
                                                {line ||
                                                    '\u00A0'}
                                            </p>
                                        ),
                                    )}
                            </div>

                            {(
                                reference.relationships ??
                                []
                            ).length >
                                0 && (
                                <div className="sprig-knowledge-related-block">
                                    <h3>
                                        Related Sprig records
                                    </h3>

                                    {(
                                        reference.relationships ??
                                        []
                                    ).map(
                                        relationship => (
                                            <button
                                                key={`${relationship.targetType}:${relationship.targetId}`}
                                                type="button"
                                                className="sprig-knowledge-related-link"
                                                onClick={() =>
                                                    onOpenRelationship(
                                                        relationship.targetType,
                                                        relationship.targetId,
                                                    )
                                                }
                                            >
                                                {getRelationshipLabel(
                                                    gardenData,
                                                    relationship,
                                                )}

                                                <span>
                                                    ›
                                                </span>
                                            </button>
                                        ),
                                    )}
                                </div>
                            )}
                        </article>

                        {(
                            reference.photoUrls ??
                            []
                        ).length >
                            0 && (
                            <SprigPhotoGallery
                                photoUrls={
                                    reference.photoUrls ??
                                    []
                                }
                                title="Reference photographs"
                                photoAltPrefix="Garden Reference photograph"
                            />
                        )}
                    </>
                )}
            </div>
        );
    }

    if (
        selectedReference
    ) {
        return renderDetail(
            selectedReference,
        );
    }

    if (
        selectedSubject
    ) {
        return renderSubjectBrowser(
            selectedSubject,
        );
    }

    const globalFiltersActive =
        Boolean(
            query.trim(),
        ) ||
        subjectFilter !==
            'all' ||
        topicFilters.length >
            0;

    const filteredReferences =
        filterReferences(
            references,
            subjectFilter,
            topicFilters,
            query,
        );

    const filteredGroups =
        getSubjectGroups(
            filteredReferences,
        );

    const shelfSections =
        SUBJECT_OPTIONS.map(
            option => ({
                ...option,

                groups:
                    filteredGroups.filter(
                        group =>
                            group.subjectType ===
                            option.value,
                    ),
            }),
        ).filter(
            section =>
                section.groups.length >
                0,
        );

    const selectedProduct =
        gardenData.products.find(
            item =>
                item.id ===
                subjectId,
        );

    const subjectReady =
        subjectType ===
        'plant-crop'
            ? Boolean(
                  plantName.trim(),
              )
            : subjectType ===
                'product'
              ? Boolean(
                    selectedProduct ||
                    subjectLabel.trim(),
                )
              : Boolean(
                    subjectLabel.trim(),
                );

    return (
        <div className="sprig-knowledge-two-column sprig-knowledge-browse-first">
            <div className="sprig-knowledge-mobile-add">
                <button
                    type="button"
                    className="sprig-knowledge-mobile-add-button"
                    aria-expanded={
                        composerOpen
                    }
                    aria-controls="sprig-garden-reference-composer"
                    onClick={() =>
                        setComposerOpen(
                            current =>
                                !current,
                        )
                    }
                >
                    <span>
                        {composerOpen
                            ? '−'
                            : '+'}
                    </span>

                    {composerOpen
                        ? 'Close Garden Reference form'
                        : 'Add Garden Reference'}
                </button>
            </div>

            <section
                id="sprig-garden-reference-composer"
                className={`sprig-knowledge-paper sprig-knowledge-capture sprig-knowledge-mobile-collapsible${
                    composerOpen
                        ? ' sprig-knowledge-mobile-collapsible--open'
                        : ''
                }`}
            >
                <p className="section-label">
                    Garden Reference
                </p>

                <h2>
                    Add one reusable piece of garden knowledge
                </h2>

                <p>
                    Tell Sprig what the knowledge is about
                    first. Crops can narrow to a variety;
                    products can link to the actual Product
                    record; pests, diseases, problems and
                    other subjects use the same reference
                    system.
                </p>

                <label className="sprig-knowledge-field">
                    <span>
                        What is this reference about?
                    </span>

                    <select
                        value={
                            subjectType
                        }
                        onChange={event => {
                            setSubjectType(
                                event
                                    .target
                                    .value as GardenReferenceSubjectType,
                            );

                            setSubjectId(
                                '',
                            );

                            setSubjectLabel(
                                '',
                            );

                            setCustomSubjectTypeLabel(
                                '',
                            );

                            setPlantName(
                                '',
                            );

                            setVariety(
                                '',
                            );
                        }}
                    >
                        {SUBJECT_OPTIONS.map(
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

                {subjectType ===
                    'plant-crop' && (
                    <>
                        <label className="sprig-knowledge-field">
                            <span>
                                Plant or crop
                            </span>

                            <input
                                type="text"
                                value={
                                    plantName
                                }
                                onChange={event =>
                                    setPlantName(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Potato"
                            />
                        </label>

                        <label className="sprig-knowledge-field">
                            <span>
                                Variety
                                <small>
                                    leave blank for All / General varieties
                                </small>
                            </span>

                            <input
                                type="text"
                                value={
                                    variety
                                }
                                onChange={event =>
                                    setVariety(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Royal Blue"
                            />
                        </label>
                    </>
                )}

                {subjectType ===
                    'product' && (
                    <>
                        <label className="sprig-knowledge-field">
                            <span>
                                Saved product
                            </span>

                            <select
                                value={
                                    subjectId
                                }
                                onChange={event => {
                                    setSubjectId(
                                        event
                                            .target
                                            .value,
                                    );

                                    const product =
                                        gardenData.products.find(
                                            item =>
                                                item.id ===
                                                event
                                                    .target
                                                    .value,
                                        );

                                    if (
                                        product
                                    ) {
                                        setSubjectLabel(
                                            product.name,
                                        );
                                    }
                                }}
                            >
                                <option value="">
                                    Choose a saved product
                                </option>

                                {[
                                    ...gardenData.products,
                                ]
                                    .sort(
                                        (
                                            first,
                                            second,
                                        ) =>
                                            first.name.localeCompare(
                                                second.name,
                                            ),
                                    )
                                    .map(
                                        product => (
                                            <option
                                                key={
                                                    product.id
                                                }
                                                value={
                                                    product.id
                                                }
                                            >
                                                {
                                                    product.name
                                                }
                                            </option>
                                        ),
                                    )}
                            </select>

                            <small>
                                If the product already exists
                                in Sprig, this keeps that
                                original record directly
                                reachable.
                            </small>
                        </label>

                        {!subjectId && (
                            <label className="sprig-knowledge-field">
                                <span>
                                    Product name
                                    <small>
                                        if it is not saved in Products yet
                                    </small>
                                </span>

                                <input
                                    type="text"
                                    value={
                                        subjectLabel
                                    }
                                    onChange={event =>
                                        setSubjectLabel(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Eco-Neem"
                                />
                            </label>
                        )}
                    </>
                )}

                {subjectType ===
                    'pest-problem' && (
                    <label className="sprig-knowledge-field">
                        <span>
                            Pest, disease or problem
                        </span>

                        <input
                            type="text"
                            value={
                                subjectLabel
                            }
                            onChange={event =>
                                setSubjectLabel(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Aphids, powdery mildew, blossom end rot..."
                        />
                    </label>
                )}

                {subjectType ===
                    'other' && (
                    <>
                        <label className="sprig-knowledge-field">
                            <span>
                                Your subject type
                                <small>
                                    optional
                                </small>
                            </span>

                            <input
                                type="text"
                                value={
                                    customSubjectTypeLabel
                                }
                                onChange={event =>
                                    setCustomSubjectTypeLabel(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Tool, weather, technique, wildlife..."
                            />
                        </label>

                        <label className="sprig-knowledge-field">
                            <span>
                                Subject name
                            </span>

                            <input
                                type="text"
                                value={
                                    subjectLabel
                                }
                                onChange={event =>
                                    setSubjectLabel(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Heatwave shade cloth"
                            />
                        </label>
                    </>
                )}

                <label className="sprig-knowledge-field">
                    <span>
                        Title
                    </span>

                    <input
                        type="text"
                        value={
                            title
                        }
                        onChange={event =>
                            setTitle(
                                event
                                    .target
                                    .value,
                            )
                        }
                        placeholder="When and how to use this"
                    />
                </label>

                <label className="sprig-knowledge-field">
                    <span>
                        Topic
                    </span>

                    <select
                        value={
                            topic
                        }
                        onChange={event =>
                            setTopic(
                                event
                                    .target
                                    .value as PlantReferenceTopic,
                            )
                        }
                    >
                        {TOPIC_OPTIONS.map(
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

                {topic ===
                    'other' && (
                    <label className="sprig-knowledge-field">
                        <span>
                            Your topic name
                            <small>
                                optional
                            </small>
                        </span>

                        <input
                            type="text"
                            value={
                                customTopicLabel
                            }
                            onChange={event =>
                                setCustomTopicLabel(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Application, storage, propagation..."
                        />
                    </label>
                )}

                <label className="sprig-knowledge-field">
                    <span>
                        Knowledge
                    </span>

                    <textarea
                        rows={
                            10
                        }
                        value={
                            knowledge
                        }
                        onChange={event =>
                            setKnowledge(
                                event
                                    .target
                                    .value,
                            )
                        }
                        placeholder="The reusable information Sprig should remember..."
                    />
                </label>

                <label className="sprig-knowledge-field">
                    <span>
                        Other names
                        <small>
                            optional · comma separated
                        </small>
                    </span>

                    <input
                        type="text"
                        value={
                            aliases
                        }
                        onChange={event =>
                            setAliases(
                                event
                                    .target
                                    .value,
                            )
                        }
                        placeholder="Other name, label name, common name..."
                    />
                </label>

                <label className="sprig-knowledge-field">
                    <span>
                        Reference date
                    </span>

                    <input
                        type="date"
                        value={
                            referenceDate
                        }
                        onChange={event =>
                            setReferenceDate(
                                event
                                    .target
                                    .value,
                            )
                        }
                    />
                </label>

                <SprigPhotoPicker
                    photoUrls={
                        photoUrls
                    }
                    onChange={
                        setPhotoUrls
                    }
                    title="Photographs"
                    helperText="Add labels, diagrams, packaging or other photographs that support this piece of knowledge."
                    addButtonText="Add photographs"
                    photoAltPrefix="Garden Reference photograph"
                    multiple={
                        true
                    }
                    maxPhotos={
                        12
                    }
                />

                <div className="sprig-knowledge-composer-actions">
                    <button
                        type="button"
                        className="sprig-knowledge-primary-button"
                        onClick={
                            handleSaveReference
                        }
                        disabled={
                            !title.trim() ||
                            !subjectReady ||
                            !knowledge.trim()
                        }
                    >
                        Add Garden Reference
                    </button>

                    <button
                        type="button"
                        className="sprig-knowledge-secondary-button sprig-knowledge-mobile-composer-cancel"
                        onClick={() => {
                            resetComposer();

                            setComposerOpen(
                                false,
                            );
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </section>

            <section className="sprig-knowledge-list-section">
                <div className="sprig-knowledge-section-heading">
                    <div>
                        <p className="section-label">
                            Reference shelf
                        </p>

                        <h2>
                            Reusable garden knowledge
                        </h2>
                    </div>

                    <span className="sprig-knowledge-count">
                        {
                            references.length
                        }{' '}
                        {references.length ===
                        1
                            ? 'reference'
                            : 'references'}
                    </span>
                </div>

                <section className="sprig-knowledge-paper">
                    <p className="section-label">
                        Find across Garden Reference
                    </p>

                    <label className="sprig-knowledge-field">
                        <span>
                            Subject kind
                        </span>

                        <select
                            value={
                                subjectFilter
                            }
                            onChange={event =>
                                setSubjectFilter(
                                    event
                                        .target
                                        .value as ReferenceSubjectFilter,
                                )
                            }
                        >
                            <option value="all">
                                All subjects
                            </option>

                            {SUBJECT_OPTIONS.map(
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

                    {renderTopicFilter()}

                    <label className="sprig-knowledge-field">
                        <span>
                            Search all Garden Reference
                        </span>

                        <input
                            type="search"
                            value={
                                query
                            }
                            onChange={event =>
                                setQuery(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Crop, product, pest, variety, title, topic, other name or knowledge..."
                        />

                        <small>
                            Search crosses subjects, crops,
                            varieties, titles, topics, other
                            names and the knowledge itself.
                        </small>
                    </label>

                    {globalFiltersActive && (
                        <div className="sprig-knowledge-detail-actions">
                            <button
                                type="button"
                                className={
                                    displayMode ===
                                    'cards'
                                        ? 'sprig-knowledge-primary-button'
                                        : 'sprig-knowledge-secondary-button'
                                }
                                onClick={() =>
                                    setDisplayMode(
                                        'cards',
                                    )
                                }
                            >
                                Go back to seeing the cards
                            </button>

                            <button
                                type="button"
                                className={
                                    displayMode ===
                                    'journal'
                                        ? 'sprig-knowledge-primary-button'
                                        : 'sprig-knowledge-secondary-button'
                                }
                                onClick={() =>
                                    setDisplayMode(
                                        'journal',
                                    )
                                }
                            >
                                Read all cards in Journal layout
                            </button>
                        </div>
                    )}
                </section>

                {references.length ===
                0 ? (
                    <div className="sprig-knowledge-empty">
                        <strong>
                            Your Garden Reference shelf is waiting.
                        </strong>

                        <p>
                            Add reusable knowledge about crops,
                            products, pests, diseases, problems
                            or anything else worth finding
                            again.
                        </p>
                    </div>
                ) : globalFiltersActive ? (
                    renderResults(
                        filteredReferences,
                        true,
                    )
                ) : (
                    <div className="sprig-knowledge-card-list">
                        {shelfSections.map(
                            section => (
                                <section
                                    key={
                                        section.value
                                    }
                                >
                                    <div className="sprig-knowledge-section-heading">
                                        <div>
                                            <p className="section-label">
                                                Garden Reference
                                            </p>

                                            <h3>
                                                {
                                                    section.label
                                                }
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="sprig-knowledge-card-list">
                                        {section.groups.map(
                                            group => {
                                                const varieties =
                                                    group.subjectType ===
                                                    'plant-crop'
                                                        ? getVarieties(
                                                              group.references,
                                                          )
                                                        : [];

                                                const topics =
                                                    Array.from(
                                                        new Set(
                                                            group.references.map(
                                                                reference =>
                                                                    getTopicLabel(
                                                                        reference,
                                                                    ),
                                                            ),
                                                        ),
                                                    ).sort();

                                                const hasGeneralKnowledge =
                                                    group.subjectType ===
                                                        'plant-crop' &&
                                                    group.references.some(
                                                        reference =>
                                                            !reference.variety?.trim(),
                                                    );

                                                const onlyReference =
                                                    group.references.length ===
                                                    1
                                                        ? group.references[0]
                                                        : null;

                                                if (
                                                    onlyReference
                                                ) {
                                                    const singleDetails =
                                                        [
                                                            onlyReference.variety?.trim() ||
                                                                '',
                                                            getTopicLabel(
                                                                onlyReference,
                                                            ),
                                                        ]
                                                            .filter(
                                                                Boolean,
                                                            )
                                                            .join(
                                                                ' · ',
                                                            );

                                                    return (
                                                        <article
                                                            key={
                                                                group.key
                                                            }
                                                            className="sprig-knowledge-paper sprig-knowledge-almanac-card"
                                                        >
                                                            <div className="sprig-reference-card-summary">
                                                                <p className="section-label">
                                                                    {
                                                                        section.label
                                                                    }
                                                                </p>

                                                                <h3>
                                                                    {
                                                                        group.label
                                                                    }
                                                                </h3>

                                                                <p className="sprig-knowledge-muted">
                                                                    1 saved reference
                                                                </p>

                                                                {singleDetails && (
                                                                    <p>
                                                                        {
                                                                            singleDetails
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="sprig-knowledge-detail-actions">
                                                                <button
                                                                    type="button"
                                                                    className="sprig-knowledge-text-button"
                                                                    onClick={() =>
                                                                        selectReference(
                                                                            onlyReference.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Open reference ›
                                                                </button>
                                                            </div>
                                                        </article>
                                                    );
                                                }

                                                return (
                                                    <article
                                                        key={
                                                            group.key
                                                        }
                                                        className="sprig-knowledge-paper sprig-knowledge-almanac-card"
                                                    >
                                                        <div className="sprig-reference-card-summary">
                                                            <p className="section-label">
                                                                {
                                                                    section.label
                                                                }
                                                            </p>

                                                            <h3>
                                                                {
                                                                    group.label
                                                                }
                                                            </h3>

                                                            <p className="sprig-knowledge-muted">
                                                                {
                                                                    group
                                                                        .references
                                                                        .length
                                                                }{' '}
                                                                saved references

                                                                {group.subjectType ===
                                                                    'plant-crop' && (
                                                                    <>
                                                                        {
                                                                            ' · '
                                                                        }

                                                                        {
                                                                            varieties.length
                                                                        }{' '}

                                                                        {varieties.length ===
                                                                        1
                                                                            ? 'named variety'
                                                                            : 'named varieties'}
                                                                    </>
                                                                )}
                                                            </p>
                                                        </div>

                                                        {group.subjectType ===
                                                            'plant-crop' && (
                                                            <div className="sprig-reference-card-index">
                                                                <span className="sprig-reference-card-index-label">
                                                                    Varieties
                                                                </span>

                                                                <div className="sprig-reference-card-chip-row">
                                                                    <button
                                                                        type="button"
                                                                        className="sprig-reference-card-chip"
                                                                        onClick={() =>
                                                                            openSubject(
                                                                                group,
                                                                                'cards',
                                                                                'all',
                                                                            )
                                                                        }
                                                                    >
                                                                        Everything about{' '}
                                                                        {
                                                                            group.label
                                                                        }
                                                                    </button>

                                                                    {hasGeneralKnowledge && (
                                                                        <button
                                                                            type="button"
                                                                            className="sprig-reference-card-chip"
                                                                            onClick={() =>
                                                                                openSubject(
                                                                                    group,
                                                                                    'cards',
                                                                                    'general',
                                                                                )
                                                                            }
                                                                        >
                                                                            {
                                                                                group.label
                                                                            }{' '}
                                                                            generally
                                                                        </button>
                                                                    )}

                                                                    {varieties.map(
                                                                        varietyName => (
                                                                            <button
                                                                                key={
                                                                                    varietyName
                                                                                }
                                                                                type="button"
                                                                                className="sprig-reference-card-chip"
                                                                                onClick={() =>
                                                                                    openSubject(
                                                                                        group,
                                                                                        'cards',
                                                                                        varietyName,
                                                                                    )
                                                                                }
                                                                            >
                                                                                {
                                                                                    varietyName
                                                                                }
                                                                            </button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {topics.length >
                                                            0 && (
                                                            <div className="sprig-reference-card-index">
                                                                <span className="sprig-reference-card-index-label">
                                                                    Topics
                                                                </span>

                                                                <div className="sprig-reference-card-chip-row">
                                                                    <button
                                                                        type="button"
                                                                        className="sprig-reference-card-chip"
                                                                        onClick={() =>
                                                                            openSubject(
                                                                                group,
                                                                                'cards',
                                                                                'all',
                                                                            )
                                                                        }
                                                                    >
                                                                        Every topic
                                                                    </button>

                                                                    {topics.map(
                                                                        topicLabel => {
                                                                            const matchingReference =
                                                                                group.references.find(
                                                                                    reference =>
                                                                                        getTopicLabel(
                                                                                            reference,
                                                                                        ) ===
                                                                                        topicLabel,
                                                                                );

                                                                            const matchingTopic =
                                                                                matchingReference?.topic;

                                                                            if (
                                                                                !matchingTopic
                                                                            ) {
                                                                                return null;
                                                                            }

                                                                            const topicQuery =
                                                                                matchingTopic ===
                                                                                    'other' &&
                                                                                matchingReference?.customTopicLabel?.trim()
                                                                                    ? matchingReference.customTopicLabel.trim()
                                                                                    : '';

                                                                            return (
                                                                                <button
                                                                                    key={
                                                                                        topicLabel
                                                                                    }
                                                                                    type="button"
                                                                                    className="sprig-reference-card-chip"
                                                                                    onClick={() =>
                                                                                        openSubject(
                                                                                            group,
                                                                                            'cards',
                                                                                            'all',
                                                                                            matchingTopic,
                                                                                            topicQuery,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        topicLabel
                                                                                    }
                                                                                </button>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="sprig-knowledge-detail-actions">
                                                            <button
                                                                type="button"
                                                                className="sprig-knowledge-text-button"
                                                                onClick={() =>
                                                                    openSubject(
                                                                        group,
                                                                        'journal',
                                                                    )
                                                                }
                                                            >
                                                                Read all cards in Journal layout ›
                                                            </button>
                                                        </div>
                                                    </article>
                                                );
                                            },
                                        )}
                                    </div>
                                </section>
                            ),
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}