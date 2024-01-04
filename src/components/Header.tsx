import React, { FC, useEffect, useState } from 'react';
import {AppBar, Collapse, Divider,Drawer,FormControl,IconButton,InputLabel,List,ListItem,ListItemButton,ListItemText,Menu,MenuItem,Select,SelectChangeEvent, Stack,Switch, SwitchProps, ToggleButton, ToggleButtonGroup, styled, useMediaQuery, useTheme} from '@mui/material';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import SettingsIcon from '@mui/icons-material/Settings';
import Button from '@mui/material/Button';
import { AccountCircle, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate,useLocation } from 'react-router-dom';
import pmsLogo from '../assets/phx_logo.png';
import { useAuth0 } from '@auth0/auth0-react';
import { Avatar, Typography } from '@material-ui/core';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
export interface HeaderProps {
  currentRoom: string;
  roomChange: (roomId: string) => void;
  roomAltered: boolean;
 
}

export const Header: FC<HeaderProps> = (props) => {
  const [smallList, setSmallList] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const screenSize = useMediaQuery(theme.breakpoints.up('md'));
  const { user, isLoading, isAuthenticated, logout, getIdTokenClaims } = useAuth0();
  const[UserRole, setUserRole] = useState("");
  //const[UserOrganization, setUserOrganization] = useState("");

  // getIdTokenClaims().then(res => {console.log('result',res)}).catch(err => {console.log("FAIL FUCL:"+err)})
  
  // console.log(user)
  const handleAdminClick = () => {
    navigate('/Admin');
    setNotHome(false);
    setPrevRoom(room);
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
  const [darkMode, setDarkMode] = useState(true);
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
  const handleSetRoom2 = (value: any) => {
    console.log(value)
    setRoom(value);
    props.roomChange(
      temproom[
        temproom.findIndex(
          (item) => item.resource.name.toString() === String(value)
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
  const CustomSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
  ))(({ theme }) => ({
    marginTop: 10,
    width: 130,
    height: 30,
    padding: 0,
  
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      color:'#00B1FD',
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(100px)',
        color: '#00B1FD',
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.mode === 'dark' ? '#39393D' : '#65C466',
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: '#33cf4d',
        border: '6px solid #fff',
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color:
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 22,
      height: 22,
      marginTop: 2,
      marginLeft: 2,
    },
    '& .MuiSwitch-track': {
      borderRadius: 22/ 2,
      backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
  
      '&::before': {
        content: '""', 
        position: 'absolute',
        top: '10%',
        left: '1px', 
        color: 'white',
        padding: '5px', 
        borderRadius: '4px', 
      },
  
      '&::after': {
        content: '"Baby Mode"', 
        position: 'absolute',
        top: '10%',
        right: '5px', 
        color: 'white',
        padding: '5px', 
        borderRadius: '4px',
      },
    },
    '& .Mui-checked + .MuiSwitch-track::before': {
      content: '"Device Mode"', 
    },
    '& .Mui-checked + .MuiSwitch-track::after': {
      content: '""', 
      
    },
  }));
  const [temp, settemp] = useState(false)
  
  const handleDMSChange = () => {
    // Handle the state change when the switch is toggled
    setDarkMode(!darkMode);
  
    // If darkMode is true, navigate to the '/' (home) route
    // If darkMode is false, navigate to the '/rooms' route
    if (darkMode) {
      navigate('/patient-monitor');
    } else {
     navigate('/device-monitor');
    }
  };

useEffect(() => {
  getIdTokenClaims()
    .then((res) => {
      console.log('Role:', res);
      setUserRole(res?.role);
      //setUserOrganization(res?.organization);
       //console.log("organization",res?.organization )


      if (isAuthenticated) {
        // Fetch location data for the specified organization
        fetch(` https://pmsind.co.in:5000/Location`, {
          //fetch(` https://pmsind.co.in:5000/Location?organization=${res?.organization}`, {
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
}, [isAuthenticated]);

useEffect(() => {
  // Assuming userRole is set appropriately based on your authentication logic
  if (UserRole === 'Hospital Technician' && location.pathname === '/patient-monitor') {
    // Redirect to the appropriate page if the user tries to access an unauthorized page
    navigate('/device-monitor');
  }

  if (UserRole === 'Hospital Clinician' && (location.pathname === '/rooms' || location.pathname === '/Admin' )) {
    // Redirect to the appropriate page if the user tries to access an unauthorized page
    navigate('/device-monitor'); // You might want to redirect to another page or show an error
  }
}, [UserRole, location.pathname, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch(` https://pmsind.co.in:5000/Location`, {
      //fetch(` https://pmsind.co.in:5000/Location?organization=${UserOrganization}`, {
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
        });
    }
  }, [props.roomAltered, isAuthenticated]); // Dependencies include props.roomAltered and isAuthenticated

  const handleBackButtonClick = () => {
    setNotHome(true)
    if(darkMode){
      navigate('/device-monitor')
    }
    else{
      navigate('/patient-monitor')
    }
    setRoom(prevRoom || props.currentRoom); // Display the previous room name if available, else the current room
  };
  const deviceModeValue = darkMode ? room : '';


  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none' }} sx={{ boxShadow: '0px 5px 5px 0px yellow' }}>
        <Toolbar>
          {!isLoading && isAuthenticated && (
            <>
              <div style={{ display: 'flex', marginRight: 'auto' }}>
                <Box onClick={handleBackButtonClick} sx={{ cursor: 'pointer' }}>
                  <img src={pmsLogo} alt="Phoenix" style={{ maxWidth: '70%', height: 'auto' }} />
                </Box>
              </div>
              {screenSize ? (
                <>
                  {/* Your content for larger screens */}
                  <Stack direction={'row'} justifyContent={'center'} textAlign={'center'}>
                    {notHome && UserRole === 'Hospital Technician' && (
                      <>
                        {/* <CustomSwitch onChange={handleDMSChange} checked={darkMode} /> */}
                        <Divider orientation="vertical" flexItem sx={{ marginRight: '20px', marginLeft: '20px' }} />
                        <FormControl variant="standard" sx={{ width: '200px' }}>
                          <InputLabel id="demo-simple-select-standard-label">Room</InputLabel>
                          <Select
                            label="Room"
                            onChange={handleSetRoom}
                            value={deviceModeValue}
                            MenuProps={{
                              MenuListProps: { disablePadding: true },
                              sx: {
                                '&& .Mui-selected': {
                                  backgroundColor: '#2BA0E0',
                                },
                              },
                            }}
                          >
                            {temproom.map((room) => (
                               <MenuItem
                                  key={room.resource.id}
                                  onClick={() => {
                                    setNotHome(true);
                                    if (darkMode) {
                                      // Check user role before navigating to patient-monitor
                                      if (UserRole === undefined) {
                                        // Technician should not access patient-monitor
                                        // Redirect or show an error message as needed
                                        console.log("Hospital Technicians cannot access patient-monitor");
                                      } else {
                                        navigate('/device-monitor');
                                      }
                                    } else {
                                      navigate('/device-monitor');
                                    }
                                  }}
                                  value={String(room.resource.name)}
                                  sx={{
                                    justifyContent: 'center',
                                    padding: '6%',
                                    backgroundColor: '#131726',
                                  }}
                                  // disabled={UserRole === 'Hospital Technician'}
                                >
                                  {room.resource.name.toString()}
                                </MenuItem>
                                
                            ))}
                            <Divider sx={{border:'1px solid grey'}} ></Divider>
              <MenuItem value="R&D"
                sx={{
                  width: '250px',padding: '6%', paddingLeft:'20px',backgroundColor: '#131726'}} onClick={() => {navigate('/rooms');setNotHome(false);setPrevRoom(room);}}>
                Rooms & Device Settings <SettingsIcon sx={{ marginLeft: 'auto' }}/>
              </MenuItem>
              <MenuItem
      value="R&D"
      sx={{
        width: '250px',
        padding: '6%',
        paddingLeft: '20px',
        backgroundColor: '#131726',
      }}
      onClick={handleAdminClick}
    >
      Admin Access <PersonIcon sx={{ marginLeft: 'auto' }} />
    </MenuItem>
                          </Select>
                          
                        </FormControl>
                      </>
                    )}
                    {notHome && UserRole === 'Hospital Clinician' && (
                      <>
                        {/* Your content for Hospital Clinician */}
                        <CustomSwitch onChange={handleDMSChange} checked={darkMode} />
                        <Divider orientation="vertical" flexItem sx={{ marginRight: '20px', marginLeft: '20px' }} />
                        {/* Render a disabled component for Room and Device Settings */}
                        <FormControl variant="standard" sx={{ width: '200px' }}>
                          <InputLabel id="demo-simple-select-standard-label" disabled>
                            Room
                          </InputLabel>
                          <Select
                            label="Room"
                            onChange={handleSetRoom}
                            value={deviceModeValue}
                            MenuProps={{
                              MenuListProps: { disablePadding: true },
                              sx: {
                                '&& .Mui-selected': {
                                  backgroundColor: '#2BA0E0',
                                },
                              },
                            }}
                          >
                            {temproom.map((room) => {
                      return (
                        <MenuItem
                          key={room.resource.id}
                          onClick={() => {
                            setNotHome(true)
                            if(darkMode){
                              navigate('/device-monitor')
                            }
                            else{
                              navigate('/patient-monitor')
                            }
                          }}
                          value={String(room.resource.name)}
                          sx={{
                            justifyContent: 'center',
                            padding: '6%',
                            backgroundColor: '#131726',
                          }}
                          disabled={!darkMode}
                        >
                          {room.resource.name.toString()}
                        </MenuItem>
                      );
                    })}
                            
                          </Select>
                        </FormControl>
                      </>
                    )}
                    {/* Common code for both roles */}
                    <Divider orientation="vertical" flexItem sx={{ marginLeft: '20px' }} />
                    <Button
                      size="large"
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      color="inherit"
                      sx={{ marginLeft: '10px', justifyContent: 'center', textAlign: 'center' }}
                      endIcon={<AccountCircle />}
                    >
                      <Typography variant="subtitle1" component="h2">
                        &nbsp; {user?.name} &nbsp;
                      </Typography>
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={state}
                      onClose={() => {
                        setAnchorEl(null);
                      }}
                      MenuListProps={{ disablePadding: true }}
                    >
                       <Box width={'350px'} height={'200px'} sx={{ backgroundColor: '#131726' }}>
                          <Stack direction={'row'} justifyContent={'space-between'}>
                            <Typography style={{ marginLeft: '5%', marginTop: '5%', marginBottom: '5%' }}>
                              Hospital Name
                            </Typography>
                            <Button onClick={() => logout()} sx={{ color: 'white', textTransform: 'capitalize' }}>
                              <Typography variant="subtitle2">Sign out</Typography>
                            </Button>
                          </Stack>
                          <Stack direction={'row'} width={'100%'}>
                            <Avatar style={{ marginLeft: '5%', marginTop: '2%', width: 100, height: 100 }}>
                              {(() => (
                                <Typography variant="h3">{String(user?.nickname)[0].toUpperCase()}</Typography>
                              ))()}
                            </Avatar>
                            <Stack>
                              <Typography variant="h5" style={{ marginLeft: '10%', marginTop: '2%' }}>
                                {user?.nickname}
                              </Typography>
                              <Typography variant="subtitle1" style={{ marginLeft: '10%', marginTop: '2%' }}>
                                {user?.email}
                              </Typography>
                              <Typography variant="subtitle2" style={{ marginLeft: '10%', marginTop: '2%' }}>
                                Designation
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                    </Menu>
                  </Stack>
                </>
              ) : (
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
    <ToggleButtonGroup
      color="primary"
      value={darkMode ? 'dark' : 'light'}
      exclusive
      onChange={handleDMSChange}
      aria-label="Dark Mode Switch"
    >
      <ToggleButton value="light" sx={{ width: 'auto' }}>
        Baby Mode
      </ToggleButton>
      <ToggleButton value="dark" sx={{ width: 'auto' }}>
        Device Mode
      </ToggleButton>
    </ToggleButtonGroup>
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
                                    if (darkMode) {
                                      handleSetRoom2(room.resource.name);
                                      setNotHome(true);
                                      navigate('/device-monitor');
                                    }
                                  }}
                                  sx={{
                                    marginLeft: '20px',
                                    padding: '6%',
                                    backgroundColor: '',
                                  }}
                                  disabled={!darkMode}
                                >
                                  {room.resource.name.toString()}
                                </ListItemButton>
                                
                              </ListItem>
                            ))}
                            {notHome && UserRole === 'Hospital Technician' && (
                              <><MenuItem
                                  value="R&D"
                                  sx={{
                                    width: 'auto', padding: '6%', backgroundColor: '#131726', borderTop: '1px solid grey',
                                  }}
                                  onClick={() => {
                                    navigate('/rooms');
                                    setNotHome(false);
                                    setPrevRoom(room);
                                  } }
                                >
                                  Rooms & Device Settings <SettingsIcon sx={{ marginLeft: 'auto' }} />
                                </MenuItem><MenuItem
                                  value="R&D"
                                  sx={{
                                    width: '100%',
                                    padding: '6%',
                                    paddingLeft: '20px',
                                    backgroundColor: '#131726',
                                    textAlign:'space-between,'
                                  }}
                                  onClick={handleAdminClick}
                                  
                                >
                                    Admin Access <PersonIcon sx={{ marginLeft: 'auto' }} />
                                  </MenuItem></>
                              
                            )}
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
