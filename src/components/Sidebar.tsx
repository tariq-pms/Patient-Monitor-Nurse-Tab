// components/Sidebar.tsx
import {Drawer,List,ListItem,ListItemIcon,ListItemText,useTheme,Box,} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  SwapHoriz as SwapHorizIcon,
  LocalHospital as LocalHospitalIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 240;
const drawerHeight = 740;

const menuItems = [
  { text: "Overview", icon: <DashboardIcon />, path: "" },
  { text: "Patients", icon: <PeopleIcon />, path: "" },
  { text: "Staffs management", icon: <GroupIcon />, path: "" },
  { text: "Shift Handovers", icon: <SwapHorizIcon />, path: "" },
  { text: "Transfers/Discharge", icon: <LocalHospitalIcon />, path: "" },
  { text: "Device & Bed management", icon: <LocalHospitalIcon />, path: "" },
  { text: "Notifications & Alerts", icon: <NotificationsIcon />, path: "" },
  { text: "Reports & Analytics", icon: <AssessmentIcon />, path: "" },
  { text: "Settings", icon: <SettingsIcon />, path: "" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Drawer
    variant="permanent"
    sx={{
      width: drawerWidth,
      height: `calc(100vh - 64px)`, // Adjust height below header
      top: '64px', // Push it down below the header
      position: 'fixed', // Ensure it stays in place
      [`& .MuiDrawer-paper`]: {
        width: drawerWidth,
        height: `calc(100vh - 64px)`,
        top: '64px',
        position: 'fixed',
        boxSizing: "border-box",
        borderRight: "1px solid #e0e0e0",
      },
    }}
  >
  
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#E3F2FD",
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? theme.palette.primary.main : "inherit",
                  minWidth: 36,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
