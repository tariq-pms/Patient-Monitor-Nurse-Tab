import {Box,Typography,Button,IconButton,Paper,Divider,Dialog,TextField,Chip, Snackbar, Alert, Grid, TableBody, Table, TableCell, TableRow, TableHead,} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";

import { alpha  } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PatientDetails {
 
  patient_resource_id: string;
  patient_name: string;
  patient_id: string;
  gestational_age: string;
  birth_date:string;
  UserRole: string;
  userOrganization?: string;
  canEdit?: boolean;
}
export const VentiChart: React.FC<PatientDetails> = (props) => {
const theme = useTheme();
const isDarkMode = theme.palette.mode === "dark";



const [saveSuccess, setSaveSuccess] = useState(false);
const [error, setError] = useState<string | null>(null);
const [chartData, setChartData] = React.useState<any[]>([]);
const [ventEntry, setVentEntry] = useState({
  weight:"",
  temp:"",
  pulse:"",
  bpSys:"",
  bpDia:"",
  spo2:"",
  rr:"",

  ventMode:"",
  fio2:"",
  etDepth:"",

  pip:"",
  peep:"",
  rate:"",

  ivVolume:"",
  ivInfo:"",

  rta:"",

  rtf:"",
  feedType:"",

  urineOutput:"",

  stoolFrequency:"",

  notes:""
});


const handleSaveVentilation = async () => {

  const safeNumber = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  };

  const components = [

    { code:{text:"Weight"}, valueQuantity:{value:safeNumber(ventEntry.weight),unit:"g"} },

    { code:{text:"Temperature"}, valueQuantity:{value:safeNumber(ventEntry.temp),unit:"°C"} },

    { code:{text:"Pulse"}, valueQuantity:{value:safeNumber(ventEntry.pulse),unit:"bpm"} },

    { code:{text:"BP Sys"}, valueQuantity:{value:safeNumber(ventEntry.bpSys),unit:"mmHg"} },

    { code:{text:"BP Dia"}, valueQuantity:{value:safeNumber(ventEntry.bpDia),unit:"mmHg"} },

    { code:{text:"SpO2"}, valueQuantity:{value:safeNumber(ventEntry.spo2),unit:"%"} },

    { code:{text:"Resp Rate"}, valueQuantity:{value:safeNumber(ventEntry.rr),unit:"/min"} },

    { code:{text:"Vent Mode"}, valueString: ventEntry.ventMode },

    { code:{text:"FiO2"}, valueQuantity:{value:safeNumber(ventEntry.fio2),unit:"%"} },

    { code:{text:"ET Depth"}, valueQuantity:{value:safeNumber(ventEntry.etDepth),unit:"cm"} },

    { code:{text:"PIP"}, valueQuantity:{value:safeNumber(ventEntry.pip),unit:"cmH2O"} },

    { code:{text:"PEEP"}, valueQuantity:{value:safeNumber(ventEntry.peep),unit:"cmH2O"} },

    { code:{text:"Rate Set"}, valueQuantity:{value:safeNumber(ventEntry.rate),unit:"/min"} },

    { code:{text:"IV Volume"}, valueQuantity:{value:safeNumber(ventEntry.ivVolume),unit:"mL"} },

    { code:{text:"IV Info"}, valueString: ventEntry.ivInfo },

    { code:{text:"RTA"}, valueString: ventEntry.rta },

    { code:{text:"RT Feed"}, valueQuantity:{value:safeNumber(ventEntry.rtf),unit:"mL"} },

    { code:{text:"Feed Type"}, valueString: ventEntry.feedType },

    { code:{text:"Urine Output"}, valueString: ventEntry.urineOutput },

    { code:{text:"Stool Frequency"}, valueString: ventEntry.stoolFrequency }

  ].filter(c =>
    (c.valueQuantity && c.valueQuantity.value !== undefined) ||
    (c.valueString && c.valueString !== "")
  );

  const observation = {
    resourceType: "Observation",
    status: "final",

    subject: {
      reference: `Patient/${props.patient_resource_id}`
    },

    effectiveDateTime: new Date().toISOString(),

  code: {
  coding: [
    {
      system: "http://example.org/clinical",
      code: "ventilation-entry",
      display: "Ventilation Entry"
    }
  ],
  text: "Ventilation Entry"
},

    component: components,

    note: ventEntry.notes
      ? [{ text: ventEntry.notes }]
      : undefined,

    performer: [
      { display: props.UserRole }
    ]
  };

  // VALIDATION CHECK
  const hasErrors = 
    Number(ventEntry.weight) > 10000 ||
    Number(ventEntry.temp) > 45 ||
    Number(ventEntry.pulse) > 300 ||
    Number(ventEntry.bpSys) > 300 ||
    Number(ventEntry.bpDia) > 200 ||
    Number(ventEntry.spo2) > 100 ||
    Number(ventEntry.rr) > 150 ||
    Number(ventEntry.fio2) > 100 ||
    Number(ventEntry.pip) > 80 ||
    Number(ventEntry.peep) > 30 ||
    Number(ventEntry.rate) > 150 ||
    Number(ventEntry.ivVolume) > 1000 ||
    Number(ventEntry.rtf) > 200;

  if (hasErrors) {
    setError("Please fix validation errors before saving.");
    return;
  }

  try {

    const res = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Observation`,{
      method:"POST",
      headers:{
        "Content-Type":"application/fhir+json",
        Authorization:"Basic "+btoa("fhiruser:change-password")
      },
      body:JSON.stringify(observation)
    });

    if(!res.ok){
      const errorText = await res.text();
      console.error("FHIR Error:", errorText);
      setError("Failed to save entry");
    } else {
      console.log("Ventilation entry saved");
      setSaveSuccess(true);
      setOpenEntryDialog(false);
      await fetchEntries();
      setVentEntry({
        weight:"", temp:"", pulse:"", bpSys:"", bpDia:"", spo2:"", rr:"",
        ventMode:"", fio2:"", etDepth:"", pip:"", peep:"", rate:"",
        ivVolume:"", ivInfo:"", rta:"", rtf:"", feedType:"", urineOutput:"", stoolFrequency:"", notes:""
      });
    }

  } catch(err){
    console.error("Network error:", err);
    setError("Network error occurred");
  }

};

const handleInputChange = (field: string, value: string | boolean) => {

  // ---------- BOOLEAN (Checkbox) ----------
  if (typeof value === "boolean") {
    setVentEntry((prev) => ({
      ...prev,
      [field]: value,
      ...(value === false && field === "aspiration" ? { aspirationVol: "" } : {}),
      ...(value === false && field === "urine" ? { urineVol: "" } : {}),
      ...(value === false && field === "stool" ? { stoolVol: "" } : {}),
    }));
    return;
  }


  // ---------- TEXT FIELDS ----------
const textFields = ["remarks","ivInfo","ventMode","rta","feedType","urineOutput","stoolFrequency","notes"];
  if (textFields.includes(field)) {
    setVentEntry((prev) => ({
      ...prev,
      [field]: value,
    }));
    return;
  }


  // ---------- NUMERIC SANITIZATION ----------
  const numericValue = value.replace(/[^0-9.]/g, "");

  // prevent multiple decimals
  if ((numericValue.match(/\./g) || []).length > 1) return;

  const num = parseFloat(numericValue);

  if (!isNaN(num)) {
    // Limits handled visually by maxLengths and error states in the dialog
  }

  setVentEntry((prev) => ({
    ...prev,
    [field]: numericValue,
  }));
};

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
  if (chartData.length === 0) return;

  const doc = new jsPDF("l", "pt", "a4");
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
  
  // Right side Info Box
  const rightX = pageWidth - 40 - 250; 
  const boxY = logoY + 10;
    
  // Grey Tab
  doc.setFillColor(224, 228, 231); 
  doc.rect(rightX + 50, boxY - 14, 160, 14, "F");
  doc.setFontSize(9);
  doc.setTextColor(51, 51, 51); 
  doc.setFont("helvetica", "bold");
  doc.text("VENTILATION CHART", rightX + 65, boxY - 4);
    
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
  const tableRows = chartData.map(entry => [
    `${entry.time}\n${entry.staff}`,
    entry.weight || "-",
    entry.temp || "-",
    entry.pulse || "-",
    entry.bp || "-",
    entry.spo2 || "-",
    entry.rr || "-",
    entry.mode || "-",
    entry.fio2 || "-",
    entry.et || "-",
    entry.pip || "-",
    entry.peep || "-",
    entry.rate || "-",
    `${entry.iv || "-"}\n${entry.ivInfo || "-"}`,
    `${entry.rtf || "-"}\n${entry.feedType || "-"}`,
    entry.rta || "-",
    entry.urine || "-",
    entry.stool || "-"
  ]);

  // 5. Main Data Table
  autoTable(doc, {
    startY: boxY + 65,
    head: [
      [
        { content: 'TIME & STAFF', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'BABY VITALS', colSpan: 6, styles: { halign: 'center', fillColor: [59, 130, 246] } },
        { content: 'VENTILATION', colSpan: 6, styles: { halign: 'center', fillColor: [16, 185, 129] } },
        { content: 'FLUIDS & FEED', colSpan: 2, styles: { halign: 'center', fillColor: [139, 92, 246] } },
        { content: 'OUTPUTS', colSpan: 3, styles: { halign: 'center', fillColor: [249, 115, 22] } }
      ],
      [
        'WT (G)', 'TEMP (°C)', 'PULSE (BPM)', 'BP (S/D)', 'SPO2 (%)', 'RR (R/M)',
        'MODE', 'FIO2', 'ET LE', 'PIP', 'PEEP', 'RATE',
        'IV FLUIDS', 'RTF FEED',
        'RTA', 'URINE', 'STOOL'
      ]
    ],
    body: tableRows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5, halign: 'center', textColor: [0, 0, 0] },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 7 }
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
  doc.save(`Venti_Chart_${props.patient_name || 'Record'}.pdf`);
};

const fetchEntries = async () => {
  try {

const url = `${import.meta.env.VITE_FHIRAPI_URL}/Observation?subject=Patient/${props.patient_resource_id}&code=ventilation-entry&_sort=-date`;

    const response = await fetch(url,{
      headers:{
        Authorization:"Basic "+btoa("fhiruser:change-password")
      }
    });

    const data = await response.json();

    if(!data.entry){
      setChartData([]);
      return;
    }

    const formatted = data.entry.map((item:any)=>{

      const obs = item.resource;

     const getVal = (name: string) => {
      return obs.component?.find(
       (c: any) =>
         c.code?.text === name ||
           c.code?.coding?.[0]?.display === name
           );
          };

      return{

        id:obs.id,

        time:new Date(obs.effectiveDateTime).toLocaleTimeString([],{
          hour:"2-digit",
          minute:"2-digit"
        }),

        staff:obs.performer?.[0]?.display || "Nurse",

        // BABY VITALS
        weight:getVal("Weight")?.valueQuantity?.value || "-",
        temp:getVal("Temperature")?.valueQuantity?.value || "-",
        pulse:getVal("Pulse")?.valueQuantity?.value || "-",
        bp:`${getVal("BP Sys")?.valueQuantity?.value || "-"} / ${getVal("BP Dia")?.valueQuantity?.value || "-"}`,
        spo2:getVal("SpO2")?.valueQuantity?.value || "-",
        rr:getVal("Resp Rate")?.valueQuantity?.value || "-",

        // VENTILATION
        mode:getVal("Vent Mode")?.valueString || "-",
        fio2:getVal("FiO2")?.valueQuantity?.value || "-",
        et:getVal("ET Depth")?.valueQuantity?.value || "-",
        pip:getVal("PIP")?.valueQuantity?.value || "-",
        peep:getVal("PEEP")?.valueQuantity?.value || "-",
        rate:getVal("Rate Set")?.valueQuantity?.value || "-",

        // FLUIDS
        iv:getVal("IV Volume")?.valueQuantity?.value || "-",
        ivInfo:getVal("IV Info")?.valueString || "-",
        rtf:getVal("RT Feed")?.valueQuantity?.value || "-",
        feedType:getVal("Feed Type")?.valueString || "-",
        rta:getVal("RTA")?.valueString || "-",

        // OUTPUTS
        urine:getVal("Urine Output")?.valueString || "-",
        stool:getVal("Stool Frequency")?.valueString || "-"

      };

    });

    setChartData(formatted);

  } catch(err){
    console.error(err);
  }
};

useEffect(() => {
  fetchEntries();
}, [props.patient_resource_id]);

return (
 
    <Box sx={{ width: '100%', maxWidth: '100vw', p: 1, boxSizing: 'border-box' }}>
  
  {/* TOP HEADER: Title and Action Buttons */}
  <Box 
    display={'flex'} 
    flexDirection={{ xs: 'column', sm: 'row' }} 
    justifyContent={'space-between'} 
    alignItems={{ xs: 'flex-start', sm: 'center' }}
    gap={2}
    mb={2}
  >
    <Typography variant="h6" sx={{ color: isDarkMode ? theme.palette.text.primary : "#0F3B61", fontWeight: 600 }}>
      Venti Chart
    </Typography>
    
    <Box display={"flex"} alignItems="center" gap={1.5} width={{ xs: '100%', sm: 'auto' }}>
      <IconButton 
        onClick={generatePDF}
        disabled={chartData.length === 0}
        sx={{
          backgroundColor: alpha("#228BE6", 0.1),
          color: "#228BE6",
          borderRadius: "8px",
          p: 1,
          "&:hover": { backgroundColor: alpha("#228BE6", 0.2) },
          "&.Mui-disabled": { opacity: 0.5, color: "#228BE6" }
        }}
      >
        <DownloadIcon />
      </IconButton>
      {props.canEdit !== false && (
        <Button
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => setOpenEntryDialog(true)}
          sx={{
            backgroundColor: alpha("#228BE6", 0.1),
            color: "#228BE6",
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
            height: '40px'
          }}
        >
          Entry
        </Button>
      )}
    </Box>
  </Box>

  <Paper
    elevation={0}
    sx={{
      borderRadius: "12px",
      border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
      width: '100%',
      overflow: "hidden", // Prevents the paper itself from breaking
      backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff'
    }}
  >
    {/* TABLE SCROLL CONTAINER */}
    <Box sx={{ overflowX: "auto", width: '100%' }}>
      <Table size="small" sx={{ 
        minWidth: 1100, // Ensures the table keeps its shape internally
        tableLayout: 'fixed' // Better performance and predictable column widths
      }}>
        
        <TableHead>
          {/* ===== GROUP HEADER ===== */}
          <TableRow sx={{ background: isDarkMode ? theme.palette.background.default : "#F9FAFB" }}>
            <TableCell rowSpan={2} sx={{ fontSize: "0.7rem", verticalAlign: "bottom", pb: 2,  borderBottom: '1px solid grey',borderRight: '1px solid grey', width: "120px", fontWeight: 700 }}>
              TIME & STAFF
            </TableCell>
            <TableCell colSpan={6} align="center" sx={{ color: "#3B82F6", fontWeight: "bold", fontSize: "0.7rem", borderBottom: '1px solid grey', borderRight: '1px solid grey' }}>
              BABY VITALS
            </TableCell>
            <TableCell colSpan={6} align="center" sx={{ color: "#10B981", fontWeight: "bold", fontSize: "0.7rem", borderBottom: '1px solid grey', borderRight:'1px solid grey' }}>
              VENTILATION
            </TableCell>
            <TableCell colSpan={2} align="center" sx={{ color: "#8B5CF6", fontWeight: "bold", fontSize: "0.7rem", borderBottom: '1px solid grey', borderRight: '1px solid grey' }}>
              FLUIDS & FEED
            </TableCell>
            <TableCell colSpan={3} align="center" sx={{ color: "#F97316", fontWeight: "bold", fontSize: "0.7rem", borderBottom: '1px solid grey' }}>
              OUTPUTS
            </TableCell>
          </TableRow>

          {/* ===== COLUMN HEADERS ===== */}
          <TableRow   sx={{ background: isDarkMode ? theme.palette.background.paper : "#FFFFFF", "& th": { borderBottom:'1px solid grey', py: 1 } }}>
           {[
              { labels: [{l:"WT", s:"(G)"}, {l:"TEMP", s:"(°C)"}, {l:"PULSE", s:"(BPM)"}, {l:"BP", s:"(S/D)"}, {l:"SPO2", s:"(%)"}, {l:"RR", s:"(R/M)"}], color: "#EFF6FF" },
              { labels: [{l:"MODE", s:""}, {l:"FIO2", s:""}, {l:"ET LE", s:""}, {l:"PIP", s:""}, {l:"PEEP", s:""}, {l:"RATE", s:""}], color: "#ECFDF5" },
              { labels: [{l:"IV FLUIDS", s:"vol/info"}, {l:"RTF FEED", s:"vol/type"}], color: "#F5F3FF" },
              { labels: [{l:"RTA", s:"amt/color"}, {l:"URINE", s:"vol/stream"}, {l:"STOOL", s:"freq/char"}], color: "transparent" }
            ].map((group, groupIdx) => (
              group.labels.map((h, i) => (
                <TableCell 
                  key={h.l} 
                  align="center" 
                  sx={{ 
                    
                    borderRight: (i === group.labels.length - 1 && groupIdx < 3) ? "1px solid grey" : "none",
                    px: 0.5 
                  }}
                >
                  <Typography variant="subtitle2" sx={{  fontWeight: 700, color: isDarkMode ? theme.palette.text.secondary : "#6B7280"}}>{h.l}</Typography>
                  <Typography variant="caption" sx={{  color: isDarkMode ? theme.palette.text.disabled : "#9CA3AF" }}>{h.s}</Typography>
                </TableCell>
              ))
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {chartData.length > 0 ? (
            chartData.map((row) => (
              <TableRow key={row.id} hover sx={{ "& td": { borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#F3F4F6"}`, py: 1 } }}>
                <TableCell sx={{ borderRight: '1px solid grey', position: 'sticky', left: 0, background: isDarkMode ? theme.palette.background.paper : '#fff', zIndex: 1 }}>
                  <Box sx={{ display: "inline-block", background: isDarkMode ? 'rgba(37,99,235,0.2)' : "#EFF6FF", color: "#2563EB", px: 1, py: 0.5, borderRadius: "6px", mb: 0.5 }}>
                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700 }}>{row.time}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{  color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", display: 'block' }}>
                    {row.staff}
                  </Typography>
                </TableCell>

                {/* Data Cells - Simplified for responsiveness */}
                <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{row.weight}</TableCell>
                <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{row.temp}</TableCell>
                <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{row.pulse}</TableCell>
                <TableCell align="center" sx={{ color: "#EF4444", fontWeight: 700, fontSize: "0.75rem" }}>{row.bp}</TableCell>
                <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{row.spo2}</TableCell>
                <TableCell align="center" sx={{ fontSize: "0.75rem", borderRight: '1px solid grey'}}>{row.rr}</TableCell>

                {/* Vent cells... (Continue similar pattern) */}
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>{row.mode}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>{row.fio2}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>{row.et}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>{row.pip}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>{row.peep}</TableCell>
                 <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>{row.rate}</TableCell>
                
      
            
               
                {/* Fluids and Outputs (ensure borderRight logic is consistent) */}
                <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{row.iv}</TableCell>
                <TableCell align="center" sx={{ borderRight: '1px solid grey', fontSize: "0.75rem" }}>{row.rtf}</TableCell>
                
                <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{row.rta}</TableCell>
                <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{row.urine}</TableCell>
                <TableCell align="center" sx={{ fontSize: "0.75rem" }}>{row.stool}</TableCell>
              </TableRow>
            ))
            
          ) : (
            <TableRow>
              <TableCell colSpan={18} align="center" sx={{ py: 8 }}>
                <Typography variant="body2" color="textSecondary">No data recorded yet.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  </Paper>
<Dialog open={openEntryDialog} maxWidth="sm"  fullWidth
  PaperProps={{ 
    sx: { 
      borderRadius: "16px", 
      p: 2.5, 
      backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff' 
    } 
  }}>


{/* HEADER */}
<Box display="flex" justifyContent="space-between">
<Typography fontWeight={600}>New Ventilation Entry</Typography>
<IconButton onClick={()=>setOpenEntryDialog(false)}>
<CloseIcon/>
</IconButton>
</Box>

{/* 1 BABY VITALS */}

<Typography mt={2} >1. BABY VITALS</Typography>

<Grid container spacing={2} mt={1}>

<Grid item xs={4}>
<TextField label="Weight (g)" fullWidth size="small"
inputProps={{ maxLength: 6 }}
value={ventEntry.weight}
onChange={(e)=>handleInputChange("weight",e.target.value)}
error={Number(ventEntry.weight) > 10000}
helperText={Number(ventEntry.weight) > 10000 ? "Max 10000" : ""}
/>
</Grid>

<Grid item xs={4}>
<TextField label="Temp (°C)" fullWidth size="small"
inputProps={{ maxLength: 4 }}
value={ventEntry.temp}
onChange={(e)=>handleInputChange("temp",e.target.value)}
error={Number(ventEntry.temp) > 45}
helperText={Number(ventEntry.temp) > 45 ? "Max 45" : ""}
/>
</Grid>

<Grid item xs={4}>
<TextField label="Pulse (bpm)" fullWidth size="small"
inputProps={{ maxLength: 3 }}
value={ventEntry.pulse}
onChange={(e)=>handleInputChange("pulse",e.target.value)}
error={Number(ventEntry.pulse) > 300}
helperText={Number(ventEntry.pulse) > 300 ? "Max 300" : ""}
/>
</Grid>

<Grid item xs={6}>
<TextField label="BP (sys)" fullWidth size="small"
inputProps={{ maxLength: 3 }}
value={ventEntry.bpSys}
onChange={(e)=>handleInputChange("bpSys",e.target.value)}
error={Number(ventEntry.bpSys) > 300}
helperText={Number(ventEntry.bpSys) > 300 ? "Invalid BP" : ""}
/>
</Grid>

<Grid item xs={6}>
<TextField label="BP (dia)" fullWidth size="small"
inputProps={{ maxLength: 3 }}
value={ventEntry.bpDia}
onChange={(e)=>handleInputChange("bpDia",e.target.value)}
error={Number(ventEntry.bpDia) > 200}
helperText={Number(ventEntry.bpDia) > 200 ? "Invalid BP" : ""}
/>
</Grid>

<Grid item xs={6}>
<TextField label="SpO2 (%)" fullWidth size="small"
inputProps={{ maxLength: 3 }}
value={ventEntry.spo2}
onChange={(e)=>handleInputChange("spo2",e.target.value)}
error={Number(ventEntry.spo2) > 100}
helperText={Number(ventEntry.spo2) > 100 ? "Max 100" : ""}
/>
</Grid>

<Grid item xs={6}>
<TextField label="Total RR (b/min)" fullWidth size="small"
inputProps={{ maxLength: 3 }}
value={ventEntry.rr}
onChange={(e)=>handleInputChange("rr",e.target.value)}
error={Number(ventEntry.rr) > 150}
helperText={Number(ventEntry.rr) > 150 ? "Max 150" : ""}
/>
</Grid>
</Grid>


{/* 2 MODE & FIO2 */}

<Typography mt={3} fontWeight={600}>2. MODE & FIO₂</Typography>

<Grid container spacing={2} mt={1}>

<Grid item xs={4}>
<TextField label="Vent Mode" fullWidth size="small"
placeholder="SIMV" inputProps={{ maxLength: 20 }}
value={ventEntry.ventMode}
onChange={(e)=>handleInputChange("ventMode",e.target.value)}
/>
</Grid>

<Grid item xs={4}>
<TextField label="FiO₂ %" fullWidth size="small"
placeholder="21-100" inputProps={{ maxLength: 3 }}
value={ventEntry.fio2}
onChange={(e)=>handleInputChange("fio2",e.target.value)}
error={Number(ventEntry.fio2) > 100}
helperText={Number(ventEntry.fio2) > 100 ? "Max 100" : ""}
/>
</Grid>

<Grid item xs={4}>
<TextField label="ET Tube Depth (cm)" fullWidth size="small"
inputProps={{ maxLength: 4 }}
value={ventEntry.etDepth}
onChange={(e)=>handleInputChange("etDepth",e.target.value)}
/>
</Grid>

</Grid>


{/* 3 PRESSURES */}

<Typography mt={3} fontWeight={600}>3. PRESSURES & RATE</Typography>

<Grid container spacing={2} mt={1}>

<Grid item xs={4}>
<TextField label="PIP (cmH2O)" fullWidth size="small"
inputProps={{ maxLength: 3 }}
value={ventEntry.pip}
onChange={(e)=>handleInputChange("pip",e.target.value)}
error={Number(ventEntry.pip) > 80}
helperText={Number(ventEntry.pip) > 80 ? "Max 80" : ""}
/>
</Grid>

<Grid item xs={4}>
<TextField label="PEEP (cmH2O)" fullWidth size="small"
inputProps={{ maxLength: 3 }}
value={ventEntry.peep}
onChange={(e)=>handleInputChange("peep",e.target.value)}
error={Number(ventEntry.peep) > 30}
helperText={Number(ventEntry.peep) > 30 ? "Max 30" : ""}
/>
</Grid>

<Grid item xs={4}>
<TextField label="Rate Set (b/min)" fullWidth size="small"
inputProps={{ maxLength: 3 }}
value={ventEntry.rate}
onChange={(e)=>handleInputChange("rate",e.target.value)}
error={Number(ventEntry.rate) > 150}
helperText={Number(ventEntry.rate) > 150 ? "Max 150" : ""}
/>
</Grid>

</Grid>
{/* 4 IV FLUID */}
<Typography mt={3} fontWeight={600}>4. IV FLUIDS</Typography>
<Grid container spacing={2} mt={1}>
<Grid item xs={4}>
<TextField label="Volume (mL)" fullWidth size="small"
inputProps={{ maxLength: 4 }}
value={ventEntry.ivVolume}
onChange={(e)=>handleInputChange("ivVolume",e.target.value)}
error={Number(ventEntry.ivVolume) > 1000}
helperText={Number(ventEntry.ivVolume) > 1000 ? "Max 1000" : ""}
/>
</Grid>
<Grid item xs={8}>
<TextField label="Type, Site, Rate..." fullWidth size="small"
inputProps={{ maxLength: 100 }}
value={ventEntry.ivInfo}
onChange={(e)=>handleInputChange("ivInfo",e.target.value)}
/>
</Grid>
</Grid>
{/* 5 RTA */}

<Typography mt={3} fontWeight={600}>
5. RTA (RESTING TUMMY ASPIRATE)
</Typography>

<Box mt={1} display="flex" gap={1}>

{["Nil","Small (<2ml)","Medium (2-5ml)","Large (>5ml)"].map((val)=>(
<Chip key={val} label={val} clickable onClick={()=>handleInputChange("rta",val)} color={ventEntry.rta===val?"primary":"default"} />))}
</Box>
{/* 6 RTF */}

<Typography mt={3} fontWeight={600}>
6. RTF (FEED VOLUME)
</Typography>

<Grid container spacing={2} mt={1}>

<Grid item xs={12}>
<TextField
label="Volume (mL)"
fullWidth size="small"
inputProps={{ maxLength: 4 }}
value={ventEntry.rtf}
onChange={(e)=>handleInputChange("rtf",e.target.value)}
placeholder="Given ml"
error={Number(ventEntry.rtf) > 200}
helperText={Number(ventEntry.rtf) > 200 ? "Max 200" : ""}
/>
</Grid>

<Grid item xs={12}>
<Typography fontSize="0.75rem" color="text.secondary" mb={1}>
FEED TYPE
</Typography>

<Box display="flex" gap={1}>

{["EBM","DBM","Formula"].map((type)=>(
<Chip
key={type}
label={type}
clickable
color={ventEntry.feedType===type?"primary":"default"}
onClick={()=>handleInputChange("feedType",type)}
/>
))}

</Box>

</Grid>

</Grid>
{/* 7 URINE OUTPUT */}

<Typography mt={3} fontWeight={600}>
7. URINE OUTPUT
</Typography>

<Box mt={1} display="flex" gap={1}>

{["Passed","Not Passed"].map((val)=>(
<Chip
key={val}
label={val}
clickable
color={ventEntry.urineOutput===val?"primary":"default"}
onClick={()=>handleInputChange("urineOutput",val)}
/>
))}

</Box>
{/* 8 STOOL FREQUENCY */}

<Typography mt={3} fontWeight={600}>
8. STOOL FREQUENCY
</Typography>

<Box mt={1} display="flex" gap={1} flexWrap="wrap">

{[
"Nil",
"Once (1x)",
"Twice (2x)",
"Thrice (3x)",
"More than thrice (3+)"
].map((val)=>(
<Chip
key={val}
label={val}
clickable
color={ventEntry.stoolFrequency===val?"primary":"default"}
onClick={()=>handleInputChange("stoolFrequency",val)}
/>
))}

</Box>
{/* 9 ADDITIONAL NOTES */}

<Typography mt={3} fontWeight={600}>
9. ADDITIONAL NOTES
</Typography>

<TextField
fullWidth size="small"
multiline
rows={3}
placeholder="Enter clinical notes, procedures, or observations..."
value={ventEntry.notes}
onChange={(e)=>handleInputChange("notes",e.target.value)}
inputProps={{ maxLength: 500 }}
sx={{ mt:1 }}
/>

{/* FOOTER */}

<Box mt={4} display="flex" justifyContent="space-between">
<Typography variant="caption">BY : {props.UserRole}</Typography>
<Typography variant="caption">{formattedDateTime}</Typography>
</Box>
<Divider sx={{my:2}}/>
<Box display="flex" gap={2}>
<Button fullWidth variant="outlined"
onClick={()=>setOpenEntryDialog(false)}>
Cancel
</Button>
<Button fullWidth variant="contained"
onClick={handleSaveVentilation}>
Save
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

