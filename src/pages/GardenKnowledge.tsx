import { useEffect, useMemo, useState, } from 'react';
import GardenLayout from '../components/layout/GardenLayout';
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery';
import SprigPhotoPicker from '../components/photos/SprigPhotoPicker';
import type { AppPage, } from '../types/navigation';
import type { GardenData, GardenEvent, GardenNote, GardenPlan, KnowledgePlacement, KnowledgeRelationship, KnowledgeRelationshipTargetType, PlantReference, SavedKnowledgeSource, SavedKnowledgeSourceKind, } from '../types';
import '../css/garden-knowledge.css';
export type GardenKnowledgeView = 'notes' | 'almanac' | 'reference' | 'sources';
export type GardenKnowledgeRecordType = 'garden-note' | 'plant-reference' | 'saved-source';
interface GardenKnowledgeRecordDestination {
    sourceType: GardenKnowledgeRecordType;
    recordId: string;
}
interface GardenKnowledgeProps {
    view: GardenKnowledgeView;
    gardenData: GardenData;
    initialRecord?: GardenKnowledgeRecordDestination | null;
    journeyBackLabel?: string | null;
    onJourneyBack?: () => void;
    onGardenDataChange: (gardenData: GardenData) => void;
    onRecordSelectionChange: (destination: GardenKnowledgeRecordDestination | null) => void;
    onNavigate: (page: AppPage) => void;
    onOpenRelationship: (targetType: KnowledgeRelationshipTargetType, targetId: string) => void;
}
type KnowledgePlacementSuggestionType = 'journal' | 'plan' | 'reference' | 'source' | 'keep-note';
interface KnowledgePlacementSuggestion {
    type: KnowledgePlacementSuggestionType;
    label: string;
    reason: string;
}
interface RelationshipOption {
    targetType: KnowledgeRelationshipTargetType;
    targetId: string;
    label: string;
    group: string;
}
interface KnowledgeExportSection {
    heading?: string;
    body?: string;
    lines?: string[];
}
interface KnowledgeExportDocument {
    eyebrow: string;
    title: string;
    dateLine?: string;
    meta?: string[];
    sections: KnowledgeExportSection[];
    photoUrls?: string[];
}
interface AlmanacThread {
    key: string;
    label: string;
    plantStoryCount: number;
    harvestCount: number;
    noteCount: number;
    sourceCount: number;
    referenceCount: number;
    evidenceCount: number;
}
const KNOWLEDGE_TABS: Array<{
    page: AppPage;
    view: GardenKnowledgeView;
    label: string;
    icon: string;
}> = [
    {
        page: 'garden-notes',
        view: 'notes',
        label: 'Garden Notes',
        icon: '📝',
    },
    {
        page: 'garden-almanac',
        view: 'almanac',
        label: 'Garden Almanac',
        icon: '📖',
    },
    {
        page: 'plant-reference',
        view: 'reference',
        label: 'Plant Reference',
        icon: '🌿',
    },
    {
        page: 'saved-sources',
        view: 'sources',
        label: 'Tips & Sources',
        icon: '🔖',
    },
];
const SOURCE_KIND_OPTIONS: Array<{
    value: SavedKnowledgeSourceKind;
    label: string;
}> = [
    {
        value: 'website',
        label: 'Website or article',
    },
    {
        value: 'facebook',
        label: 'Facebook gardener or group',
    },
    {
        value: 'chatgpt',
        label: 'ChatGPT conversation',
    },
    {
        value: 'person',
        label: 'A person or gardener',
    },
    {
        value: 'nursery',
        label: 'Nursery or garden store',
    },
    {
        value: 'book',
        label: 'Book or printed reference',
    },
    {
        value: 'video',
        label: 'Video',
    },
    {
        value: 'screenshot',
        label: 'Screenshot',
    },
    {
        value: 'other',
        label: 'Something else',
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
function formatDate(value?: string): string {
    if (!value) {
        return '';
    }
    const safe = value.slice(0, 10);
    const date = new Date(`${safe}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
function getFirstUsefulLine(body: string): string {
    return (body
        .split(/\r?\n/)
        .map(line => line.trim())
        .find(Boolean) ??
        'Garden note');
}
function makeTitleFromBody(body: string): string {
    const line = getFirstUsefulLine(body);
    if (line.length <= 68) {
        return line;
    }
    return `${line
        .slice(0, 65)
        .trim()}…`;
}
function normalise(value?: string): string {
    return (value ?? '')
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function getReferenceLabel(reference: PlantReference): string {
    return [
        reference.plantName,
        reference.variety,
    ]
        .filter(Boolean)
        .join(' · ');
}
function getSourceKindLabel(source: SavedKnowledgeSource): string {
    if (source.kind === 'other' &&
        source.customKindLabel?.trim()) {
        return source.customKindLabel.trim();
    }
    return (SOURCE_KIND_OPTIONS.find(option => option.value === source.kind)?.label ??
        'Saved source');
}
function getPlacementSuggestions(note: GardenNote): KnowledgePlacementSuggestion[] {
    const text = normalise(`${note.title ?? ''} ${note.body}`);
    const rawText = `${note.title ?? ''} ${note.body}`;
    const suggestions: KnowledgePlacementSuggestion[] = [];
    const containsUrl = /https?:\/\/\S+/i.test(rawText);
    const soundsLikeExternalAdvice = /\b(facebook|article|website|chatgpt|someone said|grower said|nursery|read that|tip|recommended|recommends)\b/.test(text);
    const soundsLikeReality = /\b(planted|sowed|sown|sprouted|watered|fed|fertilised|fertilized|harvested|moved|sprayed|treated|bought|noticed|died|flowered|hilled)\b/.test(text);
    const soundsLikePlan = /\b(to do|remember to|need to|want to|plan to|next time|buy|plant next|sow next|get kennebec|get )\b/.test(text);
    const soundsLikeReference = /\b(variety|weeks|days to harvest|determinate|indeterminate|usually|good for|best for|planting depth|spacing|harvest window|warm climate|cool climate)\b/.test(text);
    const soundsUncertain = rawText.includes('?') ||
        /\b(maybe|perhaps|possibly|seems|wonder|effect)\b/.test(text);
    if (soundsLikeReality) {
        suggestions.push({
            type: 'journal',
            label: 'Possible garden history',
            reason: 'This note uses words that sound like something may actually have happened. Sprig can create a Journal record only if you confirm it.',
        });
    }
    if (soundsLikePlan) {
        suggestions.push({
            type: 'plan',
            label: 'Possible Plan',
            reason: 'This sounds as though part of the note may be something you intend to do rather than something already done.',
        });
    }
    if (soundsLikeReference) {
        suggestions.push({
            type: 'reference',
            label: 'Possible Plant Reference',
            reason: 'This contains reusable plant or variety information that may belong beside Plant Reference rather than inside one Plant Story.',
        });
    }
    if (containsUrl ||
        soundsLikeExternalAdvice) {
        suggestions.push({
            type: 'source',
            label: 'Possible Tip or Source',
            reason: 'Sprig noticed a link or language that sounds like advice from somewhere outside your own garden.',
        });
    }
    if (soundsUncertain ||
        suggestions.length === 0) {
        suggestions.push({
            type: 'keep-note',
            label: 'Keep this as a Garden Note',
            reason: soundsUncertain
                ? 'This sounds uncertain or exploratory. Sprig should preserve the question rather than turn it into a fact.'
                : 'Nothing here needs to be forced into another home. A Garden Note is allowed to stay exactly where it is.',
        });
    }
    return suggestions;
}
function getRelationshipOptions(gardenData: GardenData): RelationshipOption[] {
    const options: RelationshipOption[] = [];
    (gardenData.plantStories ?? []).forEach(plant => {
        options.push({
            targetType: 'plant-story',
            targetId: plant.id,
            label: plant.displayName ||
                plant.variety ||
                plant.plantName,
            group: 'Plant Stories',
        });
    });
    (gardenData.events ?? []).forEach(event => {
        options.push({
            targetType: 'garden-event',
            targetId: event.id,
            label: event.title,
            group: 'Journal',
        });
    });
    (gardenData.harvests ?? []).forEach(harvest => {
        const plantNames = harvest.plantStoryIds
            .map(plantId => gardenData.plantStories.find(plant => plant.id === plantId))
            .filter(Boolean)
            .map(plant => plant?.displayName ||
            plant?.variety ||
            plant?.plantName ||
            '')
            .filter(Boolean);
        options.push({
            targetType: 'harvest',
            targetId: harvest.id,
            label: plantNames.length > 0
                ? `Harvest · ${plantNames.join(', ')}`
                : `Harvest · ${formatDate(harvest.date)}`,
            group: 'Harvests',
        });
    });
    (gardenData.plans ?? []).forEach(plan => {
        options.push({
            targetType: 'plan',
            targetId: plan.id,
            label: plan.title,
            group: 'Plans',
        });
    });
    (gardenData.growingPlaces ?? []).forEach(place => {
        options.push({
            targetType: 'growing-place',
            targetId: place.id,
            label: place.name,
            group: 'Growing Places',
        });
    });
    (gardenData.growingSetups ?? []).forEach(setup => {
        options.push({
            targetType: 'growing-setup',
            targetId: setup.id,
            label: setup.name,
            group: 'Growing Recipes',
        });
    });
    (gardenData.ingredients ?? []).forEach(ingredient => {
        options.push({
            targetType: 'ingredient',
            targetId: ingredient.id,
            label: ingredient.name,
            group: 'Ingredients',
        });
    });
    (gardenData.products ?? []).forEach(product => {
        options.push({
            targetType: 'product',
            targetId: product.id,
            label: product.name,
            group: 'Products',
        });
    });
    (gardenData.purchases ?? []).forEach(purchase => {
        options.push({
            targetType: 'purchase',
            targetId: purchase.id,
            label: `${purchase.itemName} · ${formatDate(purchase.date)}`,
            group: 'Purchases',
        });
    });
    (gardenData.plantReferences ?? []).forEach(reference => {
        options.push({
            targetType: 'plant-reference',
            targetId: reference.id,
            label: getReferenceLabel(reference),
            group: 'Plant Reference',
        });
    });
    (gardenData.savedKnowledgeSources ?? []).forEach(source => {
        options.push({
            targetType: 'saved-source',
            targetId: source.id,
            label: source.title,
            group: 'Tips & Sources',
        });
    });
    return options.sort((first, second) => {
        const groupDifference = first.group.localeCompare(second.group);
        if (groupDifference !== 0) {
            return groupDifference;
        }
        return first.label.localeCompare(second.label);
    });
}
function getRelationshipLabel(gardenData: GardenData, relationship: KnowledgeRelationship): string {
    if (relationship.label?.trim()) {
        return relationship.label.trim();
    }
    const option = getRelationshipOptions(gardenData).find(candidate => candidate.targetType ===
        relationship.targetType &&
        candidate.targetId ===
            relationship.targetId);
    return (option?.label ??
        'Linked Sprig record');
}
function buildAlmanacThreads(gardenData: GardenData): AlmanacThread[] {
    const threadMap = new Map<string, AlmanacThread>();
    function ensureThread(label: string): AlmanacThread {
        const cleanedLabel = label.trim();
        const key = normalise(cleanedLabel);
        const existing = threadMap.get(key);
        if (existing) {
            return existing;
        }
        const next: AlmanacThread = {
            key,
            label: cleanedLabel,
            plantStoryCount: 0,
            harvestCount: 0,
            noteCount: 0,
            sourceCount: 0,
            referenceCount: 0,
            evidenceCount: 0,
        };
        threadMap.set(key, next);
        return next;
    }
    (gardenData.plantStories ?? []).forEach(plant => {
        const plantThread = ensureThread(plant.plantName);
        plantThread.plantStoryCount += 1;
        if (plant.variety?.trim()) {
            const varietyThread = ensureThread(`${plant.plantName} · ${plant.variety}`);
            varietyThread.plantStoryCount += 1;
        }
    });
    (gardenData.plantReferences ?? []).forEach(reference => {
        const referenceThread = ensureThread(reference.variety
            ? `${reference.plantName} · ${reference.variety}`
            : reference.plantName);
        referenceThread.referenceCount += 1;
    });
    const baseThreads = Array.from(threadMap.values());
    baseThreads.forEach(thread => {
        const threadNeedle = normalise(thread.label);
        const broadPlantNeedle = normalise(thread.label
            .split('·')[0]);
        thread.noteCount =
            (gardenData.gardenNotes ?? [])
                .filter(note => {
                const text = normalise(`${note.title ?? ''} ${note.body}`);
                return (text.includes(threadNeedle) ||
                    (broadPlantNeedle.length > 2 &&
                        text.includes(broadPlantNeedle)));
            })
                .length;
        thread.sourceCount =
            (gardenData.savedKnowledgeSources ?? [])
                .filter(source => {
                const text = normalise(`${source.title} ${source.sourceName ?? ''} ${source.excerpt ?? ''} ${source.notes ?? ''}`);
                return (text.includes(threadNeedle) ||
                    (broadPlantNeedle.length > 2 &&
                        text.includes(broadPlantNeedle)));
            })
                .length;
        const matchingPlantIds = (gardenData.plantStories ?? [])
            .filter(plant => {
            const label = normalise(`${plant.plantName} ${plant.variety ?? ''}`);
            return (label.includes(threadNeedle) ||
                threadNeedle.includes(label) ||
                label.includes(broadPlantNeedle));
        })
            .map(plant => plant.id);
        thread.harvestCount =
            (gardenData.harvests ?? [])
                .filter(harvest => harvest.plantStoryIds.some(plantId => matchingPlantIds.includes(plantId)))
                .length;
        thread.evidenceCount =
            thread.plantStoryCount +
                thread.harvestCount +
                thread.noteCount;
    });
    return baseThreads
        .filter(thread => thread.plantStoryCount > 0 ||
        thread.referenceCount > 0 ||
        thread.noteCount > 0 ||
        thread.sourceCount > 0)
        .sort((first, second) => {
        const evidenceDifference = second.evidenceCount -
            first.evidenceCount;
        if (evidenceDifference !== 0) {
            return evidenceDifference;
        }
        return first.label.localeCompare(second.label);
    });
}
function getAlmanacThreadMaterial(
    gardenData: GardenData,
    thread: AlmanacThread,
) {
    const threadNeedle = normalise(thread.label);
    const broadPlantNeedle = normalise(
        thread.label.split('·')[0],
    );

    function textMatchesThread(value: string): boolean {
        const text = normalise(value);

        return (
            text.includes(threadNeedle) ||
            (broadPlantNeedle.length > 2 &&
                text.includes(broadPlantNeedle))
        );
    }

    const plantStories = (gardenData.plantStories ?? [])
        .filter(plant => {
            const plantLabel = normalise(
                `${plant.plantName} ${plant.variety ?? ''}`,
            );

            if (thread.label.includes('·')) {
                return (
                    plantLabel.includes(threadNeedle) ||
                    threadNeedle.includes(plantLabel)
                );
            }

            return plantLabel.includes(broadPlantNeedle);
        })
        .sort((first, second) =>
            (second.plantedDate ?? '').localeCompare(
                first.plantedDate ?? '',
            ),
        );

    const plantStoryIds = plantStories.map(
        plant => plant.id,
    );

    const harvests = (gardenData.harvests ?? [])
        .filter(harvest =>
            harvest.plantStoryIds.some(plantId =>
                plantStoryIds.includes(plantId),
            ),
        )
        .sort((first, second) =>
            second.date.localeCompare(first.date),
        );

    const notes = (gardenData.gardenNotes ?? [])
        .filter(note =>
            textMatchesThread(
                `${note.title ?? ''} ${note.body}`,
            ),
        )
        .sort((first, second) =>
            (
                second.noteDate ??
                second.createdAt
            ).localeCompare(
                first.noteDate ??
                    first.createdAt,
            ),
        );

    const references = (
        gardenData.plantReferences ?? []
    )
        .filter(reference => {
            const referenceLabel = normalise(
                `${reference.plantName} ${
                    reference.variety ?? ''
                } ${(reference.aliases ?? []).join(' ')}`,
            );

            if (thread.label.includes('·')) {
                return (
                    referenceLabel.includes(threadNeedle) ||
                    threadNeedle.includes(referenceLabel)
                );
            }

            return referenceLabel.includes(
                broadPlantNeedle,
            );
        })
        .sort((first, second) =>
            getReferenceLabel(first).localeCompare(
                getReferenceLabel(second),
            ),
        );

    const sources = (
        gardenData.savedKnowledgeSources ?? []
    )
        .filter(source =>
            textMatchesThread(
                `${source.title} ${
                    source.sourceName ?? ''
                } ${source.excerpt ?? ''} ${
                    source.notes ?? ''
                }`,
            ),
        )
        .sort((first, second) =>
            (
                second.savedDate ??
                second.createdAt
            ).localeCompare(
                first.savedDate ??
                    first.createdAt,
            ),
        );

    return {
        plantStories,
        harvests,
        notes,
        references,
        sources,
    };
}
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function escapeRtf(value: string): string {
    let result = '';
    for (let index = 0; index < value.length; index += 1) {
        const character = value[index];
        const code = value.charCodeAt(index);
        if (character === '\\') {
            result += '\\\\';
            continue;
        }
        if (character === '{') {
            result += '\\{';
            continue;
        }
        if (character === '}') {
            result += '\\}';
            continue;
        }
        if (character === '\r') {
            continue;
        }
        if (character === '\n') {
            result += '\\par\n';
            continue;
        }
        if (code > 127) {
            const signedCode = code > 32767
                ? code - 65536
                : code;
            result += `\\u${signedCode}?`;
            continue;
        }
        result += character;
    }
    return result;
}
function getExportFilePart(value: string): string {
    const cleaned = value
        .trim()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 72);
    return cleaned || 'sprig-export';
}
function getNoteExportDocument(note: GardenNote, gardenData: GardenData): KnowledgeExportDocument {
    const sections: KnowledgeExportSection[] = [
        {
            heading: 'Garden Note',
            body: note.body,
        },
    ];
    if (note.origin === 'imported-text') {
        sections.push({
            heading: 'Original imported note · preserved snapshot',
            body: note.originalBody ?? note.body,
        });
    }
    if ((note.relationships ?? []).length > 0) {
        sections.push({
            heading: 'Related Sprig records',
            lines: (note.relationships ?? []).map(relationship => getRelationshipLabel(gardenData, relationship)),
        });
    }
    if ((note.placements ?? []).length > 0) {
        sections.push({
            heading: 'Placed from this note',
            lines: (note.placements ?? []).map(placement => `${placement.destinationLabel ?? placement.destinationType} · ${formatDate(placement.placedAt)}`),
        });
    }
    const meta: string[] = [];
    if (note.origin === 'imported-text') {
        meta.push('Imported Garden Note');
    }
    if (note.sourceLabel?.trim()) {
        meta.push(`Source: ${note.sourceLabel.trim()}`);
    }
    if (note.sourceUrl?.trim()) {
        meta.push(note.sourceUrl.trim());
    }
    return {
        eyebrow: note.origin === 'imported-text'
            ? 'Imported Garden Note'
            : 'Garden Note',
        title: note.title ||
            makeTitleFromBody(note.body),
        dateLine: `Note dated ${formatDate(note.noteDate ?? note.createdAt)}`,
        meta,
        sections,
        photoUrls: note.photoUrls,
    };
}
function getReferenceExportDocument(reference: PlantReference, gardenData: GardenData): KnowledgeExportDocument {
    const sections: KnowledgeExportSection[] = [];
    if ((reference.aliases ?? []).length > 0) {
        sections.push({
            heading: 'Other names',
            lines: reference.aliases,
        });
    }
    if (reference.notes?.trim()) {
        sections.push({
            heading: 'Reference notes',
            body: reference.notes,
        });
    }
    if ((reference.relationships ?? []).length > 0) {
        sections.push({
            heading: 'Related Sprig records',
            lines: (reference.relationships ?? []).map(relationship => getRelationshipLabel(gardenData, relationship)),
        });
    }
    return {
        eyebrow: 'Plant Reference',
        title: getReferenceLabel(reference),
        dateLine: `Reference dated ${formatDate(reference.referenceDate ?? reference.createdAt)}`,
        sections,
        photoUrls: reference.photoUrls,
    };
}
function getSourceExportDocument(source: SavedKnowledgeSource, gardenData: GardenData): KnowledgeExportDocument {
    const meta: string[] = [
        `Source kind: ${getSourceKindLabel(source)}`,
    ];
    if (source.sourceName?.trim()) {
        meta.push(`From: ${source.sourceName.trim()}`);
    }
    if (source.url?.trim()) {
        meta.push(source.url.trim());
    }
    const sections: KnowledgeExportSection[] = [];
    if (source.excerpt?.trim()) {
        sections.push({
            heading: 'Saved words',
            body: source.excerpt,
        });
    }
    if (source.notes?.trim()) {
        sections.push({
            heading: 'My note',
            body: source.notes,
        });
    }
    if ((source.relationships ?? []).length > 0) {
        sections.push({
            heading: 'Related Sprig records',
            lines: (source.relationships ?? []).map(relationship => getRelationshipLabel(gardenData, relationship)),
        });
    }
    return {
        eyebrow: getSourceKindLabel(source),
        title: source.title,
        dateLine: `Saved / noted ${formatDate(source.savedDate ?? source.createdAt)}`,
        meta,
        sections,
        photoUrls: source.photoUrls,
    };
}
function buildExportHtml(documentTitle: string, documents: KnowledgeExportDocument[]): string {
    const documentBlocks = documents.map((document, documentIndex) => {
        const metaHtml = (document.meta ?? [])
            .filter(Boolean)
            .map(item => `<div class="meta-line">${escapeHtml(item)}</div>`)
            .join('');
        const sectionHtml = document.sections
            .map(section => {
            const heading = section.heading
                ? `<h2>${escapeHtml(section.heading)}</h2>`
                : '';
            const body = section.body
                ? section.body
                    .split(/\r?\n/)
                    .map(line => `<p>${escapeHtml(line || ' ')}</p>`)
                    .join('')
                : '';
            const lines = section.lines?.length
                ? `<ul>${section.lines
                    .map(line => `<li>${escapeHtml(line)}</li>`)
                    .join('')}</ul>`
                : '';
            return `<section>${heading}${body}${lines}</section>`;
        })
            .join('');
        const photos = (document.photoUrls ?? []).length > 0
            ? `<section><h2>Photographs</h2><div class="photo-grid">${(document.photoUrls ?? [])
                .map((photoUrl, photoIndex) => `<figure><img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(`${document.title} photograph ${photoIndex + 1}`)}" /></figure>`)
                .join('')}</div></section>`
            : '';
        return `
                <article class="record ${documentIndex > 0 ? 'record-break' : ''}">
                    <div class="eyebrow">${escapeHtml(document.eyebrow)}</div>
                    <h1>${escapeHtml(document.title)}</h1>
                    ${document.dateLine ? `<div class="date-line">${escapeHtml(document.dateLine)}</div>` : ''}
                    ${metaHtml ? `<div class="meta">${metaHtml}</div>` : ''}
                    ${sectionHtml}
                    ${photos}
                </article>
            `;
    }).join('');
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(documentTitle)}</title>
<style>
    @page { margin: 16mm; }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        color: #2d342d;
        background: #ffffff;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 11.5pt;
        line-height: 1.55;
    }
    .record { max-width: 820px; margin: 0 auto; }
    .record-break { break-before: page; page-break-before: always; }
    .eyebrow {
        margin-bottom: 8px;
        font: 700 9pt/1.2 Arial, sans-serif;
        text-transform: uppercase;
        letter-spacing: .12em;
        color: #687467;
    }
    h1 { margin: 0 0 6px; font-size: 25pt; line-height: 1.15; }
    h2 { margin: 24px 0 8px; font-size: 14pt; }
    p { margin: 0 0 8px; white-space: pre-wrap; }
    ul { margin: 6px 0 12px 20px; padding: 0; }
    li { margin-bottom: 5px; }
    .date-line { margin-bottom: 12px; color: #596358; font-style: italic; }
    .meta {
        margin: 14px 0 20px;
        padding: 10px 12px;
        border-left: 3px solid #9da99b;
        background: #f7f8f4;
        font-family: Arial, sans-serif;
        font-size: 9.5pt;
    }
    .meta-line + .meta-line { margin-top: 4px; }
    .photo-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 10px;
    }
    figure { margin: 0; break-inside: avoid; }
    img {
        display: block;
        width: 100%;
        max-height: 92mm;
        object-fit: contain;
        border: 1px solid #d9ded6;
    }
    .footer {
        max-width: 820px;
        margin: 24px auto 0;
        padding-top: 10px;
        border-top: 1px solid #dfe3dc;
        font: 9pt/1.4 Arial, sans-serif;
        color: #777f76;
    }
</style>
</head>
<body>
${documentBlocks}
<div class="footer">Exported from Sprig · ${escapeHtml(formatDate(getToday()))}</div>
</body>
</html>`;
}
function buildExportRtf(documentTitle: string, documents: KnowledgeExportDocument[]): string {
    const body = documents.map((document, documentIndex) => {
        const parts: string[] = [];
        if (documentIndex > 0) {
            parts.push('\\page\n');
        }
        parts.push(`\\fs18\\b ${escapeRtf(document.eyebrow.toUpperCase())}\\b0\\par\n`);
        parts.push(`\\fs34\\b ${escapeRtf(document.title)}\\b0\\par\n`);
        if (document.dateLine) {
            parts.push(`\\fs20\\i ${escapeRtf(document.dateLine)}\\i0\\par\n`);
        }
        (document.meta ?? []).forEach(item => {
            parts.push(`\\fs20 ${escapeRtf(item)}\\par\n`);
        });
        document.sections.forEach(section => {
            if (section.heading) {
                parts.push(`\\par\\fs24\\b ${escapeRtf(section.heading)}\\b0\\par\n`);
            }
            if (section.body) {
                parts.push(`\\fs22 ${escapeRtf(section.body)}\\par\n`);
            }
            (section.lines ?? []).forEach(line => {
                parts.push(`\\fs22 \\bullet\\tab ${escapeRtf(line)}\\par\n`);
            });
        });
        const photoCount = (document.photoUrls ?? []).length;
        if (photoCount > 0) {
            parts.push(`\\par\\fs20\\i ${photoCount} photograph${photoCount === 1 ? '' : 's'} are kept with this Sprig record. Photographs are included in the PDF export.\\i0\\par\n`);
        }
        return parts.join('');
    }).join('');
    return `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Georgia;}{\\f1 Arial;}}\n` +
        `\\f0\\fs22\n` +
        `\\fs18\\f1 Exported from Sprig · ${escapeRtf(formatDate(getToday()))}\\par\\par\n` +
        `\\f0 ${body}` +
        `\\par\\fs18\\f1 ${escapeRtf(documentTitle)}\\par\n` +
        `}`;
}
function downloadTextFile(fileName: string, contents: string, mimeType: string) {
    const blob = new Blob([contents], {
        type: mimeType,
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}
function printKnowledgeDocuments(documentTitle: string, documents: KnowledgeExportDocument[]) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        window.alert('Sprig could not open the PDF print view. Please allow pop-ups for this page and try again.');
        return;
    }
    printWindow.opener = null;
    printWindow.document.open();
    printWindow.document.write(buildExportHtml(documentTitle, documents));
    printWindow.document.close();
    window.setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 450);
}
function getEvidencePhrase(count: number): string {
    if (count <= 0) {
        return 'Reference only so far';
    }
    if (count === 1) {
        return 'One piece of your garden story';
    }
    if (count <= 3) {
        return 'A small pattern may be forming';
    }
    if (count <= 7) {
        return 'Several pieces of your garden story';
    }
    return 'A well-populated garden thread';
}
export default function GardenKnowledge({ view, gardenData, initialRecord, journeyBackLabel, onJourneyBack, onGardenDataChange, onRecordSelectionChange, onNavigate, onOpenRelationship, }: GardenKnowledgeProps) {
    const [selectedNoteId, setSelectedNoteId,] = useState<string | null>(null);
    const [selectedReferenceId, setSelectedReferenceId,] = useState<string | null>(null);
    const [selectedSourceId, setSelectedSourceId,] = useState<string | null>(null);
    const [noteTitle, setNoteTitle,] = useState('');
    const [noteBody, setNoteBody,] = useState('');
    const [noteDate, setNoteDate,] = useState(getToday());
    const [notePhotoUrls, setNotePhotoUrls,] = useState<string[]>([]);
    const [isImporting, setIsImporting,] = useState(false);
    const [importSourceLabel, setImportSourceLabel,] = useState('');
    const [importSourceUrl, setImportSourceUrl,] = useState('');
    const [referencePlantName, setReferencePlantName,] = useState('');
    const [referenceVariety, setReferenceVariety,] = useState('');
    const [referenceAliases, setReferenceAliases,] = useState('');
    const [referenceNotes, setReferenceNotes,] = useState('');
    const [referenceDate, setReferenceDate,] = useState(getToday());
    const [referencePhotoUrls, setReferencePhotoUrls,] = useState<string[]>([]);
    const [sourceTitle, setSourceTitle,] = useState('');
    const [sourceKind, setSourceKind,] = useState<SavedKnowledgeSourceKind>('website');
    const [sourceCustomKind, setSourceCustomKind,] = useState('');
    const [sourceName, setSourceName,] = useState('');
    const [sourceUrl, setSourceUrl,] = useState('');
    const [sourceExcerpt, setSourceExcerpt,] = useState('');
    const [sourceNotes, setSourceNotes,] = useState('');
    const [sourceSavedDate, setSourceSavedDate,] = useState(getToday());
    const [sourcePhotoUrls, setSourcePhotoUrls,] = useState<string[]>([]);
    const [editingNoteId, setEditingNoteId,] = useState<string | null>(null);
    const [editNoteTitle, setEditNoteTitle,] = useState('');
    const [editNoteBody, setEditNoteBody,] = useState('');
    const [editNoteDate, setEditNoteDate,] = useState('');
    const [editNoteSourceLabel, setEditNoteSourceLabel,] = useState('');
    const [editNoteSourceUrl, setEditNoteSourceUrl,] = useState('');
    const [editNotePhotoUrls, setEditNotePhotoUrls,] = useState<string[]>([]);
    const [editingReferenceId, setEditingReferenceId,] = useState<string | null>(null);
    const [editReferencePlantName, setEditReferencePlantName,] = useState('');
    const [editReferenceVariety, setEditReferenceVariety,] = useState('');
    const [editReferenceAliases, setEditReferenceAliases,] = useState('');
    const [editReferenceNotes, setEditReferenceNotes,] = useState('');
    const [editReferenceDate, setEditReferenceDate,] = useState('');
    const [editReferencePhotoUrls, setEditReferencePhotoUrls,] = useState<string[]>([]);
    const [editingSourceId, setEditingSourceId,] = useState<string | null>(null);
    const [editSourceTitle, setEditSourceTitle,] = useState('');
    const [editSourceKind, setEditSourceKind,] = useState<SavedKnowledgeSourceKind>('website');
    const [editSourceCustomKind, setEditSourceCustomKind,] = useState('');
    const [editSourceName, setEditSourceName,] = useState('');
    const [editSourceUrl, setEditSourceUrl,] = useState('');
    const [editSourceExcerpt, setEditSourceExcerpt,] = useState('');
    const [editSourceNotes, setEditSourceNotes,] = useState('');
    const [editSourceSavedDate, setEditSourceSavedDate,] = useState('');
    const [editSourcePhotoUrls, setEditSourcePhotoUrls,] = useState<string[]>([]);
    const [relationshipSearch, setRelationshipSearch,] = useState('');
    const [selectedRelationshipKey, setSelectedRelationshipKey,] = useState('');
    const [placementJournalDate, setPlacementJournalDate,] = useState(getToday());
    const [placementPlanDate, setPlacementPlanDate,] = useState('');
    const [placementExcerpt, setPlacementExcerpt,] = useState('');
    const [almanacQuery, setAlmanacQuery,] = useState('');
    const [selectedAlmanacThreadKey, setSelectedAlmanacThreadKey,] = useState<string | null>(null);
    const notes = gardenData.gardenNotes ??
        [];
    const references = gardenData.plantReferences ??
        [];
    const sources = gardenData.savedKnowledgeSources ??
        [];
    const relationshipOptions = useMemo(() => getRelationshipOptions(gardenData), [
        gardenData,
    ]);
    const almanacThreads = useMemo(() => buildAlmanacThreads(gardenData), [
        gardenData,
    ]);
    const filteredAlmanacThreads = useMemo(() => {
        const query = normalise(almanacQuery);
        if (!query) {
            return almanacThreads;
        }
        return almanacThreads.filter(thread => normalise(thread.label).includes(query));
    }, [
        almanacQuery,
        almanacThreads,
    ]);
    const selectedNote = notes.find(note => note.id ===
        selectedNoteId) ??
        null;
    const selectedReference = references.find(reference => reference.id ===
        selectedReferenceId) ??
        null;
    const selectedSource = sources.find(source => source.id ===
        selectedSourceId) ??
        null;
    useEffect(() => {
        if (selectedNote) {
            setPlacementExcerpt(selectedNote.body);
            setPlacementJournalDate(selectedNote.noteDate ??
                getToday());
        }
    }, [
        selectedNoteId,
    ]);
    useEffect(() => {
        if (!initialRecord) {
            return;
        }
        if (initialRecord.sourceType ===
            'garden-note') {
            setSelectedNoteId(initialRecord.recordId);
            setSelectedReferenceId(null);
            setSelectedSourceId(null);
            return;
        }
        if (initialRecord.sourceType ===
            'plant-reference') {
            setSelectedReferenceId(initialRecord.recordId);
            setSelectedNoteId(null);
            setSelectedSourceId(null);
            return;
        }
        setSelectedSourceId(initialRecord.recordId);
        setSelectedNoteId(null);
        setSelectedReferenceId(null);
    }, [
        initialRecord,
    ]);
    function selectNote(recordId: string | null) {
        setEditingNoteId(null);
        setEditingReferenceId(null);
        setEditingSourceId(null);
        setSelectedNoteId(recordId);
        setSelectedReferenceId(null);
        setSelectedSourceId(null);
        onRecordSelectionChange(recordId
            ? {
                sourceType: 'garden-note',
                recordId,
            }
            : null);
    }
    function selectReference(recordId: string | null) {
        setEditingNoteId(null);
        setEditingReferenceId(null);
        setEditingSourceId(null);
        setSelectedReferenceId(recordId);
        setSelectedNoteId(null);
        setSelectedSourceId(null);
        onRecordSelectionChange(recordId
            ? {
                sourceType: 'plant-reference',
                recordId,
            }
            : null);
    }
    function selectSource(recordId: string | null) {
        setEditingNoteId(null);
        setEditingReferenceId(null);
        setEditingSourceId(null);
        setSelectedSourceId(recordId);
        setSelectedNoteId(null);
        setSelectedReferenceId(null);
        onRecordSelectionChange(recordId
            ? {
                sourceType: 'saved-source',
                recordId,
            }
            : null);
    }
    function save(nextGardenData: GardenData) {
        onGardenDataChange(nextGardenData);
    }
    function resetNoteComposer() {
        setNoteTitle('');
        setNoteBody('');
        setNoteDate(getToday());
        setIsImporting(false);
        setImportSourceLabel('');
        setImportSourceUrl('');
        setNotePhotoUrls([]);
    }
    function handleSaveNote() {
        const rawBody = noteBody;
        const body = isImporting
            ? rawBody
            : rawBody.trim();
        if (!rawBody.trim()) {
            return;
        }
        const now = getNow();
        const note: GardenNote = {

            id: crypto.randomUUID(),
            title: noteTitle.trim() ||
                undefined,
            body,
            noteDate: noteDate ||
                undefined,
            origin: isImporting
                ? 'imported-text'
                : 'sprig-note',
            originalBody: isImporting
                ? rawBody
                : undefined,
            sourceLabel: isImporting
                ? importSourceLabel.trim() ||
                    undefined
                : undefined,
            sourceUrl: isImporting
                ? importSourceUrl.trim() ||
                    undefined
                : undefined,
            relationships: [],
            placements: [],
            photoUrls: notePhotoUrls.length > 0
                ? notePhotoUrls
                : undefined,
            createdAt: now,
        };
        save({
            ...gardenData,
            gardenNotes: [
                ...notes,
                note,
            ],
        });
        selectNote(note.id);
        resetNoteComposer();
    }
    function startEditNote(note: GardenNote) {
        setEditNoteTitle(note.title ?? '');
        setEditNoteBody(note.body);
        setEditNoteDate(note.noteDate ??
            note.createdAt.slice(0, 10));
        setEditNoteSourceLabel(note.sourceLabel ?? '');
        setEditNoteSourceUrl(note.sourceUrl ?? '');
        setEditNotePhotoUrls(note.photoUrls ?? []);
        setEditingNoteId(note.id);
    }
    function cancelEditNote() {
        setEditingNoteId(null);
    }
    function handleSaveEditedNote(note: GardenNote) {
        if (!editNoteBody.trim()) {
            return;
        }
        const updatedNote: GardenNote = {
            ...note,
            title: editNoteTitle.trim() ||
                undefined,
            body: note.origin === 'imported-text'
                ? editNoteBody
                : editNoteBody.trim(),
            noteDate: editNoteDate ||
                undefined,
            sourceLabel: note.origin === 'imported-text'
                ? editNoteSourceLabel.trim() ||
                    undefined
                : note.sourceLabel,
            sourceUrl: note.origin === 'imported-text'
                ? editNoteSourceUrl.trim() ||
                    undefined
                : note.sourceUrl,
            photoUrls: editNotePhotoUrls.length > 0
                ? editNotePhotoUrls
                : undefined,
            updatedAt: getNow(),
        };
        save({
            ...gardenData,
            gardenNotes: notes.map(item => item.id === note.id
                ? updatedNote
                : item),
        });
        setEditingNoteId(null);
    }
    function handleDeleteNote(note: GardenNote) {
        const confirmed = window.confirm(`Delete "${note.title || makeTitleFromBody(note.body)}"?\n\n` +
            'Imported originals and placement history inside this Garden Note will also be removed. Real Sprig records created from it will not be deleted.');
        if (!confirmed) {
            return;
        }
        save({
            ...gardenData,
            gardenNotes: notes.filter(item => item.id !== note.id),
        });
        selectNote(null);
    }
    function handleAddRelationshipToNote(note: GardenNote) {
        const option = relationshipOptions.find(candidate => `${candidate.targetType}:${candidate.targetId}` ===
            selectedRelationshipKey);
        if (!option) {
            return;
        }
        const existing = note.relationships ??
            [];
        const alreadyLinked = existing.some(relationship => relationship.targetType ===
            option.targetType &&
            relationship.targetId ===
                option.targetId);
        if (alreadyLinked) {
            return;
        }
        const relationship: KnowledgeRelationship = {
            targetType: option.targetType,
            targetId: option.targetId,
            label: option.label,
            createdAt: getNow(),
        };
        const updatedNote: GardenNote = {
            ...note,
            relationships: [
                ...existing,
                relationship,
            ],
            updatedAt: getNow(),
        };
        save({
            ...gardenData,
            gardenNotes: notes.map(item => item.id === note.id
                ? updatedNote
                : item),
        });
        setSelectedRelationshipKey('');
        setRelationshipSearch('');
    }
    function handleRemoveRelationshipFromNote(note: GardenNote, relationship: KnowledgeRelationship) {
        const updatedNote: GardenNote = {
            ...note,
            relationships: (note.relationships ??
                []).filter(item => !(item.targetType ===
                relationship.targetType &&
                item.targetId ===
                    relationship.targetId)),
            updatedAt: getNow(),
        };
        save({
            ...gardenData,
            gardenNotes: notes.map(item => item.id === note.id
                ? updatedNote
                : item),
        });
    }
    function appendPlacement(note: GardenNote, placement: KnowledgePlacement, partialGardenData: Partial<GardenData>) {
        const updatedNote: GardenNote = {
            ...note,
            placements: [
                ...(note.placements ??
                    []),
                placement,
            ],
            updatedAt: getNow(),
        };
        save({
            ...gardenData,
            ...partialGardenData,
            gardenNotes: notes.map(item => item.id === note.id
                ? updatedNote
                : item),
        });
    }
    function handlePlaceAsReference(note: GardenNote) {
        const excerpt = placementExcerpt.trim() ||
            note.body;
        const plantName = window.prompt('Which plant or crop should this Plant Reference belong to?', '');
        if (!plantName?.trim()) {
            return;
        }
        const variety = window.prompt('Variety, if this is variety-specific. Leave blank for general crop knowledge.', '');
        const now = getNow();
        const reference: PlantReference = {
            id: crypto.randomUUID(),
            plantName: plantName.trim(),
            variety: variety?.trim() ||
                undefined,
            notes: excerpt,
            referenceDate: note.noteDate ??
                getToday(),
            relationships: [
                {
                    targetType: 'garden-note',
                    targetId: note.id,
                    label: note.title ||
                        makeTitleFromBody(note.body),
                    createdAt: now,
                },
            ],
            createdAt: now,
        };
        appendPlacement(note, {
            id: crypto.randomUUID(),
            excerpt,
            destinationType: 'plant-reference',
            destinationId: reference.id,
            destinationLabel: getReferenceLabel(reference),
            placedAt: now,
        }, {
            plantReferences: [
                ...references,
                reference,
            ],
        });
    }
    function handlePlaceAsSource(note: GardenNote) {
        const excerpt = placementExcerpt.trim() ||
            note.body;
        const now = getNow();
        const detectedUrl = note.body.match(/https?:\/\/\S+/i)?.[0];
        const source: SavedKnowledgeSource = {
            id: crypto.randomUUID(),
            title: note.title ||
                makeTitleFromBody(note.body),
            kind: note.sourceUrl ||
                detectedUrl
                ? 'website'
                : 'other',
            sourceName: note.sourceLabel,
            url: note.sourceUrl ||
                detectedUrl,
            excerpt,
            notes: 'Placed from a Garden Note. The original note remains untouched.',
            savedDate: note.noteDate,
            relationships: [
                {
                    targetType: 'garden-note',
                    targetId: note.id,
                    label: note.title ||
                        makeTitleFromBody(note.body),
                    createdAt: now,
                },
            ],
            createdAt: now,
        };
        appendPlacement(note, {
            id: crypto.randomUUID(),
            excerpt,
            destinationType: 'saved-source',
            destinationId: source.id,
            destinationLabel: source.title,
            placedAt: now,
        }, {
            savedKnowledgeSources: [
                ...sources,
                source,
            ],
        });
    }
    function handlePlaceAsJournal(note: GardenNote) {
        const excerpt = placementExcerpt.trim() ||
            note.body;
        if (!placementJournalDate) {
            window.alert('Choose the date the garden event actually happened first.');
            return;
        }
        const confirmed = window.confirm('Create a real Garden Journal record from this note?\n\n' +
            'This is an explicit reality action. The Garden Note will stay where it is and remain linked back to the new Journal record.');
        if (!confirmed) {
            return;
        }
        const now = getNow();
        const linkedPlantIds = (note.relationships ??
            [])
            .filter(relationship => relationship.targetType ===
            'plant-story')
            .map(relationship => relationship.targetId);
        const linkedPlaceIds = (note.relationships ??
            [])
            .filter(relationship => relationship.targetType ===
            'growing-place')
            .map(relationship => relationship.targetId);
        const event: GardenEvent = {
            id: crypto.randomUUID(),
            date: placementJournalDate,
            type: 'note',
            activityTypes: [
                'note',
            ],
            title: note.title ||
                makeTitleFromBody(note.body),
            notes: excerpt,
            originatingKnowledgeNoteId: note.id,
            growingPlaceScope: linkedPlaceIds.length === 0
                ? 'none'
                : linkedPlaceIds.length === 1
                    ? 'single'
                    : 'multiple',
            growingPlaceIds: linkedPlaceIds,
            plantScope: linkedPlantIds.length === 0
                ? 'none'
                : linkedPlantIds.length === 1
                    ? 'single'
                    : 'multiple',
            plantStoryIds: linkedPlantIds,
        };
        appendPlacement(note, {
            id: crypto.randomUUID(),
            excerpt,
            destinationType: 'garden-event',
            destinationId: event.id,
            destinationLabel: event.title,
            placedAt: now,
        }, {
            events: [
                ...(gardenData.events ??
                    []),
                event,
            ],
        });
    }
    function handlePlaceAsPlan(note: GardenNote) {
        const excerpt = placementExcerpt.trim() ||
            note.body;
        if (!placementPlanDate) {
            window.alert('Choose the intended date before creating a Plan.');
            return;
        }
        const confirmed = window.confirm('Create a real Garden Plan from this note?\n\n' +
            'The Plan will remain future intention. This Garden Note will stay intact as its source.');
        if (!confirmed) {
            return;
        }
        const now = getNow();
        const linkedPlantIds = (note.relationships ??
            [])
            .filter(relationship => relationship.targetType ===
            'plant-story')
            .map(relationship => relationship.targetId);
        const linkedPlaceIds = (note.relationships ??
            [])
            .filter(relationship => relationship.targetType ===
            'growing-place')
            .map(relationship => relationship.targetId);
        const plan: GardenPlan = {
            id: crypto.randomUUID(),
            title: note.title ||
                makeTitleFromBody(note.body),
            kind: 'garden-task',
            notes: excerpt,
            originatingKnowledgeNoteId: note.id,
            date: placementPlanDate,
            plantStoryIds: linkedPlantIds,
            growingPlaceIds: linkedPlaceIds,
            growingSetupIds: [],
            status: 'planned',
            scheduleHistory: [],
            results: [],
            createdAt: now,
        };
        appendPlacement(note, {
            id: crypto.randomUUID(),
            excerpt,
            destinationType: 'plan',
            destinationId: plan.id,
            destinationLabel: plan.title,
            placedAt: now,
        }, {
            plans: [
                ...(gardenData.plans ??
                    []),
                plan,
            ],
        });
    }
    function handleSaveReference() {
        if (!referencePlantName.trim()) {
            return;
        }
        const reference: PlantReference = {
            id: crypto.randomUUID(),
            plantName: referencePlantName.trim(),
            variety: referenceVariety.trim() ||
                undefined,
            aliases: referenceAliases
                .split(',')
                .map(alias => alias.trim())
                .filter(Boolean),
            notes: referenceNotes.trim() ||
                undefined,
            referenceDate: referenceDate ||
                undefined,
            photoUrls: referencePhotoUrls.length > 0
                ? referencePhotoUrls
                : undefined,
            sourceIds: [],
            relationships: [],
            createdAt: getNow(),
        };
        save({
            ...gardenData,
            plantReferences: [
                ...references,
                reference,
            ],
        });
        selectReference(reference.id);
        setReferencePlantName('');
        setReferenceVariety('');
        setReferenceAliases('');
        setReferenceNotes('');
        setReferenceDate(getToday());
        setReferencePhotoUrls([]);
    }
    function startEditReference(reference: PlantReference) {
        setEditReferencePlantName(reference.plantName);
        setEditReferenceVariety(reference.variety ?? '');
        setEditReferenceAliases((reference.aliases ?? []).join(', '));
        setEditReferenceNotes(reference.notes ?? '');
        setEditReferenceDate(reference.referenceDate ??
            reference.createdAt.slice(0, 10));
        setEditReferencePhotoUrls(reference.photoUrls ?? []);
        setEditingReferenceId(reference.id);
    }
    function cancelEditReference() {
        setEditingReferenceId(null);
    }
    function handleSaveEditedReference(reference: PlantReference) {
        if (!editReferencePlantName.trim()) {
            return;
        }
        const updatedReference: PlantReference = {
            ...reference,
            plantName: editReferencePlantName.trim(),
            variety: editReferenceVariety.trim() ||
                undefined,
            aliases: editReferenceAliases
                .split(',')
                .map(alias => alias.trim())
                .filter(Boolean),
            notes: editReferenceNotes.trim() ||
                undefined,
            referenceDate: editReferenceDate ||
                undefined,
            photoUrls: editReferencePhotoUrls.length > 0
                ? editReferencePhotoUrls
                : undefined,
            updatedAt: getNow(),
        };
        save({
            ...gardenData,
            plantReferences: references.map(item => item.id === reference.id
                ? updatedReference
                : item),
        });
        setEditingReferenceId(null);
    }
    function handleDeleteReference(reference: PlantReference) {
        const confirmed = window.confirm(`Delete Plant Reference "${getReferenceLabel(reference)}"?\n\nPlant Stories are separate records and will not be deleted.`);
        if (!confirmed) {
            return;
        }
        save({
            ...gardenData,
            plantReferences: references.filter(item => item.id !== reference.id),
        });
        selectReference(null);
    }
    function handleSaveSource() {
        if (!sourceTitle.trim()) {
            return;
        }
        const source: SavedKnowledgeSource = {
            id: crypto.randomUUID(),
            title: sourceTitle.trim(),
            kind: sourceKind,
            customKindLabel: sourceKind ===
                'other'
                ? sourceCustomKind.trim() ||
                    undefined
                : undefined,
            sourceName: sourceName.trim() ||
                undefined,
            url: sourceUrl.trim() ||
                undefined,
            excerpt: sourceExcerpt.trim() ||
                undefined,
            notes: sourceNotes.trim() ||
                undefined,
            photoUrls: sourcePhotoUrls.length > 0
                ? sourcePhotoUrls
                : undefined,
            savedDate: sourceSavedDate ||
                undefined,
            relationships: [],
            createdAt: getNow(),
        };
        save({
            ...gardenData,
            savedKnowledgeSources: [
                ...sources,
                source,
            ],
        });
        selectSource(source.id);
        setSourceTitle('');
        setSourceKind('website');
        setSourceCustomKind('');
        setSourceName('');
        setSourceUrl('');
        setSourceExcerpt('');
        setSourceNotes('');
        setSourceSavedDate(getToday());
        setSourcePhotoUrls([]);
    }
    function startEditSource(source: SavedKnowledgeSource) {
        setEditSourceTitle(source.title);
        setEditSourceKind(source.kind);
        setEditSourceCustomKind(source.customKindLabel ?? '');
        setEditSourceName(source.sourceName ?? '');
        setEditSourceUrl(source.url ?? '');
        setEditSourceExcerpt(source.excerpt ?? '');
        setEditSourceNotes(source.notes ?? '');
        setEditSourceSavedDate(source.savedDate ??
            source.createdAt.slice(0, 10));
        setEditSourcePhotoUrls(source.photoUrls ?? []);
        setEditingSourceId(source.id);
    }
    function cancelEditSource() {
        setEditingSourceId(null);
    }
    function handleSaveEditedSource(source: SavedKnowledgeSource) {
        if (!editSourceTitle.trim()) {
            return;
        }
        const updatedSource: SavedKnowledgeSource = {
            ...source,
            title: editSourceTitle.trim(),
            kind: editSourceKind,
            customKindLabel: editSourceKind === 'other'
                ? editSourceCustomKind.trim() ||
                    undefined
                : undefined,
            sourceName: editSourceName.trim() ||
                undefined,
            url: editSourceUrl.trim() ||
                undefined,
            excerpt: editSourceExcerpt.trim() ||
                undefined,
            notes: editSourceNotes.trim() ||
                undefined,
            savedDate: editSourceSavedDate ||
                undefined,
            photoUrls: editSourcePhotoUrls.length > 0
                ? editSourcePhotoUrls
                : undefined,
            updatedAt: getNow(),
        };
        save({
            ...gardenData,
            savedKnowledgeSources: sources.map(item => item.id === source.id
                ? updatedSource
                : item),
        });
        setEditingSourceId(null);
    }
    function handleDeleteSource(source: SavedKnowledgeSource) {
        const confirmed = window.confirm(`Delete "${source.title}" from Saved Tips & Sources?\n\nThis does not delete any Plant Reference or Garden Note that links to it.`);
        if (!confirmed) {
            return;
        }
        save({
            ...gardenData,
            savedKnowledgeSources: sources.filter(item => item.id !== source.id),
        });
        selectSource(null);
    }
    const filteredRelationshipOptions = relationshipOptions.filter(option => {
        const query = normalise(relationshipSearch);
        if (!query) {
            return true;
        }
        return normalise(`${option.group} ${option.label}`).includes(query);
    });
    function renderKnowledgeNavigation() {
        return (<nav className="sprig-knowledge-tabs" aria-label="Garden Knowledge">
                {KNOWLEDGE_TABS.map(tab => (<button key={tab.view} type="button" className={tab.view === view
                    ? 'sprig-knowledge-tab sprig-knowledge-tab--active'
                    : 'sprig-knowledge-tab'} onClick={() => onNavigate(tab.page)}>
                            <span aria-hidden="true">
                                {tab.icon}
                            </span>

                            <span>
                                {tab.label}
                            </span>
                        </button>))}
            </nav>);
    }
    function renderRelationshipEditor(note: GardenNote) {
        return (<section className="sprig-knowledge-subsection">
                <div className="sprig-knowledge-subsection-heading">
                    <div>
                        <p className="section-label">
                            Relationships
                        </p>

                        <h3>
                            Where this thought touches Sprig
                        </h3>
                    </div>
                </div>

                {(note.relationships ??
                []).length > 0 && (<div className="sprig-knowledge-relationship-list">
                        {(note.relationships ??
                    []).map(relationship => (<div key={`${relationship.targetType}:${relationship.targetId}`} className="sprig-knowledge-relationship">
                                    <button type="button" className="sprig-knowledge-relationship-open" onClick={() => onOpenRelationship(relationship.targetType, relationship.targetId)}>
                                        {getRelationshipLabel(gardenData, relationship)}

                                        <span aria-hidden="true">
                                            ›
                                        </span>
                                    </button>

                                    <button type="button" className="sprig-knowledge-icon-button" aria-label="Remove relationship" onClick={() => handleRemoveRelationshipFromNote(note, relationship)}>
                                        ×
                                    </button>
                                </div>))}
                    </div>)}

                <div className="sprig-knowledge-linker">
                    <input type="search" value={relationshipSearch} onChange={event => setRelationshipSearch(event.target.value)} placeholder="Find a Plant Story, place, recipe, plan..." aria-label="Find a Sprig record to link"/>

                    <select value={selectedRelationshipKey} onChange={event => setSelectedRelationshipKey(event.target.value)}>
                        <option value="">
                            Choose a saved Sprig record
                        </option>

                        {filteredRelationshipOptions.map(option => (<option key={`${option.targetType}:${option.targetId}`} value={`${option.targetType}:${option.targetId}`}>
                                    {option.group}
                                    {' · '}
                                    {option.label}
                                </option>))}
                    </select>

                    <button type="button" className="sprig-knowledge-secondary-button" onClick={() => handleAddRelationshipToNote(note)} disabled={!selectedRelationshipKey}>
                        Link this
                    </button>
                </div>
            </section>);
    }
    function renderPlacementHelper(note: GardenNote) {
        const suggestions = getPlacementSuggestions({
            ...note,
            body: placementExcerpt ||
                note.body,
        });
        return (<section className="sprig-knowledge-place-panel">
                <p className="section-label">
                    Help me place this
                </p>

                <h3>
                    Sprig noticed a few possible homes
                </h3>

                <p>
                    These are suggestions, not decisions.
                    The original Garden Note stays intact
                    and nothing becomes garden history
                    until you explicitly create it.
                </p>

                <label className="sprig-knowledge-field sprig-knowledge-placement-excerpt">
                    <span>
                        Part of the note to place
                    </span>

                    <textarea rows={7} value={placementExcerpt} onChange={event => setPlacementExcerpt(event.target.value)}/>

                    <small>
                        For a giant imported note, trim this
                        working excerpt down to one idea or
                        event. The preserved original above
                        is never changed.
                    </small>
                </label>

                <div className="sprig-knowledge-suggestion-list">
                    {suggestions.map(suggestion => (<article key={suggestion.type} className="sprig-knowledge-suggestion">
                                <strong>
                                    {suggestion.label}
                                </strong>

                                <p>
                                    {suggestion.reason}
                                </p>

                                {suggestion.type === 'reference' && (<button type="button" className="sprig-knowledge-secondary-button" onClick={() => handlePlaceAsReference(note)}>
                                        Place into Plant Reference
                                    </button>)}

                                {suggestion.type === 'source' && (<button type="button" className="sprig-knowledge-secondary-button" onClick={() => handlePlaceAsSource(note)}>
                                        Save as Tip / Source
                                    </button>)}

                                {suggestion.type === 'journal' && (<div className="sprig-knowledge-placement-action">
                                        <label>
                                            <span>
                                                Date it actually happened
                                            </span>

                                            <input type="date" value={placementJournalDate} onChange={event => setPlacementJournalDate(event.target.value)}/>
                                        </label>

                                        <button type="button" className="sprig-knowledge-secondary-button" onClick={() => handlePlaceAsJournal(note)}>
                                            Record in Journal
                                        </button>
                                    </div>)}

                                {suggestion.type === 'plan' && (<div className="sprig-knowledge-placement-action">
                                        <label>
                                            <span>
                                                When do you intend to do it?
                                            </span>

                                            <input type="date" value={placementPlanDate} onChange={event => setPlacementPlanDate(event.target.value)}/>
                                        </label>

                                        <button type="button" className="sprig-knowledge-secondary-button" onClick={() => handlePlaceAsPlan(note)}>
                                            Make a Plan
                                        </button>
                                    </div>)}
                            </article>))}
                </div>

                {(note.placements ??
                []).length > 0 && (<div className="sprig-knowledge-placement-history">
                        <h4>
                            Already placed from this note
                        </h4>

                        {(note.placements ??
                    []).map(placement => (<div key={placement.id}>
                                    <strong>
                                        {placement.destinationLabel ??
                        placement.destinationType}
                                    </strong>

                                    <span>
                                        {formatDate(placement.placedAt)}
                                    </span>
                                </div>))}
                    </div>)}
            </section>);
    }
    function renderNotesView() {
        if (selectedNote) {
            const noteExport = getNoteExportDocument(selectedNote, gardenData);
            const isEditing = editingNoteId ===
                selectedNote.id;
            return (<div className="sprig-knowledge-detail">
                    <div className="sprig-knowledge-detail-toolbar">
                        <button type="button" className="sprig-knowledge-text-button" onClick={() => selectNote(null)}>
                            ← Garden Notes
                        </button>

                        <div className="sprig-knowledge-detail-actions">
                            <button type="button" className="sprig-knowledge-text-button" onClick={() => printKnowledgeDocuments(noteExport.title, [noteExport])}>
                                PDF
                            </button>

                            <button type="button" className="sprig-knowledge-text-button" onClick={() => downloadTextFile(`${getExportFilePart(noteExport.title)}.rtf`, buildExportRtf(noteExport.title, [noteExport]), 'application/rtf;charset=utf-8')}>
                                RTF
                            </button>

                            {!isEditing && (<button type="button" className="sprig-knowledge-text-button" onClick={() => startEditNote(selectedNote)}>
                                    Edit
                                </button>)}

                            <button type="button" className="sprig-knowledge-text-button sprig-knowledge-text-button--danger" onClick={() => handleDeleteNote(selectedNote)}>
                                Delete
                            </button>
                        </div>
                    </div>

                    {isEditing ? (<section className="sprig-knowledge-paper sprig-knowledge-capture">
                            <p className="section-label">
                                Edit Garden Note
                            </p>

                            <h2>
                                Change what Sprig keeps as the working note
                            </h2>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Title
                                    <small>
                                        optional
                                    </small>
                                </span>

                                <input type="text" value={editNoteTitle} onChange={event => setEditNoteTitle(event.target.value)}/>
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    {selectedNote.origin === 'imported-text'
                        ? 'Working copy'
                        : 'Garden Note'}
                                </span>

                                <textarea rows={12} value={editNoteBody} onChange={event => setEditNoteBody(event.target.value)}/>

                                {selectedNote.origin === 'imported-text' && (<small>
                                        You can tidy this working copy. The exact imported snapshot below remains unchanged.
                                    </small>)}
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Note date
                                </span>

                                <input type="date" value={editNoteDate} onChange={event => setEditNoteDate(event.target.value)}/>
                            </label>

                            {selectedNote.origin === 'imported-text' && (<div className="sprig-knowledge-import-meta">
                                    <label className="sprig-knowledge-field">
                                        <span>
                                            Where did this note come from?
                                            <small>
                                                optional
                                            </small>
                                        </span>

                                        <input type="text" value={editNoteSourceLabel} onChange={event => setEditNoteSourceLabel(event.target.value)}/>
                                    </label>

                                    <label className="sprig-knowledge-field">
                                        <span>
                                            Source link
                                            <small>
                                                optional
                                            </small>
                                        </span>

                                        <input type="url" value={editNoteSourceUrl} onChange={event => setEditNoteSourceUrl(event.target.value)} placeholder="https://..."/>
                                    </label>

                                    <details className="sprig-knowledge-original">
                                        <summary>
                                            Original imported note · read only
                                        </summary>

                                        <p>
                                            This is the preserved provenance snapshot. Editing the working copy never changes it.
                                        </p>

                                        <pre>
                                            {selectedNote.originalBody ?? selectedNote.body}
                                        </pre>
                                    </details>
                                </div>)}

                            <SprigPhotoPicker photoUrls={editNotePhotoUrls} onChange={setEditNotePhotoUrls} title="Photographs" helperText="Add or remove the photographs that belong to this Garden Note." addButtonText="Add photographs" photoAltPrefix="Garden Note photograph" multiple={true} maxPhotos={12}/>

                            <div className="sprig-knowledge-detail-actions">
                                <button type="button" className="sprig-knowledge-primary-button" onClick={() => handleSaveEditedNote(selectedNote)} disabled={!editNoteBody.trim()}>
                                    Save changes
                                </button>

                                <button type="button" className="sprig-knowledge-secondary-button" onClick={cancelEditNote}>
                                    Cancel
                                </button>
                            </div>
                        </section>) : (<>
                            <article className="sprig-knowledge-paper sprig-knowledge-note-detail">
                                <p className="section-label">
                                    {selectedNote.origin === 'imported-text'
                        ? 'Imported Garden Note'
                        : 'Garden Note'}
                                </p>

                                <h2>
                                    {selectedNote.title ||
                        makeTitleFromBody(selectedNote.body)}
                                </h2>

                                <p className="sprig-knowledge-date">
                                    {formatDate(selectedNote.noteDate ??
                        selectedNote.createdAt)}
                                </p>

                                <div className="sprig-knowledge-prose">
                                    {selectedNote.body
                        .split(/\r?\n/)
                        .map((line, index) => (<p key={`${selectedNote.id}-line-${index}`}>
                                                    {line || '\u00A0'}
                                                </p>))}
                                </div>

                                {selectedNote.origin === 'imported-text' && (<details className="sprig-knowledge-original">
                                        <summary>
                                            Original imported note
                                        </summary>

                                        <p>
                                            Sprig keeps this exact snapshot even if you later tidy the working copy.
                                        </p>

                                        {(selectedNote.sourceLabel ||
                            selectedNote.sourceUrl) && (<div className="sprig-knowledge-source-meta">
                                                {selectedNote.sourceLabel && (<span>
                                                        {selectedNote.sourceLabel}
                                                    </span>)}

                                                {selectedNote.sourceUrl && (<a href={selectedNote.sourceUrl} target="_blank" rel="noreferrer">
                                                        Open source
                                                    </a>)}
                                            </div>)}

                                        <pre>
                                            {selectedNote.originalBody ?? selectedNote.body}
                                        </pre>
                                    </details>)}
                            </article>

                            {(selectedNote.photoUrls ?? []).length > 0 && (<SprigPhotoGallery photoUrls={selectedNote.photoUrls ?? []} title="Note photographs" photoAltPrefix="Garden Note photograph"/>)}
                        </>)}

                    {renderRelationshipEditor(selectedNote)}

                    {renderPlacementHelper(selectedNote)}
                </div>);
        }
        return (<div className="sprig-knowledge-two-column">
                <section className="sprig-knowledge-paper sprig-knowledge-capture">
                    <p className="section-label">
                        Capture first
                    </p>

                    <h2>
                        Put the thought somewhere safe
                    </h2>

                    <p>
                        It does not need a perfect category,
                        relationship or structure yet. Sprig
                        can help you place useful pieces
                        afterwards.
                    </p>

                    <div className="sprig-knowledge-import-switch">
                        <button type="button" className={!isImporting
                ? 'sprig-knowledge-choice sprig-knowledge-choice--active'
                : 'sprig-knowledge-choice'} onClick={() => setIsImporting(false)}>
                            New note
                        </button>

                        <button type="button" className={isImporting
                ? 'sprig-knowledge-choice sprig-knowledge-choice--active'
                : 'sprig-knowledge-choice'} onClick={() => setIsImporting(true)}>
                            Import an old note
                        </button>
                    </div>

                    <label className="sprig-knowledge-field">
                        <span>
                            Title
                            <small>
                                optional
                            </small>
                        </span>

                        <input type="text" value={noteTitle} onChange={event => setNoteTitle(event.target.value)} placeholder="A useful little heading, if you want one"/>
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            {isImporting
                ? 'Paste the original note'
                : 'What do you want Sprig to remember?'}
                        </span>

                        <textarea rows={isImporting
                ? 14
                : 9} value={noteBody} onChange={event => setNoteBody(event.target.value)} placeholder={isImporting
                ? 'Paste it exactly as it exists. Messy dates, shorthand, URLs and all.'
                : 'A thought, question, observation, reminder, theory, garden clue...'}/>
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Note date
                        </span>

                        <input type="date" value={noteDate} onChange={event => setNoteDate(event.target.value)}/>
                    </label>

                                          {isImporting && (<div className="sprig-knowledge-import-meta">
                            <label className="sprig-knowledge-field">
                                <span>
                                    Where did this note come from?
                                    <small>
                                        optional
                                    </small>
                                </span>

                                <input type="text" value={importSourceLabel} onChange={event => setImportSourceLabel(event.target.value)} placeholder="Google Keep, old phone notes, garden notebook..."/>
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Source link
                                    <small>
                                        optional
                                    </small>
                                </span>

                                <input type="url" value={importSourceUrl} onChange={event => setImportSourceUrl(event.target.value)} placeholder="https://..."/>
                            </label>
                        </div>)}

                    <SprigPhotoPicker photoUrls={notePhotoUrls} onChange={setNotePhotoUrls} title="Photographs" helperText="Add any photographs that belong to this thought. You can keep more than one." addButtonText="Add photographs" photoAltPrefix="Garden Note photograph" multiple={true} maxPhotos={12}/>

                    <button type="button" className="sprig-knowledge-primary-button" onClick={handleSaveNote} disabled={!noteBody.trim()}>
                        {isImporting
                ? 'Preserve this note'
                : 'Save Garden Note'}
                    </button>
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
                            {notes.length}
                        </span>
                    </div>

                    {notes.length > 0 && (<div className="sprig-knowledge-detail-actions">
                            <button type="button" className="sprig-knowledge-secondary-button" onClick={() => printKnowledgeDocuments('Garden Notes', [...notes]
                    .sort((first, second) => (second.noteDate ?? second.createdAt).localeCompare(first.noteDate ?? first.createdAt))
                    .map(note => getNoteExportDocument(note, gardenData)))}>
                                Export Garden Notes PDF
                            </button>

                            <button type="button" className="sprig-knowledge-secondary-button" onClick={() => {
                    const exportDocuments = [...notes]
                        .sort((first, second) => (second.noteDate ?? second.createdAt).localeCompare(first.noteDate ?? first.createdAt))
                        .map(note => getNoteExportDocument(note, gardenData));
                    downloadTextFile('Sprig-Garden-Notes.rtf', buildExportRtf('Garden Notes', exportDocuments), 'application/rtf;charset=utf-8');
                }}>
                                Export Garden Notes RTF
                            </button>
                        </div>)}

                    {notes.length === 0 ? (<div className="sprig-knowledge-empty">
                            <strong>
                                Nothing loose yet.
                            </strong>

                            <p>
                                Garden Notes are allowed to
                                be unfinished. That is their
                                job.
                            </p>
                        </div>) : (<div className="sprig-knowledge-card-list">
                            {[...notes]
                    .sort((first, second) => (second.noteDate ??
                    second.createdAt).localeCompare(first.noteDate ??
                    first.createdAt))
                    .map(note => (<button key={note.id} type="button" className="sprig-knowledge-card" onClick={() => selectNote(note.id)}>
                                            <div>
                                                <span className="sprig-knowledge-card-kicker">
                                                    {note.origin === 'imported-text'
                        ? 'Imported'
                        : 'Note'}
                                                </span>

                                                <strong>
                                                    {note.title ||
                        makeTitleFromBody(note.body)}
                                                </strong>

                                                <p>
                                                    {note.body}
                                                </p>
                                            </div>

                                            <div className="sprig-knowledge-card-meta">
                                                <span>
                                                    {formatDate(note.noteDate ??
                        note.createdAt)}
                                                </span>

                                                {(note.relationships ?? []).length > 0 && (<span>
                                                        {(note.relationships ?? []).length}{' '}
                                                        linked
                                                    </span>)}
                                            </div>
                                        </button>))}
                        </div>)}
                </section>
            </div>);
    }
    function renderReferenceView() {
        if (selectedReference) {
            const referenceExport = getReferenceExportDocument(selectedReference, gardenData);
            const isEditing = editingReferenceId ===
                selectedReference.id;
            return (<div className="sprig-knowledge-detail">
                    <div className="sprig-knowledge-detail-toolbar">
                        <button type="button" className="sprig-knowledge-text-button" onClick={() => selectReference(null)}>
                            ← Plant Reference
                        </button>

                        <div className="sprig-knowledge-detail-actions">
                            <button type="button" className="sprig-knowledge-text-button" onClick={() => printKnowledgeDocuments(referenceExport.title, [referenceExport])}>
                                PDF
                            </button>

                            <button type="button" className="sprig-knowledge-text-button" onClick={() => downloadTextFile(`${getExportFilePart(referenceExport.title)}.rtf`, buildExportRtf(referenceExport.title, [referenceExport]), 'application/rtf;charset=utf-8')}>
                                RTF
                            </button>

                            {!isEditing && (<button type="button" className="sprig-knowledge-text-button" onClick={() => startEditReference(selectedReference)}>
                                    Edit
                                </button>)}

                            <button type="button" className="sprig-knowledge-text-button sprig-knowledge-text-button--danger" onClick={() => handleDeleteReference(selectedReference)}>
                                Delete
                            </button>
                        </div>
                    </div>

                    {isEditing ? (<section className="sprig-knowledge-paper sprig-knowledge-capture">
                            <p className="section-label">
                                Edit Plant Reference
                            </p>

                            <h2>
                                Update this reusable plant knowledge
                            </h2>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Plant or crop
                                </span>

                                <input type="text" value={editReferencePlantName} onChange={event => setEditReferencePlantName(event.target.value)}/>
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Variety
                                    <small>
                                        optional
                                    </small>
                                </span>

                                <input type="text" value={editReferenceVariety} onChange={event => setEditReferenceVariety(event.target.value)}/>
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Other names
                                    <small>
                                        comma separated
                                    </small>
                                </span>

                                <input type="text" value={editReferenceAliases} onChange={event => setEditReferenceAliases(event.target.value)}/>
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Reference date
                                </span>

                                <input type="date" value={editReferenceDate} onChange={event => setEditReferenceDate(event.target.value)}/>

                                <small>
                                    Keep the meaningful date of when this knowledge was saved, learned or recorded.
                                </small>
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Reference notes
                                </span>

                                <textarea rows={12} value={editReferenceNotes} onChange={event => setEditReferenceNotes(event.target.value)}/>
                            </label>

                            <SprigPhotoPicker photoUrls={editReferencePhotoUrls} onChange={setEditReferencePhotoUrls} title="Photographs" helperText="Add or remove seed packets, labels, diagrams and other photographs that belong to this reference." addButtonText="Add photographs" photoAltPrefix="Plant Reference photograph" multiple={true} maxPhotos={12}/>

                            <div className="sprig-knowledge-detail-actions">
                                <button type="button" className="sprig-knowledge-primary-button" onClick={() => handleSaveEditedReference(selectedReference)} disabled={!editReferencePlantName.trim()}>
                                    Save changes
                                </button>

                                <button type="button" className="sprig-knowledge-secondary-button" onClick={cancelEditReference}>
                                    Cancel
                                </button>
                            </div>
                        </section>) : (<>
                            <article className="sprig-knowledge-paper">
                                <p className="section-label">
                                    Plant Reference
                                </p>

                                <h2>
                                    {selectedReference.plantName}
                                </h2>

                                {selectedReference.variety && (<p className="sprig-knowledge-reference-variety">
                                        {selectedReference.variety}
                                    </p>)}

                                <p className="sprig-knowledge-date">
                                    Reference dated{' '}
                                    {formatDate(selectedReference.referenceDate ??
                        selectedReference.createdAt)}
                                </p>

                                {(selectedReference.aliases ?? []).length > 0 && (<p className="sprig-knowledge-muted">
                                        Also known here as:{' '}
                                        {(selectedReference.aliases ?? []).join(', ')}
                                    </p>)}

                                {selectedReference.notes ? (<div className="sprig-knowledge-prose">
                                        {selectedReference.notes
                            .split(/\r?\n/)
                            .map((line, index) => (<p key={`${selectedReference.id}-reference-${index}`}>
                                                        {line || '\u00A0'}
                                                    </p>))}
                                    </div>) : (<p className="sprig-knowledge-muted">
                                        No reference notes have been added yet.
                                    </p>)}

                                {(selectedReference.relationships ?? []).length > 0 && (<div className="sprig-knowledge-related-block">
                                        <h3>
                                            Related Sprig records
                                        </h3>

                                        {(selectedReference.relationships ?? []).map(relationship => (<button key={`${relationship.targetType}:${relationship.targetId}`} type="button" className="sprig-knowledge-related-link" onClick={() => onOpenRelationship(relationship.targetType, relationship.targetId)}>
                                                    {getRelationshipLabel(gardenData, relationship)}
                                                    <span>
                                                        ›
                                                    </span>
                                                </button>))}
                                    </div>)}
                            </article>

                            {(selectedReference.photoUrls ?? []).length > 0 && (<SprigPhotoGallery photoUrls={selectedReference.photoUrls ?? []} title="Reference photographs" photoAltPrefix="Plant Reference photograph"/>)}
                        </>)}
                </div>);
        }
        return (<div className="sprig-knowledge-two-column">
                <section className="sprig-knowledge-paper sprig-knowledge-capture">
                    <p className="section-label">
                        Plant Reference
                    </p>

                    <h2>
                        Knowledge about the plant itself
                    </h2>

                    <p>
                        Keep reusable crop and variety
                        knowledge here. Individual Plant
                        Stories still own what actually
                        happened to your plants.
                    </p>

                    <label className="sprig-knowledge-field">
                        <span>
                            Plant or crop
                        </span>

                        <input type="text" value={referencePlantName} onChange={event => setReferencePlantName(event.target.value)} placeholder="Potato"/>
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Variety
                            <small>
                                optional
                            </small>
                        </span>

                        <input type="text" value={referenceVariety} onChange={event => setReferenceVariety(event.target.value)} placeholder="Royal Blue"/>
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Other names
                            <small>
                                comma separated
                            </small>
                        </span>

                        <input type="text" value={referenceAliases} onChange={event => setReferenceAliases(event.target.value)} placeholder="Local name, seed packet name..."/>
                    </label>

                    <label className="sprig-knowledge-field">
    <span>
        Reference date
    </span>

    <input type="date" value={referenceDate} onChange={event => setReferenceDate(event.target.value)}/>

    <small>
        When did you save, learn or record
        this reference? Change the date when
        bringing older knowledge into Sprig.
    </small>
        </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Reference notes
                        </span>

                        <textarea rows={10} value={referenceNotes} onChange={event => setReferenceNotes(event.target.value)} placeholder="Timing, growth habit, spacing, harvest behaviour, useful reference knowledge..."/>
                    </label>

                    <SprigPhotoPicker photoUrls={referencePhotoUrls} onChange={setReferencePhotoUrls} title="Photographs" helperText="Add seed packets, labels, diagrams or other photographs that help describe this plant or variety." addButtonText="Add photographs" photoAltPrefix="Plant Reference photograph" multiple={true} maxPhotos={12}/>

                    <button type="button" className="sprig-knowledge-primary-button" onClick={handleSaveReference} disabled={!referencePlantName.trim()}>
                        Add Plant Reference
                    </button>
                </section>

                <section className="sprig-knowledge-list-section">
                    <div className="sprig-knowledge-section-heading">
                        <div>
                            <p className="section-label">
                                Reference shelf
                            </p>

                            <h2>
                                Plants & varieties
                            </h2>
                        </div>

                        <span className="sprig-knowledge-count">
                            {references.length}
                        </span>
                    </div>

                    {references.length > 0 && (<div className="sprig-knowledge-detail-actions">
                            <button type="button" className="sprig-knowledge-secondary-button" onClick={() => printKnowledgeDocuments('Plant Reference', [...references]
                    .sort((first, second) => getReferenceLabel(first).localeCompare(getReferenceLabel(second)))
                    .map(reference => getReferenceExportDocument(reference, gardenData)))}>
                                Export Plant Reference PDF
                            </button>

                            <button type="button" className="sprig-knowledge-secondary-button" onClick={() => {
                    const exportDocuments = [...references]
                        .sort((first, second) => getReferenceLabel(first).localeCompare(getReferenceLabel(second)))
                        .map(reference => getReferenceExportDocument(reference, gardenData));
                    downloadTextFile('Sprig-Plant-Reference.rtf', buildExportRtf('Plant Reference', exportDocuments), 'application/rtf;charset=utf-8');
                }}>
                                Export Plant Reference RTF
                            </button>
                        </div>)}

                    {references.length === 0 ? (<div className="sprig-knowledge-empty">
                            <strong>
                                Your reference shelf is
                                waiting.
                            </strong>

                            <p>
                                Add knowledge you want to
                                reuse across many Plant
                                Stories.
                            </p>
                        </div>) : (<div className="sprig-knowledge-card-list">
                            {[...references]
                    .sort((first, second) => getReferenceLabel(first).localeCompare(getReferenceLabel(second)))
                    .map(reference => (<button key={reference.id} type="button" className="sprig-knowledge-card" onClick={() => selectReference(reference.id)}>
                                            <div>
                                                <span className="sprig-knowledge-card-kicker">
                                                    {reference.plantName}
                                                </span>

                                                <strong>
                                                    {reference.variety ||
                        reference.plantName}
                                                </strong>

                                                {reference.notes && (<p>
                                                        {reference.notes}
                                                    </p>)}
                                            </div>
                                        </button>))}
                        </div>)}
                </section>
            </div>);
    }
    function renderSourcesView() {
        if (selectedSource) {
            const sourceExport = getSourceExportDocument(selectedSource, gardenData);
            const isEditing = editingSourceId ===
                selectedSource.id;
            return (<div className="sprig-knowledge-detail">
                    <div className="sprig-knowledge-detail-toolbar">
                        <button type="button" className="sprig-knowledge-text-button" onClick={() => selectSource(null)}>
                            ← Tips & Sources
                        </button>

                        <div className="sprig-knowledge-detail-actions">
                            <button type="button" className="sprig-knowledge-text-button" onClick={() => printKnowledgeDocuments(sourceExport.title, [sourceExport])}>
                                PDF
                            </button>

                            <button type="button" className="sprig-knowledge-text-button" onClick={() => downloadTextFile(`${getExportFilePart(sourceExport.title)}.rtf`, buildExportRtf(sourceExport.title, [sourceExport]), 'application/rtf;charset=utf-8')}>
                                RTF
                            </button>

                            {!isEditing && (<button type="button" className="sprig-knowledge-text-button" onClick={() => startEditSource(selectedSource)}>
                                    Edit
                                </button>)}

                            <button type="button" className="sprig-knowledge-text-button sprig-knowledge-text-button--danger" onClick={() => handleDeleteSource(selectedSource)}>
                                Delete
                            </button>
                        </div>
                    </div>

                    {isEditing ? (<section className="sprig-knowledge-paper sprig-knowledge-capture">
                            <p className="section-label">
                                Edit Tip / Source
                            </p>

                            <h2>
                                Update the advice and keep its provenance attached
                            </h2>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Title
                                </span>

                                <input type="text" value={editSourceTitle} onChange={event => setEditSourceTitle(event.target.value)}/>
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Kind of source
                                </span>

                                <select value={editSourceKind} onChange={event => setEditSourceKind(event.target.value as SavedKnowledgeSourceKind)}>
                                    {SOURCE_KIND_OPTIONS.map(option => (<option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>))}
                                </select>
                            </label>

                            {editSourceKind === 'other' && (<label className="sprig-knowledge-field">
                                    <span>
                                        What kind?
                                    </span>

                                    <input type="text" value={editSourceCustomKind} onChange={event => setEditSourceCustomKind(event.target.value)}/>
                                </label>)}

                            <label className="sprig-knowledge-field">
                                <span>
                                    Who or where?
                                    <small>
                                        optional
                                    </small>
                                </span>

                                <input type="text" value={editSourceName} onChange={event => setEditSourceName(event.target.value)}/>
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Link
                                    <small>
                                        optional
                                    </small>
                                </span>

                                <input type="url" value={editSourceUrl} onChange={event => setEditSourceUrl(event.target.value)} placeholder="https://..."/>
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    Saved / noted date
                                </span>

                                <input type="date" value={editSourceSavedDate} onChange={event => setEditSourceSavedDate(event.target.value)}/>
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    What did you want to save?
                                </span>

                                <textarea rows={8} value={editSourceExcerpt} onChange={event => setEditSourceExcerpt(event.target.value)}/>
                            </label>

                            <label className="sprig-knowledge-field">
                                <span>
                                    My note about it
                                    <small>
                                        optional
                                    </small>
                                </span>

                                <textarea rows={6} value={editSourceNotes} onChange={event => setEditSourceNotes(event.target.value)}/>
                            </label>

                            <SprigPhotoPicker photoUrls={editSourcePhotoUrls} onChange={setEditSourcePhotoUrls} title="Photographs" helperText="Add or remove screenshots, pages, labels and other visual source material." addButtonText="Add photographs" photoAltPrefix="Saved source photograph" multiple={true} maxPhotos={12}/>

                            <div className="sprig-knowledge-detail-actions">
                                <button type="button" className="sprig-knowledge-primary-button" onClick={() => handleSaveEditedSource(selectedSource)} disabled={!editSourceTitle.trim()}>
                                    Save changes
                                </button>

                                <button type="button" className="sprig-knowledge-secondary-button" onClick={cancelEditSource}>
                                    Cancel
                                </button>
                            </div>
                        </section>) : (<>
                            <article className="sprig-knowledge-paper">
                                <p className="section-label">
                                    {getSourceKindLabel(selectedSource)}
                                </p>

                                <h2>
                                    {selectedSource.title}
                                </h2>

                                {selectedSource.sourceName && (<p className="sprig-knowledge-source-name">
                                        From{' '}
                                        {selectedSource.sourceName}
                                    </p>)}

                                <p className="sprig-knowledge-date">
                                    Saved{' '}
                                    {formatDate(selectedSource.savedDate ??
                        selectedSource.createdAt)}
                                </p>

                                {selectedSource.url && (<p>
                                        <a href={selectedSource.url} target="_blank" rel="noreferrer" className="sprig-knowledge-source-link">
                                            Open original source ↗
                                        </a>
                                    </p>)}

                                {selectedSource.excerpt && (<div className="sprig-knowledge-quote">
                                        <p className="section-label">
                                            Saved words
                                        </p>

                                        <div className="sprig-knowledge-prose">
                                            {selectedSource.excerpt
                            .split(/\r?\n/)
                            .map((line, index) => (<p key={`${selectedSource.id}-excerpt-${index}`}>
                                                            {line || '\u00A0'}
                                                        </p>))}
                                        </div>
                                    </div>)}

                                {selectedSource.notes && (<div className="sprig-knowledge-own-note">
                                        <p className="section-label">
                                            My note
                                        </p>

                                        <div className="sprig-knowledge-prose">
                                            {selectedSource.notes
                            .split(/\r?\n/)
                            .map((line, index) => (<p key={`${selectedSource.id}-note-${index}`}>
                                                            {line || '\u00A0'}
                                                        </p>))}
                                        </div>
                                    </div>)}

                                {(selectedSource.relationships ?? []).length > 0 && (<div className="sprig-knowledge-related-block">
                                        <h3>
                                            Related Sprig records
                                        </h3>

                                        {(selectedSource.relationships ?? []).map(relationship => (<button key={`${relationship.targetType}:${relationship.targetId}`} type="button" className="sprig-knowledge-related-link" onClick={() => onOpenRelationship(relationship.targetType, relationship.targetId)}>
                                                    {getRelationshipLabel(gardenData, relationship)}

                                                    <span>
                                                        ›
                                                    </span>
                                                </button>))}
                                    </div>)}
                            </article>

                            {(selectedSource.photoUrls ?? []).length > 0 && (<SprigPhotoGallery photoUrls={selectedSource.photoUrls ?? []} title="Source photographs" photoAltPrefix="Saved source photograph"/>)}
                        </>)}
                </div>);
        }
        return (<div className="sprig-knowledge-two-column">
                <section className="sprig-knowledge-paper sprig-knowledge-capture">
                    <p className="section-label">
                        Saved Tips & Sources
                    </p>

                    <h2>
                        Keep the advice with where it came
                        from
                    </h2>

                    <p>
                        Advice is not automatically truth.
                        Sprig keeps the source attached so
                        you can remember who said it, where
                        you found it and what you thought
                        about it.
                    </p>

                    <label className="sprig-knowledge-field">
                        <span>
                            Title
                        </span>

                        <input type="text" value={sourceTitle} onChange={event => setSourceTitle(event.target.value)} placeholder="Growing ginger in bags"/>
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Kind of source
                        </span>

                        <select value={sourceKind} onChange={event => setSourceKind(event.target.value as SavedKnowledgeSourceKind)}>
                            {SOURCE_KIND_OPTIONS.map(option => (<option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>))}
                        </select>
                    </label>

                    {sourceKind === 'other' && (<label className="sprig-knowledge-field">
                            <span>
                                What kind?
                            </span>

                            <input type="text" value={sourceCustomKind} onChange={event => setSourceCustomKind(event.target.value)} placeholder="Podcast, seed packet, workshop..."/>
                        </label>)}

                    <label className="sprig-knowledge-field">
                        <span>
                            Who or where?
                            <small>
                                optional
                            </small>
                        </span>

                        <input type="text" value={sourceName} onChange={event => setSourceName(event.target.value)} placeholder="Hunter Backyard Veggie Growers"/>
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            Link
                            <small>
                                optional
                            </small>
                        </span>

                        <input type="url" value={sourceUrl} onChange={event => setSourceUrl(event.target.value)} placeholder="https://..."/>
                    </label>

                    <label className="sprig-knowledge-field">
    <span>
        Saved / noted date
    </span>

    <input type="date" value={sourceSavedDate} onChange={event => setSourceSavedDate(event.target.value)}/>

    <small>
        Use the original date if this is
        advice you saved before bringing it
        into Sprig.
    </small>
        </label>
                    <label className="sprig-knowledge-field">
                        <span>
                            What did you want to save?
                        </span>

                        <textarea rows={7} value={sourceExcerpt} onChange={event => setSourceExcerpt(event.target.value)} placeholder="The useful advice, quote, method or summary..."/>
                    </label>

                    <label className="sprig-knowledge-field">
                        <span>
                            My note about it
                            <small>
                                optional
                            </small>
                        </span>

                        <textarea rows={5} value={sourceNotes} onChange={event => setSourceNotes(event.target.value)} placeholder="Why it interested me, whether I tried it, what I am unsure about..."/>
                    </label>

                    <SprigPhotoPicker photoUrls={sourcePhotoUrls} onChange={setSourcePhotoUrls} title="Photographs" helperText="Add screenshots, book pages, seed packets or other photographs that belong with this source." addButtonText="Add photographs" photoAltPrefix="Saved source photograph" multiple={true} maxPhotos={12}/>

                    <button type="button" className="sprig-knowledge-primary-button" onClick={handleSaveSource} disabled={!sourceTitle.trim()}>
                        Save Tip / Source
                    </button>
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
                            {sources.length}
                        </span>
                    </div>

                    {sources.length > 0 && (<div className="sprig-knowledge-detail-actions">
                            <button type="button" className="sprig-knowledge-secondary-button" onClick={() => printKnowledgeDocuments('Saved Tips & Sources', [...sources]
                    .sort((first, second) => (second.savedDate ?? second.createdAt).localeCompare(first.savedDate ?? first.createdAt))
                    .map(source => getSourceExportDocument(source, gardenData)))}>
                                Export Tips & Sources PDF
                            </button>

                            <button type="button" className="sprig-knowledge-secondary-button" onClick={() => {
                    const exportDocuments = [...sources]
                        .sort((first, second) => (second.savedDate ?? second.createdAt).localeCompare(first.savedDate ?? first.createdAt))
                        .map(source => getSourceExportDocument(source, gardenData));
                    downloadTextFile('Sprig-Tips-and-Sources.rtf', buildExportRtf('Saved Tips & Sources', exportDocuments), 'application/rtf;charset=utf-8');
                }}>
                                Export Tips & Sources RTF
                            </button>
                        </div>)}

                    {sources.length === 0 ? (<div className="sprig-knowledge-empty">
                            <strong>
                                No saved sources yet.
                            </strong>

                            <p>
                                Links, Facebook advice,
                                ChatGPT guidance, books,
                                people and screenshots can
                                all live here.
                            </p>
                        </div>) : (<div className="sprig-knowledge-card-list">
                            {[...sources]
                    .sort((first, second) => (second.savedDate ??
                    second.createdAt).localeCompare(first.savedDate ??
                    first.createdAt))
                    .map(source => (<button key={source.id} type="button" className="sprig-knowledge-card" onClick={() => selectSource(source.id)}>
                                            <div>
                                                <span className="sprig-knowledge-card-kicker">
                                                    {getSourceKindLabel(source)}
                                                </span>

                                                <strong>
                                                    {source.title}
                                                </strong>

                                                {source.excerpt && (<p>
                                                        {source.excerpt}
                                                    </p>)}
                                            </div>

                                            <div className="sprig-knowledge-card-meta">
                                                {source.sourceName && (<span>
                                                        {source.sourceName}
                                                    </span>)}

                                                <span>
                                                    {formatDate(source.savedDate ??
                        source.createdAt)}
                                                </span>
                                            </div>
                                        </button>))}
                        </div>)}
                </section>
            </div>);
    }
    function renderAlmanacView() {
        const selectedThread =
            almanacThreads.find(
                thread =>
                    thread.key ===
                    selectedAlmanacThreadKey,
            ) ?? null;
    
        if (selectedThread) {
            const material =
                getAlmanacThreadMaterial(
                    gardenData,
                    selectedThread,
                );
    
            const totalPieces =
                material.plantStories.length +
                material.harvests.length +
                material.notes.length +
                material.references.length +
                material.sources.length;
    
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
    
                    <section className="sprig-knowledge-paper sprig-knowledge-almanac-intro">
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
                            Sprig has gathered{' '}
                            {totalPieces}{' '}
                            {totalPieces === 1
                                ? 'piece'
                                : 'pieces'}{' '}
                            of your garden story around this
                            thread. They remain their own
                            records. The Almanac is simply
                            bringing them together so you can
                            see what your garden has recorded,
                            what you have learned, and what
                            advice you have saved.
                        </p>
                    </section>
    
                    {material.plantStories.length > 0 && (
                        <section className="sprig-knowledge-list-section">
                            <div className="sprig-knowledge-section-heading">
                                <div>
                                    <p className="section-label">
                                        From your garden
                                    </p>
    
                                    <h2>
                                        Plant Stories
                                    </h2>
                                </div>
    
                                <span className="sprig-knowledge-count">
                                    {
                                        material
                                            .plantStories
                                            .length
                                    }
                                </span>
                            </div>
    
                            <div className="sprig-knowledge-card-list">
                                {material.plantStories.map(
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
                                            <div>
                                                <span className="sprig-knowledge-card-kicker">
                                                    Plant Story
                                                </span>
    
                                                <strong>
                                                    {plant.displayName ||
                                                        plant.variety ||
                                                        plant.plantName}
                                                </strong>
    
                                                {plant.variety &&
                                                    plant.displayName && (
                                                        <p>
                                                            {
                                                                plant.plantName
                                                            }
                                                            {' · '}
                                                            {
                                                                plant.variety
                                                            }
                                                        </p>
                                                    )}
                                            </div>
    
                                            <div className="sprig-knowledge-card-meta">
                                                <span>
                                                    Open story ›
                                                </span>
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>
                        </section>
                    )}
    
                    {material.harvests.length > 0 && (
                        <section className="sprig-knowledge-list-section">
                            <div className="sprig-knowledge-section-heading">
                                <div>
                                    <p className="section-label">
                                        What your garden
                                        produced
                                    </p>
    
                                    <h2>
                                        Harvests
                                    </h2>
                                </div>
    
                                <span className="sprig-knowledge-count">
                                    {
                                        material
                                            .harvests
                                            .length
                                    }
                                </span>
                            </div>
    
                            <div className="sprig-knowledge-card-list">
                                {material.harvests.map(
                                    harvest => {
                                        const harvestPlants =
                                            harvest.plantStoryIds
                                                .map(
                                                    plantId =>
                                                        (
                                                            gardenData.plantStories ??
                                                            []
                                                        ).find(
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
    
                                        return (
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
                                                <div>
                                                    <span className="sprig-knowledge-card-kicker">
                                                        Harvest
                                                    </span>
    
                                                    <strong>
                                                        {harvestPlants.length >
                                                        0
                                                            ? harvestPlants.join(
                                                                  ', ',
                                                              )
                                                            : 'Garden harvest'}
                                                    </strong>
    
                                                    <p>
                                                        {
                                                            formatDate(
                                                                harvest.date,
                                                            )
                                                        }
                                                    </p>
                                                </div>
    
                                                <div className="sprig-knowledge-card-meta">
                                                    <span>
                                                        Open harvest ›
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        </section>
                    )}
    
                    {material.references.length > 0 && (
                        <section className="sprig-knowledge-list-section">
                            <div className="sprig-knowledge-section-heading">
                                <div>
                                    <p className="section-label">
                                        What you keep
                                        knowing
                                    </p>
    
                                    <h2>
                                        Plant Reference
                                    </h2>
                                </div>
    
                                <span className="sprig-knowledge-count">
                                    {
                                        material
                                            .references
                                            .length
                                    }
                                </span>
                            </div>
    
                            <div className="sprig-knowledge-card-list">
                                {material.references.map(
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
                                            <div>
                                                <span className="sprig-knowledge-card-kicker">
                                                    Plant Reference
                                                </span>
    
                                                <strong>
                                                    {getReferenceLabel(
                                                        reference,
                                                    )}
                                                </strong>
    
                                                {reference.notes && (
                                                    <p>
                                                        {
                                                            reference.notes
                                                        }
                                                    </p>
                                                )}
                                            </div>
    
                                            <div className="sprig-knowledge-card-meta">
                                                <span>
                                                    {formatDate(
                                                        reference.referenceDate ??
                                                            reference.createdAt,
                                                    )}
                                                </span>
    
                                                <span>
                                                    Open reference ›
                                                </span>
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>
                        </section>
                    )}
    
                    {material.sources.length > 0 && (
                        <section className="sprig-knowledge-list-section">
                            <div className="sprig-knowledge-section-heading">
                                <div>
                                    <p className="section-label">
                                        Advice you have
                                        gathered
                                    </p>
    
                                    <h2>
                                        Tips & Sources
                                    </h2>
                                </div>
    
                                <span className="sprig-knowledge-count">
                                    {
                                        material
                                            .sources
                                            .length
                                    }
                                </span>
                            </div>
    
                            <div className="sprig-knowledge-card-list">
                                {material.sources.map(
                                    source => (
                                        <button
                                            key={
                                                source.id
                                            }
                                            type="button"
                                            className="sprig-knowledge-card"
                                            onClick={() =>
                                                onOpenRelationship(
                                                    'saved-source',
                                                    source.id,
                                                )
                                            }
                                        >
                                            <div>
                                                <span className="sprig-knowledge-card-kicker">
                                                    {getSourceKindLabel(
                                                        source,
                                                    )}
                                                </span>
    
                                                <strong>
                                                    {
                                                        source.title
                                                    }
                                                </strong>
    
                                                {source.excerpt && (
                                                    <p>
                                                        {
                                                            source.excerpt
                                                        }
                                                    </p>
                                                )}
                                            </div>
    
                                            <div className="sprig-knowledge-card-meta">
                                                {source.sourceName && (
                                                    <span>
                                                        {
                                                            source.sourceName
                                                        }
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
                        </section>
                    )}
    
                    {material.notes.length > 0 && (
                        <section className="sprig-knowledge-list-section">
                            <div className="sprig-knowledge-section-heading">
                                <div>
                                    <p className="section-label">
                                        Thoughts & clues
                                    </p>
    
                                    <h2>
                                        Garden Notes
                                    </h2>
                                </div>
    
                                <span className="sprig-knowledge-count">
                                    {
                                        material.notes
                                            .length
                                    }
                                </span>
                            </div>
    
                            <div className="sprig-knowledge-card-list">
                                {material.notes.map(
                                    note => (
                                        <button
                                            key={
                                                note.id
                                            }
                                            type="button"
                                            className="sprig-knowledge-card"
                                            onClick={() =>
                                                onOpenRelationship(
                                                    'garden-note',
                                                    note.id,
                                                )
                                            }
                                        >
                                            <div>
                                                <span className="sprig-knowledge-card-kicker">
                                                    {note.origin ===
                                                    'imported-text'
                                                        ? 'Imported note'
                                                        : 'Garden Note'}
                                                </span>
    
                                                <strong>
                                                    {note.title ||
                                                        makeTitleFromBody(
                                                            note.body,
                                                        )}
                                                </strong>
    
                                                <p>
                                                    {
                                                        note.body
                                                    }
                                                </p>
                                            </div>
    
                                            <div className="sprig-knowledge-card-meta">
                                                <span>
                                                    {formatDate(
                                                        note.noteDate ??
                                                            note.createdAt,
                                                    )}
                                                </span>
    
                                                {(note.photoUrls ??
                                                    [])
                                                    .length >
                                                    0 && (
                                                    <span>
                                                        {
                                                            (
                                                                note.photoUrls ??
                                                                []
                                                            )
                                                                .length
                                                        }{' '}
                                                        {(
                                                            note.photoUrls ??
                                                            []
                                                        )
                                                            .length ===
                                                        1
                                                            ? 'photograph'
                                                            : 'photographs'}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>
                        </section>
                    )}
    
                    <section className="sprig-knowledge-paper">
                        <p className="section-label">
                            What Sprig knows
                        </p>
    
                        <h3>
                            A gathered thread, not a verdict
                        </h3>
    
                        <p className="sprig-knowledge-muted">
                            Garden history, your own notes,
                            reference knowledge and outside
                            advice have different authority.
                            Sprig keeps those distinctions
                            intact while letting you see them
                            together. As this thread grows,
                            this is where patterns can begin to
                            emerge from the garden you actually
                            grew.
                        </p>
                    </section>
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
                        Your garden, beginning to teach
                        itself back to you
                    </h2>
    
                    <p>
                        The Almanac is not another place to
                        re-enter records. It gathers threads
                        from Plant Stories, Harvests, Garden
                        Notes, Plant Reference and Saved
                        Sources so patterns can become
                        visible without pretending every
                        clue is a fact.
                    </p>
    
                    <label className="sprig-knowledge-field">
                        <span>
                            Find an Almanac thread
                        </span>
    
                        <input
                            type="search"
                            value={almanacQuery}
                            onChange={event =>
                                setAlmanacQuery(
                                    event.target.value,
                                )
                            }
                            placeholder="Potato, Royal Blue, tomato..."
                        />
                    </label>
                </section>
    
                {filteredAlmanacThreads.length === 0 ? (
                    <div className="sprig-knowledge-empty">
                        <strong>
                            No matching garden thread yet.
                        </strong>
    
                        <p>
                            As Sprig gathers Plant Stories,
                            notes, harvests and reference
                            knowledge, the Almanac can begin
                            assembling them here.
                        </p>
                    </div>
                ) : (
                    <div className="sprig-knowledge-almanac-grid">
                        {filteredAlmanacThreads.map(
                            thread => (
                                <button
                                    key={thread.key}
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
                                                {
                                                    thread.plantStoryCount
                                                }
                                            </dd>
                                        </div>
    
                                        <div>
                                            <dt>
                                                Harvests
                                            </dt>
    
                                            <dd>
                                                {
                                                    thread.harvestCount
                                                }
                                            </dd>
                                        </div>
    
                                        <div>
                                            <dt>
                                                Garden Notes
                                            </dt>
    
                                            <dd>
                                                {
                                                    thread.noteCount
                                                }
                                            </dd>
                                        </div>
    
                                        <div>
                                            <dt>
                                                Plant Reference
                                            </dt>
    
                                            <dd>
                                                {
                                                    thread.referenceCount
                                                }
                                            </dd>
                                        </div>
    
                                        <div>
                                            <dt>
                                                Tips & Sources
                                            </dt>
    
                                            <dd>
                                                {
                                                    thread.sourceCount
                                                }
                                            </dd>
                                        </div>
                                    </dl>
    
                                    <p className="sprig-knowledge-muted">
                                        Open this thread to
                                        gather the records
                                        Sprig currently knows
                                        about it.
                                    </p>
                                </button>
                            ),
                        )}
                    </div>
                )}
            </div>
        );
    }
    
    function getPageTitle(): string {
        switch (view) {
            case 'notes':
                return 'Garden Notes';
            case 'almanac':
                return 'Garden Almanac';
            case 'reference':
                return 'Plant Reference';
            case 'sources':
                return 'Saved Tips & Sources';
            default:
                return 'Garden Knowledge';
        }
    }
    function getPageSubtitle(): string {
        switch (view) {
            case 'notes':
                return 'Catch the thought first. Decide what it means later.';
            case 'almanac':
                return 'Patterns and threads gathered from your own garden story.';
            case 'reference':
                return 'Reusable knowledge about crops and varieties.';
            case 'sources':
                return 'Advice kept together with where it came from.';
            default:
                return '';
        }
    }
    return (<GardenLayout activePage={view === 'notes'
            ? 'garden-notes'
            : view === 'almanac'
                ? 'garden-almanac'
                : view === 'reference'
                    ? 'plant-reference'
                    : 'saved-sources'} onNavigate={onNavigate}>
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
            onJourneyBack && (<button type="button" className="sprig-knowledge-journey-back" onClick={onJourneyBack}>
                            ← Back to{' '}
                            {journeyBackLabel}
                        </button>)}

                {renderKnowledgeNavigation()}

                {view === 'notes' &&
            renderNotesView()}

                {view === 'almanac' &&
            renderAlmanacView()}

                {view === 'reference' &&
            renderReferenceView()}

                {view === 'sources' &&
            renderSourcesView()}
            </div>
        </GardenLayout>);
}