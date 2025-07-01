import React, { FC,  useState } from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Badge, Menu, MenuItem,
  TextField, InputAdornment, Button, Switch, Typography
} from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useNotification } from "../contexts/NotificationContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCircleChevronLeft, faCircleChevronRight, 
  faPlus, faUserCircle, faUserNurse 
} from '@fortawesome/free-solid-svg-icons';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import pmsLogo from '../assets/image 135.png';

export interface HeaderProps {
  darkTheme: boolean;
  onAddClick: () => void;
  toggleDarkTheme: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  setSearchQuery: (query: string) => void;
}

export const Header: FC<HeaderProps> = (props) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated, logout } = useAuth0();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { notifications, clearNotifications } = useNotification();
  const [anchorElNotification, setAnchorElNotification] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorElNotification(event.currentTarget);
  const handleNotificationsClose = () => setAnchorElNotification(null);

  return (
    <AppBar position="static" sx={{ background: '#FFFFFF', boxShadow: 'none' }}>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        padding: isMobile ? '8px 4px' : '16px'
      }}>
        {/* Left Side: Logo, Sidebar Toggle, Search */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? 1 : 2,
          flexGrow: 1,
          maxWidth: '800px'
        }}>
          {/* Sidebar Toggle */}
          <IconButton 
            onClick={props.onToggleSidebar} 
            size={isMobile ? 'small' : 'medium'}
            sx={{ mr: 1 }}
          >
            <FontAwesomeIcon
              icon={props.isSidebarCollapsed ? faCircleChevronRight : faCircleChevronLeft}
              style={{ 
                color: props.darkTheme ? '#BFDEFF' : '#124D81', 
                fontSize: isMobile ? '1.2rem' : '1.6rem' 
              }}
            />
          </IconButton>

          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              minWidth: isMobile ? '80px' : '100px'
            }}
            onClick={() => navigate('/')}
          >
            <img 
              src={pmsLogo} // Replace with your logo path
              alt="Logo" 
              style={{ 
                width: isMobile ? '60px' : '80px', 
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
                    flexGrow: isMobile ? 1 : 0
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
                          padding: isMobile ? '6px 8px' : '10px 14px',
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

        {/* Right Side: Buttons, Notifications, User Menu */}
        {isAuthenticated && (
          <Box sx={{ 
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

            {/* Notifications */}
            <IconButton
              onClick={handleNotificationsOpen}
              sx={{
                backgroundColor: Boolean(anchorElNotification) ? (props.darkTheme ? '#333' : '#FFFFFF') : 'transparent',
                borderRadius: '50%',
              }}
              size={isMobile ? 'small' : 'medium'}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon style={{ 
                  color: props.darkTheme ? '#BFDEFF' : '#124D81', 
                  fontSize: isMobile ? '1.2rem' : '1.5rem' 
                }} />
              </Badge>
            </IconButton>

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
          </Box>
        )}

        {/* Notifications Menu */}
        <Menu
          anchorEl={anchorElNotification}
          open={Boolean(anchorElNotification)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: {
              width: isMobile ? '90vw' : '400px',
              backgroundColor: props.darkTheme ? '#000000' : '#F3F2F7',
          
              overflowY: 'auto',
            }
          }}
        >
          {notifications.length === 0 ? (
            <MenuItem>No Notifications</MenuItem>
          ) : (
            notifications.map((notification) => (
              <MenuItem key={notification.id} sx={{ borderBottom: '1px solid lightgray' }}>
                {notification.message}
              </MenuItem>
            ))
          )}
          <MenuItem>
            <Button 
              fullWidth 
              onClick={clearNotifications} 
              disabled={notifications.length === 0}
              sx={{ backgroundColor: '#124D81', color: 'white' }}
            >
              Clear All
            </Button>
          </MenuItem>
        </Menu>

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
          <Box sx={{ width: isMobile ? '250px' : '280px', p: 1 }}>
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
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: props.darkTheme ? 'white' : '#124D81' }}>
                Dark Mode
              </Typography>
              <Switch
                checked={props.darkTheme}
                onChange={props.toggleDarkTheme}
                color="primary"
              />
            </Box>
            
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
      </Toolbar>
    </AppBar>
  );
};