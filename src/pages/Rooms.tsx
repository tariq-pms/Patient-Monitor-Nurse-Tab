import { useState, useEffect, FC } from 'react';
import Box from '@mui/material/Box';
import { Alert,  Dialog, DialogActions, DialogContent, DialogTitle,  Snackbar, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { CustomOkButton } from '../components/CustomOkButton';
import { CustomNoButton } from '../components/CustomNoButton';
import { RoomCard1 } from '../components/RoomCard1';

export interface roomdata {
//   roomModified: Function;
  userOrganization: string;
  darkTheme: boolean;
}

interface FhirLocation {
  resource: {
    name: string;
    resourceType: string;
    id: string;
    meta: {
      versionId: string;
      lastUpdated: string;
    };
    identifier: {
      value: string;
    }[];
    status: string;
    physicalType?: {
      coding: {
        code: string;
        system?: string;
        display?: string;
      }[];
    };
    partOf?: {
      reference: string;
    };
    managingOrganization: {
      reference: string;
    };
  };
}

export const Rooms: FC<roomdata> = (props) => {
    const theme = useTheme();
    const { darkTheme } = props;
   
    const [rooms, setRooms] = useState<FhirLocation[]>([]);
    const [roomAddedRemoved, setRoomAddedRemoved] = useState(false);
    const [addnewbutton, setAddNewButton] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [snackSucc, setSnackSucc] = useState(false);
    const [snack, setSnack] = useState(false);
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [vvtemp, setVvtemp] = useState(false);

    useEffect(() => {
      fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location?organization=${props.userOrganization}`, {
        credentials: "omit",
        headers: {
          Authorization: "Basic "+ btoa("fhiruser:change-password"),
        },
      })
      .then((response) => response.json())
      .then((data) => {
        if(data.entry) {
        //   props.roomModified();
          
          // Filter to get only rooms (locations that are not beds)
          const filteredRooms = data.entry.filter((entry: any) => {
            const resource = entry.resource;
            // Skip if it's a bed (has physicalType of 'bd' or has partOf reference)
            if (resource.physicalType?.coding?.[0]?.code === 'bd') return false;
            if (resource.partOf) return false;
            return true;
          });
          
          setRooms(filteredRooms);
        }
      })
      .catch(error => {
        console.error("Error fetching rooms:", error);
        setRooms([]);
      });
    }, [roomAddedRemoved, props.userOrganization]);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnack(false);
    };
    
    const addNewRoom = () => {
        const data = {
            "resourceType": "Location",
            "identifier": [{
                "value": newRoomName
            }],
            "status": "suspended",
            "name": newRoomName,
            "physicalType": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/location-physical-type",
                    "code": "ro", // Explicitly set as room
                    "display": "Room"
                }]
            },
            "managingOrganization": {
                "reference": `Organization/${props.userOrganization}`
            }
        };

        fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location`, {
            credentials: "omit",
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
        })
        .then((response) => {
            setSnack(true);
            if(response.status === 201) {
                setSnackSucc(true);
                setRoomAddedRemoved(!roomAddedRemoved);
            } else {
                setSnackSucc(false);
            }
        })
        .catch(error => {
            console.error("Error adding room:", error);
            setSnack(true);
            setSnackSucc(false);
        });
    };

    const addNewRoomButton = () => {
        return (
            <Dialog
                fullScreen={fullScreen}
                open={addnewbutton}
                onClose={() => setAddNewButton(false)}
                aria-labelledby="responsive-dialog-title"
                PaperProps={{
                    style: {
                        borderRadius: '40px', 
                        boxShadow: `0px 0px 40px 1px #404040`, 
                        border: '0.4px solid #505050', 
                        backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)', 
                        minWidth: '400px', 
                        minHeight: '250px', 
                        textAlign: 'center'
                    }
                }}
            >
                <DialogTitle sx={{textAlign: "center", fontWeight: 'bold', paddingTop: '9%'}}>
                    {"Add New Room"}
                </DialogTitle>
                <DialogContent>
                    <TextField 
                        id="standard-basic" 
                        label="Room Name" 
                        variant="standard" 
                        onChange={(e) => setNewRoomName(e.target.value)} 
                        sx={{width: '90%'}} 
                    />
                </DialogContent>
                <DialogActions>
                    <Stack direction={'row'} width={'100%'} justifyContent={'space-around'} sx={{marginBottom: '7%'}}>
                        <Box onClick={() => setAddNewButton(false)}>
                            <CustomNoButton text="Cancel" />
                        </Box>
                        <Box onClick={() => {
                            addNewRoom(); 
                            setAddNewButton(false); 
                            setRoomAddedRemoved(!roomAddedRemoved);
                        }}>
                            <CustomOkButton text="Confirm" />
                        </Box>
                    </Stack>     
                </DialogActions>
            </Dialog>
        );
    };

    const roomBoxes = rooms.map((room) => {
        const roomName = room.resource.identifier?.[0]?.value || room.resource.name || 'Unnamed Room';
        return (
            <RoomCard1
                key={room.resource.id}
                deviceChangeToggle={vvtemp} 
                deviceChange={() => setVvtemp(!vvtemp)} 
                roomChange={() => setRoomAddedRemoved(!roomAddedRemoved)} 
                roomName={roomName}
                roomId={room.resource.id} 
                userOrganization={props.userOrganization} 
                darkTheme={props.darkTheme} 
            />
        );
    });

    return (
        <div>
            <div>
                <Stack width={'100%'} direction={'row'} paddingTop={'2%'} justifyContent={'center'} textAlign={'center'}>
                    <Typography variant='h5' color={darkTheme ? 'white' : '#124D81'}>
                        Device Settings
                    </Typography>
                </Stack>
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Box sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: '2rem',
                        mt: { xs: 5, sm: 6, md: 7, lg: 8 },
                        mb: { xs: 3, sm: 4, md: 5, lg: 6 },
                        justifyContent: "center",
                        width: "95%",
                    }}>
                        {rooms.length > 0 ? roomBoxes : (
                            <Typography>No rooms found</Typography>
                        )}
                        
                        {/* <Box 
                            width={"350px"} 
                            minHeight={'300px'} 
                            maxHeight={'300px'} 
                            sx={{
                                opacity: controlOpacity, 
                                backgroundColor: 'transparent', 
                                borderRadius: '30px'
                            }} 
                            onMouseLeave={() => {setControlBorder("grey"); setOpacity("0.8")}} 
                            onMouseEnter={() => {setControlBorder("#2BA0E0"); setOpacity("1")}} 
                            onClick={() => setAddNewButton(true)}
                        >
                            <Paper elevation={5} sx={{ borderRadius: "25px", background: 'transparent'}}>
                                <Card style={{ 
                                    background: "transparent", 
                                    borderRadius: "25px", 
                                    minHeight: "280px", 
                                    border: `1px solid ${controlBorder}`
                                }}>
                                    <Stack width={"100%"} direction={"row"} sx={{justifyContent: "center", marginTop: "20px"}}>
                                        <CardContent>
                                            <Typography fontSize={'bold'} style={{
                                                color: darkTheme ? 'white' : '#124D81',
                                                fontWeight: 'bold',
                                                paddingLeft: '45px'
                                            }}>
                                                Add new room
                                            </Typography>
                                            <AddIcon sx={{ fontSize: 200, color: controlBorder }} />
                                        </CardContent>
                                    </Stack>
                                </Card>
                            </Paper>
                        </Box> */}
                    </Box>
                    
                    <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
                        <Alert onClose={handleClose} variant="filled" severity={snackSucc ? 'success' : 'error'}>
                            {snackSucc ? "Operation Completed Successfully" : "Operation Failed"}
                        </Alert>
                    </Snackbar>
                    
                    {addNewRoomButton()}
                </div>
            </div>
        </div>
    );
};