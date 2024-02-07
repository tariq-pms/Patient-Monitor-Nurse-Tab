import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Menu, Button, Stack, Divider, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, Avatar } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import VerifiedIcon from '@mui/icons-material/Verified';
import { faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from '@auth0/auth0-react';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { CustomOkButton } from '../components/CustomOkButton';
import { CustomNoButton } from '../components/CustomNoButton';
export interface UserCardProps {
  user: User;
  user_id: string;
  onUserClick: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  updateUserInList: (updatedUser: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onUserClick, onDeleteUser,updateUserInList }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [controlOpacity, setControlOpacity] = useState('0.8');
  const [controlBorder, setControlboarder] = useState('grey');
  const [, setDialogOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [updateUser, setUpdateUser] = useState(false);
  const [, setUserInfo] = useState({
    userEmail: '',
    userRole: '',
    userName: '',
  });
 
  // Initialize updatedUserData with existing user data
  const [updatedUserData, setUpdatedUserData] = useState({
    email: user.email || '',
    username: user.name || '',
    role: user.app_metadata?.role || 'Hospital Technician',
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };


  const handleUserClick = () => {
    setUserInfo({
      userEmail: user.email || '',
      userRole: user.app_metadata?.role || '',
      userName: user.name || '',
    });
    onUserClick(user); // Invoke the onUserClick function with the user information
    setDialogOpen(true);
  };

  const handleDeleteUser = () => {
    onDeleteUser(user.user_id);
    setDeleteConfirmationOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
  };

  // const handleUpdateUser = () => {
  //   const { email, username, role } = updatedUserData;
  //   const userId = user.user_id;

  //   // Make an API call to update the user information
  //   fetch(`https://pmsind.co.in:5000rename/${userId}`, {
  //     method: 'PUT',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       // Add any other headers you need, such as authorization
  //     },
  //     body: JSON.stringify({ email, username, app_metadata: { role } }),
  //   })
  //     .then(response => {
  //       if (response.ok) {
  //         // Handle successful update
  //         console.log(`User with ID ${userId} updated successfully`);
  //         setUpdateUser(false); // Close the update dialog if needed
  //       } else {
  //         console.error(`Error updating user: ${response.statusText}`);
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error:', error);
  //     });
  // };
  const handleUpdateUser = () => {
    const { username, role } = updatedUserData;
    const userId = decodeURIComponent(user.user_id);
  
    // Make an API call to update the user information
    fetch(`https://pmsind.co.in:5000/rename/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add any other headers you need, such as authorization
      },
      body: JSON.stringify({
        username: username,
        app_metadata: {
          role: role,
        },
        connection: 'Username-Password-Authentication',
      }),
    })
      .then((response) => {
        if (response.ok) {
          // Handle successful update
          console.log(`User with ID ${userId} updated successfully`);
          setUpdateUser(false); // Close the update dialog if needed
        } else {
          // Log the error response
          console.error(`Error updating user: ${response.statusText}`);
          return response.json(); // Parse the response as JSON
        }
      })
      .then((errorData) => {
        // If there is an error message, log it
        if (errorData) {
          console.error('Error details:', errorData);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        // Call the prop function to update the user in the AdminPage state
        updateUserInList({
          ...user, // retain other user properties
          name: username, // update username
          app_metadata: {
            role: role,
          },
        });
      });
  };
   
  return (
    <Box
      width={"350px"}
      minHeight={'200px'}
      marginBottom={"5%"}
      marginRight={"20px"}
     
      sx={{
        opacity: controlOpacity,
        backgroundColor: 'transparent',
        borderRadius: '30px',
      }}
      onMouseLeave={() => {
        setControlboarder("grey");
        setControlOpacity("0.8");
      }}
      onMouseEnter={() => {
        setControlboarder("#2BA0E0");
        setControlOpacity("1");
      }}
    >
      <Paper elevation={5} sx={{ borderRadius: "25px", background: 'transparent' }}>
        <Card
          sx={{
            background: "transparent",
            alignItems: "center",
            borderRadius: "25px",
            justifyContent: "center",
            minHeight: "200px",
            border: `1px solid ${controlBorder}`
          }} 
        >
         <Stack width={"100%"} direction={"row"} sx={{ justifyContent: "center", marginTop: "3px" }}>
            <IconButton
              sx={{ width: '10%', marginLeft: 'auto', marginRight: '3%' }}
              onClick={handleMenuClick } 
            >
              <SettingsIcon />
            </IconButton>
            <Menu id="demo-positioned-menu" anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'right', }}  PaperProps={{style:{backgroundImage:'linear-gradient(to bottom, #3C4661, #3C4661, #3C4661)', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', justifyContent:'center', textAlign:'center'}}} MenuListProps={{sx:{py:0}}} >
              <Stack divider={<Divider sx={{backgroundColor:'white'}} flexItem />}>
                <Button  onClick={(() => {setUpdateUser(!updateUser)})}  sx={{ color: 'white', padding: '5%' }}>
                  <Typography variant='caption' textTransform={'capitalize'}>
                    Update User
                  </Typography>
                </Button> 

                <Button onClick={() => setDeleteConfirmationOpen(true)} sx={{ backgroundColor: '#E48227', color: 'white', paddingTop: '5%', paddingBottom: '5%' }}>
                  <Typography variant='caption' textTransform={'capitalize'}>
                    Delete User
                  </Typography>
                </Button>
                
              </Stack>
            </Menu>
            <Dialog open={deleteConfirmationOpen} onClose={handleCancelDelete} PaperProps={{ style: { borderRadius: '25px', boxShadow: `0px 0px 40px 1px #404040`, border: '0.4px solid #505050', backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth: '400px', minHeight: '200px' } }}>
              <DialogTitle style={{textAlign:'center'}}>Delete User</DialogTitle>
              <DialogContent style={{textAlign:'center',marginTop:'3%'}}>
                <Typography>Do you want to delete the user?</Typography>
              </DialogContent>
              <DialogActions style={{justifyContent:'space-between',padding:'5%'}}>
                
              
                <Box onClick={() => handleDeleteUser()}><CustomOkButton text="Yes"></CustomOkButton></Box>
                <Box onClick={() => handleCancelDelete()} ><CustomNoButton text="No"></CustomNoButton></Box>
              
              {/* <Button onClick={() => {setMiniDialog(false)}}>Cancel</Button> */}
              
              </DialogActions>
            </Dialog>
          <Dialog
            open={updateUser}
            onClose={() => setUpdateUser(false)}
            
            PaperProps={{
              style: {
                borderRadius: '25px',
                boxShadow: `0px 0px 40px 1px #404040`,
                border: '0.4px solid #505050',
                backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)',
                minWidth: '600px',
                minHeight: '200px',
              },
            }}
          >
            <DialogTitle style={{textAlign:'center'}}>Update User</DialogTitle>
            <DialogContent>
             
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={updatedUserData.username}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, username: e.target.value })}
              />
              <Select
                fullWidth
                value={updatedUserData.role}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, role: e.target.value })}
              >
                <MenuItem value="Hospital Technician">Hospital Technician</MenuItem>
                <MenuItem value="Hospital Clinician">Hospital Clinician</MenuItem>
              </Select>
              <Button
                sx={{
                  textAlign: 'center',
                  margin: '20px 0',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                variant="contained"
                onClick={handleUpdateUser}
              >
                Update User
              </Button>
            </DialogContent>
          </Dialog>
          </Stack>
          <CardContent sx={{ textAlign: 'center', cursor: 'pointer',paddingTop:'0%' }} onClick={handleUserClick}>
          {/* <Typography>User Email: {user.email}</Typography>
    <Typography>User Role: {user.app_metadata?.role || "No role assigned"}</Typography>
    <Typography>User Name: {user.name}</Typography> */}
       <Stack direction={'row'} alignItems="center" spacing={2} width={'100%'}>
  <Avatar style={{ color: "white", width: 100, height: 100 }}>
    {(() => (
      <Typography variant="h4">{String(user?.nickname)[0].toUpperCase()}</Typography>
    ))()}
  </Avatar>

  <Stack direction={'column'} alignItems={'left'} spacing={1}>
    <Typography variant="h5" textAlign={'left'}>
      {user?.name}
    </Typography>

    <Stack direction={'row'} spacing={1}>
      <FontAwesomeIcon style={{ fontSize: 20, color: controlBorder }} icon={faEnvelope} />
      <Typography variant="subtitle2">{user?.email}</Typography>
    </Stack>

    <Stack direction={'row'} spacing={1}>
      <FontAwesomeIcon style={{ fontSize: 20, color: controlBorder }} icon={faUser} />
      <Typography variant="subtitle2">{user.app_metadata?.role || "No role assigned"}</Typography>
    </Stack>
    <Stack direction={'row'} spacing={1}>
                {user.email_verified ? (
                  <><VerifiedIcon style={{ color: controlBorder }} /><Typography>Verified</Typography></>
                ) : (
                  <><NewReleasesIcon style={{ color: controlBorder }} /><Typography>Not verified</Typography></>
                )}
              </Stack>
  </Stack>
</Stack>


                              
      </CardContent>
        
        </Card>
      </Paper>
    </Box>
  );
};
