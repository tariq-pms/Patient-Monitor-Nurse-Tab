import React, { useMemo, useState } from 'react';
import {
    Box,
    MenuItem,
    Pagination,
    Select,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../hooks/useFhirQueries';
import { PatientCard } from './PatientCard';
import { CardGridSkeleton, EmptyView, ErrorView } from './StateViews';
import { patientDisplayName } from '../../utils/fhir';

interface PatientsReportPanelProps {
    /** FHIR Organization id to list patients for. No fetch happens until this is set. */
    organizationId?: string;
    darkTheme?: boolean;
}

type SortKey = 'name' | 'lastUpdated';
type GenderFilter = 'all' | 'male' | 'female';

const PAGE_SIZE = 12;

/**
 * Patient list for the Administration "Reports" tab -- same search/gender
 * filter/sort/pagination behavior as pages/patient-summary/PatientListPage,
 * but taking organizationId/darkTheme as plain props instead of reading
 * orgId from the URL (useParams) and theme from useOutletContext, since
 * this tab isn't part of the /patient-summary route tree those rely on.
 * Clicking a card navigates into that full /patient-summary route tree,
 * which is where the resource-category tabs and vitals charts live. The
 * Patients/Analytics toggle lives one level up, in ReportsPanel.
 */
export const PatientsReportPanel: React.FC<PatientsReportPanelProps> = ({ organizationId, darkTheme = false }) => {
    const { data: patients, isLoading, isError, error } = usePatients(organizationId);
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const filteredAndSorted = useMemo(() => {
        if (!patients) return [];
        const query = search.trim().toLowerCase();
        let result = patients.filter((patient: any) => {
            if (genderFilter !== 'all' && (patient.gender ?? 'unknown') !== genderFilter) return false;
            if (!query) return true;
            const name = patientDisplayName(patient).toLowerCase();
            const id = String(patient.identifier?.[0]?.value ?? patient.id ?? '').toLowerCase();
            return name.includes(query) || id.includes(query);
        });

        result = [...result].sort((a, b) => {
            if (sortKey === 'name') {
                return patientDisplayName(a).localeCompare(patientDisplayName(b));
            }
            const aDate = new Date(a.meta?.lastUpdated ?? 0).getTime();
            const bDate = new Date(b.meta?.lastUpdated ?? 0).getTime();
            return bDate - aDate;
        });

        return result;
    }, [patients, search, genderFilter, sortKey]);

    const pageCount = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
    const safePage = Math.min(page, pageCount);
    const pageItems = filteredAndSorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    if (!organizationId) {
        return <EmptyView message="No organization is associated with this account, so the patient list can't be loaded." />;
    }
    if (isLoading) return <CardGridSkeleton />;
    if (isError) return <ErrorView message={String((error as Error)?.message ?? error)} />;

    return (
        <Box sx={{ p: 2 }}>
        

            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <TextField size="small"
                    placeholder="Search by patient name..."
                    value={search}
                    onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                    InputProps={{ startAdornment: <SearchIcon sx={{ color: '#124D81', mr: 1, fontSize: '1.2rem' }} /> }}
                    sx={{
                        minWidth: 260,
                        '& .MuiOutlinedInput-root': {
                            color: '#124D81',
                            '& fieldset': { borderColor: '#124D81' },
                            '&:hover fieldset': { borderColor: '#124D81' },
                            '&.Mui-focused fieldset': { borderColor: '#124D81' },
                        },
                        '& .MuiInputBase-input::placeholder': { color: '#124D81', opacity: 1 },
                    }}/>
                <Select
                    size="small"
                    value={genderFilter}
                    onChange={(event) => { setGenderFilter(event.target.value as GenderFilter); setPage(1); }}
                    sx={{
                        minWidth: 160,
                        color: '#124D81',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#124D81' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#124D81' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#124D81' },
                        '& .MuiSvgIcon-root': { color: '#124D81' },
                    }}
                >
                    <MenuItem value="all">All Genders</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                </Select>
                <ToggleButtonGroup size="small" exclusive value={sortKey} onChange={(_e, value) => value && setSortKey(value)}>
                    <ToggleButton
                        value="name"
                        sx={{
                            color: '#124D81',
                            borderColor: '#124D81',
                            '&.Mui-selected': { backgroundColor: '#124D81', color: '#fff' },
                            '&.Mui-selected:hover': { backgroundColor: '#0f3d67' },
                        }}
                    >
                        Sort by Name
                    </ToggleButton>
                    <ToggleButton
                        value="lastUpdated"
                        sx={{
                            color: '#124D81',
                            borderColor: '#124D81',
                            '&.Mui-selected': { backgroundColor: '#124D81', color: '#fff' },
                            '&.Mui-selected:hover': { backgroundColor: '#0f3d67' },
                        }}
                    >
                        Sort by Last Updated
                    </ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            {!patients || patients.length === 0 ? (
                <EmptyView message="No patients found for this organization." />
            ) : filteredAndSorted.length === 0 ? (
                <EmptyView message="No patients match your filters." />
            ) : (
                <>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {pageItems.map((patient: any) => (
                            <PatientCard
                                key={patient.id}
                                darkTheme={darkTheme}
                                patient={patient}
                                onClick={() => navigate(`/patient-summary/org/${organizationId}/patient/${patient.id}`)}
                            />
                        ))}
                    </Box>
                    {pageCount > 1 && (
                        <Stack alignItems="center">
                            <Pagination
                                count={pageCount}
                                page={safePage}
                                onChange={(_e, value) => setPage(value)}
                                sx={{
                                    '& .MuiPaginationItem-root': { color: '#124D81', borderColor: '#124D81' },
                                    '& .MuiPaginationItem-root:hover': { backgroundColor: '#E8F1F8' },
                                    '& .Mui-selected': { backgroundColor: '#124D81 !important', color: '#fff' },
                                    '& .Mui-selected:hover': { backgroundColor: '#0F3D67 !important' },
                                }}
                            />
                        </Stack>
                    )}
                </>
            )}
        </Box>
    );
};
