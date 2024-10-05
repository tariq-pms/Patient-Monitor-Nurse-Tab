import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DeviceInService } from '../components/DeviceInService';
import { ServiceDetails } from '../components/ServiceDetails';
import { Box } from '@mui/material';

interface ServiceDeviceProps {
  darkTheme: boolean;
  searchQuery: string; // Add searchQuery prop
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const ServiceDevice: React.FC<ServiceDeviceProps> = ({ darkTheme, searchQuery,setSearchQuery }) => {
  const location = useLocation();
  const { deviceList = [], organizationId } = location.state || {};
  const [filteredDeviceList, setFilteredDeviceList] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any[]>([]);

  useEffect(() => {
    if (deviceList.length > 0 && organizationId) {
      const filteredDevices = deviceList.filter(
        (device: { resource: { owner: { reference: string } } }) => {
          const deviceOrgId = device.resource?.owner?.reference?.split('/').pop();
          return deviceOrgId === organizationId;
        }
      );
      setFilteredDeviceList(filteredDevices);
    }
  }, [deviceList, organizationId]);
  useEffect(() => {
    
    setSearchQuery('');
  }, [setSearchQuery]);

  useEffect(() => {
    if (filteredDeviceList.length > 0) {
      fetchDeviceMetrics();
    }
  }, [filteredDeviceList]);

  const fetchDeviceMetrics = useCallback(async () => {
    try {
      const metricsPromises = filteredDeviceList.map(async (device) => {
        const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/DeviceMetric?source=${device.resource.id}`, {
          headers: {
            Authorization: 'Basic ' + btoa('fhiruser:change-password'),
          },
        });
        if (!response.ok) {
          return [];
        }
        const data = await response.json();
        return data.entry ? data.entry.map((entry: any) => entry.resource) : [];
      });

      const metrics = await Promise.all(metricsPromises);
      const flatMetrics = metrics.flat();
      setMetricsData(flatMetrics);
    } catch (error) {
      console.error('Error fetching device metrics:', error);
    }
  }, [filteredDeviceList]);

  const handleDeviceSelection = (device: any) => {
    const deviceMetricId = device.resource?.id;
    setSelectedDevice({ ...device, deviceMetricId });
  };

  const filteredDevices = filteredDeviceList.filter((device) => {
    // Find the MAC address from identifier[0]
    const macAddress = device.resource?.identifier?.find(
      (identifier: { system: string }) => identifier.system === 'urn:ietf:rfc:3986'
    )?.value;
  
    // Get the serial number from identifier[2] if it exists
    const serialNo = device.resource?.identifier?.[2]?.value;
  
    return (
      (macAddress && macAddress.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (serialNo && serialNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  
  const selectedDeviceMetrics = selectedDevice
    ? metricsData.filter(metric => metric.source?.reference === `Device/${selectedDevice.deviceMetricId}`)
    : [];

  const deviceMetricId = selectedDeviceMetrics.length > 0 ? selectedDeviceMetrics[0].id : '';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '98%' }}>
      <Box sx={{
        flexWrap: 'wrap',
        mt: { xs: 5, sm: 6, md: 3, lg: 2 },
        justifyContent: 'center',
        minWidth: '38%',
        maxWidth: '38%',
        height: '100%',
        overflowY: 'auto',
        scrollbarGutter: 'stable',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: darkTheme ? '#1C1C1E' : '#E0E0E0',
          borderRadius: '25px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: darkTheme ? '#505050' : '#B0B0B0',
          borderRadius: '25px',
          maxHeight: '24px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: darkTheme ? '#A0A0A0' : '#808080',
        },
      }}>
        <DeviceInService
          deviceList={filteredDevices}
          organizationId={organizationId}
          handleDeviceSelection={handleDeviceSelection}
          searchQuery={searchQuery} // Pass searchQuery if needed
          deviceMetrics={metricsData}
          darkTheme={darkTheme} 
          />
      </Box>

      <Box sx={{
        display: 'flex',
        marginLeft: '30px',
        gap: '2rem',
        mt: { xs: 5, sm: 6, md: 3, lg: 2 },
        mb: { xs: 3, sm: 4, md: 4, lg: 2 },
        justifyContent: 'center',
        width: '60%',
        height: '100%',
      }}>
        {selectedDevice && (
          <ServiceDetails
            isOpen={!selectedDevice}
            handleCloseDialog={() => {
              setSelectedDevice(null);
            }}
            selectedDevice={selectedDevice}
            deviceMetricId={deviceMetricId}
            darkTheme={darkTheme}
          />
        )}
      </Box>
    </div>
  );
};
