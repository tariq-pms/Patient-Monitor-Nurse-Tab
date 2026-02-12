import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Chip, Stack, Autocomplete, Alert } from '@mui/material';
import { PresentingProblems } from './types';

interface Props {
    data: PresentingProblems;
    onChange: (field: keyof PresentingProblems, value: any) => void;
}

const COMMON_COMPLAINTS = [
    'Respiratory Distress', 'Poor Feeding', 'Lethargy', 'Seizures', 'Jaundice', 'Fever', 'No Passage of Meconium', 'Vomiting', 'Abdominal Distension'
];

const PresentingProblemsSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof PresentingProblems) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    const handleComplaintsChange = (event: any, value: string[]) => {
        onChange('chiefComplaints', value);
    };

    return (
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                    5. PRESENTING PROBLEMS & PROVISIONAL DIAGNOSIS
                </Typography>

                {data.riskCategory === 'Critical' && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        CRITICAL RISK CATEGORY SELECTED
                    </Alert>
                )}

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            freeSolo
                            options={COMMON_COMPLAINTS}
                            value={data.chiefComplaints || []}
                            onChange={handleComplaintsChange}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Chief Complaints"
                                    placeholder="Select or Type..."
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Onset & Duration"
                            value={data.onsetDuration}
                            onChange={handleChange('onsetDuration')}
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Risk Category</FormLabel>
                            <RadioGroup
                                row
                                value={data.riskCategory}
                                onChange={handleChange('riskCategory')}
                            >
                                <FormControlLabel value="Stable" control={<Radio size="small" color="success" />} label="Stable" />
                                <FormControlLabel value="Moderate Risk" control={<Radio size="small" color="warning" />} label="Moderate Risk" />
                                <FormControlLabel value="Critical" control={<Radio size="small" color="error" />} label="Critical" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Provisional Diagnosis"
                            value={data.provisionalDiagnosis}
                            onChange={handleChange('provisionalDiagnosis')}
                            placeholder="Enter provisional diagnosis..."
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default PresentingProblemsSection;
