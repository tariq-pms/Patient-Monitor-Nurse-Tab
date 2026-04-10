import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Card, Divider, Stack
} from '@mui/material';
// import { logoBase64 } from '../utils/logoBase64';
import pmsLogo from '../assets/phx_logo.png';

interface DischargePrintTemplateProps {
    data: any;
     userOrganization?: string;
}

const A4_PAGE_STYLE = {
    width: '210mm',
    height: '297mm',
    padding: '8mm',
    boxSizing: 'border-box' as const,
    backgroundColor: '#fff',
    mx: 'auto',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    overflow: 'hidden',
    color: '#000',
    pageBreakAfter: 'always',
};

/* ─── Shared style tokens ──────────────────────────────────── */
const token = {
    label:   { variant: 'caption'  as const, sx: { color: '#64748B', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block' } },
    value:   { variant: 'body2'    as const, sx: { color: '#1E293B', fontWeight: 600 } },
    section: { variant: 'overline' as const, sx: { color: '#94A3B8', fontWeight: 700, display: 'block', borderBottom: '1px solid #E2E8F0', pb: 0.5, mb: 1.5, letterSpacing: '0.08em' } },
    th:      { variant: 'caption'  as const, sx: { bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 700 } },
    td:      { variant: 'body2'    as const, sx: { color: '#334155', py: 0.75, borderBottom: '1px solid #F1F5F9' } },
};

/* ─── Helpers ──────────────────────────────────────────────── */
const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatDateTime = (d: string) =>
    d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

/* ─── Reusable sub-components ──────────────────────────────── */
const SectionTitle: React.FC<{ children: React.ReactNode; mt?: number }> = ({ children, mt = 2.5 }) => (
    <Typography {...token.section} sx={{ ...token.section.sx, mt }}>
        {children}
    </Typography>
);

const LabelValue: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <Box>
        <Typography {...token.label}>{label}</Typography>
        <Typography {...token.value}>{value || '—'}</Typography>
    </Box>
);


/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
const DischargePrintTemplate: React.FC<DischargePrintTemplateProps> = ({ data,userOrganization }) => {
const [logoDataUrl, setLogoDataUrl] = useState<string>('');
useEffect(() => {
  const fetchOrgData = async () => {
    try {
      const orgUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${userOrganization}`;

      const res = await fetch(orgUrl, {
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
          Accept: "application/fhir+json",
        },
      });

      const orgData = await res.json();

      const logoExt = (orgData.extension || []).find(
        (ext: any) =>
          ext.url === "http://example.org/fhir/StructureDefinition/organization-logo"
      );

      const logoRef = logoExt?.valueReference?.reference;

      if (logoRef) {
        const binaryId = logoRef.replace("Binary/", "");

        const binaryRes = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`,
          {
            headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
              Accept: "application/fhir+json",
            },
          }
        );

        const binaryData = await binaryRes.json();

        if (binaryData.data && binaryData.contentType) {
          setLogoDataUrl(
            `data:${binaryData.contentType};base64,${binaryData.data}`
          );
        }
      }
    } catch (err) {
      console.error("Error fetching logo:", err);
    }
  };

  if (userOrganization) {
    fetchOrgData();
  }
}, [userOrganization]);
    /* ── HEADER ─────────────────────────────────────────────── */
   const renderHeader = (isFirstPage: boolean = true) => (
        <Box sx={{  borderBottom: '1px solid grey', p: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {(logoDataUrl || pmsLogo) && (
                  <Box component="img" src={logoDataUrl || pmsLogo} alt="Logo" sx={{ height: 60, objectFit: 'contain' }} />
              )}
               {isFirstPage && (
              <Box sx={{ textAlign: 'right', position: 'relative', minWidth: '300px' }}>
          
          <Box sx={{ 
            display: 'inline-block',
            bgcolor: '#e0e4e7', 
            px: 2, 
            py: 0.3, 
            borderRadius: '4px 4px 0 0',
            mr: 5
          }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#333' }}>
             DISCHARGE SUMMARY
            </Typography>
          </Box>
        
          <Box sx={{ border: '1px solid #d1d9e0', borderRadius: '8px', p: 1.5, bgcolor: '#fff' }}>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Grid item display="flex" gap={1}>
                <Typography variant="subtitle2" sx={{ color: '#90a4ae'}}>B/O:</Typography>
                <Typography  variant="subtitle2" sx={{ fontWeight: 'bold'}}>{data.baby_name}</Typography>
              </Grid>
              <Grid item display="flex" gap={1}>
                <Typography variant="subtitle2" sx={{ color: '#90a4ae'}}>UHID:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold'}}>{data.uhid}</Typography>
              </Grid>
            </Grid>
        
            <Box sx={{ borderBottom: '1px solid #e0e4e7', my: 1 }} />
        
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item display="flex" gap={1}>
                <Typography variant="subtitle2" sx={{ color: '#90a4ae' }}>GA:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold'}}>{data.gestation_weeks} {data.gestation_weeks ? 'W' : ''} {data.gestation_days} {data.gestation_days ? 'D' : ''}</Typography>
              </Grid>
              <Grid item display="flex" gap={1}>
                <Typography variant="subtitle2" sx={{ color: '#90a4ae'}}>ADMISSION NO:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>--</Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>)}
            </Box>


     
    );
    /* ── FOOTER ─────────────────────────────────────────────── */
    const renderFooter = (page: number, total = 3) => (
        <Box sx={{ position: 'absolute', bottom: '6mm', left: '8mm', right: '8mm', borderTop: '1px solid #E2E8F0', pt: 0.75 }}>
            {/* Row 1: Hospital name + Page x of y */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                    {data.hospital_name || 'NICU Department — Discharge Summary'}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
                    Page {page} of {total}
                </Typography>
            </Stack>

            {/* Row 2: Confidentiality notice + print metadata */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Confidential medical record — not for unauthorised disclosure
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Printed: {new Date().toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true,
                    })}
                   
                </Typography>
            </Stack>
        </Box>
    );

    /* ════════════════════════════════════════════════════════
       PAGE 1 — Identifiers, Dates, Maternal Hx, Diagnosis
    ════════════════════════════════════════════════════════ */
    return (
        <Box sx={{ bgcolor: '#F1F5F9', display: 'flex', flexDirection: 'column', gap: 2 }}>

            <Card className="pdf-page" sx={A4_PAGE_STYLE}>
                {renderHeader(true)}

                {/* 01 — Identifiers & Admin */}
                <SectionTitle mt={0}>01 · Identifiers &amp; Admin</SectionTitle>
                <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2 }}>
                    <Grid container spacing={1.5}>
                        <Grid item xs={3}><LabelValue label="UHID"             value={data.uhid} /></Grid>
                        <Grid item xs={3}><LabelValue label="IP Number"         value={''} /></Grid>
                        <Grid item xs={3}><LabelValue label="Baby Name"         value={data.baby_name} /></Grid>
                        <Grid item xs={3}><LabelValue label="Age at Outcome"    value={data.age_days ? `${data.age_days} days` : undefined} /></Grid>

                        <Grid item xs={3}><LabelValue label="Sex"               value={data.sex} /></Grid>
                        <Grid item xs={3}><LabelValue label="Parent Mobile"     value={data.parent_mobile} /></Grid>
                        <Grid item xs={3}><LabelValue label="Department / Unit" value={data.department} /></Grid>
                        <Grid item xs={3}><LabelValue label="Payer / Scheme"    value={data.payer} /></Grid>

                        <Grid item xs={6}>
                            <Typography {...token.label}>Treating Doctors</Typography>
                            <Typography variant="body2" sx={{ color: '#0EA5E9', fontWeight: 600 }}>
                                {data.treating_doctors?.join(', ') || '—'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}><LabelValue label="Address" value={data.address} /></Grid>
                    </Grid>
                </Box>

                {/* 02 — Discharge Status & Dates */}
                <SectionTitle>02 · Discharge Status &amp; Dates</SectionTitle>
                <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2 }}>
                    <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={3}>
                            <Typography {...token.label}>Discharge Type</Typography>
                            <Box sx={{ bgcolor: '#DCFCE7', px: 1, py: 0.25, borderRadius: 1, display: 'inline-block', mt: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                                    {data.discharge_type || '—'}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={3}><LabelValue label="Status"    value={data.status?.toUpperCase()} /></Grid>
                        <Grid item xs={3}><LabelValue label="Admission" value={formatDateTime(data.admission_datetime)} /></Grid>
                        <Grid item xs={3}><LabelValue label="Discharge" value={data.outcome_date ? formatDate(data.outcome_date) : '—'} /></Grid>
                    </Grid>
                </Box>

                {/* 03 — Maternal & Birth History */}
                <SectionTitle>03 · Maternal &amp; Birth History</SectionTitle>
                <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2 }}>
                    <Grid container spacing={1.5} sx={{ mb: 1 }}>
                        <Grid item xs={3}><LabelValue label="Mother's Age"      value={data.mother_age ? `${data.mother_age} years` : undefined} /></Grid>
                        <Grid item xs={3}><LabelValue label="Blood Group"        value={data.mother_blood_group} /></Grid>
                        <Grid item xs={3}><LabelValue label="Mode of Delivery"   value={data.mode_of_delivery} /></Grid>
                        <Grid item xs={3}><LabelValue label="Birth Weight"       value={data.birth_weight ? `${data.birth_weight} g` : undefined} /></Grid>

                        <Grid item xs={3}><LabelValue label="APGAR 1 min"   value={data.apgar_1} /></Grid>
                        <Grid item xs={3}><LabelValue label="APGAR 5 min"   value={data.apgar_5} /></Grid>
                        <Grid item xs={3}><LabelValue label="Place of Birth" value={data.place_of_birth} /></Grid>
                        <Grid item xs={3}><LabelValue label="Obstetric Hx"  value={data.obstetric_history} /></Grid>
                    </Grid>

                    <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

                    <Typography {...token.label} sx={{ ...token.label.sx, mb: 0.5 }}>
                        Maternal Complications / Antenatal History
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                        {data.maternal_complications?.length > 0
                            ? data.maternal_complications.join(', ')
                            : 'No complications reported.'}
                    </Typography>
                </Box>

                {/* 04 — Provisional Diagnosis */}
                <SectionTitle>04 · Provisional Diagnosis</SectionTitle>
                <Box sx={{ pl: 2 }}>
                    <ul style={{ margin: 0, paddingLeft: '1.4rem' }}>
                        {data.provisional_diagnosis?.split('\n').map((line: string, i: number) => (
                            <li key={i}>
                                <Typography variant="body2" sx={{ color: '#334155', mb: 0.5 }}>{line}</Typography>
                            </li>
                        ))}
                    </ul>
                </Box>

                {renderFooter(1, 3)}
            </Card>

            {/* ════════════════════════════════════════════════════════
                PAGE 2 — Vitals, Exam, Final Diagnosis, Course
            ════════════════════════════════════════════════════════ */}
            <Card className="pdf-page" sx={A4_PAGE_STYLE}>
                {renderHeader(false)}

                {/* 05 — Anthropometry & Vitals */}
                <SectionTitle mt={0}>05 · Anthropometry &amp; Vitals</SectionTitle>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', mb: 1.5 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {['Parameter', 'At Admission', 'At Discharge'].map(h => (
                                    <TableCell key={h} sx={{ bgcolor: '#F8FAFC' }}>
                                        <Typography {...token.th}>{h}</Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[
                                {
                                    label: 'Weight',
                                    adm: data.adm_vitals?.weight_g ? `${(data.adm_vitals.weight_g / 1000).toFixed(2)} kg` : '—',
                                    dis: data.final_vitals?.weight_kg ? `${data.final_vitals.weight_kg} kg` : '—',
                                    highlight: true,
                                },
                                { label: 'Head Circumference', adm: '—', dis: data.anthropometry?.hc_cm     ? `${data.anthropometry.hc_cm} cm`     : '—' },
                                { label: 'Length',             adm: '—', dis: data.anthropometry?.length_cm ? `${data.anthropometry.length_cm} cm` : '—' },
                                { label: 'Heart Rate',         adm: data.adm_vitals?.hr   ? `${data.adm_vitals.hr} /min`   : '—', dis: data.final_vitals?.hr   ? `${data.final_vitals.hr} /min`   : '—' },
                                { label: 'Respiratory Rate',   adm: data.adm_vitals?.rr   ? `${data.adm_vitals.rr} /min`   : '—', dis: data.final_vitals?.rr   ? `${data.final_vitals.rr} /min`   : '—' },
                                { label: 'SpO₂',               adm: data.adm_vitals?.spo2 ? `${data.adm_vitals.spo2}%`     : '—', dis: data.final_vitals?.spo2 ? `${data.final_vitals.spo2}%`     : '—' },
                            ].map(row => (
                                <TableRow key={row.label}>
                                    <TableCell><Typography variant="body2" sx={{ color: '#334155' }}>{row.label}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" sx={{ color: '#334155' }}>{row.adm}</Typography></TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: row.highlight ? '#E11D48' : '#334155', fontWeight: row.highlight ? 700 : 400 }}>
                                            {row.dis}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* 06 — Admission Physical Examination */}
                <SectionTitle>06 · Admission Physical Examination</SectionTitle>
                <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2 }}>
                    <Grid container spacing={1.5}>
                        <Grid item xs={6}><LabelValue label="RS — Respiratory"   value={data.adm_exam?.rs} /></Grid>
                        <Grid item xs={6}><LabelValue label="CVS — Cardiac"      value={data.adm_exam?.cvs} /></Grid>
                        <Grid item xs={6}><LabelValue label="CNS — Neurological" value={data.adm_exam?.cns} /></Grid>
                        <Grid item xs={6}><LabelValue label="PA — Abdomen"       value={data.adm_exam?.pa} /></Grid>
                        <Grid item xs={12}><LabelValue label="AF — Fontanelle"   value={data.adm_exam?.af} /></Grid>
                    </Grid>
                </Box>

                {/* 07 — Final Diagnosis */}
                <SectionTitle>07 · Final Diagnosis</SectionTitle>
                <Box sx={{ pl: 2 }}>
                    <ul style={{ margin: 0, paddingLeft: '1.4rem' }}>
                        {data.final_diagnosis?.split('\n').map((line: string, i: number) => (
                            <li key={i}>
                                <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, mb: 0.5 }}>{line}</Typography>
                            </li>
                        ))}
                    </ul>
                </Box>

                {/* 08 — Course in Hospital */}
                <SectionTitle>08 · Course in Hospital</SectionTitle>
                <Box>
                    {data.course && Object.entries(data.course).map(([key, value]: [string, any]) =>
                        value ? (
                            <Box key={key} sx={{ mb: 1 }}>
                                <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: '#1E293B', textTransform: 'capitalize' }}>
                                    {key}:{' '}
                                </Typography>
                                <Typography component="span" variant="body2" sx={{ color: '#334155' }}>{value}</Typography>
                            </Box>
                        ) : null
                    )}
                </Box>

                {renderFooter(2, 3)}
            </Card>

            {/* ════════════════════════════════════════════════════════
                PAGE 3 — Treatment, Discharge Advice, Signatures
            ════════════════════════════════════════════════════════ */}
            <Card className="pdf-page" sx={A4_PAGE_STYLE}>
                {renderHeader(false)}

                {/* 09 — Treatment / Medications Given */}
                <SectionTitle mt={0}>09 · Treatment / Medications Given</SectionTitle>
                <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: 1, border: '1px solid #E2E8F0', mb: 1.5 }}>
                    <Grid container spacing={1}>
                        {data.treatment && Object.entries(data.treatment).map(([key, value]: [string, any]) =>
                            value ? (
                                <Grid item xs={6} key={key} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                                    <Box sx={{ width: 5, height: 5, bgcolor: '#0EA5E9', borderRadius: '50%', mt: '6px', flexShrink: 0 }} />
                                    <Typography variant="body2" sx={{ color: '#334155' }}>{value}</Typography>
                                </Grid>
                            ) : null
                        )}
                    </Grid>
                </Box>

                {/* 10 — Discharge Advice & Medications */}
                <SectionTitle>10 · Discharge Advice &amp; Medications</SectionTitle>
                <Box sx={{ bgcolor: '#F0F9FF', p: 1.5, borderRadius: 2, border: '1px solid #BAE6FD', display: 'flex', gap: 3 }}>
                    {/* Medication list */}
                    <Box sx={{ flex: 1 }}>
                        <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
                            {data.dc_medications?.map((med: any, i: number) => (
                                <li key={i} style={{ marginBottom: '5px' }}>
                                    <Typography variant="body2" sx={{ color: '#334155' }}>
                                        <strong>{med.drug}</strong>: {med.dose} ({med.route}) — {med.frequency}
                                    </Typography>
                                </li>
                            ))}
                            {data.feeding_plan && (
                                <li style={{ marginBottom: '5px' }}>
                                    <Typography variant="body2" sx={{ color: '#334155' }}>{data.feeding_plan}</Typography>
                                </li>
                            )}
                            {data.home_care && (
                                <li>
                                    <Typography variant="body2" sx={{ color: '#334155' }}>{data.home_care}</Typography>
                                </li>
                            )}
                        </ol>
                    </Box>

                    {/* Follow-up + Emergency */}
                    <Box sx={{ flex: 1, borderLeft: '1px solid #BAE6FD', pl: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#1E293B', mb: 0.75 }}>Follow-up</Typography>
                        <Typography variant="body2" sx={{ color: '#334155', mb: 0.5 }}>{data.followup?.instructions}</Typography>
                        <Typography variant="body2" sx={{ color: '#334155', mb: 0.5 }}>
                            Date: <strong>{data.followup?.date ? formatDate(data.followup.date) : '—'}</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#334155', mb: 1.5 }}>
                            Clinic: {data.followup?.clinic || '—'}
                        </Typography>

                        <Box sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 1, p: 1 }}>
                            <Typography variant="caption" sx={{ color: '#B91C1C', fontWeight: 700, lineHeight: 1.5 }}>
                                ⚠ Emergency — bring baby immediately if: poor feeding, lethargy, or fever (&gt;38 °C).
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Signatures */}
                 
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                        {/* Parent */}
                        <Box>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#64748B', mb: 3 }}>
                            "I/We have been explained about the diagnosis and medications."
                        </Typography>
                            <Box sx={{ border: '1px dashed #9CA3AF', borderRadius: '4px', width: 160, height: 48, mb: 0.8, bgcolor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               
                                <Typography sx={{ fontSize: '8.5px', color: '#9CA3AF', fontStyle: 'italic' }}>Parent Signature</Typography>
                            </Box>
                            <Typography sx={{  mb: 0 }}>Parent / Guardian</Typography>
                            <Typography sx={{ fontSize: '9px', color: '#6B7280' }}>Acknowledged receipt of discharge summary</Typography>
                        </Box>

                        {/* Doctor */}
                        <Box sx={{ textAlign: 'right' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5, minHeight: 48 }}>
                                {data.signatures?.approver_signature
                                    ? <Box component="img" src={data.signatures.approver_signature} alt="Doctor Signature" sx={{ height: 48 }} />
                                    : <Box sx={{ border: '1px dashed #9CA3AF', borderRadius: '4px', width: 160, height: 48, bgcolor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography sx={{ fontSize: '8.5px', color: '#9CA3AF', fontStyle: 'italic' }}>Doctor Signature</Typography>
                                    </Box>
                                }
                            </Box>
                            <Divider sx={{ borderColor: '#374151', mb: 0.5 }} />
                            <Typography sx={{ fontSize: '11px' }}>
                                {data.treating_doctors?.[0] || 'Consultant Neonatologist'}
                            </Typography>
                            <Typography sx={{ fontSize: '9.5px', color: '#1D4ED8' }}>Consultant Neonatologist</Typography>
                            <Typography sx={{ fontSize: '9px', color: '#6B7280' }}>Dept. of Neonatology & Paediatrics</Typography>
                        </Box>
                    </Box>
                

                {renderFooter(3, 3)}
            </Card>

        </Box>
    );
};

export default DischargePrintTemplate;
