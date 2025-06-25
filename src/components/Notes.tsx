import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Select, MenuItem, Snackbar, Alert, Card, Chip, CardContent } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
interface NotesProps {

  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
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
const [fetchedNotes, setFetchedNotes] = useState<{ summary: string; noteType: string }[]>([]);

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

const [dateFilter, setDateFilter] = useState('all');
const [categoryFilter, setCategoryFilter] = useState('all');
const [authorFilter, setAuthorFilter] = useState('all');
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




  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
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
  

  recognition.onresult = (event: SpeechRecognitionEvent) => {
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
  
 
  return (
  
<Box>
  {/* Add Note Button */}
 

  {/* Notes Input Section (same as before) */}
  {/* Notes Section - Only shows when showNotes is true */}
  {/* {showNotes && ( */}
  {props.UserRole !== "NICU Nurse" &&  (
    <Box sx={{ padding: 3, borderRadius: 5, backgroundColor: '#FFFFFF', marginBottom: 3 }}>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Typography variant="h6" sx={{ color: '#0F3B61' }}>Notes</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, marginTop: 4, marginBottom: 2 }}>
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
          variant="outlined"
          onClick={toggleListening}
          sx={{
            flex: 1,
            borderColor: '#FFFFFF',
            color: '#FFFFFF',
            backgroundColor:'#228BE6',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <MicIcon />
          {isListening ? 'Listening...' : 'Voice to Text'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
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
          
          sx={{ backgroundColor: '#0F3B61',  color: '#FFFFFF', }}
        >
          Submit
        </Button>
      </Box>

      <Box
  sx={{
    marginTop: 3,
    padding: '0.3%',
    borderRadius: '10px',
    backgroundColor: '#5E84CC1A',
    width: '20%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  }}
>
  <Typography variant="body2" sx={{ color: "#9BA1AE" }}>
    Note from
  </Typography>
  <Typography
    variant="body2"
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#0F3B61",
      gap: 1,
    }}
  >
    {props.UserRole}
    {/* <span style={{ color: "green", fontSize: '8px' }}>
      <VerifiedUserIcon />
    </span> */}
  </Typography>
</Box>

    </Box>
  )}

  {/* Previous Notes Section with Filtering */}
  <Box >
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: 2
    }}>
      <Typography variant="h6" sx={{ color: "#0F3B61" }}>Recent Notes</Typography>
      
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


