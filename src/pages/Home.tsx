// import { useEffect } from 'react';
// // import AppBar from '@mui/material/AppBar';
// // import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
// // import IconButton from '@mui/material/IconButton';
// import pmsLogo from "../assets/phx_logo.png";
// import OpenInNewIcon from '@mui/icons-material/OpenInNew';
// import { useAuth0 } from '@auth0/auth0-react';
// // import AccountCircle from '@mui/icons-material/AccountCircle';
// // import MenuItem from '@mui/material/MenuItem';
// // import Menu from '@mui/material/Menu';

// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import { Stack } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// export const Home = (_currentRoom: any) => {


//   const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
//   const navigate = useNavigate();

// useEffect(() => {if(isAuthenticated){navigate('/central-monitor')}},[isAuthenticated])

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
//       <Box
//             sx={{
//               // backgroundColor:'red',
//               display: "flex",
//               flexWrap: "wrap",
//               gap: '2rem',
//               mt: {
//                 xs: 5,
//                 sm: 6,
//                 md: 7,
//                 lg: 8,
//               },
//               mb: {
//                 xs: 3,
//                 sm: 4,
//                 md: 5,
//                 lg: 6,  
//               },
//               justifyContent: "center",
//               width:"95%",
//             }}
//           >
//          {!isAuthenticated && !isLoading && (
//               <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'} width={'70%'}>
//                 <img src={pmsLogo} alt="Phoenix" style={{maxWidth: '50%', height: 'auto',marginLeft:'auto',marginRight:'auto'}}/>
      
//                 <Typography variant='h3' color={'#2ba1e0'} fontWeight={'50'}>NeoLife Sentinel</Typography> {/*PhoenixCare Sentinel*/ }
//                 <Typography variant='h6' color={'grey'} fontWeight={'50'}>Remote Device Monitoring System</Typography>
//                 <Stack direction={'row'} spacing={'30px'} justifyContent={'space-evenly'}>
//                 <Button variant='outlined'sx={{width:'200px', height:'50px', borderRadius:'100px'}} endIcon={<OpenInNewIcon />} target='_blank' href='https://www.phoenixmedicalsystems.com/'>Product page</Button>
//                 <Button variant='contained' sx={{width:'200px', height:'50px', borderRadius:'100px'}} onClick={() => loginWithRedirect()}>Sign In</Button>
                
//                 </Stack>
//               </Stack>
//             )}
//       </Box>
//     </div>
//   )
// }


import { useEffect } from 'react';
import Button from '@mui/material/Button';
import pmsLogo from "../assets/phx_logo.png";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Home = (_currentRoom: any) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Directly navigate to /central-monitor
    navigate('/central-monitor-2');
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: '2rem',
          mt: {
            xs: 5,
            sm: 6,
            md: 7,
            lg: 8,
          },
          mb: {
            xs: 3,
            sm: 4,
            md: 5,
            lg: 6,  
          },
          justifyContent: "center",
          width:"95%",
        }}
      >
        <Stack marginTop={'9%'} justifyContent={'center'} textAlign={'center'} spacing={'40px'} width={'70%'}>
          <img src={pmsLogo} alt="Phoenix" style={{maxWidth: '50%', height: 'auto', marginLeft:'auto', marginRight:'auto'}}/>
          <Typography variant='h3' color={'#2ba1e0'} fontWeight={'50'}>NeoLife Sentinel</Typography>
          <Typography variant='h6' color={'grey'} fontWeight={'50'}>Remote Device Monitoring System</Typography>
          <Stack direction={'row'} spacing={'30px'} justifyContent={'space-evenly'}>
            <Button variant='outlined' sx={{width:'200px', height:'50px', borderRadius:'100px'}} endIcon={<OpenInNewIcon />} target='_blank' href='https://www.phoenixmedicalsystems.com/'>Product page</Button>
            <Button variant='contained' sx={{width:'200px', height:'50px', borderRadius:'100px'}}>Sign In</Button>
          </Stack>
        </Stack>
      </Box>
    </div>
  );
};
