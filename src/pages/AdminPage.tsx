import { useState, useEffect, FC } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  TextField, 
  Select, 
  MenuItem, 
  DialogContent, 
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth0 } from '@auth0/auth0-react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import pmsLogo from '../assets/phx_logo.png';

interface AdminPageProps {
  userOrganization: string;
  darkTheme: boolean;
}

interface User {
  user_id: string;
  email: string;
  name: string;
  nickname?: string;
  app_metadata?: {
    role?: string;
  };
  email_verified?: boolean;
  created_at?: string;
}

export const AdminPage: FC<AdminPageProps> = ({ userOrganization, darkTheme }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    role: 'Hospital Technician',
    organization: userOrganization,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleSnackbarOpen = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [userOrganization, isAuthenticated]);

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_AUTH0API_URL as string}/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ organization: userOrganization }),
    })
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
        setLoading(false);
      });
  };

  const handleAddUser = () => {
    const { email, username, password, role, organization } = newUser;
  
    fetch(`${import.meta.env.VITE_AUTH0API_URL as string}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password, role, organization }),
    })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        } else {
          throw new Error(`Failed to create user. Server responded with status: ${response.status}`);
        }
      })
      .then(() => {
        fetchUsers();
        handleSnackbarOpen('User created successfully', 'success');
        setOpenDialog(false);
        setNewUser({
          email: '',
          username: '',
          password: '',
          role: 'Hospital Technician',
          organization: userOrganization,
        });
      })
      .catch(error => {
        handleSnackbarOpen(error.message, 'error');
      });
  };

  const handleDeleteUser = (userId: string) => {
    fetch(`${import.meta.env.VITE_AUTH0API_URL as string}/delete/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.ok) {
          fetchUsers();
          handleSnackbarOpen('User deleted successfully', 'success');
        } else {
          throw new Error(`Failed to delete user. Server responded with status: ${response.status}`);
        }
      })
      .catch(error => {
        handleSnackbarOpen(error.message, 'error');
      })
      .finally(() => {
        setDeleteDialogOpen(false);
      });
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    const { username, role } = newUser;
    const userId = decodeURIComponent(selectedUser.user_id);

    fetch(`${import.meta.env.VITE_AUTH0API_URL as string}/rename/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
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
          fetchUsers();
          handleSnackbarOpen('User updated successfully', 'success');
          setEditDialogOpen(false);
        } else {
          throw new Error(`Failed to update user. Server responded with status: ${response.status}`);
        }
      })
      .catch((error) => {
        handleSnackbarOpen(error.message, 'error');
      });
  };

  const renderAuthPrompt = () => (
    <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'}>
      <img 
        src={pmsLogo} 
        alt="Phoenix" 
        style={{ maxWidth: '20%', height: 'auto', margin: '0 auto' }} 
      />
      <Typography variant='h3' color={'white'} fontWeight={'50'}>NeoLife Sentinel</Typography>
      <Typography variant='h6' color={'grey'} fontWeight={'50'}>Remote Device Monitoring System</Typography>
      <Stack direction={'row'} spacing={'30px'} justifyContent={'space-evenly'}>
        <Button 
          variant='outlined' 
          sx={{ width: '200px', height: '50px', borderRadius: '100px' }} 
          endIcon={<OpenInNewIcon />} 
          target='_blank' 
          href='https://www.phoenixmedicalsystems.com/'
        >
          Product page
        </Button>
        <Button 
          variant='contained' 
          sx={{ width: '200px', height: '50px', borderRadius: '100px' }} 
          onClick={() => loginWithRedirect()}
        >
          Sign In
        </Button>
      </Stack>
    </Stack>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div>
      {isAuthenticated ? (
        <Box sx={{ p: 2 }}>
          
          <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt:1,mb: 1, backgroundColor: ""}}
      >
       
       <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
       Users
            </Typography>
            <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ backgroundColor: "#228BE61A", color: "#228BE6" }}
          >
             Add User
          </Button>
      </Stack>

          <TableContainer component={Paper} sx={{ 
            backgroundColor: darkTheme ? '#1E1E1E' : '',
            border: darkTheme ? '1px solid #444' : '1px solid #E0E0E0'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: darkTheme ? '#2A2A2A' : 'grey' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>User Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Assigned Patients</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                 
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Loading users...</TableCell>
                  </TableRow>
                ) : userData.length > 0 ? (
                  userData.map((user) => (
                    <TableRow key={user.user_id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: darkTheme ? '#124D81' : '#228BE6',
                            fontSize: '0.875rem'
                          }}>
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography>{user.name || 'N/A'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        {user.app_metadata?.role || 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                     
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setNewUser({
                                  email: user.email || '',
                                  username: user.name || '',
                                  password: '',
                                  role: user.app_metadata?.role || 'Hospital Technician',
                                  organization: userOrganization,
                                });
                                setEditDialogOpen(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Add User Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
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
              <Select
                fullWidth
               
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="Hospital Technician">Hospital Technician</MenuItem>
                <MenuItem value="Hospital Clinician">Hospital Clinician</MenuItem>
              </Select>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleAddUser}
                disabled={!newUser.email || !newUser.password || !newUser.username}
              >
                Add User
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Edit User</DialogTitle>
            <DialogContent>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
              <Select
                fullWidth
                
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="Hospital Technician">Hospital Technician</MenuItem>
                <MenuItem value="Hospital Clinician">Hospital Clinician</MenuItem>
              </Select>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleUpdateUser}
                disabled={!newUser.username}
              >
                Update User
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Delete User</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this user?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={() => selectedUser && handleDeleteUser(selectedUser.user_id)}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      ) : renderAuthPrompt()}

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