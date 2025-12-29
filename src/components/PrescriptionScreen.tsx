import React, { ReactNode, useEffect,useRef, useState } from "react";
import {Box, Typography, TextField,DialogActions, Button,Grid,Divider,Autocomplete,MenuItem,Select,  Dialog,DialogTitle,Tooltip,DialogContent,FormControlLabel,FormGroup,Checkbox,FormControl,Snackbar, Alert, CircularProgress} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Chip } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrescription } from "@fortawesome/free-solid-svg-icons";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { addHours } from "date-fns";
import { ProtectedModule } from '../components/ProtectedModule';
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// At the top of PrescriptionScreen.tsx
import jsPDF from "jspdf";
import DownloadIcon from '@mui/icons-material/Download';

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
const Q_FACTOR_MAP: Record<number, string> = {
  4: "Q4H",
  6: "Q6H",
  8: "Q8H",
  12: "Q12H",
  24: "Q24H",
  36:"Q36H",
  48:"Q48H",
  30:"Q30H",
  42:"Q42H",
  18:"Q18H",
};
type MedicationItem = {
  id: string;
  name: string;
  orderType: string;   // ✅ ADD THIS
  frequency: number | string;
  frequency1: string;
  route: string;
  startDate: string;
  endDate: string;
  nextDose?:string|null;
  use: string;
  additionalNote: string;
  isCritical: boolean;
  statusDetail: string; 
  intervals: string[] | null;
  totalDoses: number;
  administeredCount: number;
  adminOver: number | null;
  concentration: string | null;
  intervalHours: number | null;
};
interface PrescriptionScreenProps {

  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
  gestational_age:string;
  birth_date:string;
  UserRole: string;

}

/*type AdministrationHistoryItem = {
  id: string;
  versionId: string;
  name: string;
   orderType: string;   // ✅ ADD THIS
  frequency: number | string;
  frequency1: string;
  route: string;
  startDate: string;
  endDate: string;
  use: string;
  additionalNote: string;
  isCritical: boolean;
  intervals: string[] | null;
  totalDoses: number;
  administeredCount: number;
  adminOver: number | null;
  concentration: string | null;
  intervalHours: number | null;
  status: string;
  effectiveDateTime: string;
  performerName: string;
  patientReference: string;
  requestReference: string;
};*/

type AdministrationHistoryItem = {
  id: string;
  versionId: string;
  name: string;
  status: string;
  effectiveDateTime: string;
  performerName: string;
  patientReference: string;
  requestReference: string;

  // NEW FIELDS
  dosage: string;
  route: string;
  indication: string;
  frequency1: string;
  duration: string;
  startDate: string | null;
  endDate: string | null;
  orderType:string | null;
  concentration:string | null;
  intervalHours:string | null;
};


interface Medication {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  frequency: string;
  frequency1?: string; // optional, if some don't have it
  route: string;
    orderType: string;
    nextDose:Date|null;
  totalDoses: number;
  administeredCount: number;
  dosageInstruction?: {
    doseAndRate?: {
      doseQuantity?: {
        value?: number;
        unit?: string;
      };
    }[];
  }[];
  use: string;
}


export const PrescriptionScreen: React.FC<PrescriptionScreenProps> = (props) => {

    
      const [selectedDrugName, setSelectedDrugName] = useState("");
      const [selectedDrugCategory, setSelectedDrugCategory] = useState("");
      const [selectedDrugUse, setSelectedDrugUse] = useState("");
      const [dose, setDose] = useState<string>('');
      const [route, setRoute] = useState<string>('');
      const [unit, setUnit] = useState("mg/kg");
      const [frequency, setFrequency] = useState<string>('');
      const [startDate, setStartDate] = useState<Date | null>(null);
      const [endDate, setEndDate] = useState<Date | null>(null);
      const [days, setDays] = useState<number>(1);
      const [indication, setIndication] =  useState<string[]>([]);
      //const [indications, setIndications] = useState<string[]>([]);
      const[admin,setAdmin]=useState<string>('');
     const [intervalHours, setIntervalHours] = useState<string>(''); // optional
      const[conc,setConc]=useState<string>('');
      const [additionalNote, setAdditionalNote] = useState("");
      const[doseperday,setDoseperday]=useState('N/A');
     // Store medications
     const [drugOptions, setDrugOptions] = useState<any[]>([]);
     const [openPrescribeModal, setOpenPrescribeModal] = useState(false);
const [pmaDays, setPmaDays] = useState<string>("");
const [pmaCombined,setpmaCombined]=useState<string>("");
const [allDrugsList, setAllDrugsList] = useState<any[]>([]);
const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "completed">("ongoing");
// const [inputValue, setInputValue] = useState("");

      const [gestationalAge, setGestationalAge] = useState<string>('');
const [birthDate, setBirthDate] = useState<string>('');
const [pnaDays, setPnaDays] = useState<string>("");
const [pmaWeeks, setPmaWeeks] = useState<string>("");
const [weight, setWeight] = useState<string>("");

 // e.g. "Q8H"
const [ivAdminBackup, setIvAdminBackup] = useState<string>(''); // stores last IV admin
const [doseAmount, setDoseAmount] = useState<string>('');   // mg total
const [doseVolume, setDoseVolume] = useState<string>('');   // mL total
const [deliveryRate, setDeliveryRate] = useState<string>(''); // mL/hr
const[ordertype,setOrderType]=useState<string>('');
// const [sortBy, setSortBy] = useState<string>("");
const [availableRoutes, setAvailableRoutes] = useState<string[]>([]);
const [selectedChips, setSelectedChips] = useState<string[]>([]);
//const [fhirImageId, setFhirImageId] = useState<string | null>(null);
const [openViewDialog, setOpenViewDialog] = useState(false);
const [selectedMedication, setSelectedMedication] = useState<any | null>(null);
const [capturedImage, setCapturedImage] = useState<string | null>(null);
const [isCameraActive, setIsCameraActive] = useState(false);
const videoRef = useRef<HTMLVideoElement>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
const [gaWeeks, setGaWeeks] = useState<string>("");
const [gaDays, setGaDays] = useState<string>("");

     // Drug search options
      const [selectedDrug, setSelectedDrug] = useState<any | null>(null); // Selected drug object
      const [administrationHistory, setAdministrationHistory] = useState<AdministrationHistoryItem[]>([]);
      const [prescriptionHistory, setPrescriptionHistory] = useState<Medication[]>([]);
const [step, setStep] = useState(1); // 🔹 step 1: details, step 2: capture image
  const [patientVerified, setPatientVerified] = useState(false);
  const [doseVerified, setDoseVerified] = useState(false);
const [chipNotes, setChipNotes] = useState<{ [key: string]: string }>({});
//const [startTime, setStartTime] = useState("");
const [duration] = useState("");
//const [rate, setRate] = useState("");
const [adminDetails, setAdminDetails] = useState({
  startTime: "",
  duration: "",
  calculatedRate: "",
});
const [overrideDialog, setOverrideDialog] = useState({
  open: false,
  field: "",
  oldValue: "",
  newValue: ""
});
const [doseAlert, setDoseAlert] = useState({
  open: false,
  message: ""
});
const [pendingDose, setPendingDose] = useState<string>("");
const [recommendedDose, setRecommendedDose] = useState<number | null>(null);

// 🔹 Fetch GA & DOB from FHIR (if exists)
// Gestational age in total days
//const totalGADays = Number(gaWeeks) * 7 + Number(gaDays);
const [orderTypeFilters, setOrderTypeFilters] = useState<string[]>([]);
const [filterDialogOpen, setFilterDialogOpen] = useState(false);
const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
const [selectedPrescription, setSelectedPrescription] = useState<MedicationItem | null>(null);
const [openIncompatDialog, setOpenIncompatDialog] = useState(false);
const [incompatData, setIncompatData] = useState<any>(null);
const [editMode, setEditMode] = useState(false);
// const [medicationhold,setMedicationHold]=useState(false);
// Early Administration Dialog
// const [openEarlyAdminDialog, setOpenEarlyAdminDialog] = useState(false);
// For early administration warning popup
const [openUpcomingDialog, setOpenUpcomingDialog] = useState(false);
const [upcomingWarningMed, setUpcomingWarningMed] = useState<MedicationItem | null>(null);

// To store which medication is being attempted
// const [confirmAdminMedicationId, setConfirmAdminMedicationId] = useState<string | null>(null);
const tableRef = useRef(null);

const [weekDialogOpen, setWeekDialogOpen] = useState<boolean>(false);
const [weekBlocks, setWeekBlocks] = useState<Array<{ start: Date; end: Date }>>([]);
const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);

const handleEditField = (field: string, value: any) => {
  if (!selectedPrescription) return;
  setSelectedPrescription(prev => ({
    ...prev!,
    [field]: value
  }));
};
// const [confirmDialog, setConfirmDialog] = useState({
//   open: false,
//   type: "",
//   item: null,
// });
const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
const [confirmActionType, setConfirmActionType] = useState<"hold" | "resume" |"cancel"| null>(null);
const [confirmMedicationId, setConfirmMedicationId] = useState<string | null>(null);

const [pendingMedicationForAdmin, setPendingMedicationForAdmin] = useState<any>(null);

const grouped = administrationHistory.reduce((acc, item) => {
  const start = (item.startDate || item.effectiveDateTime).split("T")[0];

  const key = `${item.name}__${start}`;

  if (!acc[key]) {
    acc[key] = {
      medName: item.name,
      startDate: item.startDate,
      endDate: item.endDate || null,
      dosage: item.dosage,
      route: item.route,
      frequency1: item.frequency1,
      indication: item.indication,
      concentration:item.concentration,
      intervalHours:item.intervalHours,
      records: []
    };
  }

  acc[key].records.push(item);
  return acc;
}, {} as Record<string, {
  intervalHours: ReactNode;
  medName: string;
  startDate: string;
  endDate: string | null;
  dosage: string;
  route: string;
  frequency: string;
  indication: string;
  records: AdministrationHistoryItem[];
}>);
const getFirstAdministerDate = (administrationHistory: any[]) => {
  if (!administrationHistory.length) return null;

  const dates = administrationHistory
    .map((a: { effectiveDateTime: string | number | Date; }) => new Date(a.effectiveDateTime))
    .filter((d: number) => !isNaN(d));

  if (!dates.length) return null;

  return new Date(Math.min(...dates));  // earliest date
};

const generateFiveDays = (startDate) => {
  if (!startDate) return [];

  let days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};
const toDDMM = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
  });
  function generateWeeklyBlocks(firstDate) {
  const start = new Date(firstDate);
  const today = new Date();

  // Normalize
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const blocks = [];

  let currentStart = new Date(start);

  while (currentStart <= today) {
    let currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 4); // 5-day block

    // Don't go past today
    if (currentEnd > today) currentEnd = new Date(today);

    blocks.push({
      start: new Date(currentStart),
      end: new Date(currentEnd),
    });

    // Move to next block
    currentStart.setDate(currentStart.getDate() + 5);
  }

  return blocks;
}
const handleSelectWeek = (startDate) => {
  setWeekDialogOpen(false);
  downloadAdministeredPdf(startDate);  // <-- send the selected date
};


const downloadAdministeredPdf = async (selectedWeekStart?: Date) => {
  // Helpers / constants (adjust if you named them differently)
  const firstDate = getFirstAdministerDate(administrationHistory);
  const start = selectedWeekStart ? new Date(selectedWeekStart) : firstDate;
  const fiveDays = generateFiveDays(start); // array of 5 Date objects
  const allowedDates = new Set(fiveDays.map(d => toDDMM(d)));
  const filteredGroups = Object.values(grouped).filter(group =>
    (group.records || []).some(rec => allowedDates.has(toDDMM(rec.effectiveDateTime)))
  );

  if (!filteredGroups.length) {
    // nothing to print
    console.warn("No administered drugs in the selected 5-day range.");
    setSnackbarMessage("No administered drugs in the selected 5-day range.");
    setSnackbarSeverity("warning");
    setSnackbarOpen(true);
    return;
  }

  // PDF setup
  const pdf = new jsPDF("landscape", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Layout constants (tweak sizes if needed)
  const firstColWidth = 20;
  const secondColWidth = 19;
  const dayColWidth = (pageWidth - (firstColWidth + secondColWidth)) / 5;
  const headerHeight = 6;
  const rowHeight = 30;
  const rows = 5; // vertical mini-rows count = 5
  const miniCellW = dayColWidth / 5;
  const gridXStart = firstColWidth + secondColWidth - 2;
  const yDates = 26; // top of the date header block
  const gridYStart = yDates + headerHeight;
  const drugsPerPage = 5;

  // Async header drawer (logo + patient box + date headers)
  const drawPdfHeader = async (pdfInstance: any) => {
    const startY = 0;
    // logo (attempt)
    try {
      //const logo = "./Best Pediatric Care Hospital Thane_ Why Parents Trust Borneo.png";
     // const blob = await fetch(logo).then(r => r.blob());
      //const reader = new FileReader();
      const base64 = "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";
      pdfInstance.addImage(base64, "PNG", 4, startY+2, 45, 12);
    } catch (e) {
      // fail silently if logo not available
    }
     pdf.setTextColor(0, 0, 0);

    
    pdfInstance.setFont("helvetica", "bold");
    pdfInstance.setFontSize(16);
    pdfInstance.text("DRUG ORDERS SHEET", 4, startY + 22);

    // patient box
    const boxX = 75, boxY = startY + 5, boxW = 90, boxH = 18;
    pdfInstance.setDrawColor(180);
    pdfInstance.setLineWidth(0.4);
    pdfInstance.roundedRect(boxX, boxY, boxW, boxH, 3, 3);
    pdfInstance.setFontSize(11);
    pdfInstance.setFont("helvetica", "bold");
    pdfInstance.text("B/O Mothers Name", boxX +2, boxY + 6);
    pdfInstance.text(`ID: ${"Sample Data" || props.patient_resource_id}`, boxX + boxW - 32, boxY + 6);
    pdfInstance.setFont("helvetica", "normal");
    pdfInstance.setFontSize(10);
    pdfInstance.text(`DOB: ${props.patient_dob || "-"}`, boxX + 2, boxY + 14);
    pdfInstance.text(`GA: ${props.patient_ga || "-"}`, boxX + 33, boxY + 14);
    pdfInstance.text(`Weight: ${props.patient_weight || "-"}`, boxX + 65, boxY + 14);

    // right side labels
    const rx = boxX + boxW + 5, ry = boxY + 8;
    pdfInstance.setFontSize(9);
    pdfInstance.text("Drug Allergies:", rx+3, ry-2);
    pdfInstance.line(rx + 25, ry - 2, pageWidth - 10, ry - 2);
    pdfInstance.text("Comments:", rx+3, ry + 7);
    pdfInstance.line(rx + 21, ry + 7, pageWidth - 10, ry + 7);

    // date header block: draw 5 date columns and inner 5 rows structure
    let xDates = gridXStart;
    pdfInstance.setFontSize(10);
    for (let i = 0; i < 5; i++) {
      const d = fiveDays[i];
      const label = d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }) : "DD/MM";
      // date header cell
      pdfInstance.rect(xDates, yDates, dayColWidth, headerHeight);
      pdfInstance.text(label, xDates + dayColWidth / 2-3, yDates + 4.5);

      // mini rows inside column
      let rowY = yDates + headerHeight;
      for (let r = 0; r < rows; r++) {
        let innerX = xDates;
        for (let c = 0; c < 5; c++) {
          pdfInstance.rect(innerX, rowY, miniCellW, rowHeight);
          innerX += miniCellW;
        }
        rowY += rowHeight;
      }
      xDates += dayColWidth;
    }

    // page number small (optional)
   // pdfInstance.setFontSize(9);
    //pdfInstance.text(`Page ${pageNum}`, pageWidth - 20, pageHeight - 6);
  };

  // footer drawing (kept per page here; you can move to global if you want single footer)
  const drawFooterTable = (pdfInstance: any) => {
     pdf.setTextColor(0, 0, 0);
    const cellHeight = 8;
    const x = 10;
    const y = pageHeight - 25;
    pdfInstance.setFontSize(10);
    pdfInstance.setFont("helvetica", "bold");
    pdfInstance.rect(x-8, y, firstColWidth, cellHeight);
    const docsign=pdf.splitTextToSize("Dr. Sign & Date",20);
    const icsign=pdf.splitTextToSize("Incharge Sign",15);
    pdfInstance.text(docsign, x - 7.2, y + 3.2);
    pdfInstance.rect(x + firstColWidth - 8, y, secondColWidth - 4, cellHeight);
    pdfInstance.text(icsign, x + firstColWidth - 7.5, y + 3);

    let colX = firstColWidth + secondColWidth - 2;
    for (let i = 0; i < 5; i++) {
      pdfInstance.rect(colX, y, dayColWidth, cellHeight);
      const d = fiveDays[i];
      const label = d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }) : "DD/MM";
      pdfInstance.text(label, colX + dayColWidth / 2 - 3, y + 7);
      colX += dayColWidth;
    }

    // second row (empty)
    const y2 = y + cellHeight ;
    let nCol = firstColWidth + secondColWidth - 2;
    pdfInstance.rect(x - 8, y2, firstColWidth, cellHeight+2.5);
    pdfInstance.rect(x - 8 + firstColWidth, y2, secondColWidth - 4, cellHeight+2.5);
    for (let i = 0; i < 5; i++) {
      pdfInstance.rect(nCol, y2, dayColWidth, cellHeight+2.5);
      nCol += dayColWidth;
    }
  };

  // Paginate filteredGroups (5 drugs per page)
  const totalPages = Math.ceil(filteredGroups.length / drugsPerPage);

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const pageNum = pageIndex + 1;
    if (pageIndex > 0) pdf.addPage();

    // draw header + grid for this page (await for logo)
    // eslint-disable-next-line no-await-in-loop
    await drawPdfHeader(pdf, pageNum);
    //---------------------------------------------
// LEFT SIDE HEADER CELL (MULTI-PAGE)
//---------------------------------------------
const leftHeaderX = 6;
const leftHeaderY = yDates; // same vertical alignment as date headers
const leftHeaderW = 35;     // same width as your new cells column
const leftHeaderH = 6;      // same as date header height

// Draw header cell border
pdf.rect(leftHeaderX - 4, leftHeaderY, leftHeaderW, leftHeaderH);

// Header text
pdf.setFont("helvetica", "bold");
pdf.setFontSize(10);
pdf.text("DRUGS", leftHeaderX + 2, leftHeaderY + 4.5);

    //---------------------------------------------
// LEFT SIDE 5 STATIC CELLS (MULTI-PAGE READY)
//---------------------------------------------
const newcellheight = 30;
const newcellwidth = 15;

let newx = 6;                       // left margin (same as your code)
let newy = gridYStart;              // align with first drug row

// Draw exactly 5 rows (each = 30 height)
for (let i = 0; i < 5; i++) {
  pdf.rect(
    newx - 4,                       // slight left shift (as you used)
    newy,
    newcellwidth + 20,              // matching your original width (15+20)
    newcellheight                  // = 30
  );

  newy += newcellheight;            // move down for next cell
}

    // slice the groups for this page
    const startIdx = pageIndex * drugsPerPage;
    const pageGroups = filteredGroups.slice(startIdx, startIdx + drugsPerPage);
    
    // render each drug row (aligned to the grid)
    pageGroups.forEach((group, drugRowIndex) => {
      const yRowTop = gridYStart + drugRowIndex * rowHeight;

      // left side: drug name + details
      const medtext=pdf.splitTextToSize(group.medName,18);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(medtext || group.medName || "-", 6, yRowTop + 6);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const detailLine = `${group.dosage || ""} ${group.route || ""} Q${group.intervalHours || ""}H`;
      pdf.text(detailLine, 6, yRowTop + 14);

      // startDate if you want
      if (group.startDate) {
        pdf.setFontSize(8);
        const dateline=`${"StartDate:"} ${new Date(group.startDate).toLocaleDateString()}`;
        pdf.text(dateline, 6, yRowTop + 18);
      }
      

      // fill 5 date columns for this drug
      for (let dcol = 0; dcol < 5; dcol++) {
        const date = fiveDays[dcol];
        const dateKey = toDDMM(date);
        const matches = (group.records || []).filter(r => toDDMM(r.effectiveDateTime) === dateKey);

        const dateColX = gridXStart + dcol * dayColWidth;
        // outer main cell (optional - grid already drawn by header)
        pdf.rect(dateColX, yRowTop, dayColWidth, rowHeight);

        // place up to 5 administrations into the mini-cells
        matches.slice(0, 5).forEach((entry, idx) => {
          const cellX = dateColX + idx * miniCellW;
          const cellY = yRowTop;

          // mini border - optional (already exists from header draw)
          pdf.rect(cellX, cellY, miniCellW, rowHeight);

          const dt = new Date(entry.effectiveDateTime);
          const timeOnly = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }).replace(/ AM| PM/i, "");
          const ampm = dt.toLocaleTimeString([], { hour12: true }).slice(-2);
          const nurse = "Sree Lakshmi" || entry.performerName || "-";

          pdf.setFontSize(7);
          const textX = cellX + 2;
          const textY = cellY + 3;
          pdf.setTextColor(65, 143, 206);
          pdf.setFont("helvetica", "bold");
          pdf.text(timeOnly, textX, textY+5);
          
          pdf.text(ampm, textX, textY + 8);
          
          const wrapped = pdf.splitTextToSize(nurse, miniCellW);
         
          pdf.setTextColor(134, 142, 150);
          pdf.setFont("helvetica", "normal");
          pdf.text(wrapped, textX-1.5, textY + 15);
        });
      }
    });

    // draw footer on this page
    drawFooterTable(pdf);
  }

  // finally save
  pdf.save("Administered_Medications.pdf");
};




useEffect(() => {
  if (!administrationHistory?.length) return;

  const firstDate = getFirstAdministerDate(administrationHistory);
  const blocks = generateWeeklyBlocks(firstDate);

  setWeekBlocks(blocks);
}, [administrationHistory]);


const handleResume = async (medication: MedicationItem) => {
  if (!medication?.id) return;

  try {
    // Fetch the existing MedicationRequest
    const resp = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medication.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      }
    );

    if (!resp.ok) {
      setSnackbarMessage("Failed to fetch MedicationRequest.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const medReq = await resp.json();

    // Remove ONLY the hold extension (statusDetail)
    const cleanedExtensions = (medReq.extension || []).filter(
      (ext: any) =>
        !ext.url.includes("medicationStatusDetail") // remove hold
    );

    const updatedRequest = {
      ...medReq,
      extension: cleanedExtensions,
      status: medReq.status || "active",
    };

    // Push update to FHIR
    const updateResp = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medication.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(updatedRequest),
      }
    );

    if (!updateResp.ok) {
      setSnackbarMessage("Failed to resume medication.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSnackbarMessage("Medication resumed.");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    fetchPrescription();
    setOpenPrescriptionDialog(false);

  } catch (err) {
    console.error("Error resuming medication:", err);
    setSnackbarMessage("Error resuming medication.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};

const handleSaveEdit = () => {
  if (!selectedPrescription) return;

  // Update prescriptionHistory array
 setPrescriptionHistory(prev =>
  prev.map(med => {
    if (med.id !== selectedPrescription.id) return med;

    return {
      ...med,
      frequency1: selectedPrescription.frequency1 ?? med.frequency1,
      route: selectedPrescription.route ?? med.route,
      startDate: selectedPrescription.startDate ?? med.startDate,
      endDate: selectedPrescription.endDate ?? med.endDate,
      additionalNote: selectedPrescription.additionalNote ?? med.additionalNote,
      orderType: selectedPrescription.orderType ?? med.orderType,
      use: selectedPrescription.use ?? med.use,
      isCritical: selectedPrescription.isCritical ?? med.isCritical,
      totalDoses: selectedPrescription.totalDoses ?? med.totalDoses,
      concentration: selectedPrescription.concentration ?? med.concentration,
      intervalHours: selectedPrescription.intervalHours ?? med.intervalHours,
      intervals: selectedPrescription.intervals ?? med.intervals,
    };
  })
);


  setEditMode(false);
  setSnackbarMessage("Prescription updated successfully!");
  setSnackbarSeverity("success");
  setSnackbarOpen(true);
};
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const off = date.getTimezoneOffset();
  const local = new Date(date.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
};

const formatAdminDisplay = (isoDateString: string | undefined | null) => {
  if (!isoDateString) return "";
  try {
    const d = new Date(isoDateString); // interprets Z correctly
    return d.toLocaleString([], {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch (err) {
    return isoDateString;
  }
};

const normalizeName = (name: string = "") =>
  name
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
const getIncompatibleList = (rule: any): string[] => {
  const list = rule?.other_info?.incompatible;
  if (!Array.isArray(list)) return [];
  return list.map(item => normalizeName(item));
};
const checkIncompatibilities = (
  selectedDrugRule: any,
  activeMedications: any[]
) => {
  if (!selectedDrugRule) return { conflicts: [] };

  const incompatibleList = getIncompatibleList(
    selectedDrugRule.original ?? selectedDrugRule
  );

  if (!incompatibleList.length) return { conflicts: [] };

  const conflicts = [];

  for (const med of activeMedications) {
    const activeRaw = med.name || med.medicationCodeableConcept?.text || "";
    const activeNorm = normalizeName(activeRaw);

    if (incompatibleList.includes(activeNorm)) {
      conflicts.push({
        activeName: activeRaw,
        incompatibleWith: activeNorm,
        ruleDrugName:
          selectedDrugRule.original?.drug_name ||
          selectedDrugRule.original?.name ||
          "",
      });
    }
  }

  return { conflicts, incompatibleList };
};
const handleDrugSelect = (newValue: any) => {
  if (!newValue) {
    resetDrugSelection();
    return;
  }

  // 🔥 RUN INCOMPATIBILITY CHECK FIRST
  const result = checkIncompatibilities(newValue, prescriptionHistory);

  if (result.conflicts.length > 0) {
    setIncompatData({
      conflicts: result.conflicts,
      selectedValue: newValue,
      ruleDrugName:
        newValue.original?.drug_name || newValue.original?.name || "",
    });
    setOpenIncompatDialog(true);
    return; // ❗ STOP → don't continue selection yet
  }

  // No incompatibility → proceed normally
  processDrugSelection(newValue);
};
const resetDrugSelection = () => {
  setSelectedDrug("");
  setSelectedDrugName("");
  setSelectedDrugCategory("");
  setSelectedDrugUse("");
  setIndication([]);
  setAvailableRoutes([]);
  setRoute("");
  setDose("");
  setAdmin("");
  setConc("");
  setIntervalHours("");
  setDoseperday("");
};
const processDrugSelection = (newValue: any) => {
  // Normal selection
  setSelectedDrug(newValue);
  setSelectedDrugName(newValue.name || "");
  setSelectedDrugCategory(newValue.category || "");
  setSelectedDrugUse("");

  const drugDetails = newValue.original;

  const filtered = filterRegimensForPatient(
    drugDetails.regimens,
    gestationalAge,
    weight,
    Number(pnaDays) || 0,
    Number(pmaWeeks) || 0
  );

  const uniqueIndications = [...new Set(filtered.map((r: any) => r.raw_text))];
  setIndication(uniqueIndications);

  const routeMap: Record<string, string[]> = {};
  filtered.forEach((r: any) => {
    if (!routeMap[r.raw_text]) routeMap[r.raw_text] = [];
    if (!routeMap[r.raw_text].includes(r.routes))
      routeMap[r.raw_text].push(r.routes);
  });

  setAvailableRoutes([]);
  setRoute("");
  setDose("");
  setAdmin("");
  setConc("");
  setIntervalHours("");
  setDoseperday("");
};

// const showIncompatDialog = (payload: any) => {
//   setIncompatData(payload);
//   setOpenIncompatDialog(true);
// };

  const handleClose = () => {
  if (step > 1) {
    setStep(step - 1);
  } else {
    setOpenViewDialog(false);
  }
};
const validateDoseWithRules = (doseValue: number) => {
  if (!selectedDrug || !selectedDrug.original || !selectedDrugUse || !route)
    return true;

  // Get regimen used now
  const regimen = selectedDrug.original.regimens.find(
    (r: any) =>
      r.raw_text === selectedDrugUse &&
      r.routes?.toUpperCase() === route?.toUpperCase()
  );

  if (!regimen) return true;

  // ⭐ ACCESS DOSE RANGE HERE
  const doseRange = regimen.constraints?.dose_range;

  if (!doseRange) return true; // no rule → allow

  const min = doseRange.min;
  const max = doseRange.max;

  return doseValue >= min && doseValue <= max;
};


const handleCloseEntire = () => {
  setOpenViewDialog(false);  // closes the dialog completely
      setStep(1);                // optional — reset stepper to first step
  setSelectedChips([]); 
  setCapturedImage(null);
  setDoseVerified(false);
  setPatientVerified(false);
  setIsCameraActive(false);

  // Optional: stop camera if it was left on
  if (videoRef.current && videoRef.current.srcObject) {
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
  } // optional — clear selected chips if you’re using them
};

const handleProceed = async () => {
  // ✅ Step 1 → Step 2 guard (verification check)
  if (step === 1 && (!patientVerified || !doseVerified)) {
     setSnackbarMessage("Please verify both 'Patient' and 'Drug dose & route' before proceeding.");
setSnackbarSeverity("error");
setSnackbarOpen(true)
    
    return;
  }

  // ✅ Step 2 → Step 3 (upload captured image to FHIR)
  if (step === 2) {
    if (!capturedImage) {
      setSnackbarMessage("Please capture or upload an image before proceeding.");
setSnackbarSeverity("error");
setSnackbarOpen(true)
    
      
      return;
    }
    setStep(3);
    return;
  }

  // ✅ Step 3 → Step 4 (chip selection required)
  if (step === 3) {
    if (selectedChips.length <= 0) {
      
setSnackbarMessage("You are proceeding with no additional info");
setSnackbarSeverity("warning");
setSnackbarOpen(true)
    
      
    } 
    setStep(4);//else {
    //  alert("Please select at least one option before proceeding.");
   // }
    return;
  }

  // ✅ Step 4 → Step 5 (drug administration timing & rate)
  if (step === 4) {
    // Add any validation here if needed later (e.g., notes required)
    setStep(5);
    return;
  }

  // ✅ Step 5 → End (finish flow and close dialog)
  if (step === 5) {
    // Optionally trigger final save or summary step here
    try {
      if (!capturedImage) {
  console.error("No image captured.");
  return;
}

      await handleUploadToFHIR(capturedImage); 
      if (selectedMedication?.id) {
        console.log("Administering medication:", selectedMedication.id);
        await handleAdminister(selectedMedication.id);
         // ✅ trigger FHIR administration
      }
  
    } catch (error) {
      console.error("Error administering medication:", error);
      setSnackbarMessage("Failed to administer medication. Please try again.");
setSnackbarSeverity("error");
setSnackbarOpen(true)
    
       console.error("FHIR upload failed:", error);
      setSnackbarMessage("Failed to upload image to FHIR. Please try again.");
      setSnackbarSeverity("error");
setSnackbarOpen(true)
    }
    setStep(1);
    setDoseVerified(false);
    setPatientVerified(false);
    setOpenViewDialog(false);
    setCapturedImage(null);
    return;}
//if (step === 6) {
    // Optionally trigger final save or summary step here
 //   setStep(1);
  ///  setOpenViewDialog(false);
 //   return;
 // }
  // ✅ Default fallback — safety guard
  if (step < 5) setStep(step + 1);
};

useEffect(() => {
  if (!gaWeeks) return;
  const gaDec =
    gaDays !== ""
      ? (parseInt(gaWeeks) + parseInt(gaDays) / 7).toFixed(1)
      : parseInt(gaWeeks).toFixed(1);
  setGestationalAge(gaDec);
  if (birthDate) {
    const calc = calculatePNAandPMA(birthDate, gaDec);
    setPnaDays(String(calc.pnaDays));
    setPmaWeeks(calc.pmaWeeks);
    setPmaDays(calc.pmaDays);
    setpmaCombined(calc.pmaDecimal);
  }
}, [gaWeeks, gaDays]);
useEffect(() => {
  if (!birthDate || !gestationalAge) return;
  const calc = calculatePNAandPMA(birthDate, gestationalAge);
  setPnaDays(String(calc.pnaDays));
  setPmaWeeks(calc.pmaWeeks);
  setPmaDays(calc.pmaDays);
  setpmaCombined(calc.pmaDecimal);
}, [birthDate]);
useEffect(() => {
  if (pmaWeeks === "" || pmaDays === "") return;
  const dec = (
    parseInt(pmaWeeks) +
    parseInt(pmaDays) / 7
  ).toFixed(1);
  setpmaCombined(dec);
}, [pmaWeeks, pmaDays]);

const handleProtectedChange = (field: string, oldVal: any, newVal: any) => {
  if (field === "dose" || field === "conc" ||field === "frequency" || field === "startDate" || field === "endDate" || field === "additionalNote") {

      // If old value is empty/null → DO NOT show override popup
  if (!oldVal || oldVal.trim() === "") {
    applyFieldChange(field, newVal);
    return;
  }

  // If new value is same → no need to show popup
  if (oldVal === newVal) {
    return;
  }
    setOverrideDialog({
      open: true,
      field,
      oldValue: oldVal,
      newValue: newVal
    });

  } else {
    // normal update for earlier fields like drug name, route, etc
    applyFieldChange(field, newVal);
  }
};

const applyFieldChange = (field: string, val: any) => {
  if (field === "dose") setDose(val);
  if (field === "conc") setConc(val);
  if (field === "frequency") setFrequency(val);
  if (field === "startDate") setStartDate(val);
  if (field === "endDate") setEndDate(val);
  if (field === "additionalNote") setAdditionalNote(val);
};


const handleTakePhoto = async () => {
    if (!isCameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err) {
        console.error("Camera access error:", err);
        setSnackbarMessage("Unable to access the camera. Please allow permission.");
        setSnackbarSeverity("error");
setSnackbarOpen(true)
      }
    } else {
      // Capture the current frame from video
      const video = videoRef.current;
      if (!video) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/png");
      setCapturedImage(imageData);

      // Stop camera
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCameraActive(false);
    }
  };

  // 🔹 Upload from gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

 
  // Fetch drug data (RxNorm API example)
  // const fetchDrugs = async (query: string) => {
  //   try {
  //     const response = await fetch(
  //       `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${query}`
  //     );
  //     const data = await response.json();
  //     const drugs =
  //       data.drugGroup.conceptGroup?.flatMap((group: any) =>
  //         group.conceptProperties
  //           ? group.conceptProperties.map((item: any) => item.name)
  //           : []
  //       ) || [];
  //     setDrugOptions(drugs);
  //   } catch (error) {
  //     console.error("Error fetching drug data:", error);
  //     setDrugOptions([]);
  //   }
  // };

  
// place near other helper functions in PrescriptionScreen.tsx



const mapRuleToOption = (rule: any) => ({
  // keep fields your UI expects
  name: rule.drug_name || "",               // used by getOptionLabel
  category: rule.other_info?.ABOUT?.[0] || "", // optional
  use: rule.regimens && rule.regimens.length ? rule.regimens[0].raw_text : "", // first use as fallback
  original: rule // keep full object for deeper use later (e.g., regimens)
});


const fetchDrugs = async (query: string = "") => {
  try {
    const resp = await fetch("/rules.json"); // ✅ keep your existing path
    const data = await resp.json();

    // ✅ Normalize to array (since some files may contain single or multiple drug objects)
    const list = Array.isArray(data) ? data : [data];

    // ✅ Cache full drug list if not already stored
    if (!allDrugsList.length) setAllDrugsList(list);

    // ✅ Filter based on search query
    let matches;
    if (!query.trim()) {
      // no query → show all drugs
      matches = list.map(mapRuleToOption);
    } else {
      matches = list
        .filter(
          (d: any) =>
            d.drug_name &&
            d.drug_name.toLowerCase().includes(query.toLowerCase())
        )
        .map(mapRuleToOption);
    }

    setDrugOptions(matches);
  } catch (err) {
    console.error("Error loading rules.json:", err);
    setDrugOptions([]);
  }
};
useEffect(() => {
  fetchDrugs(""); // ✅ load full list initially
}, []);


/*const getIndicationsForDrug = (drug: any) => {
  if (!drug || !drug.regimens) return [];
  // Extract unique raw_text values (drug uses)
  const uniqueUses = [...new Set(drug.regimens.map((r: any) => r.raw_text))];
  return uniqueUses;
};*/

/*const getRegimenDetails = (drug: any, indication: string) => {
  if (!drug || !drug.regimens) return null;
  const match = drug.regimens.find(
    (r: any) => r.raw_text.toLowerCase() === indication.toLowerCase()
  );
  return match || null;
};*/



const calculatePNAandPMA = (birthDate: string, gestAgeDecimal: string) => {
  if (!birthDate || !gestAgeDecimal) {
    return { pnaDays: 0, pmaWeeks: "", pmaDays: "", pmaDecimal: "" };
  }

  const birth = new Date(birthDate);
  const today = new Date();

  // PNA in days
  const pnaDays = Math.max(
    0,
    Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
  );

  // PMA in weeks (decimal)
  const pmaDecimal = (parseFloat(gestAgeDecimal) + pnaDays / 7).toFixed(1);

  // Convert decimal -> weeks + days
  const wholeWeeks = Math.floor(parseFloat(pmaDecimal));
  const remainingDays = Math.round((parseFloat(pmaDecimal) - wholeWeeks) * 7);

  return {
    pnaDays,
    pmaWeeks: String(wholeWeeks),
    pmaDays: String(remainingDays),
    pmaDecimal,
  };
};



useEffect(() => {
  if (birthDate && gestationalAge) {
    const { pnaDays, pmaWeeks } = calculatePNAandPMA(birthDate, gestationalAge);
    setPnaDays(String(pnaDays ?? ""));
    setPmaWeeks(String(pmaWeeks ?? ""));

  }
}, [birthDate, gestationalAge]);


//checkning pna and pma values
useEffect(() => {
  console.log("GA:", gestationalAge, "| PNA (days):", pnaDays, "| PMA (weeks):", pmaWeeks);
}, [gestationalAge, pnaDays, pmaWeeks]);



// Check if a numeric value is within a defined range object
const inRange = (value: number, range: any): boolean => {
  if (!range) return true;

  const min =
    range.min ??
    range.min_kg ??
    range.min_days ??
    0;

  const max =
    range.max ??
    range.max_kg ??
    range.max_days ??
    Infinity;

  return value >= min && value <= max;
};

const filterRegimensForPatient = (
  regimens: any[],
  gestationalAge: string,
  weight: string,
  pnaDays: number,
  pmaWeeks: number
): any[] => {
  const ga = parseFloat(gestationalAge || "0");
  const wt = parseFloat(weight || "0");

  return regimens.filter((r) => {
    const gaOk = !r.ga_range || inRange(ga, r.ga_range);
    const pnaOk = !r.pna_range || inRange(pnaDays, r.pna_range);
    const pmaOk = !r.pma_range || inRange(pmaWeeks, r.pma_range);
    const wtOk = !r.weight_range_kg || inRange(wt, r.weight_range_kg);
    return gaOk && pnaOk && pmaOk && wtOk;
  });
};

useEffect(() => {
  if (selectedDrug && selectedDrug.original) {
    const filtered = filterRegimensForPatient(
      selectedDrug.original.regimens,
      gestationalAge,
      weight,
      Number(pnaDays)||0,
      Number(pmaWeeks)||0
    );
    const uses = [...new Set(filtered.map((r: any) => r.raw_text))] as string[];
    setIndication(uses);

    // ✅ Reset selected indication every time list changes
    setSelectedDrugUse('');
  }
}, [gestationalAge, weight, pnaDays, pmaWeeks, selectedDrug]);

const calculateDoseMetrics = (
  dosec: string,
  weight: string,
  concc: string,
  admin: string,
  route: string,
  dosePerDay?: string
) => {
  const wt = parseFloat(weight || "0");
  const dose = parseFloat(dosec || "0");
  const conc = parseFloat(concc || "0");
  const adminTime = parseFloat(admin || "0");
  const perDay = parseFloat(dosePerDay || "0");

  if (!wt || !dose || !conc) {
    return { doseAmount: "", doseVolume: "", deliveryRate: "" };
  }

  // ✅ Dose amount (mg) = dose_value * weight
  var doseAmount = dose * wt; // mg
   if (perDay && perDay > 0) {
    doseAmount = doseAmount / perDay;
  }
  // ✅ Dose volume (mL) = doseAmount / conc
  const doseVolume = conc ? doseAmount / conc : 0;

  // ✅ Delivery rate (for IV only) = volume / (admin_time / 60)
  const deliveryRate =
    route.toUpperCase() === "IV" && adminTime
      ? doseVolume / (adminTime / 60)
      : 0;

  return {
    doseAmount: doseAmount.toFixed(3),
    doseVolume: doseVolume.toFixed(3),
    deliveryRate: deliveryRate ? deliveryRate.toFixed(3) : "",
  };
};
useEffect(() => {
  const { doseAmount, doseVolume, deliveryRate } = calculateDoseMetrics(
    dose,
    weight,
    conc,
    admin,
    route,
    doseperday
  );
  setDoseAmount(doseAmount);
  setDoseVolume(doseVolume);
  setDeliveryRate(deliveryRate);
}, [dose, weight, conc, admin, route,doseperday]);

  /*const getIndicationsForDrug = (drug: any) => {
    if (!drug || !drug.regimens) return [];
    
    // Extract unique indications (raw_text)
    const indications = [...new Set(drug.regimens.map((r: any) => r.raw_text))];
    return indications;
  };*/
// ✅ Find active regimen for selected drug use + route
const activeRegimen =
  selectedDrug?.original?.regimens?.find(
    (r: any) =>
      r.raw_text === selectedDrugUse && r.routes?.toUpperCase() === route?.toUpperCase()
  ) || null;

const calcNotes = activeRegimen?.calc_notes || "";

useEffect(() => {
  if (activeRegimen) {
    setRecommendedDose(activeRegimen.dose_value);  // put original dose here
  }
}, [activeRegimen]);

  const isFormEmpty = () => {
    return (
      !selectedDrug ||
      !dose ||
      !route ||
      !frequency ||
      !startDate ||
      !endDate 
      // !indication ||
      // !additionalNote
    );
  };
  // Function to calculate the end date
const calculateEndDate = (startDate: string | number | Date, frequency: string, days: number) => {
  if (!startDate || !frequency || !days) return null;
  
  const hoursPerDose = parseInt(frequency.replace('Q', '').replace('H', ''), 10);
  const totalHours = days * 24; // Total hours based on the number of days
  const doses = totalHours / hoursPerDose; // Total doses within the period
  
  return addHours(new Date(startDate), doses * hoursPerDose);
};
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [snackbarSeverity, setSnackbarSeverity] = useState<"success" |"warning" | "error">("success");

const handleCloseSnackbar = () => {
  setSnackbarOpen(false);
};

// In your component
useEffect(() => {
  if (startDate && frequency && days) {
    const computedEndDate = calculateEndDate(startDate, frequency, days);
    setEndDate(computedEndDate);
  }
}, [startDate, frequency, days]);
  const resetForm = () => {
    setDrugOptions([]); // Clears the dropdown options safely
    setSelectedDrug(null);
    setSelectedDrugName('');
    setSelectedDrugCategory('');
    setSelectedDrugUse('');
    setDose('');
    setRoute('');
    setFrequency('');
    setStartDate(null);
    setEndDate(null);
    setDays(1);
    setIntervalHours('');
    setAdmin('');
    setIndication([]);
    setSelectedDrug('');
    setConc('');
    setOrderType('');
    setRoute('');
    setAdditionalNote('');
  };
//const FHIR_BASE_URL="https://pmsserver.local/fhir";
/**
 * Uploads the captured or selected image to the FHIR server as a Media resource.
 * Links it to the current patient using props.patient_resource_id.
 */

const handleUploadToFHIR = async (imageBase64: string) => {
  try {
    if (!imageBase64) {
      console.error("No image data found.");
      setSnackbarMessage("No image to upload.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // ✅ Ensure your base FHIR URL and credentials are set correctly
    const FHIR_BASE_URL = import.meta.env.VITE_FHIRAPI_URL;
    const authHeader = "Basic " + btoa("fhiruser:change-password");

    // ✅ Build proper FHIR Media resource structure
    const mediaResource = {
      resourceType: "Media",
      status: "completed",
      type: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/media-type",
            code: "photo",
            display: "Photograph",
          },
        ],
        text: "photo",
      },
      subject: {
        reference: `Patient/${props.patient_resource_id}`,
      },
      content: {
        contentType: "image/jpeg",
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ""), // clean base64 prefix if present
      },
      issued: new Date().toISOString(),
      createdDateTime: new Date().toISOString(),
    };

    console.log("Uploading Media resource to FHIR:", mediaResource);

    const response = await fetch(`${FHIR_BASE_URL}/Media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(mediaResource),
    });

    // ✅ Handle errors cleanly
    if (!response.ok) {
      const errorText = await response.text();
      console.error("FHIR upload failed:", errorText);
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const locationHeader = response.headers.get("Location");
    console.log("✅ Image uploaded successfully to FHIR!", locationHeader);

    setSnackbarMessage("Image uploaded successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    return locationHeader; // optional: store for linking later
  } catch (error) {
    console.error("Error uploading to FHIR:", error);
    setSnackbarMessage("FHIR upload failed. Check connection or credentials.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};
useEffect(() => {
  fetchPrescription();
}, []);

useEffect(() => {
  console.log("All Prescription History:", prescriptionHistory);
  prescriptionHistory.forEach((m) => {
    console.log("Medication:", m.name, " → orderType:", m.orderType);
  });
}, [prescriptionHistory]);


  
  const handleEndDateChange = (newEndDate: Date | null) => {
    setEndDate(newEndDate);
    const effectiveStartDate = startDate || new Date(); // Fallback to current date
    if (newEndDate) {
      const difference = Math.ceil(
        (newEndDate.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (difference >= 1) {
        setDays(difference);
      }
    }
  };
  const [medicationResourceId, setMedicationResourceId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
 
 
  const [administering, setAdministering] = useState(false);
  const [currentMedicationId, setCurrentMedicationId] = useState<string | null>(null);

  const calculateIntervals = (startDate: string | number | Date, endDate: string | number | Date, frequencyInHours: number) => {
    const intervals = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= new Date(endDate)) {
      intervals.push(new Date(currentDate)); // Add the current date to the intervals array
      currentDate.setHours(currentDate.getHours() + frequencyInHours); // Increment by the frequency
    }
    return intervals;
    
    
  }; 
const getNextDoseTime = (med:any) => {
  if (med.nextDoseTime) return new Date(med.nextDoseTime);  // ⭐ use FHIR stored value

  // fallback old calculation
  if (med.intervalHours) {
    return addHours(new Date(med.startDate), med.intervalHours);
  }

  return null;
};

const filteredMedications = prescriptionHistory.filter((med) => {
  const now = new Date();
  const start = new Date(med.startDate);
  const end = new Date(med.endDate);
  const nextDose = getNextDoseTime(med);

  const isCompleted = med.administeredCount >= med.totalDoses;
  const isBeforeStart = now < start;
  //const isAfterEnd = now > end;
  const isMissed = nextDose && now > nextDose && !isCompleted;
  const isOngoing = !isCompleted && now >= start && now <= end && !isMissed;
  const isUpcoming = isBeforeStart && !isCompleted;

  if (orderTypeFilters.length > 0) {
    if (!orderTypeFilters.includes(med.orderType)) {
      return false; // ❌ hide this medication
    }
  }
if (med.statusDetail === "cancelled") {
  return statusFilter === "all";
}
  if (statusFilter === "all") return true;
  if (statusFilter === "completed") return isCompleted;
  if (statusFilter === "ongoing") return isOngoing || isUpcoming || isMissed;
  return false;
});

const finalMedications = [...filteredMedications].sort(
  (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
);
  // const fetchPrescription = async () => {
  //   setLoading(true);
  //   try {
  //     const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest?subject=Patient/${props.patient_resource_id}`;
  //     const response = await fetch(searchUrl, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //     });
  
  //     if (response.ok) {
  //       const searchData = await response.json();
  //       console.log("Fetched Medication:", searchData);
  
  //       if (searchData?.entry && searchData.entry.length > 0) {
  //         const medicationData = searchData.entry.map((entry: { resource: any }) => {
  //           const medication = entry.resource;
  
  //           // Get frequency and start/end dates
  //           const frequency = medication.dosageInstruction?.[0]?.timing?.repeat?.frequency || "N/A";
  //           const startDate = medication.dispenseRequest?.validityPeriod?.start || "N/A";
  //           const endDate = medication.dispenseRequest?.validityPeriod?.end || "N/A";
             
  //           let frequencyInHours = frequency;
  //           const intervals = calculateIntervals(startDate, endDate, frequencyInHours);
  //           console.log("MedicationRequest intervals.",intervals);
  //           return {
  //             id: medication.id, // Ensure the medication ID is included
  //             name: medication.medicationCodeableConcept.text,
  //             frequency: frequency,
  //             frequency1: medication.dosageInstruction?.[0]?.text || "N/A",
  //             route: medication.dosageInstruction?.[0]?.route?.coding?.[0]?.display || "N/A",
  //             startDate: startDate,
  //             endDate: endDate,
  //             use: medication.reasonCode?.[0]?.text || "N/A",
  //             additionalNote: medication.note?.[0]?.text || "N/A",
  //             isCritical: false,
  //             intervals: intervals,
  //           };
  //         });
  
  //         setPrescriptionHistory(medicationData);
         
  //         // Save the medication data with IDs
  //       }
  //     } else {
  //       console.error("Failed to fetch MedicationRequest resource.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching MedicationRequest:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  

 
  // const handlePrescribe = async () => {
  //   setLoading(true);
  //   const doseValue = Number(dose);
  //     // Dynamically setting the period based on the selected frequency (Q12H, Q8H, Q6H)
  // const period = frequency === 'Q12H' ? 12 : frequency === 'Q8H' ? 8 : frequency === 'Q6H' ? 6 : 12;
  //   const prescriptionData = {
  //     resourceType: "MedicationRequest",
  //     id: medicationResourceId || undefined,
  //     status: "active",
  //     intent: "order",
  //     medicationCodeableConcept: {
  //       text: selectedDrugName, 
  //     },
     
  //     subject: {
  //       reference: `Patient/${props.patient_resource_id}`,
  //       display: props.patient_name,
  //     },
  //     requester: {
  //       reference: "Practitioner/12345", // Use a valid doctor ID
  //     },
  //     dosageInstruction: [
  //       {
  //         text: `${dose} mg ${route} every ${frequency}`,
  //         doseAndRate: [
  //           {
  //             doseQuantity: {
  //               value: doseValue, // Use the number value here
  //               unit: "mg",
  //             },
  //           },
  //         ],
  //         timing: {
  //           repeat: {
  //             frequency: period,  
  //             period: 1,     
  //             periodUnit: "d" 
  //           }
  //         },
  //         route: {
  //           coding: [
  //             {
  //               system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
  //               code: route.toLowerCase(),
  //               display: route,
  //             },
  //           ],
  //         },
  //       },
  //     ],
      
  //     reasonCode: [
  //       {
  //         text: selectedDrugUse,
  //       },
  //     ],
  //     note: [
  //       {
  //         text: additionalNote,
  //       },
  //     ],
  //     dispenseRequest: {
  //       validityPeriod: {
  //         start: startDate, // Start date of the prescription
  //         end: endDate, // End date of the prescription
  //       },
  //       expectedSupplyDuration: {
  //         value: days, // Total number of days
  //         unit: "days",
  //         system: "http://unitsofmeasure.org",
  //         code: "d",
  //       },
  //     },
  //   };
  
  //   try {
  //     const requestConfig = {
  //       method:  "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //       body: JSON.stringify(prescriptionData),
  //     };
  
  //     const url =`${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`;
  
  //     const response = await fetch(url, requestConfig);
  
  //     if (!response.ok) {
  //       const errorBody = await response.text();
  //       console.error("Error response body:", errorBody);
  //       throw new Error(`Request failed: ${response.statusText}`);
  //     }
  
  //     // Only parse JSON if the response has content
  //     const contentType = response.headers.get("content-type");
  //     let responseData = null;
  //     if (contentType && contentType.includes("application/json")) {
  //       responseData = await response.json();
  //     }
  //       setMedicationResourceId(responseData?.id || null);
  //       console.log("Prescription saved successfully:", responseData);
  //       setSnackbarMessage("Prescription saved successfully!");
  //     setSnackbarSeverity("success");
  //     setSnackbarOpen(true);
  //   } catch (error) {
  //     console.error("Error saving Prescription resource:", error);
  //     setSnackbarMessage("An error occurred while saving the Prescription.");
  //     setSnackbarSeverity("error");
  //     setSnackbarOpen(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  // const handleAdminister = async (medicationId: string) => {
  //   setAdministering(true);
  //   setCurrentMedicationId(medicationId);
  
  //   try {
  //     // Fetch MedicationRequest to get the medication reference or codeable concept
  //     const medicationRequestResponse = await fetch(
  //       `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         },
  //       }
  //     );
  
  //     if (!medicationRequestResponse.ok) {
  //       console.error("Failed to fetch MedicationRequest resource.");
  //       setSnackbarMessage("Failed to fetch MedicationRequest.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     const medicationRequest = await medicationRequestResponse.json();
  
  //     // Validate if the medication details are available
  //     const medicationReference =
  //       medicationRequest.medicationReference?.reference || null;
  //     const medicationCodeableConcept =
  //       medicationRequest.medicationCodeableConcept || null;
  
  //     if (!medicationReference && !medicationCodeableConcept) {
  //       console.error("MedicationRequest does not have a valid medication field.");
  //       setSnackbarMessage("Invalid MedicationRequest: Missing medication.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     // Check if a MedicationAdministration already exists for the MedicationRequest
  //     const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration?request=MedicationRequest/${medicationId}`;
  //     const searchResponse = await fetch(searchUrl, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //     });
  
  //     if (!searchResponse.ok) {
  //       console.error("Failed to search for existing MedicationAdministration.");
  //       setSnackbarMessage("Error checking existing administration.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     const searchData = await searchResponse.json();
  //     const existingAdmin = searchData?.entry?.[0]?.resource;
  
  //     // Enhanced: Validation to prevent multiple concurrent administrations
  //     if (existingAdmin && existingAdmin.status === "in-progress") {
  //       console.warn("MedicationAdministration is already in progress.");
  //       setSnackbarMessage("This medication is already being administered.");
  //       setSnackbarSeverity("warning");
  //       return;
  //     }
  
  //     // Prepare the MedicationAdministration resource
  //     const administerData = {
  //       resourceType: "MedicationAdministration",
  //       status: "completed", // Updated as per FHIR resource standard
  //       medicationReference: medicationReference
  //         ? { reference: medicationReference }
  //         : undefined,
  //       medicationCodeableConcept: medicationCodeableConcept || undefined,
  //       request: {
  //         reference: `MedicationRequest/${medicationId}`,
  //       },
  //       subject: {
  //         reference: `Patient/${props.patient_resource_id}`,
  //       },
  //       performer: [
  //         {
  //           actor: {
  //             reference: "Practitioner/12345", // Replace with actual performer ID
  //             display: "Nurse Name", // Replace with dynamic performer name
  //           },
  //         },
  //       ],
  //       effectiveDateTime: new Date().toISOString(),
  //     };
  
  //     // Log administration attempt (enhancement)
  //     console.log(
  //       "Attempting to administer medication with the following data:",
  //       administerData
  //     );
  
  //     let response;
  //     if (existingAdmin) {
  //       // Update existing MedicationAdministration with PUT
  //       const adminId = existingAdmin.id;
  //       response = await fetch(
  //         `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration/${adminId}`,
  //         {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: "Basic " + btoa("fhiruser:change-password"),
  //           },
  //           body: JSON.stringify({ ...existingAdmin, ...administerData }),
  //         }
  //       );
  //     } else {
  //       // Create new MedicationAdministration with POST
  //       response = await fetch(
  //         `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: "Basic " + btoa("fhiruser:change-password"),
  //           },
  //           body: JSON.stringify(administerData),
  //         }
  //       );
  //     }
  
  //     if (response.ok) {
  //       const responseData = await response.json();
  //       console.log("Medication administered successfully:", responseData);
  //       setSnackbarMessage("Medication administered successfully!");
  //       setSnackbarSeverity("success");
  //     } else {
  //       const errorMessage = await response.text();
  //       console.error("Failed to administer medication:", errorMessage);
  //       setSnackbarMessage("Failed to administer medication.");
  //       setSnackbarSeverity("error");
  //     }
  //   } catch (error) {
  //     console.error("Error administering medication:", error);
  //     setSnackbarMessage("An error occurred while administering the medication.");
  //     setSnackbarSeverity("error");
  //   } finally {
  //     setAdministering(false);
  //     setCurrentMedicationId(null);
  //     setSnackbarOpen(true);
  //   }
  // };


const handleCancel = async (medicationId: string) => {
  try {
    console.log("🔍 Cancel: MedicationRequest ID =", medicationId);
console.log("🔗 URL =", `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationId}`);

    // 1️⃣ Fetch MedicationRequest
    const resp = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      }
    );

    if (!resp.ok) {
      console.error("Failed to fetch MedicationRequest for cancel");
      return;
    }

    const medicationRequest = await resp.json();

    // 2️⃣ Remove old status extension
    const updatedExtensions = (medicationRequest.extension || []).filter(
      (ext: any) =>
        ext.url !==
        "http://example.org/fhir/StructureDefinition/medicationStatusDetail"
    );

    // 3️⃣ Add new "cancelled" status extension
    updatedExtensions.push({
      url: "http://example.org/fhir/StructureDefinition/medicationStatusDetail",
      valueString: "cancelled",
    });

    const updatedRequest = {
      ...medicationRequest,
      extension: updatedExtensions,
      status: "stopped",
    };

    // 4️⃣ PUT update to FHIR
    const updateResp = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(updatedRequest),
      }
    );

    if (!updateResp.ok) {
      console.error("Failed to update MedicationRequest cancel");
      return;
    }

    // 5️⃣ Refresh UI
    await fetchPrescription();

    setSnackbarMessage("Medication cancelled");
    setSnackbarSeverity("warning");
    setSnackbarOpen(true);

  } catch (e) {
    console.error("Cancel error:", e);
  }
};


const handleHold = async (medication: MedicationItem) => {
  if (!medication?.id) return;

  try {
    // Fetch the existing MedicationRequest
    const resp = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medication.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      }
    );

    if (!resp.ok) {
      setSnackbarMessage("Failed to fetch MedicationRequest.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const medReq = await resp.json();

    // Remove old statusDetail extension if it exists
    const filteredExtensions = (medReq.extension || []).filter(
      (ext: any) =>
        !ext.url.includes("medicationStatusDetail")
    );

    // Build updated extension list
    const updatedExtensions = [
      ...filteredExtensions,
      {
        url: "http://example.org/fhir/StructureDefinition/medicationStatusDetail",
        valueString: "hold",
      },
    ];

    const updatedRequest = {
      ...medReq,
      extension: updatedExtensions,
      status: "active", // keep normal FHIR status
    };

    // PUT update to FHIR
    const updateResp = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medication.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(updatedRequest),
      }
    );

    if (!updateResp.ok) {
      setSnackbarMessage("Failed to update hold status.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSnackbarMessage("Medication placed on hold.");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    // Refresh UI
    fetchPrescription();
    setOpenPrescriptionDialog(false);

  } catch (err) {
    console.error("Error applying HOLD:", err);
    setSnackbarMessage("Error placing medication on hold.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};


/*const fetchAdminister = async () => {
  setLoading(true);
  try {
    const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration?subject=Patient/${props.patient_resource_id}`;
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("fhiruser:change-password"),
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch MedicationAdministration resource.");
      return;
    }

    const searchData = await response.json();

    if (!searchData?.entry?.length) {
      setAdministrationHistory([]);
      return;
    }

    // STEP 1 — Fetch raw rows first
    let rawAdmins = await Promise.all(
      searchData.entry.map(async (entry: { resource: any }) => {
        const admin = entry.resource;
        const requestRef = admin.request?.reference;

        let requestData = null;

        // Fetch linked MedicationRequest for details
        if (requestRef) {
          const reqResp = await fetch(
            `${import.meta.env.VITE_FHIRAPI_URL}/${requestRef}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("fhiruser:change-password"),
              },
            }
          );

          if (reqResp.ok) requestData = await reqResp.json();
        }

        // Extract fields we store
        const ext = requestData?.extension || [];
        const orderType =
          requestData?.category?.[0]?.coding?.[0]?.display ||
          requestData?.category?.[0]?.coding?.[0]?.code ||
          "Regular";

        const frequency1 =
          ext.find((e: any) => e.url.includes("frequencyLabel"))
            ?.valueString ?? "N/A";

        const concentration =
          ext.find((e: any) => e.url.includes("concentration"))
            ?.valueString ?? null;

        const intervalHours =
          ext.find((e: any) => e.url.includes("intervalHours"))
            ?.valueDecimal ?? null;

        const totalDoses =
          ext.find((e: any) => e.url.includes("totalDoses"))
            ?.valueInteger ?? 0;

        return {
          id: admin.id,
          name: admin.medicationCodeableConcept?.text || "N/A",
          status: admin.status || "N/A",
          effectiveDateTime: admin.effectiveDateTime || "N/A",
          performerName: admin.performer?.[0]?.actor?.display || "N/A",
          requestReference: requestRef || "N/A",

          // medication details
          orderType,
          frequency1,
          concentration,
          intervalHours,
          totalDoses,
        };
      })
    );

    // STEP 2 — Group by requestReference
    const grouped: Record<string, any[]> = {};

    rawAdmins.forEach((row) => {
      if (!grouped[row.requestReference]) grouped[row.requestReference] = [];
      grouped[row.requestReference].push(row);
    });

    // STEP 3 — Sort each group by time and assign administeredCount
    let finalRows: any[] = [];

    Object.values(grouped).forEach((group: any) => {
      group.sort(
        (a: any, b: any) =>
          new Date(a.effectiveDateTime).getTime() -
          new Date(b.effectiveDateTime).getTime()
      );

      group.forEach((row: any, index: number) => {
        row.administeredCount = index + 1; // 1,2,3...
        finalRows.push(row);
      });
    });
finalRows.sort((a, b) =>
  new Date(b.effectiveDateTime).getTime() -
  new Date(a.effectiveDateTime).getTime()
);
    setAdministrationHistory(finalRows);
    // Sort newest → oldest




  } catch (error) {
    console.error("Error fetching MedicationAdministration:", error);
  } finally {
    setLoading(false);
  }
};
*/
const fetchAdminister = async () => {
  setLoading(true);
  try {
    const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration?subject=Patient/${props.patient_resource_id}`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("fhiruser:change-password"),
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch MedicationAdministration");
      return;
    }

    const searchData = await response.json();
    if (!searchData?.entry?.length) {
      setAdministrationHistory([]);
      return;
    }

    const histories: AdministrationHistoryItem[] = [];

    for (const entry of searchData.entry) {
      const admin = entry.resource;

      const requestRef = admin.request?.reference; // MedicationRequest/123
      let reqData = null;

      if (requestRef) {
        const reqResponse = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/${requestRef}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
          }
        );
        if (reqResponse.ok) reqData = await reqResponse.json();
      }

      // Extract fields from MedicationRequest
      let dosage = "N/A",
        route = "N/A",
        indication = "N/A",
        frequency1 = "N/A",
        duration = "N/A",
        startDate="N/A",
        endDate="N/A",
        concentration="N/A",
        intervalHours="N/A",
        orderType="N/A";
      if (reqData) {
        const ext = reqData.extension || [];

     console.log("REQ EXTENSIONS for", reqData.id, reqData.extension);

        
         orderType =
                ext.find((e: any) =>
                  e.url.includes("orderType")
                )?.valueString ?? orderType;

  // Concentration
   concentration =
            ext.find((e: any) =>
                e.url.includes("concentration")
              )?.valueString ?? concentration;  

        frequency1 =
  ext.find((e: any) => e.url.includes("frequency1"))?.valueString ||
  reqData?.dosageInstruction?.[0]?.timing?.repeat?.frequency ||
  reqData?.dosageInstruction?.[0]?.timing?.code?.text ||
  "N/A";

 intervalHours =
  ext.find(
    (e: any) =>
      e.url === "http://example.org/fhir/StructureDefinition/intervalHours"
  )?.valueDecimal ??
  ext.find(
    (e: any) =>
      e.url === "http://example.org/fhir/StructureDefinition/intervalHours"
  )?.valueInteger ??
  ext.find(
    (e: any) =>
      e.url.toLowerCase().includes("interval")
  )?.valueDecimal ??
  ext.find(
    (e: any) =>
      e.url.toLowerCase().includes("interval")
  )?.valueInteger ??
  null;


  // Standard FHIR Timing.repeat (period + periodUnit)
 dosage= 
  ext.find((e: any) => e.url.includes("doseAmount"))
    ? `${ext.find((e: any) => e.url.includes("doseAmount")).valueQuantity.value} ${ext.find((e: any) => e.url.includes("doseAmount")).valueQuantity.unit}`
    : "N/A";

       

        route =
  reqData?.dosageInstruction?.[0]?.route?.text ||
  ext.find((e: any) => e.url.includes("route"))?.valueString ||
  reqData?.dosageInstruction?.[0]?.route?.coding?.[0]?.display ||
  reqData?.dosageInstruction?.[0]?.route?.coding?.[0]?.code ||
  "N/A";

        indication =
          reqData?.reasonCode?.[0]?.text ??
          indication;

        duration =
          reqData?.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod
            ?.duration ??
          duration;

       // Extract startDate from MedicationRequest (3 possible locations)
startDate =
  reqData?.dispenseRequest?.validityPeriod?.start ||
  reqData?.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod?.start ||
  ext.find((e: any) => e.url.includes("startDate"))?.valueDateTime ||
  null;

// Extract endDate similarly
endDate =
  reqData?.dispenseRequest?.validityPeriod?.end ||
  reqData?.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod?.end ||
  ext.find((e: any) => e.url.includes("endDate"))?.valueDateTime ||
  null;

      }

      histories.push({
        id: admin.id,
        versionId: admin.meta?.versionId || "N/A",
        name: admin.medicationCodeableConcept?.text || "N/A",
        status: admin.status,
        effectiveDateTime: admin.effectiveDateTime,
        performerName: admin.performer?.[0]?.actor?.display || "N/A",
        patientReference: admin.subject?.reference,
        requestReference: requestRef || "N/A",

        dosage,
        route,
        indication,
        frequency1,
        duration,
        startDate,
        endDate,
        orderType,
        concentration,
        intervalHours,
      });
    }

    setAdministrationHistory(histories);
  } catch (err) {
    console.error("Error fetching administer:", err);
  } finally {
    setLoading(false);
  }
};

  
 const fetchPrescription = async () => {
  setLoading(true);
  try {
    const previous = prescriptionHistory || []; // ✅ keep old local values

    const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest?subject=Patient/${props.patient_resource_id}&_count=100`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("fhiruser:change-password"),
      },
    });

    if (!response.ok) {
      console.error("❌ Failed to fetch MedicationRequest:", response.statusText);
      return;
    }

    const searchData = await response.json();
    console.log("📦 MedicationRequest bundle:", searchData);

    if (!searchData?.entry?.length) {
      setPrescriptionHistory([]);
      return;
    }

    const medicationData: MedicationItem[] = searchData.entry.map(
      (entry: { resource: any }): MedicationItem => {
        const medication = entry.resource;
        const extensions = medication.extension || [];
        const getExt = (url: string) =>
          extensions.find((ext: any) => ext.url === url);

        // ✔ get old record to preserve UI values not returned by FHIR
        const old = previous.find(m => m.id === medication.id);

        const rawFreq =
          medication.dosageInstruction?.[0]?.timing?.repeat?.frequency;
        const frequency = rawFreq ? String(rawFreq) : (old?.frequency ?? "N/A");

        const start =
          medication.dispenseRequest?.validityPeriod?.start ||
          medication.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod
            ?.start ||
          old?.startDate ||
          "";
        const nextDoseExt =
  getExt("http://example.org/fhir/StructureDefinition/nextDoseTime")
    ?.valueDateTime || null;

        const end =
          medication.dispenseRequest?.validityPeriod?.end ||
          medication.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod?.end ||
          old?.endDate ||
          "";
        
        const safeFreq = typeof rawFreq === "number" ? rawFreq : old?.frequency || 0;

        return {
          id: medication.id,
          name: medication.medicationCodeableConcept?.text || old?.name || "N/A",

          frequency,
          frequency1:
            getExt("http://example.org/fhir/StructureDefinition/frequencyLabel")
              ?.valueString ??
            old?.frequency1 ??
            "N/A",

          route:
            medication.dosageInstruction?.[0]?.route?.coding?.[0]?.display ||
            old?.route ||
            "N/A",

          startDate: start,
          endDate: end,

          use: medication.reasonCode?.[0]?.text || old?.use || "N/A",
          additionalNote: medication.note?.[0]?.text || old?.additionalNote || "N/A",

          intervals:
            calculateIntervals(start || "", end || "", safeFreq).map(d =>
              d instanceof Date ? d.toISOString() : String(d)
            ) || old?.intervals || [],

          totalDoses:
            getExt("http://example.org/fhir/StructureDefinition/totalDoses")
              ?.valueInteger ?? old?.totalDoses ?? 0,

          administeredCount:
            getExt("http://example.org/fhir/StructureDefinition/administeredCount")
              ?.valueInteger ?? old?.administeredCount ?? 0,

          adminOver:
            getExt("http://example.org/fhir/StructureDefinition/deliveryRate")
              ?.valueQuantity?.value ?? old?.adminOver ?? null,

          concentration:
            getExt("http://example.org/fhir/StructureDefinition/concentration")
              ?.valueString ??
            old?.concentration ??
            null,

          intervalHours:
            getExt("http://example.org/fhir/StructureDefinition/intervalHours")
              ?.valueDecimal ??
            old?.intervalHours ??
            null,

          orderType:
            (() => {
              const cat = medication.category?.[0]?.coding?.[0];

              if (cat?.display?.trim()) return cat.display;
              if (cat?.text?.trim()) return cat.text;
              if (cat?.code?.trim()) return cat.code.toUpperCase();

              const ext = medication.extension?.find((e: any) =>
                e.url.toLowerCase().includes("order-type")
              );
              if (ext?.valueString) return ext.valueString;

              return old?.orderType ?? "Regular";
            })(),

          statusDetail:
  getExt("http://example.org/fhir/StructureDefinition/medicationStatusDetail")
    ?.valueString || "ongoing",
nextDose: nextDoseExt ? new Date(nextDoseExt) : null,

        };
      }
    );

    medicationData.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    // Final normalized list
    const normalized: Medication[] = medicationData.map(item => ({
      ...item,
    }));

    setPrescriptionHistory(normalized);
    console.log("✅ Final Prescription List:", normalized);

  } catch (error) {
    console.error("💥 Error fetching MedicationRequest:", error);
  } finally {
    setLoading(false);
  }
};


 // Put this inside your component where you compute filteredMedications

//   const handlePrescribe = async () => {
//     setLoading(true);
  
//     const period = frequency === 'Q12H' ? 12 : frequency === 'Q8H' ? 8 : frequency === 'Q6H' ? 6 : 12;
//     console.log("Total frequency (hours between doses):", period);
//   if (!startDate || !endDate) {
//   setSnackbarMessage("Start date and end date must be provided.");
//   setSnackbarSeverity("error");
//   setSnackbarOpen(true);
//   setLoading(false);
//   return;
// }

// const start = new Date(startDate);
// const end = new Date(endDate);
//     console.log("Start Date:", start, "End Date:", end);
  
//     const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
//     console.log("Total days:", totalDays);
  
//     const dosesPerDay = Math.floor(24 / period);
//     const totalDoses = (dosesPerDay * totalDays) + 1;
//     console.log("Total doses:", totalDoses);
//     console.log("indication:", indication);
//      console.log("selectedDrugCategory:", selectedDrugCategory);
  
//     const prescriptionData = {
//       resourceType: "MedicationRequest",
//       id: medicationResourceId || undefined,
//       status: "active",
//       intent: "order",
//       medicationCodeableConcept: { text: selectedDrugName },
//       subject: { reference: `Patient/${props.patient_resource_id}`, display: props.patient_name },
//       requester: { reference: "Practitioner/12345" },
//       dosageInstruction: [{
//         text: `${dose} mg every ${frequency}`,
//         doseAndRate: [{ doseQuantity: { value: Number(dose), unit: "mg" } }],
//         timing: { repeat: { frequency: period, periodUnit: "d" } },
//         route: {
//           coding: [{
//             system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
//             code: route.toLowerCase(),
//             display: route,
//           }]
//         }
//       }],
//       reasonCode: [{ text: selectedDrugUse }],
//       note: [{ text: additionalNote }],
//       dispenseRequest: {
//         validityPeriod: { start: startDate, end: endDate },
//         expectedSupplyDuration: { value: totalDays, unit: "days", system: "http://unitsofmeasure.org", code: "d" }
//       },
//       extension: [
//         { url: "http://example.org/fhir/StructureDefinition/totalDoses", valueInteger: totalDoses },
//         { url: "http://example.org/fhir/StructureDefinition/administeredCount", valueInteger: 0 }
//       ]
//     };
  
//     try {
//       const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Basic " + btoa("fhiruser:change-password"),
//         },
//         body: JSON.stringify(prescriptionData),
//       });
  
//       if (response.ok) {
//         const contentType = response.headers.get("Content-Type");
//         let responseData = null;
  
//         if (contentType && contentType.includes("application/json")) {
//           responseData = await response.json();
//         }
  
//         setMedicationResourceId(responseData?.id || null);
//         console.log("Prescription saved successfully:", responseData);
//         setSnackbarMessage("Prescription saved successfully!");
//         setSnackbarSeverity("success");
//         setSnackbarOpen(true);
//         fetchPrescription();
//       } else {
//         const errorBody = await response.text();
//         console.error("Error response:", response.status, response.statusText, errorBody);
//         throw new Error(`Request failed: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error("Error saving Prescription resource:", error);
//       setSnackbarMessage("An error occurred while saving the Prescription.");
//       setSnackbarSeverity("error");
//       setSnackbarOpen(true);
//     } finally {
//       setLoading(false);
//     }
//   };
  
// Helper function to calculate duration in days

const handlePrescribe = async () => {
  setLoading(true);

  const period =
    frequency === "Q12H"
      ? 12
      : frequency === "Q8H"
      ? 8
      : frequency === "Q6H"
      ? 6: frequency === "Q36H"
      ? 36: frequency === "Q42H"
      ? 42: frequency === "Q24H"
      ? 24: frequency === "Q18H"
      ? 18: frequency === "Q30H"
      ? 30: frequency === "Q15H"
      ? 15: frequency === "Q48H"
      ? 48: frequency === "Q72H"
      ? 72: frequency === "Q54H"
      ? 54
      : 12;

  if (!startDate || !endDate) {
    setSnackbarMessage("Start date and end date must be provided.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    setLoading(false);
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const dosesPerDay = Math.max(1, Math.floor(24 / period));

  const totalDoses = dosesPerDay * totalDays + 1;
//const result = checkIncompatibilities(selectedDrug, prescriptionHistory);

/*if (result.conflicts.length > 0) {
  showIncompatDialog({
    conflicts: result.conflicts,
    ruleDrugName:
      selectedDrug.original?.drug_name || selectedDrug.original?.name || ""
  });
  return; // stop until user overrides
}*/

  // ✅ Construct FHIR resource
  const prescriptionData = {
    resourceType: "MedicationRequest",
    id: medicationResourceId || undefined,
    status: "active",
    intent: "order",
    category: [
    {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/medicationrequest-category",
          code: ordertype ? ordertype.toLowerCase() : "regular",
          display: ordertype || "Regular",
        },
      ],
    },
  ],
    medicationCodeableConcept: { text: selectedDrugName },
    subject: {
      reference: `Patient/${props.patient_resource_id}`,
      display: props.patient_name,
    },
    requester: { reference: "Practitioner/12345" },
   reasonCode: selectedDrugUse
  ? [{ text: selectedDrugUse }]
  : undefined,
note: additionalNote && additionalNote.trim() !== ""
  ? [{ text: additionalNote.trim() }]
  : undefined,


    dosageInstruction: [
      {
        text: `${dose} ${unit} every ${frequency}`,
        route: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
              code: route.toLowerCase(),
              display: route,
            },
          ],
        },
        timing: {
          repeat: {
            frequency: dosesPerDay,
            period: 1,
            periodUnit: "d",
            boundsPeriod: {
              start: startDate,
              end: endDate,
            },
          },
        },
        doseAndRate: [
          {
            type: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/dose-rate-type",
                  code: "ordered",
                  display: "Ordered",
                },
              ],
            },
            doseQuantity: {
              value: Number(dose),
              unit: unit,
              system: "http://unitsofmeasure.org",
              code: unit,
            },
            rateQuantity:
              route.toUpperCase() === "IV"
                ? {
                    value: Number(deliveryRate),
                    unit: "mL/hr",
                    system: "http://unitsofmeasure.org",
                    code: "mL/h",
                  }
                : undefined,
          },
        ],
      },
    ],

    dispenseRequest: {
      validityPeriod: { start: startDate, end: endDate },
      expectedSupplyDuration: {
        value: totalDays,
        unit: "days",
        system: "http://unitsofmeasure.org",
        code: "d",
      },
    },

    extension: [
  {
    url: "http://example.org/fhir/StructureDefinition/totalDoses",
    valueInteger: totalDoses,
  },
  {
    url: "http://example.org/fhir/StructureDefinition/administeredCount",
    valueInteger: 0,
  },
  {
    url: "http://example.org/fhir/StructureDefinition/frequencyLabel",
    valueString: frequency,
  },
  intervalHours
    ? {
        url: "http://example.org/fhir/StructureDefinition/intervalHours",
        valueDecimal: Number(intervalHours),
      }
    : null,
  gestationalAge
    ? {
        url: "http://example.org/fhir/StructureDefinition/gestationalAge",
        valueString: gestationalAge,
      }
    : null,
  weight
    ? {
        url: "http://example.org/fhir/StructureDefinition/weight",
        valueQuantity: {
          value: Number(weight),
          unit: "kg",
          system: "http://unitsofmeasure.org",
          code: "kg",
        },
      }
    : null,
  birthDate
    ? {
        url: "http://example.org/fhir/StructureDefinition/birthDate",
        valueDate: birthDate,
      }
    : null,
  doseAmount
    ? {
        url: "http://example.org/fhir/StructureDefinition/doseAmount",
        valueQuantity: {
          value: Number(doseAmount),
          unit: "mg",
          system: "http://unitsofmeasure.org",
          code: "mg",
        },
      }
    : null,
  doseVolume
    ? {
        url: "http://example.org/fhir/StructureDefinition/doseVolume",
        valueQuantity: {
          value: Number(doseVolume),
          unit: "mL",
          system: "http://unitsofmeasure.org",
          code: "mL",
        },
      }
    : null,
  // ✅ FIX: Only include if route = IV and deliveryRate > 0
  route?.toUpperCase() === "IV" && deliveryRate
    ? {
        url: "http://example.org/fhir/StructureDefinition/deliveryRate",
        valueQuantity: {
          value: Number(deliveryRate),
          unit: "mL/hr",
          system: "http://unitsofmeasure.org",
          code: "mL/h",
        },
      }
    : null,
  admin
    ? {
        url: "http://example.org/fhir/StructureDefinition/admin",
        valueString: admin.trim(),
      }
    : null,
  conc
    ? {
        url: "http://example.org/fhir/StructureDefinition/concentration",
        valueString: String(conc).trim(),
      }
    : null,
  doseperday
    ? {
        url: "http://example.org/fhir/StructureDefinition/dosePerDay",
        valueString: doseperday.trim(),
      }
    : null,
  selectedDrugCategory
    ? {
        url: "http://example.org/fhir/StructureDefinition/drugCategory",
        valueString: selectedDrugCategory.trim(),
      }
    : null,
].filter(Boolean),
// remove any undefined extensions
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(prescriptionData),
        
      }
    );
console.log(prescriptionData)
    if (response.ok) {
      const contentType = response.headers.get("Content-Type");
      let responseData = null;

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      }

      setMedicationResourceId(responseData?.id || null);
      console.log("✅ Prescription saved successfully:", responseData);
      setSnackbarMessage("Prescription saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchPrescription();
    } else {
      const errorBody = await response.text();
      console.error("❌ Error response:", response.status, response.statusText, errorBody);
      throw new Error(`Request failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("💥 Error saving Prescription resource:", error);
    setSnackbarMessage("An error occurred while saving the Prescription.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  } finally {
    setLoading(false);
    setOpenPrescribeModal(false);
  }
};

const calculateDuration = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to calculate next dose date
// const calculateNextDoseDate = (
//   startDate: string,
//   frequency: number,
//   administeredCount: number
// ): Date | null => {
//   if (!startDate || frequency <= 0) return null;
  
//   const start = new Date(startDate);
//   const hoursBetweenDoses = 24 / frequency;
//   const hoursToAdd = hoursBetweenDoses * administeredCount;
  
//   const nextDate = new Date(start);
//   nextDate.setHours(nextDate.getHours() + hoursToAdd);
  
//   return nextDate;
// };
  // const handlePrescribe = async () => {
  //   setLoading(true);
  
  //   const period = frequency === 'Q12H' ? 12 : frequency === 'Q8H' ? 8 : frequency === 'Q6H' ? 6 : 12;
  
  //   // Existing logic to calculate total doses...
  //   const prescriptionData = {
  //     resourceType: "MedicationRequest",
  //     id: medicationResourceId || undefined,
  //     status: "active",
  //     intent: "order",
  //     medicationCodeableConcept: {
  //       text: selectedDrugName,
  //     },
  //     subject: {
  //       reference: `Patient/${props.patient_resource_id}`,
  //       display: props.patient_name,
  //     },
  //     requester: {
  //       reference: "Practitioner/12345", // Replace with actual Practitioner ID
  //     },
  //     dosageInstruction: [
  //       {
  //         text: `${dose} mg ${route} every ${frequency}`,
  //         doseAndRate: [
  //           {
  //             doseQuantity: {
  //               value: Number(dose),
  //               unit: "mg",
  //             },
  //           },
  //         ],
  //         timing: {
  //           repeat: {
  //             frequency: period,  
  //             period: 1,
  //             periodUnit: "d",
  //           },
  //         },
  //         route: {
  //           coding: [
  //             {
  //               system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
  //               code: route.toLowerCase(),
  //               display: route,
  //             },
  //           ],
  //         },
  //       },
  //     ],
  //     reasonCode: [
  //       {
  //         text: selectedDrugUse,
  //       },
  //     ],
  //     note: [
  //       {
  //         text: additionalNote,
  //       },
  //     ],
  //     dispenseRequest: {
  //       validityPeriod: {
  //         start: startDate,
  //         end: endDate,
  //       },
  //       expectedSupplyDuration: {
  //         value: totalDays,
  //         unit: "days",
  //         system: "http://unitsofmeasure.org",
  //         code: "d",
          
  //       },
  //     },
  //     // Custom extension to store total doses and administered count
  //     extension: [
  //       {
  //         url: "http://example.org/fhir/StructureDefinition/totalDoses",
  //         valueInteger: totalDoses,
  //       },
  //       {
  //         url: "http://example.org/fhir/StructureDefinition/administeredCount",
  //         valueInteger: 0,
  //       },
  //     ],
  //   };
  
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //       body: JSON.stringify(prescriptionData),
  //     });
  
  //     if (response.ok) {
  //       const responseData = await response.json();
  //       setMedicationResourceId(responseData?.id || null);
  //       console.log("Prescription saved successfully:", responseData);
  
  //       // Add the newly prescribed medication directly to the UI
      
  
  //       setSnackbarMessage("Prescription saved successfully!");
  //       setSnackbarSeverity("success");
  //       setSnackbarOpen(true);
  //     } else {
  //       const errorBody = await response.text();
  //       console.error("Error response body:", errorBody);
  //       throw new Error(`Request failed: ${response.statusText}`);
  //     }
  //   } catch (error) {
  //     console.error("Error saving Prescription resource:", error);
  //     setSnackbarMessage("An error occurred while saving the Prescription.");
  //     setSnackbarSeverity("error");
  //     setSnackbarOpen(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  
  // const handleAdminister = async (medicationResourceId: string) => {
  //   console.log("medicationId:", medicationResourceId);  // Log the value of medicationId
  //   setAdministering(true);
    
  //   setCurrentMedicationId(medicationResourceId);
  
  //   try {
  //     // Fetch MedicationRequest to get current count and total doses
  //     const medicationRequestResponse = await fetch(
  //       `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         },
  //       }
  //     );
  
  //     if (!medicationRequestResponse.ok) {
  //       console.error("Failed to fetch MedicationRequest resource.");
  //       setSnackbarMessage("Failed to fetch MedicationRequest.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     const medicationRequest = await medicationRequestResponse.json();
  //     const extensions = medicationRequest.extension || [];
  //     const totalDoses = extensions.find(
  //       (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/totalDoses"
  //     )?.valueInteger;
  //     const administeredCount = extensions.find(
  //       (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/administeredCount"
  //     )?.valueInteger;
  
  //     if (administeredCount === undefined || totalDoses === undefined) {
  //       console.error("MedicationRequest does not have totalDoses or administeredCount.");
  //       setSnackbarMessage("Invalid MedicationRequest: Missing dose tracking information.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     // Update administered count
  //     const updatedAdministeredCount = administeredCount + 1;
  //     const status = updatedAdministeredCount >= totalDoses ? "completed" : "active";
  
  //     const updatedRequest = {
  //       ...medicationRequest,
  //       extension: [
  //         {
  //           url: "http://example.org/fhir/StructureDefinition/totalDoses",
  //           valueInteger: totalDoses,
  //         },
  //         {
  //           url: "http://example.org/fhir/StructureDefinition/administeredCount",
  //           valueInteger: updatedAdministeredCount,
  //         },
  //       ],
  //       status,
  //     };
  
  //     // Update MedicationRequest on FHIR server
  //     const updateResponse = await fetch(
  //       `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         },
  //         body: JSON.stringify(updatedRequest),
  //       }
  //     );
  
  //     if (updateResponse.ok) {
  //       console.log(`Medication administered successfully: ${updatedAdministeredCount}/${totalDoses}`);
  //       setSnackbarMessage(`Medication administered: ${updatedAdministeredCount}/${totalDoses}`);
  //       setSnackbarSeverity("success");
  
  //       // Update local state for real-time reflection
  //       setPrescriptionHistory((prevHistory) =>
  //         prevHistory.map((medication) =>
  //           medication.id === medicationResourceId
  //             ? {
  //                 ...medication,
  //                 administeredCount: updatedAdministeredCount,
  //                 status: updatedAdministeredCount >= totalDoses ? "completed" : "active",
  //               }
  //             : medication
  //         )
  //       );
  //     } else {
  //       console.error("Failed to update MedicationRequest:", await updateResponse.text());
  //       setSnackbarMessage("Failed to update MedicationRequest.");
  //       setSnackbarSeverity("error");
  //     }
  //   } catch (error) {
  //     console.error("Error administering medication:", error);
  //     setSnackbarMessage("An error occurred while administering the medication.");
  //     setSnackbarSeverity("error");
  //   } finally {
  //     setAdministering(false);
  //     setCurrentMedicationId(null);
  //     setSnackbarOpen(true);
  //   }
  // };
const handleAdminister = async (medicationResourceId: string) => {
  console.log("MedicationResourceId:", medicationResourceId);
  setAdministering(true);
  setCurrentMedicationId(medicationResourceId);

  try {
    // 1️⃣ Fetch MedicationRequest
    const medicationRequestResponse = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      }
    );

    if (!medicationRequestResponse.ok) {
      console.error("Failed to fetch MedicationRequest resource.");
      setSnackbarMessage("Failed to fetch MedicationRequest.");
      setSnackbarSeverity("error");
      return;
    }

    const medicationRequest = await medicationRequestResponse.json();
    // 2️⃣ Extract extensions for dose tracking
    const extensions = medicationRequest.extension || [];
    const totalDoses = extensions.find(
      (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/totalDoses"
    )?.valueInteger;

    const administeredCount = extensions.find(
      (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/administeredCount"
    )?.valueInteger;

    if (administeredCount === undefined || totalDoses === undefined) {
      setSnackbarMessage("Invalid MedicationRequest: Missing dose tracking information.");
      setSnackbarSeverity("error");
      return;
    }

    // 3️⃣ Compute next dose time
    let nextDoseTime = null;
    const dosageInstruction = medicationRequest.dosageInstruction?.[0];

    if (dosageInstruction?.timing?.repeat?.period && dosageInstruction?.timing?.repeat?.periodUnit) {
      const { period, periodUnit } = dosageInstruction.timing.repeat;

      const unitMap: Record<string, number> = {
        s: 1000,
        min: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
      };

      const now = new Date();
      const intervalMs = (unitMap[periodUnit] || 0) * period;

      if (intervalMs > 0) nextDoseTime = new Date(now.getTime() + intervalMs).toISOString();
    }
// Extract intervalHours before overwriting extensions


    // 5️⃣ Update dose count & status in MedicationRequest
    const updatedAdministeredCount = administeredCount + 1;
    const status =
      updatedAdministeredCount >= totalDoses ? "completed" : "active";
    const statusDetail =
      updatedAdministeredCount >= totalDoses ? "completed" : "ongoing";

   // START by copying old extensions
let newExtensions = [...(medicationRequest.extension || [])];

// Replace or insert updated fields
function upsertExtension(url: string, valueKey: string, value: any) {
  const idx = newExtensions.findIndex((e) => e.url === url);

  if (idx !== -1) {
    newExtensions[idx] = { url, [valueKey]: value };
  } else {
    newExtensions.push({ url, [valueKey]: value });
  }
}

// Update the required extensions
upsertExtension(
  "http://example.org/fhir/StructureDefinition/totalDoses",
  "valueInteger",
  totalDoses
);

upsertExtension(
  "http://example.org/fhir/StructureDefinition/administeredCount",
  "valueInteger",
  updatedAdministeredCount
);

upsertExtension(
  "http://example.org/fhir/StructureDefinition/medicationStatusDetail",
  "valueString",
  statusDetail
);

if (nextDoseTime) {
  upsertExtension(
    "http://example.org/fhir/StructureDefinition/nextDoseTime",
    "valueDateTime",
    nextDoseTime
  );
}

// NOW apply updated extensions
const updatedRequest = {
  ...medicationRequest,
  extension: newExtensions,
  status,
};


    const updateResponse = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(updatedRequest),
      }
    );

    if (!updateResponse.ok) {
      console.error("Failed to update MedicationRequest");
      setSnackbarMessage("Failed to update MedicationRequest.");
      setSnackbarSeverity("error");
      return;
    }

    // 6️⃣ ALWAYS CREATE NEW MedicationAdministration ENTRY
    const nowIso = new Date().toISOString();

    const administerData = {
      resourceType: "MedicationAdministration",
      status: "completed",
      medicationReference: medicationRequest.medicationReference
        ? { reference: medicationRequest.medicationReference.reference }
        : undefined,
      medicationCodeableConcept:
        medicationRequest.medicationCodeableConcept || undefined,
      request: { reference: `MedicationRequest/${medicationResourceId}` },
      subject: { reference: `Patient/${props.patient_resource_id}` },
      performer: [
        {
          actor: {
            reference: "Practitioner/12345",
            display: `${props.UserRole}`,
          },
        },
      ],
      effectiveDateTime: nowIso,
    };

    const createResponse = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(administerData),
      }
    );

    if (!createResponse.ok) {
      console.error("Failed to create MedicationAdministration");
      setSnackbarMessage("Failed to record administration.");
      setSnackbarSeverity("error");
      return;
    }

    console.log("✔ New administration stored");

    setSnackbarMessage(
      `Medication administered: ${updatedAdministeredCount}/${totalDoses}`
    );
    setSnackbarSeverity("success");

    fetchPrescription();
    fetchAdminister();
  } catch (error) {
    console.error("Error administering medication:", error);
    setSnackbarMessage("An error occurred while administering the medication.");
    setSnackbarSeverity("error");
  } finally {
    setAdministering(false);
    setCurrentMedicationId(null);
    setSnackbarOpen(true);
  }
};



  useEffect(() => {
    fetchPrescription();
    setStatusFilter("ongoing");
    fetchAdminister(); //Fetch Procedure on component mount or when `patient_resource_id` changes
  }, [props.patient_resource_id]);
  
  useEffect(() => {
    if (!props.gestational_age) return;
  
    // Match patterns like "22W 3D"
    const match = props.gestational_age.match(/(\d+)\s*W\s*(\d+)\s*D/i);
  
    if (match) {
      const weeks = match[1];
      const days = match[2];
  
      setGaWeeks(weeks);
      setGaDays(days);
  
      // Store internal format if needed
      setGestationalAge(`${weeks}.${days}`);
    }
  }, [props.gestational_age]);
  

  return (
    
    <Box sx={{  borderRadius: "25px"}}>
    
    {/* {props.UserRole !== "NICU Nurse" && ( */}
    <ProtectedModule module="Medications" action="create">
    <Dialog
  open={weekDialogOpen}
   onClose={(event, reason) => {
    if (reason === "backdropClick") return;   // ❌ Block backdrop close
    if (reason === "escapeKeyDown") return;   // ❌ Block ESC key close
    setWeekDialogOpen(false);                 // Only allow programmatic close
  }}
  PaperProps={{
    sx: {
      width: "360px",
      borderRadius: "12px",
      backgroundColor: "#FFFFFF",
      boxShadow: "0px 4px 20px rgba(0,0,0,0.15)"
    }
  }}
  BackdropProps={{
    sx: {
      backgroundColor: "rgba(0,0,0,0.3)",
      backdropFilter: "blur(4px)"   //  blur background
    }
  }}
>
  {/* --- TOP BAR WITH TITLE + CLOSE BUTTON --- */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #e2e8f0",
      p: 2
    }}
  >
    <Typography variant="h6" sx={{ color: "#124D81", fontWeight: 600 }}>
      Choose Week to Print
    </Typography>

    {/* CLOSE BUTTON */}
   <IconButton
    onClick={() => setWeekDialogOpen(false)}
    sx={{
     color:"#2b476bff",
      "&:hover": { backgroundColor: "#2b476bff" }
    }}
  >
    <CloseIcon fontSize="small" />
  </IconButton>
  </Box>

  {/* --- CONTENT --- */}
  <DialogContent
    dividers
    sx={{
      maxHeight: "350px",
      backgroundColor: "#fff",
      p: 1
    }}
  >
    {weekBlocks
      .slice()         // Copy array
      .reverse()       // Reverse order → recent weeks shown first
      .map((block, index) => {
        const start = block.start.toLocaleDateString("en-GB");
        const end = block.end.toLocaleDateString("en-GB");

        return (
          <Box
  key={index}
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    p: 1.5,
    mb: 1,
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    transition: "0.2s",
    position: "relative",
    "&:hover": {
      backgroundColor: "#edf2f7",
      boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
      cursor: "pointer"
    }
  }}
>
  {/* Left - Date block */}
  <Box
    onClick={() => handleSelectWeek(block.start)}
    sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}
  >
    <CalendarMonthIcon sx={{ color: "#124D81" }} />
    <Typography sx={{ color: "#0F3B61", fontWeight: 500 }}>
      {start} - {end}
    </Typography>
  </Box>

  {/* Download icon */}
  <DownloadIcon
    onClick={() => handleSelectWeek(block.start)}
    sx={{ color: "#124D81", mr: 4 }}
  />

  {/* Close icon inside the row */}
  
</Box>

        );
      })}
  </DialogContent>
</Dialog>


   <Dialog open={openUpcomingDialog} onClose={() => setOpenUpcomingDialog(false)}>
  <DialogTitle sx={{ fontWeight: 600, color: "#124D81" }}>
    Administer Before Scheduled Time?
  </DialogTitle>

  <DialogContent>
    <Typography sx={{ color: "#5A6B80" }}>
      This medication is scheduled for:
    </Typography>

    <Typography sx={{ fontWeight: 600, mt: 1 }}>
      {upcomingWarningMed?.nextDoseTime &&
        new Date(upcomingWarningMed.nextDoseTime).toLocaleString()}
    </Typography>

    <Typography sx={{ mt: 2, color: "#6B7A90" }}>
      You are attempting to administer earlier than prescribed.
      Do you want to continue?
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenUpcomingDialog(false)}
      variant="outlined" sx={{ borderColor: "#124D81", color: "#124D81" }}>
      Cancel
    </Button>

    <Button variant="contained"
      sx={{ backgroundColor: "#124D81" }}
      onClick={() => {
        setOpenUpcomingDialog(false);
        openAdministerPopup(upcomingWarningMed);
      }}>
      Continue
    </Button>
  </DialogActions>
</Dialog>


     {/* 🔹 Prescribe button aligned top-right */}
  <Dialog
  open={openIncompatDialog}
  onClose={(event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return; // prevent closing
    }
    setOpenIncompatDialog(false);
  }}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      borderRadius: "14px",
      backgroundColor: "#FFFFFF",
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
    },
  }}
>
  <DialogTitle
    sx={{
      fontWeight: 700,
      fontSize: "1.2rem",
      color: "#124D81",
      borderBottom: "1px solid #E6EAF0",
      backgroundColor: "#FFFFFF",
      paddingY: 2,
    }}
  >
    Injection Site Incompatibility
  </DialogTitle>

  <DialogContent
    dividers
    sx={{
      backgroundColor: "#FFFFFF",
      padding: 3,
    }}
  >
    {/* Drug name - shown only once, bold and clean */}
    <Typography sx={{ mb: 1.5 }}>
      The selected drug{" "}
      <strong style={{ color: "#124D81" }}>
        {incompatData?.ruleDrugName}
      </strong>{" "}
      is incompatible with the following active medications:
    </Typography>

    {/* Deduplicate conflict list */}
    {[...new Set(incompatData?.conflicts?.map((c: any) => c.activeName))].map(
      (name: string, i: number) => (
        <Box key={i} sx={{ mb: 1, pl: 1 }}>
          <Typography sx={{ color: "#E63946", fontWeight: 600 }}>
            • {name}
          </Typography>
        </Box>
      )
    )}

    <Typography sx={{ mt: 2, color: "#6B7A90", fontSize: "0.9rem" }}>
      You may cancel to choose another drug, or override to continue
      prescribing despite the incompatibility.
    </Typography>
  </DialogContent>

  <DialogActions
    sx={{
      padding: 2,
      borderTop: "1px solid #E6EAF0",
      backgroundColor: "#F9FBFF",
    }}
  >
    <Button
      onClick={() => {
        setOpenIncompatDialog(false);
        resetDrugSelection();
      }}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        color: "#124D81",
      }}
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      sx={{
        textTransform: "none",
        fontWeight: 600,
        color:"#ecf1f5ff",
        backgroundColor: "#124D81",
        "&:hover": { backgroundColor: "#0F3B61" },
      }}
      onClick={() => {
        setOpenIncompatDialog(false);
        processDrugSelection(incompatData.selectedValue);
      }}
    >
      Override & Continue
    </Button>
  </DialogActions>
</Dialog>





  <Dialog
  open={filterDialogOpen}
  onClose={(event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return; // prevent closing
    }
    setFilterDialogOpen(false);
  }}
  disableEscapeKeyDown
  PaperProps={{
    sx: {
      width: "320px",
      borderRadius: "12px",
      padding: "16px",
      backgroundColor: "#FFFFFF",
      color: "#124D81",
    },
  }}
  BackdropProps={{
    sx: {
      backgroundColor: "rgba(0,0,0,0.4)",  // custom darker backdrop
    },
  }}
>


  <Typography variant="h6" sx={{ mb: 2, color: "#124D81" }}>
    Filter by Order Type
  </Typography>

  {[
    "Regular",
    "PRN/SOS",
    "STAT",
    "One-time",
    "Titration",
    "Others",
  ].map((type) => (
    <FormControlLabel
  key={type}
  sx={{ color: "#124D81" }}   // <-- Add this
  control={
    <Checkbox
      checked={orderTypeFilters.includes(type)}
      onChange={(e) => {
        if (e.target.checked) {
          setOrderTypeFilters((prev) => [...prev, type]);
        } else {
          setOrderTypeFilters((prev) =>
            prev.filter((x) => x !== type)
          );
        }
      }}
      sx={{ color: "#124D81" }}
    />
  }
  label={type}
/>

  ))}

  {/* Buttons */}
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      mt: 2,
    }}
  >
    <Button
      variant="outlined"
      onClick={() => {
        setOrderTypeFilters([]);
        setFilterDialogOpen(false);
      }}
      sx={{
        textTransform: "none",
        color: "#124D81",
        borderColor: "#A7C0DA",
        borderRadius: "20px",
        px: 3,
      }}
    >
      Reset
    </Button>

    <Button
      variant="contained"
      onClick={() => setFilterDialogOpen(false)}
      sx={{
        textTransform: "none",
        backgroundColor: "#228BE6",
        borderRadius: "20px",
        px: 3,
      }}
    >
      Apply
    </Button>
  </Box>
</Dialog>
{/* ================= CONFIRMATION POPUP ================= */}
<Dialog
  open={openConfirmDialog}
  onClose={() => setOpenConfirmDialog(false)}
  maxWidth="xs"
  fullWidth
  PaperProps={{
    sx: {
      backgroundColor: "#FFFFFF",
      borderRadius: "14px",
      padding: "16px 20px",
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
      minWidth: "420px",
    },
  }}
>
  {/* TITLE */}
  <DialogTitle
    sx={{
      fontSize: "1.1rem",
      fontWeight: 700,
      color: "#124D81",
      textAlign: "center",
      paddingBottom: 1,
    }}
  >
    {confirmActionType === "hold"
      ? "Put Medication On Hold?"
      : confirmActionType === "resume"
      ? "Resume Medication?"
      : confirmActionType === "cancel"
      ? "Cancel Medication?"
      : ""}
  </DialogTitle>

  {/* DESCRIPTION */}
  <DialogContent sx={{ textAlign: "center", paddingX: 1, paddingBottom: 2 }}>
    <Typography sx={{ fontSize: "0.9rem", color: "#5A6B80" }}>
      Are you sure you want to{" "}
      <strong style={{ color: "#124D81" }}>
        {confirmActionType === "hold"
          ? "Hold"
          : confirmActionType === "resume"
          ? "Resume"
          : "Cancel"}
      </strong>{" "}
      this medication?
    </Typography>
  </DialogContent>

  {/* ACTION BUTTONS */}
  <DialogActions
    sx={{
      justifyContent: "center",
      gap: 2,
      paddingBottom: 1,
    }}
  >
    {/* CLOSE BUTTON */}
    <Button
      variant="outlined"
      sx={{
        textTransform: "none",
        borderRadius: "10px",
        borderColor: "#124D81",
        color: "#124D81",
        paddingX: 3,
        "&:hover": {
          borderColor: "#0F3B61",
          backgroundColor: "#F2F7FC",
        },
      }}
      onClick={() => setOpenConfirmDialog(false)}
    >
      Close
    </Button>

    {/* CONFIRM BUTTON */}
    <Button
      variant="contained"
      sx={{
        textTransform: "none",
        borderRadius: "10px",
        backgroundColor: "#124D81",
        color: "#ffffff",
        paddingX: 3,
        "&:hover": {
          backgroundColor: "#0F3B61",
        },
      }}
      onClick={() => {
        if (confirmActionType === "cancel") {
          handleCancel(confirmMedicationId!);
        }
        else if (confirmActionType === "hold") {
          handleHold(confirmMedicationId!);
        } else if (confirmActionType === "resume") {
          handleResume(confirmMedicationId!);
        } 

        setOpenConfirmDialog(false);
      }}
    >
      Confirm
    </Button>
  </DialogActions>
</Dialog>



<Dialog
  open={openPrescriptionDialog}
  onClose={() => setOpenPrescriptionDialog(false)}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      borderRadius: "14px",
      backgroundColor: "#FFFFFF",
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
      padding: 1,
    },
  }}
>
  <DialogTitle
    sx={{
      fontWeight: 700,
      fontSize: "1.2rem",
      color: "#124D81",
      borderBottom: "1px solid #E6EAF0",
      paddingBottom: 1.5,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    Prescription Details
   
  </DialogTitle>

  <DialogContent dividers sx={{ padding: 3 }}>
    {selectedPrescription && (
      <Grid container spacing={2}>
        {/* Name (readonly) */}
        <Grid item xs={12}>
          <Typography sx={{ fontWeight: 600, color: "#124D81" }}>
            {selectedPrescription.name}
          </Typography>
        </Grid>

        {/* Editable Fields */}
       {/* Dose */}
<Grid item xs={6}>
  <TextField
    label="Dose"
    size="small"
    fullWidth
   value={selectedPrescription.frequency1}
onChange={(e) => editMode && handleEditField("frequency1", e.target.value)}

    InputProps={{
      readOnly: !editMode,
      sx: { color: "#124D81", fontWeight: 600 }
    }}
    InputLabelProps={{ sx: { color: "#6B7A90" } }}
  />
</Grid>

{/* Route */}
<Grid item xs={6}>
  <TextField
    label="Route"
    size="small"
    fullWidth
    value={selectedPrescription.route}
    onChange={(e) => editMode && handleEditField("route", e.target.value)}
    InputProps={{
      readOnly: !editMode,
      sx: { color: "#124D81", fontWeight: 600 }
    }}
    InputLabelProps={{ sx: { color: "#6B7A90" } }}
  />
</Grid>

{/* Start Date */}
<Grid item xs={6}>
  <TextField
    label="Start Date"
    size="small"
    type="datetime-local"
    fullWidth
    value={formatDateForInput(selectedPrescription.startDate)}
    onChange={(e) => editMode && handleEditField("startDate", e.target.value)}
    InputProps={{
      readOnly: !editMode,
      sx: { color: "#124D81", fontWeight: 600 }
    }}
    InputLabelProps={{ sx: { color: "#6B7A90" } }}
  />
</Grid>

{/* End Date */}
<Grid item xs={6}>
  <TextField
    label="End Date"
    size="small"
    type="datetime-local"
    fullWidth
    value={formatDateForInput(selectedPrescription.endDate)}
    onChange={(e) => editMode && handleEditField("endDate", e.target.value)}
    InputProps={{
      readOnly: !editMode,
      sx: { color: "#124D81", fontWeight: 600 }
    }}
    InputLabelProps={{ sx: { color: "#6B7A90" } }}
  />
</Grid>
<Grid item xs={6}>
  <TextField
    label="Order Type"
    size="small"
    fullWidth
    value={selectedPrescription.orderType}
    onChange={(e) => editMode && handleEditField("orderType", e.target.value)}
    InputProps={{
      readOnly: !editMode,
      sx: { color: "#124D81", fontWeight: 600 },
    }}
    InputLabelProps={{ sx: { color: "#6B7A90" } }}
  />
</Grid>
<Grid item xs={6}>
  <TextField
    label="Indication / Use"
    size="small"
    fullWidth
    value={selectedPrescription.use}
    onChange={(e) => editMode && handleEditField("use", e.target.value)}
    InputProps={{
      readOnly: !editMode,
      sx: { color: "#124D81", fontWeight: 600 },
    }}
    InputLabelProps={{ sx: { color: "#6B7A90" } }}
  />
</Grid>
<Grid item xs={6}>
  <TextField
    label="Total Doses"
    size="small"
    fullWidth
    value={selectedPrescription.totalDoses}
    onChange={(e) =>
      editMode && handleEditField("totalDoses", Number(e.target.value))
    }
    InputProps={{
      readOnly: !editMode,
      sx: { color: "#124D81", fontWeight: 600 },
    }}
    InputLabelProps={{ sx: { color: "#6B7A90" } }}
  />
</Grid>
<Grid item xs={6}>
  <TextField
    label="Administered Count"
    size="small"
    fullWidth
    value={selectedPrescription.administeredCount}
    InputProps={{
      readOnly: true,
      sx: { color: "#124D81", fontWeight: 600 },
    }}
    InputLabelProps={{ sx: { color: "#6B7A90" } }}
  />
</Grid>
<Grid item xs={6}>
  <TextField
    label="Concentration"
    size="small"
    fullWidth
    value={selectedPrescription.concentration || "-"}
    onChange={(e) =>
      editMode && handleEditField("concentration", e.target.value)
    }
    InputProps={{
      readOnly: !editMode,
      sx: { color: "#124D81", fontWeight: 600 },
    }}
    InputLabelProps={{ sx: { color: "#6B7A90" } }}
  />
</Grid>
{/* Additional Note */}
<Grid item xs={12}>
  <TextField
    label="Additional Note"
    size="small"
    fullWidth
    multiline
    minRows={2}
    value={selectedPrescription.additionalNote || ""}
    onChange={(e) => editMode && handleEditField("additionalNote", e.target.value)}
    InputProps={{
      readOnly: !editMode,
      sx: { color: "#124D81", fontWeight: 600 }
    }}
    InputLabelProps={{ sx: { color: "#6B7A90" } }}
  />
</Grid>

      </Grid>
    )}
  </DialogContent>

  <DialogActions
    sx={{
      padding: 2,
      borderTop: "1px solid #E6EAF0",
      backgroundColor: "#F9FBFF",
    }}
  >
    <Button
      onClick={() => setEditMode(prev => !prev)}
      variant="outlined"
      size="small"
      sx={{ textTransform: "none"


       }}
    >
      {editMode ? "Cancel Edit" : "Edit"}
    </Button>
   <Button
variant="outlined"
  sx={{ borderRadius: "10px", textTransform: "none" }}
 onClick={() => {
  setConfirmActionType("hold");
  setConfirmMedicationId(selectedPrescription);
  setOpenConfirmDialog(true);
}}


>
  Hold
</Button>

<Button
  variant="outlined"
  
  sx={{ borderRadius: "10px", textTransform: "none" }}
 onClick={() => {
  setConfirmActionType("resume");
  setConfirmMedicationId(selectedPrescription);
  setOpenConfirmDialog(true);
}}


>
  Resume
</Button>
<Button
  variant="outlined"
  color="error"
onClick={() => {
  setConfirmMedicationId(selectedPrescription.id);
  setConfirmActionType("cancel");
  setOpenConfirmDialog(true);
}}

>
  Cancel
</Button>

    <Button
      onClick={() => setOpenPrescriptionDialog(false)}
      sx={{ textTransform: "none", fontWeight: 600, color: "#124D81" }}
    >
      Close
    </Button>
    {editMode && (
      <Button
        variant="contained"
        onClick={handleSaveEdit}
        sx={{ textTransform: "none", fontWeight: 600 }}
      >
        Save
      </Button>
      
    )}
  </DialogActions>
</Dialog>



     <Dialog open={overrideDialog.open}>
  <DialogTitle>You are overriding the value</DialogTitle>
  <DialogContent>
    <Typography>
      Are you sure you want to change this?  
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => {
        // BACK → restore old value
        applyFieldChange(overrideDialog.field, overrideDialog.oldValue);
        setOverrideDialog({ ...overrideDialog, open: false });
      }}
      color="warning"
    >
      Back
    </Button>

    <Button
      onClick={() => {
        // OVERRIDE → apply new value
        applyFieldChange(overrideDialog.field, overrideDialog.newValue);
        setOverrideDialog({ ...overrideDialog, open: false });
      }}
      color="primary"
      variant="contained"
    >
      Override
    </Button>
  </DialogActions>
</Dialog>
<Dialog
  open={doseAlert.open}
   onClose={(event, reason) => {
    if (reason === "backdropClick") return;  //block outside click
    setDoseAlert({ open: false, message: "" }); // only close manually
  }}
  PaperProps={{
    sx: {
      backgroundColor: "#FFFFFF",   // FULL WHITE BACKGROUND
      borderRadius: "12px",
      paddingTop: "8px",
      paddingBottom: "8px"
    }
  }}
>
  <DialogTitle sx={{ fontWeight: "bold", color: "#0F3B61" }}>
    Dosage Range Limit
  </DialogTitle>

  <DialogContent sx={{ backgroundColor: "#FFFFFF" }}>
    <Typography sx={{ color: "#124D81", mt: 1 }}>
      {doseAlert.message}
    </Typography>
  </DialogContent>

  <DialogActions
    sx={{
      justifyContent: "space-between",
      px: 3,
      pb: 2,
      backgroundColor: "#FFFFFF"
    }}
  >
    {/* RESET BUTTON */}
    <Button
      variant="outlined"
      sx={{
        textTransform: "none",
        borderColor: "#D0D5DD",
        color: "#344054",
        fontWeight: 500,
        "&:hover": {
          backgroundColor: "#F9FAFB",
        },
      }}
      onClick={() => {
        setDose(String(recommendedDose));
        setPendingDose("");
        setDoseAlert({ open: false, message: "" });
      }}
    >
      Reset
    </Button>

    {/* OVERRIDE BUTTON */}
    <Button
      variant="contained"
      sx={{
        textTransform: "none",
        backgroundColor: "#228BE6",
        color: "#FFFFFF",
        fontWeight: 500,
        "&:hover": {
          backgroundColor: "#1C7CD6",
        },
      }}
      onClick={() => {
        setDose(pendingDose);
        setDoseAlert({ open: false, message: "" });
      }}
    >
      Override
    </Button>
  </DialogActions>
</Dialog>


    <Dialog
  open={openPrescribeModal}
   onClose={(event, reason) => {
    if (reason === "backdropClick") return;  // ❌ block outside click
    setOpenPrescribeModal({ open: false, message: "" }); // ✔ only close manually
  }}
  maxWidth="md"
  fullWidth
  hideBackdrop
  PaperProps={{
    sx: {
      boxShadow: 6,
      borderRadius: 7,
      backgroundColor: "#FFFFFF",
    },
  }}
  sx={{
    "& .MuiDialog-container": {
        backdropFilter: "blur(6px)",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
  }}
>
 <DialogTitle
  sx={{
    color: "#0F3B61",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  New Prescription
  <IconButton
    onClick={() => setOpenPrescribeModal(false)}
    sx={{
      color: "#0F3B61",
      "&:hover": { backgroundColor: "#F2F2F2" },
    }}
  >
    <CloseIcon />
  </IconButton>
</DialogTitle>

 

  <DialogContent dividers sx={{ padding: 2, maxHeight: "80vh", overflowY: "auto" }}>
    {/* <DrugCalculator /> */}
      <Box sx={{ padding: 3, borderRadius: 5, backgroundColor: "#FFFFFF" }}>
          <Typography variant="h6" sx={{ color: "#0F3B61", marginBottom: 3 }}></Typography>

          {/* Drug Name with Autocomplete */}
          <Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    alignItems: "flex-start",
    marginBottom: 3,
  }}
>
  {/* 🔹 Drug Name */}
  <Box sx={{ flex: 2, minWidth: 250 }}>
    <Typography
      variant="subtitle2"
      sx={{ color: "#0F3B61", marginBottom: 1 }}
    >
      Drug Name*
    </Typography>
    <Autocomplete
  freeSolo
  options={drugOptions}
  value={selectedDrug}
 onChange={(_event, newValue) => {
  if (!newValue) {
    setSelectedDrug(null);
    setSelectedDrugName("");
    setSelectedDrugCategory("");
    setSelectedDrugUse("");
    setIndication([]);
    setAvailableRoutes([]);
    setRoute("");
    setDose("");
    setAdmin("");
    setConc("");
    return;
  }

  if (typeof newValue === "string") {
    setSelectedDrug(null);
    setSelectedDrugName(newValue);
    setSelectedDrugCategory("");
    setSelectedDrugUse("");
    setIndication([]);
    setAvailableRoutes([]);
    setRoute("");
    setDose("");
    setAdmin("");
    setConc("");
    return;
  }

  // ✅ Normal selection
  handleDrugSelect(newValue);
  setSelectedDrugName(newValue.name || "");
  setSelectedDrugCategory(newValue.category || "");
  setSelectedDrugUse("");

  const drugDetails = newValue.original;

  // ✅ Filter by patient GA, weight, etc.
  const filtered = filterRegimensForPatient(
    drugDetails.regimens,
    gestationalAge,
    weight,
    Number(pnaDays)||0,
    Number(pmaWeeks)||0
  );

  // ✅ Group by raw_text so each drug use appears once
  const uniqueIndications = [...new Set(filtered.map((r: any) => r.raw_text))];
  setIndication(uniqueIndications);

  // ✅ Build a lookup of { raw_text: [routes...] } for later use
  const routeMap: Record<string, string[]> = {};
  filtered.forEach((r: any) => {
    if (!routeMap[r.raw_text]) routeMap[r.raw_text] = [];
    if (!routeMap[r.raw_text].includes(r.routes))
      routeMap[r.raw_text].push(r.routes);
  });

  

  // ✅ Reset downstream fields
  setAvailableRoutes([]);
  setRoute("");
  setDose("");
  setAdmin("");
  setConc("");
  setIntervalHours("");
  setDoseperday("");
}}

  onInputChange={(_event, newInputValue, reason) => {
    if (reason === "input") {
      // user typing
      fetchDrugs(newInputValue);
    } else if (reason === "clear") {
      // cleared
      fetchDrugs("");
    }
  }}
  onOpen={() => {
    // ✅ Show full list when clicked (no typing)
    fetchDrugs("");
  }}
  getOptionLabel={(option) =>
    typeof option === "string" ? option : option.name || ""
  }
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Search Drug name"
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#DBE2F2",
          },
        },
        "& .MuiInputBase-root": {
          color: "#0F3B61",
        },
      }}
    />
  )}
  ListboxProps={{
    style: {
      maxHeight: "250px", // ✅ Scrollable list
      overflowY: "auto",
      backgroundColor: "#000000ff", // ✅ Matches your theme background
    },
  }}
/>

  </Box>

  <Box sx={{ flex: 1, minWidth: 160 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    GA (Weeks + Days)
  </Typography>

  <Box sx={{ display: "flex", gap: 1 }}>

{/* Weeks Input */}
<TextField
  type="number"
 
  placeholder="e.g. 22"
  fullWidth
  value={gaWeeks}
  onChange={(e) => {
    const val = e.target.value;

    if (val === "") {
      setGaWeeks("");
      setGestationalAge("");
      return;
    }

    const num = parseInt(val);
    if (isNaN(num) || num < 0 || num > 45) {
      setSnackbarMessage("GA weeks must be between 0 and 45.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setGaWeeks(val);
    setGestationalAge(`${num}.${gaDays || 0}`);
  }}
  InputProps={{ inputProps: { min: 0, max: 45 } }}
  sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#DBE2F2" }, }, "& .MuiInputBase-root": { color: "#0F3B61" }, }}
/>

{/* Days Input */}
<TextField
  type="number"
 
  placeholder="0–6"
  fullWidth
  value={gaDays}
  onChange={(e) => {
    const val = e.target.value;

    if (val === "") {
      setGaDays("");
      setGestationalAge("");
      return;
    }

    const num = parseInt(val);
    if (isNaN(num) || num < 0 || num > 6) {
      setSnackbarMessage("GA days must be between 0 and 6.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setGaDays(val);
    setGestationalAge(`${gaWeeks || 0}.${num}`);
  }}
  InputProps={{ inputProps: { min: 0, max: 6 } }}
  sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#DBE2F2" }, }, "& .MuiInputBase-root": { color: "#0F3B61" }, }}
/>

</Box>

</Box>


{/* 🔹 Weight (kg) */}
<Box sx={{ flex: 1, minWidth: 130 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    Weight (kg)
  </Typography>

  <TextField
    type="text" // ✅ use text for better validation control
    placeholder="e.g. 2.8"
    fullWidth
    value={weight}
    onChange={(e) => {
      const input = e.target.value.trim();

      // ✅ Allow clearing
      if (input === "") {
        setWeight("");
        return;
      }

      // ✅ Allow only numeric with optional single decimal
      const regex = /^\d*\.?\d*$/;
      if (!regex.test(input)) return; // ignore invalid characters

      const value = parseFloat(input);

      // ✅ Range validation
      if (!isNaN(value)) {
        if (value < 0)return; // ignore negative
        if (value > 5) {
          setWeight("5");
          setSnackbarMessage("Weight cannot exceed 5 kg");
setSnackbarSeverity("error");
setSnackbarOpen(true)
          
          return;
        }
      }

      setWeight(input); // ✅ safe — remains string
    }}
    inputProps={{
      inputMode: "decimal", // ✅ shows numeric keyboard on mobile
      pattern: "[0-9]*[.,]?[0-9]*",
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#DBE2F2" },
      },
      "& .MuiInputBase-root": { color: "#0F3B61" },
    }}
  />
</Box>



  {/* 🔹 Birth Date */}
  <Box sx={{ flex: 1, minWidth: 200 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    Birth Date
  </Typography>
  <TextField
    type="date"
    fullWidth
    value={props.birth_date}
    onChange={(e) => setBirthDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    inputProps={{
      max: new Date().toISOString().split("T")[0], // ✅ restrict future dates
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#DBE2F2",
        },
      },
      "& .MuiInputBase-root": {
        color: "#0F3B61",
      },
    }}
  />
</Box>
{/* 🔹 PMA and PNA (Editable) */}
<Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    alignItems: "flex-start",
    marginBottom: 3,
  }}
>
  {/* PMA (Weeks) */}
<Box sx={{ flex: 1, minWidth: 190 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    PMA (Weeks)
  </Typography>

 <TextField
  type="number"
  label="PMA Weeks"
  fullWidth
  value={pmaWeeks}
  onChange={(e) => {
    const val = e.target.value;
    if (val === "") { setPmaWeeks(""); return; }
    const num = parseInt(val);
    if (num < 20 || num > 60) return;
    setPmaWeeks(val);
  }} inputProps={{
      inputMode: "numeric", // ✅ mobile-friendly
      pattern: "[0-9]*",
      min: 0,
      max: 90,
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#DBE2F2" },
      },
      "& .MuiInputBase-root": { color: "#0F3B61" },
    }}
/>



</Box>
<Box sx={{ flex: 1, minWidth: 150 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    PMA days
  </Typography>



<TextField
  type="number"
  label="PMA Days"
  value={pmaDays}
  fullWidth
  onChange={(e) => {
    const val = e.target.value;
    if (val === "") { setPmaDays(""); return; }
    const num = parseInt(val);
    if (num < 0 || num > 6) return;
    setPmaDays(val);
  }} inputProps={{
      inputMode: "numeric", // ✅ mobile-friendly
      pattern: "[0-9]*",
      min: 0,
      max: 90,
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#DBE2F2" },
      },
      "& .MuiInputBase-root": { color: "#0F3B61" },
    }}
/>

</Box>



  {/* PNA (Days) */}
 <Box sx={{ flex: 1, minWidth: 150 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    PNA (Days)
  </Typography>

  <TextField
    type="text" // ✅ text for safe numeric control
    placeholder="e.g. 10"
    fullWidth
    value={pnaDays}
    onChange={(e) => {
      const input = e.target.value.trim();

      // ✅ Allow clearing
      if (input === "") {
        setPnaDays("");
        return;
      }

      // ✅ Allow only integers (no decimals)
      const regex = /^\d*$/;
      if (!regex.test(input)) return;

      const num = parseInt(input, 10);
      if (!isNaN(num)) {
        if (num < 0) return;
        if (num > 90) {
          setPnaDays("90");
           setSnackbarMessage("PNA days cannot exceed 90");
setSnackbarSeverity("error");
setSnackbarOpen(true)
          
          return;
        }
      }

      setPnaDays(input);
    }}
    inputProps={{
      inputMode: "numeric", // ✅ mobile-friendly
      pattern: "[0-9]*",
      min: 0,
      max: 90,
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#DBE2F2" },
      },
      "& .MuiInputBase-root": { color: "#0F3B61" },
    }}
  />
</Box>


</Box>

</Box>
{/* Drug Use + Route (side-by-side) */}
<Box
  sx={{
    display: "flex",
    flexWrap: "wrap", // ✅ wraps vertically on mobile
    gap: 2,
    marginBottom: 3,
  }}
>
  {/* Drug Use */}
  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 65%" } }}>
    <Typography
      variant="subtitle2"
      sx={{ color: "#0F3B61", marginBottom: 1 }}
    >
      Drug Use*
    </Typography>

    <Autocomplete
      freeSolo
      options={indication} // ✅ your existing list of indications
      value={selectedDrugUse}
      onChange={(_event, newValue) => {
  if (!newValue) {
    // 🔹 Clear when deselected
    setSelectedDrugUse("");
    setAvailableRoutes([]);
    setRoute("");
    setDose("");
    setDoseperday("");
    setAdmin("");
    setConc("");
    setIntervalHours("");
    setFrequency("");
    return;
  }

  // 🔹 Update selected indication (string only)
  const selectedUse = typeof newValue === "string" ? newValue : newValue;
  setSelectedDrugUse(selectedUse);

  if (!selectedDrug) return;

  // ✅ Find all regimens for this indication
  const drugDetails = selectedDrug.original;
  const matchedRegimens = drugDetails.regimens.filter(
    (r: any) => r.raw_text === selectedUse
  );

  // ✅ Extract all unique routes for this drug use
const uniqueRoutes: string[] = Array.from(
  new Set(
    matchedRegimens.map((r: any) => String(r.routes))
  )
).map((r) => r as string);

setAvailableRoutes(uniqueRoutes);

// Auto-select first route
if (uniqueRoutes.length > 0) {
  const firstRoute: string = uniqueRoutes[0];
  setRoute(firstRoute);

  // Find regimen for this route
  const regimen = matchedRegimens.find(
    (r: any) => r.routes?.toUpperCase() === firstRoute.toUpperCase()
  );

  if (regimen) {
    setDose(regimen.dose_value?.toString() || "");
    setDoseperday(regimen.dose_per_day?.toString() || "N/A");
    setConc(regimen.conc_value?.toString() || "");
    setIntervalHours(regimen.frequency?.interval_hours?.toString() || "");

    if (firstRoute.toUpperCase() === "IV") {
      const adminVal = regimen.admin?.toString() || "";
      setAdmin(adminVal);
      setIvAdminBackup(adminVal);
      console.log("ivAdminBackup",ivAdminBackup);
      
    } else {
      setAdmin("N/A");
    }
      // ✅ Convert interval to Q-factor (Q6H etc.)
      const interval = regimen.frequency?.interval_hours;
      if (interval) {
        const qLabel = Q_FACTOR_MAP[interval] || `Q${interval}H`;
        setFrequency(qLabel);
      } else {
        setFrequency("");
      }
    }
  } else {
    // 🔹 No routes found
    setAvailableRoutes([]);
    setRoute("");
    setDose("");
    setAdmin("");
    setConc("");
    setDoseperday("N/A");
    setIntervalHours("");
    setFrequency("");
  }
}}

      onInputChange={(_event) => {
        setIndication(indication);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Select the Drug Use"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#DBE2F2" },
            },
            "& .MuiInputBase-root": {
              color: "#0F3B61",
            },
          }}
        />
      )}
    />
  </Box>

  {/* Route */}
  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 30%" } }}>
    <Typography
      variant="subtitle2"
      sx={{ color: "#0F3B61", marginBottom: 1 }}
    >
      Route*
    </Typography>
{/* Route */}
<Select
  label="Route"
  displayEmpty
  value={route || ""}
  onChange={(e) => {
    const newRoute = e.target.value;
    setRoute(newRoute);

    // ✅ Recalculate related values for this route
    const regimen = selectedDrug?.original?.regimens?.find(
      (r: any) =>
        r.raw_text === selectedDrugUse &&
        r.routes?.toUpperCase() === newRoute?.toUpperCase()
    );

    if (regimen) {
      // update all dependent values
      setDose(regimen.dose_value?.toString() || "");
      setDoseperday(regimen.dose_per_day?.toString() || "N/A");
      setConc(regimen.conc_value || "");
      const interval = regimen.frequency?.interval_hours;
      setIntervalHours(interval?.toString() || "");

      if (newRoute.toUpperCase() === "IV") {
        const adminVal = regimen.admin?.toString() || "";
        setAdmin(adminVal);
        setIvAdminBackup(adminVal);
      } else {
        setAdmin("N/A");
      }
    } else {
      setAdmin("N/A");
      setConc("");
      setIntervalHours("");
      setDose("");
    }

    // delivery rate toggle
    if (newRoute.toUpperCase() !== "IV") setDeliveryRate("");
  }}
  fullWidth
  MenuProps={{
    MenuListProps: { disablePadding: true },
    sx: { "&& .Mui-selected": { backgroundColor: "#124D81", color: "#FFFFFF" } },
  }}
  sx={{
    flex: { xs: "1 1 100%", sm: "1 1 150px" },
    "& .MuiSelect-icon": { color: "#0F3B61", backgroundColor: "#F2FBFF" },
    color: "#0F3B61",
    border: "1px solid #DBE2F2",
  }}
>
  {/* Show placeholder when no route selected */}
  <MenuItem disabled value="">
    Route
  </MenuItem>

  {/* ✅ Dynamically list only available routes for selected drug use */}
  {availableRoutes.map((r) => (
    <MenuItem key={r} value={r}>
      {r}
    </MenuItem>
  ))}
</Select>

  </Box>
</Box>


          
                {/* 💊 Dosage Table (Responsive for Desktop & Mobile) */}
{!calcNotes && (
<Box sx={{ marginBottom: 3 }}>
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: 2,
      rowGap: 2,
      // ✅ When screen is small (mobile), make items stack vertically
      flexDirection: { xs: "column", sm: "row" },
    }}
  >
    {/* Dosage */}
    <TextField
      label="Dosage"
      value={dose}
onChange={(e) => {
  const v = e.target.value;
  setDose(v);

  if (!v.trim()) return;

  const num = Number(v);
  if (isNaN(num)) return;

  const regimen = activeRegimen;

  if (!validateDoseWithRules(num)) {
    // Save the wrong value for later restore (override)
    setPendingDose(v);

    setDoseAlert({
      open: true,
      message: `Entered dose is outside the allowed range (${regimen?.constraints?.dose_range?.min} - ${regimen?.constraints?.dose_range?.max}).`
    });
  }
}}




      type="number"
      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 150px" }, // full width on mobile
        "& .MuiOutlinedInput-root fieldset": { borderColor: "#DBE2F2" },
        "& .MuiInputBase-root": { color: "#0F3B61" },
        "& .MuiInputLabel-root": { color: "#9BA1AE" },
      }}
    />

    {/* Unit */}
    <Select
      value={unit}
      onChange={(e) => setUnit(e.target.value)}
      MenuProps={{
        MenuListProps: { disablePadding: true },
        sx: { "&& .Mui-selected": { backgroundColor: "#124D81", color: "#FFFFFF" } },
      }}
      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 150px" },
        "& .MuiSelect-icon": { color: "#0F3B61", backgroundColor: "#F2FBFF" },
        color: "#0F3B61",
        border: "1px solid #DBE2F2",
      }}
    >
      <MenuItem value="mg/kg">mg/kg</MenuItem>
      <MenuItem value="mg">mg</MenuItem>
      <MenuItem value="mcg">mcg</MenuItem>
      <MenuItem value="mL">mL</MenuItem>
    </Select>

{/* Frequency */}
<Select
  displayEmpty
  value={intervalHours ? String(intervalHours) : ""}
  onChange={(e) => setIntervalHours(String(e.target.value))}
  fullWidth
  MenuProps={{
    MenuListProps: { disablePadding: true },
    sx: {
      "&& .Mui-selected": {
        backgroundColor: "#124D81",
        color: "#FFFFFF",
      },
    },
  }}
  sx={{
    flex: { xs: "1 1 100%", sm: "1 1 150px" },
    border: "1px solid #DBE2F2",
    "& .MuiSelect-icon": { color: "#0F3B61", backgroundColor: "#F2FBFF" },
    "& .MuiSelect-select": {
      color: "#0F3B61 !important",
    },
    "& .MuiSelect-select:empty": {
      color: "#000000 !important",
      opacity: 1,
    },
    "& em": {
      color: "#000000 !important",
      fontStyle: "normal",
    },
  }}
>
  {/* Placeholder */}
  <MenuItem value="">
    <em>Select Freq</em>
  </MenuItem>

{/* ✅ Dynamic Q-factor when not in map */}
  {(() => {
    const key = intervalHours ? String(intervalHours) : "";
    // show Q36H etc. only when it's not one of the standard map keys
    return key && !Q_FACTOR_MAP.hasOwnProperty(key) ? (
      <MenuItem key={key} value={key}>
     
        {`Q${key}H`}
      </MenuItem>
    ) : null;
  })()}
  {/* ✅ Predefined Q-factors */}
  {Object.entries(Q_FACTOR_MAP).map(([key, label]) => (
    <MenuItem key={key} value={key}>
      {label}
    </MenuItem>
  ))}

  
</Select>


    {/* Admin */}
    <TextField
      label="Admin"
      placeholder="e.g., 30"
      value={admin}
      onChange={(e) => setAdmin(e.target.value)}
      disabled={admin === "N/A"}
      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 150px" },
        "& .MuiOutlinedInput-root fieldset": { borderColor: "#DBE2F2" },
        "& .MuiInputBase-input": { color: "#0F3B61" },
        "& .MuiInputBase-input.Mui-disabled": {
          WebkitTextFillColor: "black",
          opacity: 1,
        },
        "& .MuiInputLabel-root": { color: "#9BA1AE" },
      }}
    />

    {/* Concentration */}
    <TextField
      label="Conc. (mL)"
      placeholder="e.g., 10"
      value={conc}
      onChange={(e) =>
  handleProtectedChange("conc", conc, e.target.value)
}

      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 150px" },
        "& .MuiOutlinedInput-root fieldset": { borderColor: "#DBE2F2" },
        "& .MuiInputBase-root": { color: "#0F3B61" },
        "& .MuiInputLabel-root": { color: "#9BA1AE" },
      }}
    />

    {/* Dose per day */}
    <TextField
      label="Dose / day"
      placeholder="e.g., 2"
      value={doseperday}
      onChange={(e) => setDoseperday(e.target.value)}
      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 150px" },
        "& .MuiOutlinedInput-root fieldset": { borderColor: "#DBE2F2" },
        "& .MuiInputBase-root": { color: "#0F3B61" },
        "& .MuiInputLabel-root": { color: "#9BA1AE" },
      }}
    
    />

    
  </Box>
</Box>
)}
{/* Ordertype */}
<Select
  displayEmpty
  value={ordertype}
  onChange={(e) => setOrderType(String(e.target.value))}
  fullWidth
  MenuProps={{
    MenuListProps: { disablePadding: true },
    sx: {
      "&& .Mui-selected": {
        backgroundColor: "#124D81",
        color: "#FFFFFF",
      },
    },
  }}
  sx={{
    flex: { xs: "1 1 100%", sm: "1 1 150px" },
    border: "1px solid #DBE2F2",
    "& .MuiSelect-icon": { color: "#0F3B61", backgroundColor: "#F2FBFF" },
    "& .MuiSelect-select": {
      color: "#0F3B61 !important",
    },
    "& .MuiSelect-select:empty": {
      color: "#000000 !important",
      opacity: 1,
    },
    "& em": {
      color: "#000000 !important",
      fontStyle: "normal",
    },
  }}
>
  {/* Placeholder */}
  <MenuItem value="">
    <em>Select OrderType</em>
  </MenuItem>


  <MenuItem value="Routine/Reg">Routine/Reg</MenuItem>
      <MenuItem value="PRN/SOS">PRN/SOS</MenuItem>
      <MenuItem value="STAT">STAT</MenuItem>
      <MenuItem value="One-time">One-time</MenuItem>
      <MenuItem value="Titration">Titration</MenuItem>
      <MenuItem value="Others">Others</MenuItem>

  
</Select>
         
          <Box sx={{ marginTop: 4 }}>

      {/* 🔹 Calculated Values Section */}
<Box sx={{ marginTop: 3 }}>
  {calcNotes ? (
    // ✅ Show calc_notes text box if present
    <Box
      sx={{
        backgroundColor: "#F9FBFF",
        border: "1px solid #DBE2F2",
        borderRadius: 2,
        padding: 2,
        color: "#0F3B61",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, marginBottom: 1, color: "#0F3B61" }}
      >
        Calculation Notes
      </Typography>

      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {calcNotes}
      </Typography>
    </Box>
  ) : (
    // ✅ Show regular calculated values if no calc_notes
    <>
      <Typography
        variant="subtitle1"
        sx={{ color: "#0F3B61", marginBottom: 2, fontWeight: 600 }}
      >
        Calculated Values
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", marginTop: 2 }}>
        {/* 💊 Dose Amount */}
        <TextField
          label="Dose Amount (mg)"
          placeholder="Auto-calculated"
          value={doseAmount}
          onChange={(e) => setDoseAmount(e.target.value)}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#DBE2F2" },
            },
            "& .MuiInputBase-root": { color: "#0F3B61" },
            "& .MuiInputLabel-root": { color: "#9BA1AE" },
          }}
        />

        {/* 💧 Dose Volume */}
        <TextField
          label="Dose Volume (mL)"
          placeholder="Auto-calculated"
          value={doseVolume}
          onChange={(e) => setDoseVolume(e.target.value)}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#DBE2F2" },
            },
            "& .MuiInputBase-root": { color: "#0F3B61" },
            "& .MuiInputLabel-root": { color: "#9BA1AE" },
          }}
        />

        {/* 🚀 Delivery Rate */}
        <TextField
          label="Delivery Rate (mL/hr)"
          placeholder="Auto-calculated"
          value={route.toUpperCase() === "IV" ? deliveryRate : "N/A"}
          onChange={(e) => {
            if (route.toUpperCase() === "IV") setDeliveryRate(e.target.value);
          }}
          disabled={route.toUpperCase() !== "IV"}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#DBE2F2" },
            },
            "& .MuiInputBase-input": {
              color: "#0F3B61",
            },
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "black",
              opacity: 1,
            },
            "& .MuiInputLabel-root": {
              color: "#9BA1AE",
            },
          }}
        />
      </Box>
    </>
  )}
</Box>




          {/* Dates */}
         <Box sx={{ display: "flex", gap: 2, marginTop: 4 }}>

  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <FormControl fullWidth>
      <DateTimePicker
        label="Start Date"
        value={startDate}
        onChange={(newValue) => setStartDate(newValue)}
        format="dd/MM/yyyy hh:mm a"
        minDateTime={new Date()}
        slotProps={{
          textField: {
            variant: "outlined",
            fullWidth: true,
            size: "medium",
          },
        }}
        sx={{
          marginBottom: 2,
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#DBE2F2' },
          },
          '& .MuiInputBase-root': { color: '#0F3B61' },
          '& .MuiInputLabel-root': { color: '#9BA1AE' },
          // ✅ Fix: make calendar icon visible
          '& .MuiSvgIcon-root': {
            color: '#124D81', // Dark blue icon color
          },
        }}
      />
    </FormControl>
  </LocalizationProvider>

  <FormControl fullWidth>
    <Select
      value={days}
      onChange={(e) => setDays(e.target.value as number)}
      fullWidth
      MenuProps={{
        MenuListProps: { disablePadding: true },
        sx: {
          '&& .Mui-selected': {
            backgroundColor: '#124D81',
            color: '#FFFFFF',
          },
        },
      }}
      sx={{
        '& .MuiSelect-icon': {
          color: '#0F3B61',
          backgroundColor: '#F2FBFF',
        },
        color: '#0F3B61',
        border: '1px solid #DBE2F2',
      }}
    >
      {Array.from({ length: Math.max(days, 7) }, (_, i) => i + 1).map((day) => (
        <MenuItem key={day} value={day}>
          {day} Day
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <FormControl fullWidth>
      <DateTimePicker
        label="End Date"
        value={endDate}
        onChange={handleEndDateChange}
        format="dd/MM/yyyy hh:mm a"
        minDateTime={new Date()}
        slotProps={{
          textField: {
            variant: "outlined",
            fullWidth: true,
            size: "medium",
          },
        }}
        sx={{
          marginBottom: 2,
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#DBE2F2' },
          },
          '& .MuiInputBase-root': { color: '#0F3B61' },
          '& .MuiInputLabel-root': { color: '#9BA1AE' },
          // ✅ Fix: make calendar icon visible
          '& .MuiSvgIcon-root': {
            color: '#124D81', // Dark blue icon
          },
        }}
      />
    </FormControl>
  </LocalizationProvider>
</Box>


          {/* Additional Notes */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "#0F3B61", marginBottom: 1 }}>Additional Notes or Special instruction</Typography>
            <TextField
              placeholder="Enter any additional notes..."
              fullWidth
              multiline
              rows={3}
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#DBE2F2',
                  },
                },
                '& .MuiInputBase-root': {
                  color: '#0F3B61',
                },
              }} />
          </Box>

    
          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
            <Box
              sx={{
                padding: '1%',
                borderRadius: '7px',
                backgroundColor: '#5E84CC1A',
                // Adjust multiplier (10) as needed for desired width
              }}
            >
              <Typography variant="body2" sx={{ color: "#9BA1AE" }}>
                Prescribed by
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0F3B61",
                }}
              >
                {props.UserRole}
                <span style={{ color: "green", marginLeft: 4 }}></span>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 3, justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={resetForm} sx={{ borderColor: "#0F3B61", color: "#0F3B61", padding: "2px 7px",    // custom height & width
    minWidth: "80px",  }}  >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  handlePrescribe();
                  resetForm();
                  
                } }
                sx={{
                  pointerEvents: isFormEmpty() ? 'none' : 'auto',
                  opacity: isFormEmpty() ? 0.5 : 1,
                  padding: "2px 12px",    // custom height & width
    minWidth: "80px",  
                }}
              >
                Prescribe
              </Button>
            </Box>
          </Box>
        </Box>
        </Box>
      
   
  </DialogContent>

  
    </Dialog>

        </ProtectedModule>
        {/* )} */}
    {/* nurse view */}
    <ProtectedModule module="Medications" action="edit"> 
  <Box >
  <Grid container alignItems="center" justifyContent="space-between" >
    <Typography variant="h6" sx={{ color: "#0F3B61" }} gutterBottom>
      Medications
    </Typography>
    <Box
  sx={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 2,
  }}
>
<Tooltip title="Download PDF">
  <IconButton 
   
     onClick={() => setWeekDialogOpen(true)}
    size="small"
     sx={{
    backgroundColor: "rgba(34, 139, 230, 0.1)", // 10% opacity
    color: "#228BE6",
    paddingX: 2.2,
    paddingY:0.8,
    marginRight:3,
    textTransform: "none",
    fontWeight: 700,
    borderRadius: "8px",
    boxShadow: "none", // remove default contained shadow
    "&:hover": {
      backgroundColor: "rgba(34, 139, 230, 0.1)", // same as normal (no color change)
      boxShadow: "none", // prevent MUI hover shadow
    },
  }}
  >
    <DownloadIcon />
  </IconButton>
</Tooltip>

  <Button
  variant="contained"
  onClick={() => setOpenPrescribeModal(true)}
  sx={{
    backgroundColor: "rgba(34, 139, 230, 0.1)", // 10% opacity
    color: "#228BE6",
    paddingX: 3,
    textTransform: "none",
    fontWeight: 700,
    borderRadius: "8px",
    boxShadow: "none", // remove default contained shadow
    "&:hover": {
      backgroundColor: "rgba(34, 139, 230, 0.1)", // same as normal (no color change)
      boxShadow: "none", // prevent MUI hover shadow
    },
  }}
>
  + Prescribe
</Button>

</Box>
  </Grid>


  <Divider />
    {/* 🔹 Filter Bar */}
<Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
   
    mb: 0,
  }}
>
  {/* 🔹 Left: Status Filter Pills */}
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      
    }}
  >
    {[
      { label: "Active", value: "ongoing" },
      { label: "Completed", value: "completed" },
      { label: "All", value: "all" },
      
    ].map((option) => {
      const isSelected = statusFilter === option.value;
      return (
        <Box
          key={option.value}
          onClick={() => setStatusFilter(option.value as any)}
          sx={{
            cursor: "pointer",
            px: 3,
            py: 1,
             borderRadius: "8px",
            color: isSelected ? "#228BE6" : "#3C4048",
            backgroundColor: isSelected ? "#E8F1FB" : "transparent",
            fontWeight: isSelected ? 600 : 500,
            fontSize: "0.9rem",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: isSelected ? "#E8F1FB" : "#F0F4FA",
            },
          }}
        >
          {option.label}
        </Box>
      );
    })}
  </Box>

  {/* 🔹 Right: Sort By Dropdown */}
  <Button
  variant="outlined"
  onClick={() => setFilterDialogOpen(true)}
  sx={{
    color: "#124D81",
    borderColor: "#A7C0DA",
    borderRadius: "25px",
    textTransform: "none",
    px: 2,
  }}
>
  Filter
</Button>

</Box>



<Box sx={{ mt: 2 }}>
  {/* ✅ Header Row */}
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1.5fr 1.2fr 1fr 1.5fr 0.4fr", // mobile
        sm: "1.3fr 1.1fr 1fr 1.4fr 0.4fr", // tablet
        md: "1.2fr 1fr 1fr 1.3fr 0.4fr",   // desktop
      },
      backgroundColor: "#F4F6FB",
      borderRadius: "10px 10px 0 0",
      padding: "10px 18px",
      color: "#8A94A6",

      
      fontWeight: 600,
      fontSize: "0.9rem",
    }}
  >
    <Typography>Drug & Type</Typography>
    <Typography>Dose & Route</Typography>
    <Typography>Frequency</Typography>
    <Typography>Status & Time</Typography>
    <Typography></Typography> {/* empty for action button */}
  </Box>

  {/* ✅ Medication Rows */}
  {finalMedications.length === 0 ? (
    // CANCELLED ONLY IN ALL


    <Typography sx={{ mt: 2, color: "#A7B3CD", textAlign: "center" }}>
      {statusFilter === "completed"
        ? "No completed prescriptions."
        : statusFilter === "all"
        ? "No prescriptions available."
        : "No active prescriptions."}
    </Typography>
  ) : (
    finalMedications.map((medication, index) => {
      
      const now = new Date();
      const start = new Date(medication.startDate);
      const nextDose = medication.nextDose;

      // ✅ determine label + colors
      let label = "On going";
      let bgColor = "#E7F3FF";
      let textColor = "#228BE6";
      //const isHold=medicationhold;
      const isCompleted = medication.administeredCount >= medication.totalDoses;
      const isBeforeStart = now < start;
   
      const isMissed = nextDose && now > nextDose && !isCompleted;
      if (medication.statusDetail === "hold") {
  label = "Hold";
  bgColor = "#F1F3F5";
  textColor = "#868E96";
}
 else if (medication.statusDetail=== "cancelled") {
  label = "Cancelled";
  bgColor = "#F1F3F5";
  textColor = "#868E96";
}
else{
      if (isCompleted) {
        label = "Completed";
        bgColor = "#E6F4EA";
        textColor = "#2EB67D";
      } else if (isMissed) {
        label = "Missed";
        bgColor = "#FEECEC";
        textColor = "#E63946";
      } else if (isBeforeStart) {
        label = "Upcoming";
        bgColor = "#FFF9E6";
        textColor = "#E6A800";
      }
    }

      return (
        <Box
          key={index}
          
  onClick={(e) => {
    // Prevent click from triggering when icon button is clicked
    if ((e.target as HTMLElement).closest(".chevron-button")) return;
    if (medication.statusDetail === "cancelled") return;
    setSelectedPrescription(medication);
    setOpenPrescriptionDialog(true);
  }}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1.5fr 1.2fr 1fr 1.5fr 0.4fr",
              sm: "1.3fr 1.1fr 1fr 1.4fr 0.4fr",
              md: "1.2fr 1fr 1fr 1.3fr 0.4fr",
            },
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: "1px solid #E6EAF0",
  backgroundColor: "#FFFFFF", 
      transition: "background-color 0.4s ease",
            "&:hover": { backgroundColor: "#F9FBFF", cursor: "pointer" },
          }}
        >
          {/* 💊 Drug name & type */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <FontAwesomeIcon icon={faPrescription} style={{ color: "#228BE6" }} />
            <Box>
              <Typography sx={{ color: "#124D81", fontWeight: 600 }}>
                {medication.name}
              </Typography>
              <Typography
                sx={{ color: "#A7B3CD", fontSize: "0.75rem", fontWeight: 500 }}
              >
                {medication.orderType || "Regular"}
              </Typography>
            </Box>
          </Box>

          {/* 🧪 Dose & Route */}
          <Typography sx={{ color: "#495057" }}>
            {medication.frequency1}{" "}
            {medication.route && `(${medication.route})`}
          </Typography>

          {/* ⏱ Frequency */}
          <Typography sx={{ color: "#495057" }}>
            {calculateDuration(medication.startDate, medication.endDate)} days
          </Typography>

          {/* 🩵 Status + Next Dose Time */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Tooltip title={label} arrow>
              <Typography
                sx={{
                  backgroundColor: bgColor,
                  color: textColor,
                  borderRadius: "8px",
                  px: 1.5,
                  py: 0.2,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "inline-block",
                  maxWidth: 120,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </Typography>
            </Tooltip>

            <Typography
              variant="body2"
              sx={{ color: "#A7B3CD", fontSize: "0.75rem" }}
            >
              <strong>Administered:</strong>{" "}
              {medication.administeredCount}/{medication.totalDoses}
            </Typography>

            {nextDose && (
              <Typography
                variant="caption"
                sx={{ color: "#6B7A90", mt: 0.5, fontSize: "0.75rem" }}
              >
                Next:{" "}
                {nextDose.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                {nextDose.toLocaleDateString([], {
                  day: "2-digit",
                  month: "short",
                })}
              </Typography>
            )}
          </Box>

          {/* ➡️ Action button */}
          <Box sx={{ textAlign: "right" }}>
            <IconButton
              onClick={(e) => {
  e.stopPropagation();

  // ⭐ If next dose exists AND current time is before it → upcoming
 /* if (nextDose && now < nextDose) {
    setUpcomingWarningMed(medication);
    setOpenUpcomingDialog(true);
    return;
  }*/

  setSelectedMedication(medication);
  setOpenViewDialog(true);
}}

              disabled={
                medication.statusDetail==="hold" ||
                medication.statusDetail==="cancelled"||
                medication.administeredCount >= medication.totalDoses ||
                administering
              }
              sx={{
                color: "#228BE6",
                padding: 0.5,
                "&:hover": {
                  color: "#0F3B61",
                  backgroundColor: "transparent",
                },
                "&.Mui-disabled": { color: "#B0C4DE" },
              }}
            >
              <ChevronRightIcon fontSize="medium" />
            </IconButton>
          </Box>
        </Box>
      );
    })
  )}
</Box>

</Box>
<Dialog
      open={openViewDialog}
       onClose={(event, reason) => {
    if (reason === "backdropClick") return;  // ❌ block outside click
    setOpenViewDialog({ open: false, message: "" }); // ✔ only close manually
  }}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "478px",
          minWidth:"478px",
          height: "75vh",
          borderRadius: "20px",
          boxShadow: 6,
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
        },
      }}
      sx={{
        "& .MuiBackdrop-root": {
          backdropFilter: "blur(6px)",
          backgroundColor: "rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      {/* -------- HEADER -------- */}
      <DialogTitle
        sx={{
          color: "#0F3B61",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 0,
        }}
      >
        Drug Administration
        <IconButton onClick={handleCloseEntire} sx={{ color: "#0F3B61" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* -------- CUSTOM HORIZONTAL STEPPER -------- */}

      {/* -------- CUSTOM HORIZONTAL STEPPER -------- */}
{/* -------- CUSTOM HORIZONTAL STEPPER (3 STEPS) -------- */}
<Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 4,
    py: 2,
    mt: 1,
    mb: 2,
    position: "relative",
  }}
>
  {[
    { id: 1, label: "Details" },
    { id: 2, label: "Capture" },
    { id: 3, label: "Confirm" },
  ].map((item, index, arr) => {
    const isLast = index === arr.length - 1;
    const isActive = step >= item.id;

    return (
      <Box
        key={item.id}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          flex: 1,
        }}
      >
        {/* --- Connector line --- */}
        {!isLast && (
          <Box
            sx={{
              position: "absolute",
              top: "13px", // centers line between circles
              left: "62%",
              right: "-38%",
              height: "2px",
              backgroundColor:
                step > item.id ? "#228BE6" : "rgba(34,139,230,0.3)",
              transition: "background-color 0.3s ease",
              zIndex: 0,
            }}
          />
        )}

        {/* --- Step circle --- */}
        <Box
          sx={{
            zIndex: 1,
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: isActive
              ? "#228BE6"
              : "rgba(34,139,230,0.15)",
            color: isActive ? "#fff" : "#228BE6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "0.9rem",
            transition: "all 0.3s ease",
          }}
        >
          {item.id}
        </Box>

        {/* --- Step label --- */}
        <Typography
          sx={{
            mt: 1,
            color: isActive ? "#124D81" : "#A7B3CD",
            fontWeight: isActive ? 600 : 500,
            fontSize: "0.85rem",
            transition: "color 0.3s ease",
          }}
        >
          {item.label}
        </Typography>
      </Box>
    );
  })}
</Box>


           {/* -------- DIALOG CONTENT -------- */}
      <DialogContent dividers sx={{ flexGrow: 1, p: 3 }}>
        {step === 1 && selectedMedication && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" sx={{ color: "#124D81" }}>
              {selectedMedication.name}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                <strong>Dosage:</strong> {selectedMedication.frequency1}
              </Typography>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                <strong>Route:</strong> {selectedMedication.route}
              </Typography>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}> <strong>Start Date:</strong>{" "} {new Date(selectedMedication.startDate).toLocaleString()} </Typography> <Typography variant="body2" sx={{ color: "#A7B3CD" }}> <strong>End Date:</strong>{" "} {new Date(selectedMedication.endDate).toLocaleString()} </Typography>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                <strong>Duration:</strong>{" "}
                {calculateDuration(
                  selectedMedication.startDate,
                  selectedMedication.endDate
                )}{" "}
                days
              </Typography>
              {/* Prescriber Info */} <Typography variant="body2" sx={{ color: "#A7B3CD" }}> <strong>Prescribed by:</strong> {props.UserRole || "—"} </Typography>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}> <strong>Administered:</strong>{" "} {selectedMedication.administeredCount}/{selectedMedication.totalDoses} </Typography>
              
            </Box>

            <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
              <strong>Indication:</strong>{" "}
              <span style={{ color: "#495057" }}>{selectedMedication.use}</span>
            </Typography>

            {/* Verification checkboxes */}
            <FormGroup sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={patientVerified}
                    onChange={(e) => setPatientVerified(e.target.checked)}
                    sx={{
                      color: "#228BE6",
                      "&.Mui-checked": { color: "#228BE6" },
                    }}
                  />
                }
                label="Patient verified"
                sx={{ color: "#124D81", fontWeight: 500 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={doseVerified}
                    onChange={(e) => setDoseVerified(e.target.checked)}
                    sx={{
                      color: "#228BE6",
                      "&.Mui-checked": { color: "#228BE6" },
                    }}
                  />
                }
                label="Drug dose & route verified"
                sx={{ color: "#124D81", fontWeight: 500 }}
              />
            </FormGroup>
          </Box>
        )}


{step === 2 && (
  <DialogContent
    dividers={false}
    sx={{
      p: 0,
      m: 0,
      height: "100%", // fill full dialog height
      flex: 1,
      display: "flex",
      flexDirection: "column",
      width:"100%",
      alignItems: "center",
      overflow: "hidden",
    }}
  >
    {/* 🔹 Image / Video fills entire dialog area */}
    <Box
      sx={{
        flexGrow: 1,
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#F9FBFF",
        border: "none",
        borderRadius: 0,
        overflow: "hidden",
      }}
    >
      {/* Display captured image or video */}
      {capturedImage ? (
        <img
          src={capturedImage}
          alt="Captured"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Typography
          variant="body2"
          sx={{
            color: "#A7B3CD",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          Camera / Image Capture Placeholder
        </Typography>
      )}

      <video
        ref={videoRef}
        autoPlay
        style={{
          display: isCameraActive ? "block" : "none",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </Box>

    {/* 🔹 Bottom Action Area */}
    <Box
      sx={{
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(6px)",
        p: 2,
        display: "flex",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#228BE6",
          color: "#FFFFFF",
          textTransform: "none",
          borderRadius: "8px",
          px: 3,
          "&:hover": { backgroundColor: "#0F3B61" },
        }}
        onClick={handleTakePhoto}
      >
        {isCameraActive ? "Capture" : "Take Photo"}
      </Button>

      <Button
        variant="outlined"
        sx={{
          color: "#228BE6",
          borderColor: "#228BE6",
          textTransform: "none",
          borderRadius: "8px",
          px: 3,
          "&:hover": { borderColor: "#0F3B61", color: "#0F3B61" },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        Upload from Gallery
      </Button>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
    </Box>
  </DialogContent>
)}




        {step === 3 && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography variant="h6" sx={{ color: "#124D81", fontWeight: "bold" }}>
      Drug Administration
    </Typography>

    


    
   {/* Chips section */}
<Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 1,
    mt: 1,
  }}
>
  {[
    "Observations",
    "Adverse Reaction",
    "Medication Errors",
    "Antibiotic monitoring",
    "Sedation (N-Pass)",
    "Inotrope monitoring",
    "Electrolyte infusion",
  ].map((label, index) => {
    const isSelected = selectedChips.includes(label);
    return (
      <Chip
        key={index}
        label={label}
        clickable
        onClick={() => {
          setSelectedChips((prev) =>
            prev.includes(label)
              ? prev.filter((c) => c !== label)
              : [...prev, label]
          );
        }}
        sx={{
          backgroundColor: isSelected ? "#1c86ffff" : "#F6F8FC",
          color: isSelected ? "#ffffffff" : "#124D81",
          fontWeight: 500,
          border: isSelected ? "1px solid #228BE6" : "1px solid transparent",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: isSelected ? "#469fffff" : "#E8F1FB",
          },
        }}
      />
    );
  })}
</Box>
<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography
      variant="h6"
      sx={{ color: "#124D81", fontWeight: "bold", mb: 1 }}
    >
      Enter Notes
    </Typography>

  {selectedChips.map((chip) => (
  <Box
    key={chip}
    sx={{
      backgroundColor: "#E9F3FF",
      borderRadius: 2,
      p: 2,
      mb: 2,
      position: "relative",
    }}
  >
    {/* 🔹 Close Button */}
    <IconButton
      size="small"
      onClick={() =>
        setSelectedChips((prev) => prev.filter((c) => c !== chip))
      }
      sx={{
        position: "absolute",
        top: 8,
        right: 8,
        color: "#A7B3CD",
        "&:hover": { color: "#0F3B61" },
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>

    <Typography
      variant="subtitle1"
      sx={{ color: "#124D81", fontWeight: 600, mb: 1 }}
    >
      {chip}
    </Typography>

    {/* 🔹 Custom layouts per chip */}
    {chip === "Sedation (N-Pass)" && (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            placeholder="Pre-Dose"
            fullWidth
            value={chipNotes[`${chip}-Pre`] || ""}
            onChange={(e) =>
              setChipNotes((prev) => ({
                ...prev,
                [`${chip}-Pre`]: e.target.value,
              }))
            }
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#124D81" },
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            placeholder="Post-Dose"
            fullWidth
            value={chipNotes[`${chip}-Post`] || ""}
            onChange={(e) =>
              setChipNotes((prev) => ({
                ...prev,
                [`${chip}-Post`]: e.target.value,
              }))
            }
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#124D81" },
            }}
          />
        </Grid>
      </Grid>
    )}

    {chip === "Inotrope monitoring" && (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            placeholder="00"
            fullWidth
            value={chipNotes[`${chip}-BP`] || ""}
            onChange={(e) =>
              setChipNotes((prev) => ({
                ...prev,
                [`${chip}-BP`]: e.target.value,
              }))
            }
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#124D81" },
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            placeholder="HR"
            fullWidth
            value={chipNotes[`${chip}-HR`] || ""}
            onChange={(e) =>
              setChipNotes((prev) => ({
                ...prev,
                [`${chip}-HR`]: e.target.value,
              }))
            }
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#124D81" },
            }}
          />
        </Grid>
      </Grid>
    )}

    {chip === "Electrolyte infusion" && (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          placeholder="Rhythm / irritation"
          fullWidth
          value={chipNotes[`${chip}-Rhythm`] || ""}
          onChange={(e) =>
            setChipNotes((prev) => ({
              ...prev,
              [`${chip}-Rhythm`]: e.target.value,
            }))
          }
          sx={{ backgroundColor: "#FFFFFF", borderRadius: 1 }}
        />
        <TextField
          placeholder="Site Assessment"
          fullWidth
          value={chipNotes[`${chip}-Site`] || ""}
          onChange={(e) =>
            setChipNotes((prev) => ({
              ...prev,
              [`${chip}-Site`]: e.target.value,
            }))
          }
          sx={{ backgroundColor: "#FFFFFF", borderRadius: 1 }}
        />
      </Box>
    )}

    {/* Default field for other chips */}
    {![
      "Sedation (N-Pass)",
      "Inotrope monitoring",
      "Electrolyte infusion",
    ].includes(chip) && (
      <TextField
        multiline
        rows={2}
        placeholder={`Enter notes for ${chip}`}
        fullWidth
        value={chipNotes[chip] || ""}
        onChange={(e) =>
          setChipNotes((prev) => ({ ...prev, [chip]: e.target.value }))
        }
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          "& .MuiInputBase-input": { color: "#124D81" },
        }}
      />
    )}
  </Box>
))}

  </Box>
  </Box>
)}
{step === 100 && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography
      variant="h6"
      sx={{ color: "#124D81", fontWeight: "bold", mb: 1 }}
    >
      Drug Administration
    </Typography>

    {selectedChips.map((chip) => (
      <Box
        key={chip}
        sx={{
          backgroundColor: "#F8FAFF",
          borderRadius: 2,
          p: 2,
          mb: 2,
          position: "relative",
        }}
      >
        {/* 🔹 Close Button */}
        <IconButton
          size="small"
          onClick={() =>
            setSelectedChips((prev) => prev.filter((c) => c !== chip))
          }
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "#A7B3CD",
            "&:hover": { color: "#0F3B61" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Typography
          variant="subtitle1"
          sx={{ color: "#124D81", fontWeight: 600, mb: 1 }}
        >
          {chip}
        </Typography>

        {/* 🔹 Custom layouts per chip */}
        {chip === "Sedation (N-Pass)" && (
  <Grid container spacing={2}>
    <Grid item xs={6}>
      <TextField
       // label="Pre-Dose"
        placeholder="Pre-Dose"
        fullWidth
        InputLabelProps={{ shrink: true }} 
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          "& .MuiInputBase-input": {
            color: "#124D81",
          },
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(18,77,129,0.5)",
            opacity: 1,
          },
        }}
      />
    </Grid>
    <Grid item xs={6}>
      <TextField
        //label="Post-Dose"
        placeholder="Post-Dose"
        fullWidth
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          "& .MuiInputBase-input": {
            color: "#124D81",
          },
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(18,77,129,0.5)",
            opacity: 1,
          },
        }}
      />
    </Grid>
  </Grid>
)}

{chip === "Inotrope monitoring" && (
  <Grid container spacing={2}>
    <Grid item xs={6}>
      <TextField
        placeholder="00"
        fullWidth
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          "& .MuiInputBase-input": { color: "#124D81" },
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(18,77,129,0.5)",
            opacity: 1,
          },
        }}
      />
    </Grid>
    <Grid item xs={6}>
      <TextField
      //  label="HR"
        placeholder="HR"
        fullWidth
       sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          "& .MuiInputBase-input": { color: "#124D81" },
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(18,77,129,0.5)",
            opacity: 1,
          },
        }}
      />
    </Grid>
  </Grid>
)}

{chip === "Electrolyte infusion" && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <TextField
      placeholder="Rhythm / irritation"
      fullWidth
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 1,
        "& .MuiInputBase-input": { color: "#124D81" },
        "& .MuiInputBase-input::placeholder": {
          color: "rgba(18,77,129,0.5)",
          opacity: 1,
        },
      }}
    />
    <TextField
      placeholder="Site Assessment"
      fullWidth
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 1,
        "& .MuiInputBase-input": { color: "#124D81" },
        "& .MuiInputBase-input::placeholder": {
          color: "rgba(18,77,129,0.5)",
          opacity: 1,
        },
      }}
    />
  </Box>
)}


        {/* 🔹 Default multiline field for all other chips */}
        {![
          "Sedation (N-Pass)",
          "Inotrope monitoring",
          "Electrolyte infusion",
        ].includes(chip) && (
          <TextField
            multiline
            rows={2}
            placeholder={`Enter notes for ${chip}`}
            fullWidth
            sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 1,
        "& .MuiInputBase-input": { color: "#124D81" },
        "& .MuiInputBase-input::placeholder": {
          color: "rgba(18,77,129,0.5)",
          opacity: 1,
        },
      }}
          />
        )}
      </Box>
    ))}
  </Box>
)}

{step === 4 && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography
      variant="h6"
      sx={{ color: "#124D81", fontWeight: "bold", mb: 1 }}
    >
      Start Time, Duration & Calculated Rate
    </Typography>

    <Box
      sx={{
        backgroundColor: "#228be65F",
        borderRadius: 3,
        p: 2,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* 🔹 Start Time */}
      <Typography
        variant="h6"
        sx={{ color: "#124D81", fontWeight: "bold" }}
      >
        Start Time
      </Typography>
      <TextField
        type="time"
        fullWidth
        value={adminDetails.startTime}
        onChange={(e) =>
          setAdminDetails((prev) => ({ ...prev, startTime: e.target.value }))
        }
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 3,
          "& .MuiInputBase-input": { color: "#124D81" },
        }}
      />

      {/* 🔹 Duration */}
      <Typography
        variant="h6"
        sx={{ color: "#124D81", fontWeight: "bold" }}
      >
        Duration (min)
      </Typography>
      <TextField
        type="number"
        placeholder="Enter duration"
        fullWidth
        value={adminDetails.duration}
        onChange={(e) =>
          setAdminDetails((prev) => ({ ...prev, duration: e.target.value }))
        }
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 3,
          "& .MuiInputBase-input": { color: "#124D81" },
        }}
      />

      {/* 🔹 Calculated Rate */}
      <Typography
        variant="h6"
        sx={{ color: "#124D81", fontWeight: "bold" }}
      >
        Calculated Rate (mL/hr)
      </Typography>
      <TextField
        placeholder="based on duration and volume"
        fullWidth
        value={adminDetails.calculatedRate}
        onChange={(e) =>
          setAdminDetails((prev) => ({
            ...prev,
            calculatedRate: e.target.value,
          }))
        }
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 3,
          "& .MuiInputBase-input": { color: "#124D81" },
        }}
      />
    </Box>
  </Box>
)}

{step === 5 && (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 1,
      p: 1,
      maxHeight: "75vh",
      overflowY: "auto",
      backgroundColor: "#FFFFFF",
    }}
  >
    {/* Header */}
    <Typography
      variant="h6"
      sx={{ color: "#124D81", fontWeight: 700, textAlign: "center" }}
    >
      Administration Log
    </Typography>

    {/* Medication Info */}
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 2,
        boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
        p: 2.5,
      }}
    >
      <Typography variant="h6" sx={{ color: "#124D81", fontWeight: 700 }}>
        {selectedMedication?.name || "Medication Name"}
      </Typography>

      <Typography sx={{ color: "#A7B3CD", fontSize: "0.85rem", mb: 1 }}>
        {selectedMedication?.use || "Indication / Diagnosis"}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={6}>
          <Typography sx={{ color: "#495057" }}>
            <b>Route:</b> {selectedMedication?.route || "—"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ color: "#495057" }}>
            <b>Order:</b> Scheduled
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ color: "#495057" }}>
            <b>Frequency:</b> {selectedMedication?.frequency1 || "—"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ color: "#495057" }}>
            <b>Adm. Over:</b> {duration ? `${duration} mins` : "—"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ color: "#495057" }}>
            <b>Conc.:</b> {selectedMedication?.concentration || "—"}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      {/* Captured Image */}
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: "#124D81", fontWeight: 600 }}
        >
          Drug Captured Image
        </Typography>
        {capturedImage ? (
          <Box
            sx={{
              mt: 1,
              width: "100%",
              borderRadius: 2,
              border: "1px solid #E6EAF0",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            <img
              src={capturedImage}
              alt="Captured Drug"
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
              }}
            />
          </Box>
        ) : (
          <Typography
            sx={{ color: "#A7B3CD", fontSize: "0.85rem", mt: 1, pl: 1 }}
          >
            No image captured.
          </Typography>
        )}
      </Box>

      {/* Observations */}
      {/* Observations */}
<Box sx={{ mt: 2 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#124D81", fontWeight: 600 }}
  >
    Observations
  </Typography>

  <Typography
    sx={{
      color: "#495057",
      mt: 0.5,
      fontSize: "0.9rem",
      lineHeight: 1.5,
    }}
  >
    {selectedChips.length > 0
      ? selectedChips.map((chip) => {
          const relatedNotes = Object.keys(chipNotes)
            .filter((key) => key.startsWith(chip))
            .map((key) => chipNotes[key])
            .filter(Boolean)
            .join(", ");

          return (
            <Box key={chip} sx={{ mb: 0.5 }}>
              <strong>{chip}:</strong> {relatedNotes || "—"}
            </Box>
          );
        })
      : "No adverse reactions noted. Vitals stable."}
  </Typography>
</Box>
<Typography
    variant="subtitle2"
    sx={{ color: "#124D81", fontWeight: 600 }}
  >
    Admin Details
  </Typography>
<Grid item xs={6}>
  <Typography sx={{ color: "#495057" }}>
    <b>Start Time:</b> {adminDetails.startTime || "—"}
  </Typography>
</Grid>
<Grid item xs={6}>
  <Typography sx={{ color: "#495057" }}>
    <b>Duration:</b> {adminDetails.duration ? `${adminDetails.duration} min` : "—"}
  </Typography>
</Grid>
<Grid item xs={6}>
  <Typography sx={{ color: "#495057" }}>
    <b>Calculated Rate:</b> {adminDetails.calculatedRate ? `${adminDetails.calculatedRate} mL/hr` : "—"}
  </Typography>
</Grid>

    </Box>

    {/* Footer Buttons */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
      }}
    >
      <Button
        variant="outlined"
        onClick={() => setStep(step - 1)}
        sx={{
          color: "#228BE6",
          borderColor: "#228BE6",
          textTransform: "none",
          borderRadius: "8px",
          px: 3,
          "&:hover": { borderColor: "#0F3B61", color: "#0F3B61" },
        }}
      >
        Edit
      </Button>

      <Button
        variant="contained"
        
        onClick={() => {
          console.log("Report generated");
          setStep(1);
          setOpenViewDialog(false);
        }}
        sx={{
          backgroundColor: "#E03131",
          textTransform: "none",
          color: "#FFFFFF",
          borderRadius: "8px",
          px: 3,
          "&:hover": { backgroundColor: "#C92A2A" },
        }}
      >
        Report
      </Button>
    </Box>
  </Box>
)}





      </DialogContent>

      {/* -------- FOOTER BUTTONS -------- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderTop: "1px solid #E0E0E0",
          backgroundColor: "#F9FBFF",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => {
            handleClose();
           
          }}
          sx={{
            color: "#228BE6",
            borderColor: "#228BE6",
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
            "&:hover": { borderColor: "#0F3B61", color: "#0F3B61" },
          }}
        >
          {step === 1 ? "Back" : "Previous"}
        </Button>

        <Button
          variant="contained"
          onClick={handleProceed}
          sx={{
            backgroundColor: "#228BE6",
            color: "white",
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
            "&:hover": { backgroundColor: "#0F3B61" },
          }}
        >
          {step ===5 ?  "Finish":"Proceed" }
        </Button>
      </Box>
    </Dialog>

</ProtectedModule>
      {/* Medications  adding */}

      <ProtectedModule module="Medications" action="view">
  <Box marginTop={3}>
    <Typography variant="h6" sx={{ color: "#0F3B61" }} gutterBottom>
      Medications Logs
    </Typography>

    {loading ? (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress size={50} sx={{ color: "#124D81" }} />
      </Box>
    ) : (
      <>
       {administrationHistory.map((medication, index) => (
  <Box
          key={index}
          
 
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1.5fr 1.2fr 1fr 1.5fr 0.4fr",
              sm: "1.3fr 1.1fr 1fr 1.4fr 0.4fr",
              md: "1.2fr 1fr 1fr 1.3fr 0.4fr",
            },
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: "1px solid #E6EAF0",
  backgroundColor: "#FFFFFF", 
      transition: "background-color 0.4s ease",
            "&:hover": { backgroundColor: "#F9FBFF", cursor: "pointer" },
          }}
        >
  
  {/* Rx Icon */}
  {/* <Grid item>
    <Box
      sx={{
        width: 48,
        height: 48,
        backgroundColor: "#E6F0FA",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        color: "#124D81",
        fontWeight: "bold",
      }}
    >
      Rx
    </Box>
  </Grid> */}

  {/* Medication Name + Status */}
 <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <FontAwesomeIcon icon={faPrescription} style={{ color: "#228BE6" }} />
            <Box>
              <Typography sx={{ color: "#124D81", fontWeight: 600 }}>
                {medication.name}
              </Typography>
              <Typography
                sx={{ color: "#A7B3CD", fontSize: "0.75rem", fontWeight: 500 }}
              >
                {medication.orderType || "Regular"}
              </Typography>
              <Typography fontSize="12px" color="#124D81">
            {medication.dosage} &nbsp; {medication.route} &nbsp; {medication.frequency}
          </Typography>
              <Typography variant="caption" color="#A7B3CD">
            Started: {new Date(medication.effectiveDateTime).toLocaleDateString()}
          </Typography>
            </Box>
          </Box>


  {/* Dosage, Frequency, Route, Duration */}
   <Typography
                sx={{ color: "#A7B3CD", fontSize: "0.75rem", fontWeight: 500 }}
              >
                {medication.administeredCount}/{medication.totalDoses}
              </Typography>
      <Box sx={{ display: "flex", flexDirection: "column"
      }}>
        <Typography><strong style={{ color: "#124D81" }}>
          Date & Time: {formatAdminDisplay(medication.effectiveDateTime)}
        </strong></Typography>
            <Tooltip title={medication.status} arrow>
              <Typography
                sx={{
                  backgroundColor:"#E9ECEF" ,
                  color: "#868E96",
                  borderRadius: "8px",
                  px: 1.5,
                  py: 0.2,
                  lineHeight:"20.3px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "inline-block",
                  maxWidth: 90,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {medication.status}
              </Typography>
            </Tooltip>   
</Box>
    {/* Bottom row for indication, doctor, and start date */}
    

      <Typography variant="body2" color="#A7B3CD">
        <strong>Administered By:</strong>
      { medication.performerName ||" Dr. Rebecca T "}&nbsp;&nbsp;
        
      </Typography>
    
  </Box>
))}
      </>
    )}
  </Box>
</ProtectedModule>
<ProtectedModule module="Medications" action="view">
  <Box marginTop={3}>
  <Typography variant="h6" sx={{ color: "#0F3B61" }} gutterBottom>
    Administered Medications
  </Typography>

  {loading ? (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="200px"
    >
      <CircularProgress size={50} sx={{ color: "#124D81" }} />
    </Box>
  ) : (
    <>
      <div ref={tableRef}>
        {Object.values(grouped).map((group, index) => {
          const TOTAL_CELLS = 24;
          let timeSlots = Array(TOTAL_CELLS).fill(null);

          group.records.forEach((record, i) => {
            if (i < TOTAL_CELLS) timeSlots[i] = record;
          });

          return (
            <Box
              key={index}
              elevation={0}
              sx={{
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 1px 4px rgba(0,0,0,0.1)",
                padding: 2,
                mb: 2,
              }}
            >
              <Grid container spacing={2} alignItems="center">
                
                {/* LEFT COLUMN */}
                <Grid item xs={12} md={3}>
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    color="#124D81"
                    sx={{ fontSize: "18px", lineHeight: 1.2 }}
                  >
                    {group.medName}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: "#124D81",
                      fontWeight: 600,
                      mt: 1,
                    }}
                  >
                    {group.dosage} • {group.route} • Q{group.intervalHours}H
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "13px",
                      color: "#A7B3CD",
                      mt: 1,
                      fontWeight: 500,
                    }}
                  >
                    Started: {new Date(group.startDate).toLocaleDateString()}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "13px",
                      color: "#124D81",
                      mt: 1,
                      fontWeight: 500,
                    }}
                  >
                    {group.indication}
                  </Typography>
                </Grid>

                {/* RIGHT GRID WRAPPED FOR RESPONSIVENESS */}
                <Grid item xs={12} md={9}>
                  <Box
                    sx={{
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      width: "100%",
                      maxWidth: "100%",
                      pb: 1,
                      "&::-webkit-scrollbar": {
                        height: "6px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#BFC8D6",
                        borderRadius: "4px",
                      },
                    }}
                  >
                    <Grid
                      container
                      sx={{
                        minWidth: "1100px", // ⬅ important for scroll on small screens
                        border: "1px solid #D4DCEB",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      {timeSlots.map((slot, idx) => (
                        <Grid
                          item
                          key={idx}
                          xs={1}
                          sx={{
                            minHeight: 70,
                            borderLeft: idx !== 0 ? "1px solid #E0E6F3" : "none",
                            padding: "4px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                          }}
                        >
                          {slot ? (
                            <>
                              <Typography
                                fontWeight="bold"
                                fontSize="12px"
                                color="#124D81"
                              >
                                {new Date(slot.effectiveDateTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Typography>

                              <Typography fontSize="10px" color="#5A6B8C">
                                {new Date(slot.effectiveDateTime).toLocaleDateString([], {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                              </Typography>

                              <Typography
                                fontSize="10px"
                                color="#777"
                                sx={{ mt: "4px" }}
                              >
                                {slot.performerName || "Nurse"}
                              </Typography>
                            </>
                          ) : (
                            <Typography fontSize="10px" color="#D0D6E5"></Typography>
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>

              </Grid>
            </Box>
          );
        })}
      </div>
    </>
  )}
</Box>

 
</ProtectedModule>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
      <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
    </Box>
   
  );
};



