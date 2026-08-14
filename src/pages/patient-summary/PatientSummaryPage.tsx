import React, { useMemo, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { useOutletContext, useParams } from 'react-router-dom';
import { useOrganization, usePatient, usePatientAllResources } from '../../hooks/useFhirQueries';
import { PatientBanner } from '../../components/patient-summary/PatientBanner';
import { SummaryStatCards } from '../../components/patient-summary/SummaryStatCards';
import { SearchWithinPatient } from '../../components/patient-summary/SearchWithinPatient';
import { ResourceCategoryTabs } from '../../components/patient-summary/ResourceCategoryTabs';
import { SectionSkeleton, ErrorView } from '../../components/patient-summary/StateViews';
import type { PatientSummaryOutletContext } from './PatientSummaryLayout';

export const PatientSummaryPage: React.FC = () => {
    const { darkTheme } = useOutletContext<PatientSummaryOutletContext>();
    const { orgId, patientId } = useParams();
    const { data: patient, isLoading: patientLoading, isError, error } = usePatient(patientId);
    const { data: organization } = useOrganization(orgId);
    const {
        byType,
        resourceTypesFound,
        totalResourceCount,
        loadedTypeCount,
        totalTypeCount,
        isFullyLoaded,
    } = usePatientAllResources(patientId);

    const [search, setSearch] = useState('');

    const filteredByType = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return byType;
        const result: Record<string, any[]> = {};
        Object.entries(byType).forEach(([resourceType, resources]) => {
            const matches = resources.filter((resource) => JSON.stringify(resource).toLowerCase().includes(query));
            if (matches.length > 0) result[resourceType] = matches;
        });
        return result;
    }, [byType, search]);

    if (patientLoading) return <SectionSkeleton />;
    if (isError) return <ErrorView message={String((error as Error)?.message ?? error)} />;
    if (!patient) return null;

    return (
        <Box sx={{ p: 2 }}>
            <PatientBanner darkTheme={darkTheme} patient={patient} organizationName={organization?.name} />

            <SummaryStatCards
                darkTheme={darkTheme}
                resourceTypeCount={resourceTypesFound.length}
                totalResourceCount={totalResourceCount}
                loadedTypeCount={loadedTypeCount}
                totalTypeCount={totalTypeCount}
                isFullyLoaded={isFullyLoaded}
            />

            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                <SearchWithinPatient darkTheme={darkTheme} value={search} onChange={setSearch} />
            </Stack>

            <ResourceCategoryTabs
                darkTheme={darkTheme}
                byType={filteredByType}
                patient={patient}
                organizationName={organization?.name}
            />
        </Box>
    );
};
