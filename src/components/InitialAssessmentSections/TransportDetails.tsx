import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Chip, Stack, Checkbox, FormGroup, MenuItem } from '@mui/material';
import { TransportDetails } from './types';

interface Props {
    data: TransportDetails;
    onChange: (field: keyof TransportDetails, value: any) => void;
}

const TransportDetailsSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof TransportDetails) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    const handleAccompaniedToggle = (person: string) => {
        const current = data.accompaniedBy || [];
        const newSelection = current.includes(person)
            ? current.filter(p => p !== person)
            : [...current, person];
        onChange('accompaniedBy', newSelection);
    };

    const handleInterventionToggle = (intervention: string) => {
        const current = data.preNicuInterventions || [];
        const newSelection = current.includes(intervention)
            ? current.filter(i => i !== intervention)
            : [...current, intervention];
        onChange('preNicuInterventions', newSelection);
    };

    const handleConditionToggle = (condition: string) => {
        const current = data.conditionOnArrival || [];
        const newSelection = current.includes(condition)
            ? current.filter(c => c !== condition)
            : [...current, condition];
        onChange('conditionOnArrival', newSelection);
    };

    return (
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff8e1' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold', mb: 2 }}>
                    4. TRANSPORT & PRE-NICU STABILIZATION (Outborn)
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Age at Admission (Hours)"
                            type="number"
                            value={data.ageAtAdmission}
                            onChange={handleChange('ageAtAdmission')}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            select
                            label="Transport Mode"
                            value={data.transportMode}
                            onChange={handleChange('transportMode')}
                            size="small"
                        >
                            <MenuItem value="Ambulance">Ambulance</MenuItem>
                            <MenuItem value="Private Vehicle">Private Vehicle</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>Accompanied By</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {['Doctor', 'Nurse', 'Paramedic', 'Parents Only'].map((person) => (
                                <Chip
                                    key={person}
                                    label={person}
                                    clickable
                                    color={data.accompaniedBy?.includes(person) ? "primary" : "default"}
                                    onClick={() => handleAccompaniedToggle(person)}
                                    variant={data.accompaniedBy?.includes(person) ? "filled" : "outlined"}
                                    size="small"
                                />
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>Pre-NICU Interventions</Typography>
                        <FormGroup row>
                            {['Oxygen', 'IV Fluids', 'Antibiotics', 'Inotropes', 'None'].map((item) => (
                                <FormControlLabel
                                    key={item}
                                    control={
                                        <Checkbox
                                            checked={data.preNicuInterventions?.includes(item) || false}
                                            onChange={() => handleInterventionToggle(item)}
                                            size="small"
                                        />
                                    }
                                    label={item}
                                />
                            ))}
                        </FormGroup>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>Condition on Arrival</Typography>
                        <FormGroup row>
                            {['Stable', 'Respiratory Distress', 'Shock', 'Seizures', 'Hypothermia', 'Hypoglycemia'].map((item) => (
                                <FormControlLabel
                                    key={item}
                                    control={
                                        <Checkbox
                                            checked={data.conditionOnArrival?.includes(item) || false}
                                            onChange={() => handleConditionToggle(item)}
                                            size="small"
                                        />
                                    }
                                    label={item}
                                />
                            ))}
                        </FormGroup>
                        <TextField
                            fullWidth
                            label="Other Condition Details"
                            value={data.otherCondition || ''}
                            onChange={handleChange('otherCondition')}
                            size="small"
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default TransportDetailsSection;
