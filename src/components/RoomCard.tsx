import { Alert, Button, Dialog, DialogActions,Menu, DialogContent, DialogContentText, DialogTitle, Select, Snackbar, Stack, Typography, MenuItem, Divider, TextField, Skeleton,} from '@mui/material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { FC, useEffect, useState } from 'react'
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import { CustomNoButton } from './CustomNoButton'
import { CustomOkButton } from './CustomOkButton'

export interface roomData {
    roomName: string;
    roomId: string;
    roomChange: Function;
    deviceChange: Function;
    deviceChangeToggle: Boolean;
}
export const RoomCard: FC<roomData> = (props) => {
    const [snackSucc, setSnackSucc] = useState(false);
    const [snack, setSnack] = useState(false)
   
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
            "manufacturer": String,
            "patient": {
                "reference": String
            },
            "location": {
                "reference": ""
            } 
        }
    }])
const [open, setOpen] = useState(false);
    const [deviceChanged, setDeviceChanged] = useState(false)
    useEffect(() => {setDeviceChanged(!deviceChanged)},[props.deviceChangeToggle])
    const [renameRoom, setRenameRoom] = useState(false)
    useEffect(() => {
        fetch(`http://3.110.169.17:9444/fhir-server/api/v4/Device?_count=20`, {
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
    const handleClick1 = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const renameButton = ( x: string ) => {
        let data = {
            "resourceType": "Location",
            "id": props.roomId,
            "identifier": [
                {
                    "value": x
                }
            ],
  
            "status": "suspended",
            "name": x
        }
        fetch(`http://3.110.169.17:9444/fhir-server/api/v4/Location?organization=18be1246820-bf933fa0-ba3c-4619-9591-9500e11d4a6c / ${props.roomId}`, {
            credentials: "omit", // send cookies and HTTP authentication information
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("fhiruser:change-password"), // set HTTP basic auth header
            },
        })
        .then((response) => {
            console.log(response.status)
            setSnack(true)
        
            if(response.status==200){setSnackSucc(true); props.roomChange()}
            else{setSnackSucc(false)}
        })
    }
    const [renameRoomName, setRenameRoomName] = useState("")
    const renameRoomButton = () => {
       
            return (
                <Dialog 
                open={renameRoom}
                onClose={() => setRenameRoom(false)}
                aria-labelledby="responsive-dialog-title"
                PaperProps={{style:{backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', justifyContent:'center', width:'400px',textAlign:'center', minHeight:'200px'}}}
            >
                <DialogTitle id="responsive-dialog-title">
                {`Rename ${props.roomName}?`}
                </DialogTitle>
                <DialogContent>
                <TextField id="standard-basic" label="Enter the new Room Name" variant="standard" onChange={(e) => {setRenameRoomName(e.target.value)}} />
                </DialogContent>
                <DialogActions sx={{width:'90%'}}>
                    <Stack direction={'row'} width={'100%'} justifyContent={'space-evenly'} paddingBottom={'5%'} paddingLeft={'5%'}>
                    <Box onClick={() => {setRenameRoom(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomNoButton text="Cancel"></CustomNoButton></Box>
                    <Box onClick={() => {renameButton(renameRoomName); setRenameRoom(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomOkButton text="Rename"></CustomOkButton></Box>
                    </Stack>  
                </DialogActions>
            </Dialog>
            
            )
        }
    const addButton = (index: any) => {
        let data = {}
        let vvtemp = {"reference": `Location?organization=18be1246820-bf933fa0-ba3c-4619-9591-9500e11d4a6c /${props.roomId}`}
        data = {
            ...deviceList[Number(index)].resource,
            location: vvtemp
        }
        fetch(`http://3.110.169.17:9444/fhir-server/api/v4/Device/${deviceList[Number(index)].resource.id}`, {
            credentials: "omit", // send cookies and HTTP authentication information
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("fhiruser:change-password"), // set HTTP basic auth header
            },
        })
        .then((response) => {
            setSnack(true)
            if(response.status==200){setSnackSucc(true);setDeviceChanged(!deviceChanged);props.deviceChange()}
            else{setSnackSucc(false)}
        })



    }
    const removeButton = (index: number) => {
        // Get the device object from the list
        const device = deviceList[Number(index)].resource;
      
        // Create a new object without the 'location' property
        const { location, ...data } = device;
      
        // Define the URL and request options
        const apiUrl = `http://3.110.169.17:9444/fhir-server/api/v4/Device/${device.id}`;
        const requestOptions: RequestInit = {
          credentials: "omit",
          method: "PUT",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        };
      
        // Send the PUT request
        fetch(apiUrl, requestOptions)
          .then((response) => {
            setSnack(true);
            if (response.status === 200) {
              setSnackSucc(true);
              setDeviceChanged(!deviceChanged);
            } else {
              setSnackSucc(false);
            }
          });
      };
    const [deleteDevice, setDeleteDevice] = useState(false)
    const [deleteRoom, setDeleteRoom] = useState(false)
    const removeRoomButton = () => {
        console.log("Called")
        fetch(`http://3.110.169.17:9444/fhir-server/api/v4/Location?organization=18be1246820-bf933fa0-ba3c-4619-9591-9500e11d4a6c /${props.roomId}`, {
            credentials: "omit", // send cookies and HTTP authentication information
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("fhiruser:change-password"), // set HTTP basic auth header
            },
        })
        .then((response) => {
            console.log(response.status)
            setSnack(true)
            if(response.status==200){setSnackSucc(true);props.roomChange()}
            else{setSnackSucc(false)}
        })
        .then((data) => {console.log(data)})
    }
    const removeRoom = () => {
        return (
            <Dialog
            open={deleteRoom}
            onClose={() => setDeleteDevice(false)}
            aria-labelledby="responsive-dialog-title"
            PaperProps={{style:{backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', justifyContent:'center', width:'400px',textAlign:'center', minHeight:'200px'}}}

        >
            <DialogTitle id="responsive-dialog-title">
            {`Remove ${props.roomName}?`}
            
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                Are you sure you want to remove {props.roomName}?
            </DialogContentText>
            
            </DialogContent>
            <DialogActions sx={{width:'90%'}}>
                    <Stack direction={'row'} width={'100%'} justifyContent={'space-evenly'} paddingBottom={'5%'} paddingLeft={'5%'}>
                    <Box onClick={() => {setDeleteRoom(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomNoButton text="Cancel"></CustomNoButton></Box>
                    <Box onClick={() => {removeRoomButton(); setDeleteRoom(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomOkButton text="Delete"></CustomOkButton></Box>
                    </Stack>  
                </DialogActions>
        </Dialog>
        
        )
    }
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
                                <Button onClick={() => {setMiniDialog(true); setSelectedDevice(index)}} sx={{width:'48%', height:'60px', justifyContent:'center', textAlign:'center', color:'white', border:'0.1px solid #282828'}}>                                   
                                    <Typography variant="subtitle1" component={"h2"} sx={{marginRight:'auto', marginTop:'auto', marginBottom:'auto'}}>
                                    {(device.resource.identifier[0].value).toString()}
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
                PaperProps={{style:{ minWidth:'500px', backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', height:'20%', justifyContent:'center', textAlign:'center'}}}
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
            PaperProps={{style:{borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth:'400px', minHeight:'200px'}}} // borderRadius:'3%', boxShadow: `0px 0px 20px 10px #7B7B7B`, border:'1px solid #7B7B7B
 >
            <DialogTitle id="responsive-dialog-title" sx={{textAlign:"center", fontWeight:'bold', padding:'9%'}}>
            {`Add device to ${props.roomName}`}
            
            </DialogTitle>
            <DialogContent sx={{display:'flex',flexWrap: "wrap",textAlign:"center", marginBottom:'auto', paddingBottom:'9%'}} >
                <Stack width={'100%'} display={'flex'} direction={'row'} flexWrap={'wrap'}
                >
                {deviceList.map((device, index) => {
                        if(device?.resource?.location?.reference.split("/")[1] != props.roomId){
                            return(
                                    <Button onClick={() => {setMiniDialog(true); setSelectedDevice(index)}} sx={{width:'48%', height:'60px', justifyContent:'center', textAlign:'center', color:'white', border:'0.1px solid #282828'}}>
                                        <Typography variant="subtitle1" component={"h2"}>
                                        {(device.resource.identifier[0].value).toString()}
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
                      <IconButton sx={{width:'10%',marginLeft:'auto',marginRight:'3%'}} onClick={handleClick1}><SettingsIcon /></IconButton>
                      <Menu id="demo-positioned-menu" aria-labelledby="demo-positioned-button" anchorEl={anchorEl} open={open1} onClose={handleClose1} anchorOrigin={{vertical: 'top', horizontal: 'right', }}  PaperProps={{style:{backgroundImage:'linear-gradient(to bottom, #3C4661, #3C4661, #3C4661)', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', justifyContent:'center', textAlign:'center'}}} MenuListProps={{sx:{py:0}}} >
          <Stack divider={<Divider sx={{backgroundColor:'white'}} flexItem />}>
          <Button onClick={() => {setRenameRoom(true)}}  sx={{color:'white', padding:'5%'}}><Typography variant='caption' textTransform={'capitalize'}>Rename</Typography></Button>
          <Button onClick={() => {setDeleteRoom(true)}} sx={{backgroundColor:'#E48227',color:'white', paddingTop:'5%', paddingBottom:'5%'}}><Typography variant='caption' textTransform={'capitalize'}>Delete Room</Typography></Button>
          </Stack>
          
          </Menu>
              <Typography sx={{userSelect:"none" ,marginTop:'5%'}}>{props.roomName}</Typography>
                  </Stack>
              <Stack spacing={"10%"} marginTop={'10%'} width={'70%'} marginLeft={'auto'} marginRight={'auto'}>
                  <Select sx={{fontSize:'10%', borderRadius:'25px'}} >
                      {deviceList.map((device) => {
                          if(device?.resource?.location?.reference.split("/")[1] == props.roomId){
                              return (
                                  <MenuItem>{device.resource.identifier[0].value.toString()}</MenuItem>
                              )
                          }
                      })}
                  </Select>
                  <Button variant="outlined" sx={{borderRadius:'25px'}} onClick={()=> {setOpen(true)}}>Add/Move Devices</Button>
                  <Button variant="outlined" sx={{borderRadius:'25px'}} color='warning' onClick={() => {setDeleteDevice(true)}}>Remove Device</Button>
              </Stack>
              </CardContent>
              {addToRoom()}
              {removeFromRoom()}
              {removeRoom()}
              {renameRoomButton()}
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
   
  //     <Card elevation={5} onMouseLeave={() => { setControlColor('grey'); setOpacity('0.8') }} onMouseEnter={() => { setControlColor('#2BA0E0'); setOpacity('1') }}style={{width: '350px',opacity: controlOpacity, backgroundColor: 'transparent', boxShadow: 'none', background: 'transparent', borderRadius: '25px', minHeight: '280px', border: `1px solid ${controlColor}` }}>
  //       <Stack width="100%" direction="row" justifyContent="center" textAlign="center">
  //         <CardContent sx={{ marginTop: '0%', width: '100%', justifyContent: 'center', textAlign: 'center' }}>
  //           {loading ? (
  //             <Skeleton variant="rounded" width={350} height={250} />
  //           ) : (
  //             <><Stack marginTop="0%">
  //                 <IconButton sx={{ width: '10%', marginLeft: 'auto', marginRight: '3%' }} onClick={handleClick1}>
  //                   <SettingsIcon />
  //                 </IconButton>
  //                 <Menu
  //                   id="demo-positioned-menu"
  //                   anchorEl={anchorEl}
  //                   open={open1}
  //                   onClose={handleClose1}
  //                   anchorOrigin={{
  //                     vertical: 'top',
  //                     horizontal: 'right',
  //                   }}
  //                   PaperProps={{ style: { backgroundImage: 'linear-gradient(to bottom, #3C4661, #3C4661, #3C4661)', boxShadow: `0px 0px 40px 1px #404040`, border: '0.4px solid #505050', justifyContent: 'center', textAlign: 'center' } }} MenuListProps={{ sx: { py: 0 } }}>
  //                   <Stack divider={<Divider sx={{ backgroundColor: 'white' }} flexItem />}>
  //                     <Button onClick={() => { setRenameRoom(true) } } sx={{ color: 'white', padding: '5%' }}>
  //                       <Typography variant="caption" textTransform="capitalize">Rename</Typography>
  //                     </Button>
  //                     <Button onClick={() => { setDeleteRoom(true) } } sx={{ backgroundColor: '#E48227', color: 'white', paddingTop: '5%', paddingBottom: '5%' }}>
  //                       <Typography variant="caption" textTransform="capitalize">Delete Room</Typography>
  //                     </Button>
  //                   </Stack>
  //                 </Menu>
  //                 <Typography sx={{ userSelect: 'none', marginTop: '5%' }}>{props.roomName}</Typography>
  //               </Stack><Stack spacing="10%" marginTop="10%" width="70%" marginLeft="auto" marginRight="auto">
  //                   <Select sx={{ fontSize: '10%', borderRadius: '25px' }}>
  //                     {deviceList.map((device) => {
  //                       if (device?.resource?.location?.reference.split('/')[1] == props.roomId) {
  //                         return (
  //                           <MenuItem>{device.resource.identifier[0].value.toString()}</MenuItem>
  //                         )
  //                       }
  //                     })}
  //                   </Select>
  //                   <Button variant="outlined" sx={{ borderRadius: '25px' }} onClick={() => { setOpen(true) } }>Add/Move Devices</Button>
  //                   <Button variant="outlined" sx={{ borderRadius: '25px' }} color="warning" onClick={() => { setDeleteDevice(true) } }>Remove Device</Button>
  //                 </Stack></>
  //           )}
  //         </CardContent>
  //  {addToRoom()}
  //         {removeFromRoom()}
  //         {removeRoom()}
  //         {renameRoomButton()}
  //         <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
  //           <Alert onClose={handleClose} variant="filled" severity={snackSucc ? 'success' : 'error'}>
  //             {snackSucc && 'Operation Completed Successfully'}
  //             {!snackSucc && 'Operation Failed'}
  //           </Alert>
  //         </Snackbar>
  //       </Stack>
  //     </Card>


  )
}

