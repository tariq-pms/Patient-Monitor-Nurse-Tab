import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, ToggleButton, ToggleButtonGroup, Grid, Card, ListItemText, ListItem, List, useMediaQuery, Theme } from '@mui/material';




interface ServiceDetailsProps {
  isOpen: boolean;
  handleCloseDialog: () => void;
  selectedDevice: any;
  deviceMetricId: string;
  darkTheme: boolean;
}

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({
  selectedDevice,
  deviceMetricId,
  darkTheme
}) => {
  const [selectedTab, setSelectedTab] = useState('alarms');
  const [deviceMetricsHistory, setDeviceMetricsHistory] = useState<any[]>([]);
  

  const fetchDeviceMetricHistory = async () => {
    try {
      console.log('Fetching history for Device Metric ID:', deviceMetricId);
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/DeviceMetric/${deviceMetricId}/_history?_count=1000`, {
        headers: {
          Authorization: 'Basic ' + btoa('fhiruser:change-password'),
        },
      });
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching device metric history:', error);
      return [];
    }
  };

  useEffect(() => {
    if (selectedDevice) {
      const fetchData = async () => {
        try {
          const data = await fetchDeviceMetricHistory();
          setDeviceMetricsHistory(data.entry ? data.entry.map((entry: any) => entry.resource) : []);
        } catch (error) {
          console.error('Error fetching device metrics history:', error);
        }
      };
  
      fetchData(); // Initial fetch
  
      const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds
  
      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [selectedDevice]);

  const handleTabChange = (_event: any, newTab: React.SetStateAction<string> | null) => {
    if (newTab !== null) {
      setSelectedTab(newTab);
    }
  };

  const alarmsData = deviceMetricsHistory.filter(
    (metric) => metric.type.coding[0].code === 'alarm'
  );

  const eventLogsData = deviceMetricsHistory.filter(
    (metric) => metric.type.coding[0].code === 'eventlog'
  );

  const calibration = deviceMetricsHistory.filter(
    (metric) => metric.type.coding[0].code === 'calibration'
  );

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  // Check if selectedDevice is valid and has the expected structure
  if (!selectedDevice || !selectedDevice.resource || !selectedDevice.resource.identifier) {
    return <div>Loading device data...</div>; // Handle loading or missing data
  }

  return (
    <React.Fragment>
   <Box
        sx={{
          height: '100%',
          minWidth: { xs: '100%', sm: '90%', md: '90%', lg: '100%' },
          maxWidth: { xs: '100%', sm: '90%', md: '90%', lg: '100%' },
          borderRadius: '15px',
          minHeight:'90vh',
          border: '0.5px solid #505050',
          backgroundColor: darkTheme ? '#000000' : '#FFFFFF',
          overflowY: 'auto',
          scrollbarGutter: 'stable',
          position: 'relative',
          '&::-webkit-scrollbar': {
            width: '8px', // Width of the scrollbar
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: darkTheme ? '#1C1C1E' : '#E0E0E0', // Background of the scrollbar track
            borderRadius: '25px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: darkTheme ? '#505050' : '#B0B0B0', // Scrollbar thumb color
            borderRadius: '25px',
            maxHeight: '24px', // Minimum height of the scrollbar thumb to avoid stretching
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: darkTheme ? '#A0A0A0' : '#808080', // Color on hover
          },
        }}
      >

        {isMobile?(
          <Stack direction ={ "column"} justifyContent="space-between"  spacing={1} padding={2}>
          <Typography variant= {"caption" } sx={{ color:  darkTheme ? '#FFFFFF' : '#124D81'  }}>
            {/* {selectedDevice.resource.identifier[1]?.value}  */}
           
            {`S.No: ${selectedDevice.resource.identifier[2]?.value || '--'}`}
          </Typography>
          <Typography variant= { "caption" } sx={{ color:  darkTheme ? '#FFFFFF' : '#124D81'  }}>
            {/* S.No:{selectedDevice.resource.identifier[2]?.value} */}
            {`${selectedDevice.resource.identifier[1]?.value || ''} (${selectedDevice.resource.identifier[0]?.value})`}
          </Typography>
         
        </Stack>

        ):( 
<Stack direction ={ "row"} justifyContent="space-between"  spacing={1} padding={2}>
  <Typography variant= {"subtitle1"} sx={{ color:  darkTheme ? '#FFFFFF' : '#124D81'  }}>
    {/* {selectedDevice.resource.identifier[1]?.value}  */}
    {`${selectedDevice.resource.identifier[1]?.value || ''} (${selectedDevice.resource.identifier[0]?.value})`}
   
  </Typography>
  <Typography variant= {"subtitle1"} sx={{ color:  darkTheme ? '#FFFFFF' : '#124D81'  }}>
    {/* S.No:{selectedDevice.resource.identifier[2]?.value} */}
    {`S.No: ${selectedDevice.resource.identifier[2]?.value || '--'}`}
  </Typography>
 
</Stack>
        )}
      
      {/* <Stack><Grid container spacing={2} justifyContent="center" marginTop="2%">
     
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2, backgroundColor: darkTheme ? '#1C1C1E' : '#F5F5F5', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>Device Status</Typography>
          <Typography variant="subtitle1" sx={{ color: darkTheme ? '#CACACA' : '#124D81' }}>
            deviceStatus
          </Typography>
        </Card>
      </Grid>

      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2, backgroundColor: darkTheme ? '#1C1C1E' : '#F5F5F5', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>Temperature (°C)</Typography>
          <Typography variant="subtitle1" sx={{ color: darkTheme ? '#CACACA' : '#124D81' }}>
            Target: targetTemperature | Current: currentTemperature
          </Typography>
        </Card>
      </Grid>

     
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2, backgroundColor: darkTheme ? '#1C1C1E' : '#F5F5F5', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>Alarm Count</Typography>
          <Typography variant="subtitle1" sx={{ color: darkTheme ? '#CACACA' : '#124D81' }}>
            alarmCount
          </Typography>
        </Card>
      </Grid>

      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2, backgroundColor: darkTheme ? '#1C1C1E' : '#F5F5F5', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>Next Maintenance</Typography>
          <Typography variant="subtitle1" sx={{ color: darkTheme ? '#CACACA' : '#124D81' }}>
            nextMaintenanceDate
          </Typography>
        </Card>
      </Grid>
    </Grid></Stack> */}
      

      

 
 <Stack sx={{ alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '2%' }}>
      <ToggleButtonGroup value={selectedTab} exclusive onChange={handleTabChange} aria-label="selected tab" sx={{ width: '90%', fontSize: { xs: '5px', sm: '14px' } }} // Adjust font size for mobile
          >
          <ToggleButton value="selftest" sx={{ width: '100%', fontSize: { xs: '8px', sm: '14px' } }}   style={{ backgroundColor: darkTheme ? (selectedTab === 'selftest' ? '#CACACA' : '#1C1C1E') : (selectedTab === 'selftest' ? '#1C1C1E' : '#CACACA'),color: darkTheme ? (selectedTab === 'selftest' ? '#000000' : '#D9D9D9') :(selectedTab === 'selftest' ? '#D9D9D9' : '#000000') }}>
            Self Test
          </ToggleButton>
          <ToggleButton
            value="alarms"
            sx={{ width: '100%', fontSize: { xs: '8px', sm: '14px' } }} 
            style={{
              backgroundColor: darkTheme ? (selectedTab === 'alarms' ? '#CACACA' : '#1C1C1E') : (selectedTab === 'alarms' ? '#1C1C1E' : '#CACACA'),
              color: darkTheme ? (selectedTab === 'alarms' ? '#000000' : '#D9D9D9') :(selectedTab === 'alarms' ? '#D9D9D9' : '#000000') 
            }}
          >
            Alarms
          </ToggleButton>
          <ToggleButton
            value="systemdata"
            sx={{ width: '100%', fontSize: { xs: '8px', sm: '14px' } }} 
            style={{
              backgroundColor: darkTheme ? (selectedTab === 'systemdata' ? '#CACACA' : '#1C1C1E') : (selectedTab === 'systemdata' ? '#1C1C1E' : '#CACACA'),
              color: darkTheme ? (selectedTab === 'systemdata' ? '#000000' : '#D9D9D9') :(selectedTab === 'systemdata' ? '#D9D9D9' : '#000000') 
            }}
          >
            System Data
          </ToggleButton>
          <ToggleButton
            value="eventlog"
            sx={{ width: '100%', fontSize: { xs: '8px', sm: '14px' } }} 
            style={{
              backgroundColor: darkTheme ? (selectedTab === 'eventlog' ? '#CACACA' : '#1C1C1E') : (selectedTab === 'eventlog' ? '#1C1C1E' : '#CACACA'),
              color: darkTheme ? (selectedTab === 'eventlog' ? '#000000' : '#D9D9D9') :(selectedTab === 'eventlog' ? '#D9D9D9' : '#000000') 
            }}
          >
            Event Log
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Stack>
        {selectedTab === 'alarms' && (
          <Stack justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
            <TableContainer
  component={Paper}
  style={{
    width: '90%',
    marginTop: '4%',
    backgroundColor: darkTheme ? '#000000' : '#CACACA',
    color: darkTheme ? '#FFFFFF' : '#000000',
  }}
>
  <Table size= {isMobile?"small":"medium"}>
    <TableHead >
      <TableRow>
        <TableCell style={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>S.No</TableCell>
        <TableCell style={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>Alarm</TableCell>
        <TableCell style={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>Time</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {alarmsData.map((metric, index) => (
        <TableRow key={index}>
          <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color: darkTheme ? '#FFFFFF' : '#000000'}} >{index + 1}</TableCell>
          <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color: darkTheme ? '#FFFFFF' : '#000000'}}>
  {metric.extension ? (
    metric.extension
      .filter(
        (ext: { url: string; valueQuantity: any }) =>
          ext.url === 'http://terminology.hl7.org/fhir/StructureDefinition/device-alarm' && ext.valueQuantity
      )
      .map((ext: { valueQuantity: { code: any } }, index: number) => (
        <div key={index}>
          {ext.valueQuantity.code}
          <br />
        </div>
      ))
  ) : (
    'N/A'
  )}
</TableCell>

          <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color: darkTheme ? '#FFFFFF' : '#000000'}}>
            {new Date(metric.calibration?.[0]?.time).toLocaleString()|| 'N/A'}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

          </Stack>
        )}
        {selectedTab === 'eventlog' && (
          <Stack justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
           <TableContainer
  component={Paper}
  style={{
    width: '90%',
    marginTop: '4%',
    backgroundColor: darkTheme ? '#000000' : '#CACACA',
    color: darkTheme ? '#FFFFFF' : '#000000',
  }}
>
              <Table size= {isMobile?"small":"medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>S.No</TableCell>
                    <TableCell style={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>Event </TableCell>
                    <TableCell style={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventLogsData.map((metric, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color: darkTheme ? '#FFFFFF' : '#000000'}}>{index + 1}</TableCell>
                      <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color: darkTheme ? '#FFFFFF' : '#000000'}}>
                      {metric.extension?.[0]?.valueQuantity?.system && (
    <>{metric.extension[0].valueQuantity.system.split('/').pop()} - </>
  )}
  {metric.extension?.[0]?.valueQuantity?.code}
  
</TableCell>

                      <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color: darkTheme ? '#FFFFFF' : '#000000'}}>{new Date(metric.calibration?.[0]?.time).toLocaleString() || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
        {selectedTab === 'systemdata' && (
          <Stack justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
            <Box sx={{ width: '90%', marginTop: '3%' }}>
              {/* System Information Section */}
              <Box sx={{ display: 'flex',  flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile, flex-row on larger screens
color: darkTheme?'#FFFFFF':"#000000", justifyContent: 'space-between', mb: 3 }}>
              <Card sx={{ p:{xs:'1',md:'2'} , backgroundColor: darkTheme ? '#000000' : '#CACACA', flex: 1,mb: { xs: 2, md: 0 }, mr: { md: 1 }  }}>
  <List sx={{ color: darkTheme ? '#FFFFFF' : "#000000" }} >
  {['SoftwareVersion'].map((version) => {
    const versionResult = eventLogsData.find(metric => 
      metric.extension?.some((ext: { valueQuantity: { system: string | string[]; }; }) => ext.valueQuantity?.system.includes(version))
    );

    const codeParts = versionResult?.extension[0]?.valueQuantity?.code?.split(',') || ['N/A', 'N/A']; // Split the code into two parts

    return (
      <React.Fragment key={version}>
        <ListItem>
          <ListItemText 
           primaryTypographyProps={{
            sx: { fontSize: '0.8rem' }  // Manually set the font size
          }}
            primary={`TFT Version: ${codeParts[0]}`}  // Display first part (TFT Version)
          />
        </ListItem>
        <ListItem>
          <ListItemText 
          primaryTypographyProps={{
            sx: { fontSize: '0.8rem' }  // Manually set the font size
          }}
            primary={`Control Board Version: ${codeParts[1]}`}  // Display second part (Control Board Version)
          />
        </ListItem>
      </React.Fragment>
    );
  })}
    {[ 'MASIMOVersion'].map((version) => {
      const versionResult = eventLogsData.find(metric => 
        metric.extension?.some((ext: { valueQuantity: { system: string | string[]; }; }) => ext.valueQuantity?.system.includes(version))
      );

      return (
        <ListItem key={version}>
          <ListItemText 
          primaryTypographyProps={{
            sx: { fontSize: '0.8rem' }  // Manually set the font size
          }}
            primary={`${version.replace('Version', ' Version').replace('&', ' & ')}: ${versionResult?.extension[0]?.valueQuantity?.code || 'N/A'}`} 
          />
        </ListItem>
        
      );
    })}
  {['BWS', 'Oximeter'].map((version) => {
      const versionResult = eventLogsData.find(metric => 
        metric.extension?.some((ext: { valueQuantity: { system: string | string[]; }; }) => ext.valueQuantity?.system.includes(version))
      );

      return (
        <ListItem key={version}>
          <ListItemText 
          primaryTypographyProps={{
            sx: { fontSize: '0.8rem' }  // Manually set the font size
          }}
            primary={`${version.replace('Version', ' Version').replace('&', ' & ')}: ${versionResult?.extension[0]?.valueQuantity?.code || 'N/A'}`} 
          />
        </ListItem>
        
      );
    })}
    
  </List>
</Card>


                <Card sx={{ p: 2,backgroundColor: darkTheme ? '#000000' : '#CACACA', flex: 1, mb: { xs: 2, md: 0 }, mr: { md: 1 }  }}>
  <Box sx={{ textAlign: 'center' }}>
    {/* <Typography sx={{ color: '#FFFFFF' }}>Test</Typography> */}
    <Grid container spacing={2} justifyContent="center" alignItems="center">
  {['ProbeTest', 'SkinProbeTest', 'Speaker&LED', 'HeaterAreaTest', 'TemperatureUnit'].map((test) => {
    const testResult = eventLogsData.find(metric => 
      metric.extension?.some((ext: { valueQuantity: { system: string | string[]; }; }) => ext.valueQuantity?.system.includes(test))
    );

    return (
      <Grid item xs={15} key={test} sx={{ textAlign: 'center' }}>
        <Box sx={{ 
          p: 1, 
          backgroundColor: darkTheme ? '#1C1C1E' : '#505050', 
          color: '#FFFFFF', 
          borderRadius: 3, 
          border: testResult?.valueQuantity?.code === 'Failed' ? '1px solid red' : 'none' 
        }}>
          <Typography variant="caption">
            {test.replace('&', ' & ')}: {testResult?.extension[0]?.valueQuantity?.code || 'N/A'}
          </Typography>
        </Box>
      </Grid>
    );
  })}
</Grid>

  </Box>
</Card>
 </Box>
   {/* Calibration Details Section */}
             
              <Box sx={{ textAlign:'center',marginTop:'3%' }}>
        <Typography sx={{ color:darkTheme ? '#FFFFFF' : '#124D81' }}>Calibration Details</Typography>
        <Stack justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
            <TableContainer
  component={Paper}
  style={{
    
    backgroundColor: darkTheme ? '#000000' : '#CACACA',
    
  }}
>
<Table size= {isMobile?"small":"medium"}>
      <TableHead>
        <TableRow>
          
          <TableCell style={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>Calibration</TableCell>
          <TableCell style={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>Value</TableCell>
          <TableCell style={{ color: darkTheme ? '#FFFFFF' : '#000000' }}>Date & Time</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {calibration.map((metric, index) => {
          // Find the relevant extension with calibration data
          const ext = metric.extension?.find(
            (e: { url: string; }) => e.url === 'http://terminology.hl7.org/fhir/StructureDefinition/calibration'
          );

          return (
            <TableRow key={index}>
              
              <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color: darkTheme ? '#FFFFFF' : '#000000'}}>
                {ext?.valueQuantity?.system?.split('/').pop() || 'N/A'}
              </TableCell>
              <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color: darkTheme ? '#FFFFFF' : '#000000'}}>
                {ext?.valueQuantity?.code || 'N/A'}
              </TableCell>
              <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color: darkTheme ? '#FFFFFF' : '#000000'}}>
                {new Date(metric.calibration?.[0]?.time).toLocaleString()|| 'N/A'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
            </TableContainer>
          </Stack>
     
      </Box>
            </Box>
          </Stack>
        )}
      </Stack>
      
    </Box> 
    </React.Fragment>
  );
};
