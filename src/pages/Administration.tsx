import { Box, Typography, Tabs, Tab, useMediaQuery } from "@mui/material";
import { FC, useState } from "react";
import { useTheme } from "@mui/material/styles";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DevicesIcon from "@mui/icons-material/Devices";
import { DeviceManagement } from "../components/DeviceManagement";
import { UserList } from "../components/UserList";
import { Rooms } from "./Rooms";
import { ReportsPanel } from "../components/patient-summary/ReportsPanel";


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
  openDialog: _openDialog,
  onCloseDialog: _onCloseDialog,
  userOrganization,
  darkTheme,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedIndex(newValue);
  };
  // Auth is enforced at the route level (App.tsx wraps this page with
  // withAuthenticationRequired), so this always renders authenticated.
  return (
    <div>
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
              return <ReportsPanel organizationId={userOrganization} darkTheme={darkTheme} />;
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

