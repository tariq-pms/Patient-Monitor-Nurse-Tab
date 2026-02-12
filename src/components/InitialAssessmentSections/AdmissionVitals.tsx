import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, InputAdornment, Box } from '@mui/material';
import { AdmissionVitals } from './types';

interface Props {
    data: AdmissionVitals;
    onChange: (field: keyof AdmissionVitals, value: any) => void;
}

const AdmissionVitalsSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof AdmissionVitals) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    // Helper to calculate MAP if needed, but for now we just show inputs as per spec
    // Spec says: Mean arterial pressure (auto-calculated, read-only).
    const calculateMAP = () => {
        const sys = parseFloat(data.bpSystolic);
        const dia = parseFloat(data.bpDiastolic);
        if (!isNaN(sys) && !isNaN(dia)) {
            return ((sys + 2 * dia) / 3).toFixed(0);
        }
        return '';
    };

    return (
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                    6. ADMISSION VITALS
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6} md={2}>
                        <TextField
                            fullWidth
                            label="Weight"
                            type="number"
                            value={data.weight}
                            onChange={handleChange('weight')}
                            InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            fullWidth
                            label="Temp"
                            type="number"
                            value={data.temp}
                            onChange={handleChange('temp')}
                            InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            fullWidth
                            label="HR"
                            type="number"
                            value={data.heartRate}
                            onChange={handleChange('heartRate')}
                            InputProps={{ endAdornment: <InputAdornment position="end">bpm</InputAdornment> }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            fullWidth
                            label="RR"
                            type="number"
                            value={data.respiratoryRate}
                            onChange={handleChange('respiratoryRate')}
                            InputProps={{ endAdornment: <InputAdornment position="end">/min</InputAdornment> }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            fullWidth
                            label="SpO₂"
                            type="number"
                            value={data.spo2}
                            onChange={handleChange('spo2')}
                            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            fullWidth
                            label="RBS"
                            type="number"
                            value={data.bloodGlucose}
                            onChange={handleChange('bloodGlucose')}
                            InputProps={{ endAdornment: <InputAdornment position="end">mg/dL</InputAdornment> }}
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                                label="BP Sys"
                                type="number"
                                value={data.bpSystolic}
                                onChange={handleChange('bpSystolic')}
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <Typography>/</Typography>
                            <TextField
                                label="BP Dia"
                                type="number"
                                value={data.bpDiastolic}
                                onChange={handleChange('bpDiastolic')}
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="MAP"
                                value={calculateMAP()}
                                InputProps={{ readOnly: true }}
                                size="small"
                                sx={{ flex: 1, bgcolor: '#f5f5f5' }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            select
                            label="Pain Score"
                            value={data.painScore}
                            onChange={handleChange('painScore')}
                            SelectProps={{ native: true }}
                            size="small"
                        >
                            <option value=""></option>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                        </TextField>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default AdmissionVitalsSection;
