import React, { useEffect, useState } from 'react';
import { OrganizationCard } from '../components/OrganizationCard';
import { useAuth0 } from '@auth0/auth0-react';
import { Alert, Box, Button, Snackbar, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import pmsLogo from '../assets/phx_logo.png';


export const Organization: React.FC = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  
  const [snackSucc] = useState(false);
  const [snack, setSnack] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
    // Fetch organizations and setOrganizations with the response data
    const fetchData = async () => {
        try {
          const response = await fetch('http://pmsind.co.in:5000/fhir-server/api/v4/Organization/', {
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
  return (
    <div>
      {isAuthenticated && (
        <div>
          <Stack width={'100%'} direction={'row'} paddingTop={'2%'} justifyContent={'center'} textAlign={'center'}>
            <Typography variant="h5" color={'white'}>
              Organizations
            </Typography>
          </Stack>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{display: 'flex',flexWrap: 'wrap',gap: '2rem',mt: {xs: 5,sm: 6,md: 7,lg: 8,},mb: {xs: 3,sm: 4,md: 5,lg: 6,},justifyContent: 'center',width: '95%',}}
            >
              {organizations.map((org) => (
                <OrganizationCard key={org.resource.id} organizationData={org.resource} OrganizationId={''} OrganizationName={''} deviceChange={function (): void {
                  throw new Error('Function not implemented.');
                } } />
              ))}
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
