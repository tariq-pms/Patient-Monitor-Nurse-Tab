// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   CardContent,
//   Typography,
//   IconButton,
//   Grid,
//   Button,
//   Box,
  
//   Tabs,
//   Tab,
//   TextField,
// } from "@mui/material";
// import EditIcon from "@mui/icons-material/Edit";
// import AddIcon from "@mui/icons-material/Add";
// import HotelIcon from "@mui/icons-material/Hotel";
// interface DeviceManagementProps {
//   userOrganization: string;
// }

// interface LocationResource {
//   id: string;
//   name: string;
//   identifierValue?: string;
//   status?: string;
//   managingOrg?: string;
// }

// export const DeviceManagement: React.FC<DeviceManagementProps> = ({ userOrganization }) => {

//   const [locations, setLocations] = useState<LocationResource[]>([]);
//   const [, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState(0);
//   const [deviceList, setDeviceList] = useState<any[]>([]);
//   const [newRoomName, setNewRoomName] = useState("");
//   const [showAddForm, setShowAddForm] = useState(false);
//   const orgId = "190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83";
//   const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
//     setSelectedTab(newValue);
//   };
//   const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
//   const [newName, setNewName] = useState("");
  


//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         const res = await fetch(
//           `${import.meta.env.VITE_FHIRAPI_URL as string}/Location?organization=190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83`,
//           {
//             credentials: "omit",
//             headers: {
//               Authorization: "Basic " + btoa("fhiruser:change-password"),
//             },
//           }
//         );
//         const data = await res.json();
//         if (data.entry) {
//           const fetchedLocations = data.entry.map((entry: any) => {
//             const resource = entry.resource;
//             return {
//               id: resource.id,
//               name: resource.name,
//               identifierValue: resource.identifier?.[0]?.value,
//               status: resource.status,
//               managingOrg: resource.managingOrganization?.reference,
//             };
//           });
//           setLocations(fetchedLocations);
//         }
//       } catch (err) {
//         console.error("Error fetching locations:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLocations();
//   }, [userOrganization]);
//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     try {
//   //       // Fetch devices associated with the current organization
//   //       const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device?organization=190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83`, {
//   //         headers: {
//   //           Authorization: 'Basic ' + btoa('fhiruser:change-password'),
//   //         },
//   //       });
//   //       const data = await response.json();
//   //       const devices = data.entry || [];

//   //       setDeviceList(devices);
     

      
        
        
//   //     } catch (error) {
//   //       console.error('Error fetching devices or metrics:', error);
      
//   //     }
//   //   };

//   //   fetchData();
//   // }, []);
//   useEffect(() => {
//     const fetchDevices = async () => {
//       try {
//         const res = await fetch(
//           `${import.meta.env.VITE_FHIRAPI_URL}/Device?organization=${orgId}`,
//           {
//             headers: {
//               Authorization: "Basic " + btoa("fhiruser:change-password"),
//             },
//           }
//         );
//         const data = await res.json();
//         setDeviceList(data.entry || []);
//       } catch (err) {
//         console.error("Error fetching devices:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDevices();
//   }, []);

 
//   const getDevicesByLocation = (locId: string) => {
//     return deviceList.filter(
//       (d) =>
//         d.resource?.location?.reference === `Location/${locId}`
//     );
//   };
// const handleRenameSubmit = async (loc: LocationResource) => {
//     try {
//     const updatedResource = {
//     resourceType: "Location",
//     id: loc.id,
//     name: newName,
//     status: loc.status,
//     identifier: [{ value: loc.identifierValue }],
//     managingOrganization: { reference: loc.managingOrg }
//     };
//     const response = await fetch(
//       `${import.meta.env.VITE_FHIRAPI_URL}/Location/${loc.id}`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: "Basic " + btoa("fhiruser:change-password"),
//           "Content-Type": "application/fhir+json"
//         },
//         body: JSON.stringify(updatedResource)
//       }
//     );
    
//     if (response.ok) {
//       // refetch or locally update the locations list
//       setEditingLocationId(null);
     
//     } else {
//       console.error("Failed to update location");
//     }
//   } catch (err) {
//     console.error("Error updating location:", err);
//     }
//     };
    
//     const handleAddRoom = async () => {
//       if (!newRoomName.trim()) return;
      
//       const newLocation = {
//       resourceType: "Location",
//       name: newRoomName,
//       status: "active",
//       managingOrganization: {
//       reference: "Organization/190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83"
//       }
//       };
      
//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_FHIRAPI_URL as string}/Location`,
//           {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: "Basic " + btoa("fhiruser:change-password"),
//             },
//             body: JSON.stringify(newLocation)
//           }
//         );
//       if (response.ok) {
//         const created = await response.json();
//         setLocations((prev) => [...prev, {
//           id: created.id,
//           name: created.name,
//           status: created.status,
//           identifierValue: created.identifier?.[0]?.value,
//           managingOrg: created.managingOrganization?.reference
//         }]);
//         setNewRoomName("");
//         setShowAddForm(false);
//       } else {
//         console.error("Failed to create location");
//       }
//       } catch (error) {
// console.error("Error creating location:", error);
// }
// };
//   return (
//     <><Box sx={{ p: 2 }}>
//       <Typography variant="h6" sx={{ mb: 2 }}>
//         NICU Rooms
//       </Typography>
//       <Grid container spacing={3}>
//       {
// locations.map((loc) => {
// const locDevices = getDevicesByLocation(loc.id);
// const isEditing = editingLocationId === loc.id;
// return (
//   <Grid item xs={12} sm={6} md={3} key={loc.id} >
//    <Card sx={{ position: "relative", borderRadius: 5, backgroundColor: '#FFFFFF' }}>
//    <IconButton
// size="small"
// sx={{ position: "absolute", top: 8, right: 8, color: "black" }}
// onClick={() => {
// setEditingLocationId(loc.id);
// setNewName(loc.name);
// }}
// >
// <EditIcon fontSize="small" />
// </IconButton>
// <CardContent>
//       {isEditing ? (
//         <>
//           <input
//             value={newName}
//             onChange={(e) => setNewName(e.target.value)}
//             style={{ width: "100%", marginBottom: "8px" }}
//           />
//           <button onClick={() => handleRenameSubmit(loc)}>Save</button>
//           <button onClick={() => setEditingLocationId(null)}>Cancel</button>
//         </>
//       ) : (
//         <>
//           <Typography variant="h6" color="black">
//             {loc.name}
//           </Typography>
//           <Typography variant="body2" color="black">
//             Devices: {locDevices.length}
//           </Typography>
//           {/* <Typography variant="body2" color="black">
//             Status: {loc.status}
//           </Typography> */}
//         </>
//       )}
//     </CardContent>
//     </Card>
//   </Grid>
// );})
// }


//         <Grid
//           item
//           xs={12}
//           sm={6}
//           md={3}
//           sx={{
//             display: 'flex',

//             alignItems: 'center'
//           }}
//         >
//       <Button
// variant="outlined"
// startIcon={<AddIcon />}
// onClick={() => setShowAddForm(true)}
// sx={{
// textTransform: "none",
// borderRadius: 2,
// backgroundColor: "#e5effb",
// color: "#1976d2",
// fontWeight: 500,
// px: 2,
// py: 1,
// "&:hover": {
// backgroundColor: "#d0e5f7"
// }
// }}
// >
// Add Rooms
// </Button>
// {showAddForm && (
// <Box mt={2}>
// <TextField
// label="Room Name"
// variant="outlined"
// value={newRoomName}
// onChange={(e) => setNewRoomName(e.target.value)}
// size="small"
// />
// <Button onClick={handleAddRoom} sx={{ ml: 1 }} variant="contained">
// Create
// </Button>
// <Button onClick={() => setShowAddForm(false)} sx={{ ml: 1 }}>
// Cancel
// </Button>
// </Box>
// )}
//         </Grid>

//       </Grid>
//     </Box><Box sx={{ p: 2}}>
       
//         <Typography variant="h6" sx={{ mb: 2 }}>
//         Device-Bed management
//       </Typography>

//         <Tabs
//           value={selectedTab}
//           onChange={handleTabChange}
//           variant="scrollable"
//           scrollButtons="auto"
//           sx={{
//             borderBottom: 1,
//             borderColor: "divider",
//             "& .MuiTab-root": {
//               textTransform: "none",
//               fontWeight: 500,
//               minWidth: 120,
//               color: "#6e6e6e",
//             },
//             "& .Mui-selected": {
//               color: "#1976d2",
//               fontWeight: 600,
//             },
//           }}
//         >
//           {locations.map((loc) => (
//             <Tab
//               key={loc.id}
//               icon={<HotelIcon fontSize="small" />}
//               iconPosition="start"
//               label= {loc.name} />
//           ))}
//         </Tabs>

//         {/* Add Devices Button */}
//         <Box sx={{ mt: 3 }}>
//           <Button
//             variant="outlined"
//             startIcon={<AddIcon />}
//             sx={{
//               textTransform: "none",
//               borderRadius: 2,
//               backgroundColor: "#e5effb",
//               color: "#1976d2",
//               fontWeight: 500,
//               px: 2,
//               py: 1,
//               "&:hover": {
//                 backgroundColor: "#d0e5f7",
//               },
//             }}
//           >
//             Add Devices
//           </Button>
//         </Box>
//       </Box></>
//   );
// };


//good
// import { useState, useEffect, FC } from 'react';
// import Box from '@mui/material/Box';
// import { RoomCard } from '../components/RoomCard';
// import { Alert, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Snackbar, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// import { CustomOkButton } from '../components/CustomOkButton';
// import { CustomNoButton } from '../components/CustomNoButton';

// export interface roomdata {
//   userOrganization: string;
//   darkTheme: boolean;
// }

// interface FhirLocation {
//   resource: {
//     name: string;
//     resourceType: string;
//     id: string;
//     meta: {
//       versionId: string;
//       lastUpdated: string;
//     };
//     identifier: {
//       value: string;
//     }[];
//     status: string;
//     physicalType?: {
//       coding: {
//         code: string;
//         system?: string;
//         display?: string;
//       }[];
//     };
//     partOf?: {
//       reference: string;
//     };
//   };
// }

// export const DeviceManagement: FC<roomdata> = (props) => {
//     const theme = useTheme();
//     const { darkTheme } = props;
//     const [rooms, setRooms] = useState<FhirLocation[]>([]);
//     const [roomAddedRemoved, setRoomAddedRemoved] = useState(false);
//     const [addnewbutton, setaddnewbutton] = useState(false);
//     const [newRoomName, setNewRoomName] = useState("");
//     const [snackSucc, setSnackSucc] = useState(false);
//     const [snack, setSnack] = useState(false);
//     const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
//     const [vvtemp, setvvtemp] = useState(false);
//     const [selectedBed, setSelectedBed] = useState<{id: string, name: string} | null>(null);

//     useEffect(() => {
//         console.log("In ROom Page:", props.userOrganization);
         
//         fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location?organization=${props.userOrganization}`, {
//             credentials: "omit",
//             headers: {
//                 Authorization: "Basic "+ btoa("fhiruser:change-password"),
//             },
//         })
//         .then((response) => response.json())
//         .then((data) => {
//             if(data.entry) {
//                 console.log("In ROom Page data.entry:", data.entry);
                
//                 // Filter to get only rooms (locations that are not beds)
//                 const filteredRooms = data.entry.filter((entry: any) => {
//                     // Skip if it's a bed (has partOf reference or physicalType of 'bd')
//                     if (entry.resource.partOf) return false;
//                     const physicalType = entry.resource.physicalType?.coding?.[0]?.code;
//                     return !physicalType || physicalType !== 'bd';
//                 });
                
//                 setRooms(filteredRooms);
//             }
//         })
//         .catch(error => {
//             console.error("Error fetching rooms:", error);
//             setRooms([]);
//         });
//     }, [roomAddedRemoved, props.userOrganization]);

//     const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
//         if (reason === 'clickaway') return;
//         setSnack(false);
//     };
    
//     const addNewRoom = () => {
//         const data = {
//             "resourceType": "Location",
//             "identifier": [{
//                 "value": newRoomName
//             }],
//             "status": "suspended",
//             "name": newRoomName,
//             "physicalType": {
//                 "coding": [{
//                     "system": "http://terminology.hl7.org/CodeSystem/location-physical-type",
//                     "code": "ro", // Explicitly mark as room
//                     "display": "Room"
//                 }]
//             },
//             "managingOrganization": {
//                 "reference": `Organization/${props.userOrganization}`
//             }
//         };

//         fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location`, {
//             credentials: "omit",
//             method: "POST",
//             body: JSON.stringify(data),
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: "Basic " + btoa("fhiruser:change-password"),
//             },
//         })
//         .then((response) => {
//             console.log(response);
//             setSnack(true);
//             if(response.status === 201) {
//                 setSnackSucc(true);
//                 setRoomAddedRemoved(!roomAddedRemoved);
//             } else {
//                 setSnackSucc(false);
//             }
//         })
//         .catch(error => {
//             console.error("Error adding room:", error);
//             setSnack(true);
//             setSnackSucc(false);
//         });
//     };

//     const handleBedClick = (bedId: string, bedName: string) => {
//         setSelectedBed({ id: bedId, name: bedName });
//         // You can add additional logic here for what happens when a bed is clicked
//         console.log(`Bed clicked: ${bedName} (${bedId})`);
//     };

//     const addNewRoomButton = () => {
//         return (
//             <Dialog
//                 fullScreen={fullScreen}
//                 open={addnewbutton}
//                 onClose={() => setaddnewbutton(false)}
//                 aria-labelledby="responsive-dialog-title"
//                 PaperProps={{
//                     style: {
//                         borderRadius: '40px', 
//                         boxShadow: `0px 0px 40px 1px #404040`, 
//                         border: '0.4px solid #505050', 
//                         backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)', 
//                         minWidth: '400px', 
//                         minHeight: '250px', 
//                         textAlign: 'center'
//                     }
//                 }}
//             >
//                 <DialogTitle sx={{textAlign: "center", fontWeight: 'bold', paddingTop: '9%'}}>
//                     {"Add New Room"}
//                 </DialogTitle>
//                 <DialogContent>
//                     <TextField 
//                         id="standard-basic" 
//                         label="Room Name" 
//                         variant="standard" 
//                         onChange={(e) => setNewRoomName(e.target.value)} 
//                         sx={{width: '90%'}} 
//                     />
//                 </DialogContent>
//                 <DialogActions>
//                     <Stack direction={'row'} width={'100%'} justifyContent={'space-around'} sx={{marginBottom: '7%'}}>
//                         <Box onClick={() => setaddnewbutton(false)}>
//                             <CustomNoButton text="Cancel" />
//                         </Box>
//                         <Box onClick={() => {
//                             addNewRoom(); 
//                             setaddnewbutton(false); 
//                             setRoomAddedRemoved(!roomAddedRemoved);
//                         }}>
//                             <CustomOkButton text="Confirm" />
//                         </Box>
//                     </Stack>     
//                 </DialogActions>
//             </Dialog>
//         );
//     };

//     const roomBoxes = rooms.map((room) => {
//         if (!room.resource.identifier?.[0]?.value) return null;
        
//         return (
//             <RoomCard 
//                 key={room.resource.id}
//                 deviceChangeToggle={vvtemp} 
//                 deviceChange={() => setvvtemp(!vvtemp)} 
//                 roomChange={() => setRoomAddedRemoved(!roomAddedRemoved)} 
//                 roomName={room.resource.identifier[0].value} 
//                 roomId={room.resource.id} 
//                 userOrganization={props.userOrganization} 
//                 darkTheme={props.darkTheme}
//                 onBedClick={handleBedClick} // Pass the bed click handler
//             />
//         );
//     });

//     return (
//         <Box sx={{ p: 2 }}>
//             <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
//                 Rooms
//             </Typography>
            
//             {selectedBed && (
//                 <Alert severity="info" sx={{ mb: 2 }}>
//                     Selected Bed: {selectedBed.name} (ID: {selectedBed.id})
//                 </Alert>
//             )}
            
//             <Stack
//                 direction="row"
//                 spacing={2}
//                 alignItems="flex-start" 
//                 sx={{ p: 2, backgroundColor: 'transparent', width: '100%', flexWrap: 'wrap' }}
//             >
//                 {rooms.length > 0 ? roomBoxes : (
//                     <Typography>No rooms found</Typography>
//                 )}
                
//                 <Box 
//                     width={"350px"} 
//                     sx={{ backgroundColor: 'transparent', borderRadius: '30px' }}  
//                     onClick={() => setaddnewbutton(true)}
//                 >
//                     <Paper elevation={5} sx={{ borderRadius: "25px", background: 'transparent' }}>
//                         <Card style={{ 
//                             background: "transparent", 
//                             borderRadius: "25px", 
//                             minHeight: "280px", 
//                             border: `1px solid grey`,
//                             cursor: 'pointer'
//                         }}>
//                             <Stack width={"100%"} direction={"row"} sx={{justifyContent: "center", marginTop: "20px"}}>
//                                 <CardContent>
//                                     <Typography fontSize={'bold'} style={{
//                                         color: darkTheme ? 'white' : '#124D81',
//                                         fontWeight: 'bold'
//                                     }}>
//                                         Add new room
//                                     </Typography>
//                                     <AddIcon sx={{ fontSize: 100, color: darkTheme ? 'white' : '#124D81' }} />
//                                 </CardContent>
//                             </Stack>
//                         </Card>
//                     </Paper>
//                 </Box>
//             </Stack>
            
//             <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
//                 <Alert onClose={handleClose} variant="filled" severity={snackSucc ? 'success' : 'error'}>
//                     {snackSucc ? "Operation Completed Successfully" : "Operation Failed"}
//                 </Alert>
//             </Snackbar>
            
//             {addNewRoomButton()}
//         </Box>
//     );
// };


import { useState, useEffect, FC, SetStateAction } from 'react';
import Box from '@mui/material/Box';
import { RoomCard } from '../components/RoomCard';
import {Alert, Dialog,DialogActions,DialogContent,DialogTitle,Snackbar,Stack,TextField,Typography, useTheme, Button,Tab,Tabs, useMediaQuery, InputLabel, Select, MenuItem, FormControl} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';

export interface roomdata {
  userOrganization: string;
  darkTheme: boolean;
}

interface FhirLocation {
  resource: {
    roomType?: string;
    capacity: number | undefined;
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
    // Add extension for capacity
    extension?: {
      url: string;
      valueInteger?: number;
      // Include other possible extension value types if needed
      valueString?: string;
      valueBoolean?: boolean;
    }[];
  };
}

export const DeviceManagement: FC<roomdata> = (props) => {
    const theme = useTheme();
    const { darkTheme } = props;
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [rooms, setRooms] = useState<FhirLocation[]>([]);
    const [roomAddedRemoved, setRoomAddedRemoved] = useState(false);
    // const [expanded, setExpanded] = useState<string | false>(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [addnewbutton, setaddnewbutton] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [snackSucc, setSnackSucc] = useState(false);
    const [snack, setSnack] = useState(false);
    const [roomCapacity, setRoomCapacity] = useState(1);
    const [roomType, setRoomType] = useState('level1'); // Default to Level 1 // Default capacity
    // const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [vvtemp, setvvtemp] = useState(false);
    const handleTabChange = (_event: any, newValue: SetStateAction<number>) => {
      setSelectedTab(newValue);
  };

  

  useEffect(() => {
    console.log("In Room Page:", props.userOrganization);
    
    fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location?organization=${props.userOrganization}&_count=100`, {
      credentials: "omit",
      headers: {
        Authorization: "Basic "+ btoa("fhiruser:change-password"),
      },
    })
    .then((response) => response.json())
    .then((data) => {
      if(data.entry) {
        console.log("In Room Page data.entry:", data.entry);
        
        // Filter to get only rooms (locations that are not beds)
        const filteredRooms = data.entry.filter((entry: FhirLocation) => {
          // Skip if it's a bed (has partOf reference or physicalType of 'bd')
          if (entry.resource.partOf) return false;
          const physicalType = entry.resource.physicalType?.coding?.[0]?.code;
          return !physicalType || physicalType !== 'bd';
        }).map((entry: FhirLocation) => {
          // Extract capacity from extensions
          const capacityExtension = entry.resource.extension?.find(
            ext => ext.url === "http://example.org/fhir/StructureDefinition/capacity"
          );
          
          return {
            ...entry,
            resource: {
              ...entry.resource,
              capacity: capacityExtension?.valueInteger || 1 // Default to 1 if not specified
            }
          };
        });
        
        setRooms(filteredRooms);
      }
    })
    .catch(error => {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    });
  }, [roomAddedRemoved, props.userOrganization]);
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
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
            "code": "ro",
            "display": "Room"
          }]
        },
        "managingOrganization": {
          "reference": `Organization/${props.userOrganization}`
        },
        "extension": [
          {
            "url": "http://example.org/fhir/StructureDefinition/capacity",
            "valueInteger": roomCapacity || 1
          },
          {
            "url": "http://example.org/fhir/StructureDefinition/room-type",
            "valueString": roomType
          }
        ]
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
        console.log(response);
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

    // const handleAccordionChange = 
    //     (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    //         setExpanded(isExpanded ? panel : false);
    //     };

    const addNewRoomButton = () => {
        return (

          <Dialog
  open={addnewbutton}
  onClose={() => setaddnewbutton(false)}
  fullWidth
  maxWidth="xs"
  PaperProps={{
    sx: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
      borderRadius: 3,
    },
  }}
>
  <DialogTitle sx={{ fontWeight: 500, pb: 1, color: '#000000', textAlign: 'center' }}>
    Add New Room
  </DialogTitle>
  
  <DialogContent dividers sx={{ borderColor: '#ccc' }}>
    <Stack spacing={3} sx={{ pt: 1 }}>
      <TextField
        autoFocus
        margin="dense"
        id="Room-name"
        label="Room Name"
        type="text"
        fullWidth
        variant="outlined"
        onChange={(e) => setNewRoomName(e.target.value)}
        InputProps={{
          sx: {
            backgroundColor: '#F5F5F5',
            borderRadius: 1,
            color: '#000000',
          },
        }}
        InputLabelProps={{ sx: { color: '#000000' } }}
      />

      <TextField
        margin="dense"
        id="room-capacity"
        label="Total Bed Capacity"
        type="number"
        fullWidth
        variant="outlined"
        inputProps={{ min: 1 }}
        onChange={(e) => setRoomCapacity(parseInt(e.target.value))}
        InputProps={{
          sx: {
            backgroundColor: '#F5F5F5',
            borderRadius: 1,
            color: '#000000',
          },
        }}
        InputLabelProps={{ sx: { color: '#000000' } }}
      />

      <FormControl fullWidth margin="dense">
        <InputLabel sx={{ color: '#000000' }}>Room Type</InputLabel>
        <Select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          sx={{
            backgroundColor: '#F5F5F5',
            borderRadius: 1,
            color: '#000000',
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
          }}
          inputProps={{
            sx: {
              color: '#000000',
            },
          }}
        >
          <MenuItem value="level1">Level 1</MenuItem>
          <MenuItem value="level2">Level 2</MenuItem>
          <MenuItem value="level3">Level 3</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
    <Button
      onClick={() => setaddnewbutton(false)}
      variant="outlined"
      sx={{
        textTransform: 'none',
        borderColor: '#D0D5DD',
        color: '#344054',
        fontWeight: 500,
        backgroundColor: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#F9FAFB',
        },
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={() => {
        addNewRoom(); 
        setaddnewbutton(false); 
        setRoomAddedRemoved(!roomAddedRemoved);
      }}
      sx={{
        backgroundColor: '#228BE6',
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#228BE6',
          color: '#FFFFFF',
        },
        '&.Mui-disabled': {
          backgroundColor: '#228BE61A',
          color: 'grey',
          opacity: 1,
        },
      }}
    >
      Save
    </Button>
  </DialogActions>
</Dialog>
          
        );
    };

   return (
  <Box sx={{ p:1}}>
    {/* Header Section */}
    <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt:1,mb: 0, backgroundColor: ""}}
      >
         <Typography
    variant={isMobile ? "h6" : "h5"}
    sx={{ fontWeight: "bold"}}
  >
   Rooms
  </Typography>
       
            <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setaddnewbutton(true)}
            sx={{ backgroundColor: "#228BE61A", color: "#228BE6" }}
          >
             Add Room
          </Button>
      </Stack>
    

    {/* Tabs Section */}
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      {rooms.length > 0 ? (
        <Box>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTabs-scrollButtons": {
                "&.Mui-disabled": { opacity: 0.3 },
              },
              mb: 1,
            }}
          >
            {rooms.map((room, index) => (
              <Tab
                key={room.resource.id}
                label={
                  room.resource.identifier?.[0]?.value ||
                  `Room ${index + 1}`
                }
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  px: 1,
                  minWidth: isMobile ? 80 : 120,
                }}
              />
            ))}
          </Tabs>

          {/* Tab Content */}
          {rooms.map((room, index) => (
            <Box
              key={room.resource.id}
              role="tabpanel"
              hidden={selectedTab !== index}
              id={`tabpanel-${index}`}
              aria-labelledby={`tab-${index}`}
              sx={{ p: 1, backgroundColor: "#FFFFFF" }}
            >
              {selectedTab === index && (
                <RoomCard
                  deviceChangeToggle={vvtemp}
                  deviceChange={() => setvvtemp(!vvtemp)}
                  roomChange={() => setRoomAddedRemoved(!roomAddedRemoved)}
                  roomName={room.resource.identifier?.[0]?.value}
                  roomId={room.resource.id}
                  userOrganization={props.userOrganization}
                  capacity={room.resource.capacity}
                  roomType={room.resource.roomType}
                  darkTheme={props.darkTheme}
                />
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography>No rooms found</Typography>
      )}
    </Box>

    {/* Snackbar Feedback */}
    <Snackbar
      open={snack}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        variant="filled"
        severity={snackSucc ? "success" : "error"}
      >
        {snackSucc
          ? "Operation Completed Successfully"
          : "Operation Failed"}
      </Alert>
    </Snackbar>

    {/* Room Dialog */}
    {addNewRoomButton()}
  </Box>
);

};