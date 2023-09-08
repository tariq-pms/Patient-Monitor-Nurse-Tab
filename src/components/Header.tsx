import { useEffect, useState } from 'react'
import { AppBar, Divider, FormControl, InputLabel, Menu, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material'
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import SettingsIcon from '@mui/icons-material/Settings';
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
import { AccountCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import pmsLogo from "../assets/phx_logo.png";
import { useAuth0 } from '@auth0/auth0-react';

import { Avatar, Typography } from '@material-ui/core';
// type Anchor = 'right';



export const Header = ({currentRoom, roomChange}) => {
  console.log(currentRoom)
  // const [temproom, settemproom] = useState([])
  // const [open, setOpen] = React.useState(false);
  // const theme = useTheme();
  // const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
 
  const {user, isLoading, isAuthenticated, loginWithRedirect, logout} = useAuth0();
  const [temproom, settemproom] = useState([{
    "resource": {
        "name": String,
        "resourceType": String,
        "id": String,
        "meta": {
            "versionId": String,
            "lastUpdated": String
        },
        "identifier": [
            {
                "value": String
            }
        ],
        "status": String,
        
    }
}])
  const [room,setRoom] = useState("");
  const handleSetRoom = (event: SelectChangeEvent) => {
      setRoom(event.target.value);
      roomChange(temproom[temproom.findIndex((item) => (item.resource.name).toString()===String(event.target.value))].resource.id)

  }

 // useEffect(() => {console.log(room);console.log(temproom.findIndex((item) => item.resource.name === room)),[room]})

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {

      setAnchorEl(event.currentTarget);
  };
  // const handleClose = () => {
  //     setAnchorEl(null);
  // };
  const state = Boolean(anchorEl)
  let index = 0;

  useEffect(() => {
    if(isAuthenticated){
      fetch(`http://13.126.5.10:9444/fhir-server/api/v4/Location`, {
          credentials: "omit",
          headers: {
            Authorization: "Basic "+ btoa("fhiruser:change-password"),
          },
        })
        .then((response) => response.json())
        .then((data) => {if(data.entry){
          settemproom(data.entry)
        }})
    }
  },[isAuthenticated])
  

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none'}} sx={{boxShadow:'0px 5px 5px 0px yellow'}} > 
      {/* boxShadow: '0 10px 3px -1px rgba(41, 45, 61, 1)' */}
        <Toolbar>

          {
          !isLoading && isAuthenticated && (
            <>          
                        <div style={{display: 'flex', marginRight:'auto'}}>
            <Link to="/">
              <img src={pmsLogo} alt="Phoenix" style={{
            maxWidth: '70%', // Set the maximum width to 100%
            height: 'auto', // Maintain the aspect ratio
          }}/>
            </Link>
            </div>
            <Stack direction={'row'} >
            <FormControl variant='standard' sx={{width:'200px'}}>
              <InputLabel id="demo-simple-select-standard-label">Room</InputLabel>
             
              <Select label="Room" onChange={handleSetRoom} value={room}
              
              MenuProps={{
                MenuListProps: { disablePadding: true },        
    sx: {
        "&& .Mui-selected": {
        backgroundColor: "#2BA0E0"
      }
    }
  }}>

              {temproom.map((room) => {
                index+=1;
                return (
                  <MenuItem value={String(room.resource.name)} sx={{ justifyContent:'center', padding:'6%',backgroundColor:'#131726' }} >{(room.resource.name).toString()}</MenuItem>
                )
              })}
              {/* {index%2!=0 && (
                <MenuItem sx={{display:'inline-flex', width:'50%', justifyContent:'center', padding:'6%', backgroundColor:'#131726'}} >...</MenuItem>
              )}               */}
              <Link to="rooms" style={{textDecoration: 'none', textDecorationColor: 'none', color:'white', width:'100%', display:'flex'}}>
                <MenuItem value="R&D" sx={{width:'250px',  padding:'6%', backgroundColor:'#131726'}}>
                    Rooms & Device Settings <SettingsIcon sx={{marginLeft:'auto'}}/>
                </MenuItem>
              </Link>
              </Select>
            </FormControl>
            <Divider orientation="vertical" flexItem sx={{marginLeft:'20px'}}/>
            <Button
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{marginLeft:'10px'}}
              endIcon={<AccountCircle />}
            >
              
                <Typography variant='subtitle1' component={"h2"}>&nbsp; {user?.nickname} &nbsp;</Typography>
            </Button>
            <Menu 
            anchorEl={anchorEl}
            open={state} onClose={() => {setAnchorEl(null)}}
            MenuListProps={{disablePadding:true}}
            >
              <Box width={'350px'} height={'200px'} sx={{backgroundColor:'#131726'}}>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography  style={{marginLeft:'5%', marginTop:'5%', marginBottom:'5%'}}>Hospital Name</Typography>
                  <Button onClick={() => logout()} sx={{color:'white', textTransform:'capitalize'}}>
                    <Typography variant="subtitle2">
                        Sign out
                    </Typography>
                    </Button>
                </Stack>
                <Stack direction={'row'}width={'100%'}>
                  <Avatar style={{marginLeft:'5%', marginTop:'2%', width:100, height:100}}>{(() => {
                    return (<Typography variant='h3'>{String(user?.nickname)[0].toUpperCase()}</Typography>)
                  })()}
                  </Avatar>
                  <Stack>
                  <Typography variant='h5' style={{marginLeft:'10%', marginTop:'2%'}}>{user?.nickname}</Typography>
                  <Typography variant='subtitle1' style={{marginLeft:'10%', marginTop:'2%'}}>{user?.email}</Typography>
                  <Typography variant='subtitle2' style={{marginLeft:'10%', marginTop:'2%'}}>Designation</Typography>
                  </Stack>
                  
                </Stack>
              </Box>
            </Menu>
            {/* <Drawer
            anchor={'right'}
            open={state}
            onClose={() => {setState(false)}}
            onClick={() => {setState(false)}}
            >
              <SettingsMenu />
          </Drawer> */}
          </Stack></>

            
          )

        }
        {/* {
          !isLoading && !isAuthenticated &&
          <Button variant='contained' onClick={() => loginWithRedirect()}>Sign In</Button>
        } */}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
