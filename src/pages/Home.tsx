import { useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import pmsLogo from "../assets/phx_logo.png";

export const Home = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/patient-monitor');
    }
  }, [isAuthenticated]);
console.log({
  Button,
  Stack,
  Typography,
  OpenInNewIcon
});
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: '2rem',
          mt: { xs: 5, sm: 6, md: 7, lg: 8 },
          mb: { xs: 3, sm: 4, md: 5, lg: 6 },
          justifyContent: "center",
          width: "95%",
        }}
      >
        {!isAuthenticated && !isLoading && (
          <Stack mt="9%" textAlign="center" spacing="40px" width="70%">
            <img
              src={pmsLogo}
              alt="Phoenix"
              style={{ maxWidth: '50%', margin: 'auto' }}
            />

            <Typography variant="h3" color="#2ba1e0">
              NeoLife Sentinel
            </Typography>

            <Typography variant="h6" color="grey">
              Remote Patient Management System
            </Typography>

            <Stack direction="row" spacing="30px" justifyContent="space-evenly">
              <Button
                variant="outlined"
                sx={{ width: '200px', height: '50px', borderRadius: '100px' }}
                endIcon={<OpenInNewIcon />}
                target="_blank"
                href="https://www.phoenixmedicalsystems.com/"
              >
                Product page
              </Button>

              <Button
                variant="contained"
                sx={{ width: '200px', height: '50px', borderRadius: '100px' }}
                onClick={() => loginWithRedirect()}
              >
                Sign In
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </div>
  );
};