/**
 * Parses this server's custom gestational-age extension format
 * (`http://example.org/fhir/StructureDefinition/gestationalAge`, e.g.
 * `"32W 2D"`) into total weeks as a float (32 + 2/7). Returns null for
 * anything that doesn't match.
 */
export function parseGestationalAge(value?: string): number | null {
    if (!value) return null;
    const match = value.match(/(\d+(?:\.\d+)?)\s*W(?:\s*(\d+)\s*D)?/i);
    if (!match) return null;
    const weeks = parseFloat(match[1]);
    const days = match[2] ? parseInt(match[2], 10) : 0;
    return weeks + days / 7;
}

export function getPatientGestationalAgeWeeks(patient: any): number | null {
    const ext = (patient?.extension ?? []).find(
        (e: any) => e.url === 'http://example.org/fhir/StructureDefinition/gestationalAge',
    );
    return parseGestationalAge(ext?.valueString);
}

const GESTATIONAL_AGE_BUCKETS = [
    { key: '<28w', max: 28 },
    { key: '28-31w', max: 32 },
    { key: '32-33w', max: 34 },
    { key: '34-36w', max: 37 },
    { key: '>=37w (Term)', max: Infinity },
];

export const GESTATIONAL_AGE_BUCKET_LABELS = [...GESTATIONAL_AGE_BUCKETS.map((b) => b.key), 'Unknown'];

export function bucketGestationalAge(weeks: number | null): string {
    if (weeks === null || Number.isNaN(weeks)) return 'Unknown';
    const bucket = GESTATIONAL_AGE_BUCKETS.find((b) => weeks < b.max);
    return bucket?.key ?? 'Unknown';
}

/**
 * Reads this server's custom birth-weight extension
 * (`http://example.org/fhir/StructureDefinition/birthWeight`, a
 * valueQuantity in grams).
 */
export function getPatientBirthWeightGrams(patient: any): number | null {
    const ext = (patient?.extension ?? []).find(
        (e: any) => e.url === 'http://example.org/fhir/StructureDefinition/birthWeight',
    );
    const value = ext?.valueQuantity?.value;
    return typeof value === 'number' ? value : null;
}

// Standard neonatal birth-weight classifications.
const BIRTH_WEIGHT_BUCKETS = [
    { key: '<1000g (ELBW)', max: 1000 },
    { key: '1000-1499g (VLBW)', max: 1500 },
    { key: '1500-2499g (LBW)', max: 2500 },
    { key: '2500-3999g (Normal)', max: 4000 },
    { key: '>=4000g (High)', max: Infinity },
];

export const BIRTH_WEIGHT_BUCKET_LABELS = [...BIRTH_WEIGHT_BUCKETS.map((b) => b.key), 'Unknown'];

export function bucketBirthWeight(grams: number | null): string {
    if (grams === null || Number.isNaN(grams)) return 'Unknown';
    const bucket = BIRTH_WEIGHT_BUCKETS.find((b) => grams < b.max);
    return bucket?.key ?? 'Unknown';
}

export function computeLengthOfStayDays(encounter: any): number | null {
    const start = encounter?.period?.start;
    const end = encounter?.period?.end;
    if (!start || !end) return null;
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    if (Number.isNaN(startTime) || Number.isNaN(endTime)) return null;
    return (endTime - startTime) / (1000 * 60 * 60 * 24);
}

const LENGTH_OF_STAY_BUCKETS = [
    { key: '<3 days', max: 3 },
    { key: '3-6 days', max: 7 },
    { key: '7-13 days', max: 14 },
    { key: '14-29 days', max: 30 },
    { key: '>=30 days', max: Infinity },
];

export const LENGTH_OF_STAY_BUCKET_LABELS = LENGTH_OF_STAY_BUCKETS.map((b) => b.key);

/** Only meaningful for encounters with a known length of stay -- callers should filter out nulls (still-admitted) first. */
export function bucketLengthOfStay(days: number): string {
    const bucket = LENGTH_OF_STAY_BUCKETS.find((b) => days < b.max);
    return bucket?.key ?? '>=30 days';
}

/**
 * Checks a date against an optional [from, to] range (both "YYYY-MM-DD" or
 * empty). If a range bound is set and the resource has no date at all, it is
 * excluded -- there's no way to know whether it falls in range.
 */
export function isDateInRange(dateStr: string | undefined, from: string, to: string): boolean {
    if (!from && !to) return true;
    if (!dateStr) return false;
    const time = new Date(dateStr).getTime();
    if (Number.isNaN(time)) return false;
    if (from && time < new Date(from).getTime()) return false;
    if (to && time > new Date(to).getTime() + 24 * 60 * 60 * 1000 - 1) return false;
    return true;
}

export function toMonthLabel(dateStr?: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function groupCountBy<T>(items: T[], keyFn: (item: T) => string | undefined): Record<string, number> {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
        const key = keyFn(item);
        if (!key) return;
        counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
}

export function topEntries(counts: Record<string, number>, limit: number): { label: string; value: number }[] {
    return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([label, value]) => ({ label, value }));
}

export function sortedMonthlyEntries(counts: Record<string, number>): { label: string; value: number }[] {
    return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, value]) => ({ label, value }));
}

export function getPatientNationality(patient: any): string | undefined {
    const ext = (patient?.extension ?? []).find(
        (e: any) => e.url === 'http://example.org/fhir/StructureDefinition/nationality',
    );
    return ext?.valueString;
}

/** Encounter.class is a bare Coding (not a CodeableConcept), so it needs its own accessor. */
export function getEncounterClassLabel(encounter: any): string | undefined {
    return encounter?.class?.display ?? encounter?.class?.code;
}

/**
 * Encounter.participant references the care team member via `individual`
 * (R4) -- some profiles/servers use `actor` instead (aligning with
 * Procedure.performer/CareTeam.participant naming), so both are checked.
 */
export function getParticipantLabel(participant: any): string | undefined {
    const ref = participant?.individual ?? participant?.actor;
    return ref?.display ?? referenceIdFromRef(ref);
}

export function getPerformerLabel(performer: any): string | undefined {
    const ref = performer?.actor;
    return ref?.display ?? referenceIdFromRef(ref);
}

function referenceIdFromRef(ref?: { reference?: string }): string | undefined {
    return ref?.reference;
}

/**
 * Patients with more than one Encounter, as a percentage of patients with at
 * least one -- a simple readmission-rate proxy.
 */
export function computeReadmissionRate(encounters: any[], patientIdFn: (encounter: any) => string | undefined): number | null {
    const counts = groupCountBy(encounters, patientIdFn);
    const patientsWithEncounters = Object.keys(counts).length;
    if (patientsWithEncounters === 0) return null;
    const readmitted = Object.values(counts).filter((count) => count > 1).length;
    return (readmitted / patientsWithEncounters) * 100;
}

function isQuantityAbnormal(node: any): boolean {
    const range = node?.referenceRange?.[0];
    const value = node?.valueQuantity?.value;
    if (!range || value === undefined) return false;
    if (range.low?.value !== undefined && value < range.low.value) return true;
    if (range.high?.value !== undefined && value > range.high.value) return true;
    return false;
}

/** Percentage of quantitative Observation readings (top-level or component) that fall outside their reference range. */
export function computeAbnormalObservationRate(observations: any[]): number | null {
    let total = 0;
    let abnormal = 0;

    observations.forEach((obs) => {
        if (obs.valueQuantity?.value !== undefined) {
            total += 1;
            if (isQuantityAbnormal(obs)) abnormal += 1;
        }
        (obs.component ?? []).forEach((component: any) => {
            if (component.valueQuantity?.value !== undefined) {
                total += 1;
                if (isQuantityAbnormal(component)) abnormal += 1;
            }
        });
    });

    return total > 0 ? (abnormal / total) * 100 : null;
}

export interface ObservationDataPointLike {
    date: string;
    value: number;
    unit?: string;
}

/** Average value per metric, for the `limit` metrics with the most readings. */
export function averageByMetric(
    series: Record<string, ObservationDataPointLike[]>,
    limit: number,
): { label: string; value: number; unit?: string }[] {
    return Object.entries(series)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, limit)
        .map(([label, points]) => ({
            label,
            value: points.reduce((sum, p) => sum + p.value, 0) / points.length,
            unit: points.find((p) => p.unit)?.unit,
        }));
}

/** Pivots a metric's raw readings into a monthly-average trend. */
export function monthlyAverageSeries(points: ObservationDataPointLike[]): { label: string; value: number }[] {
    const byMonth = new Map<string, number[]>();
    points.forEach((point) => {
        const month = toMonthLabel(point.date);
        if (!month) return;
        if (!byMonth.has(month)) byMonth.set(month, []);
        byMonth.get(month)!.push(point.value);
    });
    return Array.from(byMonth.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, values]) => ({ label, value: values.reduce((sum, v) => sum + v, 0) / values.length }));
}
