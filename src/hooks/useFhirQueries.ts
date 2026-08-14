import { useMemo } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    FHIR_URL,
    fetchCapabilityStatement,
    fetchPatientEverything,
    fetchResourceTypeForPatient,
    fhirFetch,
    fhirFetchAllEntries,
    getPatientLinkedResourceTypes,
    groupEntriesByResourceType,
} from '../utils/fhir';

export function useOrganizations() {
    return useQuery({
        queryKey: ['organizations'],
        queryFn: async () => {
            const entries = await fhirFetchAllEntries('Organization?_count=200');
            const organizations = entries.map((entry) => entry.resource);

            return Promise.all(
                organizations.map(async (org) => {
                    let patientCount: number | null = null;
                    try {
                        const countData = await fhirFetch(
                            `${FHIR_URL}/Patient?organization=${org.id}&_summary=count`,
                        );
                        patientCount = countData.total ?? 0;
                    } catch (error) {
                        console.error(`Failed to fetch patient count for org ${org.id}:`, error);
                    }
                    return { ...org, patientCount };
                }),
            );
        },
    });
}

export function useOrganization(orgId?: string) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['organization', orgId],
        queryFn: async () => {
            const cachedOrganizations = queryClient.getQueryData<any[]>(['organizations']);
            const cached = cachedOrganizations?.find((org) => org.id === orgId);
            if (cached) return cached;
            return fhirFetch(`${FHIR_URL}/Organization/${orgId}`);
        },
        enabled: Boolean(orgId),
    });
}

export function usePatients(orgId?: string) {
    return useQuery({
        queryKey: ['patients', orgId],
        queryFn: async () => {
            const entries = await fhirFetchAllEntries(`Patient?organization=${orgId}&_count=200`);
            return entries.map((entry) => entry.resource);
        },
        enabled: Boolean(orgId),
    });
}

export function usePatient(patientId?: string) {
    return useQuery({
        queryKey: ['patient', patientId],
        queryFn: () => fhirFetch(`${FHIR_URL}/Patient/${patientId}`),
        enabled: Boolean(patientId),
    });
}

export interface PatientAllResources {
    byType: Record<string, any[]>;
    resourceTypesFound: string[];
    totalResourceCount: number;
    loadedTypeCount: number;
    totalTypeCount: number;
    isEverythingLoading: boolean;
    isFullyLoaded: boolean;
    errors: unknown[];
}

/**
 * Dynamically discovers and fetches every FHIR resource that references a
 * patient. `$everything` is used as the primary, fast source; a parallel
 * sweep of every resource type the CapabilityStatement says supports a
 * `patient`/`subject` search param fills in anything $everything missed.
 * Each supplemental query resolves independently so sections can render as
 * soon as their data is ready, rather than waiting on the slowest type.
 */
export function usePatientAllResources(patientId?: string): PatientAllResources {
    const capabilityQuery = useQuery({
        queryKey: ['fhir-capability'],
        queryFn: fetchCapabilityStatement,
        staleTime: Infinity,
    });

    const everythingQuery = useQuery({
        queryKey: ['patient-everything', patientId],
        queryFn: () => fetchPatientEverything(patientId as string),
        enabled: Boolean(patientId),
    });

    const linkedTypes = useMemo(
        () => (capabilityQuery.data ? getPatientLinkedResourceTypes(capabilityQuery.data) : []),
        [capabilityQuery.data],
    );

    const supplementalQueries = useQueries({
        queries: linkedTypes.map(({ type, param }) => ({
            queryKey: ['patient-resource', patientId, type],
            queryFn: () => fetchResourceTypeForPatient(type, param, patientId as string),
            enabled: Boolean(patientId) && Boolean(capabilityQuery.data),
        })),
    });

    const byType = useMemo(() => {
        const everythingEntries = everythingQuery.data ?? [];
        const supplementalEntries = supplementalQueries.flatMap((query) => query.data ?? []);
        return groupEntriesByResourceType([...everythingEntries, ...supplementalEntries]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [everythingQuery.data, supplementalQueries.map((q) => q.dataUpdatedAt).join(',')]);

    const resourceTypesFound = useMemo(() => Object.keys(byType).sort(), [byType]);

    const totalResourceCount = useMemo(
        () => Object.values(byType).reduce((sum, list) => sum + list.length, 0),
        [byType],
    );

    const loadedTypeCount = supplementalQueries.filter((query) => query.isSuccess || query.isError).length;
    const totalTypeCount = linkedTypes.length;
    const isFullyLoaded =
        !everythingQuery.isLoading && totalTypeCount > 0 && loadedTypeCount === totalTypeCount;

    const errors: unknown[] = supplementalQueries.filter((query) => query.error).map((query) => query.error);
    if (everythingQuery.error) errors.push(everythingQuery.error);

    return {
        byType,
        resourceTypesFound,
        totalResourceCount,
        loadedTypeCount,
        totalTypeCount,
        isEverythingLoading: everythingQuery.isLoading,
        isFullyLoaded,
        errors,
    };
}
