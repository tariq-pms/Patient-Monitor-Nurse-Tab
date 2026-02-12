import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox } from '@mui/material';
import { RiskCounselling } from './types';

interface Props {
    data: RiskCounselling;
    onChange: (field: keyof RiskCounselling, value: any) => void;
}

const RiskCounsellingSection: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof RiskCounselling) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    return (
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                    10. RISK COUNSELLING
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Prognosis Explained</FormLabel>
                            <RadioGroup
                                row
                                value={data.prognosis}
                                onChange={handleChange('prognosis')}
                            >
                                <FormControlLabel value="Good" control={<Radio size="small" color="success" />} label="Good" />
                                <FormControlLabel value="Guarded" control={<Radio size="small" color="warning" />} label="Guarded" />
                                <FormControlLabel value="Poor" control={<Radio size="small" color="error" />} label="Poor" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={<Checkbox checked={data.counselled} onChange={(e) => onChange('counselled', e.target.checked)} size="small" />}
                            label="Parents Counselled about Condition & Management"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Summary of Counselling"
                            value={data.counsellingSummary || ''}
                            onChange={handleChange('counsellingSummary')}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Medico-Legal Notes (if any)"
                            value={data.medicoLegalNotes}
                            onChange={handleChange('medicoLegalNotes')}
                            size="small"
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default RiskCounsellingSection;
