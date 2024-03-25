import React, { useEffect, useState } from 'react';
import {Alert,Button,Select,Snackbar,Stack,Typography,Skeleton,IconButton, CardContent,MenuItem,DialogContent,Dialog,DialogActions,DialogTitle, Tooltip,} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import SettingsIcon from '@mui/icons-material/Settings';
import { CustomOkButton } from './CustomOkButton';
import { CustomNoButton } from './CustomNoButton';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
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
  const [snackSucc, setSnackSucc] = useState(false);
  const [snack, setSnack] = useState(false);
  const [controlColor, setControlColor] = useState('grey');
  const [controlOpacity, setOpacity] = useState('0.8');
  const [loading, setLoading] = useState(true);
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [miniDialog, setMiniDialog] = useState(false);
  const [miniDialog1, setMiniDialog1] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const handleCloseSnackbar = () => {
    setSnack(false);
  };
  const [searchQuery, setSearchQuery] = useState('');
 
  const filteredDevices = deviceList.filter(device => {
    const deviceIdentifier = `${device?.resource?.identifier[1].value} ${device?.resource?.identifier[0].value}`;
    return deviceIdentifier.toLowerCase().includes(searchQuery.toLowerCase());
  });


  useEffect(() => {
    console.log('Selected device in useEffect:', selectedDevice);
    const fetchData = async () => {
      try {
        const response = await fetch('https://pmsind.co.in:5000/Device/?_count=100', {
         
          headers: {
            Authorization: 'Basic ' + btoa('fhiruser:change-password'),
          },
        });
        const data = await response.json();
        console.log('Fetched data:', data);
        setDeviceList(data.entry || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching devices:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDevice]);
  console.log('Selected device before rendering:', selectedDevice);
  
 
const addButton = () => {
  if (selectedDevice !== null) {
    const data = {
      ...deviceList[selectedDevice].resource,
      owner: {
        reference: `Organization/${organizationData.id}`
      },
    };

    fetch(`https://pmsind.co.in:5000/Device/${deviceList[selectedDevice].resource.id}`, {
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
const handleCopyOrganizationId = () => {
  const organizationId = organizationData?.id;
  if (organizationId) {
    navigator.clipboard.writeText(organizationId)
      .then(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000); 
      })
      .catch(err => {
        console.error('Failed to copy organization ID:', err);
      });
  }
};

const removeButton = () => {
  if (selectedDevice !== null) {
    const data = { ...deviceList[selectedDevice].resource };
    delete data.owner;
    fetch(`https://pmsind.co.in:5000/Device/${deviceList[selectedDevice].resource.id}`, {
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
        // Update device list state after successful removal
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

  return (
    <Box>
      {loading ? (
        <Skeleton animation="wave" variant="rectangular" width={'350px'} height={'280px'} sx={{ borderRadius: '25px' }} />
      ) : (
        <Card elevation={5} onMouseLeave={() => {setControlColor('grey');}}onMouseEnter={() => { setControlColor('#2BA0E0');}}style={{width: '350px',opacity: controlOpacity,backgroundColor: 'transparent',boxShadow: 'none', background: 'transparent', borderRadius: '25px',minHeight: '280px',border: `1px solid ${controlColor}`, }}>
          <Stack width={'100%'} direction={'row'} justifyContent={'center'} textAlign={'center'}>
            <CardContent sx={{ marginTop: '0%', width: '100%', justifyContent: 'center', textAlign: 'center' }}>
            <Stack marginTop={'0%'} justifyContent={'space-between'}sx={{ flexDirection: 'row',  alignItems: 'center' }}>
            <Tooltip open={showTooltip} title="Organization ID copied" placement="bottom">
        <IconButton onClick={handleCopyOrganizationId} sx={{color:'#124D81'}}>
          <ContentCopyOutlinedIcon />
        </IconButton>
      </Tooltip>
  <IconButton  sx={{color:'#124D81'}}>
    <SettingsIcon />
  </IconButton>
</Stack>

              <Typography  sx={{ userSelect: 'none', marginTop: '5%',color:'#124D81' }}>{organizationData.name}</Typography>
              <Stack spacing={'10%'} marginTop={'10%'} width={'70%'} marginLeft={'auto'} marginRight={'auto'}>
               
                <Select sx={{ fontSize: '10%',color:'pink', borderRadius: '25px', border:'2px solid #124D81',placeholder:'Devices in this organization'}} >
  {deviceList.filter((device) => {
      // Filter devices based on the owner's reference
      const ownerReference = device?.resource?.owner?.reference;
      return ownerReference === `Organization/${organizationData.id}`;
    })
    .map((device) => (
      <MenuItem key={device.resource.id}>
        {(device.resource.identifier[1]?.value || '') + ' ' + (device.resource.identifier[0]?.value || '')}
      </MenuItem>
    ))}
</Select>
 <Button
                  variant="contained"
                  
                  sx={{ borderRadius: '25px' }}
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  Add/Move Devices
                </Button>
                <Button variant="contained" sx={{ borderRadius: '25px' }} color="warning"   onClick={() => {
                    setRemoveDialogOpen(true);
                  }}>
                  Remove Device
                </Button>
              </Stack>
            </CardContent>
            <Dialog open={open} onClose={() => setOpen(false)} scroll="paper" PaperProps={{ style: { borderRadius: '25px', boxShadow: '0px 0px 40px 1px #404040', border: '0.4px solid #505050', backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth: '400px', minHeight: '200px' } }}>
              <DialogTitle id="responsive-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', padding: '5%',}}>
                {`Add device to ${organizationData.name}`}
              </DialogTitle>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <TextField id="search" label="Search" placeholder='Available Devices' variant="outlined" InputProps={{ startAdornment: (<SearchIcon />) }}sx={{ width: '60%' }}value={searchQuery}  onChange={(e) => setSearchQuery(e.target.value)}/>
      </div>
              <DialogContent sx={{ display: 'flex', flexWrap: 'wrap', textAlign: 'center', marginBottom: 'auto', paddingBottom: '9%' }} >
  <Stack width={'100%'} display={'flex'} direction={'row'} flexWrap={'wrap'} >
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
</Dialog>
<Dialog
  open={removeDialogOpen}
  onClose={() => setRemoveDialogOpen(false)}
  scroll="paper"  PaperProps={{ style: { borderRadius: '25px', boxShadow: '0px 0px 40px 1px #404040', border: '0.4px solid #505050', backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth: '400px', minHeight: '200px' } }}>
  <DialogTitle id="responsive-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', paddingBottom: '9%' }}>{`Remove device from ${organizationData.name}`}</DialogTitle>
  <DialogContent sx={{ display: 'flex', flexWrap: 'wrap', textAlign: 'center', marginBottom: 'auto', paddingBottom: '9%' }}>
  <Stack width={'100%'} display={'flex'} direction={'row'} flexWrap={'wrap'}>
      {deviceList.map((device, index) => {
        // Check if the device is associated with the organization
        const isDeviceAssociated = device?.resource?.owner?.reference.split('/')[1] === organizationData.id;
if (isDeviceAssociated) {
          return (
            <Button key={device.resource.id} onClick={() => {console.log('Selected device in Remove Button click:', index);setMiniDialog1(true);setSelectedDevice(index);}}sx={{width: '48%',height: '60px',justifyContent: 'center',textAlign: 'center',color: 'white',border: '0.1px solid #282828',margin:'5px',}}>
             <Tooltip title={(device.resource.identifier[1].value).toString()}>
             <Typography variant="subtitle1" component={'h2'}> <span style={{ fontSize: '90%', display: 'block' }}>{(device.resource.identifier[1].value).toString().split(' ').slice(0, 3).join(' ')}</span><span style={{ fontSize: '110%', display: 'block' }}>{(device.resource.identifier[0].value).toString()}</span></Typography></Tooltip>
             </Button>
          );
        }
        return null;
      })}
    </Stack>
  </DialogContent>
  <Dialog open={miniDialog1} onClose={() => setMiniDialog1(false)}
  PaperProps={{style: {backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)',borderRadius: '25px',boxShadow: '0px 0px 40px 1px #404040',border: '0.4px solid #505050',height: '30%',justifyContent: 'center',textAlign: 'center',},}}>
  <DialogTitle id="responsive-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', paddingBottom: '9%' }}>
    {`remove device `}
    <i>{`${selectedDevice !== null ? deviceList[selectedDevice]?.resource.identifier[0].value : ''} `}</i>

    {`from Organization `}
    <i>{`${organizationData.name}`}?</i>
  </DialogTitle>
  <DialogActions sx={{ paddingBottom: '5%' }}>
    <Stack direction={'row'} width={'100%'} justifyContent={'space-around'}>
      <Box onClick={() => setMiniDialog1(false)} sx={{ minWidth: '90px', minHeight: '45px' }}>
        <CustomNoButton text="Cancel"></CustomNoButton>
      </Box>
      <Box
        onClick={() => {removeButton(); setMiniDialog1(false);}}sx={{ minWidth: '90px', minHeight: '45px' }}>
        <CustomOkButton text="Confirm"></CustomOkButton>
      </Box>
    </Stack>
  </DialogActions>
</Dialog>
</Dialog>
          </Stack>
          <Snackbar open={snack} autoHideDuration={5000} onClose={handleCloseSnackbar}>
            <Alert  onClose={handleCloseSnackbar} variant="filled" severity={snackSucc ? 'success' : 'error'}>
              {snackSucc && 'Operation Completed Successfully'}
              {!snackSucc && 'Operation Failed'}
            </Alert>
          </Snackbar>
        </Card>
      )}
    </Box>
  );
};
