import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Snackbar, Stack, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
    componentDisplayText,
    componentValue,
    patientDisplayName,
    sanitizeFilenamePart,
} from '../../utils/fhir';

interface ObservationSectionProps {
    darkTheme: boolean;
    patient: any;
    organizationName?: string;
    observations: any[];
}

interface ObservationRow {
    id: string;
    dateTime: string;
    status: string;
    abnormal: boolean;
    [componentColumn: string]: any;
}

function isAbnormal(node: any): boolean {
    const range = node?.referenceRange?.[0];
    const rawValue = node?.valueQuantity?.value;
    if (!range || rawValue === undefined) return false;
    const low = range.low?.value;
    const high = range.high?.value;
    if (low !== undefined && rawValue < low) return true;
    if (high !== undefined && rawValue > high) return true;
    return false;
}

function toCsvValue(value: string): string {
    if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function downloadCsv(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export const ObservationSection: React.FC<ObservationSectionProps> = ({
    darkTheme,
    patient,
    organizationName,
    observations,
}) => {
    const [toast, setToast] = useState('');

    const sortedObservations = useMemo(() => {
        return [...observations].sort((a, b) => {
            const aDate = new Date(a.effectiveDateTime ?? a.meta?.lastUpdated ?? 0).getTime();
            const bDate = new Date(b.effectiveDateTime ?? b.meta?.lastUpdated ?? 0).getTime();
            return bDate - aDate;
        });
    }, [observations]);

    const componentColumns = useMemo(() => {
        const seen: string[] = [];
        sortedObservations.forEach((obs: any) => {
            (obs.component ?? []).forEach((component: any) => {
                const text = componentDisplayText(component);
                if (text && !seen.includes(text)) seen.push(text);
            });
        });
        return seen;
    }, [sortedObservations]);

    const rows = useMemo<ObservationRow[]>(() => {
        return sortedObservations.map((obs: any) => {
            const dateValue = obs.effectiveDateTime ?? obs.meta?.lastUpdated;
            const dateTime = dateValue ? new Date(dateValue).toLocaleString() : '--';

            const row: ObservationRow = {
                id: `${obs.id}-${obs.meta?.versionId ?? dateValue ?? Math.random()}`,
                dateTime,
                status: obs.status ?? '--',
                abnormal: false,
            };

            componentColumns.forEach((text) => {
                row[text] = '--';
            });

            let abnormal = false;
            (obs.component ?? []).forEach((component: any) => {
                const text = componentDisplayText(component);
                if (text) row[text] = componentValue(component);
                if (isAbnormal(component)) abnormal = true;
            });
            row.abnormal = abnormal;

            return row;
        });
    }, [sortedObservations, componentColumns]);

    const columns = useMemo<MRT_ColumnDef<ObservationRow>[]>(
        () => [
            { accessorKey: 'dateTime', header: 'Date / Time', id: 'dateTime' },
            ...componentColumns.map((text) => ({ accessorKey: text, header: text, id: text })),
            { accessorKey: 'status', header: 'Status', id: 'status' },
        ],
        [componentColumns],
    );

    const handleExport = () => {
        const patientName = patientDisplayName(patient);
        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `${sanitizeFilenamePart(patientName)}_Observation_History_${dateStr}.csv`;

        const meta: Record<string, string> = {
            'Patient Name': patientName,
            'Patient ID': patient?.identifier?.[0]?.value ?? patient?.id ?? '--',
            Organization: organizationName ?? '--',
            'Export Date & Time': new Date().toLocaleString(),
        };

        const headers = ['Date / Time', ...componentColumns, 'Status'];
        const keys = ['dateTime', ...componentColumns, 'status'];

        const lines: string[] = [];
        Object.entries(meta).forEach(([key, value]) => {
            lines.push(`${toCsvValue(key)},${toCsvValue(value)}`);
        });
        lines.push('');
        lines.push(headers.map(toCsvValue).join(','));
        rows.forEach((row) => {
            lines.push(keys.map((key) => toCsvValue(String(row[key] ?? '--'))).join(','));
        });

        downloadCsv(filename, lines.join('\n'));
        setToast('Observation history exported.');
    };

    const textColor = darkTheme ? '#FFFFFF' : '#124D81';

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ color: textColor }}>
                    Observation History
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    disabled={rows.length === 0}
                    onClick={handleExport}
                    sx={{ borderRadius: '25px', textTransform: 'capitalize' }}
                >
                    Export CSV
                </Button>
            </Stack>

            {rows.length === 0 ? (
                <Alert severity="info">No observations found for this patient.</Alert>
            ) : (
                <MaterialReactTable
                    columns={columns}
                    data={rows}
                    enableColumnFilters
                    enableGlobalFilter
                    enablePagination
                    enableStickyHeader
                    initialState={{ density: 'compact' }}
                    muiTableContainerProps={{ sx: { maxHeight: '600px' } }}
                    muiTableBodyRowProps={({ row }) => ({
                        sx: row.original.abnormal
                            ? { backgroundColor: darkTheme ? 'rgba(255,82,82,0.15)' : 'rgba(255,82,82,0.08)' }
                            : {},
                    })}
                />
            )}

            <Snackbar
                open={Boolean(toast)}
                autoHideDuration={5000}
                onClose={() => setToast('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
                    {toast}
                </Alert>
            </Snackbar>
        </Box>
    );
};
