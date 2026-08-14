export const FHIR_URL = import.meta.env.VITE_FHIRAPI_URL as string;
export const AUTH_HEADER = 'Basic ' + btoa('fhiruser:change-password');

// A patient's full summary fans out into dozens of concurrent FHIR requests
// ($everything plus one per linked resource type, via useQueries). Browsers
// cap concurrent connections per host (~6 on HTTP/1.1); requests beyond that
// can be dropped as a network-level "Failed to fetch" instead of queueing,
// which is worse the more resource types a given patient has data for.
// Gating every request through this queue keeps genuine concurrency within
// what the connection actually supports, without changing fhirFetch's
// external behavior -- callers still just get back a Promise that resolves
// or rejects, each independently, whenever its turn comes.
const MAX_CONCURRENT_REQUESTS = 6;
let activeRequestCount = 0;
const requestQueue: Array<() => void> = [];

function acquireRequestSlot(): Promise<void> {
    if (activeRequestCount < MAX_CONCURRENT_REQUESTS) {
        activeRequestCount += 1;
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        requestQueue.push(() => {
            activeRequestCount += 1;
            resolve();
        });
    });
}

function releaseRequestSlot(): void {
    activeRequestCount -= 1;
    requestQueue.shift()?.();
}

export async function fhirFetch(url: string) {
    await acquireRequestSlot();
    try {
        const response = await fetch(url, {
            credentials: 'omit',
            headers: { Authorization: AUTH_HEADER },
        });
        if (!response.ok) {
            throw new Error(`Request failed (${response.status}) for ${url}`);
        }
        return await response.json();
    } finally {
        releaseRequestSlot();
    }
}

const MAX_PAGES = 200;

/**
 * This FHIR server's `Bundle.link` entries are absolute URLs pointing at its
 * internal address (e.g. `http://fhir-server:9080/fhir-server/api/v4/...`)
 * instead of the public https:// base we actually talk to -- the reverse
 * proxy doesn't rewrite them. Following a `next` link verbatim causes a
 * mixed-content block (http fetch from an https page) and would bypass the
 * proxy/auth entirely anyway. Every such link is otherwise identical to a
 * request we'd build ourselves, so swap in our own base URL and keep
 * everything from the server's fixed `/api/v4/` API root onward.
 */
function toExternalUrl(rawUrl: string): string {
    const marker = '/api/v4/';
    const markerIndex = rawUrl.indexOf(marker);
    if (markerIndex === -1) return rawUrl;
    return `${FHIR_URL}/${rawUrl.slice(markerIndex + marker.length)}`;
}

function nextPageUrl(data: any): string | undefined {
    const rawUrl = data.link?.find((link: any) => link.relation === 'next')?.url;
    return rawUrl ? toExternalUrl(rawUrl) : undefined;
}

export async function fhirFetchAllEntries(initialPath: string): Promise<any[]> {
    const entries: any[] = [];
    let url: string | undefined = `${FHIR_URL}/${initialPath}`;
    let pages = 0;

    while (url && pages < MAX_PAGES) {
        const data = await fhirFetch(url);
        entries.push(...(data.entry ?? []));
        url = nextPageUrl(data);
        pages += 1;
    }

    return entries;
}

export function deviceLabel(deviceResource: any): string {
    const type = deviceResource?.identifier?.[1]?.value ?? 'Device';
    const serial = deviceResource?.serialNumber;
    const mac = deviceResource?.identifier?.[0]?.value;
    if (serial) return `${type} (SN ${serial})`;
    if (mac) return `${type} (${mac})`;
    return type;
}

export function componentDisplayText(component: any): string | undefined {
    return component?.code?.text ?? component?.code?.coding?.[0]?.display;
}

export function codeableConceptText(concept: any): string | undefined {
    return concept?.text ?? concept?.coding?.[0]?.display ?? concept?.coding?.[0]?.code;
}

export function componentValue(component: any): string {
    if (component?.valueQuantity) {
        const { value, unit } = component.valueQuantity;
        return unit ? `${value} ${unit}` : String(value);
    }
    if (component?.valueString !== undefined) {
        return String(component.valueString);
    }
    return '--';
}

export function patientDisplayName(patient: any): string {
    const humanName = formatHumanName(patient?.name);
    if (humanName) return humanName;
    const nameExt = (patient?.extension ?? []).find((ext: any) => ext.valueString);
    return nameExt?.valueString ?? patient?.identifier?.[0]?.value ?? 'Unknown Patient';
}

export function sanitizeFilenamePart(text: string): string {
    return text.replace(/[^a-zA-Z0-9_-]+/g, '_');
}

export function calculateAge(birthDate?: string): string {
    if (!birthDate) return '--';
    const dob = new Date(birthDate);
    if (Number.isNaN(dob.getTime())) return '--';
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
    return String(age);
}

export function formatHumanName(names?: any[]): string {
    if (!names || names.length === 0) return '';
    const official = names.find((n) => n.use === 'official') ?? names[0];
    if (official.text) return official.text;
    const parts = [...(official.given ?? []), official.family].filter(Boolean);
    return parts.join(' ');
}

export function formatAddress(addresses?: any[]): string {
    if (!addresses || addresses.length === 0) return '--';
    const address = addresses[0];
    if (address.text) return address.text;
    const parts = [
        ...(address.line ?? []),
        address.city,
        address.state,
        address.postalCode,
        address.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '--';
}

export function formatTelecom(telecoms?: any[], system?: string): string {
    if (!telecoms || telecoms.length === 0) return '--';
    const match = system ? telecoms.find((t) => t.system === system) : telecoms[0];
    return match?.value ?? '--';
}

/**
 * The CapabilityStatement is static for the lifetime of the session, so it is
 * memoized as a plain module-level promise rather than a React Query entry.
 */
let capabilityStatementPromise: Promise<any> | null = null;

export function fetchCapabilityStatement(): Promise<any> {
    if (!capabilityStatementPromise) {
        capabilityStatementPromise = fhirFetch(`${FHIR_URL}/metadata`).catch((error) => {
            capabilityStatementPromise = null;
            throw error;
        });
    }
    return capabilityStatementPromise;
}

export interface PatientLinkedResourceType {
    type: string;
    param: 'patient' | 'subject';
}

/**
 * Reads the CapabilityStatement to discover every resource type the server
 * knows how to search by `patient` or `subject`, instead of relying on a
 * hardcoded resource-type list.
 */
export function getPatientLinkedResourceTypes(capability: any): PatientLinkedResourceType[] {
    const resources: any[] = capability?.rest?.[0]?.resource ?? [];
    const results: PatientLinkedResourceType[] = [];

    resources.forEach((resource) => {
        if (resource.type === 'Patient') return;
        const searchParamNames: string[] = (resource.searchParam ?? []).map((p: any) => p.name);
        if (searchParamNames.includes('patient')) {
            results.push({ type: resource.type, param: 'patient' });
        } else if (searchParamNames.includes('subject')) {
            results.push({ type: resource.type, param: 'subject' });
        }
    });

    return results;
}

/**
 * Fetches the full $everything compartment bundle for a patient, following
 * pagination links. This is the primary, most-complete source of a
 * patient's data on servers that support the operation (confirmed working
 * against this LinuxForHealth/IBM FHIR server).
 */
export async function fetchPatientEverything(patientId: string): Promise<any[]> {
    const entries: any[] = [];
    let url: string | undefined = `${FHIR_URL}/Patient/${patientId}/$everything?_count=200`;
    let pages = 0;

    while (url && pages < MAX_PAGES) {
        const data = await fhirFetch(url);
        entries.push(...(data.entry ?? []));
        url = nextPageUrl(data);
        pages += 1;
    }

    return entries;
}

export function fetchResourceTypeForPatient(
    type: string,
    param: 'patient' | 'subject',
    patientId: string,
): Promise<any[]> {
    const reference = param === 'subject' ? `Patient/${patientId}` : patientId;
    return fhirFetchAllEntries(`${type}?${param}=${reference}&_count=200`);
}

/**
 * Groups a flat list of Bundle entries by resourceType, deduplicating by
 * `resourceType/id` since $everything and the supplemental per-type sweep
 * can both return the same resource.
 */
export interface ObservationDataPoint {
    date: string;
    value: number;
    unit?: string;
}

/**
 * Pivots a list of Observation resources into per-metric time series (one
 * entry per distinct top-level code or component code), sorted oldest to
 * newest. Powers the Overview dashboard's vitals tiles and trend charts.
 */
export function extractObservationTimeSeries(observations: any[]): Record<string, ObservationDataPoint[]> {
    const series: Record<string, ObservationDataPoint[]> = {};

    const pushPoint = (name: string | undefined, date: string | undefined, value: number | undefined, unit?: string) => {
        if (!name || value === undefined || Number.isNaN(value) || !date) return;
        if (!series[name]) series[name] = [];
        series[name].push({ date, value, unit });
    };

    observations.forEach((obs) => {
        const date = obs.effectiveDateTime ?? obs.issued ?? obs.meta?.lastUpdated;
        if (obs.valueQuantity?.value !== undefined) {
            pushPoint(codeableConceptText(obs.code), date, obs.valueQuantity.value, obs.valueQuantity.unit);
        }
        (obs.component ?? []).forEach((component: any) => {
            if (component.valueQuantity?.value !== undefined) {
                pushPoint(componentDisplayText(component), date, component.valueQuantity.value, component.valueQuantity.unit);
            }
        });
    });

    Object.values(series).forEach((points) =>
        points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    );

    return series;
}

/**
 * Fetches resources of `type` scoped to an organization via a chained FHIR
 * search (e.g. `Encounter?patient.organization={id}` or, for polymorphic
 * reference fields, `Condition?subject:Patient.organization={id}` -- the
 * `:Patient` type modifier is required there and confirmed working against
 * this LinuxForHealth FHIR server). Returns resources, not bundle entries.
 */
export function fetchResourceTypeForOrganization(
    type: string,
    chainParam: string,
    organizationId: string,
): Promise<any[]> {
    return fhirFetchAllEntries(`${type}?${chainParam}=${organizationId}&_count=200`).then((entries) =>
        entries.map((entry) => entry.resource),
    );
}

export function referenceId(ref?: { reference?: string }): string | undefined {
    return ref?.reference?.split('/')?.[1];
}

export function groupEntriesByResourceType(entries: any[]): Record<string, any[]> {
    const seen = new Set<string>();
    const grouped: Record<string, any[]> = {};

    entries.forEach((entry) => {
        const resource = entry?.resource ?? entry;
        if (!resource?.resourceType) return;
        const key = `${resource.resourceType}/${resource.id}`;
        if (seen.has(key)) return;
        seen.add(key);
        if (!grouped[resource.resourceType]) grouped[resource.resourceType] = [];
        grouped[resource.resourceType].push(resource);
    });

    return grouped;
}
