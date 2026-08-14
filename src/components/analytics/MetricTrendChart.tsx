import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Paper, Typography } from '@mui/material';
import { EmptyView } from '../patient-summary/StateViews';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export interface TrendSeries {
    name: string;
    color: string;
    data: { label: string; value: number }[];
}

interface MetricTrendChartProps {
    darkTheme: boolean;
    title: string;
    series: TrendSeries[];
    height?: number;
}

export const MetricTrendChart: React.FC<MetricTrendChartProps> = ({ darkTheme, title, series, height = 260 }) => {
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const mutedColor = darkTheme ? '#AEAEAE' : '#6B7A8F';
    const gridColor = darkTheme ? '#333333' : '#E3E8EF';

    const labels = useMemo(() => {
        const all = new Set<string>();
        series.forEach((s) => s.data.forEach((point) => all.add(point.label)));
        return Array.from(all).sort();
    }, [series]);

    const hasData = labels.length > 0;

    const chartData = useMemo(
        () => ({
            labels,
            datasets: series.map((s) => {
                const byLabel = new Map(s.data.map((point) => [point.label, point.value]));
                return {
                    label: s.name,
                    data: labels.map((label) => byLabel.get(label) ?? 0),
                    borderColor: s.color,
                    backgroundColor: `${s.color}26`,
                    pointRadius: 2.5,
                    tension: 0.3,
                    fill: series.length === 1,
                };
            }),
        }),
        [labels, series],
    );

    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: series.length > 1, labels: { color: mutedColor } },
            },
            scales: {
                x: { ticks: { color: mutedColor, maxTicksLimit: 8 }, grid: { color: gridColor } },
                y: { ticks: { color: mutedColor, precision: 0 }, grid: { color: gridColor } },
            },
        }),
        [mutedColor, gridColor, series.length],
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
            {!hasData ? (
                <EmptyView message="No data for the current filters." />
            ) : (
                <Box sx={{ height }}>
                    <Line data={chartData} options={options} />
                </Box>
            )}
        </Paper>
    );
};
