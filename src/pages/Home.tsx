import { useEffect, useState } from 'react'
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Box } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { DeviceCard } from '../components/DeviceCard';


export const Home = () => {
  const [obsResource, setObsResource] = useState({
    "resourceType": "",
    "id": "",
    "meta": {
        "versionId": "",
        "lastUpdated": ""
    },
    "identifier": [
        {
            "value": ""
        },
    ],
    "status": "",
    "category": [
        {
            "coding": [
                {
                    "system": "",
                    "code": "",
                    "display": ""
                }
            ]
        }
    ],
    "code": {
        "coding": [
            {
                "system": "",
                "code": "",
                "display": ""
            }
        ],
        "text": ""
    },
    "subject": {
        "reference": ""
    },
    "device": {
        "reference": ""
    },
    "component": [
        {
            "code": {
                "coding": [
                    {
                        "system": "",
                        "code": "",
                        "display": "",
                    }
                ],
                "text": "",
            },
            "valueQuantity": {
                "value": 0,
                "unit": "",
                "system": "",
                "code": "",
            }
        },
    ]
})
  const [commResource, setCommResource] = useState( {
    "id" : "",
    "status" : "",
    "resourceType": "",
    "sent": "", 
    "category" : [{
    "coding" : [{
        "system" : "",
        "code" : ""
        }],
        "text" : ""
    }],
    "subject": {
        "reference": ""
    },
    "sender": {
        "reference": ""},
    "payload":[{
        "contentReference":{
            "display": ""
        }}
    ],
    "extension": [
        {
            "url": "",
            "valueCodeableConcept": {
                "coding": []
            }
        }
    ]
})
  const [obsArray, setObsArray] = useState([])
  const [comArray, setComArray] = useState([])
  const [devArray, setDevArray] = useState<string[]>([])
  const { isAuthenticated, isLoading } = useAuth0();
  const [rooms, setRooms] = useState(
    {
      "resourceType": String,
      "id": String,
      "type": String,
      "total": Number,
      "link": [
          {
              "relation": String,
              "url": String
          }
      ],
      "entry": [
          {
              "fullUrl": String,
              "resource": {
                  "resourceType": String,
                  "id": String,
                  "meta": {
                      "versionId": String,
                      "lastUpdated": String
                  },
                  "identifier": [
                      {
                          "value": String
                      }
                  ],
                  "name": String,
                  "status": String
              },
              "search": {
                  "mode": String,
                  "score": Number
              }
          }
      ]
  })
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
  const [value, setValue] = useState(rooms.entry[0]?.resource.id || "");
  const tabs = rooms.entry.map((room) => {
    return (
      <Tab value={room.resource.id} label={String(room.resource.name)}/>
    )
  })
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  useEffect(() => {
    fetch(`https://localhost:9443/fhir-server/api/v4/Location`, {
      credentials: "omit",
      headers: {
        Authorization: "Basic "+ btoa("fhiruser:change-password"),
      },
    })
    .then((response) => response.json())
    .then((data) => {setRooms(data)})


    const socket = new WebSocket("wss://localhost:9443/fhir-server/api/v4/notification");
    socket.onopen = () => {
      console.log("Socket open successful");
    };
    socket.onmessage = (data) => {}
    //   var recieved_data = JSON.parse(data.data)
    //   if (recieved_data.location.split("/")[0] == "Observation"){
    //     if (obsArray.includes(recieved_data.resourceId)){
    //       fetch(`https://localhost:9443/fhir-server/api/v4/${JSON.parse(data.data).location}`, {
    //       credentials: "omit",
    //       headers: {
    //         Authorization: "Basic "+ btoa("fhiruser:change-password"),
    //         },
    //       })
    //       .then((response) => response.json())
    //       .then((data) => {
    //         setObsResource(data)
    //       })
    //     }
    //   }
    //   else if (recieved_data.location.split("/")[0] == "Communication"){
    //     if (comArray.includes(recieved_data.resourceId)){
    //       fetch(`https://localhost:9443/fhir-server/api/v4/${JSON.parse(data.data).location}`, {
    //       credentials: "omit",
    //       headers: {
    //         Authorization: "Basic "+ btoa("fhiruser:change-password"),
    //         },
    //       })
    //       .then((response) => response.json())
    //       .then((data) => {
    //         setCommResource(data)
    //       })
    //     }
    //   }
    //   else if (recieved_data.location.split("/")[0] == "Device"){
    //     if (devArray.includes(recieved_data.resourceId)){
    //       fetch(`https://localhost:9443/fhir-server/api/v4/${JSON.parse(data.data).location}`, {
    //       credentials: "omit",
    //       headers: {
    //         Authorization: "Basic "+ btoa("fhiruser:change-password"),
    //         },
    //       })
    //       .then((response) => response.json())
    //       .then((data) => {
    //         console.log("New device updated. Please refresh.")
    //       })
    //     }
    //   }
      
    //   console.log(data.data);
    // };
    socket.onerror = () => {console.log(`Error in socket connection`)}
  }, [])
  useEffect(() => {
    if(value!="0"){
      fetch(`https://localhost:9443/fhir-server/api/v4/Device?location=${value}`, {
        credentials: "omit",
        headers: {
          Authorization: "Basic "+ btoa("fhiruser:change-password"),
        },
      })
      .then((response) => response.json())
      .then((data) => {setDevices(data)})
    }
  }, [value])
  useEffect(() => {
    console.log(devices)
  }, [value])

  const devicelist = devices.entry?.map((device) => {
    if(device.resource.patient){
      return (
        <DeviceCard
          device_id={String(device.resource.identifier[0].value)}
          patient_id={device.resource.patient.reference.split("/")[1]}
          device_resource_id={String(device.resource.id)}
        ></DeviceCard>
      )
    }
    return (
      <DeviceCard
        device_id={String(device.resource.identifier[0].value)}
        patient_id={""}
        device_resource_id={String(device.resource.id)}
      ></DeviceCard>
    )
  })
  
  return (
    <div>
      {/* <Selector onTabChange={handleTabChange} /> */}
      <Box sx={{ width: '100%', marginTop:'10px' }}>
        <Tabs value={value}
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="secondary tabs example"
          variant="fullWidth"
        >
          {tabs}
        </Tabs>
      </Box>
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
              maxWidth:"95%",
            }}
          >
            {devicelist}
        </Box>
            </div>
    </div>
  )
}
	