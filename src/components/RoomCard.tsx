import { Alert, Button, Dialog, DialogActions,Menu, DialogContent, DialogContentText, DialogTitle, Select, Snackbar, Stack, Typography, MenuItem, Divider, TextField, Skeleton, ListItemText, ListItemButton, ListItem, List, Paper, TableContainer, TableRow, TableCell, TableHead, Table, TableBody, Chip, useTheme, useMediaQuery, InputAdornment, Tab, Tabs,} from '@mui/material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { FC, useEffect, useState } from 'react'
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import { CustomNoButton } from './CustomNoButton'
import { CustomOkButton } from './CustomOkButton'
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HotelIcon from '@mui/icons-material/Hotel';
import { Edit, EditAttributesSharp, EditCalendarOutlined, EditNote } from '@mui/icons-material'

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

export const RoomCard: FC<roomData> = (props) => {
    const [snackSucc, setSnackSucc] = useState(false)
    const [snack, setSnack] = useState(false)
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
            "owner": {
                "reference": ""
            },
            "location": {
                "reference": ""
            } 
        }
    }])
    const [patientList, setPatientList] = useState<Patient[]>([]);

    const [beds, setBeds] = useState<BedData[]>([])
    const [loadingBeds, setLoadingBeds] = useState(true)
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [selectedBedId, setSelectedBedId] = useState<string | null>(null);

    const [deviceChanged, setDeviceChanged] = useState(false)
    useEffect(() => {setDeviceChanged(!deviceChanged)},[props.deviceChangeToggle])
    const [renameRoom, setRenameRoom] = useState(false)

    useEffect(() => {
        fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device?_count=50`, {
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
    useEffect(() => {
      fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Patient?_count=100`, {
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
    
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
   
    const open = Boolean(anchorEl);
    
    const addNewBed = (bedName: string) => {
        const data = {
            "resourceType": "Location",
            "identifier": [{
                "value": bedName
            }],
            "status": "active",
            "name": bedName,
            "physicalType": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/location-physical-type",
                    "code": "bd",
                    "display": "Bed"
                }]
            },
            "partOf": {
                "reference": `Location/${props.roomId}`
            },
            "managingOrganization": {
                "reference": `Organization/${props.userOrganization}`
            }
        }

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
            setSnack(true)
            if (response.status === 201) {
                setSnackSucc(true)
                // Refresh beds list
                props.roomChange()
            } else {
                setSnackSucc(false)
            }
        })
    }

    // const fetchPatientAssignments = async (bedId: string) => {
    //   try {
    //     const url = `${import.meta.env.VITE_FHIRAPI_URL}/Patient?` +
    //       `_has:Patient.extension:url=http://hl7.org/fhir/StructureDefinition/patient-location` +
    //       `&_has:Patient.extension:valueReference=Location/${bedId}`;
    
    //     const response = await fetch(url, {
    //       headers: {
    //         Authorization: "Basic " + btoa("fhiruser:change-password"),
    //       },
    //     });
    
    //     if (!response.ok) throw new Error("Failed to fetch patients");
    //     const data = await response.json();
    
    //     if (!data.entry || data.entry.length === 0) return null;
    
    //     const patient = data.entry[0].resource;
    
    //     // Format patient name
    //     const name =
    //       patient.name?.[0]?.text ||
    //       `${patient.name?.[0]?.given?.[0] || "Unknown"} ${patient.name?.[0]?.family || ""}`.trim() ||
    //       patient.identifier?.[0]?.value ||
    //       "Unnamed";
    
    //     return {
    //       name,
    //       id: patient.id,
    //       addedDate: patient.meta?.lastUpdated
    //         ? new Date(patient.meta.lastUpdated).toLocaleDateString()
    //         : "Unknown date",
    //     };
    //   } catch (error) {
    //     console.error("Error fetching patient assignment:", error);
    //     return null;
    //   }
    // };
    
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
        console.log("device name",data);
        
        if (data.entry) {
          return data.entry.map((d: any) => ({
            // id: d.resource.id,
            id:d.resource.serialNumber,
            name:
              d.resource.identifier[1].value ||
             
              `Device-${d.resource.id}`,
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
              // First get all beds
              const bedData = data.entry.map((bed: any) => ({
                id: bed.resource.id,
                name: bed.resource.name || bed.resource.identifier?.[0]?.value || 'Unnamed Bed',
                status: bed.resource.status,
                type: bed.resource.physicalType?.coding?.[0]?.display || '-'
              }));
              
              const bedsWithPatientsAndDevices = await Promise.all(
                bedData.map(async (bed: BedData) => {
                  const assignment = await fetchPatientAssignments(bed.id);
                  const devices = await fetchDeviceAssignments(bed.id);
              
                  return {
                    ...bed,
                    patientName: assignment?.name || '-',
                    patientId: assignment?.id || '',
                    addedDate: assignment?.addedDate || '-',
                    devices: devices,
                  };
                })
              );
              
              setBeds(bedsWithPatientsAndDevices);
              
            }
            setLoadingBeds(false);
          })
          .catch((error) => {
            console.error("Error fetching beds:", error);
            setLoadingBeds(false);
          });
      }, [props.roomId, props.deviceChangeToggle]);
      
   
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
            "name": x,
            "managingOrganization": {
                // "reference": `Organization/18d1c76ef29-ba9f998e-83b1-4c43-bc5b-b91b572a6454`
                "reference": `Organization/${props.userOrganization}`
            }
        }
        fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location/${props.roomId}`, {
            //fetch(` https://pmsind.co.in:5000/Location?organization=${props.userOrganization}/${props.roomId}`, {
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
      value={newBedName}
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

const addButton = (index: any) => {
    let data = {};
    const device = deviceList[Number(index)].resource;
    const patientReference = device.patient.reference;

    const patientReferenceString = patientReference as unknown as string;
    const patientId = patientReferenceString.split("/")[1];

    fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Patient/${patientId}`, {
        credentials: "omit",
        headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
    })
    .then((response) => response.json())
    .then((patientData) => {
        const existingLocationIndex = patientData.extension.findIndex(
            (ext: { url: string }) => ext.url === 'http://hl7.org/fhir/StructureDefinition/patient-location'
        );

        if (existingLocationIndex !== -1) {
            patientData.extension[existingLocationIndex].valueReference.reference = `Location/${props.roomId}`;
        } else {
            patientData.extension.push({
                url: 'http://hl7.org/fhir/StructureDefinition/patient-location',
                valueReference: { reference: `Location/${props.roomId}` }
            });
        }

        const apiUrl = `${import.meta.env.VITE_FHIRAPI_URL as string}/Patient/${patientId}`;
        const requestOptions: RequestInit = {
            credentials: "omit",
            method: "PUT",
            body: JSON.stringify(patientData),
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
        };

        fetch(apiUrl, requestOptions)
        .then(response => {
            if (response.status === 200) {
                let vvtemp = { "reference": `Location/${props.roomId}` };
                data = {
                    ...device,
                    location: vvtemp
                };

                return fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device/${device.id}`, {
                    credentials: "omit",
                    method: "PUT",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Basic " + btoa("fhiruser:change-password"),
                    },
                });
            } else {
                throw new Error("Failed to update patient data");
            }
        })
        .then(deviceResponse => {
            if (deviceResponse.status === 200) {
                setSnack(true);
                setSnackSucc(true);
                setDeviceChanged(!deviceChanged);
                props.deviceChange();
                console.log("Internal add: ", device.id);

                // Send POST request to notify server of the added device
                fetch(`${import.meta.env.VITE_DEVICEDATA_URL as string}/addDevice`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ deviceId: device.id }),
                });
            } else {
                throw new Error("Failed to update device location");
            }
        })
        .catch(error => {
            console.error("Error updating locations:", error);
            setSnack(true);
            setSnackSucc(false);
        });
    })
    .catch(error => {
        console.error("Error fetching patient data:", error);
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
// const handleSave = async () => {
//   try {
//     if (!selectedPatient || !selectedDevice) {
//       alert("Please select both Patient and Device");
//       return;
//     }

//     const bedId = selectedBedId; // or props.bedId if you pass bed separately

//     // --- Update Device with Location (Bed) ---
//     const updatedDevice = {
//       ...selectedDevice,
//       resourceType: "Device",   // ✅ ensure resourceType is present
//       location: { reference: `Location/${bedId}` },
//     };

//     await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Device/${selectedDevice.id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Basic " + btoa("fhiruser:change-password"),
//       },
//       body: JSON.stringify(updatedDevice),
//     });

//     // --- Update Patient with Location Extension ---
//     const updatedPatient = {
//       ...selectedPatient,
//       resourceType: "Patient",  // ✅ ensure resourceType is present
//       extension: [
//         ...(selectedPatient.extension || []).filter(
//           (ext: any) =>
//             ext.url !== "http://hl7.org/fhir/StructureDefinition/patient-location"
//         ),
//         {
//           url: "http://hl7.org/fhir/StructureDefinition/patient-location",
//           valueReference: { reference: `Location/${bedId}` },
//         },
//       ],
//     };

//     await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Patient/${selectedPatient.id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Basic " + btoa("fhiruser:change-password"),
//       },
//       body: JSON.stringify(updatedPatient),
//     });

//     alert("Bed successfully linked with patient and device ✅");
//     props.onSave?.(); // optional callback if you want to refresh
//   } catch (error) {
//     console.error("Error saving bed mapping:", error);
//     alert("Failed to save mapping ❌");
//   }
// };


// const addButton = (index: any) => {
//     let data = {};
//     const device = deviceList[Number(index)].resource;
//     const patientReference = device.patient.reference;

//     // Ensure patientReference is a string before using split
//     const patientReferenceString = patientReference as unknown as string;

//     // Extract patient ID from the patient reference
//     const patientId = patientReferenceString.split("/")[1];
//     console.log("checking patient id in room card:", patientId);

//     // Fetch patient data first to get the existing extensions
//     fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Patient/${patientId}`, {
//         credentials: "omit",
//         headers: {
//             Authorization: "Basic " + btoa("fhiruser:change-password"),
//         },
//     })
//     .then((response) => response.json())
//     .then((patientData) => {
//         // Check if a location extension already exists
//         const existingLocationIndex = patientData.extension.findIndex(
//             (ext: { url: string }) => ext.url === 'http://hl7.org/fhir/StructureDefinition/patient-location'
//         );

//         if (existingLocationIndex !== -1) {
//             // Update the existing location extension
//             patientData.extension[existingLocationIndex].valueReference.reference = `Location/${props.roomId}`;
//         } else {
//             // Add a new location extension to the extensions array
//             patientData.extension.push({
//                 url: 'http://hl7.org/fhir/StructureDefinition/patient-location',
//                 valueReference: { reference: `Location/${props.roomId}` }
//             });
//         }

//         const apiUrl = `${import.meta.env.VITE_FHIRAPI_URL as string}/Patient/${patientId}`;
//         const requestOptions: RequestInit = {
//             credentials: "omit",
//             method: "PUT",
//             body: JSON.stringify(patientData),
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: "Basic " + btoa("fhiruser:change-password"),
//             },
//         };

//         // Send request to update patient data with new extensions
//         fetch(apiUrl, requestOptions)
//         .then(response => {
//             if (response.status === 200) {
//                 // Update the device's location
//                 let vvtemp = { "reference": `Location/${props.roomId}` };
//                 data = {
//                     ...device,
//                     location: vvtemp
//                 };

//                 return fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device/${device.id}`, {
//                     credentials: "omit",
//                     method: "PUT",
//                     body: JSON.stringify(data),
//                     headers: {
//                         "Content-Type": "application/json",
//                         Authorization: "Basic " + btoa("fhiruser:change-password"),
//                     },
//                 });
//             } else {
//                 throw new Error("Failed to update patient data");
//             }
//         })
//         .then(deviceResponse => {
//             if (deviceResponse.status === 200) {
//                 setSnack(true);
//                 setSnackSucc(true);
//                 setDeviceChanged(!deviceChanged);
//                 props.deviceChange();
//             } else {
//                 throw new Error("Failed to update device location");
//             }
//         })
//         .catch(error => {
//             console.error("Error updating locations:", error);
//             setSnack(true);
//             setSnackSucc(false);
//         });
//     })
//     .catch(error => {
//         console.error("Error fetching patient data:", error);
//         setSnack(true);
//         setSnackSucc(false);
//     });
// };

// const addButton = (index: any) => {
//     let data = {}
//     //let vvtemp = {"reference": `Location?organization=${props.userOrganization}/${props.roomId}`}
//     let vvtemp = {"reference": `Location/${props.roomId}`}
//     data = {
//         ...deviceList[Number(index)].resource,
//         location: vvtemp
//     }
//     fetch(` https://pmsind.co.in:5000/Device/${deviceList[Number(index)].resource.id}`, {
//         credentials: "omit", // send cookies and HTTP authentication information
//         method: "PUT",
//         body: JSON.stringify(data),
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: "Basic " + btoa("fhiruser:change-password"), // set HTTP basic auth header
//         },
//     })
//     .then((response) => {
//         setSnack(true)
//         if(response.status==200){setSnackSucc(true);setDeviceChanged(!deviceChanged);props.deviceChange()}
//         else{setSnackSucc(false)}
//     })
// }

    // const removeButton = (index: number) => {
    //     // Get the device object from the list
    //     const device = deviceList[Number(index)].resource;
      
    //     // Create a new object without the 'location' property
    //     const { location, ...data } = device;
      
    //     // Define the URL and request options
    //     const apiUrl = ` ${import.meta.env.VITE_FHIRAPI_URL as string}/Device/${device.id}`;
    //     const requestOptions: RequestInit = {
    //       credentials: "omit",
    //       method: "PUT",
    //       body: JSON.stringify(data),
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: "Basic " + btoa("fhiruser:change-password"),
    //       },
    //     };
      
    //     // Send the PUT request
    //     fetch(apiUrl, requestOptions)
    //       .then((response) => {
    //         setSnack(true);
    //         if (response.status === 200) {
    //           setSnackSucc(true);
    //           setDeviceChanged(!deviceChanged);
    //         } else {
    //           setSnackSucc(false);
    //         }
    //       });
    //   };

    const handleSave = async () => {
      try {
        if (!selectedPatient || !selectedDevice) {
          alert("Please select both Patient and Device");
          return;
        }
    
        const bedId = selectedBedId; // or props.bedId if passed separately
    
        // --- Update Device with Location (Bed) ---
        const updatedDevice = {
          ...selectedDevice,
          resourceType: "Device", // ✅ ensure resourceType is present
          location: { reference: `Location/${bedId}` },
        };
    
        await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Device/${selectedDevice.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
          body: JSON.stringify(updatedDevice),
        });
    
        // --- Create Encounter linking Patient to Bed ---
        const encounter = {
          resourceType: "Encounter",
          status: "in-progress",
          class: {
            system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            code: "IMP", // Inpatient encounter
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
    
        await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Encounter`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
          body: JSON.stringify(encounter),
        });
    
        alert("Bed successfully linked with patient and device ✅");
        props.onSave?.(); // optional callback to refresh
      } catch (error) {
        console.error("Error saving bed mapping:", error);
        alert("Failed to save mapping ❌");
      }
    };
    

    const [deleteDevice, setDeleteDevice] = useState(false)
    const [deleteRoom, setDeleteRoom] = useState(false)

    const removeRoomButton = () => {
        console.log("Called")
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
    // const removeFromRoom = () => {
    //     return (
    //         <Dialog
    //         open={deleteDevice}
    //         onClose={() => setDeleteDevice(false)}
    //         aria-labelledby="responsive-dialog-title"
    //         PaperProps={{style:{borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)' , minWidth:'400px', minHeight:'200px'}}}
    //     >
    //         <DialogTitle sx={{textAlign:"center", fontWeight:'bold', paddingTop:'6%'}}>
    //         {`Remove device from ${props.roomName}`}
    //         </DialogTitle>
    //         <DialogContent dividers sx={{ borderColor: '#ccc',display:'flex',flexWrap: "wrap",textAlign:"center", marginBottom:'auto' }}>
    //         <Stack width={'100%'} display={'flex'} direction={'row'} flexWrap={'wrap'}
    //             >
    //             {deviceList.map((device, index) => {
    //                     if(device?.resource?.location?.reference.split("/")[1] == props.roomId){
    //                         return(
    //                             <Button onClick={() => {setMiniDialog(true); setSelectedDevice(index)}} sx={{width:'48%', height:'60px', justifyContent:'center', textAlign:'center', color:'white', border:'0.1px solid #282828',margin:'5px'}}>                                   
    //                                 <Typography variant="subtitle1" component={"h2"} sx={{marginRight:'auto', marginTop:'auto', marginBottom:'auto'}}>
    //                              {(device.resource.identifier[1].value).toString() + ' ' + (device.resource.identifier[0].value).toString()}
    //                             </Typography>
    //                             </Button>
    //                         )
    //                     }
    //             })}
    //             </Stack>
    //         </DialogContent>
    //         <DialogActions>
    //         </DialogActions>
    //         <Dialog
    //             open={miniDialog}
    //             onClose={() => setMiniDialog(false)}
    //             PaperProps={{style:{ minWidth:'500px',
    //              backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', height:'20%', justifyContent:'center', textAlign:'center'}}}
    //         >
    //             <DialogTitle id="responsive-dialog-title" sx={{textAlign:"center", fontWeight:'bold', padding:'5%'}}>
    //             {`Remove device`}
    //             </DialogTitle>
    //             <DialogContent  dividers sx={{ borderColor: '#ccc'}}><i>{`${deviceList[selectedDevice].resource.identifier[0].value} `}</i>{`from room `}<i>{`${props.roomName}`}?</i></DialogContent>
    //             <DialogActions sx={{paddingBottom:'5%'}}>
    //                 <Stack direction={'row'} width={'100%'} justifyContent={'space-around'}>
    //                 <Box onClick={() => {setMiniDialog(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomNoButton text="Cancel"></CustomNoButton></Box>
    //                 <Box onClick={() => {removeButton(selectedDevice); setMiniDialog(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomOkButton text="Confirm"></CustomOkButton></Box>
    //                 </Stack>
    //             </DialogActions>
    //         </Dialog>
    //     </Dialog>
    //     )
    // }
    const [miniDialog, setMiniDialog] = useState(false)
    const [selectedDevice, setSelectedDevice] = useState<any>(null)
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    
//     const addToRoom = () => {
       
//         return (
//             <Dialog
//             open={open}
//             onClose={() => setOpen(false)}
//             scroll='paper'
//             PaperProps={{style:{borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundImage: props.darkTheme?'linear-gradient(to bottom, #111522, #111522, #111522)':'linear-gradient(to bottom,  #FFFFFF,  #FFFFFF,  #FFFFFF)', minWidth:'400px', minHeight:'200px'}}} // borderRadius:'3%', boxShadow: `0px 0px 20px 10px #7B7B7B`, border:'1px solid #7B7B7B
//  >
//             <DialogTitle id="responsive-dialog-title" sx={{textAlign:"center", fontWeight:'bold', padding:'9%'}} color={props.darkTheme?'white':'#2F3D4A'}>
//             {`Add device to ${props.roomName}`}
            
//             </DialogTitle>
//             <DialogContent  dividers  sx={{borderColor: '#ccc',display:'flex',flexWrap: "wrap",textAlign:"center", marginBottom:'auto', paddingBottom:'9%'}} >
//                 <Stack width={'100%'} display={'flex'} direction={'row'} flexWrap={'wrap'}
//                 >
//                 {deviceList.map((device, index) => {
//                      if(device?.resource?.owner?.reference === `Organization/${props.userOrganization}` && device?.resource?.location?.reference.split("/")[1] != props.roomId){
//                         //changed if(device?.resource?.location?.reference.split("/")[1] != props.roomId){
//                             return(
//                                     <Button onClick={() => {setMiniDialog(true); setSelectedDevice(index)}} sx={{width:'48%', height:'60px', justifyContent:'center', textAlign:'center', color:props.darkTheme?'white':'#2F3D4A', border:'0.1px solid #282828',margin:'5px'}}>
//                                         <Typography variant="subtitle2" component={"h2"}>
//                                          {(device.resource.identifier[1].value).toString() + ' ' + (device.resource.identifier[0].value).toString()}
//                                          {/* changed the identifier to display the device name and mac address */}
//                                         </Typography>
//                                     </Button>
//                             )
//                 }
//                     })}
        

//                 </Stack>
//             </DialogContent>
//             <Dialog
//                 open={miniDialog}
//                 onClose={() => setMiniDialog(false)}
//                 PaperProps={{style:{backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', height:'20%', justifyContent:'center', textAlign:'center'}}}>
//                 <DialogTitle id="responsive-dialog-title" sx={{textAlign:"center", fontWeight:'bold', paddingBottom:'9%'}}>
//                     {`Shift device `}<i>{`${deviceList[selectedDevice].resource.identifier[0].value} `}</i>{`to room `}<i>{`${props.roomName}`}?</i>
//                 </DialogTitle>
//                 <DialogActions sx={{paddingBottom:'5%'}}>
//                     <Stack direction={'row'} width={'100%'} justifyContent={'space-around'}>    
//                     <Box onClick={() => {setMiniDialog(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomNoButton text="Cancel"></CustomNoButton></Box>
//                     <Box onClick={() => {addButton(selectedDevice); setMiniDialog(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomOkButton text="Confirm"></CustomOkButton></Box>
//                     </Stack>
                    
//                 </DialogActions>
//             </Dialog>
//         </Dialog>
        
//         )
//   }
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
  
      return () => clearTimeout(timer);
    }, []);
   
    const [bedDialogOpen, setBedDialogOpen] = useState(false);
// const [selectedBed, setSelectedBed] = useState<any>(null);

const handleAddBedSubmit = () => {
  if (newBedName.trim()) {
    const fullBedName = `${props.roomName} - ${newBedName.trim()}`;
    addNewBed(fullBedName);
    setAddBedDialogOpen(false);
    setNewBedName("");
  }
};

// const handleDischargePatient = async (bedId: string, patientId: string) => {
//     if (!patientId || patientId === '') return;
      
//       try {
//           // Find and update the active encounter
//           const encountersResponse = await fetch(
//             `${import.meta.env.VITE_FHIRAPI_URL}/Encounter?location=${bedId}&status=in-progress&subject=Patient/${patientId}`,
//             {
//               headers: {
//                 Authorization: "Basic " + btoa("fhiruser:change-password"),
//               },
//             }
//           );
      
//           if (!encountersResponse.ok) throw new Error("Failed to fetch encounters");
      
//           const encountersData = await encountersResponse.json();
          
//           if (!encountersData.entry || encountersData.entry.length === 0) {
//             throw new Error("No active encounter found");
//           }
      
//           const encounter = encountersData.entry[0].resource;
          
//           // Update encounter status to finished
//           const updatedEncounter = {
//             ...encounter,
//             status: "finished",
//             period: {
//               ...encounter.period,
//               end: new Date().toISOString()
//             }
//           };
      
//           const updateResponse = await fetch(
//             `${import.meta.env.VITE_FHIRAPI_URL}/Encounter/${encounter.id}`,
//             {
//               method: "PUT",
//               headers: {
//                 "Content-Type": "application/fhir+json",
//                 Authorization: "Basic " + btoa("fhiruser:change-password"),
//               },
//               body: JSON.stringify(updatedEncounter)
//             }
//           );
      
//           if (!updateResponse.ok) throw new Error("Failed to update encounter");
      
//           // Refresh bed data
//           setBeds(prev => prev.map(bed => 
//             bed.id === bedId 
//               ? { ...bed, patientName: '-', patientId: '', addedDate: '-' } 
//               : bed
//           ));
      
//           // Show success message
//           // You can use your existing snackbar system here
//           console.log("Patient discharged successfully");
//         } catch (error) {
//           console.error("Error discharging patient:", error);
//           // Show error message
//         }
//       };
  const [open1, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const handleOpen = () => setOpen(true);
  const handleClose1 = () => setOpen(false);

  return (
      <Box>
        {/* {loading ? (
       <Box sx={{ p: 2 }}>
       <Skeleton
         animation="pulse"
         variant="rectangular"
         width="100%"
         height={60}
         sx={{
           borderRadius: '12px',
           backgroundColor: props.darkTheme ? '#444' : '#F5F5F5',
           mb: 1,
         }}
       />
       <Skeleton
         animation="pulse"
         variant="rectangular"
         width="100%"
         height={60}
         sx={{
           borderRadius: '12px',
           backgroundColor: props.darkTheme ? '#444' : '#F5F5F5',
         }}
       />
     </Box>
     
       
        
        ) : (
         */}
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
            <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1 }} />
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
                    {/* <TableCell sx={{ color: props.darkTheme ? '#FFF' : 'black' }}>{bed.addedDate}</TableCell> */}
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
                   
                    <TableCell >
                      {/* {bed.patientName !== '-' && ( */}
                      <IconButton
  sx={{ color: props.darkTheme ? "white" : "grey" }}
  onClick={() => {
    setSelectedBedId(bed.id);  // ✅ store bed resource id
    handleOpen();              // open the dialog
  }}
>
        <EditNote />
      </IconButton>
                      {/* )} */}
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
             .filter(
               (patient) =>
                 patient.managingOrganization?.reference === `Organization/${props.userOrganization}` &&
                 patient.extension?.find(
                   (ext: any) =>
                     ext.url === "http://hl7.org/fhir/StructureDefinition/patient-location" &&
                     ext.valueReference?.reference.split("/")[1] !== props.roomId
                 )
             )
             .map((patient, index) => (
              <Button
              key={patient.id}
              onClick={() => {
                setSelectedPatient(patient);   // ✅ store clicked patient
                setMiniDialog(true);
                setSelectedDevice(index);
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
                {patient.name?.[0]?.text ||
                  `${patient.identifier?.[0]?.value || ""} ${patient.identifier?.[1]?.value || ""}`}
              </Typography>
            </Button>
            
             ))}
         </Box>
          )}
          {tab === 1 && (
            <Box sx={{ mt: 2 }}>
                <Stack width={'100%'} display={'flex'} direction={'row'} flexWrap={'wrap'}
                >
                {deviceList.map((device, index) => {
                     if(device?.resource?.owner?.reference === `Organization/${props.userOrganization}` && device?.resource?.location?.reference.split("/")[1] != props.roomId){
                        //changed if(device?.resource?.location?.reference.split("/")[1] != props.roomId){
                            return(
                                    <Button onClick={() => { 
                                      setMiniDialog(true); 
                                      setSelectedDevice(device.resource);   // ✅ save resource object
                                    }} sx={{width:'48%', height:'60px', justifyContent:'center', textAlign:'center', color:props.darkTheme?'white':'#2F3D4A',backgroundColor:props.darkTheme?'#2F3D4A':'white', border:'0.1px solid #282828',margin:'5px'}}>
                                        <Typography variant="subtitle2" component={"h2"}>
                                         {(device.resource.identifier[1].value).toString() + ' ' + (device.resource.identifier[0].value).toString()}
                                         {/* changed the identifier to display the device name and mac address */}
                                        </Typography>
                                    </Button>
                            )
                }
                    })}
        

                </Stack>
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
  onClick= {() => {
    handleSave()
  } }
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

// import { 
//     Alert, Button, Dialog, DialogActions, Menu, DialogContent, DialogContentText, 
//     DialogTitle, Snackbar, Stack, Typography, Divider, TextField, Skeleton, 
//     ListItemText, ListItemButton, ListItem, List, Accordion, AccordionSummary, 
//     AccordionDetails, Chip 
//   } from '@mui/material'
//   import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
//   import Box from '@mui/material/Box'
//   import Card from '@mui/material/Card'
//   import CardContent from '@mui/material/CardContent'
//   import { FC, useEffect, useState } from 'react'
//   import SettingsIcon from '@mui/icons-material/Settings';
//   import IconButton from '@mui/material/IconButton';
//   import { CustomNoButton } from './CustomNoButton'
//   import { CustomOkButton } from './CustomOkButton'
//   import AddIcon from '@mui/icons-material/Add';
  
//   export interface roomData {
//       roomName: string;
//       roomId: string;
//       roomChange: Function;
//       deviceChange: Function;
//       deviceChangeToggle: Boolean;
//       userOrganization:string;
//       darkTheme:boolean;
//       onBedClick?: (bedId: string, bedName: string) => void; // Add this prop
//   }
  
//   interface BedData {
//       id: string;
//       name: string;
//       status: string;
//   }
  
//   export const RoomCard: FC<roomData> = (props) => {
//       const [snackSucc, setSnackSucc] = useState(false)
//       const [snack, setSnack] = useState(false)
//       const [expanded, setExpanded] = useState(false); // Accordion state
      
//       const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
//           console.log(event)
//           if (reason === 'clickaway') {
//             return;
//           }
//           setSnack(false);
//       }; 
      
//       const [beds, setBeds] = useState<BedData[]>([])
//       const [loadingBeds, setLoadingBeds] = useState(true)
//       const [renameRoom, setRenameRoom] = useState(false)
//       const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
      
//       const handleClose1 = () => {
//           setAnchorEl(null);
//       };
      
//       const open1 = Boolean(anchorEl);
      
//       const addNewBed = (bedName: string) => {
//           const data = {
//               "resourceType": "Location",
//               "identifier": [{
//                   "value": bedName
//               }],
//               "status": "active",
//               "name": bedName,
//               "physicalType": {
//                   "coding": [{
//                       "system": "http://terminology.hl7.org/CodeSystem/location-physical-type",
//                       "code": "bd",
//                       "display": "Bed"
//                   }]
//               },
//               "partOf": {
//                   "reference": `Location/${props.roomId}`
//               },
//               "managingOrganization": {
//                   "reference": `Organization/${props.userOrganization}`
//               }
//           }
  
//           fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location`, {
//               credentials: "omit",
//               method: "POST",
//               body: JSON.stringify(data),
//               headers: {
//                   "Content-Type": "application/json",
//                   Authorization: "Basic " + btoa("fhiruser:change-password"),
//               },
//           })
//           .then((response) => {
//               setSnack(true)
//               if (response.status === 201) {
//                   setSnackSucc(true)
//                   // Refresh beds list
//                   props.roomChange()
//               } else {
//                   setSnackSucc(false)
//               }
//           })
//       }
      
//       useEffect(() => {
//           setLoadingBeds(true)
//           fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location?partof=${props.roomId}`, {
//               credentials: "omit",
//               headers: {
//                   Authorization: "Basic " + btoa("fhiruser:change-password"),
//               },
//           })
//           .then((response) => response.json())
//           .then((data) => {
//               if (data.entry) {
//                   const bedData = data.entry.map((bed: any) => ({
//                       id: bed.resource.id,
//                       name: bed.resource.name || bed.resource.identifier?.[0]?.value || 'Unnamed Bed',
//                       status: bed.resource.status
//                   }))
//                   setBeds(bedData)
//               }
//               setLoadingBeds(false)
//           })
//           .catch(() => setLoadingBeds(false))
//       }, [props.roomId, props.deviceChangeToggle])
      
//       const handleClick1 = (event: React.MouseEvent<HTMLElement>) => {
//           event.stopPropagation(); // Prevent accordion toggle when clicking settings
//           setAnchorEl(event.currentTarget);
//       };
      
//       const renameButton = (x: string) => {
//           let data = {
//               "resourceType": "Location",
//               "id": props.roomId,
//               "identifier": [
//                   {
//                       "value": x
//                   }
//               ],
//               "status": "suspended",
//               "name": x,
//               "managingOrganization": {
//                   "reference": `Organization/${props.userOrganization}`
//               }
//           }
//           fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location/${props.roomId}`, {
//               credentials: "omit",
//               method: "PUT",
//               body: JSON.stringify(data),
//               headers: {
//                   "Content-Type": "application/json",
//                   Authorization: "Basic " + btoa("fhiruser:change-password"),
//               },
//           })
//           .then((response) => {
//               console.log(response.status)
//               setSnack(true)
//               if(response.status==200){setSnackSucc(true); props.roomChange()}
//               else{setSnackSucc(false)}
//           })
//       }
      
//       const [renameRoomName, setRenameRoomName] = useState("")
//       const [addBedDialogOpen, setAddBedDialogOpen] = useState(false)
//       const [newBedName, setNewBedName] = useState("")
      
//       const renameRoomButton = () => {
//           return (
//               <Dialog 
//                   open={renameRoom}
//                   onClose={() => setRenameRoom(false)}
//                   aria-labelledby="responsive-dialog-title"
//                   PaperProps={{style:{backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', justifyContent:'center', width:'400px',textAlign:'center', minHeight:'200px'}}}
//               >
//                   <DialogTitle id="responsive-dialog-title">
//                   {`Rename ${props.roomName}?`}
//                   </DialogTitle>
//                   <DialogContent>
//                   <TextField id="standard-basic" label="Enter the new Room Name" variant="standard" onChange={(e) => {setRenameRoomName(e.target.value)}} />
//                   </DialogContent>
//                   <DialogActions sx={{width:'90%'}}>
//                       <Stack direction={'row'} width={'100%'} justifyContent={'space-evenly'} paddingBottom={'5%'} paddingLeft={'5%'}>
//                       <Box onClick={() => {setRenameRoom(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomNoButton text="Cancel"></CustomNoButton></Box>
//                       <Box onClick={() => {renameButton(renameRoomName); setRenameRoom(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomOkButton text="Rename"></CustomOkButton></Box>
//                       </Stack>  
//                   </DialogActions>
//               </Dialog>
//           )
//       }
  
//       const [deleteRoom, setDeleteRoom] = useState(false)
//       const removeRoomButton = () => {
//           console.log("Called")
//           fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location/${props.roomId}`, {
//               credentials: "omit",
//               method: "DELETE",
//               headers: {
//                   "Content-Type": "application/json",
//                   Authorization: "Basic " + btoa("fhiruser:change-password"),
//               },
//           })
//           .then((response) => {
//               console.log(response.status)
//               setSnack(true)
//               if(response.status==200){setSnackSucc(true);props.roomChange()}
//               else{setSnackSucc(false)}
//           })
//           .then((data) => {console.log(data)})
//       }
      
//       const removeRoom = () => {
//           return (
//               <Dialog
//                   open={deleteRoom}
//                   aria-labelledby="responsive-dialog-title"
//                   PaperProps={{style:{backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', justifyContent:'center', width:'400px',textAlign:'center', minHeight:'200px'}}}
//               >
//                   <DialogTitle id="responsive-dialog-title">
//                   {`Remove ${props.roomName}?`}
//                   </DialogTitle>
//                   <DialogContent>
//                       <DialogContentText>
//                       Are you sure you want to remove {props.roomName}?
//                   </DialogContentText>
//                   </DialogContent>
//                   <DialogActions sx={{width:'90%'}}>
//                           <Stack direction={'row'} width={'100%'} justifyContent={'space-evenly'} paddingBottom={'5%'} paddingLeft={'5%'}>
//                           <Box onClick={() => {setDeleteRoom(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomNoButton text="Cancel"></CustomNoButton></Box>
//                           <Box onClick={() => {removeRoomButton(); setDeleteRoom(false)}} sx={{minWidth:'90px', minHeight:'45px'}}><CustomOkButton text="Delete"></CustomOkButton></Box>
//                           </Stack>  
//                       </DialogActions>
//               </Dialog>
//           )
//       }
     
//       const [loading, setLoading] = useState(true);
//       useEffect(() => {
//           const timer = setTimeout(() => {
//             setLoading(false);
//           }, 2000);
//           return () => clearTimeout(timer);
//       }, []);
      
//       const handleAddBedSubmit = () => {
//           if (newBedName.trim()) {
//               addNewBed(newBedName)
//               setAddBedDialogOpen(false)
//               setNewBedName("")
//           }
//       }
      
//       const handleBedClick = (bedId: string, bedName: string) => {
//           if (props.onBedClick) {
//               props.onBedClick(bedId, bedName);
//           }
//       }
  
//       return (
//           <Box>
//               {loading ? (
//                   <Skeleton animation="wave" variant="rectangular" width={"350px"} height={"280px"} sx={{borderRadius:"25px"}} />
//               ) : (
//                   <Accordion 
//                       expanded={expanded}
//                       onChange={() => setExpanded(!expanded)}
//                       sx={{
//                           width: '350px',
//                           borderRadius: '25px !important',
//                           overflow: 'hidden',
//                           background: 'transparent',
//                           border: `1px solid ${props.darkTheme ? '#444' : '#ddd'}`,
//                           boxShadow: 'none',
//                           '&:before': {
//                               display: 'none',
//                           },
//                           mb: 2
//                       }}
//                   >
//                       <AccordionSummary
//                           expandIcon={<ExpandMoreIcon sx={{ color: props.darkTheme ? 'white' : '#124D81' }} />}
//                           aria-controls="panel1bh-content"
//                           id="panel1bh-header"
//                           sx={{
//                               backgroundColor: props.darkTheme ? '#1A1A1A' : '#f5f5f5',
//                               '&:hover': {
//                                   backgroundColor: props.darkTheme ? '#2A2A2A' : '#eeeeee',
//                               },
//                           }}
//                       >
//                           <Stack direction="row" alignItems="center" width="100%">
//                               <Typography sx={{ flexShrink: 0, color: props.darkTheme ? 'white' : '#124D81', fontWeight: 'bold' }}>
//                                   {props.roomName}
//                               </Typography>
//                               <Box sx={{ ml: 'auto' }}>
//                                   <IconButton 
//                                       onClick={handleClick1}
//                                       sx={{ color: props.darkTheme ? 'white' : '#124D81' }}
//                                   >
//                                       <SettingsIcon />
//                                   </IconButton>
//                                   <Menu 
//                                       id="demo-positioned-menu" 
//                                       aria-labelledby="demo-positioned-button" 
//                                       anchorEl={anchorEl} 
//                                       open={open1} 
//                                       onClose={handleClose1} 
//                                       anchorOrigin={{vertical: 'top', horizontal: 'right'}}  
//                                       PaperProps={{style:{backgroundImage:'linear-gradient(to bottom, #3C4661, #3C4661, #3C4661)', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', justifyContent:'center', textAlign:'center'}}} 
//                                       MenuListProps={{sx:{py:0}}}
//                                   >
//                                       <Stack divider={<Divider sx={{backgroundColor:''}} flexItem />}>
//                                           <Button onClick={() => {setRenameRoom(true); handleClose1();}} sx={{color:'white', padding:'5%'}}>
//                                               <Typography variant='caption' textTransform={'capitalize'}>Rename</Typography>
//                                           </Button>
//                                           <Button onClick={() => {setDeleteRoom(true); handleClose1();}} sx={{backgroundColor:'#E48227',color:'white', paddingTop:'5%', paddingBottom:'5%'}}>
//                                               <Typography variant='caption' textTransform={'capitalize'}>Delete Room</Typography>
//                                           </Button>
//                                       </Stack>
//                                   </Menu>
//                               </Box>
//                           </Stack>
//                       </AccordionSummary>
//                       <AccordionDetails sx={{ backgroundColor: props.darkTheme ? '#1E1E1E' : '#fafafa' }}>
//                           {/* Beds Section */}
//                           <Box sx={{ mt: 1 }}>
//                               <Typography variant="subtitle1" sx={{ 
//                                   color: props.darkTheme ? 'white' : '#124D81',
//                                   fontWeight: 'bold',
//                                   textAlign: 'left',
//                                   pl: 1,
//                                   mb: 1
//                               }}>
//                                   Beds
//                               </Typography>
                              
//                               {loadingBeds ? (
//                                   <Box sx={{ p: 1 }}>
//                                       <Skeleton variant="rectangular" width="100%" height={60} />
//                                       <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1 }} />
//                                   </Box>
//                               ) : (
//                                   <List dense sx={{ 
//                                       maxHeight: 200, 
//                                       overflow: 'auto',
//                                       border: props.darkTheme ? '1px solid #444' : '1px solid #ddd',
//                                       borderRadius: 1,
//                                       mb: 1
//                                   }}>
//                                       {beds.length > 0 ? (
//                                           beds.map((bed) => (
//                                               <ListItem key={bed.id} disablePadding>
//                                                   <ListItemButton onClick={() => handleBedClick(bed.id, bed.name)}>
//                                                       <ListItemText 
//                                                           primary={bed.name} 
//                                                           sx={{
//                                                               color: props.darkTheme ? 'white' : 'text.primary',
//                                                           }}
//                                                       />
//                                                       <Chip 
//                                                           label={bed.status} 
//                                                           size="small"
//                                                           color={bed.status === 'active' ? 'success' : 'error'}
//                                                       />
//                                                   </ListItemButton>
//                                               </ListItem>
//                                           ))
//                                       ) : (
//                                           <ListItem>
//                                               <ListItemText 
//                                                   primary="No beds in this room" 
//                                                   sx={{ color: props.darkTheme ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}
//                                               />
//                                           </ListItem>
//                                       )}
//                                   </List>
//                               )}
                              
//                               <Button 
//                                   variant="outlined"
//                                   startIcon={<AddIcon />}
//                                   onClick={(e) => {
//                                       e.stopPropagation();
//                                       setAddBedDialogOpen(true);
//                                   }}
//                                   sx={{
//                                       mt: 1,
//                                       borderRadius: '25px',
//                                       color: props.darkTheme ? 'white' : '#124D81',
//                                       borderColor: props.darkTheme ? 'white' : '#124D81',
//                                       '&:hover': {
//                                           borderColor: props.darkTheme ? '#2BA0E0' : '#0d3a63'
//                                       }
//                                   }}
//                               >
//                                   Add Bed
//                               </Button>
//                           </Box>
//                       </AccordionDetails>
                      
//                       <Dialog
//                           open={addBedDialogOpen}
//                           onClose={() => setAddBedDialogOpen(false)}
//                           aria-labelledby="add-bed-dialog-title"
//                           PaperProps={{
//                               style: {
//                                   borderRadius: '40px', 
//                                   boxShadow: `0px 0px 40px 1px #404040`, 
//                                   border: '0.4px solid #505050', 
//                                   backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)', 
//                                   minWidth: '400px', 
//                                   minHeight: '250px', 
//                                   textAlign: 'center'
//                               }
//                           }}
//                       >
//                           <DialogTitle sx={{textAlign: "center", fontWeight: 'bold', paddingTop: '9%'}}>
//                               {"Add New Bed"}
//                           </DialogTitle>
//                           <DialogContent>
//                               <TextField 
//                                   autoFocus
//                                   margin="dense"
//                                   id="bed-name"
//                                   label="Bed Name"
//                                   type="text"
//                                   fullWidth
//                                   variant="standard"
//                                   value={newBedName}
//                                   onChange={(e) => setNewBedName(e.target.value)}
//                                   sx={{width: '90%'}} 
//                               />
//                           </DialogContent>
//                           <DialogActions>
//                               <Stack direction={'row'} width={'100%'} justifyContent={'space-around'} sx={{marginBottom: '7%'}}>
//                                   <Box onClick={() => setAddBedDialogOpen(false)}>
//                                       <CustomNoButton text="Cancel" />
//                                   </Box>
//                                   <Box onClick={handleAddBedSubmit}>
//                                       <CustomOkButton text="Confirm" />
//                                   </Box>
//                               </Stack>     
//                           </DialogActions>
//                       </Dialog>
                      
//                       {removeRoom()}
//                       {renameRoomButton()}
//                       <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
//                           <Alert onClose={handleClose} variant="filled" severity={snackSucc ? 'success':'error'}>
//                               {snackSucc && "Operation Completed Successfully"}
//                               {!snackSucc && "Operation Failed"}
//                           </Alert>
//                       </Snackbar>
//                   </Accordion>
//               )}
//           </Box>
//       )
//   }