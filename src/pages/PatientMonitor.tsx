import  { useState, useEffect, useRef } from 'react';
import { Box, Typography, Stack, Button, Accordion, AccordionSummary,  AccordionDetails } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import pmsLogo from '../assets/phx_logo.png';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PatientCard } from '../components/PatientCard';
import { DummyPatientCard } from '../components/DummyPatientCard';
import { ExpandMoreRounded } from '@mui/icons-material';
type PatientMonitorProps = {
  userOrganization: string;
  currentRoom: any; // Adjust the type according to your requirements
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

//export const PatientMonitor = (currentRoom: any) => {
  export const PatientMonitor: React.FC<PatientMonitorProps> = ({ userOrganization, currentRoom }) => {
  console.log(currentRoom);
  console.log("in patient Monitor Page",userOrganization);

  const [patientList, setPatientList] = useState<Patient[] | null>(null);
  const [parentdevice, setParentDevice] = useState<{ [key: string]: any }>({});
  const [parentobs, setParentObs] = useState<{ [key: string]: any }>({});
  const [parentcomm, setParentComm] = useState<{ [key: string]: any }>({});
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  

  // const fetchPatients = async (page: number) => {
  //   const patientDataURL = ` https://pmsind.co.in:5000/Patient?page=${page}&_count=10`;

  //   const response = await fetch(patientDataURL, {
  //     credentials: 'omit',
  //     headers: {
  //       Authorization: 'Basic ' + btoa('fhiruser:change-password'),
  //     },
  //   });

  //   if (response.ok) {
  //     const data = await response.json();
  //     if (data.entry) {
  //       const patients = data.entry.map((entry: { resource: any }) => entry.resource);
  //       setPatientList((prevPatients) => (prevPatients ? [...prevPatients, ...patients] : patients));
  //     }
  //   }
  // };   

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
    //const patientDataURL = ' https://pmsind.co.in:5000/Patient';
    //const patientDataURL = ' https://pmsind.co.in:5000/Patient?organization=${organization}';
  
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
  
  const patientc = patientList?.map((patient) => {
    return (
      <PatientCard
        patient_resource_id={String(patient.id)}
        key={String(patient.id)}
        patient_name={String(patient.extension[0].valueString)}
        patient_id={String(patient.identifier[0].value)}
        device={parentdevice[String(patient.id)]}
        observation_resource={parentobs[String(patient.id)]}
        communication_resource={parentcomm[String(patient.id)]}
      />
    );
  });

  useEffect(() => {
    console.log(parentdevice);
  }, [parentdevice]);

  // return (
  //   <Box display="flex" justifyContent="center" marginTop={'50px'}>
  //     {isAuthenticated && patientList !== undefined &&   patientList !==null &&(
  //       <div>
  //         {patientList?.length > 0 ? (
  //           <Box display={'flex'} flexWrap={'wrap'} justifyContent={'center'} gap={'1rem'}>
  //         <DummyPatientCard ></DummyPatientCard>
  //             {patientc}
             
  //           </Box>
            
  //         ) : (
  //           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
  //             {isLoading ? (
  //               Array.from({ length: 3 }, (_, i) => (
  //                 <Card key={i} style={{ margin: '10px', width: '250px', borderRadius: '25px' }}>
  //                   <CardContent>
  //                     <Typography variant="h5" gutterBottom>
  //                       <Skeleton animation="wave" width={200} />
  //                     </Typography>
  //                     <Typography variant="body1">
  //                       <Skeleton animation="wave" width={200} />
  //                     </Typography>
  //                     <Typography variant="body1">
  //                       <Skeleton animation="wave" width={120} />
  //                     </Typography>
  //                   </CardContent>
  //                 </Card>
  //               ))
  //             ) : (
  //               <Typography variant="h5" gutterBottom>
  //                 No patients found.
  //               </Typography>
  //             )}
  //           </div>
  //         )}
  //         {patientList?.length > 0 && (
  //         <div ref={triggerRef} style={{ height: '10px' }} />
  //         )}
  //       </div>
  //     )}
  //     {!isAuthenticated && (
  //       <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'} width={'70%'}>
        
  //         <img src={pmsLogo}  alt="Phoenix"  style={{ maxWidth: '20%',  height: 'auto', // Maintain the aspect ratio
  //  marginLeft: 'auto',
  //             marginRight: 'auto',
  //           }}
  //         />
  //         <Typography variant="h3" color={'white'} fontWeight={'50'}>
  //           NeoLife Sentinel
  //         </Typography>
  //         <Typography variant="h6" color={'grey'} fontWeight={'50'}>
  //           Remote Device Monitoring System
  //         </Typography>
  //         <Stack direction={'row'} spacing={'30px'} justifyContent={'space-evenly'}>
  //           <Button
  //             variant="outlined"
  //             sx={{ width: '200px', height: '50px', borderRadius: '100px' }}
  //             endIcon={<OpenInNewIcon />}
  //             target="_blank"
  //             href="https://www.phoenixmedicalsystems.com/">
  //             Product page
  //           </Button>
  //           <Button variant="contained" sx={{ width: '200px', height: '50px', borderRadius: '100px' }} onClick={() => loginWithRedirect()}>
  //             Sign In
  //           </Button>
  //         </Stack>
       
  //       </Stack>
  //     )}
  //   </Box>
  // );
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <Box
            sx={{
              // backgroundColor:'red',
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
              width:"100%",
              
            }}
          >
            {isAuthenticated && (
              <Box sx={{width:"100%"}}>
              <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' , marginBottom:"10px", borderBottom:'2px solid #386893',borderTop: 'none','&:before': {opacity: 0,}}}>
                
                <AccordionSummary
                  expandIcon={<ExpandMoreRounded sx={{color:"#386893", fontSize:'300%'}}/>}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography variant='h5' component={"h2"} sx={{color:"#386893"}}>NICU LEVEL 1</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Box
                    sx={{
                      // backgroundColor:'red',
                      display: "flex",
                      flexWrap: "wrap",
                      gap: '1rem',
                      justifyContent: "center",
                      width:"100%",
                      marginBottom:'2%'
                    }}
                  >
<DummyPatientCard/>
<DummyPatientCard/>
<DummyPatientCard/>

                  
                  

  </Box>
                </AccordionDetails>
              </Accordion>
              <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' , marginBottom:"10px", borderBottom:'2px solid #386893',borderTop: 'none','&:before': {opacity: 0,}}}>
                
                <AccordionSummary
                  expandIcon={<ExpandMoreRounded sx={{color:"#386893", fontSize:'300%'}}/>}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography variant='h5' component={"h2"} sx={{color:"#386893"}}>NICU LEVEL 2</Typography>
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
<DummyPatientCard/>
                  
{patientc}
  </Box>
                </AccordionDetails>
              </Accordion>
              <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' , marginBottom:"10px", borderBottom:'2px solid #386893',borderTop: 'none','&:before': {opacity: 0,}}}>
                
                <AccordionSummary
                  expandIcon={<ExpandMoreRounded sx={{color:"#386893", fontSize:'300%'}}/>}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography variant='h5' component={"h2"} sx={{color:"#386893"}}>NICU LEVEL 3</Typography>
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
<DummyPatientCard/>
  {patientc}
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
      
    </div>
    
  )
}
