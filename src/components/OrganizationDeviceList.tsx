import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Snackbar,
  Stack,
  Typography,
  IconButton,
  DialogContent,
  Dialog,
  DialogActions,
  DialogTitle,
  Tooltip,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  Table,
  TableContainer,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import Box from '@mui/material/Box';
import SettingsIcon from '@mui/icons-material/Settings';
import { CustomOkButton } from './CustomOkButton';
import { CustomNoButton } from './CustomNoButton';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { ServiceDetails } from './ServiceDetails';


interface OrganizationCardProps {
  organizationData: {
    id: string;
    name: string;
  };
  OrganizationId: string;
  OrganizationName: string;
  deviceChange: () => void;
  isDialogOpened: boolean;
  handleCloseDialog: Function;
}

interface Device {
  resource: {
    id: string;
    identifier: Array<{
      value: string;
    }>;
    owner?: {
      reference: string;
    };
    serialNumber: string;
    status: string;
    manufacturer: string;
    property?: Array<any>;
  };
}

interface DeviceMetric {
  id: string;
  source?: {
    reference: string;
  };
}

export const OrganizationDeviceList: React.FC<OrganizationCardProps> = ({
  organizationData,
  deviceChange,
}) => {
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialog, setAddDialog] = useState(false);
  const [removeDialog, setRemoveDialog] = useState(false);
  const [metricsData, setMetricsData] = useState<DeviceMetric[]>([]);
  const [snack, setSnack] = useState(false);
  const [snackSucc, setSnackSucc] = useState(false);
  const [miniDialog, setMiniDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState("10");
  const [deviceMetricsMap, setDeviceMetricsMap] = useState<Record<string, string>>({});

  const FHIR_BASE_URL = import.meta.env.VITE_FHIRAPI_URL;
  const authHeader = "Basic " + btoa("fhiruser:change-password");

  // ✅ Fetch all devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch(
          `${FHIR_BASE_URL}/Device?_count=100`,
          {
            headers: {
              Authorization: authHeader,
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

  // ✅ Fetch all DeviceMetrics and map them to devices
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(
          `${FHIR_BASE_URL}/DeviceMetric?_count=100`,
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        const data = await res.json();
        const metrics: DeviceMetric[] = data.entry?.map((entry: any) => entry.resource) || [];
        setMetricsData(metrics);
        console.log(metricsData);
        
        // Create a map of device ID to DeviceMetric ID
        const map: Record<string, string> = {};
        metrics.forEach(metric => {
          if (metric.source?.reference) {
            // Extract device ID from reference (e.g., "Device/123")
            const deviceId = metric.source.reference.split('/')[1];
            if (deviceId) {
              map[deviceId] = metric.id;
            }
          }
        });
        setDeviceMetricsMap(map);
      } catch (err) {
        console.error("Error fetching metrics:", err);
      }
    };
    fetchMetrics();
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
        ...selectedDevice.resource,
        owner: {
          reference: `Organization/${organizationData.id}`
        },
      };
  
      fetch(`${FHIR_BASE_URL}/Device/${selectedDevice.resource.id}`, {
        credentials: 'omit',
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          // Update device list state after successful addition
          const updatedDeviceList = deviceList.filter((device) => 
            device.resource.id !== selectedDevice.resource.id
          );
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

  const handleOpenDialog = (device: Device) => {
    setSelectedDevice(device);
    setSelectedFrequency(
      device.resource?.property?.find(
        (p: any) => p.type === "data-transmission-frequency"
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
  
      // 🟣 Update frequency property
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
        // Update the local state
        setDeviceList(prev => prev.map(device => 
          device.resource.id === id 
            ? { ...device, resource: deviceData }
            : device
        ));
      } else {
        const errMsg = await updateRes.text();
        console.error("❌ Failed:", errMsg);
      }
    } catch (err) {
      console.error("Error updating frequency:", err);
    } finally {
      setOpenDialog(false);
    }
  };

  // Get DeviceMetric ID for the selected device
  const getDeviceMetricId = (deviceId: string): string => {
    return deviceMetricsMap[deviceId] || '';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Manage Devices for {organizationData.name}
      </Typography>

      <Stack spacing={2} sx={{ mb: 2 }}>
        {/* 🔹 Header Row */}
        <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mb: 2 }}>
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
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#EEEDF1" }}>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Device Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>S.No</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Mac Address (ESP)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Manufacturer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Frequency</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}></TableCell>
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
                    (p: any) => p.type?.coding?.[0]?.code === "data-transmission-frequency"
                  );

                  const freqValue = freqProperty?.valueQuantity?.[0]?.value;
                  const freqUnit = freqProperty?.valueQuantity?.[0]?.unit;

                  return (
                    <TableRow
                      key={d.id}
                    
                     
                    >
                        <TableCell
    onClick={() => {
      setSelectedDevice(device);
      setIsOpen(true);
    }}
    sx={{
      color: "#124D81",
      cursor: "pointer", // ← only here!
      "&:hover": { color: "#124D81",fontWeight:'bold' },
    }}
  >
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
                        {freqValue ? `${freqValue} ${freqUnit}` : "Not set"}
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
                  <TableCell colSpan={7}>
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
            {filteredDevices.map((device) => {
              // Check if the device is not associated with any organization
              const isDeviceNotAssociated = !device?.resource?.owner || 
                !device.resource.owner.reference.startsWith('Organization/');

              if (isDeviceNotAssociated) {
                return (
                  <Button
                    key={device.resource.id}
                    onClick={() => {
                      setMiniDialog(true);
                      setSelectedDevice(device);
                    }}
                    sx={{
                      width: '48%',
                      height: '60px',
                      justifyContent: 'center',
                      textAlign: 'center',
                      color: 'white',
                      border: '0.1px solid #282828',
                      margin: '5px'
                    }}
                  >
                    <Tooltip title={(device.resource.identifier[1]?.value || '').toString()}>
                      <Typography variant="subtitle1" component={'h2'}>
                        <span style={{ fontSize: '90%', display: 'block' }}>
                          {(device.resource.identifier[1]?.value || '').toString().split(' ').slice(0, 3).join(' ')}
                        </span>
                        <span style={{ fontSize: '110%', display: 'block' }}>
                          {(device.resource.identifier[0]?.value || '').toString()}
                        </span>
                      </Typography>
                    </Tooltip>
                  </Button>
                );
              }
              return null;
            })}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Remove Device Dialog */}
      <Dialog open={removeDialog} onClose={() => setRemoveDialog(false)} fullWidth>
        <DialogTitle>Remove Device from {organizationData.name}</DialogTitle>
        <DialogContent>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {deviceList
              .filter(
                (device) =>
                  device?.resource?.owner?.reference === `Organization/${organizationData.id}`
              )
              .map((device) => (
                <Button
                  key={device.resource.id}
                  color="error"
                  variant="outlined"
                  sx={{ width: "48%" }}
                  onClick={() => {
                    // Handle remove device logic here
                    console.log("Remove device:", device.resource.id);
                  }}
                >
                  {device.resource.identifier?.[0]?.value || "Unknown"}
                </Button>
              ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={miniDialog}
        onClose={() => setMiniDialog(false)}
        PaperProps={{
          style: {
            backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)',
            borderRadius: '25px',
            boxShadow: '0px 0px 40px 1px #404040',
            border: '0.4px solid #505050',
            height: '30%',
            justifyContent: 'center',
            textAlign: 'center',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', paddingBottom: '9%' }}>
          {`Add device `}
          <i>{`${selectedDevice ? selectedDevice.resource.identifier[0]?.value : ''} `}</i>
          {`to Organization `}
          <i>{`${organizationData.name}`}</i>
          ?
        </DialogTitle>
        <DialogActions sx={{ paddingBottom: '5%' }}>
          <Stack direction={'row'} width={'100%'} justifyContent={'space-around'}>
            <Box onClick={() => setMiniDialog(false)} sx={{ minWidth: '90px', minHeight: '45px' }}>
              <CustomNoButton text="Cancel"></CustomNoButton>
            </Box>
            <Box onClick={() => { addButton(); setMiniDialog(false); }} sx={{ minWidth: '90px', minHeight: '45px' }}>
              <CustomOkButton text="Confirm"></CustomOkButton>
            </Box>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Service Details Dialog */}
      <ServiceDetails
        isDialogOpened={isOpen}
        handleCloseDialog={() => {
          setIsOpen(false);
          setSelectedDevice(null);
        }}
        selectedDevice={selectedDevice}
        deviceMetricId={selectedDevice ? getDeviceMetricId(selectedDevice.resource.id) : ''}
        darkTheme={false}
      />

      <Snackbar open={snack} autoHideDuration={4000} onClose={() => setSnack(false)}>
        <Alert severity={snackSucc ? "success" : "error"}>
          {snackSucc ? "Operation Successful" : "Operation Failed"}
        </Alert>
      </Snackbar>
    </Box>
  );
};