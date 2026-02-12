import React from 'react';
import { Box, Typography, Chip, Stack, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LinkIcon from '@mui/icons-material/Link';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AssignmentIcon from '@mui/icons-material/Assignment';

export type TaskType = 'Medication' | 'Vitals' | 'Assessment';
export type TaskStatus = 'Urgent' | 'Missed' | 'Pending';

export interface TaskItemProps {
    type: TaskType;
    title: string;
    status: TaskStatus;
    details: {
        label: string;
        value: string;
    }[];
    timeLabel: string; // e.g., "ADMINISTER AT", "UPDATE BY"
    timeValue: string;
}

const getIcon = (type: TaskType) => {
    switch (type) {
        case 'Medication':
            return <LinkIcon sx={{ color: '#F44336' }} />; // Reddish icon
        case 'Vitals':
            return <MonitorHeartIcon sx={{ color: '#F44336' }} />;
        case 'Assessment':
            return <AssignmentIcon sx={{ color: '#2196F3' }} />; // Blueish icon
        default:
            return <AssignmentIcon />;
    }
};

const getIconBgColor = (type: TaskType) => {
    switch (type) {
        case 'Medication':
        case 'Vitals':
            return '#FFEBEE'; // Light red background
        case 'Assessment':
            return '#E3F2FD'; // Light blue background
        default:
            return '#f5f5f5';
    }
};

const getStatusColor = (status: TaskStatus) => {
    switch (status) {
        case 'Urgent':
            return { bg: '#FFF3E0', color: '#FF9800' }; // Orange
        case 'Missed':
            return { bg: '#FFEBEE', color: '#F44336' }; // Red
        case 'Pending':
            return { bg: '#E3F2FD', color: '#2196F3' }; // Blue
        default:
            return { bg: '#f5f5f5', color: '#757575' };
    }
};

export const TaskItem: React.FC<TaskItemProps> = ({ type, title, status, details, timeLabel, timeValue }) => {
    const statusStyle = getStatusColor(status);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                padding: 2,
                borderBottom: '1px solid #f0f0f0',
                '&:last-child': {
                    borderBottom: 'none',
                },
            }}
        >
            {/* Icon */}
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: getIconBgColor(type),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 2,
                }}
            >
                {getIcon(type)}
            </Box>

            {/* Main Content */}
            <Stack direction="row" flex={1} alignItems="center" spacing={4}>
                {/* Title and Status */}
                <Box sx={{ minWidth: 200 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#333' }}>
                        {title}
                    </Typography>
                    <Chip
                        label={status}
                        size="small"
                        sx={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            fontWeight: 'bold',
                            height: 20,
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                        }}
                    />
                </Box>

                {/* Details Columns */}
                {details.map((detail, index) => (
                    <Box key={index} sx={{ minWidth: 100 }}>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: 0.5 }}>
                            {detail.label}
                        </Typography>
                        <Typography variant="body2" fontWeight="500" color="#333">
                            {detail.value}
                        </Typography>
                    </Box>
                ))}

                {/* Time Column */}
                <Box sx={{ minWidth: 100 }}>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', marginBottom: 0.5 }}>
                        {timeLabel}
                    </Typography>
                    <Typography variant="body2" fontWeight="500" color={status === 'Missed' ? '#F44336' : '#333'}>
                        {timeValue}
                    </Typography>
                </Box>
            </Stack>

            {/* Action Icon */}
            <IconButton size="small">
                <ChevronRightIcon sx={{ color: '#ccc' }} />
            </IconButton>
        </Box>
    );
};
