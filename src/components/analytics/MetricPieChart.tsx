import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Box, Paper, Typography } from '@mui/material';
import { EmptyView } from '../patient-summary/StateViews';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ['#01AEEE', '#5B8DEF', '#E05656', '#E0A356', '#3CB371', '#8B5CF6', '#EC4899', '#F59E0B'];

interface MetricPieChartProps {
    darkTheme: boolean;
    title: string;
    data: { label: string; value: number }[];
    height?: number;
}

export const MetricPieChart: React.FC<MetricPieChartProps> = ({ darkTheme, title, data, height = 260 }) => {
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';

    const chartData = useMemo(
        () => ({
            labels: data.map((d) => d.label),
            datasets: [
                {
                    data: data.map((d) => d.value),
                    backgroundColor: data.map((_, index) => PALETTE[index % PALETTE.length]),
                    borderWidth: 0,
                },
            ],
        }),
        [data],
    );

    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right' as const,
                    labels: { color: darkTheme ? '#AEAEAE' : '#6B7A8F', boxWidth: 12, padding: 12 },
                },
            },
        }),
        [darkTheme],
    );

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                flex: '1 1 340px',
                minWidth: 0,
                backgroundColor: darkTheme ? '#1E1E1E' : '#FFFFFF',
                border: `1px solid ${darkTheme ? '#333' : '#E3E8EF'}`,
                borderRadius: '14px',
            }}
        >
            <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 700, mb: 1.5 }}>
                {title}
            </Typography>
            {data.length === 0 ? (
                <EmptyView message="No data for the current filters." />
            ) : (
                <Box sx={{ height }}>
                    <Doughnut data={chartData} options={options} />
                </Box>
            )}
        </Paper>
    );
};
