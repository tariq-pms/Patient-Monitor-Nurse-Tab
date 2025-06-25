import { FC, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPrescription,
  faFile,
  faBell,
  faClipboardCheck,
  faDroplet,
  faBaby,
  faHeartCircleCheck,
  faTasks,
  faHeartPulse,
  faInbox,
  faHeartCircleBolt,
  faTableColumns,
} from "@fortawesome/free-solid-svg-icons";

interface MenuItem {
  id: string;
  label: string;
  icon: any;
}

export interface SidebarProps {
  onIconClick: (id: string) => void;  // Changed to accept string ID
  isSidebarCollapsed: boolean;
  selectedId: string;  // Now using only ID for selection
  UserRole: string;
}

export const SidebarOg: FC<SidebarProps> = ({
  onIconClick,
  selectedId,
  isSidebarCollapsed,
  UserRole
}) => {
  useEffect(() => {
    console.log("📦 SidebarOg: checking side bar for user role", UserRole);
  }, [UserRole]);

  // Base menu items for all roles
  const baseMenuItems: MenuItem[] = [
    { id: 'overview', label: "Overview", icon: faTableColumns },
    { id: 'medication', label: "Medication", icon: faPrescription },
    { id: 'feeds', label: "Feeds&Nutrition", icon: faInbox },
    { id: 'trends', label: "Trends", icon: faHeartPulse },
    { id: 'diagnostics', label: "Diagnostics", icon: faDroplet },
    { id: 'treatment', label: "Treatment", icon: faHeartCircleBolt },
    { id: 'notes', label: "Notes", icon: faFile },
    { id: 'assessments', label: "Assessments", icon: faClipboardCheck },   
  ];

  // Additional items for NICU Nurse
  const nicuNurseItems: MenuItem[] = [
    { id: 'alltask', label: "All Tasks", icon: faTasks },
  ];

  // Additional items for other roles
  const otherRoleItems: MenuItem[] = [
    { id: 'babyprofile', label: "Baby Profile", icon: faBaby },
    { id: 'alarms', label: "Monitoring & Alarm", icon: faBell },
  ];

  // Combine menu items based on user role
  const menuItems = [
    ...baseMenuItems,
    ...(UserRole === "NICU Nurse" ? nicuNurseItems : otherRoleItems)
  ];

  return (
    <Box
      sx={{
        width: isSidebarCollapsed ? 237 : 60,
        backgroundColor: "#FFFFFF",
        display: "flex",
        height: '100vh',
        flexDirection: "column",
        alignItems: "center",
        borderRadius: '10px',
    
        transition: "width 0.3s",
      }}
    >
      <List sx={{ width: "100%", padding: 0 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.id}
            sx={{
              display: "flex",
              alignItems: "center",
              height: 40,
              fontSize: '1.3rem',
              paddingX: 1,
              backgroundColor: selectedId === item.id ? "#CCE6FF" : "transparent",
              marginBottom: 2,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#E6F2FF" },
            }}
            onClick={() => onIconClick(item.id)}
          >
            <ListItemIcon
              sx={{
                color: selectedId === item.id ? "#124D81" : "#757575",
                minWidth: 36,
                justifyContent: "center",
              }}
            >
              <FontAwesomeIcon icon={item.icon} style={{ fontSize: "100%" }} />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                color: selectedId === item.id ? "#124D81" : "#757575",
                fontWeight: selectedId === item.id ? "bold" : "normal",
                marginLeft: 2,
                opacity: isSidebarCollapsed ? 1 : 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                transition: "opacity 0.3s ease",
                width: isSidebarCollapsed ? "auto" : 0,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};