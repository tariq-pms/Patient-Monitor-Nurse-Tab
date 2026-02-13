import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Chip, Stack, Checkbox, FormGroup, MenuItem } from '@mui/material';
import { SystemicExam } from './types';

interface Props {
    data: SystemicExam;
    onChange: (field: keyof SystemicExam, value: any) => void;
}

const SystemicExamSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof SystemicExam) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    const handlePrimitiveReflexChange = (reflex: keyof SystemicExam['primitiveReflexes'], value: string) => {
        onChange('primitiveReflexes', { ...data.primitiveReflexes, [reflex]: value });
    };

    const handleWorkOfBreathingToggle = (item: string) => {
        const current = data.workOfBreathing || [];
        const newSelection = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
        onChange('workOfBreathing', newSelection);
    };

    const handleAddedSoundsToggle = (item: string) => {
        const current = data.addedSounds || [];
        const newSelection = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
        onChange('addedSounds', newSelection);
    };

    const handleSkinFindingsToggle = (item: string) => {
        const current = data.skinFindings || [];
        const newSelection = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
        onChange('skinFindings', newSelection);
    };

    return (
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                    7. SYSTEMIC EXAMINATION
                </Typography>

                {/* 7.1 General & Neurological */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">7.1 General & Neurological</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField select fullWidth label="General Appearance" value={data.generalAppearance} onChange={handleChange('generalAppearance')} size="small">
                                    {['Active', 'Lethargic', 'Hypotonic', 'Irritable', 'Comatose'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField select fullWidth label="Tone" value={data.tone} onChange={handleChange('tone')} size="small">
                                    {['Normal', 'Hypotonic', 'Hypertonic'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField select fullWidth label="Level of Consciousness" value={data.levelOfConsciousness} onChange={handleChange('levelOfConsciousness')} size="small">
                                    {['Alert', 'Drowsy', 'Stuporous', 'Coma'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2">Primitive Reflexes:</Typography>
                                <Grid container spacing={1}>
                                    {['suck', 'moro', 'rooting', 'grasp'].map((reflex) => (
                                        <Grid item xs={6} md={3} key={reflex}>
                                            <FormControl component="fieldset">
                                                <FormLabel component="legend" sx={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{reflex}</FormLabel>
                                                <RadioGroup row value={data.primitiveReflexes?.[reflex as keyof typeof data.primitiveReflexes]} onChange={(e) => handlePrimitiveReflexChange(reflex as any, e.target.value)}>
                                                    <FormControlLabel value="Normal" control={<Radio size="small" />} label="N" />
                                                    <FormControlLabel value="Depressed" control={<Radio size="small" />} label="D" />
                                                    <FormControlLabel value="Absent" control={<Radio size="small" />} label="A" />
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">Seizures Present?</FormLabel>
                                    <RadioGroup row value={data.seizures ? 'Yes' : 'No'} onChange={(e) => onChange('seizures', e.target.value === 'Yes')}>
                                        <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                        <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                    </RadioGroup>
                                </FormControl>
                                {data.seizures && <TextField fullWidth label="Seizure Description" value={data.seizureDescription || ''} onChange={handleChange('seizureDescription')} size="small" sx={{ mt: 1 }} />}
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField select fullWidth label="Fontanelle" value={data.fontanelle} onChange={handleChange('fontanelle')} size="small">
                                    {['Normal', 'Bulging', 'Sunken', 'Other'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                                </TextField>
                                {data.fontanelle === 'Other' && <TextField fullWidth label="Other Fontanelle Findings" value={data.fontanelleOther || ''} onChange={handleChange('fontanelleOther')} size="small" sx={{ mt: 1 }} />}
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* 7.2 Respiratory */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">7.2 Respiratory</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="body2" gutterBottom>Work of Breathing:</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {['Tachypnea', 'Grunting', 'Nasal Flaring', 'Chest Indrawing', 'Apnea'].map((item) => (
                                        <Chip key={item} label={item} clickable color={data.workOfBreathing?.includes(item) ? "primary" : "default"} onClick={() => handleWorkOfBreathingToggle(item)} variant={data.workOfBreathing?.includes(item) ? "filled" : "outlined"} size="small" />
                                    ))}
                                </Stack>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Silverman Anderson Score (0-10)" type="number" value={data.silvermanScore || ''} onChange={handleChange('silvermanScore')} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField select fullWidth label="Air Entry" value={data.airEntry} onChange={handleChange('airEntry')} size="small">
                                    {['Bilateral Equal', 'Decreased', 'Asymmetrical'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" gutterBottom>Added Sounds:</Typography>
                                <FormGroup row>
                                    {['Crepitations', 'Rhonchi', 'None'].map((item) => (
                                        <FormControlLabel key={item} control={<Checkbox checked={data.addedSounds?.includes(item) || false} onChange={() => handleAddedSoundsToggle(item)} size="small" />} label={item} />
                                    ))}
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* 7.3 Cardiovascular */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">7.3 Cardiovascular</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField select fullWidth label="Color" value={data.color} onChange={handleChange('color')} size="small">
                                    {['Pink', 'Pale', 'Cyanosed', 'Mottled'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Capillary Refill Time (sec)" type="number" value={data.capillaryRefillTime} onChange={handleChange('capillaryRefillTime')} size="small" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Heart Sounds" value={data.heartSounds} onChange={handleChange('heartSounds')} size="small" placeholder="S1, S2 Normal/Abnormal" />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">Murmur?</FormLabel>
                                    <RadioGroup row value={data.murmur ? 'Yes' : 'No'} onChange={(e) => onChange('murmur', e.target.value === 'Yes')}>
                                        <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                                        <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                                    </RadioGroup>
                                </FormControl>
                                {data.murmur && <TextField fullWidth label="Murmur Description" value={data.murmurDescription || ''} onChange={handleChange('murmurDescription')} size="small" sx={{ mt: 1 }} />}
                            </Grid>
                            <Grid item xs={6}>
                                <TextField select fullWidth label="Pulses" value={data.pulses} onChange={handleChange('pulses')} size="small">
                                    {['Normal', 'Weak', 'Bounding'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                                </TextField>
                                {data.pulses !== 'Normal' && <TextField fullWidth label="Pulse Description" value={data.pulseDescription || ''} onChange={handleChange('pulseDescription')} size="small" sx={{ mt: 1 }} />}
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* 7.4 Abdomen & GI */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">7.4 Abdomen & GI</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <FormControlLabel control={<Checkbox checked={data.abdominalDistension} onChange={(e) => onChange('abdominalDistension', e.target.checked)} size="small" />} label="Abdominal Distension" />
                            </Grid>
                            <Grid item xs={4}>
                                <FormControlLabel control={<Checkbox checked={data.liverSpleenPalpable} onChange={(e) => onChange('liverSpleenPalpable', e.target.checked)} size="small" />} label="Liver/Spleen Palpable" />
                                {data.liverSpleenPalpable && <TextField fullWidth label="Size (cm)" value={data.liverSpleenSize || ''} onChange={handleChange('liverSpleenSize')} size="small" sx={{ mt: 1 }} />}
                            </Grid>
                            <Grid item xs={4}>
                                <TextField select fullWidth label="Bowel Sounds" value={data.bowelSounds} onChange={handleChange('bowelSounds')} size="small">
                                    {['Present', 'Absent', 'Hyperactive'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField select fullWidth label="Feeding Tolerance" value={data.feedingTolerance} onChange={handleChange('feedingTolerance')} size="small">
                                    {['NPO', 'Tolerating', 'Vomiting', 'Abdominal Distension'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* 7.5 Skin & Others */}
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">7.5 Skin & Others</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="body2" gutterBottom>Skin Findings:</Typography>
                                <FormGroup row>
                                    {['Jaundice', 'Petechiae', 'Rash', 'Birthmark', 'Normal', 'Other'].map((item) => (
                                        <FormControlLabel key={item} control={<Checkbox checked={data.skinFindings?.includes(item) || false} onChange={() => handleSkinFindingsToggle(item)} size="small" />} label={item} />
                                    ))}
                                </FormGroup>
                                {data.skinFindings?.includes('Other') && <TextField fullWidth label="Other Skin Details" value={data.otherSkin || ''} onChange={handleChange('otherSkin')} size="small" sx={{ mt: 1 }} />}
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth multiline rows={2} label="Congenital Anomalies Observed" value={data.congenitalAnomalies} onChange={handleChange('congenitalAnomalies')} size="small" />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>Temp. of Extremities</FormLabel>
                                    <RadioGroup row value={data.extremitiesTemp} onChange={handleChange('extremitiesTemp')}>
                                        <FormControlLabel value="Warm" control={<Radio size="small" />} label="Warm" />
                                        <FormControlLabel value="Cold" control={<Radio size="small" />} label="Cold" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

            </CardContent>
        </Card>
    );
};

export default SystemicExamSection;
