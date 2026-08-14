import React, { useMemo } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import { codeableConceptText, extractObservationTimeSeries } from '../../utils/fhir';
import { WidgetCard } from './WidgetCard';
import { VitalsTrendChart } from './VitalsTrendChart';
import { EmptyView } from './StateViews';

interface OverviewSectionProps {
    darkTheme: boolean;
    byType: Record<string, any[]>;
}

function toDisplayDate(value?: string): string {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
}

function isActiveStatus(status?: string): boolean {
    if (!status) return true;
    return ['active', 'confirmed', 'in-progress'].includes(status.toLowerCase());
}

const CRITICALITY_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    low: 'success',
    high: 'error',
    'unable-to-assess': 'warning',
};

interface EmptyRowProps {
    mutedColor: string;
}

const EmptyRow: React.FC<EmptyRowProps> = ({ mutedColor }) => (
    <Typography variant="body2" sx={{ color: mutedColor, fontStyle: 'italic' }}>
        None recorded
    </Typography>
);

export const OverviewSection: React.FC<OverviewSectionProps> = ({ darkTheme, byType }) => {
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const mutedColor = darkTheme ? '#AEAEAE' : '#6B7A8F';

    const conditions = useMemo(() => {
        const list = byType['Condition'] ?? [];
        return [...list].sort((a, b) => {
            const aDate = new Date(a.onsetDateTime ?? a.recordedDate ?? 0).getTime();
            const bDate = new Date(b.onsetDateTime ?? b.recordedDate ?? 0).getTime();
            return bDate - aDate;
        });
    }, [byType]);

    const medications = useMemo(() => {
        const list = [...(byType['MedicationRequest'] ?? []), ...(byType['MedicationStatement'] ?? [])];
        return list.sort((a, b) => {
            const aDate = new Date(a.authoredOn ?? a.effectiveDateTime ?? 0).getTime();
            const bDate = new Date(b.authoredOn ?? b.effectiveDateTime ?? 0).getTime();
            return bDate - aDate;
        });
    }, [byType]);

    const allergies = byType['AllergyIntolerance'] ?? [];

    const vitalsSeries = useMemo(() => extractObservationTimeSeries(byType['Observation'] ?? []), [byType]);

    const latestVitals = useMemo(
        () =>
            Object.entries(vitalsSeries)
                .map(([name, points]) => ({ name, latest: points[points.length - 1] }))
                .slice(0, 8),
        [vitalsSeries],
    );

    const trendCharts = useMemo(
        () =>
            Object.entries(vitalsSeries)
                .filter(([, points]) => points.length >= 2)
                .sort(([, a], [, b]) => b.length - a.length)
                .slice(0, 6),
        [vitalsSeries],
    );

    const hasAnyData = conditions.length > 0 || medications.length > 0 || allergies.length > 0 || latestVitals.length > 0;

    if (!hasAnyData) {
        return <EmptyView message="No clinical data found for this patient yet." />;
    }

    return (
        <Box>
            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <WidgetCard darkTheme={darkTheme} title="Active Conditions" icon={<FavoriteRoundedIcon />} accentColor="#E05656" count={conditions.length}>
                    <Stack spacing={1}>
                        {conditions.length === 0 ? (
                            <EmptyRow mutedColor={mutedColor} />
                        ) : (
                            conditions.slice(0, 5).map((condition) => (
                                <Stack key={condition.id} direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                    <Typography variant="body2" noWrap sx={{ color: textColor, flexGrow: 1 }}>
                                        {codeableConceptText(condition.code) ?? 'Condition'}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={codeableConceptText(condition.clinicalStatus) ?? 'unknown'}
                                        color={isActiveStatus(codeableConceptText(condition.clinicalStatus)) ? 'error' : 'default'}
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                </Stack>
                            ))
                        )}
                    </Stack>
                </WidgetCard>

                <WidgetCard darkTheme={darkTheme} title="Current Medications" icon={<MedicationRoundedIcon />} accentColor="#5B8DEF" count={medications.length}>
                    <Stack spacing={1}>
                        {medications.length === 0 ? (
                            <EmptyRow mutedColor={mutedColor} />
                        ) : (
                            medications.slice(0, 5).map((medication) => (
                                <Stack key={medication.id} direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                    <Typography variant="body2" noWrap sx={{ color: textColor, flexGrow: 1 }}>
                                        {codeableConceptText(medication.medicationCodeableConcept) ??
                                            medication.medicationReference?.display ??
                                            'Medication'}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={medication.status ?? 'unknown'}
                                        color={isActiveStatus(medication.status) ? 'success' : 'default'}
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                </Stack>
                            ))
                        )}
                    </Stack>
                </WidgetCard>

                <WidgetCard darkTheme={darkTheme} title="Allergies & Intolerances" icon={<WarningAmberRoundedIcon />} accentColor="#E0A356" count={allergies.length}>
                    <Stack spacing={1}>
                        {allergies.length === 0 ? (
                            <EmptyRow mutedColor={mutedColor} />
                        ) : (
                            allergies.slice(0, 5).map((allergy: any) => (
                                <Stack key={allergy.id} direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                    <Typography variant="body2" noWrap sx={{ color: textColor, flexGrow: 1 }}>
                                        {codeableConceptText(allergy.code) ?? 'Allergy'}
                                    </Typography>
                                    {allergy.criticality && (
                                        <Chip
                                            size="small"
                                            label={allergy.criticality}
                                            color={CRITICALITY_COLOR[allergy.criticality] ?? 'default'}
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    )}
                                </Stack>
                            ))
                        )}
                    </Stack>
                </WidgetCard>

                <WidgetCard darkTheme={darkTheme} title="Latest Vitals" icon={<MonitorHeartRoundedIcon />} accentColor="#3CB371" count={latestVitals.length}>
                    <Stack spacing={1}>
                        {latestVitals.length === 0 ? (
                            <EmptyRow mutedColor={mutedColor} />
                        ) : (
                            latestVitals.map(({ name, latest }) => (
                                <Stack key={name} direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                    <Typography variant="body2" noWrap sx={{ color: textColor, flexGrow: 1 }}>
                                        {name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: mutedColor, whiteSpace: 'nowrap' }}>
                                        {latest.value}
                                        {latest.unit ? ` ${latest.unit}` : ''} · {toDisplayDate(latest.date)}
                                    </Typography>
                                </Stack>
                            ))
                        )}
                    </Stack>
                </WidgetCard>
            </Stack>

            {trendCharts.length > 0 && (
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <ShowChartRoundedIcon sx={{ color: '#01AEEE' }} />
                        <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 700 }}>
                            Vitals & Labs Trends
                        </Typography>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={2}>
                        {trendCharts.map(([name, points]) => (
                            <VitalsTrendChart key={name} darkTheme={darkTheme} metricName={name} points={points} />
                        ))}
                    </Stack>
                </Box>
            )}
        </Box>
    );
};
