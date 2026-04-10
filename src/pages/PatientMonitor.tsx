import { useState, useEffect, useRef, SetStateAction, useCallback } from 'react';
import { Box, Typography, Stack, Button, DialogContent, DialogActions, Dialog, TextField, DialogTitle, Snackbar, Alert, Tabs, Tab, useTheme, useMediaQuery, Select, MenuItem, FormControl, InputAdornment } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import pmsLogo from '../assets/phx_logo.png';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PatientCard } from '../components/PatientCard';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import SearchIcon from '@mui/icons-material/Search';

import { PatientTaskContainer } from '../components/MyTasks/PatientTaskContainer';

type PatientMonitorProps = {
  userOrganization: string;
  currentRoom: any;
  darkTheme: boolean;
  // selectedIcon: string;
};

type Patient = {
  resourceType: string;
  id: string;
  meta: {
    versionId: string;
    lastUpdated: string;
  };
  extension: {
    url: string;
    valueReference?: {
      reference: string;
    };
    valueString?: string;
  }[];
  identifier: {
    system: string;
    value: string;
  }[];
  birthDate: string,
  birthWeight: string,
  gender: string;
  managingOrganization: {
    reference: string;
  };
};

interface DataEntity {
  id: string;
  [key: string]: any;
}

interface State {
  [patientId: string]: DataEntity[];
}

export const PatientMonitor: React.FC<PatientMonitorProps> = ({ userOrganization, currentRoom, darkTheme }) => {

  //console.log("in patient Monitor Page rooms",currentRoom);
  //console.log("in patient Monitor Page",userOrganization);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [parentDevice, setParentDevice] = useState<{ [key: string]: any }>({});
  const [parentObs, setParentObs] = useState<{ [key: string]: any }>({});
  const [parentComm, setParentComm] = useState<{ [key: string]: any }>({});
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  // const [selectedTab, setSelectedTab] = useState<number>(1); // Default to Patients tab
  // const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [mothersName, setMothersName] = useState('');
  const [id, setId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // Added search state
  const [sortBy, setSortBy] = useState<string>('name'); // Added sort state
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedIndex(newValue);
  };

  const fetchWithRetry = useCallback(async (url: string, options: RequestInit, retries: number = 3, initialDelay: number = 50): Promise<any> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (retries > 0) {
          const delay = initialDelay + ((3 - retries) * 50);
          console.log(`Retry in ${delay}ms...`, { url, retries });
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, options, retries - 1, delay);
        }
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      if (retries > 0) {
        const delay = initialDelay + ((3 - retries) * 50);
        console.log(`Retry in ${delay}ms...`, { url, retries });
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay);
      }
      console.error('Fetch error:', error);
      throw error;
    }
  }, []);

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const fetchObservations = useCallback(async (patient: { id: any }) => {
    const url = `${import.meta.env.VITE_FHIRAPI_URL as string}/Observation?patient=${patient.id}&_sort=-date&_count=50`;
    return fetchWithRetry(url, {
      credentials: 'omit',
      headers: {
        Authorization: 'Basic ' + btoa('fhiruser:change-password'),
      },
    });
  }, [fetchWithRetry]);

  const fetchCommunication = useCallback(async (patient: { id: any }) => {
    const url = `${import.meta.env.VITE_FHIRAPI_URL as string}/Communication?patient=${patient.id}`;
    return fetchWithRetry(url, {
      credentials: 'omit',
      headers: {
        Authorization: 'Basic ' + btoa('fhiruser:change-password'),
      },
    });
  }, [fetchWithRetry]);

  const fetchDevice = useCallback(async (patient: { id: any }) => {
    const url = `${import.meta.env.VITE_FHIRAPI_URL as string}/Device?patient=${patient.id}`;
    return fetchWithRetry(url, {
      credentials: 'omit',
      headers: {
        Authorization: 'Basic ' + btoa('fhiruser:change-password'),
      },
    });
  }, [fetchWithRetry]);

  const fetchDataForPatients = useCallback(async (patients: any[]) => {
    const tempParentObs: { [key: string]: any[] } = {};
    const tempParentComm: { [key: string]: any[] } = {};
    const tempParentDevice: { [key: string]: any[] } = {};

    setIsLoading(true);

    await Promise.all(
      patients.map(async (patient: { id: any }) => {
        const [observationResponse, communicationResponse, deviceResponse] = await Promise.all([
          fetchObservations(patient),
          fetchCommunication(patient),
          fetchDevice(patient),
        ]);

        const pp = String(patient.id);
        tempParentObs[pp] = observationResponse.entry?.map((indiobs: { [x: string]: any }) => indiobs['resource']);
        tempParentComm[pp] = communicationResponse.entry?.map((indidev: { [x: string]: any }) => indidev['resource']);
        tempParentDevice[pp] = deviceResponse.entry?.map((indidev: { [x: string]: any }) => indidev['resource']);
      })
    );

    setIsLoading(false);

    return { tempParentObs, tempParentComm, tempParentDevice };
  }, [fetchObservations, fetchCommunication, fetchDevice]);

  // const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
  //   setSelectedTab(newValue);
  // };
useEffect(() => {
  const fetchAllPatients = async () => {
    let allPatients: string | any[] | ((prevState: Patient[]) => Patient[]) = [];
    // 1. Initial URL with active=true filter
    let nextUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Patient?_count=100&organization=${userOrganization}&active=true`;

    try {
      while (nextUrl) {
        const response = await fetch(nextUrl, {
          credentials: 'omit',
          headers: {
            Authorization: 'Basic ' + btoa('fhiruser:change-password'),
          },
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // 2. Accumulate patients from the current page
        if (data.entry) {
          const pagePatients = data.entry.map((e: { resource: any; }) => e.resource);
          allPatients = [...allPatients, ...pagePatients];
        }

        // 3. Check if there is a 'next' link in the bundle
        const nextLink = data.link?.find((l: { relation: string; }) => l.relation === 'next');
        nextUrl = nextLink ? nextLink.url : null;
      }

      setPatientList(allPatients);
      console.log('Total active patients fetched:', allPatients.length);

    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  if (userOrganization) {
    fetchAllPatients();
  }
}, [userOrganization]);
  useEffect(() => {
    const socket = new WebSocket(`${import.meta.env.VITE_FHIRSOCKET_URL as string}/notification`);

    socket.onopen = () => console.log('Socket open successful');

    socket.onmessage = async (event) => {
      const receivedData = JSON.parse(event.data);
      const resourceType = receivedData.location.split('/')[0];
      const resourceUrl = `${import.meta.env.VITE_FHIRAPI_URL as string}/${receivedData.location}`;

      const fetchOptions: RequestInit = {
        credentials: 'omit',
        headers: {
          Authorization: `Basic ${btoa('fhiruser:change-password')}`,
        },
      };

      if (resourceType === 'Observation' || resourceType === 'Communication') {
        try {
          const data = await fetchWithRetry(resourceUrl, fetchOptions);
          const tempPatient = data.subject?.reference?.split('/')[1];
          const entityId = data.id;

          const updateStateFunction = resourceType === 'Observation' ? setParentObs : setParentComm;

          updateStateFunction((prevState: State) => {
            const newState = { ...prevState };
            if (newState[tempPatient]) {
              const entityIndex = newState[tempPatient].findIndex(entity => entity.id === entityId);
              if (entityIndex !== -1) {
                newState[tempPatient][entityIndex] = data;
              }
            }
            return newState;
          });
        } catch (error) {
          console.error(`Failed to fetch and update ${resourceType}:`, error);
        }
      }
    };

    socket.onerror = () => console.log('Error in socket connection');

    return () => {
      console.log('CLOSE SUCCESS');
      socket.close();
    };
  }, [fetchWithRetry]);



  useEffect(() => {
    if (patientList != null && patientList.length > 0) {
      fetchDataForPatients(patientList)
        .then((result: { tempParentObs: SetStateAction<{ [key: string]: any; }>; tempParentComm: SetStateAction<{ [key: string]: any; }>; tempParentDevice: SetStateAction<{ [key: string]: any; }>; }) => {
          setParentObs(result.tempParentObs);
          setParentComm(result.tempParentComm);
          setParentDevice(result.tempParentDevice);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [patientList, fetchDataForPatients]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    } else {
      console.error("Ref to trigger element is not available.");
    }

    return () => {
      if (triggerRef.current) {
        observer.unobserve(triggerRef.current);
      }
    };
  }, [pageNumber]);

  const handlePatientCardClick = (patient: Patient) => {
    setSelectedPatient(patient);
    console.log("handlepatientclick", selectedPatient);
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
          url: 'http://hl7.org/fhir/StructureDefinition/patient-location',
          valueReference: {
            reference: `Location/${currentRoom}`,
          },
        },
      ],
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: id,
        },
      ],
      managingOrganization: {
        reference: `Organization/${userOrganization}`,
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
    handleCloseDialog();
    setSnackbarOpen(true);
  };

  // const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  // const containerStyles = {

  //   justifyContent: 'center',
  //   alignItems: 'center',

  // };


  const tabConfig = [
    { label: "Patients", icon: <EmojiEmotionsIcon /> },
    { label: "My Tasks", icon: <AssignmentIcon /> },
    { label: "Reports", icon: <BarChartIcon /> },
  ];
  return (


    <div >
      {isAuthenticated && (
        <Box>
          <Box sx={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: theme.palette.background.paper || "#FFFFFF", pb: 1 }}>
            <Box sx={{ borderColor: "divider" }}>
              <Tabs
                value={selectedIndex}
                onChange={handleTabChange}
                textColor="secondary"
                indicatorColor="primary"
                variant="fullWidth"
                scrollButtons
                allowScrollButtonsMobile
              >
                {tabConfig.map((tab, index) => (
                  <Tab
                    key={index}
                    icon={
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          justifyContent: "center",
                          alignItems: "center",
                          color:darkTheme?'#FFFFFF': "#857373b4",
                          gap: 1,
                          width: "100%",
                        }}
                      >
                        {tab.icon}
                        {!isMobile && <Typography  variant="body2">{tab.label}</Typography>}
                      </Box>
                    }
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      minWidth: isMobile ? 58 : 120,
                      color: "black",
                      padding: isMobile ? 1 : 2,
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Search and Filters Toolbar */}
            {selectedIndex === 0 &&(
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: { xs: 2, md: 3 }, mb: 1, mt: 1.5 }}
              >
                {/* Search Bar */}
                <TextField
                  placeholder="Search Patient Name, ID or Bed Number"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    flex: 1,
                    maxWidth: { sm: 500 },
                    
                   backgroundColor:darkTheme?'#2c2b2bb4': "#FFFFFF",
                    '& .MuiOutlinedInput-root': {
                      borderRadius: "10px",
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused fieldset': { borderColor: '#93C5FD' },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Right: View toggles + Sort */}
                <Stack direction="row" spacing={1} alignItems="center">
                  {/* <ViewListIcon sx={{ color: '#64748B', fontSize: 22, cursor: 'pointer', '&:hover': { color: '#1565C0' } }} />
                  <ViewModuleIcon sx={{ color: '#94A3B8', fontSize: 22, cursor: 'pointer', '&:hover': { color: '#1565C0' } }} /> */}

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {/* <SortIcon sx={{ color: '#64748B', fontSize: 20 }} /> */}
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        displayEmpty
                        sx={{
                           backgroundColor:darkTheme?'#2c2b2bb4': "#FFFFFF",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E2E8F0',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#CBD5E1',
                          },
                        }}
                      >
                        <MenuItem value="name">Sort by: Patient Name</MenuItem>
                        <MenuItem value="date">Sort by: Admission Date</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Box>

          <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",   // ✅ horizontal center
   
  }}
>
            {(() => {
              switch (selectedIndex) {
                case 0:
                  return (
                   <Box
  sx={{
    
    width: {
      xs: "95%",   // mobile
      sm: "95%",   // small tablets (optional)
      md: "85%",   // medium screens (optional)
      lg: "80%",   // large screens
    },
    mx: "auto",    // ✅ centers it horizontally
  }}
>
                      {patientList
                        .filter((patient) => {
                          const name = patient.extension?.find(e => e.url === 'http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName')?.valueString || "";
                          const pid = patient.identifier?.[0]?.value || "";
                          const query = searchQuery.toLowerCase();
                          return name.toLowerCase().includes(query) || pid.toLowerCase().includes(query);
                        })
                        .sort((a, b) => {
                          if (sortBy === 'name') {
                            const nameA = a.extension?.find(e => e.url === 'http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName')?.valueString || "";
                            const nameB = b.extension?.find(e => e.url === 'http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName')?.valueString || "";
                            return nameA.localeCompare(nameB);
                          } else if (sortBy === 'date') {
                            const dateA = new Date(a.meta?.lastUpdated || a.birthDate || 0).getTime();
                            const dateB = new Date(b.meta?.lastUpdated || b.birthDate || 0).getTime();
                            return dateB - dateA;
                          }
                          return 0;
                        })
                        .map(patient => (
                          <PatientCard
                            key={String(patient.id)}
                            patient_resource_id={String(patient.id)}
                            patient_name={String(patient.extension?.find(e => e.url === 'http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName')?.valueString || "Unknown")}
                            gestational_age={String(patient.extension?.find(e => e.url === 'http://hl7.org/fhir/StructureDefinition/patient-gestationalAge')?.valueString || patient.extension?.[1]?.valueString || "")}
                            birthDate={String(patient.birthDate || "")}
                            birthWeight={String(patient.birthWeight || "")}
                            gender={String(patient.gender || "")}
                            patient_id={String(patient.identifier?.[0]?.value || "")}
                            device={parentDevice[String(patient.id)]}
                            observation_resource={parentObs[String(patient.id)]}
                            communication_resource={parentComm[String(patient.id)]}
                            darkTheme={darkTheme}
                            onClick={() => handlePatientCardClick(patient)}
                          />
                        ))}
                    </Box>
                  );
                  case 1:
                  return (
                   <Box
  sx={{
    
    width: {
      xs: "95%",   // mobile
      sm: "95%",   // small tablets (optional)
      md: "85%",   // medium screens (optional)
      lg: "80%",   // large screens
    },
    mx: "auto",    // ✅ centers it horizontally
  }}
>
                      {patientList
                        .filter((patient) => {
                          const name = patient.extension?.find(e => e.url === 'http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName')?.valueString || "";
                          const pid = patient.identifier?.[0]?.value || "";
                          const query = searchQuery.toLowerCase();
                          return name.toLowerCase().includes(query) || pid.toLowerCase().includes(query);
                        })
                        .sort((a, b) => {
                          if (sortBy === 'name') {
                            const nameA = a.extension?.find(e => e.url === 'http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName')?.valueString || "";
                            const nameB = b.extension?.find(e => e.url === 'http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName')?.valueString || "";
                            return nameA.localeCompare(nameB);
                          } else if (sortBy === 'date') {
                            const dateA = new Date(a.meta?.lastUpdated || a.birthDate || 0).getTime();
                            const dateB = new Date(b.meta?.lastUpdated || b.birthDate || 0).getTime();
                            return dateB - dateA;
                          }
                          return 0;
                        })
                        .map(patient => (
                          <PatientTaskContainer
                          key={String(patient.id)}
                          patient_resource_id={String(patient.id)}
                          patient_name={String(patient.extension?.find(e => e.url === 'http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName')?.valueString || "Unknown")}
                          birthDate={String(patient.birthDate)}
                          patient_id={String(patient.identifier?.[0]?.value || "Unknown")}
                          birthWeight={String(patient.birthWeight)}
                          observations={parentObs[String(patient.id)]}
                          communications={parentComm[String(patient.id)]}
                          gender={String(patient.gender)}
                          darkTheme={darkTheme}
                        />
                        ))}
                    </Box>
                  );
                
                default:
                  return (
                    <Box sx={{ textAlign: "center", mt: 4 }}>
                      <Typography variant="h5">🚧 Page Under Construction</Typography>
                      <Typography variant="body2">We're working to bring this page to life.</Typography>
                    </Box>
                  );
              }
            })()}


          </Box>
          {/* <Box>
            <Button variant="contained" color="primary" sx={floatingButtonStyles} onClick={handleOpenDialog}>
              <AddIcon />
            </Button>
          </Box> */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Add Patient Details</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Baby Mother's Name"
                type="text"
                fullWidth
                value={mothersName}
                onChange={(e) => setMothersName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="ID"
                type="text"
                fullWidth
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleSave} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {!isAuthenticated && !isLoading && (
        <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'} width={'70%'}>
          <img src={pmsLogo} alt="Phoenix" style={{ maxWidth: '50%', height: 'auto', marginLeft: 'auto', marginRight: 'auto' }} />
          <Typography variant='h3' color={'#1864AB'} fontWeight={'50'}>NeoLife Sentinel</Typography>
          <Typography variant='h6' color={'grey'} fontWeight={'50'}>Remote Patient Management System</Typography>
          <Stack direction={'row'} spacing={'30px'} justifyContent={'space-evenly'}>
            <Button variant='outlined' sx={{ width: '200px', height: '50px', borderRadius: '100px' }} endIcon={<OpenInNewIcon />} target='_blank' href='https://www.phoenixmedicalsystems.com/'>Product page</Button>
            <Button variant='contained' sx={{ width: '200px', height: '50px', borderRadius: '100px' }} onClick={() => loginWithRedirect()}>Sign In</Button>
          </Stack>
        </Stack>
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};