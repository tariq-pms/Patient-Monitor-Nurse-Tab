import React, { FC, useEffect, useState } from 'react';
import {AppBar, Collapse, Divider,Drawer,FormControl,IconButton,Switch,InputAdornment,List,ListItem,ListItemButton,ListItemText,Menu,MenuItem,Select,SelectChangeEvent, Stack, TextField, useMediaQuery, useTheme, Badge, Paper, FormControlLabel, AccordionDetails, AccordionSummary, Accordion, Checkbox, AccordionActions, Snackbar, Alert} from '@mui/material';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import SettingsIcon from '@mui/icons-material/Settings';
import Button from '@mui/material/Button';
import {  ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate,useLocation } from 'react-router-dom';
import pmsLogo from '../assets/image 135.png';
import { useAuth0 } from '@auth0/auth0-react';
import { Avatar, Typography } from '@material-ui/core';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import SearchIcon from '@mui/icons-material/Search';
import DehazeIcon from '@mui/icons-material/Dehaze';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import AppsIcon from '@mui/icons-material/Apps';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotification } from "../contexts/NotificationContext";


export interface HeaderProps {
  currentRoom: string;
  roomChange: (roomId: string) => void;
  roomAltered: boolean;
  userOrganization: string;
  darkTheme: boolean;
  toggleDarkTheme: () => void;
  setSearchQuery: (query: string) => void;
  selectedIcon: string; 
  setSelectedIcon: (icon: string) => void; 
}


export const Header: FC<HeaderProps> = (props) => {
  const [smallList, setSmallList] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const screenSize = useMediaQuery(theme.breakpoints.up('md'));
  const {user, isLoading, isAuthenticated, logout, getIdTokenClaims} = useAuth0();
  const[UserRole, setUserRole] = useState("");
  const[UserOrganization, setUserOrganization] = useState("");
 
  const handleIconClick = (icon: string) => {
    props.setSelectedIcon(icon); // This should work correctly now
  };
  
  const [notHome, setNotHome] = useState(true);
  const [temproom, settemproom] = useState([
    {
      resource: {
        name: '',
        resourceType: '',
        id: '',
        meta: {
          versionId: '',
          lastUpdated: '',
        },
        identifier: [
          {
            value: '',
          },
        ],
        status: '',
      },
    },
  ]);

  const [room, setRoom] = useState(temproom.length > 0 ? String(temproom[0].resource.name) : '');
 const handleSetRoom = (event: SelectChangeEvent) => {
    setRoom(event.target.value);
    props.roomChange(
      temproom[
        temproom.findIndex(
          (item) => item.resource.name.toString() === String(event.target.value)
        )
      ].resource.id
    );
  };
  const [currentTime, setCurrentTime] = useState(new Date());
 useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

 const handleSetRoom2 = (value: any) => {
    console.log(value)
    setRoom(value);
    props.roomChange(
      temproom[
        temproom.findIndex(
          (item) => item.resource.name.toString() === String(value)
          // changed here (item) => item.resource.name.toString() === String(value)
        )
      ].resource.id
    );
  }
 const [prevRoom, setPrevRoom] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const state = Boolean(anchorEl);
  const [temp, settemp] = useState(false)
 const { darkTheme, toggleDarkTheme } = props;

 useEffect(() => {
    getIdTokenClaims()
    .then((res) => {
      console.log('Role:', res);
      setUserRole(res?.role);
      setUserOrganization(res?.organization);
       console.log("organization is here",UserOrganization )
       if (isAuthenticated) {
       fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Location?organization=${UserOrganization}`, {
          credentials: 'omit',
          headers: {
            Authorization: 'Basic ' + btoa('fhiruser:change-password'),
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.entry) {
              settemproom(data.entry);
            }
          })
          .catch((error) => {
            console.error('Failed to fetch locations:', error);
          });
      }
    })
    .catch((error) => {
      console.error('Failed to fetch role:', error);
    });
}, [isAuthenticated,UserOrganization ]);

useEffect(() => {
  if (UserRole === 'Hospital Clinician' && 
      (location.pathname === '/rooms' || location.pathname === '/Admin' || 
       location.pathname === '/organization' || location.pathname === '/device-monitor')) {
    navigate('/patient-monitor');
  }
  
  if (UserRole === 'Hospital Technician' && 
      (location.pathname === '/patient-monitor' || location.pathname === '/organization')) {
    navigate('/central-monitor');
  }

  if (UserRole === 'Phoenix' && location.pathname !== '/organization') {
    navigate('/organization');
  }

  

  // Ensure that the Service role is only on allowed paths
  if (UserRole === 'Service' && 
      (location.pathname !== '/service' && !location.pathname.includes('/service-device'))) {
    navigate('/service');
  }

}, [isAuthenticated, UserRole, location.pathname, navigate]);

const currentPath = window.location.pathname;

const handleBackButtonClick = () => {
  setNotHome(true);

  if (UserRole === 'Hospital Technician') {
      navigate('/central-monitor');
  } else if (UserRole === 'Service') {
      navigate('/service');
  } else {
      navigate('/patient-monitor');
  }

  setRoom(prevRoom || props.currentRoom); 
};

const { notifications, clearNotifications } = useNotification();
const [alarmChecked, setAlarmChecked] = useState(false);
const [systemDataChecked, setSystemDataChecked] = useState(false);
const [eventLogChecked, setEventLogChecked] = useState(false);
const [filteredNotifications, setFilteredNotifications] = useState(notifications); // To store filtered notifications
const [openSnackbar,setOpenSnackbar]= useState(false);
// Handle checkbox changes
const handleAlarmChange = (event: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
  setAlarmChecked(event.target.checked);
};

const handleSystemDataChange = (event: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
  setSystemDataChecked(event.target.checked);
};

const handleEventLogChange = (event: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
  setEventLogChecked(event.target.checked);
};

// Handle Save button
const handleSaveSettings = () => {
  // Filter notifications based on the checked settings
  const newFilteredNotifications = notifications.filter(notification => {
    if (alarmChecked && notification.type === 'alarm') return true;
    if (systemDataChecked && notification.type === 'systemData') return true;
    if (eventLogChecked && notification.type === 'eventLog') return true;
    return false;
  });

  setFilteredNotifications(newFilteredNotifications);
  handleCloseNotifications();
  setOpenSnackbar(true); // Optionally close the notifications menu
};
const handleCloseSnackbar = (event: any, reason: string) => {
  if (reason === 'clickaway') {
    return;
  }
  setOpenSnackbar(false); // Close the snackbar
};
const [anchorElNotification, setAnchorElNotification] = useState<null | HTMLElement>(null);
const isOpen = Boolean(anchorElNotification);  
    const handleOpenNotifications = (event: { currentTarget: React.SetStateAction<HTMLElement | null>; }) => {
      setAnchorElNotification(event.currentTarget);
    };

    const handleCloseNotifications = () => {
      setAnchorElNotification(null);
    };

  return (
   <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none' }} sx={{ boxShadow: '0px 5px 5px 0px yellow' }}>
        <Toolbar>
          {!isLoading && isAuthenticated && (
            <>
              <div style={{ display: 'flex', marginRight: 'auto' }}>
                <Box onClick={handleBackButtonClick} sx={{ cursor: 'pointer' }}>
                  <img src={pmsLogo} alt="Phoenix" style={{ maxWidth: '90%', height: 'auto' }} />
                  
                </Box>
                <div >
                   {/* <Organization darkTheme={darkTheme} /> */}
                   <Typography style={{color:darkTheme?'white':'#124D81'}} > {currentTime.toLocaleTimeString()} | {currentTime.toLocaleDateString()}</Typography>
                    </div>
                    
              
              </div>
             

                {notHome && UserRole === 'Service' &&  (
                  <><div style={{ marginLeft: 'auto' }}>
                  <Stack sx={{ backgroundColor: darkTheme ? '' : '#FFFFFF', borderRadius: '25px' }}>
                    <TextField
                      variant="outlined"
                      size="small"
                      inputProps={{ style: { color: darkTheme ? 'white' : '#124D81' } }} // Set text color to blue
                      sx={{
                        backgroundcolor: '#FFFFFF',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '25px', // Set border radius
                          borderColor: '#F9F9F9', // Set border color
                          borderStyle: 'solid', // Set border style
                          borderWidth: '1px', // Set border width
                          '&:hover fieldset': {
                            borderColor: '#124D81' // Set border color on hover
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#124D81' // Set border color when focused
                          }
                        }
                      }}
                      placeholder={currentPath === '/service' ? 'Hospital Name' : 'Device S.NO'}
                      style={{ width: '200px' }}
                      onChange={(e) => props.setSearchQuery(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <SearchIcon style={{ color: darkTheme ? 'white' : 'black' }} />
                          </InputAdornment>
                        ),
                      }} />
                  </Stack>
                </div>
                
                <div style={{ marginLeft: '1%' }}>
                    {/* Notification Icon Button */}
                    <IconButton
                      onClick={handleOpenNotifications}
                      style={{
                        backgroundColor: isOpen ? (darkTheme ? '#333' : '#FFFFFF') : 'transparent',
                        borderRadius: '50%',
                      }}
                    >
                      <Badge badgeContent={notifications.length} color="error">
                        <NotificationsIcon style={{ color: darkTheme ? '#BFDEFF' : '#124D81', fontSize: '1.8rem' }} />
                      </Badge>
                    </IconButton>

                    {/* Notification Menu */}
                    <Menu
                      anchorEl={anchorElNotification}
                      open={isOpen}
                      onClose={handleCloseNotifications}
                      PaperProps={{
                        style: {
                          width: '400px',
                          backgroundColor: darkTheme ? '#000000' : '#F3F2F7',
                          maxHeight: '600px',
                          overflowY: 'auto',
                        },
                      }}
                    >
                      {/* Notifications List */}
                      <List>
                        {notifications.length === 0 ? (
                          <ListItem>
                            <ListItemText primary="No Notifications" sx={{ color: 'grey' }} />
                          </ListItem>
                        ) : (
                          notifications.map((notification) => (
                            <ListItem key={notification.id} style={{ borderBottom: '1px solid lightgray' }}>
                              <ListItemText
                                primary={notification.message}
                                primaryTypographyProps={{
                                  style: {
                                    color: darkTheme ? 'white' : '#124D81',
                                    wordWrap: 'break-word',
                                  },
                                }} />
                            </ListItem>
                          ))
                        )}
                      </List>

                      {/* Clear All and Settings */}
                      <ListItem style={{ justifyContent: 'left' }}>
                        <Button variant="contained" color="primary" onClick={clearNotifications} disabled={notifications.length === 0}>
                          Clear
                        </Button>

                      </ListItem>
                      <div><Accordion sx={{ backgroundColor: "transparent", backgroundImage: 'none' }}>
                        <AccordionSummary
                          expandIcon={<ExpandMore style={{ color: darkTheme ? '#FFFFFF' : "#124D81" }} />}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <Typography variant="subtitle1" style={{ color: darkTheme ? '#FFFFFF' : "#124D81" }}>Notification Settings</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
          <Stack direction="row" width="100%" justifyContent="space-evenly">
            <FormControlLabel
              control={<Checkbox checked={alarmChecked} onChange={handleAlarmChange} style={{ color: darkTheme ? '#FFFFFF' : "#124D81" }} />}
              label={<Typography style={{ color: darkTheme ? '#FFFFFF' : '#124D81' }}>Alarm</Typography>} />
            <FormControlLabel
              control={<Checkbox checked={systemDataChecked} onChange={handleSystemDataChange} style={{ color: darkTheme ? '#FFFFFF' : "#124D81" }} />}
              label={<Typography style={{ color: darkTheme ? '#FFFFFF' : '#124D81' }}>System Data</Typography>} />
            <FormControlLabel
              control={<Checkbox checked={eventLogChecked} onChange={handleEventLogChange} style={{ color: darkTheme ? '#FFFFFF' : "#124D81" }} />}
              label={<Typography style={{ color: darkTheme ? '#FFFFFF' : '#124D81' }}>Event Log</Typography>} />
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Button sx={{ color: '#FFFFFF', backgroundColor: '#124D81' }} onClick={handleSaveSettings}>
            Save
          </Button>
        </AccordionActions>
                      </Accordion></div>


                    </Menu>
                      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}  // Auto-hide after 3 seconds
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert  severity="success" sx={{ width: '100%' }}>
          Notification settings saved successfully!
        </Alert>
      </Snackbar>
                  </div>
                  </>
)}

  {screenSize ? (
                <>
                <Stack direction={'row'} justifyContent={'center'} textAlign={'center'} >
                    {notHome && UserRole === 'Hospital Technician' && (
                      <>
                       
                       <FormControl
  variant="standard"
  sx={{
    width: '160px',
    borderRadius: '16px',
    height:'35px',
    backgroundColor: darkTheme ? '#1C1C1E' : '#FFFFFF',
    '& .MuiInput-underline:before': { // Remove underline before focus
      borderBottom: 'none',
    },
    
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { // Remove underline on hover
      borderBottom: 'none',
    },
  }}
>
                        <Select label="Room" onChange={handleSetRoom} value={room}  MenuProps={{MenuListProps: { disablePadding: true },sx: { '&& .Mui-selected': { backgroundColor: '#124D81',color: '#FFFFFF',},},}}sx={{ color: darkTheme?'white': 'grey' }}>
                            {temproom.map((room) => {
                                 return (
                               <MenuItem key={room.resource.id} onClick={() => {setNotHome(true);}} value={String(room.resource.name)} sx={{justifyContent: 'center',padding: '6%',backgroundColor: '#F3F2F7',color: '#124D81'}}>
                                {room.resource.name.toString()}
                                </MenuItem>
                                 );
                              })}
                            
              <MenuItem value="R&D" sx={{width: '250px',padding: '6%', paddingLeft:'20px',backgroundColor: '#F3F2F7', color: '#124D81',borderTop:'1px solid black'}} onClick={() => {navigate('/rooms');setNotHome(false);setPrevRoom(room);}}>Rooms & Device Settings <SettingsIcon sx={{ marginLeft: 'auto' }}/></MenuItem>
            </Select> </FormControl>
                      </>
                    )}
                    {notHome && UserRole === 'Hospital Clinician' && (
                      <>
                        <FormControl variant="standard"  sx={{ width: '150px', backgroundColor: darkTheme?'':'#F3F2F7',borderRadius: '25px',border: '2px solid #BFDEFF'}}>
                          {/* <InputLabel disabled sx={{ color: darkTheme? 'white':'#124D81 !important' }}>Room</InputLabel> */}
                          <Select label="Room" onChange={handleSetRoom} style={{ height: '40px' }} value={room} disableUnderline MenuProps={{ MenuListProps: { disablePadding: true },sx: { '&& .Mui-selected': { backgroundColor: '#124D81', color: '#FFFFFF' } },}} sx={{ color: darkTheme ? '#BFDEFF' : '#124D81',}}
>
  {/* Menu items */}
               
            {temproom.map((room) => {
                              
                      return (
                        <MenuItem key={room.resource.id} onClick={() => {setNotHome(true)
                         if(UserRole=='Hospital Clinician'){
                              navigate('/patient-monitor')
                            }
                            else{
                              navigate('/device-monitor')
                            }
                          }}
                          value={String(room.resource.name)}
                          sx={{
                            justifyContent: 'center',
                            padding: '6%',
                            backgroundColor: '#F3F2F7',
                            color: '#124D81',
                          }}
                        
                        >
                          {/* {room.resource.name.toString()} */}
                          {room.resource.name.toString()} 
                        </MenuItem>
                        
                      );
                      
                    })}
                <MenuItem value="R&1" sx={{justifyContent: 'center',padding: '6%',backgroundColor: '#F3F2F7',color: '#124D81'}} onClick={() => {navigate('/all-patient');setNotHome(true);setPrevRoom(room);}}>All Patients</MenuItem>   
            
                    </Select>
                        </FormControl>
                       
                  
                        
                      </>
                    )}
  <Divider orientation="vertical" flexItem sx={{ marginRight: '20px',backgroundColor: darkTheme ? '#1C1C1E' : '#D6D6D6', marginLeft: '20px' }} />
                    <div style={{ display: 'flex', alignItems: 'center' }}>
             
              <IconButton   onClick={handleMenu}   sx={{height:'40px',width:'40px' }}>
        < DehazeIcon style={{ color: darkTheme ? '#BFDEFF' : '#124D81', fontSize: '1.8rem' }} />
        
      </IconButton>
      <Menu
  anchorEl={anchorEl}
  open={state}
  onClose={() => { setAnchorEl(null); }}
  MenuListProps={{ disablePadding: true }}
  sx={{
    '& .MuiPaper-root': {
      borderRadius: '16px'
    }
  }}
>
      <Box width={'270px'} sx={{ backgroundColor: darkTheme ? '#000000' : '#F3F2F7', color: darkTheme ? '' : '#124D81',border:'4px solid  #AEAEAE',borderRadius:'16px' }}>
     
        <Stack direction={'row'} width={'100%'} padding={'5px'} alignItems="center">
  <Box alignContent={'center'} sx={{ marginRight: '8px',marginTop:'0px' }}>
    <AccountCircleRoundedIcon style={{ fontSize: '44px', color: darkTheme ? 'white' : '#124D81' }} />
  </Box>
  <Stack justifyContent="center">
    <Typography variant="h6" style={{ color: darkTheme ? 'white' : '#124D81' }}>
    {user?.nickname}
    
    </Typography>
    <Typography variant="caption" style={{ color: darkTheme ? 'white' : '#124D81' }}>
    {user?.email}
   
    </Typography>
    <Typography variant="caption" style={{ color: darkTheme ? 'white' : '#124D81' }}>
    {user?.role}
    </Typography>
  </Stack>
</Stack>

        <Stack direction="row" justifyContent="flex-end" paddingBottom="12px" paddingRight="22px">
          <Button
            onClick={() => logout()}
            sx={{ backgroundColor: '#124D81', color: 'white', textTransform: 'capitalize' }}
          >
            <Typography variant="caption">Sign out</Typography>
          </Button>
        </Stack>

        <Divider sx={{ border: '0.3px solid #AEAEAE' }} />
        {notHome && (UserRole === 'Hospital Technician' || UserRole === 'Hospital Clinician') && (
        <><Stack alignItems="flex-start" sx={{ marginTop: '5px', paddingLeft: '22px' }}>
                              <Typography variant="subtitle1">View</Typography>
                            </Stack><Stack direction="row" width="100%" justifyContent="space-evenly" sx={{ marginY: '5px' }}>

                                <IconButton onClick={() => handleIconClick('view')} sx={{ height: '40px', width: '40px' }}>
                                  <ViewCompactIcon style={{ color: props.selectedIcon === 'view' ? (darkTheme ? '#124D81' : '#62ECFF') : (!darkTheme ? '#1C1C1E' : ''), fontSize: '2rem' }} />
                                </IconButton>
                                <IconButton onClick={() => handleIconClick('apps')} sx={{ height: '40px', width: '40px' }}>
                                  <AppsIcon style={{ color: props.selectedIcon === 'apps' ? (darkTheme ? '#124D81' : '#62ECFF') : (!darkTheme ? '#1C1C1E' : ''), fontSize: '2rem' }} />
                                </IconButton>
                                <IconButton onClick={() => handleIconClick('vertical')} sx={{ height: '40px', width: '40px' }}>
                                  <VerticalSplitIcon style={{ color: props.selectedIcon === 'vertical' ? (darkTheme ? '#124D81' : '#62ECFF') : (!darkTheme ? '#1C1C1E' : ''), fontSize: '2rem' }} />
                                </IconButton>

                              </Stack></>
        )}
        {/* <Divider sx={{ border: '0.3px solid grey' }} /> */}
        <Stack direction="row" width="100%" justifyContent="space-around"   >
          <Typography variant="subtitle1" style={{marginRight:'50px',marginTop:'4px'}}>Dark Mode</Typography>
          <Switch
            onChange={toggleDarkTheme}
            checked={darkTheme}
            sx={{
              
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(18, 77, 129, 0.08)',
                },
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#00AEEE',
              },
              '& .MuiSwitch-track': {
                backgroundColor: 'grey',
              },
            }}
          />
        </Stack>
      </Box>
    </Menu>
                </div>
                    </Stack>
                     </>
                      ) : 
                      (
                      <>
                  <IconButton onClick={() => settemp(true)}>
                    <MenuIcon />
                  </IconButton>
                  <Drawer
                    anchor="right"
                    open={temp}
                    onClose={() => settemp(false)}
                    PaperProps={{ style: { width: '40%', backgroundColor: 'black' } }}
                  >
                    <Stack width={'100%'} height={'100%'} sx={{ backgroundColor: '#131726' }} divider={<Divider />}>
                      <Stack height={'5%'} justifyContent={'center'} alignItems={'center'}>
                        <Typography>Settings</Typography>
                      </Stack>
                      {notHome && UserRole === 'Hospital Clinician' && (
                      <Stack direction={'row'} width={'100%'} height={'5%'} justifyContent={'center'} marginBottom={'3%'} marginTop={'5%'}>
                      
                      </Stack>
                      )}

                      <List>
                        <ListItemButton onClick={() => setSmallList(!smallList)}>
                          <ListItemText>
                            <Typography variant='h6' style={{ marginTop: '3%', paddingBottom: '3%' }}>Rooms </Typography>
                          </ListItemText>
                          {smallList ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={smallList} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {temproom.map((room) => (
                              <ListItem key={room.resource.id}>
                                <ListItemButton
                                  onClick={() => {
                                   
                                      handleSetRoom2(room.resource.name);
                                      setNotHome(true);
                                      navigate('/device-monitor');
                                   
                                  }}
                                  sx={{
                                    marginLeft: '20px',
                                    padding: '6%',
                                    backgroundColor: '',
                                  }}
                                  
                                >
                                  {room.resource.name.toString()}
                                </ListItemButton>
                                
                              </ListItem>
                            ))}

                            
                        {notHome && UserRole === 'Hospital Technician' && (<>
                                  <MenuItem value="R&D" sx={{width: 'auto', padding: '6%', backgroundColor: '#131726', borderTop: '1px solid grey',}} onClick={() => {navigate('/rooms');setNotHome(false);setPrevRoom(room); } }>Rooms & Device Settings <SettingsIcon sx={{ marginLeft: 'auto' }} />
                                  </MenuItem>
                                  {/* <MenuItem value="R&D" sx={{width: '100%',padding: '6%',paddingLeft: '20px',backgroundColor: '#131726',textAlign:'space-between,'}}onClick={handleAdminClick}>Admin Access <PersonIcon sx={{ marginLeft: 'auto' }} /></MenuItem> */}
                                  </> )}
                          </List>
                          
                        </Collapse> 
                        
                      </List>
                      <Box width={'100%'} height={'200px'} marginTop={'auto'} sx={{ backgroundColor: '#131726' }}>
                        <Stack direction={'row'} justifyContent={'space-between'}>
                          <Typography style={{ marginLeft: '3%', marginTop: '5%', marginBottom: '5%' }}>
                            Hospital Name
                          </Typography>
                          <Button onClick={() => logout()} sx={{ color: 'white', textTransform: 'capitalize' }}>
                            <Typography variant="subtitle2">Sign out</Typography>
                          </Button>
                        </Stack>
                        <Stack direction={'row'} width={'100%'}>
                          <Avatar style={{ marginLeft: '3%', marginTop: '2%', width: 100, height: 100 }}>
                            {(() => (
                              <Typography variant="h3">{String(user?.nickname)[0].toUpperCase()}</Typography>
                            ))()}
                          </Avatar>
                          <Stack>
                            <Typography variant="h5" style={{ marginLeft: '8%', marginTop: '2%' }}>
                              {user?.nickname}
                            </Typography>
                            <Typography variant="subtitle1" style={{ marginLeft: '8%', marginTop: '2%' }}>
                              {user?.email}
                            </Typography>
                            <Typography variant="subtitle2" style={{ marginLeft: '8%', marginTop: '2%' }}>
                              Designation
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Drawer>
                      </>
                
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
    
  );
};