import React from 'react';
import { Box, Typography, Paper, Collapse } from '@mui/material';
import { TaskItem, TaskItemProps } from './TaskItem';

interface PatientTaskGroupProps {
    patientName: string;
    patientId: string;
    weight: string;
    weightDiff: string;
    tasks: TaskItemProps[];
}

export const PatientTaskGroup: React.FC<PatientTaskGroupProps> = ({
    patientName,
    patientId,
    weight,
    weightDiff,
    tasks
}) => {
    const [open, setOpen] = React.useState(true);

    return (
        <Paper
            elevation={0}
            sx={{
                marginBottom: 3,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
        >
            {/* Header */}
            <Box
                onClick={() => setOpen(!open)}
                sx={{
                    backgroundColor: '#2e86de', // Use primary color or match design #1976d2 // Using a slightly lighter blue to match the provided image
                    padding: '12px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: 'white',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                        B/O {patientName}
                    </Typography>
                    <Box
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            padding: '2px 8px',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.9 }}>
                            {patientId}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* <MonitorWeightIcon sx={{ fontSize: 18, opacity: 0.8 }} /> */}
                        <Typography variant="body2" fontWeight="500">
                            {weight}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            • {weightDiff}
                        </Typography>
                    </Box>

                </Box>
            </Box>

            {/* Body */}
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ backgroundColor: 'white' }}>
                    {tasks.map((task, index) => (
                        <TaskItem key={index} {...task} />
                    ))}
                </Box>
            </Collapse>
        </Paper>
    );
};
