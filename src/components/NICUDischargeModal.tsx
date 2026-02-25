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

    // const VitalsPill = ({ label, value, unit, field, section }: { label: string; value: string; unit: string; field: string; section: string }) => (
    //     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1.5, borderRight: '1px solid #E2E8F0', '&:last-child': { borderRight: 'none' }, flex: 1 }}>
    //         <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem', fontWeight: 700, mb: 0.5 }}>{label}</Typography>
    //         <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
    //             <TextField
    //                 value={value}
    //                 onChange={(e) => handleNestedInputChange(section, field, e.target.value)}
    //                 variant="standard"
    //                 inputProps={{ readOnly: isViewMode }}
    //                 sx={{
    //                     width: '45px',
    //                     '& .MuiInput-input': { textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, p: 0, color: '#1E293B' },
    //                     '& .MuiInput-underline:before': { borderBottom: 'none' },
    //                 }}
    //             />
    //             <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>{unit}</Typography>
    //         </Box>
    //     </Box>
    // );

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
                        {/* SECTION 1: ADMINISTRATION DETAILS */}
<SectionHeader number="1" title="ADMINISTRATION DETAILS" />
<Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
    <Grid container spacing={3}>
        
        {/* Row 1: Baby Name, UHID, Admission Number */}
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>B/O ( Mother's Name)</Typography>
            <TextField 
                fullWidth 
                size="small"
                placeholder="Mother's Name"
                value={formData.baby_name} 
                onChange={(e) => handleInputChange('baby_name', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: isViewMode }} 
            />
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>UHID</Typography>
            <TextField 
                fullWidth 
                size="small"
                value={formData.uhid} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: true }} 
            />
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Admission Number</Typography>
            <TextField 
                fullWidth 
                size="small"
                value={formData.ip_number} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: true }} 
            />
        </Grid>

        {/* Row 2: Sex, Age, Treating Doctors */}
        <Grid item xs={3}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Sex</Typography>
            <TextField 
                select 
                fullWidth 
                size="small"
                value={formData.sex} 
                onChange={(e) => handleInputChange('sex', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: isViewMode }}
            >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={3}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Age</Typography>
            <TextField 
                fullWidth 
                size="small"
                value={formData.age_days + " Days"} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: true }} 
            />
        </Grid>
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Treating Doctors</Typography>
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1, 
                p: 1, 
                border: '1px solid #E2E8F0', 
                borderRadius: 1, 
                bgcolor: '#F8FAFC',
                minHeight: '40px'
            }}>
                {formData.treating_doctors.map((doc: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined, index: React.Key | null | undefined) => (
                    <Chip 
                        key={index} 
                        label={doc} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        onDelete={isViewMode ? undefined : () => { /* remove doctor logic */ }}
                        sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', borderColor: '#DBEAFE' }}
                    />
                ))}
                {!isViewMode && (
                    <Typography variant="caption" sx={{ color: '#94A3B8', alignSelf: 'center', ml: 1 }}>
                        Add doctor...
                    </Typography>
                )}
            </Box>
        </Grid>

        {/* Row 3: Payer Name, Mobile Number, Payer/Insurance */}
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Payer Name</Typography>
            <TextField 
                fullWidth 
                size="small"
                placeholder="Insurance Company Ltd."
                value={formData.payer_name} 
                onChange={(e) => handleInputChange('payer_name', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: isViewMode }} 
            />
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Mobile Number</Typography>
            <TextField 
                fullWidth 
                size="small"
                value={formData.parent_mobile} 
                onChange={(e) => handleInputChange('parent_mobile', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: isViewMode }} 
            />
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Payer / Insurance</Typography>
            <TextField 
                select 
                fullWidth 
                size="small"
                value={formData.payer_type || 'Self Pay'} 
                onChange={(e) => handleInputChange('payer_type', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: isViewMode }}
            >
                <MenuItem value="Self Pay">Self Pay</MenuItem>
                <MenuItem value="Insurance">Insurance</MenuItem>
                <MenuItem value="Corporate">Corporate</MenuItem>
            </TextField>
        </Grid>

        {/* Row 4: Payer Address */}
        <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Payer Address</Typography>
            <TextField 
                fullWidth 
                size="small"
                placeholder="Full address..."
                value={formData.address} 
                onChange={(e) => handleInputChange('address', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: isViewMode }} 
            />
        </Grid>
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
               {/* SECTION 3: DIAGNOSIS */}
<SectionHeader number="3" title="DIAGNOSIS" />
<Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
    <Grid container spacing={3}>
        {/* Provisional Diagnosis */}
        <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Provisional Diagnosis</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={3}
                placeholder="Initial diagnosis based on admission findings..."
                value={formData.provisional_diagnosis} 
                onChange={(e) => handleInputChange('provisional_diagnosis', e.target.value)} 
                sx={{ 
                    bgcolor: '#F8FAFC', // Standard light tint from design
                    '& .MuiOutlinedInput-root': {
                        fontSize: '14px'
                    }
                }} 
            />
        </Grid>

        {/* Final Diagnosis */}
        <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Final Diagnosis</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={3}
                placeholder="Confirmed diagnosis at the time of discharge..."
                value={formData.final_diagnosis} 
                onChange={(e) => handleInputChange('final_diagnosis', e.target.value)} 
                sx={{ 
                    bgcolor: '#F8FAFC',
                    '& .MuiOutlinedInput-root': {
                        fontSize: '14px'
                    }
                }} 
            />
        </Grid>

        {/* Conditional Cause of Death Field */}
        {formData.discharge_type === 'Expired' && (
            <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#EF4444', mb: 1, fontWeight: 'bold' }}>Cause of Death</Typography>
                <TextField 
                    fullWidth 
                    multiline 
                    rows={3}
                    placeholder="Document the primary and immediate causes of death..."
                    value={formData.cause_of_death} 
                    onChange={(e) => handleInputChange('cause_of_death', e.target.value)} 
                    sx={{ 
                        bgcolor: '#FEF2F2', // Light red tint for critical info
                        '& .MuiOutlinedInput-root': {
                            borderColor: '#FCA5A5',
                            fontSize: '14px'
                        }
                    }} 
                />
            </Grid>
        )}
    </Grid>
</Paper>
                        {/* SECTION 3: BIRTH HISTORY & MATERNAL DETAILS */}
<SectionHeader number="4" title="BIRTH HISTORY & MATERNAL DETAILS" />
<Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
    
    {/* BIRTH DETAILS SUB-SECTION */}
    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#3B82F6', display: 'block', mb: 2, letterSpacing: 1 }}>
        BIRTH DETAILS
    </Typography>
    
    <Grid container spacing={2.5}>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Date of Birth</Typography>
            <TextField type="date" value={formData.dob_actual} onChange={(e) => handleInputChange('dob_actual', e.target.value)} fullWidth size="small" sx={{ bgcolor: '#F8FAFC' }} InputProps={{ readOnly: isViewMode }} />
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Birth Time</Typography>
            <TextField type="time" value={formData.birth_time} onChange={(e) => handleInputChange('birth_time', e.target.value)} fullWidth size="small" sx={{ bgcolor: '#F8FAFC' }} InputProps={{ readOnly: isViewMode }} />
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Place of Birth</Typography>
            <TextField placeholder="e.g. Borneo Hospital / OT" value={formData.place_of_birth} onChange={(e) => handleInputChange('place_of_birth', e.target.value)} fullWidth size="small" sx={{ bgcolor: '#F8FAFC' }} InputProps={{ readOnly: isViewMode }} />
        </Grid>

        {/* Gestational Age Row */}
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Gestational Age</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField placeholder="32" value={formData.gestation_weeks} onChange={(e) => handleInputChange('gestation_weeks', e.target.value)} size="small" sx={{ bgcolor: '#F8FAFC' }} InputProps={{ endAdornment: <Typography variant="caption" sx={{ color: '#94A3B8', ml: 1 }}>wks</Typography> }} />
                <TextField placeholder="5" value={formData.gestation_days} onChange={(e) => handleInputChange('gestation_days', e.target.value)} size="small" sx={{ bgcolor: '#F8FAFC' }} InputProps={{ endAdornment: <Typography variant="caption" sx={{ color: '#94A3B8', ml: 1 }}>days</Typography> }} />
            </Box>
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Birth Weight (g)</Typography>
            <TextField placeholder="Weight in grams" value={formData.birth_weight} onChange={(e) => handleInputChange('birth_weight', e.target.value)} fullWidth size="small" sx={{ bgcolor: '#F8FAFC' }} />
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Vaccination Status</Typography>
            <TextField placeholder="-" value={formData.vaccination_status} onChange={(e) => handleInputChange('vaccination_status', e.target.value)} fullWidth size="small" sx={{ bgcolor: '#F8FAFC' }} />
        </Grid>

        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Type of Birth</Typography>
            <TextField select fullWidth size="small" value={formData.mode_of_delivery} onChange={(e) => handleInputChange('mode_of_delivery', e.target.value)} sx={{ bgcolor: '#F8FAFC' }}>
                <MenuItem value="Normal Vaginal Delivery">Normal Vaginal Delivery</MenuItem>
                <MenuItem value="LSCS">LSCS</MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={8}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Delivery Indication</Typography>
            <TextField placeholder="e.g. Preterm labor, Fetal distress" value={formData.lscs_indication} onChange={(e) => handleInputChange('lscs_indication', e.target.value)} fullWidth size="small" sx={{ bgcolor: '#F8FAFC' }} />
        </Grid>

        {/* Checkbox row */}
        <Grid item xs={12} sx={{ display: 'flex', gap: 3, mt: 1 }}>
            <FormControlLabel control={<Checkbox size="small" checked={formData.cried_immediately} onChange={(e) => handleInputChange('cried_immediately', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Cried Immediately after birth</Typography>} />
            <FormControlLabel control={<Checkbox size="small" checked={formData.resuscitation_required} onChange={(e) => handleInputChange('resuscitation_required', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Resuscitation required at birth</Typography>} />
            <FormControlLabel control={<Checkbox size="small" checked={formData.vitk_given} onChange={(e) => handleInputChange('vitk_given', e.target.checked)} />} label={<Typography sx={{ fontSize: '13px' }}>Inj. Vitamin K given</Typography>} />
        </Grid>

        {/* APGAR SCORES BOX */}
        <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>APGAR Scores</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: '#3B82F6', mb: 0.5, display: 'block' }}>1 Min</Typography>
                        <TextField placeholder="Score" value={formData.apgar_1} onChange={(e) => handleInputChange('apgar_1', e.target.value)} fullWidth size="small" sx={{ bgcolor: '#FFF' }} />
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: '#3B82F6', mb: 0.5, display: 'block' }}>5 Min</Typography>
                        <TextField placeholder="Score" value={formData.apgar_5} onChange={(e) => handleInputChange('apgar_5', e.target.value)} fullWidth size="small" sx={{ bgcolor: '#FFF' }} />
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="caption" sx={{ color: '#3B82F6', mb: 0.5, display: 'block' }}>10 Min</Typography>
                        <TextField placeholder="Score" value={formData.apgar_10} onChange={(e) => handleInputChange('apgar_10', e.target.value)} fullWidth size="small" sx={{ bgcolor: '#FFF' }} />
                    </Grid>
                </Grid>
            </Box>
        </Grid>

        {/* MATERNAL DETAILS SUB-SECTION */}
        <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#3B82F6', display: 'block', mb: 2, letterSpacing: 1 }}>
                MATERNAL DETAILS
            </Typography>
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Mother's Name</Typography>
            <TextField fullWidth size="small" value={formData.mother_name} onChange={(e) => handleInputChange('mother_name', e.target.value)} sx={{ bgcolor: '#F8FAFC' }} />
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Mother's Age (Years)</Typography>
            <TextField placeholder="e.g. 32" fullWidth size="small" value={formData.mother_age} onChange={(e) => handleInputChange('mother_age', e.target.value)} sx={{ bgcolor: '#F8FAFC' }} />
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Mother's Blood Group</Typography>
            <TextField select fullWidth size="small" value={formData.mother_blood_group} onChange={(e) => handleInputChange('mother_blood_group', e.target.value)} sx={{ bgcolor: '#F8FAFC' }}>
                <MenuItem value="O Positive">O Positive</MenuItem>
                {/* Add other groups */}
            </TextField>
        </Grid>
        <Grid item xs={4}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Multiple Gestation</Typography>
            <TextField placeholder="e.g. Twin 1/Singleton" fullWidth size="small" value={formData.multiple_gestation} sx={{ bgcolor: '#F8FAFC' }} />
        </Grid>
        <Grid item xs={8}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Maternal History/Complications</Typography>
            <TextField placeholder="e.g. Pre-eclampsia, GDM..." fullWidth size="small" value={formData.maternal_history} sx={{ bgcolor: '#F8FAFC' }} />
        </Grid>

        {/* OBSTETRIC HISTORY */}
        <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#3B82F6', display: 'block', mb: 2, letterSpacing: 1 }}>
                OBSTETRIC HISTORY
            </Typography>
        </Grid>
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Gravida-Para-Living (G-P-L)</Typography>
            <TextField placeholder="e.g. G2P2L1" fullWidth size="small" value={formData.obstetric_history} sx={{ bgcolor: '#F8FAFC' }} />
        </Grid>
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Previous Pregnancy Details</Typography>
            <TextField placeholder="e.g. G1-FT/LSCS" fullWidth size="small" value={formData.prev_pregnancy_details} sx={{ bgcolor: '#F8FAFC' }} />
        </Grid>
    </Grid>
</Paper>
    
                     
                       {/* SECTION 4: COMPLAINTS ON ADMISSION */}
<SectionHeader number="5" title="COMPLAINTS ON ADMISSION" />
<Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
    
    {/* Chief Complaints */}
    <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Chief Complaints</Typography>
    <TextField 
        fullWidth 
        multiline 
        rows={3}
        placeholder="e.g. Preterm delivery, Respiratory distress, VLBW"
        value={formData.presenting_complaints} 
        onChange={(e) => handleInputChange('presenting_complaints', e.target.value)} 
        sx={{ bgcolor: '#F8FAFC', mb: 4 }}
        InputProps={{ readOnly: isViewMode }} 
    />

    {/* ADMISSION VITALS & ANTHROPOMETRY BOX */}
    <Box sx={{ p: 2, border: '1px solid #DBEAFE', borderRadius: 2, bgcolor: '#EFF6FF', mb: 4 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#3B82F6', display: 'block', mb: 2, letterSpacing: 1 }}>
            ADMISSION VITALS & ANTHROPOMETRY
        </Typography>
        
        <Grid container spacing={1.5}>
            {[
                { label: 'TEMP (C)', field: 'temp_c', section: 'adm_vitals' },
                { label: 'HR (/MIN)', field: 'hr', section: 'adm_vitals' },
                { label: 'RR (/MIN)', field: 'rr', section: 'adm_vitals' },
                { label: 'SPO2 (%)', field: 'spo2', section: 'adm_vitals' },
                { label: 'BP (SYS/DIA)', field: 'bp_combined', section: 'adm_vitals' },
                { label: 'WT (G)', field: 'weight_g', section: 'adm_vitals' },
                { label: 'BSL (MG/DL)', field: 'bsl', section: 'adm_vitals' },
                { label: 'HC (CM)', field: 'hc_cm', section: 'adm_vitals' },
                { label: 'LENGTH (CM)', field: 'length_cm', section: 'adm_vitals' },
            ].map((v) => (
                <Grid item xs={2.4} key={v.label}>
                    <Typography sx={{ fontSize: '9px', fontWeight: 'bold', color: '#64748B', mb: 0.5 }}>{v.label}</Typography>
                    <TextField 
                        fullWidth 
                        size="small"
                        value={formData[v.section][v.field]}
                        onChange={(e) => handleNestedInputChange(v.section, v.field, e.target.value)}
                        sx={{ bgcolor: '#FFF', '& .MuiOutlinedInput-root': { height: '32px' } }}
                    />
                </Grid>
            ))}
        </Grid>
    </Box>

    {/* General Physical Examination */}
    <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>General Physical Examination</Typography>
    <TextField 
        fullWidth 
        multiline 
        rows={3}
        placeholder="Baby active & alert, pink, central cyanosis absent..."
        value={formData.general_exam_admission} 
        onChange={(e) => handleInputChange('general_exam_admission', e.target.value)} 
        sx={{ bgcolor: '#F8FAFC', mb: 4 }}
    />

    {/* Systemic Examination - Accordion Style */}
    <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Systemic Examination</Typography>
    <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
        {[
            { label: 'Respiratory', field: 'rs' },
            { label: 'Cardiovascular', field: 'cvs' },
            { label: 'Gastrointestinal & Abdomen', field: 'pa' },
            { label: 'Central Nervous System', field: 'cns' },
            { label: 'Genitourinary', field: 'gu' },
            { label: 'Musculoskeletal', field: 'msk' },
            { label: 'Others', field: 'others' }
        ].map((system, _idx) => (
            <Accordion key={system.field} elevation={0} sx={{ '&:not(:last-child)': { borderBottom: '1px solid #E2E8F0' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />}>
                    <Typography sx={{ fontSize: '14px', color: '#475569' }}>{system.label}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                    <TextField 
                        fullWidth 
                        multiline 
                        rows={2}
                        placeholder={`Findings for ${system.label}...`}
                        value={formData.adm_exam[system.field]}
                        onChange={(e) => handleNestedInputChange('adm_exam', system.field, e.target.value)}
                        sx={{ bgcolor: '#F8FAFC' }}
                    />
                </AccordionDetails>
            </Accordion>
        ))}
    </Box>
</Paper>

                        
     
                        {/* SECTION 6: INVESTIGATIONS SUMMARY */}
<SectionHeader number="6" title="INVESTIGATIONS SUMMARY" />
<Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
    <Grid container spacing={3}>
        {/* Row 1: Hematology & Biochemistry */}
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Hematology / Coagulation</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={3}
                placeholder="CBC, CRP, PT/INR details..."
                value={formData.investigations.hematology} 
                onChange={(e) => handleNestedInputChange('investigations', 'hematology', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
            />
        </Grid>
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Biochemistry (LFT, KFT, Lytes)</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={3}
                placeholder="Creatinine, Bilirubin, Electrolytes..."
                value={formData.investigations.biochemistry} 
                onChange={(e) => handleNestedInputChange('investigations', 'biochemistry', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
            />
        </Grid>

        {/* Row 2: Microbiology & Radiology */}
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Microbiology (Cultures)</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={3}
                placeholder="Blood/Urine cultures, sensitivity results..."
                value={formData.investigations.microbiology} 
                onChange={(e) => handleNestedInputChange('investigations', 'microbiology', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
            />
        </Grid>
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Radiology (USG, X-Ray, Echo)</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={3}
                placeholder="X-Ray findings, USG Abdomen, Echo details..."
                value={formData.investigations.radiology} 
                onChange={(e) => handleNestedInputChange('investigations', 'radiology', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
            />
        </Grid>

        {/* Row 3: Others (Full Width) */}
        <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Others</Typography>
            <TextField 
                fullWidth 
                size="small"
                placeholder="Any other special investigations..."
                value={formData.investigations.others} 
                onChange={(e) => handleNestedInputChange('investigations', 'others', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
            />
        </Grid>
    </Grid>
</Paper>

                       
                       {/* SECTION 8: TREATMENT GIVEN */}
<SectionHeader number="8" title="TREATMENT GIVEN" />
<Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
    <Grid container spacing={3}>
        {/* Row 1: Medications & Therapies */}
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Medications</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={4}
                placeholder="List antibiotics, syrups, supplements, and other medications..."
                value={formData.treatment.medications} 
                onChange={(e) => handleNestedInputChange('treatment', 'medications', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
            />
        </Grid>
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Therapies</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={4}
                placeholder="Describe Phototherapy, O2 therapy, CPAP, etc..."
                value={formData.treatment.therapies} 
                onChange={(e) => handleNestedInputChange('treatment', 'therapies', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
            />
        </Grid>

        {/* Row 2: Injections & Feeds/Fluids */}
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Injections</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={4}
                placeholder="Record Vitamin K, Vaccinations, and other injections..."
                value={formData.treatment.injections} 
                onChange={(e) => handleNestedInputChange('treatment', 'injections', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
            />
        </Grid>
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Feeds & Fluids</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={4}
                placeholder="Detail IV fluids, feeding methods, volumes, and duration..."
                value={formData.treatment.feeds_fluids} 
                onChange={(e) => handleNestedInputChange('treatment', 'feeds_fluids', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
            />
        </Grid>
    </Grid>
</Paper>

                       {/* SECTION 9: CONDITION AT OUTCOME */}
<SectionHeader number="9" title="CONDITION AT OUTCOME" />
<Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
    
    <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Overall Condition Dropdown */}
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Overall Condition</Typography>
            <TextField 
                select 
                fullWidth 
                size="small"
                value={formData.overall_condition || 'Stable'} 
                onChange={(e) => handleInputChange('overall_condition', e.target.value)}
                sx={{ bgcolor: '#F8FAFC' }}
            >
                <MenuItem value="Stable">Stable</MenuItem>
                <MenuItem value="Sick">Sick</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
            </TextField>
        </Grid>

        {/* Global Statement Field */}
        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Global Statement</Typography>
            <TextField 
                fullWidth 
                size="small"
                placeholder="e.g. Discharged in stable condition"
                value={formData.outcome_extras.dc_global_statement} 
                onChange={(e) => handleNestedInputChange('outcome_extras', 'dc_global_statement', e.target.value)}
                sx={{ bgcolor: '#F8FAFC' }}
            />
        </Grid>
    </Grid>

    {/* STYLIZED VITALS BOX (Green Border Style) */}
    <Box sx={{ 
        p: 2, 
        border: '1px solid #DCFCE7', 
        borderRadius: 2, 
        bgcolor: '#F0FDF4', 
        mb: 4 
    }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#166534', display: 'block', mb: 2, letterSpacing: 1 }}>
            DISCHARGE VITALS & ANTHROPOMETRY
        </Typography>
        
        <Grid container spacing={1.5}>
            {[
                { label: 'FINAL WT (KG)*', field: 'weight_kg', section: 'final_vitals', error: !formData.final_vitals.weight_kg },
                { label: 'LENGTH (CM)', field: 'length_cm', section: 'anthropometry' },
                { label: 'HC (CM)', field: 'hc_cm', section: 'anthropometry' },
                { label: 'CC (CM)', field: 'cc_cm', section: 'anthropometry' },
                { label: 'TEMP (C)', field: 'temp', section: 'final_vitals' },
                { label: 'HR (/MIN)', field: 'hr', section: 'final_vitals' },
                { label: 'SPO2 (%)', field: 'spo2', section: 'final_vitals' },
            ].map((v) => (
                <Grid item xs key={v.label}>
                    <Typography sx={{ fontSize: '9px', fontWeight: 'bold', color: v.error ? '#EF4444' : '#64748B', mb: 0.5 }}>
                        {v.label}
                    </Typography>
                    <TextField 
                        fullWidth 
                        size="small"
                        value={v.section === 'final_vitals' ? formData.final_vitals[v.field] : formData.anthropometry[v.field]}
                        onChange={(e) => handleNestedInputChange(v.section, v.field, e.target.value)}
                        sx={{ 
                            bgcolor: '#FFF',
                            '& .MuiOutlinedInput-root': {
                                height: '32px',
                                borderColor: v.error ? '#FCA5A5' : '#E2E8F0'
                            }
                        }}
                    />
                </Grid>
            ))}
        </Grid>
    </Box>

    {/* SYSTEMIC EXAMINATION (DISCHARGE) */}
    <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Systemic Examination (Discharge)</Typography>
    <TextField 
        fullWidth 
        multiline 
        rows={2}
        placeholder="Baby active, reflexes good, accepting feeds..."
        value={formData.final_state_summary} // Map to your state summary field
        onChange={(e) => handleInputChange('final_state_summary', e.target.value)}
        sx={{ bgcolor: '#F8FAFC' }}
    />
</Paper>

                        {/* SECTION 10: DISCHARGE MEDICATIONS & FOLLOW-UP */}
                        <SectionHeader number="10" title="DISCHARGE MEDICATIONS & FOLLOW-UP PLAN" />
<Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
    
    {/* DISCHARGE MEDICATIONS TABLE */}
    <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2, mb: 2 }}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell sx={{ color: '#64748B', fontSize: '12px', py: 1.5 }}>Drug Name</TableCell>
                    <TableCell sx={{ color: '#64748B', fontSize: '12px' }}>Dose</TableCell>
                    <TableCell sx={{ color: '#64748B', fontSize: '12px' }}>Frequency</TableCell>
                    <TableCell sx={{ color: '#64748B', fontSize: '12px' }}>Duration</TableCell>
                    <TableCell />
                </TableRow>
            </TableHead>
            <TableBody>
                {formData.dc_medications.map((med: any, idx: number) => (
                    <TableRow key={idx}>
                        <TableCell sx={{ py: 1 }}>
                            <TextField 
                                fullWidth 
                                variant="standard" 
                                placeholder="e.g. Syp. Calcium" 
                                value={med.drug} 
                                onChange={(e) => updateMedication(idx, 'drug', e.target.value)} 
                                InputProps={{ disableUnderline: true, readOnly: isViewMode, sx: { fontSize: '14px' } }} 
                            />
                        </TableCell>
                        <TableCell>
                            <TextField 
                                fullWidth 
                                variant="standard" 
                                placeholder="2.5ml" 
                                value={med.dose} 
                                onChange={(e) => updateMedication(idx, 'dose', e.target.value)} 
                                InputProps={{ disableUnderline: true, readOnly: isViewMode, sx: { fontSize: '14px' } }} 
                            />
                        </TableCell>
                        <TableCell>
                            <TextField 
                                fullWidth 
                                variant="standard" 
                                placeholder="BD" 
                                value={med.frequency} 
                                onChange={(e) => updateMedication(idx, 'frequency', e.target.value)} 
                                InputProps={{ disableUnderline: true, readOnly: isViewMode, sx: { fontSize: '14px' } }} 
                            />
                        </TableCell>
                        <TableCell>
                            <TextField 
                                fullWidth 
                                variant="standard" 
                                placeholder="5 days" 
                                value={med.duration} 
                                onChange={(e) => updateMedication(idx, 'duration', e.target.value)} 
                                InputProps={{ disableUnderline: true, readOnly: isViewMode, sx: { fontSize: '14px' } }} 
                            />
                        </TableCell>
                        <TableCell align="right">
                            {!isViewMode && (
                                <IconButton size="small" onClick={() => removeMedication(idx)} sx={{ color: '#EF4444' }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>

    {!isViewMode && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Button 
                startIcon={<AddIcon />} 
                onClick={addMedication} 
                sx={{ color: '#3B82F6', textTransform: 'none', fontWeight: 500 }}
            >
                Add Medication
            </Button>
        </Box>
    )}

    {/* FOLLOW UP FIELDS */}
    <Grid container spacing={3}>
        <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Next Follow-up Date</Typography>
            <TextField 
                type="date" 
                fullWidth 
                size="small"
                value={formData.followup.date || ''} 
                onChange={(e) => handleNestedInputChange('followup', 'date', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: isViewMode }} 
            />
        </Grid>

        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Follow Up Clinic / Hospital</Typography>
            <TextField 
                fullWidth 
                size="small"
                placeholder="e.g. Pediatric OPD, Room 102"
                value={formData.followup.clinic} 
                onChange={(e) => handleNestedInputChange('followup', 'clinic', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: isViewMode }} 
            />
        </Grid>

        <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Follow Up Doctor</Typography>
            <TextField 
                fullWidth 
                size="small"
                placeholder="e.g. Dr. Jane Doe"
                value={formData.followup.doctor} 
                onChange={(e) => handleNestedInputChange('followup', 'doctor', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: isViewMode }} 
            />
        </Grid>

        <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Follow Up Instructions & Advice</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={3}
                placeholder="Review in OPD. Danger signs explained. Vaccination schedule discussed..."
                value={formData.followup.instructions} 
                onChange={(e) => handleNestedInputChange('followup', 'instructions', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: isViewMode }} 
            />
        </Grid>

        <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Feeding Instructions</Typography>
            <TextField 
                fullWidth 
                multiline 
                rows={3}
                placeholder="Feeding Instructions"
                value={formData.feeding_plan} 
                onChange={(e) => handleInputChange('feeding_plan', e.target.value)} 
                sx={{ bgcolor: '#F8FAFC' }}
                InputProps={{ readOnly: isViewMode }} 
            />
        </Grid>
    </Grid>
</Paper>

                        <SectionHeader number="11" title="AUTHORIZATION & SIGNATURES" />
<Paper elevation={0} sx={{ p: 0, bgcolor: 'transparent' }}>
  <Grid container spacing={3}>
    
    {/* LEFT COLUMN: MEDICAL TEAM */}
    <Grid item xs={12} md={6}>
      <Box sx={{ 
        p: 2, 
        borderRadius: 3, 
        border: '1px dashed #E2E8F0', 
        bgcolor: '#F8FAFC', // Light blue-grey tint per design
        height: '100%'
      }}>
        <Typography variant="caption" fontWeight="bold" sx={{ color: '#475569', mb: 2, display: 'block', letterSpacing: 1 }}>
          MEDICAL TEAM
        </Typography>

        <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Approving Doctor (Consultant)</Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Name of consultant"
          value="Consultant Name"
          sx={{ mb: 0.5, bgcolor: '#FFF' }}
        />
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2, fontSize: '10px' }}>
          Hold Ctrl/Cmd to select multiple
        </Typography>

        <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Prepared by Signature</Typography>
        <Box sx={{ position: 'relative' }}>
          <SignatureBox 
               sigRef={preparedBySig}
               name={formData.summary_prepared_by} title={''}             
          />
          <Typography 
            variant="caption" 
            sx={{ position: 'absolute', top: 8, right: 8, color: '#EF4444', cursor: 'pointer' }}
            onClick={() => preparedBySig.current?.clear()}
          >
            Clear
          </Typography>
        </Box>
      </Box>
    </Grid>

    {/* RIGHT COLUMN: GUARDIAN ACKNOWLEDGEMENT */}
    <Grid item xs={12} md={6}>
      <Box sx={{ 
        p: 2, 
        borderRadius: 3, 
        border: '1px dashed #E2E8F0', 
        bgcolor: '#F8FAFC', 
        height: '100%'
      }}>
        <Typography variant="caption" fontWeight="bold" sx={{ color: '#475569', mb: 2, display: 'block', letterSpacing: 1 }}>
          GUARDIAN ACKNOWLEDGEMENT
        </Typography>

        <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Parent/Guardian Name</Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Name of parent receiving discharge..."
          value={formData.parent_name}
          onChange={(e) => handleInputChange('parent_name', e.target.value)}
          sx={{ mb: 3, bgcolor: '#FFF' }}
        />

        <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>Parent/Guardian Signature</Typography>
    <Box sx={{ position: 'relative', mb: 2 }}>
  <SignatureBox 
    sigRef={parentSig}
                                                    name="" title={''}   
  />

  <Typography 
    variant="caption"
    sx={{
      position: 'absolute',
      top: 8,
      right: 8,
      color: '#EF4444',
      cursor: 'pointer'
    }}
    onClick={() => parentSig.current?.clear()}
  >
    Clear
  </Typography>
</Box>

        <FormControlLabel
          control={
            <Checkbox 
              size="small"
              checked={formData.parent_acknowledged} 
              onChange={(e) => handleInputChange('parent_acknowledged', e.target.checked)} 
            />
          }
          label={
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '13px' }}>
              Discharge summary explained & copy received
            </Typography>
          }
        />
      </Box>
    </Grid>
  </Grid>
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
