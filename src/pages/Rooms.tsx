import { useState, useEffect, FC } from 'react'
//import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { RoomCard } from '../components/RoomCard';
import { Alert, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,  Paper, Snackbar, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CustomOkButton } from '../components/CustomOkButton';
import { CustomNoButton } from '../components/CustomNoButton';
export interface roomdata{
  roomModified: Function;
  userOrganization: string;
  darkTheme:boolean;
}

export const Rooms:FC<roomdata> = (props) => {
    //const {isAuthenticated, loginWithRedirect} = useAuth0();
    const theme = useTheme();
    const { darkTheme } = props;
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
            "status": "",
            
        }
    }])
    
    const [roomAddedRemoved, setRoomAddedRemoved] = useState(false)
    useEffect(() => {
        // if(isAuthenticated){
         
          console.log("In ROom Page:",props.userOrganization);
         
          fetch(` ${import.meta.env.VITE_FHIRAPI_URL as string}/Location?organization=${props.userOrganization}`, {
            
            
          credentials: "omit",
          headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
          },
        })
        .then((response) => response.json())
        .then((data) => {if(data.entry){
          props.roomModified()
          settemproom(data.entry)
        }})
        // }  
    },[roomAddedRemoved])
    const [controlBorder, setControlboarder] = useState('grey')
    const [controlOpacity, setOpacity] = useState("0.8")
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
        console.log(event);
    };
    
      const addNewRoom = () => {
        const data = {
            "resourceType": "Location",
            "identifier": [
                {
                    "value": newRoomName
                }
            ],
            "status": "suspended",
            "name": newRoomName,
            "managingOrganization": {
              // "reference": `Organization/18d1c76ef29-ba9f998e-83b1-4c43-bc5b-b91b572a6454`
              "reference": `Organization/${props.userOrganization}`
          }
        }
        // console.log
        fetch(` ${import.meta.env.VITE_FHIRAPI_URL as string}/Location`, {
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
            PaperProps={{style:{borderRadius:'40px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth:'400px', minHeight:'250px', textAlign:'center'}}}
        >
            <DialogTitle sx={{textAlign:"center", fontWeight:'bold', paddingTop:'9%'}}>
            {"Add New Room"}
            </DialogTitle>
            <DialogContent>
                <TextField id="standard-basic" label="Room Name" variant="standard" onChange={(e) => {setNewRoomName(e.target.value)}} sx={{width:'90%'}} />
            </DialogContent>
            <DialogActions >
              <Stack direction={'row'} width={'100%'} justifyContent={'space-around'} sx={{marginBottom:'7%'}}>
              <Box onClick={() => {setaddnewbutton(false)}} ><CustomNoButton text="Cancel"></CustomNoButton></Box>
              
              {/* <Button onClick={() => {setMiniDialog(false)}}>Cancel</Button> */}
              <Box onClick={() => {addNewRoom(); setaddnewbutton(false); setRoomAddedRemoved(!roomAddedRemoved)}}><CustomOkButton text="Confirm"></CustomOkButton></Box>
              </Stack>     
            </DialogActions>
        </Dialog>
    
        )
    }
    const [vvtemp, setvvtemp] = useState(false)
    const roomBoxes = temproom.map((room) => {
        return(
            <RoomCard deviceChangeToggle={vvtemp} deviceChange={() => { setvvtemp(!vvtemp); } } roomChange={() => { setRoomAddedRemoved(!roomAddedRemoved); } } roomName={String(room.resource.identifier[0].value)} roomId={String(room.resource.id)} userOrganization={props.userOrganization} darkTheme={props.darkTheme}></RoomCard>
        )
    })
  return (
    
    <div>
      {/* {isAuthenticated && ( */}
        <div>
                <Stack width={'100%'} direction={'row'} paddingTop={'2%'} justifyContent={'center'} textAlign={'center'}>
              <Typography variant='h5' color={darkTheme?'white':'#124D81'}>Rooms & Device Settings</Typography>
              {/* <Settings  sx={{marginLeft:'1%', fontSize:'200%', color:'white'}}/> */}
            </Stack>
            
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          
        <Box sx={{display: "flex",flexWrap: "wrap",gap: '2rem',
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
            {temproom[0]?.resource.status!="" && roomBoxes}
            <Box  width={"350px"} minHeight={'300px'} maxHeight={'300px'} sx={{opacity:controlOpacity, backgroundColor:'transparent', borderRadius:'30px'}} onMouseLeave={() => {setControlboarder("grey");setOpacity("0.8")}} onMouseEnter={() => {setControlboarder("#2BA0E0");setOpacity("1")}} onClick={() => {setaddnewbutton(true)}}>
              <Paper  elevation={5} sx={{ borderRadius: "25px",background:'transparent'}}>
                <Card style={{ background: "transparent", borderRadius: "25px", minHeight:"280px", border: `1px solid ${controlBorder}`
                  }} >
                  <Stack width={"100%"} direction={"row"} sx={{justifyContent:"center", marginTop:"20px"}}>
                    <CardContent>
                        <Typography fontSize={'bold'} style={{color:darkTheme?'white': '#124D81',fontWeight: 'bold',paddingLeft:'45px'}}>Add new room</Typography>
                        <AddIcon sx={{ fontSize: 200, color:controlBorder }} />
                    </CardContent>
                  </Stack>
                </Card>
              </Paper>
            </Box>
            </Box>
            <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
              <Alert onClose={handleClose} variant="filled" severity={snackSucc ? 'success':'error'}>
                  {snackSucc && "Operation Completed Successfully"}
                  {!snackSucc && "Operation Failed"}
              </Alert>
            </Snackbar>
            {addNewRoomButton()}
        </div>
        </div>
    </div>
  )
}


