import React from 'react';
import { Alert, Box, Skeleton, Stack } from '@mui/material';

interface CardGridSkeletonProps {
    count?: number;
    height?: number;
    width?: number;
}

export const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({ count = 6, height = 140, width = 260 }) => (
    <Box sx={{ p: 2 }}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
            {Array.from({ length: count }).map((_, index) => (
                <Skeleton key={index} variant="rounded" width={width} height={height} sx={{ borderRadius: '16px' }} />
            ))}
        </Stack>
    </Box>
);

export const SectionSkeleton: React.FC = () => (
    <Stack spacing={1.5} sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: '10px' }} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '10px' }} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '10px' }} />
    </Stack>
);

export const ErrorView: React.FC<{ message: string }> = ({ message }) => (
    <Box sx={{ p: 2 }}>
        <Alert severity="error">{message}</Alert>
    </Box>
);

export const EmptyView: React.FC<{ message: string }> = ({ message }) => (
    <Box sx={{ p: 2 }}>
        <Alert severity="info">{message}</Alert>
    </Box>
);
