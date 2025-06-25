import React, { FC, useEffect, useState } from 'react';
import {AppBar, Divider,FormControl,IconButton,Switch,Menu,MenuItem,Select,SelectChangeEvent, Stack, useMediaQuery, useTheme} from '@mui/material';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import SettingsIcon from '@mui/icons-material/Settings';
import Button from '@mui/material/Button';
import { useNavigate,useLocation } from 'react-router-dom';
import pmsLogo from '../assets/image 135.png';
import { useAuth0 } from '@auth0/auth0-react';
import { Typography } from '@material-ui/core';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import DehazeIcon from '@mui/icons-material/Dehaze';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import AppsIcon from '@mui/icons-material/Apps';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronLeft, faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';


export interface HeaderProps {
  currentRoom: string;
  roomChange: (roomId: string) => void;
  roomAltered: boolean;
  userOrganization: string;
  // darkTheme: boolean;
  // toggleDarkTheme: () => void;
  // setSearchQuery: (query: string) => void;
  selectedIcon: string; 
  setSelectedIcon: (icon: string) => void;
  darkTheme: boolean;
  onAddClick: () => void;
  toggleDarkTheme: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  setSearchQuery: (query: string) => void; 
}


export const Header: FC<HeaderProps> = (props) => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
 
 
 const [prevRoom, setPrevRoom] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const state = Boolean(anchorEl);

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
    navigate('patient-monitor');
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


const handleBackButtonClick = () => {
  setNotHome(true);

  if (UserRole === 'Hospital Technician') {
      navigate('/patient-monitor');
  } else if (UserRole === 'Service') {
      navigate('/service');
  } else {
      navigate('/patient-monitor');
  }

  setRoom(prevRoom || props.currentRoom); 
};





  return (
   <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none' }} >
        <Toolbar>
          {!isLoading && isAuthenticated && (
            <>
              <div style={{ marginRight: 'auto' }}>
              <Box onClick={handleBackButtonClick} sx={{ cursor: 'pointer',width:'55%',maxWidth: '55%', }}>
              <IconButton 
            onClick={props.onToggleSidebar} 
            size={isMobile ? 'small' : 'medium'}
            
          >
            <FontAwesomeIcon
              icon={props.isSidebarCollapsed ? faCircleChevronRight : faCircleChevronLeft}
              style={{ 
                color: props.darkTheme ? '#BFDEFF' : '#124D81', 
                fontSize: isMobile ? '1.2rem' : '1.8rem' 
              }}
            />
          </IconButton>
              <img 
              src={pmsLogo} // Replace with your logo path
              alt="Logo" 
              style={{ 
                width: isMobile ? '60px' : '100px', 
                height: 'auto'
              }} 
            />
                    <Typography
    variant="h2"
    style={{
      color: darkTheme ? 'white' : '#124D81',
      
      display: 'flex', // Use flexbox to separate colors for Neo and Life
      
      fontSize: '1.6rem', // Ensure the font size matches the logo
      fontWeight: 400, // Bold text for emphasis
    }}
  >
                    <span style={{ color: '#185284' }}>Neo</span>
                    <span style={{ color: '#01AEEE', marginLeft: '4px' }}>Life</span>
                    </Typography>
                  </Box>
                  
                
                  
                 
            </div>
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
          )}
        </Toolbar>
      </AppBar>
    </Box>
    
  );
};