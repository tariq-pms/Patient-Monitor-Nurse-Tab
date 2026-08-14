import React from 'react';
import { Button, MenuItem, Select, Stack } from '@mui/material';

export interface AnalyticsFilterState {
    dateFrom: string;
    dateTo: string;
    condition: string;
    gender: string;
    gestationalBucket: string;
}

export const DEFAULT_ANALYTICS_FILTERS: AnalyticsFilterState = {
    dateFrom: '',
    dateTo: '',
    condition: 'all',
    gender: 'all',
    gestationalBucket: 'all',
};

interface AnalyticsFiltersProps {
    darkTheme: boolean;
    filters: AnalyticsFilterState;
    onChange: (filters: AnalyticsFilterState) => void;
    conditionOptions: string[];
    gestationalBucketOptions: string[];
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
    darkTheme,
    filters,
    onChange,
    conditionOptions,
    gestationalBucketOptions,
}) => {
    const set = (patch: Partial<AnalyticsFilterState>) => onChange({ ...filters, ...patch });
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';

    return (
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {/* <TextField
                size="small"
                type="date"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={filters.dateFrom}
                onChange={(event) => set({ dateFrom: event.target.value })}
                sx={{ minWidth: 160, '& .MuiInputBase-input': { color: textColor ,border:'1px solid #124D81'} }}
            />
            <TextField
                size="small"
                type="date"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={filters.dateTo}
                onChange={(event) => set({ dateTo: event.target.value })}
                sx={{ minWidth: 160, '& .MuiInputBase-input': { color: textColor,border:'1px solid #124D81' } }}
            /> */}
            <Select
                size="small"
                value={filters.condition}
                onChange={(event) => set({ condition: event.target.value })}
                sx={{ minWidth: 200,color:textColor,border:'1px solid #124D81'  }}
            >
                <MenuItem value="all">All Conditions</MenuItem>
                {conditionOptions.map((condition) => (
                    <MenuItem key={condition} value={condition}>
                        {condition}
                    </MenuItem>
                ))}
            </Select>
            <Select
                size="small"
                value={filters.gender}
                onChange={(event) => set({ gender: event.target.value })}
                sx={{ minWidth: 150,color:textColor,border:'1px solid #124D81' }}
            >
                <MenuItem value="all">All Genders</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
                <MenuItem value="unknown">Unknown</MenuItem>
            </Select>
            <Select
                size="small"
                value={filters.gestationalBucket}
                onChange={(event) => set({ gestationalBucket: event.target.value })}
                sx={{ minWidth: 200,color:textColor,border:'1px solid #124D81'  }}
            >
                <MenuItem value="all">All Gestational Ages</MenuItem>
                {gestationalBucketOptions.map((bucket) => (
                    <MenuItem key={bucket} value={bucket}>
                        {bucket}
                    </MenuItem>
                ))}
            </Select>
            <Button size="small" onClick={() => onChange(DEFAULT_ANALYTICS_FILTERS)} sx={{ textTransform: 'none' }}>
                Reset Filters
            </Button>
        </Stack>
    );
};
