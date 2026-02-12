import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Chip, Stack, Checkbox, FormGroup, InputAdornment } from '@mui/material';
import { BirthDetails } from './types';

interface Props {
    data: BirthDetails;
    onChange: (field: keyof BirthDetails, value: any) => void;
}

const BirthDetailsSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof BirthDetails) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    const handleResuscitationToggle = (step: string) => {
        const currentSteps = data.resuscitationSteps || [];
        const newSteps = currentSteps.includes(step)
            ? currentSteps.filter(s => s !== step)
            : [...currentSteps, step];
        onChange('resuscitationSteps', newSteps);
    };

    return (
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                    3. BIRTH & RESUSCITATION DETAILS
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                        <TextField
                            fullWidth
                            label="Birth Weight"
                            type="number"
                            value={data.birthWeight}
                            onChange={handleChange('birthWeight')}
                            InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            fullWidth
                            label="Length"
                            type="number"
                            value={data.length}
                            onChange={handleChange('length')}
                            InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            fullWidth
                            label="Head Circ."
                            type="number"
                            value={data.headCircumference}
                            onChange={handleChange('headCircumference')}
                            InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            fullWidth
                            label="Chest Circ."
                            type="number"
                            value={data.chestCircumference || ''}
                            onChange={handleChange('chestCircumference')}
                            InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2">APGAR Scores</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField label="1 min" type="number" size="small" sx={{ width: '80px' }} value={data.apgar1min} onChange={handleChange('apgar1min')} />
                            <TextField label="5 min" type="number" size="small" sx={{ width: '80px' }} value={data.apgar5min} onChange={handleChange('apgar5min')} error={parseInt(data.apgar5min) < 7} />
                            <TextField label="10 min" type="number" size="small" sx={{ width: '80px' }} value={data.apgar10min} onChange={handleChange('apgar10min')} />
                        </Stack>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>Resuscitation Required?</FormLabel>
                            <RadioGroup
                                row
                                value={data.resuscitationRequired ? 'Yes' : 'No'}
                                onChange={(e) => onChange('resuscitationRequired', e.target.value === 'Yes')}
                            >
                                <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    {data.resuscitationRequired && (
                        <Grid item xs={12}>
                            <Typography variant="body2" gutterBottom>Resuscitation Steps:</Typography>
                            <FormGroup row>
                                {['Drying & Stimulation', 'Suction', 'Oxygen by Mask', 'PPV', 'Intubation', 'Chest Compressions', 'Adrenaline'].map((step) => (
                                    <FormControlLabel
                                        key={step}
                                        control={
                                            <Checkbox
                                                checked={data.resuscitationSteps?.includes(step) || false}
                                                onChange={() => handleResuscitationToggle(step)}
                                                size="small"
                                            />
                                        }
                                        label={step}
                                    />
                                ))}
                            </FormGroup>
                            <TextField
                                fullWidth
                                label="Other Resuscitation Details"
                                value={data.otherResuscitation || ''}
                                onChange={handleChange('otherResuscitation')}
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        </Grid>
                    )}

                    <Grid item xs={12} md={4}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend" sx={{ fontSize: '0.8rem' }}>Cried at Birth</FormLabel>
                            <RadioGroup
                                row
                                value={data.criedAtBirth ? 'Yes' : 'No'}
                                onChange={(e) => onChange('criedAtBirth', e.target.value === 'Yes')}
                            >
                                <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend" sx={{ fontSize: '0.8rem' }}>Delayed Cord Clamping</FormLabel>
                            <RadioGroup
                                row
                                value={data.delayedCordClamping}
                                onChange={handleChange('delayedCordClamping')}
                            >
                                <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                <FormControlLabel value="Not Known" control={<Radio size="small" />} label="Unknown" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend" sx={{ fontSize: '0.8rem' }}>Meconium Stained Liquor</FormLabel>
                            <RadioGroup
                                row
                                value={data.meconiumStainedLiquor}
                                onChange={handleChange('meconiumStainedLiquor')}
                            >
                                <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                <FormControlLabel value="Not Known" control={<Radio size="small" />} label="Unknown" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default BirthDetailsSection;
