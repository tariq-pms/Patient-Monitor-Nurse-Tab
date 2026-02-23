import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Box,
    Chip,
    FormControlLabel,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DischargePrintTemplate from './DischargePrintTemplate';

interface NICUDischargeModalProps {
    open: boolean;
    onClose: () => void;
    patient_name: string;
    patient_id: string;
    patient_resource_id?: string;
    gender?: string;
    dob?: string;
    initialData?: any;
    readOnly?: boolean;
    onSaveSuccess?: () => void;
}

const DEFAULT_FORM_DATA = {
    // Section 1: IDENTIFIERS & ADMIN
    uhid: '',
    ip_number: '',
    baby_name: '',
    age_days: '',
    sex: '',
    parent_mobile: '',
    address: '',
    payer: '',
    department: 'Pediatrics – NICU',
    treating_doctors: [],
    admission_datetime: '',
    summary_created_at: new Date().toISOString(),
    summary_modified_at: new Date().toISOString(),

    // Section 2: DISCHARGE STATUS & DATES
    discharge_type: '',
    status: 'Draft',
    outcome_date: null,
    outcome_time: null,
    mode_of_death: '',

    // Section 3: MATERNAL & BIRTH DETAILS
    mother_name: '', mother_age: '', mother_blood_group: '', obstetric_history: '', maternal_complications: [],
    dob_actual: '', birth_time: '', gestation_weeks: '', gestation_days: '', birth_weight: '',
    multiple_gestation: 'Singleton', place_of_birth: '', mode_of_delivery: '', lscs_indication: '', apgar_1: '', apgar_5: '', vitk_given: false,

    // Section 4: PRESENTING COMPLAINTS & ADMISSION EXAM
    presenting_complaints: '',
    adm_vitals: { weight_g: '', temp_c: '', hr: '', rr: '', spo2: '', bp_sys: '', bp_dia: '', crt: '', },
    adm_exam: { cvs: '', rs: '', cns: '', pa: '', af: 'At level', },

    // Section 5: DIAGNOSIS
    provisional_diagnosis: '', final_diagnosis: '', cause_of_death: '',

    // Section 6: INVESTIGATIONS
    investigations: { hematology: '', coagulation: '', biochemistry: '', sepsis: '', imaging: '', echo: '', abg: '', },

    // Section 7: COURSE IN HOSPITAL
    course: { overall: '', respiratory: '', cardiac: '', sepsis_dic: '', feeding_nutrition: '', gi_nec: '', renal: '', hemorrhage: '', other: '', last24h: '', },

    // Section 8: GIVEN TREATMENT
    treatment: { support: '', iv_fluids: '', inotropes: '', antibiotics: '', antifungals: '', respiratory_drugs: '', gi: '', diuretics: '', hemostatic: '', immunoglobulin: '', blood_products: '', },

    // Section 9: CONDITION AT DISCHARGE
    final_vitals: { weight_kg: '', hr: '', rr: '', spo2: '', temp: '', crt: '', },
    final_exam: { cvs: '', rs: '', cns: '', pa: '', af: 'At level', },
    anthropometry: { length_cm: '', hc_cm: '', cc_cm: '', },
    outcome_extras: {
        dc_global_statement: 'Stable, euthermic, feeding well',
        expired_final_state: '', resus_attempted: false, resus_details: '',
        lama_condition: '', lama_active_problems: [], lama_supports_required: [],
        transfer_condition: '', transfer_supports: [],
    },

    // Section 10: FEEDING & FOLLOW-UP
    feeding_plan: '', home_care: '',
    dc_medications: [],
    followup: { date: null, clinic: '', doctor: '', instructions: '', },

    // Section 11: SIGNATURES
    summary_prepared_by: 'Nurse/Resident Name', // Pre-fill with Auth User
    summary_approved_by: [],
    parent_acknowledged: false,
    parent_name: '',
};

const FHIR_URL = import.meta.env.VITE_FHIRAPI_URL as string;
const FHIR_AUTH = 'Basic ' + btoa('fhiruser:change-password');

export const NICUDischargeModal: React.FC<NICUDischargeModalProps> = ({
    open,
    onClose,
    patient_name,
    patient_id,
    patient_resource_id: _patient_resource_id,
    gender,
    dob,
    initialData,
    readOnly = false,
    onSaveSuccess,
}) => {
    // Local state to manage view/edit mode independently of the prop
    const [isViewMode, setIsViewMode] = useState(readOnly);

    // Sync state if prop changes
    useEffect(() => {
        setIsViewMode(readOnly);
    }, [readOnly]);

    const [formData, setFormData] = useState<any>(JSON.parse(JSON.stringify(DEFAULT_FORM_DATA)));

    // Initialize/Reset form data
    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    ...JSON.parse(JSON.stringify(DEFAULT_FORM_DATA)),
                    baby_name: patient_name || '',
                    uhid: patient_id || '',
                    sex: gender || '',
                    dob_actual: dob || '',
                });
            }
        }
    }, [open, initialData, patient_name, patient_id, gender, dob]);

    // Handle Signature Canvas Population
    useEffect(() => {
        if (open && initialData && initialData.signatures) {
            // Small delay to ensure canvas is rendered
            setTimeout(() => {
                if (initialData.signatures.prepared_signature) preparedBySig.current?.fromDataURL(initialData.signatures.prepared_signature);
                if (initialData.signatures.approver_signature) approverSig.current?.fromDataURL(initialData.signatures.approver_signature);
                if (initialData.signatures.parent_signature) parentSig.current?.fromDataURL(initialData.signatures.parent_signature);

                // If isViewMode, disable canvas interaction (hacky but visually effective: cover with div or pure disable if supported, react-signature-canvas has .off())
                if (isViewMode) {
                    preparedBySig.current?.off();
                    approverSig.current?.off();
                    parentSig.current?.off();
                } else {
                    preparedBySig.current?.on();
                    approverSig.current?.on();
                    parentSig.current?.on();
                }
            }, 100);
        } else if (open && !initialData) {
            preparedBySig.current?.clear();
            approverSig.current?.clear();
            parentSig.current?.clear();
            if (!isViewMode) {
                preparedBySig.current?.on();
                approverSig.current?.on();
                parentSig.current?.on();
            }
        }
    }, [open, initialData, isViewMode]);

    // --- Signature Refs ---
    const preparedBySig = useRef<SignatureCanvas>(null);
    const approverSig = useRef<SignatureCanvas>(null);
    const parentSig = useRef<SignatureCanvas>(null);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value, summary_modified_at: new Date().toISOString() }));
    };

    const handleNestedInputChange = (section: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
            summary_modified_at: new Date().toISOString(),
        }));
    };

    const addMedication = () => {
        const newMed = { drug: '', dose: '', route: '', frequency: '', duration: '' };
        setFormData((prev: any) => ({ ...prev, dc_medications: [...prev.dc_medications, newMed] }));
    };

    const updateMedication = (index: number, field: string, value: string) => {
        const updated = [...formData.dc_medications];
        updated[index] = { ...updated[index], [field]: value };
        setFormData((prev: any) => ({ ...prev, dc_medications: updated }));
    };

    const removeMedication = (index: number) => {
        setFormData((prev: any) => ({ ...prev, dc_medications: prev.dc_medications.filter((_: any, i: number) => i !== index) }));
    };

    const [isSaving, setIsSaving] = useState(false);

    const getSignatures = () => {
        return {
            prepared_signature: preparedBySig.current?.isEmpty() ? null : preparedBySig.current?.toDataURL(),
            approver_signature: approverSig.current?.isEmpty() ? null : approverSig.current?.toDataURL(),
            parent_signature: parentSig.current?.isEmpty() ? null : parentSig.current?.toDataURL(),
        };
    };

    const saveToFHIR = async (status: 'Draft' | 'Final') => {
        setIsSaving(true);
        try {
            // Safety check for Unicode characters in Base64
            const unicodeToBase64 = (str: string) => {
                return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                    function toSolidBytes(_match, p1) {
                        return String.fromCharCode(parseInt(p1, 16));
                    }));
            };

            const signatures = getSignatures();
            const finalData = {
                ...formData,
                status,
                signatures,
                summary_modified_at: new Date().toISOString(),
            };

            const noteBase64 = unicodeToBase64(JSON.stringify(finalData));
            const noteTimestamp = new Date().toISOString();

            // Use existing IDs if this is an update, otherwise generate new ones
            const isUpdate = !!formData.fhirId;
            const summaryId = formData.existingSummaryId || `discharge-summary-${patient_id}-${new Date().getTime()}`;

            const docRef = {
                resourceType: "DocumentReference",
                ...(isUpdate ? { id: formData.fhirId } : {}),
                status: "current",
                docStatus: status === 'Final' ? "final" : "preliminary",
                type: { coding: [{ system: "http://loinc.org", code: "11490-0", display: "Physician discharge summary" }] },
                subject: { reference: `Patient/${patient_id}` },
                date: noteTimestamp,
                author: [{ display: formData.summary_prepared_by }],
                content: [
                    { attachment: { contentType: "application/json", data: noteBase64, title: "NICU Discharge Summary" } }
                ],
                identifier: [{ system: "urn:oid:nicudischarge-summary-id", value: summaryId }]
            };

            const saveUrl = isUpdate ? `${FHIR_URL}/DocumentReference/${formData.fhirId}` : `${FHIR_URL}/DocumentReference`;
            const saveMethod = isUpdate ? 'PUT' : 'POST';

            console.log(`Attempting to save ${status} using ${saveMethod} to:`, saveUrl);

            const response = await fetch(saveUrl, {
                method: saveMethod,
                headers: { 'Content-Type': 'application/fhir+json', Authorization: FHIR_AUTH },
                body: JSON.stringify(docRef)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            console.log(`Saved as ${status}`, finalData);
            if (status === 'Final') {
                alert('Discharge Summary Finalized and Saved Successfully!');
                onClose();
                if (onSaveSuccess) onSaveSuccess();
            } else {
                alert('Draft Saved Successfully!');
                if (onSaveSuccess) onSaveSuccess();
            }

        } catch (e: any) {
            console.error("Failed to save discharge summary", e);
            alert(`Failed to save: ${e.message || JSON.stringify(e)}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = () => {
        saveToFHIR('Draft');
    };

    const handleSaveFinal = () => {
        if (!formData.discharge_type) {
            alert('Please select a Discharge Type before finalizing.');
            return;
        }
        if (window.confirm('Are you sure you want to finalize this Discharge Summary? It will be marked as permanent.')) {
            saveToFHIR('Final');
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('nicu-discharge-content');
        if (!element) return;

        // Save original styles
        const originalHeight = element.style.height;
        const originalOverflow = element.style.overflow;
        const originalPosition = element.style.position;

        try {
            // Force full height capture
            element.style.height = 'auto';
            element.style.overflow = 'visible';
            element.style.position = 'static'; // Ensure it flows correctly

            // Wait for layout to settle
            await new Promise(resolve => setTimeout(resolve, 200));

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                scrollY: -window.scrollY,
                windowHeight: element.scrollHeight + 100 // Add some buffer
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Discharge_Summary_${formData.uhid || 'Unknown'}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF');
        } finally {
            // Restore original styles
            element.style.height = originalHeight;
            element.style.overflow = originalOverflow;
            element.style.position = originalPosition;
        }
    };

    const SectionHeader = ({ number, title }: { number: string; title: string }) => (
        <Box sx={{ mt: 5, mb: 2, borderLeft: '4px solid #228BE6', pl: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                {number}. {title}
            </Typography>
        </Box>
    );

    const VitalsPill = ({ label, value, unit, field, section }: { label: string; value: string; unit: string; field: string; section: string }) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1.5, borderRight: '1px solid #E2E8F0', '&:last-child': { borderRight: 'none' }, flex: 1 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem', fontWeight: 700, mb: 0.5 }}>{label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <TextField
                    value={value}
                    onChange={(e) => handleNestedInputChange(section, field, e.target.value)}
                    variant="standard"
                    inputProps={{ readOnly: isViewMode }}
                    sx={{
                        width: '45px',
                        '& .MuiInput-input': { textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, p: 0, color: '#1E293B' },
                        '& .MuiInput-underline:before': { borderBottom: 'none' },
                    }}
                />
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>{unit}</Typography>
            </Box>
        </Box>
    );

    const SignatureBox = ({ title, sigRef, name }: { title: string; sigRef: any; name: string }) => (
        <Box sx={{ flex: 1, minWidth: '250px' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', mb: 1, display: 'block' }}>{title}</Typography>
            <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', overflow: 'hidden' }}>
                <SignatureCanvas ref={sigRef} penColor="black" canvasProps={{ width: 300, height: 80, style: { width: '100%', height: '80px' } }} />
                <Box sx={{ p: 1, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{name}</Typography>
                    {!isViewMode && <Button size="small" variant="text" onClick={() => sigRef.current?.clear()} sx={{ fontSize: '0.6rem' }}>Clear</Button>}
                </Box>
            </Paper>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4, height: '95vh', display: 'flex', flexDirection: 'column' } }}>
            {/* Header with Controls */}
            <DialogTitle sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>
                        {isViewMode ? 'Discharge Summary (Preview)' : 'New NICU Discharge'}
                    </Typography>
                    <Chip label={formData.status} size="small" color={formData.status === 'Final' ? 'success' : 'warning'} sx={{ fontWeight: 700, borderRadius: 1 }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {isViewMode && (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<CheckCircleIcon />} // Using CheckCircle as temporary edit icon or replace with EditIcon if available
                                onClick={() => setIsViewMode(false)}
                                sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleDownloadPDF}
                                startIcon={<DownloadIcon />}
                                sx={{ bgcolor: '#228BE6', fontWeight: 700, borderRadius: 2 }}
                            >
                                Download / Print
                            </Button>
                        </>
                    )}
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 4, bgcolor: '#F8FAFC' }} id="nicu-discharge-content">
                {isViewMode ? (
                    <DischargePrintTemplate data={formData} />
                ) : (
                    <>
                        {/* SECTION 1: IDENTIFIERS & ADMIN */}
                        <SectionHeader number="1" title="IDENTIFIERS & ADMIN" />
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                            <Grid container spacing={2.5}>
                                <Grid item xs={6}><TextField label="UHID" value={formData.uhid} fullWidth size="small" InputProps={{ readOnly: true }} variant="filled" /></Grid>
                                <Grid item xs={6}><TextField label="IP Number" value={formData.ip_number} fullWidth size="small" InputProps={{ readOnly: true }} variant="filled" /></Grid>
                                <Grid item xs={12}><TextField label="Baby Name" value={formData.baby_name} onChange={(e) => handleInputChange('baby_name', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={3}><TextField label="Age (days)" value={formData.age_days} onChange={(e) => handleInputChange('age_days', e.target.value)} fullWidth size="small" type="number" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={3}>
                                    <TextField select label="Sex" value={formData.sex} onChange={(e) => handleInputChange('sex', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }}>
                                        <MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={3}><TextField label="Parent Mobile" value={formData.parent_mobile} onChange={(e) => handleInputChange('parent_mobile', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={3}><TextField label="Department" value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={12}><TextField label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} fullWidth size="small" multiline rows={2} InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={6}><TextField label="Payer / Scheme" value={formData.payer} onChange={(e) => handleInputChange('payer', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={6}><TextField label="Treating Doctors" placeholder="Select doctors..." value={formData.treating_doctors.join(', ')} onChange={(e) => handleInputChange('treating_doctors', e.target.value.split(', '))} fullWidth size="small" helperText="Separate by comma" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={6}><TextField label="Admission Date & Time" value={formData.admission_datetime} onChange={(e) => handleInputChange('admission_datetime', e.target.value)} fullWidth size="small" type="datetime-local" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: isViewMode }} /></Grid>
                            </Grid>
                        </Paper>

                        {/* SECTION 2: DISCHARGE STATUS & DATES */}
                        <SectionHeader number="2" title="DISCHARGE STATUS & DATES" />
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                            <Grid container spacing={2.5}>
                                <Grid item xs={4}>
                                    <TextField select label="Discharge Type" value={formData.discharge_type} onChange={(e) => handleInputChange('discharge_type', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }}>
                                        <MenuItem value="Normal discharge">Normal discharge</MenuItem><MenuItem value="Expired">Expired</MenuItem><MenuItem value="LAMA/DAMA">LAMA/DAMA</MenuItem><MenuItem value="Referred/Transferred">Referred/Transferred</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField label={formData.discharge_type === 'Expired' ? 'Date of Death' : 'Discharge Date'} type="date" value={formData.outcome_date || ''} onChange={(e) => handleInputChange('outcome_date', e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: isViewMode }} />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField label={formData.discharge_type === 'Expired' ? 'Time of Death' : 'Discharge Time'} type="time" value={formData.outcome_time || ''} onChange={(e) => handleInputChange('outcome_time', e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: isViewMode }} />
                                </Grid>
                                {formData.discharge_type === 'Expired' && (
                                    <Grid item xs={12}>
                                        <TextField select label="Mode of Death" value={formData.mode_of_death} onChange={(e) => handleInputChange('mode_of_death', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }}>
                                            <MenuItem value="Natural">Natural</MenuItem>
                                            <MenuItem value="Cardiorespiratory arrest">Cardiorespiratory arrest</MenuItem>
                                            <MenuItem value="Others">Others</MenuItem>
                                        </TextField>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>

                        {/* SECTION 3: MATERNAL & BIRTH DETAILS */}
                        <SectionHeader number="3" title="MATERNAL & BIRTH DETAILS" />
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                            <Grid container spacing={2.5}>
                                {/* Maternal */}
                                <Grid item xs={12}><Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748B' }}>MATERNAL</Typography></Grid>
                                <Grid item xs={4}><TextField label="Mother's Name" value={formData.mother_name} onChange={(e) => handleInputChange('mother_name', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={2}><TextField label="Age (yrs)" value={formData.mother_age} onChange={(e) => handleInputChange('mother_age', e.target.value)} fullWidth size="small" type="number" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={2}>
                                    <TextField select label="Blood Group" value={formData.mother_blood_group} onChange={(e) => handleInputChange('mother_blood_group', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }}>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={4}><TextField label="Obs History (G P L A)" value={formData.obstetric_history} onChange={(e) => handleInputChange('obstetric_history', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={12}><TextField label="Maternal Complications" placeholder="e.g. GDM, Pre-eclampsia" value={formData.maternal_complications.join(', ')} onChange={(e) => handleInputChange('maternal_complications', e.target.value.split(','))} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>

                                {/* Birth */}
                                <Grid item xs={12} sx={{ mt: 1 }}><Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748B' }}>BIRTH</Typography></Grid>
                                <Grid item xs={3}><TextField label="DOB" type="date" value={formData.dob_actual} onChange={(e) => handleInputChange('dob_actual', e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={3}><TextField label="Time of Birth" type="time" value={formData.birth_time} onChange={(e) => handleInputChange('birth_time', e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={2}><TextField label="Gest. Weeks" value={formData.gestation_weeks} onChange={(e) => handleInputChange('gestation_weeks', e.target.value)} fullWidth size="small" type="number" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={2}><TextField label="Gest. Days" value={formData.gestation_days} onChange={(e) => handleInputChange('gestation_days', e.target.value)} fullWidth size="small" type="number" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={2}><TextField label="Birth Weight (kg)" value={formData.birth_weight} onChange={(e) => handleInputChange('birth_weight', e.target.value)} fullWidth size="small" type="number" InputProps={{ readOnly: isViewMode }} /></Grid>

                                <Grid item xs={4}>
                                    <TextField select label="Delivery Mode" value={formData.mode_of_delivery} onChange={(e) => handleInputChange('mode_of_delivery', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }}>
                                        <MenuItem value="Vaginal">Vaginal</MenuItem><MenuItem value="LSCS">LSCS</MenuItem><MenuItem value="Instrumental">Instrumental</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={4}><TextField label="Indication (if LSCS)" value={formData.lscs_indication} onChange={(e) => handleInputChange('lscs_indication', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={4}><TextField label="Place of Birth" value={formData.place_of_birth} onChange={(e) => handleInputChange('place_of_birth', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>

                                <Grid item xs={2}><TextField label="APGAR 1 min" value={formData.apgar_1} onChange={(e) => handleInputChange('apgar_1', e.target.value)} fullWidth size="small" type="number" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={2}><TextField label="APGAR 5 min" value={formData.apgar_5} onChange={(e) => handleInputChange('apgar_5', e.target.value)} fullWidth size="small" type="number" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={4}>
                                    <FormControlLabel control={<Checkbox checked={formData.vitk_given} onChange={(e) => handleInputChange('vitk_given', e.target.checked)} disabled={isViewMode} />} label="Vit K Given" />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* SECTION 4: PRESENTING COMPLAINTS & ADMISSION EXAM */}
                        <SectionHeader number="4" title="PRESENTING COMPLAINTS & ADMISSION EXAM" />
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                            <TextField label="Presenting Complaints" value={formData.presenting_complaints} onChange={(e) => handleInputChange('presenting_complaints', e.target.value)} fullWidth multiline rows={2} sx={{ mb: 2 }} InputProps={{ readOnly: isViewMode }} />

                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748B', display: 'block', mb: 1 }}>VITALS AT ADMISSION</Typography>
                            <Box sx={{ display: 'flex', border: '1px solid #E2E8F0', borderRadius: '16px', bgcolor: '#F8FAFC', mb: 3, overflow: 'hidden', flexWrap: 'wrap' }}>
                                <VitalsPill label="Weight" value={formData.adm_vitals.weight_g} unit="g" field="weight_g" section="adm_vitals" />
                                <VitalsPill label="Temp" value={formData.adm_vitals.temp_c} unit="°C" field="temp_c" section="adm_vitals" />
                                <VitalsPill label="HR" value={formData.adm_vitals.hr} unit="bpm" field="hr" section="adm_vitals" />
                                <VitalsPill label="RR" value={formData.adm_vitals.rr} unit="b/min" field="rr" section="adm_vitals" />
                                <VitalsPill label="SpO₂" value={formData.adm_vitals.spo2} unit="%" field="spo2" section="adm_vitals" />
                                <VitalsPill label="BP(Sys)" value={formData.adm_vitals.bp_sys} unit="mmHg" field="bp_sys" section="adm_vitals" />
                                <VitalsPill label="BP(Dia)" value={formData.adm_vitals.bp_dia} unit="mmHg" field="bp_dia" section="adm_vitals" />
                                <VitalsPill label="CRT" value={formData.adm_vitals.crt} unit="sec" field="crt" section="adm_vitals" />
                            </Box>

                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748B', display: 'block', mb: 1 }}>EXAM AT ADMISSION</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}><TextField label="CVS" value={formData.adm_exam.cvs} onChange={(e) => handleNestedInputChange('adm_exam', 'cvs', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={6}><TextField label="Respiratory" value={formData.adm_exam.rs} onChange={(e) => handleNestedInputChange('adm_exam', 'rs', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={6}><TextField label="CNS" value={formData.adm_exam.cns} onChange={(e) => handleNestedInputChange('adm_exam', 'cns', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={6}><TextField label="Abdomen (P/A)" value={formData.adm_exam.pa} onChange={(e) => handleNestedInputChange('adm_exam', 'pa', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={6}>
                                    <TextField select label="Anterior Fontanelle" value={formData.adm_exam.af} onChange={(e) => handleNestedInputChange('adm_exam', 'af', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }}>
                                        <MenuItem value="At level">At level</MenuItem><MenuItem value="Sunken">Sunken</MenuItem><MenuItem value="Bulging">Bulging</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* SECTION 5: DIAGNOSIS */}
                        <SectionHeader number="5" title="DIAGNOSIS" />
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><TextField label="Provisional Diagnosis" value={formData.provisional_diagnosis} onChange={(e) => handleInputChange('provisional_diagnosis', e.target.value)} fullWidth size="small" multiline rows={2} /></Grid>
                                <Grid item xs={12}><TextField label="Final Diagnosis" value={formData.final_diagnosis} onChange={(e) => handleInputChange('final_diagnosis', e.target.value)} fullWidth size="small" multiline rows={2} /></Grid>
                                {formData.discharge_type === 'Expired' && (
                                    <Grid item xs={12}><TextField label="Cause of Death" value={formData.cause_of_death} onChange={(e) => handleInputChange('cause_of_death', e.target.value)} fullWidth size="small" multiline rows={2} /></Grid>
                                )}
                            </Grid>
                        </Paper>

                        <SectionHeader number="6" title="INVESTIGATIONS" />
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                            <Grid container spacing={2}>
                                {Object.keys(formData.investigations).map(key => (
                                    <Grid item xs={6} key={key}><TextField label={key.toUpperCase()} value={formData.investigations[key]} onChange={(e) => handleNestedInputChange('investigations', key, e.target.value)} fullWidth size="small" /></Grid>
                                ))}
                            </Grid>
                        </Paper>

                        <SectionHeader number="7" title="COURSE IN HOSPITAL" />
                        {Object.keys(formData.course).map(key => (
                            <Accordion key={key} elevation={0} sx={{ border: '1px solid #E2E8F0', mb: 1, borderRadius: '12px !important' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>{key.toUpperCase()}</AccordionSummary>
                                <AccordionDetails><TextField fullWidth multiline rows={2} value={formData.course[key]} onChange={(e) => handleNestedInputChange('course', key, e.target.value)} InputProps={{ readOnly: isViewMode }} /></AccordionDetails>
                            </Accordion>
                        ))}

                        <SectionHeader number="8" title="GIVEN TREATMENT" />
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                            <Grid container spacing={2}>
                                {Object.keys(formData.treatment).map(key => (
                                    <Grid item xs={6} key={key}><TextField label={key.toUpperCase()} value={formData.treatment[key]} onChange={(e) => handleNestedInputChange('treatment', key, e.target.value)} fullWidth size="small" /></Grid>
                                ))}
                            </Grid>
                        </Paper>

                        {/* SECTION 9: CONDITION AT DISCHARGE / OUTCOME */}
                        <SectionHeader number="9" title="CONDITION AT DISCHARGE / OUTCOME" />
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>

                            {/* Final Vitals */}
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748B', display: 'block', mb: 1 }}>FINAL VITALS</Typography>
                            <Box sx={{ display: 'flex', border: '1px solid #E2E8F0', borderRadius: '16px', bgcolor: '#F8FAFC', mb: 3, overflow: 'hidden', flexWrap: 'wrap' }}>
                                <VitalsPill label="Weight" value={formData.final_vitals.weight_kg} unit="kg" field="weight_kg" section="final_vitals" />
                                <VitalsPill label="HR" value={formData.final_vitals.hr} unit="bpm" field="hr" section="final_vitals" />
                                <VitalsPill label="RR" value={formData.final_vitals.rr} unit="b/min" field="rr" section="final_vitals" />
                                <VitalsPill label="SpO₂" value={formData.final_vitals.spo2} unit="%" field="spo2" section="final_vitals" />
                                <VitalsPill label="Temp" value={formData.final_vitals.temp} unit="°C" field="temp" section="final_vitals" />
                                <VitalsPill label="CRT" value={formData.final_vitals.crt} unit="sec" field="crt" section="final_vitals" />
                            </Box>

                            {/* Final Exam */}
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748B', display: 'block', mb: 1 }}>FINAL EXAM</Typography>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}><TextField label="CVS" value={formData.final_exam.cvs} onChange={(e) => handleNestedInputChange('final_exam', 'cvs', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={6}><TextField label="Respiratory" value={formData.final_exam.rs} onChange={(e) => handleNestedInputChange('final_exam', 'rs', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={6}><TextField label="CNS" value={formData.final_exam.cns} onChange={(e) => handleNestedInputChange('final_exam', 'cns', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={6}><TextField label="Abdomen (P/A)" value={formData.final_exam.pa} onChange={(e) => handleNestedInputChange('final_exam', 'pa', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={6}>
                                    <TextField select label="Anterior Fontanelle" value={formData.final_exam.af} onChange={(e) => handleNestedInputChange('final_exam', 'af', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }}>
                                        <MenuItem value="At level">At level</MenuItem><MenuItem value="Sunken">Sunken</MenuItem><MenuItem value="Bulging">Bulging</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>

                            {/* Check if Normal Discharge for Anthropometry */}
                            {formData.discharge_type === 'Normal discharge' && (
                                <>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748B', display: 'block', mb: 1 }}>ANTHROPOMETRY DIRECTLY AT DISCHARGE</Typography>
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={4}><TextField label="Length (cm)" value={formData.anthropometry.length_cm} onChange={(e) => handleNestedInputChange('anthropometry', 'length_cm', e.target.value)} fullWidth size="small" type="number" /></Grid>
                                        <Grid item xs={4}><TextField label="Head Circ. (cm)" value={formData.anthropometry.hc_cm} onChange={(e) => handleNestedInputChange('anthropometry', 'hc_cm', e.target.value)} fullWidth size="small" type="number" /></Grid>
                                        <Grid item xs={4}><TextField label="Chest Circ. (cm)" value={formData.anthropometry.cc_cm} onChange={(e) => handleNestedInputChange('anthropometry', 'cc_cm', e.target.value)} fullWidth size="small" type="number" /></Grid>
                                    </Grid>
                                </>
                            )}

                            {/* Outcome Specific Extras */}
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748B', display: 'block', mb: 1 }}>OUTCOME SPECIFIC DETAILS</Typography>
                            <Grid container spacing={2}>
                                {formData.discharge_type === 'Normal discharge' && (
                                    <Grid item xs={12}><TextField label="Global Statement" value={formData.outcome_extras.dc_global_statement} onChange={(e) => handleNestedInputChange('outcome_extras', 'dc_global_statement', e.target.value)} fullWidth size="small" multiline InputProps={{ readOnly: isViewMode }} /></Grid>
                                )}
                                {formData.discharge_type === 'Expired' && (
                                    <>
                                        <Grid item xs={12}><TextField label="Final State" value={formData.outcome_extras.expired_final_state} onChange={(e) => handleNestedInputChange('outcome_extras', 'expired_final_state', e.target.value)} fullWidth size="small" multiline /></Grid>
                                        <Grid item xs={12}><FormControlLabel control={<Checkbox checked={formData.outcome_extras.resus_attempted} onChange={(e) => handleNestedInputChange('outcome_extras', 'resus_attempted', e.target.checked)} />} label="Resuscitation Attempted" /></Grid>
                                        {formData.outcome_extras.resus_attempted && <Grid item xs={12}><TextField label="Resuscitation Details" value={formData.outcome_extras.resus_details} onChange={(e) => handleNestedInputChange('outcome_extras', 'resus_details', e.target.value)} fullWidth size="small" multiline /></Grid>}
                                    </>
                                )}
                                {(formData.discharge_type === 'LAMA/DAMA') && (
                                    <Grid item xs={12}><TextField label="LAMA Condition" value={formData.outcome_extras.lama_condition} onChange={(e) => handleNestedInputChange('outcome_extras', 'lama_condition', e.target.value)} fullWidth size="small" multiline /></Grid>
                                )}
                                {(formData.discharge_type === 'Referred/Transferred') && (
                                    <Grid item xs={12}><TextField label="Transfer Condition" value={formData.outcome_extras.transfer_condition} onChange={(e) => handleNestedInputChange('outcome_extras', 'transfer_condition', e.target.value)} fullWidth size="small" multiline /></Grid>
                                )}
                            </Grid>
                        </Paper>

                        {/* SECTION 10: DISCHARGE MEDICATIONS & FOLLOW-UP */}
                        <SectionHeader number="10" title="DISCHARGE MEDICATIONS & FOLLOW-UP" />
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748B', display: 'block', mb: 1 }}>FEEDING & HOME CARE</Typography>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12}><TextField label="Feeding Plan" value={formData.feeding_plan} onChange={(e) => handleInputChange('feeding_plan', e.target.value)} fullWidth multiline rows={2} InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={12}><TextField label="Home Care Advice" value={formData.home_care} onChange={(e) => handleInputChange('home_care', e.target.value)} fullWidth multiline rows={2} InputProps={{ readOnly: isViewMode }} /></Grid>
                            </Grid>

                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748B', display: 'block', mb: 1 }}>DISCHARGE MEDICATIONS</Typography>
                            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2, mb: 2 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Drug</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Dose</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Route</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Frequency</TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.dc_medications.map((med: any, idx: number) => (
                                            <TableRow key={idx}>
                                                <TableCell><TextField fullWidth variant="standard" value={med.drug} onChange={(e) => updateMedication(idx, 'drug', e.target.value)} InputProps={{ readOnly: isViewMode }} /></TableCell>
                                                <TableCell><TextField fullWidth variant="standard" value={med.dose} onChange={(e) => updateMedication(idx, 'dose', e.target.value)} InputProps={{ readOnly: isViewMode }} /></TableCell>
                                                <TableCell><TextField fullWidth variant="standard" value={med.route} onChange={(e) => updateMedication(idx, 'route', e.target.value)} InputProps={{ readOnly: isViewMode }} /></TableCell>
                                                <TableCell><TextField fullWidth variant="standard" value={med.frequency} onChange={(e) => updateMedication(idx, 'frequency', e.target.value)} InputProps={{ readOnly: isViewMode }} /></TableCell>
                                                <TableCell>{!isViewMode && <IconButton size="small" onClick={() => removeMedication(idx)} color="error"><DeleteIcon fontSize="small" /></IconButton>}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {!isViewMode && <Button startIcon={<AddIcon />} onClick={addMedication} size="small" sx={{ mb: 3 }}>Add Drug</Button>}

                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748B', display: 'block', mb: 1 }}>FOLLOW-UP</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={4}><TextField label="Date" type="date" value={formData.followup.date || ''} onChange={(e) => handleNestedInputChange('followup', 'date', e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={4}><TextField label="Clinic / Location" value={formData.followup.clinic} onChange={(e) => handleNestedInputChange('followup', 'clinic', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={4}><TextField label="Doctor" value={formData.followup.doctor} onChange={(e) => handleNestedInputChange('followup', 'doctor', e.target.value)} fullWidth size="small" InputProps={{ readOnly: isViewMode }} /></Grid>
                                <Grid item xs={12}><TextField label="Instructions" value={formData.followup.instructions} onChange={(e) => handleNestedInputChange('followup', 'instructions', e.target.value)} fullWidth size="small" multiline rows={2} InputProps={{ readOnly: isViewMode }} /></Grid>
                            </Grid>
                        </Paper>

                        <SectionHeader number="11" title="SIGNATURES & ACKNOWLEDGEMENT" />
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                <SignatureBox title="Discharge Prepared By" sigRef={preparedBySig} name={formData.summary_prepared_by} />
                                <SignatureBox title="Approving Doctor" sigRef={approverSig} name="Consultant Name" />
                                <SignatureBox title="Parent/Guardian" sigRef={parentSig} name={formData.parent_name || 'Relative'} />
                            </Box>
                            <FormControlLabel
                                control={<Checkbox checked={formData.parent_acknowledged} onChange={(e) => handleInputChange('parent_acknowledged', e.target.checked)} />}
                                label={<Typography variant="body2" sx={{ color: '#475569' }}>I/We have been explained about the disease and medications clearly.</Typography>}
                                sx={{ mt: 2 }}
                            />
                        </Paper>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid #F1F5F9', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={onClose} variant="text" sx={{ color: '#64748B', fontWeight: 700 }}>Cancel</Button>

                {!isViewMode && (
                    <>
                        <Button variant="outlined" onClick={handleSaveDraft} disabled={isSaving} sx={{ borderRadius: 2, fontWeight: 700 }}>{isSaving ? 'Saving...' : 'Save as Draft'}</Button>
                        <Button variant="contained" onClick={handleSaveFinal} disabled={isSaving} startIcon={<CheckCircleIcon />} sx={{ bgcolor: '#228BE6', fontWeight: 700, borderRadius: 2, px: 4 }}>
                            {isSaving ? 'Saving...' : 'Save Discharge'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog >
    );
};
