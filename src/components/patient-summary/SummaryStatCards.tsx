import React from 'react';
import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';

interface StatCardProps {
    darkTheme: boolean;
    label: string;
    value: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ darkTheme, label, value }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            flex: '1 1 180px',
            backgroundColor: darkTheme ? '#1E1E1E' : '#FFFFFF',
            border: `1px solid ${darkTheme ? '#333' : '#E3E8EF'}`,
            borderRadius: '14px',
        }}
    >
        <Typography variant="caption" sx={{ color: darkTheme ? '#AEAEAE' : '#6B7A8F' }}>
            {label}
        </Typography>
        <Typography variant="h5" sx={{ color: darkTheme ? '#FFFFFF' : '#124D81', fontWeight: 700 }}>
            {value}
        </Typography>
    </Paper>
);

interface SummaryStatCardsProps {
    darkTheme: boolean;
    resourceTypeCount: number;
    totalResourceCount: number;
    loadedTypeCount: number;
    totalTypeCount: number;
    isFullyLoaded: boolean;
}

export const SummaryStatCards: React.FC<SummaryStatCardsProps> = ({
    darkTheme,
    resourceTypeCount,
    totalResourceCount,
    loadedTypeCount,
    totalTypeCount,
    isFullyLoaded,
}) => {
    const progress = totalTypeCount > 0 ? Math.round((loadedTypeCount / totalTypeCount) * 100) : 0;

    return (
        <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <StatCard darkTheme={darkTheme} label="Resource Types Found" value={resourceTypeCount} />
                <StatCard darkTheme={darkTheme} label="Total Resources" value={totalResourceCount} />
                <StatCard
                    darkTheme={darkTheme}
                    label="Discovery Progress"
                    value={isFullyLoaded ? 'Complete' : `${loadedTypeCount} / ${totalTypeCount} types`}
                />
            </Stack>
            {!isFullyLoaded && (
                <Box sx={{ mt: 1.5 }}>
                    <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 4, height: 6 }} />
                    <Typography variant="caption" sx={{ color: darkTheme ? '#AEAEAE' : '#6B7A8F' }}>
                        Scanning the FHIR server for every resource type that references this patient...
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
