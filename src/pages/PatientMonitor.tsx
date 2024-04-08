import  { useState, useEffect, useRef } from 'react';
import { Box, Typography, Stack, Button, Accordion, AccordionSummary,  AccordionDetails, TextField, InputAdornment } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import pmsLogo from '../assets/phx_logo.png';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PatientCard } from '../components/PatientCard';
import { DummyPatientCard } from '../components/DummyPatientCard';
import { ExpandMoreRounded } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
type PatientMonitorProps = {
  userOrganization: string;
  currentRoom: any;
  darkTheme: boolean; // Adjust the type according to your requirements
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
  export const PatientMonitor: React.FC<PatientMonitorProps> = ({ userOrganization, currentRoom ,darkTheme}) => {
  console.log("in patient Monitor Page rooms",currentRoom);
  console.log("in patient Monitor Page",userOrganization);

  const [patientList, setPatientList] = useState<Patient[] | null>(null);
  const [parentdevice, setParentDevice] = useState<{ [key: string]: any }>({});
  const [parentobs, setParentObs] = useState<{ [key: string]: any }>({});
  const [parentcomm, setParentComm] = useState<{ [key: string]: any }>({});
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]); // State for filtered patient list

  useEffect(() => {
    filterPatients(searchQuery);
  }, [searchQuery, patientList]);


  const fetchObservations = (patient: { id: any }) => {
    return fetch(
      ` https://pmsind.co.in:5000/Observation?patient=${patient.id}`,
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
      ` https://pmsind.co.in:5000/Communication?patient=${patient.id}`,
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
      ` https://pmsind.co.in:5000/Device?patient=${patient.id}`,
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
  
    fetch(`https://pmsind.co.in:5000/Patient?organization=${userOrganization}`, {
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
  
    const socket = new WebSocket('wss://pmsind.co.in:5000/notification');
  
    socket.onopen = () => {
      console.log('Socket open successful');
    };
  
    socket.onmessage = (data) => {
      var received_data = JSON.parse(data.data);
      if (received_data.location.split('/')[0] === 'Observation') {
        fetch(` https://pmsind.co.in:5000/${received_data.location}`, {
          credentials: 'omit',
          headers: {
            Authorization: 'Basic ' + btoa('fhiruser:change-password'),
          },
        })
          .then((response) => response.json())
          .then((data) => {
            let tempPatient = String(data.subject?.reference?.split('/')[1]);
            var obsID = String(data.id);
            setParentObs((prevtt) => {
              const tempVar = { ...prevtt };
              if (tempVar[tempPatient]) {
                for (var i = 0; i < tempVar[tempPatient].length; i++) {
                  if (tempVar[tempPatient][i]['id'] === obsID) {
                    tempVar[tempPatient][i] = data;
                    break;
                  }
                }
              }
              return tempVar;
            });
          });
      } else if (received_data.location.split('/')[0] === 'Communication') {
        fetch(` https://pmsind.co.in:5000/${JSON.parse(data.data).location}`, {
          credentials: 'omit',
          headers: {
            Authorization: 'Basic ' + btoa('fhiruser:change-password'),
          },
        })
          .then((response) => response.json())
          .then((data) => {
            var tempPatient = String(data.subject?.reference?.split('/')[1]);
            var comID = String(data.id);
            setParentComm((prevtt) => {
              const tempVar = { ...prevtt };
              if (tempVar[tempPatient]) {
                for (var i = 0; i < tempVar[tempPatient].length; i++) {
                  if (tempVar[tempPatient][i]['id'] === comID) {
                    tempVar[tempPatient][i] = data;
                    break;
                  }
                }
              }
              return tempVar;
            });
          });
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <Stack sx={{backgroundColor: darkTheme?'' :'#FFFFFF', borderRadius: '25px'}}> 
                   <TextField
        variant="outlined"
        size="small"
        inputProps={{ style: { color: darkTheme?'white' :'#124D81'  } }} // Set text color to blue
        sx={{
          backgroundcolor: '#FFFFFF',
          '& .MuiOutlinedInput-root': {
            borderRadius: '25px', // Set border radius
            borderColor: '#F9F9F9', // Set border color
            borderStyle: 'solid', // Set border style
            borderWidth: '1px', // Set border width
            '&:hover fieldset': {
              borderColor: '#124D81' // Set border color on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#124D81' // Set border color when focused
            }
          }
        }}
      
        placeholder="Search Baby Name/ID"
        style={{ width: '300px' }} 
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon style={{ color: darkTheme?'white':'black' }} /> 
            </InputAdornment>
          ),
        }}// Adjust width as needed
      /></Stack>
      </div>

      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      
    <Box
          sx={{
            
            display: "flex",
            flexWrap: "wrap",
            gap: '2rem',
            mt: {
              xs: 5,
              sm: 6,
              md: 7,
              lg: 8,
            },
            mb: {
              xs: 3,
              sm: 4,
              md: 5,
              lg: 6,
            },
            justifyContent: "center",
            width:"95%",
            
          }}
        >
          {isAuthenticated && (
            <Box sx={{width:"100%"}}>
            <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' , marginBottom:"10px", borderBottom:darkTheme?'2px solid white':'2px solid #386893',borderTop: 'none','&:before': {opacity: 0,}}}>
              
              <AccordionSummary
                expandIcon={<ExpandMoreRounded sx={{color:darkTheme?'white':"#386893", fontSize:'300%'}}/>}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant='h5' component={"h2"} sx={{color:darkTheme?'white': "#386893"}}>NICU LEVEL 1</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <Box
                  sx={{
                    // backgroundColor:'red',
                    display: "flex",
                    flexWrap: "wrap",
                    gap: '1rem',
                    justifyContent: "left",
                    width:"100%",
                    marginBottom:'2%'
                  }}
                >
<DummyPatientCard  darkTheme={darkTheme}/>
<DummyPatientCard  darkTheme={darkTheme}/>
<DummyPatientCard  darkTheme={darkTheme}/>

</Box>
              </AccordionDetails>
            </Accordion>
            <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' , marginBottom:"10px", borderBottom:darkTheme?'2px solid white':'2px solid #386893',borderTop: 'none','&:before': {opacity: 0,}}}>
              
              <AccordionSummary
                expandIcon={<ExpandMoreRounded sx={{color:darkTheme?'white':"#386893", fontSize:'300%'}}/>}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant='h5' component={"h2"} sx={{color:darkTheme?'white': "#386893"}}>NICU LEVEL 2</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <Box
                  sx={{
                    // backgroundColor:'red',
                    display: "flex",
                    flexWrap: "wrap",
                    gap: '2rem',
                    justifyContent: "left",
                    width:"100%",
                    marginBottom:'2%'
                  }}
                >

                
{patientCards}
</Box>
              </AccordionDetails>
            </Accordion>
            <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' , marginBottom:"10px",borderBottom:darkTheme?'2px solid white':'2px solid #386893',borderTop: 'none','&:before': {opacity: 0,}}}>
              
              <AccordionSummary expandIcon={<ExpandMoreRounded sx={{color:darkTheme?'white':"#386893", fontSize:'300%'}}/>}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant='h5' component={"h2"} sx={{color:darkTheme?'white': "#386893"}}>NICU LEVEL 3</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <Box
                  sx={{
                    // backgroundColor:'red',
                    display: "flex",
                    flexWrap: "wrap",
                    gap: '2rem',
                    justifyContent: "left",
                    width:"100%",
                    marginBottom:'2%'
                  }}
                >


</Box>
              </AccordionDetails>
            </Accordion>
           
           
            
          </Box>
          )}
          {!isAuthenticated && !isLoading && (
            <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'} width={'70%'}>
              <img src={pmsLogo} alt="Phoenix" style={{maxWidth: '50%', // Set the maximum width to 100%
height: 'auto', // Maintain the aspect ratio
                marginLeft:'auto',
                marginRight:'auto'
              }}/>
              <Typography variant='h3' color={'white'} fontWeight={'50'}>NeoLife Sentinel</Typography> {/*PhoenixCare Sentinel*/ }
              <Typography variant='h6' color={'grey'} fontWeight={'50'}>Remote Device Monitoring System</Typography>
              <Stack direction={'row'} spacing={'30px'} justifyContent={'space-evenly'}>
              <Button variant='outlined'sx={{width:'200px', height:'50px', borderRadius:'100px'}} endIcon={<OpenInNewIcon />} target='_blank' href='https://www.phoenixmedicalsystems.com/'>Product page</Button>
              <Button variant='contained' sx={{width:'200px', height:'50px', borderRadius:'100px'}} onClick={() => loginWithRedirect()}>Sign In</Button>
              
              </Stack>
            </Stack>
          )}
    </Box>
    
  </div></div>
    
    
  )
}