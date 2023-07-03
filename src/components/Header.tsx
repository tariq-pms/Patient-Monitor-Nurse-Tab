import React, { useState } from 'react'
import { AppBar, Menu, MenuItem } from '@mui/material'
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { AccountCircle } from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link } from 'react-router-dom';
import pmsLogo from "../assets/phx_logo.png";
import { useAuth0 } from '@auth0/auth0-react';

export const Header = () => {

  const {isLoading, user, isAuthenticated, loginWithRedirect, logout} = useAuth0();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);



  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {

      setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
      setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{backgroundColor: 'radial-gradient(circle, rgba(43,52,85,1) 0%, rgba(12,14,23,1) 100%)'}}>
        <Toolbar>
        {/* <Typography
          variant="h5"
          noWrap
          component="a"
          href=""
          sx={{
            mr: 2,
            display: 'flex',
            flexGrow: 1,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.1rem',
            textDecoration: 'none',
            color: 'white'
          }}
        >
          Device Monitor
        </Typography> */}
        <div style={{display: 'flex', marginRight:'auto'}}>
        <Link to="/">
          <img src={pmsLogo} alt="Phoenix"/>
        </Link>
        </div>
          {
          !isLoading && isAuthenticated && 
          <div>
            <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <Link to="user"><MenuItem onClick={handleClose}>My Account</MenuItem></Link>
                <MenuItem onClick={() => logout()}>Logout</MenuItem>
            </Menu>
          </div>
        }
        {
          !isLoading && !isAuthenticated &&
          <Button variant='contained' onClick={() => loginWithRedirect()}>Sign In</Button>
        }
              
        {/* {auth && (
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            {/* <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>My account</MenuItem>
            </Menu> */}
          {/* </div>
        )} */}
        {
          !isLoading && isAuthenticated && 
          <IconButton size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <SettingsIcon />
          </IconButton>
        }
          
        </Toolbar>
      </AppBar>
    </Box>
  );
}
