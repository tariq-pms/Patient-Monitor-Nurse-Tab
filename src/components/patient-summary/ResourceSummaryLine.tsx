import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    Stack,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { codeableConceptText, formatHumanName } from '../../utils/fhir';
import { FhirValueTree } from './FhirValueTree';
import { RawJsonPanel } from './RawJsonPanel';

interface Headline {
    title: string;
    subtitle?: string;
    status?: string;
}

function toDisplayDate(value?: string): string | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

/**
 * Per-resourceType "headline" formatting for the resources named in the
 * spec. Anything not covered here falls through to a generic default so the
 * app is never limited to this list -- unknown types simply show their id
 * and rely on the FhirValueTree / raw JSON below for the details.
 */
function getHeadline(resourceType: string, resource: any): Headline {
    switch (resourceType) {
        case 'Observation': {
            const value = resource.valueQuantity
                ? `${resource.valueQuantity.value}${resource.valueQuantity.unit ? ` ${resource.valueQuantity.unit}` : ''}`
                : resource.valueString ??
                  codeableConceptText(resource.valueCodeableConcept) ??
                  (resource.component?.length ? `${resource.component.length} component(s)` : undefined);
            const date = toDisplayDate(resource.effectiveDateTime ?? resource.issued ?? resource.meta?.lastUpdated);
            return {
                title: codeableConceptText(resource.code) ?? 'Observation',
                subtitle: [value, date].filter(Boolean).join(' · '),
                status: resource.status,
            };
        }
        case 'Condition': {
            const clinicalStatus = codeableConceptText(resource.clinicalStatus);
            const onset = toDisplayDate(resource.onsetDateTime ?? resource.recordedDate);
            return {
                title: codeableConceptText(resource.code) ?? 'Condition',
                subtitle: onset ? `Onset ${onset}` : undefined,
                status: clinicalStatus,
            };
        }
        case 'AllergyIntolerance': {
            return {
                title: codeableConceptText(resource.code) ?? 'Allergy / Intolerance',
                subtitle: resource.criticality ? `Criticality: ${resource.criticality}` : undefined,
                status: codeableConceptText(resource.clinicalStatus),
            };
        }
        case 'MedicationRequest':
        case 'MedicationAdministration':
        case 'MedicationStatement':
        case 'MedicationDispense': {
            const medication =
                codeableConceptText(resource.medicationCodeableConcept) ?? resource.medicationReference?.display ?? 'Medication';
            const date = toDisplayDate(resource.authoredOn ?? resource.effectiveDateTime ?? resource.dateAsserted);
            return { title: medication, subtitle: date, status: resource.status };
        }
        case 'Procedure': {
            const date = toDisplayDate(resource.performedDateTime ?? resource.performedPeriod?.start);
            return { title: codeableConceptText(resource.code) ?? 'Procedure', subtitle: date, status: resource.status };
        }
        case 'DiagnosticReport': {
            const date = toDisplayDate(resource.effectiveDateTime ?? resource.issued);
            return { title: codeableConceptText(resource.code) ?? 'Diagnostic Report', subtitle: date, status: resource.status };
        }
        case 'Encounter': {
            const type =
                codeableConceptText(resource.type?.[0]) ?? resource.class?.display ?? resource.class?.code ?? 'Encounter';
            return { title: type, subtitle: toDisplayDate(resource.period?.start), status: resource.status };
        }
        case 'Immunization': {
            return {
                title: codeableConceptText(resource.vaccineCode) ?? 'Immunization',
                subtitle: toDisplayDate(resource.occurrenceDateTime),
                status: resource.status,
            };
        }
        case 'CarePlan':
        case 'CareTeam':
        case 'Goal':
        case 'ServiceRequest':
        case 'RequestGroup':
        case 'Task': {
            const title =
                resource.title ?? codeableConceptText(resource.code) ?? resource.description?.text ?? resource.description ?? resourceType;
            return { title, status: resource.status };
        }
        case 'DocumentReference':
        case 'DocumentManifest': {
            const title = resource.description ?? codeableConceptText(resource.type) ?? 'Document';
            return { title, subtitle: toDisplayDate(resource.date ?? resource.created), status: resource.status ?? resource.docStatus };
        }
        case 'Appointment': {
            const title = resource.description ?? codeableConceptText(resource.serviceType?.[0]) ?? 'Appointment';
            return { title, subtitle: toDisplayDate(resource.start), status: resource.status };
        }
        case 'Practitioner':
        case 'RelatedPerson':
        case 'Person': {
            return { title: formatHumanName(resource.name) || resource.id, status: resource.active === false ? 'inactive' : undefined };
        }
        case 'Coverage': {
            return {
                title: codeableConceptText(resource.type) ?? 'Coverage',
                subtitle: resource.payor?.[0]?.display,
                status: resource.status,
            };
        }
        case 'FamilyMemberHistory': {
            return {
                title: codeableConceptText(resource.relationship) ?? 'Family Member',
                subtitle: resource.name,
                status: resource.status,
            };
        }
        case 'Device': {
            return {
                title: resource.deviceName?.[0]?.name ?? codeableConceptText(resource.type) ?? 'Device',
                status: resource.status,
            };
        }
        case 'Specimen': {
            return { title: codeableConceptText(resource.type) ?? 'Specimen', status: resource.status };
        }
        case 'ImagingStudy': {
            return {
                title: resource.description ?? `${resource.modality?.[0]?.code ?? 'Imaging'} study`,
                status: resource.status,
            };
        }
        case 'Provenance': {
            return {
                title: resource.activity?.coding?.[0]?.display ?? 'Provenance record',
                subtitle: toDisplayDate(resource.recorded),
            };
        }
        default: {
            const title =
                codeableConceptText(resource.code) ??
                resource.title ??
                codeableConceptText(resource.type) ??
                `${resourceType} ${resource.id ?? ''}`.trim();
            return { title, status: resource.status };
        }
    }
}

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    active: 'success',
    completed: 'success',
    final: 'success',
    confirmed: 'success',
    'in-progress': 'warning',
    preliminary: 'warning',
    inactive: 'default',
    cancelled: 'error',
    'entered-in-error': 'error',
    stopped: 'error',
    error: 'error',
};

interface ResourceSummaryLineProps {
    darkTheme: boolean;
    resourceType: string;
    resource: any;
}

export const ResourceSummaryLine: React.FC<ResourceSummaryLineProps> = ({ darkTheme, resourceType, resource }) => {
    const headline = getHeadline(resourceType, resource);
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const mutedColor = darkTheme ? '#AEAEAE' : '#6B7A8F';
    const statusColor = headline.status ? STATUS_COLOR[headline.status] ?? 'default' : undefined;

    const detailEntries = Object.entries(resource).filter(
        ([key]) => !['resourceType', 'id', 'meta', 'text'].includes(key),
    );

    return (
        <Accordion
            elevation={0}
            sx={{
                backgroundColor: darkTheme ? '#1E1E1E' : '#FFFFFF',
                border: `1px solid ${darkTheme ? '#333' : '#E3E8EF'}`,
                borderRadius: '12px !important',
                mb: 1,
                '&:before': { opacity: 0 },
            }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: textColor }} />}>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ width: '100%' }}>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 700 }}>
                            {headline.title}
                        </Typography>
                        {headline.subtitle && (
                            <Typography variant="caption" sx={{ color: mutedColor }}>
                                {headline.subtitle}
                            </Typography>
                        )}
                    </Box>
                    {headline.status && (
                        <Chip size="small" label={headline.status} color={statusColor} sx={{ textTransform: 'capitalize' }} />
                    )}
                    <Typography variant="caption" sx={{ color: mutedColor }}>
                        ID: {resource.id}
                    </Typography>
                </Stack>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={0.75} sx={{ mb: 1 }}>
                    {detailEntries.map(([key, nested]) => (
                        <Box key={key}>
                            <Typography
                                variant="caption"
                                sx={{ color: mutedColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}
                            >
                                {key}
                            </Typography>
                            <FhirValueTree darkTheme={darkTheme} value={nested} depth={1} />
                        </Box>
                    ))}
                </Stack>
                <RawJsonPanel darkTheme={darkTheme} data={resource} />
            </AccordionDetails>
        </Accordion>
    );
};
