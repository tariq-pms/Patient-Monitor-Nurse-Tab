import React, { useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useOrganizationAnalyticsData } from '../../hooks/useAnalyticsQueries';
import { codeableConceptText, extractObservationTimeSeries, referenceId } from '../../utils/fhir';
import {
    BIRTH_WEIGHT_BUCKET_LABELS,
    GESTATIONAL_AGE_BUCKET_LABELS,
    LENGTH_OF_STAY_BUCKET_LABELS,
    averageByMetric,
    bucketBirthWeight,
    bucketGestationalAge,
    bucketLengthOfStay,
    computeAbnormalObservationRate,
    computeLengthOfStayDays,
    computeReadmissionRate,
    getEncounterClassLabel,
    getParticipantLabel,
    getPatientBirthWeightGrams,
    getPatientGestationalAgeWeeks,
    getPatientNationality,
    getPerformerLabel,
    groupCountBy,
    isDateInRange,
    monthlyAverageSeries,
    sortedMonthlyEntries,
    toMonthLabel,
    topEntries,
} from '../../utils/analytics';
import { AnalyticsFilters, DEFAULT_ANALYTICS_FILTERS, type AnalyticsFilterState } from '../analytics/AnalyticsFilters';
import { KpiTile } from '../analytics/KpiTile';
import { MetricBarChart } from '../analytics/MetricBarChart';
import { MetricPieChart } from '../analytics/MetricPieChart';
import { MetricTrendChart } from '../analytics/MetricTrendChart';
import { SectionSkeleton, ErrorView, EmptyView } from './StateViews';

function isActiveClinicalStatus(status?: string): boolean {
    return (status ?? '').toLowerCase() === 'active';
}

interface AnalyticsPanelProps {
    organizationId?: string;
    darkTheme?: boolean;
}

/**
 * The Analytics Dashboard's content, factored out of
 * pages/patient-summary/AnalyticsDashboardPage so it can be reused both
 * there (reading orgId/darkTheme from the URL and outlet context) and in
 * the Administration "Reports" tab (reading them as plain props instead).
 */
export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ organizationId, darkTheme = false }) => {
    const {
        patients,
        encounters,
        conditions,
        medications,
        procedures,
        allergies,
        labReports,
        observations,
        isLoading,
        isError,
        errors,
    } = useOrganizationAnalyticsData(organizationId);

    const [filters, setFilters] = useState<AnalyticsFilterState>(DEFAULT_ANALYTICS_FILTERS);

    const conditionOptions = useMemo(
        () =>
            Array.from(new Set(conditions.map((c) => codeableConceptText(c.code)).filter(Boolean) as string[])).sort(),
        [conditions],
    );

    const eligiblePatientIds = useMemo(() => {
        const conditionMatchIds =
            filters.condition === 'all'
                ? null
                : new Set(
                      conditions
                          .filter((c) => codeableConceptText(c.code) === filters.condition)
                          .map((c) => referenceId(c.subject ?? c.patient))
                          .filter(Boolean),
                  );

        return new Set(
            patients
                .filter((patient: any) => {
                    if (filters.gender !== 'all' && (patient.gender ?? 'unknown') !== filters.gender) return false;
                    if (filters.gestationalBucket !== 'all') {
                        const bucket = bucketGestationalAge(getPatientGestationalAgeWeeks(patient));
                        if (bucket !== filters.gestationalBucket) return false;
                    }
                    if (conditionMatchIds && !conditionMatchIds.has(patient.id)) return false;
                    return true;
                })
                .map((patient: any) => patient.id),
        );
    }, [patients, conditions, filters.gender, filters.gestationalBucket, filters.condition]);

    const eligiblePatients = useMemo(
        () => patients.filter((patient: any) => eligiblePatientIds.has(patient.id)),
        [patients, eligiblePatientIds],
    );

    const belongsToDate = (resource: any, dateStr: string | undefined) =>
        eligiblePatientIds.has(referenceId(resource.subject ?? resource.patient)) &&
        isDateInRange(dateStr, filters.dateFrom, filters.dateTo);

    const filteredEncounters = useMemo(
        () => encounters.filter((e: any) => belongsToDate(e, e.period?.start)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [encounters, eligiblePatientIds, filters.dateFrom, filters.dateTo],
    );
    const filteredConditions = useMemo(
        () => conditions.filter((c: any) => belongsToDate(c, c.recordedDate ?? c.onsetDateTime)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [conditions, eligiblePatientIds, filters.dateFrom, filters.dateTo],
    );
    const filteredMedications = useMemo(
        () => medications.filter((m: any) => belongsToDate(m, m.authoredOn ?? m.effectiveDateTime ?? m.dateAsserted)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [medications, eligiblePatientIds, filters.dateFrom, filters.dateTo],
    );
    const filteredProcedures = useMemo(
        () => procedures.filter((p: any) => belongsToDate(p, p.performedDateTime ?? p.performedPeriod?.start)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [procedures, eligiblePatientIds, filters.dateFrom, filters.dateTo],
    );
    const filteredAllergies = useMemo(
        () => allergies.filter((a: any) => belongsToDate(a, a.recordedDate)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [allergies, eligiblePatientIds, filters.dateFrom, filters.dateTo],
    );
    const filteredLabReports = useMemo(
        () => labReports.filter((r: any) => belongsToDate(r, r.effectiveDateTime ?? r.issued)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [labReports, eligiblePatientIds, filters.dateFrom, filters.dateTo],
    );
    const filteredObservations = useMemo(
        () => observations.filter((o: any) => belongsToDate(o, o.effectiveDateTime ?? o.issued ?? o.meta?.lastUpdated)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [observations, eligiblePatientIds, filters.dateFrom, filters.dateTo],
    );

    const kpis = useMemo(() => {
        const stays = filteredEncounters.map(computeLengthOfStayDays).filter((v): v is number => v !== null);
        const avgStay = stays.length > 0 ? stays.reduce((sum, v) => sum + v, 0) / stays.length : null;
        const currentlyAdmitted = filteredEncounters.filter((e: any) => !e.period?.end || e.status === 'in-progress').length;
        const activeConditions = filteredConditions.filter((c: any) => isActiveClinicalStatus(codeableConceptText(c.clinicalStatus))).length;
        const readmissionRate = computeReadmissionRate(filteredEncounters, (e: any) => referenceId(e.subject ?? e.patient));
        const abnormalVitalsRate = computeAbnormalObservationRate(filteredObservations);

        return {
            totalPatients: eligiblePatients.length,
            totalEncounters: filteredEncounters.length,
            avgStay: avgStay !== null ? avgStay.toFixed(1) : '--',
            currentlyAdmitted,
            activeConditions,
            totalMedications: filteredMedications.length,
            totalLabReports: filteredLabReports.length,
            readmissionRate: readmissionRate !== null ? `${readmissionRate.toFixed(1)}%` : '--',
            abnormalVitalsRate: abnormalVitalsRate !== null ? `${abnormalVitalsRate.toFixed(1)}%` : '--',
        };
    }, [eligiblePatients, filteredEncounters, filteredConditions, filteredMedications, filteredLabReports, filteredObservations]);

    const gestationalDistribution = useMemo(() => {
        const counts = groupCountBy(eligiblePatients, (patient: any) => bucketGestationalAge(getPatientGestationalAgeWeeks(patient)));
        return GESTATIONAL_AGE_BUCKET_LABELS.map((label) => ({ label, value: counts[label] ?? 0 })).filter(
            (entry) => entry.value > 0,
        );
    }, [eligiblePatients]);

    const birthWeightDistribution = useMemo(() => {
        const counts = groupCountBy(eligiblePatients, (patient: any) => bucketBirthWeight(getPatientBirthWeightGrams(patient)));
        return BIRTH_WEIGHT_BUCKET_LABELS.map((label) => ({ label, value: counts[label] ?? 0 })).filter(
            (entry) => entry.value > 0,
        );
    }, [eligiblePatients]);

    const genderDistribution = useMemo(
        () => topEntries(groupCountBy(eligiblePatients, (patient: any) => patient.gender ?? 'unknown'), 10),
        [eligiblePatients],
    );

    const lengthOfStayDistribution = useMemo(() => {
        const stayBuckets = filteredEncounters
            .map(computeLengthOfStayDays)
            .filter((v): v is number => v !== null)
            .map(bucketLengthOfStay);
        return topEntries(groupCountBy(stayBuckets, (bucket) => bucket), 10).sort(
            (a, b) => LENGTH_OF_STAY_BUCKET_LABELS.indexOf(a.label) - LENGTH_OF_STAY_BUCKET_LABELS.indexOf(b.label),
        );
    }, [filteredEncounters]);

    const allergyBreakdown = useMemo(
        () => topEntries(groupCountBy(filteredAllergies, (a: any) => codeableConceptText(a.code)), 10),
        [filteredAllergies],
    );

    const conditionBreakdown = useMemo(
        () => topEntries(groupCountBy(filteredConditions, (c: any) => codeableConceptText(c.code)), 10),
        [filteredConditions],
    );

    const diagnosisOutcomes = useMemo(
        () => topEntries(groupCountBy(filteredConditions, (c: any) => codeableConceptText(c.clinicalStatus) ?? 'unknown'), 10),
        [filteredConditions],
    );

    const medicationBreakdown = useMemo(
        () =>
            topEntries(
                groupCountBy(
                    filteredMedications,
                    (m: any) => codeableConceptText(m.medicationCodeableConcept) ?? m.medicationReference?.display,
                ),
                10,
            ),
        [filteredMedications],
    );

    const medicationTrend = useMemo(
        () =>
            sortedMonthlyEntries(
                groupCountBy(filteredMedications, (m: any) => toMonthLabel(m.authoredOn ?? m.effectiveDateTime ?? m.dateAsserted) ?? undefined),
            ),
        [filteredMedications],
    );

    const admissionTrend = useMemo(
        () => sortedMonthlyEntries(groupCountBy(filteredEncounters, (e: any) => toMonthLabel(e.period?.start) ?? undefined)),
        [filteredEncounters],
    );
    const dischargeTrend = useMemo(
        () =>
            sortedMonthlyEntries(
                groupCountBy(
                    filteredEncounters.filter((e: any) => e.period?.end),
                    (e: any) => toMonthLabel(e.period?.end) ?? undefined,
                ),
            ),
        [filteredEncounters],
    );

    const procedureBreakdown = useMemo(
        () => topEntries(groupCountBy(filteredProcedures, (p: any) => codeableConceptText(p.code)), 10),
        [filteredProcedures],
    );
    const procedureTrend = useMemo(
        () =>
            sortedMonthlyEntries(
                groupCountBy(filteredProcedures, (p: any) => toMonthLabel(p.performedDateTime ?? p.performedPeriod?.start) ?? undefined),
            ),
        [filteredProcedures],
    );

    const encounterTypeBreakdown = useMemo(
        () => topEntries(groupCountBy(filteredEncounters, (e: any) => getEncounterClassLabel(e) ?? 'Unknown'), 10),
        [filteredEncounters],
    );

    const nationalityBreakdown = useMemo(
        () => topEntries(groupCountBy(eligiblePatients, (patient: any) => getPatientNationality(patient) ?? 'Unknown'), 10),
        [eligiblePatients],
    );

    const practitionerWorkload = useMemo(() => {
        const participantLabels = filteredEncounters.flatMap((e: any) => (e.participant ?? []).map(getParticipantLabel));
        const performerLabels = filteredProcedures.flatMap((p: any) => (p.performer ?? []).map(getPerformerLabel));
        return topEntries(groupCountBy([...participantLabels, ...performerLabels], (label) => label), 10);
    }, [filteredEncounters, filteredProcedures]);

    const labReportTypeBreakdown = useMemo(
        () => topEntries(groupCountBy(filteredLabReports, (r: any) => codeableConceptText(r.code)), 10),
        [filteredLabReports],
    );
    const labReportStatusBreakdown = useMemo(
        () => topEntries(groupCountBy(filteredLabReports, (r: any) => r.status ?? 'unknown'), 10),
        [filteredLabReports],
    );
    const labReportTrend = useMemo(
        () =>
            sortedMonthlyEntries(
                groupCountBy(filteredLabReports, (r: any) => toMonthLabel(r.effectiveDateTime ?? r.issued) ?? undefined),
            ),
        [filteredLabReports],
    );

    const vitalsSeries = useMemo(() => extractObservationTimeSeries(filteredObservations), [filteredObservations]);
    const averageVitals = useMemo(() => averageByMetric(vitalsSeries, 6), [vitalsSeries]);
    const topVitalsTrends = useMemo(
        () =>
            Object.entries(vitalsSeries)
                .sort(([, a], [, b]) => b.length - a.length)
                .slice(0, 3)
                .map(([metric, points]) => ({ metric, data: monthlyAverageSeries(points) })),
        [vitalsSeries],
    );

    const textColor = darkTheme ? '#FFFFFF' : '#124D81';

    if (!organizationId) {
        return <EmptyView message="No organization is associated with this account, so analytics can't be loaded." />;
    }
    if (isLoading) return <SectionSkeleton />;
    if (isError) return <ErrorView message={String((errors[0] as Error)?.message ?? errors[0] ?? 'Failed to load analytics')} />;
    if (patients.length === 0) return <EmptyView message="No patients found for this organization." />;

    return (
        <Box sx={{ p: 2 }}>
            {/* <Typography variant="h6" sx={{ color: textColor, fontWeight: 700, mb: 2 }}>
                Analytics
            </Typography> */}

            <AnalyticsFilters
                darkTheme={darkTheme}
                filters={filters}
                onChange={setFilters}
                conditionOptions={conditionOptions}
                gestationalBucketOptions={GESTATIONAL_AGE_BUCKET_LABELS}
            />

            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <KpiTile darkTheme={darkTheme} label="Total Patients" value={kpis.totalPatients} accentColor="#01AEEE" />
                <KpiTile darkTheme={darkTheme} label="Total Encounters" value={kpis.totalEncounters} accentColor="#5B8DEF" />
                <KpiTile darkTheme={darkTheme} label="Avg Length of Stay (days)" value={kpis.avgStay} accentColor="#3CB371" />
                <KpiTile darkTheme={darkTheme} label="Active Conditions" value={kpis.activeConditions} accentColor="#E05656" />
                <KpiTile darkTheme={darkTheme} label="Total Medications" value={kpis.totalMedications} accentColor="#8B5CF6" />
                <KpiTile darkTheme={darkTheme} label="Total Lab Reports" value={kpis.totalLabReports} accentColor="#EC4899" />
                <KpiTile darkTheme={darkTheme} label="Readmission Rate" value={kpis.readmissionRate} accentColor="#F59E0B" />
                <KpiTile darkTheme={darkTheme} label="Abnormal Vitals Rate" value={kpis.abnormalVitalsRate} accentColor="#E05656" />
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <MetricBarChart darkTheme={darkTheme} title="Gestational Age Distribution" data={gestationalDistribution} color="#01AEEE" />
                <MetricBarChart darkTheme={darkTheme} title="Birth Weight Distribution" data={birthWeightDistribution} color="#8B5CF6" />
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <MetricPieChart darkTheme={darkTheme} title="Patient Demographics (Gender)" data={genderDistribution} />
                <MetricBarChart darkTheme={darkTheme} title="Length of Stay Distribution" data={lengthOfStayDistribution} color="#3CB371" />
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <MetricPieChart darkTheme={darkTheme} title="Nationality Breakdown" data={nationalityBreakdown} />
                <MetricPieChart darkTheme={darkTheme} title="Encounter Type Breakdown" data={encounterTypeBreakdown} />
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <MetricBarChart darkTheme={darkTheme} title="Condition / Diagnosis Breakdown" data={conditionBreakdown} color="#E05656" />
                <MetricPieChart darkTheme={darkTheme} title="Diagnosis Outcomes (Clinical Status)" data={diagnosisOutcomes} />
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <MetricBarChart darkTheme={darkTheme} title="Practitioner / Care Team Workload (Top 10)" data={practitionerWorkload} color="#5B8DEF" />
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <MetricBarChart darkTheme={darkTheme} title="Allergy Breakdown (Top 10)" data={allergyBreakdown} color="#E0A356" />
                <MetricBarChart darkTheme={darkTheme} title="Medication Usage (Top 10)" data={medicationBreakdown} color="#5B8DEF" />
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <MetricTrendChart
                    darkTheme={darkTheme}
                    title="Medication Trend (per month)"
                    series={[{ name: 'Medications', color: '#5B8DEF', data: medicationTrend }]}
                />
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <MetricTrendChart
                    darkTheme={darkTheme}
                    title="Admission & Discharge Statistics"
                    series={[
                        { name: 'Admissions', color: '#01AEEE', data: admissionTrend },
                        { name: 'Discharges', color: '#E0A356', data: dischargeTrend },
                    ]}
                />
                <MetricBarChart darkTheme={darkTheme} title="Treatment / Procedure Breakdown (Top 10)" data={procedureBreakdown} color="#3CB371" />
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <MetricTrendChart
                    darkTheme={darkTheme}
                    title="Treatment Trend (per month)"
                    series={[{ name: 'Procedures', color: '#3CB371', data: procedureTrend }]}
                />
            </Stack>

            <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 700, mb: 1 }}>
                Lab Reports
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <MetricBarChart darkTheme={darkTheme} title="Lab Report Type Breakdown (Top 10)" data={labReportTypeBreakdown} color="#EC4899" />
                <MetricPieChart darkTheme={darkTheme} title="Lab Report Status" data={labReportStatusBreakdown} />
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <MetricTrendChart
                    darkTheme={darkTheme}
                    title="Lab Report Trend (per month)"
                    series={[{ name: 'Lab Reports', color: '#EC4899', data: labReportTrend }]}
                />
            </Stack>

            <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 700, mb: 1 }}>
                Vitals
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                {averageVitals.length === 0 ? (
                    <EmptyView message="No vitals recorded for the current filters." />
                ) : (
                    averageVitals.map((vital) => (
                        <KpiTile
                            key={vital.label}
                            darkTheme={darkTheme}
                            label={`Avg ${vital.label}`}
                            value={`${vital.value.toFixed(1)}${vital.unit ? ` ${vital.unit}` : ''}`}
                            accentColor="#01AEEE"
                        />
                    ))
                )}
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={2}>
                {topVitalsTrends.map(({ metric, data }) => (
                    <MetricTrendChart
                        key={metric}
                        darkTheme={darkTheme}
                        title={`${metric} Trend (monthly avg)`}
                        series={[{ name: metric, color: '#01AEEE', data }]}
                    />
                ))}
            </Stack>
        </Box>
    );
};
