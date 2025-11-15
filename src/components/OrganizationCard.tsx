import React, { useEffect, useState } from 'react';
import {Alert,Button,Snackbar,Stack,Typography,IconButton,DialogContent,Dialog,DialogActions,DialogTitle, Tooltip, TableCell, TableRow, TableHead, TableBody, Table, TableContainer,  FormControl, FormControlLabel, RadioGroup, Radio,} from '@mui/material';
import Box from '@mui/material/Box';
import SettingsIcon from '@mui/icons-material/Settings';
import { CustomOkButton } from './CustomOkButton';
import { CustomNoButton } from './CustomNoButton';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
// import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
interface OrganizationCardProps {
  organizationData: {
    id: string;
    name:string
  };
  OrganizationId: string;
  OrganizationName: string; // assuming you have an OrganizationName prop
  deviceChange: () => void; // assuming you have a deviceChange prop
}


export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organizationData,
  deviceChange,
}) => {
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialog, setAddDialog] = useState(false);
  const [removeDialog, setRemoveDialog] = useState(false);
  // const [confirmDialog, setConfirmDialog] = useState(false);
  // const [isAdding, setIsAdding] = useState(true);
  const [snack, setSnack] = useState(false);
  const [snackSucc, setSnackSucc] = useState(false);
  const [miniDialog, setMiniDialog] = useState(false);
  // const [miniDialog1, setMiniDialog1] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // ✅ Fetch all devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/Device?_count=100`,
          {
            headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
          }
        );
        const data = await res.json();
        setDeviceList(data.entry || []);
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };
    fetchDevices();
  }, []);

  const filteredDevices = deviceList.filter((device) => {
    const id1 = device?.resource?.identifier?.[0]?.value || "";
    const id2 = device?.resource?.identifier?.[1]?.value || "";
    const search = searchQuery.toLowerCase();
    return id1.toLowerCase().includes(search) || id2.toLowerCase().includes(search);
  });

  const addButton = () => {
    if (selectedDevice !== null) {
      const data = {
        ...deviceList[selectedDevice].resource,
        owner: {
          reference: `Organization/${organizationData.id}`
        },
      };
  
      fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device/${deviceList[selectedDevice].resource.id}`, {
        credentials: 'omit',
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa('fhiruser:change-password'),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          // Update device list state after successful addition
          const updatedDeviceList = deviceList.filter((_device, index) => index !== selectedDevice);
          setDeviceList(updatedDeviceList);
          setSnack(true);
          setSnackSucc(true);
          deviceChange();
        } else {
          setSnack(true);
          setSnackSucc(false);
        }
      });
    }
  };
  const [selectedFrequency, setSelectedFrequency] = useState("10"); // default

  const FHIR_BASE_URL = import.meta.env.VITE_FHIRAPI_URL;
  const authHeader = "Basic " + btoa("fhiruser:change-password");
  // const removeButton = () => {
  //   if (selectedDevice !== null) {
  //     const data = { ...deviceList[selectedDevice].resource };
  //     delete data.owner;
  //     fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device/${deviceList[selectedDevice].resource.id}`, {
  //       credentials: 'omit',  
  //       method: 'PUT',
  //       body: JSON.stringify(data),
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: 'Basic ' + btoa('fhiruser:change-password'),
  //       },
  //     })
  //     .then((response) => {
  //       if (response.status === 200) {
  //         // Update device list state after successful removal
  //         const updatedDeviceList = deviceList.filter((_device, index) => index !== selectedDevice);
  //         setDeviceList(updatedDeviceList);
  //         setSnack(true);
  //         setSnackSucc(true);
  //         deviceChange();
  //       } else {
  //         setSnack(true);
  //         setSnackSucc(false);
  //       }
  //     });
  //   } 
  // };
  const handleOpenDialog = (device:any) => {
    setSelectedDevice(device);
    setSelectedFrequency(
      device.resource?.property?.find(
        (p: { type: string; }) => p.type === "data-transmission-frequency"
      )?.valueQuantity?.value?.toString() || "10"
    );
    setOpenDialog(true);
  };

  const handleSaveFrequency = async () => {
    if (!selectedDevice) return;
  
    const id = selectedDevice.resource.id;
    console.log("Fetched Device ID:", id);
  
    try {
      // 🟢 Fetch existing device resource
      const res = await fetch(`${FHIR_BASE_URL}/Device/${id}`, {
        headers: { Authorization: authHeader },
      });
  
      if (!res.ok) {
        throw new Error(`Failed to fetch device: ${res.status}`);
      }
  
      const deviceData = await res.json();
  
      // 🟣 Update frequency property (FHIR valid — valueQuantity is now an array)
      deviceData.property = [
        {
          type: {
            coding: [
              {
                system: "http://example.org/fhir/CodeSystem/device-properties",
                code: "data-transmission-frequency",
                display: "Data Transmission Frequency",
              },
            ],
          },
          valueQuantity: [
            {
              value: Number(selectedFrequency),
              unit: "minutes",
              system: "http://unitsofmeasure.org",
              code: "min",
            },
          ],
        },
      ];
  
      // 🔵 PUT update
      const updateRes = await fetch(`${FHIR_BASE_URL}/Device/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/fhir+json",
          Authorization: authHeader,
        },
        body: JSON.stringify(deviceData),
      });
  
      if (updateRes.ok) {
        // alert("✅ Frequency updated successfully!");
      } else {
        const errMsg = await updateRes.text();
        console.error("❌ Failed:", errMsg);
        // alert(`❌ Failed to update frequency: ${errMsg}`);
      }
    } catch (err) {
      console.error("Error updating frequency:", err);
    } finally {
      setOpenDialog(false);
    }
  };
  
  
  

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Manage Devices for {organizationData.name}
      </Typography>

      <Stack spacing={2} sx={{ mb: 2 }}>
  {/* 🔹 Header Row */}
  <Stack
  direction="row"
  justifyContent="flex-end"
  alignItems="center"
  sx={{ mb: 2 }}
>
  <Stack direction="row" spacing={2}>
    <Button
      variant="contained"
      onClick={() => setAddDialog(true)}
      sx={{ borderRadius: "20px", textTransform: "none" }}
    >
      Add / Move Device
    </Button>

    <Button
      variant="outlined"
      color="warning"
      onClick={() => setRemoveDialog(true)}
      sx={{ borderRadius: "20px", textTransform: "none" }}
    >
      Remove Device
    </Button>
  </Stack>
</Stack>


  {/* 🔹 Device Table */}
  <TableContainer

        sx={{
          borderRadius: "12px",
          maxHeight: "50vh",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Table >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#EEEDF1" }}>
              <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                Device Name
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                S.No
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                Mac Address (ESP)
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                Manufacturer
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                Frequency
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
               
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
  {deviceList
    .filter(
      (device) =>
        device?.resource?.owner?.reference ===
        `Organization/${organizationData.id}`
    )
    .map((device) => {
      const d = device.resource;

      // 🧠 Find the "data-transmission-frequency" property safely
      const freqProperty = d.property?.find(
        (p: { type: { coding: { code: string; }[]; }; }) =>
          p.type?.coding?.[0]?.code === "data-transmission-frequency"
      );

      const freqValue = freqProperty?.valueQuantity?.[0]?.value;
      const freqUnit = freqProperty?.valueQuantity?.[0]?.unit;

      return (
        <TableRow
          key={d.id}
          hover
          sx={{
            "&:hover": {
              backgroundColor: "#F9FBFF",
              cursor: "pointer",
            },
          }}
        >
          <TableCell sx={{ color: "#124D81" }}>
            {d.identifier?.[1]?.value || ""}
          </TableCell>

          <TableCell sx={{ color: "#124D81" }}>
            {d.serialNumber || "—"}
          </TableCell>

          <TableCell sx={{ color: "#124D81" }}>
            {d.identifier?.[0]?.value || ""}
          </TableCell>

          <TableCell
            sx={{
              color:
                d.status === "active"
                  ? "#2EB67D"
                  : d.status === "inactive"
                  ? "#FF9800"
                  : "#9BA1AE",
              fontWeight: 600,
            }}
          >
            {d.status || "Unknown"}
          </TableCell>

          <TableCell sx={{ color: "#124D81" }}>
            {d.manufacturer || "—"}
          </TableCell>

          <TableCell sx={{ color: "#124D81" }}>
            {/* 🕒 Frequency Display */}
            {freqValue ? `${freqValue} ${freqUnit}` : "Not set"}

            {/* ⚙️ Settings Button */}
           
          </TableCell>
          <TableCell sx={{ color: "#124D81" }}>
          <IconButton
              size="small"
              onClick={() => handleOpenDialog(device)}
              sx={{
                color: "#124D81",
                "&:hover": { backgroundColor: "#E7F3FF" },
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </TableCell>
      
        </TableRow>
      );
    })}

  {/* 🩶 Empty State */}
  {deviceList.filter(
    (device) =>
      device?.resource?.owner?.reference ===
      `Organization/${organizationData.id}`
  ).length === 0 && (
    <TableRow>
      <TableCell colSpan={6}>
        <Typography
          sx={{
            textAlign: "center",
            color: "#9BA1AE",
            fontWeight: 500,
            py: 3,
          }}
        >
          No devices found for this organization.
        </Typography>
      </TableCell>
    </TableRow>
  )}
</TableBody>

        </Table>
      </TableContainer>
</Stack>
<Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ color: "#124D81", fontWeight: 600 }}>
          Set Data Transmission Frequency
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <RadioGroup
              value={selectedFrequency}
              onChange={(e) => setSelectedFrequency(e.target.value)}
            >
              {["1", "5", "10", "15", "30"].map((val) => (
                <FormControlLabel
                  key={val}
                  value={val}
                  control={<Radio />}
                  label={`${val} minute${val !== "1" ? "s" : ""}`}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFrequency}>
            Save
          </Button>
        </DialogActions>
      </Dialog>


      {/* Add Device Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} fullWidth>
        <DialogTitle>Add Device to {organizationData.name}</DialogTitle>
        <Box display="flex" justifyContent="center" mb={2}>
          <TextField
            placeholder="Search available devices"
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon /> }}
          />
        </Box>
        <DialogContent>
          <Stack direction="row" flexWrap="wrap" gap={1}>
          {filteredDevices.map((device, index) => {
  // Check if the device is not associated with any organization
  const isDeviceNotAssociated = !device?.resource?.owner || !device.resource.owner.reference.startsWith('Organization/');

  if (isDeviceNotAssociated) {
    return (
      <Button key={device.resource.id} onClick={() => { console.log('Selected device in Button click:', index);setMiniDialog(true);setSelectedDevice(index);}}sx={{ width: '48%',height: '60px',justifyContent: 'center',textAlign: 'center',color: 'white',border: '0.1px solid #282828',margin: '5px'}}>
       <Tooltip title={(device.resource.identifier[1].value).toString()}>
             <Typography
    variant="subtitle1"
    component={'h2'}
  >
     <span style={{ fontSize: '90%', display: 'block' }}>
     {(device.resource.identifier[1].value).toString().split(' ').slice(0, 3).join(' ')}
    </span>
    <span style={{ fontSize: '110%', display: 'block' }}>
      {(device.resource.identifier[0].value).toString()}
    </span>
  </Typography>
  </Tooltip>
      </Button>
    );
  }

  
})}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Remove Device Dialog */}
      <Dialog open={removeDialog} onClose={() => setRemoveDialog(false)} fullWidth>
        <DialogTitle>Remove Device from {organizationData.name}</DialogTitle>
        <DialogContent>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {filteredDevices
              .filter(
                (d) => d?.resource?.owner?.reference === `Organization/${organizationData.name}`
              )
              .map((device, index) => (
                <Button
                  key={device.resource.id}
                  color="error"
                  variant="outlined"
                  sx={{ width: "48%" }}
                  onClick={() => {
                    // setIsAdding(false);
                    setSelectedDevice(index);
                    // setConfirmDialog(true);
                  }}
                >
                  {device.resource.identifier?.[0]?.value}
                </Button>
              ))}
          </Stack>
        </DialogContent>
      </Dialog>
      <Dialog open={miniDialog}onClose={() => setMiniDialog(false)}PaperProps={{style: { backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)',borderRadius: '25px',boxShadow: '0px 0px 40px 1px #404040',border: '0.4px solid #505050',height: '30%',justifyContent: 'center',textAlign: 'center',},}}>
  <DialogTitle id="responsive-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', paddingBottom: '9%' }}>
    {`Add device `}<i>{`${selectedDevice !== null ? deviceList[selectedDevice]?.resource.identifier[0].value : ''} `}</i>{`to Organization `}<i>{`${organizationData.name}`}?</i> </DialogTitle>
    <DialogActions sx={{ paddingBottom: '5%' }}>
      <Stack direction={'row'} width={'100%'} justifyContent={'space-around'}>
        <Box onClick={() => setMiniDialog(false)} sx={{ minWidth: '90px', minHeight: '45px' }}>
          <CustomNoButton text="Cancel"></CustomNoButton>
        </Box>
        <Box onClick={() => {addButton();setMiniDialog(false);}}sx={{ minWidth: '90px', minHeight: '45px' }}>
          <CustomOkButton text="Confirm"></CustomOkButton>
        </Box>
      </Stack>
    </DialogActions>
</Dialog>
      {/* Confirm Action */}
  

      <Snackbar open={snack} autoHideDuration={4000} onClose={() => setSnack(false)}>
        <Alert severity={snackSucc ? "success" : "error"}>
          {snackSucc ? "Operation Successful" : "Operation Failed"}
        </Alert>
      </Snackbar>
    </Box>
  );
};
