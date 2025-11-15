import React, { useEffect, useState } from 'react';
import { Box, Typography, Dialog,
  DialogTitle,
  DialogContent,
  IconButton,TextField, Button, Select, MenuItem, Snackbar, Alert, Card, CardContent, 
  Stack,
  Tooltip} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { ProtectedModule } from './ProtectedModule';

import jsPDF from "jspdf";
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from "@mui/icons-material/Close";



interface NotesProps {

  patient_resource_id: string;
  patient_name: string;
  patient_id: string;
  gestational_age: string;
  birth_date:string;
  UserRole: string;

}
// export const DeviceInService: React.FC<DeviceInServiceProps> = ({
export const Notes: React.FC<NotesProps> = (props) => {

  const [note, setNote] = useState('');
  const [noteType, setNoteType] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
const [fetchedNotes, setFetchedNotes] = useState<{
  author: string;
  date: string | number | Date; summary: string; noteType: string 
}[]>([]);
  const [open, setOpen] = useState(false);


  useEffect(() => {
    fetchNotes();
  }, [props.patient_resource_id]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/ClinicalImpression?subject=Patient/${props.patient_resource_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        }
      );

      const data = await response.json();
      if (data.entry) {
        const notes = data.entry.map((entry: any) => ({
          summary: entry.resource.summary,
          noteType: entry.resource.investigation?.[0]?.code?.text || "General",
        }));
        setFetchedNotes(notes);
      } else {
        setFetchedNotes([]);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

const handleCloseSnackbar = () => {
  setSnackbarOpen(false);
};

const [dateFilter] = useState('all');
const [categoryFilter] = useState('all');
const [authorFilter] = useState('all');
const [filteredNotes, setFilteredNotes] = useState(fetchedNotes);

useEffect(() => {
  const filtered = fetchedNotes.filter(note => {
    // Date filtering
    const noteDate = new Date(note.date);
    const now = new Date();
    
    if (dateFilter === 'today' && 
        !(noteDate.getDate() === now.getDate() && 
          noteDate.getMonth() === now.getMonth() && 
          noteDate.getFullYear() === now.getFullYear())) {
      return false;
    }
    
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      if (noteDate < oneWeekAgo) return false;
    }
    
    if (dateFilter === 'month') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      if (noteDate < oneMonthAgo) return false;
    }
    
    // Category filtering
    if (categoryFilter !== 'all' && note.noteType !== categoryFilter) {
      return false;
    }
    
    // Author filtering
    if (authorFilter !== 'all' && note.author !== authorFilter) {
      return false;
    }
    
    return true;
  });
  
  setFilteredNotes(filtered);
}, [dateFilter, categoryFilter, authorFilter, fetchedNotes]);




  // const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  const detectNoteType = (transcript: string): string => {
    const keywordPatterns = [
      { pattern: /medication|prescription|drug|pill/, type: "Medication" },
      { pattern: /condition|diagnosis|disease/, type: "Conditions" },
      { pattern: /feed|fluid|nutrition/, type: "Feeds & Fluids" },
      { pattern: /assessment|evaluation/, type: "Assessment" },
      { pattern: /care plan|treatment plan/, type: "Care plan" },
      { pattern: /investigation|test|lab/, type: "Investigation" },
      { pattern: /alarm|alert/, type: "Alarms" },
      { pattern: /care event|visit/, type: "Care Events" },
      { pattern: /observation|monitoring/, type: "Observation" },
      { pattern: /procedure|surgery/, type: "Procedures" },
      { pattern: /therapy|treatment/, type: "Therapies" },
      { pattern: /management|admin/, type: "Management" },
    ];
  
    for (const { pattern, type } of keywordPatterns) {
      if (pattern.test(transcript)) {
        return type; // Returns the matched category (e.g., "Medication")
      }
    }
    return ''; // No match found
  };
  

  recognition.onresult = (event:any) => {
    const transcript = event.results[0][0].transcript;
    setNote(transcript);
    setIsListening(false);

    const detectedType = detectNoteType(transcript);
    if (detectedType) {
      setNoteType(detectedType); // Updates the Select dropdown
    }
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Function to send the ClinicalImpression resource to FHIR server
  const submitNote = async () => {
    
    if (!note.trim()) {
      alert("Note cannot be empty!");
      return;
    }
  
    const clinicalImpression = {
      resourceType: "ClinicalImpression",
      status: "completed", // Required field
      subject: { reference: `Patient/${props.patient_resource_id}` }, // Dynamic Patient ID
      assessor: { reference: "Practitioner/456" }, // Replace with actual Practitioner ID
      investigation: [
        {
          code: {
            text: noteType || "General Note",
          },
        },
      ],
      summary: note, // Summary of impression
    };
  
    try {
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/ClinicalImpression`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(clinicalImpression),
      });
  
      const text = await response.text(); // Read response as text
  
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text); // Parse only if there's valid JSON
        } catch (error) {
          console.warn("Response is not valid JSON:", text);
        }
      }
  
      if (!response.ok) {
        throw new Error(`Error: ${data?.issue?.[0]?.details?.text || "Failed to save note"}`);
      }
  
      setSnackbarMessage("Note saved successfully!");
       setSnackbarSeverity("success");
       setSnackbarOpen(true);
       fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      setSnackbarMessage("An error occurred while saving the note.");
     setSnackbarSeverity("error");
       setSnackbarOpen(true);
      
    }
  };
  
  const downloadNotesPDF = async () => {

    const doc = new jsPDF("p", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();

    const margin = 40;

    let startY = 50;

 

    // =========================

    // Header: Organization Name + Logo

    // =========================

    let orgName = "Unknown Organization";

    let logoDataUrl: string | null = null;

 

    try {

      const orgUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Organization/190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83`;

      const res = await fetch(orgUrl, {

        headers: {

          Authorization: "Basic " + btoa("fhiruser:change-password"),

          Accept: "application/fhir+json",

        },

      });

      if (!res.ok) throw new Error(`Organization fetch failed: ${res.status}`);

      const orgData = await res.json();

      orgName = orgData.name || orgName;

 

      const extensions = Array.isArray(orgData.extension) ? orgData.extension : [];

      const logoExt = extensions.find(

        (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/organization-logo"

      );

      const logoRef = logoExt?.valueReference?.reference;

 

      if (logoRef) {

        const binaryId = logoRef.replace("Binary/", "");

        const binaryUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Binary/${binaryId}`;

        const binaryRes = await fetch(binaryUrl, {

          headers: {

            Authorization: "Basic " + btoa("fhiruser:change-password"),

            Accept: "application/fhir+json",

          },

        });

        if (!binaryRes.ok) throw new Error(`Binary fetch failed: ${binaryRes.status}`);

        const binaryData = await binaryRes.json();

        if (binaryData.data && binaryData.contentType) {

          logoDataUrl = `data:${binaryData.contentType};base64,${binaryData.data}`;

        }

      }

    } catch (err) {

      console.error("❌ Error fetching organization/logo:", err);

    }

 

    // Draw Logo

    const logoBoxSize = 60;

    const logoX = 40;

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

 

    // Organization Name

    doc.setFont("helvetica", "bold");

    doc.setFontSize(14);

    doc.text(orgName, logoX + logoBoxSize + 10, logoY + 15);

    doc.setFontSize(11);

    doc.text("NOTES REPORT", logoX + logoBoxSize + 10, logoY + 35);

 

    doc.setDrawColor(180);

    doc.line(10, 70, pageWidth - 10, 70);

    // =========================

// Patient Info

// =========================

doc.setFont("helvetica", "normal");

doc.setFontSize(10);



const patientY = 85;

const lineGap = 15; // spacing between patient info lines

doc.text(`Name: ${props.patient_name}`, 40, patientY);
doc.text(`UHID: ${props.patient_id}`, 40,  patientY+20);
doc.text(`DOB:  ${props.birth_date}`, 250, patientY);
doc.text(`G.A  : ${props.gestational_age}`, 420, patientY);
doc.text(`DOA: ____________________`, 250, patientY+22);

// doc.text(`Patient Name: ${props.patient_name}`, 40, patientStartY);

// doc.text(`UHID: ${props.patient_resource_id}`, 250, patientStartY + lineGap);

// doc.text(`DOB: ____________________`, 250, patientStartY);

// doc.text(`Age/Gender: ____________________`, 40, patientStartY + lineGap);

// doc.text(`DOA: ____________________`, 420, patientStartY);



// After patient info, update startY for the table

const tableStartY = patientY + lineGap + 30; // leave extra space



   // =========================

// Table Columns

// =========================

const colSummaryWidth = pageWidth - margin * 2 - 320; // Notes by + Type + Date = 320

const colNotesByWidth = 100;

const colTypeWidth = 80;

// const colDateWidth = 120;

const rowPadding = 6;



startY = tableStartY;



// Table Header

doc.setFont("helvetica", "bold");

doc.setFontSize(12);

doc.text("Summary", margin + rowPadding, startY);

doc.text("Date/Time", margin + colSummaryWidth + rowPadding + 10, startY);

doc.text("Type", margin + colSummaryWidth + colNotesByWidth + rowPadding + 15, startY);

doc.text("Notes by", margin + colSummaryWidth + colNotesByWidth + colNotesByWidth/2 + rowPadding + 20, startY);



startY += 15;

doc.setDrawColor(180);

doc.line(margin, startY, pageWidth - margin, startY);

startY += 10;



// =========================

// Table Rows

// =========================

doc.setFont("helvetica", "normal");

doc.setFontSize(10);



filteredNotes.slice().reverse().forEach((note: any) => {

  const summaryLines = doc.splitTextToSize(note.summary, colSummaryWidth);

  const rowHeight = Math.max(summaryLines.length * 12, 14);



  // Page break

  if (startY + rowHeight + 20 > 800) {

    doc.addPage();

    startY = 50;

  }



  // Draw row background (optional, alternating colors)

  doc.setFillColor(245, 245, 245);

  doc.rect(margin, startY - 2, pageWidth - 2 * margin, rowHeight + 4, "F");



  // Summary (multi-line)

  doc.setTextColor(0, 0, 0);

  doc.text(summaryLines, margin + rowPadding, startY + 12);



 



  // Type

  doc.text(note.noteType, margin + colSummaryWidth + colNotesByWidth + rowPadding + 15, startY + 12);



  // Date/Time

  const noteDate = new Date(note.dateTime); // assuming note.dateTime exists

  const formattedDate = noteDate.toLocaleString("en-IN", {

    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",

  });

  doc.text(formattedDate, margin + colSummaryWidth + rowPadding + 10, startY + 12);

// Notes by

doc.text(`Dr. ${props.UserRole}`, margin + colSummaryWidth+ colNotesByWidth + colTypeWidth  + rowPadding + 20, startY + 12);

  startY += rowHeight + 10;

});

 

    doc.save(`Notes_Report(${props.patient_id}).pdf`);

  };
  return (
<Box>
  {/* Add Note Button */}
 

  {/* Notes Input Section (same as before) */}
  {/* Notes Section - Only shows when showNotes is true */}
  {/* {showNotes && ( */}
  {/* {props.UserRole !== "NICU Nurse" &&  ( */}
  <ProtectedModule module="Clinical Notes" action="create">
      {/* 🔹 Button to open dialog */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
      
       
         
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#0F3B61",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          Notes
        </Typography>
        <Stack direction={'row'} spacing={2}>
        <Tooltip title="Download">

<IconButton

 onClick={downloadNotesPDF}

  sx={{

    fontWeight: "bold",

    color: "#228BE6",

    backgroundColor: "#F5F5F5",

    "&:hover": {

      backgroundColor: "rgba(34, 139, 230, 0.1)",

      color: "#FFFFFF",

    },

  }}

>

  <DownloadIcon sx={{ fontSize: "26px" }} />

</IconButton>

</Tooltip>
<Button
variant="contained"
onClick={() => setOpen(true)}
sx={{
backgroundColor: "rgba(34, 139, 230, 0.1)", // 10% opacity
color: "#228BE6",
paddingX: 3,
textTransform: "none",

borderRadius: "8px",
boxShadow: "none", // remove default contained shadow
"&:hover": {
backgroundColor: "rgba(34, 139, 230, 0.1)", // same as normal (no color change)
boxShadow: "none", // prevent MUI hover shadow
},
}}
>
+ Add Note
</Button>
        </Stack>
        
        
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: 6,
            backgroundColor: "#FFFFFF",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#0F3B61",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Add Clinical Note
          <IconButton onClick={() => setOpen(false)} sx={{ color: "#0F3B61" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers >
    <Box sx={{  backgroundColor: '#FFFFFF'}}>
      
      <Box sx={{ display: 'flex', marginBottom: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Notes"
          variant="outlined"
          placeholder="Type your note here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#DBE2F2',
              },
            },
            '& .MuiInputBase-root': {
              color: '#0F3B61',
            },
            '& .MuiInputLabel-root': {
              color: '#9BA1AE',
            },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <Select
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
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
            '& .MuiSelect-icon': { color: '#0F3B61', backgroundColor: '#F2FBFF' },
            flex: 1,
            color: '#0F3B61',
            border: '1px solid #DBE2F2',
          }}
        >
          <MenuItem value="Medication">Medication</MenuItem>
          <MenuItem value="Conditions">Conditions</MenuItem>
          <MenuItem value="Feeds & Fluids">Feeds & Fluids</MenuItem>
          <MenuItem value="Assessment">Assessment</MenuItem>
          <MenuItem value="Care plan">Care plan</MenuItem>
          <MenuItem value="Investigation">Investigation</MenuItem>
          <MenuItem value="Alarms">Alarms</MenuItem>
          <MenuItem value="Care Events">Care Events</MenuItem>
          <MenuItem value="Observation">Observation</MenuItem>
          <MenuItem value="Procedures">Procedures</MenuItem>
          <MenuItem value="Therapies">Therapies</MenuItem>
          <MenuItem value="Management">Management</MenuItem>
        </Select>

        {/* Voice-to-Text Button */}
        <Button
          
          onClick={toggleListening}
          sx={{
            flex: 1,
            borderColor: '#FFFFFF',
            color: '#FFFFFF',
            backgroundColor:'#228BE6 !important',
             '&:hover': { 
              backgroundColor: '#0D3252' 
              
            },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
         
        >
          <MicIcon />
          {isListening ? 'Listening...' : 'Voice to Text'}
        </Button>
      </Box>

     

      <Box
  sx={{
    marginTop: 3,
    padding: '0.8rem 1rem',
    borderRadius: '10px',
    display: 'flex',                // ✅ make Box a flex container
    alignItems: 'center',           // ✅ vertically center content
    justifyContent: 'space-between',// ✅ push content apart
       // optional: light background for clarity
  }}
>
  {/* Left side */}
  <Stack spacing={0.5} p={1} sx={{
   
    backgroundColor: '#F9FAFB',     // optional: light background for clarity
  }}>
    <Typography variant="body2" sx={{ color: "#9BA1AE" }}>
      Note from
    </Typography>
    <Typography
      variant="body2"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        color: "#0F3B61",
      }}
    >
      Dr.{props.UserRole}
      {/* Example of verified icon (optional) */}
      {/* <VerifiedUserIcon fontSize="small" color="success" /> */}
    </Typography>
  </Stack>

  {/* Right side */}
  <Box sx={{ display: 'flex', gap: 2 }}>
    <Button
      variant="outlined"
      onClick={() => {
        setNote('');
        setNoteType('');
      }}
      sx={{ borderColor: '#0F3B61', color: '#0F3B61' }}
    >
      Reset
    </Button>

    <Button
      variant="contained"
      onClick={() => {
        submitNote();
        setShowNotes(!showNotes);
      }}
      sx={{ backgroundColor: '#228BE6', color: '#FFFFFF' }}
    >
      Submit
    </Button>
  </Box>
</Box>


    </Box>
    </DialogContent>
     </Dialog>
    </ProtectedModule>
   {/* )} */}

  {/* Previous Notes Section with Filtering */}
  <ProtectedModule module="Clinical Notes" action="view">
  <Box >
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: 1
    }}>
      
      
      {/* <Box sx={{ display: 'flex', gap: 2 }}>
 
  <TextField
    select
    value={dateFilter}
    onChange={(e) => setDateFilter(e.target.value)}
    size="small"
    sx={{
      minWidth: 120,
      '& .MuiOutlinedInput-root': {
        backgroundColor: '#F7FAFC', 
        color: '#0F3B61',
        '& fieldset': {
          borderColor: '#DBE2F2',
        },
        '&:hover fieldset': {
          borderColor: '#0F3B61',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#0F3B61',
        },
      },
      '& .MuiInputBase-input': {
        color: '#0F3B61',
      },
      '& .MuiInputLabel-root': {
        color: '#0F3B61',
      },
      '& .MuiSvgIcon-root': {
        color: '#0F3B61', 
      },
    }}
  >
    <MenuItem value="all">All Dates</MenuItem>
    <MenuItem value="today">Today</MenuItem>
    <MenuItem value="week">This Week</MenuItem>
    <MenuItem value="month">This Month</MenuItem>
  </TextField>

  
  <TextField
    select
    value={categoryFilter}
    onChange={(e) => setCategoryFilter(e.target.value)}
    size="small"
    sx={{
      minWidth: 120,
      '& .MuiOutlinedInput-root': {
        backgroundColor: '#F7FAFC',
        color: '#0F3B61',
        '& fieldset': {
          borderColor: '#DBE2F2',
        },
        '&:hover fieldset': {
          borderColor: '#0F3B61',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#0F3B61',
        },
      },
      '& .MuiInputBase-input': {
        color: '#0F3B61',
      },
      '& .MuiInputLabel-root': {
        color: '#0F3B61',
      },
      '& .MuiSvgIcon-root': {
        color: '#0F3B61',
      },
    }}
  >
    <MenuItem value="all">All Categories</MenuItem>
    <MenuItem value="Medication">Medication</MenuItem>
    <MenuItem value="Conditions">Conditions</MenuItem>
  </TextField>

 
  {props.UserRole !== "NICU Nurse" && (
  <Button
    variant="contained"
    onClick={() => setShowNotes(!showNotes)}
    sx={{
      backgroundColor: '#0F3B61',
      color: '#FFFFFF',
      borderRadius: '8px',
      marginBottom: 2,
      '&:hover': {
        backgroundColor: '#0D3252',
      },
    }}
  >
    {showNotes ? 'Hide Notes' : 'Add Note'}
  </Button>)}
</Box> */}


    </Box>

    {/* Filtered Notes List */}
    {filteredNotes.length > 0 ? (
  filteredNotes
    .slice()
    .reverse()
    .map((note, index) => (
      <Card
        key={index}
        sx={{
          marginTop: 2,
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          display: "flex",
          flexDirection: "column"
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "#2C3E50" }}>
            {note.summary}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 1 }}>
            <Box
              sx={{
                display: "flex",
                padding: '0.5%',
                height: '7%',
                borderRadius: '10px',
                backgroundColor: '#5E84CC1A',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: "#9BA1AE" }}>
                Notes by:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  marginLeft: 1,
                  display: "flex",
                  alignItems: "center",
                  color: "#0F3B61",
                }}
              >
                Dr. {props.UserRole}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                padding: '0.5%',
                height: '7%',
                borderRadius: '10px',
                backgroundColor: '#5E84CC1A',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ color: "#2C3E50" }}>{note.noteType}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    ))
) : (
      <Typography variant="body2" sx={{ marginTop: 2, color: "#9BA1AE" }}>
        No notes found matching your filters.
      </Typography>
    )}
  </Box>
  </ProtectedModule>
  <Snackbar
    open={snackbarOpen}
    autoHideDuration={6000}
    onClose={handleCloseSnackbar}
  >
    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
      {snackbarMessage}
    </Alert>
  </Snackbar>
</Box>


  );
};


