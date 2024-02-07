// AdminPage.tsx
import { useState, useEffect, FC } from 'react';
import { Box, Skeleton, Typography, Button, Paper, Dialog, DialogTitle, TextField, Select, MenuItem, DialogContent, CardContent, Card, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { UserCard } from '../components/UserCard';

import { User } from '@auth0/auth0-react';
import { useAuth0 } from '@auth0/auth0-react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

interface AdminPageProps {
  userOrganization: string;
}

export const AdminPage: FC<AdminPageProps>= ({ userOrganization }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User[]>([]);
  const [controlOpacity1, setControlOpacity1] = useState('0.8');
  const [controlBorder1, setControlboarder1] = useState('grey');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const handleSnackbarOpen = (message: string, severity: 'success' | 'error') => {
  setSnackbarMessage(message);
  setSnackbarSeverity(severity);
  setSnackbarOpen(true);
};
const handleSnackbarClose = () => {
  setSnackbarOpen(false);
};
console.log("in admin page",userOrganization);

  const [, setUserInfo] = useState({
    userEmail: '',
    userRole: '',
    userName: '',
  });
  const [openDialog2, setOpenDialog2] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    role: '',
    organization:userOrganization, // default role
  });
  const onUserClick = (user: User) => {
    // Define the logic you want to execute when a user is clicked
    console.log('User clicked:', user);
  };

  // useEffect(() => {
  //   try {
  //     fetch('https://pmsind.co.in:5000list')
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error('Failed to fetch user data');
  //         }
  //         return response.json();
  //       })
  //       .then((data) => {
  //         setUserData(data);
  //         setLoading(false);
  //       })
  //       .catch((error) => {
  //         console.error('Error fetching user data:', error);
  //       });
  //   } catch (error) {
  //     console.error('Error in useEffect:', error);
  //   }
  // }, []);
  
  useEffect(() => {
    try {
      // const organization = '18d1c76ef29-ba9f998e-83b1-4c43-bc5b-b91b572a6454';

      fetch(' https://pmsind.co.in:5000/list', {
        // fetch(`https://pmsind.co.in:5000/delete/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organization:userOrganization }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Fetched User Data:', data);
          setUserData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, [userOrganization]);

  const handleUserClick = (user: User) => {
    setUserInfo({
      userEmail: user.email || '',
      userRole: user.app_metadata?.role || '',
      userName: user.name || '',
    });
    onUserClick(user);
    setDialogOpen(true);
  };

  // const handleAddUser = () => {
  //   // Extract username and password from state or form fields
  //   const { email, username, password, role } = newUser;
  
  //   // Add your logic to make the API call for adding a new user
  //   fetch('https://pmsind.co.in:5000create', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ email, username, password, role }),
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       console.log('API response:', data);
  
  //       // Update the state to include the newly created user
  //       setUserData((prevUserData: User[]) => [...prevUserData, data]);
  
  //       // Add any additional logic you need after the API call
  //     })
  //     .catch(error => {
  //       console.error('Error:', error);
  //     });
  
  //   handleDialog2Close();
  // };
  // const handleAddUser = () => {
  //   // Extract username, password, role, and organizationId from state or form fields
  //   const { email, username, password, role, organization } = newUser;

  //   // Add your logic to make the API call for adding a new user
  //   fetch('https://pmsind.co.in:5000create', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ email, username, password, role, organization }), // Include organizationId in the request
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       console.log('API response:', data);

  //       // Update the state to include the newly created user
  //       setUserData((prevUserData: User[]) => [...prevUserData, data]);

  //       // Add any additional logic you need after the API call
  //     })
  //     .catch(error => {
  //       console.error('Error:', error);
  //     });

  //   handleDialog2Close();
  // };
  const handleAddUser = () => {
    // Extract username, password, role, and organizationId from state or form fields
    const { email, username, password, role, organization } = newUser;
  
    // Add your logic to make the API call for adding a new user
    fetch('https://pmsind.co.in:5000/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password, role, organization }), // Include organizationId in the request
    })
      .then(response => {
        // Check explicitly for success status (2xx)
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        } else {
          // If there's an error, throw an error to go to the catch block
          throw new Error(`Failed to create user. Server responded with status: ${response.status}`);
        }
      })
      .then(data => {
        console.log('API response:', data);
  
        // After creating the user, fetch the updated user data
        fetch('https://pmsind.co.in:5000/list', {
        method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ organization: userOrganization }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to fetch updated user data');
            }
            return response.json();
          })
          .then((updatedData) => {
            console.log('Fetched Updated User Data:', updatedData);
  
            // Update the state to include the newly created user
            setUserData(updatedData);
  
            // Show success snackbar
            handleSnackbarOpen('User created successfully', 'success');
          })
          .catch((error) => {
            // Show error snackbar
            handleSnackbarOpen('Failed to fetch updated user data', 'error');
            console.error('Error fetching updated user data:', error);
          });
      })
      .catch(error => {
        // Show error snackbar
        handleSnackbarOpen(error.message, 'error');
        console.error('Error:', error);
      });
  
    handleDialog2Close();
  };
  
  
  
  const handleDeleteUser = (userId: string) => {
    // fetch(`http://localhost:5000/delete/${userId}`, {
      fetch(`https://pmsind.co.in:5000/${userId}`, {
      
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.ok) {
          console.log(`User with ID ${userId} deleted successfully`);
          // Update the state to remove the deleted user
          setUserData(prevUserData => prevUserData.filter(user => user.user_id !== userId));
          
        } else {
          console.error(`Error deleting user: ${response.statusText}`);
         
        }
      })
      .catch(error => {
        console.error('Error:', error);
       
      });
  };
  
  const updateUserInList = (updatedUser: User) => {
    setUserData(prevUserData =>
      prevUserData.map(user => (user.user_id === updatedUser.user_id ? updatedUser : user))
    );
    handleSnackbarOpen('User updated successfully', 'success');
  };

  const [, setDialogOpen] = useState(false);

  const handleDialog2Close = () => {
    setOpenDialog2(false);
  };

  return (
    <div>
      {isAuthenticated ? (
        <Box display="flex" justifyContent="center" minHeight="100vh">
          {loading ? (
            <Skeleton animation="wave" variant="rectangular" width={"350px"}  height={"200px"} sx={{ borderRadius: "25px",marginTop:"120px",marginRight:"400px" }} />
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box width={'100%'} marginBottom={'10%'} paddingTop={'2%'} textAlign={'center'}>
                <Typography variant='h5' color={'white'}>Admin Settings</Typography>
              </Box>
              <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
                {userData.map((user: User, index: number) => (
                 <UserCard key={index} user={user} onUserClick={handleUserClick} onDeleteUser={handleDeleteUser} updateUserInList={updateUserInList} user_id={''} />


                ))}
                <Box
                  width={'350px'}
                 height={'200px'}
                  
                  sx={{ opacity: controlOpacity1, backgroundColor: 'transparent', borderRadius: '30px' }}
                  onMouseLeave={() => {
                    setControlboarder1('grey');
                    setControlOpacity1('0.8');
                  }}
                  onMouseEnter={() => {
                    setControlboarder1('#2BA0E0');
                    setControlOpacity1('1');
                  }}
                >
                  <Paper elevation={5} sx={{ borderRadius: '25px', background: 'transparent' }}>
                    <Card
                      sx={{
                        background: 'transparent',
                        borderRadius: '25px',
                        height: '200px',
                        border: `1px solid ${controlBorder1}`,
                      }}
                    >
                      <Box sx={{cursor:"pointer"}} width={'100%'} display="flex" flexDirection="row" justifyContent="center" marginTop={'5px'} onClick={() => setOpenDialog2(true)}>
                        <CardContent sx={{marginTop:'0px', textAlign: 'center'}} >
                          <Typography sx={{ padding: '0px',marginTop:'0px' }}>Add new User</Typography>
                          <AddIcon sx={{ fontSize: 150, color: controlBorder1 }} />
                        </CardContent>
                      </Box>
                    </Card>
                  </Paper>
                </Box>
              </Box>
              <Dialog open={openDialog2} onClose={handleDialog2Close} PaperProps={{ style: { borderRadius: '25px', boxShadow: `0px 0px 40px 1px #404040`, border: '0.4px solid #505050', backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth: '600px', minHeight: '200px' } }}>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                  <TextField
                    type="email"
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                  <TextField
                    type="password"
                    label="Password"
                    fullWidth
                    margin="normal"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                  <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                   <InputLabel id="demo-simple-select-standard-label">Role</InputLabel>
                  <Select
                  
                  
                    fullWidth
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
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
                    onClick={handleAddUser}
                  >
                    Add User
                  </Button>
                </DialogContent>
              </Dialog>
            </Box>
            
          )}
        </Box>
        
      ) : (
        <Box marginTop={'9%'} textAlign={'center'}>
          <Typography variant='h3' color={'white'} fontWeight={'50'}>Admin Portal</Typography>
          <Typography variant='h6' color={'grey'} fontWeight={'50'}>Manage users and settings</Typography>
          <Box marginTop={'2%'} display="flex" flexDirection="row" justifyContent="center">
            <Button variant='contained' sx={{ width: '200px', height: '50px', borderRadius: '100px' }} onClick={() => loginWithRedirect()}>Sign In</Button>
          </Box>
        </Box>
        
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbarSeverity as AlertProps['severity']}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};
