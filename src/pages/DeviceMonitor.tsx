import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import pmsLogo from "../assets/phx_logo.png";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAuth0 } from '@auth0/auth0-react';
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


interface DeviceMonitorProps{
  currentRoom: any;
  darkTheme: boolean;
  
}

export const DeviceMonitor: React.FC<DeviceMonitorProps> = ({ currentRoom, darkTheme }) => {
//export const DeviceMonitor =  ( currentRoom: any, darkTheme: boolean ) => {
  
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
        const socket = new WebSocket("wss://pmsind.co.in:5000/notification");
        socket.onopen = () => {
            console.log("Socket open successful 1st use effect");
        };
        socket.onmessage = (data) => {
            var recieved_data = JSON.parse(data.data)
            console.log("entering 1st use effect",recieved_data)
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

                console.log( "checking data?",data) 
                setParentObs((prevparentobs) => ({...prevparentobs,[temp]: data}))
                console.log("parentobs 1 else",parentobs)
                })
            
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
                console.log( "checking data?",data) 
                setParentComm((prevparentcom) => ({...prevparentcom,[temp]: data}))
                console.log("parentobs 1 else",parentobs)

                })
            
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
    setIsLoading(true);
    const socket = new WebSocket("wss://pmsind.co.in:5000/notification");

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
            fetch(`https://pmsind.co.in:5000/${receivedData.location}`, {
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
            fetch(`https://pmsind.co.in:5000/${receivedData.location}`, {
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

        // Add more conditions as needed for other resource types

        // console.log(event.data);
    };

    socket.onerror = () => {
        console.log(`Error in socket connection`);
    };
}, []);

useEffect(() => {
  if (currentRoom !== "") {
      setIsLoading(true);
      fetch(`https://pmsind.co.in:5000/Device?location=${currentRoom}`, {
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
        
        fetch(` https://pmsind.co.in:5000/Patient/${device.resource.patient.reference.split("/")[1]}`,{
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
          
            console.log("Temp 2?",temp)
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
            console.log("Temp 3?",temp)
            setParentComm((prevParentcomm) => ({...prevParentcomm, [temp]: data.entry[0]["resource"]}))
          }
        })
        }
        setIsLoading(false)
    })
    console.log( "checking the devices rendering properly?",devices);
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
            darkTheme={darkTheme}
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
            darkTheme={darkTheme}
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
          console.log("parent observation?",parentobs[String(device.resource.id)]);
      if(correct){
          return (
          <INCCard 
              key={String(device.resource.id)}
              device_id={String(device.resource.identifier[0].value)}
              device_resource_id={String(device.resource.id)}
              patient= {patient[String(device.resource.id)]}
              observation_resource={parentobs[String(device.resource.id)]}
              communication_resource={parentcomm[String(device.resource.id)]}
              darkTheme={darkTheme}
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
              darkTheme={darkTheme}
          />
          )
      }}
      })
    const cpap = devices.entry?.map((device) => {
    console.log("device",String(device.resource.id))
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
            darkTheme={darkTheme}
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
            darkTheme={darkTheme}
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
            darkTheme={darkTheme}
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
            darkTheme={darkTheme}
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
              darkTheme={darkTheme}
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
              darkTheme={darkTheme}
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
                sx={{display: "flex",flexWrap: "wrap",gap: '2rem',mt: {xs: 5,sm: 6,md: 7,lg: 8,},
                  mb: {xs: 3,sm: 4,md: 5,lg: 6,
                  },
                  justifyContent: "center",
                  width:"95%",
                }}
              >
                {isAuthenticated && (
                  <Box sx={{width:"100%"}}>
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' , marginBottom:"10px", borderBottom:darkTheme?'2px solid white':'2px solid #124D81',borderTop: 'none','&:before': {opacity: 0,}}}>
                    
                    <AccordionSummary expandIcon={<ExpandMoreRounded sx={{color:darkTheme?'#FFFFFF':"#124D81", fontSize:'300%'}}/>}aria-controls="panel1a-content"id="panel1a-header">
                      <Typography variant='h5' component={"h2"} sx={{color:darkTheme?'#FFFFFF':darkTheme?'#FFFFFF':"#124D81"}}>Warmers</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box
                        sx={{
                          // backgroundColor:'red',
                          display: "flex",flexWrap: "wrap", gap: '2rem', justifyContent: "left", width:"100%", marginBottom:'2%' }}>
                    <DummyCard  darkTheme={darkTheme}/>
                    <DummyCard  darkTheme={darkTheme}/>
                    <DummyCard  darkTheme={darkTheme}/>
 
                         {isLoadingWarmers ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px'}}/>
                  ) : ( warmer)
                  }
                     </Box>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent" , backgroundImage:'none' , marginBottom:"10px", borderBottom:darkTheme?'2px solid white':'2px solid #124D81',borderTop: 'none','&:before': {opacity: 0,}}}>
                    <AccordionSummary expandIcon={<ExpandMoreRounded sx={{color:darkTheme?'#FFFFFF':"#124D81", fontSize:'300%'}}/>} aria-controls="panel2a-content"id="panel2a-header">
                      <Typography variant='h5' component={"h2"} sx={{color:darkTheme?'#FFFFFF':"#124D81"}}>Incubators</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box
                        sx={{ 
                          display: "flex", flexWrap: "wrap",gap: '2rem',justifyContent: "left", width:"100%",marginBottom:'2%'}}>
                         {isLoadingIncubators ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }} />
                  ) : (incubator)
                  }
                      </Box>
                    </AccordionDetails>
                  </Accordion >
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' ,marginBottom:"10px", borderBottom:darkTheme?'2px solid white':'2px solid #124D81',borderTop: 'none','&:before': {opacity: 0,}}}>
                    <AccordionSummary expandIcon={<ExpandMoreRounded sx={{color:darkTheme?'#FFFFFF':"#124D81", fontSize:'300%'}}/>}aria-controls="panel3a-content"id="panel3a-header">
                      <Typography variant='h5' component={"h2"} sx={{color:darkTheme?'#FFFFFF':"#124D81"}}>CPAP</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box
                        sx={{
                          // backgroundColor:'red',
                          display: "flex",flexWrap: "wrap",gap: '2rem',justifyContent: "left",width:"100%",marginBottom:'2%' }} >
                         {isLoadingCPAP ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }}/>
                  ) : (cpap)
                  }
                      </Box>
                   </AccordionDetails>
                  </Accordion>
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' ,marginBottom:"10px", borderBottom:darkTheme?'2px solid white':'2px solid #124D81',borderTop: 'none','&:before': {opacity: 0,}}}>
                    <AccordionSummary expandIcon={<ExpandMoreRounded sx={{color:darkTheme?'#FFFFFF':"#124D81", fontSize:'300%'}}/>}aria-controls="panel3a-content"id="panel3a-header" >
                      <Typography variant='h5' component={"h2"} sx={{color:darkTheme?'#FFFFFF':"#124D81"}}>Cooling Machine</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box
                        sx={{
                          // backgroundColor:'red',
                          display: "flex",flexWrap: "wrap",gap: '2rem',justifyContent: "left",width:"100%",marginBottom:'2%'}}>
                         {isLoadingCoolingMachine ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }}/>
                  ) : (brammi)
                  }
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' ,marginBottom:"10px", borderBottom:darkTheme?'2px solid white':'2px solid #124D81',borderTop: 'none','&:before': {opacity: 0,}}}>
                    <AccordionSummary expandIcon={<ExpandMoreRounded sx={{color:darkTheme?'#FFFFFF':"#124D81", fontSize:'300%'}}/>}aria-controls="panel3a-content" id="panel3a-header">
                      <Typography variant='h5' component={"h2"} sx={{color:darkTheme?'#FFFFFF':"#124D81"}}>Syringe Pump</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box
                        sx={{
                          // backgroundColor:'red',
                          display: "flex",flexWrap: "wrap",gap: '2rem',justifyContent: "left",width:"100%",marginBottom:'2%'}}>
                         {isLoadingSyringe ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }}/>
                  ) : (syringe)
                  }</Box>
                   </AccordionDetails>
                  </Accordion>
                  <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' ,marginBottom:"10px", borderBottom:darkTheme?'2px solid white':'2px solid #124D81',borderTop: 'none','&:before': {opacity: 0,}}}>
                    <AccordionSummary expandIcon={<ExpandMoreRounded sx={{color:darkTheme?'#FFFFFF':"#124D81", fontSize:'300%'}}/>} aria-controls="panel3a-content" id="panel3a-header">
                      <Typography variant='h5' component={"h2"} sx={{color:darkTheme?'#FFFFFF':"#124D81"}}>Other Devices</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box
                        sx={{
                          // backgroundColor:'red',
                          display: "flex",flexWrap: "wrap",gap: '2rem',justifyContent: "left",width:"100%",marginBottom:'2%'
                        }}
                      >
                         {isLoadingOtherDevices ? (
                    // Display loading skeleton while loading
                    <Skeleton  variant="rounded" width={500} height={300} animation="wave"  sx={{ borderRadius: '25px' }}/>
                  ) : (otherdevices)
                  }
                      </Box>
                   </AccordionDetails>
                  </Accordion>
                </Box>
                )}
                {!isAuthenticated && !isLoading && (
                  <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'} width={'70%'}>
                    <img src={pmsLogo} alt="Phoenix" style={{maxWidth: '50%',height: 'auto', 
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