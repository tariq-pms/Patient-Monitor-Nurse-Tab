import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

interface WidgetCardProps {
    darkTheme: boolean;
    title: string;
    icon?: React.ReactNode;
    accentColor?: string;
    count?: number;
    children: React.ReactNode;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({ darkTheme, title, icon, accentColor = '#01AEEE', count, children }) => {
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const surfaceColor = darkTheme ? '#1E1E1E' : '#FFFFFF';
    const borderColor = darkTheme ? '#333' : '#E3E8EF';

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                flex: '1 1 260px',
                minWidth: 0,
                backgroundColor: surfaceColor,
                border: `1px solid ${borderColor}`,
                borderTop: `3px solid ${accentColor}`,
                borderRadius: '14px',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
                {icon && <Box sx={{ color: accentColor, display: 'flex' }}>{icon}</Box>}
                <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 700, flexGrow: 1 }}>
                    {title}
                </Typography>
                {count !== undefined && (
                    <Typography variant="caption" sx={{ color: accentColor, fontWeight: 700 }}>
                        {count}
                    </Typography>
                )}
            </Stack>
            {children}
        </Paper>
    );
};
