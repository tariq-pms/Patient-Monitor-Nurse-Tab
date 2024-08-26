import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DeviceInService } from '../components/DeviceInService';
import { ServiceDetails } from '../components/ServiceDetails';
import { Box } from '@mui/material';
interface ServiceDeviceProps {
  darkTheme: boolean; // Define the darkTheme prop
}
export const ServiceDevice: React.FC <ServiceDeviceProps> = ({ darkTheme }) => {
  const location = useLocation();
  const { deviceList = [], organizationId } = location.state || {};

  const [filteredDeviceList, setFilteredDeviceList] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [metricsData, setMetricsData] = useState<any[]>([]);

  useEffect(() => {
    console.log('ServiceDevice mounted');
    console.log('Received deviceList:', deviceList);
    console.log('Received organizationId:', organizationId);

    if (deviceList.length > 0 && organizationId) {
      // Filter the device list based on the organizationId
      const filteredDevices = deviceList.filter((device: { resource: { owner: { reference: string; }; }; }) => {
        const deviceOrgId = device.resource?.owner?.reference?.split('/').pop();
        return deviceOrgId === organizationId;
      });

      console.log('Filtered deviceList:', filteredDevices);
      setFilteredDeviceList(filteredDevices);
    }
  }, [deviceList, organizationId]);

  useEffect(() => {
    if (filteredDeviceList.length > 0) {
      // Fetch DeviceMetric resources whenever the filteredDeviceList changes
      fetchDeviceMetrics();
    }
  }, [filteredDeviceList]);

  const fetchDeviceMetrics = useCallback(async () => {
    try {
      console.log('Starting to fetch device metrics...');
      
      // Fetch metrics for each device
      const metricsPromises = filteredDeviceList.map(async (device) => {
        console.log(`Fetching metrics for device ID: ${device.resource.id}`);
        const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/DeviceMetric?source=${device.resource.id}`, {
          headers: {
            Authorization: 'Basic ' + btoa('fhiruser:change-password'),
          },
        });
  
        // Check if the response is successful
        if (!response.ok) {
          console.error(`Failed to fetch metrics for device ID: ${device.resource.id}`, response.statusText);
          return [];
        }
  
        const data = await response.json();
        console.log(`Metrics data for device ID ${device.resource.id}:`, data);
  
        return data.entry ? data.entry.map((entry: any) => entry.resource) : [];
      });
  
      // Wait for all metrics promises to resolve
      const metrics = await Promise.all(metricsPromises);
      console.log('All metrics data:', metrics);
  
      // Flatten the metrics array
      const flatMetrics = metrics.flat();
      console.log('Flattened metrics:', flatMetrics);
  
      // Update local state with the fetched metrics
      setMetricsData(flatMetrics);

    } catch (error) {
      console.error('Error fetching device metrics:', error);
    }
  }, [filteredDeviceList]);

  const handleDeviceSelection = (device: any) => {
    const deviceMetricId = device.resource?.id;
    console.log('Device selected:', device);
    console.log('Extracted deviceMetricId:', deviceMetricId);
    setSelectedDevice({ ...device, deviceMetricId });
  };

  // Filter metricsData based on the selectedDevice.deviceMetricId
  const selectedDeviceMetrics = selectedDevice
    ? metricsData.filter(metric => metric.source?.reference === `Device/${selectedDevice.deviceMetricId}`)
    : [];
  
  // Get the ID of the first metric if available
  const deviceMetricId = selectedDeviceMetrics.length > 0 ? selectedDeviceMetrics[0].id : '';

  console.log("Selected deviceMetricId", deviceMetricId);

  return (
    <div style={{ display: 'flex', height: '90vh', alignItems: 'stretch', width: '98%' }}>
      <Box sx={{ flexWrap: 'wrap', mt: { xs: 5, sm: 6, md: 4, lg: 3 }, justifyContent: 'center', minWidth: '40%' ,maxWidth:'40%',height: '100%',}}>
      
   <Box sx={{marginLeft:'30px'}}>
  <DeviceInService
    deviceList={filteredDeviceList}
    organizationId={organizationId}
    handleDeviceSelection={handleDeviceSelection}
    searchQuery={searchQuery}
    setSearchQuery={setSearchQuery}
    deviceMetrics={metricsData}
 
    darkTheme={ darkTheme }  // Adjust as needed
  /></Box>
</Box>
      

      <Box sx={{display: 'flex', marginTop: '0px', gap: '2rem', mt: { xs: 5, sm: 6, md: 4, lg: 2 }, mb: { xs: 3, sm: 4, md: 4, lg: 2 }, justifyContent: 'center', width: '60%' ,height: '100%',}}>
        {selectedDevice && (
          <ServiceDetails
            isOpen={!selectedDevice}
            handleCloseDialog={() => {
              console.log('Closing ServiceDetails dialog');
              setSelectedDevice(null);
            }}
            selectedDevice={selectedDevice}
            deviceMetricId={deviceMetricId}
            darkTheme={ darkTheme }  // Pass the ID of the first metric or an appropriate ID
          />
        )}
      </Box>
    </div>
  );
};
