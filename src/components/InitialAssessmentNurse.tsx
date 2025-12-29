import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Chip,
  IconButton,
 Accordion,
  AccordionSummary,
  AccordionDetails,

  Divider} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FC, useEffect, useState } from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Label } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

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


export const NurseAssessment: FC<PatientDetails> = (props): JSX.Element => {
  const visibleTextSX = {
    "& .MuiTypography-root": {
      color: "#0F2B45"
    },
    "& .MuiFormControlLabel-label": {
      color: "#0F2B45",
      fontSize: "14px"
    },
    "& .MuiCheckbox-root": {
      color: "#228BE6"
    },
    "& .MuiInputBase-input": {
      color: "#000"
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#D0D7E2"
    },
    "& .MuiInputLabel-root": {
      color: "#124D81"
    }
  };
  function readComponent(obs: any, label: string): string {
    if (!obs?.component) return "";
  
    const c = obs.component.find(
      (x: any) => x.code?.text === label
    );
  
    if (!c) return "";
  
    return (
      c.valueString ??
      c.valueDateTime ??
      (c.valueQuantity
        ? `${c.valueQuantity.value} ${c.valueQuantity.unit ?? ""}`
        : "") ??
      ""
    );
  }
  
  function buildNurseReport(raw: any) {
    return {
      // 🧍 Patient Details
      patientDetails: {
         name: readComponent(raw.patientDetails, "Name"),
         gender: readComponent(raw.patientDetails, "Gender"),
        uhid: readComponent(raw.patientDetails, "UHID"),
        age: readComponent(raw.patientDetails, "Age"),
        gestationalAge: readComponent(raw.patientDetails, "Gestational Age"),
        language: readComponent(raw.patientDetails, "Primary Language Spoken"),
        companionName: readComponent(raw.patientDetails, "Companion Name"),
        relation: readComponent(raw.patientDetails, "Relationship of Companion"),
        admissionDate: readComponent(raw.patientDetails, "Date of Admission"),
        admissionTime: readComponent(raw.patientDetails, "Admitted Time"),
      },
      
  
      // ❤️ Vitals
      vitals: {
        temp: readComponent(raw.vitals, "Body Temperature"),
        hr: readComponent(raw.vitals, "Heart Rate"),
        rr: readComponent(raw.vitals, "Respiratory Rate"),
        spo2: readComponent(raw.vitals, "SpO₂"),
        bp: readComponent(raw.vitals, "Blood Pressure"),
      },
  
      // 📏 Anthropometry
      anthropometry: {
        weight: readComponent(raw.anthropometry, "Weight"),
        length: readComponent(raw.anthropometry, "Length"),
        hc: readComponent(raw.anthropometry, "Head Circumference"),
        bsl: readComponent(raw.anthropometry, "Blood Glucose"),
      },
  
      // 💊 Medications
      medications:
        raw.medications?.map((m: any) => ({
          name:
            m.medicationCodeableConcept?.text ||
            m.medicationReference?.display ||
            "Unknown",
          dosage: m.dosage?.[0]?.text || "—",
          status: m.status || "",
        })) || [],
  
      // 🤧 Allergies
      allergies:
        raw.allergies?.map((a: any) => ({
          name: a.code?.text || "Unknown",
          category: a.category?.join(", ") || "",
          reaction: a.reaction?.[0]?.description || "",
          severity: a.reaction?.[0]?.severity || "",
        })) || [],
  
      // 🩺 Nursing Needs (CarePlan)
      nursingNeeds:
        raw.carePlan?.activity?.map(
          (a: any) => a.detail?.description
        ) || [],
  
      otherNeeds:
        raw.carePlan?.note?.map((n: any) => n.text).join(", ") || "",
    };
  }
  
    
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
    const [expandedPanel, setExpandedPanel] = useState<string | false>("patient");
    const [completedPanels, setCompletedPanels] = useState<Record<string, boolean>>({
      patient: false,
      vitals: false,
      diagnosis: false,
      treatment: false,
    });
    const openPanel = (panel: string) => {
      setExpandedPanel(panel);
    };
    
    const markCompleteAndNext = (current: string, next: string) => {
      setCompletedPanels((prev) => ({
        ...prev,
        [current]: true,
      }));
      setExpandedPanel(next);
    };
    

  const [assessment, setAssessment] = useState({
      patientDetails: {},
      vitals: {},
      anthropometry: {},
      medications: [],
      allergies: [],
      nursingNeeds: [],
      otherNeeds: "",
    });
    
    const [loading, setLoading] = useState(true);
    
  const [patient, setPatient] = useState({
    name: "",
    gender: "",
    doa: "",
    admittedTime: "",
    age: "",
    uhid: "",
    admissionNo: "",
    companionName: "",
    relationship: "",
    language: ""
  });

  const updatePatient = (key: string, value: any) => {
    setPatient(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  
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
    
    const [relation,setRelation]=useState("");
    const [medications, setMedications] = useState([
    {
      name: "",
      dose: "",
      frequency: "",
      lastDose: "",
      locked:false, 
    }
  ]);
  
  const updateMedication = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };
  const handleNext = (current: string, next: string) => {
    // optional validation here
  
    setCompletedPanels((prev) => ({
      ...prev,
      [current]: true,
    }));
  
    setExpandedPanel(next);
  };
  type VitalKey =
  | "temp"
  | "hr"
  | "rr"
  | "spo2"
  | "relatedText"
  | "weight"
  | "hc"
  | "length"
  | "bsl"
  | "bp";

  const VITAL_RANGES: Record<"temp" | "hr" | "rr" | "spo2", { min: number; max: number }> = {
    temp: { min: 30, max: 45 },
    hr: { min: 60, max: 200 },
    rr: { min: 20, max: 100 },
    spo2: { min: 0, max: 100 },
  };
  
  const handleVitalChange = (key: VitalKey, value: string) => {
    // allow empty
    if (value === "") {
      setVitals((prev) => ({ ...prev, [key]: "" }));
      return;
    }
  
    // numbers + decimal only
    if (!/^\d*\.?\d*$/.test(value)) return;
  
    setVitals((prev) => ({ ...prev, [key]: value }));
  };

  const isOutOfRange = (key: "temp" | "hr" | "rr" | "spo2") => {
    const val = Number(vitals[key]);
    if (!vitals[key]) return false;
    return val < VITAL_RANGES[key].min || val > VITAL_RANGES[key].max;
  };
  const generateNursingPdf = (assessment: any) => {
    if (!assessment) {
      alert("Assessment data is not available.");
      return;
    }
  
    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = 210;
    const margin = 10;
    let y = 12;
  
    // Helper function
    const val = (value: any) => {
      if (value === null || value === undefined || value === "") return "";
      return String(value);
    };
  
    const patient = assessment.patientDetails || {};
    const vitals = assessment.vitals || {};
    const anthropometry = assessment.anthropometry || {};
    const medications = assessment.medications || [];
    const allergies = assessment.allergies || [];
    const nursingNeeds = assessment.nursingNeeds || [];
  
    /* ================= PAGE 1 ================= */
    
    /* ================= HEADER ================= */
    pdf.setFont("Times", "bold");
    pdf.setFontSize(14);
    pdf.text("INITIAL ASSESSMENT NURSING", pageW / 2, y, { align: "center" });
    y += 8;
  
    // Hospital header
    pdf.setFont("Times", "normal");
    pdf.setFontSize(11);
    pdf.text("borneo", pageW / 2, y, { align: "center" });
    y += 4;
    
    pdf.setFontSize(9);
    pdf.text("MOTHER & CHILD CARE HOSPITAL", pageW / 2, y, { align: "center" });
    y += 6;
  
    // Doc number
    pdf.setFont("Times", "bold");
    pdf.text("DOC NO", pageW - margin - 20, y - 10);
    pdf.setFontSize(14);
    pdf.text("7", pageW - margin - 20, y - 4);
  
    /* ================= PATIENT DETAILS ================= */
    pdf.setFont("Times", "normal");
    pdf.setFontSize(11);
    
    // Patient details table
    const createBox = (x: number, y: number, width: number, height: number, text: string, bold: boolean = false) => {
      pdf.rect(x, y, width, height);
      if (bold) pdf.setFont("Times", "bold");
      pdf.text(text, x + 2, y + height/2 + 2);
      if (bold) pdf.setFont("Times", "normal");
    };
  
    // Row 1: Name and Sex
    createBox(margin, y, 30, 8, "Name:", true);
    createBox(margin + 30, y, 60, 8, val(patient.name));
    createBox(margin + 90, y, 25, 8, "Sex:", true);
    createBox(margin + 115, y, 35, 8, val(patient.gender));
    y += 8;
  
    // Row 2: Date of Admission and Age
    createBox(margin, y, 45, 8, "Date of Admitted:", true);
    createBox(margin + 45, y, 45, 8, val(patient.admissionDate));
    createBox(margin + 90, y, 25, 8, "Age:", true);
    createBox(margin + 115, y, 35, 8, val(patient.age));
    y += 8;
  
    // Row 3: Contact and UHID
    createBox(margin, y, 70, 8, "Contact Person's Name & Phone No.:", true);
    const contactInfo = patient.companionName ? `${patient.companionName} - ${patient.companionPhone || ''}` : "";
    createBox(margin + 70, y, 50, 8, contactInfo);
    createBox(margin + 120, y, 30, 8, "UHID / IP No.:", true);
    createBox(margin + 150, y, 40, 8, val(patient.uhid));
    y += 8;
  
    // Row 4: Chief Complaints and Time
    createBox(margin, y, 40, 8, "Chief Complaints:", true);
    createBox(margin + 40, y, 70, 8, nursingNeeds.length > 0 ? nursingNeeds[0] : "");
    createBox(margin + 110, y, 40, 8, "Time Admitted:", true);
    createBox(margin + 150, y, 40, 8, val(patient.admissionTime));
    y += 12;
  
    /* ================= ADMISSION INFO ================= */
    pdf.setFont("Times", "bold");
    pdf.text("Accompanied by companion:", margin, y);
    pdf.setFont("Times", "normal");
    
    // YES/NO checkboxes for companion
    pdf.rect(margin + 60, y - 4, 8, 8);
    if (patient.companionName) pdf.text("✓", margin + 62, y + 2);
    pdf.text("YES", margin + 70, y + 2);
    
    pdf.rect(margin + 85, y - 4, 8, 8);
    if (!patient.companionName) pdf.text("✓", margin + 87, y + 2);
    pdf.text("NO", margin + 95, y + 2);
    y += 8;
  
    // Companion details
    if (patient.companionName) {
      pdf.text("If Yes, Name of companion:", margin, y);
      pdf.text(val(patient.companionName), margin + 60, y);
      y += 6;
      
      pdf.text("Relationship with patient:", margin, y);
      pdf.text(val(patient.relation), margin + 60, y);
      y += 6;
      
      pdf.text("Phone No.:", margin, y);
      pdf.text(val(patient.companionPhone), margin + 60, y);
      y += 6;
    }
  
    // Language and interpreter
    pdf.text("Primary language spoken:", margin, y);
    pdf.text(val(patient.language), margin + 60, y);
    
    pdf.text("Interpreter needed:", margin + 120, y);
    pdf.rect(margin + 170, y - 4, 8, 8);
    if (patient.requiresInterpreter) pdf.text("✓", margin + 172, y + 2);
    pdf.text("YES", margin + 180, y + 2);
    
    pdf.rect(margin + 195, y - 4, 8, 8);
    if (!patient.requiresInterpreter) pdf.text("✓", margin + 197, y + 2);
    pdf.text("NO", margin + 205, y + 2);
    y += 8;
  
    // Status of admission
    pdf.text("Status of admission:", margin, y);
    const admissionStatus = patient.admissionStatus || "Walking";
    const statusOptions = ["Walking", "Wheelchair", "Stretcher"];
    
    statusOptions.forEach((option, index) => {
      const x = margin + 50 + (index * 40);
      pdf.rect(x, y - 4, 8, 8);
      if (admissionStatus === option) {
        pdf.text("✓", x + 2, y + 2);
      }
      pdf.text(option, x + 12, y + 2);
    });
    y += 12;
  
    /* ================= VITALS ================= */
    pdf.setFont("Times", "bold");
    pdf.text("Temp.:", margin, y);
    pdf.setFont("Times", "normal");
    pdf.text(val(vitals.temp), margin + 15, y);
    
    pdf.setFont("Times", "bold");
    pdf.text("Pulse:", margin + 40, y);
    pdf.setFont("Times", "normal");
    pdf.text(val(vitals.hr), margin + 55, y);
    
    pdf.setFont("Times", "bold");
    pdf.text("BP:", margin + 80, y);
    pdf.setFont("Times", "normal");
    pdf.text(val(vitals.bp), margin + 95, y);
    
    pdf.setFont("Times", "bold");
    pdf.text("Respiration:", margin + 120, y);
    pdf.setFont("Times", "normal");
    pdf.text(val(vitals.rr), margin + 145, y);
    
    pdf.setFont("Times", "bold");
    pdf.text("SpO2:", margin + 160, y);
    pdf.setFont("Times", "normal");
    pdf.text(val(vitals.spo2), margin + 180, y);
    y += 6;
  
    pdf.setFont("Times", "bold");
    pdf.text("Height:", margin, y);
    pdf.setFont("Times", "normal");
    pdf.text(val(anthropometry.height), margin + 20, y);
    
    pdf.setFont("Times", "bold");
    pdf.text("Weight:", margin + 60, y);
    pdf.setFont("Times", "normal");
    pdf.text(val(anthropometry.weight), margin + 80, y);
    
    y += 10;
  
    // Horizontal line
    pdf.line(margin, y, pageW - margin, y);
    y += 8;
  
    /* ================= VALUABLES / BELONGINGS ================= */
    pdf.setFont("Times", "bold");
    pdf.setFontSize(12);
    pdf.text("Valuables / Belongings (Please Tick)", pageW / 2, y, { align: "center" });
    y += 6;
  
    const valuables = [
      { label: "Dentures", checked: patient.dentures || false },
      { label: "Hearing Aid", checked: patient.hearingAid || false },
      { label: "Eye Glasses/ Contact Lens", checked: patient.eyeGlasses || false },
      { label: "Jewellery", checked: patient.jewellery || false },
      { label: "Prosthesis", checked: patient.prosthesis || false },
    ];
  
    // Header for With Patient / Sent Home
    pdf.setFontSize(9);
    pdf.text("With Patient", pageW - margin - 80, y - 6);
    pdf.text("Sent Home", pageW - margin - 30, y - 6);
  
    valuables.forEach((item, index) => {
      const rowY = y + (index * 8);
      
      // Item label
      pdf.rect(margin, rowY, 80, 8);
      pdf.text(item.label, margin + 2, rowY + 5);
      
      // YES/NO checkboxes
      pdf.rect(margin + 80, rowY, 30, 8);
      pdf.text("YES", margin + 85, rowY + 5);
      pdf.rect(margin + 85, rowY + 1, 8, 6);
      if (item.checked) pdf.text("✓", margin + 87, rowY + 5);
      
      pdf.text("NO", margin + 100, rowY + 5);
      pdf.rect(margin + 100, rowY + 1, 8, 6);
      if (!item.checked) pdf.text("✓", margin + 102, rowY + 5);
      
      // With Patient checkbox
      pdf.rect(pageW - margin - 80, rowY, 20, 8);
      
      // Sent Home checkbox
      pdf.rect(pageW - margin - 30, rowY, 20, 8);
    });
  
    y += valuables.length * 8 + 8;
  
    /* ================= ORIENTATION TO PATIENT ENVIRONMENT ================= */
    pdf.setFont("Times", "bold");
    pdf.setFontSize(12);
    pdf.text("Orientation to Patient Environment", pageW / 2, y, { align: "center" });
    y += 6;
  
    const orientationItems = [
      "Room", "Nurse Call", "Telephone", "Service Directory", "Admission Kit",
      "Visitors Policy", "Bed Controls", "Smoking Policy", "Bathroom", "Television",
      "Functional", "Emergency Exit", "Veg. only food"
    ];
  
    pdf.setFontSize(9);
    orientationItems.forEach((item, index) => {
      const col = index % 5;
      const row = Math.floor(index / 5);
      const x = margin + (col * 38);
      const itemY = y + (row * 6);
      
      pdf.rect(x, itemY - 2, 36, 6);
      pdf.text(item, x + 2, itemY + 2);
    });
  
    y += Math.ceil(orientationItems.length / 5) * 6 + 10;
  
    /* ================= ALLERGIES / ADVERSE REACTION ================= */
    pdf.setFont("Times", "bold");
    pdf.setFontSize(12);
    pdf.text("Allergies / Adverse Reaction", pageW / 2, y, { align: "center" });
    y += 6;
  
    // Create allergy table
    const allergyStartX = margin;
    const colWidths = [40, 25, 15, 15, 45];
    
    // Header row
    const allergyHeaders = ["Medication / Drug", "Not Known", "NO", "YES", "If Yes, Name of drug:"];
    let currentX = allergyStartX;
    
    pdf.setFontSize(9);
    pdf.setFont("Times", "bold");
    allergyHeaders.forEach((header, i) => {
      pdf.rect(currentX, y, colWidths[i], 8);
      pdf.text(header, currentX + 2, y + 5);
      currentX += colWidths[i];
    });
    y += 8;
  
    // Helper function for allergy rows
    const createAllergyRow = (label: string, hasAllergy: boolean, specificAllergies: string) => {
      currentX = allergyStartX;
      
      pdf.setFont("Times", "normal");
      pdf.rect(currentX, y, colWidths[0], 8);
      pdf.text(label, currentX + 2, y + 5);
      currentX += colWidths[0];
      
      pdf.rect(currentX, y, colWidths[1], 8);
      if (allergies.length === 0) pdf.text("✓", currentX + 10, y + 5);
      currentX += colWidths[1];
      
      pdf.rect(currentX, y, colWidths[2], 8);
      if (!hasAllergy) pdf.text("✓", currentX + 6, y + 5);
      currentX += colWidths[2];
      
      pdf.rect(currentX, y, colWidths[3], 8);
      if (hasAllergy) pdf.text("✓", currentX + 6, y + 5);
      currentX += colWidths[3];
      
      pdf.rect(currentX, y, colWidths[4], 8);
      if (hasAllergy && specificAllergies) {
        pdf.text(specificAllergies, currentX + 2, y + 5);
      }
      
      y += 8;
    };
  
    // Medication/Drug row
    const hasDrugAllergy = allergies.some((a: any) => a.type === "drug" || a.type === "medication");
    const drugAllergies = allergies.filter((a: any) => a.type === "drug" || a.type === "medication")
      .map((a: any) => a.name).join(", ");
    createAllergyRow("Medication/Drug", hasDrugAllergy, drugAllergies);
  
    // Blood Transfusion row
    createAllergyRow("Blood Transfusion", false, "");
  
    // Food row
    const hasFoodAllergy = allergies.some((a: any) => a.type === "food");
    const foodAllergies = allergies.filter((a: any) => a.type === "food")
      .map((a: any) => a.name).join(", ");
    createAllergyRow("Food", hasFoodAllergy, foodAllergies);
  
    y += 8;
  
    /* ================= PAGE 2 ================= */
    pdf.addPage();
    y = 12;
  
    /* ================= CURRENT MEDICATION ================= */
    pdf.setFont("Times", "bold");
    pdf.setFontSize(12);
    pdf.text("Current Medication", pageW / 2, y, { align: "center" });
    y += 8;
  
    // Medication table
    const medStartX = margin;
    const medColWidths = [70, 30, 40, 50];
    
    // Header
    const medHeaders = ["Medication", "Dose", "Frequency", "Date/Time of last dose"];
    currentX = medStartX;
    
    pdf.setFontSize(9);
    pdf.setFont("Times", "bold");
    medHeaders.forEach((header, i) => {
      pdf.rect(currentX, y, medColWidths[i], 8);
      pdf.text(header, currentX + 2, y + 5);
      currentX += medColWidths[i];
    });
    y += 8;
  
    // Medication rows
    pdf.setFont("Times", "normal");
    const displayMeds = medications.slice(0, 4);
    
    displayMeds.forEach((med: any) => {
      currentX = medStartX;
      
      pdf.rect(currentX, y, medColWidths[0], 8);
      pdf.text(val(med.name), currentX + 2, y + 5);
      currentX += medColWidths[0];
      
      pdf.rect(currentX, y, medColWidths[1], 8);
      pdf.text(val(med.dosage), currentX + 2, y + 5);
      currentX += medColWidths[1];
      
      pdf.rect(currentX, y, medColWidths[2], 8);
      pdf.text(val(med.frequency), currentX + 2, y + 5);
      currentX += medColWidths[2];
      
      pdf.rect(currentX, y, medColWidths[3], 8);
      pdf.text(val(med.lastDose), currentX + 2, y + 5);
      
      y += 8;
    });
  
    // Empty rows if needed
    for (let i = displayMeds.length; i < 4; i++) {
      currentX = medStartX;
      medColWidths.forEach(width => {
        pdf.rect(currentX, y, width, 8);
        currentX += width;
      });
      y += 8;
    }
  
    y += 12;
  
    /* ================= NURSING NEEDS ================= */
    pdf.setFont("Times", "bold");
    pdf.setFontSize(12);
    pdf.text("Nursing Needs", pageW / 2, y, { align: "center" });
    y += 8;
  
    // Nursing needs table
    const needsStartX = margin;
    
    nursingNeeds.forEach((need: string, index: number) => {
      pdf.setFont("Times", "normal");
      pdf.setFontSize(9);
      
      // Need text
      pdf.rect(needsStartX, y, 120, 8);
      pdf.text(need, needsStartX + 2, y + 5);
      
      // YES column
      pdf.rect(needsStartX + 120, y, 20, 8);
      pdf.setFont("Times", "bold");
      pdf.text("YES", needsStartX + 125, y + 5);
      
      // NO column
      pdf.rect(needsStartX + 140, y, 20, 8);
      pdf.text("NO", needsStartX + 145, y + 5);
      
      y += 8;
    });
  
    // Other needs
    if (assessment?.otherNeeds) {
      pdf.setFont("Times", "normal");
      pdf.rect(needsStartX, y, 160, 8);
      pdf.text(`Other: ${assessment.otherNeeds}`, needsStartX + 2, y + 5);
      y += 8;
    }
  
    y += 12;
  
    /* ================= FORM COMPLETED BY ================= */
    pdf.setFont("Times", "bold");
    pdf.setFontSize(12);
    pdf.text("Form Completed By", pageW / 2, y, { align: "center" });
    y += 8;
  
    // Signature section
    const sigStartX = margin;
    const sigColWidths = [30, 70, 30, 40];
    
    // Name row
    pdf.rect(sigStartX, y, sigColWidths[0], 8);
    pdf.setFont("Times", "bold");
    pdf.text("Name:", sigStartX + 2, y + 5);
    
    pdf.rect(sigStartX + sigColWidths[0], y, sigColWidths[1], 8);
    y += 8;
  
    // Signature row
    pdf.rect(sigStartX, y, sigColWidths[0], 8);
    pdf.text("Signature:", sigStartX + 2, y + 5);
    
    pdf.rect(sigStartX + sigColWidths[0], y, sigColWidths[1], 8);
    y += 8;
  
    // Designation row
    pdf.rect(sigStartX, y, sigColWidths[0], 8);
    pdf.text("Designation:", sigStartX + 2, y + 5);
    
    pdf.rect(sigStartX + sigColWidths[0], y, sigColWidths[1], 8);
    y += 8;
  
    // Date and Time row
    pdf.rect(sigStartX, y, sigColWidths[0], 8);
    pdf.text("Date:", sigStartX + 2, y + 5);
    
    pdf.rect(sigStartX + sigColWidths[0], y, sigColWidths[2], 8);
    
    pdf.rect(sigStartX + sigColWidths[0] + sigColWidths[2], y, sigColWidths[0], 8);
    pdf.text("Time:", sigStartX + sigColWidths[0] + sigColWidths[2] + 2, y + 5);
    
    pdf.rect(sigStartX + sigColWidths[0] + sigColWidths[2] + sigColWidths[0], y, sigColWidths[3], 8);
  
    /* ================= SAVE PDF ================= */
    pdf.save(`Nursing_Initial_Assessment_${patient.name || 'Patient'}.pdf`);
  };
  
  // Helper function
  const val = (value: any) => {
    if (value === null || value === undefined || value === "") return "";
    return String(value);
  };
const MEASUREMENT_RANGES = {
  weight: { min: 300, max: 6000 },   // grams (preterm → term)
  hc: { min: 20, max: 45 },          // cm
  length: { min: 25, max: 60 },      // cm
} as const;
type MeasurementKey = "weight" | "hc" | "length";

const handleMeasurementChange = (key: MeasurementKey, value: string) => {
  // allow empty
  if (value === "") {
    setVitals((prev) => ({ ...prev, [key]: "" }));
    return;
  }

  // numbers + optional decimal
  if (!/^\d*\.?\d*$/.test(value)) return;

  setVitals((prev) => ({ ...prev, [key]: value }));
};
const isMeasurementOutOfRange = (key: MeasurementKey) => {
  const val = Number(vitals[key]);
  if (!vitals[key]) return false;

  const { min, max } = MEASUREMENT_RANGES[key];
  return val < min || val > max;
};
const BSL_BP_RANGES = {
  bsl: { min: 20, max: 300 },   // mg/dL
  bp: { min: 30, max: 120 },    // mmHg
} as const;
type MetabolicKey = "bsl" | "bp";

const handleMetabolicChange = (key: MetabolicKey, value: string) => {
  // allow empty
  if (value === "") {
    setVitals((prev) => ({ ...prev, [key]: "" }));
    return;
  }

  // only numbers
  if (!/^\d*$/.test(value)) return;

  setVitals((prev) => ({ ...prev, [key]: value }));
};
const isMetabolicOutOfRange = (key: MetabolicKey) => {
  if (!vitals[key]) return false;
  const val = Number(vitals[key]);
  return (
    val < BSL_BP_RANGES[key].min ||
    val > BSL_BP_RANGES[key].max
  );
};

    const saveNurseInitialAssessment = async (
    patientId: string,
    encounterId: string
  ) => {
    const BASE = import.meta.env.VITE_FHIRAPI_URL;
  
    const AUTH = {
      "Content-Type": "application/fhir+json",
      Authorization: "Basic " + btoa("fhiruser:change-password"),
    };
  console.log('checking patientId',patientId);
  console.log('checking encounterId',encounterId);
  
    try {
      /* ===============================
         1️⃣ PATIENT DETAILS (NURSE)
      =============================== */
  
      const patientDetailsPayload = {
        resourceType: "Observation",
        status: "final",
      
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "survey",
                display: "Survey",
              },
            ],
          },
        ],
      
        code: {
          text: "Nurse Initial Assessment - Patient Details",
        },
      
        subject: {
          reference: `Patient/${patientId}`,
        },
      
        encounter: {
          reference: `Encounter/${encounterId}`,
        },
      
        component: [
          {
            code: { text: "Name" },
            valueString: patient.name,
          },
          {
            code: { text: "Gender" },
            valueString: patient.gender,
          },
          {
            code: { text: "Date of Admission" },
            valueDateTime: patient.doa, // ISO string only
          },
          {
            code: { text: "Admitted Time" },
            valueString: patient.admittedTime,
          },
          {
            code: { text: "Age" },
            valueString: patient.age,
          },
          {
            code: { text: "UHID" },
            valueString: patient.uhid,
          },
          {
            code: { text: "Admission Number" },
            valueString: patient.admissionNo,
          },
          {
            code: { text: "Companion Name" },
            valueString: patient.companionName,
          },
          {
            code: { text: "Relationship of Companion" },
            valueString: relation,
          },
          {
            code: { text: "Primary Language Spoken" },
            valueString: patient.language,
          },
        ].filter(c =>
          Object.keys(c).some(k => k.startsWith("value") && c[k] !== undefined)
        ),
      };
      
  
      await fetch(`${BASE}/Observation`, {
        method: "POST",
        headers: AUTH,
        body: JSON.stringify(patientDetailsPayload),
      });
      console.log("📌 patientDetailsPayload ", patientDetailsPayload);
      /* ===============================
         2️⃣ NURSE VITAL SIGNS
      =============================== */
  
      const nurseVitalsPayload = {
        resourceType: "Observation",
        status: "final",
  
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
          },
        ],
  
        code: {
          text: "Nurse Recorded Vitals",
        },
  
        subject: {
          reference: `Patient/${patientId}`,
        },
  
        encounter: {
          reference: `Encounter/${encounterId}`,
        },
  
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
            code: { text: "SpO₂" },
            valueQuantity: vitals.spo2
              ? { value: Number(vitals.spo2), unit: "%" }
              : undefined,
          },
          {
            code: { text: "Blood Pressure" },
            valueString: vitals.bp || undefined,
          },
          {
            code: { text: "Other Related Notes" },
            valueString: vitals.relatedText || undefined,
          },
        ].filter(
          (c) =>
            c.valueQuantity ||
            (c.valueString && c.valueString.trim() !== "")
        ),
      };
  
      await fetch(`${BASE}/Observation`, {
        method: "POST",
        headers: AUTH,
        body: JSON.stringify(nurseVitalsPayload),
      });
      console.log("📌 nurseVitalsPayload ", nurseVitalsPayload);
      /* ===============================
         3️⃣ NURSE ANTHROPOMETRY
      =============================== */
  
      const nurseAnthropometryPayload = {
        resourceType: "Observation",
        status: "final",
  
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
          },
        ],
  
        code: {
          text: "Nurse Anthropometry",
        },
  
        subject: {
          reference: `Patient/${patientId}`,
        },
  
        encounter: {
          reference: `Encounter/${encounterId}`,
        },
  
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
        body: JSON.stringify(nurseAnthropometryPayload),
      });
      console.log("📌 nurseAnthropometryPayload ", nurseAnthropometryPayload);
/* ===============================
   4️⃣ NURSE CURRENT MEDICATIONS (FHIR R5 FINAL)
================================ */

for (const med of medications) {
  if (!med.name || !med.name.trim()) continue;

  const payload: any = {
    resourceType: "MedicationStatement",

    status: "active",

    medicationCodeableConcept: {
      text: med.name,
    },

    subject: {
      reference: `Patient/${patientId}`,
    },

    statusReason: [
      {
        text: "Reported by nurse during initial assessment",
      },
    ],
  };

  // ✅ Proper ISO date
  if (med.lastDose) {
    const d = new Date(med.lastDose);
    if (!isNaN(d.getTime())) {
      payload.effectiveDateTime = d.toISOString();
    }
  }

  // ✅ Dosage (optional)
  const doseText = `${med.dose || ""} ${med.frequency || ""}`.trim();
  if (doseText) {
    payload.dosage = [{ text: doseText }];
  }

  const res = await fetch(`${BASE}/MedicationStatement`, {
    method: "POST",
    headers: AUTH,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error(
      "❌ MedicationStatement failed:",
      err.issue?.[0]?.details?.text || err
    );
    continue;
  }

  console.log("✅ MedicationStatement saved", payload);
}

  
   /* ===============================
   5️⃣ ALLERGIES / ADVERSE REACTIONS (FHIR SAFE)
================================ */


const allergyMappings = [
  {
    key: "medication",
    label: "Medication / Drug Allergy",
    category: "medication",
    snomed: "416098002", // Drug allergy
  },
  {
    key: "bloodTransfusion",
    label: "Blood Transfusion Reaction",
    category: "biologic",
    snomed: "414285001", // Transfusion reaction
  },
  {
    key: "food",
    label: "Food Allergy",
    category: "food",
    snomed: "414285001", // Food allergy
  },
];

for (const item of allergyMappings) {
  const value = allergies[item.key];

  // ❗ CREATE RESOURCE ONLY IF YES
  if (value !== "Yes") continue;

  const allergyPayload = {
    resourceType: "AllergyIntolerance",

    clinicalStatus: {
      coding: [
        {
          system:
            "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
          code: "active",
        },
      ],
    },

    verificationStatus: {
      coding: [
        {
          system:
            "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
          code: "confirmed",
        },
      ],
    },

    type: "allergy",

    category: [item.category],

    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: item.snomed,
          display: item.label,
        },
      ],
      text: item.label,
    },

    patient: {
      reference: `Patient/${patientId}`,
    },

    encounter: {
      reference: `Encounter/${encounterId}`,
    },

    recordedDate: new Date().toISOString(),

    note: [
      {
        text: "Recorded by nurse during initial assessment",
      },
    ],
  };

  await fetch(`${BASE}/AllergyIntolerance`, {
    method: "POST",
    headers: AUTH,
    body: JSON.stringify(allergyPayload),
  });

  console.log("✅ AllergyIntolerance created:", allergyPayload);
}

      /* ===============================
         6️⃣ NURSING NEEDS → CAREPLAN
      =============================== */
  
      const nursingItems = [
        { label: "Language problem", key: "languageProblem" },
        { label: "Cultural / religious barriers", key: "culturalBarrier" },
        { label: "Risk for falls", key: "fallRisk" },
        { label: "Incontinent", key: "incontinent" },
        { label: "Requires oxygen therapy", key: "oxygenTherapy" },
        { label: "Tracheotomy done", key: "tracheotomy" },
        { label: "Risk for pressure ulcers", key: "pressureUlcerRisk" },
        { label: "Special nutritional needs", key: "specialNutrition" },
        { label: "Implants present", key: "implants" },
      ];
    
    
    
                  
      const carePlanPayload = {
        resourceType: "CarePlan",
        status: "active",
        intent: "plan",
  
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/care-plan-category",
                code: "nursing",
                display: "Nursing Care Plan",
              },
            ],
          },
        ],
  
        subject: { reference: `Patient/${patientId}` },
        encounter: { reference: `Encounter/${encounterId}` },
        created: new Date().toISOString(),
  
        activity: nursingItems
          .filter((item) => nursingNeeds[item.key])
          .map((item) => ({
            detail: {
              description: item.label,
              status: "completed",
            },
          })),
  
        note: nursingNeeds.otherNeeds
          ? [{ text: nursingNeeds.otherNeeds }]
          : [],
      };
  
      await fetch(`${BASE}/CarePlan`, {
        method: "POST",
        headers: AUTH,
        body: JSON.stringify(carePlanPayload),
      });

      
      console.log("📌 CarePlan", carePlanPayload);
      console.log("✅ Nurse Initial Assessment saved successfully");
  
    } catch (error) {
      console.error("❌ Nurse Initial Assessment failed", error);
      throw error;
    }
  };
  
  const fetchNurseInitialAssessment = async (
    patientId: string,
    encounterId: string
  ) => {
    const BASE = import.meta.env.VITE_FHIRAPI_URL;
  
    const AUTH = {
      Authorization: "Basic " + btoa("fhiruser:change-password"),
      "Content-Type": "application/fhir+json",
    };
  
    try {
      console.log("🚀 Fetching Nurse Initial Assessment", {
        patientId,
        encounterId,
      });
  
      // 🔹 Parallel fetch (fast & clean)
      const [
        obsRes,
        medsRes,
        allergyRes,
        carePlanRes,
      ] = await Promise.all([
        fetch(
          `${BASE}/Observation?subject=Patient/${patientId}&encounter=Encounter/${encounterId}&_count=100`,
          { headers: AUTH }
        ),
        fetch(
          `${BASE}/MedicationStatement?subject=Patient/${patientId}&_count=100`,
          { headers: AUTH }
        ),
        fetch(
          `${BASE}/AllergyIntolerance?patient=Patient/${patientId}&_count=100`,
          { headers: AUTH }
        ),
        fetch(
          `${BASE}/CarePlan?subject=Patient/${patientId}&encounter=Encounter/${encounterId}&_count=10`,
          { headers: AUTH }
        ),
      ]);
  
      const [
        obsJson,
        medsJson,
        allergyJson,
        carePlanJson,
      ] = await Promise.all([
        obsRes.json(),
        medsRes.json(),
        allergyRes.json(),
        carePlanRes.json(),
      ]);
  
      // 🔹 Log raw bundles
      console.log("🧪 Observation Bundle:", obsJson);
      console.log("💊 Medication Bundle:", medsJson);
      console.log("🤧 Allergy Bundle:", allergyJson);
      console.log("📋 CarePlan Bundle:", carePlanJson);
  
      const observations = obsJson.entry?.map((e: any) => e.resource) || [];
      console.log("📊 All Observations:", observations);
  
      // 🔹 Split observations logically
      const patientDetails = observations.find(
        (o: any) =>
          o.code?.text === "Nurse Initial Assessment - Patient Details"
      );
  
      const vitals = observations.find(
        (o: any) => o.code?.text === "Nurse Recorded Vitals"
      );
  
      const anthropometry = observations.find(
        (o: any) => o.code?.text === "Nurse Anthropometry"
      );
  
      const medications =
        medsJson.entry?.map((e: any) => e.resource) || [];
  
      const allergies =
        allergyJson.entry?.map((e: any) => e.resource) || [];
  
      const carePlan =
        carePlanJson.entry?.[0]?.resource || null;
  
      // 🔹 Grouped final log (very useful)
      console.group("🩺 Nurse Initial Assessment Result");
      console.log("👤 Patient Details:", patientDetails);
      console.log("❤️ Vitals:", vitals);
      console.log("📏 Anthropometry:", anthropometry);
      console.log("💊 Medications:", medications);
      console.log("🤧 Allergies:", allergies);
      console.log("📋 Care Plan:", carePlan);
      console.groupEnd();
  
      return {
        patientDetails,
        vitals,
        anthropometry,
        medications,
        allergies,
        carePlan,
      };
    } catch (error) {
      console.error("❌ Fetch Nurse Initial Assessment failed", error);
      throw error;
    }
  };
  function getDatePart(dateTime: string) {
    if (!dateTime) return "";
    const d = new Date(dateTime);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  }
  
  function getTimePart(dateTime: string) {
    if (!dateTime) return "";
    const d = new Date(dateTime);
    return d.toTimeString().slice(0, 5); // HH:mm
  }
  
  useEffect(() => {
    async function load() {
      try {
        const raw = await fetchNurseInitialAssessment(
          props.patientId,
          props.encounterId
        );
  
        const report = buildNurseReport(raw);
        console.log('checnking report in nurse assessement',report);
        console.log('checnking Gestational age in nurse assessement',props.gestational_age);
        console.log('checnking admittedTime in nurse assessement',props.patient.admittedTime);
  
        
        setAssessment(report);
      } finally {
        setLoading(false);
      }
    }
  
    if (props.patientId && props.encounterId) {
      setLoading(true);
      load();
    }
  }, [props.patientId, props.encounterId]);
  
  
const addMedicationRow = () => {
  setMedications((prev) => {
    const updated = [...prev];

    // 🔒 lock the last row
    updated[updated.length - 1] = {
      ...updated[updated.length - 1],
      locked: true,
    };

    // ➕ add new empty editable row
    updated.push({
      name: "",
      dose: "",
      frequency: "",
      lastDose: "",
      locked: false,
    });

    return updated;
  });
};

  const [allergies, setAllergies] = useState({
    medication: "No",
    bloodTransfusion: "No",
    food: "No"
  });
  
  const updateAllergy = (field: string, value: string) => {
    setAllergies((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const textFieldStyle = {
    border: "1px solid #E6EEF6",
    backgroundColor: "#F9FBFF",
    borderRadius: 2,
    "& .MuiInputBase-input": {
      color: "#000",
      cursor: "text",
    },
  };
  

  const [nursingNeeds, setNursingNeeds] = useState({
    languageProblem: false,
    culturalBarrier: false,
    fallRisk: false,
    incontinent: false,
    oxygenTherapy: false,
    tracheotomy: false,
    pressureUlcerRisk: false,
    specialNutrition: false,
    implants: false,
    otherNeeds: ""
  });
  
  const toggleNursingNeed = (key: string) => {
    setNursingNeeds((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const updateOtherNeeds = (value: string) => {
    setNursingNeeds((prev) => ({
      ...prev,
      otherNeeds: value
    }));
  };
  if (loading || !assessment) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading nurse assessment...</Typography>
      </Box>
    );
  }
  const genderValue =
  props.gender?.toLowerCase() === "male"
    ? "Male"
    : props.gender?.toLowerCase() === "female"
    ? "Female"
    : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      
      {/* ----------------- Birth History ----------------- */}
      <Accordion
 expanded={expandedPanel === "patient"}
 onChange={() =>
   setExpandedPanel(expandedPanel === "patient" ? false : "patient")
 }
  sx={{
    background: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid #E6EEF6",
  }}
>

  <AccordionSummary
    expandIcon={
      completedPanels ? (
        <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
      ) : (
        <AddIcon sx={{ color: "#228BE6", fontSize: 30 }} />
      )
    }
    sx={{
      borderRadius: "12px",

      // prevent rotation
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
    <Typography sx={{ fontWeight: 600, color: "#0F2B45" }}>
      1.Patient Details
    </Typography>
  </AccordionSummary>

  <AccordionDetails
    sx={{
      "& *": { color: "#0F2B45" },
      "& .MuiInputBase-input": { color: "#000" },
      "& .MuiFormControlLabel-label": { color: "#0F2B45" }
    }}
  >
    <Grid container spacing={2}>
      {/* Name */}
      <Grid item xs={12} md={8}>
        <Typography sx={{ fontWeight: 600 }}>Name *</Typography>
        <TextField
  fullWidth
  placeholder="Mother's name"
  value={props.patient_name}
  onChange={(e) => updatePatient("name", e.target.value)}
  sx={{ background: "#F9FBFF" }}
/>

      </Grid>

      {/* Gender */}
      <Grid item xs={12} md={4}>
  <Typography sx={{ fontWeight: 600 }}>Gender *</Typography>

  <ToggleButtonGroup
    exclusive
    fullWidth
    value={genderValue}
    onChange={(e, v) => {
      if (v) {
        updatePatient("gender", v.toLowerCase()); // store as "male"/"female"
      }
    }}
  >
    {["Male", "Female"].map((g) => (
      <ToggleButton
        key={g}
        value={g}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          background: "#F9FAFB",
          color: "#868E96",
          "&.Mui-selected": {
            background: "#F9FAFB",
            color: "#228BE6",
          },
        }}
      >
        {g}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
</Grid>


      {/* DOA */}
      <Grid item xs={12} md={4}>
        <Typography sx={{ fontWeight: 600 }}>DOA *</Typography>
        <TextField
  type="date"
  fullWidth
  name="doa"
  value={getDatePart(props.patient.admissionDate)}
  onChange={(e) => updatePatient("doa", e.target.value)}
  inputProps={{
    max: new Date().toISOString().split("T")[0],
  }}
  InputLabelProps={{ shrink: true }}
  sx={{
    backgroundColor: "#F5F5F5",
    borderRadius: 1,
  }}
/>



      </Grid>

      {/* Admitted Time */}
      <Grid item xs={12} md={4}>
        <Typography sx={{ fontWeight: 600 }}>Admitted time *</Typography>
        <TextField
  type="time"
  fullWidth
  name="admittedTime"
  value={getTimePart(props.patient.admissionDate)}
  onChange={(e) => updatePatient("admittedTime", e.target.value)}
  InputLabelProps={{ shrink: true }}
  sx={{
    backgroundColor: "#F5F5F5",
    borderRadius: 1,
  }}
/>



      </Grid>

      {/* Age */}
      <Grid item xs={12} md={4}>
        <Typography sx={{ fontWeight: 600 }}> Gestation Age</Typography>
        <TextField
          fullWidth
          value={props.gestational_age}
          onChange={(e) => updatePatient("age", e.target.value)}
          sx={{ background: "#F9FBFF" }}
        />
      </Grid>

      {/* UHID */}
      <Grid item xs={12} md={6}>
        <Typography sx={{ fontWeight: 600 }}>UHID</Typography>
        <TextField
  fullWidth
  value={props.patientId1}
  // value={patient.uhid}
  onChange={(e) => updatePatient("uhid", e.target.value)}
  sx={{ background: "#F9FBFF" }}
/>

      </Grid>

      {/* Admission No */}
      <Grid item xs={12} md={6}>
        <Typography sx={{ fontWeight: 600 }}>Admission No</Typography>
        <TextField
  fullWidth
  value={props.patient.admissionNo}
  // value={patient.admissionNo}
  onChange={(e) => updatePatient("admissionNo", e.target.value)}
  sx={{ background: "#F9FBFF" }}
/>

      </Grid>

      {/* Companion */}
      <Grid item xs={12} md={6}>
        <Typography sx={{ fontWeight: 600 }}>Name of companion</Typography>
        <TextField
  fullWidth
  placeholder="Name of the Kin/companion"
  value={props.patient.kinName}
  onChange={(e) => updatePatient("companionName", e.target.value)}
  sx={{ background: "#F9FBFF" }}
/>

      </Grid>

      {/* Relationship */}
      <Grid item xs={12} md={6}>
        <Typography sx={{ fontWeight: 500 }}>Relationship</Typography>
        <TextField
          fullWidth
          select
          name="relationship"
          value={props.patient.kinRelation}
          onChange={(e) => setRelation(e.target.value)}
       
          InputProps={{
            sx: { backgroundColor: "#F5F5F5", borderRadius: 1 ,
              "& .MuiInputBase-input": {
      color: "#000",       // BLACK PLACEHOLDER
      opacity: 1,          // MAKE IT FULLY VISIBLE
    }
            }
          }}
        >
          <MenuItem value="Father">Father</MenuItem>
          <MenuItem value="Mother">Mother</MenuItem>
          <MenuItem value="Guardian">Guardian</MenuItem>
        </TextField>
        </Grid>
     

      {/* Language */}
      <Grid item xs={12}>
        <Typography sx={{ fontWeight: 600 }}>
          Primary Language Spoken *
        </Typography>
       <ToggleButtonGroup
  exclusive
  fullWidth
  value={patient.language}
  onChange={(e, v) => updatePatient("language", v)}
>
  {["Marathi", "Hindi", "English", "Urdu", "Other"].map((lang) => (
    <ToggleButton
      key={lang}
      value={lang}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        background: "#F9FAFB",
        color:"#868E96",
        "&.Mui-selected": {
          background: "#F9FAFB",
          color: "#228BE6"
        }
      }}
    >
      {lang}
    </ToggleButton>
  ))}
</ToggleButtonGroup>

      </Grid>

      {/* Buttons */}
      <Grid item xs={12}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          {/* <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "#A7C0DA",
              color: "#124D81"
            }}
          >
            Save & Exit
          </Button> */}
          <Button
            variant="contained"
             onClick={() => handleNext("patient", "vitals")}
            sx={{
              textTransform: "none",
              backgroundColor: "#228BE6",
              px: 4
            }}
          >
            Next
          </Button>
        </Box>
      </Grid>
    </Grid>
  </AccordionDetails>
</Accordion>
      {/* ----------------- Other Sections ----------------- */}
      <Accordion
 expanded={expandedPanel === "vitals"}
 onChange={() =>
   setExpandedPanel(expandedPanel === "vitals" ? false : "vitals")
 }
  sx={{
    background: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid #E6EEF6",
  }}
>

      <AccordionSummary
       expandIcon={
        completedPanels ? (
          <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
        ) : (
          <AddIcon sx={{ color: "#228BE6", fontSize: 30 }} />
        )
      }
        sx={{
         
          borderRadius: "12px",
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
        <Typography sx={{ fontWeight: 600, color: "#124D81" }}>Vitals</Typography>

        <Grid container spacing={2} >
          {[
            { label: "Temp (°C)", key: "temp", color: "#E03131" },   // red
    { label: "HR (bpm)", key: "hr", color: "#2F9E44" },     // green
    { label: "RR (bpm)", key: "rr", color: "#F08C00" },     // orange
    { label: "SpO₂ (%)", key: "spo2", color: "#1C7ED6" }, 
          ].map((item) => (
            <Grid item xs={6} md={3} key={item.key}>
  <TextField
    label={item.label}
    placeholder="00"
    fullWidth
    value={vitals[item.key as VitalKey]}
    onChange={(e) =>
      handleVitalChange(item.key as VitalKey, e.target.value)
    }
    error={isOutOfRange(item.key)}
    helperText={
      isOutOfRange(item.key)
        ? `Allowed: ${VITAL_RANGES[item.key].min}–${VITAL_RANGES[item.key].max}`
        : `${VITAL_RANGES[item.key].min}–${VITAL_RANGES[item.key].max}`
    }
    inputProps={{ inputMode: "decimal" }}
    InputLabelProps={{
      sx: {
        color: item.color,
        fontWeight: 600,
        "&.Mui-focused": { color: item.color },
      },
    }}
    InputProps={{
      sx: {
        backgroundColor: "#fff",
        border: "1px solid #CED4DA",
        borderRadius: 2,
        "& .MuiInputBase-input": {
          color: "#000",
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
        <Box sx={{mt:1}}>
        <Typography sx={{ mt: 4, fontWeight: 600, color: "#124D81" }}>
          Measurements
        </Typography>
</Box>
       <Grid container spacing={2} >
  {[
    { key: "weight", label: "Weight (g)" },
    { key: "hc", label: "HC (cm)" },
    { key: "length", label: "Length (cm)" },
  ].map((item) => (
    <Grid item xs={12} md={4} key={item.key}>
      <TextField
        placeholder={item.label}
        fullWidth
        value={vitals[item.key as MeasurementKey]}
        onChange={(e) =>
          handleMeasurementChange(
            item.key as MeasurementKey,
            e.target.value
          )
        }
        error={isMeasurementOutOfRange(item.key as MeasurementKey)}
        helperText={
          isMeasurementOutOfRange(item.key as MeasurementKey)
            ? `Allowed: ${MEASUREMENT_RANGES[item.key as MeasurementKey].min}–${MEASUREMENT_RANGES[item.key as MeasurementKey].max}`
            : `Range: ${MEASUREMENT_RANGES[item.key as MeasurementKey].min}–${MEASUREMENT_RANGES[item.key as MeasurementKey].max}`
        }
        inputProps={{ inputMode: "decimal" }}
        sx={{
          height:'70%',
          backgroundColor: "#fff",
          border: "1px solid #CED4DA",
          borderRadius: 2,
          "& .MuiInputBase-input": {
            color: "#000",
          
          },
        }}
      />
    </Grid>
  ))}
</Grid>


        {/* BSL + BP */}
        <Box sx={{mt:1}}>
        <Typography  sx={{ mt: 4, fontWeight: 600, color: "#124D81" }}>
          BSL / Blood Glucose
        </Typography>
                </Box>
                <Grid container spacing={2} >
  {[
    { key: "bsl", label: "00 mg/dL" },
    { key: "bp", label: "00 mmHg" },
  ].map((item) => (
    <Grid item xs={12} md={6} key={item.key}>
      <TextField
        placeholder={item.label}
        fullWidth
        value={vitals[item.key as MetabolicKey]}
        onChange={(e) =>
          handleMetabolicChange(
            item.key as MetabolicKey,
            e.target.value
          )
        }
        error={isMetabolicOutOfRange(item.key as MetabolicKey)}
        helperText={
          isMetabolicOutOfRange(item.key as MetabolicKey)
            ? `Allowed: ${BSL_BP_RANGES[item.key as MetabolicKey].min}–${BSL_BP_RANGES[item.key as MetabolicKey].max}`
            : `Range: ${BSL_BP_RANGES[item.key as MetabolicKey].min}–${BSL_BP_RANGES[item.key as MetabolicKey].max}`
        }
        inputProps={{ inputMode: "numeric" }}
        sx={{
          height:'70%',
          backgroundColor: "#fff",
          border: "1px solid #CED4DA",
          borderRadius: 2,
          "& .MuiInputBase-input": {
            color: "#000",
            fontWeight: 600,
          },
        }}
      />
    </Grid>
  ))}
</Grid>


        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
          {/* <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#A7C0DA",
              color: "#124D81"
            }}
          >
            Save & Exit
          </Button> */}

          <Button
            variant="contained"
            onClick={() => handleNext("vitals", "diagnosis")}
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
       expanded={expandedPanel === "diagnosis"}
       onChange={() =>
         setExpandedPanel(expandedPanel === "diagnosis" ? false : "diagnosis")
       }
  sx={{
    background: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "none",
    border: "1px solid #E6EEF6",
    mt: 0
  }}
>
  <AccordionSummary
   expandIcon={
    completedPanels ? (
      <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
    ) : (
      <AddIcon sx={{ color: "#228BE6", fontSize: 30 }} />
    )
  }
    sx={{
      
      "& .MuiAccordionSummary-content": {
        fontWeight: 600,
        color: "#0F2B45"
      }
    }}
  >
    <Typography sx={{ fontWeight: 600 }}>
      3. Current Medications
    </Typography>
  </AccordionSummary>

  <AccordionDetails
    sx={{
      "& *": { color: "#0F2B45" },
      "& .MuiInputBase-input": { color: "#000" }
    }}
  >
    {/* HEADER */}
    <Grid
  container
  spacing={2}
  sx={{ mb: 2, ml: "26px", alignItems: "center" }}
>
  {["Medication", "Dose", "Frequency", "Date / Time of last dose"].map(
    (h) => (
      <Grid item xs={2.8} key={h}>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
          {h}
        </Typography>
      </Grid>
    )
  )}

  {/* Action column */}
  
</Grid>


    {/* ROWS */}
    {medications.map((med, index) => (
  <Grid
    container
    spacing={2}
    alignItems="center"
    key={index}
    sx={{
      mb: 1,
      p: 1.5,
      borderRadius: "10px",
      border: "1px solid #E6EEF6",
      // backgroundColor: med.locked ? "#FFFFFF" : "#F9FBFF",
    }}
  >
    <Grid item xs={2.8}>
      <TextField
        fullWidth
        placeholder="Medication"
        value={med.name}
        InputProps={{ readOnly: med.locked }}
        sx={textFieldStyle}
        onChange={(e) =>
          !med.locked && updateMedication(index, "name", e.target.value)
        }
      />
    </Grid>

    <Grid item xs={2.8}>
      <TextField
        fullWidth
        value={med.dose}
        InputProps={{ readOnly: med.locked }}
        sx={textFieldStyle}
        onChange={(e) =>
          !med.locked && updateMedication(index, "dose", e.target.value)
        }
      />
    </Grid>

    <Grid item xs={2.8}>
      <TextField
        fullWidth
        value={med.frequency}
        InputProps={{ readOnly: med.locked }}
        sx={textFieldStyle}
        onChange={(e) =>
          !med.locked && updateMedication(index, "frequency", e.target.value)
        }
      />
    </Grid>

    <Grid item xs={2.8}>
      <TextField
        type="datetime-local"
        fullWidth
        value={med.lastDose}
        InputProps={{ readOnly: med.locked }}
        sx={textFieldStyle}
        onChange={(e) =>
          !med.locked && updateMedication(index, "lastDose", e.target.value)
        }
      />
    </Grid>

    {/* ADD / REMOVE BUTTON */}
    <Grid item xs={0.8} sx={{ display: "flex", justifyContent: "center" }}>
      {index === medications.length - 1 && (
        <IconButton
        
          onClick={addMedicationRow}
          sx={{
            background: "#228BE6",
            borderRadius: "8px",
            width: 32,
            height: 32,
            fontSize: 18,
          }}
        >
          +
        </IconButton>
      )}
    </Grid>
  </Grid>
))}


    {/* ADD BUTTON */}
   

    {/* ACTION BUTTONS */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
        mt: 3
      }}
    >
      {/* <Button
        variant="outlined"
        sx={{
          textTransform: "none",
          borderColor: "#A7C0DA",
          color: "#124D81"
        }}
      >
        Save & Exit
      </Button> */}

      <Button
        variant="contained"
        onClick={() => handleNext("diagnosis", "treatment")}
        sx={{
          textTransform: "none",
          backgroundColor: "#228BE6",
          px: 4
        }}
      >
        Next
      </Button>
    </Box>
  </AccordionDetails>
</Accordion>

<Accordion
   expanded={expandedPanel === "treatment"}
   onChange={() =>
     setExpandedPanel(expandedPanel === "treatment" ? false : "treatment")
   }
  sx={{
    background: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "none",
    border: "1px solid #E6EEF6",
    mt: 0
  }}
>
  <AccordionSummary
    expandIcon={
      completedPanels ? (
        <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
      ) : (
        <AddIcon sx={{ color: "#228BE6", fontSize: 30 }} />
      )
    }
    sx={{
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
      4. Allergies / Adverse Reaction
    </Typography>
  </AccordionSummary>

  <AccordionDetails
    sx={{
      "& *": { color: "#0F2B45" }
    }}
  >
    {[
      { label: "Medication / Drug", key: "medication" },
      { label: "Blood Transfusion", key: "bloodTransfusion" },
      { label: "Food", key: "food" }
    ].map((item) => (
      <Box key={item.key} sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 600, mb: 1 }}>
          {item.label}
        </Typography>

        <ToggleButtonGroup
          exclusive
          fullWidth
          value={allergies[item.key]}
          onChange={(e, v) => v && updateAllergy(item.key, v)}
          sx={{
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid #E6EEF6"
          }}
        >
          {["No", "Not Known", "Yes"].map((opt) => (
            <ToggleButton
              key={opt}
              value={opt}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#7A8899",
                border: "none",
                "&.Mui-selected": {
                  backgroundColor: "#E7F1FD",
                  color: "#228BE6"
                }
              }}
            >
              {opt}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    ))}

    {/* ACTION BUTTONS */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
        mt: 3
      }}
    >
      {/* <Button
        variant="outlined"
        sx={{
          textTransform: "none",
          borderColor: "#A7C0DA",
          color: "#124D81"
        }}
      >
        Save & Exit
      </Button> */}

      <Button
        variant="contained"
        onClick={() => handleNext("treatment", "discharge")}
        sx={{
          textTransform: "none",
          backgroundColor: "#228BE6",
          px: 4
        }}
      >
        Next
      </Button>
    </Box>
  </AccordionDetails>
</Accordion>

<Accordion
 expanded={expandedPanel === "discharge"}
 onChange={() =>
   setExpandedPanel(expandedPanel === "discharge" ? false : "discharge")
 }
  sx={{
    background: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "none",
    border: "1px solid #E6EEF6",
    mt: 0
  }}
>
  <AccordionSummary
    expandIcon={
      completedPanels ? (
        <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
      ) : (
        <AddIcon sx={{ color: "#228BE6", fontSize: 30 }} />
      )
    }
    sx={{
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
      5. Nursing Needs
    </Typography>
  </AccordionSummary>

  <AccordionDetails
    sx={{
      "& *": { color: "#0F2B45" }
    }}
  >
    {[
      { label: "Is there a Language Problem", key: "languageProblem" },
      { label: "Any Cultural / Religious barriers", key: "culturalBarrier" },
      { label: "Is the patient at risk for falls", key: "fallRisk" },
      { label: "Is the patient incontinent", key: "incontinent" },
      { label: "Does patient require oxygen therapy", key: "oxygenTherapy" },
      { label: "Has tracheotomy been done", key: "tracheotomy" },
      { label: "Is the patient at risk for pressure ulcers", key: "pressureUlcerRisk" },
      { label: "Any special nutritional needs", key: "specialNutrition" },
      { label: "Does the patient have implants", key: "implants" }
    ].map((item) => (
      <Box
        key={item.key}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid #E6EEF6",
          borderRadius: "8px",
          px: 2,
          py: 1.5,
          mb: 1.5
        }}
      >
        <Typography sx={{ fontWeight: 500 }}>
          {item.label}
        </Typography>

        <Checkbox
          checked={nursingNeeds[item.key]}
          onChange={() => toggleNursingNeed(item.key)}
          sx={{ color: "#228BE6" }}
        />
      </Box>
    ))}

    {/* OTHER NEEDS */}
    <TextField
      fullWidth
      placeholder="Any other needs, please write here"
      value={nursingNeeds.otherNeeds}
      onChange={(e) => updateOtherNeeds(e.target.value)}
      sx={{
        mt: 2,
        background: "#F9FBFF",
        borderRadius: "8px",
        "& .MuiInputBase-input": { color: "#000" }
      }}
    />

    {/* ACTION BUTTONS */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
        mt: 3
      }}
    >
      {/* <Button
        variant="outlined"
        sx={{
          textTransform: "none",
          borderColor: "#A7C0DA",
          color: "#124D81"
        }}
      >
        Save & Exit
      </Button> */}

      <Button
        variant="contained"
        onClick={() => { saveNurseInitialAssessment(props.patientId, props.encounterId); } }
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
<Box>
  {assessment && (
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
      <Box textAlign="center" mb={1}>
  <Typography fontWeight={700} fontSize={16}>
    INITIAL ASSESSMENT NURSING
  </Typography>
  <Divider sx={{ borderColor: "#000" }} />
</Box>

<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
<Button
  variant="outlined"
  onClick={() => {
    if (assessment?.patientDetails) {
      generateNursingPdf(assessment);
    } else {
      alert("Patient details not loaded yet.");
    }
  }}
>
  Download / Print
</Button>

</Box>

      {/* ================= PATIENT DETAILS ================= */}
      <Box sx={{ border: "1px solid #000" }}>
  {[
    ["Name", assessment.patientDetails.name],
    ["Sex", assessment.patientDetails.gender],
    ["Age", assessment.patientDetails.age],
    ["UHID / IP No.", assessment.uhid],
    ["Date of Admitted", assessment.patientDetails.admissionDate],
    ["Time Admitted", assessment.patientDetails.admissionTime],
    ["Primary Language Spoken", assessment.patientDetails.language],
    ["Accompanied by Companion", assessment.patientDetails.companionName ? "YES" : "NO"],
    ["Name of Companion", assessment.patientDetails.companionName],
    ["Relationship with Patient", assessment.patientDetails.relation],
  ].map(([label, value], i) => (
    <Grid container key={i} sx={{ borderBottom: "1px solid #000" }}>
      <Grid item xs={4} sx={{ p: 0.5, borderRight: "1px solid #000" }}>
        <Typography fontSize={12}>{label}</Typography>
      </Grid>
      <Grid item xs={8} sx={{ p: 0.5 }}>
        <Typography fontSize={12}>{value || "—"}</Typography>
      </Grid>
    </Grid>
  ))}
</Box>



      {/* ================= VITALS ================= */}
      <Box sx={{ border: "1px solid #000", mt: 1 }}>
  <Grid container>
    {[
      ["Temp", assessment.vitals.temp],
      ["Pulse", assessment.vitals.hr],
      ["BP", assessment.vitals.bp],
      ["Respiration", assessment.vitals.rr],
      ["SpO₂", assessment.vitals.spo2],
      ["Weight", assessment.anthropometry.weight],
    ].map(([label, value], i) => (
      <Grid
        item
        xs={2}
        key={i}
        sx={{
          borderRight: i !== 5 ? "1px solid #000" : "none",
          p: 0.5,
        }}
      >
        <Typography fontSize={12}>
          <b>{label}:</b> {value || "—"}
        </Typography>
      </Grid>
    ))}
  </Grid>
</Box>


      {/* ================= ANTHROPOMETRY ================= */}
      <Box mb={3}>
        <Typography
          fontWeight={700}
          fontSize={14}
          sx={{ borderBottom: "1px solid #000", mb: 1 }}
        >
          Anthropometry
        </Typography>

        <Box sx={{ border: "1px solid #000" }}>
          {[
            ["Weight", assessment.anthropometry.weight],
            ["Length", assessment.anthropometry.length],
            ["Head Circumference", assessment.anthropometry.hc],
            ["Blood Glucose", assessment.anthropometry.bsl],
          ].map(([label, value], i) => (
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
                <Typography fontSize={13}>{label}</Typography>
              </Grid>
              <Grid item xs={7} sx={{ p: 1 }}>
                <Typography fontSize={13}>{value || "-"}</Typography>
              </Grid>
            </Grid>
          ))}
        </Box>
      </Box>

      {/* ================= MEDICATIONS ================= */}
      <Box sx={{ border: "1px solid #000", mt: 1, p: 1 }}>
  <Typography fontSize={13} fontWeight={600}>
    Medications
  </Typography>

  {assessment.medications.length ? (
    assessment.medications.map((m: any, i: number) => (
      <Typography key={i} fontSize={12}>
        • {m.name} – {m.dosage}
      </Typography>
    ))
  ) : (
    <Typography fontSize={12}>—</Typography>
  )}
</Box>


      {/* ================= ALLERGIES ================= */}
      <Box sx={{ border: "1px solid #000", mt: 1 }}>
  {/* <Typography fontSize={13} fontWeight={600} sx={{ p: 0.5 }}>
    Allergies / Adverse Reaction
  </Typography> */}

  {/* <Typography fontSize={12} sx={{ p: 0.5 }}>
    Medication / Drug:{" "}
    {assessment.allergies.length > 0 ? "YES" : "NO"}
  </Typography> */}

  {assessment.allergies.map((a: any, i: number) => (
    <Typography key={i} fontSize={12} sx={{ pl: 2 }}>
      • {a.name} ({a.severity})
    </Typography>
  ))}
</Box>


      {/* ================= NURSING NEEDS ================= */}
      <Box sx={{ border: "1px solid #000", mt: 1, p: 1 }}>
  <Typography fontSize={13} fontWeight={600}>
    Nursing Needs
  </Typography>

  {assessment.nursingNeeds?.map((n: string, i: number) => (
    <Typography key={i} fontSize={12}>
      • {n}
    </Typography>
  ))}

  {assessment.otherNeeds && (
    <Typography fontSize={12} mt={1}>
      Other: {assessment.otherNeeds}
    </Typography>
  )}
</Box>

    </Box>
  )}
</Box>




    </Box>);
};

