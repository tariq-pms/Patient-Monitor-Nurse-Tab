import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Chip, Stack, Checkbox, FormGroup, MenuItem } from '@mui/material';
import { Investigations } from './types';

interface Props {
    data: Investigations;
    onChange: (field: keyof Investigations, value: any) => void;
}

const InvestigationsSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof Investigations) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    const handleLabToggle = (item: string) => {
        const current = data.baselineLabs || [];
        const newSelection = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
        onChange('baselineLabs', newSelection);
    };

    const handleRadiologyToggle = (item: string) => {
        const current = data.radiologyOrdered || [];
        const newSelection = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
        onChange('radiologyOrdered', newSelection);
    };

    return (
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                    8. INVESTIGATIONS AT ADMISSION
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>Baseline Labs Ordered:</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {['CBC', 'CRP', 'Blood Culture', 'Blood Sugar', 'Serum Bilirubin', 'Serum Electrolytes', 'ABG'].map((item) => (
                                <Chip key={item} label={item} clickable color={data.baselineLabs?.includes(item) ? "primary" : "default"} onClick={() => handleLabToggle(item)} variant={data.baselineLabs?.includes(item) ? "filled" : "outlined"} size="small" />
                            ))}
                        </Stack>
                        <TextField fullWidth label="Other Labs" value={data.otherLabs || ''} onChange={handleChange('otherLabs')} size="small" sx={{ mt: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth multiline rows={2} label="Results Summary" value={data.resultsSummary} onChange={handleChange('resultsSummary')} size="small" placeholder="Brief summary of available results..." />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>Radiology / Procedures:</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {['Chest X-ray', 'USG Brain', 'Echo'].map((item) => (
                                <Chip key={item} label={item} clickable color={data.radiologyOrdered?.includes(item) ? "secondary" : "default"} onClick={() => handleRadiologyToggle(item)} variant={data.radiologyOrdered?.includes(item) ? "filled" : "outlined"} size="small" />
                            ))}
                        </Stack>
                        <TextField fullWidth label="Other Radiology" value={data.otherRadiology || ''} onChange={handleChange('otherRadiology')} size="small" sx={{ mt: 1 }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField select fullWidth label="Sepsis Screen Status" value={data.sepsisScreen} onChange={handleChange('sepsisScreen')} size="small">
                            {['Not Done', 'Sent', 'Positive', 'Negative'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </TextField>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default InvestigationsSection;
