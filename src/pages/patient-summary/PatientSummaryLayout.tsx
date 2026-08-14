import React from 'react';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useOrganization, usePatient } from '../../hooks/useFhirQueries';
import { patientDisplayName } from '../../utils/fhir';

interface PatientSummaryLayoutProps {
    darkTheme: boolean;
}

export interface PatientSummaryOutletContext {
    darkTheme: boolean;
}

export const PatientSummaryLayout: React.FC<PatientSummaryLayoutProps> = ({ darkTheme }) => {
    const navigate = useNavigate();
    const { orgId, patientId } = useParams();
    const { data: organization } = useOrganization(orgId);
    const { data: patient } = usePatient(patientId);

    const textColor = darkTheme ? '#FFFFFF' : '#124D81';

    // No "Organizations" root crumb here -- this app scopes every admin to a
    // single organization (resolved from the Auth0 token), so there is no
    // multi-org picker to link back to. Every entry point into this section
    // is the Administration "Reports" tab, so every non-final crumb leads
    // back there rather than to the generic (and otherwise unused)
    // /patient-summary/org/:orgId patient list.
    const items: { label: string; onClick?: () => void }[] = [
        { label: 'Reports', onClick: () => navigate('/administration') },
    ];
    if (orgId) {
        items.push({
            label: organization?.name ?? orgId,
            onClick: patientId ? () => navigate('/administration') : undefined,
        });
    }
    if (patientId) {
        items.push({ label: patient ? patientDisplayName(patient) : patientId });
    }

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: darkTheme ? '#121212' : '#F9F9F9' }}>
            <Breadcrumbs sx={{ px: 2, py: 1.5 }}>
                {items.map((item, index) =>
                    index === items.length - 1 || !item.onClick ? (
                        <Typography key={item.label} sx={{ color: textColor, fontWeight: 'bold' }}>
                            {item.label}
                        </Typography>
                    ) : (
                        <Link key={item.label} component="button" underline="hover" sx={{ color: textColor }} onClick={item.onClick}>
                            {item.label}
                        </Link>
                    ),
                )}
            </Breadcrumbs>
            <Outlet context={{ darkTheme } satisfies PatientSummaryOutletContext} />
        </Box>
    );
};
