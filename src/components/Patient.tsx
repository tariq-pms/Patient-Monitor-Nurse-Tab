import {
  Box, Typography, TableRow, TableCell, Table, TableBody, Paper, 
  TableHead, TextField, Stack, Button, Tabs, Tab,
  Grid, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, InputLabel, Snackbar, Alert, CircularProgress,
  IconButton,
  Menu,
  MenuItem
} from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface Patient {
  active: boolean;
  id: string;
  name: string;
  patientId: string;
  bed: string;
  assignee: string;
  birthDateTime: string;
  dischargedDate: string;
  gestation: string;
  birthWeight: string;
  lastUpdated: string;
}

export const Patient = () => {
  const [activeTab, setActiveTab] = useState("current");
  const [openDialog, setOpenDialog] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });
  const [formData, setFormData] = useState({
    mothersName: "",
    patientId: "",
    birthDate: "",
    birthTime: "",
    gestationWeeks: "",
    gestationDays: "",
    birthWeight: "",
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Patient`, {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
            "Content-Type": "application/fhir+json"
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const fetchedPatients = data.entry?.map((entry: any) => {
          const resource = entry.resource;
          
          // Extract mother's name from extensions
          const mothersName = resource.extension?.find(
            (ext: any) => ext.url === "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName"
          )?.valueString || "Unknown";

          // Extract gestation from extensions
          const gestation = resource.extension?.find(
            (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/patient-gestationalAge"
          )?.valueString || "N/A";

          // Extract birth weight from extensions
          const birthWeight = resource.extension?.find(
            (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/patient-birthWeight"
          )?.valueQuantity?.value || "N/A";

          return {
            id: resource.id,
            name: ` ${mothersName}`,
            patientId: resource.identifier?.[0]?.value || "N/A",
            birthDateTime: resource.birthDate ? formatDate(resource.birthDate) : "N/A",
            gestation,
            birthWeight: birthWeight !== "N/A" ? `${birthWeight} g` : "N/A",
            lastUpdated: resource.meta?.lastUpdated ? formatDateTime(resource.meta.lastUpdated) : "N/A",
            bed: "--", // You'll need to get this from your system
            assignee: "--", // You'll need to get this from your system
            dischargedDateTime: "--", // Will be updated when discharged
            active: resource.active !== false // Default to true if not specified
          };
        }) || [];

        setPatients(fetchedPatients);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ' ' + date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', weekday: 'short' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.mothersName || !formData.patientId || !formData.birthDate) {
        throw new Error("Required fields are missing");
      }
  
      // Create FHIR Patient resource
      const patientResource = {
        resourceType: "Patient",
        active: true,
        identifier: [{
          system: "urn:ietf:rfc:3986",
          value: formData.patientId
        }],
        name: [{
          use: "official",
          family: formData.mothersName,
          prefix: ["B/O"]
        }],
        birthDate: formData.birthDate,
        extension: [
          {
            url: "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName",
            valueString: formData.mothersName
          },
          {
            url: "http://example.org/fhir/StructureDefinition/patient-gestationalAge",
            valueString: `${formData.gestationWeeks || 0}W ${formData.gestationDays || 0}D`
          },
          {
            url: "http://example.org/fhir/StructureDefinition/patient-birthWeight",
            valueQuantity: {
              value: parseFloat(formData.birthWeight) || 0,
              unit: "g",
              system: "http://unitsofmeasure.org",
              code: "g"
            }
          }
        ]
      };
  
      console.log("FHIR Payload:", JSON.stringify(patientResource, null, 2));
  
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Patient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/fhir+json",
          "Authorization": "Basic " + btoa("fhiruser:change-password")
        },
        body: JSON.stringify(patientResource)
      });
  
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error("Full error response:", responseText);
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
  
      const result = responseText ? JSON.parse(responseText) : {};
      console.log("Patient created:", result);
  
      // Create the new patient object for state update
      const newPatient: Patient = {
        id: result.id,
        name: `B/O ${formData.mothersName}`,
        patientId: formData.patientId,
        bed: "--", // Default value, update as needed
        assignee: "--", // Default value, update as needed
        birthDateTime: formData.birthDate,

        gestation: `${formData.gestationWeeks || 0}W ${formData.gestationDays || 0}D`,
        birthWeight: `${formData.birthWeight || 0} g`,
        lastUpdated: new Date().toISOString(),
        active: true,
        dischargedDate: ""
      };
  
      // Success handling
      setSnackbar({
        open: true,
        message: "Patient successfully added!",
        severity: "success"
      });
  
      setOpenDialog(false);
      setFormData({
        mothersName: "",
        patientId: "",
        birthDate: "",
        birthTime: "",
        gestationWeeks: "",
        gestationDays: "",
        birthWeight: "",
      });
  
      // Update state with the new patient
      setPatients(prevPatients => [...prevPatients, newPatient]);
  
    } catch (error: any) {
      console.error("Error saving patient:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to add patient",
        severity: "error"
      });
    }
  };
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.bed && patient.bed.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === "current") {
      return matchesSearch && patient.active !== false;
    } else {
      return matchesSearch && patient.active === false;
    }
  });

  if (loading) return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, patient: Patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
  };

  const handleDischarge = async () => {
    if (!selectedPatient) return;
    
    try {
      // First, fetch the current patient data to ensure we have all fields
      const patientResponse = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/Patient/${selectedPatient.id}`,
        {
          headers: {
            "Authorization": "Basic " + btoa("fhiruser:change-password"),
            "Content-Type": "application/fhir+json"
          }
        }
      );
  
      if (!patientResponse.ok) {
        throw new Error("Failed to fetch patient data");
      }
  
      const currentPatient = await patientResponse.json();
  
      // Create the updated patient resource with all existing data
      const patientUpdate = {
        ...currentPatient, // Spread all existing patient data
        active: false, // Update only the active status
      };
  
      // Create a discharge encounter
      const dischargeEncounter = {
        resourceType: "Encounter",
        status: "finished",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "IMP",
          display: "inpatient encounter"
        },
        subject: {
          reference: `Patient/${selectedPatient.id}`
        },
        period: {
          end: new Date().toISOString()
        },
        // Add any other relevant discharge information
      };
  
      // Send both requests
      const [encounterResponse, updateResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Encounter`, {
          method: "POST",
          headers: {
            "Content-Type": "application/fhir+json",
            "Authorization": "Basic " + btoa("fhiruser:change-password")
          },
          body: JSON.stringify(dischargeEncounter)
        }),
        fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Patient/${selectedPatient.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/fhir+json",
            "Authorization": "Basic " + btoa("fhiruser:change-password")
          },
          body: JSON.stringify(patientUpdate)
        })
      ]);
  
      if (!encounterResponse.ok || !updateResponse.ok) {
        throw new Error("Failed to discharge patient");
      }
  
      setSnackbar({
        open: true,
        message: "Patient successfully discharged!",
        severity: "success"
      });
  
      // Refresh the patient list
      setPatients(prev => prev.filter(p => p.id !== selectedPatient.id));
    } catch (error) {
      console.error("Error discharging patient:", error);
      setSnackbar({
        open: true,
        message: "Failed to discharge patient",
        severity: "error"
      });
    } finally {
      handleMenuClose();
    }
  };
  return (
    <Box sx={{ p: 3 }}>
      
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        NICU Patients
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1, backgroundColor: "black", p: 1 }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ minHeight: "36px" }}
        >
          <Tab label="Current Patients" value="current" sx={{ p: 0, mr: 2, color: 'white' }} />
          <Tab label="Discharged Patients" value="discharged" sx={{ p: 0, color: 'white' }} />
        </Tabs>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search patients..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300}}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ backgroundColor: "#228BE61A", color: "#228BE6" }}
          >
            Patient
          </Button>
        </Box>
      </Stack>

      <Paper sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'red' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Patient Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Patient ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Bed No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Assignee</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Birth Date and Time</TableCell>
              {activeTab === "discharged" && (
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Discharged Date</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
  {filteredPatients.map((patient, index) => (
    <TableRow key={index} hover>
      <TableCell>{patient.name}</TableCell>
      <TableCell>{patient.patientId}</TableCell>
      <TableCell>{patient.bed}</TableCell>
      <TableCell>{patient.assignee}</TableCell>
      <TableCell>{patient.birthDateTime}</TableCell>
      {activeTab === "discharged" ? (
        <TableCell>{patient.dischargedDate}</TableCell>
      ) : (
        <TableCell>
          <IconButton
            aria-label="actions"
            onClick={(e) => handleMenuOpen(e, patient)}
          >
            <MoreVertIcon />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  ))}
</TableBody>
        </Table>
      </Paper>
      <Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleMenuClose}
>
  <MenuItem onClick={handleDischarge}>Discharge Patient</MenuItem>
  <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
  <MenuItem onClick={handleMenuClose}>Edit Information</MenuItem>
</Menu>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", p: 0, fontSize: '1.25rem' }}>NICU Admission</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mother's Name*"
                placeholder="Lolina"
                name="mothersName"
                value={formData.mothersName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">B/O -</InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Patient ID*"
                placeholder="07996799"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">MRH -</InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <InputLabel sx={{ fontWeight: "bold" }}>Birth Date and Time</InputLabel>
              </Box>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                 
                />
                <TextField
                  fullWidth
                  type="time"
                  name="birthTime"
                  value={formData.birthTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Grid container justifyContent={'space-between'}>
                <Grid item xs={12} sm="auto">
                  <InputLabel sx={{ fontWeight: "bold" }}>Gestation*</InputLabel>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <TextField
                      placeholder="27"
                      name="gestationWeeks"
                      value={formData.gestationWeeks}
                      onChange={handleChange}
                      sx={{ width: 60 }}
                      size="small"
                      inputProps={{ style: { textAlign: "center" } }}
                    />
                    <Typography variant="body2">W</Typography>
                    <TextField
                      placeholder="04"
                      name="gestationDays"
                      value={formData.gestationDays}
                      onChange={handleChange}
                      sx={{ width: 60 }}
                      size="small"
                      inputProps={{ style: { textAlign: "center" } }}
                    />
                    <Typography variant="body2">D</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm="auto">
                  <InputLabel sx={{ fontWeight: "bold" }}>Birth Weight*</InputLabel>
                  <TextField
                    placeholder="2300"
                    name="birthWeight"
                    value={formData.birthWeight}
                    onChange={handleChange}
                    size="small"
                    sx={{ width: 190, mt: 1 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">gram</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            sx={{ 
              backgroundColor: "#228BE6", 
              color: "white",
              '&:hover': {
                backgroundColor: '#1976d2'
              }
            }}
          >
            Save Admission
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};