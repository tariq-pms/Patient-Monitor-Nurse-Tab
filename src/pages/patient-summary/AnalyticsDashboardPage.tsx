import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { AnalyticsPanel } from '../../components/patient-summary/AnalyticsPanel';
import type { PatientSummaryOutletContext } from './PatientSummaryLayout';

export const AnalyticsDashboardPage: React.FC = () => {
    const { darkTheme } = useOutletContext<PatientSummaryOutletContext>();
    const { orgId } = useParams();
    return <AnalyticsPanel organizationId={orgId} darkTheme={darkTheme} />;
};
