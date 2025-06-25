import React, { FC, useEffect, useState } from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Badge, Menu, MenuItem,
  TextField, InputAdornment, Button, Switch, Typography,
  FormControl,
  Select,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faCircleChevronLeft, faCircleChevronRight, 
  faMaximize, 
  faMinimize, 
  faPlus, faUserCircle, faUserNurse 
} from '@fortawesome/free-solid-svg-icons';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import pmsLogo from '../assets/image 135.png';

export interface HeaderProps {
  currentRoom: string;
  roomChange: (roomId: string) => void;
  roomAltered: boolean;
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const [notHome, setNotHome] = useState(true);
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
  if ((UserRole === 'Hospital Clinician' || UserRole === 'NICU Nurse') && 
      (location.pathname === '/rooms' || location.pathname === '/administration' || 
       location.pathname === '/organization' || location.pathname === '/device-monitor')) {
    navigate('/patient-monitor');
  }
  
  if (UserRole === 'Hospital Technician' && 
      (location.pathname === '/patient-monitor' || location.pathname === '/patient' ||location.pathname === '/organization')) {
    navigate('/administration');
  }


}, [isAuthenticated, UserRole, location.pathname, navigate]);
  return (
    <AppBar position="static" sx={{ background: '#FFFFFF', boxShadow: 'none' }}>
      {!isLoading && isAuthenticated && (
         <Toolbar sx={{ 
          display: 'flex',
           
          justifyContent: 'space-between',
        
        }}>

        {/* Left Side: Logo, Sidebar Toggle, Search */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? 1 : 1,
          flexGrow: 1,
          maxWidth: '800px'
        }}>
          {/* Sidebar Toggle */}
          <IconButton 
            onClick={props.onToggleSidebar} 
            size={isMobile ? 'small' : 'medium'}
            
          >
            <FontAwesomeIcon
              icon={props.isSidebarCollapsed ?  faAngleDoubleLeft: faAngleDoubleRight }
              style={{ 
                color: props.darkTheme ? 'grey' : 'grey', 
                fontSize: isMobile ? '1.2rem' : '1.2rem' 
              }}
            />
          </IconButton>

          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              minWidth: isMobile ? '80px' : '120px'
            }}
            onClick={() => navigate('/')}
          >
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
              sx={{
                color: props.darkTheme ? 'white' : '#124D81',
                fontSize: isMobile ? '0.9rem' : '1.2rem',
                fontWeight: 400,
                lineHeight: 1,
              }}
            >
              <span style={{ color: '#185284' }}>Neo</span>
              <span style={{ color: '#01AEEE', marginLeft: '2px' }}>Life</span>
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box sx={{ 
                    minWidth: isMobile ? '150px' : '300px',
                 
                  }}>
                    <TextField
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="Mothers Name / Patient ID / Bed Number"
                      onChange={(e) => props.setSearchQuery(e.target.value)}
                      sx={{
                        backgroundColor:  '#FFFFFF',
                        borderRadius: '25px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '25px',
                          '& fieldset': {
                            borderColor: '#CED4DA',
                          },
                          '&:hover fieldset': {
                            borderColor: '#124D81',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#124D81',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: '#124D81',
                        
                          fontSize: isMobile ? '0.7rem' : '1rem',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon
                              style={{
                                color:'#124D81',
                                fontSize: isMobile ? '1rem' : '1.5rem',
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
        </Box>
        {notHome && UserRole === 'Hospital Clinician' && (
                     <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: isMobile ? 0.5 : 1
                    }}>
                       
                       <FormControl
  variant="standard"
  sx={{
    width: '150px',
    borderRadius: '16px',
    height: '35px',
    backgroundColor: '#5E84CC1A',
    '& .MuiInput-underline:before': {
      borderBottom: 'none',
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottom: 'none',
    },
  }}
>
  <Select
    label="Room"
    onChange={handleSetRoom}
    value={room}
    displayEmpty
    MenuProps={{
      MenuListProps: { disablePadding: true },
      sx: {
        '&& .Mui-selected': {
          backgroundColor: '#124D81',
          color: '#FFFFFF',
        },
      },
    }}
    sx={{
      color: '#124D81',
      textAlign: 'center', // <-- Ensures text is centered
      '.MuiSelect-select': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
    }}
  >
    {temproom.map((room) => (
      <MenuItem
        key={room.resource.id}
        onClick={() => setNotHome(true)}
        value={String(room.resource.name)}
        sx={{
          justifyContent: 'center',
         
          backgroundColor: '#F3F2F7',
          color: '#124D81',
        }}
      >
        {room.resource.name.toString()}
      </MenuItem>
    ))}
  </Select>
</FormControl>

            <IconButton 
            onClick={handleMenuOpen}
            size={isMobile ? 'small' : 'medium'}
          >
            <FontAwesomeIcon
              icon={faUserCircle}
              style={{ 
                color: props.darkTheme ? '#BFDEFF' : '#124D81', 
                fontSize: isMobile ? '1.5rem' : '1.8rem' 
              }}
            />
          </IconButton>
                      </Box>
        )}
     
     {notHome && UserRole === 'NICU Nurse' && (
                     <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: isMobile ? 0.5 : 1
                    }}>
                       
                       <FormControl
  variant="standard"
  sx={{
    width: '150px',
    borderRadius: '16px',
    height: '35px',
    backgroundColor: '#5E84CC1A',
    '& .MuiInput-underline:before': {
      borderBottom: 'none',
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottom: 'none',
    },
  }}
>
  <Select
    label="Room"
    onChange={handleSetRoom}
    value={room}
    displayEmpty
    MenuProps={{
      MenuListProps: { disablePadding: true },
      sx: {
        '&& .Mui-selected': {
          backgroundColor: '#124D81',
          color: '#FFFFFF',
        },
      },
    }}
    sx={{
      color: '#124D81',
      textAlign: 'center', // <-- Ensures text is centered
      '.MuiSelect-select': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
    }}
  >
    {temproom.map((room) => (
      <MenuItem
        key={room.resource.id}
        onClick={() => setNotHome(true)}
        value={String(room.resource.name)}
        sx={{
          justifyContent: 'center',
         
          backgroundColor: '#F3F2F7',
          color: '#124D81',
        }}
      >
        {room.resource.name.toString()}
      </MenuItem>
    ))}
  </Select>
</FormControl>

            <IconButton 
            onClick={handleMenuOpen}
            size={isMobile ? 'small' : 'medium'}
          >
            <FontAwesomeIcon
              icon={faUserCircle}
              style={{ 
                color: props.darkTheme ? '#BFDEFF' : '#124D81', 
                fontSize: isMobile ? '1.5rem' : '1.8rem' 
              }}
            />
          </IconButton>
                      </Box>
        )}
     

        {notHome && (UserRole === 'Hospital Technician') && (
        <><Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: isMobile ? 0.5 : 1
        }}>
          {/* Add Patient Button */}
         
          <Button
            sx={{
              height: '40px',
              minWidth: 'auto',
              padding: isMobile ? '6px 8px' : '8px 16px',
              backgroundColor: '#BFDEFF',
              color: '#124D81',
              textTransform: 'none',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              fontSize: isMobile ? '0.7rem' : '0.875rem',
              borderRadius: '20px'
            }}
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            onClick={props.onAddClick}
          >
            {!isMobile && 'Add Patient'}
          </Button>

         
          {/* User Menu */}
          <IconButton 
            onClick={handleMenuOpen}
            size={isMobile ? 'small' : 'medium'}
          >
            <FontAwesomeIcon
              icon={faUserCircle}
              style={{ 
                color: props.darkTheme ? '#BFDEFF' : '#124D81', 
                fontSize: isMobile ? '1.5rem' : '1.8rem' 
              }}
            />
          </IconButton>
        </Box></>
        )}
          
       
        {/* User Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              padding: 1,
              backgroundColor: props.darkTheme ? '#000000' : '#F3F2F7',
              border: '2px solid #AEAEAE'
            }
          }}
        >
          <Box sx={{ width: isMobile ? '180px' : '210px'}}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FontAwesomeIcon
                icon={faUserNurse}
                style={{ 
                  color: props.darkTheme ? '#BFDEFF' : '#124D81', 
                  fontSize: '1.5rem' 
                }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ color: props.darkTheme ? 'white' : '#124D81' }}>
                  {user?.nickname}
                </Typography>
                <Typography variant="body2" sx={{ color: props.darkTheme ? 'white' : '#124D81' }}>
                  {user?.email}
                </Typography>
                <Typography variant="body2" sx={{ color: props.darkTheme ? 'white' : '#124D81' }}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ border: '0.3px solid #AEAEAE' }} />
            {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: props.darkTheme ? 'white' : '#124D81' }}>
                Dark Mode
              </Typography>
              <Switch
                checked={props.darkTheme}
                onChange={props.toggleDarkTheme}
                color="primary"
              />
            </Box> */}
            
            <Button
              fullWidth
              onClick={() => logout()}
              sx={{ 
                mt: 1,
                backgroundColor: '#124D81', 
                color: 'white',
                '&:hover': { backgroundColor: '#0d3a63' }
              }}
            >
              Sign Out
            </Button>
          </Box>
        </Menu>
      </Toolbar>)}
    </AppBar>
  );
};