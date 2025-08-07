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
  DialogActions,
  Skeleton,
  InputAdornment,
  useMediaQuery,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth0 } from '@auth0/auth0-react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import pmsLogo from '../assets/phx_logo.png';
import { Visibility, VisibilityOff } from '@mui/icons-material';

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

export const UserList: FC<AdminPageProps> = ({ userOrganization, darkTheme }) => {
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
  const [loadingUser, setLoadingUser] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    setLoadingUser(true);
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
        setLoadingUser(false);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        setLoading(false);
        setLoadingUser(false);
      });
  };

  const handleAddUser = async () => {
   
    const { email, username, password, role, organization } = newUser;
  
    try {
      // 1. Create Auth0 user (existing code)
      const auth0Response = await fetch(`${import.meta.env.VITE_AUTH0API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, role, organization }),
      });
      const handleAuth0Response = async (response: Response) => {
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Auth0 error: ${error}`);
        }
        return response.json();
      };
      const auth0User = await handleAuth0Response(auth0Response);
      
      // 2. Create FHIR Practitioner (simplified)
      const practitioner = {
        resourceType: "Practitioner",
        identifier: [
          {
            system: "http://auth0.com/id",
            value: auth0User.user_id,
          },
        ],
        name: [
          {
            use: "official",
            text: username,
            given: [username],
          },
        ],
        telecom: [
          {
            system: "email",
            value: email,
            use: "work",
          },
        ],
        active: true,
      };
      
      const practitionerResponse = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Practitioner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(practitioner),
      });
  
      if (!practitionerResponse.ok) {
        throw new Error("Failed to create FHIR Practitioner");
      }
  
      // 3. Success handling (existing code)
      fetchUsers();
      handleSnackbarOpen(`${username} created successfully`, 'success');
      setOpenDialog(false);
      setNewUser({
        email: '',
        username: '',
        password: '',
        role: 'Hospital Technician',
        organization: userOrganization,
      });
  
    } catch (error) {
      console.error("User creation failed:", error);
      handleSnackbarOpen(error.message, 'error');
    }
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

  // const fetchPractitionerDetails = async (userId: string) => {
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Practitioner?identifier=auth0|${encodeURIComponent(userId)}`, {
  //       headers: {
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //     });
      
  //     if (!response.ok) throw new Error('Failed to fetch practitioner');
      
  //     const data = await response.json();
  //     return data.entry?.[0]?.resource || null;
  //   } catch (error) {
  //     console.error('Error fetching practitioner:', error);
  //     return null;
  //   }
  // };

  return (
    <div>
      
        <Box sx={{ p: 1 }}>
          
          <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt:1,mb: 1, backgroundColor: ""}}
      >
         <Typography
    variant={isMobile ? "h6" : "h5"}
    sx={{ fontWeight: "bold"}}
  >
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
      <Box sx={{ mt: 2,p:2,backgroundColor:'#FFFFFF' }}>

                               
{loadingUser ? (
    <Box >
        <Skeleton variant="rectangular" width="100%" height={60} />
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1 }} />
    </Box>
) : (
    <Box sx={{  borderRadius: 1 }}>
    <TableContainer component={Paper} sx={{ backgroundColor: '#FFFFFF' }}>
            <Table>
              <TableHead>
              <TableRow sx={{
                     
                     backgroundColor: '#868E961F'
                   }}>
                  <TableCell sx={{color:'black', fontWeight: 'bold' }}>User Name</TableCell>
                  <TableCell sx={{color:'black', fontWeight: 'bold' }}>User ID</TableCell>
                  <TableCell sx={{color:'black', fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ color:'black',fontWeight: 'bold' }}>Created Date</TableCell>
                 
                  <TableCell sx={{color:'black', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Loading users...</TableCell>
                  </TableRow>
                ) : userData.length > 0 ? (
                  userData.map((user) => (
                    <TableRow key={user.user_id} hover sx={{
                     
                      backgroundColor:'#FFF'
                    }}>
                      <TableCell sx={{color:'black'}}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: darkTheme ? '#124D81' : '#868E961F',
                            fontSize: '0.875rem'
                          }}>
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography>{user.name || 'N/A'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{color:'black'}}>{user.email || 'N/A'}</TableCell>
                      <TableCell sx={{color:'black'}}>
                        {user.app_metadata?.role || 'N/A'}
                      </TableCell>
                      <TableCell sx={{color:'black'}}>{formatDate(user.created_at)}</TableCell>
                     
                      <TableCell sx={{color:'black'}}>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              sx={{color:'black'}}
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
                              <EditIcon fontSize="small"/>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              sx={{color:'black'}}
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <DeleteIcon fontSize="small"  />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      {/* <TableCell>
  {user.app_metadata?.role === 'Hospital Clinician' ? (
    <Button 
      variant="outlined" 
      size="small"
      onClick={async () => {
        const practitioner = await fetchPractitionerDetails(user.user_id);
        if (practitioner) {
          // Here you would implement your patient selection logic
          // For example, open a dialog to select a patient
          const patientId = prompt("Enter Patient ID to assign:");
          if (patientId) {
            try {
              await assignPatientToPractitioner(practitioner.id, patientId);
              handleSnackbarOpen('Patient assigned successfully', 'success');
            } catch (error) {
              handleSnackbarOpen(error.message, 'error');
            }
          }
        } else {
          handleSnackbarOpen('Practitioner record not found', 'error');
        }
      }}
    >
      Assign Patient
    </Button>
  ) : (
    'No patients yet'
  )}
</TableCell> */}
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
  </Box>
)}


</Box>
          

          {/* Add User Dialog */}
          <Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  fullWidth
  maxWidth="xs"
  PaperProps={{
    sx: {
      backgroundColor: '#FFFFFF', // white background
      borderRadius: 3,
      color: '#000000', // all text color black by default
    },
  }}
>
<DialogTitle sx={{ fontWeight: 500, pb: 1, color: '#000000', textAlign: 'center' }}>
  User Details
</DialogTitle>


  <DialogContent>
    <TextField
      label="User Name *"
      fullWidth
      margin="dense"
      variant="outlined"
      value={newUser.username}
      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
      InputProps={{
        sx: {
          backgroundColor: '#F5F5F5',
          borderRadius: 1,
          color: '#000',
        },
      }}
      InputLabelProps={{ sx: { color: '#000' } }}
    />
    <TextField
      label="User ID *"
      type="email"
      fullWidth
      margin="dense"
      variant="outlined"
      value={newUser.email}
      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
      InputProps={{
        sx: {
          backgroundColor: '#F5F5F5',
          borderRadius: 1,
          color: '#000',
        },
      }}
      InputLabelProps={{ sx: { color: '#000' } }}
    />
    <TextField
      label="Password *"
      type={showPassword ? 'text' : 'password'}
      fullWidth
      margin="dense"
      variant="outlined"
      value={newUser.password}
      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
              sx={{ color: '#000' }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
        sx: {
          backgroundColor: '#F5F5F5',
          borderRadius: 1,
          color: '#000',
        },
      }}
      InputLabelProps={{ sx: { color: '#000' } }}
    />
    <TextField
      label="Role *"
      select
      fullWidth
      margin="dense"
      variant="outlined"
      value={newUser.role}
      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
      InputProps={{
        sx: {
          backgroundColor: '#F5F5F5',
          borderRadius: 1,
          color: '#000',
        },
      }}
      InputLabelProps={{ sx: { color: '#000' } }}
    >
      <MenuItem value="Hospital Technician">Hospital Technician</MenuItem>
      <MenuItem value="Hospital Clinician">Hospital Clinician</MenuItem>
      <MenuItem value="Head Nurse">Head Nurse</MenuItem>
      <MenuItem value="NICU Nurse">NICU Nurse</MenuItem>
    </TextField>
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
    <Button
      onClick={() => setOpenDialog(false)}
      variant="outlined"
      sx={{
        textTransform: 'none',
        borderColor: '#D0D5DD',
        color: '#344054',
        fontWeight: 500,
        backgroundColor: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#F9FAFB',
        },
      }}
    >
      Cancel
    </Button>
    <Button
  
  onClick={handleAddUser}
  disabled={
    !newUser.email || !newUser.password || !newUser.username || !newUser.role
  }
  sx={{
    backgroundColor: '#228BE6',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#228BE6',
    color: '#FFFFFF',
    },
    '&.Mui-disabled': {
      backgroundColor: '#228BE61A',
      color: 'grey',
      opacity: 1, // prevents dimming
    },
  }}
>
  Save
</Button>

  </DialogActions>
</Dialog>


          {/* Edit User Dialog */}
          <Dialog
  open={editDialogOpen}
  onClose={() => setEditDialogOpen(false)}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
      borderRadius: 3,
    },
  }}
>
<DialogTitle sx={{ fontWeight: 500, pb: 1, color: '#000000', textAlign: 'center' }}>
  Edit User
</DialogTitle>

  <DialogContent dividers sx={{ borderColor: '#ccc' }}>
    <TextField
      label="Username *"
      fullWidth
      margin="dense"
      variant="outlined"
      value={newUser.username}
      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
      InputProps={{
        sx: {
          backgroundColor: '#F5F5F5',
          borderRadius: 1,
          color: '#000000',
        },
      }}
      InputLabelProps={{ sx: { color: '#000000' } }}
    />

    <Select
      fullWidth
      margin="dense"
      variant="outlined"
      value={newUser.role}
      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
      displayEmpty
      sx={{
        backgroundColor: '#F5F5F5',
        borderRadius: 1,
        mt: 2,
        color: '#000000',
      }}
    >
      <MenuItem disabled value="">
        Select Role
      </MenuItem>
      <MenuItem value="Hospital Technician">Hospital Technician</MenuItem>
      <MenuItem value="Hospital Clinician">Hospital Clinician</MenuItem>
      <MenuItem value="Head Nurse">Head Nurse</MenuItem>
      <MenuItem value="NICU Nurse">NICU Nurse</MenuItem>
    </Select>
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
    <Button
      onClick={() => setEditDialogOpen(false)}
      variant="outlined"
      sx={{
        textTransform: 'none',
        borderColor: '#D0D5DD',
        color: '#344054',
        fontWeight: 500,
        backgroundColor: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#F9FAFB',
        },
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleUpdateUser}
      disabled={!newUser.username}
      sx={{
        backgroundColor: '#228BE6',
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#228BE6',
        color: '#FFFFFF',
        },
        '&.Mui-disabled': {
          backgroundColor: '#228BE61A',
          color: 'grey',
          opacity: 1, // prevents dimming
        },
      }}
    >
      Update
    </Button>
  </DialogActions>
</Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
  open={deleteDialogOpen}
  onClose={() => setDeleteDialogOpen(false)}
  fullWidth
  maxWidth="xs"
  PaperProps={{
    sx: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
      borderRadius: 3,
    },
  }}
>
<DialogTitle sx={{ fontWeight: 500, pb: 1, color: '#000000', textAlign: 'center' }}>
 Delete User
</DialogTitle>

  <DialogContent dividers sx={{ borderColor: '#ccc' }}>
    <Typography variant="body1" sx={{ color: '#344054' }}>
      Are you sure you want to delete this user?
    </Typography>
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
    <Button
      onClick={() => setDeleteDialogOpen(false)}
      variant="outlined"
      sx={{
        textTransform: 'none',
        borderColor: '#D0D5DD',
        color: '#344054',
        fontWeight: 500,
        backgroundColor: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#F9FAFB',
        },
      }}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      color="error"
      onClick={() => selectedUser && handleDeleteUser(selectedUser.user_id)}
      sx={{
        textTransform: 'none',
        fontWeight: 500,
        backgroundColor: '#D92D20',
        '&:hover': {
          backgroundColor: '#B42318',
        },
      }}
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>

        </Box>
     

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

