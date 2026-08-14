import React from 'react';
import { Paper, Typography } from '@mui/material';

interface KpiTileProps {
    darkTheme: boolean;
    label: string;
    value: React.ReactNode;
    accentColor?: string;
}

export const KpiTile: React.FC<KpiTileProps> = ({ darkTheme, label, value, accentColor = '#01AEEE' }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2, flex: '1 1 180px', minWidth: 0,
            backgroundColor: darkTheme ? '#1E1E1E' : '#FFFFFF',
            border: `1px solid ${darkTheme ? '#333' : '#E3E8EF'}`,
            borderTop: `3px solid ${accentColor}`,
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

