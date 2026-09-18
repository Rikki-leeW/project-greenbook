import type { GrowingPlace, PlantStory } from '../../types';

type DurationDisplayUnit = 'days' | 'weeks' | 'months';

interface PlantSmartComparisonsProps {
    plant: PlantStory;
    plants: PlantStory[];
    growingPlaces: GrowingPlace[];
    durationDisplayUnit?: DurationDisplayUnit;
    onOpenPlant: (plantId: string) => void;
    onComparePlants: (plantIds: string[]) => void;
}

interface SimilarPlantStory {
    plant: PlantStory;
    score: number;
    reasons: string[];
}

function normalise(value: string | undefined): string {
    return (value ?? '').trim().toLocaleLowerCase();
}

function getDaysBetween(first: string, second: string): number {
    return Math.abs(Math.round(
        (
            new Date(`${first}T00:00:00`).getTime() -
            new Date(`${second}T00:00:00`).getTime()
        ) / 86400000,
    ));
}

function formatDuration(
    days: number,
    unit: DurationDisplayUnit,
): string {
    if (unit === 'days') {
        return `${days} ${days === 1 ? 'day' : 'days'}`;
    }

    const divisor = unit === 'weeks' ? 7 : 30.4375;
    const amount = Math.round((days / divisor) * 10) / 10;
    const label = unit === 'weeks' ? 'week' : 'month';

    return `${amount} ${label}${amount === 1 ? '' : 's'}`;
}

function getGrowingSetupIds(plant: PlantStory): string[] {
    return Array.from(new Set([
        plant.currentGrowingSetupId ?? '',
        ...(plant.currentGrowingSetupIds ?? []),
        ...(plant.previousGrowingSetupIds ?? []),
        ...(plant.previousGrowingSetupIdsV2 ?? []),
        ...(plant.growingHistory ?? []).flatMap(entry => [
            entry.growingSetupId ?? '',
            ...(entry.growingSetupIds ?? []),
        ]),
    ].filter(Boolean)));
}

function getSimilarity(
    plant: PlantStory,
    candidate: PlantStory,
    unit: DurationDisplayUnit,
): SimilarPlantStory | null {
    if (plant.id === candidate.id) return null;

    /*
     * This component is an exploration tool, not an
     * Intelligence conclusion.
     *
     * It deliberately keeps a broad same-crop boundary
     * so the gardener can inspect nearby stories and
     * decide whether a comparison is useful.
     */
    if (
        normalise(plant.plantName) !==
        normalise(candidate.plantName)
    ) {
        return null;
    }

    let score = 4;
    const reasons = ['Same crop'];

    const sameVariety =
        Boolean(plant.variety?.trim()) &&
        Boolean(candidate.variety?.trim()) &&
        normalise(plant.variety) === normalise(candidate.variety);

    if (sameVariety) {
        score += 6;
        reasons.push('same variety');
    }

    if (
        plant.basedOnPlantStoryId === candidate.id ||
        candidate.basedOnPlantStoryId === plant.id ||
        (
            plant.basedOnPlantStoryId &&
            candidate.basedOnPlantStoryId &&
            plant.basedOnPlantStoryId === candidate.basedOnPlantStoryId
        )
    ) {
        score += 5;
        reasons.push('related variation');
    }

    if (
        plant.currentGrowingPlaceId &&
        candidate.currentGrowingPlaceId &&
        plant.currentGrowingPlaceId === candidate.currentGrowingPlaceId
    ) {
        score += 3;
        reasons.push('same Growing Place');
    }

    const candidateSetupIds = getGrowingSetupIds(candidate);

    if (
        getGrowingSetupIds(plant).some(id =>
            candidateSetupIds.includes(id),
        )
    ) {
        score += 3;
        reasons.push('same growing setup');
    }

    if (plant.startMethod === candidate.startMethod) {
        score += 2;
        reasons.push('same start method');
    }

    const gap = getDaysBetween(
        plant.plantedDate,
        candidate.plantedDate,
    );

    if (gap <= 7) {
        score += 3;
        reasons.push(
            gap === 0
                ? 'planted the same day'
                : `planted ${formatDuration(gap, unit)} apart`,
        );
    } else if (gap <= 30) {
        score += 2;
        reasons.push(`planted ${formatDuration(gap, unit)} apart`);
    } else if (gap <= 60) {
        score += 1;
        reasons.push('similar planting period');
    }

    if (plant.status === candidate.status) {
        score += 1;
    }

    return {
        plant: candidate,
        score,
        reasons,
    };
}

const styles = `
    .sprig-smart-comparisons .sprig-smart-disclosure > summary {
        cursor: pointer;
        color: #405841;
        padding: 0.2rem 0;
        line-height: 1.45;
    }

    .sprig-smart-comparisons .sprig-smart-disclosure > summary::marker {
        color: #718168;
    }

    .sprig-smart-comparisons .sprig-smart-summary-eyebrow {
        display: block;
        margin-bottom: 0.15rem;
        color: #718168;
        font-size: 0.7rem;
        font-weight: 750;
        letter-spacing: 0.07em;
        text-transform: uppercase;
    }

    .sprig-smart-comparisons .sprig-smart-summary-heading {
        display: block;
        font-weight: 750;
        font-size: 1rem;
    }

    .sprig-smart-comparisons .sprig-smart-summary-copy {
        display: block;
        margin-top: 0.2rem;
        color: #687364;
        font-size: 0.82rem;
        font-weight: 400;
    }

    .sprig-smart-comparisons .sprig-smart-disclosure-content {
        padding-top: 0.7rem;
    }

    .sprig-smart-comparisons .sprig-smart-disclosure-content > p {
        margin-top: 0;
        font-size: 0.86rem;
        line-height: 1.5;
    }

    .sprig-smart-comparisons summary:focus-visible {
        outline: 2px solid #627c50;
        outline-offset: 5px;
        border-radius: 4px;
    }
`;

export default function PlantSmartComparisons({
    plant,
    plants,
    growingPlaces,
    durationDisplayUnit = 'days',
    onOpenPlant,
    onComparePlants,
}: PlantSmartComparisonsProps) {
    const matches = plants
        .map(candidate =>
            getSimilarity(
                plant,
                candidate,
                durationDisplayUnit,
            ),
        )
        .filter(
            (match): match is SimilarPlantStory =>
                Boolean(match),
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    if (matches.length === 0) {
        return null;
    }

    const compareAllIds = [
        plant.id,
        ...matches.map(match => match.plant.id),
    ];

    return (
        <section className="story-section sprig-smart-comparisons">
            <style>{styles}</style>

            <details
                key={plant.id}
                className="sprig-smart-disclosure"
            >
                <summary>
                    <span className="sprig-smart-summary-eyebrow">
                        Related stories
                    </span>

                    <span className="sprig-smart-summary-heading">
                        Stories you may want to compare
                    </span>

                    <span className="sprig-smart-summary-copy">
                        {matches.length}{' '}
                        {matches.length === 1
                            ? 'related Plant Story'
                            : 'related Plant Stories'}
                        {' · Open when you’re curious'}
                    </span>
                </summary>

                <div className="sprig-smart-disclosure-content">
                    <p className="journal-intro sprig-smart-intro">
                        These stories share recorded details with this one.
                        That does not mean they behaved the same way or form
                        a pattern. They are simply useful neighbours to
                        explore in Compare Plants.
                    </p>

                    <div className="sprig-smart-comparison-list">
                        {matches.map(match => {
                            const placeName = growingPlaces.find(
                                place =>
                                    place.id ===
                                    match.plant.currentGrowingPlaceId,
                            )?.name;

                            return (
                                <article
                                    key={match.plant.id}
                                    className="sprig-smart-comparison-card"
                                >
                                    <div className="sprig-smart-comparison-main">
                                        <div>
                                            <p className="sprig-smart-comparison-crop">
                                                {match.plant.plantName}
                                                {placeName
                                                    ? ` · ${placeName}`
                                                    : ''}
                                            </p>

                                            <h3>
                                                {match.plant.displayName}
                                            </h3>
                                        </div>

                                        <div className="sprig-smart-reasons">
                                            {match.reasons.map(reason => (
                                                <span key={reason}>
                                                    {reason}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="sprig-smart-comparison-actions">
                                        <button
                                            type="button"
                                            className="text-button"
                                            onClick={() =>
                                                onOpenPlant(
                                                    match.plant.id,
                                                )
                                            }
                                        >
                                            Open story →
                                        </button>

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={() =>
                                                onComparePlants([
                                                    plant.id,
                                                    match.plant.id,
                                                ])
                                            }
                                        >
                                            Compare these two
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {matches.length > 1 && (
                        <div className="sprig-smart-compare-all">
                            <button
                                type="button"
                                className="journal-add-button"
                                onClick={() =>
                                    onComparePlants(compareAllIds)
                                }
                            >
                                Compare all {compareAllIds.length} stories →
                            </button>
                        </div>
                    )}
                </div>
            </details>
        </section>
    );
}
