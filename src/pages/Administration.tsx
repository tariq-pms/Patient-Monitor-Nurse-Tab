import { Box, Typography, Tabs, Tab, useMediaQuery, Stack, Button } from "@mui/material";
import { FC, useState } from "react";
import { useTheme } from "@mui/material/styles";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DevicesIcon from "@mui/icons-material/Devices";
import { useAuth0 } from '@auth0/auth0-react';
import pmsLogo from '../assets/phx_logo.png';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { DeviceManagement } from "../components/DeviceManagement";
import { Patient } from "../components/Patient";
import { UserList } from "../components/UserList";
import { Rooms } from "./Rooms";


interface AdministrationPageProps {
  openDialog: boolean;
  onCloseDialog: () => void;
  isSidebarCollapsed: boolean;
  userOrganization: string;
  darkTheme: boolean;
}

const tabConfig = [
  { label: "Patients", icon: <PeopleIcon /> },
  { label: "Rooms & Beds", icon: <HotelIcon /> },
  { label: "Users", icon: <ManageAccountsIcon /> },
  { label: "Devices", icon: <DevicesIcon /> },

];

export const Administration: FC<AdministrationPageProps> = ({
  openDialog,
  onCloseDialog,
  userOrganization,
}) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedIndex(newValue);
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
  return (
    
    <div>
{isAuthenticated ? (
  <Box >
       <Box sx={{  borderColor: "divider",border:'0.1px solid #DEE2E6'}}>
      <Tabs
  value={selectedIndex}
  onChange={handleTabChange}
  textColor="secondary"
  indicatorColor="primary"
  variant="fullWidth"
  scrollButtons
  allowScrollButtonsMobile
>
  {tabConfig.map((tab, index) => (
    <Tab
      key={index}
      icon={
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            width: "100%",
          }}
        >
          {tab.icon}
          {!isMobile && <Typography variant="body2">{tab.label}</Typography>}
        </Box>
      }
      sx={{
        textTransform: "none",
        fontWeight: "bold",
        minWidth: isMobile ? 58 : 120,
        color: "black",
        padding: isMobile ? 1 : 2,
      }}
    />
  ))}
</Tabs>

      </Box>

      {/* Tab Content */}
      <Box sx={{ p: 0 }}>
        {(() => {
          switch (selectedIndex) {
            case 0:
              return (
                <Patient
                  userOrganization={userOrganization}
                  openDialog={openDialog}
                  onCloseDialog={onCloseDialog} darkTheme={false}                />
              );
            case 1:
              return <DeviceManagement userOrganization={userOrganization} darkTheme={false} />;
            case 2:
              return <UserList userOrganization={userOrganization} darkTheme={false} />;
            case 3:
              return <Rooms userOrganization={userOrganization} darkTheme={false}  />;
           
            default:
              return (
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <Typography variant="h5">🚧 Page Under Construction</Typography>
                  <Typography variant="body2">We're working to bring this page to life.</Typography>
                </Box>
              );
          }
        })()}
      </Box>
   
  </Box>
) : renderAuthPrompt()}
{/* 
<Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
  <MuiAlert
    elevation={6}
    variant="filled"
    onClose={handleSnackbarClose}
    severity={snackbarSeverity as AlertProps['severity']}
  >
    {snackbarMessage}
  </MuiAlert>
</Snackbar> */}
</div>
  );
};

