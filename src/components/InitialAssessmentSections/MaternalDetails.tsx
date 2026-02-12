import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Chip, Stack, FormGroup, Checkbox } from '@mui/material';
import { MaternalDetails } from './types';

interface Props {
    data: MaternalDetails;
    onChange: (field: keyof MaternalDetails, value: any) => void;
}

const MaternalDetailsSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof MaternalDetails) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    const handleHighRiskToggle = (factor: string) => {
        const currentFactors = data.highRiskFactors || [];
        const newFactors = currentFactors.includes(factor)
            ? currentFactors.filter(f => f !== factor)
            : [...currentFactors, factor];
        onChange('highRiskFactors', newFactors);
    };

    const handleInfectionToggle = (infection: string) => {
        const currentInfections = data.maternalInfections || [];
        const newInfections = currentInfections.includes(infection)
            ? currentInfections.filter(f => f !== infection)
            : [...currentInfections, infection];
        onChange('maternalInfections', newInfections);
    };

    const handleMedicationToggle = (med: string) => {
        const currentMeds = data.medicationsInPregnancy || [];
        const newMeds = currentMeds.includes(med)
            ? currentMeds.filter(m => m !== med)
            : [...currentMeds, med];
        onChange('medicationsInPregnancy', newMeds);
    };

    return (
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                    2. MATERNAL & PREGNANCY DETAILS
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Mother's Name"
                            value={data.motherName}
                            onChange={handleChange('motherName')}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            fullWidth
                            label="Age (Years)"
                            type="number"
                            value={data.motherAge}
                            onChange={handleChange('motherAge')}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField label="G" size="small" sx={{ width: '60px' }} value={data.gravida} onChange={handleChange('gravida')} />
                            <TextField label="P" size="small" sx={{ width: '60px' }} value={data.para} onChange={handleChange('para')} />
                            <TextField label="L" size="small" sx={{ width: '60px' }} value={data.living} onChange={handleChange('living')} />
                            <TextField label="A" size="small" sx={{ width: '60px' }} value={data.abortion} onChange={handleChange('abortion')} />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormLabel component="legend" sx={{ fontSize: '0.8rem', mb: 0.5 }}>Gestational Age at Birth</FormLabel>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Weeks"
                                type="number"
                                value={data.gestationalAgeWeeks}
                                onChange={handleChange('gestationalAgeWeeks')}
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Days"
                                type="number"
                                value={data.gestationalAgeDays}
                                onChange={handleChange('gestationalAgeDays')}
                                size="small"
                                sx={{ flex: 1 }}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend" sx={{ fontSize: '0.8rem' }}>GA Assessment Method</FormLabel>
                            <RadioGroup
                                row
                                value={data.gaAssessmentMethod}
                                onChange={handleChange('gaAssessmentMethod')}
                            >
                                <FormControlLabel value="LMP" control={<Radio size="small" />} label="LMP" />
                                <FormControlLabel value="Early USG" control={<Radio size="small" />} label="Early USG" />
                                <FormControlLabel value="Ballard Score" control={<Radio size="small" />} label="Ballard" />
                                <FormControlLabel value="Clinical Estimate" control={<Radio size="small" />} label="Clinical" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>High Risk Factors</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {['PIH', 'GDM', 'GHTN', 'APH', 'PROM', 'Oligohydramnios', 'Polyhydramnios', 'IUGR', 'Fever', 'Sepsis'].map((factor) => (
                                <Chip
                                    key={factor}
                                    label={factor}
                                    clickable
                                    color={data.highRiskFactors?.includes(factor) ? "error" : "default"}
                                    onClick={() => handleHighRiskToggle(factor)}
                                    variant={data.highRiskFactors?.includes(factor) ? "filled" : "outlined"}
                                />
                            ))}
                        </Stack>
                        <TextField
                            fullWidth
                            label="Other Risk Factors"
                            value={data.otherRiskFactors || ''}
                            onChange={handleChange('otherRiskFactors')}
                            size="small"
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Antepartum Complications"
                            value={data.antepartumComplications}
                            onChange={handleChange('antepartumComplications')}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Intrapartum Complications"
                            value={data.intrapartumComplications}
                            onChange={handleChange('intrapartumComplications')}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>Maternal Infections</Typography>
                        <FormGroup row>
                            {['HIV', 'HBsAg', 'HCV', 'Syphilis', 'COVID', 'TB'].map((inf) => (
                                <FormControlLabel
                                    key={inf}
                                    control={
                                        <Checkbox
                                            checked={data.maternalInfections?.includes(inf) || false}
                                            onChange={() => handleInfectionToggle(inf)}
                                            size="small"
                                        />
                                    }
                                    label={inf}
                                />
                            ))}
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>Medications in Pregnancy</Typography>
                        <FormGroup row>
                            {['Steroids', 'MgSO4', 'Insulin', 'Antiepileptics'].map((med) => (
                                <FormControlLabel
                                    key={med}
                                    control={
                                        <Checkbox
                                            checked={data.medicationsInPregnancy?.includes(med) || false}
                                            onChange={() => handleMedicationToggle(med)}
                                            size="small"
                                        />
                                    }
                                    label={med}
                                />
                            ))}
                        </FormGroup>
                        <TextField
                            fullWidth
                            label="Other Medications"
                            value={data.otherMedications || ''}
                            onChange={handleChange('otherMedications')}
                            size="small"
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default MaternalDetailsSection;
