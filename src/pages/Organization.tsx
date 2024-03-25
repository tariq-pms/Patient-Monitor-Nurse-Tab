import React, { useEffect, useState } from 'react';
import { OrganizationCard } from '../components/OrganizationCard';
import { useAuth0 } from '@auth0/auth0-react';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CustomOkButton } from '../components/CustomOkButton';
import { CustomNoButton } from '../components/CustomNoButton';
import pmsLogo from '../assets/phx_logo.png';
import AddIcon from '@mui/icons-material/Add';

interface OrganizationProps {
  darkTheme: boolean; // Define the darkTheme prop
}

export const Organization: React.FC <OrganizationProps> = ({ darkTheme }) => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [openDialog, setOpenDialog] = useState(false);
  const [snack, setSnack] = useState(false);
  const [controlOpacity1, setControlOpacity1] = useState('0.8');
  const [controlBorder, setControlboarder1] = useState('grey');
  const [organizationName, setOrganizationName] = useState('');
  const handleDialogClose = () => {
    setOpenDialog(false);
  };
  const [snackSucc, setSnackSucc] = useState(false);
  useEffect(() => {
    if (isAuthenticated) {
    // Fetch organizations and setOrganizations with the response data
    const fetchData = async () => {
        try {
          const response = await fetch('https://pmsind.co.in:5000/Organization/', {
            
            headers: {
                Authorization: 'Basic ' + btoa('fhiruser:change-password'),
            },
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
      
          const data = await response.json();
          setOrganizations(data.entry || []);
        } catch (error) {
          console.error('Error fetching organizations:', error);
        }
      };
       fetchData();
    }
  }, [isAuthenticated]); // Fetch organizations on component mount
  const handleClose = () => {
    setSnack(false);
  };
  
  // const handleAddOrganization = () => {
  //   // Extract username, password, role, and organizationId from state or form fields
  //   // Add your logic to make the API call for adding a new user
  //   fetch('http://pmsind.co.in:5000/Organization/', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({  }), // Include organizationId in the request
  //   })
  //         .then((response) => {
  //           if (!response.ok) {
  //             throw new Error('Failed to fetch updated user data');
  //           }
  //           return response.json();
  //         })
  // };


  const handleAddOrganization = () => {
    // Extract organizationName from state
    const data = {
      "resourceType": "Organization",
      "name": organizationName
    };
  
    fetch('https://pmsind.co.in:5000/Organization/', {
      credentials: "omit",
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("fhiruser:change-password"),
      },
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to add organization');
      }
      // Fetch the updated list of organizations
      return fetch('https://pmsind.co.in:5000/Organization/', {
        headers: {
          Authorization: 'Basic ' + btoa('fhiruser:change-password'),
        },
      })
      .then((response) => response.json())
      .then((data) => {
        setOrganizations(data.entry || []);
        setSnack(true); // Show success snackbar
        setSnackSucc(true);
      })
      .catch((error) => {
        console.error('Error fetching updated organizations:', error);
        setSnack(true); // Show error snackbar
        setSnackSucc(false);
      });
    })
    .catch((error) => {
      console.error('Error adding organization:', error);
      setSnack(true); // Show error snackbar
      setSnackSucc(false);
    });
    handleDialogClose()
  };
  
  return (
    <div>
      {isAuthenticated && (
        <div>
          <Stack width={'100%'} direction={'row'} paddingTop={'2%'} justifyContent={'center'} textAlign={'center'}>
            <Typography variant="h5" color={ darkTheme ? 'white' : '#124D81'}>Organizations</Typography>
          </Stack>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{display: 'flex',flexWrap: 'wrap',gap: '2rem',mt: {xs: 5,sm: 6,md: 7,lg: 8,},mb: {xs: 3,sm: 4,md: 5,lg: 6,},justifyContent: 'center',width: '95%',}}
            >
              {organizations.map((org) => (
                <OrganizationCard key={org.resource.id} organizationData={org.resource} OrganizationId={''} OrganizationName={''} deviceChange={function (): void {
                  throw new Error('Function not implemented.');
                } } />
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
                        minHeight:"280px",
                        border: `1px solid ${controlBorder}`,
                      }}
                    >
                      <Box sx={{cursor:"pointer"}} width={'100%'} display="flex" flexDirection="row" justifyContent="center" marginTop={'5px'} onClick={() => setOpenDialog(true)}>
                        <CardContent sx={{marginTop:'0px', textAlign: 'center'}} >
                          
                          <AddIcon sx={{ fontSize: 200, color: controlBorder }} />
                          <Typography sx={{ padding: '0px',color: darkTheme ?'white' :'#124D81',marginTop:'0px' }}>Add Organization</Typography>
                        </CardContent>
                      </Box>
                    </Card> 
                  </Paper>
                </Box>
                {/* <Dialog open={openDialog}  onClose={handleDialogClose} PaperProps={{ style: { borderRadius: '25px', boxShadow: `0px 0px 40px 1px #404040`, border: '0.4px solid #505050', backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth: '600px', minHeight: '200px' } }}>
                <DialogTitle>Add New Organization</DialogTitle>
                <DialogContent>
                  <TextField label="Hospital Name"fullWidth margin="normal"/>
                   
                  <Button
                    sx={{
                      textAlign: 'center',
                      margin: '20px 0',
                      display: 'block',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                    variant="contained"
                    onClick={handleAddOrganization}
                  >
                    Add
                  </Button>
                </DialogContent>
              </Dialog> */}
               <Dialog open={openDialog} onClose={handleDialogClose} PaperProps={{ style: { borderRadius: '25px', boxShadow: `0px 0px 40px 1px #404040`, border: '0.4px solid #505050', backgroundImage: 'linear-gradient(to bottom, #111522, #111522, #111522)', minWidth: '600px', minHeight: '200px' } }}>
               <DialogTitle sx={{textAlign:"center", fontWeight:'bold', paddingTop:'9%'}}>
            {"Add New Organization"}
            </DialogTitle>
            <DialogContent>
                <TextField id="standard-basic" label="Hospital Name" variant="standard" value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)} sx={{width:'90%'}} />
            </DialogContent>
            <DialogActions >
     <Stack direction={'row'} width={'100%'} justifyContent={'space-around'} sx={{marginBottom:'7%'}}>
              <Box onClick={() => {setOpenDialog(false)}} ><CustomNoButton text="Cancel"></CustomNoButton></Box>
              
              {/* <Button onClick={() => {setMiniDialog(false)}}>Cancel</Button> */}
              <Box onClick={() => {handleAddOrganization();setOpenDialog(false)}}><CustomOkButton text="Confirm"></CustomOkButton></Box>
              </Stack>   
              </DialogActions>
               </Dialog>
            </Box>
            <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
              <Alert onClose={handleClose} variant="filled" severity={snackSucc ? 'success' : 'error'}>
                {snackSucc && 'Operation Completed Successfully'}
                {!snackSucc && 'Operation Failed'}
              </Alert>
            </Snackbar>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'}>
               <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'} >
          <img src={pmsLogo} alt="Phoenix" style={{
            maxWidth: '20%', // Set the maximum width to 100%
            height: 'auto', // Maintain the aspect ratio
            marginLeft:'auto',
            marginRight:'auto'
          }}/>
          <Typography variant='h3' color={'white'} fontWeight={'50'}>NeoLife Sentinel</Typography> {/*PhoenixCare Sentinel*/ }
          <Typography variant='h6' color={'grey'} fontWeight={'50'}>Remote Device Monitoring System</Typography>
          <Stack direction={'row'} spacing={'30px'} justifyContent={'space-evenly'}>
          <Button variant='outlined'sx={{width:'200px', height:'50px', borderRadius:'100px'}} endIcon={<OpenInNewIcon />} target='_blank' href='https://www.phoenixmedicalsystems.com/'>Product page</Button>
          <Button variant='contained' sx={{width:'200px', height:'50px', borderRadius:'100px'}} onClick={() => loginWithRedirect()}>Sign In</Button>
          
          </Stack>
        </Stack>
        </Stack>
      )}
    </div>
  );
};
