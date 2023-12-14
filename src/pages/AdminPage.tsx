// AdminPage.tsx
import { useState, useEffect } from 'react';
import { Box, Skeleton, Typography, Button, Paper, Dialog, DialogTitle, TextField, Select, MenuItem, DialogContent, CardContent, Card, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { UserCard } from '../components/UserCard'; // Import the modified UserCard component
import { User } from '@auth0/auth0-react';
import { useAuth0 } from '@auth0/auth0-react';

export const AdminPage = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User[]>([]);

  const [controlOpacity1, setControlOpacity1] = useState('0.8');
  const [controlBorder1, setControlboarder1] = useState('grey');

  const [userInfo, setUserInfo] = useState({
    userEmail: '',
    userRole: '',
    userName: '',
  });
  const [openDialog2, setOpenDialog2] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    role: 'Hospital Technician', // default role
  });
  const onUserClick = (user: User) => {
    // Define the logic you want to execute when a user is clicked
    console.log('User clicked:', user);
  };

  useEffect(() => {
    try {
      fetch('http://localhost:5000/list')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          return response.json();
        })
        .then((data) => {
          setUserData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, []);
  const handleUserClick = (user: User) => {
    setUserInfo({
      userEmail: user.email || '',
      userRole: user.app_metadata?.role || '',
      userName: user.name || '',
    });
    onUserClick(user);
    setDialogOpen(true);
  };

  const handleAddUser = () => {
    // Extract username and password from state or form fields
    const { email, username, password, role } = newUser;
  
    // Add your logic to make the API call for adding a new user
    fetch('http://localhost:5000/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password, role }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('API response:', data);
  
        // Update the state to include the newly created user
        setUserData((prevUserData: User[]) => [...prevUserData, data]);
  
        // Add any additional logic you need after the API call
      })
      .catch(error => {
        console.error('Error:', error);
      });
  
    handleDialog2Close();
  };
  
  
  const handleDeleteUser = (userId: string) => {
    fetch(`http://localhost:5000/delete/${userId}`, {
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
  
  

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialog2Close = () => {
    setOpenDialog2(false);
  };

  return (
    <div>
      {isAuthenticated ? (
        <Box display="flex" justifyContent="center" minHeight="100vh">
          {loading ? (
            <Skeleton animation="wave" variant="rectangular" width={"350px"} height={"280px"} sx={{ borderRadius: "25px" }} />
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box width={'100%'} marginBottom={'10%'} paddingTop={'2%'} textAlign={'center'}>
                <Typography variant='h5' color={'white'}>Admin Settings</Typography>
              </Box>
              <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
                {userData.map((user: User, index: number) => (
                 <UserCard key={index} user={user} onUserClick={handleUserClick} onDeleteUser={handleDeleteUser} user_id={''} />


                ))}
                <Box
                  width={'350px'}
                  minHeight={'300px'}
                  maxHeight={'300px'}
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
                        minHeight: '280px',
                        border: `1px solid ${controlBorder1}`,
                      }}
                    >
                      <Box width={'100%'} display="flex" flexDirection="row" justifyContent="center" marginTop={'20px'}>
                        <CardContent sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setOpenDialog2(true)}>
                          <Typography sx={{ paddingLeft: '0px' }}>Add new User</Typography>
                          <AddIcon sx={{ fontSize: 200, color: controlBorder1 }} />
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
    </div>
  );
};
