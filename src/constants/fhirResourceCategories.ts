export interface ResourceCategory {
    key: string;
    label: string;
    resourceTypes: string[];
}

/**
 * Presentation grouping only. It never limits which resource types get
 * fetched or displayed -- that is driven entirely by the CapabilityStatement
 * and $everything (see useFhirQueries.ts). Any discovered resourceType not
 * listed here falls into "Other".
 */
export const RESOURCE_CATEGORIES: ResourceCategory[] = [
    {
        key: 'clinical',
        label: 'Clinical',
        resourceTypes: [
            'Encounter',
            'Condition',
            'Observation',
            'AllergyIntolerance',
            'Procedure',
            'FamilyMemberHistory',
            'ClinicalImpression',
            'RiskAssessment',
            'DetectedIssue',
        ],
    },
    {
        key: 'medications',
        label: 'Medications',
        resourceTypes: [
            'MedicationRequest',
            'MedicationAdministration',
            'MedicationStatement',
            'MedicationDispense',
            'Medication',
            'Immunization',
            'ImmunizationEvaluation',
            'ImmunizationRecommendation',
        ],
    },
    {
        key: 'diagnostics',
        label: 'Diagnostics & Labs',
        resourceTypes: [
            'DiagnosticReport',
            'Specimen',
            'ImagingStudy',
            'Media',
            'BodyStructure',
            'MolecularSequence',
        ],
    },
    {
        key: 'care-coordination',
        label: 'Care Coordination',
        resourceTypes: [
            'CarePlan',
            'CareTeam',
            'Goal',
            'ServiceRequest',
            'ReferralRequest',
            'RequestGroup',
            'NutritionOrder',
            'DeviceRequest',
            'DeviceUseStatement',
            'Task',
        ],
    },
    {
        key: 'administrative',
        label: 'Administrative & Scheduling',
        resourceTypes: [
            'Appointment',
            'AppointmentResponse',
            'Schedule',
            'Slot',
            'Coverage',
            'Consent',
            'EpisodeOfCare',
            'Claim',
            'ClaimResponse',
            'ExplanationOfBenefit',
            'CoverageEligibilityRequest',
            'CoverageEligibilityResponse',
            'Device',
            'Person',
            'RelatedPerson',
        ],
    },
    {
        key: 'documents',
        label: 'Documents',
        resourceTypes: ['DocumentReference', 'DocumentManifest', 'Composition', 'Binary', 'Provenance'],
    },
];

export function getCategoryForResourceType(resourceType: string): ResourceCategory {
    const found = RESOURCE_CATEGORIES.find((category) => category.resourceTypes.includes(resourceType));
    if (found) return found;
    return { key: 'other', label: 'Other', resourceTypes: [] };
}
