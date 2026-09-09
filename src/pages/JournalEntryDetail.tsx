import { useState } from 'react';
import GardenLayout from '../components/layout/GardenLayout';
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery';

import type {
    GardenEvent,
    GrowingPlace,
    PlantStory,
} from '../types';

import type { AppPage } from '../types/navigation';

type DurationUnit = 'days' | 'weeks' | 'months';

interface JournalEntryDetailProps {
    event: GardenEvent;
    plants: PlantStory[];
    growingPlaces: GrowingPlace[];
    journeyBackLabel: string | null;
    onBack: () => void;
    onOpenJournal: () => void;
    onEdit: () => void;
    onDelete: (eventId: string) => void;
    onOpenPlant: (plantId: string) => void;
    onOpenGrowingPlace: (growingPlaceId: string) => void;
    onNavigate: (page: AppPage) => void;
}

/* =======================================
   DATES AND PLANT AGE
======================================= */

function formatDate(value: string): string {
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) return 'Date not recorded';

    return date.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function getAgeDays(plant: PlantStory, date: string): number | undefined {
    const start = new Date(`${plant.plantedDate.slice(0, 10)}T00:00:00`);
    const end = new Date(`${date.slice(0, 10)}T00:00:00`);
    const days = Math.round((end.getTime() - start.getTime()) / 86400000);

    return Number.isFinite(days) ? days : undefined;
}

function formatAge(
    plant: PlantStory,
    date: string,
    unit: DurationUnit,
): string {
    const days = getAgeDays(plant, date);
    if (days === undefined) return 'Age not available';

    const divisor = unit === 'days' ? 1 : unit === 'weeks' ? 7 : 30.4375;
    const amount = unit === 'days'
        ? Math.abs(days)
        : Math.round((Math.abs(days) / divisor) * 10) / 10;

    const label = unit === 'days' ? 'day' : unit === 'weeks' ? 'week' : 'month';
    const duration = `${amount} ${label}${amount === 1 ? '' : 's'}`;

    return days < 0
        ? `${duration} before story began`
        : `Age ${duration}`;
}

/* =======================================
   EVENT LABELS
======================================= */

function getEventLabel(type: GardenEvent['type']): string {
    switch (type) {
        case 'planted': return 'Planted';
        case 'sprouted': return 'Sprouted';
        case 'watered': return 'Watered';
        case 'fed': return 'Fertilised';
        case 'moved': return 'Moved';
        case 'hilled': return 'Hilled';
        case 'pruned': return 'Pruned';
        case 'treated': return 'Treated';
        case 'weather': return 'Weather';
        case 'observation': return 'Observed';
        case 'photo': return 'Photographed';
        case 'harvest': return 'Harvested';
        case 'note': return 'Made a note';
        default: return 'Garden moment';
    }
}

function getEventEmoji(type: GardenEvent['type']): string {
    switch (type) {
        case 'planted': return '🌱';
        case 'sprouted': return '🌿';
        case 'watered': return '💧';
        case 'fed': return '🧪';
        case 'moved': return '🪴';
        case 'hilled': return '🥔';
        case 'pruned': return '✂️';
        case 'treated': return '🩹';
        case 'weather': return '🌦️';
        case 'observation': return '👀';
        case 'photo': return '📷';
        case 'harvest': return '🧺';
        case 'note': return '📖';
        default: return '📝';
    }
}

const styles = `
    .journal-entry-detail-page .journal-age-control {
        margin: 0.7rem 0 1rem;
    }

    .journal-entry-detail-page .journal-age-control-label {
        display: block;
        margin-bottom: 0.35rem;
        color: #62705f;
        font-size: 0.75rem;
        font-weight: 700;
    }

    .journal-entry-detail-page .journal-age-picker {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
    }

    .journal-entry-detail-page .journal-age-picker button {
        width: auto;
        min-height: 40px;
        margin: 0;
        padding: 0.4rem 0.7rem;
        border: 1px solid rgba(82, 112, 71, 0.16);
        border-radius: 999px;
        background: rgba(255, 254, 249, 0.85);
        color: #62705f;
        font: inherit;
        font-size: 0.76rem;
        cursor: pointer;
    }

    .journal-entry-detail-page .journal-age-picker button[aria-pressed="true"] {
        background: #e2eed4;
        border-color: rgba(82, 112, 71, 0.33);
        color: #405e42;
        font-weight: 700;
    }

    .journal-entry-detail-page .journal-linked-plant-list {
        list-style: none;
        margin: 0.6rem 0 0;
        padding: 0;
    }

    .journal-entry-detail-page .journal-linked-plant-list li + li {
        margin-top: 0.65rem;
    }

    .journal-entry-detail-page .journal-linked-plant-list .text-button {
        width: auto;
        margin: 0;
        padding: 0.15rem 0;
        text-align: left;
        white-space: normal;
    }

    .journal-entry-detail-page .journal-linked-plant-age {
        display: block;
        margin-top: 0.1rem;
        color: #52634b;
        font-size: 0.84rem;
        line-height: 1.5;
    }

    .journal-entry-detail-page .detail-back-to-top {
        display: flex;
        justify-content: center;
        padding: 1rem 0 2rem;
    }

    @media print {
        .journal-entry-detail-page .journal-age-control,
        .journal-entry-detail-page .detail-back-to-top {
            display: none;
        }
    }
`;

/* =======================================
   JOURNAL ENTRY DETAIL
======================================= */

export default function JournalEntryDetail({
    event,
    plants,
    growingPlaces,
    journeyBackLabel,
    onBack,
    onOpenJournal,
    onEdit,
    onDelete,
    onOpenPlant,
    onOpenGrowingPlace,
    onNavigate,
}: JournalEntryDetailProps) {
    const [durationUnit, setDurationUnit] = useState<DurationUnit>('weeks');
    const units: DurationUnit[] = ['days', 'weeks', 'months'];

    // Only explicit saved relationships determine individual ages.
    // Today's plant collection is not a historical list of all plants.
    const linkedPlants = plants.filter(
        plant => event.plantStoryIds.includes(plant.id),
    );

    const linkedGrowingPlaces = growingPlaces.filter(
        place => event.growingPlaceIds?.includes(place.id),
    );

    const activityTypes = event.activityTypes?.length
        ? event.activityTypes
        : [event.type];

    const isIndividualPlantEntry =
        event.plantScope !== 'all-plants' &&
        event.plantScope !== 'category';

    const photoContexts = (event.photoUrls ?? []).map((photoUrl, index) => {
        const metadata = event.photoMetadata?.[index] ??
            event.photoMetadata?.find(item => item?.photoUrl === photoUrl);

        const date = metadata?.photoDate || event.date;
        const details = [formatDate(date)];

        if (metadata?.photoTime) details.push(metadata.photoTime);
        if (metadata?.notes) details.push(metadata.notes);
        if (metadata?.tags?.length) {
            details.push(
                metadata.tags.map(tag => `#${tag.replace(/^#+/, '')}`).join(' '),
            );
        }

        let age: { days: number } | undefined;

        if (linkedPlants.length === 1 && isIndividualPlantEntry) {
            const days = getAgeDays(linkedPlants[0], date);
            if (days !== undefined && days >= 0) {
                age = { days };
            } else {
                details.push(formatAge(linkedPlants[0], date, durationUnit));
            }
        } else {
            linkedPlants.forEach(plant => {
                details.push(
                    `${plant.displayName}: ${formatAge(plant, date, durationUnit)}`,
                );
            });
        }

        return {
            heading: metadata?.title || event.title,
            detail: details.join(' · '),
            age,
        };
    });

    function deleteJournalEntry() {
        if (window.confirm(
            `Delete "${event.title}" from the Garden Journal?\n\nThis removes this Journal page. It does not delete the Plant Stories or Growing Places mentioned by it.\n\nThis cannot be undone.`,
        )) {
            onDelete(event.id);
        }
    }

    function backToTop() {
        document.getElementById('journal-detail-top')?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto' : 'smooth',
            block: 'start',
        });
    }

    return (
        <GardenLayout activePage="journal" onNavigate={onNavigate}>
            <div
                className="journal-page journal-entry-detail-page"
                id="journal-detail-top"
            >
                <style>{styles}</style>

                <div
                    className="sprig-detail-navigation"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px',
                        marginBottom: '18px',
                    }}
                >
                    {journeyBackLabel && (
                        <button
                            type="button"
                            className="garden-return-button"
                            onClick={onBack}
                        >
                            ← Back to {journeyBackLabel}
                        </button>
                    )}

                    {journeyBackLabel !== 'Journal' && (
                        <button
                            type="button"
                            className="garden-return-button"
                            onClick={onOpenJournal}
                        >
                            📖 Journal
                        </button>
                    )}
                </div>

                <header className="journal-header">
                    <div>
                        <p className="section-label">
                            {getEventEmoji(event.type)} Journal page
                        </p>

                        <h1>{event.title}</h1>

                        <p className="journal-intro">
                            <time dateTime={event.date}>{formatDate(event.date)}</time>
                            {linkedPlants.length === 1 && isIndividualPlantEntry && (
                                <>
                                    {' · '}
                                    {formatAge(linkedPlants[0], event.date, durationUnit)}
                                </>
                            )}
                        </p>
                    </div>
                </header>

                {linkedPlants.length > 0 && (
                    <div className="journal-age-control">
                        <span className="journal-age-control-label">
                            Show plant age at this moment in
                        </span>
                        <div
                            className="journal-age-picker"
                            role="group"
                            aria-label="Plant age display"
                        >
                            {units.map(unit => (
                                <button
                                    key={unit}
                                    type="button"
                                    aria-pressed={durationUnit === unit}
                                    onClick={() => setDurationUnit(unit)}
                                >
                                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <section
                    className="plant-record-actions"
                    aria-label="Journal Entry actions"
                    style={{ marginBottom: '24px' }}
                >
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onEdit}
                    >
                        ✏ Edit Journal Entry
                    </button>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={deleteJournalEntry}
                    >
                        🗑 Delete Journal Entry
                    </button>
                </section>

                <section className="library-grid">
                    <article className="library-book">
                        <p className="section-label">What happened</p>
                        <h2>Garden moment</h2>

                        <div className="sprig-ingredient-list">
                            {activityTypes.map(activity => (
                                <span key={activity} className="sprig-ingredient-chip">
                                    {getEventEmoji(activity)} {getEventLabel(activity)}
                                </span>
                            ))}
                        </div>
                    </article>

                    <article className="library-book">
                        <p className="section-label">Plant Stories</p>
                        <h2>Which plants were involved</h2>

                        {event.plantScope === 'all-plants' && (
                            <p>🌳 All Plants</p>
                        )}

                        {event.plantScope === 'category' && (
                            <p>{event.plantCategory || 'A plant category'}</p>
                        )}

                        {linkedPlants.length > 0 ? (
                            <ul className="journal-linked-plant-list">
                                {linkedPlants.map(plant => (
                                    <li key={plant.id}>
                                        <button
                                            type="button"
                                            className="text-button"
                                            onClick={() => onOpenPlant(plant.id)}
                                        >
                                            🌱 {plant.displayName}
                                            {plant.variety &&
                                            plant.variety !== plant.displayName && (
                                                <> · {plant.variety}</>
                                            )}
                                        </button>
                                        <span className="journal-linked-plant-age">
                                            {formatAge(plant, event.date, durationUnit)}
                                            {' at this moment'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            event.plantScope !== 'all-plants' &&
                            event.plantScope !== 'category' && (
                                <p>
                                    This page belongs to the wider garden rather
                                    than one particular Plant Story.
                                </p>
                            )
                        )}
                    </article>

                    <article className="library-book">
                        <p className="section-label">Growing Places</p>
                        <h2>Where this story unfolded</h2>

                        {event.growingPlaceScope === 'entire-garden' ? (
                            <p>🌳 The whole garden</p>
                        ) : linkedGrowingPlaces.length > 0 ? (
                            <ul>
                                {linkedGrowingPlaces.map(place => (
                                    <li key={place.id}>
                                        <button
                                            type="button"
                                            className="text-button"
                                            onClick={() => onOpenGrowingPlace(place.id)}
                                        >
                                            🌿 {place.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>
                                No particular Growing Place was recorded for this page.
                            </p>
                        )}
                    </article>

                    {event.productUsed && (
                        <article className="library-book">
                            <p className="section-label">Garden provisions</p>
                            <h2>What was used</h2>
                            <p>{event.productUsed}</p>
                        </article>
                    )}

                    <article className="library-book">
                        <p className="section-label">Notes</p>
                        <h2>What you wanted to remember</h2>
                        <p>
                            {event.notes ||
                                'No extra notes were added to this page.'}
                        </p>
                    </article>

                    <article className="library-book">
                        <p className="section-label">Photographs</p>
                        <SprigPhotoGallery
                            photoUrls={event.photoUrls ?? []}
                            photoContexts={photoContexts}
                            durationDisplayUnit={durationUnit}
                            showDurationUnitPicker={false}
                            title="Photographs from this moment"
                            emptyMessage="No photographs were tucked into this Journal page."
                            photoAltPrefix={`${event.title} photograph`}
                        />
                    </article>
                </section>

                <div className="detail-back-to-top">
                    <button type="button" className="text-button" onClick={backToTop}>
                        ↑ Back to top
                    </button>
                </div>
            </div>
        </GardenLayout>
    );
}