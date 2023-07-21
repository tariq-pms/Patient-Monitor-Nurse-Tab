import { useEffect, useState } from 'react'
// import AppBar from '@mui/material/AppBar';
// import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
// import IconButton from '@mui/material/IconButton';

import { useAuth0 } from '@auth0/auth0-react';
// import AccountCircle from '@mui/icons-material/AccountCircle';
// import MenuItem from '@mui/material/MenuItem';
// import Menu from '@mui/material/Menu';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { DeviceCard } from '../components/DeviceCard';
import { useMediaQuery } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { ExpandMoreRounded } from '@mui/icons-material';
import Accordion from '@mui/material/Accordion/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
export const Home = (currentRoom: any) => {
  // useEffect(() => {console.log(currentRoom.currentRoom)},[currentRoom])
  const [loading, setLoading] = useState(false)
  const [parentobs, setParentObs] = useState<Record<string, any>>({});
  const [parentcomm, setParentComm] = useState<Record<string, any>>({});
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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));
//   const [commResource, setCommResource] = useState( {
//     "id" : "",
//     "status" : "",
//     "resourceType": "",
//     "sent": "", 
//     "category" : [{
//     "coding" : [{
//         "system" : "",
//         "code" : ""
//         }],
//         "text" : ""
//     }],
//     "subject": {
//         "reference": ""
//     },
//     "sender": {
//         "reference": ""},
//     "payload":[{
//         "contentReference":{
//             "display": ""
//         }}
//     ],
//     "extension": [
//         {
//             "url": "",
//             "valueCodeableConcept": {
//                 "coding": []
//             }
//         }
//     ]
// })
  //console.log(loading)
  const { isAuthenticated, isLoading } = useAuth0();
  //console.log(isLoading)
  // const [rooms, setRooms] = useState(
  //   {
  //     "resourceType": String,
  //     "id": String,
  //     "type": String,
  //     "total": Number,
  //     "link": [
  //         {
  //             "relation": String,
  //             "url": String
  //         }
  //     ],
  //     "entry": [
  //         {
  //             "fullUrl": String,
  //             "resource": {
  //                 "resourceType": String,
  //                 "id": String,
  //                 "meta": {
  //                     "versionId": String,
  //                     "lastUpdated": String
  //                 },
  //                 "identifier": [
  //                     {
  //                         "value": String
  //                     }
  //                 ],
  //                 "name": String,
  //                 "status": String
  //             },
  //             "search": {
  //                 "mode": String,
  //                 "score": Number
  //             }
  //         }
  //     ]
  // })
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
  const [value, setValue] = useState("");
  // useEffect(() => {
  //   console.log(rooms)
  // },[rooms])
  // const tabs = rooms.entry 
  // ? rooms.entry.map((room) => {
  //   return (
  //     <Tab sx={{fontSize:{
  //               xs: 19,
  //               sm: 19,
  //               md: 19,
  //               lg: 19,
  //     }}} value={room.resource.id} label={String(room.resource.name)}/>
  //   )
  // }) : null
  // const handleChange = (event: React.SyntheticEvent, newValue: string) => {
  //   //console.log(event)
  //   setValue(newValue);
  // };
  
  useEffect(() => {
    setLoading(true)
    // fetch(`http://3.110.197.165:9444/fhir-server/api/v4/Location`, {
    //   credentials: "omit",
    //   headers: {
    //     Authorization: "Basic "+ btoa("fhiruser:change-password"),
    //   },
    // })
    // .then((response) => response.json())
    // .then((data) => {setRooms(data)})
    // setLoading(true)
    
    const socket = new WebSocket("ws://3.110.197.165:9444/fhir-server/api/v4/notification");
    socket.onopen = () => {
      console.log("Socket open successful");
    };
    socket.onmessage = (data) => {
      var recieved_data = JSON.parse(data.data)
      // console.log(data)
      if (recieved_data.location.split("/")[0] == "Observation"){
          // console.log(data)
        // if (obsArray.includes(recieved_data.resourceId)){
          fetch(`http://3.110.197.165:9444/fhir-server/api/v4/${recieved_data.location}`, {
          credentials: "omit",
          headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
          })
          .then((response) => response.json())
          .then((data) => {
            
            let temp = String(data.device.reference.split("/")[1])
            console.log(temp)
            // console.log(temp)
            setParentObs((prevparentobs) => ({...prevparentobs,[temp]: data}))
          })
        // }
      }
      else if (recieved_data.location.split("/")[0] == "Communication"){
        // if (comArray.includes(recieved_data.resourceId)){
          fetch(`http://3.110.197.165:9444/fhir-server/api/v4/${JSON.parse(data.data).location}`, {
          credentials: "omit",
          headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
          })
          .then((response) => response.json())
          .then((data) => {
            var temp = String(data.sender.reference.split("/")[1])
            setParentComm((prevparentcom) => ({...prevparentcom,[temp]: data}))
            // setCommResource(data)
          })
        // }
      }
      else if (recieved_data.location.split("/")[0] == "Device"){
        // if (devArray.includes(recieved_data.resourceId)){
          fetch(`http://3.110.197.165:9444/fhir-server/api/v4/${JSON.parse(data.data).location}`, {
          credentials: "omit",
          headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
            },
          })
          .then((response) => response.json())
          .then((data) => {
            // console.log(data)
            // console.log("New device updated. Please refresh.")
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
      let url = `http://3.110.197.165:9444/fhir-server/api/v4/Device?location=${currentRoom.currentRoom}`
      // console.log(url)
      fetch(`http://3.110.197.165:9444/fhir-server/api/v4/Device?location=${currentRoom.currentRoom}`, {
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
  // useEffect(() => {console.log(devices)},[devices])
  // const getdevlist = () => {
  //   const [obsArray, setObsArray] = useState<string[]>([])
  //   const [comArray, setComArray] = useState<string[]>([])
  //   const [devArray, setDevArray] = useState<string[]>([])
  // }


  
  //useEffect(() => {console.log(parentcomm);console.log(parentobs)},[parentcomm])
  useEffect(() => {
    devices.entry?.map((device) => {

      // var correct = true;
      if(device.resource.patient){
        fetch(`http://3.110.197.165:9444/fhir-server/api/v4/Observation?patient=${device.resource.patient.reference.split("/")[1]}&_sort=-date&_count=1`, {
        credentials: "omit",
        headers: {
          Authorization: "Basic "+ btoa("fhiruser:change-password"),
          },
        })
        .then((response) => response.json())
        .then((data) => {
          if(!data.entry){console.log("")}
          else{
            var temp = String(device.resource.id);
            setParentObs((prevParentobs) => ({...prevParentobs, [temp]: data.entry[0]["resource"]}))
          }})
      
        fetch(`http://3.110.197.165:9444/fhir-server/api/v4/Communication?sender=${device.resource.id}&_count=1`, {
        credentials: "omit",
        headers: {
          Authorization: "Basic "+ btoa("fhiruser:change-password"),
          },
        })
        .then((response) => response.json())
        .then((data) => {
          if(!data.entry){console.log("")}
          else{
            var temp = String(device.resource.id);
            setParentComm((prevParentcomm) => ({...prevParentcomm, [temp]: data.entry[0]["resource"]}))
            // setParentComm({...parentcomm,temp:data.entry[0]})
          }
        })
      
      }
      
    })
  },[])
  const warmer = devices.entry?.map((device) => {
    
    if(String(device.resource.identifier[1]?.value)=="Comprehensive Infant Care Centre"){
    var correct = false
    // var temp = String(device.resource.id)
    if(device.resource.patient && parentcomm[String(device.resource.id)] && parentobs[String(device.resource.id)]){
      correct = true
      
    }
    
    if(correct){
      return (
        <DeviceCard 
          key={String(device.resource.id)}
          device_id={String(device.resource.identifier[0].value)}
          device_resource_id={String(device.resource.id)}
          patient_id={device.resource.patient.reference.split("/")[1]}
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
          patient_id={""}
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
    
    if(correct){
      return (
        <DeviceCard 
          key={String(device.resource.id)}
          device_id={String(device.resource.identifier[0].value)}
          device_resource_id={String(device.resource.id)}
          patient_id={device.resource.patient.reference.split("/")[1]}
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
          patient_id={""}
          observation_resource={parentobs[String(device.resource.id)]}
          communication_resource={parentcomm[String(device.resource.id)]}
        />
      )
    }}
  })
  // const devicelist = devices.entry?.map((device) => {
  //   var correct = false
  //   // var temp = String(device.resource.id)
  //   if(device.resource.patient && parentcomm[String(device.resource.id)] && parentobs[String(device.resource.id)]){
  //     correct = true
  //   }
    
  //   if(correct){
  //     return (
  //       <DeviceCard 
  //         key={String(device.resource.id)}
  //         device_id={String(device.resource.identifier[0].value)}
  //         device_resource_id={String(device.resource.id)}
  //         patient_id={device.resource.patient.reference.split("/")[1]}
  //         observation_resource={parentobs[String(device.resource.id)]}
  //         communication_resource={parentcomm[String(device.resource.id)]}
  //       />
  //     )
  //   }
  //   else{
  //     return (
  //       <DeviceCard 
  //         key={String(device.resource.id)}
  //         device_id={String(device.resource.identifier[0].value)}
  //         device_resource_id={String(device.resource.id)}
  //         patient_id={""}
  //         observation_resource={parentobs[String(device.resource.id)]}
  //         communication_resource={parentcomm[String(device.resource.id)]}
  //       />
  //     )
  //   }
    
  // })

  return (
    <div>
      {/* <Selector onTabChange={handleTabChange} /> */}
      {/* <Box sx={{ width: '95%', margin:'0 auto', marginTop:'10px'  }}>
        <Tabs value={value}
          centered
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="secondary tabs example"
          variant={isSmallScreen ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          
        >
          {isAuthenticated && tabs}
        </Tabs>
      </Box> */}
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
              <Accordion sx={{backgroundColor:"transparent" , marginBottom:"10px"}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreRounded sx={{color:"#00B1FD"}}/>}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography variant='h5' component={"h2"} sx={{color:"#00B1FD"}}>Warmers</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {warmer}
                </AccordionDetails>
              </Accordion>
              <Accordion sx={{backgroundColor:"transparent" , marginBottom:"10px"}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreRounded sx={{color:"#00B1FD"}}/>}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <Typography variant='h5' component={"h2"} sx={{color:"#00B1FD"}}>Incubators</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    {incubator}
                  </Typography>
                </AccordionDetails>
              </Accordion >
              <Accordion sx={{backgroundColor:"transparent" , marginBottom:"10px"}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreRounded sx={{color:"#00B1FD"}}/>}
                  aria-controls="panel3a-content"
                  id="panel3a-header"
                >
                  <Typography variant='h5' component={"h2"} sx={{color:"#00B1FD"}}>CPAP</Typography>
                </AccordionSummary>
              </Accordion>
            </Box>
            )}
            {/* {isAuthenticated && devicelist} */}
        </Box>
            </div>
    </div>
  )
}
	