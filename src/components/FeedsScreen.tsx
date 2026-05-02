import {Box,Typography,Button,IconButton,Paper,Divider,Dialog,TextField,Checkbox,Chip, Snackbar, Alert,} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AirIcon from "@mui/icons-material/Air";
import OpacityIcon from "@mui/icons-material/Opacity";
import { alpha  } from "@material-ui/core";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTheme } from "@mui/material/styles";
import { saveVitalsToFHIR } from '../utils/fhirVitals';

export interface PatientDetails {
  patient_resource_id: string;
  patient_name: string;
  patient_id: string;
  gestational_age: string;
  birth_date:string;
  UserRole: string;
  userOrganization: string;
}
const QuantityInput = ({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string 
}) => (
  <TextField
    fullWidth
    variant="outlined"
    size="small"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder || "Enter or pick qty"}
    InputProps={{
      endAdornment: (
        <Typography variant="caption" sx={{ color: "#000", fontWeight: 700, ml: 1 }}>
          mL
        </Typography>
      ),
    }}
    sx={{
      backgroundColor: "#F9FAFB",
      borderRadius: "10px",
      mt: 0.5,
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        "& fieldset": { borderColor: "#E5E7EB" },
        "&.Mui-focused fieldset": { borderColor: "#0284C7" },
      },
      "& .MuiOutlinedInput-input": {
        color: "#000000 !important", // Ensures black text
        fontWeight: 600,
        fontSize: "0.85rem",
        "&::placeholder": { color: "#9CA3AF", opacity: 1 },
      },
    }}
  />
);
  export const FeedsScreen: React.FC<PatientDetails> = (props) => {
const theme = useTheme();
const isDarkMode = theme.palette.mode === "dark";

const BalanceStat = ({ label, value }: { label: string, value: number }) => (
  <Box sx={{ textAlign: 'center', minWidth: '50px' }}>
    <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', fontSize: '0.6rem', fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
      {value}
    </Typography>
  </Box>
);
const [saveSuccess, setSaveSuccess] = useState(false);
const [error, setError] = useState<string | null>(null);
const [chartData, setChartData] = React.useState<any[]>([]);
const [isSubmitting, setIsSubmitting] = React.useState(false);
const [entry, setEntry] = useState({
  heartRate: "",
  spo2: "",
  temp: "",
  respRate: "",
  ivFluid: "",
  byMouth: "",
  rtFeed: "",
  aspiration: false,
  aspirationVol: "", // Add this
  urine: false,
  urineVol: "",       // Add this
  stool: false,
  stoolVol: "",       // Add this
  remarks: ""
});


const handleAddEntry = async () => {
  if (!isFormValid) return;

  setIsSubmitting(true);
  
  const observationResource = {
    resourceType: "Observation",
    status: "final",
    subject: { reference: `Patient/${props.patient_resource_id}` },
    effectiveDateTime: new Date().toISOString(),
    performer: [
      {
        display: props.UserRole, 
      }
    ],
    code: {
      coding: [{ system: "http://loinc.org", code: "fluid-intake-output", display: "Inpatient Charting" }]
    },
    component: [
      // Vitals are now saved consistently via fhirVitals.ts.
      // Keeping them OUT of this observation payload to avoid duplication.
      
      // --- Intakes ---
      ...(entry.ivFluid ? [{ code: { text: "IV Fluid" }, valueQuantity: { value: Number(entry.ivFluid), unit: "mL" } }] : []),
      ...(entry.byMouth ? [{ code: { text: "By Mouth" }, valueQuantity: { value: Number(entry.byMouth), unit: "mL" } }] : []),
      ...(entry.rtFeed ? [{ code: { text: "RT Feed" }, valueQuantity: { value: Number(entry.rtFeed), unit: "mL" } }] : []),
      
      // --- Outputs (With Volumes) ---
      // We save the volume if the box is checked AND a volume is entered. 
      // Otherwise, we just save the boolean "true" if checked.
      ...(entry.aspiration ? [{ 
          code: { text: "Aspiration Volume" }, 
          valueQuantity: { value: Number(entry.aspirationVol || 0), unit: "mL" } 
      }] : []),

      ...(entry.urine ? [{ 
          code: { text: "Urine Volume" }, 
          valueQuantity: { value: Number(entry.urineVol || 0), unit: "mL" } 
      }] : []),

      ...(entry.stool ? [{ 
          code: { text: "Drain / Stool Volume" }, 
          valueQuantity: { value: Number(entry.stoolVol || 0), unit: "mL" } 
      }] : []),
    ],
    note: entry.remarks ? [{ text: entry.remarks }] : []
  };

  try {
    // 1️⃣ Save vitals via shared central service first
    if (entry.heartRate || entry.spo2 || entry.temp || entry.respRate) {
      await saveVitalsToFHIR(props.patient_resource_id, {
        hr: entry.heartRate,
        spo2: entry.spo2,
        temp: entry.temp,
        rr: entry.respRate
      });
    }

    // 2️⃣ Save the I/O data
    const url = `${import.meta.env.VITE_FHIRAPI_URL}/Observation`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        "Authorization": "Basic " + btoa("fhiruser:change-password"),
      },
      body: JSON.stringify(observationResource),
    });

    if (response.ok) {
      setOpenEntryDialog(false);
      
      // Reset state including the new Vol fields
      setEntry({
        heartRate: "", spo2: "", temp: "", respRate: "",
        ivFluid: "", byMouth: "", rtFeed: "",
        aspiration: false, aspirationVol: "", 
        urine: false, urineVol: "",
        stool: false, stoolVol: "",
        remarks: ""
      });

      if (typeof fetchEntries === 'function') {
        fetchEntries();
      }
    } else {
      const errorData = await response.json();
      console.error("FHIR Server Error:", errorData);
    }
  } catch (error) {
    console.error("Network Error:", error);
  } finally {
    setIsSubmitting(false);
  }
};
const VITALS_CONFIG = {
  heartRate: { min: 30, max: 250, label: "Heart Rate", unit: "bpm" },
  spo2: { min: 0, max: 100, label: "SpO2", unit: "%" },
  temp: { min: 30, max: 45, label: "Temp", unit: "°C" },
  respRate: { min: 5, max: 100, label: "Resp Rate", unit: "bpm" },
};

const validationErrors = React.useMemo(() => {
  const errors: Record<string, string> = {};

  Object.entries(VITALS_CONFIG).forEach(([field, config]) => {
    const val = entry[field as keyof typeof entry];
    if (val && typeof val === "string") {
      const num = parseFloat(val);
      if (num < config.min) errors[field] = `Low (<${config.min})`;
      if (num > config.max) errors[field] = `High (>${config.max})`;
    }
  });

  return errors;
}, [entry]);

const handleInputChange = (field: string, value: string | boolean) => {
  // 1. Handle Checkboxes (Booleans)
  if (typeof value === "boolean") {
    setEntry((prev) => ({
      ...prev,
      [field]: value,
      // Clear specific volume if the parent checkbox is unchecked
      ...(value === false && field === "aspiration" ? { aspirationVol: "" } : {}),
      ...(value === false && field === "urine" ? { urineVol: "" } : {}),
      ...(value === false && field === "stool" ? { stoolVol: "" } : {}),
    }));
    return;
  }

  // 2. Handle Remarks (Standard Text)
  // We check if the field is "remarks" and return early so no numeric filtering happens
  if (field === "remarks") {
    setEntry((prev) => ({ ...prev, [field]: value }));
    return;
  }

  // 3. Handle Numeric Fields (Vitals and Volumes)
  // Strip any non-numeric/non-decimal characters
  const numericValue = value.replace(/[^0-9.]/g, "");

  // Prevent multiple decimals
  if ((numericValue.match(/\./g) || []).length > 1) return;

  // Range Validation (Only for Vitals)
  const num = parseFloat(numericValue);
  if (!isNaN(num)) {
    if (field === "heartRate" && num > 300) return; // Slightly increased for NICU/Pediatrics
    if (field === "spo2" && num > 100) return;
    if (field === "temp" && num > 45) return;
    if (field === "respRate" && num > 150) return;
  }

  setEntry((prev) => ({ ...prev, [field]: numericValue }));
};


// DEFINE THIS OUTSIDE YOUR MAIN COMPONENT

const isFormValid = React.useMemo(() => {
  const e = entry;
  const hr = parseFloat(e.heartRate);
  const temp = parseFloat(e.temp);
  
  // Basic example: Ensure at least one vital or fluid is entered
  const hasData = !!(e.heartRate || e.temp || e.ivFluid || e.byMouth || e.rtFeed || e.urine || e.aspiration || e.stool);
  
  // Check if vitals are within minimum clinical ranges if they are typed
  const hrValid = e.heartRate ? (hr >= 30 && hr <= 250) : true;
  const tempValid = e.temp ? (temp >= 30 && temp <= 45) : true;

  return hasData && hrValid && tempValid;
}, [entry]);
const [openEntryDialog, setOpenEntryDialog] = React.useState(false);
const now = new Date();

const formattedDateTime = now.toLocaleString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});
const generatePDF = async () => {
  const doc = new jsPDF("p", "pt", "a4");
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // =========================
  // 1️⃣ FETCH ORGANIZATION + LOGO
  // =========================
  let orgName = "Unknown Organization";
  let logoDataUrl: string | null = null;

  try {
    const orgUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${props.userOrganization}`;
    const res = await fetch(orgUrl, {
      headers: {
        Authorization: "Basic " + btoa("fhiruser:change-password"),
        Accept: "application/fhir+json",
      },
    });

    if (res.ok) {
      const org = await res.json();
      orgName = org.name || orgName;
      const ext = org.extension || [];
      const logoExt = ext.find((e: any) =>
        e.url === "http://example.org/fhir/StructureDefinition/organization-logo"
      );
      const logoRef = logoExt?.valueReference?.reference;
      if (logoRef) {
        const binaryId = logoRef.replace("Binary/", "");
        const binRes = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`, {
          headers: { Authorization: "Basic " + btoa("fhiruser:change-password"), Accept: "application/fhir+json" },
        });
        if (binRes.ok) {
          const b = await binRes.json();
          if (b.data) logoDataUrl = `data:${b.contentType};base64,${b.data}`;
        }
      }
    }
  } catch (err) {
    console.error("ORG LOGO ERROR:", err);
  }

  // =========================
  // 🧾 Header Section
  // =========================
  const logoBoxSize = 80;
  const logoX = 60;
  const logoY = 20;

  try {
    if (logoDataUrl) {
      const img = new Image();
      img.src = logoDataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
      });
      const aspectRatio = img.width / img.height;
      let drawWidth = logoBoxSize;
      let drawHeight = logoBoxSize;
      if (aspectRatio > 1) drawHeight = logoBoxSize / aspectRatio;
      else drawWidth = logoBoxSize * aspectRatio;
      const offsetX = logoX + (logoBoxSize - drawWidth) / 2;
      const offsetY = logoY + (logoBoxSize - drawHeight) / 2 - 10;
      doc.addImage(img, "PNG", offsetX, offsetY, drawWidth, drawHeight);
    } else {
      doc.setFillColor(200, 220, 255);
      doc.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
      doc.setFontSize(8);
      doc.text("No Logo", logoX + 5, logoY + 30);
    }
  } catch {
    doc.setFillColor(200, 220, 255);
    doc.rect(logoX, logoY, logoBoxSize, logoBoxSize, "F");
  }

  // Hospital name
  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(14);
  // doc.text(orgName, logoX + 70, logoY + 25);
  
  // Right side Info Box
  const rightX = pageWidth - 40 - 250; 
  const boxY = logoY + 10;
    
  // Grey Tab
  doc.setFillColor(224, 228, 231); 
  doc.rect(rightX + 50, boxY - 14, 160, 14, "F");
  doc.setFontSize(9);
  doc.setTextColor(51, 51, 51); 
  doc.setFont("helvetica", "bold");
  doc.text("INPUT OUTPUT CHART", rightX + 65, boxY - 4);
    
  // Bordered Box
  doc.setDrawColor(209, 217, 224); 
  doc.setLineWidth(1);
  doc.roundedRect(rightX, boxY, 250, 40, 4, 4, "S");
    
  // Text inside box
  const row1Y = boxY + 15;
  const row2Y = boxY + 30;
  doc.setFontSize(9);
    
  doc.setTextColor(144, 164, 174); 
  doc.setFont("helvetica", "normal");
  doc.text("B/O:", rightX + 10, row1Y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(props.patient_name || "N/A", rightX + 35, row1Y);
    
  doc.setTextColor(144, 164, 174);
  doc.setFont("helvetica", "normal");
  doc.text("UHID:", rightX + 130, row1Y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(props.patient_id || "N/A", rightX + 165, row1Y);

  doc.setTextColor(144, 164, 174);
  doc.setFont("helvetica", "normal");
  doc.text("GA:", rightX + 10, row2Y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(props.gestational_age || "N/A", rightX + 35, row2Y);

  doc.setTextColor(144, 164, 174);
  doc.setFont("helvetica", "normal");
  doc.text("DOB:", rightX + 130, row2Y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(props.birth_date || "N/A", rightX + 165, row2Y);

  // Line separator below header
  doc.setDrawColor(238, 238, 238); 
  doc.line(logoX, boxY + 55, pageWidth - logoX, boxY + 55);
 
   // 4. Dynamic Data Generation
   // Instead of a static hours array, we use the actual data fetched from the server
   const tableRows = chartData.map(entry => [
     entry.time,         // Dynamic time from server
     entry.temp || "-",
     entry.pulse || "-",
     entry.resp || "-",
     entry.spo2 || "-",
     entry.ivFluid || "-",
     entry.byMouth || "-",
     entry.rtFeed || "-",
     entry.aspiration || "-",
     entry.urine || "-",
     entry.stool || "-",
     entry.remark || "-"
   ]);
 
   // 5. Main Data Table
   autoTable(doc, {
     startY: boxY + 65,
     head: [['Time', 'T.', 'P.', 'R.', 'SpO2', 'I.V. Fluid', 'By Mouth', 'RT Feed', 'Aspiration', 'Urine', 'Drain/Stool', 'Remark']],
     body: tableRows,
     theme: 'grid',
     styles: { fontSize: 7, cellPadding: 1.5, halign: 'center', textColor: [0, 0, 0] },
     headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 7 },
     columnStyles: {
       0: { cellWidth: 20 },    // Adjusted for dynamic time strings
       11: { halign: 'left', cellWidth: 'auto' } 
     }  
   });
 

  // 6. Summary Calculations at Footer
  // We set a fixed Y position near the bottom of the page
  const footerY = pageHeight - 55; 
  
  const totalIV = chartData.reduce((sum, d) => sum + (parseFloat(d.ivFluid) || 0), 0);
  const totalMouth = chartData.reduce((sum, d) => sum + (parseFloat(d.byMouth) || 0), 0);
  const totalRT = chartData.reduce((sum, d) => sum + (parseFloat(d.rtFeed) || 0), 0);
  const totalInput = totalIV + totalMouth + totalRT;

  // Render Footer Layout
  
  // 1. INPUT Block (Left)
  autoTable(doc, {
    startY: footerY,
    margin: { right: 130 },
    head: [[{ content: 'INPUT', colSpan: 2, styles: { halign: 'center', fillColor: [240, 240, 240], textColor: [0, 0, 0] } }]],
    body: [
      ['By Mouth', totalMouth.toFixed(1)],
      ['RT Feed', totalRT.toFixed(1)],
      ['I.V. Fluid', totalIV.toFixed(1)],
      [{ content: 'Total Input', styles: { fontStyle: 'bold' } }, { content: totalInput.toFixed(1), styles: { fontStyle: 'bold' } }]
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1 }
  });

  // 2. BALANCE Block (Middle)
  const middleX = 82;
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Fluid Balance = Total Input - Total Output", middleX, footerY + 10);
  
  doc.setTextColor(255, 120, 0); // Orange for visibility
  doc.setFontSize(11);
  doc.text(`Balance: ${totalInput.toFixed(1)} mL`, middleX, footerY + 20);
  doc.setTextColor(0, 0, 0);

  // 3. OUTPUT Block (Right)
 // 1. First, calculate the totals specifically for the PDF
const pdfTotals = chartData.reduce((acc, row) => {
  const parse = (val:any) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);
  
  acc.aspiration += parse(row.aspiration);
  acc.urine += parse(row.urine);
  acc.stool += parse(row.stool);
  
  return acc;
}, { aspiration: 0, urine: 0, stool: 0 });

const totalOutput = pdfTotals.aspiration + pdfTotals.urine + pdfTotals.stool;

// 2. Update the autoTable configuration
autoTable(doc, {
  startY: footerY,
  margin: { left: 135 },
  head: [[{ 
    content: 'OUTPUT SUMMARY', 
    colSpan: 2, 
    styles: { halign: 'center', fillColor: [240, 240, 240], textColor: [0, 0, 0] } 
  }]],
  body: [
    ['Aspiration', pdfTotals.aspiration > 0 ? `${pdfTotals.aspiration} mL` : "-"],
    ['Urine', pdfTotals.urine > 0 ? `${pdfTotals.urine} mL` : "-"],
    ['Drain / Stool', pdfTotals.stool > 0 ? `${pdfTotals.stool} mL` : "-"],
    [
      { content: 'Total Output', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }, 
      { content: `${totalOutput} mL`, styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }
    ]
  ],
  theme: 'grid',
  styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
  columnStyles: {
    1: { halign: 'right' } // Align numbers to the right for better readability
  }
});

  // ---------------------------------------------------------
  // 7. FOOTER
  // ---------------------------------------------------------
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Grey Line borderTop
      doc.setDrawColor(238, 238, 238);
      doc.setLineWidth(1);
      doc.line(logoX, pageHeight - 50, pageWidth - logoX, pageHeight - 50);
      
      // Footer Text Address
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("5th & 6th Floor, Archit Sai Avenue, Shree Vallabh Nagar, Behind Old Chhan Hotel, Mumbai Naka, Nashik 422001.", logoX, pageHeight - 35);
      
      // Contact details
      doc.text("8669668651, 9822003909", logoX, pageHeight - 21);
      doc.text("| care.nashik@nimalborneo.com |", logoX + 100, pageHeight - 21);
      doc.text("https://borneohospitals.com/", logoX + 220, pageHeight - 21);
      
      // Page Number
      doc.text(`Page ${i}/${totalPages}`, pageWidth - logoX - 30, pageHeight - 21);
  }

  // Final Save
  doc.save(`IO_Chart_${props.patient_name || 'Record'}.pdf`);
};

const fetchEntries = async () => {
  console.log("Fetching I/O entries for Patient:", props.patient_resource_id);
  
  try {
    const url = `${import.meta.env.VITE_FHIRAPI_URL}/Observation?subject=${props.patient_resource_id}&code=fluid-intake-output&_sort=-date`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": "Basic " + btoa("fhiruser:change-password"),
      },
    });
    
    const data = await response.json();
    console.log("Raw FHIR Response Data:", data);

    if (data.entry) {
      const formatted = data.entry.map((item: any) => {
        const obs = item.resource;
        
        // Helper to extract value from component array
        const getVal = (text: string) => {
          const component = obs.component?.find((c: any) => c.code.text === text);
          // Log specific component search for debugging if needed
          // console.log(`Searching for ${text}:`, component);
          return component;
        };

        const row =  {
          id: obs.id,
          time: new Date(obs.effectiveDateTime).toLocaleString([], {
  month: 'short',
  day: 'numeric',
  hour: '2-digit', 
  minute: '2-digit',
  hour12: true // Set to false if you prefer 24-hour format
}),
          // time: new Date(obs.effectiveDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: getVal("Temperature")?.valueQuantity?.value || "-",
          pulse: getVal("Heart Rate")?.valueQuantity?.value || "-",
          resp: getVal("Respiratory Rate")?.valueQuantity?.value || "-",
          spo2: getVal("SpO2")?.valueQuantity?.value || "-",
          ivFluid: getVal("IV Fluid")?.valueQuantity?.value || "-",
          byMouth: getVal("By Mouth")?.valueQuantity?.value || "-",
          rtFeed: getVal("RT Feed")?.valueQuantity?.value || "-",
          
          // Update these to fetch the volume number instead of a boolean
          aspiration: getVal("Aspiration Volume")?.valueQuantity?.value ?? "-",
          urine: getVal("Urine Volume")?.valueQuantity?.value ?? "-",
          stool: getVal("Drain / Stool Volume")?.valueQuantity?.value ?? "-",
          
          remark: obs.note?.[0]?.text || "-"
        };
        return row;
      });

      console.log("Formatted Table Data:", formatted);
      setChartData(formatted);
    } 
    else {
      console.warn("No entries found in FHIR bundle.");
      setChartData([]); // Clear table if no data
    }
  } catch (error) {
    console.error("Critical Fetch Error:", error);
  }
};

useEffect(() => {
  fetchEntries();
}, [props.patient_resource_id]);
const totals = chartData.reduce((acc, row) => {
  // Helper to convert "-" or "NBM" to 0 for calculation
  const parse = (val: any) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);

  acc.iv += parse(row.ivFluid);
  acc.rt += parse(row.rtFeed);
  acc.oral += parse(row.byMouth);
  acc.urine += parse(row.urine);
  acc.aspiration += parse(row.aspiration);
  acc.stool += parse(row.stool);

  return acc;
}, { iv: 0, rt: 0, oral: 0, urine: 0, aspiration: 0, stool: 0 });
// Calculate totals as before
const totalInput = (totals.iv + totals.rt + totals.oral).toFixed(2);
const totalOutput = (totals.urine + totals.aspiration + totals.stool).toFixed(2);
const balance = Number((totalInput - totalOutput).toFixed(2));

return (
  <Box>
  
  <Box mt={1} mb={1} display={'flex'} justifyContent={'space-between'}>
    <Typography variant="h6" sx={{ color: isDarkMode ? theme.palette.text.primary : "#0F3B61" }} gutterBottom>
                Input Output Chart
              </Typography>
  <Box display={"flex"}  alignItems="center"
  justifyContent="flex-end"
  gap={1.5}>
    <IconButton 
  onClick={generatePDF} // Add this
  disabled={!chartData || chartData.length === 0}
  sx={{
    backgroundColor: alpha("#228BE6", 0.1),
    color: "#228BE6",
    borderRadius: "8px",
    px: 2, py: 0.9,
    "&:hover": { backgroundColor: alpha("#228BE6", 0.2) },
  }}
>
  <DownloadIcon />
</IconButton>
   <Button
  startIcon={<AddIcon fontSize="small" />}
  onClick={() => setOpenEntryDialog(true)}
  sx={{
    backgroundColor: alpha("#228BE6", 0.1),
    color: "#228BE6",
    textTransform: "none",
    borderRadius: "8px",
    px: 3,
  }}
>
  Entry
</Button>

  </Box>
  </Box>

  <Paper
  elevation={0}
  sx={{
    borderRadius: "12px",
    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
    border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
    overflow: "hidden",
  }}
>
  {/* ===== Header Row ===== */}
  <Box
    display="grid"
    gridTemplateColumns="repeat(12, 1fr)"
    alignItems="center"
    px={2}
    py={1}
    sx={{
      backgroundColor: isDarkMode ? theme.palette.background.default : "#F9FAFB",
      fontSize: "0.75rem",
      color: isDarkMode ? theme.palette.text.secondary : "#6B7280",
    }}
  >
    <Typography variant="caption">Time</Typography>
    <Box display="flex" alignItems="center" gap={0.4}><LocalFireDepartmentIcon fontSize="inherit" color="warning" /><Typography variant="caption">T°</Typography></Box>
    <Box display="flex" alignItems="center" gap={0.4}><FavoriteIcon fontSize="inherit" color="error" /><Typography variant="caption">P</Typography></Box>
    <Box display="flex" alignItems="center" gap={0.4}><AirIcon fontSize="inherit" color="info" /><Typography variant="caption">R</Typography></Box>
    <Box display="flex" alignItems="center" gap={0.4}><OpacityIcon fontSize="inherit" color="primary" /><Typography variant="caption">SpO₂</Typography></Box>
    <Typography variant="caption">IV Fluid</Typography>
    <Typography variant="caption">By Mouth</Typography>
    <Typography variant="caption">RT Feed</Typography>
    <Typography variant="caption">Aspiration</Typography>
    <Typography variant="caption">Urine</Typography>
    <Typography variant="caption">Drain / Stool</Typography>
    <Typography variant="caption">Remark</Typography>
  </Box>

  {/* ===== Dynamic Data Rows ===== */}
  {chartData.length > 0 ? (
    chartData.map((row, index) => (
      <Box
        key={row.id || index}
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        alignItems="center"
        px={2}
        py={1.5}
        sx={{
          borderBottom: index !== chartData.length - 1 ? `1px solid ${isDarkMode ? theme.palette.divider : "#F3F4F6"}` : "none",
          "& .MuiTypography-root": { fontSize: "0.75rem", color: isDarkMode ? theme.palette.text.primary : "#000" },
        }}
      >
        <Typography fontWeight={600}>{row.time}</Typography>
        <Typography>{row.temp}</Typography>
        <Typography>{row.pulse}</Typography>
        <Typography>{row.resp}</Typography>
        <Typography>{row.spo2}</Typography>
        <Typography color="#0284C7" fontWeight={600}>{row.ivFluid}</Typography>
        <Typography>{row.byMouth}</Typography>
        <Typography>{row.rtFeed}</Typography>
        <Typography sx={{ color: row.aspiration === "✓" ? "red" : "inherit" }}>{row.aspiration}</Typography>
        <Typography sx={{ color: row.urine === "✓" ? "red" : "inherit" }}>{row.urine}</Typography>
        <Typography sx={{ color: row.stool === "✓" ? "red" : "inherit" }}>{row.stool}</Typography>
        <Typography sx={{ fontStyle: "italic", color: "#6B7280", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.remark}
        </Typography>
      </Box>
    ))
  ) : (
    /* ===== Empty State (Only shows if no data) ===== */
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={1}
      py={5}
    >
      <Typography variant="caption" color="#9CA3AF">
        Add first charting
      </Typography>
      <Button
        size="small"
        startIcon={<AddIcon fontSize="small" />}
        onClick={() => setOpenEntryDialog(true)}
        sx={{
          backgroundColor: alpha("#228BE6", 0.1),
          color: "#228BE6",
          textTransform: "none",
          borderRadius: "8px",
          px: 3,
        }}
      >
        Entry
      </Button>
    </Box>
  )}
</Paper>
<Paper
  elevation={3}
  sx={{
    position: 'fixed',
    bottom: { xs: 10, md: 20 },
    left: '53%', // This moves the starting edge to the middle
    transform: 'translateX(-50%)', // This pulls the bar back so its center is at the 50% mark
    
    width: '90%',
    maxWidth: { xs: '600px', md: '1200px' }, 
    
    borderRadius: '12px',
    p: { xs: 1, sm: 1.5 },
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' }, 
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDarkMode ? theme.palette.background.paper : '#FFFFFF',
    border: `1px solid ${isDarkMode ? theme.palette.divider : '#E5E7EB'}`,
    zIndex: 1000,
    gap: { xs: 1, md: 0 } 
  }}
>
  {/* Total Input Section */}
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: { xs: 1, sm: 2, md: 3 }, 
    flex: { md: 2 },
    width: '100%',
    justifyContent: { xs: 'space-between', md: 'flex-start' }
  }}>
    <Box sx={{ minWidth: '80px' }}>
      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'grey', display: 'block' }}>Total Input</Typography>
      <Typography variant="h6" sx={{ color: '#0284C7', fontWeight: 'bold', lineHeight: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
        {totalInput} <span style={{ fontSize: '0.7rem', color: 'grey', fontWeight: 'normal' }}>mL</span>
      </Typography>
    </Box>

    <Box sx={{ 
      display: 'flex', 
      gap: { xs: 1, sm: 2 }, 
      backgroundColor: isDarkMode ? theme.palette.action.hover : '#F9FAFB', 
      p: 1, 
      borderRadius: '8px',
      flex: { xs: 1, md: 'none' },
      justifyContent: 'space-around'
    }}>
      <BalanceStat label="IV" value={totals.iv} />
      <BalanceStat label="NG/RT" value={totals.rt} />
      <BalanceStat label="ORAL" value={totals.oral} />
    </Box>
  </Box>

  {/* Vertical Divider - Desktop Only */}
  <Divider orientation="vertical" flexItem sx={{ mx: 2, display: { xs: 'none', md: 'block' } }} />
  
  {/* Horizontal Spacer - Mobile Only */}
  <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%', height: '1px', bgcolor: '#eee' }} />

  {/* Total Output Section */}
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: { xs: 1, sm: 2, md: 3 }, 
    flex: { md: 2 },
    width: '100%',
    justifyContent: { xs: 'space-between', md: 'flex-start' }
  }}>
    <Box sx={{ minWidth: '80px' }}>
      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'grey', display: 'block' }}>Total Output</Typography>
      <Typography variant="h6" sx={{ color: '#EF4444', fontWeight: 'bold', lineHeight: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
        {totalOutput} <span style={{ fontSize: '0.7rem', color: 'grey', fontWeight: 'normal' }}>mL</span>
      </Typography>
    </Box>

    <Box sx={{ 
      display: 'flex', 
      gap: { xs: 1, sm: 2 }, 
      backgroundColor: isDarkMode ? theme.palette.action.hover : '#F9FAFB', 
      p: 1, 
      borderRadius: '8px',
      flex: { xs: 1, md: 'none' },
      justifyContent: 'space-around'
    }}>
      <BalanceStat label="Urine" value={totals.urine} />
      <BalanceStat label="Asp." value={totals.aspiration} /> {/* Shortened label for mobile */}
      <BalanceStat label="Stool" value={totals.stool} />
    </Box>
  </Box>

  {/* Fluid Balance Status */}
  <Box sx={{ 
    width: { xs: '100%', md: 'auto' },
    minWidth: { md: '140px' },
    ml: { md: 2 }, 
    p: { xs: 1, md: 1.5 }, 
    borderRadius: '8px', 
    backgroundColor: balance >= 0 ? '#F0FDF4' : '#FEF2F2',
    textAlign: 'center',
    border: `1px solid ${balance >= 0 ? '#BBF7D0' : '#FECACA'}`,
    display: 'flex',
    flexDirection: { xs: 'row', md: 'column' },
    justifyContent: { xs: 'space-between', md: 'center' },
    alignItems: 'center'
  }}>
    <Typography variant="caption" sx={{ color: balance >= 0 ? '#166534' : '#991B1B', fontWeight: 'bold', fontSize: '0.7rem' }}>
      Fluid Balance
    </Typography>
    <Typography variant="h6" sx={{ color: balance >= 0 ? '#166534' : '#991B1B', fontWeight: 'bold', fontSize: { xs: '0.9rem', md: '1.1rem' } }}>
      {balance} mL
    </Typography>
  </Box>
</Paper>
    <Dialog
  open={openEntryDialog}
  onClose={() => setOpenEntryDialog(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{ 
    sx: { 
      borderRadius: "16px", 
      p: 2.5, 
      backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff'
    } 
  }}
>
  {/* ===== Header ===== */}
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography fontWeight={600} sx={{ color: isDarkMode ? theme.palette.text.primary : '#000' }}>
      Input Output Entry
    </Typography>
    <IconButton onClick={() => setOpenEntryDialog(false)}>
      <CloseIcon />
    </IconButton>
  </Box>

  {/* ===== Vitals ===== */}
{/* ===== Vitals Section ===== */}
<Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={1.5} mt={2}>
  {[
    { icon: <FavoriteIcon color="error" />, field: "heartRate", placeholder: "150" },
    { icon: <WaterDropIcon color="primary" />, field: "spo2", placeholder: "98" },
    { icon: <LocalFireDepartmentIcon color="warning" />, field: "temp", placeholder: "35.6" },
    { icon: <AirIcon color="info" />, field: "respRate", placeholder: "71" },
  ].map((v) => {
    const hasError = !!validationErrors[v.field];
    
    return (
      <Box key={v.field} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          px={1.5}
          py={0.5}
          border={hasError ? "1px solid #d32f2f" : "1px solid #E5E7EB"}
          borderRadius="10px"
          sx={{ 
            backgroundColor: hasError ? alpha("#d32f2f", 0.05) : "transparent",
            transition: "all 0.2s ease" 
          }}
        >
          {v.icon}
          <TextField
            variant="standard"
            placeholder={v.placeholder}
            inputProps={{ inputMode: 'decimal' }}
            value={entry[v.field as keyof typeof entry]}
            onChange={(e) => {
               // Allow only numbers and one decimal
               const val = e.target.value.replace(/[^0-9.]/g, "");
               if ((val.match(/\./g) || []).length <= 1) {
                 handleInputChange(v.field, val);
               }
            }}
            InputProps={{ 
              disableUnderline: true, 
              sx: { fontSize: "0.9rem", color: isDarkMode ? theme.palette.text.primary : '#000', fontWeight: 500 } 
            }}
          />
        </Box>
        {/* Warning Message Below the Box */}
        {hasError && (
          <Typography 
            variant="caption" 
            sx={{ color: "#d32f2f", mt: 0.5, ml: 1, fontSize: '0.65rem', fontWeight: 600 }}
          >
            {validationErrors[v.field]}
          </Typography>
        )}
      </Box>
    );
  })}
</Box>
  {/* ===== IV Fluid ===== */}
  <Box mt={2}>
    <Typography fontWeight={600} sx={{ color: isDarkMode ? theme.palette.text.primary : '#000', mb: 0.5 }}>I.V Fluid</Typography>
    <QuantityInput 
      
      value={entry.ivFluid} 
      onChange={(val: any) => handleInputChange("ivFluid", val)} 
      // Ensure the internal text color of QuantityInput is also black in its definition
    />
    <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
      {["2.0", "5.0", "10.0", "15.0", "50.0"].map((val) => (
        <Chip
          key={val}
          label={`${val} mL`}
          clickable
          onClick={() => handleInputChange("ivFluid", val)}
          sx={{
            backgroundColor: entry.ivFluid === val ? "#BAE6FD" : "#E0F2FE",
            color: "#000", // Text color black
            fontWeight: 500,
          }}
        />
      ))}
    </Box>
  </Box>

  {/* ===== By Mouth ===== */}
  <Box mt={2}>
    <Typography fontWeight={600} sx={{ color: isDarkMode ? theme.palette.text.primary : '#000', mb: 0.5 }}>By Mouth</Typography>
    <QuantityInput 
       
      value={entry.byMouth} 
      onChange={(val: any) => handleInputChange("byMouth", val)} 
    />
  </Box>

  {/* ===== RT Feed / NG ===== */}
  <Box mt={2}>
    <Typography fontWeight={600} sx={{ color: isDarkMode ? theme.palette.text.primary : '#000', mb: 0.5 }}>RT Feed / NG</Typography>
    <QuantityInput 
   
      value={entry.rtFeed} 
      onChange={(val: any) => handleInputChange("rtFeed", val)} 
    />
    <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
      {["12.0", "13.0", "15.0", "20.0", "NBM"].map((val) => (
        <Chip
          key={val}
          label={val === "NBM" ? val : `${val} mL`}
          clickable
          onClick={() => handleInputChange("rtFeed", val)}
          sx={{
            backgroundColor: entry.rtFeed === val ? "#BAE6FD" : "#E0F2FE",
            color: "#000", // Text color black
            fontWeight: 500,
          }}
        />
      ))}
    </Box>
  </Box>

  {/* ===== Outputs ===== */}
  <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1.5} mt={2}>
  {[
    { label: "Aspiration", field: "aspiration", volField: "aspirationVol" },
    { label: "Urine", field: "urine", volField: "urineVol" },
    { label: "Drain / Stool", field: "stool", volField: "stoolVol" },
  ].map((item) => {
    const isChecked = !!entry[item.field as keyof typeof entry];
    
    return (
      <Box
        key={item.field}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        px={2}
        py={isChecked ? 1 : 0.5} // Slightly more padding when open
        border="1px solid"
        borderColor={isChecked ? "#0284C7" : "#E5E7EB"}
        borderRadius="10px"
        sx={{
          transition: "all 0.2s ease-in-out",
          backgroundColor: isChecked ? (isDarkMode ? "#1a3a52" : "#F0F9FF") : (isDarkMode ? theme.palette.background.paper : "#FFFFFF"),
          minHeight: "45px"
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography 
            fontSize="0.85rem" 
            sx={{ color: isDarkMode ? theme.palette.text.primary : '#000000' }}
            fontWeight={isChecked ? 600 : 500}
          >
            {item.label}
          </Typography>
          <Checkbox
            size="small"
            checked={isChecked}
            onChange={(e) => handleInputChange(item.field, e.target.checked)}
            sx={{
              color: '#000000', // Black border when unchecked
              '&.Mui-checked': { color: '#0284C7' },
              p: 0.5
            }}
          />
        </Box>

        {/* Volume Input Field - Appears only when checked */}
        {isChecked && (
          <TextField
            variant="standard"
            placeholder="0"
            type="number"
            fullWidth
            autoFocus
            value={entry[item.volField as keyof typeof entry] || ""}
            onChange={(e) => handleInputChange(item.volField, e.target.value)}
            InputProps={{
              disableUnderline: false,
              endAdornment: (
                <Typography sx={{ color: isDarkMode ? theme.palette.text.secondary : "#000000", fontSize: "0.75rem", ml: 0.5 }}>
                  ml
                </Typography>
              ),
              style: { 
                fontSize: '0.85rem', 
                color: isDarkMode ? theme.palette.text.primary : '#000000',
                fontWeight: 500 
              }
            }}
            sx={{ 
              mt: 0.5,
              '& .MuiInput-underline:before': { borderBottomColor: '#E5E7EB' },
              '& .MuiInput-underline:after': { borderBottomColor: '#0284C7' },
            }}
          />
        )}
      </Box>
      
    );
  })}
</Box>

  {/* ===== Remarks ===== */}
  <Box mt={2}>
    <Typography fontWeight={600} mb={0.5} sx={{ color: isDarkMode ? theme.palette.text.primary : '#000' }} fontSize="0.9rem">
      Remarks
    </Typography>
    <TextField
      fullWidth
      placeholder="Type or Search"
      value={entry.remarks}
      onChange={(e) => handleInputChange("remarks", e.target.value)}
      sx={{
        backgroundColor: isDarkMode ? theme.palette.background.default : "#F9FAFB",
        borderRadius: "10px",
        "& .MuiOutlinedInput-root": { 
          borderRadius: "10px",
          color: isDarkMode ? theme.palette.text.primary : '#000' // Text inside remarks field
        },
      }}
    />
  </Box>

  {/* ===== Footer Details ===== */}
  <Box display="flex" justifyContent="space-between" mt={2} px={1}>
  <Typography variant="caption" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#000', opacity: 0.7 }}>
   BY : {props.UserRole}
  </Typography>

  <Typography variant="caption" sx={{ color: isDarkMode ? theme.palette.text.secondary : '#000', opacity: 0.7 }}>
    {formattedDateTime}
  </Typography>
</Box>

  <Divider sx={{ my: 2 }} />

  {/* ===== Actions ===== */}
  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
  <Button
    variant="outlined"
    onClick={() => setOpenEntryDialog(false)}
    disabled={isSubmitting}
    sx={{ 
      borderRadius: "10px", 
      textTransform: "none", 
      color: isDarkMode ? theme.palette.text.primary : "#000", 
      borderColor: isDarkMode ? theme.palette.divider : "#E5E7EB" 
    }}
  >
    Cancel
  </Button>
  <Button
    startIcon={isSubmitting ? null : <AddIcon />}
    variant="contained"
    onClick={handleAddEntry}
    disabled={!isFormValid || isSubmitting} // Validation logic applied here
    sx={{
      borderRadius: "10px",
      textTransform: "none",
      backgroundColor: isFormValid ? "#E0F2FE" : "#F3F4F6",
      color: isFormValid ? "#0284C7" : "#9CA3AF",
      boxShadow: "none",
      fontWeight: 600,
      "&:hover": { backgroundColor: "#BAE6FD", boxShadow: "none" },
      "&.Mui-disabled": { backgroundColor: "#F3F4F6", color: "#9CA3AF" }
    }}
  >
    {isSubmitting ? "Saving..." : "Add"}
  </Button>
</Box>
</Dialog>

<Snackbar open={saveSuccess} autoHideDuration={6000}  onClose={() => setSaveSuccess(false)}>
        <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }}> Report saved successfully! </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}> {error} </Alert>
      </Snackbar>
    </Box>
  );
};

