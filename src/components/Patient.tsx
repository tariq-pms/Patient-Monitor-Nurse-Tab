import {Box,Typography,TableRow, TableCell, Table, TableBody,Paper, TableHead, Link, TextField, TableContainer, Stack, Button, DialogActions, Dialog,DialogContent, DialogTitle, Snackbar, Alert,InputLabel, Grid, FormControl,Select,MenuItem, CircularProgress} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Webcam from 'react-webcam';
import { PhotoCamera, Scanner } from "@mui/icons-material";
import { Dashboard } from './Dashboard';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const PATIENTS_PER_PAGE = 10;
export interface PatientProps {
  openDialog: boolean; 
  onCloseDialog: () => void;
}
export const Patient: React.FC<PatientProps> = ({
  openDialog,
  onCloseDialog,
}) => {

  const [patientList, setPatientList] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const fetchPatients = async () => {
    try {
      const response = await fetch(
        
        `${import.meta.env.VITE_FHIRAPI_URL as string}/Patient?_count=1000&organization=190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83`,
        {
          credentials: "omit",
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.entry) {
          const patients = data.entry.map((entry: { resource: any }) => entry.resource);
  
          // Sort patients by lastUpdated descending
          const sorted = patients.sort(
            (a: { meta: { lastUpdated: any; }; }, b: { meta: { lastUpdated: any; }; }) =>
              new Date(b.meta?.lastUpdated || "").getTime() -
              new Date(a.meta?.lastUpdated || "").getTime()
          );
  
          setPatientList(sorted);
          setFilteredPatients(sorted);
        }
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);
  
  useEffect(() => {
    const filtered = patientList.filter((patient) => {
    const name = getMaidenName(patient.extension).toLowerCase();
    const id = patient.identifier?.[0]?.value?.toLowerCase() || "";
    return (
    name.includes(searchTerm.toLowerCase()) ||
    id.includes(searchTerm.toLowerCase())
    );
    });
setFilteredPatients(filtered);
setCurrentPage(1); // Reset page on search
}, [searchTerm, patientList]);

const getMaidenName = (extensions: any[]) => {
  const maidenExt = extensions?.find(
  (ext) =>
  ext.url === "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName"
  );
  return maidenExt?.valueString || "Unknown";
  };
  
  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  
  const handlePrevPage = () => {
  setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  const paginatedPatients = filteredPatients.slice(
  (currentPage - 1) * PATIENTS_PER_PAGE,
  currentPage * PATIENTS_PER_PAGE
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success"); 
  const handleCloseSnackbar = () => setSnackbarOpen(false);
 
  const [showScanner, setShowScanner] = useState(false);
const webcamRef = useRef<Webcam>(null);
const [isProcessing, setIsProcessing] = useState(false);
const [capturedImage, setCapturedImage] = useState<string | null>(null);
const [selectedPatient, setSelectedPatient] = useState<any>(null);
// const [openPatientDialog, setOpenPatientDialog] = useState<boolean>(false);


// These states must be defined
const [mothersName, setMothersName] = useState('');
const [patientId, setPatientId] = useState('');
const [dob, setDob] = useState('');
const [gender, setGender] = useState('');
const [gestation, setGestation] = useState('');


// const [ocrSuggestions, setOcrSuggestions] = useState<Record<string, string>>({});

const captureAndProcess = async () => {
  if (!webcamRef.current) return;
  const imageSrc = webcamRef.current.getScreenshot();
  setCapturedImage(imageSrc);      // Save the captured image
  setIsProcessing(true);           // Show processing animation

  try {
    const response = await fetch('https://pmsserver.local:5001/api/autofill', {
    // const response = await fetch('http://localhost:5000/api/autofill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: imageSrc }),
    });
    

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    const extracted = data.structuredData || {};
    setMothersName(extracted.mothersName || '');
    setPatientId(extracted.patientId || '');
    setDob(extracted.dob || '');
    setGender(extracted.gender || '');
    setGestation(extracted.gestation || '');
    

  } catch (error) {
    console.error('OCR Error:', error);
    alert('Error processing image. Please try again.');
  } finally {
    setIsProcessing(false);
    setShowScanner(false);
    setCapturedImage(null); // Clear after process finishes
  }
};

const handlePatientClick = (patient: any) => {
  setSelectedPatient(patient);
  // setOpenPatientDialog(true);
};

const handleScanClick = () => {
  setShowScanner(true);
};

  const handleSave = async () => {
    const patientResource = {
      resourceType: 'Patient',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName',
          valueString: mothersName,
        },
        {
          url: 'http://example.org/fhir/StructureDefinition/patient-gestation',
          valueString: gestation,
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/patient-location',
          valueReference: {
            reference: `Location/190a1c7d532-d4d344eb-e974-4fb6-9469-e66dd33b1c04`,
          },
        },
      ],
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: patientId,
        },
      ],
      gender: gender?.toLowerCase(), // 'male', 'female', 'other', or 'unknown'
      birthDate: dob, // YYYY-MM-DD format
      managingOrganization: {
        reference: `Organization/190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83`,
      },
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Patient`, {
        credentials: "omit",
        method: "POST",
        body: JSON.stringify(patientResource),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      });

      if (response.ok) {
        console.log('Patient data saved successfully!');
        setSnackbarMessage("Patient data saved successfully!");
        setSnackbarSeverity("success");
      } else {
        console.error('Failed to save patient data:', response.statusText);
        setSnackbarMessage("Failed to save patient data.");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      console.error('Error saving patient data:', error);
    }
    onCloseDialog();
    setSnackbarOpen(true);
    fetchPatients();
  };
return (
<Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
  {selectedPatient ? (
    // Show Dashboard when a patient is selected
    <Dashboard
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)} patient_name={""} patient_id={""} patient_resource_id={""} UserRole={""}    />
  ) : (
    
    <>
       
          <Box sx={{ width: '100%', height: '90vh' ,mt:3}}>
          

            <Paper elevation={1} sx={{ p: 2, backgroundColor: '#ffffff' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="#000000">
                  Recent Admissions
                </Typography>

                <TextField
                  size="small"
                  placeholder="Search by name or ID"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#000000',
                      '& fieldset': {
                        borderColor: '#000000',
                      },
                      '&:hover fieldset': {
                        borderColor: '#000000',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#000000',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#000000',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#000000',
                      opacity: 1,
                    },
                  }} />
              </Box>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <TableContainer
                  component={Paper}
                  sx={{
                    backgroundColor: '#F3F2F7',
                    borderRadius: 3,
                    boxShadow: 'none',
                  }}
                >
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#E0E0E0' }}>
                      <TableRow sx={{ '& th': { p: 2 } }}>
                        <TableCell sx={{ color: '#868E96', fontWeight: 'bold' }}>Patient Name</TableCell>
                        {/* <TableCell sx={{ color: '#868E96', fontWeight: 'bold' }}>Bed No</TableCell> */}
                        <TableCell sx={{ color: '#868E96', fontWeight: 'bold' }}>Patient ID</TableCell>
                        <TableCell sx={{ color: '#868E96', fontWeight: 'bold' }}>DOB</TableCell>
                        <TableCell sx={{ color: '#868E96', fontWeight: 'bold' }}>G.A</TableCell>
                        <TableCell sx={{ color: '#868E96', fontWeight: 'bold' }}>Gender</TableCell>
                        <TableCell sx={{ color: '#868E96', fontWeight: 'bold' }}>Admission Time</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedPatients.map((patient, index) => (
                        <TableRow
                          key={index}
                          hover
                          sx={{
                            '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                            '& td': { p: 1 },
                          }}
                        >
                          <TableCell sx={{ color: '#124D81' }}>
                            <Link
                              href="#"
                              underline="hover"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePatientClick(patient);
                              } }
                            >
                              {getMaidenName(patient.extension)}
                            </Link>
                          </TableCell>
                          {/* <TableCell sx={{ color: '#000000' }}>{patient.bed || '-'}</TableCell> */}
                          <TableCell sx={{ color: '#000000' }}>
                            {patient.identifier?.[0]?.value || 'N/A'}
                          </TableCell>
                          
                          <TableCell sx={{ color: '#000000' }}>{patient.birthDate || '-'}</TableCell>
                          <TableCell sx={{ color: '#000000' }}>{patient.gestation || '-'}</TableCell>
                          <TableCell sx={{ color: '#000000' }}>{patient.gender || '-'}</TableCell>
                          <TableCell sx={{ color: '#000000' }}>
                            {new Date(patient.meta?.lastUpdated).toLocaleString() || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="flex-end"
                sx={{ mt: 2 }}
              >
                <Button
                  variant="outlined"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  sx={{
                    backgroundColor: '#228BE61A',
                    color: '#228BE6',
                    textTransform: 'none',
                  }}
                >
                  Previous
                </Button>

                <Typography
                  variant="body2"
                  sx={{ alignSelf: 'center', color: '#000000' }}
                >
                  Page {currentPage} of {totalPages}
                </Typography>

                <Button
                  variant="outlined"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  sx={{
                    backgroundColor: '#228BE61A',
                    color: '#228BE6',
                    textTransform: 'none',
                  }}
                >
                  Next
                </Button>
              </Stack>
            </Paper>
          </Box>
          <Dialog
            open={openDialog}
            onClose={onCloseDialog}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { width: '100%', maxWidth: '478px', maxHeight: '90vh', backgroundColor: '#FFFFFF', color: 'black', borderRadius: 2, }, }}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>NICU Admission</DialogTitle>

            <DialogContent dividers sx={{ overflowY: 'auto' }}>
              {showScanner ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
                    {capturedImage ? 'Processing image, please wait...' : 'Position the document clearly within the frame'}
                  </Typography>
                  {!capturedImage && (
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotQuality={0.5}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                      }}
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        maxHeight: '60vh',
                        objectFit: 'contain',
                      }} />
                  )}
                  {capturedImage && isProcessing && (
                    <Box>
                      <CircularProgress size={40} />
                      <Typography variant="body2" sx={{ color: '#ccc' }}>
                        Extracting data
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    {!capturedImage && (
                      <Button
                        variant="contained"
                        onClick={captureAndProcess}
                        disabled={isProcessing}
                        startIcon={<PhotoCamera />}
                      >
                        Capture & Extract
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowScanner(false);
                        setCapturedImage(null); // Reset if cancelled mid-process
                      } }
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>

              ) : (
                <>
                   <Grid container spacing={3}>
  <Grid item xs={12}>
    <TextField
      fullWidth
      label="Mother's Name"
      value={mothersName}
      onChange={(e) => setMothersName(e.target.value)}
      sx={{
        input: { color: 'black' },
        '& label': { color: 'black' },
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: 'black' },
          '&:hover fieldset': { borderColor: 'black' },
          '&.Mui-focused fieldset': { borderColor: 'black' },
        },
      }}
    />
  </Grid>

  <Grid item xs={12}>
    <TextField
      fullWidth
      label="Patient ID"
      value={patientId}
      onChange={(e) => setPatientId(e.target.value)}
      sx={{
        input: { color: 'black' },
        '& label': { color: 'black' },
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: 'black' },
          '&:hover fieldset': { borderColor: 'black' },
          '&.Mui-focused fieldset': { borderColor: 'black' },
        },
      }}
    />
  </Grid>

  <Grid item xs={12}>
    <TextField
      fullWidth
      label="Gestation"
      value={gestation}
      onChange={(e) => setGestation(e.target.value)}
      sx={{
        input: { color: 'black' },
        '& label': { color: 'black' },
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: 'black' },
          '&:hover fieldset': { borderColor: 'black' },
          '&.Mui-focused fieldset': { borderColor: 'black' },
        },
      }}
    />
  </Grid>

  <Grid item xs={12}>
  <LocalizationProvider dateAdapter={AdapterDayjs}>
  <DatePicker
    label="DOB"
    value={dob ? dayjs(dob) : null}
    onChange={(newValue) => setDob(newValue ? newValue.format('YYYY-MM-DD') : '')}
    slotProps={{
      textField: {
        fullWidth: true,
        sx: {
          input: { color: 'black' },
          '& label': { color: 'black' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'black' },
            '&:hover fieldset': { borderColor: 'black' },
            '&.Mui-focused fieldset': { borderColor: 'black' },
            '& .MuiSvgIcon-root': {
              color: 'black' // calendar icon color
            },
          },
        },
      },
    }}
  />
</LocalizationProvider>

  </Grid>

  <Grid item xs={12}>
  <FormControl
  fullWidth
  sx={{
    '& label': { color: 'black' },
    '& .MuiOutlinedInput-root': {
      color: 'black',
      '& fieldset': { borderColor: 'black' },
      '&:hover fieldset': { borderColor: 'black' },
      '&.Mui-focused fieldset': { borderColor: 'black' },
      '& .MuiSvgIcon-root': {
        color: 'black' // dropdown arrow color
      },
    },
  }}
>
  <InputLabel id="gender-label">Gender</InputLabel>
  <Select
    labelId="gender-label"
    id="gender"
    value={gender}
    label="Gender"
    onChange={(e) => setGender(e.target.value)}
  >
    <MenuItem value="male">Male</MenuItem>
    <MenuItem value="female">Female</MenuItem>
  </Select>
</FormControl>

  </Grid>
</Grid>

                </>

              )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
              {!showScanner && (
                <Button
                  variant="outlined"
                  onClick={handleScanClick}
                  startIcon={<Scanner />}
                >
                  Scan Document
                </Button>
              )}
              <Button
                variant="contained"
                sx={{color:'white',backgroundColor:'#228BE6'}}
                onClick={handleSave}
                disabled={!patientId || !mothersName}
              >
                Add Patient
              </Button>
            </DialogActions>
          </Dialog></>
  )}

  <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
      {snackbarMessage}
    </Alert>
  </Snackbar>
</Box>
);
};


