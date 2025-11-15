import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Select, Snackbar, Stack, Typography, MenuItem,  TextField, Skeleton, Paper, TableContainer, TableRow, TableCell, TableHead, Table, TableBody, Chip, useTheme, useMediaQuery, InputAdornment, Tab, Tabs,} from '@mui/material'
import Box from '@mui/material/Box'

import CardContent from '@mui/material/CardContent'
import { FC, useEffect, useState } from 'react'

import IconButton from '@mui/material/IconButton';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HotelIcon from '@mui/icons-material/Hotel';
import {  EditNote } from '@mui/icons-material'
import LinkOffIcon from "@mui/icons-material/LinkOff";

export interface roomData {
    roomName: string;
    roomId: string;
    roomChange: Function;
    deviceChange: Function;
    deviceChangeToggle: Boolean;
    userOrganization:string;
    darkTheme:boolean;
    capacity?: number;
    roomType?: string;
}
interface BedData {
  id: string;
  name: string;
  status: string;
  type: string;
  patientName?: string;
  patientId?: string;
  addedDate?: string;
  devices?: { id: string; name: string }[];
}

interface Patient {
    resourceType: string;
    id: string;
    meta: {
        versionId: string;
        lastUpdated: string;
    };
    extension: {
        url: string;
        valueReference?: {
            reference: string;
        };
        valueString?: string;
    }[];
    identifier: {
        system: string;
        value: string;
    }[];
    managingOrganization: {
        reference: string;
    };
}
interface Device {
  resource: Device;
  resourceType: string;
  id: string;
  meta: {
    versionId: string;
    lastUpdated: string;
  };
  identifier: {
    system: string;
    value: string;
  }[];
  status: string;
  serialNumber: string;
  manufacturer: string;
  patient: {
    reference: string;
  };
  owner: {
    reference: string;
  };
  location: {
    reference: string;
  };
}

export const RoomCard: FC<roomData> = (props) => {

    const initialPatientList: Patient[] = [
        {
            resourceType: "",
            id: "",
            meta: {
                versionId: "",
                lastUpdated: "",
            },
            extension: [],
            identifier: [
                {
                    system: "",
                    value: "",
                },
            ],
            managingOrganization: {
                reference: "",
            },
        },
    ];
    const [] = useState(initialPatientList)
    
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        console.log(event)
        if (reason === 'clickaway') {
          return;
        }
    
        setSnack(false);
      }; 
 const [deviceList, setDeviceList] = useState<Device[]>([]);
    const [patientList, setPatientList] = useState<Patient[]>([]);

    const [beds, setBeds] = useState<BedData[]>([])
    const [loadingBeds, setLoadingBeds] = useState(true)
    const [deviceChangeToggle, setDeviceChangeToggle] = useState(true)
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [selectedBedId, setSelectedBedId] = useState<string | null>(null);

    const [deviceChanged, setDeviceChanged] = useState(false)
    useEffect(() => {setDeviceChanged(!deviceChanged)},[props.deviceChangeToggle])
    const [renameRoom, setRenameRoom] = useState(false)
    const [linkedPatientIds, setLinkedPatientIds] = useState<string[]>([]);
    const [linkedDeviceIds, setLinkedDeviceIds] = useState<string[]>([]);
    const [snackSucc, setSnackSucc] = useState(false);
    const [snack, setSnack] = useState(false);
  
  

    useEffect(() => {
      const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
      const authHeader = "Basic " + btoa("fhiruser:change-password");
      const url = `${baseUrl}/Device?location=Location/${props.roomId}&_count=50`;
    
      console.log("📡 Fetching devices for room:", props.roomId);
      console.log("🔗 FHIR URL:", url);
    
      fetch(url, {
        credentials: "omit",
        headers: {
          Authorization: authHeader,
          Accept: "application/fhir+json",
        },
      })
        .then((response) => {
          console.log("🧾 Raw Response:", response);
          if (!response.ok) {
            console.error(`❌ FHIR request failed: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("📦 Raw FHIR Bundle:", data);
    
          if (data.entry) {
            console.log(`✅ Found ${data.entry.length} devices for room ${props.roomId}`);
            console.table(
              data.entry.map((e: any) => ({
                id: e.resource.id,
                name: e.resource.deviceName?.[0]?.name || e.resource.type?.text,
                status: e.resource.status,
                location: e.resource.location?.reference,
              }))
            );
            setDeviceList(data.entry);
          } else {
            console.warn(`⚠️ No devices found for room ${props.roomId}`);
            setDeviceList([]);
          }
        })
        .catch((error) => {
          console.error("💥 Network or parsing error while fetching devices:", error);
        });
    }, [deviceChanged]);
    

    useEffect(() => {
      fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Patient?_count=1000&organization=${props.userOrganization}`, {
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.entry) {
            setPatientList(data.entry.map((e: any) => e.resource));
          }
        })
        .catch((err) => console.error("Error fetching patients:", err));
    }, []);
    
    // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
   

    
    const addNewBed = async (bedName: string) => {
      const data = {
        resourceType: "Location",
        identifier: [{ value: bedName }],
        status: "active",
        name: bedName,
        physicalType: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/location-physical-type",
              code: "bd",
              display: "Bed",
            },
          ],
        },
        partOf: {
          reference: `Location/${props.roomId}`,
        },
        managingOrganization: {
          reference: `Organization/${props.userOrganization}`,
        },
      };
    
      try {
        const response = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/Location`,
          {
            credentials: "omit",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
            body: JSON.stringify(data),
          }
        );
    
        setSnack(true);
    
        if (response.status === 201) {
          setSnackSucc(true);
          props.roomChange();
    
          // ⭐ Return newly created Location resource
          return await response.json();
        } else {
          setSnackSucc(false);
          return null;
        }
      } catch (error) {
        console.error("Error adding bed:", error);
        return null;
      }
    };
    

    const fetchPatientAssignments = async (bedId: string) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/Encounter?location=Location/${bedId}&status=in-progress&_include=Encounter:subject`,
          {
            headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
          }
        );
    
        if (!response.ok) throw new Error("Failed to fetch encounter");
    
        const data = await response.json();
        if (!data.entry || data.entry.length === 0) return null;
    
        const encounter = data.entry.find(
          (e: any) => e.resource.resourceType === "Encounter"
        )?.resource;
        const patient = data.entry.find(
          (e: any) => e.resource.resourceType === "Patient"
        )?.resource;
    
        if (!patient) return null;
    
        // ✅ Patient display name from extension
        let patientName = "Unknown";
        const maidenNameExt = patient.extension?.find(
          (ext: any) =>
            ext.url ===
            "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName"
        );
        if (maidenNameExt?.valueString) {
          patientName = maidenNameExt.valueString;
        } else if (patient.name && patient.name.length > 0) {
          patientName =
            patient.name[0].text ||
            `${patient.name[0].given?.[0] || ""} ${patient.name[0].family || ""}`.trim();
        }
    
        // ✅ Patient ID from identifier
        const patientId =
          patient.identifier?.[0]?.value || patient.id || "Unknown-ID";
    
        return {
          name: patientName,
          id: patientId,
          addedDate: encounter?.period?.start
            ? new Date(encounter.period.start).toLocaleDateString()
            : "Unknown date",
        };
      } catch (error) {
        console.error("Error fetching patient assignment:", error);
        return null;
      }
    };
    
    // const fetchDeviceAssignments = async (bedId: string) => {
    //   try {
    //     const res = await fetch(
    //       `${import.meta.env.VITE_FHIRAPI_URL}/Device?location=Location/${bedId}`,
    //       {
    //         headers: {
    //           Authorization: "Basic " + btoa("fhiruser:change-password"),
    //         },
    //       }
    //     );
    //     const data = await res.json();
    //     console.log("device name",data);
        
    //     if (data.entry) {
    //       return data.entry.map((d: any) => ({
    //         // id: d.resource.id,
    //         id:d.resource.serialNumber,
    //         name:
    //           d.resource.identifier[1].value ||
             
    //           `Device-${d.resource.id}`,
    //       }));
    //     }
    //     return [];
    //   } catch (err) {
    //     console.error("Error fetching devices:", err);
    //     return [];
    //   }
    // };
   
    const fetchDeviceAssignments = async (bedId: string) => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/Device?location=Location/${bedId}`,
          {
            headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
          }
        );
    
        const data = await res.json();
       
    
        if (data.entry) {
          return data.entry.map((d: any) => ({
            id: d.resource.id, // ✅ Use the actual FHIR resource ID for backend operations
            serialNumber: d.resource.serialNumber || "-", // ✅ keep serial for UI display
            name:
              d.resource.identifier?.[1]?.value ||
              d.resource.identifier?.[0]?.value ||
              `Device-${d.resource.id}`,
            resource: d.resource, // ✅ optional: include full resource if you need it later
          }));
        }
    
        return [];
      } catch (err) {
        console.error("Error fetching devices:", err);
        return [];
      }
    };
       
    useEffect(() => {
      setLoadingBeds(true);
      fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location?partof=${props.roomId}`, {
        credentials: "omit",
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      })
        .then((response) => response.json())
        .then(async (data) => {
          if (data.entry) {
            // Step 1️⃣: Prepare base bed data
            const bedData = data.entry.map((bed: any) => ({
              id: bed.resource.id,
              name: bed.resource.name || bed.resource.identifier?.[0]?.value || "Unnamed Bed",
              status: bed.resource.status,
              type: bed.resource.physicalType?.coding?.[0]?.display || "-",
            }));
    
            // Step 2️⃣: Fetch patient + device assignments for each bed
            const bedsWithPatientsAndDevices = await Promise.all(
              bedData.map(async (bed: BedData) => {
                const assignment = await fetchPatientAssignments(bed.id);
                const devices = await fetchDeviceAssignments(bed.id);
    
                return {
                  ...bed,
                  patientName: assignment?.name || "-",
                  patientId: assignment?.id || "",
                  addedDate: assignment?.addedDate || "-",
                  devices: devices,
                };
              })
            );
    
            setBeds(bedsWithPatientsAndDevices);
    
            // Step 3️⃣: Extract linked patient and device IDs
            const allLinkedPatients = bedsWithPatientsAndDevices
              .filter((b) => b.patientId)
              .map((b) => b.patientId);
    
            const allLinkedDevices = bedsWithPatientsAndDevices
              .flatMap((b) => b.devices?.map((d: { id: any; }) => d.id))
              .filter(Boolean);
    
            setLinkedPatientIds(allLinkedPatients);
            setLinkedDeviceIds(allLinkedDevices);
          }
          setLoadingBeds(false);
        })
        .catch((error) => {
          console.error("Error fetching beds:", error);
          setLoadingBeds(false);
        });
    }, [props.roomId, props.deviceChangeToggle,deviceChangeToggle]);
    
   
    const renameButton = async (x: string) => {
      try {
        // 1️⃣ Fetch existing room details
        const existingResponse = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL as string}/Location/${props.roomId}`,
          {
            headers: {
              "Authorization": "Basic " + btoa("fhiruser:change-password"),
            },
          }
        );
    
        if (!existingResponse.ok) {
          throw new Error("Failed to fetch existing room");
        }
    
        const existingRoom = await existingResponse.json();
    
        // 2️⃣ Update the room name (and identifier if needed)
        const updatedData = {
          ...existingRoom, // keep existing fields like extension, physicalType, etc.
          name: x,
          // identifier: [{ value: x }],
        };
    
        // 3️⃣ PUT updated data back
        const updateResponse = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL as string}/Location/${props.roomId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
            body: JSON.stringify(updatedData),
          }
        );
    
        console.log("Rename status:", updateResponse.status);
        setSnack(true);
    
        if (updateResponse.status === 200) {
          setSnackSucc(true);
          props.roomChange();
        } else {
          setSnackSucc(false);
        }
      } catch (error) {
        console.error("Error renaming room:", error);
        setSnack(true);
        setSnackSucc(false);
      }
    };
    
    const [renameRoomName, setRenameRoomName] = useState("")
    const [addBedDialogOpen, setAddBedDialogOpen] = useState(false)
    const [newBedName, setNewBedName] = useState("")
    
   
    const renameRoomButton = () => {
       
            return (


                <Dialog
                open={renameRoom}
                onClose={() => setRenameRoom(false)}
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
              {`Rename ${props.roomName}?`}
              </DialogTitle>
              
             
              <DialogContent dividers sx={{borderColor: '#ccc'}}>

  <TextField
      autoFocus
      margin="dense"
      id="bed-name"
      label="Enter the new Room Name"
      type="text"
      fullWidth
      variant="outlined"
      value={renameRoomName}
      onChange={(e) => {setRenameRoomName(e.target.value)}}
     
      InputProps={{
        sx: {
          backgroundColor: '#F5F5F5',
          borderRadius: 1,
          color: '#000000',
        },
      }}
      InputLabelProps={{ sx: { color: '#000000' } }}
    />
   

  
  </DialogContent>  
                
              
                <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
                  <Button
                   onClick={() => {setRenameRoom(false)}}
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
          variant="contained"
          color="error"
          onClick={() => {renameButton(renameRoomName); setRenameRoom(false)}}
          sx={{
            backgroundColor: '#228BE6',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#228BE6',
            color: '#FFFFFF',
            }
            
          }}
        
        >Rename</Button>
                  
                </DialogActions>
              </Dialog>
            //     <Dialog 
            //     open={renameRoom}
            //     onClose={() => setRenameRoom(false)}
            //     aria-labelledby="responsive-dialog-title"
            //     PaperProps={{style:{backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', justifyContent:'center', width:'400px',textAlign:'center', minHeight:'200px'}}}
            // >
            //     <DialogTitle id="responsive-dialog-title">
            //     {`Rename ${props.roomName}?`}
            //     </DialogTitle>
            //     <DialogContent>
            //     <TextField id="standard-basic" label="Enter the new Room Name" variant="standard" onChange={(e) => {setRenameRoomName(e.target.value)}} />
            //     </DialogContent>
            //     <DialogActions sx={{width:'90%'}}>
            //         <Stack direction={'row'} width={'100%'} justifyContent={'space-evenly'} paddingBottom={'5%'} paddingLeft={'5%'}>
            //         <Box onClick={() => {setRenameRoom(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomNoButton text="Cancel"></CustomNoButton></Box>
            //         <Box onClick={() => {renameButton(renameRoomName); setRenameRoom(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomOkButton text="Rename"></CustomOkButton></Box>
            //         </Stack>  
            //     </DialogActions>
            // </Dialog>
            
            )
        }

        const handleSave = async () => {
          try {
            if (!selectedPatient || !selectedDevice) {
              alert("Please select both Patient and Device");
              return;
            }
        
            const bedId = selectedBedId; // or props.bedId if passed separately
        
            // --- Step 1: Update Device with Bed & Patient references ---
            const updatedDevice = {
              ...selectedDevice,
              resourceType: "Device",
              location: { reference: `Location/${bedId}` },
              patient: { reference: `Patient/${selectedPatient.id}` }, // ✅ add patient to device
            };
        
            const updateDeviceResponse = await fetch(
              `${import.meta.env.VITE_FHIRAPI_URL}/Device/${selectedDevice.id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Basic " + btoa("fhiruser:change-password"),
                },
                body: JSON.stringify(updatedDevice),
              }
            );
        
            if (!updateDeviceResponse.ok) {
              throw new Error("Failed to update device with patient and location");
            }
        
            // --- Step 2: Create Encounter linking Patient and Bed ---
            const encounter = {
              resourceType: "Encounter",
              status: "in-progress",
              class: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "IMP", // Inpatient
              },
              subject: { reference: `Patient/${selectedPatient.id}` },
              location: [
                {
                  location: { reference: `Location/${bedId}` },
                  status: "active",
                },
              ],
              period: {
                start: new Date().toISOString(),
              },
            };
        
            const encounterResponse = await fetch(
              `${import.meta.env.VITE_FHIRAPI_URL}/Encounter`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Basic " + btoa("fhiruser:change-password"),
                },
                body: JSON.stringify(encounter),
              }
            );
        
            if (!encounterResponse.ok) {
              throw new Error("Failed to create encounter");
            }
        
               setSnack(true);
                setSnackSucc(true);
          } catch (error) {
            console.error("Error saving bed mapping:", error);
            setSnack(true);
            setSnackSucc(false);
          }
        };
    const [deleteDevice, setDeleteDevice] = useState(false)
    
    
    const [deleteRoom, setDeleteRoom] = useState(false)

    const removeRoomButton = () => {
        console.log("Called",deleteDevice)
        fetch(` ${import.meta.env.VITE_FHIRAPI_URL as string}/Location/${props.roomId}`, {
            //fetch(` ${import.meta.env.VITE_FHIRAPI_URL as string}/Location?organization=${props.userOrganization}/${props.roomId}`, {
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
          {`Remove ${props.roomName}?`}
          </DialogTitle>
          
          <DialogContent dividers sx={{borderColor: '#ccc', fontWeight: 500, pb: 1, color: '#000000', textAlign: 'center' }}>
          <DialogContentText sx={{ color: '#000000' }}>
  Are you sure you want to delete {props.roomName}
</DialogContentText>
            
            </DialogContent>
          
            <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
              <Button
                onClick={() => {setDeleteRoom(false)}}
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
      variant="contained"
      color="error"
      onClick={() => {removeRoomButton(); setDeleteRoom(false)}}
      sx={{
        textTransform: 'none',
        fontWeight: 500,
        backgroundColor: '#D92D20',
        '&:hover': {
          backgroundColor: '#B42318',
        },
      }}
    >Delete</Button>
              
            </DialogActions>
          </Dialog>

         
        
        )
    }
  
    // const [miniDialog, setMiniDialog] = useState(false)
    const [selectedDevice, setSelectedDevice] = useState<any>(null)
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

    const [bedDialogOpen, setBedDialogOpen] = useState(false);
// const [selectedBed, setSelectedBed] = useState<any>(null);

// const handleAddBedSubmit = async () => {
//   if (newBedName.trim()) {
//     const fullBedName = `${props.roomName} - ${newBedName.trim()}`;

//     const tempBed: BedData = {
//       id: `temp-${Date.now()}`,
//       name: fullBedName,
//       patientName: "-",
//       devices: [],
//       type: "Standard",
//       status: "available",
//     };

//     // ⚡ Instantly show new bed in UI
//     setBeds((prev) => [...prev, tempBed]);

//     setAddBedDialogOpen(false);
//     setNewBedName("");

//     try {
//       const newBedFromServer = await addNewBed(fullBedName);
//       if (newBedFromServer) {
//         // Replace temp bed with real one
//         setBeds((prev) =>
//           prev.map((b) => (b.id === tempBed.id ? newBedFromServer : b))
//         );
//       }
//     } catch (error) {
//       console.error("Failed to save new bed:", error);
//     }
//   }
// };


const handleAddBedSubmit = async () => {
  if (newBedName.trim()) {
    const fullBedName = `${props.roomName} - ${newBedName.trim()}`;

    try {
      const newBedFromServer = await addNewBed(fullBedName);

      if (newBedFromServer) {
        // Add new bed to the UI list
        setBeds((prev) => [...prev, newBedFromServer]);
      }

      setAddBedDialogOpen(false);
      setNewBedName("");
    } catch (error) {
      console.error("Failed to save new bed:", error);
    }
  }
};

const handleUnlink = async (bed: any) => {
  try {
    if (!bed) {
      alert("No bed selected ❌");
      return;
    }

    const bedId = bed.id;

    // --- Step 1: Unlink Device from Bed and reassign to Room ---
    if (bed.devices && bed.devices.length > 0) {
      for (const device of bed.devices) {
        const deviceId = device.resource.id;

        // Fetch the current Device resource
        const deviceResponse = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/Device/${deviceId}`,
          {
            headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
          }
        );
        const deviceData = await deviceResponse.json();

        // ✅ Step 1.1: Move device back to room
        deviceData.location = {
          reference: `Location/${props.roomId}`,
          display: "Room",
        };

        // ✅ Step 1.2: Remove patient reference
        if (deviceData.patient) delete deviceData.patient;

        // Update Device on FHIR server
        const updateResponse = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/Device/${deviceId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
            body: JSON.stringify(deviceData),
          }
        );

        if (!updateResponse.ok) {
          console.error(`❌ Failed to update device ${deviceId}`);
        }
      }
    }

    // --- Step 2: Close active Encounter for this bed ---
    const encounterSearchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Encounter?location=Location/${bedId}&status=in-progress`;
    const encounterResponse = await fetch(encounterSearchUrl, {
      headers: {
        Authorization: "Basic " + btoa("fhiruser:change-password"),
      },
    });
    const encounterData = await encounterResponse.json();

    if (encounterData.entry && encounterData.entry.length > 0) {
      for (const entry of encounterData.entry) {
        const encounter = entry.resource;
        encounter.status = "finished";
        encounter.period.end = new Date().toISOString();

        await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/Encounter/${encounter.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
            body: JSON.stringify(encounter),
          }
        );
      }
    }

    alert(`✅ Bed ${bed.name} successfully unlinked. Device moved to Room.`);
  } catch (error) {
    console.error("Error unlinking bed:", error);
    alert("❌ Failed to unlink");
  }
};

const [open1, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const handleOpen = () => setOpen(true);
  const handleClose1 = () => setOpen(false);
  

  return (
      <Box>
       
      <Box  sx={{backgroundColor:'#FFFFFF'}}>
              <Stack width={'100%'} direction={'row'} >
              <CardContent sx={{marginTop:'0%', width:'100%', justifyContent:'center', textAlign:'center'}}>
              <Stack
    direction={isMobile ? 'column' : 'row'}
    justifyContent="space-between"
spacing={2}
    sx={{ borderRadius: 2, flexWrap: 'wrap' }}
  >
      {/* Room Info Section */}
      <Stack
      direction="row"
      justifyContent={isMobile ? 'center' : 'space-between'}
      alignItems="center"
     
      spacing={2}
      sx={{ width: isMobile ? '100%' : '60%' }}
    >
      {[
        { label: 'Room Name', value: props.roomName },
        { label: 'Capacity', value: props.capacity },
        { label: 'Type', value: props.roomType },
        { label: 'Occupied Bed', value: '--' },
      ].map((item, i) => (
        <Stack key={i} alignItems={isMobile ? 'center' : 'flex-start'}>
          <Typography
            variant="subtitle2"
            sx={{ color: 'gray' }}
          >
            {item.label}
          </Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: props.darkTheme ? 'white' : 'black' }}
          >
            {item.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
      {/* Action Buttons */}
      <Stack
      direction="row"
      spacing={1}
      justifyContent="center"
      alignItems="center"
      sx={{
        width: isMobile ? '100%' : '20%',
        mt: isMobile ? 2 : 0,
      }}
    >
      <IconButton
        onClick={() => setRenameRoom(true)}
        sx={{ color: props.darkTheme ? 'white' : 'grey' }}
      >
        <EditIcon />
      </IconButton>

      <IconButton
        onClick={() => setDeleteRoom(true)}
        sx={{ color: props.darkTheme ? 'white' : 'grey' }}
      >
        <DeleteIcon />
      </IconButton>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setAddBedDialogOpen(true)}
        disabled={beds.length >= (props.capacity ?? 0)}
        sx={{
          borderRadius: '15px',
          color: props.darkTheme ? 'white' : '#124D81',
          borderColor: props.darkTheme ? 'white' : '#124D81',
          '&:hover': {
            borderColor: props.darkTheme ? '#2BA0E0' : '#0d3a63',
          },
          whiteSpace: 'nowrap',
        }}
      >
        Add Bed
      </Button>
    </Stack>
  </Stack>
                         {/* Beds Section */}
   <Box sx={{ mt: 2 }}>
               
    {loadingBeds ? (
        <Box sx={{ p: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={60} />
            <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1}} />
        </Box>
    ) : (
        <Box
        sx={{
          border: props.darkTheme ? '1px solid #444' : '1px solid #124D81',
          borderRadius: 1,
          overflowX: 'auto', // Responsive horizontal scroll
          width: '100%',
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: props.darkTheme ? '#2A2A2A' : '#FFFFFF',
            minWidth: isMobile ? 600 : '100%', // Enforces scroll on mobile
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: props.darkTheme ? '#2A2A2A' : '#868E961F',
                }}
              >
                <TableCell sx={{ color: 'black', whiteSpace: 'nowrap' }}><strong>Beds</strong></TableCell>
                <TableCell sx={{ color: 'black', whiteSpace: 'nowrap' }}><strong>Patient</strong></TableCell>
                <TableCell sx={{ color: 'black', whiteSpace: 'nowrap' }}><strong>Device</strong></TableCell>
                <TableCell sx={{ color: 'black', whiteSpace: 'nowrap' }}><strong>Type</strong></TableCell>
                <TableCell sx={{ color: 'black', whiteSpace: 'nowrap' }}><strong>Status</strong></TableCell>
                <TableCell sx={{ color: 'black', whiteSpace: 'nowrap' }}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
      
            <TableBody>
  {beds.length > 0 ? (
    beds.map((bed) => (
      <TableRow
        key={bed.id}
        hover
        sx={{
          cursor: 'pointer',
          backgroundColor: props.darkTheme ? '#333' : '#FFF',
        }}
      >
        <TableCell sx={{ color: props.darkTheme ? '#FFF' : 'black' }}>{bed.name}</TableCell>

        <TableCell sx={{ color: props.darkTheme ? '#FFF' : 'black' }}>
          {bed.patientName && bed.patientName !== '-' ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              <Chip
                label={
                  bed.patientId
                    ? `${bed.patientName} (ID: ${bed.patientId})`
                    : bed.patientName
                }
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  maxWidth: 200,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              />
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              Empty
            </Typography>
          )}
        </TableCell>

        <TableCell>
          {bed.devices && bed.devices.length > 0 ? (
            bed.devices.map((device) => (
              <Chip
                key={device.id}
                label={`${device.name} (S.No: ${device.id})`}
                size="small"
                color="info"
                sx={{ mr: 0.5 }}
              />
            ))
          ) : (
            "Empty"
          )}
        </TableCell>

        <TableCell sx={{ color: props.darkTheme ? '#FFF' : 'black' }}>{bed.type}</TableCell>

        <TableCell sx={{ color: props.darkTheme ? '#FFF' : 'black' }}>
          <Chip
            label={bed.status}
            size="small"
            color={
              bed.status === 'active'
                ? 'success'
                : bed.status === 'suspended'
                ? 'warning'
                : 'default'
            }
          />
        </TableCell>
        <TableCell>
  {/* Edit Button */}
  <IconButton
    sx={{ color: props.darkTheme ? "white" : "grey" }}
    onClick={() => {
      setSelectedBedId(bed.id);
      handleOpen();
    }}
  >
    <EditNote />
  </IconButton>

  {/* Unlink Button (only show if something is linked) */}
  {(bed.patientName && bed.patientName !== "-" && bed.devices && bed.devices.length > 0) && (
   
    <IconButton
      sx={{ color: "red" }}
      onClick={async () => {
        await handleUnlink(bed); // ✅ Wait for save to complete
        setDeviceChangeToggle((prev) => !prev); // ✅ Toggle to trigger re-fetch
      }}
  
    >
      <LinkOffIcon />
    </IconButton>
  )}
</TableCell>

       
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={6}>
        <Box textAlign="center" sx={{ p: 2 }}>
          <Typography variant="subtitle1" color="grey">
            No Beds Added
          </Typography>
          <HotelIcon sx={{ fontSize: 40, mt: 1, color: 'grey' }} />
        </Box>
      </TableCell>
    </TableRow>
  )}

  {/* Optional: show capacity reached warning as a row */}
  {/* {beds.length >= (props.capacity ?? 0) && (
    <TableRow>
      <TableCell colSpan={6}>
        <Typography variant="body2" color="error" textAlign="center">
          Room capacity reached. Cannot add more beds.
        </Typography>
      </TableCell>
    </TableRow>
  )} */}
</TableBody>

          </Table>
        </TableContainer>
      </Box>
      
    )}

    {/* Bed Dialog - Add this where appropriate in your component */}
   
</Box>
             
              </CardContent>
              
              
              <Dialog
        open={open1}
        onClose={handleClose1}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Bed Configuration</DialogTitle>
        <DialogContent>
        <Box
  sx={{
    border: "1px dashed grey",
    borderRadius: 2,
    p: 2,
    mb: 2,
    textAlign: "center",
  }}
>
  {selectedPatient ? (
    <Typography>
      {selectedPatient.name?.[0]?.text ||
        `${selectedPatient.identifier?.[0]?.value || ""} ${selectedPatient.identifier?.[1]?.value || ""}`}
    </Typography>
  ) : (
    <Typography>No Patient Added</Typography>
  )}
</Box>


<Box
  sx={{
    border: "1px dashed grey",
    borderRadius: 2,
    p: 2,
    mb: 2,
    textAlign: "center",
  }}
>
{selectedDevice ? (
  <Typography>
    {
     selectedDevice.identifier?.[2]?.value ||
     selectedDevice.identifier?.[0]?.value ||
     selectedDevice.id}
  </Typography>
) : (
  <Typography>No Devices Linked</Typography>
)}

</Box>

          {/* Tabs for Patients / Devices */}
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            centered
          >
            <Tab label="Patients" />
            <Tab label="Devices" />
          </Tabs>

          {/* Example Tab Content */}
          {tab === 0 && (
  <Box sx={{ mt: 2 }}>
    {patientList
      .filter((patient) => {
        // Ensure organization match
        const orgRef = patient.managingOrganization?.reference || "";
        const orgMatch = orgRef === `Organization/${props.userOrganization}`;

        // Get patient id safely
        const patientId = patient.identifier?.[0]?.value || patient.id;

        // Exclude already linked patients
        const notLinked = !linkedPatientIds.includes(patientId);

        return orgMatch && notLinked;
      })
      .map((patient) => (
        <Button
          key={patient.id}
          onClick={() => {
            setSelectedPatient(patient);
            // setMiniDialog(true);
          }}
          sx={{
            width: "48%",
            height: "60px",
            justifyContent: "center",
            textAlign: "center",
            color: props.darkTheme ? "white" : "#2F3D4A",
            backgroundColor: props.darkTheme ? "#2F3D4A" : "white",
            border: "0.1px solid #282828",
            margin: "5px",
          }}
        >
          <Typography variant="subtitle2" component="h2">
            {
            // patient.name?.[0]?.text ||
              `${patient.identifier?.[0]?.value || ""} ${patient.identifier?.[1]?.value || ""}` ||
              patient.id}
          </Typography>
        </Button>
      ))}
    {patientList.filter(
      (patient) =>
        (patient.managingOrganization?.reference || "") ===
          `Organization/${props.userOrganization}` &&
        !linkedPatientIds.includes(patient.identifier?.[0]?.value || patient.id)
    ).length === 0 && (
      <Typography sx={{ textAlign: "center", color: "#9BA1AE", mt: 2 }}>
        No patients available
      </Typography>
    )}
  </Box>
)}

{tab === 1 && (
  <Box sx={{ mt: 2 }}>

    {deviceList
      .filter((entry) => {
        const device = entry.resource ?? entry; // ✅ FIX HERE
        if (!device) return false;

        const serial =
          device.serialNumber ||
          device.identifier?.find((id: any) =>
            id.system?.toLowerCase().includes("serial")
          )?.value ||
          device.identifier?.[0]?.value ||
          device.id;

        const notLinked = !linkedDeviceIds.includes(serial);

        const locMatch =
          device.location?.reference === `Location/${props.roomId}`;


        return locMatch && notLinked;
      })
      .map((entry) => {
        const device = entry.resource ?? entry; // ✅ FIX HERE

        return (
          <Button
            key={device.id}
            onClick={() => setSelectedDevice(device)}
            sx={{
              width: "48%",
              height: "60px",
              justifyContent: "center",
              textAlign: "center",
              color: props.darkTheme ? "white" : "#2F3D4A",
              backgroundColor: props.darkTheme ? "#2F3D4A" : "white",
              border: "0.1px solid #282828",
              margin: "5px",
            }}
          >
            <Typography variant="subtitle2" component="h2">
              {(device.identifier?.[1]?.value || "") +
                " " +
                (device.identifier?.[0]?.value || "")}
            </Typography>
          </Button>
        );
      })}

    {/* No devices fallback */}
    {deviceList.filter((entry) => {
      const device = entry.resource ?? entry; // ✅ FIX HERE
      if (!device) return false;

      const serial =
        device.serialNumber ||
        device.identifier?.find((id: any) =>
          id.system?.toLowerCase().includes("serial")
        )?.value ||
        device.identifier?.[0]?.value ||
        device.id;

      const notLinked = !linkedDeviceIds.includes(serial);
      const locMatch =
        device.location?.reference === `Location/${props.roomId}`;

      return locMatch && notLinked;
    }).length === 0 && (
      <>
        {console.log("⚠️ No devices available for room:", props.roomId)}
        <Typography sx={{ textAlign: "center", color: "#9BA1AE", mt: 2 }}>
          No devices available
        </Typography>
      </>
    )}

  </Box>
)}








          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3
            }}
          >
            <Button variant="outlined" onClick={() => console.log("Reset")}>
              Reset
            </Button>
            <Button
  variant="contained"
  onClick={async () => {
    await handleSave(); // ✅ Wait for save to complete
    setDeviceChangeToggle((prev) => !prev); // ✅ Toggle to trigger re-fetch
  }}
>
  Save Changes
</Button>



          </Box>
        </DialogContent>
              </Dialog>
              
              
              <Dialog
        open={bedDialogOpen}
        onClose={() => setBedDialogOpen(false)}
        fullWidth
        maxWidth="sm"
    >
        <DialogTitle>Bed Details</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#ccc' }}>
            {/* Add your bed details form here */}
            <Stack spacing={"10%"} marginTop={'10%'} width={'70%'} marginLeft={'auto'} marginRight={'auto'}>
                  <Select  sx={{fontSize:'10%', borderRadius:'25px',border:'2px solid #124D81',placeholder:'Devices in this organization'}} >
                      {deviceList.map((device) => {
                          if(device?.owner?.reference === `Organization/${props.userOrganization}` && device?.location?.reference.split("/")[1] === props.roomId){
                              return (
                                //   <MenuItem>{device.resource.identifier[0].value.toString()}</MenuItem>
                              <MenuItem > {(device.identifier[1].value).toString() + ' ' + (device.identifier[0].value).toString()}</MenuItem>

                              )
                          }
                      })}
                  </Select>
                  <Button variant="contained" sx={{borderRadius:'25px'}} onClick={()=> {setOpen(true)}}>Add/Move Devices</Button>
                  <Button variant="contained" sx={{borderRadius:'25px'}} color='warning' onClick={() => {setDeleteDevice(true)}}>Remove Device</Button>
              </Stack>
            {/* Add more details or edit form as needed */}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setBedDialogOpen(false)}>Close</Button>
        </DialogActions>
    </Dialog>

              <Dialog
  open={addBedDialogOpen}
  onClose={() => setAddBedDialogOpen(false)}
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
Add New Bed
</DialogTitle>

  <DialogContent dividers sx={{ borderColor: '#ccc' }}>

  <TextField
  autoFocus
  margin="dense"
  id="bed-name"
  label="Bed Name"
  type="text"
  fullWidth
  variant="outlined"
  value={newBedName}
  onChange={(e) => setNewBedName(e.target.value)}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start" sx={{ color: '#9e9e9e' }}>
        {props.roomName} -
      </InputAdornment>
    ),
    sx: {
      backgroundColor: '#F5F5F5',
      borderRadius: 1,
      color: '#000000',
    },
  }}
  InputLabelProps={{ sx: { color: '#000000' } }}
/>


  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
    <Button
      onClick={() => setAddBedDialogOpen(false)}
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
      onClick={handleAddBedSubmit}
      
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
          opacity: 1, // prevents dimming
        },
      }}
    >
      Save
    </Button>
  </DialogActions>
</Dialog>

              {/* {addToRoom()} */}
              {/* {removeFromRoom()} */}
              {removeRoom()}
              {renameRoomButton()}
              <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
                      <Alert onClose={handleClose} variant="filled" severity={snackSucc ? 'success':'error'}>
                          {snackSucc && "Operation Completed Successfully"}
                          {!snackSucc && "Operation Failed"}
                      </Alert>
              </Snackbar>
              </Stack>
            </Box>
            {/* )} */}
             </Box>
   )
}
