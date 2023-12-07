import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Skeleton, Stack, Button, Typography, IconButton, Menu, MenuItem, Divider, Select, Snackbar, Paper, DialogTitle, DialogContentText, TextField } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import {  faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog,  DialogContent,} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';


export const AdminPage = () => {
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [controlOpacity, setControlOpacity] = useState('0.8');
  const [controlBorder, setControlboarder] = useState('grey');
  const [open1, setOpen1] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [openDialog2, setOpenDialog2] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'hospitalTechnician', // default role
  });

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose1 = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialog2Close = () => {
    setOpenDialog2(false);
  };

  const handleAddUser = () => {
    console.log('Adding new user:', newUser);
    // Add your logic to save the new user data (e.g., API request)
    handleDialog2Close();
  };
  return (
    <Box
    display="flex"
    justifyContent="center"
   
    minHeight="100vh"
  >
    {loading ? (
      <Skeleton animation="wave" variant="rectangular" width={"350px"} height={"280px"} sx={{ borderRadius: "25px" }} />
    ) : (
      <Box display="flex" flexDirection="column"alignItems="center" >
       <Stack width={'100%'} direction={'row'} marginBottom={'10%'} paddingTop={'2%'} justifyContent={'center'} textAlign={'center'}>
              <Typography variant='h5' color={'white'}>Admin Settings</Typography>
              {/* <Settings  sx={{marginLeft:'1%', fontSize:'200%', color:'white'}}/> */}
            </Stack>
        <Stack flexDirection="row">
        <Box width={"350px"} minHeight={'300px'} marginRight={"20px"} maxHeight={'300px'} sx={{ opacity: controlOpacity, backgroundColor: 'transparent', borderRadius: '30px' }} onMouseLeave={() => { setControlboarder("grey"); setControlOpacity("0.8") }} onMouseEnter={() => { setControlboarder("#2BA0E0"); setControlOpacity("1") }} >
          <Paper elevation={5} sx={{ borderRadius: "25px", background: 'transparent' }}>
            <Card
              sx={{
                background: "transparent",
                alignItems: "center",
                borderRadius: "25px",
                justifyContent: "center",
                minHeight: "280px",
                border: `1px solid ${controlBorder}`
              }} >
              <Stack width={"100%"} direction={"row"} sx={{ justifyContent: "center", marginTop: "5px" }}>
                <IconButton
                  sx={{ width: '10%', marginLeft: 'auto', marginRight: '3%' }}
                  onClick={handleMenuClick}
                >
                  <SettingsIcon />
                </IconButton>
                <Menu id="demo-positioned-menu" anchorEl={anchorEl} open={open1} onClose={handleClose1} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{style: { backgroundImage: 'linear-gradient(to bottom, #3C4661, #3C4661, #3C4661)',
                      boxShadow: `0px 0px 40px 1px #404040`,
                      border: '0.4px solid #505050',
                      justifyContent: 'center',
                      textAlign: 'center',
                    },
                  }}
                  MenuListProps={{ sx: { py: 0 } }}
                >
                  <Stack divider={<Divider sx={{ backgroundColor: 'white' }} flexItem />}>
                    <Button  sx={{ color: 'white', padding: '5%' }}><Typography variant='caption' textTransform={'capitalize'}>Change User Access</Typography></Button>
                    <Button  sx={{ backgroundColor: '#E48227', color: 'white', paddingTop: '5%', paddingBottom: '5%' }}><Typography variant='caption' textTransform={'capitalize'}>Delete User</Typography></Button>
                  </Stack>
                </Menu>
              </Stack>

              
              <CardContent sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setDialogOpen(true)}>
                  
                  <FontAwesomeIcon style={{ fontSize: 200, color: controlBorder }} icon={faUser} />
                </CardContent>
              <Dialog open={dialogOpen} onClose={handleDialogClose}  PaperProps={{style:{borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth:'400px', minHeight:'200px'}}} >
                <DialogTitle>User Information</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <Typography>User Name: John</Typography>
                    <Typography>User Designation: Clinician</Typography>
                    <Typography>Hospital Name: XYZ Hospital</Typography>
                  </DialogContentText>
                </DialogContent>
              </Dialog>
            </Card>
          </Paper>
        </Box>
        <Box
              width={'350px'}
              minHeight={'300px'}
              maxHeight={'300px'}
              sx={{ opacity: controlOpacity, backgroundColor: 'transparent', borderRadius: '30px' }}
              onMouseLeave={() => {
                setControlboarder('grey');
                setControlOpacity('0.8');
              }}
              onMouseEnter={() => {
                setControlboarder('#2BA0E0');
                setControlOpacity('1');
              }}
            >
              <Paper elevation={5} sx={{ borderRadius: '25px', background: 'transparent' }}>
                <Card
                  sx={{
                    background: 'transparent',
                    borderRadius: '25px',
                    minHeight: '280px',
                    border: `1px solid ${controlBorder}`,
                  }}
                >
                  <Stack width={'100%'} direction={'row'} sx={{ justifyContent: 'center', marginTop: '20px' }}>
                    <CardContent onClick={() => setOpenDialog2(true)}>
                      <Typography sx={{ paddingLeft: '45px' }}>Add new User</Typography>
                      <AddIcon sx={{ fontSize: 200, color: controlBorder }} />
                    </CardContent>
                  </Stack>
                </Card>
              </Paper>

              <Dialog open={openDialog2} onClose={handleDialog2Close} PaperProps={{style:{borderRadius:'25px', boxShadow: `0px 0px 40px 1px #404040`, border:'0.4px solid #505050', backgroundImage:'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth:'600px', minHeight:'200px'}}}>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                  <TextField label="Username" fullWidth margin="normal"  />
                  <TextField type="password" label="Password" fullWidth margin="normal" />
                  <Select  fullWidth  margin='20px' >
                    <MenuItem value="hospitalTechnician">Hospital Technician</MenuItem>
                    <MenuItem value="hospitalClinician">Hospital Clinician</MenuItem>
                  </Select>
                  <Button
                    sx={{
                      textAlign: 'center',
                      margin: '20px 0', // Adjust the margin as needed
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


        </Stack>
        
      </Box>
    )}
  </Box>
  );
};
