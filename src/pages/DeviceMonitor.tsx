import { useEffect, useState } from 'react';
// import AppBar from '@mui/material/AppBar';
// import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
// import IconButton from '@mui/material/IconButton';
import pmsLogo from "../assets/phx_logo.png";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAuth0 } from '@auth0/auth0-react';
// import AccountCircle from '@mui/icons-material/AccountCircle';
// import MenuItem from '@mui/material/MenuItem';
// import Menu from '@mui/material/Menu';

import { ExpandMoreRounded } from '@mui/icons-material';
import Accordion from '@mui/material/Accordion/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CICCard } from '../components/CICCard';
import { INCCard } from '../components/INCCard';
import { SVAASCard } from '../components/SVAASCard';
import { Skeleton, Stack } from '@mui/material';
import { BrammiCard } from '../components/BrammiCard';
import { DeviceCard } from '../components/DeviceCard';
import { SyringeCard } from '../components/SyringeCard';
import { DummyCard } from '../components/DummyCard';




export const DeviceMonitor = (currentRoom: any) => {
  const [, setIsLoading] = useState(true);
  // Define separate loading states for each accordion
  const [isLoadingWarmers, setIsLoadingWarmers] = useState(true);
  const [isLoadingIncubators, setIsLoadingIncubators] = useState(true);
  const [isLoadingCPAP, setIsLoadingCPAP] = useState(true);
  const [isLoadingCoolingMachine, setIsLoadingCoolingMachine] = useState(true);
  const [isLoadingSyringe, setIsLoadingSyringe] = useState(true);
  const [isLoadingOtherDevices, setIsLoadingOtherDevices] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      // Set individual loading states to false once their data is loaded
      setIsLoadingWarmers(false);
      setIsLoadingIncubators(false);
      setIsLoadingCPAP(false);
      setIsLoadingCoolingMachine(false);
      setIsLoadingSyringe(false);
      setIsLoadingOtherDevices(false);
    }, 2000); // Adjust the duration as needed
},[]);
    const [parentobs, setParentObs] = useState<Record<string, any>>({});
    const [parentcomm, setParentComm] = useState<Record<string, any>>({});
    const [patient, setPatient] = useState<Record<string, any>>({})
    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
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
        const socket = new WebSocket("wss://pmsind.co.in/notification");
        socket.onopen = () => {
            console.log("Socket open successful");
        };
        socket.onmessage = (data) => {
            var recieved_data = JSON.parse(data.data)
            if (recieved_data.location.split("/")[0] == "Observation"){

                fetch(` https://pmsind.co.in:5000/${recieved_data.location}`, {
                credentials: "omit",
                headers: {
                Authorization: "Basic "+ btoa("fhiruser:change-password"),
                },
                })
                .then((response) => response.json())
                .then((data) => {
                let temp = String(data.device?.reference?.split("/")[1])

                console.log(data) 
                setParentObs((prevparentobs) => ({...prevparentobs,[temp]: data}))
                console.log(parentobs)
                })
            // }
            }
            else if (recieved_data.location.split("/")[0] == "Communication"){
                fetch(` https://pmsind.co.in:5000/${JSON.parse(data.data).location}`, {
                credentials: "omit",
                headers: {
                Authorization: "Basic "+ btoa("fhiruser:change-password"),
                },
                })
                .then((response) => response.json())
                .then((data) => {
                var temp = String(data.sender.reference.split("/")[1])
                setParentComm((prevparentcom) => ({...prevparentcom,[temp]: data}))
                

                })
            // }
            }
            // else if (recieved_data.location.split("/")[0] == "Device"){
            //   // if (devArray.includes(recieved_data.resourceId)){
            //     fetch(` https://pmsind.co.in:5000/${JSON.parse(data.data).location}`, {
            //     credentials: "omit",
            //     headers: {
            //       Authorization: "Basic "+ btoa("fhiruser:change-password"),
            //       },
            //     })
            //     .then((response) => response.json())
            //   // }
            // }
            
            // console.log(data.data);
        };
        socket.onerror = () => {console.log(`Error in socket connection`)}
    }, [])
    useEffect(() => {
    if(currentRoom!=""){
        setIsLoading(true)
        
        // console.log(url)
        fetch(` https://pmsind.co.in:5000/Device?location=${currentRoom.currentRoom}`, {
        credentials: "omit",
        headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
        },
        })
        .then((response) => response.json())
        .then((data) => {setDevices(data)})
        // console.log(currentRoom)
        setIsLoading(false)
    }
    }, [currentRoom])

    useEffect(() => {
    
    devices.entry?.map((device) => {
        setIsLoading(true)
        // var correct = true;
        if(device.resource.patient){
        
        fetch(` https://pmsind.co.in:5000/Patient/${device.resource.patient.reference.split("/")[1]}`,{
            credentials: "omit",
            headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
        })
        .then((response) => response.json())
        .then((data) => {
            var temp = String(device.resource.id);
            setPatient((prevPatient) => ({...prevPatient, [temp]: data}))
        })
        fetch(` https://pmsind.co.in:5000/Observation?patient=${device.resource.patient.reference.split("/")[1]}&_count=1&_sort=-_lastUpdated`, {
        credentials: "omit",
        headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
        })
        .then((response) => response.json())
        .then((data) => {
            if(!data.entry){console.log(` https://pmsind.co.in:5000/Observation?patient=${device.resource.patient.reference.split("/")[1]}&_count=1&_sort=-_lastUpdated`)}
            else{
            var temp = String(device.resource.id);
          
            console.log(temp)
            setParentObs((prevParentobs) => ({...prevParentobs, [temp]: data.entry[0]["resource"]}))
            }})
        
        fetch(` https://pmsind.co.in:5000/Communication?sender=${device.resource.id}&_count=1&_sort=-_lastUpdated`, {
        credentials: "omit",
        headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
        })
        .then((response) => response.json())
        .then((data) => {
            if(!data.entry){console.log(` https://pmsind.co.in:5000/Communication?sender=${device.resource.id}&_count=1&_sort=-_lastUpdated`)}
            else{
            var temp = String(device.resource.id);
            

            setParentComm((prevParentcomm) => ({...prevParentcomm, [temp]: data.entry[0]["resource"]}))
            // setParentComm({...parentcomm,temp:data.entry[0]})
            }
        })
        
        }
        setIsLoading(false)
    })
    console.log(devices);
    },[devices])
    const warmer = devices.entry?.map((device) => {
    if ((String(device.resource.identifier[1]?.value)=="Comprehensive Infant Care Centre" ) ){
    var correct = false
    // var temp = String(device.resource.id)
    if(device.resource.patient && parentcomm[String(device.resource.id)] && parentobs[String(device.resource.id)]){
        correct = true
    }
    
    if(correct){
        return (
        <CICCard 
            key={String(device.resource.id)}
            device_id={String(device.resource.identifier[0].value)}
            device_resource_id={String(device.resource.id)}
            patient= {patient[String(device.resource.id)]}//{device.resource.patient.reference.split("/")[1]}
            observation_resource={parentobs[String(device.resource.id)]}
            communication_resource={parentcomm[String(device.resource.id)]}
        />
        )
    }
    else{
        return (
        <CICCard 
            key={String(device.resource.id)}
            device_id={String(device.resource.identifier[0].value)}
            device_resource_id={String(device.resource.id)}
            patient={null}
            observation_resource={parentobs[String(device.resource.id)]}
            communication_resource={parentcomm[String(device.resource.id)]}
        />
        )
    }}
    })
    const incubator = devices.entry?.map((device) => {
    if(String(device.resource.identifier[1]?.value)=="Intensive Neonatal Care Center"){
        
    var correct = false
    // var temp = String(device.resource.id)
    if(device.resource.patient && parentcomm[String(device.resource.id)] && parentobs[String(device.resource.id)]){
        correct = true
    }
        console.log(parentobs[String(device.resource.id)]);
    if(correct){
        return (
        <INCCard 
            key={String(device.resource.id)}
            device_id={String(device.resource.identifier[0].value)}
            device_resource_id={String(device.resource.id)}
            patient= {patient[String(device.resource.id)]}
            observation_resource={parentobs[String(device.resource.id)]}
            communication_resource={parentcomm[String(device.resource.id)]}
        />
        )
    }
    else{
        return (
        <INCCard 
            key={String(device.resource.id)}
            device_id={String(device.resource.identifier[0].value)}
            device_resource_id={String(device.resource.id)}
            patient={null}
            observation_resource={parentobs[String(device.resource.id)]}
            communication_resource={parentcomm[String(device.resource.id)]}
        />
        )
    }}
    })
    const cpap = devices.entry?.map((device) => {
    console.log(String(device.resource.id))
    if(String(device.resource.identifier[1]?.value)=="SVAAS"){
        
    var correct = false
    // var temp = String(device.resource.id)
    if(device.resource.patient && parentcomm[String(device.resource.id)] && parentobs[String(device.resource.id)]){
        correct = true
    }
    
    if(correct){
        return (
        <SVAASCard 
            key={String(device.resource.id)}
            device_id={String(device.resource.identifier[0].value)}
            device_resource_id={String(device.resource.id)}
            patient= {patient[String(device.resource.id)]}//{device.resource.patient.reference.split("/")[1]}
            observation_resource={parentobs[String(device.resource.id)]}
            communication_resource={parentcomm[String(device.resource.id)]}
        />
        )
    }
    else{
        return (
        <SVAASCard 
            key={String(device.resource.id)}
            device_id={String(device.resource.identifier[0].value)}
            device_resource_id={String(device.resource.id)}
            patient={null}
            observation_resource={parentobs[String(device.resource.id)]}
            communication_resource={parentcomm[String(device.resource.id)]}
        />
        )
    }}
    })
    const brammi = devices.entry?.map((device) => {
    if(String(device.resource.identifier[1]?.value)=="Heating Cooling Machine"){
    var correct = false
    // var temp = String(device.resource.id)
    if(device.resource.patient && parentcomm[String(device.resource.id)] && parentobs[String(device.resource.id)]){
        correct = true
    }
        console.log(parentobs[String(device.resource.id)]);
    if(correct){
        return (
        <BrammiCard
            key={String(device.resource.id)}
            device_id={String(device.resource.identifier[0].value)}
            device_resource_id={String(device.resource.id)}
            patient= {patient[String(device.resource.id)]}
            observation_resource={parentobs[String(device.resource.id)]}
            communication_resource={parentcomm[String(device.resource.id)]}
        />
        )
    }
    else{
        return (
        <BrammiCard 
            key={String(device.resource.id)}
            device_id={String(device.resource.identifier[0].value)}
            device_resource_id={String(device.resource.id)}
            patient={null}
            observation_resource={parentobs[String(device.resource.id)]}
            communication_resource={parentcomm[String(device.resource.id)]}
        />
        )
    }}
    })
    const syringe = devices.entry?.map((device) => {
      if 
        (String(device.resource.identifier[1]?.value) === "PMS-SYRINGE" )
         
      {
        var correct = false;
        // var temp = String(device.resource.id)
        if (
          device.resource.patient &&
          parentcomm[String(device.resource.id)] &&
          parentobs[String(device.resource.id)]
        ) {
          correct = true;
        }
        console.log(parentobs[String(device.resource.id)]);
        if (correct) {
          return (
            <SyringeCard
              key={String(device.resource.id)}
              device_id={String(device.resource.identifier[0].value)}
              device_resource_id={String(device.resource.id)}
              patient={patient[String(device.resource.id)]}
              observation_resource={parentobs[String(device.resource.id)]}
              communication_resource={parentcomm[String(device.resource.id)]}
            />
          )
        } else {
          return (
            <SyringeCard
              key={String(device.resource.id)}
              device_id={String(device.resource.identifier[0].value)}
              device_resource_id={String(device.resource.id)}
              patient={null}
              observation_resource={parentobs[String(device.resource.id)]}
              communication_resource={parentcomm[String(device.resource.id)]}
            />
          )
        }
      }
    });
    

    const otherdevices = devices.entry?.map((device) => {
    if(String(device.resource.identifier[1]?.value)!="Intensive Neonatal Care Center" &&
        String(device.resource.identifier[1]?.value)!="Comprehensive Infant Care Centre" &&
        String(device.resource.identifier[1]?.value)!="SVAAS" && 
        String(device.resource.identifier[1]?.value)!="Heating Cooling Machine" &&
        String(device.resource.identifier[1]?.value)!="PMS-SYRINGE"){

    var correct = false
    // var temp = String(device.resource.id)
    if(device.resource.patient && parentcomm[String(device.resource.id)] && parentobs[String(device.resource.id)]){
        correct = true
    }
        console.log(parentobs[String(device.resource.id)]);
    if(correct){
        return (
        <DeviceCard
            key={String(device.resource.id)}
            device_id={String(device.resource.identifier[0].value)}
            device_resource_id={String(device.resource.id)}
            patient= {patient[String(device.resource.id)]}
            observation_resource={parentobs[String(device.resource.id)]}
            communication_resource={parentcomm[String(device.resource.id)]}
        />
        )
    }
    else{
        return (
        <DeviceCard 
            key={String(device.resource.id)}
            device_id={String(device.resource.identifier[0].value)}
            device_resource_id={String(device.resource.id)}
            patient={null}
            observation_resource={parentobs[String(device.resource.id)]}
            communication_resource={parentcomm[String(device.resource.id)]}
        />
        )
    }}
    })
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
                  width:"95%",
                }}
              >
                {isAuthenticated && (
                  <Box sx={{width:"100%"}}>
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' , marginBottom:"10px", borderBottom:'2px solid #00B1FD',borderTop: 'none','&:before': {opacity: 0,}}}>
                    
                    <AccordionSummary
                      expandIcon={<ExpandMoreRounded sx={{color:"#00B1FD", fontSize:'300%'}}/>}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography variant='h5' component={"h2"} sx={{color:"#00B1FD"}}>Warmers</Typography>
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
 <DummyCard/>
                         {isLoadingWarmers ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }}/>
                  ) : (
                    
                    warmer
                  )}
                     </Box>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent" , backgroundImage:'none' , marginBottom:"10px", borderBottom:'2px solid #00B1FD',borderTop: 'none','&:before': {opacity: 0,}}}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreRounded sx={{color:"#00B1FD", fontSize:'300%'}}/>}
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                    >
                      <Typography variant='h5' component={"h2"} sx={{color:"#00B1FD"}}>Incubators</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box
                        sx={{ 
                          display: "flex",
                          flexWrap: "wrap",
                          gap: '2rem',
                          justifyContent: "left",
                          width:"100%",
                          marginBottom:'2%'
                        }}
                      >
                         {isLoadingIncubators ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }} />
                  ) : (
                    incubator
                  )}
                      </Box>
                    </AccordionDetails>
                  </Accordion >
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' ,marginBottom:"10px", borderBottom:'2px solid #00B1FD',borderTop: 'none','&:before': {opacity: 0,}}}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreRounded sx={{color:"#00B1FD", fontSize:'300%'}}/>}
                      aria-controls="panel3a-content"
                      id="panel3a-header">
                      <Typography variant='h5' component={"h2"} sx={{color:"#00B1FD"}}>CPAP</Typography>
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
                         {isLoadingCPAP ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }}/>
                  ) : (
                    cpap
                  )}
                      </Box>
                   </AccordionDetails>
                  </Accordion>
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' ,marginBottom:"10px", borderBottom:'2px solid #00B1FD',borderTop: 'none','&:before': {opacity: 0,}}}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreRounded sx={{color:"#00B1FD", fontSize:'300%'}}/>}
                      aria-controls="panel3a-content"
                      id="panel3a-header"
                    
                    >
                      <Typography variant='h5' component={"h2"} sx={{color:"#00B1FD"}}>Cooling Machine</Typography>
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
                         {isLoadingCoolingMachine ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }}/>
                  ) : (
                    brammi
                  )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' ,marginBottom:"10px", borderBottom:'2px solid #00B1FD',borderTop: 'none','&:before': {opacity: 0,}}}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreRounded sx={{color:"#00B1FD", fontSize:'300%'}}/>}
                      aria-controls="panel3a-content"
                      id="panel3a-header"
                    >
                      <Typography variant='h5' component={"h2"} sx={{color:"#00B1FD"}}>Syringe Pump</Typography>
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
                         {isLoadingSyringe ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }}/>
                  ) : (
                    syringe
                  )}
                      </Box>
                      
                        
                    </AccordionDetails>
                  </Accordion>
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' ,marginBottom:"10px", borderBottom:'2px solid #00B1FD',borderTop: 'none','&:before': {opacity: 0,}}}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreRounded sx={{color:"#00B1FD", fontSize:'300%'}}/>}
                      aria-controls="panel3a-content"
                      id="panel3a-header"
                    
                    >
                      <Typography variant='h5' component={"h2"} sx={{color:"#00B1FD"}}>Other Devices</Typography>
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
                         {isLoadingOtherDevices ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }}/>
                  ) : (
                    otherdevices
                  )}
                      </Box>
                      
                        
                    </AccordionDetails>
                  </Accordion>
                </Box>
                )}
                {!isAuthenticated && !isLoading && (
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
          
        </div>
        
      )
}
