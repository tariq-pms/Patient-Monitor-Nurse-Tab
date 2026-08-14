import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Paper, Typography } from '@mui/material';
import { EmptyView } from '../patient-summary/StateViews';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface MetricBarChartProps {
    darkTheme: boolean;
    title: string;
    data: { label: string; value: number }[];
    color?: string;
    height?: number;
}

export const MetricBarChart: React.FC<MetricBarChartProps> = ({ darkTheme, title, data, color = '#01AEEE', height = 260 }) => {
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const mutedColor = darkTheme ? '#AEAEAE' : '#6B7A8F';
    const gridColor = darkTheme ? '#333333' : '#E3E8EF';

    const chartData = useMemo(
        () => ({
            labels: data.map((d) => d.label),
            datasets: [
                {
                    label: title,
                    data: data.map((d) => d.value),
                    backgroundColor: color,
                    borderRadius: 4,
                },
            ],
        }),
        [data, title, color],
    );

    const options = useMemo(
        () => ({
            indexAxis: 'y' as const,
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: mutedColor, precision: 0 }, grid: { color: gridColor } },
                y: { ticks: { color: mutedColor }, grid: { display: false } },
            },
        }),
        [mutedColor, gridColor],
    );

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                flex: '1 1 380px',
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
                    <Bar data={chartData} options={options} />
                </Box>
            )}
        </Paper>
    );
};
