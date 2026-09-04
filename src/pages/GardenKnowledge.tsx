import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import GardenLayout from '../components/layout/GardenLayout';
import GardenReference from '../components/knowledge/GardenReference';
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery';
import SprigPhotoPicker from '../components/photos/SprigPhotoPicker';

import type {
    AppPage,
} from '../types/navigation';

import type {
    GardenData,
    GardenEvent,
    GardenNote,
    GardenPlan,
    KnowledgePlacement,
    KnowledgeRelationship,
    KnowledgeRelationshipTargetType,
    PlantReference,
    SavedKnowledgeSource,
    SavedKnowledgeSourceKind,
} from '../types';

import '../css/garden-knowledge.css';


export type GardenKnowledgeView =
    | 'notes'
    | 'almanac'
    | 'reference'
    | 'sources';


export type GardenKnowledgeRecordType =
    | 'garden-note'
    | 'plant-reference'
    | 'saved-source';


interface GardenKnowledgeRecordDestination {
    sourceType:
        GardenKnowledgeRecordType;

    recordId:
        string;
}


interface GardenKnowledgeProps {
    view:
        GardenKnowledgeView;

    gardenData:
        GardenData;

    initialRecord?:
        GardenKnowledgeRecordDestination |
        null;

    journeyBackLabel?:
        string |
        null;

    onJourneyBack?:
        () => void;

    onGardenDataChange:
        (
            gardenData:
                GardenData,
        ) => void;

    onRecordSelectionChange:
        (
            destination:
                | GardenKnowledgeRecordDestination
                | null,
        ) => void;

    onNavigate:
        (
            page:
                AppPage,
        ) => void;

    onOpenRelationship:
        (
            targetType:
                KnowledgeRelationshipTargetType,
            targetId:
                string,
        ) => void;
}


interface RelationshipOption {
    targetType:
        KnowledgeRelationshipTargetType;

    targetId:
        string;

    label:
        string;

    group:
        string;
}


interface AlmanacThread {
    key:
        string;

    label:
        string;

    plantStoryCount:
        number;

    harvestCount:
        number;

    noteCount:
        number;

    sourceCount:
        number;

    referenceCount:
        number;

    evidenceCount:
        number;
}


type KnowledgePlacementSuggestionType =
    | 'journal'
    | 'plan'
    | 'reference'
    | 'source'
    | 'keep-note';


interface KnowledgePlacementSuggestion {
    type:
        KnowledgePlacementSuggestionType;

    label:
        string;

    reason:
        string;
}


interface KnowledgeExportSection {
    heading?:
        string;

    body?:
        string;

    lines?:
        string[];
}


interface KnowledgeExportDocument {
    eyebrow:
        string;

    title:
        string;

    dateLine?:
        string;

    meta?:
        string[];

    sections:
        KnowledgeExportSection[];

    photoUrls?:
        string[];
}


const KNOWLEDGE_TABS:
    Array<{
        page:
            AppPage;

        view:
            GardenKnowledgeView;

        label:
            string;

        icon:
            string;
    }> = [
        {
            page:
                'garden-notes',

            view:
                'notes',

            label:
                'Garden Notes',

            icon:
                '📝',
        },

        {
            page:
                'garden-almanac',

            view:
                'almanac',

            label:
                'Garden Almanac',

            icon:
                '📖',
        },

        {
            page:
                'plant-reference',

            view:
                'reference',

            label:
                'Garden Reference',

            icon:
                '🌿',
        },

        {
            page:
                'saved-sources',

            view:
                'sources',

            label:
                'Tips & Sources',

            icon:
                '🔖',
        },
    ];


const SOURCE_KIND_OPTIONS:
    Array<{
        value:
            SavedKnowledgeSourceKind;

        label:
            string;
    }> = [
        {
            value:
                'website',

            label:
                'Website or article',
        },

        {
            value:
                'facebook',

            label:
                'Facebook gardener or group',
        },

        {
            value:
                'chatgpt',

            label:
                'ChatGPT conversation',
        },

        {
            value:
                'person',

            label:
                'A person or gardener',
        },

        {
            value:
                'nursery',

            label:
                'Nursery or garden store',
        },

        {
            value:
                'book',

            label:
                'Book or printed reference',
        },

        {
            value:
                'video',

            label:
                'Video',
        },

        {
            value:
                'screenshot',

            label:
                'Screenshot',
        },

        {
            value:
                'other',

            label:
                'Something else',
        },
    ];


function getToday():
    string {
    return new Date()
        .toISOString()
        .slice(
            0,
            10,
        );
}


function getNow():
    string {
    return new Date()
        .toISOString();
}


function normalise(
    value?:
        string,
):
    string {
    return (
        value ??
        ''
    )
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
    value?:
        string,
):
    string {
    if (
        !value
    ) {
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
            day:
                'numeric',

            month:
                'short',

            year:
                'numeric',
        },
    );
}


function makeTitleFromBody(
    body:
        string,
):
    string {
    const firstLine =
        body
            .split(
                /\r?\n/,
            )
            .map(
                line =>
                    line.trim(),
            )
            .find(
                Boolean,
            ) ??
        'Garden note';

    return firstLine.length <=
        68
        ? firstLine
        : `${firstLine
              .slice(
                  0,
                  65,
              )
              .trim()}…`;
}


function getReferenceKnowledge(
    reference:
        PlantReference,
):
    string {
    return (
        reference.knowledge?.trim() ||
        reference.notes?.trim() ||
        ''
    );
}


function getReferenceTitle(
    reference:
        PlantReference,
):
    string {
    if (
        reference.title?.trim()
    ) {
        return reference.title.trim();
    }

    const knowledge =
        getReferenceKnowledge(
            reference,
        );

    if (
        knowledge
    ) {
        return makeTitleFromBody(
            knowledge,
        );
    }

    return (
        reference.variety?.trim() ||
        reference.plantName?.trim() ||
        reference.subjectLabel?.trim() ||
        'Garden Reference'
    );
}


function getReferenceSubjectLabel(
    reference:
        PlantReference,
):
    string {
    if (
        reference.subjectType &&
        reference.subjectType !==
            'plant-crop'
    ) {
        return (
            reference.subjectLabel?.trim() ||
            getReferenceTitle(
                reference,
            )
        );
    }

    return (
        reference.plantName?.trim() ||
        'Garden Reference'
    );
}


function getSourceKindLabel(
    source:
        SavedKnowledgeSource,
):
    string {
    if (
        source.kind ===
            'other' &&
        source.customKindLabel?.trim()
    ) {
        return source.customKindLabel.trim();
    }

    return (
        SOURCE_KIND_OPTIONS.find(
            option =>
                option.value ===
                source.kind,
        )?.label ??
        'Saved source'
    );
}


function getRelationshipOptions(
    gardenData:
        GardenData,
):
    RelationshipOption[] {
    const options:
        RelationshipOption[] =
        [];

    (
        gardenData.plantStories ??
        []
    ).forEach(
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
            });
        },
    );

    (
        gardenData.events ??
        []
    ).forEach(
        event => {
            options.push({
                targetType:
                    'garden-event',

                targetId:
                    event.id,

                label:
                    event.title,

                group:
                    'Journal',
            });
        },
    );

    (
        gardenData.harvests ??
        []
    ).forEach(
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
                        ? `Harvest · ${plantNames.join(
                              ', ',
                          )}`
                        : `Harvest · ${formatDate(
                              harvest.date,
                          )}`,

                group:
                    'Harvests',
            });
        },
    );

    (
        gardenData.plans ??
        []
    ).forEach(
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
            });
        },
    );

    (
        gardenData.growingPlaces ??
        []
    ).forEach(
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
            });
        },
    );

    (
        gardenData.growingSetups ??
        []
    ).forEach(
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
            });
        },
    );

    (
        gardenData.ingredients ??
        []
    ).forEach(
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
            });
        },
    );

    (
        gardenData.products ??
        []
    ).forEach(
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
            });
        },
    );

    (
        gardenData.purchases ??
        []
    ).forEach(
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
            });
        },
    );

    (
        gardenData.plantReferences ??
        []
    ).forEach(
        reference => {
            options.push({
                targetType:
                    'plant-reference',

                targetId:
                    reference.id,

                label:
                    getReferenceTitle(
                        reference,
                    ),

                group:
                    'Garden Reference',
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
):
    string {
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
        'Linked Sprig record'
    );
}


function getPlacementSuggestions(
    note:
        GardenNote,
):
    KnowledgePlacementSuggestion[] {
    const text =
        normalise(
            `${note.title ?? ''} ${note.body}`,
        );

    const rawText =
        `${note.title ?? ''} ${note.body}`;

    const suggestions:
        KnowledgePlacementSuggestion[] =
        [];

    const containsUrl =
        /https?:\/\/\S+/i.test(
            rawText,
        );

    const soundsLikeExternalAdvice =
        /\b(facebook|article|website|chatgpt|someone said|grower said|nursery|read that|tip|recommended|recommends)\b/.test(
            text,
        );

    const soundsLikeReality =
        /\b(planted|sowed|sown|sprouted|watered|fed|fertilised|fertilized|harvested|moved|sprayed|treated|bought|noticed|died|flowered|hilled)\b/.test(
            text,
        );

    const soundsLikePlan =
        /\b(to do|remember to|need to|want to|plan to|next time|buy|plant next|sow next|get )\b/.test(
            text,
        );

    const soundsLikeReference =
        /\b(variety|weeks|days to harvest|determinate|indeterminate|usually|good for|best for|planting depth|spacing|harvest window|warm climate|cool climate)\b/.test(
            text,
        );

    const soundsUncertain =
        rawText.includes(
            '?',
        ) ||
        /\b(maybe|perhaps|possibly|seems|wonder|effect)\b/.test(
            text,
        );

    if (
        soundsLikeReality
    ) {
        suggestions.push({
            type:
                'journal',

            label:
                'Possible garden history',

            reason:
                'This sounds as though something may actually have happened in the garden.',
        });
    }

    if (
        soundsLikePlan
    ) {
        suggestions.push({
            type:
                'plan',

            label:
                'Possible Plan',

            reason:
                'This may be something you intend to do rather than something already done.',
        });
    }

    if (
        soundsLikeReference
    ) {
        suggestions.push({
            type:
                'reference',

            label:
                'Possible Garden Reference',

            reason:
                'This contains reusable garden knowledge that may deserve a permanent reference.',
        });
    }

    if (
        containsUrl ||
        soundsLikeExternalAdvice
    ) {
        suggestions.push({
            type:
                'source',

            label:
                'Possible Tip or Source',

            reason:
                'Sprig noticed a link or language that sounds like advice from somewhere outside your own garden.',
        });
    }

    if (
        soundsUncertain ||
        suggestions.length ===
            0
    ) {
        suggestions.push({
            type:
                'keep-note',

            label:
                'Keep this as a Garden Note',

            reason:
                soundsUncertain
                    ? 'This sounds uncertain or exploratory. Sprig can preserve the thought without turning it into a fact.'
                    : 'Nothing here needs to be forced into another home.',
        });
    }

    return suggestions;
}


function buildAlmanacThreads(
    gardenData:
        GardenData,
):
    AlmanacThread[] {
    const threadMap =
        new Map<
            string,
            AlmanacThread
        >();

    function ensureThread(
        label:
            string,
    ):
        AlmanacThread {
        const clean =
            label.trim();

        const key =
            normalise(
                clean,
            );

        const existing =
            threadMap.get(
                key,
            );

        if (
            existing
        ) {
            return existing;
        }

        const thread:
            AlmanacThread =
            {
                key,

                label:
                    clean,

                plantStoryCount:
                    0,

                harvestCount:
                    0,

                noteCount:
                    0,

                sourceCount:
                    0,

                referenceCount:
                    0,

                evidenceCount:
                    0,
            };

        threadMap.set(
            key,
            thread,
        );

        return thread;
    }

    (
        gardenData.plantStories ??
        []
    ).forEach(
        plant => {
            ensureThread(
                plant.plantName,
            ).plantStoryCount +=
                1;

            if (
                plant.variety?.trim()
            ) {
                ensureThread(
                    `${plant.plantName} · ${plant.variety.trim()}`,
                ).plantStoryCount +=
                    1;
            }
        },
    );

    (
        gardenData.plantReferences ??
        []
    )
        .filter(
            reference =>
                (
                    reference.subjectType ??
                    'plant-crop'
                ) ===
                    'plant-crop' &&
                Boolean(
                    reference.plantName?.trim(),
                ),
        )
        .forEach(
            reference => {
                ensureThread(
                    reference.plantName,
                ).referenceCount +=
                    1;

                if (
                    reference.variety?.trim()
                ) {
                    ensureThread(
                        `${reference.plantName} · ${reference.variety.trim()}`,
                    ).referenceCount +=
                        1;
                }
            },
        );

    const threads =
        Array.from(
            threadMap.values(),
        );

    threads.forEach(
        thread => {
            const threadNeedle =
                normalise(
                    thread.label,
                );

            const broadNeedle =
                normalise(
                    thread.label.split(
                        '·',
                    )[0],
                );

            thread.noteCount =
                (
                    gardenData.gardenNotes ??
                    []
                ).filter(
                    note => {
                        const text =
                            normalise(
                                `${note.title ?? ''} ${note.category ?? ''} ${note.body}`,
                            );

                        return (
                            text.includes(
                                threadNeedle,
                            ) ||
                            (
                                broadNeedle.length >
                                    2 &&
                                text.includes(
                                    broadNeedle,
                                )
                            )
                        );
                    },
                ).length;

            thread.sourceCount =
                (
                    gardenData.savedKnowledgeSources ??
                    []
                ).filter(
                    source => {
                        const text =
                            normalise(
                                `${source.title} ${source.category ?? ''} ${source.sourceName ?? ''} ${source.excerpt ?? ''} ${source.notes ?? ''}`,
                            );

                        return (
                            text.includes(
                                threadNeedle,
                            ) ||
                            (
                                broadNeedle.length >
                                    2 &&
                                text.includes(
                                    broadNeedle,
                                )
                            )
                        );
                    },
                ).length;

            const matchingPlantIds =
                (
                    gardenData.plantStories ??
                    []
                )
                    .filter(
                        plant =>
                            normalise(
                                `${plant.plantName} ${plant.variety ?? ''}`,
                            ).includes(
                                broadNeedle,
                            ),
                    )
                    .map(
                        plant =>
                            plant.id,
                    );

            thread.harvestCount =
                (
                    gardenData.harvests ??
                    []
                ).filter(
                    harvest =>
                        harvest.plantStoryIds.some(
                            plantId =>
                                matchingPlantIds.includes(
                                    plantId,
                                ),
                        ),
                ).length;

            thread.evidenceCount =
                thread.plantStoryCount +
                thread.harvestCount +
                thread.noteCount;
        },
    );

    return threads
        .filter(
            thread =>
                thread.plantStoryCount >
                    0 ||
                thread.harvestCount >
                    0 ||
                thread.noteCount >
                    0 ||
                thread.referenceCount >
                    0 ||
                thread.sourceCount >
                    0,
        )
        .sort(
            (
                first,
                second,
            ) => {
                const evidenceDifference =
                    second.evidenceCount -
                    first.evidenceCount;

                return (
                    evidenceDifference ||
                    first.label.localeCompare(
                        second.label,
                    )
                );
            },
        );
}


function getEvidencePhrase(
    count:
        number,
):
    string {
    if (
        count <=
        0
    ) {
        return 'Reference only so far';
    }

    if (
        count ===
        1
    ) {
        return 'One piece of your garden story';
    }

    if (
        count <=
        3
    ) {
        return 'A small pattern may be forming';
    }

    if (
        count <=
        7
    ) {
        return 'Several pieces of your garden story';
    }

    return 'A well-populated garden thread';
}


function escapeHtml(
    value:
        string,
):
    string {
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
    value:
        string,
):
    string {
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


function downloadRtf(
    fileName:
        string,

    title:
        string,

    documents:
        KnowledgeExportDocument[],
) {
    const body =
        documents
            .map(
                (
                    document,
                    index,
                ) => {
                    const page =
                        index >
                        0
                            ? '\\page\n'
                            : '';

                    const meta =
                        (
                            document.meta ??
                            []
                        )
                            .map(
                                line =>
                                    `${escapeRtf(
                                        line,
                                    )}\\par\n`,
                            )
                            .join('');

                    const sections =
                        document.sections
                            .map(
                                section =>
                                    `${section.heading
                                        ? `\\par\\b ${escapeRtf(
                                              section.heading,
                                          )}\\b0\\par\n`
                                        : ''}${
                                        section.body
                                            ? `${escapeRtf(
                                                  section.body,
                                              )}\\par\n`
                                            : ''
                                    }${
                                        section.lines
                                            ? section.lines
                                                  .map(
                                                      line =>
                                                          `${escapeRtf(
                                                              line,
                                                          )}\\par\n`,
                                                  )
                                                  .join(
                                                      '',
                                                  )
                                            : ''
                                    }`,
                            )
                            .join('');

                    return (
                        page +
                        `\\b ${escapeRtf(
                            document.eyebrow,
                        )}\\b0\\par\n` +
                        `\\fs32\\b ${escapeRtf(
                            document.title,
                        )}\\b0\\fs22\\par\n` +
                        `${
                            document.dateLine
                                ? `${escapeRtf(
                                      document.dateLine,
                                  )}\\par\n`
                                : ''
                        }` +
                        meta +
                        sections
                    );
                },
            )
            .join('');

    const rtf =
        `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Georgia;}{\\f1 Arial;}}` +
        `\\f0\\fs22\\b ${escapeRtf(
            title,
        )}\\b0\\par\\par\n` +
        body +
        '}';

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
        fileName;

    document.body.appendChild(
        anchor,
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(
        url,
    );
}


function printDocuments(
    title:
        string,

    documents:
        KnowledgeExportDocument[],
) {
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

    const body =
        documents
            .map(
                document => `
<article>
<p class="eyebrow">${escapeHtml(
                    document.eyebrow,
                )}</p>
<h1>${escapeHtml(
                    document.title,
                )}</h1>
${
    document.dateLine
        ? `<p class="meta">${escapeHtml(
              document.dateLine,
          )}</p>`
        : ''
}
${(
    document.meta ??
    []
)
    .map(
        line =>
            `<p class="meta">${escapeHtml(
                line,
            )}</p>`,
    )
    .join('')}
${document.sections
    .map(
        section => `
<section>
${
    section.heading
        ? `<h2>${escapeHtml(
              section.heading,
          )}</h2>`
        : ''
}
${
    section.body
        ? `<div>${escapeHtml(
              section.body,
          ).replace(
              /\n/g,
              '<br />',
          )}</div>`
        : ''
}
${
    section.lines
        ? `<ul>${section.lines
              .map(
                  line =>
                      `<li>${escapeHtml(
                          line,
                      )}</li>`,
              )
              .join('')}</ul>`
        : ''
}
</section>`
    )
    .join('')}
</article>`,
            )
            .join('');

    printWindow.opener =
        null;

    printWindow.document.open();

    printWindow.document.write(
        `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(
            title,
        )}</title>
<style>
@page { margin: 16mm; }
body { font-family: Georgia, serif; color:#2f382e; line-height:1.55; }
article { max-width:820px; margin:0 auto 34px; padding-bottom:24px; border-bottom:1px solid #d8dfd5; }
.eyebrow { text-transform:uppercase; letter-spacing:.09em; font-size:9pt; color:#657061; }
.meta { color:#626c60; }
h1 { margin:.25rem 0 .7rem; }
h2 { margin:1.3rem 0 .35rem; font-size:14pt; }
</style>
</head>
<body>${body}</body>
</html>`,
    );

    printWindow.document.close();

    window.setTimeout(
        () => {
            printWindow.focus();
            printWindow.print();
        },
        350,
    );
}


export default function GardenKnowledge({
    view,
    gardenData,
    initialRecord,
    journeyBackLabel,
    onJourneyBack,
    onGardenDataChange,
    onRecordSelectionChange,
    onNavigate,
    onOpenRelationship,
}: GardenKnowledgeProps) {
    const notes =
        gardenData.gardenNotes ??
        [];

    const sources =
        gardenData.savedKnowledgeSources ??
        [];

    const references =
        gardenData.plantReferences ??
        [];

    const [
        selectedNoteId,
        setSelectedNoteId,
    ] =
        useState<
            string |
            null
        >(
            null,
        );

    const [
        selectedSourceId,
        setSelectedSourceId,
    ] =
        useState<
            string |
            null
        >(
            null,
        );

    const [
        editingNoteId,
        setEditingNoteId,
    ] =
        useState<
            string |
            null
        >(
            null,
        );

    const [
        editingSourceId,
        setEditingSourceId,
    ] =
        useState<
            string |
            null
        >(
            null,
        );

    const [
        noteTitle,
        setNoteTitle,
    ] =
        useState(
            '',
        );

    const [
        noteBody,
        setNoteBody,
    ] =
        useState(
            '',
        );

    const [
        noteCategory,
        setNoteCategory,
    ] =
        useState(
            '',
        );

    const [
        noteDate,
        setNoteDate,
    ] =
        useState(
            getToday(),
        );

    const [
        notePhotoUrls,
        setNotePhotoUrls,
    ] =
        useState<
            string[]
        >(
            [],
        );

    const [
        isImporting,
        setIsImporting,
    ] =
        useState(
            false,
        );

    const [
        importSourceLabel,
        setImportSourceLabel,
    ] =
        useState(
            '',
        );

    const [
        importSourceUrl,
        setImportSourceUrl,
    ] =
        useState(
            '',
        );

    const [
        noteComposerOpen,
        setNoteComposerOpen,
    ] =
        useState(
            false,
        );

    const [
        noteSearch,
        setNoteSearch,
    ] =
        useState(
            '',
        );

    const [
        editNoteTitle,
        setEditNoteTitle,
    ] =
        useState(
            '',
        );

    const [
        editNoteBody,
        setEditNoteBody,
    ] =
        useState(
            '',
        );

    const [
        editNoteCategory,
        setEditNoteCategory,
    ] =
        useState(
            '',
        );

    const [
        editNoteDate,
        setEditNoteDate,
    ] =
        useState(
            '',
        );

    const [
        editNotePhotoUrls,
        setEditNotePhotoUrls,
    ] =
        useState<
            string[]
        >(
            [],
        );

    const [
        sourceTitle,
        setSourceTitle,
    ] =
        useState(
            '',
        );

    const [
        sourceKind,
        setSourceKind,
    ] =
        useState<
            SavedKnowledgeSourceKind
        >(
            'website',
        );

    const [
        sourceCustomKind,
        setSourceCustomKind,
    ] =
        useState(
            '',
        );

    const [
        sourceName,
        setSourceName,
    ] =
        useState(
            '',
        );

    const [
        sourceUrl,
        setSourceUrl,
    ] =
        useState(
            '',
        );

    const [
        sourceCategory,
        setSourceCategory,
    ] =
        useState(
            '',
        );

    const [
        sourceExcerpt,
        setSourceExcerpt,
    ] =
        useState(
            '',
        );

    const [
        sourceNotes,
        setSourceNotes,
    ] =
        useState(
            '',
        );

    const [
        sourceSavedDate,
        setSourceSavedDate,
    ] =
        useState(
            getToday(),
        );

    const [
        sourcePhotoUrls,
        setSourcePhotoUrls,
    ] =
        useState<
            string[]
        >(
            [],
        );

    const [
        sourceComposerOpen,
        setSourceComposerOpen,
    ] =
        useState(
            false,
        );

    const [
        sourceSearch,
        setSourceSearch,
    ] =
        useState(
            '',
        );

    const [
        editSourceTitle,
        setEditSourceTitle,
    ] =
        useState(
            '',
        );

    const [
        editSourceKind,
        setEditSourceKind,
    ] =
        useState<
            SavedKnowledgeSourceKind
        >(
            'website',
        );

    const [
        editSourceCustomKind,
        setEditSourceCustomKind,
    ] =
        useState(
            '',
        );

    const [
        editSourceName,
        setEditSourceName,
    ] =
        useState(
            '',
        );

    const [
        editSourceUrl,
        setEditSourceUrl,
    ] =
        useState(
            '',
        );

    const [
        editSourceCategory,
        setEditSourceCategory,
    ] =
        useState(
            '',
        );

    const [
        editSourceExcerpt,
        setEditSourceExcerpt,
    ] =
        useState(
            '',
        );

    const [
        editSourceNotes,
        setEditSourceNotes,
    ] =
        useState(
            '',
        );

    const [
        editSourceSavedDate,
        setEditSourceSavedDate,
    ] =
        useState(
            '',
        );

    const [
        editSourcePhotoUrls,
        setEditSourcePhotoUrls,
    ] =
        useState<
            string[]
        >(
            [],
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
        placementExcerpt,
        setPlacementExcerpt,
    ] =
        useState(
            '',
        );

    const [
        placementJournalDate,
        setPlacementJournalDate,
    ] =
        useState(
            getToday(),
        );

    const [
        placementPlanDate,
        setPlacementPlanDate,
    ] =
        useState(
            getToday(),
        );

    const [
        almanacQuery,
        setAlmanacQuery,
    ] =
        useState(
            '',
        );

    const [
        selectedAlmanacThreadKey,
        setSelectedAlmanacThreadKey,
    ] =
        useState<
            string |
            null
        >(
            null,
        );


    const selectedNote =
        notes.find(
            note =>
                note.id ===
                selectedNoteId,
        ) ??
        null;


    const selectedSource =
        sources.find(
            source =>
                source.id ===
                selectedSourceId,
        ) ??
        null;


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


    const almanacThreads =
        useMemo(
            () =>
                buildAlmanacThreads(
                    gardenData,
                ),
            [
                gardenData,
            ],
        );


    const knowledgeCategories =
        useMemo(
            () =>
                Array.from(
                    new Set(
                        [
                            ...notes.map(
                                note =>
                                    note.category?.trim() ||
                                    '',
                            ),

                            ...sources.map(
                                source =>
                                    source.category?.trim() ||
                                    '',
                            ),
                        ].filter(
                            Boolean,
                        ),
                    ),
                ).sort(
                    (
                        first,
                        second,
                    ) =>
                        first.localeCompare(
                            second,
                        ),
                ),
            [
                notes,
                sources,
            ],
        );


    const filteredNotes =
        useMemo(
            () => {
                const query =
                    normalise(
                        noteSearch,
                    );

                if (
                    !query
                ) {
                    return [
                        ...notes,
                    ].sort(
                        (
                            first,
                            second,
                        ) =>
                            (
                                second.noteDate ??
                                second.createdAt
                            ).localeCompare(
                                first.noteDate ??
                                first.createdAt,
                            ),
                    );
                }

                return notes
                    .filter(
                        note =>
                            normalise(
                                `${note.title ?? ''} ${note.body} ${note.category ?? ''} ${note.sourceLabel ?? ''} ${note.noteDate ?? ''}`,
                            ).includes(
                                query,
                            ),
                    )
                    .sort(
                        (
                            first,
                            second,
                        ) =>
                            (
                                second.noteDate ??
                                second.createdAt
                            ).localeCompare(
                                first.noteDate ??
                                first.createdAt,
                            ),
                    );
            },
            [
                notes,
                noteSearch,
            ],
        );


    const filteredSources =
        useMemo(
            () => {
                const query =
                    normalise(
                        sourceSearch,
                    );

                const sorted =
                    [
                        ...sources,
                    ].sort(
                        (
                            first,
                            second,
                        ) =>
                            (
                                second.savedDate ??
                                second.createdAt
                            ).localeCompare(
                                first.savedDate ??
                                first.createdAt,
                            ),
                    );

                if (
                    !query
                ) {
                    return sorted;
                }

                return sorted.filter(
                    source =>
                        normalise(
                            `${source.title} ${source.category ?? ''} ${getSourceKindLabel(
                                source,
                            )} ${source.sourceName ?? ''} ${source.url ?? ''} ${source.excerpt ?? ''} ${source.notes ?? ''}`,
                        ).includes(
                            query,
                        ),
                );
            },
            [
                sources,
                sourceSearch,
            ],
        );


    const filteredAlmanacThreads =
        useMemo(
            () => {
                const query =
                    normalise(
                        almanacQuery,
                    );

                if (
                    !query
                ) {
                    return almanacThreads;
                }

                return almanacThreads.filter(
                    thread =>
                        normalise(
                            thread.label,
                        ).includes(
                            query,
                        ),
                );
            },
            [
                almanacThreads,
                almanacQuery,
            ],
        );


    useEffect(
        () => {
            if (
                !initialRecord
            ) {
                return;
            }

            if (
                initialRecord.sourceType ===
                'garden-note'
            ) {
                setSelectedNoteId(
                    initialRecord.recordId,
                );

                setSelectedSourceId(
                    null,
                );

                return;
            }

            if (
                initialRecord.sourceType ===
                'saved-source'
            ) {
                setSelectedSourceId(
                    initialRecord.recordId,
                );

                setSelectedNoteId(
                    null,
                );
            }
        },
        [
            initialRecord,
        ],
    );


    useEffect(
        () => {
            if (
                selectedNote
            ) {
                setPlacementExcerpt(
                    selectedNote.body,
                );

                setPlacementJournalDate(
                    selectedNote.noteDate ??
                    getToday(),
                );
            }
        },
        [
            selectedNoteId,
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


    function selectNote(
        recordId:
            string |
            null,
    ) {
        setEditingNoteId(
            null,
        );

        setSelectedNoteId(
            recordId,
        );

        setSelectedSourceId(
            null,
        );

        onRecordSelectionChange(
            recordId
                ? {
                      sourceType:
                          'garden-note',

                      recordId,
                  }
                : null,
        );
    }


    function selectSource(
        recordId:
            string |
            null,
    ) {
        setEditingSourceId(
            null,
        );

        setSelectedSourceId(
            recordId,
        );

        setSelectedNoteId(
            null,
        );

        onRecordSelectionChange(
            recordId
                ? {
                      sourceType:
                          'saved-source',

                      recordId,
                  }
                : null,
        );
    }


    function resetNoteComposer() {
        setNoteTitle(
            '',
        );

        setNoteBody(
            '',
        );

        setNoteCategory(
            '',
        );

        setNoteDate(
            getToday(),
        );

        setIsImporting(
            false,
        );

        setImportSourceLabel(
            '',
        );

        setImportSourceUrl(
            '',
        );

        setNotePhotoUrls(
            [],
        );
    }


    function resetSourceComposer() {
        setSourceTitle(
            '',
        );

        setSourceKind(
            'website',
        );

        setSourceCustomKind(
            '',
        );

        setSourceName(
            '',
        );

        setSourceUrl(
            '',
        );

        setSourceCategory(
            '',
        );

        setSourceExcerpt(
            '',
        );

        setSourceNotes(
            '',
        );

        setSourceSavedDate(
            getToday(),
        );

        setSourcePhotoUrls(
            [],
        );
    }


    function handleSaveNote() {
        const rawBody =
            noteBody;

        if (
            !rawBody.trim()
        ) {
            return;
        }

        const now =
            getNow();

        const note:
            GardenNote =
            {
                id:
                    crypto.randomUUID(),

                title:
                    noteTitle.trim() ||
                    undefined,

                body:
                    isImporting
                        ? rawBody
                        : rawBody.trim(),

                category:
                    noteCategory.trim() ||
                    undefined,

                noteDate:
                    noteDate ||
                    undefined,

                origin:
                    isImporting
                        ? 'imported-text'
                        : 'sprig-note',

                originalBody:
                    isImporting
                        ? rawBody
                        : undefined,

                sourceLabel:
                    isImporting
                        ? importSourceLabel.trim() ||
                          undefined
                        : undefined,

                sourceUrl:
                    isImporting
                        ? importSourceUrl.trim() ||
                          undefined
                        : undefined,

                relationships:
                    [],

                placements:
                    [],

                photoUrls:
                    notePhotoUrls.length >
                    0
                        ? notePhotoUrls
                        : undefined,

                createdAt:
                    now,
            };

        save({
            ...gardenData,

            gardenNotes: [
                ...notes,
                note,
            ],
        });

        selectNote(
            note.id,
        );

        resetNoteComposer();

        setNoteComposerOpen(
            false,
        );
    }


    function startEditNote(
        note:
            GardenNote,
    ) {
        setEditNoteTitle(
            note.title ??
            '',
        );

        setEditNoteBody(
            note.body,
        );

        setEditNoteCategory(
            note.category ??
            '',
        );

        setEditNoteDate(
            note.noteDate ??
            note.createdAt.slice(
                0,
                10,
            ),
        );

        setEditNotePhotoUrls(
            note.photoUrls ??
            [],
        );

        setEditingNoteId(
            note.id,
        );
    }


    function handleSaveEditedNote(
        note:
            GardenNote,
    ) {
        if (
            !editNoteBody.trim()
        ) {
            return;
        }

        const updated:
            GardenNote =
            {
                ...note,

                title:
                    editNoteTitle.trim() ||
                    undefined,

                body:
                    note.origin ===
                    'imported-text'
                        ? editNoteBody
                        : editNoteBody.trim(),

                category:
                    editNoteCategory.trim() ||
                    undefined,

                noteDate:
                    editNoteDate ||
                    undefined,

                photoUrls:
                    editNotePhotoUrls.length >
                    0
                        ? editNotePhotoUrls
                        : undefined,

                updatedAt:
                    getNow(),
            };

        save({
            ...gardenData,

            gardenNotes:
                notes.map(
                    item =>
                        item.id ===
                        note.id
                            ? updated
                            : item,
                ),
        });

        setEditingNoteId(
            null,
        );
    }


    function handleDeleteNote(
        note:
            GardenNote,
    ) {
        const confirmed =
            window.confirm(
                `Delete "${note.title || makeTitleFromBody(
                    note.body,
                )}"?\n\nReal Sprig records created or linked from this note will not be deleted.`,
            );

        if (
            !confirmed
        ) {
            return;
        }

        save({
            ...gardenData,

            gardenNotes:
                notes.filter(
                    item =>
                        item.id !==
                        note.id,
                ),
        });

        selectNote(
            null,
        );
    }


    function handleSaveSource() {
        if (
            !sourceTitle.trim()
        ) {
            return;
        }

        const source:
            SavedKnowledgeSource =
            {
                id:
                    crypto.randomUUID(),

                title:
                    sourceTitle.trim(),

                kind:
                    sourceKind,

                customKindLabel:
                    sourceKind ===
                    'other'
                        ? sourceCustomKind.trim() ||
                          undefined
                        : undefined,

                sourceName:
                    sourceName.trim() ||
                    undefined,

                url:
                    sourceUrl.trim() ||
                    undefined,

                category:
                    sourceCategory.trim() ||
                    undefined,

                excerpt:
                    sourceExcerpt.trim() ||
                    undefined,

                notes:
                    sourceNotes.trim() ||
                    undefined,

                savedDate:
                    sourceSavedDate ||
                    undefined,

                relationships:
                    [],

                photoUrls:
                    sourcePhotoUrls.length >
                    0
                        ? sourcePhotoUrls
                        : undefined,

                createdAt:
                    getNow(),
            };

        save({
            ...gardenData,

            savedKnowledgeSources: [
                ...sources,
                source,
            ],
        });

        selectSource(
            source.id,
        );

        resetSourceComposer();

        setSourceComposerOpen(
            false,
        );
    }


    function startEditSource(
        source:
            SavedKnowledgeSource,
    ) {
        setEditSourceTitle(
            source.title,
        );

        setEditSourceKind(
            source.kind,
        );

        setEditSourceCustomKind(
            source.customKindLabel ??
            '',
        );

        setEditSourceName(
            source.sourceName ??
            '',
        );

        setEditSourceUrl(
            source.url ??
            '',
        );

        setEditSourceCategory(
            source.category ??
            '',
        );

        setEditSourceExcerpt(
            source.excerpt ??
            '',
        );

        setEditSourceNotes(
            source.notes ??
            '',
        );

        setEditSourceSavedDate(
            source.savedDate ??
            source.createdAt.slice(
                0,
                10,
            ),
        );

        setEditSourcePhotoUrls(
            source.photoUrls ??
            [],
        );

        setEditingSourceId(
            source.id,
        );
    }


    function handleSaveEditedSource(
        source:
            SavedKnowledgeSource,
    ) {
        if (
            !editSourceTitle.trim()
        ) {
            return;
        }

        const updated:
            SavedKnowledgeSource =
            {
                ...source,

                title:
                    editSourceTitle.trim(),

                kind:
                    editSourceKind,

                customKindLabel:
                    editSourceKind ===
                    'other'
                        ? editSourceCustomKind.trim() ||
                          undefined
                        : undefined,

                sourceName:
                    editSourceName.trim() ||
                    undefined,

                url:
                    editSourceUrl.trim() ||
                    undefined,

                category:
                    editSourceCategory.trim() ||
                    undefined,

                excerpt:
                    editSourceExcerpt.trim() ||
                    undefined,

                notes:
                    editSourceNotes.trim() ||
                    undefined,

                savedDate:
                    editSourceSavedDate ||
                    undefined,

                photoUrls:
                    editSourcePhotoUrls.length >
                    0
                        ? editSourcePhotoUrls
                        : undefined,

                updatedAt:
                    getNow(),
            };

        save({
            ...gardenData,

            savedKnowledgeSources:
                sources.map(
                    item =>
                        item.id ===
                        source.id
                            ? updated
                            : item,
                ),
        });

        setEditingSourceId(
            null,
        );
    }


    function handleDeleteSource(
        source:
            SavedKnowledgeSource,
    ) {
        const confirmed =
            window.confirm(
                `Delete "${source.title}" from Tips & Sources?\n\nThis does not delete other Sprig records linked to it.`,
            );

        if (
            !confirmed
        ) {
            return;
        }

        save({
            ...gardenData,

            savedKnowledgeSources:
                sources.filter(
                    item =>
                        item.id !==
                        source.id,
                ),
        });

        selectSource(
            null,
        );
    }


    function addRelationship(
        target:
            GardenNote |
            SavedKnowledgeSource,

        targetType:
            'note' |
            'source',
    ) {
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
            target.relationships ??
            [];

        if (
            existing.some(
                relationship =>
                    relationship.targetType ===
                        option.targetType &&
                    relationship.targetId ===
                        option.targetId,
            )
        ) {
            return;
        }

        const relationship:
            KnowledgeRelationship =
            {
                targetType:
                    option.targetType,

                targetId:
                    option.targetId,

                label:
                    option.label,

                createdAt:
                    getNow(),
            };

        if (
            targetType ===
            'note'
        ) {
            save({
                ...gardenData,

                gardenNotes:
                    notes.map(
                        note =>
                            note.id ===
                            target.id
                                ? {
                                      ...note,

                                      relationships: [
                                          ...existing,
                                          relationship,
                                      ],

                                      updatedAt:
                                          getNow(),
                                  }
                                : note,
                    ),
            });
        }
        else {
            save({
                ...gardenData,

                savedKnowledgeSources:
                    sources.map(
                        source =>
                            source.id ===
                            target.id
                                ? {
                                      ...source,

                                      relationships: [
                                          ...existing,
                                          relationship,
                                      ],

                                      updatedAt:
                                          getNow(),
                                  }
                                : source,
                    ),
            });
        }

        setSelectedRelationshipKey(
            '',
        );

        setRelationshipSearch(
            '',
        );
    }


    function removeRelationship(
        target:
            GardenNote |
            SavedKnowledgeSource,

        relationship:
            KnowledgeRelationship,

        targetType:
            'note' |
            'source',
    ) {
        const nextRelationships =
            (
                target.relationships ??
                []
            ).filter(
                item =>
                    !(
                        item.targetType ===
                            relationship.targetType &&
                        item.targetId ===
                            relationship.targetId
                    ),
            );

        if (
            targetType ===
            'note'
        ) {
            save({
                ...gardenData,

                gardenNotes:
                    notes.map(
                        note =>
                            note.id ===
                            target.id
                                ? {
                                      ...note,

                                      relationships:
                                          nextRelationships,

                                      updatedAt:
                                          getNow(),
                                  }
                                : note,
                    ),
            });
        }
        else {
            save({
                ...gardenData,

                savedKnowledgeSources:
                    sources.map(
                        source =>
                            source.id ===
                            target.id
                                ? {
                                      ...source,

                                      relationships:
                                          nextRelationships,

                                      updatedAt:
                                          getNow(),
                                  }
                                : source,
                    ),
            });
        }
    }


    const filteredRelationshipOptions =
        relationshipOptions.filter(
            option => {
                const query =
                    normalise(
                        relationshipSearch,
                    );

                if (
                    !query
                ) {
                    return true;
                }

                return normalise(
                    `${option.group} ${option.label}`,
                ).includes(
                    query,
                );
            },
        );


    function renderRelationshipEditor(
        target:
            GardenNote |
            SavedKnowledgeSource,

        targetType:
            'note' |
            'source',
    ) {
        return (
            <section className="sprig-knowledge-subsection">
                <div className="sprig-knowledge-subsection-heading">
                    <div>
                        <p className="section-label">
                            Relationships
                        </p>

                        <h3>
                            Where this touches Sprig
                        </h3>
                    </div>
                </div>

                {(
                    target.relationships ??
                    []
                ).length >
                    0 && (
                    <div className="sprig-knowledge-relationship-list">
                        {(
                            target.relationships ??
                            []
                        ).map(
                            relationship => (
                                <div
                                    key={`${relationship.targetType}:${relationship.targetId}`}
                                    className="sprig-knowledge-relationship"
                                >
                                    <button
                                        type="button"
                                        className="sprig-knowledge-relationship-open"
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

                                        <span aria-hidden="true">
                                            ›
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className="sprig-knowledge-icon-button"
                                        aria-label="Remove relationship"
                                        onClick={() =>
                                            removeRelationship(
                                                target,
                                                relationship,
                                                targetType,
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

                <div className="sprig-knowledge-linker">
                    <input
                        type="search"
                        value={
                            relationshipSearch
                        }
                        onChange={event =>
                            setRelationshipSearch(
                                event.target.value,
                            )
                        }
                        placeholder="Find a Plant Story, place, recipe, product, plan..."
                    />

                    <select
                        value={
                            selectedRelationshipKey
                        }
                        onChange={event =>
                            setSelectedRelationshipKey(
                                event.target.value,
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
                                >
                                    {option.group}
                                    {' · '}
                                    {option.label}
                                </option>
                            ),
                        )}
                    </select>

                    <button
                        type="button"
                        className="sprig-knowledge-secondary-button"
                        onClick={() =>
                            addRelationship(
                                target,
                                targetType,
                            )
                        }
                        disabled={
                            !selectedRelationshipKey
                        }
                    >
                        Add relationship
                    </button>
                </div>
            </section>
        );
    }


    function appendPlacement(
        note:
            GardenNote,

        placement:
            KnowledgePlacement,

        partial:
            Partial<GardenData>,
    ) {
        const updatedNote:
            GardenNote =
            {
                ...note,

                placements: [
                    ...(
                        note.placements ??
                        []
                    ),

                    placement,
                ],

                updatedAt:
                    getNow(),
            };

        save({
            ...gardenData,
            ...partial,

            gardenNotes:
                notes.map(
                    item =>
                        item.id ===
                        note.id
                            ? updatedNote
                            : item,
                ),
        });
    }


    function handlePlaceAsReference(
        note:
            GardenNote,
    ) {
        const excerpt =
            placementExcerpt.trim() ||
            note.body;

        const plantName =
            window.prompt(
                'Which plant or crop should this Garden Reference belong to?',
                '',
            );

        if (
            !plantName?.trim()
        ) {
            return;
        }

        const variety =
            window.prompt(
                'Variety, if this is variety-specific. Leave blank for crop-wide knowledge.',
                '',
            );

        const now =
            getNow();

        const reference:
            PlantReference =
            {
                id:
                    crypto.randomUUID(),

                subjectType:
                    'plant-crop',

                plantName:
                    plantName.trim(),

                variety:
                    variety?.trim() ||
                    undefined,

                title:
                    note.title ||
                    makeTitleFromBody(
                        excerpt,
                    ),

                knowledge:
                    excerpt,

                referenceDate:
                    note.noteDate ??
                    getToday(),

                relationships: [
                    {
                        targetType:
                            'garden-note',

                        targetId:
                            note.id,

                        label:
                            note.title ||
                            makeTitleFromBody(
                                note.body,
                            ),

                        createdAt:
                            now,
                    },
                ],

                createdAt:
                    now,
            };

        appendPlacement(
            note,

            {
                id:
                    crypto.randomUUID(),

                excerpt,

                destinationType:
                    'plant-reference',

                destinationId:
                    reference.id,

                destinationLabel:
                    getReferenceTitle(
                        reference,
                    ),

                placedAt:
                    now,
            },

            {
                plantReferences: [
                    ...references,
                    reference,
                ],
            },
        );
    }


    function handlePlaceAsSource(
        note:
            GardenNote,
    ) {
        const excerpt =
            placementExcerpt.trim() ||
            note.body;

        const detectedUrl =
            note.body.match(
                /https?:\/\/\S+/i,
            )?.[0];

        const now =
            getNow();

        const source:
            SavedKnowledgeSource =
            {
                id:
                    crypto.randomUUID(),

                title:
                    note.title ||
                    makeTitleFromBody(
                        note.body,
                    ),

                category:
                    note.category,

                kind:
                    note.sourceUrl ||
                    detectedUrl
                        ? 'website'
                        : 'other',

                sourceName:
                    note.sourceLabel,

                url:
                    note.sourceUrl ||
                    detectedUrl,

                excerpt,

                notes:
                    'Placed from a Garden Note. The original note remains untouched.',

                savedDate:
                    note.noteDate,

                relationships: [
                    {
                        targetType:
                            'garden-note',

                        targetId:
                            note.id,

                        label:
                            note.title ||
                            makeTitleFromBody(
                                note.body,
                            ),

                        createdAt:
                            now,
                    },
                ],

                createdAt:
                    now,
            };

        appendPlacement(
            note,

            {
                id:
                    crypto.randomUUID(),

                excerpt,

                destinationType:
                    'saved-source',

                destinationId:
                    source.id,

                destinationLabel:
                    source.title,

                placedAt:
                    now,
            },

            {
                savedKnowledgeSources: [
                    ...sources,
                    source,
                ],
            },
        );
    }


    function handlePlaceAsJournal(
        note:
            GardenNote,
    ) {
        if (
            !placementJournalDate
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                'Create a real Garden Journal record from this note?\n\nThe Garden Note will remain here and keep the link.',
            );

        if (
            !confirmed
        ) {
            return;
        }

        const excerpt =
            placementExcerpt.trim() ||
            note.body;

        const linkedPlantIds =
            (
                note.relationships ??
                []
            )
                .filter(
                    relationship =>
                        relationship.targetType ===
                        'plant-story',
                )
                .map(
                    relationship =>
                        relationship.targetId,
                );

        const event:
            GardenEvent =
            {
                id:
                    crypto.randomUUID(),

                date:
                    placementJournalDate,

                type:
                    'note',

                title:
                    note.title ||
                    makeTitleFromBody(
                        excerpt,
                    ),

                notes:
                    excerpt,

                originatingKnowledgeNoteId:
                    note.id,

                plantStoryIds:
                    linkedPlantIds,

                photoUrls:
                    note.photoUrls,

            };

        appendPlacement(
            note,

            {
                id:
                    crypto.randomUUID(),

                excerpt,

                destinationType:
                    'garden-event',

                destinationId:
                    event.id,

                destinationLabel:
                    event.title,

                placedAt:
                    getNow(),
            },

            {
                events: [
                    ...(
                        gardenData.events ??
                        []
                    ),
                    event,
                ],
            },
        );
    }


    function handlePlaceAsPlan(
        note:
            GardenNote,
    ) {
        if (
            !placementPlanDate
        ) {
            return;
        }

        const plan:
            GardenPlan =
            {
                id:
                    crypto.randomUUID(),

                title:
                    note.title ||
                    makeTitleFromBody(
                        note.body,
                    ),

                kind:
                    'garden-task',

                notes:
                    placementExcerpt.trim() ||
                    note.body,

                date:
                    placementPlanDate,

                status:
                    'planned',

                originatingKnowledgeNoteId:
                    note.id,

                createdAt:
                    getNow(),
            };

        appendPlacement(
            note,

            {
                id:
                    crypto.randomUUID(),

                excerpt:
                    placementExcerpt.trim() ||
                    note.body,

                destinationType:
                    'plan',

                destinationId:
                    plan.id,

                destinationLabel:
                    plan.title,

                placedAt:
                    getNow(),
            },

            {
                plans: [
                    ...(
                        gardenData.plans ??
                        []
                    ),
                    plan,
                ],
            },
        );
    }
    function getNoteExportDocument(
        note:
            GardenNote,
    ):
        KnowledgeExportDocument {
        const meta:
            string[] =
            [];

        if (
            note.category?.trim()
        ) {
            meta.push(
                `Category: ${note.category.trim()}`,
            );
        }

        if (
            note.sourceLabel?.trim()
        ) {
            meta.push(
                `Source: ${note.sourceLabel.trim()}`,
            );
        }

        if (
            note.sourceUrl?.trim()
        ) {
            meta.push(
                note.sourceUrl.trim(),
            );
        }

        const sections:
            KnowledgeExportSection[] =
            [
                {
                    heading:
                        'Garden Note',

                    body:
                        note.body,
                },
            ];

        if (
            note.origin ===
            'imported-text'
        ) {
            sections.push({
                heading:
                    'Original imported note · preserved snapshot',

                body:
                    note.originalBody ??
                    note.body,
            });
        }

        return {
            eyebrow:
                note.origin ===
                'imported-text'
                    ? 'Imported Garden Note'
                    : 'Garden Note',

            title:
                note.title ||
                makeTitleFromBody(
                    note.body,
                ),

            dateLine:
                `Note dated ${formatDate(
                    note.noteDate ??
                    note.createdAt,
                )}`,

            meta,

            sections,

            photoUrls:
                note.photoUrls,
        };
    }


    function getSourceExportDocument(
        source:
            SavedKnowledgeSource,
    ):
        KnowledgeExportDocument {
        const meta:
            string[] =
            [
                getSourceKindLabel(
                    source,
                ),
            ];

        if (
            source.category?.trim()
        ) {
            meta.push(
                `Category: ${source.category.trim()}`,
            );
        }

        if (
            source.sourceName?.trim()
        ) {
            meta.push(
                `From: ${source.sourceName.trim()}`,
            );
        }

        if (
            source.url?.trim()
        ) {
            meta.push(
                source.url.trim(),
            );
        }

        const sections:
            KnowledgeExportSection[] =
            [];

        if (
            source.excerpt?.trim()
        ) {
            sections.push({
                heading:
                    'Saved words',

                body:
                    source.excerpt,
            });
        }

        if (
            source.notes?.trim()
        ) {
            sections.push({
                heading:
                    'My note about it',

                body:
                    source.notes,
            });
        }

        return {
            eyebrow:
                'Saved Tip / Source',

            title:
                source.title,

            dateLine:
                `Saved ${formatDate(
                    source.savedDate ??
                    source.createdAt,
                )}`,

            meta,

            sections,

            photoUrls:
                source.photoUrls,
        };
    }


    function renderPlacementHelper(
        note:
            GardenNote,
    ) {
        const suggestions =
            getPlacementSuggestions(
                note,
            );

        return (
            <section className="sprig-knowledge-subsection">
                <p className="section-label">
                    Import & place
                </p>

                <h3>
                    Decide what this thought may become
                </h3>

                <label className="sprig-knowledge-field">
                    <span>
                        Working excerpt
                    </span>

                    <textarea
                        rows={
                            7
                        }
                        value={
                            placementExcerpt
                        }
                        onChange={event =>
                            setPlacementExcerpt(
                                event.target.value,
                            )
                        }
                    />
                </label>

                <div className="sprig-knowledge-suggestion-list">
                    {suggestions.map(
                        suggestion => (
                            <article
                                key={
                                    suggestion.type
                                }
                                className="sprig-knowledge-suggestion"
                            >
                                <strong>
                                    {suggestion.label}
                                </strong>

                                <p>
                                    {suggestion.reason}
                                </p>

                                {suggestion.type ===
                                    'reference' && (
                                    <button
                                        type="button"
                                        className="sprig-knowledge-secondary-button"
                                        onClick={() =>
                                            handlePlaceAsReference(
                                                note,
                                            )
                                        }
                                    >
                                        Place into Garden Reference
                                    </button>
                                )}

                                {suggestion.type ===
                                    'source' && (
                                    <button
                                        type="button"
                                        className="sprig-knowledge-secondary-button"
                                        onClick={() =>
                                            handlePlaceAsSource(
                                                note,
                                            )
                                        }
                                    >
                                        Save as Tip / Source
                                    </button>
                                )}

                                {suggestion.type ===
                                    'journal' && (
                                    <div className="sprig-knowledge-placement-action">
                                        <label>
                                            <span>
                                                Date it actually happened
                                            </span>

                                            <input
                                                type="date"
                                                value={
                                                    placementJournalDate
                                                }
                                                onChange={event =>
                                                    setPlacementJournalDate(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            className="sprig-knowledge-secondary-button"
                                            onClick={() =>
                                                handlePlaceAsJournal(
                                                    note,
                                                )
                                            }
                                        >
                                            Record in Journal
                                        </button>
                                    </div>
                                )}

                                {suggestion.type ===
                                    'plan' && (
                                    <div className="sprig-knowledge-placement-action">
                                        <label>
                                            <span>
                                                When do you intend to do it?
                                            </span>

                                            <input
                                                type="date"
                                                value={
                                                    placementPlanDate
                                                }
                                                onChange={event =>
                                                    setPlacementPlanDate(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            className="sprig-knowledge-secondary-button"
                                            onClick={() =>
                                                handlePlaceAsPlan(
                                                    note,
                                                )
                                            }
                                        >
                                            Make a Plan
                                        </button>
                                    </div>
                                )}
                            </article>
                        ),
                    )}
                </div>

                {(
                    note.placements ??
                    []
                ).length >
                    0 && (
                    <div className="sprig-knowledge-placement-history">
                        <h4>
                            Already placed from this note
                        </h4>

                        {(
                            note.placements ??
                            []
                        ).map(
                            placement => (
                                <div
                                    key={
                                        placement.id
                                    }
                                >
                                    <strong>
                                        {placement.destinationLabel ??
                                            placement.destinationType}
                                    </strong>

                                    <span>
                                        {formatDate(
                                            placement.placedAt,
                                        )}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </section>
        );
    }


    function renderNotesView() {
        if (
            selectedNote
        ) {
            const isEditing =
                editingNoteId ===
                selectedNote.id;

            return (
                <div className="sprig-knowledge-detail">
                    <div className="sprig-knowledge-detail-toolbar">
                        <button
                            type="button"
                            className="sprig-knowledge-text-button"
                            onClick={() =>
                                selectNote(
                                    null,
                                )
                            }
                        >
                            ← Garden Notes
                        </button>

                        <div className="sprig-knowledge-detail-actions">
                            <button
                                type="button"
                                className="sprig-knowledge-text-button"
                                onClick={() =>
                                    printDocuments(
                                        'Garden Note',
                                        [
                                            getNoteExportDocument(
                                                selectedNote,
                                            ),
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
                                        'Sprig-Garden-Note.rtf',
                                        'Garden Note',
                                        [
                                            getNoteExportDocument(
                                                selectedNote,
                                            ),
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
                                        startEditNote(
                                            selectedNote,
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
                                    handleDeleteNote(
                                        selectedNote,
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
                                Edit Garden Note
                            </p>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Title
                                    <small>
                                        {' '}
                                        optional
                                    </small>
                                </span>

                                <input
                                    type="text"
                                    value={
                                        editNoteTitle
                                    }
                                    onChange={event =>
                                        setEditNoteTitle(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Category
                                    <small>
                                        {' '}
                                        optional · type your own or reuse one
                                    </small>
                                </span>

                                <input
                                    type="text"
                                    list="sprig-knowledge-categories"
                                    value={
                                        editNoteCategory
                                    }
                                    onChange={event =>
                                        setEditNoteCategory(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    What do you want Sprig to remember?
                                </span>

                                <textarea
                                    rows={
                                        12
                                    }
                                    value={
                                        editNoteBody
                                    }
                                    onChange={event =>
                                        setEditNoteBody(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Note date
                                </span>

                                <input
                                    type="date"
                                    value={
                                        editNoteDate
                                    }
                                    onChange={event =>
                                        setEditNoteDate(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <SprigPhotoPicker
                                photoUrls={
                                    editNotePhotoUrls
                                }
                                onChange={
                                    setEditNotePhotoUrls
                                }
                                title="Photographs"
                                helperText="Add or remove photographs that belong to this thought."
                                addButtonText="Add photographs"
                                photoAltPrefix="Garden Note photograph"
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
                                        handleSaveEditedNote(
                                            selectedNote,
                                        )
                                    }
                                    disabled={
                                        !editNoteBody.trim()
                                    }
                                >
                                    Save changes
                                </button>

                                <button
                                    type="button"
                                    className="sprig-knowledge-secondary-button"
                                    onClick={() =>
                                        setEditingNoteId(
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
                            <article className="sprig-knowledge-paper sprig-knowledge-note-detail">
                                <p className="section-label">
                                    {selectedNote.origin ===
                                    'imported-text'
                                        ? 'Imported Garden Note'
                                        : 'Garden Note'}
                                </p>

                                <h2>
                                    {selectedNote.title ||
                                        makeTitleFromBody(
                                            selectedNote.body,
                                        )}
                                </h2>

                                {selectedNote.category && (
                                    <p className="sprig-knowledge-muted">
                                        {selectedNote.category}
                                    </p>
                                )}

                                <p className="sprig-knowledge-date">
                                    {formatDate(
                                        selectedNote.noteDate ??
                                            selectedNote.createdAt,
                                    )}
                                </p>

                                <div className="sprig-knowledge-prose">
                                    {selectedNote.body
                                        .split(
                                            /\r?\n/,
                                        )
                                        .map(
                                            (
                                                line,
                                                index,
                                            ) => (
                                                <p
                                                    key={`${selectedNote.id}-line-${index}`}
                                                >
                                                    {line ||
                                                        '\u00A0'}
                                                </p>
                                            ),
                                        )}
                                </div>

                                {selectedNote.origin ===
                                    'imported-text' && (
                                    <details className="sprig-knowledge-original">
                                        <summary>
                                            Original imported note
                                        </summary>

                                        <p>
                                            Sprig keeps this preserved snapshot even if the working note changes later.
                                        </p>

                                        <pre>
                                            {selectedNote.originalBody ??
                                                selectedNote.body}
                                        </pre>
                                    </details>
                                )}
                            </article>

                            {(
                                selectedNote.photoUrls ??
                                []
                            ).length >
                                0 && (
                                <SprigPhotoGallery
                                    photoUrls={
                                        selectedNote.photoUrls ??
                                        []
                                    }
                                    title="Note photographs"
                                    photoAltPrefix="Garden Note photograph"
                                />
                            )}

                            {renderRelationshipEditor(
                                selectedNote,
                                'note',
                            )}

                            {renderPlacementHelper(
                                selectedNote,
                            )}
                        </>
                    )}
                </div>
            );
        }

        return (
            <div className="sprig-knowledge-two-column sprig-knowledge-browse-first">
                <div className="sprig-knowledge-mobile-add">
                    <button
                        type="button"
                        className="sprig-knowledge-mobile-add-button"
                        aria-expanded={
                            noteComposerOpen
                        }
                        aria-controls="sprig-garden-note-composer"
                        onClick={() =>
                            setNoteComposerOpen(
                                current =>
                                    !current,
                            )
                        }
                    >
                        <span>
                            {noteComposerOpen
                                ? '−'
                                : '+'}
                        </span>

                        {noteComposerOpen
                            ? 'Close Garden Note form'
                            : 'Add Garden Note'}
                    </button>
                </div>

                <section
                    id="sprig-garden-note-composer"
                    className={`sprig-knowledge-paper sprig-knowledge-capture sprig-knowledge-mobile-collapsible${
                        noteComposerOpen
                            ? ' sprig-knowledge-mobile-collapsible--open'
                            : ''
                    }`}
                >
                    <p className="section-label">
                        Capture first
                    </p>

                    <h2>
                        Put the thought somewhere safe
                    </h2>

                    <p>
                        It does not need a perfect category,
                        relationship or structure yet. Sprig can
                        help you place useful pieces afterwards.
                    </p>

                    <div className="sprig-knowledge-detail-actions">
                        <button
                            type="button"
                            className={
                                !isImporting
                                    ? 'sprig-knowledge-primary-button'
                                    : 'sprig-knowledge-secondary-button'
                            }
                            onClick={() =>
                                setIsImporting(
                                    false,
                                )
                            }
                        >
                            New note
                        </button>

                        <button
                            type="button"
                            className={
                                isImporting
                                    ? 'sprig-knowledge-primary-button'
                                    : 'sprig-knowledge-secondary-button'
                            }
                            onClick={() =>
                                setIsImporting(
                                    true,
                                )
                            }
                        >
                            Import an old note
                        </button>
                    </div>

                    <label className="sprig-knowledge-field">
                        <span>
                            Title
                            <small>
                                {' '}
                                optional
                            </small>
                        </span>

                        <input
                            type="text"
                            value={
                                noteTitle
                            }
                            onChange={event =>
                                setNoteTitle(
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Category
                            <small>
                                {' '}
                                optional · type your own or reuse one
                            </small>
                        </span>

                        <input
                            type="text"
                            list="sprig-knowledge-categories"
                            value={
                                noteCategory
                            }
                            onChange={event =>
                                setNoteCategory(
                                    event.target.value,
                                )
                            }
                            placeholder="Potatoes, ideas, pests, greenhouse..."
                        />
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            What do you want Sprig to remember?
                        </span>

                        <textarea
                            rows={
                                10
                            }
                            value={
                                noteBody
                            }
                            onChange={event =>
                                setNoteBody(
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Note date
                        </span>

                        <input
                            type="date"
                            value={
                                noteDate
                            }
                            onChange={event =>
                                setNoteDate(
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    {isImporting && (
                        <>
                            <label className="sprig-knowledge-field">
                                <span>
                                    Where did this old note come from?
                                    <small>
                                        {' '}
                                        optional
                                    </small>
                                </span>

                                <input
                                    type="text"
                                    value={
                                        importSourceLabel
                                    }
                                    onChange={event =>
                                        setImportSourceLabel(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Google Keep, old notebook..."
                                />
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Original link
                                    <small>
                                        {' '}
                                        optional
                                    </small>
                                </span>

                                <input
                                    type="url"
                                    value={
                                        importSourceUrl
                                    }
                                    onChange={event =>
                                        setImportSourceUrl(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>
                        </>
                    )}

                    <SprigPhotoPicker
                        photoUrls={
                            notePhotoUrls
                        }
                        onChange={
                            setNotePhotoUrls
                        }
                        title="Photographs"
                        helperText="Add any photographs that belong to this thought."
                        addButtonText="Add photographs"
                        photoAltPrefix="Garden Note photograph"
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
                                handleSaveNote
                            }
                            disabled={
                                !noteBody.trim()
                            }
                        >
                            {isImporting
                                ? 'Preserve this note'
                                : 'Save Garden Note'}
                        </button>

                        <button
                            type="button"
                            className="sprig-knowledge-secondary-button sprig-knowledge-mobile-composer-cancel"
                            onClick={() => {
                                resetNoteComposer();

                                setNoteComposerOpen(
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
                                Garden Notes
                            </p>

                            <h2>
                                The loose leaves
                            </h2>
                        </div>

                        <span className="sprig-knowledge-count">
                            {notes.length}{' '}
                            {notes.length ===
                            1
                                ? 'note'
                                : 'notes'}
                        </span>
                    </div>

                    <section className="sprig-knowledge-paper">
                        <label className="sprig-knowledge-field">
                            <span>
                                Find a Garden Note
                            </span>

                            <input
                                type="search"
                                value={
                                    noteSearch
                                }
                                onChange={event =>
                                    setNoteSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search title, words, category or date..."
                            />
                        </label>
                    </section>

                    {notes.length ===
                    0 ? (
                        <div className="sprig-knowledge-empty">
                            <strong>
                                Nothing loose yet.
                            </strong>

                            <p>
                                Garden Notes are allowed to be unfinished. That is their job.
                            </p>
                        </div>
                    ) : filteredNotes.length ===
                      0 ? (
                        <div className="sprig-knowledge-empty">
                            <strong>
                                No Garden Notes match that search.
                            </strong>
                        </div>
                    ) : (
                        <div className="sprig-knowledge-card-list">
                            {filteredNotes.map(
                                note => (
                                    <button
                                        key={
                                            note.id
                                        }
                                        type="button"
                                        className="sprig-knowledge-card"
                                        onClick={() =>
                                            selectNote(
                                                note.id,
                                            )
                                        }
                                    >
                                        <div>
                                            {note.category && (
                                                <span className="sprig-knowledge-card-kicker">
                                                    {note.category}
                                                </span>
                                            )}

                                            <strong>
                                                {note.title ||
                                                    makeTitleFromBody(
                                                        note.body,
                                                    )}
                                            </strong>

                                            <p>
                                                {note.body}
                                            </p>
                                        </div>

                                        <div className="sprig-knowledge-card-meta">
                                            <span>
                                                {formatDate(
                                                    note.noteDate ??
                                                        note.createdAt,
                                                )}
                                            </span>
                                        </div>
                                    </button>
                                ),
                            )}
                        </div>
                    )}
                </section>
            </div>
        );
    }


    function renderSourcesView() {
        if (
            selectedSource
        ) {
            const isEditing =
                editingSourceId ===
                selectedSource.id;

            return (
                <div className="sprig-knowledge-detail">
                    <div className="sprig-knowledge-detail-toolbar">
                        <button
                            type="button"
                            className="sprig-knowledge-text-button"
                            onClick={() =>
                                selectSource(
                                    null,
                                )
                            }
                        >
                            ← Tips & Sources
                        </button>

                        <div className="sprig-knowledge-detail-actions">
                            <button
                                type="button"
                                className="sprig-knowledge-text-button"
                                onClick={() =>
                                    printDocuments(
                                        'Saved Tip / Source',
                                        [
                                            getSourceExportDocument(
                                                selectedSource,
                                            ),
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
                                        'Sprig-Tip-Source.rtf',
                                        'Saved Tip / Source',
                                        [
                                            getSourceExportDocument(
                                                selectedSource,
                                            ),
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
                                        startEditSource(
                                            selectedSource,
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
                                    handleDeleteSource(
                                        selectedSource,
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
                                Edit Tip / Source
                            </p>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Title
                                </span>

                                <input
                                    type="text"
                                    value={
                                        editSourceTitle
                                    }
                                    onChange={event =>
                                        setEditSourceTitle(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Kind of source
                                </span>

                                <select
                                    value={
                                        editSourceKind
                                    }
                                    onChange={event =>
                                        setEditSourceKind(
                                            event.target.value as SavedKnowledgeSourceKind,
                                        )
                                    }
                                >
                                    {SOURCE_KIND_OPTIONS.map(
                                        option => (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {option.label}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </label>

                            {editSourceKind ===
                                'other' && (
                                <label className="sprig-knowledge-field">
                                    <span>
                                        Your source kind
                                    </span>

                                    <input
                                        type="text"
                                        value={
                                            editSourceCustomKind
                                        }
                                        onChange={event =>
                                            setEditSourceCustomKind(
                                                event.target.value,
                                            )
                                        }
                                    />
                                </label>
                            )}

                            <label className="sprig-knowledge-field">
                                <span>
                                    Category
                                    <small>
                                        {' '}
                                        optional · type your own or reuse one
                                    </small>
                                </span>

                                <input
                                    type="text"
                                    list="sprig-knowledge-categories"
                                    value={
                                        editSourceCategory
                                    }
                                    onChange={event =>
                                        setEditSourceCategory(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Who or where?
                                    <small>
                                        {' '}
                                        optional
                                    </small>
                                </span>

                                <input
                                    type="text"
                                    value={
                                        editSourceName
                                    }
                                    onChange={event =>
                                        setEditSourceName(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Link
                                    <small>
                                        {' '}
                                        optional
                                    </small>
                                </span>

                                <input
                                    type="url"
                                    value={
                                        editSourceUrl
                                    }
                                    onChange={event =>
                                        setEditSourceUrl(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Saved / noted date
                                </span>

                                <input
                                    type="date"
                                    value={
                                        editSourceSavedDate
                                    }
                                    onChange={event =>
                                        setEditSourceSavedDate(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    What did you want to save?
                                </span>

                                <textarea
                                    rows={
                                        8
                                    }
                                    value={
                                        editSourceExcerpt
                                    }
                                    onChange={event =>
                                        setEditSourceExcerpt(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    My note about it
                                    <small>
                                        {' '}
                                        optional
                                    </small>
                                </span>

                                <textarea
                                    rows={
                                        6
                                    }
                                    value={
                                        editSourceNotes
                                    }
                                    onChange={event =>
                                        setEditSourceNotes(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <SprigPhotoPicker
                                photoUrls={
                                    editSourcePhotoUrls
                                }
                                onChange={
                                    setEditSourcePhotoUrls
                                }
                                title="Photographs"
                                helperText="Add or remove screenshots, pages or other photographs."
                                addButtonText="Add photographs"
                                photoAltPrefix="Saved source photograph"
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
                                        handleSaveEditedSource(
                                            selectedSource,
                                        )
                                    }
                                    disabled={
                                        !editSourceTitle.trim()
                                    }
                                >
                                    Save changes
                                </button>

                                <button
                                    type="button"
                                    className="sprig-knowledge-secondary-button"
                                    onClick={() =>
                                        setEditingSourceId(
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
                                    {getSourceKindLabel(
                                        selectedSource,
                                    )}
                                </p>

                                <h2>
                                    {selectedSource.title}
                                </h2>

                                {selectedSource.category && (
                                    <p className="sprig-knowledge-muted">
                                        {selectedSource.category}
                                    </p>
                                )}

                                {selectedSource.sourceName && (
                                    <p className="sprig-knowledge-source-name">
                                        From{' '}
                                        {selectedSource.sourceName}
                                    </p>
                                )}

                                <p className="sprig-knowledge-date">
                                    {formatDate(
                                        selectedSource.savedDate ??
                                            selectedSource.createdAt,
                                    )}
                                </p>

                                {selectedSource.url && (
                                    <p>
                                        <a
                                            href={
                                                selectedSource.url
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Open source ↗
                                        </a>
                                    </p>
                                )}

                                {selectedSource.excerpt && (
                                    <div className="sprig-knowledge-prose">
                                        <h3>
                                            Saved words
                                        </h3>

                                        {selectedSource.excerpt
                                            .split(
                                                /\r?\n/,
                                            )
                                            .map(
                                                (
                                                    line,
                                                    index,
                                                ) => (
                                                    <p
                                                        key={`${selectedSource.id}-excerpt-${index}`}
                                                    >
                                                        {line ||
                                                            '\u00A0'}
                                                    </p>
                                                ),
                                            )}
                                    </div>
                                )}

                                {selectedSource.notes && (
                                    <div className="sprig-knowledge-prose">
                                        <h3>
                                            My note about it
                                        </h3>

                                        {selectedSource.notes
                                            .split(
                                                /\r?\n/,
                                            )
                                            .map(
                                                (
                                                    line,
                                                    index,
                                                ) => (
                                                    <p
                                                        key={`${selectedSource.id}-note-${index}`}
                                                    >
                                                        {line ||
                                                            '\u00A0'}
                                                    </p>
                                                ),
                                            )}
                                    </div>
                                )}
                            </article>

                            {(
                                selectedSource.photoUrls ??
                                []
                            ).length >
                                0 && (
                                <SprigPhotoGallery
                                    photoUrls={
                                        selectedSource.photoUrls ??
                                        []
                                    }
                                    title="Source photographs"
                                    photoAltPrefix="Saved source photograph"
                                />
                            )}

                            {renderRelationshipEditor(
                                selectedSource,
                                'source',
                            )}
                        </>
                    )}
                </div>
            );
        }

        return (
            <div className="sprig-knowledge-two-column sprig-knowledge-browse-first">
                <div className="sprig-knowledge-mobile-add">
                    <button
                        type="button"
                        className="sprig-knowledge-mobile-add-button"
                        aria-expanded={
                            sourceComposerOpen
                        }
                        aria-controls="sprig-saved-source-composer"
                        onClick={() =>
                            setSourceComposerOpen(
                                current =>
                                    !current,
                            )
                        }
                    >
                        <span>
                            {sourceComposerOpen
                                ? '−'
                                : '+'}
                        </span>

                        {sourceComposerOpen
                            ? 'Close Tip / Source form'
                            : 'Add Tip / Source'}
                    </button>
                </div>

                <section
                    id="sprig-saved-source-composer"
                    className={`sprig-knowledge-paper sprig-knowledge-capture sprig-knowledge-mobile-collapsible${
                        sourceComposerOpen
                            ? ' sprig-knowledge-mobile-collapsible--open'
                            : ''
                    }`}
                >
                    <p className="section-label">
                        Saved Tips & Sources
                    </p>

                    <h2>
                        Keep the advice with where it came
                    </h2>

                    <p>
                        Advice is not automatically truth. Sprig
                        keeps the source attached so you can
                        remember who said it, where you found it
                        and what you thought about it.
                    </p>

                    <label className="sprig-knowledge-field">
                        <span>
                            Title
                        </span>

                        <input
                            type="text"
                            value={
                                sourceTitle
                            }
                            onChange={event =>
                                setSourceTitle(
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Kind of source
                        </span>

                        <select
                            value={
                                sourceKind
                            }
                            onChange={event =>
                                setSourceKind(
                                    event.target.value as SavedKnowledgeSourceKind,
                                )
                            }
                        >
                            {SOURCE_KIND_OPTIONS.map(
                                option => (
                                    <option
                                        key={
                                            option.value
                                        }
                                        value={
                                            option.value
                                        }
                                    >
                                        {option.label}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>

                    {sourceKind ===
                        'other' && (
                        <label className="sprig-knowledge-field">
                            <span>
                                Your source kind
                            </span>

                            <input
                                type="text"
                                value={
                                    sourceCustomKind
                                }
                                onChange={event =>
                                    setSourceCustomKind(
                                        event.target.value,
                                    )
                                }
                            />
                        </label>
                    )}

                    <label className="sprig-knowledge-field">
                        <span>
                            Category
                            <small>
                                {' '}
                                optional · type your own or reuse one
                            </small>
                        </span>

                        <input
                            type="text"
                            list="sprig-knowledge-categories"
                            value={
                                sourceCategory
                            }
                            onChange={event =>
                                setSourceCategory(
                                    event.target.value,
                                )
                            }
                            placeholder="Potatoes, feeding, pests, ideas..."
                        />
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Who or where?
                            <small>
                                {' '}
                                optional
                            </small>
                        </span>

                        <input
                            type="text"
                            value={
                                sourceName
                            }
                            onChange={event =>
                                setSourceName(
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Link
                            <small>
                                {' '}
                                optional
                            </small>
                        </span>

                        <input
                            type="url"
                            value={
                                sourceUrl
                            }
                            onChange={event =>
                                setSourceUrl(
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Saved / noted date
                        </span>

                        <input
                            type="date"
                            value={
                                sourceSavedDate
                            }
                            onChange={event =>
                                setSourceSavedDate(
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            What did you want to save?
                        </span>

                        <textarea
                            rows={
                                8
                            }
                            value={
                                sourceExcerpt
                            }
                            onChange={event =>
                                setSourceExcerpt(
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            My note about it
                            <small>
                                {' '}
                                optional
                            </small>
                        </span>

                        <textarea
                            rows={
                                6
                            }
                            value={
                                sourceNotes
                            }
                            onChange={event =>
                                setSourceNotes(
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    <SprigPhotoPicker
                        photoUrls={
                            sourcePhotoUrls
                        }
                        onChange={
                            setSourcePhotoUrls
                        }
                        title="Photographs"
                        helperText="Add screenshots, labels, pages or other photographs that preserve the source."
                        addButtonText="Add photographs"
                        photoAltPrefix="Saved source photograph"
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
                                handleSaveSource
                            }
                            disabled={
                                !sourceTitle.trim()
                            }
                        >
                            Save Tip / Source
                        </button>

                        <button
                            type="button"
                            className="sprig-knowledge-secondary-button sprig-knowledge-mobile-composer-cancel"
                            onClick={() => {
                                resetSourceComposer();

                                setSourceComposerOpen(
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
                                Saved shelf
                            </p>

                            <h2>
                                Advice worth finding again
                            </h2>
                        </div>

                        <span className="sprig-knowledge-count">
                            {sources.length}{' '}
                            {sources.length ===
                            1
                                ? 'source'
                                : 'sources'}
                        </span>
                    </div>

                    <section className="sprig-knowledge-paper">
                        <label className="sprig-knowledge-field">
                            <span>
                                Find a Tip or Source
                            </span>

                            <input
                                type="search"
                                value={
                                    sourceSearch
                                }
                                onChange={event =>
                                    setSourceSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search title, category, source, words or notes..."
                            />
                        </label>
                    </section>

                    {sources.length ===
                    0 ? (
                        <div className="sprig-knowledge-empty">
                            <strong>
                                No saved sources yet.
                            </strong>

                            <p>
                                Links, Facebook advice, ChatGPT
                                guidance, books, people and
                                screenshots can all live here.
                            </p>
                        </div>
                    ) : filteredSources.length ===
                      0 ? (
                        <div className="sprig-knowledge-empty">
                            <strong>
                                No Tips or Sources match that search.
                            </strong>
                        </div>
                    ) : (
                        <div className="sprig-knowledge-card-list">
                            {filteredSources.map(
                                source => (
                                    <button
                                        key={
                                            source.id
                                        }
                                        type="button"
                                        className="sprig-knowledge-card"
                                        onClick={() =>
                                            selectSource(
                                                source.id,
                                            )
                                        }
                                    >
                                        <div>
                                            <span className="sprig-knowledge-card-kicker">
                                                {source.category
                                                    ? `${source.category} · ${getSourceKindLabel(
                                                          source,
                                                      )}`
                                                    : getSourceKindLabel(
                                                          source,
                                                      )}
                                            </span>

                                            <strong>
                                                {source.title}
                                            </strong>

                                            {source.excerpt && (
                                                <p>
                                                    {source.excerpt}
                                                </p>
                                            )}
                                        </div>

                                        <div className="sprig-knowledge-card-meta">
                                            {source.sourceName && (
                                                <span>
                                                    {source.sourceName}
                                                </span>
                                            )}

                                            <span>
                                                {formatDate(
                                                    source.savedDate ??
                                                        source.createdAt,
                                                )}
                                            </span>
                                        </div>
                                    </button>
                                ),
                            )}
                        </div>
                    )}
                </section>
            </div>
        );
    }


    function renderAlmanacView() {
        const selectedThread =
            almanacThreads.find(
                thread =>
                    thread.key ===
                    selectedAlmanacThreadKey,
            ) ??
            null;

        if (
            selectedThread
        ) {
            const threadNeedle =
                normalise(
                    selectedThread.label,
                );

            const broadNeedle =
                normalise(
                    selectedThread.label.split(
                        '·',
                    )[0],
                );

            const plantStories =
                (
                    gardenData.plantStories ??
                    []
                ).filter(
                    plant =>
                        normalise(
                            `${plant.plantName} ${plant.variety ?? ''}`,
                        ).includes(
                            broadNeedle,
                        ),
                );

            const plantIds =
                plantStories.map(
                    plant =>
                        plant.id,
                );

            const harvests =
                (
                    gardenData.harvests ??
                    []
                ).filter(
                    harvest =>
                        harvest.plantStoryIds.some(
                            plantId =>
                                plantIds.includes(
                                    plantId,
                                ),
                        ),
                );

            const threadNotes =
                notes.filter(
                    note => {
                        const text =
                            normalise(
                                `${note.title ?? ''} ${note.category ?? ''} ${note.body}`,
                            );

                        return (
                            text.includes(
                                threadNeedle,
                            ) ||
                            text.includes(
                                broadNeedle,
                            )
                        );
                    },
                );

            const threadReferences =
                references.filter(
                    reference =>
                        (
                            reference.subjectType ??
                            'plant-crop'
                        ) ===
                            'plant-crop' &&
                        normalise(
                            `${reference.plantName} ${reference.variety ?? ''}`,
                        ).includes(
                            broadNeedle,
                        ),
                );

            const threadSources =
                sources.filter(
                    source => {
                        const text =
                            normalise(
                                `${source.title} ${source.category ?? ''} ${source.sourceName ?? ''} ${source.excerpt ?? ''} ${source.notes ?? ''}`,
                            );

                        return (
                            text.includes(
                                threadNeedle,
                            ) ||
                            text.includes(
                                broadNeedle,
                            )
                        );
                    },
                );

            return (
                <div className="sprig-knowledge-almanac">
                    <div className="sprig-knowledge-detail-toolbar">
                        <button
                            type="button"
                            className="sprig-knowledge-text-button"
                            onClick={() =>
                                setSelectedAlmanacThreadKey(
                                    null,
                                )
                            }
                        >
                            ← Garden Almanac
                        </button>
                    </div>

                    <section className="sprig-knowledge-paper">
                        <p className="section-label">
                            Garden thread
                        </p>

                        <h2>
                            {selectedThread.label}
                        </h2>

                        <p className="sprig-knowledge-almanac-phrase">
                            {getEvidencePhrase(
                                selectedThread.evidenceCount,
                            )}
                        </p>

                        <p>
                            Sprig is gathering related pieces
                            here so you can see the story
                            together. The original records
                            remain where they belong.
                        </p>
                    </section>

                    {plantStories.length >
                        0 && (
                        <section className="sprig-knowledge-paper">
                            <h3>
                                Plant Stories
                            </h3>

                            <div className="sprig-knowledge-card-list">
                                {plantStories.map(
                                    plant => (
                                        <button
                                            key={
                                                plant.id
                                            }
                                            type="button"
                                            className="sprig-knowledge-card"
                                            onClick={() =>
                                                onOpenRelationship(
                                                    'plant-story',
                                                    plant.id,
                                                )
                                            }
                                        >
                                            <strong>
                                                {plant.displayName ||
                                                    plant.variety ||
                                                    plant.plantName}
                                            </strong>
                                        </button>
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                    {harvests.length >
                        0 && (
                        <section className="sprig-knowledge-paper">
                            <h3>
                                Harvests
                            </h3>

                            <div className="sprig-knowledge-card-list">
                                {harvests.map(
                                    harvest => (
                                        <button
                                            key={
                                                harvest.id
                                            }
                                            type="button"
                                            className="sprig-knowledge-card"
                                            onClick={() =>
                                                onOpenRelationship(
                                                    'harvest',
                                                    harvest.id,
                                                )
                                            }
                                        >
                                            <strong>
                                                Harvest ·{' '}
                                                {formatDate(
                                                    harvest.date,
                                                )}
                                            </strong>
                                        </button>
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                    {threadNotes.length >
                        0 && (
                        <section className="sprig-knowledge-paper">
                            <h3>
                                Garden Notes
                            </h3>

                            <div className="sprig-knowledge-card-list">
                                {threadNotes.map(
                                    note => (
                                        <button
                                            key={
                                                note.id
                                            }
                                            type="button"
                                            className="sprig-knowledge-card"
                                            onClick={() =>
                                                selectNote(
                                                    note.id,
                                                )
                                            }
                                        >
                                            <strong>
                                                {note.title ||
                                                    makeTitleFromBody(
                                                        note.body,
                                                    )}
                                            </strong>

                                            {note.category && (
                                                <span>
                                                    {note.category}
                                                </span>
                                            )}
                                        </button>
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                    {threadReferences.length >
                        0 && (
                        <section className="sprig-knowledge-paper">
                            <h3>
                                Garden Reference
                            </h3>

                            <div className="sprig-knowledge-card-list">
                                {threadReferences.map(
                                    reference => (
                                        <button
                                            key={
                                                reference.id
                                            }
                                            type="button"
                                            className="sprig-knowledge-card"
                                            onClick={() =>
                                                onOpenRelationship(
                                                    'plant-reference',
                                                    reference.id,
                                                )
                                            }
                                        >
                                            <strong>
                                                {getReferenceTitle(
                                                    reference,
                                                )}
                                            </strong>

                                            <span>
                                                {getReferenceSubjectLabel(
                                                    reference,
                                                )}
                                            </span>
                                        </button>
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                    {threadSources.length >
                        0 && (
                        <section className="sprig-knowledge-paper">
                            <h3>
                                Tips & Sources
                            </h3>

                            <div className="sprig-knowledge-card-list">
                                {threadSources.map(
                                    source => (
                                        <button
                                            key={
                                                source.id
                                            }
                                            type="button"
                                            className="sprig-knowledge-card"
                                            onClick={() =>
                                                selectSource(
                                                    source.id,
                                                )
                                            }
                                        >
                                            <strong>
                                                {source.title}
                                            </strong>

                                            {source.category && (
                                                <span>
                                                    {source.category}
                                                </span>
                                            )}
                                        </button>
                                    ),
                                )}
                            </div>
                        </section>
                    )}
                </div>
            );
        }

        return (
            <div className="sprig-knowledge-almanac">
                <section className="sprig-knowledge-paper sprig-knowledge-almanac-intro">
                    <p className="section-label">
                        Garden Almanac
                    </p>

                    <h2>
                        Your garden, beginning to teach itself back to you
                    </h2>

                    <label className="sprig-knowledge-field">
                        <span>
                            Find an Almanac thread
                        </span>

                        <input
                            type="search"
                            value={
                                almanacQuery
                            }
                            onChange={event =>
                                setAlmanacQuery(
                                    event.target.value,
                                )
                            }
                            placeholder="Potato, Royal Blue, tomato..."
                        />
                    </label>

                    <details className="sprig-knowledge-paper">
                        <summary>
                            About the Garden Almanac
                        </summary>

                        <p>
                            The Almanac is not another place to
                            re-enter records. It gathers threads
                            from Plant Stories, Harvests, Garden
                            Notes, Garden Reference and Tips &
                            Sources so patterns can become visible
                            without pretending every clue is a
                            proven gardening rule.
                        </p>

                        <p className="sprig-knowledge-muted">
                            Your original records stay where they
                            belong. The Almanac simply gathers the
                            threads.
                        </p>
                    </details>
                </section>

                {filteredAlmanacThreads.length ===
                0 ? (
                    <div className="sprig-knowledge-empty">
                        <strong>
                            No matching garden thread yet.
                        </strong>

                        <p>
                            As Sprig gathers your garden story,
                            more threads can begin appearing here.
                        </p>
                    </div>
                ) : (
                    <div className="sprig-knowledge-almanac-grid">
                        {filteredAlmanacThreads.map(
                            thread => (
                                <button
                                    key={
                                        thread.key
                                    }
                                    type="button"
                                    className="sprig-knowledge-paper sprig-knowledge-almanac-card sprig-knowledge-almanac-card--button"
                                    onClick={() =>
                                        setSelectedAlmanacThreadKey(
                                            thread.key,
                                        )
                                    }
                                >
                                    <p className="section-label">
                                        Garden thread
                                    </p>

                                    <h3>
                                        {thread.label}
                                    </h3>

                                    <p className="sprig-knowledge-almanac-phrase">
                                        {getEvidencePhrase(
                                            thread.evidenceCount,
                                        )}
                                    </p>

                                    <dl className="sprig-knowledge-thread-counts">
                                        <div>
                                            <dt>
                                                Plant Stories
                                            </dt>

                                            <dd>
                                                {thread.plantStoryCount}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Harvests
                                            </dt>

                                            <dd>
                                                {thread.harvestCount}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Garden Notes
                                            </dt>

                                            <dd>
                                                {thread.noteCount}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Garden Reference
                                            </dt>

                                            <dd>
                                                {thread.referenceCount}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Tips & Sources
                                            </dt>

                                            <dd>
                                                {thread.sourceCount}
                                            </dd>
                                        </div>
                                    </dl>

                                    <p className="sprig-knowledge-muted">
                                        Open this garden thread ›
                                    </p>
                                </button>
                            ),
                        )}
                    </div>
                )}
            </div>
        );
    }


    function renderKnowledgeNavigation() {
        return (
            <nav
                className="sprig-knowledge-tabs"
                aria-label="Garden Knowledge"
            >
                {KNOWLEDGE_TABS.map(
                    tab => (
                        <button
                            key={
                                tab.view
                            }
                            type="button"
                            className={
                                tab.view ===
                                view
                                    ? 'sprig-knowledge-tab sprig-knowledge-tab--active'
                                    : 'sprig-knowledge-tab'
                            }
                            onClick={() =>
                                onNavigate(
                                    tab.page,
                                )
                            }
                        >
                            <span aria-hidden="true">
                                {tab.icon}
                            </span>

                            <span>
                                {tab.label}
                            </span>
                        </button>
                    ),
                )}
            </nav>
        );
    }


    function getPageTitle():
        string {
        switch (
            view
        ) {
            case 'notes':
                return 'Garden Notes';

            case 'almanac':
                return 'Garden Almanac';

            case 'reference':
                return 'Garden Reference';

            case 'sources':
                return 'Saved Tips & Sources';

            default:
                return 'Garden Knowledge';
        }
    }


    function getPageSubtitle():
        string {
        switch (
            view
        ) {
            case 'notes':
                return 'Catch the thought first. Decide what it means later.';

            case 'almanac':
                return 'Patterns and threads gathered from your own garden story.';

            case 'reference':
                return 'Reusable knowledge about plants, products, pests, problems and the wider garden.';

            case 'sources':
                return 'Advice kept together with where it came from.';

            default:
                return '';
        }
    }


    return (
        <GardenLayout
            activePage={
                view ===
                'notes'
                    ? 'garden-notes'
                    : view ===
                        'almanac'
                      ? 'garden-almanac'
                      : view ===
                          'reference'
                        ? 'plant-reference'
                        : 'saved-sources'
            }
            onNavigate={
                onNavigate
            }
        >
            <div className="sprig-knowledge-page">
                <header className="journal-header sprig-knowledge-header">
                    <div>
                        <p className="section-label">
                            Garden Knowledge
                        </p>

                        <h1>
                            {getPageTitle()}
                        </h1>

                        <p className="journal-intro">
                            {getPageSubtitle()}
                        </p>
                    </div>
                </header>

                {journeyBackLabel &&
                    onJourneyBack && (
                    <button
                        type="button"
                        className="sprig-knowledge-text-button"
                        onClick={
                            onJourneyBack
                        }
                    >
                        ← Back to{' '}
                        {journeyBackLabel}
                    </button>
                )}

                {renderKnowledgeNavigation()}

                <datalist id="sprig-knowledge-categories">
                    {knowledgeCategories.map(
                        category => (
                            <option
                                key={
                                    category
                                }
                                value={
                                    category
                                }
                            />
                        ),
                    )}
                </datalist>

                {view ===
                    'notes' &&
                    renderNotesView()}

                {view ===
                    'almanac' &&
                    renderAlmanacView()}

                {view ===
                    'reference' && (
                    <GardenReference
                        gardenData={
                            gardenData
                        }
                        initialRecordId={
                            initialRecord?.sourceType ===
                            'plant-reference'
                                ? initialRecord.recordId
                                : null
                        }
                        onGardenDataChange={
                            onGardenDataChange
                        }
                        onRecordSelectionChange={recordId =>
                            onRecordSelectionChange(
                                recordId
                                    ? {
                                          sourceType:
                                              'plant-reference',

                                          recordId,
                                      }
                                    : null,
                            )
                        }
                        onOpenRelationship={
                            onOpenRelationship
                        }
                    />
                )}

                {view ===
                    'sources' &&
                    renderSourcesView()}
            </div>
        </GardenLayout>
    );
}
