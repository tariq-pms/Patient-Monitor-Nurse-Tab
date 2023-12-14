import React, { useState, useEffect, useRef } from 'react';
import {Box,Typography,Card,CardContent,Skeleton,Stack, Button,} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PatientCard } from '../components/PatientCard';
import pmsLogo from '../assets/phx_logo.png';
import { useNavigate } from 'react-router-dom'; 
type Patient = {
    "resourceType": string;
    "id": string;
    "meta": {
        "versionId": string;
        "lastUpdated": string;
    };
    "extension": 
        { "url": string;
            "valueString":string;
        }[];

    "identifier": 
        {"system": string;
            "value": string;
        }[]; 
}
type Observation = {
  "resourceType": string;
  "id": string;
  "meta": {
      "versionId": string;
      "lastUpdated": string;
  },
  "identifier": 
      {"value": string;
      }[];
  "status": string;
  "category":
      {"coding":
              {"system": string;
                  "code": string;
                  "display": string;
              }[];
      }[];
  "code": {
      "coding": 
          { "system": string;
              "code": string;
              "display": string;
          }[];
       "text": string;
  };
  "subject": {
      "reference": string;
  };
  "device": {
      "reference": string;
  };
  "component": 
      {
          "code": {
              "coding": 
                  {
                      "system": string;
                      "code": string;
                      "display": string;
                  }[];
              "text": string;
          };
          "valueQuantity": {
              "value": number;
              "unit": string;
              "system": string;
              "code": string;
          };
      }[];
}
type PatientData = {
  name: Array<{ given: string[]; family: string }>;
  extension: Array<{ url: string; valueString: string }>;
  identifier: Array<{ system: string; value: string }>;
};
export const PatientMonitor = (currentRoom: any) => {
  const [patientList, setPatientList] = useState<Patient[] | null>(null);
  const [parentdevice, setParentDevice] = useState({});
  const [parentobs, setParentObs] = useState<{ [key: string]: any }>({});
  const [parentcomm, setParentComm] = useState<{ [key: string]: any }>({});
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [displayedPatients, setDisplayedPatients] = useState(18);
  const [totalPatients, setTotalPatients] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchObservations = (patient: { id: any; }) => {
    return fetch(`http://3.110.169.17:9444/fhir-server/api/v4/Observation?patient=${patient.id}`, {
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
      });
  };
   const fetchCommunication = (patient: { id: any; }) => {
    return fetch(`http://3.110.169.17:9444/fhir-server/api/v4/Communication?patient=${patient.id}`, {
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
      });
  };
  const fetchDevice = (patient: { id: any; }) => {
    return fetch(`http://3.110.169.17:9444/fhir-server/api/v4/Device?patient=${patient.id}`, {
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
      });
  };
  const fetchDataForPatients = async (patients) => {
    const tempParentObs = {};
    const tempParentComm = {};
    const tempParentDevice = {};
  
    await Promise.all(patients.map(async (patient) => {
      const [observationResponse, communicationResponse, deviceResponse] = await Promise.all([
        fetchObservations(patient),
        fetchCommunication(patient),
        fetchDevice(patient),
      ]);
   const pp = String(patient.id);
   tempParentObs[pp] = observationResponse.entry?.map((indiobs: { [x: string]: any; }) => indiobs['resource']);
   tempParentComm[pp] = communicationResponse.entry?.map((indidev: { [x: string]: any; }) => indidev['resource']);
   tempParentDevice[pp] = deviceResponse.entry?.map((indidev: { [x: string]: any; }) => indidev['resource']);
    }));
    console.log(tempParentObs)
    return { tempParentObs, tempParentComm, tempParentDevice };
  };
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          // Load more data when scrolled to the bottom (adjust 20 according to your preference)
          setDisplayedPatients((prev) => prev + 9);
        }
      }
    };

    // Attach the scroll event listener to the container
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      // Remove the scroll event listener when the component is unmounted
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [setDisplayedPatients]);

  useEffect(() => {
    const patientDataURL =
      'http://3.110.169.17:9444/fhir-server/api/v4/Patient?_count=52';

    fetch(patientDataURL, {
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
          // Extract the list of patients from the bundle
          const patients = data.entry.map((entry: { resource: any }) => entry.resource);
          setPatientList(patients);
          setTotalPatients(data.total || 0);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    const socket = new WebSocket('ws://3.110.169.17:9444/fhir-server/api/v4/notification');
    socket.onopen = () => {
        console.log("Socket open successful");
    };
    socket.onmessage = (data) => {
        var recieved_data = JSON.parse(data.data)
        if (recieved_data.location.split("/")[0] == "Observation"){

            fetch(`http://3.110.169.17:9444/fhir-server/api/v4/${recieved_data.location}`, {
            credentials: "omit",
            headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
            })
            .then((response) => response.json())
            .then((data) => {
            let tempPatient = String(data.subject?.reference?.split("/")[1])
            // var tempvar = parentobs[tempPatient]
            console.log(parentobs)
            console.log(patientList)
            var obsID = String(data.id)
            setParentObs((prevtt) => {
              const tempVar = { ...prevtt };
              if (tempVar[tempPatient]) {
                for (var i = 0; i < tempVar[tempPatient].length; i++) {
                  if (tempVar[tempPatient][i]['id'] === obsID) {
                    tempVar[tempPatient][i] = data;
                    // console.log(data)
                    break;
                  }
                }
              }
              return tempVar;
            })
            })
        // }
        }
        else if (recieved_data.location.split("/")[0] == "Communication"){
            fetch(`http://3.110.169.17:9444/fhir-server/api/v4/${JSON.parse(data.data).location}`, {
            credentials: "omit",
            headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
            })
            .then((response) => response.json())
            .then((data) => {
            var tempPatient = String(data.subject?.reference?.split("/")[1])
            var comID = String(data.id)
            setParentComm((prevtt) => {
              const tempVar = { ...prevtt };
              if (tempVar[tempPatient]) {
                for (var i = 0; i < tempVar[tempPatient].length; i++) {
                  if (tempVar[tempPatient][i]['id'] === comID) {
                    tempVar[tempPatient][i] = data;
                    console.log(data)
                    break;
                  }
                }
              }
              return tempVar;
            })
            })
        // }
        }

    };
    socket.onerror = () => {console.log(`Error in socket connection`)}
    return () => {
      console.log('CLOSE SUCCESS');
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (patientList != null) {
      if (patientList.length > 0) {
        fetchDataForPatients(patientList.slice(0, displayedPatients))
          .then((result) => {
            setParentObs(result.tempParentObs);
            setParentComm(result.tempParentComm);
            setParentDevice(result.tempParentDevice);
            console.log(result.tempParentDevice);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  }, [patientList, displayedPatients]);
  const patientc = patientList
  ?.slice(0, displayedPatients)
  .map((patient) => (
    <PatientCard
      patient_resource_id={String(patient.id)}
      key={String(patient.id)}
      patient_name={String(patient.extension[0].valueString)}
      patient_id={String(patient.identifier[0].value)}
      device={parentdevice[String(patient.id)]}
      observation_resource={parentobs[String(patient.id)]}
      communication_resource={parentcomm[String(patient.id)]}
    />
  ));

useEffect(() => {
  console.log(parentdevice);
}, [parentdevice]);

  return (
    <Box
      ref={containerRef}
      display="flex"
      justifyContent="center"
      marginTop={'50px'}
      sx={{
        overflowY: 'auto',
        maxHeight: '700px', // Set a maximum height for the container
      }}
    >
     {isAuthenticated && user?.roles.includes('Hospital Technician') && (
         <div>
         {patientList?.length > 0 ? (
           <Box
             display={'flex'}
             flexWrap={'wrap'}
             justifyContent={'center'}
             gap={'1rem'}
           >
             {patientc}
           </Box>
         ) : (
           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
             {Array.from({ length: 3 }, (_, i) => (
               <Card key={i} style={{ margin: '10px', width: '250px', borderRadius: '25px' }}>
                 <CardContent>
                   <Typography variant="h5" gutterBottom>
                     <Skeleton animation="wave" width={200} />
                   </Typography>
                   <Typography variant="body1">
                     <Skeleton animation="wave" width={200} />
                   </Typography>
                   <Typography variant="body1">
                     <Skeleton animation="wave" width={120} />
                   </Typography>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
         {displayedPatients < totalPatients && (
            <Box display="flex" justifyContent="flex-end" marginTop="1rem">
            {/* <Button onClick={handleLoadMore}>Load More</Button> */}
          </Box>
         )}
       </div>
      )}
      {!isAuthenticated && (
                  <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'} width={'70%'}>
                    <img src={pmsLogo} alt="Phoenix" style={{
                      maxWidth: '50%', // Set the maximum width to 100%
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
  );
};
