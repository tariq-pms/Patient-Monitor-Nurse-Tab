import React from 'react';
import { Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import { formatAddress, formatTelecom } from '../../utils/fhir';

interface OrganizationCardProps {
    darkTheme: boolean;
    organization: any;
    onClick: () => void;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({ darkTheme, organization, onClick }) => {
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const mutedColor = darkTheme ? '#AEAEAE' : '#6B7A8F';
    const surfaceColor = darkTheme ? '#1E1E1E' : '#FFFFFF';
    const borderColor = darkTheme ? '#333' : '#E3E8EF';

    const address = formatAddress(organization.address);
    const phone = formatTelecom(organization.telecom, 'phone');
    const email = formatTelecom(organization.telecom, 'email');

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
                    <ApartmentRoundedIcon />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" noWrap title={organization.name} sx={{ color: textColor, fontWeight: 700, lineHeight: 1.2 }}>
                        {organization.name ?? organization.id}
                    </Typography>
                    {/* <Typography variant="caption" noWrap title={organization.id} sx={{ color: mutedColor }}>
                        ID: {organization.id}
                    </Typography> */}
                </Box>
            </Stack>

            <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                    <PlaceRoundedIcon sx={{ fontSize: '1rem', color: mutedColor, mt: '2px' }} />
                    <Typography variant="body2" sx={{ color: mutedColor }}>
                        {address}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                    <PhoneRoundedIcon sx={{ fontSize: '1rem', color: mutedColor, mt: '2px' }} />
                    <Typography variant="body2" sx={{ color: mutedColor }}>
                        {phone !== '--' ? phone : email}
                    </Typography>
                </Stack>
            </Stack>

            <Chip
                size="small"
                icon={<PeopleAltRoundedIcon sx={{ fontSize: '1rem !important' }} />}
                label={organization.patientCount === null ? 'Patients: --' : `${organization.patientCount} Patient${organization.patientCount === 1 ? '' : 's'}`}
                sx={{
                    backgroundColor: darkTheme ? '#01AEEE22' : '#124D8112',
                    color: darkTheme ? '#7FD8FF' : '#124D81',
                    fontWeight: 600,
                }}
            />

            <Typography variant="caption" sx={{ color: mutedColor, display: 'block', mt: 1.5 }}>
                Last Updated: {organization.meta?.lastUpdated ? new Date(organization.meta.lastUpdated).toLocaleString() : '--'}
            </Typography>
        </Paper>
    );
};
