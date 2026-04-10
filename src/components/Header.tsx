import React, { FC, useEffect, useState } from 'react';
import { AppBar, Divider, IconButton,  Menu, Stack, useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';


import Button from '@mui/material/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import pmsLogo from '../assets/image 135.png';
import { useAuth0 } from '@auth0/auth0-react';
import { Typography } from '@material-ui/core';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
// BedIcon removed - not used

export interface HeaderProps {
  currentRoom: string;
  roomChange: (roomId: string) => void;
  // roomAltered: boolean;
  userOrganization: string;
  // darkTheme: boolean;
  // toggleDarkTheme: () => void;
  // setSearchQuery: (query: string) => void;

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
  const { user, isLoading, isAuthenticated, logout, getIdTokenClaims } = useAuth0();
  const [UserRole, setUserRole] = useState("");
  const [UserOrganization, setUserOrganization] = useState("");



  // const [notHome, setNotHome] = useState(true);
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
        // console.log('notHome:', notHome);
        console.log('temproom:', temproom);
        console.log('dark mode true or false : ', darkTheme);
        setUserRole(res?.role);
        setUserOrganization(res?.organization);
        console.log("organization is here", UserOrganization)
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
  }, [isAuthenticated, UserOrganization]);

  useEffect(() => {
    if (UserRole === 'Hospital Clinician' &&
      (location.pathname === '/rooms' || location.pathname === '/Admin' ||
        location.pathname === '/organization' || location.pathname === '/device-monitor')) {
      navigate('/patient-monitor');
    }

    if (UserRole === 'Hospital Technician' &&
      (location.pathname === '/patient-monitor' || location.pathname === '/organization')) {
      navigate('/administration');
    }

    if (UserRole === 'Phoenix' && location.pathname !== '/organization') {
      navigate('/organization');
    }


  }, [isAuthenticated, UserRole, location.pathname, navigate]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#F5F5F5',
          boxShadow: 'none',
          borderBottom: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
        }}
      >
        {/* ✅ FIX 1: disableGutters + sx override removes default Toolbar min-height on mobile */}
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: { xs: 52, sm: 64 } }}>
          {!isLoading && isAuthenticated && (
            <>
              {/* ✅ FIX 2: Remove the hardcoded width:'55%' wrapper — just use marginRight:'auto' directly */}
              <Box sx={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: isMobile ? '60px' : '120px',
                  }}
                >
                  <img
                    src={pmsLogo}
                    alt="Logo"
                    style={{ width: isMobile ? '60px' : '120px', height: 'auto' }}
                  />
                  <Typography
                    variant="h2"
                    style={{
                      color: props.darkTheme ? 'white' : '#124D81',
                      fontSize: isMobile ? '0.75rem' : '1.5rem',
                      fontWeight: 400,
                      lineHeight: 1,
                    }}
                  >
                    <span style={{ color: '#185284' }}>Neo</span>
                    <span style={{ color: '#01AEEE', marginLeft: '2px' }}>Life</span>
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" justifyContent="center" textAlign="center" alignItems="center">
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ backgroundColor: darkTheme ? '#1C1C1E' : '#D6D6D6' }}
                />

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton onClick={handleMenu} sx={{ height: '40px', px: { xs: 0.5, sm: 1 } }}>
                    <AccountCircleRoundedIcon style={{ color: darkTheme ? 'white' : '#124D81' }} />
                    {/* ✅ FIX 3: Truncate long names */}
                    <Typography
                      variant="caption"
                      style={{
                        color: darkTheme ? 'white' : '#124D81',
                        maxWidth: isMobile ? '80px' : '160px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                      }}
                    >
                      {user?.name}
                    </Typography>
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={state}
                    onClose={() => setAnchorEl(null)}
                    MenuListProps={{ disablePadding: true }}
                    // ✅ FIX 4: Constrain menu to viewport width on mobile
                    PaperProps={{
                      sx: {
                        width: { xs: 'calc(100vw - 32px)', sm: '270px' },
                        maxWidth: '270px',
                        borderRadius: '16px',
                      },
                    }}
                    // Anchor to bottom-right of the button on mobile so it doesn't go off-screen
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box
                      sx={{
                        backgroundColor: darkTheme ? '#000000' : '#F3F2F7',
                        color: darkTheme ? '' : '#124D81',
                        border: '4px solid #AEAEAE',
                        borderRadius: '16px',
                      }}
                    >
                      <Stack direction="row" width="100%" padding="5px" alignItems="center">
                        <Box sx={{ marginRight: '8px' }}>
                          <AccountCircleRoundedIcon
                            style={{ fontSize: '44px', color: darkTheme ? 'white' : '#124D81' }}
                          />
                        </Box>
                        <Stack justifyContent="center" sx={{ minWidth: 0 }}>  {/* minWidth:0 prevents text overflow */}
                          <Typography
                            variant="h6"
                            style={{ color: darkTheme ? 'white' : '#124D81', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {user?.nickname}
                          </Typography>
                          <Typography
                            variant="caption"
                            style={{ color: darkTheme ? 'white' : '#124D81', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {user?.email}
                          </Typography>
                          <Typography variant="caption" style={{ color: darkTheme ? 'white' : '#124D81' }}>
                            {user?.role}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="row" justifyContent="flex-end" pb="12px" pr="22px">
                        <Button
                          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                          sx={{ backgroundColor: '#124D81', color: 'white', textTransform: 'capitalize' }}
                        >
                          <Typography variant="caption">Sign out</Typography>
                        </Button>
                      </Stack>

                      <Divider sx={{ border: '0.3px solid #AEAEAE' }} />

                      <Stack direction="row" width="100%" justifyContent="space-around" alignItems="center">
                        <Typography variant="subtitle1" style={{ marginTop: '4px' }}>Theme</Typography>
                        <IconButton onClick={toggleDarkTheme}>
                          <DarkModeOutlinedIcon sx={{ color: '#64748B' }} />
                        </IconButton>
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