import { useState, useEffect, FC } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Box, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Snackbar, Alert, Stack,  Typography,
  useMediaQuery, useTheme, Card, CardContent, Select, MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import HotelIcon from '@mui/icons-material/Hotel';


export interface roomData {
    roomName: string;
    roomId: string;
    roomChange: Function;
    deviceChange: Function;
    deviceChangeToggle: Boolean;
    userOrganization:string;
    darkTheme:boolean;
}

interface FhirLocation {
  resource: {
    id: string;
    name: string;
    status: string;
    identifier: { value: string }[];
    physicalType?: { coding: { code: string }[] };
    partOf?: { reference: string };
  };
}

export const DeviceManagement1: FC<roomData> = (props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [deviceChanged, setDeviceChanged] = useState(false)
  const [rooms, setRooms] = useState<FhirLocation[]>([]);
  const [miniDialog, setMiniDialog] = useState(false)
  const [bedsByRoom, setBedsByRoom] = useState<Record<string, FhirLocation[]>>({});
  const [roomAddedRemoved, setRoomAddedRemoved] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(Number)
  const [deviceList, setDeviceList] = useState([{
    resource: {
        "resourceType": String,
        "id": String,
        "meta": {
            "versionId": String,
            "lastUpdated": String
        },
        "identifier": [
            {
                "system": String,
                "value": String
            },{
                "system": String,
                "value": String
            }
        ],
        "status": String,
        "manufacturer": String,
        "patient": {
            "reference": String
        },
        "owner": {
            "reference": ""
        },
        "location": {
            "reference": ""
        } 
    }
}])
const addButton = (index: any) => {
  let data = {};
  const device = deviceList[Number(index)].resource;
  const patientReference = device.patient.reference;

  const patientReferenceString = patientReference as unknown as string;
  const patientId = patientReferenceString.split("/")[1];

  fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Patient/${patientId}`, {
      credentials: "omit",
      headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
      },
  })
  .then((response) => response.json())
  .then((patientData) => {
      const existingLocationIndex = patientData.extension.findIndex(
          (ext: { url: string }) => ext.url === 'http://hl7.org/fhir/StructureDefinition/patient-location'
      );

      if (existingLocationIndex !== -1) {
          patientData.extension[existingLocationIndex].valueReference.reference = `Location/${props.roomId}`;
      } else {
          patientData.extension.push({
              url: 'http://hl7.org/fhir/StructureDefinition/patient-location',
              valueReference: { reference: `Location/${props.roomId}` }
          });
      }

      const apiUrl = `${import.meta.env.VITE_FHIRAPI_URL as string}/Patient/${patientId}`;
      const requestOptions: RequestInit = {
          credentials: "omit",
          method: "PUT",
          body: JSON.stringify(patientData),
          headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
      };

      fetch(apiUrl, requestOptions)
      .then(response => {
          if (response.status === 200) {
              let vvtemp = { "reference": `Location/${props.roomId}` };
              data = {
                  ...device,
                  location: vvtemp
              };

              return fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device/${device.id}`, {
                  credentials: "omit",
                  method: "PUT",
                  body: JSON.stringify(data),
                  headers: {
                      "Content-Type": "application/json",
                      Authorization: "Basic " + btoa("fhiruser:change-password"),
                  },
              });
          } else {
              throw new Error("Failed to update patient data");
          }
      })
      .then(deviceResponse => {
          if (deviceResponse.status === 200) {
              setSnack(true);
              setSnackSucc(true);
              setDeviceChanged(!deviceChanged);
              props.deviceChange();
              console.log("Internal add: ", device.id);

              // Send POST request to notify server of the added device
              fetch(`${import.meta.env.VITE_DEVICEDATA_URL as string}/addDevice`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ deviceId: device.id }),
              });
          } else {
              throw new Error("Failed to update device location");
          }
      })
      .catch(error => {
          console.error("Error updating locations:", error);
          setSnack(true);
          setSnackSucc(false);
      });
  })
  .catch(error => {
      console.error("Error fetching patient data:", error);
      setSnack(true);
      setSnackSucc(false);
  });
};
useEffect(() => {setDeviceChanged(!deviceChanged)},[props.deviceChangeToggle])
 
  const [snackSucc, setSnackSucc] = useState(false);
  const [snack, setSnack] = useState(false);
 
  const addToRoom = () => {
       
    return (
        <Dialog
        open={open}
        onClose={() => setOpen(false)}
        scroll='paper'
        PaperProps={{style:{borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundImage: props.darkTheme?'linear-gradient(to bottom, #111522, #111522, #111522)':'linear-gradient(to bottom,  #FFFFFF,  #FFFFFF,  #FFFFFF)', minWidth:'400px', minHeight:'200px'}}} // borderRadius:'3%', boxShadow: `0px 0px 20px 10px #7B7B7B`, border:'1px solid #7B7B7B
>
        <DialogTitle id="responsive-dialog-title" sx={{textAlign:"center", fontWeight:'bold', padding:'9%'}} color={props.darkTheme?'white':'#2F3D4A'}>
        {`Add device to ${props.roomName}`}
        
        </DialogTitle>
        <DialogContent sx={{display:'flex',flexWrap: "wrap",textAlign:"center", marginBottom:'auto', paddingBottom:'9%'}} >
            <Stack width={'100%'} display={'flex'} direction={'row'} flexWrap={'wrap'}
            >
            {deviceList.map((device, index) => {
                 if(device?.resource?.owner?.reference === `Organization/${props.userOrganization}` && device?.resource?.location?.reference.split("/")[1] != props.roomId){
                    //changed if(device?.resource?.location?.reference.split("/")[1] != props.roomId){
                        return(
                                <Button onClick={() => {setMiniDialog(true); setSelectedDevice(index)}} sx={{width:'48%', height:'60px', justifyContent:'center', textAlign:'center', color:props.darkTheme?'white':'#2F3D4A', border:'0.1px solid #282828',margin:'5px'}}>
                                    <Typography variant="subtitle2" component={"h2"}>
                                     {(device.resource.identifier[1].value).toString() + ' ' + (device.resource.identifier[0].value).toString()}
                                     {/* changed the identifier to display the device name and mac address */}
                                    </Typography>
                                </Button>
                        )
            }
                })}
    

            </Stack>
        </DialogContent>
        <Dialog
            open={miniDialog}
            onClose={() => setMiniDialog(false)}
            PaperProps={{style:{backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', height:'20%', justifyContent:'center', textAlign:'center'}}}>
            <DialogTitle id="responsive-dialog-title" sx={{textAlign:"center", fontWeight:'bold', paddingBottom:'9%'}}>
                {`Shift device `}<i>{`${deviceList[selectedDevice].resource.identifier[0].value} `}</i>{`to room `}<i>{`${props.roomName}`}?</i>
            </DialogTitle>
            <DialogActions sx={{paddingBottom:'5%'}}>
                <Stack direction={'row'} width={'100%'} justifyContent={'space-around'}>    
                <Box onClick={() => {setMiniDialog(false)}} sx={{minWidth:'90px', minHeight:'45px'}}>Cancel</Box>
                <Box onClick={() => {addButton(selectedDevice); setMiniDialog(false)}} sx={{minWidth:'90px', minHeight:'45px'}}>Confirm</Box>
                </Stack>
                
            </DialogActions>
        </Dialog>
    </Dialog>
    
    )
}
  const [selectedBed, setSelectedBed] = useState<FhirLocation | null>(null);
  useEffect(() => {
    fetch(` ${import.meta.env.VITE_FHIRAPI_URL as string}/Device?_count=40`, {
      credentials: "omit",
      headers: {
        Authorization: "Basic "+ btoa("fhiruser:change-password"),
      },
    })
    .then((response) => response.json())
    .then((data) => {if(data.entry){
      console.log(data.entry)
      setDeviceList(data.entry)
    }})
},[deviceChanged])
  useEffect(() => {
    fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Location?organization=${props.userOrganization}`, {
      credentials: 'omit',
      headers: {
        Authorization: 'Basic ' + btoa('fhiruser:change-password'),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.entry) return;

        const allLocations = data.entry as FhirLocation[];

        const roomList: FhirLocation[] = [];
        const bedMap: Record<string, FhirLocation[]> = {};

        for (const entry of allLocations) {
          const resource = entry.resource;
          const typeCode = resource.physicalType?.coding?.[0]?.code;

          if (typeCode === 'bd' && resource.partOf) {
            const parentId = resource.partOf.reference.split('/')[1];
            if (!bedMap[parentId]) bedMap[parentId] = [];
            bedMap[parentId].push(entry);
          } else if (!resource.partOf || typeCode === 'ro') {
            roomList.push(entry);
          }
        }

        setRooms(roomList);
        setBedsByRoom(bedMap);
      });
  }, [roomAddedRemoved]);

  const handleCloseSnack = (_?: any, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnack(false);
  };

  


  const renderBedDialog = () => {
    if (!selectedBed) return null;

    return (
      <Dialog open={!!selectedBed} onClose={() => setSelectedBed(null)} fullWidth>
        <DialogTitle>Manage Devices for {selectedBed.resource.identifier[0].value}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">You can add or remove devices assigned to this bed.</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => alert('Add Device clicked')}>Add Device</Button>
          <Button variant="outlined" color="error" onClick={() => alert('Remove Device clicked')}>Remove Device</Button>
          <Button onClick={() => setSelectedBed(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Rooms
      </Typography>

      {rooms.map((room) => (
        <Accordion key={room.resource.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{room.resource.identifier[0].value}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
  {bedsByRoom[room.resource.id]?.length > 0 ? (
    bedsByRoom[room.resource.id].map((bed) => (
      <Card
        key={bed.resource.id}
        elevation={4}
        sx={{
          width: 200,
          padding: 1,
          border: '1px solid gray',
          
          borderRadius: '15px',
          cursor: 'pointer',
          '&:hover': { backgroundColor: '#f5f5f5' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <HotelIcon fontSize="large" color="primary" />
        <Typography variant="subtitle1" color="primary" sx={{ marginTop: 1 }}>
          {bed.resource.identifier[0].value}
        </Typography>

        <CardContent sx={{ width: '95%' }}>
          <Stack spacing={2}>
            <Select
              fullWidth
              sx={{
                fontSize: '0.2rem',
                borderRadius: '25px',
                border: '2px solid #124D81',
              }}
            >
              {deviceList.map((device, index) => {
                if (
                  device?.resource?.owner?.reference === `Organization/${props.userOrganization}` &&
                  device?.resource?.location?.reference.split('/')[1] === props.roomId
                ) {
                  return (
                    <MenuItem key={index}>
                      {`${device.resource.identifier[1].value} ${device.resource.identifier[0].value}`}
                    </MenuItem>
                  );
                }
                return null;
              })}
            </Select>

            <Button variant="contained" sx={{ borderRadius: '25px' }} onClick={() => setOpen(true)}>
              Add/Move 
            </Button>
            <Button variant="contained" color="warning" sx={{ borderRadius: '25px' }}>
              Remove 
            </Button>
          </Stack>
        </CardContent>

        {addToRoom()}
      </Card>
    ))
  ) : (
    <Typography>No beds found</Typography>
  )}
</AccordionDetails>
        </Accordion>
      ))}

  

      {/* Snack message */}
      <Snackbar open={snack} autoHideDuration={5000} onClose={handleCloseSnack}>
        <Alert onClose={handleCloseSnack} variant="filled" severity={snackSucc ? 'success' : 'error'}>
          {snackSucc ? 'Operation Completed Successfully' : 'Operation Failed'}
        </Alert>
      </Snackbar>

     
      {renderBedDialog()}
    </Box>
  );
};
