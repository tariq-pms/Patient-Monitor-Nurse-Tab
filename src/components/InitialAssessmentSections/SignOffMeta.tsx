import React, { useEffect } from 'react';
import { Card, CardContent, Typography, Grid, TextField, Box } from '@mui/material';
import { SignOff } from './types';

interface Props {
    data: SignOff;
    onChange: (field: keyof SignOff, value: any) => void;
    userRole?: string; // To potentially pre-fill designation
}

const SignOffMetaSection: React.FC<Props> = ({ data, onChange, userRole }) => {
    const handleChange = (field: keyof SignOff) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    // Auto-set time on mount if not set (or could be controlled by parent)
    useEffect(() => {
        if (!data.dateOfAssessment) {
            onChange('dateOfAssessment', new Date().toISOString().split('T')[0]);
        }
        if (!data.timeOfAssessment) {
            const now = new Date();
            onChange('timeOfAssessment', `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
        }
    }, []);

    return (
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#f9f9f9' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#555', fontWeight: 'bold', mb: 2 }}>
                    11. SIGN-OFF
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Admitting Doctor"
                            value={data.admittingDoctor}
                            InputProps={{ readOnly: true }} // Should come from context/props
                            variant="filled"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Designation"
                            value={data.designation}
                            onChange={handleChange('designation')}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Date"
                            value={data.dateOfAssessment}
                            onChange={handleChange('dateOfAssessment')}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            fullWidth
                            type="time"
                            label="Time"
                            value={data.timeOfAssessment}
                            onChange={handleChange('timeOfAssessment')}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Co-signing Consultant (Optional)"
                            value={data.coSigningConsultant || ''}
                            onChange={handleChange('coSigningConsultant')}
                            size="small"
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default SignOffMetaSection;
