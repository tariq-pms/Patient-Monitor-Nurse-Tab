import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Stack, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faStethoscope, faLaptopMedical, faPills, faFileMedical, faSyringe } from "@fortawesome/free-solid-svg-icons";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { TextField } from "@mui/material";

interface NotificationsProps {
  patientId: string;
  patient_resource_id: string;
  userOrganization?: string;
}

export const Notifications = ({ patient_resource_id }: NotificationsProps) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filterMode, setFilterMode] = useState<"category" | "time">("category");
  const handleClose = () => setSelectedNotification(null);
  
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const fetchWithRetry = useCallback(async (url: string, options: RequestInit, retries = 3): Promise<any> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (retries > 0) return fetchWithRetry(url, options, retries - 1);
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      return response.json();
    } catch (err) {
      if (retries > 0) return fetchWithRetry(url, options, retries - 1);
      throw err;
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchOptions: RequestInit = {
        credentials: 'omit',
        headers: {
          Authorization: `Basic ${btoa('fhiruser:change-password')}`,
        },
      };

      const [obsRes, commRes, medRes, diagRes, procRes] = await Promise.all([
        fetchWithRetry(`${import.meta.env.VITE_FHIRAPI_URL as string}/Observation?subject=${patient_resource_id}&_sort=-date&_count=20`, fetchOptions),
        fetchWithRetry(`${import.meta.env.VITE_FHIRAPI_URL as string}/Communication?subject=${patient_resource_id}&_sort=-sent&_count=20`, fetchOptions),
        fetchWithRetry(`${import.meta.env.VITE_FHIRAPI_URL as string}/MedicationRequest?subject=${patient_resource_id}&_count=20`, fetchOptions),
        fetchWithRetry(`${import.meta.env.VITE_FHIRAPI_URL as string}/DiagnosticReport?subject=${patient_resource_id}&_count=20`, fetchOptions),
        fetchWithRetry(`${import.meta.env.VITE_FHIRAPI_URL as string}/Procedure?subject=${patient_resource_id}&_count=20`, fetchOptions)
      ]);

      const obsEntries = obsRes.entry?.map((e: any) => e.resource) || [];
      const commEntries = commRes.entry?.map((e: any) => e.resource) || [];
      const medEntries = medRes.entry?.map((e: any) => e.resource) || [];
      const diagEntries = diagRes.entry?.map((e: any) => e.resource) || [];
      const procEntries = procRes.entry?.map((e: any) => e.resource) || [];
      
      const combined = [...obsEntries, ...commEntries, ...medEntries, ...diagEntries, ...procEntries].sort((a, b) => {
        const dateA = new Date(a.meta?.lastUpdated || a.effectiveDateTime || a.sent || a.authoredOn || a.issued || a.performedDateTime || 0).getTime();
        const dateB = new Date(b.meta?.lastUpdated || b.effectiveDateTime || b.sent || b.authoredOn || b.issued || b.performedDateTime || 0).getTime();
        return dateB - dateA;
      });

      setNotifications(combined);
    } catch (err) {
      console.error(err);
      setError("Failed to load past notifications.");
    } finally {
      setLoading(false);
    }
  }, [patient_resource_id, fetchWithRetry]);

  useEffect(() => {
    if (patient_resource_id) {
      loadInitialData();
    }
  }, [patient_resource_id, loadInitialData]);

  useEffect(() => {
    const socket = new WebSocket(`${import.meta.env.VITE_FHIRSOCKET_URL as string}/notification`);
    socket.onopen = () => console.log('Notification socket open successful');

    socket.onmessage = async (event) => {
      const receivedData = JSON.parse(event.data);
      const resourceType = receivedData.location?.split('/')[0];
      const resourceId = receivedData.location?.split('/')[1];

      if (!resourceType || !resourceId) return;

      if (['Observation', 'Communication', 'Device', 'MedicationRequest', 'DiagnosticReport', 'Procedure'].includes(resourceType)) {
        try {
          const fetchOptions: RequestInit = {
            credentials: 'omit',
            headers: {
              Authorization: `Basic ${btoa('fhiruser:change-password')}`,
            },
          };
          const url = `${import.meta.env.VITE_FHIRAPI_URL as string}/${receivedData.location}`;
          const data = await fetchWithRetry(url, fetchOptions);

          const subjectRef = data.subject?.reference || data.patient?.reference;
          const evPatientId = subjectRef?.split('/')[1];

          if (evPatientId === patient_resource_id) {
            setNotifications(prev => {
              // Update if exists, otherwise prepend
              const exists = prev.findIndex(item => item.id === data.id);
              if (exists >= 0) {
                const newArr = [...prev];
                newArr[exists] = data;
                return newArr;
              }
              return [data, ...prev];
            });
          }
        } catch (err) {
          console.error(`Failed to fetch event data for ${receivedData.location}`, err);
        }
      }
    };

    socket.onerror = () => console.log('Error in notification socket connection');
    return () => socket.close();
  }, [patient_resource_id, fetchWithRetry]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Observation': return <FontAwesomeIcon icon={faStethoscope} color="#1565C0" />;
      case 'Communication': return <FontAwesomeIcon icon={faBell} color="#D32F2F" />;
      case 'Device': return <FontAwesomeIcon icon={faLaptopMedical} color="#2E7D32" />;
      case 'MedicationRequest': return <FontAwesomeIcon icon={faPills} color="#9C27B0" />;
      case 'DiagnosticReport': return <FontAwesomeIcon icon={faFileMedical} color="#FF9800" />;
      case 'Procedure': return <FontAwesomeIcon icon={faSyringe} color="#00BCD4" />;
      default: return <FontAwesomeIcon icon={faBell} color="#757575" />;
    }
  };

  const getEventTitle = (item: any) => {
    if (item.resourceType === 'Observation') {
      return item.code?.text || "Observation Updated";
    }
    if (item.resourceType === 'Communication') {
      return item.payload?.[0]?.contentString || "New Communication Alert";
    }
    if (item.resourceType === 'Device') {
      return "Device Status Changed";
    }
    if (item.resourceType === 'MedicationRequest') {
      return item.medicationCodeableConcept?.text || item.medicationReference?.display || "New Medication Request";
    }
    if (item.resourceType === 'DiagnosticReport') {
      return item.code?.text || "Diagnostic Report Added";
    }
    if (item.resourceType === 'Procedure') {
      return item.code?.text || "Procedure Performed";
    }
    return "Event";
  };
const getItemDate = (item: any) => {
  return new Date(
    item.meta?.lastUpdated ||
    item.effectiveDateTime ||
    item.sent ||
    item.authoredOn ||
    item.issued ||
    item.performedDateTime ||
    0
  );
};

const filteredNotifications = notifications.filter((item) => {
  const itemDate = getItemDate(item);

  // 🔹 CATEGORY MODE
  if (filterMode === "category") {
    if (filterType !== "All" && item.resourceType !== filterType) {
      return false;
    }
  }

  // 🔹 TIME MODE
  if (filterMode === "time") {
    if (fromDate) {
      const from = new Date(fromDate);
      if (itemDate < from) return false;
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (itemDate > to) return false;
    }
  }

  return true;
});
  return (
    <Box width={'100%'} sx={{ p: 2, maxWidth: '100%', margin: '0 auto' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#124D81' }}>
         Activity Log
      </Typography>
<Box mb={2} display="flex" justifyContent="flex-end">
  <FormControl size="small" sx={{ minWidth: 200 }}>

   <Box mb={2} display="flex" gap={2} flexWrap="wrap">

  {/* CATEGORY FILTER */}
  {filterMode === "category" && (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>Category</InputLabel>
      <Select
        value={filterType}
        label="Category"
        onChange={(e) => setFilterType(e.target.value)}
      >
        <MenuItem value="All">All</MenuItem>
        <MenuItem value="Observation">Observation</MenuItem>
        <MenuItem value="Communication">Communication</MenuItem>
        <MenuItem value="Device">Device</MenuItem>
        <MenuItem value="MedicationRequest">Medication</MenuItem>
        <MenuItem value="DiagnosticReport">Diagnostic</MenuItem>
        <MenuItem value="Procedure">Procedure</MenuItem>
      </Select>
    </FormControl>
  )}

  {/* TIME FILTER */}
  {filterMode === "time" && (
    <>
      <TextField
        type="date"
        size="small"
        label="From"
        InputLabelProps={{ shrink: true }}
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />

      <TextField
        type="date"
        size="small"
        label="To"
        InputLabelProps={{ shrink: true }}
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />
    </>
  )}

</Box>
  </FormControl>
  <Box mb={2} display="flex" gap={2} alignItems="center">

  <FormControl size="small" sx={{ minWidth: 180 }}>
    <InputLabel>Filter By</InputLabel>
    <Select
      value={filterMode}
      label="Filter By"
      onChange={(e) => {
        const value = e.target.value as "category" | "time";
        setFilterMode(value);

        // 🔹 Optional reset logic
        if (value === "category") {
          setFromDate("");
          setToDate("");
        } else {
          setFilterType("All");
        }
      }}
    >
      <MenuItem value="category">Category</MenuItem>
      <MenuItem value="time">Time</MenuItem>
    </Select>
  </FormControl>

</Box>
</Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
     {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {notifications.length === 0 ? (
            <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
              No recent notifications for this baby.
            </Typography>
          ) : (
            filteredNotifications.map(item => (
              <Card 
                key={item.id} 
                onClick={() => setSelectedNotification(item)}
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  backgroundColor: isDarkMode ? theme.palette.background.paper : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: '16px !important' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ 
                      width: 40, height: 40, 
                      borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6'
                    }}>
                      {getEventIcon(item.resourceType)}
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {getEventTitle(item)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {item.resourceType} • {new Date(item.meta?.lastUpdated || item.effectiveDateTime || item.sent || item.authoredOn || item.issued || item.performedDateTime || Date.now()).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )} 

      {/* Details Dialog */}
      <Dialog 
        open={Boolean(selectedNotification)} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, backgroundColor: isDarkMode ? theme.palette.background.paper : '#FFFFFF' }
        }}
      >
        {selectedNotification && (
          <>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }}>
              <Typography variant="body1" fontWeight="bold">
                {getEventTitle(selectedNotification)}
              </Typography>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                    Event Type
                  </Typography>
                  <Typography variant="body1">{selectedNotification.resourceType}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                    Time
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedNotification.meta?.lastUpdated || selectedNotification.effectiveDateTime || selectedNotification.sent || selectedNotification.authoredOn || selectedNotification.issued || selectedNotification.performedDateTime || Date.now()).toLocaleString()}
                  </Typography>
                </Box>
                
                {/* Specific Details Based on Type */}
                {selectedNotification.resourceType === 'Observation' && (
                  <>
                    {selectedNotification.valueQuantity && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                          Value
                        </Typography>
                        <Typography variant="body1">
                          {selectedNotification.valueQuantity.value} {selectedNotification.valueQuantity.unit}
                        </Typography>
                      </Box>
                    )}
                    {selectedNotification.valueString && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                          Value
                        </Typography>
                        <Typography variant="body1">{selectedNotification.valueString}</Typography>
                      </Box>
                    )}
                    {selectedNotification.component && selectedNotification.component.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" gutterBottom>
                          Components
                        </Typography>
                        <Stack spacing={1}>
                          {selectedNotification.component.map((comp: any, i: number) => (
                            <Box key={i} sx={{ p: 1.5, bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderRadius: 2 }}>
                              <Typography variant="body2" fontWeight="600">{comp.code?.text || 'Component'}</Typography>
                              <Typography variant="body2">
                                {comp.valueQuantity ? `${comp.valueQuantity.value} ${comp.valueQuantity.unit}` : comp.valueString}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </>
                )}

                {selectedNotification.resourceType === 'Communication' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                      Message
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, p: 2, bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#FEF2F2', borderRadius: 2, color: isDarkMode ? '#FFFFFF' : '#991B1B' }}>
                      {selectedNotification.payload?.[0]?.contentString || 'No text available.'}
                    </Typography>
                  </Box>
                )}

                {selectedNotification.resourceType === 'Device' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                      Status
                    </Typography>
                    <Typography variant="body1">{selectedNotification.status || 'Unknown'}</Typography>
                  </Box>
                )}

                {selectedNotification.resourceType === 'MedicationRequest' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                      Medication
                    </Typography>
                    <Typography variant="body1">{selectedNotification.medicationCodeableConcept?.text || selectedNotification.medicationReference?.display || 'Unknown'}</Typography>
                    {selectedNotification.dosageInstruction?.[0]?.text && (
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        Dosage: {selectedNotification.dosageInstruction[0].text}
                      </Typography>
                    )}
                    {selectedNotification.status && (
                      <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                        Status: {selectedNotification.status}
                      </Typography>
                    )}
                  </Box>
                )}

                {selectedNotification.resourceType === 'DiagnosticReport' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                      Details
                    </Typography>
                    <Typography variant="body1">{selectedNotification.code?.text || 'Report'}</Typography>
                    {selectedNotification.conclusion && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Conclusion: {selectedNotification.conclusion}
                      </Typography>
                    )}
                    {selectedNotification.status && (
                      <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                        Status: {selectedNotification.status}
                      </Typography>
                    )}
                  </Box>
                )}

                {selectedNotification.resourceType === 'Procedure' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                      Procedure
                    </Typography>
                    <Typography variant="body1">{selectedNotification.code?.text || 'Unknown Procedure'}</Typography>
                    {selectedNotification.status && (
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        Status: {selectedNotification.status}
                      </Typography>
                    )}
                    {selectedNotification.outcome?.text && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Outcome: {selectedNotification.outcome.text}
                      </Typography>
                    )}
                  </Box>
                )}

              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
              <Button onClick={handleClose} variant="contained" disableElevation>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
