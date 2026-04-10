import fs from 'fs';

let content = fs.readFileSync('src/components/NICUDischargeModal.tsx', 'utf-8');

// 1. Remove DischargePrintTemplate import if it exists
content = content.replace(/import DischargePrintTemplate from '.\/DischargePrintTemplate';/g, '');

// 2. Define the new render function content to inject before the final return statement.
const printStyles = 
    const A4_PAGE_STYLE = {
        width: "210mm",
        minHeight: "297mm",
        backgroundColor: "#FFFFFF",
        color: "#000",
        padding: "15mm 20mm",
        margin: "0 auto",
        marginBottom: "20mm",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        boxShadow: "none",
        borderRadius: 0,
        border: 'none',
        boxSizing: "border-box",
    } as const;

    const printStyles = {
        headerText: { fontSize: '10px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' as const, mb: 0.5 },
        valueText: { fontSize: '11px', color: '#0F172A', fontWeight: 700 },
        sectionHeader: {
            bgcolor: 'transparent',
            color: '#94A3B8',
            fontSize: '10px',
            fontWeight: 700,
            pb: 0.5,
            borderBottom: '1px solid #E2E8F0',
            mb: 1.5,
            mt: 3,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px'
        },
        tableCell: { fontSize: '11px', color: '#334155', py: 1.5, borderBottom: '1px solid #F1F5F9' },
        tableHeaderCell: { fontSize: '10px', color: '#64748B', py: 1, borderBottom: '1px solid #E2E8F0', fontWeight: 700, bgcolor: '#F8FAFC' },
        boxLabel: { fontSize: '9px', color: '#94A3B8', mb: 0.5, fontWeight: 600, textTransform: 'uppercase' as const },
        boxValue: { fontSize: '11px', fontWeight: 700, color: '#1E293B' },
        rowBg: { bgcolor: '#F8FAFC', borderRadius: 2, p: 2, mb: 2 }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const h = parseInt(hours, 10); const ampm = h >= 12 ? 'PM' : 'AM'; const h12 = h % 12 || 12;
        return \\\\\\:\\\ \\\\\\;
    };

    const renderHeader = (isFirstPage: boolean = true) => (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img src={\\\data:image/png;base64,\\\\\\} alt="Borneo Logo" style={{ width: 64, height: 64, objectFit: 'contain' }} />
                    <Box>
                        <Typography variant="caption" sx={{ display: 'block', color: '#64748B', lineHeight: 1.2, fontSize: '9px' }}>
                            Shree Vallabh Nagar,<br />Mumbai Naka, Nashik<br />422001.
                        </Typography>
                    </Box>
                </Box>

                {isFirstPage ? (
                    <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, p: 1.5, width: '300px' }}>
                        <Grid container spacing={1}>
                            <Grid item xs={5}><Typography sx={{...printStyles.boxLabel, display: 'inline', mr: 1}}>B/O:</Typography><Typography sx={{...printStyles.boxValue, display: 'inline'}}>{formData.baby_name}</Typography></Grid>
                            <Grid item xs={7} sx={{textAlign: 'right'}}><Typography sx={{...printStyles.boxLabel, display: 'inline', mr: 1}}>UHID:</Typography><Typography sx={{...printStyles.boxValue, display: 'inline'}}>{formData.uhid}</Typography></Grid>
                            
                            <Grid item xs={5}><Typography sx={{...printStyles.boxLabel, display: 'inline', mr: 1}}>GA:</Typography><Typography sx={{...printStyles.boxValue, display: 'inline'}}>{formData.gestation_weeks}W {formData.gestation_days}D</Typography></Grid>
                            <Grid item xs={7} sx={{textAlign: 'right'}}><Typography sx={{...printStyles.boxLabel, display: 'inline', mr: 1}}>CURRENT WT:</Typography><Typography sx={{...printStyles.boxValue, display: 'inline'}}>{formData.final_vitals?.weight_kg || formData.adm_vitals?.weight_g ? (formData.final_vitals?.weight_kg || (formData.adm_vitals.weight_g/1000).toFixed(2)) + ' kg' : '-'}</Typography></Grid>
                        </Grid>
                    </Box>
                ) : null}
            </Box>
            
            {isFirstPage && (
                <Box sx={{ bgcolor: '#F1F5F9', py: 0.5, px: 2, borderRadius: 1, mt: 2, display: 'inline-block' }}>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '11px', letterSpacing: '0.5px' }}>DISCHARGE SUMMARY</Typography>
                </Box>
            )}
        </Box>
    );

    const renderFooter = (page: number, total: number = 3) => (
        <Box className="page-footer" sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {page === 3 ? (
                <Typography sx={{ fontSize: '9px', color: '#94A3B8' }}>
                    Printed By: {formData.summary_prepared_by || 'User'}
                </Typography>
            ) : <Box />}
            {page === 3 ? (
                 <Typography sx={{ fontSize: '9px', color: '#94A3B8' }}>
                    Printed At: {new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}
                </Typography>
            ) : <Box />}
            <Typography sx={{ fontSize: '9px', color: '#94A3B8', fontWeight: 600 }}>
                Page 0{page}/0{total}
            </Typography>
        </Box>
    );

    const renderPrintTemplate = () => (
        <Box sx={{ bgcolor: '#F1F5F9', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
           {/* PAGE 1 */}
            <Card className="MuiCard-root pdf-page" sx={A4_PAGE_STYLE}>
                {renderHeader(true)}

                <Typography sx={{...printStyles.sectionHeader, mt: 4}}>01. IDENTIFIERS & ADMIN</Typography>
                <Box sx={printStyles.rowBg}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>UHID</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formData.uhid}</Typography></Grid></Grid></Grid>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>IP Number</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formData.ip_number}</Typography></Grid></Grid></Grid>
                        
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Baby Name</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formData.baby_name}</Typography></Grid></Grid></Grid>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Age at Outcome</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formData.age_days || '-'} Days</Typography></Grid></Grid></Grid>

                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Sex</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formData.sex}</Typography></Grid></Grid></Grid>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Parent Mobile</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formData.parent_mobile}</Typography></Grid></Grid></Grid>

                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Department/Unit</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formData.department}</Typography></Grid></Grid></Grid>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Payer/Scheme</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formData.payer}</Typography></Grid></Grid></Grid>

                         <Grid item xs={12}><Grid container><Grid item xs={2.5}><Typography sx={printStyles.headerText}>Treating Doctors</Typography></Grid><Grid item xs={9.5}><Typography sx={{...printStyles.valueText, color: '#0EA5E9'}}>{formData.treating_doctors?.join(', ')}</Typography></Grid></Grid></Grid>
                         <Grid item xs={12}><Grid container><Grid item xs={2.5}><Typography sx={printStyles.headerText}>Full Address</Typography></Grid><Grid item xs={9.5}><Typography sx={printStyles.valueText}>{formData.address}</Typography></Grid></Grid></Grid>
                    </Grid>
                </Box>

                <Typography sx={printStyles.sectionHeader}>02. DISCHARGE STATUS & DATES</Typography>
                <Box sx={printStyles.rowBg}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Discharge Type</Typography></Grid><Grid item xs={7}>
                            <Box sx={{ bgcolor: '#DCFCE7', color: '#166534', px: 1, py: 0.5, borderRadius: 0.5, display: 'inline-block', fontSize: '9px', fontWeight: 700 }}>{formData.discharge_type?.toUpperCase()}</Box>
                        </Grid></Grid></Grid>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Status</Typography></Grid><Grid item xs={7}><Typography sx={{...printStyles.valueText, textTransform: 'uppercase'}}>{formData.status}</Typography></Grid></Grid></Grid>

                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Admission</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formData.admission_datetime ? new Date(formData.admission_datetime).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}</Typography></Grid></Grid></Grid>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Discharge</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formatDate(formData.outcome_date)}{formData.outcome_time ? \\\, \\\\\\ : ''}</Typography></Grid></Grid></Grid>

                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Summary Created</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formData.summary_created_at ? new Date(formData.summary_created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}</Typography></Grid></Grid></Grid>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Last Modified</Typography></Grid><Grid item xs={7}><Typography sx={printStyles.valueText}>{formData.summary_modified_at ? new Date(formData.summary_modified_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}</Typography></Grid></Grid></Grid>
                    </Grid>
                </Box>

                <Typography sx={printStyles.sectionHeader}>03. MATERNAL & BIRTH HISTORY</Typography>
                <Box sx={printStyles.rowBg}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Mother's Age:</Typography></Grid><Grid item xs={7}><Typography sx={{...printStyles.valueText, textAlign: 'right'}}>{formData.mother_age} Years</Typography></Grid></Grid></Grid>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Blood Group:</Typography></Grid><Grid item xs={7}><Typography sx={{...printStyles.valueText, textAlign: 'right'}}>{formData.mother_blood_group}</Typography></Grid></Grid></Grid>

                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Type of Birth:</Typography></Grid><Grid item xs={7}><Typography sx={{...printStyles.valueText, textAlign: 'right'}}>{formData.mode_of_delivery}</Typography></Grid></Grid></Grid>
                        <Grid item xs={6}><Grid container><Grid item xs={5}><Typography sx={printStyles.headerText}>Indication:</Typography></Grid><Grid item xs={7}><Typography sx={{...printStyles.valueText, textAlign: 'right'}}>{formData.lscs_indication || '-'}</Typography></Grid></Grid></Grid>

                        <Grid item xs={12} sx={{ mt: 1 }}>
                            <Typography sx={printStyles.headerText}>Antenatal History:</Typography>
                            <Typography sx={{ fontSize: '11px', color: '#334155', lineHeight: 1.6, mt: 0.5 }}>
                                {formData.obstetric_history ? formData.obstetric_history + '.' : ''} {formData.maternal_complications?.length > 0 ? formData.maternal_complications.join(', ') : 'No complications reported'}.
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Typography sx={printStyles.sectionHeader}>04. PROVISIONAL DIAGNOSIS</Typography>
                <Box sx={{ pl: 2 }}>
                    <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '11px', color: '#1E293B', fontWeight: 600, lineHeight: 1.6 }}>
                        {formData.provisional_diagnosis?.split('\\n').map((line: string, i: number) => (
                            <li key={i} style={{ marginBottom: '4px' }}>{line}</li>
                        ))}
                    </ul>
                </Box>

                {renderFooter(1)}
            </Card>

            {/* PAGE 2 */}
            <Card className="MuiCard-root pdf-page" sx={A4_PAGE_STYLE}>
                {renderHeader(false)}

                <Typography sx={{...printStyles.sectionHeader, mt: 0}}>05. ANTHROPOMETRY & VITALS</Typography>
                <TableContainer elevation={0} sx={{ border: '1px solid #E2E8F0', mb: 3 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={printStyles.tableHeaderCell}>PARAMETER</TableCell>
                                <TableCell sx={printStyles.tableHeaderCell}>AT ADMISSION</TableCell>
                                <TableCell sx={printStyles.tableHeaderCell}>AT DISCHARGE</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={printStyles.tableCell}>Weight</TableCell>
                                <TableCell sx={printStyles.tableCell}>{formData.adm_vitals?.weight_g ? \\\\\\ kg\\\ : '-'}</TableCell>
                                <TableCell sx={{ ...printStyles.tableCell, color: '#E11D48', fontWeight: 700 }}>{formData.final_vitals?.weight_kg ? \\\\\\ kg\\\ : '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={printStyles.tableCell}>Head Circumference</TableCell>
                                <TableCell sx={printStyles.tableCell}>{formData.anthropometry?.hc_cm} cm</TableCell>
                                <TableCell sx={printStyles.tableCell}>{formData.anthropometry?.hc_cm} cm</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={printStyles.tableCell}>Length</TableCell>
                                <TableCell sx={printStyles.tableCell}>{formData.anthropometry?.length_cm} cm</TableCell>
                                <TableCell sx={printStyles.tableCell}>{formData.anthropometry?.length_cm} cm</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={printStyles.tableCell}>Heart Rate</TableCell>
                                <TableCell sx={printStyles.tableCell}>{formData.adm_vitals?.hr} /min</TableCell>
                                <TableCell sx={printStyles.tableCell}>{formData.final_vitals?.hr} /min</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={printStyles.tableCell}>Respiratory Rate</TableCell>
                                <TableCell sx={printStyles.tableCell}>{formData.adm_vitals?.rr} /min</TableCell>
                                <TableCell sx={printStyles.tableCell}>{formData.final_vitals?.rr} /min</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={printStyles.tableCell}>Oxygen Saturation (SpO2)</TableCell>
                                <TableCell sx={printStyles.tableCell}>{formData.adm_vitals?.spo2}%</TableCell>
                                <TableCell sx={printStyles.tableCell}>{formData.final_vitals?.spo2}%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{...printStyles.tableCell, borderBottom: 'none'}}>CRT</TableCell>
                                <TableCell sx={{...printStyles.tableCell, borderBottom: 'none'}}>{formData.adm_vitals?.crt ? '< 3 sec' : '< 3 sec'}</TableCell>
                                <TableCell sx={{...printStyles.tableCell, borderBottom: 'none'}}>{formData.final_vitals?.crt ? '< 3 sec' : '< 3 sec'}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography sx={printStyles.sectionHeader}>06. FINAL DIAGNOSIS</Typography>
                <Box sx={{ pl: 2, mb: 3 }}>
                    <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '11px', color: '#1E293B', fontWeight: 600, lineHeight: 1.6 }}>
                        {formData.final_diagnosis?.split('\\n').map((line: string, i: number) => (
                            <li key={i} style={{ marginBottom: '4px' }}>{line}</li>
                        ))}
                    </ul>
                </Box>

                <Typography sx={printStyles.sectionHeader}>07. COURSE IN HOSPITAL</Typography>
                <Box sx={{ pl: 0 }}>
                    {formData.course && Object.entries(formData.course).map(([key, value]: [string, any]) => (
                        value ? (
                            <Box key={key} sx={{ mb: 2 }}>
                                <Typography component="span" sx={{ fontSize: '11px', fontWeight: 700, color: '#1E293B', textTransform: 'capitalize' }}>{key.replace('_', ' ')}: </Typography>
                                <Typography component="span" sx={{ fontSize: '11px', color: '#334155', lineHeight: 1.6 }}>{value}</Typography>
                            </Box>
                        ) : null
                    ))}
                </Box>

                {renderFooter(2)}
            </Card>

            {/* PAGE 3 */}
            <Card className="MuiCard-root pdf-page" sx={A4_PAGE_STYLE}>
                {renderHeader(false)}

                <Box sx={{ mt: 0, mb: 3 }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center', letterSpacing: '0.5px' }}>
                        <span style={{ marginRight: '8px' }}>+</span> TREATMENT / MEDICATIONS GIVEN
                    </Typography>
                    <Box sx={{ bgcolor: '#F8FAFC', p: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                        <Grid container spacing={2}>
                            {formData.treatment && Object.entries(formData.treatment).map(([key, value]: [string, any]) => (
                                value ? (
                                    <Grid item xs={6} key={key} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <Box sx={{ width: 4, height: 4, bgcolor: '#0EA5E9', borderRadius: '50%', mr: 1.5, mt: 0.75 }} />
                                        <Typography sx={{ fontSize: '11px', color: '#334155', lineHeight: 1.5 }}>{value}</Typography>
                                    </Grid>
                                ) : null
                            ))}
                        </Grid>
                    </Box>
                </Box>

                <Box sx={{ bgcolor: '#F0F9FF', p: 3, borderRadius: 2, display: 'flex', gap: 4, mb: 4 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#0EA5E9', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>08. DISCHARGE ADVICE & MEDICATIONS</Typography>
                        <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '11px', color: '#334155', lineHeight: 1.6 }}>
                            {formData.dc_medications?.map((med: any, i: number) => (
                                <li key={i} style={{ marginBottom: '8px' }}>
                                    <strong>{med.drug}</strong>: {med.dose} ({med.route}) - {med.frequency}
                                </li>
                            ))}
                            {formData.feeding_plan && <li style={{ marginBottom: '8px' }}>{formData.feeding_plan}</li>}
                            {formData.home_care && <li style={{ marginBottom: '8px' }}>{formData.home_care}</li>}
                        </ol>
                    </Box>
                    <Box sx={{ flex: 1, borderLeft: '1px solid #BAE6FD', pl: 3 }}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#1E293B', mb: 1 }}>Follow up:</Typography>
                        <Typography sx={{ fontSize: '11px', color: '#334155', mb: 2 }}>
                            {formData.followup?.instructions}<br />
                            Date: <strong>{formData.followup?.date ? formatDate(formData.followup.date) : ''}</strong><br />
                            Clinic: {formData.followup?.clinic}
                        </Typography>

                        <Typography sx={{ fontSize: '10px', color: '#DC2626', fontWeight: 700, display: 'flex', alignItems: 'flex-start', mt: 2 }}>
                            <span style={{ marginRight: '6px', fontSize: '12px', lineHeight: 1 }}>*</span>
                            Emergency: Bring baby immediately if poor feeding, lethargy, or fever.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 'auto', mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2 }}>
                    <Box>
                        <Typography sx={{ fontSize: '10px', color: '#1E293B', mb: 5 }}>
                            "I/We have been explained about Disease<br/>and Medication"
                        </Typography>
                        <Box sx={{ borderTop: '1px solid #CBD5E1', width: '200px', pt: 0.5, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>Parent's Signature</Typography>
                            <Typography sx={{ fontSize: '9px', color: '#94A3B8' }}>Acknowledged receipt of summary</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ textAlign: 'center', minWidth: '200px' }}>
                        <Box sx={{ mb: 1, minHeight: '50px', display: 'flex', justifyContent: 'center' }}>
                            {formData.signatures?.approver_signature && <img src={formData.signatures.approver_signature} alt="Doctor Sig" style={{ height: '50px', objectFit: 'contain' }} />}
                        </Box>
                        <Box sx={{ borderTop: '1px solid #CBD5E1', pt: 0.5 }}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#1E293B' }}>Dr. Anjali Patil</Typography>
                            <Typography sx={{ fontSize: '10px', color: '#0EA5E9', fontWeight: 600 }}>Consultant Neonatologist</Typography>
                            <Typography sx={{ fontSize: '9px', color: '#94A3B8' }}>Reg No: MMC 2012/04/1234</Typography>
                        </Box>
                    </Box>
                </Box>

                {renderFooter(3)}
            </Card>
        </Box>
    );
;

// 3. Inject printStyles + renderPrintTemplate before "return ("
content = content.replace(/return \(/g, printStyles + '\n\n    return (');

// 4. Replace "<DischargePrintTemplate data={formData} />" with "{renderPrintTemplate()}"
content = content.replace(/<DischargePrintTemplate data=\{formData\} \/>/g, '{renderPrintTemplate()}');

fs.writeFileSync('src/components/NICUDischargeModal.tsx', content, 'utf-8');
console.log('Successfully embedded renderPrintTemplate inside NICUDischargeModal.tsx');
