import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Chip, Stack } from '@mui/material';
import { BabyIdentifiers } from './types';

interface Props {
    data: BabyIdentifiers;
    onChange: (field: keyof BabyIdentifiers, value: any) => void;
}

const BabyIdentifiersSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof BabyIdentifiers) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    const handleModeOfDeliveryChange = (mode: string) => {
        onChange('modeOfDelivery', mode);
    };

    return (
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                    1. BABY IDENTIFIERS
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Baby Name"
                            value={data.babyName}
                            onChange={handleChange('babyName')}
                            placeholder="Baby of [Mother's Name]"
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="UHID"
                            value={data.uhid}
                            InputProps={{ readOnly: true }}
                            variant="filled"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="IP / NICU Admission No"
                            value={data.ipAdmissionNo}
                            InputProps={{ readOnly: true }}
                            variant="filled"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Bed / Crib Number"
                            value={data.bedNumber}
                            onChange={handleChange('bedNumber')}
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Sex</FormLabel>
                            <RadioGroup
                                row
                                value={data.sex}
                                onChange={handleChange('sex')}
                            >
                                <FormControlLabel value="Male" control={<Radio size="small" />} label="Male" />
                                <FormControlLabel value="Female" control={<Radio size="small" />} label="Female" />
                                <FormControlLabel value="Ambiguous" control={<Radio size="small" />} label="Ambiguous" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date of Birth"
                                    value={data.dateOfBirth}
                                    onChange={handleChange('dateOfBirth')}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="time"
                                    label="Time of Birth"
                                    value={data.timeOfBirth}
                                    onChange={handleChange('timeOfBirth')}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Place of Birth"
                            value={data.placeOfBirth}
                            onChange={handleChange('placeOfBirth')}
                            size="small"
                        >
                            <MenuItem value="Inborn">Inborn - this hospital</MenuItem>
                            <MenuItem value="Outborn - Other Hospital">Outborn - other hospital</MenuItem>
                            <MenuItem value="Outborn - Home/Other">Outborn - home / other</MenuItem>
                        </TextField>
                    </Grid>
                    {data.placeOfBirth.includes('Outborn') && (
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Referring Hospital"
                                value={data.referringHospital || ''}
                                onChange={handleChange('referringHospital')}
                                size="small"
                            />
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>Mode of Delivery</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {['Normal Vaginal', 'Assisted Vaginal', 'Elective LSCS', 'Emergency LSCS', 'Other'].map((mode) => (
                                <Chip
                                    key={mode}
                                    label={mode}
                                    clickable
                                    color={data.modeOfDelivery === mode ? "primary" : "default"}
                                    onClick={() => handleModeOfDeliveryChange(mode)}
                                    variant={data.modeOfDelivery === mode ? "filled" : "outlined"}
                                />
                            ))}
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default BabyIdentifiersSection;
