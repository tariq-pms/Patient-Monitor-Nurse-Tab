import { useState, useEffect, FC } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert, Stack,  Typography,Card, CardContent, Select, MenuItem,Skeleton,IconButton,Menu,} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { CustomNoButton } from './CustomNoButton';
import { CustomOkButton } from './CustomOkButton';


export interface roomData {
    roomName: string;
    roomId: string;
    roomChange: Function;
    deviceChange: Function;
    deviceChangeToggle: Boolean;
    userOrganization:string;
    darkTheme:boolean;
}



export const RoomCard1: FC<roomData> = (props) => 
  {
  const [snackSucc, setSnackSucc] = useState(false);
  const [snack, setSnack] = useState(false);
  
  
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
      console.log(event)
      if (reason === 'clickaway') {
        return;
      }
  
      setSnack(false);
    }; 
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
          "serialNumber":String,
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
  
const [open, setOpen] = useState(false);
  const [deviceChanged, setDeviceChanged] = useState(false)
  useEffect(() => {setDeviceChanged(!deviceChanged)},[props.deviceChangeToggle])

  useEffect(() => {
      fetch(` ${import.meta.env.VITE_FHIRAPI_URL as string}/Device?_count=100`, {
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClose1 = () => {
      setAnchorEl(null);
  };
  const open1 = Boolean(anchorEl);
  // const handleClick1 = (event: React.MouseEvent<HTMLElement>) => {
  //     setAnchorEl(event.currentTarget);
  // };


// const addButton = (index: any) => {
//   let data = {};
//   const device = deviceList[Number(index)].resource;
//   const patientReference = device.patient.reference;

//   const patientReferenceString = patientReference as unknown as string;
//   const patientId = patientReferenceString.split("/")[1];

//   fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Patient/${patientId}`, {
//       credentials: "omit",
//       headers: {
//           Authorization: "Basic " + btoa("fhiruser:change-password"),
//       },
//   })
//   .then((response) => response.json())
//   .then((patientData) => {
//       const existingLocationIndex = patientData.extension.findIndex(
//           (ext: { url: string }) => ext.url === 'http://hl7.org/fhir/StructureDefinition/patient-location'
//       );

//       if (existingLocationIndex !== -1) {
//           patientData.extension[existingLocationIndex].valueReference.reference = `Location/${props.roomId}`;
//       } else {
//           patientData.extension.push({
//               url: 'http://hl7.org/fhir/StructureDefinition/patient-location',
//               valueReference: { reference: `Location/${props.roomId}` }
//           });
//       }

//       const apiUrl = `${import.meta.env.VITE_FHIRAPI_URL as string}/Patient/${patientId}`;
//       const requestOptions: RequestInit = {
//           credentials: "omit",
//           method: "PUT",
//           body: JSON.stringify(patientData),
//           headers: {
//               "Content-Type": "application/json",
//               Authorization: "Basic " + btoa("fhiruser:change-password"),
//           },
//       };

//       fetch(apiUrl, requestOptions)
//       .then(response => {
//           if (response.status === 200) {
//               let vvtemp = { "reference": `Location/${props.roomId}` };
//               data = {
//                   ...device,
//                   location: vvtemp
//               };

//               return fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device/${device.id}`, {
//                   credentials: "omit",
//                   method: "PUT",
//                   body: JSON.stringify(data),
//                   headers: {
//                       "Content-Type": "application/json",
//                       Authorization: "Basic " + btoa("fhiruser:change-password"),
//                   },
//               });
//           } else {
//               throw new Error("Failed to update patient data");
//           }
//       })
//       .then(deviceResponse => {
//           if (deviceResponse.status === 200) {
//               setSnack(true);
//               setSnackSucc(true);
//               setDeviceChanged(!deviceChanged);
//               props.deviceChange();
//               console.log("Internal add: ", device.id);

//               // Send POST request to notify server of the added device
//               fetch(`${import.meta.env.VITE_DEVICEDATA_URL as string}/addDevice`, {
//                   method: 'POST',
//                   headers: {
//                       'Content-Type': 'application/json',
//                   },
//                   body: JSON.stringify({ deviceId: device.id }),
//               });
//           } else {
//               throw new Error("Failed to update device location");
//           }
//       })
//       .catch(error => {
//           console.error("Error updating locations:", error);
//           setSnack(true);
//           setSnackSucc(false);
//       });
//   })
//   .catch(error => {
//       console.error("Error fetching patient data:", error);
//       setSnack(true);
//       setSnackSucc(false);
//   });
// };

const addButton = (index: number) => {
  const device = deviceList[Number(index)]?.resource;
  if (!device || !device.id) {
    console.error("Device not found or missing ID at index:", index);
    setSnack(true);
    setSnackSucc(false);
    return;
  }

  // Create updated device data with new room reference
  const updatedDevice = {
    ...device,
    location: { reference: `Location/${props.roomId}` },
  };

  // Update the Device resource in FHIR
  fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device/${device.id}`, {
    credentials: "omit",
    method: "PUT",
    body: JSON.stringify(updatedDevice),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa("fhiruser:change-password"),
    },
  })
    .then((response) => {
      if (response.status === 200) {
        setSnack(true);
        setSnackSucc(true);
        setDeviceChanged(!deviceChanged);
        props.deviceChange();
        console.log("✅ Device moved successfully:", device.id);

        // Optional: Notify backend about the added device
        fetch(`${import.meta.env.VITE_DEVICEDATA_URL as string}/addDevice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId: device.id }),
        });
      } else {
        throw new Error("Failed to update device location");
      }
    })
    .catch((error) => {
      console.error("❌ Error updating device:", error);
      setSnack(true);
      setSnackSucc(false);
    });
};


const removeButton = (index: number) => {
  const device = deviceList[Number(index)].resource;
  const { location, ...data } = device;

  const apiUrl = `${import.meta.env.VITE_FHIRAPI_URL as string}/Device/${device.id}`;
  const requestOptions: RequestInit = {
      credentials: "omit",
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
      },
  };

  fetch(apiUrl, requestOptions)
  .then((response) => {
      setSnack(true);
      if (response.status === 200) {
          setSnackSucc(true);
          setDeviceChanged(!deviceChanged);
          console.log("Internal remove: ", device.id);
          // Send POST request to notify server of the removed device
          fetch(`${import.meta.env.VITE_DEVICEDATA_URL as string}/removeDevice`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ deviceId: device.id }),
          });
      } else {
          setSnackSucc(false);
      }
  })
  .catch(error => {
      console.error("Error updating device:", error);
      setSnack(true);
      setSnackSucc(false);
  });
};


  const [deleteDevice, setDeleteDevice] = useState(false)



  const removeFromRoom = () => {
      return (
          <Dialog
          open={deleteDevice}
          onClose={() => setDeleteDevice(false)}
          aria-labelledby="responsive-dialog-title"
          PaperProps={{style:{borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)' , minWidth:'400px', minHeight:'200px'}}}
      >
          <DialogTitle sx={{textAlign:"center", fontWeight:'bold', paddingTop:'6%'}}>
          {`Remove device from ${props.roomName}`}
          </DialogTitle>
          <DialogContent sx={{display:'flex',flexWrap: "wrap",textAlign:"center", marginBottom:'auto' }}>
          <Stack width={'100%'} display={'flex'} direction={'row'} flexWrap={'wrap'}
              >
              {deviceList.map((device, index) => {
                      if(device?.resource?.location?.reference.split("/")[1] == props.roomId){
                          return(
                              <Button onClick={() => {setMiniDialog(true); setSelectedDevice(index)}} sx={{width:'48%', height:'60px', justifyContent:'center', textAlign:'center', color:'white', border:'0.1px solid #282828',margin:'5px'}}>                                   
                                  <Typography variant="subtitle1" component={"h2"} sx={{marginRight:'auto', marginTop:'auto', marginBottom:'auto'}}>
                               {(device.resource.identifier[1].value).toString() + ' ' + (device.resource.identifier[0].value).toString()}
                              </Typography>
                              </Button>
                          )
                      }
              })}
              </Stack>
          </DialogContent>
          <DialogActions>
          </DialogActions>
          <Dialog
              open={miniDialog}
              onClose={() => setMiniDialog(false)}
              PaperProps={{style:{ minWidth:'500px',
               backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', height:'20%', justifyContent:'center', textAlign:'center'}}}
          >
              <DialogTitle id="responsive-dialog-title" sx={{textAlign:"center", fontWeight:'bold', padding:'5%'}}>
              {`Remove device`}
              </DialogTitle>
              <DialogContent><i>{`${deviceList[selectedDevice].resource.identifier[0].value} `}</i>{`from room `}<i>{`${props.roomName}`}?</i></DialogContent>
              <DialogActions sx={{paddingBottom:'5%'}}>
                  <Stack direction={'row'} width={'100%'} justifyContent={'space-around'}>
                  <Box onClick={() => {setMiniDialog(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomNoButton text="Cancel"></CustomNoButton></Box>
                  <Box onClick={() => {removeButton(selectedDevice); setMiniDialog(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomOkButton text="Confirm"></CustomOkButton></Box>
                  </Stack>
              </DialogActions>
          </Dialog>
      </Dialog>
      )
  }
  const [miniDialog, setMiniDialog] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(Number)
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
                  <Box onClick={() => {setMiniDialog(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomNoButton text="Cancel"></CustomNoButton></Box>
                  <Box onClick={() => {addButton(selectedDevice); setMiniDialog(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomOkButton text="Confirm"></CustomOkButton></Box>
                  </Stack>
                  
              </DialogActions>
          </Dialog>
      </Dialog>
      
      )
}
const [loading, setLoading] = useState(true);
useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  const [controlColor, setControlColor] = useState("grey")
const [controlOpacity, setOpacity] = useState("0.8")
return (
    <Box>
      {loading ? (
        <Skeleton animation="wave" variant="rectangular" width={"350px"} height={"280px"} sx={{borderRadius:"25px"}} />
      ) : (
      
    <Card elevation={5} onMouseLeave={() => { setControlColor('grey'); setOpacity('0.8') }} onMouseEnter={() => { setControlColor('#2BA0E0'); setOpacity('1') }}style={{width: '350px',opacity: controlOpacity, backgroundColor: 'transparent', boxShadow: 'none', background: 'transparent', borderRadius: '25px', minHeight: '280px', border: `1px solid ${controlColor}` }}>
            <Stack width={'100%'} direction={'row'} justifyContent={'center'} textAlign={'center'}>
            <CardContent sx={{marginTop:'0%', width:'100%', justifyContent:'center', textAlign:'center'}}>
                    <Stack marginTop={'0%'}>
                    <IconButton sx={{width:'10%',marginLeft:'auto',marginRight:'3%',color:props.darkTheme?'white':'#124D81'}} ><SettingsIcon /></IconButton>
                    <Menu id="demo-positioned-menu" aria-labelledby="demo-positioned-button" anchorEl={anchorEl} open={open1} onClose={handleClose1} anchorOrigin={{vertical: 'top', horizontal: 'right', }}  PaperProps={{style:{backgroundImage:'linear-gradient(to bottom, #3C4661, #3C4661, #3C4661)', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', justifyContent:'center', textAlign:'center'}}} MenuListProps={{sx:{py:0}}} >
              
        </Menu>
            <Typography   style={{userSelect: 'none',color:props.darkTheme?'white': '#124D81',fontWeight: 'bold'}}>{props.roomName}</Typography>
                </Stack>
            <Stack spacing={"10%"} marginTop={'10%'} width={'70%'} marginLeft={'auto'} marginRight={'auto'}>
                <Select  sx={{fontSize:'10%', borderRadius:'25px',border:'2px solid #124D81',placeholder:'Devices in this organization'}} >
                    {deviceList.map((device) => {
                        if(device?.resource?.owner?.reference === `Organization/${props.userOrganization}` && device?.resource?.location?.reference.split("/")[1] === props.roomId){
                            return (
                              //   <MenuItem>{device.resource.identifier[0].value.toString()}</MenuItem>
              <MenuItem > {(device.resource.identifier[1].value).toString() + ' ' + (device.resource.identifier[0].value).toString()}</MenuItem>

                            )
                        }
                    })}
                </Select>
                <Button variant="contained" sx={{borderRadius:'25px'}} onClick={()=> {setOpen(true)}}>Add/Move Devices</Button>
                <Button variant="contained" sx={{borderRadius:'25px'}} color='warning' onClick={() => {setDeleteDevice(true)}}>Remove Device</Button>
            </Stack>
            </CardContent>
            {addToRoom()}
            {removeFromRoom()}
       
           
            <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
                    <Alert onClose={handleClose} variant="filled" severity={snackSucc ? 'success':'error'}>
                        {snackSucc && "Operation Completed Successfully"}
                        {!snackSucc && "Operation Failed"}
                    </Alert>
            </Snackbar>
            </Stack>
          </Card>
          )}
          </Box>
 

)
}
