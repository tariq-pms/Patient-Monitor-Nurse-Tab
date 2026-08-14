import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Outlet, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import type { PatientSummaryOutletContext } from './PatientSummaryLayout';

type OrgView = 'patients' | 'analytics';

export const OrgLayout: React.FC = () => {
    const { darkTheme } = useOutletContext<PatientSummaryOutletContext>();
    const { orgId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const view: OrgView = location.pathname.endsWith('/analytics') ? 'analytics' : 'patients';

    const handleChange = (_event: React.MouseEvent<HTMLElement>, next: OrgView | null) => {
        if (!next || next === view) return;
        // "Patients" goes back to the Administration Reports tab, not to the
        // generic /patient-summary/org/:orgId list -- that page is otherwise
        // unused now that the Reports tab has its own patient list.
        navigate(next === 'analytics' ? `/patient-summary/org/${orgId}/analytics` : '/administration');
    };

    return (
        <Box sx={{ px: 2, pt: 2 }}>
            <ToggleButtonGroup size="small" exclusive value={view} onChange={handleChange} sx={{ mb: 1 }}>
                <ToggleButton
                    value="patients"
                    sx={{
                        color: '#124D81',
                        borderColor: '#124D81',
                        textTransform: 'none',
                        '&.Mui-selected': { backgroundColor: '#124D81', color: '#fff' },
                        '&.Mui-selected:hover': { backgroundColor: '#0f3d67' },
                    }}
                >
                    Patients
                </ToggleButton>
                <ToggleButton
                    value="analytics"
                    sx={{
                        color: '#124D81',
                        borderColor: '#124D81',
                        textTransform: 'none',
                        '&.Mui-selected': { backgroundColor: '#124D81', color: '#fff' },
                        '&.Mui-selected:hover': { backgroundColor: '#0f3d67' },
                    }}
                >
                    Analytics
                </ToggleButton>
            </ToggleButtonGroup>
            <Box sx={{ mx: -2 }}>
                <Outlet context={{ darkTheme } satisfies PatientSummaryOutletContext} />
            </Box>
        </Box>
    );
};
