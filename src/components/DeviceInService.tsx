import React, { useMemo, useEffect, useState } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useNotification } from '../contexts/NotificationContext';

interface DeviceInServiceProps {
  deviceList: any[];
  organizationId: string;
  handleDeviceSelection: (device: any) => void;
  searchQuery: string;
  deviceMetrics: any[];
  darkTheme: boolean;
}

export const DeviceInService: React.FC<DeviceInServiceProps> = ({
  deviceList = [],
  organizationId,
  handleDeviceSelection,
  searchQuery,
  deviceMetrics = [],
  darkTheme,
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const { addNotification, notifiedAlarms, addNotifiedAlarm, isAlarmNotified } = useNotification(); // Use the hook here
  const ALARM_NOTIFICATION_DELAY = 5000; // 5 seconds

  const filteredDeviceList = useMemo(() => {
    return deviceList.filter(device =>
      device.resource?.owner?.reference === `Organization/${organizationId}`
    ).filter(device =>
      device.resource.identifier[0]?.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (device.resource.identifier[2]?.value &&
        device.resource.identifier[2]?.value.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [deviceList, organizationId, searchQuery]);

  const hasCriticalCodes = (extensions: any[]) => {
    if (!Array.isArray(extensions)) {
      return false;
    }
    const criticalCodes = [56, 46, 45, 27, 23, 10];
    return extensions.some(ext => criticalCodes.includes(parseInt(ext.valueQuantity?.value)));
  };

 
  const sendEmail = async (metrics: any[]) => {
    try {
      const response = await fetch('http://pmsserver.local:3001/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'New device metrics fetched', metrics }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.text();
      console.log('Email sent:', result);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  useEffect(() => {
    deviceMetrics.forEach(metric => {
      const typeDisplay = metric.type?.coding?.map((coding: { display: any; }) => coding.display).join(', ') || 'Unknown';
      const identifierValue = metric.identifier?.[1]?.value || 'N/A';
      const criticalExtensions = metric.extension?.filter((ext: any) => hasCriticalCodes([ext])) || [];
      const metricTimestamp = metric.calibration?.[0]?.time 
      ? new Date(metric.calibration[0].time).toLocaleString() 
      : new Date(metric.meta?.lastUpdated).toLocaleString();
      criticalExtensions.forEach((ext: { valueQuantity: { code: any; }; }) => {
        const extensionCode = ext.valueQuantity?.code;
        const uniqueAlarmKey = `${metric.id}-${extensionCode}`;
  
        console.log('Checking uniqueAlarmKey:', uniqueAlarmKey);
  
        if (!isAlarmNotified(uniqueAlarmKey)) {
          const notification = {
            id: `${uniqueAlarmKey}-${Date.now()}`,
            message: `${typeDisplay} (${extensionCode}) in S.No: ${identifierValue} at ${metricTimestamp}`,
            type: 'error',
          };
  
          addNotification(notification);
  
          addNotifiedAlarm(uniqueAlarmKey); // Mark the alarm as notified
  
          // Trigger email sending when new alarm notification is added
          sendEmail([{ metricId: identifierValue,alarmType:extensionCode, alarmCode: extensionCode, timestamp: metricTimestamp }]);
  
          // Reset the notification key after a delay
          setTimeout(() => {
            notifiedAlarms.delete(uniqueAlarmKey);
            console.log('Removed from notified:', uniqueAlarmKey);
          }, ALARM_NOTIFICATION_DELAY);
        } else {
          console.log('Already notified:', uniqueAlarmKey);
        }
      });
    });
  }, [deviceMetrics, addNotification, addNotifiedAlarm, isAlarmNotified, sendEmail]);
  
  const handleDeviceClick = (device: any) => {
    setSelectedDeviceId(device.resource.id);
    handleDeviceSelection(device);
  };

  return (
    <Box width={'100%'} height={'100%'}>
      {filteredDeviceList.length > 0 ? (
        filteredDeviceList.map((device, index) => {
          const deviceMetricsForDevice = deviceMetrics
            .filter(metric => metric.source?.reference === `Device/${device.resource.id}`)
            .sort((a, b) => new Date(b.meta.lastUpdated).getTime() - new Date(a.meta.lastUpdated).getTime());

          const latestMetric = deviceMetricsForDevice[0];
          const hasCriticalMetric = latestMetric && hasCriticalCodes(latestMetric.extension || []);
          const latestMetricTimestamp = latestMetric?.meta?.lastUpdated
            ? new Date(latestMetric.meta.lastUpdated).toLocaleString()
            : '--';

          return (
              <Box
              key={index}
              width={'90%'}
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
                  {`${device.resource.identifier[1]?.value || ''} (S.No:${device.resource.identifier[2]?.value || '--'})`}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme ? '#FFFFFF' : '#124D81', mt: 1 }}>
                  {`Last Ac: ${latestMetricTimestamp}`}
                </Typography>
                <Divider sx={{ my: 2, backgroundColor: '#505050', width: '100%' }} />
                <Box sx={{ mt: 1, p: 1, backgroundColor: hasCriticalMetric ? '#FF0000' : '#505050', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                    {hasCriticalMetric ? 'Status: Action needed' : 'Status: Normal'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })
      ) : (
        <Typography sx={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>No devices found.</Typography>
      )}
    </Box>
  );
};
