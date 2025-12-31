import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, ToggleButton, ToggleButtonGroup, Card, ListItemText, ListItem, List, useMediaQuery, Theme, Button, MenuItem, FormControl, Select, DialogContent, Dialog, DialogTitle, IconButton } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDown } from '@fortawesome/free-solid-svg-icons';
import CloseIcon from "@mui/icons-material/Close";


interface ServiceDetailsProps {
  isDialogOpened: boolean;
  handleCloseDialog: Function;
  selectedDevice: any;
  deviceMetricId: string;
  darkTheme: boolean;
  
}

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({
  selectedDevice,
  deviceMetricId,
  isDialogOpened,
  handleCloseDialog
 
}) => {
  const [selectedTab, setSelectedTab] = useState('alarms');
  const [deviceMetricsHistory, setDeviceMetricsHistory] = useState<any[]>([]);
  const [, setLoading] = useState(false); // Add loading state
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [, setOpenDialog] = useState(false);

 
  const filteredData = deviceMetricsHistory.filter((metric) => {
    const typeCode = metric.type.coding[0].code;
    if (selectedFilter === "All") return ['systemaction', 'systemconfig', 'systemtest','systeminfo'].includes(typeCode);
    return typeCode === selectedFilter;
  });

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
        setLoading(true); // Set loading to true before fetching data
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
  const selfTest = deviceMetricsHistory.filter(
    (metric) => metric.type.coding[0].code === 'SelfTest'
  );
  const systemInfoMetrics = deviceMetricsHistory
  .filter((metric) => metric.type?.coding?.[0]?.code === "systeminfo")
  .sort((a, b) => new Date(b.meta?.lastUpdated || 0).getTime() - new Date(a.meta?.lastUpdated || 0).getTime());

const latestSystemInfo = systemInfoMetrics[0]; // Get the most recent entry

 // Debugging
  const systemtest = deviceMetricsHistory.filter(
    (metric) => metric.type.coding[0].code === 'systemtest'
  );


  const systemconfig = deviceMetricsHistory.filter(
    (metric) => metric.type.coding[0].code === 'systemconfig'
  );


  const alarmsData = deviceMetricsHistory.filter(
    (metric) => metric.type.coding[0].code === 'alarm'
  );


  const calibration = deviceMetricsHistory.filter(
    (metric) => metric.type.coding[0].code === 'calibration'
  );
  
  
  const latestData: Record<string, string> = {};
  console.log("latestData for configuration",latestData);


systemconfig.forEach((metric) => {
  metric.extension?.forEach((ext: { valueString: string }) => {
    if (typeof ext.valueString === "string" && ext.valueString.includes(":")) {
    if (ext.valueString) {
      const [key, value] = ext.valueString.split(":");
      latestData[key.trim()] = value.trim(); // Store latest value
    }}
  });
});

const latestTestData: Record<string, string> = {};

// Extract the latest values for each unique key
systemtest.forEach((metric) => {
  metric.extension?.forEach((ext: { valueString: string }) => {
    if (ext.valueString) {
      const [key, value] = ext.valueString.split(":");
      latestTestData[key.trim()] = value.trim(); // Store latest value
    }
  });
});

  
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  // Check if selectedDevice is valid and has the expected structure
  if (!selectedDevice || !selectedDevice.resource || !selectedDevice.resource.identifier) {
    return <div></div>; // Handle loading or missing data
  }
  const downloadCSV = () => {
    const csvRows = [
      ["S.No", "Type", "Event", "Timestamp"], // Header row
      ...filteredData.map((metric, index) => [
        index + 1,
        metric.type.coding[0].code === 'systemaction' ? 'System Action' :
        metric.type.coding[0].code === 'systemconfig' ? 'System Configuration' : 'System Test',
        metric.extension?.[0]?.valueString || 'N/A',
        metric.meta?.lastUpdated ? new Date(metric.meta.lastUpdated).toLocaleString() : 'N/A'
      ])
    ].map(row => row.join(",")).join("\n");
  
    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeviceMetrics_${selectedFilter}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <React.Fragment>
<Dialog
  open={isDialogOpened}
  onClose={() => setOpenDialog(false)}
  fullScreen={isMobile}
  fullWidth
  maxWidth="lg"
  PaperProps={{
    sx: {
      borderRadius: isMobile ? 0 : "15px",
      overflow: "hidden",
    },
  }}
>

  {/* Header */}
  <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#F3F2F7" }}>
  <Stack direction="row" justifyContent="space-between" spacing={5}>
          <Typography variant="subtitle1" sx={{ color: "#124D81" }}>
            {`${selectedDevice.resource.identifier[1]?.value || ""} (${selectedDevice.resource.identifier[0]?.value})`}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#124D81" }}>
            {`S.No: ${selectedDevice.resource.serialNumber || "--"}`}
          </Typography>
        </Stack>

    <IconButton onClick={() => {handleCloseDialog()}}>
      <CloseIcon  sx={{ color: "#124D81" }}/>
    </IconButton>
  </DialogTitle>

  {/* Body */}
  <DialogContent
    dividers
    sx={{
      p: 0,
      bgcolor: "#FFFFFF",
    }}
  >

    <Box
      sx={{
        height: "100%",
        minHeight: "90vh",
       width:'100%',
        backgroundColor: "#FFFFFF",
        overflowY: "auto",
        scrollbarGutter: "stable",
        position: "relative",

        "&::-webkit-scrollbar": { width: "8px" },
        "&::-webkit-scrollbar-track": { backgroundColor: "#E0E0E0", borderRadius: "25px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#B0B0B0",
          borderRadius: "25px",
        },
        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#808080" },
      }}
    >
      {/* 📌 Top device info */}
    
      {/* 📌 Tabs */}
      <Stack sx={{ alignItems: "center", justifyContent: "center",   width: "100%", marginTop: "2%" }}>
  <ToggleButtonGroup
    value={selectedTab}
    exclusive
    onChange={handleTabChange}
    aria-label="selected tab"
    sx={{ width: "90%" }}
  >
    {["selftest", "alarms", "systemdata", "eventlog"].map((tab) => (
      <ToggleButton
        key={tab}
        value={tab}
        selected={selectedTab === tab}
        sx={{
          width: "100%",
          fontSize: { xs: "8px", sm: "14px" },
          backgroundColor: selectedTab === tab ? "#124D81" : "#F3F2F7",
          color: selectedTab === tab ? "#FFFFFF" : "#124D81",
          "&.Mui-selected": {
            backgroundColor: "#124D81",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#124D81",
            }
          }
        }}
      >
        {tab === "selftest" ? "Self Test" :
         tab === "alarms" ? "Alarms" :
         tab === "systemdata" ? "System Data" : "Event Log"}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
</Stack>

      {/* 📌 Self Test Table */}
      {selectedTab === 'selftest' && (
          <Stack justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
            <TableContainer
  component={Paper}
  style={{
    width: '90%',
    marginTop: '4%',
    backgroundColor:   '#F3F2F7',
    color:   '#124D81',
  }}
>
  <Table size= {isMobile?"small":"medium"}>
    <TableHead >
      <TableRow>
        <TableCell style={{ color:   '#124D81' }}>S.No</TableCell>
        <TableCell style={{ color:   '#124D81' }}>Self test</TableCell>
        <TableCell style={{ color:   '#124D81' }}>Status</TableCell>
        <TableCell style={{ color:   '#124D81' }}>Time</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
    {selfTest.map((metric, index) => (
  <TableRow key={index}>
    <TableCell sx={{ fontSize: { xs: '10px', sm: '14px' }, color:   '#000000' }}>
      {index + 1}
    </TableCell>

    <TableCell sx={{ fontSize: { xs: '10px', sm: '14px' }, color:   '#000000' }}>
      {metric.extension ? (
        metric.extension
          .filter(
            (ext: { url: string; valueCodeableConcept?: any }) =>
              ext.url === 'http://terminology.hl7.org/fhir/StructureDefinition/device-SelfTest' &&
              ext.valueCodeableConcept
          )
          .map((ext: { valueCodeableConcept: { coding: {
            [x: string]: string; display: string 
}[] } }, index: number) => (
            <div key={index}>
              {ext.valueCodeableConcept.coding[0]?.display || 'N/A'}
              <br />
            </div>
          ))
      ) : (
        'N/A'
      )}
    </TableCell>
    <TableCell sx={{ fontSize: { xs: '10px', sm: '14px' }, color:   '#000000' }}>
    {metric.extension ? (
        metric.extension
          .filter(
            (ext: { url: string; valueCodeableConcept?: any }) =>
              ext.url === 'http://terminology.hl7.org/fhir/StructureDefinition/device-SelfTest' &&
              ext.valueCodeableConcept
          )
          .map((ext: { valueCodeableConcept: { coding: {
            [x: string]: string; display: string 
}[] } }, index: number) => (
            <div key={index}>
              
               {ext.valueCodeableConcept.coding[0]?.code || 'N/A'}
              <br />
            </div>
          ))
      ) : (
        'N/A'
      )}
    </TableCell>

   
    <TableCell sx={{ fontSize: { xs: '10px', sm: '14px' }, color:   '#000000' }}>
  {metric.meta?.lastUpdated 
    ? new Date(metric.meta.lastUpdated).toLocaleString() 
    : 'N/A'}
</TableCell>

  </TableRow>
))}

    </TableBody>
  </Table>
</TableContainer>

          </Stack>
        )}
        {selectedTab === 'alarms' && (
          <Stack justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
            <TableContainer
  component={Paper}
  style={{
    width: '90%',
    marginTop: '4%',
    backgroundColor:   '#F3F2F7',
    color:   '#124D81',
  }}
>
  <Table size= {isMobile?"small":"medium"}>
    <TableHead >
      <TableRow>
        <TableCell style={{ color:   '#124D81' }}>S.No</TableCell>
        <TableCell style={{ color:   '#124D81' }}>Alarm</TableCell>
        <TableCell style={{ color:   '#124D81' }}>Time</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
    {alarmsData.map((metric, index) => (
  <TableRow key={index}>
    <TableCell sx={{ fontSize: { xs: '10px', sm: '14px' }, color:   '#000000' }}>
      {index + 1}
    </TableCell>

    <TableCell sx={{ fontSize: { xs: '10px', sm: '14px' }, color:   '#000000' }}>
      {metric.extension ? (
        metric.extension
          .filter(
            (ext: { url: string; valueString: string }) =>
              ext.url === 'http://terminology.hl7.org/fhir/StructureDefinition/CRITICAL_ALARM' && ext.valueString
          )
          .map((ext: { valueString: string }, idx: number) => (
            <div key={idx}>
              {ext.valueString}
              <br />
            </div>
          ))
      ) : (
        'N/A'
      )}
    </TableCell>

    <TableCell sx={{ fontSize: { xs: '10px', sm: '14px' }, color:   '#000000' }}>
    {metric.meta?.lastUpdated 
    ? new Date(metric.meta.lastUpdated).toLocaleString() 
    : 'N/A'}
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
          {/* Filter Menu */}
          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ width: '90%',  mt: 2 }}>
          
      <FormControl
        variant="standard"
        sx={{
          width: '17%',
          borderRadius: '8px',
          color: '#124D81',
          backgroundColor:   '#F3F2F7',
        }}
      >
        
        <Select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          MenuProps={{
            MenuListProps: { disablePadding: true },
            sx: {'&& .Mui-selected': { backgroundColor: '#124D81', color: '#FFFFFF' } },
          }}
          sx={{  color:   '#124D81', textAlign: 'center' }}
        >
          <MenuItem value="All" sx={{ backgroundColor: '#F3F2F7', color: '#124D81' }}>All</MenuItem>
          <MenuItem value="systemaction" sx={{ backgroundColor: '#F3F2F7', color: '#124D81' }}>System Action</MenuItem>
          <MenuItem value="systemconfig" sx={{ backgroundColor: '#F3F2F7', color: '#124D81' }}>System Configuration</MenuItem>
          <MenuItem value="systemtest" sx={{ backgroundColor: '#F3F2F7', color: '#124D81' }}>System Test</MenuItem>
          <MenuItem value="systeminfo" sx={{ backgroundColor: '#F3F2F7', color: '#124D81' }}>System Information</MenuItem>
        </Select>
      </FormControl>
      <Button
       
       // startIcon={<FileDownloadIcon />}
       onClick={downloadCSV}
       sx={{
         backgroundColor:  '#F3F2F7',
    
         
       }}
     >
      {/* <Typography sx={{color:  '#124D81',fontWeight: 'bold',}}>Download </Typography> */}
      <FontAwesomeIcon icon={faCircleDown } color={  '#124D81'} fontSize={'1.6rem'}/>
     </Button>
    </Stack>
      
          {/* Table Container */}
          <TableContainer
            component={Paper}
            style={{
              width: '90%',
              marginTop: '2%',
              backgroundColor:   '#F3F2F7',
              color:   '#124D81',
            }}
          >
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color:  '#124D81' }}>S.No</TableCell>
                  <TableCell style={{ color:'#124D81' }}>Type</TableCell>
                  <TableCell style={{ color: '#124D81' }}>Event</TableCell>
                  <TableCell style={{ color: '#124D81' }}>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((metric, index) => (
                  <TableRow key={index}>
                    {/* Serial Number */}
                    <TableCell sx={{ fontSize: { xs: '10px', sm: '14px' }, color:  '#000000' }}>
                      {index + 1}
                    </TableCell>
      
                    {/* Type Column - Dynamically Set the Label */}
                    <TableCell sx={{ fontSize: { xs: '10px', sm: '14px' }, color:  '#000000' }}>
                      {metric.type.coding[0].code === 'systemaction'
                        ? 'System Action'
                        : metric.type.coding[0].code === 'systemconfig'
                        ? 'System Configuration'
                        : metric.type.coding[0].code === 'systemtest'
                        ? 'System Test'
                        : 'System Info'}
                    </TableCell>
      
                    {/* Extract and Display the Relevant Value */}
                    <TableCell sx={{ color:  '#000000' }}>
  {metric.extension.map((ext: any, index: number) => (
    <Typography key={index} variant="subtitle2">
      {ext.valueString}
    </Typography>
  ))}
</TableCell>
      
                    {/* Last Updated Timestamp */}
                    <TableCell sx={{ fontSize: { xs: '10px', sm: '14px' }, color:  '#000000' }}>
                      {metric.meta?.lastUpdated ? new Date(metric.meta.lastUpdated).toLocaleString() : 'N/A'}
                    </TableCell>
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
                    color: "#000000", justifyContent: 'space-between', mb: 3 }}>
              <Card sx={{ p:{xs:'1',md:'2'} ,backgroundColor:   '#F3F2F7', flex: 1,mb: { xs: 2, md: 0 }, mr: { md: 1 }  ,borderRadius:'15px'}}>
              <Box textAlign='center' sx={{padding:1,borderBottom: '1px solid #124D81'}}><Typography variant='subtitle1' sx={{ color: '#124D81' }}>Information</Typography></Box>
              <List sx={{ color:   "#000000" }}>
                {!latestSystemInfo ? (
              <ListItem>
              <ListItemText
                primary={
                 <Typography sx={{ fontSize: "0.5rem" }}>
                      No system info data available
                   </Typography>
                   }
                   />
               </ListItem >
                ) : (
                latestSystemInfo.extension?.map((ext: { url: string; valueString: any; }, index: React.Key | null | undefined) => (
               <ListItem key={index} sx={{pl:2,pt:0,pb:0}}>
                 <ListItemText
       
                  primary={
            <Typography variant='subtitle2'>
              {ext.url.split("/").pop()?.replace(/_/g, " ")}: {ext.valueString || "N/A"}
            </Typography>
          }
        />
      </ListItem>
    ))
  )}
              </List>
              </Card>
            <Card sx={{ p:{xs:'1',md:'2'} ,borderRadius:'15px', backgroundColor:   '#F3F2F7', flex: 1,mb: { xs: 2, md: 0 }, mr: { md: 1 }  }}>
            <Box textAlign='center' sx={{padding:1,borderBottom: '1px solid #124D81'}}><Typography variant='subtitle1' sx={{ color: '#124D81' }}>Configuration</Typography></Box>
            {/* <List sx={{ color:   "#000000" }}>
  {!latestsystemconfig? (
    <ListItem>
      <ListItemText
        primary={
          <Typography sx={{ fontSize: "0.5rem" }}>
            No system info data available
          </Typography>
        }
      />
    </ListItem >
  ) : (
    latestsystemconfig.extension?.map((ext: { url: string; valueString: any; }, index: React.Key | null | undefined) => (
      <ListItem key={index} sx={{pl:2,pt:0,pb:0}}>
        <ListItemText
       
          primary={
            <Typography variant='subtitle2'>
            {ext.valueString || "N/A"}
            </Typography>
          }
        />
      </ListItem>
    ))
  )}
              </List> */}
              <List sx={{ color:   "#000000" }}>
  {Object.entries(latestData).length === 0 ? (
    <ListItem>
      <ListItemText primary="No system config data available" />
    </ListItem>
  ) : (
    Object.entries(latestData).map(([key, value], index) => (
      <ListItem key={index}>
        <ListItemText
          primaryTypographyProps={{ sx: { fontSize: "0.8rem" } }}
          primary={`${key}: ${value}`}
        />
      </ListItem>
    ))
  )}
</List> 
</Card>
{/* <Box sx={{ textAlign: 'center',padding:2 }}>
    
    <Grid container spacing={2} justifyContent="center" alignItems="center">

  {['ProbeTest', 'SkinProbeTest', 'Speaker&LED', 'HeaterAreaTest', 'TemperatureUnit'].map((test) => {
    const testResult = systemtest.find(metric => 
      metric.extension?.some((ext: { valueQuantity: { system: string | string[]; }; }) => ext.valueQuantity?.system.includes(test))
    );

    return (
      <Grid item xs={15} key={test} sx={{ textAlign: 'center' }}>
        <Box sx={{ 
          p: 1, 
          backgroundColor:   '#FFFFFF', 
          color:   '#1C1C1E', 
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

  </Box> */}
<Card sx={{ p:{xs:'1',md:'2'} ,borderRadius:'15px',backgroundColor:   '#F3F2F7', flex: 1,mb: { xs: 2, md: 0 }, mr: { md: 1 }  }}>
<Box textAlign='center' sx={{padding:1,borderBottom: '1px solid #124D81'}}>
  <Typography variant='subtitle1' sx={{ color: '#124D81' }}>Test</Typography>
  </Box>
<List sx={{ color:   "#000000" }}>
  {Object.entries(latestTestData).length === 0 ? (
    <ListItem>
      <ListItemText primary="No system info data available" />
    </ListItem>
  ) : (
    Object.entries(latestTestData).map(([key, value], index) => (
      <ListItem key={index}>
        <ListItemText
          primaryTypographyProps={{ sx: { fontSize: "0.8rem" } }}
          primary={`${key}: ${value}`}
        />
      </ListItem>
    ))
  )}
</List>   
</Card>

              
 </Box>
   {/* Calibration Details Section */}
             
              <Box sx={{ textAlign:'center',marginTop:'3%' }}>
        <Typography sx={{ color:  '#124D81' }}>Calibration Details</Typography>
           {/* Filter Menu */}
           <Stack direction="row" justifyContent="right" spacing={1} sx={{ mb:2,  mt: 2 }}>
           {/* <Typography sx={{ color:  '#124D81' }}>Filter:</Typography> */}
          <FormControl
            variant="standard"
            sx={{
              width: '17%',
              borderRadius: '8px',
              color: '#124D81',
              backgroundColor:   '#F3F2F7',
            }}
          >
            
            <Select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              MenuProps={{
                MenuListProps: { disablePadding: true },
                sx: {'&& .Mui-selected': { backgroundColor: '#124D81', color: '#FFFFFF' } },
              }}
              sx={{  color:   '#124D81', textAlign: 'center' }}
            >
              <MenuItem value=" " sx={{ backgroundColor: '#F3F2F7', color: '#124D81' }}>All</MenuItem>
              <MenuItem value="" sx={{ backgroundColor: '#F3F2F7', color: '#124D81' }}>Touch calibration</MenuItem>
              <MenuItem value="" sx={{ backgroundColor: '#F3F2F7', color: '#124D81' }}>O2 cell calibration</MenuItem>
              <MenuItem value="" sx={{ backgroundColor: '#F3F2F7', color: '#124D81' }}>Tilt calibration</MenuItem>
            </Select>
          </FormControl>
          {/* <Button
           
           // startIcon={<FileDownloadIcon />}
           onClick={downloadCSV}
           sx={{
             backgroundColor:  '#F3F2F7',
        
             
           }}
         >
       
          <FontAwesomeIcon icon={faCircleDown } color={  '#124D81'} fontSize={'1.6rem'}/>
         </Button> */}
        </Stack>
        <Stack justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
            <TableContainer
  component={Paper}
  style={{
    
    backgroundColor:   '#F3F2F7',
    
  }}
>
<Table size= {isMobile?"small":"medium"}>
      <TableHead>
        <TableRow>
          
          <TableCell style={{ color:   '#124D81' }}>Type</TableCell>
          <TableCell style={{ color:   '#124D81' }}>Value</TableCell>
          <TableCell style={{ color:   '#124D81' }}>Date & Time</TableCell>
        </TableRow>
      </TableHead>
      {/* <TableBody>
        {calibration.map((metric, index) => {
          // Find the relevant extension with calibration data
          const ext = metric.extension?.find(
            (e: { url: string; }) => e.url === 'http://terminology.hl7.org/fhir/StructureDefinition/calibration'
          );

          return (
            <TableRow key={index}>
              
              <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color:   '#000000'}}>
                {ext?.valueQuantity?.system?.split('/').pop() || 'N/A'}
              </TableCell>
              <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color:   '#000000'}}>
                {ext?.valueQuantity?.code || 'N/A'}
              </TableCell>
              <TableCell sx={{fontSize: { xs: '10px', sm: '14px' },color:   '#000000'}}>
                {new Date(metric.calibration?.[0]?.time).toLocaleString()|| 'N/A'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody> */}
    <TableBody>
      
  {calibration.map((metric, index) => {
    // Find the relevant extensions for both calibration types
    const touchExt = metric.extension?.find(
      (e: { url: string; }) => e.url === 'http://terminology.hl7.org/fhir/Touch_calibration'
    );
    
    const o2Ext = metric.extension?.find(
      (e: { url: string; }) => e.url === 'http://terminology.hl7.org/fhir/O2_Cell_calibration'
    );

    const bwsExt = metric.extension?.find(
      (e: { url: string; }) => e.url === 'http://terminology.hl7.org/fhir/BWS_calibration'
    );
    const tiltExt = metric.extension?.find(
      (e: { url: string; }) => e.url === 'http://terminology.hl7.org/fhir/TILT_calibration'
    );
    // Split the valueString into separate items using the semicolon for Touch calibration and comma for O2 Cell calibration
    const touchValueItems = touchExt?.valueString?.split(',') || [];
    const o2ValueItems = o2Ext?.valueString?.split(',') || []; 
    const tiltValueItems = tiltExt?.valueString?.split(',') || [];// Using comma delimiter for BWS calibration

    const bwsValueItems = bwsExt?.valueString?.split(',') || [];// Using comma delimiter for BWS calibration

    return (
      <TableRow key={index}>
        <TableCell sx={{fontSize: { xs: '10px', sm: '14px' }, color:   '#000000'}}>
          {touchExt?.url?.split('/').pop()}
          {o2Ext?.url?.split('/').pop() }
          {bwsExt?.url?.split('/').pop() }
          {tiltExt?.url?.split('/').pop() }
        </TableCell>

        <TableCell sx={{fontSize: { xs: '10px', sm: '14px' }, color:   '#000000'}}>
          {/* Display the Touch calibration values */}
          {touchValueItems.map((item: string, itemIndex: React.Key | null | undefined) => (
            <div key={itemIndex}>
              {item.trim()},
            </div>
          ))}
          {/* Add the O2 calibration values under the Touch calibration */}
          {o2ValueItems.length > 0 && (
            <div>
              
              {o2ValueItems.map((item: string, itemIndex: React.Key | null | undefined) => (
                <div key={itemIndex}>
                  {item.trim()},
                </div>
              ))}
            </div>
          )}
           {bwsValueItems.length > 0 && (
            <div>
              
              {bwsValueItems.map((item: string, itemIndex: React.Key | null | undefined) => (
                <div key={itemIndex}>
                  {item.trim()},
                </div>
              ))}
            </div>
          )}
           {tiltValueItems.length > 0 && (
            <div>
              
              {tiltValueItems.map((item: string, itemIndex: React.Key | null | undefined) => (
                <div key={itemIndex}>
                  {item.trim()},
                </div>
              ))}
            </div>
          )}

        </TableCell>

        <TableCell sx={{fontSize: { xs: '10px', sm: '14px' }, color:   '#000000'}}>
          {new Date(metric.calibration?.[0]?.time).toLocaleString() || 'N/A'}
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>
 </Table>
</TableContainer>
</Stack>
            </Box></Box></Stack>)}

    </Box>
  </DialogContent>
</Dialog>
    </React.Fragment>
  );
};

