import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Paper, Typography } from '@mui/material';
import type { ObservationDataPoint } from '../../utils/fhir';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface VitalsTrendChartProps {
    darkTheme: boolean;
    metricName: string;
    points: ObservationDataPoint[];
}

export const VitalsTrendChart: React.FC<VitalsTrendChartProps> = ({ darkTheme, metricName, points }) => {
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const mutedColor = darkTheme ? '#AEAEAE' : '#6B7A8F';
    const gridColor = darkTheme ? '#333333' : '#E3E8EF';

    const unit = points.find((p) => p.unit)?.unit;
    const latest = points[points.length - 1];

    const data = useMemo(
        () => ({
            labels: points.map((p) => new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
            datasets: [
                {
                    label: metricName,
                    data: points.map((p) => p.value),
                    borderColor: '#01AEEE',
                    backgroundColor: 'rgba(1, 174, 238, 0.15)',
                    pointRadius: 2.5,
                    tension: 0.3,
                    fill: true,
                },
            ],
        }),
        [points, metricName],
    );

    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: mutedColor, maxTicksLimit: 6 }, grid: { color: gridColor } },
                y: { ticks: { color: mutedColor }, grid: { color: gridColor } },
            },
        }),
        [mutedColor, gridColor],
    );

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                flex: '1 1 320px',
                minWidth: 0,
                backgroundColor: darkTheme ? '#1E1E1E' : '#FFFFFF',
                border: `1px solid ${darkTheme ? '#333' : '#E3E8EF'}`,
                borderRadius: '14px',
            }}
        >
            <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 700 }}>
                {metricName}
            </Typography>
            <Typography variant="caption" sx={{ color: mutedColor, display: 'block', mb: 1 }}>
                Latest: {latest.value}
                {unit ? ` ${unit}` : ''} on {new Date(latest.date).toLocaleString()}
            </Typography>
            <Box sx={{ height: 180 }}>
                <Line data={data} options={options} />
            </Box>
        </Paper>
    );
};
