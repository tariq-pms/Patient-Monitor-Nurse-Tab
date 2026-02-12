import React, { useState } from 'react';
import { Box, Paper, Grid, Typography, Button, useTheme, useMediaQuery, Container, Fab, Tooltip, Drawer, List, ListItem, ListItemText, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import MenuIcon from '@mui/icons-material/Menu';

// Types
import { InitialAssessmentForm } from './InitialAssessmentSections/types';

// Sections
import BabyIdentifiersSection from './InitialAssessmentSections/BabyIdentifiers';
import MaternalDetailsSection from './InitialAssessmentSections/MaternalDetails';
import BirthDetailsSection from './InitialAssessmentSections/BirthDetails';
import TransportDetailsSection from './InitialAssessmentSections/TransportDetails';
import PresentingProblemsSection from './InitialAssessmentSections/PresentingProblems';
import AdmissionVitalsSection from './InitialAssessmentSections/AdmissionVitals';
import SystemicExamSection from './InitialAssessmentSections/SystemicExam';
import InvestigationsSection from './InitialAssessmentSections/Investigations';
import ManagementPlanSection from './InitialAssessmentSections/ManagementPlan';
import RiskCounsellingSection from './InitialAssessmentSections/RiskCounselling';
import SignOffMetaSection from './InitialAssessmentSections/SignOffMeta';

interface InitialAssessmentProps {
  patient: any;
  patientId: string;
  patientId1: string;
  patient_name: string;
  encounterId: string;
  gender: string;
  admission_date: string;
  gestational_age?: string;
  UserRole?: string;
  admissionNo?: string;
  birth_weight?: string;
}

const SECTION_IDS = {
  BABY_IDENTIFIERS: 'section-1',
  MATERNAL_DETAILS: 'section-2',
  BIRTH_DETAILS: 'section-3',
  TRANSPORT_DETAILS: 'section-4',
  PRESENTING_PROBLEMS: 'section-5',
  ADMISSION_VITALS: 'section-6',
  SYSTEMIC_EXAM: 'section-7',
  INVESTIGATIONS: 'section-8',
  MANAGEMENT_PLAN: 'section-9',
  RISK_COUNSELLING: 'section-10',
  SIGNOFF: 'section-11',
};

const NAV_ITEMS = [
  { id: SECTION_IDS.BABY_IDENTIFIERS, label: '1. Baby Identifiers' },
  { id: SECTION_IDS.MATERNAL_DETAILS, label: '2. Maternal & Pregnancy' },
  { id: SECTION_IDS.BIRTH_DETAILS, label: '3. Birth & Resuscitation' },
  { id: SECTION_IDS.TRANSPORT_DETAILS, label: '4. Transport (Outborn)', conditional: true },
  { id: SECTION_IDS.PRESENTING_PROBLEMS, label: '5. Presenting Problems' },
  { id: SECTION_IDS.ADMISSION_VITALS, label: '6. Admission Vitals' },
  { id: SECTION_IDS.SYSTEMIC_EXAM, label: '7. Systemic Examination' },
  { id: SECTION_IDS.INVESTIGATIONS, label: '8. Investigations' },
  { id: SECTION_IDS.MANAGEMENT_PLAN, label: '9. Initial Management' },
  { id: SECTION_IDS.RISK_COUNSELLING, label: '10. Risk Counselling' },
  { id: SECTION_IDS.SIGNOFF, label: '11. Sign-off' },
];

export const InitialAssessment: React.FC<InitialAssessmentProps> = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // --- STATE ---
  const [formState, setFormState] = useState<InitialAssessmentForm>({
    baby_identifiers: {
      babyName: props.patient_name || '', uhid: props.patientId1 || '', ipAdmissionNo: props.admissionNo || '', bedNumber: '',
      sex: (props.gender === 'male' ? 'Male' : props.gender === 'female' ? 'Female' : 'Ambiguous') as any,
      dateOfBirth: props.admission_date ? props.admission_date.split('T')[0] : '', timeOfBirth: '', placeOfBirth: 'Inborn', modeOfDelivery: 'Normal Vaginal',
    },
    maternal_pregnancy: { motherName: '', motherAge: '', gravida: '', para: '', living: '', abortion: '', gestationalAgeWeeks: props.gestational_age || '', gestationalAgeDays: '', gaAssessmentMethod: 'LMP', highRiskFactors: [], antepartumComplications: '', intrapartumComplications: '', medicationsInPregnancy: [], maternalInfections: [] },
    birth_resuscitation: { birthWeight: props.birth_weight || '', length: '', headCircumference: '', apgar1min: '', apgar5min: '', apgar10min: '', resuscitationRequired: false, criedAtBirth: true, delayedCordClamping: 'Yes', meconiumStainedLiquor: 'No' },
    transport_pre_nicu: { ageAtAdmission: '', transportMode: 'Ambulance', accompaniedBy: [], preNicuInterventions: [], conditionOnArrival: [] },
    presenting_problems: { chiefComplaints: [], onsetDuration: '', riskCategory: 'Stable', provisionalDiagnosis: '' },
    admission_vitals: { weight: props.birth_weight || '', temp: '', heartRate: '', respiratoryRate: '', spo2: '', bpSystolic: '', bpDiastolic: '', bloodGlucose: '', painScore: '' },
    system_exam: { generalAppearance: 'Active', tone: 'Normal', levelOfConsciousness: 'Alert', primitiveReflexes: { suck: 'Normal', moro: 'Normal', rooting: 'Normal', grasp: 'Normal' }, seizures: false, fontanelle: 'Normal', workOfBreathing: [], airEntry: 'Bilateral Equal', addedSounds: [], color: 'Pink', capillaryRefillTime: '', heartSounds: 'S1, S2 Normal', murmur: false, pulses: 'Normal', abdominalDistension: false, liverSpleenPalpable: false, bowelSounds: 'Present', feedingTolerance: 'Tolerating', skinFindings: ['Normal'], congenitalAnomalies: '', extremitiesTemp: 'Warm' },
    investigations: { baselineLabs: [], resultsSummary: '', radiologyOrdered: [], sepsisScreen: 'Not Done' },
    initial_management: { respiratorySupport: ['Room Air'], ivFluids: false, inotropes: [], antibiotics: false, otherMedications: '', feedingPlan: [], feedingRoute: 'Oral', feedingFrequencyVolume: '', monitoringPlan: ['Vitals Q2H'], procedures: [] },
    risk_counselling: { prognosis: 'Good', counselled: false, medicoLegalNotes: '', additionalNotes: '' },
    signoff_meta: { admittingDoctor: props.UserRole || 'Dr. Ref', designation: 'Resident', dateOfAssessment: '', timeOfAssessment: '', isComplete: false }
  });
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleFieldChange = (section: keyof InitialAssessmentForm) => (field: string, value: any) => {
    setFormState(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handleSave = (isDraft: boolean) => {
    console.log('Saving Form Data:', formState, 'Draft:', isDraft);
    setLastSaved(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileNavOpen(false);
  };

  const isOutborn = formState.baby_identifiers.placeOfBirth.includes('Outborn');
  const visibleNavItems = NAV_ITEMS.filter(item => !item.conditional || (item.conditional && isOutborn));

  // --- STYLES ---
  const sectionCardStyle = {
    bgcolor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    mb: 3,
    overflow: 'hidden',
  };

  // --- RENDER ---
  return (
    <Box sx={{ display: 'flex', bgcolor: '#f0f2f5', minHeight: '100vh' }}>
      {/* LEFT NAVIGATION RAIL - Sticky */}
      {!isMobile && (
        <Box sx={{ width: 250, flexShrink: 0, bgcolor: '#fff', borderRight: '1px solid #e0e0e0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main">New Initial Assessment</Typography>
            <Typography variant="caption" color="text.secondary">Patient: {props.patient_name}</Typography>
          </Box>
          <List sx={{ p: 1 }}>
            {visibleNavItems.map((item) => (
              <ListItem
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                sx={{
                  borderRadius: '6px', mb: 0.5, cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
                }}
              >
                <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Sections</Typography>
          <List>
            {visibleNavItems.map((item) => (
              <ListItem key={item.id} onClick={() => scrollToSection(item.id)} sx={{ cursor: 'pointer' }}>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* MAIN CONTENT AREA */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header */}
        {isMobile && (
          <Paper square elevation={1} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2, position: 'sticky', top: 0, zIndex: 10 }}>
            <IconButton onClick={() => setMobileNavOpen(true)}><MenuIcon /></IconButton>
            <Typography variant="subtitle1" fontWeight="bold">Initial Assessment</Typography>
          </Paper>
        )}

        {/* Scrollable Form Content */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, pb: '100px' }}>
          <Container maxWidth="md" disableGutters>
            <Paper sx={sectionCardStyle} id={SECTION_IDS.BABY_IDENTIFIERS}><BabyIdentifiersSection data={formState.baby_identifiers} onChange={handleFieldChange('baby_identifiers')} /></Paper>
            <Paper sx={sectionCardStyle} id={SECTION_IDS.MATERNAL_DETAILS}><MaternalDetailsSection data={formState.maternal_pregnancy} onChange={handleFieldChange('maternal_pregnancy')} /></Paper>
            <Paper sx={sectionCardStyle} id={SECTION_IDS.BIRTH_DETAILS}><BirthDetailsSection data={formState.birth_resuscitation} onChange={handleFieldChange('birth_resuscitation')} /></Paper>
            {isOutborn && <Paper sx={sectionCardStyle} id={SECTION_IDS.TRANSPORT_DETAILS}><TransportDetailsSection data={formState.transport_pre_nicu!} onChange={handleFieldChange('transport_pre_nicu')} /></Paper>}
            <Paper sx={sectionCardStyle} id={SECTION_IDS.PRESENTING_PROBLEMS}><PresentingProblemsSection data={formState.presenting_problems} onChange={handleFieldChange('presenting_problems')} /></Paper>
            <Paper sx={sectionCardStyle} id={SECTION_IDS.ADMISSION_VITALS}><AdmissionVitalsSection data={formState.admission_vitals} onChange={handleFieldChange('admission_vitals')} /></Paper>
            <Paper sx={sectionCardStyle} id={SECTION_IDS.SYSTEMIC_EXAM}><SystemicExamSection data={formState.system_exam} onChange={handleFieldChange('system_exam')} /></Paper>
            <Paper sx={sectionCardStyle} id={SECTION_IDS.INVESTIGATIONS}><InvestigationsSection data={formState.investigations} onChange={handleFieldChange('investigations')} /></Paper>
            <Paper sx={sectionCardStyle} id={SECTION_IDS.MANAGEMENT_PLAN}><ManagementPlanSection data={formState.initial_management} onChange={handleFieldChange('initial_management')} /></Paper>
            <Paper sx={sectionCardStyle} id={SECTION_IDS.RISK_COUNSELLING}><RiskCounsellingSection data={formState.risk_counselling} onChange={handleFieldChange('risk_counselling')} /></Paper>
            <Paper sx={sectionCardStyle} id={SECTION_IDS.SIGNOFF}><SignOffMetaSection data={formState.signoff_meta} onChange={handleFieldChange('signoff_meta')} userRole={props.UserRole} /></Paper>
          </Container>
        </Box>

        {/* STICKY BOTTOM ACTION BAR */}
        <Paper
          elevation={8}
          square
          sx={{
            position: 'sticky', bottom: 0, left: 0, right: 0,
            p: 2, zIndex: 1100, bgcolor: '#fff', borderTop: '1px solid #ddd',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
              {props.UserRole?.charAt(0).toUpperCase() || 'D'}
            </Box>
            <Box>
              <Typography variant="body2" fontWeight="medium">{props.UserRole || 'Dr.'}</Typography>
              {lastSaved && <Typography variant="caption" color="text.secondary">Last saved: {lastSaved}</Typography>}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="text" color="inherit" onClick={() => console.log('Cancel')}>Cancel</Button>
            <Button variant="outlined" onClick={() => handleSave(true)}>Save Draft</Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave(false)} sx={{ borderRadius: '8px', px: 3 }}>
              Save Assessment
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Scroll to Top FAB */}
      <Tooltip title="Scroll to Top">
        <Fab color="primary" size="small" sx={{ position: 'fixed', bottom: 90, right: 24, zIndex: 1200 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ArrowUpwardIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};
