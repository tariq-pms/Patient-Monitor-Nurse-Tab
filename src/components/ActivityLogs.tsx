import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Button,
    Stack,
    Avatar,
    CircularProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    Print as PrintIcon,
    Person as PersonIcon,
    MonitorHeart as VitalsIcon,
    Warning as AlertIcon,
    Medication as MedicationIcon,
    Biotech as LabIcon,
    Description as NoteIcon,
    Settings as SystemIcon,
    Assignment as AssessmentIcon,
    TrendingUp as GrowthIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface ActivityLogItem {
    id: string;
    timestamp: string;
    date: Dayjs;
    title: string;
    description: string;
    secondaryDescription?: string;
    user: string;
    userId?: string;
    category: string;
    resourceType: string;
    resourceId: string;
}

interface ActivityLogsProps {
    patientId: string;
    patientName: string;
    userOrganization: string;
}

const categories = [
    'Admissions',
    'Assessments',
    'Growth Module',
    'Input & Output Feeds',
    'Clinical Notes',
    'Vitals Signs',
    'Medications',
    'Investigations',
    'Alerts & Warnings',
    'System Events',
    'Documents & Files'
];

const categoryToResourceMap: { [key: string]: string } = {
    'Admissions': 'Patient',
    'Assessments': 'Observation',
    'Growth Module': 'Observation',
    'Vitals Signs': 'Observation',
    'Clinical Notes': 'DocumentReference,DiagnosticReport',
    'Medications': 'MedicationRequest,MedicationAdministration',
    'Investigations': 'DiagnosticReport,Observation',
    'System Events': 'AuditEvent'
};

export const ActivityLogs: React.FC<ActivityLogsProps> = ({ patientId, patientName, userOrganization }) => {
    const [activities, setActivities] = useState<ActivityLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs().subtract(7, 'days'));
    const [toDate, setToDate] = useState<Dayjs | null>(dayjs());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState('All Users');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);
    const [availableUsers, setAvailableUsers] = useState<string[]>(['All Users']);

    // Fetch activity data
    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
            const authHeader = "Basic " + btoa("fhiruser:change-password");
            const allActivities: ActivityLogItem[] = [];

            try {
                // Fetch Patient admission data
                const patientResponse = await fetch(`${baseUrl}/Patient/${patientId}`, {
                    headers: { Authorization: authHeader, Accept: "application/fhir+json" }
                });
                if (patientResponse.ok) {
                    const patientData = await patientResponse.json();
                    if (patientData.meta?.lastUpdated) {
                        allActivities.push({
                            id: `patient-${patientData.id}`,
                            timestamp: patientData.meta.lastUpdated,
                            date: dayjs(patientData.meta.lastUpdated),
                            title: `Admission: ${patientName}`,
                            description: `Patient admitted. ID: ${patientId}`,
                            user: 'System',
                            category: 'Admissions',
                            resourceType: 'Patient',
                            resourceId: patientData.id
                        });
                    }
                }

                // Fetch Observations (Vitals, Assessments, Growth)
                const obsResponse = await fetch(
                    `${baseUrl}/Observation?subject=Patient/${patientId}&_count=100&_sort=-date`,
                    { headers: { Authorization: authHeader, Accept: "application/fhir+json" } }
                );
                if (obsResponse.ok) {
                    const obsData = await obsResponse.json();
                    obsData.entry?.forEach((entry: any) => {
                        const obs = entry.resource;
                        const category = obs.category?.[0]?.coding?.[0]?.display || 'Observations';
                        const code = obs.code?.text || obs.code?.coding?.[0]?.display || 'Unknown';
                        const value = obs.valueQuantity?.value ?
                            `${obs.valueQuantity.value} ${obs.valueQuantity.unit || ''}` :
                            obs.valueString || 'N/A';

                        let catLabel = 'System Events';
                        if (category.includes('vital') || category.includes('Vital')) catLabel = 'Vitals Signs';
                        else if (category.includes('growth') || code.includes('Weight')) catLabel = 'Growth Module';
                        else if (category.includes('laboratory')) catLabel = 'Investigations';

                        allActivities.push({
                            id: `obs-${obs.id}`,
                            timestamp: obs.effectiveDateTime || obs.meta?.lastUpdated,
                            date: dayjs(obs.effectiveDateTime || obs.meta?.lastUpdated),
                            title: `${catLabel}: ${code}`,
                            description: `Result: ${value}`,
                            user: obs.performer?.[0]?.display || 'System',
                            category: catLabel,
                            resourceType: 'Observation',
                            resourceId: obs.id
                        });
                    });
                }

                // Fetch Medication Requests
                const medResponse = await fetch(
                    `${baseUrl}/MedicationRequest?subject=Patient/${patientId}&_count=100&_sort=-authoredon`,
                    { headers: { Authorization: authHeader, Accept: "application/fhir+json" } }
                );
                if (medResponse.ok) {
                    const medData = await medResponse.json();
                    medData.entry?.forEach((entry: any) => {
                        const med = entry.resource;
                        const medication = med.medicationCodeableConcept?.text ||
                            med.medicationCodeableConcept?.coding?.[0]?.display || 'Medication';

                        allActivities.push({
                            id: `med-${med.id}`,
                            timestamp: med.authoredOn || med.meta?.lastUpdated,
                            date: dayjs(med.authoredOn || med.meta?.lastUpdated),
                            title: `Medication Order: ${medication}`,
                            description: `Status: ${med.status}. ${med.dosageInstruction?.[0]?.text || ''}`,
                            user: med.requester?.display || 'Physician',
                            category: 'Medications',
                            resourceType: 'MedicationRequest',
                            resourceId: med.id
                        });
                    });
                }

                // Fetch DiagnosticReports (Labs/Investigations)
                const diagResponse = await fetch(
                    `${baseUrl}/DiagnosticReport?subject=Patient/${patientId}&_count=100&_sort=-issued`,
                    { headers: { Authorization: authHeader, Accept: "application/fhir+json" } }
                );
                if (diagResponse.ok) {
                    const diagData = await diagResponse.json();
                    diagData.entry?.forEach((entry: any) => {
                        const report = entry.resource;
                        const test = report.code?.text || report.code?.coding?.[0]?.display || 'Lab Test';

                        allActivities.push({
                            id: `diag-${report.id}`,
                            timestamp: report.issued || report.meta?.lastUpdated,
                            date: dayjs(report.issued || report.meta?.lastUpdated),
                            title: `Lab Result: ${test}`,
                            description: `Status: ${report.status}. ${report.conclusion || ''}`,
                            user: report.performer?.[0]?.display || 'Lab System',
                            category: 'Investigations',
                            resourceType: 'DiagnosticReport',
                            resourceId: report.id
                        });
                    });
                }

                // Sort activities by date (newest first)
                allActivities.sort((a, b) => b.date.valueOf() - a.date.valueOf());

                // Extract unique users
                const users = new Set(allActivities.map(a => a.user));
                setAvailableUsers(['All Users', ...Array.from(users)]);

                setActivities(allActivities);
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchActivities();
        }
    }, [patientId, patientName]);

    // Filter activities
    const filteredActivities = useMemo(() => {
        let filtered = activities;

        // Date range filter
        if (fromDate) {
            filtered = filtered.filter(a => a.date.isSameOrAfter(fromDate, 'day'));
        }
        if (toDate) {
            filtered = filtered.filter(a => a.date.isSameOrBefore(toDate, 'day'));
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(query) ||
                a.description.toLowerCase().includes(query) ||
                a.user.toLowerCase().includes(query)
            );
        }

        // User filter
        if (selectedUser !== 'All Users') {
            filtered = filtered.filter(a => a.user === selectedUser);
        }

        // Category filter
        filtered = filtered.filter(a => selectedCategories.includes(a.category));

        return filtered;
    }, [activities, fromDate, toDate, searchQuery, selectedUser, selectedCategories]);

    // Group activities by date
    const groupedActivities = useMemo(() => {
        const groups: { [key: string]: ActivityLogItem[] } = {};

        filteredActivities.forEach(activity => {
            const today = dayjs();
            const yesterday = today.subtract(1, 'day');

            let dateLabel: string;
            if (activity.date.isSame(today, 'day')) {
                dateLabel = 'Today';
            } else if (activity.date.isSame(yesterday, 'day')) {
                dateLabel = 'Yesterday';
            } else {
                dateLabel = activity.date.format('MMMM DD, YYYY');
            }

            if (!groups[dateLabel]) {
                groups[dateLabel] = [];
            }
            groups[dateLabel].push(activity);
        });

        return groups;
    }, [filteredActivities]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const getIcon = (category: string) => {
        let IconComponent = SystemIcon;
        let color = '#757575';
        let bgColor = '#F5F5F5';

        switch (category) {
            case 'Admissions':
                IconComponent = PersonIcon;
                color = '#42A5F5';
                bgColor = '#E3F2FD';
                break;
            case 'Vitals Signs':
                IconComponent = VitalsIcon;
                color = '#66BB6A';
                bgColor = '#E8F5E9';
                break;
            case 'Alerts & Warnings':
                IconComponent = AlertIcon;
                color = '#EF5350';
                bgColor = '#FFEBEE';
                break;
            case 'Medications':
                IconComponent = MedicationIcon;
                color = '#AB47BC';
                bgColor = '#F3E5F5';
                break;
            case 'Investigations':
                IconComponent = LabIcon;
                color = '#FFA726';
                bgColor = '#FFF3E0';
                break;
            case 'Clinical Notes':
                IconComponent = NoteIcon;
                color = '#5C6BC0';
                bgColor = '#E8EAF6';
                break;
            case 'Assessments':
                IconComponent = AssessmentIcon;
                color = '#26A69A';
                bgColor = '#E0F2F1';
                break;
            case 'Growth Module':
                IconComponent = GrowthIcon;
                color = '#7E57C2';
                bgColor = '#EDE7F6';
                break;
            default:
                break;
        }

        return (
            <Avatar sx={{ bgcolor: bgColor, color: color, width: 32, height: 32 }}>
                <IconComponent fontSize="small" />
            </Avatar>
        );
    };

    const getTitleColor = (category: string) => {
        const colorMap: { [key: string]: string } = {
            'Admissions': '#1E88E5',
            'Vitals Signs': '#43A047',
            'Alerts & Warnings': '#E53935',
            'Medications': '#8E24AA',
            'Investigations': '#FB8C00',
            'Clinical Notes': '#3949AB',
            'Assessments': '#00897B',
            'Growth Module': '#5E35B1'
        };
        return colorMap[category] || '#424242';
    };

    return (
        <Box sx={{ display: 'flex', gap: 4, p: 3, bgcolor: '#FFFFFF', minHeight: '100vh' }}>
            {/* Main Activity Feed - Left Column */}
            <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">Activity</Typography>
                        <Typography variant="body2" color="text.secondary">
                            From {fromDate?.format('MM/DD/YYYY')} to {toDate?.format('MM/DD/YYYY')}
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        sx={{ textTransform: 'none', color: '#555', borderColor: '#ddd' }}
                    >
                        Print Log
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : Object.keys(groupedActivities).length === 0 ? (
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                        No activities found for the selected filters.
                    </Typography>
                ) : (
                    Object.entries(groupedActivities).map(([dateLabel, items]) => (
                        <Box key={dateLabel} sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>{dateLabel}</Typography>
                            <Stack spacing={3}>
                                {items.map((item) => (
                                    <Box key={item.id} sx={{ display: 'flex', gap: 2 }}>
                                        <Box sx={{ mt: 0.5 }}>
                                            {getIcon(item.category)}
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                    {item.date.format('hh:mm A')}
                                                </Typography>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: getTitleColor(item.category) }}>
                                                    {item.title}
                                                </Typography>
                                            </Stack>
                                            <Stack spacing={0.5}>
                                                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.5 }}>
                                                    {item.description}
                                                </Typography>
                                                {item.secondaryDescription && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.secondaryDescription}
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" sx={{ color: '#1976D2', cursor: 'pointer', fontWeight: 500, width: 'fit-content' }}>
                                                    {item.user}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    ))
                )}
            </Box>

            {/* Filter Sidebar - Right Column (Sticky) */}
            <Box
                sx={{
                    width: '320px',
                    position: 'sticky',
                    top: 0,
                    alignSelf: 'flex-start',
                    height: 'fit-content',
                    maxHeight: '100vh',
                    overflowY: 'auto',
                    borderLeft: '1px solid #eee',
                    pl: 3
                }}
            >
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, borderLeft: '4px solid #1976D2', pl: 1, lineHeight: 1 }}>
                            Filters
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                        }}
                    />

                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                            PATIENT
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={patientName}
                            disabled
                        >
                            <MenuItem value={patientName}>{patientName}</MenuItem>
                        </TextField>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                            FROM DATE
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={fromDate}
                                onChange={(newValue) => setFromDate(newValue)}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                            TO DATE
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={toDate}
                                onChange={(newValue) => setToDate(newValue)}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                            USER
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            {availableUsers.map(user => (
                                <MenuItem key={user} value={user}>{user}</MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                            CATEGORIES
                        </Typography>
                        <Stack>
                            {categories.map((cat) => (
                                <FormControlLabel
                                    key={cat}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={selectedCategories.includes(cat)}
                                            onChange={() => handleCategoryChange(cat)}
                                        />
                                    }
                                    label={<Typography variant="body2">{cat}</Typography>}
                                    sx={{ mb: -0.5 }}
                                />
                            ))}
                        </Stack>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Showing {filteredActivities.length} of {activities.length} activities
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
};
