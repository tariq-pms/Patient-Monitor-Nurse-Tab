import React, { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { AnalyticsPanel } from './AnalyticsPanel';
import { PatientsReportPanel } from './PatientsReportPanel';

type ReportView = 'analytics' | 'patients';

interface ReportsPanelProps {
    organizationId?: string;
    darkTheme?: boolean;
}

/**
 * Administration "Reports" tab content: an Analytics/Patients toggle over
 * AnalyticsPanel and PatientsReportPanel, defaulting to Analytics. Mirrors
 * pages/patient-summary/OrgLayout's toggle, but as a local view-switch
 * rather than route navigation, since this tab isn't part of the
 * /patient-summary route tree.
 */
export const ReportsPanel: React.FC<ReportsPanelProps> = ({ organizationId, darkTheme = false }) => {
    const [view, setView] = useState<ReportView>('analytics');

    const handleChange = (_event: React.MouseEvent<HTMLElement>, next: ReportView | null) => {
        if (next) setView(next);
    };

    return (
        <Box>
           <Box
    sx={{
        px: 2,
        pt: 2,
        display: 'flex',
        justifyContent: 'flex-end',
    }}
>
    <ToggleButtonGroup
        size="small"
        exclusive
        value={view}
        onChange={handleChange}
    >
        <ToggleButton
            value="analytics"
            sx={{
                color: '#124D81',
                borderColor: '#124D81',
                textTransform: 'none',
                '&.Mui-selected': {
                    backgroundColor: '#124D81',
                    color: '#fff',
                },
                '&.Mui-selected:hover': {
                    backgroundColor: '#0f3d67',
                },
            }}
        >
            Analytics
        </ToggleButton>

        <ToggleButton
            value="patients"
            sx={{
                color: '#124D81',
                borderColor: '#124D81',
                textTransform: 'none',
                '&.Mui-selected': {
                    backgroundColor: '#124D81',
                    color: '#fff',
                },
                '&.Mui-selected:hover': {
                    backgroundColor: '#0f3d67',
                },
            }}
        >
            Patients
        </ToggleButton>
    </ToggleButtonGroup>
</Box>
            {view === 'analytics' ? (
                <AnalyticsPanel organizationId={organizationId} darkTheme={darkTheme} />
            ) : (
                <PatientsReportPanel organizationId={organizationId} darkTheme={darkTheme} />
            )}
        </Box>
    );
};
