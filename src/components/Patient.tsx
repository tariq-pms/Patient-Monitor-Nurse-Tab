import {
  Box, Typography, TableRow, TableCell, Table, TableBody, Paper, 
  TableHead, TextField, Stack, Button, Tabs, Tab,
  Grid, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, InputLabel, Snackbar, Alert, CircularProgress,
  IconButton,
  Menu,
  MenuItem,

  useTheme,
  useMediaQuery
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
interface PatientProps {
  userOrganization: string;
  darkTheme: boolean;
}
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
export const Patient: FC<PatientProps> = ({ userOrganization, darkTheme }) => {

  const [activeTab, setActiveTab] = useState("current");
  const [openDialog, setOpenDialog] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [practitioners, setPractitioners] = useState<any[]>([]);
const [locations, setLocations] = useState<any[]>([]);
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
const [assignDialog, setAssignDialog] = useState({
  open: false,
  type: "", // "user" or "bed"
  selectedValue: ""
});
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
        const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Patient?_count=1000&organization=${userOrganization}`, {
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
          
          // Extract patient details
          const mothersName = resource.extension?.find(
            (ext: any) => ext.url === "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName"
          )?.valueString || "Unknown";

          const gestation = resource.extension?.find(
            (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/patient-gestationalAge"
          )?.valueString || "N/A";

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
            bed: "--",
            assignee: "--",
            dischargedDateTime: "--",
            active: resource.active !== false
          };
        }) || [];

        // Sort by lastUpdated in descending order (newest first)
        const sortedPatients = [...fetchedPatients].sort((a, b) => {
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        });

        setPatients(sortedPatients);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const fetchPractitioners = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Practitioner`, {
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
          "Content-Type": "application/fhir+json"
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.entry?.map((entry: any) => ({
        id: entry.resource.id,
        name: entry.resource.name?.[0]?.text || "Unknown"
      })) || [];
    } catch (err) {
      console.error("Error fetching practitioners:", err);
      return [];
    }
  };
  
  const fetchLocations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Location`, {
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
          "Content-Type": "application/fhir+json"
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.entry?.map((entry: any) => ({
        id: entry.resource.id,
        name: entry.resource.name,
        type: entry.resource.physicalType?.coding?.[0]?.code,
        identifier: entry.resource.identifier?.[0]?.value
      })).filter((loc: any) => loc.type === "bd" || loc.type === "ro") || []; // Filter for beds and rooms
    } catch (err) {
      console.error("Error fetching locations:", err);
      return [];
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const [practitionersData, locationsData] = await Promise.all([
        fetchPractitioners(),
        fetchLocations()
      ]);
      setPractitioners(practitionersData);
      setLocations(locationsData);
    };
    fetchData();
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

  const handleAssignClick = (type: string) => {
    setAssignDialog({
      open: true,
      type,
      selectedValue: ""
    });
  };
  
  const handleAssignDialogClose = () => {
    setAssignDialog(prev => ({ ...prev, open: false }));
  };
  
  const handleAssignSubmit = async () => {
    if (!selectedPatient || !assignDialog.selectedValue) return;
  
    try {
      if (assignDialog.type === "user") {
        // Assign practitioner to patient
        await assignPractitionerToPatient(selectedPatient.id, assignDialog.selectedValue);
        setSnackbar({
          open: true,
          message: "User assigned successfully!",
          severity: "success"
        });
      } else if (assignDialog.type === "bed") {
        // Assign bed to patient
        await assignBedToPatient(selectedPatient.id, assignDialog.selectedValue);
        setSnackbar({
          open: true,
          message: "Bed assigned successfully!",
          severity: "success"
        });
      }
  
      // Update local state
      setPatients(prev => prev.map(p => 
        p.id === selectedPatient.id 
          ? { 
              ...p, 
              assignee: assignDialog.type === "user" 
                ? practitioners.find(pr => pr.id === assignDialog.selectedValue)?.name || "--"
                : p.assignee,
              bed: assignDialog.type === "bed" 
                ? locations.find(loc => loc.id === assignDialog.selectedValue)?.identifier || "--"
                : p.bed
            } 
          : p
      ));
  
      handleAssignDialogClose();
      handleMenuClose();
    } catch (error) {
      console.error("Error assigning:", error);
      setSnackbar({
        open: true,
        message: "Failed to assign",
        severity: "error"
      });
    }
  };
  
  const assignPractitionerToPatient = async (patientId: string, practitionerId: string) => {
    // In FHIR, you would typically create a PractitionerRole or Encounter to link them
    // For simplicity, we'll create a basic Encounter
    const encounter = {
      resourceType: "Encounter",
      status: "in-progress",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "IMP",
        display: "inpatient encounter"
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      participant: [
        {
          individual: {
            reference: `Practitioner/${practitionerId}`
          }
        }
      ]
    };
  
    const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Encounter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        "Authorization": "Basic " + btoa("fhiruser:change-password")
      },
      body: JSON.stringify(encounter)
    });
  
    if (!response.ok) throw new Error("Failed to assign practitioner");
  };
  
  const assignBedToPatient = async (patientId: string, locationId: string) => {
    // Create an encounter with the location
    const encounter = {
      resourceType: "Encounter",
      status: "in-progress",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "IMP",
        display: "inpatient encounter"
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      location: [
        {
          location: {
            reference: `Location/${locationId}`
          }
        }
      ]
    };
  
    const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Encounter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        "Authorization": "Basic " + btoa("fhiruser:change-password")
      },
      body: JSON.stringify(encounter)
    });
  
    if (!response.ok) throw new Error("Failed to assign bed");
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
        managingOrganization: {
          "reference": `Organization/${userOrganization}`
      },
        identifier: [{
          system: "urn:ietf:rfc:3986",
          value: formData.patientId
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

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  

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
    <Box sx={{ p: 1 }}>
  {/* Responsive Header */}
  {/* <Typography
    variant={isMobile ? "h6" : "h5"}
    sx={{ fontWeight: "bold", mb: 1 }}
  >
    NICU Patients
  </Typography> */}

  {/* Responsive Row: Tabs + Search + Button */}
  <Stack
    direction={isMobile ? "column" : "row"}
    justifyContent="space-between"
    alignItems={isMobile ? "flex-start" : "center"}
    spacing={1}
    sx={{ mt: 1, mb: 2 }}
  >
    {/* Tabs */}
    <Tabs
      value={activeTab}
      onChange={(e, newValue) => setActiveTab(newValue)}
      variant="scrollable"
      scrollButtons={isMobile ? "auto" : false}
      allowScrollButtonsMobile
      sx={{ minHeight: "36px" }}
    >
      <Tab
        label="Current"
        value="current"
        sx={{ p: 0, mr: isMobile ? 0 : 2, color: "black" }}
      />
      <Tab
        label="Discharged"
        value="discharged"
        sx={{ p: 0, color: "black" }}
      />
    </Tabs>

    {/* Search + Button */}
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ width: isMobile ? "100%" : "auto", mt: isMobile ? 1 : 0 }}
    >
      <TextField
        size="small"
        fullWidth={isMobile}
        placeholder="Search patients..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          maxWidth: isMobile ? "100%" : 300,
          backgroundColor: "white",
          borderRadius: "20px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "20px",
            color: "black",
          },
          "& .MuiInputBase-input": {
            color: "black",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: "20px",
          },
        }}
      />

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
        sx={{
          backgroundColor: "#228BE61A",
          color: "#228BE6",
          whiteSpace: "nowrap",
          minWidth: isMobile ? "auto" : "unset",
        }}
      >
        {!isMobile && "Patient"}
      </Button>
    </Stack>
  </Stack>

  {/* Responsive Table */}
  <Paper
  sx={{
    boxShadow: "none",
    border: "1px solid #e0e0e0",
    overflow: "auto", // Change from "auto" to "hidden" for better control
    height: "calc(100vh - 200px)", // Adjust this value based on your needs
    display: "flex",
    flexDirection: "column"
  }}
>
    <Table sx={{ minWidth: 600 }}>
      <TableHead>
        <TableRow sx={{ backgroundColor: "lightgrey" }}>
          {[
            "Patient Name",
            "Patient ID",
            "Bed No",
            "Assignee",
            "Birth Date and Time",
          ].map((header) => (
            <TableCell
              key={header}
              sx={{ fontWeight: "bold", color: "#868E96", whiteSpace: "nowrap" }}
            >
              {header}
            </TableCell>
          ))}
          <TableCell sx={{ fontWeight: "bold", color: "#868E96", whiteSpace: "nowrap" }}>
            {activeTab === "current" ? "Action" : "Discharged Date"}
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {filteredPatients.map((patient) => (
          <TableRow
            key={patient.id || patient.patientId}
            sx={{
              backgroundColor: "#FFFFFF",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                cursor: "pointer",
              },
            }}
          >
            <TableCell sx={{ color: "#000000" }}>{patient.name}</TableCell>
            <TableCell sx={{ color: "#000000" }}>{patient.patientId}</TableCell>
            <TableCell sx={{ color: "#000000" }}>{patient.bed}</TableCell>
            <TableCell sx={{ color: "#000000" }}>{patient.assignee}</TableCell>
            <TableCell sx={{ color: "#000000" }}>{patient.birthDateTime}</TableCell>

            <TableCell sx={{ color: "#333", width: 120 }}>
              {activeTab === "discharged" ? (
                patient.dischargedDate
              ) : (
                <IconButton
                  aria-label="actions"
                  sx={{
                    color: "#555",
                    padding: "6px",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                  onClick={(e) => handleMenuOpen(e, patient)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>

  {/* Menu */}
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
    <MenuItem onClick={handleDischarge}>Discharge Patient</MenuItem>
    <MenuItem onClick={() => handleAssignClick("user")}>Assign User</MenuItem>
    <MenuItem onClick={() => handleAssignClick("bed")}>Assign Bed</MenuItem>
  </Menu>
  <Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  maxWidth="xs"
  PaperProps={{
    sx: {
      borderRadius: 2,
      p: 1,
      backgroundColor: 'white',
      color: 'black' // makes all text/icons inside black by default
    }
  }}
>
<DialogTitle sx={{ fontWeight: 500, pb: 1, color: '#000000', textAlign: 'center' }}>
NICU Admission
</DialogTitle>

  <DialogContent dividers sx={{ borderColor: '#ccc' }}>
    <Grid container spacing={3}>
      
    <Grid item xs={12}>
        
        <TextField
          fullWidth
          label="Mother's Name"
          placeholder="Mother's Name"
          name="mothersName"
          value={formData.mothersName}
          onChange={handleChange}
          required
          InputProps={{startAdornment: (
            <InputAdornment position="start">
              <Typography color="black">B/O -</Typography>
            </InputAdornment>
          ),
            sx: {
              backgroundColor: '#F5F5F5',
              borderRadius: 1,
              color: '#000',
            },
          }}
          InputLabelProps={{ sx: { color: '#000' } }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Patient ID"
          placeholder="07996799"
          name="patientId"
          value={formData.patientId}
          onChange={handleChange}
          required
          InputProps={{startAdornment: (
            <InputAdornment position="start">
              <Typography color="black">UHID -</Typography>
            </InputAdornment>
          ),
            sx: {
              backgroundColor: '#F5F5F5',
              borderRadius: 1,
              color: '#000',
            },
          }}
          InputLabelProps={{ sx: { color: '#000' } }}
        />
      </Grid>
      
   

      <Grid item xs={12}>
       
        <InputLabel sx={{  color: 'black', mb: 1 }}>
  Birth Date and Time
</InputLabel>
        <Stack direction="row" spacing={2}>
        <TextField
            fullWidth
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
             InputProps={{
      sx: {
        backgroundColor: '#F5F5F5',
        borderRadius: 1,
        color: '#000',
      },
    }}
          />
          <TextField
            fullWidth
            type="time"
            name="birthTime"
            value={formData.birthTime}
            onChange={handleChange}
            InputProps={{
      sx: {
        backgroundColor: '#F5F5F5',
        borderRadius: 1,
        color: '#000',
      },
    }}
          />
      
         
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <Grid container justifyContent={'space-between'}>
          <Grid item xs={12} sm="auto">
            <InputLabel sx={{  color: 'black' }}>
              Gestation*
            </InputLabel>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <TextField
                placeholder="27"
                name="gestationWeeks"
                value={formData.gestationWeeks}
                onChange={handleChange}
                sx={{ width: 60 }}
                size="small"
                InputProps={{
                  sx: {
                    backgroundColor: '#F5F5F5',
                    borderRadius: 1,
                    color: '#000',
                  },
                }}
              />
              <Typography variant="body2" color="black">W</Typography>
              <TextField
                placeholder="04"
                name="gestationDays"
                value={formData.gestationDays}
                onChange={handleChange}
                sx={{ width: 60 }}
                size="small"
                InputProps={{
                  sx: {
                    backgroundColor: '#F5F5F5',
                    borderRadius: 1,
                    color: '#000',
                  },
                }}
              />
              <Typography variant="body2" color="black">D</Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm="auto">
            <InputLabel sx={{ color: 'black' }}>
              Birth Weight*
            </InputLabel>
            <TextField
              placeholder="2300"
              name="birthWeight"
              value={formData.birthWeight}
              onChange={handleChange}
              size="small"
              sx={{ width: 190, mt: 1 }}
              InputProps={{endAdornment: (
                <InputAdornment position="end">
                  <Typography color="black">gram</Typography>
                </InputAdornment>
              ),
                sx: {
                  backgroundColor: '#F5F5F5',
                  borderRadius: 1,
                  color: '#000',
                },
              }}
              
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </DialogContent>

  <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
  <Button
    onClick={() => setOpenDialog(false)}
    variant="outlined"
    sx={{
      textTransform: 'none',
      borderColor: '#D0D5DD',
      color: '#344054',
      fontWeight: 500,
      backgroundColor: '#FFFFFF',
      '&:hover': {
        backgroundColor: '#F9FAFB',
      },
    }}>
      Cancel
    </Button>
    <Button
      
      onClick={handleSubmit}
      sx={{
        backgroundColor: '#228BE6',
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#228BE6',
        color: '#FFFFFF',
        },
        '&.Mui-disabled': {
          backgroundColor: '#228BE61A',
          color: 'grey',
          opacity: 1, // prevents dimming
        },
      }}
    >
      Save Admission
    </Button>
  </DialogActions>
</Dialog>
<Dialog open={assignDialog.open} onClose={handleAssignDialogClose}>
  <DialogTitle>
    {assignDialog.type === "user" ? "Assign User" : "Assign Bed"}
  </DialogTitle>
  <DialogContent>
    {assignDialog.type === "user" ? (
      <>
        <InputLabel>Select Practitioner</InputLabel>
        <TextField
          select
          fullWidth
          value={assignDialog.selectedValue}
          onChange={(e) => setAssignDialog(prev => ({ ...prev, selectedValue: e.target.value }))}
          sx={{ mt: 1 }}
        >
          {practitioners.map((practitioner) => (
            <MenuItem key={practitioner.id} value={practitioner.id}>
              {practitioner.name}
            </MenuItem>
          ))}
        </TextField>
      </>
    ) : (
      <>
        <InputLabel>Select Bed</InputLabel>
        <TextField
          select
          fullWidth
          value={assignDialog.selectedValue}
          onChange={(e) => setAssignDialog(prev => ({ ...prev, selectedValue: e.target.value }))}
          sx={{ mt: 1 }}
        >
          {locations.map((location) => (
            <MenuItem key={location.id} value={location.id}>
              {location.identifier} ({location.type === "bd" ? "Bed" : "Room"})
            </MenuItem>
          ))}
        </TextField>
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleAssignDialogClose}>Cancel</Button>
    <Button 
      onClick={handleAssignSubmit} 
      disabled={!assignDialog.selectedValue}
      variant="contained"
    >
      Assign
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