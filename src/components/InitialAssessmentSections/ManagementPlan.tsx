import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Chip, Stack, Checkbox, FormGroup, MenuItem } from '@mui/material';
import { ManagementPlan } from './types';

interface Props {
    data: ManagementPlan;
    onChange: (field: keyof ManagementPlan, value: any) => void;
}

const ManagementPlanSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof ManagementPlan) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    const handleRespiratoryToggle = (item: string) => {
        const current = data.respiratorySupport || [];
        const newSelection = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
        onChange('respiratorySupport', newSelection);
    };

    const handleInotropeToggle = (item: string) => {
        const current = data.inotropes || [];
        const newSelection = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
        onChange('inotropes', newSelection);
    };

    const handleMonitoringToggle = (item: string) => {
        const current = data.monitoringPlan || [];
        const newSelection = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
        onChange('monitoringPlan', newSelection);
    };

    const handleProceduresToggle = (item: string) => {
        const current = data.procedures || [];
        const newSelection = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
        onChange('procedures', newSelection);
    };

    return (
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                    9. INITIAL MANAGEMENT PLAN
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>Respiratory Support:</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {['Room Air', 'Oxygen (Prongs/Mask)', 'CPAP', 'HFNC', 'Ventilator'].map((item) => (
                                <Chip key={item} label={item} clickable color={data.respiratorySupport?.includes(item) ? "primary" : "default"} onClick={() => handleRespiratoryToggle(item)} variant={data.respiratorySupport?.includes(item) ? "filled" : "outlined"} size="small" />
                            ))}
                        </Stack>
                        {data.respiratorySupport?.length > 0 && <TextField fullWidth label="Respiratory Settings / Details" value={data.otherRespiratory || ''} onChange={handleChange('otherRespiratory')} size="small" sx={{ mt: 1 }} />}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControlLabel control={<Checkbox checked={data.ivFluids} onChange={(e) => onChange('ivFluids', e.target.checked)} size="small" />} label="IV Fluids Started" />
                        {data.ivFluids && <TextField fullWidth label="Fluid Type & Rate (ml/kg/day)" value={data.ivFluidsDetails || ''} onChange={handleChange('ivFluidsDetails')} size="small" sx={{ mt: 1 }} />}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>Inotropes:</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {['Dobutamine', 'Dopamine', 'Adrenaline', 'Noradrenaline'].map((item) => (
                                <Chip key={item} label={item} clickable color={data.inotropes?.includes(item) ? "secondary" : "default"} onClick={() => handleInotropeToggle(item)} variant={data.inotropes?.includes(item) ? "filled" : "outlined"} size="small" />
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControlLabel control={<Checkbox checked={data.antibiotics} onChange={(e) => onChange('antibiotics', e.target.checked)} size="small" />} label="Antibiotics Started" />
                        {data.antibiotics && <TextField fullWidth label="Regimen" value={data.antibioticsRegimen || ''} onChange={handleChange('antibioticsRegimen')} size="small" sx={{ mt: 1 }} />}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>Feeding Plan:</Typography>
                        <TextField fullWidth label="Feeding Plan Details" value={data.feedingPlan?.join(', ') || ''} onChange={(e) => onChange('feedingPlan', e.target.value.split(', '))} size="small" placeholder="E.g., 20ml q2h" />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>Monitoring Plan:</Typography>
                        <FormGroup row>
                            {['Vitals Q2H', 'Vitals Q4H', 'GRBS'].map((item) => (
                                <FormControlLabel key={item} control={<Checkbox checked={data.monitoringPlan?.includes(item) || false} onChange={() => handleMonitoringToggle(item)} size="small" />} label={item} />
                            ))}
                        </FormGroup>
                        <TextField fullWidth label="Other Monitoring" value={data.otherMonitoring || ''} onChange={handleChange('otherMonitoring')} size="small" sx={{ mt: 1 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>Procedures Planned/Done:</Typography>
                        <FormGroup row>
                            {['UVC', 'UAC', 'PICC', 'LP'].map((item) => (
                                <FormControlLabel key={item} control={<Checkbox checked={data.procedures?.includes(item) || false} onChange={() => handleProceduresToggle(item)} size="small" />} label={item} />
                            ))}
                        </FormGroup>
                        <TextField fullWidth label="Procedure Note" value={data.procedureDescription || ''} onChange={handleChange('procedureDescription')} size="small" sx={{ mt: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Other Medications / Instructions" value={data.otherMedications} onChange={handleChange('otherMedications')} size="small" />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default ManagementPlanSection;
