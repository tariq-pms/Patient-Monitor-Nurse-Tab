import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar, Stack, Typography, Skeleton, Divider } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import DevicesIcon from '@mui/icons-material/Devices';

interface ServiceCardProps {
  organizationData: {
    id: string;
    name: string;
    location?: string;  // Assuming you have location data
    contact?: string;   // Assuming you have contact information
    serviceStatus?: string;  // Assuming you have service status information
  };
  darkTheme: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  organizationData,
  darkTheme,
}) => {
  const [snackSucc] = useState(false);
  const [snack, setSnack] = useState(false);
  const [controlColor, setControlColor] = useState('grey');
  const [loading, setLoading] = useState(true);
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [deviceStatus, setDeviceStatus] = useState('Normal');
  const [criticalDeviceCount, setCriticalDeviceCount] = useState(0);
  

  const navigate = useNavigate();

  const handleCloseSnackbar = () => {
    setSnack(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch devices associated with the current organization
        const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device?organization=${organizationData.id}`, {
          headers: {
            Authorization: 'Basic ' + btoa('fhiruser:change-password'),
          },
        });
        const data = await response.json();
        const devices = data.entry || [];

        setDeviceList(devices);

        let criticalAlarmFound = false;
        let criticalCount = 0;

        // Iterate over devices and check their metrics
        for (const device of devices) {
          const deviceId = device.resource.id;
          
          const deviceMetricResponse = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/DeviceMetric?source=${deviceId}`, {
            headers: {
              Authorization: 'Basic ' + btoa('fhiruser:change-password'),
            },
          });
          const deviceMetricData = await deviceMetricResponse.json();
          const metrics = deviceMetricData.entry || [];

          for (const metric of metrics) {
            const isAlarmMetric = metric.resource.type.coding.some((coding: any) => coding.code === 'alarm');

            if (isAlarmMetric) {
              const criticalAlarm = metric.resource.extension?.some((ext: any) =>
                [56, 46, 45, 27, 23, 10].includes(ext.valueQuantity?.value)
              );

              if (criticalAlarm) {
                criticalAlarmFound = true;
                criticalCount += 1;
              }
            }
          }
        }

        // Update control color based on critical alarm and count
        setCriticalDeviceCount(criticalCount);

        if (criticalAlarmFound) {
          setControlColor('red');
          setDeviceStatus('Action Needed');
        } else {
          setControlColor( 'grey');
          setDeviceStatus('Normal');
        }

        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching devices or metrics:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [darkTheme, organizationData.id]);

  const handleCardClick = () => {
    navigate(`/service-device/${organizationData.id}`, {
      state: {
        deviceList,
        organizationId: organizationData.id,
      },
    });
  };

  return (
    <Box>
      {loading ? (
        <Skeleton animation="wave" variant="rectangular" width={'320px'} height={'280px'} sx={{ borderRadius: '25px' }} />
      ) : (
        <Card
  elevation={5}
  onClick={handleCardClick}
  style={{
    width: '320px',
    boxShadow: 'none',
    background: darkTheme ? '#1E1D1C' : '#FFFFFF',
    borderRadius: '25px',
    maxHeight: '180px',
    border: `3px solid ${controlColor}`,
  }}
>
  <Stack direction="column" justifyContent="space-between" height="100%">
    {/* Section 1: Hospital Name */}
    <Box sx={{ textAlign: 'center', padding: '8px' }}>
      <Typography variant="h6" sx={{ userSelect: 'none', color: darkTheme ? '#FFFFFF' : '#124D81' }}>
        {organizationData.name}
      </Typography>
    </Box>
    <Divider sx={{  backgroundColor: '#505050', width: '100%' }} />
    {/* Section 2: Device Information */}
    <Box sx={{ textAlign: 'center', padding: '15px' }}>
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <DevicesIcon sx={{ color: darkTheme ? '#FFFFFF' : '#124D81' }} />
          <Typography variant="subtitle1" sx={{ userSelect: 'none', color: darkTheme ? '#FFFFFF' : '#124D81' }}>
            Devices: {deviceList.length}
          </Typography>
        </Stack>
        <Typography variant="subtitle1" sx={{ userSelect: 'none', color: darkTheme ? '#FF0000' : '#FF0000' }}>
          Critical Devices: {criticalDeviceCount}
        </Typography>
      </Stack>
    </Box>

    {/* Section 3: Status */}
    <Box sx={{  p: 1,  textAlign: 'center',backgroundColor: criticalDeviceCount ? '#FF0000' : '#505050' }}>
      
      
         <Typography variant="subtitle1" sx={{ userSelect: 'none', color:  '#FFFFFF' }}>
        Status: {deviceStatus}
      </Typography>
    </Box>
  </Stack>

  <Snackbar open={snack} autoHideDuration={5000} onClose={handleCloseSnackbar}>
    <Alert onClose={handleCloseSnackbar} variant="filled" severity={snackSucc ? 'success' : 'error'}>
      {snackSucc ? 'Operation Completed Successfully' : 'Operation Failed'}
    </Alert>
  </Snackbar>
</Card>

      )}
    </Box>
  );
};
