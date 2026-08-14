import { useQueries } from '@tanstack/react-query';
import { fetchResourceTypeForOrganization } from '../utils/fhir';
import { usePatients } from './useFhirQueries';

interface AnalyticsResourceConfig {
    key: string;
    type: string;
    chainParam: string;
}

const ANALYTICS_RESOURCE_TYPES: AnalyticsResourceConfig[] = [
    { key: 'encounters', type: 'Encounter', chainParam: 'patient.organization' },
    { key: 'conditions', type: 'Condition', chainParam: 'subject:Patient.organization' },
    { key: 'medicationRequests', type: 'MedicationRequest', chainParam: 'subject:Patient.organization' },
    { key: 'medicationStatements', type: 'MedicationStatement', chainParam: 'subject:Patient.organization' },
    { key: 'procedures', type: 'Procedure', chainParam: 'subject:Patient.organization' },
    { key: 'allergies', type: 'AllergyIntolerance', chainParam: 'patient.organization' },
    { key: 'diagnosticReports', type: 'DiagnosticReport', chainParam: 'patient.organization' },
    { key: 'observations', type: 'Observation', chainParam: 'patient.organization' },
];

export interface OrganizationAnalyticsData {
    patients: any[];
    encounters: any[];
    conditions: any[];
    medications: any[];
    procedures: any[];
    allergies: any[];
    labReports: any[];
    observations: any[];
    isLoading: boolean;
    isError: boolean;
    errors: unknown[];
}

/**
 * Fetches every collection the Analytics Dashboard needs for one
 * organization, in parallel, via organization-chained FHIR searches
 * (confirmed working against this LinuxForHealth server -- see
 * fetchResourceTypeForOrganization). All filters (date range, condition,
 * demographics) are applied client-side over this single snapshot, so
 * changing a filter never triggers a refetch.
 */
export function useOrganizationAnalyticsData(orgId?: string): OrganizationAnalyticsData {
    const patientsQuery = usePatients(orgId);

    const queries = useQueries({
        queries: ANALYTICS_RESOURCE_TYPES.map((config) => ({
            queryKey: ['analytics', config.key, orgId],
            queryFn: () => fetchResourceTypeForOrganization(config.type, config.chainParam, orgId as string),
            enabled: Boolean(orgId),
        })),
    });

    const byKey = Object.fromEntries(ANALYTICS_RESOURCE_TYPES.map((config, index) => [config.key, queries[index]]));

    const isLoading = patientsQuery.isLoading || queries.some((q) => q.isLoading);
    const isError = patientsQuery.isError || queries.some((q) => q.isError);
    const errors: unknown[] = queries.filter((q) => q.error).map((q) => q.error);
    if (patientsQuery.error) errors.push(patientsQuery.error);

    return {
        patients: patientsQuery.data ?? [],
        encounters: byKey.encounters.data ?? [],
        conditions: byKey.conditions.data ?? [],
        medications: [...(byKey.medicationRequests.data ?? []), ...(byKey.medicationStatements.data ?? [])],
        procedures: byKey.procedures.data ?? [],
        allergies: byKey.allergies.data ?? [],
        labReports: byKey.diagnosticReports.data ?? [],
        observations: byKey.observations.data ?? [],
        isLoading,
        isError,
        errors,
    };
}
