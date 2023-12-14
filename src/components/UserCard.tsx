import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Menu, Button, Stack, Divider, Paper, Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions, TextField, MenuItem, Select } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from '@auth0/auth0-react';

export interface UserCardProps {
  user: User;
  user_id: string;
  onUserClick: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onUserClick, onDeleteUser }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [controlOpacity, setControlOpacity] = useState('0.8');
  const [controlBorder, setControlboarder] = useState('grey');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [updateUser, setUpdateUser] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userEmail: '',
    userRole: '',
    userName: '',
  });
 
  // Initialize updatedUserData with existing user data
  const [updatedUserData, setUpdatedUserData] = useState({
    email: user.email || '',
    username: user.name || '',
    role: user.app_metadata?.role || 'hospitalTechnician',
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setControlboarder("grey");
    setControlOpacity("0.8");

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
  //   fetch(`http://localhost:5000/rename/${userId}`, {
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
    const { email, username, role } = updatedUserData;
    const userId = decodeURIComponent(user.user_id);

    // Make an API call to update the user information
    fetch(`http://localhost:5000/rename/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // Add any other headers you need, such as authorization
        },
        body: JSON.stringify({  "username": username, "connection": "Username-Password-Authentication" }),
    })
    .then(response => {
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
    .then(errorData => {
        // If there is an error message, log it
        if (errorData) {
            console.error('Error details:', errorData);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
};



  
  return (
    <Box
      width={"350px"}
      minHeight={'300px'}
      marginRight={"20px"}
      maxHeight={'300px'}
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
            minHeight: "280px",
            border: `1px solid ${controlBorder}`
          }} 
        >
         <Stack width={"100%"} direction={"row"} sx={{ justifyContent: "center", marginTop: "5px" }}>
            <IconButton
              sx={{ width: '10%', marginLeft: 'auto', marginRight: '3%' }}
              onClick={handleMenuClick}
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
              <DialogTitle>Delete User</DialogTitle>
              <DialogContent>
                <Typography>Do you want to delete the user?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelDelete} variant="outlined">
                  No
                </Button>
                <Button onClick={handleDeleteUser}  variant="contained">
                  Yes
                </Button>
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
            <DialogTitle>Update User</DialogTitle>
            <DialogContent>
              <TextField
                type="email"
                label="Email"
                fullWidth
                margin="normal"
                value={updatedUserData.email}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, email: e.target.value })}
              />
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
                <MenuItem value="hospitalTechnician">Hospital Technician</MenuItem>
                <MenuItem value="hospitalClinician">Hospital Clinician</MenuItem>
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
          <CardContent sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleUserClick}>
          {/* <Typography>User Email: {user.email}</Typography>
    <Typography>User Role: {user.app_metadata?.role || "No role assigned"}</Typography>
    <Typography>User Name: {user.name}</Typography> */}
        <FontAwesomeIcon style={{ fontSize: 200, color: controlBorder }} icon={faUser} />
      </CardContent>
          <Dialog open={dialogOpen} onClose={handleDialogClose}  PaperProps={{style:{borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth:'400px', minHeight:'200px'}}} >
            <DialogTitle>User Information</DialogTitle>
            <DialogContent>
            <DialogContent>
  <div>
    <Typography>User Email: {userInfo.userEmail}</Typography>
    <Typography>User Role: {userInfo.userRole}</Typography>
    <Typography>User Name: {userInfo.userName}</Typography>
  </div>
</DialogContent>

            </DialogContent>
          </Dialog>
        </Card>
      </Paper>
    </Box>
  );
};
