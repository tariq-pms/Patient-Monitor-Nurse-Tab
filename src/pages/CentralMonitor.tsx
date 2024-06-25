import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { CICCard } from '../components/CICCard';
import { INCCard } from '../components/INCCard';
import { SVAASCard } from '../components/SVAASCard';
import { Skeleton } from '@mui/material';
import { NewDeviceDetails } from '../components/NewDeviceDetails';
import { BrammiCard } from '../components/BrammiCard';



interface CentralMonitorProps{
  currentRoom: any;
  darkTheme: boolean;
  selectedIcon: string;  
};
type Device = {
    resourceType: string;
    id: string;
    meta: {
      versionId: string;
      lastUpdated: string;
    };
    identifier: {
      system: string;
      value: string;
    }[];
    status: string;
    manufacturer: string;
    patient: {
      reference: string;
    };
    owner: {
      reference: string;
    };
    location: {
      reference: string;
    };
  };
export const CentralMonitor: React.FC<CentralMonitorProps> = ({ currentRoom, darkTheme ,selectedIcon}) => {

  const [, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  // Define separate loading states for each accordion
  const [isLoadingWarmers, setIsLoadingWarmers] = useState(true);
  const [isLoadingIncubator, setIsLoadingIncubator] = useState(true);
  const [isLoadingCPAP, setIsLoadingCPAP] = useState(true);
  const [isLoadingCoolingMachine, setIsLoadingCoolingMachine] = useState(true);
 
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      setIsLoadingWarmers(false);
      setIsLoadingIncubator(false);
      setIsLoadingCPAP(false);
      setIsLoadingCoolingMachine(false);
      
      
    }, 2000); // Adjust the duration as needed
},[]);
    const [parentobs, setParentObs] = useState<Record<string, any>>({});
    const [parentcomm, setParentComm] = useState<Record<string, any>>({});
    const [patient, setPatient] = useState<Record<string, any>>({})
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [devices, setDevices] = useState({
        "resourceType": String,
        "id": String,
        "type": String,
        "total": String,
        "link": [
        {
            "relation": String,
            "url": String,
        },
        ],
        "entry": [
        {
            "fullUrl": String,
            "resource": {
            "resourceType": String,
            "id": String,
            "status": String,
            "manufacturer": String,
            "patient":{
                "reference": ""
            },
            "meta": {
                "versionId": String,
                "lastUpdated": String,
            },
            "identifier": [
                {
                "system": String,
                "value": String,
                },
                {
                "system": String,
                "value": String,
                }
            ],
            "extension": [
                {
                "url": String,
                "valueString": String,
                },
            ],
            },
            "search": {
            "mode": String,
            "score": String,
            },
        },
        ],
    });
    useEffect(() => {
        setIsLoading(true)
        const socket = new WebSocket(`${import.meta.env.VITE_FHIRSOCKET_URL as string}/notification`);
        socket.onopen = () => {
            console.log("Socket open successful 1st use effect");
        };
        socket.onmessage = (data) => {
            var recieved_data = JSON.parse(data.data)
            console.log("entering 1st use effect",recieved_data)
            if (recieved_data.location.split("/")[0] == "Observation"){

                fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/${recieved_data.location}`, {
                credentials: "omit",
                headers: {
                Authorization: "Basic "+ btoa("fhiruser:change-password"),
                },
                })
                .then((response) => response.json())
                .then((data) => {
                let temp = String(data.device?.reference?.split("/")[1])

                console.log( "checking data?",data) 
                setParentObs((prevparentobs) => ({...prevparentobs,[temp]: data}))
                console.log("parentobs 1 else",parentobs)
                })
            
            }
            else if (recieved_data.location.split("/")[0] == "Communication"){
                fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/${JSON.parse(data.data).location}`, {
                credentials: "omit",
                headers: {
                Authorization: "Basic "+ btoa("fhiruser:change-password"),
                },
                })
                .then((response) => response.json())
                .then((data) => {
                var temp = String(data.sender.reference.split("/")[1])
                console.log( "checking data?",data) 
                setParentComm((prevparentcom) => ({...prevparentcom,[temp]: data}))
                console.log("parentobs 1 else",parentobs)

                })
            
            }
           
        };
        socket.onerror = () => {console.log(`Error in socket connection`)}
    }, [])
    useEffect(() => {
    setIsLoading(true);
    const socket = new WebSocket(`${import.meta.env.VITE_FHIRSOCKET_URL as string}/notification`);

    socket.onopen = () => {
        console.log("Socket open successful 2nd");
    };

    socket.onmessage = (event) => {
        console.log("Received raw data:", event.data);

        const receivedData = JSON.parse(event.data);
        console.log("Parsed data:", receivedData);

        const locationParts = receivedData.location.split("/");
        const resourceType = locationParts[0];
        const resourceId = locationParts[1];

        console.log("Resource type:", resourceType);
        console.log("Resource ID:", resourceId);

        if (resourceType === "Observation") {
            fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/${receivedData.location}`, {
                credentials: "omit",
                headers: {
                    Authorization: "Basic " + btoa("fhiruser:change-password"),
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Fetched observation data:", data);
                    let temp = String(data.device?.reference?.split("/")[1]);
                    console.log("Temp:", temp);
                    setParentObs((prevParentObs) => ({ ...prevParentObs, [temp]: data }));
                    console.log("Updated parentobs:", parentobs);
                });
        } else if (resourceType === "Communication") {
            fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/${receivedData.location}`, {
                credentials: "omit",
                headers: {
                    Authorization: "Basic " + btoa("fhiruser:change-password"),
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Fetched communication data:", data);
                    var temp = String(data.sender.reference.split("/")[1]);
                    console.log("Temp:", temp);
                    setParentComm((prevParentCom) => ({ ...prevParentCom, [temp]: data }));
                    console.log("Updated parentcomm:", parentcomm);
                });
        }
    };

    socket.onerror = () => {
        console.log(`Error in socket connection`);
    };
}, []);

const handleDeviceCardClick = (device : Device ) => {
    setSelectedDevice(device);
    console.log("handleDeviceclick",device);
  };
useEffect(() => {
  if (currentRoom !== "") {
      setIsLoading(true);
      fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device?location=${currentRoom}`, {
          credentials: "omit",
          headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
      })
          .then((response) => response.json())
          .then((data) => {
              console.log("API Response:", data);
              setDevices(data);
          })
          .catch((error) => {
              console.error('Error fetching device data:', error);
          })
          .finally(() => {
              setIsLoading(false); // Ensure isLoading is set to false regardless of success or error
          });

      console.log("from devicemonitor checking current room", currentRoom);
      console.log("from devicemonitor checking darkTheme", darkTheme);
  }
}, [currentRoom, darkTheme]);

   useEffect(() => {
    console.log('useEffect triggered ');
        devices.entry?.map((device) => {
        setIsLoading(true)
        // var correct = true;
        if(device.resource.patient){
        
        fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Patient/${device.resource.patient.reference.split("/")[1]}`,{
            credentials: "omit",
            headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },})
        .then((response) => response.json())
        .then((data) => {
            var temp = String(device.resource.id);
            setPatient((prevPatient) => ({...prevPatient, [temp]: data}))
            console.log("Temp 1?",temp)
        })
        fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation?patient=${device.resource.patient.reference.split("/")[1]}&_count=1&_sort=-_lastUpdated`, {
        credentials: "omit",
        headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
        })
        .then((response) => response.json())
        .then((data) => {
            if(!data.entry){console.log(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation?patient=${device.resource.patient.reference.split("/")[1]}&_count=1&_sort=-_lastUpdated`)}
            else{
            var temp = String(device.resource.id);
          
            console.log("Temp 2?",temp)
            setParentObs((prevParentobs) => ({...prevParentobs, [temp]: data.entry[0]["resource"]}))
            }})
        
        fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Communication?sender=${device.resource.id}&_count=1&_sort=-_lastUpdated`, {
        credentials: "omit",
        headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
        })
        .then((response) => response.json())
        .then((data) => {
            if(!data.entry){console.log(`${import.meta.env.VITE_FHIRAPI_URL as string}/Communication?sender=${device.resource.id}&_count=1&_sort=-_lastUpdated`)}
            else{
            var temp = String(device.resource.id);
            console.log("Temp 3?",temp)
            setParentComm((prevParentcomm) => ({...prevParentcomm, [temp]: data.entry[0]["resource"]}))
          }
        })
        }
        setIsLoading(false)
    })
    console.log( "checking the devices rendering properly?",devices);
    },[devices])
//    const warmer = devices.entry?.map((device) => {
//     if ((String(device.resource.identifier[1]?.value)=="Comprehensive Infant Care Centre" ) ){
//     var correct = false
//     // var temp = String(device.resource.id)
//     if(device.resource.patient && parentcomm[String(device.resource.id)] && parentobs[String(device.resource.id)]){
//         correct = true
//     }
//     if(correct){
//         return (
//             <CICCard
//             key={String(device.resource.id)}
//             device_id={String(device.resource.identifier[0].value)}
//             device_resource_id={String(device.resource.id)}
//             patient={patient[String(device.resource.id)]}
//             observation_resource={parentobs[String(device.resource.id)]}
//             communication_resource={parentcomm[String(device.resource.id)]}
//             darkTheme={darkTheme}
//             selectedIcon={selectedIcon}
//             onClick={() => handleDeviceCardClick(device)}
//           />
//         )
//     }
//     else{
//         return (
//         <CICCard 
//                 key={String(device.resource.id)}
//                 device_id={String(device.resource.identifier[0].value)}
//                 device_resource_id={String(device.resource.id)}
//                 patient={null}
//                 observation_resource={parentobs[String(device.resource.id)]}
//                 communication_resource={parentcomm[String(device.resource.id)]}
//                 darkTheme={darkTheme}
//                 selectedIcon={selectedIcon} 
//                 onClick={function (): void {
//                     throw new Error('Function not implemented.');
//                 } }           
           
//         />
//         )
//     }}
//     })
    const warmer = devices.entry?.map((deviceEntry) => {
        const device = deviceEntry.resource as unknown as Device;
      
        if (String(device.identifier[1]?.value) === "Comprehensive Infant Care Centre") {
          var correct = false;
          if (device.patient && parentcomm[String(device.id)] && parentobs[String(device.id)]) {
            correct = true;
          }
          if (correct) {
            return (
              <CICCard
                key={String(device.id)}
                device_id={String(device.identifier[0].value)}
                device_resource_id={String(device.id)}
                patient={patient[String(device.id)]}
                observation_resource={parentobs[String(device.id)]}
                communication_resource={parentcomm[String(device.id)]}
                darkTheme={darkTheme}
                selectedIcon={selectedIcon}
                onClick={() => handleDeviceCardClick(device)}
              />
            );
          } else {
            return (
              <CICCard
                key={String(device.id)}
                device_id={String(device.identifier[0].value)}
                device_resource_id={String(device.id)}
                patient={null}
                observation_resource={parentobs[String(device.id)]}
                communication_resource={parentcomm[String(device.id)]}
                darkTheme={darkTheme}
                selectedIcon={selectedIcon}
                onClick={() => handleDeviceCardClick(device)}
              />
            );
          }
        }
      });
      const incubator = devices.entry?.map((deviceEntry) => {
        const device = deviceEntry.resource as unknown as Device;
        if (
          String(device.identifier[1]?.value) === "Intensive Neonatal Care Center" 
      ){
        var correct = false
        // var temp = String(device.resource.id)
        if(device.patient && parentcomm[String(device.id)] && parentobs[String(device.id)]){
            correct = true
        }
            console.log("parent observation?",parentobs[String(device.id)]);
        if(correct){
            return (
            <INCCard 
                key={String(device.id)}
                device_id={String(device.identifier[0].value)}
                device_resource_id={String(device.id)}
                patient= {patient[String(device.id)]}
                observation_resource={parentobs[String(device.id)]}
                communication_resource={parentcomm[String(device.id)]}
                darkTheme={darkTheme}
                selectedIcon={selectedIcon}
                onClick={() => handleDeviceCardClick(device)}
            />
            )
        }
        else{
            return (
            <INCCard 
                key={String(device.id)}
                device_id={String(device.identifier[0].value)}
                device_resource_id={String(device.id)}
                patient={null}
                observation_resource={parentobs[String(device.id)]}
                communication_resource={parentcomm[String(device.id)]}
                darkTheme={darkTheme}
                selectedIcon={selectedIcon}
                onClick={() => handleDeviceCardClick(device)}
            />
            )
        }}
        })

        const cpap = devices.entry?.map((deviceEntry) => {
            const device = deviceEntry.resource as unknown as Device;
            console.log("SVAAS device",String(device.id))
            if((String(device.identifier[1]?.value)=="PMS-SVAAS")){
           
          var correct = false
            // var temp = String(device.resource.id)
            if(device.patient && parentcomm[String(device.id)] && parentobs[String(device.id)]){
                correct = true
            }
            
            if(correct){
                return (
                <SVAASCard 
                    key={String(device.id)}
                    device_id={String(device.identifier[0].value)}
                    device_resource_id={String(device.id)}
                    patient= {patient[String(device.id)]}//{device.resource.patient.reference.split("/")[1]}
                    observation_resource={parentobs[String(device.id)]}
                    communication_resource={parentcomm[String(device.id)]}
                    darkTheme={darkTheme}
                    selectedIcon={selectedIcon}
                    onClick={() => handleDeviceCardClick(device)}
                />
                )
            }
            else{
                return (
                <SVAASCard 
                        key={String(device.id)}
                        device_id={String(device.identifier[0].value)}
                        device_resource_id={String(device.id)}
                        patient={null}
                        observation_resource={parentobs[String(device.id)]}
                        communication_resource={parentcomm[String(device.id)]}
                        darkTheme={darkTheme}
                        selectedIcon={selectedIcon}
                        onClick={() => handleDeviceCardClick(device)}       />
                )
            }}
            })
        const brammi = devices.entry?.map(( deviceEntry) => {
            const device = deviceEntry.resource as unknown as Device;
                if(String(device.identifier[1]?.value)=="Heating Cooling Machine"){
                var correct = false
                // var temp = String(device.resource.id)
                if(device.patient && parentcomm[String(device.id)] && parentobs[String(device.id)]){
                    correct = true
                }
                    console.log(parentobs[String(device.id)]);
                if(correct){
                    return (
                    <BrammiCard
                        key={String(device.id)}
                        device_id={String(device.identifier[0].value)}
                        device_resource_id={String(device.id)}
                        patient= {patient[String(device.id)]}
                        observation_resource={parentobs[String(device.id)]}
                        communication_resource={parentcomm[String(device.id)]}
                        darkTheme={darkTheme}
                        selectedIcon={selectedIcon}
                        onClick={() => handleDeviceCardClick(device)}
                    />
                    )
                }
                else{
                    return (
                    <BrammiCard 
                        key={String(device.id)}
                        device_id={String(device.identifier[0].value)}
                        device_resource_id={String(device.id)}
                        patient={null}
                        observation_resource={parentobs[String(device.id)]}
                        communication_resource={parentcomm[String(device.id)]}
                        darkTheme={darkTheme}
                        selectedIcon={selectedIcon}
                        onClick={() => handleDeviceCardClick(device)}
                        />
                    )
                }}
                })
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
     <div style={{ display: 'flex', height: '100vh', alignItems: 'stretch',width:'98%' }}>
           <Box sx={{ display: 'flex',marginTop: '0px', paddingTop: '0px', flexWrap: 'wrap', gap: '2rem', mt: { xs: 5, sm: 6, md: 4, lg: 3 }, mb: { xs: 3, sm: 4, md: 4, lg: 3 }, justifyContent: 'left', minWidth: '40%' ,maxWidth:'40%',height: '100%',}}>
               
                  <Box sx={{width:"100%"}}>
                  <Box sx={{display: "flex", flexWrap: "wrap", gap: '0.3rem', justifyContent: "center", width: "100%", marginBottom: '2%',maxHeight: '800px', overflowY: 'auto'  }}>
                    {isLoadingWarmers ? (
                  
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px'}}/>
                  ) : ( warmer) 
                  }
                  
                {isLoadingIncubator ? (
                  
                  <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px'}}/>
                ) : ( incubator) 
                }
                {isLoadingCPAP ? (
                  
                  <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px'}}/>
                ) : ( cpap) 
                }
                {isLoadingCoolingMachine ? (
                    
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }}/>
                  ) : (brammi)
                  }
                </Box>
              </Box>
               
          </Box>
          <Box sx={{display: 'flex', marginTop: '0px', gap: '2rem', mt: { xs: 5, sm: 6, md: 4, lg: 2 }, mb: { xs: 3, sm: 4, md: 4, lg: 2 }, justifyContent: 'center', width: '60%' ,height: '100%',}}>
          { selectedDevice && (
                            <NewDeviceDetails  
                                isDialogOpened={isOpen}
                                handleCloseDialog={() => { setIsOpen(false); } }
                                darkTheme={darkTheme}
                                selectedIcon={selectedIcon}
                                device_id={String(selectedDevice.identifier[0].value)}
                                device_resource_id={String(selectedDevice.id)}
                                observation_resource={parentobs[selectedDevice.id] || []}
                                communication_resource={parentcomm[selectedDevice.id] || []}
                                patient={patient[selectedDevice.patient.reference]} 
                                newData={true}            
            
            
            />
       )}
      </Box>
          </div>
        ) : (  
            <Box sx={{display: "flex",flexWrap: "wrap",gap: '2rem',mt: {xs: 5,sm: 6,md: 7,lg: 3,},
            mb: {xs: 3,sm: 4,md: 5,lg: 2,
            },
            justifyContent: "center",
            width:'100%'
          }}
        >
         
            <Box sx={{width:"100%"}}>
            
              <Box
                  sx={{display: "flex",flexWrap: "wrap", gap: '0.3rem', justifyContent: "left", width:"100%", marginBottom:'2%' }}>
 {isLoadingWarmers ? (
            
              <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px'}}/>
            ) : ( warmer)
            }
           
           
                 {isLoadingIncubator ? (
                  
                  <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px'}}/>
                ) : ( incubator) 
                }
                {isLoadingCPAP ? (
                  
                  <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px'}}/>
                ) : ( cpap) 
                }
               {isLoadingCoolingMachine ? (
                   
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }}/>
                  ) : (brammi)
                  }
          
               </Box>
             
             
           
          </Box>
         
    </Box>
        )}
        </div>
        
      )
}