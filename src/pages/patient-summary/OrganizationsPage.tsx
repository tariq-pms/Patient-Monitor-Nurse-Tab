import React, { useMemo, useState } from 'react';
import { Box, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useOrganizations } from '../../hooks/useFhirQueries';
import { OrganizationCard } from '../../components/patient-summary/OrganizationCard';
import { CardGridSkeleton, EmptyView, ErrorView } from '../../components/patient-summary/StateViews';
import type { PatientSummaryOutletContext } from './PatientSummaryLayout';

export const OrganizationsPage: React.FC = () => {
    const { darkTheme } = useOutletContext<PatientSummaryOutletContext>();
    const navigate = useNavigate();
    const { data: organizations, isLoading, isError, error } = useOrganizations();
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!organizations) return [];
        const query = search.trim().toLowerCase();
        if (!query) return organizations;
        return organizations.filter(
            (org: any) => (org.name ?? '').toLowerCase().includes(query) || org.id.toLowerCase().includes(query),
        );
    }, [organizations, search]);

    const textColor = darkTheme ? '#FFFFFF' : '#124D81';

    if (isLoading) return <CardGridSkeleton />;
    if (isError) return <ErrorView message={String((error as Error)?.message ?? error)} />;

    return (
        <Box sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: textColor, fontWeight: 700 }}>
                    Select an Organization
                </Typography>
                <TextField
                    size="small"
                    placeholder="Search organizations..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    InputProps={{ startAdornment: <SearchIcon sx={{ color: '#124D81', mr: 1, fontSize: '1.2rem' }} /> }}
                    sx={{
                        minWidth: 260,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '25px',
                            color: darkTheme ? '#FFFFFF' : '#1E1E1E',
                            backgroundColor: darkTheme ? '#1E1E1E' : '#FFFFFF',
                        },
                    }}
                />
            </Stack>

            {!organizations || organizations.length === 0 ? (
                <EmptyView message="No organizations found." />
            ) : filtered.length === 0 ? (
                <EmptyView message="No organizations match your search." />
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 2,
                    }}
                >
                    {filtered.map((org: any) => (
                        <OrganizationCard
                            key={org.id}
                            darkTheme={darkTheme}
                            organization={org}
                            onClick={() => navigate(`/patient-summary/org/${org.id}`)}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};
