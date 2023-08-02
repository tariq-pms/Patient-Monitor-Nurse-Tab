import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { RoomCard } from '../components/RoomCard';
import { Alert, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Snackbar, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
export const Rooms = () => {
    const {isAuthenticated} = useAuth0();
    const theme = useTheme();
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
    useEffect(() => {
        if(isAuthenticated){
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
        }  
      },[])
      const [addnewbutton, setaddnewbutton] = useState(false);
      const [newRoomName, setNewRoomName] = useState("")
      const [snackSucc, setSnackSucc] = useState(false);
    const [snack, setSnack] = useState(false)
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        // console.log(event)
        if (reason === 'clickaway') {
          return;
        }
    
        setSnack(false);
      };
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
    const roomBoxes = temproom.map((room) => {
        return(
            <RoomCard roomName={room.resource.identifier[0].value} roomId={room.resource.id}></RoomCard>
        )
    })
  return (
    <div>
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
            {roomBoxes}
            <Box  width={"350px"} sx={{backgroundColor:'transparent'}} onClick={() => {setaddnewbutton(true)}}>
              <Paper  elevation={2} sx={{ borderRadius: "25px", backgroundColor:'transparent'}}>
                <Card
                  style={{ backgroundColor: "transparent", borderRadius: "25px", minHeight:"280px"
                  }}
                >
                  <Stack width={"100%"} direction={"row"} sx={{justifyContent:"center", marginTop:"20px"}}>
                    <CardContent>
                        <Typography sx={{marginLeft:"45px"}}>Add new room</Typography>
                        <AddIcon sx={{ fontSize: 200 }} />
                    </CardContent>
                  </Stack>
                </Card>
              </Paper>
            </Box>
            </Box>
            <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
                            <Alert onClose={handleClose} severity={snackSucc ? 'success':'error'}>
                                {snackSucc && "Operation Completed Successfully"}
                                {!snackSucc && "Operation Failed"}
                            </Alert>
                        </Snackbar>
            {addNewRoomButton()}
        </div>
    </div>
  )
}
