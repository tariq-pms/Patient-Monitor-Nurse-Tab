import { useAuth0 } from '@auth0/auth0-react';
import { AccountCircle, ExpandLess, ExpandMore, StarBorder } from '@mui/icons-material'
import { Alert, Box, Button, Collapse, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Snackbar, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { Link } from "react-router-dom";
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';

type Anchor = 'right';
export const SettingsMenu = () => {
    const [state, setState] = useState(false)
    
    const [temproom, settemproom] = useState([{
        "resource": {
            "name": String,
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
            "status": String,
            
        }
    }])
    const { user, logout} = useAuth0();
    const [open, setOpen] = React.useState(false);
    const [snackSucc, setSnackSucc] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [roomId, setRoomId] = useState("");
    const theme = useTheme();
    const [snack, setSnack] = useState(false)
    const [newRoomName, setNewRoomName] = useState("")
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const toggleDrawer = (anchor: Anchor, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
        return;
        }

        setState(true);
    };
    const [drop, setDrop] = useState(false)
  
    const [addnewbutton, setaddnewbutton] = useState(false);
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
                }
            ],
            "status": String,
            "manufacturer": String,
            "patient": {
                "reference": String
            },
            "location": {
                "reference": String
            }
        }
    }])
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        // console.log(event)
        if (reason === 'clickaway') {
          return;
        }
    
        setSnack(false);
      };
    useEffect(() => {
        fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Location`, {
          credentials: "omit",
          headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
          },
        })
        .then((response) => response.json())
        .then((data) => {if(data.entry){
          settemproom(data.entry)
        }})
      },[])
      // useEffect(() => {console.log(roomName)},[roomName])
    const addButton = (index: any) => {
        let data = {}
        let vvtemp = {"reference": `Location/${roomId}`}
        data = {
            ...deviceList[Number(index)].resource,
            location: vvtemp
        }
        //console.log(`http://13.126.5.10:9444/fhir-server/api/v4/Device/${deviceList[Number(index)].resource.id}`)

        fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Device/${deviceList[Number(index)].resource.id}`, {
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
            if(response.status==200){setSnackSucc(true)}
            else{setSnackSucc(false)}
        })
    }
    const addToRoom = () => {
        
        // let deviceList: any[] = []
        useEffect(() =>{
            fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Device`, {
          credentials: "omit",
          headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
          },
        })
        .then((response) => response.json())
        .then((data) => {if(data.entry){
          setDeviceList(data.entry)
        //   console.log(deviceList[0].resource.identifier[0].value)
        }})
        }, [])
        
        return (
            <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">
            {`${roomName}`}
            </DialogTitle>
            <DialogContent>
            <List>
                {deviceList.map((device, index) => {
                    // console.log(device.resource.identifier[0].value)
                    return(
                        <ListItem>
                            <ListItemButton onClick={() => addButton((index))}>
                            <Typography variant="subtitle1" component={"h2"} sx={{marginRight:'auto', marginTop:'auto', marginBottom:'auto'}}>
                            { device.resource.identifier[0].value}
                            </Typography>
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
            </DialogContent>
            <DialogActions>
            <Button autoFocus onClick={() => setOpen(false)}>
                Close
            </Button>
            </DialogActions>
        </Dialog>
        
        )
  }
    const addNewRoom = () => {
        const data = {
            "resourceType": "Location",
            "id": "1891b72f248-2c6e5dce-4dcf-421b-82cc-d701f6513872",
            "identifier": [
                {
                    "value": newRoomName
                }
            ],
            "status": "suspended",
            "name": newRoomName
        }
        // console.log
        fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Location`, {
            credentials: "omit", // send cookies and HTTP authentication information
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("fhiruser:change-password"), // set HTTP basic auth header
            },
        })
        .then((response) => {
            // console.log(response)
            setSnack(true)
            if(response.status==201){setSnackSucc(true)}
            else{setSnackSucc(false)}
        })
    }
    const addNewRoomButton = () => {
        return (
            <Dialog
            fullScreen={fullScreen}
            open={addnewbutton}
            onClose={() => setaddnewbutton(false)}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">
            {"Add New Room"}
            </DialogTitle>
            <DialogContent>
                <TextField id="standard-basic" label="Room Name" variant="standard" onChange={(e) => {setNewRoomName(e.target.value)}} />
            </DialogContent>
            <DialogActions>
            <Button onClick={() => setaddnewbutton(false)}>
                Close
            </Button>
            <Button onClick={() => {addNewRoom();setaddnewbutton(false)}} autoFocus>
                Add
            </Button>
            </DialogActions>
        </Dialog>

        )
    }
  return (
    <Box
        style={{ background: '#1E253C'}}
        sx={{ width: {
          xs : 350,
          sm : 350,
          md : 350,
          lg : 400
        } }}
        height={"100%"}
        role="presentation"
        onClick={toggleDrawer('right', false)}
        onKeyDown={toggleDrawer('right', false)}
      >
        <List>
          <ListItem>
            <ListItemButton>
              
                {/* <Typography variant="subtitle1" component={"h2"} sx={{marginRight:'auto', marginTop:'auto', marginBottom:'auto'}}> */}
                <ListItemText>
                  {user?.email}
                </ListItemText>
                <ListItemIcon>
                <AccountCircle sx={{ fontSize: {
                  xs : 35,
                  sm : 35,
                  md : 75,
                  lg : 75
                } }}/>
                </ListItemIcon>
                {/* </Typography> */}
              
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem>
            {/* <Stack width={"100%"} sx={{paddingTop:'10px' ,paddingBottom:'10px'}}> */}
              {/* <Typography variant="subtitle1" component={"h2"} sx={{marginRight:'auto', marginTop:'auto', marginBottom:'auto'}}>
                Placeholder for Hospital Name
              </Typography> */}
              {/* <Divider /> */}
              <Stack width={"100%"} sx={{paddingTop:'10px' ,paddingBottom:'10px'}}>
              <Link to="rooms" style={{textDecoration: 'none', textDecorationColor: 'none', color:'white'}}>
              {/* <ListItemButton onClick={() => {setDrop(!drop)}}> */}
              <ListItemButton>
                {/* <Stack direction={'row'} width={"100%"} justifyContent='end'> */}
                {/* <Typography variant="subtitle1" component={"h2"} sx={{marginRight:'auto', marginTop:'auto', marginBottom:'auto'}}>
                  Devices and Rooms
                </Typography> */}
                <ListItemText primary="Devices and Rooms"></ListItemText>
                {/* <SettingsIcon /> */}
                {/* </Stack>  */}
              </ListItemButton>  
              </Link>   
              </Stack>
              {/* {
                temproom.map((room) => {
                  return (
                    <Stack width={'100%'} direction={'row'}>
                    <ListItemButton onClick={() => {setOpen(true);setRoomName(`${room.resource.name}`);setRoomId(`${room.resource.id}`)}}>
                    <Typography variant='subtitle1' component={"h2"} sx={{marginRight:'auto', marginTop:'auto', marginBottom:'auto', paddingTop:'20px', paddingBottom:'15px'}} >
                      { room.resource.name}
                    </Typography>
                    <AddIcon />
                    </ListItemButton>
                    </Stack>
                  )
                })
              }
              <Stack width={'100%'} direction={'row'}>
                <ListItemButton onClick={() => {setaddnewbutton(true)}}>
                  <Typography variant='subtitle1' component={"h2"} sx={{marginRight:'auto', marginTop:'auto', marginBottom:'auto', paddingTop:'20px', paddingBottom:'15px'}} >
                    Add new room
                  </Typography>
                  <AddIcon sx={{fontSize:'40px'}}/>
                </ListItemButton>
              </Stack> */}
            {/* </Stack> */}
              
  
          </ListItem>
          <Collapse in={drop} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                {
                temproom.map((room) => {
                  return (
                    
                    <ListItemButton onClick={() => {setOpen(true);setRoomId(room.resource.id)}}>
                    <ListItemText primary={room.resource.name}>
                      
                    </ListItemText>
                    <ListItemIcon>
                      <AddIcon />
                    </ListItemIcon>
                    </ListItemButton>
                    
                  )
                })
              }
              <ListItemButton onClick={() => setaddnewbutton(true)}>
                <ListItemText primary="Add New Room" />
                <ListItemIcon><AddIcon /></ListItemIcon>
              </ListItemButton>
                </List>
              </Collapse>      
          <ListItem>
          <Button onClick={() => logout()} variant="contained" sx={{backgroundColor:'red', margin:'auto', color:'white'}}>
            <Typography variant="subtitle1" component={"h2"} sx={{marginRight:'auto'}}>
                Logout
            </Typography>
            </Button>
          </ListItem>
        </List>

        {addNewRoomButton()}
        <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={snackSucc ? 'success':'error'}>
                {snackSucc && "Operation Completed Successfully"}
                {!snackSucc && "Operation Failed"}
            </Alert>
        </Snackbar>
      </Box>
  )
}
