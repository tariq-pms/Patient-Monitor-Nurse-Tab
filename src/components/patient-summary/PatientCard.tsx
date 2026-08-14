import React from 'react';
import { Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { calculateAge, formatTelecom, patientDisplayName } from '../../utils/fhir';

interface PatientCardProps {
    darkTheme: boolean;
    patient: any;
    onClick: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ darkTheme, patient, onClick }) => {
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const mutedColor = darkTheme ? '#AEAEAE' : '#6B7A8F';
    const surfaceColor = darkTheme ? '#1E1E1E' : '#FFFFFF';
    const borderColor = darkTheme ? '#333' : '#E3E8EF';

    const name = patientDisplayName(patient);
    const phone = formatTelecom(patient.telecom, 'phone');
    const lastUpdated = patient.meta?.lastUpdated ? new Date(patient.meta.lastUpdated).toLocaleString() : '--';

    return (
        <Paper
            onClick={onClick}
            elevation={0}
            sx={{
                p: 2.5,
                cursor: 'pointer',
                backgroundColor: surfaceColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '18px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: '#01AEEE',
                    boxShadow: darkTheme ? '0 8px 20px rgba(1, 174, 238, 0.15)' : '0 8px 20px rgba(18, 77, 129, 0.12)',
                },
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Avatar sx={{ bgcolor: darkTheme ? '#01AEEE33' : '#124D8115', color: '#01AEEE', width: 44, height: 44 }}>
                    <PersonRoundedIcon />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" noWrap title={name} sx={{ color: textColor, fontWeight: 700, lineHeight: 1.2 }}>
                        {name}
                    </Typography>
                    <Typography variant="caption" noWrap title={patient.id} sx={{ color: mutedColor }}>
                        ID: {patient.identifier?.[0]?.value ?? patient.id}
                    </Typography>
                </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                <Chip size="small" label={`Gender: ${patient.gender ?? '--'}`} sx={{ backgroundColor: darkTheme ? '#2A2A2A' : '#F0F2F5',color:'#124D81' }} />
                <Chip size="small" label={`Age: ${calculateAge(patient.birthDate)}`} sx={{ backgroundColor: darkTheme ? '#2A2A2A' : '#F0F2F5',color:'#124D81' }} />
            </Stack>

            <Stack spacing={0.25}>
                <Typography variant="caption" sx={{ color: mutedColor }}>
                    DOB: {patient.birthDate ?? '--'}
                </Typography>
                <Typography variant="caption" sx={{ color: mutedColor }}>
                    Phone: {phone}
                </Typography>
                <Typography variant="caption" sx={{ color: mutedColor }}>
                    Last Updated: {lastUpdated}
                </Typography>
            </Stack>
        </Paper>
    );
};
