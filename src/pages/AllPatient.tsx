import  { useState, useEffect, useRef } from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import pmsLogo from '../assets/phx_logo.png';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PatientCard } from '../components/PatientCard';
import { NewPatientDetails } from '../components/NewPatientDetails';


type PatientMonitorProps = {
  userOrganization: string;
  currentRoom: any;
  darkTheme: boolean;
  searchQuery: string;
  selectedIcon: string;  // Adjust the type according to your requirements
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
    valueString: string;
  }[];
  identifier: {
    system: string;
    value: string;
  }[];
};

interface DataEntity {
  id: string;
  [key: string]: any;
}

interface State {
  [patientId: string]: DataEntity[];
}
export const AllPatient: React.FC< PatientMonitorProps> = ({ userOrganization, currentRoom ,darkTheme,searchQuery,selectedIcon}) => {
  console.log("in patient Monitor Page rooms",currentRoom);
  console.log("in patient Monitor Page",userOrganization);

  const [patientList, setPatientList] = useState<Patient[] | null>(null);
  const [parentdevice, setParentDevice] = useState<{ [key: string]: any }>({});
  const [parentobs, setParentObs] = useState<{ [key: string]: any }>({});
  const [parentcomm, setParentComm] = useState<{ [key: string]: any }>({});
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  //const [isDialogOpened, setIsDialogOpened] = useState(false);
  //const [isOpen, setIsOpen] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]); // State for filtered patient list
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  

  useEffect(() => {
    filterPatients(searchQuery);
  }, [searchQuery, patientList]);

  async function fetchWithRetry(url: string, options: RequestInit, retries: number = 3, initialDelay: number = 50): Promise<any> {
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
  }
  


  const fetchObservations = (patient: { id: any }) => {
    return fetch(
      `${import.meta.env.VITE_FHIRAPI_URL as string}/Observation?patient=${patient.id}`,
      {
        credentials: 'omit',
        headers: {
          Authorization: 'Basic ' + btoa('fhiruser:change-password'),
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .catch(handleFetchError);
  };

  const fetchCommunication = (patient: { id: any }) => {
    return fetch(
      `${import.meta.env.VITE_FHIRAPI_URL as string}/Communication?patient=${patient.id}`,
      {
        credentials: 'omit',
        headers: {
          Authorization: 'Basic ' + btoa('fhiruser:change-password'),
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .catch(handleFetchError);
  };

  const fetchDevice = (patient: { id: any }) => {
    return fetch(
      `${import.meta.env.VITE_FHIRAPI_URL as string}/Device?patient=${patient.id}`,
      {
        credentials: 'omit',
        headers: {
          Authorization: 'Basic ' + btoa('fhiruser:change-password'),
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .catch(handleFetchError);
  };

  const handleFetchError = (error: any) => {
    console.error('Fetch error:', error);
  };
  const fetchDataForPatients = async (patients: any[]) => {
    const tempParentObs: { [key: string]: any[] } = {};
    const tempParentComm: { [key: string]: any[] } = {};
    const tempParentDevice: { [key: string]: any[] } = {};

    setIsLoading(true);

    await Promise.all(
      patients.map(async (patient: { id: any }) => {
        const [observationResponse, communicationResponse, deviceResponse] =
          await Promise.all([
            
            fetchObservations(patient),
            fetchCommunication(patient),
            fetchDevice(patient),
          ]);

        const pp = String(patient.id);
        tempParentObs[pp] = observationResponse.entry?.map(
          (indiobs: { [x: string]: any }) => indiobs['resource']
        );
        tempParentComm[pp] = communicationResponse.entry?.map(
          (indidev: { [x: string]: any }) => indidev['resource']
        );
        tempParentDevice[pp] = deviceResponse.entry?.map(
          (indidev: { [x: string]: any }) => indidev['resource']
        );
      })
    );

    setIsLoading(false);

    return { tempParentObs, tempParentComm, tempParentDevice };
  };
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  
    fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Patient?organization=${userOrganization}`, {
      credentials: 'omit',
      headers: {
        Authorization: 'Basic ' + btoa('fhiruser:change-password'),
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .then((data) => {
        if (data.entry) {
          const patients = data.entry.map((entry: { resource: any }) => entry.resource);
          setPatientList(patients);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  
    const socket = new WebSocket(`${import.meta.env.VITE_FHIRSOCKET_URL as string}/notification`);
  
    socket.onopen = () => {
      console.log('Socket open successful');
    };
  
    // socket.onmessage = (data) => {
    //   var received_data = JSON.parse(data.data);
    //   if (received_data.location.split('/')[0] === 'Observation') {
    //     fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/${received_data.location}`, {
    //       credentials: 'omit',
    //       headers: {
    //         Authorization: 'Basic ' + btoa('fhiruser:change-password'),
    //       },
    //     })
    //       .then((response) => response.json())
    //       .then((data) => {
    //         let tempPatient = String(data.subject?.reference?.split('/')[1]);
    //         var obsID = String(data.id);
    //         setParentObs((prevtt) => {
    //           const tempVar = { ...prevtt };
    //           if (tempVar[tempPatient]) {
    //             for (var i = 0; i < tempVar[tempPatient].length; i++) {
    //               if (tempVar[tempPatient][i]['id'] === obsID) {
    //                 tempVar[tempPatient][i] = data;
    //                 break;
    //               }
    //             }
    //           }
    //           return tempVar;
    //         });
    //       });
    //   } else if (received_data.location.split('/')[0] === 'Communication') {
    //     fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/${JSON.parse(data.data).location}`, {
    //       credentials: 'omit',
    //       headers: {
    //         Authorization: 'Basic ' + btoa('fhiruser:change-password'),
    //       },
    //     })
    //       .then((response) => response.json())
    //       .then((data) => {
    //         var tempPatient = String(data.subject?.reference?.split('/')[1]);
    //         var comID = String(data.id);
    //         setParentComm((prevtt) => {
    //           const tempVar = { ...prevtt };
    //           if (tempVar[tempPatient]) {
    //             for (var i = 0; i < tempVar[tempPatient].length; i++) {
    //               if (tempVar[tempPatient][i]['id'] === comID) {
    //                 tempVar[tempPatient][i] = data;
    //                 break;
    //               }
    //             }
    //           }
    //           return tempVar;
    //         });
    //       });
    //   }
    // };
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

  
    socket.onerror = () => {
      console.log(`Error in socket connection`);
    };
  
    return () => {
      console.log('CLOSE SUCCESS');
      socket.close();
      // Clean up other resources if needed
    };
  }, []);
  
  useEffect(() => {
    if (patientList != null && patientList.length > 0) {
      fetchDataForPatients(patientList)
      
        .then((result) => {
          setParentObs(result.tempParentObs);
          setParentComm(result.tempParentComm);
          setParentDevice(result.tempParentDevice);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [patientList]);
  console.log("patient list here",patientList);

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
    console.log("handlepatientclick",patient);
  };
  
  const patientCards = filteredPatients.map(patient => {
    return (
      <PatientCard
      patient_resource_id={String(patient.id)}
      key={String(patient.id)}
      patient_name={String(patient.extension[0].valueString)}
      patient_id={String(patient.identifier[0].value)}
      device={parentdevice[String(patient.id)]}
      observation_resource={parentobs[String(patient.id)]}
      communication_resource={parentcomm[String(patient.id)]}
      darkTheme={darkTheme}
      selectedIcon={selectedIcon}
      onClick={() => handlePatientCardClick(patient)} 
    />
  )});
  
  const filterPatients = (query: string) => {
    if (!query.trim()) {
      setFilteredPatients(patientList ?? []);
    } else {
      const filtered = patientList?.filter(patient =>
        patient.extension.some(extension =>
          extension.valueString.toLowerCase().includes(query.toLowerCase())
        ) ||
        patient.identifier.some(identifier =>
          identifier.value.toLowerCase().includes(query.toLowerCase())
        )
      );
      setFilteredPatients(filtered ?? []);
    }
  };
  useEffect(() => {
    console.log(parentdevice);
  }, [parentdevice]);

  const containerStyles = selectedIcon === 'vertical' ? {
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'left',
     
  } : {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    
  };

  return (  
    <div  style={containerStyles}  >
      {selectedIcon === 'vertical' ? (
   <div style={{ display: 'flex', height: '100vh', alignItems: 'stretch' }}>
          
        <Box sx={{ display: 'flex',marginTop: '0px', paddingTop: '0px', flexWrap: 'wrap', gap: '2rem', mt: { xs: 5, sm: 6, md: 4, lg: 3 }, mb: { xs: 3, sm: 4, md: 4, lg: 3 }, justifyContent: 'center', minWidth: '40%' ,maxWidth:'40%',height: '100%',}}>
        {isAuthenticated && (
          <Box sx={{ width: "100%" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: '0.3rem', justifyContent: "center", width: "100%", marginBottom: '2%',maxHeight: '800px', overflowY: 'auto'  }}>
             
              {patientCards}
           
            </Box>
          </Box>
        )}
        {!isAuthenticated && !isLoading && (
          <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'} width={'70%'}>
            <img src={pmsLogo} alt="Phoenix" style={{ maxWidth: '50%', height: 'auto', marginLeft: 'auto', marginRight: 'auto' }} />
            <Typography variant='h3' color={'white'} fontWeight={'50'}>NeoLife Sentinel</Typography> {/*PhoenixCare Sentinel*/ }
            <Typography variant='h6' color={'grey'} fontWeight={'50'}>Remote Device Monitoring System</Typography>
            <Stack direction={'row'} spacing={'30px'} justifyContent={'space-evenly'}>
              <Button variant='outlined' sx={{ width: '200px', height: '50px', borderRadius: '100px' }} endIcon={<OpenInNewIcon />} target='_blank' href='https://www.phoenixmedicalsystems.com/'>Product page</Button>
              <Button variant='contained' sx={{ width: '200px', height: '50px', borderRadius: '100px' }} onClick={() => loginWithRedirect()}>Sign In</Button>
            </Stack>
          </Stack>
        )}
      </Box>
        <Box sx={{ display: 'flex', marginTop: '0px', padding: '20px', gap: '2rem', mt: { xs: 5, sm: 6, md: 4, lg: 3 }, mb: { xs: 3, sm: 4, md: 4, lg: 3 }, justifyContent: 'center', width: '60%' ,height: '100%',}}>
        
        { selectedPatient && (
          
            <NewPatientDetails
              isDialogOpened={isOpen}
              handleCloseDialog={() => { setIsOpen(false); } }
              patient_id={String(selectedPatient.identifier[0].value)}
              patient_name={String(selectedPatient.extension[0].valueString)}
              key={selectedPatient.id}
              patient_resource_id={String(selectedPatient.id)} 
              darkTheme={darkTheme} 
              selectedIcon={selectedIcon}
              observation_resource={parentobs[selectedPatient.id] || []}
              communication_resource={parentcomm[selectedPatient.id] || []}
              device={parentdevice[selectedPatient.id] || []}
              />

         
        )}</Box>
        </div>
  ) : (
    // Render only the first box component when selected icon is not 'vertical'
    <Box sx={{display: "flex",marginTop:'0px',paddingTop:'0px',flexWrap: "wrap",gap: '2rem',mt: {xs: 5,sm: 6,md: 4,lg: 3,},
                      mb: {xs: 3,sm: 4,md: 4,lg: 3,
                      },
                      justifyContent: "center",
                      width:'100%'
                    }}
                  >
              {isAuthenticated && (
                <Box sx={{width:"100%"}}>
               
                
                  <Box
                            sx={{
                              // backgroundColor:'red',
                              display: "flex",flexWrap: "wrap", gap: '0.3rem', justifyContent: "left", width:"100%", marginBottom:'2%' }}>
                     
                      {patientCards}
                      
    </Box>
              
              
             </Box>
              )}
              {!isAuthenticated && !isLoading && (
                <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'} width={'70%'}>
                  <img src={pmsLogo} alt="Phoenix" style={{maxWidth: '50%',height: 'auto', marginLeft:'auto',marginRight:'auto' }}/>
                  <Typography variant='h3' color={'white'} fontWeight={'50'}>NeoLife Sentinel</Typography> {/*PhoenixCare Sentinel*/ }
                  <Typography variant='h6' color={'grey'} fontWeight={'50'}>Remote Device Monitoring System</Typography>
                  <Stack direction={'row'} spacing={'30px'} justifyContent={'space-evenly'}>
                  <Button variant='outlined'sx={{width:'200px', height:'50px', borderRadius:'100px'}} endIcon={<OpenInNewIcon />} target='_blank' href='https://www.phoenixmedicalsystems.com/'>Product page</Button>
                  <Button variant='contained' sx={{width:'200px', height:'50px', borderRadius:'100px'}} onClick={() => loginWithRedirect()}>Sign In</Button>
                  </Stack>
                </Stack>
              )}
        </Box>
  )}
         </div>
       
    
        
    
  )
}