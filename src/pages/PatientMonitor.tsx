import  { useState, useEffect, useRef, SetStateAction, useCallback } from 'react';
import { Box, Typography, Stack, Button, DialogContent, DialogActions, Dialog, TextField, DialogTitle, Snackbar, Alert} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import pmsLogo from '../assets/phx_logo.png';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PatientCard } from '../components/PatientCard';
import AddIcon from '@mui/icons-material/Add';
// import { DummyPatientCard } from '../components/DummyPatientCard';
import { NewPatientDetails } from "../components/NewPatientDetails";

type PatientMonitorProps = {
  userOrganization: string;
  currentRoom: any;
  darkTheme: boolean; 
  selectedIcon: string;
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

  export const PatientMonitor: React.FC<PatientMonitorProps> = ({ userOrganization, currentRoom ,darkTheme,selectedIcon}) => {
  
  //console.log("in patient Monitor Page rooms",currentRoom);
  //console.log("in patient Monitor Page",userOrganization);
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [patientList, setPatientList] = useState<Patient[] | null>(null);
  const [parentDevice, setParentDevice] = useState<{ [key: string]: any }>({});
  const [parentObs, setParentObs] = useState<{ [key: string]: any }>({});
  const [parentComm, setParentComm] = useState<{ [key: string]: any }>({});
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [mothersName, setMothersName] = useState('');
  const [id, setId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

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
    const url = `${import.meta.env.VITE_FHIRAPI_URL as string}/Observation?patient=${patient.id}`;
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

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Patient?_count=1000&organization=${userOrganization}`, {
          credentials: 'omit',
          headers: {
            Authorization: 'Basic ' + btoa('fhiruser:change-password'),
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.entry) {
            const patients = data.entry.map((entry: { resource: any }) => entry.resource);
            setPatientList(patients);
          }
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchPatients();
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
    if (patientList && currentRoom) {
      const filtered = patientList.filter((patient) => {
        const locationExtension = patient.extension.find((ext) => ext.url === 'http://hl7.org/fhir/StructureDefinition/patient-location');
        return locationExtension && locationExtension.valueReference?.reference === `Location/${currentRoom}`;
      });
      setFilteredPatients(filtered);
    }
  }, [patientList, currentRoom]);

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
    console.log("handlepatientclick", patient);
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

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    
  };

  const floatingButtonStyles = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    borderRadius: '50%',
    backgroundColor: '#124D81',
    color: '#fff',
    width: '60px',
    height: '60px',
    minWidth: 'unset',
    border: '2px solid #124D81',
    animation: 'pulseAnimation 3s infinite ease-in-out',
    '&:hover': {
      backgroundColor: '#124D81',
    },
    '@keyframes pulseAnimation': {
      '0%': {
        boxShadow: '0 0 0 0 rgba(63, 81, 181, 0.7)',
      },
      '70%': {
        boxShadow: '0 0 0 10px rgba(63, 81, 181, 0)',
      },
      '100%': {
        boxShadow: '0 0 0 0 rgba(63, 81, 181, 0)',
      },
    },
  };

  return (
    <div style={containerStyles}>
      {isAuthenticated && (
        <>
          <Box sx={{ alignItems: 'center', justifyContent: 'center',p:1 }}>
            {filteredPatients.map(patient => (
              <PatientCard
                key={String(patient.id)}
                patient_resource_id={String(patient.id)}
                patient_name={String(patient.extension[0].valueString)}
                patient_id={String(patient.identifier[0].value)}
                device={parentDevice[String(patient.id)]}
                observation_resource={parentObs[String(patient.id)]}
                communication_resource={parentComm[String(patient.id)]}
                darkTheme={darkTheme}
                selectedIcon={selectedIcon}
                onClick={() => handlePatientCardClick(patient)}
              />
            ))}
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
        </>
      )}
      {!isAuthenticated && !isLoading && (
        <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'} width={'70%'}>
          <img src={pmsLogo} alt="Phoenix" style={{ maxWidth: '50%', height: 'auto', marginLeft: 'auto', marginRight: 'auto' }} />
          <Typography variant='h3' color={'white'} fontWeight={'50'}>NeoLife Sentinel</Typography>
          <Typography variant='h6' color={'grey'} fontWeight={'50'}>Remote Device Monitoring System</Typography>
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