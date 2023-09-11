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

import { useTheme } from "@material-ui/core/styles";
import { ExpandMoreRounded } from '@mui/icons-material';
import Accordion from '@mui/material/Accordion/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CICCard } from '../components/CICCard';
import { INCCard } from '../components/INCCard';
import { SVAASCard } from '../components/SVAASCard';
import { Stack } from '@mui/material';
export const Home = (currentRoom: any) => {
  // useEffect(() => {console.log(currentRoom.currentRoom)},[currentRoom])
  const [loading, setLoading] = useState(false)
  const [parentobs, setParentObs] = useState<Record<string, any>>({});
  const [parentcomm, setParentComm] = useState<Record<string, any>>({});
  const [patient, setPatient] = useState<Record<string, any>>({})
//   const [obsResource, setObsResource] = useState({
//     "resourceType": "",
//     "id": "",
//     "meta": {
//         "versionId": "",
//         "lastUpdated": ""
//     },
//     "identifier": [
//         {
//             "value": ""
//         },
//     ],
//     "status": "",
//     "category": [
//         {
//             "coding": [
//                 {
//                     "system": "",
//                     "code": "",
//                     "display": ""
//                 }
//             ]
//         }
//     ],
//     "code": {
//         "coding": [
//             {
//                 "system": "",
//                 "code": "",
//                 "display": ""
//             }
//         ],
//         "text": ""
//     },
//     "subject": {
//         "reference": ""
//     },
//     "device": {
//         "reference": ""
//     },
//     "component": [
//         {
//             "code": {
//                 "coding": [
//                     {
//                         "system": "",
//                         "code": "",
//                         "display": "",
//                     }
//                 ],
//                 "text": "",
//             },
//             "valueQuantity": {
//                 "value": 0,
//                 "unit": "",
//                 "system": "",
//                 "code": "",
//             }
//         },
//     ]
// })
  const theme = useTheme();
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
  console.log(loading)  

  
  useEffect(() => {
    setLoading(true)
    const socket = new WebSocket("ws://13.126.5.10:9444/fhir-server/api/v4/notification");
    socket.onopen = () => {
      console.log("Socket open successful");
    };
    socket.onmessage = (data) => {
      var recieved_data = JSON.parse(data.data)
      if (recieved_data.location.split("/")[0] == "Observation"){

          fetch(`http://13.126.5.10:9444/fhir-server/api/v4/${recieved_data.location}`, {
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
          fetch(`http://13.126.5.10:9444/fhir-server/api/v4/${JSON.parse(data.data).location}`, {
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
      else if (recieved_data.location.split("/")[0] == "Device"){
        // if (devArray.includes(recieved_data.resourceId)){
          fetch(`http://13.126.5.10:9444/fhir-server/api/v4/${JSON.parse(data.data).location}`, {
          credentials: "omit",
          headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
          })
          .then((response) => response.json())
          .then((data) => {

          })
        // }
      }
      
      // console.log(data.data);
    };
    socket.onerror = () => {console.log(`Error in socket connection`)}
  }, [])
  useEffect(() => {
    if(currentRoom!=""){
      setLoading(true)
      
      // console.log(url)
      fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Device?location=${currentRoom.currentRoom}`, {
        credentials: "omit",
        headers: {
          Authorization: "Basic "+ btoa("fhiruser:change-password"),
        },
      })
      .then((response) => response.json())
      .then((data) => {setDevices(data)})
      // console.log(currentRoom)
      setLoading(false)
    }
  }, [currentRoom])

  useEffect(() => {
    
    devices.entry?.map((device) => {
      setLoading(true)
      // var correct = true;
      if(device.resource.patient){
        
        fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Patient/${device.resource.patient.reference.split("/")[1]}`,{
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
        fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Observation?patient=${device.resource.patient.reference.split("/")[1]}&_count=1&_sort=-_lastUpdated`, {
        credentials: "omit",
        headers: {
          Authorization: "Basic "+ btoa("fhiruser:change-password"),
          },
        })
        .then((response) => response.json())
        .then((data) => {
          if(!data.entry){console.log(`http://13.126.5.10:9444/fhir-server/api/v4/Observation?patient=${device.resource.patient.reference.split("/")[1]}&_count=1&_sort=-_lastUpdated`)}
          else{
            var temp = String(device.resource.id);
            console.log("FUCK YOU MOTHERFUCKER!!!!!!!")
            console.log(temp)
            setParentObs((prevParentobs) => ({...prevParentobs, [temp]: data.entry[0]["resource"]}))
          }})
      
        fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Communication?sender=${device.resource.id}&_count=1&_sort=-_lastUpdated`, {
        credentials: "omit",
        headers: {
          Authorization: "Basic "+ btoa("fhiruser:change-password"),
          },
        })
        .then((response) => response.json())
        .then((data) => {
          if(!data.entry){console.log(`http://13.126.5.10:9444/fhir-server/api/v4/Communication?sender=${device.resource.id}&_count=1&_sort=-_lastUpdated`)}
          else{
            var temp = String(device.resource.id);
            

            setParentComm((prevParentcomm) => ({...prevParentcomm, [temp]: data.entry[0]["resource"]}))
            // setParentComm({...parentcomm,temp:data.entry[0]})
          }
        })
      
      }
      setLoading(false)
    })
  },[devices])

 
  const warmer = devices.entry?.map((device) => {
    if(String(device.resource.identifier[1]?.value)=="Comprehensive Infant Care Centre"){
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



  return (
    <div>
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
              <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' , marginBottom:"10px", borderBottom:'2px solid #00B1FD'}}>
                
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
                    }}
                  >{warmer}</Box>
                </AccordionDetails>
              </Accordion>
              <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent" , backgroundImage:'none' , marginBottom:"10px", borderBottom:'2px solid #00B1FD'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreRounded sx={{color:"#00B1FD", fontSize:'300%'}}/>}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <Typography variant='h5' component={"h2"} sx={{color:"#00B1FD"}}>Incubators</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
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
                    {incubator}
                  </Box>
                  
                    
                  </Typography>
                </AccordionDetails>
              </Accordion >
              <Accordion elevation={0} defaultExpanded={true} sx={{backgroundColor:"transparent", backgroundImage:'none' ,marginBottom:"10px", borderBottom:'2px solid #00B1FD', borderTop:'none'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreRounded sx={{color:"#00B1FD", fontSize:'300%'}}/>}
                  aria-controls="panel3a-content"
                  id="panel3a-header"
                
                >
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
                      
                    }}
                  >
                    {cpap}
                  </Box>
                  
                    
                </AccordionDetails>
              </Accordion>
            </Box>
            )}
            {!isAuthenticated && !isLoading && (
              <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'3%'} width={'70%'}>
                <img src={pmsLogo} alt="Phoenix" style={{
                  maxWidth: '50%', // Set the maximum width to 100%
                  height: 'auto', // Maintain the aspect ratio
                  marginLeft:'auto',
                  marginRight:'auto'
                }}/>
                <Typography variant='h3' color={'white'} fontWeight={'50'}>NeoLife Sentinel</Typography> {/*PhoenixCare Sentinel*/ }
                <Typography variant='h6'>Placeholder for some subtitles ig</Typography>
                <Stack direction={'row'} spacing={'5%'} justifyContent={'space-evenly'}>
                <Button variant='outlined'sx={{width:'30%', height:'140%'}} endIcon={<OpenInNewIcon />} target='_blank' href='https://www.phoenixmedicalsystems.com/'>Check out our product page</Button>
                <Button variant='contained' sx={{width:'30%', height:'140%'}} onClick={() => loginWithRedirect()}>Sign In</Button>
                
                </Stack>
              </Stack>
            )}
        </Box>
            </div>
    </div>
  )
}
	