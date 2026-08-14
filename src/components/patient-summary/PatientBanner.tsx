import React from 'react';
import { Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { calculateAge, formatTelecom, patientDisplayName } from '../../utils/fhir';

interface PatientBannerProps {
    darkTheme: boolean;
    patient: any;
    organizationName?: string;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({ darkTheme, patient, organizationName }) => {
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const mutedColor = darkTheme ? '#AEAEAE' : '#6B7A8F';
    const surfaceColor = darkTheme ? '#1E1E1E' : '#FFFFFF';
    const borderColor = darkTheme ? '#333' : '#E3E8EF';

    const name = patientDisplayName(patient);
    const phone = formatTelecom(patient.telecom, 'phone');

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                mb: 2,
                backgroundColor: surfaceColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '18px',
            }}
        >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Avatar sx={{ bgcolor: darkTheme ? '#01AEEE33' : '#124D8115', color: '#01AEEE', width: 64, height: 64 }}>
                    <PersonRoundedIcon sx={{ fontSize: '2rem' }} />
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ color: textColor, fontWeight: 700 }}>
                        {name}
                    </Typography>
                    {organizationName && (
                        <Typography variant="caption" sx={{ color: mutedColor }}>
                            {organizationName}
                        </Typography>
                    )}
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                        <Chip size="small" label={`ID: ${patient.identifier?.[0]?.value ?? patient.id}`} />
                        <Chip size="small" label={`Gender: ${patient.gender ?? '--'}`} />
                        <Chip size="small" label={`DOB: ${patient.birthDate ?? '--'}`} />
                        <Chip size="small" label={`Age: ${calculateAge(patient.birthDate)}`} />
                        <Chip size="small" label={`Phone: ${phone}`} />
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
};
