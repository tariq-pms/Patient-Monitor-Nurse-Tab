import { useState } from 'react'
import { AppBar } from '@mui/material'
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
// import List from '@mui/material/List';
// import Divider from '@mui/material/Divider';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
// import useMediaQuery from '@mui/material/useMediaQuery';
// import { useTheme } from '@mui/material/styles';
// import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { AccountCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import pmsLogo from "../assets/phx_logo.png";
import { useAuth0 } from '@auth0/auth0-react';
import { SettingsMenu } from './SettingsMenu';
// type Anchor = 'right';

export const Header = () => {
  // const [temproom, settemproom] = useState([])
  // const [open, setOpen] = React.useState(false);
  // const theme = useTheme();
  // const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [state, setState] = useState(false)
  const {isLoading, isAuthenticated, loginWithRedirect} = useAuth0();
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const handleMenu = (event: React.MouseEvent<HTMLElement>) => {

  //     setAnchorEl(event.currentTarget);
  // };
  // const handleClose = () => {
  //     setAnchorEl(null);
  // };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none'}} >
        <Toolbar>
        <div style={{display: 'flex', marginRight:'auto'}}>
        <Link to="/">
          <img src={pmsLogo} alt="Phoenix" style={{
        maxWidth: '70%', // Set the maximum width to 100%
        height: 'auto', // Maintain the aspect ratio
      }}/>
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
            onClick={() => {setState(true)}}
            color="inherit"
            >
              <AccountCircle sx={{ fontSize: 35 }}/>
            </IconButton>
            <Drawer
            anchor={'right'}
            open={state}
            onClose={() => {setState(false)}}
          >
            <SettingsMenu></SettingsMenu>
          </Drawer>
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
                <MenuItem onClick={handleClose}>My Account</MenuItem>
                <MenuItem onClick={() => logout()}>Logout</MenuItem>
            </Menu> */}
          </div>
        }
        {
          !isLoading && !isAuthenticated &&
          <Button variant='contained' onClick={() => loginWithRedirect()}>Sign In</Button>
        }
        </Toolbar>
      </AppBar>
    </Box>
  );
}
