import React, { useMemo, useEffect, useState } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';

interface DeviceInServiceProps {
  deviceList: any[];
  organizationId: string;
  handleDeviceSelection: (device: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  deviceMetrics: any[];
  darkTheme: boolean;
}

export const DeviceInService: React.FC<DeviceInServiceProps> = ({
  deviceList = [],
  organizationId,
  handleDeviceSelection,
  searchQuery,
  deviceMetrics = [],
  darkTheme
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const filteredDeviceList = useMemo(() => {
    const byOrganization = deviceList.filter(
      (device) => device.resource?.owner?.reference === `Organization/${organizationId}`
    );

    const bySearchQuery = byOrganization.filter((device) =>
      device.resource.identifier[0]?.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (device.resource.identifier[1]?.value && device.resource.identifier[1]?.value.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return bySearchQuery;
  }, [deviceList, organizationId, searchQuery]);

  const hasCriticalCodes = (extensions: any[]) => {
    const criticalCodes = [56, 46, 45, 27, 23, 10];
    return extensions.some(ext => criticalCodes.includes(parseInt(ext.valueQuantity?.value)));
  };

  // const sendEmail = async (metrics: any[]) => {
  //   try {
  //     const response = await fetch('http://localhost:3000/send-email', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ message: 'New device metrics fetched', metrics }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }

  //     const result = await response.text();
  //     console.log('Email sent:', result);
  //   } catch (error) {
  //     console.error('Error sending email:', error);
  //   }
  // };

  useEffect(() => {
    const criticalMetrics = deviceMetrics.flatMap(metric => 
      hasCriticalCodes(metric.extension || [])
    );

    if (criticalMetrics.length > 0) {
      // sendEmail(criticalMetrics);
    }
  }, [deviceMetrics]);

  const handleDeviceClick = (device: any) => {
    setSelectedDeviceId(device.resource.id);
    handleDeviceSelection(device);
  };

  return (
    <Box width={'100%'} height={"100%"} >
      {filteredDeviceList.length > 0 ? (
        filteredDeviceList.map((device, index) => {
          const deviceMetricsForDevice = deviceMetrics
            .filter((metric) => metric.source?.reference === `Device/${device.resource.id}`)
            .sort((a, b) => new Date(b.meta.lastUpdated).getTime() - new Date(a.meta.lastUpdated).getTime());

          const latestMetric = deviceMetricsForDevice[0]; // Get the latest metric
          const hasCriticalMetric = latestMetric && hasCriticalCodes(latestMetric.extension || []);

          return (
            <Box
              key={index}
              width={'80%'}
              minHeight={'20%'}
              onClick={() => handleDeviceClick(device)}
              sx={{
                border: hasCriticalMetric ? '3px solid red' : '1px solid grey',
                borderRadius: '10px',
                margin: '15px',
                background: darkTheme ? '#1E1D1C' : '#FFFFFF',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: selectedDeviceId === device.resource.id ? darkTheme ?'0 0 8px 3px #909080' :'0 0 8px 3px #505050' :'none',
                transition: 'box-shadow 0.3s ease-in-out'
              }}
            >
              <Stack padding={2} alignItems="center">
                <Typography variant="h6" sx={{ color: darkTheme ? '#FFFFFF' : '#124D81' }}>
                  {`${device.resource.identifier[1]?.value || ''}`}
                </Typography>
                <Typography variant="h6" sx={{ color: darkTheme ? '#FFFFFF' : '#124D81' }}>
                  {`${device.resource.identifier[0]?.value}`}
                </Typography>
                <Divider sx={{ my: 2, backgroundColor: '#505050', width: '100%' }} />
                <Box sx={{ mt: 1, p: 1, backgroundColor: hasCriticalMetric ? '#FF0000' : '#505050', borderRadius: 1 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ color: '#FFFFFF' }}
                  >
                    {hasCriticalMetric ? 'Status: Action needed' : 'Status: Normal'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })
      ) : (
        <Typography sx={{color:darkTheme?'#FFFFFF':'#000000'}}>No devices found.</Typography>
      )}
    </Box>
  );
};
