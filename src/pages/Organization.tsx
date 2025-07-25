import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { Sidebar1 } from '../components/Sidebar1';
import pmsLogo from '../assets/phx_logo.png';
import {ModuleToggleList } from '../components/ModuleToggleList';

// Type Definitions
interface Organization {
  id: string;
  name: string;
  address?: { line?: string[] }[];
  telecom?: { system: string; value: string }[];
  meta?: { lastUpdated?: string };
  deviceSummary?: string;
  // Add this extension for modules
  extension?: Array<{
    url: string;
    extension: Array<{
      url: string;
      valueString?: string;
      valueBoolean?: boolean;
    }>;
  }>;
}

interface User {
  email: string;
  username: string;
  role: string;
  organization: string;
}

interface OrganizationProps {
  userOrganization: string;
  darkTheme: boolean;
}

interface OrganizationModule {
  name: string;
  enabled: boolean;
}

export const Organization : React.FC<OrganizationProps> = ({ userOrganization, darkTheme }) => {
  // State Hooks
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState("Modules");
  const [orgsWithAdmin, setOrgsWithAdmin] = useState<Set<string>>(new Set());
  
  // Dialog States
  const [openOrgDialog, setOpenOrgDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [newOrganization, setNewOrganization] = useState({
    name: '',
    location: '',
    contact: ''
  });
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    role: '',
    organization: userOrganization
  });

  // Snackbar States
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const { isAuthenticated, loginWithRedirect } = useAuth0();

  // Constants
  // const MODULES: Module[] = [
  //   { name: 'Real-Time Vitals & Trends', active: true },
  //   { name: 'Prescription & Drug Administration', active: false },
  //   { name: 'Nutrition & Feeds', active: true },
  //   { name: 'Assessments', active: true },
  //   { name: 'Diagnostics, Labs & Imaging', active: true },
  //   { name: 'Diagnosis, Treatment & Care plan', active: true },
  //   { name: 'Patient Profile & Birth Data', active: true },
  //   { name: 'Clinical Notes', active: true },
  //   { name: 'Alarm Logs', active: true },
  //   { name: 'Nurse task list', active: true },
  // ];

  // Helper Functions
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', weekday: 'short' })}`;
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // API Functions
  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Organization/`, {
        headers: {
          Authorization: 'Basic ' + btoa('fhiruser:change-password'),
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setOrganizations(data.entry?.map((entry: any) => entry.resource) || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      showSnackbar('Failed to fetch organizations', 'error');
    }
  };

  const addOrganization = async () => {
    try {
      const data = {
        resourceType: "Organization",
        name: newOrganization.name,
        address: [{ use: "work", line: [newOrganization.location] }],
        telecom: [{ system: "phone", value: newOrganization.contact }],
      };

      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Organization`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      });

      if (!response.ok) throw new Error("Failed to add organization");

      await fetchOrganizations();
      showSnackbar('Organization added successfully', 'success');
      setOpenOrgDialog(false);
    } catch (error) {
      console.error("Error:", error);
      showSnackbar('Failed to add organization', 'error');
    }
  };

  const addUser = async () => {
    try {
      const { email, username, password, role, organization } = newUser;
      
      const response = await fetch(`${import.meta.env.VITE_AUTH0API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, role, organization }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create user. Status: ${response.status}`);
      }

      if (role === 'Hospital Technician') {
        setOrgsWithAdmin(prev => new Set(prev).add(organization));
      }

      showSnackbar('User created successfully', 'success');
      setOpenUserDialog(false);
    } catch (error) {
      console.error('Error:', error);
      showSnackbar(error instanceof Error ? error.message : 'Failed to create user', 'error');
    }
  };

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganizations();
    }
  }, [isAuthenticated]);

  // Filtered Data
  const filteredOrgs = organizations.filter(org =>
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render Functions
  const renderOrganizationList = () => (
    <>
      <Typography variant='h5' sx={{ p: 1 }}>Organization</Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
        <TextField
          size="small"
          placeholder="Search Organization ID/Name"
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#ADB5BD' }} />
              </InputAdornment>
            ),
            sx: { input: { color: '#ADB5BD' } }
          }}
          sx={{ width: '400px', borderRadius: '25px', backgroundColor: 'white' }}
        />
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpenOrgDialog(true)}
          sx={{ backgroundColor: '#228BE61A', color: '#228BE6' }}
        >
          Add
        </Button>
      </Stack>

      <Paper sx={{ borderRadius: 2, p: 2, backgroundColor: '#FFFFFF', overflowY: 'auto' }}>
        <Table>
          <TableHead sx={{ color: '#868E96', backgroundColor: '#868E961F' }}>
            <TableRow>
            <TableCell sx={{ color: '#868E96' }}><strong>Hospital Name</strong></TableCell>
                    <TableCell sx={{ color: '#868E96' }}><strong>Number of Devices</strong></TableCell>
                    <TableCell sx={{ color: '#868E96' }}><strong>Location</strong></TableCell>
                    <TableCell sx={{ color: '#868E96' }}><strong>Added Date</strong></TableCell>
                    <TableCell sx={{ color: '#868E96' }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell sx={{ color: '#007bff', cursor: 'pointer' }} onClick={() => setSelectedOrganization(org)}>
                  {org.name}
                </TableCell>
                <TableCell sx={{ color: '#212529' }}>{org.deviceSummary || 'No devices found'}</TableCell>
                <TableCell sx={{ color: '#212529' }}>{org.address?.[0]?.line?.[0] || 'N/A'}</TableCell>
                <TableCell sx={{ color: '#212529' }}>{formatDate(org.meta?.lastUpdated)}</TableCell>
                <TableCell sx={{ color: '#212529' }}>
                  {orgsWithAdmin.has(org.id) ? (
                    <Button variant="outlined" size="small" disabled>Added</Button>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setNewUser({
                          email: '',
                          password: '',
                          username: '',
                          role: 'Hospital Technician',
                          organization: org.id,
                        });
                        setOpenUserDialog(true);
                      }}
                    >
                      Add Admin
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );

  const renderOrganizationDetail = () => (
    <Box sx={{ backgroundColor: '#F5F5F5' }}>
      <IconButton onClick={() => setSelectedOrganization(null)}>
        <Box display="flex" alignItems="center">
          <ArrowBackIosIcon sx={{ color: '#868E96' }} />
          <Typography variant='h5' sx={{ color: '#868E96' }}>{selectedOrganization?.name}</Typography>
        </Box>
      </IconButton>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', p: 1 }}>
        {[
          { label: 'Name', value: selectedOrganization?.name },
          { label: 'Contact Number', value: selectedOrganization?.telecom?.find(t => t.system === 'phone')?.value || 'N/A' },
          { label: 'Location', value: selectedOrganization?.address?.[0]?.line?.[0] || 'N/A' },
          { 
            label: 'Added Date', 
            value: selectedOrganization?.meta?.lastUpdated 
              ? new Date(selectedOrganization.meta.lastUpdated).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : 'N/A'
          }
        ].map((item, index) => (
          <Box key={index}>
            <Typography variant="subtitle2" fontWeight="bold" color="black">{item.label}</Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="black">{item.value}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ marginBottom: 1, border: '2px solid #DEE2E6' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          textColor="inherit"
          indicatorColor="secondary"
          variant="fullWidth"
          centered
        >
          {["Modules", "Devices", "Patients", "Beds", "Audit Logs"].map(tab => (
            <Tab key={tab} label={tab} value={tab} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{backgroundColor: '#DEE2E6', borderRadius: '20px', overflowY: 'auto', maxHeight: '60vh' }}>
   
      {activeTab === "Modules" && selectedOrganization && (
  <ModuleToggleList 
    organizationId={selectedOrganization.id}
    onModulesUpdated={(updatedModules) => {
      // Handle the update in parent component if needed
    }}
  />
)}
      </Box>
    </Box>
  );

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

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
       {isAuthenticated ? (
      <>
      <Sidebar1 onIconClick={undefined} isSidebarCollapsed={false} selectedIndex={null} /><Box width={'100%'} sx={{ p: 2 }}>
          {!selectedOrganization ? renderOrganizationList() : renderOrganizationDetail()}

          {/* Add Organization Dialog */}
          <Dialog
            open={openOrgDialog}
            onClose={() => setOpenOrgDialog(false)}
            PaperProps={{ style: { borderRadius: '16px', backgroundColor: '#ffffff', minWidth: '400px', padding: '24px' } }}
          >
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '20px', color: '#2C2C2C', paddingBottom: '8px' }}>
              Organisation Details
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} mt={1}>
                {[
                  { label: 'Name', value: newOrganization.name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewOrganization(prev => ({ ...prev, name: e.target.value })) },
                  { label: 'Location', value: newOrganization.location, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewOrganization(prev => ({ ...prev, location: e.target.value })) },
                  { label: 'Contact Number', value: newOrganization.contact, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewOrganization(prev => ({ ...prev, contact: e.target.value })) }
                ].map((field, index) => (
                  <TextField
                    key={index}
                    label={field.label}
                    variant="outlined"
                    value={field.value}
                    onChange={field.onChange}
                    fullWidth
                    InputLabelProps={{ sx: { color: '#000000' } }}
                    InputProps={{ sx: { backgroundColor: '#F3F6F8', color: '#000000', borderRadius: '8px' } }} />
                ))}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: '#007BFF',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  paddingY: '10px',
                  fontSize: '16px',
                  '&:hover': { backgroundColor: '#0069d9' },
                }}
                onClick={addOrganization}
              >
                Add Organisation
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add User Dialog */}
          <Dialog
            open={openUserDialog}
            onClose={() => setOpenUserDialog(false)}
            PaperProps={{
              style: {
                borderRadius: '25px',
                boxShadow: '0px 0px 40px 1px #404040',
                border: '0.4px solid #505050',
                backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)',
                minWidth: '600px',
                minHeight: '200px'
              }
            }}
          >
            <DialogTitle>Add New User</DialogTitle>
            <DialogContent>
              {[
                { type: 'email', label: 'Email', value: newUser.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewUser(prev => ({ ...prev, email: e.target.value })) },
                { type: 'password', label: 'Password', value: newUser.password, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewUser(prev => ({ ...prev, password: e.target.value })) },
                { type: 'text', label: 'Username', value: newUser.username, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewUser(prev => ({ ...prev, username: e.target.value })) }
              ].map((field, index) => (
                <TextField
                  key={index}
                  type={field.type}
                  label={field.label}
                  fullWidth
                  margin="normal"
                  value={field.value}
                  onChange={field.onChange} />
              ))}
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                fullWidth
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="Hospital Technician">Hospital Technician</MenuItem>
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
                onClick={addUser}
              >
                Add User
              </Button>
            </DialogContent>
          </Dialog>

          {/* Snackbar */}
          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar}>
            <MuiAlert elevation={6} variant="filled" onClose={closeSnackbar} severity={snackbar.severity}>
              {snackbar.message}
            </MuiAlert>
          </Snackbar>
        </Box></>
      ) : renderAuthPrompt()}
    </Box>
  );
};

