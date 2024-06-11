import React, { FC, useEffect, useState } from 'react';
import {AppBar, Collapse, Divider,Drawer,FormControl,IconButton,Switch,InputAdornment,List,ListItem,ListItemButton,ListItemText,Menu,MenuItem,Select,SelectChangeEvent, Stack, TextField, useMediaQuery, useTheme} from '@mui/material';
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
import PersonIcon from '@mui/icons-material/Person';

import SearchIcon from '@mui/icons-material/Search';
import DehazeIcon from '@mui/icons-material/Dehaze';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import AppsIcon from '@mui/icons-material/Apps';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';


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
  const { user, isLoading, isAuthenticated, logout, getIdTokenClaims } = useAuth0();
  const[UserRole, setUserRole] = useState("");
  const[UserOrganization, setUserOrganization] = useState("");
  const handleAdminClick = () => {
    navigate('/Admin');
    setNotHome(false);
    setPrevRoom(room);
  };  
  
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

  const [room, setRoom] = useState('');
  // const [darkMode, setDarkMode] = useState("");
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
   // Assuming 'view' is the default selected icon

  
  
  const { darkTheme, toggleDarkTheme } = props;
  
    useEffect(() => {
    getIdTokenClaims()
    .then((res) => {
      console.log('Role:', res);
      setUserRole(res?.role);
      setUserOrganization(res?.organization);
       console.log("organization is here",UserOrganization )
       if (isAuthenticated) {
        // Fetch location data for the specified organization
        
        //fetch(` https://pmsind.co.in:5000/Location`, {
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
  // Assuming userRole is set appropriately based on your authentication logic
  if (UserRole === 'Hospital Technician' && (location.pathname === '/patient-monitor'  )) {
    // Redirect to the appropriate page if the user tries to access an unauthorized page
    navigate('/device-monitor');
  }

  if (UserRole === 'Hospital Clinician' && (location.pathname === '/rooms' || location.pathname === '/Admin' || location.pathname === '/device-monitor'  )) {
    // Redirect to the appropriate page if the user tries to access an unauthorized page
    navigate('/patient-monitor'); // You might want to redirect to another page or show an error
  }

  if (UserRole === 'Phoenix' && location.pathname !== '/organization') {
    // Redirect to the Phoenix page if the user is authenticated with the role "Phoenix"
    navigate('/organization');
  }
}, [isAuthenticated, UserRole, location.pathname, navigate]);

    const handleBackButtonClick = () => {
    setNotHome(true)
    if(UserRole === 'Hospital Technician' ){
      navigate('/device-monitor')
    }
    else{
      navigate('/patient-monitor')
    }
    setRoom(prevRoom || props.currentRoom); // Display the previous room name if available, else the current room
  };
   
  
  // function setSearchQuery(value: string): void {
  //   throw new Error('Function not implemented.');
  // }

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
              {notHome && UserRole === 'Hospital Clinician' && (
              <div style={{marginRight:'auto'}}>
       
<Stack sx={{backgroundColor: darkTheme?'' :'#FFFFFF', borderRadius: '25px'}}> 
                   <TextField
        variant="outlined"
        size="small"
        
        inputProps={{ style: { color: darkTheme?'white' :'#124D81'  } }} // Set text color to blue
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
      
        placeholder="Search Baby Name/ID"
        style={{ width: '300px' }} 
        onChange={(e) => props.setSearchQuery(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon style={{ color: darkTheme?'white':'black' }} />
              
            </InputAdornment>
          ),
        }}
      /></Stack>
      </div> 
     
               )}
              {screenSize ? (
                <>
                  {/* Your content for larger screens */}
                  <Stack direction={'row'} justifyContent={'center'} textAlign={'center'} >
                    {notHome && UserRole === 'Hospital Technician' && (
                      <>
                        {/* <CustomSwitch onChange={handleDMSChange} checked={darkMode} /> */}
                        <Divider orientation="vertical" flexItem sx={{ marginRight: '20px', marginLeft: '20px' }} />
                        <FormControl variant="standard" sx={{ width: '200px',backgroundColor: darkTheme ? '':'#F3F2F7' }}>
                        {/* <InputLabel id="demo-simple-select-standard-label" disabled sx={{  color: darkTheme? 'white':'#124D81 !important' }}>Room</InputLabel> */}
                          <Select label="Room" onChange={handleSetRoom} value={room}  MenuProps={{MenuListProps: { disablePadding: true },sx: { '&& .Mui-selected': { backgroundColor: '#124D81',color: '#FFFFFF',},},}}sx={{ color: darkTheme?'white': '#124D81' }}>
                            {temproom.map((room) => {
                                 return (
                               <MenuItem key={room.resource.id} onClick={() => {
                                    setNotHome(true);
                                    
                                  }}
                                  value={String(room.resource.name)}
                                  sx={{justifyContent: 'center',padding: '6%',backgroundColor: '#F3F2F7',color: '#124D81'}}
                                  // disabled={UserRole === 'Hospital Technician'}
                                >
                                  {/* {room.resource.name.toString()} */} 
                                  {room.resource.name.toString()}
                                </MenuItem>
                                 );
                              })}
                            
              <MenuItem value="R&D" sx={{width: '250px',padding: '6%', paddingLeft:'20px',backgroundColor: '#F3F2F7', color: '#124D81',borderTop:'1px solid black'}} onClick={() => {navigate('/rooms');setNotHome(false);setPrevRoom(room);}}>Rooms & Device Settings <SettingsIcon sx={{ marginLeft: 'auto' }}/></MenuItem>
              <MenuItem value="R&D" sx={{width: '250px',padding: '6%',paddingLeft: '20px',backgroundColor: '#F3F2F7', color: '#124D81'}}onClick={handleAdminClick}>Admin Access <PersonIcon sx={{ marginLeft: 'auto' }} /></MenuItem>
                          </Select>
                          </FormControl>
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
                        <Divider orientation="vertical" flexItem sx={{ marginLeft: '20px' }} />
                  
                        
                      </>
                    )}
                   {/* <div style={{ marginLeft: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                   
      <IconButton onClick={toggleDarkTheme}   sx={{backgroundColor:darkTheme ? '#124D81' : '#FFFFFF',height:'40px',width:'40px' }}>
        <BedtimeIcon style={{ color: darkTheme ? '#BFDEFF' : '#124D81', fontSize: '1.4rem' }} />
      </IconButton>
                    </div> */}
                   
                    <div style={{ display: 'flex', alignItems: 'center' }}>
             
              <IconButton   onClick={handleMenu}   sx={{height:'40px',width:'40px' }}>
        
        {/* <AccountCircle style={{ color: darkTheme ? '#BFDEFF' : '#124D81', fontSize: '1.8rem' }} /> */}
        < DehazeIcon style={{ color: darkTheme ? '#BFDEFF' : '#124D81', fontSize: '1.8rem' }} />
        
      </IconButton>
      <Menu
      anchorEl={anchorEl}
      open={state}
      onClose={() => { setAnchorEl(null); }}
      MenuListProps={{ disablePadding: true }}
    >
      <Box width={'270px'} sx={{ backgroundColor: darkTheme ? '#000000' : '#F3F2F7', color: darkTheme ? '' : '#124D81',border:'3px solid  grey' }}>
      <Stack direction={'row'} width={'100%'} padding={'5px'}>
          <Avatar style={{ marginTop: '5%', width: 70, height: 70 }}>
            <Typography variant="h3">{String(user?.nickname)[0].toUpperCase()}</Typography>
          </Avatar>
          <Stack>
            <Typography variant="h6" style={{ marginLeft: '10%', marginTop: '2%' }}>
              {user?.nickname}
            </Typography>
            <Typography variant="caption" style={{ marginLeft: '10%', marginTop: '1%' }}>
              {user?.email}
            </Typography>
            <Typography variant="subtitle2" style={{ marginLeft: '10%', marginTop: '2%' }}>
              {user?.role}
            </Typography>
          </Stack>
          
        </Stack>

        <Stack direction="row" justifyContent="flex-end" padding="5px">
          <Button
            onClick={() => logout()}
            sx={{ backgroundColor: '#124D81', color: 'white', textTransform: 'capitalize' }}
          >
            <Typography variant="caption">Sign out</Typography>
          </Button>
        </Stack>

        <Divider sx={{ border: '0.3px solid grey' }} />
        <Stack alignItems="flex-start" sx={{ marginTop: '5px', marginLeft: '5px' }}>
          <Typography variant="body1">View</Typography>
        </Stack>
        <Stack direction="row" width="100%" justifyContent="space-evenly" sx={{ marginY: '5px' }}>
        
          <IconButton onClick={() => handleIconClick('view')} sx={{ height: '40px', width: '40px' }}>
            <ViewCompactIcon style={{ color: props.selectedIcon === 'view' ?(darkTheme ? '#124D81' : '#62ECFF'):(!darkTheme ? '#1C1C1E' : ''), fontSize: '2rem' }}  />
          </IconButton>
          <IconButton onClick={() => handleIconClick('apps')} sx={{ height: '40px', width: '40px'  }}>
            <AppsIcon style={{ color: props.selectedIcon === 'apps' ?(darkTheme ? '#124D81' : '#62ECFF'):(!darkTheme ? '#1C1C1E' : ''), fontSize: '2rem' }} />
          </IconButton>
          <IconButton onClick={() => handleIconClick('vertical')} sx={{ height: '40px', width: '40px' }}>
            <VerticalSplitIcon style={{ color: props.selectedIcon === 'vertical' ?(darkTheme ? '#124D81' : '#62ECFF'):(!darkTheme ? '#1C1C1E' : ''), fontSize: '2rem' }} />
          </IconButton>
         
        </Stack>
        <Divider sx={{ border: '0.3px solid grey' }} />
        <Stack direction="row" width="100%" justifyContent="space-between" alignItems="center" sx={{ padding: '5px' }}>
          <Typography variant="subtitle2">Dark mode</Typography>
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
{/* mobile view */}
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
                                  <MenuItem value="R&D" sx={{width: '100%',padding: '6%',paddingLeft: '20px',backgroundColor: '#131726',textAlign:'space-between,'}}onClick={handleAdminClick}>Admin Access <PersonIcon sx={{ marginLeft: 'auto' }} /></MenuItem></> )}
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