import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, List, ListItem, ListItemButton, ListItemText, MenuItem, Select, Snackbar, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Paper from '@mui/material/Paper'
import { FC, useEffect, useState } from 'react'
export interface roomData {
    roomName: string;
    roomId: string;
}
export const RoomCard: FC<roomData> = (props): JSX.Element => {
    const [snackSucc, setSnackSucc] = useState(false);
    const [snack, setSnack] = useState(false)

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        // console.log(event)
        if (reason === 'clickaway') {
          return;
        }
    
        setSnack(false);
      };
    const theme = useTheme();
    
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
                "reference": String
            }
        }
    }])
    const [open, setOpen] = useState(false);
    // const [deviceInRoom, setDeviceInRoom] = useState([{
    //     resource: {
    //         "resourceType": String,
    //         "id": String,
    //         "meta": {
    //             "versionId": String,
    //             "lastUpdated": String
    //         },
    //         "identifier": [
    //             {
    //                 "system": String,
    //                 "value": String
    //             }
    //         ],
    //         "status": String,
    //         "manufacturer": String,
    //         "patient": {
    //             "reference": String
    //         },
    //         "location": {
    //             "reference": String
    //         }
    //     }
    // }])
    // const devicesInRoom = () => {
    //     let url = `http://3.110.197.165:9444/fhir-server/api/v4/Device/?location=${props.roomId}`
    //     console.log(url)
    //     fetch(url, {
    //         credentials: "omit", // send cookies and HTTP authentication information
    //         headers: {
    //             Authorization: "Basic " + btoa("fhiruser:change-password"), // set HTTP basic auth header
    //         },
    //     })
    //     .then((response) => {
    //         response.json()
    //         // console.log(response.json())
    //     })
    //     .then((data) => {
    //         console.log(data)
    //         // if(data.entry){setDeviceInRoom(data.entry)}
    //     })

    //     return (
    //         // <List>
    //             deviceInRoom.map((device) => {
    //                 return (
    //                     <div>{device.resource.identifier[0].value}</div>
    //                 )
    //             })
    //         // </List>
    //     )
    // }
    const addButton = (index: any) => {
        let data = {}
        let vvtemp = {"reference": `Location/${props.roomId}`}
        data = {
            ...deviceList[Number(index)].resource,
            location: vvtemp
        }
        //console.log(`http://3.110.197.165:9444/fhir-server/api/v4/Device/${deviceList[Number(index)].resource.id}`)

        fetch(`http://3.110.197.165:9444/fhir-server/api/v4/Device/${deviceList[Number(index)].resource.id}`, {
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
            fetch(`http://3.110.197.165:9444/fhir-server/api/v4/Device`, {
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
            {`Add device to ${props.roomName}`}
            </DialogTitle>
            <DialogContent>
            <List>
                {deviceList.map((device, index) => {
                    // console.log(device.resource.identifier[0].value)
                    return(
                        <ListItem>
                            <ListItemButton onClick={() => addButton((index))}>
                            <Typography variant="subtitle1" component={"h2"} sx={{marginRight:'auto', marginTop:'auto', marginBottom:'auto'}}>
                            {device.resource.identifier[0].value}
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

  return (
    <Box  width={"350px"} sx={{backgroundColor:'transparent'}} onClick={() => setOpen(true)}>
        <Paper  elevation={2} sx={{ borderRadius: "25px", backgroundColor:'transparent'}}>
          <Card
            style={{ backgroundColor: "transparent", borderRadius: "25px", minHeight:"280px"
             }}
          >
              <div>
                <Stack width={"100%"} direction={"row"} sx={{justifyContent:"center", marginTop:"20px"}}>
                <CardContent>
                    <Typography>{props.roomName}</Typography>
                </CardContent>
                </Stack>
                
                {/* {devicesInRoom()} */}
                {addToRoom()}
                <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity={snackSucc ? 'success':'error'}>
                        {snackSucc && "Operation Completed Successfully"}
                        {!snackSucc && "Operation Failed"}
                    </Alert>
                </Snackbar>
                
              </div>
            
          </Card>
        </Paper>
        
      </Box>
  )
}
