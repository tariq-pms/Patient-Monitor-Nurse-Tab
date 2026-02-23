
import React from 'react';
import { Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface DischargePrintTemplateProps {
    data: any;
}

const DischargePrintTemplate: React.FC<DischargePrintTemplateProps> = ({ data }) => {

    const styles = {
        headerText: { fontSize: '10px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' as const, mb: 0.5 },
        valueText: { fontSize: '12px', color: '#1E293B', fontWeight: 600 },
        sectionHeader: {
            bgcolor: 'transparent',
            color: '#94A3B8',
            fontSize: '11px',
            fontWeight: 700,
            py: 1,
            borderBottom: '1px solid #E2E8F0',
            mb: 2,
            mt: 3,
            textTransform: 'uppercase' as const
        },
        tableHeader: { bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 700, fontSize: '11px' },
        tableCell: { fontSize: '11px', color: '#334155', py: 0.75, borderBottom: '1px solid #F1F5F9' },
        boxLabel: { fontSize: '10px', color: '#64748B', mb: 0.5 },
        boxValue: { fontSize: '12px', fontWeight: 600, color: '#0F172A' }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        // Assuming timeString is HH:mm
        const [hours, minutes] = timeString.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    return (
        <Box sx={{ p: 4, bgcolor: '#FFFFFF', maxWidth: '210mm', mx: 'auto', minHeight: '297mm' }}>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, borderBottom: '2px solid #F1F5F9', pb: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ color: '#E11D48', fontWeight: 800, mb: 0 }}>borneo<span style={{ fontSize: '12px', verticalAlign: 'super', color: '#94A3B8' }}>®</span></Typography>
                    <Box sx={{ bgcolor: '#0EA5E9', color: 'white', px: 1, py: 0.5, borderRadius: 0.5, display: 'inline-block', mb: 1, fontSize: '10px', fontWeight: 700 }}>MOTHER & CHILD CARE HOSPITAL</Box>
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748B', lineHeight: 1.2 }}>
                        Shree Vallabh Nagar,<br />
                        Mumbai Naka, Nashik<br />
                        422001.
                    </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                    <Box sx={{ bgcolor: '#F1F5F9', py: 1, px: 2, borderRadius: 1, mb: 2, display: 'inline-block' }}>
                        <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '14px' }}>DISCHARGE SUMMARY</Typography>
                    </Box>
                    <Grid container spacing={1} sx={{ width: '250px', ml: 'auto' }}>
                        <Grid item xs={4}><Typography sx={styles.boxLabel}>B/O:</Typography></Grid>
                        <Grid item xs={8}><Typography sx={{ ...styles.boxValue, textAlign: 'right' }}>{data.baby_name}</Typography></Grid>

                        <Grid item xs={4}><Typography sx={styles.boxLabel}>UHID:</Typography></Grid>
                        <Grid item xs={8}><Typography sx={{ ...styles.boxValue, textAlign: 'right' }}>{data.uhid}</Typography></Grid>

                        <Grid item xs={4}><Typography sx={styles.boxLabel}>GA:</Typography></Grid>
                        <Grid item xs={8}><Typography sx={{ ...styles.boxValue, textAlign: 'right' }}>{data.gestation_weeks} W {data.gestation_days} D</Typography></Grid>

                        <Grid item xs={4}><Typography sx={styles.boxLabel}>Current Wt:</Typography></Grid>
                        <Grid item xs={8}><Typography sx={{ ...styles.boxValue, textAlign: 'right', color: '#E11D48' }}>{data.final_vitals.weight_kg} kg</Typography></Grid>
                    </Grid>
                </Box>
            </Box>

            {/* 01. IDENTIFIERS & ADMIN */}
            <Typography sx={styles.sectionHeader}>01. IDENTIFIERS & ADMIN</Typography>
            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={3}><Typography sx={styles.headerText}>UHID</Typography><Typography sx={styles.valueText}>{data.uhid}</Typography></Grid>
                    <Grid item xs={3}><Typography sx={styles.headerText}>IP Number</Typography><Typography sx={styles.valueText}>{data.ip_number}</Typography></Grid>
                    <Grid item xs={3}><Typography sx={styles.headerText}>Baby Name</Typography><Typography sx={styles.valueText}>{data.baby_name}</Typography></Grid>
                    <Grid item xs={3}><Typography sx={styles.headerText}>Age at Outcome</Typography><Typography sx={styles.valueText}>{data.age_days || '-'} Days</Typography></Grid>

                    <Grid item xs={3}><Typography sx={styles.headerText}>Sex</Typography><Typography sx={styles.valueText}>{data.sex}</Typography></Grid>
                    <Grid item xs={3}><Typography sx={styles.headerText}>Parent Mobile</Typography><Typography sx={styles.valueText}>{data.parent_mobile}</Typography></Grid>
                    <Grid item xs={3}><Typography sx={styles.headerText}>Department/Unit</Typography><Typography sx={styles.valueText}>{data.department}</Typography></Grid>
                    <Grid item xs={3}><Typography sx={styles.headerText}>Payer/Scheme</Typography><Typography sx={styles.valueText}>{data.payer}</Typography></Grid>

                    <Grid item xs={12}><Typography sx={styles.headerText}>Treating Doctors</Typography><Typography sx={{ ...styles.valueText, color: '#0EA5E9' }}>{data.treating_doctors.join(', ')}</Typography></Grid>
                    <Grid item xs={12}><Typography sx={styles.headerText}>Full Address</Typography><Typography sx={styles.valueText}>{data.address}</Typography></Grid>
                </Grid>
            </Box>

            {/* 02. DISCHARGE STATUS & DATES */}
            <Typography sx={styles.sectionHeader}>02. DISCHARGE STATUS & DATES</Typography>
            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={3}><Typography sx={styles.headerText}>Discharge Type</Typography>
                        <Box sx={{ bgcolor: '#DCFCE7', color: '#166534', px: 1, py: 0.5, borderRadius: 0.5, display: 'inline-block', fontSize: '11px', fontWeight: 700 }}>
                            {data.discharge_type?.toUpperCase()}
                        </Box>
                    </Grid>
                    <Grid item xs={3}><Typography sx={styles.headerText}>Status</Typography><Typography sx={styles.valueText}>{data.status?.toUpperCase()}</Typography></Grid>

                    <Grid item xs={3}><Typography sx={styles.headerText}>Admission</Typography><Typography sx={styles.valueText}>{new Date(data.admission_datetime).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</Typography></Grid>
                    <Grid item xs={3}><Typography sx={styles.headerText}>Discharge</Typography><Typography sx={styles.valueText}>{formatDate(data.outcome_date)}, {formatTime(data.outcome_time)}</Typography></Grid>
                </Grid>
            </Box>

            {/* 03. MATERNAL & BIRTH HISTORY */}
            <Typography sx={styles.sectionHeader}>03. MATERNAL & BIRTH HISTORY</Typography>
            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={3}><Typography sx={styles.headerText}>Mother's Age:</Typography></Grid>
                    <Grid item xs={3}><Typography sx={{ ...styles.valueText, textAlign: 'right' }}>{data.mother_age} Years</Typography></Grid>
                    <Grid item xs={3}><Typography sx={styles.headerText}>Blood Group:</Typography></Grid>
                    <Grid item xs={3}><Typography sx={{ ...styles.valueText, textAlign: 'right' }}>{data.mother_blood_group}</Typography></Grid>

                    <Grid item xs={3}><Typography sx={styles.headerText}>Mode of Delivery:</Typography></Grid>
                    <Grid item xs={3}><Typography sx={{ ...styles.valueText, textAlign: 'right' }}>{data.mode_of_delivery}</Typography></Grid>
                    <Grid item xs={3}><Typography sx={styles.headerText}>Indication:</Typography></Grid>
                    <Grid item xs={3}><Typography sx={{ ...styles.valueText, textAlign: 'right' }}>{data.lscs_indication || '-'}</Typography></Grid>
                </Grid>
                <Box sx={{ borderTop: '1px dashed #CBD5E1', pt: 2 }}>
                    <Typography sx={styles.headerText}>Maternal Complications / Antenatal History:</Typography>
                    <Typography sx={{ fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
                        {data.obstetric_history}. {data.maternal_complications.length > 0 ? data.maternal_complications.join(', ') : 'No complications reported'}.
                    </Typography>
                </Box>
            </Box>

            {/* 04. DIAGNOSIS */}
            <Typography sx={styles.sectionHeader}>04. PROVISIONAL DIAGNOSIS</Typography>
            <Box sx={{ pl: 2 }}>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '12px', color: '#334155' }}>
                    {data.provisional_diagnosis?.split('\n').map((line: string, i: number) => (
                        <li key={i} style={{ marginBottom: '4px' }}>{line}</li>
                    ))}
                </ul>
            </Box>

            {/* 05. ANTHROPOMETRY & VITALS */}
            <Typography sx={styles.sectionHeader}>05. ANTHROPOMETRY & VITALS</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={styles.tableHeader}>PARAMETER</TableCell>
                            <TableCell sx={styles.tableHeader}>AT ADMISSION</TableCell>
                            <TableCell sx={styles.tableHeader}>AT DISCHARGE</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={styles.tableCell}>Weight</TableCell>
                            <TableCell sx={styles.tableCell}>{data.adm_vitals.weight_g ? `${(data.adm_vitals.weight_g / 1000).toFixed(2)} kg` : '-'}</TableCell>
                            <TableCell sx={{ ...styles.tableCell, color: '#E11D48', fontWeight: 700 }}>{data.final_vitals.weight_kg ? `${data.final_vitals.weight_kg} kg` : '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={styles.tableCell}>Head Circumference</TableCell>
                            <TableCell sx={styles.tableCell}>-</TableCell>
                            <TableCell sx={styles.tableCell}>{data.anthropometry?.hc_cm} cm</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={styles.tableCell}>Length</TableCell>
                            <TableCell sx={styles.tableCell}>-</TableCell>
                            <TableCell sx={styles.tableCell}>{data.anthropometry?.length_cm} cm</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={styles.tableCell}>Heart Rate</TableCell>
                            <TableCell sx={styles.tableCell}>{data.adm_vitals.hr} /min</TableCell>
                            <TableCell sx={styles.tableCell}>{data.final_vitals.hr} /min</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={styles.tableCell}>Respiratory Rate</TableCell>
                            <TableCell sx={styles.tableCell}>{data.adm_vitals.rr} /min</TableCell>
                            <TableCell sx={styles.tableCell}>{data.final_vitals.rr} /min</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={styles.tableCell}>SpO2</TableCell>
                            <TableCell sx={styles.tableCell}>{data.adm_vitals.spo2}%</TableCell>
                            <TableCell sx={styles.tableCell}>{data.final_vitals.spo2}%</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 06. FINAL DIAGNOSIS */}
            <Typography sx={styles.sectionHeader}>06. FINAL DIAGNOSIS</Typography>
            <Box sx={{ pl: 2 }}>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>
                    {data.final_diagnosis?.split('\n').map((line: string, i: number) => (
                        <li key={i} style={{ marginBottom: '4px' }}>{line}</li>
                    ))}
                </ul>
            </Box>

            {/* 07. COURSE IN HOSPITAL */}
            <Typography sx={styles.sectionHeader}>07. COURSE IN HOSPITAL</Typography>
            <Box sx={{ pl: 0 }}>
                {Object.entries(data.course).map(([key, value]: [string, any]) => (
                    value ? (
                        <Box key={key} sx={{ mb: 1.5 }}>
                            <Typography component="span" sx={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', textTransform: 'capitalize' }}>{key}: </Typography>
                            <Typography component="span" sx={{ fontSize: '12px', color: '#334155' }}>{value}</Typography>
                        </Box>
                    ) : null
                ))}
            </Box>

            {/* TREATMENT GIVEN */}
            <Box sx={{ mt: 3, mb: 2 }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>+</span> TREATMENT / MEDICATIONS GIVEN
                </Typography>
                <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 1, border: '1px solid #E2E8F0' }}>
                    <Grid container spacing={1}>
                        {Object.entries(data.treatment).map(([key, value]: [string, any]) => (
                            value ? (
                                <Grid item xs={6} key={key} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ width: 4, height: 4, bgcolor: '#0EA5E9', borderRadius: '50%', mr: 1 }} />
                                    <Typography sx={{ fontSize: '12px', color: '#334155' }}>{value}</Typography>
                                </Grid>
                            ) : null
                        ))}
                    </Grid>
                </Box>
            </Box>

            {/* 08. DISCHARGE ADVICE */}
            <Typography sx={styles.sectionHeader}>08. DISCHARGE ADVICE & MEDICATIONS</Typography>
            <Box sx={{ bgcolor: '#F0F9FF', p: 2, borderRadius: 2, border: '1px solid #BAE6FD', display: 'flex', gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                    <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '12px', color: '#334155' }}>
                        {data.dc_medications?.map((med: any, i: number) => (
                            <li key={i} style={{ marginBottom: '6px' }}>
                                <strong>{med.drug}</strong>: {med.dose} ({med.route}) - {med.frequency}
                            </li>
                        ))}
                        {data.feeding_plan && <li style={{ marginBottom: '6px' }}>{data.feeding_plan}</li>}
                        {data.home_care && <li style={{ marginBottom: '6px' }}>{data.home_care}</li>}
                    </ol>
                </Box>
                <Box sx={{ flex: 1, borderLeft: '1px solid #BAE6FD', pl: 3 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', mb: 1 }}>Follow up:</Typography>
                    <Typography sx={{ fontSize: '12px', color: '#334155', mb: 2 }}>
                        {data.followup.instructions}<br />
                        Date: <strong>{formatDate(data.followup.date)}</strong><br />
                        Clinic: {data.followup.clinic}
                    </Typography>

                    <Typography sx={{ fontSize: '11px', color: '#DC2626', fontWeight: 700, display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{ marginRight: '6px', fontSize: '14px' }}>*</span>
                        Emergency: Bring baby immediately if poor feeding, lethargy, or fever.
                    </Typography>
                </Box>
            </Box>

            {/* Footer Signatures */}
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E2E8F0', pt: 2 }}>
                <Box>
                    <Typography sx={{ fontSize: '11px', fontStyle: 'italic', color: '#64748B', mb: 4 }}>
                        "I/We have been explained about Disease and Medication"
                    </Typography>
                    <Box sx={{ borderTop: '1px solid #94A3B8', width: '200px', pt: 0.5 }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Parent's Signature</Typography>
                        <Typography sx={{ fontSize: '10px', color: '#64748B' }}>Acknowledged receipt of summary</Typography>
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                    <Box sx={{ mb: 1 }}>
                        {data.signatures?.approver_signature && <img src={data.signatures.approver_signature} alt="Doctor Sig" style={{ height: '40px' }} />}
                    </Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>Dr. Anjali Patil</Typography>
                    <Typography sx={{ fontSize: '11px', color: '#0EA5E9' }}>Consultant Neonatologist</Typography>
                    <Typography sx={{ fontSize: '10px', color: '#94A3B8' }}>Reg No: MMC 2012/04/1234</Typography>
                </Box>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#CBD5E1' }}>
                <Typography fontSize="inherit">Printed By: {data.summary_prepared_by}</Typography>
                <Typography fontSize="inherit">Printed At: {new Date().toLocaleString()}</Typography>
            </Box>

        </Box>
    );
};

export default DischargePrintTemplate;
