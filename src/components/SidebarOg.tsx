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
  faTasks,
  faHeartPulse,
  faInbox,
  faHeartCircleBolt,
  faTableColumns,
} from "@fortawesome/free-solid-svg-icons";
import { usePermissions } from "../contexts/PermissionContext";

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  fhirModuleName: string;
}

export interface SidebarProps {
  onIconClick: (id: string) => void;
  isSidebarCollapsed: boolean;
  selectedId: string;
  UserRole: string;
}

export const SidebarOg: FC<SidebarProps> = ({
  onIconClick,
  selectedId,
  isSidebarCollapsed,
  UserRole
}) => {
  const { canViewModule, loading, permissions } = usePermissions(); // Added permissions to debug

  useEffect(() => {
    console.log("📦 SidebarOg: checking side bar for user role", UserRole);
    console.log("📦 Available permissions:", permissions); // Debug: see what permissions are loaded
  }, [UserRole, permissions]);

  // CORRECTED MAPPING - Match exact FHIR module names
  const baseMenuItems: MenuItem[] = [
    { id: 'overview', label: "Overview", icon: faTableColumns, fhirModuleName: "Patients Overview" },
    { id: 'medication', label: "Medication", icon: faPrescription, fhirModuleName: "Medications" },
    { id: 'feeds', label: "Feeds&Nutrition", icon: faInbox, fhirModuleName: "Clinical Notes" },
    { id: 'trends', label: "Trends", icon: faHeartPulse, fhirModuleName: "Vitals & Trends" },
    { id: 'diagnostics', label: "Diagnostics", icon: faDroplet, fhirModuleName: "Diagnostics" },
    { id: 'treatment', label: "Treatment", icon: faHeartCircleBolt, fhirModuleName: "Patients Clinical List" }, // Changed to Patients Clinical List
    { id: 'notes', label: "Notes", icon: faFile, fhirModuleName: "Clinical Notes" },
    { id: 'assessments', label: "Assessments", icon: faClipboardCheck, fhirModuleName: "Assessments" }, 
    { id: 'growthchart', label: "Growth Chart", icon: faBaby, fhirModuleName: "Diagnostics" },

  
  ];

  const nicuNurseItems: MenuItem[] = [
    { id: 'alltask', label: "All Tasks", icon: faTasks, fhirModuleName: "Patients Clinical List" },
  ];

  const otherRoleItems: MenuItem[] = [
   
    { id: 'alarms', label: "Monitoring & Alarm", icon: faBell, fhirModuleName: "Vitals & Trends" },
  ];

  // Combine menu items based on user role
  const allMenuItems = [
    ...baseMenuItems,
    ...(UserRole === "NICU Nurse" ? nicuNurseItems : otherRoleItems)
  ];

  // Debug: Log which modules are being checked
  useEffect(() => {
    if (!loading) {
      console.log("🔍 Checking permissions for menu items:");
      allMenuItems.forEach(item => {
        const hasAccess = canViewModule(item.fhirModuleName);
        console.log(`- ${item.fhirModuleName}: ${hasAccess ? '✅ Access' : '❌ No access'}`);
      });
    }
  }, [loading, allMenuItems]);

  // Filter menu items based on user permissions
  const filteredMenuItems = loading 
    ? [] 
    : allMenuItems.filter(item => canViewModule(item.fhirModuleName));

  // Debug: Show what's being filtered
  useEffect(() => {
    if (!loading) {
      console.log("📋 Filtered menu items:", filteredMenuItems.map(item => item.label));
    }
  }, [filteredMenuItems, loading]);

  if (loading) {
    return (
      <Box
        sx={{
          width: isSidebarCollapsed ? 237 : 60,
          backgroundColor: "#FFFFFF",
          height: '100vh',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div>Loading permissions...</div>
      </Box>
    );
  }

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
      {/* Debug info - remove in production */}
      {/* {!loading && (
        <Box sx={{ p: 1, fontSize: '10px', color: 'gray', textAlign: 'center' }}>
          Permissions loaded: {Object.keys(permissions).length} modules
        </Box>
      )} */}

      <List sx={{ width: "100%", padding: 0 }}>
        {filteredMenuItems.length === 0 && !loading ? (
          <ListItem sx={{ justifyContent: "center", color: "#757575", fontStyle: "italic" }}>
            No modules available
          </ListItem>
        ) : (
          filteredMenuItems.map((item) => (
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
          ))
        )}
      </List>
    </Box>
  );
};