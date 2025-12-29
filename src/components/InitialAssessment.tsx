import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Grid,
  TextField,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Chip,
  IconButton,
 Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar
} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { FC, useEffect } from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { alpha } from "@mui/material/styles";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { InputAdornment} from "@mui/material";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SpeechRecognition =
  (window as any).SpeechRecognition ||
  (window as any).webkitSpeechRecognition;


  export interface PatientDetails {
    UserRole: string;
    patient: any;
    patient_name: string;
    
    gestational_age: string;
    admission_date:string;
    gender:string,
    birth_weight:string
    patientId: string;
    patientId1: string;
    admissionNo: string;
    encounterId: any;
   
            }


export const InitialAssessment: FC<PatientDetails> = (props): JSX.Element => {
// const InitialAssessment: React.FC = () => {
  // Plan of Care State

  const SpeechRecognition =
  (window as any).SpeechRecognition ||
  (window as any).webkitSpeechRecognition;
  const [listening, setListening] = useState(false);
const recognitionRef = useRef<any>(null);
const [snackbar, setSnackbar] = useState({
  open: false,
  message: "",
  severity: "success" as "success" | "error"
});
const handleMicClick = () => {
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser");
    return;
  }

  if (!recognitionRef.current) {
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; // change if needed
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      setBirthHistory((prev: any) => ({
        ...prev,
        presentIllness: prev.presentIllness
          ? `${prev.presentIllness} ${transcript}`
          : transcript,
      }));
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }

  if (!listening) {
    recognitionRef.current.start();
    setListening(true);
  } else {
    recognitionRef.current.stop();
    setListening(false);
  }
};
  const [planOfCare, setPlanOfCare] = useState({
    planForDay: "",
    TreatmentofDay:'',

    investigations: [] as string[],
    medications: [
      {
        name: "",
        dose: "",
        frequency: "",
        lastDose: ""
      }
    ],
    newMedication: {
      name: "",
      dose: "",
      frequency: "",
      lastDose: ""
    }
  });

  
  const addPlanText = (text: string) => {
    setPlanOfCare((prev) => ({
      ...prev,
      planForDay: prev.planForDay
        ? prev.planForDay + ", " + text
        : text
    }));
  };
  

  const val = (v?: any) => (v ? String(v) : "");

  const generateInitialAssessmentPdf = () => {
    if (!report) return;
  
    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = 210;
    const margin = 10;
    let y = 12;
  
    // Helper function
    const val = (value: any) => {
      if (value === null || value === undefined || value === "") return "";
      return String(value);
    };
  
    /* ================= HEADER ================= */
    pdf.setFont("Times", "bold");
    pdf.setFontSize(11);
    pdf.text("DOCTORS INITIAL ASSESSMENT", margin, y);
    pdf.setFont("Times", "normal");
    pdf.text("DOC NO. 4", pageW - margin - 25, y);
  
    y += 5;
    pdf.line(margin, y, pageW - margin, y);
    y += 4;
  
    /* ================= BASIC PATIENT INFO ================= */
    // Since your report doesn't have these fields, we'll use placeholders
    autoTable(pdf, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.5 },
      body: [
        [
          "Patient Name",
          `${props.patient_name}`, // Add patient name if available
          "Gestational Age",
          `${props.gestational_age}`, 
          "DOL",
          ""
        ],
        [
          "Sex",
          `${props.gender}`,
          "Date & Time of Admission",
         `${props.admission_date}`,
          "IPD No.",
          ""
        ],
        [
          "Name of the Consultant in-charge",
          "Dr. Maladka",
          "",
          "",
          "",
          ""
        ],
      ],
    });
  
    y = (pdf as any).lastAutoTable.finalY + 4;
  
    /* ================= ALLERGY SECTION ================= */
    autoTable(pdf, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.5 },
      body: [
        ["Allergy", "", "Blood Group", "", "RH factor", ""],
        ["Vulnerable Patient", "", "", "", "", ""],
      ],
    });
  
    y = (pdf as any).lastAutoTable.finalY + 4;
  
    /* ================= ALLERGIC REACTION DETAILS ================= */
    pdf.setFontSize(9);
    pdf.text("Type of Allergic Reaction: Anaphylaxis, Urticaria, Bronchospasm, Diarrhoea, etc.", margin, y);
    y += 5;
    
    pdf.rect(margin, y, pageW - 2 * margin, 6);
    // Check for allergies in general exam or systematic exam
    const allergies = val(report.generalExam?.allergies || "");
    if (allergies) {
      pdf.text(allergies, margin + 2, y + 4);
    }
    
    y += 8;
    
    pdf.text("Alert:", margin, y);
    pdf.rect(margin + 15, y - 2, 50, 6);
    y += 8;
    
    pdf.text("History of Blood Transfusion Reaction: YES / NO", margin, y);
    y += 10;
  
    /* ================= CHIEF COMPLAINT ================= */
    pdf.setFont("Times", "bold");
    pdf.text("Chief Complaint", margin, y);
    pdf.setFont("Times", "normal");
    y += 5;
  
    // Extract chief complaint from available data
    const chiefComplaint = getChiefComplaint();
    
    autoTable(pdf, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.5 },
      head: [["Sr.No.", "Chief Complaint", "Duration of Chief Complaint"]],
      body: [
        ["1", chiefComplaint, ""]
      ],
    });
  
    y = (pdf as any).lastAutoTable.finalY + 4;
  
    /* ================= HISTORY OF PRESENT ILLNESS ================= */
    pdf.setFont("Times", "bold");
    pdf.text("History of Present Illness", margin, y);
    pdf.setFont("Times", "normal");
    y += 5;
    
    const presentIllness = report.planOfCare?.notes || 
                          "Patient with above complaint admitted for further management and treatment";
    
    const illnessLines = pdf.splitTextToSize(presentIllness, pageW - 2 * margin);
    illnessLines.forEach((line: string) => {
      pdf.text(line, margin, y);
      y += 4;
    });
    
    y += 8;
  
    /* ================= CHECK FOR PAGE BREAK ================= */
    if (y > 250) {
      pdf.addPage();
      y = 12;
    }
  
    /* ================= MEDICAL HISTORY TABLE ================= */
    pdf.setFont("Times", "bold");
    pdf.text("General, Medical And Surgical History", margin, y);
    pdf.setFont("Times", "normal");
    y += 5;
  
    // Create medical history grid from systematic exam and general exam
    autoTable(pdf, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.5 },
      body: [
        [
          "Hypertension", val(report.systematicExam?.['Cardiovascular Findings']?.includes('Hypertension') ? 'YES' : ''), 
          "Epilepsy", val(report.systematicExam?.['CNS Findings']?.includes('Seizure') ? 'YES' : ''), 
          "Diabetes", val(report.generalExam?.['Endocrine Findings']?.includes('Diabetes') ? 'YES' : ''), 
          "Cardiac", val(report.systematicExam?.['Cardiovascular Findings'] ? 'YES' : '')
        ],
        [
          "TB", "", 
          "Surgical History", "", 
          "Any Allergies", val(report.generalExam?.allergies ? 'YES' : ''), 
          "Any Other", ""
        ],
      ],
    });
  
    y = (pdf as any).lastAutoTable.finalY + 4;
  
    /* ================= IF YES DETAILS ================= */
    pdf.setFont("Times", "bold");
    pdf.text("If YES to any provide details", margin, y);
    pdf.setFont("Times", "normal");
    y += 5;
    
    // Combine medical details
    const medicalDetails = [];
    
    // Add systematic exam findings as medical details
    if (report.systematicExam) {
      Object.entries(report.systematicExam).forEach(([key, value]) => {
        if (value && value !== "") {
          medicalDetails.push(`${key}: ${value}`);
        }
      });
    }
    
    // Add abnormal general exam findings
    if (report.generalExam) {
      Object.entries(report.generalExam).forEach(([key, value]) => {
        if (value && value !== "" && !key.includes('Normal')) {
          medicalDetails.push(`${key}: ${value}`);
        }
      });
    }
    
    const detailsText = medicalDetails.length > 0 
      ? medicalDetails.join(", ")
      : "No significant medical history noted.";
    
    const detailsLines = pdf.splitTextToSize(detailsText, pageW - 2 * margin);
    detailsLines.forEach((line: string) => {
      pdf.text(line, margin, y);
      y += 4;
    });
    
    y += 8;
  
    /* ================= CURRENT MEDICATION ================= */
    pdf.setFont("Times", "bold");
    pdf.text("Plan of Care", margin, y);
    pdf.setFont("Times", "normal");
    y += 5;
    
    const medications = report.planOfCare?.activities?.join(", ") || "No current medications prescribed";
    
    const medLines = pdf.splitTextToSize(medications, pageW - 2 * margin);
    medLines.forEach((line: string) => {
      pdf.text(line, margin, y);
      y += 4;
    });
    
    y += 8;
  
    /* ================= FAMILY HISTORY ================= */
    pdf.setFont("Times", "bold");
    pdf.text("Family History", margin, y);
    pdf.setFont("Times", "normal");
    y += 5;
    
    pdf.text("No significant family history noted.", margin, y);
    y += 8;
  
    /* ================= CHECK FOR PAGE BREAK ================= */
    if (y > 250) {
      pdf.addPage();
      y = 12;
    }
  
    /* ================= PERSONAL HISTORY ================= */
    pdf.setFont("Times", "bold");
    pdf.text("Personal History", margin, y);
    pdf.setFont("Times", "normal");
    y += 5;
  
    autoTable(pdf, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.5 },
      body: [
        ["Alcohol", "", "Smoking", "", "Drug Addiction", ""],
        ["Other", "", "", "", "", ""],
      ],
    });
  
    y = (pdf as any).lastAutoTable.finalY + 4;
  
    /* ================= DIET ================= */
    pdf.setFont("Times", "bold");
    pdf.text("Diet", margin, y);
    pdf.setFont("Times", "normal");
    y += 5;
    
    const diet = "Breastfeeding / Formula as per neonatal guidelines";
    pdf.text(diet, margin, y);
    y += 8;
  
    /* ================= DEVELOPMENTAL HISTORY ================= */
    pdf.setFont("Times", "bold");
    pdf.text("Developmental History", margin, y);
    pdf.setFont("Times", "normal");
    y += 5;
    
    const developmentalHistory = "Appropriate for gestational age. Regular developmental assessment advised.";
    pdf.text(developmentalHistory, margin, y);
    y += 8;
  
    /* ================= BIRTH HISTORY ================= */
    pdf.setFont("Times", "bold");
    pdf.text("Birth History", margin, y);
    pdf.setFont("Times", "normal");
    y += 5;
  
    // Use actual birth history data
    const birthHistory = report.birthHistory || {};
    
    autoTable(pdf, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.5 },
      body: [
        [
          "Type of Birth:",
          val(birthHistory['Type of Birth'] || "Pink"),
          "Date of Birth:",
          val(birthHistory['Date of Birth'] || ""),
          "Place of Birth:",
          val(birthHistory['Place of Birth'] || "")
        ],
        [
          "Cried immediately after Birth:",
          val(birthHistory['Cried immediately after Birth'] || "YES / NO"),
          "Birth Weight:",
          val(birthHistory['Birth Weight'] || report.anthropometry?.['Weight'] || "2566 g"),
          "GA:",
          val(birthHistory['Gestation'] || birthHistory['GA'] || "21W 4D")
        ],
        [
          "NICU Admission:",
          val(birthHistory['NICU Admission'] || "YES / NO"),
          "if yes reason:",
          val(birthHistory['NICU Reason'] || "MSL (Thru)"),
          "",
          ""
        ],
      ],
    });
  
    y = (pdf as any).lastAutoTable.finalY + 4;
  
    /* ================= VACCINATION STATUS ================= */
    pdf.setFont("Times", "bold");
    pdf.text("Vaccination Status", margin, y);
    pdf.setFont("Times", "normal");
    y += 5;
    
    const vaccinationStatus = val(birthHistory['Vaccination'] || "1230") || 
                             "Age-appropriate vaccinations to be administered as per schedule";
    pdf.text(vaccinationStatus, margin, y);
  
    /* ================= SAVE PDF ================= */
    pdf.save(`Initial_Assessment_${report.patientName || 'Patient'}.pdf`);
  };
  
  /* ================= HELPER FUNCTION ================= */
  const getChiefComplaint = () => {
    if (!report) return "Neonatal assessment required";
    
    // Check systematic exam for findings
    if (report.systematicExam) {
      const findings = Object.values(report.systematicExam).filter(val => val && val !== "");
      if (findings.length > 0) {
        // Take the first significant finding as chief complaint
        for (const [key, value] of Object.entries(report.systematicExam)) {
          if (value && value !== "") {
            return `${key}: ${value}`;
          }
        }
      }
    }
    
    // Check general exam
    if (report.generalExam) {
      const findings = Object.values(report.generalExam).filter(val => val && val !== "");
      if (findings.length > 0) {
        for (const [key, value] of Object.entries(report.generalExam)) {
          if (value && value !== "" && !key.includes('Normal')) {
            return `${key}: ${value}`;
          }
        }
      }
    }
    
    // Check vitals for abnormalities
    if (report.vitals) {
      const abnormalVitals = [];
      if (report.vitals['Heart Rate'] && parseInt(report.vitals['Heart Rate']) < 100) {
        abnormalVitals.push("Bradycardia");
      }
      if (report.vitals['Oxygen Saturation'] && parseInt(report.vitals['Oxygen Saturation']) < 90) {
        abnormalVitals.push("Low oxygen saturation");
      }
      if (abnormalVitals.length > 0) {
        return abnormalVitals.join(", ");
      }
    }
    
    return "Neonatal assessment required";
  };
  
  /* ================= HELPER FUNCTION ================= */
  const getChiefComplaintFromReport = (report: any) => {
    // Try to extract chief complaint from various sections
    if (report.birthHistory?.condition) {
      return report.birthHistory.condition;
    }
    
    if (report.vitals?.notes) {
      return report.vitals.notes;
    }
    
    if (report.generalExam?.presentingComplaint) {
      return report.generalExam.presentingComplaint;
    }
    
    // Extract from plan of care notes
    if (report.planOfCare?.notes) {
      const notes = report.planOfCare.notes.toLowerCase();
      if (notes.includes('fever')) return "Fever";
      if (notes.includes('respiratory')) return "Respiratory distress";
      if (notes.includes('jaundice')) return "Jaundice";
      if (notes.includes('feeding')) return "Feeding difficulties";
    }
    
    return "Neonatal assessment required";
  };


  const updateNewMedication = (key: string, value: string) => {
    setPlanOfCare((prev) => ({
      ...prev,
      newMedication: {
        ...prev.newMedication,
        [key]: value
      }
    }));
  };
  
  const addMedication = () => {
    setPlanOfCare((prev) => ({
      ...prev,
      medications: [...prev.medications, prev.newMedication],
      newMedication: { name: "", dose: "", frequency: "", lastDose: "" }
    }));
  };
  
  
  const [chiefComplaint, setChiefComplaint] = useState("");
  
      const [birthType, setBirthType] = useState<string | null>("NVD"); // default selected
    const [liquorStatus, setLiquorStatus] = useState<string | null>("Clear"); 
      const [birthHistory, setBirthHistory] = useState({
    chiefComplaints: "",
    presentIllness: "",
    birthType: null,
    liquorStatus: null,
    criedImmediately: false,
    resuscitation: false,
    vitaminK: false,
    gestWeeks: "",
    gestDays: "",
    birthWeight: "",
    vaccination: "",
    apgar1: "",
    apgar5: "",
    apgar10: "",
  });
  
  const isBirthHistoryComplete = () => {
    return (
      birthHistory.chiefComplaints.trim() !== "" &&
      birthHistory.presentIllness.trim() !== "" &&
  
      birthHistory.gestWeeks.trim() !== "" &&
      birthHistory.gestDays.trim() !== "" &&
      birthHistory.birthWeight.trim() !== "" &&
      birthHistory.vaccination.trim() !== "" &&
      birthHistory.apgar1 !== ""
   
    );
  };
  const currentDateTime = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  function SignatureCard({
    role,
    name,
    dateTime,
  }: {
    role: string;
    name: string;
    dateTime: string;
  }) {
    const [signature, setSignature] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
  
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          borderColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* ROLE + NAME */}
        <Typography fontSize={13} color="#6B7280">
          {role}:{" "}
          <Typography component="span" fontWeight={600} color="#111827">
            {name}
          </Typography>
        </Typography>
  
        {/* SIGNATURE ROW */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          {/* SIGNATURE COLUMN */}
          <Box>
            <Typography fontSize={13} color="#6B7280">
              Signature
            </Typography>
  
            {!signature ? (
              <Button
                startIcon={<AddIcon />}
                sx={{
                  mt: 0.5,
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#228BE6",
                  px: 0,
                  "&:hover": { backgroundColor: "transparent" },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                Add
              </Button>
            ) : (
              <Box
                sx={{
                  mt: 1,
                  cursor: "pointer",
                  border: "1px dashed #A5B4FC",
                  borderRadius: 2,
                  p: 1,
                  display: "inline-block",
                  "&:hover": {
                    borderColor: "#228BE6",
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={signature}
                  alt="Digital Signature"
                  style={{
                    maxHeight: 70,
                    maxWidth: 220,
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}
  
            {/* HIDDEN FILE INPUT */}
            <input
              type="file"
              accept="image/png"
              hidden
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
  
                if (file.type !== "image/png") {
                  alert("Only PNG files are allowed");
                  return;
                }
  
                const reader = new FileReader();
                reader.onload = () =>
                  setSignature(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </Box>
  
          {/* DATE & TIME */}
          <Box textAlign="right">
            <Typography fontSize={12} color="#6B7280">
              Date & Time
            </Typography>
            <Typography fontSize={13} fontWeight={600} color="#111827">
              {dateTime}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }
  const [signature, setSignature] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any>(null);

  // useEffect(() => {
  //   if (!props.patientId || !props.encounterId) return;
  
  //   fetchInitialAssessment(props.patientId, props.encounterId).then((data) => {
  //     const parsed = parseInitialAssessment(data.observations);
  
  //     setInitialData({
  //       ...parsed,
  //       carePlan: data.carePlans[0],
  //     });
  
  //     console.log("📥 Initial Assessment Loaded", parsed);
  //   });
  // }, [props.patientId, props.encounterId]);
  
  
  const [report, setReport] = useState<any>(null);

  const getObsTitle = (obs: any): string => {
    return (
      obs.code?.text ||
      obs.code?.coding?.[0]?.display ||
      obs.code?.coding?.[0]?.code ||
      ""
    ).trim();
  };
  
useEffect(() => {
  if (!props.patientId || !props.encounterId) return;
  const BASE = import.meta.env.VITE_FHIRAPI_URL;
  const AUTH = {
    "Content-Type": "application/fhir+json",
    Authorization: "Basic " + btoa("fhiruser:change-password"),
  };
  Promise.all([
    fetch(`${BASE}/Observation?encounter=Encounter/${props.encounterId}`, { headers: AUTH }),
    fetch(`${BASE}/CarePlan?encounter=Encounter/${props.encounterId}`, { headers: AUTH }),
  ])
    .then(async ([obsRes, cpRes]) => {
      const obsJson = await obsRes.json();
      const cpJson = await cpRes.json();

      const observations = obsJson.entry?.map((e: any) => e.resource) || [];
      const carePlans = cpJson.entry?.map((e: any) => e.resource) || [];

      const fullReport = buildInitialAssessmentReport(observations, carePlans);

      console.log("📘 FULL INITIAL ASSESSMENT REPORT", fullReport);
      setReport(fullReport);
    });
}, [props.patientId, props.encounterId]);

  
    const [vitals, setVitals] = useState({
      temp: "",
      hr: "",
      rr: "",
      spo2: "",
      relatedText: "",
      weight: "",
      hc: "",
      length: "",
      bsl: "",
      bp: ""
    });
  
    const isVitalsComplete = () => {
      return (
        vitals.temp &&
        vitals.hr &&
        vitals.rr &&
        vitals.spo2 &&
        vitals.weight &&
        vitals.hc &&
        vitals.length &&
        vitals.bsl &&
        vitals.bp
      );
    };
     
    const [exam, setExam] = useState({
      consciousness: "",
      color: [],
      skin: [],
      skinOther: "",
      headNeck: [],
      headNeckOther: "",
      headNeckDesc: "",
      ear: [],
      earOther: "",
      earDesc: "",
      nose: [],
      noseOther: "",
      noseDesc: "",
      throat: [],
      throatOther: "",
      throatDesc: "",
      eyes: [],
      eyesOther: "",
      eyesDesc: "",
      spineBack:[],
      spineBackOther:"",
      spineBackDesc:"",
      hipsLimbs:[],
      hipsLimbsOther:"",
      hipsLimbsDesc:"",
      respiratory: [],
  respiratoryOther: "",
  respiratoryDesc: "",
  
  cardio: [],
  cardioOther: "",
  cardioDesc: "",
  
  gi: [],
  giOther: "",
  giDesc: "",
  
  cns: [],
  cnsOther: "",
  cnsDesc: "",
  
  gu: [],
  guOther: "",
  guDesc: "",
  
  msk: [],
  mskOther: "",
  mskDesc: "",
  
    });
  
    // REQUIRED FIELDS → Fill these according to your logic
    const isGeneralPhysicalComplete = () => {
      return (
        exam.consciousness &&
        exam.color.length > 0 &&
        (exam.skin.length > 0 || exam.skinOther.trim() !== "")
      );
    };
    
    const saveInitialAssessment = async (
      patientId: string,
      encounterId: string
    ) => {
      const BASE = import.meta.env.VITE_FHIRAPI_URL;
      const AUTH = {
        "Content-Type": "application/fhir+json",
        Authorization: "Basic " + btoa("fhiruser:change-password"),
      };
    
      try {
        /* ===============================
           1️⃣ BIRTH HISTORY OBSERVATION
        =============================== */

        const components = [
          { label: "Present Illness", value: birthHistory.presentIllness },
          { label: "Type of Birth", value: birthType },
          { label: "Liquor Status", value: liquorStatus },
          { label: "Gestation", value: `${birthHistory.gestWeeks}W ${birthHistory.gestDays}D` },
          { label: "Vaccination", value: birthHistory.vaccination },
          { label: "APGAR 1 min", value: birthHistory.apgar1 },
          { label: "APGAR 5 min", value: birthHistory.apgar5 },
          { label: "APGAR 10 min", value: birthHistory.apgar10 },
        ].filter(c => c.value);
        
        const birthHistoryPayload = {
          resourceType: "Observation",
          status: "final",
          category: [{
            coding: [{
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "survey",
              display: "Survey"
            }]
          }],
          code: {
            coding: [{
              system: "http://loinc.org",
              code: "birthhistory",
              display: "Birth History"
            }],
            text: "Birth History"
          },
          subject: { reference: `Patient/${patientId}` },
          encounter: { reference: `Encounter/${encounterId}` },
          component: components.map(c => ({
            code: { text: c.label },
            valueString: c.value
          }))
        };
        
       
        await fetch(`${BASE}/Observation`, {
          method: "POST",
          headers: AUTH,
          body: JSON.stringify(birthHistoryPayload),
        });
    
        /* ===============================
           2️⃣ CHIEF COMPLAINT → CONDITION
        =============================== */
        if (chiefComplaint) {
          const complaints = chiefComplaint.split(",").map(c => c.trim());
    
          for (const complaint of complaints) {
            const conditionPayload = {
              resourceType: "Condition",
              clinicalStatus: {
                coding: [{
                  system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                  code: "active"
                }]
              },
              verificationStatus: {
                coding: [{
                  system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                  code: "confirmed"
                }]
              },
              category: [{
                coding: [{
                  system: "http://terminology.hl7.org/CodeSystem/condition-category",
                  code: "problem-list-item"
                }]
              }],
              code: {
                text: complaint
              },
              subject: { reference: `Patient/${patientId}` },
              encounter: { reference: `Encounter/${encounterId}` }
            };
            
    
            await fetch(`${BASE}/Condition`, {
              method: "POST",
              headers: AUTH,
              body: JSON.stringify(conditionPayload),
            });
          }
        }
          /* ===============================
           3️⃣ VITAL SIGNS OBSERVATIONS
        =============================== */
        const vitalsPayload = {
          resourceType: "Observation",
          status: "final",
          category: [{
            coding: [{
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs"
            }]
          }],
          code: { text: "Vitals" },
          subject: { reference: `Patient/${patientId}` },
          encounter: { reference: `Encounter/${encounterId}` },
        
          component: [
            {
              code: { text: "Body Temperature" },
              valueQuantity: vitals.temp
                ? { value: Number(vitals.temp), unit: "°C" }
                : undefined,
            },
            {
              code: { text: "Heart Rate" },
              valueQuantity: vitals.hr
                ? { value: Number(vitals.hr), unit: "beats/min" }
                : undefined,
            },
            {
              code: { text: "Respiratory Rate" },
              valueQuantity: vitals.rr
                ? { value: Number(vitals.rr), unit: "breaths/min" }
                : undefined,
            },
            {
              code: { text: "Oxygen Saturation" },
              valueQuantity: vitals.spo2
                ? { value: Number(vitals.spo2), unit: "%" }
                : undefined,
            },
            {
              code: { text: "Other Related Notes" },
              valueString: vitals.relatedText,
            },
          ].filter(
            (c) => c.valueQuantity || (c.valueString && c.valueString.trim() !== "")
          ),
        };
        
        await fetch(`${BASE}/Observation`, {
          method: "POST",
          headers: AUTH,
          body: JSON.stringify(vitalsPayload),
        });
         /* ===============================
           4️⃣ ANTHROPOMETRY
        =============================== */
        const anthropometryPayload = {
          resourceType: "Observation",
          status: "final",
          category: [{
            coding: [{
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs"
            }]
          }],
          code: { text: "Anthropometry" },
          subject: { reference: `Patient/${patientId}` },
          encounter: { reference: `Encounter/${encounterId}` },
        
          component: [
            {
              code: { text: "Weight" },
              valueQuantity: vitals.weight
                ? { value: Number(vitals.weight), unit: "g" }
                : undefined,
            },
            {
              code: { text: "Head Circumference" },
              valueQuantity: vitals.hc
                ? { value: Number(vitals.hc), unit: "cm" }
                : undefined,
            },
            {
              code: { text: "Length" },
              valueQuantity: vitals.length
                ? { value: Number(vitals.length), unit: "cm" }
                : undefined,
            },
            {
              code: { text: "Blood Glucose" },
              valueQuantity: vitals.bsl
                ? { value: Number(vitals.bsl), unit: "mg/dL" }
                : undefined,
            },
          ].filter((c) => c.valueQuantity),
        };
        
        await fetch(`${BASE}/Observation`, {
          method: "POST",
          headers: AUTH,
          body: JSON.stringify(anthropometryPayload),
        });
        /* ===============================
     6️⃣ GENERAL PHYSICAL EXAMINATION
  ================================ */
    const generalExamPayload = {
    resourceType: "Observation",
    status: "final",
    category: [{
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/observation-category",
        code: "generalexamination",
        display: "General Physical Examination"
      }]
    }],
    code: { text: "General Physical Examination" },
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${encounterId}` },
  
    component: [
      {
        code: { text: "Level of Consciousness" },
        valueString: exam.consciousness,
      },
  
      {
        code: { text: "Color" },
        valueString: exam.color.join(", "),
      },
  
      {
        code: { text: "Skin Findings" },
        valueString: exam.skin.join(", "),
      },
      {
        code: { text: "Skin Other Findings" },
        valueString: exam.skinOther,
      },
  
      {
        code: { text: "Head & Neck Findings" },
        valueString: exam.headNeck.join(", "),
      },
      {
        code: { text: "Head & Neck Other" },
        valueString: exam.headNeckOther,
      },
      {
        code: { text: "Head & Neck Description" },
        valueString: exam.headNeckDesc,
      },
  
      {
        code: { text: "ENT - Ear Findings" },
        valueString: exam.ear.join(", "),
      },
      {
        code: { text: "ENT - Ear Other" },
        valueString: exam.earOther,
      },
      {
        code: { text: "ENT - Ear Description" },
        valueString: exam.earDesc,
      },
  
      {
        code: { text: "ENT - Nose Findings" },
        valueString: exam.nose.join(", "),
      },
      {
        code: { text: "ENT - Nose Other" },
        valueString: exam.noseOther,
      },
      {
        code: { text: "ENT - Nose Description" },
        valueString: exam.noseDesc,
      },
  
      {
        code: { text: "ENT - Throat Findings" },
        valueString: exam.throat.join(", "),
      },
      {
        code: { text: "ENT - Throat Other" },
        valueString: exam.throatOther,
      },
      {
        code: { text: "ENT - Throat Description" },
        valueString: exam.throatDesc,
      },
  
      {
        code: { text: "ENT - Eye Findings" },
        valueString: exam.eyes.join(", "),
      },
      {
        code: { text: "ENT - Eye Other" },
        valueString: exam.eyesOther,
      },
      {
        code: { text: "ENT - Eye Description" },
        valueString: exam.eyesDesc,
      },
  
      {
        code: { text: "Spine & Back Findings" },
        valueString: exam.spineBack.join(", "),
      },
      {
        code: { text: "Spine & Back Other" },
        valueString: exam.spineBackOther,
      },
      {
        code: { text: "Spine & Back Description" },
        valueString: exam.spineBackDesc,
      },
  
      {
        code: { text: "Hips & Limbs Findings" },
        valueString: exam.hipsLimbs.join(", "),
      },
      {
        code: { text: "Hips & Limbs Other" },
        valueString: exam.hipsLimbsOther,
      },
      {
        code: { text: "Hips & Limbs Description" },
        valueString: exam.hipsLimbsDesc,
      },
    ].filter(
      (c) =>
        c.valueString !== undefined &&
        c.valueString !== null &&
        c.valueString !== ""
    ),
  };
  
  await fetch(`${BASE}/Observation`, {
    method: "POST",
    headers: AUTH,
    body: JSON.stringify(generalExamPayload),
  });
  /* ===============================
     7️⃣ SYSTEMATIC EXAMINATION
  ================================ */
const systematicExamPayload = {
    resourceType: "Observation",
    status: "final",
    category: [{
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/observation-category",
        code: "systemexamination",
        display: "Systematic Examination"
      }]
    }],
    code: { text: "Systematic Examination" },
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${encounterId}` },
  
    component: [
      {
        code: { text: "Respiratory Findings" },
        valueString: exam.respiratory.join(", "),
      },
      {
        code: { text: "Respiratory Other" },
        valueString: exam.respiratoryOther,
      },
      {
        code: { text: "Respiratory Description" },
        valueString: exam.respiratoryDesc,
      },
  
      {
        code: { text: "Cardiovascular Findings" },
        valueString: exam.cardio.join(", "),
      },
      {
        code: { text: "Cardiovascular Other" },
        valueString: exam.cardioOther,
      },
      {
        code: { text: "Cardiovascular Description" },
        valueString: exam.cardioDesc,
      },
  
      {
        code: { text: "GI Findings" },
        valueString: exam.gi.join(", "),
      },
      {
        code: { text: "GI Other" },
        valueString: exam.giOther,
      },
      {
        code: { text: "GI Description" },
        valueString: exam.giDesc,
      },
  
      {
        code: { text: "CNS Findings" },
        valueString: exam.cns.join(", "),
      },
      {
        code: { text: "CNS Other" },
        valueString: exam.cnsOther,
      },
      {
        code: { text: "CNS Description" },
        valueString: exam.cnsDesc,
      },
  
      {
        code: { text: "Genitourinary Findings" },
        valueString: exam.gu.join(", "),
      },
      {
        code: { text: "Genitourinary Other" },
        valueString: exam.guOther,
      },
      {
        code: { text: "Genitourinary Description" },
        valueString: exam.guDesc,
      },
  
      {
        code: { text: "Musculoskeletal Findings" },
        valueString: exam.msk.join(", "),
      },
      {
        code: { text: "Musculoskeletal Other" },
        valueString: exam.mskOther,
      },
      {
        code: { text: "Musculoskeletal Description" },
        valueString: exam.mskDesc,
      },
    ].filter(
      (c) => c.valueString && c.valueString.trim() !== ""
    ),
  };
  
  await fetch(`${BASE}/Observation`, {
    method: "POST",
    headers: AUTH,
    body: JSON.stringify(systematicExamPayload),
  });
  /* ===============================
     8️⃣ PLAN OF CARE / TREATMENT
  ================================ */
  const carePlanPayload = {
    resourceType: "CarePlan",
    status: "active",
    intent: "plan",
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${encounterId}` },
  
    activity: [
      {
        detail: {
          status: "not-started", // ✅ VALID VALUE
          description: planOfCare.planForDay || "Initial plan",
        },
      },
  
      ...planOfCare.investigations.map((inv) => ({
        detail: {
          status: "not-started", // ✅ VALID VALUE
          description: inv,
        },
      })),
    ],
  
    note: planOfCare.medications.length
      ? [
          {
            text: planOfCare.medications
              .map(
                (m) =>
                  `${m.name} ${m.dose} ${m.frequency} (Last: ${m.lastDose})`
              )
              .join(" | "),
          },
        ]
      : undefined,
  };
  
  
  
  
  const res = await fetch(`${BASE}/CarePlan`, {
    method: "POST",
    headers: AUTH,
    body: JSON.stringify(carePlanPayload),
  });
  
  const responseText = await res.text();
  
  console.log("🟡 CarePlan status:", res.status);
  console.log("🟡 CarePlan raw response:", responseText);
  
  if (!res.ok) {
    
    try {
      const json = JSON.parse(responseText);
      console.error("🔴 CarePlan OperationOutcome:", json);
    } catch {
      console.error("🔴 CarePlan error (non-JSON):", responseText);
    }
    throw new Error("CarePlan save failed");
  }
  
  console.log("📌 Birth History Observation", birthHistoryPayload);
  console.log("📌 General Physical Exam", generalExamPayload);
  console.log("📌 Systematic Examination", systematicExamPayload);
  console.log("📌 CarePlan", carePlanPayload);
  setSnackbar({
    open: true,
    severity: "success",
    message: "NICU Admission completed successfully",
  });
        console.log("✅ Initial Assessment saved successfully");
    
      } catch (err) {
        console.error("❌ Failed to save Initial Assessment", err);
        throw err;
      }
    };
    
   
    const toggleValue = (field, value) => {
      const arr = exam[field];
      const updated = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
  
      setExam({ ...exam, [field]: updated });
    };
    useEffect(() => {
    fetch("/chiefcomplaints.json")
      .then((res) => res.json())
      .then((data) => setChiefComplaints(data))
      .catch(console.error);
  }, []);
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
    const [chiefComplaints, setChiefComplaints] = useState<any[]>([]);
    const [selectedComplaints, setSelectedComplaints] = useState<any[]>([]);
    const buildInitialAssessmentReport = (
      observations: any[],
      carePlans: any[]
    ) => {
      const report: any = {
        birthHistory: {},
        vitals: {},
        anthropometry: {},
        generalExam: {},
        systematicExam: {},
        planOfCare: {},
      };
    
      observations.forEach((obs) => {

      const title = getObsTitle(obs);
console.log("🔎 OBS TITLE:", getObsTitle(obs), obs);

        // 🟢 Birth History
        if (title === "Birth History") {
         
          obs.component?.forEach((c: any) => {
            const label =
              c.code?.text ||
              c.code?.coding?.[0]?.display;
        
            const value =
              c.valueString ??
              (c.valueQuantity
                ? `${c.valueQuantity.value} ${c.valueQuantity.unit ?? ""}`
                : undefined);
        
            if (label && value !== undefined && value !== null && value !== "") {
              report.birthHistory[label] = value;
            }
          });
        }
        
// 🟢 VITALS
else if (title === "Vitals") {
  obs.component?.forEach((c: any) => {
    const label =
      c.code?.text ||
      c.code?.coding?.[0]?.display ||
      c.code?.coding?.[0]?.code;

    const value = c.valueQuantity
      ? `${c.valueQuantity.value} ${c.valueQuantity.unit ?? ""}`
      : c.valueString;

    if (label && value) {
      report.vitals[label] = value;
    }
  });
}


// 🟢 ANTHROPOMETRY
else if (title === "Anthropometry") {
  obs.component?.forEach((c: any) => {
    const label =
      c.code?.text ||
      c.code?.coding?.[0]?.display ||
      c.code?.coding?.[0]?.code;

    const value = c.valueQuantity
      ? `${c.valueQuantity.value} ${c.valueQuantity.unit ?? ""}`
      : null;

    if (label && value) {
      report.anthropometry[label] = value;
    }
  });
}


    
        // 🟢 General Physical Examination
        else if (title === "General Physical Examination") {
          obs.component?.forEach((c: any) => {
            if (c.valueString) {
              report.generalExam[c.code.text] = c.valueString;
            }
          });
        }
    
        // 🟢 Systematic Examination
        else if (title === "Systematic Examination") {
          obs.component?.forEach((c: any) => {
            const label =
              c.code?.text ||
              c.code?.coding?.[0]?.display ||
              "";
            console.log('check system examination',label);
            
            if (label && c.valueString) {
              report.systematicExam[label] = c.valueString;
            }
          });
        }
        
    
      
      });
    
      // 🟢 Plan of Care
      if (carePlans && carePlans.length > 0) {
        const cp = carePlans[0];
      
        report.planOfCare = {
          activities:
            cp.activity?.map((a: any) => a.detail?.description).filter(Boolean) || [],
          notes: cp.note?.map((n: any) => n.text).join(" | ") || "",
          startDate: cp.period?.start || "",
          
        };
      }
      
    
      console.log("📄 FULL INITIAL ASSESSMENT REPORT", report);
      return report;
    };
    const Section = ({ title, data }: { title: string; data: any }) => {
      if (!data || Object.keys(data).length === 0) return null;
    
      return (
        <Box mb={3}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              borderBottom: "2px solid #E0E0E0",
              pb: 0.5,
              mb: 1,
              color: "#124D81",
            }}
          >
            {title}
          </Typography>
    
          <Grid container spacing={1}>
            {Object.entries(data).map(([key, value]) => (
              <Grid item xs={6} key={key}>
                <Typography variant="body2">
                  <b>{key}:</b> {value || "—"}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    };
    useEffect(() => {
      fetch("/chiefcomplaints.json")
        .then((res) => res.json())
        .then((data) => setChiefComplaints(data))
        .catch(console.error);
    }, []);
    
    const apgarFields = [
      { label: "1 min", key: "apgar1  " },
      { label: "5 min", key: "apgar5" },
      { label: "10 min", key: "apgar10" },
    ];

  return (
    <><Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      
      {/* ----------------- Birth History ----------------- */}
      <Accordion sx={{
    background: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "none",
    border: "1px solid #E6EEF6",
    mt:0
  }}>
  <AccordionSummary
    expandIcon={isBirthHistoryComplete()
      ? <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
      : <AddIcon sx={{ color: "#228BE6", fontSize: 30 }} />}
    sx={{
      backgroundColor: isBirthHistoryComplete() ? "#D9F7D9" : "#F9FAFB",
      borderRadius: "8px",
      border:"1px solid #DEE2E6",
      "& .MuiAccordionSummary-expandIconWrapper": {
        transform: "none !important",
      },
      "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
        transform: "none !important",
      },
    }}
  >
    <Typography sx={{ fontWeight: 600, color: "#374151" }}>1. Birth History</Typography>
  </AccordionSummary>

  <AccordionDetails sx={{ color: "#228BE6" }}>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Chief Complaints */}
      <Typography variant="inherit" sx={{ color: "#212529", fontWeight: 600 }}>Chief Complaints</Typography>
      <Box mb={2}>
  {selectedComplaints.map((item) => (
    <Box
      key={item.interfaceName}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #E5E7EB",
        borderRadius: 2,
        px: 2,
        py: 1,
        
        backgroundColor: "#FFFFFF",
      }}
    >
      <Typography variant="inherit" fontSize={13} fontWeight={600} sx={{color:"black"}}>
        {item.standardMedicalTerm}({item.interfaceName})
      </Typography>

      <IconButton
        size="small"
        sx={{color:"red"}}
        onClick={() =>
          setSelectedComplaints((prev) =>
            prev.filter(
              (c) => c.interfaceName !== item.interfaceName
            )
          )
        }
      >
        <RemoveCircleOutlineIcon />
      </IconButton>
    </Box>
  ))}
</Box>
<Box sx={{border:"1px solid #CED4DA",padding:2,borderRadius:2,mt:-4.5}}>
      <TextField
        placeholder="Free Text Here..."
        fullWidth
        multiline
        minRows={2}
        value={chiefComplaint}
        onChange={(e) => setChiefComplaint(e.target.value)}
        sx={{
          backgroundColor: "#ffffffff",
          borderRadius: 2,
          border:"hidden",
          
    "& .MuiOutlinedInput-root": {
      

      "&:hover fieldset": {
        border: "1px solid #ffffffff", // hover (no blue)
      },

      "&.Mui-focused fieldset": {
        border: "1px solid #ffffffff", // focused (no blue)
      },
    },
          
          "& .MuiInputBase-input": { color: "#000" },
        }} />

      {/* Complaint Tags */}
     <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
  {chiefComplaints.map((item) => (
    <Chip
      key={item.interfaceName}
      label={item.interfaceName} // 👈 SHORT NAME
      clickable
      onClick={() => {
        setSelectedComplaints((prev) => {
          const exists = prev.some(
            (c) => c.interfaceName === item.interfaceName
          );
          if (exists) return prev;

          return [...prev, item];
        });
      }}
      sx={{
        backgroundColor:alpha("#228BE61A",0.1),
        color: "#228BE6",
        fontWeight: 500,
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#D0E4FF",
        },
      }}
    />
  ))}
</Box>
</Box>

      {/* History of Present Illness */}
      <Typography variant="inherit" sx={{ color: "#212529", fontWeight: 600 }}>History of Present Illness</Typography>
    <TextField
  placeholder="Free Text Here..."
  fullWidth
  multiline
  minRows={2}
  value={birthHistory.presentIllness}
  onChange={(e) =>
    setBirthHistory({
      ...birthHistory,
      presentIllness: e.target.value,
    })
  }
  sx={{
    border:"1px solid #CED4DA",
          backgroundColor: "#ffffffff",
          borderRadius: 2,
          
          
          "& .MuiInputBase-input": { color: "#000" },
        }}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={handleMicClick}
          sx={{
            color: listening ? "#E03131" : "#228BE6",
          }}
        >
          {listening ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>


      {/* Type of Birth + Liquor Status */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="inherit" mb={2} sx={{ color: "#212529", fontWeight: 600 }}>Type of Birth * </Typography>
          <Grid mt={2}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={birthType}
        
            onChange={(event, newValue) => setBirthType(newValue)}
          >
            {["NVD", "LSCS", "Instrumental"].map((opt) => (
              <ToggleButton
                key={opt}
                value={opt}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#7A8899",
                  
                  height: "48px",
                  border: "1px solid #D0D7E2",
                  borderRadius: "8px",
                  transition: "all 0.1s ease",
                  "&.Mui-selected": {
                    backgroundColor: alpha("#228BE6", 0.1),
                    color: "#228BE6",
                  },
                }}
              >
                {opt}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="inherit" mb={2} sx={{ color: "#212529", fontWeight: 600 }}>Liquor Status *</Typography>
          <Grid mt={2}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={liquorStatus}
            onChange={(_event, newValue) => setLiquorStatus(newValue)}>
            {["Clear", "Meconium Thin", "Meconium Thick", "Foul"].map((opt) => (
              <ToggleButton
                key={opt}
                value={opt}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#7A8899",
                  
                  height: "48px",
                  border: "1px solid #D0D7E2",
                  borderRadius: "8px",
                  transition: "all 0.1s ease",
                  "&.Mui-selected": {
                    backgroundColor: alpha("#228BE6", 0.1),
                    color: "#228BE6",
                  },
                }}
              >
                {opt}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Grid>

      {/* Birth Questions */}
      <Grid container spacing={2}>
        {[
          "Cried Immediately after birth?",
          "Resuscitation",
          "Vitamin K given?",
        ].map((label) => (
          <Grid item xs={12} md={4} key={label}>
            <Box
              sx={{
                border: "1px solid #DDE3ED",
                borderRadius: 1,
                px: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500, color: "#000" }}>
                {label}
              </Typography>
              <Checkbox
                sx={{
                  color: "#124D81",
                  "&.Mui-checked": {
                    color: "#228BE6",
                  },
                }} />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Gestation + Birth Weight + Vaccination */}
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={4} >
          <Typography variant="inherit" sx={{ color: "#212529", fontWeight: 600 }}>Gestation</Typography>
          
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              placeholder="00 Wks"
              fullWidth
              value={birthHistory.gestWeeks}
              onChange={(e) => setBirthHistory({ ...birthHistory, gestWeeks: e.target.value })}
              sx={{ mt:1,borderRadius:2, backgroundColor: "#ffffffff",
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,

      "& fieldset": {
        border: "1px solid #CED4DA", // normal border
      },

      "&:hover fieldset": {
        border: "1px solid #CED4DA", // hover (no blue)
      },

      "&.Mui-focused fieldset": {
        border: "1px solid #CED4DA", // focused (no blue)
      },
    }, "& .MuiInputBase-input": { color: "#000" } }} />
            <Typography sx={{ pt: 4, color: "#CED4DA" }}>Wks</Typography>
            <TextField
              placeholder="00 Days"
              fullWidth
              value={birthHistory.gestDays}
              onChange={(e) => setBirthHistory({ ...birthHistory, gestDays: e.target.value })}
               sx={{ mt:1,borderRadius:2, backgroundColor: "#ffffffff",border:"1px solid #CED4DA", "& .MuiInputBase-input": { color: "#000" } }}/>
            <Typography sx={{ pt: 4, color: "#CED4DA" }}>Days</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="inherit" sx={{ color: "#212529", fontWeight: 600 }}>Birth Weight</Typography>
          <TextField
            placeholder="0000 g"
            fullWidth
            value={birthHistory.birthWeight}
            onChange={(e) => setBirthHistory({ ...birthHistory, birthWeight: e.target.value })}
             sx={{ mt:1,borderRadius:2, backgroundColor: "#ffffffff",border:"1px solid #CED4DA", "& .MuiInputBase-input": { color: "#000" } }}/>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="inherit" sx={{ color: "#212529", fontWeight: 600 }}>Vaccination</Typography>
          <TextField
            placeholder="0000 g"
            fullWidth
            value={birthHistory.vaccination}
            onChange={(e) => setBirthHistory({ ...birthHistory, vaccination: e.target.value })}
             sx={{mt:1, borderRadius:2, backgroundColor: "#ffffffff",border:"1px solid #CED4DA", "& .MuiInputBase-input": { color: "#000" } }} />
        </Grid>
      </Grid>

      {/* APGAR Scores */}
      <Typography variant="inherit" sx={{ color: "#212529", fontWeight: 600 }}>APGAR Scores *</Typography>
   <Grid container spacing={2}>
  {apgarFields.map(({ label, key }) => (
    <Grid item xs={12} md={4} key={key}>
      <TextField
        select
        label={label}
        fullWidth
        value={birthHistory[key]}
        onChange={(e) =>
          setBirthHistory((prev) => ({
            ...prev,
            [key]: e.target.value,
          }))
        }
        sx={{ mt:1,borderRadius:2, backgroundColor: "#ffffffff",border:"1px solid #CED4DA", "& .MuiInputBase-input": { color: "#000" },"& .MuiInputLabel-root": { color: "#CED4DA" }, }}
      >
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <MenuItem key={v} value={v}>
            {v}
          </MenuItem>
        ))}
      </TextField>
    </Grid>
  ))}
</Grid>


      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
        
        <Button
          variant="contained"
          sx={{ textTransform: "none", backgroundColor: "#228BE6", borderRadius: 2, px: 4 }}
        >
          Next
        </Button>
      </Box>
    </Box>
  </AccordionDetails>
</Accordion>

<Accordion sx={{
    background: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "none",
    border: "1px solid #E6EEF6",
    mt: 0
  }}>
      <AccordionSummary
        expandIcon={
          isVitalsComplete() ? (
            <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
          ) : (
            <AddIcon sx={{ color: "#228BE6", fontSize: 30 }} />
          )
        }
        sx={{
          backgroundColor: isVitalsComplete() ? "#D9F7D9" : "#F9FAFB",
          borderRadius: "12px",
          border:"1px solid #DEE2E6",
          "& .MuiAccordionSummary-expandIconWrapper": {
            transform: "none !important"
          },
          "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
            transform: "none !important"
          }
        }}
      >
        <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
          2. Vitals & Anthropometry
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 3 }}>
        {/* Vitals Row */}
          <Typography variant="inherit" sx={{ color: "#212529", fontWeight: 600 ,padding:1}}>Vitals</Typography>

       <Grid container spacing={2} sx={{ mt: -1 }}>
  {[
    { label: "Temp (°C)", key: "temp", color: "#E03131" },   // red
    { label: "HR (bpm)", key: "hr", color: "#2F9E44" },     // green
    { label: "RR (bpm)", key: "rr", color: "#F08C00" },     // orange
    { label: "SpO₂ (%)", key: "spo2", color: "#1C7ED6" },   // blue
  ].map((item) => (
    <Grid item xs={6} md={3} key={item.key}>
      <TextField
        label={item.label}
        fullWidth
        value={vitals[item.key]}
        onChange={(e) =>
          setVitals({ ...vitals, [item.key]: e.target.value })
        }
        InputLabelProps={{
          sx: {
            color: item.color,          // ✅ different label color
            fontWeight: 600,
            "&.Mui-focused": {
              color: item.color,        // keep same color on focus
            },
          },
        }}
        InputProps={{
          sx: {
            backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
            "& .MuiInputBase-input": {
              color: "#000",             // value always black
              fontWeight: 600,
            },
          },
        }}
      />
    </Grid>
  ))}



          {/* Other related text */}
          <Grid item xs={12}>
            <TextField
              placeholder="Other related text..."
              fullWidth
              value={vitals.relatedText}
              onChange={(e) =>
                setVitals({ ...vitals, relatedText: e.target.value })
              }
              sx={{
                backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                
                "& .MuiInputBase-input": { color: "#000" }
              }}
            />
          </Grid>
        </Grid>

        {/* Measurements */}
        <Box sx={{display:"flex",mt:1}}>
          <Typography variant="inherit" sx={{ color: "#212529", fontWeight: 600,padding:1 }}>
          Measurements
        </Typography>
               <Chip
    label="SGA"
    size="small"
    sx={{
      backgroundColor: "#FFF3E0",   // light orange
      color: "#FB8C00",             // orange text
      fontWeight: 600,
      fontSize: "11px",
      height: 22,
      mt:0.7,
      borderRadius: "12px",
    }}
  /></Box>
        <Grid container spacing={2} sx={{ mt: -2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              placeholder="Weight (g)"
              fullWidth
              value={vitals.weight}
              onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
              sx={{  backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                 "& .MuiInputBase-input": { color: "#000" } }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              placeholder="HC (cm)"
              fullWidth
              value={vitals.hc}
              onChange={(e) => setVitals({ ...vitals, hc: e.target.value })}
              sx={{  backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                 "& .MuiInputBase-input": { color: "#000" } }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              placeholder="Length (cm)"
              fullWidth
              value={vitals.length}
              onChange={(e) => setVitals({ ...vitals, length: e.target.value })}
              sx={{  backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                "& .MuiInputBase-input": { color: "#000" } }}
            />
          </Grid>
        </Grid>

        {/* BSL + BP */}
          <Typography variant="inherit" mt={1} sx={{ color: "#212529", fontWeight: 600 ,padding:1}}>
          BSL / Blood Glucose
        </Typography>

        <Grid container spacing={2} sx={{ mt: -1.7 }}>
          <Grid item xs={12} md={6}>
            <TextField
              placeholder="00 mg/dL"
              fullWidth
              value={vitals.bsl}
              onChange={(e) => setVitals({ ...vitals, bsl: e.target.value })}
              sx={{ backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                 "& .MuiInputBase-input": { color: "#000" } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              placeholder="00 mmHg"
              fullWidth
              value={vitals.bp}
              onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
              sx={{  backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                 "& .MuiInputBase-input": { color: "#000" } }}
            />
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
         

          <Button
            variant="contained"
            
            sx={{
              textTransform: "none",
              backgroundColor: "#228BE6",
              borderRadius: 2,
              px: 4
            }}
          >
            Next
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>

      <Accordion sx={{
        background: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "none",
        border: "1px solid #E6EEF6",
        mt: 0
      }}>
      
        <AccordionSummary
          expandIcon={isGeneralPhysicalComplete() ? (
            <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
          ) : (
             <AddIcon sx={{ color: "#228BE6", fontSize: 30 }} />
          )}
          sx={{
            backgroundColor: isGeneralPhysicalComplete()
              ? "#D9F7D9"
              : "#F9FAFB",
            borderRadius: "12px",
            "& .MuiAccordionSummary-expandIconWrapper": {
              transform: "none !important"
            },
            "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
              transform: "none !important"
            },
            "& *": {
              // color: "#0F2B45 !important"   // applies to all text inside
            },
            "& .MuiInputBase-input": {
              color: "#000 !important" // text inside textfields
            },
            "& .MuiFormControlLabel-label": {
              color: "#0F2B45 !important" // checkbox labels
            }
          }}
        >
          <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
            3. General Physical Examinations
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            {/* LEVEL OF CONSCIOUSNESS */}
            <Typography variant="inherit" sx={{
              fontWeight: 600, color: "#000", "& *": {
                color: "#0F2B45 !important" // applies to all text inside
              },
              "& .MuiInputBase-input": {
                color: "#000 !important" // text inside textfields
              },
              "& .MuiFormControlLabel-label": {
                color: "#0F2B45 !important" // checkbox labels
              }
            }}>
              Level of Consciousness
            </Typography>

            <ToggleButtonGroup
              fullWidth

              exclusive
              value={exam.consciousness}
              onChange={(e, v) => setExam({ ...exam, consciousness: v })}

            >
              {["Active & Alert", "Lethargic", "Irritable", "Comatose"].map(
                (opt) => (
                  <ToggleButton
                    key={opt}
                    value={opt}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#7A8899",

                      maxHeight: "73px",
                      border: "none",
                      "&.Mui-selected": {
                        backgroundColor: "#E7F1FD",
                        color: "#228BE6"
                      }
                    }}
                  >
                    {opt}
                  </ToggleButton>
                )
              )}
            </ToggleButtonGroup>
            <Grid item xs={12} md={6} sx={{ mt: { xs: 1.5, md: 2.5 }, mb: { xs: 1.5, md: 2.5 } }}
            >
              <Typography variant="inherit" sx={{ color: "#212529", fontWeight: 600 }}>Color</Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={birthType}
                onChange={(event, newValue) => setBirthType(newValue)}
              >
                {["Pink", "Pale"].map((opt) => (
                  <ToggleButton
                    key={opt}
                    value={opt}

                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#7A8899",
                      maxWidth: "100px",
                      maxHeight: "48px",
                      border: "none",
                      "&.Mui-selected": {
                        backgroundColor: "#e7f1fd",
                        color: "#228BE6"
                      }
                    }}
                  >
                    {opt}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>

            {/* COLOR */}
            <Typography sx={{ mt: 4, fontWeight: 600, color: "#124D81" }}>
              Color
            </Typography>
            <Grid container spacing={2}>
              {[
                "Pallor",
                "Plethoric",
                "Jaundice",
                "Central Cyanosis",
                "Peripheral Cyanosis"
              ].map((label) => (
                <Grid item xs={12} md={2} key={label}>
                  <Box
                    sx={{
                      border: "1px solid #DDE3ED",
                      borderRadius: 1,
                      px: 2,
                      maxWidth: "140px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, color: "#000" }}>
                      {label}
                    </Typography>

                    <Checkbox
                      sx={{
                        color: "#124D81",
                        "&.Mui-checked": {
                          color: "#124D81",
                        },
                      }} />
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* SKIN */}
            <Accordion sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}>
  <AccordionSummary
    expandIcon={
      
        <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
      
    }
    sx={{
      backgroundColor : "#FFFFFF",
      borderRadius: "12px",

      // Prevent rotation
      "& .MuiAccordionSummary-expandIconWrapper": {
        transform: "none !important",
      },
      "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
        transform: "none !important",
      },

      // Header text color
      "& .MuiAccordionSummary-content": {
        color: "#0F2B45 !important",
        fontWeight: 600,
      }
    }}
  >
    <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
      Skin
    </Typography>
  </AccordionSummary>

  <AccordionDetails
    sx={{
      "& *": {
        color: "#0F2B45 !important", // all text visible
      },
      "& .MuiInputBase-input": {
        color: "#000 !important", // textfield input visible
      },
      "& .MuiFormControlLabel-label": {
        color: "#0F2B45 !important", // checkbox labels visible
      }
    }}
  >
    <Grid container spacing={2} sx={{ mt: -4 }}>
     <Grid item xs={12} md={6}>
        <TextField
          placeholder="Type Other Findings"
          fullWidth
          value={exam.headNeckOther}
          onChange={(e) =>
            setExam({ ...exam, headNeckOther: e.target.value })
          }
          sx={{
             backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                
            
            "& .MuiInputBase-input": { color: "#000 !important" }
          }}
        />
      </Grid>

     <Grid item xs={12} md={6}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexDirection: { xs: "column", sm: "row" }, // 🔑 responsive
      }}
    >
      <TextField
        placeholder="Description"
        fullWidth
        value={exam.skinDesc}
        onChange={(e) =>
          setExam({ ...exam, skinDesc: e.target.value })
        }
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: 2,
          border: "1px solid #CED4DA",
          "& .MuiInputBase-input": { color: "#000" },
        }}
      />

      <IconButton
        sx={{
         
          
          color: "#228BE6",
          alignSelf: { xs: "flex-end", sm: "center" },
        }}
        onClick={() => {
          // add logic here
          console.log("Add clicked");
        }}
      >
        <AddCircleIcon sx={{height: 32,
          width: 32,}}/>
      </IconButton>
    </Box>
  </Grid>
     
      </Grid>
    <Grid container spacing={1} sx={{ mt: 1 }}>
      {[
        "Petechiae",
        "Bruising",
        "Peeling",
        "Lanugo",
        "Birth marks",
        "Meconium Stain"
      ].map((label) => (
         <Grid item xs={6} md={4} key={label} >
                  <Box
                    sx={{
                      border: "1px solid #DDE3ED",
                      borderRadius: 1,
                      px: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, color: "#000" }}>
                      {label}
                    </Typography>
                    <Checkbox
                      sx={{
                        color: "#124D81",
                        "&.Mui-checked": {
                          color: "#124D81",
                        },
                      }} />
                  </Box>
                </Grid>
      ))}

      {/* Other Findings */}
      
    </Grid>
  </AccordionDetails>
</Accordion>


            {/* HEAD & NECK */}
            <Accordion sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}>
  <AccordionSummary
    expandIcon={
    
        <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
      
    }
    sx={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",

      // Prevent rotation
      "& .MuiAccordionSummary-expandIconWrapper": {
        transform: "none !important",
      },
      "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
        transform: "none !important",
      },

      // Header text
      "& .MuiAccordionSummary-content": {
        color: "#0F2B45 !important",
        fontWeight: 600,
      }
    }}
  >
    <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
      Head & Neck
    </Typography>
  </AccordionSummary>

  <AccordionDetails
    sx={{
      "& *": {
        color: "#0F2B45 !important",
      },
      "& .MuiInputBase-input": {
        color: "#000 !important",
      },
      "& .MuiFormControlLabel-label": {
        color: "#0F2B45 !important",
      }
    }}
  >
    <Grid container spacing={2} sx={{ mt: -4 }}>
     <Grid item xs={12} md={6}>
        <TextField
          placeholder="Type Other Findings"
          fullWidth
          value={exam.headNeckOther}
          onChange={(e) =>
            setExam({ ...exam, headNeckOther: e.target.value })
          }
          sx={{
             backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                
            "& .MuiInputBase-input": { color: "#000 !important" }
          }}
        />
      </Grid>
<Grid item xs={12} md={6}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexDirection: { xs: "column", sm: "row" }, // 🔑 responsive
      }}
    >
      <TextField
        placeholder="Description"
        fullWidth
        value={exam.headNeckDesc}
        onChange={(e) =>
          setExam({ ...exam, headNeckDesc: e.target.value })
        }
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: 2,
          border: "1px solid #CED4DA",
          "& .MuiInputBase-input": { color: "#000" },
        }}
      />

      <IconButton
        sx={{
         
          
          color: "#228BE6",
          alignSelf: { xs: "flex-end", sm: "center" },
        }}
        onClick={() => {
          // add logic here
          console.log("Add clicked");
        }}
      >
        <AddCircleIcon sx={{height: 32,
          width: 32,}}/>
      </IconButton>
    </Box>
  </Grid>
      </Grid>
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {[
        "Override Suture",
        "Excessive moulding",
        "Microcephaly",
        "Depressed fontanelle",
        "Bulging fontanelle",
        "Hydrocephalus",
        "Caput",
        "Webbed Neck",
        "Subgaleal Hemorrhage"
      ].map((label) => (
      <Grid item xs={6} md={4} key={label} mt={-1}>
                  <Box
                    sx={{
                      border: "1px solid #DDE3ED",
                      borderRadius: 1,
                      px: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, color: "#000" }}>
                      {label}
                    </Typography>
                    <Checkbox
                      sx={{
                        color: "#124D81",
                        "&.Mui-checked": {
                          color: "#124D81",
                        },
                      }} />
                  </Box>
                </Grid>
      ))}

    
    </Grid>
  </AccordionDetails>
</Accordion>


            {/* EAR / NOSE / THROAT / EYES */}

            <Accordion sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}>
  <AccordionSummary
    expandIcon={
    
        <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
    
    }
    sx={{
      backgroundColor:  "#FFFFFF",
      borderRadius: "12px",

      // prevent rotation
      "& .MuiAccordionSummary-expandIconWrapper": {
        transform: "none !important"
      },
      "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
        transform: "none !important"
      },

      "& .MuiAccordionSummary-content": {
        color: "#0F2B45 !important",
        fontWeight: 600
      }
    }}
  >
    <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
      ENT (Ear, Nose, Throat)
    </Typography>
  </AccordionSummary>

  <AccordionDetails
    sx={{
      "& *": { color: "#0F2B45 !important" },
      "& .MuiInputBase-input": { color: "#000 !important" },
      "& .MuiFormControlLabel-label": { color: "#0F2B45 !important" }
    }}
  >
    <Grid container spacing={2} sx={{ mt: -4 }}>
     <Grid item xs={12} md={6}>
        <TextField
          placeholder="Type Other Findings"
          fullWidth
          value={exam.headNeckOther}
          onChange={(e) =>
            setExam({ ...exam, headNeckOther: e.target.value })
          }
          sx={{
             backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                
            "& .MuiInputBase-input": { color: "#000 !important" }
          }}
        />
      </Grid>
<Grid item xs={12} md={6}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexDirection: { xs: "column", sm: "row" }, // 🔑 responsive
      }}
    >
      <TextField
        placeholder="Description"
        fullWidth
        value={exam.earDesc}
        onChange={(e) =>
          setExam({ ...exam, earDesc: e.target.value })
        }
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: 2,
          border: "1px solid #CED4DA",
          "& .MuiInputBase-input": { color: "#000" },
        }}
      />

      <IconButton
        sx={{
         
          
          color: "#228BE6",
          alignSelf: { xs: "flex-end", sm: "center" },
        }}
        onClick={() => {
          // add logic here
          console.log("Add clicked");
        }}
      >
        <AddCircleIcon sx={{height: 32,
          width: 32,}}/>
      </IconButton>
    </Box>
  </Grid>
      </Grid>
    
        {/* SECTION TITLE */}
        <Box sx={{mt:1}}>
        <Typography sx={{ fontWeight: 600, color: "#124D81" }}>
          Ears
        </Typography>
</Box>
        {/* CHECKBOXES */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
      {[
        "Hearing impairment",
        "Low-set/Rotated ears",
        "Discharge",
            "Subconj hemorrhage",
            "Squint",
            
      ].map((label) => (
        <Grid item xs={6} md={4} key={label} sx={{ mt: -1 }}>
                  <Box
                    sx={{
                      border: "1px solid #DDE3ED",
                      borderRadius: 1,
                      px: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, color: "#000" }}>
                      {label}
                    </Typography>
                    <Checkbox
                      sx={{
                        color: "#124D81",
                        "&.Mui-checked": {
                          color: "#124D81",
                        },
                      }} />
                  </Box>
                </Grid>
      ))}

      {/* Other Findings */}
      
    </Grid>
    <Box sx={{mt:1}}>
    <Typography sx={{ fontWeight: 600, color: "#124D81" }}>
          Nose
        </Typography>
</Box>
        {/* CHECKBOXES */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
      {[
        "Choanal Atresia",
        "Nasal Deviation",
        "Depresssed nasal bridge",
        "Nasal flaring"

            
      ].map((label) => (
        <Grid item xs={6} md={4} key={label} sx={{ mt: -1}}>
                  <Box
                    sx={{
                      border: "1px solid #DDE3ED",
                      borderRadius: 1,
                      px: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, color: "#000" }}>
                      {label}
                    </Typography>
                    <Checkbox
                      sx={{
                        color: "#124D81",
                        "&.Mui-checked": {
                          color: "#124D81",
                        },
                      }} />
                  </Box>
                </Grid>
      ))}

      {/* Other Findings */}
      
    </Grid>
    <Box sx={{mt:1}}>
    <Typography sx={{ fontWeight: 600, color: "#124D81" }}>
          Throat
        </Typography>
</Box>
        {/* CHECKBOXES */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
      {[
        "Cleft lip",
        "Cleft palette",
        "Natal teeth",
            "Excessive secretions",
            "Micrognathia"
            
      ].map((label) => (
        <Grid item xs={6} md={4} key={label} sx={{ mt: -1 }}>
                  <Box
                    sx={{
                      border: "1px solid #DDE3ED",
                      borderRadius: 1,
                      px: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, color: "#000" }}>
                      {label}
                    </Typography>
                    <Checkbox
                      sx={{
                        color: "#124D81",
                        "&.Mui-checked": {
                          color: "#124D81",
                        },
                      }} />
                  </Box>
                </Grid>
      ))}

      {/* Other Findings */}
      
    </Grid>
  </AccordionDetails>
</Accordion>
<Accordion sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}>
  <AccordionSummary
    expandIcon={
      <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
    }
    sx={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",

      // Prevent rotation
      "& .MuiAccordionSummary-expandIconWrapper": {
        transform: "none !important",
      },
      "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
        transform: "none !important",
      },

      // Header text
      "& .MuiAccordionSummary-content": {
        color: "#0F2B45 !important",
        fontWeight: 600,
      }
    }}
  >
    <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
      Eyes
    </Typography>
  </AccordionSummary>

  <AccordionDetails
    sx={{
      "& *": { color: "#0F2B45 !important" },
      "& .MuiInputBase-input": { color: "#000 !important" },
      "& .MuiFormControlLabel-label": { color: "#0F2B45 !important" }
    }}
  >
    <Grid container spacing={2} sx={{ mt: -4 }}>
     <Grid item xs={12} md={6}>
        <TextField
          placeholder="Type Other Findings"
          fullWidth
          value={exam.eyesOther}
          onChange={(e) =>
            setExam({ ...exam, eyesOther: e.target.value })
          }
          sx={{
             backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                
            "& .MuiInputBase-input": { color: "#000 !important" }
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexDirection: { xs: "column", sm: "row" }, // 🔑 responsive
      }}
    >
      <TextField
        placeholder="Description"
        fullWidth
        value={exam.eyesDesc}
        onChange={(e) =>
          setExam({ ...exam, eyesDesc: e.target.value })
        }
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: 2,
          border: "1px solid #CED4DA",
          "& .MuiInputBase-input": { color: "#000" },
        }}
      />

      <IconButton
        sx={{
         
          
          color: "#228BE6",
          alignSelf: { xs: "flex-end", sm: "center" },
        }}
        onClick={() => {
          // add logic here
          console.log("Add clicked");
        }}
      >
        <AddCircleIcon sx={{height: 32,
          width: 32,}}/>
      </IconButton>
    </Box>
  </Grid>
      </Grid>
   <Grid container spacing={1} sx={{ mt: 1 }}>
  {[
    "Discharge",
    "Subconj hemorrhage",
    "Squint",
    "Red Reflex Absent",
    "Hypertelorism",
  ].map((label) => (
    <Grid item xs={6} md={4} key={label}>
      <Box
        sx={{
          border: "1px solid #DDE3ED",
          borderRadius: 1,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Typography sx={{ fontWeight: 500, color: "#000", fontSize: 14 }}>
          {label}
        </Typography>

        <Checkbox
          checked={exam.eyes.includes(label)}
          onChange={() => toggleValue("eyes", label)}
          sx={{
            color: "#124D81",
            "&.Mui-checked": {
              color: "#124D81",
            },
          }}
        />
      </Box>
    </Grid>
  ))}
</Grid>

  </AccordionDetails>

  
</Accordion>
<Accordion sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}>
  <AccordionSummary
    expandIcon={
      <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
    }
    sx={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",

      // Prevent rotation
      "& .MuiAccordionSummary-expandIconWrapper": {
        transform: "none !important",
      },
      "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
        transform: "none !important",
      },

      // Header text
      "& .MuiAccordionSummary-content": {
        color: "#0F2B45 !important",
        fontWeight: 600,
      }
    }}
  >
    <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
      Spine & Back
    </Typography>
  </AccordionSummary>

  <AccordionDetails
    sx={{
      "& *": { color: "#0F2B45 !important" },
      "& .MuiInputBase-input": { color: "#000 !important" },
      "& .MuiFormControlLabel-label": { color: "#0F2B45 !important" }
    }}
  >
    <Grid container spacing={2} sx={{ mt: -4 }}>
     <Grid item xs={12} md={6}>
        <TextField
          placeholder="Type Other Findings"
          fullWidth
          value={exam.headNeckOther}
          onChange={(e) =>
            setExam({ ...exam, headNeckOther: e.target.value })
          }
          sx={{
             backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                
            "& .MuiInputBase-input": { color: "#000 !important" }
          }}
        />
      </Grid>
<Grid item xs={12} md={6}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexDirection: { xs: "column", sm: "row" }, // 🔑 responsive
      }}
    >
      <TextField
        placeholder="Description"
        fullWidth
        value={exam.spineBackDesc}
        onChange={(e) =>
          setExam({ ...exam, spineBackDesc: e.target.value })
        }
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: 2,
          border: "1px solid #CED4DA",
          "& .MuiInputBase-input": { color: "#000" },
        }}
      />

      <IconButton
        sx={{
         
          
          color: "#228BE6",
          alignSelf: { xs: "flex-end", sm: "center" },
        }}
        onClick={() => {
          // add logic here
          console.log("Add clicked");
        }}
      >
        <AddCircleIcon sx={{height: 32,
          width: 32,}}/>
      </IconButton>
    </Box>
  </Grid>
      </Grid>
   <Grid container spacing={1} sx={{ mt: 1 }}>
  {[
    "Spina Bifida",
    "Sacral Dimple",
    "Hairy Patch",
    "Scoliosis",
    "Kyphosis",
    "Lordosis",
    "Tenderness",
    "Hematoma",
    "Deformity",
  ].map((label) => (
    <Grid item xs={6} md={4} key={label}>
      <Box
        sx={{
          border: "1px solid #DDE3ED",
          borderRadius: 1,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Typography sx={{ fontWeight: 500, color: "#000", fontSize: 14 }}>
          {label}
        </Typography>

        <Checkbox
          checked={exam.spineBack.includes(label)}
          onChange={() => toggleValue("spineBack", label)}
          sx={{
            color: "#124D81",
            "&.Mui-checked": {
              color: "#124D81",
            },
          }}
        />
      </Box>
    </Grid>
  ))}
</Grid>

  </AccordionDetails>

  
</Accordion>



            {/* ACTION BUTTONS */}
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2, "& .MuiInputBase-input": { color: "#000" }, }}
            >
              <Button
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#A7C0DA",
                  color: "#124D81"
                }}
              >
                Save & Exit
              </Button>

              <Button
                variant="contained"

                sx={{
                  textTransform: "none",
                  backgroundColor: "#228BE6",
                  borderRadius: 2,
                  px: 4
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>


      <Accordion 
    sx={{
    background: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "none",
    border: "1px solid #E6EEF6",
    mt: 0
  }}>
  <AccordionSummary
     expandIcon={
   
        <AddIcon sx={{ color: "#228BE6", fontSize: 30 }} />
      
     }
    sx={{
      backgroundColor: "#F9FAFB",
      border:"1px solid #DEE2E6",
      borderRadius: "12px",
      "& .MuiAccordionSummary-expandIconWrapper": {
        transform: "none !important"
      },
      "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
        transform: "none !important"
      },
      "& .MuiAccordionSummary-content": {
        color: "#0F2B45 !important",
        fontWeight: 600
      }
    }}
  >
    <Typography sx={{ fontWeight: 600 }}>
      4. Systematic Examination
    </Typography>
  </AccordionSummary>

  <AccordionDetails>
    <Box sx={{ mt:-3,"& *": { color: "#0F2B45" }}}>
      {[
        {
          title: "Respiratory",
          key: "respiratory",
          options: [
            "Grunting",
            "Nasal Flaring",
            "Apnea",
            "Stridor",
            "Tachypnoea (>60/min)",
            "Subcostal Retraction",
            "Intercostal Retraction",
            "Suprasternal Retraction",
            "Diminished Air Entry",
            "Crackles/Crepitations",
            "Wheeze"
          ]
        },
        {
          title: "Cardiovascular",
          key: "cardio",
          options: [
            "Heart Murmur",
            "Abnormal S1 S2",
            "Tachycardia >160bpm",
            "Bradycardia <100bpm",
            "CRT >3 Secs",
            "Bounding Pulses",
            "Irregular Rhythm",
            "Weak Pulses",
            "Hypotension",
            "Active Precordium"
          ]
        },
        {
          title: "Gastrointestinal & Abdomen",
          key: "gi",
          options: [
            "Abdominal Distension",
            "Abdominal Tenderness",
            "Scaphoid Abdomen",
            "Discolored Abdominal Wall",
            "Visible Bowel Loops",
            "Hepatomegaly >2cm",
            "Splenomegaly",
            "Abdominal Mass",
            "Umbilical Hernia",
            "Omphalitis/Infected Cord",
            "Umbilical Granuloma",
            "Imperforate Anus",
            "Bloody Stool",
            "Bilious Vomiting",
            "Hyperactive Bowel Sounds"
          ]
        },
        {
          title: "Central Nervous System",
          key: "cns",
          options: [
            "Lethargic",
            "Irritability/High-pitched Cry",
            "Hypotonia",
            "Hypertonia",
            "Jitteriness",
            "Seizures (Focal)",
            "Seizures (Generalized)",
            "Absent/Weak Reflex",
            "Posturing",
            "Weak Cry",
            "Bulging Fontanelle",
            "Sunken Fontanelle",
            "Pupils Fixed/Dilated"
          ]
        },
        {
          title: "Genitourinary",
          key: "gu",
          options: [
            "Undescended Testis Right",
            "Undescended Testis Left",
            "Bilateral Undescended Testes",
            "Hypospadias",
            "Epispadias",
            "Hydrocele",
            "Inguinal Hernia",
            "Micropenis",
            "Clitoromegaly",
            "Fused Labia",
            "Palpably Full Bladder",
            "Ambiguous Genitalia",
            "Vaginal Discharge (Bloody)"
          ]
        },
        {
          title: "Musculoskeletal",
          key: "msk",
          options: [
            "Skeletal Deformity/Fracture",
            "Decreased Arm Movement",
            "Single Palmar Crease",
            "Hip Instability",
            "Scoliosis",
            "Spinal Defect/Dimple",
            "Asymmetric Movement",
            "Syndactyly",
            "Clinodactyly",
            "Polydactyly",
            "Spinal Hair Tuft",
            "Spina Bifida"
          ]
        }
      ].map((section) => (
        <Accordion
          key={section.key}
          sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#228BE6" }} />}
            sx={{
              "& .MuiAccordionSummary-expandIconWrapper": {
                transform: "none !important"
              },
              "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                transform: "none !important"
              },
              "& .MuiAccordionSummary-content": {
                fontWeight: 600,
                color: "#124D81"
              }
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>
              {section.title}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Grid container spacing={2} sx={{ mt: -4 }}>
              {/* Other + Description */}
              <Grid item xs={12} md={6} >
                <TextField
                  placeholder="Type Other Findings..."
                  fullWidth
                  value={exam[section.key + "Other"]}
                  onChange={(e) =>
                    setExam({
                      ...exam,
                      [section.key + "Other"]: e.target.value
                    })
                  }
                  sx={{
             backgroundColor: "#ffffffff",
            border:"1px solid #CED4DA",
            borderRadius: 2,
                
            
            "& .MuiInputBase-input": { color: "#000 !important" }
          }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                        sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexDirection: { xs: "column", sm: "row" }, // 🔑 responsive
                    }}
                  >
                <TextField
                  placeholder="Description"
                  fullWidth
                  value={exam[section.key + "Desc"]}
                  onChange={(e) =>
                    setExam({
                      ...exam,
                      [section.key + "Desc"]: e.target.value
                    })
                  }
                  sx={{
          backgroundColor: "#ffffff",
          borderRadius: 2,
          border: "1px solid #CED4DA",
          "& .MuiInputBase-input": { color: "#000" },
        }}
                />  
          <IconButton
        sx={{
         
          
          color: "#228BE6",
          alignSelf: { xs: "flex-end", sm: "center" },
        }}
        onClick={() => {
          // add logic here
          console.log("Add clicked");
        }}
      >
        <AddCircleIcon sx={{height: 32,
          width: 32,}}/>
      </IconButton>
    </Box>
              </Grid>

              {/* Checkboxes */}
              {section.options.map((label) => (
    <Grid item xs={6} md={4} key={label} sx={{mt:-1}}>
      <Box
        sx={{
          border: "1px solid #DDE3ED",
          borderRadius: 1,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: exam[section.key].includes(label)
            ? "rgba(18,77,129,0.08)" // optional selected bg
            : "#FFFFFF",
        }}
      >
        <Typography sx={{ fontWeight: 500, color: "#000", fontSize: 14 }}>
          {label}
        </Typography>

        <Checkbox
          checked={exam[section.key].includes(label)}
          onChange={() => toggleValue(section.key, label)}
          sx={{
            color: "#124D81",
            "&.Mui-checked": {
              color: "#124D81",
            },
          }}
        />
      </Box>
    </Grid>
  ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
     <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
          

          <Button
            variant="contained"
            
            sx={{
              textTransform: "none",
              backgroundColor: "#228BE6",
              borderRadius: 2,
              px: 4
            }}
          >
            Next
          </Button>
        </Box>
  </AccordionDetails>
</Accordion>


<Accordion
  sx={{
    background: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "none",
    border: "1px solid #E6EEF6",
    mt: 0
  }}
>
  <AccordionSummary
    expandIcon={<AddIcon sx={{ color: "#228BE6", fontSize: 28 }} />}
    sx={{
       borderRadius: "12px",
      border:"1px solid #DEE2E6",
      backgroundColor:"#F9FAFB",
      "& .MuiAccordionSummary-expandIconWrapper": {
        transform: "none !important"
      },
      "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
        transform: "none !important"
      },
      "& .MuiAccordionSummary-content": {
        fontWeight: 600,
        color: "#0F2B45"
      }
    }}
  >
    <Typography sx={{ fontWeight: 600 }}>
      5. Plan of Care / Treatment Plan
    </Typography>
  </AccordionSummary>

  <AccordionDetails sx={{ "& *": { color: "#0F2B45" } }}>
    {/* PLAN FOR DAY */}
    <Typography variant="inherit" sx={{ fontWeight: 600, mb: 2 }}>
      Plan for the day
    </Typography>
<Box
  sx={{
    background: "#ffffff",
    border: "1px solid #DEE2E6",
    borderRadius: 2,
    mt: 1,
    p: 1,
  }}
>
  <TextField
    fullWidth
    placeholder="Enter here"
    value={planOfCare.planForDay}
    onChange={(e) =>
      setPlanOfCare({ ...planOfCare, planForDay: e.target.value })
    }
    sx={{
      background: "#ffffff",
      mb: 1,
      "& .MuiOutlinedInput-root": {
        "& fieldset": { border: "none" },
        "&:hover fieldset": { border: "none" },
        "&.Mui-focused fieldset": { border: "none" },
      },
    }}
  />

  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", ml: 1 }}>
    {["Admission", "Ventilator", "Surgery", "Phototherapy", "Warmer"].map(
      (chip) => (
        <Box
          key={chip}
          onClick={() => addPlanText(chip)}
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: "16px",
            backgroundColor: "rgba(34,139,230,0.12)",
            color: "#228BE6",
            fontWeight: 500,
            fontSize: 13,
            cursor: "pointer",
            
            userSelect: "none",
            "&:hover": {
              backgroundColor: "rgba(34,139,230,0.2)",
            },
          }}
        >
          {chip}
        </Box>
      )
    )}
  </Box>
</Box>



    <Accordion
 
  sx={{
    background: "#FFFFFF",
    borderRadius: "12px",
    
    border: "1px solid #E6EEF6",
    mt: 2,
  }}
>
  <AccordionSummary
    expandIcon={
        <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
    }
    sx={{
      backgroundColor: "#ffffffff",
      borderRadius: "12px",

      "& .MuiAccordionSummary-expandIconWrapper": {
        transform: "none !important",
      },
      "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
        transform: "none !important",
      },
      "& .MuiAccordionSummary-content": {
        color: "#0F2B45 !important",
        fontWeight: 600,
      },
    }}
  >
    <Typography sx={{ fontWeight: 600 }}>
      Treatment
    </Typography>
  </AccordionSummary>

  <AccordionDetails>
    <Box sx={{ mt: 1 }}>
      {/* TEXT FIELD */}
      <TextField
        fullWidth
        placeholder="Add treatment details"
        value={planOfCare.TreatmentofDay}
        onChange={(e) =>
          setPlanOfCare({
            ...planOfCare,
            TreatmentofDay: e.target.value,
          })
        }
        sx={{
          background: "#F9FBFF",
          borderRadius: 2,
          mb: 2,
          "& .MuiInputBase-input": {
            color: "#000",
          },
        }}
      />

      {/* CHIPS */}
      <Box
  sx={{
    display: "flex",
    gap: 1,
    flexWrap: "wrap",
  }}
>
  {["Warmer Care", "Ventilator", "Phototherapy", "Warmer"].map((chip) => (
    <Box
      key={chip}
      onClick={() => addTreatent(chip)}
      sx={{
        px: 1.5,
        py: 1.5,
        borderRadius: "16px",
        backgroundColor: "rgba(34,139,230,0.12)",
        color: "#228BE6",
        fontWeight: 500,
        fontSize: 13,
        cursor: "pointer",
        
        userSelect: "none",
        "&:hover": {
          backgroundColor: "rgba(34,139,230,0.2)",
        },
      }}
    >
      {chip}
    </Box>
  ))}
</Box>

    </Box>
  </AccordionDetails>
</Accordion>


 <Box sx={{mt:2}}>
     <Typography variant="inherit" sx={{ fontWeight: 600, mb: 2 }}>
      Medication Orders
    </Typography>
</Box>
    {planOfCare.medications.map((med, idx) => (
      <Grid container spacing={2} key={idx} sx={{ mb: 1 }}>
        <Grid item xs={3}>{med.name}</Grid>
        <Grid item xs={2}>{med.dose}</Grid>
        <Grid item xs={2}>{med.frequency}</Grid>
        <Grid item xs={3}>{med.lastDose}</Grid>
      </Grid>
    ))}

    {/* ADD MEDICATION */}
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={3}>
        <TextField
          placeholder="Search or Enter Name"
          fullWidth
          value={planOfCare.newMedication.name}
          onChange={(e) =>
            updateNewMedication("name", e.target.value)
          }
        />
      </Grid>

      <Grid item xs={2}>
        <TextField
          placeholder="Dose"
          fullWidth
          value={planOfCare.newMedication.dose}
          onChange={(e) =>
            updateNewMedication("dose", e.target.value)
          }
        />
      </Grid>

      <Grid item xs={2}>
        <TextField
          placeholder="Frequency"
          fullWidth
          value={planOfCare.newMedication.frequency}
          onChange={(e) =>
            updateNewMedication("frequency", e.target.value)
          }
        />
      </Grid>

      <Grid item xs={3}>
        <TextField
          type="datetime-local"
          fullWidth
          value={planOfCare.newMedication.lastDose}
          onChange={(e) =>
            updateNewMedication("lastDose", e.target.value)
          }
        />
      </Grid>

      <Grid item xs={2}>
        <IconButton onClick={addMedication}>
          <AddCircleOutlineIcon sx={{ color: "#228BE6" }} />
        </IconButton>
      </Grid>
    </Grid>
    <Box sx={{mt:2}}>
 <Typography variant="inherit" sx={{ fontWeight: 600, mb: 2 }}>
      Investigations(if any)
    </Typography>
    </Box>
      <Box sx={{mt:2}}>
    <TextField
      fullWidth
      placeholder="Choose"
      value={planOfCare.investigations}
      onChange={(e) =>
        setPlanOfCare({ ...planOfCare, investigations: e.target.value })
      }
      sx={{
         background: "#ffffff",
    border: "1px solid #DEE2E6",
    borderRadius: 2,
        mb: 1
      }}
    />
</Box>
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
  {[
    "CBC",
    "Serum Bilirubin",
    "Electrolytes",
    "Blood Gas",
    "CRP",
    "Blood Culture",
  ].map((chip) => (
    <Box
      key={chip}
      onClick={() => addInvestigation(chip)}
      sx={{
        px: 1.5,
        py: 1.5,
        borderRadius: "16px",
        backgroundColor: "rgba(34,139,230,0.12)",
        color: "#228BE6",
        fontWeight: 500,
        fontSize: 13,
        cursor: "pointer",
        
        userSelect: "none",
        transition: "background-color 0.15s ease",
        "&:hover": {
          backgroundColor: "rgba(34,139,230,0.2)",
        },
      }}
    >
      {chip}
    </Box>
  ))}
</Box>

     <Typography variant="inherit" sx={{ fontWeight: 600, mb: 2 }}>
      Provisional Details
    </Typography>
    <TextField
      fullWidth
      placeholder="Enter diagnosis details here (free-text)"
      value={planOfCare.provdetails}
      onChange={(e) =>
        setPlanOfCare({ ...planOfCare, provdetails: e.target.value })
      }
      sx={{
         background: "#ffffff",
    border: "1px solid #DEE2E6",
    borderRadius: 2,
        mb: 1
      }}
    />

 <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
  {[
    "RSL",
    "MSL",
    "Preterm",
    "LBW",
    "Sepsis",
    "Risk of Species",
    "Feeding Intolerance",
    "Seizures",
    "Jaundice",
    "Hypoglycemia",
  ].map((chip) => (
    <Box
      key={chip}
      onClick={() => addProvisional(chip)}
      sx={{
        px: 1.5,
        py:1.5,
        borderRadius: "16px",
        backgroundColor: "rgba(34,139,230,0.12)",
        color: "#228BE6",
        fontWeight: 500,
        fontSize: 13,
        cursor: "pointer",
        
        userSelect: "none",
        transition: "background-color 0.15s ease",
        "&:hover": {
          backgroundColor: "rgba(34,139,230,0.2)",
        },
      }}
    >
      {chip}
    </Box>
  ))}
</Box>


     <Accordion sx={{ background: "#FFFFFF", borderRadius: "12px", mt: 3 }}>
  <AccordionSummary
    expandIcon={
      
        <ExpandMoreIcon sx={{ color: "#228BE6", fontSize: 28 }} />
      
    }
    sx={{
      backgroundColor : "#FFFFFF",
      borderRadius: "12px",

      // Prevent rotation
      "& .MuiAccordionSummary-expandIconWrapper": {
        transform: "none !important",
      },
      "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
        transform: "none !important",
      },

      // Header text color
      "& .MuiAccordionSummary-content": {
        color: "#0F2B45 !important",
        fontWeight: 600,
      }
    }}
  >
    <Typography variant="inherit" sx={{ fontWeight: 600, color: "#0F2B45" }}>
      Digital Signature
    </Typography>
  </AccordionSummary>

  <AccordionDetails
   
  >
     <Grid container spacing={2}>
          {/* LEFT SIGNATURE */}
          <Grid item xs={12} md={6}>
            <SignatureCard
              role="Clinical Associate / RMO"
              name="-"
              dateTime={currentDateTime}
            />
          </Grid>

          {/* RIGHT SIGNATURE */}
          <Grid item xs={12} md={6}>
            <SignatureCard
              role="Admitting Consultant"
              name="-"
              dateTime={currentDateTime}
            />
          </Grid>
        </Grid>
  </AccordionDetails>
</Accordion>
    

    {/* MEDICATION ORDERS */}
   

    {/* ACTION BUTTONS */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
        mt: 3
      }}
    >
      

      <Button
        variant="contained"
        onClick={() => { saveInitialAssessment(props.patientId, props.encounterId); } }
        sx={{
          textTransform: "none",
          backgroundColor: "#228BE6",
          px: 4
        }}
      >
        Save
      </Button>
    </Box>
  </AccordionDetails>
</Accordion>


      {/* <Accordion sx={{
 background: "#FFFFFF",
 borderRadius: "12px",
 boxShadow: "none",
 border: "1px solid #E6EEF6",
 mt: 0
}}>
     <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#228BE6" }} />}>
       <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>6. Others</Typography>
     </AccordionSummary>
     <AccordionDetails>
       <Typography>Other Notes / Data</Typography>
     </AccordionDetails>
   </Accordion> */}
    </Box>
   <Box>
  {report && (
    <Box
      sx={{
        backgroundColor: "#fff",
        maxWidth: 900,
        margin: "auto",
        p: 4,
        border: "1px solid #ccc",
        fontFamily: "Times New Roman",
      }}
    >
      {/* ================= HEADER ================= */}
      <Box textAlign="center" mb={2}>
        <Typography fontWeight={700} fontSize={18}>
          Neonatal Clinical Report
        </Typography>
        <Divider sx={{ my: 1 }} />
      </Box>

      <Box mb={3}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography fontSize={13}>
              <b>Patient Name:</b> {report.patientName}
            </Typography>
            <Typography fontSize={13}>
              <b>MRN:</b> {report.mrn}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography fontSize={13}>
              <b>Date:</b> {new Date().toLocaleDateString()}
            </Typography>
            <Typography fontSize={13}>
              <b>Department:</b> Neonatology
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* ================= SECTION RENDERER ================= */}
      {[
        { title: "Birth History", data: report.birthHistory },
        { title: "Vitals", data: report.vitals },
        { title: "Anthropometry", data: report.anthropometry },
        {
          title: "General Physical Examination",
          data: report.generalExam,
        },
        {
          title: "Systematic Examination",
          data: report.systematicExam,
        },
      ].map((section, idx) => (
        <Box key={idx} mb={3}>
          <Typography
            fontWeight={700}
            fontSize={14}
            sx={{ borderBottom: "1px solid #000", mb: 1 }}
          >
            {section.title}
          </Typography>

          <Box sx={{ border: "1px solid #000" }}>
            {Object.entries(section.data || {}).map(([key, value], i) => (
              <Grid
                container
                key={i}
                sx={{ borderBottom: "1px solid #000" }}
              >
                <Grid
                  item
                  xs={5}
                  sx={{ p: 1, borderRight: "1px solid #000" }}
                >
                  <Typography fontSize={13}>{key}</Typography>
                </Grid>
                <Grid item xs={7} sx={{ p: 1 }}>
                  <Typography fontSize={13}>{value || "-"}</Typography>
                </Grid>
              </Grid>
            ))}
          </Box>
        </Box>
      ))}

      {/* ================= PLAN OF CARE ================= */}
      <Box mt={3}>
        <Typography
          fontWeight={700}
          fontSize={14}
          sx={{ borderBottom: "1px solid #000", mb: 1 }}
        >
          Plan of Care
        </Typography>

        <Box sx={{ border: "1px solid #000", p: 2 }}>
          {report.planOfCare?.activities?.length > 0 ? (
            report.planOfCare.activities.map((item, i) => (
              <Typography key={i} fontSize={13}>
                • {item}
              </Typography>
            ))
          ) : (
            <Typography fontSize={13}>-</Typography>
          )}

          {report.planOfCare?.notes && (
            <Typography fontSize={13} mt={1}>
              <b>Notes:</b> {report.planOfCare.notes}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ================= SIGNATURE ================= */}
      <Box mt={4}>
        <Divider sx={{ mb: 1 }} />
        <Typography fontSize={13}>
          <b>Consultant:</b> Dr. ____________________
        </Typography>
        <Typography fontSize={13}>
          <b>Signature:</b> ____________________
        </Typography>
      </Box>

      {/* ================= DOWNLOAD ================= */}
      <Box textAlign="center" mt={3}>
        <Button variant="contained" onClick={generateInitialAssessmentPdf}>
          Download PDF
        </Button>
      </Box>
    </Box>
  )}
</Box>

  <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      
      </>
  );
};

export default InitialAssessment;