import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { formatAddress, formatHumanName, formatTelecom } from '../../utils/fhir';

function isPlainObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function humanizeKey(key: string): string {
    const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatDateLike(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

/**
 * Renders common FHIR datatypes as a single readable string. Returns null
 * when `value` doesn't match a recognized shape, so the caller falls back to
 * the generic key/value recursion below.
 */
function formatKnownFhirType(value: any): string | null {
    if (!isPlainObject(value)) return null;

    if (Array.isArray(value.given) || value.family) {
        return formatHumanName([value]) || null;
    }
    if (Array.isArray(value.line) || value.city || value.postalCode) {
        return formatAddress([value]);
    }
    if (Array.isArray(value.coding)) {
        if (value.text) return value.text;
        const first = value.coding[0];
        return first ? (first.display ?? first.code ?? first.system ?? null) : (value.text ?? null);
    }
    if (typeof value.reference === 'string') {
        return value.display ? `${value.display} (${value.reference})` : value.reference;
    }
    if (typeof value.value === 'number' && (value.unit || value.code || value.system)) {
        return `${value.value}${value.unit ? ` ${value.unit}` : ''}`;
    }
    if ((value.start || value.end) && Object.keys(value).every((k) => k === 'start' || k === 'end')) {
        const start = value.start ? formatDateLike(value.start) : '?';
        const end = value.end ? formatDateLike(value.end) : 'present';
        return `${start} – ${end}`;
    }
    if (
        typeof value.system === 'string' &&
        typeof value.value === 'string' &&
        ['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other'].includes(value.system)
    ) {
        return formatTelecom([value]);
    }
    if (typeof value.value === 'string' && typeof value.system === 'string' && !value.coding) {
        return value.value;
    }
    if (typeof value.url === 'string' && Object.keys(value).some((k) => k.startsWith('value'))) {
        const valueKey = Object.keys(value).find((k) => k.startsWith('value') && k !== 'value');
        const inner = valueKey ? value[valueKey] : undefined;
        const rendered = formatKnownFhirType(inner) ?? (typeof inner === 'object' ? null : String(inner ?? ''));
        return rendered !== null ? `${value.url.split('/').pop()}: ${rendered}` : null;
    }

    return null;
}

interface FhirValueTreeProps {
    darkTheme: boolean;
    value: any;
    depth?: number;
}

export const FhirValueTree: React.FC<FhirValueTreeProps> = ({ darkTheme, value, depth = 0 }) => {
    const textColor = darkTheme ? '#FFFFFF' : '#124D81';
    const mutedColor = darkTheme ? '#AEAEAE' : '#6B7A8F';

    if (value === null || value === undefined || value === '') {
        return (
            <Typography variant="body2" sx={{ color: mutedColor, fontStyle: 'italic' }}>
                --
            </Typography>
        );
    }

    if (typeof value !== 'object') {
        return (
            <Typography variant="body2" sx={{ color: textColor, wordBreak: 'break-word' }}>
                {String(value)}
            </Typography>
        );
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return (
                <Typography variant="body2" sx={{ color: mutedColor, fontStyle: 'italic' }}>
                    --
                </Typography>
            );
        }
        return (
            <Stack spacing={0.75}>
                {value.map((item, index) => {
                    const known = formatKnownFhirType(item);
                    return (
                        <Box
                            key={index}
                            sx={{
                                pl: depth > 0 ? 1.5 : 0,
                                borderLeft: depth > 0 ? `2px solid ${darkTheme ? '#333' : '#E3E8EF'}` : 'none',
                            }}
                        >
                            {known !== null ? (
                                <Typography variant="body2" sx={{ color: textColor }}>
                                    {known}
                                </Typography>
                            ) : (
                                <FhirValueTree darkTheme={darkTheme} value={item} depth={depth + 1} />
                            )}
                        </Box>
                    );
                })}
            </Stack>
        );
    }

    const known = formatKnownFhirType(value);
    if (known !== null) {
        return (
            <Typography variant="body2" sx={{ color: textColor, wordBreak: 'break-word' }}>
                {known}
            </Typography>
        );
    }

    const entries = Object.entries(value).filter(([key]) => key !== 'resourceType');
    if (entries.length === 0) {
        return (
            <Typography variant="body2" sx={{ color: mutedColor, fontStyle: 'italic' }}>
                --
            </Typography>
        );
    }

    return (
        <Stack spacing={0.75} sx={{ pl: depth > 0 ? 1.5 : 0 }}>
            {entries.map(([key, nested]) => (
                <Box key={key}>
                    <Typography variant="caption" sx={{ color: mutedColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        {humanizeKey(key)}
                    </Typography>
                    <FhirValueTree darkTheme={darkTheme} value={nested} depth={depth + 1} />
                </Box>
            ))}
        </Stack>
    );
};
