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
    roomType: string ;
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
    const [roomType, setRoomType] = useState(""); // Default to Level 1 // Default capacity
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
          const roomTypeExtension = entry.resource.extension?.find(
            ext => ext.url === "http://example.org/fhir/StructureDefinition/room-type"
          );
          return {
            ...entry,
            resource: {
              ...entry.resource,
              capacity: capacityExtension?.valueInteger || 1 ,
              roomType: roomTypeExtension?.valueString || 'N/A',// Default to 1 if not specified
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

 const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnack(false);
    };
    
    const addNewRoom = () => {
      const data = {
        "resourceType": "Location",
        // "identifier": [{
        //   "value": newRoomName
        // }],
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
  <InputLabel id="room-type-label" sx={{ color: '#000000' }}>
    Room Type
  </InputLabel>
  <Select
    labelId="room-type-label"
    value={roomType}
    onChange={(e) => setRoomType(e.target.value)}
    label="Room Type"
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
                  room.resource.name ||
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
                  roomName={room.resource.name}
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